// ============================================================
// users.js — x0s.link User Registry
// ============================================================
//
// HOW HASHING WORKS:
// Passwords are never stored in plain text.
// When a user signs up, their password is run through SHA-256
// and the resulting hash is shown to them (green chip).
// You receive the hash in the Telegram notification.
// Paste that hash here — NOT the plain password.
//
// To generate a hash manually (for testing), run in browser console:
//   crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourpassword'))
//     .then(b => console.log(Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')))
//
// ============================================================
// SECTION 1: CREDENTIALS
// { userid, hash, email, name }
// ============================================================
const XOS_CREDENTIALS = [
  // Paste after user signs up — you get hash in Telegram:
  // {
  //   userid: 'nikhil@x0s',
  //   name:   'Nikhil',
  //   email:  'nikhil@email.com',
  //   hash:   'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'
  //   //       ↑ SHA-256 of their password (sent to you via Telegram on signup)
  // },
];

// ============================================================
// SECTION 2: PROFILE DATA
// Set active: true once you've uploaded their assets to GitHub.
// ============================================================
const XOS_PROFILES = [
  // {
  //   userid:        'nikhil@x0s',
  //   name:          'Nikhil',
  //   active:        true,
  //   pfp:           'pfp/nikhil@x0s.jpg',
  //   banner:        'banners/nikhil@x0s.jpg',
  //   bio:           'Building the future one commit at a time.',
  //   bio_audio:     'audio/nikhil@x0s.mp3',
  //   bio_song_url:  'https://www.youtube.com/watch?v=h4OAXvDRZTY',
  //   bio_song_start: 0,
  //   bio_song_end:   180,
  //   bio_song_title: 'Wait a Minute!',
  //   bio_song_artist:'Willow',
  //   links: [
  //     { url: 'https://instagram.com/nikhil', lb: 'Instagram' },
  //     { url: 'https://x.com/nikhil',         lb: 'X' },
  //     { url: 'https://github.com/nikhil',    lb: 'GitHub' },
  //     { url: 'https://youtube.com/@nikhil',  lb: 'YouTube' },
  //   ],
  //   followers: [],
  //   following: [],
  // },
];

window.XOS_CREDENTIALS = XOS_CREDENTIALS;
window.XOS_PROFILES    = XOS_PROFILES;
