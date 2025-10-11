const tileContainer = document.getElementById("tile-container");
const heartsDisplay = document.getElementById("hearts");
const scoreDisplay = document.getElementById("score");
const keyZone = document.getElementById("key-zone");
const keysContainer = document.getElementById("keys");
const easyBtn = document.getElementById("easy");
const hardBtn = document.getElementById("hard");

// 효과음
const hitSound = document.getElementById("hit-sound");
hitSound.volume = 0.5;

let keys = [];
let heartCount = 5;
let score = 0;
let tileSpeed = 2.5;
let spawnInterval = 800;
let gameRunning = false;
let activeTiles = [];
let gameLoop = null;
let animationFrame = null;

// 카운트다운 표시
const countdown = document.createElement("div");
countdown.id = "countdown";
countdown.style.position = "absolute";
countdown.style.top = "50%";
countdown.style.left = "50%";
countdown.style.transform = "translate(-50%, -50%)";
countdown.style.fontSize = "80px";
countdown.style.color = "white";
countdown.style.fontWeight = "bold";
countdown.style.display = "none";
document.body.appendChild(countdown);

function setDifficulty(level) {
    stopGame();
    keys = level === "easy" ? ["A", "S", "D", "F"] : ["A", "S", "D", "F", "H", "J", "K", "L"];
    heartCount = level === "easy" ? 5 : 3;
    score = 0;
    tileSpeed = 2.5;
    spawnInterval = 800;
    activeTiles = [];
    updateHearts();
    scoreDisplay.textContent = "점수: 0";
    tileContainer.innerHTML = "";
    keysContainer.innerHTML = keys.map(k => `<div class="key">${k}</div>`).join("");
    
    // ✅ 사용자 클릭 시 오디오 권한 활성화용
    hitSound.volume = 0;
    hitSound.play().then(() => {
        hitSound.pause();
        hitSound.currentTime = 0;
        hitSound.volume = 0.5; // 원래 볼륨 복원
    });

    startCountdown(level);
}

function startCountdown(level) {
    let count = 3;
    countdown.style.display = "block";
    countdown.textContent = count;

    const timer = setInterval(() => {
        count--;
        if (count === 0) {
            countdown.textContent = "시작!";
        } else if (count < 0) {
            clearInterval(timer);
            countdown.style.display = "none";
            startGame(level);
        } else {
            countdown.textContent = count;
        }
    }, 1000);
}

function stopGame() {
    gameRunning = false;
    clearInterval(gameLoop);
    cancelAnimationFrame(animationFrame);
}

function updateHearts() {
    heartsDisplay.innerHTML = "❤️".repeat(heartCount);
}

function endGame() {
    alert(`게임 오버! 최종 점수: ${score}`);
    stopGame();
    tileContainer.innerHTML = "";
}

function startGame(level) {
    gameRunning = true;
    tileSpeed = 2.5;
    activeTiles = [];

    // 🔹 시작할 때 너무 많이 생성되지 않게 조절
    for (let i = 0; i < 3; i++) {
        spawnTile(-i * 180);
    }

    startSpawnLoop();
    animationFrame = requestAnimationFrame(moveTiles);
}

function startSpawnLoop() {
    clearInterval(gameLoop);
    gameLoop = setInterval(() => {
        if (!gameRunning) return;

        const spawnCount = Math.random() < 0.3 ? 2 : 1; 
        for (let i = 0; i < spawnCount; i++) {
            setTimeout(() => spawnTile(), Math.random() * 200);
        }

    }, spawnInterval);
}

function spawnTile(initialTop = -100) {
    const lane = Math.floor(Math.random() * keys.length);
    const tile = document.createElement("div");
    tile.classList.add("tile");
    tile.dataset.key = keys[lane];

    const zoneWidth = keyZone.clientWidth;
    const laneWidth = zoneWidth / keys.length;
    const tileWidth = laneWidth * 0.9;
    const offset = (laneWidth - tileWidth) / 2;

    tile.style.left = `${lane * laneWidth + offset}px`;
    tile.style.width = `${tileWidth}px`;
    tile.style.top = `${initialTop}px`;

    tileContainer.appendChild(tile);
    activeTiles.push(tile);
}

function moveTiles() {
    if (!gameRunning) return;

    for (let i = activeTiles.length - 1; i >= 0; i--) {
        const tile = activeTiles[i];
        let top = parseFloat(tile.style.top);
        top += tileSpeed;
        tile.style.top = `${top}px`;

        if (top > 600) {
            tile.remove();
            activeTiles.splice(i, 1);
            heartCount--;
            updateHearts();
            if (heartCount <= 0) endGame();
        }
    }

    // 🔹 점수에 따라 속도와 스폰 간격 점점 빨라짐
    tileSpeed = 2.5 + score * 0.04;
    spawnInterval = Math.max(250, 800 - score * 10);

    clearInterval(gameLoop);
    startSpawnLoop();

    animationFrame = requestAnimationFrame(moveTiles);
}

document.addEventListener("keydown", e => {
    if (!gameRunning) return;
    const key = e.key.toUpperCase();
    const tile = activeTiles.find(t => t.dataset.key === key);
    const keyDiv = [...keysContainer.children].find(div => div.textContent === key);

    if (keyDiv) {
        keyDiv.classList.add("active");
        setTimeout(() => keyDiv.classList.remove("active"), 150);
    }

    if (!tile) return;

    const tileRect = tile.getBoundingClientRect();
    const zoneRect = keyZone.getBoundingClientRect();

    if (tileRect.bottom >= zoneRect.top && tileRect.top <= zoneRect.bottom) {
        score++;
        scoreDisplay.textContent = `점수: ${score}`;
        hitSound.currentTime = 0;
        hitSound.play();
        tile.remove();
        activeTiles.splice(activeTiles.indexOf(tile), 1);
    }
});

easyBtn.onclick = () => setDifficulty("easy");
hardBtn.onclick = () => setDifficulty("hard");
