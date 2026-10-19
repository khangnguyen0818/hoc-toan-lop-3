'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app');
const BYID = BYID_RAW;
const LESSONS = [];
BOOK.forEach(t => t.topics.forEach(tp => tp.lessons.forEach(l => { l.tapNo = t.tap; LESSONS.push(l); })));
const REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- dọn dẹp khi chuyển màn ---------- */
let cleanups = [];
function cleanup() { cleanups.forEach(f => { try { f(); } catch (e) { } }); cleanups = []; try { speechSynthesis.cancel(); } catch (e) { } }
function later(fn, ms) { const id = setTimeout(fn, ms); cleanups.push(() => clearTimeout(id)); return id; }

/* ---------- tiến độ (lưu trên máy) ---------- */
const KEY = 'toanvui3-v1';
let PROG = {};
try { PROG = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { PROG = {}; }
function save() { try { localStorage.setItem(KEY, JSON.stringify(PROG)); } catch (e) { } }
let SOUND = true, curTap = 1;
try { SOUND = localStorage.getItem('toanvui3-snd') !== '0'; curTap = +(localStorage.getItem('toanvui3-tap') || 1); } catch (e) { }

/* ---------- âm thanh ---------- */
let actx = null;
function tone(f, d, type, t0, vol = 0.12) {
  const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + t0;
  o.type = type; o.frequency.value = f; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
  o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + d + 0.02);
}
function sfx(k) {
  if (!SOUND) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (k === 'ok') [523, 659, 784].forEach((f, i) => tone(f, .18, 'triangle', i * .08));
    else if (k === 'bad') { tone(220, .25, 'sawtooth', 0, .06); tone(180, .3, 'sawtooth', .12, .06); }
    else if (k === 'pop') tone(880, .08, 'square', 0, .05);
    else if (k === 'win') [523, 659, 784, 1046, 784, 1046].forEach((f, i) => tone(f, .22, 'triangle', i * .11));
    else if (k === 'flip') tone(600, .05, 'sine', 0, .06);
  } catch (e) { }
}
function speak(html) {
  try {
    const d = document.createElement('div'); d.innerHTML = html;
    d.querySelectorAll('.fr').forEach(f => f.replaceWith(' ' + f.children[0].textContent + ' phần ' + f.children[1].textContent + ' '));
    d.querySelectorAll('svg, .tens, .blocks, .objs, .rows, .groups, .fbar, .agrid').forEach(e => e.remove());
    let t = d.textContent.replace(/\s+/g, ' ')
      .replace(/(\d)\s*:\s*(\d)/g, '$1 chia $2').replace(/×/g, ' nhân ').replace(/−/g, ' trừ ').replace(/\+/g, ' cộng ')
      .replace(/=/g, ' bằng ').replace(/>/g, ' lớn hơn ').replace(/</g, ' bé hơn ').replace(/\?/g, ' mấy? ')
      .replace(/°C/g, ' độ C').replace(/°/g, ' độ').replace(/(\d)\s?ml\b/g, '$1 mi-li-lít').replace(/(\d)\s?mm\b/g, '$1 mi-li-mét').replace(/(\d)\s?g\b/g, '$1 gam').replace(/(\d+)\/(\d+)/g, '$1 phần $2').replace(/(\w)²/g, '$1 vuông').replace(/(\d)\s?kg\b/g, '$1 ki-lô-gam').replace(/(\d)\s?l\b/g, '$1 lít').replace(/(\d)\s?cm\b/g, '$1 xăng-ti-mét')
      .replace(/(\d)\s?dm\b/g, '$1 đề-xi-mét').replace(/(\d)\s?km\b/g, '$1 ki-lô-mét').replace(/(\d)\s?m\b/g, '$1 mét');
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t); u.lang = 'vi-VN'; u.rate = .9;
    const v = speechSynthesis.getVoices().find(v => /^vi/i.test(v.lang)); if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch (e) { }
}
function confetti(n = 50) {
  if (REDUCED) return;
  const box = document.createElement('div'); box.className = 'confetti'; box.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i');
    s.style.left = Math.random() * 100 + '%'; s.style.background = `var(--h${R(1, 7)})`;
    s.style.animationDelay = Math.random() * .4 + 's'; s.style.setProperty('--dx', R(-80, 80) + 'px'); s.style.setProperty('--rot', R(180, 720) + 'deg');
    box.appendChild(s);
  }
  document.body.appendChild(box); setTimeout(() => box.remove(), 2600);
}

