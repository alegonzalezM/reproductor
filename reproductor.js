const audio = new Audio();
let playlist = [];
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

btnAdd.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
  const files = [...e.target.files];
  files.forEach(f => {
    playlist.push({ name: f.name.replace(/\.[^.]+$/, ""), url: URL.createObjectURL(f) });
  });
  renderPlaylist();
  if (playlist.length > 0) loadTrack(current);
});

function loadTrack(i) {
  current = i;
  audio.src = playlist[i].url;
  trackName.textContent = playlist[i].name;
  trackCount.textContent = `${i + 1} / ${playlist.length}`;
  renderPlaylist();
  audio.play();
  btnPlay.textContent = "⏸";
}

function renderPlaylist() {
  playlistEl.innerHTML = playlist.map((t, i) => `
    <div class="playlist-item ${i === current ? "active" : ""}" onclick="loadTrack(${i})">
      <span class="num">${i + 1}</span>
      <span class="name">${t.name}</span>
    </div>
  `).join("");
}

btnPlay.addEventListener("click", () => {
  if (audio.paused) { audio.play(); btnPlay.textContent = "⏸"; }
  else { audio.pause(); btnPlay.textContent = "▶"; }
});

btnNext.addEventListener("click", () => {
  const next = (current + 1) % playlist.length;
  loadTrack(next);
});

btnPrev.addEventListener("click", () => {
  const prev = (current - 1 + playlist.length) % playlist.length;
  loadTrack(prev);
});

audio.addEventListener("ended", () => btnNext.click());

audio.addEventListener("timeupdate", () => {
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

function fmt(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}   