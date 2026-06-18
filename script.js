// ===================================================
//  命运扳机大手子 · script.js  v2
// ===================================================

const CHARACTERS = [
  { id:'NASE',      name:'名濑',    color:'#f4a7c3', overlayColor:'#d6578a', avatar:'images/avatars/NASE.jpg',      icon:'images/icons/NASE.jpg' },
  { id:'XIVA',      name:'绮罗',    color:'#f9e8a0', overlayColor:'#c9a833', avatar:'images/avatars/XIVA.jpg',      icon:'images/icons/XIVA.jpg' },
  { id:'HUXLEY',    name:'赫希黎',  color:'#d8c4f0', overlayColor:'#7b52ab', avatar:'images/avatars/HUXLEY.jpg',    icon:'images/icons/HUXLEY.jpg' },
  { id:'CAMILLE',   name:'卡密儿',  color:'#b8f0c8', overlayColor:'#2e8b57', avatar:'images/avatars/CAMILLE.jpg',   icon:'images/icons/CAMILLE.jpg' },
  { id:'RYOIN',     name:'獠隐',    color:'#c8cdd6', overlayColor:'#5a6175', avatar:'images/avatars/RYOIN.jpg',     icon:'images/icons/RYOIN.jpg' },
  { id:'MINDY',     name:'明迪',    color:'#f5c842', overlayColor:'#b8870a', avatar:'images/avatars/MINDY.jpg',     icon:'images/icons/MINDY.jpg' },
  { id:'SOARWYNNE', name:'索尔维亚',color:'#f4a96a', overlayColor:'#d0621a', avatar:'images/avatars/SOARWYNNE.jpg', icon:'images/icons/SOARWYNNE.jpg' },
  { id:'CYNRIC',    name:'西瑞克',  color:'#7ec8f0', overlayColor:'#1a6ea8', avatar:'images/avatars/CYNRIC.jpg',    icon:'images/icons/CYNRIC.jpg' },
  { id:'KIRA',      name:'希',      color:'#5a8f78', overlayColor:'#1e4d38', avatar:'images/avatars/KIRA.jpg',      icon:'images/icons/KIRA.jpg' },
  { id:'EOS',       name:'伊欧斯',  color:'#f5a0a0', overlayColor:'#c0392b', avatar:'images/avatars/EOS.jpg',       icon:'images/icons/EOS.jpg' },
];

const LEVEL_LABELS  = ['没玩过','会玩','熟悉','精通','本命 ♥'];
const LEVEL_SCORES  = [0, 1, 2, 3, 4];

// 评分区间
// 满分：1本命(4) + 9精通(3×9=27) = 31
// 路人 0~3；后续各档下调2分；顶点放宽至 27~30，满分31单独列
const COMMENTS = [
  { min: 0,  max: 3,  text: '看来你还只是个路人……要不要试一局？' },
  { min: 4,  max: 10, text: '新手上路，握紧扳机！' },
  { min: 11, max: 16, text: '已经摸到命运的边缘了~' },
  { min: 17, max: 22, text: '老练的 Awakener，战场上见过你！' },
  { min: 23, max: 27, text: '你对这片战场了如指掌，厉害！' },
  { min: 28, max: 30, text: '你就是命运吧唧高手！' },
  { min: 31, max: 31, text: '全员制霸！你才是真正的运命之神！！' },
];

// 状态
const state = { levels: {}, favId: null };
CHARACTERS.forEach(c => { state.levels[c.id] = 0; });

const LS_KEY = 'gr-seiha-v2';
try {
  const s = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  if (s.levels) Object.assign(state.levels, s.levels);
  if (s.favId)  state.favId = s.favId;
} catch(e) {}

// ===================================================
//  DOM 引用
// ===================================================
const grid        = document.getElementById('character-grid');
const popup       = document.getElementById('level-popup');
const popupName   = document.getElementById('popup-name');
const popupLevels = document.getElementById('popup-levels');
const btnConfirm  = document.getElementById('btn-confirm');
const btnReset    = document.getElementById('btn-reset');
const resultPanel = document.getElementById('result-panel');
const resultScore = document.getElementById('result-score');
const resultComment = document.getElementById('result-comment');
const favIconWrap = document.getElementById('fav-icon-wrap');
const favIcon     = document.getElementById('fav-icon');
const favNameEl   = document.getElementById('fav-name');
const btnSave     = document.getElementById('btn-save');
const outputWrap  = document.getElementById('output-wrap');
const outputImg   = document.getElementById('output-img');
const outputLink  = document.getElementById('output-link');
const shareCanvas = document.getElementById('share-canvas');

let currentChar = null;

