// ---- Animated Canvas Background ----
const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let W, H;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);
window.addEventListener("mousemove", e => { mouse.x = e.clientX; mouse.y = e.clientY; });

// Colour palette — warm amber / coral / rose / teal
const PALETTE = [
  [255, 180,  80],  // amber
  [255, 110,  90],  // coral
  [220,  60, 120],  // rose
  [ 60, 190, 180],  // teal
  [255, 210, 100],  // gold
  [255, 140, 160],  // blush
];

class Orb {
  constructor() { this.reset(true); }
  reset(initial = false) {
    this.x  = Math.random() * W;
    this.y  = initial ? Math.random() * H : H + 100;
    this.r  = 60 + Math.random() * 180;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = -(0.15 + Math.random() * 0.35);
    this.color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    this.alpha = 0.04 + Math.random() * 0.08;
    this.pulse = Math.random() * Math.PI * 2;
  }
  update() {
    this.pulse += 0.012;
    this.x += this.vx + (mouse.x / W - 0.5) * 0.08;
    this.y += this.vy;
    if (this.y + this.r < -100) this.reset();
  }
  draw() {
    const pr = this.r + Math.sin(this.pulse) * (this.r * 0.08);
    const g  = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, pr);
    const [r, g2, b] = this.color;
    g.addColorStop(0,   `rgba(${r},${g2},${b},${this.alpha})`);
    g.addColorStop(0.5, `rgba(${r},${g2},${b},${this.alpha * 0.5})`);
    g.addColorStop(1,   `rgba(${r},${g2},${b},0)`);
    ctx.beginPath();
    ctx.arc(this.x, this.y, pr, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  }
}

class Particle {
  constructor() { this.reset(true); }
  reset(initial = false) {
    this.x   = Math.random() * W;
    this.y   = initial ? Math.random() * H : H + 8;
    this.r   = 1 + Math.random() * 2.5;
    this.vx  = (Math.random() - 0.5) * 0.6;
    this.vy  = -(0.4 + Math.random() * 0.8);
    this.color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    this.alpha = 0.3 + Math.random() * 0.5;
    this.life  = 0;
    this.maxLife = 200 + Math.random() * 300;
  }
  update() {
    this.life++;
    this.x  += this.vx;
    this.y  += this.vy;
    this.vx += (mouse.x / W - 0.5) * 0.003;
    if (this.life > this.maxLife || this.y < -10) this.reset();
  }
  draw() {
    const fade = Math.min(1, (this.maxLife - this.life) / 60) * this.alpha;
    const [r, g, b] = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${fade})`;
    ctx.fill();
  }
}

const orbs       = Array.from({ length: 14 }, () => new Orb());
const particles  = Array.from({ length: 90 }, () => new Particle());

let hue = 0;
function frame() {
  // dark warm base
  ctx.fillStyle = "rgba(12, 8, 18, 0.18)";
  ctx.fillRect(0, 0, W, H);

  orbs.forEach(o => { o.update(); o.draw(); });
  particles.forEach(p => { p.update(); p.draw(); });

  // subtle scanline shimmer at top
  const sweep = ctx.createLinearGradient(0, 0, W, 0);
  hue = (hue + 0.3) % 360;
  sweep.addColorStop(0,   "rgba(0,0,0,0)");
  sweep.addColorStop(0.5, `hsla(${hue},80%,70%,0.015)`);
  sweep.addColorStop(1,   "rgba(0,0,0,0)");
  ctx.fillStyle = sweep;
  ctx.fillRect(0, 0, W, 2);

  requestAnimationFrame(frame);
}
frame();