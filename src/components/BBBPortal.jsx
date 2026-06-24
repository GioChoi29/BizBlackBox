'use client';

import { useState, useEffect, useRef } from "react";

/* BBB 2026 — Business Case Competition Portal
   Light theme · Role-scoped views · KST countdown */

const ROLES = { STUDENT:"student", JM:"junior_mentor", SM:"senior_mentor", ADMIN:"admin" };
const RL = { [ROLES.STUDENT]:"Student", [ROLES.JM]:"Junior Mentor", [ROLES.SM]:"Senior Mentor", [ROLES.ADMIN]:"Admin" };
const RC = { [ROLES.STUDENT]:"#4F6BF6", [ROLES.JM]:"#7C5CDB", [ROLES.SM]:"#D97706", [ROLES.ADMIN]:"#E04555" };
const DL = new Date("2026-08-02T10:00:00+09:00");
const TN = ["Alpha","Beta","Gamma","Delta","Epsilon","Zeta","Eta","Theta","Iota","Kappa","Lambda","Mu","Nu","Xi","Omicron","Pi","Rho","Sigma","Tau","Upsilon"];

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
const SearchInput=({value,onChange,placeholder,ariaLabel})=>(
  <div style={{display:"flex",alignItems:"center",gap:12,background:"#fafafb",border:`1px solid ${s.border}`,borderRadius:12,padding:"16px 20px",marginBottom:26,transition:"border-color 0.14s,box-shadow 0.14s"}}
    onFocusCapture={e=>{ e.currentTarget.style.borderColor=s.accent; e.currentTarget.style.boxShadow="0 0 0 3px rgba(108,92,231,0.12)"; }}
    onBlurCapture={e=>{ e.currentTarget.style.borderColor=s.border; e.currentTarget.style.boxShadow="none"; }}>
    <I.Srch aria-hidden="true" style={{color:s.txtM,flexShrink:0}}/>
    <input value={value} onChange={onChange} placeholder={placeholder}
      aria-label={ariaLabel||placeholder||"Search"} type="search"
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

// Trigger a re-render every `ms` so static timestamps in the tree (relTime
// calls, etc.) recompute without each consumer setting up its own interval.
function useTick(ms=60000){
  const[,setT]=useState(0);
  useEffect(()=>{const id=setInterval(()=>setT(t=>t+1),ms);return()=>clearInterval(id);},[ms]);
}

// Lightweight toast stack — top-right, auto-dismiss after 3.5s.
function useToasts(){
  const[toasts,setToasts]=useState([]);
  const push=(type,msg)=>{
    const id=Math.random().toString(36).slice(2);
    setToasts(p=>[...p,{id,type,msg}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3500);
  };
  return{toasts,success:m=>push("success",m),error:m=>push("error",m),info:m=>push("info",m)};
}
function ToastStack({toasts}){
  const c={success:{bg:s.okD,fg:s.ok},error:{bg:s.errD,fg:s.err},info:{bg:s.accentD,fg:s.accent}};
  return(
    <div role="status" aria-live="polite" style={{position:"fixed",top:18,right:18,zIndex:9999,display:"flex",flexDirection:"column",gap:8,maxWidth:340,pointerEvents:"none"}}>
      {toasts.map(t=>{const k=c[t.type]||c.info;return(
        <div key={t.id} style={{padding:"11px 16px",borderRadius:11,background:"#fff",color:k.fg,fontSize:13,fontWeight:600,border:`1px solid ${k.fg}33`,boxShadow:"0 6px 24px rgba(20,22,29,0.12)",animation:"toastIn 0.2s ease",pointerEvents:"auto"}}>{t.msg}</div>
      );})}
    </div>
  );
}

function EmptyState({icon,title,msg}){
  return(
    <div style={{padding:"56px 24px",textAlign:"center",border:`1px dashed ${s.border}`,borderRadius:18,background:"#fcfcfd"}}>
      {icon&&<div style={{width:48,height:48,borderRadius:12,background:"#fafafb",color:s.txtM,display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:14}}>{icon}</div>}
      {title&&<div style={{fontWeight:700,fontSize:15,color:s.txt,marginBottom:6}}>{title}</div>}
      {msg&&<div style={{fontSize:13,color:s.txt2,lineHeight:1.5,maxWidth:320,margin:"0 auto"}}>{msg}</div>}
    </div>
  );
}

// Visually-hidden but readable by screen readers (for input labels, icon button
// captions, etc.). Apply via `style={srOnly}`.
const srOnly={position:"absolute",width:1,height:1,padding:0,margin:-1,overflow:"hidden",clip:"rect(0,0,0,0)",whiteSpace:"nowrap",border:0};

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


export default function BBBPortal(){
  const[user,setUser]=useState(null);
  const[authLoading,setAuthLoading]=useState(true);
  const[tab,setTab]=useState("home");
  const[teams,setTeams]=useState([]);
  const[submissions,setSubmissions]=useState([]);
  const[qna,setQna]=useState([]);
  const[ann,setAnn]=useState([]);
  const[sched,setSched]=useState([]);
  const[smList,setSmList]=useState([]);
  const[venueList,setVenueList]=useState([]);
  const[prelimList,setPrelimList]=useState([]);
  const[roomMap,setRoomMap]=useState([]);
  const[transport,setTransport]=useState(null);
  const[users,setUsers]=useState([]);
  const[moreOpen,setMoreOpen]=useState(false);
  const toast=useToasts();
  useTick(60000); // refresh relTime strings every minute

  // Session-expired bounce: clear stale cookie then redirect to /login.
  const bounceToLogin=async()=>{
    try{await fetch("/api/auth/logout",{method:"POST"});}catch{}
    window.location.href="/login";
  };
  // Defensive reader: any 401 from a data fetch means the session lapsed —
  // redirect to /login. Other non-2xx (403/500) → empty array so the UI keeps
  // rendering instead of crashing on .filter()/.map().
  const safeArr=(setter)=>(r)=>{
    if(r.status===401){bounceToLogin();return;}
    if(!r.ok){setter([]);return;}
    return r.json().then(d=>setter(Array.isArray(d)?d:[]));
  };
  const reloadTeams=()=>fetch("/api/teams").then(safeArr(setTeams)).catch(()=>setTeams([]));
  const reloadSubs=()=>fetch("/api/submissions").then(safeArr(setSubmissions)).catch(()=>setSubmissions([]));
  const reloadQna=()=>fetch("/api/qna").then(safeArr(setQna)).catch(()=>setQna([]));
  const reloadAnn=()=>fetch("/api/announcements").then(safeArr(setAnn)).catch(()=>setAnn([]));
  const reloadSched=()=>fetch("/api/schedule").then(safeArr(setSched)).catch(()=>setSched([]));
  const reloadSm=()=>fetch("/api/mentors-sm").then(safeArr(setSmList)).catch(()=>setSmList([]));
  const reloadVenue=()=>fetch("/api/venue").then(safeArr(setVenueList)).catch(()=>setVenueList([]));
  const reloadPrelim=()=>fetch("/api/prelim").then(safeArr(setPrelimList)).catch(()=>setPrelimList([]));
  const reloadRoomMap=()=>fetch("/api/room-map").then(safeArr(setRoomMap)).catch(()=>setRoomMap([]));
  const reloadTransport=()=>fetch("/api/transport").then(r=>{
    if(r.status===401){bounceToLogin();return;}
    if(!r.ok){setTransport(null);return;}
    return r.json().then(setTransport);
  }).catch(()=>setTransport(null));
  const reloadUsers=()=>fetch("/api/users").then(safeArr(setUsers)).catch(()=>setUsers([]));

  useEffect(()=>{
    let cancelled=false;
    fetch("/api/auth/me").then(async r=>{
      if(cancelled)return;
      if(!r.ok){bounceToLogin();return;}
      const u=await r.json();
      if(u.mustChangePassword){window.location.href="/change-password";return;}
      setUser(u);setAuthLoading(false);
    }).catch(()=>{if(!cancelled){bounceToLogin();}});
    return()=>{cancelled=true;};
  },[]);

  useEffect(()=>{
    if(!user)return;
    reloadTeams();reloadSubs();reloadQna();reloadAnn();
    reloadSched();reloadSm();reloadVenue();reloadPrelim();reloadRoomMap();reloadTransport();
    if(user.role===ROLES.ADMIN)reloadUsers();
  },[user]);

  const logout=async()=>{
    try{await fetch("/api/auth/logout",{method:"POST"});}catch{}
    window.location.href="/login";
  };

  // Scroll to top whenever the user switches pages.
  useEffect(()=>{if(typeof window!=="undefined")window.scrollTo({top:0,behavior:"instant"});},[tab]);

  // Close the mobile "More" menu on Escape or outside click.
  const moreRef=useRef(null);
  useEffect(()=>{
    if(!moreOpen)return;
    const onKey=(e)=>{if(e.key==="Escape")setMoreOpen(false);};
    const onClick=(e)=>{if(moreRef.current&&!moreRef.current.contains(e.target))setMoreOpen(false);};
    document.addEventListener("keydown",onKey);
    document.addEventListener("mousedown",onClick);
    return()=>{document.removeEventListener("keydown",onKey);document.removeEventListener("mousedown",onClick);};
  },[moreOpen]);

  if(authLoading||!user)return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Archivo',sans-serif",color:"#5c6273"}}>Loading…</div>;

  const chk=(tid,sid)=>{
    const tm=teams.find(x=>x.id===tid);if(!tm)return;
    const st=tm.students.find(x=>x.id===sid);if(!st)return;
    const next=!st.checkedIn;
    setTeams(p=>p.map(t=>t.id===tid?{...t,students:t.students.map(s=>s.id===sid?{...s,checkedIn:next}:s)}:t));
    fetch(`/api/teams/${tid}/checkin`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({studentId:sid,checkedIn:next})}).then(r=>{
      if(r.status===401)return bounceToLogin();
      if(!r.ok)reloadTeams(); // server rejected — roll back to truth
    }).catch(()=>reloadTeams());
  };
  // Identity fields (by/author/aBy) are now derived from the session server-side
  // — don't send them from the client. We pass the local user.name into the
  // optimistic-update so the UI shows the right name before the refetch.
  const setSubmissionStatus=(teamId,submitted)=>{
    setSubmissions(p=>p.map(x=>x.teamId===teamId?{...x,submitted,by:user.name,ts:Date.now()}:x));
    fetch("/api/submissions",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({teamId,submitted})}).then(r=>{
      if(r.status===401)return bounceToLogin();
      if(!r.ok)reloadSubs(); // server rejected — roll back
    }).catch(()=>reloadSubs());
  };
  // mutation wrapper — checks res.ok, fires the matching toast.
  const mutate=async(p,okMsg,errMsg)=>{
    try{
      const r=await p;
      if(r&&r.status===401){bounceToLogin();return false;}
      if(r&&!r.ok){toast.error(errMsg||"Something went wrong");return false;}
      if(okMsg)toast.success(okMsg);
      return true;
    }catch{
      toast.error(errMsg||"Network error");
      return false;
    }
  };
  const askQna=(q,cat)=>mutate(
    fetch("/api/qna",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({q,category:cat||"general"})}),
    "Question posted","Couldn't post question"
  ).then(ok=>ok&&reloadQna());
  const answerQna=(id,a)=>mutate(
    fetch(`/api/qna/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({a})}),
    "Reply saved","Couldn't save reply"
  ).then(ok=>ok&&reloadQna());
  const addAnn=(title,body)=>mutate(
    fetch("/api/announcements",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title,body})}),
    "Announcement posted","Couldn't post announcement"
  ).then(ok=>ok&&reloadAnn());
  const pinAnn=(id)=>fetch(`/api/announcements/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({togglePin:true})}).then(reloadAnn);
  const editAnn=(id,title,body)=>fetch(`/api/announcements/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({title,body})}).then(reloadAnn);
  const delAnn=(id)=>fetch(`/api/announcements/${id}`,{method:"DELETE"}).then(reloadAnn);

  // Generic admin CRUD helpers
  const crudAdd=(path,doc,reload)=>fetch(path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(doc)}).then(reload);
  const crudEdit=(path,id,doc,reload)=>fetch(`${path}/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(doc)}).then(reload);
  const crudDel=(path,id,reload)=>fetch(`${path}/${id}`,{method:"DELETE"}).then(reload);
  const saveTransport=(doc)=>fetch("/api/transport",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(doc)}).then(reloadTransport);

  // Optimistic CRUD for students & users (admin). Each updates local React
  // state immediately so the UI feels instant, sends the write in the
  // background, and restores server truth via a refetch only on failure. The
  // student/user collections are kept in sync by mirroring the server's
  // cascade locally (deleting one side removes the linked entry on the other).
  const studentActions={
    // Add needs the server-generated id, so we await the write then splice the
    // returned record straight in — no full-collection refetch.
    add:async(teamId,addForm)=>{
      const res=await fetch(`/api/teams/${teamId}/students`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(addForm)}).catch(()=>null);
      if(!res||res.status===401){if(res)bounceToLogin();else toast.error("Network error");return null;}
      const data=await res.json().catch(()=>({}));
      if(!res.ok){toast.error(data.error||"Failed to add student");return null;}
      const tid=parseInt(teamId);
      setTeams(p=>p.map(t=>t.id===tid?{...t,students:[...(t.students||[]),data]}:t));
      return data;
    },
    update:async(teamId,studentId,form)=>{
      setTeams(p=>p.map(t=>t.id===teamId?{...t,students:t.students.map(st=>st.id===studentId?{...st,...form}:st)}:t));
      const res=await fetch(`/api/teams/${teamId}/students/${studentId}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)}).catch(()=>null);
      if(!res||!res.ok){const j=res?await res.json().catch(()=>({})):{};toast.error(j.error||"Couldn't save — reverted");reloadTeams();return false;}
      return true;
    },
    // Mirror the server cascade: drop the roster entry AND the linked user.
    remove:async(teamId,studentId,userId)=>{
      setTeams(p=>p.map(t=>t.id===teamId?{...t,students:t.students.filter(st=>st.id!==studentId)}:t));
      if(userId)setUsers(p=>p.filter(u=>u.id!==String(userId)));
      const res=await fetch(`/api/teams/${teamId}/students/${studentId}`,{method:"DELETE"}).catch(()=>null);
      if(!res||!res.ok){const j=res?await res.json().catch(()=>({})):{};toast.error(j.error||"Couldn't delete — reverted");reloadTeams();reloadUsers();return false;}
      return true;
    },
  };
  const userActions={
    // Add awaits the response (needs the generated id + temp password), then
    // splices the user in. If a roster entry was linked, refetch teams in the
    // background so the Students tab reflects it.
    add:async(form)=>{
      const res=await fetch("/api/users",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)}).catch(()=>null);
      if(!res||res.status===401){if(res)bounceToLogin();else toast.error("Network error");return null;}
      const data=await res.json().catch(()=>({}));
      if(!res.ok){toast.error(data.error||"Failed to add user");return null;}
      setUsers(p=>[...p,{id:data.id,name:data.name,username:data.username,email:data.email,role:data.role,teamId:data.teamId,mustChangePassword:true}]);
      if(data.studentLinked)reloadTeams();
      return data;
    },
    update:async(id,form)=>{
      const teamId=form.teamId===""||form.teamId==null?null:parseInt(form.teamId);
      setUsers(p=>p.map(u=>u.id===id?{...u,...form,teamId}:u));
      const res=await fetch(`/api/users/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)}).catch(()=>null);
      if(!res||!res.ok){toast.error("Couldn't update — reverted");reloadUsers();return false;}
      return true;
    },
    // Mirror the server cascade: drop the user AND any roster entry linked to it.
    remove:async(id)=>{
      setUsers(p=>p.filter(u=>u.id!==id));
      setTeams(p=>p.map(t=>({...t,students:(t.students||[]).filter(st=>String(st.userId)!==id)})));
      const res=await fetch(`/api/users/${id}`,{method:"DELETE"}).catch(()=>null);
      if(!res||!res.ok){toast.error("Couldn't delete — reverted");reloadUsers();reloadTeams();return false;}
      return true;
    },
  };

  const adminApi={
    sched:{items:sched,add:d=>crudAdd("/api/schedule",d,reloadSched),edit:(id,d)=>crudEdit("/api/schedule",id,d,reloadSched),del:id=>crudDel("/api/schedule",id,reloadSched)},
    sm:{items:smList,add:d=>crudAdd("/api/mentors-sm",d,reloadSm),edit:(id,d)=>crudEdit("/api/mentors-sm",id,d,reloadSm),del:id=>crudDel("/api/mentors-sm",id,reloadSm)},
    venue:{items:venueList,add:d=>crudAdd("/api/venue",d,reloadVenue),edit:(id,d)=>crudEdit("/api/venue",id,d,reloadVenue),del:id=>crudDel("/api/venue",id,reloadVenue)},
    prelim:{items:prelimList,add:d=>crudAdd("/api/prelim",d,reloadPrelim),edit:(id,d)=>crudEdit("/api/prelim",id,d,reloadPrelim),del:id=>crudDel("/api/prelim",id,reloadPrelim)},
    roomMap:{items:roomMap,add:d=>crudAdd("/api/room-map",d,reloadRoomMap),edit:(id,d)=>crudEdit("/api/room-map",id,d,reloadRoomMap),del:id=>crudDel("/api/room-map",id,reloadRoomMap)},
    users:{items:users,actions:userActions,reload:reloadUsers},
    transport:{doc:transport,save:saveTransport},
  };

  const nav=[
    {id:"home",label:"Home",icon:I.Home},{id:"schedule",label:"Schedule",icon:I.Cal},{id:"teams",label:"Teams",icon:I.Ppl},
    {id:"transport",label:"Transport",icon:I.Bus},{id:"venue",label:"Venue",icon:I.Map},
    {id:"rooms",label:user.role===ROLES.ADMIN?"Rooms":"My Room",icon:I.Bed},
    {id:"contacts",label:"Contacts",icon:I.Phn},{id:"submission",label:"Submission Status",icon:I.Chk},{id:"checkin",label:"Check-in",icon:I.Chk},
    ...(user.role===ROLES.ADMIN?[{id:"students",label:"Students",icon:I.Ppl},{id:"admin",label:"Admin Console",icon:I.Bell}]:[]),
    {id:"qna",label:"Q&A",icon:I.Msg},{id:"announcements",label:"Announce",icon:I.Bell},
  ];
  const pages={
    home:<PgHome user={user} teams={teams} ann={ann} setTab={setTab}/>,
    schedule:<PgSchedule user={user} teams={teams} sched={sched} prelimList={prelimList}/>,
    teams:<PgTeams user={user} teams={teams}/>,
    transport:<PgTransport transport={transport}/>,
    venue:<PgVenue venueList={venueList}/>,
    rooms:<PgRooms user={user} teams={teams} roomMap={roomMap}/>,
    contacts:<PgContacts teams={teams} smList={smList}/>,
    submission:<PgSubmission user={user} teams={teams} submissions={submissions} onUpdate={setSubmissionStatus}/>,
    checkin:<PgCheckin user={user} teams={teams} onChk={chk}/>,
    students:user.role===ROLES.ADMIN?<PgStudents teams={teams} roomMap={roomMap} actions={studentActions}/>:null,
    admin:user.role===ROLES.ADMIN?<PgAdmin api={adminApi}/>:null,
    qna:<PgQna user={user} items={qna} onAns={answerQna} onAsk={askQna}/>,
    announcements:<PgAnn user={user} items={ann} onAdd={addAnn} onPin={pinAnn} onEdit={editAnn} onDel={delAnn}/>,
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
          <div style={{width:38,height:38,borderRadius:10,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,background:"linear-gradient(135deg,#6c5ce7,#8472f2)",color:"#fff"}}>{user.name?.[0]??"?"}</div>
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
        <button onClick={logout} aria-label="Log out" style={{display:"flex",alignItems:"center",gap:13,padding:14,border:"none",background:"transparent",color:s.txt2,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit",opacity:0.7}}
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
      <nav className="mbn" aria-label="Mobile navigation" style={{position:"fixed",bottom:0,left:0,right:0,background:"#fff",borderTop:`1px solid ${s.border}`,display:"none",justifyContent:"space-around",padding:"6px 2px",zIndex:100}}>
        {nav.slice(0,5).map(n=>{const a=tab===n.id;const Ic=n.icon;return <button key={n.id} onClick={()=>setTab(n.id)} aria-label={n.label} aria-current={a?"page":undefined} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,padding:"4px 5px",border:"none",borderRadius:6,background:a?s.accentD:"transparent",color:a?s.accent:s.txtM,fontSize:9,fontWeight:500,cursor:"pointer",fontFamily:"inherit",minWidth:48}}><Ic/>{n.label}</button>;})}
        <div ref={moreRef} style={{position:"relative"}}>
          <button onClick={()=>setMoreOpen(!moreOpen)} aria-label="More navigation options" aria-expanded={moreOpen} aria-haspopup="menu" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,padding:"4px 5px",border:"none",borderRadius:6,background:"transparent",color:s.txtM,fontSize:9,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}><span aria-hidden="true" style={{fontSize:16,lineHeight:1}}>···</span>More</button>
          {moreOpen&&<>
            <div onClick={()=>setMoreOpen(false)} aria-hidden="true" style={{position:"fixed",inset:0,zIndex:99}}/>
            <div role="menu" style={{position:"absolute",bottom:"100%",right:0,marginBottom:6,background:"#fff",border:`1px solid ${s.border}`,borderRadius:12,padding:5,minWidth:150,boxShadow:s.shL,zIndex:100}}>
              {nav.slice(5).map(n=>{const Ic=n.icon;return <button key={n.id} role="menuitem" onClick={()=>{setTab(n.id);setMoreOpen(false)}} aria-current={tab===n.id?"page":undefined} style={{width:"100%",display:"flex",alignItems:"center",gap:7,padding:"8px 10px",borderRadius:7,border:"none",background:tab===n.id?s.accentD:"transparent",color:tab===n.id?s.accent:s.txt2,fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}><Ic/>{n.label}</button>;})}
            </div>
          </>}
        </div>
      </nav>
      <ToastStack toasts={toast.toasts}/>
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
    {l:"Teams",v:String(teams.length),accent:false},
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

function PgSchedule({user,teams,sched=[],prelimList=[]}){
  const[day,setDay]=useState(1);const[prelim,setPrelim]=useState(false);
  const items=sched.filter(x=>x.day===day);const myP=user.team?prelimList.find(p=>p.teams.includes(user.team)):null;
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
          {prelimList.map((sl,i)=>(
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
          {items.length===0&&<EmptyState icon={<I.Cal/>} title={`No events on Day ${day}`} msg="Schedule items will appear here once they're posted."/>}
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

function PgTransport({transport}){
  if(!transport)return <div style={{padding:40,color:s.txt2}}>Loading…</div>;
  const m=transport.main||{};const backups=transport.backups||[];const pv=transport.personal||{};
  return(
  <div style={{animation:"fadeUp 0.4s ease"}}>
    <PageHeader eyebrow="Getting There">Transportation</PageHeader>
    <div style={{borderRadius:18,padding:"28px 32px",background:"linear-gradient(135deg,#16181f,#20232e)",marginBottom:16,position:"relative",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:22}}>
        <div style={{width:42,height:42,borderRadius:11,background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}><I.Bus/></div>
        <div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:500,color:"#fff",opacity:0.7,marginBottom:4}}>{m.label||"Main Bus"}</div>
          <div style={{fontWeight:800,fontSize:36,letterSpacing:"-0.02em",color:"#fff",lineHeight:1}}>{m.time||"—"}</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        {[{l:"Pickup",v:m.pickup,sub:m.pickupSub},{l:"Capacity",v:m.capacity,sub:m.capacitySub}].map((it,i)=>(
          <div key={i} style={{borderRadius:12,padding:"16px 18px",background:"rgba(255,255,255,0.06)"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:"#fff",opacity:0.5,marginBottom:6}}>{it.l}</div>
            <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>{it.v}</div>
            <div style={{fontSize:12,color:"#fff",opacity:0.5,marginTop:3}}>{it.sub}</div>
          </div>
        ))}
      </div>
      {m.warning&&<div style={{borderRadius:10,padding:"11px 16px",background:"rgba(108,92,231,0.18)",fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:"0.06em",color:"#cdc6f5"}}>⚠ {m.warning}</div>}
    </div>

    <Card style={{padding:"20px 24px",marginBottom:12}}>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:700,color:s.accent,marginBottom:16}}>Backup Options — If Late</div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {backups.map((b,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:16,padding:"14px 16px",borderRadius:12,background:"#fff",border:"1px solid #ececef"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:700,color:s.accent,minWidth:64}}>{b.time}</div>
            <div><div style={{fontSize:14,fontWeight:600,color:"#0d0f16"}}>{b.route}</div><div style={{fontSize:12,color:s.txt2,marginTop:2}}>{b.note}</div></div>
          </div>
        ))}
      </div>
    </Card>

    <Card style={{padding:"20px 24px"}}>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:700,color:s.accent,marginBottom:10}}>Personal Vehicle</div>
      <div style={{fontSize:17,fontWeight:700,color:"#0d0f16",marginBottom:6}}>{pv.title||"Self-Drive"}</div>
      <p style={{fontSize:14,color:s.txt2,lineHeight:1.6}}>{pv.note}</p>
    </Card>
  </div>
);}

