import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, updatePassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, deleteDoc, increment, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCDJKQ3BNcrTyu-NpiXUTkxPk7Jte0VouI",
  authDomain: "mekiampremium.firebaseapp.com",
  projectId: "mekiampremium",
  storageBucket: "mekiampremium.firebasestorage.app",
  messagingSenderId: "376200018571",
  appId: "1:376200018571:web:b54075ac532bae5e87b28e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const EMAIL_DOMAIN = "@gmail.com";

let currentUser = null;
let sessionUser = null; // Nyimpen sesi login sementara
let currentUserRole = "";
let currentUsername = "";
let amCreatedCount = 0;
let favorites = [];
let currentPlayingUrl = null;
const roleLevels = { 'fullup': 1, 'reseller': 2, 'partner': 3, 'moderator': 4, 'owner': 5, 'developer': 6 };

// ===== ICONS =====
const I = {
  menu: `<svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>`,
  play: `<svg id="playIcon" width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style="display:none;"><path d="M8 5v14l11-7z"/></svg>`,
  pause: `<svg id="pauseIcon" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
  mute: `<svg id="muteIcon" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`,
  sound: `<svg id="soundIcon" width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style="display:none;"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
  users: `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`,
  calendar: `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>`,
  bolt: `<svg fill="var(--pink)" viewBox="0 0 24 24"><path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z"/></svg>`,
  boltSmall: `<svg width="20" height="20" fill="var(--pink)" viewBox="0 0 24 24"><path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z"/></svg>`,
  music: `<svg fill="var(--cyan)" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`,
  musicSmall: `<svg width="24" height="24" fill="var(--cyan)" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`,
  send: `<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`,
  check: `<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`,
  checkBig: `<svg width="30" height="30" fill="var(--green)" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`,
  x: `<svg width="24" height="24" fill="var(--pink)" viewBox="0 0 24 24" style="flex-shrink:0;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
  warning: `<svg width="40" height="40" fill="var(--pink)" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`,
  home: `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
  info: `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`,
  alert: `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`,
  close: `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
  tiktok: `<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
  telegram: `<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.41-.89.02-.24.36-.49 1.02-.75 4.01-1.75 6.68-2.9 8.03-3.47 3.83-1.6 4.63-1.87 5.15-1.88.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07.02.27 0 .4z"/></svg>`,
  addUser: `<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
  list: `<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>`,
  trash: `<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
  key: `<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>`,
  logout: `<svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>`,
  playSmall: `<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`,
  pauseSmall: `<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
  trashSmall: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>`,
  search: `<svg style="position:absolute;left:15px;top:15px;color:var(--muted);" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`,
  skip: `<svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>`,
  lockBig: `<svg width="30" height="30" fill="var(--pink)" viewBox="0 0 24 24" style="margin-bottom:15px"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>`
};

