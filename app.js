const TOPICS = [
  '认识与思维','学习与求知','行动与积累','坚持与逆境','辩证与变化',
  '心态与自省','人际与合作','规则、诚信与责任','时间、选择与目标','情谊、胸怀与生态价值'
];

const DATA = [
 {id:1,q:'不识庐山真面目，只缘身在此山中',p:'bù shí lú shān zhēn miàn mù，zhǐ yuán shēn zài cǐ shān zhōng',v:'【缘】因为；由于。',s:'苏轼《题西林壁》',c:'身处其中容易受到局限，看问题时需要跳出自己的立场。',vn:'Khi ở quá gần hoặc ở ngay bên trong một vấn đề, con người dễ bị góc nhìn cá nhân giới hạn.',k:['局限','角度','客观','认知'],t:['认识问题','换位思考','批判性思维','自我反思'],w:'看待一个问题时，我们不能只站在自己的角度。正所谓“不识庐山真面目，只缘身在此山中”，适当地跳出自己的立场，往往能够获得更加全面的认识。'},
 {id:2,q:'当局者迷，旁观者清',p:'dāng jú zhě mí，páng guān zhě qīng',v:'【当局者】直接参与事情的人；【旁观者】在一旁观看的人。',s:'《旧唐书·元行冲传》',c:'直接参与者易受利益与情绪干扰，客观第三方往往看得更透彻。',vn:'Người trong cuộc dễ bị cảm xúc và lợi ích chi phối; người ngoài cuộc thường nhìn vấn đề khách quan hơn.',k:['立场','客观','情绪'],t:['判断','沟通','决策'],w:'面对复杂矛盾时，当事人往往容易被情绪影响。所谓“当局者迷，旁观者清”，适当听取第三方意见，有助于我们作出更理性的判断。'},
 {id:3,q:'井底之蛙',p:'jǐng dǐ zhī wā',v:'【井底之蛙】比喻见识短浅、眼界狭小的人。',s:'《庄子·秋水》',c:'眼界狭隘会限制个人的认知格局与判断力。',vn:'Tầm nhìn hạn hẹp sẽ giới hạn nhận thức và năng lực phán đoán của một người.',k:['眼界','局限','见识'],t:['学习','成长','国际视野'],w:'一个人的经验毕竟有限，如果拒绝接触新的知识和观点，就很容易成为“井底之蛙”，因此我们应该主动扩大自己的视野。'},
 {id:4,q:'一叶障目，不见泰山',p:'yī yè zhàng mù，bù jiàn tài shān',v:'【障】遮挡；阻隔。',s:'《鹖冠子·天则》',c:'切忌被局部和微小的表象遮蔽，而忽略了全局与本质。',vn:'Đừng để một chi tiết hoặc hiện tượng bề mặt che khuất toàn cảnh và bản chất của vấn đề.',k:['局部','整体','本质'],t:['媒体','判断','批判性思维'],w:'评价一件事情时，如果只抓住某个细节就下结论，就可能“一叶障目，不见泰山”。只有结合整体背景，判断才会更加可靠。'},
 {id:5,q:'尺有所短，寸有所长',p:'chǐ yǒu suǒ duǎn，cùn yǒu suǒ cháng',v:'【尺/寸】比喻各有局限与优势。',s:'《楚辞·卜居》',c:'人与事物各有所长各有所短，应客观看待、扬长避短。',vn:'Mỗi người và mỗi sự vật đều có điểm mạnh, điểm yếu; cần nhìn nhận khách quan và phát huy ưu thế.',k:['优势','不足','客观'],t:['教育','合作','人才'],w:'“尺有所短，寸有所长”，评价人才不能只用单一标准，而应看到不同个体在能力与潜力上的差异。'},
 {id:6,q:'兼听则明，偏信则暗',p:'jiān tīng zé míng，piān xìn zé àn',v:'【兼】多方面；【明】明晰；【暗】蒙蔽。',s:'《资治通鉴》',c:'多方听取意见才能明辨是非，单凭偏听容易陷入主观蒙蔽。',vn:'Nghe nhiều phía giúp nhìn rõ sự việc; chỉ tin một phía dễ dẫn đến thiên lệch.',k:['信息','观点','判断'],t:['网络信息','管理','沟通'],w:'在信息爆炸的时代，“兼听则明，偏信则暗”更值得重视。面对网络观点，我们应主动核实来源，并比较不同立场。'},
 {id:7,q:'知人者智，自知者明',p:'zhī rén zhě zhì，zì zhī zhě míng',v:'【智】智慧；【明】明达、清醒。',s:'《老子》第三十三章',c:'了解他人是智慧，能清醒认识并剖析自我则更为可贵。',vn:'Hiểu người là trí tuệ; hiểu rõ chính mình còn đáng quý hơn.',k:['自知','反思','成长'],t:['职业选择','自我认识','成长'],w:'“知人者智，自知者明”。在选择专业和职业时，真正重要的不只是了解外部机会，也要清楚自己的兴趣与能力。'},
 {id:8,q:'横看成岭侧成峰，远近高低各不同',p:'héng kàn chéng lǐng cè chéng fēng，yuǎn jìn gāo dī gè bù tóng',v:'【岭】连绵的山；【峰】高耸的山尖。',s:'苏轼《题西林壁》',c:'观察角度与立场不同，对同一事物的认识与结论亦不相同。',vn:'Góc nhìn khác nhau có thể dẫn đến những nhận thức và kết luận khác nhau về cùng một sự việc.',k:['角度','差异','立场'],t:['文化差异','沟通','争议'],w:'同一项政策或技术，不同群体往往有不同评价。正如“横看成岭侧成峰，远近高低各不同”，理解差异需要先理解彼此所处的角度。'},
 {id:9,q:'金玉其外，败絮其中',p:'jīn yù qí wài，bài xù qí zhōng',v:'【败絮】破旧稀烂的棉絮。',s:'刘基《卖柑者言》',c:'外表光鲜不代表内在充实，认识事物须透过表象看本质。',vn:'Bề ngoài đẹp đẽ không đồng nghĩa với bên trong có giá trị; cần nhìn xuyên qua hiện tượng để thấy bản chất.',k:['表象','本质','判断'],t:['消费','社交媒体','人才评价'],w:'在消费社会中，精美包装很容易影响判断。但“金玉其外，败絮其中”的现象并不少见，因此理性选择应建立在真实价值之上。'},
 {id:10,q:'以人为镜，可以明得失',p:'yǐ rén wéi jìng，kě yǐ míng dé shī',v:'【明】看清；【得失】成功与过失。',s:'《旧唐书·魏徵传》',c:'以他人的成败经验作为参照，能够反观并修正自己的言行。',vn:'Có thể dùng kinh nghiệm thành bại của người khác như một tấm gương để tự điều chỉnh bản thân.',k:['经验','反思','借鉴'],t:['学习','管理','成长'],w:'个人成长不必事事从零开始。“以人为镜，可以明得失”，善于总结他人的经验与教训，往往能减少不必要的试错。'},
 {id:11,q:'尽信书，则不如无书',p:'jìn xìn shū，zé bù rú wú shū',v:'【尽】完全、盲目地。',s:'《孟子·尽心下》',c:'反对教条与盲从，主张独立思考与批判性思维。',vn:'Không nên tin sách vở một cách tuyệt đối; học tập cần đi kèm tư duy độc lập và phản biện.',k:['批判','独立思考','求证'],t:['教育','网络信息','学术'],w:'知识固然重要，但“尽信书，则不如无书”。真正的学习不是机械接受结论，而是在理解、求证与实践中形成自己的判断。'},
 {id:12,q:'见一叶落而知岁之将暮',p:'jiàn yī yè luò ér zhī suì zhī jiāng mù',v:'【岁】一年；【暮】将尽。',s:'《淮南子·说山训》',c:'见微知著；善于从微小征兆中推断整体的发展趋势。',vn:'Từ một dấu hiệu nhỏ có thể suy ra xu hướng phát triển lớn hơn của sự việc.',k:['趋势','征兆','观察'],t:['经济','环境','科技变化'],w:'社会变化往往先从细节中显现。所谓“见一叶落而知岁之将暮”，善于观察微小信号，有助于我们更早理解未来趋势。'}
];

