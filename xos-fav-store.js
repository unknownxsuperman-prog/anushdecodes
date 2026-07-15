/* ════════════════════════════════════════════════════════════════
   XOS_FAV  —  favourites data store
   ─────────────────────────────────────────────────────────────
   Required by disha-favourites-intelligence.js. Stores each user's
   favourites (music / album / movie / series / anime) in
   localStorage as flat arrays of names, and auto-seeds a starter
   set the first time a user is touched so Disha has something to
   answer with immediately.
   ════════════════════════════════════════════════════════════════ */
window.XOS_FAV = (function () {
  const CATEGORIES = ['music', 'album', 'movie', 'series', 'anime'];
  const STORE_KEY = (userId) => `xos_fav_${userId}`;

  // Starter favourites — edit these to match what you actually want
  // pre-loaded per user. Add more userIds here as needed.
  const DEFAULTS = {
    anush: {
      music:  ['Blinding Lights', 'Levitating', 'Die For You'],
      album:  ['After Hours', 'Future Nostalgia'],
      movie:  ['Inception', 'Interstellar', 'The Dark Knight'],
      series: ['Breaking Bad', 'Dark'],
      anime:  ['Attack on Titan', 'Death Note']
    }
  };

  function _load(userId) {
    try {
      const raw = localStorage.getItem(STORE_KEY(userId));
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }

  function _save(userId, data) {
    try { localStorage.setItem(STORE_KEY(userId), JSON.stringify(data)); } catch {}
  }

  /** Ensures a user has a favourites object in storage. Call this
   *  before reading — disha-favourites-intelligence.js already does. */
  function seedDefaults(userId) {
    const existing = _load(userId);
    if (existing) return existing;
    const seed = {};
    CATEGORIES.forEach(cat => { seed[cat] = (DEFAULTS[userId] && DEFAULTS[userId][cat]) || []; });
    _save(userId, seed);
    return seed;
  }

  /** Returns the array of favourite names for a user + category. */
  function get(userId, category) {
    const data = _load(userId) || seedDefaults(userId);
    return data[category] || [];
  }

  /** Adds a favourite name under a category (no duplicates). */
  function add(userId, category, name) {
    const data = _load(userId) || seedDefaults(userId);
    if (!data[category]) data[category] = [];
    if (!data[category].some(n => n.toLowerCase() === name.toLowerCase())) {
      data[category].push(name);
      _save(userId, data);
    }
    return data[category];
  }

  /** Removes a favourite name from a category. */
  function remove(userId, category, name) {
    const data = _load(userId) || seedDefaults(userId);
    if (data[category]) {
      data[category] = data[category].filter(n => n.toLowerCase() !== name.toLowerCase());
      _save(userId, data);
    }
    return data[category] || [];
  }

  return { seedDefaults, get, add, remove, CATEGORIES };
})();
