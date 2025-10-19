// Multiplayer Quick-Quiz server (GM separate from players).
// Packs: JSON files in ./packs with {title, items:[{front, back, hint?, choices?, answerIndex?}]}
// No OpenAI here. Pure realtime quiz.

import express from "express";
import cors from "cors";
import http from "http";
import { Server as IOServer } from "socket.io";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 8793);
const PACKS_DIR = path.join(__dirname, "packs");

const app = express();
app.use(cors());
app.use(express.json());

// --- REST: list packs, get a pack
app.get("/api/packs", async (_req, res) => {
  try {
    const dir = await fs.readdir(PACKS_DIR, { withFileTypes: true });
    const files = dir.filter(d => d.isFile() && d.name.endsWith(".json")).map(d => d.name);
    const out = [];
    for (const f of files) {
      try {
        const txt = await fs.readFile(path.join(PACKS_DIR, f), "utf8");
        const obj = JSON.parse(txt);
        out.push({ file: f, title: obj?.title || f, count: Array.isArray(obj?.items) ? obj.items.length : 0 });
      } catch {}
    }
    res.json({ packs: out });
  } catch {
    res.status(200).json({ packs: [] });
  }
});

app.get("/api/pack/:file", async (req, res) => {
  try {
    const f = path.basename(req.params.file);
    const full = path.join(PACKS_DIR, f);
    const txt = await fs.readFile(full, "utf8");
    const obj = JSON.parse(txt);
    res.json(obj);
  } catch {
    res.status(404).json({ error: "pack_not_found" });
  }
});

const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: "*" } });

// --- helpers ---
const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// --- In-memory rooms
// code -> room
const rooms = new Map();

const genCode = () =>
  Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random()*33)]).join("");

function buildChoices(q){
  if (Array.isArray(q?.choices) && Number.isInteger(q?.answerIndex)) return q;
  // synthesize 4 choices
  const choices = [q.back, "Inte denna", "Ett annat alternativ", "Ytterligare distraktor"];
  return { ...q, choices, answerIndex: 0 };
}

function makeRoom({ code, pack, items, durationSec, order, totalQuestions }) {
  return {
    code,
    createdAt: Date.now(),
    packTitle: pack?.title || code,
    items,                 // normalized items (each has .choices and .answerIndex)
    order,                 // shuffled array of indices into items, length = totalQuestions
    totalQuestions,        // convenience
    ix: -1,                // current question index in order
    status: "lobby",       // lobby | question | reveal | ended
    lock: false,
    timer: null,           // per-question countdown timeout
    endsAt: 0,
    durationSec,
    autoNextTimer: null,   // 5s auto-advance after reveal
    players: new Map(),    // socketId -> {name, score, lastQ: -1, answered:false}
    gm: null
  };
}

function currentItem(room){
  if (room.ix < 0 || room.ix >= room.order.length) return null;
  const itemIndex = room.order[room.ix];
  return room.items[itemIndex];
}
function currentCorrectIndex(room){
  const q = currentItem(room);
  if (!q) return 0;
  if (Array.isArray(q?.choices) && Number.isInteger(q?.answerIndex)) return q.answerIndex;
  return 0;
}

function broadcastState(room){
  const payload = {
    code: room.code,
    packTitle: room.packTitle,
    status: room.status,
    ix: room.ix,
    total: room.order.length,
    durationSec: room.durationSec,
    endsAt: room.endsAt,
    players: [...room.players.values()].map(p => ({ name:p.name, score:p.score }))
  };
  io.to(room.code).emit("room:update", payload);
}

function clearQuestionTimer(room){
  if (room.timer) { clearTimeout(room.timer); room.timer = null; }
}
function clearAutoNext(room){
  if (room.autoNextTimer) { clearTimeout(room.autoNextTimer); room.autoNextTimer = null; }
}
function scheduleAutoNext(room){
  clearAutoNext(room);
  room.autoNextTimer = setTimeout(()=>{
    if (room.status !== "reveal") return; // GM may have advanced
    gmNext(room);
  }, 5000);
}

function startTimer(room){
  clearQuestionTimer(room);
  room.endsAt = Date.now() + room.durationSec*1000;
  room.timer = setTimeout(()=>{
    if(room.status !== "question") return;
    room.status = "reveal";
    room.lock = true;
    io.to(room.code).emit("question:reveal", { correctIndex: currentCorrectIndex(room), winner: null });
    broadcastState(room);
    scheduleAutoNext(room);
  }, room.durationSec*1000 + 50);
}

function resetPerQuestionState(room){
  room.status = "question";
  room.lock = false;
  room.players.forEach(p => { p.answered = false; p.lastQ = room.ix; });
  clearAutoNext(room);
  startTimer(room);
  const q = currentItem(room);
  io.to(room.code).emit("question:new", {
    ix: room.ix,
    total: room.order.length,
    q
  });
  broadcastState(room);
}

