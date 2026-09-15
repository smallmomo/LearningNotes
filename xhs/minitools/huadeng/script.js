/* Workshop flow and persistence; drawing lives in lantern.js. */
const $ = (id) => document.getElementById(id);
const storageKey = 'huadeng-state';
const selection = { frame: 'round', paper: 'vermilion', pattern: 'plum', tassel: 'red', name: '', wish: '' };
let step = 0;
let completed = false;
let lastSaved = '';
let toastTimer;
let collection = readCollection();

const steps = [
  {
    label: '扎骨', title: '扎一副灯骨', description: '选一种团圆的形状。弯竹成弧，细细撑起一盏灯。',
    caption: '从一副竹骨开始', subtitle: '细竹弯成弧，把团圆的形状留住。', key: 'frame', next: '糊上灯纸',
    choices: [['round', '团圆灯', '圆鼓饱满', '◯'], ['tall', '长圆灯', '修长雅致', '⬭']]
  },
  {
    label: '糊纸', title: '蒙一层柔软灯纸', description: '纸面覆上竹骨，细褶留在灯身。挑一个喜欢的颜色。',
    caption: '纸上有温度', subtitle: '薄纸透光，竹骨藏在细密的纸褶里。', key: 'paper', next: '描上纹样',
    choices: [['vermilion', '柿红', '温暖喜庆', '#b65535'], ['ivory', '米白', '素净温柔', '#dcca9e'], ['jade', '青绿', '沉静清雅', '#648976'], ['rose', '藕粉', '柔和含蓄', '#bd8684']]
  },
  {
    label: '描花', title: '描一点心意', description: '让细细的纹样落在纸上。也可以留下素面，欣赏纸的肌理。',
    caption: '一笔一画，都是心意', subtitle: '疏枝、流云与祝愿，轻轻落在灯纸上。', key: 'pattern', next: '系上流苏',
    choices: [['plum', '梅花', '疏枝报春', '❀'], ['cloud', '流云', '云卷舒心', '≋'], ['fortune', '纳福', '福气常在', '福'], ['plain', '素面', '留一分空白', '·']]
  },
  {
    label: '系穗', title: '系一束丝线流苏', description: '一枚小结，一束丝穗。灯下的风，也有了形状。',
    caption: '风来，丝穗轻摇', subtitle: '金扣系住丝线，细细垂在灯下。', key: 'tassel', next: '写下心愿',
    choices: [['red', '朱色丝穗', '暖意绵长', '#a94e32'], ['gold', '金色丝穗', '流光细细', '#b69760']]
  },
  {
    label: '点灯', title: '把心愿点亮', description: '给花灯起个名字，留下一句祝福。按下点灯，让光透过纸面。',
    caption: '只等这一点光', subtitle: '愿这盏亲手做的灯，照见你心里的温暖。', next: '点亮我的花灯'
  }
];

function readCollection() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return Array.isArray(value.collection) ? value.collection : [];
  } catch {
    return [];
  }
}

function showToast(message) {
  clearTimeout(toastTimer);
  $('toast').textContent = message;
  $('toast').classList.add('visible');
  toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 2600);
}

function updateArt() {
  $('artwork').innerHTML = LanternArt.render(selection, completed ? 4 : Math.min(step, 3));
  $('previewName').textContent = completed ? selection.name || '一盏团圆' : steps[step].caption;
  $('previewCaption').textContent = completed ? selection.wish || '愿灯火可亲，所念皆如愿' : steps[step].subtitle;
}

