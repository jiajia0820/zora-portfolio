// Hero-only interactions: sticky nav state and count-up stats.
// Every feature degrades to the static HTML when unsupported.
export default function initHeroInteractions(root = document) {
  const win = root.defaultView || window;
  const reducedMotion =
    typeof win.matchMedia === "function" &&
    win.matchMedia("(prefers-reduced-motion: reduce)").matches;

  initNav(root, win);
  initCountUp(root, win, reducedMotion);
}

function initNav(root, win) {
  const nav = root.querySelector("[data-site-nav]");
  if (!nav) return;

  const update = () => {
    nav.classList.toggle("is-scrolled", win.scrollY > 24);
  };
  update();
  win.addEventListener("scroll", update, { passive: true });
}

function initCountUp(root, win, reducedMotion) {
  const targets = [...root.querySelectorAll("[data-count-to]")];
  if (!targets.length || reducedMotion || !("IntersectionObserver" in win)) {
    return;
  }

  const format = (value, decimals) =>
    value.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

  const animate = (el) => {
    const to = Number(el.dataset.countTo);
    const from = Number(el.dataset.countFrom || 0);
    const decimals = Number(el.dataset.decimals || 0);
    const duration = 1400;
    const startTime = win.performance.now();

    const step = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = format(from + (to - from) * eased, decimals);
      if (t < 1) win.requestAnimationFrame(step);
    };
    win.requestAnimationFrame(step);
  };

  const observer = new win.IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const el = entry.target;
        const decimals = Number(el.dataset.decimals || 0);
        el.textContent = format(Number(el.dataset.countFrom || 0), decimals);
        // Wait for the stats row to fade in before counting.
        win.setTimeout(() => animate(el), 700);
      });
    },
    { threshold: 0.6 }
  );
  targets.forEach((el) => observer.observe(el));
}
