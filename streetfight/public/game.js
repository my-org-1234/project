const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = { x: 200, y: 200, health: 100, punching: false };
let others = {};
let win = false;

document.getElementById("punchBtn").addEventListener("click", () => {
  player.punching = true;
  setTimeout(() => (player.punching = false), 200);

  for (let id in others) {
    const p = others[id];
    const dx = p.x - player.x;
    const dy = p.y - player.y;
    if (Math.abs(dx) < 60 && Math.abs(dy) < 60) {
      socket.emit("punch", id);
    }
  }
});

socket.emit("playerMovement", player);

function sendPosition() {
  socket.emit("playerMovement", player);
}

socket.on("currentPlayers", (players) => {
  for (let id in players) {
    if (id !== socket.id) others[id] = players[id];
  }
});

socket.on("newPlayer", (data) => {
  others[data.id] = data;
});

socket.on("playerMoved", (data) => {
  if (data.id !== socket.id) others[data.id] = data;
});

socket.on("playerDisconnected", (id) => {
  delete others[id];
});

socket.on("updateHealth", ({ id, health }) => {
  if (others[id]) others[id].health = health;
});

socket.on("playerDefeated", (id) => {
  if (id !== socket.id) {
    document.getElementById("winText").classList.remove("hidden");
    win = true;
  }
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "blue";
  ctx.fillRect(player.x, player.y, 50, 50);
  ctx.fillStyle = "red";
  ctx.fillRect(player.x, player.y - 10, player.health / 2, 5);

  for (let id in others) {
    let p = others[id];
    ctx.fillStyle = "green";
    ctx.fillRect(p.x, p.y, 50, 50);
    ctx.fillStyle = "orange";
    ctx.fillRect(p.x, p.y - 10, p.health / 2, 5);
  }

  requestAnimationFrame(draw);
}
draw();