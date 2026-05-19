/**
 * x0s.link – Disha Intelligence Extensions Module
 * KCET Predictor: Pill Toggle + Dual Input (subject-wise OR total)
 */
(function () {
  'use strict';

  const CONFIG = { weatherApiKey: '0222762e4fd7dc746123423914f0dca7', defaultCity: 'Mumbai', typingSpeed: 12, maxHistory: 50 };
  const State = { history: [], context: { lastCity: null, lastTopic: null, lastIntent: null, lastQuery: null, sessionStart: Date.now() }, stats: { queriesHandled: 0, mathSolved: 0, weatherFetched: 0 } };

  const LocalAI = {
    async respond(query) {
      const q = query.trim(); if (!q) return "I didn't catch that. Could you repeat?";
      const lower = q.toLowerCase(); State.stats.queriesHandled++; State.history.push({ query: q, time: Date.now() });
      if (State.history.length > CONFIG.maxHistory) State.history.shift();
      const intents = [
        { name: 'calculator', patterns: [/^(calc|calculate|compute|solve|eval)\s+/i, /^[\d\s+\-*/().^%]+$/, /^(what is|what's)\s+[\d\s+\-*/().^%]+/i], priority: 10 },
        { name: 'converter', patterns: [/\b(convert|conversion)\b/i, /\b(\d+\s*(km|mi|kg|lb|°c|°f|c|f|usd|eur|inr|gbp))\b/i], priority: 9 },
        { name: 'weather', patterns: [/\b(weather|temperature|forecast|humidity)\b/i], priority: 9 },
        { name: 'time', patterns: [/\b(time|clock)\s+(in|at|for)\b/i, /\bwhat\s+time\b/i], priority: 8 },
        { name: 'date', patterns: [/\b(date|today|day|what day)\b/i], priority: 8 },
        { name: 'timer', patterns: [/\b(timer|countdown|set a timer|remind me in)\b/i], priority: 8 },
        { name: 'definition', patterns: [/\b(define|definition|meaning of|what is|what are|explain)\b/i], priority: 7 },
        { name: 'password', patterns: [/\b(password|generate password|strong password)\b/i], priority: 5 },
        { name: 'uuid', patterns: [/\b(uuid|guid|generate id)\b/i], priority: 5 },
        { name: 'greeting', patterns: [/^(hi|hello|hey|yo|good\s(morning|afternoon|evening))/i], priority: 1 },
        { name: 'farewell', patterns: [/\b(bye|goodbye|see\syou|tata)\b/i], priority: 1 },
        { name: 'who_are_you', patterns: [/\b(who\s(are|r)\s?(you|u)|your\sname)\b/i], priority: 1 },
        { name: 'what_can_you_do', patterns: [/\b(what\s(can|do)\s(you|u)\s(do|help)|abilities|features)\b/i], priority: 1 },
        { name: 'creator', patterns: [/\b(who\s(created|made|built)\s?(you|u))\b/i], priority: 1 },
        { name: 'thanks', patterns: [/\b(thanks|thank\s?(you|u)|thx|ty)\b/i], priority: 1 },
        { name: 'how_are_you', patterns: [/\b(how\s(are|r)\s?(you|u)|what'?s\sup)\b/i], priority: 1 },
        { name: 'general', patterns: [/.*/], priority: 0 }
      ];
      let bestMatch = null, bestScore = -1;
      for (const intent of intents) { for (const pattern of intent.patterns) { if (pattern.test(lower)) { const score = intent.priority * 10 + (pattern.source.length > 5 ? 5 : 0); if (score > bestScore) { bestScore = score; bestMatch = intent.name; } } } }
      State.context.lastIntent = bestMatch; State.context.lastQuery = q;
      switch (bestMatch) {
        case 'calculator': return this.handleCalculator(q, lower);
        case 'converter': return this.handleConverter(q, lower);
        case 'weather': return await this.getWeatherReport(lower);
        case 'time': return this.handleTime(lower);
        case 'date': return this.handleDate();
        case 'timer': return this.handleTimer(lower);
        case 'definition': return this.handleDefinition(lower);
        case 'password': return this.generatePassword(lower);
        case 'uuid': return this.generateUUID();
        case 'greeting': return this.respondGreeting();
        case 'farewell': return this.respondFarewell();
        case 'who_are_you': return this.respondIdentity();
        case 'what_can_you_do': return this.respondCapabilities();
        case 'creator': return this.respondCreator();
        case 'thanks': return this.respondThanks();
        case 'how_are_you': return this.respondStatus();
        default: return this.respondGeneralKnowledge(lower);
      }
    },
    handleCalculator(query, lower) { State.stats.mathSolved++; let expr = query.replace(/^(calc|calculate|compute|solve|eval|what is|what's)\s+/i, '').trim(); expr = expr.replace(/\^/g, '**').replace(/×/g, '*').replace(/÷/g, '/'); try { if (!/^[\d\s+\-*/().%^]+$/.test(expr)) throw new Error('Invalid'); const result = Function('"use strict"; return (' + expr + ')')(); if (!isFinite(result)) throw new Error('Not finite'); return `**${expr}** = **${result.toLocaleString('en-IN')}**`; } catch (e) { return `⚠️ Invalid expression. Try: \`calc 15 * 23.5\``; } },
    handleConverter(query, lower) { const match = query.match(/(\d+(?:\.\d+)?)\s*(km|mi|kg|lb|°c|°f|c|f|usd|eur|inr|gbp)\s*(?:to|in|=)\s*(km|mi|kg|lb|°c|°f|c|f|usd|eur|inr|gbp)/i); if (match) return this.convertUnits(parseFloat(match[1]), match[2], match[3]); return "Usage: `convert 100 km to mi` or `25 °c to f`"; },
    convertUnits(value, from, to) { from = from.toLowerCase().replace('°',''); to = to.toLowerCase().replace('°',''); const conv = { 'km-mi': v=>v*0.621371,'mi-km': v=>v*1.60934,'kg-lb': v=>v*2.20462,'lb-kg': v=>v*0.453592,'c-f': v=>(v*9/5)+32,'f-c': v=>(v-32)*5/9,'usd-inr': v=>v*83.5,'inr-usd': v=>v/83.5 }; const key = `${from}-${to}`; if (conv[key]) return `**${value} ${from.toUpperCase()}** = **${conv[key](value).toFixed(2)} ${to.toUpperCase()}**`; return `Conversion from ${from} to ${to} not supported.`; },
    async getWeatherReport(query) { const m = query.match(/(?:weather|temperature|forecast)\s+(?:in|for|at)?\s*([a-zA-Z\s]+?)(?:\s+(?:today|now))?$|([a-zA-Z\s]+?)\s+(?:weather|temperature)/i); let city = (m?.[1] || m?.[2] || State.context.lastCity || CONFIG.defaultCity).trim(); State.context.lastCity = city; try { const r = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${CONFIG.weatherApiKey}&units=metric`); if (!r.ok) throw new Error(r.status === 404 ? 'City not found' : 'API error'); const d = await r.json(); const sunrise = new Date(d.sys.sunrise * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); const sunset = new Date(d.sys.sunset * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); return `<div style="padding:16px;background:#0a0a0a;border-radius:14px;border:1px solid #1a1a1a;display:flex;align-items:center;gap:14px;"><img src="https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png" style="width:64px;height:64px;" alt=""><div><div style="font-weight:700;font-size:.95rem;">${d.name}, ${d.sys.country}</div><div style="font-size:2rem;font-weight:700;line-height:1.1;">${Math.round(d.main.temp)}°C</div><div style="color:#666;font-size:.75rem;text-transform:capitalize;">${d.weather[0].description}</div><div style="display:flex;gap:12px;margin-top:8px;font-size:.7rem;color:#555;">💧${d.main.humidity}% · 💨${d.wind.speed}m/s · 🌅${sunrise} · 🌇${sunset}</div></div></div>`; } catch (e) { return `Weather unavailable for "${city}": ${e.message}`; } },
    handleTime(query) { const m = query.match(/time\s+(?:in|at|for)?\s*([a-zA-Z\s]+)/i); const tzMap = { 'london':'Europe/London','new york':'America/New_York','tokyo':'Asia/Tokyo','sydney':'Australia/Sydney','dubai':'Asia/Dubai','singapore':'Asia/Singapore','mumbai':'Asia/Kolkata','delhi':'Asia/Kolkata','bangalore':'Asia/Kolkata' }; let tz = 'Asia/Kolkata'; if (m) tz = tzMap[m[1].trim().toLowerCase()] || tz; return `🕐 **${new Date().toLocaleString('en-IN', { timeZone: tz, weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit', timeZoneName:'short' })}**`; },
    handleDate() { const now = new Date(); const daysLeft = Math.ceil((new Date(now.getFullYear(), 11, 31) - now) / 86400000); return `📅 **${now.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}**\n\n${daysLeft} days remaining in ${now.getFullYear()}.`; },
    handleTimer(query) { const m = query.match(/(\d+)\s*(min|minute|sec|second|hour|hr)s?/i); if (m) { const val = parseInt(m[1]), unit = m[2].toLowerCase(); let ms = val * 1000; if (unit.startsWith('min')) ms = val * 60000; if (unit.startsWith('hour') || unit === 'hr') ms = val * 3600000; setTimeout(() => { if (typeof window.notifyUser === 'function') window.notifyUser(`⏰ ${val} ${unit}s up!`); }, ms); return `⏱️ Timer set for **${val} ${unit}${val > 1 ? 's' : ''}**.`; } return "Usage: `timer 5 minutes`"; },
    handleDefinition(query) { let term = query.replace(/(what\s(is|are|does)\s+|define\s+|meaning\sof\s+|explain\s+)/i,'').replace(/\?/g,'').trim().toLowerCase(); const key = term.replace(/\s+/g,'_'); const defs = { photosynthesis:'Plants use sunlight to make food from CO₂ and water.', gravity:'Natural force attracting masses toward each other.', algorithm:'Step-by-step instructions for solving a problem.', ai:'Artificial Intelligence — machines simulating human intelligence.', machine_learning:'AI systems that learn from data without explicit programming.', blockchain:'Distributed immutable ledger for decentralized records.', api:'Interface that lets software applications communicate.', sql:'Language for managing relational databases.', recursion:'Function that calls itself to solve sub-problems.', dns:'System translating domain names to IP addresses.' }; if (defs[key]) return `**${term}**: ${defs[key]}`; const partial = Object.keys(defs).find(k => k.includes(term) || term.includes(k)); if (partial) return `**${partial.replace(/_/g,' ')}**: ${defs[partial]}`; return `"${term}" not in local knowledge base.`; },
    generatePassword(query) { const m = query.match(/(\d+)\s*(char|digit|length)/i); const length = m ? Math.min(parseInt(m[1]), 64) : 16; const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'; let pwd = ''; const arr = new Uint32Array(length); crypto.getRandomValues(arr); for (let i = 0; i < length; i++) pwd += chars[arr[i] % chars.length]; return `🔐 **Password** (${length} chars):\n\`${pwd}\``; },
    generateUUID() { return `🆔 **UUID v4**:\n\`${crypto.randomUUID()}\``; },
    respondGreeting() { const h = new Date().getHours(); const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; return `${g}! 👋 Ready when you are.`; },
    respondFarewell() { return `Goodbye! 👋 Queries handled: ${State.stats.queriesHandled}.`; },
    respondIdentity() { return "I'm **Disha**, your on-device intelligence layer for x0s.link. Math, weather, KCET predictions, and more — no cloud AI."; },
    respondCapabilities() { return `**Disha can handle:**\n• \`calc 15 * 23\` — Math\n• \`weather in Bangalore\` — Live weather\n• \`convert 100 km to mi\` — Units\n• \`time in Tokyo\` — World clock\n• \`define API\` — Definitions\n• \`password 20\` — Secure password\n• \`timer 5 minutes\` — Countdown\n• \`kcet predict\` — KCET rank predictor`; },
    respondCreator() { return "Built by the x0s.link team. Runs entirely in your browser."; },
    respondThanks() { return "Anytime. 🎯"; },
    respondStatus() { return `All systems nominal. Uptime: ${Math.floor((Date.now() - State.context.sessionStart) / 1000)}s.`; },
    respondGeneralKnowledge(lower) { const kb = [ { keys:['capital','india'], answer:'New Delhi' }, { keys:['capital','france'], answer:'Paris' }, { keys:['capital','japan'], answer:'Tokyo' }, { keys:['largest','ocean'], answer:'Pacific Ocean (~165M km²)' }, { keys:['tallest','mountain'], answer:'Mount Everest (8,848.86 m)' }, { keys:['speed','light'], answer:'299,792,458 m/s' }, { keys:['pi'], answer:'π ≈ 3.14159265358979…' }, { keys:['who','linux'], answer:'Linus Torvalds, 1991' }, { keys:['who','python'], answer:'Guido van Rossum, 1991' }, { keys:['who','javascript'], answer:'Brendan Eich, 1995' }, { keys:['prime','minister','india'], answer:'Narendra Modi (since 2014)' }, { keys:['ceo','apple'], answer:'Tim Cook (since 2011)' }, { keys:['ceo','google'], answer:'Sundar Pichai' }, { keys:['ceo','microsoft'], answer:'Satya Nadella' }, ]; for (const item of kb) { if (item.keys.every(k => lower.includes(k))) return `**${item.keys.join(' ')}**: ${item.answer}`; } const s = ['Try: weather, calc, convert, define, kcet predict, password.','Ask me: weather in Mumbai, calc 2^10, define algorithm.','Not in local DB. Try a specific command.']; return s[State.stats.queriesHandled % s.length]; }
  };

  function simpleMarkdown(md) { return md.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/`(.*?)`/g, '<code style="background:#111;padding:2px 7px;border-radius:5px;color:#fff;font-family:monospace;font-size:.88em;border:1px solid #1a1a1a;">$1</code>').replace(/\n/g, '<br>'); }
  async function typewriteText(container, text) { container.innerHTML = ''; const isHtml = text.trim().startsWith('<'); if (isHtml) { container.innerHTML = text; return; } let i = 0; return new Promise(resolve => { function type() { if (i < text.length) { container.innerHTML = simpleMarkdown(text.substring(0, i + 1)) + '<span style="color:#007aff;animation:blink 1s infinite;">▌</span>'; i++; setTimeout(type, CONFIG.typingSpeed + Math.random() * 8); if (typeof window.scrollEsToBottom === 'function') window.scrollEsToBottom(); } else { container.innerHTML = simpleMarkdown(text); resolve(); } } type(); }); }

  function pillInput(id, icon, label, max, uid, oninput = '') { return `<div style="background:#000;border:1px solid #1a1a1a;border-radius:16px;padding:14px 16px;margin-bottom:10px;display:flex;align-items:center;gap:12px;"><div style="width:32px;height:32px;border:1px solid #222;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="${icon}" style="color:#666;font-size:.9rem;"></i></div><div style="flex:1;font-size:.82rem;font-weight:500;color:#ccc;">${label}</div><input type="number" id="in-${id}-${uid}" min="0" max="${max}" placeholder="00" style="width:60px;background:transparent;border:none;color:#fff;font-family:'Space Grotesk',sans-serif;font-size:1rem;font-weight:700;text-align:right;outline:none;-moz-appearance:textfield;appearance:textfield;" ${oninput ? `oninput="${oninput}"` : ''}><div style="font-size:.75rem;color:#444;font-weight:600;">/${max}</div></div>`; }
  function computeRank(boardPct, kcetPct) { const index = (boardPct * 0.5) + (kcetPct * 0.5); let rank = Math.round(Math.pow(101 - index, 2.6) * 4.8); return Math.max(1, Math.min(rank, 250000)); }
  function rankBand(rank) { if (rank <= 500) return { label:'Elite', color:'#fff' }; if (rank <= 2000) return { label:'Excellent', color:'#e5e5e5' }; if (rank <= 8000) return { label:'Good', color:'#aaa' }; if (rank <= 25000) return { label:'Average', color:'#777' }; return { label:'Below Avg', color:'#555' }; }
  function resultBlock(title, rank, boardPct, kcetPct) { const band = rankBand(rank); return `<div style="flex:1;background:#000;border:1px solid #1a1a1a;border-radius:16px;padding:18px 16px;text-align:center;"><div style="font-size:.58rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#444;margin-bottom:10px;">${title}</div><div style="font-size:2.2rem;font-weight:700;letter-spacing:-.04em;color:#fff;line-height:1;">${rank.toLocaleString('en-IN')}</div><div style="font-size:.65rem;font-weight:600;color:${band.color};margin-top:6px;letter-spacing:.08em;text-transform:uppercase;">${band.label}</div><div style="margin-top:10px;padding-top:10px;border-top:1px solid #111;font-size:.6rem;color:#444;">Board ${boardPct.toFixed(1)}% · KCET ${kcetPct.toFixed(1)}%</div></div>`; }

  function launchKcetPredictor() {
    const container = document.getElementById('es-messages'); if (!container) return; const uid = 'k' + Date.now();
    const card = document.createElement('div'); card.className = 'es-bubble-sys';
    card.innerHTML = `<div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:24px;overflow:hidden;width:100%;max-width:420px;">
      <div style="padding:20px 22px 16px;border-bottom:1px solid #111;"><div style="display:flex;align-items:center;gap:12px;"><div style="width:42px;height:42px;border:1px solid #1a1a1a;border-radius:12px;display:flex;align-items:center;justify-content:center;"><i class="fa-solid fa-chart-line" style="color:#666;font-size:1rem;"></i></div><div><div style="font-size:1.05rem;font-weight:700;letter-spacing:-.02em;">KCET Rank Engine</div><div style="font-size:.6rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#444;margin-top:2px;">PREDICTIVE MATRIX // 2026</div></div></div></div>
      <div style="padding:18px 22px 0;"><div style="background:#000;border:1px solid #1a1a1a;border-radius:14px;padding:4px;display:flex;gap:4px;"><div id="tab-eng-${uid}" onclick="switchKcetTab('${uid}','eng')" style="flex:1;padding:10px;text-align:center;font-size:.78rem;font-weight:700;letter-spacing:.02em;cursor:pointer;background:#fff;color:#000;border-radius:10px;transition:all .2s;">Engineering</div><div id="tab-non-${uid}" onclick="switchKcetTab('${uid}','non')" style="flex:1;padding:10px;text-align:center;font-size:.78rem;font-weight:700;letter-spacing:.02em;cursor:pointer;color:#666;border-radius:10px;transition:all .2s;">Non-Engineering</div></div></div>
      <div id="eng-${uid}" style="padding:18px 22px 22px;">${pillInput('e-mat','fa-solid fa-square-root-variable','Maths',100,uid,`updateEngTotal('${uid}')`)}${pillInput('e-phy','fa-solid fa-atom','Physics',100,uid,`updateEngTotal('${uid}')`)}${pillInput('e-che','fa-solid fa-flask','Chemistry',100,uid,`updateEngTotal('${uid}')`)}<div style="display:flex;align-items:center;gap:12px;margin:16px 0;"><div style="flex:1;height:1px;background:#111;"></div><div style="font-size:.6rem;font-weight:700;color:#333;letter-spacing:.1em;">OR</div><div style="flex:1;height:1px;background:#111;"></div></div>${pillInput('e-agg','fa-solid fa-layer-group','Total Aggregate',300,uid,`updateEngSubjects('${uid}')`)}<div style="font-size:.6rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#444;margin:18px 0 10px;">KCET Marks — out of 180</div><div style="background:#000;border:1px solid #1a1a1a;border-radius:16px;padding:14px 16px;"><input type="number" id="in-e-kcet-${uid}" min="0" max="180" placeholder="000" style="width:100%;background:transparent;border:none;color:#fff;font-family:'Space Grotesk',sans-serif;font-size:1.1rem;font-weight:700;text-align:center;outline:none;-moz-appearance:textfield;appearance:textfield;"></div><button onclick="calcEng('${uid}')" style="width:100%;margin-top:18px;padding:16px;background:#fff;color:#000;border:none;border-radius:14px;font-size:.85rem;font-weight:700;font-family:'Space Grotesk',sans-serif;letter-spacing:.04em;cursor:pointer;transition:opacity .18s;" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">Get Prediction</button><div id="eng-result-${uid}" style="display:none;margin-top:18px;"></div></div>
      <div id="non-${uid}" style="padding:18px 22px 22px;display:none;">${pillInput('n-mat','fa-solid fa-square-root-variable','Maths',100,uid,`updateNonTotal('${uid}')`)}${pillInput('n-phy','fa-solid fa-atom','Physics',100,uid,`updateNonTotal('${uid}')`)}${pillInput('n-che','fa-solid fa-flask','Chemistry',100,uid,`updateNonTotal('${uid}')`)}${pillInput('n-bio','fa-solid fa-dna','Biology',100,uid,`updateNonTotal('${uid}')`)}<div style="display:flex;align-items:center;gap:12px;margin:16px 0;"><div style="flex:1;height:1px;background:#111;"></div><div style="font-size:.6rem;font-weight:700;color:#333;letter-spacing:.1em;">OR</div><div style="flex:1;height:1px;background:#111;"></div></div>${pillInput('n-agg','fa-solid fa-layer-group','Total Aggregate',400,uid,`updateNonSubjects('${uid}')`)}<div style="font-size:.6rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#444;margin:18px 0 10px;">KCET Marks — Total + Bio & Math</div>${pillInput('n-kcet-total','fa-solid fa-list-check','Total KCET',180,uid)}${pillInput('n-kbio','fa-solid fa-dna','Biology KCET',60,uid)}${pillInput('n-kmat','fa-solid fa-square-root-variable','Maths KCET',60,uid)}<button onclick="calcNon('${uid}')" style="width:100%;margin-top:18px;padding:16px;background:#fff;color:#000;border:none;border-radius:14px;font-size:.85rem;font-weight:700;font-family:'Space Grotesk',sans-serif;letter-spacing:.04em;cursor:pointer;transition:opacity .18s;" onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">Get Prediction</button><div id="non-result-${uid}" style="display:none;margin-top:18px;"></div></div>
      <div style="padding:12px 22px;border-top:1px solid #111;display:flex;align-items:center;gap:6px;"><div style="width:5px;height:5px;border-radius:50%;background:#333;"></div><div style="font-size:.58rem;color:#333;letter-spacing:.06em;text-transform:uppercase;">Estimated · Not official KEA data</div></div>
    </div>`;
    container.appendChild(card); if (typeof window.scrollEsToBottom === 'function') window.scrollEsToBottom();
  }

  window.switchKcetTab = (uid, tab) => { const engTab = document.getElementById(`tab-eng-${uid}`); const nonTab = document.getElementById(`tab-non-${uid}`); const engPanel = document.getElementById(`eng-${uid}`); const nonPanel = document.getElementById(`non-${uid}`); if (tab === 'eng') { engTab.style.background = '#fff'; engTab.style.color = '#000'; nonTab.style.background = 'transparent'; nonTab.style.color = '#666'; engPanel.style.display = 'block'; nonPanel.style.display = 'none'; } else { nonTab.style.background = '#fff'; nonTab.style.color = '#000'; engTab.style.background = 'transparent'; engTab.style.color = '#666'; nonPanel.style.display = 'block'; engPanel.style.display = 'none'; } };
  function getVal(id) { const el = document.getElementById(id); return el ? parseFloat(el.value) || 0 : 0; }
  window.updateEngTotal = (uid) => { const mat = getVal(`in-e-mat-${uid}`), phy = getVal(`in-e-phy-${uid}`), che = getVal(`in-e-che-${uid}`); const total = mat + phy + che; if (total > 0) document.getElementById(`in-e-agg-${uid}`).value = total; };
  window.updateEngSubjects = (uid) => { const agg = getVal(`in-e-agg-${uid}`); if (agg > 0) { document.getElementById(`in-e-mat-${uid}`).value = ''; document.getElementById(`in-e-phy-${uid}`).value = ''; document.getElementById(`in-e-che-${uid}`).value = ''; } };
  window.updateNonTotal = (uid) => { const mat = getVal(`in-n-mat-${uid}`), phy = getVal(`in-n-phy-${uid}`), che = getVal(`in-n-che-${uid}`), bio = getVal(`in-n-bio-${uid}`); const total = mat + phy + che + bio; if (total > 0) document.getElementById(`in-n-agg-${uid}`).value = total; };
  window.updateNonSubjects = (uid) => { const agg = getVal(`in-n-agg-${uid}`); if (agg > 0) { document.getElementById(`in-n-mat-${uid}`).value = ''; document.getElementById(`in-n-phy-${uid}`).value = ''; document.getElementById(`in-n-che-${uid}`).value = ''; document.getElementById(`in-n-bio-${uid}`).value = ''; } };

  window.calcEng = (uid) => {
    let phy = getVal(`in-e-phy-${uid}`), che = getVal(`in-e-che-${uid}`), mat = getVal(`in-e-mat-${uid}`); const agg = getVal(`in-e-agg-${uid}`); const kcet = getVal(`in-e-kcet-${uid}`);
    if (agg > 0 && phy + che + mat === 0) { phy = che = mat = agg / 3; }
    const boardTotal = phy + che + mat;
    if (boardTotal === 0) { alert('Enter Board marks: either subject-wise or Total Aggregate'); return; }
    if (kcet < 0 || kcet > 180) { alert('Enter KCET marks between 0–180'); return; }
    const boardPct = (boardTotal / 300) * 100; const kcetPct = (kcet / 180) * 100; const rank = computeRank(boardPct, kcetPct); const band = rankBand(rank);
    const res = document.getElementById(`eng-result-${uid}`); res.style.display = 'block';
    res.innerHTML = `<div style="background:#000;border:1px solid #1a1a1a;border-radius:16px;padding:20px;text-align:center;"><div style="font-size:.58rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#444;margin-bottom:12px;">Predicted Engineering Rank</div><div style="font-size:3rem;font-weight:700;letter-spacing:-.04em;color:#fff;line-height:1;">${rank.toLocaleString('en-IN')}</div><div style="font-size:.7rem;font-weight:600;color:${band.color};margin-top:8px;letter-spacing:.1em;text-transform:uppercase;">${band.label}</div><div style="display:flex;justify-content:center;gap:20px;margin-top:14px;padding-top:14px;border-top:1px solid #111;font-size:.65rem;color:#444;letter-spacing:.04em;"><span>BOARD ${boardPct.toFixed(1)}%</span><span>KCET ${kcetPct.toFixed(1)}%</span><span>INDEX ${((boardPct + kcetPct)/2).toFixed(1)}</span></div></div><div onclick="launchKcetPredictor()" style="text-align:center;margin-top:12px;font-size:.65rem;color:#444;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;padding:8px;">⟳ NEW PREDICTION</div>`;
    if (typeof window.scrollEsToBottom === 'function') window.scrollEsToBottom();
  };

  window.calcNon = (uid) => {
    let phy = getVal(`in-n-phy-${uid}`), che = getVal(`in-n-che-${uid}`), mat = getVal(`in-n-mat-${uid}`), bio = getVal(`in-n-bio-${uid}`); const agg = getVal(`in-n-agg-${uid}`);
    if (agg > 0 && phy + che + mat + bio === 0) { phy = che = mat = bio = agg / 4; }
    const boardTotal = phy + che + mat + bio;
    const kcetTotal = getVal(`in-n-kcet-total-${uid}`); const kbio = getVal(`in-n-kbio-${uid}`); const kmat = getVal(`in-n-kmat-${uid}`);
    if (boardTotal === 0) { alert('Enter Board marks: either PCMB subject-wise or Total Aggregate'); return; }
    if (kcetTotal === 0 || kbio === 0 || kmat === 0) { alert('Enter KCET marks: Total + Biology + Maths required'); return; }
    if (kcetTotal > 180 || kbio > 60 || kmat > 60) { alert('Invalid KCET marks: Total max 180, Bio/Math max 60 each'); return; }
    const remaining = kcetTotal - kbio - kmat; const kphy = remaining / 2; const kche = remaining / 2;
    const boardPct = (boardTotal / 400) * 100;
    const pharmaPct = ((kphy + kche + kbio) / 180) * 100; const pharmaRank = computeRank(boardPct, pharmaPct);
    const engPct = ((kphy + kche + kmat) / 180) * 100; const engRank = computeRank(boardPct, engPct);
    const res = document.getElementById(`non-result-${uid}`); res.style.display = 'block';
    res.innerHTML = `<div style="display:flex;gap:10px;">${resultBlock('Pharma Rank', pharmaRank, boardPct, pharmaPct)}${resultBlock('Engg Rank', engRank, boardPct, engPct)}</div><div style="margin-top:14px;padding-top:14px;border-top:1px solid #111;display:flex;justify-content:center;gap:20px;font-size:.62rem;color:#444;letter-spacing:.04em;"><span>BOARD ${boardPct.toFixed(1)}%</span><span>PCB ${pharmaPct.toFixed(1)}%</span><span>PCM ${engPct.toFixed(1)}%</span></div><div onclick="launchKcetPredictor()" style="text-align:center;margin-top:12px;font-size:.65rem;color:#444;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;padding:8px;">⟳ NEW PREDICTION</div>`;
    if (typeof window.scrollEsToBottom === 'function') window.scrollEsToBottom();
  };

  document.addEventListener("DOMContentLoaded", () => {
    if (typeof window.doEsSearch === "function") {
      const originalSearch = window.doEsSearch;
      window.doEsSearch = async function (val) {
        if (!val || !val.trim()) return; const query = val.trim(); const lower = query.toLowerCase();
        const container = document.getElementById('es-messages'); const greet = document.getElementById('es-greeting'); if (greet) greet.style.display = 'none';
        if (typeof window.appendEsBubbleUser === 'function') { window.appendEsBubbleUser(query); } else { const b = document.createElement('div'); b.className = 'es-bubble-user'; b.textContent = query; if (container) container.appendChild(b); }
        const inputEl = document.getElementById('es-input'); if (inputEl) inputEl.value = ''; document.getElementById('es-send')?.classList.remove('visible');
        if (lower.includes('kcet') || lower.includes('predict') || lower.includes('rank predictor') || lower.includes('kcet rank')) { setTimeout(launchKcetPredictor, 280); return; }
        const sysBubble = document.createElement('div'); sysBubble.className = 'es-bubble-sys'; const contentDiv = document.createElement('div'); contentDiv.className = 'ai-response-content'; contentDiv.style.cssText = 'font-size:.88rem;color:var(--text);line-height:1.6;'; sysBubble.appendChild(contentDiv); if (container) container.appendChild(sysBubble); contentDiv.innerHTML = '<span style="color:#007aff;">▌</span>';
        try { const answer = await LocalAI.respond(query); if (answer.includes("Not in local DB") || answer.includes("Try:") || answer.includes("not in local")) { if (container && sysBubble.parentNode) container.removeChild(sysBubble); originalSearch(val); } else { await typewriteText(contentDiv, answer); } } catch (err) { contentDiv.innerHTML = `<span style="color:#ef4444;">⚠️ ${err.message}</span>`; }
        if (typeof window.scrollEsToBottom === 'function') window.scrollEsToBottom();
      };
    }
  });

})();
