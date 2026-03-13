import React, { useState, useEffect, useRef } from 'react';

// ── STORAGE HELPERS ───────────────────────────────────────────────────────────
const STORAGE_KEYS = { program: "overload_program_v1", logs: "overload_logs_v1" };

function loadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

const DEFAULT_PROGRAM = {
  days: [
    { id:"push", name:"Push", color:"#ef4444", exercises:[
      { id:"bp",  name:"Bench Press",      muscle:"Chest",       sets:4, reps:"6-8",   rpe:"8", rest:"3:00", technique:"standard" },
      { id:"ohp", name:"Overhead Press",   muscle:"Shoulders",   sets:3, reps:"8-10",  rpe:"8", rest:"2:00", technique:"standard" },
      { id:"inc", name:"Incline DB Press", muscle:"Upper Chest", sets:3, reps:"10-12", rpe:"7", rest:"2:00", technique:"slow ecc" },
      { id:"lat", name:"Lateral Raises",   muscle:"Shoulders",   sets:3, reps:"15-20", rpe:"9", rest:"1:30", technique:"drop set" },
      { id:"tri", name:"Tricep Pushdown",  muscle:"Triceps",     sets:3, reps:"12-15", rpe:"8", rest:"1:30", technique:"standard" },
    ]},
    { id:"pull", name:"Pull", color:"#3b82f6", exercises:[
      { id:"dl",  name:"Deadlift",     muscle:"Back",       sets:4, reps:"5",     rpe:"9", rest:"3:00", technique:"standard" },
      { id:"row", name:"Barbell Row",  muscle:"Back",       sets:4, reps:"6-8",   rpe:"8", rest:"2:00", technique:"standard" },
      { id:"pu",  name:"Pull Ups",     muscle:"Lats",       sets:3, reps:"8-12",  rpe:"8", rest:"2:00", technique:"slow ecc" },
      { id:"fc",  name:"Face Pulls",   muscle:"Rear Delts", sets:3, reps:"15-20", rpe:"7", rest:"1:00", technique:"superset" },
      { id:"bc",  name:"Barbell Curl", muscle:"Biceps",     sets:3, reps:"10-12", rpe:"8", rest:"1:30", technique:"standard" },
    ]},
    { id:"legs", name:"Legs", color:"#22c55e", exercises:[
      { id:"sq",  name:"Squat",             muscle:"Quads",      sets:4, reps:"6-8",   rpe:"9", rest:"3:00", technique:"standard" },
      { id:"rdl", name:"Romanian Deadlift", muscle:"Hamstrings", sets:3, reps:"8-10",  rpe:"8", rest:"2:00", technique:"slow ecc" },
      { id:"lp",  name:"Leg Press",         muscle:"Quads",      sets:3, reps:"10-12", rpe:"7", rest:"2:00", technique:"drop set" },
      { id:"lc",  name:"Leg Curl",          muscle:"Hamstrings", sets:3, reps:"12-15", rpe:"8", rest:"1:30", technique:"standard" },
      { id:"cr",  name:"Calf Raise",        muscle:"Calves",     sets:4, reps:"15-20", rpe:"8", rest:"1:00", technique:"standard" },
    ]},
    { id:"upper", name:"Upper", color:"#f59e0b", exercises:[
      { id:"ubp",  name:"Bench Press",         muscle:"Chest",     sets:4, reps:"6-8",   rpe:"8", rest:"3:00", technique:"standard" },
      { id:"urow", name:"Cable Row",            muscle:"Back",      sets:4, reps:"8-10",  rpe:"8", rest:"2:00", technique:"standard" },
      { id:"uohp", name:"DB Shoulder Press",    muscle:"Shoulders", sets:3, reps:"10-12", rpe:"7", rest:"2:00", technique:"standard" },
      { id:"ulat", name:"Lat Pulldown",         muscle:"Lats",      sets:3, reps:"10-12", rpe:"8", rest:"1:30", technique:"slow ecc" },
      { id:"ubc",  name:"Incline DB Curl",      muscle:"Biceps",    sets:3, reps:"12-15", rpe:"8", rest:"1:30", technique:"superset" },
      { id:"utri", name:"Overhead Tricep Ext.", muscle:"Triceps",   sets:3, reps:"12-15", rpe:"7", rest:"1:30", technique:"standard" },
    ]},
    { id:"lower", name:"Lower", color:"#a855f7", exercises:[
      { id:"lsq",     name:"Front Squat",       muscle:"Quads",      sets:4, reps:"6-8",   rpe:"8", rest:"3:00", technique:"standard" },
      { id:"lrdl",    name:"Romanian Deadlift", muscle:"Hamstrings", sets:4, reps:"8-10",  rpe:"8", rest:"2:00", technique:"slow ecc" },
      { id:"llunge",  name:"Walking Lunges",    muscle:"Glutes",     sets:3, reps:"12/leg", rpe:"7", rest:"2:00", technique:"standard" },
      { id:"llegext", name:"Leg Extension",     muscle:"Quads",      sets:3, reps:"15-20", rpe:"9", rest:"1:00", technique:"drop set" },
      { id:"llcalf",  name:"Seated Calf Raise", muscle:"Calves",     sets:4, reps:"15-20", rpe:"7", rest:"1:00", technique:"standard" },
    ]},
  ]
};

const TECHNIQUES = ["standard","slow ecc","superset","drop set","cluster","pause rep","1.5 rep","rest-pause","giant set"];
const TECHNIQUE_COLOR = { standard:"#444","slow ecc":"#3b82f6",superset:"#a855f7","drop set":"#ef4444",cluster:"#f59e0b","pause rep":"#22c55e","1.5 rep":"#14b8a6","rest-pause":"#f97316","giant set":"#ec4899" };
const COLOR_OPTIONS = ["#ef4444","#f97316","#f59e0b","#22c55e","#14b8a6","#3b82f6","#6366f1","#a855f7","#ec4899"];
const uid = () => Math.random().toString(36).slice(2,9);
const fmtShort = d => new Date(d).toLocaleDateString("en-AU",{day:"numeric",month:"short"});

