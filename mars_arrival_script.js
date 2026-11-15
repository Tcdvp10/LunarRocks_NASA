/* =====================================
   MOON -> MARS TRANSIT
   The rocket flies smoothly from 0% to 100% without stopping.
   The text changes as it passes each stage.
   Then the page opens Mars.html.
===================================== */


/* =====================================
   ELEMENTS
===================================== */

const flight = document.getElementById("flight");
const kicker = document.getElementById("kicker");
const heading = document.getElementById("heading");
const message = document.getElementById("message");
const percent = document.getElementById("percent");
const stageItems = [...document.querySelectorAll("#stages li")];

const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");


/* =====================================
   SETTINGS
===================================== */

const DESTINATION = "Mars.html";

// How long the whole trip takes, in milliseconds.
const JOURNEY_TIME = 6000;

// How long to stay on "WELCOME TO MARS" before opening Mars.html.
const ARRIVAL_PAUSE = 1800;

// Each stage starts when the rocket reaches its percent.
const STAGES = [
    {
        percent: 0,
        kicker: "LEAVING LUNAR BASE",
        heading: "GETTING READY FOR MARS",
        message: "Loading Moon rocks and checking the engines..."
    },
    {
        percent: 20,
        kicker: "ENGINE STATUS",
        heading: "LIFTOFF FROM THE MOON",
        message: "Goodbye, Moon! Climbing away from the surface..."
    },
    {
        percent: 60,
        kicker: "DEEP SPACE",
        heading: "CRUISING TO MARS",
        message: "More than halfway there. The red planet is getting bigger..."
    },
    {
        percent: 85,
        kicker: "DESTINATION IN SIGHT",
        heading: "APPROACHING MARS",
        message: "Slowing down and getting ready to land..."
    },
    {
        percent: 100,
        kicker: "MISSION DESTINATION REACHED",
        heading: "WELCOME TO MARS",
        message: "Touchdown confirmed. Opening the hatch..."
    }
];

const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

const STAR_COUNT = 160;

let width = window.innerWidth;
let height = window.innerHeight;
let stars = [];
let starSpeed = 0.2;
let currentStage = -1;


/* =====================================
   WAIT HELPER
===================================== */

function wait(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}


/* =====================================
   AGENT NAME (saved by launch.js)
===================================== */

function getAgentName() {
    try {
        return localStorage.getItem("spaceAgentName") || "";
    } catch (error) {
        return "";
    }
}

const agentName = getAgentName();


/* =====================================
   STARFIELD
   Stars drift downwards so the rocket looks like it is
   flying up. They move faster while the rocket is moving.
===================================== */

function createStars() {
    stars = [];

    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1.6 + 0.4,
            depth: Math.random() * 0.8 + 0.2
        });
    }
}

function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    createStars();
    drawStars();
}

function drawStars() {
    ctx.clearRect(0, 0, width, height);

    for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.35 + star.depth * 0.6})`;
        ctx.fill();
    }
}

function animateStars() {
    for (const star of stars) {
        star.y += starSpeed * star.depth;

        if (star.y > height) {
            star.y = 0;
            star.x = Math.random() * width;
        }
    }

    drawStars();
    requestAnimationFrame(animateStars);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

if (!reducedMotion) {
    animateStars();
}


/* =====================================
   SHOW ONE STAGE (text and checklist only)
===================================== */

function showStage(index) {
    const stage = STAGES[index];

    currentStage = index;

    kicker.textContent = agentName
        ? `AGENT ${agentName.toUpperCase()} · ${stage.kicker}`
        : stage.kicker;

    heading.textContent = stage.heading;
    message.textContent = stage.message;

    stageItems.forEach((item, itemIndex) => {
        item.classList.toggle("is-done", itemIndex < index);
        item.classList.toggle("is-active", itemIndex === index);
    });
}


/* =====================================
   MOVE THE ROCKET
   value is a number from 0 to 100.
===================================== */

function setProgress(value) {
    // Move the rocket and the yellow line (see .flight in the CSS)
    flight.style.setProperty("--progress", value / 100);
    flight.setAttribute("aria-valuenow", Math.round(value));
    percent.textContent = Math.round(value);

    // Find the last stage the rocket has reached
    let reached = 0;

    STAGES.forEach((stage, index) => {
        if (value >= stage.percent) reached = index;
    });

    if (reached !== currentStage) {
        showStage(reached);
    }
}


/* =====================================
   MAIN SEQUENCE
   One smooth flight from 0 to 100.
===================================== */

function runJourney() {
    const duration = reducedMotion ? 3000 : JOURNEY_TIME;
    const startTime = performance.now();

    flight.classList.add("is-moving");
    starSpeed = 6;

    function step(now) {
        const amount = Math.min(1, (now - startTime) / duration);

        setProgress(amount * 100);

        if (amount < 1) {
            requestAnimationFrame(step);
            return;
        }

        arrive();
    }

    requestAnimationFrame(step);
}

async function arrive() {
    flight.classList.remove("is-moving");
    starSpeed = 0.2;

    await wait(reducedMotion ? 700 : ARRIVAL_PAUSE);

    stageItems.forEach(item => {
        item.classList.remove("is-active");
        item.classList.add("is-done");
    });

    window.location.assign(DESTINATION);
}

setProgress(0);
runJourney();
