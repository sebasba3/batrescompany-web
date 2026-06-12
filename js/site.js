/* ============================================================
   BATRES COMPANY LIMITED — site.js (V2)
   Motion core: Lenis smooth scroll + GSAP ScrollTrigger,
   act morphing (dark↔light), preloader, page transitions,
   custom cursor, split-line headlines, reveals, parallax,
   marquee velocity, shared WebGL scene registry.
   ============================================================ */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  /* ---------- shared scene registry (used by monolith.js / scenes.js) ---------- */
  var scenes = [];
  window.BC = {
    reduced: reduced,
    coarse: coarse,
    velocity: 0,
    addScene: function (scene) {
      // scene: { el, render(dt, t, p, v), renderOnce() }
      scene.p = 0;
      scene.active = false;
      scenes.push(scene);
      if (reduced) { if (scene.renderOnce) scene.renderOnce(); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { scene.active = en.isIntersecting; });
      }, { rootMargin: '140px' });
      io.observe(scene.el);
      if (hasGsap) {
        ScrollTrigger.create({
          trigger: scene.el,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: function (self) { scene.p = self.progress; }
        });
      }
    }
  };

  /* ---------- clock (GMT-6) ---------- */
  function tickClock() {
    var els = document.querySelectorAll('[data-clock]');
    if (!els.length) return;
    var now = new Date(Date.now() - 6 * 3600 * 1000);
    var s = now.toISOString().slice(11, 19) + ' GMT-6';
    els.forEach(function (el) { el.textContent = s; });
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ---------- mobile menu ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        document.body.classList.remove('menu-open');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') document.body.classList.remove('menu-open');
    });
  }

  /* ---------- contact form (Web3Forms) ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = document.getElementById('submit-btn');
      var ok = document.getElementById('form-ok');
      var err = document.getElementById('form-err');
      ok.hidden = true; err.hidden = true;
      var label = btn.textContent;
      btn.textContent = 'ENVIANDO…'; btn.disabled = true;
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      }).then(function (r) { return r.json(); }).then(function (data) {
        if (data.success) { ok.hidden = false; form.reset(); }
        else { err.hidden = false; }
      }).catch(function () { err.hidden = false; })
        .finally(function () { btn.textContent = label; btn.disabled = false; });
    });
  }

  /* ---------- autoplay videos: pause offscreen, resume in view ---------- */
  document.querySelectorAll('video[autoplay]').forEach(function (v) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { rootMargin: '120px' });
    io.observe(v);
  });

  /* ================= no-motion fallback ================= */
  if (!hasGsap || reduced) {
    var pl = document.querySelector('.preloader');
    if (pl) pl.style.display = 'none';
    window.addEventListener('scroll', function () {
      var h = document.querySelector('.site-header');
      if (h) h.classList.toggle('is-scrolled', window.scrollY > 48);
    }, { passive: true });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  if (typeof window.Lenis !== 'undefined' && !coarse) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', function (e) {
      window.BC.velocity = e.velocity || 0;
      ScrollTrigger.update();
    });
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- WebGL render loop (single ticker) ---------- */
  var last = performance.now() / 1000;
  gsap.ticker.add(function (time) {
    var dt = Math.min(time - last, 0.05);
    last = time;
    if (document.hidden) return;
    for (var i = 0; i < scenes.length; i++) {
      var s = scenes[i];
      if (s.active) s.render(dt, time, s.p, window.BC.velocity);
    }
  });

  /* ---------- act morphing (dark <-> light) ---------- */
  var ACTS = {
    dark: { '--bg': '#0F0F0E', '--fg': '#F4F3F0', '--muted': '#8E8C87', '--hair': 'rgba(140,138,130,0.28)', '--card': '#161614' },
    light: { '--bg': '#F5F5F2', '--fg': '#1A1A1A', '--muted': '#6B6B6B', '--hair': 'rgba(26,26,26,0.14)', '--card': '#FFFFFF' }
  };
  var currentAct = null;
  function applyAct(act, instant) {
    if (act === currentAct) return;
    currentAct = act;
    document.body.classList.toggle('on-dark', act === 'dark');
    var vars = Object.assign({}, ACTS[act]);
    if (instant) { gsap.set(document.body, vars); }
    else { gsap.to(document.body, Object.assign({ duration: 0.8, ease: 'power2.inOut', overwrite: 'auto' }, vars)); }
  }
  window.BC.applyAct = applyAct;
  window.BC.actOverride = null; /* set by monolith.js while the camera passes into light */
  /* act detection via live rects (52% viewport line) — pin/spacer-proof,
     unlike section ScrollTriggers whose positions break inside long pins */
  var actSections = Array.prototype.slice.call(document.querySelectorAll('[data-act]'));
  if (actSections.length) {
    applyAct(actSections[0].getAttribute('data-act'), true);
    gsap.ticker.add(function () {
      var line = window.innerHeight * 0.52;
      var winner = null;
      for (var i = 0; i < actSections.length; i++) {
        var r = actSections[i].getBoundingClientRect();
        if (r.top <= line && r.bottom >= line) winner = actSections[i];
      }
      if (!winner) return;
      var act = winner.getAttribute('data-act');
      if (winner.classList.contains('hero') && window.BC.actOverride) act = window.BC.actOverride;
      applyAct(act);
    });
  }

  /* ---------- header + progress ---------- */
  var header = document.querySelector('.site-header');
  var progress = document.querySelector('.progress-bar');
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: function (self) {
      if (header) header.classList.toggle('is-scrolled', self.scroll() > 48);
      if (progress) progress.style.width = (self.progress * 100) + '%';
    }
  });

  /* ---------- split-line headlines ---------- */
  function splitLines(el) {
    var tokens = [];
    el.childNodes.forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/\s+/).forEach(function (w) { if (w) tokens.push({ t: w, cls: '' }); });
      } else if (node.nodeName === 'BR') {
        tokens.push({ br: true });
      } else {
        var cls = node.className || '';
        node.textContent.split(/\s+/).forEach(function (w) { if (w) tokens.push({ t: w, cls: cls }); });
      }
    });
    el.innerHTML = tokens.map(function (tok) {
      if (tok.br) return '<br>';
      return '<span class="sw' + (tok.cls ? ' ' + tok.cls : '') + '">' + tok.t + '</span>';
    }).join(' ');

    var words = Array.prototype.slice.call(el.querySelectorAll('.sw'));
    var lines = [], cur = [], top = null;
    words.forEach(function (w) {
      var t = w.offsetTop;
      if (top === null || Math.abs(t - top) < 5) { cur.push(w); if (top === null) top = t; }
      else { lines.push(cur); cur = [w]; top = t; }
    });
    if (cur.length) lines.push(cur);

    var out = [];
    lines.forEach(function (lineWords) {
      var lineWrap = document.createElement('span');
      lineWrap.className = 'split-line';
      var inner = document.createElement('span');
      lineWrap.appendChild(inner);
      lineWords[0].parentNode.insertBefore(lineWrap, lineWords[0]);
      lineWords.forEach(function (w, i) {
        inner.appendChild(w);
        if (i < lineWords.length - 1) inner.appendChild(document.createTextNode(' '));
      });
      out.push(inner);
    });
    el.querySelectorAll('br').forEach(function (br) { br.remove(); });
    return out;
  }

  document.querySelectorAll('[data-split]').forEach(function (el) {
    var inners = splitLines(el);
    gsap.set(inners, { yPercent: 112 });
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: function () {
        gsap.to(inners, { yPercent: 0, duration: 1.05, stagger: 0.09, ease: 'power4.out' });
      }
    });
  });

  /* ---------- reveals ---------- */
  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    if (el.getAttribute('data-reveal') === 'line') {
      gsap.set(el, { scaleX: 0 });
      ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: function () { gsap.to(el, { scaleX: 1, duration: 1.1, ease: 'power3.inOut' }); }
      });
    } else {
      var delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10) / 1000;
      gsap.set(el, { y: 30, opacity: 0 });
      ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: function () { gsap.to(el, { y: 0, opacity: 1, duration: 0.9, delay: delay, ease: 'power3.out' }); }
      });
    }
  });

  /* ---------- parallax ---------- */
  document.querySelectorAll('[data-parallax]').forEach(function (el) {
    var amt = parseFloat(el.getAttribute('data-parallax') || '0.1');
    gsap.to(el, {
      yPercent: amt * 100,
      ease: 'none',
      scrollTrigger: { trigger: el.parentNode, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });
  document.querySelectorAll('.backdrop-img').forEach(function (el) {
    gsap.fromTo(el, { yPercent: -8 }, {
      yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: el.parentNode, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* ---------- footer giant reveal ---------- */
  var giant = document.querySelector('.footer-giant');
  if (giant) {
    gsap.fromTo(giant, { yPercent: 36 }, {
      yPercent: 0, ease: 'none',
      scrollTrigger: { trigger: giant, start: 'top bottom', end: 'bottom bottom', scrub: true }
    });
  }

  /* ---------- marquee (velocity-reactive) ---------- */
  var track = document.querySelector('.marquee-track');
  if (track && track.animate) {
    var anim = track.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }],
      { duration: 46000, iterations: Infinity }
    );
    gsap.ticker.add(function () {
      var target = 1 + Math.min(Math.abs(window.BC.velocity) * 0.06, 4);
      anim.playbackRate += (target - anim.playbackRate) * 0.08;
    });
  }

  /* ---------- custom cursor ---------- */
  if (!coarse) {
    var dot = document.createElement('div'); dot.className = 'cursor-dot';
    var ring = document.createElement('div'); ring.className = 'cursor-ring';
    document.body.appendChild(dot); document.body.appendChild(ring);
    document.body.classList.add('cursor-on');
    var cx = -100, cy = -100, rx = -100, ry = -100;
    window.addEventListener('pointermove', function (e) { cx = e.clientX; cy = e.clientY; }, { passive: true });
    gsap.ticker.add(function () {
      rx += (cx - rx) * 0.16; ry += (cy - ry) * 0.16;
      dot.style.transform = 'translate(' + (cx - 3) + 'px,' + (cy - 3) + 'px)';
      ring.style.transform = 'translate(' + (rx - 17) + 'px,' + (ry - 17) + 'px)';
    });
    document.addEventListener('pointerover', function (e) {
      if (e.target.closest('a, button, [data-cursor]')) document.body.classList.add('cursor-hover');
    });
    document.addEventListener('pointerout', function (e) {
      if (e.target.closest('a, button, [data-cursor]')) document.body.classList.remove('cursor-hover');
    });
    document.querySelectorAll('.btn').forEach(function (btn) {
      var qx = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' });
      var qy = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' });
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        qx((e.clientX - r.left - r.width / 2) * 0.22);
        qy((e.clientY - r.top - r.height / 2) * 0.3);
      });
      btn.addEventListener('pointerleave', function () { qx(0); qy(0); });
    });
  }

  /* ---------- services index hover preview (inicio) ---------- */
  var svcIndex = document.querySelector('.svc-index');
  if (svcIndex && !coarse) {
    var prev = document.createElement('div');
    prev.className = 'svc-preview';
    var rows = svcIndex.querySelectorAll('.svc-row[data-preview]');
    rows.forEach(function (row) {
      var img = document.createElement('img');
      img.src = row.getAttribute('data-preview');
      img.alt = '';
      prev.appendChild(img);
    });
    if (rows.length) {
      document.body.appendChild(prev);
      var imgs = prev.querySelectorAll('img');
      var px = gsap.quickTo(prev, 'x', { duration: 0.5, ease: 'power3.out' });
      var py = gsap.quickTo(prev, 'y', { duration: 0.5, ease: 'power3.out' });
      rows.forEach(function (row, i) {
        row.addEventListener('pointerenter', function () {
          imgs.forEach(function (im, j) { im.classList.toggle('is-on', i === j); });
          gsap.to(prev, { opacity: 1, scale: 1, duration: 0.35, ease: 'power3.out', overwrite: 'auto' });
        });
        row.addEventListener('pointerleave', function () {
          gsap.to(prev, { opacity: 0, scale: 0.94, duration: 0.3, ease: 'power3.out', overwrite: 'auto' });
        });
      });
      window.addEventListener('pointermove', function (e) {
        px(e.clientX + 28);
        py(e.clientY - 110);
      }, { passive: true });
      gsap.set(prev, { opacity: 0, scale: 0.94 });
    }
  }

  /* ---------- método: horizontal scroll deck (inicio) ---------- */
  var hwrap = document.querySelector('.hscroll');
  var htrack = document.querySelector('.hscroll-track');
  if (hwrap && htrack) {
    var hmm = gsap.matchMedia();
    hmm.add('(min-width: 861px)', function () {
      var sec = document.querySelector('.method-sec');
      var dist = function () { return Math.max(0, htrack.scrollWidth - hwrap.clientWidth); };
      var tween = gsap.to(htrack, {
        x: function () { return -dist(); },
        ease: 'none',
        scrollTrigger: {
          trigger: sec,
          start: 'top top',
          end: function () { return '+=' + dist(); },
          pin: true,
          scrub: 0.5,
          invalidateOnRefresh: true
        }
      });
      return function () { tween.scrollTrigger && tween.scrollTrigger.kill(); tween.kill(); gsap.set(htrack, { x: 0 }); };
    });
  }

  /* ---------- timeline progress (nosotros) ---------- */
  var tlProg = document.querySelector('.timeline-progress');
  if (tlProg) {
    gsap.fromTo(tlProg, { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: tlProg.parentNode, start: 'top 70%', end: 'bottom 60%', scrub: true }
    });
  }

  /* ---------- pillar stack scale (nosotros) ---------- */
  var pillars = document.querySelectorAll('.pillar');
  if (pillars.length > 1) {
    pillars.forEach(function (p, i) {
      if (i === pillars.length - 1) return;
      gsap.to(p, {
        scale: 0.94, opacity: 0.55, ease: 'none',
        scrollTrigger: {
          trigger: pillars[i + 1],
          start: 'top bottom',
          end: 'top top+=200',
          scrub: true
        }
      });
    });
  }

  /* ---------- page transitions ---------- */
  var curtain = document.createElement('div');
  curtain.className = 'pt-curtain';
  document.body.appendChild(curtain);

  var cameThrough = false;
  try { cameThrough = sessionStorage.getItem('bc-pt') === '1'; sessionStorage.removeItem('bc-pt'); } catch (e) {}
  if (cameThrough) {
    gsap.set(curtain, { scaleY: 1, transformOrigin: 'bottom' });
    gsap.to(curtain, { scaleY: 0, duration: 0.65, ease: 'power3.inOut', delay: 0.1 });
  }

  document.querySelectorAll('a[href^="/"]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (a.target === '_blank' || href.indexOf('#') === 0) return;
    a.addEventListener('click', function (e) {
      var current = location.pathname.replace(/\/$/, '');
      var target = href.replace(/\/$/, '');
      if (current === target) return;
      e.preventDefault();
      try { sessionStorage.setItem('bc-pt', '1'); } catch (err) {}
      gsap.set(curtain, { transformOrigin: 'top' });
      gsap.to(curtain, {
        scaleY: 1, duration: 0.5, ease: 'power3.inOut',
        onComplete: function () { location.href = href; }
      });
    });
  });

  /* ---------- preloader (first visit per session) ---------- */
  var pre = document.querySelector('.preloader');
  if (pre) {
    var seen = false;
    try { seen = sessionStorage.getItem('bc-seen') === '1'; } catch (e) {}
    if (seen || cameThrough) {
      pre.style.display = 'none';
    } else {
      try { sessionStorage.setItem('bc-seen', '1'); } catch (e) {}
      if (lenis) lenis.stop();
      var word = pre.querySelector('.preloader-word span');
      var count = pre.querySelector('.preloader-count');
      var bar = pre.querySelector('.preloader-bar');
      var state = { n: 0 };
      var tl = gsap.timeline({
        onComplete: function () {
          pre.style.display = 'none';
          if (lenis) lenis.start();
          ScrollTrigger.sort();
          ScrollTrigger.refresh();
        }
      });
      tl.fromTo(word, { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 0.9, ease: 'power4.out' }, 0.1);
      tl.to(state, {
        n: 100, duration: 1.6, ease: 'power2.inOut',
        onUpdate: function () { if (count) count.textContent = String(Math.round(state.n)).padStart(3, '0'); }
      }, 0.1);
      tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 0.1);
      tl.to(word, { yPercent: -112, duration: 0.6, ease: 'power3.in' }, '+=0.15');
      tl.to(pre, { yPercent: -100, duration: 0.75, ease: 'power3.inOut' }, '-=0.25');
    }
  }

  /* ---------- refresh after full load ----------
     sort() first: pins are created after most triggers (script order),
     and without re-sorting, refresh computes positions without the
     pin spacers for everything created earlier. */
  window.addEventListener('load', function () { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
})();
