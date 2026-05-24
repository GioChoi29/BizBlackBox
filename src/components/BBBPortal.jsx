'use client';

import { useState, useEffect, useRef } from "react";
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
  bg:"#ffffff",surf:"#fafafb",surfHov:"#f1f1f4",
  border:"#ececef",borderLt:"#f2f2f5",
  txt:"#14161d",txt2:"#5c6273",txtM:"#9298B2",
  accent:"#6c5ce7",accentBright:"#8472f2",accentD:"rgba(108,92,231,0.07)",
  ok:"#0DA678",okD:"rgba(13,166,120,0.07)",
  warn:"#D97706",warnD:"rgba(217,119,6,0.07)",
  err:"#E04555",errD:"rgba(224,69,85,0.07)",
  info:"#3B82F6",infoD:"rgba(59,130,246,0.07)",
  sh:"0 1px 3px rgba(20,22,29,0.06),0 1px 2px rgba(20,22,29,0.03)",
  shL:"0 4px 16px rgba(20,22,29,0.08)",
};
const TC = {
  transport:{dot:s.accent,label:"Transport"},
  logistics:{dot:s.txtM,label:"Logistics"},
  ceremony:{dot:s.accent,label:"Ceremony"},
  competition:{dot:s.accent,label:"Competition"},
  break:{dot:"#afafbf",label:"Break"},
  mentoring:{dot:s.accent,label:"Mentoring"},
};

