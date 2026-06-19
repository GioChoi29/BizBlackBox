import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAdmin, safeObjectId } from "@/lib/auth";

export async function PATCH(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const _id = safeObjectId(id);
  if (!_id) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const body = await req.json();
  const db = await getDb();

  if (body.togglePin) {
    // Atomic flip — aggregation pipeline update lets us reference the existing
    // `pinned` value within a single round-trip, avoiding the read-modify-write
    // race where two admins could collide.
    const result = await db.collection("announcements").updateOne(
      { _id },
      [{ $set: { pinned: { $not: ["$pinned"] } } }]
    );
    if (result.matchedCount === 0) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  const update = {};
  if (typeof body.title === "string") update.title = body.title.trim();
  if (typeof body.body === "string") update.body = body.body.trim();
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }
  const result = await db.collection("announcements").updateOne({ _id }, { $set: update });
  if (result.matchedCount === 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const _id = safeObjectId(id);
  if (!_id) return NextResponse.json({ error: "invalid id" }, { status: 400 });
  const db = await getDb();
  const result = await db.collection("announcements").deleteOne({ _id });
  if (result.deletedCount === 0) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
