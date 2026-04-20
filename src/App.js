import { useState, useEffect, useCallback } from "react";
import { db } from "./firebase";
import {
  doc, onSnapshot, setDoc, getDoc
} from "firebase/firestore";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const COUPLE_ID = "lei-fah-2026"; // shared document ID

const T = {
  en: {
    appName:"Yoozoo", tagline:"Our Little Secret 🌺",
    calendar:"Calendar", stats:"Stats", intimate:"Intimate", messages:"Messages",
    nextPeriod:"Next Period", daysLater:"days", today:"Today", inProgress:"In progress",
    modeConceive:"Trying", modeAvoid:"Avoid",
    periodDay:"Period", fertileDay:"Fertile", ovulationDay:"Ovulation",
    predictedPeriod:"Predicted", safeDay:"Safe",
    savelog:"Save", cancel:"Cancel",
    mood:"Mood", symptoms:"Symptoms", note:"Note", notePlaceholder:"How are you feeling…",
    intimate_log:"Intimate Log", intimateTime:"Time", intimateNote:"Note",
    contraception:"Protection", addIntimate:"+ Log Intimate",
    pregnancyChance:"Pregnancy chance",
    high:"High", mid:"Medium", low:"Low", safe:"Safe",
    avgCycle:"Avg Cycle", avgPeriod:"Avg Period", totalCycles:"Cycles", intimateMonth:"Intimate (month)",
    send:"Send", msgPlaceholderLei:"Message to Fah…", msgPlaceholderFah:"Message to Lei…",
    aiDaily:"Today's Message", aiLoading:"Thinking…", refreshAI:"Get Today's Message ✨",
    markPeriodStart:"Mark Period Start", markPeriodEnd:"Mark Period End",
    corrected:"Cycle auto-updated from actual data",
    cycleDay:"Day", nth:"#", syncing:"Syncing…", synced:"Synced ✓",
    contraOptions:["No protection","Condom","Withdrawal","No ejaculation","Morning-after","Daily pill","Long-term pill","IUD","Other","Solo"],
  },
  zh: {
    appName:"柚子", tagline:"我们的小秘密 🌺",
    calendar:"日历", stats:"统计", intimate:"亲密", messages:"留言",
    nextPeriod:"下次经期", daysLater:"天", today:"今天", inProgress:"进行中",
    modeConceive:"备孕", modeAvoid:"避孕",
    periodDay:"经期", fertileDay:"易孕", ovulationDay:"排卵日",
    predictedPeriod:"预测", safeDay:"安全",
    savelog:"保存", cancel:"取消",
    mood:"心情", symptoms:"症状", note:"备注", notePlaceholder:"今天有什么想说的…",
    intimate_log:"亲密记录", intimateTime:"时间", intimateNote:"备注",
    contraception:"避孕方式", addIntimate:"+ 记录亲密",
    pregnancyChance:"怀孕概率",
    high:"高", mid:"中", low:"低", safe:"安全",
    avgCycle:"平均周期", avgPeriod:"平均经期", totalCycles:"周期数", intimateMonth:"本月亲密",
    send:"发送", msgPlaceholderLei:"给 Fah 留言…", msgPlaceholderFah:"给 Lei 留言…",
    aiDaily:"今日消息", aiLoading:"思考中…", refreshAI:"获取今日消息 ✨",
    markPeriodStart:"标记经期开始", markPeriodEnd:"标记经期结束",
    corrected:"已根据实际数据自动修正周期",
    cycleDay:"第", nth:"第", syncing:"同步中…", synced:"已同步 ✓",
    contraOptions:["无措施","避孕套","体外排精","未射精","紧急避孕药","短效避孕药","长效避孕药","节育环","其他措施","自慰"],
  },
  th: {
    appName:"ยูซู", tagline:"ความลับของเรา 🌺",
    calendar:"ปฏิทิน", stats:"สถิติ", intimate:"ความใกล้ชิด", messages:"ข้อความ",
    nextPeriod:"ประจำเดือนครั้งถัดไป", daysLater:"วัน", today:"วันนี้", inProgress:"กำลังดำเนินการ",
    modeConceive:"ตั้งครรภ์", modeAvoid:"คุมกำเนิด",
    periodDay:"ประจำเดือน", fertileDay:"วันเจริญพันธุ์", ovulationDay:"วันตกไข่",
    predictedPeriod:"คาดการณ์", safeDay:"ปลอดภัย",
    savelog:"บันทึก", cancel:"ยกเลิก",
    mood:"อารมณ์", symptoms:"อาการ", note:"บันทึก", notePlaceholder:"รู้สึกอย่างไรวันนี้…",
    intimate_log:"บันทึกความใกล้ชิด", intimateTime:"เวลา", intimateNote:"บันทึก",
    contraception:"การคุมกำเนิด", addIntimate:"+ บันทึก",
    pregnancyChance:"โอกาสตั้งครรภ์",
    high:"สูง", mid:"ปานกลาง", low:"ต่ำ", safe:"ปลอดภัย",
    avgCycle:"รอบเฉลี่ย", avgPeriod:"ประจำเดือนเฉลี่ย", totalCycles:"รอบ", intimateMonth:"ความใกล้ชิด (เดือน)",
    send:"ส่ง", msgPlaceholderLei:"ข้อความถึง Fah…", msgPlaceholderFah:"ข้อความถึง Lei…",
    aiDaily:"ข้อความวันนี้", aiLoading:"กำลังคิด…", refreshAI:"รับข้อความวันนี้ ✨",
    markPeriodStart:"บันทึกวันเริ่มประจำเดือน", markPeriodEnd:"บันทึกวันสิ้นสุดประจำเดือน",
    corrected:"อัปเดตรอบตามข้อมูลจริงแล้ว",
    cycleDay:"วันที่", nth:"ครั้งที่", syncing:"กำลังซิงค์…", synced:"ซิงค์แล้ว ✓",
    contraOptions:["ไม่ได้คุมกำเนิด","ถุงยาง","ถอนออก","ไม่หลั่ง","ยาคุมฉุกเฉิน","ยาคุมรายวัน","ยาคุมระยะยาว","ห่วงอนามัย","อื่นๆ","ช่วยตัวเอง"],
  },
};