// Move to next (shared by GM button and auto-advance)
function gmNext(room){
  clearQuestionTimer(room);
  clearAutoNext(room);
  room.ix++;
  if(room.ix >= room.order.length){
    room.status = "ended"; room.lock = true;
    io.to(room.code).emit("game:ended");
    broadcastState(room);
    return;
  }
  resetPerQuestionState(room);
}

// --- Socket.IO
io.on("connection", (socket)=>{
  // GM: create room
  socket.on("gm:create", async ({ packFile, durationSec, totalQuestions }, cb)=>{
    try{
      const file = path.basename(packFile);
      const txt = await fs.readFile(path.join(PACKS_DIR, file), "utf8");
      const obj = JSON.parse(txt);
      if(!Array.isArray(obj?.items) || obj.items.length === 0) throw new Error("empty pack");

      const normalized = obj.items.map(buildChoices);
      const maxQ = normalized.length;
      const requested = Math.max(1, Math.min(Number(totalQuestions || maxQ), maxQ));

      // Build a shuffled order of indices, then slice to requested length
      const order = shuffle([...normalized.keys()]).slice(0, requested);

      const code = genCode();
      const room = makeRoom({
        code,
        pack: obj,
        items: normalized,
        durationSec: Math.max(5, Math.min(120, Number(durationSec||30))),
        order,
        totalQuestions: requested
      });
      room.packTitle = obj.title || file;
      room.gm = socket.id;
      rooms.set(code, room);

      socket.join(code);
      cb?.({
        ok:true,
        code,
        packTitle: room.packTitle,
        count: room.totalQuestions,
        durationSec: room.durationSec
      });
      broadcastState(room);
    }catch(e){
      cb?.({ ok:false, error: "create_failed", detail: e.message });
    }
  });

  // GM: start first question
  socket.on("gm:start", ({ code }, cb)=>{
    const room = rooms.get(code); if(!room || room.gm!==socket.id) return cb?.({ ok:false });
    room.ix = 0;
    resetPerQuestionState(room);
    cb?.({ ok:true });
  });

  // GM: next question (manual)
  socket.on("gm:next", ({ code }, cb)=>{
    const room = rooms.get(code); if(!room || room.gm!==socket.id) return cb?.({ ok:false });
    gmNext(room);
    cb?.({ ok:true });
  });

  // Player: join
  socket.on("player:join", ({ code, name }, cb)=>{
    const room = rooms.get((code||"").trim().toUpperCase());
    if(!room) return cb?.({ ok:false, error:"room_not_found" });
    socket.join(room.code);
    room.players.set(socket.id, {
      name: String(name||"Player").slice(0,24),
      score:0,
      answered:false,
      lastQ:-1
    });
    broadcastState(room);
    cb?.({ ok:true, room:{ code:room.code, packTitle:room.packTitle } });
  });

  // Player: answer
  socket.on("player:answer", ({ code, choiceIndex }, cb)=>{
    const room = rooms.get(code); if(!room || room.status!=="question" || room.lock) return cb?.({ ok:false });
    const player = room.players.get(socket.id); if(!player) return cb?.({ ok:false });

    if(player.answered && player.lastQ === room.ix) return cb?.({ ok:false, error:"already_answered" });

    player.answered = true; player.lastQ = room.ix;
    const correct = Number(choiceIndex) === currentCorrectIndex(room);

    if(correct){
      // Correct: reveal winner, score, auto-advance after 5s
      room.lock = true; room.status = "reveal";
      player.score += 10;
      clearQuestionTimer(room);
      io.to(room.code).emit("question:reveal", { correctIndex: currentCorrectIndex(room), winner: player.name });
      broadcastState(room);
      scheduleAutoNext(room);
      return cb?.({ ok:true, correct:true });
    } else {
      // Wrong: -1 (if you want negative points on incorrect)
      player.score -= 1;

      // If everyone answered (and no one was correct yet), reveal and auto-advance
      const allAnswered = [...room.players.values()].length > 0 &&
                          [...room.players.values()].every(p => p.lastQ === room.ix && p.answered === true);
      if (allAnswered) {
        room.lock = true; room.status = "reveal";
        clearQuestionTimer(room);
        io.to(room.code).emit("question:reveal", { correctIndex: currentCorrectIndex(room), winner: null });
        broadcastState(room);
        scheduleAutoNext(room);
      } else {
        broadcastState(room);
      }
      return cb?.({ ok:true, correct:false });
    }
  });

  // Disconnect cleanup
  socket.on("disconnect", ()=>{
    for(const room of rooms.values()){
      if(room.gm === socket.id){
        clearQuestionTimer(room);
        clearAutoNext(room);
        io.to(room.code).emit("game:ended");
        rooms.delete(room.code);
        break;
      }
      if(room.players.has(socket.id)){
        room.players.delete(socket.id);
        broadcastState(room);
      }
    }
  });
});

server.listen(PORT, ()=> {
  console.log(`✅ Multiplayer Quick-Quiz server running on http://localhost:${PORT}`);
});