import { NextResponse } from "next/server";
import { db } from "@/db";
import { presence } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: true, message: "Guest - not tracked" });
    }

    // ၁။ Update လုပ်ကြည့်မယ်
    const updated = await db
      .update(presence)
      .set({ lastHeartbeat: new Date() })
      .where(eq(presence.userId, session.user.id))
      .returning({ id: presence.id });

    // ၂။ Update မဖြစ်ဘူးဆိုရင် Insert လုပ်မယ်
    if (updated.length === 0) {
      await db.insert(presence).values({ userId: session.user.id }).onConflictDoNothing();
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    // 🚨 ဒီနေရာမှာ Error ကို ဖမ်းပြီး 200 ပြန်ပေးလိုက်မယ် (Browser ကို မပြစ်တော့ဘူး)
    // ဒါကြောင့် ဖုန်းက ၄၀ စက္ကန့်ကြာ စောင့်နေတာမျိုး မဖြစ်တော့ဘူး
    console.error("Heartbeat ignored error:", error);
    return NextResponse.json({ ok: true, message: "Silently ignored" });
  }
}