// ===================================================
//  构建角色卡片
// ===================================================
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

renderCards(); // 初始渲染卡片状态（不显示结算）

// ===================================================
//  弹窗
// ===================================================
function openPopup(e, char) {
  e.stopPropagation();
  currentChar = char;
  popupName.textContent = char.name;

  popupLevels.querySelectorAll('li').forEach(li => {
    li.classList.toggle('active-level', parseInt(li.dataset.level) === state.levels[char.id]);
  });

  // 本命选项：若已有本命且不是本角色，则置灰
  const li4 = popupLevels.querySelector('[data-level="4"]');
  const blocked = state.favId && state.favId !== char.id;
  li4.style.opacity      = blocked ? '0.3' : '';
  li4.style.pointerEvents = blocked ? 'none' : '';
  li4.title = blocked ? `本命已设为 ${CHARACTERS.find(c=>c.id===state.favId)?.name}` : '';

  // 定位
  const rect = e.currentTarget.getBoundingClientRect();
  const popW = 138, popH = 210;
  let left = rect.left + rect.width/2 - popW/2 + window.scrollX;
  let top  = rect.top  + rect.height/2 - popH/2 + window.scrollY;
  left = Math.max(6, Math.min(left, document.body.offsetWidth - popW - 6));
  top  = Math.max(6, Math.min(top, document.documentElement.scrollHeight - popH - 6));
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

  if (lv === 4) {
    if (state.favId && state.favId !== charId) return;
    // 取消其他角色的本命
    CHARACTERS.forEach(c => {
      if (c.id !== charId && state.levels[c.id] === 4) state.levels[c.id] = 0;
    });
    state.favId = charId;
  } else {
    if (state.levels[charId] === 4) state.favId = null;
  }

  state.levels[charId] = lv;
  save();
  renderCards();
  closePopup();
  // 如果结算区已经展开，隐藏（需要重新确认）
  resultPanel.style.display = 'none';
});

