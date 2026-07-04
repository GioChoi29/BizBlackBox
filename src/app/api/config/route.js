import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireActiveUser, requireAdmin } from "@/lib/auth";
import { bumpVersion } from "@/lib/version";

// Event-wide settings singleton (e.g. the submission deadline), same pattern
// as the transport doc. Read by everyone, written by admins.
export async function GET() {
  const { error } = await requireActiveUser();
  if (error) return error;
  const db = await getDb();
  const doc = await db.collection("config").findOne({ _id: "config" });
  return NextResponse.json(doc || null);
}

export async function PUT(req) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await req.json();
  delete body._id;
  delete body.id;
  const db = await getDb();
  await db.collection("config").updateOne(
    { _id: "config" },
    { $set: body },
    { upsert: true }
  );
  await bumpVersion("config");
  return NextResponse.json({ ok: true });
}
