const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_SIZE = 400;
const TILE_SIZE = 20;
const DIRECTIONS = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }
};

let pacMan = { x: 1, y: 1, direction: DIRECTIONS.ArrowRight };
let gameInterval = null;
let score = 0;
const pills = [];
const ghosts = [
    { x: 9, y: 7, direction: DIRECTIONS.ArrowLeft },
    { x: 10, y: 7, direction: DIRECTIONS.ArrowRight }
];

const level = [
    // Define a simple level (1: wall, 0: empty space)
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

function drawTile(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function drawLevel() {
    for (let y = 0; y < level.length; y++) {
        for (let x = 0; x < level[y].length; x++) {
            if (level[y][x] === 1) {
                drawTile(x, y, 'blue');
            } else {
                drawTile(x, y, 'black');
                if (!pills.find(p => p.x === x && p.y === y)) {
                    pills.push({ x, y });
                }
            }
        }
    }
}

function drawPacMan() {
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc((pacMan.x + 0.5) * TILE_SIZE, (pacMan.y + 0.5) * TILE_SIZE, TILE_SIZE / 2, 0.2 * Math.PI, 1.8 * Math.PI);
    ctx.lineTo((pacMan.x + 0.5) * TILE_SIZE, (pacMan.y + 0.5) * TILE_SIZE);
    ctx.fill();
}

function drawPills() {
    pills.forEach(pill => {
        drawTile(pill.x, pill.y, 'white');
    });
}

function drawGhosts() {
    ghosts.forEach(ghost => {
        drawTile(ghost.x, ghost.y, 'red');
    });
}

function movePacMan() {
    const nextX = pacMan.x + pacMan.direction.x;
    const nextY = pacMan.y + pacMan.direction.y;

    if (level[nextY][nextX] !== 1) {
        pacMan.x = nextX;
        pacMan.y = nextY;

        const pillIndex = pills.findIndex(p => p.x === pacMan.x && p.y === pacMan.y);
        if (pillIndex !== -1) {
            pills.splice(pillIndex, 1);
            score += 10;
        }

        const ghostCollision = ghosts.find(g => g.x === pacMan.x && g.y === pacMan.y);
        if (ghostCollision) {
            alert('Game Over! Your score: ' + score);
            clearInterval(gameInterval);
            gameInterval = null;
        }
    }
}

function moveGhosts() {
    ghosts.forEach(ghost => {
        const possibleDirections = Object.values(DIRECTIONS).filter(d => level[ghost.y + d.y][ghost.x + d.x] !== 1);
        const randomDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
        ghost.x += randomDirection.x;
        ghost.y += randomDirection.y;
    });
}

function gameLoop() {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    drawLevel();
    movePacMan();
    moveGhosts();
    drawPacMan();
    drawPills();
    drawGhosts();
    drawScore();
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 20);
}

document.addEventListener('keydown', event => {
    if (DIRECTIONS[event.key]) {
        pacMan.direction = DIRECTIONS[event.key];
    }
});

document.getElementById('playButton').addEventListener('click', () => {
    if (!gameInterval) {
        gameInterval = setInterval(gameLoop, 200);
    }
});

document.getElementById('pauseButton').addEventListener('click', () => {
    clearInterval(gameInterval);
    gameInterval = null;
});

document.getElementById('restartButton').addEventListener('click', () => {
    clearInterval(gameInterval);
    gameInterval = null;
    pacMan = { x: 1, y: 1, direction: DIRECTIONS.ArrowRight };
    score = 0;
    pills.length = 0;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    drawLevel();
    drawPacMan();
    drawPills();
    drawGhosts();
    drawScore();
});
