const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const timeElement = document.getElementById('time');
const levelElement = document.getElementById('level');
const gameOverDiv = document.getElementById('gameOver');
const finalTimeElement = document.getElementById('finalTime');
const finalLevelElement = document.getElementById('finalLevel');
const restartBtn = document.getElementById('restartBtn');

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const barLength = 300;
const playerRadius = 15;

let gameRunning = false;
let playerX = 100; // 初期位置を左上に設定
let playerY = 100;
let bars = [];
let gameTime = 0;
let level = 1;
let animationId;

// バーの初期化
function initBars() {
    bars = [{
        angle: 0,
        rotationSpeed: 0.02,
        length: barLength
    }];
}

// キーボード入力
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// プレイヤーの更新
function updatePlayer() {
    const speed = 3;
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        playerX -= speed;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        playerX += speed;
    }
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        playerY -= speed;
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        playerY += speed;
    }

    // 画面外に出ないように
    playerX = Math.max(playerRadius, Math.min(canvas.width - playerRadius, playerX));
    playerY = Math.max(playerRadius, Math.min(canvas.height - playerRadius, playerY));
}

// バーの更新
function updateBars() {
    bars.forEach(bar => {
        bar.angle += bar.rotationSpeed;
    });

    // レベルに応じてバーの数を増やす
    const targetBarCount = Math.floor(gameTime / 10) + 1;
    if (bars.length < targetBarCount && bars.length < 3) {
        bars.push({
            angle: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() > 0.5 ? 1 : -1) * (0.02 + Math.random() * 0.02),
            length: barLength
        });
    }

    // レベル更新
    const newLevel = Math.floor(gameTime / 10) + 1;
    if (newLevel !== level) {
        level = newLevel;
        levelElement.textContent = level;
    }
}

// 点と線分の距離計算
function pointToLineDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
        param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

// 当たり判定
function checkCollision() {
    for (let bar of bars) {
        const halfLength = bar.length / 2;
        const cos = Math.cos(bar.angle);
        const sin = Math.sin(bar.angle);

        const x1 = centerX + cos * (-halfLength);
        const y1 = centerY + sin * (-halfLength);
        const x2 = centerX + cos * halfLength;
        const y2 = centerY + sin * halfLength;

        const distance = pointToLineDistance(playerX, playerY, x1, y1, x2, y2);
        
        if (distance < playerRadius) {
            return true;
        }
    }
    return false;
}

// 描画
function draw() {
    // 背景クリア
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // バーの描画
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    
    bars.forEach(bar => {
        const halfLength = bar.length / 2;
        const cos = Math.cos(bar.angle);
        const sin = Math.sin(bar.angle);

        ctx.beginPath();
        ctx.moveTo(
            centerX + cos * (-halfLength),
            centerY + sin * (-halfLength)
        );
        ctx.lineTo(
            centerX + cos * halfLength,
            centerY + sin * halfLength
        );
        ctx.stroke();
    });

    // プレイヤーの描画
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(playerX, playerY, playerRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ff00';
    ctx.fill();
    ctx.shadowBlur = 0;
}

// ゲームループ
function gameLoop() {
    if (!gameRunning) return;

    updatePlayer();
    updateBars();
    draw();

    gameTime += 0.016; // 約60FPS想定
    timeElement.textContent = gameTime.toFixed(1);

    if (checkCollision()) {
        gameOver();
        return;
    }

    animationId = requestAnimationFrame(gameLoop);
}

// ゲーム開始
function startGame() {
    gameRunning = true;
    // プレイヤーを画面の左上の方に配置（バーと重ならないように）
    playerX = 100;
    playerY = 100;
    gameTime = 0;
    level = 1;
    initBars();
    
    timeElement.textContent = '0.0';
    levelElement.textContent = '1';
    gameOverDiv.style.display = 'none';
    
    gameLoop();
}

// ゲームオーバー
function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    finalTimeElement.textContent = gameTime.toFixed(1);
    finalLevelElement.textContent = level;
    gameOverDiv.style.display = 'block';
}

// リスタートボタン
restartBtn.addEventListener('click', startGame);

// 初期化
startGame();
