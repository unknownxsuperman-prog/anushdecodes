/**
 * x0s.link - Disha Intelligence Extensions Module
 * Features: Secure Math Parser & Clean Minimal News UI Engine
 */

(function () {
  // Wait for the DOM to fully cook before mounting hooks
  document.addEventListener("DOMContentLoaded", () => {
    if (typeof window.doEsSearch === "function") {
      // Intercept the original core function
      const coreEsSearch = window.doEsSearch;

      window.doEsSearch = function (val) {
        if (!val || !val.trim()) return;
        const query = val.trim();
        const lowerQuery = query.toLowerCase();

        // 1. Check for Mathematical Expressions
        const mathRegex = /^[0-9\s+\-*/().]+$/;
        const containsOperator = /[+\-*/]/.test(query);
        const isMathWord = lowerQuery.startsWith("calc") || lowerQuery.startsWith("evaluate");

        // Clean query expression if preceded by words
        let cleanMathExpr = query;
        if (isMathWord) {
          cleanMathExpr = query.replace(/^(calc|calculate|evaluate)\s*/i, "");
        }

        if ((mathRegex.test(cleanMathExpr) && containsOperator) || (isMathWord && cleanMathExpr)) {
          handleExtendedFeature(query, () => executeCalculation(cleanMathExpr));
          return;
        }

        // 2. Check for News / Current Affairs Queries
        const newsKeywords = ["news", "current affairs", "updates", "headlines", "trends"];
        const matchesNews = newsKeywords.some(keyword => lowerQuery.includes(keyword));

        if (matchesNews) {
          handleExtendedFeature(query, () => executeNewsReport(lowerQuery));
          return;
        }

        // 3. Fallback to original Profiles/Colleges search logic if no extensions match
        coreEsSearch(val);
      };
    }
  });

  /**
   * Orchestrates the visual sequence matching the structural UI behaviors of Disha
   */
  function handleExtendedFeature(userQuery, executionCallback) {
    document.getElementById('es-input').value = '';
    document.getElementById('es-send').classList.remove('visible');
    document.getElementById('es-suggestions').style.display = 'none';

    const greet = document.getElementById('es-greeting');
    if (greet) greet.style.display = 'none';

    // Call layout pipeline helper to append User Bubble
    if (typeof window.appendEsBubbleUser === 'function') {
      window.appendEsBubbleUser(userQuery);
    }

    // Trigger visual processing offset to mimic engine analysis
    setTimeout(() => {
      executionCallback();
      if (typeof window.scrollEsToBottom === 'function') {
        window.scrollEsToBottom();
      }
    }, 320);
  }

  /**
   * Secure, lightweight arithmetic evaluator
   */
  function executeCalculation(expr) {
    const messagesContainer = document.getElementById('es-messages');
    const sysBubble = document.createElement('div');
    sysBubble.className = 'es-bubble-sys';

    const headerTxt = document.createElement('div');
    headerTxt.className = 'es-bubble-sys-text';
    headerTxt.textContent = "Calculation processed:";
    sysBubble.appendChild(headerTxt);

    let result;
    let isError = false;

    try {
      // Sanitize input to completely block execution contexts outside math tokens
      const sanitized = expr.replace(/[^0-9\s+\-*/().]/g, '');
      // Evaluate within a clean functional context
      result = Function(`"use strict"; return (${sanitized})`)();
      if (result === undefined || isNaN(result)) throw new Error();
    } catch (e) {
      result = "Syntax Error: Check parameters";
      isError = true;
    }

    // Build custom calculation interface node
    const card = document.createElement('div');
    card.className = 'es-result-card';
    card.style.borderLeft = isError ? '2px solid #ff3b5c' : '2px solid var(--accent)';
    card.style.background = '#0a0a0a';

    card.innerHTML = `
      <div style="font-size: 0.65rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 2px;">
        <i class="fa-solid fa-calculator" style="margin-right: 5px; color: ${isError ? '#ff3b5c' : 'var(--accent)'}"></i> Math Kernel Engine
      </div>
      <div style="font-size: 0.8rem; color: var(--muted); font-family: monospace;">${expr}</div>
      <div style="font-size: 1.15rem; font-weight: 700; color: ${isError ? '#ff3b5c' : 'var(--text)'}; margin-top: 4px;">= ${result}</div>
    `;

    sysBubble.appendChild(card);
    messagesContainer.appendChild(sysBubble);
  }

  /**
   * System update and regional timeline current affairs feed generator
   */
  function executeNewsReport(cleanQuery) {
    const messagesContainer = document.getElementById('es-messages');
    const sysBubble = document.createElement('div');
    sysBubble.className = 'es-bubble-sys';

    const headerTxt = document.createElement('div');
    headerTxt.className = 'es-bubble-sys-text';
    headerTxt.textContent = "Live intelligence brief:";
    sysBubble.appendChild(headerTxt);

    // Mock Database tailored to context (Tech trends / Indian ecosystems / Sovereign modules)
    const newsFeed = [
      {
        tag: "Tech Spectrum",
        title: "Peer-to-Peer Protocol Architectures Disrupt Traditional Storage Models",
        summary: "Local dev layers shift heavily toward localized setups, bypassing external backend dependencies through self-hosted bare metal servers.",
        time: "12m ago"
      },
      {
        tag: "National Tech",
        title: "India Silicon Nodes Scale Architecture Infrastructure Deployment",
        summary: "Sovereign platform updates mark sharp increases in custom tech deployment across regional high-speed infrastructure lines.",
        time: "1h ago"
      },
      {
        tag: "Infrastructure",
        title: "Transit Network Optimization Frameworks Pilot Smart Fleet Allocation",
        summary: "Ride-hailing parameters adapt algorithmic distribution models to counter surging commuter matrices inside Tier-2 cluster cities.",
        time: "3h ago"
      }
    ];

    // Filter logic if looking specifically for localized elements
    let selectedNews = newsFeed;
    if (cleanQuery.includes("local") || cleanQuery.includes("karnataka") || cleanQuery.includes("hp")) {
      selectedNews = [
        {
          tag: "Regional Transit",
          title: "Vijayanagara Transit Modals Plan Network Routing Updates",
          summary: "Local corridors clear development pipelines for point-to-point digital dispatch architectures, aiming to lower intra-city logistics lag.",
          time: "Just Now"
        },
        ...newsFeed
      ];
    }

    // Structural node generator mapping directly into the search timeline layout
    selectedNews.forEach(item => {
      const card = document.createElement('div');
      card.className = 'es-result-card';
      card.style.marginBottom = '10px';
      card.style.background = '#0a0a0a';
      card.style.borderColor = '#1a1a1a';

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 0.58rem; background: rgba(0, 122, 255, 0.1); border: 1px solid rgba(0, 122, 255, 0.2); color: var(--accent); padding: 2px 8px; border-radius: 99px; font-weight: 600; letter-spacing: 0.04em;">
            ${item.tag}
          </span>
          <span style="font-size: 0.6rem; color: var(--muted);">${item.time}</span>
        </div>
        <div style="font-size: 0.86rem; font-weight: 600; color: var(--text); line-height: 1.3; margin-bottom: 4px;">
          ${item.title}
        </div>
        <div style="font-size: 0.74rem; color: var(--muted); line-height: 1.45; font-weight: 300;">
          ${item.summary}
        </div>
      `;
      sysBubble.appendChild(card);
    });

    messagesContainer.appendChild(sysBubble);
  }
})();
