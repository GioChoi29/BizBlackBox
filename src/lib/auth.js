import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getDb } from "./mongodb";

export const SESSION_COOKIE = "bbb_session";
const SESSION_DAYS = 7;

// Skip visually-confusing chars (0/O, 1/l/I, etc).
const PWD_CHARSET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const ROLES = ["student", "junior_mentor", "senior_mentor", "admin"];

// Try to construct an ObjectId without throwing. Returns null on invalid input
// so route handlers can respond 404 instead of bubbling a 500.
export function safeObjectId(value) {
  try {
    return new ObjectId(value);
  } catch {
    return null;
  }
}

// Canonical username form — lowercase + trimmed. All login lookups and writes
// must funnel through this so JM.Alpha / jm.alpha collapse to one identity.
export function canonicalUsername(raw) {
  return String(raw || "").trim().toLowerCase();
}

export function generatePassword(len = 12) {
  const bytes = crypto.randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) out += PWD_CHARSET[bytes[i] % PWD_CHARSET.length];
  return `${out.slice(0, 4)}-${out.slice(4, 8)}-${out.slice(8, 12)}`;
}

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain, hash) {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

export async function createSession(userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const db = await getDb();
  // Persist userId as a string so getCurrentUser doesn't have to cast back and
  // forth (and so a corrupt row can't throw inside ObjectId).
  await db.collection("sessions").insertOne({
    token,
    userId: String(userId),
    createdAt: now,
    expiresAt,
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return token;
}

export async function deleteCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = await getDb();
    await db.collection("sessions").deleteOne({ token });
  }
  cookieStore.delete(SESSION_COOKIE);
}

// Invalidate every session for a given user — used on password change/reset.
export async function deleteSessionsForUser(userId) {
  const db = await getDb();
  await db.collection("sessions").deleteMany({ userId: String(userId) });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = await getDb();
  const session = await db.collection("sessions").findOne({ token });
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) {
    // Clean up the expired row so we don't accumulate cruft. Fire-and-forget.
    db.collection("sessions").deleteOne({ token }).catch(() => {});
    return null;
  }
  const userOid = safeObjectId(session.userId);
  if (!userOid) return null;
  return db.collection("users").findOne({ _id: userOid });
}

// Base helper — only checks that a session exists. Allows users mid-flight on
// the first-time-password-change flow to still call /api/auth/* endpoints.
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  return { user };
}

// Default helper for any route that should reject users until they've changed
// their temporary password. Use this everywhere except /api/auth/me,
// /api/auth/logout, /api/auth/change-password.
export async function requireActiveUser() {
  const r = await requireUser();
  if (r.error) return r;
  if (r.user.mustChangePassword) {
    return {
      error: NextResponse.json(
        { error: "must change password before continuing" },
        { status: 403 }
      ),
    };
  }
  return r;
}

export async function requireAdmin() {
  const r = await requireActiveUser();
  if (r.error) return r;
  if (r.user.role !== "admin") {
    return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }
  return r;
}

// True if user is admin OR senior mentor (event-staff with broad permissions).
export function isStaff(user) {
  return user?.role === "admin" || user?.role === "senior_mentor";
}

export function publicUser(u) {
  if (!u) return null;
  return {
    id: u._id?.toString?.() ?? u._id,
    name: u.name,
    username: u.username || null,
    email: u.email || null,
    role: u.role,
    team: u.teamId ?? null,
    room: u.room ?? null,
    floor: u.floor ?? null,
    mustChangePassword: !!u.mustChangePassword,
  };
}
