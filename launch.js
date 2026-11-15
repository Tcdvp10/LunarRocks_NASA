
/* =====================================
   ELEMENTS
===================================== */

const agentForm = document.getElementById("agentForm");
const agentName = document.getElementById("agentName");
const welcomeName = document.getElementById("welcomeName");

const missionControl = document.getElementById("missionControl");
const warpOverlay = document.getElementById("warpOverlay");

const warpKicker = document.getElementById("warpKicker");
const warpHeading = document.getElementById("warpHeading");
const warpMessage = document.getElementById("warpMessage");

const countdownContainer = document.getElementById("countdownContainer");
const countdown = document.getElementById("countdown");

const warpProgress = document.getElementById("warpProgress");

const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

const warpVideo = document.getElementById("warpVideo");


/* =====================================
   SETTINGS
===================================== */

const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

const STAR_COUNT = 260;

let width = window.innerWidth;
let height = window.innerHeight;

let stars = [];
let warpSpeed = 0.35;
let launchStarted = false;


/* =====================================
   WAIT HELPER
===================================== */

function wait(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}


/* =====================================
   STARFIELD
===================================== */

function createStars() {
    stars = [];

    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: (Math.random() - 0.5) * width,
            y: (Math.random() - 0.5) * height,
            z: Math.random() * width
        });
    }
}


function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * ratio;
    canvas.height = height * ratio;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    createStars();
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();


/* =====================================
   ANIMATE STARS
===================================== */

function animateStars() {
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    for (const star of stars) {
        const oldZ = star.z;

        star.z -= warpSpeed;

        if (star.z <= 1) {
            star.x = (Math.random() - 0.5) * width;
            star.y = (Math.random() - 0.5) * height;
            star.z = width;
            continue;
        }

        const x = centerX + (star.x / star.z) * width;
        const y = centerY + (star.y / star.z) * height;

        const oldX = centerX + (star.x / oldZ) * width;
        const oldY = centerY + (star.y / oldZ) * height;

        const brightness = Math.max(0.2, 1 - star.z / width);
        const radius = Math.max(0.5, (1 - star.z / width) * 2.2);

        ctx.beginPath();

        if (warpSpeed > 4) {
            ctx.moveTo(oldX, oldY);
            ctx.lineTo(x, y);

            ctx.strokeStyle = `rgba(170, 215, 255, ${brightness})`;
            ctx.lineWidth = Math.min(3, radius + 0.5);
            ctx.stroke();
        } else {
            ctx.arc(x, y, radius, 0, Math.PI * 2);

            ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            ctx.fill();
        }
    }

    requestAnimationFrame(animateStars);
}

animateStars();


/* =====================================
   WARP VIDEO
===================================== */

function startWarpTunnel() {
    if (!warpVideo) {
        console.error("Missing #warpVideo element in HTML.");
        return;
    }

    warpVideo.pause();
    warpVideo.currentTime = 0;

    const playPromise = warpVideo.play();

    if (playPromise) {
        playPromise.catch(error => {
            console.error("Warp video failed:", error);
            warpMessage.textContent =
                "Warp video unavailable. Check warp.mp4.";
        });
    }
}


function stopWarpTunnel() {
    if (!warpVideo) return;

    warpVideo.pause();
    warpVideo.currentTime = 0;
}


/* =====================================
   LIVE NAME PREVIEW
===================================== */

agentName.addEventListener("input", () => {
    const name = agentName.value.trim();

    welcomeName.textContent = name ? ` ${name}` : "";
});


/* =====================================
   COUNTDOWN
===================================== */

async function runCountdown() {
    countdownContainer.hidden = false;

    warpKicker.textContent = "LUNAR DESTINATION LOCKED";
    warpHeading.textContent = "WARP JUMP INITIATED";

    for (let number = 10; number >= 0; number--) {
        countdown.textContent = number;

        countdown.style.animation = "none";
        void countdown.offsetWidth;
        countdown.style.animation = "";

        const elapsed = 10 - number;

        warpProgress.style.width = `${elapsed * 10}%`;

        warpMessage.textContent = "Travel in progress...";

        if (number > 0) {
            await wait(reducedMotion ? 100 : 1000);
        }
    }

    await wait(reducedMotion ? 100 : 1000);

    await arriveAtDestination();
}


