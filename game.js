const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

const keys = {};
addEventListener('keydown', e => keys[e.code] = true);
addEventListener('keyup', e => keys[e.code] = false);

function wrap(obj) {
  if (obj.x < 0) obj.x += W;
  if (obj.x > W) obj.x -= W;
  if (obj.y < 0) obj.y += H;
  if (obj.y > H) obj.y -= H;
}

// --- Nave ---
const ship = {
  x: W / 2, y: H / 2, angle: -Math.PI / 2,
  vx: 0, vy: 0,
  radius: 12,
  thrust: 0.15,
  friction: 0.99,
  turnSpeed: 0.06,
  shootCooldown: 0
};

function updateShip() {
  if (keys['ArrowLeft'] || keys['KeyA']) ship.angle -= ship.turnSpeed;
  if (keys['ArrowRight'] || keys['KeyD']) ship.angle += ship.turnSpeed;
  if (keys['ArrowUp'] || keys['KeyW']) {
    ship.vx += Math.cos(ship.angle) * ship.thrust;
    ship.vy += Math.sin(ship.angle) * ship.thrust;
  }

  ship.vx *= ship.friction;
  ship.vy *= ship.friction;
  ship.x += ship.vx;
  ship.y += ship.vy;
  wrap(ship);

  if (ship.shootCooldown > 0) ship.shootCooldown--;
  if (keys['Space'] && ship.shootCooldown === 0) {
    shoot();
    ship.shootCooldown = 15;
  }
}

function drawShip() {
  const { x, y, angle, radius } = ship;
  ctx.strokeStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
  ctx.lineTo(x + Math.cos(angle + 2.5) * radius, y + Math.sin(angle + 2.5) * radius);
  ctx.lineTo(x + Math.cos(angle - 2.5) * radius, y + Math.sin(angle - 2.5) * radius);
  ctx.closePath();
  ctx.stroke();
}

// --- Disparos ---
const bullets = [];

function shoot() {
  bullets.push({
    x: ship.x + Math.cos(ship.angle) * ship.radius,
    y: ship.y + Math.sin(ship.angle) * ship.radius,
    vx: Math.cos(ship.angle) * 6,
    vy: Math.sin(ship.angle) * 6,
    life: 60
  });
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx;
    b.y += b.vy;
    b.life--;
    wrap(b);
    if (b.life <= 0) bullets.splice(i, 1);
  }
}

function drawBullets() {
  ctx.fillStyle = '#fff';
  for (const b of bullets) {
    ctx.fillRect(b.x - 1, b.y - 1, 2, 2);
  }
}

// --- Meteoritos ---
const asteroids = [];

function createAsteroid(x, y) {
  const radius = 20 + Math.random() * 20;
  const sides = 6 + Math.floor(Math.random() * 5);
  const vertices = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    const r = radius * (0.7 + Math.random() * 0.3);
    vertices.push({ a, r });
  }
  const dir = Math.random() * Math.PI * 2;
  const speed = 0.5 + Math.random() * 1.5;
  return {
    x, y, radius, vertices,
    vx: Math.cos(dir) * speed,
    vy: Math.sin(dir) * speed,
    angle: 0,
    spin: (Math.random() - 0.5) * 0.02
  };
}

function spawnAsteroidAwayFromShip() {
  let x, y;
  do {
    x = Math.random() * W;
    y = Math.random() * H;
  } while (Math.hypot(x - ship.x, y - ship.y) < 150);
  asteroids.push(createAsteroid(x, y));
}

for (let i = 0; i < 5; i++) spawnAsteroidAwayFromShip();

function updateAsteroids() {
  for (const a of asteroids) {
    a.x += a.vx;
    a.y += a.vy;
    a.angle += a.spin;
    wrap(a);
  }
}

function drawAsteroids() {
  ctx.strokeStyle = '#fff';
  for (const a of asteroids) {
    ctx.beginPath();
    a.vertices.forEach((v, i) => {
      const px = a.x + Math.cos(v.a + a.angle) * v.r;
      const py = a.y + Math.sin(v.a + a.angle) * v.r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.stroke();
  }
}

// --- Colisiones ---
function checkCollisions() {
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const a = asteroids[i];

    for (let j = bullets.length - 1; j >= 0; j--) {
      const b = bullets[j];
      if (Math.hypot(a.x - b.x, a.y - b.y) < a.radius) {
        asteroids.splice(i, 1);
        bullets.splice(j, 1);
        spawnAsteroidAwayFromShip();
        break;
      }
    }
  }

  for (const a of asteroids) {
    if (Math.hypot(a.x - ship.x, a.y - ship.y) < a.radius + ship.radius) {
      ship.x = W / 2;
      ship.y = H / 2;
      ship.vx = 0;
      ship.vy = 0;
    }
  }
}

// --- Loop principal ---
function loop() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  updateShip();
  updateBullets();
  updateAsteroids();
  checkCollisions();

  drawShip();
  drawBullets();
  drawAsteroids();

  requestAnimationFrame(loop);
}

loop();
