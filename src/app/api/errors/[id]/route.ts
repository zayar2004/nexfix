import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { errorCodes, errorContent, machines } from "@/db/schema";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [result] = await db
      .select({
        id: errorCodes.id,
        code: errorCodes.code,
        title: errorCodes.title,
        machineId: errorCodes.machineId,
        machineName: machines.name,
        machineCode: machines.code,
      })
      .from(errorCodes)
      .innerJoin(machines, eq(machines.id, errorCodes.machineId))
      .where(eq(errorCodes.id, id))
      .limit(1);

    if (!result) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    const contents = await db
      .select()
      .from(errorContent)
      .where(eq(errorContent.errorCodeId, id));

    return NextResponse.json({ ok: true, error: result, content: contents });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