const SYMPTOMS = {
  en:["Cramps","Headache","Back Pain","Fatigue","Nausea","Bloating","Breast Tenderness","Insomnia","Cravings","Mood Swings","Spotting","Heavy Flow"],
  zh:["痛经","头痛","腰酸","疲倦","恶心","浮肿","胸胀","失眠","食欲旺盛","情绪波动","点滴出血","量多"],
  th:["ปวดท้อง","ปวดหัว","ปวดหลัง","อ่อนเพลีย","คลื่นไส้","ท้องอืด","เจ็บเต้านม","นอนไม่หลับ","อยากอาหาร","อารมณ์แปรปรวน","เลือดออกกะปริบ","ปริมาณมาก"],
};
const MOODS = ["😄","😊","😐","😔","😴","😤","🥰","🤢","😰","🤩"];
const CONTRA_ICONS = ["🔓","🛡️","💧","🚫","💊","💊","💉","🔩","🌂","🤲"];

// ─── ALGORITHM ────────────────────────────────────────────────────────────────
function computeAdaptiveCycle(actualPeriods) {
  if (!actualPeriods || actualPeriods.length < 1) return { avgLength:28, avgPeriod:5 };
  const lengths = [];
  for (let i = 1; i < actualPeriods.length; i++)
    lengths.push(diffDays(actualPeriods[i-1].start, actualPeriods[i].start));
  let avgLength = 28;
  if (lengths.length > 0) {
    const weights = lengths.map((_,i) => i+1);
    const tw = weights.reduce((a,b)=>a+b,0);
    avgLength = Math.round(lengths.reduce((s,l,i)=>s+l*weights[i],0)/tw);
    avgLength = Math.max(21, Math.min(35, avgLength));
  }
  const pLengths = actualPeriods.filter(p=>p.end).map(p=>diffDays(p.start,p.end)+1);
  const avgPeriod = pLengths.length>0 ? Math.round(pLengths.reduce((a,b)=>a+b,0)/pLengths.length) : 5;
  return { avgLength, avgPeriod: Math.max(3, Math.min(8, avgPeriod)) };
}

function buildAllCycles(actualPeriods, avgLength, avgPeriod) {
  if (!actualPeriods || actualPeriods.length===0) return [];
  const result = actualPeriods.map(p=>({...p, actual:true}));
  let base = actualPeriods[actualPeriods.length-1].start;
  for (let i=0; i<4; i++) {
    const ns = addDays(base, avgLength);
    result.push({ start:ns, end:null, actual:false });
    base = ns;
  }
  return result;
}

function getCycleStatus(dateStr, allCycles, avgLength, avgPeriod) {
  for (let i=0; i<allCycles.length; i++) {
    const c = allCycles[i];
    const periodEnd = c.end || addDays(c.start, avgPeriod-1);
    const nextStart = allCycles[i+1]?.start || addDays(c.start, avgLength);
    const ovDay = addDays(nextStart,-14);
    const fertStart = addDays(ovDay,-5), fertEnd = addDays(ovDay,1);
    if (dateStr >= c.start && dateStr < nextStart) {
      const cd = diffDays(c.start,dateStr)+1;
      if (dateStr<=periodEnd) return { status:c.actual?"period":"predicted", cd, ovDay };
      if (dateStr===ovDay) return { status:"ovulation", cd, ovDay };
      if (dateStr>=fertStart && dateStr<=fertEnd) return { status:"fertile", cd, ovDay };
      return { status:"safe", cd, ovDay };
    }
  }
  return { status:null, cd:null, ovDay:null };
}

function calcPregnancyProb(dateStr, allCycles, avgLength, avgPeriod, intimateLogs) {
  const { status } = getCycleStatus(dateStr, allCycles, avgLength, avgPeriod);
  const base = { ovulation:0.28, fertile:0.12, safe:0.02, period:0.01, predicted:0.01 }[status] ?? 0.02;
  const cf = [1.0,0.03,0.22,0.04,0.11,0.009,0.009,0.008,0.15,0.0];
  const dayLogs = (intimateLogs||[]).filter(x=>x.date===dateStr);
  if (dayLogs.length===0) return { prob:0, label:"safe", status };
  const minF = Math.min(...dayLogs.map(x=>cf[x.contraIndex]??1.0));
  const prob = Math.round(base*minF*100*10)/10;
  const label = prob>8?"high":prob>3?"mid":prob>0.5?"low":"safe";
  return { prob, label, status };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().slice(0,10);
const pad2 = n => String(n).padStart(2,"0");
const fmtDate = (y,m,d) => `${y}-${pad2(m+1)}-${pad2(d)}`;
const parseD = s => { const [y,m,d]=s.split("-").map(Number); return new Date(y,m-1,d); };
const addDays = (s,n) => { const d=parseD(s); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); };
const diffDays = (a,b) => Math.round((parseD(b)-parseD(a))/86400000);
const daysInMonth = (y,m) => new Date(y,m+1,0).getDate();
const firstDow = (y,m) => new Date(y,m,1).getDay();

// ─── DEFAULT STATE ─────────────────────────────────────────────────────────────
const DEFAULT_STATE = {
  lang:"en", mode:"avoid", activeUser:"lei",
  actualPeriods:[
    { start:"2026-02-08", end:"2026-02-12", actual:true },
    { start:"2026-03-08", end:"2026-03-13", actual:true },
    { start:"2026-04-05", end:"2026-04-09", actual:true },
  ],
  fahLogs:{
    "2026-04-05":{ mood:"😴", symptoms:["Cramps","Fatigue"], note:"" },
    "2026-04-10":{ mood:"😊", symptoms:[], note:"Better today!" },
  },
  intimateLogs:[
    { id:1, date:"2026-04-03", time:"22:00", contraIndex:1, note:"", nth:1 },
    { id:2, date:"2026-04-15", time:"23:00", contraIndex:0, note:"", nth:1 },
  ],
  messages:[
    { from:"fah", text:"ไม่สบายนิดหน่อย แต่โอเค 🌸", date:"2026-04-05", isAI:false },
    { from:"lei", text:"Rest well baby 💕", date:"2026-04-05", isAI:false },
  ],
  lastAIDate:null,
};

