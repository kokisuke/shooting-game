const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let score = 0;
let gameOver = false;
let stage = 1;
let scoreThreshold = 200;
let enemySpeedMultiplier = 1.0;

// Player
const player = {
    x: 50,
    y: canvas.height / 2 - 25,
    width: 50,
    height: 50,
    color: '#0ff',
    speed: 5,
    shadowColor: '#0ff',
    shadowBlur: 20
};

// Bullets
const bullets = [];
const bulletSpeed = 10;

// Enemies
const enemies = [];
const enemyColors = ['#0f0', '#f0f', '#ff0', '#f80', '#f00']; // Green, Magenta, Yellow, Orange, Red

// Stars
const stars = [];

// Keyboard state
const keys = {};

function initStars() {
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2,
            speed: Math.random() * 0.5 + 0.2
        });
    }
}

document.addEventListener('keydown', (e) => {
    if (gameOver) {
        if (e.code === 'Space') {
            restartGame();
        }
        return;
    }

    keys[e.code] = true;

    if (e.code === 'Space') {
        bullets.push({
            x: player.x + player.width,
            y: player.y + player.height / 2 - 2.5,
            width: 15,
            height: 5,
            color: '#f0f',
            shadowColor: '#f0f',
            shadowBlur: 15
        });
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

function restartGame() {
    score = 0;
    gameOver = false;
    stage = 1;
    scoreThreshold = 200;
    enemySpeedMultiplier = 1.0;

    enemies.length = 0;
    bullets.length = 0;

    player.x = 50;
    player.y = canvas.height / 2 - 25;

    gameLoop();
}

function drawStars() {
    ctx.fillStyle = '#fff';
    for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function updateStars() {
    for (const star of stars) {
        star.x -= star.speed;
        if (star.x < 0) {
            star.x = canvas.width;
            star.y = Math.random() * canvas.height;
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.shadowColor = player.shadowColor;
    ctx.shadowBlur = player.shadowBlur;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.shadowBlur = 0; // Reset shadow for other elements
}

function updatePlayer() {
    if (keys['ArrowUp'] && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
}

function drawBullets() {
    for (const bullet of bullets) {
        ctx.fillStyle = bullet.color;
        ctx.shadowColor = bullet.shadowColor;
        ctx.shadowBlur = bullet.shadowBlur;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        ctx.shadowBlur = 0;
    }
}

function advanceStage() {
    stage++;
    scoreThreshold += 200;
    enemySpeedMultiplier += 0.4; // Increase enemy speed more significantly
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        if (!bullet) continue; // Safety check

        bullet.x += bulletSpeed;

        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (isColliding(bullet, enemy)) {
                enemies.splice(j, 1);
                bullets.splice(i, 1);
                score += 10;
                if (score >= scoreThreshold) {
                    advanceStage();
                }
                break; 
            }
        }

        if (bullet && bullet.x > canvas.width) {
            bullets.splice(i, 1);
        }
    }
}

function drawEnemies() {
    for (const enemy of enemies) {
        ctx.fillStyle = enemy.color;
        ctx.shadowColor = enemy.shadowColor;
        ctx.shadowBlur = enemy.shadowBlur;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        ctx.shadowBlur = 0;
    }
}

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.x -= enemy.speed;

        if (isColliding(player, enemy)) {
            gameOver = true;
        }

        if (enemy.x + enemy.width < 0) {
            enemies.splice(i, 1);
        }
    }
}

function spawnEnemy() {
    if (gameOver) return;
    const size = Math.random() * 40 + 20;
    const y = Math.random() * (canvas.height - size);
    const color = enemyColors[(stage - 1) % enemyColors.length];

    enemies.push({
        x: canvas.width,
        y: y,
        width: size,
        height: size,
        color: color,
        speed: (Math.random() * 3 + 1.5) * enemySpeedMultiplier, // Wider random speed range
        shadowColor: color,
        shadowBlur: 20
    });
}

function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function drawHUD() {
    ctx.fillStyle = '#fff';
    ctx.font = '24px \'Courier New\', Courier, monospace';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 10;
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${score}`, 20, 40);
    ctx.textAlign = 'right';
    ctx.fillText(`STAGE: ${stage}`, canvas.width - 20, 40);
    ctx.shadowBlur = 0;
    ctx.textAlign = 'left'; // Reset alignment
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f00';
    ctx.font = 'bold 60px \'Courier New\', Courier, monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#f00';
    ctx.shadowBlur = 20;
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.font = '20px \'Courier New\', Courier, monospace';
    ctx.fillText('Press SPACE to restart', canvas.width / 2, canvas.height / 2 + 50);
}

function gameLoop() {
    if (gameOver) {
        drawGameOver();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateStars();
    drawStars();

    drawPlayer();
    drawBullets();
    drawEnemies();
    drawHUD();

    updatePlayer();
    updateBullets();
    updateEnemies();

    requestAnimationFrame(gameLoop);
}

initStars();
const enemyInterval = setInterval(spawnEnemy, 1500);

gameLoop();