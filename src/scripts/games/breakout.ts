let initialized = false;
let keyBuffer: { key: string; time: number }[] = [];
let overlayEl: HTMLElement | null = null;
let canvasEl: HTMLCanvasElement | null = null;
let animFrameId: number | null = null;
let keydownHandler: ((e: KeyboardEvent) => void) | null = null;

const TRIGGER = ['b', 'r', 'e', 'a', 'k'];
const COLS = 8;
const ROWS = 6;
const BRICK_PADDING = 4;

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  launched: boolean;
}

interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  alive: boolean;
  color: string;
}

function getAccentColors(): string[] {
  const style = getComputedStyle(document.documentElement);
  return [
    style.getPropertyValue('--accent').trim() || '#5bcdec',
    style.getPropertyValue('--accent-blue').trim() || '#58a6ff',
    style.getPropertyValue('--accent-mint').trim() || '#3fb950',
    style.getPropertyValue('--accent-tertiary').trim() || '#ff6b6b',
  ];
}

function startGame(): void {
  // Create overlay if not exists
  if (!overlayEl) {
    overlayEl = document.createElement('div');
    overlayEl.className = 'breakout-overlay';
    overlayEl.innerHTML = `
      <button class="breakout-close" id="breakoutClose">ESC</button>
      <span class="breakout-score" id="breakoutScore">Score: 0</span>
      <canvas id="breakoutCanvas"></canvas>
    `;
    document.body.appendChild(overlayEl);
  }
  overlayEl.classList.add('active');
  canvasEl = document.getElementById('breakoutCanvas') as HTMLCanvasElement;
  if (!canvasEl) return;

  const ctxRaw = canvasEl.getContext('2d');
  if (!ctxRaw) return;
  const ctx = ctxRaw;

  const W = Math.min(window.innerWidth * 0.9, 800);
  const H = Math.min(window.innerHeight * 0.8, 600);
  canvasEl.width = W;
  canvasEl.height = H;
  canvasEl.style.borderRadius = '8px';

  const colors = getAccentColors();
  let score = 0;
  const scoreEl = document.getElementById('breakoutScore');

  // Create bricks
  const brickW = (W - BRICK_PADDING * (COLS + 1)) / COLS;
  const brickH = 20;
  const bricks: Brick[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      bricks.push({
        x: BRICK_PADDING + c * (brickW + BRICK_PADDING),
        y: 40 + r * (brickH + BRICK_PADDING),
        w: brickW,
        h: brickH,
        alive: true,
        color: colors[r % colors.length],
      });
    }
  }

  // Paddle
  const paddle: Paddle = {
    x: W / 2 - 50,
    y: H - 30,
    width: 100,
    height: 12,
  };

  // Ball
  const ball: Ball = {
    x: W / 2,
    y: paddle.y - 8,
    vx: 4,
    vy: -4,
    radius: 6,
    launched: false,
  };

  // Mouse/touch tracking
  function onMove(clientX: number): void {
    const rect = canvasEl?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left;
    paddle.x = Math.max(0, Math.min(W - paddle.width, x - paddle.width / 2));
    if (!ball.launched) {
      ball.x = paddle.x + paddle.width / 2;
    }
  }

  const moveHandler = (e: MouseEvent) => onMove(e.clientX);
  const touchHandler = (e: TouchEvent) => {
    e.preventDefault();
    onMove(e.touches[0].clientX);
  };
  const clickHandler = () => {
    if (!ball.launched) ball.launched = true;
  };

  canvasEl.addEventListener('mousemove', moveHandler);
  canvasEl.addEventListener('touchmove', touchHandler, { passive: false });
  canvasEl.addEventListener('click', clickHandler);

  // Close handlers
  const closeBtn = document.getElementById('breakoutClose');
  const closeGame = () => {
    overlayEl?.classList.remove('active');
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    canvasEl?.removeEventListener('mousemove', moveHandler);
    canvasEl?.removeEventListener('touchmove', touchHandler);
    canvasEl?.removeEventListener('click', clickHandler);
  };
  closeBtn?.addEventListener('click', closeGame);

  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && overlayEl?.classList.contains('active')) {
      closeGame();
    }
  };
  window.addEventListener('keydown', escHandler);

  // Achievement dispatch
  let achievementSent = false;
  // Breakout found achievement
  try {
    window.dispatchEvent(new CustomEvent('achievement-trigger', { detail: 'breakout_found' }));
  } catch {
    /* noop */
  }

  function drawBricks(): void {
    for (const b of bricks) {
      if (!b.alive) continue;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, 3);
      ctx.fill();
    }
  }

  function drawPaddle(): void {
    ctx.fillStyle = colors[0];
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 6);
    ctx.fill();
  }

  function drawBall(): void {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function handleWallCollision(): void {
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > W) ball.vx = -ball.vx;
    if (ball.y - ball.radius < 0) ball.vy = -ball.vy;
  }

  function handleBallReset(): void {
    ball.launched = false;
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ball.radius;
    ball.vy = -4;
    ball.vx = 4 * (Math.random() > 0.5 ? 1 : -1);
  }

  function handlePaddleCollision(): void {
    if (
      ball.y + ball.radius > paddle.y &&
      ball.y - ball.radius < paddle.y + paddle.height &&
      ball.x > paddle.x &&
      ball.x < paddle.x + paddle.width
    ) {
      ball.vy = -Math.abs(ball.vy);
      const hitPos = (ball.x - paddle.x) / paddle.width - 0.5;
      ball.vx = hitPos * 8;
    }
  }

  function handleBrickCollision(): void {
    for (const b of bricks) {
      if (!b.alive) continue;
      if (
        ball.x + ball.radius > b.x &&
        ball.x - ball.radius < b.x + b.w &&
        ball.y + ball.radius > b.y &&
        ball.y - ball.radius < b.y + b.h
      ) {
        b.alive = false;
        ball.vy = -ball.vy;
        score++;
        if (scoreEl) scoreEl.textContent = `Score: ${score}`;
        break;
      }
    }
  }

  function checkWin(): void {
    if (!achievementSent && bricks.every((b) => !b.alive)) {
      achievementSent = true;
      try {
        window.dispatchEvent(new CustomEvent('achievement-trigger', { detail: 'breakout_winner' }));
      } catch {
        /* noop */
      }
    }
  }

  function gameLoop(): void {
    if (!ctx || !canvasEl) return;

    ctx.clearRect(0, 0, W, H);
    drawBricks();
    drawPaddle();
    drawBall();

    if (ball.launched) {
      ball.x += ball.vx;
      ball.y += ball.vy;
      handleWallCollision();
      if (ball.y + ball.radius > H) handleBallReset();
      handlePaddleCollision();
      handleBrickCollision();
      checkWin();
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.fillText('Click to launch \u2022 ESC to exit', W / 2 - 100, H - 8);

    animFrameId = requestAnimationFrame(gameLoop);
  }

  animFrameId = requestAnimationFrame(gameLoop);
}

export function initBreakout(): void {
  if (initialized) return;
  initialized = true;

  keydownHandler = (e: KeyboardEvent) => {
    const now = Date.now();
    keyBuffer.push({ key: e.key.toLowerCase(), time: now });
    // Keep only recent keys
    keyBuffer = keyBuffer.filter((k) => now - k.time < 2000);
    // Check trigger
    if (keyBuffer.length >= TRIGGER.length) {
      const last = keyBuffer.slice(-TRIGGER.length);
      if (last.every((k, i) => k.key === TRIGGER[i])) {
        keyBuffer = [];
        startGame();
      }
    }
  };
  window.addEventListener('keydown', keydownHandler);
}

export function destroyBreakout(): void {
  if (keydownHandler) {
    window.removeEventListener('keydown', keydownHandler);
    keydownHandler = null;
  }
  if (animFrameId !== null) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  if (overlayEl) {
    overlayEl.remove();
    overlayEl = null;
  }
  canvasEl = null;
  keyBuffer = [];
  initialized = false;
}
