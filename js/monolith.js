/* ============================================================
   BATRES COMPANY LIMITED — monolith.js (V2)
   Full-bleed hero world: split concrete monolith with a molten
   rust seam, fog, drifting dust, glow. Pointer parallax opens
   the seam; on desktop the hero pins and the camera dollies
   THROUGH the opening seam as you scroll.
   ============================================================ */

(function () {
  'use strict';
  if (!window.THREE || !window.BC) return;
  var THREE = window.THREE;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  var hero = document.querySelector('.hero');
  var host = document.querySelector('.hero-canvas');
  if (!hero || !host) return;

  var W = host.clientWidth || window.innerWidth;
  var H = host.clientHeight || window.innerHeight;

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.BC.coarse ? 1.75 : 2));
  renderer.setSize(W, H);
  host.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0F0F0E, 0.055);

  var camera = new THREE.PerspectiveCamera(30, W / H, 0.05, 100);

  scene.add(new THREE.AmbientLight(0xffffff, 0.42));
  var key = new THREE.DirectionalLight(0xfff2e6, 0.85);
  key.position.set(3.5, 4, 2.5);
  scene.add(key);
  var rim = new THREE.DirectionalLight(0xdfe6ee, 0.35);
  rim.position.set(-4, 2, -3);
  scene.add(rim);

  var group = new THREE.Group();
  scene.add(group);

  /* concrete halves */
  var concrete = new THREE.MeshStandardMaterial({ color: 0xCFCEC8, roughness: 0.93, metalness: 0.0, flatShading: true });
  new THREE.TextureLoader().load('/assets/gen/tex-01.webp', function (tex) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(0.9, 0.9);
    concrete.map = tex;
    concrete.color.set(0xE2E1DC);
    concrete.needsUpdate = true;
  }, undefined, function () { /* texture optional */ });

  var halfGeo = new THREE.BoxGeometry(1.05, 1.7, 1.7);
  var edgeMat = new THREE.LineBasicMaterial({ color: 0x0C0C0B, transparent: true, opacity: 0.55 });
  function mkHalf() {
    var m = new THREE.Mesh(halfGeo, concrete);
    m.add(new THREE.LineSegments(new THREE.EdgesGeometry(halfGeo), edgeMat));
    group.add(m);
    return m;
  }
  var left = mkHalf();
  var right = mkHalf();

  /* molten seam + glow */
  var seam = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1.64, 1.64),
    new THREE.MeshBasicMaterial({ color: 0xFF7A29 })
  );
  group.add(seam);

  var glowCanvas = document.createElement('canvas');
  glowCanvas.width = glowCanvas.height = 256;
  var g = glowCanvas.getContext('2d');
  var grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255,140,60,0.85)');
  grad.addColorStop(0.35, 'rgba(255,110,35,0.32)');
  grad.addColorStop(1, 'rgba(255,110,35,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  var glowTex = new THREE.CanvasTexture(glowCanvas);
  var glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  glow.scale.set(3.6, 3.6, 1);
  group.add(glow);

  var pl = new THREE.PointLight(0xFF7A29, 0.5, 6);
  pl.position.set(0, 0, 0.8);
  group.add(pl);

  /* drifting dust */
  var COUNT = 260;
  var pos = new Float32Array(COUNT * 3);
  for (var i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 10;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 7;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  var dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  var dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    color: 0xC9A88A, size: 0.022, transparent: true, opacity: 0.55,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  scene.add(dust);

  /* state */
  var st = { gap: 0.05, pointerGap: 0, rx: 0, ry: 0, trx: 0, try_: 0, sp: 0 };
  var coarse = window.BC.coarse;

  host.parentNode.addEventListener('pointermove', function (e) {
    if (coarse) return;
    var px = (e.clientX / window.innerWidth) * 2 - 1;
    var py = (e.clientY / window.innerHeight) * 2 - 1;
    st.try_ = px * 0.3;
    st.trx = py * 0.12;
    st.pointerGap = 0.34;
  });
  host.parentNode.addEventListener('pointerleave', function () {
    st.try_ = 0; st.trx = 0; st.pointerGap = 0;
  });

  var ro = new ResizeObserver(function () {
    var w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  ro.observe(host);

  /* desktop: pin hero, scrub camera through the seam */
  var pinned = false;
  if (hasGsap && !window.BC.reduced) {
    var mm = gsap.matchMedia();
    mm.add('(min-width: 861px)', function () {
      pinned = true;
      ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: '+=170%',
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        onUpdate: function (self) { st.sp = self.progress; }
      });
      gsap.to('.hero-inner', {
        yPercent: -36, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: '+=70%', scrub: true }
      });
      gsap.to('.hero-scroll-hint, .hero-meta', {
        opacity: 0, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: '+=30%', scrub: true }
      });
      return function () { pinned = false; };
    });
  }

  function smooth(x) { return x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* camera path: orbit view -> approach -> inside the seam */
  var A = new THREE.Vector3(3.6, 2.1, 6.2);
  var B = new THREE.Vector3(1.4, 0.7, 3.4);
  var C = new THREE.Vector3(0, 0.05, 1.02);
  var tmp1 = new THREE.Vector3(), tmp2 = new THREE.Vector3(), camPos = new THREE.Vector3();

  function update(dt, t, p) {
    var sp = pinned ? st.sp : smooth((p - 0.5) * 2.2);

    /* seam gap: idle breath + pointer + scroll opening */
    var scrollGap = smooth(sp) * 1.45;
    var autoGap = coarse ? (Math.sin(t * 0.5) + 1) / 2 * 0.22 : 0;
    var target = 0.13 + Math.max(st.pointerGap * (1 - sp), autoGap) + scrollGap;
    st.gap += (target - st.gap) * 0.07;

    st.rx += (st.trx * (1 - sp) - st.rx) * 0.06;
    st.ry += (st.try_ * (1 - sp) - st.ry) * 0.06;

    group.rotation.y = lerp(-0.55, 0, smooth(sp)) + Math.sin(t * 0.16) * 0.04 * (1 - sp) + st.ry;
    group.rotation.x = -0.02 * (1 - sp) + st.rx;
    group.position.y = Math.sin(t * 0.4) * 0.05 * (1 - sp);

    left.position.x = -(0.55 + st.gap / 2);
    right.position.x = 0.55 + st.gap / 2;
    seam.scale.x = Math.max(st.gap * 0.9, 0.04);
    glow.material.opacity = 0.75 + Math.sin(t * 2.1) * 0.1;
    glow.scale.setScalar(3.2 + st.gap * 1.6);
    pl.intensity = 0.45 + st.gap * 1.6 + Math.sin(t * 2.1) * 0.06;

    /* camera along quadratic bezier A->B->C */
    var ct = smooth(sp);
    tmp1.lerpVectors(A, B, ct);
    tmp2.lerpVectors(B, C, ct);
    camPos.lerpVectors(tmp1, tmp2, ct);
    camera.position.copy(camPos);
    camera.lookAt(0, 0, 0);

    /* dust drift */
    var arr = dustGeo.attributes.position.array;
    for (var i = 0; i < COUNT; i++) {
      arr[i * 3 + 1] += dt * 0.06;
      if (arr[i * 3 + 1] > 3.5) arr[i * 3 + 1] = -3.5;
    }
    dustGeo.attributes.position.needsUpdate = true;

    /* fade out at the very end of the dolly (we are inside the seam) */
    host.style.opacity = String(1 - smooth((sp - 0.86) / 0.14));
  }

  window.BC.addScene({
    el: hero,
    render: function (dt, t, p, v) {
      update(dt, t, p, v);
      renderer.render(scene, camera);
    },
    renderOnce: function () {
      st.gap = 0.3;
      st.sp = 0;
      update(0.016, 0.5, 0.5, 0);
      renderer.render(scene, camera);
    }
  });
})();
