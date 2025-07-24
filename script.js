const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let isVertical = false;

function resizeCanvas() {
    isVertical = window.innerHeight > window.innerWidth;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * (isVertical ? 0.85 : 0.8);
    resetPlayerPosition(); // Recalculate player position on resize
}
window.addEventListener('resize', resizeCanvas);

// --- Game state ---
let score = 0, gameOver = false, stage = 1, scoreThreshold = 100, enemySpeedMultiplier = 1.0, isBossActive = false;

// --- Game Objects ---
const player = {
    x: 0, y: 0, width: 50, height: 50, color: '#0ff', speed: 8, shadowColor: '#0ff', shadowBlur: 20,
    ammo: 20, maxAmmo: 20, isReloading: false, reloadDuration: 1500, // 1.5 seconds
    fireCooldown: 0, fireRate: 4 // 4 frames between shots
};
const bullets = [], bossBullets = [];
const enemies = [], enemyColors = ['#0f0', '#f0f', '#ff0', '#f80', '#f00'];
let boss = null;
const stars = [];
const keys = {};

// --- Event Listeners ---
document.addEventListener('keydown', e => {
    if (gameOver) { if (e.code === 'Space') restartGame(); return; }
    keys[e.code] = true;
});
document.addEventListener('keyup', e => { keys[e.code] = false; });

const controlMap = { 'btn-up': 'ArrowUp', 'btn-down': 'ArrowDown', 'btn-left': 'ArrowLeft', 'btn-right': 'ArrowRight', 'btn-fire': 'Space' };
for (const btnId in controlMap) {
    const btn = document.getElementById(btnId);
    const key = controlMap[btnId];
    const eventHandler = (isPressed) => (e) => {
        e.preventDefault();
        if (gameOver && controlMap[e.currentTarget.id] === 'Space') {
            restartGame();
            return;
        }
        keys[key] = isPressed;
    };
    btn.addEventListener('touchstart', eventHandler(true), { passive: false });
    btn.addEventListener('touchend', eventHandler(false), { passive: false });
    btn.addEventListener('mousedown', eventHandler(true), { passive: false });
    btn.addEventListener('mouseup', eventHandler(false), { passive: false });
}

// --- Game Logic ---
function restartGame() {
    score = 0; gameOver = false; stage = 1; scoreThreshold = 100; enemySpeedMultiplier = 1.0; isBossActive = false;
    boss = null;
    [enemies, bullets, bossBullets].forEach(arr => arr.length = 0);
    player.ammo = player.maxAmmo;
    player.isReloading = false;
    resetPlayerPosition();
    gameLoop();
}

function resetPlayerPosition() {
    player.y = isVertical ? canvas.height - player.height - 20 : canvas.height / 2 - player.height / 2;
    player.x = isVertical ? canvas.width / 2 - player.width / 2 : 50;
}

function fireBullet() {
    if (gameOver || player.isReloading || player.fireCooldown > 0) return;

    if (player.ammo > 0) {
        player.ammo--;
        player.fireCooldown = player.fireRate;
        bullets.push({
            x: player.x + player.width / 2 - (isVertical ? 2.5 : -player.width / 2),
            y: player.y - (isVertical ? 10 : -player.height / 2),
            width: isVertical ? 5 : 15,
            height: isVertical ? 15 : 5,
            color: '#f0f', shadowColor: '#f0f', shadowBlur: 15
        });
    } 
    if (player.ammo <= 0 && !player.isReloading) {
        reload();
    }
}

function reload() {
    player.isReloading = true;
    setTimeout(() => {
        player.ammo = player.maxAmmo;
        player.isReloading = false;
    }, player.reloadDuration);
}

function updatePlayer() {
    if (player.fireCooldown > 0) player.fireCooldown--;
    if (keys.Space) fireBullet();

    if (isVertical) {
        if (keys.ArrowLeft && player.x > 0) player.x -= player.speed;
        if (keys.ArrowRight && player.x < canvas.width - player.width) player.x += player.speed;
    } else {
        if (keys.ArrowUp && player.y > 0) player.y -= player.speed;
        if (keys.ArrowDown && player.y < canvas.height - player.height) player.y += player.speed;
        if (keys.ArrowLeft && player.x > 0) player.x -= player.speed;
        if (keys.ArrowRight && player.x < canvas.width - player.width) player.x += player.speed;
    }
}

function spawnEnemy() {
    if (gameOver || isBossActive) return;
    const size = Math.random() * 40 + 20;
    const color = enemyColors[(stage - 1) % enemyColors.length];
    enemies.push({
        x: isVertical ? Math.random() * (canvas.width - size) : canvas.width,
        y: isVertical ? -size : Math.random() * (canvas.height - size),
        width: size, height: size, color: color, shadowColor: color, shadowBlur: 20,
        speed: (Math.random() * (isVertical ? 2.5 : 3) + 1.5) * enemySpeedMultiplier
    });
}

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (isVertical) e.y += e.speed; else e.x -= e.speed;
        if (isColliding(player, e)) gameOver = true;
        if ((isVertical && e.y > canvas.height) || (!isVertical && e.x + e.width < 0)) enemies.splice(i, 1);
    }
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        if (isVertical) b.y -= 15; else b.x += 15;
        if (isBossActive && boss && isColliding(b, boss)) {
            boss.hp -= 10;
            bullets.splice(i, 1);
            if (boss.hp <= 0) goToNextStage();
            continue;
        }
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (isColliding(b, enemies[j])) {
                enemies.splice(j, 1);
                bullets.splice(i, 1);
                score += 10;
                if (!isBossActive && score >= scoreThreshold) spawnBoss();
                break;
            }
        }
        if (b.y < 0 || b.x > canvas.width) bullets.splice(i, 1);
    }
}

