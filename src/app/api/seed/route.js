import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { hashPassword, requireAdmin } from "@/lib/auth";
import {
  buildTeams,
  buildSubmissions,
  buildUsers,
  buildQna,
  buildAnnouncements,
  buildSchedule,
  buildMentorsSM,
  buildVenue,
  buildPrelim,
  buildRoomMap,
  buildTransport,
  SEED_PASSWORD,
} from "@/lib/seedData";

// HTTP seed endpoint — re-seeds an existing DB. Requires:
//   1. Admin session, AND
//   2. ALLOW_SEED=1 env var (defense in depth so a leaked admin token can't
//      single-handedly wipe production)
// Use `npm run seed` from the CLI for first-time bootstrap on an empty DB.
export async function POST() {
  const { error } = await requireAdmin();
  if (error) return error;

  if (process.env.ALLOW_SEED !== "1") {
    return NextResponse.json(
      {
        error:
          "seeding is disabled. Set ALLOW_SEED=1 in env to permit; intended for one-shot resets only.",
      },
      { status: 403 }
    );
  }

  const db = await getDb();
  const collections = [
    "teams", "submissions", "users", "qna", "announcements",
    "schedule", "mentors_sm", "venue", "prelim", "room_map",
    "transport", "sessions",
  ];
  await Promise.all(collections.map((c) => db.collection(c).deleteMany({})));

  const passwordHash = await hashPassword(SEED_PASSWORD);
  const usersWithHash = buildUsers().map((u) => ({ ...u, passwordHash }));

  await Promise.all([
    db.collection("teams").insertMany(buildTeams()),
    db.collection("submissions").insertMany(buildSubmissions()),
    db.collection("users").insertMany(usersWithHash),
    db.collection("qna").insertMany(buildQna()),
    db.collection("announcements").insertMany(buildAnnouncements()),
    db.collection("schedule").insertMany(buildSchedule()),
    db.collection("mentors_sm").insertMany(buildMentorsSM()),
    db.collection("venue").insertMany(buildVenue()),
    db.collection("prelim").insertMany(buildPrelim()),
    db.collection("room_map").insertMany(buildRoomMap()),
    db.collection("transport").insertOne(buildTransport()),
  ]);

  await db.collection("submissions").createIndex({ teamId: 1 }, { unique: true });
  await db.collection("users").createIndex({ username: 1 }, { unique: true, sparse: true });
  await db.collection("users").createIndex({ email: 1 }, { sparse: true });
  await db.collection("schedule").createIndex({ day: 1, order: 1 });
  await db.collection("room_map").createIndex({ person: 1 });
  await db.collection("sessions").createIndex({ token: 1 }, { unique: true });
  await db.collection("sessions").createIndex({ userId: 1 });
  await db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  return NextResponse.json({
    ok: true,
    message: "Seeded all collections",
    seedPassword: SEED_PASSWORD,
    note: "Admin (no forced change) and all other accounts (forced change) start with this password.",
  });
}
