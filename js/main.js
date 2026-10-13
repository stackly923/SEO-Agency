const menu = document.querySelector(".menu-toggle"),
  nav = document.querySelector("#navigation");
function closeMenu() {
  menu.setAttribute("aria-expanded", "false");
  menu.setAttribute("aria-label", "Open navigation");
  nav.classList.remove("open");
  document.body.classList.remove("menu-open");
}
menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
  nav.classList.toggle("open", open);
  document.body.classList.toggle("menu-open", open);
});
nav
  .querySelectorAll("a")
  .forEach((a) => a.addEventListener("click", closeMenu));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav.classList.contains("open")) {
    closeMenu();
    menu.focus();
  }
  if (e.key === "Tab" && nav.classList.contains("open")) {
    const all = [menu, ...nav.querySelectorAll("a")],
      first = all[0],
      last = all.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
matchMedia("(min-width:801px)").addEventListener("change", (e) => {
  if (e.matches) closeMenu();
});
const header = document.querySelector(".site-header");
function scrollState() {
  header.classList.toggle("scrolled", window.scrollY > 20);
}
addEventListener("scroll", scrollState, { passive: true });
scrollState();
document.querySelectorAll(".faq-toggle").forEach((b) =>
  b.addEventListener("click", () => {
    const open = b.getAttribute("aria-expanded") !== "true";
    b.setAttribute("aria-expanded", String(open));
    document.getElementById(b.getAttribute("aria-controls")).hidden = !open;
    b.querySelector("span").textContent = open ? "−" : "+";
  }),
);
document.querySelectorAll("[data-testimonial]").forEach((b) =>
  b.addEventListener("click", () => {
    const row = b.parentElement.nextElementSibling;
    row.scrollBy({
      left:
        (b.dataset.testimonial === "next" ? 1 : -1) * (row.clientWidth + 24),
      behavior: matchMedia("(prefers-reduced-motion:reduce)").matches
        ? "auto"
        : "smooth",
    });
  }),
);