// ─── STYLE CONSTANTS ──────────────────────────────────────────────────────────
const SC = {
  period:    { bg:"#FDE8EE", fg:"#D63864", dot:"#D63864" },
  predicted: { bg:"#FEF0F4", fg:"#E8547A", dot:"#E8547A88" },
  ovulation: { bg:"#FEF3E2", fg:"#E67C23", dot:"#E67C23" },
  fertile:   { bg:"#E8F8F4", fg:"#2BB89A", dot:"#2BB89A" },
  safe:      { bg:"#F4F6FF", fg:"#7B93D4", dot:"#7B93D4" },
};
const RC = {
  high:{ bg:"#FFE5EC", fg:"#D63864" },
  mid: { bg:"#FFF3E0", fg:"#E67C23" },
  low: { bg:"#EEF6FF", fg:"#4B7BEC" },
  safe:{ bg:"#E8F8F4", fg:"#2BB89A" },
};

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
const Badge = ({label,bg,fg}) => (
  <span style={{background:bg,color:fg,borderRadius:20,padding:"2px 9px",fontSize:10,fontWeight:700,display:"inline-block"}}>{label}</span>
);
const LangPill = ({lang,cur,set}) => {
  const labels={zh:"中",en:"EN",th:"ไทย"};
  return <button onClick={()=>set(lang)} style={{padding:"3px 9px",borderRadius:10,border:"none",background:cur===lang?"#fff":"transparent",color:cur===lang?"#D63864":"#ffffff88",fontWeight:cur===lang?700:400,fontSize:11,cursor:"pointer"}}>{labels[lang]}</button>;
};

