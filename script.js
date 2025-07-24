

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let score = 0;
let gameOver = false;
let stage = 1;
let scoreThreshold = 100;
let enemySpeedMultiplier = 1.0;
let isBossActive = false;

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
const bossBullets = [];

// Enemies
const enemies = [];
const enemyColors = ['#0f0', '#f0f', '#ff0', '#f80', '#f00'];

// Boss
let boss = null;

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
        if (e.code === 'Space') restartGame();
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

document.addEventListener('keyup', (e) => { keys[e.code] = false; });

function restartGame() {
    score = 0;
    gameOver = false;
    stage = 1;
    scoreThreshold = 100;
    enemySpeedMultiplier = 1.0;
    isBossActive = false;
    boss = null;
    enemies.length = 0;
    bullets.length = 0;
    bossBullets.length = 0;
    player.x = 50;
    player.y = canvas.height / 2 - 25;
    gameLoop();
}

function goToNextStage() {
    stage++;
    scoreThreshold += 100;
    enemySpeedMultiplier += 0.4;
    isBossActive = false;
    boss = null;
}

function spawnBoss() {
    isBossActive = true;
    enemies.length = 0; // Clear normal enemies
    const bossHP = 100 + (stage - 1) * 50;
    const bossColor = enemyColors[(stage - 1) % enemyColors.length];
    const bossSpeed = 2 + (stage - 1) * 0.5;
    const bossAttackCooldown = Math.max(20, 60 - (stage - 1) * 5); // Faster attacks, min 20 frames

    boss = {
        x: canvas.width - 150,
        y: canvas.height / 2 - 50,
        width: 100,
        height: 100,
        color: bossColor,
        shadowColor: bossColor,
        shadowBlur: 25,
        speedX: bossSpeed,
        speedY: bossSpeed,
        hp: bossHP,
        maxHp: bossHP,
        attackCooldown: bossAttackCooldown,
        attackTimer: 0
    };
}

function updateBoss() {
    if (!boss) return;

    // Movement
    boss.x += boss.speedX;
    boss.y += boss.speedY;
    if (boss.x <= canvas.width / 2 || boss.x + boss.width >= canvas.width) {
        boss.speedX *= -1;
    }
    if (boss.y <= 0 || boss.y + boss.height >= canvas.height) {
        boss.speedY *= -1;
    }

    // Attack
    boss.attackTimer--;
    if (boss.attackTimer <= 0) {
        bossBullets.push({
            x: boss.x,
            y: boss.y + boss.height / 2,
            width: 15,
            height: 15,
            color: '#ff8c00',
            shadowColor: '#ff8c00',
            shadowBlur: 15,
            speed: -4
        });
        boss.attackTimer = boss.attackCooldown;
    }
    // Collision with player
    if (isColliding(player, boss)) {
        gameOver = true;
    }
}

function drawBoss() {
    if (!boss) return;
    ctx.fillStyle = boss.color;
    ctx.shadowColor = boss.shadowColor;
    ctx.shadowBlur = boss.shadowBlur;
    ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
    ctx.shadowBlur = 0;

    // HP Bar
    const hpBarWidth = 300;
    const hpBarHeight = 20;
    const hpBarX = (canvas.width - hpBarWidth) / 2;
    const hpBarY = 10;
    ctx.fillStyle = '#555';
    ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
    const currentHpWidth = (boss.hp / boss.maxHp) * hpBarWidth;
    ctx.fillStyle = boss.color;
    ctx.fillRect(hpBarX, hpBarY, currentHpWidth, hpBarHeight);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
}

function updateBossBullets() {
    for (let i = bossBullets.length - 1; i >= 0; i--) {
        const bullet = bossBullets[i];
        bullet.x += bullet.speed;
        if (isColliding(player, bullet)) {
            gameOver = true;
        }
        if (bullet.x < 0) {
            bossBullets.splice(i, 1);
        }
    }
}

