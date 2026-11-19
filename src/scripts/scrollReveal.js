export default function initScrollReveal(targetElements, defaultProps) {
  if (!targetElements.length) return;

  // Keep the page readable when the optional animation CDN is unavailable.
  if (
    typeof window.ScrollReveal !== "function" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    document.documentElement.classList.remove("sr");
    return;
  }

  ScrollReveal({ reset: false });

  targetElements.forEach(({ element, animation }) => {
    ScrollReveal().reveal(element, Object.assign({}, defaultProps, animation));
  });
}
