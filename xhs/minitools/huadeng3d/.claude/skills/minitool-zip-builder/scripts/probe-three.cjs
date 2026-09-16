/* 探测 three.min.js 是否含 Chrome 61 无法解析的语法 */
const fs = require('fs');
const src = fs.readFileSync('three.min.js', 'utf8');

// 1) 可选链：出现在代码位置（前一个字符是标识符/括号，后一个不是数字）
const optChain = [];
let idx = src.indexOf('?.');
while (idx !== -1) {
  const before = src[idx - 1], after = src[idx + 2];
  // 排除三元运算符 "a ? .5 : b"（? 后跟 .数字）
  if (/[A-Za-z0-9_$)\]]/.test(before || '') && !/^[0-9]/.test(after || '')) {
    optChain.push(src.slice(Math.max(0, idx - 40), idx + 40));
  }
  idx = src.indexOf('?.', idx + 1);
}
console.log('可选链候选数:', optChain.length);
optChain.slice(0, 5).forEach(s => console.log('  ...' + s.replace(/\n/g, '\\n') + '...'));

// 2) 空值合并 a ?? b（前是标识符/括号，后非 =）
const nullish = [];
idx = src.indexOf('??');
while (idx !== -1) {
  const before = src[idx - 1], after = src[idx + 2];
  if (/[A-Za-z0-9_$)\]]/.test(before || '') && after !== '=' && after !== '?') {
    nullish.push(src.slice(Math.max(0, idx - 40), idx + 40));
  }
  idx = src.indexOf('??', idx + 1);
}
console.log('空值合并候选数:', nullish.length);
nullish.slice(0, 5).forEach(s => console.log('  ...' + s + '...'));

// 3) 对象展开 {...x}（找 "{..." 且前一字符非 ( [ , = 等 ok，实际难精确，报告出现次数）
let spreadCount = 0;
idx = src.indexOf('...');
while (idx !== -1) { spreadCount++; idx = src.indexOf('...', idx + 1); }
console.log('三点出现总数(含数组/调用展开与对象展开):', spreadCount);

// 4) catch 省略绑定 / 逻辑赋值
console.log('catch{ 出现:', /catch\s*\{/.test(src) ? '有' : '无');
console.log('||= 出现:', src.includes('||=') ? '有' : '无');
console.log('&&= 出现:', src.includes('&&=') ? '有' : '无');
console.log('??= 出现:', src.includes('??=') ? '有' : '无');
