import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";

const COUPLE_ID = "lei-fah-2026";
const LOCAL_USER_KEY = "yoozoo_my_role";


// ─── i18n ─────────────────────────────────────────────────────────────────────
const T = {
  en: {
    appName:"Yoozoo", tagline:"Our Little Secret 🌺",
    calendar:"Calendar", stats:"Stats", intimate:"Intimate", messages:"Messages",
    nextPeriod:"Next Period", daysLater:"days", today:"Today", tomorrow:"Tomorrow",
    modeConceive:"Trying", modeAvoid:"Avoid",
    periodDay:"Period", fertileDay:"Fertile", ovulationDay:"Ovulation", postOvDay:"Post-Ov",
    predictedPeriod:"Predicted", safeDay:"Safe",
    savelog:"Save", cancel:"Cancel",
    mood:"Mood", symptoms:"Symptoms", note:"Note", notePlaceholder:"How are you feeling today…",
    intimate_log:"Intimate Log", intimateTime:"Time", intimateNote:"Note",
    contraception:"Protection", addIntimate:"+ Log Intimate",
    pregnancyChance:"Pregnancy Chance",
    avgCycle:"Avg Cycle", avgPeriod:"Avg Period", totalCycles:"Cycles",
    send:"Send", msgPlaceholderLei:"Message to Fah…", msgPlaceholderFah:"Message to Lei…",
    aiDaily:"Today's Message", refreshAI:"Get Today's Message ✨",
    markPeriodStart:"Period Start", markPeriodEnd:"Period End",
    corrected:"Cycle updated from actual data",
    cycleDay:"Day", nth:"#", syncing:"Syncing…", synced:"Synced ✓",
    contraOptions:["No protection","Condom","Withdrawal","No ejaculation","Morning-after","Daily pill","Long-term pill","IUD","Other","Solo"],
    chooseRole:"Who are you?", iAmLei:"I'm Lei 🫶", iAmFah:"I'm Fah 🌺",
    chooseRoleDesc:"This stays on your phone only",
    editCycles:"Edit Records", addPeriod:"+ Add Period",
    periodStart:"Start", periodEnd:"End", deletePeriod:"Delete",
    editCyclesTitle:"Period Records",
    translate:"Translate", translating:"Translating…", translated:"Translated",
    notifNew:"New", notifMsg:"sent a message", notifIntimate:"logged an intimate moment",
    notifPeriodStart:"marked period start", notifPeriodEnd:"marked period end",
    notifEditCycles:"updated period records", notifAI:"sent today's message",
    notifications:"Notifications", markAllRead:"Mark all read", noNotifs:"No new notifications",
  },
  zh: {
    appName:"柚子", tagline:"我们的小秘密 🌺",
    calendar:"日历", stats:"统计", intimate:"亲密", messages:"留言",
    nextPeriod:"下次经期", daysLater:"天", today:"今天", tomorrow:"明天",
    modeConceive:"备孕", modeAvoid:"避孕",
    periodDay:"经期", fertileDay:"易孕", ovulationDay:"排卵日", postOvDay:"排卵后",
    predictedPeriod:"预测", safeDay:"安全",
    savelog:"保存", cancel:"取消",
    mood:"心情", symptoms:"症状", note:"备注", notePlaceholder:"今天有什么想说的…",
    intimate_log:"亲密记录", intimateTime:"时间", intimateNote:"备注",
    contraception:"避孕方式", addIntimate:"+ 记录亲密",
    pregnancyChance:"怀孕概率",
    avgCycle:"平均周期", avgPeriod:"平均经期", totalCycles:"周期数",
    send:"发送", msgPlaceholderLei:"给 Fah 留言…", msgPlaceholderFah:"给 Lei 留言…",
    aiDaily:"今日消息", refreshAI:"获取今日消息 ✨",
    markPeriodStart:"经期开始", markPeriodEnd:"经期结束",
    corrected:"已根据实际数据更新周期",
    cycleDay:"第", nth:"第", syncing:"同步中…", synced:"已同步 ✓",
    contraOptions:["无措施","避孕套","体外排精","未射精","紧急避孕药","短效避孕药","长效避孕药","节育环","其他措施","自慰"],
    chooseRole:"你是谁？", iAmLei:"我是 Lei 🫶", iAmFah:"我是 Fah 🌺",
    chooseRoleDesc:"这个选择只保存在你的手机上",
    editCycles:"编辑记录", addPeriod:"+ 添加经期",
    periodStart:"开始日", periodEnd:"结束日", deletePeriod:"删除",
    editCyclesTitle:"经期记录",
    translate:"翻译", translating:"翻译中…", translated:"已翻译",
    notifNew:"新", notifMsg:"发了一条留言", notifIntimate:"记录了亲密",
    notifPeriodStart:"标记了经期开始", notifPeriodEnd:"标记了经期结束",
    notifEditCycles:"更新了经期记录", notifAI:"发送了今日消息",
    notifications:"通知", markAllRead:"全部已读", noNotifs:"暂无新通知",
  },
  th: {
    appName:"ยูซู", tagline:"ความลับของเรา 🌺",
    calendar:"ปฏิทิน", stats:"สถิติ", intimate:"ความใกล้ชิด", messages:"ข้อความ",
    nextPeriod:"ประจำเดือนครั้งถัดไป", daysLater:"วัน", today:"วันนี้", tomorrow:"พรุ่งนี้",
    modeConceive:"ตั้งครรภ์", modeAvoid:"คุมกำเนิด",
    periodDay:"ประจำเดือน", fertileDay:"วันเจริญพันธุ์", ovulationDay:"วันตกไข่", postOvDay:"หลังตกไข่",
    predictedPeriod:"คาดการณ์", safeDay:"ปลอดภัย",
    savelog:"บันทึก", cancel:"ยกเลิก",
    mood:"อารมณ์", symptoms:"อาการ", note:"บันทึก", notePlaceholder:"รู้สึกอย่างไรวันนี้…",
    intimate_log:"บันทึกความใกล้ชิด", intimateTime:"เวลา", intimateNote:"บันทึก",
    contraception:"การคุมกำเนิด", addIntimate:"+ บันทึก",
    pregnancyChance:"โอกาสตั้งครรภ์",
    avgCycle:"รอบเฉลี่ย", avgPeriod:"ประจำเดือนเฉลี่ย", totalCycles:"รอบ",
    send:"ส่ง", msgPlaceholderLei:"ข้อความถึง Fah…", msgPlaceholderFah:"ข้อความถึง Lei…",
    aiDaily:"ข้อความวันนี้", refreshAI:"รับข้อความวันนี้ ✨",
    markPeriodStart:"เริ่มประจำเดือน", markPeriodEnd:"สิ้นสุดประจำเดือน",
    corrected:"อัปเดตรอบตามข้อมูลจริง",
    cycleDay:"วันที่", nth:"ครั้งที่", syncing:"กำลังซิงค์…", synced:"ซิงค์แล้ว ✓",
    contraOptions:["ไม่ได้คุมกำเนิด","ถุงยาง","ถอนออก","ไม่หลั่ง","ยาคุมฉุกเฉิน","ยาคุมรายวัน","ยาคุมระยะยาว","ห่วงอนามัย","อื่นๆ","ช่วยตัวเอง"],
    chooseRole:"คุณเป็นใคร?", iAmLei:"ฉันคือ Lei 🫶", iAmFah:"ฉันคือ Fah 🌺",
    chooseRoleDesc:"การเลือกนี้จะเก็บไว้ในโทรศัพท์ของคุณเท่านั้น",
    editCycles:"แก้ไขบันทึก", addPeriod:"+ เพิ่มประจำเดือน",
    periodStart:"วันเริ่ม", periodEnd:"วันสิ้นสุด", deletePeriod:"ลบ",
    editCyclesTitle:"บันทึกประจำเดือน",
    translate:"แปล", translating:"กำลังแปล…", translated:"แปลแล้ว",
    notifNew:"ใหม่", notifMsg:"ส่งข้อความ", notifIntimate:"บันทึกความใกล้ชิด",
    notifPeriodStart:"บันทึกวันเริ่มประจำเดือน", notifPeriodEnd:"บันทึกวันสิ้นสุดประจำเดือน",
    notifEditCycles:"อัปเดตบันทึกประจำเดือน", notifAI:"ส่งข้อความวันนี้",
    notifications:"การแจ้งเตือน", markAllRead:"อ่านทั้งหมด", noNotifs:"ไม่มีการแจ้งเตือนใหม่",
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
  for (let i=1; i<actualPeriods.length; i++)
    lengths.push(diffDays(actualPeriods[i-1].start, actualPeriods[i].start));
  let avgLength = 28;
  if (lengths.length > 0) {
    const weights = lengths.map((_,i) => i+1);
    const tw = weights.reduce((a,b)=>a+b,0);
    avgLength = Math.round(lengths.reduce((s,l,i)=>s+l*weights[i],0)/tw);
    avgLength = Math.max(21, Math.min(35, avgLength));
  }
  const pLens = actualPeriods.filter(p=>p.end).map(p=>diffDays(p.start,p.end)+1);
  const avgPeriod = pLens.length>0 ? Math.round(pLens.reduce((a,b)=>a+b,0)/pLens.length) : 5;
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
    const ovDay = addDays(nextStart, -14);
    const fertHighStart = addDays(ovDay, -2);
    const fertMidStart  = addDays(ovDay, -5);
    const postOv        = addDays(ovDay, 1);
    if (dateStr >= c.start && dateStr < nextStart) {
      const cd = diffDays(c.start, dateStr)+1;
      if (dateStr <= periodEnd)                                return { status:c.actual?"period":"predicted", cd, ovDay };
      if (dateStr === ovDay)                                   return { status:"ovulation", cd, ovDay };
      if (dateStr === postOv)                                  return { status:"postOv", cd, ovDay };
      if (dateStr >= fertHighStart && dateStr < ovDay)         return { status:"fertHigh", cd, ovDay };
      if (dateStr >= fertMidStart  && dateStr < fertHighStart) return { status:"fertMid", cd, ovDay };
      return { status:"safe", cd, ovDay };
    }
  }
  const last = allCycles[allCycles.length-1];
  if (!last) return { status:null, cd:null, ovDay:null };
  const ns = addDays(last.start, avgLength);
  const ovDay = addDays(ns, -14);
  const fertHighStart = addDays(ovDay, -2);
  const fertMidStart  = addDays(ovDay, -5);
  const postOv        = addDays(ovDay, 1);
  const ne = addDays(ns, avgPeriod-1);
  if (dateStr >= ns && dateStr <= ne)                         return { status:"predicted",      cd:null, ovDay };
  if (dateStr === ovDay)                                      return { status:"pred-ovulation", cd:null, ovDay };
  if (dateStr === postOv)                                     return { status:"pred-postOv",    cd:null, ovDay };
  if (dateStr >= fertHighStart && dateStr < ovDay)            return { status:"pred-fertHigh",  cd:null, ovDay };
  if (dateStr >= fertMidStart  && dateStr < fertHighStart)    return { status:"pred-fertMid",   cd:null, ovDay };
  if (dateStr > last.start)                                   return { status:"safe",           cd:null, ovDay };
  return { status:null, cd:null, ovDay:null };
}

