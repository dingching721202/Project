const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const ballsLeftDisplay = document.getElementById('balls-left');
const restartBtn = document.getElementById('restart-btn');

canvas.width = 550; // 增加寬度以容納發射軌道和主遊戲區域
canvas.height = 600;

// 發射軌道參數
const LAUNCHER_WIDTH = 50;
const GAME_AREA_WIDTH = canvas.width - LAUNCHER_WIDTH;
const LAUNCHER_X = GAME_AREA_WIDTH;
const LAUNCHER_Y_START = 550;
const LAUNCHER_Y_END = 50;
const MAX_PULL_DISTANCE = 320; // 拉桿可拉更長
const ARC_RADIUS = 90; // 圓弧半徑加大
const ARC_CENTER_X = LAUNCHER_X + LAUNCHER_WIDTH / 2;
const ARC_CENTER_Y = LAUNCHER_Y_END + ARC_RADIUS + 20; // 圓心下移讓圓弧更圓滑

// 計算發射軌道下方三分之一再往下 40px
const LAUNCHER_BASE_Y = LAUNCHER_Y_START - Math.floor((LAUNCHER_Y_START - LAUNCHER_Y_END) / 3) + 40;

// 釘子定義（6排，每排間距約140px，左右邊界預留）
const PEG_ROWS = 6;
const PEG_COLS = 7;
const PEG_RADIUS = 22;
const PEG_X_START = GAME_LEFT + 40;
const PEG_X_END = GAME_RIGHT - 40;
const PEG_Y_START = GAME_TOP + 120;
const PEG_Y_GAP = 140;
let pegs = [];
for (let row = 0; row < PEG_ROWS; row++) {
    let cols = PEG_COLS - (row % 2);
    let xGap = (PEG_X_END - PEG_X_START) / (cols - 1);
    let y = PEG_Y_START + row * PEG_Y_GAP;
    for (let col = 0; col < cols; col++) {
        let x = PEG_X_START + col * xGap + (row % 2 ? xGap / 2 : 0);
        pegs.push({ x, y, r: PEG_RADIUS });
    }
}

// 分數槽定義（底部5格，寬度等分）
const SCORE_ZONE_COUNT = 5;
const SCORE_ZONE_HEIGHT = 120;
const SCORE_ZONE_Y = DESIGN_HEIGHT - SCORE_ZONE_HEIGHT;
const SCORE_ZONE_W = Math.floor(GAME_WIDTH / SCORE_ZONE_COUNT);
const scoreZones = Array.from({ length: SCORE_ZONE_COUNT }, (_, i) => ({
    x: GAME_LEFT + i * SCORE_ZONE_W,
    y: SCORE_ZONE_Y,
    w: SCORE_ZONE_W,
    h: SCORE_ZONE_HEIGHT,
    score: [100, 50, 20, 10, 0][i]
}));

// 彈珠對象
class Ball {
    constructor(x, y, r, color) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.color = color;
        this.vx = 0;
        this.vy = 0;
        this.gravity = 2.2; // 依新尺寸調整重力
        this.friction = 0.98;
        this.restitution = 0.45;
        this.inLauncher = true;
        this.inArc = false;
        this.inPlay = false;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        if (this.inLauncher) {
            this.x = LAUNCHER_X + LAUNCHER_WIDTH / 2;
            this.y = LAUNCHER_Y_START + pullDistance;
            return;
        }
        // 在發射軌道直線區
        if (!this.inArc && !this.inPlay) {
            this.x = LAUNCHER_X + LAUNCHER_WIDTH / 2;
            this.y += this.vy;
            // 到達圓弧入口
            if (this.y <= LAUNCHER_Y_END + ARC_RADIUS) {
                this.inArc = true;
                this.arcAngle = Math.PI / 2; // 從下往左上
                this.arcSpeed = Math.abs(this.vy) / ARC_RADIUS;
            }
            return;
        }
        // 在圓弧導軌
        if (this.inArc && !this.inPlay) {
            // 沿圓弧順時針移動
            this.arcAngle -= this.arcSpeed;
            if (this.arcAngle < 0) this.arcAngle = 0;
            this.x = ARC_CENTER_X + ARC_RADIUS * Math.cos(this.arcAngle);
            this.y = ARC_CENTER_Y + ARC_RADIUS * Math.sin(this.arcAngle);
            // 到達圓弧出口
            if (this.arcAngle <= 0) {
                this.inArc = false;
                this.inPlay = true;
                this.x = GAME_AREA_WIDTH - this.r - 2;
                this.y = LAUNCHER_Y_END + 2;
                this.vx = -Math.abs(this.vy) * 0.7; // 進入釘子區給較明顯的左向速度
                this.vy = Math.abs(this.vy) * 0.3;
            }
            return;
        }

