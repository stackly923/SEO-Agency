if (
  "IntersectionObserver" in window &&
  !matchMedia("(prefers-reduced-motion:reduce)").matches
) {
  document.documentElement.classList.add("js-reveal");
  const obs = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          obs.unobserve(e.target);
        }
      }),
    { threshold: 0.06 },
  );
  document.querySelectorAll(".reveal").forEach((e) => obs.observe(e));
  const counters = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const el = e.target,
            end = Number(el.dataset.count),
            decimal = String(end).includes("."),
            start = performance.now();
          function tick(now) {
            const t = Math.min(1, (now - start) / 1200),
              value = end * (1 - Math.pow(1 - t, 3));
            el.textContent = decimal ? value.toFixed(1) : Math.round(value);
            if (t < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          counters.unobserve(el);
        }
      }),
    { threshold: 0.5 },
  );
  document.querySelectorAll("[data-count]").forEach((e) => counters.observe(e));
}
