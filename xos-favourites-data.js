 {
    "anush": {
     userid: "anush",
      favourites: {
        music:  ["Blinding Lights", "Starboy"],
        album:  ["After Hours"],
        movie:  ["Inception"],
        series: ["Breaking Bad"],
        anime:  ["Attack on Titan"]
      }
    },
   "gemini": { userid: "gemini", favourites: {...} }
 }
window.XOS_FAV = {

  _storeKey: 'xos_favourites_store',

  _loadStore() {
    try {
      return JSON.parse(localStorage.getItem(this._storeKey) || '{}');
    } catch { return {}; }
  },

  _saveStore(store) {
    localStorage.setItem(this._storeKey, JSON.stringify(store));
  },

  _emptyFavourites() {
    return { music: [], album: [], movie: [], series: [], anime: [] };
  },

  _ensureUser(store, userid) {
    if (!store[userid]) {
      store[userid] = { userid, favourites: this._emptyFavourites() };
    }
    // guard against older/partial records missing a type
    store[userid].favourites = { ...this._emptyFavourites(), ...store[userid].favourites };
    return store[userid];
  },

  // ── whole-user access ──
  getUser(userid) {
    const store = this._loadStore();
    return store[userid] ? store[userid] : null;
  },

  getAllUsers() {
    return this._loadStore();
  },

  // ── per-type access ──
  get(userid, type) {
    const store = this._loadStore();
    const user = store[userid];
    return user && Array.isArray(user.favourites[type]) ? user.favourites[type] : [];
  },

  set(userid, type, names) {
    const store = this._loadStore();
    const user = this._ensureUser(store, userid);
    user.favourites[type] = names;
    this._saveStore(store);
  },

  add(userid, type, name) {
    name = (name || '').trim();
    if (!name) return false;
    const store = this._loadStore();
    const user = this._ensureUser(store, userid);
    const list = user.favourites[type] || (user.favourites[type] = []);
    if (list.some(n => n.toLowerCase() === name.toLowerCase())) return false;
    list.push(name);
    this._saveStore(store);
    return true;
  },

  remove(userid, type, name) {
    const store = this._loadStore();
    const user = this._ensureUser(store, userid);
    user.favourites[type] = (user.favourites[type] || []).filter(
      n => n.toLowerCase() !== (name || '').toLowerCase()
    );
    this._saveStore(store);
  },

  has(userid, type, name) {
    return this.get(userid, type).some(
      n => n.toLowerCase() === (name || '').trim().toLowerCase()
    );
  },

  // Seed a few default names if this user has no favourites saved yet
  seedDefaults(userid) {
    const store = this._loadStore();
    const user = this._ensureUser(store, userid);
    const isEmpty = Object.values(user.favourites).every(arr => arr.length === 0);
    if (isEmpty) {
      user.favourites = {
        music:  ['Blinding Lights', 'Wait a Minute!', 'Starboy'],
        album:  ['After Hours', 'Starboy'],
        movie:  ['Inception', 'The Dark Knight', 'Interstellar'],
        series: ['Breaking Bad', 'Stranger Things'],
        anime:  ['Attack on Titan', 'Demon Slayer'],
      };
      this._saveStore(store);
    }
  }
};
