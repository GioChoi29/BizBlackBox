'use client';

import { useState, useEffect } from "react";
import AnimatedLogin from "./AnimatedLogin";

/* BBB 2026 — Business Case Competition Portal
   Light theme · Role-scoped views · KST countdown */

const ROLES = { STUDENT:"student", JM:"junior_mentor", SM:"senior_mentor", ADMIN:"admin" };
const RL = { [ROLES.STUDENT]:"Student", [ROLES.JM]:"Junior Mentor", [ROLES.SM]:"Senior Mentor", [ROLES.ADMIN]:"Admin" };
const RC = { [ROLES.STUDENT]:"#4F6BF6", [ROLES.JM]:"#7C5CDB", [ROLES.SM]:"#D97706", [ROLES.ADMIN]:"#E04555" };
const DL = new Date("2026-08-02T10:00:00+09:00");
const TN = ["Alpha","Beta","Gamma","Delta","Epsilon","Zeta","Eta","Theta","Iota","Kappa","Lambda","Mu","Nu","Xi","Omicron","Pi","Rho","Sigma","Tau","Upsilon"];

const mkTeams = () => TN.map((n,i)=>({
  id:i+1, name:`Team ${n}`, jm:`JM ${n}`,
  jmPhone:`010-${String(1000+i).padStart(4,"0")}-${String(5000+i).padStart(4,"0")}`,
  jmEmail:`jm.${n.toLowerCase()}@bbb.org`,
  workRoom:`Room ${201+Math.floor(i/4)}`,
  students:Array.from({length:8},(_,j)=>({id:`${i+1}-${j+1}`,name:`Student ${i*8+j+1}`,checkedIn:false})),
}));

const mkRM = () => {
  const m = {};
  for(let i=0;i<160;i++) m[`Student ${i+1}`]={room:`Room ${301+Math.floor(i/8)}`,floor:"3F"};
  TN.forEach((n,i)=>{m[`JM ${n}`]={room:`Room ${321+Math.floor(i/4)}`,floor:"3F"};});
  return m;
};
const RM = mkRM();

const SM_LIST = [
  {name:"SM Kim",phone:"010-9000-0001",email:"sm.kim@bbb.org",teams:"Teams 1–5"},
  {name:"SM Lee",phone:"010-9000-0002",email:"sm.lee@bbb.org",teams:"Teams 6–10"},
  {name:"SM Park",phone:"010-9000-0003",email:"sm.park@bbb.org",teams:"Teams 11–15"},
  {name:"SM Choi",phone:"010-9000-0004",email:"sm.choi@bbb.org",teams:"Teams 16–20"},
];

const SCHED = [
  {time:"08:00",ev:"Bus Departure",loc:"종합운동장역",day:1,type:"transport"},
  {time:"09:30",ev:"Arrival & Registration",loc:"Main Lobby",day:1,type:"logistics"},
  {time:"10:00",ev:"Opening Ceremony",loc:"Grand Hall",day:1,type:"ceremony"},
  {time:"10:45",ev:"Case Brief Distribution",loc:"Grand Hall",day:1,type:"competition"},
  {time:"11:00",ev:"Work Session 1",loc:"Team Rooms",day:1,type:"competition"},
  {time:"12:30",ev:"Lunch",loc:"Dining Hall",day:1,type:"break"},
  {time:"13:30",ev:"Work Session 2",loc:"Team Rooms",day:1,type:"competition"},
  {time:"15:30",ev:"Mentor Check-in Round 1",loc:"Team Rooms",day:1,type:"mentoring"},
  {time:"17:00",ev:"Work Session 3",loc:"Team Rooms",day:1,type:"competition"},
  {time:"18:30",ev:"Dinner",loc:"Dining Hall",day:1,type:"break"},
  {time:"19:30",ev:"Work Session 4",loc:"Team Rooms",day:1,type:"competition"},
  {time:"22:00",ev:"Evening Wrap-up",loc:"Team Rooms",day:1,type:"logistics"},
  {time:"23:00",ev:"Lights Out",loc:"Dormitory Rooms",day:1,type:"logistics"},
  {time:"07:00",ev:"Wake Up & Breakfast",loc:"Dining Hall",day:2,type:"break"},
  {time:"08:00",ev:"Final Work Session",loc:"Team Rooms",day:2,type:"competition"},
  {time:"10:00",ev:"Submission Deadline",loc:"Online",day:2,type:"competition"},
  {time:"10:30",ev:"Preliminary Presentations",loc:"Various",day:2,type:"competition"},
  {time:"13:00",ev:"Lunch",loc:"Dining Hall",day:2,type:"break"},
  {time:"14:00",ev:"Finals Presentations",loc:"Grand Hall",day:2,type:"competition"},
  {time:"16:00",ev:"Judging & Deliberation",loc:"—",day:2,type:"logistics"},
  {time:"17:00",ev:"Awards Ceremony",loc:"Grand Hall",day:2,type:"ceremony"},
  {time:"18:00",ev:"Closing & Departure",loc:"Main Lobby",day:2,type:"logistics"},
];

const PRELIM = [
  {teams:[1,2,3,4,5],time:"10:30 – 11:15",room:"Presentation Hall A"},
  {teams:[6,7,8,9,10],time:"11:15 – 12:00",room:"Presentation Hall A"},
  {teams:[11,12,13,14,15],time:"10:30 – 11:15",room:"Presentation Hall B"},
  {teams:[16,17,18,19,20],time:"11:15 – 12:00",room:"Presentation Hall B"},
];

const VENUE = [
  {name:"Grand Hall",floor:"1F",purpose:"Opening / Closing / Finals",cap:250},
  {name:"Presentation Hall A",floor:"1F",purpose:"Prelim Rounds (Groups 1–2)",cap:80},
  {name:"Presentation Hall B",floor:"1F",purpose:"Prelim Rounds (Groups 3–4)",cap:80},
  {name:"Dining Hall",floor:"1F",purpose:"Meals",cap:200},
  {name:"Rooms 201–205",floor:"2F",purpose:"Team Work Rooms",cap:"~15 ea."},
  {name:"Rooms 301–325",floor:"3F",purpose:"Dormitory",cap:"~8 ea."},
  {name:"Admin Office",floor:"1F",purpose:"Staff HQ / Lost & Found",cap:10},
];

const s = {
  bg:"#F4F5FA",surfHov:"#F0F1F8",border:"#E0E2EE",borderLt:"#ECEDF5",
  txt:"#1B1F30",txt2:"#5A5F78",txtM:"#9298B2",
  accent:"#4F6BF6",accentD:"rgba(79,107,246,0.07)",
  ok:"#0DA678",okD:"rgba(13,166,120,0.07)",
  warn:"#D97706",warnD:"rgba(217,119,6,0.07)",
  err:"#E04555",errD:"rgba(224,69,85,0.07)",
  info:"#3B82F6",infoD:"rgba(59,130,246,0.07)",
  sh:"0 1px 3px rgba(26,29,46,0.06),0 1px 2px rgba(26,29,46,0.03)",
  shL:"0 4px 16px rgba(26,29,46,0.07)",
};
const TC = {
  transport:{bg:s.infoD,txt:"#2563EB",dot:"#3B82F6"},
  logistics:{bg:"rgba(90,95,120,0.06)",txt:s.txt2,dot:s.txtM},
  ceremony:{bg:s.warnD,txt:"#B45309",dot:s.warn},
  competition:{bg:s.accentD,txt:s.accent,dot:s.accent},
  break:{bg:s.okD,txt:"#0B8F68",dot:s.ok},
  mentoring:{bg:"rgba(124,92,219,0.07)",txt:"#7C5CDB",dot:"#7C5CDB"},
};

