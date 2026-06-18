// ===================================================
//  命运扳机大手子 · script.js
// ===================================================

const CHARACTERS = [
  {
    id: 'NASE',
    name: '名濑',
    color: '#f4a7c3',       // 粉色
    overlayColor: '#d6578a',
    avatar: 'images/avatars/NASE.jpg',
    icon:   'images/icons/NASE.jpg',
  },
  {
    id: 'XIVA',
    name: '绮罗',
    color: '#f9e8a0',       // 浅黄色
    overlayColor: '#c9a833',
    avatar: 'images/avatars/XIVA.jpg',
    icon:   'images/icons/XIVA.jpg',
  },
  {
    id: 'HUXLEY',
    name: '赫希黎',
    color: '#d8c4f0',       // 淡紫色
    overlayColor: '#7b52ab',
    avatar: 'images/avatars/HUXLEY.jpg',
    icon:   'images/icons/HUXLEY.jpg',
  },
  {
    id: 'CAMILLE',
    name: '卡密儿',
    color: '#b8f0c8',       // 淡绿色
    overlayColor: '#2e8b57',
    avatar: 'images/avatars/CAMILLE.jpg',
    icon:   'images/icons/CAMILLE.jpg',
  },
  {
    id: 'RYOIN',
    name: '獠隐',
    color: '#c8cdd6',       // 灰色
    overlayColor: '#5a6175',
    avatar: 'images/avatars/RYOIN.jpg',
    icon:   'images/icons/RYOIN.jpg',
  },
  {
    id: 'MINDY',
    name: '明迪',
    color: '#f5c842',       // 深黄色
    overlayColor: '#b8870a',
    avatar: 'images/avatars/MINDY.jpg',
    icon:   'images/icons/MINDY.jpg',
  },
  {
    id: 'SOARWYNNE',
    name: '索尔维亚',
    color: '#f4a96a',       // 橙色
    overlayColor: '#d0621a',
    avatar: 'images/avatars/SOARWYNNE.jpg',
    icon:   'images/icons/SOARWYNNE.jpg',
  },
  {
    id: 'CYNRIC',
    name: '西瑞克',
    color: '#7ec8f0',       // 蓝色
    overlayColor: '#1a6ea8',
    avatar: 'images/avatars/CYNRIC.jpg',
    icon:   'images/icons/CYNRIC.jpg',
  },
  {
    id: 'KIRA',
    name: '希',
    color: '#5a8f78',       // 墨绿色
    overlayColor: '#1e4d38',
    avatar: 'images/avatars/KIRA.jpg',
    icon:   'images/icons/KIRA.jpg',
  },
  {
    id: 'EOS',
    name: '伊欧斯',
    color: '#f5a0a0',       // 浅红色
    overlayColor: '#c0392b',
    avatar: 'images/avatars/EOS.jpg',
    icon:   'images/icons/EOS.jpg',
  },
];

// 等级标签
const LEVEL_LABELS = ['没玩过', '会玩', '熟悉', '精通', '本命 ♥'];
// 分数对应（等级 0~4 → 加 0/1/2/3/4 分改为 1~5 分，0分不加）
const LEVEL_SCORES = [0, 1, 2, 3, 4];

// 评分评语（按分数区间）
const COMMENTS = [
  { min: 0,  max: 4,  text: '看来你还只是个路人……要不要试一局？' },
  { min: 5,  max: 9,  text: '新手上路，握紧扳机！' },
  { min: 10, max: 14, text: '已经摸到命运的边缘了~' },
  { min: 15, max: 19, text: '老练的 Awakener，战场上见过你！' },
  { min: 20, max: 24, text: '运トリ的深度玩家，了解！' },
  { min: 25, max: 29, text: '你对这片战场了如指掌，厉害！' },
  { min: 30, max: 39, text: '你就是命运吧唧高手！' },
  { min: 40, max: 99, text: '全员制霸！你才是真正的运命之神！！' },
];

