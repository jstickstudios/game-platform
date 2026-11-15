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
  <div id="jso-lobby" style="display:none;border:1px solid #ff315d55;border-radius:12px;padding:11px;margin:10px 0">
    <h3 style="font-size:13px;margin:0 0 9px">HOST RULES</h3>
    <label style="display:block;margin:7px 0">Difficulty
      <select id="jso-difficulty" style="display:block;width:100%;margin-top:4px;background:#171321;color:white;border:1px solid #ffffff33;border-radius:7px;padding:8px">
        <option value="easy">Easy</option><option value="normal" selected>Normal</option><option value="hard">Hard</option>
      </select>
    </label>
    <label id="jso-start-label" style="display:block;margin:7px 0">Starting wave
      <select id="jso-start" style="display:block;width:100%;margin-top:4px;background:#171321;color:white;border:1px solid #ffffff33;border-radius:7px;padding:8px">
        <option value="1">Wave 1</option><option value="5">Wave 5</option><option value="10">Wave 10</option>
      </select>
    </label>
    <label id="jso-strength-label" style="display:block;margin:7px 0">Enemy strength
      <select id="jso-strength" style="display:block;width:100%;margin-top:4px;background:#171321;color:white;border:1px solid #ffffff33;border-radius:7px;padding:8px">
        <option value="0.8">Reduced</option><option value="1" selected>Normal</option><option value="1.3">Increased</option>
      </select>
    </label>
    <label id="jso-map-label" style="display:block;margin:7px 0">Map progression
      <select id="jso-map" style="display:block;width:100%;margin-top:4px;background:#171321;color:white;border:1px solid #ffffff33;border-radius:7px">
        <option value="10" selected>Every 10 waves</option><option value="5">Every 5 waves</option>
      </select>
    </label>
    <button id="jso-start-match" class="primary" style="width:100%;margin-top:8px">Start match</button>
    <p id="jso-rule-note" class="muted">Only the host can change rules. Rules apply when the match starts.</p>
  </div>
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
const lobbyEl = panel.querySelector("#jso-lobby");
const difficultyEl = panel.querySelector("#jso-difficulty");
const startEl = panel.querySelector("#jso-start");
const strengthEl = panel.querySelector("#jso-strength");
const mapEl = panel.querySelector("#jso-map");
const startMatchBtn = panel.querySelector("#jso-start-match");
const ruleNote = panel.querySelector("#jso-rule-note");
let isHost = false;
let roomSettings = null;
let matchStarted = false;
let matchSeed = 0;
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
const combatHitTimes = new Map();
let hostClientId = null;

launch.addEventListener("click", () => panel.classList.toggle("open"));
panel.querySelector("#jso-refresh").addEventListener("click", loadLeaderboard);
createBtn.addEventListener("click", () => connectRoom(makeCode(), true));
joinBtn.addEventListener("click", () => {
  const code = roomInput.value.trim().toUpperCase();
  if (!/^[A-Z0-9]{4,6}$/.test(code)) {
    statusEl.textContent = "Enter a valid 4–6 character room code.";
    return;
  }
  connectRoom(code, false);
});
leaveBtn.addEventListener("click", leaveRoom);
startMatchBtn.addEventListener("click", startMatch);
for (const control of [difficultyEl, startEl, strengthEl, mapEl]) {
  control.addEventListener("change", publishRoomSettings);
}
if (game === "neon-stickman-parkour") {
  panel.querySelector("#jso-start-label").firstChild.textContent = "Starting map";
  startEl.innerHTML = '<option value="1">Map 1</option><option value="2">Map 2</option><option value="3">Map 3</option><option value="5">Map 5</option>';
  panel.querySelector("#jso-strength-label").style.display = "none";
  panel.querySelector("#jso-map-label").style.display = "none";
}

function makeCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return [...bytes].map((n) => alphabet[n % alphabet.length]).join("");
}