/* ---------- tiện ích hiển thị ---------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fmt = c => /^[<>=]$/.test(c) ? esc(c) : /^\d+\/\d+$/.test(c) ? F(...c.split('/')) : c;
const showA = a => /^\d{4,}$/.test(a) ? fN(a) : fmt(a);
const norm = s => String(s).replace(/[\s  .]/g, '');
/* So đáp án; phân số bằng nhau được chấp nhận trừ khi câu hỏi yêu cầu đúng dạng (q.exact) */
const same = (v, q) => {
  const a = norm(v), b = norm(q.a), fr = /^(\d+)\/(\d+)$/;
  if (a === b) return true;
  const x = a.match(fr), y = b.match(fr);
  if (!q.exact && x && y && +x[2] && +y[2]) return +x[1] * +y[2] === +y[1] * +x[2];
  if (!q.exact && y && /^\d+$/.test(a) && +y[2]) return +a * +y[2] === +y[1];
  if (!q.exact && x && /^\d+$/.test(b) && +x[2]) return +b * +x[2] === +x[1];
  return false;
};
const starsHTML = (n, max = 3) => Array.from({ length: max }, (_, i) => `<span class="st${i < n ? ' on' : ''}">★</span>`).join('');
const lessonNo = l => `Bài ${l.so}`;
const isReview = l => !!(l.mix || l.mixTopics);
function totalStars() { return LESSONS.reduce((s, l) => s + ((PROG[l.id] && PROG[l.id].stars) || 0), 0); }
function updTop() { $('#totStars').textContent = totalStars(); $('#totMax').textContent = LESSONS.length * 3; }
const PRAISE = ['Giỏi quá!', 'Chính xác!', 'Tuyệt vời!', 'Đúng rồi!', 'Con làm rất tốt!'];
function prepQ(q) {
  if (!q.choices || q.input) {
    q = { ...q, choices: /^\d+\/\d+$/.test(q.a) ? fracChoices(...q.a.split('/').map(Number)) : numChoices(+q.a, 0) };
  }
  return q;
}
/* Rút câu hỏi đa dạng: không lặp câu, mỗi dạng tối đa `cap` lần */
function drawer(l, cap = 3) {
  const seen = new Set(), types = {};
  const sig = q => q.q.replace(/<[^>]+>/g, ' ').replace(/\d+/g, '#').replace(/\s+/g, ' ').slice(0, 34);
  return () => {
    let q;
    for (let k = 0; k < 160; k++) {
      q = l.gen(); const key = q.q + '|' + q.a, s = sig(q);
      if (seen.has(key) || (k < 80 && (types[s] || 0) >= cap)) continue;
      seen.add(key); types[s] = (types[s] || 0) + 1; return q;
    }
    return q;
  };
}
function rating(score) {
  if (score >= 9) return { stars: 3, t: 'Hoàn thành tốt', cls: 'good', msg: 'Con đã nắm rất vững bài học này.', loi: pick(['Con học giỏi lắm, cô khen!', 'Bài làm rất tốt, tiếp tục phát huy nhé!', 'Xuất sắc! Con là nhà toán học nhí đấy.']) };
  if (score >= 7) return { stars: 2, t: 'Hoàn thành', cls: 'ok', msg: 'Con hiểu bài. Xem lại câu sai để đạt điểm cao hơn nhé.', loi: pick(['Con làm khá tốt, cố thêm chút nữa nhé!', 'Bài làm tốt. Con cẩn thận hơn một chút là được điểm 10.']) };
  if (score >= 5) return { stars: 1, t: 'Hoàn thành', cls: 'mid', msg: 'Con cần luyện tập thêm. Hãy ôn lại phần Học bài rồi làm lại nhé.', loi: 'Con cần chú ý hơn. Cô tin lần sau con sẽ làm tốt hơn!' };
  return { stars: 0, t: 'Chưa hoàn thành', cls: 'low', msg: 'Không sao cả! Con hãy học lại bài, chơi trò chơi rồi kiểm tra lại nhé.', loi: 'Con hãy ôn lại bài cùng bạn Cú Bông nhé!' };
}
function levelName(pct) {
  if (pct >= .85) return 'Nhà toán học nhí 🏆';
  if (pct >= .6) return 'Học sinh giỏi toán 🥇';
  if (pct >= .35) return 'Bạn nhỏ chăm chỉ 📘';
  if (pct > 0) return 'Mầm non toán học 🌱';
  return 'Bắt đầu hành trình 🚀';
}

