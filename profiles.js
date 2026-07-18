/**
 * profiles.js — x0s.link Multi-User Profile Store
 * followers / following store user IDs — counts are auto-derived
 * Access via: ?user=nikhil or ?user=gemini etc.
 */

window.XOS_PROFILES = {

  anush: {
    userid: 'anush',
    handle: 'anush@x0s',
    displayName: 'Anush Decodes',
    verified: 'gold',
    banner: 'Picsart_26-04-18_23-43-21-546.jpg',
    avatar: 'https://unknownxsuperman-prog.github.io/anushdecodes/Screenshot_20260418-234611.png',
    bio: 'Decoding logic at the kernel level.\nBuilding the future one commit at a time.',
    followers: ['gemini'],
    following: ['gemini'],
    audioTrack: {
      title: 'Wait a Minute!',
      artist: 'Willow',
      streamUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/5e/3c/52/5e3c526f-72e9-63e0-4a16-1cf3a94e7c38/mzaf_5923832917512396829.plus.aac.ep.m4a',
      artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/e5/07/8e/e5078e3b-77fe-1c78-3cb9-d39b6cf8b0f4/22UMGIM77352.rgb.jpg/600x600bb.jpg'
    },
    links: [
      { icon: 'fa-arattai', label: 'Arattai', url: 'https://aratt.ai/user/@nikhilb', color: 'color-arattai', arattai: true },
      { icon: 'fa-brands fa-github', label: 'GitHub', url: 'https://github.com/xbit-proton', color: 'color-github' },
      { icon: 'fa-brands fa-instagram', label: 'Instagram', url: 'https://www.instagram.com/x0s.nikh_07', color: 'color-instagram' },
      { icon: 'fa-brands fa-x-twitter', label: 'X', url: 'https://x.com/Nikhil_X7', color: 'color-twitter' },
      { icon: 'fa-brands fa-linkedin-in', label: 'LinkedIn', url: 'https://linkedin.com/in/nikhil-b-b41641363', color: 'color-linkedin' },
      { icon: 'fa-brands fa-discord', label: 'Discord', url: 'https://discord.gg/QyHXBqS3H', color: 'color-discord' },
      { icon: 'fa-solid fa-link', label: 'x0s.link', url: 'personalpage.html', color: 'color-globe' }
    ],
    posts: [
      {
        files: ['file_00000000862871fab1161995ce9f104e.png', 'XOS_STAMP_1776237339190.png'],
        type: 'image',
        caption: 'Deep logic toggle.',
        time: '2h ago',
        likes: 42,
        comments: 5
      },
      {
        files: ['lv_7587788892909276421_20260417222425.mp4'],
        type: 'video',
        caption: '✨✨',
        time: '1d ago',
        likes: 128,
        comments: 14
      },
      {
        files: ['Video-784.mp4'],
        type: 'video',
        caption: '😇😇',
        time: '2h ago',
        likes: 42,
        comments: 5
      }
    ]
  },
   raghavendra: {
    userid: 'raghavendra',
    handle: 'raghavendra@x0s',
    displayName: 'Raghavendra',
    verified: 'green',
    banner: 'Picsart_26-04-18_23-43-21-546.jpg',
    avatar: 'Screenshot_20260715-212813.png',
    bio: 'natty',
    followers: ['anush'],
    following: ['anush'],
    audioTrack: {
      title: 'Wait a Minute!',
      artist: 'Willow',
      streamUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/5e/3c/52/5e3c526f-72e9-63e0-4a16-1cf3a94e7c38/mzaf_5923832917512396829.plus.aac.ep.m4a',
      artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/e5/07/8e/e5078e3b-77fe-1c78-3cb9-d39b6cf8b0f4/22UMGIM77352.rgb.jpg/600x600bb.jpg'
    },
    links: [
      { icon: 'fa-arattai', label: 'Arattai', url: 'https://aratt.ai/user/@nikhilb', color: 'color-arattai', arattai: true },
      { icon: 'fa-brands fa-github', label: 'GitHub', url: 'https://github.com/xbit-proton', color: 'color-github' },
      { icon: 'fa-brands fa-instagram', label: 'Instagram', url: 'https://www.instagram.com/x0s.nikh_07', color: 'color-instagram' },
      { icon: 'fa-brands fa-x-twitter', label: 'X', url: 'https://x.com/Nikhil_X7', color: 'color-twitter' },
      { icon: 'fa-brands fa-linkedin-in', label: 'LinkedIn', url: 'https://linkedin.com/in/nikhil-b-b41641363', color: 'color-linkedin' },
      { icon: 'fa-brands fa-discord', label: 'Discord', url: 'https://discord.gg/QyHXBqS3H', color: 'color-discord' },
      { icon: 'fa-solid fa-link', label: 'x0s.link', url: 'personalpage.html', color: 'color-globe' }
    ],
    posts: [
    ]
  },

    niranjan: { // Swapped key to lowercase for routing mapping consistency
    userid: 'niranjan',
    handle: 'niranjan@xos',
    displayName: 'Niranjan',
    verified: 'green',
    banner: 'Picsart_26-04-21_09-30-21-870.png',
    avatar: '1770636198936.png',
    bio: "chasing greatness, medico 🇮🇳 ' 🇷🇺",
    followers: ['gemini'],
    following: ['gemini'],
    audioTrack: {
      title: 'Dude-Orchestral Suite',
      artist: 'abhyankkar',
      streamUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/5e/3c/52/5e3c526f-72e9-63e0-4a16-1cf3a94e7c38/mzaf_5923832917512396829.plus.aac.ep.m4a',
      artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/e5/07/8e/e5078e3b-77fe-1c78-3cb9-d39b6cf8b0f4/22UMGIM77352.rgb.jpg/600x600bb.jpg'
    },
    links: [
      { icon: 'fa-brands fa-snapchat', label: 'Snapchat', url: 'https://www.snapchat.com/add/YOUR_USERNAME', color: 'color-snapchat' },
      { icon: 'fa-brands fa-instagram', label: 'Instagram', url: 'https://www.instagram.com/x0s.nikh_07', color: 'color-instagram' },
      { icon: 'fa-brands fa-x-twitter', label: 'X', url: 'https://x.com/Nikhil_X7', color: 'color-twitter' }
    ],
    posts: [
      {
        files: ['nirup1.mp4'],
        type: 'video',
        caption: '🕉️',
        time: '1d ago',
        likes: 128,
        comments: 14
      }
    ]
  },
  
  gemini: {
    userid: 'gemini',
    handle: 'gemini@x0s',
    displayName: 'Gemini X',
    verified: 'blue',
    banner: 'banner_gemini.jpg',
    avatar: 'avatar_gemini.png',
    bio: 'Exploring the edge of AI and human creativity.\nBuilding with Gemini 2.5.',
    followers: ['nikhil'],
    following: ['nikhil'],
    audioTrack: {
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      streamUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/a4/27/97/a4279729-2339-2e9f-f547-7e527fbbd8e2/mzaf_7223093637471044405.plus.aac.ep.m4a',
      artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/8b/4f/24/8b4f2433-8a8d-9b39-d50e-3b8b7a7465e4/20UMGIM82421.rgb.jpg/600x600bb.jpg'
    },
    links: [
      { icon: 'fa-brands fa-x-twitter', label: 'X', url: 'https://x.com/gemini', color: 'color-twitter' },
      { icon: 'fa-brands fa-github', label: 'GitHub', url: 'https://github.com/gemini-dev', color: 'color-github' },
      { icon: 'fa-solid fa-link', label: 'gemini.ai', url: 'https://gemini.ai', color: 'color-globe' }
    ],
    posts: [
      {
        files: ['gemini_post1.jpg'],
        type: 'image',
        caption: 'First light.',
        time: '3h ago',
        likes: 213,
        comments: 18
      },
      {
        files: ['gemini_video1.mp4'],
        type: 'video',
        caption: 'Neural walk',
        time: '1d ago',
        likes: 401,
        comments: 37
      },
      {
        files: ['gemini_post2a.jpg', 'gemini_post2b.jpg'],
        type: 'image',
        caption: 'Double exposure.',
        time: '2d ago',
        likes: 128,
        comments: 9
      }
    ]
  }// Added missing comma here



};

/**
 * Helper — get resolved follower/following counts and user objects
 * xosGetFollowers('nikhil') → array of profile objects
 */
window.xosGetFollowers = function(userid) {
  const p = window.XOS_PROFILES[userid];
  if (!p) return [];
  return (p.followers || []).map(id => window.XOS_PROFILES[id]).filter(Boolean);
};

window.xosGetFollowing = function(userid) {
  const p = window.XOS_PROFILES[userid];
  if (!p) return [];
  return (p.following || []).map(id => window.XOS_PROFILES[id]).filter(Boolean);
};

window.xosFollowerCount = function(userid) {
  const p = window.XOS_PROFILES[userid];
  return p ? (p.followers || []).length : 0;
};

window.xosFollowingCount = function(userid) {
  const p = window.XOS_PROFILES[userid];
  return p ? (p.following || []).length : 0;
};
