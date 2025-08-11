const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let players = {};

io.on('connection', (socket) => {
  players[socket.id] = {
    x: 100,
    y: 200,
    health: 100,
    punching: false
  };

  socket.emit('currentPlayers', players);
  socket.broadcast.emit('newPlayer', { id: socket.id, ...players[socket.id] });

  socket.on('playerMovement', (data) => {
    if (players[socket.id]) {
      players[socket.id] = { ...players[socket.id], ...data };
      socket.broadcast.emit('playerMoved', { id: socket.id, ...players[socket.id] });
    }
  });

  socket.on('punch', (targetId) => {
    if (players[targetId]) {
      players[targetId].health -= 10;
      if (players[targetId].health <= 0) {
        io.emit('playerDefeated', targetId);
        players[targetId].health = 0;
      }
      io.emit('updateHealth', { id: targetId, health: players[targetId].health });
    }
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));