function renderStep() {
  const current = steps[step];
  $('steps').replaceChildren();
  steps.forEach((item, index) => {
    const button = document.createElement('button');
    button.textContent = `${String(index + 1).padStart(2, '0')} ${item.label}`;
    button.classList.toggle('active', step === index);
    button.setAttribute('aria-current', step === index ? 'step' : 'false');
    button.onclick = () => goToStep(index);
    $('steps').append(button);
  });

  $('stageLabel').textContent = `${String(step + 1).padStart(2, '0')} / ${current.label}`;
  $('stepNumber').textContent = ['第一道', '第二道', '第三道', '第四道', '第五道'][step];
  $('stepTitle').textContent = completed ? '灯火已亮，心愿已藏' : current.title;
  $('stepDescription').textContent = completed ? '保存一张带有花灯、名字与祝福的图片，把这份温暖留住。' : current.description;
  $('options').replaceChildren();

  (current.choices || []).forEach(([value, name, note, sample]) => {
    const button = document.createElement('button');
    button.className = 'option';
    button.classList.toggle('selected', selection[current.key] === value);
    button.setAttribute('aria-pressed', String(selection[current.key] === value));
    const preview = document.createElement('span');
    preview.className = 'sample';
    if (sample.startsWith('#')) {
      const swatch = document.createElement('span');
      swatch.className = 'swatch';
      swatch.style.backgroundColor = sample;
      preview.append(swatch);
    } else {
      preview.textContent = sample;
    }
    const text = document.createElement('span');
    const title = document.createElement('strong');
    const detail = document.createElement('small');
    title.textContent = name;
    detail.textContent = note;
    text.append(title, detail);
    button.append(preview, text);
    button.onclick = () => {
      selection[current.key] = value;
      renderStep();
    };
    $('options').append(button);
  });

  $('wishFields').hidden = step !== 4;
  $('backButton').disabled = step === 0;
  $('nextButton').textContent = `${current.next}  →`;
  document.querySelector('.workbench-footer').hidden = completed;
  $('resultActions').hidden = !completed;
  updateArt();
}

function goToStep(index) {
  completed = false;
  $('stage').classList.remove('illuminate');
  step = index;
  renderStep();
}

// Build a stable, high-resolution card without capturing the moving preview.
async function createPicture(design, width = 1200) {
  const svg = LanternArt.render(design, 4, { card: true });
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = width * 1.3;
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function downloadPicture(design = selection) {
  try {
    const canvas = await createPicture({ ...design });
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Image export failed');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(design.name || '一盏团圆').replace(/[\\/:*?"<>|]/g, '_')}.png`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    showToast('已生成图片；若未自动保存，请用浏览器打开下载');
  } catch {
    showToast('图片未能导出，请重试');
  }
}

async function saveLantern() {
  const design = { ...selection };
  const signature = JSON.stringify(design);
  if (signature === lastSaved) return showToast('这盏花灯已经收藏了');
  $('saveButton').disabled = true;
  try {
    const thumbnail = (await createPicture(design, 300)).toDataURL('image/jpeg', .8);
    const item = { design, name: design.name || '一盏团圆', blessing: design.wish, image: thumbnail, time: new Date().toLocaleDateString('zh-CN') };
    const next = [...collection, item];
    localStorage.setItem(storageKey, JSON.stringify({ collection: next }));
    collection = next;
    lastSaved = signature;
    $('count').textContent = collection.length;
    showToast('花灯已收入收藏');
  } catch {
    showToast('本地收藏未能保存，可以先下载花灯图片');
  } finally {
    $('saveButton').disabled = false;
  }
}

function showCollection() {
  $('workshop').hidden = true;
  $('collection').hidden = false;
  $('collectionGrid').replaceChildren();
  if (!collection.length) {
    const message = document.createElement('p');
    message.textContent = '这里等着你的第一盏花灯。';
    $('collectionGrid').append(message);
  }
  collection.slice().reverse().forEach((item) => {
    const card = document.createElement('article');
    card.className = 'saved';
    if (typeof item.image === 'string' && /^data:image\/(png|jpeg);base64,/.test(item.image)) {
      const image = document.createElement('img');
      image.src = item.image;
      image.alt = item.name || '收藏的花灯';
      card.append(image);
    }
    const title = document.createElement('h3');
    title.textContent = item.name || '旧版花灯';
    const note = document.createElement('p');
    note.textContent = item.blessing || item.time || '';
    card.append(title, note);
    if (item.design) {
      const button = document.createElement('button');
      button.className = 'quiet';
      button.textContent = '保存图片 ↓';
      button.onclick = () => downloadPicture(item.design);
      card.append(button);
    }
    $('collectionGrid').append(card);
  });
}

$('backButton').onclick = () => goToStep(Math.max(0, step - 1));
$('nextButton').onclick = () => {
  if (step < 4) return goToStep(step + 1);
  completed = true;
  renderStep();
  $('stage').classList.add('illuminate');
};
$('lanternName').oninput = (event) => { selection.name = event.target.value.trim(); updateArt(); };
$('blessing').oninput = (event) => { selection.wish = event.target.value.trim(); updateArt(); };
$('downloadButton').onclick = () => downloadPicture();
$('saveButton').onclick = saveLantern;
$('restartButton').onclick = () => goToStep(0);
$('collectionButton').onclick = showCollection;
$('returnButton').onclick = () => { $('collection').hidden = true; $('workshop').hidden = false; };
$('count').textContent = collection.length;
renderStep();