// ===== RENDER HTML =====
function renderStaticHTML() {
  // Isi Icon Sosial Media di Landing Page (SVG)
  document.getElementById('landingSocials').innerHTML = `
    <a href="https://t.me/meki_real" target="_blank" title="Telegram">${I.telegram}</a>
    <a href="https://www.tiktok.com/@meki_real" target="_blank" title="TikTok">${I.tiktok}</a>
  `;

  // Loader
  document.querySelector('.loader-kicker').textContent = 'A LITTLE TOUCH OF PREMIUM';
  document.querySelector('.loader-title').innerHTML = 'MEKI <em>AM Premium</em>';
  document.querySelector('.loader-sub').textContent = 'GENERATOR EXPERIENCE';
  document.getElementById('skipBtn').innerHTML = `LEWATI ${I.skip}`;

  // Login Form
  document.getElementById('loginCard').innerHTML = `
    ${I.lockBig}
    <h2 style="font-family:'Playfair Display'; font-size:24px; margin-bottom:5px;">Akses Terbatas</h2>
    <p style="font-size:11px;color:var(--muted);margin-bottom:20px;">Masukkan Username & Password.</p>
    <input type="text" id="loginUsn" class="comic-input" placeholder="Username" autocomplete="username">
    <input type="password" id="loginPw" class="comic-input" placeholder="Password" autocomplete="current-password">
    <button class="btn-block" id="btnLogin">MASUK</button>
    <button class="btn-block" id="btnBackLanding" style="background:transparent; border:1px solid var(--line); margin-top:10px; color:var(--muted);">KEMBALI</button>
    <p id="loginMsg" style="font-size:11px;color:var(--red);margin-top:10px;font-weight:bold;line-height:1.4;"></p>
  `;

  // Header
  document.getElementById('topHeader').innerHTML = `
    <div style="font-size:20px; cursor:pointer;" onclick="openSidebar()">${I.menu}</div>
    <div class="header-user">
      <div class="avatar-sm" id="headerAvatar"><img src="meki.png" alt="M"></div>
      <div class="header-info">
        <span class="header-name" id="headerName">Loading...</span>
        <span class="header-role" id="headerRole">ROLE</span>
      </div>
    </div>
    <div style="width: 24px;"></div>
  `;

  // Home page
  document.getElementById('page-home').innerHTML = `
    <div class="hero-banner" id="videoWrapper">
      <video id="homeVideo" src="meki.mp4" autoplay loop muted playsinline></video>
      <h1>MEKI ENGINE</h1>
      <div class="vid-center-btn" onclick="toggleHomeVideo()">${I.play}${I.pause}</div>
      <div class="vid-sound-btn" onclick="toggleHomeSound()">${I.mute}${I.sound}</div>
    </div>
    <div class="dash-card">
      <div class="welcome-row">
        <div class="welcome-text">
          <h4>Welcome Back,</h4>
          <h2 id="dashName">...</h2>
          <div class="role-pill" id="dashRole">...</div>
        </div>
        <div class="avatar-lg"><img src="meki.png" alt="M"></div>
      </div>
      <div class="dash-title">MEKI ENGINE DASHBOARD</div>
      <div class="stats-row">
        <div class="stat-item">
          <div class="icon-circle icon-green">${I.users}</div>
          <div class="stat-val">1</div>
          <div class="stat-lbl">Online Users</div>
        </div>
        <div class="stat-item">
          <div class="icon-circle icon-orange">${I.calendar}</div>
          <div class="stat-val" id="dashExpiry" style="font-size:11px">Loading...</div>
          <div class="stat-lbl">Expiration</div>
        </div>
      </div>
      <div class="live-badge">LIVE</div>
    </div>
    <div class="section-title">
      <h3>Quick Actions</h3>
      <span class="badge-xora">MEKI</span>
    </div>
    <div class="quick-grid">
      <a href="javascript:void(0)" class="quick-btn" onclick="switchPage('am')">${I.bolt} Generator AM</a>
      <a href="javascript:void(0)" class="quick-btn" onclick="switchPage('musik')">${I.music} Spotify</a>
    </div>
  `;

  // AM Page
  document.getElementById('page-am').innerHTML = `
    <h2 style="margin-bottom:15px; font-family:'Playfair Display'">Aktivasi Premium</h2>
    <div class="dash-card" style="display:flex; align-items:center; justify-content:space-between; padding:15px 20px; margin-bottom:15px; border-color:var(--pink);">
      <div style="display:flex; align-items:center; gap:10px;">
        <div style="width:35px; height:35px; border-radius:10px; background:rgba(255,42,122,0.1); display:grid; place-items:center;">${I.boltSmall}</div>
        <div>
          <div style="font-size:10px; color:var(--muted); font-weight:700; letter-spacing:1px;">TOTAL CREATE AM</div>
          <div style="font-size:18px; font-weight:800; color:var(--pink);" id="totalAmCount">0</div>
        </div>
      </div>
      <div style="font-size:20px; opacity:0.5;">📊</div>
    </div>
    <div class="dash-card">
      <div class="form-title" id="amFormTitle" style="font-size:18px; font-weight:800; margin-bottom:5px;">Verifikasi Email</div>
      <div class="form-sub" id="amFormSub" style="font-size:11px; color:var(--muted); margin-bottom:15px;">Masukkan email aktif.</div>
      <div class="step-form active" id="amStepEmail">
        <label style="font-size:10px;font-weight:800;color:var(--muted);">ALAMAT EMAIL</label>
        <input type="email" id="amEmail" class="comic-input" placeholder="email@kamu.com">
        <button class="btn-block" id="btnKirim" type="button">${I.send} KIRIM LINK</button>
        <p id="amMsg" style="text-align:center;font-size:11px;margin-top:10px;font-weight:bold;"></p>
      </div>
      <div class="step-form" id="amStepVerify">
        <label style="font-size:10px;font-weight:800;color:var(--muted);">LINK VERIFIKASI</label>
        <input type="text" id="amLink" class="comic-input" placeholder="Tempel link dari email...">
        <button class="btn-block" id="btnVerif" type="button">${I.check} VERIFIKASI</button>
        <p id="amMsg2" style="text-align:center;font-size:11px;margin-top:10px;font-weight:bold;"></p>
        <button class="btn-block" id="btnGantiEmail" type="button" style="background:#333; margin-top:8px;">GANTI EMAIL</button>
      </div>
      <div id="amHasil" class="step-form" style="text-align:center; margin-top:15px;">
        ${I.checkBig}
        <h3 style="font-weight:800">Premium Aktif</h3>
        <div id="amResEmail" style="font-size:12px;color:var(--muted)"></div>
        <button class="btn-block" id="btnUlangi" type="button" style="margin-top:15px;">AKTIVASI LAGI</button>
      </div>
    </div>
  `;

  // Musik Page
  document.getElementById('page-musik').innerHTML = `
    <h2 style="margin-bottom:15px; font-family:'Playfair Display'">Spotify Music</h2>
    <div class="subtabs">
      <button class="subtab active" data-subtab="search" onclick="switchSubtab('search')">CARI</button>
      <button class="subtab" data-subtab="playlist" onclick="switchSubtab('playlist')">FAVORIT <span id="playlistCount"></span></button>
    </div>
    <section id="subtab-search">
      <div style="position:relative;">${I.search}
        <input type="text" id="spSearchInput" class="comic-input" style="padding-left:40px;" placeholder="Cari judul lagu atau artis...">
      </div>
      <div id="spList" style="display:flex;flex-direction:column;gap:10px;"></div>
    </section>
    <section id="subtab-playlist" style="display:none;">
      <div class="search-wrap" style="position:relative; margin-bottom:10px;">
        <input type="text" id="favSearchInput" class="comic-input" placeholder="Cari lagu favorit kamu...">
      </div>
      <div id="favoritesList" style="display:flex;flex-direction:column;gap:10px;"></div>
    </section>
  `;

  // Perhatian Page
  document.getElementById('page-perhatian').innerHTML = `
    <h2 style="margin-bottom:15px; font-family:'Playfair Display'; color:var(--pink);">PERHATIAN</h2>
    <div class="dash-card" style="padding:20px;">
      <div style="display:flex; align-items:flex-start; gap:12px; margin-bottom:15px;">${I.x}<span style="font-weight:700; font-size:13px; line-height:1.5;">NO BAGI IN AKUN FREE</span></div>
      <div style="display:flex; align-items:flex-start; gap:12px; margin-bottom:15px;">${I.x}<span style="font-weight:700; font-size:13px; line-height:1.5;">NO BT IN AKUN</span></div>
      <div style="display:flex; align-items:flex-start; gap:12px;">${I.x}<span style="font-weight:700; font-size:13px; line-height:1.5;">FULL UP NO JUAL AKUN</span></div>
    </div>
    <div class="dash-card" style="background:rgba(255,42,122,0.1); border:1px solid var(--pink); text-align:center; padding:25px;">
      ${I.warning}
      <h3 style="color:var(--pink); margin-top:10px; font-weight:800; letter-spacing:1px;">PERINGATAN</h3>
      <p style="font-size:12px; color:var(--muted); margin-top:8px; font-weight:600; line-height:1.5;">JIKA KETAHUAN AKUN ANDA AKAN DIHAPUS PERMANEN</p>
    </div>
  `;

  // Info Page
  document.getElementById('page-info').innerHTML = `
    <h2 style="margin-bottom:15px; font-family:'Playfair Display'">Informasi</h2>
    <div class="dash-card" style="text-align:center; margin-bottom:15px;">
      <div class="avatar-lg" style="margin:0 auto 10px;"><img src="meki.png" alt="M"></div>
      <h3 style="font-weight:800">Meki Alight Motion</h3>
      <p style="font-size:11px;color:var(--muted);margin-top:5px;">Premium Generator Dashboard v2.0</p>
    </div>
    <div class="dash-card" style="display:flex; gap:15px; align-items:flex-start; margin-bottom:15px;">
      <div style="width:40px; height:40px; border-radius:10px; background:rgba(255,42,122,0.1); display:grid; place-items:center; flex-shrink:0;">${I.boltSmall}</div>
      <div><h4 style="font-weight:800; margin-bottom:5px; color:var(--pink);">Generator AM</h4><p style="font-size:11px; color:var(--muted); line-height:1.5;">Aktivasi Alight Motion Premium otomatis via email.</p></div>
    </div>
    <div class="dash-card" style="display:flex; gap:15px; align-items:flex-start; margin-bottom:15px;">
      <div style="width:40px; height:40px; border-radius:10px; background:rgba(0,229,255,0.1); display:grid; place-items:center; flex-shrink:0;">${I.musicSmall}</div>
      <div><h4 style="font-weight:800; margin-bottom:5px; color:var(--cyan);">Spotify Music</h4><p style="font-size:11px; color:var(--muted); line-height:1.5;">Pencarian dan pemutar musik. Lagu yang diputar otomatis masuk ke Favorit database.</p></div>
    </div>
    <div style="text-align:center; font-size:11px; color:var(--muted); margin-top:20px;">Dibuat oleh Meki Developer</div>
  `;

  // Bottom Nav
  document.getElementById('bottomNav').innerHTML = `
    <div class="nav-item active" id="nav-home" onclick="switchPage('home')">${I.home}<span>HOME</span></div>
    <div class="nav-item" id="nav-perhatian" onclick="switchPage('perhatian')">${I.alert}<span>PERHATIAN</span></div>
    <div class="nav-item" id="nav-info" onclick="switchPage('info')">${I.info}<span>INFO</span></div>
  `;

  // Sidebar header
  document.getElementById('sidebar').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <h3 style="font-family:'Playfair Display'">Menu</h3>
      <div style="cursor:pointer;" onclick="closeSidebar()">${I.close}</div>
    </div>
    <div id="sbMenu"></div>
  `;
}

// ===== TIMEOUT HELPER =====
function withTimeout(promise, ms = 15000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout: Koneksi ke Firebase terblokir.")), ms))
  ]);
}

// ===== INIT & LOGIKA LANDING PAGE =====
renderStaticHTML();
bindEvents();

// Cek Sesi (Tapi JANGAN tampilkan Dashboard dulu, simpan di sessionUser)
onAuthStateChanged(auth, (user) => {
  if (user) {
    sessionUser = user;
  } else {
    sessionUser = null;
  }
});

// Tombol Login di Landing Page
document.getElementById('btnGoToLogin').onclick = () => {
  document.getElementById('landingScreen').style.display = 'none';
  
  const landingVid = document.getElementById('landingVideo');
  if (landingVid) { landingVid.pause(); landingVid.muted = true; } // Mute biar suara gak dobel

  if (sessionUser) {
    // KALO SESI ADA, LANGSUNG MASUK DASHBOARD (Auto Login)
    handleAuthState(sessionUser);
  } else {
    // KALO GAK ADA SESI, MUNCULIN FORM LOGIN
    document.getElementById('loginScreen').style.display = 'flex';
  }
};

// Tombol Kembali ke Landing Page
document.getElementById('btnBackLanding').onclick = () => {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('landingScreen').style.display = 'flex';
  
  const landingVid = document.getElementById('landingVideo');
  if (landingVid) { landingVid.play(); }
};

async function handleAuthState(user) {
  currentUser = user;
  try {
    const userDoc = await withTimeout(getDoc(doc(db, "users", user.uid)));
    if (userDoc.exists()) {
      currentUserRole = userDoc.data().role;
      currentUsername = userDoc.data().username;
      const userExpired = userDoc.data().expired || '2029-12-31';

      await loadStatsDB();
      await loadFavoritesDB();

      document.getElementById('headerName').textContent = currentUsername;
      document.getElementById('headerRole').textContent = currentUserRole.toUpperCase();
      document.getElementById('dashName').textContent = currentUsername;
      document.getElementById('dashRole').textContent = currentUserRole.toUpperCase();
      document.getElementById('dashExpiry').textContent = userExpired;

      injectSidebar();
      initLoaderVideo();
    } else {
      await signOut(auth);
      document.getElementById('loginMsg').textContent = 'Data user tidak ada di database.';
    }
  } catch (e) {
    console.error(e);
    await signOut(auth);
    document.getElementById('loginMsg').textContent = 'Gagal memuat database. Cek koneksi.';
  }
}

// ===== BIND EVENTS =====
function bindEvents() {
  document.getElementById('btnLogin').onclick = async () => {
    const usn = document.getElementById('loginUsn').value.trim().toLowerCase();
    const pw = document.getElementById('loginPw').value;
    const msg = document.getElementById('loginMsg');
    if (!usn || !pw) { msg.textContent = 'Isi Username & Password!'; return; }
    msg.style.color = 'var(--cyan)';
    msg.textContent = 'Memeriksa...';
    document.getElementById('btnLogin').disabled = true;
    try {
      await withTimeout(signInWithEmailAndPassword(auth, usn + EMAIL_DOMAIN, pw));
    } catch (error) {
      console.error(error);
      msg.style.color = 'var(--red)';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        msg.textContent = 'Username atau Password salah!';
      } else {
        msg.textContent = 'Error: ' + error.message;
      }
      document.getElementById('btnLogin').disabled = false;
    }
  };

  // AM buttons
  document.getElementById('btnKirim').onclick = kirimLink;
  document.getElementById('btnVerif').onclick = verifikasiLink;
  document.getElementById('btnGantiEmail').onclick = () => { emailPengguna = ''; document.getElementById('amEmail').value = ''; showAmStep('email'); };
  document.getElementById('btnUlangi').onclick = () => { emailPengguna = ''; document.getElementById('amEmail').value = ''; showAmStep('email'); };

  // Spotify
  document.getElementById('spSearchInput').addEventListener('input', e => {
    clearTimeout(spSearchTimeout);
    const q = e.target.value.trim();
    if (!q) { document.getElementById('spList').innerHTML = ''; return; }
    spSearchTimeout = setTimeout(() => doSpotifySearch(q), 500);
  });
  document.getElementById('favSearchInput').addEventListener('input', renderFavorites);

  // Global audio
  const audio = document.getElementById('globalAudio');
  audio.addEventListener('ended', () => {
    currentPlayingUrl = null;
    const q = document.getElementById('spSearchInput').value.trim();
    if (q) doSpotifySearch(q);
    if (document.getElementById('subtab-playlist').style.display !== 'none') renderFavorites();
  });

  // Home video
  const homeVid = document.getElementById('homeVideo');
  const wrapper = document.getElementById('videoWrapper');
  if (wrapper) wrapper.classList.add('playing');
}

// ===== LOADING SCREEN =====
const loaderVid = document.getElementById('bannerVideo');
const bar = document.getElementById('progressBar');
const loader = document.getElementById('loaderScreen');
const mainApp = document.getElementById('mainApp');
const skipBtn = document.getElementById('skipBtn');
let loaderFinished = false;

async function initLoaderVideo() {
  loader.style.display = 'flex';
  loaderVid.muted = false; // Suara loading screen nyala
  try { await loaderVid.play(); }
  catch (err) {
    loaderVid.muted = true;
    try { await loaderVid.play(); } catch (e) {}
    const unmute = () => { loaderVid.muted = false; loaderVid.volume = 1; loaderVid.play().catch(()=>{}); cleanup(); };
    const evs = ['touchstart','click','keydown','pointerdown'];
    const cleanup = () => evs.forEach(ev => document.removeEventListener(ev, unmute, true));
    evs.forEach(ev => document.addEventListener(ev, unmute, true));
    window._loaderCleanup = cleanup;
  }
}

loaderVid.addEventListener('timeupdate', () => {
  if (loaderVid.duration) bar.style.width = Math.floor(loaderVid.currentTime / loaderVid.duration * 100) + '%';
});
loaderVid.addEventListener('ended', finishLoading);
skipBtn.addEventListener('click', (e) => { e.stopPropagation(); finishLoading(); });

function finishLoading() {
  if (loaderFinished) return;
  loaderFinished = true;
  bar.style.width = '100%';
  loaderVid.pause();
  loaderVid.muted = true; // Matiin suara loading pas masuk dashboard
  if (window._loaderCleanup) window._loaderCleanup();
  setTimeout(() => {
    loader.classList.add('hide');
    mainApp.style.display = 'block';
    window.scrollTo(0, 0);
  }, 350);
}

// ===== VIDEO HOME =====
window.toggleHomeVideo = function() {
  const v = document.getElementById('homeVideo');
  const w = document.getElementById('videoWrapper');
  const p = document.getElementById('playIcon');
  const s = document.getElementById('pauseIcon');
  if (v.paused) { v.play(); w.classList.add('playing'); p.style.display = 'none'; s.style.display = 'block'; }
  else { v.pause(); w.classList.remove('playing'); p.style.display = 'block'; s.style.display = 'none'; }
};
window.toggleHomeSound = function() {
  const v = document.getElementById('homeVideo');
  v.muted = !v.muted;
  document.getElementById('muteIcon').style.display = v.muted ? 'block' : 'none';
  document.getElementById('soundIcon').style.display = v.muted ? 'none' : 'block';
};

// ===== STATS DB =====
async function loadStatsDB() {
  const statsRef = doc(db, "config", "stats");
  try {
    const docSnap = await withTimeout(getDoc(statsRef));
    if (docSnap.exists()) {
      amCreatedCount = docSnap.data().totalAm || 0;
    } else {
      await setDoc(statsRef, { totalAm: 0 });
      amCreatedCount = 0;
    }
    const el = document.getElementById('totalAmCount');
    if (el) el.textContent = amCreatedCount;
  } catch (e) { console.log("Stats Error:", e.message); }
}

// ===== GENERATOR AM =====
const API_SOURCES = [{ name: 'QSera', base: 'https://api.qsr.web.id', sendPath: '/alight/send', verifyPath: '/alight/verify', key: 'qsr' }];
let emailPengguna = '';

function showAmStep(s) {
  document.getElementById('amStepEmail').classList.remove('active');
  document.getElementById('amStepVerify').classList.remove('active');
  document.getElementById('amHasil').classList.remove('active');
  if (s === 'email') {
    document.getElementById('amFormTitle').textContent = 'Verifikasi Email';
    document.getElementById('amFormSub').textContent = 'Masukkan email aktif.';
    document.getElementById('amStepEmail').classList.add('active');
  } else if (s === 'verify') {
    document.getElementById('amFormTitle').textContent = 'Link Verifikasi';
    document.getElementById('amFormSub').textContent = 'Tempel link dari email.';
    document.getElementById('amStepVerify').classList.add('active');
  } else {
    document.getElementById('amFormTitle').textContent = 'Aktivasi Berhasil';
    document.getElementById('amFormSub').textContent = 'Premium sudah aktif.';
    document.getElementById('amHasil').classList.add('active');
  }
}

async function kirimLink() {
  const email = document.getElementById('amEmail').value.trim();
  const msg = document.getElementById('amMsg');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    msg.style.color = 'var(--red)'; msg.textContent = 'Email tidak valid!'; return;
  }
  emailPengguna = email;
  msg.style.color = 'var(--cyan)';
  msg.innerHTML = 'Mengirim...';
  try {
    const api = API_SOURCES[0];
    const url = `${api.base}${api.sendPath}?apikey=${api.key}&email=${encodeURIComponent(email)}`;
    const r = await fetch(url);
    const d = await r.json();
    if (d.status === true || d.success === true) {
      msg.style.color = 'var(--green)';
      msg.textContent = 'Terkirim! Cek inbox/spam.';
      setTimeout(() => showAmStep('verify'), 900);
    } else {
      msg.style.color = 'var(--red)';
      msg.textContent = d.message || 'Gagal kirim.';
    }
  } catch (e) {
    msg.style.color = 'var(--red)';
    msg.textContent = 'Error koneksi.';
  }
}

async function verifikasiLink() {
  const link = document.getElementById('amLink').value.trim();
  const msg = document.getElementById('amMsg2');
  if (!link) { msg.style.color = 'var(--red)'; msg.textContent = 'Tempel link!'; return; }
  msg.style.color = 'var(--cyan)';
  msg.innerHTML = 'Memverifikasi...';
  try {
    const api = API_SOURCES[0];
    const url = `${api.base}${api.verifyPath}?apikey=${api.key}&email=${encodeURIComponent(emailPengguna)}&link=${encodeURIComponent(link)}`;
    const r = await fetch(url);
    const d = await r.json();
    if (d.status === true || d.success === true) {
      msg.style.color = 'var(--green)';
      msg.textContent = 'Berhasil!';
      document.getElementById('amResEmail').textContent = emailPengguna;

      const statsRef = doc(db, "config", "stats");
      await updateDoc(statsRef, { totalAm: increment(1) });
      amCreatedCount++;
      document.getElementById('totalAmCount').textContent = amCreatedCount;

      setTimeout(() => showAmStep('done'), 800);
    } else {
      msg.style.color = 'var(--red)';
      msg.textContent = d.message || 'Gagal verifikasi.';
    }
  } catch (e) {
    msg.style.color = 'var(--red)';
    msg.textContent = 'Error koneksi.';
  }
}

// ===== FAVORITES =====
async function loadFavoritesDB() {
  if (!currentUser) return;
  try {
    const favRef = collection(db, "users", currentUser.uid, "favorites");
    const snap = await withTimeout(getDocs(favRef));
    favorites = [];
    snap.forEach(d => favorites.push(d.data()));
    const el = document.getElementById('playlistCount');
    if (el) el.textContent = favorites.length ? `(${favorites.length})` : '';
  } catch (e) { console.log("Fav Error:", e.message); }
}

async function addFavoriteDB(track) {
  if (!currentUser) return;
  const trackId = btoa(track.url).replace(/=/g, '');
  await setDoc(doc(db, "users", currentUser.uid, "favorites", trackId), track);
  if (!favorites.find(x => x.url === track.url)) {
    favorites.push(track);
    document.getElementById('playlistCount').textContent = favorites.length ? `(${favorites.length})` : '';
  }
}

async function removeFavoriteDB(url) {
  if (!currentUser) return;
  const trackId = btoa(url).replace(/=/g, '');
  await deleteDoc(doc(db, "users", currentUser.uid, "favorites", trackId));
  favorites = favorites.filter(x => x.url !== url);
  document.getElementById('playlistCount').textContent = favorites.length ? `(${favorites.length})` : '';
}

// ===== SPOTIFY =====
const SP_SEARCH_ENDPOINT = 'https://api.nexray.eu.cc/search/spotify';
const SP_DOWNLOAD_ENDPOINT = 'https://api.nexray.eu.cc/downloader/spotify';
let spSearchTimeout = null;
let spResults = [];
const audio = document.getElementById('globalAudio');

function escapeHTML(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

window.switchSubtab = function(tab) {
  document.querySelectorAll('.subtab').forEach(b => b.classList.toggle('active', b.dataset.subtab === tab));
  document.getElementById('subtab-search').style.display = tab === 'search' ? 'block' : 'none';
  document.getElementById('subtab-playlist').style.display = tab === 'playlist' ? 'block' : 'none';
  if (tab === 'playlist') renderFavorites();
};

async function doSpotifySearch(q) {
  const el = document.getElementById('spList');
  el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);font-size:12px;">Mencari...</div>';
  try {
    const r = await fetch(`${SP_SEARCH_ENDPOINT}?q=${encodeURIComponent(q)}`);
    const d = await r.json();
    if (d.result && d.result.length) {
      spResults = d.result.slice(0, 20);
      el.innerHTML = spResults.map((t, i) => {
        const u = t.url || t.link || t.spotify_url || '';
        const isPlaying = (currentPlayingUrl === u && !audio.paused);
        const iconSVG = isPlaying ? I.pauseSmall : I.playSmall;
        return `
        <div class="track-item">
          <div class="track-art"><img src="${t.thumbnail || ''}" onerror="this.style.display='none'"></div>
          <div class="track-meta">
            <div class="track-title">${escapeHTML(t.title)}</div>
            <div class="track-artist">${escapeHTML(t.artist)}</div>
          </div>
          <div class="track-actions">
            <button class="track-btn ${isPlaying ? 'playing-btn' : ''}" onclick="togglePlayMusic(${i})">${iconSVG}</button>
          </div>
        </div>`;
      }).join('');
    } else {
      el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);font-size:12px;">Tidak ditemukan.</div>';
    }
  } catch (e) {
    el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--red);font-size:12px;">Error API.</div>';
  }
}

window.togglePlayMusic = async function(i) {
  const t = spResults[i];
  if (!t) return;
  const u = t.url || t.link || t.spotify_url;

  if (currentPlayingUrl === u && !audio.paused) {
    audio.pause();
    doSpotifySearch(document.getElementById('spSearchInput').value.trim());
    return;
  }
  if (currentPlayingUrl === u && audio.paused) {
    audio.play();
    doSpotifySearch(document.getElementById('spSearchInput').value.trim());
    return;
  }

  showToast('Memuat lagu...');
  try {
    const r = await fetch(`${SP_DOWNLOAD_ENDPOINT}?url=${encodeURIComponent(u)}`);
    const d = await r.json();
    const m = d.result || d.data || d;
    const mp3 = m.download_url || m.url || m.link;
    if (!mp3) throw new Error('No MP3');

    audio.src = mp3;
    audio.play();
    currentPlayingUrl = u;
    showToast('Memutar: ' + t.title);

    const trackData = { url: u, title: t.title, artist: t.artist, art: t.thumbnail };
    await addFavoriteDB(trackData);
    showToast('Lagu otomatis tersimpan di Favorit!');

    doSpotifySearch(document.getElementById('spSearchInput').value.trim());
  } catch (e) { showToast('Gagal memutar lagu'); }
};

function renderFavorites() {
  const el = document.getElementById('favoritesList');
  const q = (document.getElementById('favSearchInput').value || '').toLowerCase();
  const arr = favorites.filter(t => (t.title + ' ' + t.artist).toLowerCase().includes(q));

  if (!arr.length) {
    el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);font-size:12px;">Belum ada lagu favorit.</div>';
    return;
  }

  el.innerHTML = arr.map((t) => {
    const isPlaying = (currentPlayingUrl === t.url && !audio.paused);
    const iconSVG = isPlaying ? I.pauseSmall : I.playSmall;
    return `
    <div class="track-item">
      <div class="track-art"><img src="${t.art || ''}" onerror="this.style.display='none'"></div>
      <div class="track-meta"><div class="track-title">${escapeHTML(t.title)}</div><div class="track-artist">${escapeHTML(t.artist)}</div></div>
      <div class="track-actions">
        <button class="track-btn ${isPlaying ? 'playing-btn' : ''}" onclick="playSaved('${t.url}')">${iconSVG}</button>
        <button class="track-btn" onclick="deleteFav('${t.url}')">${I.trashSmall}</button>
      </div>
    </div>`;
  }).join('');
}

window.playSaved = async function(url) {
  const t = favorites.find(x => x.url === url);
  if (!t) return;

  if (currentPlayingUrl === url && !audio.paused) {
    audio.pause(); renderFavorites(); return;
  }
  if (currentPlayingUrl === url && audio.paused) {
    audio.play(); renderFavorites(); return;
  }

  showToast('Memuat lagu...');
  try {
    const r = await fetch(`${SP_DOWNLOAD_ENDPOINT}?url=${encodeURIComponent(url)}`);
    const d = await r.json();
    const m = d.result || d.data || d;
    const mp3 = m.download_url || m.url || m.link;
    if (!mp3) throw new Error('No MP3');
    audio.src = mp3;
    audio.play();
    currentPlayingUrl = url;
    showToast('Memutar: ' + t.title);
    renderFavorites();
  } catch (e) { showToast('Gagal memutar lagu'); }
};

window.deleteFav = async function(url) {
  await removeFavoriteDB(url);
  renderFavorites();
};

// ===== UI NAV =====
window.switchPage = function(nama) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + nama).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const nav = document.getElementById('nav-' + nama);
  if (nav) nav.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
window.openSidebar = function() { document.getElementById('sidebar').classList.add('open'); document.getElementById('sidebarOverlay').classList.add('open'); };
window.closeSidebar = function() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('sidebarOverlay').classList.remove('open'); };
window.showToast = function(msg) {
  const t = document.getElementById('toastRoot');
  t.innerHTML = `<div class="meki-toast show">${msg}</div>`;
  setTimeout(() => { t.innerHTML = ''; }, 2200);
};

// ===== SIDEBAR MENU =====
function injectSidebar() {
  let menuHTML = `
    <a class="sb-item" href="https://www.tiktok.com/@meki_real" target="_blank">${I.tiktok} TikTok Utama</a>
    <a class="sb-item" href="https://www.tiktok.com/@mekinjir" target="_blank">${I.tiktok} TikTok Ke 2</a>
    <a class="sb-item" href="https://www.tiktok.com/@mekiamprem" target="_blank">${I.tiktok} TikTok AM Premium</a>
    <hr style="border:0; border-top:1px solid var(--line); margin: 15px 0;">
  `;

  if (roleLevels[currentUserRole] > 1) {
    menuHTML += `
      <button class="sb-item" onclick="openCreateAccountModal()" style="border-color:var(--cyan); color:var(--cyan)">${I.addUser} Buat Akun Baru</button>
      <button class="sb-item" onclick="openListUserModal()">${I.list} List User</button>
    `;
  }
  if (currentUserRole === 'developer') {
    menuHTML += `<button class="sb-item" onclick="openDeleteAccountModal()" style="color:var(--red)">${I.trash} Hapus Akun</button>`;
  }
  menuHTML += `
    <button class="sb-item" onclick="openChangePwModal()">${I.key} Ganti Password</button>
    <button class="sb-item" onclick="logoutUser()" style="color:var(--red)">${I.logout} Logout</button>
  `;
  document.getElementById('sbMenu').innerHTML = menuHTML;
}

// ===== ADMIN MODALS =====
window.openCreateAccountModal = function() {
  const myLevel = roleLevels[currentUserRole];
  let options = '';
  for (const [role, level] of Object.entries(roleLevels)) {
    if (level < myLevel) options += `<option value="${role}">${role.toUpperCase()}</option>`;
  }

  document.getElementById('modalRoot').innerHTML = `
    <div class="meki-modal-overlay show">
      <div class="meki-modal">
        <div class="meki-modal-title">Buat Akun Baru</div>
        <div class="admin-form">
          <label>Username</label>
          <input type="text" id="newUsn" class="comic-input" placeholder="Tanpa spasi">
          <label>Password</label>
          <input type="password" id="newPw" class="comic-input" placeholder="Min 6 karakter">
          <label>Pilih Role</label>
          <select id="newRole">${options}</select>
          <label>Tanggal Expired</label>
          <input type="date" id="newExpired" class="comic-input">
        </div>
        <p id="adminMsg" style="font-size:11px;color:var(--red);margin-bottom:10px;"></p>
        <div class="meki-modal-actions">
          <button class="btn-cancel" onclick="document.getElementById('modalRoot').innerHTML=''">Batal</button>
          <button class="btn-confirm" id="btnDoCreate">Buat</button>
        </div>
      </div>
    </div>`;

  document.getElementById('btnDoCreate').onclick = async () => {
    const usn = document.getElementById('newUsn').value.trim().toLowerCase();
    const pw = document.getElementById('newPw').value;
    const role = document.getElementById('newRole').value;
    const exp = document.getElementById('newExpired').value;
    const msg = document.getElementById('adminMsg');

    if (!usn || pw.length < 6 || !exp) { msg.textContent = 'Data tidak valid (PW min 6 & Tanggal wajib)!'; return; }
    msg.style.color = 'var(--cyan)';
    msg.textContent = 'Membuat...';

    try {
      const secondaryApp = initializeApp(firebaseConfig, "Secondary");
      const secondaryAuth = getAuth(secondaryApp);
      const userCred = await withTimeout(createUserWithEmailAndPassword(secondaryAuth, usn + EMAIL_DOMAIN, pw));
      await setDoc(doc(db, "users", userCred.user.uid), { username: usn, role: role, expired: exp });
      await signOut(secondaryAuth);
      showToast('Akun berhasil dibuat!');
      document.getElementById('modalRoot').innerHTML = '';
    } catch (e) {
      msg.style.color = 'var(--red)';
      msg.textContent = e.message;
    }
  };
};

window.openListUserModal = async function() {
  document.getElementById('modalRoot').innerHTML = `
    <div class="meki-modal-overlay show"><div class="meki-modal"><div class="meki-modal-title">Memuat...</div></div></div>`;
  try {
    const querySnapshot = await withTimeout(getDocs(collection(db, "users")));
    let listHTML = '';
    querySnapshot.forEach((d) => {
      const u = d.data();
      listHTML += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid var(--line); text-align:left;">
          <div>
            <h4 style="font-size:13px; margin-bottom:2px;">${u.username}</h4>
            <p style="font-size:10px; color:var(--muted);">${u.role.toUpperCase()} (${u.expired || '-'})</p>
          </div>
        </div>`;
    });
    document.getElementById('modalRoot').innerHTML = `
      <div class="meki-modal-overlay show">
        <div class="meki-modal">
          <div class="meki-modal-title">List User Terdaftar</div>
          <div style="text-align:left; max-height: 250px; overflow-y:auto; border:1px solid var(--line); border-radius:10px; background:rgba(0,0,0,0.2);">
            ${listHTML || '<div style="padding:15px;text-align:center;font-size:12px;">Belum ada user.</div>'}
          </div>
          <div class="meki-modal-actions">
            <button class="btn-confirm" onclick="document.getElementById('modalRoot').innerHTML=''">Tutup</button>
          </div>
        </div>
      </div>`;
  } catch (e) {
    showToast('Gagal load user: ' + e.message);
    document.getElementById('modalRoot').innerHTML = '';
  }
};

