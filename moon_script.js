//Java script for the moon webpage
document.documentElement.classList.add("js");

const menu = document.querySelector(".nav-dropdown");
const missions = [...document.querySelectorAll(".mission")];
const cards = [...document.querySelectorAll(".card")];
const yearLinks = [...document.querySelectorAll(".year-nav a")];
const greeting = document.getElementById("agentGreeting");
const explored = document.getElementById("explored");
const marsButton = document.getElementById("marsButton");
const exploredMissions = new Set();

let storedName = "";
try {
    storedName = localStorage.getItem("spaceAgentName") || "";
} catch (error) {
    storedName = "";
}

if (storedName) {
    greeting.textContent = `Welcome back, Space Agent ${storedName}. Scroll down to explore each mission.`;
    greeting.hidden = false;
}

document.addEventListener("click", (event) => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.open) {
        menu.open = false;
        menu.querySelector("summary").focus();
    }
});

function yearOf(mission) {
    let current = mission;
    while (current && !current.id) current = current.previousElementSibling;
    return current ? current.id : "";
}

function updateExplored() {
    const total = missions.length;
    const count = exploredMissions.size;
    explored.hidden = false;
    if (count === total) {
        explored.textContent = `All ${total} missions explored. You are ready for Mars!`;
        marsButton.classList.add("is-ready");
    } else {
        explored.textContent = `You have explored ${count} of ${total} missions so far.`;
    }
}

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
        });
    }, { threshold: 0.15 });

    cards.forEach((card) => revealObserver.observe(card));

    const currentObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const year = yearOf(entry.target);
            missions.forEach((mission) => mission.classList.toggle("is-current", mission === entry.target));
            yearLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${year}`));
            exploredMissions.add(entry.target);
            updateExplored();
        });
    }, { rootMargin: "-45% 0px -45% 0px" });

    missions.forEach((mission) => currentObserver.observe(mission));
    updateExplored();
} else {
    cards.forEach((card) => card.classList.add("is-visible"));
}