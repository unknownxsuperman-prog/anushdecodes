/* ════════════════════════════════════════════════════════════════
   DISHA FAVOURITES INTELLIGENCE  v3.1
   ─────────────────────────────────────────────────────────────
   Trigger: user types   #username <anything, including full sentences>
     ▸ #anush                              → shows ALL favourites alphabetically
     ▸ #anush bl                           → filters to items starting with "bl"
     ▸ #anush Blinding Lights              → exact match result card
     ▸ #anush movies                       → all movies
     ▸ does #anush like xyz movie?         → understood as: category=movie, term="xyz"
     ▸ #anush like xyz music?              → understood as: category=music, term="xyz"
   Filler/question words and category words are stripped out as "signal"
   words — whatever's left over is treated as the actual item name.
   Autocomplete suggestions are ranked Google-style (exact > starts-with > word-start > contains > fuzzy).
   ════════════════════════════════════════════════════════════════ */

window.DISHA_FAV = (function(){
  /* ── CONFIG ── */
  const DEFAULT_USERID  = null;   // no hard‑coded default; uses dynamic resolver
  const CATEGORIES      = ['music','album','movie','series','anime'];
  const CAT_KEYWORDS    = {
    music:['music','songs','song','tracks','track'],
    album:['albums','album'],
    movie:['movies','movie','films','film'],
    series:['series','shows','show','tvshows','tvshow','tv'],
    anime:['anime','animes','manga'],
  };
  /* words that carry INTENT signal but are never part of the item name */
  const FILLER_WORDS = new Set([
    'does','do','did','is','are','was','were','like','likes','liked',
    'have','has','had','know','about','find','search','show','tell','check',
    'whats',"what's",'what','any','some','the','a','an','of','in','on','at','to','for',
    'my','me','i','want','wanna','got','get','favourite','favorite','fav',
    'favourites','favorites','if','you','think','with','and','or'
  ]);

  /* ── CATEGORY META ── */
  const CAT_META = {
    music:  { icon:'fa-solid fa-music',        label:'Track',  color:'#4dd9b0', bg:'rgba(0,200,150,.12)',  border:'rgba(0,200,150,.2)' },
    album:  { icon:'fa-solid fa-compact-disc',  label:'Album',  color:'#4dd9b0', bg:'rgba(0,200,150,.12)',  border:'rgba(0,200,150,.2)' },
    movie:  { icon:'fa-solid fa-film',          label:'Movie',  color:'#ffd866', bg:'rgba(255,200,50,.12)', border:'rgba(255,200,50,.2)' },
    series: { icon:'fa-solid fa-tv',            label:'Series', color:'#66d9ff', bg:'rgba(50,200,255,.12)', border:'rgba(50,200,255,.2)' },
    anime:  { icon:'fa-solid fa-dragon',        label:'Anime',  color:'#ff6b9d', bg:'rgba(255,70,150,.12)', border:'rgba(255,70,150,.2)' },
  };

  /* ── DYNAMIC USER RESOLVER ──
     Builds the mapping live from window.XOS_PROFILES.
     Matches on userId, handle, or displayName.
  */
  function resolveUserId(typed) {
    if (!typed) return null;
    const t = typed.toLowerCase().replace(/[^\w]/g, '');
    const profiles = window.XOS_PROFILES || {};
    for (const [uid, p] of Object.entries(profiles)) {
      if (uid.toLowerCase() === t) return uid;
      if ((p.handle || '').toLowerCase().replace(/[^\w@]/g, '').replace('@x0s', '').replace('@xos', '') === t) return uid;
      if ((p.displayName || '').toLowerCase().replace(/[^\w]/g, '') === t) return uid;
    }
    // fallback: partial match on displayName (e.g. "#anush" matching "Anush Decodes")
    for (const [uid, p] of Object.entries(profiles)) {
      if ((p.displayName || '').toLowerCase().replace(/[^\w]/g, '').startsWith(t)) return uid;
    }
    return null;
  }

  function allTypedUsernames() {
    const profiles = window.XOS_PROFILES || {};
    const set = new Set();
    for (const [uid, p] of Object.entries(profiles)) {
      set.add(uid);
      if (p.handle) set.add(p.handle.replace(/^@/, ''));
      if (p.displayName) set.add(p.displayName);
    }
    return Array.from(set).filter(Boolean);
  }

  /* ════════════════════════════════════════════
     NATURAL-LANGUAGE TOKEN CLASSIFIER
     ════════════════════════════════════════════ */
  function classifyTokens(text){
    const tokens = (text || '').split(/\s+/).filter(Boolean);
    const contentTokens = [];
    let categoryKey = null;
    let fillerCount = 0;
    tokens.forEach(tok => {
      const clean = tok.replace(/^[^\w]+|[^\w]+$/g, '');
      if(!clean) return; // pure punctuation like "?"
      const lc = clean.toLowerCase();
      if(!categoryKey){
        for(const [cat, kws] of Object.entries(CAT_KEYWORDS)){
          if(kws.includes(lc)){ categoryKey = cat; return; }
        }
      } else {
        for(const kws of Object.values(CAT_KEYWORDS)){
          if(kws.includes(lc)) return; // extra category word, ignore
        }
      }
      if(FILLER_WORDS.has(lc)){ fillerCount++; return; }
      contentTokens.push(clean);
    });
    return {
      searchTerm: contentTokens.join(' ').trim(),
      categoryKey,
      fillerCount,
      hasQuestionMark: /\?/.test(text || '')
    };
  }

  /* ════════════════════════════════════════════
     RELEVANCE SCORING  —  Google-suggest style
     ════════════════════════════════════════════ */
  function scoreMatch(name, query){
    if(!query) return 0;
    const n = name.toLowerCase();
    const q = query.toLowerCase();
    if(n === q) return 1000;
    if(n.startsWith(q)) return 900 - (n.length - q.length);
    const words = n.split(/\s+/);
    for(const w of words){
      if(w.startsWith(q)) return 800 - (n.length - q.length);
    }
    const idx = n.indexOf(q);
    if(idx !== -1) return 600 - idx - (n.length - q.length) * 0.5;
    // fuzzy subsequence fallback
    let qi = 0;
    for(let i = 0; i < n.length && qi < q.length; i++){
      if(n[i] === q[qi]) qi++;
    }
    if(qi === q.length) return 300 - (n.length - q.length);
    return -1;
  }

  /* ════════════════════════════════════════════
     AUTOCOMPLETE  —  live dropdown as user types
     ════════════════════════════════════════════ */
  let _dropdownEl = null;
  let _inputEl    = null;
  let _onPick     = null;

  function bindAutocomplete(container, input, onPick){
    _inputEl = input;
    _onPick  = onPick;
    if(!_dropdownEl){
      _dropdownEl = document.createElement('div');
      _dropdownEl.className = 'disha-ac-dropdown';
      _dropdownEl.id = 'disha-ac-dropdown';
      container.style.position = 'relative';
      container.appendChild(_dropdownEl);
    }
    input.addEventListener('input', _onInputChange);
    input.addEventListener('blur', ()=> setTimeout(hideDropdown, 180));
  }

  function _onInputChange(){
    const val = _inputEl.value;
    const hashIdx = val.lastIndexOf('#');
    if(hashIdx === -1){ hideDropdown(); return; }
    const afterHash = val.substring(hashIdx + 1);
    const spaceIdx = afterHash.search(/\s/);
    const typedUserRaw = spaceIdx === -1 ? afterHash : afterHash.substring(0, spaceIdx);
    const typedUser = typedUserRaw.toLowerCase().replace(/[^\w]/g,'');
    if(!typedUser){ showUserSuggestions(''); return; }
    const matchedUserId = resolveUserId(typedUser);
    if(!matchedUserId){ showUserSuggestions(typedUser); return; }
    const rest = spaceIdx === -1 ? '' : afterHash.substring(spaceIdx + 1);
    showFavSuggestions(matchedUserId, typedUserRaw, rest, hashIdx);
  }

  function showUserSuggestions(partial){
    const users = allTypedUsernames();
    const filtered = partial
      ? users.filter(u => u.toLowerCase().startsWith(partial.toLowerCase())).sort()
      : users.sort();
    if(!filtered.length){ hideDropdown(); return; }
    _dropdownEl.innerHTML = filtered.map(u =>
      `<div class="disha-ac-item disha-ac-user" data-val="#${u} ">
        <i class="fa-solid fa-at" style="color:var(--accent);font-size:.72rem;"></i>
        <span>${esc(u)}</span>
      </div>`
    ).join('');
    _dropdownEl.classList.add('open');
    _attachItemClicks();
  }

  function showFavSuggestions(userId, displayUser, rawAfterUser, hashIdx){
    try{ window.XOS_FAV.seedDefaults(userId); }catch{}
    const { searchTerm, categoryKey } = classifyTokens(rawAfterUser);
    let pool = [];
    for(const cat of CATEGORIES){
      const items = window.XOS_FAV.get(userId, cat) || [];
      items.forEach(name => pool.push({ name, category: cat }));
    }
    if(categoryKey){
      pool = pool.filter(p => p.category === categoryKey);
    }
    if(searchTerm){
      pool = pool
        .map(p => ({ ...p, _score: scoreMatch(p.name, searchTerm) }))
        .filter(p => p._score > -1)
        .sort((a,b) => b._score - a._score);
    } else {
      pool.sort((a,b) => a.name.localeCompare(b.name));
    }
    if(!pool.length && searchTerm){
      _dropdownEl.innerHTML = `
        <div class="disha-ac-empty">
          <span style="opacity:.35;">No matches for "${esc(searchTerm)}"</span>
        </div>`;
      _dropdownEl.classList.add('open');
      return;
    }
    if(!pool.length){ hideDropdown(); return; }
    let html = '';
    if(!searchTerm){
      html += `<div class="disha-ac-cats">`;
      for(const cat of CATEGORIES){
        const m = CAT_META[cat];
        const count = (window.XOS_FAV.get(userId, cat)||[]).length;
        if(!count) continue;
        html += `<div class="disha-ac-cat-pill" data-val="#${displayUser} ${cat}" style="background:${m.bg};border-color:${m.border};color:${m.color};">
          <i class="${m.icon}" style="font-size:.6rem;"></i> ${m.label}s <b>${count}</b>
        </div>`;
      }
      html += `</div>`;
    }
    const shown = pool.slice(0, 12);
    html += shown.map(p => {
      const m = CAT_META[p.category];
      return `<div class="disha-ac-item" data-val="#${displayUser} ${p.name}">
        <span class="disha-ac-dot" style="background:${m.color};"></span>
        <span class="disha-ac-name">${esc(p.name)}</span>
        <span class="disha-ac-tag" style="color:${m.color};">${m.label}</span>
      </div>`;
    }).join('');
    if(pool.length > 12){
      html += `<div class="disha-ac-more">${pool.length - 12} more — keep typing to filter</div>`;
    }
    _dropdownEl.innerHTML = html;
    _dropdownEl.classList.add('open');
    _attachItemClicks();
  }

  function _attachItemClicks(){
    _dropdownEl.querySelectorAll('[data-val]').forEach(el => {
      el.addEventListener('mousedown', e => {
        e.preventDefault();
        const v = el.dataset.val;
        _inputEl.value = v;
        _inputEl.focus();
        hideDropdown();
        _inputEl.dispatchEvent(new Event('input'));
        if(_onPick && !v.endsWith(' ') && v.split(/\s+/).length > 1){
          // let user press enter
        } else {
          setTimeout(()=> _onInputChange(), 50);
        }
      });
    });
  }

  function hideDropdown(){
    if(_dropdownEl) _dropdownEl.classList.remove('open');
  }

  /* ════════════════════════════════════════════
     QUERY PARSING  —  #user <anything>
     ════════════════════════════════════════════ */
  function parseQuery(raw){
    const q = raw.trim();
    const hashIdx = q.indexOf('#');
    if(hashIdx === -1) return null;
    const afterHash = q.substring(hashIdx + 1).trim();
    if(!afterHash) return null;
    const spaceIdx = afterHash.search(/\s/);
    const typedUser = (spaceIdx === -1 ? afterHash : afterHash.substring(0, spaceIdx))
      .toLowerCase().replace(/[^\w]/g,'');
    const userId = resolveUserId(typedUser);
    if(!userId) return null;
    const rest = spaceIdx === -1 ? '' : afterHash.substring(spaceIdx + 1).trim();

    if(!rest){
      return { userId, displayUser: typedUser, type: null, searchTerm: null, listAll: true, listEverything: true, intentQuestion: false };
    }

    const { searchTerm, categoryKey, fillerCount, hasQuestionMark } = classifyTokens(rest);
    const signalScore = fillerCount + (categoryKey ? 1 : 0) + (hasQuestionMark ? 1 : 0);
    const intentQuestion = signalScore >= 2 && !!searchTerm;

    if(categoryKey && !searchTerm){
      return { userId, displayUser: typedUser, type: categoryKey, searchTerm: null, listAll: true, intentQuestion: false };
    }
    if(searchTerm){
      return { userId, displayUser: typedUser, type: categoryKey, searchTerm, listAll: false, intentQuestion };
    }
    return { userId, displayUser: typedUser, type: null, searchTerm: null, listAll: true, listEverything: true, intentQuestion: false };
  }

  /* ════════════════════════════════════════════
     FAVOURITES SEARCH
     ════════════════════════════════════════════ */
  function searchFavourites(userId, searchTerm, categoryFilter){
    if(!window.XOS_FAV) return [];
    const collect = (cats) => {
      const out = [];
      for(const cat of cats){
        const items = window.XOS_FAV.get(userId, cat) || [];
        for(const item of items){
          const score = scoreMatch(item, searchTerm);
          if(score > -1) out.push({ name: item, category: cat, _score: score });
        }
      }
      return out;
    };
    let results = collect(categoryFilter ? [categoryFilter] : CATEGORIES);
    if(!results.length && categoryFilter){
      results = collect(CATEGORIES.filter(c => c !== categoryFilter));
    }
    results.sort((a,b) => b._score - a._score);
    return results;
  }

  function listCategory(userId, category){
    if(!window.XOS_FAV) return [];
    return (window.XOS_FAV.get(userId, category)||[]).map(name => ({ name, category }));
  }

  function listAll(userId){
    if(!window.XOS_FAV) return [];
    const all = [];
    for(const cat of CATEGORIES){
      (window.XOS_FAV.get(userId, cat)||[]).forEach(n => all.push({ name:n, category:cat }));
    }
    return all.sort((a,b) => a.name.localeCompare(b.name));
  }

  /* ════════════════════════════════════════════
     API LOOKUPS (iTunes / Jikan / Kitsu / TVMaze)
     ════════════════════════════════════════════ */
  const LOOKUP_CACHE = {};
  async function lookupItem(name, category){
    const key = `${category}_${name.toLowerCase()}`;
    if(LOOKUP_CACHE[key]) return LOOKUP_CACHE[key];
    try{
      const cached = localStorage.getItem(`xos_fav_cache_${category}_${name.toLowerCase()}`);
      if(cached){
        const { info, t } = JSON.parse(cached);
        if(Date.now() - t < 7*24*60*60*1000){ LOOKUP_CACHE[key]=info; return info; }
      }
    }catch{}
    let info = null;
    try{
      if(category==='music')   info = await _lookupMusic(name);
      else if(category==='album')  info = await _lookupAlbum(name);
      else if(category==='anime')  info = await _lookupAnime(name);
      else if(category==='series') info = await _lookupSeries(name);
      else if(category==='movie')  info = await _lookupMovie(name);
    }catch(e){ console.warn('[Disha] lookup fail', category, name, e); }
    if(!info) info = { title:name, subtitle:'', artwork:'', year:'', preview:'' };
    LOOKUP_CACHE[key] = info;
    try{ localStorage.setItem(`xos_fav_cache_${category}_${name.toLowerCase()}`, JSON.stringify({info,t:Date.now()})); }catch{}
    return info;
  }

  async function _lookupMusic(n){
    const r=await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(n)}&entity=song&limit=1&media=music`);
    const d=await r.json(); const i=(d.results||[])[0]; if(!i) return null;
    return { title:i.trackName||n, subtitle:i.artistName||'', artwork:(i.artworkUrl100||'').replace('100x100','400x400'),
      year:i.releaseDate?i.releaseDate.substring(0,4):'', genre:i.primaryGenreName||'', preview:i.previewUrl||'' };
  }

  async function _lookupAlbum(n){
    const r=await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(n)}&entity=album&limit=1&media=music`);
    const d=await r.json(); const i=(d.results||[])[0]; if(!i) return null;
    return { title:i.collectionName||n, subtitle:i.artistName||'', artwork:(i.artworkUrl100||'').replace('100x100','400x400'),
      year:i.releaseDate?i.releaseDate.substring(0,4):'', trackCount:i.trackCount||0, preview:'' };
  }

  async function _lookupAnime(n){
    try{
      const r=await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(n)}&limit=1`);
      if(!r.ok) throw 0; const d=await r.json(); const i=(d.data||[])[0];
      if(i) return { title:i.title_english||i.title||n, subtitle:(i.synopsis||'').substring(0,80),
        artwork:i.images?.jpg?.large_image_url||i.images?.jpg?.image_url||'',
        year:i.year||(i.aired?.from||'').substring(0,4), rating:i.score?i.score.toFixed(1):'', preview:'' };
    }catch{}
    try{
      const r=await fetch(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(n)}&page[limit]=1`,{headers:{'Accept':'application/vnd.api+json'}});
      const d=await r.json(); const i=(d.data||[])[0]; if(!i) return null; const a=i.attributes;
      return { title:a.titles?.en||a.titles?.en_jp||a.canonicalTitle||n, subtitle:(a.synopsis||'').substring(0,80),
        artwork:a.posterImage?.medium||a.posterImage?.small||'',
        year:a.startDate?a.startDate.substring(0,4):'', rating:a.averageRating?(parseFloat(a.averageRating)/10).toFixed(1):'', preview:'' };
    }catch{} return null;
  }

  async function _lookupSeries(n){
    const r=await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(n)}`);
    const d=await r.json(); const f=(d||[])[0]; if(!f) return null; const s=f.show;
    return { title:s.name||n, subtitle:(s.genres||[]).slice(0,3).join(', '),
      artwork:s.image?.medium||s.image?.original||'',
      year:s.premiered?s.premiered.substring(0,4):'', rating:s.rating?.average?s.rating.average.toFixed(1):'', preview:'' };
  }

  async function _lookupMovie(n){
    const [a,b]=await Promise.allSettled([
      fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(n)}&media=movie&entity=movie&limit=1&country=IN`).then(r=>r.json()),
      fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(n)}&media=movie&entity=movie&limit=1`).then(r=>r.json())
    ]);
    const i=(a.status==='fulfilled'?(a.value.results||[])[0]:null)||(b.status==='fulfilled'?(b.value.results||[])[0]:null);
    if(!i) return null;
    return { title:i.trackName||n, subtitle:i.primaryGenreName||'', artwork:(i.artworkUrl100||'').replace('100x100','600x600'),
      year:i.releaseDate?i.releaseDate.substring(0,4):'', rating:i.contentAdvisoryRating||'', preview:i.previewUrl||'' };
  }

  /* ════════════════════════════════════════════
     HTML RENDERERS
     ════════════════════════════════════════════ */
  function esc(s){ const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }

  function getSearchUrl(name, cat){
    return (cat==='music'||cat==='album')
      ? `https://www.youtube.com/results?search_query=${encodeURIComponent(name)}`
      : `https://www.google.com/search?q=${encodeURIComponent(name+' '+(cat||''))}`;
  }

  function getSearchIcon(cat){ return (cat==='music'||cat==='album') ? 'fa-brands fa-youtube' : 'fa-brands fa-google'; }
  function getSearchLabel(cat){ return (cat==='music'||cat==='album') ? 'Search on YouTube' : 'Search on Google'; }

  function buildFoundCard(item, info, category){
    const m = CAT_META[category]||CAT_META.music;
    const hasPreview = info.preview && (category==='music'||category==='movie');
    const isPoster = (category==='movie'||category==='series'||category==='anime');
    return `
    <div class="es-bubble-sys" style="animation:msgIn .28s var(--ease);">
      <div class="es-bubble-sys-text" style="margin-bottom:8px;">
        ✨ Yes! Found in <b style="color:${m.color}">${m.label}s</b> favourites
      </div>
      <div class="disha-fav-card">
        <div style="display:flex;gap:12px;padding:14px;align-items:center;">
          <div class="disha-fav-art" style="
            width:${isPoster?'56px':'60px'};height:${isPoster?'78px':'60px'};
            border-radius:12px;overflow:hidden;flex-shrink:0;position:relative;
            background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.07);">
            <img src="${esc(info.artwork)}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;"
              onerror="this.src='https://placehold.co/120x120/141414/666?text=${category==='music'?'♪':'🎬'}'">
            ${hasPreview?`<div class="disha-fav-play-overlay"
              data-preview-url="${esc(info.preview)}" data-title="${esc(info.title||item)}"
              onclick="DISHA_FAV.playPreview(this)">
              <div style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.9);
                display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.4);transition:transform .15s;">
                <i class="fa-solid fa-play" style="color:#000;font-size:.6rem;margin-left:2px;"></i>
              </div></div>`:''}
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:.86rem;font-weight:700;color:#fff;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              ${esc(info.title||item)}</div>
            ${info.subtitle?`<div style="font-size:.68rem;color:rgba(255,255,255,.45);margin-bottom:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(info.subtitle)}</div>`:''}
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
              <span class="disha-fav-pill" style="background:${m.bg};border-color:${m.border};color:${m.color};">${m.label}</span>
              ${info.year?`<span style="font-size:.58rem;color:rgba(255,255,255,.28);font-weight:600;">${esc(info.year)}</span>`:''}
              ${info.rating?`<span style="font-size:.58rem;color:rgba(255,255,255,.35);">⭐ ${esc(info.rating)}</span>`:''}
            </div>
          </div>
        </div>
        <div class="disha-fav-search-footer"
          onclick="DISHA_FAV.webSearch('${esc(info.title||item).replace(/'/g,"\\'")}','${category}')">
          <i class="${getSearchIcon(category)}" style="font-size:.82rem;"></i>
          <span>${getSearchLabel(category)}</span>
          <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:.58rem;opacity:.5;"></i>
        </div>
      </div>
    </div>`;
  }

  function buildNotFoundCard(term, displayUser){
    return `
    <div class="es-bubble-sys" style="animation:msgIn .28s var(--ease);">
      <div class="disha-fav-card" style="text-align:center;padding:16px;">
        <div style="font-size:1.6rem;margin-bottom:8px;opacity:.4;">🤔</div>
        <div style="font-size:.82rem;font-weight:600;color:rgba(255,255,255,.6);margin-bottom:4px;">Not in favourites</div>
        <div style="font-size:.7rem;color:rgba(255,255,255,.3);line-height:1.5;">
          <b style="color:rgba(255,255,255,.5);">"${esc(term)}"</b> isn't in ${esc(displayUser)}'s favourites list
        </div>
      </div>
    </div>`;
  }

  function buildListCards(items, infos, displayUser, categoryLabel){
    const groupedByCat = !categoryLabel;
    let html = `<div class="es-bubble-sys" style="animation:msgIn .28s var(--ease);">
      <div class="es-bubble-sys-text" style="margin-bottom:8px;">
        ✨ ${esc(displayUser)}'s favourite${categoryLabel ? ` <b style="color:${(CAT_META[categoryLabel]||{}).color||'#fff'}">${(CAT_META[categoryLabel]||{}).label||''}s</b>` : 's'} (${items.length})
      </div>`;
    items.forEach((item,idx) => {
      const info = infos[idx]||{title:item.name,subtitle:'',artwork:'',preview:''};
      const cat = item.category;
      const m = CAT_META[cat]||CAT_META.music;
      const hasPreview = info.preview && (cat==='music'||cat==='movie');
      const isPoster = (cat==='movie'||cat==='series'||cat==='anime');
      html += `
      <div class="disha-fav-card" style="margin-bottom:8px;">
        <div style="display:flex;gap:10px;padding:10px 12px;align-items:center;">
          <div style="width:${isPoster?'40px':'44px'};height:${isPoster?'56px':'44px'};
            border-radius:10px;overflow:hidden;flex-shrink:0;position:relative;
            background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.06);">
            <img src="${esc(info.artwork)}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;"
              onerror="this.src='https://placehold.co/88x88/141414/666?text=${cat==='music'?'♪':'🎬'}'">
            ${hasPreview?`<div data-preview-url="${esc(info.preview)}" data-title="${esc(info.title||item.name)}"
              onclick="DISHA_FAV.playPreview(this)"
              style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
                background:rgba(0,0,0,.35);cursor:pointer;">
              <i class="fa-solid fa-play" style="color:#fff;font-size:.5rem;filter:drop-shadow(0 1px 3px rgba(0,0,0,.5));"></i>
            </div>`:''}
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:.78rem;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(info.title||item.name)}</div>
            ${info.subtitle?`<div style="font-size:.6rem;color:rgba(255,255,255,.35);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(info.subtitle)}</div>`:''}
            ${groupedByCat?`<span class="disha-fav-pill" style="background:${m.bg};border-color:${m.border};color:${m.color};margin-top:4px;">${m.label}</span>`:''}
          </div>
          <div onclick="DISHA_FAV.webSearch('${esc(info.title||item.name).replace(/'/g,"\\'")}','${cat}')"
            style="width:30px;height:30px;border-radius:8px;background:rgba(255,255,255,.06);
              border:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;
              cursor:pointer;flex-shrink:0;color:rgba(255,255,255,.4);font-size:.7rem;">
            <i class="${getSearchIcon(cat)}"></i>
          </div>
        </div>
      </div>`;
    });
    html += `</div>`;
    return html;
  }

  function buildLoading(){
    return `<div class="es-bubble-sys disha-fav-loading" style="animation:msgIn .28s var(--ease);">
      <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:18px;
        padding:16px 20px;display:flex;align-items:center;gap:12px;">
        <div class="disha-fav-spinner"></div>
        <span style="font-size:.78rem;color:rgba(255,255,255,.4);">Searching favourites…</span>
      </div></div>`;
  }

  /* ════════════════════════════════════════════
     AUDIO PREVIEW
     ════════════════════════════════════════════ */
  let _audio = null, _playBtn = null;

  function playPreview(el){
    const url = el.dataset.previewUrl;
    if(!url) return;
    if(_audio && _audio._url===url && !_audio.paused){
      _audio.pause(); _setPlayIcon(_playBtn,'play'); _playBtn=null; return;
    }
    if(_audio){ _audio.pause(); _setPlayIcon(_playBtn,'play'); }
    _audio = new Audio(url); _audio._url=url; _playBtn=el;
    _setPlayIcon(el,'pause');
    _audio.play().catch(()=>{});
    _audio.onended = ()=>{ _setPlayIcon(el,'play'); _playBtn=null; };
    _audio.onerror = ()=>{ _setPlayIcon(el,'play'); _playBtn=null; };
  }

  function _setPlayIcon(el,state){
    if(!el) return; const i=el.querySelector('i'); if(i) i.className=`fa-solid fa-${state}`;
  }

  /* ════════════════════════════════════════════
     WEB SEARCH
     ════════════════════════════════════════════ */
  function webSearch(name, cat){
    window.open(getSearchUrl(name, cat), '_blank');
  }

  /* ════════════════════════════════════════════
     MAIN HANDLER  —  called on message submit
     ════════════════════════════════════════════ */
  async function handleQuery(rawQuery, msgContainer){
    const parsed = parseQuery(rawQuery);
    if(!parsed) return false;
    hideDropdown();
    const { userId, displayUser } = parsed;
    try{ window.XOS_FAV.seedDefaults(userId); }catch{}
    const loader = document.createElement('div');
    loader.innerHTML = buildLoading();
    msgContainer.appendChild(loader.firstElementChild);
    msgContainer.scrollTop = msgContainer.scrollHeight;
    try{
      let items = [];
      if(parsed.listEverything){
        items = listAll(userId);
      } else if(parsed.listAll && parsed.type){
        items = listCategory(userId, parsed.type);
      } else if(parsed.searchTerm){
        items = searchFavourites(userId, parsed.searchTerm, parsed.type);
      }
      const ld = msgContainer.querySelector('.disha-fav-loading'); if(ld) ld.remove();
      if(parsed.searchTerm && items.length === 0){
        const d = document.createElement('div');
        d.innerHTML = buildNotFoundCard(parsed.searchTerm, displayUser);
        msgContainer.appendChild(d.firstElementChild);
      } else if(parsed.searchTerm && (parsed.intentQuestion || items.length <= 2)){
        const topItems = parsed.intentQuestion ? items.slice(0, 1) : items;
        for(const it of topItems){
          const info = await lookupItem(it.name, it.category);
          const d = document.createElement('div');
          d.innerHTML = buildFoundCard(it.name, info, it.category);
          msgContainer.appendChild(d.firstElementChild);
        }
      } else if(items.length){
        const infos = await Promise.all(items.map(i=>lookupItem(i.name, i.category)));
        const d = document.createElement('div');
        d.innerHTML = buildListCards(items, infos, displayUser, parsed.type||null);
        msgContainer.appendChild(d.firstElementChild);
      } else {
        const d = document.createElement('div');
        d.innerHTML = `<div class="es-bubble-sys" style="animation:msgIn .28s var(--ease);">
          <div class="disha-fav-card" style="text-align:center;padding:16px;">
            <div style="font-size:1.4rem;margin-bottom:6px;opacity:.35;">📭</div>
            <div style="font-size:.8rem;color:rgba(255,255,255,.5);">No favourites found for ${esc(displayUser)}</div>
          </div></div>`;
        msgContainer.appendChild(d.firstElementChild);
      }
    }catch(err){
      console.error('[Disha FAV]', err);
      const ld = msgContainer.querySelector('.disha-fav-loading'); if(ld) ld.remove();
      const d = document.createElement('div');
      d.innerHTML = `<div class="es-bubble-sys" style="animation:msgIn .28s var(--ease);"><div style="font-size:.78rem;color:rgba(255,255,255,.35);padding:12px;">Something went wrong searching favourites.</div></div>`;
      msgContainer.appendChild(d.firstElementChild);
    }
    msgContainer.scrollTop = msgContainer.scrollHeight;
    return true;
  }

  /* ════════════════════════════════════════════
     INJECT STYLES
     ════════════════════════════════════════════ */
  (function(){
    if(document.getElementById('disha-fav-css')) return;
    const s = document.createElement('style');
    s.id = 'disha-fav-css';
    s.textContent = `
      @keyframes dishaFavSpin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      @keyframes acSlideUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
      .disha-fav-card{
        background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);
        border-radius:20px;overflow:hidden;cursor:default;
      }
      .disha-fav-pill{
        display:inline-block;padding:2px 8px;border-radius:99px;font-size:.56rem;font-weight:700;
        border:1px solid;text-transform:uppercase;letter-spacing:.06em;
      }
      .disha-fav-search-footer{
        display:flex;align-items:center;justify-content:center;gap:8px;
        padding:10px 14px;border-top:1px solid rgba(255,255,255,.06);
        cursor:pointer;font-size:.72rem;font-weight:600;color:rgba(255,255,255,.45);
        transition:background .15s;
      }
      .disha-fav-search-footer:active{background:rgba(255,255,255,.06);}
      .disha-fav-play-overlay{
        position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
        background:rgba(0,0,0,.35);cursor:pointer;transition:background .15s;
      }
      .disha-fav-play-overlay:active{background:rgba(0,0,0,.5);}
      .disha-fav-spinner{
        width:20px;height:20px;border:2px solid rgba(255,255,255,.1);
        border-top-color:rgba(255,255,255,.5);border-radius:50%;
        animation:dishaFavSpin .6s linear infinite;flex-shrink:0;
      }
      .disha-ac-dropdown{
        position:absolute;bottom:100%;left:0;right:0;
        max-height:280px;overflow-y:auto;overflow-x:hidden;
        background:rgba(12,12,14,.96);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
        border:1px solid rgba(255,255,255,.1);
        border-radius:18px 18px 0 0;
        box-shadow:0 -8px 32px rgba(0,0,0,.6);
        display:none;z-index:500;
        scrollbar-width:none;
        padding:6px 0;
        animation:acSlideUp .2s var(--ease);
      }
      .disha-ac-dropdown::-webkit-scrollbar{display:none;}
      .disha-ac-dropdown.open{display:block;}
      .disha-ac-item{
        display:flex;align-items:center;gap:10px;
        padding:10px 16px;cursor:pointer;
        transition:background .12s;
        font-size:.8rem;font-weight:500;color:rgba(255,255,255,.8);
      }
      .disha-ac-item:active{background:rgba(255,255,255,.06);}
      .disha-ac-user{font-weight:600;color:var(--accent);}
      .disha-ac-dot{
        width:6px;height:6px;border-radius:50%;flex-shrink:0;
      }
      .disha-ac-name{
        flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
      }
      .disha-ac-tag{
        font-size:.56rem;font-weight:700;text-transform:uppercase;
        letter-spacing:.06em;flex-shrink:0;opacity:.7;
      }
      .disha-ac-cats{
        display:flex;gap:6px;padding:8px 14px 6px;overflow-x:auto;
        scrollbar-width:none;flex-wrap:nowrap;
      }
      .disha-ac-cats::-webkit-scrollbar{display:none;}
      .disha-ac-cat-pill{
        display:flex;align-items:center;gap:5px;
        padding:5px 10px;border-radius:99px;
        font-size:.62rem;font-weight:700;
        border:1px solid;white-space:nowrap;
        cursor:pointer;flex-shrink:0;
        transition:background .15s;
      }
      .disha-ac-cat-pill:active{filter:brightness(1.2);}
      .disha-ac-cat-pill b{opacity:.5;margin-left:2px;}
      .disha-ac-empty{
        padding:14px 16px;font-size:.72rem;text-align:center;
        color:rgba(255,255,255,.3);
      }
      .disha-ac-more{
        padding:8px 16px;font-size:.62rem;text-align:center;
        color:rgba(255,255,255,.2);
      }
    `;
    document.head.appendChild(s);
  })();

  /* ── PUBLIC API ── */
  return {
    handleQuery,
    playPreview,
    webSearch,
    bindAutocomplete,
    hideDropdown,
    parseQuery,
    searchFavourites,
    scoreMatch,
    classifyTokens,
    // Expose resolver for debugging (optional)
    resolveUserId,
    allTypedUsernames
  };
})();
