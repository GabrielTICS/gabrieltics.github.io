/* =========================
   Helpers
========================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

/* =========================
   Año automático (footer)
========================= */
(() => {
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
})();

/* =========================
   Reveal on scroll
========================= */
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items = $$(".reveal");

  if (reduce) {
    items.forEach(el => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach(el => io.observe(el));
})();

/* =========================
   Scroll progress bar
========================= */
(() => {
  const bar = $(".scroll-progress__bar");
  if (!bar) return;

  const update = () => {
    const d = document.documentElement;
    const max = d.scrollHeight - d.clientHeight;
    const percent = max > 0 ? (d.scrollTop / max) * 100 : 0;
    bar.style.width = percent + "%";
  };

  window.addEventListener("scroll", update, { passive: true });
  update();
})();

/* =========================
   Smooth scroll con offset del nav
========================= */
(() => {
  const nav = $("#siteNav");
  const navH = () => nav ? nav.offsetHeight : 0;

  $$("a[href^='#']").forEach(link => {
    link.addEventListener("click", e => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - navH() - 10;
      window.scrollTo({ top, behavior: "smooth" });
      history.pushState(null, "", id);
    });
  });
})();

/* =========================
   Nav activo (scroll spy)
========================= */
(() => {
  const links = $$(".navlink");
  if (!links.length) return;

  const sections = links
    .map(l => document.querySelector(l.getAttribute("href")))
    .filter(Boolean);

  const setActive = id => {
    links.forEach(l =>
      l.classList.toggle("is-active", l.getAttribute("href") === `#${id}`)
    );
  };

  const io = new IntersectionObserver(entries => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible && visible.target.id) {
      setActive(visible.target.id);
    }
  }, {
    rootMargin: "-35% 0px -55% 0px",
    threshold: [0.1, 0.25, 0.5]
  });

  sections.forEach(s => io.observe(s));
})();

/* =========================
   Lightbox (galería)
========================= */
(() => {
  const box = $("#lightbox");
  const img = $("#lightboxImg");
  const cap = $("#lightboxCaption");
  const closeBtn = $("#lightboxClose");

  if (!box || !img || !closeBtn) return;

  const open = (src, alt) => {
    img.src = src;
    img.alt = alt || "";
    if (cap) cap.textContent = alt || "";
    box.classList.add("is-open");
    box.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    box.classList.remove("is-open");
    box.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setTimeout(() => {
      img.src = "";
      if (cap) cap.textContent = "";
    }, 150);
  };

  $$("img[data-lightbox]").forEach(i => {
    i.style.cursor = "zoom-in";
    i.addEventListener("click", () => open(i.currentSrc || i.src, i.alt));
  });

  closeBtn.addEventListener("click", close);
  box.addEventListener("click", e => { if (e.target === box) close(); });
  window.addEventListener("keydown", e => {
    if (e.key === "Escape" && box.classList.contains("is-open")) close();
  });
})();

/* =========================
   Tilt 3D (sin librerías)
========================= */
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  const els = $$("[data-tilt]");
  if (!els.length) return;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  els.forEach(el => {
    let rect;

    const maxRotate = 10;
    const maxMove = 6;

    const enter = () => rect = el.getBoundingClientRect();
    const leave = () => el.style.transform = "";

    const move = e => {
      if (!rect) rect = el.getBoundingClientRect();

      const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
      const y = clamp((e.clientY - rect.top) / rect.height, 0, 1);

      const rx = (y - 0.5) * -maxRotate;
      const ry = (x - 0.5) * maxRotate;
      const tx = (x - 0.5) * maxMove;
      const ty = (y - 0.5) * maxMove;

      el.style.transform = `
        translate3d(${tx}px, ${ty}px, 0)
        rotateX(${rx}deg)
        rotateY(${ry}deg)
      `;
    };

    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    el.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("resize", () => rect = null);
  });
})();


/* =========================
   HERO IMAGE SLIDER
========================= */
(() => {
  const slides = [
    "assets/hero-1.jpg",
    "assets/hero-2.jpg",
    "assets/hero-3.jpg"
  ];

  const img = document.getElementById("heroSlide");
  if (!img) return;

  const prev = document.querySelector(".sliderBtn--prev");
  const next = document.querySelector(".sliderBtn--next");

  let index = 0;

  const show = (i) => {
    img.style.opacity = 0;
    setTimeout(() => {
      img.src = slides[i];
      img.style.opacity = 1;
    }, 200);
  };

  prev.addEventListener("click", () => {
    index = (index - 1 + slides.length) % slides.length;
    show(index);
  });

  next.addEventListener("click", () => {
    index = (index + 1) % slides.length;
    show(index);
  });

  /* Auto slide (opcional, elegante) */
  setInterval(() => {
    index = (index + 1) % slides.length;
    show(index);
  }, 6000);
})();
