/* ============================================================
   BATRES COMPANY LIMITED — monolith.js
   FIG. 01 hero: concrete monolith split in two halves with a
   rust seam. Pointer hover opens the seam; scroll also opens
   it and rotates the block. Ported from the approved design
   (Batres Website.dc.html), wired into the shared BC loop.
   ============================================================ */

(function () {
  'use strict';
  if (!window.THREE || !window.BC) return;
  var THREE = window.THREE;

  var el = document.querySelector('[data-scene="monolith"]');
  if (!el) return;
  var host = el.querySelector('.scene-canvas-host');
  if (!host) return;

  var W = host.clientWidth || 600;
  var H = host.clientHeight || 480;

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(W, H);
  host.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(28, W / H, 0.1, 100);
  camera.position.set(3.4, 2.3, 5.4);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  var dir = new THREE.DirectionalLight(0xffffff, 0.55);
  dir.position.set(2.5, 4, 3);
  scene.add(dir);

  var group = new THREE.Group();
  scene.add(group);

  var concrete = new THREE.MeshStandardMaterial({ color: 0xe9e9e6, roughness: 0.95, metalness: 0.0, flatShading: true });
  var halfGeo = new THREE.BoxGeometry(1, 1.3, 1.3);
  var edgeMat = new THREE.LineBasicMaterial({ color: 0x1a1a1a });

  function mkHalf() {
    var m = new THREE.Mesh(halfGeo, concrete);
    m.add(new THREE.LineSegments(new THREE.EdgesGeometry(halfGeo), edgeMat));
    group.add(m);
    return m;
  }
  var left = mkHalf();
  var right = mkHalf();

  var seamGeo = new THREE.BoxGeometry(1, 1.26, 1.26);
  var seam = new THREE.Mesh(seamGeo, new THREE.MeshBasicMaterial({ color: 0xc95a0f }));
  group.add(seam);

  var glow = new THREE.PointLight(0xc95a0f, 0.3, 4);
  glow.position.set(0, 0, 0.9);
  group.add(glow);

  var st = { gap: 0.05, pointerGap: 0, rx: 0, ry: 0, trx: 0, try_: 0, hovering: false };
  var coarse = window.matchMedia('(pointer: coarse)').matches;

  host.addEventListener('pointermove', function (e) {
    if (coarse) return;
    var r = host.getBoundingClientRect();
    var px = ((e.clientX - r.left) / r.width) * 2 - 1;
    var py = ((e.clientY - r.top) / r.height) * 2 - 1;
    st.try_ = px * 0.38;
    st.trx = py * 0.16;
    st.pointerGap = 0.46;
    st.hovering = true;
  });
  host.addEventListener('pointerleave', function () {
    st.try_ = 0;
    st.trx = 0;
    st.pointerGap = 0;
    st.hovering = false;
  });

  var ro = new ResizeObserver(function () {
    var w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  ro.observe(host);

  function update(dt, t, p) {
    // scroll opens the seam as the hero scrolls away (p ≈ 0.5 at rest)
    var sp = p - 0.55;
    var scrollGap = sp > 0 ? Math.min(sp * 2.2, 1) * 0.4 : 0;
    var autoGap = coarse ? (Math.sin(t * 0.5) + 1) / 2 * 0.3 : 0;
    var target = 0.05 + Math.max(st.pointerGap, scrollGap, autoGap);

    st.gap += (target - st.gap) * 0.07;
    st.rx += (st.trx - st.rx) * 0.06;
    st.ry += (st.try_ - st.ry) * 0.06;

    group.rotation.y = -0.62 + Math.sin(t * 0.16) * 0.05 + st.ry + (p - 0.5) * 0.9;
    group.rotation.x = -0.03 + st.rx;
    left.position.x = -(0.5 + st.gap / 2);
    right.position.x = 0.5 + st.gap / 2;
    seam.scale.x = Math.max(st.gap, 0.04);
    glow.intensity = 0.25 + st.gap * 2.0;
  }

  window.BC.addScene({
    el: el,
    render: function (dt, t, p, v) {
      update(dt, t, p, v);
      renderer.render(scene, camera);
    },
    renderOnce: function () {
      st.gap = 0.2;
      update(0.016, 0.5, 0.5, 0);
      renderer.render(scene, camera);
    }
  });
})();
