import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Activity, Music, Zap, Book, Crosshair, Star, ArrowUp, Info, History, Network, X, RefreshCw,
  User, Sliders, Clock, Shield, Wind, Flame, Compass, PenTool, Palette, Map as MapIcon, 
  MonitorSpeaker, Mic, HandMetal, Feather, MapPin, Crown, Brush, RadioTower, Headphones, Sparkles,
  Award, CheckCircle2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Skull,
  Heart, Swords, Eye, Footprints, ChevronsDown, Save, Briefcase, Key
} from 'lucide-react';

// ==========================================
// 1. 遊戲資料庫 (Database)
// ==========================================
const STATS_DEF = [
  { id: 'chord', name: 'Chord (和弦)', icon: <Book size={16} /> },
  { id: 'scale', name: 'Scale (音階)', icon: <Activity size={16} /> },
  { id: 'rhythm', name: 'Rhythm (節奏)', icon: <Music size={16} /> },
  { id: 'tone', name: 'Tone (音色)', icon: <Zap size={16} /> },
  { id: 'theory', name: 'Theory (理論)', icon: <Info size={16} /> },
  { id: 'speed', name: 'Speed (速度)', icon: <Crosshair size={16} /> },
];

const STAT_EFFECTS = {
  chord: '提升最大 HP (容錯率)',
  scale: '提升基礎攻擊力 (ATK)',
  rhythm: '提升爆擊機率 (>100%轉紅爆)',
  tone: '提升幸運 (LUK) 與掉寶率',
  theory: '提升防禦力 (DEF) 與爆傷',
  speed: '提升連擊機率 (>100%轉三連擊)'
};

const JOB_TREE = {
  tier1: [
    { id: 'A', name: '節奏建築師', line: 'A', special: 'Groove', specialName: 'Groove (律動)', desc: '戰士型。穩紮穩打、重裝坦克，收束傷害浮動與減傷。', reqs: { rhythm: 5, chord: 4, theory: 3, scale: 2, tone: 2, speed: 2 } },
    { id: 'B', name: '旋律獵人', line: 'B', special: 'Phrasing', specialName: 'Phrasing (樂句)', desc: '弓箭刺客型。單體爆發、致命速攻，附帶破甲與突破爆傷上限。', reqs: { scale: 5, speed: 4, theory: 3, chord: 2, rhythm: 2, tone: 2 } },
    { id: 'C', name: '和聲設計師', line: 'C', special: 'Arrangement', specialName: 'Arrangement (編曲)', desc: '法師型。群體範圍攻擊，觸發擴散傷害與微量吸血。', reqs: { chord: 5, theory: 4, scale: 3, rhythm: 2, tone: 2, speed: 2 } },
    { id: 'D', name: '音色鍊金師', line: 'D', special: 'Control', specialName: 'Control (控制)', desc: '機甲型。攻擊高機率暈眩控場，並按比例放大裝備數值。', reqs: { tone: 5, theory: 4, rhythm: 3, chord: 2, scale: 2, speed: 2 } }
  ],
  tier2: {
    'A': [
      { id: 'A1', name: '律動騎士', line: 'A', desc: '擅長切分、空刷、制音。', reqs: { rhythm: 8, chord: 6, theory: 5, scale: 3, tone: 3, speed: 3, special: 8 } },
      { id: 'A2', name: '音牆築師', line: 'A', desc: '力量型，厚、穩、狠、推進。', reqs: { rhythm: 8, chord: 6, theory: 5, scale: 3, tone: 3, speed: 3, special: 7 } },
      { id: 'A3', name: '木吉他遊俠', line: 'A', desc: '懂動態留白，伴奏有敘事感。', reqs: { rhythm: 8, chord: 6, theory: 5, scale: 3, tone: 3, speed: 3, special: 6 } }
    ],
    'B': [
      { id: 'B1', name: '藍調決鬥者', line: 'B', desc: '音不多但很重，像在講話。', reqs: { scale: 8, speed: 7, rhythm: 5, chord: 3, theory: 3, tone: 3, special: 8 } },
      { id: 'B2', name: '速彈突擊者', line: 'B', desc: '技術上限，快穩準清楚。', reqs: { scale: 8, speed: 7, rhythm: 5, chord: 3, theory: 3, tone: 3, special: 5 } },
      { id: 'B3', name: '融合領航員', line: 'B', desc: '跟和聲移動，調式切換。', reqs: { scale: 8, speed: 7, rhythm: 5, chord: 3, theory: 3, tone: 3, special: 7 } }
    ],
    'C': [
      { id: 'C1', name: '流行編曲師', line: 'C', desc: '服務歌曲，安排段落。', reqs: { chord: 8, theory: 7, tone: 5, scale: 3, rhythm: 3, speed: 3, special: 8 } },
      { id: 'C2', name: '新靈魂彩繪師', line: 'C', desc: '色彩、滑順、空氣感。', reqs: { chord: 8, theory: 7, tone: 5, scale: 3, rhythm: 3, speed: 3, special: 7 } },
      { id: 'C3', name: '爵士地圖師', line: 'C', desc: '分析力強，伴奏有邏輯。', reqs: { chord: 8, theory: 7, tone: 5, scale: 3, rhythm: 3, speed: 3, special: 6 } }
    ],
    'D': [
      { id: 'D1', name: '舞台鐵匠', line: 'D', desc: '現場實戰，音量匹配穩。', reqs: { tone: 8, theory: 6, chord: 5, scale: 3, rhythm: 3, speed: 3, special: 8 } },
      { id: 'D2', name: '錄音雕刻師', line: 'D', desc: '會分層疊錄，處理左右聲道。', reqs: { tone: 8, theory: 6, chord: 5, scale: 3, rhythm: 3, speed: 3, special: 7 } },
      { id: 'D3', name: '觸弦魔術師', line: 'D', desc: '重點在手，右手改變人格。', reqs: { tone: 8, theory: 6, chord: 5, scale: 3, rhythm: 3, speed: 3, special: 6 } }
    ]
  },
  tier3: {
    'A1': { line: 'A', name: '口袋律動領主', desc: '少量音符就能讓整團更彈更緊。', reqs: { rhythm: 10, chord: 8, theory: 7, scale: 5, tone: 5, speed: 5, special: 10 } },
    'A2': { line: 'A', name: 'Riff 戰將', desc: '會設計整首歌骨架，riff 撐住歌。', reqs: { rhythm: 10, chord: 8, theory: 7, scale: 5, tone: 5, speed: 5, special: 8 } },
    'A3': { line: 'A', name: '歌曲編織者', desc: '用一把琴講完整首歌故事的人。', reqs: { rhythm: 10, chord: 8, theory: 7, scale: 5, tone: 5, speed: 5, special: 7 } },
    'B1': { line: 'B', name: '靈魂折音者', desc: '每個音都像有情緒人格。', reqs: { scale: 10, speed: 9, rhythm: 7, chord: 5, theory: 5, tone: 5, special: 10 } },
    'B2': { line: 'B', name: '疾速收割者', desc: '把速度、準度、邏輯綁在一起。', reqs: { scale: 10, speed: 9, rhythm: 7, chord: 5, theory: 5, tone: 5, special: 7 } },
    'B3': { line: 'B', name: '和聲航行者', desc: '和聲探險家，能跨調性感安全落地。', reqs: { scale: 10, speed: 9, rhythm: 7, chord: 5, theory: 5, tone: 5, special: 9 } },
    'C1': { line: 'C', name: '熱門曲架構師', desc: '知道歌要怎麼長大，知道哪裡空與補。', reqs: { chord: 10, theory: 9, tone: 7, scale: 5, rhythm: 5, speed: 5, special: 10 } },
    'C2': { line: 'C', name: '和聲色彩先知', desc: '會把和弦變成畫面的頂尖高手。', reqs: { chord: 10, theory: 9, tone: 7, scale: 5, rhythm: 5, speed: 5, special: 8 } },
    'C3': { line: 'C', name: '和聲戰略家', desc: '高階和聲操盤手，替代張力解決自如。', reqs: { chord: 10, theory: 9, tone: 7, scale: 5, rhythm: 5, speed: 5, special: 9 } },
    'D1': { line: 'D', name: '競技場工程師', desc: '把現場萬人舞台混亂變穩定的人。', reqs: { tone: 10, theory: 8, chord: 7, scale: 5, rhythm: 5, speed: 5, special: 10 } },
    'D2': { line: 'D', name: '聲音雕塑師', desc: '把吉他做進立體作品裡的頂級製作人。', reqs: { tone: 10, theory: 8, chord: 7, scale: 5, rhythm: 5, speed: 5, special: 9 } },
    'D3': { line: 'D', name: '指紋音色家', desc: '真正的招牌音色，人琴合一。', reqs: { tone: 10, theory: 8, chord: 7, scale: 5, rhythm: 5, speed: 5, special: 9 } }
  }
};

const THEME_COLORS = {
  'default': { base: '#94a3b8', accent: '#475569', glow: 'rgba(148,163,184,0.3)', bg: 'bg-slate-900/20', text: 'text-slate-400', border: 'border-slate-500/50' },
  'A': { base: '#10b981', accent: '#047857', glow: 'rgba(16,185,129,0.4)', bg: 'bg-emerald-900/20', text: 'text-emerald-400', border: 'border-emerald-500/50', name: 'A線：節奏 (戰士)' },
  'B': { base: '#3b82f6', accent: '#1d4ed8', glow: 'rgba(59,130,246,0.4)', bg: 'bg-blue-900/20', text: 'text-blue-400', border: 'border-blue-500/50', name: 'B線：旋律 (刺客)' },
  'C': { base: '#a855f7', accent: '#7e22ce', glow: 'rgba(168,85,247,0.4)', bg: 'bg-purple-900/20', text: 'text-purple-400', border: 'border-purple-500/50', name: 'C線：和聲 (法師)' },
  'D': { base: '#f59e0b', accent: '#b45309', glow: 'rgba(245,158,11,0.4)', bg: 'bg-amber-900/20', text: 'text-amber-400', border: 'border-amber-500/50', name: 'D線：音色 (機甲)' },
};

