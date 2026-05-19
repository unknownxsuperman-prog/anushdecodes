/**
 * x0s.link – Disha Intelligence Extensions Module (Production Build)
 * LOCAL AI + Live Weather + Math + News + Utilities + Smart Search
 * Zero external AI APIs – everything runs on-device except weather/news APIs
 */
(function () {
  'use strict';

  // ========== CONFIGURATION ==========
  const CONFIG = {
    weatherApiKey: '0222762e4fd7dc746123423914f0dca7', // Rotate this in production
    defaultCity: 'Mumbai',
    newsApiKey: null, // Set to use real news API, null = mock feed
    currencyApiBase: 'https://api.exchangerate-api.com/v4/latest/',
    typingSpeed: 12, // ms per char
    maxHistory: 50
  };

  // ========== STATE MANAGEMENT ==========
  const State = {
    history: [],
    context: {
      lastCity: null,
      lastTopic: null,
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
    /**
     * Main response dispatcher with context awareness
     */
    async respond(query) {
      const q = query.trim();
      if (!q) return "I didn't catch that. Could you repeat?";
      
      const lower = q.toLowerCase();
      State.stats.queriesHandled++;
      State.history.push({ query: q, time: Date.now() });
      if (State.history.length > CONFIG.maxHistory) State.history.shift();

      // --- Context-aware follow-ups ---
      if (lower.match(/^(and |what about |how about |also |plus )/i) && State.context.lastIntent) {
        return this.handleFollowUp(lower);
      }

      // --- Intent Classification (ordered by specificity) ---
      const intents = [
        // Utilities
        { name: 'calculator', patterns: [/^(calc|calculate|compute|solve|eval)\s+/i, /^[\d\s+\-*/().^%]+$/, /^(what is|what's)\s+[\d\s+\-*/().^%]+/i], priority: 10 },
        { name: 'converter', patterns: [/\b(convert|conversion)\b/i, /\b(\d+\s*(km|mi|kg|lb|°c|°f|c|f|usd|eur|inr|gbp))\b/i, /\b(km to mi|miles to km|kg to lbs|celsius to fahrenheit|usd to inr)\b/i], priority: 9 },
        { name: 'weather', patterns: [/\b(weather|temperature|forecast|humidity|wind in)\b/i], priority: 9 },
        { name: 'time', patterns: [/\b(time|clock|current time)\s+(in|at|for)\b/i, /\bwhat\s+time\b/i], priority: 8 },
        { name: 'date', patterns: [/\b(date|today|day|what day)\b/i], priority: 8 },
        { name: 'timer', patterns: [/\b(timer|countdown|set a timer|remind me in)\b/i], priority: 8 },
        
        // Information
        { name: 'news', patterns: [/\b(news|headlines|current affairs|updates|breaking|latest)\b/i], priority: 7 },
        { name: 'definition', patterns: [/\b(define|definition|meaning of|what is|what are|explain)\b/i], priority: 7 },
        { name: 'translate', patterns: [/\b(translate|in spanish|in french|in hindi|in german|meaning in)\b/i], priority: 7 },
        { name: 'stock', patterns: [/\b(stock|share price|ticker|nasdaq|nse|bse|market)\b/i], priority: 6 },
        
        // Productivity
        { name: 'todo', patterns: [/\b(todo|task|add task|remind me to|remember to)\b/i], priority: 6 },
        { name: 'note', patterns: [/\b(note|save this|remember that|write down| jot)\b/i], priority: 6 },
        { name: 'password', patterns: [/\b(password|generate password|strong password|secure password)\b/i], priority: 5 },
        { name: 'uuid', patterns: [/\b(uuid|guid|generate id|unique id)\b/i], priority: 5 },
        
        // General Knowledge (lowest priority, catch-all)
        { name: 'greeting', patterns: [/^(hi|hello|hey|yo|good\s(morning|afternoon|evening))/i], priority: 1 },
        { name: 'farewell', patterns: [/\b(bye|goodbye|see\syou|tata|later)\b/i], priority: 1 },
        { name: 'who_are_you', patterns: [/\b(who\s(are|r)\s?(you|u)|your\sname|what\s(are|r)\s?(you|u))\b/i], priority: 1 },
        { name: 'what_can_you_do', patterns: [/\b(what\s(can|do)\s(you|u)\s(do|help)|abilities|features|commands)\b/i], priority: 1 },
        { name: 'creator', patterns: [/\b(who\s(created|made|built)\s?(you|u)|your\screator|who made you)\b/i], priority: 1 },
        { name: 'thanks', patterns: [/\b(thanks|thank\s?(you|u)|thx|ty|appreciate)\b/i], priority: 1 },
        { name: 'how_are_you', patterns: [/\b(how\s(are|r)\s?(you|u)|what'?s\sup|how you doing)\b/i], priority: 1 },
        { name: 'help', patterns: [/\b(help|assist|support|how to use|commands)\b/i], priority: 1 },
        
        // Fallback
        { name: 'general', patterns: [/.*/], priority: 0 }
      ];

      // Score and match intents
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

      // Route to handler
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
        case 'general': default: return this.respondGeneralKnowledge(lower);
      }
    },

    // ========== HANDLERS ==========

    handleCalculator(query, lower) {
      State.stats.mathSolved++;
      let expr = query.replace(/^(calc|calculate|compute|solve|eval|what is|what's)\s+/i, '').trim();
      expr = expr.replace(/\^/g, '**').replace(/×/g, '*').replace(/÷/g, '/');
      
      // Handle unit conversions in math
      const unitMatch = expr.match(/^(\d+(?:\.\d+)?)\s*(km|mi|kg|lb|°c|°f|c|f)\s*(to|in|=)\s*(km|mi|kg|lb|°c|°f|c|f)$/i);
      if (unitMatch) {
        return this.convertUnits(parseFloat(unitMatch[1]), unitMatch[2], unitMatch[4]);
      }

      try {
        // Strict sanitization
        if (!/^[\d\s+\-*/().%^]+$/.test(expr)) {
          throw new Error('Invalid characters in expression');
        }
        const result = Function('"use strict"; return (' + expr + ')')();
        if (!isFinite(result)) throw new Error('Result is not finite');
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
          if (typeof window.notifyUser === 'function') {
            window.notifyUser(`⏰ Timer: ${val} ${unit}${val > 1 ? 's' : ''} up!`);
          }
        }, ms);
        
        return `⏱️ Timer set for **${val} ${unit}${val > 1 ? 's' : ''}**. I'll notify you when it's done.`;
      }
      return "Usage: \`timer 5 minutes\` or \`set timer 30 seconds\`";
    },

    handleNews(query) {
      const topics = ['tech', 'india', 'business', 'sports', 'science', 'health', 'politics', 'entertainment'];
      const topic = topics.find(t => query.includes(t)) || State.context.lastTopic || 'general';
      State.context.lastTopic = topic;

      // In production, fetch from NewsAPI or similar
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
      const term = query.replace(/(what\s(is|are|does)\s+|define\s+|meaning\sof\s+|explain\s+)/i, '').replace(/\?/g, '').trim().toLowerCase();
      
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

      if (defs[term]) return `**${term}**: ${defs[term]}`;
      
      // Try partial match
      const partial = Object.keys(defs).find(k => k.includes(term) || term.includes(k));
      if (partial) return `**${partial}**: ${defs[partial]}`;
      
      return `I don't have "${term}" in my local knowledge base. Try a web search or ask about: ${Object.keys(defs).slice(0, 5).join(', ')}...`;
    },

    handleTranslate(query, lower) {
      const match = query.match(/translate\s+["']?(.+?)["']?\s+(?:to|in)\s+(\w+)/i) || 
                    query.match(/["']?(.+?)["']?\s+(?:in|to)\s+(\w+)/i);
      
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
      
      // Mock data - replace with real API in production
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
      // Context-aware responses based on last intent
      if (State.context.lastIntent === 'weather') {
        return this.getWeatherReport(query + ' ' + (State.context.lastCity || ''));
      }
      if (State.context.lastIntent === 'news') {
        return this.handleNews(query);
      }
      return "Could you be more specific? I lost track of our conversation.";
    },

    // ========== SOCIAL HANDLERS ==========

    respondGreeting() {
      const hour = new Date().getHours();
      const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
      const greetings = [
        `${timeGreeting}! 👋 Ready to get things done?`,
        `${timeGreeting}! What are we working on today?`,
        `Hey there! I'm online and ready.`
      ];
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

    // ========== GENERAL KNOWLEDGE (Expanded) ==========
    respondGeneralKnowledge(lower) {
      const kb = [
        // Geography
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
        
        // Science
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
        
        // Tech
        { keys: ['who', 'linux'], answer: "Linus Torvalds, 1991" },
        { keys: ['who', 'python'], answer: "Guido van Rossum, 1991" },
        { keys: ['who', 'javascript'], answer: "Brendan Eich, 1995 (in 10 days)" },
        { keys: ['first', 'computer'], answer: "ENIAC (1945) or Z3 (1941) depending on definition" },
        { keys: ['tcp', 'ip'], answer: "Vint Cerf and Bob Kahn, 1974" },
        { keys: ['www'], answer: "Tim Berners-Lee, CERN, 1989" },
        { keys: ['bitcoin'], answer: "Satoshi Nakamoto (pseudonym), 2008 whitepaper" },
        
        // Math
        { keys: ['fibonacci'], answer: "Sequence: 0, 1, 1, 2, 3, 5, 8, 13... Each number is the sum of the two preceding ones." },
        { keys: ['pythagorean'], answer: "a² + b² = c² for right triangles" },
        { keys: ['quadratic'], answer: "ax² + bx + c = 0 → x = (-b ± √(b²-4ac)) / 2a" },
        { keys: ['prime', 'number'], answer: "A natural number >1 with no positive divisors other than 1 and itself." },
        
        // Current (update periodically)
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

      // Smart fallback suggestions
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

    // ========== MAIN HOOK (MASTER ROUTER) ==========
  document.addEventListener("DOMContentLoaded", () => {
    if (typeof window.doEsSearch === "function") {
      const coreEsSearch = window.doEsSearch; // Save original college search

      window.doEsSearch = async function (val) {
        if (!val || !val.trim()) return;
        const query = val.trim();
        const lowerQuery = query.toLowerCase();

        // 1. UI RESET
        const messagesContainer = document.getElementById('es-messages');
        const greet = document.getElementById('es-greeting');
        if (greet) greet.style.display = 'none';

        // 2. CREATE USER BUBBLE
        if (typeof window.appendEsBubbleUser === 'function') {
          window.appendEsBubbleUser(query);
        } else {
          const userBubble = document.createElement('div');
          userBubble.className = 'es-bubble-user';
          userBubble.textContent = query;
          messagesContainer.appendChild(userBubble);
        }
        
        document.getElementById('es-input').value = ''; // Clear input

        // 3. ROUTING LOGIC
        
        // --- ROUTE A: KCET PREDICTION ---
        if (lowerQuery.includes("kcet") || lowerQuery.includes("prediction")) {
          setTimeout(launchKcetPredictor, 300);
          return;
        }

        // --- ROUTE B: LOCAL AI (Math, Weather, GK, Utils) ---
        const sysBubble = document.createElement('div');
        sysBubble.className = 'es-bubble-sys';
        const contentDiv = document.createElement('div');
        contentDiv.className = 'ai-response-content';
        contentDiv.style.fontSize = '0.9rem';
        contentDiv.style.color = 'var(--text)';
        contentDiv.style.lineHeight = '1.6';
        sysBubble.appendChild(contentDiv);
        messagesContainer.appendChild(sysBubble);
        contentDiv.innerHTML = '<span class="typing-cursor" style="color:var(--accent);">▌</span>';

        try {
          const answer = await LocalAI.respond(query);
          
          // Check if it's a fallback response. If so, let College Search try.
          if (answer.includes("Try asking about") || answer.includes("Not in my local database")) {
            messagesContainer.removeChild(sysBubble); 
            coreEsSearch(val);
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

  // ========== KCET ENGINE FUNCTIONS ==========
  function launchKcetPredictor() {
    const container = document.getElementById('es-messages');
    const sysBubble = document.createElement('div');
    sysBubble.className = 'es-bubble-sys';
    const uid = Date.now();

    sysBubble.innerHTML = `
      <div class="es-result-card" style="background:#0a0a0a; border-left:3px solid var(--accent); padding:16px; border-radius:14px; border: 1px solid #1a1a1a; border-left-width: 3px; border-left-color: var(--accent);">
        <div style="font-size:0.6rem; color:var(--accent); font-weight:700; margin-bottom:10px; letter-spacing:0.1em; text-transform:uppercase;">KCET Rank Matrix v2.6</div>
        
        <div id="kcet-step-1-${uid}">
          <div style="font-size:0.85rem; color:#fff; margin-bottom:12px; font-weight:300;">Select academic stream:</div>
          <div style="display:flex; gap:8px;">
            <button onclick="setupKcetForm('${uid}', 'cs')" style="flex:1; padding:10px; background:rgba(0,122,255,0.1); border:1px solid var(--accent); color:#fff; border-radius:8px; font-size:0.75rem; cursor:pointer;">Engineering (CS)</button>
            <button onclick="setupKcetForm('${uid}', 'bio')" style="flex:1; padding:10px; background:#111; border:1px solid #1a1a1a; color:#888; border-radius:8px; font-size:0.75rem; cursor:pointer;">Medical (Bio)</button>
          </div>
        </div>

        <div id="kcet-form-${uid}" style="display:none; margin-top:15px;">
           <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px;">
              <input type="number" id="b-p-${uid}" placeholder="Phy Board" style="background:#111; border:1px solid #222; color:#fff; padding:10px; border-radius:6px; font-size:0.75rem; outline:none;">
              <input type="number" id="c-p-${uid}" placeholder="Phy KCET" style="background:#111; border:1px solid #222; color:#fff; padding:10px; border-radius:6px; font-size:0.75rem; outline:none;">
              <input type="number" id="b-c-${uid}" placeholder="Chem Board" style="background:#111; border:1px solid #222; color:#fff; padding:10px; border-radius:6px; font-size:0.75rem; outline:none;">
              <input type="number" id="c-c-${uid}" placeholder="Chem KCET" style="background:#111; border:1px solid #222; color:#fff; padding:10px; border-radius:6px; font-size:0.75rem; outline:none;">
              <input type="number" id="b-opt-${uid}" placeholder="Math Board" style="background:#111; border:1px solid #222; color:#fff; padding:10px; border-radius:6px; font-size:0.75rem; outline:none;">
              <input type="number" id="c-opt-${uid}" placeholder="Math KCET" style="background:#111; border:1px solid #222; color:#fff; padding:10px; border-radius:6px; font-size:0.75rem; outline:none;">
           </div>
           <button onclick="calculateKcetRank('${uid}')" style="width:100%; padding:12px; background:var(--accent); color:#fff; border:none; border-radius:8px; font-weight:700; font-size:0.8rem; cursor:pointer;">Execute Prediction</button>
        </div>
        
        <div id="kcet-result-${uid}" style="display:none; margin-top:15px; border-top:1px dashed #222; padding-top:15px;"></div>
      </div>
    `;
    container.appendChild(sysBubble);
    if (typeof window.scrollEsToBottom === 'function') window.scrollEsToBottom();
  }

  window.setupKcetForm = (uid, type) => {
    document.getElementById(`kcet-step-1-${uid}`).style.display = 'none';
    document.getElementById(`kcet-form-${uid}`).style.display = 'block';
    if(type === 'bio') {
      document.getElementById(`b-opt-${uid}`).placeholder = "Bio Board";
      document.getElementById(`c-opt-${uid}`).placeholder = "Bio KCET";
    }
  };

  window.calculateKcetRank = (uid) => {
    const getVal = (id) => parseFloat(document.getElementById(id).value) || 0;
    const boardAvg = (getVal(`b-p-${uid}`) + getVal(`b-c-${uid}`) + getVal(`b-opt-${uid}`)) / 3;
    const kcetScore = (getVal(`c-p-${uid}`) + getVal(`c-c-${uid}`) + getVal(`c-opt-${uid}`));
    const kcetPerc = (kcetScore / 180) * 100;
    const indexScore = (boardAvg + kcetPerc) / 2;
    
    // Rank formula
    let estRank = Math.round(Math.pow(101 - indexScore, 2.8) * 2.5);
    if (indexScore > 95) estRank = Math.round(Math.pow(101 - indexScore, 2.1) * 10);
    
    const resArea = document.getElementById(`kcet-result-${uid}`);
    resArea.style.display = 'block';
    resArea.innerHTML = `
      <div style="font-size:0.65rem; color:#666; font-family:monospace; margin-bottom:4px;">PREDICTED RANK RADIUS</div>
      <div style="font-size:1.8rem; font-weight:700; color:#fff; letter-spacing:-0.03em;">~ ${estRank.toLocaleString()}</div>
      <div style="font-size:0.7rem; color:#444; margin-top:4px;">Index Score: ${indexScore.toFixed(2)}% | 50:50 Applied</div>
      <button onclick="launchKcetPredictor()" style="background:transparent; border:1px solid #222; color:#555; padding:8px 16px; border-radius:6px; font-size:0.65rem; cursor:pointer; margin-top:12px;"><i class="fa-solid fa-rotate-right"></i> Reset</button>
    `;
    if (typeof window.scrollEsToBottom === 'function') window.scrollEsToBottom();
  };


        // Create system bubble
        const sysBubble = document.createElement('div');
        sysBubble.className = 'es-bubble-sys';
        const contentDiv = document.createElement('div');
        contentDiv.className = 'ai-response-content';
        contentDiv.style.fontSize = '0.9rem';
        contentDiv.style.color = 'var(--text)';
        contentDiv.style.lineHeight = '1.6';
        sysBubble.appendChild(contentDiv);
        messagesContainer.appendChild(sysBubble);

        // Show loading cursor
        contentDiv.innerHTML = '<span class="typing-cursor" style="color:var(--accent);">▌</span>';
        
        try {
          const answer = await LocalAI.respond(query);
          await typewriteText(contentDiv, answer);
        } catch (err) {
          contentDiv.innerHTML = `<span style="color:#ef4444;">⚠️ Error: ${err.message}</span>`;
        }

        if (typeof window.scrollEsToBottom === 'function') window.scrollEsToBottom();
      };
    }
  });
    // ========== 1. KCET PREDICTION ENGINE ==========
  function launchKcetPredictor() {
    function launchKcetPredictor() {
    const container = document.getElementById('es-messages');
    const sysBubble = document.createElement('div');
    sysBubble.className = 'es-bubble-sys';
    const uid = Date.now();

    sysBubble.innerHTML = `
      <div class="kcet-glass-card" style="
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(25px);
        -webkit-backdrop-filter: blur(25px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 28px;
        padding: 24px;
        width: 100%;
        color: #ffffff;
        box-shadow: 0 25px 50px rgba(0,0,0,0.5);
      ">
        <div style="display:flex; align-items:center; gap:14px; margin-bottom:24px;">
          <div style="width:44px; height:44px; background:rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius:14px; display:flex; align-items:center; justify-content:center;">
            <i class="fa-solid fa-chart-line" style="color:#ffffff; font-size:1.1rem;"></i>
          </div>
          <div>
            <div style="font-size:1rem; font-weight:700; letter-spacing:-0.01em;">KCET Rank Engine</div>
            <div style="font-size:0.7rem; color:rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:0.05em;">Predictive Matrix // 2026</div>
          </div>
        </div>

        <div style="margin-bottom:24px;">
          <div style="display:flex; background:rgba(255,255,255,0.03); padding:5px; border-radius:16px; border:1px solid rgba(255,255,255,0.05);">
            <button id="eng-btn-${uid}" onclick="setupKcetForm('${uid}', 'cs')" style="flex:1; padding:10px; border:none; border-radius:11px; font-size:0.75rem; font-weight:600; cursor:pointer; background:#ffffff; color:#000000; transition:all 0.3s var(--ease);">Engineering</button>
            <button id="non-btn-${uid}" onclick="setupKcetForm('${uid}', 'bio')" style="flex:1; padding:10px; border:none; border-radius:11px; font-size:0.75rem; font-weight:600; cursor:pointer; background:transparent; color:rgba(255,255,255,0.4); transition:all 0.3s var(--ease);">Non-Engineering</button>
          </div>
        </div>

        <div id="kcet-form-${uid}">
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${renderInputRow(uid, 'math', 'Maths', 'fa-square-root-variable')}
            ${renderInputRow(uid, 'phy', 'Physics', 'fa-atom')}
            ${renderInputRow(uid, 'chem', 'Chemistry', 'fa-vial')}
            <div id="bio-row-wrapper-${uid}" style="display:none;">
              ${renderInputRow(uid, 'bio', 'Biology', 'fa-dna')}
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:12px; margin:24px 0;">
            <div style="flex:1; height:1px; background:rgba(255,255,255,0.05);"></div>
            <div style="font-size:0.6rem; color:rgba(255,255,255,0.2); font-weight:800; letter-spacing:0.1em;">OR</div>
            <div style="flex:1; height:1px; background:rgba(255,255,255,0.05);"></div>
          </div>

          <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.02); padding:12px 16px; border-radius:18px; border:1px solid rgba(255,255,255,0.05);">
             <div style="display:flex; align-items:center; gap:12px;">
                <i class="fa-solid fa-layer-group" style="color:rgba(255,255,255,0.3); font-size:0.9rem;"></i>
                <span style="font-size:0.85rem; color:rgba(255,255,255,0.7);">Total Aggregate</span>
             </div>
             <div style="display:flex; align-items:center; gap:6px;">
                <input type="number" id="total-m-${uid}" placeholder="000" style="width:60px; background:transparent; border:none; color:#ffffff; text-align:right; font-size:0.9rem; font-weight:600; outline:none;">
                <span style="font-size:0.8rem; color:rgba(255,255,255,0.2);">/600</span>
             </div>
          </div>

          <button onclick="calculateKcetRank('${uid}')" style="
            width:100%; margin-top:24px; padding:16px; 
            background: #ffffff; border: none; 
            border-radius: 18px; color: #000000; font-weight:700; font-size:0.85rem;
            display:flex; align-items:center; justify-content:center; gap:10px; cursor:pointer;
            transition: opacity 0.2s;
          " onactive="this.style.opacity='0.8'">
            Get Prediction
          </button>
        </div>

        <div id="kcet-result-${uid}" style="display:none; margin-top:24px; padding-top:24px; border-top:1px solid rgba(255,255,255,0.05);"></div>
      </div>
    `;
    container.appendChild(sysBubble);
    window.scrollEsToBottom();
  }

  function renderInputRow(uid, id, label, icon) {
    return `
      <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(255,255,255,0.02); padding:12px 16px; border-radius:18px; border:1px solid rgba(255,255,255,0.05);">
        <div style="display:flex; align-items:center; gap:12px;">
          <i class="fa-solid ${icon}" style="color:rgba(255,255,255,0.3); font-size:0.9rem; width:20px; text-align:center;"></i>
          <span style="font-size:0.85rem; color:rgba(255,255,255,0.7);">${label}</span>
        </div>
        <div style="display:flex; align-items:center; gap:4px;">
          <input type="number" id="in-${id}-${uid}" placeholder="00" style="width:50px; background:transparent; border:none; color:#ffffff; text-align:right; font-size:0.9rem; font-weight:600; outline:none;">
          <span style="font-size:0.8rem; color:rgba(255,255,255,0.2);">/100</span>
        </div>
      </div>
    `;
  }

  window.setupKcetForm = (uid, type) => {
    const engBtn = document.getElementById(`eng-btn-${uid}`);
    const nonBtn = document.getElementById(`non-btn-${uid}`);
    const bioRow = document.getElementById(`bio-row-wrapper-${uid}`);

    if (type === 'cs') {
      engBtn.style.background = '#ffffff'; engBtn.style.color = '#000000';
      nonBtn.style.background = 'transparent'; nonBtn.style.color = 'rgba(255,255,255,0.4)';
      bioRow.style.display = 'none';
    } else {
      nonBtn.style.background = '#ffffff'; nonBtn.style.color = '#000000';
      engBtn.style.background = 'transparent'; engBtn.style.color = 'rgba(255,255,255,0.4)';
      bioRow.style.display = 'block';
    }
  };


  // Helper functions for the UI
  window.setupKcetForm = (uid, type) => {
    document.getElementById(`kcet-step-1-${uid}`).style.display = 'none';
    const form = document.getElementById(`kcet-form-${uid}`);
    form.style.display = 'block';
    const optInputBoard = document.getElementById(`b-opt-${uid}`);
    const optInputKcet = document.getElementById(`c-opt-${uid}`);
    
    if(type === 'bio') {
      optInputBoard.placeholder = "Bio Board";
      optInputKcet.placeholder = "Bio KCET";
    }
  };

  window.calculateKcetRank = (uid) => {
    // 50-50 Logic
    const bAvg = (parseFloat(document.getElementById(`b-p-${uid}`).value) + parseFloat(document.getElementById(`b-c-${uid}`).value) + parseFloat(document.getElementById(`b-opt-${uid}`).value)) / 3;
    const cAvg = ((parseFloat(document.getElementById(`c-p-${uid}`).value) + parseFloat(document.getElementById(`c-c-${uid}`).value) + parseFloat(document.getElementById(`c-opt-${uid}`).value)) / 180) * 100;
    
    const finalScore = (bAvg + cAvg) / 2;
    let rank = Math.round(Math.pow(100 - finalScore, 2.5) * 5); // Rough estimation formula

    const resArea = document.getElementById(`kcet-result-${uid}`);
    resArea.style.display = 'block';
    resArea.innerHTML = `
      <div style="font-size:0.65rem; color:#888;">EXPECTED ENGINEERING RANK</div>
      <div style="font-size:1.8rem; font-weight:700; color:#fff; margin:5px 0;">~ ${rank.toLocaleString()}</div>
      <button onclick="launchKcetPredictor()" style="background:transparent; border:1px solid #222; color:#555; padding:6px 12px; border-radius:6px; font-size:0.65rem; cursor:pointer; margin-top:10px;"><i class="fa-solid fa-rotate-right"></i> Resend</button>
    `;
  };

  // ========== 2. THE ROUTER (THE BRAIN) ==========
  // This overrides the original search to handle your new features
  const originalSearch = window.doEsSearch;
  window.doEsSearch = function(val) {
    const q = val.toLowerCase().trim();
    
    if (q.includes("kcet") || q.includes("prediction")) {
      // 1. Hide greeting
      document.getElementById('es-greeting').style.display = 'none';
      // 2. Show user bubble
      window.appendEsBubbleUser(val);
      // 3. Clear input
      document.getElementById('es-input').value = '';
      // 4. Launch KCET
      setTimeout(launchKcetPredictor, 300);
      return;
    }
    
    // If not KCET, use the standard search (colleges/people)
    originalSearch(val);
  };
  
})();
