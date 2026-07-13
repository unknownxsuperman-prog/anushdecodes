/**
 * xos-favourites-data.js
 * Per‑user favourite storage for x0s.
 * Each user has separate lists: tracks, albums, movies, series, anime.
 * Data is persisted in localStorage under key 'xos_fav_data'.
 */
window.XOS_FAV = (function() {

    const STORAGE_KEY = 'xos_fav_data';

    // Default seed data for new users
    const DEFAULT_DATA = {
        tracks: [
            { id: 't1', title: 'Blinding Lights', artist: 'The Weeknd', artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/8b/4f/24/8b4f2433-8a8d-9b39-d50e-3b8b7a7465e4/20UMGIM82421.rgb.jpg/400x400bb.jpg', stream: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/a4/27/97/a4279729-2339-2e9f-f547-7e527fbbd8e2/mzaf_7223093637471044405.plus.aac.ep.m4a', year: 2020, genre: 'Pop' },
            { id: 't2', title: 'Wait a Minute!', artist: 'Willow', artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/e5/07/8e/e5078e3b-77fe-1c78-3cb9-d39b6cf8b0f4/22UMGIM77352.rgb.jpg/400x400bb.jpg', stream: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/5e/3c/52/5e3c526f-72e9-63e0-4a16-1cf3a94e7c38/mzaf_5923832917512396829.plus.aac.ep.m4a', year: 2021, genre: 'Alt' },
            { id: 't3', title: 'Starboy', artist: 'The Weeknd', artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music111/v4/4c/bd/0a/4cbd0a3d-e56f-f5a3-7bd7-9ab1e9bfca7e/00602557598438.rgb.jpg/400x400bb.jpg', stream: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/89/ab/8d/89ab8d0d-8fb5-cb14-b1c7-fdab0c2d1ddd/mzaf_4478413399508591521.plus.aac.ep.m4a', year: 2016, genre: 'R&B' }
        ],
        albums: [
            { id: 'a1', title: 'After Hours', artist: 'The Weeknd', artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/8b/4f/24/8b4f2433-8a8d-9b39-d50e-3b8b7a7465e4/20UMGIM82421.rgb.jpg/400x400bb.jpg', year: 2020, trackCount: 14 },
            { id: 'a2', title: 'Starboy', artist: 'The Weeknd', artwork: 'https://is1-ssl.mzstatic.com/image/thumb/Music111/v4/4c/bd/0a/4cbd0a3d-e56f-f5a3-7bd7-9ab1e9bfca7e/00602557598438.rgb.jpg/400x400bb.jpg', year: 2016, trackCount: 18 }
        ],
        movies: [
            { id: 'mv1', title: 'Inception', subtitle: 'Christopher Nolan', artwork: 'https://image.tmdb.org/t/p/w342/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg', year: 2010, rating: '8.8', type: 'movie' },
            { id: 'mv2', title: 'The Dark Knight', subtitle: 'Christopher Nolan', artwork: 'https://image.tmdb.org/t/p/w342/qJ2tW6WMUDux911r6m7haRef0WH.jpg', year: 2008, rating: '9.0', type: 'movie' }
        ],
        series: [
            { id: 'sv1', title: 'Breaking Bad', subtitle: 'Vince Gilligan', artwork: 'https://image.tmdb.org/t/p/w342/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', year: 2008, rating: '9.5', type: 'series' },
            { id: 'sv2', title: 'Stranger Things', subtitle: 'The Duffer Brothers', artwork: 'https://image.tmdb.org/t/p/w342/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', year: 2016, rating: '8.7', type: 'series' }
        ],
        anime: [
            { id: 'an1', title: 'Attack on Titan', subtitle: 'Hajime Isayama', artwork: 'https://image.tmdb.org/t/p/w342/hB7H0j2LhVdE6o7K6o5A5v5L5Z5.jpg', year: 2013, rating: '9.0', type: 'anime' },
            { id: 'an2', title: 'Demon Slayer', subtitle: 'Koyoharu Gotouge', artwork: 'https://image.tmdb.org/t/p/w342/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg', year: 2019, rating: '8.7', type: 'anime' }
        ]
    };

    // ── Load entire store ──
    function loadStore() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        } catch {
            return {};
        }
    }

    // ── Save entire store ──
    function saveStore(store) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }

    // ── Ensure user has a data object ──
    function ensureUser(store, userId) {
        if (!store[userId]) {
            store[userId] = {
                tracks: [],
                albums: [],
                movies: [],
                series: [],
                anime: []
            };
        }
        // Ensure all keys exist
        ['tracks', 'albums', 'movies', 'series', 'anime'].forEach(k => {
            if (!Array.isArray(store[userId][k])) store[userId][k] = [];
        });
        return store[userId];
    }

    // ── Seed default data for a user if empty ──
    function seedUserIfEmpty(store, userId) {
        const user = ensureUser(store, userId);
        let hasData = false;
        ['tracks', 'albums', 'movies', 'series', 'anime'].forEach(k => {
            if (user[k].length) hasData = true;
        });
        if (!hasData) {
            // Copy default data (shallow copy)
            ['tracks', 'albums', 'movies', 'series', 'anime'].forEach(k => {
                user[k] = DEFAULT_DATA[k].slice();
            });
            saveStore(store);
        }
        return user;
    }

    // ── Public API ──
    return {

        /**
         * Get an array of favourites for a user and type.
         * @param {string} userId
         * @param {string} type - 'tracks', 'albums', 'movies', 'series', 'anime'
         * @returns {Array} array of items
         */
        get: function(userId, type) {
            const store = loadStore();
            const user = ensureUser(store, userId);
            return user[type] || [];
        },

        /**
         * Add an item to a user's favourites.
         * @param {string} userId
         * @param {string} type
         * @param {object} item - must have a unique `id` property
         * @returns {boolean} true if added, false if duplicate id
         */
        add: function(userId, type, item) {
            if (!item || !item.id) return false;
            const store = loadStore();
            const user = ensureUser(store, userId);
            const list = user[type] || (user[type] = []);
            // Check duplicate by id
            if (list.some(ex => ex.id === item.id)) return false;
            list.push(item);
            saveStore(store);
            return true;
        },

        /**
         * Remove an item by its index in the array.
         * @param {string} userId
         * @param {string} type
         * @param {number} index
         */
        remove: function(userId, type, index) {
            const store = loadStore();
            const user = ensureUser(store, userId);
            const list = user[type] || [];
            if (index >= 0 && index < list.length) {
                list.splice(index, 1);
                saveStore(store);
            }
        },

        /**
         * Seed default data for a user (if empty) – useful on first visit.
         * @param {string} userId
         */
        seedDefaults: function(userId) {
            const store = loadStore();
            seedUserIfEmpty(store, userId);
        }
    };

})();

// Automatically seed the current user when the page loads (if user param exists)
(function autoSeed() {
    const params = new URLSearchParams(window.location.search);
    const user = params.get('user');
    if (user) {
        window.XOS_FAV.seedDefaults(user);
    }
})();
