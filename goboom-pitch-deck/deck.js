/* Go Boom deck engine — fixed 1440×810 canvas, bilingual, keyboard + fullscreen.
   Pattern adapted from Florian's top-scholar-keynote (kinetic stage, not FP brand). */
(function () {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const deck = document.getElementById("deck");
  const stage = document.getElementById("stage");
  const rail = document.querySelector(".rail");
  const progress = document.querySelector(".progress");
  const CW = 1440, CH = 810;

  let lang = localStorage.getItem("gbc-lang") === "zh" ? "zh" : "en";
  let slidesData = [];
  let slideEls = [];
  let current = -1;
  let animating = false;
  let meta = {};
  let charts = {};

  function t(obj) {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[lang] != null ? obj[lang] : (obj.en || "");
  }
  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function num2(n) { return String(n).padStart(2, "0"); }

  function fitStage() {
    const s = Math.min(window.innerWidth / CW, window.innerHeight / CH);
    stage.style.transform = "scale(" + s + ")";
  }
  window.addEventListener("resize", fitStage);
  document.addEventListener("fullscreenchange", function () {
    fitStage();
    document.body.classList.toggle("is-fs", !!document.fullscreenElement);
  });
  fitStage();

  function setLang(next) {
    lang = next === "zh" ? "zh" : "en";
    localStorage.setItem("gbc-lang", lang);
    document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
    document.querySelectorAll(".lang-btn").forEach(function (b) {
      const on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    document.querySelectorAll("[data-hint]").forEach(function (el) {
      el.hidden = el.getAttribute("data-hint") !== lang;
    });
    const keep = current >= 0 ? current : 0;
    build(window.GBC_CONTENT);
    goTo(keep, true);
  }

  function footHtml(idx) {
    return (
      '<div class="slide-foot"><span>' + esc(t(meta.foot)) +
      '</span><span class="slide-num">' + num2(idx + 1) + " / " + num2(slidesData.length) +
      "</span></div>"
    );
  }

  function symHtml(n, cls) {
    if (!n) return "";
    const file = lang === "zh"
      ? "assets/symbol-" + n + "-white.png"
      : "assets/symbol-" + n + "-white.png";
    const dark = true;
    const src = "assets/symbol-" + n + "-" + (dark ? "white" : "black") + ".png";
    return '<img class="sym ' + (cls || "sym-tr") + '" src="' + src + '" alt="" aria-hidden="true" />';
  }

  function bullets(arr) {
    return (arr || []).map(function (b) {
      if (typeof b === "string") {
        return '<div class="bullet build"><div class="bullet-body">' + esc(b) + "</div></div>";
      }
      return (
        '<div class="bullet build">' +
        (b.title ? '<div class="bullet-title">' + esc(b.title) + "</div>" : "") +
        '<div class="bullet-body">' + esc(b.body || "") + "</div>" +
        "</div>"
      );
    }).join("");
  }

  /* ---- Charts: bars in SVG, labels in HTML (never under footer) ---- */
  function chartBlock(values, max, labels) {
    const W = 520, H = 118, padL = 4, padR = 4, padT = 6, padB = 4;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const n = values.length;
    const gap = 16;
    const barW = (plotW - gap * (n - 1)) / n;
    let bars = "";
    values.forEach(function (v, i) {
      const h = Math.max(3, (v / max) * plotH);
      const x = padL + i * (barW + gap);
      const y = padT + (plotH - h);
      bars +=
        '<rect class="bar" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) +
        '" width="' + barW.toFixed(1) + '" height="' + h.toFixed(1) +
        '" fill="#FF841A" rx="1"/>';
    });
    const base =
      '<line x1="' + padL + '" y1="' + (padT + plotH) + '" x2="' + (W - padR) +
      '" y2="' + (padT + plotH) + '" stroke="#E8E8E8" stroke-width="1"/>';
    const axis = labels.map(function (lab) {
      return '<div class="chart-lab">' + esc(lab) + "</div>";
    }).join("");
    return (
      '<div class="chart-plot">' +
      '<svg class="chart-svg" viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none" aria-hidden="true">' +
      base + bars + "</svg>" +
      '<div class="chart-axis">' + axis + "</div>" +
      "</div>"
    );
  }

  /* ---- Renderers ---- */
  function renderTitle(s, idx) {
    const c = s[lang] || s.en;
    return (
      '<div class="slide-inner title-stage">' +
      '<div class="logo-anim" aria-label="Go Boom Consulting">' +
      '<img class="logo-official" src="assets/logo-stacked-white.png" alt="Go Boom Consulting" />' +
      "</div>" +
      '<div class="title-kicker">' +
      "<h1>" + esc(c.subtitle) + "</h1>" +
      "<p>" + esc(c.line) + "</p>" +
      "</div></div>" + footHtml(idx)
    );
  }

  function renderStatement(s, idx) {
    const c = s[lang] || s.en;
    return (
      '<div class="slide-inner" style="justify-content:center;align-items:center;text-align:center;width:100%">' +
      '<h2 class="headline xxl build">' + esc(c.headline) + "</h2>" +
      "</div>" + footHtml(idx)
    );
  }

  function renderEurope(s, idx) {
    const c = s[lang] || s.en;
    const oppTitle = c.oppTitle || (lang === "zh" ? "機會" : "Opportunity");
    const barTitle = c.barTitle || (lang === "zh" ? "為什麼品牌卻步" : "Why brands stay away");
    return (
      symHtml(s.symbol, "sym-side") +
      '<div class="slide-inner">' +
      '<p class="eyebrow build">' + esc(c.eyebrow || "") + "</p>" +
      '<h2 class="headline build" style="font-size:56px;max-width:20ch">' + esc(c.headline) + "</h2>" +
      '<div class="grid-2">' +
      '<div class="col opp">' +
      "<h3 class=\"build\">" + esc(oppTitle) + "</h3>" +
      bullets(c.opportunity) +
      "</div>" +
      '<div class="col pain">' +
      "<h3 class=\"build\">" + esc(barTitle) + "</h3>" +
      bullets(c.barriers) +
      "</div></div></div>" + footHtml(idx)
    );
  }

  function renderProblems(s, idx) {
    const c = s[lang] || s.en;
    const probs = (c.problems || []).map(function (p) {
      return (
        '<div class="prob build"><div class="prob-n">' + esc(p.n) +
        "</div><h4>" + esc(p.title) + "</h4><p>" + esc(p.body) + "</p></div>"
      );
    }).join("");
    return (
      symHtml(s.symbol, "sym-tr") +
      '<div class="slide-inner">' +
      '<p class="eyebrow build">' + esc(c.eyebrow || "") + "</p>" +
      '<h2 class="headline build" style="font-size:56px;max-width:20ch">' + esc(c.headline) + "</h2>" +
      '<div class="prob-grid">' + probs + "</div>" +
      (c.callout ? '<div class="aside-callout build">' + esc(c.callout) + "</div>" : "") +
      "</div>" + footHtml(idx)
    );
  }

  function renderMulti(s, idx) {
    const c = s[lang] || s.en;
    const items = (c.items || []).map(function (it, i) {
      return (
        '<div class="feat build"><div class="feat-n">' + num2(i + 1) +
        "</div><div><h4>" + esc(it.title || "") + "</h4><p>" + esc(it.body || it) + "</p></div></div>"
      );
    }).join("");
    return (
      '<div class="slide-inner">' +
      '<p class="eyebrow build">' + esc(c.eyebrow || "") + "</p>" +
      '<h2 class="headline build" style="font-size:56px">' + esc(c.headline) + "</h2>" +
      (c.sub ? '<p class="lead build" style="margin-top:10px">' + esc(c.sub) + "</p>" : "") +
      '<div class="feat-list" style="margin-top:24px">' + items + "</div>" +
      (c.damage ? '<div class="aside-callout build" style="margin-top:20px">' + esc(c.damage) + "</div>" : "") +
      "</div>" + footHtml(idx)
    );
  }

  function renderPositioning(s, idx) {
    const c = s[lang] || s.en;
    const plats = (c.platforms || []).map(function (p) {
      return '<span class="plat build">' + esc(p) + "</span>";
    }).join("");
    return (
      symHtml(s.symbol || 4, "sym-side") +
      '<div class="slide-inner"><div class="pos-hero">' +
      '<h2 class="headline build">' + esc(c.line1) +
      '<br/><span class="line2">' + esc(c.line2) + "</span></h2>" +
      '<p class="lead build">' + esc(c.lead) + "</p>" +
      '<div class="platforms">' + plats + "</div>" +
      "</div></div>" + footHtml(idx)
    );
  }

  function renderTeam(s, idx) {
    const c = s[lang] || s.en;
    const cards = (c.members || []).map(function (m) {
      return (
        '<div class="team-card build"><div class="role">' + esc(m.role) +
        '</div><div class="name">' + esc(m.name) +
        '</div><div class="langs">' + esc(m.langs) + "</div></div>"
      );
    }).join("");
    const alumni = (c.alumni || []).map(function (a) {
      return "<span>" + esc(a) + "</span>";
    }).join("");
    const cur = (c.current || []).map(function (a) {
      return '<span class="accent">' + esc(a) + "</span>";
    }).join("");
    const netTitle = c.networkTitle || (lang === "zh" ? "延伸網絡" : "Extended network");
    const netBody = Array.isArray(c.network)
      ? c.network.map(function (n) { return esc(n); }).join(" · ")
      : esc(c.network || "");
    return (
      '<div class="slide-inner">' +
      '<p class="eyebrow build">' + esc(c.eyebrow || "") + "</p>" +
      '<h2 class="headline build" style="font-size:56px;margin-bottom:18px">' + esc(c.headline) + "</h2>" +
      '<div class="team-grid">' + cards + "</div>" +
      '<div class="team-meta">' +
      '<div><div class="ex-list build">' + alumni + cur + "</div>" +
      (c.languages ? '<p class="lang-strip build">' + esc(c.languages) + "</p>" : "") +
      "</div>" +
      '<div class="network build"><strong>' + esc(netTitle) + "</strong>" +
      netBody + "</div>" +
      "</div></div>" + footHtml(idx)
    );
  }

  function renderFeats(s, idx) {
    const c = s[lang] || s.en;
    const feats = (c.feats || c.items || []).map(function (f, i) {
      return (
        '<div class="feat build"><div class="feat-n">' + num2(i + 1) +
        '</div><div><h4>' + esc(f.title) + "</h4><p>" + esc(f.body) + "</p></div></div>"
      );
    }).join("");
    return (
      '<div class="slide-inner">' +
      '<p class="eyebrow build">' + esc(c.eyebrow || "") + "</p>" +
      '<h2 class="headline build" style="font-size:52px;max-width:22ch;margin-bottom:8px">' + esc(c.headline) + "</h2>" +
      '<div class="feat-list">' + feats + "</div>" +
      "</div>" + footHtml(idx)
    );
  }

  function renderGtm(s, idx) {
    const c = s[lang] || s.en;
    const cards = (c.cards || []).map(function (card) {
      return (
        '<div class="do-card build"><h4>' + esc(card.title) +
        "</h4><p>" + esc(card.body) + "</p></div>"
      );
    }).join("");
    return (
      '<div class="slide-inner">' +
      '<p class="eyebrow build">' + esc(c.eyebrow || "") + "</p>" +
      '<h2 class="headline build" style="font-size:52px;margin-bottom:8px">' + esc(c.headline) + "</h2>" +
      '<div class="do-grid">' + cards + "</div>" +
      "</div>" + footHtml(idx)
    );
  }

  function renderOps(s, idx) {
    const c = s[lang] || s.en;
    const steps = (c.steps || []).map(function (st) {
      return (
        '<div class="ops-step build"><div class="ops-arrow">→</div><div><h4>' +
        esc(st.title) + "</h4><p>" + esc(st.body) + "</p></div></div>"
      );
    }).join("");
    return (
      '<div class="slide-inner">' +
      '<p class="eyebrow build">' + esc(c.eyebrow || "") + "</p>" +
      '<h2 class="headline build" style="font-size:52px">' + esc(c.headline) + "</h2>" +
      '<div class="ops-flow">' + steps + "</div>" +
      "</div>" + footHtml(idx)
    );
  }

  function renderCaseTimeline(s, idx) {
    const c = s[lang] || s.en;
    function tl(arr) {
      return (arr || []).map(function (it) {
        const yr = it.yr || it.date || "";
        const text = it.text || ((it.label ? it.label + " · " : "") + (it.detail || ""));
        return (
          '<div class="tl-item build"><div class="yr">' + esc(yr) +
          "</div><p>" + esc(text) + "</p></div>"
        );
      }).join("");
    }
    const headline = c.headline || (lang === "zh" ? "案例：Novium 時程" : "Case Study: Novium Timeline");
    const marketsTitle = c.marketsTitle || (lang === "zh" ? "市場拓展" : "Markets development");
    const brandTitle = c.brandTitle || (lang === "zh" ? "品牌發展" : "Brand development");
    const challengeLabel = c.challengeLabel || (lang === "zh" ? "Novium 的挑戰" : "Novium's challenge");
    const brandTl = c.brandTimeline || c.brand || [];
    return (
      '<div class="slide-inner">' +
      '<div class="case-head build">' +
      '<img class="case-logo case-logo--novium" src="assets/novium-logo-07.png" alt="Novium" />' +
      '<span class="x">×</span>' +
      '<img class="case-logo case-logo--gb" src="assets/logo-stacked-black.png" alt="Go Boom" />' +
      "</div>" +
      '<p class="eyebrow">' + esc(c.eyebrow || (lang === "zh" ? "案例" : "Case Study")) + "</p>" +
      '<h2 class="headline build" style="font-size:44px;margin-bottom:12px">' + esc(headline) + "</h2>" +
      (c.challenge
        ? '<div class="challenge-box build"><strong>' + esc(challengeLabel) +
          "</strong>" + esc(c.challenge) + "</div>"
        : "") +
      '<div class="timeline">' +
      '<div class="tl-block"><h3 class="build">' + esc(marketsTitle) + "</h3>" + tl(c.markets) + "</div>" +
      '<div class="tl-block"><h3 class="build">' + esc(brandTitle) + "</h3>" + tl(brandTl) + "</div>" +
      "</div></div>" + footHtml(idx)
    );
  }

  function renderCaseExamples(s, idx) {
    const c = s[lang] || s.en;
    const headline = c.headline || (lang === "zh" ? "案例：Novium 實例" : "Case Study: Novium Examples");
    const slots = (c.slots || []).map(function (sl) {
      let body = "";
      if (sl.items && sl.items.length) {
        body = "<ul>" + sl.items.map(function (i) {
          if (typeof i === "string") return "<li>" + esc(i) + "</li>";
          return "<li>" + esc((i.market ? i.market + " → " : "") + (i.name || "")) + "</li>";
        }).join("") + "</ul>";
      } else if (sl.body) {
        body = "<p>" + esc(sl.body) + "</p>";
      }
      const ph = sl.placeholder || sl.note || "";
      return (
        '<div class="ex-slot build"><h4>' + esc(sl.title) + "</h4>" + body +
        (ph ? '<div class="ph">' + esc(ph) + "</div>" : "") +
        "</div>"
      );
    }).join("");
    return (
      '<div class="slide-inner">' +
      '<p class="eyebrow build">' + esc(c.eyebrow || (c.brand || "Novium")) + "</p>" +
      '<h2 class="headline build" style="font-size:48px;margin-bottom:8px">' + esc(headline) + "</h2>" +
      '<div class="examples-grid">' + slots + "</div>" +
      "</div>" + footHtml(idx)
    );
  }

  function renderPartnership(s, idx) {
    const c = s[lang] || s.en;
    const points = (c.points || []).map(function (p) {
      if (typeof p === "string") {
        return '<li class="build">' + esc(p) + "</li>";
      }
      return '<li class="build"><strong>' + esc(p.label) + "</strong> " + esc(p.text) + "</li>";
    }).join("");
    const spendSvg = chartBlock(charts.spend, charts.spendMax, charts.labels);
    const unitsSvg = chartBlock(charts.units, charts.unitsMax, charts.labels);
    const pointsTitle = c.pointsTitle || (lang === "zh" ? "Novium 在 Go Boom 找到的" : "What Novium found in Go Boom");
    const resultTitle = c.resultTitle || (c.result
      ? (c.result.label + " (" + c.result.from + " – " + c.result.to + ")")
      : (lang === "zh" ? "成果（2022.12 – 2026.05）" : "The Result (Dec '22 – May '26)"));
    const spendTitle = c.spendTitle || (lang === "zh" ? "年度行銷預算" : "Yearly marketing budget");
    const spendSub = c.spendSub || (lang === "zh" ? "行銷支出（€）" : "Marketing spent (€)");
    const unitsTitle = c.unitsTitle || (lang === "zh" ? "年度銷售量" : "Products sold per year");
    const unitsSub = c.unitsSub || (lang === "zh" ? "件數" : "Pcs sold");
    const chartNote = c.chartNote || (lang === "zh" ? "合作期間示意數據 · 請 Bastien 確認最終數字" : "Illustrative partnership figures · confirm final numbers with Bastien");
    return (
      '<div class="slide-inner slide-inner--partner">' +
      '<p class="eyebrow build">' + esc(c.eyebrow || "Novium × Go Boom") + "</p>" +
      '<h2 class="headline build headline--partner">' + esc(c.headline) + "</h2>" +
      '<div class="partner-top">' +
      '<img class="partner-photo build" src="assets/novium-signing.jpg" alt="' + esc(c.photoAlt || "Partnership signing") + '" />' +
      '<div class="partner-points"><h3 class="build">' + esc(pointsTitle) + "</h3><ul>" + points + "</ul></div>" +
      "</div>" +
      '<div class="results">' +
      '<h3 class="build">' + esc(resultTitle) + "</h3>" +
      '<div class="charts">' +
      '<div class="chart build"><div class="chart-title">' + esc(spendTitle) +
      '</div><div class="chart-sub">' + esc(spendSub) + "</div>" + spendSvg +
      '<div class="chart-note">' + esc(chartNote) + "</div></div>" +
      '<div class="chart build"><div class="chart-title">' + esc(unitsTitle) +
      '</div><div class="chart-sub">' + esc(unitsSub) + "</div>" + unitsSvg +
      '<div class="chart-note">' + esc(chartNote) + "</div></div>" +
      "</div></div></div>" + footHtml(idx)
    );
  }

  function renderProcess(s, idx) {
    const c = s[lang] || s.en;
    const steps = (c.steps || []).map(function (st, i) {
      let lis = "";
      if (st.items && st.items.length) {
        lis = "<ul>" + st.items.map(function (it) { return "<li>" + esc(it) + "</li>"; }).join("") + "</ul>";
      } else {
        const bits = [];
        if (st.duration) bits.push("<li>" + esc(st.duration) + "</li>");
        if (st.body) bits.push("<li>" + esc(st.body) + "</li>");
        lis = bits.length ? "<ul>" + bits.join("") + "</ul>" : "";
      }
      return (
        '<div class="step build"><div class="step-n">' + esc(st.n || num2(i + 1)) +
        "</div><h4>" + esc(st.title) + "</h4>" + lis + "</div>"
      );
    }).join("");
    return (
      '<div class="slide-inner">' +
      '<p class="eyebrow build">' + esc(c.eyebrow || "") + "</p>" +
      '<h2 class="headline build" style="font-size:48px;margin-bottom:8px">' + esc(c.headline) + "</h2>" +
      '<div class="process">' + steps + "</div>" +
      (c.ongoing
        ? '<div class="ongoing build"><div class="inf">∞</div><p>' + esc(c.ongoing) + "</p></div>"
        : "") +
      "</div>" + footHtml(idx)
    );
  }

  function renderNeeds(s, idx) {
    const c = s[lang] || s.en;
    const needs = (c.needs || c.items || []).map(function (n) {
      return (
        '<div class="need build"><h4>' + esc(n.title) + "</h4><p>" + esc(n.body) +
        "</p>" + (n.why ? '<p class="why">' + esc(n.why) + "</p>" : "") + "</div>"
      );
    }).join("");
    return (
      '<div class="slide-inner">' +
      '<p class="eyebrow build">' + esc(c.eyebrow || "") + "</p>" +
      '<h2 class="headline build" style="font-size:48px;margin-bottom:8px">' + esc(c.headline) + "</h2>" +
      (c.intro || c.lead
        ? '<p class="lead build" style="margin-top:0;margin-bottom:16px">' + esc(c.intro || c.lead) + "</p>"
        : "") +
      '<div class="needs-grid">' + needs + "</div>" +
      (c.footer ? '<p class="lang-strip build" style="margin-top:18px">' + esc(c.footer) + "</p>" : "") +
      "</div>" + footHtml(idx)
    );
  }

  function renderGet(s, idx) {
    const c = s[lang] || s.en;
    const items = (c.items || []).map(function (it) {
      // support {text, accent} or plain string with |accent|
      if (typeof it === "string") {
        return '<div class="get-item build">' + esc(it) + "</div>";
      }
      return (
        '<div class="get-item build">' + esc(it.before || "") +
        "<span>" + esc(it.accent || "") + "</span>" +
        esc(it.after || "") + "</div>"
      );
    }).join("");
    return (
      symHtml(s.symbol || 6, "sym-side") +
      '<div class="slide-inner">' +
      '<p class="eyebrow build">' + esc(c.eyebrow || "") + "</p>" +
      '<h2 class="headline build" style="font-size:52px">' + esc(c.headline) + "</h2>" +
      '<div class="get-list">' + items + "</div>" +
      "</div>" + footHtml(idx)
    );
  }

  function renderClose(s, idx) {
    const c = s[lang] || s.en;
    const headline = c.headline || c.thanks || "";
    const sub = c.sub || c.cta || "";
    const emails = c.emails || ["bastien@goboom.agency", "guillaume@goboom.agency"];
    return (
      symHtml(1, "sym-bl") +
      '<div class="slide-inner"><div class="close-wrap">' +
      '<h2 class="headline build">' + esc(headline) + "</h2>" +
      '<p class="lead build">' + esc(sub) + "</p>" +
      '<div class="contacts build">' +
      '<a class="web" href="https://www.goboom.agency" target="_blank" rel="noopener">' + esc(c.web || "www.goboom.agency") + "</a>" +
      emails.map(function (em) {
        return '<a href="mailto:' + esc(em) + '">' + esc(em) + "</a>";
      }).join("") +
      (c.phone ? '<span style="color:rgba(255,255,255,0.45);font-size:16px;margin-top:8px">' + esc(c.phone) + "</span>" : "") +
      "</div></div></div>" + footHtml(idx)
    );
  }

  const RENDERERS = {
    title: renderTitle,
    statement: renderStatement,
    europe: renderEurope,
    problems: renderProblems,
    multi: renderMulti,
    positioning: renderPositioning,
    team: renderTeam,
    "why-marketers": renderFeats,
    "what-we-are": renderFeats,
    gtm: renderGtm,
    ops: renderOps,
    "case-timeline": renderCaseTimeline,
    "case-examples": renderCaseExamples,
    partnership: renderPartnership,
    process: renderProcess,
    needs: renderNeeds,
    get: renderGet,
    close: renderClose
  };

  function themeClass(s) {
    if (s.theme === "dark") return "dark";
    if (s.theme === "orange") return "orange";
    if (s.theme === "wash") return "wash";
    return "";
  }

  function build(data) {
    meta = data.meta || {};
    charts = data.charts || {};
    slidesData = data.slides || [];
    stage.innerHTML = "";
    rail.innerHTML = "";
    slideEls = [];

    document.title = t(meta.title) + " · Go Boom";

    slidesData.forEach(function (s, idx) {
      const sec = document.createElement("section");
      sec.className = "slide off-right " + themeClass(s);
      if (s.type === "title" || s.type === "statement") {
        sec.classList.add(s.type === "title" ? "slide-title" : "slide-statement");
      }
      if (s.type === "title") sec.classList.add("dark");
      sec.id = "slide-" + s.id;
      const renderer = RENDERERS[s.type] || renderStatement;
      sec.innerHTML = renderer(s, idx);
      stage.appendChild(sec);
      slideEls.push(sec);

      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "Slide " + (idx + 1));
      dot.addEventListener("click", function () { goTo(idx); });
      rail.appendChild(dot);
    });
  }

  function setActive(i) {
    Array.prototype.forEach.call(rail.children, function (d, di) {
      const on = di === i;
      d.classList.toggle("active", on);
      d.setAttribute("aria-current", on ? "true" : "false");
    });
    const s = slidesData[i];
    const theme = s && (s.type === "title" ? "dark" : (s.theme || "light"));
    document.body.classList.toggle("on-light", theme !== "dark" && theme !== "orange");
    document.body.classList.toggle("on-orange", theme === "orange");
    document.body.classList.toggle("on-dark", theme === "dark" || s.type === "title");
    deck.style.background = "#0A0A0A";
    if (history.replaceState) history.replaceState(null, "", "#" + slidesData[i].id);
    updateProgress();
  }

  function goTo(i, instant) {
    i = Math.max(0, Math.min(slideEls.length - 1, i));
    if (i === current && !instant) return;
    if (animating && !instant) return;
    const dir = i >= current ? 1 : -1;
    const incoming = slideEls[i];
    const outgoing = current >= 0 ? slideEls[current] : null;

    if (instant || reduced) {
      slideEls.forEach(function (el, ei) {
        el.classList.remove("current", "exit-left", "exit-right", "off-left", "off-right");
        if (ei === i) el.classList.add("current");
        else el.classList.add(ei < i ? "off-left" : "off-right");
      });
      current = i;
      setActive(i);
      return;
    }

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
      window.setTimeout(function () {
        outgoing.classList.remove("exit-left", "exit-right");
        outgoing.classList.add(dir > 0 ? "off-left" : "off-right");
      }, 640);
    }
    current = i;
    setActive(i);
    window.setTimeout(function () { animating = false; }, 440);
  }

  function updateProgress() {
    const f = slideEls.length > 1 ? Math.max(0, current) / (slideEls.length - 1) : 0;
    progress.style.setProperty("--p", f.toFixed(4));
  }

  function toggleFs() {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  function setupNav() {
    window.addEventListener("keydown", function (e) {
      if (e.target && e.target.closest && e.target.closest("button, a, input, textarea, [contenteditable]")) {
        if (e.key === " " && e.target.tagName !== "BUTTON") { /* allow */ }
        else if (["INPUT", "TEXTAREA"].indexOf(e.target.tagName) >= 0) return;
      }
      const k = e.key;
      if (k === "ArrowRight" || k === "ArrowDown" || k === "PageDown" || k === " ") {
        e.preventDefault(); goTo(current + 1);
      } else if (k === "ArrowLeft" || k === "ArrowUp" || k === "PageUp") {
        e.preventDefault(); goTo(current - 1);
      } else if (k === "Home") { e.preventDefault(); goTo(0); }
      else if (k === "End") { e.preventDefault(); goTo(slideEls.length - 1); }
      else if (k.toLowerCase() === "f") { toggleFs(); }
      else if (k.toLowerCase() === "c") { document.body.classList.toggle("chrome-off"); }
      else if (k.toLowerCase() === "l") { setLang(lang === "en" ? "zh" : "en"); }
    });

    const fsBtn = document.querySelector(".fs-btn");
    if (fsBtn) fsBtn.addEventListener("click", function () { toggleFs(); fsBtn.blur(); });

    document.querySelectorAll(".lang-btn").forEach(function (b) {
      b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); });
    });

    let wheelLock = false, accum = 0;
    deck.addEventListener("wheel", function (e) {
      e.preventDefault();
      if (wheelLock) return;
      accum += e.deltaY;
      if (Math.abs(accum) < 40) return;
      const d = accum > 0 ? 1 : -1;
      accum = 0; wheelLock = true;
      goTo(current + d);
      window.setTimeout(function () { wheelLock = false; }, 640);
    }, { passive: false });

    let tx = 0;
    deck.addEventListener("touchstart", function (e) {
      tx = e.changedTouches[0].clientX;
    }, { passive: true });
    deck.addEventListener("touchend", function (e) {
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  function deepLinkIndex(hash) {
    if (!hash) return -1;
    const id = hash.slice(1).replace(/^slide-/, "");
    return slidesData.findIndex(function (s) { return s.id === id; });
  }

  // boot
  if (!window.GBC_CONTENT) {
    stage.innerHTML = '<section class="slide current dark"><div class="slide-inner"><h1 class="headline">Missing content.js</h1></div></section>';
    return;
  }
  document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  document.querySelectorAll(".lang-btn").forEach(function (b) {
    const on = b.getAttribute("data-lang") === lang;
    b.classList.toggle("is-active", on);
  });
  document.querySelectorAll("[data-hint]").forEach(function (el) {
    el.hidden = el.getAttribute("data-hint") !== lang;
  });

  build(window.GBC_CONTENT);
  setupNav();
  const start = deepLinkIndex(location.hash);
  goTo(start >= 0 ? start : 0, true);
})();
