// Hero-only interactions: sticky nav state, product-thinking card tabs, and
// count-up stats. Every feature degrades to the static HTML when unsupported.
export default function initHeroInteractions(root = document) {
  const win = root.defaultView || window;
  const reducedMotion =
    typeof win.matchMedia === "function" &&
    win.matchMedia("(prefers-reduced-motion: reduce)").matches;

  initNav(root, win);
  initThinkCard(root, win, reducedMotion);
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

function initThinkCard(root, win, reducedMotion) {
  const card = root.querySelector("[data-think-card]");
  if (!card) return;

  const tabs = [...card.querySelectorAll("[data-think-tab]")];
  const panels = [...card.querySelectorAll("[data-think-panel]")];
  const progress = card.querySelector("[data-think-progress]");
  if (!tabs.length || tabs.length !== panels.length) return;

  const INTERVAL = 7000;
  let current = 0;
  let timer = null;

  const show = (index, { focus = false } = {}) => {
    current = (index + tabs.length) % tabs.length;
    tabs.forEach((tab, i) => {
      const active = i === current;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
    });
    // Restart the line-by-line reveal for the newly shown panel.
    const panel = panels[current];
    panel.classList.remove("is-playing");
    void panel.offsetWidth;
    panel.classList.add("is-playing");
    if (progress) {
      progress.classList.remove("is-running");
      void progress.offsetWidth;
      if (timer) progress.classList.add("is-running");
    }
    if (focus) tabs[current].focus();
  };

  const stop = () => {
    win.clearInterval(timer);
    timer = null;
    if (progress) progress.classList.remove("is-running");
  };

  const start = () => {
    if (reducedMotion || timer) return;
    timer = win.setInterval(() => show(current + 1), INTERVAL);
    if (progress) {
      progress.classList.remove("is-running");
      void progress.offsetWidth;
      progress.classList.add("is-running");
    }
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => {
      stop();
      show(i);
    });
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      stop();
      show(current + (event.key === "ArrowRight" ? 1 : -1), { focus: true });
    });
  });

  card.addEventListener("mouseenter", stop);
  card.addEventListener("focusin", stop);
  card.addEventListener("mouseleave", start);

  // Let the card finish its entrance before the first line-by-line play.
  const begin = () => {
    card.classList.add("is-enhanced");
    show(0);
    start();
  };
  if (reducedMotion) begin();
  else win.setTimeout(begin, 900);
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
