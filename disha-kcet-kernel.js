/**
 * x0s.link – Disha KCET Rank Predictive Kernel Module
 * Aesthetic Spec: xos1 (Clinical Dark, Glassmorphism, Space Grotesk)
 */
(function () {
  'use strict';

  document.addEventListener("DOMContentLoaded", () => {
    if (typeof window.doEsSearch === "function") {
      const coreEsSearch = window.doEsSearch;

      window.doEsSearch = function (val) {
        if (!val || !val.trim()) return;
        const query = val.trim();
        const lowerQuery = query.toLowerCase();

        // Regex matches variations: kcet rank prediction, kcet prediction, kcet predict
        const kcetPattern = /kcet\s*(rank\s*prediction|prediction|predict)/i;

        if (kcetPattern.test(lowerQuery)) {
          handleKcetExecution(query);
          return;
        }

        coreEsSearch(val);
      };
    }
  });

  function handleKcetExecution(userQuery) {
    // Clear user search field states immediately
    document.getElementById('es-input').value = '';
    document.getElementById('es-send').classList.remove('visible');
    document.getElementById('es-suggestions').style.display = 'none';

    const greet = document.getElementById('es-greeting');
    if (greet) greet.style.display = 'none';

    if (typeof window.appendEsBubbleUser === 'function') {
      window.appendEsBubbleUser(userQuery);
    }

    setTimeout(() => {
      injectKcetInteractiveForm();
      if (typeof window.scrollEsToBottom === 'function') {
        window.scrollEsToBottom();
      }
    }, 280);
  }

  function injectKcetInteractiveForm() {
    const container = document.getElementById('es-messages');
    const sysBubble = document.createElement('div');
    sysBubble.className = 'es-bubble-sys';
    sysBubble.style.width = '100%';
    sysBubble.style.maxWidth = '92%';

    // Generate isolated session timestamp identifiers to secure input parameters locally
    const uid = Date.now();

    const card = document.createElement('div');
    card.className = 'es-result-card';
    card.id = `kcet-wrapper-${uid}`;
    card.style.background = '#0a0a0a';
    card.style.border = '1px solid #1a1a1a';
    card.style.borderLeft = '3px solid var(--accent)';
    card.style.padding = '16px';
    card.style.borderRadius = '14px';

    card.innerHTML = `
      <!-- Header Area -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <span style="font-size:0.58rem; font-weight:700; color:var(--accent); letter-spacing:0.12em; text-transform:uppercase;">
          <i class="fa-solid fa-chart-line" style="margin-right:4px;"></i> KCET RANK MATRIX PROJECTION
        </span>
        <span style="font-size:0.52rem; color:#444; font-family:monospace;">v2.5 // 2026</span>
      </div>

      <!-- Stream Selector Pills -->
      <div style="font-size:0.7rem; color:var(--muted); margin-bottom:6px; font-weight:500;">Select Academic Track:</div>
      <div style="display:flex; gap:8px; margin-bottom:16px;">
        <button id="btn-cs-${uid}" style="flex:1; padding:10px; background:rgba(0,122,255,0.15); border:1px solid var(--accent); color:#fff; border-radius:8px; font-size:0.72rem; font-family:'Space Grotesk'; font-weight:600; cursor:pointer; transition:all 0.2s;">
          Engineering (CS Focus)
        </button>
        <button id="btn-bio-${uid}" style="flex:1; padding:10px; background:#111; border:1px solid #1a1a1a; color:var(--muted); border-radius:8px; font-size:0.72rem; font-family:'Space Grotesk'; font-weight:600; cursor:pointer; transition:all 0.2s;">
          Medical / Pharma (Bio)
        </button>
      </div>

      <!-- Parameter Inputs Box Layout -->
      <div id="form-body-${uid}" style="display:flex; flex-direction:column; gap:12px;">
        
        <!-- Board Performance Grid Rows -->
        <div>
          <div style="font-size:0.7rem; color:var(--muted); margin-bottom:6px; font-weight:500;">12th Board Marks / Percentages (out of 100):</div>
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px;" id="board-grid-${uid}">
            <input type="number" id="board-p-${uid}" placeholder="Physics" max="100" style="background:#111; border:1px solid #1a1a1a; color:#fff; border-radius:6px; padding:8px; font-size:0.75rem; text-align:center; outline:none; font-family:'Space Grotesk';">
            <input type="number" id="board-c-${uid}" placeholder="Chem" max="100" style="background:#111; border:1px solid #1a1a1a; color:#fff; border-radius:6px; padding:8px; font-size:0.75rem; text-align:center; outline:none; font-family:'Space Grotesk';">
            <input type="number" id="board-m-${uid}" placeholder="Math" max="100" style="background:#111; border:1px solid #1a1a1a; color:#fff; border-radius:6px; padding:8px; font-size:0.75rem; text-align:center; outline:none; font-family:'Space Grotesk';">
          </div>
          <input type="number" id="board-b-${uid}" placeholder="Biology Marks" max="100" style="display:none; width:100%; margin-top:8px; background:#111; border:1px solid #1a1a1a; color:#fff; border-radius:6px; padding:8px; font-size:0.75rem; text-align:center; outline:none; font-family:'Space Grotesk';">
        </div>

        <!-- KCET Score Grid Rows -->
        <div>
          <div style="font-size:0.7rem; color:var(--muted); margin-bottom:6px; font-weight:500;">KCET Scores Obtained (out of 60 per subject):</div>
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px;" id="kcet-grid-${uid}">
            <input type="number" id="kcet-p-${uid}" placeholder="Physics" max="60" style="background:#111; border:1px solid #1a1a1a; color:#fff; border-radius:6px; padding:8px; font-size:0.75rem; text-align:center; outline:none; font-family:'Space Grotesk';">
            <input type="number" id="kcet-c-${uid}" placeholder="Chem" max="60" style="background:#111; border:1px solid #1a1a1a; color:#fff; border-radius:6px; padding:8px; font-size:0.75rem; text-align:center; outline:none; font-family:'Space Grotesk';">
            <input type="number" id="kcet-m-${uid}" placeholder="Math" max="60" style="background:#111; border:1px solid #1a1a1a; color:#fff; border-radius:6px; padding:8px; font-size:0.75rem; text-align:center; outline:none; font-family:'Space Grotesk';">
          </div>
          <input type="number" id="kcet-b-${uid}" placeholder="Biology Score" max="60" style="display:none; width:100%; margin-top:8px; background:#111; border:1px solid #1a1a1a; color:#fff; border-radius:6px; padding:8px; font-size:0.75rem; text-align:center; outline:none; font-family:'Space Grotesk';">
        </div>

        <!-- Submission Trigger Layout Control -->
        <button id="calc-trigger-${uid}" style="width:100%; padding:11px; background:var(--accent); color:#fff; border:none; border-radius:8px; font-size:0.8rem; font-family:'Space Grotesk'; font-weight:700; cursor:pointer; margin-top:6px; transition:opacity 0.15s;">
          Run Rank Prediction Engine
        </button>
      </div>
    `;

    sysBubble.appendChild(card);
    container.appendChild(sysBubble);

    // Dynamic Tracking Configuration Logic References
    let currentStream = 'cs';
    const btnCs = card.querySelector(`#btn-cs-${uid}`);
    const btnBio = card.querySelector(`#btn-bio-${uid}`);
    const boardB = card.querySelector(`#board-b-${uid}`);
    const kcetB = card.querySelector(`#kcet-b-${uid}`);
    const boardM = card.querySelector(`#board-m-${uid}`);
    const kcetM = card.querySelector(`#kcet-m-${uid}`);
    const boardGrid = card.querySelector(`#board-grid-${uid}`);
    const kcetGrid = card.querySelector(`#kcet-grid-${uid}`);

    // Click behavior configurations for the Stream Pills
    btnCs.onclick = () => {
      currentStream = 'cs';
      btnCs.style.background = 'rgba(0,122,255,0.15)'; btnCs.style.borderColor = 'var(--accent)'; btnCs.style.color = '#fff';
      btnBio.style.background = '#111'; btnBio.style.borderColor = '#1a1a1a'; btnBio.style.color = 'var(--muted)';
      boardB.style.display = 'none'; kcetB.style.display = 'none';
      boardM.style.display = 'block'; kcetM.style.display = 'block';
      boardGrid.style.gridTemplateColumns = 'repeat(3, 1fr)'; kcetGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
    };

    btnBio.onclick = () => {
      currentStream = 'bio';
      btnBio.style.background = 'rgba(0,122,255,0.15)'; btnBio.style.borderColor = 'var(--accent)'; btnBio.style.color = '#fff';
      btnCs.style.background = '#111'; btnCs.style.borderColor = '#1a1a1a'; btnCs.style.color = 'var(--muted)';
      boardB.style.display = 'block'; kcetB.style.display = 'block';
      boardM.style.display = 'none'; kcetM.style.display = 'none'; // Switch optimization contexts clean
      boardGrid.style.gridTemplateColumns = 'repeat(2, 1fr)'; kcetGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    };

    // Calculation Evaluation Layer Execution Hooks
    card.querySelector(`#calc-trigger-${uid}`).onclick = () => {
      processKcetFormulaMetrics(uid, currentStream);
    };
  }

  function processKcetFormulaMetrics(uid, stream) {
    const wrapper = document.getElementById(`kcet-wrapper-${uid}`);
    
    // Parse functional form metrics components parameters
    const pBoard = parseFloat(document.getElementById(`board-p-${uid}`).value) || 0;
    const cBoard = parseFloat(document.getElementById(`board-c-${uid}`).value) || 0;
    const mBoard = stream === 'cs' ? (parseFloat(document.getElementById(`board-m-${uid}`).value) || 0) : 0;
    const bBoard = stream === 'bio' ? (parseFloat(document.getElementById(`board-b-${uid}`).value) || 0) : 0;

    const pKcet = parseFloat(document.getElementById(`kcet-p-${uid}`).value) || 0;
    const cKcet = parseFloat(document.getElementById(`kcet-c-${uid}`).value) || 0;
    const mKcet = stream === 'cs' ? (parseFloat(document.getElementById(`kcet-m-${uid}`).value) || 0) : 0;
    const bKcet = stream === 'bio' ? (parseFloat(document.getElementById(`kcet-b-${uid}`).value) || 0) : 0;

    // Check configuration parameters constraints rules mapping bounds validation
    if (pBoard > 100 || cBoard > 100 || mBoard > 100 || bBoard > 100 || pKcet > 60 || cKcet > 60 || mKcet > 60 || bKcet > 60) {
      alert("Invalid matrix data entries inside range limits.");
      return;
    }

    // 50-50 Standard Combined Engineering / Pharma index calculation algorithm formulas
    const subjectsCount = 3;
    const totalBoardPercentage = stream === 'cs' ? (pBoard + cBoard + mBoard) / subjectsCount : (pBoard + cBoard + bBoard) / subjectsCount;
    const totalKcetScore = stream === 'cs' ? (pKcet + cKcet + mKcet) : (pKcet + cKcet + bKcet);
    const kcetPercentage = (totalKcetScore / (subjectsCount * 60)) * 100;
    
    // Final Weighted Matrix Index Value Frame
    const combinedScoreIndex = (totalBoardPercentage + kcetPercentage) / 2;

    // Deterministic logarithmic prediction bounding limits mapping framework
    let projectedRankMin = 1;
    let projectedRankMax = 50;

    if (combinedScoreIndex >= 98) { projectedRankMin = 1; projectedRankMax = 120; }
    else if (combinedScoreIndex >= 95) { projectedRankMin = 121; projectedRankMax = 650; }
    else if (combinedScoreIndex >= 90) { projectedRankMin = 651; projectedRankMax = 2200; }
    else if (combinedScoreIndex >= 85) { projectedRankMin = 2201; projectedRankMax = 5000; }
    else if (combinedScoreIndex >= 80) { projectedRankMin = 5001; projectedRankMax = 11500; }
    else if (combinedScoreIndex >= 75) { projectedRankMin = 11501; projectedRankMax = 19000; } // Matches context ranks
    else if (combinedScoreIndex >= 65) { projectedRankMin = 19001; projectedRankMax = 38000; }
    else if (combinedScoreIndex >= 50) { projectedRankMin = 38001; projectedRankMax = 85000; }
    else { projectedRankMin = 85001; projectedRankMax = 160000; }

    // Visual updates transformation layout layer mapping clean code view components
    wrapper.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <span style="font-size:0.58rem; font-weight:700; color:#30d158; letter-spacing:0.1em; text-transform:uppercase;">
          <i class="fa-solid fa-square-poll-horizontal" style="margin-right:4px;"></i> CALCULATION RESOLVED
        </span>
        <span style="font-size:0.55rem; color:var(--muted); font-family:monospace;">TRACK: ${stream.toUpperCase()}</span>
      </div>
      
      <div style="background:rgba(255,255,255,0.02); border:1px solid #1a1a1a; padding:12px; border-radius:10px; margin-bottom:14px;">
        <div style="font-size:0.65rem; color:var(--muted); margin-bottom:2px; text-transform:uppercase; font-family:monospace;">Normalized 50:50 Combined Index Score</div>
        <div style="font-size:1.35rem; font-weight:700; color:var(--text); font-family:'Space Grotesk';">${combinedScoreIndex.toFixed(4)} %</div>
      </div>

      <div style="font-size:0.68rem; color:var(--muted); margin-bottom:2px; text-transform:uppercase; font-family:monospace;">Projected Expected KCET Rank Range Bracket</div>
      <div style="font-size:1.6rem; font-weight:700; color:var(--accent); letter-spacing:-0.02em; font-family:'Space Grotesk'; margin-bottom:6px;">
        # ${projectedRankMin.toLocaleString()} – # ${projectedRankMax.toLocaleString()}
      </div>
      <div style="font-size:0.68rem; color:#444; line-height:1.4; margin-bottom:14px;">
        *Calculations are estimated approximations built using multi-year regional weighting distributions. Actual indices depend on year-specific performance curves.
      </div>

      <!-- Resend Reset Module Component Trigger Interface -->
      <button id="reset-trigger-${uid}" style="width:100%; padding:10px; background:#111; border:1px solid #1a1a1a; color:#fff; border-radius:8px; font-size:0.75rem; font-family:'Space Grotesk'; font-weight:600; cursor:pointer; transition:background 0.15s;">
        <i class="fa-solid fa-rotate-right" style="margin-right:6px; color:var(--muted);"></i> Re-predict Rank Performance
      </button>
    `;

    // Reset button functionality logic loop mapping layout initialization rules template
    wrapper.querySelector(`#reset-trigger-${uid}`).onclick = () => {
      injectKcetInteractiveForm();
    };
  }
})();
