//Java script for the moon arrival page

const welcome = document.getElementById("agentWelcome");
const checks = [...document.querySelectorAll("#checklist li")];
const checkStatus = document.getElementById("checkStatus");
const exploreButton = document.getElementById("exploreButton");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let agentName = "";
try {
    agentName = localStorage.getItem("spaceAgentName") || "";
} catch (error) {
    agentName = "";
}

if (agentName) {
    welcome.textContent = `Welcome, Space Agent ${agentName}!`;
}

function wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function runLandingChecks() {
    checks.forEach(check => check.classList.add("pending"));
    checkStatus.textContent = "Running landing checks...";

    await wait(reducedMotion ? 100 : 1000);

    for (const check of checks) {
        check.classList.remove("pending");
        await wait(reducedMotion ? 100 : 800);
    }

    checkStatus.textContent = "All systems go. You are cleared to explore.";
    exploreButton.classList.add("ready");
}

runLandingChecks();
