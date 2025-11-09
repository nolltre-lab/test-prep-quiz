// Multiplayer Quick-Quiz server (GM separate from players).
// Packs and Themes are JSON files under ./packs and ./themes.
// Theme is selected at room creation, propagated to all players.

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
const THEMES_DIR = path.join(__dirname, "themes");

const app = express();
app.use(cors());
app.use(express.json());

/* ----------------------- THEMES ----------------------- */

async function listThemes() {
  try {
    const dir = await fs.readdir(THEMES_DIR, { withFileTypes: true });
    const files = dir.filter(d => d.isFile() && d.name.endsWith(".json")).map(d => d.name);
    const out = [];
    for (const f of files) {
      try {
        const txt = await fs.readFile(path.join(THEMES_DIR, f), "utf8");
        const obj = JSON.parse(txt);
        // minimal listing fields
        out.push({
          file: f,
          name: obj?.name || f.replace(/\.json$/,""),
          preview: obj?.preview || {},
        });
      } catch {}
    }
    return out;
  } catch {
    return [];
  }
}

async function readTheme(fileOrName) {
  try {
    const fname = fileOrName.endsWith(".json") ? fileOrName : `${fileOrName}.json`;
    const full = path.join(THEMES_DIR, path.basename(fname));
    const txt = await fs.readFile(full, "utf8");
    const obj = JSON.parse(txt);
    return obj;
  } catch {
    return null;
  }
}

// REST: list themes
app.get("/api/themes", async (_req, res) => {
  const themes = await listThemes();
  res.json({ themes });
});

// REST: get one theme by name or file
app.get("/api/theme/:name", async (req, res) => {
  const t = await readTheme(req.params.name);
  if (!t) return res.status(404).json({ error: "theme_not_found" });
  res.json(t);
});

/* ----------------------- PACKS ----------------------- */

// REST: list packs
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
  } catch (e) {
    res.status(200).json({ packs: [] });
  }
});

// REST: get a pack
app.get("/api/pack/:file", async (req, res) => {
  try {
    const f = path.basename(req.params.file);
    const full = path.join(PACKS_DIR, f);
    const txt = await fs.readFile(full, "utf8");
    const obj = JSON.parse(txt);
    res.json(obj);
  } catch (e) {
    res.status(404).json({ error: "pack_not_found" });
  }
});

/* ----------------------- SOCKET ----------------------- */

const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: "*" } });

const rooms = new Map(); // code -> room
const genCode = () =>
  Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random()*33)]).join("");

function makeRoom({ code, pack, items, theme, isPublic = true }) {
  return {
    code,
    createdAt: Date.now(),
    packTitle: pack?.title || code,
    items,
    ix: -1,
    status: "lobby", // lobby | question | reveal | ended
    lock: false,
    timer: null,
    endsAt: 0,
    durationSec: 30,
    players: new Map(), // socketId -> {name, score, lastQ: -1, answered:false}
    gm: null,
    theme: theme || null, // full theme object
    totalOverride: null,  // optional if you carry total from GM; not used here
    isPublic: isPublic,   // whether room appears in public lobby list
  };
}

function broadcastState(room){
  const payload = {
    code: room.code,
    packTitle: room.packTitle,
    status: room.status,
    ix: room.ix,
    total: room.items.length,
    durationSec: room.durationSec,
    endsAt: room.endsAt,
    players: [...room.players.values()].map(p => ({ name:p.name, score:p.score, avatar:p.avatar })),
    theme: room.theme ? {
      name: room.theme.name || "classic",
      vars: room.theme.vars || {},
      effects: room.theme.effects || {}
    } : null
  };
  io.to(room.code).emit("room:update", payload);
}