function getBaseProb(status) {
  return { ovulation:0.30,"pred-ovulation":0.30,fertHigh:0.25,"pred-fertHigh":0.25,fertMid:0.10,"pred-fertMid":0.10,postOv:0.08,"pred-postOv":0.08,safe:0.02,period:0.01,predicted:0.01 }[status] ?? 0.02;
}

function calcPregnancyProb(dateStr, allCycles, avgLength, avgPeriod, intimateLogs) {
  const { status } = getCycleStatus(dateStr, allCycles, avgLength, avgPeriod);
  const base = getBaseProb(status);
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
const pick = arr => arr[new Date().getDate() % arr.length];

// ─── STYLE CONSTANTS ──────────────────────────────────────────────────────────
const SC = {
  period:           { bg:"#FDE8EE", fg:"#D63864", dot:"#D63864" },
  predicted:        { bg:"#FEF0F4", fg:"#E8547A", dot:"#E8547A88" },
  ovulation:        { bg:"#FEF3E2", fg:"#E67C23", dot:"#E67C23" },
  "pred-ovulation": { bg:"#FFF8EE", fg:"#E67C23", dot:"#E67C2388" },
  fertHigh:         { bg:"#E2F5EE", fg:"#0A9E6E", dot:"#0A9E6E" },
  fertMid:          { bg:"#EEF9F5", fg:"#2BB89A", dot:"#2BB89A" },
  "pred-fertHigh":  { bg:"#F0FAF8", fg:"#2BB89A", dot:"#2BB89A88" },
  "pred-fertMid":   { bg:"#F4FBF9", fg:"#5BC4A8", dot:"#5BC4A888" },
  postOv:           { bg:"#FFF8EE", fg:"#E09020", dot:"#E09020" },
  "pred-postOv":    { bg:"#FFFBF0", fg:"#E09020", dot:"#E0902055" },
  safe:             { bg:"#F4F6FF", fg:"#7B93D4", dot:"#7B93D4" },
};
const RC = {
  high:{ bg:"#FFE5EC", fg:"#D63864" },
  mid: { bg:"#FFF3E0", fg:"#E67C23" },
  low: { bg:"#EEF6FF", fg:"#4B7BEC" },
  safe:{ bg:"#E8F8F4", fg:"#2BB89A" },
};
const PHASE_LABEL_MAP = { ovulation:"high","pred-ovulation":"high",fertHigh:"high","pred-fertHigh":"high",fertMid:"mid","pred-fertMid":"mid",postOv:"mid","pred-postOv":"low",period:"low",predicted:"low",safe:"safe" };
const PHASE_PROB_MAP  = { ovulation:"~30%","pred-ovulation":"~30%",fertHigh:"~25%","pred-fertHigh":"~25%",fertMid:"~10%","pred-fertMid":"~10%",postOv:"~8%","pred-postOv":"~8%",period:"~1%",predicted:"~1%",safe:"~2%" };

const DEFAULT_STATE = {
  lang:"en", mode:"avoid",
  actualPeriods:[
    { start:"2026-02-08", end:"2026-02-12", actual:true },
    { start:"2026-03-08", end:"2026-03-13", actual:true },
    { start:"2026-04-05", end:"2026-04-09", actual:true },
  ],
  fahLogs:{ "2026-04-05":{ mood:"😴", symptoms:["Cramps","Fatigue"], note:"" }, "2026-04-10":{ mood:"😊", symptoms:[], note:"Better today!" } },
  intimateLogs:[
    { id:1, date:"2026-04-03", time:"22:00", contraIndex:1, note:"", nth:1 },
    { id:2, date:"2026-04-15", time:"23:00", contraIndex:0, note:"", nth:1 },
  ],
  messages:[
    { from:"fah", text:"ไม่สบายนิดหน่อย แต่โอเค 🌸", date:"2026-04-05", isAI:false, id:"m1" },
    { from:"lei", text:"Rest well baby 💕", date:"2026-04-05", isAI:false, id:"m2" },
  ],
  // notifications: [{id, from, type, text, date, readBy:[]}]
  notifications:[],
};

// ─── TRANSLATE via Claude API ─────────────────────────────────────────────────
async function translateText(text, targetLang) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const d = await res.json();
    // Google returns nested arrays: [[["translated","original",...],...],...]
    const translated = d?.[0]?.map(x=>x?.[0]).filter(Boolean).join("") || text;
    return translated;
  } catch { return text; }
}

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
const Badge = ({label,bg,fg}) => <span style={{background:bg,color:fg,borderRadius:20,padding:"2px 9px",fontSize:10,fontWeight:700,display:"inline-block"}}>{label}</span>;

const LangPill = ({lang,cur,set}) => {
  const labels={zh:"中",en:"EN",th:"ไทย"};
  return <button onClick={()=>set(lang)} style={{padding:"3px 9px",borderRadius:10,border:"none",background:cur===lang?"#fff":"transparent",color:cur===lang?"#D63864":"#ffffff88",fontWeight:cur===lang?700:400,fontSize:11,cursor:"pointer"}}>{labels[lang]}</button>;
};

function statusLabel(status, t) {
  const map={period:t.periodDay,predicted:t.predictedPeriod,ovulation:t.ovulationDay,"pred-ovulation":t.ovulationDay,fertHigh:t.fertileDay,fertMid:t.fertileDay,"pred-fertHigh":t.fertileDay,"pred-fertMid":t.fertileDay,postOv:t.postOvDay,"pred-postOv":t.postOvDay,safe:t.safeDay};
  return map[status]||null;
}

// ─── ROLE SELECT ──────────────────────────────────────────────────────────────
function RoleSelect({ onSelect }) {
  const [lang, setLang] = useState("en");
  const t = T[lang];
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#B52050,#D63864,#F07090)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",padding:24}}>
      <div style={{fontSize:56,marginBottom:16}}>🌺</div>
      <div style={{color:"#fff",fontWeight:900,fontSize:28,marginBottom:6}}>{t.appName}</div>
      <div style={{color:"#fffc",fontSize:14,marginBottom:32}}>{t.tagline}</div>
      <div style={{display:"flex",gap:8,marginBottom:32,background:"#ffffff22",borderRadius:14,padding:4}}>
        {["zh","en","th"].map(l=>(
          <button key={l} onClick={()=>setLang(l)} style={{padding:"6px 16px",borderRadius:10,border:"none",background:lang===l?"#fff":"transparent",color:lang===l?"#D63864":"#ffffff99",fontWeight:lang===l?700:400,fontSize:13,cursor:"pointer"}}>
            {{zh:"中文",en:"English",th:"ไทย"}[l]}
          </button>
        ))}
      </div>
      <div style={{background:"#fff",borderRadius:24,padding:"28px 24px",width:"100%",maxWidth:360,boxShadow:"0 16px 48px #0003"}}>
        <div style={{fontWeight:800,fontSize:18,color:"#333",textAlign:"center",marginBottom:6}}>{t.chooseRole}</div>
        <div style={{fontSize:12,color:"#bbb",textAlign:"center",marginBottom:24}}>{t.chooseRoleDesc}</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <button onClick={()=>onSelect("lei",lang)} style={{padding:"16px",borderRadius:16,border:"2.5px solid #5B8AF0",background:"#F0F4FF",fontSize:16,fontWeight:700,color:"#5B8AF0",cursor:"pointer"}}>
            {t.iAmLei}
          </button>
          <button onClick={()=>onSelect("fah",lang)} style={{padding:"16px",borderRadius:16,border:"2.5px solid #D63864",background:"#FDE8EE",fontSize:16,fontWeight:700,color:"#D63864",cursor:"pointer"}}>
            {t.iAmFah}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EDIT CYCLES MODAL ────────────────────────────────────────────────────────
function EditCyclesModal({ actualPeriods, t, onSave, onClose }) {
  const [periods, setPeriods] = useState((actualPeriods||[]).map((p,i)=>({...p,_id:i})));
  const updateField = (id,field,val) => setPeriods(p=>p.map(x=>x._id===id?{...x,[field]:val}:x));
  const deletePeriod = id => setPeriods(p=>p.filter(x=>x._id!==id));
  const addPeriod = () => { const mx=periods.reduce((m,x)=>Math.max(m,x._id),0); setPeriods(p=>[...p,{start:todayStr(),end:null,actual:true,_id:mx+1}]); };
  const handleSave = () => {
    const cleaned=periods.filter(p=>p.start).map(({_id,...rest})=>({...rest,actual:true})).sort((a,b)=>a.start>b.start?1:-1);
    onSave(cleaned); onClose();
  };
  return (
    <div style={{position:"fixed",inset:0,background:"#00000077",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"28px 28px 0 0",padding:"22px 18px 40px",width:"100%",maxWidth:480,boxShadow:"0 -8px 40px #0003",maxHeight:"88vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div style={{fontWeight:800,fontSize:16}}>🩸 {t.editCyclesTitle}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#ddd"}}>✕</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:16}}>
          {periods.map(p=>(
            <div key={p._id} style={{background:"#FFF5F8",borderRadius:14,padding:"12px 14px",border:"1.5px solid #F5C0D0"}}>
              <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,color:"#D63864",fontWeight:700,marginBottom:4}}>{t.periodStart}</div>
                  <input type="date" value={p.start||""} onChange={e=>updateField(p._id,"start",e.target.value)} style={{width:"100%",border:"1.5px solid #F5C0D0",borderRadius:10,padding:"7px 10px",fontSize:13,boxSizing:"border-box",outline:"none",background:"#fff"}}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:10,color:"#5B8AF0",fontWeight:700,marginBottom:4}}>{t.periodEnd}</div>
                  <input type="date" value={p.end||""} onChange={e=>updateField(p._id,"end",e.target.value||null)} style={{width:"100%",border:"1.5px solid #C0CBFA",borderRadius:10,padding:"7px 10px",fontSize:13,boxSizing:"border-box",outline:"none",background:"#fff"}}/>
                </div>
                <button onClick={()=>deletePeriod(p._id)} style={{background:"none",border:"none",fontSize:18,color:"#ccc",cursor:"pointer",padding:"0 4px",flexShrink:0}}>🗑</button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addPeriod} style={{width:"100%",background:"#FDE8EE",color:"#D63864",border:"1.5px dashed #F5C0D0",borderRadius:12,padding:"10px 0",fontSize:13,fontWeight:600,cursor:"pointer",marginBottom:14}}>{t.addPeriod}</button>
        <button onClick={handleSave} style={{width:"100%",background:"linear-gradient(135deg,#D63864,#F07090)",color:"#fff",border:"none",borderRadius:14,padding:"13px 0",fontSize:14,fontWeight:700,cursor:"pointer"}}>{t.savelog}</button>
      </div>
    </div>
  );
}

