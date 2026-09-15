/* Self-contained layered vector artwork. The same renderer powers preview and PNG export. */
(() => {
  const palettes = {
    vermilion: { edge: '#571d17', mid: '#b84926', lit: '#ffc174', paper: '#d3663a', ink: '#ffe1a0' },
    ivory: { edge: '#726041', mid: '#c9ae77', lit: '#fff3c3', paper: '#ddcb9d', ink: '#825a35' },
    jade: { edge: '#183d37', mid: '#497566', lit: '#d2d697', paper: '#729881', ink: '#eee0a6' },
    rose: { edge: '#55282b', mid: '#ac6764', lit: '#ffd4a0', paper: '#cc9290', ink: '#ffdda0' }
  };

  function escapeText(value = '') {
    return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]);
  }

  function pointsPath(points) {
    return points.map(([x, y], index) => `${index ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  }

  function bodyWidth(t) {
    return 56 + 136 * Math.pow(Math.sin(Math.PI * t), .73);
  }

  function rib(k) {
    return pointsPath(Array.from({ length: 65 }, (_, i) => {
      const t = i / 64;
      return [300 + bodyWidth(t) * k, 155 + t * 252];
    }));
  }

  function bodyPath() {
    const left = Array.from({ length: 65 }, (_, i) => [300 - bodyWidth(i / 64), 155 + i / 64 * 252]);
    const right = Array.from({ length: 65 }, (_, i) => [300 + bodyWidth(1 - i / 64), 155 + (1 - i / 64) * 252]);
    return `${pointsPath([...left, ...right])} Z`;
  }

  function metalCap(y, lower = false) {
    const teeth = Array.from({ length: 13 }, (_, i) => `<path d="M${249 + i * 8} ${y + 8}v7l4 4 4-4v-7" fill="none" stroke="#f5d79a" stroke-width=".65" opacity=".8"/>`).join('');
    return `<g>
      <ellipse cx="300" cy="${y + 20}" rx="61" ry="8" fill="#2c2218" opacity=".8"/>
      <path d="M242 ${y}Q300 ${y - 10} 358 ${y}L354 ${y + 21}Q300 ${y + 31} 246 ${y + 21}Z" fill="url(#metal)" stroke="#a9864d" stroke-width="1"/>
      ${teeth}
      <ellipse cx="300" cy="${y}" rx="58" ry="7" fill="url(#metal)" stroke="#e5c78a" stroke-width="1.2"/>
      <path d="M245 ${y + 4}Q300 ${y + 15} 355 ${y + 4}M247 ${y + 21}Q300 ${y + 30} 353 ${y + 21}" fill="none" stroke="#ffe4a6" stroke-width=".8"/>
      ${lower ? '' : `<ellipse cx="300" cy="${y - 2}" rx="40" ry="3" fill="#382c1f"/>`}
    </g>`;
  }

  function plum(color) {
    const flowers = [[262, 280, 1], [324, 246, .85], [350, 210, .65], [360, 293, .6], [239, 325, .65]];
    return `<g fill="none" stroke="${color}" stroke-linecap="round">
      <path d="M240 355Q286 317 292 281Q307 241 351 211M288 300Q326 294 360 293M292 275Q272 265 262 280M309 242Q315 238 324 246" stroke-width="1.5"/>
      ${flowers.map(([x, y, scale]) => `<g transform="translate(${x} ${y}) scale(${scale})">${Array.from({ length: 5 }, (_, i) => `<ellipse cy="-7" rx="5" ry="8" transform="rotate(${i * 72})" fill="${color}" fill-opacity=".18" stroke-width=".8"/>`).join('')}<circle r="2" fill="${color}"/>${Array.from({ length: 5 }, (_, i) => `<path d="M0 0v-5" transform="rotate(${i * 72})" stroke-width=".6"/>`).join('')}</g>`).join('')}
    </g>`;
  }

  function motif(type, color) {
    if (type === 'plain') return '';
    if (type === 'plum') return plum(color);
    if (type === 'fortune') {
      return `<g fill="none" stroke="${color}"><path d="M300 225l55 56-55 56-55-56Z" stroke-width="1"/><path d="M300 232l48 49-48 49-48-49Z" stroke-width=".5"/><text x="300" y="300" text-anchor="middle" fill="${color}" stroke="none" font-family="SimSun,serif" font-size="49">福</text></g>`;
    }
    return `<g fill="none" stroke="${color}" stroke-width="1.2" opacity=".9">
      <path d="M215 257c12 0 16-16 5-17-12-1-11 16 2 17h40c22 0 27-28 9-31-16-3-23 17-8 20 9 2 12-10 4-10M226 266h61c24 0 35-13 51-13 11 0 17 7 13 13-4 7-18 6-15-1M275 319h60c20 0 26-20 12-24-13-4-20 13-8 16M233 312c-12-1-12-15-2-17 12-2 20 13 37 13h37M215 277h31M336 276h29"/>
      <path d="M256 345h32M298 345h47M220 236h20" stroke-width=".6"/>
    </g>`;
  }

  function tassel(color) {
    const dark = color === 'red' ? '#69291e' : '#766034';
    const light = color === 'red' ? '#df7944' : '#e6c780';
    const threads = Array.from({ length: 66 }, (_, i) => {
      const t = i / 65;
      const x = 285 + t * 30;
      const end = 578 + Math.sin(t * Math.PI) * 5 + Math.sin(i * 2.6) * 1.8;
      return `<path d="M${297 + t * 6} 479Q${x} 516 ${x + Math.sin(i * 2.2) * 1.5} ${end}" stroke="${i % 3 === 0 ? light : dark}" stroke-width="${i % 3 === 0 ? .6 : .9}"/>`;
    }).join('');
    return `<g class="tassel-swing">
      <path d="M300 430v28" stroke="#bc9659" stroke-width="2"/>
      <path d="M300 444l8 8-8 8-8-8Z" fill="none" stroke="#d5b370" stroke-width="2"/>
      <circle cx="300" cy="469" r="6" fill="url(#metal)"/>
      ${threads}
      <path d="M295 477h10l5 11h-20Z" fill="url(#metal)"/>
      <path d="M291 484h18M290 487h20" stroke="#f3d899" stroke-width=".8"/>
    </g>`;
  }

  function render(selection, stage = 4, options = {}) {
    const p = palettes[selection.paper] || palettes.vermilion;
    const lit = stage >= 4;
    const outline = bodyPath();
    const ribs = Array.from({ length: 13 }, (_, i) => {
      const k = Math.sin((i / 12 - .5) * Math.PI);
      return `<path d="${rib(k)}" fill="none" stroke="${stage === 0 ? '#be9c62' : '#4e2318'}" stroke-opacity="${stage === 0 ? .8 : .24}" stroke-width="${stage === 0 ? 2.4 : 2}"/><path d="${rib(k)}" transform="translate(1.2 0)" fill="none" stroke="#ffe5a3" stroke-opacity="${stage === 0 ? .35 : .23}" stroke-width=".8"/>`;
    }).join('');
    const folds = Array.from({ length: 118 }, (_, i) => {
      const y = 158 + i * 2.08;
      return `<path d="M100 ${y}Q300 ${y + 4} 500 ${y}" fill="none" stroke="${i % 2 ? '#ffe9b0' : '#421c13'}" stroke-opacity="${i % 2 ? .08 : .06}" stroke-width=".6"/>`;
    }).join('');
    const fibers = Array.from({ length: 260 }, (_, i) => {
      const x = 110 + ((i * 97) % 380);
      const y = 155 + ((i * 73) % 252);
      return `<path d="M${x} ${y}l${2 + i % 7} ${i % 3 - 1}" stroke="#ffebbd" stroke-width=".45" opacity=".13"/>`;
    }).join('');
    const transform = selection.frame === 'tall' ? 'translate(66 -34) scale(.78 1.12)' : '';
    const caption = options.card ? `<text x="300" y="651" text-anchor="middle" fill="#ead6ac" font-family="SimSun,serif" font-size="24" letter-spacing="4">${escapeText(selection.name || '一盏团圆')}</text><text x="300" y="687" text-anchor="middle" fill="#aeb19c" font-family="SimSun,serif" font-size="13">${escapeText(selection.wish || '愿灯火可亲，所念皆如愿')}</text><path d="M275 711h50" stroke="#c6a465" stroke-width=".6"/><text x="300" y="738" text-anchor="middle" fill="#849080" font-family="serif" font-size="10" letter-spacing="4">花 灯 手 作</text>` : '';

    return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="${options.card ? 780 : 620}" viewBox="0 0 600 ${options.card ? 780 : 620}" role="img" aria-label="手作传统灯笼">
      <defs>
        <radialGradient id="scene"><stop stop-color="#34443a"/><stop offset="1" stop-color="#14292b"/></radialGradient>
        <radialGradient id="aura"><stop stop-color="#dca666" stop-opacity=".22"/><stop offset="1" stop-color="#dca666" stop-opacity="0"/></radialGradient>
        <linearGradient id="metal"><stop stop-color="#62502f"/><stop offset=".25" stop-color="#bb9454"/><stop offset=".46" stop-color="#f1d69c"/><stop offset=".65" stop-color="#bc9250"/><stop offset="1" stop-color="#635130"/></linearGradient>
        <radialGradient id="paper" cx=".46" cy=".49" r=".63"><stop stop-color="${lit ? p.lit : p.paper}"/><stop offset=".35" stop-color="${lit ? p.paper : p.mid}"/><stop offset=".8" stop-color="${p.mid}"/><stop offset="1" stop-color="${p.edge}"/></radialGradient>
        <linearGradient id="shade" x2="0" y2="1"><stop stop-color="#241812" stop-opacity=".5"/><stop offset=".22" stop-color="#241812" stop-opacity="0"/><stop offset=".75" stop-color="#241812" stop-opacity="0"/><stop offset="1" stop-color="#241812" stop-opacity=".5"/></linearGradient>
        <clipPath id="bodyClip"><path d="${outline}"/></clipPath>
      </defs>
      ${options.card ? '<rect width="600" height="780" fill="url(#scene)"/><rect x="18" y="18" width="564" height="744" fill="none" stroke="#c4b087" stroke-opacity=".23"/>' : ''}
      ${lit ? '<ellipse cx="300" cy="280" rx="290" ry="270" fill="url(#aura)"/>' : ''}
      <g class="suspended">
        <path d="M300 0v98" fill="none" stroke="#bba376" stroke-width="1.4"/>
        <ellipse cx="300" cy="108" rx="12" ry="17" fill="none" stroke="url(#metal)" stroke-width="3"/>
        <path d="M300 125v18" stroke="#c3a168" stroke-width="3"/>
        <g transform="${transform}">
          ${stage > 0 ? `<path d="${outline}" fill="url(#paper)" stroke="${p.edge}" stroke-width="1"/><g clip-path="url(#bodyClip)">${folds}${fibers}<path d="${outline}" fill="url(#shade)"/></g>` : `<ellipse cx="300" cy="280" rx="189" ry="22" fill="none" stroke="#b79a65" stroke-opacity=".28"/><ellipse cx="300" cy="210" rx="151" ry="16" fill="none" stroke="#b79a65" stroke-opacity=".28"/><ellipse cx="300" cy="348" rx="151" ry="16" fill="none" stroke="#b79a65" stroke-opacity=".28"/>`}
          ${ribs}
          ${stage >= 2 ? motif(selection.pattern, p.ink) : ''}
          ${metalCap(140)}
          ${metalCap(399, true)}
        </g>
        ${stage >= 3 ? tassel(selection.tassel) : ''}
      </g>
      ${caption}
    </svg>`;
  }

  window.LanternArt = { render };
})();