/* =================== TRANG CHỦ =================== */
function home() {
  cleanup(); window.scrollTo(0, 0); updTop();
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { }
  const next = LESSONS.find(l => !(PROG[l.id] && PROG[l.id].stars > 0)) || LESSONS[0];
  const done = LESSONS.filter(l => PROG[l.id] && PROG[l.id].best != null);
  const avg = done.length ? (done.reduce((s, l) => s + PROG[l.id].best, 0) / done.length) : null;
  const ts = totalStars(), max = LESSONS.length * 3;
  const tap = BOOK.find(b => b.tap === curTap) || BOOK[0];
  app.innerHTML = `
  <section class="hero">
    <div class="hero-owl">${owl('happy', 132)}</div>
    <div class="hero-txt">
      <p class="kicker">Toán 3 · Kết nối tri thức với cuộc sống</p>
      <h1>Chào con! Hôm nay mình học bài nào?</h1>
      <p>Mỗi bài có 3 bước: <b>Học bài</b>, <b>Trò chơi</b> và <b>Kiểm tra</b>. Đạt từ 9 điểm trở lên để nhận đủ 3 ngôi sao nhé!</p>
      <button class="btn primary big" data-go="${next.id}">Học tiếp: ${lessonNo(next)} →</button>
    </div>
    <div class="hero-stat" aria-label="Thành tích">
      <div class="hs-lv">${levelName(ts / max)}</div>
      <div class="hs-bar"><i style="width:${(ts / max * 100).toFixed(1)}%"></i></div>
      <dl>
        <div><dt>Ngôi sao</dt><dd>${ts}<small>/${max}</small></dd></div>
        <div><dt>Bài đã kiểm tra</dt><dd>${done.length}<small>/${LESSONS.length}</small></dd></div>
        <div><dt>Điểm trung bình</dt><dd>${avg == null ? '–' : avg.toFixed(1)}</dd></div>
      </dl>
    </div>
  </section>
  <div class="taps" role="tablist">${BOOK.map(b => `<button role="tab" aria-selected="${b.tap === tap.tap}" data-tap="${b.tap}">Toán 3 · ${b.name}</button>`).join('')}</div>
  ${tap.topics.map(topicHTML).join('')}
  <p class="foot">Nội dung bám theo cấu trúc SGK Toán 3, bộ sách Kết nối tri thức với cuộc sống. Tiến độ được lưu trên trình duyệt của máy này.</p>`;
  $$('[data-go]').forEach(b => b.onclick = () => lesson(b.dataset.go));
  $$('[data-tap]').forEach(b => b.onclick = () => { curTap = +b.dataset.tap; try { localStorage.setItem('toanvui3-tap', curTap); } catch (e) { } home(); });
}
function topicHTML(tp) {
  const earned = tp.lessons.reduce((s, l) => s + ((PROG[l.id] && PROG[l.id].stars) || 0), 0);
  return `<section class="topic" style="--tc:var(--h${tp.hue})">
    <header class="topic-h"><span class="topic-no">Chủ đề ${tp.no}</span><h2>${tp.name}</h2><span class="topic-p" title="Số sao đạt được">${earned}/${tp.lessons.length * 3} ★</span></header>
    <div class="lgrid">${tp.lessons.map(l => {
      const p = PROG[l.id] || {};
      return `<button class="lc${p.stars ? ' done' : ''}${isReview(l) ? ' rv' : ''}" data-go="${l.id}">
        <span class="lc-no">${lessonNo(l)}${isReview(l) ? ' · Ôn tập' : ''}</span>
        <span class="lc-t">${l.title}</span>
        <span class="lc-f"><span class="stars">${starsHTML(p.stars || 0)}</span><span class="lc-s">${p.best != null ? p.best + ' điểm' : 'Chưa kiểm tra'}</span></span>
      </button>`;
    }).join('')}</div></section>`;
}

/* =================== MÀN BÀI HỌC =================== */
const STEPS = [['learn', 'Học bài'], ['game', 'Trò chơi'], ['quiz', 'Kiểm tra']];
function lesson(id, step = 'learn') {
  cleanup(); window.scrollTo(0, 0);
  const l = BYID[id]; if (!l) return home();
  try { history.replaceState(null, '', '#' + id); } catch (e) { }
  app.innerHTML = `
  <div class="lhead" style="--tc:var(--h${l.topicRef.hue})">
    <button class="btn ghost back">← Mục lục</button>
    <div class="lh-t"><span class="kicker">Chủ đề ${l.topicRef.no}: ${l.topicRef.name}</span><h1><span class="lh-no">${lessonNo(l)}.</span> ${l.title}</h1></div>
  </div>
  <nav class="steps" aria-label="Các bước">${STEPS.map(([k, t], i) => `<button data-step="${k}"><span>${i + 1}</span>${t}</button>`).join('')}</nav>
  <section id="pane" class="pane" style="--tc:var(--h${l.topicRef.hue})"></section>`;
  $('.back').onclick = home;
  $$('[data-step]').forEach(b => b.onclick = () => showStep(l, b.dataset.step));
  showStep(l, step);
}
function showStep(l, step) {
  cleanup();
  $$('[data-step]').forEach(b => { b.classList.toggle('on', b.dataset.step === step); b.setAttribute('aria-current', b.dataset.step === step ? 'step' : 'false'); });
  const p = $('#pane');
  if (step === 'learn') learn(l, p); else if (step === 'game') game(l, p); else quizIntro(l, p);
}