window.addEventListener("jstick-room-start", (event) => {
  if (game !== "neon-stickman-ninja") return;
  const g = window.__JSTICK_NINJA;
  const settings = event.detail?.settings;
  if (!g || !settings) return;
  g.startRun();
  g.wave = Number(settings.startingWave) || 1;
  g.roomMapEvery = Number(settings.mapEvery) || 10;
  g.__jstickDifficulty = settings.difficulty === "easy" ? 0.8 : settings.difficulty === "hard" ? 1.25 : 1;
  g.__jstickEnemyStrength = Number(settings.enemyStrength) || 1;
  if (!g.__jstickScaledMakeEnemy) {
    const original = g.makeEnemy.bind(g);
    g.makeEnemy = function(type, x) {
      const enemy = original(type, x);
      const scale = (g.__jstickDifficulty || 1) * (g.__jstickEnemyStrength || 1);
      enemy.hp = Math.max(1, Math.round(enemy.hp * scale));
      enemy.maxHp = Math.max(1, Math.round(enemy.maxHp * scale));
      enemy.dmg *= scale;
      enemy.spd *= g.__jstickDifficulty || 1;
      enemy.reach *= g.__jstickDifficulty || 1;
      return enemy;
    };
    g.__jstickScaledMakeEnemy = true;
  }
  g.startWave();
  setupNinjaCoop(g);
});