const BASE_MONSTERS = [
  { id: 'slime', name: '走音史萊姆', baseHp: 15, baseAtk: 2, baseDef: 1, exp: 5, color: 'text-emerald-400', icon: <Wind size={20} /> },
  { id: 'bat', name: '雜訊蝙蝠', baseHp: 20, baseAtk: 4, baseDef: 1, exp: 10, color: 'text-slate-400', icon: <Activity size={20} /> },
  { id: 'goblin', name: '掉拍哥布林', baseHp: 25, baseAtk: 5, baseDef: 3, exp: 12, color: 'text-amber-400', icon: <Clock size={20} /> },
  { id: 'spider', name: '斷弦蜘蛛', baseHp: 35, baseAtk: 12, baseDef: 6, exp: 18, color: 'text-indigo-400', icon: <Network size={20} /> },
  { id: 'dog', name: '破音惡犬', baseHp: 45, baseAtk: 9, baseDef: 5, exp: 25, color: 'text-red-400', icon: <Flame size={20} /> },
  { id: 'ghost', name: '忘譜幽靈', baseHp: 60, baseAtk: 8, baseDef: 8, exp: 30, color: 'text-blue-200', icon: <Eye size={20} /> },
  { id: 'skeleton', name: '死金骷髏', baseHp: 80, baseAtk: 15, baseDef: 10, exp: 50, color: 'text-purple-400', icon: <Skull size={20} /> },
  { id: 'golem', name: '節拍器魔像', baseHp: 120, baseAtk: 20, baseDef: 25, exp: 80, color: 'text-stone-400', icon: <Shield size={20} /> },
];

const BOSS_MONSTERS = {
  10: { id: 'boss1', name: '頻率裁決者', baseHp: 500, baseAtk: 45, baseDef: 30, exp: 300, color: 'text-red-500', icon: <Crown size={40} /> },
  20: { id: 'boss2', name: 'BPM 暴走機甲', baseHp: 420, baseAtk: 35, baseDef: 30, exp: 320, color: 'text-orange-500', icon: <RadioTower size={40} /> },
  30: { id: 'boss3', name: '深淵音牆巨獸', baseHp: 650, baseAtk: 45, baseDef: 40, exp: 350, color: 'text-purple-600', icon: <MonitorSpeaker size={40} /> }
};

const EQUIP_DB = [
  { id: 1, type: 'W', rarity: 1, name: "Squier Sonic Strat", desc: "新手最容易取得的入門琴。", stats: { combo: 2, atk: 1 } },
  { id: 2, type: 'W', rarity: 2, name: "Fender Player Tele", desc: "實惠且標準的工作馬。", stats: { combo: 5, atk: 3 } },
  { id: 3, type: 'W', rarity: 3, name: "Fender Am. Pro II", desc: "職業樂手的標準配備。", stats: { combo: 10, atk: 8 } },
  { id: 4, type: 'W', rarity: 4, name: "Custom Shop '60s Relic", desc: "帶有精緻仿舊工藝的手工琴。", stats: { combo: 18, atk: 15 } },
  { id: 5, type: 'W', rarity: 5, name: "1954 Original Stratocaster", desc: "出廠元年的歷史古董，天價神武。", stats: { combo: 30, atk: 30 } },
  { id: 6, type: 'W', rarity: 1, name: "Epiphone LP Special", desc: "平價桃花心木入門型號。", stats: { hp: 10, critMult: 5 } },
  { id: 7, type: 'W', rarity: 2, name: "Epiphone LP Standard", desc: "還原經典外型與厚實音色。", stats: { hp: 25, critMult: 15 } },
  { id: 8, type: 'W', rarity: 3, name: "Gibson Les Paul Standard", desc: "真正的搖滾樂標準象徵。", stats: { hp: 60, critMult: 30 } },
  { id: 9, type: 'W', rarity: 4, name: "Gibson Custom 1959 R9", desc: "復刻完美的59年手感。", stats: { hp: 120, critMult: 50 } },
  { id: 10, type: 'W', rarity: 5, name: "1959 Original Les Paul", desc: "被譽為吉他界「聖杯」的原廠真品。", stats: { hp: 250, critMult: 100 } },
  { id: 11, type: 'W', rarity: 1, name: "Ibanez GIO GRX70QA", desc: "速彈入門款。", stats: { combo: 3, crit: 2 } },
  { id: 12, type: 'W', rarity: 2, name: "Jackson JS Dinky", desc: "極薄琴頸，適合金屬樂。", stats: { combo: 6, crit: 5 } },
  { id: 13, type: 'W', rarity: 3, name: "Ibanez RG550 Genesis", desc: "日廠復刻經典，速彈標配。", stats: { combo: 12, crit: 10 } },
  { id: 14, type: 'W', rarity: 4, name: "Ibanez J.Custom RG8520", desc: "日本旗艦手工產線。", stats: { combo: 20, crit: 18 } },
  { id: 15, type: 'W', rarity: 5, name: "JEM777 Steve Vai", desc: "大師早期初版簽名神琴。", stats: { combo: 35, crit: 30 } },
  { id: 16, type: 'W', rarity: 1, name: "Yamaha Pacifica 112V", desc: "全能性極佳的入門神琴。", stats: { atk: 1, hp: 5, sp: 1 } },
  { id: 17, type: 'W', rarity: 2, name: "PRS SE Custom 24", desc: "高階血統的平價版。", stats: { atk: 3, hp: 15, sp: 2 } },
  { id: 18, type: 'W', rarity: 3, name: "Tom Anderson Drop Top", desc: "頂級精品代名詞。", stats: { atk: 6, hp: 30, sp: 4 } },
  { id: 19, type: 'W', rarity: 4, name: "Suhr Modern Custom", desc: "客製化現代吉他頂點。", stats: { atk: 12, hp: 60, sp: 7 } },
  { id: 20, type: 'W', rarity: 5, name: "PRS Private Stock", desc: "大師級製琴師手工雕琢的藝術品。", stats: { atk: 25, hp: 120, sp: 15 } },
  { id: 21, type: 'P1', rarity: 1, name: "Behringer TO800", desc: "幾百塊的塑膠 TS 拷貝。", stats: { atk: 2 } },
  { id: 22, type: 'P1', rarity: 2, name: "NUX Horseman", desc: "平價人馬座替代品。", stats: { atk: 5 } },
  { id: 23, type: 'P1', rarity: 3, name: "Ibanez TS9", desc: "經典中頻/藍調破音。", stats: { atk: 12 } },
  { id: 24, type: 'P1', rarity: 4, name: "Analogman King of Tone", desc: "排隊數年的手工精品破音。", stats: { atk: 25 } },
  { id: 25, type: 'P1', rarity: 5, name: "Original Klon Centaur", desc: "天價的破音之王原版金人馬。", stats: { atk: 50 } },
  { id: 26, type: 'P2', rarity: 1, name: "Joyo Splinter", desc: "平價老鼠拷貝版。", stats: { critMult: 10 } },
  { id: 27, type: 'P2', rarity: 2, name: "BOSS DS-1", desc: "銷量最高的橘色踏板。", stats: { critMult: 25 } },
  { id: 28, type: 'P2', rarity: 3, name: "ProCo RAT 2", desc: "搖滾史經典失真標配。", stats: { critMult: 50 } },
  { id: 29, type: 'P2', rarity: 4, name: "JHS Muffuletta", desc: "濃縮多種經典 Fuzz 的精品。", stats: { critMult: 90 } },
  { id: 30, type: 'P2', rarity: 5, name: "1973 Ram's Head Big Muff", desc: "Pink Floyd 傳奇古董 Fuzz。", stats: { critMult: 180 } },
  { id: 31, type: 'P3', rarity: 1, name: "Fender Frontman 10G", desc: "買琴附贈的十瓦小音箱。", stats: { def: 2, hp: 10 } },
  { id: 32, type: 'P3', rarity: 2, name: "VOX Pathfinder 10", desc: "帶有英式外觀的練習箱。", stats: { def: 5, hp: 25 } },
  { id: 33, type: 'P3', rarity: 3, name: "Marshall DSL40", desc: "練團室常見的真空管實戰標配。", stats: { def: 12, hp: 60 } },
  { id: 34, type: 'P3', rarity: 4, name: "Neural DSP Quad Cortex", desc: "捕捉頂級音箱的運算大腦。", stats: { def: 25, hp: 150 } },
  { id: 35, type: 'P3', rarity: 5, name: "Dumble Overdrive Special", desc: "數百萬台幣的傳說級神機。", stats: { def: 50, hp: 400 } },
  { id: 36, type: 'P4', rarity: 1, name: "Mooer Ensemble King", desc: "微型和聲效果器。", stats: { combo: 2 } },
  { id: 37, type: 'P4', rarity: 2, name: "NUX Mod Core", desc: "多功能調變踏板。", stats: { combo: 5 } },
  { id: 38, type: 'P4', rarity: 3, name: "MXR Phase 90", desc: "不敗的相位標準音色。", stats: { combo: 10 } },
  { id: 39, type: 'P4', rarity: 4, name: "Strymon Mobius", desc: "錄音室等級調變工作站。", stats: { combo: 18 } },
  { id: 40, type: 'P4', rarity: 5, name: "Original BOSS CE-1", desc: "1970年代第一台和聲，復古神器。", stats: { combo: 30 } },
  { id: 41, type: 'P5', rarity: 1, name: "Behringer VD400", desc: "便宜的塑膠殼類比延遲。", stats: { crit: 2 } },
  { id: 42, type: 'P5', rarity: 2, name: "NUX Tape Core", desc: "平價磁帶延遲音色。", stats: { crit: 5 } },
  { id: 43, type: 'P5', rarity: 3, name: "MXR Carbon Copy", desc: "溫暖類比延遲代表。", stats: { crit: 10 } },
  { id: 44, type: 'P5', rarity: 4, name: "Strymon Timeline", desc: "高階玩家必備超級運算中心。", stats: { crit: 18 } },
  { id: 45, type: 'P5', rarity: 5, name: "Roland RE-201 Space Echo", desc: "老式磁帶機頂峰，體積龐大。", stats: { crit: 30 } },
  { id: 46, type: 'P6', rarity: 1, name: "TC Skysurfer", desc: "簡單直觀的平價殘響。", stats: { def: 1, hp: 5 } },
  { id: 47, type: 'P6', rarity: 2, name: "BOSS RV-6", desc: "堅固耐用的進階標配。", stats: { def: 3, hp: 15 } },
  { id: 48, type: 'P6', rarity: 3, name: "EHX Oceans 11", desc: "多種殘響模式的中高階選擇。", stats: { def: 6, hp: 30 } },
  { id: 49, type: 'P6', rarity: 4, name: "Strymon BigSky", desc: "統治後搖滾界的頂級殘響霸主。", stats: { def: 15, hp: 80 } },
  { id: 50, type: 'P6', rarity: 5, name: "Fender '63 Reverb Tank", desc: "衝浪搖滾時代的古董彈簧殘響箱。", stats: { def: 30, hp: 200 } }
];

const RARITY_COLORS = { 1: 'text-slate-300', 2: 'text-emerald-400', 3: 'text-blue-400', 4: 'text-purple-400', 5: 'text-orange-400' };
const RARITY_BG = { 1: 'bg-slate-800', 2: 'bg-emerald-900/30', 3: 'bg-blue-900/30', 4: 'bg-purple-900/30', 5: 'bg-orange-900/30' };

