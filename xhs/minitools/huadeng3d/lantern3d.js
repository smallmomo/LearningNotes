/* 3D 花灯渲染（three.js · UMD 全局版，可 file:// 直接打开）。
   样式与流程参考同目录的 SVG 版：扎骨 / 糊纸 / 描花 / 系穗 / 点灯。
   不使用 ES module / OrbitControls，避免 file:// 下的 CORS 限制。 */
(function (global) {
  const THREE = global.THREE;
  if (!THREE) {
    console.error('three.min.js 未加载');
    return;
  }

  const PALETTE = {
    vermilion: { edge: '#571d17', mid: '#b84926', lit: '#ffc174', paper: '#b65535', ink: '#ffe1a0' },
    ivory:     { edge: '#726041', mid: '#c9ae77', lit: '#fff3c3', paper: '#dcca9e', ink: '#825a35' },
    jade:      { edge: '#183d37', mid: '#497566', lit: '#d2d697', paper: '#648976', ink: '#eee0a6' },
    rose:      { edge: '#55282b', mid: '#ac6764', lit: '#ffd4a0', paper: '#bd8684', ink: '#ffdda0' }
  };

  // 与 SVG 版一致：widthAt(t) 返回 t∈[0,1] 处的半宽（竹骨弧度）。
  const SHAPES = {
    round:  { height: 282, widthAt: t => 38 + 110 * Math.pow(Math.sin(Math.PI * t), .62) },
    tall:   { height: 340, widthAt: t => 40 + 82 * Math.pow(Math.sin(Math.PI * t), .64) },
    barrel: { height: 270, widthAt: t => 96 + 20 * Math.pow(Math.sin(Math.PI * t), .65) },
    globe:  { height: 290, widthAt: t => Math.sqrt(145 * 145 - Math.pow((t - .5) * 282, 2)) },
    oval:   { height: 350, widthAt: t => 30 + 77 * Math.pow(Math.sin(Math.PI * t), .85) },
    melon:  { height: 246, widthAt: t => 40 + 126 * Math.pow(Math.sin(Math.PI * t), .6) },
    hex:    { height: 280, widthAt: t => 102 + 12 * Math.sin(Math.PI * t), faceted: true, sides: 6 },
    lotus:  { kind: 'lotus',  height: 230, widthAt: (t) => 70 + 150 * Math.pow(Math.sin(Math.PI * t), .6) },
    rabbit: { kind: 'rabbit', height: 230, widthAt: (t) => 60 + 130 * Math.pow(Math.sin(Math.PI * t), .7) }
  };

  const TASSEL = {
    red:  { dark: 0x69291e, light: 0xdf7944 },
    gold: { dark: 0x766034, light: 0xe6c780 }
  };

  const SCALE = 0.015;
  const METAL = 0xd5b370;

  // 简易轨道控制：拖拽旋转 + 滚轮缩放（替代 OrbitControls，免去模块依赖）。
  class SimpleControls {
    constructor(dom, target, radius, minR, maxR) {
      this.target = target.clone();
      this.radius = radius;
      this.minR = minR;
      this.maxR = maxR;
      this.theta = 0;
      this.phi = Math.PI / 2 - 0.05;
      this.dragging = false;
      this.px = 0;
      this.py = 0;
      dom.style.touchAction = 'none';
      dom.addEventListener('pointerdown', (e) => {
        this.dragging = true;
        this.px = e.clientX;
        this.py = e.clientY;
        if (dom.setPointerCapture) dom.setPointerCapture(e.pointerId);
      });
      dom.addEventListener('pointerup', () => { this.dragging = false; });
      dom.addEventListener('pointercancel', () => { this.dragging = false; });
      dom.addEventListener('pointermove', (e) => {
        if (!this.dragging) return;
        const dx = e.clientX - this.px;
        const dy = e.clientY - this.py;
        this.px = e.clientX;
        this.py = e.clientY;
        this.theta -= dx * 0.005;
        this.phi -= dy * 0.005;
        this.phi = Math.max(0.15, Math.min(Math.PI - 0.15, this.phi));
      });
      dom.addEventListener('wheel', (e) => {
        e.preventDefault();
        this.radius *= (1 + e.deltaY * 0.001);
        this.radius = Math.max(this.minR, Math.min(this.maxR, this.radius));
      }, { passive: false });
    }
    apply(camera) {
      const r = this.radius;
      camera.position.set(
        this.target.x + r * Math.sin(this.phi) * Math.sin(this.theta),
        this.target.y + r * Math.cos(this.phi),
        this.target.z + r * Math.sin(this.phi) * Math.cos(this.theta)
      );
      camera.lookAt(this.target);
    }
  }

  function buildFrame(shape) {
    const g = new THREE.Group();
    const mat = new THREE.LineBasicMaterial({ color: 0xc9a063, transparent: true, opacity: 0.55 });
    const meridians = shape.faceted ? (shape.sides || 6) : shape === SHAPES.melon ? 10 : 16;
    const top = 0.5 * shape.height * SCALE;
    const bottom = -0.5 * shape.height * SCALE;
    for (let m = 0; m < meridians; m++) {
      const a = (m / meridians) * Math.PI * 2;
      const pts = [];
      const N = 48;
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        const r = shape.widthAt(t) * SCALE * (shape === SHAPES.melon ? 1 + .09 * Math.cos(a * 10) : 1);
        const y = bottom + t * (top - bottom);
        pts.push(new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r));
      }
      g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
    }
    const rings = 5;
    for (let ri = 1; ri < rings; ri++) {
      const t = ri / rings;
      const r = shape.widthAt(t) * SCALE;
      const y = bottom + t * (top - bottom);
      const pts = [];
      const S = shape.faceted ? shape.sides : 96;
      for (let i = 0; i <= S; i++) {
        const a = (i / S) * Math.PI * 2;
        const radius = r * (shape === SHAPES.melon ? 1 + .09 * Math.cos(a * 10) : 1);
        pts.push(new THREE.Vector3(Math.sin(a) * radius, y, Math.cos(a) * radius));
      }
      g.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), mat));
    }
    return g;
  }

  function metalRing(radius, y, mat) {
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, Math.max(radius * 0.065, 0.035), 12, 48), mat);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.y = y;
    return mesh;
  }

  function motifTexture(pattern, p) {
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    const x = c.getContext('2d');
    x.fillStyle = p.paper;
    x.fillRect(0, 0, 512, 512);
    // Deterministic fibres keep paper tactile without flickering on selection.
    for (let i = 0; i < 1600; i++) {
      const xx = (i * 137.51) % 512, yy = (i * 73.37) % 512;
      x.fillStyle = i % 2 ? 'rgba(255,248,225,.035)' : 'rgba(70,40,20,.035)';
      x.fillRect(xx, yy, 1, 2 + i % 5);
    }
    const wash = x.createLinearGradient(0, 0, 0, 512);
    wash.addColorStop(0, 'rgba(65,27,18,.14)');
    wash.addColorStop(.38, 'rgba(255,240,206,.08)');
    wash.addColorStop(.65, 'rgba(255,240,206,.04)');
    wash.addColorStop(1, 'rgba(65,27,18,.14)');
    x.fillStyle = wash; x.fillRect(0, 0, 512, 512);
    x.strokeStyle = p.ink;
    x.fillStyle = p.ink;
    x.lineCap = 'round';
    x.lineJoin = 'round';
    if (pattern === 'plain') {
      // 素面
    } else if (pattern === 'fortune') {
      x.font = 'bold 240px "SimSun", serif';
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText('福', 256, 278);
    } else if (pattern === 'plum') {
      x.lineWidth = 5;
      x.beginPath();
      x.moveTo(40, 470);
      x.quadraticCurveTo(220, 360, 300, 250);
      x.quadraticCurveTo(360, 170, 470, 150);
      x.stroke();
      [[300, 250], [380, 180], [430, 210], [250, 330], [420, 300]].forEach(([cx, cy]) => {
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          x.globalAlpha = 0.5;
          x.beginPath();
          x.ellipse(cx + Math.cos(a) * 16, cy + Math.sin(a) * 16, 10, 16, a, 0, Math.PI * 2);
          x.fill();
        }
        x.globalAlpha = 1;
        x.beginPath();
        x.arc(cx, cy, 6, 0, Math.PI * 2);
        x.fill();
      });
    } else if (pattern === 'cloud') {
      x.lineWidth = 2.5;
      [[140,140],[345,250],[175,370]].forEach(([cx,cy]) => {
        x.beginPath(); x.moveTo(cx-68,cy+18);
        x.bezierCurveTo(cx-105,cy+18,cx-95,cy-18,cx-65,cy-12);
        x.bezierCurveTo(cx-70,cy-57,cx-10,cy-65,cx+5,cy-28);
        x.bezierCurveTo(cx+44,cy-53,cx+76,cy-8,cx+47,cy+8);
        x.bezierCurveTo(cx+24,cy+24,cx-18,cy+1,cx-38,cy+18);
        x.stroke();
        x.beginPath(); x.moveTo(cx-50,cy+32); x.quadraticCurveTo(cx+4,cy+19,cx+65,cy+32); x.stroke();
      });
    }
    const tex = new THREE.CanvasTexture(c);
    if ('colorSpace' in tex) tex.colorSpace = THREE.SRGBColorSpace;
    else if ('sRGBEncoding' in THREE) tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function bodyGeometry(shape) {
    const pts = [];
    const N = 64;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const r = Math.max(shape.widthAt(t) * SCALE, 0.001);
      const y = (t - 0.5) * shape.height * SCALE;
      pts.push(new THREE.Vector2(r, y));
    }
    const seg = shape.faceted ? (shape.sides || 6) : 96;
    const geometry = new THREE.LatheGeometry(pts, seg);
    if (!shape.faceted) {
      const pos = geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const a = Math.atan2(pos.getX(i), pos.getZ(i));
        const t = pos.getY(i) / (shape.height * SCALE) + .5;
        const lobe = shape === SHAPES.melon ? 1 + .09 * Math.cos(a * 10) : 1 - .012 * (1 - Math.cos(a * 16)) * Math.sin(Math.PI * t);
        pos.setXYZ(i, pos.getX(i) * lobe, pos.getY(i), pos.getZ(i) * lobe);
      }
      geometry.computeVertexNormals();
    }
    return geometry;
  }

  function buildBody(shape, p, lit, showMotif, pattern) {
    const grp = new THREE.Group();
    const tex = motifTexture(showMotif ? pattern : 'plain', p);
    tex.wrapS = THREE.RepeatWrapping; tex.repeat.x = 3; tex.offset.x = .5;
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: tex,
      emissive: lit ? new THREE.Color(p.paper) : new THREE.Color(0x000000),
      emissiveIntensity: lit ? 0.38 : 0,
      roughness: 0.94,
      metalness: 0,
      side: THREE.DoubleSide,
      flatShading: !!shape.faceted
    });
    const mesh = new THREE.Mesh(bodyGeometry(shape), mat);
    grp.add(mesh);
    const top = 0.5 * shape.height * SCALE;
    const bottom = -0.5 * shape.height * SCALE;
    const topDisk = new THREE.Mesh(new THREE.CircleGeometry(shape.widthAt(0) * SCALE, 32), mat);
    topDisk.rotation.x = -Math.PI / 2;
    topDisk.position.y = top;
    const bottomDisk = new THREE.Mesh(new THREE.CircleGeometry(shape.widthAt(1) * SCALE, 32), mat);
    bottomDisk.rotation.x = Math.PI / 2;
    bottomDisk.position.y = bottom;
    grp.add(topDisk, bottomDisk);
    return grp;
  }

  function paperMaterial(p, lit, pattern) {
    return new THREE.MeshStandardMaterial({
      color: 0xffffff, map: motifTexture(pattern, p), roughness: .96,
      metalness: 0, side: THREE.DoubleSide,
      emissive: p.paper, emissiveIntensity: lit ? .38 : 0
    });
  }

  // Curved, cupped petals: the same surface defines both paper and bamboo ribs.
  function petalPoint(t, u, layer) {
    const width = Math.pow(Math.sin(Math.PI * t), .56) * layer.width;
    return new THREE.Vector3(u * width,
      layer.y + layer.height * (1 - Math.cos(t * Math.PI / 2)) - .2 * Math.pow(t, 7) + .28 * u * u * Math.sin(Math.PI * t),
      .12 + layer.reach * Math.sin(t * Math.PI / 2) - .38 * u * u * Math.sin(Math.PI * t));
  }

  function buildLotus(p, lit, showMotif, pattern) {
    const g = new THREE.Group();
    const mat = paperMaterial(p, lit, showMotif ? pattern : 'plain');
    const ribMat = new THREE.LineBasicMaterial({ color: 0xd5b370, transparent: true, opacity: .3 });
    [
      { n: 9, width: .95, height: 1.2, reach: 2.4, y: -1.0 },
      { n: 7, width: .8, height: 1.8, reach: 1.65, y: -.9 },
      { n: 5, width: .59, height: 2.0, reach: .86, y: -.8 }
    ].forEach((layer, index) => {
      for (let k = 0; k < layer.n; k++) {
        const petal = new THREE.Group();
        petal.rotation.y = k * Math.PI * 2 / layer.n + index * .36;
        const positions = [], uv = [], indices = [], colors = [];
        const rows = 24, cols = 12;
        for (let i = 0; i <= rows; i++) {
          for (let j = 0; j <= cols; j++) {
            const v = petalPoint(i / rows, j / cols * 2 - 1, layer);
            positions.push(v.x, v.y, v.z);
            uv.push(j / cols, i / rows);
            const tint = new THREE.Color(0xfff4d8).lerp(new THREE.Color(0xffffff), Math.pow(i / rows, .7));
            const shade = .87 + .13 * Math.sin(Math.PI * i / rows);
            colors.push(tint.r * shade, tint.g * shade, tint.b * shade);
            if (i < rows && j < cols) {
              const a = i * (cols + 1) + j, b = a + cols + 1;
              indices.push(a, b, a + 1, b, b + 1, a + 1);
            }
          }
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        mat.vertexColors = true;
        geo.setIndex(indices); geo.computeVertexNormals();
        petal.add(new THREE.Mesh(geo, mat));
        [-1, 0, 1].forEach(u => {
          const pts = Array.from({ length: 33 }, (_, i) => petalPoint(i / 32, u, layer));
          petal.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ribMat));
        });
        g.add(petal);
      }
    });
    const core = new THREE.Mesh(new THREE.SphereGeometry(.48, 24, 16),
      new THREE.MeshStandardMaterial({ color: 0xe6bf69, roughness: .8, emissive: 0xffbb44, emissiveIntensity: lit ? .6 : 0 }));
    core.position.y = .15; core.scale.y = .6; g.add(core);
    return g;
  }

  function buildRabbit(p, lit, showMotif, pattern) {
    const g = new THREE.Group();
    const mat = paperMaterial(p, lit, 'plain');
    const bodyMat = paperMaterial(p, lit, showMotif ? pattern : 'plain');
    const accent = new THREE.MeshStandardMaterial({ color: 0xd9a09a, roughness: .9 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x392b2a, roughness: .6 });
    function ellipsoid(scale, position, material, tilt = 0) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), material);
      mesh.scale.set(...scale); mesh.position.set(...position); mesh.rotation.z = tilt;
      g.add(mesh); return mesh;
    }
    const belly = ellipsoid([1.05, 1.17, .85], [0, -.38, 0], bodyMat);
    // Place the drawing on the visible belly instead of the sphere's back seam.
    const pos = belly.geometry.attributes.position, uv = belly.geometry.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) * .5 + .5, pos.getY(i) * .5 + .5);
    ellipsoid([.99, .85, .8], [0, .98, .36], mat);
    [-1, 1].forEach(sign => {
      ellipsoid([.29, sign < 0 ? .96 : 1.05, .22], [sign * .43, 2.25, .3], mat, sign < 0 ? .29 : -.12);
      const inner = ellipsoid([.15, sign < 0 ? .68 : .78, .06], [sign * .45, 2.29, .5], accent, sign < 0 ? .29 : -.12);
      inner.userData.decoration = true;
      ellipsoid([.38, .23, .55], [sign * .59, -1.4, .37], mat);
      ellipsoid([.22, .39, .23], [sign * .76, -.38, .63], mat, sign * .32);
      const eye = ellipsoid([.06, .08, .045], [sign * .36, 1.08, 1.105], dark);
      eye.userData.decoration = true;
    });
    const nose = ellipsoid([.065, .045, .045], [0, .88, 1.18], accent);
    nose.userData.decoration = true;
    const mouthMat = new THREE.LineBasicMaterial({ color: 0x60453f });
    const mouth = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-.11,.79,1.157),new THREE.Vector3(0,.82,1.17),new THREE.Vector3(.11,.79,1.157)
    ]),mouthMat);
    g.add(mouth);
    ellipsoid([.4, .4, .4], [0, -.7, -1.03], mat);
    return g;
  }

  function surfaceFrame(body) {
    const g = new THREE.Group();
    const mat = new THREE.LineBasicMaterial({ color: 0xd3b77f, transparent: true, opacity: .78 });
    body.updateMatrixWorld(true);
    body.traverse(o => {
      if (!o.isMesh || o.userData.decoration) return;
      // Sphere longitude/latitude lines avoid a dense triangulated wire mesh.
      if (o.geometry.type === 'SphereGeometry') {
        for (let axis = 0; axis < 2; axis++) {
          const n = axis ? 5 : 10;
          for (let k = 0; k < n; k++) {
            const pts = [];
            for (let i = 0; i <= 64; i++) {
              const a = i / 64 * Math.PI * 2;
              const b = axis ? (k + 1) / (n + 1) * Math.PI : k / n * Math.PI;
              pts.push((axis
                ? new THREE.Vector3(Math.sin(b) * Math.cos(a), Math.cos(b), Math.sin(b) * Math.sin(a))
                : new THREE.Vector3(Math.sin(a) * Math.cos(b), Math.cos(a), Math.sin(a) * Math.sin(b))).applyMatrix4(o.matrixWorld));
            }
            g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
          }
        }
      }
    });
    return g;
  }

  function buildTassel(colors, len) {
    const g = new THREE.Group(); g.userData.swing = true;
    const silk = new THREE.MeshStandardMaterial({color:colors.dark,roughness:.75});
    const gold = new THREE.MeshStandardMaterial({color:METAL,metalness:.45,roughness:.45});
    const bead = new THREE.Mesh(new THREE.SphereGeometry(.13,20,16),silk);
    bead.scale.y=1.3; bead.position.y=-.2; g.add(bead);
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.15,8),silk);
    cord.position.y=-.055; g.add(cord);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(.12,.18,.23,24),gold);
    cap.position.y=-.48; g.add(cap);
    const threads = [new THREE.LineBasicMaterial({color:colors.dark}),new THREE.LineBasicMaterial({color:colors.light})];
    for(let i=0;i<72;i++) {
      const angle=i/72*Math.PI*2;
      const r=.15*(.65+.35*((i*17)%11)/10);
      const points=[];
      for(let k=0;k<=12;k++) {
        const t=k/12;
        points.push(new THREE.Vector3(Math.cos(angle)*r*(1+.14*t)+.035*Math.sin(t*Math.PI),-.59-t*(len-.59)+.035*t*Math.sin(i*2.4),Math.sin(angle)*r*(1+.14*t)));
      }
      const material = threads[i%4===0?1:0];
      g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),material));
    }
    return g;
  }

  function buildCollar(radius, y, top, shape, p) {
    const g = new THREE.Group();
    const segments = shape.faceted ? 6 : 64;
    const lacquer = new THREE.MeshStandardMaterial({color:p.edge,roughness:.55,metalness:.1});
    const brass = new THREE.MeshStandardMaterial({color:METAL,roughness:.5,metalness:.4});
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(radius*1.06,radius*1.06,.18,segments),lacquer);
    sleeve.position.y=y+(top?.035:-.035); g.add(sleeve);
    [-.075,.075].forEach(d => {
      const trim = new THREE.Mesh(new THREE.CylinderGeometry(radius*1.075,radius*1.075,.018,segments),brass);
      trim.position.y=sleeve.position.y+d; g.add(trim);
    });
    return g;
  }

  function buildLantern(selection, stage) {
    const shape = SHAPES[selection.frame] || SHAPES.round;
    const p = PALETTE[selection.paper] || PALETTE.vermilion;
    const lit = stage >= 4;
    const showMotif = stage >= 2;
    const g = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({ color: METAL, roughness: 0.4, metalness: 0.6 });

    const special = !!shape.kind;
    const top = shape.kind === 'rabbit' ? 3.42 : shape.kind === 'lotus' ? 1.6 : .5 * shape.height * SCALE;
    const bottom = shape.kind === 'rabbit' ? -1.66 : shape.kind === 'lotus' ? -1.05 : -.5 * shape.height * SCALE;
    if (special) {
      const body = shape.kind === 'lotus' ? buildLotus(p, lit, showMotif, selection.pattern) : buildRabbit(p, lit, showMotif, selection.pattern);
      if (stage === 0) {
        if (shape.kind === 'rabbit') { g.add(surfaceFrame(body)); disposeObject(body); }
        else {
          body.traverse(o => { if (o.isMesh) o.visible = false; });
          g.add(body);
        }
      } else g.add(body);
    } else {
      if (stage === 0) g.add(buildFrame(shape));
      else {
        g.add(buildBody(shape, p, lit, showMotif, selection.pattern));
        const ribs = buildFrame(shape);
        ribs.scale.set(1.002, 1, 1.002);
        ribs.children.slice(shape.faceted ? shape.sides : shape === SHAPES.melon ? 10 : 16).forEach(line => { line.visible = false; });
        ribs.traverse(o => { if (o.material) o.material.opacity = .22; });
        g.add(ribs);
      }
      g.add(buildCollar(shape.widthAt(1) * SCALE, top, true, shape, p));
      g.add(buildCollar(shape.widthAt(0) * SCALE, bottom, false, shape, p));
    }
    const topLoop = new THREE.Mesh(new THREE.TorusGeometry(.18, .035, 10, 24), metalMat);
    topLoop.position.y = top + .2;
    g.add(topLoop);
    if (shape.kind === 'rabbit') {
      g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 1.78, .35), new THREE.Vector3(0, top + .08, 0)
      ]), new THREE.LineBasicMaterial({ color: METAL })));
    }
    if (shape.kind === 'lotus') {
      const cord = new THREE.LineBasicMaterial({ color: METAL });
      [-1, 1].forEach(sign => g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(sign * 1.4, -.25, 0), new THREE.Vector3(0, top + .2, 0)
      ]), cord)));
    }

    if (stage >= 3) {
      const tassel = buildTassel(TASSEL[selection.tassel] || TASSEL.red, 1.6);
      tassel.position.y = bottom;
      g.add(tassel);
    }

    // Paper glows through its printed surface; fittings and ink keep their contrast.
    if (lit) {
      g.traverse(o => {
        if (!o.material || !o.material.map || !o.isMesh) return;
        const m = o.material;
        m.emissive.set(p.paper).lerp(new THREE.Color(0xffdb99), .32);
        m.emissiveMap = m.map;
        m.emissiveIntensity = 1.65;
        m.userData.paperGlow = true;
        m.onBeforeCompile = shader => {
          shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>',
            '#include <emissivemap_fragment>\n totalEmissiveRadiance *= 0.32 + 0.68 * pow(max(0.0, dot(normalize(normal), normalize(vViewPosition))), 1.5);');
        };
        m.customProgramCacheKey = () => 'paper-glow-v1';
      });
    }
    return g;
  }

  function createHalo() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255,194,105,.32)');
    gradient.addColorStop(.3, 'rgba(255,167,74,.16)');
    gradient.addColorStop(.65, 'rgba(240,140,50,.05)');
    gradient.addColorStop(1, 'rgba(240,140,50,0)');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 256, 256);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, opacity: 0
    }));
    halo.renderOrder = -1;
    return halo;
  }

  function positionHalo(halo, camera, center, radius) {
    halo.position.copy(center).addScaledVector(camera.getWorldDirection(new THREE.Vector3()), radius);
    halo.scale.setScalar(radius * 4.1);
  }

  function disposeObject(obj) {
    const geometries = new Set(), materials = new Set(), textures = new Set();
    obj.traverse(o => {
      if (o.geometry) geometries.add(o.geometry);
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
        materials.add(m); if (m.map) textures.add(m.map);
      });
    });
    textures.forEach(t => t.dispose()); materials.forEach(m => m.dispose()); geometries.forEach(g => g.dispose());
  }

  class LanternStudio {
    constructor(canvas) {
      this.canvas = canvas;
      this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      if ('outputColorSpace' in this.renderer) this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      else if ('outputEncoding' in this.renderer) this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x172b2d);
      this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      this.controls = new SimpleControls(canvas, new THREE.Vector3(0, 0.2, 0), 9, 5, 16);
      this.controls.apply(this.camera);
      this.ambient = new THREE.AmbientLight(0xffffff, 0.55);
      this.scene.add(this.ambient);
      this.dir = new THREE.DirectionalLight(0xfff0d8, 0.7);
      this.dir.position.set(3, 5, 6);
      this.scene.add(this.dir);
      this.scene.add(new THREE.HemisphereLight(0xfff4df, 0x637f7b, .28));
      this.glow = new THREE.PointLight(0xffd9a0, 0, 14);
      this.glow.position.set(0, 0, 0);
      this.scene.add(this.glow);
      this.halo = createHalo();
      this.scene.add(this.halo);
      this.lightLevel = 0;
      this.lightTarget = 0;
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.lantern = null;
      this.clock = new THREE.Clock();
      this._resize();
      window.addEventListener('resize', () => this._resize());
      new ResizeObserver(() => this._resize()).observe(canvas.parentElement);
      this._animate();
    }

    _resize() {
      const w = this.canvas.clientWidth || 600;
      const h = this.canvas.clientHeight || 600;
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      if (this.designRadius) this._fitCamera();
    }

    setDesign(selection, stage) {
      if (this.lantern) {
        this._disposeGroup(this.lantern);
        this.scene.remove(this.lantern);
      }
      const changedShape = this.frame !== selection.frame;
      this.selection = { ...selection };
      this.frame = selection.frame;
      this.lantern = buildLantern(selection, stage);
      this.lantern.position.y = 0.2;
      this.scene.add(this.lantern);
      if (changedShape) {
        const boundsModel = buildLantern(selection, 4);
        const bounds = new THREE.Box3().setFromObject(boundsModel);
        const sphere = bounds.getBoundingSphere(new THREE.Sphere());
        this.designRadius = sphere.radius;
        this.controls.target.copy(sphere.center).add(new THREE.Vector3(0, .2, 0));
        this.controls.theta = selection.frame === 'rabbit' ? .18 : .3;
        this.controls.phi = selection.frame === 'lotus' ? 1.02 : 1.42;
        this._fitCamera();
        disposeObject(boundsModel);
      }
      this.controls.apply(this.camera);
      const lit = stage >= 4;
      this.lightTarget = lit ? 1 : 0;
      if (!lit || this.reducedMotion) this.lightLevel = this.lightTarget;
      this._updateLight(0);
    }

    _fitCamera() {
      const halfFov = Math.atan(Math.tan(this.camera.fov * Math.PI / 360) * Math.min(1, this.camera.aspect));
      const distance = this.designRadius / Math.sin(halfFov) * 1.12;
      this.controls.radius = distance;
      this.controls.minR = distance * .65;
      this.controls.maxR = distance * 1.8;
      this.controls.apply(this.camera);
    }

    _updateLight(delta) {
      this.lightLevel += (this.lightTarget - this.lightLevel) * (1 - Math.exp(-delta * 3.5));
      const level = this.lightLevel;
      this.scene.background.set(0x172b2d).lerp(new THREE.Color(0x0b151c), level);
      this.ambient.intensity = .45 - level * .25;
      this.dir.intensity = .65 - level * .3;
      this.glow.intensity = level * .9;
      this.halo.material.opacity = level;
      positionHalo(this.halo, this.camera, this.controls.target, this.designRadius || 3);
      if (this.lantern) this.lantern.traverse(o => {
        if (o.material && o.material.userData.paperGlow) o.material.emissiveIntensity = 1.65 * level;
      });
    }

    exportCanvas(design = this.selection) {
      // Render independently from the preview: no stage change, zoom crop or mobile-resolution export.
      const width = 1600, height = 2000;
      const poster = document.createElement('canvas');
      poster.width = width; poster.height = height;
      const ctx = poster.getContext('2d');
      ctx.fillStyle = '#0b151c'; ctx.fillRect(0, 0, width, height);
      const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0b151c);
      const model = buildLantern(design, 4); scene.add(model);
      const bounds = new THREE.Box3().setFromObject(model);
      const center = bounds.getCenter(new THREE.Vector3());
      const radius = bounds.getBoundingSphere(new THREE.Sphere()).radius;
      const camera = new THREE.PerspectiveCamera(38, 1440 / 1400, .1, 100);
      const sameFrame = design.frame === this.frame;
      const phi = sameFrame ? this.controls.phi : design.frame === 'lotus' ? 1.02 : 1.42;
      const theta = sameFrame ? this.controls.theta : design.frame === 'rabbit' ? .18 : .3;
      const distance = radius / Math.sin(19 * Math.PI / 180) * 1.06;
      camera.position.set(Math.sin(phi) * Math.sin(theta), Math.cos(phi), Math.sin(phi) * Math.cos(theta)).multiplyScalar(distance).add(center);
      camera.lookAt(center);
      camera.setViewOffset(1440, 1400, -80, -160, width, height);
      camera.updateMatrixWorld();
      scene.add(new THREE.AmbientLight(0xffffff, .2));
      scene.add(new THREE.HemisphereLight(0xfff4df, 0x637f7b, .28));
      const key = new THREE.DirectionalLight(0xfff0d8, .35); key.position.set(3, 5, 6); scene.add(key);
      const light = new THREE.PointLight(0xffd9a0, .9, 14); scene.add(light);
      const halo = createHalo(); halo.material.opacity = 1;
      positionHalo(halo, camera, center, radius); scene.add(halo);
      const size = this.renderer.getSize(new THREE.Vector2());
      const ratio = this.renderer.getPixelRatio();
      try {
        this.renderer.setPixelRatio(1);
        this.renderer.setSize(width, height, false);
        this.renderer.render(scene, camera);
        ctx.drawImage(this.renderer.domElement, 0, 0);
      } finally {
        this.renderer.setPixelRatio(ratio);
        this.renderer.setSize(size.x, size.y, false);
        disposeObject(scene);
        this.renderer.render(this.scene, this.camera);
      }
      ctx.strokeStyle = '#756345'; ctx.lineWidth = 2;
      ctx.strokeRect(48, 48, width - 96, height - 96);
      ctx.strokeStyle = '#302e29'; ctx.strokeRect(62, 62, width - 124, height - 124);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#c2a570'; ctx.font = '24px "Microsoft YaHei", sans-serif';
      ctx.fillText('花 灯 手 作  ·  灯 火 可 亲', width / 2, 119);
      const title = design.name || '一盏团圆';
      let fontSize = 76;
      do { ctx.font = `${fontSize}px "SimSun", serif`; fontSize -= 2; } while (ctx.measureText(title).width > 1280 && fontSize > 34);
      ctx.fillStyle = '#f6e4bf'; ctx.fillText(title, width / 2, 1610);
      ctx.fillStyle = '#b8b3a4'; ctx.font = '32px "Microsoft YaHei", sans-serif';
      const wish = design.wish || '愿灯火可亲，所念皆如愿';
      const lines = []; let line = '';
      for (const char of wish) {
        if (ctx.measureText(line + char).width > 1160 && line) { lines.push(line); line = ''; }
        line += char;
      }
      if (line) lines.push(line);
      lines.forEach((text, i) => ctx.fillText(text, width / 2, 1720 + i * 52));
      ctx.fillStyle = '#887954'; ctx.fillRect(width / 2 - 30, 1850, 60, 2);
      ctx.font = '22px "Microsoft YaHei", sans-serif';
      ctx.fillText('一 盏 灯  ·  一 份 心 意', width / 2, 1900);
      return poster;
    }

    toDataURL(design) {
      return this.exportCanvas(design).toDataURL('image/png');
    }

    _animate() {
      requestAnimationFrame(() => this._animate());
      const delta = Math.min(this.clock.getDelta(), .1);
      const t = this.clock.elapsedTime;
      if (this.lantern) {
        // Keep the chosen view steady while changing paper, motifs or exporting.
        this.lantern.children.forEach((c) => {
          if (!this.reducedMotion && c.userData && c.userData.swing) c.rotation.z = Math.sin(t * 1.5) * 0.06;
        });
      }
      this.controls.apply(this.camera);
      this._updateLight(delta);
      this.renderer.render(this.scene, this.camera);
    }

    _disposeGroup(obj) {
      disposeObject(obj);
    }
  }

  global.LanternStudio = LanternStudio;
})(window);