// ===================================================
//  确认按钮 → 展示结算
// ===================================================
btnConfirm.addEventListener('click', () => {
  const total = calcTotal();
  resultScore.textContent  = total;
  resultComment.textContent = getComment(total);

  if (state.favId) {
    const fc = CHARACTERS.find(c => c.id === state.favId);
    favIcon.src    = fc.icon;
    favNameEl.textContent = `本命：${fc.name}`;
    favIconWrap.style.display = 'flex';
  } else {
    favIconWrap.style.display = 'none';
  }

  resultPanel.style.display = 'block';
  resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// ===================================================
//  重置
// ===================================================
btnReset.addEventListener('click', () => {
  CHARACTERS.forEach(c => { state.levels[c.id] = 0; });
  state.favId = null;
  save();
  renderCards();
  resultPanel.style.display = 'none';
});

// ===================================================
//  渲染卡片状态（不含结算数字）
// ===================================================
function renderCards() {
  CHARACTERS.forEach(char => {
    const lv = state.levels[char.id] || 0;
    const badge = document.getElementById('badge-' + char.id);
    badge.textContent = lv > 0 ? LEVEL_LABELS[lv] : '';
    const card = grid.querySelector(`[data-id="${char.id}"]`);
    card.classList.toggle('selected', lv > 0 && lv < 4);
    card.classList.toggle('fav', lv === 4);
  });
}

function calcTotal() {
  return CHARACTERS.reduce((sum, c) => sum + (LEVEL_SCORES[state.levels[c.id] || 0]), 0);
}

function getComment(score) {
  for (const seg of COMMENTS) {
    if (score >= seg.min && score <= seg.max) return seg.text;
  }
  return '';
}

function save() {
  localStorage.setItem(LS_KEY, JSON.stringify({ levels: state.levels, favId: state.favId }));
}

// ===================================================
//  保存分享图片
// ===================================================
btnSave.addEventListener('click', async () => {
  btnSave.disabled = true;
  btnSave.textContent = '生成中…';

  const W = 800, H = 580;
  shareCanvas.width  = W;
  shareCanvas.height = H;
  const ctx = shareCanvas.getContext('2d');

  // 背景
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#0f0f18');
  grad.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 网格装饰
  ctx.strokeStyle = 'rgba(255,255,255,0.035)';
  ctx.lineWidth = 1;
  for (let x=0; x<W; x+=50) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y=0; y<H; y+=50) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // 标题
  ctx.font = 'bold 26px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.fillStyle = '#f9d71c';
  ctx.textAlign = 'center';
  ctx.fillText('命运扳机大手子', W/2, 40);
  ctx.font = '13px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText('Fate Trigger · Awakener 阶位检定', W/2, 62);

  const loadImg = src => new Promise(res => {
    const img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = () => res(img); img.onerror = () => res(null); img.src = src;
  });

  const avatarImgs = await Promise.all(CHARACTERS.map(c => loadImg(c.avatar)));

  const COLS=5, cardW=120, cardH=140, GAP=10;
  const startX = (W - COLS*cardW - (COLS-1)*GAP) / 2;
  const startY = 78;

  for (let i=0; i<CHARACTERS.length; i++) {
    const char = CHARACTERS[i];
    const col  = i % COLS, row = Math.floor(i/COLS);
    const x    = startX + col*(cardW+GAP);
    const y    = startY + row*(cardH+GAP);
    const lv   = state.levels[char.id] || 0;
    const isFav = state.favId === char.id;

    ctx.save();
    roundRect(ctx, x, y, cardW, cardH, 10); ctx.clip();
    ctx.fillStyle = char.overlayColor; ctx.fillRect(x, y, cardW, cardH);
    if (avatarImgs[i]) {
      const ir = avatarImgs[i].naturalHeight / avatarImgs[i].naturalWidth;
      const dh = cardW * ir;
      ctx.globalAlpha = 0.82;
      ctx.drawImage(avatarImgs[i], x, y - dh*0.12, cardW, dh);
      ctx.globalAlpha = 1;
    }
    const ov = ctx.createLinearGradient(x, y, x, y+cardH);
    ov.addColorStop(0, 'rgba(0,0,0,0)');
    ov.addColorStop(0.6, 'rgba(0,0,0,0.15)');
    ov.addColorStop(1, 'rgba(0,0,0,0.78)');
    ctx.fillStyle = ov; ctx.fillRect(x, y, cardW, cardH);
    ctx.restore();

    // 边框
    ctx.save();
    ctx.strokeStyle = isFav ? '#e94560' : (lv>0 ? char.color : 'rgba(255,255,255,0.12)');
    ctx.lineWidth   = isFav ? 2.5 : 1.5;
    roundRect(ctx, x, y, cardW, cardH, 10); ctx.stroke();
    ctx.restore();

    // 名字
    ctx.font = 'bold 12px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 4;
    ctx.fillText(char.name, x+cardW/2, y+cardH-22);
    ctx.shadowBlur = 0;

    if (lv > 0) {
      ctx.font = 'bold 10px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.fillStyle = isFav ? '#e94560' : '#f9d71c';
      ctx.fillText(LEVEL_LABELS[lv], x+cardW/2, y+cardH-8);
    }
    if (isFav) {
      ctx.font = '13px serif'; ctx.fillStyle = '#e94560';
      ctx.fillText('♥', x+cardW-10, y+16);
    }
  }

  // 分割线
  const divY = startY + 2*(cardH+GAP) + 10;
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(40, divY); ctx.lineTo(W-40, divY); ctx.stroke();

  // 分数
  const total = calcTotal();
  ctx.font = 'bold 42px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.fillStyle = '#f9d71c'; ctx.textAlign = 'center';
  ctx.fillText(`${total} 分`, W/2, divY+52);

  ctx.font = '15px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.fillText(getComment(total), W/2, divY+78);

  // 本命 ICON
  if (state.favId) {
    const fc = CHARACTERS.find(c => c.id === state.favId);
    const iconImg = await loadImg(fc.icon);
    if (iconImg) {
      const iS=60, iX=W/2-iS/2, iY=divY+92;
      ctx.save();
      ctx.beginPath(); ctx.roundRect(iX, iY, iS, iS, 10); ctx.clip();
      ctx.drawImage(iconImg, iX, iY, iS, iS);
      ctx.restore();
      ctx.strokeStyle='#e94560'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.roundRect(iX, iY, iS, iS, 10); ctx.stroke();
      ctx.font='11px "PingFang SC","Microsoft YaHei",sans-serif';
      ctx.fillStyle='#e94560'; ctx.textAlign='center';
      ctx.fillText(`本命：${fc.name}`, W/2, iY+iS+15);
    }
  }

  // 水印
  ctx.font='11px sans-serif'; ctx.fillStyle='rgba(255,255,255,0.18)'; ctx.textAlign='right';
  ctx.fillText('命运扳机大手子 · GRseiha', W-16, H-10);

  shareCanvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    outputImg.src = url;
    outputWrap.style.display = 'flex';
    const a = document.createElement('a');
    a.download = '命运扳机大手子.png'; a.href = url; a.click();
    btnSave.disabled = false;
    btnSave.textContent = '📸 保存分享图片';
  }, 'image/png');
});

outputLink.addEventListener('click', () => { outputWrap.style.display = 'none'; });

// ===================================================
//  工具
// ===================================================
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}