function CubeBg({color,style:st}){
  const ref=useRef(null);
  useEffect(()=>{
    if(!ref.current)return;
    const NS="http://www.w3.org/2000/svg";
    const svg=document.createElementNS(NS,"svg");
    svg.setAttribute("viewBox","-200 -200 400 400");
    svg.style.width="100%";svg.style.height="100%";
    const N=22,half=150,depthLayers=22;
    for(let d=0;d<depthLayers;d++){
      const dz=d/(depthLayers-1),persp=0.55+dz*0.45,span=half*persp,shift=(1-dz)*40;
      for(let i=0;i<N;i++)for(let j=0;j<N;j++){
        const onRing=(i===0||j===0||i===N-1||j===N-1),isFace=(d===0||d===depthLayers-1);
        if(!onRing&&!isFace)continue;
        const x=((i/(N-1))*2-1)*span-shift,y=((j/(N-1))*2-1)*span-shift;
        const c=document.createElementNS(NS,"circle");
        c.setAttribute("cx",x.toFixed(1));c.setAttribute("cy",y.toFixed(1));
        c.setAttribute("r",(0.7+dz*1.3).toFixed(2));
        c.setAttribute("fill",color);c.setAttribute("opacity",(0.15+dz*0.6).toFixed(2));
        svg.appendChild(c);
      }
    }
    ref.current.innerHTML="";ref.current.appendChild(svg);
  },[color]);
  return <div ref={ref} style={st}/>;
}

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
  <div style={{background:"#fafafb",border:"1px solid #ececef",borderRadius:18,transition:"transform 0.16s,box-shadow 0.16s",...st}}
    onMouseEnter={hover?e=>{e.currentTarget.style.transform=hover==="x"?"translateX(3px)":"translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(20,22,29,0.07)";}:undefined}
    onMouseLeave={hover?e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}:undefined}>{children}</div>
);
const Pill=({children,color=s.accent,active,onClick,style:st})=>(
  <button onClick={onClick} style={{padding:"8px 18px",borderRadius:12,border:`1.5px solid ${active?color:s.border}`,background:active?"#efedfb":"#fff",color:active?color:s.txt2,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit",transition:"all 0.13s",...st}}>{children}</button>
);
const Badge=({children,color})=>(
  <span style={{fontFamily:"'JetBrains Mono',monospace",display:"inline-block",padding:"2px 8px",borderRadius:6,background:`${color}12`,color,fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em"}}>{children}</span>
);
const PageHeader=({eyebrow,children,mb=40})=>(
  <div style={{marginBottom:mb}}>
    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:"0.2em",textTransform:"uppercase",color:s.accent,fontWeight:500,marginBottom:14}}>{eyebrow}</div>
    <h1 style={{fontFamily:"'Archivo',sans-serif",fontWeight:800,fontSize:44,lineHeight:1,letterSpacing:"-0.035em",color:"#0d0f16"}}>{children}</h1>
  </div>
);
const MonoTag=({children,style:st})=>(
  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:700,color:s.accent,...st}}>{children}</span>
);
const SearchInput=({value,onChange,placeholder})=>(
  <div style={{display:"flex",alignItems:"center",gap:12,background:"#fafafb",border:`1px solid ${s.border}`,borderRadius:12,padding:"16px 20px",marginBottom:26,transition:"border-color 0.14s,box-shadow 0.14s"}}
    onFocusCapture={e=>{ e.currentTarget.style.borderColor=s.accent; e.currentTarget.style.boxShadow="0 0 0 3px rgba(108,92,231,0.12)"; }}
    onBlurCapture={e=>{ e.currentTarget.style.borderColor=s.border; e.currentTarget.style.boxShadow="none"; }}>
    <I.Srch style={{color:s.txtM,flexShrink:0}}/>
    <input value={value} onChange={onChange} placeholder={placeholder}
      style={{border:"none",outline:"none",background:"transparent",fontFamily:"'Archivo',sans-serif",fontSize:15,color:s.txt,width:"100%"}}/>
  </div>
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
    <div style={{borderRadius:18,padding:"28px 32px",background:"linear-gradient(135deg,#16181f,#20232e)",color:"#fff",position:"relative",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:40,height:40,borderRadius:11,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center"}}><I.Timer style={{color:"#fff"}}/></div>
        <div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:500,color:"#fff"}}>Submission Closed</div>
          <div style={{fontSize:14,color:"#fff",opacity:0.55,marginTop:3}}>The deadline has passed. Good luck!</div>
        </div>
      </div>
    </div>
  );
  return(
    <div style={{borderRadius:18,padding:"28px 32px",background:"linear-gradient(135deg,#16181f,#20232e)",position:"relative",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:22,position:"relative",zIndex:1}}>
        <div style={{width:40,height:40,borderRadius:11,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,color:"#fff"}}><I.Timer style={{color:"#fff"}}/></div>
        <div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:500,color:"#fff"}}>Submission Deadline</div>
          <div style={{fontSize:14,color:"#fff",opacity:0.55,marginTop:3}}>Aug 2, 2026 · 10:00 AM KST</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,position:"relative",zIndex:1}}>
        {[{l:"Days",v:left.d},{l:"Hrs",v:left.h},{l:"Min",v:left.m},{l:"Sec",v:left.s}].map(u=>(
          <div key={u.l} style={{borderRadius:12,padding:"20px 14px",textAlign:"center",background:"rgba(255,255,255,0.06)"}}>
            <div style={{fontWeight:800,fontSize:44,lineHeight:1,fontFeatureSettings:'"tnum"',letterSpacing:"-0.02em",color:"#fff"}}>{String(u.v).padStart(2,"0")}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",marginTop:9,color:"#fff",opacity:0.5}}>{u.l}</div>
          </div>
        ))}
      </div>
    </div>
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
    <div style={{minHeight:"100vh",background:"#fff",color:s.txt,fontFamily:"'Archivo',sans-serif",display:"flex"}}>
      {/* Sidebar */}
      <div className="sb" style={{width:270,height:"100vh",position:"fixed",left:0,top:0,background:"#fbfbfc",borderRight:"1px solid #ebebee",display:"flex",flexDirection:"column",padding:"28px 20px",zIndex:100,overflowY:"auto"}}>
        {/* Brand */}
        <div style={{display:"flex",alignItems:"center",gap:13,padding:"0 10px 26px"}}>
          <div style={{width:44,height:44,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:9,lineHeight:0.9,border:"2px solid #14161d",color:"#14161d",borderRadius:10,transform:"rotate(-3deg)",fontFamily:"'Archivo',sans-serif"}}>BLK<br/>BOX</div>
          <div><div style={{fontWeight:800,fontSize:17,letterSpacing:"-0.01em",color:"#14161d"}}>BBB 2026</div><div style={{fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:"#14161d",opacity:0.42,marginTop:3}}>Competition</div></div>
        </div>
        {/* User chip */}
        <div style={{display:"flex",alignItems:"center",gap:12,padding:13,borderRadius:12,marginBottom:24,background:"#f1f1f4"}}>
          <div style={{width:38,height:38,borderRadius:10,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,background:"linear-gradient(135deg,#6c5ce7,#8472f2)",color:"#fff"}}>{user.name[0]}</div>
          <div><div style={{fontWeight:700,fontSize:14,color:"#14161d"}}>{user.name}</div><div style={{fontSize:10,letterSpacing:"0.13em",textTransform:"uppercase",color:s.accent,fontWeight:700,marginTop:2}}>{RL[user.role]}</div></div>
        </div>
        {/* Nav */}
        <nav style={{display:"flex",flexDirection:"column",gap:3,flex:1}}>
          {nav.map(n=>{const a=tab===n.id;const Ic=n.icon;return(
            <button key={n.id} onClick={()=>setTab(n.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:13,padding:"11px 14px",borderRadius:12,border:"none",background:a?"#efedfb":"transparent",color:a?"#14161d":s.txt2,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"all 0.13s"}}
              onMouseEnter={e=>{if(!a)e.currentTarget.style.background="#f1f1f4";}}
              onMouseLeave={e=>{if(!a)e.currentTarget.style.background="transparent";}}>
              <span style={{width:18,textAlign:"center",color:a?s.accent:"currentColor",opacity:a?1:0.7}}><Ic/></span>
              {n.label}
            </button>
          );})}
        </nav>
        {/* Logout */}
        <button onClick={()=>setUser(null)} style={{display:"flex",alignItems:"center",gap:13,padding:14,border:"none",background:"transparent",color:s.txt2,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit",opacity:0.7}}
          onMouseEnter={e=>{e.currentTarget.style.opacity=1;e.currentTarget.style.color=s.err;}}
          onMouseLeave={e=>{e.currentTarget.style.opacity=0.7;e.currentTarget.style.color=s.txt2;}}>
          <I.Out/>Log Out
        </button>
      </div>

      {/* Main content */}
      <div className="mw" style={{marginLeft:270,flex:1,minHeight:"100vh",position:"relative"}}>
        {/* Cube background (home page only — shown globally but subtle) */}
        <CubeBg color="#6c5ce7" style={{position:"absolute",top:-40,right:-90,width:460,height:460,zIndex:0,opacity:0.12,pointerEvents:"none"}}/>
        <div style={{position:"absolute",width:440,height:440,top:-190,right:-90,borderRadius:"50%",filter:"blur(100px)",background:"rgba(108,92,231,0.08)",zIndex:0,pointerEvents:"none"}}/>
        <div style={{position:"relative",zIndex:2,maxWidth:900,margin:"0 auto",padding:"50px 60px 100px"}}>{pages[tab]}</div>
      </div>
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
  const statCards=[
    {l:"Teams",v:"20",accent:false},
    {l:"Participants",v:String(tot),accent:false},
    ...(isAd?[{l:"Checked In",v:`${chkd}/${tot}`,accent:true}]:[]),
    ...(myTm?[{l:"Team Check-in",v:`${myTm.students.filter(st=>st.checkedIn).length}/${myTm.students.length}`,accent:true}]:[]),
  ];
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      {/* Page header */}
      <div style={{marginBottom:40}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:"0.2em",textTransform:"uppercase",color:s.accent,fontWeight:500,marginBottom:14}}>
          {RL[user.role]} Dashboard
        </div>
        <h1 style={{fontFamily:"'Archivo',sans-serif",fontWeight:800,fontSize:52,lineHeight:0.95,letterSpacing:"-0.035em",color:"#0d0f16"}}>
          Welcome back, <em style={{fontFamily:"'Fraunces',serif",fontStyle:"italic",fontWeight:400,letterSpacing:"-0.01em",color:s.accent}}>{user.name}</em>
        </h1>
      </div>

      {/* Countdown */}
      <div style={{marginBottom:26}}><CountdownWidget/></div>

      {/* Stat cards */}
      <div style={{display:"grid",gridTemplateColumns:`repeat(${statCards.length},1fr)`,gap:16,marginBottom:42}}>
        {statCards.map((x,i)=>(
          <div key={i} style={{
            borderRadius:18,padding:"26px 28px",
            background:x.accent?"linear-gradient(135deg,#efedfb,#f6f5fe)":"#fafafb",
            border:`1px solid ${x.accent?"#e0dbf8":"#ececef"}`,
            transition:"transform 0.18s,box-shadow 0.18s",
          }}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 10px 26px rgba(20,23,31,0.07)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",opacity:0.5,marginBottom:14,fontWeight:500,color:s.txt}}>{x.l}</div>
            <div style={{fontWeight:800,fontSize:40,lineHeight:1,letterSpacing:"-0.02em",color:x.accent?s.accent:"#0d0f16"}}>{x.v}</div>
          </div>
        ))}
      </div>

      {/* Quick action pills */}
      <div style={{display:"flex",flexWrap:"wrap",gap:12,marginBottom:46}}>
        <button onClick={()=>setTab("schedule")} style={{fontWeight:700,fontSize:13,letterSpacing:"0.02em",padding:"13px 24px",borderRadius:100,cursor:"pointer",border:"none",background:s.accent,color:"#fff",transition:"all 0.14s"}}
          onMouseEnter={e=>{e.currentTarget.style.background=s.accentBright;e.currentTarget.style.transform="translateY(-1px)";}}
          onMouseLeave={e=>{e.currentTarget.style.background=s.accent;e.currentTarget.style.transform="";}}>
          Schedule
        </button>
        {[{l:"Transport",t:"transport"},{l:"Ask a Question",t:"qna"},{l:"Contacts",t:"contacts"}].map((a,i)=>(
          <button key={i} onClick={()=>setTab(a.t)} style={{fontWeight:700,fontSize:13,letterSpacing:"0.02em",padding:"13px 24px",borderRadius:100,cursor:"pointer",border:"1px solid #dadade",background:"#fff",color:s.txt,transition:"all 0.14s"}}
            onMouseEnter={e=>e.currentTarget.style.background="#f5f5f6"}
            onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
            {a.l}
          </button>
        ))}
      </div>

      {/* Announcements */}
      <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:20}}>
        <div style={{fontFamily:"'Fraunces',serif",fontWeight:600,fontSize:26,letterSpacing:"-0.01em",color:"#0d0f16"}}>Announcements</div>
        <button onClick={()=>setTab("announcements")} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:500,color:s.accent,background:"none",border:"none",cursor:"pointer"}}>View All →</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {ann.slice(0,2).map(a=>(
          <div key={a.id} style={{borderRadius:18,padding:"22px 26px",position:"relative",background:"#fafafb",border:"1px solid #ececef",transition:"transform 0.16s",cursor:"default"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateX(3px)"}
            onMouseLeave={e=>e.currentTarget.style.transform=""}>
            {a.pinned&&<div style={{position:"absolute",left:0,top:22,bottom:22,width:3,borderRadius:3,background:s.accent}}/>}
            <div style={{marginBottom:6}}>
              {a.pinned&&<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:700,color:s.accent,marginRight:12}}>Pinned</span>}
              <span style={{fontWeight:700,fontSize:16,color:s.txt}}>{a.title}</span>
            </div>
            <p style={{fontSize:14,lineHeight:1.55,color:s.txt,opacity:0.6}}>{a.body}</p>
          </div>
        ))}
      </div>

      {/* My Team (non-admin) */}
      {myTm&&(
        <div style={{marginTop:26,borderRadius:18,padding:"22px 26px",background:"#fafafb",border:"1px solid #ececef"}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:s.accent,fontWeight:500,marginBottom:14}}>My Team</div>
          <div style={{fontWeight:800,fontSize:22,letterSpacing:"-0.02em",marginBottom:16,color:"#0d0f16"}}>{myTm.name}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:s.txt2,opacity:0.6,marginBottom:4}}>Junior Mentor</div><div style={{fontSize:14,fontWeight:600,color:s.txt}}>{myTm.jm}</div><div style={{fontSize:12,color:s.txt2,marginTop:2}}>{myTm.jmPhone}</div></div>
            <div><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:s.txt2,opacity:0.6,marginBottom:4}}>Work Room</div><div style={{fontSize:14,fontWeight:600,color:s.txt}}>{myTm.workRoom}</div></div>
          </div>
        </div>
      )}
    </div>
  );
}

