export default function initContactLinks(root = document) {
  const link = root.querySelector("[data-bonjour-code]");
  if (!link) return;

  const code = link.getAttribute("data-bonjour-code");
  if (!code) return;

  const icon = link.querySelector("[data-bonjour-icon]");
  const copiedIcon = link.querySelector("[data-bonjour-copied]");
  const status = root.querySelector("[data-contact-status]");

  link.addEventListener("click", async (event) => {
    if (
      event.button > 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    // The text-file link remains usable without JavaScript or Clipboard API support.
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      return;
    }

    event.preventDefault();
    try {
      await navigator.clipboard.writeText(code);
      if (icon) icon.hidden = true;
      if (copiedIcon) copiedIcon.hidden = false;
      link.title = "Bonjour 口令已复制，请在微信中粘贴打开";
      if (status) {
        status.textContent = "Bonjour 小程序口令已复制，请在微信中粘贴打开。";
      }
    } catch {
      window.prompt("复制以下口令，在微信中粘贴打开 Bonjour：", code);
    }
  });
}
