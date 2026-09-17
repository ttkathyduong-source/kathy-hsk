(() => {
  'use strict';

  const DATA = Array.isArray(window.GUYU_DATA) ? window.GUYU_DATA : [];
  const CATEGORIES = [...new Set(DATA.map(item => item.category))];
  const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
  const STORAGE_KEY = 'kathy-hsk79-guyu-v2';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const stored = readStored();
  const state = {
    currentId: Number(stored.currentId) || 1,
    category: stored.category && CATEGORIES.includes(stored.category) ? stored.category : (CATEGORIES[0] || ''),
    tab: ['list','flashcard','practice','argument'].includes(stored.tab) ? stored.tab : 'list',
    learned: new Set(Array.isArray(stored.learned) ? stored.learned : []),
    favorites: new Set(Array.isArray(stored.favorites) ? stored.favorites : []),
    mistakes: new Set(Array.isArray(stored.mistakes) ? stored.mistakes : []),
    search: '',
    reviewMistakes: false,
    openId: null,
    practice: {
      mode: 'choice',
      itemId: null,
      answered: false,
      score: 0,
      total: 0,
      fillAnswer: '',
      fillPrompt: ''
    }
  };

  let voices = [];
  let toastTimer = null;

  function readStored() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentId: state.currentId,
        category: state.category,
        tab: state.tab,
        learned: [...state.learned],
        favorites: [...state.favorites],
        mistakes: [...state.mistakes]
      }));
    } catch {}
  }

  function currentItem() {
    return DATA.find(item => item.id === state.currentId) || DATA[0];
  }

  function categoryItems(category = state.category) {
    return DATA.filter(item => item.category === category);
  }

  function searchItems() {
    const q = state.search.trim().toLowerCase();
    if (!q) return [];
    return DATA.filter(item => [item.text, item.pinyin, item.gloss, item.source, item.core, item.category]
      .some(value => String(value || '').toLowerCase().includes(q)));
  }

  function visibleItems() {
    if (state.search.trim()) return searchItems();
    if (state.reviewMistakes) return DATA.filter(item => state.mistakes.has(item.id));
    return categoryItems();
  }

  function ensureCurrentVisible() {
    const list = visibleItems();
    if (list.length && !list.some(item => item.id === state.currentId)) {
      state.currentId = list[0].id;
      state.openId = state.currentId;
    }
  }

  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    voices = window.speechSynthesis.getVoices() || [];
  }

  function pickChineseVoice() {
    if (!voices.length) loadVoices();
    const preferredNames = /ting|xiaoxiao|huihui|kangkang|sinji|mei-jia|mandarin|chinese/i;
    return voices.find(v => /^zh-CN$/i.test(v.lang) && preferredNames.test(v.name))
      || voices.find(v => /^zh-CN$/i.test(v.lang))
      || voices.find(v => /^zh(?:-|_)/i.test(v.lang))
      || null;
  }

  function speakText(text) {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      toast('Trình duyệt này chưa hỗ trợ đọc văn bản.');
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();
    loadVoices();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'zh-CN';
    utter.rate = 0.78;
    utter.pitch = 1;
    const voice = pickChineseVoice();
    if (voice) utter.voice = voice;
    utter.onerror = () => toast('Không phát được âm thanh trên thiết bị này.');
    synth.speak(utter);
  }

  function renderCategories() {
    const nav = $('#categoryNav');
    nav.innerHTML = CATEGORIES.map((category, index) => {
      const count = categoryItems(category).length;
      const active = !state.search && !state.reviewMistakes && state.category === category;
      return `
        <button class="category-btn ${active ? 'active' : ''}" type="button" data-category="${escapeHtml(category)}">
          <span class="category-index">${ROMAN[index] || index + 1}</span>
          <span class="category-name">${escapeHtml(category)}</span>
          <span class="category-count">${count}</span>
        </button>`;
    }).join('');

    $$('.category-btn', nav).forEach(btn => btn.addEventListener('click', () => {
      state.category = btn.dataset.category;
      state.reviewMistakes = false;
      state.search = '';
      $('#searchInput').value = '';
      const first = categoryItems(state.category)[0];
      if (first) state.currentId = first.id;
      state.openId = null;
      resetPracticeQuestion();
      saveState();
      closeSidebar();
      renderAll();
    }));
  }

  function renderProgress() {
    $('#learnedCount').textContent = `${state.learned.size} / ${DATA.length}`;
    $('#progressBar').style.width = `${DATA.length ? (state.learned.size / DATA.length) * 100 : 0}%`;
  }

  function renderTopbar() {
    const list = visibleItems();
    const eyebrow = $('#sectionEyebrow');
    const title = $('#categoryTitle');
    if (state.search.trim()) {
      eyebrow.textContent = 'Tìm kiếm';
      title.textContent = 'Kết quả phù hợp';
    } else if (state.reviewMistakes) {
      eyebrow.textContent = 'Ôn tập';
      title.textContent = 'Các câu đã làm sai';
    } else {
      eyebrow.textContent = 'Chủ đề';
      title.textContent = state.category;
    }
    $('#categoryMeta').textContent = `${list.length} câu`;
  }

  function renderHero() {
    const item = currentItem();
    if (!item) return;
    $('#itemNumber').textContent = String(item.id).padStart(2, '0');
    $('#heroText').textContent = item.text;
    $('#heroPinyin').textContent = item.pinyin;
    $('#heroSource').textContent = item.source;
    $('#favoriteBtn').textContent = state.favorites.has(item.id) ? '★' : '☆';
    $('#favoriteBtn').setAttribute('aria-label', state.favorites.has(item.id) ? 'Bỏ yêu thích' : 'Yêu thích');
    const learnedBtn = $('#markLearnedBtn');
    const learned = state.learned.has(item.id);
    learnedBtn.textContent = learned ? '✓ Đã thuộc' : '✓ Đánh dấu đã thuộc';
    learnedBtn.classList.toggle('learned', learned);
  }

  function renderTabs() {
    $$('.tab').forEach(tab => {
      const active = tab.dataset.tab === state.tab;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    const panel = $('#panel');
    if (state.tab === 'list') renderList(panel);
    if (state.tab === 'flashcard') renderFlashcard(panel);
    if (state.tab === 'practice') renderPractice(panel);
    if (state.tab === 'argument') renderArgument(panel);
  }

  function renderList(panel) {
    const list = visibleItems();
    const title = state.search.trim() ? 'Kết quả tìm kiếm' : state.reviewMistakes ? 'Câu cần ôn lại' : state.category;
    if (!list.length) {
      panel.innerHTML = `<div class="empty-state">${state.reviewMistakes ? 'Chưa có câu sai để ôn.' : 'Không tìm thấy nội dung phù hợp.'}</div>`;
      return;
    }

    panel.innerHTML = `
      <div class="list-toolbar">
        <div><h3>${escapeHtml(title)}</h3><p>Nhấn vào một câu để xem pinyin, giải nghĩa từ, nguồn và ý chính.</p></div>
      </div>
      <div class="list-stack">
        ${list.map(item => {
          const open = state.openId === item.id;
          return `
          <article class="list-item ${open ? 'open' : ''}" data-id="${item.id}">
            <button class="list-row" type="button" aria-expanded="${open ? 'true' : 'false'}">
              <span class="list-no">${String(item.id).padStart(2,'0')}</span>
              <span class="list-title">${escapeHtml(item.text)}</span>
              <span class="list-status"><span class="learned-dot ${state.learned.has(item.id) ? 'on' : ''}"></span><span>${state.learned.has(item.id) ? 'Đã thuộc' : ''}</span><span class="chev">⌄</span></span>
            </button>
            <div class="list-detail">
              <div class="detail-grid">
                <div class="detail-block"><div class="detail-label">Pinyin</div><div class="detail-value">${escapeHtml(item.pinyin)}</div></div>
                <div class="detail-block"><div class="detail-label">Nguồn</div><div class="detail-value">${escapeHtml(item.source)}</div></div>
                <div class="detail-block full"><div class="detail-label">Giải nghĩa từ</div><div class="detail-value">${escapeHtml(item.gloss)}</div></div>
                <div class="detail-block full"><div class="detail-label">Ý chính</div><div class="detail-value core">${escapeHtml(item.core)}</div></div>
              </div>
              <div class="detail-actions">
                <button class="btn btn-ghost btn-small listen-row" type="button">🔊 Nghe</button>
                <button class="btn ${state.learned.has(item.id) ? 'btn-primary learned' : 'btn-ghost'} btn-small learn-row" type="button">${state.learned.has(item.id) ? '✓ Đã thuộc' : 'Đánh dấu đã thuộc'}</button>
              </div>
            </div>
          </article>`;
        }).join('')}
      </div>`;

    $$('.list-item', panel).forEach(article => {
      const id = Number(article.dataset.id);
      const row = $('.list-row', article);
      row.addEventListener('click', () => {
        state.currentId = id;
        state.openId = state.openId === id ? null : id;
        const item = currentItem();
        if (item) state.category = item.category;
        saveState();
        renderTopbar();
        renderHero();
        renderList(panel);
      });
      $('.listen-row', article).addEventListener('click', event => {
        event.stopPropagation();
        const item = DATA.find(x => x.id === id);
        if (item) speakText(item.text);
      });
      $('.learn-row', article).addEventListener('click', event => {
        event.stopPropagation();
        toggleLearned(id);
        renderProgress();
        renderHero();
        renderList(panel);
      });
    });
  }

  function flashDeck() {
    const list = visibleItems();
    return list.length ? list : DATA;
  }

  function moveCurrent(delta) {
    const deck = flashDeck();
    if (!deck.length) return;
    let index = deck.findIndex(item => item.id === state.currentId);
    if (index < 0) index = 0;
    index = (index + delta + deck.length) % deck.length;
    state.currentId = deck[index].id;
    state.category = deck[index].category;
    state.openId = null;
    saveState();
  }

  function renderFlashcard(panel) {
    const item = currentItem();
    const deck = flashDeck();
    if (!item || !deck.length) {
      panel.innerHTML = '<div class="empty-state">Không có flashcard để hiển thị.</div>';
      return;
    }
    const index = Math.max(0, deck.findIndex(x => x.id === item.id));
    panel.innerHTML = `
      <div class="flash-stage">
        <div class="flash-meta"><span>Nhấn vào thẻ để lật</span><span>${index + 1} / ${deck.length}</span></div>
        <div class="flashcard" id="flashcard" role="button" tabindex="0" aria-label="Lật flashcard">
          <div class="flashcard-inner">
            <div class="flash-face flash-front">
              <div class="flash-kicker">Nhớ nghĩa trước khi lật</div>
              <div class="flash-text">${escapeHtml(item.text)}</div>
              <div class="flash-hint">Chạm / nhấn để xem đáp án</div>
            </div>
            <div class="flash-face flash-back">
              <h3 class="back-title">${escapeHtml(item.text)}</h3>
              <div class="back-pinyin">${escapeHtml(item.pinyin)}</div>
              <div class="back-grid">
                <div class="back-box"><strong>Giải nghĩa từ</strong><p>${escapeHtml(item.gloss)}</p></div>
                <div class="back-box"><strong>Nguồn</strong><p>${escapeHtml(item.source)}</p></div>
                <div class="back-box full"><strong>Ý chính</strong><p>${escapeHtml(item.core)}</p></div>
              </div>
            </div>
          </div>
        </div>
        <div class="flash-controls">
          <button class="btn btn-ghost" id="flashPrev" type="button">← Trước</button>
          <button class="btn btn-ghost" id="flashListen" type="button">🔊 Nghe</button>
          <button class="btn btn-primary ${state.learned.has(item.id) ? 'learned' : ''}" id="flashLearn" type="button">${state.learned.has(item.id) ? '✓ Đã thuộc' : 'Đánh dấu đã thuộc'}</button>
          <button class="btn btn-ghost" id="flashNext" type="button">Sau →</button>
        </div>
      </div>`;

    const card = $('#flashcard');
    const flip = () => card.classList.toggle('flipped');
    card.addEventListener('click', flip);
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); flip(); }
    });
    $('#flashPrev').addEventListener('click', () => { moveCurrent(-1); renderTopbar(); renderHero(); renderFlashcard(panel); });
    $('#flashNext').addEventListener('click', () => { moveCurrent(1); renderTopbar(); renderHero(); renderFlashcard(panel); });
    $('#flashListen').addEventListener('click', () => speakText(item.text));
    $('#flashLearn').addEventListener('click', () => { toggleLearned(item.id); renderProgress(); renderHero(); renderFlashcard(panel); });
  }

  function shuffled(array) {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function randomItemFrom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function makeFill(item) {
    const segments = item.text.split(/[，；。？！、：]/).filter(Boolean).sort((a,b) => b.length - a.length);
    const segment = segments[0] || item.text;
    const chars = Array.from(segment);
    const len = Math.min(chars.length, chars.length <= 3 ? 1 : chars.length <= 6 ? 2 : 3);
    const maxStart = Math.max(0, chars.length - len);
    const start = Math.floor(Math.random() * (maxStart + 1));
    const answer = chars.slice(start, start + len).join('');
    const blank = '＿'.repeat(len);
    const prompt = item.text.replace(answer, blank);
    return { answer, prompt };
  }

  function resetPracticeQuestion() {
    state.practice.itemId = null;
    state.practice.answered = false;
    state.practice.fillAnswer = '';
    state.practice.fillPrompt = '';
  }

  function ensurePracticeQuestion() {
    const pool = visibleItems().length ? visibleItems() : DATA;
    if (!pool.length) return null;
    let item = DATA.find(x => x.id === state.practice.itemId);
    if (!item || !pool.some(x => x.id === item.id)) {
      item = randomItemFrom(pool);
      state.practice.itemId = item.id;
      state.practice.answered = false;
      const fill = makeFill(item);
      state.practice.fillAnswer = fill.answer;
      state.practice.fillPrompt = fill.prompt;
    }
    return item;
  }

  function nextPracticeQuestion(panel) {
    const pool = visibleItems().length ? visibleItems() : DATA;
    if (!pool.length) return;
    const other = pool.filter(item => item.id !== state.practice.itemId);
    const next = randomItemFrom(other.length ? other : pool);
    state.practice.itemId = next.id;
    state.practice.answered = false;
    const fill = makeFill(next);
    state.practice.fillAnswer = fill.answer;
    state.practice.fillPrompt = fill.prompt;
    renderPractice(panel);
  }

  function markPracticeResult(item, correct) {
    state.practice.total += 1;
    if (correct) {
      state.practice.score += 1;
      state.mistakes.delete(item.id);
    } else {
      state.mistakes.add(item.id);
    }
    saveState();
  }

  function renderPractice(panel) {
    const item = ensurePracticeQuestion();
    if (!item) {
      panel.innerHTML = '<div class="empty-state">Không có dữ liệu bài tập.</div>';
      return;
    }
    panel.innerHTML = `
      <div class="practice-shell">
        <div class="practice-top">
          <div class="mode-switch" aria-label="Loại bài tập">
            <button class="mode-btn ${state.practice.mode === 'choice' ? 'active' : ''}" type="button" data-mode="choice">Chọn đáp án</button>
            <button class="mode-btn ${state.practice.mode === 'fill' ? 'active' : ''}" type="button" data-mode="fill">Điền từ</button>
          </div>
          <div class="practice-score">Đúng ${state.practice.score} / ${state.practice.total}</div>
        </div>
        <div id="questionArea"></div>
      </div>`;

    $$('.mode-btn', panel).forEach(btn => btn.addEventListener('click', () => {
      state.practice.mode = btn.dataset.mode;
      state.practice.answered = false;
      if (state.practice.mode === 'fill') {
        const fill = makeFill(item);
        state.practice.fillAnswer = fill.answer;
        state.practice.fillPrompt = fill.prompt;
      }
      renderPractice(panel);
    }));

    if (state.practice.mode === 'choice') renderChoiceQuestion($('#questionArea', panel), item, panel);
    else renderFillQuestion($('#questionArea', panel), item, panel);
  }

  function renderChoiceQuestion(area, item, panel) {
    const distractors = shuffled(DATA.filter(x => x.id !== item.id)).slice(0, 3);
    const options = shuffled([item, ...distractors]);
    area.innerHTML = `
      <div class="question-card">
        <div class="question-label">Chọn ý nghĩa phù hợp nhất</div>
        <h3 class="question-text">${escapeHtml(item.text)}</h3>
        <div class="option-list">
          ${options.map((opt, i) => `<button class="option-btn" type="button" data-id="${opt.id}"><strong>${String.fromCharCode(65+i)}.</strong> ${escapeHtml(opt.core)}</button>`).join('')}
        </div>
        <div class="feedback" id="practiceFeedback"></div>
        <div class="question-footer"><button class="btn btn-primary" id="nextQuestion" type="button" hidden>Câu tiếp theo →</button></div>
      </div>`;

    $$('.option-btn', area).forEach(btn => btn.addEventListener('click', () => {
      if (state.practice.answered) return;
      state.practice.answered = true;
      const chosenId = Number(btn.dataset.id);
      const correct = chosenId === item.id;
      markPracticeResult(item, correct);
      $$('.option-btn', area).forEach(option => {
        option.disabled = true;
        const id = Number(option.dataset.id);
        if (id === item.id) option.classList.add('correct');
        else if (id === chosenId) option.classList.add('wrong');
      });
      const feedback = $('#practiceFeedback', area);
      feedback.className = `feedback show ${correct ? 'good' : 'bad'}`;
      feedback.innerHTML = correct
        ? `Chính xác. <strong>${escapeHtml(item.source)}</strong>`
        : `Đáp án đúng: <strong>${escapeHtml(item.core)}</strong>`;
      $('#nextQuestion', area).hidden = false;
      renderProgress();
    }));

    $('#nextQuestion', area).addEventListener('click', () => nextPracticeQuestion(panel));
  }

  function renderFillQuestion(area, item, panel) {
    area.innerHTML = `
      <div class="question-card">
        <div class="question-label">Điền phần còn thiếu</div>
        <div class="fill-prompt">${escapeHtml(state.practice.fillPrompt)}</div>
        <form class="fill-form" id="fillForm">
          <input class="fill-input" id="fillInput" type="text" autocomplete="off" placeholder="Nhập chữ Hán còn thiếu…" aria-label="Đáp án" />
          <button class="btn btn-primary" type="submit">Kiểm tra</button>
        </form>
        <div class="feedback" id="practiceFeedback"></div>
        <div class="question-footer"><button class="btn btn-primary" id="nextQuestion" type="button" hidden>Câu tiếp theo →</button></div>
      </div>`;

    $('#fillForm', area).addEventListener('submit', event => {
      event.preventDefault();
      if (state.practice.answered) return;
      const value = $('#fillInput', area).value.trim().replace(/\s+/g, '');
      if (!value) { toast('Hãy nhập đáp án trước.'); return; }
      state.practice.answered = true;
      const correct = value === state.practice.fillAnswer;
      markPracticeResult(item, correct);
      $('#fillInput', area).disabled = true;
      const feedback = $('#practiceFeedback', area);
      feedback.className = `feedback show ${correct ? 'good' : 'bad'}`;
      feedback.innerHTML = correct
        ? `Chính xác. Câu đầy đủ: <strong>${escapeHtml(item.text)}</strong>`
        : `Đáp án: <strong>${escapeHtml(state.practice.fillAnswer)}</strong><br>Câu đầy đủ: ${escapeHtml(item.text)}`;
      $('#nextQuestion', area).hidden = false;
    });
    $('#nextQuestion', area).addEventListener('click', () => nextPracticeQuestion(panel));
    setTimeout(() => $('#fillInput', area)?.focus(), 0);
  }

  const ARGUMENT_CONTEXT = {
    '认识与思维': '面对复杂问题，我们既要关注局部，也要保持整体视角。',
    '学习与求知': '真正有效的学习，不只在于知识的数量，更在于方法、理解与实践。',
    '行动与积累': '实现目标不能停留在愿望上，而要落实到持续而具体的行动。',
    '坚持与逆境': '面对困难与挫折，人的态度往往决定能否继续前进。',
    '辩证与变化': '看待事物时，不能把问题绝对化，而应关注条件、尺度与变化。',
    '心态与自省': '成长不仅需要向外学习，也需要不断向内反思。',
    '人际与合作': '良好的人际关系与合作，建立在尊重、理解与共同努力之上。',
    '规则、诚信与责任': '个人与社会的稳定发展，都离不开规则、诚信与责任。',
    '时间、选择与目标': '面对有限的时间与资源，我们需要学会规划、选择并及时行动。',
    '情谊、胸怀与生态价值': '人与人、人与社会乃至人与自然，都需要更宽广、更长远的眼光。'
  };

  function trimSentence(text) {
    return String(text || '').replace(/[。；;\s]+$/g, '');
  }

  function argumentExamples(item) {
    const context = ARGUMENT_CONTEXT[item.category] || '面对现实问题，我们需要从经验中提炼更稳定的判断。';
    const core = trimSentence(item.core);
    return [
      `${context}正所谓“${item.text}”，${core}。`,
      `从现实角度看，“${item.text}”至今仍具有启发意义，它提醒我们：${core}。`
    ];
  }

  function renderArgument(panel) {
    const item = currentItem();
    if (!item) return;
    const examples = argumentExamples(item);
    panel.innerHTML = `
      <div class="argument-wrap">
        <div class="argument-intro">Hai câu mẫu dưới đây minh họa cách đưa cổ ngữ vào đoạn nghị luận một cách tự nhiên. Có thể thay đổi chủ đề và phần lập luận phía sau.</div>
        <div class="argument-quote">${escapeHtml(item.text)}</div>
        <div class="example-list">
          ${examples.map((example, index) => `
            <div class="example-card">
              <span class="example-no">${index + 1}</span>
              <p>${escapeHtml(example)}</p>
            </div>`).join('')}
        </div>
        <div class="pattern-card">
          <strong>Mẫu câu có thể tái sử dụng</strong>
          <p>正所谓“……”，……。<br>从现实角度看，“……”至今仍具有启发意义，它提醒我们：……。</p>
        </div>
      </div>`;
  }

  function toggleLearned(id = state.currentId) {
    if (state.learned.has(id)) state.learned.delete(id);
    else state.learned.add(id);
    saveState();
  }

  function randomCurrent() {
    const pool = visibleItems().length ? visibleItems() : DATA;
    if (!pool.length) return;
    const chosen = randomItemFrom(pool);
    state.currentId = chosen.id;
    state.category = chosen.category;
    state.openId = state.tab === 'list' ? chosen.id : null;
    resetPracticeQuestion();
    saveState();
    renderAll();
    if (state.tab === 'list') {
      setTimeout(() => document.querySelector(`.list-item[data-id="${chosen.id}"]`)?.scrollIntoView({behavior:'smooth', block:'center'}), 30);
    }
  }

  function openSidebar() { document.body.classList.add('sidebar-open'); }
  function closeSidebar() { document.body.classList.remove('sidebar-open'); }

  function bindStaticEvents() {
    $$('.tab').forEach(tab => tab.addEventListener('click', () => {
      state.tab = tab.dataset.tab;
      if (state.tab === 'practice') resetPracticeQuestion();
      saveState();
      renderTabs();
    }));

    $('#randomBtn').addEventListener('click', randomCurrent);
    $('#markLearnedBtn').addEventListener('click', () => {
      toggleLearned();
      renderProgress();
      renderHero();
      renderTabs();
      toast(state.learned.has(state.currentId) ? 'Đã đánh dấu là thuộc.' : 'Đã bỏ đánh dấu.');
    });
    $('#favoriteBtn').addEventListener('click', () => {
      const id = state.currentId;
      if (state.favorites.has(id)) state.favorites.delete(id); else state.favorites.add(id);
      saveState();
      renderHero();
    });
    $('#speakBtn').addEventListener('click', () => currentItem() && speakText(currentItem().text));

    $('#reviewMistakesBtn').addEventListener('click', () => {
      if (!state.mistakes.size) { toast('Chưa có câu sai để ôn.'); return; }
      state.reviewMistakes = true;
      state.search = '';
      $('#searchInput').value = '';
      state.tab = 'list';
      state.currentId = DATA.find(item => state.mistakes.has(item.id))?.id || state.currentId;
      state.openId = state.currentId;
      closeSidebar();
      renderAll();
    });

    $('#searchInput').addEventListener('input', event => {
      state.search = event.target.value;
      state.reviewMistakes = false;
      state.tab = 'list';
      const results = searchItems();
      if (results.length) {
        state.currentId = results[0].id;
        state.category = results[0].category;
      }
      state.openId = null;
      renderAll();
    });

    $('#menuBtn').addEventListener('click', openSidebar);
    $('#sidebarBackdrop').addEventListener('click', closeSidebar);
    window.addEventListener('resize', () => { if (window.innerWidth > 780) closeSidebar(); });
  }

  function renderAll() {
    ensureCurrentVisible();
    renderCategories();
    renderProgress();
    renderTopbar();
    renderHero();
    renderTabs();
  }

  if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  bindStaticEvents();
  renderAll();
})();
