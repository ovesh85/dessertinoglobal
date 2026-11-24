/* =========================================================
   Dessertino – animated home page
   GSAP 3 + ScrollTrigger + Lenis (smooth scroll)
   ========================================================= */
(() => {
  "use strict";
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isMobile = () => innerWidth <= 860;

  /* ---------------- Smooth scroll (Lenis driven by GSAP ticker) ---------------- */
  let lenis = null;
  if (!reduce) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true, syncTouch: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  const scrollTo = (target) => {
    const el = typeof target === "string" ? $(target) : target;
    if (!el) return;
    lenis ? lenis.scrollTo(el, { offset: 0, duration: 1.6 }) : el.scrollIntoView({ behavior: "smooth" });
  };

  /* ---------------- Preloader ---------------- */
  const loaderImgs = $$(".hero img, .kk img, .ic img").filter((i) => !i.complete);
  const total = Math.max(loaderImgs.length, 1);
  let loaded = 0;
  const prog = { v: 0 };
  const loaderCount = $("#loaderCount"), loaderBar = $("#loaderBar");
  gsap.timeline()
    .to(".loader__badge", { scale: 1, duration: 1.1, ease: "elastic.out(1,0.6)" })
    .from(".loader__logo", { scale: 0.6, rotate: -14, duration: 0.9, ease: "back.out(2)" }, 0.1)
    .to(".loader__tag, .loader__bar, .loader__count", { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" }, 0.35)
    .fromTo(".loader__bit", { opacity: 0, scale: 0.5, y: 40 }, { opacity: 1, scale: 1, y: 0, duration: 1.2, stagger: 0.1, ease: "expo.out" }, 0.2);
  gsap.to(".loader__bit", { y: "-=18", rotate: 6, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1.4 });
  const setProg = (to) => gsap.to(prog, {
    v: to, duration: 0.5, ease: "power2.out", overwrite: true,
    onUpdate: () => { loaderCount.textContent = Math.round(prog.v); gsap.set(loaderBar, { scaleX: prog.v / 100 }); },
  });
  const tick = () => { loaded++; setProg((loaded / total) * 100); if (loaded >= total) done(); };
  loaderImgs.forEach((img) => { img.addEventListener("load", tick, { once: true }); img.addEventListener("error", tick, { once: true }); });
  if (!loaderImgs.length) setTimeout(() => { setProg(100); done(); }, 400);
  const failSafe = setTimeout(() => done(), 5000);

  let started = false;
  const t0 = performance.now();
  function done() {
    if (started) return;
    const wait = 2000 - (performance.now() - t0);
    if (wait > 0) { setTimeout(done, wait); return; }
    started = true; clearTimeout(failSafe);
    setProg(100);
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    fontsReady.then(() => {
      const tl = gsap.timeline({ delay: 0.4 });
      tl.to(".loader__badge", { scale: 1.12, duration: 0.35, ease: "power2.out" })
        .to(".loader__tag, .loader__bar, .loader__count, .loader__bit, .loader__rings", { opacity: 0, y: 20, duration: 0.35, ease: "power2.in" }, "<")
        .to(".loader__badge", { scale: 0, rotate: 20, duration: 0.55, ease: "back.in(1.6)" })
        .to("#loaderBurst", { clipPath: "circle(150% at 50% 50%)", duration: 1, ease: "expo.inOut" }, "-=0.25")
        .add(() => { document.body.classList.remove("is-loading"); lenis && lenis.start(); ScrollTrigger.refresh(); })
        .add(heroIntro(), "-=0.35")
        .to("#loader", { opacity: 0, duration: 0.5, ease: "none", onComplete: () => ($("#loader").style.display = "none") }, "<");
    });
  }

  /* ---------------- Hero ---------------- */
  function heroIntro() {
    const tl = gsap.timeline();
    tl.from(".hero__title .w", { yPercent: 115, rotate: 6, duration: 1.2, ease: "expo.out", stagger: 0.07 })
      .to(".hero__title .hl", { "--ul": 1, duration: 0.9, ease: "expo.inOut" }, "-=0.6")
      .from(".hero__eyebrow, .hero__rotator, .hero__ctas > *, .hero__chips > *", { y: 30, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.06 }, 0.15)
      .from(".hero__disc", { scale: 0, duration: 1.3, ease: "elastic.out(1,0.75)" }, 0)
      .from(".hero__ring", { scale: 0.6, opacity: 0, rotate: -90, duration: 1.4, ease: "expo.out" }, 0.1)
      .from(".hero__img--main", { y: 120, scale: 0.6, rotate: -12, opacity: 0, duration: 1.4, ease: "expo.out" }, 0.15)
      .from(".float", { scale: 0.4, opacity: 0, duration: 1.2, ease: "back.out(1.6)", stagger: 0.08 }, 0.4)
      .from(".badge-spin", { scale: 0, rotate: -120, duration: 1.1, ease: "back.out(1.7)" }, 0.6)
      .from(".scroll-cue", { opacity: 0, y: 20, duration: 0.8 }, 0.9);
    return tl;
  }

  // Rotating tagline
  const rots = $$(".hero__rotator .rot");
  let ri = 0;
  setInterval(() => {
    const cur = rots[ri]; ri = (ri + 1) % rots.length; const nxt = rots[ri];
    cur.classList.remove("is-on"); cur.classList.add("is-out");
    nxt.classList.remove("is-out"); nxt.classList.add("is-on");
    setTimeout(() => cur.classList.remove("is-out"), 850);
  }, 2900);

  // Idle float
  if (!reduce) {
    gsap.to(".hero__img--main", { yPercent: -3, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(".hero__ring", { rotate: 360, duration: 60, ease: "none", repeat: -1 });
    gsap.to(".blob--1", { xPercent: 12, yPercent: 8, duration: 9, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(".blob--2", { xPercent: -10, yPercent: -12, duration: 11, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.to(".blob--3", { xPercent: 20, yPercent: 14, duration: 8, ease: "sine.inOut", yoyo: true, repeat: -1 });
  }

  // Mouse parallax on hero visual (desktop)
  if (finePointer && !reduce) {
    const layers = $$(".hero__visual [data-depth], .hero__img--main, .hero__img--side, .hero__disc").map((el) => {
      const d = parseFloat(el.dataset.depth || (el.classList.contains("hero__disc") ? 0.25 : el.classList.contains("hero__img--side") ? 0.8 : 0.45));
      return { d, x: gsap.quickTo(el, "x", { duration: 1.1, ease: "power3.out" }), y: gsap.quickTo(el, "y", { duration: 1.1, ease: "power3.out" }) };
    });
    $(".hero").addEventListener("mousemove", (e) => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      layers.forEach((l) => { l.x(nx * 60 * l.d); l.y(ny * 50 * l.d); });
    });
  }

  /* ---------------- Header / progress ---------------- */
  const header = $("#header");
  const progressBar = $("#progressBar");
  let lastY = 0;
  const onScroll = (y) => {
    header.classList.toggle("is-solid", y > 60);
    const goingDown = y > lastY + 2, goingUp = y < lastY - 2;
    if (goingDown && y > 400 && !$("#mmenu").classList.contains("is-open")) header.classList.add("is-hidden");
    else if (goingUp) header.classList.remove("is-hidden");
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };
  if (lenis) lenis.on("scroll", (l) => onScroll(l.scroll)); else addEventListener("scroll", () => onScroll(scrollY), { passive: true });

  // Burger
  const burger = $("#burger"), mmenu = $("#mmenu");
  burger.addEventListener("click", () => {
    const open = !mmenu.classList.contains("is-open");
    mmenu.classList.toggle("is-open", open); burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    header.classList.remove("is-hidden");
    if (lenis) open ? lenis.stop() : lenis.start();
    if (open) gsap.fromTo(".mmenu li, .mmenu__cta", { y: 50, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.8, ease: "expo.out", delay: 0.25 });
  });
  $$(".mmenu a").forEach((a) => a.addEventListener("click", () => { mmenu.classList.remove("is-open"); burger.classList.remove("is-open"); lenis && lenis.start(); }));

  // In-page anchors
  $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href"); if (id.length < 2) { e.preventDefault(); return; }
    const t = $(id); if (!t) return; e.preventDefault(); scrollTo(t);
  }));

  /* ---------------- Marquees (velocity reactive) ---------------- */
  const marquees = $$(".mq__track").map((t) => {
    t.innerHTML += t.innerHTML + t.innerHTML;
    return { el: t, dir: +t.dataset.dir, x: 0, w: 0, setX: gsap.quickSetter(t, "x", "px") };
  });
  const measureMq = () => marquees.forEach((m) => (m.w = m.el.scrollWidth / 3));
  measureMq();
  let vel = 0;
  gsap.ticker.add((_, dt) => {
    const v = lenis ? lenis.velocity : 0;
    vel += (v - vel) * 0.08;
    const f = Math.min(dt / 16.67, 3);
    marquees.forEach((m) => {
      if (!m.w) return;
      m.x += (1.1 + Math.abs(vel) * 0.35) * m.dir * f * (vel < -0.5 ? -1 : 1);
      m.x = gsap.utils.wrap(-m.w, 0, m.x);
      m.setX(m.x);
    });
  });

  if (reduce) {
    $$(".reveal-up, .reveal-tile").forEach((e) => (e.style.cssText = "opacity:1;transform:none"));
  }

  /* ---------------- Hero scroll-out ---------------- */
  if (!reduce) {
    const htl = gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    htl.to(".hero__copy", { y: -140, opacity: 0.15, ease: "none" }, 0)
      .to(".hero__visual", { y: 160, scale: 0.86, rotate: -6, ease: "none" }, 0)
      .to(".hero__word", { xPercent: -22, ease: "none" }, 0)
      .to(".hero__bg .blob", { y: (i) => 120 + i * 60, ease: "none" }, 0);
  }

  /* ---------------- SIGNATURE 1: KIT KAT making-process film (canvas image sequence, scroll scrubbed) ---------------- */
  (() => {
    const canvas = $("#kkCanvas"); if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const N = 186, frames = new Array(N);
    const src = (i) => `assets/frames/kk/f${String(i + 1).padStart(3, "0")}.webp`;
    let cur = -1, want = 0, dpr = 1;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr); canvas.height = Math.round(canvas.clientHeight * dpr);
      cur = -1; draw(want);
    };
    const nearestLoaded = (i) => { for (let d = 0; d < N; d++) { if (frames[i - d] && frames[i - d].complete && frames[i - d].naturalWidth) return i - d; if (frames[i + d] && frames[i + d].complete && frames[i + d].naturalWidth) return i + d; } return -1; };
    function draw(i) {
      want = i;
      const k = nearestLoaded(i); if (k < 0 || k === cur) return;
      const img = frames[k], cw = canvas.width, ch = canvas.height;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      // keep the cup in view on tall screens (cup sits at ~50% x)
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      cur = k;
    }
    // load: first frame now, the rest progressively (every 8th first, then fill in)
    const load = (i) => { if (frames[i]) return; const im = new Image(); im.decoding = "async"; im.src = src(i); im.onload = () => { if (Math.abs(i - want) < 6 || cur < 0) draw(want); }; frames[i] = im; };
    load(0);
    const order = [];
    for (let step of [8, 4, 2, 1]) for (let i = 0; i < N; i += step) if (!order.includes(i)) order.push(i);
    let oi = 0; const pump = () => { for (let n = 0; n < 6 && oi < order.length; n++, oi++) load(order[oi]); if (oi < order.length) setTimeout(pump, 30); };
    addEventListener("load", () => setTimeout(pump, 300));
    addEventListener("resize", size); size();

    if (reduce) { gsap.set(".kk__info > *, .pcard", { opacity: 1 }); gsap.set("#kkIntro", { opacity: 0 }); want = N - 1; pump(); return; }

    const state = { f: 0 };
    const chaps = $$(".kk__chap"), steps = $$(".kk__steps li");
    const FILM = 7; // timeline seconds spent scrubbing the film
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ".kk__pin", start: "top top", end: () => "+=" + innerHeight * (isMobile() ? 4 : 4.6),
        pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (s) => {
          gsap.set("#kkMeter", { scaleX: s.progress });
          const t = tl.time(), idx = t < 0.6 ? -1 : t < 3.0 ? 0 : t < 5.1 ? 1 : 2;
          steps.forEach((li, i) => li.classList.toggle("is-on", i === idx));
        },
      },
    });
    tl.to(state, { f: N - 1, duration: FILM, ease: "none", onUpdate: () => draw(Math.round(state.f)) }, 0)
      .to("#kkIntro", { opacity: 0, y: -60, duration: 0.6, ease: "power2.in" }, 0.05)
      .to("#kkShade", { opacity: 0.35, duration: 0.6 }, 0.1)
      .to(".kk__steps", { opacity: 1, duration: 0.4 }, 0.5);
    const chapAt = [0.7, 3.1, 5.2];
    chaps.forEach((c, i) => {
      tl.fromTo(c, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, chapAt[i]);
      if (i < chaps.length - 1) tl.to(c, { opacity: 0, y: -30, duration: 0.35, ease: "power2.in" }, chapAt[i + 1] - 0.4);
    });
    tl.to(chaps[2], { opacity: 0, y: -30, duration: 0.35 }, FILM + 0.05)
      .to(".kk__steps", { opacity: 0, duration: 0.4 }, FILM + 0.05)
      .to("#kkShade", { opacity: 1, duration: 0.8 }, FILM + 0.1)
      .to("#kkCanvas", { xPercent: () => (isMobile() ? 0 : 16), duration: 1.2, ease: "power2.inOut" }, FILM + 0.1)
      .fromTo(".kk__info > *", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.15, ease: "power2.out" }, FILM + 0.3)
      .fromTo(".pcard--1", { yPercent: 140, rotate: 14, opacity: 0 }, { yPercent: 0, rotate: -5, opacity: 1, duration: 1.2, ease: "power3.out" }, FILM + 0.8)
      .fromTo(".pcard--2", { yPercent: 160, rotate: -10, opacity: 0 }, { yPercent: -8, rotate: 5, opacity: 1, duration: 1.2, ease: "power3.out" }, FILM + 1.0)
      .to({}, { duration: 0.8 });
    gsap.from("#kkIntro > *", { y: 50, opacity: 0, duration: 1.1, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: ".kk", start: "top 70%" } });
  })();

  /* ---------------- SIGNATURE 2: ICE CREAM (pinned horizontal) ---------------- */
  const icSection = $(".ic"), icTrack = $("#icTrack"), icBar = $("#icBar");
  const slides = $$(".ic__slide");
  const stops = [{ el: $(".ic__intro"), bg: "#4C121B", ac: "#FF7AAE", fg: "#FFFFFF" }]
    .concat(slides.map((s) => ({ el: s, bg: s.dataset.bg, ac: s.dataset.accent, fg: s.dataset.fg || "#FFFFFF" })))
    .concat([{ el: $(".ic__outro"), bg: "#DC2281", ac: "#FFC21A", fg: "#FFFFFF" }]);
  let stopFracs = [];
  const icDist = () => icTrack.scrollWidth - innerWidth;
  const measureStops = () => {
    const d = icDist();
    stopFracs = stops.map((s) => gsap.utils.clamp(0, 1, (s.el.offsetLeft + s.el.offsetWidth / 2 - innerWidth / 2) / d));
    stopFracs[0] = 0; stopFracs[stopFracs.length - 1] = 1;
  };
  const paintIc = (p) => {
    let i = 0;
    while (i < stopFracs.length - 2 && p > stopFracs[i + 1]) i++;
    const a = stopFracs[i], b = stopFracs[i + 1];
    let t = b > a ? (p - a) / (b - a) : 0;
    t = gsap.utils.clamp(0, 1, (t - 0.3) / 0.4);
    t = t * t * (3 - 2 * t);
    const bg = gsap.utils.interpolate(stops[i].bg, stops[i + 1].bg, t);
    const ac = gsap.utils.interpolate(stops[i].ac, stops[i + 1].ac, t);
    icSection.style.backgroundColor = bg;
    icSection.style.setProperty("--accent", ac);
    icSection.style.color = gsap.utils.interpolate(stops[i].fg, stops[i + 1].fg, t);
  };

  measureStops();
  if (!reduce) {
    const icTween = gsap.to(icTrack, {
      x: () => -icDist(), ease: "none",
      scrollTrigger: {
        trigger: "#icPin", start: "top top", end: () => "+=" + icDist() * (isMobile() ? 1.6 : 1), pin: true, scrub: true,
        anticipatePin: 1, invalidateOnRefresh: true,
        onRefresh: measureStops,
        onUpdate: (s) => { icBar.style.transform = `scaleX(${s.progress})`; paintIc(s.progress); },
        snap: matchMedia("(pointer: coarse)").matches ? {
          snapTo: (v, self) => { const d = self.direction; const c = stopFracs.filter((f) => (d > 0 ? f >= v - 0.02 : f <= v + 0.02)); return c.length ? (d > 0 ? Math.min(...c) : Math.max(...c)) : gsap.utils.snap(stopFracs, v); },
          duration: { min: 0.35, max: 0.8 }, delay: 0.04, ease: "power2.inOut",
        } : false,
      },
    });
    /* one wheel gesture = one flavour (desktop); swipe snaps on touch */
    if (lenis) {
      let busy = false, lastWheel = 0;
      const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      addEventListener("wheel", (e) => {
        const st = icTween.scrollTrigger; if (!st) return;
        const y = lenis.scroll, dir = Math.sign(e.deltaY);
        if (!dir || y < st.start - 4 || y > st.end + 4) return;
        const ys = stopFracs.map((f) => st.start + f * (st.end - st.start));
        let next = -1;
        if (dir > 0) next = ys.findIndex((v) => v > y + 6);
        else for (let i = ys.length - 1; i >= 0; i--) if (ys[i] < y - 6) { next = i; break; }
        if (next === -1) return;               // at the first/last flavour: let the page continue
        e.preventDefault(); e.stopImmediatePropagation();
        lastWheel = performance.now();
        if (busy) return;
        busy = true;
        lenis.scrollTo(ys[next], { duration: 1.15, easing: ease, lock: true, force: true, onComplete: () => {
          const release = () => (performance.now() - lastWheel > 240 ? (busy = false) : setTimeout(release, 60));
          release();
        } });
      }, { passive: false, capture: true });
    }

    slides.forEach((s) => {
      const img = $(".ic__img img", s), name = $(".ic__name", s), box = $(".ic__img", s), txt = $(".ic__txt", s);
      gsap.fromTo(name, { xPercent: 30 }, { xPercent: -30, ease: "none", scrollTrigger: { trigger: s, containerAnimation: icTween, start: "left right", end: "right left", scrub: true } });
      gsap.fromTo(img, { xPercent: -10 }, { xPercent: 10, ease: "none", scrollTrigger: { trigger: s, containerAnimation: icTween, start: "left right", end: "right left", scrub: true } });
      gsap.timeline({ scrollTrigger: { trigger: s, containerAnimation: icTween, start: "left right", end: "right left", scrub: true } })
        .fromTo(box, { scale: 0.7, rotate: 8, y: 40 }, { scale: 1, rotate: 0, y: 0, ease: "power2.out", duration: 1 })
        .to(box, { scale: 0.75, rotate: -8, y: 30, ease: "power2.in", duration: 1 });
      gsap.fromTo(txt, { y: 60, opacity: 0 }, { y: 0, opacity: 1, ease: "power2.out", scrollTrigger: { trigger: s, containerAnimation: icTween, start: "left 60%", end: "left 15%", scrub: true } });
    });
    gsap.fromTo(".ic__outro > *", { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, ease: "power2.out", scrollTrigger: { trigger: ".ic__outro", containerAnimation: icTween, start: "left 85%", end: "left 35%", scrub: true } });
    ScrollTrigger.create({ trigger: "#icPin", start: "top 70%", once: true, onEnter: () => countUp($(".ic__count b")) });
    gsap.from(".ic__intro > *", { y: 60, opacity: 0, stagger: 0.08, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".ic", start: "top 65%" } });
  }

  /* ---------------- Count-up ---------------- */
  function countUp(el) {
    if (!el || el.dataset.done) return; el.dataset.done = 1;
    const o = { v: 0 }, n = +el.dataset.count;
    gsap.to(o, { v: n, duration: 1.8, ease: "power3.out", onUpdate: () => (el.textContent = Math.round(o.v)) });
  }
  $$("[data-count]").forEach((el) => {
    if (el.closest(".ic")) { if (reduce) el.textContent = el.dataset.count; return; }
    if (reduce) { el.textContent = el.dataset.count; return; }
    ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => countUp(el) });
  });

  /* ---------------- Reveals ---------------- */
  if (!reduce) {
    ScrollTrigger.batch(".reveal-up", { start: "top 90%", once: true,
      onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.09, overwrite: true }) });
    ScrollTrigger.batch(".reveal-tile", { start: "top 92%", once: true,
      onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "expo.out", stagger: 0.07, overwrite: true,
        onComplete: () => b.forEach((el) => { el.classList.add("is-in"); el.style.transform = ""; el.style.opacity = ""; }) }) });

    const wr = $$("#whyRot span");
    gsap.set(wr, { yPercent: 130, visibility: "visible" });
    const wtl = gsap.timeline({ repeat: -1 });
    wr.forEach((s) => wtl.fromTo(s, { yPercent: 130 }, { yPercent: 0, duration: 0.7, ease: "expo.out", immediateRender: false }).to(s, { yPercent: -130, duration: 0.6, ease: "expo.in" }, "+=1.3"));

    gsap.from(".rbub", { scale: 0, rotate: -40, duration: 1.2, ease: "back.out(1.5)", stagger: { each: 0.08, from: "random" }, clearProps: "transform",
      scrollTrigger: { trigger: ".range__grid", start: "top 82%" } });

    gsap.timeline({ scrollTrigger: { trigger: ".uniq", start: "top 85%", end: "center center", scrub: true } })
      .to("#uniqImg", { clipPath: "inset(0% 0% 0% 0% round 240px 240px 28px 28px)", ease: "none" }, 0)
      .fromTo("#uniqImg img", { yPercent: -12 }, { yPercent: 0, ease: "none" }, 0);
    gsap.fromTo(".uniq__sticker", { rotate: -40, scale: 0.6 }, { rotate: -12, scale: 1, ease: "none", scrollTrigger: { trigger: ".uniq", start: "top 70%", end: "center center", scrub: true } });

    const cards = $$(".scard");
    cards.forEach((c, i) => {
      if (i === cards.length - 1) return;
      gsap.to(c, { scale: 0.9, yPercent: -4, ease: "none",
        scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: () => "top " + (parseInt(getComputedStyle(cards[i + 1]).top) || 100), scrub: true } });
    });
    gsap.utils.toArray(".scard__img img").forEach((img) =>
      gsap.fromTo(img, { scale: 1.25 }, { scale: 1, ease: "none", scrollTrigger: { trigger: img.closest(".scard"), start: "top bottom", end: "top 20%", scrub: true } }));

    gsap.timeline({ scrollTrigger: { trigger: ".film", start: "top bottom", end: "center center", scrub: true } })
      .fromTo("#filmFrame", { scale: 0.82 }, { scale: 1, ease: "none" }, 0)
      .fromTo("#filmFrame img", { scale: 1.3 }, { scale: 1, ease: "none" }, 0);

    gsap.from(".order__copy > *", { y: 50, opacity: 0, duration: 1.1, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: ".order", start: "top 75%" } });
    gsap.from(".order__store", { y: 80, rotate: 4, opacity: 0, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: ".order", start: "top 70%" } });

    gsap.from(".fr__copy > *", { y: 60, opacity: 0, duration: 1.1, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: ".fr", start: "top 72%" } });
    gsap.from(".fr__perks li", { x: -30, opacity: 0, duration: 0.9, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: ".fr__perks", start: "top 88%" } });
    gsap.from(".orb__core", { scale: 0, duration: 1.4, ease: "elastic.out(1,0.6)", scrollTrigger: { trigger: "#frOrbit", start: "top 80%" } });
    gsap.from(".orb__ring", { scale: 0.4, opacity: 0, duration: 1.4, stagger: 0.12, ease: "expo.out", scrollTrigger: { trigger: "#frOrbit", start: "top 80%" } });
    gsap.from(".orb__item", { scale: 0, opacity: 0, duration: 1.1, stagger: 0.08, ease: "back.out(1.8)", delay: 0.3, scrollTrigger: { trigger: "#frOrbit", start: "top 80%" } });
    gsap.fromTo("#frTrack", { xPercent: 0 }, { xPercent: -35, ease: "none", scrollTrigger: { trigger: ".fr", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.fromTo(".fr__inner", { scale: 0.92 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".fr", start: "top bottom", end: "top 30%", scrub: true } });

    gsap.fromTo(".footer__word span", { yPercent: 100 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".footer__word", start: "top bottom", end: "bottom bottom", scrub: true } });
  }

  /* ---------------- Favourites rail: auto-scroll + drag w/ inertia ---------------- */
  const rail = $("#favRail"), track = $("#favTrack");
  track.innerHTML += track.innerHTML;
  const favSet = gsap.quickSetter(track, "x", "px");
  let fx = 0, fW = 0, fVel = 0, dragging = false, lastPx = 0, inView = false;
  const measureFav = () => (fW = track.scrollWidth / 2);
  measureFav();
  ScrollTrigger.create({ trigger: rail, start: "top bottom", end: "bottom top", onToggle: (s) => (inView = s.isActive) });
  gsap.ticker.add((_, dt) => {
    if (!inView || !fW) return;
    const f = Math.min(dt / 16.67, 3);
    if (!dragging) { fVel *= 0.94; fx += (-0.6 + fVel) * f; }
    fx = gsap.utils.wrap(-fW, 0, fx);
    favSet(fx);
  });
  rail.addEventListener("pointerdown", (e) => { dragging = true; lastPx = e.clientX; rail.classList.add("is-drag"); rail.setPointerCapture(e.pointerId); });
  rail.addEventListener("pointermove", (e) => { if (!dragging) return; const dx = e.clientX - lastPx; fx += dx; fVel = dx * 0.6; lastPx = e.clientX; });
  const endDrag = () => { dragging = false; rail.classList.remove("is-drag"); };
  rail.addEventListener("pointerup", endDrag); rail.addEventListener("pointercancel", endDrag);

  /* ---------------- Film: local video, ambient background (works offline / file://) ---------------- */
  const filmMedia = $("#filmMedia"), filmVideo = $("#filmVideo");
  filmVideo.addEventListener("playing", () => { filmVideo.classList.add("is-on"); filmMedia.classList.add("is-playing"); });
  ScrollTrigger.create({
    trigger: ".film", start: "top bottom", end: "bottom top",
    onToggle: (s) => { if (s.isActive) { if (filmVideo.preload !== "auto") { filmVideo.preload = "auto"; filmVideo.load(); } filmVideo.play().catch(() => {}); } else filmVideo.pause(); },
  });

  /* ---------------- Video modal ---------------- */
  const vmodal = $("#vmodal"), vbox = $("#vbox");
  const openVideo = () => {
    filmVideo.pause();
    vbox.innerHTML = '<video controls autoplay playsinline><source src="assets/video/dessertino-film.mp4" type="video/mp4"><source src="assets/video/dessertino-film.webm" type="video/webm"></video>';
    vmodal.classList.add("is-open"); vmodal.setAttribute("aria-hidden", "false"); lenis && lenis.stop();
  };
  const closeVideo = () => { vmodal.classList.remove("is-open"); vmodal.setAttribute("aria-hidden", "true"); setTimeout(() => (vbox.innerHTML = ""), 400); lenis && lenis.start(); filmVideo.play().catch(() => {}); };
  $("#filmFrame").addEventListener("click", openVideo);
  $("#vclose").addEventListener("click", closeVideo);
  vmodal.addEventListener("click", (e) => { if (e.target === vmodal) closeVideo(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeVideo(); });

  /* ---------------- Tabs ---------------- */
  const tabs = $$(".tab"), pill = $(".tabs__pill");
  const placePill = (t) => { pill.style.width = t.offsetWidth + "px"; pill.style.transform = `translateX(${t.offsetLeft - 6}px)`; };
  tabs.forEach((t) => t.addEventListener("click", () => {
    tabs.forEach((x) => { x.classList.toggle("is-on", x === t); x.setAttribute("aria-selected", x === t); });
    $$(".plats").forEach((p) => p.classList.toggle("is-on", p.dataset.panel === t.dataset.tab));
    gsap.fromTo(".plats.is-on .plat", { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.7, ease: "expo.out" });
    placePill(t);
  }));

  /* ---------------- Cursor + magnetic ---------------- */
  if (finePointer && !reduce) {
    const cur = $("#cursor"), label = $("#cursorLabel");
    const cx = gsap.quickTo(cur, "x", { duration: 0.35, ease: "power3.out" }), cy = gsap.quickTo(cur, "y", { duration: 0.35, ease: "power3.out" });
    addEventListener("mousemove", (e) => { cx(e.clientX); cy(e.clientY); });
    $$("[data-cursor]").forEach((el) => {
      el.addEventListener("mouseenter", () => { label.textContent = el.dataset.cursor; cur.classList.add("is-big"); });
      el.addEventListener("mouseleave", () => cur.classList.remove("is-big"));
    });
    $$("a, button").forEach((el) => {
      if (el.closest("[data-cursor]")) return;
      el.addEventListener("mouseenter", () => gsap.to(cur, { scale: 2.4, opacity: 0.35, duration: 0.3 }));
      el.addEventListener("mouseleave", () => gsap.to(cur, { scale: 1, opacity: 1, duration: 0.3 }));
    });
    $$("[data-magnetic]").forEach((el) => {
      const mx = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1,0.4)" }), my = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1,0.4)" });
      el.addEventListener("mousemove", (e) => { const r = el.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * 0.3); my((e.clientY - r.top - r.height / 2) * 0.4); });
      el.addEventListener("mouseleave", () => { mx(0); my(0); });
    });

  }

  /* ---------------- Refresh hooks ---------------- */
  const refreshAll = () => { measureMq(); measureFav(); placePill($(".tab.is-on")); };
  addEventListener("load", () => { refreshAll(); ScrollTrigger.refresh(); });
  document.fonts && document.fonts.ready.then(() => { refreshAll(); ScrollTrigger.refresh(); });
  ScrollTrigger.addEventListener("refresh", refreshAll);
  placePill($(".tab.is-on"));
})();
