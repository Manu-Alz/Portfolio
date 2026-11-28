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

  /* ---------- Clima y olas en Punta del Este (Open-Meteo, sin clave ni datos del visitante) ---------- */
  (async () => {
    const out = $("[data-wx]");
    if (!out) return;
    const sky = (c) =>
      c === 0 ? T("despejado", "clear") : c <= 3 ? T("algo nublado", "partly cloudy") : c <= 48 ? T("niebla", "fog")
      : c <= 67 || (c >= 80 && c <= 82) ? T("lluvia", "rain") : c <= 77 ? T("nieve", "snow") : T("tormenta", "storm");
    let d = null;
    try { const c = JSON.parse(sessionStorage.getItem("wx") || "null"); if (c && Date.now() - c.t < 15 * 60e3) d = c; } catch (e) {}
    if (!d) {
      try {
        const q = "&timezone=America%2FMontevideo";
        const [w, m] = await Promise.all([
          fetch("https://api.open-meteo.com/v1/forecast?latitude=-34.96&longitude=-54.94&current=temperature_2m,weather_code" + q).then((r) => r.json()),
          fetch("https://marine-api.open-meteo.com/v1/marine?latitude=-34.98&longitude=-54.93&current=wave_height,wave_period" + q).then((r) => r.json()).catch(() => null),
        ]);
        d = { t: Date.now(), temp: w.current.temperature_2m, code: w.current.weather_code, wave: m && m.current ? m.current.wave_height : null };
        try { sessionStorage.setItem("wx", JSON.stringify(d)); } catch (e) {}
      } catch (e) { return; } // sin conexión o API caída: no se muestra nada
    }
    const fmt1 = (n) => n.toLocaleString(window.LANG === "en" ? "en-US" : "es-UY", { maximumFractionDigits: 1 });
    out.textContent = ` · ${Math.round(d.temp)}°` + (d.wave != null ? ` · ${T("olas", "waves")} ${fmt1(d.wave)} m` : "");
    out.title = T("Ahora en Punta del Este: ", "Now in Punta del Este: ") + sky(d.code);
    out.hidden = false;
  })();

  /* ---------- Sonido opcional (apagado por defecto): clics suaves y ambiente de olas, sintetizados ---------- */
  (() => {
    const btns = $$("[data-sound]");
    if (!btns.length || !(window.AudioContext || window.webkitAudioContext)) { btns.forEach((b) => b.remove()); return; }
    let on = false, ctx = null, master = null, sea = null;
    try { on = localStorage.getItem("sound") === "on"; } catch (e) {}
    const label = () => btns.forEach((b) => {
      b.setAttribute("aria-pressed", String(on));
      b.innerHTML = `<span class="snd__bars" aria-hidden="true"><i></i><i></i><i></i></span>${T("Sonido", "Sound")} <b>${on ? "on" : "off"}</b>`;
      b.classList.toggle("is-on", on);
    });
    const init = () => {
      if (ctx) return;
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
      // olas: ruido marrón filtrado, con un vaivén lento de volumen y de filtro
      const len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; }
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 700;
      const g = ctx.createGain(); g.gain.value = 0.22;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.09;
      const lfoG = ctx.createGain(); lfoG.gain.value = 0.16; lfo.connect(lfoG).connect(g.gain);
      const lfo2 = ctx.createOscillator(); lfo2.frequency.value = 0.07;
      const lfo2G = ctx.createGain(); lfo2G.gain.value = 380; lfo2.connect(lfo2G).connect(lp.frequency);
      src.connect(lp).connect(g).connect(master);
      src.start(); lfo.start(); lfo2.start();
      sea = g;
    };
    const fade = (v) => { if (!ctx) return; const t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setTargetAtTime(v, t, 0.35); };
    const set = (v) => {
      on = v;
      try { localStorage.setItem("sound", on ? "on" : "off"); } catch (e) {}
      if (on) { init(); ctx.resume(); fade(0.5); } else fade(0);
      label();
    };
    // efectos: un "tic" de madera para clics y un gong para el ippon
    const blip = (f, dur, vol, type = "sine") => {
      const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.6, t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
    };
    window.__sfx = (name) => {
      if (!on || !ctx) return;
      if (name === "click") blip(1500, 0.06, 0.06, "triangle");
      if (name === "ippon") { blip(196, 1.6, 0.22); blip(392, 1.2, 0.08); }
    };
    btns.forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); set(!on); window.__sfx("click"); }));
    document.addEventListener("click", (e) => { if (e.target.closest("a, button:not([data-sound])")) window.__sfx("click"); });
    // si lo dejaste encendido, se reanuda con la primera interacción (los navegadores no permiten sonar antes)
    if (on) addEventListener("pointerdown", () => { init(); ctx.resume(); fade(0.5); }, { once: true });
    document.addEventListener("visibilitychange", () => { if (ctx && on) fade(document.hidden ? 0 : 0.5); });
    label();
  })();

  /* ---------- Easter egg: código Konami o clic largo en el logo → marcador de judo con IPPON ---------- */
  (() => {
    let egg = null, timer = 0;
    const p2 = (n) => String(n).padStart(2, "0");
    const close = () => { if (!egg) return; egg.classList.remove("is-open"); clearInterval(timer); window.__lenis && window.__lenis.start(); setTimeout(() => { egg && egg.remove(); egg = null; }, 500); };
    const open = () => {
      if (egg) return;
      window.__sfx && window.__sfx("ippon");
      egg = document.createElement("div");
      egg.className = "egg";
      egg.setAttribute("role", "dialog");
      egg.setAttribute("aria-label", T("Easter egg: ippon", "Easter egg: ippon"));
      egg.innerHTML = `
        <div class="egg__board mono">
          <div class="egg__row egg__row--w"><span class="egg__flag"></span><b>MANU</b><span class="egg__score"><i>1</i><i>0</i><i>0</i></span></div>
          <div class="egg__row egg__row--b"><span class="egg__flag egg__flag--b"></span><b>${T("TU PROYECTO", "YOUR PROJECT")}</b><span class="egg__score"><i>0</i><i>0</i><i>0</i></span></div>
          <div class="egg__clock" data-egg-clock>4:00</div>
        </div>
        <p class="egg__big">IPPON<span>一本</span></p>
        <p class="egg__cap mono">${T("Encontraste el ippon escondido. Cuando quieras, hablemos.", "You found the hidden ippon. Whenever you’re ready, let’s talk.")}</p>
        <button class="egg__close mono" type="button">${T("Cerrar ✕", "Close ✕")}</button>`;
      document.body.appendChild(egg);
      window.__lenis && window.__lenis.stop();
      requestAnimationFrame(() => egg.classList.add("is-open"));
      // el reloj del combate corre hacia atrás y se frena: el ippon termina el combate
      let s = 240; const clock = egg.querySelector("[data-egg-clock]");
      timer = setInterval(() => { s -= 7; if (s <= 3 * 60 + 12) { s = 3 * 60 + 12; clearInterval(timer); clock.classList.add("is-stop"); } clock.textContent = `${Math.floor(s / 60)}:${p2(s % 60)}`; }, 60);
      egg.querySelector(".egg__close").addEventListener("click", close);
      egg.addEventListener("click", (e) => { if (e.target === egg) close(); });
      egg.querySelector(".egg__close").focus();
    };
    addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
    // ↑ ↑ ↓ ↓ ← → ← → B A
    const code = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let pos = 0;
    addEventListener("keydown", (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = k === code[pos] ? pos + 1 : k === code[0] ? 1 : 0;
      if (pos === code.length) { pos = 0; open(); }
    });
    // clic largo (o toque largo) en el logo
    const logo = $(".nav__logo");
    if (logo) {
      let hold = 0, fired = false;
      const start = () => { fired = false; hold = setTimeout(() => { fired = true; open(); }, 700); };
      const stop = () => clearTimeout(hold);
      logo.addEventListener("pointerdown", start);
      ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => logo.addEventListener(ev, stop));
      logo.addEventListener("click", (e) => { if (fired) { e.preventDefault(); e.stopImmediatePropagation(); fired = false; } }, true);
      logo.addEventListener("contextmenu", (e) => { if (fired) e.preventDefault(); });
    }
  })();

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
      // barra de progreso y timecode sincronizados con la vista previa
      const bar = $(".reel__bar i", r), tcEl = $("[data-reel-tc]", r);
      const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
      v.addEventListener("timeupdate", () => {
        if (!v.duration) return;
        if (bar) bar.style.transform = `scaleX(${v.currentTime / v.duration})`;
        if (tcEl) tcEl.textContent = `${mmss(v.currentTime)} / ${mmss(v.duration)}`;
      });
      r.addEventListener("click", (e) => openReel(r, e));
      r.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") openReel(r, e); });
    });
    $(".reel-modal__close").addEventListener("click", closeReel);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeReel(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") closeReel(); });
  }


  /* ---------- Sin librerías o con "reducir movimiento": todo visible ---------- */
  if (!window.gsap || !window.ScrollTrigger || reduce) {
    root.classList.remove("js", "is-quick");
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
        lenis.scrollTo(target, { offset: a.closest(".work__index") ? -76 : 0, duration: 1.6, easing: (x) => 1 - Math.pow(1 - x, 4) });
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
  // es un cinturón de judo: avanza y cambia de color de blanco a negro según cuánto recorriste
  const BELTS = [
    ["#F4F2EC", T("Blanco", "White")], ["#F2C230", T("Amarillo", "Yellow")], ["#EE7A2A", T("Naranja", "Orange")],
    ["#2FA35A", T("Verde", "Green")], ["#2742FF", T("Azul", "Blue")], ["#7A4A26", T("Marrón", "Brown")], ["#0E0E0E", T("Negro", "Black")],
  ];
  // barra de navegación: fondo sólido al bajar; se esconde al bajar y vuelve apenas subís
  const navEl = $(".nav");
  let lastY = 0;
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: () => {
      const y = scrollY;
      navEl.classList.toggle("is-solid", y > 40);
      if (Math.abs(y - lastY) < 6) return;
      navEl.classList.toggle("is-hidden", y > lastY && y > 500 && !root.classList.contains("menu-open"));
      lastY = y;
    },
  });
  const belt = $(".progress"), beltTag = $(".progress__tag");
  let beltI = -1;
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: (s) => {
      gsap.set(belt, { scaleX: s.progress });
      const i = Math.min(BELTS.length - 1, Math.floor(s.progress * BELTS.length));
      if (i === beltI) return;
      beltI = i;
      belt.style.setProperty("--belt", BELTS[i][0]);
      if (beltTag && s.progress > 0.01) { beltTag.style.setProperty("--belt", BELTS[i][0]); beltTag.textContent = T("Cinturón ", "") + BELTS[i][1].toLowerCase() + T("", " belt"); beltTag.classList.add("is-show"); clearTimeout(beltTag._t); beltTag._t = setTimeout(() => beltTag.classList.remove("is-show"), 1400); }
    },
  });

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
    // rect del contenido real: un link estirado por la grilla (como el logo) se encuadra solo donde está el texto
    const rectOf = (el) => {
      const r = el.getBoundingClientRect();
      const rg = document.createRange(); rg.selectNodeContents(el);
      const c = rg.getBoundingClientRect();
      return c.width > 0 && r.width - c.width > 40 ? c : r;
    };
    const pad4 = (n) => String(Math.max(0, Math.round(n))).padStart(4, "0");
    const place = () => {
      raf = 0;
      if (locked && locked.isConnected) {
        const r = rectOf(locked);
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
        const r = rectOf(el);
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
  // precarga corta (~1,2 s hasta ver contenido) y completa solo la primera vez de la sesión
  const STEP = 0.17;
  load.to(counter, {
    v: 100, duration: STEP * words.length, ease: "power2.inOut",
    onUpdate: () => (count.textContent = String(Math.round(counter.v)).padStart(3, "0")),
  }, 0);
  words.forEach((w, i) => {
    load.fromTo(w, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.16, ease: "power3.out" }, i * STEP);
    if (i < words.length - 1) load.to(w, { yPercent: -60, opacity: 0, duration: 0.14, ease: "power3.in" }, i * STEP + 0.14);
  });
  const OUT = STEP * words.length;
  load
    .to(".loader", { clipPath: "inset(0 0 100% 0)", duration: 0.8, ease: "expo.inOut" }, OUT)
    .add(() => intro.play(), OUT + 0.2);
  // al cambiar de idioma o en visitas siguientes de la misma sesión: casi instantánea
  let quick = null, seen = null, backTo = 0;
  try {
    quick = sessionStorage.getItem("quickLoad"); seen = sessionStorage.getItem("seenLoader");
    backTo = +sessionStorage.getItem("scrollY") || 0;
    sessionStorage.removeItem("quickLoad"); sessionStorage.removeItem("scrollY"); sessionStorage.setItem("seenLoader", "1");
  } catch (e) {}
  if (quick) {
    // venís del botón ES / EN: sin precarga; la cortina azul (que ya tapa la página desde el primer cuadro) se levanta
    load.kill(); $(".loader").remove();
    const cur = $(".curtain");
    $(".curtain__label").textContent = T("Español", "English");
    gsap.set(cur, { clipPath: "inset(0% 0 0% 0)" });
    root.classList.remove("is-quick");
    lenis && lenis.start();
    if (backTo && lenis) lenis.scrollTo(backTo, { immediate: true, force: true });
    ScrollTrigger.refresh();
    gsap.timeline({ delay: 0.15 })
      .to(cur, { clipPath: "inset(0% 0 100% 0)", duration: 0.8, ease: "expo.inOut" })
      .add(() => intro.play(), 0.3);
  } else if (seen) {
    load.timeScale(4);
    load.eventCallback("onComplete", () => {
      lenis && lenis.start(); $(".loader").remove(); ScrollTrigger.refresh();
      if (quick && backTo && lenis) lenis.scrollTo(backTo, { immediate: true, force: true });
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
    const img = $(".card__media > img", card); // solo la captura principal (no la miniatura del reel)
    gsap.fromTo($(".card__media", card), { clipPath: "inset(18% 10% 18% 10% round 24px)" }, {
      clipPath: "inset(0% 0% 0% 0% round 10px)", ease: "power2.out",
      scrollTrigger: { trigger: card, start: "top 92%", end: "top 30%", scrub: 0.6 },
    });
    // parallax solo dentro del alto que sobra (la captura nunca deja un hueco ni pierde los costados)
    if (img) gsap.fromTo(img, { yPercent: -9 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true } });
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

  /* ---------- Atleta: la foto se expande ---------- */
  // negro + logo → la foto entra en tiras que se arman (a tamaño real, sin zoom) → anotación y título
  const exp = gsap.timeline({
    scrollTrigger: { trigger: ".expand", start: "top top", end: "bottom bottom", scrub: 0.6 },
  });
  const slices = $$(".shot__slice");
  exp
    // intro: el título se va; el recuadro (ya fijado sobre la foto) deja lugar a las marcas de corte
    .to(".aim__hint", { opacity: 0, duration: 0.04 }, 0)
    .to(".aim__title", { opacity: 0, yPercent: -12, ease: "power2.in", duration: 0.12 }, 0.03)
    .to(".aim__box", { opacity: 0, duration: 0.06 }, 0.44)
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
  // recuadro de tracking: busca saltando de palabra en palabra; al empezar a bajar se fija sobre la foto
  const lockBox = $(".aim__box"), sticky = $(".expand__sticky");
  if (lockBox && sticky) {
    const words = $$(".aim .lw"), state = $("[data-lock-state]"), confEl = $("[data-lock-conf]");
    const PAD = 12;
    const rel = (el, pad) => {
      const s = sticky.getBoundingClientRect(), r = el.getBoundingClientRect();
      return { x: r.left - s.left - pad, y: r.top - s.top - pad, width: r.width + pad * 2, height: r.height + pad * 2 };
    };
    let hunt = null, locked = false;
    const buildHunt = () => {
      if (hunt) hunt.kill();
      hunt = gsap.timeline({ repeat: -1, paused: locked });
      words.forEach((w) => {
        hunt.add(() => {
          gsap.to(lockBox, { ...rel(w, PAD), duration: 0.7, ease: "expo.inOut", overwrite: true });
          if (confEl) confEl.textContent = (0.32 + Math.random() * 0.4).toFixed(2);
        }).to({}, { duration: 1.25 });
      });
    };
    gsap.set(lockBox, rel(words[0], PAD));
    buildHunt();
    const setLocked = (v) => {
      if (v === locked) return;
      locked = v;
      lockBox.classList.toggle("is-locked", v);
      if (state) state.textContent = v ? T("Objetivo fijado", "Target locked") : T("Buscando", "Searching");
      if (v) {
        hunt.pause();
        if (confEl) confEl.textContent = "0.98";
        gsap.to(lockBox, { ...rel($(".shot"), 0), duration: 0.8, ease: "expo.inOut", overwrite: true });
      } else hunt.restart();
    };
    ScrollTrigger.create({ trigger: ".expand", start: "top top", end: "bottom bottom", onUpdate: (s) => setLocked(s.progress > 0.015), onLeaveBack: () => setLocked(false) });
    // al cambiar el tamaño de la ventana, se recalculan las posiciones
    ScrollTrigger.addEventListener("refresh", () => { buildHunt(); if (locked) gsap.set(lockBox, rel($(".shot"), 0)); else gsap.set(lockBox, rel(words[0], PAD)); });
  }
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
    ["trayectoria", "04", T("Trayectoria", "Journey")], ["atleta", "05", T("Método", "Method")], ["contacto", "06", T("Contacto", "Contact")]];
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
