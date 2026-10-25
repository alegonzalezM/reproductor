const audio = document.getElementById("videoPlayer");
let playlists = [];           // [{ name, tracks: [] }]
let currentPlaylist = -1;
let current = 0;

const fileInput = document.getElementById("fileInput");
const btnAdd = document.getElementById("btnAdd");
const btnPlay = document.getElementById("btnPlay");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const trackName = document.getElementById("trackName");
const trackCount = document.getElementById("trackCount");
const progress = document.getElementById("progress");
const progressBar = document.getElementById("progressBar");
const currentTimeEl = document.getElementById("currentTime");
const totalTimeEl = document.getElementById("totalTime");
const playlistEl = document.getElementById("playlist");
const playlistsEl = document.getElementById("playlists");
const playlistNameInput = document.getElementById("playlistName");
const btnCreate = document.getElementById("btnCreate");

// ── Helper ──
function getTracks() {
  return currentPlaylist >= 0 ? playlists[currentPlaylist].tracks : [];
}

// ── Agregar archivos ──
btnAdd.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
  if (currentPlaylist < 0) {
    playlists.push({ name: "Lista 1", tracks: [] });
    currentPlaylist = 0;
  }
  const files = [...e.target.files];
  files.forEach(f => {
    playlists[currentPlaylist].tracks.push({
      name: f.name.replace(/\.[^.]+$/, ""),
      url: URL.createObjectURL(f),
      isVideo: f.type.startsWith("video/")
    });
  });
  e.target.value = ""; // permite re-seleccionar el mismo archivo
  renderPlaylists();
  renderPlaylist();
  if (getTracks().length > 0) loadTrack(0);
});

// ── Crear playlist ──
btnCreate.addEventListener("click", () => {
  const name = playlistNameInput.value.trim();
  if (!name) return;
  playlists.push({ name, tracks: [] });
  playlistNameInput.value = "";
  currentPlaylist = playlists.length - 1;
  current = 0;
  renderPlaylists();
  renderPlaylist();
});

function selectPlaylist(i) {
  currentPlaylist = i;
  current = 0;
  renderPlaylists();
  renderPlaylist();
  if (getTracks().length > 0) loadTrack(0);
}

// ── Reproducción ──
function loadTrack(i) {
  const tracks = getTracks();
  if (tracks.length === 0) return;
  current = i;
  audio.src = tracks[i].url;
  trackName.textContent = tracks[i].name;
  trackCount.textContent = `${i + 1} / ${tracks.length}`;
  audio.style.display = tracks[i].isVideo ? "block" : "none";
  renderPlaylist();
  audio.play();
  btnPlay.textContent = "⏸";
}

btnPlay.addEventListener("click", () => {
  if (audio.paused) { audio.play(); btnPlay.textContent = "⏸"; }
  else { audio.pause(); btnPlay.textContent = "▶"; }
});

btnNext.addEventListener("click", () => {
  const tracks = getTracks();
  if (tracks.length === 0) return;
  loadTrack((current + 1) % tracks.length);
});

btnPrev.addEventListener("click", () => {
  const tracks = getTracks();
  if (tracks.length === 0) return;
  loadTrack((current - 1 + tracks.length) % tracks.length);
});

audio.addEventListener("ended", () => btnNext.click());

// ── Progreso ──
audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  progress.style.width = pct + "%";
  currentTimeEl.textContent = fmt(audio.currentTime);
});

audio.addEventListener("loadedmetadata", () => {
  totalTimeEl.textContent = fmt(audio.duration);
});

progressBar.addEventListener("click", (e) => {
  const rect = progressBar.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  audio.currentTime = pct * audio.duration;
});

// ── Render ──
function renderPlaylists() {
  playlistsEl.innerHTML = playlists.map((p, i) => `
    <div class="playlist-tab ${i === currentPlaylist ? "active" : ""}" onclick="selectPlaylist(${i})">
      ${p.name} (${p.tracks.length})
    </div>
  `).join("");
}

function renderPlaylist() {
  const tracks = getTracks();
  playlistEl.innerHTML = tracks.map((t, i) => `
    <div class="playlist-item ${i === current ? "active" : ""}" onclick="loadTrack(${i})">
      <span class="num">${i + 1}</span>
      <span class="name">${t.name}</span>
    </div>
  `).join("");
}

function fmt(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}   