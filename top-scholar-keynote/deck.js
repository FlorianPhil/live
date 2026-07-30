/* Top Scholar keynote: fixed 1280x720 canvas, scaled to fit any viewport.
   content.json is the SSOT. Slides are a stacked stage: one .current at a time,
   kinetic push between them, staggered content build that replays each landing.
   Nothing reflows; the whole stage scales as one unit, so fit is structural.
   Keys: arrows / space / PageUp-Down / wheel / swipe = move, Home/End = ends,
         N = presenter notes, C = chrome off, F = fullscreen. */
(function () {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const deck = document.getElementById("deck");
  const stage = document.getElementById("stage");
  const rail = document.querySelector(".rail");
  const progress = document.querySelector(".progress");
  const hint = document.querySelector(".hint");
  const notes = document.querySelector(".notes");
  const CW = 1280, CH = 720;

  let slidesData = [], slideEls = [], current = -1, meta = {}, animating = false;

  function fitStage() {
    const s = Math.min(window.innerWidth / CW, window.innerHeight / CH);
    stage.style.transform = "scale(" + s + ")";
  }
  window.addEventListener("resize", fitStage);
  document.addEventListener("fullscreenchange", function () { fitStage(); document.body.classList.toggle("is-fs", !!document.fullscreenElement); });
  fitStage();

  fetch("content.json?v=" + Date.now(), { cache: "no-store" })
    .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(build)
    .catch((err) => {
      stage.innerHTML =
        '<section class="slide current"><div class="slide-inner"><div class="lockup">' +
        '<p class="eyebrow">Load error</p><h1 class="headline">COULD NOT LOAD CONTENT' +
        '<span class="pp">.</span></h1><p class="lead">Serve this folder over http. ' +
        esc(String(err)) + "</p></div></div></section>";
    });

  function num2(n) { return String(n).padStart(2, "0"); }
  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function reEsc(t) { return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  function renderHeadline(text, hl) {
    let s = esc(text);
    if (hl) { const h = esc(hl); s = s.replace(new RegExp("\\b" + reEsc(h) + "\\b"), '<span class="hl">' + h + "</span>"); }
    if (/[?!.]$/.test(s)) return s.replace(/([?!.])$/, '<span class="pp">$1</span>');
    return s + '<span class="pp">.</span>';
  }
  function mediaLeft(id) { return id === "backward" || id === "ai"; }

  function build(data) {
    meta = data.meta; slidesData = data.slides;
    const startHash = location.hash;
    document.title = meta.title + " · Top Scholar";
    const total = slidesData.length;
    const footLabel = "Top Scholar / Career Exploration";

    slidesData.forEach((s, idx) => {
      const sec = document.createElement("section");
      sec.className = "slide off-right " + s.type + (s.accent ? " accent" : "");
      sec.id = "slide-" + s.id;
      const hasImg = !!(s.image && s.image.src);
      const layout = hasImg ? (s.layout || "split") : null;
      if (layout === "cover") sec.classList.add("cover");
      else if (layout === "split") { sec.classList.add("split-media"); if (mediaLeft(s.id)) sec.classList.add("media-left"); }

      if (layout === "cover") {
        const bg = document.createElement("div"); bg.className = "cover-bg";
        const cim = document.createElement("img"); cim.src = s.image.src; cim.alt = s.image.alt || ""; cim.loading = idx < 2 ? "eager" : "lazy";
        cim.addEventListener("error", () => { bg.dataset.missing = "true"; });
        bg.appendChild(cim); sec.appendChild(bg);
        const scrim = document.createElement("div"); scrim.className = "cover-scrim"; sec.appendChild(scrim);
      }

      const inner = document.createElement("div"); inner.className = "slide-inner";
      const textCol = document.createElement("div"); textCol.className = "col-text";
      if (s.type === "event" && s.logo) {
        const lg = document.createElement("div"); lg.className = "event-logo anim";
        const li = document.createElement("img"); li.src = s.logo; li.alt = "Top Scholar College Prep logo";
        li.addEventListener("error", () => { lg.dataset.missing = "true"; });
        const fb = document.createElement("span"); fb.className = "event-logo-fb"; fb.textContent = s.logoText || "";
        lg.appendChild(li); lg.appendChild(fb); textCol.appendChild(lg);
      }
      const lockup = document.createElement("div"); lockup.className = "lockup anim";
      const htag = idx === 0 ? "h1" : "h2";
      lockup.innerHTML = '<p class="eyebrow">' + esc(s.eyebrow || "") + "</p>" +
        "<" + htag + ' class="headline">' + renderHeadline(s.headline, s.highlight) + "</" + htag + ">";
      textCol.appendChild(lockup);
      if (s.lead) { const p = document.createElement("p"); p.className = "lead anim"; p.textContent = s.lead; textCol.appendChild(p); }
      const body = buildBody(s); if (body) { body.classList.add("anim"); textCol.appendChild(body); }
      inner.appendChild(textCol);

      if (layout === "split") {
        const mediaCol = document.createElement("div"); mediaCol.className = "col-media";
        mediaCol.appendChild(buildMedia(s, idx));
        inner.appendChild(mediaCol);
      }
      if (s.type === "moodboard") {
        sec.classList.add("moodboard-slide");
        const mbCol = document.createElement("div"); mbCol.className = "col-moodboard";
        const grid = document.createElement("div"); grid.className = "mb-grid";
        (s.tiles || []).forEach((tile) => {
          const t = document.createElement("div"); t.className = "mb-tile anim";
          if (tile.src) {
            const im = document.createElement("img"); im.src = tile.src; im.alt = tile.alt || ""; im.loading = "lazy";
            im.addEventListener("error", () => { t.classList.add("mb-ph"); t.innerHTML = "<span>" + esc(tile.label || tile.alt || "") + "</span>"; });
            t.appendChild(im);
            if (tile.label) { const cap = document.createElement("span"); cap.className = "mb-cap"; cap.textContent = tile.label; t.appendChild(cap); }
          } else {
            t.classList.add("mb-ph"); t.innerHTML = "<span>" + esc(tile.label || "") + "</span>";
          }
          grid.appendChild(t);
        });
        mbCol.appendChild(grid); inner.appendChild(mbCol);
      }
      if (s.type === "map") {
        sec.classList.add("map-slide");
        const gcol = document.createElement("div"); gcol.className = "col-globe anim";
        gcol.appendChild(buildGlobe(s));
        inner.appendChild(gcol);
      }
      sec.appendChild(inner);

      const foot = document.createElement("div"); foot.className = "slide-foot";
      foot.innerHTML = "<span>" + esc(footLabel) + '</span><span class="num"><b>' + num2(idx + 1) + "</b> / " + num2(total) + "</span>";
      sec.appendChild(foot);

      Array.prototype.forEach.call(sec.querySelectorAll(".anim"), (a, i) => a.style.setProperty("--i", i));
      stage.appendChild(sec);

      const dot = document.createElement("button"); dot.type = "button";
      const dl = (idx + 1) + ". " + (s.eyebrow || s.id);
      dot.setAttribute("aria-label", dl); dot.title = dl;
      dot.addEventListener("click", () => goTo(idx));
      rail.appendChild(dot);
    });

    slideEls = Array.prototype.slice.call(stage.querySelectorAll(".slide"));
    setupNav();
    const di = deepLinkIndex(startHash);
    const startIdx = di > 0 ? di : 0;
    const first = slideEls[startIdx];
    first.classList.add("off-right");
    void first.offsetWidth;
    first.classList.remove("off-right", "off-left");
    first.classList.add("current");
    current = startIdx; setActive(startIdx);
    setTimeout(() => hint && hint.classList.add("fade"), 4600);
  }

  function buildMedia(s, idx) {
    const m = document.createElement("div"); m.className = "media vf anim";
    const clip = document.createElement("div"); clip.className = "media-clip";
    const img = document.createElement("img");
    img.src = s.image.src; img.alt = s.image.alt || ""; img.loading = idx < 2 ? "eager" : "lazy";
    img.addEventListener("error", () => { m.dataset.missing = "true"; });
    clip.appendChild(img); m.appendChild(clip);
    const ph = document.createElement("span"); ph.className = "ph"; ph.textContent = "Image pending"; m.appendChild(ph);
    return m;
  }

  function buildBody(s) {
    let c;
    switch (s.type) {
      case "title":
        c = document.createElement("div"); c.className = "name-lockup";
        c.innerHTML = '<div class="nm">' + esc(s.lockup.name) + "</div>" +
          '<div class="meta-line">' + esc(s.lockup.role) + " &nbsp;/&nbsp; " + esc(s.lockup.site) + "</div>";
        return c;
      case "prompt":
        return list("prompt-list", s.interaction || []);
      case "path":
        c = document.createElement("div"); c.className = "stops";
        s.stops.forEach((st) => { const d = document.createElement("div"); d.className = "stop";
          d.innerHTML = '<span class="pl">' + esc(st.place) + '</span><span class="nt">' + esc(st.note) + "</span>"; c.appendChild(d); });
        return c;
      case "split":
        c = document.createElement("div"); c.className = "cols";
        s.columns.forEach((col, ci) => { const d = document.createElement("div"); d.className = "col" + (ci === 1 ? " neg" : "");
          d.innerHTML = "<h3>" + esc(col.label) + "</h3><ul>" + col.items.map((it) => "<li>" + esc(it) + "</li>").join("") + "</ul>"; c.appendChild(d); });
        return c;
      case "cards":
        c = document.createElement("div"); c.className = "cards-grid";
        s.cards.forEach((cd) => { const d = document.createElement("div"); d.className = "card";
          d.innerHTML = '<div class="pl">' + esc(cd.place) + '</div><div class="nt">' + esc(cd.note) + "</div>"; c.appendChild(d); });
        return c;
      case "statement":
        c = document.createElement("div");
        if (s.examples) c.appendChild(list("examples", s.examples));
        if (s.point) { const p = document.createElement("p"); p.className = "point"; p.textContent = s.point; c.appendChild(p); }
        return c.childNodes.length ? c : null;
      case "definition":
        c = document.createElement("div");
        const q = document.createElement("div"); q.className = "bt-questions";
        (s.questions || []).forEach((qq) => { const d = document.createElement("div"); d.textContent = qq; q.appendChild(d); });
        c.appendChild(q);
        if (s.frame) { const p = document.createElement("p"); p.className = "frame"; p.textContent = s.frame; c.appendChild(p); }
        return c;
      case "exercise":
        c = document.createElement("div");
        if (s.setup) { const p = document.createElement("p"); p.className = "setup"; p.textContent = s.setup; c.appendChild(p); }
        c.appendChild(list("steps", s.steps || []));
        if (s.payoff) { const p = document.createElement("p"); p.className = "payoff"; p.textContent = s.payoff; c.appendChild(p); }
        return c;
      case "grid":
        c = document.createElement("div"); c.className = "skills-grid";
        (s.skills || []).forEach((sk, i) => { const d = document.createElement("div"); d.className = "skill";
          d.innerHTML = '<span class="num">' + num2(i + 1) + '</span><span>' + esc(sk) + "</span>"; c.appendChild(d); });
        return c;
      case "brands":
        c = document.createElement("div"); c.className = "brand-list";
        (s.brands || []).forEach((b) => { const d = document.createElement("div"); d.className = "brand-name anim"; d.textContent = b; c.appendChild(d); });
        return c;
      case "diagram": {
        c = document.createElement("div"); c.className = "diagram";
        const row = document.createElement("div"); row.className = "dia-row";
        (s.nodes || []).forEach((n) => { const node = document.createElement("div"); node.className = "dia-node anim";
          node.innerHTML = '<span class="dia-node-label">' + esc(n.label) + '</span><span class="dia-node-desc">' + esc(n.desc || "") + "</span>"; row.appendChild(node); });
        c.appendChild(row);
        if (s.spanLabel) { const span = document.createElement("div"); span.className = "dia-span anim";
          span.innerHTML = '<span class="dia-span-label">' + esc(s.spanLabel) + "</span>" + (s.spanDesc ? '<span class="dia-span-desc">' + esc(s.spanDesc) + "</span>" : ""); c.appendChild(span); }
        return c;
      }
      case "compare": {
        c = document.createElement("div"); c.className = "compare";
        (s.profiles || []).forEach((p) => {
          const card = document.createElement("div"); card.className = "cmp-card anim" + (p.accent ? " cmp-accent" : "");
          const bars = document.createElement("div"); bars.className = "cmp-bars";
          (p.bars || []).forEach((h) => { const b = document.createElement("span"); b.className = "cmp-bar"; b.style.height = h + "%"; bars.appendChild(b); });
          const lab = document.createElement("div"); lab.className = "cmp-label"; lab.textContent = p.label;
          const cap = document.createElement("div"); cap.className = "cmp-cap"; cap.textContent = p.caption || "";
          card.appendChild(bars); card.appendChild(lab); card.appendChild(cap);
          c.appendChild(card);
        });
        return c;
      }
      case "map":
        return buildMap(s);
      case "timeline": {
        c = document.createElement("div"); c.className = "tl-wrap";
        const jobs = document.createElement("div"); jobs.className = "timeline";
        (s.roles || []).forEach((r) => { const row = document.createElement("div"); row.className = "tl-row anim";
          row.innerHTML = '<span class="tl-dot"></span><span class="tl-year">' + esc(r.year) + '</span><span class="tl-role">' + esc(r.role) +
            (r.place ? ' <span class="tl-place">' + esc(r.place) + "</span>" : "") + "</span>"; jobs.appendChild(row); });
        c.appendChild(jobs);
        if (s.projects && s.projects.length) {
          const proj = document.createElement("div"); proj.className = "tl-projects";
          if (s.projectsLabel) { const pl = document.createElement("div"); pl.className = "tl-proj-label anim"; pl.textContent = s.projectsLabel; proj.appendChild(pl); }
          s.projects.forEach((p) => { const row = document.createElement("div"); row.className = "tl-proj-row anim";
            row.innerHTML = '<span class="tl-proj-name">' + esc(p.name) + (p.year ? ' <span class="tl-place">' + esc(p.year) + "</span>" : "") + "</span>" + '<span class="tl-proj-made">' + esc(p.made || "") + "</span>"; proj.appendChild(row); });
          if (s.projectsNote) { const pn = document.createElement("div"); pn.className = "tl-proj-note anim"; pn.textContent = s.projectsNote; proj.appendChild(pn); }
          c.appendChild(proj);
        }
        return c;
      }
      case "event":
        c = document.createElement("div"); c.className = "event-meta";
        (s.meta || []).forEach((m) => { const d = document.createElement("div"); d.textContent = m; c.appendChild(d); });
        return c;
      case "close":
        c = document.createElement("div");
        c.appendChild(list("prompt-list", s.prompts || []));
        if (s.thanks) { const t = document.createElement("p"); t.className = "thanks"; t.textContent = s.thanks; c.appendChild(t); }
        return c;
    }
    return null;
  }
  function list(cls, arr) { const ul = document.createElement("ul"); ul.className = cls; arr.forEach((x) => { const li = document.createElement("li"); const i = x.indexOf(" · "); if (i > -1) { const t = document.createElement("span"); t.className = "li-title"; t.textContent = x.slice(0, i); const s = document.createElement("span"); s.className = "li-sub"; s.textContent = x.slice(i); li.appendChild(t); li.appendChild(s); } else { li.textContent = x; } ul.appendChild(li); }); return ul; }

  /* Map slide. A COBE dotted 3D globe (the npm `cobe` package, loaded as an ESM
     from esm.sh) on the right, a numbered journey legend on the left. COBE draws
     the sphere as dots, which matches the dotted aesthetic, and natively renders
     dotted-feel purple arcs between consecutive cities plus purple city markers
     at their real lat/long. cobe exposes createGlobe(canvas,opts) -> {update,
     destroy}; it has no internal rAF, so we own the loop and increment phi for a
     slow, watchable auto-rotation. Init/teardown is keyed to .slide.current via a
     MutationObserver so the rotation only spends frames while the slide is shown
     and replays on every landing. Labels live as a legible legend list, never as
     text pinned to a spinning sphere. Coords come from content.json [lat, lon]. */
  let COBE_MOD = null; // cached module promise so we import the ESM only once

  // The numbered journey legend (place + year + tag), in travel order. Lives in
  // the text column on the left; the globe is built separately on the right.
  function buildMap(s) {
    const places = (s.places || []).filter((p) => Array.isArray(p.coords));
    const legend = document.createElement("ol"); legend.className = "map-legend";
    places.forEach((p, i) => {
      const li = document.createElement("li"); li.className = "map-leg anim";
      li.innerHTML = '<span class="map-leg-n">' + num2(i + 1) + "</span>" +
        '<span class="map-leg-txt"><span class="map-place">' + esc(p.place) +
        (p.year ? ' <span class="map-year">' + esc(p.year) + "</span>" : "") + "</span>" +
        '<span class="map-tag">' + esc(p.tag) + "</span></span>";
      legend.appendChild(li);
    });
    return legend;
  }

  // The COBE globe, in its own right-hand column so it can be large and centered.
  function buildGlobe(s) {
    const places = (s.places || []).filter((p) => Array.isArray(p.coords));
    const globe = document.createElement("div"); globe.className = "map-globe";
    const canvas = document.createElement("canvas");
    canvas.className = "globe-canvas"; canvas.setAttribute("aria-hidden", "true");
    globe.appendChild(canvas);
    initGlobe(globe, canvas, places);
    return globe;
  }

  // Brand colors as 0..1 RGB triples for COBE (which wants linear-ish floats).
  const PURPLE_RGB = [0.353, 0.361, 0.976]; // #5A5CF9
  const LAND_RGB = [0.84, 0.84, 0.90];      // soft grey land dots on white
  function initGlobe(wrap, canvas, places) {
    const SIZE = 460;                      // CSS px of the square canvas on-stage
    const markers = places.map((p) => ({ location: [p.coords[0], p.coords[1]], size: 0.055 }));
    const arcs = [];
    for (let i = 1; i < places.length; i++) {
      arcs.push({ from: places[i - 1].coords.slice(), to: places[i].coords.slice() });
    }
    // Center the auto-rotation near the route's mean longitude so the journey is
    // front-facing as it begins; theta tilts the north slightly toward us.
    const meanLon = places.reduce((a, p) => a + p.coords[1], 0) / (places.length || 1);
    const basePhi = -(meanLon * Math.PI) / 180 + Math.PI; // rough front-facing start

    let globeObj = null, raf = 0, phi = basePhi, running = false, destroyed = false;

    function start(mod) {
      if (destroyed) return;
      const createGlobe = mod && (mod.default || mod);
      if (typeof createGlobe !== "function") return;
      // Reset/replace any prior instance (replays cleanly on each landing).
      console.log("[mapdbg] start: before stop()");
      stop();
      console.log("[mapdbg] start: after stop(), before createGlobe");
      phi = basePhi;
      // cobe sets canvas.width = width * devicePixelRatio. CSS sizes the element
      // to SIZE; render at 2x for a crisp sphere, so pass width=height=SIZE, dpr=2.
      try {
        globeObj = createGlobe(canvas, {
          devicePixelRatio: 2,
          width: SIZE, height: SIZE,
          phi: phi, theta: 0.18,
          dark: 0, diffuse: 1.1, mapSamples: 16000, mapBrightness: 1.25,
          baseColor: LAND_RGB,
          markerColor: PURPLE_RGB,
          glowColor: [1, 1, 1],
          arcColor: PURPLE_RGB, arcWidth: 1.4, arcHeight: 0.45,
          opacity: 1,
          markers: markers,
          arcs: arcs
        });
      } catch (e) { console.error("[mapdbg] createGlobe THREW:", e && e.message, e && e.stack); throw e; }
      console.log("[mapdbg] createGlobe done. canvas.width=", canvas.width, "globeObj?", !!globeObj, "hasUpdate", globeObj && typeof globeObj.update);
      running = true;
      const loop = () => {
        if (!running || !globeObj) return;
        phi += 0.0016;                     // slow, watchable auto-rotation
        globeObj.update({ phi: phi });
        window.__mapPhi = phi; window.__mapTicks = (window.__mapTicks||0)+1;
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      if (globeObj) { try { globeObj.destroy(); } catch (e) {} globeObj = null; }
    }
    function ensureLoaded() {
      console.log("[mapdbg] ensureLoaded called");
      if (!COBE_MOD) COBE_MOD = import("https://esm.sh/cobe@2.0.1");
      COBE_MOD.then(function(m){ console.log("[mapdbg] import resolved", typeof (m&&(m.default||m))); start(m); }).catch((err) => {
        canvas.dataset.failed = "true";
        wrap.classList.add("globe-failed");
        if (window.console) console.error("[map] COBE globe failed to load:", err);
      });
    }

    // The wrap is detached when buildMap returns; resolve the owning slide and
    // wire up only after it is in the DOM, on the next frame.
    requestAnimationFrame(() => {
      if (destroyed) return;
      const slide = wrap.closest(".slide");
      console.log("[mapdbg] rAF fired. slide?", !!slide, "current?", slide && slide.classList.contains("current"));
      if (reduced) {
        // No spin under reduced motion: paint a single static frame, then halt.
        ensureLoaded();
        if (COBE_MOD) COBE_MOD.then(() => { running = false; if (raf) { cancelAnimationFrame(raf); raf = 0; } });
        return;
      }
      if (!slide) { ensureLoaded(); return; } // safety: animate anyway if unowned
      // Run only while the slide is current; re-init on every landing.
      if (slide.classList.contains("current")) ensureLoaded();
      const obs = new MutationObserver(() => {
        const on = slide.classList.contains("current");
        if (on && !globeObj && !running) ensureLoaded();
        else if (!on) stop();
      });
      obs.observe(slide, { attributes: true, attributeFilter: ["class"] });
    });
  }

  function setActive(i) {
    Array.prototype.forEach.call(rail.children, (d, di) => { const on = di === i; d.classList.toggle("active", on); d.setAttribute("aria-current", on ? "true" : "false"); });
    if (slidesData[i]) deck.style.background = slidesData[i].accent ? "#5A5CF9" : "#FFFFFF";
    document.body.classList.toggle("on-accent", !!(slidesData[i] && slidesData[i].accent));
    if (notes.classList.contains("open")) renderNotes();
    if (history.replaceState) history.replaceState(null, "", "#" + slidesData[i].id);
    updateProgress();
  }

  function goTo(i) {
    i = Math.max(0, Math.min(slideEls.length - 1, i));
    if (i === current || animating) return;
    const dir = i > current ? 1 : -1;
    const incoming = slideEls[i];
    const outgoing = current >= 0 ? slideEls[current] : null;
    animating = true;
    incoming.classList.remove("current", "exit-left", "exit-right", "off-left", "off-right");
    incoming.style.transition = "none";
    incoming.classList.add(dir > 0 ? "off-right" : "off-left");
    void incoming.offsetWidth;
    incoming.style.transition = "";
    incoming.classList.remove("off-right", "off-left");
    incoming.classList.add("current");
    if (outgoing) {
      outgoing.classList.remove("current");
      outgoing.classList.add(dir > 0 ? "exit-left" : "exit-right");
      window.setTimeout(() => { outgoing.classList.remove("exit-left", "exit-right"); outgoing.classList.add(dir > 0 ? "off-left" : "off-right"); }, 640);
    }
    current = i; setActive(i);
    window.setTimeout(() => { animating = false; }, reduced ? 60 : 440);
  }

  function setupNav() {
    window.addEventListener("keydown", (e) => {
      if (e.key === " " && e.target && e.target.closest && e.target.closest("button, input, textarea, [contenteditable]")) return;
      const k = e.key;
      if (k === "ArrowRight" || k === "ArrowDown" || k === "PageDown" || k === " ") { e.preventDefault(); goTo(current + 1); }
      else if (k === "ArrowLeft" || k === "ArrowUp" || k === "PageUp") { e.preventDefault(); goTo(current - 1); }
      else if (k === "Home") { e.preventDefault(); goTo(0); }
      else if (k === "End") { e.preventDefault(); goTo(slideEls.length - 1); }
      else if (k.toLowerCase() === "n") { toggleNotes(); }
      else if (k.toLowerCase() === "c") { document.body.classList.toggle("chrome-off"); }
      else if (k.toLowerCase() === "f") { toggleFs(); }
      else if (k === "Escape") { notes.classList.remove("open"); }
    });
    const fsBtn = document.querySelector(".fs-btn");
    if (fsBtn) fsBtn.addEventListener("click", function () { toggleFs(); fsBtn.blur(); });
    let wheelLock = false, accum = 0;
    deck.addEventListener("wheel", (e) => {
      e.preventDefault();
      if (wheelLock) return;
      accum += e.deltaY;
      if (Math.abs(accum) < 40) return;
      const d = accum > 0 ? 1 : -1; accum = 0; wheelLock = true;
      goTo(current + d);
      window.setTimeout(() => { wheelLock = false; }, 640);
    }, { passive: false });
    let tx = 0;
    deck.addEventListener("touchstart", (e) => { tx = e.changedTouches[0].clientX; }, { passive: true });
    deck.addEventListener("touchend", (e) => { const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1)); }, { passive: true });
  }

  function deepLinkIndex(hash) { if (!hash) return -1; const id = hash.slice(1).replace(/^slide-/, ""); return slidesData.findIndex((s) => s.id === id); }
  function updateProgress() { const f = slideEls.length > 1 ? Math.max(0, current) / (slideEls.length - 1) : 0; progress.style.setProperty("--p", f.toFixed(4)); }
  function toggleNotes() { notes.classList.toggle("open"); if (notes.classList.contains("open")) renderNotes(); }
  function renderNotes() {
    const s = slidesData[current]; if (!s) return;
    let qa = "";
    if (s.type === "close" && meta.qa_seeds) qa = '<div class="qa"><h4>Q&amp;A seeds</h4><ul>' + meta.qa_seeds.map((q) => "<li>" + esc(q) + "</li>").join("") + "</ul></div>";
    notes.innerHTML = "<h4>Presenter notes &middot; slide " + (current + 1) + "</h4>" +
      '<div class="timing">' + esc(s.timing || "") + "</div><p>" + esc(s.notes || "") + "</p>" + qa;
  }
  function toggleFs() {
    if (!document.fullscreenElement) { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); }
    else if (document.exitFullscreen) document.exitFullscreen();
  }
})();
