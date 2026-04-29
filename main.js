document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  const pageLoader = document.getElementById("page-loader");
  const heroStage = document.querySelector(".hero-stage-shell");

  const closeMenu = () => {
    if (!navLinks || !navToggle) return;
    navLinks.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    body.classList.remove("menu-open");
  };

  const openMenu = () => {
    if (!navLinks || !navToggle) return;
    navLinks.classList.add("is-open");
    navToggle.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    body.classList.add("menu-open");
  };

  const syncNavbar = () => {
    if (!navbar) return;
    navbar.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  syncNavbar();
  window.addEventListener("scroll", syncNavbar, { passive: true });

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.contains("is-open");
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      closeMenu();

      const navHeight = navbar ? navbar.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 18;

      window.scrollTo({
        top,
        behavior: "smooth"
      });
    });
  });

  if (heroStage && window.matchMedia("(pointer:fine)").matches) {
    heroStage.addEventListener("pointermove", (event) => {
      const rect = heroStage.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * -8;

      heroStage.style.transform = `perspective(1600px) rotateX(${y}deg) rotateY(${x}deg)`;
    });

    heroStage.addEventListener("pointerleave", () => {
      heroStage.style.transform = "";
    });
  }

  const stageShell = document.getElementById("story-stage-shell");
  const stageBadge = document.getElementById("story-stage-badge");
  const stageTitle = document.getElementById("story-stage-title");
  const stageBody = document.getElementById("story-stage-body");
  const stageMetric = document.getElementById("story-stage-metric");
  const stageMetricLabel = document.getElementById("story-stage-metric-label");
  const stageCardTitle = document.getElementById("story-stage-card-title");
  const stageInsight = document.getElementById("story-stage-insight");
  const stageTags = document.getElementById("story-stage-tags");
  const stageGraph = document.getElementById("story-stage-graph");
  const storySteps = [...document.querySelectorAll(".story-step")];

  const updateStoryStage = (step) => {
    if (!step || !stageShell) return;

    storySteps.forEach((item) => item.classList.toggle("is-active", item === step));
    stageShell.dataset.theme = step.dataset.storyTheme || "sense";

    if (stageBadge) stageBadge.textContent = step.dataset.stageBadge || "";
    if (stageTitle) stageTitle.textContent = step.dataset.stageTitle || "";
    if (stageBody) stageBody.textContent = step.dataset.stageBody || "";
    if (stageMetric) stageMetric.textContent = step.dataset.stageMetric || "";
    if (stageMetricLabel) stageMetricLabel.textContent = step.dataset.stageMetricLabel || "";
    if (stageCardTitle) stageCardTitle.textContent = step.dataset.stageCardTitle || "";
    if (stageInsight) stageInsight.textContent = step.dataset.stageInsight || "";

    if (stageTags) {
      const tags = (step.dataset.stageTags || "")
        .split("|")
        .map((tag) => tag.trim())
        .filter(Boolean);

      stageTags.innerHTML = tags.map((tag) => `<span class="stack-tag">${tag}</span>`).join("");
    }

    if (stageGraph) {
      const bars = (step.dataset.stageBars || "")
        .split("|")
        .map((value) => Number.parseInt(value, 10))
        .filter((value) => Number.isFinite(value));

      stageGraph.querySelectorAll(".stack-bar").forEach((bar, index) => {
        const height = bars[index] ?? 42;
        bar.style.height = `${height}%`;
      });
    }
  };

  if (storySteps.length) {
    updateStoryStage(storySteps[0]);

    const storyObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length) {
          updateStoryStage(visibleEntries[0].target);
        }
      },
      {
        threshold: [0.25, 0.45, 0.7],
        rootMargin: "-18% 0px -28% 0px"
      }
    );

    storySteps.forEach((step) => storyObserver.observe(step));
  }

  const platformStage = document.getElementById("platform-demo-stage");
  const platformKicker = document.getElementById("platform-kicker");
  const platformTitle = document.getElementById("platform-title");
  const platformText = document.getElementById("platform-text");
  const platformBeats = [...document.querySelectorAll(".platform-beat")];
  const platformChips = [...document.querySelectorAll("[data-platform-chip]")];

  const updatePlatformStage = (beat) => {
    if (!beat || !platformStage) return;
    const mode = beat.dataset.platformMode || "overview";
    platformStage.dataset.platformMode = mode;
    platformBeats.forEach((item) => item.classList.toggle("is-active", item === beat));
    platformChips.forEach((chip) => chip.classList.toggle("is-active", chip.dataset.platformChip === mode));
    if (platformKicker) platformKicker.textContent = beat.dataset.platformKicker || "";
    if (platformTitle) platformTitle.textContent = beat.dataset.platformTitle || "";
    if (platformText) platformText.textContent = beat.dataset.platformText || "";
  };

  if (platformBeats.length) {
    updatePlatformStage(platformBeats[0]);

    const platformObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length) {
          updatePlatformStage(visibleEntries[0].target);
        }
      },
      {
        threshold: [0.35, 0.55, 0.75],
        rootMargin: "-18% 0px -22% 0px"
      }
    );

    platformBeats.forEach((beat) => {
      platformObserver.observe(beat);
      beat.addEventListener("click", () => updatePlatformStage(beat));
    });
  }

  const sections = [...document.querySelectorAll("section[id]")];
  const navAnchors = [...document.querySelectorAll('.nav-links a[href^="#"]')];

  if (sections.length && navAnchors.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const currentId = `#${entry.target.id}`;
          navAnchors.forEach((anchor) => {
            anchor.classList.toggle("is-active", anchor.getAttribute("href") === currentId);
          });
        });
      },
      {
        threshold: 0.52,
        rootMargin: "-20% 0px -30% 0px"
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  const hideLoader = () => {
    if (!pageLoader) return;
    pageLoader.classList.add("is-hidden");
  };

  window.addEventListener("load", () => {
    window.setTimeout(hideLoader, 450);
  });

  window.setTimeout(hideLoader, 2200);
});