// ── OVERLOAD LOGO ─────────────────────────────────────────────────────────────
function OverloadLogo({ size="md", centered=false }) {
  const scales = { sm:0.55, md:0.85, lg:1 };
  const s = scales[size] || 0.85;
  const barWidths = [52,40,28,16].map(w => Math.round(w*s));
  const barH = Math.round(7*s), gap = Math.round(3*s);
  const colors = ["#ef4444","#cc3333","#aa2222","#881111"];

  if (centered) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:`${Math.round(10*s)}px`}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:`${gap}px`}}>
        {barWidths.map((w,i)=><div key={i} style={{width:`${w}px`,height:`${barH}px`,background:colors[i],borderRadius:"2px"}}/>)}
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:`${Math.round(42*s)}px`,color:"#f0f0f0",letterSpacing:`${Math.round(6*s)}px`,lineHeight:1}}>OVERLOAD</div>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:`${Math.round(8*s)}px`,color:"#555",letterSpacing:`${Math.round(3*s)}px`,marginTop:`${Math.round(3*s)}px`}}>WORKOUT TRACKER</div>
      </div>
    </div>
  );

  return (
    <div style={{display:"flex",alignItems:"center",gap:`${Math.round(14*s)}px`}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",gap:`${gap}px`,flexShrink:0}}>
        {barWidths.map((w,i)=><div key={i} style={{width:`${w}px`,height:`${barH}px`,background:colors[i],borderRadius:"2px"}}/>)}
      </div>
      <div style={{display:"flex",flexDirection:"column",lineHeight:1}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:`${Math.round(42*s)}px`,color:"#f0f0f0",letterSpacing:`${Math.round(4*s)}px`,lineHeight:1}}>OVERLOAD</div>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:`${Math.round(8*s)}px`,color:"#555",letterSpacing:`${Math.round(2.5*s)}px`,marginTop:`${Math.round(3*s)}px`}}>WORKOUT TRACKER</div>
      </div>
    </div>
  );
}

