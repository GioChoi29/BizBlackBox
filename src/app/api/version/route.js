import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireActiveUser } from "@/lib/auth";

// Freshness endpoint: per-collection change counters (see lib/version.js).
// Cheap enough to poll every couple of seconds — one small indexed read.
export async function GET() {
  const { error } = await requireActiveUser();
  if (error) return error;
  const db = await getDb();
  const doc = await db.collection("meta").findOne({ _id: "versions" });
  const { _id, ...versions } = doc || {};
  return NextResponse.json(versions);
}
