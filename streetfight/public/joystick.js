let joystick = { x: 0, y: 0, active: false };

window.addEventListener("touchstart", (e) => {
  joystick.active = true;
  joystick.x = e.touches[0].clientX;
  joystick.y = e.touches[0].clientY;
});

window.addEventListener("touchmove", (e) => {
  if (!joystick.active) return;
  const dx = e.touches[0].clientX - joystick.x;
  const dy = e.touches[0].clientY - joystick.y;

  player.x += dx * 0.1;
  player.y += dy * 0.1;

  joystick.x = e.touches[0].clientX;
  joystick.y = e.touches[0].clientY;

  sendPosition();
});

window.addEventListener("touchend", () => {
  joystick.active = false;
});