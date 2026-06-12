/* ============================================================
   BATRES COMPANY LIMITED — scenes.js (V2)
   1) Process band (inicio): full-bleed dark scene — concrete
      blocks assemble into a wall as you scroll; a molten rust
      light travels the joints once locked.
   2) Servicios stage: ONE persistent fixed canvas; four scene
      groups (pipeline / agent / merge / data) swap through the
      fog as the chapters scroll by.
   Requires three.js r128 + site.js (window.BC).
   ============================================================ */

(function () {
  'use strict';
  if (!window.THREE || !window.BC) return;
  var THREE = window.THREE;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  function smooth(x) { return x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x); }
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function glowTexture() {
    var c = document.createElement('canvas');
    c.width = c.height = 256;
    var g = c.getContext('2d');
    var grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, 'rgba(255,140,60,0.9)');
    grad.addColorStop(0.35, 'rgba(255,110,35,0.34)');
    grad.addColorStop(1, 'rgba(255,110,35,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }
  function mkGlow(scale) {
    var s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true
    }));
    s.scale.set(scale, scale, 1);
    return s;
  }

  var concreteMat = new THREE.MeshStandardMaterial({ color: 0x8F8D86, roughness: 0.94, metalness: 0, flatShading: true });
  var darkMat = new THREE.MeshStandardMaterial({ color: 0x55534E, roughness: 0.96, metalness: 0, flatShading: true });
  var rustMat = new THREE.MeshBasicMaterial({ color: 0xFF7A29 });
  var edgeMat = new THREE.LineBasicMaterial({ color: 0x0C0C0B, transparent: true, opacity: 0.5 });

  function block(w, h, d, mat) {
    var geo = new THREE.BoxGeometry(w, h, d);
    var m = new THREE.Mesh(geo, mat || concreteMat);
    m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat));
    return m;
  }

  function mkRenderer(host, coarse) {
    var W = host.clientWidth || window.innerWidth;
    var H = host.clientHeight || window.innerHeight;
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));
    renderer.setSize(W, H);
    host.appendChild(renderer.domElement);
    return renderer;
  }

  function watchResize(host, camera, renderer) {
    var ro = new ResizeObserver(function () {
      var w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(host);
  }

  /* ============================================================
     1) PROCESS BAND — assembling wall (inicio)
     ============================================================ */
  (function () {
    var section = document.querySelector('[data-scene="process"]');
    if (!section) return;
    var host = section.querySelector('.band-canvas');
    if (!host) return;

    var renderer = mkRenderer(host, window.BC.coarse);
    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0F0F0E, 0.05);
    var camera = new THREE.PerspectiveCamera(30, (host.clientWidth || 1) / (host.clientHeight || 1), 0.1, 100);
    camera.position.set(0, 0.6, 9.2);
    camera.lookAt(0, 0.4, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    var key = new THREE.DirectionalLight(0xfff2e6, 0.7);
    key.position.set(3, 5, 4);
    scene.add(key);

    var wall = new THREE.Group();
    scene.add(wall);

    var ROWS = 4, COLS = 7;
    var BW = 0.92, BH = 0.46, BD = 0.5, GAP = 0.05;
    var blocks = [];
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var b = block(BW, BH, BD, darkMat);
        var offset = (r % 2) ? (BW + GAP) / 2 : 0;
        var hx = (c - (COLS - 1) / 2) * (BW + GAP) + offset;
        var hy = (r - (ROWS - 1) / 2) * (BH + GAP) + 0.4;
        var seed = Math.random();
        b.userData = {
          hx: hx, hy: hy,
          sx: hx + (Math.random() - 0.5) * 9,
          sy: hy + (Math.random() - 0.5) * 6 - 1,
          sz: -3 - Math.random() * 7,
          srx: (Math.random() - 0.5) * 2.4,
          sry: (Math.random() - 0.5) * 2.4,
          order: (r * COLS + c) / (ROWS * COLS),
          seed: seed
        };
        blocks.push(b);
        wall.add(b);
      }
    }

    var seamGlow = mkGlow(2.6);
    wall.add(seamGlow);
    var seamLight = new THREE.PointLight(0xFF7A29, 0, 5);
    wall.add(seamLight);

    function update(dt, t, p) {
      var ap = smooth(clamp01((p - 0.1) / 0.55));
      blocks.forEach(function (b) {
        var u = b.userData;
        var w = smooth(clamp01((ap - u.order * 0.55) / 0.45));
        b.position.set(lerp(u.sx, u.hx, w), lerp(u.sy, u.hy, w), lerp(u.sz, 0, w));
        b.rotation.set(u.srx * (1 - w), u.sry * (1 - w), 0);
      });

      var lit = ap > 0.82;
      var u2 = (t * 0.22) % 2;
      var sx = lerp(-3.2, 3.2, (u2 < 1 ? u2 : 2 - u2));
      var sy = 0.4 + Math.sin(t * 0.7) * 0.7;
      seamGlow.position.set(sx, sy, 0.5);
      seamLight.position.set(sx, sy, 0.8);
      var on = lit ? (0.85 + Math.sin(t * 3) * 0.15) : 0;
      seamGlow.material.opacity = on;
      seamLight.intensity = on * 1.6;

      wall.rotation.y = Math.sin(t * 0.1) * 0.04;
      camera.position.x = Math.sin(t * 0.07) * 0.3;
      camera.lookAt(0, 0.4, 0);
    }

    watchResize(host, camera, renderer);
    window.BC.addScene({
      el: section,
      render: function (dt, t, p) { update(dt, t, p); renderer.render(scene, camera); },
      renderOnce: function () { update(0.016, 1, 0.9); renderer.render(scene, camera); }
    });
  })();

  /* ============================================================
     2) SERVICIOS STAGE — one fixed canvas, four morphing groups
     ============================================================ */
  (function () {
    var stage = document.querySelector('.svc-stage');
    var chaptersWrap = document.querySelector('.chapters');
    if (!stage || !chaptersWrap) return;

    var renderer = mkRenderer(stage, window.BC.coarse);
    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0F0F0E, 0.085);
    var camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.4, 7.4);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    var key = new THREE.DirectionalLight(0xfff2e6, 0.75);
    key.position.set(3, 5, 4);
    scene.add(key);

    /* --- G0: pipeline --- */
    var g0 = new THREE.Group();
    (function () {
      var pts = [
        new THREE.Vector3(-3.4, -0.7, 0), new THREE.Vector3(-1.4, -0.7, 0),
        new THREE.Vector3(-1.4, 0.7, 0), new THREE.Vector3(1.2, 0.7, 0),
        new THREE.Vector3(1.2, -0.5, 0), new THREE.Vector3(3.4, -0.5, 0)
      ];
      for (var i = 0; i < pts.length - 1; i++) {
        var a = pts[i], b2 = pts[i + 1];
        var len = a.distanceTo(b2);
        var seg = new THREE.Mesh(new THREE.BoxGeometry(
          Math.abs(b2.x - a.x) || 0.035, Math.abs(b2.y - a.y) || 0.035, 0.035), rustMat);
        seg.position.set((a.x + b2.x) / 2, (a.y + b2.y) / 2, 0);
        g0.add(seg);
      }
      var cubes = [];
      for (var k = 0; k < 8; k++) {
        var c = block(0.3, 0.3, 0.3);
        g0.add(c);
        cubes.push(c);
      }
      var total = 0;
      var lens = [];
      for (var j = 0; j < pts.length - 1; j++) { var l = pts[j].distanceTo(pts[j + 1]); lens.push(l); total += l; }
      g0.userData.update = function (dt, t, w) {
        var travel = (t * (0.06 + w * 0.1)) % 1;
        cubes.forEach(function (c, idx) {
          var u = (travel + idx / cubes.length) % 1;
          var dist = u * total, acc = 0;
          for (var s = 0; s < lens.length; s++) {
            if (dist <= acc + lens[s]) {
              var lt = (dist - acc) / lens[s];
              c.position.lerpVectors(pts[s], pts[s + 1], lt);
              break;
            }
            acc += lens[s];
          }
          var pop = Math.min(u * 6, (1 - u) * 6, 1);
          c.scale.setScalar(0.4 + pop * 0.6);
          c.rotation.y = t * 0.6 + idx;
        });
      };
      var gl = mkGlow(1.8); gl.position.set(-3.4, -0.7, 0.2); g0.add(gl);
    })();

    /* --- G1: agent --- */
    var g1 = new THREE.Group();
    (function () {
      var top = block(1.5, 0.72, 1.5);
      top.position.y = 0.42;
      var bot = block(1.5, 0.72, 1.5);
      bot.position.y = -0.42;
      var seam = new THREE.Mesh(new THREE.BoxGeometry(1.46, 0.1, 1.46), rustMat);
      g1.add(top, bot, seam);
      var rings = [];
      for (var i = 0; i < 2; i++) {
        var ring = new THREE.Mesh(new THREE.TorusGeometry(1.7 + i * 0.3, 0.02, 8, 80),
          new THREE.MeshStandardMaterial({ color: 0x2A2A28, roughness: 0.6, metalness: 0.4 }));
        rings.push(ring);
        g1.add(ring);
      }
      var gl = mkGlow(2.4); g1.add(gl);
      var pl = new THREE.PointLight(0xFF7A29, 0.8, 5); g1.add(pl);
      g1.userData.update = function (dt, t, w) {
        g1.rotation.y = t * 0.18;
        top.position.y = 0.42 + Math.sin(t * 1.1) * 0.045 + w * 0.12;
        bot.position.y = -0.42 - Math.sin(t * 1.1) * 0.045 - w * 0.12;
        rings[0].rotation.x = 1.1 + Math.sin(t * 0.3) * 0.2;
        rings[0].rotation.y = t * 0.4;
        rings[1].rotation.x = -0.9 + Math.cos(t * 0.26) * 0.2;
        rings[1].rotation.y = -t * 0.32;
        gl.material.opacity = 0.6 + w * 0.3 + Math.sin(t * 2.2) * 0.08;
      };
    })();

    /* --- G2: merge --- */
    var g2 = new THREE.Group();
    (function () {
      var quads = [], bridges = [];
      var dirs = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
      dirs.forEach(function (d) {
        var b = block(0.85, 0.85, 0.85);
        b.userData.dir = d;
        quads.push(b);
        g2.add(b);
        var br = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), rustMat);
        bridges.push(br);
        g2.add(br);
      });
      g2.userData.update = function (dt, t, w) {
        var conv = smooth(w) * 0.92;
        var d = lerp(1.5, 0.46, conv);
        quads.forEach(function (b, i) {
          b.position.set(b.userData.dir[0] * d, b.userData.dir[1] * d * 0.7, 0);
          b.rotation.y = (1 - conv) * (i % 2 ? 0.5 : -0.5) + t * 0.1;
          var br = bridges[i];
          br.position.set(b.userData.dir[0] * d * 0.5, b.userData.dir[1] * d * 0.35, 0);
          var span = Math.max(d * 1.2 - 0.85, 0.01);
          br.scale.set(span / 0.05 * Math.abs(b.userData.dir[0]) || 1, span / 0.05 * 0.4, 1);
        });
        g2.rotation.y = Math.sin(t * 0.2) * 0.18;
      };
      var gl = mkGlow(2.2); g2.add(gl);
    })();

    /* --- G3: data --- */
    var g3 = new THREE.Group();
    (function () {
      var sheets = [];
      for (var i = 0; i < 14; i++) {
        var s = block(0.66, 0.045, 0.5);
        s.userData = {
          cx: -2.6 + (Math.random() - 0.5) * 1.8,
          cy: (Math.random() - 0.5) * 2.4,
          cz: (Math.random() - 0.5) * 1.6,
          crx: (Math.random() - 0.5) * 2,
          cry: (Math.random() - 0.5) * 2,
          oy: -0.85 + i * 0.13,
          rust: i === 9
        };
        if (s.userData.rust) { s.children[0].visible = false; s.material = rustMat; }
        sheets.push(s);
        g3.add(s);
      }
      g3.userData.update = function (dt, t, w) {
        sheets.forEach(function (s, i) {
          var u = s.userData;
          var ww = smooth(clamp01((w - i * 0.04) / 0.6));
          s.position.set(
            lerp(u.cx + Math.sin(t * 0.8 + i) * 0.12, 1.6, ww),
            lerp(u.cy + Math.cos(t * 0.6 + i) * 0.12, u.oy, ww),
            lerp(u.cz, 0, ww)
          );
          s.rotation.set(u.crx * (1 - ww), u.cry * (1 - ww), 0);
        });
        g3.rotation.y = Math.sin(t * 0.15) * 0.1;
      };
      var gl = mkGlow(1.9); gl.position.set(1.6, 0.3, 0.3); g3.add(gl);
    })();

    var groups = [g0, g1, g2, g3];
    groups.forEach(function (g) { scene.add(g); });

    /* chapter focus from scroll */
    var focus = 0, focusTarget = 0, stageOn = false;
    if (hasGsap) {
      ScrollTrigger.create({
        trigger: chaptersWrap,
        start: 'top 70%',
        end: 'bottom 30%',
        onUpdate: function (self) { focusTarget = self.progress * 3; },
        onToggle: function (self) {
          stageOn = self.isActive;
          gsap.to(stage, { opacity: self.isActive ? 1 : 0, duration: 0.6, overwrite: 'auto' });
        }
      });
    } else {
      stage.style.opacity = '1';
      stageOn = true;
    }

    /* rail highlight */
    var railSpans = document.querySelectorAll('.chapter-rail span');
    if (hasGsap && railSpans.length) {
      gsap.to('.chapter-rail', {
        opacity: 1, duration: 0.5,
        scrollTrigger: { trigger: chaptersWrap, start: 'top 60%', end: 'bottom 40%', toggleActions: 'play reverse play reverse' }
      });
    }

    function update(dt, t) {
      focus += (focusTarget - focus) * 0.08;
      var active = Math.round(focus);
      railSpans.forEach(function (s, i) { s.classList.toggle('is-on', i === Math.min(Math.max(active, 0), 3)); });

      groups.forEach(function (g, k) {
        var w = clamp01(1 - Math.abs(focus - k));
        var off = focus - k; // negative = below, positive = passed
        g.visible = w > 0.02;
        if (!g.visible) return;
        g.position.y = -off * 3.4;
        g.position.z = -(1 - w) * 9;
        if (g.userData.update) g.userData.update(dt, t, w);
      });

      camera.position.x = Math.sin(t * 0.08) * 0.25;
      camera.lookAt(0, 0, 0);
    }

    var roCam = new ResizeObserver(function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
    roCam.observe(document.body);

    window.BC.addScene({
      el: chaptersWrap,
      render: function (dt, t) { if (stageOn || !hasGsap) { update(dt, t); renderer.render(scene, camera); } },
      renderOnce: function () { focus = focusTarget = 0; stage.style.opacity = '1'; update(0.016, 1); renderer.render(scene, camera); }
    });
  })();
})();
