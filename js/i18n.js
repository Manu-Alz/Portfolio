/* =========================================================
   Idioma: dos páginas reales, indexables por separado.
   - /            → español (el HTML base)
   - /en/         → inglés, generado con tools/build-en.ps1 a partir
                    de las traducciones de este archivo
   Cada página trae el idioma en <html data-static-lang="…">, así
   este script no reescribe nada al cargar: solo maneja el botón
   ES / EN y recuerda la elección del visitante.
   Al generar /en/ se abre la página con ?build=en y ahí sí se
   aplican las traducciones (ver apply() al final).
   ========================================================= */
(() => {
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  const BUILD = params.get("build") === "en";
  const PAGE = BUILD ? "en" : root.dataset.staticLang || "es";
  const LANG = PAGE;
  // URL de la otra versión (relativa, sirve igual en GitHub Pages y en local)
  const otherUrl = (lang) => (lang === "en" ? (PAGE === "en" ? "./" : "en/") : PAGE === "en" ? "../" : "./");

  if (!BUILD) {
    let saved = null;
    try { saved = localStorage.getItem("lang"); } catch (e) {}
    // links viejos con ?lang=xx, o una elección guardada distinta a esta página → ir a la versión correcta
    const asked = params.get("lang") === "en" || params.get("lang") === "es" ? params.get("lang") : null;
    const want = asked || saved;
    if (asked) { try { localStorage.setItem("lang", asked); } catch (e) {} }
    if (want && want !== PAGE) {
      location.replace(otherUrl(want) + location.hash);
      return;
    }
  }
  window.LANG = LANG;
  window.T = (es, en) => (LANG === "en" ? en : es);
  root.lang = LANG;

  // botón ES / EN: guarda la elección y va a la otra página (salteando la precarga larga)
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-lang-toggle]");
    if (!b) return;
    e.preventDefault();
    const next = LANG === "en" ? "es" : "en";
    try { localStorage.setItem("lang", next); sessionStorage.setItem("quickLoad", "1"); sessionStorage.setItem("scrollY", String(Math.round(scrollY))); } catch (err) {}
    const go = () => (location.href = otherUrl(next) + location.hash);
    // la cortina azul tapa la página con el nombre del idioma; la otra página arranca tapada y la destapa
    const cur = document.querySelector(".curtain");
    if (!cur || matchMedia("(prefers-reduced-motion: reduce)").matches) return go();
    cur.querySelector(".curtain__label").textContent = next === "en" ? "English" : "Español";
    cur.style.transition = "clip-path .6s cubic-bezier(.76,0,.24,1)";
    requestAnimationFrame(() => (cur.style.clipPath = "inset(0% 0 0 0)"));
    setTimeout(go, 640);
  });

  const k = (word) => [...word].map((c) => `<span class="k">${c === " " ? "&nbsp;" : c}</span>`).join("");
  // título accesible: el texto real para lectores de pantalla y buscadores, las letras sueltas solo visuales
  const kh = (word) => `<span class="sr-only">${word}</span><span class="kw" aria-hidden="true">${k(word)}</span>`;

  // [selector, índice (o "all" con array), html]
  const EN = [
    ["title", 0, null, () => (document.title = "Manuel Alzugaray — Brand, web and video design & development")],
    // carga y navegación
    [".loader__words", 0, "<span>Brand</span><span>Design</span><span>Code</span><span>Video</span><span>Method</span><span>Manu</span>"],
    [".loader__bottom .mono", 0, "Loading motion"],
    [".sect__t", 0, "Home"],
    [".nav__links a", 0, "Work"], [".nav__links a", 1, "Journey"], [".nav__links a", 2, "Athlete"],
    [".nav__links a", 3, "Let’s talk"],
    [".nav__menu-t", 0, "Menu"],
    [".mnav__links a", 0, '<span class="mono">01</span>About'], [".mnav__links a", 1, '<span class="mono">02</span>Work'],
    [".mnav__links a", 2, '<span class="mono">03</span>Services'], [".mnav__links a", 3, '<span class="mono">04</span>Journey'],
    [".mnav__links a", 4, '<span class="mono">05</span>Method'], [".mnav__links a", 5, '<span class="mono">06</span>Contact'],
    // portada
    [".hero__kicker", 0, '<span class="reveal-line"><span>(Manuel Alzugaray — Portfolio 2026)</span></span>'],
    [".badge textPath", 0, "DESIGN ✦ CODE ✦ BRAND ✦ URUGUAY ✦"],
    [".badge__core small", 0, "Since"],
    [".hero__intro", 0, '<span class="reveal-line"><span>I design and build</span></span><span class="reveal-line"><span><em>brands</em>, websites and video</span></span><span class="reveal-line"><span>with an athlete’s method.</span></span>'],
    [".stack__list", 0, "<li>HTML</li><li>CSS</li><li>JavaScript</li><li>GSAP</li><li>ScrollTrigger</li><li>Lenis</li><li>Canvas</li><li>SVG</li><li>Web Audio</li><li>DaVinci Resolve</li><li>PWA</li><li>REST APIs</li><li>Technical SEO</li><li>i18n</li><li>GitHub Pages</li>"], [".stack__list", 1, "<li>HTML</li><li>CSS</li><li>JavaScript</li><li>GSAP</li><li>ScrollTrigger</li><li>Lenis</li><li>Canvas</li><li>SVG</li><li>Web Audio</li><li>DaVinci Resolve</li><li>PWA</li><li>REST APIs</li><li>Technical SEO</li><li>i18n</li><li>GitHub Pages</li>"],
    [".hero__tags", 0, "<li>Brand</li><li>Web</li><li>Video</li><li>Punta del Este, UY</li>"],
    [".hero__scroll span", 0, "See projects"],
    [".marquee__track", 0, '<span>Judo</span><i>✦</i><span class="serif">Surf</span><i>✦</i><span>Brands</span><i>✦</i><span class="serif">Websites</span><i>✦</i><span>Video editing</span><i>✦</i><span class="serif">Content</span><i>✦</i><span>Motion</span><i>✦</i><span class="serif">Art direction</span><i>✦</i>'],
    // sobre mí
    ["#sobre .label", 0, "(01) — About"],
    ["#sobre .manifesto__text", 0, null, (el) => {
      // se reemplazan solo los textos, los íconos animados quedan
      const scr = el.querySelector(".pill--screen"), gi = el.querySelector(".gi-icon"), wave = el.querySelector(".pill--wave");
      el.innerHTML = "";
      el.append("I design and build brands and digital products ", scr, " for companies that need results. I work with the discipline of the mat ", gi, " and the patience of the ocean ", wave, ": ");
      el.insertAdjacentHTML("beforeend", "measurable goals, progress every week and every detail refined until it <em>performs</em>.");
    }],
    [".manifesto__foot p", 0, "I’m Manuel Alzugaray, an independent designer and developer based in Punta del Este, Uruguay. Since 2023 I’ve been building brands, websites and apps end to end: strategy, identity, interface, code, content and launch. I also produce and edit video, after a year of continuous content creation."],
    [".manifesto__foot p", 1, "The other half of my life is sport. I train judo in the −73 kg category, coach strength training, and grew up in a family of high-performance athletes. That shapes how I work: clear goals, consistency and measured adjustments. I work in Spanish and English (C2)."],
    // trabajo
    ["#trabajo .label", 0, "(02) — Selected work"],
    [".work__head .big-title", 0, kh("Work") + '<sup class="mono" aria-hidden="true">05</sup>'], [".hero__name .sr-only", 0, "Manuel Alzugaray — Brand, web and video design &amp; development in Punta del Este, Uruguay"],
    [".work__intro", 0, "Own and client projects, from idea to launch. Each one treated as a product: with a goal, an audience and something to improve next."],
    [".reel__play span", 0, "Watch with sound"], [".reel__top > span", 0, "<i class=\"reel__rec\"></i>REC · Eventos PDE reel"],
    [".reel-modal__close", 0, "Close ✕"],
    // servicios
    ["#hago .label", 0, "(03) — What I do"],
    [".svc__intro", 0, "End to end or by stages, for brands, companies and athletes. One point of contact from strategy to launch."],
    [".svc__name", 0, "Brands"], [".svc__name", 1, "Web <em>&amp;</em> product"], [".svc__name", 2, "Video editing"],
    [".svc__name", 3, "Content"], [".svc__name", 4, "Strength &amp; conditioning"],
    [".svc__desc p", 0, "Complete identities: naming, positioning, visual system and tone of voice. Built to work on web, social and physical space, and to grow without losing consistency. Eventos PDE started this way: from an idea to a brand with its own product."],
    [".svc__desc p", 1, "Custom websites and apps, no templates: architecture, interface, development and launch. Fast, accessible, search-optimised and easy for the client to update."],
    [".svc__desc p", 2, "Editing for social, brands and athletes: pacing, colour, sound and subtitles. Pieces designed to hold attention from the first second."],
    [".svc__desc p", 3, "Content strategy and production sustained over time: idea, script, shooting, editing and publishing. A year of publishing without breaks taught me which formats work and how an audience is built."],
    [".svc__desc p", 4, 'Strength, power and mobility programming tailored to each sport, with weekly follow-up and adjustments based on progress. Coaching clients since 2024, also delivering plans in digital format, like <a class="svc__link" href="https://manu-alz.github.io/Plan-73/" target="_blank" rel="noopener" data-cursor="See example ↗">Plan −73 ↗</a>.'],
    // trayectoria
    ["#trayectoria .label", 0, "(04) — Journey"],
    [".path__title", 0, "From the pool<br>to the <em>mat</em>.<br>From code<br>to brand."],
    [".path__cv", 0, "Full CV ↗"],
    [".step__year--word", 0, "Summers"],
    [".step__tag", 0, "Freelance · today"], [".step__tag", 2, "Freelance · today"],
    [".step__tag", 5, "Own brand"], [".step__tag", 6, "Next · Montevideo"],
    [".step h3", 0, "Programming &amp; web development"], [".step h3", 1, "Bilingual International Baccalaureate"],
    [".step h3", 2, "Strength coach"], [".step h3", 3, "Lifeguard"], [".step h3", 4, "IT Technical Degree"],
    [".step h3", 5, "Eventos PDE and more live projects"], [".step h3", 6, "Communication at UdelaR and competitive judo"],
    [".step p", 0, "Self-taught. First websites for clients and my own projects, working out with each one what their business really needed."],
    [".step p", 1, "Graduated from the IB in November. Native Spanish, C2 English: I work and write in both languages."],
    [".step p", 2, "Custom training plans with progress tracking. Clients came on their own, through referrals and social media."],
    [".step p", 3, "Responsible for pool safety during the season and for daily service to residents and visitors."],
    [".step p", 4, "A formal technical foundation for what I was already doing on my own. Not completed: I took what I needed and kept building."],
    [".step p", 5, "Launched Punta del Este’s events guide in three languages, added apps and sites for judo and built my own products: a CRM and a music player. Alongside, a Business Administration course."],
    [".step p", 6, "Moving to study and train judo more often, aiming to enter the competitive circuit."],
    // gráfica
    // atleta y método
    [".shot__tag b", 0, "ID 073 · Manuel"],
    [".shot__cap", 0, "<span>Fig. 01 — Training</span><span>Maldonado, UY</span>"],
    [".vf__state", 0, "Searching subject<b>…</b>"],
    [".vf__fl", 0, "Scroll to focus"],
    [".expand__title", 0, '<span class="reveal-line"><span>The body is</span></span><span class="reveal-line"><span>my <em>first</em> project.</span></span>'],
    [".expand__label", 0, "(05) — Off screen"],
    [".method__head .label", 0, "Method"],
    [".method__title", 0, "I work the way<br>I <em>train</em>."],
    [".method__intro", 0, "Years of planning training left me with a process: measure before acting, move in short cycles and adjust with data. I apply it the same way to a brand, a website or a video."],
    [".mstep h3", 0, "Diagnosis"], [".mstep h3", 1, "Plan"], [".mstep h3", 2, "Execution"], [".mstep h3", 3, "Follow-up"],
    [".mstep p", 0, "Understand the starting point: goal, audience, competition and what already exists. Without this, everything else is guessing."],
    [".mstep p", 1, "Structure, messaging and visual direction defined before designing. A clear path with stages and dates."],
    [".mstep p", 2, "Design and development in short cycles, with browsable versions from the first week so decisions are made on something real."],
    [".mstep p", 3, "Launch, measurement and adjustments. The client can update on their own, and the project keeps performing afterwards."],
    [".mstep__out", 0, "Deliverable · brief and goals"], [".mstep__out", 1, "Deliverable · sitemap and references"],
    [".mstep__out", 2, "Deliverable · live prototype"], [".mstep__out", 3, "Deliverable · launch and metrics"],
    [".caps .label", 0, "Capabilities"],
    [".caps__list", 0, "<li>Brand identity</li><li>Art direction</li><li>Web design</li><li>Front-end development</li><li>Motion &amp; interaction</li><li>Installable apps (PWA)</li><li>Dashboards &amp; CRM</li><li>Multilingual SEO</li><li>Video editing</li><li>Social content</li><li>Copywriting ES / EN</li><li>Training programming</li>"],
    // contacto
    [".contact__label", 0, '(06) — Contact <span class="avail"><i></i>Available for projects · 2026</span>'],
    [".contact__title", 0, kh("Let’s talk")],
    [".contact__text", 0, "Have a project in mind? A brand, a website or a video: <em>tell me</em> where you’re at and I’ll get back to you shortly."],
    ["#contact-btn .magnet__inner", 0, "Email me"],
    [".copy__state", 0, "Copy ⧉"],
    [".contact__facts", 0, '<li><span>Phone</span><a href="tel:+59894717738" class="link" data-cursor>+598 94 717 738</a></li><li><span>WhatsApp</span><a href="https://wa.me/59894717738" target="_blank" rel="noopener" class="link" data-cursor="WhatsApp ↗">Message on WhatsApp ↗</a></li><li><span>Based in</span>Punta del Este → Montevideo 2027</li><li><span>Languages</span>Spanish (native) · English C2</li><li><span>CV</span><a href="cv.html" target="_blank" class="link" data-cursor="View CV ↗">Web / PDF version ↗</a></li>'],
    [".footer__links a", 3, "Back to top ↑"],
    [".footer__bottom span", 0, "© 2026 Manuel Alzugaray — Handmade in Uruguay"],
    [".footer__bottom > span", 1, 'Local time <span data-clock>--:--</span>'],
  ];
  // atributos (cursor, accesibilidad, metadatos)
  const ATTR = [
    ['meta[name="description"]', "content", "Manuel Alzugaray, independent designer and developer in Punta del Este, Uruguay. Brands, websites, apps and video."],
    ['meta[property="og:description"]', "content", "Brand, web and video design and development, with an athlete’s method."],
    [".nav__logo", "data-cursor", "Home"],
    [".badge", "data-cursor", "Journey ↓"], [".badge", "aria-label", "Working since 2023: see journey"],
    [".hero__scroll", "data-cursor", "See work ↓"],
    [".card__pip", "data-cursor", "See the site ↗"], [".card__pip img", "alt", "Screenshot of eventospde.com"],
    [".reel", "data-cursor", "Watch with sound ▶"], [".reel", "aria-label", "Watch the Eventos PDE reel with sound"],
    [".reel-modal", "aria-label", "Eventos PDE reel"],
    [".path__cv", "data-cursor", "View CV ↗"],
    [".copy", "data-cursor", "Copy"],
    [".path", "aria-label", "Journey"],
    [".work__index", "aria-label", "Projects"],
    [".stack", "aria-label", "Tools I work with"],
    [".shot", "aria-label", "Manuel (blue trousers) with training partners in front of the ring"],
  ];

  // Tarjetas de Trabajo: cada proyecto se identifica por su link (no por su posición),
  // así sumar, sacar o reordenar tarjetas no desfasa las traducciones.
  const CARDS = {
    "eventospde.com": {
      year: "2026 — live",
      p: "Brand and platform to discover what’s on in Punta del Este. I conceived the product, designed the identity and built the site: events, map and trip planner in three languages, with indexable pages generated automatically.",
      results: '<li><b>+70</b><span class="mono">events listed</span></li><li><b>3</b><span class="mono">languages · ES EN PT</span></li><li><b>↗</b><span class="mono">organic traffic growing</span></li>',
      role: "Founder · brand, design and development", challenge: "Bring the whole city’s offer into one place, for visitors in three languages",
      tags: ["Brand", "Product", "Web", "SEO", "3 languages"], cta: "Visit eventospde.com", cursor: "Visit ↗",
      alt: "Screenshot of eventospde.com",
    },
    "/Judokan/": {
      year: "2026 — club",
      p: "Institutional website for a martial arts association founded in 1983. News, gallery, schedules and contact, with a system that lets the club publish on its own, without relying on a developer.",
      role: "Design and development", challenge: "Turn forty years of history into a modern site that’s easy to maintain",
      tags: ["Web", "Identity", "Content"], cta: "View the club’s site", cursor: "Visit ↗",
      alt: "Screenshot of the Judokan Uruguay website",
    },
    "/Judo-Uruguay/": {
      year: "2026 — app",
      p: "Installable app custom-built for a dojo, which adopted it as its progression system: the 100 Kodokan techniques with video, belt progress, attendance tracking, live dojo status and Japanese vocabulary with audio.",
      results: '<li><b>1</b><span class="mono">dojo uses it as its official system</span></li><li><b>100</b><span class="mono">techniques with video</span></li><li><b>PWA</b><span class="mono">installs like an app</span></li>',
      role: "Product, design and development", challenge: "Let a whole group study and track progress from their phones, even on the mat",
      tags: ["Product", "PWA", "Accounts", "Mobile UX"], cta: "Open the app", cursor: "Open app ↗",
      alt: "Screenshot of the Judo Uruguay app",
    },
    "/Nexo/": {
      year: "2026 — product",
      p: "A CRM for small sales teams: contacts, opportunities by stage, tasks with due dates and each client’s activity, with a dashboard that sums up sales, funnel and win rate. It runs entirely in the browser, no server.",
      results: '<li><b>5</b><span class="mono">modules: dashboard, contacts, sales, tasks, activity</span></li><li><b>0</b><span class="mono">servers: data lives in the browser</span></li><li><b>⌘K</b><span class="mono">search and quick actions</span></li>',
      role: "Product, design and development", challenge: "Let a team see on one screen what to sell, who to call and what’s due today",
      tags: ["Product", "Dashboard", "Data", "UX"], cta: "Open the CRM", cursor: "Open the CRM ↗",
      alt: "Nexo CRM dashboard with sales, funnel and tasks",
    },
    "/Pulso/": {
      year: "2026 — product",
      p: "A browser music player built on Audius’ catalogue of independent artists: trends, search, genres, favourites and a play queue. It also plays your own files and installs like an app.",
      results: '<li><b>16</b><span class="mono">genres to explore</span></li><li><b>API</b><span class="mono">real Audius catalogue</span></li><li><b>PWA</b><span class="mono">installs like an app</span></li>',
      role: "Product, design and development", challenge: "A complete streaming experience with a real catalogue and no backend of its own",
      tags: ["Product", "Audio", "API", "PWA"], cta: "Listen on Pulso", cursor: "Listen ↗",
      alt: "Pulso home screen with trends and genres",
    },
  };
  Object.entries(CARDS).forEach(([href, c]) => {
    const s = `.card__link[href*="${href}"]`;
    EN.push(
      [`${s} .card__year`, 0, c.year],
      [`${s} .card__info > p`, 0, c.p],
      [`${s} .card__facts`, 0, `<div><dt>Role</dt><dd>${c.role}</dd></div><div><dt>Challenge</dt><dd>${c.challenge}</dd></div>`],
      [`${s} .tags`, 0, c.tags.map((t) => `<li>${t}</li>`).join("")],
      [`${s} .card__cta`, 0, c.cta],
    );
    if (c.results) EN.push([`${s} .card__results`, 0, c.results]);
    ATTR.push([s, "data-cursor", c.cursor], [`${s} .card__media > img`, "alt", c.alt]);
  });

  function apply() {
    EN.forEach(([sel, i, html, fn]) => {
      const el = document.querySelectorAll(sel)[i];
      if (!el) return;
      if (fn) fn(el);
      else el.innerHTML = html;
    });
    ATTR.forEach(([sel, attr, val]) => document.querySelectorAll(sel).forEach((el) => el.setAttribute(attr, val)));
  }

  // este script va al final del body, justo antes de main.js: el DOM ya existe, se aplica en el acto
  document.querySelectorAll("[data-lang-toggle]").forEach((b) => {
    b.innerHTML = `<span class="${LANG === "es" ? "is-on" : ""}">ES</span><i>/</i><span class="${LANG === "en" ? "is-on" : ""}">EN</span>`;
    b.setAttribute("aria-label", LANG === "en" ? "Cambiar a español" : "Switch to English");
  });
  // solo al generar /en/ (tools/build-en.ps1): las páginas publicadas ya vienen traducidas
  if (BUILD) apply();
})();
