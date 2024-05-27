const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_SIZE = 400;
const SQUARE_SIZE = 20;
const DIRECTIONS = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }
};

let snake = [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 }
];
let direction = DIRECTIONS.ArrowRight;
let food = { x: 10, y: 10 };
let gameInterval = null;
let gridVisible = false;

canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * SQUARE_SIZE, y * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
}

function drawSnake() {
    snake.forEach(segment => drawSquare(segment.x, segment.y, 'lime'));
}

function drawFood() {
    drawSquare(food.x, food.y, 'red');
}

function drawGrid() {
    if (gridVisible) {
        ctx.strokeStyle = '#444';
        for (let x = 0; x < CANVAS_SIZE; x += SQUARE_SIZE) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CANVAS_SIZE);
            ctx.stroke();
        }
        for (let y = 0; y < CANVAS_SIZE; y += SQUARE_SIZE) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CANVAS_SIZE, y);
            ctx.stroke();
        }
    }
}

function moveSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        placeFood();
    } else {
        snake.pop();
    }
}

function placeFood() {
    food = {
        x: Math.floor(Math.random() * CANVAS_SIZE / SQUARE_SIZE),
        y: Math.floor(Math.random() * CANVAS_SIZE / SQUARE_SIZE)
    };
}

function checkCollision() {
    const head = snake[0];

    if (head.x < 0 || head.x >= CANVAS_SIZE / SQUARE_SIZE || head.y < 0 || head.y >= CANVAS_SIZE / SQUARE_SIZE) {
        return true;
    }

    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

function gameLoop() {
    if (checkCollision()) {
        alert('Game Over');
        clearInterval(gameInterval);
        gameInterval = null;
    } else {
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        drawGrid();
        moveSnake();
        drawSnake();
        drawFood();
    }
}

document.addEventListener('keydown', event => {
    if (DIRECTIONS[event.key]) {
        const newDirection = DIRECTIONS[event.key];
        if (Math.abs(newDirection.x) !== Math.abs(direction.x) || Math.abs(newDirection.y) !== Math.abs(direction.y)) {
            direction = newDirection;
        }
    }
});

document.getElementById('playButton').addEventListener('click', () => {
    if (!gameInterval) {
        gameInterval = setInterval(gameLoop, 100);
    }
});

document.getElementById('pauseButton').addEventListener('click', () => {
    clearInterval(gameInterval);
    gameInterval = null;
});

document.getElementById('restartButton').addEventListener('click', () => {
    clearInterval(gameInterval);
    gameInterval = null;
    snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 }
    ];
    direction = DIRECTIONS.ArrowRight;
    placeFood();
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    drawGrid();
    drawSnake();
    drawFood();
});

document.getElementById('toggleGridButton').addEventListener('click', () => {
    gridVisible = !gridVisible;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    drawGrid();
    drawSnake();
    drawFood();
});

placeFood();
