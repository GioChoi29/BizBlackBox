import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { bumpVersion } from "@/lib/version";

// Admin-only team edits. Team _id is a small integer (1..N), not an ObjectId.
// Only whitelisted fields are writable — the work room is the single source of
// truth read by the Teams page, the Students tab, and each student's My Room.
const ALLOWED_FIELDS = ["workRoom"];

export async function PATCH(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const teamId = parseInt(id);
  if (!Number.isInteger(teamId)) {
    return NextResponse.json({ error: "invalid team id" }, { status: 400 });
  }

  const body = await req.json();
  const update = {};
  for (const k of ALLOWED_FIELDS) {
    if (k in body) update[k] = body[k] === "" ? null : body[k];
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "no valid fields to update" }, { status: 400 });
  }

  const db = await getDb();
  const result = await db.collection("teams").updateOne({ _id: teamId }, { $set: update });
  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "team not found" }, { status: 404 });
  }
  await bumpVersion("teams");
  return NextResponse.json({ ok: true });
}
