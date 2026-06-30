// One-time: resync each roster student's display name to its linked user's
// current name, fixing entries that drifted (e.g. a user renamed after the
// roster copy was made). Dry-run by default; --apply to write.
import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
const APPLY=process.argv.includes("--apply");
const env={};for(const l of readFileSync(new URL("../.env.local",import.meta.url),"utf8").split("\n")){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);if(m)env[m[1]]=m[2].replace(/^["']|["']$/g,"");}
const c=await new MongoClient(env.MONGODB_URI).connect();
const db=c.db(env.MONGODB_DB||"bbb_portal");
const users=await db.collection("users").find({}).toArray();
const uById=new Map(users.map(u=>[u._id.toString(),u]));
const teams=await db.collection("teams").find({}).toArray();
let fixed=0;
for(const t of teams){
  for(const st of t.students||[]){
    if(!st.userId)continue;
    const u=uById.get(String(st.userId));
    if(u&&u.name&&u.name!==st.name){
      console.log(`  team${t._id}: "${st.name}" -> "${u.name}"`);
      fixed++;
      if(APPLY)await db.collection("teams").updateOne({_id:t._id,"students.id":st.id},{$set:{"students.$.name":u.name}});
    }
  }
}
console.log(`${APPLY?"APPLIED":"DRY-RUN"} | roster names resynced: ${fixed}`);
console.log(APPLY?"Done.":"(re-run with --apply)");
await c.close();
