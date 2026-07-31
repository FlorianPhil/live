/* Go Boom V2 cinematic layer — particles, spotlight, chart grow, reduced-motion safe.
   Content still lives only in content.js. */
(function () {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stage = document.getElementById("stage");
  const deck = document.getElementById("deck");
  if (!stage || !deck) return;

  /* ---- Ambient elongated-O particle field ---- */
  const canvas = document.createElement("canvas");
  canvas.className = "o-field";
  canvas.setAttribute("aria-hidden", "true");
  deck.insertBefore(canvas, stage);
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, dpr = 1, raf = 0, particles = [];
  const ORANGE = "rgba(255,132,26,";

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn() {
    const n = Math.min(28, Math.floor((w * h) / 70000));
    particles = [];
    for (let i = 0; i < n; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        len: 40 + Math.random() * 110,
        thick: 2 + Math.random() * 4,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -0.12 - Math.random() * 0.22,
        rot: (Math.random() - 0.5) * 0.4,
        a: 0.04 + Math.random() * 0.1,
        pulse: Math.random() * Math.PI * 2
      });
    }
  }

  function drawPill(p, t) {
    const a = p.a * (0.7 + 0.3 * Math.sin(t * 0.0012 + p.pulse));
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.strokeStyle = ORANGE + a + ")";
    ctx.lineWidth = p.thick;
    ctx.lineCap = "round";
    const half = p.len / 2;
    ctx.beginPath();
    ctx.moveTo(0, -half);
    ctx.lineTo(0, half);
    ctx.stroke();
    ctx.restore();
  }

  function tick(t) {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -p.len) { p.y = h + p.len; p.x = Math.random() * w; }
      if (p.x < -40) p.x = w + 40;
      if (p.x > w + 40) p.x = -40;
      drawPill(p, t);
    }
    raf = requestAnimationFrame(tick);
  }

  /* ---- Cursor spotlight (soft vignette follow) ---- */
  const spot = document.createElement("div");
  spot.className = "cursor-spot";
  spot.setAttribute("aria-hidden", "true");
  document.body.appendChild(spot);
  let sx = w / 2, sy = h / 2, tx = sx, ty = sy;

  function onMove(e) {
    tx = e.clientX;
    ty = e.clientY;
  }
  function spotLoop() {
    sx += (tx - sx) * 0.08;
    sy += (ty - sy) * 0.08;
    spot.style.transform = "translate(" + (sx - 220) + "px," + (sy - 220) + "px)";
    requestAnimationFrame(spotLoop);
  }

  /* ---- Chart bar grow when partnership slide enters ----
     Store original height/y in data-* once. WAAPI fill:forwards alone is not
     enough: a re-trigger used to read height="0" from the attr and animate
     0→0, so bars vanished after the first play. */
  function animateCharts(slide) {
    if (!slide || reduced) return;
    const bars = slide.querySelectorAll(".chart-svg rect.bar");
    bars.forEach(function (bar, i) {
      let hAttr = parseFloat(bar.dataset.barH);
      let yAttr = parseFloat(bar.dataset.barY);
      if (isNaN(hAttr) || isNaN(yAttr)) {
        hAttr = parseFloat(bar.getAttribute("height")) || 0;
        yAttr = parseFloat(bar.getAttribute("y")) || 0;
        bar.dataset.barH = String(hAttr);
        bar.dataset.barY = String(yAttr);
      }
      if (hAttr <= 0) return;
      const base = yAttr + hAttr;
      bar.getAnimations().forEach(function (a) { a.cancel(); });
      bar.setAttribute("height", "0");
      bar.setAttribute("y", String(base));
      const anim = bar.animate(
        [
          { height: "0px", y: base + "px" },
          { height: hAttr + "px", y: yAttr + "px" }
        ],
        {
          duration: 900,
          delay: 180 + i * 70,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "forwards"
        }
      );
      anim.onfinish = function () {
        bar.setAttribute("height", String(hAttr));
        bar.setAttribute("y", String(yAttr));
      };
    });
  }

  /* ---- Timeline vertical draw ---- */
  function animateTimeline(slide) {
    if (!slide || reduced) return;
    slide.querySelectorAll(".tl-item").forEach(function (el, i) {
      el.style.setProperty("--ti", String(i));
    });
  }

  /* ---- Watch current slide (identity change only — not every class twitch) ---- */
  let lastSlideId = null;
  function onSlide(slide) {
    if (!slide) return;
    const id = slide.id || "";
    if (id === lastSlideId) return;
    lastSlideId = id;
    document.body.dataset.theme = slide.classList.contains("dark")
      ? "dark"
      : slide.classList.contains("orange")
        ? "orange"
        : "light";
    if (id === "slide-partnership") animateCharts(slide);
    if (id === "slide-case-timeline" || slide.querySelector(".timeline")) {
      animateTimeline(slide);
    }
  }

  const mo = new MutationObserver(function () {
    const cur = stage.querySelector(".slide.current");
    onSlide(cur);
  });
  mo.observe(stage, { subtree: true, attributes: true, attributeFilter: ["class"] });

  /* ---- Boot ---- */
  if (!reduced) {
    resize();
    spawn();
    window.addEventListener("resize", function () { resize(); spawn(); });
    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove, { passive: true });
    spotLoop();
  } else {
    canvas.style.display = "none";
    spot.style.display = "none";
  }

  window.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    } else if (!reduced && !raf) {
      raf = requestAnimationFrame(tick);
    }
  });
})();
