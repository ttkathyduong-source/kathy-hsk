(() => {
  'use strict';

  const DATA = Array.isArray(window.GUYU_DATA) ? window.GUYU_DATA : [];
  const CATEGORIES = [...new Set(DATA.map(item => item.category))];
  const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
  const STORAGE_KEY = 'kathy-hsk79-guyu-v3';
  const OLD_STORAGE_KEY = 'kathy-hsk79-guyu-v2';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const stored = readStored();
  const normalizeIds = value => Array.isArray(value) ? value.map(Number).filter(Number.isFinite) : [];
  const state = {
    currentId: Number(stored.currentId) || 1,
    category: stored.category && CATEGORIES.includes(stored.category) ? stored.category : (CATEGORIES[0] || ''),
    tab: ['list','flashcard','practice'].includes(stored.tab) ? stored.tab : 'list',
    learned: new Set(normalizeIds(stored.learned)),
    review: new Set(normalizeIds(stored.review)),
    mistakes: new Set(normalizeIds(stored.mistakes)),
    mistakeCounts: stored.mistakeCounts && typeof stored.mistakeCounts === 'object' ? stored.mistakeCounts : {},
    retryStreak: stored.retryStreak && typeof stored.retryStreak === 'object' ? stored.retryStreak : {},
    favorites: new Set(normalizeIds(stored.favorites)),
    search: '',
    listFilter: 'all',
    openId: null,
    practice: {
      mode: 'choice',
      scope: 'category',
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
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (current) return current;
      const old = JSON.parse(localStorage.getItem(OLD_STORAGE_KEY) || '{}');
      return { ...old, review: [], mistakeCounts: Object.fromEntries((old.mistakes || []).map(id => [id, 1])), retryStreak: {} };
    } catch { return {}; }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentId: state.currentId,
        category: state.category,
        tab: state.tab,
        learned: [...state.learned],
        review: [...state.review],
        favorites: [...state.favorites],
        mistakes: [...state.mistakes],
        mistakeCounts: state.mistakeCounts,
        retryStreak: state.retryStreak
      }));
    } catch {}
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
      .replaceAll('"','&quot;').replaceAll("'",'&#039;');
  }

  function currentItem() { return DATA.find(item => item.id === state.currentId) || DATA[0]; }
  function categoryItems(category = state.category) { return DATA.filter(item => item.category === category); }

  function searchItems() {
    const q = state.search.trim().toLowerCase();
    if (!q) return [];
    return DATA.filter(item => [item.text,item.pinyin,item.gloss,item.source,item.core,item.category, ...(item.keywords || []), ...(item.examples || [])]
      .some(value => String(value || '').toLowerCase().includes(q)));
  }

  function baseList() { return state.search.trim() ? searchItems() : categoryItems(); }

  function filterItems(list, filter = state.listFilter) {
    if (filter === 'learned') return list.filter(item => state.learned.has(item.id));
    if (filter === 'review') return list.filter(item => state.review.has(item.id));
    if (filter === 'mistakes') return list.filter(item => state.mistakes.has(item.id));
    if (filter === 'unlearned') return list.filter(item => !state.learned.has(item.id) && !state.review.has(item.id));
    return list;
  }

  function visibleListItems() { return filterItems(baseList()); }

  function flashDeck() {
    if (state.listFilter === 'review') return DATA.filter(item => state.review.has(item.id));
    if (state.listFilter === 'mistakes') return DATA.filter(item => state.mistakes.has(item.id));
    const list = visibleListItems();
    return list.length ? list : categoryItems();
  }

  function practicePool() {
    if (state.practice.scope === 'mistakes') return DATA.filter(item => state.mistakes.has(item.id));
    if (state.practice.scope === 'review') return DATA.filter(item => state.review.has(item.id));
    return state.search.trim() ? searchItems() : categoryItems();
  }

  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
  }

  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    voices = window.speechSynthesis.getVoices() || [];
  }

  function pickChineseVoice() {
    if (!voices.length) loadVoices();
    const preferred = /ting|xiaoxiao|huihui|kangkang|mei-jia|mandarin|chinese|zhiyu/i;
    return voices.find(v => /^zh-CN$/i.test(v.lang) && preferred.test(v.name))
      || voices.find(v => /^zh-CN$/i.test(v.lang))
      || voices.find(v => /^zh(?:-|_)/i.test(v.lang))
      || null;
  }

  function speakText(text) {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      toast('Thiết bị này chưa hỗ trợ đọc văn bản.');
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();
    if (synth.paused) synth.resume();
    loadVoices();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'zh-CN';
    utter.rate = 0.8;
    utter.pitch = 1;
    const voice = pickChineseVoice();
    if (voice) utter.voice = voice;
    utter.onerror = () => toast('Không phát được giọng tiếng Trung trên thiết bị này.');
    setTimeout(() => synth.speak(utter), 60);
  }

  function renderCategories() {
    const nav = $('#categoryNav');
    nav.innerHTML = CATEGORIES.map((category,index) => {
      const active = !state.search && state.category === category && state.listFilter !== 'review' && state.listFilter !== 'mistakes';
      return `<button class="category-btn ${active ? 'active' : ''}" type="button" data-category="${escapeHtml(category)}">
        <span class="category-index">${ROMAN[index] || index + 1}</span>
        <span class="category-name">${escapeHtml(category)}</span>
        <span class="category-count">${categoryItems(category).length}</span>
      </button>`;
    }).join('');

    $$('.category-btn', nav).forEach(btn => btn.addEventListener('click', () => {
      state.category = btn.dataset.category;
      state.search = '';
      state.listFilter = 'all';
      $('#searchInput').value = '';
      const first = categoryItems(state.category)[0];
      if (first) state.currentId = first.id;
      state.openId = null;
      state.practice.scope = 'category';
      resetPracticeQuestion();
      saveState();
      closeSidebar();
      renderAll();
    }));
  }

  function syncPracticeCounters() {
    const review = state.review.size;
    const mistakes = state.mistakes.size;
    $$('[data-scope="review"]').forEach(btn => {
      btn.textContent = `Cần ôn (${review})`;
      btn.disabled = review === 0;
    });
    $$('[data-scope="mistakes"]').forEach(btn => {
      btn.textContent = `Câu sai (${mistakes})`;
      btn.disabled = mistakes === 0;
    });
  }

  function renderProgress() {
    const learned = state.learned.size;
    const review = state.review.size;
    const mistakes = state.mistakes.size;
    $('#learnedCount').textContent = `${learned} / ${DATA.length}`;
    $('#progressBar').style.width = `${DATA.length ? learned / DATA.length * 100 : 0}%`;
    $('#reviewNeedCount').textContent = review;
    $('#mistakeCount').textContent = mistakes;
    $('#overviewLearnedCount').textContent = learned;
    $('#overviewReviewCount').textContent = review;
    $('#overviewMistakeCount').textContent = mistakes;
    syncPracticeCounters();
  }

  function renderTopbar() {
    let title = state.category;
    let eyebrow = 'Chủ đề';
    let count = categoryItems().length;
    if (state.search.trim()) {
      title = 'Kết quả tìm kiếm'; eyebrow = 'Tìm kiếm'; count = searchItems().length;
    } else if (state.listFilter === 'review') {
      title = 'Cần ôn'; eyebrow = 'Ôn tập'; count = state.review.size;
    } else if (state.listFilter === 'mistakes') {
      title = 'Câu sai'; eyebrow = 'Làm lại'; count = state.mistakes.size;
    } else if (state.listFilter === 'learned') {
      title = 'Đã thuộc'; eyebrow = 'Tiến độ'; count = filterItems(DATA,'learned').length;
    }
    $('#sectionEyebrow').textContent = eyebrow;
    $('#categoryTitle').textContent = title;
    $('#categoryMeta').textContent = `${count} câu`;
  }

  function statusFor(id) {
    if (state.mistakes.has(id)) return {key:'mistake', label:`Sai ${state.mistakeCounts[id] || 1} lần`};
    if (state.review.has(id)) return {key:'review', label:'Cần ôn'};
    if (state.learned.has(id)) return {key:'learned', label:'Đã thuộc'};
    return {key:'unseen', label:'Chưa thuộc'};
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
  }

  function renderList(panel) {
    const list = visibleListItems();
    const title = state.search.trim() ? 'Kết quả tìm kiếm' : state.listFilter === 'all' ? state.category : ({unlearned:'Chưa thuộc',review:'Cần ôn',learned:'Đã thuộc',mistakes:'Câu sai'}[state.listFilter] || state.category);
    const base = baseList();
    const counts = {
      all: base.length,
      unlearned: filterItems(base,'unlearned').length,
      review: filterItems(base,'review').length,
      learned: filterItems(base,'learned').length,
      mistakes: filterItems(base,'mistakes').length
    };

    panel.innerHTML = `
      <div class="list-toolbar">
        <div><h3>${escapeHtml(title)}</h3><p>Bấm vào câu để mở giải thích. Dùng "Cần ôn" cho những câu bạn chưa chắc.</p></div>
      </div>
      <div class="filter-chips" aria-label="Bộ lọc trạng thái">
        <button class="filter-chip ${state.listFilter==='all'?'active':''}" data-filter="all" type="button">Tất cả ${counts.all}</button>
        <button class="filter-chip ${state.listFilter==='unlearned'?'active':''}" data-filter="unlearned" type="button">Chưa thuộc ${counts.unlearned}</button>
        <button class="filter-chip review ${state.listFilter==='review'?'active':''}" data-filter="review" type="button">Cần ôn ${counts.review}</button>
        <button class="filter-chip ${state.listFilter==='learned'?'active':''}" data-filter="learned" type="button">Đã thuộc ${counts.learned}</button>
        <button class="filter-chip mistake ${state.listFilter==='mistakes'?'active':''}" data-filter="mistakes" type="button">Câu sai ${counts.mistakes}</button>
      </div>
      ${list.length ? `<div class="list-stack">${list.map(item => listItemHtml(item)).join('')}</div>` : `<div class="empty-state">${state.listFilter==='review'?'Bạn chưa đánh dấu câu nào cần ôn.':state.listFilter==='mistakes'?'Chưa có câu sai. Làm bài tập để hệ thống tự ghi lại.':'Không có câu phù hợp với bộ lọc này.'}</div>`}`;

    $$('.filter-chip', panel).forEach(btn => btn.addEventListener('click', () => {
      state.listFilter = btn.dataset.filter;
      state.openId = null;
      const first = visibleListItems()[0];
      if (first) state.currentId = first.id;
      saveState();
      renderAll();
    }));

    $$('.list-item', panel).forEach(article => bindListItem(article, panel));
  }

  function listItemHtml(item) {
    const open = state.openId === item.id;
    const status = statusFor(item.id);
    const learned = state.learned.has(item.id);
    const review = state.review.has(item.id);
    return `<article class="list-item ${open?'open':''}" data-id="${item.id}">
      <button class="list-row" type="button" aria-expanded="${open?'true':'false'}">
        <span class="list-no">${String(item.id).padStart(2,'0')}</span>
        <span class="list-title">${escapeHtml(item.text)}</span>
        <span class="list-status"><span class="status-badge status-${status.key}">${escapeHtml(status.label)}</span><span class="chev">⌄</span></span>
      </button>
      <div class="list-detail">
        <div class="detail-grid">
          <div class="detail-block"><div class="detail-label">Pinyin</div><div class="detail-value">${escapeHtml(item.pinyin)}</div></div>
          <div class="detail-block"><div class="detail-label">Nguồn</div><div class="detail-value han">${escapeHtml(item.source)}</div></div>
          <div class="detail-block full"><div class="detail-label">Giải nghĩa từ</div><div class="detail-value han">${escapeHtml(item.gloss)}</div></div>
          <div class="detail-block full"><div class="detail-label">Ý chính</div><div class="detail-value core">${escapeHtml(item.core)}</div></div>
          <div class="detail-block full"><div class="detail-label">Từ khóa</div><div class="keyword-list">${(item.keywords || []).map(keyword => `<span class="keyword-chip">${escapeHtml(keyword)}</span>`).join('')}</div></div>
          <div class="detail-block full example-block"><div class="detail-label">Câu mẫu</div><div class="example-list">${(item.examples || []).map((example,index) => `<p><span class="example-no">${index+1}</span>${escapeHtml(example)}</p>`).join('')}</div></div>
        </div>
        <div class="detail-actions">
          <button class="btn btn-small listen-row" type="button">🔊 Nghe</button>
          <button class="btn btn-small ${review?'btn-review':''} review-row" type="button">${review?'● Đang cần ôn':'○ Cần ôn'}</button>
          <button class="btn btn-small ${learned?'btn-success-soft':''} learn-row" type="button">${learned?'✓ Đã thuộc':'✓ Đánh dấu đã thuộc'}</button>
        </div>
      </div>
    </article>`;
  }

  function bindListItem(article, panel) {
    const id = Number(article.dataset.id);
    $('.list-row', article).addEventListener('click', () => {
      state.currentId = id;
      state.openId = state.openId === id ? null : id;
      const item = currentItem();
      if (item) state.category = item.category;
      saveState();
      renderList(panel);
    });
    $('.listen-row', article).addEventListener('click', e => { e.stopPropagation(); const item=DATA.find(x=>x.id===id); if(item) speakText(item.text); });
    $('.review-row', article).addEventListener('click', e => { e.stopPropagation(); toggleReview(id); renderAll(); });
    $('.learn-row', article).addEventListener('click', e => { e.stopPropagation(); toggleLearned(id); renderAll(); });
  }

  function toggleReview(id) {
    if (state.review.has(id)) {
      state.review.delete(id);
      toast('Đã bỏ khỏi danh sách cần ôn.');
    } else {
      state.review.add(id);
      state.learned.delete(id);
      toast('Đã thêm vào danh sách cần ôn.');
    }
    saveState();
  }

  function toggleLearned(id) {
    if (state.learned.has(id)) {
      state.learned.delete(id);
      toast('Đã bỏ đánh dấu thuộc.');
    } else {
      state.learned.add(id);
      state.review.delete(id);
      toast('Đã đánh dấu là thuộc.');
    }
    saveState();
  }

  function ensureCurrentInDeck(deck) {
    if (!deck.length) return null;
    let item = deck.find(x => x.id === state.currentId);
    if (!item) { item = deck[0]; state.currentId = item.id; state.category = item.category; saveState(); }
    return item;
  }

  function moveCurrent(delta, deck) {
    if (!deck.length) return;
    let index = deck.findIndex(item => item.id === state.currentId);
    if (index < 0) index = 0;
    index = (index + delta + deck.length) % deck.length;
    state.currentId = deck[index].id;
    state.category = deck[index].category;
    saveState();
  }

  function renderFlashcard(panel) {
    const deck = flashDeck();
    const item = ensureCurrentInDeck(deck);
    if (!item) {
      panel.innerHTML = `<div class="empty-state">${state.listFilter==='review'?'Chưa có câu nào trong danh sách cần ôn.':'Không có flashcard để hiển thị.'}</div>`;
      return;
    }
    const index = deck.findIndex(x => x.id === item.id);
    const review = state.review.has(item.id);
    const learned = state.learned.has(item.id);
    panel.innerHTML = `<div class="flash-stage">
      <div class="flash-meta"><span>Chạm vào thẻ để lật</span><span>${index+1} / ${deck.length}</span></div>
      <div class="flashcard" id="flashcard" role="button" tabindex="0" aria-label="Lật flashcard">
        <div class="flashcard-inner">
          <div class="flash-face flash-front">
            <div class="flash-kicker">Nhớ nghĩa trước khi lật</div>
            <div class="flash-text">${escapeHtml(item.text)}</div>
            <div class="flash-hint">Chạm để xem pinyin, nghĩa, từ khóa và câu mẫu</div>
          </div>
          <div class="flash-face flash-back">
            <h3 class="flash-back-title">${escapeHtml(item.text)}</h3>
            <div class="back-pinyin">${escapeHtml(item.pinyin)}</div>
            <div class="back-grid">
              <div class="back-box"><strong>Giải nghĩa từ</strong><p>${escapeHtml(item.gloss)}</p></div>
              <div class="back-box"><strong>Nguồn</strong><p>${escapeHtml(item.source)}</p></div>
              <div class="back-box full"><strong>Ý chính</strong><p>${escapeHtml(item.core)}</p></div>
              <div class="back-box full"><strong>Từ khóa</strong><div class="keyword-list compact">${(item.keywords || []).map(keyword => `<span class="keyword-chip">${escapeHtml(keyword)}</span>`).join('')}</div></div>
              <div class="back-box full"><strong>Câu mẫu</strong><p class="flash-example">${escapeHtml((item.examples || [])[0] || '')}</p></div>
            </div>
          </div>
        </div>
      </div>
      <div class="flash-actions">
        <button class="btn ${review?'btn-review':''}" id="flashReview" type="button">${review?'● Đang cần ôn':'○ Chưa thuộc / Cần ôn'}</button>
        <button class="btn ${learned?'btn-success-soft':'btn-primary'}" id="flashLearn" type="button">${learned?'✓ Đã thuộc':'✓ Tôi đã thuộc'}</button>
      </div>
      <div class="flash-nav">
        <button class="btn" id="flashPrev" type="button">← Trước</button>
        <button class="btn" id="flashListen" type="button">🔊 Nghe</button>
        <button class="btn" id="flashNext" type="button">Sau →</button>
      </div>
    </div>`;

    const card = $('#flashcard');
    const flip = () => card.classList.toggle('flipped');
    card.addEventListener('click', flip);
    card.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); flip(); } });
    $('#flashReview').addEventListener('click', () => { toggleReview(item.id); renderAll(); });
    $('#flashLearn').addEventListener('click', () => { toggleLearned(item.id); renderAll(); });
    $('#flashListen').addEventListener('click', () => speakText(item.text));
    $('#flashPrev').addEventListener('click', () => { moveCurrent(-1,deck); renderAll(); });
    $('#flashNext').addEventListener('click', () => { moveCurrent(1,deck); renderAll(); });
  }

  function shuffled(array) {
    const a=[...array];
    for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
    return a;
  }

  function randomItemFrom(list) { return list[Math.floor(Math.random()*list.length)]; }

  function makeFill(item) {
    const segments=item.text.split(/[，；。？！、：]/).filter(Boolean).sort((a,b)=>b.length-a.length);
    const segment=segments[0]||item.text;
    const chars=Array.from(segment);
    const len=Math.min(chars.length,chars.length<=3?1:chars.length<=6?2:3);
    const start=Math.floor(Math.random()*(Math.max(0,chars.length-len)+1));
    const answer=chars.slice(start,start+len).join('');
    return {answer,prompt:item.text.replace(answer,'＿'.repeat(len))};
  }

  function resetPracticeQuestion(resetScore=false) {
    state.practice.itemId=null;
    state.practice.answered=false;
    state.practice.fillAnswer='';
    state.practice.fillPrompt='';
    if(resetScore){state.practice.score=0;state.practice.total=0;}
  }

  function ensurePracticeQuestion() {
    const pool=practicePool();
    if(!pool.length) return null;
    let item=DATA.find(x=>x.id===state.practice.itemId);
    if(!item||!pool.some(x=>x.id===item.id)){
      item=randomItemFrom(pool);
      state.practice.itemId=item.id;
      state.practice.answered=false;
      const fill=makeFill(item);
      state.practice.fillAnswer=fill.answer;
      state.practice.fillPrompt=fill.prompt;
    }
    return item;
  }

  function nextPracticeQuestion(panel) {
    const pool=practicePool();
    if(!pool.length){renderPractice(panel);return;}
    const other=pool.filter(x=>x.id!==state.practice.itemId);
    const next=randomItemFrom(other.length?other:pool);
    state.practice.itemId=next.id;
    state.practice.answered=false;
    const fill=makeFill(next);
    state.practice.fillAnswer=fill.answer;
    state.practice.fillPrompt=fill.prompt;
    renderPractice(panel);
  }

  function markPracticeResult(item,correct) {
    state.practice.total+=1;
    if(correct){
      state.practice.score+=1;
      if(state.mistakes.has(item.id) && state.practice.scope==='mistakes'){
        state.retryStreak[item.id]=(Number(state.retryStreak[item.id])||0)+1;
        if(state.retryStreak[item.id]>=2){
          state.mistakes.delete(item.id);
          delete state.retryStreak[item.id];
          delete state.mistakeCounts[item.id];
          toast('Đúng 2 lần liên tiếp: đã bỏ khỏi danh sách câu sai.');
        }
      }
    }else{
      state.mistakes.add(item.id);
      state.review.add(item.id);
      state.learned.delete(item.id);
      state.mistakeCounts[item.id]=(Number(state.mistakeCounts[item.id])||0)+1;
      state.retryStreak[item.id]=0;
    }
    saveState();
    renderProgress();
  }

  function renderPractice(panel) {
    const item=ensurePracticeQuestion();
    const mistakeN=state.mistakes.size;
    const reviewN=state.review.size;
    if(!item){
      panel.innerHTML=`<div class="practice-shell"><div class="practice-top"><div class="practice-switches">
        <button class="scope-btn ${state.practice.scope==='category'?'active':''}" data-scope="category" type="button">Chủ đề hiện tại</button>
        <button class="scope-btn ${state.practice.scope==='review'?'active':''}" data-scope="review" type="button" ${reviewN?'':'disabled'}>Cần ôn (${reviewN})</button>
        <button class="scope-btn mistakes ${state.practice.scope==='mistakes'?'active':''}" data-scope="mistakes" type="button" ${mistakeN?'':'disabled'}>Câu sai (${mistakeN})</button>
      </div></div><div class="empty-state">${state.practice.scope==='mistakes'?'Bạn đã làm lại hết các câu sai.':'Không có câu trong nhóm này.'}</div></div>`;
      bindScopeButtons(panel);
      return;
    }

    panel.innerHTML=`<div class="practice-shell">
      <div class="practice-top">
        <div class="practice-switches">
          <button class="scope-btn ${state.practice.scope==='category'?'active':''}" data-scope="category" type="button">Chủ đề hiện tại</button>
          <button class="scope-btn ${state.practice.scope==='review'?'active':''}" data-scope="review" type="button" ${reviewN?'':'disabled'}>Cần ôn (${reviewN})</button>
          <button class="scope-btn mistakes ${state.practice.scope==='mistakes'?'active':''}" data-scope="mistakes" type="button" ${mistakeN?'':'disabled'}>Câu sai (${mistakeN})</button>
        </div>
        <div class="practice-score">Đúng ${state.practice.score} / ${state.practice.total}</div>
      </div>
      <div class="practice-top">
        <div class="practice-switches">
          <button class="mode-btn ${state.practice.mode==='choice'?'active':''}" data-mode="choice" type="button">Chọn đáp án</button>
          <button class="mode-btn ${state.practice.mode==='fill'?'active':''}" data-mode="fill" type="button">Điền từ</button>
        </div>
      </div>
      ${state.practice.scope==='mistakes'?'<div class="practice-note">Một câu sai sẽ được gỡ khỏi danh sách sau khi bạn trả lời đúng <strong>2 lần liên tiếp</strong>.</div>':''}
      <div id="questionArea"></div>
    </div>`;

    bindScopeButtons(panel);
    $$('.mode-btn',panel).forEach(btn=>btn.addEventListener('click',()=>{
      state.practice.mode=btn.dataset.mode;
      state.practice.answered=false;
      if(state.practice.mode==='fill'){
        const fill=makeFill(item);state.practice.fillAnswer=fill.answer;state.practice.fillPrompt=fill.prompt;
      }
      renderPractice(panel);
    }));

    if(state.practice.mode==='choice') renderChoiceQuestion($('#questionArea',panel),item,panel);
    else renderFillQuestion($('#questionArea',panel),item,panel);
  }

  function bindScopeButtons(panel) {
    $$('.scope-btn',panel).forEach(btn=>btn.addEventListener('click',()=>{
      if(btn.disabled) return;
      state.practice.scope=btn.dataset.scope;
      resetPracticeQuestion(true);
      renderPractice(panel);
    }));
  }

  function renderChoiceQuestion(area,item,panel) {
    const distractors=shuffled(DATA.filter(x=>x.id!==item.id)).slice(0,3);
    const options=shuffled([item,...distractors]);
    area.innerHTML=`<div class="question-card">
      <div class="question-label">Chọn ý nghĩa phù hợp nhất</div>
      <h3 class="question-text">${escapeHtml(item.text)}</h3>
      <div class="option-list">${options.map((opt,i)=>`<button class="option-btn" type="button" data-id="${opt.id}"><strong>${String.fromCharCode(65+i)}.</strong> ${escapeHtml(opt.core)}</button>`).join('')}</div>
      <div class="feedback" id="practiceFeedback"></div>
      <div class="question-footer"><button class="btn btn-primary" id="nextQuestion" type="button" hidden>Câu tiếp theo →</button></div>
    </div>`;

    $$('.option-btn',area).forEach(btn=>btn.addEventListener('click',()=>{
      if(state.practice.answered) return;
      state.practice.answered=true;
      const chosenId=Number(btn.dataset.id);
      const correct=chosenId===item.id;
      markPracticeResult(item,correct);
      $$('.option-btn',area).forEach(option=>{
        option.disabled=true;
        const id=Number(option.dataset.id);
        if(id===item.id) option.classList.add('correct'); else if(id===chosenId) option.classList.add('wrong');
      });
      const feedback=$('#practiceFeedback',area);
      feedback.className=`feedback show ${correct?'good':'bad'}`;
      const retry=state.practice.scope==='mistakes'&&state.mistakes.has(item.id)?`<div class="retry-note">Tiến độ làm lại: ${Number(state.retryStreak[item.id])||0}/2 lần đúng liên tiếp.</div>`:'';
      feedback.innerHTML=correct
        ? `Chính xác. <span class="answer-han">${escapeHtml(item.source)}</span>${retry}`
        : `Chưa đúng. Ý chính: <span class="answer-han"><strong>${escapeHtml(item.core)}</strong></span><br><small>Hệ thống đã tự thêm câu này vào "Cần ôn" và "Câu sai".</small>`;
      $('#nextQuestion',area).hidden=false;
      renderProgress();
    }));
    $('#nextQuestion',area).addEventListener('click',()=>nextPracticeQuestion(panel));
  }

  function renderFillQuestion(area,item,panel) {
    area.innerHTML=`<div class="question-card">
      <div class="question-label">Điền phần còn thiếu</div>
      <div class="fill-prompt">${escapeHtml(state.practice.fillPrompt)}</div>
      <form class="fill-form" id="fillForm">
        <input class="fill-input" id="fillInput" type="text" autocomplete="off" placeholder="Nhập chữ Hán còn thiếu…" aria-label="Đáp án" />
        <button class="btn btn-primary" type="submit">Kiểm tra</button>
      </form>
      <div class="feedback" id="practiceFeedback"></div>
      <div class="question-footer"><button class="btn btn-primary" id="nextQuestion" type="button" hidden>Câu tiếp theo →</button></div>
    </div>`;

    $('#fillForm',area).addEventListener('submit',e=>{
      e.preventDefault();
      if(state.practice.answered) return;
      const value=$('#fillInput',area).value.trim().replace(/\s+/g,'');
      if(!value){toast('Hãy nhập đáp án trước.');return;}
      state.practice.answered=true;
      const correct=value===state.practice.fillAnswer;
      markPracticeResult(item,correct);
      $('#fillInput',area).disabled=true;
      const feedback=$('#practiceFeedback',area);
      feedback.className=`feedback show ${correct?'good':'bad'}`;
      const retry=state.practice.scope==='mistakes'&&state.mistakes.has(item.id)?`<div class="retry-note">Tiến độ làm lại: ${Number(state.retryStreak[item.id])||0}/2 lần đúng liên tiếp.</div>`:'';
      feedback.innerHTML=correct
        ? `Chính xác. Câu đầy đủ: <span class="answer-han"><strong>${escapeHtml(item.text)}</strong></span>${retry}`
        : `Đáp án: <span class="answer-han"><strong>${escapeHtml(state.practice.fillAnswer)}</strong></span><br>Câu đầy đủ: <span class="answer-han">${escapeHtml(item.text)}</span><br><small>Hệ thống đã tự thêm câu này vào "Cần ôn" và "Câu sai".</small>`;
      $('#nextQuestion',area).hidden=false;
      renderProgress();
    });
    $('#nextQuestion',area).addEventListener('click',()=>nextPracticeQuestion(panel));
    setTimeout(()=>$('#fillInput',area)?.focus(),0);
  }

  function setGlobalFilter(filter,tab='list') {
    state.search='';
    $('#searchInput').value='';
    state.listFilter=filter;
    state.tab=tab;
    const pool=filter==='review'?DATA.filter(x=>state.review.has(x.id)):filter==='mistakes'?DATA.filter(x=>state.mistakes.has(x.id)):filter==='learned'?DATA.filter(x=>state.learned.has(x.id)):DATA;
    if(pool.length){state.currentId=pool[0].id;state.category=pool[0].category;}
    state.openId=null;
    if(tab==='practice'){
      state.practice.scope=filter==='mistakes'?'mistakes':filter==='review'?'review':'category';
      resetPracticeQuestion(true);
    }
    saveState();
    closeSidebar();
    renderAll();
  }

  function randomCurrent() {
    const pool=visibleListItems().length?visibleListItems():categoryItems();
    if(!pool.length) return;
    const chosen=randomItemFrom(pool);
    state.currentId=chosen.id;
    state.category=chosen.category;
    state.openId=state.tab==='list'?chosen.id:null;
    resetPracticeQuestion();
    saveState();
    renderAll();
    if(state.tab==='list') setTimeout(()=>document.querySelector(`.list-item[data-id="${chosen.id}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}),40);
  }

  function openSidebar(){document.body.classList.add('sidebar-open');}
  function closeSidebar(){document.body.classList.remove('sidebar-open');}

  function bindStaticEvents() {
    $$('.tab').forEach(tab=>tab.addEventListener('click',()=>{
      state.tab=tab.dataset.tab;
      if(state.tab==='practice') resetPracticeQuestion();
      saveState();
      renderTabs();
    }));
    $('#randomBtn').addEventListener('click',randomCurrent);
    $('#reviewNeedBtn').addEventListener('click',()=>{
      if(!state.review.size){toast('Bạn chưa đánh dấu câu nào cần ôn.');return;}
      setGlobalFilter('review','flashcard');
    });
    $('#reviewMistakesBtn').addEventListener('click',()=>{
      if(!state.mistakes.size){toast('Chưa có câu sai để làm lại.');return;}
      setGlobalFilter('mistakes','practice');
    });
    $('#overviewLearned').addEventListener('click',()=>setGlobalFilter('learned','list'));
    $('#overviewReview').addEventListener('click',()=>{
      if(!state.review.size){toast('Bạn chưa đánh dấu câu nào cần ôn.');return;}
      setGlobalFilter('review','flashcard');
    });
    $('#overviewMistake').addEventListener('click',()=>{
      if(!state.mistakes.size){toast('Chưa có câu sai để làm lại.');return;}
      setGlobalFilter('mistakes','practice');
    });
    $('#searchInput').addEventListener('input',e=>{
      state.search=e.target.value;
      state.listFilter='all';
      state.tab='list';
      const results=searchItems();
      if(results.length){state.currentId=results[0].id;state.category=results[0].category;}
      state.openId=null;
      renderAll();
    });
    $('#menuBtn').addEventListener('click',openSidebar);
    $('#sidebarBackdrop').addEventListener('click',closeSidebar);
    window.addEventListener('resize',()=>{if(window.innerWidth>780) closeSidebar();});
  }

  function renderAll() {
    renderCategories();
    renderProgress();
    renderTopbar();
    renderTabs();
  }

  if('speechSynthesis' in window){
    loadVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged',loadVoices);
    window.speechSynthesis.onvoiceschanged=loadVoices;
  }

  bindStaticEvents();
  renderAll();
})();
