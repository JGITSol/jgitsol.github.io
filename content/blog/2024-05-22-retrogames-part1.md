+++
title = "Retro Games - part 1 - Asteroid Game"
[taxonomies]
  tags = ["javascript","retro-games"]
[extra]
  toc = true
+++

## Unnecessary Intro

Growing up, I always had a soft spot for retro games. The simplicity, the challenge, and the sheer fun of those pixelated worlds have always fascinated me. So, I decided to recreate one of my favorites: the classic Asteroid game. In this blog post, I'll walk you through the process of creating an Asteroid game using HTML, CSS, and JavaScript.

## Setting Up the Project (Structure)

First, let's set up the basic structure for our game. We'll need an HTML file to host our canvas, a CSS file for styling, and a JavaScript file for the game logic. Here's how our project structure looks:

```
asteroid-game/
├── index.html
├── style.css
└── game.js
```

### index.html

Our HTML file is pretty straightforward. It includes a canvas element where the game will be rendered, and links to our CSS and JavaScript files.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Asteroid Game</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <canvas id="gameCanvas"></canvas>
    <script src="game.js"></script>
</body>
</html>
```
In our CSS file, we'll set some basic styles for the body and the canvas to ensure the game is centered on the screen and looks good.

```css
Copy code
body {
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: black;
}

canvas {
    border: 1px solid white;
}
```

# The Game Logic
Now, let's dive into the JavaScript code that will bring our game to life.

## game.js
First, we'll set up the basic structure and variables for our game, including the canvas, the context, and the player's ship.

```js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    angle: 0,
    rotation: 0,
    speed: 0,
    thrusting: false
};

const bullets = [];
const asteroids = [];
let score = 0;
let gameOver = false;
```

## Drawing the Ship
We need a function to draw the ship on the canvas. This function will use the ship's position and angle to draw a triangle representing the ship.

```js
function drawShip(x, y, angle) {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(
        x + 4/3 * ship.radius * Math.cos(angle),
        y - 4/3 * ship.radius * Math.sin(angle)
    );
    ctx.lineTo(
        x - ship.radius * (2/3 * Math.cos(angle) + Math.sin(angle)),
        y + ship.radius * (2/3 * Math.sin(angle) - Math.cos(angle))
    );
    ctx.lineTo(
        x - ship.radius * (2/3 * Math.cos(angle) - Math.sin(angle)),
        y + ship.radius * (2/3 * Math.sin(angle) + Math.cos(angle))
    );
    ctx.closePath();
    ctx.stroke();
}
```

## Moving the Ship
Next, we need functions to handle the movement of the ship. This includes updating its position based on its speed and angle, and applying thrust when the player presses the up arrow key.

```js
function updateShip() {
    if (ship.thrusting) {
        ship.speed += 0.05;
    } else {
        ship.speed *= 0.99;
    }

    ship.x += ship.speed * Math.cos(ship.angle);
    ship.y -= ship.speed * Math.sin(ship.angle);

    if (ship.x < 0) ship.x = canvas.width;
    if (ship.x > canvas.width) ship.x = 0;
    if (ship.y < 0) ship.y = canvas.height;
    if (ship.y > canvas.height) ship.y = 0;
}
```
## Shooting Bullets
We'll also need a function to handle shooting bullets. When the player presses the spacebar, a new bullet is created and added to the bullets array.

```js
function shootBullet() {
    bullets.push({
        x: ship.x + 4/3 * ship.radius * Math.cos(ship.angle),
        y: ship.y - 4/3 * ship.radius * Math.sin(ship.angle),
        angle: ship.angle,
        speed: 5
    });
}
```
### Drawing and Updating Bullets
We also need functions to draw and update the bullets.

```js
function drawBullet(bullet) {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2, false);
    ctx.fill();
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].x += bullets[i].speed * Math.cos(bullets[i].angle);
        bullets[i].y -= bullets[i].speed * Math.sin(bullets[i].angle);

        if (bullets[i].x < 0 || bullets[i].x > canvas.width || bullets[i].y < 0 || bullets[i].y > canvas.height) {
            bullets.splice(i, 1);
        }
    }
}
```
Creating and Drawing Asteroids
Asteroids are the main challenge in our game. We'll create a function to generate asteroids with random positions and sizes, and another function to draw them.

```js
function createAsteroid() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = 30 + Math.random() * 20;
    const speed = Math.random() * 2 + 1;
    const angle = Math.random() * Math.PI * 2;

    asteroids.push({ x, y, radius, speed, angle });
}

function drawAsteroid(asteroid) {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2, false);
    ctx.stroke();
}
```
Updating and Handling Collisions
We'll need to update the positions of the asteroids and handle collisions with bullets. If a bullet hits an asteroid, both are removed, and the player earns points.

```js
function updateAsteroids() {
    for (let i = asteroids.length - 1; i >= 0; i--) {
        asteroids[i].x += asteroids[i].speed * Math.cos(asteroids[i].angle);
        asteroids[i].y -= asteroids[i].speed * Math.sin(asteroids[i].angle);

        if (asteroids[i].x < 0) asteroids[i].x = canvas.width;
        if (asteroids[i].x > canvas.width) asteroids[i].x = 0;
        if (asteroids[i].y < 0) asteroids[i].y = canvas.height;
        if (asteroids[i].y > canvas.height) asteroids[i].y = 0;

        for (let j = bullets.length - 1; j >= 0; j--) {
            const dx = bullets[j].x - asteroids[i].x;
            const dy = bullets[j].y - asteroids[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < asteroids[i].radius) {
                bullets.splice(j, 1);
                asteroids.splice(i, 1);
                score += 10;
                break;
            }
        }
    }
}
```
## Game Loop
Finally, we'll create the game loop, which will update and render the game at a set interval.

```js
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateShip();
    drawShip(ship.x, ship.y, ship.angle);

    updateBullets();
    bullets.forEach(drawBullet);

    updateAsteroids();
    asteroids.forEach(drawAsteroid);

    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight') ship.rotation = 0.1;
    if (e.code === 'ArrowLeft') ship.rotation = -0.1;
    if (e.code === 'ArrowUp') ship.thrusting = true;
    if (e.code === 'Space') shootBullet();
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') ship.rotation = 0;
    if (e.code === 'ArrowUp') ship.thrusting = false;
});

for (let i = 0; i < 5; i++) {
    createAsteroid();
}

gameLoop();
```
Conclusion
And there you have it! A simple but functional Asteroid game. This project is a great way to get started with game development using HTML5 Canvas and JavaScript.