const sv={width:20,height:20,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};
const I={
  Home:p=><svg {...sv} {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Cal:p=><svg {...sv} {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Ppl:p=><svg {...sv} {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Map:p=><svg {...sv} {...p}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  Bus:p=><svg {...sv} {...p}><rect x="4" y="2" width="16" height="16" rx="3"/><path d="M4 12h16"/><circle cx="7.5" cy="15.5" r="1"/><circle cx="16.5" cy="15.5" r="1"/><path d="M4 18h16"/><path d="M7 22v-2"/><path d="M17 22v-2"/></svg>,
  Msg:p=><svg {...sv} {...p}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>,
  Chk:p=><svg {...sv} {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Phn:p=><svg {...sv} {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 4.12 2.07 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.88.35 1.74.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c1.07.35 1.93.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  Bell:p=><svg {...sv} {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Bed:p=><svg {...sv} {...p}><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>,
  Out:p=><svg {...sv} {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Srch:p=><svg {...{...sv,width:18,height:18}} {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Send:p=><svg {...{...sv,width:18,height:18}} {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Rt:p=><svg {...{...sv,width:16,height:16}} {...p}><polyline points="9 18 15 12 9 6"/></svg>,
  Pin:p=><svg {...{...sv,width:14,height:14}} {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Clk:p=><svg {...{...sv,width:14,height:14}} {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Timer:p=><svg {...{...sv,width:22,height:22}} {...p}><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3L2 6"/><path d="M22 6l-3-3"/><path d="M12 2v3"/></svg>,
};

const Card=({children,style:st,hover})=>(
  <div style={{background:"#fff",border:`1px solid ${s.border}`,borderRadius:14,boxShadow:s.sh,transition:"box-shadow 0.15s",...st}}
    onMouseEnter={hover?e=>e.currentTarget.style.boxShadow=s.shL:undefined}
    onMouseLeave={hover?e=>e.currentTarget.style.boxShadow=s.sh:undefined}>{children}</div>
);
const Pill=({children,color=s.accent,active,onClick,style:st})=>(
  <button onClick={onClick} style={{padding:"8px 16px",borderRadius:9,border:`1.5px solid ${active?color:s.border}`,background:active?`${color}0D`:"#fff",color:active?color:s.txt2,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",...st}}>{children}</button>
);
const Badge=({children,color})=>(
  <span style={{display:"inline-block",padding:"2px 8px",borderRadius:5,background:`${color}12`,color,fontSize:10.5,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.03em"}}>{children}</span>
);

function useCountdown(target){
  const[now,setNow]=useState(Date.now());
  useEffect(()=>{const id=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(id);},[]);
  const d=target.getTime()-now;
  if(d<=0)return null;
  return{d:Math.floor(d/864e5),h:Math.floor((d%864e5)/36e5),m:Math.floor((d%36e5)/6e4),s:Math.floor((d%6e4)/1e3)};
}

function relTime(ts){
  const d=Date.now()-ts;
  if(d<60000)return"Just now";
  if(d<3600000)return`${Math.floor(d/60000)}m ago`;
  if(d<86400000)return`${Math.floor(d/3600000)}h ago`;
  return`${Math.floor(d/86400000)}d ago`;
}

function CountdownWidget(){
  const left=useCountdown(DL);
  if(!left) return(
    <Card style={{padding:"18px 20px",background:`linear-gradient(135deg,${s.err}06,${s.err}02)`,border:`1.5px solid ${s.err}22`}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:42,height:42,borderRadius:11,background:s.errD,color:s.err,display:"flex",alignItems:"center",justifyContent:"center"}}><I.Timer/></div>
        <div><div style={{fontSize:11,fontWeight:700,color:s.err,textTransform:"uppercase",letterSpacing:"0.06em"}}>Submission Closed</div>
        <div style={{fontSize:14,fontWeight:600,color:s.txt2,marginTop:2}}>The deadline has passed. Good luck!</div></div>
      </div>
    </Card>
  );
  return(
    <Card style={{padding:"18px 20px",background:`linear-gradient(135deg,${s.accent}05,rgba(124,92,219,0.03))`,border:`1.5px solid ${s.accent}1A`}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <div style={{width:42,height:42,borderRadius:11,background:s.accentD,color:s.accent,display:"flex",alignItems:"center",justifyContent:"center"}}><I.Timer/></div>
        <div><div style={{fontSize:11,fontWeight:700,color:s.accent,textTransform:"uppercase",letterSpacing:"0.06em"}}>Submission Deadline</div>
        <div style={{fontSize:13,color:s.txt2,marginTop:1}}>Aug 2, 2026 · 10:00 AM KST</div></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
        {[{l:"DAYS",v:left.d},{l:"HRS",v:left.h},{l:"MIN",v:left.m},{l:"SEC",v:left.s}].map(u=>(
          <div key={u.l} style={{textAlign:"center",padding:"12px 4px",borderRadius:10,background:"rgba(79,107,246,0.05)"}}>
            <div style={{fontSize:28,fontWeight:700,fontFamily:"'Space Mono',monospace",color:s.txt,lineHeight:1}}>{String(u.v).padStart(2,"0")}</div>
            <div style={{fontSize:10,fontWeight:700,color:s.txtM,marginTop:4,letterSpacing:"0.08em"}}>{u.l}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function LoginScreen({onLogin}){
  const[name,setName]=useState("");const[role,setRole]=useState(null);const[team,setTeam]=useState("");const[err,setErr]=useState("");
  const go=()=>{
    if(!name.trim())return setErr("Please enter your name");if(!role)return setErr("Please select your role");
    if((role===ROLES.STUDENT||role===ROLES.JM)&&!team)return setErr("Please select your team");
    onLogin({name:name.trim(),role,team:team?parseInt(team):null});
  };
  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(155deg,#EEF0F8 0%,#F8F6FF 45%,#F0F4FF 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"Arial,sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Space+Mono:wght@400;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{background:#F4F5FA;margin:0}input:focus,textarea:focus,select:focus{outline:none}::placeholder{color:#9298B2}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#D0D3E0;border-radius:3px}@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}`}</style>
      <div style={{width:"100%",maxWidth:400,animation:"fadeUp 0.5s ease"}}>
        <div style={{textAlign:"center",marginBottom:34}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:10,marginBottom:6}}>
            <div style={{width:44,height:44,borderRadius:13,background:"linear-gradient(135deg,#4F6BF6,#7C5CDB)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:"#fff",fontFamily:"'Space Mono',monospace",boxShadow:"0 4px 20px rgba(79,107,246,0.3)"}}>B</div>
            <span style={{fontSize:30,fontWeight:700,color:s.txt,letterSpacing:"-0.02em"}}>BBB 2026</span>
          </div>
          <p style={{color:s.txtM,fontSize:13,letterSpacing:"0.06em",textTransform:"uppercase",fontWeight:500}}>Business Case Competition</p>
        </div>
        <div style={{background:"#fff",border:`1px solid ${s.border}`,borderRadius:20,padding:28,boxShadow:s.shL}}>
          <div style={{marginBottom:20}}>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:s.txtM,marginBottom:7,textTransform:"uppercase",letterSpacing:"0.06em"}}>Your Name</label>
            <input value={name} onChange={e=>{setName(e.target.value);setErr("")}} placeholder="Enter your full name" onKeyDown={e=>e.key==="Enter"&&go()}
              style={{width:"100%",padding:"12px 14px",background:s.bg,border:`1px solid ${s.border}`,borderRadius:10,color:s.txt,fontSize:14,fontFamily:"inherit"}}
              onFocus={e=>e.target.style.borderColor=s.accent} onBlur={e=>e.target.style.borderColor=s.border}/>
          </div>
          <div style={{marginBottom:20}}>
            <label style={{display:"block",fontSize:11,fontWeight:700,color:s.txtM,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.06em"}}>Your Role</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {Object.entries(ROLES).map(([k,v])=>(
                <button key={k} onClick={()=>{setRole(v);setErr("")}} style={{padding:"10px 8px",borderRadius:10,border:`1.5px solid ${role===v?RC[v]:s.border}`,background:role===v?`${RC[v]}0C`:"#fff",color:role===v?RC[v]:s.txt2,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{RL[v]}</button>
              ))}
            </div>
          </div>
          {(role===ROLES.STUDENT||role===ROLES.JM)&&(
            <div style={{marginBottom:20,animation:"fadeUp 0.25s ease"}}>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:s.txtM,marginBottom:7,textTransform:"uppercase",letterSpacing:"0.06em"}}>Your Team</label>
              <select value={team} onChange={e=>{setTeam(e.target.value);setErr("")}} style={{width:"100%",padding:"12px 14px",background:s.bg,border:`1px solid ${s.border}`,borderRadius:10,color:team?s.txt:s.txtM,fontSize:14,fontFamily:"inherit",cursor:"pointer",appearance:"none"}}>
                <option value="">Select your team…</option>
                {TN.map((n,i)=><option key={i} value={i+1}>Team {n}</option>)}
              </select>
            </div>
          )}
          {err&&<div style={{padding:"8px 12px",borderRadius:8,background:s.errD,color:s.err,fontSize:12,marginBottom:14,fontWeight:500}}>{err}</div>}
          <button onClick={go} style={{width:"100%",padding:"12px 20px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#4F6BF6,#6B82F8)",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 16px rgba(79,107,246,0.25)"}}>Enter Portal</button>
        </div>
      </div>
    </div>
  );
}

export default function BBBPortal(){
  const[user,setUser]=useState(null);const[tab,setTab]=useState("home");const[teams,setTeams]=useState(mkTeams);
  const[submissions,setSubmissions]=useState(()=>Array.from({length:TN.length},(_,i)=>({teamId:i+1,submitted:false,by:null,ts:null})));
  const BASE_TS = 1737129600000;
  const[qna,setQna]=useState([
    {id:1,q:"What should we bring for the overnight stay?",by:"Student 3",tm:1,a:"Bring toiletries, a change of clothes, laptop + charger. Bedding is provided.",aBy:"Admin",ts:BASE_TS-3600000,category:"logistics"},
    {id:2,q:"Can we use external data sources?",by:"Student 15",tm:2,a:"Yes, any publicly available data. No proprietary databases.",aBy:"Admin",ts:BASE_TS-1800000,category:"rules"},
    {id:3,q:"Is there Wi-Fi at the venue?",by:"Student 40",tm:5,a:null,aBy:null,ts:BASE_TS-600000,category:"logistics"},
  ]);
  const[ann,setAnn]=useState([
    {id:1,title:"Welcome to BBB 2026!",body:"We're excited to have all 20 teams compete. Check the schedule and transport info carefully.",author:"Admin",ts:BASE_TS-86400000,pinned:true},
    {id:2,title:"Bus Reminder",body:"Main bus departs 8:00 AM sharp from 종합운동장역. Arrive by 7:45. Backup: 광역버스 7001 at 8:15 or 8:45.",author:"Admin",ts:BASE_TS-43200000,pinned:false},
  ]);
  const[moreOpen,setMoreOpen]=useState(false);
  if(!user)return <AnimatedLogin onLogin={setUser}/>;
  const chk=(tid,sid)=>setTeams(p=>p.map(tm=>tm.id===tid?{...tm,students:tm.students.map(st=>st.id===sid?{...st,checkedIn:!st.checkedIn}:st)}:tm));
  const setSubmissionStatus=(teamId,submitted,byName)=>setSubmissions(p=>p.map(x=>x.teamId===teamId?{...x,submitted,by:byName,ts:Date.now()}:x));
  const nav=[
    {id:"home",label:"Home",icon:I.Home},{id:"schedule",label:"Schedule",icon:I.Cal},{id:"teams",label:"Teams",icon:I.Ppl},
    {id:"transport",label:"Transport",icon:I.Bus},{id:"venue",label:"Venue",icon:I.Map},
    {id:"rooms",label:user.role===ROLES.ADMIN?"Rooms":"My Room",icon:I.Bed},
    {id:"contacts",label:"Contacts",icon:I.Phn},{id:"submission",label:"Submission Status",icon:I.Chk},{id:"checkin",label:"Check-in",icon:I.Chk},
    ...(user.role===ROLES.ADMIN?[{id:"students",label:"Students",icon:I.Ppl}]:[]),
    {id:"qna",label:"Q&A",icon:I.Msg},{id:"announcements",label:"Announce",icon:I.Bell},
  ];
  const pages={
    home:<PgHome user={user} teams={teams} ann={ann} setTab={setTab}/>,
    schedule:<PgSchedule user={user} teams={teams}/>,
    teams:<PgTeams user={user} teams={teams}/>,
    transport:<PgTransport/>,venue:<PgVenue/>,
    rooms:<PgRooms user={user} teams={teams}/>,
    contacts:<PgContacts teams={teams}/>,
    submission:<PgSubmission user={user} teams={teams} submissions={submissions} onUpdate={setSubmissionStatus}/>,
    checkin:<PgCheckin user={user} teams={teams} onChk={chk}/>,
    students:user.role===ROLES.ADMIN?<PgStudents teams={teams}/>:null,
    qna:<PgQna user={user} items={qna} onAns={(id,a)=>setQna(p=>p.map(x=>x.id===id?{...x,a,aBy:user.name}:x))} onAsk={(q,cat)=>setQna(p=>[...p,{id:Date.now(),q,by:user.name,tm:user.team,a:null,aBy:null,ts:Date.now(),category:cat||"general"}])}/>,
    announcements:<PgAnn user={user} items={ann} onAdd={(ti,bo)=>setAnn(p=>[{id:Date.now(),title:ti,body:bo,author:user.name,ts:Date.now(),pinned:false},...p])} onPin={(id)=>setAnn(p=>p.map(x=>x.id===id?{...x,pinned:!x.pinned}:x))} onEdit={(id,ti,bo)=>setAnn(p=>p.map(x=>x.id===id?{...x,title:ti,body:bo}:x))} onDel={(id)=>setAnn(p=>p.filter(x=>x.id!==id))}/>,
  };
  return(
    <div style={{minHeight:"100vh",background:s.bg,color:s.txt,fontFamily:"Arial,sans-serif",display:"flex"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Space+Mono:wght@400;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{background:#F4F5FA;margin:0}input:focus,textarea:focus,select:focus{outline:none}::placeholder{color:#9298B2}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#D0D3E0;border-radius:3px}@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}@media(max-width:768px){.sb{display:none!important}.mbn{display:flex!important}.mw{margin-left:0!important}}@media(min-width:769px){.mbn{display:none!important}}`}</style>
      <div className="sb" style={{width:216,height:"100vh",position:"fixed",left:0,top:0,background:"#fff",borderRight:`1px solid ${s.border}`,display:"flex",flexDirection:"column",zIndex:100,overflowY:"auto"}}>
        <div style={{padding:"16px 12px 12px",borderBottom:`1px solid ${s.borderLt}`}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
            <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#4F6BF6,#7C5CDB)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff",fontFamily:"'Space Mono',monospace"}}>B</div>
            <div><div style={{fontSize:14,fontWeight:700}}>BBB 2026</div><div style={{fontSize:10,color:s.txtM}}>Competition Portal</div></div>
          </div>
          <div style={{padding:"6px 8px",borderRadius:8,background:s.bg,display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:24,height:24,borderRadius:6,background:`${RC[user.role]}10`,color:RC[user.role],display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>{user.name[0]}</div>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.name}</div><div style={{fontSize:10,color:RC[user.role],fontWeight:600}}>{RL[user.role]}</div></div>
          </div>
        </div>
        <nav style={{padding:"5px 5px",flex:1}}>
          {nav.map(n=>{const a=tab===n.id;const Ic=n.icon;return <button key={n.id} onClick={()=>setTab(n.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,border:"none",background:a?s.accentD:"transparent",color:a?s.accent:s.txt2,fontSize:12.5,fontWeight:a?600:500,cursor:"pointer",fontFamily:"inherit",marginBottom:1,textAlign:"left"}} onMouseEnter={e=>{if(!a)e.currentTarget.style.background=s.surfHov}} onMouseLeave={e=>{if(!a)e.currentTarget.style.background="transparent"}}><Ic/>{n.label}</button>;})}
        </nav>
        <div style={{padding:"8px 5px",borderTop:`1px solid ${s.borderLt}`}}>
          <button onClick={()=>setUser(null)} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:8,border:"none",background:"transparent",color:s.txtM,fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}} onMouseEnter={e=>{e.currentTarget.style.background=s.errD;e.currentTarget.style.color=s.err}} onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=s.txtM}}><I.Out/>Log Out</button>
        </div>
      </div>
      <div className="mw" style={{marginLeft:216,flex:1,minHeight:"100vh"}}><div style={{maxWidth:880,margin:"0 auto",padding:"20px 20px 100px"}}>{pages[tab]}</div></div>
      <div className="mbn" style={{position:"fixed",bottom:0,left:0,right:0,background:"#fff",borderTop:`1px solid ${s.border}`,display:"none",justifyContent:"space-around",padding:"6px 2px",zIndex:100}}>
        {nav.slice(0,5).map(n=>{const a=tab===n.id;const Ic=n.icon;return <button key={n.id} onClick={()=>setTab(n.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,padding:"4px 5px",border:"none",borderRadius:6,background:a?s.accentD:"transparent",color:a?s.accent:s.txtM,fontSize:9,fontWeight:500,cursor:"pointer",fontFamily:"inherit",minWidth:48}}><Ic/>{n.label}</button>;})}
        <div style={{position:"relative"}}>
          <button onClick={()=>setMoreOpen(!moreOpen)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,padding:"4px 5px",border:"none",borderRadius:6,background:"transparent",color:s.txtM,fontSize:9,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}><span style={{fontSize:16,lineHeight:1}}>···</span>More</button>
          {moreOpen&&<div style={{position:"absolute",bottom:"100%",right:0,marginBottom:6,background:"#fff",border:`1px solid ${s.border}`,borderRadius:12,padding:5,minWidth:150,boxShadow:s.shL}}>
            {nav.slice(5).map(n=>{const Ic=n.icon;return <button key={n.id} onClick={()=>{setTab(n.id);setMoreOpen(false)}} style={{width:"100%",display:"flex",alignItems:"center",gap:7,padding:"8px 10px",borderRadius:7,border:"none",background:tab===n.id?s.accentD:"transparent",color:tab===n.id?s.accent:s.txt2,fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}><Ic/>{n.label}</button>;})}
          </div>}
        </div>
      </div>
    </div>
  );
}

// ── Pages ────────────────────────────────────────────────────────────────────

function PgHome({user,teams,ann,setTab}){
  const myTm=user.team?teams.find(x=>x.id===user.team):null;
  const tot=teams.reduce((a,x)=>a+x.students.length,0);
  const chkd=teams.reduce((a,x)=>a+x.students.filter(st=>st.checkedIn).length,0);
  const isAd=user.role===ROLES.ADMIN;
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <div style={{marginBottom:24}}><h1 style={{fontSize:26,fontWeight:700,marginBottom:3,letterSpacing:"-0.02em"}}>Welcome, {user.name}</h1><p style={{color:s.txt2,fontSize:14}}>{RL[user.role]}{myTm?` — ${myTm.name}`:""}</p></div>
      <div style={{marginBottom:16}}><CountdownWidget/></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:10,marginBottom:22}}>
        {[{l:"Teams",v:"20",cl:s.accent},{l:"Participants",v:String(tot),cl:s.info},...(isAd?[{l:"Checked In",v:`${chkd}/${tot}`,cl:s.ok}]:[]),...(myTm?[{l:"Team Check-in",v:`${myTm.students.filter(st=>st.checkedIn).length}/${myTm.students.length}`,cl:s.ok}]:[])].map((x,i)=>(
          <Card key={i} style={{padding:"14px 16px"}}><div style={{fontSize:10,color:s.txtM,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>{x.l}</div><div style={{fontSize:22,fontWeight:700,color:x.cl,fontFamily:"'Space Mono',monospace"}}>{x.v}</div></Card>
        ))}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:22}}>
        {[{l:"Schedule",t:"schedule",cl:s.accent},{l:"Transport",t:"transport",cl:s.info},{l:"Ask a Question",t:"qna",cl:s.ok},{l:"Contacts",t:"contacts",cl:s.warn}].map((a,i)=>(
          <button key={i} onClick={()=>setTab(a.t)} style={{padding:"8px 14px",borderRadius:8,border:`1px solid ${a.cl}22`,background:`${a.cl}08`,color:a.cl,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{a.l}</button>
        ))}
      </div>
      <Card style={{padding:16,marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}><h2 style={{fontSize:14,fontWeight:600,display:"flex",alignItems:"center",gap:6}}><I.Bell/>Announcements</h2><button onClick={()=>setTab("announcements")} style={{fontSize:11,color:s.accent,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>View All</button></div>
        {ann.slice(0,2).map(a=>(
          <div key={a.id} style={{padding:"10px 12px",borderRadius:9,background:s.bg,marginBottom:6,border:`1px solid ${s.borderLt}`}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>{a.pinned&&<Badge color={s.warn}>Pinned</Badge>}<span style={{fontSize:13,fontWeight:600}}>{a.title}</span></div>
            <p style={{fontSize:12,color:s.txt2,lineHeight:1.5}}>{a.body}</p>
          </div>
        ))}
      </Card>
      {myTm&&(
        <Card style={{padding:16}}><h2 style={{fontSize:14,fontWeight:600,marginBottom:10}}>My Team — {myTm.name}</h2>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><div style={{fontSize:10,color:s.txtM,fontWeight:700,marginBottom:2}}>Junior Mentor</div><div style={{fontSize:13,fontWeight:600}}>{myTm.jm}</div><div style={{fontSize:11,color:s.txt2}}>{myTm.jmPhone}</div></div>
            <div><div style={{fontSize:10,color:s.txtM,fontWeight:700,marginBottom:2}}>Work Room</div><div style={{fontSize:13,fontWeight:600}}>{myTm.workRoom}</div></div>
          </div>
        </Card>
      )}
    </div>
  );
}

function PgSchedule({user,teams}){
  const[day,setDay]=useState(1);const[prelim,setPrelim]=useState(false);
  const items=SCHED.filter(x=>x.day===day);const myP=user.team?PRELIM.find(p=>p.teams.includes(user.team)):null;
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <h1 style={{fontSize:24,fontWeight:700,marginBottom:3}}>Competition Schedule</h1><p style={{color:s.txt2,fontSize:13,marginBottom:20}}>Full 2-day event timeline</p>
      <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
        {[1,2].map(d=><Pill key={d} active={day===d&&!prelim} onClick={()=>{setDay(d);setPrelim(false)}}>Day {d}</Pill>)}
        <Pill color={s.warn} active={prelim} onClick={()=>setPrelim(!prelim)}>Prelim Schedule</Pill>
      </div>
      {prelim?(
        <div>
          {myP&&<Card style={{padding:14,marginBottom:14,border:`1.5px solid ${s.accent}40`,background:`${s.accent}06`}}><div style={{fontSize:11,fontWeight:700,color:s.accent,marginBottom:2}}>Your Prelim Slot</div><div style={{fontSize:14,fontWeight:600}}>{myP.time} — {myP.room}</div></Card>}
          <div style={{display:"grid",gap:8}}>
            {PRELIM.map((sl,i)=>(
              <Card key={i} style={{padding:14,border:sl.teams.includes(user.team)?`1.5px solid ${s.accent}50`:undefined}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><span style={{fontSize:14,fontWeight:700,fontFamily:"'Space Mono',monospace",color:s.accent}}>{sl.time}</span><Badge color={s.txt2}>{sl.room}</Badge></div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {sl.teams.map(tid=>{const tm=teams.find(x=>x.id===tid);const mine=tid===user.team;return <span key={tid} style={{padding:"3px 8px",borderRadius:5,background:mine?s.accentD:s.bg,color:mine?s.accent:s.txt2,fontSize:11.5,fontWeight:mine?700:500,border:`1px solid ${mine?`${s.accent}30`:s.borderLt}`}}>{tm?.name}</span>;})}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ):(
        <div style={{position:"relative",paddingLeft:20}}>
          <div style={{position:"absolute",left:5,top:6,bottom:6,width:2,background:`linear-gradient(180deg,${s.accent}30,${s.border})`,borderRadius:1}}/>
          {items.map((it,i)=>{const tc=TC[it.type]||TC.logistics;return(
            <div key={i} style={{position:"relative",marginBottom:6,animation:`slideIn 0.3s ease ${i*0.03}s both`}}>
              <div style={{position:"absolute",left:-17,top:15,width:8,height:8,borderRadius:"50%",background:tc.dot,border:`2px solid ${s.bg}`,boxShadow:`0 0 0 2px ${tc.dot}20`}}/>
              <Card hover style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
                <div style={{minWidth:50,fontFamily:"'Space Mono',monospace",fontSize:13,fontWeight:700,color:tc.txt}}>{it.time}</div>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{it.ev}</div><div style={{fontSize:11,color:s.txtM,display:"flex",alignItems:"center",gap:2,marginTop:1}}><I.Pin/>{it.loc}</div></div>
                <Badge color={tc.txt}>{it.type}</Badge>
              </Card>
            </div>
          );})}
        </div>
      )}
    </div>
  );
}

function PgTeams({user,teams}){
  const[srch,setSrch]=useState("");const[exp,setExp]=useState(user.team||null);
  const filt=teams.filter(tm=>tm.name.toLowerCase().includes(srch.toLowerCase())||tm.jm.toLowerCase().includes(srch.toLowerCase()));
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <h1 style={{fontSize:24,fontWeight:700,marginBottom:3}}>Teams</h1><p style={{color:s.txt2,fontSize:13,marginBottom:16}}>20 teams · 8 students each</p>
      <div style={{position:"relative",marginBottom:16}}><div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:s.txtM}}><I.Srch/></div>
        <input value={srch} onChange={e=>setSrch(e.target.value)} placeholder="Search teams or mentors…" style={{width:"100%",padding:"10px 12px 10px 36px",background:"#fff",border:`1px solid ${s.border}`,borderRadius:10,color:s.txt,fontSize:13,fontFamily:"inherit",boxShadow:s.sh}} onFocus={e=>e.target.style.borderColor=s.accent} onBlur={e=>e.target.style.borderColor=s.border}/>
      </div>
      <div style={{display:"grid",gap:6}}>
        {filt.map(tm=>{const open=exp===tm.id;const mine=tm.id===user.team;return(
          <Card key={tm.id} style={{overflow:"hidden",border:mine?`1.5px solid ${s.accent}40`:undefined}}>
            <button onClick={()=>setExp(open?null:tm.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"12px 14px",border:"none",background:"transparent",color:s.txt,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
              <div style={{width:34,height:34,borderRadius:8,background:mine?s.accentD:s.bg,color:mine?s.accent:s.txt2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,fontFamily:"'Space Mono',monospace",flexShrink:0}}>{tm.id}</div>
              <div style={{flex:1}}><div style={{fontSize:13.5,fontWeight:600}}>{tm.name}</div><div style={{fontSize:11.5,color:s.txt2}}>Mentor: {tm.jm} · {tm.workRoom}</div></div>
              <span style={{transform:open?"rotate(90deg)":"rotate(0)",transition:"transform 0.2s",color:s.txtM}}><I.Rt/></span>
            </button>
            {open&&<div style={{padding:"0 14px 12px",animation:"fadeUp 0.2s ease"}}><div style={{borderTop:`1px solid ${s.borderLt}`,paddingTop:10}}><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:4}}>{tm.students.map(st=><div key={st.id} style={{padding:"5px 9px",borderRadius:6,background:s.bg,border:`1px solid ${s.borderLt}`,fontSize:12,color:s.txt2}}>{st.name}</div>)}</div></div></div>}
          </Card>
        );})}
      </div>
    </div>
  );
}

function PgTransport(){return(
  <div style={{animation:"fadeUp 0.4s ease"}}>
    <h1 style={{fontSize:24,fontWeight:700,marginBottom:3}}>Transportation</h1><p style={{color:s.txt2,fontSize:13,marginBottom:20}}>Getting to the venue</p>
    <Card style={{padding:20,marginBottom:12,background:`linear-gradient(135deg,${s.accent}05,${s.accent}02)`,border:`1.5px solid ${s.accent}22`}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <div style={{width:40,height:40,borderRadius:10,background:s.accentD,color:s.accent,display:"flex",alignItems:"center",justifyContent:"center"}}><I.Bus/></div>
        <div><div style={{fontSize:11,color:s.accent,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em"}}>Main Bus — Recommended</div><div style={{fontSize:19,fontWeight:700,fontFamily:"'Space Mono',monospace"}}>08:00 AM</div></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        <div style={{padding:"10px 12px",borderRadius:8,background:`${s.accent}06`}}><div style={{fontSize:10,color:s.txtM,fontWeight:700,marginBottom:2}}>PICKUP</div><div style={{fontSize:13,fontWeight:600}}>종합운동장역</div><div style={{fontSize:11,color:s.txt2}}>Sports Complex Station</div></div>
        <div style={{padding:"10px 12px",borderRadius:8,background:`${s.accent}06`}}><div style={{fontSize:10,color:s.txtM,fontWeight:700,marginBottom:2}}>CAPACITY</div><div style={{fontSize:13,fontWeight:600}}>4 buses</div><div style={{fontSize:11,color:s.txt2}}>Arrive 10 min early</div></div>
      </div>
      <div style={{padding:"8px 12px",borderRadius:7,background:s.warnD,fontSize:12,color:"#92400E",fontWeight:600}}>Please arrive by 7:45 AM. Buses depart at 8:00 AM sharp!</div>
    </Card>
    <Card style={{padding:16,marginBottom:12}}>
      <h2 style={{fontSize:14,fontWeight:600,marginBottom:10,color:s.warn,display:"flex",alignItems:"center",gap:6}}><I.Clk/> Backup Options (If Late)</h2>
      {[{r:"광역버스 7001",t:"08:15 AM",n:"If you miss the main bus"},{r:"광역버스 7001",t:"08:45 AM",n:"Last backup option"}].map((b,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,background:s.bg,marginBottom:6,border:`1px solid ${s.borderLt}`}}>
          <div style={{minWidth:52,fontSize:13,fontWeight:700,color:s.warn,fontFamily:"'Space Mono',monospace"}}>{b.t}</div>
          <div><div style={{fontSize:13,fontWeight:600}}>{b.r}</div><div style={{fontSize:11,color:s.txt2}}>{b.n}</div></div>
        </div>
      ))}
    </Card>
    <Card style={{padding:14}}><h2 style={{fontSize:13,fontWeight:600,marginBottom:4}}>Personal Vehicle / Parents</h2><p style={{fontSize:12.5,color:s.txt2,lineHeight:1.5}}>If arriving by personal vehicle, use the venue's main entrance parking lot.</p></Card>
  </div>
);}

function PgVenue(){return(
  <div style={{animation:"fadeUp 0.4s ease"}}>
    <h1 style={{fontSize:24,fontWeight:700,marginBottom:3}}>Venue Map</h1><p style={{color:s.txt2,fontSize:13,marginBottom:20}}>Room directory & floor guide</p>
    <Card style={{overflow:"hidden",marginBottom:14}}>
      {["1F — Ground Floor","2F — Team Rooms","3F — Dormitory"].map((fl,fi)=>(
        <div key={fi} style={{padding:16,borderBottom:fi<2?`1px solid ${s.borderLt}`:"none",background:fi%2===0?"#fff":s.bg}}>
          <h3 style={{fontSize:11,fontWeight:700,color:s.accent,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.05em"}}>{fl}</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:6}}>
            {VENUE.filter(r=>r.floor===`${fi+1}F`).map((r,ri)=>(
              <div key={ri} style={{padding:"10px 12px",borderRadius:8,background:fi%2===0?s.bg:"#fff",border:`1px solid ${s.borderLt}`}}>
                <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{r.name}</div><div style={{fontSize:11.5,color:s.txt2}}>{r.purpose}</div><div style={{fontSize:10.5,color:s.txtM,marginTop:2}}>Cap: {r.cap}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </Card>
    <div style={{padding:12,borderRadius:10,background:s.infoD,border:`1px solid ${s.info}18`,fontSize:12,color:"#1D4ED8"}}><strong>Note:</strong> Admin Office (1F) is staff HQ & Lost & Found.</div>
  </div>
);}

function PgRooms({user,teams}){
  const myTm=user.team?teams.find(x=>x.id===user.team):null;
  const[roomSrch,setRoomSrch]=useState("");
  if(user.role===ROLES.ADMIN){
    const byRoom={};
    teams.forEach(tm=>tm.students.forEach(st=>{const ra=RM[st.name];if(ra){if(!byRoom[ra.room])byRoom[ra.room]=[];byRoom[ra.room].push({...st,team:tm.name});}}));
    teams.forEach(tm=>{const ra=RM[tm.jm];if(ra){if(!byRoom[ra.room])byRoom[ra.room]=[];byRoom[ra.room].push({name:tm.jm,team:tm.name,isMentor:true});}});
    const sorted=Object.entries(byRoom).sort((a,b)=>a[0].localeCompare(b[0]));
    const srchLow=roomSrch.toLowerCase();
    const filtSorted=roomSrch.trim()?sorted.filter(([,ppl])=>ppl.some(p=>p.name.toLowerCase().includes(srchLow))):sorted;
    return(
      <div style={{animation:"fadeUp 0.4s ease"}}>
        <h1 style={{fontSize:24,fontWeight:700,marginBottom:3}}>All Room Assignments</h1><p style={{color:s.txt2,fontSize:13,marginBottom:12}}>Dormitory rooms (admin view)</p>
        <div style={{position:"relative",marginBottom:16}}><div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:s.txtM}}><I.Srch/></div>
          <input value={roomSrch} onChange={e=>setRoomSrch(e.target.value)} placeholder="Search by student or mentor name…" style={{width:"100%",padding:"10px 12px 10px 36px",background:"#fff",border:`1px solid ${s.border}`,borderRadius:10,color:s.txt,fontSize:13,fontFamily:"inherit",boxShadow:s.sh}} onFocus={e=>e.target.style.borderColor=s.accent} onBlur={e=>e.target.style.borderColor=s.border}/>
        </div>
        <div style={{display:"grid",gap:8}}>
          {filtSorted.map(([room,ppl])=>(
            <Card key={room} style={{padding:14}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:14,fontWeight:700,color:s.accent,fontFamily:"'Space Mono',monospace"}}>{room}</span><Badge color={s.txt2}>{ppl.length} people</Badge></div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {ppl.map((p,i)=>{const isMatch=roomSrch.trim()&&p.name.toLowerCase().includes(srchLow);return<span key={i} style={{padding:"3px 8px",borderRadius:5,background:isMatch?"#FEF08A":p.isMentor?`${RC[ROLES.JM]}0C`:s.bg,color:isMatch?"#1B1F30":p.isMentor?RC[ROLES.JM]:s.txt2,fontSize:11.5,fontWeight:isMatch||p.isMentor?600:400,border:`1px solid ${s.borderLt}`}}>{p.name} <span style={{fontSize:10,color:isMatch?"#5A5F78":s.txtM}}>({p.team})</span></span>;})}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  if(user.role===ROLES.STUDENT){
    const myRoom=RM[user.name];
    return(
      <div style={{animation:"fadeUp 0.4s ease"}}>
        <h1 style={{fontSize:24,fontWeight:700,marginBottom:3}}>My Room</h1><p style={{color:s.txt2,fontSize:13,marginBottom:18}}>Your dormitory assignment</p>
        <Card style={{padding:22,textAlign:"center"}}>
          <div style={{width:56,height:56,borderRadius:14,background:s.accentD,color:s.accent,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}><I.Bed/></div>
          <div style={{fontSize:12,color:s.txtM,fontWeight:700,marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em"}}>Your Dorm Room</div>
          <div style={{fontSize:26,fontWeight:700,fontFamily:"'Space Mono',monospace",color:s.accent,marginBottom:4}}>{myRoom?.room||"TBA"}</div>
          <div style={{fontSize:12,color:s.txt2}}>Floor: {myRoom?.floor||"—"}</div>
        </Card>
        {myTm&&<Card style={{padding:14,marginTop:12}}><div style={{fontSize:12,fontWeight:600,color:s.txt2,marginBottom:3}}>Team Work Room</div><div style={{fontSize:17,fontWeight:700,fontFamily:"'Space Mono',monospace"}}>{myTm.workRoom}</div><div style={{fontSize:11,color:s.txtM,marginTop:1}}>{myTm.name}</div></Card>}
      </div>
    );
  }
  if(user.role===ROLES.JM){
    const myRoom=RM[user.name]||(myTm?RM[myTm.jm]:null);
    return(
      <div style={{animation:"fadeUp 0.4s ease"}}>
        <h1 style={{fontSize:24,fontWeight:700,marginBottom:3}}>My Room</h1><p style={{color:s.txt2,fontSize:13,marginBottom:18}}>Your dormitory assignment</p>
        <Card style={{padding:22,textAlign:"center"}}>
          <div style={{width:56,height:56,borderRadius:14,background:`${RC[ROLES.JM]}0C`,color:RC[ROLES.JM],display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}><I.Bed/></div>
          <div style={{fontSize:12,color:s.txtM,fontWeight:700,marginBottom:3,textTransform:"uppercase"}}>Your Dorm Room</div>
          <div style={{fontSize:26,fontWeight:700,fontFamily:"'Space Mono',monospace",color:RC[ROLES.JM],marginBottom:4}}>{myRoom?.room||"TBA"}</div>
          <div style={{fontSize:12,color:s.txt2}}>Floor: {myRoom?.floor||"—"}</div>
        </Card>
        {myTm&&<Card style={{padding:14,marginTop:12}}><div style={{fontSize:12,fontWeight:600,color:s.txt2,marginBottom:3}}>Team Work Room</div><div style={{fontSize:17,fontWeight:700,fontFamily:"'Space Mono',monospace"}}>{myTm.workRoom}</div><div style={{fontSize:11,color:s.txtM,marginTop:1}}>{myTm.name}</div></Card>}
      </div>
    );
  }
  return <div style={{animation:"fadeUp 0.4s ease"}}><h1 style={{fontSize:24,fontWeight:700,marginBottom:3}}>My Room</h1><Card style={{padding:20,textAlign:"center"}}><p style={{color:s.txt2,fontSize:13}}>Room assignments for senior mentors will be shared separately. Please check with Admin.</p></Card></div>;
}

function CheckinList({team,onChk,canToggle}){
  const cnt=team.students.filter(st=>st.checkedIn).length;
  return(
    <Card style={{padding:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}><h3 style={{fontSize:14,fontWeight:700}}>{team.name}</h3><Badge color={cnt===8?s.ok:s.warn}>{cnt}/8</Badge></div>
      <div style={{display:"grid",gap:4}}>
        {team.students.map(st=>(
          <button key={st.id} onClick={canToggle?()=>onChk(team.id,st.id):undefined} style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"10px 12px",borderRadius:8,border:`1px solid ${st.checkedIn?`${s.ok}30`:s.borderLt}`,background:st.checkedIn?s.okD:"#fff",cursor:canToggle?"pointer":"default",fontFamily:"inherit",textAlign:"left",color:s.txt}}>
            <div style={{width:20,height:20,borderRadius:5,border:`2px solid ${st.checkedIn?s.ok:s.border}`,background:st.checkedIn?s.ok:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{st.checkedIn&&<span style={{color:"#fff",fontSize:12,fontWeight:700}}>✓</span>}</div>
            <span style={{fontSize:13,fontWeight:st.checkedIn?600:400}}>{st.name}</span>
            {st.checkedIn&&<span style={{marginLeft:"auto",fontSize:10,color:s.ok,fontWeight:700}}>CHECKED IN</span>}
          </button>
        ))}
      </div>
    </Card>
  );
}

function PgCheckin({user,teams,onChk}){
  const[sel,setSel]=useState(user.team||1);
  const myTm=user.team?teams.find(x=>x.id===user.team):null;
  if(user.role===ROLES.ADMIN||user.role===ROLES.SM){
    const team=teams.find(x=>x.id===sel);const gc=teams.reduce((a,x)=>a+x.students.filter(st=>st.checkedIn).length,0);const gt=teams.reduce((a,x)=>a+x.students.length,0);
    return(
      <div style={{animation:"fadeUp 0.4s ease"}}>
        <h1 style={{fontSize:24,fontWeight:700,marginBottom:3}}>Check-in Management</h1><p style={{color:s.txt2,fontSize:13,marginBottom:16}}>Mark student attendance</p>
        <Card style={{padding:"12px 16px",display:"inline-block",marginBottom:14}}><div style={{fontSize:10,color:s.ok,fontWeight:700,marginBottom:1}}>TOTAL CHECKED IN</div><div style={{fontSize:20,fontWeight:700,color:s.ok,fontFamily:"'Space Mono',monospace"}}>{gc}/{gt}</div></Card>
        <div style={{marginBottom:14}}><select value={sel} onChange={e=>setSel(parseInt(e.target.value))} style={{width:"100%",maxWidth:260,padding:"10px 12px",background:"#fff",border:`1px solid ${s.border}`,borderRadius:9,color:s.txt,fontSize:13,fontFamily:"inherit",cursor:"pointer",boxShadow:s.sh}}>
          {teams.map(tm=><option key={tm.id} value={tm.id}>{tm.name} ({tm.students.filter(st=>st.checkedIn).length}/{tm.students.length})</option>)}
        </select></div>
        {team&&<CheckinList team={team} onChk={onChk} canToggle/>}
      </div>
    );
  }
  if(user.role===ROLES.JM&&myTm){
    return(<div style={{animation:"fadeUp 0.4s ease"}}><h1 style={{fontSize:24,fontWeight:700,marginBottom:3}}>Team Check-in</h1><p style={{color:s.txt2,fontSize:13,marginBottom:16}}>{myTm.name} attendance</p><CheckinList team={myTm} onChk={onChk} canToggle/></div>);
  }
  if(user.role===ROLES.STUDENT&&myTm){
    const me=myTm.students.find(st=>st.name===user.name);const cnt=myTm.students.filter(st=>st.checkedIn).length;
    return(
      <div style={{animation:"fadeUp 0.4s ease"}}>
        <h1 style={{fontSize:24,fontWeight:700,marginBottom:3}}>Check-in Status</h1><p style={{color:s.txt2,fontSize:13,marginBottom:16}}>Your status & team attendance</p>
        <Card style={{padding:18,textAlign:"center",marginBottom:14,border:me?.checkedIn?`1.5px solid ${s.ok}40`:undefined,background:me?.checkedIn?s.okD:undefined}}>
          <div style={{fontSize:11,color:s.txtM,fontWeight:700,marginBottom:4,textTransform:"uppercase"}}>Your Status</div>
          <div style={{fontSize:18,fontWeight:700,color:me?.checkedIn?s.ok:s.warn}}>{me?.checkedIn?"Checked In":"Not Checked In"}</div>
        </Card>
        <Card style={{padding:14}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}><h3 style={{fontSize:13,fontWeight:600}}>{myTm.name}</h3><Badge color={cnt===8?s.ok:s.warn}>{cnt}/8</Badge></div>
          <div style={{display:"grid",gap:3}}>
            {myTm.students.map(st=>(
              <div key={st.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:7,background:st.name===user.name?s.accentD:s.bg,border:`1px solid ${st.name===user.name?`${s.accent}22`:s.borderLt}`}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:st.checkedIn?s.ok:s.border}}/>
                <span style={{fontSize:12.5,fontWeight:st.name===user.name?600:400,color:st.name===user.name?s.txt:s.txt2}}>{st.name}{st.name===user.name?" (You)":""}</span>
                <span style={{marginLeft:"auto",fontSize:10,color:st.checkedIn?s.ok:s.txtM,fontWeight:600}}>{st.checkedIn?"In":"—"}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }
  return <div style={{animation:"fadeUp 0.4s ease",padding:18,color:s.txt2}}>Check-in not available for your role.</div>;
}

function PgQna({user,items,onAns,onAsk}){
  const[q,setQ]=useState("");const[ans,setAns]=useState({});const[fil,setFil]=useState("all");const[catFil,setCatFil]=useState("all");const[qCat,setQCat]=useState("general");
  const canAns=user.role!==ROLES.STUDENT;
  const unanswered=items.filter(x=>!x.a).length;
  const list=items.filter(x=>{const stOk=fil==="all"||(fil==="pending"&&!x.a)||(fil==="answered"&&!!x.a);const cOk=catFil==="all"||x.category===catFil;return stOk&&cOk;}).sort((a,b)=>b.ts-a.ts);
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <h1 style={{fontSize:24,fontWeight:700,marginBottom:3}}>Q&A Board</h1><p style={{color:s.txt2,fontSize:13,marginBottom:12}}>Public questions & answers — visible to everyone for fairness</p>
      {unanswered>0&&<div style={{background:s.errD,color:s.err,borderRadius:9,padding:"10px 14px",fontWeight:700,fontSize:13,marginBottom:14}}>{unanswered} question{unanswered>1?"s":""} {user.role===ROLES.ADMIN?"need your answer":"awaiting answer"}</div>}
      <Card style={{padding:14,marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:600,color:s.txt2,marginBottom:7}}>Ask a Question</div>
        <div style={{display:"flex",gap:6,marginBottom:6}}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Type your question…" onKeyDown={e=>e.key==="Enter"&&q.trim()&&(onAsk(q.trim(),qCat),setQ(""))}
            style={{flex:1,padding:"10px 12px",background:s.bg,border:`1px solid ${s.border}`,borderRadius:8,color:s.txt,fontSize:13,fontFamily:"inherit"}} onFocus={e=>e.target.style.borderColor=s.accent} onBlur={e=>e.target.style.borderColor=s.border}/>
          <select value={qCat} onChange={e=>setQCat(e.target.value)} style={{padding:"10px 10px",background:s.bg,border:`1px solid ${s.border}`,borderRadius:8,color:s.txt,fontSize:12,fontFamily:"inherit",cursor:"pointer"}}>
            {["logistics","rules","technical","general","other"].map(c=><option key={c} value={c}>{c[0].toUpperCase()+c.slice(1)}</option>)}
          </select>
          <button onClick={()=>{if(q.trim()){onAsk(q.trim(),qCat);setQ("")}}} style={{padding:"10px 14px",borderRadius:8,border:"none",background:s.accent,color:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:12,display:"flex",alignItems:"center",gap:4}}><I.Send/>Ask</button>
        </div>
        <div style={{fontSize:10,color:s.txtM,marginTop:3}}>All Q&A visible to every participant.</div>
      </Card>
      <div style={{display:"flex",gap:5,marginBottom:8,flexWrap:"wrap"}}>
        {[{id:"all",l:"All"},{id:"pending",l:`Pending (${items.filter(x=>!x.a).length})`},{id:"answered",l:"Answered"}].map(f=><Pill key={f.id} active={fil===f.id} onClick={()=>setFil(f.id)} style={{padding:"6px 12px",fontSize:11.5}}>{f.l}</Pill>)}
      </div>
      <div style={{display:"flex",gap:5,marginBottom:14,flexWrap:"wrap"}}>
        {[{id:"all",l:"All Categories"},{id:"logistics",l:"Logistics"},{id:"rules",l:"Rules"},{id:"technical",l:"Technical"},{id:"general",l:"General"},{id:"other",l:"Other"}].map(f=><Pill key={f.id} active={catFil===f.id} onClick={()=>setCatFil(f.id)} color={s.info} style={{padding:"5px 10px",fontSize:11}}>{f.l}</Pill>)}
      </div>
      <div style={{display:"grid",gap:7}}>
        {list.map(x=>(
          <Card key={x.id} style={{padding:14,border:!x.a?`1px solid ${s.warn}28`:undefined}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:4}}>
              <div style={{width:24,height:24,borderRadius:6,background:s.infoD,color:s.info,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0,marginTop:1}}>Q</div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,lineHeight:1.5}}>{x.q}</div><div style={{fontSize:11,color:s.txtM,marginTop:2,display:"flex",alignItems:"center",gap:6}}><span>{x.by}{x.tm?` · Team ${x.tm}`:""} · {relTime(x.ts)}</span>{x.category&&<Badge color={s.info}>{x.category}</Badge>}</div></div>
              {!x.a&&<Badge color={s.warn}>Pending</Badge>}
            </div>
            {x.a&&<div style={{marginTop:6,marginLeft:32,padding:"9px 11px",borderRadius:8,background:s.okD,border:`1px solid ${s.ok}15`}}><div style={{fontSize:10,color:s.ok,fontWeight:700,marginBottom:2}}>ANSWERED BY {x.aBy?.toUpperCase()}</div><div style={{fontSize:12.5,color:s.txt,lineHeight:1.6}}>{x.a}</div></div>}
            {!x.a&&canAns&&(
              <div style={{marginTop:6,marginLeft:32,display:"flex",gap:5}}>
                <input value={ans[x.id]||""} onChange={e=>setAns(p=>({...p,[x.id]:e.target.value}))} placeholder="Answer…" style={{flex:1,padding:"8px 10px",background:s.bg,border:`1px solid ${s.border}`,borderRadius:7,color:s.txt,fontSize:12,fontFamily:"inherit"}} onFocus={e=>e.target.style.borderColor=s.ok} onBlur={e=>e.target.style.borderColor=s.border}/>
                <button onClick={()=>{if(ans[x.id]?.trim()){onAns(x.id,ans[x.id].trim());setAns(p=>({...p,[x.id]:""}));}}} style={{padding:"8px 12px",borderRadius:7,border:"none",background:s.ok,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Reply</button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function PgAnn({user,items,onAdd,onPin,onEdit,onDel}){
  const[ti,setTi]=useState("");const[bo,setBo]=useState("");const isAd=user.role===ROLES.ADMIN;
  const[editMap,setEditMap]=useState({});const[editVals,setEditVals]=useState({});
  const startEdit=(a)=>{setEditMap(p=>({...p,[a.id]:true}));setEditVals(p=>({...p,[a.id]:{ti:a.title,bo:a.body}}));};
  const cancelEdit=(id)=>setEditMap(p=>({...p,[id]:false}));
  const saveEdit=(id)=>{const v=editVals[id];if(v&&v.ti.trim()&&v.bo.trim()){onEdit(id,v.ti.trim(),v.bo.trim());setEditMap(p=>({...p,[id]:false}));}};
  const renderAnn=(a,pinned)=>{
    if(isAd&&editMap[a.id]){
      const v=editVals[a.id]||{ti:a.title,bo:a.body};
      return(
        <Card key={a.id} style={{padding:14,marginBottom:8}}>
          <input value={v.ti} onChange={e=>setEditVals(p=>({...p,[a.id]:{...p[a.id],ti:e.target.value}}))} style={{width:"100%",padding:"8px 10px",background:s.bg,border:`1px solid ${s.border}`,borderRadius:7,color:s.txt,fontSize:13,fontFamily:"inherit",marginBottom:6}} onFocus={e=>e.target.style.borderColor=s.accent} onBlur={e=>e.target.style.borderColor=s.border}/>
          <textarea value={v.bo} onChange={e=>setEditVals(p=>({...p,[a.id]:{...p[a.id],bo:e.target.value}}))} rows={3} style={{width:"100%",padding:"8px 10px",background:s.bg,border:`1px solid ${s.border}`,borderRadius:7,color:s.txt,fontSize:13,fontFamily:"inherit",resize:"vertical",marginBottom:6,lineHeight:1.5,whiteSpace:"pre-wrap"}} onFocus={e=>e.target.style.borderColor=s.accent} onBlur={e=>e.target.style.borderColor=s.border}/>
          <div style={{display:"flex",gap:6}}><button onClick={()=>saveEdit(a.id)} style={{padding:"7px 14px",borderRadius:7,border:"none",background:s.ok,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Save</button><button onClick={()=>cancelEdit(a.id)} style={{padding:"7px 14px",borderRadius:7,border:`1px solid ${s.border}`,background:"#fff",color:s.txt2,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button></div>
        </Card>
      );
    }
    return(
      <Card key={a.id} style={{padding:pinned?16:14,marginBottom:pinned?8:6,background:pinned?`linear-gradient(135deg,${s.warn}05,${s.warn}02)`:"#fff",border:pinned?`1.5px solid ${s.warn}22`:undefined}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:4}}>
          <div style={{display:"flex",alignItems:"center",gap:6,flex:1}}>{pinned&&<Badge color={s.warn}>Pinned</Badge>}<span style={{fontSize:pinned?14:13.5,fontWeight:pinned?700:600}}>{a.title}</span></div>
          {isAd&&<div style={{display:"flex",gap:4,flexShrink:0}}>
            <button onClick={()=>onPin(a.id)} style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${s.border}`,background:"#fff",color:a.pinned?s.warn:s.txt2,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{a.pinned?"Unpin":"Pin"}</button>
            <button onClick={()=>startEdit(a)} style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${s.border}`,background:"#fff",color:s.accent,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Edit</button>
            <button onClick={()=>window.confirm("Delete this announcement?")&&onDel(a.id)} style={{padding:"4px 8px",borderRadius:6,border:`1px solid ${s.err}30`,background:s.errD,color:s.err,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Del</button>
          </div>}
        </div>
        <p style={{fontSize:13,color:s.txt2,lineHeight:1.6,marginBottom:4,whiteSpace:"pre-wrap"}}>{a.body}</p>
        <div style={{fontSize:11,color:s.txtM}}>Posted by {a.author} · {relTime(a.ts)} · {new Date(a.ts).toLocaleDateString()}</div>
      </Card>
    );
  };
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <h1 style={{fontSize:24,fontWeight:700,marginBottom:3}}>Announcements</h1><p style={{color:s.txt2,fontSize:13,marginBottom:16}}>Official updates from the organizers</p>
      {isAd&&(
        <Card style={{padding:16,marginBottom:18}}>
          <div style={{fontSize:11,fontWeight:600,color:s.txt2,marginBottom:8}}>Post New Announcement</div>
          <input value={ti} onChange={e=>setTi(e.target.value)} placeholder="Title…" style={{width:"100%",padding:"10px 12px",background:s.bg,border:`1px solid ${s.border}`,borderRadius:8,color:s.txt,fontSize:13,fontFamily:"inherit",marginBottom:7}} onFocus={e=>e.target.style.borderColor=s.accent} onBlur={e=>e.target.style.borderColor=s.border}/>
          <textarea value={bo} onChange={e=>setBo(e.target.value)} placeholder="Write your announcement…" rows={3} style={{width:"100%",padding:"10px 12px",background:s.bg,border:`1px solid ${s.border}`,borderRadius:8,color:s.txt,fontSize:13,fontFamily:"inherit",resize:"vertical",marginBottom:7,lineHeight:1.5,whiteSpace:"pre-wrap"}} onFocus={e=>e.target.style.borderColor=s.accent} onBlur={e=>e.target.style.borderColor=s.border}/>
          <button onClick={()=>{if(ti.trim()&&bo.trim()){onAdd(ti.trim(),bo.trim());setTi("");setBo("")}}} style={{padding:"9px 20px",borderRadius:8,border:"none",background:s.accent,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Post</button>
        </Card>
      )}
      {items.filter(a=>a.pinned).map(a=>renderAnn(a,true))}
      {items.filter(a=>!a.pinned).map(a=>renderAnn(a,false))}
    </div>
  );
}

function PgContacts({teams}){
  const[tab,setTab]=useState("jm");
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <h1 style={{fontSize:24,fontWeight:700,marginBottom:3}}>Contacts</h1><p style={{color:s.txt2,fontSize:13,marginBottom:16}}>Mentor contact directory</p>
      <div style={{display:"flex",gap:6,marginBottom:16}}><Pill active={tab==="jm"} onClick={()=>setTab("jm")}>Junior Mentors</Pill><Pill active={tab==="sm"} onClick={()=>setTab("sm")}>Senior Mentors</Pill></div>
      {tab==="jm"?(
        <div style={{display:"grid",gap:6}}>
          {teams.map(tm=>(
            <Card key={tm.id} hover style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:34,height:34,borderRadius:8,background:`${RC[ROLES.JM]}0C`,color:RC[ROLES.JM],display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0}}>{tm.jm.slice(3,5)}</div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{tm.jm}</div><div style={{fontSize:11.5,color:s.txt2}}>{tm.name}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:12,color:s.txt2}}>{tm.jmPhone}</div><div style={{fontSize:11,color:s.txtM}}>{tm.jmEmail}</div></div>
            </Card>
          ))}
        </div>
      ):(
        <div style={{display:"grid",gap:6}}>
          {SM_LIST.map((sm,i)=>(
            <Card key={i} hover style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:34,height:34,borderRadius:8,background:`${RC[ROLES.SM]}0C`,color:RC[ROLES.SM],display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0}}>{sm.name.slice(3,5)}</div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{sm.name}</div><div style={{fontSize:11.5,color:s.txt2}}>{sm.teams}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:12,color:s.txt2}}>{sm.phone}</div><div style={{fontSize:11,color:s.txtM}}>{sm.email}</div></div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function PgSubmission({user,teams,submissions,onUpdate}){
  const data=teams.map(tm=>{
    const rec=submissions.find(x=>x.teamId===tm.id);
    return{
      teamId:tm.id,
      name:tm.name,
      jm:tm.jm,
      submitted:rec?.submitted||false,
      by:rec?.by||null,
      ts:rec?.ts||null,
    };
  });
  const totalSubmitted=data.filter(x=>x.submitted).length;
  const canAdmin=user.role===ROLES.ADMIN;
  const canStudent=user.role===ROLES.STUDENT;
  const myTeamId=user.team||null;
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <h1 style={{fontSize:24,fontWeight:700,marginBottom:3}}>Submission Status</h1>
      <p style={{color:s.txt2,fontSize:13,marginBottom:16}}>Track which teams have submitted their presentations.</p>
      <Card style={{padding:"12px 16px",marginBottom:16,display:"inline-flex",flexDirection:"column",gap:2}}>
        <div style={{fontSize:10,color:s.txtM,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>Overall</div>
        <div style={{fontSize:18,fontWeight:700,color:totalSubmitted===data.length?s.ok:s.accent,fontFamily:"'Space Mono',monospace"}}>
          {totalSubmitted}/{data.length} teams submitted
        </div>
      </Card>
      <div style={{display:"grid",gap:8}}>
        {data.map(t=>{
          const isMine=t.teamId===myTeamId;
          const canToggle=canAdmin||(canStudent&&isMine);
          const label=t.submitted?"Submitted":"Not Submitted";
          const badgeColor=t.submitted?s.ok:s.warn;
          const btnLabel=t.submitted?"Mark as Not Submitted":"Mark as Submitted";
          const info=t.by?`Marked by ${t.by}`:null;
          const time=t.ts?new Date(t.ts).toLocaleTimeString():null;
          return(
            <Card key={t.teamId} style={{padding:14,border:t.submitted?`1.5px solid ${s.ok}35`:undefined,background:t.submitted?s.okD:"#fff"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700}}>{t.name}</div>
                  <div style={{fontSize:11.5,color:s.txtM}}>Mentor: {t.jm}</div>
                </div>
                <Badge color={badgeColor}>{label}</Badge>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                <div style={{fontSize:11.5,color:s.txt2}}>
                  {info&&<span>{info}{time?` · ${time}`:""}</span>}
                  {!info&&<span>{t.submitted?"Submitted":"Waiting for submission"}</span>}
                  {canStudent&&isMine&&!t.submitted&&<span style={{display:"block",marginTop:2,color:s.txtM}}>Anyone on your team can mark the submission once uploaded.</span>}
                </div>
                <button
                  disabled={!canToggle}
                  onClick={()=>canToggle&&onUpdate(t.teamId,!t.submitted,user.name)}
                  style={{
                    padding:"8px 12px",
                    borderRadius:8,
                    border:"none",
                    background:canToggle?(t.submitted?s.warn:s.ok):(s.bg),
                    color:canToggle?"#fff":s.txtM,
                    fontSize:12,
                    fontWeight:600,
                    cursor:canToggle?"pointer":"default",
                    fontFamily:"inherit",
                    whiteSpace:"nowrap",
                  }}
                >
                  {btnLabel}
                </button>
              </div>
              {!canToggle&&(
                <div style={{marginTop:6,fontSize:10.5,color:s.txtM}}>
                  Submission status is read-only for your role.
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function mkStudentDetail(st,team,idx){
  const phones=["010-1234-5678","010-2345-6789","010-3456-7890","010-4567-8901","010-5678-9012"];
  const insurers=["Samsung Fire","Hyundai Marine","DB Insurance","KB Insurance","Lotte Insurance"];
  const transports=["Main Bus (8:00 AM)","Personal Vehicle","Backup Bus (8:15 AM)","Personal Vehicle","Main Bus (8:00 AM)"];
  const emergencyNames=["Park Jiyeon","Kim Minsu","Lee Jieun","Choi Hyunwoo","Jung Sooyeon"];
  const emergencyRels=["Mother","Father","Mother","Father","Mother"];
  return{
    ...st,team,
    phone:phones[idx%phones.length],
    email:`student${idx+1}@bbb.org`,
    room:RM[st.name]?.room||"TBA",
    floor:RM[st.name]?.floor||"—",
    insurance:insurers[idx%insurers.length],
    transport:transports[idx%transports.length],
    emergencyName:emergencyNames[idx%emergencyNames.length],
    emergencyRel:emergencyRels[idx%emergencyRels.length],
    emergencyPhone:phones[(idx+2)%phones.length],
  };
}

function PgStudents({teams}){
  const[srch,setSrch]=useState("");const[sel,setSel]=useState(null);
  const allStudents=[];
  teams.forEach(tm=>tm.students.forEach((st,j)=>allStudents.push(mkStudentDetail(st,tm,allStudents.length))));
  const srchLow=srch.toLowerCase();
  const filtered=srch.trim()?allStudents.filter(st=>st.name.toLowerCase().includes(srchLow)):allStudents;
  if(sel){
    return(
      <div style={{animation:"fadeUp 0.4s ease"}}>
        <button onClick={()=>setSel(null)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 12px",borderRadius:8,border:`1px solid ${s.border}`,background:"#fff",color:s.txt2,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginBottom:18}}>← Back</button>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
          <div style={{width:52,height:52,borderRadius:13,background:s.accentD,color:s.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,fontFamily:"'Space Mono',monospace"}}>{sel.name[0]}</div>
          <div><div style={{fontSize:22,fontWeight:700,letterSpacing:"-0.01em"}}>{sel.name}</div><div style={{fontSize:13,color:s.txt2,marginTop:2}}>{sel.team.name} · <Badge color={RC[ROLES.STUDENT]}>Student</Badge></div></div>
          <div style={{marginLeft:"auto"}}><Badge color={sel.checkedIn?s.ok:s.warn}>{sel.checkedIn?"Checked In":"Not Checked In"}</Badge></div>
        </div>
        <div style={{display:"grid",gap:10}}>
          <Card style={{padding:16}}>
            <div style={{fontSize:11,fontWeight:700,color:s.txtM,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>Contact</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><div style={{fontSize:10,color:s.txtM,fontWeight:700,marginBottom:2}}>Phone</div><div style={{fontSize:13,fontWeight:600}}>{sel.phone}</div></div>
              <div><div style={{fontSize:10,color:s.txtM,fontWeight:700,marginBottom:2}}>Email</div><div style={{fontSize:13,fontWeight:600}}>{sel.email}</div></div>
            </div>
          </Card>
          <Card style={{padding:16}}>
            <div style={{fontSize:11,fontWeight:700,color:s.txtM,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>Room & Team</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><div style={{fontSize:10,color:s.txtM,fontWeight:700,marginBottom:2}}>Dorm Room</div><div style={{fontSize:13,fontWeight:600,fontFamily:"'Space Mono',monospace",color:s.accent}}>{sel.room}</div><div style={{fontSize:11,color:s.txt2}}>{sel.floor}</div></div>
              <div><div style={{fontSize:10,color:s.txtM,fontWeight:700,marginBottom:2}}>Work Room</div><div style={{fontSize:13,fontWeight:600}}>{sel.team.workRoom}</div><div style={{fontSize:11,color:s.txt2}}>{sel.team.name}</div></div>
            </div>
          </Card>
          <Card style={{padding:16}}>
            <div style={{fontSize:11,fontWeight:700,color:s.txtM,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>Logistics</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><div style={{fontSize:10,color:s.txtM,fontWeight:700,marginBottom:2}}>Transport</div><div style={{fontSize:13,fontWeight:600}}>{sel.transport}</div></div>
              <div><div style={{fontSize:10,color:s.txtM,fontWeight:700,marginBottom:2}}>Insurance</div><div style={{fontSize:13,fontWeight:600}}>{sel.insurance}</div></div>
            </div>
          </Card>
          <Card style={{padding:16}}>
            <div style={{fontSize:11,fontWeight:700,color:s.txtM,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>Emergency Contact</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              <div><div style={{fontSize:10,color:s.txtM,fontWeight:700,marginBottom:2}}>Name</div><div style={{fontSize:13,fontWeight:600}}>{sel.emergencyName}</div></div>
              <div><div style={{fontSize:10,color:s.txtM,fontWeight:700,marginBottom:2}}>Relationship</div><div style={{fontSize:13,fontWeight:600}}>{sel.emergencyRel}</div></div>
              <div><div style={{fontSize:10,color:s.txtM,fontWeight:700,marginBottom:2}}>Phone</div><div style={{fontSize:13,fontWeight:600}}>{sel.emergencyPhone}</div></div>
            </div>
          </Card>
        </div>
      </div>
    );
  }
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <h1 style={{fontSize:24,fontWeight:700,marginBottom:3}}>Students</h1><p style={{color:s.txt2,fontSize:13,marginBottom:16}}>All {allStudents.length} participants (admin view)</p>
      <div style={{position:"relative",marginBottom:16}}><div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:s.txtM}}><I.Srch/></div>
        <input value={srch} onChange={e=>setSrch(e.target.value)} placeholder="Search by student name…" style={{width:"100%",padding:"10px 12px 10px 36px",background:"#fff",border:`1px solid ${s.border}`,borderRadius:10,color:s.txt,fontSize:13,fontFamily:"inherit",boxShadow:s.sh}} onFocus={e=>e.target.style.borderColor=s.accent} onBlur={e=>e.target.style.borderColor=s.border}/>
      </div>
      <div style={{display:"grid",gap:4}}>
        {filtered.map((st,i)=>(
          <button key={st.id} onClick={()=>setSel(st)} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:9,border:`1px solid ${s.border}`,background:"#fff",cursor:"pointer",fontFamily:"inherit",textAlign:"left",color:s.txt,boxShadow:s.sh}} onMouseEnter={e=>e.currentTarget.style.boxShadow=s.shL} onMouseLeave={e=>e.currentTarget.style.boxShadow=s.sh}>
            <div style={{width:32,height:32,borderRadius:8,background:s.accentD,color:s.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0}}>{st.name[0]}</div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{st.name}</div><div style={{fontSize:11.5,color:s.txt2}}>{st.team.name}</div></div>
            <Badge color={st.checkedIn?s.ok:s.warn}>{st.checkedIn?"In":"—"}</Badge>
            <span style={{color:s.txtM}}><I.Rt/></span>
          </button>
        ))}
      </div>
    </div>
  );
}

