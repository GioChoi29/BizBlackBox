// One-time: move room assignments off the name-keyed `room_map` collection and
// onto each person's own record — roster students get room/floor on their
// embedded entry; mentors (JM/SM) get it on their user doc. Match is by name.
//
//   node scripts/migrate-rooms.mjs           # dry-run (no writes)
//   node scripts/migrate-rooms.mjs --apply   # stamp room/floor onto records
//   node scripts/migrate-rooms.mjs --drop    # drop the room_map collection
//                                              (run only after --apply + review)
import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
const APPLY = process.argv.includes("--apply");
const DROP = process.argv.includes("--drop");
const env={};for(const l of readFileSync(new URL("../.env.local",import.meta.url),"utf8").split("\n")){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);if(m)env[m[1]]=m[2].replace(/^["']|["']$/g,"");}
const norm=(s)=>String(s||"").trim().toLowerCase();
const c=await new MongoClient(env.MONGODB_URI).connect();
const db=c.db(env.MONGODB_DB||"bbb_portal");
console.log(`DB: ${env.MONGODB_DB} @ ${env.MONGODB_URI.replace(/\/\/[^@]*@/,"//***@")}`);

if (DROP) {
  console.log(DROP&&APPLY ? "" : "");
  const n = await db.collection("room_map").countDocuments();
  if (!APPLY) { console.log(`DROP DRY-RUN: would drop room_map (${n} rows). Re-run with --drop --apply.`); await c.close(); process.exit(0); }
  await db.collection("room_map").drop().catch(()=>{});
  console.log(`Dropped room_map (${n} rows).`);
  await c.close(); process.exit(0);
}

console.log(APPLY?"MODE: APPLY\n":"MODE: DRY-RUN (no writes)\n");
const rm = await db.collection("room_map").find({}).toArray();
const byName = new Map(); for (const r of rm) byName.set(norm(r.person), r);
const teams = await db.collection("teams").find({}).toArray();
const users = await db.collection("users").find({}).toArray();

let studentsMatched=0, studentsMissed=[];
for (const t of teams) for (const st of t.students||[]) {
  const r = byName.get(norm(st.name));
  if (r) { studentsMatched++; if(APPLY) await db.collection("teams").updateOne({_id:t._id,"students.id":st.id},{$set:{"students.$.room":r.room,"students.$.floor":r.floor}}); }
  else studentsMissed.push(`${t.name}/${st.name}`);
}
let mentorsMatched=0, mentorsMissed=[];
for (const u of users.filter(u=>u.role==="junior_mentor"||u.role==="senior_mentor")) {
  const r = byName.get(norm(u.name));
  if (r) { mentorsMatched++; if(APPLY) await db.collection("users").updateOne({_id:u._id},{$set:{room:r.room,floor:r.floor}}); }
  else mentorsMissed.push(u.name);
}
const allNames = new Set([...teams.flatMap(t=>(t.students||[]).map(s=>norm(s.name))), ...users.map(u=>norm(u.name))]);
const staleRm = rm.filter(r=>!allNames.has(norm(r.person)));

console.log(`Students: ${studentsMatched} matched a room, ${studentsMissed.length} without one`);
console.log(`Mentors:  ${mentorsMatched} matched a room, ${mentorsMissed.length} without one`);
console.log(`room_map rows matching nobody (will be discarded on --drop): ${staleRm.length}`);
if (studentsMissed.length) console.log("  students w/o room:", studentsMissed.slice(0,12).join(", ")+(studentsMissed.length>12?` …+${studentsMissed.length-12}`:""));
if (mentorsMissed.length) console.log("  mentors w/o room:", mentorsMissed.join(", "));
console.log(APPLY?"\nDone stamping. Review the app, then run --drop --apply to retire room_map.":"\n(dry-run — re-run with --apply)");
await c.close();