function spawnBoss() {
    isBossActive = true;
    enemies.length = 0;
    const bossHP = 100 + (stage - 1) * 50;
    const bossColor = enemyColors[(stage - 1) % enemyColors.length];
    const bossSpeed = 2 + (stage - 1) * 0.5;
    const bossAttackCooldown = Math.max(20, 60 - (stage - 1) * 5);
    boss = {
        width: 100, height: 100, color: bossColor, shadowColor: bossColor, shadowBlur: 25,
        hp: bossHP, maxHp: bossHP, attackCooldown: bossAttackCooldown, attackTimer: 0,
        x: isVertical ? canvas.width / 2 - 50 : canvas.width - 150,
        y: isVertical ? 50 : canvas.height / 2 - 50,
        speedX: isVertical ? bossSpeed : -bossSpeed,
        speedY: bossSpeed
    };
}

function updateBoss() {
    if (!boss) return;
    boss.x += boss.speedX; boss.y += boss.speedY;
    if ((isVertical && (boss.x <= 0 || boss.x + boss.width >= canvas.width)) || 
        (!isVertical && (boss.x <= canvas.width / 2 || boss.x + boss.width >= canvas.width))) {
        boss.speedX *= -1;
    }
    if ((isVertical && (boss.y <= 0 || boss.y + boss.height >= canvas.height / 2)) ||
        (!isVertical && (boss.y <= 0 || boss.y + boss.height >= canvas.height))) {
        boss.speedY *= -1;
    }
    boss.attackTimer--;
    if (boss.attackTimer <= 0) {
        bossBullets.push({ 
            x: boss.x + boss.width / 2, y: boss.y + boss.height, 
            width: 15, height: 15, color: '#ff8c00', shadowColor: '#ff8c00', shadowBlur: 15, 
            speed: isVertical ? 4 : -4 
        });
        boss.attackTimer = boss.attackCooldown;
    }
    if (isColliding(player, boss)) gameOver = true;
}

function updateBossBullets() {
    for (let i = bossBullets.length - 1; i >= 0; i--) {
        const b = bossBullets[i];
        if (isVertical) b.y += b.speed; else b.x += b.speed;
        if (isColliding(player, b)) gameOver = true;
        if (b.y > canvas.height || b.x < 0) bossBullets.splice(i, 1);
    }
}

function goToNextStage() { stage++; scoreThreshold += 100; enemySpeedMultiplier += 0.4; isBossActive = false; boss = null; }
function isColliding(r1, r2) { return r1.x < r2.x + r2.width && r1.x + r1.width > r2.x && r1.y < r2.y + r2.height && r1.y + r1.height > r2.y; }

// --- Drawing ---
function draw(obj) { ctx.fillStyle = obj.color; ctx.shadowColor = obj.shadowColor; ctx.shadowBlur = obj.shadowBlur; ctx.fillRect(obj.x, obj.y, obj.width, obj.height); ctx.shadowBlur = 0; }
function drawBossBullets() { for (const b of bossBullets) { ctx.fillStyle = b.color; ctx.shadowColor = b.shadowColor; ctx.shadowBlur = b.shadowBlur; ctx.beginPath(); ctx.arc(b.x + b.width / 2, b.y + b.height / 2, b.width / 2, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; } }
function drawHUD() {
    ctx.fillStyle = '#fff';
    ctx.font = "24px 'Courier New', Courier, monospace";
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 10;
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${score}`, 20, 40);
    ctx.textAlign = 'right';
    ctx.fillText(`STAGE: ${stage}`, canvas.width - 20, 40);
    
    // Ammo Display
    ctx.textAlign = 'center';
    const ammoText = player.isReloading ? "RELOADING..." : `AMMO: ${player.ammo} / ${player.maxAmmo}`;
    ctx.fillText(ammoText, canvas.width / 2, 40);

    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';

    if (isBossActive && boss) {
        const hpw = 300, hph = 20, hpx = (canvas.width - hpw) / 2, hpy = isVertical ? 70 : 10;
        ctx.fillStyle = '#555';
        ctx.fillRect(hpx, hpy, hpw, hph);
        ctx.fillStyle = boss.color;
        ctx.fillRect(hpx, hpy, (boss.hp / boss.maxHp) * hpw, hph);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(hpx, hpy, hpw, hph);
    }
}
function drawGameOver() { ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#f00'; ctx.font = "bold 60px 'Courier New', Courier, monospace"; ctx.textAlign = 'center'; ctx.shadowColor = '#f00'; ctx.shadowBlur = 20; ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2); ctx.shadowBlur = 0; ctx.fillStyle = '#fff'; ctx.font = "20px 'Courier New', Courier, monospace"; ctx.fillText('Press SPACE or FIRE to restart', canvas.width / 2, canvas.height / 2 + 50); }

// --- Main Loop ---
function gameLoop() {
    if (gameOver) { drawGameOver(); return; }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => { s.x -= s.speed; if (s.x < 0) s.x = canvas.width; });
    stars.forEach(s => { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2); ctx.fill(); });
    draw(player); updatePlayer();
    if (isBossActive) { draw(boss); updateBoss(); drawBossBullets(); updateBossBullets(); } else { enemies.forEach(draw); updateEnemies(); }
    bullets.forEach(draw); updateBullets();
    drawHUD();
    requestAnimationFrame(gameLoop);
}

// --- Init ---
resizeCanvas();
for (let i = 0; i < 100; i++) stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, radius: Math.random() * 2, speed: Math.random() * 0.5 + 0.2 });
setInterval(spawnEnemy, 1500);
gameLoop();