function PgVenue({venueList=[]}){
  const floors=[{label:"1F — Ground Floor",key:"1F"},{label:"2F — Team Rooms",key:"2F"},{label:"3F — Dormitory",key:"3F"}];
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <PageHeader eyebrow="Room Directory">Venue Map</PageHeader>
      {venueList.length===0?
        <EmptyState icon={<I.Map/>} title="No rooms listed" msg="Once venue rooms are added, they'll show up grouped by floor."/>
      :
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {floors.map((fl,fi)=>{const rooms=venueList.filter(r=>r.floor===fl.key);if(rooms.length===0)return null;return(
            <div key={fi}>
              <MonoTag style={{display:"block",marginBottom:12,color:s.txt2}}>{fl.label}</MonoTag>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
                {rooms.map((r,ri)=>(
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
          );})}
        </div>
      }
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
function PgRooms({user,teams,roomMap=[]}){
  const myTm=user.team?teams.find(x=>x.id===user.team):null;
  const[roomSrch,setRoomSrch]=useState("");
  const rmLookup=Object.fromEntries(roomMap.map(r=>[r.person,{room:r.room,floor:r.floor}]));
  if(user.role===ROLES.ADMIN){
    const byRoom={};
    teams.forEach(tm=>tm.students.forEach(st=>{const ra=rmLookup[st.name];if(ra){if(!byRoom[ra.room])byRoom[ra.room]=[];byRoom[ra.room].push({...st,team:tm.name});}}));
    teams.forEach(tm=>{const ra=rmLookup[tm.jm];if(ra){if(!byRoom[ra.room])byRoom[ra.room]=[];byRoom[ra.room].push({name:tm.jm,team:tm.name,isMentor:true});}});
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
    const myRoom=rmLookup[user.name];
    return(
      <div style={{animation:"fadeUp 0.4s ease"}}>
        <PageHeader eyebrow="Dormitory">My Room</PageHeader>
        <RoomHero room={myRoom?.room} floor={myRoom?.floor} label="Your Dorm Room" icon={<I.Bed/>}/>
        {myTm&&<Card style={{padding:"18px 22px"}}><MonoTag style={{display:"block",marginBottom:8,color:s.txt2}}>Team Work Room</MonoTag><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:18,fontWeight:700,color:"#0d0f16"}}>{myTm.workRoom}</div><div style={{fontSize:12,color:s.txt2,marginTop:4}}>{myTm.name}</div></Card>}
      </div>
    );
  }
  if(user.role===ROLES.JM){
    const myRoom=rmLookup[user.name]||(myTm?rmLookup[myTm.jm]:null);
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
  const complete=cnt===team.students.length;
  return(
    <div style={{borderRadius:14,padding:"16px 18px",background:"#fafafb",border:"1px solid #ececef"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div style={{fontWeight:700,fontSize:14,color:"#0d0f16"}}>{team.name}</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:700,color:complete?s.ok:s.txt2}}>{cnt}/{team.students.length}</div>
      </div>
      <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:4,padding:0,margin:0}}>
        {team.students.map(st=>{
          const id=`chk-${team.id}-${st.id}`;
          const row=(
            <span style={{flex:1,display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:9,border:`1px solid ${st.checkedIn?"#cbe7da":"#ececef"}`,background:st.checkedIn?"#eef9f4":"#fff",fontFamily:"inherit",color:s.txt,transition:"border-color 0.13s",cursor:canToggle?"pointer":"default"}}>
              <span aria-hidden="true" style={{width:17,height:17,borderRadius:4,border:`2px solid ${st.checkedIn?s.ok:s.border}`,background:st.checkedIn?s.ok:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.13s"}}>
                {st.checkedIn&&<span style={{color:"#fff",fontSize:9,fontWeight:800}}>✓</span>}
              </span>
              <span style={{fontSize:12,fontWeight:st.checkedIn?600:400,color:st.checkedIn?"#0d0f16":s.txt2}}>{st.name}</span>
              {st.checkedIn&&<MonoTag style={{marginLeft:"auto",color:s.ok}}>In</MonoTag>}
            </span>
          );
          return(
            <li key={st.id} style={{display:"flex"}}>
              {canToggle?(
                <label htmlFor={id} style={{flex:1,display:"flex",cursor:"pointer"}}>
                  <input id={id} type="checkbox" checked={!!st.checkedIn} onChange={()=>onChk(team.id,st.id)} style={srOnly} aria-label={`Toggle check-in for ${st.name}`}/>
                  {row}
                </label>
              ):row}
            </li>
          );
        })}
      </ul>
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
              <div style={{fontWeight:800,fontSize:44,lineHeight:1,letterSpacing:"-0.02em",color:"#fff"}}>{teams.filter(tm=>tm.students.every(st=>st.checkedIn)).length}/{teams.length}</div>
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
        <label htmlFor="qna-ask" style={{...srOnly}}>Ask a question</label>
        <MonoTag style={{display:"block",marginBottom:14,color:s.txt2}}>Ask a Question</MonoTag>
        <div style={{display:"flex",gap:8,marginBottom:8,alignItems:"flex-start"}}>
          <textarea id="qna-ask" value={q} onChange={e=>setQ(e.target.value)} placeholder="Type your question — Cmd/Ctrl+Enter to submit"
            rows={2}
            onKeyDown={e=>{if((e.metaKey||e.ctrlKey)&&e.key==="Enter"&&q.trim()){onAsk(q.trim(),qCat);setQ("");}}}
            style={{flex:1,padding:"12px 14px",background:"#fff",border:`1px solid ${s.border}`,borderRadius:12,color:s.txt,fontSize:13,fontFamily:"inherit",resize:"vertical",lineHeight:1.5,minHeight:46}}
            onFocus={e=>e.target.style.borderColor=s.accent} onBlur={e=>e.target.style.borderColor=s.border}/>
          <select value={qCat} onChange={e=>setQCat(e.target.value)} aria-label="Question category" style={{padding:"12px 12px",background:"#fff",border:`1px solid ${s.border}`,borderRadius:12,color:s.txt,fontSize:12,fontFamily:"inherit",cursor:"pointer"}}>
            {["logistics","rules","technical","general","other"].map(c=><option key={c} value={c}>{c[0].toUpperCase()+c.slice(1)}</option>)}
          </select>
          <button onClick={()=>{if(q.trim()){onAsk(q.trim(),qCat);setQ("")}}}
            disabled={!q.trim()}
            style={{padding:"12px 20px",borderRadius:100,border:"none",background:q.trim()?s.accent:"#e2e3eb",color:"#fff",cursor:q.trim()?"pointer":"not-allowed",fontFamily:"inherit",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:6,transition:"all 0.14s",opacity:q.trim()?1:0.7}}
            onMouseEnter={e=>{if(q.trim())e.currentTarget.style.background=s.accentBright;}}
            onMouseLeave={e=>{if(q.trim())e.currentTarget.style.background=s.accent;}}>
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
              {!x.a&&<MonoTag style={{color:s.warn}}>Pending</MonoTag>}
            </div>
            {x.a&&(
              <div style={{marginLeft:40,padding:"12px 16px",borderRadius:12,background:"#fff",border:"1px solid #ececef",position:"relative"}}>
                <div style={{position:"absolute",left:0,top:8,bottom:8,width:3,borderRadius:2,background:s.ok}}/>
                <MonoTag style={{display:"block",marginBottom:6,color:s.ok}}>Answered by {x.aBy}</MonoTag>
                <div style={{fontSize:13,color:s.txt,lineHeight:1.6}}>{x.a}</div>
              </div>
            )}
            {!x.a&&canAns&&(
              <div style={{marginLeft:40,display:"flex",gap:8,marginTop:4}}>
                <label htmlFor={`qna-reply-${x.id}`} style={{...srOnly}}>Reply to question</label>
                <input id={`qna-reply-${x.id}`} value={ans[x.id]||""} onChange={e=>setAns(p=>({...p,[x.id]:e.target.value}))} placeholder="Write your answer…"
                  onKeyDown={e=>{if(e.key==="Enter"&&ans[x.id]?.trim()){onAns(x.id,ans[x.id].trim());setAns(p=>({...p,[x.id]:""}));}}}
                  style={{flex:1,padding:"10px 14px",background:"#fff",border:`1px solid ${s.border}`,borderRadius:10,color:s.txt,fontSize:13,fontFamily:"inherit"}}
                  onFocus={e=>e.target.style.borderColor=s.accent} onBlur={e=>e.target.style.borderColor=s.border}/>
                <button onClick={()=>{if(ans[x.id]?.trim()){onAns(x.id,ans[x.id].trim());setAns(p=>({...p,[x.id]:""}));}}}
                  disabled={!ans[x.id]?.trim()}
                  style={{padding:"10px 18px",borderRadius:100,border:"none",background:ans[x.id]?.trim()?s.accent:"#e2e3eb",color:"#fff",fontSize:13,fontWeight:700,cursor:ans[x.id]?.trim()?"pointer":"not-allowed",fontFamily:"inherit",opacity:ans[x.id]?.trim()?1:0.7}}>Reply</button>
              </div>
            )}
          </div>
        ))}
        {list.length===0&&items.length===0&&(
          <EmptyState icon={<I.Msg/>} title="No questions yet" msg="Be the first to ask — Q&A is visible to everyone."/>
        )}
        {list.length===0&&items.length>0&&(
          <EmptyState title="Nothing matches your filters" msg="Try clearing them above."/>
        )}
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
            disabled={!ti.trim()||!bo.trim()}
            style={{padding:"11px 24px",borderRadius:100,border:"none",background:(ti.trim()&&bo.trim())?s.accent:"#e2e3eb",color:"#fff",fontSize:13,fontWeight:700,cursor:(ti.trim()&&bo.trim())?"pointer":"not-allowed",fontFamily:"inherit",transition:"all 0.14s",opacity:(ti.trim()&&bo.trim())?1:0.7}}
            onMouseEnter={e=>{if(ti.trim()&&bo.trim())e.currentTarget.style.background=s.accentBright;}}
            onMouseLeave={e=>{if(ti.trim()&&bo.trim())e.currentTarget.style.background=s.accent;}}>Post</button>
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column"}}>
        {items.filter(a=>a.pinned).map(a=>renderAnn(a))}
        {items.filter(a=>!a.pinned).map(a=>renderAnn(a))}
        {items.length===0&&(
          <EmptyState icon={<I.Bell/>} title="No announcements yet" msg={isAd?"Post the first update above.":"Check back here when staff posts something."}/>
        )}
      </div>
    </div>
  );
}

