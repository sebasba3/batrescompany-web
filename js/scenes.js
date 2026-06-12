/* ============================================================
   BATRES — scenes.js (V3)
   Servicios: ONE persistent fixed stage behind the chapters.
   Four cinematic plates (Kie.ai) crossfade and drift slowly
   (Ken Burns) as each chapter scrolls past; progress rail
   highlights the active service. No WebGL — pure compositor-
   friendly transforms over real photography-grade plates.
   ============================================================ */

(function () {
  'use strict';

  var stage = document.querySelector('.svc-stage');
  var chapters = document.querySelectorAll('.chapter');
  if (!stage || !chapters.length) return;

  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* atmospheric backdrops — distinct from the chapter plates */
  var imgs = ['hero-03', 'hero-02', 'tex-02', 'nosotros-01'];
  var layers = imgs.map(function (n) {
    var d = document.createElement('div');
    d.className = 'stage-layer';
    d.style.backgroundImage = "url('/assets/gen/" + n + ".webp')";
    stage.appendChild(d);
    return d;
  });

  if (reduced || !hasGsap) return; /* stage stays hidden; chapters read fine on the act background */

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
    }
  });

  chapters.forEach(function (ch, i) {
    /* slow drift while its chapter crosses the viewport */
    gsap.fromTo(layers[i], { scale: 1.14, yPercent: 3.5 }, {
      scale: 1.02, yPercent: -3.5, ease: 'none',
      scrollTrigger: { trigger: ch, start: 'top bottom', end: 'bottom top', scrub: true }
    });
    /* crossfade on chapter focus */
    ScrollTrigger.create({
      trigger: ch,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: function (self) {
        if (!self.isActive) return;
        layers.forEach(function (l, j) {
          gsap.to(l, { opacity: j === i ? 1 : 0, duration: 0.9, ease: 'power2.inOut', overwrite: 'auto' });
        });
        railSpans.forEach(function (s, j) { s.classList.toggle('is-on', j === i); });
      }
    });
  });
})();
