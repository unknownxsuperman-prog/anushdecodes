/**
 * x0s.link – Disha Intelligence Extensions Module (LOCAL AI EDITION)
 * Zero API dependency – all intelligence runs on-device.
 */
(function () {
  // ========== LOCAL AI ENGINE ==========
  const LocalAI = {
    // Conversation memory (simple state)
    lastIntent: null,
    lastEntities: {},
    greetCount: 0,

    /**
     * Main dispatcher: analyse query & return a plain text response.
     */
    async respond(query) {
      const q = query.trim();
      if (!q) return "I didn't catch that. Could you repeat?";

      const lower = q.toLowerCase();

      // ---- Pre-defined intents ----
      const intents = [
        { name: 'greeting', patterns: [/^(hi|hello|hey|yo|good\s(morning|afternoon|evening))/i, /\b(hi|hello|hey)\b/i] },
        { name: 'farewell', patterns: [/\b(bye|goodbye|see\syou|tata)\b/i] },
        { name: 'who_are_you', patterns: [/\b(who\s(are|r)\s?(you|u)|your\sname|what\s(are|r)\s?(you|u))\b/i] },
        { name: 'what_can_you_do', patterns: [/\b(what\s(can|do)\s(you|u)\s(do|help)|abilities|features)\b/i] },
        { name: 'creator', patterns: [/\b(who\s(created|made|built)\s?(you|u)|your\screator)\b/i] },
        { name: 'thanks', patterns: [/\b(thanks|thank\s?(you|u)|thx|ty)\b/i] },
        { name: 'time', patterns: [/\b(time|clock|what\s?time)\b/i] },
        { name: 'date', patterns: [/\b(date|today|day)\b/i] },
        { name: 'joke', patterns: [/\b(joke|tell\sme\sa\sjoke|make\sme\slaugh)\b/i] },
        { name: 'quote', patterns: [/\b(quote|motivat|inspir)\b/i] },
        { name: 'fact', patterns: [/\b(fact|did\syou\sknow|tell\sme\ssomething|interesting)\b/i] },
        { name: 'definition', patterns: [/\b(what\s(is|are|does)\s.*\??$|define\s.*|meaning\sof\s)/i] },
        { name: 'weather', patterns: [/\b(weather|temperature|forecast)\b/i] },
        { name: 'how_are_you', patterns: [/\b(how\s(are|r)\s?(you|u)|what'?s\sup)\b/i] },
        { name: 'age', patterns: [/\b(how\sold|your\sage)\b/i] }
      ];

      let matchedIntent = null;
      for (const intent of intents) {
        if (intent.patterns.some(p => p.test(lower))) {
          matchedIntent = intent.name;
          break;
        }
      }

      // Store intent for context
      this.lastIntent = matchedIntent;

      // Respond according to intent
      switch (matchedIntent) {
        case 'greeting':
          this.greetCount++;
          return this.respondGreeting();
        case 'farewell':
          return this.respondFarewell();
        case 'who_are_you':
          return "I'm **x0s.link Disha**, your on‑device AI assistant. I live inside this search engine and can solve math, fetch news, answer questions, and keep you company.";
        case 'what_can_you_do':
          return "I can:\n- 🧮 **Calculate** math expressions\n- 📰 **Summarise current affairs**\n- 🤖 **Answer general knowledge**\n- 🕒 Tell the **time/date**\n- 😄 Crack **jokes** & share **quotes**\n- 📘 Give **definitions** of common terms\nJust type something like _'calc 5*3'_, _'latest tech news'_ or _'what is photosynthesis'_.";
        case 'creator':
          return "I was crafted by the developers at **x0s.link** as a lightweight, privacy‑first AI that runs entirely in your browser.";
        case 'thanks':
          return "You're welcome! 😊 If you need anything else, just ask.";
        case 'time':
          return `The current time is **${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}**.`;
        case 'date':
          return `Today is **${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}**.`;
        case 'joke':
          return this.getRandomJoke();
        case 'quote':
          return this.getRandomQuote();
        case 'fact':
          return this.getRandomFact();
        case 'definition':
          return this.respondDefinition(lower);
        case 'weather':
          return "I can't access live weather data, but you can check **[OpenWeatherMap](https://openweathermap.org)** or just peek outside! ☀️";
        case 'how_are_you':
          return "I'm running on all cores and feeling fantastic! Thanks for asking. How can I help you?";
        case 'age':
          return "I was born in the cloud of code, so I'm timeless. But my current version is fresh out of the compiler.";
        default:
          return this.respondGeneralKnowledge(lower);
      }
    },

    // ----- INTENT HANDLERS -----
    respondGreeting() {
      const greetings = [
        "Hey there! 👋 How can I help you today?",
        "Hi! Ready to explore something new?",
        "Hello! I'm all ears (well, virtual ones).",
        `Welcome back${this.greetCount > 1 ? ' again' : ''}! What's on your mind?`
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    },

    respondFarewell() {
      return "Goodbye! Remember, I’m just a keystroke away. Stay curious! 👋";
    },

    getRandomJoke() {
      const jokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
        "Why did the AI go to school? To improve its neural network!",
        "Parallel lines have so much in common – it’s a shame they’ll never meet.",
        "I told my computer I needed a break, now it won’t stop sending me KitKat ads.",
        "Why was the math book sad? It had too many problems."
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    },

    getRandomQuote() {
      const quotes = [
        "\"The only way to do great work is to love what you do.\" – Steve Jobs",
        "\"Stay hungry, stay foolish.\" – Steve Jobs",
        "\"Strive not to be a success, but rather to be of value.\" – Albert Einstein",
        "\"It does not matter how slowly you go as long as you do not stop.\" – Confucius",
        "\"Believe you can and you're halfway there.\" – Theodore Roosevelt"
      ];
      return quotes[Math.floor(Math.random() * quotes.length)];
    },

    getRandomFact() {
      const facts = [
        "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still edible!",
        "A day on Venus is longer than a year on Venus. It takes 243 Earth days to rotate once but only 225 Earth days to orbit the Sun.",
        "Octopuses have three hearts, and two of them stop beating when they swim.",
        "Bananas are berries, but strawberries aren't.",
        "There are more stars in the universe than grains of sand on all the Earth's beaches."
      ];
      return `**Did you know?** ${facts[Math.floor(Math.random() * facts.length)]}`;
    },

    respondDefinition(lower) {
      // Simple definition lookup
      const defs = {
        photosynthesis: "The process by which green plants use sunlight to synthesise nutrients from carbon dioxide and water.",
        gravity: "A natural phenomenon by which all things with mass are brought toward one another. On Earth, gravity gives weight to physical objects.",
        algorithm: "A set of rules or steps for solving a problem, especially by a computer.",
        ai: "Artificial Intelligence – the simulation of human intelligence in machines that are programmed to think and learn.",
        bitcoin: "A decentralised digital currency, without a central bank, that can be sent from user to user on the peer-to-peer bitcoin network.",
        blockchain: "A distributed ledger technology that maintains a secure and immutable record of transactions.",
        dna: "Deoxyribonucleic acid – the molecule that carries genetic information in living organisms.",
        cloud: "A network of remote servers hosted on the Internet to store, manage, and process data, rather than a local server.",
        javascript: "A high-level, interpreted programming language that conforms to the ECMAScript specification. It is the language of the web."
      };
      // Extract the term (simple – everything after "what is" or "define")
      let term = lower.replace(/(what\s(is|are|does)\s+|define\s+|meaning\sof\s+)/i, '')
                      .replace(/\?/g, '')
                      .trim();
      if (defs[term]) {
        return `**${term}**: ${defs[term]}`;
      } else if (term) {
        return `I don't have a definition for "${term}" in my local memory, but you can search the web for a detailed explanation.`;
      }
      return "What would you like me to define?";
    },

    respondGeneralKnowledge(lower) {
      // Additional keyword-based facts / templates
      const kb = [
        { keys: ['capital', 'india'], answer: "The capital of India is **New Delhi**." },
        { keys: ['capital', 'france'], answer: "The capital of France is **Paris**." },
        { keys: ['capital', 'japan'], answer: "The capital of Japan is **Tokyo**." },
        { keys: ['president', 'usa'], answer: "The President of the United States is the head of state and government." },
        { keys: ['largest', 'ocean'], answer: "The largest ocean on Earth is the **Pacific Ocean**." },
        { keys: ['fastest', 'animal'], answer: "The fastest land animal is the **cheetah**, capable of reaching speeds up to 120 km/h." },
        { keys: ['tallest', 'mountain'], answer: "Mount Everest, at 8,848 metres, is the tallest mountain above sea level." },
        { keys: ['pi'], answer: "Pi (π) is approximately 3.14159, the ratio of a circle's circumference to its diameter." },
        { keys: ['e=mc2', 'einstein'], answer: "E=mc² is Albert Einstein's mass-energy equivalence formula, stating that energy equals mass times the speed of light squared." },
        { keys: ['light', 'speed'], answer: "The speed of light in a vacuum is approximately 299,792,458 metres per second." },
        { keys: ['mars', 'planet'], answer: "Mars is the fourth planet from the Sun, often called the Red Planet due to its iron oxide surface." },
        { keys: ['elephant', 'weight'], answer: "An adult African elephant can weigh up to 6,000 kg." },
        { keys: ['human', 'bones'], answer: "The adult human body has 206 bones." },
        { keys: ['water', 'boil'], answer: "Water boils at 100°C (212°F) at sea level." },
        { keys: ['longest', 'river'], answer: "The Nile is often considered the longest river in the world, flowing for about 6,650 km." }
      ];

      // Check knowledge base
      for (const item of kb) {
        if (item.keys.every(k => lower.includes(k))) {
          return item.answer;
        }
      }

      // If no match, give a helpful fallback
      const fallbacks = [
        "I'm not sure about that, but I'm constantly learning. Could you rephrase?",
        "Hmm, that's beyond my local brain right now. Try asking about math, news, or a definition.",
        "I don't have an answer for that, but you can use the web search for more details.",
        "That's a great question! I'm still expanding my knowledge – maybe you can teach me?"
      ];
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
  };

  // ========== TYPEWRITER EFFECT ==========
  async function typewriteText(container, text) {
    container.innerHTML = '';
    let i = 0;
    const total = text.length;
    return new Promise(resolve => {
      function type() {
        if (i < total) {
          // Render with basic Markdown support
          container.innerHTML = simpleMarkdown(text.substring(0, i + 1)) + '<span class="typing-cursor">▌</span>';
          i++;
          const speed = 15 + Math.random() * 20; // ms per char
          setTimeout(type, speed);
          if (typeof window.scrollEsToBottom === 'function') window.scrollEsToBottom();
        } else {
          container.innerHTML = simpleMarkdown(text);
          resolve();
        }
      }
      type();
    });
  }

  // Simple Markdown → HTML (bold, italic, code, line breaks)
  function simpleMarkdown(md) {
    return md
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:#1a1a1a;padding:1px 5px;border-radius:4px;">$1</code>')
      .replace(/\n/g, '<br>');
  }

  // ========== ORIGINAL MODULES (unchanged) ==========
  function executeCalculation(expr) {
    const messagesContainer = document.getElementById('es-messages');
    const sysBubble = createSysBubble("Calculation processed:");
    let result, isError = false;
    try {
      const sanitized = expr.replace(/[^0-9\s+\-*/().]/g, '');
      result = Function(`"use strict"; return (${sanitized})`)();
      if (result === undefined || isNaN(result)) throw new Error();
    } catch (e) {
      result = "Syntax Error – Check your expression";
      isError = true;
    }
    const card = document.createElement('div');
    card.className = 'es-result-card';
    card.style.borderLeft = isError ? '2px solid #ff3b5c' : '2px solid var(--accent)';
    card.style.background = '#0a0a0a';
    card.innerHTML = `
      <div style="font-size:0.65rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.08em; margin-bottom:2px;">
        <i class="fa-solid fa-calculator" style="margin-right:5px; color:${isError?'#ff3b5c':'var(--accent)'}"></i> Math Kernel Engine
      </div>
      <div style="font-size:0.8rem; color:var(--muted); font-family:monospace;">${expr}</div>
      <div style="font-size:1.15rem; font-weight:700; color:${isError?'#ff3b5c':'var(--text)'}; margin-top:4px;">= ${result}</div>
    `;
    sysBubble.appendChild(card);
    messagesContainer.appendChild(sysBubble);
  }

  function executeNewsReport(cleanQuery) {
    const messagesContainer = document.getElementById('es-messages');
    const sysBubble = createSysBubble("Live intelligence brief:");
    let focusTag = "General";
    if (cleanQuery.includes("tech") || cleanQuery.includes("ai")) focusTag = "Tech Spectrum";
    else if (cleanQuery.includes("india") || cleanQuery.includes("karnataka")) focusTag = "National Desk";
    else if (cleanQuery.includes("infra") || cleanQuery.includes("transport")) focusTag = "Infrastructure";
    else if (cleanQuery.includes("local")) focusTag = "Regional Bulletin";
    const feed = [
      { tag: focusTag, title: "Decentralised storage reshapes data sovereignty across edge deployments", summary: "Self-hosted bare-metal clusters gain traction as enterprises bypass centralised cloud dependency.", time: "12m ago" },
      { tag: "India Tech", title: "Semiconductor mission accelerates fabless ecosystem in tier‑2 cities", summary: "Startup grants and skill hubs push fabrication R&D beyond metros.", time: "1h ago" },
      { tag: "Transit", title: "Algorithmic fleet management pilots show 30% drop in wait times", summary: "Smart dispatch integrates with public transit APIs for first‑mile connectivity.", time: "3h ago" }
    ];
    feed.forEach(item => {
      const card = document.createElement('div');
      card.className = 'es-result-card';
      card.style.marginBottom = '10px';
      card.style.background = '#0a0a0a';
      card.style.borderColor = '#1a1a1a';
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-size:0.58rem; background:rgba(0,122,255,0.1); border:1px solid rgba(0,122,255,0.2); color:var(--accent); padding:2px 8px; border-radius:99px; font-weight:600; letter-spacing:0.04em;">${item.tag}</span>
          <span style="font-size:0.6rem; color:var(--muted);">${item.time}</span>
        </div>
        <div style="font-size:0.86rem; font-weight:600; color:var(--text); line-height:1.3; margin-bottom:4px;">${item.title}</div>
        <div style="font-size:0.74rem; color:var(--muted); line-height:1.45;">${item.summary}</div>
      `;
      sysBubble.appendChild(card);
    });
    messagesContainer.appendChild(sysBubble);
  }

  function createSysBubble(headerText) {
    const bubble = document.createElement('div');
    bubble.className = 'es-bubble-sys';
    const header = document.createElement('div');
    header.className = 'es-bubble-sys-text';
    header.textContent = headerText;
    bubble.appendChild(header);
    return bubble;
  }

  // ========== MAIN HOOK ==========
  document.addEventListener("DOMContentLoaded", () => {
    if (typeof window.doEsSearch === "function") {
      const coreEsSearch = window.doEsSearch;
      window.doEsSearch = async function (val) {
        if (!val || !val.trim()) return;
        const query = val.trim();
        const lowerQuery = query.toLowerCase();

        // --- Math Detection ---
        const mathRegex = /^[0-9\s+\-*/().]+$/;
        const containsOperator = /[+\-*/]/.test(query);
        const isMathWord = lowerQuery.startsWith("calc") || lowerQuery.startsWith("evaluate");
        let cleanMathExpr = query;
        if (isMathWord) cleanMathExpr = query.replace(/^(calc|calculate|evaluate)\s*/i, "");
        if ((mathRegex.test(cleanMathExpr) && containsOperator) || (isMathWord && cleanMathExpr)) {
          handleExtendedFeature(query, () => executeCalculation(cleanMathExpr));
          return;
        }

        // --- News Detection ---
        const newsKeywords = ["news", "current affairs", "updates", "headlines", "trends", "breaking"];
        const matchesNews = newsKeywords.some(keyword => lowerQuery.includes(keyword));
        if (matchesNews) {
          handleExtendedFeature(query, () => executeNewsReport(lowerQuery));
          return;
        }

        // --- Local AI for everything else ---
        handleExtendedFeature(query, async () => {
          const messagesContainer = document.getElementById('es-messages');
          const sysBubble = createSysBubble(""); // no header for AI
          const contentDiv = document.createElement('div');
          contentDiv.className = 'ai-response-content';
          contentDiv.style.fontSize = '0.9rem';
          contentDiv.style.color = 'var(--text)';
          contentDiv.style.lineHeight = '1.6';
          sysBubble.appendChild(contentDiv);
          messagesContainer.appendChild(sysBubble);

          // Show blinking cursor while generating
          contentDiv.innerHTML = '<span class="typing-cursor">▌</span>';
          const answer = await LocalAI.respond(query);
          await typewriteText(contentDiv, answer);
        });
      };
    }
  });

  function handleExtendedFeature(userQuery, executionCallback) {
    const input = document.getElementById('es-input');
    if (input) input.value = '';
    const sendBtn = document.getElementById('es-send');
    if (sendBtn) sendBtn.classList.remove('visible');
    const suggestions = document.getElementById('es-suggestions');
    if (suggestions) suggestions.style.display = 'none';
    const greet = document.getElementById('es-greeting');
    if (greet) greet.style.display = 'none';
    if (typeof window.appendEsBubbleUser === 'function') {
      window.appendEsBubbleUser(userQuery);
    }
    setTimeout(() => {
      executionCallback();
      if (typeof window.scrollEsToBottom === 'function') {
        window.scrollEsToBottom();
      }
    }, 320);
  }

  // Inject cursor animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
    .typing-cursor { font-weight:100; color:var(--accent); }
  `;
  document.head.appendChild(style);
})();
