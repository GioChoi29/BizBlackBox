import { NextResponse } from "next/server";
import { getDb } from "./mongodb";
import {
  requireActiveUser,
  requireAdmin,
  safeObjectId,
} from "./auth";

function withId(doc) {
  return { ...doc, id: doc._id?.toString?.() ?? doc._id };
}

// adminOnly === true requires admin; otherwise any active (logged-in,
// non-temp-password) user is allowed.
async function gate(adminOnly) {
  const r = adminOnly ? await requireAdmin() : await requireActiveUser();
  if (r.error) return r.error;
  return null;
}

// opts:
//   adminOnly       — both reads and writes require admin
//   adminOnlyWrite  — reads open to all active users, writes require admin
//   (default)       — both open to active users
export function listAndCreate(collectionName, sort = {}, opts = {}) {
  const readAdmin = !!opts.adminOnly;
  const writeAdmin = !!(opts.adminOnly || opts.adminOnlyWrite);
  return {
    GET: async () => {
      const err = await gate(readAdmin);
      if (err) return err;
      const db = await getDb();
      const items = await db.collection(collectionName).find({}).sort(sort).toArray();
      return NextResponse.json(items.map(withId));
    },
    POST: async (req) => {
      const err = await gate(writeAdmin);
      if (err) return err;
      const body = await req.json();
      delete body.id;
      delete body._id;
      const db = await getDb();
      const result = await db.collection(collectionName).insertOne(body);
      return NextResponse.json(withId({ ...body, _id: result.insertedId }));
    },
  };
}

export function updateAndDelete(collectionName, opts = {}) {
  const writeAdmin = !!(opts.adminOnly || opts.adminOnlyWrite);
  return {
    PATCH: async (req, { params }) => {
      const err = await gate(writeAdmin);
      if (err) return err;
      const { id } = await params;
      const _id = safeObjectId(id);
      if (!_id) return NextResponse.json({ error: "invalid id" }, { status: 400 });
      const body = await req.json();
      delete body.id;
      delete body._id;
      const db = await getDb();
      const result = await db.collection(collectionName).updateOne(
        { _id },
        { $set: body }
      );
      if (result.matchedCount === 0) {
        return NextResponse.json({ error: "not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true });
    },
    DELETE: async (_req, { params }) => {
      const err = await gate(writeAdmin);
      if (err) return err;
      const { id } = await params;
      const _id = safeObjectId(id);
      if (!_id) return NextResponse.json({ error: "invalid id" }, { status: 400 });
      const db = await getDb();
      const result = await db.collection(collectionName).deleteOne({ _id });
      if (result.deletedCount === 0) {
        return NextResponse.json({ error: "not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true });
    },
  };
}
