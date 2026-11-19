export const defaultProps = {
  easing: "cubic-bezier(0.5, 0, 0, 1)",
  distance: "30px",
  duration: 1000,
  desktop: true,
  mobile: true,
};

export const targetElements = [
  {
    element: ".section-title",
    animation: {
      delay: 300,
      distance: "0px",
      origin: "bottom",
    },
  },
  {
    element: ".hero-title",
    animation: {
      delay: 350,
      origin: window.innerWidth > 768 ? "left" : "bottom",
    },
  },
  {
    element: ".hero-facts",
    animation: {
      delay: 450,
      origin: window.innerWidth > 768 ? "left" : "bottom",
    },
  },
  {
    element: ".hero-traits",
    animation: {
      delay: 550,
      origin: window.innerWidth > 768 ? "left" : "bottom",
    },
  },
  {
    element: ".hero-cta",
    animation: {
      delay: 700,
      origin: window.innerWidth > 768 ? "left" : "bottom",
    },
  },
  {
    element: ".hero-visual",
    animation: {
      delay: 500,
      origin: window.innerWidth > 768 ? "right" : "bottom",
    },
  },
  {
    element: ".hero-stats",
    animation: {
      delay: 900,
      origin: "bottom",
    },
  },
  {
    element: ".hero-motto",
    animation: {
      delay: 1100,
      distance: "0px",
    },
  },
  {
    element: ".about-wrapper__image",
    animation: {
      delay: 600,
      origin: "bottom",
    },
  },
  {
    element: ".about-wrapper__info",
    animation: {
      delay: 1000,
      origin: window.innerWidth > 768 ? "left" : "bottom",
    },
  },
  {
    element: ".project-wrapper__text",
    animation: {
      delay: 500,
      origin: window.innerWidth > 768 ? "left" : "bottom",
    },
  },
  {
    element: ".project-wrapper__image",
    animation: {
      delay: 1000,
      origin: window.innerWidth > 768 ? "right" : "bottom",
    },
  },
  {
    element: ".ui-works__header",
    animation: {
      delay: 400,
      origin: "bottom",
    },
  },
  {
    element: ".ui-works__rail",
    animation: {
      delay: 650,
      origin: "bottom",
    },
  },
  {
    element: ".contact-wrapper",
    animation: {
      delay: 800,
      origin: "bottom",
    },
  },
];
