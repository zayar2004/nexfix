import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { notes } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [note] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, session.user.id)))
    .limit(1);

  if (!note) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const history: any[] = [];
  
  // Created
  history.push({ 
    id: "created", 
    action: "created", 
    createdAt: note.createdAt 
  });
  
  // Updated (created နဲ့ မတူရင်)
  if (note.updatedAt && note.updatedAt.getTime() - note.createdAt.getTime() > 1000) {
    history.push({ 
      id: "updated", 
      action: "updated", 
      createdAt: note.updatedAt 
    });
  }
  
  // Completed
  if (note.completedAt) {
    history.push({ 
      id: "completed", 
      action: "completed", 
      createdAt: note.completedAt 
    });
  }
  
  // Paused
  if (note.reminderStatus === "paused") {
    history.push({ 
      id: "paused", 
      action: "paused", 
      createdAt: note.updatedAt 
    });
  }

  // နောက်ဆုံးကို အပေါ်မှာ ပြမယ်
  history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({ ok: true, data: history });
}
