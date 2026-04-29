const SiteAnimations = (() => {
  function initReveals() {
    const revealElements = document.querySelectorAll("[data-reveal]");
    if (!revealElements.length) return;

    revealElements.forEach((element) => {
      if (element.dataset.revealDelay) {
        element.style.transitionDelay = `${element.dataset.revealDelay}s`;
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -10% 0px"
      }
    );

    revealElements.forEach((element) => observer.observe(element));
  }

  function animateCounter(element) {
    const target = Number.parseInt(element.dataset.count || "0", 10);
    const suffix = element.dataset.suffix || "";
    const prefix = element.dataset.prefix || "";
    const duration = 1500;
    const start = performance.now();

    const tick = (timestamp) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const value = Math.floor(target * eased);

      element.textContent = `${prefix}${value.toLocaleString("pt-BR")}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        element.textContent = `${prefix}${target.toLocaleString("pt-BR")}${suffix}`;
      }
    };

    requestAnimationFrame(tick);
  }

  function initCounters() {
    const counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.target.dataset.counted === "true") return;
          entry.target.dataset.counted = "true";
          animateCounter(entry.target);
        });
      },
      {
        threshold: 0.45
      }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  function initScrollProgress() {
    const progress = document.querySelector(".scroll-progress");
    if (!progress) return;

    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      progress.style.transform = `scaleX(${Math.max(0, Math.min(1, ratio))})`;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  function init() {
    initReveals();
    initCounters();
    initScrollProgress();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", () => {
  SiteAnimations.init();
});
