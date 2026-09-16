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
    rose:      { edge: '#55282b', mid: '#ac6764', lit: '#ffd4a0', paper: '#bd8684', ink: '#ffdda0' },
    // 新增：符合传统花灯的纸色
    amber:     { edge: '#6b4413', mid: '#c98f2e', lit: '#ffe9a8', paper: '#d99a3d', ink: '#7a4a1e' }, // 明黄
    coral:     { edge: '#8a2f24', mid: '#d4604a', lit: '#ffc9a3', paper: '#c96a4a', ink: '#ffe4c4' }, // 橘红
    indigo:    { edge: '#1b2a4a', mid: '#3c5580', lit: '#c9d8f2', paper: '#41598a', ink: '#dfe8f8' }, // 靛蓝
    lilac:     { edge: '#4a3159', mid: '#8b6aa0', lit: '#f0defc', paper: '#9679ab', ink: '#f4e8fd' }  // 青莲
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
    gold: { dark: 0x766034, light: 0xe6c780 },
    jade: { dark: 0x365e50, light: 0x9fc3a3 },
    ivory: { dark: 0xb5a78b, light: 0xfff0d3 },
    indigo: { dark: 0x34476d, light: 0x91abd1 },
    rose: { dark: 0x925d63, light: 0xe4b2ad },
    lilac: { dark: 0x6b507e, light: 0xc8a9da },
    redgold: { dark: 0x963e2d, light: 0xe6c780, mixed: true }
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
      // 多点触控：记录每个触点位置，双指捏合缩放
      this.pointers = new Map();
      this.pinchDist = 0;
      dom.style.touchAction = 'none';
      dom.addEventListener('pointerdown', (e) => {
        this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        this.dragging = true;
        this.px = e.clientX;
        this.py = e.clientY;
        if (dom.setPointerCapture) dom.setPointerCapture(e.pointerId);
        // 第二根手指落下时记下当前两指间距，作为捏合基准
        if (this.pointers.size === 2) this.pinchDist = this._twoFingerDist();
      });
      dom.addEventListener('pointerup', (e) => {
        this.pointers.delete(e.pointerId);
        if (this.pointers.size === 0) this.dragging = false;
        else if (this.pointers.size === 1) {
          // 剩下一根手指：回到单指旋转，重置该指基准
          const rest = this.pointers.values().next().value;
          this.px = rest.x; this.py = rest.y;
        }
      });
      dom.addEventListener('pointercancel', (e) => {
        this.pointers.delete(e.pointerId);
        if (this.pointers.size === 0) this.dragging = false;
      });
      dom.addEventListener('pointermove', (e) => {
        if (!this.pointers.has(e.pointerId)) return;
        this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        // 双指捏合：按两指间距比例调整相机距离
        if (this.pointers.size === 2) {
          const dist = this._twoFingerDist();
          if (this.pinchDist > 0 && dist > 0) {
            this.radius *= this.pinchDist / dist;
            this.radius = Math.max(this.minR, Math.min(this.maxR, this.radius));
          }
          this.pinchDist = dist;
          return;
        }
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
    _twoFingerDist() {
      const [a, b] = this.pointers.values();
      return Math.hypot(a.x - b.x, a.y - b.y);
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
    } else if (pattern === 'bamboo') {
      // 竹报平安：构图紧凑，一主一辅两竿，叶组聚于中段
      const stalk = (bx, lean, topY, w, alpha) => {
        x.globalAlpha = alpha;
        let prevX = bx, prevY = 512;
        for (let i = 1; i <= 5; i++) {
          const frac = i / 5;
          const ny = 512 - (512 - topY) * frac;
          const nx = bx + lean * (512 - ny) * .1;
          x.lineWidth = w * (1 - frac * .3);
          x.beginPath(); x.moveTo(prevX, prevY - 4); x.lineTo(nx, ny + 4); x.stroke();
          x.lineWidth = w * (1 - frac * .3) * .55;
          x.beginPath(); x.moveTo(nx - w * .55, ny); x.lineTo(nx + w * .55, ny - 2); x.stroke();
          prevX = nx; prevY = ny;
        }
      };
      stalk(190, -.5, 90, 10, 1);   // 主竿，近浓
      stalk(300, .4, 170, 7, .7);   // 辅竿，远淡
      // 叶组集中在两竿之间的中段，形成视觉中心
      const leaf = (lx, ly, ang, len, alpha) => {
        x.save(); x.translate(lx, ly); x.rotate(ang); x.globalAlpha = alpha;
        x.beginPath(); x.moveTo(0, 0);
        x.bezierCurveTo(len * .3, -9, len * .72, -5, len, 0);
        x.bezierCurveTo(len * .62, 7, len * .25, 4, 0, 0);
        x.fill(); x.restore();
      };
      const cluster = (lx, ly, dir, alpha) => {
        x.save(); x.translate(lx, ly); x.rotate(dir);
        x.globalAlpha = alpha; x.lineWidth = 1.8;
        x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(48, -10, 95, 0); x.stroke();
        leaf(18, -3, -.9, 48, alpha * .7);
        leaf(38, -5, -.65, 58, alpha);
        leaf(63, -4, -.4, 48, alpha * .8);
        leaf(28, -4, .9, 48, alpha);
        leaf(54, -4, .65, 54, alpha * .85);
        leaf(79, -2, .3, 43, alpha * .7);
        x.restore();
      };
      cluster(173, 174, -.3, .95);
      cluster(177, 259, -2.8, .85);
      cluster(311, 239, -2.5, .55);
      cluster(308, 307, -.1, .8);
      x.globalAlpha = 1;
    } else if (pattern === 'orchid') {
      // 幽兰吐芳：一丛兰叶从右下角放射，花只一朵为主
      const blade = (x0, y0, cx, cy, x1, y1, w, alpha) => {
        x.globalAlpha = alpha;
        x.beginPath(); x.moveTo(x0, y0);
        x.quadraticCurveTo(cx, cy, x1, y1);
        x.quadraticCurveTo(cx + w * 2, cy + w, x0, y0);
        x.fill();
      };
      // 根部聚在右下一点，叶向左上放射——书法撇法
      blade(292, 452, 120, 198, 88, 346, 7, .78);
      blade(292, 452, 179, 313, 114, 416, 5, .6);
      blade(292, 452, 207, 221, 236, 129, 6, .92);
      blade(292, 452, 356, 142, 412, 262, 7, .8);
      blade(292, 452, 319, 254, 345, 214, 4, .55);
      blade(292, 452, 365, 322, 441, 379, 5, .9);
      x.globalAlpha = .8; x.lineWidth = 2.2;
      x.beginPath(); x.moveTo(291, 451); x.quadraticCurveTo(273, 307, 229, 254); x.stroke();
      x.beginPath(); x.moveTo(291, 426); x.quadraticCurveTo(331, 318, 355, 301); x.stroke();
      const blossom = (cx, cy, scale, angle) => {
        x.save(); x.translate(cx, cy); x.rotate(angle); x.scale(scale, scale);
        [[-7,-47,10],[-43,-18,13],[40,-27,12],[-33,24,8],[30,29,8]].forEach(([ex,ey,w], i) => {
          const len = Math.hypot(ex, ey), nx = -ey / len, ny = ex / len;
          x.globalAlpha = i < 3 ? .65 : .85;
          x.beginPath(); x.moveTo(0,0);
          x.quadraticCurveTo(ex * .55 + nx * w, ey * .55 + ny * w, ex, ey);
          x.quadraticCurveTo(ex * .55 - nx * w, ey * .55 - ny * w, 0,0); x.fill();
        });
        x.globalAlpha = 1; x.lineWidth = 2;
        x.beginPath(); x.moveTo(-8,5); x.bezierCurveTo(-13,26,14,25,10,7); x.stroke();
        [[-4,1],[3,-3],[5,6]].forEach(([a,b]) => { x.beginPath(); x.ellipse(a,b,2,3,-.4,0,Math.PI*2); x.fill(); });
        x.restore();
      };
      blossom(229, 254, 1, -.24);
      blossom(355, 301, .72, .4);
      x.globalAlpha = 1;
    } else if (pattern === 'fish') {
      // 双鱼相向回游，鱼头、鳃线与闭合扇尾形成清楚的轮廓。
      const fish = (cx, cy, s, flip, alpha) => {
        x.save(); x.translate(cx, cy); x.scale(flip ? -s : s, s);
        x.rotate(-.22);
        x.globalAlpha = alpha;
        x.lineWidth = 3.5;
        // 鱼身一笔梭形
        x.beginPath(); x.moveTo(-75, 0);
        x.bezierCurveTo(-45, -36, 30, -38, 70, -6);
        x.bezierCurveTo(30, 38, -45, 36, -75, 0);
        x.closePath();
        x.globalAlpha = alpha * .12; x.fill(); x.globalAlpha = alpha; x.stroke();
        // 鱼尾两笔
        x.lineWidth = 2.5;
        x.beginPath(); x.moveTo(64, -5);
        x.bezierCurveTo(82, -8, 94, -32, 116, -36);
        x.quadraticCurveTo(109, -11, 97, 0);
        x.quadraticCurveTo(111, 16, 114, 34);
        x.bezierCurveTo(90, 30, 81, 10, 64, 5); x.closePath();
        x.globalAlpha = alpha * .18; x.fill(); x.globalAlpha = alpha; x.stroke();
        x.lineWidth = 1.2;
        [-24,-12,14,25].forEach(y => { x.beginPath(); x.moveTo(70,0); x.quadraticCurveTo(88,y*.4,106,y); x.stroke(); });
        // 背鳍一笔，胸鳍一笔
        x.beginPath(); x.moveTo(-25, -27); x.quadraticCurveTo(-3, -54, 28, -40); x.lineTo(40,-22); x.quadraticCurveTo(8,-35,-25,-27); x.stroke();
        x.lineWidth = 2;
        x.beginPath(); x.moveTo(-34, 16); x.quadraticCurveTo(-23, 48, 2, 39); x.quadraticCurveTo(-9,23,-34,16); x.stroke();
        x.beginPath(); x.moveTo(-43,-21); x.quadraticCurveTo(-27,0,-44,23); x.stroke();
        // 鳞片四列，弧口朝尾
        x.lineWidth = 1.3;
        for (let row = 0; row < 2; row++) {
          for (let col = 0; col < 4; col++) {
            x.beginPath();
            x.arc(-22 + col * 18, -9 + row * 17, 7, -Math.PI * .42, Math.PI * .42);
            x.stroke();
          }
        }
        // 眼
        x.beginPath(); x.arc(-62, -8, 4, 0, Math.PI * 2); x.fill();
        x.restore();
      };
      fish(210, 210, 1.15, false, .95);
      fish(300, 340, 1, true, .78);
      // 底部一丛水草，三叶向右倒——有水流感
      x.lineWidth = 2.2;
      [[120, 470], [200, 485], [280, 480]].forEach(([bx, by], i) => {
        x.globalAlpha = .55 + i * .1;
        x.beginPath(); x.moveTo(bx, by);
        x.quadraticCurveTo(bx + 20, by - 60, bx + 60 + i * 10, by - 110 - i * 12);
        x.stroke();
      });
      x.globalAlpha = 1;
    } else if (pattern === 'willow') {
      // 雪柳：弧形木枝上簇生小花，花位沿曲线分布，疏密自然。
      const flower = (cx, cy, r, angle) => {
        x.save(); x.translate(cx,cy); x.rotate(angle);
        for (let j = 0; j < 5; j++) {
          const a = j * Math.PI * 2 / 5;
          x.globalAlpha = .7; x.lineWidth = 1;
          x.beginPath(); x.ellipse(Math.cos(a)*r*.55,Math.sin(a)*r*.55,r*.5,r*.34,a,0,Math.PI*2);
          x.fillStyle = p.paper; x.fill(); x.stroke();
        }
        x.globalAlpha = .95; x.fillStyle = p.ink;
        x.beginPath(); x.arc(0,0,1.5,0,Math.PI*2); x.fill(); x.restore();
      };
      const twig = (sx,sy,cx,cy,ex,ey,count,width,alpha) => {
        x.globalAlpha = alpha; x.lineWidth = width;
        x.beginPath(); x.moveTo(sx,sy); x.quadraticCurveTo(cx,cy,ex,ey); x.stroke();
        for (let i = 1; i <= count; i++) {
          const t = .18 + i / (count + 1) * .77, u = 1-t;
          const bx = u*u*sx + 2*u*t*cx + t*t*ex;
          const by = u*u*sy + 2*u*t*cy + t*t*ey;
          const side = i % 2 ? -1 : 1;
          const fx = bx + side * (8 + i % 3 * 2), fy = by - 5;
          x.globalAlpha = alpha; x.lineWidth = 1;
          x.beginPath(); x.moveTo(bx,by); x.lineTo(fx,fy); x.stroke();
          flower(fx,fy,6 + i % 3, i * 1.7);
          if (i % 3 === 0) flower(bx-side*8,by+5,5,i);
        }
      };
      twig(114,463,170,228,371,110,13,3.3,.9);
      twig(145,369,124,229,77,169,8,1.8,.65);
      twig(191,285,291,250,424,289,11,1.8,.7);
      twig(233,226,229,129,279,76,7,1.5,.6);
      x.globalAlpha = 1;
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
      const material = threads[colors.mixed ? i % 2 : i % 4 === 0 ? 1 : 0];
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

    if (stage >= 3 && selection.tassel !== 'none') {
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

  function radialTexture(stops, size) {
    size = size || 256;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    stops.forEach(s => g.addColorStop(s[0], s[1]));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    if ('colorSpace' in tex) tex.colorSpace = THREE.SRGBColorSpace;
    else if ('sRGBEncoding' in THREE) tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  // 悬挂感的地面元素：一片柔和的落影。
  function createGround() {
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(1, 48),
      new THREE.MeshBasicMaterial({ map: radialTexture([[0, 'rgba(4,10,12,.55)'], [.45, 'rgba(4,10,12,.3)'], [1, 'rgba(4,10,12,0)']]), transparent: true, depthWrite: false, opacity: .8 })
    );
    shadow.rotation.x = -Math.PI / 2;
    const group = new THREE.Group();
    group.add(shadow);
    return group;
  }

  // 暖色光尘：细小的漂浮微粒，点亮后愈发清晰。
  function createDust(count) {
    const N = count || 110;
    const positions = new Float32Array(N * 3);
    const speeds = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = .8 + Math.random() * 3.4;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = -3.2 + Math.random() * 7;
      positions[i * 3 + 2] = Math.sin(a) * r;
      speeds[i] = .06 + Math.random() * .16;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const points = new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0xffd9a0, size: .05, transparent: true, opacity: .1,
      depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
    }));
    points.userData.speeds = speeds;
    return points;
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
      this.ground = createGround();
      this.scene.add(this.ground);
      this.dust = createDust();
      this.scene.add(this.dust);
      this.lightLevel = 0;
      this.lightTarget = 0;
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.motionOn = true; // 自转、摆动与光尘的总开关
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
      // 地面投影跟随灯体的实际大小与底端高度
      const box = new THREE.Box3().setFromObject(this.lantern);
      this.ground.position.y = box.min.y - .65;
      this.ground.scale.setScalar(Math.max(2.4, (this.designRadius || 3) * 1.5));
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
      this.dust.material.opacity = .1 + .26 * level;
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
      // 夜色渐层背景：上深下暗，中部微微透出一点暖意。
      const bgCanvas = document.createElement('canvas');
      bgCanvas.width = 16; bgCanvas.height = 512;
      const bgCtx = bgCanvas.getContext('2d');
      const bgGrad = bgCtx.createLinearGradient(0, 0, 0, 512);
      bgGrad.addColorStop(0, '#0a141a');
      bgGrad.addColorStop(.34, '#14232b');
      bgGrad.addColorStop(.62, '#0e1a21');
      bgGrad.addColorStop(1, '#060c10');
      bgCtx.fillStyle = bgGrad; bgCtx.fillRect(0, 0, 16, 512);
      const bgTex = new THREE.CanvasTexture(bgCanvas);
      if ('colorSpace' in bgTex) bgTex.colorSpace = THREE.SRGBColorSpace;
      else if ('sRGBEncoding' in THREE) bgTex.encoding = THREE.sRGBEncoding;
      const scene = new THREE.Scene(); scene.background = bgTex;
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
      // 海报里同样铺上地面投影
      const ground = createGround();
      ground.position.y = bounds.min.y - .55;
      ground.scale.setScalar(Math.max(2.4, radius * 1.4));
      scene.add(ground);
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
        bgTex.dispose();
        disposeObject(scene);
        this.renderer.render(this.scene, this.camera);
      }
      // 装裱：外框、内衬细线与四角记号
      ctx.strokeStyle = 'rgba(162,136,84,.85)'; ctx.lineWidth = 2;
      ctx.strokeRect(48, 48, width - 96, height - 96);
      ctx.strokeStyle = 'rgba(162,136,84,.3)'; ctx.lineWidth = 1;
      ctx.strokeRect(62, 62, width - 124, height - 124);
      ctx.strokeStyle = 'rgba(207,184,132,.9)'; ctx.lineWidth = 2;
      [[34, 34, 1, 1], [width - 34, 34, -1, 1], [34, height - 34, 1, -1], [width - 34, height - 34, -1, -1]].forEach(([x, y, sx, sy]) => {
        ctx.beginPath();
        ctx.moveTo(x, y + sy * 20); ctx.lineTo(x, y); ctx.lineTo(x + sx * 20, y);
        ctx.stroke();
      });
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      // 顶部落款：一枚小印与品名
      ctx.fillStyle = '#a25843';
      ctx.fillRect(width / 2 - 25, 92, 50, 50);
      ctx.strokeStyle = 'rgba(255,240,220,.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(width / 2 - 20, 97, 40, 40);
      ctx.fillStyle = '#f8ecd8'; ctx.font = '32px "Songti SC","SimSun",serif';
      ctx.fillText('灯', width / 2, 118);
      ctx.fillStyle = '#c2a570'; ctx.font = '22px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.fillText('花 灯 手 作 · 灯 火 可 亲', width / 2, 178);
      // 灯名：字间拉开全角空隙，更显疏朗
      const title = (design.name || '一盏团圆').split('').join('　');
      let fontSize = 72;
      do { ctx.font = `${fontSize}px "Songti SC","SimSun",serif`; fontSize -= 2; } while (ctx.measureText(title).width > 1280 && fontSize > 30);
      ctx.fillStyle = '#f6e4bf'; ctx.fillText(title, width / 2, 1610);
      ctx.fillStyle = '#cfc3a2'; ctx.font = '30px "PingFang SC","Microsoft YaHei",sans-serif';
      const wish = design.wish || '愿灯火可亲，所念皆如愿';
      const lines = []; let line = '';
      for (const char of wish) {
        if (ctx.measureText(line + char).width > 1160 && line) { lines.push(line); line = ''; }
        line += char;
      }
      if (line) lines.push(line);
      lines.forEach((text, i) => ctx.fillText(text, width / 2, 1716 + i * 50));
      // 分隔线中断处嵌一枚菱形记号
      ctx.fillStyle = '#8d7c58';
      ctx.fillRect(width / 2 - 34, 1848, 20, 2);
      ctx.fillRect(width / 2 + 14, 1848, 20, 2);
      ctx.save();
      ctx.translate(width / 2, 1849);
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-4, -4, 8, 8);
      ctx.restore();
      ctx.fillStyle = '#9a8a64'; ctx.font = '22px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.fillText('一 盏 灯 · 一 份 心 意', width / 2, 1902);
      return poster;
    }

    toDataURL(design) {
      return this.exportCanvas(design).toDataURL('image/png');
    }

    _animate() {
      requestAnimationFrame(() => this._animate());
      const delta = Math.min(this.clock.getDelta(), .1);
      const t = this.clock.elapsedTime;
      const motion = !this.reducedMotion && this.motionOn;
      if (this.lantern) {
        // Keep the chosen view steady while changing paper, motifs or exporting.
        this.lantern.children.forEach((c) => {
          if (motion && c.userData && c.userData.swing) c.rotation.z = Math.sin(t * 1.5) * 0.06;
        });
      }
      if (motion) {
        // 未拖拽时极缓慢地自转，让灯始终有一点呼吸感
        if (!this.controls.dragging) this.controls.theta += delta * .07;
        // 光尘缓缓上浮，飘出顶部后回到下方
        const dust = this.dust.geometry.attributes.position;
        const speeds = this.dust.userData.speeds;
        for (let i = 0; i < dust.count; i++) {
          let y = dust.getY(i) + speeds[i] * delta;
          if (y > 4.2) y = -3.2;
          dust.setY(i, y);
        }
        dust.needsUpdate = true;
      }
      this.controls.apply(this.camera);
      this._updateLight(delta);
      this.renderer.render(this.scene, this.camera);
    }

    // 停止 / 恢复灯的自转、摆动与光尘漂浮；返回当前是否处于运动状态
    toggleMotion() {
      this.motionOn = !this.motionOn;
      return this.motionOn;
    }

    _disposeGroup(obj) {
      disposeObject(obj);
    }
  }

  global.LanternStudio = LanternStudio;
})(window);
