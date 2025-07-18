const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const ballsLeftDisplay = document.getElementById('balls-left');
const restartBtn = document.getElementById('restart-btn');


// canvas 固定 550x600，內容座標不縮放，RWD 只靠 CSS
canvas.width = 550;
canvas.height = 600;

// 滑鼠與觸控事件：螢幕座標自動換算成 canvas 內座標
function getCanvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if (e.touches) {
        x = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
        y = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);
    } else {
        x = (e.clientX - rect.left) * (canvas.width / rect.width);
        y = (e.clientY - rect.top) * (canvas.height / rect.height);
    }
    return { x, y };
}

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

// 彈珠對象
class Ball {
    constructor(x, y, r, color) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.color = color;
        this.vx = 0;
        this.vy = 0;
        this.gravity = 1.2; // 維持較大重力
        this.friction = 0.98;
        this.restitution = 0.45; // 降低彈性，彈跳不會太快
        this.inLauncher = true;
        this.inArc = false; // 是否在圓弧導軌
        this.inPlay = false; // 是否進入釘子區
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
let ball = new Ball(LAUNCHER_X + LAUNCHER_WIDTH / 2, LAUNCHER_BASE_Y, 10, '#555'); // 彈珠初始位置上移
let ballsLeft = 10;

// 釘子定義 (x, y, radius) - 調整 x 座標以適應新的畫布寬度，並重新佈局以更像圖片
const pegs = [
    // 頂部弧形區域下方的第一排釘子 (更分散)
    { x: 50, y: 100, r: 5 }, { x: 150, y: 100, r: 5 }, { x: 250, y: 100, r: 5 }, { x: 350, y: 100, r: 5 }, { x: 450, y: 100, r: 5 },
    // 第二排
    { x: 75, y: 150, r: 5 }, { x: 175, y: 150, r: 5 }, { x: 275, y: 150, r: 5 }, { x: 375, y: 150, r: 5 },
    // 第三排
    { x: 50, y: 200, r: 5 }, { x: 150, y: 200, r: 5 }, { x: 250, y: 200, r: 5 }, { x: 350, y: 200, r: 5 }, { x: 450, y: 200, r: 5 },
    // 第四排
    { x: 75, y: 250, r: 5 }, { x: 175, y: 250, r: 5 }, { x: 275, y: 250, r: 5 }, { x: 375, y: 250, r: 5 },
    // 第五排
    { x: 50, y: 300, r: 5 }, { x: 150, y: 300, r: 5 }, { x: 250, y: 300, r: 5 }, { x: 350, y: 300, r: 5 }, { x: 450, y: 300, r: 5 },
    // 第六排
    { x: 75, y: 350, r: 5 }, { x: 175, y: 350, r: 5 }, { x: 275, y: 350, r: 5 }, { x: 375, y: 350, r: 5 },
    // 第七排
    { x: 50, y: 400, r: 5 }, { x: 150, y: 400, r: 5 }, { x: 250, y: 400, r: 5 }, { x: 350, y: 400, r: 5 }, { x: 450, y: 400, r: 5 },
    // 第八排
    { x: 75, y: 450, r: 5 }, { x: 175, y: 450, r: 5 }, { x: 275, y: 450, r: 5 }, { x: 375, y: 450, r: 5 },
];

// 分數槽定義 (x, y, width, height, scoreValue) - 調整 x 座標和寬度
const scoreZones = [
    { x: 0, y: 550, w: 100, h: 40, score: 50 },
    { x: 100, y: 550, w: 100, h: 40, score: 30 },
    { x: 200, y: 550, w: 100, h: 40, score: 20 },
    { x: 300, y: 550, w: 100, h: 40, score: 10 },
    { x: 400, y: 550, w: 100, h: 40, score: 0 },
];

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 發射軌道直線
    ctx.fillStyle = '#e9d7b7';
    ctx.fillRect((LAUNCHER_X + LAUNCHER_WIDTH * 0.25), LAUNCHER_Y_END, LAUNCHER_WIDTH * 0.5, (LAUNCHER_Y_START - LAUNCHER_Y_END));
    // 外框
    ctx.save();
    ctx.strokeStyle = '#e0c9a6';
    ctx.lineWidth = 16;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    // 發射器區域的左側邊界
    ctx.beginPath();
    ctx.moveTo(GAME_AREA_WIDTH, 0);
    ctx.lineTo(GAME_AREA_WIDTH, canvas.height);
    ctx.strokeStyle = '#e0c9a6';
    ctx.lineWidth = 6;
    ctx.stroke();
    // 拉桿
    if (ball && ball.inLauncher) {
        ctx.fillStyle = '#d2b48c';
        ctx.fillRect((LAUNCHER_X + LAUNCHER_WIDTH / 2 - 12), (ball.y + ball.r + 5), 24, 36);
        ctx.strokeStyle = '#a67c52';
        ctx.lineWidth = 3;
        ctx.strokeRect((LAUNCHER_X + LAUNCHER_WIDTH / 2 - 12), (ball.y + ball.r + 5), 24, 36);
    }
    // 釘子
    ctx.fillStyle = '#e0c9a6';
    ctx.strokeStyle = '#a67c52';
    pegs.forEach(peg => {
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, peg.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    });
    // 分數槽
    scoreZones.forEach(zone => {
        ctx.strokeStyle = '#a67c52';
        ctx.lineWidth = 3;
        ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
        ctx.fillStyle = '#e9d7b7';
        ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
        ctx.fillStyle = '#a67c52';
        ctx.font = `${18}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(zone.score, (zone.x + zone.w / 2), (zone.y + zone.h / 2 + 7));
    });
    // 彈珠
    if (ball) {
        ball.draw();
    }
}

// Ball 類別 draw() 也要乘 globalScale
Ball.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
};

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
    const { x: mouseX, y: mouseY } = getCanvasPos(e);
    if (!gameRunning && mouseX > LAUNCHER_X && ballsLeft > 0 && ball && ball.inLauncher) {
        isDragging = true;
        startY = mouseY;
    }
});
canvas.addEventListener('mousemove', (e) => {
    if (isDragging && ball && ball.inLauncher) {
        const { y: mouseY } = getCanvasPos(e);
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
    const { x: touchX, y: touchY } = getCanvasPos(e);
    if (!gameRunning && touchX > LAUNCHER_X && ballsLeft > 0 && ball && ball.inLauncher) {
        isDragging = true;
        startY = touchY;
        e.preventDefault();
    }
});
canvas.addEventListener('touchmove', (e) => {
    if (isDragging && ball && ball.inLauncher) {
        const { y: touchY } = getCanvasPos(e);
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