const state = {
  mode:'learn',
  topic:0,
  hidePinyin:false,
  progress: JSON.parse(localStorage.getItem('kathy_hsk_progress') || '{}'),
  quizIndex:0,
  quizScore:0,
  quizAnswered:false,
  quizSet:[],
  writingChoice:null
};

const $ = (s)=>document.querySelector(s);
const $$ = (s)=>[...document.querySelectorAll(s)];

function saveProgress(){ localStorage.setItem('kathy_hsk_progress', JSON.stringify(state.progress)); updateProgress(); }
function getP(id){ return state.progress[id] || {status:'new',fav:false}; }
function setP(id,patch){ state.progress[id] = {...getP(id),...patch}; saveProgress(); }
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),1500); }

function renderTopics(){
  $('#topicList').innerHTML = TOPICS.map((t,i)=>`<button class="topic-btn ${i===state.topic?'active':''} ${i>0?'locked':''}" data-topic="${i}"><span class="topic-num">${String(i+1).padStart(2,'0')}</span><span>${t}</span></button>`).join('');
  $$('.topic-btn').forEach(btn=>btn.onclick=()=>{
    const i=+btn.dataset.topic;
    if(i>0){toast('演示版暂开放“认识与思维”主题');return;}
    state.topic=i; renderTopics(); renderLearn(); closeSidebar();
  });
}

