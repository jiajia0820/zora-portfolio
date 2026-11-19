export default function initUiGallery(root = document) {
  const section = root.querySelector("#ui-works");
  if (!section) return null;

  const track = section.querySelector("[data-gallery-track]");
  const prevBtn = section.querySelector("[data-gallery-prev]");
  const nextBtn = section.querySelector("[data-gallery-next]");
  const progressBar = section.querySelector("[data-gallery-progress]");
  const statusEl = section.querySelector("[data-gallery-status]");
  const cards = [...section.querySelectorAll(".ui-card")];
  const lightbox = root.querySelector("[data-gallery-lightbox]");
  const lightboxImg = lightbox
    ? lightbox.querySelector("[data-lightbox-img]")
    : null;
  const lightboxCaption = lightbox
    ? lightbox.querySelector("[data-lightbox-caption]")
    : null;
  const lightboxClose = lightbox
    ? lightbox.querySelector("[data-lightbox-close]")
    : null;
  const lightboxPrev = lightbox
    ? lightbox.querySelector("[data-lightbox-prev]")
    : null;
  const lightboxNext = lightbox
    ? lightbox.querySelector("[data-lightbox-next]")
    : null;

  if (!track || cards.length === 0) return null;

  const formatIndex = (value) => String(value).padStart(2, "0");

  const syncState = () => {
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const current = Math.min(maxScroll, Math.max(0, track.scrollLeft));
    const ratio = maxScroll > 0 ? current / maxScroll : 0;

    if (prevBtn) prevBtn.disabled = current <= 2;
    if (nextBtn) nextBtn.disabled = maxScroll <= 2 || current >= maxScroll - 2;

    if (progressBar) {
      const visibleRatio =
        track.scrollWidth > 0
          ? Math.min(1, Math.max(0.22, track.clientWidth / track.scrollWidth))
          : 1;
      const thumbWidthPercent = visibleRatio * 100;
      const maxTranslatePercent =
        visibleRatio < 1 ? ((1 - visibleRatio) / visibleRatio) * 100 : 0;
      progressBar.style.width = `${thumbWidthPercent.toFixed(2)}%`;
      progressBar.style.transform = `translateX(${(
        ratio * maxTranslatePercent
      ).toFixed(2)}%)`;
    }

    if (statusEl) {
      const activeIndex = Math.min(
        cards.length,
        Math.max(1, Math.round(ratio * (cards.length - 1)) + 1)
      );
      statusEl.textContent = `${formatIndex(activeIndex)} / ${formatIndex(
        cards.length
      )}`;
    }
  };

  const scrollByStep = (direction) => {
    const step = Math.max(260, Math.round(track.clientWidth * 0.45));
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const target = Math.min(
      maxScroll,
      Math.max(0, track.scrollLeft + direction * step)
    );
    if (typeof track.scrollTo === "function") {
      track.scrollTo({ left: target, behavior: "smooth" });
    } else {
      track.scrollLeft = target;
    }
    syncState();
  };

  if (prevBtn) {
    prevBtn.addEventListener("click", () => scrollByStep(-1));
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => scrollByStep(1));
  }

  track.addEventListener("scroll", syncState, { passive: true });
  if (typeof window !== "undefined" && window.addEventListener) {
    window.addEventListener("resize", syncState);
  }

  track.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollByStep(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollByStep(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      track.scrollLeft = 0;
      syncState();
    } else if (event.key === "End") {
      event.preventDefault();
      track.scrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);
      syncState();
    }
  });

  let pointerActive = false;
  let dragged = false;
  let startX = 0;
  let startScrollLeft = 0;

  track.addEventListener("pointerdown", (event) => {
    if (event.pointerType && event.pointerType !== "mouse") return;
    if (event.button && event.button !== 0) return;
    pointerActive = true;
    dragged = false;
    startX = event.clientX;
    startScrollLeft = track.scrollLeft;
  });

  track.addEventListener("pointermove", (event) => {
    if (!pointerActive) return;
    const deltaX = event.clientX - startX;
    if (Math.abs(deltaX) > 6 && !dragged) {
      dragged = true;
      track.classList.add("is-dragging");
      if (
        typeof track.setPointerCapture === "function" &&
        event.pointerId != null
      ) {
        track.setPointerCapture(event.pointerId);
      }
    }
    if (dragged) {
      track.scrollLeft = startScrollLeft - deltaX;
      syncState();
    }
  });

  const stopDragging = (event) => {
    if (!pointerActive) return;
    pointerActive = false;
    track.classList.remove("is-dragging");
    if (
      event &&
      typeof track.releasePointerCapture === "function" &&
      event.pointerId != null
    ) {
      try {
        track.releasePointerCapture(event.pointerId);
      } catch {
        // Ignore if pointer was not captured.
      }
    }
    if (dragged && typeof setTimeout === "function") {
      setTimeout(() => {
        dragged = false;
      }, 0);
    }
  };

  track.addEventListener("pointerup", stopDragging);
  track.addEventListener("pointercancel", stopDragging);

  let lastTrigger = null;
  let activeLightboxIndex = -1;
  const zoomableItems = [];

  const closeLightbox = () => {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    activeLightboxIndex = -1;
    if (lightboxImg) {
      lightboxImg.removeAttribute("src");
      lightboxImg.alt = "";
    }
    if (lastTrigger && typeof lastTrigger.focus === "function") {
      lastTrigger.focus();
    }
    lastTrigger = null;
  };

  const showLightboxAt = (index, triggerCard = null) => {
    if (!lightbox || !lightboxImg || zoomableItems.length === 0) return;
    const normalized =
      ((index % zoomableItems.length) + zoomableItems.length) %
      zoomableItems.length;
    const { card, img } = zoomableItems[normalized];
    const src = img.getAttribute("src");
    if (!src) return;
    activeLightboxIndex = normalized;
    if (triggerCard) lastTrigger = triggerCard;
    lightboxImg.setAttribute("src", src);
    lightboxImg.alt = img.alt || "";
    if (lightboxCaption) {
      const titleEl = card.querySelector(".ui-card__title");
      const tagEl = card.querySelector(".ui-card__tag");
      const dataTag = card.getAttribute ? card.getAttribute("data-tag") : null;
      const parts = [
        dataTag ? dataTag.trim() : tagEl ? tagEl.textContent.trim() : "",
        titleEl ? titleEl.textContent.trim() : "",
      ].filter(Boolean);
      lightboxCaption.textContent = parts.join(" · ");
    }
    const wasHidden = lightbox.hidden;
    lightbox.hidden = false;
    if (
      wasHidden &&
      lightboxClose &&
      typeof lightboxClose.focus === "function"
    ) {
      lightboxClose.focus();
    }
  };

  for (const card of cards) {
    const img = card.querySelector("img.ui-card__img");
    if (!img) continue;
    const itemIndex = zoomableItems.length;
    zoomableItems.push({ card, img });
    img.addEventListener("load", syncState);
    card.setAttribute("data-zoomable", "true");
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.addEventListener("click", (event) => {
      if (dragged) {
        event.preventDefault();
        dragged = false;
        return;
      }
      showLightboxAt(itemIndex, card);
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showLightboxAt(itemIndex, card);
      }
    });
  }

  if (lightbox) {
    if (lightboxClose) {
      lightboxClose.addEventListener("click", closeLightbox);
    }
    if (lightboxPrev) {
      lightboxPrev.addEventListener("click", () => {
        if (!lightbox.hidden && activeLightboxIndex >= 0) {
          showLightboxAt(activeLightboxIndex - 1);
        }
      });
    }
    if (lightboxNext) {
      lightboxNext.addEventListener("click", () => {
        if (!lightbox.hidden && activeLightboxIndex >= 0) {
          showLightboxAt(activeLightboxIndex + 1);
        }
      });
    }
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
    if (typeof root.addEventListener === "function") {
      root.addEventListener("keydown", (event) => {
        if (lightbox.hidden) return;
        if (event.key === "Escape") {
          closeLightbox();
        } else if (event.key === "ArrowRight" && activeLightboxIndex >= 0) {
          event.preventDefault();
          showLightboxAt(activeLightboxIndex + 1);
        } else if (event.key === "ArrowLeft" && activeLightboxIndex >= 0) {
          event.preventDefault();
          showLightboxAt(activeLightboxIndex - 1);
        }
      });
    }
  }

  syncState();
  return { syncState, scrollByStep, closeLightbox };
}
