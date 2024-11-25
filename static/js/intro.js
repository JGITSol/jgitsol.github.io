// static/js/intro.js
//tested manually, not working yet

const canvas = document.getElementById("introCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const img = new Image();
img.src = "/static/img/INTRO_ASSTEROID.png";

const music = new Audio("/static/intro_music.mp3"); // Ensure you have an audio file here
music.loop = true;

let frame = 0;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Simulate a CRT screen with scanlines and slight distortion
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = 0.1;
    for (let i = 0; i < canvas.height; i += 4) {
        ctx.fillStyle = (i + frame) % 8 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, i, canvas.width, 2);
    }
    ctx.globalAlpha = 1.0;

    frame++;
    requestAnimationFrame(draw);
}

img.onload = () => {
    draw();
    music.play();

    setTimeout(() => {
        music.pause();
        window.location.href = "/assteroid.html"; // Redirect to the main game page after intro
    }, 5000); // Adjust the timeout duration as needed
};
