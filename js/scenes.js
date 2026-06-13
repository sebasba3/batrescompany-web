/* ============================================================
   BATRES — scenes.js (V3.1)
   Servicios: ONE persistent fixed stage behind the chapters.
   Four AI-generated video loops (the services, alive) crossfade
   as each chapter scrolls past; only the active loop plays.
   Progress rail highlights the active service.
   Reduced motion / no GSAP: stage stays hidden (posters exist
   in the chapter plates; the page reads fine without it).
   ============================================================ */

(function () {
  'use strict';

  var stage = document.querySelector('.svc-stage');
  var chapters = document.querySelectorAll('.chapter');
  if (!stage || !chapters.length) return;

  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small = window.matchMedia('(max-width: 1020px)').matches;
  /* on small screens the stage hides behind single-column content —
     skip it entirely and save the video data */
  if (reduced || !hasGsap || small) return;

  var names = ['vid-svc-01', 'vid-svc-02', 'vid-svc-03', 'vid-svc-04'];
  var layers = names.map(function (n) {
    var d = document.createElement('div');
    d.className = 'stage-layer';
    var v = document.createElement('video');
    v.src = '/assets/gen/' + n + '.mp4';
    v.poster = '/assets/gen/' + n + '-poster.webp';
    v.muted = true; v.loop = true; v.playsInline = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    v.preload = 'metadata';
    d.appendChild(v);
    stage.appendChild(d);
    return { el: d, video: v };
  });

  function focus(idx) {
    layers.forEach(function (l, j) {
      var on = j === idx;
      gsap.to(l.el, { opacity: on ? 1 : 0, duration: 0.9, ease: 'power2.inOut', overwrite: 'auto' });
      if (on) { var p = l.video.play(); if (p && p.catch) p.catch(function () {}); }
      else l.video.pause();
    });
  }

  gsap.registerPlugin(ScrollTrigger);

  var block = document.querySelector('.chapters');
  var rail = document.querySelector('.chapter-rail');
  var railSpans = rail ? rail.querySelectorAll('span') : [];

  ScrollTrigger.create({
    trigger: block,
    start: 'top 60%',
    end: 'bottom 40%',
    onToggle: function (self) {
      gsap.to(stage, { opacity: self.isActive ? 1 : 0, duration: 0.6, overwrite: 'auto' });
      if (rail) gsap.to(rail, { opacity: self.isActive ? 1 : 0, duration: 0.5, overwrite: 'auto' });
      if (!self.isActive) layers.forEach(function (l) { l.video.pause(); });
    }
  });

  chapters.forEach(function (ch, i) {
    ScrollTrigger.create({
      trigger: ch,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: function (self) {
        if (!self.isActive) return;
        focus(i);
        railSpans.forEach(function (s, j) { s.classList.toggle('is-on', j === i); });
      }
    });
  });
})();