function startTimer(room){
  clearTimeout(room.timer);
  room.endsAt = Date.now() + room.durationSec*1000;
  room.timer = setTimeout(()=>{
    // time's up -> reveal with no winner
    if(room.status !== "question") return;
    room.status = "reveal";
    room.lock = true;
    io.to(room.code).emit("question:reveal", { correctIndex: currentCorrectIndex(room), winner: null });
    broadcastState(room);
    // Optional: auto-advance after 5s
    setTimeout(()=> {
      if(room.status === "reveal") {
        io.to(room.code).emit("gm:auto-next", {});
        // GM will likely press Next; if you want fully automatic, you could call nextQ here.
      }
    }, 5000);
  }, room.durationSec*1000 + 50);
}

function currentQuestion(room){ return room.items[room.ix]; }
function currentCorrectIndex(room){
  const q = currentQuestion(room);
  if (Array.isArray(q?.choices) && Number.isInteger(q?.answerIndex)) return q.answerIndex;
  return 0; // fallback when we synthesize choices
}

function buildChoices(q){
  if (Array.isArray(q?.choices) && Number.isInteger(q?.answerIndex)) return q;
  // synthesize 4 choices
  const choices = [q.back, "Inte denna", "Ett annat alternativ", "Ytterligare distraktor"];
  return { ...q, choices, answerIndex: 0 };
}

function getPublicRooms() {
  const publicRooms = [];
  for (const room of rooms.values()) {
    if (room.isPublic && room.status === "lobby") {
      publicRooms.push({
        code: room.code,
        packTitle: room.packTitle,
        playerCount: room.players.size,
        theme: room.theme?.name || "classic",
        createdAt: room.createdAt
      });
    }
  }
  return publicRooms;
}

function broadcastPublicRooms() {
  const publicRooms = getPublicRooms();
  io.emit("rooms:list", { rooms: publicRooms });
}