/* ---------- Học bài ---------- */
function learn(l, p) {
  const cards = [...l.learn, { t: 'Thử ngay một câu', tryIt: true }];
  let i = 0;
  const bubble = k => k === 0 ? 'Cùng Cú Bông học bài nhé! Bấm “Nghe” để nghe đọc.' : k === cards.length - 1 ? 'Con thử làm một câu nào!' : pick(['Con đọc thật kĩ nhé!', 'Nhìn hình để hiểu bài nhé!', 'Sắp xong rồi, cố lên!']);
  function render() {
    const c = cards[i];
    p.innerHTML = `<div class="learn">
      <aside class="learn-owl">${owl(c.tryIt ? 'wow' : 'happy', 96)}<p class="bubble">${bubble(i)}</p></aside>
      <article class="sheet">
        <header class="sheet-h"><span class="sheet-k">${c.tryIt ? 'Luyện tập' : `Phần ${i + 1}/${cards.length - 1}`}</span><h2>${c.t}</h2>${c.tryIt ? '' : '<button class="btn small say">🔊 Nghe</button>'}</header>
        <div class="sheet-b">${c.tryIt ? '<div id="tryq"></div>' : c.h}</div>
        <footer class="sheet-f"><button class="btn ghost prev" ${i ? '' : 'disabled'}>← Trước</button><span class="dots" aria-hidden="true">${cards.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</span>${i < cards.length - 1 ? '<button class="btn primary next">Tiếp →</button>' : '<button class="btn primary togame">Chơi trò chơi →</button>'}</footer>
      </article></div>`;
    $('.prev', p).onclick = () => { if (i) { i--; render(); } };
    const nx = $('.next', p); if (nx) nx.onclick = () => { i++; render(); p.scrollIntoView({ block: 'start', behavior: REDUCED ? 'auto' : 'smooth' }); };
    const tg = $('.togame', p); if (tg) tg.onclick = () => showStep(l, 'game');
    const sy = $('.say', p); if (sy) sy.onclick = () => speak(`<p>${c.t}.</p>` + c.h);
    if (c.tryIt) {
      const host = $('#tryq', p);
      const one = () => renderQ(host, l.gen(), () => {
        const fb = $('.q-fb', host);
        fb.insertAdjacentHTML('beforeend', '<div class="fb-act"><button class="btn ghost again">Câu khác</button></div>');
        $('.again', fb).onclick = one;
      });
      one();
    }
  }
  render();
}

