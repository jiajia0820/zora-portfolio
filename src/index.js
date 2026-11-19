// Bundle fonts, icons and the reveal library locally so the page does not
// depend on overseas CDNs.
import "@fontsource/sora/400.css";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "@fontsource/sora/800.css";
import "font-awesome/css/font-awesome.css";
import ScrollReveal from "scrollreveal";

import initScrollReveal from "./scripts/scrollReveal";
import initTiltEffect from "./scripts/tiltAnimation";
import initUiGallery from "./scripts/uiGallery";
import initContactLinks from "./scripts/contactLinks";
import initHeroInteractions from "./scripts/heroInteractions";
import { targetElements, defaultProps } from "./data/scrollRevealConfig";

window.ScrollReveal = ScrollReveal;

initScrollReveal(targetElements, defaultProps);
initTiltEffect();
initUiGallery();
initContactLinks();
initHeroInteractions();
