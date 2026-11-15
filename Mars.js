
document.addEventListener("DOMContentLoaded", function () {

    const themeToggle = document.getElementById("themeToggle");

    if (!themeToggle) {
        console.error("Theme toggle button not found!");
        return;
    }

    themeToggle.addEventListener("click", function () {

        const currentTheme = document.body.getAttribute("data-theme");

        const newTheme = currentTheme === "dark" ? "light" : "dark";

        document.body.setAttribute("data-theme", newTheme);

        themeToggle.textContent =
            newTheme === "dark" ? "Light mode" : "Dark mode";

        themeToggle.setAttribute(
            "aria-label",
            `Switch to ${newTheme === "dark" ? "light" : "dark"} mode`
        );

    });
});
