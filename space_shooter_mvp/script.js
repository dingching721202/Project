const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 設置 canvas 尺寸
canvas.width = 480;
canvas.height = 640;

// 遊戲狀態變數
let gameRunning = true;
let score = 0;
let lives = 3;
let screenShake = 0; // 畫面震動效果
let explosions = []; // 爆炸效果陣列

// 玩家飛機屬性
const player = {
    x: canvas.width / 2 - 25, // 初始位置中心偏左
    y: canvas.height - 60,    // 初始位置底部偏上
    width: 50,
    height: 50,
    speed: 5,
    bullets: []
};

// 子彈屬性
const bullet = {
    width: 5,
    height: 15,
    speed: 7
};

// 敵人屬性
const enemy = {
    width: 40,
    height: 40,
    speed: 2.5,
    list: []
};

// 鍵盤狀態
// 繪製爆炸效果
function drawExplosions() {
    explosions.forEach((explosion, index) => {
        ctx.beginPath();
        // 根據爆炸的存在時間改變顏色和大小
        ctx.fillStyle = `rgba(255, ${255 - explosion.frame * 25}, 0, ${1 - explosion.frame / 10})`;
        ctx.arc(explosion.x, explosion.y, explosion.radius * (1 + explosion.frame/3), 0, Math.PI * 2);
        ctx.fill();
        
        // 更新爆炸幀數
        explosion.frame++;
        
        // 移除已完成的爆炸
        if (explosion.frame > 10) {
            explosions.splice(index, 1);
        }
    });
}

// 繪製玩家飛機
function drawPlayer() {
    // 應用屏幕震動效果
    const shakeX = screenShake > 0 ? (Math.random() * screenShake * 2 - screenShake) : 0;
    const shakeY = screenShake > 0 ? (Math.random() * screenShake * 2 - screenShake) : 0;
    
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    // 以 player.x 和 player.y 為中心繪製三角形，加上震動效果
    ctx.moveTo(player.x + shakeX, player.y - player.height / 2 + shakeY);
    ctx.lineTo(player.x - player.width / 2 + shakeX, player.y + player.height / 2 + shakeY);
    ctx.lineTo(player.x + player.width / 2 + shakeX, player.y + player.height / 2 + shakeY);
    ctx.closePath();
    ctx.fill();
    
    // 衰減屏幕震動
    if (screenShake > 0) {
        screenShake -= 0.2;
    }
}

// 繪製子彈
function drawBullets() {
    ctx.fillStyle = 'yellow';
    player.bullets.forEach(b => {
        ctx.fillRect(b.x, b.y, bullet.width, bullet.height);
    });
}

// 繪製敵人
function drawEnemies() {
    ctx.fillStyle = 'red';
    enemy.list.forEach(e => {
        ctx.beginPath();
        ctx.arc(e.x + e.width / 2, e.y + e.height / 2, e.width / 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

// 更新遊戲狀態
function update() {
    if (!gameRunning) return;

    // 子彈移動
    player.bullets = player.bullets.filter(b => b.y > 0);
    player.bullets.forEach(b => {
        b.y -= bullet.speed;
    });

    // 敵人移動
    enemy.list.forEach(e => {
        e.y += enemy.speed;
    });

    // 移除超出螢幕的敵人
    enemy.list = enemy.list.filter(e => e.y < canvas.height);

    // 碰撞偵測 (玩家子彈 vs 敵人)
    player.bullets.forEach((b, bulletIndex) => {
        enemy.list.forEach((e, enemyIndex) => {
            if (b.x < e.x + enemy.width &&
                b.x + bullet.width > e.x &&
                b.y < e.y + enemy.height &&
                b.y + bullet.height > e.y) {
                // 碰撞發生
                player.bullets.splice(bulletIndex, 1); // 移除子彈
                enemy.list.splice(enemyIndex, 1);     // 移除敵人
                score += 10; // 增加分數
            }
        });
    });

    // 碰撞偵測 (玩家 vs 敵人)
     enemy.list.forEach((e, enemyIndex) => {
         if (player.x < e.x + enemy.width &&
             player.x + player.width > e.x &&
             player.y < e.y + enemy.height &&
             player.y + player.height > e.y) {
             // 碰撞發生
             enemy.list.splice(enemyIndex, 1); // 移除敵人
             lives--; // 減少生命值
             
             // 添加爆炸效果
             explosions.push({
                 x: e.x + e.width / 2,
                 y: e.y + e.height / 2,
                 radius: Math.max(e.width, e.height) / 2,
                 frame: 0
             });
             
             // 添加屏幕震動效果
             screenShake = 5;
             
             // 當生命值為0時，遊戲結束
             if (lives <= 0) {
                 gameRunning = false;
                 // 添加更大的爆炸效果
                 explosions.push({
                     x: player.x,
                     y: player.y,
                     radius: player.width,
                     frame: 0
                 });
                 screenShake = 10;
                 
                 setTimeout(() => {
                     alert('遊戲結束! 得分: ' + score);
                     // 重置遊戲
                     lives = 3;
                     score = 0;
                     enemy.list = [];
                     player.bullets = [];
                     explosions = [];
                     gameRunning = true;
                 }, 1000);
             }
         }
     });

    // 簡單的敵人生成 (每隔一段時間生成一批)
    if (Math.random() < 0.05 && enemy.list.length < 15) { // 調整生成機率和最大敵人數量
        enemy.list.push({
            x: Math.random() * (canvas.width - enemy.width),
            y: 0,
            width: enemy.width,
            height: enemy.height,
            speed: enemy.speed
        });
    }

    // 更新得分和生命顯示 (MVP 階段暫不繪製，只更新變數)
}

// 遊戲循環
function gameLoop() {
    // 清空畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    update();
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawExplosions(); // 繪製爆炸效果

    // 繪製得分和生命
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 20);
    ctx.fillText('Lives: ' + lives, canvas.width - 80, 20);

    requestAnimationFrame(gameLoop);
}

// 玩家射擊事件 (按下空白鍵)
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' && gameRunning) {
        // 限制子彈數量，避免一次發射太多
        if (player.bullets.length < 5) { // 限制螢幕上最多有 5 顆子彈
             player.bullets.push({
                 x: player.x + player.width / 2 - bullet.width / 2,
                 y: player.y,
                 width: bullet.width,
                 height: bullet.height,
                 speed: bullet.speed
             });
        }
    }
});

// 滑鼠移動控制
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    player.x = e.clientX - rect.left;
    player.y = e.clientY - rect.top;

    // 限制玩家飛機在畫布範圍內
    if (player.x < player.width / 2) player.x = player.width / 2;
    if (player.x > canvas.width - player.width / 2) player.x = canvas.width - player.width / 2;
    if (player.y < player.height / 2) player.y = player.height / 2;
    if (player.y > canvas.height - player.height / 2) player.y = canvas.height - player.height / 2;
});

// 滑鼠點擊發射子彈
canvas.addEventListener('click', () => {
    if (!gameRunning) return;
    
    // 限制子彈數量，避免一次發射太多
    if (player.bullets.length < 5) { // 限制螢幕上最多有 5 顆子彈
        player.bullets.push({
            x: player.x - bullet.width / 2,
            y: player.y - player.height / 2,
            width: bullet.width,
            height: bullet.height,
            speed: bullet.speed
        });
    }
});

// 開始遊戲循環
gameLoop();