(function () {
  "use strict";

  var AC = window.AudioContext || window.webkitAudioContext;
  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return Array.from(document.querySelectorAll(sel)); };
  var gsap = window.gsap;

  var files = {
    music: {
      cruise: "assets/audio/cruise.m4a",
      combat: "assets/audio/combat.m4a",
      stealth: "assets/audio/stealth.m4a",
      warp: "assets/audio/warp.m4a",
      distress: "assets/audio/distress.m4a"
    },
    shots: {
      laser: "assets/audio/laser.m4a",
      torpedo: "assets/audio/torpedo.m4a",
      thruster: "assets/audio/thruster.m4a",
      dock: "assets/audio/dock.m4a",
      hatch: "assets/audio/hatch.m4a",
      lock: "assets/audio/lock.m4a",
      asteroid: "assets/audio/asteroid.m4a"
    },
    loops: {
      engine: "assets/audio/engine.m4a",
      shield: "assets/audio/shield.m4a",
      telemetry: "assets/audio/telemetry.m4a",
      scanner: "assets/audio/scanner.m4a"
    },
    voice: {
      boot: "assets/voice/boot.m4a",
      asteroid: "assets/voice/asteroid.m4a",
      distress: "assets/voice/distress.m4a",
      pirates: "assets/voice/pirates.m4a",
      nebula: "assets/voice/nebula.m4a",
      jump: "assets/voice/jump.m4a"
    }
  };

  var modeMeta = {
    cruise: { title: "Cruise deck", event: "Deep route stable", speed: 0.5 },
    combat: { title: "Combat deck", event: "Battle stations ready", speed: 1.25 },
    stealth: { title: "Stealth deck", event: "Silent running active", speed: 0.35 },
    warp: { title: "Warp deck", event: "Jump corridor armed", speed: 2.1 }
  };

  var events = [
    {
      tag: "Asteroid field",
      text: "Warning. Asteroid field detected. Recommend evasive maneuvers.",
      voice: "asteroid",
      shot: "asteroid",
      mode: "combat"
    },
    {
      tag: "Distress signal",
      text: "Distress signal acquired. Tune the array to lock coordinates.",
      voice: "distress",
      music: "distress",
      shot: "telemetry"
    },
    {
      tag: "Unknown vessel",
      text: "Unknown vessel on intercept course. Shields recommended.",
      voice: "pirates",
      shot: "lock",
      mode: "combat"
    },
    {
      tag: "Nebula drift",
      text: "Nebula cloud ahead. Sensors degraded. Proceed quietly.",
      voice: "nebula",
      shot: "hatch",
      mode: "stealth"
    }
  ];

  var els = {};
  var state = {
    mode: "cruise",
    muted: false,
    musicLevel: 0.42,
    fxLevel: 0.78,
    signalOn: false,
    pad: { x: 0.52, y: 0.46 },
    starSpeed: 0.5
  };

  var audio = {
    ctx: null,
    buffers: {},
    music: null,
    scanner: null,
    loops: {},
    master: null,
    musicBus: null,
    fxBus: null,
    voiceBus: null,
    scannerNodes: null,
    async init() {
      if (!AC) throw new Error("Web Audio is unavailable.");
      if (!this.ctx) {
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.musicBus = this.ctx.createGain();
        this.fxBus = this.ctx.createGain();
        this.voiceBus = this.ctx.createGain();
        this.master.gain.value = 1;
        this.musicBus.gain.value = state.musicLevel;
        this.fxBus.gain.value = state.fxLevel;
        this.voiceBus.gain.value = 0.95;
        this.musicBus.connect(this.master);
        this.fxBus.connect(this.master);
        this.voiceBus.connect(this.master);
        this.master.connect(this.ctx.destination);
      }
      if (this.ctx.state === "suspended") await this.ctx.resume();
      await this.loadAll();
    },
    async loadAll() {
      var flat = {};
      Object.keys(files).forEach(function (group) {
        Object.keys(files[group]).forEach(function (id) {
          flat[group + ":" + id] = files[group][id];
        });
      });
      var self = this;
      await Promise.all(Object.keys(flat).map(async function (id) {
        if (self.buffers[id]) return;
        var res = await fetch(flat[id]);
        if (!res.ok) throw new Error("Audio missing: " + flat[id]);
        var data = await res.arrayBuffer();
        self.buffers[id] = await self.ctx.decodeAudioData(data);
      }));
    },
    makeSource(key, bus, opts) {
      opts = opts || {};
      var source = this.ctx.createBufferSource();
      source.buffer = this.buffers[key];
      source.loop = !!opts.loop;
      source.playbackRate.value = opts.rate || 1;
      var gain = this.ctx.createGain();
      gain.gain.value = opts.level == null ? 1 : opts.level;
      source.connect(gain);
      gain.connect(bus);
      return { source: source, gain: gain };
    },
    playShot(id, level) {
      var key = this.buffers["shots:" + id] ? "shots:" + id : "loops:" + id;
      if (!this.buffers[key]) return;
      var node = this.makeSource(key, this.fxBus, { level: level == null ? 0.9 : level });
      node.source.start();
      node.source.stop(this.ctx.currentTime + this.buffers[key].duration + 0.1);
    },
    playVoice(id) {
      var key = "voice:" + id;
      if (!this.buffers[key]) return;
      var node = this.makeSource(key, this.voiceBus, { level: 1 });
      node.source.start();
      node.source.stop(this.ctx.currentTime + this.buffers[key].duration + 0.1);
    },
    playMode(mode) {
      var key = "music:" + mode;
      if (!this.buffers[key]) return;
      var now = this.ctx.currentTime;
      var next = this.makeSource(key, this.musicBus, { loop: true, level: 0.0001 });
      next.source.start();
      next.gain.gain.exponentialRampToValueAtTime(1, now + 0.9);
      if (this.music) {
        var old = this.music;
        old.gain.gain.setTargetAtTime(0.0001, now, 0.22);
        window.setTimeout(function () {
          try { old.source.stop(); } catch (err) {}
        }, 900);
      }
      this.music = next;
    },
    playTemporaryMusic(id, ms) {
      var self = this;
      this.playMode(id);
      window.clearTimeout(this.tempMusicTimer);
      this.tempMusicTimer = window.setTimeout(function () {
        self.playMode(state.mode);
      }, ms || 12000);
    },
    toggleLoop(id, on) {
      if (on && !this.loops[id]) {
        var node = this.makeSource("loops:" + id, this.fxBus, { loop: true, level: 0.0001 });
        node.source.start();
        node.gain.gain.exponentialRampToValueAtTime(id === "engine" ? 0.44 : 0.34, this.ctx.currentTime + 0.45);
        this.loops[id] = node;
      } else if (!on && this.loops[id]) {
        var old = this.loops[id];
        old.gain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.12);
        window.setTimeout(function () {
          try { old.source.stop(); } catch (err) {}
        }, 380);
        delete this.loops[id];
      }
    },
    setMusicLevel(value) {
      state.musicLevel = Number(value);
      this.musicBus.gain.setTargetAtTime(state.musicLevel, this.ctx.currentTime, 0.04);
    },
    setFxLevel(value) {
      state.fxLevel = Number(value);
      this.fxBus.gain.setTargetAtTime(state.fxLevel, this.ctx.currentTime, 0.04);
    },
    setMute(value) {
      state.muted = !!value;
      this.master.gain.setTargetAtTime(state.muted ? 0 : 1, this.ctx.currentTime, 0.04);
    },
    startScanner() {
      if (this.scanner) return;
      var source = this.ctx.createBufferSource();
      source.buffer = this.buffers["loops:scanner"];
      source.loop = true;
      var filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1600;
      filter.Q.value = 2.2;
      var delay = this.ctx.createDelay(0.6);
      delay.delayTime.value = 0.12;
      var feedback = this.ctx.createGain();
      feedback.gain.value = 0.12;
      var drive = this.ctx.createWaveShaper();
      drive.curve = distortionCurve(60);
      var gain = this.ctx.createGain();
      gain.gain.value = 0.0001;
      source.connect(filter);
      filter.connect(drive);
      drive.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(gain);
      gain.connect(this.fxBus);
      source.start();
      gain.gain.exponentialRampToValueAtTime(0.48, this.ctx.currentTime + 0.35);
      this.scanner = { source: source, filter: filter, delay: delay, feedback: feedback, drive: drive, gain: gain };
      this.updateScanner(state.pad.x, state.pad.y);
    },
    stopScanner() {
      if (!this.scanner) return;
      var node = this.scanner;
      node.gain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.12);
      window.setTimeout(function () {
        try { node.source.stop(); } catch (err) {}
      }, 380);
      this.scanner = null;
    },
    updateScanner(x, y) {
      state.pad.x = clamp(x, 0, 1);
      state.pad.y = clamp(y, 0, 1);
      if (!this.scanner) return;
      var now = this.ctx.currentTime;
      this.scanner.filter.frequency.setTargetAtTime(320 + state.pad.x * 6200, now, 0.04);
      this.scanner.filter.Q.setTargetAtTime(0.8 + state.pad.y * 8, now, 0.04);
      this.scanner.delay.delayTime.setTargetAtTime(0.04 + state.pad.x * 0.34, now, 0.04);
      this.scanner.feedback.gain.setTargetAtTime(0.04 + state.pad.y * 0.42, now, 0.04);
      this.scanner.drive.curve = distortionCurve(35 + state.pad.y * 220);
    }
  };

  function distortionCurve(amount) {
    var samples = 256;
    var curve = new Float32Array(samples);
    var deg = Math.PI / 180;
    for (var i = 0; i < samples; i++) {
      var x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function bind() {
    els.start = $("#start");
    els.startButton = $("#startButton");
    els.bridge = $("#bridge");
    els.startStatus = $("#startStatus");
    els.modeTitle = $("#modeTitle");
    els.eventTag = $("#eventTag");
    els.eventText = $("#eventText");
    els.mute = $("#mute");
    els.signalPower = $("#signalPower");
    els.signalPad = $("#signalPad");
    els.signalDot = $("#signalDot");
    els.eventButton = $("#eventButton");
    els.jumpButton = $("#jumpButton");
    els.musicLevel = $("#musicLevel");
    els.fxLevel = $("#fxLevel");

    els.startButton.addEventListener("click", boot);
    els.mute.addEventListener("click", function () {
      state.muted = !state.muted;
      audio.setMute(state.muted);
      els.mute.textContent = state.muted ? "Muted" : "Audio on";
      els.mute.setAttribute("aria-pressed", String(state.muted));
    });
    $("#modes").addEventListener("click", function (event) {
      var button = event.target.closest("[data-mode]");
      if (!button) return;
      setMode(button.dataset.mode, true);
    });
    $$(".action").forEach(function (button) {
      button.addEventListener("click", function () {
        tap(button);
        audio.playShot(button.dataset.shot);
        updateEvent("Manual control", button.querySelector("strong").textContent + " fired.");
      });
    });
    $$(".system-toggle").forEach(function (button) {
      button.addEventListener("click", function () {
        var id = button.dataset.toggle;
        var on = !button.classList.contains("on");
        button.classList.toggle("on", on);
        tap(button);
        audio.toggleLoop(id, on);
        audio.playShot(on ? "hatch" : "lock", 0.55);
        updateEvent("System " + (on ? "online" : "offline"), button.querySelector("span").textContent + (on ? " engaged." : " disengaged."));
      });
    });
    els.signalPower.addEventListener("click", toggleSignal);
    els.eventButton.addEventListener("click", triggerEvent);
    els.jumpButton.addEventListener("click", jump);
    els.musicLevel.addEventListener("input", function (event) { audio.setMusicLevel(event.target.value); });
    els.fxLevel.addEventListener("input", function (event) { audio.setFxLevel(event.target.value); });
    bindSignalPad();
  }

  async function boot() {
    els.startButton.disabled = true;
    els.startStatus.textContent = "Charging audio core...";
    if (gsap) gsap.to(".start-orbit", { scale: 0.94, duration: 0.18, ease: "power4.out", yoyo: true, repeat: 1 });
    try {
      await audio.init();
      els.startStatus.textContent = "Opening bridge...";
      audio.setMusicLevel(els.musicLevel.value);
      audio.setFxLevel(els.fxLevel.value);
      audio.playVoice("boot");
      audio.playMode("cruise");
      state.starSpeed = modeMeta.cruise.speed;
      els.start.hidden = true;
      els.bridge.hidden = false;
      entrance();
    } catch (err) {
      els.startButton.disabled = false;
      els.startStatus.textContent = "Audio file missing. Refresh and try again.";
      console.error(err);
    }
  }

  function entrance() {
    if (!gsap) return;
    gsap.from(".topbar, .viewport, .modes, .instrument, .systems, .actions, .mission, .mix", {
      opacity: 0,
      y: 18,
      duration: 0.7,
      stagger: 0.055,
      ease: "power4.out"
    });
    gsap.from(".target-ring i", {
      scale: 0.4,
      opacity: 0,
      duration: 0.8,
      stagger: 0.08,
      ease: "power4.out"
    });
  }

  function setMode(mode, playMusic) {
    state.mode = mode;
    document.querySelector(".cockpit").dataset.mode = mode;
    $$(".mode").forEach(function (button) {
      button.classList.toggle("active", button.dataset.mode === mode);
    });
    els.modeTitle.textContent = modeMeta[mode].title;
    updateEvent("Mode changed", modeMeta[mode].event + ".");
    state.starSpeed = modeMeta[mode].speed;
    if (playMusic) audio.playMode(mode);
    if (gsap) {
      gsap.fromTo(".viewport", { scale: 0.985 }, { scale: 1, duration: 0.42, ease: "power4.out" });
      gsap.fromTo(".target-ring", { rotate: -12, scale: 0.86 }, { rotate: 0, scale: 1, duration: 0.62, ease: "power4.out" });
    }
  }

  function toggleSignal() {
    state.signalOn = !state.signalOn;
    if (state.signalOn) {
      audio.startScanner();
      els.signalPower.textContent = "Array on";
      els.signalPower.setAttribute("aria-pressed", "true");
      updateEvent("Array online", "Drag the signal pad to bend delay and distortion.");
    } else {
      audio.stopScanner();
      els.signalPower.textContent = "Array off";
      els.signalPower.setAttribute("aria-pressed", "false");
      updateEvent("Array offline", "Signal processing stopped.");
    }
    tap(els.signalPower);
  }

  function bindSignalPad() {
    var dragging = false;
    function setFromPoint(clientX, clientY) {
      var rect = els.signalPad.getBoundingClientRect();
      var x = clamp((clientX - rect.left) / rect.width, 0, 1);
      var y = clamp((clientY - rect.top) / rect.height, 0, 1);
      audio.updateScanner(x, y);
      els.signalPad.setAttribute("aria-valuenow", String(Math.round(x * 100)));
      if (gsap) {
        gsap.to(els.signalDot, {
          left: x * 100 + "%",
          top: y * 100 + "%",
          duration: 0.18,
          ease: "power4.out"
        });
      } else {
        els.signalDot.style.left = x * 100 + "%";
        els.signalDot.style.top = y * 100 + "%";
      }
    }
    els.signalPad.addEventListener("pointerdown", function (event) {
      dragging = true;
      els.signalPad.setPointerCapture(event.pointerId);
      if (!state.signalOn) toggleSignal();
      setFromPoint(event.clientX, event.clientY);
    });
    els.signalPad.addEventListener("pointermove", function (event) {
      if (!dragging) return;
      setFromPoint(event.clientX, event.clientY);
    });
    els.signalPad.addEventListener("pointerup", function () {
      dragging = false;
    });
    els.signalPad.addEventListener("pointercancel", function () {
      dragging = false;
    });
  }

  function triggerEvent() {
    var event = events[Math.floor(Math.random() * events.length)];
    tap(els.eventButton);
    updateEvent(event.tag, event.text);
    if (event.mode) setMode(event.mode, true);
    if (event.music) audio.playTemporaryMusic(event.music, 15000);
    if (event.voice) audio.playVoice(event.voice);
    if (event.shot) {
      window.setTimeout(function () { audio.playShot(event.shot, 0.8); }, 260);
    }
    if (gsap) {
      gsap.fromTo(".ship-readout", { y: 10, opacity: 0.2 }, { y: 0, opacity: 1, duration: 0.45, ease: "power4.out" });
      gsap.fromTo(".viewport", { filter: "brightness(1.45)" }, { filter: "brightness(1)", duration: 0.9, ease: "power4.out" });
    }
  }

  function jump() {
    tap(els.jumpButton);
    audio.playVoice("jump");
    audio.playShot("thruster", 0.8);
    setMode("warp", true);
    state.starSpeed = 3.2;
    updateEvent("Warp window", "Jump lane open. Hold on.");
    if (gsap) {
      gsap.fromTo(".target-ring", { scale: 0.5, opacity: 0.25 }, { scale: 1.18, opacity: 1, duration: 0.62, ease: "power4.out" });
      gsap.fromTo(".viewport", { scale: 0.99 }, { scale: 1, duration: 0.7, ease: "power4.out" });
    }
    window.setTimeout(function () {
      state.starSpeed = modeMeta.warp.speed;
    }, 2500);
  }

  function updateEvent(tag, text) {
    els.eventTag.textContent = tag;
    els.eventText.textContent = text;
  }

  function tap(el) {
    if (!gsap) return;
    gsap.fromTo(el, { scale: 0.965 }, { scale: 1, duration: 0.28, ease: "power4.out" });
  }

  function initCanvas() {
    var canvas = $("#space");
    var ctx = canvas.getContext("2d");
    var scope = $("#signalScope").getContext("2d");
    var stars = [];
    var w = 0;
    var h = 0;
    var phase = 0;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var signalCanvas = $("#signalScope");
      var rect = signalCanvas.getBoundingClientRect();
      signalCanvas.width = Math.max(1, rect.width) * dpr;
      signalCanvas.height = Math.max(1, rect.height) * dpr;
      scope.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = [];
      for (var i = 0; i < Math.floor((w * h) / 5600); i++) {
        stars.push({ x: Math.random() * w, y: Math.random() * h, z: Math.random(), s: Math.random() * 1.4 + 0.4 });
      }
    }

    function draw() {
      phase += 0.018;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(10, 14, 22, 0.42)";
      ctx.fillRect(0, 0, w, h);
      var speed = state.starSpeed || 0.5;
      ctx.save();
      for (var i = 0; i < stars.length; i++) {
        var st = stars[i];
        var prevY = st.y;
        st.y += (0.35 + st.z * 1.8) * speed;
        if (st.y > h + 20) {
          st.y = -20;
          st.x = Math.random() * w;
        }
        var color = getComputedStyle(document.querySelector(".cockpit")).getPropertyValue("--accent").trim();
        ctx.globalAlpha = 0.25 + st.z * 0.72;
        ctx.fillStyle = speed > 1.8 ? color : "rgba(220, 232, 255, 0.86)";
        if (speed > 1.4) {
          ctx.strokeStyle = color;
          ctx.lineWidth = st.s;
          ctx.beginPath();
          ctx.moveTo(st.x, prevY);
          ctx.lineTo(st.x, st.y + speed * 10);
          ctx.stroke();
        } else {
          ctx.fillRect(st.x, st.y, st.s, st.s);
        }
      }
      ctx.restore();
      drawSignalScope();
      requestAnimationFrame(draw);
    }

    function drawSignalScope() {
      var signalCanvas = $("#signalScope");
      var rect = signalCanvas.getBoundingClientRect();
      var ww = rect.width;
      var hh = rect.height;
      scope.clearRect(0, 0, ww, hh);
      var accent = getComputedStyle(document.querySelector(".cockpit")).getPropertyValue("--accent").trim();
      scope.strokeStyle = accent;
      scope.lineWidth = 1.4;
      scope.globalAlpha = state.signalOn ? 0.9 : 0.32;
      scope.beginPath();
      for (var x = 0; x <= ww; x += 3) {
        var amp = state.signalOn ? 12 + state.pad.y * 34 : 4;
        var y = hh / 2 + Math.sin(x * (0.035 + state.pad.x * 0.08) + phase * 9) * amp + (state.signalOn ? (Math.random() - 0.5) * 7 : 0);
        if (x === 0) scope.moveTo(x, y);
        else scope.lineTo(x, y);
      }
      scope.stroke();
      scope.globalAlpha = 1;
    }

    window.addEventListener("resize", resize);
    resize();
    draw();
  }

  document.addEventListener("DOMContentLoaded", function () {
    bind();
    initCanvas();
  });
})();