// ==========================================
// 2. 輔助與演算法 (包含姓名編碼)
// ==========================================
const MAP_W = 15, MAP_H = 15;
const TILE_WALL = 0, TILE_FLOOR = 1, TILE_STAIRS = 2;

// 將姓名編碼為 16 進位字串 (防呆相容 UTF-8)
const encodeName = (name) => {
  return Array.from(new TextEncoder().encode(name))
    .map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
};

const decodeName = (hexStr) => {
  try {
    const bytes = new Uint8Array(hexStr.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    return new TextDecoder().decode(bytes);
  } catch (e) {
    return "無名吉他手";
  }
};

const encodeInventory = (invArray) => {
  let binStr = "";
  for(let i=1; i<=50; i++) binStr += invArray.includes(i) ? "1" : "0";
  binStr = binStr.padEnd(52, "0"); 
  let hex = "";
  for(let i=0; i<52; i+=4) hex += parseInt(binStr.substr(i, 4), 2).toString(16).toUpperCase();
  return "I" + hex;
};

const decodeInventory = (hexStr) => {
  if(!hexStr || !hexStr.startsWith('I')) return [];
  const hex = hexStr.substring(1);
  let binStr = "";
  for(let i=0; i<hex.length; i++) {
    const parsed = parseInt(hex[i], 16);
    binStr += isNaN(parsed) ? "0000" : parsed.toString(2).padStart(4, "0");
  }
  const inv = [];
  for(let i=0; i<50; i++) { if(binStr[i] === "1") inv.push(i+1); }
  return inv;
};

const generateChecksum = (str) => {
  let sum = 0;
  for(let i=0; i<str.length; i++) sum += str.charCodeAt(i);
  return "X" + (sum % 100).toString().padStart(2, '0');
};

const PaperDoll = ({ tier, line, isMini = false }) => {
  const theme = THEME_COLORS[line || 'default'];
  return (
    <div className={`relative shrink-0 flex items-center justify-center bg-slate-900 rounded-full border-2 ${isMini ? 'w-full h-full shadow-md border-slate-700' : 'w-16 h-16 md:w-20 md:h-20 shadow-[0_0_15px_rgba(0,0,0,0.5)]'}`} style={{ borderColor: theme.base }}>
      {!isMini && tier >= 1 && <div className="absolute inset-0 rounded-full blur-md opacity-50 animate-pulse" style={{ backgroundColor: theme.glow }} />}
      {!isMini && tier >= 2 && <div className="absolute inset-[-4px] rounded-full border border-dashed opacity-60" style={{ borderColor: theme.base, animation: 'spin 4s linear infinite' }} />}
      {!isMini && tier >= 3 && <div className="absolute inset-[-8px] rounded-full border-[2px] border-dotted opacity-80" style={{ borderColor: theme.base, animation: 'spin 3s linear infinite reverse' }} />}
      <svg viewBox="0 0 100 100" className={`relative z-10 w-[85%] h-[85%] drop-shadow-md ${!isMini && tier === 3 ? 'animate-bounce' : ''}`}>
        <path d="M 30 95 C 30 55, 70 55, 70 95" fill={theme.base} stroke={theme.accent} strokeWidth="2.5" />
        <circle cx="50" cy="40" r="18" fill="#fde68a" stroke={theme.accent} strokeWidth="2.5" />
        <circle cx="43" cy="38" r="2.5" fill="#1e293b"/><circle cx="57" cy="38" r="2.5" fill="#1e293b"/>
        {tier >= 2 ? <path d="M 45 46 Q 50 49 55 46" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round"/> : <line x1="46" y1="46" x2="54" y2="46" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/>}
        <g transform="translate(15, 45) rotate(45 50 50)">
          {tier === 0 && <><path d="M 43 50 Q 43 38 50 28 Q 57 38 57 50 Q 62 62 50 72 Q 38 62 43 50" fill="#92400e" stroke="#78350f" strokeWidth="1.5" /><rect x="48.5" y="8" width="3" height="25" fill="#451a03" /><circle cx="50" cy="52" r="4.5" fill="#292524" /></>}
          {tier === 1 && <><path d="M 40 68 L 44 40 L 50 34 L 56 40 L 60 68 Z" fill={theme.base} stroke="#f8fafc" strokeWidth="1.5" /><rect x="48" y="8" width="4" height="28" fill="#1e293b" /></>}
          {tier >= 2 && <>{tier === 3 && <path d="M 35 72 L 44 34 L 50 28 L 56 34 L 65 72 Z" fill={theme.glow} className="animate-pulse" transform="scale(1.1) translate(-2, -2)" />}<path d="M 38 68 L 42 42 L 48 32 L 52 32 L 58 42 L 62 68 L 55 74 L 45 74 Z" fill={theme.base} stroke="#fcd34d" strokeWidth="2" /><rect x="48" y="4" width="4" height="32" fill="#0f172a" />{tier === 3 && <rect x="43" y="6" width="2" height="30" fill="#0f172a" />}</>}
        </g>
      </svg>
    </div>
  );
};

// ==========================================
// 虛擬搖桿元件 (Virtual Joystick)
// ==========================================
const VirtualJoystick = ({ onMove }) => {
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const touchRef = useRef({ startX: 0, startY: 0, lastMoveTime: 0, pointerId: null });

  const handlePointerDown = (e) => {
    e.target.setPointerCapture(e.pointerId);
    touchRef.current.startX = e.clientX;
    touchRef.current.startY = e.clientY;
    touchRef.current.pointerId = e.pointerId;
    setIsActive(true);
  };

  const handlePointerMove = (e) => {
    if (!isActive || e.pointerId !== touchRef.current.pointerId) return;
    const dx = e.clientX - touchRef.current.startX;
    const dy = e.clientY - touchRef.current.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = 35; 

    let kX = dx, kY = dy;
    if (dist > maxRadius) {
      kX = (dx / dist) * maxRadius;
      kY = (dy / dist) * maxRadius;
    }
    setKnobPos({ x: kX, y: kY });

    const now = Date.now();
    if (dist > 20 && now - touchRef.current.lastMoveTime > 200) {
      if (Math.abs(dx) > Math.abs(dy)) {
        onMove(dx > 0 ? 1 : -1, 0);
      } else {
        onMove(0, dy > 0 ? 1 : -1);
      }
      touchRef.current.lastMoveTime = now;
    }
  };

  const handlePointerUp = (e) => {
    if (e.pointerId === touchRef.current.pointerId) {
      setIsActive(false);
      setKnobPos({ x: 0, y: 0 });
      e.target.releasePointerCapture(e.pointerId);
      touchRef.current.pointerId = null;
    }
  };

  return (
    <div 
      className="relative w-28 h-28 md:w-32 md:h-32 bg-slate-800/80 backdrop-blur-md rounded-full border-2 border-slate-600 shadow-2xl flex items-center justify-center touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ touchAction: 'none' }}
    >
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-2 text-slate-500/50 pointer-events-none"><ChevronUp size={16}/></div>
      <div className="absolute bottom-2 text-slate-500/50 pointer-events-none"><ChevronDown size={16}/></div>
      <div className="absolute left-2 text-slate-500/50 pointer-events-none"><ChevronLeft size={16}/></div>
      <div className="absolute right-2 text-slate-500/50 pointer-events-none"><ChevronRight size={16}/></div>
      <div 
        className="w-12 h-12 md:w-14 md:h-14 bg-slate-400 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5),inset_0_4px_4px_rgba(255,255,255,0.4)] pointer-events-none transition-transform duration-75 flex items-center justify-center"
        style={{ transform: `translate(${knobPos.x}px, ${knobPos.y}px)` }}
      >
        <div className="w-4 h-4 bg-slate-500/50 rounded-full blur-[1px]"></div>
      </div>
    </div>
  );
};


// ==========================================
// 3. 主應用程式
// ==========================================
export default function App() {
  // 阻止整個網頁預設的觸控滑動行為，增強搖桿體驗
  useEffect(() => {
    const preventDefault = (e) => e.preventDefault();
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    document.body.style.userSelect = 'none'; // 禁止選取文字
    document.body.style.webkitUserSelect = 'none';
    
    // 只在非 input 元素上阻止 touchmove 預設行為
    const handleTouchMove = (e) => {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const [gameState, setGameState] = useState('MENU'); 
  const [playerNameInput, setPlayerNameInput] = useState('');
  const [loadCodeInput, setLoadCodeInput] = useState('');
  const [saveModalCode, setSaveModalCode] = useState(null);
  const [systemMsg, setSystemMsg] = useState(null);

  const [playerName, setPlayerName] = useState('無名吉他手');
  const [stats, setStats] = useState({ chord: 1, scale: 1, rhythm: 1, tone: 1, theory: 1, speed: 1, special: 0 });
  const [exp, setExp] = useState(0);
  const [tier, setTier] = useState(0);
  const [jobId, setJobId] = useState('0');
  const [jobLine, setJobLine] = useState(null);
  const [jobName, setJobName] = useState('新手 (Novice)');
  const [specialName, setSpecialName] = useState('');
  const [floor, setFloor] = useState(1);
  const [logs, setLogs] = useState([]);
  
  const [inventory, setInventory] = useState([]); 
  const [equip, setEquip] = useState({ W: null, P1: null, P2: null, P3: null, P4: null, P5: null, P6: null });
  const [isFloorLocked, setIsFloorLocked] = useState(false); 

  // UI 狀態
  const [isTreeOpen, setIsTreeOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isEquipOpen, setIsEquipOpen] = useState(false);
  const [isStatsDetailsOpen, setIsStatsDetailsOpen] = useState(false);
  
  // 裝備面板專用 State
  const [activeSlot, setActiveSlot] = useState('W');
  const [viewItemId, setViewItemId] = useState(null);

  // 戰鬥公式計算
  const getEquipStats = () => {
    let eStats = { hp:0, atk:0, def:0, luk:0, combo:0, crit:0, critMult:0, sp:0 };
    Object.values(equip).forEach(id => {
      if(id) {
        const item = EQUIP_DB.find(i => i.id === id);
        if(item && item.stats) {
          if(item.stats.hp) eStats.hp += item.stats.hp;
          if(item.stats.atk) eStats.atk += item.stats.atk;
          if(item.stats.def) eStats.def += item.stats.def;
          if(item.stats.combo) eStats.combo += item.stats.combo;
          if(item.stats.crit) eStats.crit += item.stats.crit;
          if(item.stats.critMult) eStats.critMult += item.stats.critMult;
          if(item.stats.sp) eStats.sp += item.stats.sp;
        }
      }
    });
    if(jobLine === 'D' && tier > 0) {
      const mult = 1 + (stats.special * 0.05);
      Object.keys(eStats).forEach(k => eStats[k] = Math.floor(eStats[k] * mult));
    }
    return eStats;
  };

  const equipStats = getEquipStats();
  const effSp = stats.special + equipStats.sp; 
  
  const playerMaxHp = 20 + Math.floor(stats.chord * 8 + (tier > 0 ? effSp * 2 : 0) + equipStats.hp);
  const playerAtk = Math.floor(stats.scale * 2 + (tier > 0 ? effSp * 1.5 : 0) + equipStats.atk);
  const playerDef = Math.floor(stats.theory * 1.5 + equipStats.def);
  const playerLuk = Math.floor(stats.tone * 5 + equipStats.luk);
  const playerComboRate = Math.floor(stats.speed * 4 + equipStats.combo); 
  const playerCritRate = Math.floor(stats.rhythm * 6 + equipStats.crit);  
  const playerCritMultiplier = 1 + (stats.theory * 0.1) + (equipStats.critMult / 100);
  
  const [playerHp, setPlayerHp] = useState(playerMaxHp);
  const [mapData, setMapData] = useState([]);
  const [explored, setExplored] = useState([]); 
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [monsters, setMonsters] = useState([]);
  const [statusEffects, setStatusEffects] = useState({ defDown: 0, comboLock: 0, noCrit: 0 }); 

  const stateRef = useRef({ playerPos, mapData, monsters, stats, exp, floor, playerHp, playerMaxHp, playerAtk, playerDef, playerLuk, playerComboRate, playerCritRate, playerCritMultiplier, explored, isFloorLocked, statusEffects });
  useEffect(() => {
    stateRef.current = { playerPos, mapData, monsters, stats, exp, floor, playerHp, playerMaxHp, playerAtk, playerDef, playerLuk, playerComboRate, playerCritRate, playerCritMultiplier, explored, isFloorLocked, statusEffects };
  }, [playerPos, mapData, monsters, stats, exp, floor, playerHp, playerMaxHp, playerAtk, playerDef, playerLuk, playerComboRate, playerCritRate, playerCritMultiplier, explored, isFloorLocked, statusEffects]);

  const addLog = useCallback((msg) => setLogs(prev => [msg, ...prev].slice(0, 50)), []);

  // --- 系統存取檔 ---
  const handleGenerateSave = () => {
    const nameEncoded = btoa(encodeURIComponent(playerName)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const nameStr = `N${nameEncoded}`;
    
    const sStr = `${stats.chord.toString(16)}${stats.scale.toString(16)}${stats.theory.toString(16)}${stats.tone.toString(16)}${stats.speed.toString(16)}${stats.rhythm.toString(16)}${stats.special.toString(16)}`.toUpperCase();
    const eStr = `E${exp.toString().padStart(4,'0')}`;
    
    const cStr = `C${tier === 0 ? '00' : tier + jobId}`; 
    
    const eqPad = (id) => id ? id.toString().padStart(2,'0') : '00';
    const eqStr = `W${eqPad(equip.W)}P${eqPad(equip.P1)}${eqPad(equip.P2)}${eqPad(equip.P3)}${eqPad(equip.P4)}${eqPad(equip.P5)}${eqPad(equip.P6)}`;
    const invStr = encodeInventory(inventory);
    
    const baseStr = `${nameStr}-F${floor}-${cStr}-${sStr}-${eStr}-${eqStr}-${invStr}`;
    const code = `${baseStr}-${generateChecksum(baseStr)}`;
    
    const textArea = document.createElement("textarea");
    textArea.value = code;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      setSystemMsg(successful ? '✅ 存檔代碼已複製到剪貼簿！\n\n如果戰鬥失敗，請重整網頁並在主畫面選擇「讀取存檔」，貼上此代碼即可恢復進度。' : '❌ 複製失敗，請檢查瀏覽器權限。');
    } catch (err) {
      setSystemMsg('❌ 複製失敗，您的瀏覽器不支援自動複製。');
    }
    document.body.removeChild(textArea);
  };

  const handleStartNewGame = () => {
    const trimmedName = playerNameInput.trim();
    if (!trimmedName) return setSystemMsg("請輸入吉他手姓名！");
    
    setStats({ chord: 1, scale: 1, rhythm: 1, tone: 1, theory: 1, speed: 1, special: 0 });
    setExp(0); setTier(0); setJobId('0'); setJobLine(null); setJobName('新手 (Novice)'); setSpecialName('');
    setFloor(1); setIsFloorLocked(false); setStatusEffects({defDown:0, comboLock:0, noCrit:0});
    
    if (trimmedName === 'IALL') { 
       setInventory(Array.from({length:50}, (_,i)=>i+1));
       setEquip({ W: 5, P1: 25, P2: 30, P3: 35, P4: 40, P5: 45, P6: 50 }); 
       setPlayerName("GM_Tester");
       setLogs([`【系統】已啟用開發者測試密技：解鎖全裝備並自動裝備頂級神裝！`]);
    } else {
       setPlayerName(trimmedName);
       setInventory([1]); 
       setEquip({ W: 1, P1: null, P2: null, P3: null, P4: null, P5: null, P6: null }); 
       setLogs([
         `【系統】剛進入樓層時可點擊「背包」換裝，發生戰鬥後即鎖定！`,
         `【系統】已為你自動裝備初始武器：[普通] Squier Sonic Stratocaster。`
       ]);
    }
    
    setGameState('PLAYING');
    generateDungeon(1);
    setPlayerHp(28); 
  };

  const handleLoadGame = () => {
    const rawCode = loadCodeInput.trim().replace(/\s+/g, '');
    if(!rawCode) return setSystemMsg("請貼上存檔代碼！");
    
    try {
      const parts = rawCode.split('-');
      let pNameStr = "", pFloor = "", pClass = "", pStats = "", pExp = "", pEquip = "", pInv = "";
      
      // 動態判定是新版(N開頭)還是舊版(F開頭)，解決讀取裝備的錯位問題
      if (parts[0].startsWith('N')) {
         if (parts.length < 8) throw new Error("Format error");
         pNameStr = parts[0];
         pFloor = parts[1];
         pClass = parts[2];
         pStats = parts[3];
         pExp = parts[4];
         pEquip = parts[5];
         pInv = parts[6];
      } else if (parts[0].startsWith('F')) {
         if (parts.length < 7) throw new Error("Format error");
         pFloor = parts[0];
         pClass = parts[1];
         pStats = parts[2];
         pExp = parts[3];
         pEquip = parts[4];
         pInv = parts[5];
      } else {
         throw new Error("Unknown format");
      }

      let parsedName = "無名吉他手";
      if (pNameStr) {
        try {
          let base64Str = pNameStr.substring(1).replace(/-/g, '+').replace(/_/g, '/');
          while (base64Str.length % 4) { base64Str += '='; }
          parsedName = decodeURIComponent(atob(base64Str));
        } catch(e) { parsedName = "失憶吉他手"; }
      }
      setPlayerName(parsedName);

      const parsedFloor = parseInt(pFloor.substring(1)) || 1;
      setFloor(parsedFloor);
      
      const classStr = pClass.substring(1); 
      const parsedTier = parseInt(classStr[0]) || 0;
      const parsedJobId = classStr.substring(1) || '0';
      setTier(parsedTier); setJobId(parsedJobId);
      
      if (parsedTier === 0) {
          setJobName('新手 (Novice)'); setJobLine(null); setSpecialName('');
      } else if (parsedTier === 1) {
          const job = JOB_TREE.tier1.find(j => j.id === parsedJobId);
          if (job) { setJobName(job.name); setJobLine(job.line); setSpecialName(job.specialName); }
      } else if (parsedTier === 2) {
          const line = parsedJobId.charAt(0);
          const job = JOB_TREE.tier2[line]?.find(j => j.id === parsedJobId);
          const t1Job = JOB_TREE.tier1.find(j => j.line === line);
          if (job && t1Job) { setJobName(job.name); setJobLine(line); setSpecialName(t1Job.specialName); }
      } else if (parsedTier === 3) {
          const line = parsedJobId.charAt(0);
          const t1Job = JOB_TREE.tier1.find(j => j.line === line);
          const job = JOB_TREE.tier3[parsedJobId];
          if (job && t1Job) { setJobName(job.name); setJobLine(line); setSpecialName(t1Job.specialName); }
      }
      
      setStats({
        chord: parseInt(pStats[0], 16) || 1, scale: parseInt(pStats[1], 16) || 1, theory: parseInt(pStats[2], 16) || 1,
        tone: parseInt(pStats[3], 16) || 1, speed: parseInt(pStats[4], 16) || 1, rhythm: parseInt(pStats[5], 16) || 1, special: parseInt(pStats[6], 16) || 0
      });
      
      setExp(parseInt(pExp.substring(1)) || 0);
      
      setEquip({
        W: parseInt(pEquip.substr(1,2))||null, P1: parseInt(pEquip.substr(4,2))||null, P2: parseInt(pEquip.substr(6,2))||null,
        P3: parseInt(pEquip.substr(8,2))||null, P4: parseInt(pEquip.substr(10,2))||null, P5: parseInt(pEquip.substr(12,2))||null, P6: parseInt(pEquip.substr(14,2))||null
      });

      setInventory(decodeInventory(pInv));
      
      setIsFloorLocked(false);
      setGameState('PLAYING');
      generateDungeon(parsedFloor);
      addLog(`【系統】讀檔成功！歡迎回來，${parsedName}。`);
    } catch(e) { 
        setSystemMsg("❌ 存檔代碼無效或已被竄改！\n請確認您貼上的是完整的代碼。"); 
    }
  };

  const generateDungeon = useCallback((currentFloor) => {
    let grid = Array(MAP_H).fill(0).map(() => Array(MAP_W).fill(TILE_WALL));
    let expGrid = Array(MAP_H).fill(0).map(() => Array(MAP_W).fill(false)); 
    let startPos = { x: Math.floor(MAP_W/2), y: Math.floor(MAP_H/2) };
    let newMonsters = [];

    if (currentFloor % 10 === 0) {
      for(let y = startPos.y - 3; y <= startPos.y + 3; y++) {
        for(let x = startPos.x - 3; x <= startPos.x + 3; x++) grid[y][x] = TILE_FLOOR;
      }
      startPos = { x: startPos.x, y: startPos.y + 3 }; 
      grid[startPos.y - 6][startPos.x] = TILE_STAIRS; 
      
      const bossData = BOSS_MONSTERS[currentFloor] || BOSS_MONSTERS[30];
      newMonsters.push({
        ...bossData, uuid: 'BOSS', x: startPos.x, y: startPos.y - 3,
        hp: Math.floor(bossData.baseHp * (1 + (currentFloor-1)*0.4)),
        maxHp: Math.floor(bossData.baseHp * (1 + (currentFloor-1)*0.4)),
        atk: Math.floor(bossData.baseAtk * (1 + (currentFloor-1)*0.25)),
        def: Math.floor(bossData.baseDef * (1 + (currentFloor-1)*0.2)),
        exp: Math.floor(bossData.exp * (1 + (currentFloor-1)*0.3)),
        isBoss: true
      });
    } else {
      grid[startPos.y][startPos.x] = TILE_FLOOR;
      let floorTiles = [startPos];
      let x = startPos.x, y = startPos.y;
      const targetSteps = 60 + Math.min(currentFloor * 5, 80); 
      for (let i = 0; i < targetSteps; i++) {
        const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        const d = dirs[Math.floor(Math.random() * dirs.length)];
        const nx = x + d[0], ny = y + d[1];
        if (nx > 0 && nx < MAP_W - 1 && ny > 0 && ny < MAP_H - 1) {
          x = nx; y = ny;
          if (grid[y][x] === TILE_WALL) { grid[y][x] = TILE_FLOOR; floorTiles.push({ x, y }); }
        }
      }
      let stairsPos = floorTiles[floorTiles.length - 1];
      let maxDist = 0;
      floorTiles.forEach(t => {
        const dist = Math.abs(t.x - startPos.x) + Math.abs(t.y - startPos.y);
        if (dist > maxDist) { maxDist = dist; stairsPos = t; }
      });
      grid[stairsPos.y][stairsPos.x] = TILE_STAIRS;

      const numMonsters = 3 + Math.floor(currentFloor * 1.5);
      for (let i = 0; i < numMonsters; i++) {
        const t = floorTiles[Math.floor(Math.random() * floorTiles.length)];
        if ((t.x !== startPos.x || t.y !== startPos.y) && grid[t.y][t.x] === TILE_FLOOR && !newMonsters.some(m => m.x === t.x && m.y === t.y)) {
          let typeIdx = Math.floor(Math.random() * BASE_MONSTERS.length);
          if(currentFloor < 3) typeIdx = Math.floor(Math.random() * 3); 
          const base = BASE_MONSTERS[typeIdx];
          newMonsters.push({
            ...base, uuid: Math.random().toString(36).substr(2,9), x: t.x, y: t.y,
            hp: Math.floor(base.baseHp * (1 + (currentFloor-1)*0.4)),
            maxHp: Math.floor(base.baseHp * (1 + (currentFloor-1)*0.4)),
            atk: Math.max(1, Math.floor(base.baseAtk * (1 + (currentFloor-1)*0.25))),
            def: Math.max(0, Math.floor(base.baseDef * (1 + (currentFloor-1)*0.2))),
            exp: Math.floor(base.exp * (1 + (currentFloor-1)*0.3))
          });
        }
      }
    }
    setMapData(grid); setMonsters(newMonsters); setPlayerPos(startPos); 
    setExplored(expGrid); updateFoW(startPos.x, startPos.y, expGrid);
    setIsFloorLocked(false); 
  }, []);

  const updateFoW = (px, py, currentExpGrid) => {
    let newExp = [...(currentExpGrid || stateRef.current.explored)];
    const sightRange = 3;
    for (let y = py - sightRange; y <= py + sightRange; y++) {
      for (let x = px - sightRange; x <= px + sightRange; x++) {
        if (y >= 0 && y < MAP_H && x >= 0 && x < MAP_W) {
          if (Math.abs(x - px) + Math.abs(y - py) <= sightRange + 1) {
            if (!newExp[y]) newExp[y] = [];
            newExp[y][x] = true;
          }
        }
      }
    }
    setExplored(newExp);
  };

  const handleDrop = (isBoss) => {
    let effLuk = stateRef.current.playerLuk;
    if (isBoss) effLuk *= 2; 
    
    const dropChance = isBoss ? 100 : (5 + effLuk * 0.2);
    if (Math.random() * 100 > dropChance) return; 

    let rarity = 1; 
    const roll = Math.random() * 100;
    if (roll < 0.5 + effLuk * 0.02) rarity = 5; 
    else if (roll < 3.0 + effLuk * 0.05) rarity = 4; 
    else if (roll < 15.0 + effLuk * 0.1) rarity = 3; 
    else if (roll < 35.0 + effLuk * 0.2) rarity = 2; 

    const pool = EQUIP_DB.filter(e => e.rarity === rarity);
    if(pool.length === 0) return;
    const dropItem = pool[Math.floor(Math.random() * pool.length)];

    setInventory(prev => {
      if(!prev.includes(dropItem.id)) {
        addLog(`🎁 幸運觸發！掉落了 [${['','普通','進階','稀有','史詩','傳說'][rarity]}] ${dropItem.name}！`);
        return [...prev, dropItem.id];
      }
      return prev;
    });
  };

  const handleMove = useCallback((dx, dy) => {
    const { playerPos, mapData, monsters, floor, playerHp, playerMaxHp, playerAtk, playerDef, playerComboRate, playerCritRate, playerCritMultiplier, isFloorLocked, statusEffects, exp } = stateRef.current;
    if (playerHp <= 0) return; 

    const nx = playerPos.x + dx;
    const ny = playerPos.y + dy;

    if (nx < 0 || nx >= MAP_W || ny < 0 || ny >= MAP_H || mapData[ny][nx] === TILE_WALL) return;

    const hitMonsterIdx = monsters.findIndex(m => m.x === nx && m.y === ny);
    
    if (hitMonsterIdx !== -1) {
      if (!isFloorLocked) setIsFloorLocked(true); 

      const m = monsters[hitMonsterIdx];
      let totalDmgDealt = 0;
      let attackLogs = [];
      let lifestealAcc = 0;
      let isStunned = false;

      let hits = 1;
      let actualComboRate = statusEffects.comboLock > 0 ? 0 : playerComboRate;
      if (actualComboRate > 100) {
        hits = 2; 
        if (Math.random()*100 < (actualComboRate - 100)) hits = 3; 
      } else if (Math.random()*100 < actualComboRate) {
        hits = 2;
      }

      const isA_Line = jobLine === 'A'; 
      const isB_Line = jobLine === 'B'; 
      const isC_Line = jobLine === 'C'; 
      const isD_Line = jobLine === 'D'; 

      for (let i = 0; i < hits; i++) {
        const minFloat = isA_Line ? 0.95 : 0.8;
        let baseDmg = Math.floor(playerAtk * (minFloat + Math.random() * (1.2 - minFloat)));
        
        let actualCritRate = statusEffects.noCrit > 0 ? 0 : playerCritRate;
        let critMultToUse = playerCritMultiplier;
        if(isB_Line) critMultToUse += 0.5; 

        let isCrit = false, isRedCrit = false;
        if (actualCritRate > 100) {
          isCrit = true;
          if (Math.random()*100 < (actualCritRate - 100)) { 
            isRedCrit = true; 
            critMultToUse = critMultToUse * (1 + stats.theory * 0.1); 
          }
        } else if (Math.random()*100 < actualCritRate) {
          isCrit = true;
        }

        if (isCrit) {
          baseDmg = Math.floor(baseDmg * critMultToUse);
          attackLogs.push(isRedCrit ? `🔥${baseDmg}` : `💥${baseDmg}`);
        } else {
          attackLogs.push(`${baseDmg}`);
        }

        if (isC_Line) lifestealAcc += Math.floor(baseDmg * 0.1); 
        if (isD_Line && Math.random() < 0.25) isStunned = true; 

        totalDmgDealt += baseDmg;
      }

      const mDef = isB_Line ? Math.floor(m.def * 0.5) : m.def; 
      const actualPlayerDmg = Math.max(1, totalDmgDealt - mDef);
      let newMHp = m.hp - actualPlayerDmg;
      
      const attackText = hits > 1 ? `⚔️ ${hits}連擊！(${attackLogs.join('+')} - 敵防${mDef})` : `🎸 (${attackLogs[0]} - 敵防${mDef})`;
      
      if (newMHp <= 0) {
        addLog(`${attackText} 擊敗了 LV.${floor} ${m.name}！獲得 ${m.exp} EXP。`);
        setExp(exp + m.exp);
        setMonsters(prev => prev.filter((_, idx) => idx !== hitMonsterIdx));
        
        handleDrop(m.isBoss);

        let rvbHeal = 0;
        if(equip.P6) rvbHeal = EQUIP_DB.find(i=>i.id===equip.P6)?.stats?.hp || 0;
        setPlayerHp(prev => Math.min(stateRef.current.playerMaxHp, prev + Math.floor(m.exp/3) + lifestealAcc + (rvbHeal > 0 ? 5 : 0)));
        if (lifestealAcc > 0) addLog(`🩸 情緒治癒回復了 ${lifestealAcc} 點 HP。`);

      } else {
        let newPHp = playerHp + lifestealAcc; 
        if (lifestealAcc > 0) addLog(`🩸 造成 ${actualPlayerDmg} 傷害並吸血 ${lifestealAcc}。`);

        if (isStunned) {
          addLog(`⚡ D線控制觸發！${m.name} 陷入混亂無法反擊。`);
        } else {
          let pDef = statusEffects.defDown > 0 ? Math.floor(playerDef * 0.9) : playerDef;
          const rawMonsterDmg = Math.floor(m.atk * (0.8 + Math.random() * 0.4));
          let dmgTaken = Math.max(1, rawMonsterDmg - pDef);
          
          if(isA_Line) dmgTaken = Math.floor(dmgTaken * (1 - Math.min(0.5, stats.special * 0.02))); 

          newPHp -= dmgTaken;
          const blockText = pDef > 0 ? `(抵擋 ${Math.max(0, rawMonsterDmg - dmgTaken)} 點)` : '';
          addLog(`${attackText} 造成 ${actualPlayerDmg} 傷害。${m.name} 反擊受到 ${dmgTaken} 傷害！${blockText}`);

          let newStatus = { ...statusEffects };
          if(m.id === 'slime') { newStatus.defDown = 1; addLog('黏液降低了你的防禦力！'); }
          if(m.id === 'spider') { newStatus.comboLock = 2; addLog('蛛網封鎖了你的連擊！'); }
          if(m.id === 'ghost') { newStatus.noCrit = 1; addLog('幽靈沒收了你的爆擊！'); }
          setStatusEffects(newStatus);
        }

        setMonsters(prev => { const next = [...prev]; next[hitMonsterIdx] = { ...m, hp: newMHp }; return next; });

        if (newPHp <= 0) {
          setPlayerHp(0);
          addLog(`💀 【GAME OVER】弦斷了！被抬出場外，退回 B1 樓。`);
          setTimeout(() => {
            setFloor(1);
            generateDungeon(1);
            setPlayerHp(stateRef.current.playerMaxHp);
            setExp(prev => Math.floor(prev * 0.8)); 
            addLog(`🔄 保留了職業與裝備滿血復活，但遺失了 20% EXP。`);
          }, 1500);
          return;
        }
        setPlayerHp(Math.min(playerMaxHp, newPHp));
      }

      if (isC_Line && newMHp > 0 && Math.random() < 0.4) {
         addLog(`🌊 觸發和聲共鳴！對周圍造成擴散真實傷害。`);
         setMonsters(prev => prev.map((om, idx) => {
            if(idx !== hitMonsterIdx && Math.abs(om.x - nx) + Math.abs(om.y - ny) <= 3) {
               return {...om, hp: om.hp - Math.floor(actualPlayerDmg * 0.3)}; 
            }
            return om;
         }).filter(om => om.hp > 0)); 
      }

      setStatusEffects(prev => ({ defDown: Math.max(0, prev.defDown-1), comboLock: Math.max(0, prev.comboLock-1), noCrit: Math.max(0, prev.noCrit-1) }));

    } else {
      setPlayerPos({ x: nx, y: ny });
      updateFoW(nx, ny);

      if (mapData[ny][nx] === TILE_STAIRS) {
        const nextFloor = floor + 1;
        addLog(`🚪 找到了向下的樓梯！進入 B${nextFloor} 層。`);
        setFloor(nextFloor);
        generateDungeon(nextFloor);
        setPlayerHp(prev => Math.min(stateRef.current.playerMaxHp, prev + Math.floor(stateRef.current.playerMaxHp * 0.2)));
      }
    }
  }, [addLog, generateDungeon, jobLine, equip]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'PLAYING' || isTreeOpen || saveModalCode || isStatsOpen || isEquipOpen || systemMsg) return;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].indexOf(e.key) > -1) e.preventDefault(); 
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': handleMove(0, -1); break;
        case 'ArrowDown': case 's': case 'S': handleMove(0, 1); break;
        case 'ArrowLeft': case 'a': case 'A': handleMove(-1, 0); break;
        case 'ArrowRight': case 'd': case 'D': handleMove(1, 0); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove, gameState, isTreeOpen, saveModalCode, isStatsOpen, isEquipOpen, systemMsg]);

  const upgradeStat = (statId) => {
    const currentVal = stats[statId];
    if (currentVal >= 10) return;
    const cost = Math.floor(Math.pow(currentVal, 2) * 15); 
    if (exp >= cost) {
      setExp(prev => prev - cost);
      setStats(prev => ({ ...prev, [statId]: currentVal + 1 }));
      addLog(`✨ 消耗 ${cost} EXP，${statId.toUpperCase()} 提升至 Lv.${currentVal+1}！`);
      setPlayerHp(prev => Math.min(stateRef.current.playerMaxHp, prev + 10));
    }
  };

  const advanceClass = (job, newTier) => {
    setJobId(job.id); 
    setJobName(job.name); 
    setTier(newTier);
    const currentLine = job.line || jobLine;
    setJobLine(currentLine);
    if (newTier === 1) { setSpecialName(job.specialName); }
    addLog(`🎉 【轉職突破】覺醒為「${job.name}」！`);
  };

  const getAvailableAdvancements = () => {
    if (tier === 0) return JOB_TREE.tier1;
    if (tier === 1 && jobLine) return JOB_TREE.tier2[jobLine] || [];
    if (tier === 2 && jobId) {
      const nextJob = JOB_TREE.tier3[`${jobId}-3`] || JOB_TREE.tier3[jobId]; 
      if (nextJob) return [{ id: `${jobId}-3`, line: nextJob.line || jobLine, ...nextJob }];
    }
    return [];
  };

  const checkReqs = (reqs) => {
    for (const key in reqs) if (stats[key] < reqs[key]) return false;
    return true;
  };

  // ==========================================
  // 渲染區塊
  // ==========================================
  return (
    <>
      {gameState !== 'PLAYING' && (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-300 font-sans relative overflow-hidden select-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
          
          {gameState === 'MENU' && (
            <div className="text-center z-10 animate-in fade-in zoom-in duration-500">
              <h1 className="text-5xl md:text-7xl font-black text-white mb-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] tracking-tighter">
                GUITAR <span className="text-indigo-500">RPG</span>
              </h1>
              <p className="text-slate-400 mb-12 tracking-widest text-sm md:text-base">地下音樂祭 - 刷寶地牢</p>
              <div className="flex flex-col gap-4 w-64 mx-auto">
                <button onClick={() => setGameState('NEW_GAME')} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all transform hover:scale-105 active:scale-95 text-lg">
                  踏上旅途
                </button>
                <button onClick={() => setGameState('LOAD_GAME')} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 px-6 rounded-xl border border-slate-700 transition-all transform hover:scale-105 active:scale-95 text-lg">
                  讀取字串存檔
                </button>
              </div>
            </div>
          )}

          {gameState === 'NEW_GAME' && (
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 max-w-md w-full text-center shadow-2xl z-10">
              <h2 className="text-2xl font-bold text-white mb-6">創建吉他手</h2>
              <input type="text" placeholder="輸入姓名 (密技 IALL 全解鎖)" value={playerNameInput} onChange={(e) => setPlayerNameInput(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3.5 text-white mb-8 focus:outline-none focus:border-indigo-500 text-center font-bold select-auto" maxLength={15} />
              <div className="flex gap-3 justify-center">
                <button onClick={() => setGameState('MENU')} className="px-5 py-2.5 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 transition-colors">返回</button>
                <button onClick={handleStartNewGame} className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:bg-indigo-500 transition-colors">進入地牢</button>
              </div>
            </div>
          )}

          {gameState === 'LOAD_GAME' && (
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 max-w-lg w-full text-center shadow-2xl z-10">
              <h2 className="text-2xl font-bold text-white mb-2">讀取字串存檔</h2>
              <p className="text-xs text-slate-400 mb-6">請貼上包含 7 或 8 個區塊的完整代碼</p>
              <textarea value={loadCodeInput} onChange={(e) => setLoadCodeInput(e.target.value)} className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-3 text-emerald-400 font-mono text-xs mb-6 focus:outline-none focus:border-emerald-500 custom-scrollbar break-all select-auto" placeholder="範例: F12-CA1-123456-E0135-W01P...-I...-X00" />
              <div className="flex gap-3 justify-center">
                <button onClick={() => setGameState('MENU')} className="px-5 py-2.5 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 transition-colors">返回</button>
                <button onClick={handleLoadGame} className="px-8 py-2.5 bg-yellow-600 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(202,138,4,0.4)] hover:bg-yellow-500 transition-colors">強制覆寫進度</button>
              </div>
            </div>
          )}
        </div>
      )}

      {gameState === 'PLAYING' && (
        <div className="min-h-screen bg-slate-950 text-slate-300 font-sans p-2 md:p-6 flex flex-col items-center select-none fixed inset-0 overflow-hidden touch-none" style={{ overscrollBehavior: 'none' }}>
          
          <div className="w-full max-w-md md:max-w-2xl flex flex-col gap-3 mx-auto pb-10 h-full">
            
            {/* --- 新版收合式狀態列 (Header) --- */}
            <div className="bg-slate-900 border border-slate-700 p-3 md:p-4 rounded-xl shadow-xl relative overflow-hidden flex flex-col gap-3 shrink-0">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsStatsDetailsOpen(!isStatsDetailsOpen)} className="relative hover:scale-105 transition-transform cursor-pointer focus:outline-none flex-shrink-0">
                  <PaperDoll tier={tier} line={jobLine} />
                  <div className="absolute -bottom-1 -right-1 bg-indigo-600 rounded-full p-0.5 border border-slate-900 shadow-md">
                    <Info size={12} className="text-white" />
                  </div>
                </button>
                
                <div className="flex-1 min-w-0">
                  <h1 className="text-base md:text-xl font-bold text-white flex flex-wrap items-center gap-1.5">
                    <span className="text-indigo-400 truncate max-w-[100px] md:max-w-[150px]">[{playerName}]</span>
                    <span className="truncate">{jobName}</span>
                    <span className="text-xs bg-red-900/80 text-red-200 px-1.5 py-0.5 rounded border border-red-700 whitespace-nowrap">B{floor}</span>
                  </h1>
                  <div className="mt-2 flex items-center gap-2 text-[10px] md:text-xs font-bold text-red-400">
                    <Heart size={12} className="animate-pulse" />
                    <div className="flex-1 bg-red-950 rounded-full h-2 md:h-2.5 border border-red-900/50 relative overflow-hidden">
                      <div className="bg-red-500 h-full transition-all duration-300" style={{ width: `${Math.max(0, (playerHp / playerMaxHp) * 100)}%` }} />
                    </div>
                    <span className="w-10 text-right whitespace-nowrap">{playerHp}/{playerMaxHp}</span>
                  </div>
                </div>
              </div>

              {/* 收合的能力值面板 */}
              {isStatsDetailsOpen && (
                <div className="grid grid-cols-5 gap-1.5 bg-slate-800/80 p-2 rounded-lg border border-slate-700/50 font-mono text-[9px] md:text-[10px] animate-in fade-in slide-in-from-top-2">
                  <div className="flex flex-col items-center gap-1 text-orange-400" title="攻擊力"><Swords size={12}/> <span>{playerAtk}</span></div>
                  <div className="flex flex-col items-center gap-1 text-blue-400" title="防禦力"><Shield size={12}/> <span>{playerDef}</span></div>
                  <div className="flex flex-col items-center gap-1 text-yellow-400" title="連擊率"><Zap size={12}/> <span>{playerComboRate}%</span></div>
                  <div className="flex flex-col items-center gap-1 text-red-400" title={`爆倍x${Math.floor(playerCritMultiplier * 100)}%`}><Flame size={12}/> <span>{playerCritRate}%</span></div>
                  <div className="flex flex-col items-center gap-1 text-emerald-400" title="幸運 (影響掉寶)"><Star size={12}/> <span>{playerLuk}</span></div>
                </div>
              )}

              {/* 橫向按鈕列 */}
              <div className="flex gap-2 items-stretch justify-between mt-1">
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-800/50 py-1.5 rounded-lg border border-slate-700/50 min-w-[50px]">
                  <p className="text-[9px] text-slate-400 mb-0.5">EXP</p>
                  <p className="text-sm font-bold text-yellow-400">{exp}</p>
                </div>
                <button onClick={() => setIsStatsOpen(true)} className="flex-1 flex flex-col items-center justify-center py-1.5 bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-500/50 rounded-lg transition-colors text-emerald-300">
                  <ArrowUp size={14} className="mb-0.5" /><span className="text-[9px] font-bold">升級</span>
                </button>
                <button onClick={() => { setIsEquipOpen(true); setActiveSlot('W'); setViewItemId(equip['W'] || null); }} className={`relative flex-1 flex flex-col items-center justify-center py-1.5 border rounded-lg transition-colors ${isFloorLocked ? 'bg-slate-900/80 border-slate-700 text-slate-500 cursor-not-allowed' : 'bg-orange-900/40 hover:bg-orange-800/60 border-orange-500/50 text-orange-300'}`}>
                  <Briefcase size={14} className="mb-0.5" /><span className="text-[9px] font-bold">背包</span>
                  {isFloorLocked && <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center"><Key size={14} className="text-red-500/80" /></div>}
                </button>
                <button onClick={() => setIsTreeOpen(true)} className="flex-1 flex flex-col items-center justify-center py-1.5 bg-indigo-900/40 hover:bg-indigo-800/60 border border-indigo-500/50 rounded-lg transition-colors text-indigo-300">
                  <Network size={14} className="mb-0.5" /><span className="text-[9px] font-bold">職業</span>
                </button>
                <button onClick={handleGenerateSave} className="flex-1 flex flex-col items-center justify-center py-1.5 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors text-slate-300">
                  <Save size={14} className="mb-0.5" /><span className="text-[9px] font-bold">存檔</span>
                </button>
              </div>
            </div>

            {/* --- 地圖 --- */}
            <div className="w-full flex flex-col items-center relative flex-1 min-h-0">
              <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-1 md:p-2 shadow-2xl relative w-full h-full max-h-[50vh] overflow-hidden select-none">
                <div className="absolute inset-1 md:inset-2 bg-slate-950 overflow-hidden rounded border border-slate-800 shadow-inner"
                  style={{ display: 'grid', gridTemplateColumns: `repeat(${MAP_W}, 1fr)`, gridTemplateRows: `repeat(${MAP_H}, 1fr)` }}>
                  {mapData.map((row, y) => row.map((tile, x) => {
                      const isExplored = explored[y] && explored[y][x];
                      const distToPlayer = Math.abs(x - playerPos.x) + Math.abs(y - playerPos.y);
                      const isVisible = distToPlayer <= 3; 
                      if (!isExplored) return <div key={`${x}-${y}`} className="bg-slate-950 w-full h-full" />;

                      let tileContent = null;
                      let tileClass = tile === TILE_WALL ? 'bg-slate-900 border-[0.5px] border-slate-950' : 'bg-slate-700 border-[0.5px] border-slate-800';
                      
                      if (tile === TILE_FLOOR) tileContent = <div className="w-1.5 h-1.5 bg-slate-600/60 rounded-full" />;
                      else if (tile === TILE_STAIRS) tileContent = <ChevronsDown className="text-yellow-400 animate-bounce w-full h-full p-0.5 drop-shadow-md" />;

                      return (
                        <div key={`${x}-${y}`} className={`relative flex items-center justify-center ${tileClass}`}>
                          {tileContent}
                          {!isVisible && <div className="absolute inset-0 bg-black/60 pointer-events-none" />}
                        </div>
                      );
                    })
                  )}

                  {monsters.map(m => {
                    const isVisible = explored[m.y] && explored[m.y][m.x] && (Math.abs(m.x - playerPos.x) + Math.abs(m.y - playerPos.y) <= 3);
                    if (!isVisible) return null;
                    return (
                      <div key={m.uuid} className={`absolute flex flex-col items-center justify-center transition-all duration-300 z-10 ${m.isBoss?'scale-150 animate-pulse':''}`}
                        style={{ width: `${100/MAP_W}%`, height: `${100/MAP_H}%`, left: `${(m.x/MAP_W)*100}%`, top: `${(m.y/MAP_H)*100}%` }}>
                        <div className={`${m.color} drop-shadow-lg w-full h-full flex items-center justify-center`}>
                          <div className="w-[80%] h-[80%]">{m.icon}</div>
                        </div>
                        <div className="absolute -bottom-1 w-[80%] h-1 bg-red-950 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500" style={{ width: `${(m.hp / m.maxHp) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}

                  <div className="absolute flex items-center justify-center transition-all duration-150 z-20"
                    style={{ width: `${100/MAP_W}%`, height: `${100/MAP_H}%`, left: `${(playerPos.x/MAP_W)*100}%`, top: `${(playerPos.y/MAP_H)*100}%` }}>
                    <div className="w-[90%] h-[90%]">
                      <PaperDoll tier={tier} line={jobLine} isMini={true} />
                    </div>
                  </div>
                </div>

                {/* 實體化的虛擬搖桿 (Virtual Joystick) */}
                <div className="absolute bottom-3 right-3 md:bottom-5 md:right-5 z-30 opacity-60 hover:opacity-100 transition-opacity">
                  <VirtualJoystick onMove={handleMove} />
                </div>
              </div>
            </div>

            {/* --- 戰鬥日誌 (移到地圖下方) --- */}
            <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md min-h-[90px] shrink-0 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col gap-1 font-mono text-[10px] md:text-xs">
                {logs.slice(0, 4).map((log, i) => {
                  let colorClass = 'text-slate-400';
                  if (log.includes('擊敗') || log.includes('突破') || log.includes('掉落')) colorClass = 'text-yellow-400 font-bold';
                  else if (log.includes('受到') || log.includes('沒收') || log.includes('降低')) colorClass = 'text-red-400';
                  else if (log.includes('回復') || log.includes('治癒')) colorClass = 'text-emerald-400';
                  else if (log.includes('系統') || log.includes('找到了')) colorClass = 'text-blue-300';
                  else if (log.includes('GAME OVER')) colorClass = 'text-red-500 font-bold text-sm';
                  return <div key={i} className={`truncate ${i===0?'opacity-100':'opacity-60'} ${colorClass}`}>{i===0?'▶ ':'  '}{log}</div>;
                })}
                {logs.length === 0 && <div className="text-slate-500 italic">尚無日誌...</div>}
              </div>
            </div>

          </div>

          {/* ================= MODALS ================= */}

          {isEquipOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg h-[85vh] md:h-[80vh] flex flex-col shadow-2xl relative overflow-hidden">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-3 border-b border-slate-800 bg-slate-800/50 shrink-0">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Briefcase className="text-orange-400" size={18}/> 裝備配置 
                    {isFloorLocked && <span className="text-[9px] text-red-400 bg-red-950 px-1.5 py-0.5 rounded ml-2 border border-red-800">戰鬥中鎖定</span>}
                  </h2>
                  <button onClick={() => setIsEquipOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1 bg-slate-800 rounded-full hover:bg-slate-700"><X size={18} /></button>
                </div>
                
                {/* Area A: 目前配置 (Signal Chain) */}
                <div className="p-3 border-b border-slate-800 bg-slate-950 shrink-0">
                  <h3 className="text-[10px] font-bold text-slate-500 mb-2">A. 目前配置 (點擊切換部位)</h3>
                  
                  {/* 吉他 Weapon */}
                  <div 
                    className={`w-full p-2.5 rounded-xl border-2 mb-2 cursor-pointer transition-all flex items-center justify-between ${activeSlot === 'W' ? 'border-indigo-500 bg-indigo-900/30' : 'border-slate-700 bg-slate-900 hover:border-slate-500'}`}
                    onClick={() => { setActiveSlot('W'); setViewItemId(equip['W']); }}
                  >
                    <div>
                       <div className="text-[9px] text-slate-400 mb-0.5">吉他 (Weapon)</div>
                       {equip['W'] ? <div className={`text-xs font-bold ${RARITY_COLORS[EQUIP_DB.find(i=>i.id===equip['W'])?.rarity]}`}>{EQUIP_DB.find(i=>i.id===equip['W'])?.name}</div> : <div className="text-slate-600 text-xs italic">空插槽</div>}
                    </div>
                    {activeSlot === 'W' && <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>}
                  </div>

                  {/* 效果器串列 Effects */}
                  <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                     {['P1', 'P2', 'P3', 'P4', 'P5', 'P6'].map(slot => {
                        const item = equip[slot] ? EQUIP_DB.find(i=>i.id===equip[slot]) : null;
                        const slotNames = { P1:'EFX1(破音)', P2:'EFX2(失真)', P3:'AMP(音箱)', P4:'MOD(調變)', P5:'DLY(延遲)', P6:'RVB(殘響)' };
                        return (
                          <div 
                            key={slot}
                            className={`w-[60px] h-[68px] shrink-0 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center p-1 text-center relative ${activeSlot === slot ? 'border-orange-500 bg-orange-900/30' : 'border-slate-700 bg-slate-900 hover:border-slate-500'}`}
                            onClick={() => { setActiveSlot(slot); setViewItemId(equip[slot]); }}
                          >
                            <div className="text-[8px] text-slate-400 whitespace-nowrap -mt-1 scale-90">{slotNames[slot]}</div>
                            {item ? <div className={`text-[9px] font-bold line-clamp-2 leading-tight mt-1 ${RARITY_COLORS[item.rarity]}`}>{item.name.split(' ').slice(-2).join(' ')}</div> : <div className="text-[9px] text-slate-700 mt-1 italic">空</div>}
                            {activeSlot === slot && <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]"></div>}
                          </div>
                        )
                     })}
                  </div>
                </div>

                {/* Area B: 擁有的清單 */}
                <div className="p-3 bg-slate-900/50 flex-1 overflow-y-auto custom-scrollbar">
                   <div className="flex justify-between items-center mb-2">
                     <h3 className="text-[10px] font-bold text-slate-500">B. 擁有的清單</h3>
                     <span className="text-[9px] text-slate-600 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">部位: {activeSlot === 'W' ? 'Weapon' : activeSlot}</span>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-2">
                      {inventory.filter(id => EQUIP_DB.find(i => i.id === id)?.type === activeSlot).map(id => {
                          const item = EQUIP_DB.find(i => i.id === id);
                          const isEquipped = equip[activeSlot] === id;
                          const isSelected = viewItemId === id;
                          return (
                            <div 
                              key={id}
                              onClick={() => setViewItemId(id)}
                              className={`p-2 rounded-xl border-2 cursor-pointer transition-all relative flex flex-col justify-between min-h-[60px] ${isSelected ? 'border-blue-400 bg-blue-900/20 scale-[1.02] shadow-lg z-10' : `border-slate-700/50 ${RARITY_BG[item.rarity]} hover:brightness-110`} ${isEquipped ? 'opacity-60 grayscale' : ''}`}
                            >
                              {isEquipped && <div className="absolute top-0 right-0 bg-slate-700 text-slate-300 text-[8px] px-1.5 py-0.5 rounded-bl-lg rounded-tr-lg">已裝備</div>}
                              <div className={`text-[10px] font-bold ${RARITY_COLORS[item.rarity]} line-clamp-2 leading-tight pr-5`}>{item.name}</div>
                              <div className="text-[9px] text-slate-300 mt-1 flex flex-wrap gap-1 font-mono">
                                {Object.entries(item.stats).map(([k, v]) => <span key={k} className="bg-black/30 px-1 rounded">{k.toUpperCase()}+{v}</span>)}
                              </div>
                            </div>
                          )
                      })}
                      {inventory.filter(id => EQUIP_DB.find(i => i.id === id)?.type === activeSlot).length === 0 && (
                          <div className="col-span-2 text-slate-600 text-xs text-center py-8 border-2 border-dashed border-slate-800 rounded-xl">背包裡沒有這個部位的裝備。</div>
                      )}
                   </div>
                </div>

                {/* Area C: 說明與操作 */}
                <div className="p-3 border-t border-slate-800 bg-slate-950 shrink-0 min-h-[110px] flex items-center shadow-[0_-10px_15px_rgba(0,0,0,0.3)] z-20">
                  {viewItemId ? (() => {
                    const vItem = EQUIP_DB.find(i=>i.id===viewItemId);
                    const isEquipped = equip[activeSlot] === viewItemId;
                    return (
                      <div className="flex gap-3 w-full items-stretch">
                        <div className="flex-1 flex flex-col justify-center min-w-0">
                           <h4 className={`text-xs font-bold truncate ${RARITY_COLORS[vItem.rarity]}`}>{vItem.name}</h4>
                           <p className="text-[9px] text-slate-400 mt-1 line-clamp-2 leading-tight">{vItem.desc}</p>
                           <div className="text-[10px] text-emerald-400 mt-1 font-mono flex flex-wrap gap-x-2">
                              {Object.entries(vItem.stats).map(([k, v]) => <span key={k}>{k.toUpperCase()} <span className="font-bold">+{v}</span></span>)}
                           </div>
                        </div>
                        <div className="flex items-center justify-center shrink-0 w-[70px]">
                           {isEquipped ? (
                             <button 
                               onClick={() => { if(!isFloorLocked) { setEquip(p => ({...p, [activeSlot]: null})); setViewItemId(null); } }}
                               disabled={isFloorLocked}
                               className={`w-full h-full rounded-xl font-bold text-xs transition-all ${isFloorLocked ? 'bg-slate-800 text-slate-600' : 'bg-red-900/60 hover:bg-red-800 text-red-300 border border-red-700/50 active:scale-95'}`}
                             >
                               卸下
                             </button>
                           ) : (
                             <button 
                               onClick={() => { if(!isFloorLocked) setEquip(p => ({...p, [activeSlot]: viewItemId})); }}
                               disabled={isFloorLocked}
                               className={`w-full h-full rounded-xl font-bold text-xs transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] ${isFloorLocked ? 'bg-slate-800 text-slate-600' : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95'}`}
                             >
                               裝備
                             </button>
                           )}
                        </div>
                      </div>
                    );
                  })() : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                      <span className="text-xs mb-1">請在上方選擇裝備</span>
                      <span className="text-[9px] opacity-70">這裡會顯示詳細數值與按鈕</span>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {isStatsOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl relative">
                <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-800/50 rounded-t-2xl">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ArrowUp className="text-emerald-400" /> 能力鍛鍊 (EXP: <span className="text-yellow-400">{exp}</span>)
                  </h2>
                  <button onClick={() => setIsStatsOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1 bg-slate-800 rounded-full hover:bg-slate-700"><X size={20} /></button>
                </div>
                
                <div className="p-4 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
                  {STATS_DEF.map(stat => {
                    const currentVal = stats[stat.id];
                    const cost = Math.floor(Math.pow(currentVal, 2) * 15);
                    const isMax = currentVal >= 10;
                    const canAfford = exp >= cost;

                    return (
                      <div key={stat.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <div className="flex justify-between items-end text-sm mb-2">
                          <div className="flex flex-col">
                            <span className="flex items-center gap-1.5 text-slate-200 font-bold">{stat.icon} {stat.name.split(' ')[0]}</span>
                            <span className="text-[10px] text-slate-500 mt-1">{STAT_EFFECTS[stat.id]}</span>
                          </div>
                          <span className="font-mono text-emerald-400 font-bold">Lv.{currentVal} <span className="text-xs text-slate-600">/ 10</span></span>
                        </div>
                        <button onClick={() => upgradeStat(stat.id)} disabled={isMax || !canAfford}
                          className={`w-full text-xs py-2 rounded-lg font-bold transition-all ${isMax ? 'bg-slate-800 text-slate-600' : canAfford ? 'bg-emerald-700/80 hover:bg-emerald-600 text-white shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-slate-800 text-slate-500'}`}>
                          {isMax ? '已達滿級' : `升級 (需 ${cost} EXP)`}
                        </button>
                      </div>
                    );
                  })}

                  {tier >= 1 && specialName && (
                    <div className="bg-purple-950/30 p-3 rounded-xl border border-purple-800/50 mt-4 shadow-inner">
                      <div className="flex justify-between items-end text-sm mb-2">
                        <span className="flex items-center gap-1.5 text-purple-300 font-bold"><Star size={14}/> 專屬維度: {specialName.split(' ')[0]}</span>
                        <span className="font-mono text-purple-400 font-bold">Lv.{stats.special} <span className="text-xs text-purple-900">/ 10</span></span>
                      </div>
                      <button onClick={() => upgradeStat('special')} disabled={stats.special >= 10 || exp < Math.floor(Math.pow(stats.special===0?1:stats.special, 2)*15)}
                        className={`w-full text-xs py-2 rounded-lg font-bold transition-all ${stats.special >= 10 ? 'bg-slate-800 text-slate-600' : exp >= Math.floor(Math.pow(stats.special===0?1:stats.special, 2)*15) ? 'bg-purple-700/80 hover:bg-purple-600 text-white shadow-[0_0_8px_rgba(147,51,234,0.3)]' : 'bg-slate-800 text-slate-500'}`}>
                        {stats.special >= 10 ? '滿級' : `鑽研 (需 ${Math.floor(Math.pow(stats.special===0?1:stats.special, 2)*15)} EXP)`}
                      </button>
                    </div>
                  )}

                  {tier < 3 && (
                    <div className="mt-6 pt-4 border-t border-slate-800">
                      <p className="text-sm text-yellow-500/90 mb-3 font-bold flex justify-between items-center">
                        <span>🔥 下階轉職</span>
                        <span className="text-xs font-normal cursor-pointer text-indigo-400 bg-indigo-900/30 px-2 py-0.5 rounded" onClick={()=>{setIsStatsOpen(false); setIsTreeOpen(true);}}>樹狀圖</span>
                      </p>
                      {getAvailableAdvancements().map(job => {
                        const canAdvance = checkReqs(job.reqs);
                        const theme = THEME_COLORS[job.line || jobLine || 'default'];
                        return (
                          <button key={job.id} onClick={() => { if(canAdvance) { advanceClass(job, tier + 1); setIsStatsOpen(false); } }} disabled={!canAdvance}
                            className={`w-full text-left p-3 rounded-xl border mb-3 text-sm transition-colors relative overflow-hidden ${canAdvance ? `${theme.bg} ${theme.border} text-white cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:brightness-110` : 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed'}`}>
                            <div className="font-bold mb-1.5 flex justify-between items-center">
                              <span className="text-base">{job.name}</span>
                              {!canAdvance && <span className="text-xs text-red-900/80 font-normal border border-red-900/30 px-1 rounded">未滿</span>}
                              {canAdvance && <span className="text-xs bg-yellow-500 text-yellow-950 px-2 py-0.5 rounded font-bold animate-pulse">可突破!</span>}
                            </div>
                            <div className="text-xs opacity-70">{job.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {isTreeOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-4 md:p-5 border-b border-slate-800 bg-slate-800/50">
                  <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2"><Network className="text-indigo-400" /> 職業路線圖</h2>
                  <button onClick={() => setIsTreeOpen(false)} className="text-slate-400 hover:text-white transition-colors p-1 bg-slate-800 rounded-full"><X size={20} /></button>
                </div>
                <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar bg-slate-950/50">
                  {['A', 'B', 'C', 'D'].map(lineCode => {
                    const tier1Job = JOB_TREE.tier1.find(j => j.line === lineCode);
                    const theme = THEME_COLORS[lineCode];
                    return (
                      <div key={lineCode} className={`border rounded-xl p-4 md:p-5 ${theme.bg} ${theme.border}`}>
                        <h3 className={`text-lg md:text-xl font-bold mb-4 ${theme.text} flex items-center gap-2 border-b border-white/10 pb-2`}>{theme.name}</h3>
                        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                          <div className="flex-1 bg-slate-950/60 rounded-lg p-4 border border-white/5">
                            <div className="text-[10px] text-slate-500 font-mono mb-1">一轉</div>
                            <div className={`text-lg font-bold ${theme.text}`}>{tier1Job.name}</div>
                            <div className="text-xs text-slate-400 mt-2">{tier1Job.desc}</div>
                          </div>
                          <div className="flex-[2.5] flex flex-col gap-2">
                            {JOB_TREE.tier2[lineCode].map(t2Job => (
                              <div key={t2Job.id} className="flex bg-slate-950/40 rounded-lg p-2 border border-white/5 items-center">
                                <div className="flex-1 pl-2 border-l-2 border-slate-600"><div className="font-bold text-slate-200 text-sm">{t2Job.name}</div></div>
                                <div className="text-slate-600 mx-2">→</div>
                                <div className="flex-1 pl-2 border-l-2 border-yellow-700/50"><div className="font-bold text-yellow-400 text-sm">{JOB_TREE.tier3[`${t2Job.id}-3`] ? JOB_TREE.tier3[`${t2Job.id}-3`].name : JOB_TREE.tier3[t2Job.id]?.name}</div></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ================= 系統提示訊息 (全域) ================= */}
      {systemMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl text-center max-w-sm w-full">
            <p className="text-white text-lg font-bold mb-6 whitespace-pre-wrap">{systemMsg}</p>
            <button 
              onClick={() => setSystemMsg(null)} 
              className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors shadow-[0_0_15px_rgba(79,70,229,0.4)]"
            >
              確定
            </button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(71, 85, 105, 0.8); border-radius: 8px; }
      `}} />
    </>
  );
}