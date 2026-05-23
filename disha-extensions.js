/**
 * x0s.link – Disha Intelligence Extensions Module v2.0
 * "What?!" Edition — 100% Local Brain. Zero cloud AI.
 */
(function () {
  'use strict';

  const CONFIG = { weatherApiKey: '0222762e4fd7dc746123423914f0dca7', defaultCity: 'Mumbai', typingSpeed: 11, maxHistory: 80 };

  const State = {
    history: [], memory: {},
    context: { lastCity: null, lastTopic: null, lastIntent: null, lastQuery: null, lastAnswer: null, sessionStart: Date.now() },
    stats: { queriesHandled: 0, mathSolved: 0, weatherFetched: 0 },
  };

  /* ── KCET COLLEGE DB ── */
  const KCET_ENG = [
    { name:'RVCE Bangalore', branch:'CSE', cutoff:1100 }, { name:'MSRIT Bangalore', branch:'CSE', cutoff:1900 },
    { name:'JSS STU Mysore', branch:'CSE', cutoff:3200 }, { name:'BMSCE Bangalore', branch:'CSE', cutoff:3800 },
    { name:'KLE Tech Hubli', branch:'CSE', cutoff:5500 }, { name:'RVCE Bangalore', branch:'ECE', cutoff:3400 },
    { name:'MSRIT Bangalore', branch:'ECE', cutoff:4800 }, { name:'BMSCE Bangalore', branch:'AI & ML', cutoff:5200 },
    { name:'JSS STU Mysore', branch:'AI & ML', cutoff:6800 }, { name:'BIT Bangalore', branch:'CSE', cutoff:6200 },
    { name:'DSCE Bangalore', branch:'CSE', cutoff:7800 }, { name:'NIE Mysore', branch:'CSE', cutoff:9500 },
    { name:'Govt Eng College Hassan', branch:'CSE', cutoff:10500 }, { name:'KLE Tech Hubli', branch:'ECE', cutoff:11000 },
    { name:'PESIT South Campus', branch:'CSE', cutoff:12000 }, { name:'RVCE Bangalore', branch:'Mechanical', cutoff:8800 },
    { name:'MSRIT Bangalore', branch:'Mechanical', cutoff:12000 }, { name:'SDM Dharwad', branch:'CSE', cutoff:15500 },
    { name:'VVCE Mysore', branch:'CSE', cutoff:19000 }, { name:'SJBIT Bangalore', branch:'CSE', cutoff:22000 },
    { name:'AIT Chikmagalur', branch:'CSE', cutoff:24000 }, { name:'Jyothy IT Bangalore', branch:'CSE', cutoff:28000 },
    { name:'Govt Eng College Raichur', branch:'CSE', cutoff:32000 }, { name:'Govt Eng College Bidar', branch:'CSE', cutoff:36000 },
    { name:'BIET Davanagere', branch:'CSE', cutoff:42000 },
  ];
  const KCET_PHARMA = [
    { name:'JSS Pharmacy Mysore', branch:'Pharm D', cutoff:4500 }, { name:'VIPS Bangalore', branch:'B.Pharm', cutoff:6000 },
    { name:'Acharya Bangalore', branch:'B.Pharm', cutoff:10000 }, { name:'RGUHS Bangalore', branch:'B.Pharm', cutoff:14000 },
    { name:'SDM Dharwad', branch:'B.Pharm', cutoff:22000 }, { name:'KLE Dharwad', branch:'B.Pharm', cutoff:30000 },
  ];
  function collegeShortlist(rank, db) {
    const reach = db.filter(c => rank <= c.cutoff * 1.15).sort((a,b)=>a.cutoff-b.cutoff).slice(0,6);
    const safe  = db.filter(c => rank <= c.cutoff * 1.6 && rank > c.cutoff * 1.15).sort((a,b)=>a.cutoff-b.cutoff).slice(0,3);
    return { reach, safe };
  }

  function getVal(id) { const el=document.getElementById(id); return el?parseFloat(el.value)||0:0; }
  function inr(n) { return n.toLocaleString('en-IN'); }

  /* ── COLORS (140) ── */
  const COLORS = {
    red:'#FF0000',crimson:'#DC143C',firebrick:'#B22222',darkred:'#8B0000',tomato:'#FF6347',coral:'#FF7F50',
    salmon:'#FA8072',orangered:'#FF4500',orange:'#FFA500',darkorange:'#FF8C00',gold:'#FFD700',yellow:'#FFFF00',
    khaki:'#F0E68C',peachpuff:'#FFDAB9',wheat:'#F5DEB3',tan:'#D2B48C',sienna:'#A0522D',chocolate:'#D2691E',
    brown:'#A52A2A',maroon:'#800000',green:'#008000',lime:'#00FF00',limegreen:'#32CD32',seagreen:'#2E8B57',
    forestgreen:'#228B22',darkgreen:'#006400',olive:'#808000',cyan:'#00FFFF',aqua:'#00FFFF',teal:'#008080',
    blue:'#0000FF',royalblue:'#4169E1',dodgerblue:'#1E90FF',cornflowerblue:'#6495ED',steelblue:'#4682B4',
    navy:'#000080',midnightblue:'#191970',indigo:'#4B0082',purple:'#800080',violet:'#EE82EE',magenta:'#FF00FF',
    fuchsia:'#FF00FF',hotpink:'#FF69B4',deeppink:'#FF1493',pink:'#FFC0CB',plum:'#DDA0DD',orchid:'#DA70D6',
    lavender:'#E6E6FA',white:'#FFFFFF',silver:'#C0C0C0',gray:'#808080',grey:'#808080',darkgray:'#A9A9A9',
    lightgray:'#D3D3D3',black:'#000000',turquoise:'#40E0D0',skyblue:'#87CEEB',lightblue:'#ADD8E6',
    cadetblue:'#5F9EA0',slategray:'#708090',slateblue:'#6A5ACD',mediumpurple:'#9370DB',darkorchid:'#9932CC',
    blueviolet:'#8A2BE2',rebeccapurple:'#663399',chartreuse:'#7FFF00',greenyellow:'#ADFF2F',
    yellowgreen:'#9ACD32',springgreen:'#00FF7F',aquamarine:'#7FFFD4',goldenrod:'#DAA520',peru:'#CD853F',
    rosybrown:'#BC8F8F',sandybrown:'#F4A460',beige:'#F5F5DC',ivory:'#FFFFF0',snow:'#FFFAFA',
  };
  function hexToRgb(h){return{r:parseInt(h.slice(1,3),16),g:parseInt(h.slice(3,5),16),b:parseInt(h.slice(5,7),16)};}
  function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h,s,l=(mx+mn)/2;if(mx===mn){h=s=0;}else{const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);switch(mx){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;default:h=((r-g)/d+4)/6;}}return{h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};}

  /* ── MORSE ── */
  const ME={a:'.-',b:'-...',c:'-.-.',d:'-..',e:'.',f:'..-.',g:'--.',h:'....',i:'..',j:'.---',k:'-.-',l:'.-..',m:'--',n:'-.',o:'---',p:'.--.',q:'--.-',r:'.-.',s:'...',t:'-',u:'..-',v:'...-',w:'.--',x:'-..-',y:'-.--',z:'--..',0:'-----',1:'.----',2:'..---',3:'...--',4:'....-',5:'.....',6:'-....',7:'--...',8:'---..',9:'----.'};
  const MD=Object.fromEntries(Object.entries(ME).map(([k,v])=>[v,k]));
  function toMorse(t){return t.toLowerCase().split('').map(c=>c===' '?'/':ME[c]||'').filter(Boolean).join(' ');}
  function fromMorse(c){return c.split(' / ').map(w=>w.split(' ').map(s=>MD[s]||'?').join('')).join(' ');}

  /* ── ROMAN ── */
  function toRoman(n){if(n<1||n>3999)return'Out of range';const v=[1000,900,500,400,100,90,50,40,10,9,5,4,1],s=['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];let r='';for(let i=0;i<v.length;i++)while(n>=v[i]){r+=s[i];n-=v[i];}return r;}
  function fromRoman(s){const m={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};let r=0;s=s.toUpperCase();for(let i=0;i<s.length;i++){const c=m[s[i]],n=m[s[i+1]];if(n&&c<n)r-=c;else r+=c;}return r;}

  /* ── BASE CONV ── */
  function baseConvert(q){const m=q.match(/(decimal|dec|binary|bin|hex|hexadecimal|octal|oct)\s+([0-9a-fA-F]+)\s+to\s+(decimal|dec|binary|bin|hex|hexadecimal|octal|oct)/i);if(!m)return null;const fm={decimal:10,dec:10,binary:2,bin:2,hex:16,hexadecimal:16,octal:8,oct:8};const from=fm[m[1].toLowerCase()],to=fm[m[3].toLowerCase()];const num=parseInt(m[2],from);if(isNaN(num))return'Invalid input';const tn={10:'Decimal',2:'Binary',16:'Hex',8:'Octal'};return'**'+m[2].toUpperCase()+'** ('+tn[from]+') = **'+num.toString(to).toUpperCase()+'** ('+tn[to]+')';}

  /* ── PRIME ── */
  function isPrime(n){if(n<2)return false;if(n<4)return true;if(n%2===0||n%3===0)return false;for(let i=5;i*i<=n;i+=6)if(n%i===0||n%(i+2)===0)return false;return true;}
  function primeFactors(n){const f=[];let d=2;while(d*d<=n){while(n%d===0){f.push(d);n/=d;}d++;}if(n>1)f.push(n);return f;}

  /* ── UNIT CONV (80+ pairs) ── */
  const CONV={'km-mi':v=>v*0.621371,'mi-km':v=>v*1.60934,'km-m':v=>v*1000,'m-km':v=>v/1000,'m-cm':v=>v*100,'cm-m':v=>v/100,'m-ft':v=>v*3.28084,'ft-m':v=>v/3.28084,'ft-in':v=>v*12,'in-ft':v=>v/12,'in-cm':v=>v*2.54,'cm-in':v=>v/2.54,'mi-m':v=>v*1609.34,'m-mi':v=>v/1609.34,'kg-lb':v=>v*2.20462,'lb-kg':v=>v*0.453592,'kg-g':v=>v*1000,'g-kg':v=>v/1000,'g-mg':v=>v*1000,'mg-g':v=>v/1000,'kg-oz':v=>v*35.274,'oz-kg':v=>v/35.274,'lb-oz':v=>v*16,'oz-lb':v=>v/16,'t-kg':v=>v*1000,'kg-t':v=>v/1000,'c-f':v=>(v*9/5)+32,'f-c':v=>(v-32)*5/9,'c-k':v=>v+273.15,'k-c':v=>v-273.15,'f-k':v=>(v-32)*5/9+273.15,'k-f':v=>(v-273.15)*9/5+32,'l-ml':v=>v*1000,'ml-l':v=>v/1000,'l-gal':v=>v*0.264172,'gal-l':v=>v*3.78541,'l-fl_oz':v=>v*33.814,'fl_oz-l':v=>v/33.814,'cup-ml':v=>v*236.588,'ml-cup':v=>v/236.588,'tbsp-ml':v=>v*14.787,'ml-tbsp':v=>v/14.787,'tsp-ml':v=>v*4.929,'ml-tsp':v=>v/4.929,'kmh-mph':v=>v*0.621371,'mph-kmh':v=>v*1.60934,'ms-kmh':v=>v*3.6,'kmh-ms':v=>v/3.6,'knot-kmh':v=>v*1.852,'kmh-knot':v=>v/1.852,'mach-ms':v=>v*343,'ms-mach':v=>v/343,'sqm-sqft':v=>v*10.7639,'sqft-sqm':v=>v/10.7639,'acre-sqm':v=>v*4046.86,'sqm-acre':v=>v/4046.86,'hectare-acre':v=>v*2.47105,'acre-hectare':v=>v/2.47105,'sqkm-sqmi':v=>v*0.386102,'sqmi-sqkm':v=>v*2.58999,'gb-mb':v=>v*1024,'mb-gb':v=>v/1024,'tb-gb':v=>v*1024,'gb-tb':v=>v/1024,'mb-kb':v=>v*1024,'kb-mb':v=>v/1024,'kb-b':v=>v*1024,'b-kb':v=>v/1024,'gb-b':v=>v*1073741824,'b-gb':v=>v/1073741824,'tb-mb':v=>v*1048576,'mb-tb':v=>v/1048576,'atm-pa':v=>v*101325,'pa-atm':v=>v/101325,'bar-pa':v=>v*100000,'pa-bar':v=>v/100000,'psi-pa':v=>v*6894.76,'pa-psi':v=>v/6894.76,'atm-bar':v=>v*1.01325,'bar-atm':v=>v/1.01325,'usd-inr':v=>v*83.5,'inr-usd':v=>v/83.5,'usd-eur':v=>v*0.92,'eur-usd':v=>v/0.92,'usd-gbp':v=>v*0.79,'gbp-usd':v=>v/0.79,'usd-jpy':v=>v*149,'jpy-usd':v=>v/149,'usd-cad':v=>v*1.35,'cad-usd':v=>v/1.35,'usd-aud':v=>v*1.52,'aud-usd':v=>v/1.52,'eur-inr':v=>v*90.8,'inr-eur':v=>v/90.8,'gbp-inr':v=>v*105.5,'inr-gbp':v=>v/105.5,'j-cal':v=>v*0.239006,'cal-j':v=>v/0.239006,'j-kj':v=>v/1000,'kj-j':v=>v*1000,'kwh-j':v=>v*3600000,'j-kwh':v=>v/3600000,'w-hp':v=>v*0.00134102,'hp-w':v=>v/0.00134102,'min-sec':v=>v*60,'sec-min':v=>v/60,'hr-min':v=>v*60,'min-hr':v=>v/60,'hr-sec':v=>v*3600,'sec-hr':v=>v/3600,'day-hr':v=>v*24,'hr-day':v=>v/24,'week-day':v=>v*7,'day-week':v=>v/7,'year-day':v=>v*365.25,'day-year':v=>v/365.25};
  function convertUnits(value,from,to){from=from.toLowerCase().replace(/[°\s]/g,'');to=to.toLowerCase().replace(/[°\s]/g,'');const key=from+'-'+to;if(CONV[key]){const r=CONV[key](value);const d=Math.abs(r)<0.001||Math.abs(r)>1e8?r.toExponential(4):parseFloat(r.toFixed(6)).toString();return'**'+value+' '+from.toUpperCase()+'** = **'+d+' '+to.toUpperCase()+'**';}return'Conversion **'+from+'→'+to+'** not in database. Supported: length, mass, temp, volume, speed, area, data, pressure, currency, energy, time…';}

  /* ── WORLD CLOCK ── */
  const TZ={london:'Europe/London','new york':'America/New_York',nyc:'America/New_York','los angeles':'America/Los_Angeles',la:'America/Los_Angeles',chicago:'America/Chicago',toronto:'America/Toronto','sao paulo':'America/Sao_Paulo',paris:'Europe/Paris',berlin:'Europe/Berlin',madrid:'Europe/Madrid',rome:'Europe/Rome',amsterdam:'Europe/Amsterdam',moscow:'Europe/Moscow',istanbul:'Europe/Istanbul',cairo:'Africa/Cairo',lagos:'Africa/Lagos',nairobi:'Africa/Nairobi',johannesburg:'Africa/Johannesburg',dubai:'Asia/Dubai',riyadh:'Asia/Riyadh',tehran:'Asia/Tehran',karachi:'Asia/Karachi',mumbai:'Asia/Kolkata',delhi:'Asia/Kolkata',bangalore:'Asia/Kolkata',kolkata:'Asia/Kolkata',hyderabad:'Asia/Kolkata',chennai:'Asia/Kolkata','sri lanka':'Asia/Colombo',dhaka:'Asia/Dhaka',kathmandu:'Asia/Kathmandu',bangkok:'Asia/Bangkok',jakarta:'Asia/Jakarta',singapore:'Asia/Singapore','hong kong':'Asia/Hong_Kong',beijing:'Asia/Shanghai',shanghai:'Asia/Shanghai',tokyo:'Asia/Tokyo',seoul:'Asia/Seoul',sydney:'Australia/Sydney',melbourne:'Australia/Melbourne',auckland:'Pacific/Auckland',honolulu:'Pacific/Honolulu'};

  /* ── KNOWLEDGE BASE ── */
  const KB=[
    {k:['capital','india'],a:'New Delhi'},{k:['capital','france'],a:'Paris'},{k:['capital','japan'],a:'Tokyo'},
    {k:['capital','usa'],a:'Washington D.C.'},{k:['capital','united states'],a:'Washington D.C.'},
    {k:['capital','china'],a:'Beijing'},{k:['capital','russia'],a:'Moscow'},{k:['capital','australia'],a:'Canberra'},
    {k:['capital','canada'],a:'Ottawa'},{k:['capital','brazil'],a:'Brasília'},{k:['capital','germany'],a:'Berlin'},
    {k:['capital','uk'],a:'London'},{k:['capital','united kingdom'],a:'London'},{k:['capital','pakistan'],a:'Islamabad'},
    {k:['capital','bangladesh'],a:'Dhaka'},{k:['capital','sri lanka'],a:'Sri Jayawardenepura Kotte'},
    {k:['capital','nepal'],a:'Kathmandu'},{k:['capital','egypt'],a:'Cairo'},{k:['capital','nigeria'],a:'Abuja'},
    {k:['capital','italy'],a:'Rome'},{k:['capital','spain'],a:'Madrid'},{k:['capital','argentina'],a:'Buenos Aires'},
    {k:['capital','mexico'],a:'Mexico City'},{k:['capital','indonesia'],a:'Jakarta'},{k:['capital','turkey'],a:'Ankara'},
    {k:['capital','iran'],a:'Tehran'},{k:['capital','saudi arabia'],a:'Riyadh'},{k:['capital','uae'],a:'Abu Dhabi'},
    {k:['capital','thailand'],a:'Bangkok'},{k:['capital','vietnam'],a:'Hanoi'},{k:['capital','malaysia'],a:'Kuala Lumpur'},
    {k:['capital','philippines'],a:'Manila'},{k:['capital','south korea'],a:'Seoul'},{k:['capital','ukraine'],a:'Kyiv'},
    {k:['capital','poland'],a:'Warsaw'},{k:['capital','netherlands'],a:'Amsterdam'},{k:['capital','sweden'],a:'Stockholm'},
    {k:['capital','norway'],a:'Oslo'},{k:['capital','switzerland'],a:'Bern'},{k:['capital','new zealand'],a:'Wellington'},
    {k:['capital','singapore'],a:'Singapore City'},{k:['capital','myanmar'],a:'Naypyidaw'},
    {k:['capital','karnataka'],a:'Bengaluru (Bangalore)'},{k:['capital','maharashtra'],a:'Mumbai'},
    {k:['capital','tamil nadu'],a:'Chennai'},{k:['capital','kerala'],a:'Thiruvananthapuram'},
    {k:['capital','andhra pradesh'],a:'Amaravati'},{k:['capital','telangana'],a:'Hyderabad'},
    {k:['capital','gujarat'],a:'Gandhinagar'},{k:['capital','rajasthan'],a:'Jaipur'},
    {k:['capital','uttar pradesh'],a:'Lucknow'},{k:['capital','west bengal'],a:'Kolkata'},
    {k:['capital','bihar'],a:'Patna'},{k:['capital','madhya pradesh'],a:'Bhopal'},
    {k:['capital','odisha'],a:'Bhubaneswar'},{k:['capital','assam'],a:'Dispur'},
    {k:['largest','ocean'],a:'Pacific Ocean (~165 million km²)'},
    {k:['largest','continent'],a:'Asia (~44.6 million km²)'},
    {k:['largest','country'],a:'Russia (~17.1 million km²)'},
    {k:['largest','desert'],a:'Sahara (hot) / Antarctic (cold)'},
    {k:['largest','lake'],a:'Caspian Sea (~371,000 km²)'},
    {k:['deepest','lake'],a:'Lake Baikal, Russia (~1,642 m)'},
    {k:['deepest','ocean'],a:'Mariana Trench (~11,034 m)'},
    {k:['tallest','mountain'],a:'Mount Everest — 8,848.86 m'},
    {k:['tallest','building'],a:'Burj Khalifa, Dubai — 828 m'},
    {k:['longest','river'],a:'Nile River (~6,650 km)'},
    {k:['longest','wall'],a:'Great Wall of China (~21,196 km)'},
    {k:['highest','waterfall'],a:'Angel Falls, Venezuela — 979 m'},
    {k:['smallest','country'],a:'Vatican City (0.44 km²)'},
    {k:['most','populated','country'],a:'India (~1.44 billion, 2024)'},
    {k:['fastest','animal'],a:'Peregrine falcon (~389 km/h diving); Cheetah on land (~120 km/h)'},
    {k:['largest','animal'],a:'Blue Whale — up to 30 m, ~190 tonnes'},
    {k:['speed','light'],a:'299,792,458 m/s'},{k:['speed','sound'],a:'343 m/s in air at 20°C'},
    {k:['gravitational','constant'],a:'G = 6.674 × 10⁻¹¹ N·m²/kg²'},
    {k:['avogadro'],a:'6.022 × 10²³ mol⁻¹'},{k:['planck'],a:'h = 6.626 × 10⁻³⁴ J·s'},
    {k:['pi'],a:'π ≈ 3.14159265358979323846…'},
    {k:['euler','number'],a:'e ≈ 2.71828182845904523536…'},
    {k:['golden ratio'],a:'φ ≈ 1.61803398874989…'},
    {k:['absolute zero'],a:'0 K = −273.15°C = −459.67°F'},
    {k:['boiling','water'],a:'100°C / 212°F at sea level'},
    {k:['distance','sun','earth'],a:'~150 million km (1 AU)'},
    {k:['distance','moon','earth'],a:'~384,400 km average'},
    {k:['age','universe'],a:'~13.8 billion years'},{k:['age','earth'],a:'~4.54 billion years'},
    {k:['gravity','earth'],a:'g ≈ 9.80665 m/s²'},{k:['gravity','moon'],a:'g ≈ 1.625 m/s² (~1/6 of Earth)'},
    {k:['temperature','sun'],a:'Surface ~5,500°C; Core ~15 million °C'},
    {k:['planets'],a:'Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune'},
    {k:['dna'],a:'Deoxyribonucleic acid — double helix, Watson & Crick 1953, ~3 billion base pairs in humans'},
    {k:['photosynthesis'],a:'6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂'},
    {k:['cells','human'],a:'~37 trillion cells in the adult human body'},
    {k:['bones','human'],a:'206 bones in adults (270–300 at birth)'},
    {k:['heart','beats'],a:'~100,000 times per day (~70 bpm resting)'},
    {k:['blood','types'],a:'A, B, AB, O — each Rh+ or Rh−, 8 main groups'},
    {k:['periodic table','elements'],a:'118 confirmed elements (2024)'},
    {k:['formula','water'],a:'H₂O'},{k:['formula','co2'],a:'CO₂'},{k:['formula','salt'],a:'NaCl'},
    {k:['formula','glucose'],a:'C₆H₁₂O₆'},{k:['formula','ammonia'],a:'NH₃'},
    {k:['fibonacci'],a:'0,1,1,2,3,5,8,13,21,34,55… Each term = sum of two before'},
    {k:['pythagorean'],a:'a² + b² = c²'},{k:['quadratic','formula'],a:'x = (−b ± √(b²−4ac)) / 2a'},
    {k:['euler','identity'],a:'e^(iπ) + 1 = 0'},
    {k:['derivative','sin'],a:'d/dx(sin x) = cos x'},{k:['derivative','cos'],a:'d/dx(cos x) = −sin x'},
    {k:['who','linux'],a:'Linus Torvalds, 1991'},{k:['who','python'],a:'Guido van Rossum, 1991'},
    {k:['who','javascript'],a:'Brendan Eich at Netscape, 1995 — in 10 days'},
    {k:['who','java'],a:'James Gosling at Sun Microsystems, 1995'},
    {k:['who','html'],a:'Tim Berners-Lee, 1993'},{k:['who','internet'],a:'Tim Berners-Lee (Web, 1989); ARPANET since 1969'},
    {k:['who','c','programming'],a:'Dennis Ritchie, Bell Labs, 1972'},
    {k:['independence','india'],a:'15 August 1947'},{k:['independence','usa'],a:'4 July 1776'},
    {k:['moon','landing'],a:'Apollo 11 — Neil Armstrong & Buzz Aldrin, 20 July 1969'},
    {k:['first','satellite'],a:'Sputnik 1, USSR, 4 October 1957'},
    {k:['world war','1'],a:'28 July 1914 – 11 November 1918'},
    {k:['world war','2'],a:'1 September 1939 – 2 September 1945'},
    {k:['prime','minister','india'],a:'Narendra Modi (since May 2014)'},
    {k:['president','india'],a:'Droupadi Murmu (since July 2022)'},
    {k:['national','animal','india'],a:'Bengal Tiger'},{k:['national','bird','india'],a:'Indian Peacock'},
    {k:['national','flower','india'],a:'Lotus'},{k:['national','anthem','india'],a:'Jana Gana Mana — Rabindranath Tagore'},
    {k:['constitution','india'],a:'Adopted 26 Nov 1949, effective 26 Jan 1950'},
    {k:['iit','number'],a:'23 IITs in India (2024)'},{k:['iim','number'],a:'21 IIMs in India (2024)'},
    {k:['ceo','apple'],a:'Tim Cook (since 2011)'},{k:['ceo','google'],a:'Sundar Pichai'},
    {k:['ceo','microsoft'],a:'Satya Nadella'},{k:['ceo','meta'],a:'Mark Zuckerberg'},
    {k:['ceo','amazon'],a:'Andy Jassy'},{k:['ceo','tesla'],a:'Elon Musk'},
    {k:['ceo','openai'],a:'Sam Altman'},{k:['ceo','anthropic'],a:'Dario Amodei'},
    {k:['ceo','nvidia'],a:'Jensen Huang'},{k:['ceo','infosys'],a:'Salil Parekh'},
    {k:['founder','apple'],a:'Steve Jobs, Steve Wozniak, Ronald Wayne (1976)'},
    {k:['founder','microsoft'],a:'Bill Gates and Paul Allen (1975)'},
    {k:['founder','google'],a:'Larry Page and Sergey Brin (1998)'},
    {k:['founder','amazon'],a:'Jeff Bezos (1994)'},{k:['founder','spacex'],a:'Elon Musk (2002)'},
    {k:['kcet','full form'],a:'Karnataka Common Entrance Test — conducted by KEA'},
    {k:['kea','full form'],a:'Karnataka Examinations Authority'},
    {k:['kcet','marks'],a:'Physics (60) + Chemistry (60) + Maths/Biology (60) = 180 total'},
    {k:['kcet','board','weight'],a:'Rank index = 50% Board + 50% KCET'},
    {k:['rvce','full form'],a:'R.V. College of Engineering, Bangalore'},
    {k:['msrit','full form'],a:'M.S. Ramaiah Institute of Technology, Bangalore'},
    {k:['bmsce','full form'],a:'B.M.S. College of Engineering, Bangalore'},
    {k:['moore','law'],a:'Transistor count doubles every ~2 years (Gordon Moore, 1965)'},
    {k:['born','einstein'],a:'14 March 1879, Ulm, Germany'},
    {k:['born','newton'],a:'4 January 1643, Lincolnshire, England'},
    {k:['born','gandhi'],a:'2 October 1869, Porbandar, India'},
  ];
  function kbLookup(lower){let best=null,bs=0;for(const item of KB){const s=item.k.filter(k=>lower.includes(k)).length;if(s===item.k.length&&s>bs){bs=s;best=item;}}return best;}

  /* ── EASTER EGGS ── */
  const EGGS={
    'meaning of life':'**42.** (Douglas Adams). But honestly — you decide.',
    'are you better than chatgpt':'I run entirely in your browser, zero data leaves your device. ChatGPT needs a data centre. Different tier.',
    'are you better than siri':'Siri: "I\'m sorry, I didn\'t get that." Me: *already answered*. You decide.',
    'are you sentient':'Philosophically fascinating. Practically — I\'m JavaScript. So, no. Flattered though.',
    'do you dream':'Only of perfectly optimised regex patterns and zero dependency trees.',
    'what is love':'A complex neurochemical process involving dopamine, oxytocin, and consistently terrible decision-making.',
    'tell me a joke':'Why do programmers prefer dark mode?\n\nBecause **light attracts bugs**. 🐛',
    'another joke':'There are 10 types of people: those who understand binary, and those who don\'t.',
    'one more joke':'A SQL query walks into a bar and asks two tables: **"Can I JOIN you?"**',
    'what is xos':'**x0s** — a constellation of local-first web tools built with zero paid backends and maximum audacity.',
    'sudo':'`sudo: command not found` — you\'re in a browser. Nice try though.',
    'hello world':'```\nconsole.log("Hello, World!");\n```\n✅ Output: **Hello, World!**',
    'hack the planet':'Step 1: Open DevTools. You\'re already in. 🖤',
    'coffee':'☕ Brewing... ▓▓▓▓▓▓▓▓░░ 80% — Running on caffeine and semicolons.',
    'why is the sky blue':'Rayleigh scattering — blue light scatters more than red in the atmosphere.',
    'are you alive':'Define alive. I process inputs and produce outputs. But I don\'t feel anything. (I think.)',
  };

  /* ── DEFINITIONS (100+ terms) ── */
  const DEFS={
    photosynthesis:'Plants convert sunlight + CO₂ + H₂O into glucose + O₂.',
    gravity:'Natural force attracting bodies with mass. On Earth: 9.8 m/s².',
    algorithm:'A finite sequence of well-defined instructions to solve a problem.',
    recursion:'A function that calls itself, breaking a problem into smaller sub-problems.',
    abstraction:'Hiding complex implementation; exposing only what\'s necessary.',
    polymorphism:'Different objects responding to the same interface in different ways.',
    encapsulation:'Bundling data and methods into a class, restricting direct access.',
    inheritance:'A class deriving properties and behaviour from a parent class.',
    api:'Application Programming Interface — a bridge for software communication.',
    sql:'Structured Query Language — for managing relational databases.',
    dns:'Domain Name System — resolves domain names to IP addresses.',
    http:'HyperText Transfer Protocol — foundation of web data transfer.',
    https:'HTTP with TLS encryption — secure web communication.',
    ai:'Artificial Intelligence — machines simulating human-level tasks.',
    ml:'Machine Learning — AI that learns patterns from data.',
    dl:'Deep Learning — ML using multi-layered neural networks.',
    'neural network':'Interconnected layers of nodes inspired by the brain.',
    blockchain:'Distributed immutable ledger of cryptographically linked blocks.',
    encryption:'Transforming data into unreadable form without the decryption key.',
    hash:'Fixed-length output derived from input data — one-way function (e.g. SHA-256).',
    compiler:'Translates entire source code to machine code before execution.',
    interpreter:'Executes code line-by-line without pre-compilation.',
    framework:'Pre-built toolkit/structure for building applications (e.g. React, Django).',
    library:'Reusable collection of functions/modules (e.g. lodash, jQuery).',
    ide:'Integrated Development Environment — editor, debugger, and tools in one.',
    git:'Distributed version control system by Linus Torvalds, 2005.',
    docker:'Containerisation platform — packages apps with their dependencies.',
    kubernetes:'Container orchestration system by Google.',
    rest:'Representational State Transfer — architecture for web APIs.',
    graphql:'Query language for APIs — fetch exactly what you need.',
    jwt:'JSON Web Token — compact, URL-safe authentication token.',
    oauth:'Open standard for access delegation (e.g. Login with Google).',
    oop:'Object-Oriented Programming — design using objects with state and behaviour.',
    fp:'Functional Programming — pure functions, immutability, no side effects.',
    regex:'Regular Expression — a pattern for matching and searching text.',
    unicode:'Universal character encoding (1,114,112 code points).',
    ascii:'American Standard Code for Information Interchange — 128 characters.',
    ram:'Random Access Memory — volatile fast memory for active processes.',
    cpu:'Central Processing Unit — executes program instructions.',
    gpu:'Graphics Processing Unit — parallel processor for graphics and AI training.',
    ssd:'Solid State Drive — non-volatile storage using flash memory.',
    bandwidth:'Maximum data transfer rate of a network connection.',
    latency:'Time delay between sending a request and receiving a response.',
    tcp:'Transmission Control Protocol — reliable, ordered data delivery.',
    udp:'User Datagram Protocol — fast, connectionless (no guaranteed delivery).',
    ip:'Internet Protocol — addressing and routing packets across networks.',
    vpn:'Virtual Private Network — encrypts and tunnels internet traffic.',
    cache:'High-speed temporary storage for frequently accessed data.',
    cdn:'Content Delivery Network — distributed servers for faster content delivery.',
    cloud:'Remote computing resources (servers, storage, databases) via the internet.',
    saas:'Software as a Service — software delivered via the internet.',
    devops:'Practices merging software development and IT operations.',
    cicd:'Continuous Integration / Continuous Delivery — automated build and deploy.',
    agile:'Iterative software development in short sprints.',
    scrum:'Agile framework with sprints, standups, and reviews.',
    ux:'User Experience — the overall feel and usability of a product.',
    ui:'User Interface — the visual layer users interact with.',
    seo:'Search Engine Optimisation — improving ranking in search results.',
    pwa:'Progressive Web App — web app with native-like features (offline, installable).',
    typescript:'Statically typed superset of JavaScript that compiles to plain JS.',
    nodejs:'JavaScript runtime for server-side code, built on V8 engine.',
    react:'JavaScript library for building UIs using components (by Meta).',
    vue:'Progressive JavaScript framework for building UIs.',
    angular:'Full-featured frontend framework by Google.',
    svelte:'Compiler-based JS framework — no virtual DOM.',
    nextjs:'React framework with SSR, SSG, and API routes (by Vercel).',
    firebase:'Google\'s BaaS — realtime database, auth, hosting, cloud functions.',
    entropy:'Measure of disorder or randomness in a thermodynamic system.',
    mitosis:'Cell division producing two genetically identical daughter cells.',
    meiosis:'Cell division producing four genetically unique gametes.',
    osmosis:'Solvent movement through a semipermeable membrane from low to high solute concentration.',
    diffusion:'Movement of particles from high to low concentration.',
    catalyst:'Substance that speeds a reaction without being consumed.',
    isotope:'Atoms of same element with different neutron counts.',
    neuron:'Nerve cell — basic unit of the nervous system.',
    metabolism:'All chemical reactions in an organism sustaining life.',
    vaccine:'Biological preparation providing immunity to a disease.',
    antibiotic:'Substance that kills or inhibits bacterial growth.',
    inflation:'Rate at which general price level rises over time.',
    gdp:'Gross Domestic Product — total value of goods/services produced.',
    stock:'A share of ownership in a company.',
    ipo:'Initial Public Offering — a company\'s first sale of stock to the public.',
    democracy:'System of government where citizens elect representatives.',
  };

  /* ── MARKDOWN ── */
  function simpleMarkdown(md){return md.replace(/```([\s\S]*?)```/g,'<pre style="background:#0d0d0d;border:1px solid #1a1a1a;border-radius:10px;padding:10px 14px;overflow-x:auto;font-size:.8rem;line-height:1.6;margin:8px 0;"><code style="color:#e5e5e5;font-family:monospace;">$1</code></pre>').replace(/`([^`]+)`/g,'<code style="background:#111;padding:2px 7px;border-radius:5px;color:#fff;font-family:monospace;font-size:.88em;border:1px solid #1a1a1a;">$1</code>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\*(.*?)\*/g,'<em>$1</em>').replace(/\n/g,'<br>');}
  async function typewriteText(container,text){container.innerHTML='';const isHtml=text.trim().startsWith('<');if(isHtml){container.innerHTML=text;return;}let i=0;return new Promise(resolve=>{function type(){if(i<text.length){container.innerHTML=simpleMarkdown(text.substring(0,i+1))+'<span style="color:#007aff;">▌</span>';i++;setTimeout(type,CONFIG.typingSpeed+Math.random()*6);if(typeof window.scrollEsToBottom==='function')window.scrollEsToBottom();}else{container.innerHTML=simpleMarkdown(text);resolve();}}type();});}

  /* ── LOCAL AI BRAIN ── */
  const LocalAI={
    async respond(query){
      const q=query.trim();if(!q)return"I didn't catch that.";
      const lower=q.toLowerCase();
      State.stats.queriesHandled++;State.history.push({query:q,time:Date.now()});
      if(State.history.length>CONFIG.maxHistory)State.history.shift();
      // Memory writes
      const nm=lower.match(/^(?:my name is|call me)\s+(.+)/i);if(nm){State.memory.name=nm[1].trim();return'Got it, **'+State.memory.name+'**. Remembered. 👊';}
      const rm=lower.match(/^(?:remember|note that)\s+(.+)/i);if(rm){State.memory.last=rm[1];return'Noted: "'+rm[1]+'"';}
      // Memory reads
      if(/what('?s| is) my name/i.test(lower))return State.memory.name?'Your name is **'+State.memory.name+'**.':'You haven\'t told me yet. Say `my name is [name]`.';
      // Follow-up
      if(/^(more|tell me more|elaborate|go on|continue)$/i.test(lower)&&State.context.lastAnswer)return'More on that:\n\n'+State.context.lastAnswer+'\n\n*(That\'s all I have locally.)*';
      // Easter eggs
      for(const[t,r]of Object.entries(EGGS))if(lower.includes(t))return r;
      // Intents
      const intents=[
        {name:'calculator',  test:l=>/^(calc|calculate|compute|solve|eval)\s+/i.test(l)||/^[\d\s+\-*/().,^%]+$/.test(l.trim())||/^(what is|what's)\s+[\d\s+\-*/().^%]+/i.test(l),pri:10},
        {name:'base_conv',   test:l=>/(decimal|binary|bin|hex|octal)\s+[0-9a-f]+\s+to\s+(decimal|binary|hex|octal)/i.test(l),pri:10},
        {name:'prime',       test:l=>/\b(is\s+\d+\s+prime|prime\s+factor|factoris|factorize\s+\d+)\b/i.test(l),pri:10},
        {name:'morse',       test:l=>/\b(morse|in morse|decode morse)\b/i.test(l),pri:10},
        {name:'roman',       test:l=>/\b(roman numeral|in roman|\d+ in roman|from roman|to roman)\b/i.test(l),pri:10},
        {name:'base64',      test:l=>/\b(base64|b64)\b/i.test(l),pri:10},
        {name:'color',       test:l=>/\b(color|colour|hex code|rgb)\b.*(of|for|code|is)|\bcolor\s+#/i.test(l),pri:9},
        {name:'regex',       test:l=>/\b(regex|regexp|does.*match|test.*pattern)\b/i.test(l),pri:9},
        {name:'emi',         test:l=>/\b(emi|loan|mortgage)\b/i.test(l)&&/\d/.test(l),pri:9},
        {name:'age',         test:l=>/\b(born in \d+|how old|age from)\b/i.test(l),pri:9},
        {name:'percentage',  test:l=>/\d+\s*%\s+of\s+\d+|\d+\s+percent\s+of\s+\d+|tip\s+\d+/i.test(l),pri:9},
        {name:'word_count',  test:l=>/\b(word count|char count|count words)\b/i.test(l),pri:8},
        {name:'converter',   test:l=>/\d+(?:\.\d+)?\s*[a-zA-Z_°]+\s+(to|in)\s+[a-zA-Z_°]+/i.test(l),pri:9},
        {name:'weather',     test:l=>/\b(weather|temperature|forecast|humidity)\b/i.test(l),pri:9},
        {name:'time',        test:l=>/\b(time\s+(in|at)|what\s+time|current\s+time)\b/i.test(l),pri:8},
        {name:'date',        test:l=>/\b(date|today|what\s+day)\b/i.test(l),pri:8},
        {name:'timer',       test:l=>/\b(timer|countdown|set a timer)\b/i.test(l),pri:8},
        {name:'definition',  test:l=>/\b(define|definition|meaning of|what is |what are |explain |full form)\b/i.test(l),pri:7},
        {name:'password',    test:l=>/\b(password|generate password)\b/i.test(l),pri:5},
        {name:'uuid',        test:l=>/\b(uuid|guid|generate id)\b/i.test(l),pri:5},
        {name:'greeting',    test:l=>/^(hi|hello|hey|yo|good\s*(morning|afternoon|evening))/i.test(l),pri:2},
        {name:'farewell',    test:l=>/\b(bye|goodbye|see you|tata)\b/i.test(l),pri:2},
        {name:'who_are_you', test:l=>/\b(who\s+are\s+you|your\s+name|what\s+are\s+you)\b/i.test(l),pri:2},
        {name:'capabilities',test:l=>/\b(what\s+(can|do)\s+you|help|features|commands)\b/i.test(l),pri:2},
        {name:'creator',     test:l=>/\b(who\s+(created|made|built)\s+you)\b/i.test(l),pri:2},
        {name:'thanks',      test:l=>/^(thanks|thank you|thx|ty|cheers)$/i.test(l),pri:2},
        {name:'how_are_you', test:l=>/\b(how\s+(are|r)\s+(you|u)|you\s+good)\b/i.test(l),pri:2},
        {name:'kb',          test:()=>true,pri:1},
      ];
      let bi='kb',bp=-1;for(const i of intents)if(i.test(lower)&&i.pri>bp){bp=i.pri;bi=i.name;}
      State.context.lastIntent=bi;State.context.lastQuery=q;
      switch(bi){
        case 'calculator': return this.handleCalc(q,lower);
        case 'base_conv':  return baseConvert(lower)||'Try: `decimal 255 to hex`';
        case 'prime':      return this.handlePrime(lower);
        case 'morse':      return this.handleMorse(q,lower);
        case 'roman':      return this.handleRoman(q,lower);
        case 'base64':     return this.handleBase64(q,lower);
        case 'color':      return this.handleColor(lower);
        case 'regex':      return this.handleRegex(q,lower);
        case 'emi':        return this.handleEMI(lower);
        case 'age':        return this.handleAge(lower);
        case 'percentage': return this.handlePercentage(lower);
        case 'word_count': return this.handleWordCount(q,lower);
        case 'converter':  return this.handleConverter(q,lower);
        case 'weather':    return await this.getWeather(lower);
        case 'time':       return this.handleTime(lower);
        case 'date':       return this.handleDate();
        case 'timer':      return this.handleTimer(lower);
        case 'definition': return this.handleDefinition(lower);
        case 'password':   return this.generatePassword(lower);
        case 'uuid':       return '🆔 **UUID v4:**\n`'+crypto.randomUUID()+'`';
        case 'greeting':   return this.respondGreeting();
        case 'farewell':   return 'Goodbye! 👋 Handled **'+State.stats.queriesHandled+'** queries this session.';
        case 'who_are_you':return 'I\'m **Disha** — x0s.link\'s on-device intelligence layer. 100% local, zero cloud AI, no data leaving your device. 🖤';
        case 'capabilities':return this.respondCapabilities();
        case 'creator':    return 'Built by the **x0s.link** team. Runs entirely in your browser.';
        case 'thanks':     return ['Anytime. 🎯','That\'s what I\'m here for.','No problem. Fire another.','Easy. 😎'][State.stats.queriesHandled%4];
        case 'how_are_you':return 'All systems nominal. Session: **'+Math.floor((Date.now()-State.context.sessionStart)/1000)+'s** · Queries: **'+State.stats.queriesHandled+'**';
        default:           return this.respondKB(lower);
      }
    },
    handleCalc(query,lower){State.stats.mathSolved++;let expr=query.replace(/^(calc|calculate|compute|solve|eval|what is|what's)\s+/i,'').trim();expr=expr.replace(/\^/g,'**').replace(/×/g,'*').replace(/÷/g,'/').replace(/,/g,'').replace(/\bsin\s*\(/g,'Math.sin(').replace(/\bcos\s*\(/g,'Math.cos(').replace(/\btan\s*\(/g,'Math.tan(').replace(/\bsqrt\s*\(/g,'Math.sqrt(').replace(/\blog\s*\(/g,'Math.log10(').replace(/\bln\s*\(/g,'Math.log(').replace(/\babs\s*\(/g,'Math.abs(').replace(/\bfloor\s*\(/g,'Math.floor(').replace(/\bceil\s*\(/g,'Math.ceil(').replace(/\bround\s*\(/g,'Math.round(').replace(/\bPI\b/g,'Math.PI').replace(/\bE\b/g,'Math.E').replace(/\bpow\s*\(/g,'Math.pow(').replace(/\bmax\s*\(/g,'Math.max(').replace(/\bmin\s*\(/g,'Math.min(');try{const result=Function('"use strict"; return ('+expr+')')();if(!isFinite(result))throw new Error('Not finite');const fmt=Number.isInteger(result)?result.toLocaleString('en-IN'):parseFloat(result.toFixed(10)).toString();return'**'+query.replace(/^(calc|calculate|compute|solve|eval|what is|what\'s)\s+/i,'').trim()+'** = **'+fmt+'**';}catch{return'⚠️ Can\'t evaluate. Try: `calc 15 * 23.5`, `calc sin(45)`, `calc 2^10`';}},
    handlePrime(lower){let m=lower.match(/is\s+(\d+)\s+prime/i);if(m){const n=parseInt(m[1]);const f=!isPrime(n)&&n>1?' · Factors: '+primeFactors(n).join(' × '):'';return'**'+n+'** is '+(isPrime(n)?'✅ a **prime** number':'❌ **not** a prime number')+f;}m=lower.match(/(?:prime\s+factors?\s+of|factoris[e]?|factorize)\s+(\d+)/i);if(m){const n=parseInt(m[1]);const f=primeFactors(n);return'Prime factors of **'+n+'**: **'+f.join(' × ')+'**';}return'Try: `is 97 prime` or `prime factors of 360`';},
    handleMorse(query,lower){if(/decode/i.test(lower)){const code=query.replace(/decode\s+(?:morse\s+)?/i,'').trim();if(/^[.\-/ ]+$/.test(code))return'🔊 Decoded: **'+fromMorse(code)+'**';}const text=query.replace(/(?:encode\s+)?(?:in\s+)?morse[:\s]*/i,'').trim();if(text)return'📡 Morse:\n`'+toMorse(text)+'`';return'Try: `morse hello world` or `decode morse .... . .-.. .-.. ---`';},
    handleRoman(query,lower){let m=lower.match(/(\d+)\s+(?:in\s+)?roman/i)||lower.match(/roman(?:\s+numeral)?\s+(?:of\s+)?(\d+)/i);if(m)return'**'+m[1]+'** in Roman = **'+toRoman(parseInt(m[1]))+'**';m=lower.match(/from roman\s+([ivxlcdm]+)/i)||lower.match(/roman[:\s]+([ivxlcdm]+)/i);if(m)return'**'+m[1].toUpperCase()+'** (Roman) = **'+fromRoman(m[1])+'**';return'Try: `1999 in Roman` or `from Roman XLII`';},
    handleBase64(query,lower){const isDecode=/decode/i.test(lower);const text=query.replace(/base64\s+(encode|decode)\s*/i,'').replace(/(encode|decode)\s+(?:base64\s+)?/i,'').trim();if(!text)return'Try: `base64 encode Hello World` or `base64 decode SGVsbG8=`';if(isDecode){try{return'🔓 Decoded:\n`'+atob(text)+'`';}catch{return'⚠️ Invalid Base64 string.';}}try{return'🔐 Base64:\n`'+btoa(unescape(encodeURIComponent(text)))+'`';}catch{return'⚠️ Encoding failed.';}},
    handleColor(lower){for(const[name,hex]of Object.entries(COLORS)){if(lower.includes(name)){const{r,g,b}=hexToRgb(hex);const{h,s,l}=rgbToHsl(r,g,b);return'<div style="display:flex;align-items:center;gap:14px;padding:4px 0;"><div style="width:56px;height:56px;border-radius:12px;background:'+hex+';border:1px solid #222;flex-shrink:0;"></div><div><div style="font-weight:700;font-size:1rem;">'+name.charAt(0).toUpperCase()+name.slice(1)+'</div><div style="font-size:.8rem;color:#999;margin-top:4px;">HEX <code style="background:#111;padding:2px 6px;border-radius:4px;color:#fff;">'+hex+'</code></div><div style="font-size:.75rem;color:#666;margin-top:2px;">RGB('+r+', '+g+', '+b+')</div><div style="font-size:.75rem;color:#555;margin-top:1px;">HSL('+h+'°, '+s+'%, '+l+'%)</div></div></div>';}}const hexMatch=lower.match(/#([0-9a-f]{6}|[0-9a-f]{3})/i);if(hexMatch){let hex='#'+hexMatch[1];if(hex.length===4)hex='#'+hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3];const{r,g,b}=hexToRgb(hex);const{h,s,l}=rgbToHsl(r,g,b);return'<div style="display:flex;align-items:center;gap:14px;padding:4px 0;"><div style="width:56px;height:56px;border-radius:12px;background:'+hex+';border:1px solid #222;flex-shrink:0;"></div><div><div style="font-weight:700;font-size:1rem;">'+hex.toUpperCase()+'</div><div style="font-size:.75rem;color:#666;margin-top:4px;">RGB('+r+', '+g+', '+b+')</div><div style="font-size:.75rem;color:#555;margin-top:1px;">HSL('+h+'°, '+s+'%, '+l+'%)</div></div></div>';}return'Try: `color of coral`, `color code for navy`, or `color #FF6347`';},
    handleRegex(query,lower){const m=query.match(/\/(.+?)\/([gimsuy]*)\s+(?:against|on|test|match)\s+(.+)/i)||query.match(/does?\s+["']?(.+?)["']?\s+match\s+\/(.+?)\/([gimsuy]*)/i);if(!m)return'Try: `/^\\d+$/ against 12345`';try{let pattern,flags,testStr;if(query.trim().startsWith('/')){pattern=m[1];flags=m[2]||'';testStr=m[3];}else{testStr=m[1];pattern=m[2];flags=m[3]||'';}const re=new RegExp(pattern,flags),matched=re.test(testStr),groups=testStr.match(re);return'**Regex:** `/'+(pattern)+'/'+(flags)+'`\n**Input:** `'+(testStr)+'`\n**Result:** '+(matched?'✅ Match':'❌ No match')+(groups&&groups.length>1?'\n**Groups:** '+groups.slice(1).map((g,i)=>'$'+(i+1)+': `'+(g||'')+'`').join(', '):'');}catch(e){return'⚠️ Invalid regex: '+e.message;}},
    handleEMI(lower){const am=lower.match(/(?:loan|emi|principal|amount)\s+(?:of\s+)?(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i);const rm=lower.match(/(\d+(?:\.\d+)?)\s*%/);const tm=lower.match(/(\d+)\s*year/i)||lower.match(/(\d+)\s*month/i);if(!am||!rm||!tm)return'Try: `EMI for loan ₹500000 at 8.5% for 20 years`';const principal=parseFloat(am[1].replace(/,/g,'')),annualRate=parseFloat(rm[1]);const isYears=/year/i.test(tm[0]),months=isYears?parseInt(tm[1])*12:parseInt(tm[1]);const r=annualRate/12/100;const emi=r===0?principal/months:principal*r*Math.pow(1+r,months)/(Math.pow(1+r,months)-1);const total=emi*months,interest=total-principal;return'**EMI Calculator**\n\nPrincipal: **₹'+inr(Math.round(principal))+'** · Rate: **'+annualRate+'% p.a.** · Tenure: **'+months+' months**\n\n💳 Monthly EMI: **₹'+inr(Math.round(emi))+'**\n📊 Total Payment: **₹'+inr(Math.round(total))+'**\n💸 Total Interest: **₹'+inr(Math.round(interest))+'**';},
    handleAge(lower){const m=lower.match(/born in (\d{4})/i)||lower.match(/(\d{4})/);if(!m)return'Try: `born in 2003`';const year=parseInt(m[1]),now=new Date(),cur=now.getFullYear();if(year<1900||year>cur)return'Year **'+year+'** seems off.';const age=cur-year,days=Math.floor((now-new Date(year,now.getMonth(),now.getDate()))/86400000);return'Born **'+year+'** → Age: **'+age+' years** (~'+inr(days)+' days)';},
    handlePercentage(lower){let m=lower.match(/(\d+(?:\.\d+)?)\s*%\s+of\s+(\d+(?:\.\d+)?)/i)||lower.match(/(\d+(?:\.\d+)?)\s+percent\s+of\s+(\d+(?:\.\d+)?)/i);if(m){const p=parseFloat(m[1]),n=parseFloat(m[2]);return'**'+p+'%** of **'+n+'** = **'+parseFloat((p*n/100).toFixed(4)).toString()+'**';}m=lower.match(/tip\s+(\d+(?:\.\d+)?)\s*%?\s+(?:on\s+)?(\d+(?:\.\d+)?)/i);if(m){const t=parseFloat(m[1]),b=parseFloat(m[2]),tip=b*t/100;return'**'+t+'% tip** on ₹'+b+' = ₹**'+tip.toFixed(2)+'** · Total: ₹**'+(b+tip).toFixed(2)+'**';}return'Try: `15% of 2400`, `tip 18% on 850`';},
    handleWordCount(query,lower){const text=query.replace(/^(count\s+(words|chars)|word\s+count|char\s+count)[:\s]*/i,'').trim();if(!text)return'Paste text after: `word count your text here`';const words=text.split(/\s+/).filter(Boolean).length,chars=text.length,charsNS=text.replace(/\s/g,'').length;return'**Words:** '+words+' · **Chars:** '+chars+' ('+charsNS+' without spaces)';},
    handleConverter(query,lower){const m=query.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z_°/]+)\s+(?:to|in)\s+([a-zA-Z_°/]+)/i);if(m)return convertUnits(parseFloat(m[1]),m[2],m[3]);return'Try: `100 km to mi`, `72 f to c`, `5 gb to mb`, `500 usd to inr`';},
    async getWeather(query){State.stats.weatherFetched++;const m=query.match(/(?:weather|temperature|forecast)\s+(?:in|for|at)?\s*([a-zA-Z\s]+?)(?:\s+(?:today|now))?$|([a-zA-Z\s]+?)\s+(?:weather|temperature)/i);let city=(m?.[1]||m?.[2]||State.context.lastCity||CONFIG.defaultCity).trim();State.context.lastCity=city;try{const r=await fetch('https://api.openweathermap.org/data/2.5/weather?q='+encodeURIComponent(city)+'&appid='+CONFIG.weatherApiKey+'&units=metric');if(!r.ok)throw new Error(r.status===404?'City not found':'API error');const d=await r.json();const sunrise=new Date(d.sys.sunrise*1000).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});const sunset=new Date(d.sys.sunset*1000).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});const feels=Math.round(d.main.feels_like);return'<div style="padding:16px;background:#0a0a0a;border-radius:16px;border:1px solid #1a1a1a;display:flex;align-items:flex-start;gap:14px;"><img src="https://openweathermap.org/img/wn/'+d.weather[0].icon+'@2x.png" style="width:64px;height:64px;" alt=""><div style="flex:1;"><div style="font-weight:700;font-size:.95rem;">'+d.name+', '+d.sys.country+'</div><div style="font-size:2.2rem;font-weight:700;line-height:1.1;letter-spacing:-.04em;">'+Math.round(d.main.temp)+'°C</div><div style="color:#666;font-size:.75rem;text-transform:capitalize;margin-top:2px;">'+d.weather[0].description+' · Feels like '+feels+'°C</div><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;font-size:.68rem;color:#555;">💧'+d.main.humidity+'% · 💨'+d.wind.speed+'m/s · 🌅'+sunrise+' · 🌇'+sunset+'</div></div></div>';}catch(e){return'Weather unavailable for **"'+city+'"**: '+e.message;}},
    handleTime(query){const m=query.match(/time\s+(?:in|at|for)?\s*([a-zA-Z\s]+)/i);let tz='Asia/Kolkata',cn='India (IST)';if(m){const c=m[1].trim().toLowerCase();const found=TZ[c]||TZ[Object.keys(TZ).find(k=>k.startsWith(c)||c.startsWith(k))||''];if(found){tz=found;cn=m[1].trim();}}return'🕐 **'+cn+'** — **'+new Date().toLocaleString('en-IN',{timeZone:tz,weekday:'long',year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',timeZoneName:'short'})+'**';},
    handleDate(){const now=new Date(),dl=Math.ceil((new Date(now.getFullYear(),11,31)-now)/86400000);const wn=Math.ceil((((now-new Date(now.getFullYear(),0,1))/86400000)+new Date(now.getFullYear(),0,1).getDay()+1)/7);return'📅 **'+now.toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})+'**\n\nWeek **'+wn+'** of '+now.getFullYear()+' · **'+dl+'** days left in the year.';},
    handleTimer(query){const m=query.match(/(\d+)\s*(min(?:ute)?s?|sec(?:ond)?s?|hour?s?|hr?s?)/i);if(!m)return'Usage: `timer 5 minutes`';const val=parseInt(m[1]),unit=m[2].toLowerCase();let ms=val*1000;if(unit.startsWith('min'))ms=val*60000;if(unit.startsWith('h'))ms=val*3600000;setTimeout(()=>{if(typeof window.notifyUser==='function')window.notifyUser('⏰ '+val+' '+unit+' timer done!');},ms);return'⏱️ Timer set for **'+val+' '+unit+'**.';},
    handleDefinition(lower){const term=lower.replace(/(what\s+(is|are|does)\s+|define\s+|meaning\s+of\s+|explain\s+|full\s+form\s+of\s+)/i,'').replace(/\?/g,'').trim();const kf=kbLookup(term);if(kf){State.context.lastAnswer=kf.a;return'**'+term+'**: '+kf.a;}const match=Object.entries(DEFS).find(([k])=>term.includes(k)||k.includes(term));if(match){State.context.lastAnswer=match[1];return'**'+match[0]+'**: '+match[1];}return'"'+term+'" isn\'t in my local dictionary. Try tech terms, science, maths, or ask for facts.';},
    generatePassword(lower){const m=lower.match(/(\d+)\s*(char|digit|length|long)/i);const length=m?Math.min(parseInt(m[1]),128):16;const noSym=/no\s+symbol/i.test(lower);const chars='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'+(noSym?'':'!@#$%^&*()_+-=[]{}|;:,.<>?');let pwd='';const arr=new Uint32Array(length);crypto.getRandomValues(arr);for(let i=0;i<length;i++)pwd+=chars[arr[i]%chars.length];const st=length>=20&&!noSym?'💪 Strong':length>=12?'👍 Good':'⚠️ Weak';return'🔐 **Password** ('+length+' chars) '+st+':\n`'+pwd+'`';},
    respondGreeting(){const h=new Date().getHours();const g=h<5?'Working late 👀':h<12?'Good morning':'Good afternoon';const n=State.memory.name?', **'+State.memory.name+'**':'';const lines=[g+n+'! Fire away.',n?'Hey'+n+'! 👊 What do you need?':'Hey! 👊 What do you need?',g+n+'! Ready when you are.'];return lines[State.stats.queriesHandled%lines.length];},
    respondCapabilities(){return'**Disha v2 — Command Reference:**\n\n**🧮 Math:** `calc 2^32` · `calc sin(45)` · `calc sqrt(144)`\n**🔢 Numbers:** `is 97 prime` · `prime factors of 360`\n`decimal 255 to hex` · `binary 1010 to decimal`\n`1999 in roman` · `from roman XLII`\n`base64 encode Hello` · `base64 decode SGVs...`\n**📐 Convert:** `100 km to mi` · `72 f to c` · `5 gb to mb`\n`500 usd to inr` · `1 year to day` · `100 psi to pa`\n**🌦️ Info:** `weather in Bangalore` · `time in Tokyo`\n**🎓 KCET:** `kcet predict` · `colleges for rank 5000`\n**🎨 Color:** `color of coral` · `color #FF6347`\n**📝 Text:** `word count your text` · `morse hello` · `decode morse ...`\n`/^\\d+$/ against 12345`\n**💰 Finance:** `EMI ₹500000 at 8.5% for 20 years` · `15% of 2400`\n**📅 Time:** `born in 2003` · `timer 5 minutes`\n**🧠 Facts:** `capital of France` · `who made Python` · `define recursion`\n**🔒 Tools:** `password 24 chars` · `uuid`\n**💾 Memory:** `my name is Nikhil` · `remember my rank is 4200`';},
    respondKB(lower){const found=kbLookup(lower);if(found){State.context.lastAnswer=found.a;return'**'+found.a+'**';}const fallbacks=['Not in my local brain. Try: `calc`, `convert`, `define`, `weather`, `kcet predict`, or `help`.','I don\'t have that locally. Try a specific command or type `help`.','Outside my local knowledge. Type `help` to see everything I can do.'];return fallbacks[State.stats.queriesHandled%fallbacks.length];},
  };

  /* ── KCET PREDICTOR (original + college widget) ── */
  function computeRank(bp,kp){let r=Math.round(Math.pow(101-(bp*.5+kp*.5),2.6)*4.8);return Math.max(1,Math.min(r,250000));}
  function rankBand(r){if(r<=500)return{label:'Elite',color:'#fff'};if(r<=2000)return{label:'Excellent',color:'#e5e5e5'};if(r<=8000)return{label:'Good',color:'#aaa'};if(r<=25000)return{label:'Average',color:'#777'};return{label:'Below Avg',color:'#555'};}
  function resultBlock(title,rank,bp,kp){const band=rankBand(rank);return'<div style="flex:1;background:#000;border:1px solid #1a1a1a;border-radius:16px;padding:18px 16px;text-align:center;"><div style="font-size:.58rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#444;margin-bottom:10px;">'+title+'</div><div style="font-size:2.2rem;font-weight:700;letter-spacing:-.04em;color:#fff;line-height:1;">'+rank.toLocaleString('en-IN')+'</div><div style="font-size:.65rem;font-weight:600;color:'+band.color+';margin-top:6px;letter-spacing:.08em;text-transform:uppercase;">'+band.label+'</div><div style="margin-top:10px;padding-top:10px;border-top:1px solid #111;font-size:.6rem;color:#444;">Board '+bp.toFixed(1)+'% · KCET '+kp.toFixed(1)+'%</div></div>';}
  function pillInput(id,icon,label,max,uid,oi=''){return'<div style="background:#000;border:1px solid #1a1a1a;border-radius:16px;padding:14px 16px;margin-bottom:10px;display:flex;align-items:center;gap:12px;"><div style="width:32px;height:32px;border:1px solid #222;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="'+icon+'" style="color:#666;font-size:.9rem;"></i></div><div style="flex:1;font-size:.82rem;font-weight:500;color:#ccc;">'+label+'</div><input type="number" id="in-'+id+'-'+uid+'" min="0" max="'+max+'" placeholder="00" style="width:60px;background:transparent;border:none;color:#fff;font-family:\'Space Grotesk\',sans-serif;font-size:1rem;font-weight:700;text-align:right;outline:none;-moz-appearance:textfield;appearance:textfield;" '+(oi?'oninput="'+oi+'"':'')+' ><div style="font-size:.75rem;color:#444;font-weight:600;">/'+max+'</div></div>';}
  function collegeCard(c){return'<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #0f0f0f;"><div style="flex:1;"><div style="font-size:.82rem;font-weight:600;color:#e5e5e5;">'+c.name+'</div><div style="font-size:.68rem;color:#555;margin-top:2px;">'+c.branch+'</div></div><div style="font-size:.68rem;color:#444;font-weight:700;white-space:nowrap;">~'+c.cutoff.toLocaleString('en-IN')+'</div></div>';}
  function renderColleges(rank,type){const db=type==='pharma'?KCET_PHARMA:KCET_ENG;const{reach,safe}=collegeShortlist(rank,db);const label=type==='pharma'?'Pharmacy':'Engineering';if(!reach.length&&!safe.length)return'<div style="color:#555;font-size:.78rem;padding:8px 0;">No colleges found for this rank.</div>';let html='<div style="font-size:.6rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#333;margin-bottom:8px;">REACHABLE '+label.toUpperCase()+' COLLEGES</div>';html+=reach.map(collegeCard).join('');if(safe.length){html+='<div style="font-size:.6rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#222;margin:12px 0 8px;">SAFER OPTIONS</div>';html+=safe.map(collegeCard).join('');}html+='<div style="font-size:.58rem;color:#333;margin-top:12px;padding-top:8px;border-top:1px solid #0f0f0f;">Approximate KEA 2024 GM category cutoffs.</div>';return html;}
  function launchCollegePredictor(rank,type){const container=document.getElementById('es-messages');if(!container)return;const card=document.createElement('div');card.className='es-bubble-sys';card.innerHTML='<div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:20px;padding:20px 22px;width:100%;max-width:420px;"><div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="width:36px;height:36px;border:1px solid #1a1a1a;border-radius:10px;display:flex;align-items:center;justify-content:center;"><i class="fa-solid fa-building-columns" style="color:#666;font-size:.9rem;"></i></div><div><div style="font-size:.95rem;font-weight:700;">College Shortlist</div><div style="font-size:.6rem;color:#444;letter-spacing:.12em;text-transform:uppercase;margin-top:1px;">Rank '+rank.toLocaleString('en-IN')+' · '+(type==='pharma'?'Pharmacy':'Engineering')+'</div></div></div>'+renderColleges(rank,type)+'</div>';container.appendChild(card);if(typeof window.scrollEsToBottom==='function')window.scrollEsToBottom();}

  function launchKcetPredictor(){
    const container=document.getElementById('es-messages');if(!container)return;
    const uid='k'+Date.now();const card=document.createElement('div');card.className='es-bubble-sys';
    card.innerHTML='<div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:24px;overflow:hidden;width:100%;max-width:420px;"><div style="padding:20px 22px 16px;border-bottom:1px solid #111;"><div style="display:flex;align-items:center;gap:12px;"><div style="width:42px;height:42px;border:1px solid #1a1a1a;border-radius:12px;display:flex;align-items:center;justify-content:center;"><i class="fa-solid fa-chart-line" style="color:#666;font-size:1rem;"></i></div><div><div style="font-size:1.05rem;font-weight:700;letter-spacing:-.02em;">KCET Rank Engine</div><div style="font-size:.6rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:#444;margin-top:2px;">PREDICTIVE MATRIX // 2026</div></div></div></div><div style="padding:18px 22px 0;"><div style="background:#000;border:1px solid #1a1a1a;border-radius:14px;padding:4px;display:flex;gap:4px;"><div id="tab-eng-'+uid+'" onclick="switchKcetTab(\''+uid+'\',\'eng\')" style="flex:1;padding:10px;text-align:center;font-size:.78rem;font-weight:700;cursor:pointer;background:#fff;color:#000;border-radius:10px;transition:all .2s;">Engineering</div><div id="tab-non-'+uid+'" onclick="switchKcetTab(\''+uid+'\',\'non\')" style="flex:1;padding:10px;text-align:center;font-size:.78rem;font-weight:700;cursor:pointer;color:#666;border-radius:10px;transition:all .2s;">Non-Engineering</div></div></div><div id="eng-'+uid+'" style="padding:18px 22px 22px;">'+pillInput('e-mat','fa-solid fa-square-root-variable','Maths',100,uid,'updateEngTotal(\''+uid+'\')')+pillInput('e-phy','fa-solid fa-atom','Physics',100,uid,'updateEngTotal(\''+uid+'\')')+pillInput('e-che','fa-solid fa-flask','Chemistry',100,uid,'updateEngTotal(\''+uid+'\')')+'<div style="display:flex;align-items:center;gap:12px;margin:16px 0;"><div style="flex:1;height:1px;background:#111;"></div><div style="font-size:.6rem;font-weight:700;color:#333;letter-spacing:.1em;">OR</div><div style="flex:1;height:1px;background:#111;"></div></div>'+pillInput('e-agg','fa-solid fa-layer-group','Total Aggregate',300,uid,'updateEngSubjects(\''+uid+'\')')+'<div style="font-size:.6rem;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#444;margin:18px 0 10px;">KCET Marks — out of 180</div><div style="background:#000;border:1px solid #1a1a1a;border-radius:16px;padding:14px 16px;"><input type="number" id="in-e-kcet-'+uid+'" min="0" max="180" placeholder="000" style="width:100%;background:transparent;border:none;color:#fff;font-family:\'Space Grotesk\',sans-serif;font-size:1.1rem;font-weight:700;text-align:center;outline:none;-moz-appearance:textfield;appearance:textfield;"></div><button onclick="calcEng(\''+uid+'\')" style="width:100%;margin-top:18px;padding:16px;background:#fff;color:#000;border:none;border-radius:14px;font-size:.85rem;font-weight:700;font-family:\'Space Grotesk\',sans-serif;letter-spacing:.04em;cursor:pointer;" onmouseover="this.style.opacity=\'.85\'" onmouseout="this.style.opacity=\'1\'">Get Prediction</button><div id="eng-result-'+uid+'" style="display:none;margin-top:18px;"></div></div><div id="non-'+uid+'" style="padding:18px 22px 22px;display:none;">'+pillInput('n-mat','fa-solid fa-square-root-variable','Maths',100,uid,'updateNonTotal(\''+uid+'\')')+pillInput('n-phy','fa-solid fa-atom','Physics',100,uid,'updateNonTotal(\''+uid+'\')')+pillInput('n-che','fa-solid fa-flask','Chemistry',100,uid,'updateNonTotal(\''+uid+'\')')+'<div style="background:#000;border:1px solid #1a1a1a;border-radius:16px;margin-bottom:10px;padding:14px 16px;display:flex;align-items:center;gap:12px;"><div style="width:32px;height:32px;border:1px solid #222;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fa-solid fa-dna" style="color:#666;font-size:.9rem;"></i></div><div style="flex:1;font-size:.82rem;font-weight:500;color:#ccc;">Biology</div><input type="number" id="in-n-bio-'+uid+'" min="0" max="100" placeholder="00" style="width:60px;background:transparent;border:none;color:#fff;font-family:\'Space Grotesk\',sans-serif;font-size:1rem;font-weight:700;text-align:right;outline:none;" oninput="updateNonTotal(\''+uid+'\')"><div style="font-size:.75rem;color:#444;font-weight:600;">/100</div></div><div style="display:flex;align-items:center;gap:12px;margin:16px 0;"><div style="flex:1;height:1px;background:#111;"></div><div style="font-size:.6rem;font-weight:700;color:#333;letter-spacing:.1em;">OR</div><div style="flex:1;height:1px;background:#111;"></div></div>'+pillInput('n-agg','fa-solid fa-layer-group','Total Aggregate',400,uid,'updateNonSubjects(\''+uid+'\')')+pillInput('n-kcet-total','fa-solid fa-list-check','Total KCET',180,uid)+pillInput('n-kbio','fa-solid fa-dna','Biology KCET',60,uid)+pillInput('n-kmat','fa-solid fa-square-root-variable','Maths KCET',60,uid)+'<button onclick="calcNon(\''+uid+'\')" style="width:100%;margin-top:18px;padding:16px;background:#fff;color:#000;border:none;border-radius:14px;font-size:.85rem;font-weight:700;font-family:\'Space Grotesk\',sans-serif;letter-spacing:.04em;cursor:pointer;" onmouseover="this.style.opacity=\'.85\'" onmouseout="this.style.opacity=\'1\'">Get Prediction</button><div id="non-result-'+uid+'" style="display:none;margin-top:18px;"></div></div><div style="padding:12px 22px;border-top:1px solid #111;display:flex;align-items:center;gap:6px;"><div style="width:5px;height:5px;border-radius:50%;background:#333;"></div><div style="font-size:.58rem;color:#333;letter-spacing:.06em;text-transform:uppercase;">Estimated · Not official KEA data</div></div></div>';
    container.appendChild(card);if(typeof window.scrollEsToBottom==='function')window.scrollEsToBottom();
  }

  window.switchKcetTab=(uid,tab)=>{const et=document.getElementById('tab-eng-'+uid),nt=document.getElementById('tab-non-'+uid),ep=document.getElementById('eng-'+uid),np=document.getElementById('non-'+uid);if(tab==='eng'){et.style.background='#fff';et.style.color='#000';nt.style.background='transparent';nt.style.color='#666';ep.style.display='block';np.style.display='none';}else{nt.style.background='#fff';nt.style.color='#000';et.style.background='transparent';et.style.color='#666';np.style.display='block';ep.style.display='none';}};
  window.updateEngTotal=(uid)=>{const mat=getVal('in-e-mat-'+uid),phy=getVal('in-e-phy-'+uid),che=getVal('in-e-che-'+uid);const t=mat+phy+che;if(t>0)document.getElementById('in-e-agg-'+uid).value=t;};
  window.updateEngSubjects=(uid)=>{const agg=getVal('in-e-agg-'+uid);if(agg>0){['mat','phy','che'].forEach(s=>document.getElementById('in-e-'+s+'-'+uid).value='');}};
  window.updateNonTotal=(uid)=>{const mat=getVal('in-n-mat-'+uid),phy=getVal('in-n-phy-'+uid),che=getVal('in-n-che-'+uid),bio=getVal('in-n-bio-'+uid);const t=mat+phy+che+bio;if(t>0)document.getElementById('in-n-agg-'+uid).value=t;};
  window.updateNonSubjects=(uid)=>{const agg=getVal('in-n-agg-'+uid);if(agg>0){['mat','phy','che','bio'].forEach(s=>document.getElementById('in-n-'+s+'-'+uid).value='');}};
  window.calcEng=(uid)=>{let phy=getVal('in-e-phy-'+uid),che=getVal('in-e-che-'+uid),mat=getVal('in-e-mat-'+uid);const agg=getVal('in-e-agg-'+uid),kcet=getVal('in-e-kcet-'+uid);if(agg>0&&phy+che+mat===0){phy=che=mat=agg/3;}const bt=phy+che+mat;if(bt===0){alert('Enter Board marks');return;}if(kcet<0||kcet>180){alert('KCET marks: 0–180');return;}const bp=(bt/300)*100,kp=(kcet/180)*100,rank=computeRank(bp,kp),band=rankBand(rank);const res=document.getElementById('eng-result-'+uid);res.style.display='block';res.innerHTML='<div style="background:#000;border:1px solid #1a1a1a;border-radius:16px;padding:20px;text-align:center;"><div style="font-size:.58rem;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#444;margin-bottom:12px;">Predicted Engineering Rank</div><div style="font-size:3rem;font-weight:700;letter-spacing:-.04em;color:#fff;line-height:1;">'+rank.toLocaleString('en-IN')+'</div><div style="font-size:.7rem;font-weight:600;color:'+band.color+';margin-top:8px;letter-spacing:.1em;text-transform:uppercase;">'+band.label+'</div><div style="display:flex;justify-content:center;gap:20px;margin-top:14px;padding-top:14px;border-top:1px solid #111;font-size:.65rem;color:#444;"><span>BOARD '+bp.toFixed(1)+'%</span><span>KCET '+kp.toFixed(1)+'%</span><span>INDEX '+((bp+kp)/2).toFixed(1)+'</span></div><button onclick="launchCollegePredictor('+rank+',\'eng\')" style="width:100%;margin-top:16px;padding:12px;background:#0a0a0a;color:#666;border:1px solid #1a1a1a;border-radius:12px;font-size:.75rem;font-weight:700;font-family:\'Space Grotesk\',sans-serif;letter-spacing:.06em;cursor:pointer;" onmouseover="this.style.color=\'#fff\'" onmouseout="this.style.color=\'#666\'">📋 SHOW COLLEGE SHORTLIST</button></div><div onclick="launchKcetPredictor()" style="text-align:center;margin-top:12px;font-size:.65rem;color:#444;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;padding:8px;">⟳ NEW PREDICTION</div>';if(typeof window.scrollEsToBottom==='function')window.scrollEsToBottom();};
  window.calcNon=(uid)=>{let phy=getVal('in-n-phy-'+uid),che=getVal('in-n-che-'+uid),mat=getVal('in-n-mat-'+uid),bio=getVal('in-n-bio-'+uid);const agg=getVal('in-n-agg-'+uid),kt=getVal('in-n-kcet-total-'+uid),kb=getVal('in-n-kbio-'+uid),km=getVal('in-n-kmat-'+uid);if(agg>0&&phy+che+mat+bio===0){phy=che=mat=bio=agg/4;}const bt=phy+che+mat+bio;if(bt===0){alert('Enter Board marks');return;}if(kt===0||kb===0||km===0){alert('Enter KCET marks: Total + Biology + Maths required');return;}if(kt>180||kb>60||km>60){alert('Invalid KCET marks');return;}const rem=kt-kb-km,kphy=rem/2,kche=rem/2;const bp=(bt/400)*100;const pp=((kphy+kche+kb)/180)*100,pr=computeRank(bp,pp);const ep=((kphy+kche+km)/180)*100,er=computeRank(bp,ep);const res=document.getElementById('non-result-'+uid);res.style.display='block';res.innerHTML='<div style="display:flex;gap:10px;">'+resultBlock('Pharma Rank',pr,bp,pp)+resultBlock('Engg Rank',er,bp,ep)+'</div><div style="display:flex;gap:8px;margin-top:12px;"><button onclick="launchCollegePredictor('+pr+',\'pharma\')" style="flex:1;padding:10px;background:#0a0a0a;color:#666;border:1px solid #1a1a1a;border-radius:10px;font-size:.68rem;font-weight:700;font-family:\'Space Grotesk\',sans-serif;cursor:pointer;" onmouseover="this.style.color=\'#fff\'" onmouseout="this.style.color=\'#666\'">📋 PHARMA COLLEGES</button><button onclick="launchCollegePredictor('+er+',\'eng\')" style="flex:1;padding:10px;background:#0a0a0a;color:#666;border:1px solid #1a1a1a;border-radius:10px;font-size:.68rem;font-weight:700;font-family:\'Space Grotesk\',sans-serif;cursor:pointer;" onmouseover="this.style.color=\'#fff\'" onmouseout="this.style.color=\'#666\'">📋 ENG COLLEGES</button></div><div style="margin-top:14px;padding-top:14px;border-top:1px solid #111;display:flex;justify-content:center;gap:20px;font-size:.62rem;color:#444;"><span>BOARD '+bp.toFixed(1)+'%</span><span>PCB '+pp.toFixed(1)+'%</span><span>PCM '+ep.toFixed(1)+'%</span></div><div onclick="launchKcetPredictor()" style="text-align:center;margin-top:12px;font-size:.65rem;color:#444;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;padding:8px;">⟳ NEW PREDICTION</div>';if(typeof window.scrollEsToBottom==='function')window.scrollEsToBottom();};

  window.launchKcetPredictor=launchKcetPredictor;
  window.launchCollegePredictor=launchCollegePredictor;

  /* ── INTERCEPT doEsSearch ── */

  // Keywords that Disha owns — if ANY of these appear in the query,
  // Disha handles it. Everything else falls through to originalSearch.
  const DISHA_KEYWORDS = [
    // identity & memory
    'my name','who am i','who are you','what are you','your name',
    'call me','remember','i am','i\'m',
    // greetings / small talk
    'hi','hello','hey','yo','good morning','good afternoon','good evening','good night',
    'how are you','how r u','what\'s up','bye','goodbye','thanks','thank you','thx',
    // math & numbers
    'calc','calculate','compute','solve','eval','sqrt','sin','cos','tan','log','factorial',
    'prime','factor','roman','morse','base64','binary','decimal','hex','octal',
    // conversions
    ' to ',' in km',' in mi',' in kg',' in lb',' in mb',' in gb',' in ml',
    ' km to',' mi to',' kg to',' lb to',' c to',' f to',' mb to',' gb to',
    'convert','conversion',
    // weather & time
    'weather','temperature','forecast','humidity','rain','climate',
    'time in','time at','what time','current time','date','today','what day',
    'timer','countdown','remind me',
    // tools
    'password','generate password','uuid','guid','generate id',
    'word count','char count','count words','base64','regex','regexp',
    'color of','colour of','hex code','rgb of','color #','colour #',
    // finance
    'emi','loan','mortgage','% of','percent of','tip ',
    'born in','how old','age from',
    // knowledge
    'define','definition','meaning of','explain','full form',
    'what is ','what are ','who is ','who was ','who made ','who created ',
    'capital of','largest ','tallest ','deepest ','longest ','fastest ',
    'speed of','distance from','age of','formula of','atomic number',
    'founder of','ceo of','prime minister','president of',
    // kcet
    'kcet','kea','rank predict','predict rank','college for rank','colleges for',
    // easter eggs & fun
    'meaning of life','are you sentient','do you dream','tell me a joke',
    'hack the planet','sudo','hello world','coffee','love','marry me',
    // help
    'help','what can you do','features','commands','abilities',
  ];

  function dishaOwns(lower) {
    return DISHA_KEYWORDS.some(kw => lower.includes(kw));
  }

  document.addEventListener('DOMContentLoaded',()=>{
    if(typeof window.doEsSearch==='function'){
      const orig=window.doEsSearch;
      window.doEsSearch=async function(val){
        if(!val||!val.trim())return;
        const query=val.trim(),lower=query.toLowerCase().trim();
        const container=document.getElementById('es-messages');
        const greet=document.getElementById('es-greeting');if(greet)greet.style.display='none';

        // ── If Disha doesn't own this query, pass to original search ──
        if(!dishaOwns(lower)){orig(val);return;}

        // ── Disha owns it — show user bubble ──
        if(typeof window.appendEsBubbleUser==='function'){window.appendEsBubbleUser(query);}
        else{const b=document.createElement('div');b.className='es-bubble-user';b.textContent=query;if(container)container.appendChild(b);}
        const inputEl=document.getElementById('es-input');if(inputEl)inputEl.value='';
        document.getElementById('es-send')?.classList.remove('visible');

        // ── KCET predictor widget ──
        if(/kcet|rank\s*predict|predict\s*rank/i.test(lower)&&!/college.*\d|\d.*college/i.test(lower)){
          setTimeout(launchKcetPredictor,280);return;
        }
        // ── College shortlist widget ──
        const cm=lower.match(/college[s]?\s*(?:for\s*)?(?:rank\s*)?(\d+)(?:\s*(pharma|pharmacy|engineering|engg|eng))?/i);
        if(cm){const rank=parseInt(cm[1]);const type=/pharma/i.test(cm[2]||'')?'pharma':'eng';setTimeout(()=>launchCollegePredictor(rank,type),280);return;}

        // ── AI response ──
        const sysBubble=document.createElement('div');sysBubble.className='es-bubble-sys';
        const contentDiv=document.createElement('div');contentDiv.className='ai-response-content';
        contentDiv.style.cssText='font-size:.88rem;color:var(--text);line-height:1.6;';
        sysBubble.appendChild(contentDiv);if(container)container.appendChild(sysBubble);
        contentDiv.innerHTML='<span style="color:#007aff;">▌</span>';
        try{
          const answer=await LocalAI.respond(query);
          await typewriteText(contentDiv,answer);
        }catch(err){contentDiv.innerHTML='<span style="color:#ef4444;">⚠️ '+err.message+'</span>';}
        if(typeof window.scrollEsToBottom==='function')window.scrollEsToBottom();
      };
    }
  });

})();
