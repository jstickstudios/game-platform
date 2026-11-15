import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const params = new URL(import.meta.url).searchParams;
const game = params.get("game");
const allowed = ["neon-stickman-parkour", "neon-stickman-ninja"];
if (!allowed.includes(game)) throw new Error("Unknown JStick game");

const style = document.createElement("style");
style.textContent = `
#jso-launch{position:fixed;right:16px;bottom:16px;z-index:99999;border:1px solid #ff315d;background:#100812;color:#fff;border-radius:12px;padding:10px 15px;font:800 12px system-ui;letter-spacing:.12em;box-shadow:0 0 20px #ff315d55;cursor:pointer}
#jso-panel{position:fixed;right:16px;bottom:62px;z-index:99999;width:min(350px,calc(100vw - 32px));max-height:75vh;overflow:auto;background:rgba(8,8,18,.96);border:1px solid #ff315d88;border-radius:16px;padding:16px;color:#fff;font:13px system-ui;box-shadow:0 18px 55px #000b;backdrop-filter:blur(14px);display:none}
#jso-panel.open{display:block}
#jso-panel h3{font:900 17px system-ui;letter-spacing:.1em;color:#ff6685;margin:0 0 8px}
#jso-panel p{color:#b9b9c7;margin:6px 0}
#jso-panel input{width:100%;background:#171321;border:1px solid #ffffff2b;border-radius:8px;padding:10px;color:white;outline:none;text-transform:uppercase}
#jso-panel button{background:#24101b;border:1px solid #ff315d66;border-radius:8px;color:#fff;padding:9px 11px;font-weight:800;cursor:pointer}
#jso-panel button.primary{background:linear-gradient(90deg,#9d1239,#e72d5d)}
#jso-panel button:disabled{opacity:.45;cursor:not-allowed}
#jso-status{margin:10px 0;padding:8px;border-radius:8px;background:#ffffff0b;color:#ffd5df}
#jso-players,#jso-ranks{margin:7px 0 0;padding:0;list-style:none}
#jso-players li,#jso-ranks li{display:flex;justify-content:space-between;gap:8px;padding:6px 0;border-bottom:1px solid #ffffff12}
#jso-ranks strong{color:#ff9bb0}
#jso-canvas{position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:4}
#jso-panel .muted{font-size:11px;color:#9292a4}
`;
document.head.appendChild(style);

const launch = document.createElement("button");
launch.id = "jso-launch";
launch.textContent = "✦ ONLINE";
document.body.appendChild(launch);

const panel = document.createElement("section");
panel.id = "jso-panel";
panel.innerHTML = `
  <h3>JSTICK ONLINE</h3>
  <p id="jso-status">Connecting to online services…</p>
  <div style="display:flex;gap:7px;margin:10px 0">
    <input id="jso-room" maxlength="6" placeholder="ROOM CODE" autocomplete="off" />
  </div>
  <div style="display:flex;gap:7px;flex-wrap:wrap">
    <button id="jso-create" class="primary">Create room</button>
    <button id="jso-join">Join room</button>
    <button id="jso-leave" disabled>Leave</button>
  </div>
  <p id="jso-room-label" class="muted">No room joined</p>
  <p><b>Players in room</b></p>
  <ul id="jso-players"><li class="muted">No room yet</li></ul>
  <div style="display:flex;align-items:center;justify-content:space-between;margin-top:14px">
    <b>GLOBAL RANKING · TOP 10</b><button id="jso-refresh">Refresh</button>
  </div>
  <ul id="jso-ranks"><li class="muted">Loading…</li></ul>
  <p class="muted">Live positions are shared in this room. Scores are checked for valid ranges, but client-side game scores are not cheat-proof.</p>
`;
document.body.appendChild(panel);

const canvas = document.createElement("canvas");
canvas.id = "jso-canvas";
document.body.appendChild(canvas);
const ctx = canvas.getContext("2d");
const statusEl = panel.querySelector("#jso-status");
const roomInput = panel.querySelector("#jso-room");
const playersEl = panel.querySelector("#jso-players");
const ranksEl = panel.querySelector("#jso-ranks");
const roomLabel = panel.querySelector("#jso-room-label");
const createBtn = panel.querySelector("#jso-create");
const joinBtn = panel.querySelector("#jso-join");
const leaveBtn = panel.querySelector("#jso-leave");
let supabase = null;
let channel = null;
let roomCode = "";
let username = "Player";
let clientId = crypto.randomUUID();
let channelReady = false;
let lastSubmittedScore = -1;
let lastSubmitAt = 0;
const remotePlayers = new Map();

launch.addEventListener("click", () => panel.classList.toggle("open"));
panel.querySelector("#jso-refresh").addEventListener("click", loadLeaderboard);
createBtn.addEventListener("click", () => connectRoom(makeCode()));
joinBtn.addEventListener("click", () => {
  const code = roomInput.value.trim().toUpperCase();
  if (!/^[A-Z0-9]{4,6}$/.test(code)) {
    statusEl.textContent = "Enter a valid 4–6 character room code.";
    return;
  }
  connectRoom(code);
});
leaveBtn.addEventListener("click", leaveRoom);

function makeCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return [...bytes].map((n) => alphabet[n % alphabet.length]).join("");
}

function readGameState() {
  if (typeof window.__JSTICK_GAME_STATE === "function") {
    try { return window.__JSTICK_GAME_STATE(); } catch {}
  }
  if (game === "neon-stickman-ninja") {
    const g = window.__JSTICK_NINJA;
    if (!g) return null;
    try { g.recordBest(); } catch {}
    let save = {};
    try { save = JSON.parse(localStorage.getItem("jstickstudios-ninja-save-v1") || "{}"); } catch {}
    const rect = g.canvas.getBoundingClientRect();
    return {
      phase: g.state, x: g.p.x, y: g.p.y, scale: g.scale,
      rect: { left: rect.left, top: rect.top },
      map: g.mapIdx + 1, wave: g.wave, kills: g.kills,
      bestMap: Number.isSafeInteger(save.bestMap) ? save.bestMap : 1,
      bestWave: Number.isSafeInteger(save.bestWave) ? save.bestWave : 1,
      totalKills: Number.isSafeInteger(save.totalKills) ? save.totalKills : 0,
    };
  }
  return null;
}

function scoreFor(s) {
  if (!s) return 0;
  if (game === "neon-stickman-parkour") return Math.max(0, Number(s.distance) || 0);
  const bestMap = Number(s.bestMap) || 1;
  const bestWave = Number(s.bestWave) || 1;
  if (bestMap === 1 && bestWave === 1 && !(Number(s.totalKills) > 0)) return 0;
  return Math.max(0, (bestMap - 1) * 10 + bestWave);
}

async function loadLeaderboard() {
  try {
    const response = await fetch(`/api/leaderboard?game=${encodeURIComponent(game)}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load rankings.");
    ranksEl.replaceChildren();
    if (!data.entries?.length) {
      ranksEl.innerHTML = '<li class="muted">No scores yet — set the first record!</li>';
      return;
    }
    for (const entry of data.entries) {
      const li = document.createElement("li");
      const label = document.createElement("span");
      const value = document.createElement("strong");
      label.textContent = `#${entry.rank} · ${entry.username}`;
      value.textContent = game === "neon-stickman-parkour"
        ? `${entry.score.toLocaleString()} m`
        : `${Math.floor((entry.score - 1) / 10) + 1} · W${((entry.score - 1) % 10) + 1}`;
      li.append(label, value);
      ranksEl.appendChild(li);
    }
  } catch (error) {
    ranksEl.innerHTML = '<li class="muted">Rankings are unavailable right now.</li>';
  }
}

