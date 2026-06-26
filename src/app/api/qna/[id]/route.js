import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAdmin, safeObjectId } from "@/lib/auth";

// Admin-only: delete an entire question and its conversation thread.
export async function DELETE(_req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const oid = safeObjectId(id);
  if (!oid) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  const db = await getDb();
  const result = await db.collection("qna").deleteOne({ _id: oid });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