// 状态
const state = {
  levels: {},      // { charId: levelNum }
  favId: null,     // 当前本命
};

// 初始化等级
CHARACTERS.forEach(c => { state.levels[c.id] = 0; });

// 从 localStorage 恢复
const LS_KEY = 'gr-seiha-v1';
try {
  const saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  if (saved.levels) Object.assign(state.levels, saved.levels);
  if (saved.favId) state.favId = saved.favId;
} catch(e) {}

// ===================================================
//  DOM 构建
// ===================================================
const grid = document.getElementById('character-grid');
const popup = document.getElementById('level-popup');
const popupName = document.getElementById('popup-name');
const popupLevels = document.getElementById('popup-levels');
const scoreValue = document.getElementById('score-value');
const commentLine = document.getElementById('comment-line');
const favIconWrap = document.getElementById('fav-icon-wrap');
const favIcon = document.getElementById('fav-icon');
const btnSave = document.getElementById('btn-save');
const outputWrap = document.getElementById('output-wrap');
const outputImg = document.getElementById('output-img');
const outputLink = document.getElementById('output-link');
const shareCanvas = document.getElementById('share-canvas');

let currentChar = null;

// 生成角色卡片
CHARACTERS.forEach(char => {
  const card = document.createElement('div');
  card.className = 'char-card';
  card.dataset.id = char.id;
  card.innerHTML = `
    <img class="char-avatar" src="${char.avatar}" alt="${char.name}" crossorigin="anonymous">
    <div class="char-overlay" style="background:${char.overlayColor};"></div>
    <div class="char-info">
      <span class="char-name">${char.name}</span>
      <span class="char-level-badge" id="badge-${char.id}"></span>
    </div>
  `;
  card.addEventListener('click', e => openPopup(e, char));
  grid.appendChild(card);
});

// 生成图例
const legend = document.createElement('div');
legend.className = 'legend';
CHARACTERS.forEach(char => {
  legend.innerHTML += `
    <div class="legend-item">
      <span class="legend-dot" style="background:${char.color};"></span>
      <span>${char.name}</span>
    </div>`;
});
document.querySelector('main').insertBefore(legend, document.getElementById('level-popup'));

// 初始渲染
renderAll();

// ===================================================
//  弹窗
// ===================================================
function openPopup(e, char) {
  e.stopPropagation();
  currentChar = char;
  popupName.textContent = char.name;

  // 高亮当前等级
  popupLevels.querySelectorAll('li').forEach(li => {
    const lv = parseInt(li.dataset.level);
    li.classList.toggle('active-level', lv === state.levels[char.id]);
  });

  // 本命选项禁用逻辑（已有本命且不是本char，禁用）
  const li4 = popupLevels.querySelector('[data-level="4"]');
  if (state.favId && state.favId !== char.id) {
    li4.style.opacity = '0.35';
    li4.style.pointerEvents = 'none';
    li4.title = `本命已设为 ${CHARACTERS.find(c=>c.id===state.favId)?.name}`;
  } else {
    li4.style.opacity = '';
    li4.style.pointerEvents = '';
    li4.title = '';
  }

  // 定位
  const rect = e.currentTarget.getBoundingClientRect();
  const popW = 145, popH = 220;
  let left = rect.left + rect.width / 2 - popW / 2 + window.scrollX;
  let top  = rect.top  + rect.height / 2 - popH / 2 + window.scrollY;
  left = Math.max(6, Math.min(left, document.body.offsetWidth - popW - 6));
  top  = Math.max(6, Math.min(top,  document.documentElement.scrollHeight - popH - 6));

  popup.style.left = left + 'px';
  popup.style.top  = top  + 'px';
  popup.style.display = 'block';
  popup.classList.add('active');
}

function closePopup() {
  popup.style.display = 'none';
  popup.classList.remove('active');
  currentChar = null;
}