function updateProgress(){
  const learned = DATA.filter(x=>getP(x.id).status==='done').length;
  $('#sidebarCount').textContent=`${learned} / ${DATA.length}`;
  $('#sidebarProgress').style.width=`${learned/DATA.length*100}%`;
}

function speak(text){
  if(!('speechSynthesis' in window)){toast('当前浏览器暂不支持朗读');return;}
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);u.lang='zh-CN';u.rate=.82;u.pitch=1;
  const voices=speechSynthesis.getVoices(); const zh=voices.find(v=>/zh|Chinese/i.test(v.lang+' '+v.name)); if(zh)u.voice=zh;
  speechSynthesis.speak(u);
}

function renderLearn(){
  $('#pageTitle').textContent='一、认识与思维';
  const learned=DATA.filter(x=>getP(x.id).status==='done').length;
  const hard=DATA.filter(x=>getP(x.id).status==='hard').length;
  const fav=DATA.filter(x=>getP(x.id).fav).length;
  $('#learnView').innerHTML=`
    <div class="hero">
      <div class="hero-card"><div class="hero-kicker">HSK 7–9 · 古语写作训练</div><h2>不是“背古语”，而是学会把古语变成论据。</h2><p>先回忆，再翻卡；先理解，再写作。点击卡片查看拼音、出处、核心含义与 HSK 写作示范。</p></div>
      <div class="stats-card"><div class="stat"><strong>${learned}</strong><span>我会了</span></div><div class="stat"><strong>${hard}</strong><span>还不熟</span></div><div class="stat"><strong>${fav}</strong><span>已收藏</span></div><div class="stat"><strong>${DATA.length}</strong><span>本主题古语</span></div></div>
    </div>
    <div class="toolbar"><h3>认识与思维 · ${DATA.length} 句</h3><input id="searchInput" class="search" placeholder="搜索古语、关键词、出处…" /></div>
    <div id="cardGrid" class="card-grid"></div>`;
  renderCards(DATA);
  $('#searchInput').oninput=(e)=>{ const q=e.target.value.trim(); renderCards(DATA.filter(x=>[x.q,x.s,x.c,...x.k,...x.t].join(' ').includes(q))); };
}

function renderCards(items, selector='#cardGrid'){
  const grid=$(selector); if(!grid)return;
  grid.innerHTML=items.map(x=>{
    const p=getP(x.id);
    return `<article class="study-card" data-id="${x.id}"><div class="card-inner">
      <div class="card-face front">
        <div class="card-no">${String(x.id).padStart(2,'0')}｜认识与思维</div>
        <div class="quote">${x.q}</div>
        <div class="listen-row"><button class="listen-btn" data-speak="${x.id}">🔊 听原句</button><span class="flip-hint">点击卡片翻面</span></div>
      </div>
      <div class="card-face back">
        <div class="card-no">${String(x.id).padStart(2,'0')}｜详情</div>
        <div class="quote">${x.q}</div>
        <div class="pinyin">${x.p}</div>
        <div class="meta-line"><b>出处：</b>${x.s}</div>
        <div class="meta-line"><b>核心：</b>${x.c}</div>
        <div class="tag-row">${x.k.map(k=>`<span class="tag">${k}</span>`).join('')}</div>
        <div class="card-actions">
          <button class="action-btn done ${p.status==='done'?'active':''}" data-action="done" data-id="${x.id}">✓ 我会了</button>
          <button class="action-btn hard ${p.status==='hard'?'active':''}" data-action="hard" data-id="${x.id}">↻ 还不熟</button>
          <button class="action-btn fav ${p.fav?'active':''}" data-action="fav" data-id="${x.id}">☆ 收藏</button>
        </div>
      </div></div></article>`;
  }).join('') || '<div class="empty">没有找到相关内容。</div>';

  $$('.study-card').forEach(card=>card.onclick=(e)=>{ if(e.target.closest('button'))return; card.classList.toggle('flipped'); });
  $$('[data-speak]').forEach(btn=>btn.onclick=(e)=>{ e.stopPropagation(); const x=DATA.find(d=>d.id===+btn.dataset.speak); speak(x.q); });
  $$('[data-action]').forEach(btn=>btn.onclick=(e)=>{
    e.stopPropagation(); const id=+btn.dataset.id; const a=btn.dataset.action;
    if(a==='done'){setP(id,{status:'done'});toast('已标记：我会了');}
    if(a==='hard'){setP(id,{status:'hard'});toast('已加入今日复习');}
    if(a==='fav'){setP(id,{fav:!getP(id).fav});toast(getP(id).fav?'已收藏':'已取消收藏');}
    renderLearn();
  });
  document.body.classList.toggle('hidden-pinyin',state.hidePinyin);
}

