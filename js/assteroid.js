// static/js/asteroids.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let gameOver = false;
document.getElementById("score").textContent = `Score: ${score}`;

let ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    rotation: 0,
    velocity: { x: 0, y: 0 },
    thrusting: false,
    rotateLeft: false,
    rotateRight: false,
    bullets: []
};

let asteroids = [];
const asteroidCount = 5;
const bulletSpeed = 5;

function createAsteroid(x, y, size) {
    const vertices = [];
    const numVertices = 8;
    for (let i = 0; i < numVertices; i++) {
        const angle = (i * Math.PI * 2) / numVertices;
        const length = size * (0.8 + Math.random() * 0.4);
        vertices.push({ x: length * Math.cos(angle), y: length * Math.sin(angle) });
    }
    return {
        x: x,
        y: y,
        size: size,
        velocity: {
            x: (Math.random() * 2 - 1) * (30 / size),
            y: (Math.random() * 2 - 1) * (30 / size)
        },
        health: size / 10,
        vertices: vertices
    };
}

function initAsteroids() {
    asteroids = [];
    for (let i = 0; i < asteroidCount; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        let size = Math.random() * 30 + 20;
        asteroids.push(createAsteroid(x, y, size));
    }
}

initAsteroids();

const keyState = {};

window.addEventListener('keydown', (e) => {
    keyState[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keyState[e.key] = false;
});

window.addEventListener('keydown', (e) => {
    if (e.key === ' ' && !gameOver) {
        ship.bullets.push({
            x: ship.x + Math.cos(ship.rotation) * 15,
            y: ship.y + Math.sin(ship.rotation) * 15,
            velocity: {
                x: bulletSpeed * Math.cos(ship.rotation),
                y: bulletSpeed * Math.sin(ship.rotation)
            }
        });
    }
});

function update() {
    if (gameOver) return;

    if (keyState['ArrowUp']) ship.thrusting = true;
    else ship.thrusting = false;

    if (keyState['ArrowLeft']) ship.rotateLeft = true;
    else ship.rotateLeft = false;

    if (keyState['ArrowRight']) ship.rotateRight = true;
    else ship.rotateRight = false;

    if (ship.rotateLeft) ship.rotation -= 0.05;
    if (ship.rotateRight) ship.rotation += 0.05;

    if (ship.thrusting) {
        ship.velocity.x += 0.1 * Math.cos(ship.rotation);
        ship.velocity.y += 0.1 * Math.sin(ship.rotation);
    }

    ship.x += ship.velocity.x;
    ship.y += ship.velocity.y;

    if (ship.x < 0) ship.x = canvas.width;
    if (ship.x > canvas.width) ship.x = 0;
    if (ship.y < 0) ship.y = canvas.height;
    if (ship.y > canvas.height) ship.y = 0;

    ship.velocity.x *= 0.99;
    ship.velocity.y *= 0.99;

    for (let i = 0; i < ship.bullets.length; i++) {
        let bullet = ship.bullets[i];
        bullet.x += bullet.velocity.x;
        bullet.y += bullet.velocity.y;

        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            ship.bullets.splice(i, 1);
            i--;
        }
    }

    for (let i = 0; i < asteroids.length; i++) {
        let asteroid = asteroids[i];
        asteroid.x += asteroid.velocity.x;
        asteroid.y += asteroid.velocity.y;

        if (asteroid.x < 0) asteroid.x = canvas.width;
        if (asteroid.x > canvas.width) asteroid.x = 0;
        if (asteroid.y < 0) asteroid.y = canvas.height;
        if (asteroid.y > canvas.height) asteroid.y = 0;

        for (let j = 0; j < ship.bullets.length; j++) {
            let bullet = ship.bullets[j];
            if (pointInPolygon(bullet.x, bullet.y, asteroid)) {
                asteroid.health--;
                ship.bullets.splice(j, 1);
                j--;

                if (asteroid.health <= 0) {
                    score += Math.floor(asteroid.size);
                    document.getElementById("score").textContent = `Score: ${score}`;
                    asteroids.splice(i, 1);
                    i--;

                    if (asteroid.size > 10) {
                        let newSize = asteroid.size / 2;
                        asteroids.push(createAsteroid(asteroid.x, asteroid.y, newSize));
                        asteroids.push(createAsteroid(asteroid.x, asteroid.y, newSize));
                    }

                    break;
                }
            }
        }

        if (polygonCollision(ship, asteroid)) {
            gameOver = true;
            document.getElementById("score").textContent = `Game Over! Final Score: ${score}`;
            return;
        }
    }
}

function pointInPolygon(x, y, asteroid) {
    let inside = false;
    for (let i = 0, j = asteroid.vertices.length - 1; i < asteroid.vertices.length; j = i++) {
        const xi = asteroid.x + asteroid.vertices[i].x, yi = asteroid.y + asteroid.vertices[i].y;
        const xj = asteroid.x + asteroid.vertices[j].x, yj = asteroid.y + asteroid.vertices[j].y;

        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function polygonCollision(ship, asteroid) {
    const points = [
        { x: ship.x + 15 * Math.cos(ship.rotation), y: ship.y + 15 * Math.sin(ship.rotation) },
        { x: ship.x + 10 * Math.cos(ship.rotation + 2 * Math.PI / 3), y: ship.y + 10 * Math.sin(ship.rotation + 2 * Math.PI / 3) },
        { x: ship.x + 10 * Math.cos(ship.rotation + 4 * Math.PI / 3), y: ship.y + 10 * Math.sin(ship.rotation + 4 * Math.PI / 3) }
    ];
    for (let point of points) {
        if (pointInPolygon(point.x, point.y, asteroid)) return true;
    }
    return false;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px sans-serif';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
        ctx.fillText(`Hit f5 to Restart`, canvas.width / 2, canvas.height / 2 + 80);
        return;
    }

    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.rotation);

    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(-10, -10);
    ctx.lineTo(-10, 10);
    ctx.closePath();
    ctx.strokeStyle = 'white';
    ctx.stroke();

    ctx.restore();

    for (let i = 0; i < ship.bullets.length; i++) {
        let bullet = ship.bullets[i];
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
    }

    for (let i = 0; i < asteroids.length; i++) {
        let asteroid = asteroids[i];
        ctx.beginPath();
        ctx.moveTo(asteroid.x + asteroid.vertices[0].x, asteroid.y + asteroid.vertices[0].y);
        for (let j = 1; j < asteroid.vertices.length; j++) {
            ctx.lineTo(asteroid.x + asteroid.vertices[j].x, asteroid.y + asteroid.vertices[j].y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'white';
        ctx.stroke();
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
