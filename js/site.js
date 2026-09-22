const ICONS = {
  mark: `<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="1.5" y="1.5" width="29" height="29" rx="8" stroke="#dff25a" stroke-width="1.6"/><path d="M9 22V10l7 8 7-8v12" stroke="#efe9dc" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><rect x="21.5" y="21.5" width="5" height="5" fill="#dff25a"/></svg>`,
  agent: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 12a8 8 0 1 1 3.2 6.4L4 20l1.2-3.2A8 8 0 0 1 4 12Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 12h.01M12 12h.01M15 12h.01" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  linux: `<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M7 18.5h10M8 8.5h.01M8 11.5h8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  su: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 3 4.5 6.5v5.2c0 4.6 3.2 7.8 7.5 9.3 4.3-1.5 7.5-4.7 7.5-9.3V6.5L12 3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 11v4M12 8.2h.01" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  models: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 3 20 7.5v9L12 21 4 16.5v-9L12 3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 12 20 7.5M12 12 4 7.5M12 12v9" stroke="currentColor" stroke-width="1.6"/></svg>`,
  think: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="11" r="6.5" stroke="currentColor" stroke-width="1.6"/><path d="M9.5 20h5M8 17.2c.8.6 2.1 1 4 1s3.2-.4 4-1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="11" r="2.2" stroke="currentColor" stroke-width="1.6"/></svg>`,
  swarm: `<svg viewBox="0 0 24 24" fill="none"><circle cx="6" cy="7" r="2.2" stroke="currentColor" stroke-width="1.6"/><circle cx="18" cy="7" r="2.2" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="17" r="2.4" stroke="currentColor" stroke-width="1.6"/><path d="M8 8.6 10.4 15M16 8.6 13.6 15M8.2 7h7.6" stroke="currentColor" stroke-width="1.6"/></svg>`,
  gate: `<svg viewBox="0 0 24 24" fill="none"><path d="M4 20V6l8-3 8 3v14" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M4 11h16M12 3v17M8 11v9M16 11v9" stroke="currentColor" stroke-width="1.6"/></svg>`,
  skill: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 5.5h9.5L19 10v9.5H5V5.5Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M14.5 5.5V10H19M8 14h8M8 17h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 4v11M8 11.5 12 16l4-4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 19h14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  apk: `<svg viewBox="0 0 24 24" fill="none"><path d="M7 8h10l1.5 12h-13L7 8Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 8V6.5A3 3 0 0 1 15 6.5V8M10 12v4M14 12v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none"><rect x="7" y="3" width="10" height="18" rx="2.2" stroke="currentColor" stroke-width="1.6"/><path d="M11 18.5h2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  disk: `<svg viewBox="0 0 24 24" fill="none"><ellipse cx="12" cy="7" rx="8" ry="3.2" stroke="currentColor" stroke-width="1.6"/><path d="M4 7v10c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2V7" stroke="currentColor" stroke-width="1.6"/><path d="M4 12c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2" stroke="currentColor" stroke-width="1.6"/></svg>`,
  globe: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.6"/><path d="M4 12h16M12 4c2.4 2.6 3.6 5.3 3.6 8S14.4 17.4 12 20c-2.4-2.6-3.6-5.3-3.6-8S9.6 6.6 12 4Z" stroke="currentColor" stroke-width="1.6"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.6"/><path d="M12 8v4.5L15 15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  parallel: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 6h6v12H5V6Zm8 3h6v9h-6V9Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`,
  clamp: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 12h3M16 12h3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><rect x="9" y="8" width="6" height="8" rx="1.4" stroke="currentColor" stroke-width="1.6"/></svg>`,
  ubuntu: `<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3.1" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="4.8" r="1.6" stroke="currentColor" stroke-width="1.5"/><circle cx="18.3" cy="15.6" r="1.6" stroke="currentColor" stroke-width="1.5"/><circle cx="5.7" cy="15.6" r="1.6" stroke="currentColor" stroke-width="1.5"/><path d="M12 7.2V9M16.6 14.3l-1.5-.9M7.4 14.3l1.5-.9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  coexist: `<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="8" height="14" rx="1.6" stroke="currentColor" stroke-width="1.6"/><rect x="13" y="5" width="8" height="14" rx="1.6" stroke="currentColor" stroke-width="1.6"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" fill="none"><path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="none"><path d="M12 3.5 14.8 9l6 .9-4.4 4.2 1.1 5.9L12 17.3 6.5 20l1.1-5.9L3.2 9.9 9.2 9 12 3.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" fill="none"><path d="M20 12a8 8 0 1 1-2.4-5.7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M20 3.5V8h-4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  bolt: `<svg viewBox="0 0 24 24" fill="none"><path d="M13 3 5 13.5h5.5L10 21l8-10.5h-5.5L13 3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`
};

function applyIcons(root = document) {
  root.querySelectorAll("[data-ico]").forEach((el) => {
    const name = el.getAttribute("data-ico");
    const svg = ICONS[name];
    if (!svg) return;
    el.innerHTML = svg.indexOf("xmlns=") >= 0 ? svg : svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
    el.classList.add("ico");
  });
}
window.__applyIcons = applyIcons;

function initNav() {
  const btn = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (btn && nav) {
    const setOpen = (open) => {
      nav.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
      const ico = btn.querySelector("[data-ico]");
      if (ico) {
        ico.setAttribute("data-ico", open ? "close" : "menu");
        applyIcons(btn);
      }
    };
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      setOpen(!nav.classList.contains("open"));
    });
    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => setOpen(false));
    });
    document.addEventListener("click", (e) => {
      if (!nav.classList.contains("open")) return;
      if (nav.contains(e.target) || btn.contains(e.target)) return;
      setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }
  const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".nav a").forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href === file || (file === "" && href === "index.html")) {
      a.setAttribute("aria-current", "page");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applyIcons();
  initNav();
});