function setupNinjaCoop(g) {
  if (g.__jstickCoopReady || !channelReady || !channel) return;
  g.__jstickCoopReady = true;
  const originalHitMethod = g.hitEnemy;
  const originalUpdateEnemiesMethod = g.updateEnemies;
  const originalUpdateWavesMethod = g.updateWaves;
  const originalAiMethod = g.ai;
  g.__jstickCoopOriginals = { hitEnemy: originalHitMethod, updateEnemies: originalUpdateEnemiesMethod, updateWaves: originalUpdateWavesMethod, ai: originalAiMethod };
  const originalHit = originalHitMethod.bind(g);
  const originalUpdateEnemies = originalUpdateEnemiesMethod.bind(g);
  const originalUpdateWaves = originalUpdateWavesMethod.bind(g);
  const originalAi = originalAiMethod.bind(g);
  const remoteCombatPlayers = new Map();
  if (isHost) {
    g.ai = function(enemy, dt) {
      const now = Date.now();
      const candidates = [...remotePlayers.entries()].filter(([, player]) => now - player.seenAt < 1200 && player.phase === "playing" && !player.dead && Number.isFinite(player.x) && Number.isFinite(player.y));
      const nearest = candidates.sort((a,b) => Math.hypot(enemy.x-a[1].x, enemy.y-a[1].y) - Math.hypot(enemy.x-b[1].x, enemy.y-b[1].y))[0];
      if (!nearest || Math.hypot(enemy.x-nearest[1].x, enemy.y-nearest[1].y) >= Math.hypot(enemy.x-this.p.x, enemy.y-this.p.y)) return originalAi(enemy, dt);
      const [playerId, state] = nearest;
      let proxy = remoteCombatPlayers.get(playerId);
      if (!proxy) { proxy = g.newPlayer(); remoteCombatPlayers.set(playerId, proxy); }
      proxy.x = state.x; proxy.y = state.y;
      proxy.hp = Number.isFinite(state.hp) ? state.hp : proxy.hp;
      proxy.dead = Boolean(state.dead);
      proxy.invuln = Number.isFinite(state.invuln) ? state.invuln : proxy.invuln;
      const localPlayer = g.p;
      const beforeHp = proxy.hp;
      g.p = proxy;
      try { return originalAi(enemy, dt); }
      finally {
        g.p = localPlayer;
        state.hp = proxy.hp; state.dead = proxy.dead; state.invuln = proxy.invuln;
        if (proxy.hp < beforeHp) channel?.send({ type: "broadcast", event: "player-damage", payload: { targetId: playerId, damage: beforeHp - proxy.hp, sourceX: enemy.x } }).catch(() => {});
      }
    };
  }

  g.hitEnemy = function(enemy, damage, vx, vy, color, heavy) {
    if (!isHost && matchStarted && channelReady && enemy) {
      channel.send({ type: "broadcast", event: "combat-hit", payload: {
        id: clientId, enemyId: enemy.id, x: g.p.x, y: g.p.y,
        damage: Math.max(0, Math.min(30, Number(damage) || 0)),
        vx: Math.max(-900, Math.min(900, Number(vx) || 0)),
        vy: Math.max(-600, Math.min(200, Number(vy) || 0)),
        color: /^#[0-9a-f]{3,8}$/i.test(color) ? color : "#ff6685",
        heavy: Boolean(heavy), sentAt: Date.now(),
      } }).catch(() => {});
      return;
    }
    return originalHit(enemy, damage, vx, vy, color, heavy);
  };

  if (!isHost) {
    g.updateEnemies = function() {};
    g.updateWaves = function() {};
  }

  g.__jstickApplyCombatSnapshot = (snapshot) => {
    if (isHost || !snapshot || !Array.isArray(snapshot.enemies)) return;
    const incoming = new Set();
    for (const data of snapshot.enemies) {
      if (!data || !Number.isInteger(data.id) || typeof data.type !== "string") continue;
      incoming.add(data.id);
      let enemy = g.enemies.find((item) => item.id === data.id);
      if (!enemy) {
        enemy = g.makeEnemy(data.type, Number(data.x) || 0);
        Object.assign(enemy, data);
        g.enemies.push(enemy);
      } else {
        for (const key of ["x","y","vx","vy","hp","maxHp","state","stateT","stateDur","cd","spawnT","flash","stun","facing","onGround","runPhase","speed","aim","draw","volley","summonCd","hitDone","alpha"]) {
          if (data[key] !== undefined) enemy[key] = data[key];
        enemy.type = data.type;
        if (data.color) enemy.color = data.color;
        if (data.s !== undefined) enemy.s = data.s;
        }
      }
    }
    const removed = g.enemies.filter((enemy) => !incoming.has(enemy.id));
    if (removed.length) {
      g.kills += removed.length;
      g.enemies = g.enemies.filter((enemy) => incoming.has(enemy.id));
    }
    g.bossRef = g.enemies.find((enemy) => enemy.type === "boss") || null;
    const nextMapIdx = Number(snapshot.mapIdx) || 0;
    if (nextMapIdx !== g.mapIdx && g.bg?.constructor) g.bg = new g.bg.constructor(nextMapIdx);
    g.mapIdx = nextMapIdx;
    g.wave = Number(snapshot.wave) || 1;
    g.waveState = snapshot.waveState || g.waveState;
    g.waveT = Number(snapshot.waveT) || 0;
    g.spawnT = Number(snapshot.spawnT) || 0;
    g.queue = Array.isArray(snapshot.queue) ? snapshot.queue.slice(0, 100) : [];
    g.banner = snapshot.banner && typeof snapshot.banner === "object" ? { ...snapshot.banner } : null;
    const hostArrows = Array.isArray(snapshot.arrows) ? snapshot.arrows.filter((a) => a && a.owner === 0).slice(0, 100) : [];
    g.arrows = [...g.arrows.filter((a) => a.owner === 1), ...hostArrows.map((a) => ({ ...a }))];
  };

  g.__jstickBuildCombatSnapshot = () => ({
    mapIdx: g.mapIdx, wave: g.wave, waveState: g.waveState,
    waveT: g.waveT, spawnT: g.spawnT, queue: g.queue.slice(0, 100),
    banner: g.banner ? { ...g.banner } : null,
    enemies: g.enemies.slice(0, 40).map((e) => ({
      id:e.id,type:e.type,x:e.x,y:e.y,vx:e.vx,vy:e.vy,hp:e.hp,maxHp:e.maxHp,color:e.color,s:e.s,spd:e.spd,reach:e.reach,dmg:e.dmg,
      state:e.state,stateT:e.stateT,stateDur:e.stateDur,cd:e.cd,spawnT:e.spawnT,
      flash:e.flash,stun:e.stun,facing:e.facing,onGround:e.onGround,
      runPhase:e.runPhase,speed:e.speed,aim:e.aim,draw:e.draw,volley:e.volley,
      summonCd:e.summonCd,hitDone:e.hitDone,alpha:e.alpha,
    })),
    arrows: g.arrows.filter((a) => a.owner === 0).slice(0, 100).map((a) => ({
      x:a.x,y:a.y,vx:a.vx,vy:a.vy,g:a.g,life:a.life,owner:0,dmg:a.dmg,tt:a.tt,
    })),
  });
  if (!isHost) {
    g.updateEnemies = function() {};
    g.updateWaves = function() {};
  } else {
    g.updateEnemies = originalUpdateEnemies;
    g.updateWaves = originalUpdateWaves;
  }
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
      phase: g.state, x: g.p.x, y: g.p.y, hp: g.p.hp, dead: g.p.dead, invuln: g.p.invuln, scale: g.scale,
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

function defaultRoomSettings() {
  return game === "neon-stickman-parkour"
    ? { version: 1, difficulty: "normal", startingMap: 1 }
    : { version: 1, difficulty: "normal", startingWave: 1, enemyStrength: 1, mapEvery: 10 };
}

function validRoomSettings(s) {
  if (!s || s.version !== 1 || !["easy", "normal", "hard"].includes(s.difficulty)) return false;
  if (game === "neon-stickman-parkour") return [1, 2, 3, 5].includes(Number(s.startingMap));
  return [1, 5, 10].includes(Number(s.startingWave)) &&
    [0.8, 1, 1.3].includes(Number(s.enemyStrength)) && [5, 10].includes(Number(s.mapEvery));
}

function readRoomSettings() {
  return game === "neon-stickman-parkour"
    ? { version: 1, difficulty: difficultyEl.value, startingMap: Number(startEl.value) }
    : { version: 1, difficulty: difficultyEl.value, startingWave: Number(startEl.value), enemyStrength: Number(strengthEl.value), mapEvery: Number(mapEl.value) };
}

function applyRoomSettings(settings) {
  if (!validRoomSettings(settings)) return;
  roomSettings = { ...settings };
  difficultyEl.value = settings.difficulty;
  if (game === "neon-stickman-parkour") startEl.value = String(settings.startingMap);
  else {
    startEl.value = String(settings.startingWave);
    strengthEl.value = String(settings.enemyStrength);
    mapEl.value = String(settings.mapEvery);
  }
  updateLobbyControls();
}

function updateLobbyControls() {
  for (const control of [difficultyEl, startEl, strengthEl, mapEl]) control.disabled = !isHost;
  startMatchBtn.disabled = !isHost || !channelReady;
  ruleNote.textContent = isHost
    ? "You are host. Changes are shared with everyone in this room."
    : "Host controls the rules. Ninja enemy health, damage, waves and enemy projectiles are host-synced.";
}

async function publishRoomSettings() {
  if (!isHost || !channelReady || !channel) return;
  roomSettings = readRoomSettings();
  await channel.track({ id: clientId, username, game, role: "host", settings: roomSettings, matchStarted });
  await channel.send({ type: "broadcast", event: "room-settings", payload: { settings: roomSettings } });
}

function syncHostSettingsFromPresence() {
  if (isHost || !channel) return;
  const all = Object.values(channel.presenceState()).flat();
  const host = all.find((p) => p?.role === "host" && validRoomSettings(p.settings));
  if (host) {
    hostClientId = host.id || null;
    applyRoomSettings(host.settings);
    if (host.matchStarted && !matchStarted) {
      matchStarted = true;
      matchSeed = Number(host.seed) || 0;
      window.dispatchEvent(new CustomEvent("jstick-room-start", { detail: { game, settings: roomSettings, seed: matchSeed } }));
    }
    statusEl.textContent = matchStarted ? "Host started the room · settings synced." : "Host rules received · waiting for match start.";
  }
}

async function startMatch() {
  if (!isHost || !channelReady || !channel) return;
  await publishRoomSettings();
  matchStarted = true;
  matchSeed = crypto.getRandomValues(new Uint32Array(1))[0];
  await channel.track({ id: clientId, username, game, role: "host", settings: roomSettings, matchStarted: true, seed: matchSeed });
  startMatchBtn.disabled = true;
  statusEl.textContent = "Match start signal sent to the room.";
  await channel.send({ type: "broadcast", event: "match-start", payload: { settings: roomSettings, seed: matchSeed } });
  window.dispatchEvent(new CustomEvent("jstick-room-start", { detail: { game, settings: roomSettings, seed: matchSeed } }));
}

async function connectRoom(code, host = false) {
  if (!supabase) {
    statusEl.textContent = "Online services are not ready yet.";
    return;
  }
  await leaveRoom();
  roomCode = code;
  isHost = host;
  roomSettings = host ? defaultRoomSettings() : null;
  matchStarted = false;
  lobbyEl.style.display = "block";
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
    .on("broadcast", { event: "combat-hit" }, ({ payload }) => {
      if (!isHost || game !== "neon-stickman-ninja" || !matchStarted || !payload) return;
      const g = window.__JSTICK_NINJA;
      const attacker = remotePlayers.get(payload.id);
      const enemy = g?.enemies?.find((item) => item.id === payload.enemyId);
      if (!g || !attacker || !enemy || Date.now() - attacker.seenAt > 1200) return;
      const last = combatHitTimes.get(payload.id) || 0;
      if (Date.now() - last < 75) return;
      if (Math.hypot(enemy.x - attacker.x, (enemy.y - 45) - attacker.y) > 330) return;
      combatHitTimes.set(payload.id, Date.now());
      g.hitEnemy(enemy, Math.max(0, Math.min(30, Number(payload.damage) || 0)), Math.max(-900, Math.min(900, Number(payload.vx) || 0)), Math.max(-600, Math.min(200, Number(payload.vy) || 0)), /^#[0-9a-f]{3,8}$/i.test(payload.color) ? payload.color : "#ff6685", Boolean(payload.heavy));
    })
    .on("broadcast", { event: "player-damage" }, ({ payload }) => {
      if (isHost || game !== "neon-stickman-ninja" || payload?.targetId !== clientId) return;
      const g = window.__JSTICK_NINJA;
      if (g?.state === "playing" && Number(payload.damage) > 0) g.hurtPlayer(Math.min(40, Number(payload.damage)), Number(payload.sourceX) || g.p.x);
    })
    .on("broadcast", { event: "combat-snapshot" }, ({ payload }) => {
      if (isHost || game !== "neon-stickman-ninja" || !matchStarted || payload?.hostId !== hostClientId) return;
      window.__JSTICK_NINJA?.__jstickApplyCombatSnapshot?.(payload.snapshot);
    })
    .on("presence", { event: "sync" }, () => {
      renderPlayers();
      syncHostSettingsFromPresence();
    })
    .on("broadcast", { event: "room-settings" }, ({ payload }) => {
      if (!isHost && validRoomSettings(payload?.settings)) applyRoomSettings(payload.settings);
    })
    .on("broadcast", { event: "match-start" }, ({ payload }) => {
      if (!isHost && validRoomSettings(payload?.settings)) {
        applyRoomSettings(payload.settings);
        matchStarted = true;
        matchSeed = Number(payload.seed) || 0;
        statusEl.textContent = "Host started the match. Shared rules received.";
        window.dispatchEvent(new CustomEvent("jstick-room-start", { detail: { game, settings: roomSettings, seed: matchSeed } }));
      }
    });
  channel.subscribe(async (state) => {
    if (state === "SUBSCRIBED") {
      channelReady = true;
      await channel.track({ id: clientId, username, game, role: isHost ? "host" : "player", settings: isHost ? roomSettings : null });
      statusEl.textContent = isHost ? "Room created · configure rules and invite friends." : "Connected · waiting for host rules.";
      if (isHost) publishRoomSettings();
      else syncHostSettingsFromPresence();
      updateLobbyControls();
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
  const ninja = window.__JSTICK_NINJA;
  if (ninja?.__jstickCoopOriginals) {
    ninja.hitEnemy = ninja.__jstickCoopOriginals.hitEnemy;
    ninja.updateEnemies = ninja.__jstickCoopOriginals.updateEnemies;
    ninja.updateWaves = ninja.__jstickCoopOriginals.updateWaves;
    ninja.ai = ninja.__jstickCoopOriginals.ai;
    delete ninja.__jstickCoopOriginals;
    delete ninja.__jstickCoopReady;
    delete ninja.__jstickApplyCombatSnapshot;
    delete ninja.__jstickBuildCombatSnapshot;
  }
  channelReady = false;
  if (channel && supabase) {
    const old = channel;
    channel = null;
    try { await supabase.removeChannel(old); } catch {}
  }
  roomCode = "";
  isHost = false;
  roomSettings = null;
  matchStarted = false;
  lobbyEl.style.display = "none";
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
          phase: s.phase, hp: s.hp, dead: s.dead, invuln: s.invuln, score: scoreFor(s), sentAt: Date.now(),
        },
      });
      if (isHost && matchStarted && game === "neon-stickman-ninja") {
        const ninja = window.__JSTICK_NINJA;
        const snapshot = ninja?.__jstickBuildCombatSnapshot?.();
        if (snapshot) await channel.send({ type: "broadcast", event: "combat-snapshot", payload: { hostId: clientId, snapshot } });
      }
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
      realtime: { params: { eventsPerSecond: 20 } },
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