/* =====================================
   ARRIVAL AT THE MOON
===================================== */

async function arriveAtDestination() {
    stopWarpTunnel();

    warpOverlay.classList.remove("warp-active");
    warpOverlay.classList.add("arriving");

    warpKicker.textContent = "MISSION DESTINATION REACHED";
    warpHeading.textContent = "WELCOME TO THE MOON";
    warpMessage.textContent = "Preparing lunar landing...";

    warpSpeed = 0;

    warpProgress.style.width = "100%";

    await wait(reducedMotion ? 100 : 1500);

    window.location.assign("moon_arrival.html");
}


/* =====================================
   MAIN LAUNCH SEQUENCE
===================================== */

agentForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (launchStarted) return;

    const name = agentName.value.trim();

    if (!name) {
        agentName.focus();
        return;
    }

    launchStarted = true;

    // Save agent name

    try {
        localStorage.setItem("spaceAgentName", name);
    } catch (error) {
        console.warn("Could not save agent name.", error);
    }

    agentForm.querySelector("button").disabled = true;

    document.body.classList.add("launching");

    warpOverlay.hidden = false;
    warpOverlay.setAttribute("aria-hidden", "false");

    countdownContainer.hidden = true;
    warpProgress.style.width = "0%";

    //Adjusting the first value on the ratio affects delay time
    // PHASE 1: AUTHORIZATION

    warpKicker.textContent = "MISSION CONTROL // AUTHORIZED";
    warpHeading.textContent = `WELCOME ABOARD, ${name.toUpperCase()}`;
    warpMessage.textContent = "Verifying astronaut identification...";

    warpSpeed = reducedMotion ? 0 : 0.5;

    await wait(reducedMotion ? 500 : 8000);


    // PHASE 2: SYSTEM INITIALIZATION

    warpKicker.textContent = "SPACECRAFT SYSTEMS";
    warpHeading.textContent = "INITIALIZING SYSTEMS";
    warpMessage.textContent = "Checking navigation and life support...";

    await wait(reducedMotion ? 500 : 8000);


    // PHASE 3: ENGINE IGNITION

    warpKicker.textContent = "ENGINE STATUS";
    warpHeading.textContent = "IGNITING ENGINES";
    warpMessage.textContent = "Main engines powering up...";

    await wait(reducedMotion ? 400 : 8000);


    // PHASE 4: FINAL CLEARANCE

    warpKicker.textContent = "MISSION CONTROL";
    warpHeading.textContent = "ALL SYSTEMS GO";
    warpMessage.textContent = "Launch clearance confirmed. Prepare for departure.";

    await wait(reducedMotion ? 500 : 8000);


    // PHASE 5: LIFTOFF

    warpKicker.textContent = "LAUNCH SEQUENCE INITIATED";
    warpHeading.textContent = "LIFTOFF!";
    warpMessage.textContent = "Leaving Earth's atmosphere...";

    warpSpeed = reducedMotion ? 0 : 8;

    await wait(reducedMotion ? 400 : 8000);
    //Adjusting the first value on the ratio affects delay time

    // PHASE 6: HYPERSPACE

    missionControl.hidden = true;

    warpOverlay.classList.add("warp-active");

    warpKicker.textContent = "HYPERSPACE DRIVE ACTIVATED";
    warpHeading.textContent = "ENTERING WARP SPACE";
    warpMessage.textContent = "Preparing interstellar travel...";

    startWarpTunnel();

    warpSpeed = reducedMotion ? 0 : 24;

    await wait(reducedMotion ? 600 : 8000);

    warpMessage.textContent = "Accelerating towards the Moon...";

    await wait(reducedMotion ? 400 : 8000);


    // PHASE 7: COUNTDOWN

    await runCountdown();

});
