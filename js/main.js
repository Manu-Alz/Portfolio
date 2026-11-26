/* =========================================================
   Manu — Portfolio
   Todo el movimiento de la página vive acá.
   ========================================================= */

// ---- Datos de contacto: completá lo que quieras mostrar ----
const CONTACTO = {
  email: "manualzugaray@icloud.com",
  respaldo: "https://github.com/Manu-Alz",    // si no hay email, el botón lleva acá
};

(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Reloj de Uruguay ---------- */
  const fmt = new Intl.DateTimeFormat("es-UY", { hour: "2-digit", minute: "2-digit", timeZone: "America/Montevideo" });
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
      try { await navigator.clipboard.writeText(CONTACTO.email); state.textContent = "Copiado ✓"; }
      catch { location.href = "mailto:" + CONTACTO.email; }
      setTimeout(() => (state.textContent = "Copiar ⧉"), 2200);
    });
  });

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
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  scrollTo(0, 0);

  /* ---------- Scroll suave ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
    $$('a[href^="#"]').forEach((a) =>
      a.addEventListener("click", (e) => {
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
    letters: $$(".k", el).map((k) => ({ k, wdth: 100, wght: 800 })),
  }));
  const io = new IntersectionObserver((ents) => ents.forEach((en) => {
    const item = kinetics.find((x) => x.el === en.target);
    if (item) item.visible = en.isIntersecting;
  }));
  kinetics.forEach((x) => io.observe(x.el));

  gsap.ticker.add(() => {
    const v = Math.min(Math.abs(velocity()) / 40, 1); // velocidad de scroll 0..1
    kinetics.forEach(({ visible, letters }) => {
      if (!visible) return;
      letters.forEach((L) => {
        const r = L.k.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        let tW = 100, tG = 800;
        if (fine && mouse.active) {
          const d = Math.hypot(mouse.x - cx, (mouse.y - cy) * 0.6);
          const f = Math.max(0, 1 - d / (innerWidth * 0.32));
          tW = 100 + f * 25;   // cerca del cursor: más ancha
          tG = 760 + f * 140;
        }
        tW -= v * 30;          // al scrollear rápido se comprime
        L.wdth += (tW - L.wdth) * 0.09;
        L.wght += (tG - L.wght) * 0.09;
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
    // círculo = el mouse (sin lag); pelotita = lo persigue con un poco de lag
    root.classList.add("has-cursor", "cur-out");
    const ring = $(".cursor-ring"), dot = $(".cursor-dot"), cur = $(".cursor"), label = $(".cursor__label");
    const setX = gsap.quickSetter([ring, cur], "x", "px"), setY = gsap.quickSetter([ring, cur], "y", "px");
    const dXTo = gsap.quickTo(dot, "x", { duration: 0.45, ease: "power3" });
    const dYTo = gsap.quickTo(dot, "y", { duration: 0.45, ease: "power3" });
    let first = true;
    addEventListener("pointermove", (e) => {
      setX(e.clientX); setY(e.clientY);
      if (first) { gsap.set(dot, { x: e.clientX, y: e.clientY }); first = false; }
      dXTo(e.clientX); dYTo(e.clientY);
      root.classList.remove("cur-out");
    });
    document.documentElement.addEventListener("pointerleave", () => root.classList.add("cur-out"));
    addEventListener("pointerdown", () => root.classList.add("cur-down"));
    addEventListener("pointerup", () => root.classList.remove("cur-down"));
    $$("[data-cursor], a, button").forEach((el) => {
      el.addEventListener("pointerenter", () => {
        const txt = el.getAttribute("data-cursor");
        if (txt) { label.textContent = txt; root.classList.add("cur-label"); }
        else root.classList.add("cur-link");
      });
      el.addEventListener("pointerleave", () => root.classList.remove("cur-label", "cur-link"));
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
    const next = cards[i + 1];
    if (!next || innerWidth < 900) return;
    gsap.to(card, {
      scale: 0.9 + i * 0.012, opacity: 0.35, ease: "none",
      scrollTrigger: { trigger: next, start: "top bottom", end: "top 15%", scrub: true },
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
  gsap.from(".stat__d, .stat__l", { opacity: 0, y: 16, duration: 1, stagger: 0.05, ease: "expo.out", scrollTrigger: { trigger: ".stats", start: "top 85%" } });

  /* ---------- Atleta: la foto se expande ---------- */
  // negro + logo → el círculo azul del logo se abre y se vuelve la foto
  const expandEl = $(".expand");
  const radius = () => parseFloat(getComputedStyle(expandEl).getPropertyValue("--r")) || 78;
  const full = () => Math.hypot(innerWidth, innerHeight) / 2 + 20;
  const exp = gsap.timeline({
    scrollTrigger: { trigger: ".expand", start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true },
  });
  exp
    .to(".emblem__hint", { opacity: 0, duration: 0.08 }, 0.02)
    .to(".emblem__ring", { scale: 2.6, opacity: 0, ease: "power2.in", duration: 0.32 }, 0.06)
    .to(".emblem__core", { scale: 0.4, opacity: 0, ease: "power2.in", duration: 0.2 }, 0.1)
    .fromTo(".expand__img", { clipPath: () => `circle(${radius()}px at 50% 50%)` },
      { clipPath: () => `circle(${full()}px at 50% 50%)`, ease: "power2.inOut", duration: 0.5 }, 0.12)
    .to(".expand__fill", { opacity: 0, ease: "none", duration: 0.28 }, 0.18)
    .fromTo(".expand__img img", { scale: 1.45 }, { scale: 1, ease: "none", duration: 0.75 }, 0.12)
    .to(".expand__title .reveal-line > span", { yPercent: 0, stagger: 0.06, duration: 0.18, ease: "power2.out" }, 0.62)
    .to({}, { duration: 0.15 });
  gsap.set(".expand__title .reveal-line > span", { y: 0, yPercent: 110 });

  /* ---------- Olas (canvas): el surf de fondo ---------- */
  const cv = $(".waves");
  if (cv) {
    const ctx = cv.getContext("2d");
    let W = 0, H = 0, on = false, t = 0;
    const size = () => { const d = Math.min(devicePixelRatio, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    size(); addEventListener("resize", size);
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
          const near = Math.max(0, 1 - Math.hypot(x - mxl, y0 - myl) / 260);
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
  const sects = [["inicio", "00", "Inicio"], ["sobre", "01", "Sobre mí"], ["trabajo", "02", "Trabajo"], ["hago", "03", "Servicios"],
    ["trayectoria", "04", "Trayectoria"], ["lab", "05", "Experimentación gráfica"], ["atleta", "06", "Método"], ["contacto", "07", "Contacto"]];
  const sN = $(".sect__n"), sT = $(".sect__t");
  let curSect = "inicio";
  const showSect = ([id, n, t]) => {
    if (curSect === id) return;
    curSect = id;
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
  if (innerWidth >= 900) {
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
  } else {
    $$(".step").forEach((s) => gsap.from(s, { opacity: 0, y: 40, duration: 1, ease: "expo.out", scrollTrigger: { trigger: s, start: "top 88%" } }));
  }

  /* ---------- Laboratorio: entrada ---------- */
  gsap.from(".exp", { opacity: 0, y: 60, scale: 0.96, duration: 1.2, stagger: 0.12, ease: "expo.out", scrollTrigger: { trigger: ".lab__grid", start: "top 85%" } });
  gsap.from(".contact__meta > *", { opacity: 0, y: 30, duration: 1, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: ".contact__meta", start: "top 92%" } });

  /* ---------- Ajustes al cambiar tamaño ---------- */
  let rz;
  addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { fitAll(); ScrollTrigger.refresh(); }, 150); });
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
    fig.addEventListener("pointerleave", () => { ptr.on = false; ptr.x = ptr.y = -9999; });
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

    if (type === "sphere" || type === "poster" || type === "halftone") {
      const cv = fig.querySelector("canvas"), ctx = cv.getContext("2d");
      let W = 0, H = 0;
      const base = () => {
        const d = Math.min(devicePixelRatio || 1, 2);
        W = fig.clientWidth; H = fig.clientHeight;
        cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      };

      if (type === "sphere") {
        // esfera de Fibonacci que respira; se arrastra para girarla
        const N = 1800, pts = [];
        const ga = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < N; i++) {
          const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = ga * i;
          pts.push({ x: Math.cos(th) * r, y, z: Math.sin(th) * r, lat: Math.asin(y), lon: th });
        }
        let ax = -0.35, ay = 0, vx = 0, vy = 0.004, t = 0, down = false, lx = 0, ly = 0;
        fig.addEventListener("pointerdown", (e) => { down = true; lx = e.clientX; ly = e.clientY; fig.setPointerCapture?.(e.pointerId); });
        fig.addEventListener("pointerup", () => (down = false));
        fig.addEventListener("pointercancel", () => (down = false));
        fig.addEventListener("pointermove", (e) => {
          if (!down) return;
          vy = (e.clientX - lx) * 0.0009; vx = (e.clientY - ly) * 0.0009; lx = e.clientX; ly = e.clientY;
        });
        ex.resize = base;
        ex.step = () => {
          t += 0.012;
          ay += vy; ax += vx;
          if (!down) { vy += (0.004 - vy) * 0.02; vx *= 0.94; }
          ctx.clearRect(0, 0, W, H);
          const R = Math.min(W, H) * 0.36, cx = W / 2, cy = H / 2 - 10, fov = R * 2.6;
          const sx = Math.sin(ax), cxr = Math.cos(ax), sy = Math.sin(ay), cyr = Math.cos(ay);
          const hx = ptr.on ? (ptr.x - cx) / R : 9, hy = ptr.on ? (ptr.y - cy) / R : 9;
          // anillo orbital
          ctx.strokeStyle = "rgba(143,160,255,.25)"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.ellipse(cx, cy, R * 1.45, R * 0.32, -0.3, 0, Math.PI * 2); ctx.stroke();
          for (const p of pts) {
            const m = 1 + 0.07 * Math.sin(p.lat * 4 + t * 1.6) * Math.cos(p.lon * 3 - t);
            let x = p.x * m, y = p.y * m, z = p.z * m;
            let x1 = x * cyr + z * sy, z1 = -x * sy + z * cyr;
            let y1 = y * cxr - z1 * sx, z2 = y * sx + z1 * cxr;
            const s = fov / (fov + z2 * R);
            const px = cx + x1 * R * s, py = cy + y1 * R * s;
            const near = Math.max(0, 1 - Math.hypot(x1 * s - hx, y1 * s - hy) / 0.5);
            const depth = (1 - z2) / 2; // 1 = adelante
            ctx.fillStyle = near > 0.05 && z2 < 0 ? `rgba(255,255,255,${0.6 + near * 0.4})` : depth > 0.5 ? `rgba(236,233,226,${0.25 + depth * 0.6})` : `rgba(39,66,255,${0.35 + depth * 0.5})`;
            const r = (0.6 + depth * 1.3) * s + near * 2.2;
            ctx.fillRect(px - r / 2, py - r / 2, r, r);
          }
        };
      }

      if (type === "poster") {
        // composición suiza nueva en cada clic (y sola cada 5 s)
        const pal = [["#ECE9E2", "#0E0E0E", "#2742FF"], ["#2742FF", "#ECE9E2", "#0E0E0E"], ["#0E0E0E", "#ECE9E2", "#2742FF"], ["#ECE9E2", "#2742FF", "#0E0E0E"]];
        const words = ["MOVER", "FORMA", "RITMO", "−73", "MARCA", "PULSO", "IPPON", "FLUJO", "2026"];
        let comp = null, age = 0, idle = 0, n = 41;
        const R = (a, b) => a + Math.random() * (b - a);
        const pick = (a) => a[Math.floor(Math.random() * a.length)];
        const make = () => {
          n++;
          const [bg, fg, ac] = pick(pal);
          const els = [];
          const cols = 6;
          for (let i = 0; i < 5; i++) {
            const kind = pick(["circle", "rect", "rect", "bar", "arc"]);
            els.push({ kind, c: Math.random() < 0.4 ? ac : fg, x: Math.floor(R(0, cols)) / cols, y: R(0.08, 0.7), s: R(0.12, 0.5), r: pick([0, Math.PI / 2, Math.PI / 4]), d: i * 6 });
          }
          comp = { bg, fg, ac, els, word: pick(words), wx: pick([0.06, 0.08]), wy: R(0.4, 0.6), stretch: pick(["ultra-condensed", "condensed", "normal", "expanded"]), n };
          age = 0;
        };
        fig.addEventListener("click", make);
        ex.resize = () => { base(); if (!comp) make(); };
        const ease = (k) => 1 - Math.pow(1 - Math.min(Math.max(k, 0), 1), 4);
        ex.step = () => {
          age++; idle++;
          if (ptr.on) idle = 0;
          if (idle > 300) { make(); idle = 0; }
          const { bg, fg, els } = comp;
          ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
          // grilla
          ctx.strokeStyle = fg; ctx.globalAlpha = 0.12; ctx.lineWidth = 1;
          for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo((W * i) / 6, 0); ctx.lineTo((W * i) / 6, H); ctx.stroke(); }
          ctx.globalAlpha = 1;
          const U = Math.min(W, H);
          els.forEach((e) => {
            const k = ease((age - e.d) / 40);
            if (k <= 0) return;
            ctx.save(); ctx.fillStyle = e.c; ctx.strokeStyle = e.c;
            const x = e.x * W, y = e.y * H, s = e.s * U * k;
            ctx.translate(x, y); ctx.rotate(e.r * k);
            if (e.kind === "circle") { ctx.beginPath(); ctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2); ctx.fill(); }
            else if (e.kind === "rect") ctx.fillRect(0, 0, s, s * 0.62);
            else if (e.kind === "bar") ctx.fillRect(0, 0, s * 1.6, Math.max(3, s * 0.06));
            else { ctx.lineWidth = Math.max(3, s * 0.08); ctx.beginPath(); ctx.arc(s / 2, s / 2, s / 2, Math.PI, Math.PI * 2); ctx.stroke(); }
            ctx.restore();
          });
          // palabra grande
          const kw = ease((age - 18) / 50);
          ctx.fillStyle = fg;
          if ("fontStretch" in ctx) ctx.fontStretch = comp.stretch;
          let fs = W * 0.3;
          ctx.font = `800 ${fs}px Archivo, sans-serif`;
          const tw = ctx.measureText(comp.word).width;
          fs = Math.min(fs * ((W * 0.88) / tw), H * 0.32);
          ctx.font = `800 ${fs}px Archivo, sans-serif`;
          ctx.save(); ctx.beginPath(); ctx.rect(0, H * comp.wy - fs * 0.8, W, fs * 0.82); ctx.clip();
          ctx.fillText(comp.word, W * comp.wx, H * comp.wy + fs * 0.8 * (1 - kw));
          ctx.restore();
          if ("fontStretch" in ctx) ctx.fontStretch = "normal";
          // datos
          ctx.font = `500 ${Math.max(9, W * 0.022)}px "JetBrains Mono", monospace`;
          ctx.globalAlpha = ease((age - 30) / 30);
          ctx.fillText("MANUEL ALZUGARAY", W * 0.06, H * 0.07);
          ctx.fillText(`Nº ${String(comp.n).padStart(3, "0")}`, W * 0.72, H * 0.07);
          ctx.fillText("PUNTA DEL ESTE — UY", W * 0.06, H * 0.9);
          ctx.globalAlpha = 1;
        };
      }

      if (type === "halftone") {
        // trama de semitono sobre la foto; cerca del cursor los puntos crecen y se pintan de azul
        const img = new Image();
        let lum = null, cols = 0, rows = 0, cell = 9, t = 0, ready = false;
        const sample = () => {
          if (!img.complete || !img.naturalWidth || !W) return;
          cell = W < 500 ? 7 : 9;
          cols = Math.ceil(W / cell); rows = Math.ceil(H / cell);
          const oc = document.createElement("canvas"); oc.width = cols; oc.height = rows;
          const o = oc.getContext("2d");
          const ir = img.naturalWidth / img.naturalHeight, br = cols / rows;
          let sw = img.naturalWidth, sh = img.naturalHeight, sx = 0, sy = 0;
          if (ir > br) { sw = sh * br; sx = (img.naturalWidth - sw) * 0.62; } else { sh = sw / br; sy = (img.naturalHeight - sh) * 0.25; }
          o.drawImage(img, sx, sy, sw, sh, 0, 0, cols, rows);
          try {
            const d = o.getImageData(0, 0, cols, rows).data;
            lum = new Float32Array(cols * rows);
            for (let i = 0; i < cols * rows; i++) lum[i] = (d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11) / 255;
            ready = true;
          } catch { ready = false; }
        };
        img.onload = sample;
        img.src = "assets/dojo.jpg";
        ex.resize = () => { base(); sample(); };
        ex.step = () => {
          t += 0.03;
          ctx.fillStyle = "#ECE9E2"; ctx.fillRect(0, 0, W, H);
          if (!ready) return;
          const RR = Math.min(W, H) * 0.3;
          for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
            const x = i * cell + cell / 2, y = j * cell + cell / 2;
            const dark = 1 - lum[j * cols + i];
            const near = ptr.on ? Math.max(0, 1 - Math.hypot(x - ptr.x, y - ptr.y) / RR) : 0;
            const wave = 0.06 * Math.sin(i * 0.25 + j * 0.18 - t);
            const r = Math.max(0, (dark * 0.62 + wave + near * 0.25)) * cell * 0.62;
            if (r < 0.35) continue;
            ctx.fillStyle = near > 0.15 ? "#2742FF" : "#0E0E0E";
            ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
          }
        };
      }
    }

    ex.resize();
    exps.push(ex);
    new IntersectionObserver(([e]) => (ex.visible = e.isIntersecting)).observe(fig);
  });

  let rz;
  addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => exps.forEach((e) => e.resize()), 200); });
  const loop = () => { exps.forEach((e) => e.visible && e.step && e.step()); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
