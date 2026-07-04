import { getDb } from "./mongodb";

// Per-collection change counters, stored in one tiny doc (meta/versions).
// Every write route bumps the counter(s) for what it touched; clients poll
// GET /api/version and refetch only the collections whose counter moved.
// Best-effort — a failed bump must never fail the write that triggered it.
export async function bumpVersion(...names) {
  try {
    const db = await getDb();
    const inc = {};
    for (const n of names) inc[n] = 1;
    await db.collection("meta").updateOne(
      { _id: "versions" },
      { $inc: inc },
      { upsert: true }
    );
  } catch {}
}