/* ---------- Khung câu hỏi dùng chung ---------- */
function renderQ(el, q, onDone) {
  el.innerHTML = `<div class="q"><div class="q-text">${q.q}</div><div class="q-tools"><button class="btn small say" aria-label="Đọc câu hỏi">🔊 Đọc câu hỏi</button></div><div class="q-ans"></div><div class="q-fb" hidden></div></div>`;
  $('.say', el).onclick = () => speak(q.q);
  const ans = $('.q-ans', el), fb = $('.q-fb', el);
  let done = false;
  const finish = (val) => {
    if (done) return; done = true;
    const ok = same(val, q);
    sfx(ok ? 'ok' : 'bad');
    fb.hidden = false; fb.className = 'q-fb ' + (ok ? 'ok' : 'bad');
    fb.innerHTML = `<div class="fb-row">${owl(ok ? 'happy' : 'sad', 54)}<div><p class="fb-t">${ok ? pick(PRAISE) : `Chưa đúng rồi. Đáp án đúng là <b>${showA(q.a)}</b>.`}</p>${q.ex ? `<div class="fb-ex">${q.ex}</div>` : ''}</div></div>`;
    onDone(val, ok);
  };
  if (q.input || !q.choices) {
    let val = '';
    ans.innerHTML = `<div class="kp"><div class="kp-disp" aria-live="polite"><span class="kp-l">Đáp số:</span><span class="kp-val"></span></div><div class="kp-grid">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => `<button data-k="${d}">${d}</button>`).join('')}<button data-k="del" aria-label="Xoá">⌫</button><button data-k="0">0</button>${q.frac ? '<button data-k="/" aria-label="Gạch phân số">/</button><button data-k="ok" class="ok wide">✓ Kiểm tra</button>' : '<button data-k="ok" class="ok" aria-label="Kiểm tra">✓</button>'}</div></div>`;
    const disp = $('.kp-val', ans);
    const upd = () => { disp.textContent = val ? (val.includes('/') ? val : fN(val)) : '…'; disp.classList.toggle('empty', !val); };
    const press = k => {
      if (done) return;
      if (k === 'del') val = val.slice(0, -1);
      else if (k === 'ok') { if (!val) return; const ok = same(val, q); $('.kp-disp', ans).classList.add(ok ? 'ok' : 'bad'); $$('button', ans).forEach(b => b.disabled = true); finish(val); return; }
      else if (val.length < 11) { if (k === '/' && (!q.frac || !val || val.includes('/'))) return; val = (val === '0' && k !== '/' ? '' : val) + k; }
      sfx('pop'); upd();
    };
    $$('[data-k]', ans).forEach(b => b.onclick = () => press(b.dataset.k));
    const kh = e => { if (!document.body.contains(ans)) return; if (/^[\d\/]$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('del'); else if (e.key === 'Enter') { e.preventDefault(); press('ok'); } };
    document.addEventListener('keydown', kh); cleanups.push(() => document.removeEventListener('keydown', kh));
    upd();
  } else {
    const long = q.choices.some(c => String(c).replace(/<[^>]+>/g, '').length > 14);
    ans.innerHTML = `<div class="choices${long ? ' long' : ''}">${q.choices.map((c, i) => `<button class="ch" data-i="${i}"><span class="ch-k">${'ABCD'[i]}</span><span class="ch-v">${fmt(c)}</span></button>`).join('')}</div>`;
    $$('.ch', ans).forEach(b => b.onclick = () => {
      if (done) return;
      const c = q.choices[+b.dataset.i]; const ok = same(c, q);
      b.classList.add(ok ? 'ok' : 'bad');
      if (!ok) $$('.ch', ans).forEach(x => { if (same(q.choices[+x.dataset.i], q)) x.classList.add('ok'); });
      $$('.ch', ans).forEach(x => x.disabled = true);
      finish(c);
    });
  }
}

/* =================== TRÒ CHƠI =================== */
const GAMES = {
  balloon: { n: 'Bắn bóng bay', d: 'Chạm vào quả bóng mang đáp án đúng trước khi hết giờ!', icon: '🎈' },
  fish: { n: 'Câu cá vui vẻ', d: 'Chạm vào chú cá mang đáp án đúng để câu cá lên thuyền.', icon: '🎣' },
  race: { n: 'Đua xe về đích', d: 'Trả lời đúng để xe của con chạy về đích trước bạn Cáo. Trả lời sai thì Cáo được chạy thêm!', icon: '🏁' },
  memory: { n: 'Lật thẻ tìm cặp', d: 'Lật hai thẻ: một phép tính và kết quả của nó. Tìm hết các cặp nhé!', icon: '🃏' },
  sort: { n: 'Xếp số theo thứ tự', d: 'Chạm vào các số theo đúng thứ tự mà đề bài yêu cầu.', icon: '🔢' }
};
function game(l, p) {
  const g = GAMES[l.game];
  p.innerHTML = `<div class="game"><div class="game-start">${owl('wow', 100)}<div><p class="kicker">Trò chơi ${g.icon}</p><h2>${g.n}</h2><p>${g.d}</p><button class="btn primary big go">Bắt đầu chơi</button></div></div></div>`;
  $('.go', p).onclick = () => {
    const host = $('.game', p); host.innerHTML = '<div id="g"></div>';
    const gEl = $('#g', host);
    const end = (score, total, note) => gameEnd(l, gEl, score, total, note);
    if (l.game === 'race') raceGame(l, gEl, end);
    else if (l.game === 'memory') memoryGame(l, gEl, end);
    else if (l.game === 'sort') sortGame(l, gEl, end);
    else floatGame(l, gEl, l.game, end);
  };
}
function gameEnd(l, g, score, total, note) {
  cleanup();
  const r = score / total, stars = r >= .85 ? 3 : r >= .6 ? 2 : r > 0 ? 1 : 0;
  PROG[l.id] = PROG[l.id] || {}; PROG[l.id].game = Math.max(PROG[l.id].game || 0, stars); save();
  if (stars >= 2) { sfx('win'); confetti(); }
  g.innerHTML = `<div class="gend">${owl(stars >= 2 ? 'happy' : 'wow', 110)}<div><h2>${stars === 3 ? 'Siêu quá!' : stars === 2 ? 'Giỏi lắm!' : 'Cố lên nào!'}</h2><p class="bigstars">${starsHTML(stars)}</p><p>${note || `Con được <b>${score}/${total}</b> điểm trò chơi.`}</p><div class="btns"><button class="btn ghost again">↻ Chơi lại</button><button class="btn primary toquiz">Làm bài kiểm tra →</button></div></div></div>`;
  $('.again', g).onclick = () => showStep(l, 'game');
  $('.toquiz', g).onclick = () => showStep(l, 'quiz');
}
function hud(N) { return `<div class="ghud"><span>Câu <b class="g-r">1</b>/${N}</span><span class="g-timer"><i></i></span><span class="g-sc">⭐ <b>0</b></span></div>`; }

/* Bóng bay & câu cá */
function floatGame(l, g, skin, onEnd) {
  const N = 8, T = 40, draw = drawer(l, 2); let round = 0, score = 0;
  g.innerHTML = `${hud(N)}<div class="gq"></div><div class="stage ${skin}" aria-label="Khu vực chơi">${skin === 'fish' ? '<span class="boat" aria-hidden="true">🚣</span><span class="weed w1"></span><span class="weed w2"></span>' : '<span class="cloud c1"></span><span class="cloud c2"></span>'}</div>`;
  const stage = $('.stage', g), gq = $('.gq', g), bar = $('.g-timer i', g);
  function next() {
    if (round >= N) return onEnd(score, N);
    round++; $('.g-r', g).textContent = round;
    const q = prepQ(draw());
    gq.innerHTML = `<div class="q-text">${q.q}</div>`;
    $$('.it', stage).forEach(e => e.remove());
    let answered = false;
    const lanes = shuffle([0, 1, 2, 3]);
    q.choices.forEach((c, i) => {
      const b = document.createElement('button');
      const txt = String(c).replace(/<[^>]+>/g, '');
      b.className = `it ${skin} c${(i % 4) + 1}${txt.length > 7 ? ' long' : ''}`;
      b.innerHTML = `<span>${fmt(c)}</span>`;
      if (skin === 'balloon') { b.style.left = (3 + lanes[i] * 24.5) + '%'; b.style.setProperty('--h', R(8, 34) + '%'); b.style.animationDelay = (i * .15) + 's, ' + (1.2 + i * .3) + 's'; }
      else { b.style.top = (6 + lanes[i] * 23) + '%'; b.style.animationDuration = R(7, 10) + 's'; b.style.animationDelay = (-R(0, 6)) + 's'; if (i % 2) b.classList.add('rev'); }
      b.onclick = () => {
        if (answered || b.classList.contains('bad')) return;
        if (same(c, q)) {
          answered = true; score++; $('.g-sc b', g).textContent = score; b.classList.add('win'); sfx('ok');
          $$('.it', stage).forEach(x => { if (x !== b) x.classList.add('gone'); });
          later(next, 1000);
        } else { b.classList.add('bad'); sfx('bad'); }
      };
      stage.appendChild(b);
    });
    bar.style.transition = 'none'; bar.style.width = '100%'; void bar.offsetWidth;
    bar.style.transition = `width ${T}s linear`; bar.style.width = '0%';
    later(() => {
      if (answered) return; answered = true;
      $$('.it', stage).forEach(x => x.classList.add('gone'));
      gq.insertAdjacentHTML('beforeend', `<p class="miss">Hết giờ! Đáp án đúng là <b>${showA(q.a)}</b>.</p>`);
      later(next, 2200);
    }, T * 1000);
  }
  next();
}

/* Đua xe */
function raceGame(l, g, onEnd) {
  const GOAL = 8, STEP_MS = 16000, draw = drawer(l, 2); let me = 0, fox = 0, over = false, score = 0, asked = 0;
  g.innerHTML = `<div class="track" aria-label="Đường đua">
    <div class="lane"><span class="car me" aria-label="Xe của con">🚗</span><span class="lane-l">Con</span></div>
    <div class="lane"><span class="car fox" aria-label="Bạn Cáo">🦊</span><span class="lane-l">Cáo</span></div>
    <span class="finish" aria-hidden="true"></span></div><div class="gq"></div><div class="gch"></div>`;
  const pos = () => { $('.car.me', g).style.setProperty('--p', me / GOAL); $('.car.fox', g).style.setProperty('--p', fox / GOAL); };
  const end = win => { if (over) return; over = true; pos(); later(() => onEnd(win ? Math.max(score, GOAL - 1) : score, asked, win ? `Con về đích trước bạn Cáo! Trả lời đúng <b>${score}/${asked}</b> câu.` : `Bạn Cáo về đích trước mất rồi. Con trả lời đúng <b>${score}/${asked}</b> câu. Chơi lại nhé!`), 900); };
  const iv = setInterval(() => { if (over) return; fox++; pos(); if (fox >= GOAL) end(false); }, STEP_MS);
  cleanups.push(() => clearInterval(iv));
  function ask() {
    if (over) return;
    const q = prepQ(draw()); asked++;
    $('.gq', g).innerHTML = `<div class="q-text">${q.q}</div>`;
    const long = q.choices.some(c => String(c).replace(/<[^>]+>/g, '').length > 14);
    $('.gch', g).innerHTML = `<div class="choices${long ? ' long' : ''}">${q.choices.map((c, i) => `<button class="ch" data-i="${i}"><span class="ch-k">${'ABCD'[i]}</span><span class="ch-v">${fmt(c)}</span></button>`).join('')}</div>`;
    let tried = false;
    $$('.ch', g).forEach(b => b.onclick = () => {
      if (over || b.disabled) return;
      const c = q.choices[+b.dataset.i];
      if (same(c, q)) {
        if (!tried) score++;
        b.classList.add('ok'); sfx('ok'); me++; pos();
        $$('.ch', g).forEach(x => x.disabled = true);
        if (me >= GOAL) end(true); else later(ask, 650);
      } else { tried = true; b.classList.add('bad'); b.disabled = true; sfx('bad'); fox++; pos(); if (fox >= GOAL) end(false); }
    });
  }
  pos(); ask();
}

/* Lật thẻ */
function memoryGame(l, g, onEnd) {
  const pairs = [], L = new Set(), Rr = new Set();
  for (let k = 0; k < 300 && pairs.length < 6; k++) { const q = l.gen(); if (!q.pair) continue; const [a, b] = q.pair; if (L.has(a) || Rr.has(b)) continue; L.add(a); Rr.add(b); pairs.push([a, b]); }
  if (pairs.length < 4) return floatGame(l, g, 'balloon', onEnd);
  const cards = shuffle(pairs.flatMap((p, i) => [{ t: p[0], id: i, k: 'e' }, { t: p[1], id: i, k: 'r' }]));
  let open = [], matched = 0, moves = 0, lock = false;
  g.innerHTML = `<div class="ghud"><span>Số lượt lật: <b class="mv">0</b></span><span>Tìm được: <b class="mt">0</b>/${pairs.length} cặp</span></div><div class="mem">${cards.map((c, i) => `<button class="mc" data-i="${i}" aria-label="Thẻ ${i + 1}"><span class="mc-in"><span class="mc-b" aria-hidden="true">?</span><span class="mc-f ${c.k}"><span>${fmt(c.t)}</span></span></span></button>`).join('')}</div>`;
  $$('.mc', g).forEach(b => b.onclick = () => {
    const i = +b.dataset.i;
    if (lock || b.classList.contains('open') || b.classList.contains('done')) return;
    b.classList.add('open'); sfx('flip'); open.push(i);
    if (open.length === 2) {
      moves++; $('.mv', g).textContent = moves;
      const [x, y] = open.map(k => cards[k]);
      const bx = $$('.mc', g)[open[0]], by = $$('.mc', g)[open[1]];
      if (x.id === y.id && x.k !== y.k) {
        matched++; $('.mt', g).textContent = matched; sfx('ok');
        bx.classList.add('done'); by.classList.add('done'); open = [];
        if (matched === pairs.length) later(() => { const P = pairs.length; const sc = moves <= P + 2 ? P : moves <= P * 2 ? Math.ceil(P * .7) : Math.ceil(P * .4); onEnd(sc, P, `Con tìm hết ${P} cặp sau <b>${moves}</b> lượt lật.`); }, 700);
      } else {
        lock = true; later(() => { bx.classList.remove('open'); by.classList.remove('open'); open = []; lock = false; }, 950);
      }
    }
  });
}

/* Xếp số */
function sortGame(l, g, onEnd) {
  const ROUNDS = 5, [mn, mx] = l.sort || [10, 99]; let round = 0, perfect = 0;
  function next() {
    if (round >= ROUNDS) return onEnd(perfect, ROUNDS, `Con xếp đúng hoàn toàn <b>${perfect}/${ROUNDS}</b> lượt.`);
    round++;
    const set = new Set(); while (set.size < 5) set.add(R(mn, mx));
    const nums = [...set], asc = Math.random() < .6, order = [...nums].sort((a, b) => asc ? a - b : b - a);
    let posi = 0, miss = 0;
    g.innerHTML = `<div class="ghud"><span>Lượt <b>${round}</b>/${ROUNDS}</span><span>⭐ <b>${perfect}</b></span></div>
      <p class="sort-q">Xếp các số theo thứ tự <b class="hl">${asc ? 'từ bé đến lớn' : 'từ lớn đến bé'}</b>:</p>
      <div class="slots">${order.map((_, i) => `<span class="slot2" data-s="${i}"></span>${i < 4 ? `<span class="arrow">${asc ? '&lt;' : '&gt;'}</span>` : ''}`).join('')}</div>
      <div class="tiles">${shuffle(nums).map(n => `<button class="tile" data-n="${n}">${fN(n)}</button>`).join('')}</div>`;
    $$('.tile', g).forEach(b => b.onclick = () => {
      const n = +b.dataset.n;
      if (n === order[posi]) {
        sfx('pop'); b.classList.add('used'); b.disabled = true;
        const s = $(`.slot2[data-s="${posi}"]`, g); s.textContent = fN(n); s.classList.add('fill'); posi++;
        if (posi === 5) { if (!miss) perfect++; sfx('ok'); later(next, 900); }
      } else { miss++; sfx('bad'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); }
    });
  }
  next();
}

/* =================== BÀI KIỂM TRA =================== */
function quizIntro(l, p) {
  const prev = PROG[l.id] || {};
  p.innerHTML = `<div class="qintro"><div class="paper">
    <p class="kicker">Bài kiểm tra · ${lessonNo(l)}</p><h2>${l.title}</h2>
    <ul class="rules"><li>Gồm <b>10 câu</b>, mỗi câu đúng được <b>1 điểm</b>.</li><li>Chọn đáp án hoặc bấm số trên bàn phím số rồi bấm ✓.</li><li>Từ 9 điểm: <b>Hoàn thành tốt</b> ★★★ · 7–8 điểm: ★★ · 5–6 điểm: ★</li></ul>
    ${prev.best != null ? `<p class="prevbest">Điểm cao nhất của con: <b>${prev.best}</b> ${starsHTML(prev.stars || 0)}</p>` : ''}
    <button class="btn primary big start">Bắt đầu làm bài</button></div>${owl('happy', 110)}</div>`;
  $('.start', p).onclick = () => quiz(l, p);
}
function quiz(l, p) {
  const draw = drawer(l, 3), qs = Array.from({ length: 10 }, draw);
  const res = []; let i = 0;
  function show() {
    const q = qs[i];
    p.innerHTML = `<div class="quiz"><div class="qprog"><span>Câu <b>${i + 1}</b>/${qs.length}</span><span class="qdots">${qs.map((_, k) => `<i class="${k < res.length ? (res[k].ok ? 'ok' : 'bad') : k === i ? 'cur' : ''}"></i>`).join('')}</span></div><div class="qhost"></div></div>`;
    renderQ($('.qhost', p), q, (val, ok) => {
      res.push({ q, val, ok });
      const fb = $('.q-fb', p);
      fb.insertAdjacentHTML('beforeend', `<div class="fb-act"><button class="btn primary nx">${i < qs.length - 1 ? 'Câu tiếp theo →' : 'Xem kết quả'}</button></div>`);
      const nx = $('.nx', fb); nx.focus({ preventScroll: true });
      nx.onclick = () => { cleanup(); i++; if (i < qs.length) { show(); p.scrollIntoView({ block: 'start' }); } else result(l, p, res); };
      fb.scrollIntoView({ block: 'nearest', behavior: REDUCED ? 'auto' : 'smooth' });
    });
  }
  show();
}
function result(l, p, res) {
  const right = res.filter(r => r.ok).length, score = Math.round(right / res.length * 10);
  const rt = rating(score);
  const prev = PROG[l.id] || {};
  PROG[l.id] = { ...prev, best: Math.max(prev.best ?? -1, score), stars: Math.max(prev.stars || 0, rt.stars), last: score, tries: (prev.tries || 0) + 1 };
  save(); updTop();
  if (rt.stars >= 2) { sfx('win'); confetti(70); }
  const wrong = res.filter(r => !r.ok);
  const idx = LESSONS.indexOf(l), nextL = LESSONS[idx + 1];
  p.innerHTML = `<div class="result">
    <div class="paper rs-top">
      <div class="grade ${rt.cls}" aria-label="${score} điểm"><span class="g-num">${score}</span><span class="g-lbl">điểm</span></div>
      <div class="g-txt"><p class="kicker">Kết quả bài kiểm tra · ${lessonNo(l)}</p><h2>${rt.t}</h2><p class="bigstars">${starsHTML(rt.stars)}</p><p>Con làm đúng <b>${right}/${res.length}</b> câu. ${rt.msg}</p><p class="loiphe">Lời phê: <span>${rt.loi}</span></p></div>
    </div>
    <div class="btns"><button class="btn ghost redo">↻ Làm lại bài kiểm tra</button><button class="btn ghost relearn">Ôn lại bài học</button>${nextL ? `<button class="btn primary nextl">Bài tiếp: ${lessonNo(nextL)} →</button>` : '<button class="btn primary nextl">Về mục lục</button>'}</div>
    ${wrong.length ? `<h3 class="rv-h">Xem lại ${wrong.length} câu chưa đúng</h3><ol class="review">${wrong.map(r => `<li><div class="rv-q">${r.q.q}</div><p class="rv-a">Con trả lời: <b class="red">${showA(r.val)}</b> · Đáp án đúng: <b class="green">${showA(r.q.a)}</b></p>${r.q.ex ? `<div class="fb-ex">${r.q.ex}</div>` : ''}</li>`).join('')}</ol>` : `<p class="allright">${owl('happy', 60)} Con làm đúng tất cả các câu. Xuất sắc!</p>`}
  </div>`;
  $('.redo', p).onclick = () => quiz(l, p);
  $('.relearn', p).onclick = () => showStep(l, 'learn');
  $('.nextl', p).onclick = () => nextL ? lesson(nextL.id) : home();
}

/* =================== KHỞI ĐỘNG =================== */
$('#brand').onclick = home;
const snd = $('#snd');
const updSnd = () => { snd.textContent = SOUND ? '🔊 Âm thanh' : '🔇 Tắt tiếng'; snd.setAttribute('aria-pressed', SOUND); };
snd.onclick = () => { SOUND = !SOUND; try { localStorage.setItem('toanvui3-snd', SOUND ? '1' : '0'); } catch (e) { } updSnd(); };
updSnd();
try { speechSynthesis.getVoices(); } catch (e) { }
const startId = (location.hash || '').slice(1);
if (startId && BYID[startId]) lesson(startId); else home();
