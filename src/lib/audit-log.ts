import { db } from "@/db";
import { adminAuditLogs } from "@/db/schema";

export async function logAdminAction({
  actorId,
  action,
  entityType,
  entityId,
  details,
}: {
  actorId: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  details?: string;
}) {
  try {
    await db.insert(adminAuditLogs).values({
      actorId,
      action,
      entityType,
      entityId: entityId || null,
      details: details || null,
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
