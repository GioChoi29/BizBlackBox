import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import {
  verifyPassword,
  createSession,
  publicUser,
  canonicalUsername,
} from "@/lib/auth";

export async function POST(req) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: "username and password required" }, { status: 400 });
  }

  const db = await getDb();
  const user = await db.collection("users").findOne({ username: canonicalUsername(username) });
  if (!user) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  await createSession(user._id);
  return NextResponse.json(publicUser(user));
}
