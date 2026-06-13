/* ============================================================
   BATRES — monolith.js (V3)
   Hero: cinematic dolly through the seam.
   Desktop: 97-frame scrub sequence driven by the pinned scroll
   (the scroll is the camera). Touch/small: ambient video loop.
   Reduced motion / no JS motion stack: static poster.
   ============================================================ */

(function () {
  'use strict';

  var host = document.querySelector('.hero-canvas');
  if (!host) return;

  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;
  var small = window.matchMedia('(max-width: 860px)').matches;

  /* ---------- static fallback ---------- */
  if (reduced || !hasGsap) {
    var still = document.createElement('img');
    still.src = '/assets/gen/hero-poster.webp';
    still.alt = '';
    host.appendChild(still);
    return;
  }

  /* ---------- touch / small: ambient loop, no scrub ---------- */
  if (coarse || small) {
    var v = document.createElement('video');
    v.src = '/assets/gen/vid-hero-mobile.mp4';
    v.poster = '/assets/gen/hero-poster.webp';
    v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    v.preload = 'auto';
    host.appendChild(v);
    var tryPlay = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    tryPlay();
    document.addEventListener('visibilitychange', function () { if (!document.hidden) tryPlay(); });
    return;
  }

  /* ---------- desktop: frame scrub ---------- */
  var N = 97;
  var frames = new Array(N);
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  host.appendChild(canvas);

  var cur = -1;
  var target = 0;

  function nearest(idx) {
    for (var i = idx; i >= 0; i--) if (frames[i] && frames[i].naturalWidth) return i;
    for (var j = idx + 1; j < N; j++) if (frames[j] && frames[j].naturalWidth) return j;
    return -1;
  }

  function draw(force) {
    var idx = nearest(Math.max(0, Math.min(N - 1, Math.round(target))));
    if (idx < 0 || (idx === cur && !force)) return;
    cur = idx;
    var img = frames[idx];
    var cw = canvas.width, ch = canvas.height;
    var ir = img.naturalWidth / img.naturalHeight, cr = cw / ch;
    var dw, dh;
    if (cr > ir) { dw = cw; dh = cw / ir; } else { dh = ch; dw = ch * ir; }
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }

  function size() {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    /* never exceed the source frame width — upscaled buffers only blur */
    var w = Math.min(Math.round(host.clientWidth * dpr), 1920);
    canvas.width = w;
    canvas.height = Math.round(w * host.clientHeight / host.clientWidth);
    draw(true);
  }
  window.addEventListener('resize', size);

  /* progressive load: pass 0 grabs every 8th frame so scrubbing is
     usable almost immediately; later passes fill the gaps */
  var order = [];
  for (var s = 0; s < 8; s++) for (var i = s; i < N; i += 8) order.push(i);
  var ptr = 0, inflight = 0, MAXC = 6;
  function pump() {
    while (inflight < MAXC && ptr < order.length) {
      (function (idx) {
        inflight++;
        var im = new Image();
        im.onload = im.onerror = function () { inflight--; draw(true); pump(); };
        im.src = '/assets/gen/heroseq/f-' + String(idx + 1).padStart(3, '0') + '.webp';
        frames[idx] = im;
      })(order[ptr++]);
    }
  }
  pump();
  size();

  gsap.registerPlugin(ScrollTrigger);

  var hero = document.querySelector('.hero');
  var inner = document.querySelector('.hero-inner');
  var hint = document.querySelector('.hero-scroll-hint');
  var meta = document.querySelector('.hero-meta');

  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: '+=220%',
    pin: true,
    scrub: 0.5,
    onUpdate: function (self) {
      var p = self.progress;
      target = p * (N - 1);
      draw();

      var f = Math.max(0, 1 - p / 0.18);
      if (inner) { inner.style.opacity = f; inner.style.transform = 'translateY(' + (-p * 140) + 'px)'; }
      if (hint) hint.style.opacity = f;
      if (meta) meta.style.opacity = f;

      /* the camera passes through the seam into light — the page follows */
      if (window.BC) window.BC.actOverride = p >= 0.86 ? 'light' : null;

      host.style.opacity = p > 0.92 ? Math.max(0, 1 - (p - 0.92) / 0.08) : 1;
    }
  });

  /* this pin is the last trigger created — re-sort so every earlier
     trigger picks up the pin spacers on the next refresh */
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
})();
