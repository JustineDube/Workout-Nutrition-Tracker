// Load dynamic header/nav, streak badge updates

import { qs, getCurrentStreak } from "./utils.mjs";

const NAV_LINKS = [
  { href: "/index.html", label: "Dashboard" },
  { href: "/exercises.html", label: "Exercises" },
  { href: "/workout.html", label: "Log Workout" },
  { href: "/history.html", label: "History" },
  { href: "/nutrition.html", label: "Nutrition" },
];

const DUMBBELL_ICON = `
  <svg class="brand-icon" viewBox="0 0 32 32" aria-hidden="true">
    <rect x="2" y="13" width="4" height="6" rx="1" fill="currentColor"/>
    <rect x="7" y="10" width="3" height="12" rx="1" fill="currentColor"/>
    <rect x="10" y="14" width="12" height="4" rx="1" fill="currentColor"/>
    <rect x="22" y="10" width="3" height="12" rx="1" fill="currentColor"/>
    <rect x="26" y="13" width="4" height="6" rx="1" fill="currentColor"/>
  </svg>
`;

export function loadHeader() {
  const header = qs("#main-header");
  if (!header) return;

  const currentPath = window.location.pathname.split("/").pop() || "index.html";

  const links = NAV_LINKS.map((link) => {
    const linkPath = link.href.split("/").pop();
    const activeClass = linkPath === currentPath ? " active" : "";
    return `<li><a class="nav-link${activeClass}" href="${link.href}">${link.label}</a></li>`;
  }).join("");

  header.innerHTML = `
    <div class="header-inner">
      <a class="brand" href="/index.html">
        ${DUMBBELL_ICON}
        <span class="brand-name">FitTrack</span>
      </a>
      <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <nav class="main-nav" id="main-nav" aria-label="Primary">
        <ul>${links}</ul>
      </nav>
      <div class="streak-badge" id="streak-badge" title="Consecutive days logged">
        <span class="streak-icon" aria-hidden="true">&#128293;</span>
        <span id="streak-count">0</span>
        <span class="streak-label">day streak</span>
      </div>
    </div>
  `;

  updateStreakBadge();

  const toggle = qs("#nav-toggle");
  const nav = qs("#main-nav");
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

export function updateStreakBadge() {
  const streakCount = qs("#streak-count");
  if (streakCount) streakCount.textContent = getCurrentStreak();
}