function buildQuiz(){
  const shuffled=[...DATA].sort(()=>Math.random()-.5).slice(0,5);
  state.quizSet=shuffled.map(x=>{
    const options=[x,...DATA.filter(d=>d.id!==x.id).sort(()=>Math.random()-.5).slice(0,3)].sort(()=>Math.random()-.5);
    return {x,options,type:Math.random()>.5?'meaning':'source'};
  });
  state.quizIndex=0;state.quizScore=0;state.quizAnswered=false;
}
function renderQuiz(){
  $('#pageTitle').textContent='考我模式'; if(!state.quizSet.length)buildQuiz();
  const q=state.quizSet[state.quizIndex];
  if(!q){
    $('#quizView').innerHTML=`<div class="quiz-wrap section-card"><div class="empty"><h2>完成！${state.quizScore} / 5</h2><p>错题可以回到“今日复习”继续练习。</p><button class="primary-btn" id="restartQuiz">再来 5 题</button></div></div>`;
    $('#restartQuiz').onclick=()=>{buildQuiz();renderQuiz();}; return;
  }
  const prompt=q.type==='meaning'?`“${q.x.q}”最符合下面哪一个含义？`:`“${q.x.q}”来自哪里？`;
  $('#quizView').innerHTML=`<div class="quiz-wrap section-card"><div class="quiz-head"><b>随机训练</b><span class="quiz-progress">${state.quizIndex+1} / 5</span></div><div class="question">${prompt}</div><div class="option-list">${q.options.map((o,i)=>`<button class="option" data-id="${o.id}"><b>${'ABCD'[i]}.</b> ${q.type==='meaning'?o.c:o.s}</button>`).join('')}</div><div id="explain"></div><div class="quiz-footer"><button class="primary-btn" id="nextQ" style="display:none">下一题 →</button></div></div>`;
  $$('.option').forEach(btn=>btn.onclick=()=>{
    if(state.quizAnswered)return;state.quizAnswered=true;
    const ok=+btn.dataset.id===q.x.id; if(ok)state.quizScore++; else setP(q.x.id,{status:'hard'});
    $$('.option').forEach(b=>{ if(+b.dataset.id===q.x.id)b.classList.add('correct'); }); if(!ok)btn.classList.add('wrong');
    $('#explain').innerHTML=`<div class="explain"><b>${ok?'回答正确':'再想一想'}</b><br>${q.x.q}：${q.x.c}</div>`; $('#nextQ').style.display='inline-block';
  });
  $('#nextQ').onclick=()=>{state.quizIndex++;state.quizAnswered=false;renderQuiz();};
}