// ─── CALENDAR GRID ────────────────────────────────────────────────────────────
function CalendarGrid({year,month,allCycles,avgLength,avgPeriod,fahLogs,intimateLogs,onDayClick,selectedDay,lang}) {
  const td=todayStr(), days=daysInMonth(year,month), first=firstDow(year,month);
  const cells=[]; for(let i=0;i<first;i++) cells.push(null); for(let d=1;d<=days;d++) cells.push(d);
  const DOW={en:["S","M","T","W","T","F","S"],zh:["日","一","二","三","四","五","六"],th:["อา","จ","อ","พ","พฤ","ศ","ส"]};
  const intDates=new Set((intimateLogs||[]).map(x=>x.date));
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
        {DOW[lang].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:9,color:"#ccc",padding:"2px 0"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
        {cells.map((d,i)=>{
          if(!d) return <div key={i}/>;
          const ds=fmtDate(year,month,d);
          const {status}=getCycleStatus(ds,allCycles,avgLength,avgPeriod);
          const s=SC[status]||{};
          const isToday=ds===td, isSel=ds===selectedDay;
          return (
            <button key={i} onClick={()=>onDayClick(ds)} style={{
              aspectRatio:"1",borderRadius:10,
              border:isSel?"2.5px solid #D63864":isToday?"2px solid #5B8AF0":"2px solid transparent",
              background:s.bg||(isToday?"#EEF2FF":"#FAFAFA"),
              color:s.fg||(isToday?"#5B8AF0":"#333"),
              fontWeight:isToday||isSel?700:400,
              fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",
              justifyContent:"center",flexDirection:"column",gap:1,transition:"all 0.12s",
            }}>
              {d}
              <div style={{display:"flex",gap:2}}>
                {fahLogs?.[ds]&&<span style={{fontSize:5,color:s.dot||"#ccc"}}>●</span>}
                {intDates.has(ds)&&<span style={{fontSize:5,color:"#F585A5"}}>♥</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── LOG MODAL ────────────────────────────────────────────────────────────────
function LogModal({dateStr,log,allCycles,avgLength,avgPeriod,t,lang,actualPeriods,onSave,onMarkStart,onMarkEnd,onClose}) {
  const [mood,setMood]=useState(log?.mood||"😊");
  const [syms,setSyms]=useState(log?.symptoms||[]);
  const [note,setNote]=useState(log?.note||"");
  const {status}=getCycleStatus(dateStr,allCycles,avgLength,avgPeriod);
  const s=SC[status]||{};
  const isPStart=actualPeriods.some(p=>p.start===dateStr);
  const isPEnd=actualPeriods.some(p=>p.end===dateStr);
  const statusLabel={period:t.periodDay,fertile:t.fertileDay,ovulation:t.ovulationDay,predicted:t.predictedPeriod,safe:t.safeDay}[status];
  return (
    <div style={{position:"fixed",inset:0,background:"#00000077",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"28px 28px 0 0",padding:"22px 18px 40px",width:"100%",maxWidth:480,boxShadow:"0 -8px 40px #0003",maxHeight:"88vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div>
            <div style={{fontWeight:800,fontSize:15}}>{dateStr}</div>
            {statusLabel&&<Badge label={statusLabel} bg={s.bg||"#f5f5f5"} fg={s.fg||"#aaa"}/>}
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#ddd"}}>✕</button>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <button onClick={onMarkStart} style={{flex:1,padding:"9px 0",borderRadius:12,fontSize:11,fontWeight:600,cursor:"pointer",background:isPStart?"#D63864":"#FDE8EE",color:isPStart?"#fff":"#D63864",border:"none"}}>🩸 {t.markPeriodStart}</button>
          <button onClick={onMarkEnd} style={{flex:1,padding:"9px 0",borderRadius:12,fontSize:11,fontWeight:600,cursor:"pointer",background:isPEnd?"#5B8AF0":"#EEF2FF",color:isPEnd?"#fff":"#5B8AF0",border:"none"}}>✓ {t.markPeriodEnd}</button>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,color:"#bbb",fontWeight:700,letterSpacing:0.8,marginBottom:7,textTransform:"uppercase"}}>{t.mood}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{MOODS.map(m=><button key={m} onClick={()=>setMood(m)} style={{fontSize:22,background:mood===m?"#FDE8EE":"#f7f7f7",border:mood===m?"2px solid #D63864":"2px solid transparent",borderRadius:10,padding:"3px 6px",cursor:"pointer"}}>{m}</button>)}</div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,color:"#bbb",fontWeight:700,letterSpacing:0.8,marginBottom:7,textTransform:"uppercase"}}>{t.symptoms}</div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{SYMPTOMS[lang].map(s=><button key={s} onClick={()=>setSyms(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s])} style={{padding:"4px 10px",borderRadius:20,fontSize:11,background:syms.includes(s)?"#D63864":"#f5f5f5",color:syms.includes(s)?"#fff":"#666",border:"none",cursor:"pointer",transition:"all 0.12s"}}>{s}</button>)}</div>
        </div>
        <div style={{marginBottom:18}}>
          <div style={{fontSize:10,color:"#bbb",fontWeight:700,letterSpacing:0.8,marginBottom:7,textTransform:"uppercase"}}>{t.note}</div>
          <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder={t.notePlaceholder} style={{width:"100%",border:"1.5px solid #eee",borderRadius:12,padding:"10px 12px",fontSize:13,resize:"none",height:64,boxSizing:"border-box",outline:"none",fontFamily:"inherit"}}/>
        </div>
        <button onClick={()=>onSave({mood,symptoms:syms,note})} style={{width:"100%",background:"linear-gradient(135deg,#D63864,#F07090)",color:"#fff",border:"none",borderRadius:14,padding:"13px 0",fontSize:14,fontWeight:700,cursor:"pointer"}}>{t.savelog}</button>
      </div>
    </div>
  );
}

// ─── INTIMATE MODAL ───────────────────────────────────────────────────────────
function IntimateModal({allCycles,avgLength,avgPeriod,intimateLogs,t,lang,onSave,onClose}) {
  const [date,setDate]=useState(todayStr());
  const [hour,setHour]=useState(22);
  const [min,setMin]=useState(0);
  const [ci,setCi]=useState(1);
  const [note,setNote]=useState("");
  const {status}=getCycleStatus(date,allCycles,avgLength,avgPeriod);
  const s=SC[status]||{};
  const lastCi=intimateLogs?.length>0?intimateLogs[0].contraIndex:null;
  const nth=(intimateLogs||[]).filter(x=>x.date===date).length+1;
  const statusLabel={period:t.periodDay,fertile:t.fertileDay,ovulation:t.ovulationDay,predicted:t.predictedPeriod,safe:t.safeDay}[status];
  return (
    <div style={{position:"fixed",inset:0,background:"#00000077",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"28px 28px 0 0",padding:"22px 18px 40px",width:"100%",maxWidth:480,boxShadow:"0 -8px 40px #0003",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div style={{fontWeight:800,fontSize:16}}>♥ {t.nth}{nth} {t.intimate_log}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#ddd"}}>✕</button>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,color:"#bbb",fontWeight:700,letterSpacing:0.8,marginBottom:7,textTransform:"uppercase"}}>Date</div>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:"100%",border:"1.5px solid #eee",borderRadius:12,padding:"10px 12px",fontSize:13,boxSizing:"border-box",outline:"none",fontFamily:"inherit"}}/>
          {statusLabel&&<div style={{marginTop:6}}><Badge label={statusLabel} bg={s.bg||"#f5f5f5"} fg={s.fg||"#aaa"}/></div>}
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,color:"#bbb",fontWeight:700,letterSpacing:0.8,marginBottom:10,textTransform:"uppercase"}}>{t.contraception}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
            {t.contraOptions.map((opt,i)=>(
              <button key={i} onClick={()=>setCi(i)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"10px 4px",borderRadius:14,border:"none",cursor:"pointer",background:ci===i?"#FDE8EE":"#f8f8f8",outline:ci===i?"2px solid #D63864":"none",position:"relative",transition:"all 0.15s"}}>
                {lastCi===i&&ci!==i&&<span style={{position:"absolute",top:3,right:3,fontSize:7,background:"#2BB89A",color:"#fff",borderRadius:5,padding:"1px 3px"}}>上次</span>}
                <span style={{fontSize:20}}>{CONTRA_ICONS[i]}</span>
                <span style={{fontSize:9,color:ci===i?"#D63864":"#888",textAlign:"center",lineHeight:1.2,fontWeight:ci===i?700:400}}>{opt}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,color:"#bbb",fontWeight:700,letterSpacing:0.8,marginBottom:10,textTransform:"uppercase"}}>{t.intimateTime}</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,background:"#f8f8f8",borderRadius:14,padding:"16px 0"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <button onClick={()=>setHour(h=>(h+1)%24)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#ccc"}}>▲</button>
              <span style={{fontSize:32,fontWeight:800,color:"#333",minWidth:48,textAlign:"center"}}>{pad2(hour)}</span>
              <button onClick={()=>setHour(h=>(h+23)%24)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#ccc"}}>▼</button>
            </div>
            <span style={{fontSize:32,fontWeight:800,color:"#D63864"}}>:</span>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <button onClick={()=>setMin(m=>(m+5)%60)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#ccc"}}>▲</button>
              <span style={{fontSize:32,fontWeight:800,color:"#333",minWidth:48,textAlign:"center"}}>{pad2(min)}</span>
              <button onClick={()=>setMin(m=>(m+55)%60)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#ccc"}}>▼</button>
            </div>
          </div>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:10,color:"#bbb",fontWeight:700,letterSpacing:0.8,marginBottom:7,textTransform:"uppercase"}}>{t.intimateNote}</div>
          <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="…" style={{width:"100%",border:"1.5px solid #eee",borderRadius:12,padding:"10px 12px",fontSize:13,resize:"none",height:56,boxSizing:"border-box",outline:"none",fontFamily:"inherit"}}/>
        </div>
        <button onClick={()=>onSave({date,time:`${pad2(hour)}:${pad2(min)}`,contraIndex:ci,note,nth,id:Date.now()})} style={{width:"100%",background:"linear-gradient(135deg,#F585A5,#D63864)",color:"#fff",border:"none",borderRadius:14,padding:"13px 0",fontSize:14,fontWeight:700,cursor:"pointer"}}>{t.savelog}</button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [state, setState] = useState(null); // null = loading
  const [syncing, setSyncing] = useState(false);
  const [vm, setVm] = useState({year:new Date().getFullYear(),month:new Date().getMonth()});
  const [selDay, setSelDay] = useState(null);
  const [showLog, setShowLog] = useState(false);
  const [showIntimate, setShowIntimate] = useState(false);
  const [tab, setTab] = useState("calendar");
  const [newMsg, setNewMsg] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // ── Firebase: load + realtime sync ──────────────────────────────────────────
  useEffect(() => {
    const ref = doc(db, "couples", COUPLE_ID);
    // First load: seed if empty
    getDoc(ref).then(snap => {
      if (!snap.exists()) {
        setDoc(ref, DEFAULT_STATE);
      }
    });
    // Realtime listener
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) setState(snap.data());
      else setState(DEFAULT_STATE);
    });
    return () => unsub();
  }, []);

  // ── Save to Firebase ─────────────────────────────────────────────────────────
  const save = useCallback(async (updates) => {
    setSyncing(true);
    const ref = doc(db, "couples", COUPLE_ID);
    await setDoc(ref, updates, { merge:true });
    setSyncing(false);
  }, []);

  if (!state) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#FFF4F7",flexDirection:"column",gap:12}}>
      <div style={{fontSize:40}}>🌺</div>
      <div style={{color:"#D63864",fontWeight:700,fontSize:16}}>Loading Yoozoo…</div>
    </div>
  );

  const { lang, mode, activeUser, actualPeriods, fahLogs, intimateLogs, messages } = state;
  const t = T[lang] || T.en;
  const { avgLength, avgPeriod } = computeAdaptiveCycle(actualPeriods);
  const allCycles = buildAllCycles(actualPeriods, avgLength, avgPeriod);
  const nextPeriodDate = allCycles.find(c=>!c.actual&&c.start>todayStr())?.start;
  const daysLeft = nextPeriodDate ? diffDays(todayStr(), nextPeriodDate) : null;
  const { status:todayStatus, cd:todayCd } = getCycleStatus(todayStr(), allCycles, avgLength, avgPeriod);
  const todaySc = SC[todayStatus]||{};
  const todayProb = calcPregnancyProb(todayStr(), allCycles, avgLength, avgPeriod, intimateLogs);

  // ── Mutations ────────────────────────────────────────────────────────────────
  const setLang = l => save({lang:l});
  const setMode = m => save({mode:m});
  const setUser = u => save({activeUser:u});

  const saveLog = logData => {
    const updated = {...(fahLogs||{}), [selDay]:logData};
    save({fahLogs:updated});
    setShowLog(false);
  };

  const markPeriodStart = () => {
    const d = selDay;
    if ((actualPeriods||[]).some(p=>p.start===d)) return;
    const newP = [...(actualPeriods||[]), {start:d,end:null,actual:true}]
      .sort((a,b)=>a.start>b.start?1:-1);
    save({actualPeriods:newP});
  };

  const markPeriodEnd = () => {
    const d = selDay;
    const newP = (actualPeriods||[]).map(x=>x.start<=d&&!x.end?{...x,end:d}:x);
    save({actualPeriods:newP});
  };

  const saveIntimate = rec => {
    const updated = [...(intimateLogs||[]), rec].sort((a,b)=>a.date>b.date?-1:1);
    save({intimateLogs:updated});
    setShowIntimate(false);
  };

  const sendMsg = () => {
    if (!newMsg.trim()) return;
    const updated = [...(messages||[]), {from:activeUser,text:newMsg.trim(),date:todayStr(),isAI:false}];
    save({messages:updated});
    setNewMsg("");
  };

  // ── AI Daily Push ────────────────────────────────────────────────────────────
  const generateAI = async () => {
    setAiLoading(true);
    const lastInt = (intimateLogs||[])[0];
    const recentLogs = Object.entries(fahLogs||{}).slice(-3)
      .map(([d,l])=>`${d}: mood ${l.mood}, symptoms [${(l.symptoms||[]).join(",")}]`).join("; ");
    const ctx = `Today: ${todayStr()}. Phase: ${todayStatus||"unknown"}. Cycle day: ${todayCd||"?"}. Next period: ${nextPeriodDate||"?"} (${daysLeft||"?"} days away). Avg cycle: ${avgLength}d. Mode: ${mode}. Last intimate: ${lastInt?.date||"none"} (${lastInt!=null?t.contraOptions[lastInt.contraIndex]:"n/a"}). Recent logs: ${recentLogs||"none"}.`;

    const fahPrompt = `Write a short, warm, loving message from Lei (boyfriend) to Fah (girlfriend). Sound like a real loving boyfriend texting. Mention today's cycle phase naturally and give one caring tip. Max 2 sentences. Language: ${lang==="zh"?"Chinese":lang==="th"?"Thai":"English"}. Context: ${ctx}`;
    const leiPrompt = `Give Lei (boyfriend) a brief practical tip on how to care for his girlfriend Fah today based on her cycle. Be direct and helpful. Max 2 sentences. Language: ${lang==="zh"?"Chinese":lang==="th"?"Thai":"English"}. Context: ${ctx}`;

    try {
      const [r1,r2] = await Promise.all([
        fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:fahPrompt}]})}),
        fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:leiPrompt}]})}),
      ]);
      const [d1,d2] = await Promise.all([r1.json(),r2.json()]);
      const newMessages = [
        ...(messages||[]),
        {from:"lei",text:d1.content?.[0]?.text||"…",date:todayStr(),isAI:true,forUser:"fah"},
        {from:"system",text:d2.content?.[0]?.text||"…",date:todayStr(),isAI:true,forUser:"lei"},
      ];
      save({messages:newMessages, lastAIDate:todayStr()});
    } catch(e) { console.error(e); }
    setAiLoading(false);
  };

  // ── Render helpers ───────────────────────────────────────────────────────────
  const monthLabel = (y,m) => {
    const en=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const zh=["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
    const th=["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
    return `${y} ${{en,zh,th}[lang][m]}`;
  };

  const visibleMessages=(messages||[]).filter(m=>!m.isAI||m.forUser===activeUser||!m.forUser);
  const TABS=[{id:"calendar",icon:"📅",label:t.calendar},{id:"stats",icon:"📊",label:t.stats},{id:"intimate",icon:"♥",label:t.intimate},{id:"messages",icon:"💌",label:t.messages}];

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(150deg,#FFF4F7 0%,#F0F4FF 60%,#F4FFF9 100%)",fontFamily:"'PingFang SC','Hiragino Sans GB','Noto Sans Thai',sans-serif",maxWidth:480,margin:"0 auto",paddingBottom:88}}>

      {/* HEADER */}
      <div style={{background:"linear-gradient(135deg,#B52050 0%,#D63864 45%,#F07090 100%)",padding:"env(safe-area-inset-top,16px) 16px 26px",borderRadius:"0 0 34px 34px",boxShadow:"0 8px 36px #D6386444"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div>
            <div style={{color:"#fff8",fontSize:9,letterSpacing:1.5,textTransform:"uppercase"}}>Private · For Two</div>
            <div style={{color:"#fff",fontWeight:900,fontSize:20}}>{t.appName} <span style={{fontWeight:300,fontSize:13}}>{t.tagline}</span></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
            <div style={{display:"flex",gap:3,background:"#ffffff1A",borderRadius:12,padding:3}}>
              {["zh","en","th"].map(l=><LangPill key={l} lang={l} cur={lang} set={setLang}/>)}
            </div>
            <div style={{fontSize:9,color:"#ffffff88"}}>{syncing?t.syncing:t.synced}</div>
          </div>
        </div>

        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:12}}>
          {[{id:"lei",avatar:"🫶",name:"Lei"},{id:"fah",avatar:"🌺",name:"Fah"}].map(u=>(
            <button key={u.id} onClick={()=>setUser(u.id)} style={{display:"flex",alignItems:"center",gap:6,background:activeUser===u.id?"#fff":"#ffffff22",border:"none",borderRadius:20,padding:"5px 14px",cursor:"pointer",color:activeUser===u.id?"#D63864":"#fff",fontWeight:activeUser===u.id?700:400,fontSize:13,transition:"all 0.2s"}}>
              <span style={{fontSize:15}}>{u.avatar}</span>{u.name}
            </button>
          ))}
          <div style={{marginLeft:"auto",display:"flex",gap:3,background:"#ffffff1A",borderRadius:12,padding:3}}>
            {["avoid","conceive"].map(m=>(
              <button key={m} onClick={()=>setMode(m)} style={{padding:"3px 10px",borderRadius:9,border:"none",background:mode===m?"#fff":"transparent",color:mode===m?"#D63864":"#ffffff88",fontWeight:mode===m?700:400,fontSize:11,cursor:"pointer"}}>{m==="conceive"?t.modeConceive:t.modeAvoid}</button>
            ))}
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          <div style={{background:"#ffffff22",borderRadius:14,padding:"10px 10px"}}>
            <div style={{color:"#fffc",fontSize:9,marginBottom:3,letterSpacing:0.3}}>{t.nextPeriod}</div>
            <div style={{color:"#fff",fontWeight:700,fontSize:13}}>{daysLeft===0?t.today:daysLeft===1?"Tomorrow":daysLeft?`${daysLeft} ${t.daysLater}`:"–"}</div>
          </div>
          <div style={{background:todaySc.bg?`${todaySc.bg}dd`:"#ffffff22",borderRadius:14,padding:"10px 10px"}}>
            <div style={{color:todaySc.fg||"#fffc",fontSize:9,marginBottom:3,letterSpacing:0.3}}>{t.cycleDay}</div>
            <div style={{color:todaySc.fg||"#fff",fontWeight:700,fontSize:13}}>{todayCd?`Day ${todayCd}`:"–"}</div>
          </div>
          {(()=>{
            const phaseLabelMap={ovulation:"high",fertile:"mid",period:"low",predicted:"low",safe:"safe"};
            const phaseKey=phaseLabelMap[todayStatus]||"safe";
            const phaseRc=RC[phaseKey]||RC.safe;
            const phaseVal=({ovulation:"~25%",fertile:"~10%",period:"~1%",predicted:"~1%",safe:"~2%"})[todayStatus]||"~2%";
            const todayIntimate=(intimateLogs||[]).filter(x=>x.date===todayStr());
            const actProb=todayIntimate.length>0?calcPregnancyProb(todayStr(),allCycles,avgLength,avgPeriod,intimateLogs):null;
            return (
              <div style={{background:`${phaseRc.bg}dd`,borderRadius:14,padding:"8px 10px"}}>
                <div style={{color:phaseRc.fg,fontSize:9,marginBottom:2,letterSpacing:0.3}}>{t.pregnancyChance}</div>
                <div style={{color:phaseRc.fg,fontWeight:700,fontSize:12}}>{phaseVal}</div>
                {actProb&&actProb.prob>0&&<div style={{color:RC[actProb.label]?.fg||"#fff",fontSize:9,marginTop:2,fontWeight:600}}>今日实际~{actProb.prob}%</div>}
              </div>
            );
          })()}
        </div>
      </div>

      {/* TABS */}
      <div style={{display:"flex",background:"#fff",margin:"12px 12px 0",borderRadius:16,padding:4,boxShadow:"0 2px 12px #0001"}}>
        {TABS.map(({id,icon,label})=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,border:"none",borderRadius:12,padding:"8px 0",background:tab===id?"#D63864":"transparent",color:tab===id?"#fff":"#aaa",fontWeight:tab===id?700:400,fontSize:10,cursor:"pointer",transition:"all 0.2s",lineHeight:1.6}}>{icon}<br/>{label}</button>
        ))}
      </div>

      <div style={{padding:"12px 12px 0"}}>

        {/* CALENDAR TAB */}
        {tab==="calendar"&&(
          <div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
              {[{bg:SC.period.bg,fg:SC.period.fg,label:t.periodDay},{bg:SC.fertile.bg,fg:SC.fertile.fg,label:t.fertileDay},{bg:SC.ovulation.bg,fg:SC.ovulation.fg,label:t.ovulationDay},{bg:SC.predicted.bg,fg:SC.predicted.fg,label:t.predictedPeriod}].map(p=><Badge key={p.label} label={p.label} bg={p.bg} fg={p.fg}/>)}
            </div>
            <div style={{background:"#fff",borderRadius:20,padding:14,boxShadow:"0 2px 12px #0001"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <button onClick={()=>setVm(v=>{const m=v.month===0?11:v.month-1,y=v.month===0?v.year-1:v.year;return{year:y,month:m};})} style={{background:"#f5f5f5",border:"none",borderRadius:10,padding:"5px 12px",cursor:"pointer",fontSize:16,color:"#888"}}>‹</button>
                <div style={{fontWeight:700,fontSize:14}}>{monthLabel(vm.year,vm.month)}</div>
                <button onClick={()=>setVm(v=>{const m=v.month===11?0:v.month+1,y=v.month===11?v.year+1:v.year;return{year:y,month:m};})} style={{background:"#f5f5f5",border:"none",borderRadius:10,padding:"5px 12px",cursor:"pointer",fontSize:16,color:"#888"}}>›</button>
              </div>
              <CalendarGrid year={vm.year} month={vm.month} allCycles={allCycles} avgLength={avgLength} avgPeriod={avgPeriod} fahLogs={fahLogs} intimateLogs={intimateLogs} onDayClick={d=>{setSelDay(d);setShowLog(true);}} selectedDay={selDay} lang={lang}/>
            </div>
            <div style={{marginTop:10,background:"#fff",borderRadius:16,padding:"12px 14px",boxShadow:"0 2px 10px #0001"}}>
              <div style={{fontSize:11,fontWeight:700,marginBottom:6,color:"#555"}}>📐 Adaptive Cycle</div>
              <div style={{display:"flex",gap:10}}>
                {[{label:t.avgCycle,value:`${avgLength}d`,c:"#D63864",bg:"#FDE8EE"},{label:t.avgPeriod,value:`${avgPeriod}d`,c:"#2BB89A",bg:"#E8F8F4"},{label:t.totalCycles,value:`${(actualPeriods||[]).length}`,c:"#5B8AF0",bg:"#EEF2FF"}].map(x=>(
                  <div key={x.label} style={{flex:1,background:x.bg,borderRadius:10,padding:"8px 10px"}}>
                    <div style={{fontSize:9,color:x.c,fontWeight:700}}>{x.label}</div>
                    <div style={{fontSize:18,fontWeight:800,color:x.c}}>{x.value}</div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:6,fontSize:10,color:"#aaa"}}>✓ {t.corrected}</div>
            </div>
          </div>
        )}

        {/* STATS TAB */}
        {tab==="stats"&&(
          <div>
            <div style={{background:"#fff",borderRadius:20,padding:16,boxShadow:"0 2px 12px #0001",marginBottom:12}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:12}}>📊 Pregnancy Probability Log</div>
              {(intimateLogs||[]).slice(0,10).map((rec,i)=>{
                const p=calcPregnancyProb(rec.date,allCycles,avgLength,avgPeriod,intimateLogs);
                const rc=RC[p.label]||RC.safe;
                return (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #f5f5f5"}}>
                    <div style={{width:36,height:36,borderRadius:10,background:"#FDE8EE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{CONTRA_ICONS[rec.contraIndex]||"♥"}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600}}>{rec.date} {rec.time} <span style={{fontSize:10,color:"#bbb"}}>#{rec.nth}</span></div>
                      <div style={{fontSize:10,color:"#aaa"}}>{t.contraOptions[rec.contraIndex]}</div>
                      {rec.note&&<div style={{fontSize:10,color:"#888"}}>{rec.note}</div>}
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontWeight:700,fontSize:14,color:rc.fg}}>{p.prob>0?`~${p.prob}%`:"–"}</div>
                      <div style={{fontSize:9,color:"#bbb"}}>{p.status}</div>
                    </div>
                  </div>
                );
              })}
              {!(intimateLogs||[]).length&&<div style={{color:"#ddd",fontSize:13,textAlign:"center",padding:"20px 0"}}>No logs yet</div>}
            </div>
            <div style={{background:"#fff",borderRadius:20,padding:16,boxShadow:"0 2px 12px #0001"}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>😊 Fah's Recent Logs</div>
              {Object.entries(fahLogs||{}).sort((a,b)=>a[0]<b[0]?1:-1).slice(0,8).map(([date,log])=>(
                <div key={date} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"7px 0",borderBottom:"1px solid #f5f5f5"}}>
                  <span style={{fontSize:20}}>{log.mood}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,color:"#bbb"}}>{date}</div>
                    {(log.symptoms||[]).length>0&&<div style={{display:"flex",gap:3,marginTop:2,flexWrap:"wrap"}}>{log.symptoms.map(s=><span key={s} style={{background:"#FDE8EE",color:"#D63864",borderRadius:7,padding:"1px 6px",fontSize:9}}>{s}</span>)}</div>}
                    {log.note&&<div style={{fontSize:11,color:"#666",marginTop:2}}>{log.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INTIMATE TAB */}
        {tab==="intimate"&&(
          <div>
            <button onClick={()=>setShowIntimate(true)} style={{width:"100%",background:"linear-gradient(135deg,#F585A5,#D63864)",color:"#fff",border:"none",borderRadius:16,padding:"13px 0",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:12,boxShadow:"0 4px 18px #D6386444"}}>♥ {t.addIntimate}</button>
            <div style={{background:todaySc.bg||"#f8f8f8",border:`1.5px solid ${todaySc.fg||"#eee"}33`,borderRadius:16,padding:"12px 14px",marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:todaySc.fg||"#aaa",marginBottom:2}}>
                {mode==="conceive"?"🌱":"🛡️"} Today · {todayStatus?{period:t.periodDay,fertile:t.fertileDay,ovulation:t.ovulationDay,predicted:t.predictedPeriod,safe:t.safeDay}[todayStatus]:"–"}
              </div>
              <div style={{fontSize:11,color:"#999"}}>
                {mode==="conceive"
                  ?(todayStatus==="ovulation"?"✨ Best day to try! Peak fertility":todayStatus==="fertile"?"🌿 Fertile window — good timing":todayStatus==="period"?"🌸 Period time — rest well":"💤 Lower fertility today")
                  :(todayStatus==="ovulation"?"⚠️ Peak risk! Always use protection":todayStatus==="fertile"?"⚡ Elevated risk — use protection":todayStatus==="period"?"✅ Lower risk, still use protection":"✅ Lower risk period")}
              </div>
            </div>
            <div style={{background:"#fff",borderRadius:20,padding:16,boxShadow:"0 2px 12px #0001"}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>♥ History</div>
              {!(intimateLogs||[]).length&&<div style={{color:"#ddd",fontSize:13,textAlign:"center",padding:"20px 0"}}>No records yet</div>}
              {(intimateLogs||[]).map((rec,i)=>{
                const p=calcPregnancyProb(rec.date,allCycles,avgLength,avgPeriod,intimateLogs);
                const rc=RC[p.label]||RC.safe;
                const {status:rs}=getCycleStatus(rec.date,allCycles,avgLength,avgPeriod);
                const rsc=SC[rs]||{};
                const statusLabel={period:t.periodDay,fertile:t.fertileDay,ovulation:t.ovulationDay,predicted:t.predictedPeriod,safe:t.safeDay}[rs];
                return (
                  <div key={rec.id||i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid #f9f9f9"}}>
                    <div style={{width:34,height:34,borderRadius:10,background:"#FDE8EE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{CONTRA_ICONS[rec.contraIndex]||"♥"}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600}}>{rec.date} <span style={{color:"#bbb",fontWeight:400}}>{rec.time}</span> <span style={{fontSize:10,color:"#F585A5"}}>#{rec.nth}</span></div>
                      <div style={{fontSize:10,color:"#aaa"}}>{t.contraOptions[rec.contraIndex]}</div>
                      {rec.note&&<div style={{fontSize:10,color:"#888"}}>{rec.note}</div>}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:3,alignItems:"flex-end"}}>
                      {statusLabel&&<Badge label={statusLabel} bg={rsc.bg||"#f5f5f5"} fg={rsc.fg||"#aaa"}/>}
                      {p.prob>0&&<Badge label={`~${p.prob}%`} bg={rc.bg} fg={rc.fg}/>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MESSAGES TAB */}
        {tab==="messages"&&(
          <div>
            <div style={{background:"#fff",borderRadius:20,padding:14,boxShadow:"0 2px 12px #0001",marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontWeight:700,fontSize:13}}>🤖 {t.aiDaily}</div>
                <button onClick={generateAI} disabled={aiLoading} style={{background:aiLoading?"#eee":"linear-gradient(135deg,#D63864,#F07090)",color:aiLoading?"#aaa":"#fff",border:"none",borderRadius:10,padding:"5px 12px",fontSize:11,fontWeight:600,cursor:aiLoading?"default":"pointer"}}>{aiLoading?t.aiLoading:t.refreshAI}</button>
              </div>
              {(messages||[]).filter(m=>m.isAI&&m.forUser===activeUser).slice(-1).map((m,i)=>(
                <div key={i} style={{background:activeUser==="fah"?"#FFF5F8":"#F0F4FF",borderRadius:14,padding:"10px 12px",fontSize:13,color:"#444",lineHeight:1.65}}>
                  <div style={{fontSize:9,color:"#ccc",marginBottom:4}}>{activeUser==="fah"?"🫶 Lei":"🤖 Assistant"} · {m.date}</div>
                  {m.text}
                </div>
              ))}
              {!(messages||[]).filter(m=>m.isAI&&m.forUser===activeUser).length&&(
                <div style={{fontSize:12,color:"#ccc",textAlign:"center",padding:"8px 0"}}>Tap button to get today's message ✨</div>
              )}
            </div>
            <div style={{background:"#fff",borderRadius:20,padding:14,boxShadow:"0 2px 12px #0001"}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>💌 {t.messages}</div>
              <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:300,overflowY:"auto"}}>
                {visibleMessages.filter(m=>!m.isAI).map((item,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:item.from==="fah"?"flex-start":"flex-end"}}>
                    <div style={{maxWidth:"76%",background:item.from==="fah"?"linear-gradient(135deg,#FDE8EE,#FFF5F8)":"linear-gradient(135deg,#EEF2FF,#F0F4FF)",borderRadius:item.from==="fah"?"4px 16px 16px 16px":"16px 4px 16px 16px",padding:"8px 12px",fontSize:13,color:"#333"}}>
                      <div style={{fontSize:9,color:"#ccc",marginBottom:3}}>{item.from==="fah"?"🌺 Fah":"🫶 Lei"} · {item.date}</div>
                      {item.text}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:8,marginTop:12}}>
                <input value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()} placeholder={activeUser==="lei"?t.msgPlaceholderLei:t.msgPlaceholderFah} style={{flex:1,border:"1.5px solid #eee",borderRadius:12,padding:"10px 13px",fontSize:13,outline:"none",fontFamily:"inherit"}}/>
                <button onClick={sendMsg} style={{background:"linear-gradient(135deg,#D63864,#F07090)",color:"#fff",border:"none",borderRadius:12,padding:"0 16px",fontSize:16,cursor:"pointer"}}>➤</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showLog&&<LogModal dateStr={selDay} log={(fahLogs||{})[selDay]} allCycles={allCycles} avgLength={avgLength} avgPeriod={avgPeriod} t={t} lang={lang} actualPeriods={actualPeriods||[]} onSave={saveLog} onMarkStart={markPeriodStart} onMarkEnd={markPeriodEnd} onClose={()=>setShowLog(false)}/>}
      {showIntimate&&<IntimateModal allCycles={allCycles} avgLength={avgLength} avgPeriod={avgPeriod} intimateLogs={intimateLogs||[]} t={t} lang={lang} onSave={saveIntimate} onClose={()=>setShowIntimate(false)}/>}
    </div>
  );
}
