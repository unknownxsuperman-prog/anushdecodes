/**
 * xos-favourites-data.js
 * Stores each user's favourites under their userid in localStorage
 * Structure: xos_fav_{userid}_{key} = JSON array
 */

window.XOS_FAV = {

  _key(userid, type) {
    return `xos_fav_${userid}_${type}`;
  },

  get(userid, type) {
    try {
      const raw = localStorage.getItem(this._key(userid, type));
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },

  set(userid, type, data) {
    localStorage.setItem(this._key(userid, type), JSON.stringify(data));
  },

  add(userid, type, item) {
    const data = this.get(userid, type);
    if (data.find(x => x.id === item.id)) return false; // already exists
    data.push(item);
    this.set(userid, type, data);
    return true;
  },

  remove(userid, type, id) {
    const data = this.get(userid, type).filter(x => x.id !== id);
    this.set(userid, type, data);
  },

  has(userid, type, id) {
    return this.get(userid, type).some(x => x.id === id);
  },

  // Get all favourites for a user (for sharing/export)
  getAll(userid) {
    return {
      userid,
      tracks:  this.get(userid, 'tracks'),
      albums:  this.get(userid, 'albums'),
      movies:  this.get(userid, 'movies'),
      series:  this.get(userid, 'series'),
      anime:   this.get(userid, 'anime'),
    };
  },

  // Seed default data if user has nothing saved yet
  seedDefaults(userid) {
    const DEFAULTS = {
      tracks: [
        { id:'t_def1', title:'Blinding Lights', artist:'The Weeknd', artwork:'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/8b/4f/24/8b4f2433-8a8d-9b39-d50e-3b8b7a7465e4/20UMGIM82421.rgb.jpg/400x400bb.jpg', stream:'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/a4/27/97/a4279729-2339-2e9f-f547-7e527fbbd8e2/mzaf_7223093637471044405.plus.aac.ep.m4a', year:'2020', genre:'Pop' },
        { id:'t_def2', title:'Wait a Minute!', artist:'Willow', artwork:'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/e5/07/8e/e5078e3b-77fe-1c78-3cb9-d39b6cf8b0f4/22UMGIM77352.rgb.jpg/400x400bb.jpg', stream:'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/5e/3c/52/5e3c526f-72e9-63e0-4a16-1cf3a94e7c38/mzaf_5923832917512396829.plus.aac.ep.m4a', year:'2021', genre:'Alt' },
        { id:'t_def3', title:'Starboy', artist:'The Weeknd ft. Daft Punk', artwork:'https://is1-ssl.mzstatic.com/image/thumb/Music111/v4/4c/bd/0a/4cbd0a3d-e56f-f5a3-7bd7-9ab1e9bfca7e/00602557598438.rgb.jpg/400x400bb.jpg', stream:'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/89/ab/8d/89ab8d0d-8fb5-cb14-b1c7-fdab0c2d1ddd/mzaf_4478413399508591521.plus.aac.ep.m4a', year:'2016', genre:'R&B' },
      ],
      albums: [
        { id:'a_def1', title:'After Hours', artist:'The Weeknd', artwork:'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/8b/4f/24/8b4f2433-8a8d-9b39-d50e-3b8b7a7465e4/20UMGIM82421.rgb.jpg/400x400bb.jpg', year:'2020', trackCount:14 },
        { id:'a_def2', title:'Starboy', artist:'The Weeknd', artwork:'https://is1-ssl.mzstatic.com/image/thumb/Music111/v4/4c/bd/0a/4cbd0a3d-e56f-f5a3-7bd7-9ab1e9bfca7e/00602557598438.rgb.jpg/400x400bb.jpg', year:'2016', trackCount:18 },
      ],
      movies: [
        { id:'mv_def1', title:'Inception', subtitle:'Christopher Nolan', artwork:'https://image.tmdb.org/t/p/w342/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', year:'2010', rating:'8.8', type:'movie' },
        { id:'mv_def2', title:'The Dark Knight', subtitle:'Christopher Nolan', artwork:'https://image.tmdb.org/t/p/w342/qJ2tW6WMUDux911r6m7haRef0WH.jpg', year:'2008', rating:'9.0', type:'movie' },
        { id:'mv_def3', title:'Interstellar', subtitle:'Christopher Nolan', artwork:'https://image.tmdb.org/t/p/w342/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', year:'2014', rating:'8.6', type:'movie' },
      ],
      series: [
        { id:'sv_def1', title:'Breaking Bad', subtitle:'Vince Gilligan', artwork:'https://image.tmdb.org/t/p/w342/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', year:'2008', rating:'9.5', type:'series' },
        { id:'sv_def2', title:'Stranger Things', subtitle:'The Duffer Brothers', artwork:'https://image.tmdb.org/t/p/w342/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', year:'2016', rating:'8.7', type:'series' },
      ],
      anime: [
        { id:'an_def1', title:'Attack on Titan', subtitle:'Hajime Isayama', artwork:'https://image.tmdb.org/t/p/w342/hB7H0j2LhVdE6o7K6o5A5v5L5Z5.jpg', year:'2013', rating:'9.0', type:'anime' },
        { id:'an_def2', title:'Demon Slayer', subtitle:'Koyoharu Gotouge', artwork:'https://image.tmdb.org/t/p/w342/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg', year:'2019', rating:'8.7', type:'anime' },
      ],
    };
    Object.entries(DEFAULTS).forEach(([type, items]) => {
      if (!this.get(userid, type).length) this.set(userid, type, items);
    });
  }
};
