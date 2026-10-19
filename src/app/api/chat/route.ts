import { NextResponse } from "next/server";
import { db } from "@/db";
import { chatMessages, users } from "@/db/schema";
import { auth } from "@/auth";
import { eq, desc, gt } from "drizzle-orm";
import { z } from "zod";

const messageSchema = z.object({
  content: z.string().min(1).max(500),
});

async function getMessages(after?: string) {
  if (after) {
    return await db
      .select({
        id: chatMessages.id,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
        userId: chatMessages.userId,
        userName: users.displayName,
        userEmail: users.email,
      })
      .from(chatMessages)
      .leftJoin(users, eq(chatMessages.userId, users.id))
      .where(gt(chatMessages.createdAt, new Date(after)))
      .orderBy(chatMessages.createdAt);
  }

  const messages = await db
    .select({
      id: chatMessages.id,
      content: chatMessages.content,
      createdAt: chatMessages.createdAt,
      userId: chatMessages.userId,
      userName: users.displayName,
      userEmail: users.email,
    })
    .from(chatMessages)
    .leftJoin(users, eq(chatMessages.userId, users.id))
    .orderBy(desc(chatMessages.createdAt))
    .limit(50);

  return messages.reverse();
}

// GET: Support both normal and SSE mode
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const stream = searchParams.get("stream");
  const after = searchParams.get("after") || undefined;

  // 🌟 SSE Mode
  if (stream === "true") {
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        let lastId = after || null;
        // 🌟 isActive State ကို အသုံးပြုမယ် (Controller ပိတ်သွားရင် ရပ်ဖို့)
        let isActive = true;
        let intervalId: NodeJS.Timeout | null = null;
        let timeoutId: NodeJS.Timeout | null = null;

        // 🌟 Safe enqueue (Controller ပိတ်သွားရင် Error မတက်အောင် ကာကွယ်မယ်)
        const safeEnqueue = (data: string) => {
          if (!isActive) return false;
          try {
            controller.enqueue(encoder.encode(data));
            return true;
          } catch {
            isActive = false;
            return false;
          }
        };

        // Client က ဖြတ်သွားရင် ရပ်မယ်
        req.signal.addEventListener("abort", () => {
          isActive = false;
          if (intervalId) clearInterval(intervalId);
          if (timeoutId) clearTimeout(timeoutId);
        });

        // တစ်ခါ ချက်ချင်း ပို့မယ်
        try {
          const messages = await getMessages(lastId || undefined);
          if (messages.length > 0) {
            lastId = String(messages[messages.length - 1].createdAt);
          }
          safeEnqueue(`data: ${JSON.stringify({ type: "init", messages })}\n\n`);
        } catch (err) {
          safeEnqueue(`data: ${JSON.stringify({ type: "error" })}\n\n`);
        }

        // ပြီးရင် ၁ စက္ကန့်တစ်ခါ စာသစ် ရှိမရှိ စစ်မယ်
        intervalId = setInterval(async () => {
          if (!isActive) {
            if (intervalId) clearInterval(intervalId);
            return;
          }

          try {
            const newMessages = await getMessages(lastId || undefined);
            if (newMessages.length > 0) {
              lastId = String(newMessages[newMessages.length - 1].createdAt);
              safeEnqueue(`data: ${JSON.stringify({ type: "new", messages: newMessages })}\n\n`);
            }
          } catch {
            // ignore
          }
        }, 1000);

        // Timeout (၅ မိနစ်) ဆိုရင် ပိတ်မယ်
        timeoutId = setTimeout(() => {
          isActive = false;
          if (intervalId) clearInterval(intervalId);
          try {
            controller.close();
          } catch {
            // Already closed
          }
        }, 5 * 60 * 1000);
      },
      cancel() {
        // Client က ဖြတ်သွားရင် ပိတ်မယ်
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  }

  // Normal Mode (Fallback)
  try {
    const messages = await getMessages(after || undefined);
    return NextResponse.json({ ok: true, data: messages });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to load" }, { status: 500 });
  }
}

// POST: Send new message
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Login required" }, { status: 401 });
    }

    const body = await req.json();
    const result = messageSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ ok: false, error: "Invalid message" }, { status: 400 });
    }

    const [newMessage] = await db
      .insert(chatMessages)
      .values({
        userId: session.user.id,
        content: result.data.content,
      })
      .returning();

    return NextResponse.json({ ok: true, data: newMessage });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to send" }, { status: 500 });
  }
}