function PgSchedule({user,teams}){
  const[day,setDay]=useState(1);const[prelim,setPrelim]=useState(false);
  const items=SCHED.filter(x=>x.day===day);const myP=user.team?PRELIM.find(p=>p.teams.includes(user.team)):null;
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <PageHeader eyebrow="Event Timeline">Competition Schedule</PageHeader>
      <div style={{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"}}>
        {[1,2].map(d=><Pill key={d} active={day===d&&!prelim} onClick={()=>{setDay(d);setPrelim(false)}}>Day {d}</Pill>)}
        <Pill active={prelim} onClick={()=>setPrelim(!prelim)}>Prelim Slots</Pill>
      </div>
      {prelim?(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {myP&&(
            <div style={{borderRadius:18,padding:"18px 24px",background:"#efedfb",border:"1.5px solid #e0dbf8",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:s.accent,borderRadius:"3px 0 0 3px"}}/>
              <MonoTag style={{marginBottom:8,display:"block"}}>Your Prelim Slot</MonoTag>
              <div style={{fontSize:18,fontWeight:800,letterSpacing:"-0.02em",color:"#0d0f16"}}>{myP.time}</div>
              <div style={{fontSize:13,color:s.txt2,marginTop:4}}>{myP.room}</div>
            </div>
          )}
          {PRELIM.map((sl,i)=>(
            <Card key={i} style={{padding:"18px 22px",border:sl.teams.includes(user.team)?"1.5px solid #e0dbf8":undefined}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:700,color:s.accent}}>{sl.time}</span>
                <MonoTag>{sl.room}</MonoTag>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {sl.teams.map(tid=>{const tm=teams.find(x=>x.id===tid);const mine=tid===user.team;return(
                  <span key={tid} style={{padding:"4px 10px",borderRadius:8,background:mine?"#efedfb":"#fff",color:mine?s.accent:s.txt2,fontSize:12,fontWeight:mine?700:500,border:`1px solid ${mine?"#e0dbf8":s.border}`}}>{tm?.name}</span>
                );})}
              </div>
            </Card>
          ))}
        </div>
      ):(
        <div style={{position:"relative",paddingLeft:28}}>
          <div style={{position:"absolute",left:5,top:14,bottom:14,width:2,background:"#e9e6f7",borderRadius:1}}/>
          {items.map((it,i)=>{const tc=TC[it.type]||TC.logistics;return(
            <div key={i} style={{position:"relative",marginBottom:14,animation:`slideIn 0.3s ease ${i*0.03}s both`}}>
              <div style={{position:"absolute",left:-27,top:"50%",transform:"translateY(-50%)",width:12,height:12,borderRadius:"50%",background:"#fff",border:`3px solid ${s.accent}`}}/>
              <div style={{display:"flex",alignItems:"center",gap:18,background:"#fafafb",border:"1px solid #ececef",borderRadius:14,padding:"13px 20px",transition:"transform 0.16s,box-shadow 0.16s",cursor:"default"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateX(3px)";e.currentTarget.style.boxShadow="0 8px 22px rgba(20,23,31,0.05)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:12,color:s.accent,flexShrink:0,width:46}}>{it.time}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14,color:"#0d0f16",marginBottom:3}}>{it.ev}</div>
                  <div style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:s.txt2}}><I.Pin/>{it.loc}</div>
                </div>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:700,color:s.accent,flexShrink:0}}>{tc.label}</span>
              </div>
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
      <PageHeader eyebrow="Participants">Teams &amp; Mentors</PageHeader>
      <SearchInput value={srch} onChange={e=>setSrch(e.target.value)} placeholder="Search teams or mentors…"/>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {filt.map(tm=>{const open=exp===tm.id;const mine=tm.id===user.team;return(
          <div key={tm.id} style={{borderRadius:18,background:"#fafafb",border:`1px solid ${mine?"#e0dbf8":"#ececef"}`,overflow:"hidden"}}>
            <button onClick={()=>setExp(open?null:tm.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"13px 18px",border:"none",background:"transparent",color:s.txt,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
              <div style={{width:32,height:32,borderRadius:8,background:mine?"#efedfb":"#f1f1f4",color:mine?s.accent:s.txt2,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,flexShrink:0}}>{tm.id}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:700,color:"#0d0f16"}}>{tm.name}</div>
                <div style={{fontSize:12,color:s.txt2,marginTop:2}}>Mentor: {tm.jm} · <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11}}>{tm.workRoom}</span></div>
              </div>
              {mine&&<MonoTag>My Team</MonoTag>}
              <span style={{transform:open?"rotate(90deg)":"rotate(0deg)",transition:"transform 0.2s",color:s.txtM}}><I.Rt/></span>
            </button>
            {open&&(
              <div style={{padding:"0 22px 18px",animation:"fadeUp 0.2s ease"}}>
                <div style={{borderTop:"1px solid #ececef",paddingTop:14}}>
                  <MonoTag style={{display:"block",marginBottom:10,color:s.txt2}}>Students ({tm.students.length})</MonoTag>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:6}}>
                    {tm.students.map(st=>(
                      <div key={st.id} style={{padding:"7px 12px",borderRadius:10,background:"#fff",border:"1px solid #ececef",fontSize:13,color:s.txt2,display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:st.checkedIn?s.accent:s.border,flexShrink:0}}/>
                        {st.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );})}
      </div>
    </div>
  );
}

function PgTransport(){return(
  <div style={{animation:"fadeUp 0.4s ease"}}>
    <PageHeader eyebrow="Getting There">Transportation</PageHeader>
    {/* Main bus — dark hero card */}
    <div style={{borderRadius:18,padding:"28px 32px",background:"linear-gradient(135deg,#16181f,#20232e)",marginBottom:16,position:"relative",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:22}}>
        <div style={{width:42,height:42,borderRadius:11,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}><I.Bus/></div>
        <div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:500,color:"#fff",opacity:0.7,marginBottom:4}}>Main Bus · Recommended</div>
          <div style={{fontWeight:800,fontSize:36,letterSpacing:"-0.02em",color:"#fff",lineHeight:1}}>08:00 AM</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        {[{l:"Pickup",v:"종합운동장역",sub:"Sports Complex Station"},{l:"Capacity",v:"4 buses",sub:"Arrive 10 min early"}].map((it,i)=>(
          <div key={i} style={{borderRadius:12,padding:"16px 18px",background:"rgba(255,255,255,0.06)"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:"#fff",opacity:0.5,marginBottom:6}}>{it.l}</div>
            <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>{it.v}</div>
            <div style={{fontSize:12,color:"#fff",opacity:0.5,marginTop:3}}>{it.sub}</div>
          </div>
        ))}
      </div>
      <div style={{borderRadius:10,padding:"11px 16px",background:"rgba(108,92,231,0.18)",fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:"0.06em",color:"#cdc6f5"}}>
        ⚠ Please arrive by 7:45 AM. Buses depart at 8:00 AM sharp.
      </div>
    </div>

    {/* Backup options */}
    <Card style={{padding:"20px 24px",marginBottom:12}}>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:700,color:s.accent,marginBottom:16}}>Backup Options — If Late</div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[{r:"광역버스 7001",t:"08:15 AM",n:"If you miss the main bus"},{r:"광역버스 7001",t:"08:45 AM",n:"Last backup option"}].map((b,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:16,padding:"14px 16px",borderRadius:12,background:"#fff",border:"1px solid #ececef"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateX(3px)"}
            onMouseLeave={e=>e.currentTarget.style.transform=""}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:700,color:s.accent,minWidth:64}}>{b.t}</div>
            <div><div style={{fontSize:14,fontWeight:600,color:"#0d0f16"}}>{b.r}</div><div style={{fontSize:12,color:s.txt2,marginTop:2}}>{b.n}</div></div>
          </div>
        ))}
      </div>
    </Card>

    {/* Personal vehicle */}
    <Card style={{padding:"20px 24px"}}>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:700,color:s.accent,marginBottom:10}}>Personal Vehicle</div>
      <div style={{fontSize:17,fontWeight:700,color:"#0d0f16",marginBottom:6}}>Self-Drive</div>
      <p style={{fontSize:14,color:s.txt2,lineHeight:1.6}}>If arriving by personal vehicle, use the venue's main entrance parking lot.</p>
    </Card>
  </div>
);}