document.addEventListener('click', e => {
  if (!popup.contains(e.target)) closePopup();
});

// 选择等级
popupLevels.addEventListener('click', e => {
  const li = e.target.closest('li');
  if (!li || !currentChar) return;
  e.stopPropagation();

  const lv = parseInt(li.dataset.level);
  const charId = currentChar.id;

  // 本命处理
  if (lv === 4) {
    if (state.favId && state.favId !== charId) return; // 已有本命
    state.favId = charId;
    // 重置其他角色本命状态
    CHARACTERS.forEach(c => {
      if (c.id !== charId && state.levels[c.id] === 4) {
        state.levels[c.id] = 0;
      }
    });
  } else {
    // 如果之前是本命，取消本命
    if (state.levels[charId] === 4) {
      state.favId = null;
    }
  }

  state.levels[charId] = lv;
  save();
  renderAll();
  closePopup();
});

// ===================================================
//  渲染
// ===================================================
function renderAll() {
  let total = 0;
  CHARACTERS.forEach(char => {
    const lv = state.levels[char.id] || 0;
    total += LEVEL_SCORES[lv];

    const badge = document.getElementById('badge-' + char.id);
    badge.textContent = lv > 0 ? LEVEL_LABELS[lv] : '';

    const card = grid.querySelector(`[data-id="${char.id}"]`);
    card.classList.toggle('selected', lv > 0 && lv < 4);
    card.classList.toggle('fav', lv === 4);
  });

  scoreValue.textContent = total;
  commentLine.textContent = getComment(total);

  // 本命 ICON
  if (state.favId) {
    const favChar = CHARACTERS.find(c => c.id === state.favId);
    favIcon.src = favChar.icon;
    favIconWrap.style.display = 'block';
  } else {
    favIconWrap.style.display = 'none';
  }
}

function getComment(score) {
  for (const seg of COMMENTS) {
    if (score >= seg.min && score <= seg.max) return seg.text;
  }
  return '';
}

// ===================================================
//  持久化
// ===================================================
function save() {
  localStorage.setItem(LS_KEY, JSON.stringify({
    levels: state.levels,
    favId: state.favId,
  }));
}