async function submitScore(s) {
  if (!s || !username || Date.now() - lastSubmitAt < 15000) return;
  const score = scoreFor(s);
  if (!Number.isSafeInteger(score) || score <= 0 || score <= lastSubmittedScore) return;
  lastSubmitAt = Date.now();
  const body = game === "neon-stickman-parkour"
    ? { distance: Number(s.distance) || 0, maps: Number(s.maps) || 0, timeMs: Number(s.timeMs) || 0 }
    : { bestMap: Number(s.bestMap) || 1, bestWave: Number(s.bestWave) || 1, totalKills: Number(s.totalKills) || 0 };
  try {
    const response = await fetch(`/api/leaderboard?game=${encodeURIComponent(game)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, game }),
    });
    if (response.ok) {
      lastSubmittedScore = score;
      loadLeaderboard();
    }
  } catch {}
}

async function connectRoom(code) {
  if (!supabase) {
    statusEl.textContent = "Online services are not ready yet.";
    return;
  }
  await leaveRoom();
  roomCode = code;
  roomInput.value = code;
  roomLabel.textContent = `Room code: ${code} · Share this with a friend`;
  statusEl.textContent = "Connecting to room…";
  const roomName = `jstick:${game}:${code}`;
  channel = supabase.channel(roomName, {
    config: { broadcast: { self: false }, presence: { key: clientId } },
  });
  channel
    .on("broadcast", { event: "player-state" }, ({ payload }) => {
      if (!payload || payload.id === clientId || typeof payload.x !== "number" || typeof payload.y !== "number") return;
      remotePlayers.set(payload.id, { ...payload, seenAt: Date.now() });
      renderPlayers();
    })
    .on("presence", { event: "sync" }, renderPlayers);
  channel.subscribe(async (state) => {
    if (state === "SUBSCRIBED") {
      channelReady = true;
      await channel.track({ id: clientId, username, game });
      statusEl.textContent = "Connected · live player positions enabled";
      leaveBtn.disabled = false;
      createBtn.disabled = joinBtn.disabled = false;
      renderPlayers();
    } else if (state === "CHANNEL_ERROR" || state === "TIMED_OUT") {
      channelReady = false;
      statusEl.textContent = "Could not connect. Check your internet and Supabase Realtime settings.";
    }
  });
  leaveBtn.disabled = false;
}

async function leaveRoom() {
  channelReady = false;
  if (channel && supabase) {
    const old = channel;
    channel = null;
    try { await supabase.removeChannel(old); } catch {}
  }
  roomCode = "";
  remotePlayers.clear();
  roomLabel.textContent = "No room joined";
  leaveBtn.disabled = true;
  playersEl.innerHTML = '<li class="muted">No room yet</li>';
}

function renderPlayers() {
  if (!channel) return;
  const presence = channel.presenceState();
  const all = Object.values(presence).flat();
  const seen = new Set();
  playersEl.replaceChildren();
  for (const p of all) {
    if (!p?.id || seen.has(p.id)) continue;
    seen.add(p.id);
    const li = document.createElement("li");
    li.textContent = p.id === clientId ? `${p.username || username} (you)` : (p.username || "Player");
    playersEl.appendChild(li);
  }
  for (const [id, p] of remotePlayers) {
    if (Date.now() - p.seenAt > 4000) remotePlayers.delete(id);
  }
  if (!playersEl.children.length) playersEl.innerHTML = '<li class="muted">Waiting for players…</li>';
}

function drawStickman(x, y, label, hue) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = `hsl(${hue} 100% 70%)`;
  ctx.fillStyle = ctx.strokeStyle;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.shadowColor = ctx.strokeStyle;
  ctx.shadowBlur = 12;
  ctx.beginPath(); ctx.arc(0, -46, 8, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -37); ctx.lineTo(0, -15); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -31); ctx.lineTo(-12, -21); ctx.moveTo(0, -31); ctx.lineTo(12, -21); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, -15); ctx.lineTo(-9, 0); ctx.moveTo(0, -15); ctx.lineTo(9, 0); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.font = "bold 12px system-ui";
  ctx.textAlign = "center";
  ctx.fillText(label.slice(0, 18), 0, -62);
  ctx.restore();
}

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(innerWidth * dpr);
  canvas.height = Math.round(innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function drawRemotePlayers() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  const local = readGameState();
  if (!local || local.phase !== "playing" || !channelReady) return;
  const now = Date.now();
  for (const [id, p] of remotePlayers) {
    if (now - p.seenAt > 4000 || p.phase !== "playing") continue;
    let x, y;
    if (game === "neon-stickman-parkour") {
      x = (p.x - (local.camX || 0)) * (local.scale || 1);
      y = (p.y - (local.camY || 0)) * (local.scale || 1);
    } else {
      const rect = local.rect || { left: 0, top: 0 };
      x = rect.left + p.x * (local.scale || 1);
      y = rect.top + p.y * (local.scale || 1);
    }
    const hue = [...String(p.username || id)].reduce((n, c) => (n * 31 + c.charCodeAt(0)) % 360, 0);
    if (x > -50 && x < innerWidth + 50 && y > -100 && y < innerHeight + 50) {
      drawStickman(x, y, p.username || "Player", hue);
    }
  }
}

function animationFrame() {
  drawRemotePlayers();
  requestAnimationFrame(animationFrame);
}
requestAnimationFrame(animationFrame);

setInterval(async () => {
  const s = readGameState();
  if (!s) return;
  submitScore(s);
  if (channelReady && channel && s.phase === "playing" && Number.isFinite(s.x) && Number.isFinite(s.y)) {
    try {
      await channel.send({
        type: "broadcast",
        event: "player-state",
        payload: {
          id: clientId, username, x: s.x, y: s.y,
          phase: s.phase, score: scoreFor(s), sentAt: Date.now(),
        },
      });
    } catch {}
  }
}, 150);

async function boot() {
  if (location.protocol === "file:") {
    statusEl.textContent = "Open this game from JStick Studios → Play Online to use rooms and rankings.";
    createBtn.disabled = joinBtn.disabled = true;
    return;
  }
  try {
    const response = await fetch(`/api/multiplayer/config?game=${encodeURIComponent(game)}`, { cache: "no-store" });
    const config = await response.json();
    if (!response.ok) throw new Error(config.error || "Online mode is not available.");
    username = config.username;
    supabase = createClient(config.url, config.publishableKey, {
      realtime: { params: { eventsPerSecond: 12 } },
    });
    statusEl.textContent = `Ready, ${username}. Create a room or join with a code.`;
    createBtn.disabled = joinBtn.disabled = false;
    await loadLeaderboard();
  } catch (error) {
    statusEl.textContent = error instanceof Error ? error.message : "Online mode could not start.";
    createBtn.disabled = joinBtn.disabled = true;
  }
}

createBtn.disabled = joinBtn.disabled = true;
boot();
window.addEventListener("beforeunload", () => { if (channel && supabase) supabase.removeChannel(channel); });
