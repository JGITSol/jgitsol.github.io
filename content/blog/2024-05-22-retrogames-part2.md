+++
title = "Retro Games - part 2 - Snake Game"
[taxonomies]
  tags = ["javascript","retro-games"]
[extra]
  toc = true
+++

## Unnecesary Intro

Creating a classic Snake game has always been on my to-do list. It's one of those retro games that never gets old and is a perfect project to practice web development skills. In this post, I'll walk you through how I built a Snake game and embedded it into a Zola project.

## Setting Up the Zola Project

First, we need to set up a Zola project. If you don't already have Zola installed, you can get it from the official website. Once installed, create a new project:

```sh
zola init my-zola-site
cd my-zola-site
```

# Creating the Snake Game
The game itself will be built using HTML, CSS, and JavaScript. Let's start by creating the necessary files in the static directory of our Zola project.

 ## HTML Structure
We need a basic HTML structure to hold our game canvas and control buttons. Here's what the snake.html file looks like:

```html

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Snake Game</title>
    <link rel="stylesheet" href="snake.css">
</head>
<body>
    <div id="game-container">
        <h1>Snek.js</h1>
        <div id="game">
            <div id="retro-frame">
                <canvas id="gameCanvas"></canvas>
            </div>
        </div>
        <div id="controls">
            <button id="playButton">Play</button>
            <button id="pauseButton">Pause</button>
            <button id="restartButton">Restart</button>
            <button id="toggleGridButton">Toggle Grid</button>
        </div>
    </div>
    <script src="snake.js"></script>
</body>
</html>
```
## Styling with CSS
Next, we add some styling to make our game look good. Here’s the snake.css file:

```css

body {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
    background-color: #000;
    font-family: 'Press Start 2P', cursive; /* Use a retro font */
    color: #fff;
}

#game-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

h1 {
    margin-bottom: 20px;
}

#game {
    display: flex;
    justify-content: center;
    align-items: center;
}

#retro-frame {
    padding: 10px;
    background-color: #444;
    border: 3px solid #fff;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
}

#gameCanvas {
    background-color: #000;
    border: 1px solid #fff;
}

#controls {
    margin-top: 10px;
}

button {
    margin: 0 5px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    background-color: #444;
    color: #fff;
    border: 1px solid #fff;
    border-radius: 5px;
}

button:hover {
    background-color: #555;
}
```

JavaScript for Game Logic
Finally, we need to add the game logic using JavaScript. Here's the snake.js file:

```js

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
```

## Embedding the Game into a Zola Page
With our game created, the next step is to embed it into a Zola page. Create or update content/snake-game.md:

```md
Copy code
+++
title = "Snake Game"
+++

<iframe src="/snake.html" width="420" height="460" style="border:0;"></iframe>
```
Build and Serve the Site
Finally, build and serve your Zola site to see the game in action:

```sh
Copy code
zola build
zola serve
```

Navigate to http://127.0.0.1:1111/snake-game/ to see your enhanced Snake game with play, pause, restart buttons, grid toggle functionality, a retro frame around the canvas, and a title above the canvas. The snake should be controllable with the keyboard arrow keys.

This project was a fun way to revisit a classic game while practicing modern web development skills. I hope you enjoy building and playing your own Snake game!