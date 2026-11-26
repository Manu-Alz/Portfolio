/* =========================================================
   Manu — Portfolio
   Todo el movimiento de la página vive acá.
   ========================================================= */

// ---- Datos de contacto: completá lo que quieras mostrar ----
const CONTACTO = {
  email: "manualzugaray@icloud.com",
  respaldo: "https://github.com/Manu-Alz",    // si no hay email, el botón lleva acá
};

// textos según idioma (definido en i18n.js; si falta, español)
const T = window.T || ((es) => es);

(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Reloj de Uruguay ---------- */
  const fmt = new Intl.DateTimeFormat(window.LANG === "en" ? "en-US" : "es-UY", { hour: "2-digit", minute: "2-digit", timeZone: "America/Montevideo" });
  const tick = () => $$("[data-clock]").forEach((el) => (el.textContent = fmt.format(new Date())));
  tick(); setInterval(tick, 15000);

  /* ---------- Botón de contacto ---------- */
  const btn = $("#contact-btn");
  if (CONTACTO.email) { btn.href = "mailto:" + CONTACTO.email; btn.removeAttribute("target"); }
  else btn.href = CONTACTO.respaldo;

  /* ---------- Email que se copia con un clic ---------- */
  $$("[data-copy]").forEach((b) => {
    const state = $(".copy__state", b);
    b.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(CONTACTO.email); state.textContent = T("Copiado ✓", "Copied ✓"); }
      catch { location.href = "mailto:" + CONTACTO.email; }
      setTimeout(() => (state.textContent = T("Copiar ⧉", "Copy ⧉")), 2200);
    });
  });

  /* ---------- Menú móvil (funciona con o sin GSAP) ---------- */
  const menuBtn = $(".nav__menu"), mnav = $(".mnav");
  const setMenu = (open) => {
    root.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    mnav.setAttribute("aria-hidden", String(!open));
    $(".nav__menu-t").textContent = open ? T("Cerrar", "Close") : T("Menú", "Menu");
    const l = window.__lenis;
    if (l) open ? l.stop() : l.start();
    document.body.style.overflow = open && !l ? "hidden" : "";
  };
  menuBtn.addEventListener("click", () => setMenu(!root.classList.contains("menu-open")));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  $$(".mnav a").forEach((a) => a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    setMenu(false);
    if (!href.startsWith("#")) return;
    const target = $(href);
    if (!target) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    // el menú se cierra tapando el salto: llegás directo a la sección
    const l = window.__lenis;
    if (l) l.scrollTo(target, { immediate: true, force: true });
    else target.scrollIntoView();
  }));
  matchMedia("(min-width: 901px)").addEventListener("change", (m) => m.matches && setMenu(false));

  /* ---------- Reel: vista previa muda en la tarjeta + reproductor en grande ---------- */
  const modal = $(".reel-modal"), mv = modal && $("video", modal);
  if (modal) {
    const openReel = (r, e) => {
      e.preventDefault(); e.stopPropagation(); // la tarjeta es un link: el reel no debe abrir el sitio
      mv.src = r.dataset.reel; mv.currentTime = 0; mv.muted = false;
      modal.classList.add("is-open"); modal.setAttribute("aria-hidden", "false");
      mv.play().catch(() => {});
      window.__lenis && window.__lenis.stop();
      $(".reel-modal__close").focus();
    };
    const closeReel = () => {
      if (!modal.classList.contains("is-open")) return;
      modal.classList.remove("is-open"); modal.setAttribute("aria-hidden", "true");
      mv.pause();
      window.__lenis && window.__lenis.start();
    };
    $$(".reel").forEach((r) => {
      const v = $("video", r);
      // la vista previa carga y se reproduce solo cuando está cerca de la pantalla
      new IntersectionObserver(([en]) => {
        if (en.isIntersecting) {
          if (!v.getAttribute("src")) v.src = v.dataset.src + (reduce ? "#t=1" : "");
          if (!reduce) v.play().catch(() => {});
        } else v.pause();
      }, { rootMargin: "200px" }).observe(r);
      r.addEventListener("click", (e) => openReel(r, e));
      r.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") openReel(r, e); });
    });
    $(".reel-modal__close").addEventListener("click", closeReel);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeReel(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") closeReel(); });
  }

  /* ---------- Laboratorio (funciona con o sin GSAP) ---------- */
  initLab();

  /* ---------- Sin librerías o con "reducir movimiento": todo visible ---------- */
  if (!window.gsap || !window.ScrollTrigger || reduce) {
    root.classList.remove("js");
    fitAll();
    addEventListener("resize", fitAll);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  scrollTo(0, 0);

  /* ---------- Scroll suave ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
    $$('a[href^="#"]').forEach((a) =>
      a.addEventListener("click", (e) => {
        if (a.closest(".mnav")) return; // el menú móvil maneja sus links
        const target = $(a.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        // desde el menú: cortina azul con el nombre de la sección
        if (a.closest(".nav__links") && target.id !== "inicio") {
          const cur = $(".curtain");
          $(".curtain__label").textContent = a.textContent.trim();
          gsap.timeline()
            .set(cur, { clipPath: "inset(100% 0 0 0)" })
            .to(cur, { clipPath: "inset(0% 0 0 0)", duration: 0.6, ease: "expo.inOut" })
            .from(".curtain__label", { yPercent: 60, opacity: 0, duration: 0.5, ease: "expo.out" }, 0.25)
            .add(() => lenis.scrollTo(target, { immediate: true, force: true }))
            .to(cur, { clipPath: "inset(0 0 100% 0)", duration: 0.7, ease: "expo.inOut" }, "+=0.15");
          return;
        }
        lenis.scrollTo(target, { duration: 1.6, easing: (x) => 1 - Math.pow(1 - x, 4) });
      })
    );
  }
  const velocity = () => (lenis ? lenis.velocity : 0);

  /* ---------- Palabras que se encienden al hacer scroll ---------- */
  $$("[data-words]").forEach((el) => {
    const parts = [];
    [...el.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach((t) => {
          if (!t) return;
          if (/^\s+$/.test(t)) parts.push(document.createTextNode(t));
          else { const s = document.createElement("span"); s.className = "w"; s.textContent = t; parts.push(s); }
        });
      } else { n.classList && n.classList.add("w"); parts.push(n); }
    });
    el.textContent = "";
    parts.forEach((p) => el.appendChild(p));
    gsap.to($$(".w", el), {
      opacity: 1, ease: "none", stagger: 0.1,
      scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 55%", scrub: true },
    });
  });

  /* ---------- Texto que llena el ancho ---------- */
  fitAll();
  if (document.fonts) document.fonts.ready.then(() => { fitAll(); ScrollTrigger.refresh(); });

  /* ---------- Tipografía cinética: las letras se estiran hacia el cursor ---------- */
  const mouse = { x: innerWidth / 2, y: innerHeight / 2, active: false };
  addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
  const kinetics = $$(".kinetic").map((el) => ({
    el, visible: false,
    // en táctil los títulos que llenan el ancho van condensados: quedan más altos y llenan la pantalla
    base: !fine && el.matches(".hero__name, .contact__title") ? 62 : 100,
    letters: $$(".k", el).map((k) => ({ k, wdth: !fine && el.matches(".hero__name, .contact__title") ? 62 : 100, wght: 800 })),
  }));
  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    const item = kinetics.find((x) => x.el === en.target);
    if (item) item.visible = en.isIntersecting;
  }));
  kinetics.forEach((x) => io.observe(x.el));

  gsap.ticker.add(() => {
    const v = Math.min(Math.abs(velocity()) / 40, 1); // velocidad de scroll 0..1
    kinetics.forEach(({ visible, letters, base }) => {
      if (!visible) return;
      letters.forEach((L) => {
        let tW = base, tG = 800;
        if (fine && mouse.active) {
          // medir solo con mouse: en celular no hace falta y ahorra trabajo por cuadro
          const r = L.k.getBoundingClientRect();
          const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          const d = Math.hypot(mouse.x - cx, (mouse.y - cy) * 0.6);
          const f = Math.max(0, 1 - d / (innerWidth * 0.32));
          tW = 100 + f * 25;   // cerca del cursor: más ancha
          tG = 760 + f * 140;
        }
        tW -= v * 30;          // al scrollear rápido se comprime
        const nw = L.wdth + (tW - L.wdth) * 0.09, ng = L.wght + (tG - L.wght) * 0.09;
        if (Math.abs(nw - L.wdth) < 0.02 && Math.abs(ng - L.wght) < 0.1) return; // quieto: no tocar el DOM
        L.wdth = nw; L.wght = ng;
        L.k.style.fontVariationSettings = `"wdth" ${L.wdth.toFixed(1)}, "wght" ${L.wght.toFixed(0)}`;
      });
    });
  });

  /* ---------- Links con texto que rueda ---------- */
  $$(".nav__links a, .footer__links a").forEach((a) => {
    const t = a.textContent.trim();
    a.innerHTML = `<span class="roll"><span>${t}</span></span>`;
  });

  /* ---------- Barra de progreso ---------- */
  gsap.to(".progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });

  /* ---------- Cursor ---------- */
  if (fine) {
    // Cursor de seguimiento (como el recuadro de la foto):
    // el punto es el mouse, sin lag; el visor lo sigue y se "engancha" a lo que se puede tocar.
    root.classList.add("has-cursor", "cur-out");
    const box = $(".tcur"), dot = $(".tcur__dot"), tag = $(".tcur__tag");
    const S = 30, PAD = 7;
    const setDX = gsap.quickSetter(dot, "x", "px"), setDY = gsap.quickSetter(dot, "y", "px");
    const to = {
      x: gsap.quickTo(box, "x", { duration: 0.38, ease: "power3" }),
      y: gsap.quickTo(box, "y", { duration: 0.38, ease: "power3" }),
      w: gsap.quickTo(box, "width", { duration: 0.42, ease: "power3" }),
      h: gsap.quickTo(box, "height", { duration: 0.42, ease: "power3" }),
    };
    let mx = -100, my = -100, first = true, locked = null, label = "", raf = 0;
    const pad4 = (n) => String(Math.max(0, Math.round(n))).padStart(4, "0");
    const place = () => {
      raf = 0;
      if (locked && locked.isConnected) {
        const r = locked.getBoundingClientRect();
        to.x(r.left - PAD); to.y(r.top - PAD); to.w(r.width + PAD * 2); to.h(r.height + PAD * 2);
      } else {
        const s = label ? 54 : S;
        to.x(mx - s / 2); to.y(my - s / 2); to.w(s); to.h(s);
        if (!label) tag.textContent = `X ${pad4(mx)} · Y ${pad4(my)}`;
      }
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(place); };
    addEventListener("pointermove", (e) => {
      mx = e.clientX; my = e.clientY;
      setDX(mx); setDY(my);
      if (first) { gsap.set(box, { x: mx - S / 2, y: my - S / 2, width: S, height: S }); first = false; }
      root.classList.remove("cur-out");
      queue();
    }, { passive: true });
    addEventListener("scroll", queue, { passive: true });
    if (window.__lenis) window.__lenis.on("scroll", queue);
    document.documentElement.addEventListener("pointerleave", () => root.classList.add("cur-out"));
    addEventListener("pointerdown", () => root.classList.add("cur-down"));
    addEventListener("pointerup", () => root.classList.remove("cur-down"));
    // delegación: funciona también con elementos que se crean después (menú, pósters)
    let hovered = null;
    document.addEventListener("pointerover", (e) => {
      const el = e.target.closest("[data-cursor], a, button, [contenteditable], [role=button]");
      if (el === hovered) return;
      hovered = el; locked = null; label = "";
      root.classList.remove("cur-lock", "cur-label");
      if (el) {
        const r = el.getBoundingClientRect();
        const big = r.width > innerWidth * 0.6 || r.height > innerHeight * 0.45;
        label = el.getAttribute("data-cursor") || "";
        if (!big) { locked = el; root.classList.add("cur-lock"); if (!label) label = "Lock"; }
        if (label) { tag.textContent = label; root.classList.add("cur-label"); }
      }
      queue();
    });
  }

  /* ---------- Botón magnético ---------- */
  if (fine) {
    $$(".magnet").forEach((m) => {
      const inner = $(".magnet__inner", m);
      m.addEventListener("pointermove", (e) => {
        const r = m.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        gsap.to(m, { x: x * 0.35, y: y * 0.35, duration: 0.6, ease: "power3" });
        gsap.to(inner, { x: x * 0.15, y: y * 0.15, duration: 0.6, ease: "power3" });
      });
      m.addEventListener("pointerleave", () => {
        gsap.to([m, inner], { x: 0, y: 0, duration: 1, ease: "elastic.out(1, .35)" });
      });
    });
  }

  /* ---------- Precarga + entrada ---------- */
  const words = $$(".loader__words span");
  const count = $(".loader__count");
  const counter = { v: 0 };
  const intro = gsap.timeline({ paused: true });
  intro
    .to(".hero__name .k", { yPercent: 0, duration: 1.4, ease: "expo.out", stagger: 0.07 }, 0)
    .to(".hero .reveal-line > span", { yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.08 }, 0.25)
    .fromTo(".badge", { opacity: 0, scale: 0.4, rotate: -90 }, { opacity: 1, scale: 1, rotate: 0, duration: 1.6, ease: "expo.out" }, 0.5)
    .from(".nav", { yPercent: -100, opacity: 0, duration: 1, ease: "expo.out" }, 0.4)
    .from(".hero__bottom", { opacity: 0, y: 20, duration: 1, ease: "expo.out" }, 0.6);
  // las letras arrancan con translateY(105%) por CSS: las devolvemos a 0
  gsap.set(".hero__name .k", { y: 0, yPercent: 105 });
  gsap.set(".hero .reveal-line > span", { y: 0, yPercent: 110 });

  gsap.set(".loader", { clipPath: "inset(0 0 0% 0)" });
  const load = gsap.timeline({
    onComplete: () => { lenis && lenis.start(); $(".loader").remove(); ScrollTrigger.refresh(); },
  });
  load.to(counter, {
    v: 100, duration: 1.8, ease: "power2.inOut",
    onUpdate: () => (count.textContent = String(Math.round(counter.v)).padStart(3, "0")),
  }, 0);
  words.forEach((w, i) => {
    load.fromTo(w, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.28, ease: "power3.out" }, i * 0.3);
    if (i < words.length - 1) load.to(w, { yPercent: -60, opacity: 0, duration: 0.24, ease: "power3.in" }, i * 0.3 + 0.24);
  });
  load
    .to(".loader", { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "expo.inOut" }, 2.0)
    .add(() => intro.play(), 2.35);
  // al cambiar de idioma: precarga rápida y volvés al mismo lugar de la página
  let quick = null, backTo = 0;
  try { quick = sessionStorage.getItem("quickLoad"); backTo = +sessionStorage.getItem("scrollY") || 0; sessionStorage.removeItem("quickLoad"); sessionStorage.removeItem("scrollY"); } catch (e) {}
  if (quick) {
    load.timeScale(4);
    load.eventCallback("onComplete", () => {
      lenis && lenis.start(); $(".loader").remove(); ScrollTrigger.refresh();
      if (backTo && lenis) lenis.scrollTo(backTo, { immediate: true, force: true });
    });
  }

  /* ---------- Hero al hacer scroll ---------- */
  const heroST = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
  $$(".hero__name .k").forEach((k, i) => {
    gsap.to(k, { y: () => -innerHeight * (0.12 + ((i * 37) % 4) * 0.07), ease: "none", scrollTrigger: heroST });
  });
  gsap.to(".hero__top", { y: () => innerHeight * 0.15, opacity: 0, ease: "none", scrollTrigger: heroST });

  /* ---------- Marquesina infinita que reacciona al scroll ---------- */
  const track = $(".marquee__track");
  track.innerHTML += track.innerHTML;
  let mx = 0, dir = -1;
  gsap.ticker.add(() => {
    const v = velocity();
    if (v > 0.5) dir = -1; else if (v < -0.5) dir = 1;
    mx += dir * (0.6 + Math.min(Math.abs(v) * 0.35, 12));
    const half = track.scrollWidth / 2;
    if (mx <= -half) mx += half;
    if (mx > 0) mx -= half;
    track.style.transform = `translate3d(${mx}px,0,0) skewX(${gsap.utils.clamp(-12, 12, -v * 0.4)}deg)`;
  });

  /* ---------- Cambio de fondo claro/oscuro ---------- */
  $$("[data-theme='dark']").forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec, start: "top 55%", end: "bottom 45%",
      onToggle: (self) => document.body.classList.toggle("is-dark", self.isActive),
    });
  });

  /* ---------- Títulos y bloques que aparecen ---------- */
  [".big-title", ".contact__title"].forEach((sel) => {
    gsap.from(`${sel} .k`, {
      yPercent: 100, opacity: 0, duration: 1.2, ease: "expo.out", stagger: 0.05,
      scrollTrigger: { trigger: sel, start: "top 85%" },
    });
  });
  $$(".label").forEach((el) => gsap.from(el, { opacity: 0, x: -20, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%" } }));
  gsap.from(".manifesto__foot p", { opacity: 0, y: 30, duration: 1.2, stagger: 0.15, ease: "expo.out", scrollTrigger: { trigger: ".manifesto__foot", start: "top 85%" } });
  gsap.from(".svc__row", { opacity: 0, y: 60, duration: 1.2, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: ".svc", start: "top 80%" } });
  gsap.from(".mstep", { opacity: 0, y: 60, duration: 1.2, stagger: 0.12, ease: "expo.out", scrollTrigger: { trigger: ".method__steps", start: "top 85%" } });
  gsap.from(".caps__list li", { opacity: 0, yPercent: 60, duration: 1, stagger: 0.04, ease: "expo.out", scrollTrigger: { trigger: ".caps__list", start: "top 88%" } });
  gsap.from(".method__head > *", { opacity: 0, y: 40, duration: 1.2, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: ".method__head", start: "top 85%" } });
  gsap.from(".footer__mark span", { yPercent: 100, ease: "none", scrollTrigger: { trigger: ".footer__mark", start: "top bottom", end: "bottom bottom", scrub: true } });
  gsap.from(".contact__row > *", { opacity: 0, y: 40, duration: 1.2, stagger: 0.12, ease: "expo.out", scrollTrigger: { trigger: ".contact__row", start: "top 90%" } });

  /* ---------- Tarjetas de trabajo apiladas ---------- */
  const cards = $$(".card");
  cards.forEach((card, i) => {
    const img = $(".card__media img", card);
    gsap.fromTo($(".card__media", card), { clipPath: "inset(18% 10% 18% 10% round 24px)" }, {
      clipPath: "inset(0% 0% 0% 0% round 10px)", ease: "power2.out",
      scrollTrigger: { trigger: card, start: "top 92%", end: "top 30%", scrub: 0.6 },
    });
    gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from($$(".card__meta > *, .card__info > *", card), {
      opacity: 0, y: 30, duration: 1, stagger: 0.06, ease: "expo.out",
      scrollTrigger: { trigger: card, start: "top 75%" },
    });
  });
  // el apilado solo en pantallas anchas; matchMedia lo arma/desarma si cambia el tamaño
  const mm = gsap.matchMedia();
  mm.add("(min-width: 900px)", () => {
    cards.forEach((card, i) => {
      const next = cards[i + 1];
      if (!next) return;
      gsap.to(card, {
        scale: 0.9 + i * 0.012, opacity: 0.35, ease: "none",
        scrollTrigger: { trigger: next, start: "top bottom", end: "top 15%", scrub: true },
      });
    });
  });

  /* ---------- Números ---------- */
  // cada dígito es una columna 0-9 (dos vueltas) que rueda hasta su valor
  $$("[data-odo]").forEach((el, n) => {
    const digits = el.dataset.odo.split("");
    el.textContent = "";
    const cols = digits.map((d) => {
      const col = document.createElement("span");
      col.className = "odo__col";
      for (let k = 0; k < 20; k++) { const s = document.createElement("span"); s.textContent = k % 10; col.appendChild(s); }
      el.appendChild(col);
      return { col, to: 10 + +d };
    });
    el.setAttribute("aria-label", el.dataset.odo);
    const st = { trigger: el, start: "top 90%" };
    cols.forEach(({ col, to }, i) => {
      gsap.fromTo(col, { yPercent: 0 }, {
        yPercent: (-100 / 20) * to, duration: 2.2 + i * 0.35, ease: "expo.out", delay: n * 0.08,
        scrollTrigger: st,
      });
    });
  });
  gsap.from(".stat__d, .stat__top", { opacity: 0, y: 16, duration: 1, stagger: 0.05, ease: "expo.out", scrollTrigger: { trigger: ".stats", start: "top 85%" } });
  gsap.from(".stats__head > *", { opacity: 0, y: 10, duration: 0.9, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: ".stats", start: "top 88%" } });
  // 01 · la marca recorre la balanza y frena en −73
  gsap.from(".scale__mark", { left: "0%", duration: 2.4, ease: "expo.out", scrollTrigger: { trigger: ".stat--kg", start: "top 80%" } });
  gsap.from(".scale__row li", { opacity: 0, y: 8, duration: 0.8, stagger: 0.06, ease: "expo.out", scrollTrigger: { trigger: ".stat--kg", start: "top 80%" } });
  // 02 · los meses se llenan uno por uno
  const monthTl = gsap.timeline({ scrollTrigger: { trigger: ".stat--months", start: "top 80%" } });
  $$(".months li").forEach((m, i) => {
    gsap.set(m, { "--f": 0 });
    monthTl.to(m, { "--f": 1, duration: 0.45, ease: "power3.out", onStart: () => m.classList.add("is-full") }, i * 0.09);
  });
  // 03 · las webs se van conectando
  gsap.from(".sites li", { opacity: 0, x: -14, duration: 0.8, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: ".stat--sites", start: "top 80%" } });
  // 04 · barras al 100 %
  gsap.fromTo(".made i", { "--f": 0 }, { "--f": 1, duration: 1.6, stagger: 0.15, ease: "expo.inOut", scrollTrigger: { trigger: ".stat--made", start: "top 80%" } });

  /* ---------- Atleta: la foto se expande ---------- */
  // negro + logo → la foto entra en tiras que se arman (a tamaño real, sin zoom) → anotación y título
  const exp = gsap.timeline({
    scrollTrigger: { trigger: ".expand", start: "top top", end: "bottom bottom", scrub: 0.6 },
  });
  const slices = $$(".shot__slice");
  exp
    .to(".emblem__hint", { opacity: 0, duration: 0.08 }, 0.02)
    .to(".emblem__ring", { scale: 2.6, opacity: 0, ease: "power2.in", duration: 0.3 }, 0.05)
    .to(".emblem__core", { scale: 0.4, opacity: 0, ease: "power2.in", duration: 0.18 }, 0.08)
    .fromTo(slices, { yPercent: (i) => (i % 2 ? 105 : -105) },
      { yPercent: 0, ease: "power3.out", duration: 0.32, stagger: 0.035 }, 0.16)
    .fromTo(".shot__frame", { scale: 0.86, filter: "grayscale(1) brightness(.6)" },
      { scale: 1, filter: "grayscale(0) brightness(1)", ease: "power2.out", duration: 0.4 }, 0.18)
    .fromTo(".shot__crop", { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.12, stagger: 0.02 }, 0.42)
    .fromTo(".shot__mark", { scale: 2.2, opacity: 0 }, { scale: 1, opacity: 1, ease: "expo.out", duration: 0.12 }, 0.52)
    .fromTo(".shot__tag", { opacity: 0, clipPath: "inset(0 100% 0 0)" }, { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.1 }, 0.58)
    .fromTo(".shot__cap", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.1 }, 0.56)
    .to(".expand__title .reveal-line > span", { yPercent: 0, stagger: 0.06, duration: 0.16, ease: "power2.out" }, 0.62)
    .to({}, { duration: 0.15 });
  gsap.set(".expand__title .reveal-line > span", { y: 0, yPercent: 110 });
  // la confianza del "detector" varía como en un sistema real
  const conf = $("[data-conf]");
  if (conf) setInterval(() => (conf.textContent = (0.94 + Math.random() * 0.05).toFixed(2)), 700);

  /* ---------- Olas (canvas): el surf de fondo ---------- */
  const cv = $(".waves");
  if (cv) {
    const ctx = cv.getContext("2d");
    let W = 0, H = 0, on = false, t = 0;
    const size = () => { const d = Math.min(devicePixelRatio, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    size(); new ResizeObserver(size).observe(cv);
    new IntersectionObserver(([e]) => (on = e.isIntersecting)).observe(cv);
    gsap.ticker.add(() => {
      if (!on) return;
      t += 0.012;
      ctx.clearRect(0, 0, W, H);
      const lines = 22, r = cv.getBoundingClientRect();
      const mxl = mouse.x - r.left, myl = mouse.y - r.top;
      for (let i = 0; i < lines; i++) {
        const y0 = (H / (lines + 1)) * (i + 1);
        ctx.beginPath();
        for (let x = 0; x <= W; x += 8) {
          const near = mouse.active ? Math.max(0, 1 - Math.hypot(x - mxl, y0 - myl) / 260) : 0;
          const y = y0
            + Math.sin(x * 0.006 + t * 2 + i * 0.5) * 10
            + Math.sin(x * 0.013 - t * 1.4 + i) * 6
            + near * Math.sin(x * 0.05 - t * 6) * 22;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(143,160,255,${0.12 + (i / lines) * 0.35})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  }

  /* ---------- Indicador de sección (abajo a la izquierda) ---------- */
  const sects = [["inicio", "00", T("Inicio", "Home")], ["sobre", "01", T("Sobre mí", "About")], ["trabajo", "02", T("Trabajo", "Work")], ["hago", "03", T("Servicios", "Services")],
    ["trayectoria", "04", T("Trayectoria", "Journey")], ["lab", "05", T("Experimentación gráfica", "Graphic experiments")], ["atleta", "06", T("Método", "Method")], ["contacto", "07", T("Contacto", "Contact")]];
  const sN = $(".sect__n"), sT = $(".sect__t");
  let curSect = "inicio";
  const showSect = ([id, n, t]) => {
    if (curSect === id) return;
    curSect = id;
    // en la portada no se muestra (taparía las etiquetas de abajo)
    gsap.to(".sect", { autoAlpha: id === "inicio" ? 0 : 1, duration: 0.4 });
    gsap.timeline()
      .to([sN, sT], { yPercent: -110, duration: 0.3, ease: "power2.in" })
      .add(() => { sN.textContent = `(${n})`; sT.textContent = t; })
      .fromTo([sN, sT], { yPercent: 110 }, { yPercent: 0, duration: 0.45, ease: "expo.out", stagger: 0.04 });
  };
  sects.forEach((s, i) => {
    const el = document.getElementById(s[0]);
    if (!el) return;
    ScrollTrigger.create({ trigger: el, start: "top 50%", end: "bottom 50%", onEnter: () => showSect(s), onEnterBack: () => showSect(s) });
  });

  /* ---------- Trayectoria: scroll horizontal ---------- */
  mm.add("(min-width: 900px)", () => {
    const ptrack = $(".path__track"), pbar = $(".path__bar span");
    const dist = () => ptrack.scrollWidth - innerWidth;
    const horiz = gsap.to(ptrack, {
      x: () => -dist(), ease: "none",
      scrollTrigger: {
        trigger: ".path", start: "top top", end: () => "+=" + dist(),
        pin: true, scrub: 0.8, invalidateOnRefresh: true, refreshPriority: 1,
        onUpdate: (s) => gsap.set(pbar, { scaleX: s.progress }),
      },
    });
    $$(".step").forEach((s) => ScrollTrigger.create({
      trigger: s, containerAnimation: horiz, start: "left 75%", end: "right 25%", toggleClass: "is-on",
    }));
  });
  mm.add("(max-width: 899px)", () => {
    $$(".step").forEach((s) => gsap.from(s, { opacity: 0, y: 40, duration: 1, ease: "expo.out", scrollTrigger: { trigger: s, start: "top 88%" } }));
  });

  /* ---------- Laboratorio: entrada ---------- */
  gsap.from(".exp", { opacity: 0, y: 60, scale: 0.96, duration: 1.2, stagger: 0.12, ease: "expo.out", scrollTrigger: { trigger: ".lab__grid", start: "top 85%" } });
  gsap.from(".contact__meta > *", { opacity: 0, y: 30, duration: 1, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: ".contact__meta", start: "top 92%" } });

  /* ---------- Ajustes al cambiar tamaño ---------- */
  // en celular la barra del navegador aparece/desaparece y dispara "resize":
  // solo recalculamos si cambió el ancho (rotación o ventana nueva), así no salta el scroll
  let rz, lastW = innerWidth;
  addEventListener("resize", () => {
    clearTimeout(rz);
    rz = setTimeout(() => {
      if (Math.abs(innerWidth - lastW) < 2) return;
      lastW = innerWidth;
      fitAll(); ScrollTrigger.refresh();
    }, 180);
  });
})();

// fitAll también se usa en el modo sin animaciones
function fitAll() {
  document.querySelectorAll(".hero__name, .contact__title").forEach((el) => {
    const ks = [...el.querySelectorAll(".k")];
    if (!ks.length) return;
    el.style.fontSize = "100px";
    const w = ks.reduce((s, k) => s + k.getBoundingClientRect().width, 0);
    const cs = getComputedStyle(el.parentElement);
    const avail = el.parentElement.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    el.style.fontSize = Math.min(100 * (avail / w) * 0.9, innerHeight * 0.62) + "px";
  });
}

/* =========================================================
   Laboratorio: tres experimentos que se tocan
   ========================================================= */
function initLab() {
  const figs = document.querySelectorAll("[data-exp]");
  if (!figs.length) return;
  const exps = [];

  figs.forEach((fig) => {
    const type = fig.dataset.exp;
    const ptr = { x: -9999, y: -9999, on: false };
    const local = (e) => { const r = fig.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.on = true; };
    fig.addEventListener("pointermove", local);
    fig.addEventListener("pointerdown", local);
    const off = () => { ptr.on = false; ptr.x = ptr.y = -9999; };
    fig.addEventListener("pointerleave", off);
    fig.addEventListener("pointercancel", off);
    fig.addEventListener("pointerup", (e) => { if (e.pointerType !== "mouse") off(); });
    const ex = { fig, ptr, visible: false, step: null, resize: () => {} };

    if (type === "kuzushi" || type === "tide") {
      const cv = fig.querySelector("canvas"), ctx = cv.getContext("2d");
      let W = 0, H = 0, pts = [];
      ex.resize = () => {
        const d = Math.min(devicePixelRatio || 1, 2);
        W = fig.clientWidth; H = fig.clientHeight;
        cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
        pts = [];
        if (type === "kuzushi") {
          const gap = W < 500 ? 20 : 24;
          for (let y = gap; y < H; y += gap) for (let x = gap; x < W; x += gap) pts.push({ hx: x, hy: y, x, y, vx: 0, vy: 0 });
        } else {
          const n = Math.round((W * H) / (W < 500 ? 900 : 650));
          for (let i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, life: Math.random() * 200 });
          ctx.fillStyle = "#06081a"; ctx.fillRect(0, 0, W, H);
        }
      };
      if (type === "kuzushi") {
        // los puntos vuelven a su lugar con un resorte: desequilibrio y recuperación
        ex.step = () => {
          ctx.clearRect(0, 0, W, H);
          const R = Math.min(140, W * 0.22);
          for (const p of pts) {
            const dx = p.x - ptr.x, dy = p.y - ptr.y, d = Math.hypot(dx, dy);
            if (d < R && d > 0.01) { const f = (1 - d / R) * 7; p.vx += (dx / d) * f; p.vy += (dy / d) * f; }
            p.vx += (p.hx - p.x) * 0.045; p.vy += (p.hy - p.y) * 0.045;
            p.vx *= 0.82; p.vy *= 0.82; p.x += p.vx; p.y += p.vy;
            const off = Math.min(Math.hypot(p.x - p.hx, p.y - p.hy) / 40, 1);
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.4 + off * 3.2, 0, Math.PI * 2);
            ctx.fillStyle = off > 0.08 ? `rgba(${Math.round(143 - off * 104)},${Math.round(160 - off * 94)},255,${0.5 + off * 0.5})` : "rgba(236,233,226,.32)";
            ctx.fill();
          }
        };
      } else {
        // partículas en un campo de corriente; el mouse hace un remolino
        let t = 0;
        ex.step = () => {
          t += 0.004;
          ctx.fillStyle = "rgba(6,8,26,0.09)"; ctx.fillRect(0, 0, W, H);
          for (const p of pts) {
            let a = Math.sin(p.x * 0.004 + t * 2) * 1.6 + Math.cos(p.y * 0.006 - t) * 1.4;
            let vx = Math.cos(a) * 1.4 + 0.9, vy = Math.sin(a) * 1.1;
            const dx = p.x - ptr.x, dy = p.y - ptr.y, d = Math.hypot(dx, dy);
            if (d < 160) { const f = (1 - d / 160) * 5; vx += (-dy / d) * f; vy += (dx / d) * f; }
            const ox = p.x, oy = p.y;
            p.x += vx; p.y += vy; p.life -= 1;
            if (p.x > W || p.x < 0 || p.y > H || p.y < 0 || p.life < 0) { p.x = Math.random() * W * 0.3; p.y = Math.random() * H; p.life = 120 + Math.random() * 200; continue; }
            ctx.strokeStyle = d < 160 ? "rgba(255,255,255,.85)" : "rgba(143,160,255,.55)";
            ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(p.x, p.y); ctx.stroke();
          }
        };
      }
    }

    if (type === "type") {
      // cada letra se estira y engorda según qué tan cerca está el dedo o el mouse
      const box = fig.querySelector(".exp__type");
      let letters = [];
      const split = () => {
        const txt = (box.textContent || "").replace(/\s+/g, " ").slice(0, 14) || " ";
        box.innerHTML = "";
        letters = [...txt].map((c) => { const s = document.createElement("span"); s.textContent = c === " " ? "\u00a0" : c; box.appendChild(s); return { s, w: 100, g: 700 }; });
      };
      const caretEnd = () => { const r = document.createRange(); r.selectNodeContents(box); r.collapse(false); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); };
      box.addEventListener("input", () => { split(); caretEnd(); });
      box.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); box.blur(); } });
      split();
      let auto = 0;
      ex.step = () => {
        auto += 0.02;
        const r = fig.getBoundingClientRect();
        // sin puntero, una "ola" recorre la palabra sola
        const px = ptr.on ? ptr.x : (Math.sin(auto) * 0.5 + 0.5) * r.width;
        const py = ptr.on ? ptr.y : r.height * 0.45;
        letters.forEach((L) => {
          const b = L.s.getBoundingClientRect();
          const cx = b.left - r.left + b.width / 2, cy = b.top - r.top + b.height / 2;
          const f = Math.max(0, 1 - Math.hypot(px - cx, (py - cy) * 0.5) / (r.width * 0.35));
          L.w += (62 + f * 63 - L.w) * 0.12;
          L.g += (300 + f * 600 - L.g) * 0.12;
          L.s.style.fontVariationSettings = `"wdth" ${L.w.toFixed(1)}, "wght" ${L.g.toFixed(0)}`;
          L.s.style.color = f > 0.6 ? "var(--blue)" : "";
        });
      };
    }

    if (type === "stats") {
      // monitor de pulsaciones simulado: intervalos de entrenamiento, serie que corre, lectura con el cursor
      const cv = fig.querySelector("canvas"), ctx = cv.getContext("2d");
      let W = 0, H = 0, f = 0, phase = 0;
      const N = 140, data = [];
      let v = 78, target = 78;
      const next = () => {
        phase += 0.06;
        // series: sube fuerte, sostiene, baja a recuperación
        const cyc = (Math.sin(phase) + 1) / 2;
        target = 72 + Math.pow(cyc, 2.2) * 100 + (Math.random() - 0.5) * 6;
        v += (target - v) * 0.08 + (Math.random() - 0.5) * 1.6;
        return v;
      };
      for (let i = 0; i < N; i++) data.push(next());
      ex.resize = () => {
        const d = Math.min(devicePixelRatio || 1, 2);
        W = fig.clientWidth; H = fig.clientHeight;
        cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      };
      const zone = (b) => (b < 100 ? ["Z1", T("Recuperación", "Recovery")] : b < 125 ? ["Z2", "Base"] : b < 145 ? ["Z3", "Tempo"] : b < 162 ? ["Z4", T("Umbral", "Threshold")] : ["Z5", T("Máximo", "Max")]);
      ex.step = () => {
        if (++f % 4 === 0) { data.shift(); data.push(next()); }
        ctx.fillStyle = "#0B0B0C"; ctx.fillRect(0, 0, W, H);
        const pad = 20, x0 = pad + 30, x1 = W - pad, y0 = H * 0.4, y1 = H - 86;
        const lo = 50, hi = 190;
        const X = (i) => x0 + (i / (N - 1)) * (x1 - x0);
        const Y = (b) => y1 - ((b - lo) / (hi - lo)) * (y1 - y0);
        // grilla y escala
        ctx.font = '500 9px "JetBrains Mono", monospace';
        ctx.textAlign = "right";
        [60, 100, 140, 180].forEach((b) => {
          ctx.strokeStyle = "rgba(236,233,226,.08)"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(x0, Y(b)); ctx.lineTo(x1, Y(b)); ctx.stroke();
          ctx.fillStyle = "rgba(236,233,226,.35)"; ctx.textAlign = "left"; ctx.fillText(b, pad, Y(b) + 3);
        });
        // área
        const g = ctx.createLinearGradient(0, y0, 0, y1);
        g.addColorStop(0, "rgba(39,66,255,.55)"); g.addColorStop(1, "rgba(39,66,255,0)");
        ctx.beginPath(); ctx.moveTo(X(0), y1);
        data.forEach((b, i) => ctx.lineTo(X(i), Y(b)));
        ctx.lineTo(X(N - 1), y1); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
        // línea
        ctx.beginPath();
        data.forEach((b, i) => (i ? ctx.lineTo(X(i), Y(b)) : ctx.moveTo(X(i), Y(b))));
        ctx.strokeStyle = "#8FA0FF"; ctx.lineWidth = 1.8; ctx.lineJoin = "round"; ctx.stroke();
        // punto actual con pulso
        const last = data[N - 1], px = X(N - 1), py = Y(last), pulse = (f % 50) / 50;
        ctx.fillStyle = `rgba(143,160,255,${0.5 * (1 - pulse)})`;
        ctx.beginPath(); ctx.arc(px, py, 4 + pulse * 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2); ctx.fill();
        // lectura grande
        const [zn, zt] = zone(last);
        ctx.textAlign = "left"; ctx.fillStyle = "rgba(236,233,226,.5)";
        ctx.fillText(T("PULSACIONES · BPM", "HEART RATE · BPM"), pad, 28);
        ctx.fillStyle = "#ECE9E2";
        const big = Math.min(H * 0.2, W * 0.22);
        ctx.font = `800 ${big}px Archivo, sans-serif`;
        ctx.fillText(Math.round(last), pad - 2, 28 + big * 0.95);
        const bw = ctx.measureText(Math.round(last)).width;
        ctx.font = '500 10px "JetBrains Mono", monospace';
        ctx.fillStyle = "#8FA0FF"; ctx.fillText(`${zn} · ${zt.toUpperCase()}`, pad + bw + 10, 28 + big * 0.5);
        // min / prom / max
        const mn = Math.min(...data), mx = Math.max(...data), av = data.reduce((a, b) => a + b, 0) / N;
        ctx.textAlign = "right"; ctx.fillStyle = "rgba(236,233,226,.5)";
        ctx.fillText(`MIN ${Math.round(mn)}  ·  ${T("PROM", "AVG")} ${Math.round(av)}  ·  MAX ${Math.round(mx)}`, x1, 28);
        // lectura con el cursor
        if (ptr.on && ptr.x > x0 && ptr.x < x1 && ptr.y < y1 + 10) {
          const i = Math.round(((ptr.x - x0) / (x1 - x0)) * (N - 1)), b = data[i], cx = X(i), cy = Y(b);
          ctx.strokeStyle = "rgba(236,233,226,.35)"; ctx.setLineDash([3, 3]);
          ctx.beginPath(); ctx.moveTo(cx, y0 - 10); ctx.lineTo(cx, y1); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = "#2742FF"; ctx.beginPath(); ctx.arc(cx, cy, 4.5, 0, Math.PI * 2); ctx.fill();
          const label = `${Math.round(b)} BPM · ${zone(b)[0]} · −${Math.round(((N - 1 - i) * 4) / 60)} s`;
          ctx.font = '500 10px "JetBrains Mono", monospace'; ctx.textAlign = "left";
          const lw = ctx.measureText(label).width + 14;
          const lx = Math.min(Math.max(cx - lw / 2, x0), x1 - lw), ly = Math.max(cy - 34, y0 - 26);
          ctx.fillStyle = "#ECE9E2"; ctx.fillRect(lx, ly, lw, 20);
          ctx.fillStyle = "#0E0E0E"; ctx.fillText(label, lx + 7, ly + 14);
        }
      };
    }

    if (type === "poster") {
      // pósters suizos: 4 sistemas de composición con parámetros al azar, todo en HTML nítido.
      // La zona de abajo (≈90px) queda libre para el pie del experimento: nada importante va ahí.
      const box = fig.querySelector(".poster");
      const words = T(["Ritmo", "Forma", "Pulso", "Mover", "Marca", "Flujo", "Ippon", "Señal", "Tensión", "Cuerpo"], ["Rhythm", "Form", "Pulse", "Move", "Brand", "Flow", "Ippon", "Signal", "Tension", "Body"]);
      const pick = (a) => a[Math.floor(Math.random() * a.length)];
      const rnd = (a, b) => a + Math.random() * (b - a);
      const pal = [
        { bg: "#2742FF", fg: "#ECE9E2", ac: "#0E0E0E" },
        { bg: "#ECE9E2", fg: "#0E0E0E", ac: "#2742FF" },
        { bg: "#0E0E0E", fg: "#ECE9E2", ac: "#2742FF" },
        { bg: "#ECE9E2", fg: "#2742FF", ac: "#0E0E0E" },
      ];
      let n = 40, last = -1, timer, vertical = false;
      // ajusta la palabra al ancho (o al alto si es vertical) sin regenerar el póster
      const fit = () => {
        const w = box.querySelector(".poster__word span");
        if (!w || !box.clientWidth) return;
        const H = box.clientHeight - 90;
        w.style.fontSize = "100px";
        const target = vertical ? H * 0.62 : box.clientWidth * 0.88;
        w.style.fontSize = Math.max(12, Math.min(100 * (target / w.offsetWidth), H * (vertical ? 0.42 : 0.3))) + "px";
      };
      const render = () => {
        if (!box.clientWidth) return;
        n++;
        let tpl; do { tpl = Math.floor(Math.random() * 4); } while (tpl === last);
        last = tpl;
        const c = pick(pal), word = pick(words);
        const wdth = Math.round(rnd(62, 125)), wght = Math.round(rnd(700, 900));
        let shapes = "";
        if (tpl === 0) {
          const d = rnd(62, 80);
          shapes = `<i class="pe" style="--d:0s;left:${rnd(32, 46)}%;top:${rnd(-10, 4)}%;width:${d}%;aspect-ratio:1;border-radius:50%;background:${c.ac}"></i>`;
        } else if (tpl === 1) {
          for (let i = 0; i < 6; i++) {
            const h = rnd(14, 40);
            shapes += `<i class="pe pe--up" style="--d:${i * 0.06}s;left:${6 + i * 15}%;bottom:96px;width:12%;height:${h}%;background:${i === 2 || i === 4 ? c.ac : c.fg}"></i>`;
          }
        } else if (tpl === 2) {
          shapes = `<i class="pe" style="--d:.05s;right:-24%;top:${rnd(22, 34)}%;width:62%;aspect-ratio:1;border-radius:50%;border:${Math.round(rnd(10, 20))}px solid ${c.ac}"></i>`;
        } else {
          let k = 0;
          for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
            const on = Math.random() < 0.28;
            shapes += `<i class="pe" style="--d:${(k++) * 0.02}s;left:${8 + x * 22}%;top:${32 + y * 9}%;width:6%;aspect-ratio:1;border-radius:${Math.random() < 0.5 ? "50%" : "0"};background:${on ? c.ac : "transparent"};border:1.5px solid ${on ? c.ac : c.fg}"></i>`;
          }
        }
        vertical = tpl === 2;
        const wordPos = tpl === 0 ? "left:6%;bottom:calc(96px + 4%)" : tpl === 1 ? "left:6%;top:15%" : tpl === 2 ? "left:6%;bottom:96px" : "left:6%;top:15%";
        if (window.gsap) gsap.killTweensOf(box.querySelectorAll(".pe"));
        box.style.background = c.bg; box.style.color = c.fg;
        box.innerHTML = `
          <div class="poster__grid">${"<span></span>".repeat(6)}</div>
          ${shapes}
          <div class="poster__word pe pe--up ${vertical ? "is-v" : ""}" style="--d:.15s;${wordPos}"><span style="font-variation-settings:'wdth' ${wdth},'wght' ${wght}">${word}</span></div>
          <div class="poster__meta pe" style="--d:.25s"><span>Manuel Alzugaray</span><span>Nº ${String(n).padStart(3, "0")}</span></div>
          <div class="poster__meta poster__meta--2 pe" style="--d:.3s"><span>${T("Sistema", "System")} ${["A", "B", "C", "D"][tpl]} · ${wdth}/${wght}</span><span>Punta del Este — 2026</span></div>`;
        fit();
        // cada elemento entra con un barrido (GSAP; sin GSAP quedan visibles)
        if (window.gsap) box.querySelectorAll(".pe").forEach((el) => {
          const up = el.classList.contains("pe--up");
          gsap.fromTo(el, { clipPath: up ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "expo.inOut", delay: parseFloat(el.style.getPropertyValue("--d")) || 0 });
        });
      };
      const loop = () => { clearTimeout(timer); timer = setTimeout(() => { if (!ptr.on && ex.visible) render(); loop(); }, 6000); };
      let lastClick = 0;
      fig.addEventListener("click", () => {
        if (performance.now() - lastClick < 350) return; // evita dobles clics que cortan la animación
        lastClick = performance.now();
        render(); loop();
      });
      // al cambiar de tamaño solo se reajusta; el primer póster se arma una vez cargadas las fuentes
      ex.resize = () => (box.childElementCount ? fit() : render());
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { box.childElementCount ? fit() : render(); loop(); });
    }

    ex.resize();
    exps.push(ex);
    new IntersectionObserver(([e]) => (ex.visible = e.isIntersecting)).observe(fig);
  });

  // cada experimento se redimensiona solo cuando cambia SU tamaño (no con la barra del navegador móvil)
  const ro = new ResizeObserver((ents) => ents.forEach((en) => {
    const ex = exps.find((x) => x.fig === en.target);
    if (!ex) return;
    const w = Math.round(en.contentRect.width), h = Math.round(en.contentRect.height);
    if (ex.w === w && ex.h === h) return;
    ex.w = w; ex.h = h;
    ex.resize();
  }));
  exps.forEach((e) => ro.observe(e.fig));
  const loop = () => { exps.forEach((e) => e.visible && e.step && e.step()); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