const WRITING_PROMPTS=[
 {title:'科技与生活',text:'科技的发展给人的生活带来了便利，但也带来了新的问题。谈谈你的看法。',choices:[11,6,4,7]},
 {title:'学习与成长',text:'有人认为学习最重要的是掌握知识，也有人认为独立思考更加重要。谈谈你的看法。',choices:[11,10,7,3]},
 {title:'信息与判断',text:'面对网络上的大量信息，我们应该怎样形成自己的判断？',choices:[6,4,1,11]}
];
let writingPrompt=0;
function renderWrite(){
  $('#pageTitle').textContent='写作模式'; const p=WRITING_PROMPTS[writingPrompt];
  $('#writeView').innerHTML=`<div class="section-card"><div class="section-title"><div><h2>古语不是装饰，而是论证工具</h2><p>先自己选择，再查看参考表达。</p></div></div>
  <div class="mode-tabs">${WRITING_PROMPTS.map((x,i)=>`<button class="pill ${i===writingPrompt?'active':''}" data-wp="${i}">${x.title}</button>`).join('')}</div>
  <div class="prompt-box"><div class="label">作文题目</div><p>${p.text}</p></div>
  <div style="margin-top:20px;font-weight:700">第二步｜你会用哪一句？</div>
  <div class="quote-choice-grid">${p.choices.map(id=>{const x=DATA.find(d=>d.id===id);return `<button class="quote-choice ${state.writingChoice===id?'selected':''}" data-choice="${id}"><strong>${x.q}</strong><small>${x.c}</small></button>`}).join('')}</div>
  <div style="display:flex;justify-content:flex-end;margin-top:16px"><button class="primary-btn" id="showIdea" ${state.writingChoice?'':'disabled'}>查看参考思路</button></div>
  <div id="writingResult"></div></div>`;
  $$('[data-wp]').forEach(b=>b.onclick=()=>{writingPrompt=+b.dataset.wp;state.writingChoice=null;renderWrite();});
  $$('[data-choice]').forEach(b=>b.onclick=()=>{state.writingChoice=+b.dataset.choice;renderWrite();});
  const show=$('#showIdea'); if(show)show.onclick=()=>{const x=DATA.find(d=>d.id===state.writingChoice);$('#writingResult').innerHTML=`<div class="writing-result"><b>参考表达</b><p>${x.w}</p><div class="upgrade"><b>越南语提示：</b> ${x.vn}</div></div>`;};
}

function renderReview(){
  $('#pageTitle').textContent='今日复习';
  const hard=DATA.filter(x=>getP(x.id).status==='hard'), fav=DATA.filter(x=>getP(x.id).fav), done=DATA.filter(x=>getP(x.id).status==='done');
  $('#reviewView').innerHTML=`<div class="hero"><div class="hero-card"><div class="hero-kicker">TODAY REVIEW</div><h2>把“不熟”变成“会用”。</h2><p>演示版会把你标记为“还不熟”的古语自动集中到这里。</p></div><div class="stats-card"><div class="stat"><strong>${hard.length}</strong><span>今日待复习</span></div><div class="stat"><strong>${fav.length}</strong><span>我的收藏</span></div><div class="stat"><strong>${done.length}</strong><span>已掌握</span></div><div class="stat"><strong>${DATA.length-done.length}</strong><span>继续努力</span></div></div></div>
  <div class="section-card"><div class="section-title"><div><h2>还不熟</h2><p>建议先听，再回忆含义，最后查看写作用法。</p></div></div><div id="reviewCards" class="card-grid"></div></div>`;
  renderCards(hard.length?hard:DATA.slice(0,3), '#reviewCards');
}

function switchMode(mode){
  state.mode=mode; $$('.view').forEach(v=>v.classList.remove('active')); $$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.mode===mode));
  $('#'+mode+'View').classList.add('active');
  $('#hidePinyinBtn').style.display=mode==='learn'?'inline-block':'none';
  $('#randomBtn').style.display=mode==='learn'?'inline-block':'none';
  if(mode==='learn')renderLearn(); if(mode==='quiz')renderQuiz(); if(mode==='write')renderWrite(); if(mode==='review')renderReview(); closeSidebar();
}
function closeSidebar(){ $('#sidebar').classList.remove('open'); }

$$('.nav-item').forEach(b=>b.onclick=()=>switchMode(b.dataset.mode));
$('#hidePinyinBtn').onclick=()=>{state.hidePinyin=!state.hidePinyin;document.body.classList.toggle('hidden-pinyin',state.hidePinyin);$('#hidePinyinBtn').textContent=state.hidePinyin?'显示拼音':'隐藏拼音';};
$('#randomBtn').onclick=()=>{const x=DATA[Math.floor(Math.random()*DATA.length)];const card=document.querySelector(`[data-id="${x.id}"]`);if(card){card.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>card.classList.add('flipped'),400);}};
$('#menuBtn').onclick=()=>$('#sidebar').classList.toggle('open');

document.addEventListener('click',e=>{if(innerWidth<780 && !e.target.closest('#sidebar') && !e.target.closest('#menuBtn'))closeSidebar();});
renderTopics();updateProgress();renderLearn();
