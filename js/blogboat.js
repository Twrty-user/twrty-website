/* ============================================================
   twRty Blogboat — cinematic 3D layer (blogboat page ONLY)
   "In space": we drift over an alien planet surface (brand-gradient
   wireframe terrain) under a deep parallax starfield with purple /
   orange nebula glow. Camera glides forward on scroll and tilts with
   the pointer. Dimmed so page content stays easy to read.
   Loaded only by blogboat.html. Touches no shared script.
   Runs on mobile too (lighter); only "reduce motion" opts out.
============================================================ */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

(function () {
  'use strict';

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const canvas = document.querySelector('.bb-webgl');
  if (!canvas) return;

  const isMobile = window.matchMedia('(max-width: 760px)').matches
    || window.matchMedia('(hover: none)').matches;

  const BG = 0x0a0810;

  /* ---------------- renderer / scene / camera ---------------- */
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(BG, isMobile ? 0.00052 : 0.00040);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 8000);
  camera.position.set(0, 120, 360);
  camera.lookAt(0, 40, -900);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  /* ---------------- soft round sprite (stars / haze / nebula) ---------------- */
  function makeSprite(stops) {
    const s = 128, c = document.createElement('canvas'); c.width = c.height = s;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    (stops || [[0, 'rgba(255,255,255,1)'], [0.4, 'rgba(255,255,255,0.4)'], [1, 'rgba(255,255,255,0)']])
      .forEach(([o, col]) => grd.addColorStop(o, col));
    g.fillStyle = grd; g.fillRect(0, 0, s, s);
    return new THREE.CanvasTexture(c);
  }
  const starTex = makeSprite();
  const glowTex = makeSprite([[0, 'rgba(255,255,255,0.9)'], [0.5, 'rgba(255,255,255,0.18)'], [1, 'rgba(255,255,255,0)']]);

  /* procedural cratered moon surface — drawn to a canvas, used as both
     colour map and bump map so the key light carves real craters/edges */
  function makeMoonTexture(baseHex, craters) {
    const s = 256, c = document.createElement('canvas'); c.width = c.height = s;
    const g = c.getContext('2d');
    const base = new THREE.Color(baseHex);
    g.fillStyle = `rgb(${base.r * 255 | 0},${base.g * 255 | 0},${base.b * 255 | 0})`;
    g.fillRect(0, 0, s, s);
    // fine mottling / regolith speckle
    for (let i = 0; i < 1600; i++) {
      const a = Math.random() * 0.09;
      g.fillStyle = Math.random() < 0.5 ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a})`;
      g.beginPath(); g.arc(Math.random() * s, Math.random() * s, Math.random() * 2.5 + 0.6, 0, 6.283); g.fill();
    }
    // craters: dark bowl + bright sunlit rim
    for (let i = 0; i < craters; i++) {
      const x = Math.random() * s, y = Math.random() * s, rad = Math.random() * 18 + 5;
      const grd = g.createRadialGradient(x - rad * 0.3, y - rad * 0.3, rad * 0.1, x, y, rad);
      grd.addColorStop(0, 'rgba(0,0,0,0.0)');
      grd.addColorStop(0.55, 'rgba(0,0,0,0.32)');
      grd.addColorStop(0.82, 'rgba(0,0,0,0.10)');
      grd.addColorStop(0.96, 'rgba(255,255,255,0.16)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd; g.beginPath(); g.arc(x, y, rad, 0, 6.283); g.fill();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  /* gas-giant body: horizontal warm bands (Saturn) */
  function makeGasTexture() {
    const s = 256, c = document.createElement('canvas'); c.width = c.height = s;
    const g = c.getContext('2d');
    const base = new THREE.Color(0xe7d3a1), dark = new THREE.Color(0xb98f54);
    const col = new THREE.Color();
    for (let y = 0; y < s; y++) {
      const t = y / s;
      const band = 0.5 + 0.5 * Math.sin(t * Math.PI * 7 + Math.sin(t * 30) * 0.6);
      const m = Math.min(1, Math.max(0, band * 0.7 + (Math.random() - 0.5) * 0.08));
      col.copy(base).lerp(dark, m);
      g.fillStyle = `rgb(${col.r * 255 | 0},${col.g * 255 | 0},${col.b * 255 | 0})`;
      g.fillRect(0, y, s, 1);
    }
    return new THREE.CanvasTexture(c);
  }

  /* concentric ring bands with gaps — maps onto a RingGeometry */
  function makeRingTexture() {
    const s = 256, c = document.createElement('canvas'); c.width = c.height = s;
    const g = c.getContext('2d'); g.clearRect(0, 0, s, s);
    const cx = s / 2, cy = s / 2, half = s / 2, N = 70;
    for (let i = 0; i < N; i++) {
      const f = 0.585 + (i / N) * 0.40;          // matches ring inner/outer ratio
      let a = 0.2 + Math.random() * 0.55;
      if (Math.random() < 0.13) a = 0.02;        // Cassini-like gaps
      g.strokeStyle = `rgba(228,206,170,${a})`;
      g.lineWidth = (0.40 * half / N) + 0.6;
      g.beginPath(); g.arc(cx, cy, f * half, 0, 6.283); g.stroke();
    }
    return new THREE.CanvasTexture(c);
  }

  /* ---------------- planet surface: flowing wireframe terrain ---------------- */
  const SEG_X = isMobile ? 60 : 120;
  const SEG_Y = isMobile ? 60 : 120;
  const W = 5200;
  const D = 5200;

  const geo = new THREE.PlaneGeometry(W, D, SEG_X, SEG_Y);
  geo.rotateX(-Math.PI / 2);

  const vcount = geo.attributes.position.count;
  const colors = new Float32Array(vcount * 3);
  const cValley = new THREE.Color(0x5b2eff);
  const cMid = new THREE.Color(0x8b6bff);
  const cPeak = new THREE.Color(0xef9264);
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.MeshBasicMaterial({
    wireframe: true,
    vertexColors: true,
    transparent: true,
    opacity: isMobile ? 0.5 : 0.62,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const terrain = new THREE.Mesh(geo, mat);
  terrain.position.y = -150;
  terrain.position.z = -1400;
  scene.add(terrain);

  const pos = geo.attributes.position;
  const baseX = new Float32Array(vcount);
  const baseZ = new Float32Array(vcount);
  for (let i = 0; i < vcount; i++) {
    baseX[i] = pos.getX(i);
    baseZ[i] = pos.getZ(i);
  }
  const tmpC = new THREE.Color();

  function shapeTerrain(t) {
    let maxH = 1;
    for (let i = 0; i < vcount; i++) {
      const x = baseX[i], z = baseZ[i];
      const h =
        Math.sin(x * 0.0016 + t * 0.6) * 60 +
        Math.cos(z * 0.0021 - t * 0.9) * 70 +
        Math.sin((x + z) * 0.0012 + t * 0.4) * 45 +
        Math.sin(x * 0.004 - z * 0.003 + t * 1.2) * 22;
      pos.setY(i, h);
      if (Math.abs(h) > maxH) maxH = Math.abs(h);
    }
    for (let i = 0; i < vcount; i++) {
      const n = (pos.getY(i) / maxH) * 0.5 + 0.5;
      if (n < 0.5) tmpC.copy(cValley).lerp(cMid, n / 0.5);
      else tmpC.copy(cMid).lerp(cPeak, (n - 0.5) / 0.5);
      const i3 = i * 3;
      colors[i3] = tmpC.r; colors[i3 + 1] = tmpC.g; colors[i3 + 2] = tmpC.b;
    }
    pos.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
  }

  /* ---------------- deep parallax starfield ---------------- */
  // Cool lilac-white stars with a warm-orange minority. Three depth
  // layers give real parallax; they sit in one group that drifts and
  // shifts opposite the terrain when the pointer moves.
  const starGroup = new THREE.Group();
  scene.add(starGroup);

  const cStarCool = new THREE.Color(0xdfe0ff);
  const cStarLilac = new THREE.Color(0xb9a8ff);
  const cStarWarm = new THREE.Color(0xffb079);

  function makeStarLayer(count, size, spread, depth, baseOpacity) {
    const p = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() * 2 - 1) * spread;
      p[i * 3 + 1] = Math.random() * (spread * 0.7) - 200;   // mostly above the surface
      p[i * 3 + 2] = -Math.random() * depth + 400;
      const r = Math.random();
      const cc = r > 0.88 ? cStarWarm : (r > 0.5 ? cStarLilac : cStarCool);
      col[i * 3] = cc.r; col[i * 3 + 1] = cc.g; col[i * 3 + 2] = cc.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const m = new THREE.PointsMaterial({
      size, map: starTex, vertexColors: true,
      transparent: true, opacity: baseOpacity, depthWrite: false,
      blending: THREE.AdditiveBlending, sizeAttenuation: true,
    });
    const pts = new THREE.Points(g, m);
    starGroup.add(pts);
    return pts;
  }

  const starsFar = makeStarLayer(isMobile ? 480 : 960, isMobile ? 5 : 6, 4200, 6000, 0.55);
  const starsMid = makeStarLayer(isMobile ? 220 : 440, isMobile ? 9 : 11, 3400, 4200, 0.7);
  const starsNear = makeStarLayer(isMobile ? 70 : 140, isMobile ? 16 : 20, 2600, 2600, 0.9);

  /* ---------------- nebula glow (brand-tinted cosmic clouds) ---------------- */
  const nebula = new THREE.Group();
  scene.add(nebula);
  const nebColors = [0x6a3cff, 0x6a3cff, 0x9b6bff, 0xe35929, 0xef9264, 0x7c5cff];
  const NEB = isMobile ? 5 : 7;
  for (let i = 0; i < NEB; i++) {
    const m = new THREE.SpriteMaterial({
      map: glowTex, color: nebColors[i % nebColors.length],
      transparent: true, opacity: 0.10, depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const sp = new THREE.Sprite(m);
    const sc = 1600 + Math.random() * 1800;
    sp.scale.set(sc, sc, 1);
    sp.position.set(
      (Math.random() * 2 - 1) * 2800,
      Math.random() * 1400 - 200,
      -800 - Math.random() * 3200
    );
    sp.userData.drift = (Math.random() * 2 - 1) * 0.04;
    nebula.add(sp);
  }

  /* ---------------- moons & planets (lit, with rim glow) ----------------
     A single warm key light gives each sphere a crescent terminator so
     it reads as a moon in space; a soft additive halo is the rim glow.
     Kept small, dim and edge-placed so they never crowd the content. */
  scene.add(new THREE.AmbientLight(0x3a3560, 1.05));
  const keyLight = new THREE.DirectionalLight(0xfff3e6, 3.4);
  keyLight.position.set(0.55, 0.4, 0.9);   // front-side: shows a clear lit 3D face
  scene.add(keyLight);

  const planets = [];
  function addPlanet(o) {
    const grp = new THREE.Group();
    const tex = makeMoonTexture(o.color, o.craters || 26);
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(o.r, 48, 48),
      new THREE.MeshStandardMaterial({
        map: tex, bumpMap: tex, bumpScale: o.bump != null ? o.bump : 2.4,
        color: o.tint != null ? o.tint : 0xffffff, emissive: o.emissive, emissiveIntensity: o.emI != null ? o.emI : 0.32,
        roughness: 0.9, metalness: 0.0,
      })
    );
    grp.add(body);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTex, color: o.glow, transparent: true, opacity: o.glowOp,
      depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    halo.scale.set(o.r * 6.5, o.r * 6.5, 1);
    grp.add(halo);
    grp.position.set(o.x, o.y, o.z);
    grp.userData = { body, bx: o.x, by: o.y, spin: o.spin, fs: o.fs, ph: Math.random() * 6.28, par: o.par || 60 };
    scene.add(grp);
    planets.push(grp);
  }
  // Saturn: round banded body + tilted ring, lives in the same float/spin list
  function addSaturn(o) {
    const grp = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(o.r, 48, 48),
      new THREE.MeshStandardMaterial({
        map: makeGasTexture(), color: 0x615e52,
        emissive: 0x18130c, emissiveIntensity: 0.12, roughness: 0.95, metalness: 0.0,
      })
    );
    grp.add(body);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(o.r * 1.35, o.r * 2.35, 96, 1),
      new THREE.MeshBasicMaterial({
        map: makeRingTexture(), transparent: true, side: THREE.DoubleSide,
        depthWrite: false, opacity: 0.35,
      })
    );
    ring.rotation.x = -Math.PI / 2;     // lay flat in the body's equatorial plane
    body.add(ring);                     // spins with the body (circular → no visible spin)
    grp.position.set(o.x, o.y, o.z);
    grp.rotation.x = -0.46;             // tilt so the ring reads as an ellipse
    grp.rotation.z = 0.22;
    grp.userData = { body, bx: o.x, by: o.y, spin: o.spin, fs: o.fs, ph: Math.random() * 6.28, par: o.par || 60 };
    scene.add(grp);
    planets.push(grp);
  }

  // warm moon (upper-left), purple planet (upper-right, larger), Saturn (mid-right)
  addPlanet({ r: 58, color: 0xd98a4a, bump: 0.8, tint: 0xb0b0b0, emissive: 0x3a1e0c, emI: 0.34, glow: 0xffb877, glowOp: 0.11, x: -620, y: 500, z: -1500, spin: 0.0016, fs: 0.5, par: 95 });   // Moon — orange, far left, close → drifts most
  addPlanet({ r: 92, color: 0x866ae0, emissive: 0x281a52, glow: 0x9b7bff, glowOp: 0.42, x: 60, y: 820, z: -2600, spin: 0.0011, fs: 0.38, par: 40 });            // purple — far → drifts least
  addSaturn({ r: 50, x: 640, y: 470, z: -1450, spin: 0.0018, fs: 0.6, par: 100 });                                                                                // Saturn — right, close → drifts most

  /* ---------------- interaction ---------------- */
  let pointerX = 0, pointerY = 0;
  let camX = 0, camY = 120, scrollProgress = 0;
  let pxE = 0, pyE = 0;   // eased pointer, drives planet parallax

  window.addEventListener('mousemove', (e) => {
    pointerX = (e.clientX / window.innerWidth) * 2 - 1;
    pointerY = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  function readScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  }
  window.addEventListener('scroll', readScroll, { passive: true });
  readScroll();

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize, { passive: true });

  /* ---------------- loop (throttled, pauses when hidden) ---------------- */
  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) { last = 0; requestAnimationFrame(loop); }
  });

  const fpsCap = isMobile ? 30 : 50;
  const frameMs = 1000 / fpsCap;
  let last = 0, t0 = performance.now(), revealed = false;

  function loop(now) {
    if (!running) return;
    requestAnimationFrame(loop);
    if (now - last < frameMs) return;
    last = now;

    const t = (now - t0) * 0.00045;
    shapeTerrain(t);

    // scroll glides the camera forward over the planet; pointer tilts it
    const targetX = pointerX * 140;
    const targetY = 120 - pointerY * 70 + scrollProgress * 60;
    camX += (targetX - camX) * 0.05;
    camY += (targetY - camY) * 0.05;
    camera.position.x = camX;
    camera.position.y = camY;
    camera.position.z = 360 - scrollProgress * 900;
    camera.lookAt(camX * 0.3, 40, camera.position.z - 1100);

    // starfield: slow drift + gentle parallax opposite the pointer
    starGroup.rotation.y += 0.00012;
    starGroup.position.x += (-pointerX * 90 - starGroup.position.x) * 0.03;
    starGroup.position.y += (pointerY * 50 - starGroup.position.y) * 0.03;
    // twinkle on the bright near stars
    starsNear.material.opacity = 0.75 + Math.sin(t * 2.2) * 0.18;

    // nebula clouds breathe sideways
    for (let i = 0; i < nebula.children.length; i++) {
      nebula.children[i].position.x += nebula.children[i].userData.drift;
    }

    // moons/planets: spin, float gently, and drift with the pointer (depth parallax)
    pxE += (pointerX - pxE) * 0.05;
    pyE += (pointerY - pyE) * 0.05;
    for (let i = 0; i < planets.length; i++) {
      const p = planets[i];
      p.userData.body.rotation.y += p.userData.spin;
      p.position.x = p.userData.bx + Math.sin(t * p.userData.fs + p.userData.ph) * 28 + pxE * p.userData.par;
      p.position.y = p.userData.by + Math.cos(t * p.userData.fs * 0.8 + p.userData.ph) * 18 - pyE * p.userData.par * 0.55;
    }

    renderer.render(scene, camera);
    if (!revealed) { revealed = true; canvas.classList.add('is-ready'); }
  }
  requestAnimationFrame(loop);
})();