        // 進入釘子區，正常物理
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        // 邊界碰撞檢測
        // 左邊界
        if (this.x - this.r < 0) {
            this.vx *= -this.restitution;
            this.x = this.r;
        }
        // 右邊界 (主遊戲區域的右邊界，不包括發射器)
        if (this.x + this.r > GAME_AREA_WIDTH) {
            this.vx *= -this.restitution;
            this.x = GAME_AREA_WIDTH - this.r;
        }
        // 頂部邊界
        if (this.y - this.r < 0) {
            this.vy *= -this.restitution;
            this.y = this.r;
        }

        // 底部邊界 (落入分數槽)
        if (this.y + this.r > canvas.height) {
            this.y = canvas.height - this.r;
            this.vy *= -this.restitution;
            this.vx *= this.friction; // 落地後水平速度減小
            for (let i = 0; i < scoreZones.length; i++) {
                const zone = scoreZones[i];
                if (this.x > zone.x && this.x < zone.x + zone.w) {
                    score += zone.score;
                    scoreDisplay.textContent = score;
                    gameRunning = false;
                    ballsLeft--;
                    ballsLeftDisplay.textContent = ballsLeft;
                    if (ballsLeft > 0) {
                        setTimeout(() => {
                            ball = new Ball(LAUNCHER_X + LAUNCHER_WIDTH / 2, LAUNCHER_BASE_Y, 10, '#555'); // 彈珠初始位置上移
                            pullDistance = 0;
                            drawGame();
                        }, 600);
                    } else {
                        ball = null;
                    }
                    break;
                }
            }
        }

        // 釘子碰撞檢測
        for (let i = 0; i < pegs.length; i++) {
            const peg = pegs[i];
            const dx = this.x - peg.x;
            const dy = this.y - peg.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.r + peg.r) {
                // 碰撞發生
                const angle = Math.atan2(dy, dx);
                const overlap = (this.r + peg.r) - distance;

                // 將彈珠移出釘子
                this.x += Math.cos(angle) * overlap;
                this.y += Math.sin(angle) * overlap;

                // 反彈
                const normalX = dx / distance;
                const normalY = dy / distance;
                const dotProduct = this.vx * normalX + this.vy * normalY;

                this.vx = (this.vx - 2 * dotProduct * normalX) * this.restitution;
                this.vy = (this.vy - 2 * dotProduct * normalY) * this.restitution;

                // 應用摩擦力
                this.vx *= this.friction;
                this.vy *= this.friction;
            }
        }
    }
}


// 遊戲參數
let score = 0;
const LAUNCHER_HEIGHT = 20;

// 遊戲狀態
let gameRunning = false;
let isDragging = false;
let startY = 0;
let pullDistance = 0;
let ball = new Ball(LAUNCHER_X + LAUNCHER_WIDTH / 2, LAUNCHER_BASE_Y, 28, '#555'); // 彈珠半徑放大
let ballsLeft = 10;