function PgContacts({teams,smList=[]}){
  const[tab,setTab]=useState("jm");
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <PageHeader eyebrow="Directory">Contacts</PageHeader>
      <div style={{display:"flex",gap:8,marginBottom:24}}>
        <Pill active={tab==="jm"} onClick={()=>setTab("jm")}>Junior Mentors</Pill>
        <Pill active={tab==="sm"} onClick={()=>setTab("sm")}>Senior Mentors</Pill>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {tab==="jm"&&teams.length===0?(
          <EmptyState icon={<I.Ppl/>} title="No teams set up" msg="Teams will populate once they're seeded or added."/>
        ):tab==="jm"?teams.map(tm=>(
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
        )):smList.length===0?(
          <EmptyState icon={<I.Phn/>} title="No senior mentors listed" msg="Add them via Admin Console → Senior Mentors."/>
        ):smList.map((sm,i)=>(
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
              {t.submitted&&<div style={{position:"absolute",left:0,top:12,bottom:12,width:3,borderRadius:3,background:s.ok}}/>}
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
                  <MonoTag style={{color:t.submitted?s.ok:s.warn}}>{t.submitted?"Submitted":"Pending"}</MonoTag>
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

// ── Admin Console ────────────────────────────────────────────────────────────
const adminInputSt={width:"100%",padding:"8px 12px",borderRadius:8,border:`1px solid ${s.border}`,fontSize:13,fontFamily:"inherit",outline:"none",background:"#fff",color:s.txt};
const adminBtnSt={padding:"7px 14px",borderRadius:8,border:"none",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"};

function AdminRowEditor({fields,initial={},onSave,onCancel}){
  const[form,setForm]=useState(initial);
  const setF=(k,v)=>setForm(p=>({...p,[k]:v}));
  return(
    <div style={{padding:"14px 16px",borderRadius:12,background:"#fff",border:`1.5px solid ${s.accent}`,marginBottom:8}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10,marginBottom:12}}>
        {fields.map(f=>(
          <div key={f.k}>
            <div style={{fontSize:10,fontWeight:700,color:s.txt2,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>{f.l}</div>
            {f.options?(
              <select value={form[f.k]??""} onChange={e=>setF(f.k,e.target.value)} style={adminInputSt}>
                <option value="">—</option>
                {f.options.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            ):(
              <input type={f.type==="number"?"number":"text"} value={form[f.k]??""} onChange={e=>setF(f.k,e.target.value)} style={adminInputSt}/>
            )}
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>{
          const out={};
          fields.forEach(f=>{
            let v=form[f.k];
            if(f.type==="number"&&v!=="")v=v==null?null:Number(v);
            if(f.type==="csv-num"&&typeof v==="string")v=v.split(",").map(x=>parseInt(x.trim())).filter(x=>!isNaN(x));
            out[f.k]=v;
          });
          onSave(out);
        }} style={{...adminBtnSt,background:s.accent,color:"#fff"}}>Save</button>
        <button onClick={onCancel} style={{...adminBtnSt,background:"#f1f1f4",color:s.txt2}}>Cancel</button>
      </div>
    </div>
  );
}

function AdminCrudTable({section,fields}){
  const{items,add,edit,del}=section;
  const[editingId,setEditingId]=useState(null);
  const[adding,setAdding]=useState(false);
  const fmt=(f,v)=>{
    if(v==null||v==="")return"—";
    if(f.type==="csv-num"&&Array.isArray(v))return v.join(", ");
    return String(v);
  };
  const toForm=(item)=>{
    const out={};
    fields.forEach(f=>{
      let v=item[f.k];
      if(f.type==="csv-num"&&Array.isArray(v))v=v.join(", ");
      out[f.k]=v==null?"":v;
    });
    return out;
  };
  return(
    <div>
      {adding&&<AdminRowEditor fields={fields} onSave={d=>{add(d);setAdding(false);}} onCancel={()=>setAdding(false)}/>}
      {(items||[]).map(item=>(
        editingId===item.id?
          <AdminRowEditor key={item.id} fields={fields} initial={toForm(item)} onSave={d=>{edit(item.id,d);setEditingId(null);}} onCancel={()=>setEditingId(null)}/>
        :
          <div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,background:"#fafafb",border:`1px solid ${s.border}`,marginBottom:6}}>
            <div style={{flex:1,display:"grid",gridTemplateColumns:`repeat(${fields.length},1fr)`,gap:10,fontSize:13,color:s.txt}}>
              {fields.map(f=><div key={f.k} style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fmt(f,item[f.k])}</div>)}
            </div>
            <button onClick={()=>setEditingId(item.id)} style={{...adminBtnSt,background:"#fff",border:`1px solid ${s.border}`,color:s.txt2}}>Edit</button>
            <button onClick={()=>{if(confirm("Delete this row?"))del(item.id);}} style={{...adminBtnSt,background:"#fff",border:`1px solid ${s.border}`,color:s.err}}>Delete</button>
          </div>
      ))}
      {!adding&&<button onClick={()=>setAdding(true)} style={{...adminBtnSt,background:s.accent,color:"#fff",marginTop:8}}>+ Add</button>}
    </div>
  );
}

function AdminTransport({section}){
  const{doc,save}=section;
  const[form,setForm]=useState(null);
  useEffect(()=>{if(doc&&!form)setForm(JSON.parse(JSON.stringify(doc)));},[doc]);
  if(!form)return <div style={{color:s.txt2}}>Loading…</div>;
  const setMain=(k,v)=>setForm(p=>({...p,main:{...p.main,[k]:v}}));
  const setPv=(k,v)=>setForm(p=>({...p,personal:{...p.personal,[k]:v}}));
  const setBackup=(i,k,v)=>setForm(p=>({...p,backups:p.backups.map((b,idx)=>idx===i?{...b,[k]:v}:b)}));
  const addBackup=()=>setForm(p=>({...p,backups:[...(p.backups||[]),{route:"",time:"",note:""}]}));
  const delBackup=(i)=>setForm(p=>({...p,backups:p.backups.filter((_,idx)=>idx!==i)}));
  const mainFields=[["label","Label"],["time","Time"],["pickup","Pickup"],["pickupSub","Pickup Sub"],["capacity","Capacity"],["capacitySub","Capacity Sub"],["warning","Warning"]];
  return(
    <div>
      <div style={{fontWeight:700,fontSize:14,marginBottom:8,color:s.txt}}>Main Bus</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10,marginBottom:18}}>
        {mainFields.map(([k,l])=>(
          <div key={k}>
            <div style={{fontSize:10,fontWeight:700,color:s.txt2,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>{l}</div>
            <input value={form.main?.[k]??""} onChange={e=>setMain(k,e.target.value)} style={adminInputSt}/>
          </div>
        ))}
      </div>
      <div style={{fontWeight:700,fontSize:14,marginBottom:8,color:s.txt}}>Backup Options</div>
      {(form.backups||[]).map((b,i)=>(
        <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"flex-end"}}>
          <div style={{flex:1}}><div style={{fontSize:10,fontWeight:700,color:s.txt2,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Route</div><input value={b.route||""} onChange={e=>setBackup(i,"route",e.target.value)} style={adminInputSt}/></div>
          <div style={{flex:1}}><div style={{fontSize:10,fontWeight:700,color:s.txt2,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Time</div><input value={b.time||""} onChange={e=>setBackup(i,"time",e.target.value)} style={adminInputSt}/></div>
          <div style={{flex:2}}><div style={{fontSize:10,fontWeight:700,color:s.txt2,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Note</div><input value={b.note||""} onChange={e=>setBackup(i,"note",e.target.value)} style={adminInputSt}/></div>
          <button onClick={()=>delBackup(i)} style={{...adminBtnSt,background:"#fff",border:`1px solid ${s.border}`,color:s.err}}>×</button>
        </div>
      ))}
      <button onClick={addBackup} style={{...adminBtnSt,background:"#f1f1f4",color:s.txt,marginBottom:18}}>+ Add backup</button>
      <div style={{fontWeight:700,fontSize:14,marginBottom:8,color:s.txt}}>Personal Vehicle</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:10,marginBottom:18}}>
        <div><div style={{fontSize:10,fontWeight:700,color:s.txt2,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Title</div><input value={form.personal?.title??""} onChange={e=>setPv("title",e.target.value)} style={adminInputSt}/></div>
        <div><div style={{fontSize:10,fontWeight:700,color:s.txt2,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Note</div><input value={form.personal?.note??""} onChange={e=>setPv("note",e.target.value)} style={adminInputSt}/></div>
      </div>
      <button onClick={()=>save(form)} style={{...adminBtnSt,background:s.accent,color:"#fff"}}>Save All</button>
    </div>
  );
}

function PasswordRevealModal({creds,onClose}){
  const[copied,setCopied]=useState(false);
  const copy=async()=>{try{await navigator.clipboard.writeText(creds.password);setCopied(true);setTimeout(()=>setCopied(false),1500);}catch{}};
  const emailBanner=creds.emailSent
    ?{bg:"rgba(13,166,120,0.10)",border:s.ok,color:s.ok,text:`✓ Email sent to ${creds.email}`}
    :creds.email
      ?{bg:"rgba(217,119,6,0.10)",border:s.warn,color:s.warn,text:`⚠ Email NOT sent${creds.emailError?` — ${creds.emailError}`:""}. Share password manually.`}
      :{bg:"rgba(146,152,178,0.10)",border:s.txtM,color:s.txt2,text:"No email on file — share password manually."};
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(20,22,29,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#fff",borderRadius:18,padding:"28px 30px",maxWidth:460,width:"100%",boxShadow:"0 12px 40px rgba(0,0,0,0.25)"}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:700,color:s.accent,marginBottom:10}}>Temporary Password</div>
        <div style={{fontWeight:800,fontSize:20,letterSpacing:"-0.01em",color:"#0d0f16",marginBottom:8}}>Save this now</div>
        <p style={{fontSize:13,color:s.txt2,lineHeight:1.55,marginBottom:14}}>
          This password is only shown once. Share with <strong>{creds.username}</strong>. They will be prompted to change it on first sign-in.
        </p>
        <div style={{padding:"10px 14px",borderRadius:10,background:emailBanner.bg,border:`1px solid ${emailBanner.border}33`,color:emailBanner.color,fontSize:12,fontWeight:600,marginBottom:14}}>{emailBanner.text}</div>
        <div style={{padding:"14px 18px",borderRadius:12,background:"#fafafb",border:`1px solid ${s.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
          <code style={{fontFamily:"'JetBrains Mono',monospace",fontSize:16,fontWeight:700,color:"#0d0f16"}}>{creds.password}</code>
          <button onClick={copy} style={{...adminBtnSt,background:copied?s.ok:s.accent,color:"#fff"}}>{copied?"Copied!":"Copy"}</button>
        </div>
        <button onClick={onClose} style={{...adminBtnSt,background:"#f1f1f4",color:s.txt,width:"100%",padding:"10px 14px"}}>I've saved it — close</button>
      </div>
    </div>
  );
}

function AdminUsersTable({section}){
  const{items,actions,reload}=section;
  const addFields=[{k:"name",l:"Name"},{k:"username",l:"Username"},{k:"email",l:"Email (for credentials)"},{k:"role",l:"Role",options:[{v:"student",l:"Student"},{v:"junior_mentor",l:"JM"},{v:"senior_mentor",l:"SM"},{v:"admin",l:"Admin"}]},{k:"teamId",l:"Team ID",type:"number"}];
  const editFields=[{k:"name",l:"Name"},{k:"email",l:"Email"},{k:"role",l:"Role",options:[{v:"student",l:"Student"},{v:"junior_mentor",l:"JM"},{v:"senior_mentor",l:"SM"},{v:"admin",l:"Admin"}]},{k:"teamId",l:"Team ID",type:"number"}];
  const[editingId,setEditingId]=useState(null);
  const[adding,setAdding]=useState(false);
  const[creds,setCreds]=useState(null);
  const[query,setQuery]=useState("");

  const submitAdd=async(form)=>{
    const data=await actions.add(form);
    if(!data)return;
    setCreds({username:data.username,password:data.initialPassword,email:data.email,emailSent:data.emailSent,emailError:data.emailError});
    setAdding(false);
  };
  const submitEdit=async(id,form)=>{
    setEditingId(null); // optimistic — close the editor immediately
    actions.update(id,form);
  };
  const del=async(id,username)=>{
    if(!confirm(`Delete ${username}? They will be unable to sign in.`))return;
    actions.remove(id);
  };
  const resetPwd=async(user)=>{
    if(!confirm(`Reset password for ${user.username}? They will be signed out and need to use the new temporary password.`))return;
    const res=await fetch(`/api/users/${user.id}/reset-password`,{method:"POST"});
    const data=await res.json();
    if(!res.ok){alert("Failed to reset password");return;}
    setCreds({username:user.username,password:data.initialPassword,email:user.email,emailSent:data.emailSent,emailError:data.emailError});
    reload();
  };

  const toForm=(item,fields)=>{
    const out={};
    fields.forEach(f=>{out[f.k]=item[f.k]==null?"":item[f.k];});
    return out;
  };
  const q=query.trim().toLowerCase();
  const filtered=q?items.filter(u=>(u.name||"").toLowerCase().includes(q)||(u.username||"").toLowerCase().includes(q)):items;

  return(
    <div>
      {creds&&<PasswordRevealModal creds={creds} onClose={()=>setCreds(null)}/>}
      <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by name or username…" style={{...adminInputSt,marginBottom:12}}/>
      {!adding&&<button onClick={()=>setAdding(true)} style={{...adminBtnSt,background:s.accent,color:"#fff",marginBottom:12}}>+ Add User</button>}
      {adding&&<AdminRowEditor fields={addFields} onSave={submitAdd} onCancel={()=>setAdding(false)}/>}
      {(filtered||[]).map(u=>(
        editingId===u.id?
          <AdminRowEditor key={u.id} fields={editFields} initial={toForm(u,editFields)} onSave={d=>submitEdit(u.id,d)} onCancel={()=>setEditingId(null)}/>
        :
          <div key={u.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,background:"#fafafb",border:`1px solid ${s.border}`,marginBottom:6}}>
            <div style={{flex:1,display:"grid",gridTemplateColumns:"1.4fr 1fr 1fr 0.5fr 0.7fr",gap:10,fontSize:13,color:s.txt,alignItems:"center"}}>
              <div style={{fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.name}</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:s.txt2}}>{u.username||"—"}</div>
              <div>{u.role}</div>
              <div>{u.teamId??"—"}</div>
              <div>{u.mustChangePassword?<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,color:s.warn,textTransform:"uppercase",letterSpacing:"0.08em"}}>Pending</span>:<span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,fontWeight:700,color:s.ok,textTransform:"uppercase",letterSpacing:"0.08em"}}>Active</span>}</div>
            </div>
            <button onClick={()=>resetPwd(u)} style={{...adminBtnSt,background:"#fff",border:`1px solid ${s.border}`,color:s.warn}}>Reset Pwd</button>
            <button onClick={()=>setEditingId(u.id)} style={{...adminBtnSt,background:"#fff",border:`1px solid ${s.border}`,color:s.txt2}}>Edit</button>
            <button onClick={()=>del(u.id,u.username)} style={{...adminBtnSt,background:"#fff",border:`1px solid ${s.border}`,color:s.err}}>Delete</button>
          </div>
      ))}
    </div>
  );
}

function AdminScheduleEditor({section}){
  const{items,add,edit,del}=section;
  const[day,setDay]=useState(1);
  const[editingId,setEditingId]=useState(null);
  const[adding,setAdding]=useState(false);
  const dayItems=(items||[]).filter(x=>x.day===day).sort((a,b)=>(a.order??0)-(b.order??0)||String(a.time).localeCompare(String(b.time)));
  const typeOpts=[{v:"transport",l:"Transport"},{v:"logistics",l:"Logistics"},{v:"ceremony",l:"Ceremony"},{v:"competition",l:"Competition"},{v:"break",l:"Break"},{v:"mentoring",l:"Mentoring"}];

  const RowForm=({initial,onSave,onCancel})=>{
    const[f,setF]=useState({time:"",ev:"",loc:"",type:"logistics",order:dayItems.length,...initial});
    return(
      <div style={{position:"relative",marginBottom:14}}>
        <div style={{position:"absolute",left:-27,top:"50%",transform:"translateY(-50%)",width:12,height:12,borderRadius:"50%",background:"#fff",border:`3px solid ${s.accent}`}}/>
        <div style={{background:"#fff",border:`1.5px solid ${s.accent}`,borderRadius:14,padding:"14px 16px"}}>
          <div style={{display:"flex",gap:10,alignItems:"flex-end",flexWrap:"wrap"}}>
            <div style={{width:80}}>
              <div style={{fontSize:10,fontWeight:700,color:s.txt2,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Time</div>
              <input value={f.time} onChange={e=>setF({...f,time:e.target.value})} placeholder="09:30" style={adminInputSt}/>
            </div>
            <div style={{flex:2,minWidth:180}}>
              <div style={{fontSize:10,fontWeight:700,color:s.txt2,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Event</div>
              <input value={f.ev} onChange={e=>setF({...f,ev:e.target.value})} style={adminInputSt}/>
            </div>
            <div style={{flex:1.5,minWidth:140}}>
              <div style={{fontSize:10,fontWeight:700,color:s.txt2,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Location</div>
              <input value={f.loc} onChange={e=>setF({...f,loc:e.target.value})} style={adminInputSt}/>
            </div>
            <div style={{width:140}}>
              <div style={{fontSize:10,fontWeight:700,color:s.txt2,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Type</div>
              <select value={f.type} onChange={e=>setF({...f,type:e.target.value})} style={adminInputSt}>
                {typeOpts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:"flex",gap:8,marginTop:12}}>
            <button onClick={()=>onSave({...f,day,order:Number(f.order)||0})} style={{...adminBtnSt,background:s.accent,color:"#fff"}}>Save</button>
            <button onClick={onCancel} style={{...adminBtnSt,background:"#f1f1f4",color:s.txt2}}>Cancel</button>
          </div>
        </div>
      </div>
    );
  };

  return(
    <div>
      <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
        {[1,2].map(d=><Pill key={d} active={day===d} onClick={()=>{setDay(d);setEditingId(null);setAdding(false);}}>Day {d}</Pill>)}
        <div style={{flex:1}}/>
        {!adding&&<button onClick={()=>{setAdding(true);setEditingId(null);}} style={{...adminBtnSt,background:s.accent,color:"#fff"}}>+ Add Event</button>}
      </div>
      <div style={{position:"relative",paddingLeft:28}}>
        <div style={{position:"absolute",left:5,top:14,bottom:14,width:2,background:"#e9e6f7",borderRadius:1}}/>
        {dayItems.map((it,i)=>(
          editingId===it.id?
            <RowForm key={it.id} initial={it} onSave={d=>{edit(it.id,d);setEditingId(null);}} onCancel={()=>setEditingId(null)}/>
          :
            <div key={it.id} style={{position:"relative",marginBottom:14}}>
              <div style={{position:"absolute",left:-27,top:"50%",transform:"translateY(-50%)",width:12,height:12,borderRadius:"50%",background:"#fff",border:`3px solid ${s.accent}`}}/>
              <div style={{display:"flex",alignItems:"center",gap:14,background:"#fafafb",border:`1px solid ${s.border}`,borderRadius:14,padding:"13px 18px"}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:12,color:s.accent,flexShrink:0,width:46}}>{it.time}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:14,color:"#0d0f16",marginBottom:3}}>{it.ev}</div>
                  <div style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:s.txt2}}><I.Pin/>{it.loc}</div>
                </div>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:700,color:(TC[it.type]||TC.logistics).dot,flexShrink:0}}>{(TC[it.type]||TC.logistics).label}</span>
                <button onClick={()=>{setEditingId(it.id);setAdding(false);}} style={{...adminBtnSt,background:"#fff",border:`1px solid ${s.border}`,color:s.txt2}}>Edit</button>
                <button onClick={()=>{if(confirm(`Delete "${it.ev}"?`))del(it.id);}} style={{...adminBtnSt,background:"#fff",border:`1px solid ${s.border}`,color:s.err}}>Delete</button>
              </div>
            </div>
        ))}
        {adding&&<RowForm onSave={d=>{add(d);setAdding(false);}} onCancel={()=>setAdding(false)}/>}
        {dayItems.length===0&&!adding&&<div style={{padding:"24px 0",color:s.txt2,fontSize:13,textAlign:"center"}}>No events on Day {day}. Click "+ Add Event" to create one.</div>}
      </div>
    </div>
  );
}

function PgAdmin({api}){
  const sections={
    sched:{label:"Schedule",fields:[{k:"time",l:"Time"},{k:"ev",l:"Event"},{k:"loc",l:"Location"},{k:"day",l:"Day",type:"number"},{k:"type",l:"Type",options:[{v:"transport",l:"Transport"},{v:"logistics",l:"Logistics"},{v:"ceremony",l:"Ceremony"},{v:"competition",l:"Competition"},{v:"break",l:"Break"},{v:"mentoring",l:"Mentoring"}]},{k:"order",l:"Order",type:"number"}]},
    sm:{label:"Senior Mentors",fields:[{k:"name",l:"Name"},{k:"phone",l:"Phone"},{k:"email",l:"Email"},{k:"teams",l:"Teams Range"}]},
    venue:{label:"Venue",fields:[{k:"name",l:"Name"},{k:"floor",l:"Floor",options:[{v:"1F",l:"1F"},{v:"2F",l:"2F"},{v:"3F",l:"3F"}]},{k:"purpose",l:"Purpose"},{k:"cap",l:"Capacity"}]},
    prelim:{label:"Prelim Brackets",fields:[{k:"teams",l:"Team IDs (csv)",type:"csv-num"},{k:"time",l:"Time"},{k:"room",l:"Room"}]},
    roomMap:{label:"Room Map",fields:[{k:"person",l:"Person"},{k:"room",l:"Room"},{k:"floor",l:"Floor",options:[{v:"1F",l:"1F"},{v:"2F",l:"2F"},{v:"3F",l:"3F"}]}]},
    users:{label:"Users"},
    transport:{label:"Transport (one doc)"},
  };
  const[tab,setTab]=useState("sched");
  const current=sections[tab];
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      <PageHeader eyebrow="Admin Console">Edit Portal Data</PageHeader>
      <div style={{display:"flex",gap:6,marginBottom:24,flexWrap:"wrap"}}>
        {Object.entries(sections).map(([k,v])=><Pill key={k} active={tab===k} onClick={()=>setTab(k)}>{v.label}</Pill>)}
      </div>
      <div style={{borderRadius:18,padding:"22px 24px",background:"#fafafb",border:`1px solid ${s.border}`}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:700,color:s.accent,marginBottom:16}}>{current.label}</div>
        {tab==="transport"?
          <AdminTransport section={api.transport}/>:
        tab==="users"?
          <AdminUsersTable section={api.users}/>:
        tab==="sched"?
          <AdminScheduleEditor section={api.sched}/>:
          <AdminCrudTable section={api[tab]} fields={current.fields}/>
        }
      </div>
    </div>
  );
}

function DetailField({label,value,mono}){
  return(
    <div>
      <MonoTag style={{display:"block",marginBottom:6,color:s.txt2}}>{label}</MonoTag>
      <div style={{fontSize:14,fontWeight:600,color:value?"#0d0f16":s.txtM,fontFamily:mono?"'JetBrains Mono',monospace":undefined}}>{value||"—"}</div>
    </div>
  );
}
function EditableField({label,value,onChange,mono}){
  return(
    <div>
      <MonoTag style={{display:"block",marginBottom:6,color:s.txt2}}>{label}</MonoTag>
      <input value={value||""} onChange={e=>onChange(e.target.value)} style={{width:"100%",padding:"8px 12px",borderRadius:8,border:`1px solid ${s.border}`,fontSize:14,fontWeight:600,fontFamily:mono?"'JetBrains Mono',monospace":"inherit",outline:"none",background:"#fff",color:"#0d0f16",boxSizing:"border-box"}}/>
    </div>
  );
}
function AddStudentModal({teams,form,setForm,onSave,onClose,saving}){
  const setF=(k,v)=>setForm(p=>({...p,[k]:v}));
  const fld={width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${s.border}`,fontSize:13,fontFamily:"inherit",outline:"none",background:"#fff",color:s.txt,boxSizing:"border-box"};
  const lbl={fontSize:10,fontWeight:700,color:s.txt2,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4,display:"block"};
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(20,22,29,0.55)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#fff",borderRadius:18,padding:"26px 28px",maxWidth:520,width:"100%",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 12px 40px rgba(0,0,0,0.25)"}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:700,color:s.accent,marginBottom:8}}>New Student</div>
        <div style={{fontWeight:800,fontSize:20,letterSpacing:"-0.01em",color:"#0d0f16",marginBottom:18}}>Add to a team</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:6}}>
          <div>
            <label style={lbl}>Team *</label>
            <select value={form.teamId} onChange={e=>setF("teamId",e.target.value)} style={fld}>
              {teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Name *</label>
            <input value={form.name} onChange={e=>setF("name",e.target.value)} style={fld} autoFocus/>
          </div>
          <div>
            <label style={lbl}>Phone</label>
            <input value={form.phone} onChange={e=>setF("phone",e.target.value)} style={fld}/>
          </div>
          <div>
            <label style={lbl}>Email</label>
            <input value={form.email} onChange={e=>setF("email",e.target.value)} style={fld}/>
          </div>
          <div>
            <label style={lbl}>Transport</label>
            <input value={form.transport} onChange={e=>setF("transport",e.target.value)} style={fld}/>
          </div>
          <div>
            <label style={lbl}>Insurance</label>
            <input value={form.insurance} onChange={e=>setF("insurance",e.target.value)} style={fld}/>
          </div>
          <div>
            <label style={lbl}>Emergency contact name</label>
            <input value={form.emergencyName} onChange={e=>setF("emergencyName",e.target.value)} style={fld}/>
          </div>
          <div>
            <label style={lbl}>Relationship</label>
            <input value={form.emergencyRel} onChange={e=>setF("emergencyRel",e.target.value)} style={fld}/>
          </div>
          <div style={{gridColumn:"1 / -1"}}>
            <label style={lbl}>Emergency contact phone</label>
            <input value={form.emergencyPhone} onChange={e=>setF("emergencyPhone",e.target.value)} style={fld}/>
          </div>
        </div>
        <p style={{fontSize:12,color:s.txt2,marginTop:14,marginBottom:18}}>Only name + team are required. Other fields can be filled later from the detail page.</p>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button onClick={onClose} disabled={saving} style={{padding:"10px 18px",borderRadius:10,border:`1px solid ${s.border}`,background:"#fff",color:s.txt2,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
          <button onClick={onSave} disabled={saving} style={{padding:"10px 22px",borderRadius:10,border:"none",background:s.accent,color:"#fff",fontSize:13,fontWeight:700,cursor:saving?"wait":"pointer",fontFamily:"inherit",opacity:saving?0.7:1}}>{saving?"Adding…":"Add Student"}</button>
        </div>
      </div>
    </div>
  );
}

function PgStudents({teams,roomMap=[],actions}){
  const rmLookup=Object.fromEntries(roomMap.map(r=>[r.person,{room:r.room,floor:r.floor}]));
  const[srch,setSrch]=useState("");
  const[selKey,setSelKey]=useState(null); // {teamId, studentId}
  const[editing,setEditing]=useState(false);
  const[form,setForm]=useState(null);
  const[addOpen,setAddOpen]=useState(false);
  const[addForm,setAddForm]=useState({teamId:"",name:"",phone:"",email:"",transport:"",insurance:"",emergencyName:"",emergencyRel:"",emergencyPhone:""});
  const[addSaving,setAddSaving]=useState(false);

  const openAdd=()=>{setAddForm({teamId:teams[0]?.id||"",name:"",phone:"",email:"",transport:"",insurance:"",emergencyName:"",emergencyRel:"",emergencyPhone:""});setAddOpen(true);};
  const submitAdd=async()=>{
    if(!addForm.name.trim())return alert("Name is required");
    if(!addForm.teamId)return alert("Pick a team");
    setAddSaving(true);
    try{
      const newStudent=await actions.add(addForm.teamId,addForm);
      if(!newStudent)return;
      setAddOpen(false);
      setSelKey({teamId:parseInt(addForm.teamId),studentId:newStudent.id});
    }finally{setAddSaving(false);}
  };
  const deleteStudent=async()=>{
    if(!sel)return;
    if(!confirm(`Delete ${sel.name}? This removes them from ${sel.team.name} and cannot be undone.`))return;
    setSelKey(null); // optimistic — close the detail view immediately
    actions.remove(sel.team.id,sel.id,sel.userId);
  };

  const allStudents=[];
  teams.forEach(tm=>tm.students.forEach(st=>allStudents.push({...st,team:tm,room:rmLookup[st.name]?.room||null,floor:rmLookup[st.name]?.floor||null})));
  const sel=selKey?allStudents.find(st=>st.team.id===selKey.teamId&&st.id===selKey.studentId):null;

  const startEdit=()=>{
    setForm({
      phone:sel.phone||"",
      email:sel.email||"",
      transport:sel.transport||"",
      insurance:sel.insurance||"",
      emergencyName:sel.emergencyName||"",
      emergencyRel:sel.emergencyRel||"",
      emergencyPhone:sel.emergencyPhone||"",
    });
    setEditing(true);
  };
  const cancelEdit=()=>{setEditing(false);setForm(null);};
  const saveEdit=()=>{
    // Optimistic: apply locally and close the editor immediately; the write
    // runs in the background and self-heals on failure.
    actions.update(sel.team.id,sel.id,form);
    setEditing(false);setForm(null);
  };

  const srchLow=srch.toLowerCase();
  const filtered=srch.trim()?allStudents.filter(st=>st.name.toLowerCase().includes(srchLow)):allStudents;

  if(sel){
    const sections=[
      {label:"Contact",keys:[["phone","Phone",true],["email","Email",false]]},
      {label:"Room & Team",readonly:true,fields:[{l:"Dorm Room",v:sel.room,m:true},{l:"Work Room",v:sel.team.workRoom,m:true}]},
      {label:"Logistics",keys:[["transport","Transport",false],["insurance","Insurance",false]]},
      {label:"Emergency Contact",keys:[["emergencyName","Name",false],["emergencyRel","Relationship",false],["emergencyPhone","Phone",true]]},
    ];
    return(
      <div style={{animation:"fadeUp 0.4s ease"}}>
        <button onClick={()=>{setSelKey(null);cancelEdit();}} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 16px",borderRadius:100,border:`1px solid ${s.border}`,background:"#fff",color:s.txt2,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:28}}>← Back</button>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:32}}>
          <div style={{width:56,height:56,borderRadius:14,background:"#efedfb",color:s.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800}}>{sel.name[0]}</div>
          <div>
            <div style={{fontWeight:800,fontSize:26,letterSpacing:"-0.02em",color:"#0d0f16"}}>{sel.name}</div>
            <div style={{fontSize:13,color:s.txt2,marginTop:4}}>{sel.team.name}</div>
          </div>
          <div style={{marginLeft:"auto",display:"flex",gap:10,alignItems:"center"}}>
            <MonoTag style={{color:sel.checkedIn?s.accent:s.txt2}}>{sel.checkedIn?"Checked In":"Not Checked In"}</MonoTag>
            {!editing?
              <>
                <button onClick={deleteStudent} style={{padding:"9px 14px",borderRadius:100,border:`1px solid ${s.border}`,background:"#fff",color:s.err,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Delete</button>
                <button onClick={startEdit} style={{padding:"9px 16px",borderRadius:100,border:"none",background:s.accent,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Edit Details</button>
              </>
              :
              <>
                <button onClick={cancelEdit} style={{padding:"9px 16px",borderRadius:100,border:`1px solid ${s.border}`,background:"#fff",color:s.txt2,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                <button onClick={saveEdit} style={{padding:"9px 18px",borderRadius:100,border:"none",background:s.accent,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Save</button>
              </>
            }
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {sections.map((sec,si)=>(
            <div key={si} style={{borderRadius:18,padding:"20px 24px",background:"#fafafb",border:"1px solid #ececef"}}>
              <MonoTag style={{display:"block",marginBottom:16,color:s.txt2}}>{sec.label}</MonoTag>
              <div style={{display:"grid",gridTemplateColumns:`repeat(${(sec.fields||sec.keys).length},1fr)`,gap:16}}>
                {sec.readonly||!editing?
                  (sec.fields?sec.fields:sec.keys.map(([k,l,m])=>({l,v:sel[k],m}))).map((f,fi)=>
                    <DetailField key={fi} label={f.l} value={f.v} mono={f.m}/>
                  )
                  :
                  sec.keys.map(([k,l,m],fi)=>
                    <EditableField key={fi} label={l} value={form[k]} onChange={v=>setForm(p=>({...p,[k]:v}))} mono={m}/>
                  )
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return(
    <div style={{animation:"fadeUp 0.4s ease"}}>
      {addOpen&&<AddStudentModal teams={teams} form={addForm} setForm={setAddForm} onSave={submitAdd} onClose={()=>setAddOpen(false)} saving={addSaving}/>}
      <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:16,marginBottom:14}}>
        <PageHeader eyebrow="Admin View" mb={0}>Students</PageHeader>
        <button onClick={openAdd} style={{padding:"10px 18px",borderRadius:100,border:"none",background:s.accent,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>+ Add Student</button>
      </div>
      <SearchInput value={srch} onChange={e=>setSrch(e.target.value)} placeholder="Search by student name…"/>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filtered.map(st=>(
          <button key={`${st.team.id}-${st.id}`} onClick={()=>setSelKey({teamId:st.team.id,studentId:st.id})} style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"14px 20px",borderRadius:14,border:"1px solid #ececef",background:"#fafafb",cursor:"pointer",fontFamily:"inherit",textAlign:"left",color:s.txt,transition:"transform 0.16s"}}
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

