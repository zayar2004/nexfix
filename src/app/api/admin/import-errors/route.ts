import { NextResponse } from "next/server";
import { db } from "@/db";
import { machines, errorCodes, errorContent, media, mediaVideos, notifications } from "@/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
import * as XLSX from "xlsx";

type ImportRow = {
  machineName: string;
  errorCode: string;
  errorName: string;
  errorFix: string;
  imageUrl: string;
  youtubeUrl: string;
  status: "new" | "update" | "duplicate" | "invalid";
  error?: string;
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !["staff", "senior_admin", "super_admin"].includes(session.user.role)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const dryRun = formData.get("dryRun") === "true";
    if (!file) return NextResponse.json({ ok: false, error: "No file" }, { status: 400 });

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ ok: false, error: "File too large (max 10MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

    if (rows.length === 0) {
      return NextResponse.json({ ok: false, error: "Empty file" }, { status: 400 });
    }

    if (rows.length > 1000) {
      return NextResponse.json({ ok: false, error: "Too many rows (max 1000)" }, { status: 400 });
    }

    const firstRow = rows[0];
    const keys = Object.keys(firstRow);
    
    // Column Mapping
    const machineKey = keys.find(k => k.toLowerCase().includes("machine"));
    const codeKey = keys.find(k => k.toLowerCase().includes("code") && !k.toLowerCase().includes("machine"));
    const nameKey = keys.find(k => k.toLowerCase().includes("name") || k.toLowerCase().includes("title"));
    const fixKey = keys.find(k => k.toLowerCase().includes("fix") || k.toLowerCase().includes("solution"));
    const imageKey = keys.find(k => k.toLowerCase().includes("image") || k.toLowerCase().includes("photo"));
    const videoKey = keys.find(k => k.toLowerCase().includes("youtube") || k.toLowerCase().includes("video"));

    if (!machineKey || !codeKey) {
      return NextResponse.json({
        ok: false,
        error: `Missing required columns. Found: ${keys.join(", ")}. Need: Machine Name, Error Code, Error Name.`,
      }, { status: 400 });
    }

    const results: ImportRow[] = [];
    for (const row of rows) {
      const machineName = String(row[machineKey] || "").trim();
      const errorCode = String(row[codeKey] || "").trim();
      const errorName = nameKey ? String(row[nameKey] || "").trim() : errorCode; // Fallback to code if no name
      const errorFix = fixKey ? String(row[fixKey] || "").trim() : "";
      const imageUrl = imageKey ? String(row[imageKey] || "").trim() : "";
      const youtubeUrl = videoKey ? String(row[videoKey] || "").trim() : "";

      if (!machineName || !errorCode) {
        results.push({ machineName, errorCode, errorName, errorFix, imageUrl, youtubeUrl, status: "invalid", error: "Missing required fields" });
        continue;
      }

      const isDuplicateInFile = results.some(r => r.machineName === machineName && r.errorCode === errorCode && r.status !== "invalid");
      if (isDuplicateInFile) {
        results.push({ machineName, errorCode, errorName, errorFix, imageUrl, youtubeUrl, status: "duplicate", error: "Duplicate in file" });
        continue;
      }

      results.push({ machineName, errorCode, errorName, errorFix, imageUrl, youtubeUrl, status: "new" });
    }

    if (dryRun) {
      return NextResponse.json({ ok: true, preview: results, total: results.length });
    }

    let inserted = 0;
    let skipped = 0;
    let failed = 0;

    await db.transaction(async (tx) => {
      for (const row of results) {
        if (row.status !== "new") { skipped++; continue; }
        try {
          // 1. Find or create machine
          let [machine] = await tx.select().from(machines).where(eq(machines.name, row.machineName)).limit(1);
          if (!machine) {
            const machineCode = row.machineName.toUpperCase().replace(/[^A-Z0-9]/g, "-").substring(0, 50);
            [machine] = await tx.insert(machines).values({
              name: row.machineName,
              code: machineCode,
              status: "published",
            }).returning();
          }

          // 2. Check existing error
          const [existing] = await tx.select().from(errorCodes)
            .where(and(eq(errorCodes.machineId, machine.id), eq(errorCodes.code, row.errorCode)))
            .limit(1);

          if (existing) { skipped++; continue; }

          // 3. Insert error code (with title from Error Name column)
          const [newError] = await tx.insert(errorCodes).values({
            machineId: machine.id,
            code: row.errorCode,
            title: row.errorName || row.errorCode,
            status: "published",
          }).returning();

          // 4. Insert error content
          await tx.insert(errorContent).values({
            errorCodeId: newError.id,
            locale: "en",
            solution: row.errorFix || null,
          });

          // 5. Insert Image if provided
          if (row.imageUrl) {
            await tx.insert(media).values({
              ownerType: "error",
              ownerId: newError.id,
              mime: "image/jpeg",
              size: "0",
              storageKey: row.imageUrl,
              status: "approved",
            });
          }

          // 6. Insert Video if provided
          if (row.youtubeUrl) {
            await tx.insert(mediaVideos).values({
              ownerType: "error",
              ownerId: newError.id,
              youtubeUrl: row.youtubeUrl,
              title: "Imported Video",
              displayOrder: "0",
            });
          }

          // 7. Notification
          await tx.insert(notifications).values({
            userId: null,
            type: "error_new",
            title: "New Error Code Added",
            message: `${row.errorCode} - ${row.errorName} (${row.machineName}) ကို အသစ်ထည့်သွင်းပြီးပါပြီ။`,
            link: `/error/${newError.id}`,
          });

          inserted++;
        } catch (e) {
          console.error("Row insert error:", e);
          failed++;
        }
      }
    });

    return NextResponse.json({
      ok: true,
      summary: { total: results.length, inserted, skipped, failed },
    });
  } catch (err) {
    console.error("Import error:", err);
    return NextResponse.json({ ok: false, error: "Import failed" }, { status: 500 });
  }
}
