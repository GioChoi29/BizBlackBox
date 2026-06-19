import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import {
  requireAdmin,
  hashPassword,
  generatePassword,
  canonicalUsername,
  ROLES,
} from "@/lib/auth";
import { sendCredentialsEmail } from "@/lib/email";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const db = await getDb();
  const items = await db.collection("users").find({}).sort({ role: 1, name: 1 }).toArray();
  // Never leak password hashes.
  return NextResponse.json(items.map((x) => ({
    id: x._id.toString(),
    name: x.name,
    username: x.username || null,
    email: x.email || null,
    role: x.role,
    teamId: x.teamId ?? null,
    mustChangePassword: !!x.mustChangePassword,
  })));
}

export async function POST(req) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const { name, username, email, role, teamId } = body;
  if (!name || !username || !role) {
    return NextResponse.json({ error: "name, username, and role required" }, { status: 400 });
  }
  if (!ROLES.includes(role)) {
    return NextResponse.json({ error: "invalid role" }, { status: 400 });
  }
  const normalizedUsername = canonicalUsername(username);
  if (!normalizedUsername) {
    return NextResponse.json({ error: "username cannot be blank" }, { status: 400 });
  }

  const parsedTeamId =
    teamId != null && teamId !== "" ? parseInt(teamId) : null;
  if (parsedTeamId != null && !Number.isInteger(parsedTeamId)) {
    return NextResponse.json({ error: "invalid teamId" }, { status: 400 });
  }

  const db = await getDb();

  // If a teamId was given, verify the team actually exists before inserting
  // the user. Avoids creating orphan user accounts that point at nothing.
  if (parsedTeamId != null) {
    const teamExists = await db.collection("teams").countDocuments({ _id: parsedTeamId });
    if (!teamExists) {
      return NextResponse.json({ error: "team not found" }, { status: 400 });
    }
  }

  const tempPassword = generatePassword();
  const passwordHash = await hashPassword(tempPassword);

  const doc = {
    name,
    username: normalizedUsername,
    email: email || null,
    role,
    teamId: parsedTeamId,
    passwordHash,
    mustChangePassword: true,
  };

  let inserted;
  try {
    inserted = await db.collection("users").insertOne(doc);
  } catch (e) {
    if (e.code === 11000) {
      return NextResponse.json({ error: "username already exists" }, { status: 409 });
    }
    throw e;
  }

  // If the user is a student with a team, also add them to that team's roster
  // with their name + email pre-filled. Other fields (phone, emergency contact)
  // start blank — admin can fill them in later from the Students tab.
  let studentLinked = false;
  if (doc.role === "student" && doc.teamId != null) {
    const studentEntry = {
      id: `${doc.teamId}-${Date.now()}`,
      name: doc.name,
      checkedIn: false,
      phone: null,
      email: doc.email || null,
      transport: null,
      insurance: null,
      emergencyName: null,
      emergencyRel: null,
      emergencyPhone: null,
      userId: inserted.insertedId.toString(),
    };
    const tr = await db.collection("teams").updateOne(
      { _id: doc.teamId },
      { $push: { students: studentEntry } }
    );
    studentLinked = tr.matchedCount > 0;
  }

  // Best-effort credentials email; we still return the temp password so admin can share manually.
  const emailResult = await sendCredentialsEmail({
    to: doc.email,
    name: doc.name,
    username: doc.username,
    tempPassword,
    isReset: false,
  });

  return NextResponse.json({
    id: inserted.insertedId.toString(),
    name: doc.name,
    username: doc.username,
    email: doc.email,
    role: doc.role,
    teamId: doc.teamId,
    mustChangePassword: true,
    initialPassword: tempPassword,
    studentLinked,
    emailSent: emailResult.sent,
    emailError: emailResult.error || null,
  });
}
