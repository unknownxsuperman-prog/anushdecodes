/**
 * x0s.link – Disha Intelligence Extensions Module (Production Build)
 * LOCAL AI + Live Weather + Math + News + Utilities + Smart Search + KCET Predictor
 * Zero external AI APIs – everything runs on-device except weather/news APIs
 */
(function () {
  'use strict';

  // ========== CONFIGURATION ==========
  const CONFIG = {
    weatherApiKey: '0222762e4fd7dc746123423914f0dca7', // Rotate this in production
    defaultCity: 'Mumbai',
    newsApiKey: null,
    currencyApiBase: 'https://api.exchangerate-api.com/v4/latest/',
    typingSpeed: 12,
    maxHistory: 50
  };

  // ========== STATE MANAGEMENT ==========
  const State = {
    history: [],
    context: {
      lastCity: null,
      lastTopic: null,
      lastIntent: null,
      lastQuery: null,
      sessionStart: Date.now()
    },
    stats: {
      queriesHandled: 0,
      mathSolved: 0,
      weatherFetched: 0
    }
  };

  // ========== LOCAL AI ENGINE ==========
  const LocalAI = {
    async respond(query) {
      const q = query.trim();
      if (!q) return "I didn't catch that. Could you repeat?";

      const lower = q.toLowerCase();
      State.stats.queriesHandled++;
      State.history.push({ query: q, time: Date.now() });
      if (State.history.length > CONFIG.maxHistory) State.history.shift();

      if (lower.match(/^(and |what about |how about |also |plus )/i) && State.context.lastIntent) {
        return this.handleFollowUp(lower);
      }

      const intents = [
        { name: 'calculator', patterns: [/^(calc|calculate|compute|solve|eval)\s+/i, /^[\d\s+\-*/().^%]+$/, /^(what is|what's)\s+[\d\s+\-*/().^%]+/i], priority: 10 },
        { name: 'converter', patterns: [/\b(convert|conversion)\b/i, /\b(\d+\s*(km|mi|kg|lb|°c|°f|c|f|usd|eur|inr|gbp))\b/i, /\b(km to mi|miles to km|kg to lbs|celsius to fahrenheit|usd to inr)\b/i], priority: 9 },
        { name: 'weather', patterns: [/\b(weather|temperature|forecast|humidity|wind in)\b/i], priority: 9 },
        { name: 'time', patterns: [/\b(time|clock|current time)\s+(in|at|for)\b/i, /\bwhat\s+time\b/i], priority: 8 },
        { name: 'date', patterns: [/\b(date|today|day|what day)\b/i], priority: 8 },
        { name: 'timer', patterns: [/\b(timer|countdown|set a timer|remind me in)\b/i], priority: 8 },
        { name: 'news', patterns: [/\b(news|headlines|current affairs|updates|breaking|latest)\b/i], priority: 7 },
        { name: 'definition', patterns: [/\b(define|definition|meaning of|what is|what are|explain)\b/i], priority: 7 },
        { name: 'translate', patterns: [/\b(translate|in spanish|in french|in hindi|in german|meaning in)\b/i], priority: 7 },
        { name: 'stock', patterns: [/\b(stock|share price|ticker|nasdaq|nse|bse|market)\b/i], priority: 6 },
        { name: 'todo', patterns: [/\b(todo|task|add task|remind me to|remember to)\b/i], priority: 6 },
        { name: 'note', patterns: [/\b(note|save this|remember that|write down| jot)\b/i], priority: 6 },
        { name: 'password', patterns: [/\b(password|generate password|strong password|secure password)\b/i], priority: 5 },
        { name: 'uuid', patterns: [/\b(uuid|guid|generate id|unique id)\b/i], priority: 5 },
        { name: 'greeting', patterns: [/^(hi|hello|hey|yo|good\s(morning|afternoon|evening))/i], priority: 1 },
        { name: 'farewell', patterns: [/\b(bye|goodbye|see\syou|tata|later)\b/i], priority: 1 },
        { name: 'who_are_you', patterns: [/\b(who\s(are|r)\s?(you|u)|your\sname|what\s(are|r)\s?(you|u))\b/i], priority: 1 },
        { name: 'what_can_you_do', patterns: [/\b(what\s(can|do)\s(you|u)\s(do|help)|abilities|features|commands)\b/i], priority: 1 },
        { name: 'creator', patterns: [/\b(who\s(created|made|built)\s?(you|u)|your\screator|who made you)\b/i], priority: 1 },
        { name: 'thanks', patterns: [/\b(thanks|thank\s?(you|u)|thx|ty|appreciate)\b/i], priority: 1 },
        { name: 'how_are_you', patterns: [/\b(how\s(are|r)\s?(you|u)|what'?s\sup|how you doing)\b/i], priority: 1 },
        { name: 'help', patterns: [/\b(help|assist|support|how to use|commands)\b/i], priority: 1 },
        { name: 'general', patterns: [/.*/], priority: 0 }
      ];

      let bestMatch = null;
      let bestScore = -1;
      for (const intent of intents) {
        for (const pattern of intent.patterns) {
          if (pattern.test(lower)) {
            const score = intent.priority * 10 + (pattern.source.length > 5 ? 5 : 0);
            if (score > bestScore) {
              bestScore = score;
              bestMatch = intent.name;
            }
          }
        }
      }

      State.context.lastIntent = bestMatch;
      State.context.lastQuery = q;

      switch (bestMatch) {
        case 'calculator': return this.handleCalculator(q, lower);
        case 'converter': return this.handleConverter(q, lower);
        case 'weather': return await this.getWeatherReport(lower);
        case 'time': return this.handleTime(lower);
        case 'date': return this.handleDate();
        case 'timer': return this.handleTimer(lower);
        case 'news': return this.handleNews(lower);
        case 'definition': return this.handleDefinition(lower);
        case 'translate': return this.handleTranslate(q, lower);
        case 'stock': return this.handleStock(lower);
        case 'todo': return this.handleTodo(q, lower);
        case 'note': return this.handleNote(q, lower);
        case 'password': return this.generatePassword(lower);
        case 'uuid': return this.generateUUID();
        case 'greeting': return this.respondGreeting();
        case 'farewell': return this.respondFarewell();
        case 'who_are_you': return this.respondIdentity();
        case 'what_can_you_do': return this.respondCapabilities();
        case 'creator': return this.respondCreator();
        case 'thanks': return this.respondThanks();
        case 'how_are_you': return this.respondStatus();
        case 'help': return this.respondHelp();
        default: return this.respondGeneralKnowledge(lower);
      }
    },

    handleCalculator(query, lower) {
      State.stats.mathSolved++;
      let expr = query.replace(/^(calc|calculate|compute|solve|eval|what is|what's)\s+/i, '').trim();
      expr = expr.replace(/\^/g, '**').replace(/×/g, '*').replace(/÷/g, '/');
      const unitMatch = expr.match(/^(\d+(?:\.\d+)?)\s*(km|mi|kg|lb|°c|°f|c|f)\s*(to|in|=)\s*(km|mi|kg|lb|°c|°f|c|f)$/i);
      if (unitMatch) {
        return this.convertUnits(parseFloat(unitMatch[1]), unitMatch[2], unitMatch[4]);
      }
      try {
        if (!/^[\d\s+\-*/().%^]+$/.test(expr)) throw new Error('Invalid characters');
        const result = Function('"use strict"; return (' + expr + ')')();
        if (!isFinite(result)) throw new Error('Result not finite');
        return `**${expr}** = **${result.toLocaleString('en-IN')}**`;
      } catch (e) {
        return `⚠️ **Calculation Error**: ${e.message || 'Invalid expression'}\nTry: \`calc 15 * 23.5\` or \`45 km to mi\``;
      }
    },

    handleConverter(query, lower) {
      const match = query.match(/(\d+(?:\.\d+)?)\s*(km|mi|miles|kg|lb|pounds|°c|°f|c|f|usd|eur|inr|gbp|jpy)\s*(?:to|in|=)\s*(km|mi|miles|kg|lb|pounds|°c|°f|c|f|usd|eur|inr|gbp|jpy)/i);
      if (match) {
        return this.convertUnits(parseFloat(match[1]), match[2], match[3]);
      }
      return "Usage: \`convert 100 km to mi\` or \`25 °c to f\` or \`100 USD to INR\`";
    },

    convertUnits(value, from, to) {
      from = from.toLowerCase().replace('°', '').replace('miles', 'mi').replace('pounds', 'lb');
      to = to.toLowerCase().replace('°', '').replace('miles', 'mi').replace('pounds', 'lb');
      const conversions = {
        'km-mi': v => v * 0.621371, 'mi-km': v => v * 1.60934,
        'kg-lb': v => v * 2.20462, 'lb-kg': v => v * 0.453592,
        'c-f': v => (v * 9/5) + 32, 'f-c': v => (v - 32) * 5/9,
        'usd-inr': v => v * 83.5, 'inr-usd': v => v / 83.5,
        'usd-eur': v => v * 0.92, 'eur-usd': v => v / 0.92,
        'usd-gbp': v => v * 0.79, 'gbp-usd': v => v / 0.79,
        'usd-jpy': v => v * 150, 'jpy-usd': v => v / 150
      };
      const key = `${from}-${to}`;
      if (conversions[key]) {
        const result = conversions[key](value);
        return `**${value} ${from.toUpperCase()}** = **${result.toFixed(2)} ${to.toUpperCase()}**`;
      }
      return `❌ Conversion from **${from}** to **${to}** not supported yet.`;
    },

    async getWeatherReport(query) {
      const cityMatch = query.match(/(?:weather|temperature|forecast)\s+(?:in|for|at)?\s*([a-zA-Z\s]+?)(?:\s+(?:today|now|tomorrow|forecast))?$|([a-zA-Z\s]+?)\s+(?:weather|temperature)/i);
      let city = (cityMatch?.[1] || cityMatch?.[2] || State.context.lastCity || CONFIG.defaultCity).trim();
      State.context.lastCity = city;
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${CONFIG.weatherApiKey}&units=metric`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(response.status === 404 ? 'City not found' : 'API error');
        const data = await response.json();
        const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        return `
          <div class="weather-card" style="display:flex; align-items:center; gap:16px; padding:16px; background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius:12px; border:1px solid #334155;">
            <img src="${iconUrl}" style="width:80px; height:80px; filter:drop-shadow(0 0 10px rgba(255,255,255,0.1));" alt="${data.weather[0].description}">
            <div style="flex:1;">
              <div style="font-size:1.1rem; font-weight:600; color:#e2e8f0; margin-bottom:4px;">${data.name}, ${data.sys.country}</div>
              <div style="font-size:2.5rem; font-weight:700; color:#f8fafc; line-height:1;">${Math.round(data.main.temp)}°C</div>
              <div style="text-transform:capitalize; color:#94a3b8; font-size:0.9rem; margin-top:4px;">${data.weather[0].description}</div>
              <div style="display:flex; gap:16px; margin-top:12px; font-size:0.8rem; color:#64748b;">
                <span>💧 ${data.main.humidity}%</span>
                <span>💨 ${data.wind.speed} m/s</span>
                <span>🌅 ${sunrise}</span>
                <span>🌇 ${sunset}</span>
              </div>
            </div>
          </div>`;
      } catch (err) {
        return `⚠️ Weather unavailable for "${city}": ${err.message}. Try a major city.`;
      }
    },

    handleTime(query) {
      const cityMatch = query.match(/time\s+(?:in|at|for)?\s*([a-zA-Z\s]+)/i);
      let timezone = 'Asia/Kolkata';
      const tzMap = {
        'london': 'Europe/London', 'new york': 'America/New_York', 'ny': 'America/New_York',
        'tokyo': 'Asia/Tokyo', 'sydney': 'Australia/Sydney', 'dubai': 'Asia/Dubai',
        'singapore': 'Asia/Singapore', 'berlin': 'Europe/Berlin', 'paris': 'Europe/Paris',
        'los angeles': 'America/Los_Angeles', 'la': 'America/Los_Angeles', 'chicago': 'America/Chicago',
        'beijing': 'Asia/Shanghai', 'shanghai': 'Asia/Shanghai', 'moscow': 'Europe/Moscow',
        'mumbai': 'Asia/Kolkata', 'delhi': 'Asia/Kolkata', 'bangalore': 'Asia/Kolkata',
        'kolkata': 'Asia/Kolkata', 'chennai': 'Asia/Kolkata'
      };
      if (cityMatch) {
        const city = cityMatch[1].trim().toLowerCase();
        timezone = tzMap[city] || timezone;
      }
      const now = new Date().toLocaleString('en-IN', { timeZone: timezone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' });
      return `🕐 **${now}**`;
    },

    handleDate() {
      const now = new Date();
      const daysLeft = Math.ceil((new Date(now.getFullYear(), 11, 31) - now) / (1000 * 60 * 60 * 24));
      return `📅 **${now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**\n\n${daysLeft} days remaining in ${now.getFullYear()}.`;
    },

    handleTimer(query) {
      const match = query.match(/(\d+)\s*(min|minute|sec|second|hour|hr)s?/i);
      if (match) {
        const val = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        let ms = val * 1000;
        if (unit.startsWith('min')) ms = val * 60 * 1000;
        if (unit.startsWith('hour') || unit === 'hr') ms = val * 60 * 60 * 1000;
        setTimeout(() => {
          if (typeof window.notifyUser === 'function') window.notifyUser(`⏰ Timer: ${val} ${unit}${val > 1 ? 's' : ''} up!`);
        }, ms);
        return `⏱️ Timer set for **${val} ${unit}${val > 1 ? 's' : ''}**. I'll notify you when it's done.`;
      }
      return "Usage: \`timer 5 minutes\` or \`set timer 30 seconds\`";
    },

    handleNews(query) {
      const topics = ['tech', 'india', 'business', 'sports', 'science', 'health', 'politics', 'entertainment'];
      const topic = topics.find(t => query.includes(t)) || State.context.lastTopic || 'general';
      State.context.lastTopic = topic;
      const feeds = {
        tech: [
          { title: "Apple unveils M4 Ultra chip with 32-core neural engine", summary: "New silicon promises 50% faster AI inference for on-device models.", time: "2h ago", source: "TechCrunch" },
          { title: "Open-source LLMs close gap on GPT-4 in coding benchmarks", summary: "DeepSeek-Coder-V2 and Llama-3-70B show competitive performance.", time: "4h ago", source: "Ars Technica" }
        ],
        india: [
          { title: "ISRO successfully tests reusable launch vehicle landing", summary: "RLV-TD autonomous landing marks milestone in space shuttle program.", time: "1h ago", source: "The Hindu" },
          { title: "UPI transactions cross 15 billion monthly volume", summary: "NPCI reports record digital payments growth in Q1 2026.", time: "3h ago", source: "Economic Times" }
        ],
        business: [
          { title: "Fed signals potential rate cut in July meeting", summary: "Inflation cooling faster than expected, markets rally on news.", time: "30m ago", source: "Reuters" },
          { title: "Tesla India factory plans advance with state approvals", summary: "Gujarat and Maharashtra compete for $2B manufacturing unit.", time: "5h ago", source: "Bloomberg" }
        ]
      };
      const feed = feeds[topic] || feeds.tech;
      let html = `<div style="margin-bottom:12px; font-size:0.75rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.1em;">📰 ${topic.toUpperCase()} NEWS</div>`;
      feed.forEach(item => {
        html += `
          <div class="news-card" style="padding:12px; margin-bottom:8px; background:#0a0a0a; border-left:3px solid var(--accent); border-radius:0 8px 8px 0;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
              <span style="font-size:0.85rem; font-weight:600; color:var(--text); line-height:1.3;">${item.title}</span>
              <span style="font-size:0.65rem; color:var(--muted); white-space:nowrap; margin-left:8px;">${item.time}</span>
            </div>
            <div style="font-size:0.78rem; color:var(--muted); line-height:1.4; margin-bottom:6px;">${item.summary}</div>
            <div style="font-size:0.65rem; color:#475569; font-weight:500;">${item.source}</div>
          </div>`;
      });
      return html;
    },

    handleDefinition(query) {
      let term = query.replace(/(what\s(is|are|does)\s+|define\s+|meaning\sof\s+|explain\s+)/i, '').replace(/\?/g, '').trim().toLowerCase();
      const key = term.replace(/\s+/g, '_');
      const defs = {
        photosynthesis: "Process by which green plants use sunlight to synthesize nutrients from CO₂ and water.",
        gravity: "Natural phenomenon by which all things with mass are brought toward one another.",
        algorithm: "Finite set of well-defined instructions for solving a problem or accomplishing a task.",
        ai: "Artificial Intelligence – simulation of human intelligence in machines.",
        machine_learning: "Subset of AI where systems learn patterns from data without explicit programming.",
        blockchain: "Distributed ledger technology maintaining immutable, decentralized transaction records.",
        dns: "Domain Name System – translates human-readable domain names to IP addresses.",
        api: "Application Programming Interface – allows software applications to communicate.",
        rest: "Representational State Transfer – architectural style for designing networked applications.",
        graphql: "Query language for APIs allowing clients to request exactly the data they need.",
        docker: "Platform for developing, shipping, and running applications in containers.",
        kubernetes: "Open-source system for automating deployment, scaling, and management of containerized applications.",
        sql: "Structured Query Language – standard language for relational database management.",
        nosql: "Non-relational database approach for unstructured or semi-structured data.",
        latency: "Time delay between cause and effect in a system, critical in networking.",
        throughput: "Rate of production or processing, often measured in requests per second.",
        recursion: "Function calling itself to solve problems by breaking them into smaller sub-problems.",
        big_o: "Notation describing performance or complexity of an algorithm.",
        ci_cd: "Continuous Integration / Continuous Deployment – automated software delivery practices.",
        oauth: "Open standard for access delegation, commonly used for token-based authentication."
      };
      if (defs[key]) return `**${term}**: ${defs[key]}`;
      const partial = Object.keys(defs).find(k => k.includes(term) || term.includes(k));
      if (partial) return `**${partial.replace(/_/g, ' ')}**: ${defs[partial]}`;
      return `I don't have "${term}" in my local knowledge base. Try a web search or ask about: ${Object.keys(defs).slice(0, 5).join(', ')}...`;
    },

    handleTranslate(query, lower) {
      const match = query.match(/translate\s+["']?(.+?)["']?\s+(?:to|in)\s+(\w+)/i) || query.match(/["']?(.+?)["']?\s+(?:in|to)\s+(\w+)/i);
      if (!match) return "Usage: \`translate 'Hello' to Hindi\` or \`Good morning in Spanish\`";
      const [, text, lang] = match;
      const translations = {
        'hello': { spanish: 'Hola', french: 'Bonjour', german: 'Hallo', hindi: 'नमस्ते', japanese: 'こんにちは', chinese: '你好', arabic: 'مرحبا', russian: 'Привет' },
        'thank you': { spanish: 'Gracias', french: 'Merci', german: 'Danke', hindi: 'धन्यवाद', japanese: 'ありがとう', chinese: '谢谢', arabic: 'شكراً', russian: 'Спасибо' },
        'good morning': { spanish: 'Buenos días', french: 'Bonjour', german: 'Guten Morgen', hindi: 'सुप्रभात', japanese: 'おはようございます', chinese: '早上好', arabic: 'صباح الخير', russian: 'Доброе утро' },
        'good night': { spanish: 'Buenas noches', french: 'Bonne nuit', german: 'Gute Nacht', hindi: 'शुभ रात्रि', japanese: 'おやすみなさい', chinese: '晚安', arabic: 'تصبح على خير', russian: 'Спокойной ночи' },
        'how are you': { spanish: '¿Cómo estás?', french: 'Comment allez-vous?', german: 'Wie geht es dir?', hindi: 'आप कैसे हैं?', japanese: 'お元気ですか？', chinese: '你好吗？', arabic: 'كيف حالك؟', russian: 'Как дела?' }
      };
      const key = text.toLowerCase().trim();
      const targetLang = lang.toLowerCase();
      if (translations[key]?.[targetLang]) {
        return `**${text}** → **${translations[key][targetLang]}** (${targetLang})`;
      }
      return `Local translation for "${text}" in ${targetLang} not available. Supported: hello, thank you, good morning, good night, how are you.`;
    },

    handleStock(query) {
      const match = query.match(/\b([A-Z]{1,5})\b/i);
      const ticker = match ? match[1].toUpperCase() : 'AAPL';
      const stocks = {
        'AAPL': { price: 189.52, change: '+1.2%', name: 'Apple Inc.' },
        'GOOGL': { price: 142.18, change: '-0.4%', name: 'Alphabet Inc.' },
        'TSLA': { price: 245.67, change: '+2.1%', name: 'Tesla, Inc.' },
        'MSFT': { price: 378.91, change: '+0.8%', name: 'Microsoft Corp.' },
        'NVDA': { price: 892.45, change: '+3.2%', name: 'NVIDIA Corp.' },
        'RELIANCE': { price: 2847.30, change: '+0.5%', name: 'Reliance Industries', currency: '₹' },
        'TCS': { price: 3892.15, change: '-0.2%', name: 'Tata Consultancy', currency: '₹' },
        'INFY': { price: 1523.40, change: '+1.1%', name: 'Infosys Ltd', currency: '₹' }
      };
      const stock = stocks[ticker];
      if (!stock) return `Stock data for ${ticker} not in local cache. Try: AAPL, GOOGL, TSLA, MSFT, NVDA, RELIANCE, TCS, INFY.`;
      const color = stock.change.startsWith('+') ? '#22c55e' : '#ef4444';
      return `
        <div style="display:flex; align-items:center; gap:12px; padding:12px; background:#0a0a0a; border-radius:8px; border:1px solid #1a1a1a;">
          <div style="font-size:1.5rem;">📈</div>
          <div>
            <div style="font-weight:600; color:var(--text);">${stock.name} (${ticker})</div>
            <div style="font-size:1.3rem; font-weight:700; color:var(--text);">${stock.currency || '$'}${stock.price}</div>
            <div style="color:${color}; font-size:0.9rem; font-weight:600;">${stock.change}</div>
          </div>
        </div>`;
    },

    handleTodo(query, lower) {
      const task = query.replace(/(add|create|set|remind me to|remember to)\s+(a\s+)?(task|todo|reminder)?\s*/i, '').trim();
      if (!task || task === query) return "Usage: \`add task review pull requests\` or \`remind me to call mom\`";
      const todos = JSON.parse(localStorage.getItem('disha_todos') || '[]');
      todos.push({ task, created: Date.now(), done: false });
      localStorage.setItem('disha_todos', JSON.stringify(todos));
      return `✅ Added to your list: **"${task}"**\nYou have ${todos.length} task${todos.length > 1 ? 's' : ''} total.`;
    },

    handleNote(query, lower) {
      const note = query.replace(/(save|remember|write down|note|jot)\s+(this|that)?\s*/i, '').trim();
      if (!note || note === query) return "Usage: \`note API key is in the vault\` or \`remember that meeting is at 3pm\`";
      const notes = JSON.parse(localStorage.getItem('disha_notes') || '[]');
      notes.push({ note, created: Date.now() });
      localStorage.setItem('disha_notes', JSON.stringify(notes));
      return `📝 Saved: **"${note}"**`;
    },

    generatePassword(query) {
      const lenMatch = query.match(/(\d+)\s*(char|digit|length)/i);
      const length = lenMatch ? Math.min(parseInt(lenMatch[1]), 64) : 16;
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
      let pwd = '';
      const array = new Uint32Array(length);
      crypto.getRandomValues(array);
      for (let i = 0; i < length; i++) pwd += chars[array[i] % chars.length];
      return `🔐 **Generated Password** (${length} chars):\n\`${pwd}\`\n\n*Copy this immediately — I don't store passwords.*`;
    },

    generateUUID() {
      return `🆔 **UUID v4**:\n\`${crypto.randomUUID()}\``;
    },

    handleFollowUp(query) {
      if (State.context.lastIntent === 'weather') {
        return this.getWeatherReport(query + ' ' + (State.context.lastCity || ''));
      }
      if (State.context.lastIntent === 'news') {
        return this.handleNews(query);
      }
      return "Could you be more specific? I lost track of our conversation.";
    },

    respondGreeting() {
      const hour = new Date().getHours();
      const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
      const greetings = [`${timeGreeting}! 👋 Ready to get things done?`, `${timeGreeting}! What are we working on today?`, `Hey there! I'm online and ready.`];
      return greetings[Math.floor(Math.random() * greetings.length)];
    },

    respondFarewell() {
      const sessionMins = Math.floor((Date.now() - State.context.sessionStart) / 60000);
      return `Goodbye! 👋 Session time: ${sessionMins}m. Queries handled: ${State.stats.queriesHandled}. See you tomorrow.`;
    },

    respondIdentity() {
      return "I'm **Disha**, your on-device intelligence layer for x0s.link. I handle math, weather, conversions, notes, passwords, and quick lookups — all without sending your data to AI clouds.";
    },

    respondCapabilities() {
      return `**Available commands:**
• \`calc 15 * 23.5\` — Calculator
• \`weather in London\` — Live weather
• \`convert 100 km to mi\` — Unit converter
• \`time in Tokyo\` — World clock
• \`news tech\` — Headlines
• \`define API\` — Definitions
• \`translate hello to Hindi\` — Translations
• \`stock AAPL\` — Stock prices
• \`add task review PRs\` — Todo list
• \`note meeting at 3pm\` — Quick notes
• \`password 20 chars\` — Secure password
• \`uuid\` — Generate UUID
• \`timer 5 minutes\` — Countdown timer`;
    },

    respondCreator() {
      return "Built by the x0s.link engineering team. Runs entirely in your browser — no AI APIs, no data harvesting.";
    },

    respondThanks() {
      return "Anytime. 🎯";
    },

    respondStatus() {
      return `Systems nominal. Uptime: ${Math.floor((Date.now() - State.context.sessionStart) / 1000)}s. Math solved: ${State.stats.mathSolved}. Weather checks: ${State.stats.weatherFetched}.`;
    },

    respondHelp() {
      return this.respondCapabilities();
    },

    respondGeneralKnowledge(lower) {
      const kb = [
        { keys: ['capital', 'india'], answer: "New Delhi" },
        { keys: ['capital', 'france'], answer: "Paris" },
        { keys: ['capital', 'japan'], answer: "Tokyo" },
        { keys: ['capital', 'germany'], answer: "Berlin" },
        { keys: ['capital', 'australia'], answer: "Canberra" },
        { keys: ['capital', 'canada'], answer: "Ottawa" },
        { keys: ['capital', 'brazil'], answer: "Brasília" },
        { keys: ['largest', 'ocean'], answer: "Pacific Ocean (~165M km²)" },
        { keys: ['largest', 'continent'], answer: "Asia (~44.6M km²)" },
        { keys: ['longest', 'river'], answer: "Nile (~6,650 km) or Amazon (~6,400 km) depending on measurement criteria." },
        { keys: ['tallest', 'mountain'], answer: "Mount Everest (8,848.86 m)" },
        { keys: ['deepest', 'ocean'], answer: "Mariana Trench (~10,935 m)" },
        { keys: ['speed', 'light'], answer: "299,792,458 m/s (exact, since 1983)" },
        { keys: ['pi'], answer: "π ≈ 3.141592653589793..." },
        { keys: ['golden', 'ratio'], answer: "φ ≈ 1.6180339887..." },
        { keys: ['planck', 'constant'], answer: "h ≈ 6.626 × 10⁻³⁴ J⋅s" },
        { keys: ['water', 'boil'], answer: "100°C (212°F) at 1 atm sea level" },
        { keys: ['absolute', 'zero'], answer: "0 K (-273.15°C / -459.67°F)" },
        { keys: ['human', 'bones'], answer: "206 bones (adult); 270 at birth" },
        { keys: ['human', 'dna'], answer: "~3 billion base pairs, 23 chromosome pairs" },
        { keys: ['earth', 'age'], answer: "~4.54 billion years" },
        { keys: ['universe', 'age'], answer: "~13.8 billion years" },
        { keys: ['who', 'linux'], answer: "Linus Torvalds, 1991" },
        { keys: ['who', 'python'], answer: "Guido van Rossum, 1991" },
        { keys: ['who', 'javascript'], answer: "Brendan Eich, 1995 (in 10 days)" },
        { keys: ['first', 'computer'], answer: "ENIAC (1945) or Z3 (1941) depending on definition" },
        { keys: ['tcp', 'ip'], answer: "Vint Cerf and Bob Kahn, 1974" },
        { keys: ['www'], answer: "Tim Berners-Lee, CERN, 1989" },
        { keys: ['bitcoin'], answer: "Satoshi Nakamoto (pseudonym), 2008 whitepaper" },
        { keys: ['fibonacci'], answer: "Sequence: 0, 1, 1, 2, 3, 5, 8, 13... Each number is the sum of the two preceding ones." },
        { keys: ['pythagorean'], answer: "a² + b² = c² for right triangles" },
        { keys: ['quadratic'], answer: "ax² + bx + c = 0 → x = (-b ± √(b²-4ac)) / 2a" },
        { keys: ['prime', 'number'], answer: "A natural number >1 with no positive divisors other than 1 and itself." },
        { keys: ['president', 'usa'], answer: "Donald Trump (47th President, since Jan 2025)" },
        { keys: ['prime', 'minister', 'india'], answer: "Narendra Modi (since 2014)" },
        { keys: ['ceo', 'google'], answer: "Sundar Pichai (CEO of Alphabet and Google)" },
        { keys: ['ceo', 'microsoft'], answer: "Satya Nadella (since 2014)" },
        { keys: ['ceo', 'apple'], answer: "Tim Cook (since 2011)" },
        { keys: ['richest', 'person'], answer: "Elon Musk (~$300B net worth, fluctuates)" },
      ];
      for (const item of kb) {
        if (item.keys.every(k => lower.includes(k))) {
          return `**${item.keys.map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(' ')}**: ${item.answer}`;
        }
      }
      const suggestions = [
        "Try asking about: weather, calculations, conversions, definitions, time zones, or news.",
        "I can calculate, convert units, check weather, or generate passwords. What do you need?",
        "Not in my local database. Try: `define [term]`, `calc [expression]`, or `weather in [city]`."
      ];
      return suggestions[State.stats.queriesHandled % suggestions.length];
    }
  };

  // ========== MARKDOWN + TYPEWRITER ==========
  function simpleMarkdown(md) {
    return md
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:#1e293b;padding:2px 6px;border-radius:4px;color:#7dd3fc;font-family:monospace;font-size:0.9em;">$1</code>')
      .replace(/\n/g, '<br>');
  }

  async function typewriteText(container, text) {
    container.innerHTML = '';
    const isHtml = text.trim().startsWith('<');
    if (isHtml) {
      container.innerHTML = text;
      return;
    }
    let i = 0;
    return new Promise(resolve => {
      function type() {
        if (i < text.length) {
          container.innerHTML = simpleMarkdown(text.substring(0, i + 1)) + '<span class="typing-cursor" style="color:var(--accent);animation:blink 1s infinite;">▌</span>';
          i++;
          setTimeout(type, CONFIG.typingSpeed + Math.random() * 8);
          if (typeof window.scrollEsToBottom === 'function') window.scrollEsToBottom();
        } else {
          container.innerHTML = simpleMarkdown(text);
          resolve();
        }
      }
      type();
    });
  }

  // ========== KCET PREDICTOR (REDESIGNED) ==========
  function launchKcetPredictor() {
    const container = document.getElementById('es-messages');
    if (!container) return;
    const sysBubble = document.createElement('div');
    sysBubble.className = 'es-bubble-sys';
    const uid = Date.now();

    // We'll build the HTML with two modes inside a single card.
    sysBubble.innerHTML = `
      <div class="kcet-glass-card" style="background: rgba(255,255,255,0.03); backdrop-filter: blur(25px); border: 1px solid rgba(255,255,255,0.1); border-radius: 28px; padding: 24px; color: #fff; box-shadow: 0 25px 50px rgba(0,0,0,0.5);">
        <div style="display:flex; align-items:center; gap:14px; margin-bottom:24px;">
          <div style="width:44px; height:44px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:14px; display:flex; align-items:center; justify-content:center;">
            <i class="fa-solid fa-chart-line" style="color:#fff; font-size:1.1rem;"></i>
          </div>
          <div>
            <div style="font-size:1rem; font-weight:700;">KCET Rank Engine</div>
            <div style="font-size:0.7rem; color:rgba(255,255,255,0.4); text-transform:uppercase;">Predictive Matrix // 2026</div>
          </div>
        </div>

        <!-- Mode Toggle -->
        <div style="display:flex; background:rgba(255,255,255,0.03); padding:5px; border-radius:16px; margin-bottom:24px;">
          <button id="eng-mode-${uid}" class="kcet-mode-btn" data-mode="eng" style="flex:1; padding:10px; border:none; border-radius:11px; font-size:0.75rem; font-weight:600; cursor:pointer; background:#fff; color:#000;">Engineering</button>
          <button id="non-mode-${uid}" class="kcet-mode-btn" data-mode="non" style="flex:1; padding:10px; border:none; border-radius:11px; font-size:0.75rem; font-weight:600; cursor:pointer; background:transparent; color:rgba(255,255,255,0.4);">Non-Engineering</button>
        </div>

        <!-- Engineering Panel -->
        <div id="eng-panel-${uid}">
          <div style="margin-bottom:20px;">
            <div style="font-size:0.8rem; margin-bottom:12px;">📚 Board Marks (out of 100 each)</div>
            <div id="board-toggle-eng-${uid}" style="display:flex; gap:8px; margin-bottom:12px;">
              <button class="board-mode-btn" data-mode="individual" data-target="eng" style="flex:1; padding:6px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); border-radius:8px; font-size:0.7rem; cursor:pointer;">Individual</button>
              <button class="board-mode-btn" data-mode="total" data-target="eng" style="flex:1; padding:6px; background:transparent; border:1px solid rgba(255,255,255,0.1); border-radius:8px; font-size:0.7rem; cursor:pointer;">Total /300</button>
            </div>
            <div id="eng-board-individual" style="display:flex; flex-direction:column; gap:8px;">
              ${renderSubjectInput('phy', 'Physics')}
              ${renderSubjectInput('chem', 'Chemistry')}
              ${renderSubjectInput('math', 'Mathematics')}
            </div>
            <div id="eng-board-total" style="display:none;">
              <input type="number" id="eng-total-board-${uid}" placeholder="Total board marks (0-300)" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:12px; color:#fff; outline:none;">
            </div>
          </div>
          <div style="margin-bottom:20px;">
            <div style="font-size:0.8rem; margin-bottom:12px;">📝 KCET Total Marks (out of 180)</div>
            <input type="number" id="eng-kcet-total-${uid}" placeholder="KCET total (0-180)" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:12px; color:#fff; outline:none;">
          </div>
          <button onclick="window.calcKcetEngineering('${uid}')" style="width:100%; padding:14px; background:#fff; border:none; border-radius:18px; color:#000; font-weight:700; cursor:pointer;">Predict Engineering Rank</button>
          <div id="eng-result-${uid}" style="margin-top:20px; border-top:1px solid rgba(255,255,255,0.05); padding-top:16px; display:none;"></div>
        </div>

        <!-- Non-Engineering Panel (hidden initially) -->
        <div id="non-panel-${uid}" style="display:none;">
          <div style="margin-bottom:20px;">
            <div style="font-size:0.8rem; margin-bottom:12px;">📚 Board Marks (PCMB – each out of 100)</div>
            <div id="board-toggle-non-${uid}" style="display:flex; gap:8px; margin-bottom:12px;">
              <button class="board-mode-btn" data-mode="individual" data-target="non" style="flex:1; padding:6px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); border-radius:8px; font-size:0.7rem; cursor:pointer;">Individual</button>
              <button class="board-mode-btn" data-mode="total" data-target="non" style="flex:1; padding:6px; background:transparent; border:1px solid rgba(255,255,255,0.1); border-radius:8px; font-size:0.7rem; cursor:pointer;">Total /400</button>
            </div>
            <div id="non-board-individual" style="display:flex; flex-direction:column; gap:8px;">
              ${renderSubjectInput('phy', 'Physics')}
              ${renderSubjectInput('chem', 'Chemistry')}
              ${renderSubjectInput('math', 'Mathematics')}
              ${renderSubjectInput('bio', 'Biology')}
            </div>
            <div id="non-board-total" style="display:none;">
              <input type="number" id="non-total-board-${uid}" placeholder="Total board marks (0-400)" style="width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:12px; color:#fff; outline:none;">
            </div>
          </div>
          <div style="margin-bottom:20px;">
            <div style="font-size:0.8rem; margin-bottom:12px;">🎯 KCET Subject Marks (each out of 60)</div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${renderSubjectInput('phy-kcet', 'Physics')}
              ${renderSubjectInput('chem-kcet', 'Chemistry')}
              ${renderSubjectInput('math-kcet', 'Mathematics')}
              ${renderSubjectInput('bio-kcet', 'Biology')}
            </div>
          </div>
          <button onclick="window.calcKcetNonEngineering('${uid}')" style="width:100%; padding:14px; background:#fff; border:none; border-radius:18px; color:#000; font-weight:700; cursor:pointer;">Predict Both Ranks</button>
          <div id="non-result-${uid}" style="margin-top:20px; border-top:1px solid rgba(255,255,255,0.05); padding-top:16px; display:none;"></div>
        </div>
      </div>
    `;
    container.appendChild(sysBubble);
    if (typeof window.scrollEsToBottom === 'function') window.scrollEsToBottom();

    // Attach mode switchers
    const engModeBtn = document.getElementById(`eng-mode-${uid}`);
    const nonModeBtn = document.getElementById(`non-mode-${uid}`);
    const engPanel = document.getElementById(`eng-panel-${uid}`);
    const nonPanel = document.getElementById(`non-panel-${uid}`);

    engModeBtn.onclick = () => {
      engModeBtn.style.background = '#fff'; engModeBtn.style.color = '#000';
      nonModeBtn.style.background = 'transparent'; nonModeBtn.style.color = 'rgba(255,255,255,0.4)';
      engPanel.style.display = 'block';
      nonPanel.style.display = 'none';
    };
    nonModeBtn.onclick = () => {
      nonModeBtn.style.background = '#fff'; nonModeBtn.style.color = '#000';
      engModeBtn.style.background = 'transparent'; engModeBtn.style.color = 'rgba(255,255,255,0.4)';
      nonPanel.style.display = 'block';
      engPanel.style.display = 'none';
    };

    // Board toggle handlers for Engineering
    const engToggleIndiv = document.querySelector(`#board-toggle-eng-${uid} .board-mode-btn[data-mode="individual"]`);
    const engToggleTotal = document.querySelector(`#board-toggle-eng-${uid} .board-mode-btn[data-mode="total"]`);
    const engIndivDiv = document.getElementById(`eng-board-individual`);
    const engTotalDiv = document.getElementById(`eng-board-total`);
    engToggleIndiv.onclick = () => {
      engIndivDiv.style.display = 'flex';
      engTotalDiv.style.display = 'none';
      engToggleIndiv.style.background = 'rgba(255,255,255,0.1)';
      engToggleTotal.style.background = 'transparent';
    };
    engToggleTotal.onclick = () => {
      engIndivDiv.style.disp  // ========== KCET PREDICTOR (REENGINEERED) ==========
  function launchKcetPredictor() {
    const container = document.getElementById('es-messages');
    if (!container) return;
    const sysBubble = document.createElement('div');
    sysBubble.className = 'es-bubble-sys';
    sysBubble.style.width = '100%';
    sysBubble.style.maxWidth = '680px'; // Wider, aesthetic container
    sysBubble.style.margin = '16px auto';
    
    const uid = Date.now();

    sysBubble.innerHTML = `
      <div class="kcet-monolith-card" style="background: #000000; border: 1px solid #1a1a1a; border-radius: 16px; padding: 32px; color: #ffffff; font-family: 'Space Grotesk', sans-serif; box-shadow: 0 20px 40px rgba(0,0,0,0.8); position: relative; overflow: hidden;">
        
        <!-- Subtle Top Glass Accent Line -->
        <div style="position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);"></div>

        <!-- Header Matrix -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; border-bottom: 1px solid #1a1a1a; padding-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 48px; height: 48px; background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); border: 1px solid #262626; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              <i class="fa-solid fa-layer-group" style="color: #ffffff; font-size: 1.2rem;"></i>
            </div>
            <div>
              <div style="font-size: 1.15rem; font-weight: 700; letter-spacing: -0.02em; color: #ffffff;">x0s Matrix Rank Engine</div>
              <div style="font-size: 0.68rem; color: #666666; font-family: monospace; letter-spacing: 0.15em; text-transform: uppercase; margin-top: 2px;">Predictive Analytics // KCET 2026</div>
            </div>
          </div>
          <div style="font-size: 0.62rem; color: #ffffff; background: #1a1a1a; padding: 4px 8px; border-radius: 4px; font-family: monospace; letter-spacing: 0.1em; text-transform: uppercase; border: 1px solid #262626;">
            v2.0_stable
          </div>
        </div>

        <!-- Mode Selection Matrix -->
        <div style="display: flex; background: #0a0a0a; border: 1px solid #1a1a1a; padding: 4px; border-radius: 8px; margin-bottom: 32px;">
          <button id="eng-mode-${uid}" class="kcet-mode-btn" data-mode="eng" style="flex: 1; padding: 12px; border: none; border-radius: 6px; font-size: 0.8rem; font-weight: 600; font-family: inherit; cursor: pointer; background: #ffffff; color: #000000; transition: all 0.2s ease;">Engineering Matrix</button>
          <button id="non-mode-${uid}" class="kcet-mode-btn" data-mode="non" style="flex: 1; padding: 12px; border: none; border-radius: 6px; font-size: 0.8rem; font-weight: 600; font-family: inherit; cursor: pointer; background: transparent; color: #666666; transition: all 0.2s ease;">Pharma & Split Matrix</button>
        </div>

        <!-- ================= ENGINEERING MODE PANEL ================= -->
        <div id="eng-panel-${uid}">
          <div style="margin-bottom: 28px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <div style="font-size: 0.8rem; font-weight: 600; color: #888888; text-transform: uppercase; letter-spacing: 0.05em;"><i class="fa-solid fa-graduation-cap" style="margin-right: 8px; font-size: 0.75rem;"></i> PCM Board Marks</div>
              <div id="board-toggle-eng-${uid}" style="display: flex; gap: 4px; background: #0a0a0a; padding: 2px; border-radius: 6px; border: 1px solid #1a1a1a;">
                <button class="board-mode-btn" data-mode="individual" data-target="eng" style="padding: 4px 10px; background: #1a1a1a; border: none; border-radius: 4px; font-size: 0.65rem; color: #ffffff; cursor: pointer; font-family: inherit;">Breakdown</button>
                <button class="board-mode-btn" data-mode="total" data-target="eng" style="padding: 4px 10px; background: transparent; border: none; border-radius: 4px; font-size: 0.65rem; color: #666666; cursor: pointer; font-family: inherit;">Aggregate</button>
              </div>
            </div>
            
            <div id="eng-board-individual" style="display: flex; flex-direction: column; gap: 10px;">
              ${renderWideSubjectInput('eng-phy', 'Physics Breakdown', 'fa-solid fa-atom')}
              ${renderWideSubjectInput('eng-chem', 'Chemistry Breakdown', 'fa-solid fa-flask-vial')}
              ${renderWideSubjectInput('eng-math', 'Mathematics Breakdown', 'fa-solid fa-square-root-variable')}
            </div>
            
            <div id="eng-board-total" style="display: none;">
              ${renderWideAggregateInput(`eng-total-board-${uid}`, 'PCM Cumulative Score', '0 - 300', 'fa-solid fa-calculator')}
            </div>
          </div>

          <div style="margin-bottom: 32px;">
            <div style="font-size: 0.8rem; font-weight: 600; color: #888888; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 14px;"><i class="fa-solid fa-pen-to-square" style="margin-right: 8px; font-size: 0.75rem;"></i> KCET Metrics</div>
            ${renderWideAggregateInput(`eng-kcet-total-${uid}`, 'Total Core Score Secured', '0 - 180', 'fa-solid fa-bolt')}
          </div>

          <button onclick="window.calcKcetEngineering('${uid}')" style="width: 100%; padding: 16px; background: #ffffff; border: 1px solid #ffffff; border-radius: 8px; color: #000000; font-weight: 700; font-size: 0.9rem; letter-spacing: -0.01em; cursor: pointer; font-family: inherit; transition: opacity 0.2s ease;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">Execute Predictive Evaluation</button>
          <div id="eng-result-${uid}" style="margin-top: 28px; border-top: 1px solid #1a1a1a; padding-top: 24px; display: none;"></div>
        </div>

        <!-- ================= PHARMA / SPLIT MODE PANEL ================= -->
        <div id="non-panel-${uid}" style="display: none;">
          <div style="margin-bottom: 28px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <div style="font-size: 0.8rem; font-weight: 600; color: #888888; text-transform: uppercase; letter-spacing: 0.05em;"><i class="fa-solid fa-graduation-cap" style="margin-right: 8px; font-size: 0.75rem;"></i> PCMB Board Marks</div>
              <div id="board-toggle-non-${uid}" style="display: flex; gap: 4px; background: #0a0a0a; padding: 2px; border-radius: 6px; border: 1px solid #1a1a1a;">
                <button class="board-mode-btn" data-mode="individual" data-target="non" style="padding: 4px 10px; background: #1a1a1a; border: none; border-radius: 4px; font-size: 0.65rem; color: #ffffff; cursor: pointer; font-family: inherit;">Breakdown</button>
                <button class="board-mode-btn" data-mode="total" data-target="non" style="padding: 4px 10px; background: transparent; border: none; border-radius: 4px; font-size: 0.65rem; color: #666666; cursor: pointer; font-family: inherit;">Aggregate</button>
              </div>
            </div>
            
            <div id="non-board-individual" style="display: flex; flex-direction: column; gap: 10px;">
              ${renderWideSubjectInput('non-phy', 'Physics Breakdown', 'fa-solid fa-atom')}
              ${renderWideSubjectInput('non-chem', 'Chemistry Breakdown', 'fa-solid fa-flask-vial')}
              ${renderWideSubjectInput('non-math', 'Mathematics Breakdown', 'fa-solid fa-square-root-variable')}
              ${renderWideSubjectInput('non-bio', 'Biology Breakdown', 'fa-solid fa-dna')}
            </div>
            
            <div id="non-board-total" style="display: none;">
              ${renderWideAggregateInput(`non-total-board-${uid}`, 'PCMB Cumulative Score', '0 - 400', 'fa-solid fa-calculator')}
            </div>
          </div>

          <div style="margin-bottom: 32px;">
            <div style="font-size: 0.8rem; font-weight: 600; color: #888888; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 14px;"><i class="fa-solid fa-network-wired" style="margin-right: 8px; font-size: 0.75rem;"></i> KCET Competitive Split Scores</div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${renderWideSubjectInput('non-kcet-pcm-total', 'PCM Core Total Score (for Engineering)', 'fa-solid fa-pen-ruler')}
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                ${renderWideSubjectInput('non-kcet-bio', 'Biology (0-60)', 'fa-solid fa-dna')}
                ${renderWideSubjectInput('non-kcet-math', 'Math (0-60)', 'fa-solid fa-calculator')}
              </div>
            </div>
          </div>

          <button onclick="window.calcKcetNonEngineering('${uid}')" style="width: 100%; padding: 16px; background: #ffffff; border: 1px solid #ffffff; border-radius: 8px; color: #000000; font-weight: 700; font-size: 0.9rem; letter-spacing: -0.01em; cursor: pointer; font-family: inherit; transition: opacity 0.2s ease;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">Evaluate Competitive Split Matrices</button>
          <div id="non-result-${uid}" style="margin-top: 28px; border-top: 1px solid #1a1a1a; padding-top: 24px; display: none;"></div>
        </div>
      </div>
    `;

    container.appendChild(sysBubble);
    if (typeof window.scrollEsToBottom === 'function') window.scrollEsToBottom();

    // Event Wireframe and Handlers
    setupCoreInteractions(uid);
  }

  // ========== WIDER COMPONENT RENDERERS ==========
  function renderWideSubjectInput(id, placeholder, iconClass) {
    return `
      <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255, 255, 255, 0.01); backdrop-filter: blur(10px); padding: 14px 20px; border-radius: 8px; border: 1px solid #1a1a1a; transition: border-color 0.2s ease;" onmouseover="this.style.borderColor='#262626'" onmouseout="this.style.borderColor='#1a1a1a'">
        <div style="display: flex; align-items: center; gap: 12px;">
          <i class="${iconClass}" style="color: #666666; font-size: 0.9rem; width: 16px; text-align: center;"></i>
          <span style="font-size: 0.85rem; font-weight: 500; color: #cccccc;">${placeholder}</span>
        </div>
        <input type="number" id="in-${id}" placeholder="00" min="0" max="100" style="width: 70px; background: transparent; border: none; color: #ffffff; text-align: right; font-size: 0.95rem; font-weight: 700; font-family: monospace; outline: none;">
      </div>
    `;
  }

  function renderWideAggregateInput(id, title, bounds, iconClass) {
    return `
      <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255, 255, 255, 0.01); backdrop-filter: blur(10px); padding: 14px 20px; border-radius: 8px; border: 1px solid #1a1a1a;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <i class="${iconClass}" style="color: #666666; font-size: 0.9rem; width: 16px; text-align: center;"></i>
          <span style="font-size: 0.85rem; font-weight: 500; color: #cccccc;">${title} <span style="font-size: 0.7rem; color: #444444; margin-left: 4px;">(${bounds})</span></span>
        </div>
        <input type="number" id="${id}" placeholder="000" style="width: 90px; background: transparent; border: none; color: #ffffff; text-align: right; font-size: 0.95rem; font-weight: 700; font-family: monospace; outline: none;">
      </div>
    `;
  }

  // ========== CORE MECHANICS INTERACTORS ==========
  function setupCoreInteractions(uid) {
    const engModeBtn = document.getElementById(`eng-mode-${uid}`);
    const nonModeBtn = document.getElementById(`non-mode-${uid}`);
    const engPanel = document.getElementById(`eng-panel-${uid}`);
    const nonPanel = document.getElementById(`non-panel-${uid}`);

    engModeBtn.onclick = () => {
      engModeBtn.style.background = '#ffffff'; engModeBtn.style.color = '#000000';
      nonModeBtn.style.background = 'transparent'; nonModeBtn.style.color = '#666666';
      engPanel.style.display = 'block'; nonPanel.style.display = 'none';
    };
    nonModeBtn.onclick = () => {
      nonModeBtn.style.background = '#ffffff'; nonModeBtn.style.color = '#000000';
      engModeBtn.style.background = 'transparent'; engModeBtn.style.color = '#666666';
      nonPanel.style.display = 'block'; engPanel.style.display = 'none';
    };

    // Toggle Matrix Systems
    ['eng', 'non'].forEach(type => {
      const toggleIndiv = document.querySelector(`#board-toggle-${type}-${uid} .board-mode-btn[data-mode="individual"]`);
      const toggleTotal = document.querySelector(`#board-toggle-${type}-${uid} .board-mode-btn[data-mode="total"]`);
      const indivDiv = document.getElementById(`${type}-board-individual`);
      const totalDiv = document.getElementById(`${type}-board-total`);

      toggleIndiv.onclick = () => {
        indivDiv.style.display = 'flex'; totalDiv.style.display = 'none';
        toggleIndiv.style.background = '#1a1a1a'; toggleIndiv.style.color = '#ffffff';
        toggleTotal.style.background = 'transparent'; toggleTotal.style.color = '#666666';
      };
      toggleTotal.onclick = () => {
        indivDiv.style.display = 'none'; totalDiv.style.display = 'block';
        toggleTotal.style.background = '#1a1a1a'; toggleTotal.style.color = '#ffffff';
        toggleIndiv.style.background = 'transparent'; toggleIndiv.style.color = '#666666';
      };
    });
  }

  // ========== ENGINE ALGORITHMS EVALUATION ==========
  window.calcKcetEngineering = (uid) => {
    let boardPercent = 0;
    const totalBoardInput = document.getElementById(`eng-total-board-${uid}`);
    const isTotalMode = totalBoardInput && totalBoardInput.parentElement.style.display !== 'none';

    if (isTotalMode) {
      const total = parseFloat(totalBoardInput.value);
      if (isNaN(total) || total < 0 || total > 300) return alert("System requires valid Cumulative Board parameters [0-300].");
      boardPercent = (total / 300) * 100;
    } else {
      const phy = parseFloat(document.getElementById(`in-eng-phy`)?.value) || 0;
      const chem = parseFloat(document.getElementById(`in-eng-chem`)?.value) || 0;
      const math = parseFloat(document.getElementById(`in-eng-math`)?.value) || 0;
      if (phy > 100 || chem > 100 || math > 100) return alert("Individual metrics bounds cannot exceed 100.");
      boardPercent = ((phy + chem + math) / 300) * 100;
    }

    const kcetTotal = parseFloat(document.getElementById(`eng-kcet-total-${uid}`).value);
    if (isNaN(kcetTotal) || kcetTotal < 0 || kcetTotal > 180) return alert("System requires valid KCET structural metric parameters [0-180].");
    const kcetPercent = (kcetTotal / 180) * 100;

    const evaluation = computeRank(boardPercent, kcetPercent);
    const resultDiv = document.getElementById(`eng-result-${uid}`);
    
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
      <div style="background: #0a0a0a; border: 1px solid #1a1a1a; padding: 24px; border-radius: 8px; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <div style="font-size: 0.65rem; font-family: monospace; color: #666666; letter-spacing: 0.1em; text-transform: uppercase;"><i class="fa-solid fa-circle-nodes" style="color:#007aff; margin-right:6px;"></i> Predicted Engineering Rank</div>
          <div style="font-size: 2.2rem; font-weight: 700; color: #ffffff; letter-spacing: -0.04em; margin-top: 6px;">~ ${evaluation.rank.toLocaleString()}</div>
        </div>
        <div style="text-align: right; font-family: monospace; font-size: 0.7rem; color: #888888; line-height: 1.6;">
          <div>BOARD SCORE: <span style="color:#fff">${boardPercent.toFixed(2)}%</span></div>
          <div>KCET SCORE: <span style="color:#fff">${kcetPercent.toFixed(2)}%</span></div>
          <div style="border-top:1px solid #1a1a1a; margin-top:4px; padding-top:4px;">INDEX VALUE: <span style="color:#007aff">${evaluation.indexScore.toFixed(2)}</span></div>
        </div>
      </div>
    `;
    if (typeof window.scrollEsToBottom === 'function') window.scrollEsToBottom();
  };

  window.calcKcetNonEngineering = (uid) => {
    let boardPercent = 0;
    const totalBoardInput = document.getElementById(`non-total-board-${uid}`);
    const isTotalMode = totalBoardInput && totalBoardInput.parentElement.style.display !== 'none';

    if (isTotalMode) {
      const total = parseFloat(totalBoardInput.value);
      if (isNaN(total) || total < 0 || total > 400) return alert("System requires valid Cumulative Board parameters [0-400].");
      boardPercent = (total / 400) * 100;
    } else {
      const phy = parseFloat(document.getElementById(`in-non-phy`)?.value) || 0;
      const chem = parseFloat(document.getElementById(`in-non-chem`)?.value) || 0;
      const math = parseFloat(document.getElementById(`in-non-math`)?.value) || 0;
      const bio = parseFloat(document.getElementById(`in-non-bio`)?.value) || 0;
      if (phy > 100 || chem > 100 || math > 100 || bio > 100) return alert("Individual metrics bounds cannot exceed 100.");
      boardPercent = ((phy + chem + math + bio) / 400) * 100;
    }

    // Capture Split Sections
    const pcmCore = parseFloat(document.getElementById(`in-non-kcet-pcm-total`)?.value) || 0;
    const bioScore = parseFloat(document.getElementById(`in-non-kcet-bio`)?.value) || 0;
    const mathScore = parseFloat(document.getElementById(`in-non-kcet-math`)?.value) || 0;

    if (pcmCore > 180 || bioScore > 60 || mathScore > 60) return alert("Parameters out of official bounds schema.");

    // Pharma Calculation: Uses Board % + (Physics + Chemistry + Biology KCET score converted to %)
    // Extracting estimated PC from the parsed PCM core to bundle with Bio
    const estimatedPhysChem = (pcmCore - mathScore); 
    const pcbTotalSecure = estimatedPhysChem + bioScore;
    const pcbPercent = (pcbTotalSecure / 180) * 100;
    const pharmaMatrix = computeRank(boardPercent, pcbPercent);

    // Engineering Calculation matrix from PCM Core values directly
    const pcmPercent = (pcmCore / 180) * 100;
    const engineeringMatrix = computeRank(boardPercent, pcmPercent);

    const resultDiv = document.getElementById(`non-result-${uid}`);
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div style="background: #0a0a0a; border: 1px solid #1a1a1a; padding: 20px; border-radius: 8px;">
          <div style="font-size: 0.62rem; font-family: monospace; color: #666666; letter-spacing: 0.08em; text-transform: uppercase;"><i class="fa-solid fa-capsules" style="color:#007aff; margin-right:4px;"></i> Pharma Matrix Rank</div>
          <div style="font-size: 1.8rem; font-weight: 700; color: #ffffff; letter-spacing: -0.03em; margin: 8px 0;">~ ${pharmaMatrix.rank.toLocaleString()}</div>
          <div style="font-size: 0.65rem; font-family: monospace; color: #444444; line-height: 1.4;">
            KCET (PCB): <span style="color:#888">${pcbPercent.toFixed(1)}%</span>
          </div>
        </div>
        <div style="background: #0a0a0a; border: 1px solid #1a1a1a; padding: 20px; border-radius: 8px;">
          <div style="font-size: 0.62rem; font-family: monospace; color: #666666; letter-spacing: 0.08em; text-transform: uppercase;"><i class="fa-solid fa-microchip" style="color:#007aff; margin-right:4px;"></i> Eng. Split Rank</div>
          <div style="font-size: 1.8rem; font-weight: 700; color: #ffffff; letter-spacing: -0.03em; margin: 8px 0;">~ ${engineeringMatrix.rank.toLocaleString()}</div>
          <div style="font-size: 0.65rem; font-family: monospace; color: #444444; line-height: 1.4;">
            KCET (PCM): <span style="color:#888">${pcmPercent.toFixed(1)}%</span>
          </div>
        </div>
      </div>
      <div style="margin-top: 12px; background: #0a0a0a; border: 1px solid #1a1a1a; padding: 10px 16px; border-radius: 6px; font-size: 0.68rem; color: #666666; font-family: monospace; text-align: center;">
        Matrix normalization complete. Evaluation generated safely on-device.
      </div>
    `;
    if (typeof window.scrollEsToBottom === 'function') window.scrollEsToBottom();
  };

  }

  function renderSubjectInput(id, label) {
    return `
      <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.02); padding:10px 16px; border-radius:18px; border:1px solid rgba(255,255,255,0.05);">
        <span style="font-size:0.85rem;">${label}</span>
        <input type="number" id="in-${id}" placeholder="0" style="width:60px; background:transparent; border:none; color:#fff; text-align:right; font-size:0.9rem; font-weight:600; outline:none;">
      </div>
    `;
  }

  // Helper to compute rank from board% and kcet%
  function computeRank(boardPercent, kcetPercent) {
    const indexScore = (boardPercent + kcetPercent) / 2;
    let rank = Math.round(Math.pow(101 - indexScore, 2.5) * 5);
    if (rank < 1) rank = 1;
    if (rank > 200000) rank = 200000;
    return { rank, indexScore };
  }

  window.calcKcetEngineering = (uid) => {
    // Board marks
    let boardPercent = null;
    const totalBoardInput = document.getElementById(`eng-total-board-${uid}`);
    const isTotalMode = totalBoardInput && totalBoardInput.parentElement.style.display !== 'none';
    if (isTotalMode) {
      const total = parseFloat(totalBoardInput.value);
      if (!isNaN(total) && total >= 0 && total <= 300) {
        boardPercent = (total / 300) * 100;
      } else {
        alert("Please enter a valid total board marks (0-300).");
        return;
      }
    } else {
      const phy = parseFloat(document.getElementById(`in-phy`)?.value) || 0;
      const chem = parseFloat(document.getElementById(`in-chem`)?.value) || 0;
      const math = parseFloat(document.getElementById(`in-math`)?.value) || 0;
      if (isNaN(phy) || isNaN(chem) || isNaN(math)) {
        alert("Please enter valid marks for Physics, Chemistry, Mathematics (0-100 each).");
        return;
      }
      boardPercent = ((phy + chem + math) / 300) * 100;
    }

    // KCET total
    const kcetTotal = parseFloat(document.getElementById(`eng-kcet-total-${uid}`).value);
    if (isNaN(kcetTotal) || kcetTotal < 0 || kcetTotal > 180) {
      alert("Please enter a valid KCET total marks (0-180).");
      return;
    }
    const kcetPercent = (kcetTotal / 180) * 100;

    const { rank, indexScore } = computeRank(boardPercent, kcetPercent);
    const resultDiv = document.getElementById(`eng-result-${uid}`);
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
      <div style="font-size:0.7rem; color:#aaa;">PREDICTED ENGINEERING RANK</div>
      <div style="font-size:2rem; font-weight:700; margin:5px 0;">~ ${rank.toLocaleString()}</div>
      <div style="font-size:0.7rem; color:#aaa;">Board: ${boardPercent.toFixed(1)}% | KCET: ${kcetPercent.toFixed(1)}% | Index: ${indexScore.toFixed(1)}</div>
      <button onclick="launchKcetPredictor()" style="margin-top:12px; background:transparent; border:1px solid #333; padding:6px 12px; border-radius:20px; color:#ccc; cursor:pointer;">⟳ New</button>
    `;
    if (typeof window.scrollEsToBottom === 'function') window.scrollEsToBottom();
  };

  window.calcKcetNonEngineering = (uid) => {
    // Board marks
    let boardPercent = null;
    const totalBoardInput = document.getElementById(`non-total-board-${uid}`);
    const isTotalMode = totalBoardInput && totalBoardInput.parentElement.style.display !== 'none';
    if (isTotalMode) {
      const total = parseFloat(totalBoardInput.value);
      if (!isNaN(total) && total >= 0 && total <= 400) {
        boardPercent = (total / 400) * 100;
      } else {
        alert("Please enter a valid total board marks (0-400).");
        return;
      }
    } else {
      const phy = parseFloat(document.getElementById(`in-phy`)?.value) || 0;
      const chem = parseFloat(document.getElementById(`in-chem`)?.value) || 0;
      const math = parseFloat(document.getElementById(`in-math`)?.value) || 0;
      const bio = parseFloat(document.getElementById(`in-bio`)?.value) || 0;
      if (isNaN(phy) || isNaN(chem) || isNaN(math) || isNaN(bio)) {
        alert("Please enter valid marks for Physics, Chemistry, Mathematics, Biology (0-100 each).");
        return;
      }
      boardPercent = ((phy + chem + math + bio) / 400) * 100;
    }

    // KCET subject marks
    const phyK = parseFloat(document.getElementById(`in-phy-kcet`)?.value) || 0;
    const chemK = parseFloat(document.getElementById(`in-chem-kcet`)?.value) || 0;
    const mathK = parseFloat(document.getElementById(`in-math-kcet`)?.value) || 0;
    const bioK = parseFloat(document.getElementById(`in-bio-kcet`)?.value) || 0;
    if (isNaN(phyK) || isNaN(chemK) || isNaN(mathK) || isNaN(bioK)) {
      alert("Please enter all KCET subject marks (0-60 each).");
      return;
    }

    // Pharma rank uses PCB (Physics, Chemistry, Biology)
    const pcbTotal = phyK + chemK + bioK;
    const pcbPercent = (pcbTotal / 180) * 100;
    const pharmaRankObj = computeRank(boardPercent, pcbPercent);

    // Engineering rank uses PCM (Physics, Chemistry, Maths)
    const pcmTotal = phyK + chemK + mathK;
    const pcmPercent = (pcmTotal / 180) * 100;
    const engRankObj = computeRank(boardPercent, pcmPercent);

    const resultDiv = document.getElementById(`non-result-${uid}`);
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
      <div style="display:flex; gap:20px; flex-wrap:wrap;">
        <div style="flex:1; text-align:center; background:rgba(255,255,255,0.02); border-radius:20px; padding:12px;">
          <div style="font-size:0.7rem; color:#aaa;">PHARMA RANK</div>
          <div style="font-size:1.8rem; font-weight:700;">~ ${pharmaRankObj.rank.toLocaleString()}</div>
          <div style="font-size:0.65rem; color:#aaa;">Board: ${boardPercent.toFixed(1)}%<br>KCET (PCB): ${pcbPercent.toFixed(1)}%</div>
        </div>
        <div style="flex:1; text-align:center; background:rgba(255,255,255,0.02); border-radius:20px; padding:12px;">
          <div style="font-size:0.7rem; color:#aaa;">ENGINEERING RANK</div>
          <div style="font-size:1.8rem; font-weight:700;">~ ${engRankObj.rank.toLocaleString()}</div>
          <div style="font-size:0.65rem; color:#aaa;">Board: ${boardPercent.toFixed(1)}%<br>KCET (PCM): ${pcmPercent.toFixed(1)}%</div>
        </div>
      </div>
      <button onclick="launchKcetPredictor()" style="margin-top:16px; background:transparent; border:1px solid #333; padding:6px 12px; border-radius:20px; color:#ccc; cursor:pointer; width:100%;">⟳ New Prediction</button>
    `;
    if (typeof window.scrollEsToBottom === 'function') window.scrollEsToBottom();
  };

  // ========== MAIN HOOK (OVERRIDE SEARCH) ==========
  document.addEventListener("DOMContentLoaded", () => {
    if (typeof window.doEsSearch === "function") {
      const originalSearch = window.doEsSearch;
      window.doEsSearch = async function (val) {
        if (!val || !val.trim()) return;
        const query = val.trim();
        const lowerQuery = query.toLowerCase();

        const messagesContainer = document.getElementById('es-messages');
        const greet = document.getElementById('es-greeting');
        if (greet) greet.style.display = 'none';

        if (typeof window.appendEsBubbleUser === 'function') {
          window.appendEsBubbleUser(query);
        } else {
          const userBubble = document.createElement('div');
          userBubble.className = 'es-bubble-user';
          userBubble.textContent = query;
          if (messagesContainer) messagesContainer.appendChild(userBubble);
        }
        const inputEl = document.getElementById('es-input');
        if (inputEl) inputEl.value = '';

        if (lowerQuery.includes("kcet") || lowerQuery.includes("prediction")) {
          setTimeout(launchKcetPredictor, 300);
          return;
        }

        const sysBubble = document.createElement('div');
        sysBubble.className = 'es-bubble-sys';
        const contentDiv = document.createElement('div');
        contentDiv.className = 'ai-response-content';
        contentDiv.style.fontSize = '0.9rem';
        contentDiv.style.color = 'var(--text)';
        contentDiv.style.lineHeight = '1.6';
        sysBubble.appendChild(contentDiv);
        if (messagesContainer) messagesContainer.appendChild(sysBubble);
        contentDiv.innerHTML = '<span class="typing-cursor" style="color:var(--accent);">▌</span>';

        try {
          const answer = await LocalAI.respond(query);
          if (answer.includes("Try asking about") || answer.includes("Not in my local database")) {
            if (messagesContainer && sysBubble.parentNode) messagesContainer.removeChild(sysBubble);
            originalSearch(val);
          } else {
            await typewriteText(contentDiv, answer);
          }
        } catch (err) {
          contentDiv.innerHTML = `<span style="color:#ef4444;">⚠️ Engine Error: ${err.message}</span>`;
        }
        if (typeof window.scrollEsToBottom === 'function') window.scrollEsToBottom();
      };
    }
  });
})();
