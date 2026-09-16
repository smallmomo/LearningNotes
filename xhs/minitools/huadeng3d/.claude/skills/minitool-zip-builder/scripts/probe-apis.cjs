/* 精确探测：真可选链 / 空值合并 / Chrome 61 之后的运行时 API */
const fs = require('fs');
const files = ['app3d.js', 'lantern3d.js', 'music.js', 'three.min.js'];
const apiPatterns = [
  ['replaceChildren', /replaceChildren/g],
  ['ResizeObserver', /new ResizeObserver/g],
  ['Array.flat', /\.flat\(/g],
  ['flatMap', /\.flatMap\(/g],
  ['Object.fromEntries', /Object\.fromEntries/g],
  ['replaceAll', /replaceAll/g],
  ['matchAll', /matchAll/g],
  ['.at(', /\.at\(/g],
  ['allSettled', /allSettled/g],
  ['structuredClone', /structuredClone/g],
  ['Object.hasOwn', /Object\.hasOwn/g],
  ['globalThis裸用', /[^"'=. ]globalThis\./g],
];
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const lines = src.split('\n');
  // 真可选链：?. 后面不是数字（数字是三元 a ? .5 : b）
  lines.forEach((line, i) => {
    const m = line.match(/\?\.(?![0-9])/g);
    if (m) console.log(`${f}:${i + 1} 可选链x${m.length}: ${line.trim().slice(0, 90)}`);
    const n = line.match(/\?\?(?!=)/g);
    if (n) console.log(`${f}:${i + 1} 空值合并x${n.length}: ${line.trim().slice(0, 90)}`);
  });
  apiPatterns.forEach(([name, re]) => {
    const m = src.match(re);
    if (m) console.log(`${f} 运行时API ${name} x${m.length}`);
  });
}
console.log('--- motifTexture 画布尺寸 ---');
const l3 = fs.readFileSync('lantern3d.js', 'utf8');
l3.split('\n').forEach((line, i) => {
  if (/canvas\.width\s*=|canvas\.height\s*=|\.width\s*=\s*\d{3,}|\.height\s*=\s*\d{3,}/.test(line)) console.log(`lantern3d.js:${i + 1}: ${line.trim().slice(0, 80)}`);
});
