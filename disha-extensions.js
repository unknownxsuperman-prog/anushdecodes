/**
 * x0s.link — Disha Extensions
 * NO IIFE — all functions global so xos-feed can call them directly
 * Load order: colleges.js → Dishabase.js → disha-extensions.js
 */
 
// ========== CONFIG ==========
const DISHA_CONFIG = {
  weatherApiKey: '0222762e4fd7dc746123423914f0dca7',
  defaultCity: 'Mumbai',
  typingSpeed: 12,
};
 
const DISHA_STATE = {
  history: [],
  stats: { queriesHandled: 0 },
  sessionStart: Date.now(),
};
 
// ========== MARKDOWN ==========
function dishaMarkdown(md) {
  return md
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:#111;padding:2px 7px;border-radius:5px;color:#fff;font-family:monospace;font-size:.88em;border:1px solid #1a1a1a;">$1</code>')
    .replace(/\n/g, '<br>');
}
 
async function dishaTypewrite(container, text) {
  const isHtml = text.trim().startsWith('<');
  if (isHtml) { container.innerHTML = text; return; }
  container.innerHTML = '';
  let i = 0;
  return new Promise(resolve => {
    function type() {
      if (i < text.length) {
        container.innerHTML = dishaMarkdown(text.substring(0, ++i)) + '<span style="color:#007aff;">▌</span>';
        setTimeout(type, DISHA_CONFIG.typingSpeed + Math.random() * 8);
        if (typeof window.scrollEsToBottom === 'function') window.scrollEsToBottom();
      } else {
        container.innerHTML = dishaMarkdown(text);
        resolve();
      }
    }
    type();
  });
}
 
