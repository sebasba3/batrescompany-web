/* ============================================================
   BATRES COMPANY LIMITED — scenes.js
   Live WebGL figures (replace the HF-01 / KIE-01..04 asset
   placeholders). Art direction per HANDOFF.md: concrete gray
   + white + single rust accent, flat light, architectural.
   Every scene = subtle idle loop + scroll-driven progress.
   Requires three.js r128 and site.js (window.BC).
   ============================================================ */

(function () {
  'use strict';
  if (!window.THREE || !window.BC) return;
  var THREE = window.THREE;

  /* ---------- shared materials / helpers ---------- */

  var INK = 0x1a1a1a, CONCRETE = 0xe9e9e6, RUST = 0xc95a0f;

  function concreteMat() {
    return new THREE.MeshStandardMaterial({ color: CONCRETE, roughness: 0.95, metalness: 0, flatShading: true });
  }
  function rustMat() { return new THREE.MeshBasicMaterial({ color: RUST }); }
  function edgeMat() { return new THREE.LineBasicMaterial({ color: INK }); }

  function block(w, h, d, mat) {
    var g = new THREE.BoxGeometry(w, h, d);
    var m = new THREE.Mesh(g, mat || concreteMat());
    m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), edgeMat()));
    return m;
  }

  function clamp01(x) { return x < 0 ? 0 : (x > 1 ? 1 : x); }
  function smooth(x) { x = clamp01(x); return x * x * (3 - 2 * x); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function mount(host, camPos, fov) {
    var W = host.clientWidth || 600;
    var H = host.clientHeight || 450;
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H);
    host.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(fov || 26, W / H, 0.1, 100);
    camera.position.set(camPos[0], camPos[1], camPos[2]);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    var dir = new THREE.DirectionalLight(0xffffff, 0.55);
    dir.position.set(2.5, 4, 3);
    scene.add(dir);

    var ro = new ResizeObserver(function () {
      var w = host.clientWidth, h = host.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(host);

    return { renderer: renderer, scene: scene, camera: camera };
  }

  function register(el, hostSel, camPos, fov, builder) {
    var host = el.querySelector(hostSel);
    if (!host) return;
    var ctx = mount(host, camPos, fov);
    var update = builder(ctx.scene, ctx.camera);
    window.BC.addScene({
      el: el,
      render: function (dt, t, p, v) {
        update(dt, t, p, v);
        ctx.renderer.render(ctx.scene, ctx.camera);
      },
      renderOnce: function () {
        update(0.016, 1.0, 0.62, 0);
        ctx.renderer.render(ctx.scene, ctx.camera);
      }
    });
  }

  /* ============================================================
     PROCESS BAND (HF-01) — concrete blocks assemble along a grid
     into an interlocking structure; rust seam light travels the
     joints. Assembly is driven by scroll progress.
     ============================================================ */

  function buildProcess(scene) {
    var group = new THREE.Group();
    group.rotation.x = -0.06;
    scene.add(group);

    // interlocking bond: 3 rows, staggered widths (running bond)
    var rows = [
      [1.6, 1.0, 1.4, 1.0, 1.6],
      [1.0, 1.5, 1.1, 1.5, 1.0],
      [1.4, 1.0, 1.6, 1.0, 1.4]
    ];
    var H = 0.52, D = 0.62, GAPJ = 0.07;
    var blocks = [];

    rows.forEach(function (widths, r) {
      var total = widths.reduce(function (a, b) { return a + b; }, 0) + GAPJ * (widths.length - 1);
      var x = -total / 2;
      widths.forEach(function (w, c) {
        var b = block(w, H, D);
        var hx = x + w / 2;
        var hy = (r - 1) * (H + GAPJ);
        x += w + GAPJ;
        var dirSign = (r + c) % 2 === 0 ? 1 : -1;
        b.userData = {
          home: [hx, hy, 0],
          from: [hx + dirSign * (2.2 + c * 0.45), hy + 1.9 + r * 0.55, dirSign * 1.3],
          tilt: dirSign * (0.5 + 0.13 * c),
          order: (r * widths.length + c)
        };
        group.add(b);
        blocks.push(b);
      });
    });
    var N = blocks.length;

    // seam light travels the horizontal joints
    var seam = new THREE.Mesh(new THREE.BoxGeometry(0.5, GAPJ * 0.9, D * 1.04), rustMat());
    group.add(seam);
    var glow = new THREE.PointLight(RUST, 0.9, 5);
    group.add(glow);

    var span = 3.6;
    return function (dt, t, p) {
      var ap = smooth(clamp01((p - 0.12) / 0.45)); // assembled by p≈0.57
      blocks.forEach(function (b) {
        var u = b.userData;
        var w0 = u.order / N * 0.72;
        var lp = smooth(clamp01((ap - w0) / 0.3));
        b.position.set(
          lerp(u.from[0], u.home[0], lp),
          lerp(u.from[1], u.home[1], lp),
          lerp(u.from[2], u.home[2], lp)
        );
        b.rotation.z = u.tilt * (1 - lp);
        b.rotation.x = u.tilt * 0.5 * (1 - lp);
      });

      // seam travels left->right, alternating between the two horizontal joints
      var u2 = (t * 0.16) % 2;
      var jy = (u2 < 1 ? -1 : 1) * (H / 2 + GAPJ / 2);
      var ux = (u2 % 1);
      seam.position.set(lerp(-span, span, ux), jy, 0);
      seam.visible = ap > 0.55;
      var pulse = 0.6 + Math.sin(t * 2.2) * 0.25;
      glow.position.copy(seam.position);
      glow.position.z = 0.9;
      glow.intensity = seam.visible ? pulse : 0.15;

      group.rotation.y = Math.sin(t * 0.12) * 0.07 + (p - 0.5) * 0.22;
      group.position.y = Math.sin(t * 0.4) * 0.02;
    };
  }

  /* ============================================================
     KIE-01 — FLUJOS: blocks flow left->right along a thin rust
     pipeline. Flow speed builds with scroll progress.
     ============================================================ */

  function buildPipeline(scene) {
    var group = new THREE.Group();
    group.rotation.x = 0.32;
    group.rotation.y = -0.5;
    scene.add(group);

    // polyline path with two elbows
    var P = [
      new THREE.Vector3(-2.3, -0.5, 0),
      new THREE.Vector3(-0.6, -0.5, 0),
      new THREE.Vector3(-0.6, 0.5, 0),
      new THREE.Vector3(0.9, 0.5, 0),
      new THREE.Vector3(0.9, -0.2, 0),
      new THREE.Vector3(2.3, -0.2, 0)
    ];
    var lens = [], total = 0;
    for (var i = 0; i < P.length - 1; i++) {
      var L = P[i].distanceTo(P[i + 1]);
      lens.push(L);
      total += L;
    }
    // rust pipe segments
    for (var s = 0; s < P.length - 1; s++) {
      var a = P[s], b = P[s + 1];
      var seg = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(b.x - a.x) || 0.045, Math.abs(b.y - a.y) || 0.045, 0.045), rustMat());
      seg.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, 0);
      group.add(seg);
    }

    function pointAt(u) {
      var dgt = u * total;
      for (var k = 0; k < lens.length; k++) {
        if (dgt <= lens[k]) {
          return new THREE.Vector3().lerpVectors(P[k], P[k + 1], dgt / lens[k]);
        }
        dgt -= lens[k];
      }
      return P[P.length - 1].clone();
    }

    var COUNT = 8;
    var cubes = [];
    for (var c = 0; c < COUNT; c++) {
      var cube = block(0.26, 0.26, 0.26);
      group.add(cube);
      cubes.push(cube);
    }

    // endpoint pads
    var src = block(0.55, 0.55, 0.55);
    src.position.copy(P[0]); src.position.x -= 0.25;
    group.add(src);
    var dst = block(0.7, 0.7, 0.7);
    dst.position.copy(P[P.length - 1]); dst.position.x += 0.35;
    group.add(dst);

    var travel = 0;
    return function (dt, t, p) {
      var speed = 0.05 + smooth(p) * 0.16;
      travel += dt * speed;
      cubes.forEach(function (cube, idx) {
        var u = (travel + idx / COUNT) % 1;
        cube.position.copy(pointAt(u));
        var pop = Math.min(smooth(u / 0.08), smooth((1 - u) / 0.08));
        cube.scale.setScalar(Math.max(pop, 0.001));
        cube.rotation.y = u * Math.PI * 2;
      });
      dst.rotation.y = t * 0.3;
      group.rotation.y = -0.5 + Math.sin(t * 0.18) * 0.05 + (p - 0.5) * 0.3;
    };
  }

  /* ============================================================
     KIE-02 — AGENTES: concrete cube with rust seam, orbited by
     thin wireframe rings. Orbit tilt/speed evolve with scroll.
     ============================================================ */

  function buildAgent(scene) {
    var group = new THREE.Group();
    scene.add(group);

    var core = new THREE.Group();
    var halfL = block(0.55, 1.15, 1.15);
    var halfR = block(0.55, 1.15, 1.15);
    halfL.position.x = -0.31;
    halfR.position.x = 0.31;
    var seam = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.12, 1.12), rustMat());
    core.add(halfL); core.add(halfR); core.add(seam);
    group.add(core);

    function ring(r) {
      var pts = [];
      for (var i = 0; i <= 72; i++) {
        var a = i / 72 * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
      }
      var g = new THREE.BufferGeometry().setFromPoints(pts);
      return new THREE.LineLoop(g, edgeMat());
    }

    var rings = [ring(1.25), ring(1.55), ring(1.85)];
    rings.forEach(function (rg) { group.add(rg); });

    return function (dt, t, p) {
      var e = smooth(p);
      core.rotation.y = t * 0.12 + e * 1.4;
      core.rotation.x = -0.04;
      rings[0].rotation.set(0.5 + e * 0.5, t * 0.42, 0.12);
      rings[1].rotation.set(-0.65 - e * 0.35, -t * 0.3, -0.2);
      rings[2].rotation.set(0.2 + e * 0.8, t * 0.2, 0.45 + e * 0.3);
      var sc = 1 + e * 0.12;
      rings.forEach(function (rg) { rg.scale.setScalar(sc); });
      group.rotation.y = Math.sin(t * 0.15) * 0.06;
      group.position.y = Math.sin(t * 0.5) * 0.03;
    };
  }

  /* ============================================================
     KIE-03 — INTEGRACIÓN: four blocks converge into one slab
     via rust bridges. Convergence = scroll progress.
     ============================================================ */

  function buildMerge(scene) {
    var group = new THREE.Group();
    group.rotation.x = 0.42;
    group.rotation.y = 0.62;
    scene.add(group);

    var off = 1.15, home = 0.47, size = 0.88;
    var spots = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
    var cubes = spots.map(function (sxz) {
      var b = block(size, 0.6, size);
      b.userData = { sx: sxz[0], sz: sxz[1] };
      group.add(b);
      return b;
    });

    // bridges along x (2) and z (2)
    var bridges = [];
    for (var i = 0; i < 4; i++) {
      var br = new THREE.Mesh(new THREE.BoxGeometry(1, 0.1, 0.1), rustMat());
      group.add(br);
      bridges.push(br);
    }

    return function (dt, t, p) {
      var conv = smooth(clamp01((p - 0.15) / 0.5));
      var d = lerp(off, home, conv);
      cubes.forEach(function (b) {
        b.position.set(b.userData.sx * d, 0, b.userData.sz * d);
        b.rotation.y = (1 - conv) * b.userData.sx * 0.25;
      });
      var span = Math.max(d * 2 - size, 0.001);
      var bs = 0.12 + conv * 0.5;
      // x-direction bridges
      bridges[0].position.set(0, 0, -d); bridges[0].scale.set(span, bs, bs);
      bridges[1].position.set(0, 0, d);  bridges[1].scale.set(span, bs, bs);
      // z-direction bridges
      bridges[2].position.set(-d, 0, 0); bridges[2].rotation.y = Math.PI / 2; bridges[2].scale.set(span, bs, bs);
      bridges[3].position.set(d, 0, 0);  bridges[3].rotation.y = Math.PI / 2; bridges[3].scale.set(span, bs, bs);

      group.rotation.y = 0.62 + Math.sin(t * 0.14) * 0.05 + (p - 0.5) * 0.35;
    };
  }

  /* ============================================================
     KIE-04 — DATOS: chaotic sheets enter a block on the left,
     emerge as a uniform stack (one rust tile) on the right.
     Ordering ratio driven by scroll.
     ============================================================ */

  function buildData(scene) {
    var group = new THREE.Group();
    group.rotation.x = 0.3;
    group.rotation.y = -0.35;
    scene.add(group);

    // central processor block with rust seam slot
    var proc = new THREE.Group();
    var pTop = block(1.25, 0.55, 1.0);
    var pBot = block(1.25, 0.55, 1.0);
    pTop.position.y = 0.32;
    pBot.position.y = -0.32;
    var slot = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.07, 0.97), rustMat());
    proc.add(pTop); proc.add(pBot); proc.add(slot);
    group.add(proc);

    // incoming chaotic sheets
    var SHEETS = 10;
    var sheets = [];
    for (var i = 0; i < SHEETS; i++) {
      var sh = block(0.46, 0.025, 0.62);
      sh.userData = {
        seed: i / SHEETS,
        ry: (Math.random() - 0.5) * 1.4,
        rz: (Math.random() - 0.5) * 0.9,
        oy: (Math.random() - 0.5) * 1.1,
        oz: (Math.random() - 0.5) * 0.8
      };
      group.add(sh);
      sheets.push(sh);
    }

    // ordered output stack
    var TILES = 8;
    var tiles = [];
    for (var k = 0; k < TILES; k++) {
      var tile = block(0.5, 0.07, 0.66, k === 5 ? rustMat() : concreteMat());
      tile.position.set(1.7, -0.62 + k * 0.105, 0);
      group.add(tile);
      tiles.push(tile);
    }

    return function (dt, t, p) {
      sheets.forEach(function (sh) {
        var u = (t * 0.1 + sh.userData.seed) % 1;
        var x = lerp(-2.5, -0.55, u);
        var settle = smooth((u - 0.55) / 0.45); // straighten as they near the slot
        sh.position.set(x, sh.userData.oy * (1 - settle), sh.userData.oz * (1 - settle));
        sh.rotation.y = sh.userData.ry * (1 - settle);
        sh.rotation.z = sh.userData.rz * (1 - settle);
        var vanish = smooth((u - 0.92) / 0.08);
        var appear = smooth(u / 0.06);
        sh.scale.setScalar(Math.max(appear * (1 - vanish), 0.001));
      });

      var ratio = smooth(clamp01((p - 0.12) / 0.55)) * TILES;
      tiles.forEach(function (tile, idx) {
        var lp = clamp01(ratio - idx);
        tile.scale.setScalar(Math.max(smooth(lp), 0.001));
      });

      slot.scale.x = 1 + Math.sin(t * 2.4) * 0.015;
      group.rotation.y = -0.35 + Math.sin(t * 0.16) * 0.05 + (p - 0.5) * 0.3;
    };
  }

  /* ---------- wire up every [data-scene] on the page ---------- */

  var builders = {
    process:  { fn: buildProcess,  cam: [0, 1.6, 7.2],  fov: 30 },
    pipeline: { fn: buildPipeline, cam: [0, 1.5, 7.4],  fov: 32 },
    agent:    { fn: buildAgent,    cam: [3.0, 2.0, 4.8], fov: 30 },
    merge:    { fn: buildMerge,    cam: [0, 2.6, 5.4],  fov: 32 },
    data:     { fn: buildData,     cam: [0, 1.5, 5.6],  fov: 32 }
  };

  document.querySelectorAll('[data-scene]').forEach(function (el) {
    var name = el.getAttribute('data-scene');
    var b = builders[name];
    if (b) register(el, '.scene-canvas-host', b.cam, b.fov, b.fn);
  });
})();
