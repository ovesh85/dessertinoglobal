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
    gsap.set(".kk__info > *, .pcard", { opacity: 1 });
    gsap.set(".kk__frame", { clipPath: "inset(0% 0% 0% 0% round 0px)" });
    gsap.set(".kk__shade", { opacity: 1 });
    gsap.set(".kk__title, .kk__notes, .kk__badge, .kk__hint, .kk__bits", { opacity: 0 });
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

  /* ---------------- SIGNATURE 1: KIT KAT (pinned, scrubbed) ---------------- */
  if (!reduce) {
    const near = () => isMobile()
      ? [{ x: -34, y: -24, r: -30 }, { x: 33, y: -12, r: 25 }, { x: -36, y: 18, r: 50 }, { x: 30, y: 26, r: -20 }]
      : [{ x: -17, y: -24, r: -30 }, { x: 15, y: -30, r: 25 }, { x: -18, y: 20, r: 50 }, { x: 17, y: 16, r: -20 }];
    const startClip = () => isMobile() ? "inset(16% 20% 14% 20% round 999px 999px 32px 32px)" : "inset(9% 38.5% 8% 38.5% round 999px 999px 40px 40px)";
    const bits = $$(".bit");
    const placeBits = () => bits.forEach((b, i) => gsap.set(b, { x: near()[i].x * innerWidth / 100, y: near()[i].y * innerHeight / 100, rotate: near()[i].r, scale: 1, opacity: 1 }));
    placeBits();

    // intro when section scrolls into view (default state comes alive)
    const kkIn = gsap.timeline({ paused: true });
    kkIn.from(".kk__title", { opacity: 0, y: 80, duration: 1.3, ease: "expo.out", clearProps: "transform,opacity" }, 0)
      .from(".kk__notes", { opacity: 0, duration: 0.8, ease: "power2.out" }, 0.45)
      .from(".note__line", { scaleX: 0, duration: 0.9, stagger: 0.12, ease: "expo.out" }, 0.5)
      .from(".kk__badge", { scale: 0, rotate: -90, duration: 1, ease: "back.out(1.6)" }, 0.5)
      .from(".kk__bits", { opacity: 0, scale: 0.7, duration: 1.4, ease: "expo.out" }, 0.25);
    ScrollTrigger.create({ trigger: ".kk", start: "top 70%", once: true, onEnter: () => kkIn.play() });

    gsap.set(".kk__frame", { clipPath: startClip() });
    const kk = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ".kk__pin", start: "top top", end: () => "+=" + innerHeight * (isMobile() ? 3.2 : 3.6),
        pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
        onUpdate: (s) => gsap.set("#kkMeter", { scaleX: s.progress }),
      },
    });
    kk.to(".kk__kicker, .kk__hint, .kk__badge", { opacity: 0, y: -20, duration: 1 }, 0)
      .to(".note", { opacity: 0, x: (i) => (i === 1 ? -60 : 60), duration: 1, stagger: 0.1 }, 0)
      .to(".kk__row--1", { xPercent: -70, opacity: 0, duration: 4, ease: "power1.in" }, 0)
      .to(".kk__row--2", { xPercent: 70, opacity: 0, duration: 4, ease: "power1.in" }, 0)
      .fromTo(".kk__frame", { clipPath: startClip }, { clipPath: "inset(0% 0% 0% 0% round 0px 0px 0px 0px)", duration: 4, ease: "power2.inOut" }, 0)
      .fromTo(".kk__frame img", { scale: 1.08 }, { scale: 1.0, duration: 4.5, ease: "power2.out" }, 0)
      .to(".kk__glow", { scale: 1.6, opacity: 0, duration: 4 }, 0);
    bits.forEach((b, i) => {
      kk.to(b, { x: () => near()[i].x * innerWidth / 100 * 2.6, y: () => near()[i].y * innerHeight / 100 * 2.6, rotate: () => near()[i].r * 3, scale: 1.4, opacity: 0, duration: 3.4, ease: "power1.in" }, 0.2 + i * 0.1);
    });
    kk.to(".kk__shade", { opacity: 1, duration: 1.6 }, 4.2)
      .to(".kk__frame img", { xPercent: () => (isMobile() ? 0 : 8), duration: 2, ease: "power1.inOut" }, 4.2)
      .fromTo(".kk__info > *", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.25, ease: "power2.out" }, 4.8)
      .fromTo(".pcard--1", { yPercent: 140, rotate: 14, opacity: 0 }, { yPercent: 0, rotate: -5, opacity: 1, duration: 1.8, ease: "power3.out" }, 6.6)
      .fromTo(".pcard--2", { yPercent: 160, rotate: -10, opacity: 0 }, { yPercent: -8, rotate: 5, opacity: 1, duration: 1.8, ease: "power3.out" }, 7)
      .to({}, { duration: 1.4 });
    addEventListener("resize", () => { if (kk.scrollTrigger.progress === 0) placeBits(); });
  }

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
      },
    });
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

  /* ---------------- SIGNATURE 3: BUILD YOUR CUP (scooper fills the cup on scroll) ---------------- */
  (() => {
    const stage = $("#bcStage"); if (!stage) return;
    const cupB = $(".bc__cupback", stage), cupF = $(".bc__cupfront", stage), tool = $("#bcTool");
    const balls = $$(".bc__ball", stage), tags = $$(".bc__tag", stage), dots = $$(".bc__splash i", stage);
    const words = $$(".bc__word"), steps = $$(".bc__step"), bg = $("#bcBg");
    const cols = ["#F07AA6", "#6B3B22", "#E8B96A"];
    const bgs = [["#FFF0F6", "#FFD9E8"], ["#FFE6EF", "#F7B3CB"], ["#F8EAE0", "#D9AE93"], ["#FFF6E6", "#F2D49C"], ["#FF7DBE", "#DC2281"]];
    const bgp = { c1: bgs[0][0], c2: bgs[0][1] };
    const paintBg = () => (bg.style.background = `radial-gradient(70% 70% at 50% 60%,#FFFFFF 0%,${bgp.c1} 45%,${bgp.c2} 100%)`);
    paintBg();
    // geometry (px, measured from the stage bottom)
    const G = { W: 0, D: [], B: [], lift: 0, T: 0 };
    const place = () => {
      const W = stage.offsetWidth, cupH = W * (1094 / 1060);
      const rimLine = cupH * (1 - 0.205);
      G.W = W; G.D = [W * 0.8, W * 0.74, W * 0.69];
      G.B = [];
      G.B[0] = rimLine - G.D[0] * 0.44;
      G.B[1] = G.B[0] + G.D[0] * 0.6;
      G.B[2] = G.B[1] + G.D[1] * 0.6;
      balls.forEach((b, i) => { b.style.width = G.D[i] + "px"; b.style.marginLeft = -G.D[i] / 2 + "px"; b.style.bottom = G.B[i] + "px"; });
      tags.forEach((t, i) => (t.style.bottom = (G.B[i] + G.D[i] * 0.42) + "px"));
      G.lift = W * 0.42;
      G.T = G.D[0] * 0.8 / 0.21;              // scooper width so its bowl cradles the scoop
      tool.style.width = G.T + "px";
      tool.style.left = (W / 2 - G.T * 0.115) + "px";
      gsap.set(tool, { transformOrigin: "11.5% 40%" });   // bowl centre over the cup
    };
    place();
    if (reduce) { gsap.set(tags, { opacity: 1 }); return; }

    const toolH = () => G.T * (257 / 900);
    const toolBottom = (i) => G.B[i] + G.lift - toolH() * 0.1; // ball sits in the bowl
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: "#bcPin", start: "top top", end: () => "+=" + innerHeight * (isMobile() ? 4 : 4.6),
        pin: true, scrub: true, anticipatePin: 1, invalidateOnRefresh: true,
        onRefreshInit: place,
        onUpdate: () => {
          const t = tl.time(), idx = t < 3.0 ? 0 : t < 5.6 ? 1 : t < 8.2 ? 2 : 3;
          steps.forEach((s, i) => { s.classList.toggle("is-on", i === idx && t > 0.3); s.classList.toggle("is-done", i < idx); });
        },
      },
    });
    const offX = () => innerWidth * 0.75;
    const drop = (i, at) => {
      const b = balls[i], below = [cupB, cupF, ...balls.slice(0, i)];
      tl.set(tool, { bottom: () => toolBottom(i) + "px" }, at)
        .set(b, { zIndex: 8 }, at)
        .set(b, { zIndex: i + 2 }, at + 1.5)
        // 1. scooper carries the scoop in from the right
        .fromTo(tool, { x: offX, y: () => -innerHeight * 0.12, rotate: 14, opacity: 1 },
          { x: 0, y: 0, rotate: 0, duration: 0.9, ease: "power3.out" }, at)
        .fromTo(b, { x: offX, y: () => -innerHeight * 0.12 - G.lift, rotate: 14, scaleX: 1, scaleY: 1 },
          { x: 0, y: () => -G.lift, rotate: 0, duration: 0.9, ease: "power3.out" }, at)
        // small hover settle
        .to([tool, b], { y: "-=8", duration: 0.25, ease: "sine.inOut" }, at + 0.9)
        // 2. scooper tilts and releases
        .to(tool, { rotate: -62, duration: 0.45, ease: "power2.inOut" }, at + 1.15)
        .to(b, { rotate: -18, x: () => -G.W * 0.04, duration: 0.25, ease: "power1.in" }, at + 1.25)
        .to(b, { y: 0, x: 0, rotate: 0, duration: 0.45, ease: "power2.in" }, at + 1.45)
        // 3. scooper leaves
        .to(tool, { x: () => offX() * 1.4, y: () => -innerHeight * 0.45, rotate: 10, duration: 0.8, ease: "power2.in" }, at + 1.6)
        .to(tool, { opacity: 0, duration: 0.15 }, at + 2.3)
        // 4. landing squash + cup bump
        .to(b, { scaleY: 0.84, scaleX: 1.1, duration: 0.14, ease: "power1.out" }, at + 1.9)
        .to(b, { scaleY: 1, scaleX: 1, duration: 0.6, ease: "elastic.out(1,0.35)" }, at + 2.04)
        .to(below, { y: 8, duration: 0.12, ease: "power1.out" }, at + 1.9)
        .to(below, { y: 0, duration: 0.55, ease: "elastic.out(1,0.4)" }, at + 2.02)
        .to(bgp, { c1: bgs[i + 1][0], c2: bgs[i + 1][1], duration: 1.4, ease: "power1.inOut", onUpdate: paintBg }, at + 0.4)
        .to(words[i], { yPercent: -18, opacity: 0, duration: 0.8, ease: "power2.in" }, at + 0.2)
        .fromTo(words[i + 1], { yPercent: 18, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: "power2.out" }, at + 0.9)
        .fromTo(tags[i], { opacity: 0, x: 20, scale: 0.8 }, { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: "back.out(2)" }, at + 2.1)
        .set(dots, { bottom: () => G.B[i] + G.D[i] * 0.15 + "px", backgroundColor: cols[i] }, at + 1.88);
      dots.forEach((d, k) => {
        const ang = (Math.PI * (k + 0.5)) / dots.length, r = 60 + (k % 3) * 30;
        tl.fromTo(d, { x: 0, y: 0, scale: 0.4, opacity: 0 },
          { x: Math.cos(ang) * -r * 1.5, y: -Math.sin(ang) * r, scale: 1, opacity: 1, duration: 0.3, ease: "power2.out", immediateRender: false }, at + 1.9)
          .to(d, { y: "+=40", opacity: 0, scale: 0.3, duration: 0.45, ease: "power1.in" }, at + 2.2);
      });
    };
    gsap.set(balls, { x: () => innerWidth * 0.75 });
    tl.from(".bc__cupback, .bc__cupfront, .bc__shadow", { y: 40, duration: 0.5, ease: "power2.out" }, 0);
    drop(0, 0.4); drop(1, 3.0); drop(2, 5.6);
    tl.to(tags, { opacity: 0, scale: 0.8, duration: 0.5, stagger: 0.05 }, 8.3)
      .fromTo(".tp", { opacity: 0, scale: 0.2, y: 120, rotate: -30 }, { opacity: 1, scale: 1, y: 0, rotate: 0, duration: 1, stagger: 0.12, ease: "back.out(1.6)" }, 8.4)
      .to(bgp, { c1: bgs[4][0], c2: bgs[4][1], duration: 1.2, onUpdate: paintBg }, 8.5)
      .to(words[3], { yPercent: -18, opacity: 0, duration: 0.6 }, 8.5)
      .fromTo(words[4], { yPercent: 18, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: "power2.out" }, 8.9)
      .set(words[4], { webkitTextStroke: "2px rgba(255,255,255,.35)" }, 8.9)
      .to(".bc__head", { opacity: () => (isMobile() ? 0 : 1), color: "#fff", duration: 0.8 }, 8.7)
      .to(".bc__head .eyebrow, .bc__head h2 em", { color: "#FFE07A", duration: 0.8 }, 8.7)
      .to(".bc__steps", { opacity: 0, x: 30, duration: 0.6 }, 9.1)
      .to(".bc__stage", { scale: 1.05, rotate: -2, duration: 1.2, ease: "power2.out" }, 9.1)
      .fromTo(".bc__done", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" }, 9.5)
      .to({}, { duration: 1 });
    addEventListener("load", () => { place(); ScrollTrigger.refresh(); });
  })();

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
