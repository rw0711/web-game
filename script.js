const tileContainer = document.getElementById("tile-container");
const heartsDisplay = document.getElementById("hearts");
const scoreDisplay = document.getElementById("score");
const keyZone = document.getElementById("key-zone");
const keysContainer = document.getElementById("keys");
const easyBtn = document.getElementById("easy");
const hardBtn = document.getElementById("hard");

let keys = [];
let heartCount = 5;
let score = 0;
let tileSpeed = 3;
let spawnInterval = 1000;
let gameRunning = false;
let activeTiles = [];
let gameLoop = null;

function setDifficulty(level) {
    keys = level === "easy" ? ["A", "S", "D", "F"] : ["A", "S", "D", "F", "H", "J", "K", "L"];
    heartCount = level === "easy" ? 5 : 3;
    score = 0;
    tileSpeed = 3;
    spawnInterval = 1000;
    gameRunning = true;
    updateHearts();
    scoreDisplay.textContent = "점수: 0";
    tileContainer.innerHTML = "";
    keysContainer.innerHTML = keys.map(k => `<div class="key">${k}</div>`).join("");
    startGame();
}

function updateHearts() {
    heartsDisplay.innerHTML = "❤️".repeat(heartCount);
}

function endGame() {
    alert(`게임 오버! 최종 점수: ${score}`);
    gameRunning = false;
    clearInterval(gameLoop);
    tileContainer.innerHTML = "";
}

function startGame() {
    if (gameLoop) clearInterval(gameLoop);

    gameLoop = setInterval(() => {
        if (!gameRunning) {
            clearInterval(gameLoop);
            return;
        }
        spawnTile();
        spawnInterval = Math.max(300, spawnInterval * 0.995);
    }, spawnInterval);

    requestAnimationFrame(moveTiles);
}

function spawnTile() {
    const lane = Math.floor(Math.random() * keys.length);
    const tile = document.createElement("div");
    tile.classList.add("tile");
    tile.dataset.key = keys[lane];

    // 키존의 실제 폭 기반으로 계산
    const zoneWidth = keyZone.clientWidth;
    const laneWidth = zoneWidth / keys.length;
    const tileWidth = laneWidth * 0.9; // 키보다 살짝 작게
    const offset = (laneWidth - tileWidth) / 2;

    tile.style.left = `${lane * laneWidth + offset}px`;
    tile.style.width = `${tileWidth}px`;
    tile.style.top = "-80px";

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

    tileSpeed += 0.005
    requestAnimationFrame(moveTiles);
}

document.addEventListener("keydown", e => {
    if (!gameRunning) return;
    const key = e.key.toUpperCase();
    const tile = activeTiles.find(t => t.dataset.key === key);
    const keyDiv = [...keysContainer.children].find(div => div.textContent === key);

    // 키 눌림 효과
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
        tile.remove();
        activeTiles.splice(activeTiles.indexOf(tile), 1);
    }
});

easyBtn.onclick = () => setDifficulty("easy");
hardBtn.onclick = () => setDifficulty("hard");