function drawBossBullets() {
    for (const bullet of bossBullets) {
        ctx.fillStyle = bullet.color;
        ctx.shadowColor = bullet.shadowColor;
        ctx.shadowBlur = bullet.shadowBlur;
        ctx.beginPath();
        ctx.arc(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        if (!bullet) continue;
        bullet.x += bulletSpeed;

        if (isBossActive && boss && isColliding(bullet, boss)) {
            boss.hp -= 10;
            bullets.splice(i, 1);
            if (boss.hp <= 0) {
                goToNextStage();
            }
            continue;
        }

        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (isColliding(bullet, enemy)) {
                enemies.splice(j, 1);
                bullets.splice(i, 1);
                score += 10;
                if (!isBossActive && score >= scoreThreshold) {
                    spawnBoss();
                }
                break;
            }
        }

        if (bullet && bullet.x > canvas.width) {
            bullets.splice(i, 1);
        }
    }
}

function spawnEnemy() {
    if (gameOver || isBossActive) return;
    const size = Math.random() * 40 + 20;
    const y = Math.random() * (canvas.height - size);
    const color = enemyColors[(stage - 1) % enemyColors.length];
    enemies.push({
        x: canvas.width,
        y: y,
        width: size,
        height: size,
        color: color,
        speed: (Math.random() * 3 + 1.5) * enemySpeedMultiplier,
        shadowColor: color,
        shadowBlur: 20
    });
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
    updatePlayer();

    if (isBossActive) {
        drawBoss();
        updateBoss();
        drawBossBullets();
        updateBossBullets();
    } else {
        drawEnemies();
        updateEnemies();
    }

    drawBullets();
    updateBullets();
    drawHUD();

    requestAnimationFrame(gameLoop);
}

// --- Simplified functions (unchanged) ---
function initStars(){for(let i=0;i<100;i++){stars.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,radius:Math.random()*2,speed:Math.random()*0.5+0.2})}}function drawStars(){ctx.fillStyle='#fff';for(const t of stars){ctx.beginPath();ctx.arc(t.x,t.y,t.radius,0,Math.PI*2);ctx.fill()}}function updateStars(){for(const t of stars){t.x-=t.speed;if(t.x<0){t.x=canvas.width;t.y=Math.random()*canvas.height}}}function drawPlayer(){ctx.fillStyle=player.color;ctx.shadowColor=player.shadowColor;ctx.shadowBlur=player.shadowBlur;ctx.fillRect(player.x,player.y,player.width,player.height);ctx.shadowBlur=0}function updatePlayer(){if(keys.ArrowUp&&player.y>0)player.y-=player.speed;if(keys.ArrowDown&&player.y<canvas.height-player.height)player.y+=player.speed;if(keys.ArrowLeft&&player.x>0)player.x-=player.speed;if(keys.ArrowRight&&player.x<canvas.width-player.width)player.x+=player.speed}function drawBullets(){for(const t of bullets){ctx.fillStyle=t.color;ctx.shadowColor=t.shadowColor;ctx.shadowBlur=t.shadowBlur;ctx.fillRect(t.x,t.y,t.width,t.height);ctx.shadowBlur=0}}function drawEnemies(){for(const t of enemies){ctx.fillStyle=t.color;ctx.shadowColor=t.shadowColor;ctx.shadowBlur=t.shadowBlur;ctx.fillRect(t.x,t.y,t.width,t.height);ctx.shadowBlur=0}}function updateEnemies(){for(let i=enemies.length-1;i>=0;i--){const t=enemies[i];t.x-=t.speed;if(isColliding(player,t))gameOver=true;if(t.x+t.width<0)enemies.splice(i,1)}}function isColliding(t,o){return t.x<o.x+o.width&&t.x+t.width>o.x&&t.y<o.y+o.height&&t.y+t.height>o.y}function drawHUD(){ctx.fillStyle='#fff';ctx.font="24px 'Courier New', Courier, monospace";ctx.shadowColor='#fff';ctx.shadowBlur=10;ctx.textAlign='left';ctx.fillText(`SCORE: ${score}`,20,40);ctx.textAlign='right';ctx.fillText(`STAGE: ${stage}`,canvas.width-20,40);ctx.shadowBlur=0;ctx.textAlign='left'}function drawGameOver(){ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#f00';ctx.font="bold 60px 'Courier New', Courier, monospace";ctx.textAlign='center';ctx.shadowColor='#f00';ctx.shadowBlur=20;ctx.fillText('GAME OVER',canvas.width/2,canvas.height/2);ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.font="20px 'Courier New', Courier, monospace";ctx.fillText('Press SPACE to restart',canvas.width/2,canvas.height/2+50)}

// --- Initial calls ---
initStars();
setInterval(spawnEnemy, 1500);
gameLoop();