// ── REST TIMER ────────────────────────────────────────────────────────────────
function RestTimer({secs,onClose}){
  const [total]=useState(secs);const [rem,setRem]=useState(secs);const [running,setRunning]=useState(true);const [done,setDone]=useState(false);const ref=useRef();
  useEffect(()=>{if(running&&rem>0){ref.current=setInterval(()=>setRem(r=>{if(r<=1){clearInterval(ref.current);setRunning(false);setDone(true);try{const ctx=new(window.AudioContext||window.webkitAudioContext)();[0,.3,.6].forEach(d=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=880;g.gain.setValueAtTime(.4,ctx.currentTime+d);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+d+.25);o.start(ctx.currentTime+d);o.stop(ctx.currentTime+d+.3);});}catch{}return 0;}return r-1;}),1000);}return()=>clearInterval(ref.current);},[running,rem]);
  const prog=rem/total,r=50,circ=2*Math.PI*r,col=done?"#22c55e":rem<=10?"#ef4444":"#f59e0b";
  const presets=[60,90,120,180,240];
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.96)",zIndex:400,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <div style={{marginBottom:"24px"}}><OverloadLogo size="sm"/></div>
      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",letterSpacing:"3px",color:"#444",marginBottom:"24px"}}>{done?"— rest complete —":"— resting —"}</div>
      <div style={{position:"relative",width:"120px",height:"120px",marginBottom:"24px"}}>
        <svg width="120" height="120" style={{transform:"rotate(-90deg)"}}>
          <circle cx="60" cy="60" r={r} fill="none" stroke="#1a1a1a" strokeWidth="6"/>
          <circle cx="60" cy="60" r={r} fill="none" stroke={col} strokeWidth="6" strokeDasharray={`${circ*prog} ${circ}`} strokeLinecap="round" style={{transition:"stroke-dasharray 0.9s linear,stroke 0.3s"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:done?"22px":"34px",fontWeight:"700",color:col,letterSpacing:"-1px"}}>{done?"GO":`${Math.floor(rem/60)}:${String(rem%60).padStart(2,"0")}`}</span>
        </div>
      </div>
      <div style={{display:"flex",gap:"6px",marginBottom:"18px"}}>
        {presets.map(p=><button key={p} onClick={()=>{clearInterval(ref.current);setRem(p);setRunning(true);setDone(false);}} style={{background:p===total&&!done?"#1e1e1e":"transparent",border:`1px solid ${p===total&&!done?"#444":"#222"}`,borderRadius:"6px",padding:"6px 9px",color:p===total&&!done?"#f0f0f0":"#444",fontSize:"10px",fontFamily:"'IBM Plex Mono',monospace",cursor:"pointer"}}>{p<60?`${p}s`:p%60===0?`${p/60}m`:`${Math.floor(p/60)}:${String(p%60).padStart(2,"0")}`}</button>)}
      </div>
      <div style={{display:"flex",gap:"10px"}}>
        <button onClick={()=>!done&&setRunning(r=>!r)} style={{padding:"10px 20px",background:"#111",border:"1px solid #2a2a2a",borderRadius:"8px",color:done?"#333":running?"#888":"#f59e0b",fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",cursor:done?"default":"pointer"}}>{done?"—":running?"pause":"resume"}</button>
        <button onClick={onClose} style={{padding:"10px 20px",background:done?"#22c55e":"#111",border:`1px solid ${done?"#22c55e":"#2a2a2a"}`,borderRadius:"8px",color:done?"#000":"#666",fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",cursor:"pointer"}}>{done?"next set →":"skip"}</button>
      </div>
    </div>
  );
}

function Confirm({msg,onYes,onNo}){return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}><div style={{background:"#111",border:"1px solid #2a2a2a",borderRadius:"12px",padding:"24px",maxWidth:"320px",width:"100%",textAlign:"center"}}><div style={{color:"#f0f0f0",fontSize:"13px",marginBottom:"20px",lineHeight:"1.6",fontFamily:"'IBM Plex Mono',monospace"}}>{msg}</div><div style={{display:"flex",gap:"10px"}}><button onClick={onNo} style={{flex:1,padding:"10px",background:"transparent",border:"1px solid #2a2a2a",borderRadius:"8px",color:"#555",fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",cursor:"pointer"}}>cancel</button><button onClick={onYes} style={{flex:1,padding:"10px",background:"#ef4444",border:"none",borderRadius:"8px",color:"#fff",fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",cursor:"pointer"}}>confirm</button></div></div></div>);}

function ExForm({init,onSave,onClose}){
  const [f,setF]=useState(init||{name:"",muscle:"",sets:3,reps:"8-12",rpe:"8",rest:"2:00",technique:"standard",videoUrl:""});
  const u=(k,v)=>setF(x=>({...x,[k]:v}));
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.93)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{background:"#0f0f0f",borderRadius:"16px 16px 0 0",padding:"24px",width:"100%",maxWidth:"480px",border:"1px solid #1e1e1e",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",color:"#666",letterSpacing:"2px"}}>{init?"EDIT EXERCISE":"NEW EXERCISE"}</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#444",fontSize:"20px",cursor:"pointer"}}>×</button>
        </div>
        {[{l:"NAME",k:"name",t:"text",p:"e.g. Bench Press"},{l:"MUSCLE GROUP",k:"muscle",t:"text",p:"e.g. Chest"},{l:"DEFAULT SETS",k:"sets",t:"number",p:"3"},{l:"TARGET REPS",k:"reps",t:"text",p:"e.g. 8-12"},{l:"RPE TARGET",k:"rpe",t:"text",p:"e.g. 8"},{l:"REST PERIOD",k:"rest",t:"text",p:"e.g. 2:00"},{l:"VIDEO URL",k:"videoUrl",t:"url",p:"https://youtube.com/..."},].map(x=>(
          <div key={x.k} style={{marginBottom:"12px"}}>
            <div style={{fontSize:"9px",color:"#555",marginBottom:"5px",fontFamily:"'IBM Plex Mono',monospace",letterSpacing:"1px"}}>{x.l}</div>
            <input type={x.t} value={f[x.k]||""} placeholder={x.p} onChange={e=>u(x.k,e.target.value)} style={{width:"100%",background:"#1a1a1a",border:"1px solid #222",borderRadius:"8px",color:"#f0f0f0",padding:"10px 14px",fontSize:"14px",boxSizing:"border-box",outline:"none",fontFamily:"'IBM Plex Mono',monospace"}}/>
          </div>
        ))}
        <div style={{marginBottom:"16px"}}>
          <div style={{fontSize:"9px",color:"#555",marginBottom:"8px",fontFamily:"'IBM Plex Mono',monospace",letterSpacing:"1px"}}>TECHNIQUE</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
            {TECHNIQUES.map(t=><button key={t} onClick={()=>u("technique",t)} style={{padding:"6px 12px",background:f.technique===t?`${TECHNIQUE_COLOR[t]}22`:"transparent",border:`1px solid ${f.technique===t?TECHNIQUE_COLOR[t]:"#222"}`,borderRadius:"6px",color:f.technique===t?TECHNIQUE_COLOR[t]:"#444",fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",cursor:"pointer"}}>{t}</button>)}
          </div>
        </div>
        <button onClick={()=>{if(f.name?.trim())onSave(f);}} style={{width:"100%",padding:"13px",background:"#ef4444",border:"none",borderRadius:"8px",color:"#fff",fontFamily:"'IBM Plex Mono',monospace",fontSize:"12px",letterSpacing:"2px",cursor:"pointer",marginTop:"4px"}}>SAVE</button>
      </div>
    </div>
  );
}

function DayForm({init,onSave,onClose}){
  const [name,setName]=useState(init?.name||"");const [color,setColor]=useState(init?.color||COLOR_OPTIONS[0]);
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.93)",zIndex:400,display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}>
      <div style={{background:"#0f0f0f",borderRadius:"16px",padding:"24px",width:"100%",maxWidth:"380px",border:"1px solid #1e1e1e"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
          <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",color:"#666",letterSpacing:"2px"}}>{init?"EDIT DAY":"NEW DAY"}</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#444",fontSize:"20px",cursor:"pointer"}}>×</button>
        </div>
        <div style={{marginBottom:"16px"}}>
          <div style={{fontSize:"9px",color:"#555",marginBottom:"5px",fontFamily:"'IBM Plex Mono',monospace",letterSpacing:"1px"}}>NAME</div>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Push, Chest, Monday" style={{width:"100%",background:"#1a1a1a",border:"1px solid #222",borderRadius:"8px",color:"#f0f0f0",padding:"10px 14px",fontSize:"14px",boxSizing:"border-box",outline:"none",fontFamily:"'IBM Plex Mono',monospace"}}/>
        </div>
        <div style={{marginBottom:"22px"}}>
          <div style={{fontSize:"9px",color:"#555",marginBottom:"8px",fontFamily:"'IBM Plex Mono',monospace",letterSpacing:"1px"}}>COLOUR</div>
          <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
            {COLOR_OPTIONS.map(c=><div key={c} onClick={()=>setColor(c)} style={{width:"28px",height:"28px",borderRadius:"50%",background:c,cursor:"pointer",outline:color===c?"3px solid #fff":"3px solid transparent",outlineOffset:"2px"}}/>)}
          </div>
        </div>
        <button onClick={()=>{if(name.trim())onSave({name:name.trim(),color});}} style={{width:"100%",padding:"13px",background:color,border:"none",borderRadius:"8px",color:"#fff",fontFamily:"'IBM Plex Mono',monospace",fontSize:"12px",letterSpacing:"2px",cursor:"pointer"}}>{init?"SAVE CHANGES":"CREATE DAY"}</button>
      </div>
    </div>
  );
}

function MuscleVolume({day,logs}){
  const today=new Date().toISOString().slice(0,10);
  const muscleData={};
  day.exercises.forEach(ex=>{
    const key=`${day.id}__${ex.id}`;
    const ts=(logs[key]||[]).find(s=>s.date.slice(0,10)===today);
    const logged=ts?.sets?.length||0,m=ex.muscle||"Other";
    if(!muscleData[m])muscleData[m]={logged:0,target:0,volume:0};
    muscleData[m].target+=ex.sets;muscleData[m].logged+=logged;
    muscleData[m].volume+=(ts?.sets||[]).reduce((a,s)=>a+(s.weight||0)*(s.reps||0),0);
  });
  const muscles=Object.entries(muscleData);
  if(!muscles.length)return null;
  const maxVol=Math.max(...muscles.map(([,v])=>v.volume),1);
  return(
    <div style={{padding:"14px 20px",borderBottom:"1px solid #141414"}}>
      <div style={{fontSize:"9px",color:"#444",letterSpacing:"2px",marginBottom:"12px",fontFamily:"'IBM Plex Mono',monospace"}}>VOLUME BY MUSCLE</div>
      {muscles.map(([muscle,data])=>{
        const pct=data.volume/maxVol,done=data.logged>=data.target;
        return(
          <div key={muscle} style={{marginBottom:"10px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",color:done?"#f0f0f0":"#666"}}>{muscle}</span>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:done?day.color:"#333"}}>{data.logged}/{data.target} sets</span>
              </div>
              <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",color:data.volume>0?"#888":"#2a2a2a"}}>{data.volume>0?`${Math.round(data.volume).toLocaleString()} kg`:"—"}</span>
            </div>
            <div style={{height:"4px",background:"#1a1a1a",borderRadius:"2px",overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct*100}%`,background:done?day.color:`${day.color}55`,borderRadius:"2px",transition:"width 0.4s ease"}}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HistoryPanel({day,logs,onClose}){
  const color=day.color;
  const allDates=new Set();
  day.exercises.forEach(ex=>(logs[`${day.id}__${ex.id}`]||[]).forEach(s=>allDates.add(s.date.slice(0,10))));
  const dates=[...allDates].sort().reverse();
  const [sel,setSel]=useState(dates[0]||null);
  const snapshot=sel?day.exercises.map(ex=>({ex,session:(logs[`${day.id}__${ex.id}`]||[]).find(s=>s.date.slice(0,10)===sel)})):[];
  const muscleVol={};
  snapshot.forEach(({ex,session})=>{if(!session)return;const m=ex.muscle||"Other";if(!muscleVol[m])muscleVol[m]=0;muscleVol[m]+=(session.sets||[]).reduce((a,s)=>a+(s.weight||0)*(s.reps||0),0);});
  return(
    <div style={{position:"fixed",inset:0,background:"#0a0a0a",zIndex:300,display:"flex",flexDirection:"column",maxWidth:"480px",margin:"0 auto"}}>
      <div style={{padding:"44px 20px 14px",borderBottom:"1px solid #141414",flexShrink:0}}>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",padding:0,marginBottom:"14px",letterSpacing:"1px"}}>← BACK</button>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"20px",color,letterSpacing:"3px"}}>{day.name.toUpperCase()}</div>
        <div style={{fontSize:"9px",color:"#444",marginTop:"3px",fontFamily:"'IBM Plex Mono',monospace",letterSpacing:"1px"}}>SESSION HISTORY · {dates.length} sessions</div>
      </div>
      {dates.length===0?<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:"#2a2a2a",fontFamily:"'IBM Plex Mono',monospace",fontSize:"12px"}}>no sessions logged yet</div>:<>
        <div style={{display:"flex",gap:"6px",padding:"12px 20px",overflowX:"auto",borderBottom:"1px solid #141414",flexShrink:0}}>
          {dates.map(d=><button key={d} onClick={()=>setSel(d)} style={{flexShrink:0,padding:"7px 13px",background:sel===d?color:"transparent",border:`1px solid ${sel===d?color:"#222"}`,borderRadius:"6px",color:sel===d?"#fff":"#555",fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",cursor:"pointer"}}>{fmtShort(d)}</button>)}
        </div>
        {Object.keys(muscleVol).length>0&&(
          <div style={{padding:"12px 20px",borderBottom:"1px solid #141414",flexShrink:0}}>
            <div style={{fontSize:"9px",color:"#444",letterSpacing:"2px",marginBottom:"10px",fontFamily:"'IBM Plex Mono',monospace"}}>VOLUME BY MUSCLE</div>
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
              {Object.entries(muscleVol).map(([m,v])=><div key={m} style={{background:"#111",border:`1px solid ${color}33`,borderRadius:"6px",padding:"6px 10px"}}><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",color}}>{Math.round(v).toLocaleString()}<span style={{fontSize:"8px",color:"#555"}}> kg</span></div><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"8px",color:"#555",marginTop:"2px"}}>{m}</div></div>)}
            </div>
          </div>
        )}
        <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
          {snapshot.map(({ex,session})=>(
            <div key={ex.id} style={{marginBottom:"18px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"6px"}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"12px",fontWeight:"700",color:session?"#e0e0e0":"#2a2a2a"}}>{ex.name}</div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",color:"#444"}}>{ex.muscle}</div>
              </div>
              {session?(
                <div style={{border:"1px solid #1a1a1a",borderRadius:"8px",overflow:"hidden"}}>
                  <div style={{display:"grid",gridTemplateColumns:"28px 70px 50px 50px 1fr",gap:"4px",padding:"7px 12px",background:"#111",borderBottom:"1px solid #1a1a1a"}}>
                    {["SET","KG","REPS","RPE","NOTE"].map(h=><div key={h} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"8px",color:"#444",letterSpacing:"1px"}}>{h}</div>)}
                  </div>
                  {session.sets.map((s,si)=>(
                    <div key={si} style={{display:"grid",gridTemplateColumns:"28px 70px 50px 50px 1fr",gap:"4px",padding:"9px 12px",borderBottom:si<session.sets.length-1?"1px solid #141414":"none",alignItems:"center"}}>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",color:"#444"}}>{si+1}</div>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"13px",fontWeight:"700",color}}>{s.weight}<span style={{fontSize:"8px",color:"#555"}}> kg</span></div>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"13px",color:"#ccc"}}>{s.reps}</div>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"12px",color:"#888"}}>{s.rpe||"—"}</div>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",color:"#555",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.note||"—"}</div>
                    </div>
                  ))}
                </div>
              ):<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",color:"#222",padding:"6px 0"}}>not logged</div>}
            </div>
          ))}
        </div>
      </>}
    </div>
  );
}

function TechBadge({technique}){
  if(!technique||technique==="standard")return null;
  const c=TECHNIQUE_COLOR[technique]||"#444";
  return <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"8px",color:c,border:`1px solid ${c}44`,borderRadius:"4px",padding:"2px 5px",letterSpacing:"0.5px",whiteSpace:"nowrap"}}>{technique}</span>;
}

function SetLogger({ex,color,existingSets,onAddSet,onUpdateSet,onDeleteSet,onTimer,onClose}){
  const [weight,setWeight]=useState("");const [reps,setReps]=useState("");const [rpe,setRpe]=useState(ex.rpe||"");const [note,setNote]=useState("");
  const lastSet=existingSets.slice(-1)[0];
  function restToSecs(str){if(!str)return 90;const p=str.split(":");return p.length===2?parseInt(p[0])*60+parseInt(p[1]):parseInt(str)||90;}
  function handleAdd(){if(!weight)return;onAddSet({weight:parseFloat(weight),reps:parseInt(reps)||parseInt(ex.reps)||8,rpe:rpe||ex.rpe||"",note});setWeight("");setReps("");setRpe(ex.rpe||"");setNote("");onTimer(restToSecs(ex.rest));}
  return(
    <div style={{background:"#0d0d0d",border:`1px solid ${color}33`,borderRadius:"8px",padding:"14px",margin:"4px 0 10px"}}>
      {existingSets.length>0&&(
        <div style={{marginBottom:"14px"}}>
          <div style={{display:"grid",gridTemplateColumns:"24px 62px 46px 46px 1fr 22px",gap:"4px",padding:"0 2px 6px",borderBottom:"1px solid #1a1a1a",marginBottom:"4px"}}>
            {["#","KG","REPS","RPE","NOTE",""].map((h,i)=><div key={i} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"8px",color:"#444",letterSpacing:"1px"}}>{h}</div>)}
          </div>
          {existingSets.map((s,si)=>(
            <div key={si} style={{display:"grid",gridTemplateColumns:"24px 62px 46px 46px 1fr 22px",gap:"4px",padding:"7px 2px",borderBottom:"1px solid #111",alignItems:"center"}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",color:"#555"}}>{si+1}</div>
              <input type="number" value={s.weight} onChange={e=>onUpdateSet(si,{...s,weight:parseFloat(e.target.value)||0})} style={{background:"transparent",border:"none",borderBottom:"1px solid #222",color,fontFamily:"'IBM Plex Mono',monospace",fontSize:"12px",fontWeight:"700",width:"100%",outline:"none",padding:"2px 0"}}/>
              <input type="number" value={s.reps} onChange={e=>onUpdateSet(si,{...s,reps:parseInt(e.target.value)||0})} style={{background:"transparent",border:"none",borderBottom:"1px solid #222",color:"#ccc",fontFamily:"'IBM Plex Mono',monospace",fontSize:"12px",width:"100%",outline:"none",padding:"2px 0"}}/>
              <input type="text" value={s.rpe||""} placeholder="—" onChange={e=>onUpdateSet(si,{...s,rpe:e.target.value})} style={{background:"transparent",border:"none",borderBottom:"1px solid #222",color:"#888",fontFamily:"'IBM Plex Mono',monospace",fontSize:"12px",width:"100%",outline:"none",padding:"2px 0"}}/>
              <input type="text" value={s.note||""} placeholder="note…" onChange={e=>onUpdateSet(si,{...s,note:e.target.value})} style={{background:"transparent",border:"none",borderBottom:"1px solid #1a1a1a",color:"#555",fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",width:"100%",outline:"none",padding:"2px 0"}}/>
              <button onClick={()=>onDeleteSet(si)} style={{background:"none",border:"none",color:"#333",cursor:"pointer",fontSize:"14px",padding:"0",textAlign:"center",fontFamily:"'IBM Plex Mono',monospace"}}>×</button>
            </div>
          ))}
        </div>
      )}
      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"8px",color:"#555",letterSpacing:"1px",marginBottom:"8px"}}>SET {existingSets.length+1}{existingSets.length>=ex.sets?" — EXTRA":` OF ${ex.sets}`}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:"6px",marginBottom:"8px"}}>
        {[{l:"KG",v:weight,s:setWeight,t:"number",p:String(lastSet?.weight||"0")},{l:"REPS",v:reps,s:setReps,t:"number",p:String(parseInt(ex.reps)||8)},{l:"RPE",v:rpe,s:setRpe,t:"text",p:ex.rpe||"8"},{l:"NOTE",v:note,s:setNote,t:"text",p:"…"}].map(f=>(
          <div key={f.l}>
            <div style={{fontSize:"8px",color:"#444",marginBottom:"4px",fontFamily:"'IBM Plex Mono',monospace",letterSpacing:"1px"}}>{f.l}</div>
            <input type={f.t} value={f.v} placeholder={f.p} onChange={e=>f.s(e.target.value)} style={{width:"100%",background:"#1a1a1a",border:"1px solid #222",borderRadius:"6px",color:"#f0f0f0",padding:"9px 4px",fontSize:f.l==="NOTE"?"11px":"14px",fontWeight:f.l==="NOTE"?"400":"700",textAlign:"center",boxSizing:"border-box",outline:"none",fontFamily:"'IBM Plex Mono',monospace"}}/>
          </div>
        ))}
      </div>
      {ex.videoUrl&&<a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" style={{display:"block",fontSize:"9px",color:"#444",marginBottom:"10px",letterSpacing:"1px",textDecoration:"none",fontFamily:"'IBM Plex Mono',monospace"}}>▶ WATCH TECHNIQUE</a>}
      <div style={{display:"flex",gap:"8px"}}>
        <button onClick={onClose} style={{flex:1,padding:"10px",background:"transparent",border:"1px solid #1e1e1e",borderRadius:"6px",color:"#444",fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",cursor:"pointer",letterSpacing:"1px"}}>CLOSE</button>
        <button onClick={handleAdd} style={{flex:2,padding:"10px",background:color,border:"none",borderRadius:"6px",color:"#fff",fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",fontWeight:"700",cursor:"pointer",letterSpacing:"1px"}}>+ LOG SET {existingSets.length+1}</button>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App(){
  // ── Load from localStorage on first render ──
  const [program, setProgram] = useState(() => loadStorage(STORAGE_KEYS.program, DEFAULT_PROGRAM));
  const [logs,    setLogs]    = useState(() => loadStorage(STORAGE_KEYS.logs,    {}));

  const [view,       setView]       = useState("home");
  const [activeDay,  setActiveDay]  = useState(null);
  const [historyDay, setHistoryDay] = useState(null);
  const [timerSecs,  setTimerSecs]  = useState(null);
  const [editMode,   setEditMode]   = useState(false);
  const [logOpen,    setLogOpen]    = useState(null);
  const [showDayForm,  setShowDayForm]  = useState(false);
  const [editingDay,   setEditingDay]   = useState(null);
  const [showExForm,   setShowExForm]   = useState(false);
  const [editingEx,    setEditingEx]    = useState(null);
  const [confirm,      setConfirm]      = useState(null);
  const [savedToast,   setSavedToast]   = useState(false);

  // ── Persist on every change ──
  function saveProgram(p){ setProgram(p); saveStorage(STORAGE_KEYS.program, p); }
  function saveLogs(l)   { setLogs(l);    saveStorage(STORAGE_KEYS.logs,    l); flashSaved(); }

  function flashSaved(){
    setSavedToast(true);
    setTimeout(()=>setSavedToast(false), 1400);
  }

  const currentDay = program.days.find(d=>d.id===activeDay);

  const addDay  = d      => { saveProgram({days:[...program.days,{id:uid(),...d,exercises:[]}]}); setShowDayForm(false); };
  const updDay  = (id,d) => { saveProgram({days:program.days.map(x=>x.id===id?{...x,...d}:x)}); setEditingDay(null); };
  const delDay  = id     => { saveProgram({days:program.days.filter(x=>x.id!==id)}); setConfirm(null); setView("home"); };
  const addEx   = (dayId,d)      => { saveProgram({days:program.days.map(x=>x.id===dayId?{...x,exercises:[...x.exercises,{id:uid(),...d}]}:x)}); setShowExForm(false); };
  const updEx   = (dayId,exId,d) => { saveProgram({days:program.days.map(x=>x.id===dayId?{...x,exercises:x.exercises.map(e=>e.id===exId?{...e,...d}:e)}:x)}); setEditingEx(null); };
  const delEx   = (dayId,exId)   => { saveProgram({days:program.days.map(x=>x.id===dayId?{...x,exercises:x.exercises.filter(e=>e.id!==exId)}:x)}); setConfirm(null); };
  const moveEx  = (dayId,exId,dir) => {
    const day=program.days.find(d=>d.id===dayId),exs=[...day.exercises],i=exs.findIndex(e=>e.id===exId),ni=i+dir;
    if(ni<0||ni>=exs.length)return;[exs[i],exs[ni]]=[exs[ni],exs[i]];
    saveProgram({days:program.days.map(d=>d.id===dayId?{...d,exercises:exs}:d)});
  };

  function getTodaySession(dayId,exId){
    const key=`${dayId}__${exId}`,today=new Date().toISOString().slice(0,10),all=logs[key]||[],idx=all.findIndex(s=>s.date.slice(0,10)===today);
    return{key,all,idx,today};
  }
  function addSet(dayId,exId,entry){
    const{key,all,idx}=getTodaySession(dayId,exId);
    saveLogs({...logs,[key]:idx>=0?all.map((s,i)=>i===idx?{...s,sets:[...s.sets,entry]}:s):[...all,{date:new Date().toISOString(),sets:[entry]}]});
  }
  function updateSet(dayId,exId,si,entry){
    const{key,all,idx}=getTodaySession(dayId,exId);if(idx<0)return;
    saveLogs({...logs,[key]:all.map((s,i)=>i===idx?{...s,sets:s.sets.map((x,j)=>j===si?entry:x)}:s)});
  }
  function deleteSet(dayId,exId,si){
    const{key,all,idx}=getTodaySession(dayId,exId);if(idx<0)return;
    saveLogs({...logs,[key]:all.map((s,i)=>i===idx?{...s,sets:s.sets.filter((_,j)=>j!==si)}:s)});
  }
  function getTodaySets(dayId,exId){const{all,idx}=getTodaySession(dayId,exId);return idx>=0?all[idx].sets:[];}

  const totalSessions=new Set(Object.values(logs).flat().map(s=>s.date?.slice(0,10))).size;
  const totalSets=Object.values(logs).reduce((a,arr)=>a+arr.reduce((b,s)=>b+(s.sets?.length||0),0),0);

  // ── SAVED TOAST ───────────────────────────────────────────────────────────
  const Toast = () => (
    <div style={{
      position:"fixed", bottom:"24px", left:"50%", transform:`translateX(-50%) translateY(${savedToast?"0":"12px"})`,
      background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:"8px",
      padding:"10px 18px", fontFamily:"'IBM Plex Mono',monospace", fontSize:"11px",
      color:"#22c55e", letterSpacing:"1px", zIndex:600,
      opacity:savedToast?1:0, transition:"all 0.25s ease", pointerEvents:"none",
      display:"flex", alignItems:"center", gap:"8px"
    }}>
      <span style={{fontSize:"13px"}}>✓</span> SAVED
    </div>
  );

  // ── HOME ──────────────────────────────────────────────────────────────────
  if(view==="home")return(
    <>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;500;700&display=swap" rel="stylesheet"/>
      <div style={{minHeight:"100vh",background:"#0a0a0a",color:"#f0f0f0",fontFamily:"'IBM Plex Mono',monospace",maxWidth:"480px",margin:"0 auto",paddingBottom:"40px"}}>
        <div style={{padding:"48px 20px 24px",borderBottom:"1px solid #141414",display:"flex",flexDirection:"column",alignItems:"center"}}>
          <OverloadLogo size="lg" centered={true}/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1px",marginTop:"28px",border:"1px solid #1a1a1a",borderRadius:"8px",overflow:"hidden",width:"100%"}}>
            {[{l:"DAYS",v:program.days.length},{l:"EXERCISES",v:program.days.reduce((a,d)=>a+d.exercises.length,0)},{l:"SESSIONS",v:totalSessions}].map(s=>(
              <div key={s.l} style={{background:"#111",padding:"12px 10px",textAlign:"center"}}>
                <div style={{fontSize:"20px",fontWeight:"700",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:"1px"}}>{s.v}</div>
                <div style={{fontSize:"8px",color:"#444",marginTop:"3px",letterSpacing:"1px"}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{padding:"20px 20px 0"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
            <div style={{fontSize:"9px",color:"#444",letterSpacing:"2px"}}>PROGRAMME</div>
            <button onClick={()=>setEditMode(!editMode)} style={{background:editMode?"#ef4444":"transparent",border:`1px solid ${editMode?"#ef4444":"#2a2a2a"}`,borderRadius:"6px",color:editMode?"#fff":"#555",padding:"6px 12px",fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",letterSpacing:"1px",cursor:"pointer"}}>
              {editMode?"✓ DONE":"EDIT"}
            </button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 44px 72px",gap:"8px",padding:"6px 8px 8px",borderBottom:"1px solid #1a1a1a"}}>
            {["DAY","EX","LAST"].map(h=><div key={h} style={{fontSize:"8px",color:"#333",letterSpacing:"1px"}}>{h}</div>)}
          </div>
          {program.days.map(day=>{
            const lastDate=day.exercises.map(e=>logs[`${day.id}__${e.id}`]?.slice(-1)[0]?.date).filter(Boolean).sort().slice(-1)[0];
            return(
              <div key={day.id} style={{borderBottom:"1px solid #141414"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 44px 72px",gap:"8px",padding:"13px 8px",alignItems:"center",cursor:editMode?"default":"pointer"}}
                  onClick={()=>{if(!editMode){setActiveDay(day.id);setView("day");setEditMode(false);}}}>
                  <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                    <div style={{width:"3px",height:"30px",background:day.color,borderRadius:"2px",flexShrink:0}}/>
                    <div>
                      <div style={{fontSize:"13px",fontWeight:"700",color:"#f0f0f0"}}>{day.name}</div>
                      <div style={{fontSize:"9px",color:"#444",marginTop:"2px"}}>{day.exercises.slice(0,3).map(e=>e.muscle).filter((m,i,a)=>m&&a.indexOf(m)===i).join(" · ")}</div>
                    </div>
                  </div>
                  <div style={{fontSize:"12px",color:"#555"}}>{day.exercises.length}</div>
                  <div style={{fontSize:"10px",color:lastDate?"#555":"#222"}}>{lastDate?fmtShort(lastDate):"—"}</div>
                </div>
                {editMode&&(
                  <div style={{display:"flex",gap:"6px",padding:"0 8px 12px"}}>
                    <button onClick={()=>setEditingDay(day)} style={{flex:1,padding:"7px",background:"transparent",border:"1px solid #222",borderRadius:"6px",color:"#777",fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",cursor:"pointer",letterSpacing:"1px"}}>RENAME</button>
                    <button onClick={()=>{setHistoryDay(day);setView("history");}} style={{flex:1,padding:"7px",background:"transparent",border:`1px solid ${day.color}44`,borderRadius:"6px",color:day.color,fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",cursor:"pointer",letterSpacing:"1px"}}>HISTORY</button>
                    <button onClick={()=>setConfirm({msg:`Delete "${day.name}" day?`,onYes:()=>delDay(day.id)})} style={{padding:"7px 12px",background:"transparent",border:"1px solid #1e1e1e",borderRadius:"6px",color:"#ef4444",fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",cursor:"pointer"}}>✕</button>
                  </div>
                )}
              </div>
            );
          })}
          <button onClick={()=>setShowDayForm(true)} style={{width:"100%",padding:"13px",background:"transparent",border:"1px dashed #1e1e1e",borderRadius:"8px",color:"#2a2a2a",fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",letterSpacing:"2px",cursor:"pointer",marginTop:"12px"}}>+ ADD DAY</button>
        </div>
      </div>
      {showDayForm&&<DayForm onSave={addDay} onClose={()=>setShowDayForm(false)}/>}
      {editingDay&&<DayForm init={editingDay} onSave={d=>updDay(editingDay.id,d)} onClose={()=>setEditingDay(null)}/>}
      {confirm&&<Confirm msg={confirm.msg} onYes={confirm.onYes} onNo={()=>setConfirm(null)}/>}
      <Toast/>
      <style>{CSS}</style>
    </>
  );

  if(view==="history"&&historyDay)return(
    <>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;500;700&display=swap" rel="stylesheet"/>
      <HistoryPanel day={historyDay} logs={logs} onClose={()=>{setView(activeDay?"day":"home");setHistoryDay(null);}}/>
      <style>{CSS}</style>
    </>
  );

  if(view==="day"&&currentDay)return(
    <>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;500;700&display=swap" rel="stylesheet"/>
      <div style={{minHeight:"100vh",background:"#0a0a0a",color:"#f0f0f0",fontFamily:"'IBM Plex Mono',monospace",maxWidth:"480px",margin:"0 auto",paddingBottom:"60px"}}>
        <div style={{padding:"44px 20px 14px",borderBottom:"1px solid #141414"}}>
          <button onClick={()=>{setView("home");setEditMode(false);setLogOpen(null);}} style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",padding:0,marginBottom:"14px",letterSpacing:"1px",display:"flex",alignItems:"center",gap:"8px"}}>
            ← <OverloadLogo size="sm"/>
          </button>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                <div style={{width:"4px",height:"26px",background:currentDay.color,borderRadius:"2px"}}/>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"26px",color:"#f0f0f0",letterSpacing:"3px"}}>{currentDay.name.toUpperCase()}</div>
              </div>
              <div style={{fontSize:"9px",color:"#444",marginTop:"5px",letterSpacing:"1px",paddingLeft:"14px"}}>{new Date().toLocaleDateString("en-AU",{weekday:"short",day:"numeric",month:"short"})}</div>
            </div>
            <div style={{display:"flex",gap:"8px"}}>
              <button onClick={()=>{setHistoryDay(currentDay);setView("history");}} style={{padding:"7px 11px",background:"transparent",border:`1px solid ${currentDay.color}55`,borderRadius:"6px",color:currentDay.color,fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",letterSpacing:"1px",cursor:"pointer"}}>HISTORY</button>
              <button onClick={()=>{setEditMode(!editMode);setLogOpen(null);}} style={{padding:"7px 11px",background:editMode?currentDay.color:"transparent",border:`1px solid ${editMode?currentDay.color:"#2a2a2a"}`,borderRadius:"6px",color:editMode?"#fff":"#555",fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",letterSpacing:"1px",cursor:"pointer"}}>{editMode?"✓ DONE":"EDIT"}</button>
            </div>
          </div>
        </div>
        <MuscleVolume day={currentDay} logs={logs}/>
        <div style={{padding:"0 20px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 38px 52px 38px 44px 60px",gap:"4px",padding:"10px 6px 8px",borderBottom:"1px solid #1a1a1a"}}>
            {["EXERCISE","SETS","REPS","RPE","REST","METHOD"].map(h=><div key={h} style={{fontSize:"8px",color:"#333",letterSpacing:"1px"}}>{h}</div>)}
          </div>
          {currentDay.exercises.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:"#222",fontSize:"11px",letterSpacing:"1px"}}>NO EXERCISES — ADD ONE BELOW</div>}
          {currentDay.exercises.map(ex=>{
            const todaySets=getTodaySets(currentDay.id,ex.id);
            const isOpen=logOpen===ex.id,allDone=todaySets.length>=ex.sets;
            return(
              <div key={ex.id} style={{borderBottom:"1px solid #141414"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 38px 52px 38px 44px 60px",gap:"4px",padding:"12px 6px",alignItems:"center",cursor:editMode?"default":"pointer"}}
                  onClick={()=>{if(!editMode)setLogOpen(isOpen?null:ex.id);}}>
                  <div>
                    <div style={{fontSize:"12px",fontWeight:"500",color:isOpen?currentDay.color:allDone?"#555":"#e0e0e0"}}>{ex.name}</div>
                    <div style={{fontSize:"9px",color:"#444",marginTop:"2px"}}>{ex.muscle}</div>
                  </div>
                  <div style={{fontSize:"11px",fontWeight:"700",color:allDone?"#22c55e":todaySets.length>0?currentDay.color:"#555"}}>{todaySets.length}/{ex.sets}</div>
                  <div style={{fontSize:"11px",color:"#666"}}>{ex.reps}</div>
                  <div style={{fontSize:"11px",color:"#666"}}>{ex.rpe||"—"}</div>
                  <div style={{fontSize:"10px",color:"#555"}}>{ex.rest||"—"}</div>
                  <div><TechBadge technique={ex.technique}/></div>
                </div>
                {editMode&&(
                  <div style={{display:"flex",gap:"6px",padding:"0 6px 10px"}}>
                    <button onClick={()=>moveEx(currentDay.id,ex.id,-1)} style={{padding:"6px 10px",background:"transparent",border:"1px solid #1e1e1e",borderRadius:"6px",color:"#555",fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",cursor:"pointer"}}>↑</button>
                    <button onClick={()=>moveEx(currentDay.id,ex.id,1)}  style={{padding:"6px 10px",background:"transparent",border:"1px solid #1e1e1e",borderRadius:"6px",color:"#555",fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",cursor:"pointer"}}>↓</button>
                    <button onClick={()=>setEditingEx(ex)} style={{flex:1,padding:"6px",background:"transparent",border:"1px solid #222",borderRadius:"6px",color:"#777",fontFamily:"'IBM Plex Mono',monospace",fontSize:"9px",cursor:"pointer",letterSpacing:"1px"}}>EDIT</button>
                    <button onClick={()=>setConfirm({msg:`Remove "${ex.name}"?`,onYes:()=>delEx(currentDay.id,ex.id)})} style={{padding:"6px 12px",background:"transparent",border:"1px solid #1e1e1e",borderRadius:"6px",color:"#ef4444",fontFamily:"'IBM Plex Mono',monospace",fontSize:"11px",cursor:"pointer"}}>✕</button>
                  </div>
                )}
                {isOpen&&!editMode&&(
                  <SetLogger ex={ex} color={currentDay.color} existingSets={todaySets}
                    onAddSet={s=>addSet(currentDay.id,ex.id,s)}
                    onUpdateSet={(i,s)=>updateSet(currentDay.id,ex.id,i,s)}
                    onDeleteSet={i=>deleteSet(currentDay.id,ex.id,i)}
                    onTimer={setTimerSecs} onClose={()=>setLogOpen(null)}/>
                )}
              </div>
            );
          })}
          <button onClick={()=>setShowExForm(true)} style={{width:"100%",padding:"13px",background:"transparent",border:"1px dashed #1e1e1e",borderRadius:"8px",color:"#2a2a2a",fontFamily:"'IBM Plex Mono',monospace",fontSize:"10px",letterSpacing:"2px",cursor:"pointer",marginTop:"12px"}}>+ ADD EXERCISE</button>
        </div>
      </div>
      {showExForm&&<ExForm onSave={d=>addEx(currentDay.id,d)} onClose={()=>setShowExForm(false)}/>}
      {editingEx&&<ExForm init={editingEx} onSave={d=>updEx(currentDay.id,editingEx.id,d)} onClose={()=>setEditingEx(null)}/>}
      {confirm&&<Confirm msg={confirm.msg} onYes={confirm.onYes} onNo={()=>setConfirm(null)}/>}
      {timerSecs&&<RestTimer secs={timerSecs} onClose={()=>setTimerSecs(null)}/>}
      <Toast/>
      <style>{CSS}</style>
    </>
  );
  return null;
}

const CSS=`*{box-sizing:border-box;-webkit-tap-highlight-color:transparent} input::placeholder{color:#2a2a2a!important} ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#1e1e1e}`;