function PgVenue(){
  const floors=[{label:"1F — Ground Floor",key:"1F"},{label:"2F — Team Rooms",key:"2F"},{label:"3F — Dormitory",key:"3F"}];
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <PageHeader eyebrow="Room Directory">Venue Map</PageHeader>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {floors.map((fl,fi)=>(
          <div key={fi}>
            <MonoTag style={{display:"block",marginBottom:12,color:s.txt2}}>{fl.label}</MonoTag>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
              {VENUE.filter(r=>r.floor===fl.key).map((r,ri)=>(
                <div key={ri} style={{borderRadius:14,padding:"16px 18px",background:"#fafafb",border:"1px solid #ececef",transition:"transform 0.16s"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateX(3px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform=""}>
                  <div style={{fontSize:14,fontWeight:700,color:"#0d0f16",marginBottom:5}}>{r.name}</div>
                  <div style={{fontSize:12,color:s.txt2,lineHeight:1.5}}>{r.purpose}</div>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.1em",color:s.accent,marginTop:8}}>Cap: {r.cap}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{marginTop:20,padding:"12px 16px",borderRadius:12,background:"#fafafb",border:"1px solid #ececef",fontSize:13,color:s.txt2}}>
        Admin Office (1F) is staff HQ &amp; Lost &amp; Found.
      </div>
    </div>
  );
}

function RoomHero({room,floor,label,icon}){
  return(
    <div style={{borderRadius:18,padding:"32px",background:"linear-gradient(135deg,#efedfb,#f6f5fe)",border:"1.5px solid #e0dbf8",textAlign:"center",marginBottom:14}}>
      <div style={{width:56,height:56,borderRadius:14,background:"#fff",color:s.accent,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:"0 2px 12px rgba(108,92,231,0.15)"}}>{icon}</div>
      <MonoTag style={{display:"block",marginBottom:10,color:s.txt2}}>{label}</MonoTag>
      <div style={{fontWeight:800,fontSize:36,letterSpacing:"-0.02em",color:s.accent,lineHeight:1}}>{room||"TBA"}</div>
      {floor&&<div style={{fontSize:13,color:s.txt2,marginTop:8}}>Floor: {floor}</div>}
    </div>
  );
}
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
        <PageHeader eyebrow="Dormitory">Room Assignments</PageHeader>
        <SearchInput value={roomSrch} onChange={e=>setRoomSrch(e.target.value)} placeholder="Search by student or mentor name…"/>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {filtSorted.map(([room,ppl])=>{
            const srchLow2=roomSrch.toLowerCase();
            return(
              <div key={room} style={{borderRadius:18,padding:"18px 22px",background:"#fafafb",border:"1px solid #ececef"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:700,color:s.accent}}>{room}</span>
                  <MonoTag>{ppl.length} people</MonoTag>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {ppl.map((p,i)=>{const isMatch=roomSrch.trim()&&p.name.toLowerCase().includes(srchLow2);return(
                    <span key={i} style={{padding:"5px 10px",borderRadius:8,background:isMatch?"#efedfb":p.isMentor?"rgba(108,92,231,0.06)":"#fff",color:isMatch?s.accent:p.isMentor?s.accent:s.txt2,fontSize:12,fontWeight:isMatch||p.isMentor?600:400,border:`1px solid ${isMatch?"#e0dbf8":"#ececef"}`}}>
                      {p.name} <span style={{fontSize:10,opacity:0.6}}>({p.team})</span>
                    </span>
                  );})}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  if(user.role===ROLES.STUDENT){
    const myRoom=RM[user.name];
    return(
      <div style={{animation:"fadeUp 0.4s ease"}}>
        <PageHeader eyebrow="Dormitory">My Room</PageHeader>
        <RoomHero room={myRoom?.room} floor={myRoom?.floor} label="Your Dorm Room" icon={<I.Bed/>}/>
        {myTm&&<Card style={{padding:"18px 22px"}}><MonoTag style={{display:"block",marginBottom:8,color:s.txt2}}>Team Work Room</MonoTag><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:18,fontWeight:700,color:"#0d0f16"}}>{myTm.workRoom}</div><div style={{fontSize:12,color:s.txt2,marginTop:4}}>{myTm.name}</div></Card>}
      </div>
    );
  }
  if(user.role===ROLES.JM){
    const myRoom=RM[user.name]||(myTm?RM[myTm.jm]:null);
    return(
      <div style={{animation:"fadeUp 0.4s ease"}}>
        <PageHeader eyebrow="Dormitory">My Room</PageHeader>
        <RoomHero room={myRoom?.room} floor={myRoom?.floor} label="Your Dorm Room" icon={<I.Bed/>}/>
        {myTm&&<Card style={{padding:"18px 22px"}}><MonoTag style={{display:"block",marginBottom:8,color:s.txt2}}>Team Work Room</MonoTag><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:18,fontWeight:700,color:"#0d0f16"}}>{myTm.workRoom}</div><div style={{fontSize:12,color:s.txt2,marginTop:4}}>{myTm.name}</div></Card>}
      </div>
    );
  }
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <PageHeader eyebrow="Dormitory">My Room</PageHeader>
      <Card style={{padding:"24px",textAlign:"center"}}><p style={{fontSize:14,color:s.txt2}}>Room assignments for senior mentors will be shared separately. Please check with Admin.</p></Card>
    </div>
  );
}

function CheckinList({team,onChk,canToggle}){
  const cnt=team.students.filter(st=>st.checkedIn).length;
  return(
    <div style={{borderRadius:14,padding:"16px 18px",background:"#fafafb",border:"1px solid #ececef"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div style={{fontWeight:700,fontSize:14,color:"#0d0f16"}}>{team.name}</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:700,color:cnt===team.students.length?s.accent:s.txt2}}>{cnt}/{team.students.length}</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        {team.students.map(st=>(
          <button key={st.id} onClick={canToggle?()=>onChk(team.id,st.id):undefined}
            style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:9,border:`1px solid ${st.checkedIn?"#e0dbf8":"#ececef"}`,background:st.checkedIn?"#efedfb":"#fff",cursor:canToggle?"pointer":"default",fontFamily:"inherit",textAlign:"left",color:s.txt,transition:"border-color 0.13s"}}>
            <div style={{width:17,height:17,borderRadius:4,border:`2px solid ${st.checkedIn?s.accent:s.border}`,background:st.checkedIn?s.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.13s"}}>
              {st.checkedIn&&<span style={{color:"#fff",fontSize:9,fontWeight:800}}>✓</span>}
            </div>
            <span style={{fontSize:12,fontWeight:st.checkedIn?600:400,color:st.checkedIn?"#0d0f16":s.txt2}}>{st.name}</span>
            {st.checkedIn&&<MonoTag style={{marginLeft:"auto"}}>In</MonoTag>}
          </button>
        ))}
      </div>
    </div>
  );
}

function PgCheckin({user,teams,onChk}){
  const[sel,setSel]=useState(user.team||1);
  const myTm=user.team?teams.find(x=>x.id===user.team):null;
  if(user.role===ROLES.ADMIN||user.role===ROLES.SM){
    const team=teams.find(x=>x.id===sel);const gc=teams.reduce((a,x)=>a+x.students.filter(st=>st.checkedIn).length,0);const gt=teams.reduce((a,x)=>a+x.students.length,0);
    return(
      <div style={{animation:"fadeUp 0.4s ease"}}>
        <PageHeader eyebrow="Attendance">Check-in</PageHeader>
        <div style={{borderRadius:18,padding:"28px 32px",background:"linear-gradient(135deg,#16181f,#20232e)",marginBottom:24,position:"relative",overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div style={{borderRadius:12,padding:"20px 18px",background:"rgba(255,255,255,0.06)"}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:"#fff",opacity:0.5,marginBottom:10}}>Total Checked In</div>
              <div style={{fontWeight:800,fontSize:44,lineHeight:1,letterSpacing:"-0.02em",color:"#fff"}}>{gc}/{gt}</div>
            </div>
            <div style={{borderRadius:12,padding:"20px 18px",background:"rgba(255,255,255,0.06)"}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:"#fff",opacity:0.5,marginBottom:10}}>Teams Complete</div>
              <div style={{fontWeight:800,fontSize:44,lineHeight:1,letterSpacing:"-0.02em",color:"#fff"}}>{teams.filter(tm=>tm.students.every(st=>st.checkedIn)).length}/20</div>
            </div>
          </div>
        </div>
        <div style={{marginBottom:16}}>
          <select value={sel} onChange={e=>setSel(parseInt(e.target.value))} style={{width:"100%",maxWidth:280,padding:"12px 14px",background:"#fff",border:`1px solid ${s.border}`,borderRadius:12,color:s.txt,fontSize:13,fontFamily:"inherit",cursor:"pointer"}}>
            {teams.map(tm=><option key={tm.id} value={tm.id}>{tm.name} ({tm.students.filter(st=>st.checkedIn).length}/{tm.students.length})</option>)}
          </select>
        </div>
        {team&&<CheckinList team={team} onChk={onChk} canToggle/>}
      </div>
    );
  }
  if(user.role===ROLES.JM&&myTm){
    return(
      <div style={{animation:"fadeUp 0.4s ease"}}>
        <PageHeader eyebrow="Attendance">Team Check-in</PageHeader>
        <CheckinList team={myTm} onChk={onChk} canToggle/>
      </div>
    );
  }
  if(user.role===ROLES.STUDENT&&myTm){
    const me=myTm.students.find(st=>st.name===user.name);const cnt=myTm.students.filter(st=>st.checkedIn).length;
    return(
      <div style={{animation:"fadeUp 0.4s ease"}}>
        <PageHeader eyebrow="Attendance">Check-in</PageHeader>
        <div style={{borderRadius:18,padding:"28px 32px",marginBottom:16,background:me?.checkedIn?"linear-gradient(135deg,#efedfb,#f6f5fe)":"#fafafb",border:`1.5px solid ${me?.checkedIn?"#e0dbf8":"#ececef"}`,textAlign:"center",position:"relative",overflow:"hidden"}}>
          {me?.checkedIn&&<div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:s.accent,borderRadius:"3px 0 0 3px"}}/>}
          <MonoTag style={{display:"block",marginBottom:12,color:s.txt2}}>Your Status</MonoTag>
          <div style={{fontWeight:800,fontSize:32,letterSpacing:"-0.02em",color:me?.checkedIn?s.accent:"#0d0f16"}}>{me?.checkedIn?"Checked In":"Not Checked In"}</div>
        </div>
        <div style={{borderRadius:18,padding:"20px 22px",background:"#fafafb",border:"1px solid #ececef"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div style={{fontWeight:700,fontSize:15,color:"#0d0f16"}}>{myTm.name}</div>
            <MonoTag>{cnt}/{myTm.students.length} checked in</MonoTag>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {myTm.students.map(st=>(
              <div key={st.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,background:st.name===user.name?"#efedfb":"#fff",border:`1px solid ${st.name===user.name?"#e0dbf8":"#ececef"}`}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:st.checkedIn?s.accent:s.border,flexShrink:0}}/>
                <span style={{fontSize:13,fontWeight:st.name===user.name?700:400,color:st.name===user.name?"#0d0f16":s.txt2}}>{st.name}{st.name===user.name?" (You)":""}</span>
                {st.checkedIn&&<MonoTag style={{marginLeft:"auto"}}>In</MonoTag>}
              </div>
            ))}
          </div>
        </div>
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
      <PageHeader eyebrow="Questions & Answers">Q&amp;A</PageHeader>

      {unanswered>0&&(
        <div style={{borderRadius:14,padding:"12px 18px",background:"#fafafb",border:"1.5px solid #e0dbf8",marginBottom:20,display:"flex",alignItems:"center",gap:10}}>
          <div style={{position:"absolute"}}/>
          <div style={{width:3,height:36,background:s.accent,borderRadius:2,flexShrink:0}}/>
          <div style={{fontSize:13,fontWeight:600,color:"#0d0f16"}}>{unanswered} question{unanswered>1?"s":""} {canAns?"awaiting your answer":"awaiting answer"}</div>
        </div>
      )}

      {/* Ask form */}
      <div style={{borderRadius:18,padding:"22px 24px",background:"#fafafb",border:"1px solid #ececef",marginBottom:24}}>
        <MonoTag style={{display:"block",marginBottom:14,color:s.txt2}}>Ask a Question</MonoTag>
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Type your question…" onKeyDown={e=>e.key==="Enter"&&q.trim()&&(onAsk(q.trim(),qCat),setQ(""))}
            style={{flex:1,padding:"12px 14px",background:"#fff",border:`1px solid ${s.border}`,borderRadius:12,color:s.txt,fontSize:13,fontFamily:"inherit"}}
            onFocus={e=>e.target.style.borderColor=s.accent} onBlur={e=>e.target.style.borderColor=s.border}/>
          <select value={qCat} onChange={e=>setQCat(e.target.value)} style={{padding:"12px 12px",background:"#fff",border:`1px solid ${s.border}`,borderRadius:12,color:s.txt,fontSize:12,fontFamily:"inherit",cursor:"pointer"}}>
            {["logistics","rules","technical","general","other"].map(c=><option key={c} value={c}>{c[0].toUpperCase()+c.slice(1)}</option>)}
          </select>
          <button onClick={()=>{if(q.trim()){onAsk(q.trim(),qCat);setQ("")}}} style={{padding:"12px 20px",borderRadius:100,border:"none",background:s.accent,color:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:6,transition:"all 0.14s"}}
            onMouseEnter={e=>e.currentTarget.style.background=s.accentBright}
            onMouseLeave={e=>e.currentTarget.style.background=s.accent}>
            <I.Send/>Ask
          </button>
        </div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:s.txtM,letterSpacing:"0.1em"}}>All Q&amp;A visible to every participant</div>
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
        {[{id:"all",l:"All"},{id:"pending",l:`Pending (${items.filter(x=>!x.a).length})`},{id:"answered",l:"Answered"}].map(f=>(
          <Pill key={f.id} active={fil===f.id} onClick={()=>setFil(f.id)} style={{padding:"6px 14px",fontSize:12}}>{f.l}</Pill>
        ))}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
        {["all","logistics","rules","technical","general","other"].map(c=>(
          <Pill key={c} active={catFil===c} onClick={()=>setCatFil(c)} style={{padding:"5px 12px",fontSize:11}}>
            {c==="all"?"All":c[0].toUpperCase()+c.slice(1)}
          </Pill>
        ))}
      </div>

      {/* Q&A list */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {list.map(x=>(
          <div key={x.id} style={{borderRadius:18,padding:"20px 24px",background:"#fafafb",border:`1px solid ${x.a?"#ececef":"#e0dbf8"}`,position:"relative",transition:"transform 0.16s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateX(3px)"}
            onMouseLeave={e=>e.currentTarget.style.transform=""}>
            {!x.a&&<div style={{position:"absolute",left:0,top:20,bottom:20,width:3,borderRadius:3,background:s.accent}}/>}
            <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:x.a||canAns?12:0}}>
              <div style={{width:28,height:28,borderRadius:8,background:"#efedfb",color:s.accent,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,flexShrink:0}}>Q</div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:"#0d0f16",lineHeight:1.5}}>{x.q}</div>
                <div style={{fontSize:11,color:s.txt2,marginTop:5,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10}}>{x.by}{x.tm?` · Team ${x.tm}`:""} · {relTime(x.ts)}</span>
                  {x.category&&<MonoTag style={{color:s.txt2}}>{x.category}</MonoTag>}
                </div>
              </div>
              {!x.a&&<MonoTag>Pending</MonoTag>}
            </div>
            {x.a&&(
              <div style={{marginLeft:40,padding:"12px 16px",borderRadius:12,background:"#fff",border:"1px solid #ececef",position:"relative"}}>
                <div style={{position:"absolute",left:0,top:8,bottom:8,width:3,borderRadius:2,background:s.accent}}/>
                <MonoTag style={{display:"block",marginBottom:6,color:s.txt2}}>Answered by {x.aBy}</MonoTag>
                <div style={{fontSize:13,color:s.txt,lineHeight:1.6}}>{x.a}</div>
              </div>
            )}
            {!x.a&&canAns&&(
              <div style={{marginLeft:40,display:"flex",gap:8,marginTop:4}}>
                <input value={ans[x.id]||""} onChange={e=>setAns(p=>({...p,[x.id]:e.target.value}))} placeholder="Write your answer…"
                  style={{flex:1,padding:"10px 14px",background:"#fff",border:`1px solid ${s.border}`,borderRadius:10,color:s.txt,fontSize:13,fontFamily:"inherit"}}
                  onFocus={e=>e.target.style.borderColor=s.accent} onBlur={e=>e.target.style.borderColor=s.border}/>
                <button onClick={()=>{if(ans[x.id]?.trim()){onAns(x.id,ans[x.id].trim());setAns(p=>({...p,[x.id]:""}));}}}
                  style={{padding:"10px 18px",borderRadius:100,border:"none",background:s.accent,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Reply</button>
              </div>
            )}
          </div>
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
  const inputSt={width:"100%",padding:"12px 14px",background:"#fff",border:`1px solid ${s.border}`,borderRadius:12,color:s.txt,fontSize:13,fontFamily:"inherit",marginBottom:10};
  const renderAnn=(a)=>{
    if(isAd&&editMap[a.id]){
      const v=editVals[a.id]||{ti:a.title,bo:a.body};
      return(
        <div key={a.id} style={{borderRadius:18,padding:"20px 24px",background:"#fafafb",border:"1px solid #ececef",marginBottom:10}}>
          <input value={v.ti} onChange={e=>setEditVals(p=>({...p,[a.id]:{...p[a.id],ti:e.target.value}}))} style={inputSt} onFocus={e=>e.target.style.borderColor=s.accent} onBlur={e=>e.target.style.borderColor=s.border}/>
          <textarea value={v.bo} onChange={e=>setEditVals(p=>({...p,[a.id]:{...p[a.id],bo:e.target.value}}))} rows={3} style={{...inputSt,resize:"vertical",lineHeight:1.5}} onFocus={e=>e.target.style.borderColor=s.accent} onBlur={e=>e.target.style.borderColor=s.border}/>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>saveEdit(a.id)} style={{padding:"9px 20px",borderRadius:100,border:"none",background:s.accent,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Save</button>
            <button onClick={()=>cancelEdit(a.id)} style={{padding:"9px 20px",borderRadius:100,border:`1px solid ${s.border}`,background:"#fff",color:s.txt2,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
          </div>
        </div>
      );
    }
    return(
      <div key={a.id} style={{borderRadius:18,padding:"22px 26px",background:"#fafafb",border:"1px solid #ececef",position:"relative",marginBottom:10,transition:"transform 0.16s"}}
        onMouseEnter={e=>e.currentTarget.style.transform="translateX(3px)"}
        onMouseLeave={e=>e.currentTarget.style.transform=""}>
        {a.pinned&&<div style={{position:"absolute",left:0,top:22,bottom:22,width:3,borderRadius:3,background:s.accent}}/>}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:8}}>
          <div style={{flex:1}}>
            {a.pinned&&<MonoTag style={{display:"block",marginBottom:6}}>Pinned</MonoTag>}
            <span style={{fontSize:16,fontWeight:700,color:"#0d0f16"}}>{a.title}</span>
          </div>
          {isAd&&(
            <div style={{display:"flex",gap:5,flexShrink:0}}>
              <button onClick={()=>onPin(a.id)} style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${s.border}`,background:"#fff",color:s.txt2,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{a.pinned?"Unpin":"Pin"}</button>
              <button onClick={()=>startEdit(a)} style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${s.border}`,background:"#fff",color:s.accent,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Edit</button>
              <button onClick={()=>window.confirm("Delete this announcement?")&&onDel(a.id)} style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${s.err}30`,background:s.errD,color:s.err,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Del</button>
            </div>
          )}
        </div>
        <p style={{fontSize:14,color:s.txt2,lineHeight:1.6,marginBottom:10,whiteSpace:"pre-wrap"}}>{a.body}</p>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:s.txtM,letterSpacing:"0.08em"}}>
          {a.author} · {relTime(a.ts)} · {new Date(a.ts).toLocaleDateString()}
        </div>
      </div>
    );
  };
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <PageHeader eyebrow="Official Updates">Announcements</PageHeader>
      {isAd&&(
        <div style={{borderRadius:18,padding:"22px 24px",background:"#fafafb",border:"1px solid #ececef",marginBottom:24}}>
          <MonoTag style={{display:"block",marginBottom:14,color:s.txt2}}>Post New Announcement</MonoTag>
          <input value={ti} onChange={e=>setTi(e.target.value)} placeholder="Title…" style={inputSt} onFocus={e=>e.target.style.borderColor=s.accent} onBlur={e=>e.target.style.borderColor=s.border}/>
          <textarea value={bo} onChange={e=>setBo(e.target.value)} placeholder="Write your announcement…" rows={3} style={{...inputSt,resize:"vertical",lineHeight:1.5}} onFocus={e=>e.target.style.borderColor=s.accent} onBlur={e=>e.target.style.borderColor=s.border}/>
          <button onClick={()=>{if(ti.trim()&&bo.trim()){onAdd(ti.trim(),bo.trim());setTi("");setBo("")}}}
            style={{padding:"11px 24px",borderRadius:100,border:"none",background:s.accent,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all 0.14s"}}
            onMouseEnter={e=>e.currentTarget.style.background=s.accentBright}
            onMouseLeave={e=>e.currentTarget.style.background=s.accent}>Post</button>
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column"}}>
        {items.filter(a=>a.pinned).map(a=>renderAnn(a))}
        {items.filter(a=>!a.pinned).map(a=>renderAnn(a))}
      </div>
    </div>
  );
}

function PgContacts({teams}){
  const[tab,setTab]=useState("jm");
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <PageHeader eyebrow="Directory">Contacts</PageHeader>
      <div style={{display:"flex",gap:8,marginBottom:24}}>
        <Pill active={tab==="jm"} onClick={()=>setTab("jm")}>Junior Mentors</Pill>
        <Pill active={tab==="sm"} onClick={()=>setTab("sm")}>Senior Mentors</Pill>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {tab==="jm"?teams.map(tm=>(
          <div key={tm.id} style={{borderRadius:18,padding:"16px 22px",background:"#fafafb",border:"1px solid #ececef",display:"flex",alignItems:"center",gap:14,transition:"transform 0.16s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateX(3px)"}
            onMouseLeave={e=>e.currentTarget.style.transform=""}>
            <div style={{width:40,height:40,borderRadius:12,background:"#efedfb",color:s.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,flexShrink:0}}>
              {tm.jm.split(" ").pop()?.[0]||"M"}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:700,color:"#0d0f16"}}>{tm.jm}</div>
              <div style={{fontSize:12,color:s.txt2,marginTop:3}}>{tm.name}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:s.txt2}}>{tm.jmPhone}</div>
              <div style={{fontSize:11,color:s.txtM,marginTop:3}}>{tm.jmEmail}</div>
            </div>
          </div>
        )):SM_LIST.map((sm,i)=>(
          <div key={i} style={{borderRadius:18,padding:"16px 22px",background:"#fafafb",border:"1px solid #ececef",display:"flex",alignItems:"center",gap:14,transition:"transform 0.16s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateX(3px)"}
            onMouseLeave={e=>e.currentTarget.style.transform=""}>
            <div style={{width:40,height:40,borderRadius:12,background:"#efedfb",color:s.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,flexShrink:0}}>
              {sm.name.split(" ").pop()?.[0]||"S"}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:700,color:"#0d0f16"}}>{sm.name}</div>
              <div style={{fontSize:12,color:s.txt2,marginTop:3}}>{sm.teams}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:s.txt2}}>{sm.phone}</div>
              <div style={{fontSize:11,color:s.txtM,marginTop:3}}>{sm.email}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PgSubmission({user,teams,submissions,onUpdate}){
  const data=teams.map(tm=>{
    const rec=submissions.find(x=>x.teamId===tm.id);
    return{teamId:tm.id,name:tm.name,jm:tm.jm,submitted:rec?.submitted||false,by:rec?.by||null,ts:rec?.ts||null};
  });
  const totalSubmitted=data.filter(x=>x.submitted).length;
  const canAdmin=user.role===ROLES.ADMIN;
  const canStudent=user.role===ROLES.STUDENT;
  const myTeamId=user.team||null;
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <PageHeader eyebrow="Competition">Submission Status</PageHeader>

      {/* Progress stat */}
      <div style={{borderRadius:18,padding:"28px 32px",background:"linear-gradient(135deg,#16181f,#20232e)",marginBottom:24,position:"relative",overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div style={{borderRadius:12,padding:"20px 18px",background:"rgba(255,255,255,0.06)"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:"#fff",opacity:0.5,marginBottom:10}}>Submitted</div>
            <div style={{fontWeight:800,fontSize:44,lineHeight:1,letterSpacing:"-0.02em",color:"#fff"}}>{totalSubmitted}/{data.length}</div>
          </div>
          <div style={{borderRadius:12,padding:"20px 18px",background:"rgba(255,255,255,0.06)"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:"#fff",opacity:0.5,marginBottom:10}}>Remaining</div>
            <div style={{fontWeight:800,fontSize:44,lineHeight:1,letterSpacing:"-0.02em",color:"#fff"}}>{data.length-totalSubmitted}</div>
          </div>
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {data.map(t=>{
          const isMine=t.teamId===myTeamId;
          const canToggle=canAdmin||(canStudent&&isMine);
          const btnLabel=t.submitted?"Mark as Not Submitted":"Mark as Submitted";
          const info=t.by?`Marked by ${t.by}`:null;
          const time=t.ts?new Date(t.ts).toLocaleTimeString():null;
          return(
            <div key={t.teamId} style={{borderRadius:12,padding:"12px 16px",background:"#fafafb",border:`1px solid ${isMine?"#e0dbf8":"#ececef"}`,position:"relative",transition:"transform 0.16s"}}
              onMouseEnter={e=>e.currentTarget.style.transform="translateX(3px)"}
              onMouseLeave={e=>e.currentTarget.style.transform=""}>
              {t.submitted&&<div style={{position:"absolute",left:0,top:12,bottom:12,width:3,borderRadius:3,background:s.accent}}/>}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#0d0f16",marginBottom:2}}>{t.name}</div>
                  <div style={{fontSize:11,color:s.txt2}}>
                    {info?`${info}${time?` · ${time}`:""}`:t.submitted?"Submitted":"Waiting for submission"}
                  </div>
                  {canStudent&&isMine&&!t.submitted&&(
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.08em",color:s.txtM,marginTop:5}}>
                      Anyone on your team can mark the submission once uploaded
                    </div>
                  )}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                  <MonoTag style={{color:t.submitted?s.accent:s.txt2}}>{t.submitted?"Submitted":"Pending"}</MonoTag>
                  {canToggle&&(
                    <button onClick={()=>onUpdate(t.teamId,!t.submitted,user.name)}
                      style={{padding:"8px 16px",borderRadius:100,border:`1px solid ${t.submitted?"#dadade":"transparent"}`,background:t.submitted?"#fff":s.accent,color:t.submitted?s.txt:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all 0.14s"}}
                      onMouseEnter={e=>e.currentTarget.style.opacity=0.8}
                      onMouseLeave={e=>e.currentTarget.style.opacity=1}>
                      {t.submitted?"Unsubmit":"Submit"}
                    </button>
                  )}
                </div>
              </div>
            </div>
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

function DetailField({label,value,mono}){
  return(
    <div>
      <MonoTag style={{display:"block",marginBottom:6,color:s.txt2}}>{label}</MonoTag>
      <div style={{fontSize:14,fontWeight:600,color:"#0d0f16",fontFamily:mono?"'JetBrains Mono',monospace":undefined}}>{value}</div>
    </div>
  );
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
        <button onClick={()=>setSel(null)} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 16px",borderRadius:100,border:`1px solid ${s.border}`,background:"#fff",color:s.txt2,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:28}}>← Back</button>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:32}}>
          <div style={{width:56,height:56,borderRadius:14,background:"#efedfb",color:s.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800}}>{sel.name[0]}</div>
          <div>
            <div style={{fontWeight:800,fontSize:26,letterSpacing:"-0.02em",color:"#0d0f16"}}>{sel.name}</div>
            <div style={{fontSize:13,color:s.txt2,marginTop:4}}>{sel.team.name}</div>
          </div>
          <div style={{marginLeft:"auto"}}>
            <MonoTag style={{color:sel.checkedIn?s.accent:s.txt2}}>{sel.checkedIn?"Checked In":"Not Checked In"}</MonoTag>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[
            {label:"Contact",fields:[{l:"Phone",v:sel.phone,m:true},{l:"Email",v:sel.email}]},
            {label:"Room & Team",fields:[{l:"Dorm Room",v:sel.room,m:true},{l:"Work Room",v:sel.team.workRoom,m:true}]},
            {label:"Logistics",fields:[{l:"Transport",v:sel.transport},{l:"Insurance",v:sel.insurance}]},
            {label:"Emergency Contact",fields:[{l:"Name",v:sel.emergencyName},{l:"Relationship",v:sel.emergencyRel},{l:"Phone",v:sel.emergencyPhone,m:true}]},
          ].map((sec,si)=>(
            <div key={si} style={{borderRadius:18,padding:"20px 24px",background:"#fafafb",border:"1px solid #ececef"}}>
              <MonoTag style={{display:"block",marginBottom:16,color:s.txt2}}>{sec.label}</MonoTag>
              <div style={{display:"grid",gridTemplateColumns:`repeat(${sec.fields.length},1fr)`,gap:16}}>
                {sec.fields.map((f,fi)=><DetailField key={fi} label={f.l} value={f.v} mono={f.m}/>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <PageHeader eyebrow="Admin View">Students</PageHeader>
      <SearchInput value={srch} onChange={e=>setSrch(e.target.value)} placeholder="Search by student name…"/>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filtered.map((st,i)=>(
          <button key={st.id} onClick={()=>setSel(st)} style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"14px 20px",borderRadius:14,border:"1px solid #ececef",background:"#fafafb",cursor:"pointer",fontFamily:"inherit",textAlign:"left",color:s.txt,transition:"transform 0.16s"}}
            onMouseEnter={e=>e.currentTarget.style.transform="translateX(3px)"}
            onMouseLeave={e=>e.currentTarget.style.transform=""}>
            <div style={{width:36,height:36,borderRadius:10,background:"#efedfb",color:s.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,flexShrink:0}}>{st.name[0]}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:600,color:"#0d0f16"}}>{st.name}</div>
              <div style={{fontSize:12,color:s.txt2,marginTop:2}}>{st.team.name}</div>
            </div>
            {st.checkedIn&&<MonoTag>In</MonoTag>}
            <span style={{color:s.txtM}}><I.Rt/></span>
          </button>
        ))}
      </div>
    </div>
  );
}

