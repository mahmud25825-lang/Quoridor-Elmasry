const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { maxHttpBufferSize: 2e5 });

// ملفات اللعبة (index.html, style.css, script.js, three.min.js, howler.min.js, mp3) داخل مجلد public
app.use(express.static(path.join(__dirname, 'public')));

const rooms = new Map(); // code -> { np, players: [socketId...], hostId }

function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (rooms.has(code));
  return code;
}

io.on('connection', (socket) => {
  socket.on('createRoom', ({ np } = {}, cb) => {
    leaveRoom(socket);
    const code = makeCode();
    const n = Math.min(4, Math.max(2, parseInt(np) || 2));
    rooms.set(code, { np: n, players: [socket.id], hostId: socket.id });
    socket.join(code);
    socket.data.room = code;
    socket.data.pid = 0;
    cb && cb({ ok: true, code, playerId: 0, np: n });
    io.to(code).emit('roomUpdate', { count: 1, np: n });
  });

  socket.on('joinRoom', ({ code } = {}, cb) => {
    code = String(code || '').trim().toUpperCase();
    const room = rooms.get(code);
    if (!room) return cb && cb({ ok: false, error: 'الغرفة غير موجودة' });
    if (room.players.length >= room.np) return cb && cb({ ok: false, error: 'الغرفة ممتلئة' });
    leaveRoom(socket);
    const pid = room.players.length;
    room.players.push(socket.id);
    socket.join(code);
    socket.data.room = code;
    socket.data.pid = pid;
    cb && cb({ ok: true, code, playerId: pid, np: room.np });
    io.to(code).emit('roomUpdate', { count: room.players.length, np: room.np });
    if (room.players.length === room.np) io.to(code).emit('roomFull');
  });

  // نقل حالة اللعبة والتأثيرات لباقي اللاعبين في نفس الغرفة
  socket.on('state', (data) => {
    const code = socket.data.room;
    if (!code || typeof data !== 'object') return;
    socket.to(code).emit('state', data);
  });

  socket.on('impact', (data) => {
    const code = socket.data.room;
    if (!code || typeof data !== 'object') return;
    socket.to(code).emit('impact', { x: +data.x || 0, z: +data.z || 0 });
  });

  socket.on('disconnect', () => leaveRoom(socket));
});

function leaveRoom(socket) {
  const code = socket.data.room;
  if (!code) return;
  const room = rooms.get(code);
  socket.leave(code);
  socket.data.room = null;
  if (!room) return;
  io.to(code).emit('peerLeft');
  rooms.delete(code); // أي انسحاب ينهي الغرفة
  io.in(code).socketsLeave(code);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => console.log('Egypt Corridor server on http://localhost:' + PORT));