// drawGame 內釘子、分數槽繪製不變，會自動依新座標顯示

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 遊戲主區域外框
    ctx.save();
    ctx.strokeStyle = '#e0c9a6';
    ctx.lineWidth = 18;
    ctx.strokeRect(GAME_LEFT, GAME_TOP, GAME_WIDTH, GAME_HEIGHT + 40);
    ctx.restore();
    // 發射軌道直線
    ctx.fillStyle = '#e9d7b7';
    ctx.fillRect(LAUNCHER_X + LAUNCHER_WIDTH * 0.25, LAUNCHER_Y_END, LAUNCHER_WIDTH * 0.5, LAUNCHER_Y_START - LAUNCHER_Y_END);
    // 發射器區域的左側邊界
    ctx.beginPath();
    ctx.moveTo(LAUNCHER_X, GAME_TOP);
    ctx.lineTo(LAUNCHER_X, GAME_BOTTOM);
    ctx.strokeStyle = '#e0c9a6';
    ctx.lineWidth = 8;
    ctx.stroke();
    // 拉桿
    if (ball && ball.inLauncher) {
        ctx.fillStyle = '#d2b48c';
        ctx.fillRect(LAUNCHER_X + LAUNCHER_WIDTH / 2 - 22, ball.y + ball.r + 10, 44, 80);
        ctx.strokeStyle = '#a67c52';
        ctx.lineWidth = 5;
        ctx.strokeRect(LAUNCHER_X + LAUNCHER_WIDTH / 2 - 22, ball.y + ball.r + 10, 44, 80);
    }
    // 釘子
    ctx.fillStyle = '#e0c9a6';
    ctx.strokeStyle = '#a67c52';
    pegs.forEach(peg => {
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, peg.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();
    });
    // 分數槽
    scoreZones.forEach(zone => {
        ctx.strokeStyle = '#a67c52';
        ctx.lineWidth = 5;
        ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
        ctx.fillStyle = '#e9d7b7';
        ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
        ctx.fillStyle = '#a67c52';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(zone.score, zone.x + zone.w / 2, zone.y + zone.h / 2 + 24);
    });
    // 彈珠
    if (ball) {
        ball.draw();
    }
}

// 遊戲主循環
function gameLoop() {
    if (gameRunning && ball) {
        ball.update();
    }
    drawGame();
    requestAnimationFrame(gameLoop);
}

// 開始遊戲循環
gameLoop();

canvas.addEventListener('mousedown', (e) => {
    // 獲取滑鼠在 canvas 內的座標
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (!gameRunning && mouseX > LAUNCHER_X && ballsLeft > 0 && ball && ball.inLauncher) {
        isDragging = true;
        startY = mouseY;
    }
});
canvas.addEventListener('mousemove', (e) => {
    if (isDragging && ball && ball.inLauncher) {
        const rect = canvas.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        pullDistance = Math.max(0, Math.min(mouseY - startY, MAX_PULL_DISTANCE));
        ball.y = LAUNCHER_BASE_Y + pullDistance;
    }
});
canvas.addEventListener('mouseup', () => {
    if (isDragging && ball && ballsLeft > 0 && ball.inLauncher) {
        isDragging = false;
        if (pullDistance > 0) {
            gameRunning = true;
            ball.inLauncher = false;
            ball.vy = -pullDistance * 0.6;
        }
        pullDistance = 0;
    }
});
canvas.addEventListener('touchstart', (e) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    if (!gameRunning && touchX > LAUNCHER_X && ballsLeft > 0 && ball && ball.inLauncher) {
        isDragging = true;
        startY = touchY;
        e.preventDefault();
    }
});
canvas.addEventListener('touchmove', (e) => {
    if (isDragging && ball && ball.inLauncher) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const touchY = touch.clientY - rect.top;
        pullDistance = Math.max(0, Math.min(touchY - startY, MAX_PULL_DISTANCE));
        ball.y = LAUNCHER_BASE_Y + pullDistance;
        e.preventDefault();
    }
});
canvas.addEventListener('touchend', (e) => {
    if (isDragging && ball && ballsLeft > 0 && ball.inLauncher) {
        isDragging = false;
        if (pullDistance > 0) {
            gameRunning = true;
            ball.inLauncher = false;
            ball.vy = -pullDistance * 0.6;
        }
        pullDistance = 0;
        e.preventDefault();
    }
});

function resetGame() {
    score = 0;
    ballsLeft = 10;
    scoreDisplay.textContent = score;
    ballsLeftDisplay.textContent = ballsLeft;
    ball = new Ball(LAUNCHER_X + LAUNCHER_WIDTH / 2, LAUNCHER_BASE_Y, 10, '#555');
    gameRunning = false;
    pullDistance = 0;
}

restartBtn.addEventListener('click', resetGame);

// RWD：根據螢幕寬度自動調整 canvas 大小，並以設計尺寸為基準縮放
function resizeCanvas() {
    // 以高度為主，保留比例，確保手機直向不會橫向捲軸
    let height = Math.min(window.innerHeight, DESIGN_HEIGHT);
    let width = Math.round(height * (DESIGN_WIDTH / DESIGN_HEIGHT));
    if (width > window.innerWidth) {
        width = window.innerWidth;
        height = Math.round(width * (DESIGN_HEIGHT / DESIGN_WIDTH));
    }
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
}

window.addEventListener('resize', () => {
    resizeCanvas();
    drawGame();
});

// 初始化時也執行一次
resizeCanvas();