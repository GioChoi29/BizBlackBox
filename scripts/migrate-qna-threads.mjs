// One-time: convert legacy single-answer Q&A (a/aBy) into a replies[] thread,
// and stamp byId on each question (matched from the asker's name) so follow-ups
// and edit rights resolve. Dry-run by default; --apply to write.
import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
const APPLY=process.argv.includes("--apply");
const env={};for(const l of readFileSync(new URL("../.env.local",import.meta.url),"utf8").split("\n")){const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);if(m)env[m[1]]=m[2].replace(/^["']|["']$/g,"");}
const norm=(x)=>String(x||"").trim().toLowerCase();
const c=await new MongoClient(env.MONGODB_URI).connect();
const db=c.db(env.MONGODB_DB||"bbb_portal");
const users=await db.collection("users").find({}).toArray();
const byName=new Map(users.map(u=>[norm(u.name),u._id.toString()]));
const qs=await db.collection("qna").find({}).toArray();
let conv=0,withAnswer=0,stamped=0,already=0;
for(const x of qs){
  const update={set:{},unset:{}};
  if(!Array.isArray(x.replies)){
    conv++;
    if(x.a){withAnswer++;update.set.replies=[{id:`legacy-${x._id}`,text:x.a,by:x.aBy||"Admin",byId:null,role:"admin",ts:x.ts||Date.now()}];}
    else update.set.replies=[];
    update.unset.a="";update.unset.aBy="";
  } else already++;
  if(x.byId===undefined){const id=byName.get(norm(x.by));update.set.byId=id||null;if(id)stamped++;}
  if(APPLY&&(Object.keys(update.set).length||Object.keys(update.unset).length)){
    const op={};if(Object.keys(update.set).length)op.$set=update.set;if(Object.keys(update.unset).length)op.$unset=update.unset;
    await db.collection("qna").updateOne({_id:x._id},op);
  }
}
console.log(`${APPLY?"APPLIED":"DRY-RUN"} | total questions: ${qs.length}`);
console.log(`converted to replies[]: ${conv} (of which had an answer: ${withAnswer}) | already threaded: ${already}`);
console.log(`byId stamped from asker name: ${stamped}`);
console.log(APPLY?"Done.":"(re-run with --apply)");
await c.close();