// ===================================================
//  保存分享图片 (Canvas)
// ===================================================
btnSave.addEventListener('click', async () => {
  btnSave.disabled = true;
  btnSave.textContent = '生成中…';

  const W = 800, H = 560;
  shareCanvas.width  = W;
  shareCanvas.height = H;
  const ctx = shareCanvas.getContext('2d');

  // 背景渐变
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#0f0f18');
  grad.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 装饰网格线
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = 0; y < H; y += 50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // 标题
  ctx.font = 'bold 28px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.fillStyle = '#f9d71c';
  ctx.textAlign = 'center';
  ctx.fillText('命运扳机大手子', W / 2, 44);

  // 副标题
  ctx.font = '14px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fillText('Fate Trigger · Awakener 阶位检定', W / 2, 68);

  // 角色卡片绘制
  const COLS = 5, ROWS = 2;
  const cardW = 118, cardH = 130;
  const startX = (W - COLS * cardW - (COLS - 1) * 12) / 2;
  const startY = 90;
  const GAP = 12;

  const loadImg = src => new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = src;
  });

  // 预加载所有Q版立绘
  const avatarImgs = await Promise.all(
    CHARACTERS.map(c => loadImg(c.avatar))
  );

  for (let i = 0; i < CHARACTERS.length; i++) {
    const char = CHARACTERS[i];
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = startX + col * (cardW + GAP);
    const y = startY + row * (cardH + GAP);
    const lv = state.levels[char.id] || 0;
    const isFav = (state.favId === char.id);

    // 圆角裁剪
    ctx.save();
    roundRect(ctx, x, y, cardW, cardH, 10);
    ctx.clip();

    // 底色
    ctx.fillStyle = char.overlayColor;
    ctx.fillRect(x, y, cardW, cardH);

    // 头像
    if (avatarImgs[i]) {
      // 裁剪上半身显示
      const imgRatio = avatarImgs[i].naturalHeight / avatarImgs[i].naturalWidth;
      const drawH = cardW * imgRatio;
      ctx.globalAlpha = 0.82;
      ctx.drawImage(avatarImgs[i], x, y - drawH * 0.15, cardW, drawH);
      ctx.globalAlpha = 1;
    }

    // 半透明叠层
    const overlay = ctx.createLinearGradient(x, y, x, y + cardH);
    overlay.addColorStop(0, 'rgba(0,0,0,0)');
    overlay.addColorStop(0.55, 'rgba(0,0,0,0.2)');
    overlay.addColorStop(1, 'rgba(0,0,0,0.75)');
    ctx.fillStyle = overlay;
    ctx.fillRect(x, y, cardW, cardH);

    ctx.restore();

    // 边框
    ctx.save();
    ctx.strokeStyle = isFav ? '#e94560' : (lv > 0 ? char.color : 'rgba(255,255,255,0.15)');
    ctx.lineWidth = isFav ? 2.5 : 1.5;
    roundRect(ctx, x, y, cardW, cardH, 10);
    ctx.stroke();
    ctx.restore();

    // 角色名
    ctx.font = 'bold 12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(char.name, x + cardW / 2, y + cardH - 22);
    ctx.shadowBlur = 0;

    // 等级标签
    if (lv > 0) {
      ctx.font = `bold 10px "PingFang SC","Microsoft YaHei",sans-serif`;
      ctx.fillStyle = isFav ? '#e94560' : '#f9d71c';
      ctx.fillText(LEVEL_LABELS[lv], x + cardW / 2, y + cardH - 8);
    }

    // 本命角标
    if (isFav) {
      ctx.font = '14px serif';
      ctx.fillText('♥', x + cardW - 12, y + 18);
    }
  }

  // 分割线
  const divY = startY + ROWS * (cardH + GAP) + 8;
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(40, divY); ctx.lineTo(W - 40, divY); ctx.stroke();

  // 总分
  const total = scoreValue.textContent;
  ctx.font = 'bold 36px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f9d71c';
  ctx.fillText(`${total} 分`, W / 2, divY + 44);

  // 评语
  const comment = commentLine.textContent;
  ctx.font = '15px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText(comment, W / 2, divY + 70);

  // 本命 ICON（小图）
  if (state.favId) {
    const favChar = CHARACTERS.find(c => c.id === state.favId);
    const iconImg = await loadImg(favChar.icon);
    if (iconImg) {
      const iS = 58;
      const iX = W / 2 - iS / 2;
      const iY = divY + 82;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(iX, iY, iS, iS, 10);
      ctx.clip();
      ctx.drawImage(iconImg, iX, iY, iS, iS);
      ctx.restore();
      ctx.strokeStyle = '#e94560';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(iX, iY, iS, iS, 10);
      ctx.stroke();

      ctx.font = '11px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.fillStyle = '#e94560';
      ctx.textAlign = 'center';
      ctx.fillText(`本命：${favChar.name}`, W / 2, iY + iS + 16);
    }
  }

  // 水印
  ctx.font = '11px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.textAlign = 'right';
  ctx.fillText('命运扳机大手子 · GRseiha', W - 18, H - 10);

  // 输出
  shareCanvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    outputImg.src = url;
    outputWrap.style.display = 'flex';

    // 触发下载
    const a = document.createElement('a');
    a.download = '命运扳机大手子.png';
    a.href = url;
    a.click();

    btnSave.disabled = false;
    btnSave.textContent = '📸 保存分享图片';
  }, 'image/png');
});

// 关闭输出预览
outputLink.addEventListener('click', () => {
  outputWrap.style.display = 'none';
});

// ===================================================
//  工具函数
// ===================================================
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