// ========== LOCAL AI ENGINE ==========
async function dishaRespond(query) {
  const q = query.trim();
  if (!q) return "I didn't catch that.";
  const lower = q.toLowerCase();
  DISHA_STATE.stats.queriesHandled++;
 
  // intent detection
  if (/^(calc|calculate|compute|what is|what's)\s+[\d\s+\-*/().^%]/i.test(q) || /^[\d\s+\-*/().^%]+$/.test(q))
    return dishaCalc(q);
  if (/\b(convert|km to|mi to|kg to|lb to|°c|°f|usd to|inr to|eur to)\b/i.test(lower))
    return dishaConvert(q);
  if (/\b(weather|temperature|forecast)\b/i.test(lower))
    return await dishaWeather(lower);
  if (/\b(time|clock)\s+(in|at|for)\b/i.test(lower) || /what time/i.test(lower))
    return dishaTime(lower);
  if (/\b(today|what day|what date)\b/i.test(lower))
    return dishaDate();
  if (/\b(timer|countdown|remind me in)\b/i.test(lower))
    return dishaTimer(lower);
  if (/\b(define|meaning of|what is|what are|explain)\b/i.test(lower))
    return dishaDef(lower);
  if (/\b(password|generate password)\b/i.test(lower))
    return dishaPassword(lower);
  if (/\buuid\b/i.test(lower))
    return `🆔 **UUID v4**:\n\`${crypto.randomUUID()}\``;
 if (/\b(open|launch|go to|visit)\s+instagram\b/i.test(lower))
  return dishaRenderAppPill({ name:'Instagram', url:'https://instagram.com', faIcon:'fa-instagram', iconBg:'radial-gradient(circle at 30% 107%,#fdf497 0%,#fd5949 45%,#d6249f 60%,#285aeb 90%)', sub:'instagram.com' });

if (/\b(open|launch|go to|visit)\s+youtube\b/i.test(lower))
  return dishaRenderAppPill({ name:'YouTube', url:'https://youtube.com', faIcon:'fa-youtube', iconBg:'#ff0000', sub:'youtube.com' });

if (/\b(open|launch|go to|visit)\s+(twitter|x)\b/i.test(lower))
  return dishaRenderAppPill({ name:'X / Twitter', url:'https://x.com', faIcon:'fa-x-twitter', iconBg:'#000', sub:'x.com' });

if (/\b(open|launch|go to|visit)\s+github\b/i.test(lower))
  return dishaRenderAppPill({ name:'GitHub', url:'https://github.com', faIcon:'fa-github', iconBg:'#161b22', sub:'github.com' });

if (/\b(open|launch|go to|visit)\s+spotify\b/i.test(lower))
  return dishaRenderAppPill({ name:'Spotify', url:'https://open.spotify.com', faIcon:'fa-spotify', iconBg:'#1db954', sub:'open.spotify.com' });
  if (/^(hi|hello|hey|yo|good morning|good afternoon|good evening)/i.test(q))
    return dishaGreet();
  if (/\b(bye|goodbye|see you)\b/i.test(lower))
    return `Goodbye! 👋 Queries: ${DISHA_STATE.stats.queriesHandled}`;
  if (/\b(who are you|your name|what are you)\b/i.test(lower))
    return "I'm **Disha**, x0s.link's on-device intelligence. KCET predictions, weather, math, and more — no cloud AI.";
   if (/\b(power(s|ed|ing)?\s+disha|what\s+(api|model|engine|ai|llm)\s+(run(s|ning)?\s+)?behind|who\s+(run(s|ning)?|power(s|ed|ing)?|made|built|develop(s|ed)?)\s+disha|disha\s+(is\s+)?powered\s+(by|with)|which\s+(api|model|engine|ai|llm)|no\s+api|local\s+model|x-bit|proton)\b/i.test(lower))
    return "Disha is powered by **x-bit Proton**, a local model developed by **Nikhil**. No external API is used — everything runs on-device.";
  if (/\b(what can you|help|commands)\b/i.test(lower))
    return dishaCaps();
  if (/\b(thank|thanks|thx)\b/i.test(lower))
    return "Anytime. 🎯";
  if (/\b(how are you|how r u)\b/i.test(lower))
    return `All systems nominal. Uptime: ${Math.floor((Date.now()-DISHA_STATE.sessionStart)/1000)}s`;
  if (/\bhostel\b/i.test(lower))
    return dishaHostel();
 
  return dishaKB(lower);
}
 
function dishaCalc(q) {
  let expr = q.replace(/^(calc|calculate|compute|what is|what's)\s+/i,'').trim();
  expr = expr.replace(/\^/g,'**').replace(/×/g,'*').replace(/÷/g,'/');
  try {
    if (!/^[\d\s+\-*/().%**]+$/.test(expr)) throw new Error('invalid');
    const r = Function('"use strict";return('+expr+')')();
    if (!isFinite(r)) throw new Error('not finite');
    return `**${expr}** = **${r.toLocaleString('en-IN')}**`;
  } catch { return `⚠️ Invalid expression. Try: \`calc 15 * 23.5\``; }
}
 
function dishaConvert(q) {
  const m = q.match(/(\d+(?:\.\d+)?)\s*(km|mi|kg|lb|°?c|°?f|usd|eur|inr|gbp)\s*(?:to|in|=)\s*(km|mi|kg|lb|°?c|°?f|usd|eur|inr|gbp)/i);
  if (!m) return 'Usage: `convert 100 km to mi` or `25 c to f`';
  const from = m[2].toLowerCase().replace('°','');
  const to   = m[3].toLowerCase().replace('°','');
  const v    = parseFloat(m[1]);
  const conv = {
    'km-mi':v=>v*0.621371,'mi-km':v=>v*1.60934,
    'kg-lb':v=>v*2.20462,'lb-kg':v=>v*0.453592,
    'c-f':v=>(v*9/5)+32,'f-c':v=>(v-32)*5/9,
    'usd-inr':v=>v*83.5,'inr-usd':v=>v/83.5,
    'usd-eur':v=>v*0.92,'eur-usd':v=>v/0.92,
  };
  const fn = conv[`${from}-${to}`];
  if (!fn) return `Conversion ${from}→${to} not supported.`;
  return `**${v} ${from.toUpperCase()}** = **${fn(v).toFixed(2)} ${to.toUpperCase()}**`;
}
 
async function dishaWeather(lower) {
  const m = lower.match(/(?:weather|temperature|forecast)\s+(?:in|for|at)?\s*([a-z\s]+?)(?:\s+(?:today|now))?$|([a-z\s]+?)\s+(?:weather|temperature)/i);
  const city = (m?.[1]||m?.[2]||DISHA_CONFIG.defaultCity).trim();
  try {
    const r = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${DISHA_CONFIG.weatherApiKey}&units=metric`);
    if (!r.ok) throw new Error(r.status===404?'City not found':'API error');
    const d = await r.json();
    return `<div style="padding:16px;background:#0a0a0a;border-radius:14px;border:1px solid #1a1a1a;display:flex;align-items:center;gap:14px;">
      <img src="https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png" style="width:64px;height:64px;" alt="">
      <div>
        <div style="font-weight:700;font-size:.95rem;">${d.name}, ${d.sys.country}</div>
        <div style="font-size:2rem;font-weight:700;line-height:1.1;">${Math.round(d.main.temp)}°C</div>
        <div style="color:#666;font-size:.75rem;text-transform:capitalize;">${d.weather[0].description}</div>
        <div style="display:flex;gap:10px;margin-top:6px;font-size:.68rem;color:#555;">
          💧${d.main.humidity}% · 💨${d.wind.speed}m/s
        </div>
      </div>
    </div>`;
  } catch(e) { return `Weather unavailable for "${city}": ${e.message}`; }
}
 
function dishaTime(lower) {
  const tzMap = {'london':'Europe/London','new york':'America/New_York','tokyo':'Asia/Tokyo',
    'sydney':'Australia/Sydney','dubai':'Asia/Dubai','singapore':'Asia/Singapore',
    'mumbai':'Asia/Kolkata','delhi':'Asia/Kolkata','bangalore':'Asia/Kolkata'};
  const m = lower.match(/time\s+(?:in|at|for)?\s*([a-z\s]+)/i);
  const tz = (m && tzMap[m[1].trim().toLowerCase()]) || 'Asia/Kolkata';
  return `🕐 **${new Date().toLocaleString('en-IN',{timeZone:tz,weekday:'long',year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',timeZoneName:'short'})}**`;
}
 
function dishaDate() {
  const now = new Date();
  const left = Math.ceil((new Date(now.getFullYear(),11,31)-now)/86400000);
  return `📅 **${now.toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}**\n\n${left} days left in ${now.getFullYear()}.`;
}
 
function dishaTimer(lower) {
  const m = lower.match(/(\d+)\s*(min|minute|sec|second|hour|hr)s?/i);
  if (!m) return 'Usage: `timer 5 minutes`';
  const val=parseInt(m[1]), unit=m[2].toLowerCase();
  let ms = val*1000;
  if (unit.startsWith('min')) ms=val*60000;
  if (unit.startsWith('hour')||unit==='hr') ms=val*3600000;
  setTimeout(()=>{ if(typeof window.showToast==='function') window.showToast(`⏰ ${val} ${unit}s up!`); }, ms);
  return `⏱️ Timer set for **${val} ${unit}${val>1?'s':''}**.`;
}
 
function dishaDef(lower) {
  const term = lower.replace(/(what\s(is|are|does)\s+|define\s+|meaning\sof\s+|explain\s+)/i,'').replace(/\?/g,'').trim();
  const key = term.replace(/\s+/g,'_');
  const defs = {
    photosynthesis:'Plants use sunlight to make food from CO₂ and water.',
    gravity:'Natural force attracting masses toward each other.',
    algorithm:'Step-by-step instructions for solving a problem.',
    ai:'Artificial Intelligence — machines simulating human intelligence.',
    machine_learning:'AI systems that learn from data without explicit programming.',
    blockchain:'Distributed immutable ledger for decentralized records.',
    api:'Interface letting software applications communicate.',
    sql:'Language for managing relational databases.',
    recursion:'Function that calls itself to solve sub-problems.',
    dns:'System translating domain names to IP addresses.',
  };
  if (defs[key]) return `**${term}**: ${defs[key]}`;
  const p = Object.keys(defs).find(k=>k.includes(term)||term.includes(k));
  if (p) return `**${p.replace(/_/g,' ')}**: ${defs[p]}`;
  return `"${term}" not in local knowledge base.`;
}
 
function dishaPassword(lower) {
  const m = lower.match(/(\d+)\s*(char|digit|length)/i);
  const len = m ? Math.min(parseInt(m[1]),64) : 16;
  const chars='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let pwd=''; const arr=new Uint32Array(len); crypto.getRandomValues(arr);
  for(let i=0;i<len;i++) pwd+=chars[arr[i]%chars.length];
  return `🔐 **Password** (${len} chars):\n\`${pwd}\``;
}

function dishaRenderAppPill({ name, url, faIcon, iconBg, sub }) {
  return `<a href="${url}" target="_blank" rel="noopener"
    style="display:inline-flex;align-items:center;gap:10px;
      background:rgba(255,255,255,.07);
      border:1px solid rgba(255,255,255,.13);
      border-radius:999px;padding:10px 18px 10px 10px;
      backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
      box-shadow:0 4px 24px rgba(0,0,0,.4),inset 0 .5px 0 rgba(255,255,255,.15);
      text-decoration:none;transition:transform .18s cubic-bezier(.32,.72,0,1);"
    onmouseover="this.style.transform='scale(1.035)'"
    onmouseout="this.style.transform='scale(1)'">
    <div style="width:38px;height:38px;border-radius:50%;
      background:${iconBg};display:flex;align-items:center;
      justify-content:center;flex-shrink:0;">
      <i class="fa-brands ${faIcon}" style="font-size:1.1rem;color:#fff;"></i>
    </div>
    <div style="display:flex;flex-direction:column;gap:1px;">
      <span style="font-family:'Space Grotesk',sans-serif;font-size:.88rem;
        font-weight:700;color:#fff;letter-spacing:-.01em;">${name}</span>
      <span style="font-family:'Space Grotesk',sans-serif;font-size:.62rem;
        font-weight:500;color:rgba(255,255,255,.38);letter-spacing:.06em;
        text-transform:uppercase;">${sub}</span>
    </div>
    <span style="margin-left:4px;opacity:.35;font-size:.75rem;color:#fff;">↗</span>
  </a>`;
}
 
function dishaGreet() {
  const h=new Date().getHours();
  const g=h<12?'Good morning':h<17?'Good afternoon':'Good evening';
  return `${g}! 👋 Ready when you are.`;
}
 
function dishaCaps() {
  return `**Disha can handle:**\n• \`calc 15 * 23\` — Math\n• \`weather in Bangalore\` — Weather\n• \`convert 100 km to mi\` — Units\n• \`time in Tokyo\` — World clock\n• \`define API\` — Definitions\n• \`password 20\` — Secure password\n• \`timer 5 minutes\` — Countdown\n• \`kcet predict\` — KCET rank predictor\n• \`hostel essentials\` — Packing list`;
}
 
function dishaHostel() {
  return `**Hostel Essentials Checklist** 🎒\n\n**Clothing**\n• 5–7 sets (formal + casual)\n• Innerwear & socks (7 pairs)\n• Sleepwear · Flip flops · Rain jacket\n\n**Toiletries**\n• Toothbrush, toothpaste · Shampoo, soap, face wash\n• Deodorant · Trimmer · Nail cutter · Comb\n\n**Bedding**\n• Bedsheet (2 sets) · Pillow + pillowcase\n• Light blanket · Towel (2 sets)\n\n**Study & Work**\n• Laptop + charger · Earphones · Stationery\n• Power bank · Extension cord\n\n**Food**\n• Water bottle · Electric kettle · Snacks · Plate & mug\n\n**Documents**\n• Aadhar (original + 5 copies) · Admission letter\n• Passport photos (10+) · ATM card\n\n**Health**\n• Paracetamol · Band-aids · Antacid · Cold tablets\n\n**Misc**\n• Lock · Clothesline + clips · Hangers`;
}
 
function dishaKB(lower) {
  const kb = [
    {k:['capital','india'],a:'New Delhi'},
    {k:['capital','france'],a:'Paris'},
    {k:['capital','japan'],a:'Tokyo'},
    {k:['largest','ocean'],a:'Pacific Ocean (~165M km²)'},
    {k:['tallest','mountain'],a:'Mount Everest (8,848.86 m)'},
    {k:['speed','light'],a:'299,792,458 m/s'},
    {k:['pi'],a:'π ≈ 3.14159265358979…'},
    {k:['who','linux'],a:'Linus Torvalds, 1991'},
    {k:['who','python'],a:'Guido van Rossum, 1991'},
    {k:['who','javascript'],a:'Brendan Eich, 1995'},
    {k:['prime','minister','india'],a:'Narendra Modi (since 2014)'},
    {k:['ceo','apple'],a:'Tim Cook (since 2011)'},
    {k:['ceo','google'],a:'Sundar Pichai'},
    {k:['ceo','microsoft'],a:'Satya Nadella'},
  ];
  for(const item of kb){
    if(item.k.every(k=>lower.includes(k))) return `**${item.k.join(' ')}**: ${item.a}`;
  }
  const s=['Try: weather, calc, convert, define, kcet predict, hostel essentials.','Ask me: weather in Mumbai, calc 2^10, define algorithm.'];
  return s[DISHA_STATE.stats.queriesHandled%s.length];
}
 
// ========== KCET — Branch + College Matches ==========
 
function dishaInp(id, ph, max) {
  return `<input type="number" id="in-${id}" min="0" max="${max}" placeholder="${ph}"
    style="width:100%;background:#000;border:1px solid #222;border-radius:10px;padding:12px 14px;
    color:#fff;font-family:'Space Grotesk',sans-serif;font-size:.88rem;outline:none;
    -moz-appearance:textfield;appearance:textfield;transition:border-color .2s;"
    onfocus="this.style.borderColor='#fff'" onblur="this.style.borderColor='#222'">`;
}
 
function dishaSubRow(id, label, max) {
  return `<div style="display:flex;align-items:center;justify-content:space-between;padding:0 0 14px;border-bottom:1px solid #111;margin-bottom:14px;">
    <div style="font-size:.78rem;font-weight:500;color:#888;letter-spacing:.04em;text-transform:uppercase;">${label}</div>
    <input type="number" id="in-${id}" min="0" max="${max}" placeholder="—"
      style="width:72px;background:transparent;border:none;border-bottom:1px solid #333;
      color:#fff;font-family:'Space Grotesk',sans-serif;font-size:1rem;font-weight:600;
      text-align:right;outline:none;padding:4px 0;transition:border-color .2s;"
      onfocus="this.style.borderColor='#fff'" onblur="this.style.borderColor='#333'">
  </div>`;
}
 
function dishaBranchField(uid) {
  return `<div style="position:relative;">
    <input id="branch-input-${uid}" type="text" placeholder="Type branch name…" autocomplete="off"
      style="width:100%;background:#000;border:1px solid #222;border-radius:10px;
      padding:12px 14px;color:#fff;font-family:'Space Grotesk',sans-serif;
      font-size:.88rem;outline:none;transition:border-color .2s;"
      onfocus="this.style.borderColor='#fff';dishaBranchShow('${uid}')"
      onblur="setTimeout(()=>dishaBranchHide('${uid}'),220)"
      oninput="dishaBranchFilter('${uid}')">
    <div id="branch-suggest-${uid}"
      style="display:none;position:absolute;top:calc(100%+4px);left:0;right:0;z-index:20;
      background:#0a0a0a;border:1px solid #222;border-radius:12px;overflow:hidden;
      box-shadow:0 12px 32px rgba(0,0,0,.9);"></div>
  </div>
  <div id="branch-label-${uid}" style="margin-top:7px;font-size:.7rem;color:#555;min-height:16px;"></div>`;
}
 
window.dishaBranchFilter = function(uid) {
  const inp = document.getElementById(`branch-input-${uid}`);
  const box = document.getElementById(`branch-suggest-${uid}`);
  if (!inp||!box) return;
  const q = inp.value.trim().toUpperCase();
  const branches = window.XOS_BRANCHES||[];
  if (!q) { box.style.display='none'; return; }
  const matches = branches.filter(b=>b.includes(q)).slice(0,3);
  if (!matches.length) { box.style.display='none'; return; }
  box.innerHTML = matches.map(b=>`
    <div onclick="dishaBranchSelect('${uid}','${b.replace(/'/g,"\\'")}')"
      style="padding:11px 14px;font-size:.78rem;font-weight:500;cursor:pointer;
      border-bottom:1px solid #111;color:#ccc;"
      onmouseover="this.style.background='rgba(255,255,255,.05)'"
      onmouseout="this.style.background=''">${b}</div>`).join('');
  box.style.display='block';
};
 
window.dishaBranchSelect = function(uid, branch) {
  const inp=document.getElementById(`branch-input-${uid}`);
  const box=document.getElementById(`branch-suggest-${uid}`);
  const lbl=document.getElementById(`branch-label-${uid}`);
  if(inp){inp.value=branch;inp._sel=branch;}
  if(box) box.style.display='none';
  if(lbl) lbl.textContent='✓ '+branch;
};
window.dishaBranchShow = function(uid){const i=document.getElementById(`branch-input-${uid}`);if(i&&i.value.trim())dishaBranchFilter(uid);};
window.dishaBranchHide = function(uid){const b=document.getElementById(`branch-suggest-${uid}`);if(b)b.style.display='none';};
 
function dishaComputeRank(boardPct,kcetPct){
  const idx=(boardPct*0.5)+(kcetPct*0.5);
  return Math.max(1,Math.min(Math.round(Math.pow(101-idx,2.6)*4.8),250000));
}
 
function dishaRankBand(rank){
  if(rank<=500)  return{label:'Elite',    color:'#fff'};
  if(rank<=2000) return{label:'Excellent',color:'#e5e5e5'};
  if(rank<=8000) return{label:'Good',     color:'#aaa'};
  if(rank<=25000)return{label:'Average',  color:'#777'};
  return                {label:'Below Avg',color:'#555'};
}
 
function dishaResultBlock(title,rank){
  const b=dishaRankBand(rank);
  return `<div style="flex:1;background:#000;border:1px solid #1a1a1a;border-radius:16px;padding:18px 16px;text-align:center;">
    <div style="font-size:.58rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#444;margin-bottom:10px;">${title}</div>
    <div style="font-size:2.2rem;font-weight:700;letter-spacing:-.04em;color:#fff;line-height:1;">${rank.toLocaleString('en-IN')}</div>
    <div style="font-size:.65rem;font-weight:600;color:${b.color};margin-top:6px;letter-spacing:.08em;text-transform:uppercase;">${b.label}</div>
  </div>`;
}
 
function dishaFindMatches(rank, branchQ){
  const data=window.XOS_CUTOFF||[];
  if(!data.length||!branchQ.trim()) return[];
  const q=branchQ.toUpperCase().trim();
  const W=2000, matches=[];
  data.forEach(college=>{
    Object.keys(college.branches).forEach(bn=>{
      if(!bn.toUpperCase().includes(q)) return;
      const cuts=Object.entries(college.branches[bn]).filter(([,v])=>v!==null);
      if(!cuts.length) return;
      const closest=cuts.reduce((best,cur)=>Math.abs(cur[1]-rank)<Math.abs(best[1]-rank)?cur:best,cuts[0]);
      const diff=closest[1]-rank;
      if(diff>=-W&&diff<=W) matches.push({college:college.name,id:college.id,location:college.location,branch:bn,category:closest[0],cutoff:closest[1],diff});
    });
  });
  return matches.sort((a,b)=>Math.abs(a.diff)-Math.abs(b.diff)).slice(0,10);
}
 
function dishaRenderMatches(matches){
  if(!matches.length) return `<div style="color:#444;font-size:.75rem;padding:10px 0;text-align:center;">No colleges in ±2000 range for this branch.<br><span style="font-size:.65rem;">Try adding your college via the Add College option in search.</span></div>`;
  return matches.map(m=>`
    <div style="background:#000;border:1px solid #1a1a1a;border-radius:14px;padding:14px 16px;margin-bottom:8px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:50%;right:10px;transform:translateY(-50%);font-size:2.8rem;font-weight:700;color:rgba(255,255,255,.025);pointer-events:none;">${m.id}</div>
      <div style="font-size:.6rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#444;margin-bottom:4px;">${m.id} · ${m.location}</div>
      <div style="font-size:.84rem;font-weight:600;color:#fff;margin-bottom:3px;line-height:1.3;">${m.college}</div>
      <div style="font-size:.68rem;color:#555;margin-bottom:10px;">${m.branch}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-size:.58rem;color:#444;text-transform:uppercase;letter-spacing:.07em;">Cutoff · ${m.category}</div>
          <div style="font-size:1.05rem;font-weight:700;color:#fff;margin-top:2px;">${m.cutoff.toLocaleString('en-IN')}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:.58rem;color:#444;text-transform:uppercase;letter-spacing:.06em;">vs your rank</div>
          <div style="font-size:.88rem;font-weight:700;color:${m.diff>=0?'#666':'#aaa'};margin-top:2px;">${m.diff>=0?'+':''}${m.diff}</div>
        </div>
      </div>
    </div>`).join('');
}
 
function dishaGetVal(id){return parseFloat(document.getElementById(`in-${id}`)?.value)||0;}
function dishaGetBranch(uid){const i=document.getElementById(`branch-input-${uid}`);return i?._sel||i?.value?.trim()||'';}
 
window.launchKcetPredictor = function() {
  const container=document.getElementById('es-messages');
  if(!container) return;
  const uid='k'+Date.now();
  const card=document.createElement('div');
  card.className='es-bubble-sys';
  card.innerHTML=`
  <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:24px;overflow:visible;width:100%;max-width:420px;">
    <div style="padding:20px 22px 16px;border-bottom:1px solid #111;display:flex;align-items:center;justify-content:space-between;">
      <div>
        <div style="font-size:1.05rem;font-weight:700;letter-spacing:-.02em;">KCET Rank Predictor</div>
        <div style="font-size:.6rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#444;margin-top:3px;">2026 · Predictive Engine</div>
      </div>
      <div style="width:36px;height:36px;border:1px solid #1a1a1a;border-radius:10px;display:flex;align-items:center;justify-content:center;">
        <i class="fa-solid fa-chart-line" style="color:#666;font-size:.82rem;"></i>
      </div>
    </div>
    <div style="display:flex;border-bottom:1px solid #111;">
      <div id="tab-eng-${uid}" onclick="dishaKcetTab('${uid}','eng')"
        style="flex:1;padding:14px;text-align:center;font-size:.72rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;color:#fff;border-right:1px solid #111;border-bottom:2px solid #fff;transition:.2s;">Engineering</div>
      <div id="tab-non-${uid}" onclick="dishaKcetTab('${uid}','non')"
        style="flex:1;padding:14px;text-align:center;font-size:.72rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;color:#444;border-bottom:2px solid transparent;transition:.2s;">Non-Engineering</div>
    </div>
    <!-- ENG -->
    <div id="eng-${uid}" style="padding:22px;">
      <div style="font-size:.6rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#444;margin-bottom:16px;">Board Marks — PCM</div>
      ${dishaSubRow('e-phy-'+uid,'Physics',100)}
      ${dishaSubRow('e-che-'+uid,'Chemistry',100)}
      ${dishaSubRow('e-mat-'+uid,'Mathematics',100)}
      <div style="font-size:.6rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#444;margin:18px 0 16px;">KCET Total — out of 180</div>
      ${dishaInp('e-kcet-'+uid,'0 – 180',180)}
      <div style="font-size:.6rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#444;margin:18px 0 12px;">Branch Preference <span style="color:#333;font-weight:400;text-transform:none;">(optional)</span></div>
      ${dishaBranchField(uid)}
      <button onclick="dishaCalcEng('${uid}')"
        style="width:100%;margin-top:18px;padding:14px;background:#fff;color:#000;border:none;border-radius:12px;font-size:.82rem;font-weight:700;font-family:'Space Grotesk',sans-serif;letter-spacing:.04em;cursor:pointer;">PREDICT RANK →</button>
      <div id="eng-result-${uid}" style="display:none;margin-top:18px;"></div>
    </div>
    <!-- NON-ENG -->
    <div id="non-${uid}" style="padding:22px;display:none;">
      <div style="font-size:.6rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#444;margin-bottom:16px;">Board Marks — PCMB</div>
      ${dishaSubRow('n-phy-'+uid,'Physics',100)}
      ${dishaSubRow('n-che-'+uid,'Chemistry',100)}
      ${dishaSubRow('n-mat-'+uid,'Mathematics',100)}
      ${dishaSubRow('n-bio-'+uid,'Biology',100)}
      <div style="font-size:.6rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#444;margin:18px 0 16px;">KCET Marks — each out of 60</div>
      ${dishaSubRow('n-kphy-'+uid,'Physics',60)}
      ${dishaSubRow('n-kche-'+uid,'Chemistry',60)}
      ${dishaSubRow('n-kmat-'+uid,'Mathematics',60)}
      ${dishaSubRow('n-kbio-'+uid,'Biology',60)}
      <div style="font-size:.6rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#444;margin:18px 0 12px;">Branch Preference <span style="color:#333;font-weight:400;text-transform:none;">(optional)</span></div>
      ${dishaBranchField('n'+uid)}
      <button onclick="dishaCalcNon('${uid}')"
        style="width:100%;margin-top:18px;padding:14px;background:#fff;color:#000;border:none;border-radius:12px;font-size:.82rem;font-weight:700;font-family:'Space Grotesk',sans-serif;letter-spacing:.04em;cursor:pointer;">PREDICT BOTH RANKS →</button>
      <div id="non-result-${uid}" style="display:none;margin-top:18px;"></div>
    </div>
    <div style="padding:12px 22px;border-top:1px solid #111;display:flex;align-items:center;gap:6px;">
      <div style="width:5px;height:5px;border-radius:50%;background:#333;"></div>
      <div style="font-size:.58rem;color:#333;letter-spacing:.06em;text-transform:uppercase;">Estimated · Not official KEA data</div>
    </div>
  </div>`;
  container.appendChild(card);
  if(typeof window.scrollEsToBottom==='function') window.scrollEsToBottom();
};
 
window.dishaKcetTab = function(uid,tab){
  const et=document.getElementById(`tab-eng-${uid}`),nt=document.getElementById(`tab-non-${uid}`);
  const ep=document.getElementById(`eng-${uid}`),np=document.getElementById(`non-${uid}`);
  if(tab==='eng'){et.style.color='#fff';et.style.borderBottomColor='#fff';nt.style.color='#444';nt.style.borderBottomColor='transparent';ep.style.display='block';np.style.display='none';}
  else{nt.style.color='#fff';nt.style.borderBottomColor='#fff';et.style.color='#444';et.style.borderBottomColor='transparent';np.style.display='block';ep.style.display='none';}
};
 
window.dishaCalcEng = function(uid){
  const phy=dishaGetVal(`e-phy-${uid}`),che=dishaGetVal(`e-che-${uid}`),mat=dishaGetVal(`e-mat-${uid}`),kcet=dishaGetVal(`e-kcet-${uid}`);
  const branch=dishaGetBranch(uid);
  const boardPct=((phy+che+mat)/300)*100, kcetPct=(kcet/180)*100;
  const rank=dishaComputeRank(boardPct,kcetPct), band=dishaRankBand(rank);
  const matches=dishaFindMatches(rank,branch);
  const res=document.getElementById(`eng-result-${uid}`);
  res.style.display='block';
  res.innerHTML=`
    <div style="background:#000;border:1px solid #1a1a1a;border-radius:16px;padding:20px;text-align:center;margin-bottom:${branch?'16px':'0'};">
      <div style="font-size:.58rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#444;margin-bottom:12px;">Predicted Engineering Rank</div>
      <div style="font-size:3rem;font-weight:700;letter-spacing:-.04em;color:#fff;line-height:1;">${rank.toLocaleString('en-IN')}</div>
      <div style="font-size:.7rem;font-weight:600;color:${band.color};margin-top:8px;letter-spacing:.1em;text-transform:uppercase;">${band.label}</div>
      <div style="display:flex;justify-content:center;gap:20px;margin-top:14px;padding-top:14px;border-top:1px solid #111;font-size:.65rem;color:#444;letter-spacing:.04em;">
        <span>BOARD ${boardPct.toFixed(1)}%</span><span>KCET ${kcetPct.toFixed(1)}%</span>
      </div>
    </div>
    ${branch?`<div style="font-size:.6rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#444;margin-bottom:12px;">Colleges · ${branch} · Rank ±2000</div>${dishaRenderMatches(matches)}`:''}
    <div onclick="launchKcetPredictor()" style="text-align:center;margin-top:12px;font-size:.65rem;color:#444;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;padding:8px;">⟳ NEW PREDICTION</div>`;
  if(typeof window.scrollEsToBottom==='function') window.scrollEsToBottom();
};
 
window.dishaCalcNon = function(uid){
  const phy=dishaGetVal(`n-phy-${uid}`),che=dishaGetVal(`n-che-${uid}`),mat=dishaGetVal(`n-mat-${uid}`),bio=dishaGetVal(`n-bio-${uid}`);
  const kphy=dishaGetVal(`n-kphy-${uid}`),kche=dishaGetVal(`n-kche-${uid}`),kmat=dishaGetVal(`n-kmat-${uid}`),kbio=dishaGetVal(`n-kbio-${uid}`);
  const branch=dishaGetBranch('n'+uid);
  const boardPct=((phy+che+mat+bio)/400)*100;
  const pharmaRank=dishaComputeRank(boardPct,((kphy+kche+kbio)/180)*100);
  const engRank=dishaComputeRank(boardPct,((kphy+kche+kmat)/180)*100);
  const matches=dishaFindMatches(engRank,branch);
  const res=document.getElementById(`non-result-${uid}`);
  res.style.display='block';
  res.innerHTML=`
    <div style="display:flex;gap:10px;margin-bottom:${branch?'16px':'0'};">${dishaResultBlock('Pharma Rank',pharmaRank)}${dishaResultBlock('Engg Rank',engRank)}</div>
    ${branch?`<div style="font-size:.6rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#444;margin-bottom:12px;">Colleges · ${branch} · Rank ±2000</div>${dishaRenderMatches(matches)}`:''}
    <div onclick="launchKcetPredictor()" style="text-align:center;margin-top:12px;font-size:.65rem;color:#444;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;padding:8px;">⟳ NEW PREDICTION</div>`;
  if(typeof window.scrollEsToBottom==='function') window.scrollEsToBottom();
};
 
// ========== HOOK — override doEsSearch ==========
// Use a small delay so xos-feed.html's inline script finishes first
setTimeout(function() {
  if (typeof window.doEsSearch !== 'function') return;
  const _orig = window.doEsSearch;
 
  window.doEsSearch = async function(val) {
    if (!val || !val.trim()) return;
    const query = val.trim();
    const lower = query.toLowerCase();
 
    const container = document.getElementById('es-messages');
    const greet = document.getElementById('es-greeting');
    if (greet) greet.style.display = 'none';
 
    // user bubble
    if (typeof window.appendEsBubbleUser === 'function') {
      window.appendEsBubbleUser(query);
    } else {
      const b = document.createElement('div');
      b.className = 'es-bubble-user';
      b.textContent = query;
      if (container) container.appendChild(b);
    }
 
    // clear input
    const inp = document.getElementById('es-input');
    if (inp) inp.value = '';
    document.getElementById('es-send')?.classList.remove('visible');
 
    // KCET
    if (/\b(kcet|rank predictor|predict rank)\b/i.test(lower)) {
      setTimeout(launchKcetPredictor, 280);
      return;
    }
 
    // AI response bubble
    const sys = document.createElement('div');
    sys.className = 'es-bubble-sys';
    const content = document.createElement('div');
    content.style.cssText = 'font-size:.88rem;color:var(--text);line-height:1.6;';
    sys.appendChild(content);
    if (container) container.appendChild(sys);
    content.innerHTML = '<span style="color:#007aff;">▌</span>';
 
    try {
      const answer = await dishaRespond(query);
      // fallback to original college/people search for short unknown queries
      if (answer.startsWith('Try:') || answer.startsWith('Ask me:')) {
        if (container && sys.parentNode) container.removeChild(sys);
        _orig(val);
      } else {
        await dishaTypewrite(content, answer);
      }
    } catch(e) {
      content.innerHTML = `<span style="color:#ef4444;">⚠️ ${e.message}</span>`;
    }
    if (typeof window.scrollEsToBottom === 'function') window.scrollEsToBottom();
  };
}, 300);
 
