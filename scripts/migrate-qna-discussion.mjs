// One-time: upgrade Q&A docs to the discussion model —
//   q -> title, add body, visibility (default public), resolved
//   (resolved = true if a staff member already replied).
// Idempotent. Dry-run by default; --apply to write.
import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
const APPLY=process.argv.includes("--apply");
const env={};for(const l of readFileSync(new URL("../.env.local",import.meta.url),"utf8").split("\n")){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);if(m)env[m[1]]=m[2].replace(/^["']|["']$/g,"");}
const c=await new MongoClient(env.MONGODB_URI).connect();
const db=c.db(env.MONGODB_DB||"bbb_portal");
const qs=await db.collection("qna").find({}).toArray();
let titled=0,vis=0,res=0;
for(const x of qs){
  const set={},unset={};
  if(x.title===undefined){set.title=(x.q||"Untitled").trim();set.body=x.body||"";unset.q="";titled++;}
  if(x.visibility===undefined){set.visibility="public";vis++;}
  if(x.resolved===undefined){set.resolved=(x.replies||[]).some(r=>r.role&&r.role!=="student");res++;}
  if(APPLY&&(Object.keys(set).length||Object.keys(unset).length)){
    const op={};if(Object.keys(set).length)op.$set=set;if(Object.keys(unset).length)op.$unset=unset;
    await db.collection("qna").updateOne({_id:x._id},op);
  }
}
console.log(`${APPLY?"APPLIED":"DRY-RUN"} | questions: ${qs.length}`);
console.log(`set title (from q): ${titled} | set visibility=public: ${vis} | set resolved: ${res}`);
console.log(APPLY?"Done.":"(re-run with --apply)");
await c.close();
