(() => {
  const DATA = window.GUYU_DATA || [];
  const CATEGORIES = [...new Set(DATA.map(x => x.category))];
  const CATEGORY_META = {
    '认识与思维': ['角度','判断','认知'],
    '学习与求知': ['学习','思考','求知'],
    '行动与积累': ['行动','积累','方法'],
    '坚持与逆境': ['坚持','困难','成长'],
    '辩证与变化': ['变化','适度','辩证'],
    '心态与自省': ['心态','反思','修养'],
    '人际与合作': ['合作','尊重','关系'],
    '规则、诚信与责任': ['规则','诚信','责任'],
    '时间、选择与目标': ['时间','选择','目标'],
    '情谊、胸怀与人生价值': ['情谊','胸怀','价值']
  };
  const EXAMPLE_LEADS = {
    '认识与思维': '面对复杂问题时，我们不能只凭第一印象下结论，而应该主动换一个角度思考。',
    '学习与求知': '学习不是简单地记住知识，更重要的是不断思考、实践和修正自己的认识。',
    '行动与积累': '任何长期目标都离不开一步一步的实践，真正的进步往往来自持续的小行动。',
    '坚持与逆境': '遇到困难时，暂时的挫折并不意味着失败，关键是能否继续向前。',
    '辩证与变化': '看待事物时，我们既要看到积极的一面，也要注意条件、程度和可能发生的变化。',
    '心态与自省': '一个人的成长不仅取决于外在条件，也取决于能否保持清醒并经常反思自己。',
    '人际与合作': '在合作中，理解、尊重和沟通往往比单纯要求别人认同自己更重要。',
    '规则、诚信与责任': '个人行为不仅影响自己，也会影响他人和社会，因此规则、信用与责任不可忽视。',
    '时间、选择与目标': '面对选择时，我们既要考虑眼前的得失，也要思考长期目标和机会成本。',
    '情谊、胸怀与人生价值': '人生的价值不只体现在个人得失上，也体现在人与人之间的情感、胸怀与贡献中。'
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];

  const state = {
    category: CATEGORIES[0],
    currentId: DATA[0]?.id || 1,
    tab: 'meaning',
    practiceMode: 'meaning',
    search: '',
    reviewMistakes: false,
    learned: new Set(JSON.parse(localStorage.getItem('guyu_learned') || '[]')),
    favorites: new Set(JSON.parse(localStorage.getItem('guyu_favorites') || '[]')),
    mistakes: JSON.parse(localStorage.getItem('guyu_mistakes') || '{}')
  };

  function saveState() {
    localStorage.setItem('guyu_learned', JSON.stringify([...state.learned]));
    localStorage.setItem('guyu_favorites', JSON.stringify([...state.favorites]));
    localStorage.setItem('guyu_mistakes', JSON.stringify(state.mistakes));
  }

  function currentItem() {
    return DATA.find(x => x.id === state.currentId) || DATA[0];
  }

  function visibleItems() {
    let list = DATA.filter(x => x.category === state.category);
    if (state.reviewMistakes) {
      const ids = Object.keys(state.mistakes).filter(id => state.mistakes[id] > 0).map(Number);
      list = DATA.filter(x => ids.includes(x.id));
    }
    if (state.search.trim()) {
      const q = state.search.trim().toLowerCase();
      list = DATA.filter(x => `${x.text} ${x.pinyin} ${x.source} ${x.core}`.toLowerCase().includes(q));
    }
    return list;
  }

  function getCategoryItems() {
    return DATA.filter(x => x.category === currentItem().category);
  }

  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('show'), 1800);
  }

  function renderCategories() {
    const nav = $('#categoryNav');
    nav.innerHTML = CATEGORIES.map((cat, i) => {
      const count = DATA.filter(x => x.category === cat).length;
      return `<button class="category-btn ${!state.reviewMistakes && !state.search && state.category === cat ? 'active' : ''}" data-category="${cat}">
        <span class="category-index">${String(i+1).padStart(2,'0')}</span>
        <span class="category-name">${cat}</span>
        <span class="category-count">${count}</span>
      </button>`;
    }).join('');

    $$('.category-btn').forEach(btn => btn.addEventListener('click', () => {
      state.search = '';
      $('#searchInput').value = '';
      state.reviewMistakes = false;
      state.category = btn.dataset.category;
      const first = DATA.find(x => x.category === state.category);
      if (first) state.currentId = first.id;
      renderAll();
      $('#sidebar').classList.remove('open');
    }));
  }

  function renderProgress() {
    $('#learnedCount').textContent = `${state.learned.size} / ${DATA.length}`;
    $('#progressBar').style.width = `${DATA.length ? state.learned.size / DATA.length * 100 : 0}%`;
  }

  function renderHeader() {
    const item = currentItem();
    $('#categoryTitle').textContent = state.reviewMistakes ? '错题复习' : item.category;
    $('#pageTitle').textContent = item.text;
    $('#itemNumber').textContent = String(item.id).padStart(2,'0');
    $('#heroText').textContent = item.text;
    $('#heroPinyin').textContent = item.pinyin;
    $('#heroSource').textContent = item.source;
    const learnedBtn = $('#markLearnedBtn');
    learnedBtn.textContent = state.learned.has(item.id) ? '✓ 已掌握' : '✓ 我会了';
    learnedBtn.classList.toggle('learned', state.learned.has(item.id));
    $('#favoriteBtn').textContent = state.favorites.has(item.id) ? '★' : '☆';
  }

  function chipLabel(text) {
    const compact = text.replace(/[，；。、“”]/g,'');
    return compact.length <= 4 ? compact : compact.slice(0,2);
  }

  function renderStrip() {
    const list = visibleItems();
    const wrap = $('#itemStrip');
    if (!list.length) {
      wrap.innerHTML = '<div class="empty" style="padding:8px 0">Không tìm thấy nội dung phù hợp.</div>';
      return;
    }
    if (!list.some(x => x.id === state.currentId)) state.currentId = list[0].id;
    wrap.innerHTML = list.map(x => `<button class="item-chip ${x.id === state.currentId ? 'active' : ''}" data-id="${x.id}" title="${x.text}">${chipLabel(x.text)}</button>`).join('');
    $$('.item-chip').forEach(btn => btn.addEventListener('click', () => {
      state.currentId = Number(btn.dataset.id);
      state.category = currentItem().category;
      renderAll();
    }));
    requestAnimationFrame(() => wrap.querySelector('.item-chip.active')?.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'}));
  }

  function renderTabs() {
    $$('.tab').forEach(tab => tab.classList.toggle('active', tab.dataset.tab === state.tab));
    const panel = $('#panel');
    if (state.tab === 'meaning') renderMeaning(panel);
    if (state.tab === 'flashcard') renderFlashcard(panel);
    if (state.tab === 'practice') renderPractice(panel);
    if (state.tab === 'usage') renderUsage(panel);
  }

  function renderMeaning(panel) {
    const item = currentItem();
    const tags = CATEGORY_META[item.category] || ['古语','HSK 7–9'];
    panel.innerHTML = `
      <div class="meaning-grid">
        <div class="card soft">
          <div class="card-title">核心含义</div>
          <p class="core-text">${item.core}</p>
          <div style="height:18px"></div>
          <div class="card-title">关键词</div>
          <div class="tags">${tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
        </div>
        <div class="card">
          <div class="card-title">基本信息</div>
          <div class="info-list">
            <div class="info-row"><div class="info-label">古语</div><div>${item.text}</div></div>
            <div class="info-row"><div class="info-label">拼音</div><div>${item.pinyin}</div></div>
            <div class="info-row"><div class="info-label">出处</div><div>${item.source}</div></div>
            <div class="info-row"><div class="info-label">主题</div><div>${item.category}</div></div>
          </div>
        </div>
      </div>`;
  }

  function renderFlashcard(panel) {
    const item = currentItem();
    panel.innerHTML = `
      <div class="flashcard-wrap">
        <div>
          <div class="flashcard" id="flashcard">
            <div class="flashcard-inner">
              <div class="flash-face flash-front">
                <div class="card-title">看古语 · 先回忆含义</div>
                <h4>${item.text}</h4>
                <div class="flash-hint">点击卡片查看答案</div>
              </div>
              <div class="flash-face flash-back">
                <div class="card-title">答案</div>
                <p>${item.core}</p>
                <div class="pinyin">${item.pinyin}</div>
                <div class="source">${item.source}</div>
              </div>
            </div>
          </div>
          <div class="flash-actions">
            <button class="ghost-btn" id="againBtn">还不熟</button>
            <button class="primary-btn" id="knowBtn">我会了</button>
          </div>
        </div>
      </div>`;
    $('#flashcard').addEventListener('click', e => e.currentTarget.classList.toggle('flipped'));
    $('#knowBtn').addEventListener('click', () => {
      state.learned.add(item.id); saveState(); renderProgress(); renderHeader(); toast('已标记为掌握');
    });
    $('#againBtn').addEventListener('click', () => {
      state.learned.delete(item.id); saveState(); renderProgress(); renderHeader(); toast('已加入继续复习');
    });
  }

  function shuffled(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function practicePool() {
    const same = DATA.filter(x => x.category === currentItem().category && x.id !== currentItem().id);
    return same.length >= 3 ? same : DATA.filter(x => x.id !== currentItem().id);
  }

  function recordMistake(id) {
    state.mistakes[id] = (state.mistakes[id] || 0) + 1;
    saveState();
  }

  function renderPractice(panel) {
    panel.innerHTML = `
      <div class="practice-toolbar">
        <button class="mode-btn ${state.practiceMode==='meaning'?'active':''}" data-mode="meaning">看古语选含义</button>
        <button class="mode-btn ${state.practiceMode==='fill'?'active':''}" data-mode="fill">补全名句</button>
        <button class="mode-btn ${state.practiceMode==='match'?'active':''}" data-mode="match">古语配对</button>
      </div>
      <div id="practiceBody"></div>`;
    $$('.mode-btn').forEach(btn => btn.addEventListener('click', () => {
      state.practiceMode = btn.dataset.mode;
      renderPractice(panel);
    }));
    if (state.practiceMode === 'meaning') renderMeaningQuiz($('#practiceBody'));
    if (state.practiceMode === 'fill') renderFillQuiz($('#practiceBody'));
    if (state.practiceMode === 'match') renderMatchQuiz($('#practiceBody'));
  }

  function renderMeaningQuiz(root) {
    const item = currentItem();
    const distractors = shuffled(practicePool()).slice(0,3).map(x => x.core);
    const options = shuffled([item.core, ...distractors]);
    root.innerHTML = `
      <div class="question-card">
        <div class="question-label">选择题</div>
        <h4 class="question-title">“${item.text}”最接近下面哪一个意思？</h4>
        <div class="options">${options.map((o,i)=>`<button class="option" data-value="${encodeURIComponent(o)}">${String.fromCharCode(65+i)}. ${o}</button>`).join('')}</div>
        <div class="feedback" id="feedback"></div>
      </div>`;
    $$('.option').forEach(btn => btn.addEventListener('click', () => {
      if (root.dataset.answered) return;
      root.dataset.answered = '1';
      const value = decodeURIComponent(btn.dataset.value);
      const correct = value === item.core;
      btn.classList.add(correct ? 'correct' : 'wrong');
      $$('.option').forEach(b => {
        if (decodeURIComponent(b.dataset.value) === item.core) b.classList.add('correct');
      });
      if (!correct) recordMistake(item.id);
      const fb = $('#feedback');
      fb.textContent = correct ? '✓ 正确！继续保持。' : `答案：${item.core}`;
      fb.classList.add('show');
    }));
  }

  function makeBlank(text) {
    const pieces = text.split(/[，；]/).filter(Boolean);
    if (pieces.length > 1) {
      const answer = pieces[pieces.length - 1].replace(/[。]/g,'');
      const index = text.lastIndexOf(answer);
      return {masked: text.slice(0,index) + '＿＿＿＿', answer};
    }
    const chars = [...text];
    const n = Math.min(4, Math.max(2, Math.floor(chars.length / 2)));
    const answer = chars.slice(-n).join('');
    return {masked: chars.slice(0,-n).join('') + '＿＿＿＿', answer};
  }

  function renderFillQuiz(root) {
    const item = currentItem();
    const {masked, answer} = makeBlank(item.text);
    root.innerHTML = `
      <div class="question-card">
        <div class="question-label">填空题</div>
        <h4 class="question-title">${masked}</h4>
        <div class="fill-row">
          <input class="fill-input" id="fillInput" placeholder="输入缺少的部分" autocomplete="off" />
          <button class="primary-btn" id="checkFill">检查</button>
        </div>
        <div class="feedback" id="feedback"></div>
      </div>`;
    $('#checkFill').addEventListener('click', () => {
      const val = $('#fillInput').value.trim().replace(/[，。；、\s]/g,'');
      const target = answer.replace(/[，。；、\s]/g,'');
      const correct = val === target;
      if (!correct) recordMistake(item.id);
      const fb = $('#feedback');
      fb.textContent = correct ? '✓ 正确！' : `答案：${answer}`;
      fb.classList.add('show');
    });
    $('#fillInput').addEventListener('keydown', e => { if (e.key === 'Enter') $('#checkFill').click(); });
  }

  function renderMatchQuiz(root) {
    const group = shuffled(DATA.filter(x => x.category === currentItem().category)).slice(0,4);
    const left = shuffled(group);
    const right = shuffled(group);
    root.innerHTML = `
      <div class="question-card">
        <div class="question-label">配对题</div>
        <h4 class="question-title">把古语和它的核心含义配对</h4>
        <div class="match-grid">
          <div class="match-col">${left.map(x=>`<button class="match-card left" data-id="${x.id}">${x.text}</button>`).join('')}</div>
          <div class="match-col">${right.map(x=>`<button class="match-card right" data-id="${x.id}">${x.core}</button>`).join('')}</div>
        </div>
        <div class="feedback" id="feedback">完成 4 组即可过关。</div>
      </div>`;
    let selectedLeft = null, selectedRight = null, matched = 0;
    const tryMatch = () => {
      if (!selectedLeft || !selectedRight) return;
      if (selectedLeft.dataset.id === selectedRight.dataset.id) {
        selectedLeft.classList.add('matched'); selectedRight.classList.add('matched');
        selectedLeft.disabled = true; selectedRight.disabled = true; matched++;
        selectedLeft = selectedRight = null;
        if (matched === group.length) {
          const fb = $('#feedback'); fb.textContent = '✓ 全部配对正确！'; fb.classList.add('show');
        }
      } else {
        const wrongId = Number(selectedLeft.dataset.id);
        recordMistake(wrongId);
        selectedLeft.classList.add('wrong'); selectedRight.classList.add('wrong');
        setTimeout(() => {
          selectedLeft?.classList.remove('wrong','selected');
          selectedRight?.classList.remove('wrong','selected');
          selectedLeft = selectedRight = null;
        }, 450);
      }
    };
    $$('.match-card.left').forEach(btn => btn.addEventListener('click', () => {
      if (btn.disabled) return;
      $$('.match-card.left').forEach(b=>b.classList.remove('selected'));
      selectedLeft = btn; btn.classList.add('selected'); tryMatch();
    }));
    $$('.match-card.right').forEach(btn => btn.addEventListener('click', () => {
      if (btn.disabled) return;
      $$('.match-card.right').forEach(b=>b.classList.remove('selected'));
      selectedRight = btn; btn.classList.add('selected'); tryMatch();
    }));
  }

  function renderUsage(panel) {
    const item = currentItem();
    const lead = EXAMPLE_LEADS[item.category];
    panel.innerHTML = `
      <div class="usage-grid">
        <div class="card soft">
          <div class="card-title">写作例句 01</div>
          <p class="usage-sentence">${lead} 正所谓“${item.text}”，${item.core.replace(/。$/,'')}。</p>
          <div class="usage-note">适合用来引出观点或总结一个道理。</div>
        </div>
        <div class="card">
          <div class="card-title">写作例句 02</div>
          <p class="usage-sentence">古人所说的“${item.text}”至今仍有现实意义。它提醒我们，${item.core.replace(/。$/,'')}。</p>
          <div class="usage-note">适合放在议论文主体段或结尾。</div>
        </div>
      </div>
      <div style="height:18px"></div>
      <div class="template-box">
        <strong>可套用句型：</strong><br>
        正所谓“……”，……<br>
        古人云：“……”。因此，……<br>
        从这个角度来看，“……”至今仍有现实意义。<br>
        这也印证了“……”这一道理。
      </div>`;
  }

  function renderAll() {
    renderCategories();
    renderProgress();
    renderStrip();
    renderHeader();
    renderTabs();
  }

  function move(delta) {
    const list = visibleItems();
    if (!list.length) return;
    const i = Math.max(0, list.findIndex(x => x.id === state.currentId));
    const next = list[(i + delta + list.length) % list.length];
    state.currentId = next.id;
    state.category = next.category;
    renderAll();
  }

  // Static handlers
  $$('.tab').forEach(tab => tab.addEventListener('click', () => {
    state.tab = tab.dataset.tab;
    renderTabs();
  }));
  $('#prevBtn').addEventListener('click', () => move(-1));
  $('#nextBtn').addEventListener('click', () => move(1));
  $('#markLearnedBtn').addEventListener('click', () => {
    const id = currentItem().id;
    if (state.learned.has(id)) state.learned.delete(id); else state.learned.add(id);
    saveState(); renderAll();
  });
  $('#favoriteBtn').addEventListener('click', () => {
    const id = currentItem().id;
    if (state.favorites.has(id)) state.favorites.delete(id); else state.favorites.add(id);
    saveState(); renderHeader(); toast(state.favorites.has(id) ? '已收藏' : '已取消收藏');
  });
  $('#randomBtn').addEventListener('click', () => {
    const item = DATA[Math.floor(Math.random() * DATA.length)];
    state.search = ''; $('#searchInput').value = ''; state.reviewMistakes = false;
    state.currentId = item.id; state.category = item.category; renderAll();
  });
  $('#reviewMistakesBtn').addEventListener('click', () => {
    const ids = Object.keys(state.mistakes).filter(id => state.mistakes[id] > 0);
    if (!ids.length) { toast('目前还没有错题'); return; }
    state.reviewMistakes = true; state.search = ''; $('#searchInput').value='';
    state.currentId = Number(ids[0]); state.category = currentItem().category; renderAll();
  });
  $('#searchInput').addEventListener('input', e => {
    state.search = e.target.value;
    state.reviewMistakes = false;
    const list = visibleItems();
    if (list.length) { state.currentId = list[0].id; state.category = list[0].category; }
    renderAll();
  });
  $('#menuBtn').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  $('#speakBtn').addEventListener('click', () => {
    if (!('speechSynthesis' in window)) { toast('Trình duyệt này chưa hỗ trợ đọc tự động'); return; }
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(currentItem().text);
    utter.lang = 'zh-CN'; utter.rate = .8;
    speechSynthesis.speak(utter);
  });

  renderAll();
})();
