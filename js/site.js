/* ============================================================
   BATRES COMPANY LIMITED — site.js
   Shared runtime: scroll controller, reveals, parallax,
   marquee, header chrome, clock, mobile menu, scene registry,
   contact form. One rAF loop drives everything.
   ============================================================ */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     Scene registry — monolith.js / scenes.js register here.
     Each scene: { el, render(dt, t, progress, velocity), renderOnce() }
     `progress` = 0 when the section's top enters the viewport
     bottom, 1 when its bottom leaves the viewport top.
     ---------------------------------------------------------- */

  var scenes = [];
  var sceneObserver = null;

  if (typeof IntersectionObserver !== 'undefined') {
    sceneObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var s = en.target._bcScene;
        if (s) s.active = en.isIntersecting;
      });
    }, { rootMargin: '120px 0px 120px 0px' });
  }

  window.BC = {
    reduced: reduced,
    addScene: function (scene) {
      scene.active = !sceneObserver; // no IO -> always active
      scene.el._bcScene = scene;
      scenes.push(scene);
      if (sceneObserver) sceneObserver.observe(scene.el);
      if (reduced && scene.renderOnce) scene.renderOnce();
    }
  };

  function sectionProgress(el, vh) {
    var r = el.getBoundingClientRect();
    var total = vh + r.height;
    if (total <= 0) return 0;
    var p = (vh - r.top) / total;
    return p < 0 ? 0 : (p > 1 ? 1 : p);
  }

  /* ----------------------------------------------------------
     Main frame loop
     ---------------------------------------------------------- */

  var progressBar = document.querySelector('.progress-bar');
  var header = document.querySelector('.site-header');
  var marqueeTrack = document.querySelector('.marquee-track');
  var parallaxEls = [].slice.call(document.querySelectorAll('[data-parallax]'));

  var smoothY = window.scrollY || 0;
  var velocity = 0;
  var lastT = performance.now();
  var marqueeAnim = null;

  function frame(now) {
    requestAnimationFrame(frame);
    var dt = Math.min((now - lastT) / 1000, 0.1);
    lastT = now;

    var y = window.scrollY || 0;
    var prev = smoothY;
    smoothY = smoothY + (y - smoothY) * 0.12;
    velocity = velocity + ((smoothY - prev) - velocity) * 0.2;

    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';

    if (header) {
      if (y > 48) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    }

    if (reduced) return; // chrome only; no motion below

    var vh = window.innerHeight;

    // parallax — small translate offsets relative to viewport center
    for (var i = 0; i < parallaxEls.length; i++) {
      var el = parallaxEls[i];
      var f = parseFloat(el.getAttribute('data-parallax')) || 0.1;
      var base = el.getAttribute('data-parallax-base');
      var r = el.getBoundingClientRect();
      var offset = (r.top + r.height / 2) - vh / 2;
      var shift = (-offset * f).toFixed(1) + 'px';
      el.style.transform = base
        ? 'translateY(calc(' + base + ' + ' + shift + '))'
        : 'translateY(' + shift + ')';
    }

    // marquee reacts to scroll velocity
    if (marqueeTrack) {
      if (!marqueeAnim && marqueeTrack.getAnimations) {
        marqueeAnim = marqueeTrack.getAnimations()[0] || null;
      }
      if (marqueeAnim) {
        var rate = 1 + velocity * 0.06;
        if (rate > 5) rate = 5;
        if (rate < -3) rate = -3;
        marqueeAnim.playbackRate = marqueeAnim.playbackRate + (rate - marqueeAnim.playbackRate) * 0.1;
      }
    }

    // scenes
    var t = now / 1000;
    for (var j = 0; j < scenes.length; j++) {
      var s = scenes[j];
      if (!s.active) continue;
      s.render(dt, t, sectionProgress(s.el, vh), velocity);
    }
  }
  requestAnimationFrame(frame);

  /* ----------------------------------------------------------
     Scroll reveals (design spec: opacity 0->1, translateY 26->0,
     cubic-bezier(.25,1,.5,1) .8s, data-reveal-delay stagger;
     data-reveal="line" draws in with scaleX)
     ---------------------------------------------------------- */

  var ioFired = false;
  var revealObserver = null;

  function revealEl(el) {
    if (el._bcShown) return;
    el._bcShown = true;
    var d = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
    var line = el.getAttribute('data-reveal') === 'line';
    el.style.transition = 'opacity .8s cubic-bezier(.25,1,.5,1) ' + d + 'ms, transform .8s cubic-bezier(.25,1,.5,1) ' + d + 'ms';
    el.style.opacity = '1';
    el.style.transform = line ? 'scaleX(1)' : 'translateY(0px)';
    if (revealObserver) revealObserver.unobserve(el);
  }

  function sweepReveals() {
    var vh = window.innerHeight;
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      if (el._bcShown) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh - 24 && r.bottom > -24) revealEl(el);
    });
  }

  if (!reduced) {
    if (typeof IntersectionObserver !== 'undefined') {
      revealObserver = new IntersectionObserver(function (entries) {
        ioFired = true;
        entries.forEach(function (en) { if (en.isIntersecting) revealEl(en.target); });
      }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });
    }

    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      var line = el.getAttribute('data-reveal') === 'line';
      el.style.transition = 'none';
      if (line) {
        el.style.transform = 'scaleX(0)';
        el.style.transformOrigin = 'left center';
      } else {
        el.style.opacity = '0';
        el.style.transform = 'translateY(26px)';
      }
      if (revealObserver) revealObserver.observe(el);
    });

    // fallback if IO is unavailable or suppressed
    setTimeout(function () { if (!ioFired) sweepReveals(); }, 650);
    window.addEventListener('scroll', function () { if (!ioFired) sweepReveals(); }, { passive: true });
  }

  /* ----------------------------------------------------------
     Live GMT-6 clock
     ---------------------------------------------------------- */

  var clocks = document.querySelectorAll('[data-clock]');
  if (clocks.length) {
    var tick = function () {
      var d = new Date(Date.now() - 6 * 3600e3);
      var txt = d.toISOString().slice(11, 19) + ' GMT-6';
      clocks.forEach(function (c) { c.textContent = txt; });
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ----------------------------------------------------------
     Mobile menu
     ---------------------------------------------------------- */

  var navToggle = document.querySelector('.nav-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');

  function closeMenu() {
    document.body.classList.remove('menu-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    if (mobileMenu) mobileMenu.setAttribute('aria-hidden', 'true');
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ----------------------------------------------------------
     Contact form -> Web3Forms (INT-01)
     ---------------------------------------------------------- */

  var form = document.getElementById('contact-form');
  if (form) {
    var submitBtn = document.getElementById('submit-btn');
    var okNote = document.getElementById('form-ok');
    var errNote = document.getElementById('form-err');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      okNote.hidden = true;
      errNote.hidden = true;
      submitBtn.disabled = true;
      var prevLabel = submitBtn.textContent;
      submitBtn.textContent = 'ENVIANDO…';

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      }).then(function (res) { return res.json(); }).then(function (result) {
        if (result.success) {
          form.reset();
          okNote.hidden = false;
        } else {
          errNote.hidden = false;
        }
      }).catch(function () {
        errNote.hidden = false;
      }).finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = prevLabel;
      });
    });
  }
})();
