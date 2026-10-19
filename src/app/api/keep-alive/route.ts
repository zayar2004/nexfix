import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 🌟 Database ကို နှိုးမယ်
    await db.execute(sql`SELECT 1`);
    return NextResponse.json({ 
      ok: true, 
      message: "Database is awake",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ 
      ok: false, 
      error: "Database wake failed" 
    }, { status: 500 });
  }
}