window.openDeleteAccountModal = function() {
  document.getElementById('modalRoot').innerHTML = `
    <div class="meki-modal-overlay show">
      <div class="meki-modal">
        <div class="meki-modal-title" style="color:var(--red)">Hapus Akun User</div>
        <p style="font-size:11px;color:var(--muted);margin-bottom:10px;">Fitur ini menghapus data user dari database.</p>
        <input type="text" id="delUsn" class="comic-input" placeholder="Username yang mau dihapus">
        <div class="meki-modal-actions">
          <button class="btn-cancel" onclick="document.getElementById('modalRoot').innerHTML=''">Batal</button>
          <button class="btn-confirm" style="background:var(--red)" id="btnDoDelete">Hapus</button>
        </div>
      </div>
    </div>`;

  document.getElementById('btnDoDelete').onclick = async () => {
    const usn = document.getElementById('delUsn').value.trim().toLowerCase();
    if (!usn) return showToast('Isi username dulu!');
    try {
      const querySnapshot = await withTimeout(getDocs(collection(db, "users")));
      let foundId = null;
      querySnapshot.forEach(d => { if (d.data().username === usn) foundId = d.id; });
      if (foundId) {
        await deleteDoc(doc(db, "users", foundId));
        showToast('Data user di database dihapus!');
        document.getElementById('modalRoot').innerHTML = '';
      } else {
        showToast('User tidak ditemukan.');
      }
    } catch (e) { showToast('Error: ' + e.message); }
  };
};