// ─── NOTIFICATIONS PANEL ──────────────────────────────────────────────────────
function NotifPanel({ notifications, myRole, lang, t, onMarkAllRead, onClose }) {
  const myNotifs = (notifications||[])
    .filter(n => n.for === myRole)
    .sort((a,b) => a.date < b.date ? 1 : -1);
  const unread = myNotifs.filter(n => !n.read);

  return (
    <div style={{position:"fixed",inset:0,background:"#00000055",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"28px 28px 0 0",padding:"22px 18px 40px",width:"100%",maxWidth:480,boxShadow:"0 -8px 40px #0003",maxHeight:"75vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontWeight:800,fontSize:16}}>🔔 {t.notifications}</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {unread.length>0&&<button onClick={onMarkAllRead} style={{fontSize:11,color:"#D63864",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>{t.markAllRead}</button>}
            <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#ddd"}}>✕</button>
          </div>
        </div>
        {myNotifs.length===0&&<div style={{color:"#ccc",fontSize:13,textAlign:"center",padding:"24px 0"}}>{t.noNotifs}</div>}
        {myNotifs.map((n,i)=>(
          <div key={n.id||i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"10px 0",borderBottom:"1px solid #f5f5f5",opacity:n.read?0.5:1}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:n.read?"transparent":"#D63864",flexShrink:0,marginTop:5}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:"#555",lineHeight:1.5}}>{n.text}</div>
              <div style={{fontSize:10,color:"#bbb",marginTop:2}}>{n.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CALENDAR GRID ────────────────────────────────────────────────────────────
function CalendarGrid({year,month,allCycles,avgLength,avgPeriod,fahLogs,intimateLogs,onDayClick,selectedDay,lang}) {
  const td=todayStr(), days=daysInMonth(year,month), first=firstDow(year,month);
  const cells=[]; for(let i=0;i<first;i++) cells.push(null); for(let d=1;d<=days;d++) cells.push(d);
  const DOW={en:["S","M","T","W","T","F","S"],zh:["日","一","二","三","四","五","六"],th:["อา","จ","อ","พ","พฤ","ศ","ส"]};
  const intDates=new Set((intimateLogs||[]).map(x=>x.date));
  const logDates=new Set(Object.keys(fahLogs||{}));
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
          const hasLog=logDates.has(ds), hasInt=intDates.has(ds);
          // Only show ONE dot — intimate takes priority over diary
          const dotColor = hasInt?"#F585A5": hasLog?(s.dot||"#bbb"):null;
          return (
            <button key={i} onClick={()=>onDayClick(ds)} style={{aspectRatio:"1",borderRadius:10,border:isSel?"2.5px solid #D63864":isToday?"2px solid #5B8AF0":"2px solid transparent",background:s.bg||(isToday?"#EEF2FF":"#FAFAFA"),color:s.fg||(isToday?"#5B8AF0":"#333"),fontWeight:isToday||isSel?700:400,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:1,transition:"all 0.12s",padding:0}}>
              {d}
              {dotColor&&<span style={{fontSize:6,color:dotColor,lineHeight:1}}>{hasInt?"♥":"●"}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── LOG MODAL — view first, then edit ───────────────────────────────────────
function LogModal({dateStr,log,allCycles,avgLength,avgPeriod,t,lang,actualPeriods,intimateLogs,onSave,onTogglePeriodStart,onTogglePeriodEnd,onClose}) {
  const [editing, setEditing] = useState(!log); // if no log yet, go straight to edit
  const [mood,setMood]=useState(log?.mood||"😊");
  const [syms,setSyms]=useState(log?.symptoms||[]);
  const [note,setNote]=useState(log?.note||"");
  const {status,cd}=getCycleStatus(dateStr,allCycles,avgLength,avgPeriod);
  const s=SC[status]||{};
  const sl=statusLabel(status,t);
  const isStart=(actualPeriods||[]).some(p=>p.start===dateStr);
  const isEnd=(actualPeriods||[]).some(p=>p.end===dateStr);
  const dayIntimate=(intimateLogs||[]).filter(x=>x.date===dateStr);
  const prob=getBaseProb(status);
  const probPct=`~${Math.round(prob*100)}%`;

  // VIEW mode — shows status summary + existing records
  const ViewMode = () => (
    <div>
      {/* Status card */}
      <div style={{background:s.bg||"#f8f8f8",borderRadius:16,padding:"14px 16px",marginBottom:14,border:`1.5px solid ${s.fg||"#eee"}22`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontWeight:800,fontSize:18,color:s.fg||"#333"}}>{sl||"–"}</div>
            {cd&&<div style={{fontSize:12,color:s.fg||"#aaa",opacity:0.8}}>{lang==="zh"?`周期第 ${cd} 天`:lang==="th"?`วันที่ ${cd}`:`Cycle Day ${cd}`}</div>}
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:22,fontWeight:900,color:s.fg||"#333"}}>{probPct}</div>
            <div style={{fontSize:10,color:s.fg||"#aaa",opacity:0.7}}>{t.pregnancyChance}</div>
          </div>
        </div>
      </div>

      {/* Period mark buttons */}
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        <button onClick={onTogglePeriodStart} style={{flex:1,padding:"9px 0",borderRadius:12,fontSize:11,fontWeight:600,cursor:"pointer",border:"none",background:isStart?"#D63864":"#FDE8EE",color:isStart?"#fff":"#D63864"}}>
          🩸 {isStart?`✓ ${t.markPeriodStart}`:t.markPeriodStart}
        </button>
        <button onClick={onTogglePeriodEnd} style={{flex:1,padding:"9px 0",borderRadius:12,fontSize:11,fontWeight:600,cursor:"pointer",border:"none",background:isEnd?"#5B8AF0":"#EEF2FF",color:isEnd?"#fff":"#5B8AF0"}}>
          ✓ {isEnd?`✓ ${t.markPeriodEnd}`:t.markPeriodEnd}
        </button>
      </div>

      {/* Existing log summary */}
      {log&&(
        <div style={{background:"#fafafa",borderRadius:14,padding:"12px 14px",marginBottom:14}}>
          <div style={{fontSize:10,color:"#bbb",fontWeight:700,marginBottom:8,letterSpacing:0.8,textTransform:"uppercase"}}>{lang==="zh"?"今日记录":lang==="th"?"บันทึกวันนี้":"Today's Log"}</div>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
            <span style={{fontSize:22}}>{log.mood}</span>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {(log.symptoms||[]).map(s=><span key={s} style={{background:"#FDE8EE",color:"#D63864",borderRadius:7,padding:"2px 8px",fontSize:10}}>{s}</span>)}
            </div>
          </div>
          {log.note&&<div style={{fontSize:12,color:"#666",fontStyle:"italic"}}>"{log.note}"</div>}
        </div>
      )}

      {/* Intimate records for this day */}
      {dayIntimate.length>0&&(
        <div style={{background:"#FFF5F8",borderRadius:14,padding:"12px 14px",marginBottom:14}}>
          <div style={{fontSize:10,color:"#F585A5",fontWeight:700,marginBottom:8,letterSpacing:0.8,textTransform:"uppercase"}}>♥ {lang==="zh"?"亲密记录":lang==="th"?"บันทึกความใกล้ชิด":"Intimate"}</div>
          {dayIntimate.map((rec,i)=>(
            <div key={i} style={{fontSize:12,color:"#888",marginBottom:3}}>{rec.time} · {CONTRA_ICONS[rec.contraIndex]} {rec.note||""}</div>
          ))}
        </div>
      )}

      {/* Edit diary button */}
      <button onClick={()=>setEditing(true)} style={{width:"100%",background:"linear-gradient(135deg,#D63864,#F07090)",color:"#fff",border:"none",borderRadius:14,padding:"13px 0",fontSize:14,fontWeight:700,cursor:"pointer"}}>
        ✏️ {log?(lang==="zh"?"修改日记":lang==="th"?"แก้ไขบันทึก":"Edit Diary"):(lang==="zh"?"写日记":lang==="th"?"เขียนบันทึก":"Write Diary")}
      </button>
    </div>
  );

  // EDIT mode
  const EditMode = () => (
    <div>
      <button onClick={()=>setEditing(false)} style={{background:"none",border:"none",color:"#aaa",fontSize:13,cursor:"pointer",marginBottom:12,padding:0}}>← {lang==="zh"?"返回":lang==="th"?"กลับ":"Back"}</button>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:10,color:"#bbb",fontWeight:700,letterSpacing:0.8,marginBottom:7,textTransform:"uppercase"}}>{t.mood}</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{MOODS.map(m=><button key={m} onClick={()=>setMood(m)} style={{fontSize:22,background:mood===m?"#FDE8EE":"#f7f7f7",border:mood===m?"2px solid #D63864":"2px solid transparent",borderRadius:10,padding:"3px 6px",cursor:"pointer"}}>{m}</button>)}</div>
      </div>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:10,color:"#bbb",fontWeight:700,letterSpacing:0.8,marginBottom:7,textTransform:"uppercase"}}>{t.symptoms}</div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{SYMPTOMS[lang].map(sy=><button key={sy} onClick={()=>setSyms(p=>p.includes(sy)?p.filter(x=>x!==sy):[...p,sy])} style={{padding:"4px 10px",borderRadius:20,fontSize:11,background:syms.includes(sy)?"#D63864":"#f5f5f5",color:syms.includes(sy)?"#fff":"#666",border:"none",cursor:"pointer",transition:"all 0.12s"}}>{sy}</button>)}</div>
      </div>
      <div style={{marginBottom:18}}>
        <div style={{fontSize:10,color:"#bbb",fontWeight:700,letterSpacing:0.8,marginBottom:7,textTransform:"uppercase"}}>{t.note}</div>
        <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder={t.notePlaceholder} style={{width:"100%",border:"1.5px solid #eee",borderRadius:12,padding:"10px 12px",fontSize:13,resize:"none",height:64,boxSizing:"border-box",outline:"none",fontFamily:"inherit"}}/>
      </div>
      <button onClick={()=>onSave({mood,symptoms:syms,note})} style={{width:"100%",background:"linear-gradient(135deg,#D63864,#F07090)",color:"#fff",border:"none",borderRadius:14,padding:"13px 0",fontSize:14,fontWeight:700,cursor:"pointer"}}>{t.savelog}</button>
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,background:"#00000077",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"28px 28px 0 0",padding:"22px 18px 40px",width:"100%",maxWidth:480,boxShadow:"0 -8px 40px #0003",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div><div style={{fontWeight:800,fontSize:15}}>{dateStr}</div></div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#ddd"}}>✕</button>
        </div>
        {editing ? <EditMode/> : <ViewMode/>}
      </div>
    </div>
  );
}

// ─── INTIMATE MODAL — supports create + edit ─────────────────────────────────
function IntimateModal({allCycles,avgLength,avgPeriod,intimateLogs,t,lang,onSave,onClose,editRecord}) {
  const existing = editRecord;
  const initH = existing ? parseInt(existing.time?.split(":")?.[0]||"22") : 22;
  const initM = existing ? parseInt(existing.time?.split(":")?.[1]||"0") : 0;
  const [date,setDate]=useState(existing?.date||todayStr());
  const [hour,setHour]=useState(initH);
  const [min,setMin]=useState(initM);
  const [ci,setCi]=useState(existing?.contraIndex??1);
  const [note,setNote]=useState(existing?.note||"");
  const {status}=getCycleStatus(date,allCycles,avgLength,avgPeriod);
  const s=SC[status]||{};
  const sl=statusLabel(status,t);
  const lastCi=(intimateLogs||[]).filter(x=>!existing||x.id!==existing.id).slice(0,1)[0]?.contraIndex??null;
  const nth=existing?.nth||(intimateLogs||[]).filter(x=>x.date===date).length+1;
  const lastLabel=lang==="zh"?"上次":lang==="th"?"ครั้งก่อน":"Last";
  const isEditing=!!existing;
  const handleSave = () => {
    const rec = {date,time:`${pad2(hour)}:${pad2(min)}`,contraIndex:ci,note,nth,id:existing?.id||Date.now()};
    onSave(rec, isEditing);
  };
  return (
    <div style={{position:"fixed",inset:0,background:"#00000077",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:"28px 28px 0 0",padding:"22px 18px 40px",width:"100%",maxWidth:480,boxShadow:"0 -8px 40px #0003",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div style={{fontWeight:800,fontSize:16}}>{isEditing?(lang==="zh"?"✏️ 编辑亲密记录":lang==="th"?"✏️ แก้ไขบันทึก":"✏️ Edit Record"):`♥ ${t.nth}${nth} ${t.intimate_log}`}</div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#ddd"}}>✕</button>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,color:"#bbb",fontWeight:700,letterSpacing:0.8,marginBottom:7,textTransform:"uppercase"}}>{lang==="zh"?"日期":lang==="th"?"วันที่":"Date"}</div>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:"100%",border:"1.5px solid #eee",borderRadius:12,padding:"10px 12px",fontSize:13,boxSizing:"border-box",outline:"none",fontFamily:"inherit"}}/>
          {sl&&<div style={{marginTop:6}}><Badge label={sl} bg={s.bg||"#f5f5f5"} fg={s.fg||"#aaa"}/></div>}
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:10,color:"#bbb",fontWeight:700,letterSpacing:0.8,marginBottom:10,textTransform:"uppercase"}}>{t.contraception}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
            {t.contraOptions.map((opt,i)=>(
              <button key={i} onClick={()=>setCi(i)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"10px 4px",borderRadius:14,border:"none",cursor:"pointer",background:ci===i?"#FDE8EE":"#f8f8f8",outline:ci===i?"2px solid #D63864":"none",position:"relative",transition:"all 0.15s"}}>
                {lastCi===i&&ci!==i&&<span style={{position:"absolute",top:3,right:3,fontSize:7,background:"#2BB89A",color:"#fff",borderRadius:5,padding:"1px 3px"}}>{lastLabel}</span>}
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
        <button onClick={handleSave} style={{width:"100%",background:"linear-gradient(135deg,#F585A5,#D63864)",color:"#fff",border:"none",borderRadius:14,padding:"13px 0",fontSize:14,fontWeight:700,cursor:"pointer"}}>{t.savelog}</button>
      </div>
    </div>
  );
}

// ─── MESSAGE BUBBLE with translate ───────────────────────────────────────────
function MsgBubble({ item, myRole, t, lang }) {
  const [translated, setTranslated] = useState(null);
  const [loading, setLoading] = useState(false);
  const isMe = item.from === myRole;
  const isOther = !isMe;

  const handleTranslate = async () => {
    if (translated) { setTranslated(null); return; }
    setLoading(true);
    // Logic: zh→en, en/th→zh
    // Lei reads Fah's messages → translate to Chinese
    // Fah reads Lei's messages → translate to English
    const translateTo = myRole === "lei" ? "zh" : "en";
    const result = await translateText(item.text, translateTo);
    setTranslated(result);
    setLoading(false);
  };

  return (
    <div style={{display:"flex",justifyContent:isMe?"flex-end":"flex-start",flexDirection:"column",alignItems:isMe?"flex-end":"flex-start",gap:3}}>
      <div style={{maxWidth:"76%",background:item.from==="fah"?"linear-gradient(135deg,#FDE8EE,#FFF5F8)":"linear-gradient(135deg,#EEF2FF,#F0F4FF)",borderRadius:item.from==="fah"?"4px 16px 16px 16px":"16px 4px 16px 16px",padding:"8px 12px",fontSize:13,color:"#333"}}>
        <div style={{fontSize:9,color:"#ccc",marginBottom:3}}>{item.from==="fah"?"🌺 Fah":"🫶 Lei"} · {item.date}</div>
        {item.text}
        {translated&&(
          <div style={{marginTop:6,paddingTop:6,borderTop:"1px solid #eee",fontSize:12,color:"#888",fontStyle:"italic"}}>
            {translated}
          </div>
        )}
      </div>
      {/* Show translate button for other person's messages only */}
      {isOther&&(
        <button onClick={handleTranslate} style={{fontSize:10,color:"#aaa",background:"none",border:"none",cursor:"pointer",padding:"0 4px"}}>
          {loading?t.translating:translated?t.translated:t.translate} 🌐
        </button>
      )}
    </div>
  );
}

// ─── DAILY MESSAGES ────────────────────────────────────────────────────────────
function getDailyMessages(phase, daysLeft, lang) {
  const dL = daysLeft || "?";
  const FAH = {
    zh: {
      ovulation:[`宝，今天是你的排卵日 🌸 身体有没有那种微微酸胀的感觉？很正常的，你辛苦了。今晚我来照顾你 💕`,`今天是你排卵日，我想抱着你，就这样陪着你 🌸`,`宝贝，排卵日到了 🥚 你每天都在认真对待自己的身体，这让我更爱你了 💕`,`排卵日的你特别美 🌸 就是觉得这样的你让我更迷你了 ❤️`,`宝，今天排卵日，可能感觉比平时敏感一点。想撒娇还是想安静，我都配你 💕`,`今天是你的排卵日 🌸 不管我们有没有计划，我都想让你知道你很厉害，我好爱你 💕`,`排卵日到了宝贝 🥚 今晚别吃冷的，我给你准备热汤，就在你旁边陪你 ❤️`,`宝，排卵日你有没有那种特别想被抱着的感觉？我今天就想一直抱着你 🌸💕`],
      "pred-ovulation":[`宝贝，根据你的周期今天差不多是排卵日 🌸 感觉怎么样？💕`,`今天应该是你排卵日附近，有任何感觉都跟我说，不用一个人扛 ❤️`,`预计今天是排卵日，你感觉到了吗？我一直有在留意你的周期 🌸 爱你 💕`],
      fertHigh:[`宝，这两天是你最特别的时候 🌿 今晚早点回来好不好？❤️`,`易孕高峰期的你，身体特别敏感。今天想要什么就跟我说，我满足你 💕`,`这两天是你的高峰易孕期 🌿 不管我们的计划是什么，我都想好好照顾你。你愿意让我吗？❤️`,`宝贝，排卵高峰来了 🌸 我想参与进来，陪你一起 💕`,`高峰易孕期 🌿 今晚我来负责让你放松，其他什么都不用想 ❤️`,`宝，这两天少喝冷的，多暖暖的。我今晚想抱着你睡 💕`,`易孕高峰期的你好像格外有魅力 🌿 今天我格外想看你 ❤️`,`这几天是你最特别的时候 🌸 身体在努力，我也在努力——努力让你感受到我的爱 💕`],
      "pred-fertHigh":[`宝贝，预计这两天是你的易孕高峰 🌿 你感觉到什么变化了吗？💕`,`这几天应该是你的高峰期，多注意身体哦 🌸 有我在 ❤️`,`预计高峰易孕期，宝 🌿 我在认真记录你的周期，因为你对我来说很重要 💕`],
      fertMid:[`宝，现在是你的易孕期 🌱 有不舒服就告诉我，别一个人撑着 💕`,`易孕期到了宝贝 🌿 今天有什么我能帮你的？❤️`,`这几天是你的易孕窗口 🌱 我最近总是忍不住想到你 💕`,`宝，易孕期多喝温水，少吃凉的 🌿 我今晚想给你做饭，有没有想吃的？❤️`,`易孕期的你皮肤好像特别好 🌱 你今天很好看。我爱你 💕`,`这几天是你的易孕期 🌿 晚上我帮你按摩好不好？❤️`],
      "pred-fertMid":[`宝贝，预计这几天是你的易孕期 🌱 注意身体，有我在 💕`,`易孕期快到了，我一直在留意你 ❤️`],
      postOv:[`宝，排卵期刚过了 🌙 身体可以放松了。今晚想干嘛？我全程配合 😊💕`,`排卵期结束了，你辛苦了宝贝 🌙 今晚我们就窝在一起好不好？❤️`,`过了排卵期，宝贝可以喘口气了 🌙 刷剧、吃东西，什么都行 💕`,`排卵高峰期过去了 🌙 今晚你说了算 ❤️`,`宝，排卵期结束了 🌙 你最近一直在认真记录身体状况，真的很厉害。我好爱这样的你 💕`],
      "pred-postOv":[`排卵期差不多结束了宝贝 🌙 好好放松 💕`],
      period:[`宝贝，你来月经了 🩸 最难受的时候我好希望我能替你受。有没有哪里特别不舒服？我来陪你 💕`,`经期来了宝 🩸 今天不用忍，想撒娇就撒娇，我接着 ❤️`,`来月经了，宝贝辛苦了 🌸 暖宝宝贴好了吗？我去给你买红糖姜茶好不好？💕`,`宝，经期的你比平时更需要被疼爱，我今天格外想抱着你 🩸 你愿意让我吗？❤️`,`来经期了 🩸 今天什么事都不用你做，让我来。你就好好躺着 💕`,`宝贝经期辛苦了 🌸 不管你今天情绪怎么样，我都在这里不会跑 ❤️`,`来月经了宝 🩸 痛经的时候不要忍，给我说一声 💕`,`经期的你依然很美 🌸 我知道你身体很不舒服，但我就是忍不住想告诉你这个 ❤️`,`宝贝，月经来了 🩸 我今晚想陪着你，就静静地陪着，就是想让你知道我在 💕`],
      predicted:[`宝贝，再过 ${dL} 天你的经期就要来了 📅 需要我帮你准备什么吗？💕`,`${dL} 天后经期要来了宝 📅 不管发生什么我都站在你这边 ❤️`,`快要来经期了，再过 ${dL} 天 🩸 你平时经期痛不痛？我想更了解你的身体 💕`,`宝贝，${dL} 天后月经来 📅 这几天少吃冷的，好好暖着自己 ❤️`,`快来经期了宝 📅 经前这几天身体可能会有点不舒服，告诉我，我来陪你 💕`,`再过 ${dL} 天就是你的经期了 🩸 情绪如果有点奇怪很正常。我不会介意，我只会更心疼你 ❤️`],
      safe:[`宝贝，距离下次经期还有 ${dL} 天 📅 好好享受。今天感觉怎么样？💕`,`还有 ${dL} 天经期到来，趁现在身体好，今晚出去走走吧 🌙 我想陪你 ❤️`,`安全期的你好像特别开心 😊 我太喜欢看你开心的样子了 💕`,`宝，这几天是安全期 🌙 我爱你 ❤️`,`距离经期 ${dL} 天，宝贝 📅 我想看到你状态最好的样子 💕`,`安全期了宝 😊 你最近状态特别好 ❤️`,`宝贝，经期还有 ${dL} 天 📅 趁现在不难受，我们去做你一直想做的事怎么样？💕`,`${dL} 天后经期，现在是你最轻松的时候 🌙 我今晚想带你去你喜欢的地方，就你和我 ❤️`],
    },
    en: {
      ovulation:[`Baby, today's your ovulation day 🌸 Your body might feel a little different — that's it working hard. I see you. I love you 💕`,`Ovulation day babe 🥚 Let me take care of you tonight ❤️`,`Today is your ovulation day 🌸 Whatever you need — I'm yours 💕`,`Babe, ovulation day 🥚 I just want to hold you today. No reason. Just want to 🌸❤️`,`Your ovulation day babe 🌸 You track all of this so carefully and I find that incredibly attractive 💕`,`Ovulation day — your body is doing something incredible 🥚 I just want to be next to you ❤️`,`Baby it's your ovulation day 🌸 No cold drinks tonight okay? Let me make you something warm 💕`,`Ovulation day babe 🥚 I can't stop thinking about you today. I love you ❤️`],
      "pred-ovulation":[`Baby, your cycle says today's probably your ovulation day 🌸 Feeling anything? Tell me everything 💕`,`Predicted ovulation day babe 🌿 I'm paying close attention because YOU matter to me ❤️`,`Should be around your ovulation day babe 🌸 How's your body feeling? 💕`],
      fertHigh:[`Babe, these are your peak fertile days 🌿 I want to be the one taking care of you ❤️`,`Peak fertility window babe 🌸 Come here, let me hold you 💕`,`These two days are your highest fertility babe 🌿 I just want you close to me tonight ❤️`,`Peak fertile days 🌸 Let me be more involved — starting tonight 💕`,`Babe these are your peak days 🌿 You've never been more beautiful to me ❤️`,`High fertility peak babe 🌸 Just want to be extra close to you 💕`,`These 2 days are special babe 🌿 Let me take care of everything tonight so you can just relax ❤️`,`Peak fertile window 🌸 I've been thinking about you all day. Can I come over? 💕`],
      "pred-fertHigh":[`Baby predicted peak fertile days 🌿 Any changes in how you feel? ❤️`,`Should be your peak days babe 🌸 I care about every part of you 💕`],
      fertMid:[`Fertile window babe 🌱 Tell me if anything feels off ❤️`,`You're in your fertile window babe 🌿 I've been thinking about you more than usual 💕`,`Fertile days babe 🌱 Warm drinks, no cold food, and me by your side ❤️`,`Fertile window 🌿 Your skin looks amazing right now. I love you 💕`,`Babe, fertile window 🌱 Is there anything you've been craving? Tell me ❤️`,`These are your fertile days babe 🌿 I want to just hold your hand and not let go 💕`],
      "pred-fertMid":[`Predicted fertile window babe 🌱 Take note of how you feel ❤️`,`Should be your fertile days babe 🌿 I'm here watching out for you 💕`],
      postOv:[`Ovulation's done babe 🌙 Tonight — whatever YOU want 💕`,`Post-ovulation babe 🌙 Let me make tonight easy for you ❤️`,`Peak is over babe 🌙 Snacks, blanket, you, me — that's all I want 💕`,`Ovulation done 🌙 Rest now. I've got you ❤️`,`Post-ovulation days 🌙 Just want to hold you and be still with you 💕`],
      "pred-postOv":[`Ovulation wrapping up babe 🌙 Time to decompress. I'm here 💕`],
      period:[`Baby, your period's here 🩸 I wish I could take the pain for you. Tell me exactly what you need ❤️`,`Period days babe 🩸 You don't have to be strong. I'm not going anywhere 💕`,`Your period came babe 🩸 Heating pad? Your favourite snacks? Just tell me where it hurts ❤️`,`Babe it's your period 🌸 You handle this every month — you're incredible. Let me spoil you 💕`,`Period time babe 🩸 Today nothing is your responsibility. I'll take care of it ❤️`,`Baby your period's here 🌸 You can take it all out on me, I can handle it 💕`,`Babe, period time 🩸 Hot tea, warm blanket, and me ❤️`,`Your period's here babe 🌸 Can I come over and just hold you? 💕`,`Period days 🩸 You're still the most beautiful person I know even when you're curled up in pain ❤️`],
      predicted:[`Babe, ${dL} days until your period 📅 Need me to get anything for you? 💕`,`${dL} more days babe 📅 I'm ready for all versions of you ❤️`,`Period coming in ${dL} days babe 🩸 What helps you most? I want to be better prepared 💕`,`${dL} days babe 📅 If you feel off, tell me ❤️`,`Babe, ${dL} days to your period 📅 What do you want to do before it comes? 💕`,`${dL} days till period babe 🩸 I'll be right here for every bit of it ❤️`],
      safe:[`${dL} days until your next period babe 📅 How are YOU feeling today? 💕`,`Safe phase babe 😊 Let's do something you've been wanting to do ❤️`,`Babe, ${dL} more days 📅 I love seeing you comfortable and happy 💕`,`${dL} days babe 🌙 Tonight let's go somewhere just the two of us ❤️`,`Safe days babe 😊 Let's fill these ${dL} days with good memories 💕`,`${dL} days until period babe 📅 I want to take you somewhere nice. You deserve to be spoiled 💕`,`Safe phase — ${dL} days babe 🌙 Can we do something tonight, just us? ❤️`,`Babe ${dL} more days 📅 I want to see you smile today 💕`],
    },
    th: {
      ovulation:[`ที่รัก วันนี้เป็นวันตกไข่ของเธอ 🌸 ร่างกายอาจรู้สึกแปลกๆ นิดหน่อย ฉันอยู่ตรงนี้เสมอ 💕`,`วันตกไข่นะที่รัก 🥚 อยากให้ฉันอยู่ใกล้ๆ ไหม? ❤️`,`วันนี้วันตกไข่ที่รัก 🌸 อยากกอดเธอแน่นๆ เลย 💕`,`วันตกไข่ของเธอ 🥚 เธอดูแลร่างกายตัวเองได้ดีมาก ฉันรักสิ่งนี้ในตัวเธอ ❤️`,`ที่รัก วันตกไข่มาแล้ว 🌸 คืนนี้อย่าดื่มของเย็นนะ ให้ฉันทำอาหารอุ่นๆ ให้เธอ 💕`],
      "pred-ovulation":[`ที่รัก คาดว่าวันนี้น่าจะเป็นวันตกไข่ 🌸 รู้สึกยังไงบ้าง? 💕`,`น่าจะใกล้วันตกไข่แล้วที่รัก 🌿 ฉันติดตามรอบเธออยู่เสมอ ❤️`],
      fertHigh:[`ที่รัก ช่วงนี้เป็นช่วง peak เจริญพันธุ์ 🌿 อยากอยู่ข้างๆ เธอมากขึ้นเลย 💕`,`ช่วงเจริญพันธุ์สูงสุดนะที่รัก 🌸 ฉันแค่อยากอยู่ใกล้เธอคืนนี้ ❤️`,`Peak fertile days ที่รัก 🌿 ฉันคิดถึงเธอตลอดวันเลย 💕`,`ช่วงที่พิเศษที่สุดของเธอ 🌸 ให้ฉันดูแลทุกอย่างคืนนี้ ❤️`,`เจริญพันธุ์สูงสุดที่รัก 🌿 เธอสวยเป็นพิเศษช่วงนี้เลยนะ 💕`],
      "pred-fertHigh":[`คาดว่าช่วงนี้เป็น peak เจริญพันธุ์ที่รัก 🌿 รู้สึกยังไงบ้าง? 💕`],
      fertMid:[`ที่รัก อยู่ในช่วงเจริญพันธุ์นะ 🌱 บอกฉันได้เลยถ้าไม่สบาย 💕`,`Fertile window ที่รัก 🌿 ดื่มน้ำอุ่นๆ อย่ากินของเย็น ❤️`,`ช่วงเจริญพันธุ์ที่รัก 🌱 อยากจับมือเธอแล้วไม่ปล่อยวันนี้ 💕`],
      "pred-fertMid":[`ใกล้ช่วงเจริญพันธุ์แล้วที่รัก 🌱 ดูแลตัวเองด้วยนะ 💕`],
      postOv:[`ผ่านช่วงตกไข่มาแล้วที่รัก 🌙 คืนนี้จะทำอะไรก็ได้ที่เธออยากทำ ฉันตาม 💕`,`Peak ผ่านไปแล้วนะที่รัก 🌙 คืนนี้ให้ฉันดูแลเธอได้ไหม? ❤️`,`ผ่าน peak มาแล้วที่รัก 🌙 ขนม ผ้าห่ม เธอ ฉัน — นั่นคือแผนคืนนี้ 💕`],
      "pred-postOv":[`ใกล้จะผ่าน peak แล้วที่รัก 🌙 พักผ่อนได้แล้ว ฉันอยู่ตรงนี้ 💕`],
      period:[`ที่รัก ประจำเดือนมาแล้ว 🩸 อยากเอาความเจ็บปวดออกจากเธอได้เลย บอกฉันได้เลยว่าต้องการอะไร ❤️`,`ประจำเดือนมาแล้วนะที่รัก 🩸 ไม่ต้องเข้มแข็งเลย ฉันไม่ไปไหน 💕`,`ที่รัก ประจำเดือนมาแล้ว 🌸 วันนี้ไม่มีอะไรที่เธอต้องรับผิดชอบ ให้ฉันดูแลเธอ ❤️`,`ประจำเดือนมาที่รัก 🩸 อยากมาอยู่ข้างๆ เธอเลย 💕`,`เธอสวยมากแม้แต่ตอนเจ็บปวด 🌸 รักเธอมากที่รัก ❤️`,`ประจำเดือนมาที่รัก 🩸 อยากอุ้มเธอไปส่งที่เตียงแล้วนอนอยู่ข้างๆ เลย 💕`],
      predicted:[`อีก ${dL} วันประจำเดือนจะมาที่รัก 📅 ต้องการอะไรบอกฉันได้เลย 💕`,`${dL} วันนะที่รัก 📅 ฉันพร้อมรับทุกอารมณ์ของเธอเลย ❤️`,`ประจำเดือนจะมาใน ${dL} วันที่รัก 🩸 มาทำสิ่งที่เธออยากทำก่อนดีกว่า ฉันพาไป 💕`],
      safe:[`อีก ${dL} วันถึงประจำเดือนที่รัก 📅 รู้สึกยังไงบ้างวันนี้? 💕`,`ช่วงปลอดภัยนะที่รัก 😊 คืนนี้ออกไปข้างนอกด้วยกันไหม? 🌙❤️`,`${dL} วันก่อนประจำเดือนที่รัก 📅 ช่วงนี้เธอดูมีความสุขมาก ฉันรักที่จะเห็นเธอแบบนี้ 💕`,`ที่รัก อีก ${dL} วัน 📅 อยากพาเธอไปที่ไหนสักที่ แค่สองคน ❤️`],
    },
  };
  const LEI = {
    zh: {
      ovulation:[`今天是 Fah 的排卵日，身体比较敏感，情绪可能波动。多一些耐心，帮她准备热饮，今晚多陪着她 🌸`,`排卵日 Fah 可能有轻微腹胀或腰酸，热敷或暖宝宝会很贴心。少说重话，多给拥抱 💕`],
      "pred-ovulation":[`今天预计是 Fah 的排卵日，多关注她的状态，问问她感觉怎么样 🌸`],
      fertHigh:[`Fah 处于易孕高峰期，情绪和身体都比较敏感。今天特别细心，不要让她觉得孤单 🌿`,`高峰易孕期，Fah 的身体正在经历很多，多给她温柔和耐心 💕`],
      "pred-fertHigh":[`预计 Fah 在易孕高峰期，多关心她这两天 🌿`],
      fertMid:[`Fah 在易孕期，帮她准备暖水袋，少让她吃冷的，今天多一些体贴 🌱`,`易孕期的 Fah 如果情绪有点奇怪，先听她说，不要起冲突 💕`],
      "pred-fertMid":[`预计 Fah 进入易孕期，多关心她的身体状况 🌱`],
      postOv:[`排卵期刚过，Fah 的身体可以放松了。陪她做轻松愉快的事 🌙`],
      "pred-postOv":[`排卵期差不多结束了，帮 Fah 好好放松 🌙`],
      period:[`Fah 在经期，可能有痛经、情绪波动、疲倦。今天最重要的是：暖宝宝、热水、她爱吃的，还有你的耐心 🩸`,`经期的 Fah 需要被照顾，不是被挑战。今天避免争论，多问"需要什么" 💕`,`经期第一二天通常最难受。帮她买止痛药、红糖姜茶，或者安静陪着她 🌸`],
      predicted:[`Fah 的经期还有 ${dL} 天，她可能开始出现经前症状：情绪敏感、容易疲倦 📅`,`快来经期了，这几天 Fah 可能比平时更容易情绪化。多问候、多关心 💕`],
      safe:[`Fah 现在身体状态比较好，趁这段时间多安排让她开心的活动 😊`,`安全期的 Fah 心情通常较好，是好好增进感情的好时机 💕`],
    },
    en: {
      ovulation:[`Today is Fah's ovulation day — she may feel heightened emotions. Be extra gentle, prepare a warm drink, and just be present tonight 🌸`,`Ovulation day for Fah. A heating pad and your patience are the best gifts 💕`],
      "pred-ovulation":[`Predicted ovulation day for Fah. Check in on how she's feeling 🌸`],
      fertHigh:[`Fah is at peak fertility — her body and mood may be more sensitive. Stay close, be patient 🌿`,`Peak fertile days. Fah's body is going through a lot — tenderness and presence go a long way 💕`],
      "pred-fertHigh":[`Predicted peak fertile days for Fah. Extra attentiveness goes a long way 🌿`],
      fertMid:[`Fah's in her fertile window. Warm drinks, avoiding cold food, and checking in will mean a lot 🌱`,`Fertile window days — if she seems a bit different, just listen 💕`],
      "pred-fertMid":[`Predicted fertile window for Fah. Keep an eye on how she's feeling 🌱`],
      postOv:[`Ovulation just ended for Fah — time to relax together. Plan something low-key 🌙`],
      "pred-postOv":[`Ovulation wrapping up for Fah. Help her decompress and rest 🌙`],
      period:[`Fah is on her period. Essentials: heating pad, warm drinks, her favourite snacks, and your patience 🩸`,`Period days — ask "what do you need?" instead of "what's wrong?" 💕`,`First couple of period days are usually hardest. Pain relief, warm tea, a quiet presence 🌸`],
      predicted:[`Fah's period is ${dL} days away. PMS symptoms may start soon — mood shifts, fatigue 📅`,`${dL} days to her period — more check-ins, less criticism this week 💕`],
      safe:[`Fah's in a comfortable phase. Great time to plan something she loves 😊`,`Safe phase — make the most of it with quality time together 💕`],
    },
    th: {
      ovulation:[`วันนี้ Fah อยู่ในวันตกไข่ เธออาจรู้สึกไวขึ้น ดูแลเธอด้วยความอ่อนโยนพิเศษ 🌸`],
      "pred-ovulation":[`คาดว่าวันนี้ Fah อยู่ในวันตกไข่ ดูแลเธอเป็นพิเศษ 🌸`],
      fertHigh:[`Fah อยู่ในช่วง peak เจริญพันธุ์ ถ้ามีแผนคุมกำเนิดต้องระวัง และให้ความอบอุ่นเธอมากขึ้น 🌿`],
      "pred-fertHigh":[`คาดว่า Fah อยู่ในช่วง peak เจริญพันธุ์ ดูแลเธอเป็นพิเศษ 🌿`],
      fertMid:[`Fah อยู่ในช่วงเจริญพันธุ์ ร่างกายอาจไวขึ้น หลีกเลี่ยงอาหารเย็น 🌱`],
      "pred-fertMid":[`ใกล้ช่วงเจริญพันธุ์แล้ว ดูแล Fah ด้วยนะ 🌱`],
      postOv:[`ช่วงตกไข่ผ่านไปแล้วสำหรับ Fah วางแผนทำอะไรสนุกๆ ด้วยกัน 🌙`],
      "pred-postOv":[`ช่วงตกไข่ใกล้จะผ่านแล้ว ช่วย Fah ผ่อนคลาย 🌙`],
      period:[`Fah มีประจำเดือน เธออาจปวดท้องและอารมณ์แปรปรวน เตรียมกระเป๋าน้ำร้อน เครื่องดื่มอุ่น อาหารที่ชอบ 🩸`,`ช่วงประจำเดือน แค่ถามว่า "ต้องการอะไร" และอยู่ข้างๆ เธอ 💕`],
      predicted:[`ประจำเดือน Fah จะมาใน ${dL} วัน เธออาจเริ่มมีอาการ PMS ให้ระวัง 📅`],
      safe:[`Fah อยู่ในช่วงปลอดภัย วางแผนทำอะไรสนุกๆ ด้วยกันได้เลย 😊`],
    },
  };
  const fahLang=FAH[lang]||FAH.en, leiLang=LEI[lang]||LEI.en;
  const fahArr=fahLang[phase]||fahLang.safe||[], leiArr=leiLang[phase]||leiLang.safe||[];
  return { fahMsg:pick(fahArr)||fahArr[0]||"💕", leiMsg:pick(leiArr)||leiArr[0]||"❤️" };
}

// ─── NOTIFICATION BUILDER ─────────────────────────────────────────────────────
function buildNotif(from, type, t, extra) {
  const other = from === "lei" ? "fah" : "lei";
  const fromName = from === "lei" ? "Lei 🫶" : "Fah 🌺";
  const typeText = {
    msg: t.notifMsg,
    intimate: t.notifIntimate,
    periodStart: t.notifPeriodStart,
    periodEnd: t.notifPeriodEnd,
    editCycles: t.notifEditCycles,
    ai: t.notifAI,
  }[type] || type;
  return {
    id: `${Date.now()}_${Math.random()}`,
    from, for: other,
    type, text: `${fromName} ${typeText}${extra ? ` (${extra})` : ""}`,
    date: todayStr(), read: false,
  };
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [myRole, setMyRole] = useState(() => localStorage.getItem(LOCAL_USER_KEY)||null);
  const [state, setState] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [vm, setVm] = useState({year:new Date().getFullYear(),month:new Date().getMonth()});
  const [selDay, setSelDay] = useState(null);
  const [showLog, setShowLog] = useState(false);
  const [showIntimate, setShowIntimate] = useState(false);
  const [editIntimateRecord, setEditIntimateRecord] = useState(null);
  const [showEditCycles, setShowEditCycles] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [tab, setTab] = useState("calendar");
  const [newMsg, setNewMsg] = useState("");
  

  useEffect(()=>{
    const ref=doc(db,"couples",COUPLE_ID);
    getDoc(ref).then(snap=>{ if(!snap.exists()) setDoc(ref,DEFAULT_STATE); });
    const unsub=onSnapshot(ref,snap=>{
      if(snap.exists()) setState(snap.data());
      else setState(DEFAULT_STATE);
    });
    return ()=>unsub();
  },[]);

  const save = async (updates, notifType, extra) => {
    setSyncing(true);
    const ref = doc(db,"couples",COUPLE_ID);
    const snap = await getDoc(ref);
    const current = snap.exists() ? snap.data() : DEFAULT_STATE;

    let newNotifs = [...(current.notifications||[])];
    if (notifType && myRole) {
      newNotifs = [...newNotifs, buildNotif(myRole, notifType, T[current.lang||"en"], extra)];
      // Keep last 50 notifications
      if (newNotifs.length > 50) newNotifs = newNotifs.slice(-50);
      updates.notifications = newNotifs;
    }

    await setDoc(ref, updates, {merge:true});
    setSyncing(false);
  };

  const handleRoleSelect = (role, lang) => {
    localStorage.setItem(LOCAL_USER_KEY, role);
    setMyRole(role);
    save({ lang });
  };

  if (!myRole) return <RoleSelect onSelect={handleRoleSelect} />;

  if (!state) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#FFF4F7",flexDirection:"column",gap:12}}>
      <div style={{fontSize:40}}>🌺</div>
      <div style={{color:"#D63864",fontWeight:700,fontSize:16}}>Loading…</div>
    </div>
  );

  const { lang, mode, actualPeriods, fahLogs, intimateLogs, messages, notifications } = state;
  const t = T[lang] || T.en;
  const activeUser = myRole;

  const { avgLength, avgPeriod } = computeAdaptiveCycle(actualPeriods);
  const allCycles = buildAllCycles(actualPeriods, avgLength, avgPeriod);
  const nextPeriodDate = allCycles.find(c=>!c.actual&&c.start>todayStr())?.start;
  const daysLeft = nextPeriodDate ? diffDays(todayStr(), nextPeriodDate) : null;
  const { status:todayStatus, cd:todayCd } = getCycleStatus(todayStr(), allCycles, avgLength, avgPeriod);
  const todaySc = SC[todayStatus]||{};
  const todayProb = calcPregnancyProb(todayStr(), allCycles, avgLength, avgPeriod, intimateLogs);
  const phaseRc = RC[PHASE_LABEL_MAP[todayStatus]||"safe"]||RC.safe;
  const phaseVal = PHASE_PROB_MAP[todayStatus]||"~2%";
  const sl = statusLabel(todayStatus, t);

  // Unread notifications for me
  const myUnread = (notifications||[]).filter(n=>n.for===activeUser&&!n.read);
  // Which tabs have unread
  const notifByTab = {
    messages: myUnread.filter(n=>["msg","ai"].includes(n.type)).length,
    intimate: myUnread.filter(n=>n.type==="intimate").length,
    calendar: myUnread.filter(n=>["periodStart","periodEnd","editCycles"].includes(n.type)).length,
  };
  const totalUnread = myUnread.length;

  const setLang = l => save({lang:l});
  const setMode = m => save({mode:m});

  const saveLog = logData => { save({fahLogs:{...(fahLogs||{}),[selDay]:logData}}); setShowLog(false); };

  const togglePeriodStart = () => {
    const d = selDay;
    const already = (actualPeriods||[]).find(p=>p.start===d);
    let newP;
    if (already) {
      newP = (actualPeriods||[]).filter(p=>p.start!==d);
    } else {
      newP = [...(actualPeriods||[]), {start:d,end:null,actual:true}].sort((a,b)=>a.start>b.start?1:-1);
    }
    save({actualPeriods:newP}, "periodStart", d);
  };

  const togglePeriodEnd = () => {
    const d = selDay;
    const alreadyEnd = (actualPeriods||[]).find(p=>p.end===d);
    let newP;
    if (alreadyEnd) {
      newP = (actualPeriods||[]).map(p=>p.end===d?{...p,end:null}:p);
    } else {
      newP = (actualPeriods||[]).map(x=>x.start<=d&&!x.end?{...x,end:d}:x);
    }
    save({actualPeriods:newP}, "periodEnd", d);
  };

  const saveIntimate = (rec, isEdit) => {
    let updated;
    if (isEdit) {
      updated = (intimateLogs||[]).map(x => x.id===rec.id ? rec : x).sort((a,b)=>a.date>b.date?-1:1);
    } else {
      updated = [...(intimateLogs||[]), rec].sort((a,b)=>a.date>b.date?-1:1);
    }
    save({intimateLogs:updated}, "intimate", rec.date);
    setShowIntimate(false);
    setEditIntimateRecord(null);
  };

  const deleteIntimate = (id) => {
    const updated = (intimateLogs||[]).filter(x => x.id !== id);
    save({intimateLogs:updated});
  };

  const sendMsg = () => {
    if (!newMsg.trim()) return;
    const newMsgObj = {from:activeUser,text:newMsg.trim(),date:todayStr(),isAI:false,id:`msg_${Date.now()}`};
    save({messages:[...(messages||[]),newMsgObj]}, "msg");
    setNewMsg("");
  };

  const generateAI = () => {
    const{fahMsg,leiMsg}=getDailyMessages(todayStatus||"safe",daysLeft,lang);
    save({messages:[...(messages||[]),
      {from:"lei",text:fahMsg,date:todayStr(),isAI:true,forUser:"fah",id:`ai_${Date.now()}`},
      {from:"system",text:leiMsg,date:todayStr(),isAI:true,forUser:"lei",id:`ai2_${Date.now()}`},
    ]}, "ai");
  };

  const markAllRead = () => {
    const updated = (notifications||[]).map(n=>n.for===activeUser?{...n,read:true}:n);
    save({notifications:updated});
    setShowNotifs(false);
  };

  // Mark tab notifications as read when entering tab
  const handleTabChange = (newTab) => {
    setTab(newTab);
    const types = { messages:["msg","ai"], intimate:["intimate"], calendar:["periodStart","periodEnd","editCycles"] }[newTab]||[];
    if (types.length > 0) {
      const updated = (notifications||[]).map(n=>n.for===activeUser&&types.includes(n.type)?{...n,read:true}:n);
      save({notifications:updated});
    }
  };

  const monthLabel=(y,m)=>{
    const en=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],zh=["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],th=["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
    return `${y} ${{en,zh,th}[lang][m]}`;
  };
  const visibleMessages=(messages||[]).filter(m=>!m.isAI||m.forUser===activeUser||!m.forUser);

  const TABS=[
    {id:"calendar",icon:"📅",label:t.calendar},
    {id:"stats",icon:"📊",label:t.stats},
    {id:"intimate",icon:"♥",label:t.intimate},
    {id:"messages",icon:"💌",label:t.messages},
  ];

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(150deg,#FFF4F7 0%,#F0F4FF 60%,#F4FFF9 100%)",fontFamily:"'PingFang SC','Hiragino Sans GB','Noto Sans Thai',sans-serif",maxWidth:480,margin:"0 auto",paddingBottom:88}}>

      {/* HEADER */}
      <div style={{background:"linear-gradient(135deg,#B52050 0%,#D63864 45%,#F07090 100%)",padding:"env(safe-area-inset-top,16px) 16px 26px",borderRadius:"0 0 34px 34px",boxShadow:"0 8px 36px #D6386444"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div>
            <div style={{color:"#fff8",fontSize:9,letterSpacing:1.5,textTransform:"uppercase"}}>{activeUser==="lei"?"🫶 Lei":"🌺 Fah"} · Private</div>
            <div style={{color:"#fff",fontWeight:900,fontSize:20}}>{t.appName} <span style={{fontWeight:300,fontSize:13}}>{t.tagline}</span></div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              {/* Notification bell */}
              <button onClick={()=>setShowNotifs(true)} style={{position:"relative",background:"#ffffff22",border:"none",borderRadius:10,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16}}>
                🔔
                {totalUnread>0&&<span style={{position:"absolute",top:-2,right:-2,background:"#FF3B30",color:"#fff",borderRadius:10,fontSize:9,fontWeight:700,minWidth:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px"}}>{totalUnread}</span>}
              </button>
              <div style={{display:"flex",gap:3,background:"#ffffff1A",borderRadius:12,padding:3}}>
                {["zh","en","th"].map(l=><LangPill key={l} lang={l} cur={lang} set={setLang}/>)}
              </div>
            </div>
            <div style={{fontSize:9,color:"#ffffff88"}}>{syncing?t.syncing:t.synced}</div>
          </div>
        </div>

        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:12,color:"#fffc"}}>{activeUser==="lei"?"🫶 Lei":"🌺 Fah"}</div>
          <div style={{marginLeft:"auto",display:"flex",gap:3,background:"#ffffff1A",borderRadius:12,padding:3}}>
            {["avoid","conceive"].map(m=>(
              <button key={m} onClick={()=>setMode(m)} style={{padding:"3px 10px",borderRadius:9,border:"none",background:mode===m?"#fff":"transparent",color:mode===m?"#D63864":"#ffffff88",fontWeight:mode===m?700:400,fontSize:11,cursor:"pointer"}}>{m==="conceive"?t.modeConceive:t.modeAvoid}</button>
            ))}
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          <div style={{background:"#ffffff22",borderRadius:14,padding:"10px 10px"}}>
            <div style={{color:"#fffc",fontSize:9,marginBottom:3,letterSpacing:0.3}}>{t.nextPeriod}</div>
            <div style={{color:"#fff",fontWeight:700,fontSize:13}}>{daysLeft===0?t.today:daysLeft===1?t.tomorrow:daysLeft?`${daysLeft} ${t.daysLater}`:"–"}</div>
          </div>
          <div style={{background:todaySc.bg?`${todaySc.bg}dd`:"#ffffff22",borderRadius:14,padding:"10px 10px"}}>
            <div style={{color:todaySc.fg||"#fffc",fontSize:9,marginBottom:2,letterSpacing:0.3}}>{t.cycleDay}</div>
            <div style={{color:todaySc.fg||"#fff",fontWeight:700,fontSize:12}}>{todayCd?`Day ${todayCd}`:"–"}</div>
            {sl&&<div style={{color:todaySc.fg||"#fff",fontSize:9,opacity:0.8}}>{sl}</div>}
          </div>
          <div style={{background:`${phaseRc.bg}dd`,borderRadius:14,padding:"8px 10px"}}>
            <div style={{color:phaseRc.fg,fontSize:9,marginBottom:2,letterSpacing:0.3}}>{t.pregnancyChance}</div>
            <div style={{color:phaseRc.fg,fontWeight:700,fontSize:13}}>{phaseVal}</div>
            {todayProb.prob>0&&<div style={{color:RC[todayProb.label]?.fg||phaseRc.fg,fontSize:9,marginTop:1,fontWeight:600}}>~{todayProb.prob}%</div>}
          </div>
        </div>
      </div>

      {/* TABS with red dots */}
      <div style={{display:"flex",background:"#fff",margin:"12px 12px 0",borderRadius:16,padding:4,boxShadow:"0 2px 12px #0001"}}>
        {TABS.map(({id,icon,label})=>{
          const dot = notifByTab[id]||0;
          return (
            <button key={id} onClick={()=>handleTabChange(id)} style={{flex:1,border:"none",borderRadius:12,padding:"8px 0",background:tab===id?"#D63864":"transparent",color:tab===id?"#fff":"#aaa",fontWeight:tab===id?700:400,fontSize:10,cursor:"pointer",transition:"all 0.2s",lineHeight:1.6,position:"relative"}}>
              {icon}
              {dot>0&&<span style={{position:"absolute",top:4,right:"calc(50% - 12px)",background:"#FF3B30",color:"#fff",borderRadius:10,fontSize:8,fontWeight:700,minWidth:14,height:14,display:"inline-flex",alignItems:"center",justifyContent:"center",padding:"0 2px"}}>{dot}</span>}
              <br/>{label}
            </button>
          );
        })}
      </div>

      <div style={{padding:"12px 12px 0"}}>

        {/* CALENDAR */}
        {tab==="calendar"&&(
          <div>
            {/* Legend — 2 rows, cleaner */}
            <div style={{background:"#fff",borderRadius:14,padding:"10px 12px",marginBottom:10,boxShadow:"0 1px 8px #0001"}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 12px"}}>
                {[
                  {bg:SC.period.bg,fg:SC.period.fg,label:t.periodDay,prob:"~1%"},
                  {bg:SC.ovulation.bg,fg:SC.ovulation.fg,label:t.ovulationDay,prob:"~30%"},
                  {bg:SC.fertHigh.bg,fg:SC.fertHigh.fg,label:lang==="zh"?"易孕高峰":lang==="th"?"สูงสุด":"Peak Fertile",prob:"~25%"},
                  {bg:SC.fertMid.bg,fg:SC.fertMid.fg,label:t.fertileDay,prob:"~10%"},
                  {bg:SC.postOv.bg,fg:SC.postOv.fg,label:t.postOvDay,prob:"~8%"},
                  {bg:SC.predicted.bg,fg:SC.predicted.fg,label:t.predictedPeriod,prob:""},
                ].map(p=>(
                  <div key={p.label} style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:10,height:10,borderRadius:3,background:p.bg,border:`1.5px solid ${p.fg}44`,flexShrink:0}}/>
                    <span style={{fontSize:11,color:"#555",fontWeight:500}}>{p.label}</span>
                    {p.prob&&<span style={{fontSize:10,color:p.fg,fontWeight:700,marginLeft:"auto"}}>{p.prob}</span>}
                  </div>
                ))}
              </div>
              <div style={{marginTop:8,paddingTop:6,borderTop:"1px solid #f0f0f0",display:"flex",gap:12}}>
                <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#F585A5"}}>♥</span><span style={{fontSize:10,color:"#aaa"}}>{lang==="zh"?"亲密记录":lang==="th"?"ความใกล้ชิด":"Intimate"}</span></div>
                <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"#bbb"}}>●</span><span style={{fontSize:10,color:"#aaa"}}>{lang==="zh"?"日记":lang==="th"?"บันทึก":"Diary"}</span></div>
              </div>
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
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:11,fontWeight:700,color:"#555"}}>📐 Adaptive Cycle</div>
                <button onClick={()=>setShowEditCycles(true)} style={{background:"#FDE8EE",color:"#D63864",border:"none",borderRadius:10,padding:"4px 12px",fontSize:11,fontWeight:600,cursor:"pointer"}}>✏️ {t.editCycles}</button>
              </div>
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

        {/* STATS */}
        {tab==="stats"&&(
          <div>
            <div style={{background:"#fff",borderRadius:20,padding:16,boxShadow:"0 2px 12px #0001",marginBottom:12}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:12}}>📊 {lang==="zh"?"怀孕概率记录":lang==="th"?"บันทึกโอกาสตั้งครรภ์":"Pregnancy Probability Log"}</div>
              {(intimateLogs||[]).slice(0,10).map((rec,i)=>{
                const p=calcPregnancyProb(rec.date,allCycles,avgLength,avgPeriod,intimateLogs);
                const rc=RC[p.label]||RC.safe;
                const{status:rs}=getCycleStatus(rec.date,allCycles,avgLength,avgPeriod);
                const rsc=SC[rs]||{};
                const rsl=statusLabel(rs,t);
                return (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #f5f5f5"}}>
                    <div style={{width:36,height:36,borderRadius:10,background:"#FDE8EE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{CONTRA_ICONS[rec.contraIndex]||"♥"}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600}}>{rec.date} {rec.time} <span style={{fontSize:10,color:"#bbb"}}>#{rec.nth}</span></div>
                      <div style={{fontSize:10,color:"#aaa"}}>{t.contraOptions[rec.contraIndex]}</div>
                      {rec.note&&<div style={{fontSize:10,color:"#888"}}>{rec.note}</div>}
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:3,alignItems:"flex-end"}}>
                      {rsl&&<Badge label={rsl} bg={rsc.bg||"#f5f5f5"} fg={rsc.fg||"#aaa"}/>}
                      {p.prob>0&&<Badge label={`~${p.prob}%`} bg={rc.bg} fg={rc.fg}/>}
                    </div>
                  </div>
                );
              })}
              {!(intimateLogs||[]).length&&<div style={{color:"#ddd",fontSize:13,textAlign:"center",padding:"20px 0"}}>{lang==="zh"?"暂无记录":lang==="th"?"ยังไม่มีบันทึก":"No logs yet"}</div>}
            </div>
            <div style={{background:"#fff",borderRadius:20,padding:16,boxShadow:"0 2px 12px #0001"}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>😊 {lang==="zh"?"Fah 的近期记录":lang==="th"?"บันทึกล่าสุดของ Fah":"Fah's Recent Logs"}</div>
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

        {/* INTIMATE */}
        {tab==="intimate"&&(
          <div>
            <button onClick={()=>setShowIntimate(true)} style={{width:"100%",background:"linear-gradient(135deg,#F585A5,#D63864)",color:"#fff",border:"none",borderRadius:16,padding:"13px 0",fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:12,boxShadow:"0 4px 18px #D6386444"}}>♥ {t.addIntimate}</button>
            <div style={{background:todaySc.bg||"#f8f8f8",border:`1.5px solid ${todaySc.fg||"#eee"}33`,borderRadius:16,padding:"12px 14px",marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:todaySc.fg||"#aaa",marginBottom:2}}>{mode==="conceive"?"🌱":"🛡️"} {lang==="zh"?"今天":lang==="th"?"วันนี้":"Today"} · {sl||"–"} · {phaseVal}</div>
              <div style={{fontSize:11,color:"#999"}}>
                {mode==="conceive"
                  ?(["ovulation","pred-ovulation"].includes(todayStatus)?(lang==="zh"?"✨ 最佳时机！排卵高峰 ~30%":lang==="th"?"✨ วันที่ดีที่สุด! ~30%":"✨ Best day! Peak fertility ~30%"):["fertHigh","pred-fertHigh"].includes(todayStatus)?(lang==="zh"?"🌿 高易孕期 ~25%":lang==="th"?"🌿 เจริญพันธุ์สูง ~25%":"🌿 High fertile ~25%"):["fertMid","pred-fertMid"].includes(todayStatus)?(lang==="zh"?"🌱 易孕期 ~10%":lang==="th"?"🌱 วันเจริญพันธุ์ ~10%":"🌱 Fertile window ~10%"):["postOv","pred-postOv"].includes(todayStatus)?(lang==="zh"?"⏳ 排卵后 ~8%":lang==="th"?"⏳ หลังตกไข่ ~8%":"⏳ Post-ovulation ~8%"):todayStatus==="period"?(lang==="zh"?"🌸 经期中 概率很低":lang==="th"?"🌸 ช่วงประจำเดือน":"🌸 Period time — very low"):(lang==="zh"?"💤 低生育期 ~2%":lang==="th"?"💤 ความสามารถต่ำ ~2%":"💤 Lower fertility ~2%"))
                  :(["ovulation","pred-ovulation"].includes(todayStatus)?(lang==="zh"?"⚠️ 最高风险 务必避孕 ~30%":lang==="th"?"⚠️ เสี่ยงสูงสุด ต้องคุมกำเนิด ~30%":"⚠️ Peak risk — always protect ~30%"):["fertHigh","pred-fertHigh"].includes(todayStatus)?(lang==="zh"?"⚡ 高风险 请避孕 ~25%":lang==="th"?"⚡ เสี่ยงสูง ~25%":"⚡ High risk — use protection ~25%"):["fertMid","pred-fertMid"].includes(todayStatus)?(lang==="zh"?"⚡ 中等风险 ~10%":lang==="th"?"⚡ เสี่ยงปานกลาง ~10%":"⚡ Elevated risk ~10%"):["postOv","pred-postOv"].includes(todayStatus)?(lang==="zh"?"🛡️ 中等风险 ~8%":lang==="th"?"🛡️ เสี่ยงปานกลาง ~8%":"🛡️ Moderate risk ~8%"):todayStatus==="period"?(lang==="zh"?"✅ 较低风险 仍需避孕":lang==="th"?"✅ เสี่ยงต่ำ แต่ยังต้องคุมกำเนิด":"✅ Lower risk, still protect"):(lang==="zh"?"✅ 低风险期 ~2%":lang==="th"?"✅ เสี่ยงต่ำ ~2%":"✅ Lower risk ~2%"))}
              </div>
            </div>
            <div style={{background:"#fff",borderRadius:20,padding:16,boxShadow:"0 2px 12px #0001"}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>♥ {lang==="zh"?"历史记录":lang==="th"?"ประวัติ":"History"}</div>
              {!(intimateLogs||[]).length&&<div style={{color:"#ddd",fontSize:13,textAlign:"center",padding:"20px 0"}}>{lang==="zh"?"暂无记录":lang==="th"?"ยังไม่มีบันทึก":"No records yet"}</div>}
              {(intimateLogs||[]).map((rec,i)=>{
                const p=calcPregnancyProb(rec.date,allCycles,avgLength,avgPeriod,intimateLogs);
                const rc=RC[p.label]||RC.safe;
                const{status:rs}=getCycleStatus(rec.date,allCycles,avgLength,avgPeriod);
                const rsc=SC[rs]||{};
                const rsl=statusLabel(rs,t);
                return (
                  <div key={rec.id||i} style={{padding:"10px 0",borderBottom:"1px solid #f9f9f9"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:34,height:34,borderRadius:10,background:"#FDE8EE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{CONTRA_ICONS[rec.contraIndex]||"♥"}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:600}}>{rec.date} <span style={{color:"#bbb",fontWeight:400}}>{rec.time}</span> <span style={{fontSize:10,color:"#F585A5"}}>#{rec.nth}</span></div>
                        <div style={{fontSize:10,color:"#aaa"}}>{t.contraOptions[rec.contraIndex]}</div>
                        {rec.note&&<div style={{fontSize:10,color:"#888"}}>{rec.note}</div>}
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:3,alignItems:"flex-end"}}>
                        {rsl&&<Badge label={rsl} bg={rsc.bg||"#f5f5f5"} fg={rsc.fg||"#aaa"}/>}
                        {p.prob>0&&<Badge label={`~${p.prob}%`} bg={rc.bg} fg={rc.fg}/>}
                      </div>
                    </div>
                    {/* Edit / Delete buttons */}
                    <div style={{display:"flex",gap:8,marginTop:8}}>
                      <button onClick={()=>{setEditIntimateRecord(rec);setShowIntimate(true);}} style={{flex:1,background:"#F0F4FF",color:"#5B8AF0",border:"none",borderRadius:10,padding:"6px 0",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                        ✏️ {lang==="zh"?"编辑":lang==="th"?"แก้ไข":"Edit"}
                      </button>
                      <button onClick={()=>{if(window.confirm(lang==="zh"?"确定删除这条记录？":lang==="th"?"ยืนยันการลบ?":"Delete this record?")) deleteIntimate(rec.id);}} style={{flex:1,background:"#FDE8EE",color:"#D63864",border:"none",borderRadius:10,padding:"6px 0",fontSize:11,fontWeight:600,cursor:"pointer"}}>
                        🗑 {lang==="zh"?"删除":lang==="th"?"ลบ":"Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MESSAGES */}
        {tab==="messages"&&(
          <div>
            <div style={{background:"#fff",borderRadius:20,padding:14,boxShadow:"0 2px 12px #0001",marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontWeight:700,fontSize:13}}>🤖 {t.aiDaily}</div>
                <button onClick={generateAI} style={{background:"linear-gradient(135deg,#D63864,#F07090)",color:"#fff",border:"none",borderRadius:10,padding:"5px 12px",fontSize:11,fontWeight:600,cursor:"pointer"}}>{t.refreshAI}</button>
              </div>
              {(messages||[]).filter(m=>m.isAI&&m.forUser===activeUser).slice(-1).map((m,i)=>(
                <div key={i} style={{background:activeUser==="fah"?"#FFF5F8":"#F0F4FF",borderRadius:14,padding:"10px 12px",fontSize:13,color:"#444",lineHeight:1.7}}>
                  <div style={{fontSize:9,color:"#ccc",marginBottom:4}}>{activeUser==="fah"?"🫶 Lei":"🤖"} · {m.date}</div>
                  {m.text}
                </div>
              ))}
              {!(messages||[]).filter(m=>m.isAI&&m.forUser===activeUser).length&&<div style={{fontSize:12,color:"#ccc",textAlign:"center",padding:"8px 0"}}>{t.refreshAI}</div>}
            </div>
            <div style={{background:"#fff",borderRadius:20,padding:14,boxShadow:"0 2px 12px #0001"}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>💌 {t.messages}</div>
              <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:420,overflowY:"auto"}} ref={el=>{if(el)el.scrollTop=el.scrollHeight}}>
                {visibleMessages.filter(m=>!m.isAI).map((item,i)=>(
                  <MsgBubble key={item.id||i} item={item} myRole={activeUser} t={t} lang={lang}/>
                ))}
                <div ref={el=>el?.scrollIntoView?.({block:"end"})}/>
              </div>
              <div style={{display:"flex",gap:8,marginTop:12}}>
                <input value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg()}
                  placeholder={activeUser==="lei"?t.msgPlaceholderLei:t.msgPlaceholderFah}
                  style={{flex:1,border:"1.5px solid #eee",borderRadius:12,padding:"10px 13px",fontSize:13,outline:"none",fontFamily:"inherit"}}/>
                <button onClick={sendMsg} style={{background:"linear-gradient(135deg,#D63864,#F07090)",color:"#fff",border:"none",borderRadius:12,padding:"0 16px",fontSize:16,cursor:"pointer"}}>➤</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showLog&&<LogModal dateStr={selDay} log={(fahLogs||{})[selDay]} allCycles={allCycles} avgLength={avgLength} avgPeriod={avgPeriod} t={t} lang={lang} actualPeriods={actualPeriods||[]} intimateLogs={intimateLogs||[]} onSave={saveLog} onTogglePeriodStart={togglePeriodStart} onTogglePeriodEnd={togglePeriodEnd} onClose={()=>setShowLog(false)}/>}
      {showIntimate&&<IntimateModal allCycles={allCycles} avgLength={avgLength} avgPeriod={avgPeriod} intimateLogs={intimateLogs||[]} t={t} lang={lang} onSave={saveIntimate} editRecord={editIntimateRecord} onClose={()=>{setShowIntimate(false);setEditIntimateRecord(null);}}/>}
      {showEditCycles&&<EditCyclesModal actualPeriods={actualPeriods||[]} t={t} onSave={newP=>save({actualPeriods:newP},"editCycles")} onClose={()=>setShowEditCycles(false)}/>}
      {showNotifs&&<NotifPanel notifications={notifications||[]} myRole={activeUser} lang={lang} t={t} onMarkAllRead={markAllRead} onClose={()=>setShowNotifs(false)}/>}
    </div>
  );
}
