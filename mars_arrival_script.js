/* =====================================
   MOON -> MARS TRANSIT
   The rocket moves in steps: it waits, jumps to 20%,
   waits again, jumps to 60%, and so on until 100%.
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

// How long the rocket takes to move between two stops.
// Keep this the same as the 1.8s transition in mars_arrival_styles.css.
const TRAVEL_TIME = 1800;

// Each stage: where the rocket stops (percent), how long it
// stays there (hold, in milliseconds) and the text to show.
const STAGES = [
    {
        percent: 0,
        hold: 2500,
        kicker: "LEAVING LUNAR BASE",
        heading: "GETTING READY FOR MARS",
        message: "Loading Moon rocks and checking the engines..."
    },
    {
        percent: 20,
        hold: 2500,
        kicker: "ENGINE STATUS",
        heading: "LIFTOFF FROM THE MOON",
        message: "Goodbye, Moon! Climbing away from the surface..."
    },
    {
        percent: 60,
        hold: 3000,
        kicker: "DEEP SPACE",
        heading: "CRUISING TO MARS",
        message: "More than halfway there. The red planet is getting bigger..."
    },
    {
        percent: 85,
        hold: 2500,
        kicker: "DESTINATION IN SIGHT",
        heading: "APPROACHING MARS",
        message: "Slowing down and getting ready to land..."
    },
    {
        percent: 100,
        hold: 1800,
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
let shownPercent = 0;


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
   PERCENT COUNTER
   Counts the big number up smoothly, e.g. 20 -> 60.
===================================== */

function countTo(target, duration) {
    const start = shownPercent;
    const startTime = performance.now();

    function step(now) {
        const progress = Math.min(1, (now - startTime) / duration);

        shownPercent = Math.round(start + (target - start) * progress);
        percent.textContent = shownPercent;

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}


/* =====================================
   SHOW ONE STAGE
===================================== */

function showStage(index) {
    const stage = STAGES[index];

    kicker.textContent = agentName
        ? `AGENT ${agentName.toUpperCase()} · ${stage.kicker}`
        : stage.kicker;

    heading.textContent = stage.heading;
    message.textContent = stage.message;

    // Move the rocket and the yellow line (see .flight in the CSS)
    flight.style.setProperty("--progress", stage.percent / 100);
    flight.setAttribute("aria-valuenow", stage.percent);

    // Update the checklist dots
    stageItems.forEach((item, itemIndex) => {
        item.classList.toggle("is-done", itemIndex < index);
        item.classList.toggle("is-active", itemIndex === index);
    });
}


/* =====================================
   MAIN SEQUENCE
===================================== */

async function runJourney() {
    for (let index = 0; index < STAGES.length; index++) {
        const stage = STAGES[index];
        const isMoving = index > 0;
        const travel = reducedMotion ? 0 : TRAVEL_TIME;

        showStage(index);

        if (isMoving) {
            flight.classList.add("is-moving");
            starSpeed = 6;
            countTo(stage.percent, Math.max(travel, 1));

            await wait(travel);

            flight.classList.remove("is-moving");
            starSpeed = 0.2;
        }

        // The "delay" at each stop
        await wait(reducedMotion ? 700 : stage.hold);
    }

    stageItems.forEach(item => {
        item.classList.remove("is-active");
        item.classList.add("is-done");
    });

    window.location.assign(DESTINATION);
}

runJourney();
