/* 3D 版流程控制（普通脚本，配合 lantern3d.js 的全局 LanternStudio）。 */
(function () {
  const $ = (id) => document.getElementById(id);
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  // Chrome 61 基线不识别 Flex gap（Chrome 84+），用行为检测决定是否启用 gap 增强层。
  function supportsFlexGap() {
    var flex = document.createElement('div');
    flex.style.position = 'absolute';
    flex.style.visibility = 'hidden';
    flex.style.display = 'flex';
    flex.style.flexDirection = 'column';
    flex.style.rowGap = '1px';
    flex.appendChild(document.createElement('div'));
    flex.appendChild(document.createElement('div'));
    document.body.appendChild(flex);
    var supported = flex.scrollHeight === 1;
    flex.parentNode.removeChild(flex);
    return supported;
  }
  if (supportsFlexGap()) document.documentElement.classList.add('supports-flex-gap');
  const storageKey = 'huadeng-3d-state';
  const selection = { frame: 'round', paper: 'vermilion', pattern: 'plum', tassel: 'red', name: '', wish: '' };
  let step = 0;
  let completed = false;
  let lastSaved = '';
  let toastTimer;
  let downloading = false;
  let palacePatternSuggested = false;
  let collection = readCollection();
  const studio = new LanternStudio($('artwork3d'));

  const steps = [
    {
      label: '扎骨', title: '扎一副灯骨', description: '弯竹成弧，搭起灯的骨架，挑选一盏心仪花灯造型。',
      caption: '从一副竹骨开始', subtitle: '细竹弯成弧，把团圆的形状留住。', key: 'frame', next: '糊上灯纸',
      choices: [['round', '团圆灯', '圆鼓饱满', '◯'], ['lotus', '莲花灯', '瓣瓣舒展', '✿'], ['sittingRabbit', '玉兔灯', '侧坐舒耳', '🐇'], ['palace', '六角宫灯', '飞檐垂穗', '⬡'], ['rabbit', '兔子灯', '双耳竖立', '🐇'], ['tall', '长圆灯', '修长雅致', '⬭'], ['barrel', '桶子灯', '憨直敦实', '⬢'], ['globe', '圆球灯', '饱满团圆', '●'], ['melon', '南瓜灯', '瓣瓣分明', '❋'], ['oval', '筒子灯', '清瘦修长', '▮'], ['hex', '棱角灯', '六面生光', '⬡'], ['koi', '锦鲤灯', '游鱼衔福', '鱼']]
    },
    {
      label: '糊纸', title: '蒙一层柔软灯纸', description: '纸面覆上竹骨，细褶留在灯身。挑一个喜欢的颜色。',
      caption: '纸上有温度', subtitle: '薄纸透光，竹骨藏在细密的纸褶里。', key: 'paper', next: '描上纹样',
      choices: [['vermilion', '柿红', '温暖喜庆', '#b65535'], ['coral', '橘红', '活泼明快', '#c96a4a'], ['amber', '明黄', '明亮贵气', '#d99a3d'], ['ivory', '米白', '素净温柔', '#dcca9e'], ['jade', '青绿', '清润明快', '#2e8b57'], ['indigo', '石青', '清澈沉静', '#2e5d8c'], ['lilac', '青莲', '浓淡雅致', '#8b2671'], ['rose', '胭脂', '柔艳明净', '#c94a5e']]
    },
    {
      label: '描花', title: '描一点心意', description: '让细细的纹样落在纸上。也可以留下素面，欣赏纸的肌理。',
      caption: '一笔一画，都是心意', subtitle: '疏枝、流云与祝愿，轻轻落在灯纸上。', key: 'pattern', next: '系上流苏',
      choices: [['plum', '梅花', '疏枝报春', '❀'], ['baoxiang', '宝相花', '宫灯团花', '✾'], ['bamboo', '翠竹', '竹报平安', '🎋'], ['orchid', '幽兰', '空谷吐芳', '🌿'], ['cloud', '流云', '云卷舒心', '≋'], ['fish', '双鱼', '年年有余', '🐟'], ['willow', '雪柳', '柳丝依依', '❄'], ['fortune', '纳福', '福气常在', '福'], ['haitang', '海棠', '春睡含香', '✿'], ['yulan', '玉兰', '玉盏迎春', '❁'], ['starMoon', '星月', '灯映星河', '☾'], ['plain', '素面', '留一分空白', '·']]
    },
    {
      label: '系穗', title: '系一束丝线流苏', description: '一枚小结，一束丝穗。灯下的风，也有了形状。',
      caption: '风来，丝穗轻摇', subtitle: '金扣系住丝线，细细垂在灯下。', key: 'tassel', next: '写下心愿',
      choices: [
        ['red', '朱色丝穗', '暖意绵长', '#a94e32'],
        ['none', '空白', '不系流苏', '·'],
        ['gold', '金色丝穗', '流光细细', '#b69760'],
        ['jade', '青玉丝穗', '清雅如玉', '#648976'],
        ['ivory', '月白丝穗', '素月流光', '#e5dcc5'],
        ['indigo', '靛蓝丝穗', '静夜如水', '#536b98'],
        ['rose', '藕粉丝穗', '柔情轻垂', '#bd8684'],
        ['lilac', '青莲丝穗', '淡紫含香', '#9679ab'],
        ['redgold', '朱金丝穗', '朱丝织金', '#b86e42']
      ]
    },
    {
      label: '点灯', title: '写下名字与心愿', description: '留下一句祝福，再点亮这盏花灯。',
      caption: '只等这一点光', subtitle: '愿这盏亲手做的灯，照见你心里的温暖。', next: '点亮花灯'
    }
  ];

  function readCollection() {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return Array.isArray(value.collection) ? value.collection : [];
    } catch (e) {
      return [];
    }
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    $('toast').textContent = message;
    $('toast').classList.add('visible');
    toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 2600);
  }

  function updateOptionScrollbar() {
    const options = $('options');
    const track = $('optionScrollbar');
    const thumb = $('optionScrollThumb');
    if (!options || !track || !thumb) return;
    const maxScroll = Math.max(0, options.scrollWidth - options.clientWidth);
    const visible = !options.classList.contains('empty') && maxScroll > 1;
    track.hidden = !visible;
    if (!visible) return;
    const ratio = Math.max(.16, options.clientWidth / options.scrollWidth);
    const maxTravel = track.clientWidth * (1 - ratio);
    thumb.style.width = `${ratio * 100}%`;
    thumb.style.transform = `translateX(${maxScroll ? options.scrollLeft / maxScroll * maxTravel : 0}px)`;
  }

  function updateArt(rebuild = true) {
    if (rebuild) studio.setDesign(selection, completed ? 4 : Math.min(step, 3));
  }

  function frameIcon(frame) {
    const silhouettes = {
      koi: '<path d="M5 32Q18 12 40 31L55 20 50 32 55 44 40 34Q18 52 5 32ZM17 23L25 15 35 23M20 40L29 48 35 40M18 25Q24 33 18 39M22 23L30 10 37 26"/><circle cx="13" cy="30" r="2"/><path d="M27 28Q32 31 27 34M34 29Q38 32 34 35M29 41V56"/>',
      palace: '<path d="M9 22Q22 19 30 10Q38 19 51 22L48 17M9 22L12 17M15 23H45V49H15ZM23 23V49M37 23V49M13 50H47L30 58Z M7 23V37M53 23V37M5 40V50M9 40V50M51 40V50M55 40V50"/><circle cx="30" cy="36" r="5"/><path d="M26 10H34M30 5V10"/>',
      round: '<path d="M23 10C6 17 6 45 23 52H37C54 45 54 17 37 10Z"/><path d="M26 10C17 22 17 41 26 52M34 10C43 22 43 41 34 52"/>',
      tall: '<path d="M25 7C12 18 12 47 25 56H35C48 47 48 18 35 7Z"/><path d="M30 7V56"/>',
      barrel: '<path d="M16 12Q10 31 16 51H44Q50 31 44 12Z"/><path d="M22 13V50M38 13V50"/>',
      globe: '<circle cx="30" cy="31" r="21"/><ellipse cx="30" cy="31" rx="11" ry="21"/>',
      oval: '<path d="M26 6C6 27 20 53 27 57H33C40 53 54 27 34 6Z"/><path d="M30 6V57"/>',
      melon: '<ellipse cx="30" cy="32" rx="24" ry="18"/><ellipse cx="30" cy="32" rx="15" ry="18"/><ellipse cx="30" cy="32" rx="6" ry="18"/>',
      hex: '<path d="M15 13L30 8 45 13 47 49 30 55 13 49Z"/><path d="M30 8V55M15 13H45M13 49H47"/>',
      lotus: '<path d="M30 49Q5 45 6 29Q22 29 30 49Q55 45 54 29Q38 29 30 49Z"/><path d="M30 49Q10 28 18 18Q29 25 30 49Q50 28 42 18Q31 25 30 49Z"/><path d="M30 48Q16 29 30 12Q44 29 30 48Z"/>',
      rabbit: '<ellipse cx="30" cy="43" rx="13" ry="14"/><ellipse cx="24" cy="14" rx="4" ry="12" transform="rotate(-12 24 14)"/><ellipse cx="37" cy="13" rx="4" ry="12" transform="rotate(8 37 13)"/><ellipse cx="30" cy="29" rx="13" ry="11"/><path d="M25 28h.1M35 28h.1" stroke-width="3"/>',
      sittingRabbit: '<ellipse cx="33" cy="41" rx="17" ry="17"/><ellipse cx="19" cy="25" rx="10" ry="9"/><path d="M18 17Q17 3 23 2Q28 5 23 17M24 18Q30 1 37 4Q40 10 28 21M18 35Q33 40 48 35M17 43Q33 48 49 43M24 30Q20 45 27 56M37 25Q45 37 42 51"/><ellipse cx="40" cy="48" rx="6" ry="9" transform="rotate(25 40 48)"/><ellipse cx="21" cy="57" rx="5" ry="2"/><ellipse cx="38" cy="57" rx="7" ry="2"/><circle cx="18" cy="24" r="1.8"/>'
    };
    return `<svg viewBox="0 0 60 68" aria-hidden="true" fill="#d4b58622" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${silhouettes[frame] || silhouettes.round}<path d="M30 57v7M27 64h6"/></svg>`;
  }

  function renderStep() {
    const current = steps[step];
    clear($('steps'));
    steps.forEach((item, index) => {
      const button = document.createElement('button');
      const number = document.createElement('b');
      number.textContent = String(index + 1).padStart(2, '0');
      const label = document.createElement('span');
      label.textContent = item.label;
      button.append(number, label);
      button.classList.toggle('active', step === index);
      button.classList.toggle('done', index < step);
      button.setAttribute('aria-current', step === index ? 'step' : 'false');
      button.onclick = () => goToStep(index);
      $('steps').append(button);
    });

    $('stageLabel').textContent = completed ? '心愿已点亮' : `${String(step + 1).padStart(2, '0')} / ${current.label}`;
    $('stepNumber').textContent = ['第一道', '第二道', '第三道', '第四道', '第五道'][step];
    $('stepTitle').textContent = completed ? '灯火已亮，心愿已藏' : current.title;
    $('stepDescription').textContent = completed ? '保存一张带有花灯、名字与祝福的图片，把这份温暖留住。' : current.description;
    clear($('options'));

    const optionButtons = [];
    (current.choices || []).forEach(([value, name, note, sample]) => {
      const button = document.createElement('button');
      button.className = 'option';
      button.classList.toggle('selected', selection[current.key] === value);
      button.setAttribute('aria-pressed', String(selection[current.key] === value));
      const preview = document.createElement('span');
      preview.className = 'sample';
      if (current.key === 'frame') {
        preview.classList.add('frame-sample');
        preview.innerHTML = frameIcon(value);
      } else if (sample.startsWith('#')) {
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
      optionButtons.push([button, value]);
      // 只切换选中态，不重建整个面板，避免按钮整体刷新闪动
      button.onclick = () => {
        if (selection[current.key] === value) return;
        selection[current.key] = value;
        if (current.key === 'frame' && value === 'palace' && !palacePatternSuggested) {
          selection.pattern = 'baoxiang';
          selection.paper = 'jade';
          selection.tassel = 'jade';
          palacePatternSuggested = true;
        }
        for (const [btn, val] of optionButtons) {
          const selected = val === value;
          btn.classList.toggle('selected', selected);
          btn.setAttribute('aria-pressed', String(selected));
        }
        updateArt();
      };
      $('options').append(button);
    });
    // Chrome 61 不支持 :has()，改用 class 判断选项框是否为空以收回弹性高度。
    $('options').classList.toggle('empty', optionButtons.length === 0);
    $('options').scrollLeft = 0;
    requestAnimationFrame(updateOptionScrollbar);

    $('wishFields').hidden = step !== 4 || completed;
    $('backButton').disabled = step === 0;
    $('nextButton').textContent = `${current.next}  →`;
    document.querySelector('.workbench-footer').hidden = completed;
    $('resultActions').hidden = !completed;
    // 重放步骤内容的进场动画
    const content = document.querySelector('.step-content');
    content.classList.toggle('wish-step', step === 4 && !completed);
    content.classList.toggle('result-step', completed);
    content.classList.remove('enter');
    void content.offsetWidth;
    content.classList.add('enter');
    updateArt();
  }

  function goToStep(index) {
    completed = false;
    $('stage').classList.remove('illuminate');
    step = index;
    renderStep();
  }

  function shrink(dataURL, w) {
    w = w || 300;
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = Math.round(w * img.height / img.width);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => resolve(dataURL);
      img.src = dataURL;
    });
  }

  async function downloadPicture(design) {
    if (downloading) return;
    design = Object.assign({}, design || selection);
    downloading = true;
    $('downloadButton').disabled = true;
    $('downloadButton').textContent = '正在生成高清图…';
    try {
      await document.fonts.ready;
      const canvas = studio.exportCanvas(design);
      const dataURL = canvas.toDataURL('image/png');
      // 容器禁止 a[download]/blob 下载，改用 JSBridge 写临时文件后存入相册。
      const tool = window.xhs && window.xhs.miniTool;
      if (tool && tool.writeTempFile && tool.saveImageToPhotosAlbum) {
        const result = await tool.writeTempFile({ data: dataURL });
        await tool.saveImageToPhotosAlbum({ filePath: result.filePath });
        showToast('高清花灯纪念图已保存到相册');
      } else {
        showToast('当前环境不支持保存，可先收入收藏');
      }
    } catch (e) {
      showToast('图片未能保存，请重试');
    } finally {
      downloading = false;
      $('downloadButton').disabled = false;
      $('downloadButton').textContent = '保存高清纪念图 ↓';
    }
  }

  async function saveLantern() {
    const design = Object.assign({}, selection);
    const signature = JSON.stringify(design);
    if (signature === lastSaved) return showToast('这盏花灯已经收藏了');
    $('saveButton').disabled = true;
    try {
      await document.fonts.ready;
      const full = studio.toDataURL(design);
      const thumbnail = await shrink(full, 300);
      const item = {
        design,
        name: design.name || '一盏团圆',
        blessing: design.wish,
        image: thumbnail,
        time: new Date().toLocaleDateString('zh-CN')
      };
      const next = [...collection, item];
      localStorage.setItem(storageKey, JSON.stringify({ collection: next }));
      collection = next;
      lastSaved = signature;
      $('count').textContent = collection.length;
      showToast('花灯已收入收藏');
    } catch (e) {
      showToast('本地收藏未能保存，可以先下载花灯图片');
    } finally {
      $('saveButton').disabled = false;
    }
  }

  function showCollection() {
    $('workshop').hidden = true;
    $('collection').hidden = false;
    clear($('collectionGrid'));
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
  // 点击画布（非拖拽）切换灯体自转；提示文字跟随状态与设备变化
  let downX = 0, downY = 0;
  const hint = $('stageHint');
  const coarse = window.matchMedia('(pointer: coarse)');
  const hintText = (running) => {
    const zoom = coarse.matches ? '双指缩放' : '滚轮缩放';
    return `拖动旋转 · ${zoom} · 点击${running ? '暂停转动' : '继续转动'}`;
  };
  hint.textContent = hintText(true);
  if (coarse.addEventListener) coarse.addEventListener('change', () => { hint.textContent = hintText(studio.motionOn); });
  $('artwork3d').addEventListener('pointerdown', (e) => { downX = e.clientX; downY = e.clientY; });
  $('artwork3d').addEventListener('pointerup', (e) => {
    // 移动超过 5px 视为拖拽旋转，不触发切换
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) return;
    const on = studio.toggleMotion();
    hint.textContent = hintText(on);
  });
  $('nextButton').onclick = () => {
    if (step < 4) return goToStep(step + 1);
    completed = true;
    renderStep();
    $('stage').classList.add('illuminate');
  };
  $('lanternName').oninput = (event) => { selection.name = event.target.value.trim(); updateArt(false); };
  $('blessing').oninput = (event) => { selection.wish = event.target.value.trim(); updateArt(false); };
  $('downloadButton').onclick = () => downloadPicture();
  $('saveButton').onclick = saveLantern;
  $('restartButton').onclick = () => goToStep(0);
  $('collectionButton').onclick = showCollection;
  $('returnButton').onclick = () => { $('collection').hidden = true; $('workshop').hidden = false; };
  $('options').addEventListener('scroll', updateOptionScrollbar, { passive: true });
  window.addEventListener('resize', updateOptionScrollbar);
  $('count').textContent = collection.length;
  renderStep();
})();