io.on("connection", (socket)=>{
  // Send public rooms list on connection
  socket.emit("rooms:list", { rooms: getPublicRooms() });

  // GM: create room (with theme)
  socket.on("gm:create", async ({ packFile, durationSec, totalQuestions, themeName, isPublic }, cb)=>{
    try{
      const file = path.basename(packFile);
      const txt = await fs.readFile(path.join(PACKS_DIR, file), "utf8");
      const obj = JSON.parse(txt);
      if(!Array.isArray(obj?.items) || obj.items.length === 0) throw new Error("empty pack");

      const theme = (await readTheme(themeName || "classic")) ||
                    (await readTheme("classic")) ||
                    { name:"classic", vars:{}, effects:{} };

      const code = genCode();
      let items = obj.items.map(buildChoices);

      // bound totalQuestions
      const maxQ = items.length;
      const total = Math.max(1, Math.min(Number(totalQuestions || maxQ), maxQ));

      // randomize and take first N
      const idx = Array.from({length:maxQ}, (_,i)=>i);
      for(let i=idx.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [idx[i],idx[j]]=[idx[j],idx[i]];
      }
      items = idx.slice(0, total).map(i => items[i]);

      const room = makeRoom({ code, pack: obj, items, theme, isPublic: isPublic !== false });
      room.packTitle = obj.title || file;
      room.durationSec = Math.max(5, Math.min(120, Number(durationSec||30)));
      room.gm = socket.id;

      rooms.set(code, room);
      socket.join(code);

      cb?.({ ok:true, code, packTitle: room.packTitle, count: room.items.length, durationSec: room.durationSec, theme: room.theme?.name });
      broadcastState(room);
      broadcastPublicRooms(); // Notify all clients about new public room
    }catch(e){
      cb?.({ ok:false, error: "create_failed", detail: e.message });
    }
  });

  // GM: start first question
  socket.on("gm:start", ({ code }, cb)=>{
    const room = rooms.get(code); if(!room || room.gm!==socket.id) return cb?.({ ok:false });
    room.ix = 0; room.status = "question"; room.lock=false;
    room.players.forEach(p => { p.answered=false; p.lastQ=room.ix; });
    startTimer(room);
    io.to(code).emit("question:new", {
      ix: room.ix, total: room.items.length, q: currentQuestion(room)
    });
    broadcastState(room);
    broadcastPublicRooms(); // Room no longer in lobby - update public list
    cb?.({ ok:true });
  });

  // GM: next question
  socket.on("gm:next", ({ code }, cb)=>{
    const room = rooms.get(code); if(!room || room.gm!==socket.id) return cb?.({ ok:false });
    clearTimeout(room.timer);
    room.ix++;
    if(room.ix >= room.items.length){
      room.status = "ended"; room.lock = true;
      io.to(code).emit("game:ended");
      broadcastState(room);
      return cb?.({ ok:true, ended:true });
    }
    room.status = "question"; room.lock=false;
    room.players.forEach(p => { p.answered=false; p.lastQ=room.ix; });
    startTimer(room);
    io.to(code).emit("question:new", { ix: room.ix, total: room.items.length, q: currentQuestion(room) });
    broadcastState(room);
    cb?.({ ok:true });
  });

  // Player: join
  socket.on("player:join", ({ code, name, avatar }, cb)=>{
    const room = rooms.get((code||"").trim().toUpperCase());
    if(!room) return cb?.({ ok:false, error:"room_not_found" });
    socket.join(room.code);
    room.players.set(socket.id, {
      name: String(name||"Player").slice(0,24),
      avatar: String(avatar||"😀").slice(0,2),
      score:0,
      answered:false,
      lastQ:-1
    });
    broadcastState(room);
    broadcastPublicRooms(); // Player count changed - update public list
    cb?.({ ok:true, room:{ code:room.code, packTitle:room.packTitle }, theme: room.theme?.name });
  });

  // Player: answer (one attempt; wrong = -1; correct = +10 and reveal)
  socket.on("player:answer", ({ code, choiceIndex }, cb)=>{
    const room = rooms.get(code); if(!room || room.status!=="question" || room.lock) return cb?.({ ok:false });
    const player = room.players.get(socket.id); if(!player) return cb?.({ ok:false });

    if(player.answered && player.lastQ === room.ix) return cb?.({ ok:false, error:"already_answered" });

    player.answered = true; player.lastQ = room.ix;
    const correct = Number(choiceIndex) === currentCorrectIndex(room);

    if(correct){
      room.lock = true; room.status = "reveal";
      player.score += 10;
      clearTimeout(room.timer);
      io.to(room.code).emit("question:reveal", { correctIndex: currentCorrectIndex(room), winner: player.name });
      broadcastState(room);
      // auto-advance after 5s if GM doesn't press Next
      setTimeout(()=> {
        if(room.status === "reveal") io.to(room.code).emit("gm:auto-next", {});
      }, 5000);
      return cb?.({ ok:true, correct:true });
    } else {
      player.score -= 1;
      broadcastState(room);
      // if all players answered (all have answered==true for this ix), auto-reveal/next
      const allAnswered = [...room.players.values()].length > 0 &&
                          [...room.players.values()].every(p => p.answered && p.lastQ === room.ix);
      if (allAnswered) {
        room.lock = true; room.status = "reveal";
        clearTimeout(room.timer);
        io.to(room.code).emit("question:reveal", { correctIndex: currentCorrectIndex(room), winner: null });
        broadcastState(room);
        setTimeout(()=> {
          if(room.status === "reveal") io.to(room.code).emit("gm:auto-next", {});
        }, 5000);
      }
      return cb?.({ ok:true, correct:false });
    }
  });

  // Disconnect cleanup
  socket.on("disconnect", ()=>{
    let needsBroadcast = false;
    for(const room of rooms.values()){
      if(room.gm === socket.id){
        clearTimeout(room.timer);
        io.to(room.code).emit("game:ended");
        rooms.delete(room.code);
        needsBroadcast = true;
        break;
      }
      if(room.players.has(socket.id)){
        room.players.delete(socket.id);
        broadcastState(room);
        needsBroadcast = true;
      }
    }
    if (needsBroadcast) {
      broadcastPublicRooms(); // Update public list when players leave or rooms are deleted
    }
  });
});

server.listen(PORT, ()=> {
  console.log(`✅ Multiplayer Quick-Quiz server running on http://localhost:${PORT}`);
});