window.openChangePwModal = function() {
  document.getElementById('modalRoot').innerHTML = `
    <div class="meki-modal-overlay show">
      <div class="meki-modal">
        <div class="meki-modal-title">Ganti Password</div>
        <input type="password" id="newMyPw" class="comic-input" placeholder="Password baru (min 6)">
        <p id="pwMsg" style="font-size:11px;color:var(--red);margin-bottom:10px;"></p>
        <div class="meki-modal-actions">
          <button class="btn-cancel" onclick="document.getElementById('modalRoot').innerHTML=''">Batal</button>
          <button class="btn-confirm" id="btnDoChangePw">Simpan</button>
        </div>
      </div>
    </div>`;

  document.getElementById('btnDoChangePw').onclick = async () => {
    const newPw = document.getElementById('newMyPw').value;
    const msg = document.getElementById('pwMsg');
    if (newPw.length < 6) { msg.textContent = 'Minimal 6 karakter!'; return; }
    try {
      await withTimeout(updatePassword(auth.currentUser, newPw));
      showToast('Password diganti!');
      document.getElementById('modalRoot').innerHTML = '';
    } catch (e) { msg.textContent = 'Gagal: ' + e.message; }
  };
};

window.logoutUser = async function() {
  await signOut(auth);
  window.location.reload();
};
