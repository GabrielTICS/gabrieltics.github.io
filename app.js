/* =========================
   Helpers
========================= */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* =========================
   Year auto
========================= */
(() => {
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
})();

/* =========================
   Reveal on scroll
========================= */
(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    $$(".reveal").forEach(el => el.classList.add("is-visible"));
    return;
  }

  const els = $$(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  els.forEach((el) => io.observe(el));
})();

/* =========================
   Scroll progress bar
========================= */
(() => {
  const bar = $(".scroll-progress__bar");
  if (!bar) return;

  const onScroll = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const p = max > 0 ? (doc.scrollTop / max) * 100 : 0;
    bar.style.width = `${p}%`;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* =========================
   Smooth scroll with header offset
========================= */
(() => {
  const header = $("#siteNav");
  const headerH = () => (header ? header.getBoundingClientRect().height : 0);

  const isSamePageHash = (href) => href && href.startsWith("#") && href.length > 1;

  $$("a[href^='#']").forEach((a) => {
    a.addEventListener("click", (ev) => {
      const href = a.getAttribute("href");
      if (!isSamePageHash(href)) return;

      const target = document.querySelector(href);
      if (!target) return;

      ev.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerH() - 10;

      window.scrollTo({ top, behavior: "smooth" });
      history.pushState(null, "", href);
    });
  });
})();

/* =========================
   Active nav link (scroll spy)
========================= */
(() => {
  const navLinks = $$(".navlink");
  if (!navLinks.length) return;

  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const setActive = (id) => {
    navLinks.forEach((a) => {
      const href = a.getAttribute("href");
      a.classList.toggle("is-active", href === `#${id}`);
    });
  };

  const io = new IntersectionObserver(
    (entries) => {
      // Tomar la más visible
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible && visible.target && visible.target.id) {
        setActive(visible.target.id);
      }
    },
    { rootMargin: "-35% 0px -55% 0px", threshold: [0.1, 0.2, 0.4, 0.6] }
  );

  sections.forEach((s) => io.observe(s));
})();

/* =========================
   Lightbox (gallery images)
========================= */
(() => {
  const lb = $("#lightbox");
  const lbImg = $("#lightboxImg");
  const lbCap = $("#lightboxCaption");
  const lbClose = $("#lightboxClose");

  if (!lb || !lbImg || !lbClose) return;

  const open = (src, alt) => {
    lbImg.src = src;
    lbImg.alt = alt || "Imagen";
    if (lbCap) lbCap.textContent = alt || "";
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    // Limpieza para evitar parpadeo en algunas cargas
    setTimeout(() => {
      lbImg.src = "";
      if (lbCap) lbCap.textContent = "";
    }, 150);
  };

  // Abrir al dar clic en imágenes marcadas
  $$("img[data-lightbox]").forEach((img) => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", () => open(img.currentSrc || img.src, img.alt));
  });

  // Cerrar
  lbClose.addEventListener("click", close);
  lb.addEventListener("click", (e) => {
    if (e.target === lb) close();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lb.classList.contains("is-open")) close();
  });
})();

/* =========================
   Tilt 3D effect (no library)
   Applies to elements with [data-tilt]
========================= */
(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const tiltEls = $$("[data-tilt]");
  if (!tiltEls.length) return;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  tiltEls.forEach((el) => {
    let rect = null;
    let raf = null;

    const maxRotate = 10; // grados
    const maxTranslate = 6; // px

    const onEnter = () => {
      rect = el.getBoundingClientRect();
      el.classList.add("tilting");
    };

    const onLeave = () => {
      el.classList.remove("tilting");
      el.style.transform = "";
      el.style.setProperty("--gx", "50%");
      el.style.setProperty("--gy", "50%");
    };

    const onMove = (ev) => {
      if (!rect) rect = el.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;

      const px = clamp(x / rect.width, 0, 1);
      const py = clamp(y / rect.height, 0, 1);

      const rx = (py - 0.5) * -maxRotate;
      const ry = (px - 0.5) * maxRotate;

      const tx = (px - 0.5) * maxTranslate;
      const ty = (py - 0.5) * maxTranslate;

      // Guardamos para un highlight con CSS (si lo usas)
      el.style.setProperty("--gx", `${px * 100}%`);
      el.style.setProperty("--gy", `${py * 100}%`);

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("mousemove", onMove, { passive: true });

    // Recalcular rect si cambia tamaño
    window.addEventListener("resize", () => {
      rect = null;
    });
  });
})();
