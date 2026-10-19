'use strict';
/* Nội dung bám theo SGK Toán 3 – bộ sách Kết nối tri thức với cuộc sống (NXB Giáo dục Việt Nam).
   Mỗi bài: learn (thẻ bài học), game (trò chơi), gen() sinh câu hỏi cho trò chơi & bài kiểm tra. */

const steps = (...lines) => `<div class="giai"><b>Bài giải</b><br>${lines.join('<br>')}</div>`;
const memoList = ids => '<ul class="recap">' + ids.map(id => { const l = BYID_RAW[id]; return `<li><b>Bài ${l.so}. ${l.title}</b><br>${l.memo}</li>`; }).join('') + '</ul>';
const BYID_RAW = {};
function bigNum(minLen, maxLen) { const L = R(minLen, maxLen); let s = String(R(1, 9)); for (let i = 1; i < L; i++) s += R(0, 9); return +s; }
const HANG = ['đơn vị', 'chục', 'trăm', 'nghìn', 'chục nghìn'];

/* ---- hình minh hoạ riêng lớp 3 ---- */
function vTherm(t) {
  const y = v => 180 - v * 1.5; // 0–100 °C
  let s = `<svg class="therm" viewBox="0 0 84 220" role="img" aria-label="Nhiệt kế ${t} độ C"><rect x="24" y="20" width="16" height="170" rx="8" class="th-b"/><circle cx="32" cy="196" r="14" class="th-b"/><circle cx="32" cy="196" r="10" class="th-l"/><rect x="28" y="${y(t)}" width="8" height="${196 - y(t)}" class="th-l"/>`;
  for (let v = 0; v <= 100; v += 10) s += `<line x1="40" y1="${y(v)}" x2="${v % 50 ? 46 : 50}" y2="${y(v)}" class="th-t"/>${v % 20 === 0 ? `<text x="52" y="${y(v) + 4}" class="th-n">${v}</text>` : ''}`;
  return s + '</svg>';
}
function vCup(ml, max = 1000) {
  const top = 20, bot = 160, y = v => bot - (v / max) * (bot - top);
  let s = `<svg class="cup" viewBox="0 0 110 170" role="img" aria-label="Ca đo ${ml} ml"><rect x="15" y="${y(ml)}" width="60" height="${bot - y(ml)}" class="cup-w"/><path d="M15 10 V${bot} H75 V10" class="cup-b"/>`;
  const st = max / 5;
  for (let v = st; v <= max; v += st) s += `<line x1="62" y1="${y(v)}" x2="75" y2="${y(v)}" class="cup-t"/><text x="79" y="${y(v) + 4}" class="cup-n">${v}</text>`;
  return s + '<text x="79" y="168" class="cup-n">ml</text></svg>';
}
const vMoney = list => '<div class="money">' + list.map(v => `<span class="bill m${v}"><b>${fN(v)}</b><small>đồng</small></span>`).join('') + '</div>';
function vSegMid(isMid, names = ['A', 'M', 'B']) {
  const mx = isMid ? 180 : pick([120, 240]);
  return `<svg class="fig" viewBox="0 0 360 90" role="img" aria-label="Đoạn thẳng"><line x1="60" y1="50" x2="300" y2="50" class="f-ln"/>${[[60, names[0]], [mx, names[1]], [300, names[2]]].map(([x, n]) => `<circle cx="${x}" cy="50" r="5" class="f-dot"/><text x="${x}" y="34" class="f-lb">${n}</text>`).join('')}${isMid ? '<path d="M116 44 l8 12 M236 44 l8 12" class="f-ln"/>' : ''}</svg>`;
}
function vCircle3(r, kind = 'r') {
  const line = kind === 'r' ? '<line x1="110" y1="90" x2="185" y2="90" class="f-ln red"/>' : '<line x1="35" y1="90" x2="185" y2="90" class="f-ln red"/>';
  return `<svg class="fig" viewBox="0 0 220 180" style="max-width:220px" role="img" aria-label="Hình tròn"><circle cx="110" cy="90" r="75" class="shp4c"/>${line}<circle cx="110" cy="90" r="4" class="f-dot"/><text x="104" y="82" class="f-lb">O</text>${kind === 'r' ? '<text x="190" y="86" class="f-lb">A</text>' : '<text x="26" y="86" class="f-lb">C</text><text x="194" y="86" class="f-lb">D</text>'}<text x="${kind === 'r' ? 148 : 110}" y="112" class="f-len">${r}</text></svg>`;
}
/* Bảng nhân k làm thẻ học */
const mulTable = k => `<div class="mtab">${Array.from({ length: 10 }, (_, i) => `<span>${k} × ${i + 1} = <b>${k * (i + 1)}</b></span>`).join('')}</div>`;
const divTable = k => `<div class="mtab">${Array.from({ length: 10 }, (_, i) => `<span>${k * (i + 1)} : ${k} = <b>${i + 1}</b></span>`).join('')}</div>`;
function tableGen(k) {
  return pick([
    () => calcQ(k, R(1, 10), '×'),
    () => { const q = R(1, 10); return calcQ(k * q, k, ':'); },
    () => { const b = R(2, 10); return inp(`<p class="eq">${k} × <span class="slot">?</span> = ${k * b}</p>`, b, `${k} × ${b} = ${k * b}`); },
    () => { const n = R(3, 9), e = pick([['hộp', 'cái bánh'], ['túi', 'quả cam'], ['bó', 'bông hoa'], ['hàng', 'bạn']]); return inp(`<p class="wp">Mỗi ${e[0]} có ${k} ${e[1]}. Hỏi ${n} ${e[0]} như thế có bao nhiêu ${e[1]}?</p>${n * k <= 40 ? vGroups(pick(['🧁', '🍊', '🌷', '🙂']), k, n) : ''}`, k * n, steps(`${k} × ${n} = ${k * n} (${e[1]})`)); },
    () => { const n = R(2, 9); return inp(`<p class="wp">Có ${k * n} quyển vở chia đều cho ${k} bạn. Hỏi mỗi bạn được mấy quyển vở?</p>`, n, steps(`${k * n} : ${k} = ${n} (quyển)`)); }
  ])();
}
const tableLesson = (id, so, k, game) => ({
  id, so, title: `Bảng nhân ${k}, bảng chia ${k}`, game,
  memo: `Đếm thêm ${k}: ${Array.from({ length: 10 }, (_, i) => k * (i + 1)).join(', ')}.`,
  learn: [
    { t: `Bảng nhân ${k}`, h: `${mulTable(k)}<p class="tip">Mỗi lần thừa số thứ hai tăng 1 thì tích tăng ${k}.</p>` },
    { t: `Bảng chia ${k}`, h: `${divTable(k)}<div class="memo">Từ ${k} × 4 = ${k * 4} suy ra ${k * 4} : ${k} = 4 và ${k * 4} : 4 = ${k}.</div>` }
  ],
  gen() { return tableGen(k); }
});

const BOOK = [
/* ================= TẬP MỘT ================= */
{ tap: 1, name: 'Tập một', topics: [

{ id: 'c1', no: 1, name: 'Ôn tập và bổ sung', hue: 1, lessons: [
{ id: 'b1', so: 1, title: 'Ôn tập các số đến 1000', game: 'sort', sort: [100, 999],
  memo: 'Số có ba chữ số gồm trăm, chục, đơn vị. So sánh từ hàng trăm.',
  learn: [
    { t: 'Đọc, viết số', h: `${vBlocks(3, 4, 5)}<p>3 trăm, 4 chục, 5 đơn vị: <b class="hl">345</b>, đọc là <i>${docSo(345)}</i>.</p><p class="eq">345 = 300 + 40 + 5</p>` },
    { t: 'So sánh', h: `<p class="eq">527 &gt; 498 &nbsp; 362 &lt; 368</p><div class="memo">So sánh hàng trăm trước, rồi đến hàng chục, cuối cùng là hàng đơn vị.</div>` }
  ],
  gen() { const n = R(100, 999); return pick([
    () => mc(`<p>Số “<b>${docSo(n)}</b>” viết là:</p>`, n, fill4(n, [n + 10, n - 100 >= 100 ? n - 100 : n + 100, +String(n).split('').reverse().join('') || n + 1], 100, 999), `Viết là ${n}.`),
    () => { const s = String(n); return inp(`<p class="eq">${n} = <span class="slot">?</span> + ${+s[1] * 10} + ${s[2]}</p>`, +s[0] * 100, `${n} gồm ${s[0]} trăm, ${s[1]} chục, ${s[2]} đơn vị.`); },
    () => cmpQ(n, pick([R(100, 999), Math.floor(n / 10) * 10 + R(0, 9)])),
    () => inp(`<p>Số liền sau của <b>${n}</b> là số nào?</p>`, n + 1, `${n} + 1 = ${n + 1}`)
  ])(); } },

{ id: 'b2', so: 2, title: 'Ôn tập phép cộng, phép trừ trong phạm vi 1000', game: 'memory',
  memo: 'Đặt tính thẳng hàng, tính từ phải sang trái, nhớ sang hàng bên trái.',
  learn: [
    { t: 'Cộng, trừ có nhớ', h: `<div class="pair2">${vCol(356, 278, '+', '634')}${vCol(725, 348, '−', '377')}</div>` },
    { t: 'Tính nhẩm', h: `<p class="eq">400 + 300 = 700 &nbsp; 850 − 50 = 800</p>` }
  ],
  gen() { return pick([
    () => { const a = R(100, 700), b = R(100, 999 - a); return calcQ(a, b, '+', { col: Math.random() < .5 }); },
    () => { const a = R(300, 999), b = R(100, a - 50); return calcQ(a, b, '-', { col: Math.random() < .5 }); },
    () => { const a = R(1, 8) * 100, b = R(1, 9 - a / 100) * 100; return calcQ(a, b, '+'); }
  ])(); } },

{ id: 'b3', so: 3, title: 'Tìm thành phần trong phép cộng, phép trừ', game: 'race',
  memo: 'Số hạng = Tổng − số hạng kia. Số bị trừ = Hiệu + Số trừ. Số trừ = Số bị trừ − Hiệu.',
  learn: [
    { t: 'Tìm số hạng', h: `<p class="eq"><span class="slot">?</span> + 25 = 60</p><p>Số hạng chưa biết = 60 − 25 = <b>35</b>.</p><div class="memo">Muốn tìm số hạng, ta lấy tổng trừ đi số hạng kia.</div>` },
    { t: 'Tìm số bị trừ, số trừ', h: `<p class="eq"><span class="slot">?</span> − 18 = 30 → 30 + 18 = <b>48</b></p><p class="eq">72 − <span class="slot">?</span> = 40 → 72 − 40 = <b>32</b></p><div class="memo">Số bị trừ = Hiệu + Số trừ. Số trừ = Số bị trừ − Hiệu.</div>` }
  ],
  gen() { const a = R(12, 500), b = R(10, 400); return pick([
    () => inp(`<p>Tìm số hạng chưa biết:</p><p class="eq"><span class="slot">?</span> + ${b} = ${a + b}</p>`, a, `${a + b} − ${b} = ${a}`),
    () => inp(`<p>Tìm số bị trừ:</p><p class="eq"><span class="slot">?</span> − ${b} = ${a}</p>`, a + b, `${a} + ${b} = ${a + b}`),
    () => inp(`<p>Tìm số trừ:</p><p class="eq">${a + b} − <span class="slot">?</span> = ${a}</p>`, b, `${a + b} − ${a} = ${b}`)
  ])(); } },

{ id: 'b4', so: 4, title: 'Ôn tập bảng nhân 2; 5, bảng chia 2; 5', game: 'balloon',
  memo: 'Bảng nhân 2: đếm thêm 2. Bảng nhân 5: đếm thêm 5.',
  learn: [
    { t: 'Bảng nhân 2 và 5', h: `${mulTable(2)}${mulTable(5)}` },
    { t: 'Bảng chia 2 và 5', h: `${divTable(2)}${divTable(5)}` }
  ],
  gen() { return tableGen(pick([2, 5])); } },

tableLesson('b5', 5, 3, 'fish'),
tableLesson('b6', 6, 4, 'memory'),

{ id: 'b7', so: 7, title: 'Ôn tập hình học và đo lường', game: 'race',
  memo: 'Độ dài đường gấp khúc = tổng độ dài các đoạn. 1 m = 100 cm; 1 kg = 1000 g… (lớp 2: m, dm, cm, kg, l).',
  learn: [
    { t: 'Đường gấp khúc', h: `${vPoly([3, 4, 5])}<p>Độ dài đường gấp khúc ABCD: 3 + 4 + 5 = <b>12 cm</b>.</p>` },
    { t: 'Đơn vị đo đã học', h: `<p class="eq">1 dm = 10 cm &nbsp; 1 m = 10 dm = 100 cm &nbsp; 1 km = 1000 m</p><p>Đơn vị đo khối lượng: kg. Đơn vị đo dung tích: l.</p>` }
  ],
  gen() { return pick([
    () => { const ls = Array.from({ length: R(2, 4) }, () => R(2, 9)); const s = ls.reduce((a, b) => a + b); return inp(`<p>Tính độ dài đường gấp khúc (cm):</p>${vPoly(ls)}`, s, `${ls.join(' + ')} = ${s} (cm)`); },
    () => { const k = R(2, 9); const c = pick([[`${k} m`, 'cm', k * 100], [`${k} dm`, 'cm', k * 10], [`${k} km`, 'm', k * 1000], [`${k * 10} cm`, 'dm', k]]); return inp(`<p class="eq">${c[0]} = <span class="slot">?</span> ${c[1]}</p>`, c[2], `${c[0]} = ${c[2]} ${c[1]}`); },
    () => { const a = R(10, 50), b = R(5, 40); return calcQ(a, b, '+', { unit: pick(['kg', 'l']) }); }
  ])(); } },

{ id: 'b8', so: 8, title: 'Luyện tập chung', game: 'balloon', mix: ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7'] }
]},

{ id: 'c2', no: 2, name: 'Bảng nhân, bảng chia', hue: 2, lessons: [
tableLesson('b9', 9, 6, 'balloon'),
tableLesson('b10', 10, 7, 'fish'),
tableLesson('b11', 11, 8, 'memory'),
tableLesson('b12', 12, 9, 'race'),
{ id: 'b13', so: 13, title: 'Tìm thành phần trong phép nhân, phép chia', game: 'balloon',
  memo: 'Thừa số = Tích : thừa số kia. Số bị chia = Thương × Số chia. Số chia = Số bị chia : Thương.',
  learn: [
    { t: 'Tìm thừa số', h: `<p class="eq"><span class="slot">?</span> × 4 = 28 → 28 : 4 = <b>7</b></p><div class="memo">Muốn tìm một thừa số, ta lấy tích chia cho thừa số kia.</div>` },
    { t: 'Tìm số bị chia, số chia', h: `<p class="eq"><span class="slot">?</span> : 3 = 6 → 6 × 3 = <b>18</b></p><p class="eq">35 : <span class="slot">?</span> = 5 → 35 : 5 = <b>7</b></p>` }
  ],
  gen() { const a = R(2, 9), b = R(2, 9); return pick([
    () => inp(`<p>Tìm thừa số:</p><p class="eq"><span class="slot">?</span> × ${b} = ${a * b}</p>`, a, `${a * b} : ${b} = ${a}`),
    () => inp(`<p>Tìm số bị chia:</p><p class="eq"><span class="slot">?</span> : ${b} = ${a}</p>`, a * b, `${a} × ${b} = ${a * b}`),
    () => inp(`<p>Tìm số chia:</p><p class="eq">${a * b} : <span class="slot">?</span> = ${a}</p>`, b, `${a * b} : ${a} = ${b}`)
  ])(); } },

{ id: 'b14', so: 14, title: 'Một phần mấy', game: 'fish',
  memo: 'Chia hình thành n phần bằng nhau, lấy một phần là 1/n của hình.',
  learn: [
    { t: 'Một phần hai, một phần ba…', h: `<div class="row-c">${vFracShape(1, 2, 'pie')}${vFracShape(1, 3, 'pie')}${vFracShape(1, 4, 'pie')}</div><p>Đã tô màu ${F(1, 2)} (một phần hai), ${F(1, 3)} (một phần ba), ${F(1, 4)} (một phần tư) hình tròn.</p>` },
    { t: 'Tìm một phần mấy của một số', h: `${vGroups('🍬', 4, 3)}<p>${F(1, 3)} của 12 cái kẹo là: 12 : 3 = <b>4</b> (cái kẹo).</p><div class="memo">Muốn tìm ${F(1, 'n')} của một số, ta lấy số đó chia cho n.</div>` }
  ],
  gen() { const n = R(2, 9); return pick([
    () => { const ok = `1/${n}`; return { ...mc(`<p>Đã tô màu một phần mấy của hình?</p>${vFracShape(1, n, pick(['pie', 'bar']))}`, ok, [ok, `1/${n + 1}`, `1/${n - 1 || n + 2}`, `${n}/1`]), exact: true, ex: `Chia ${n} phần bằng nhau, tô 1 phần: ${F(1, n)}.` }; },
    () => { const k = R(2, 9); return inp(`<p>Tìm <span class="eq">${F(1, n)}</span> của <b>${n * k}</b>.</p>`, k, `${n * k} : ${n} = ${k}`); },
    () => { const k = R(2, 9); return inp(`<p class="wp">Có ${n * k} quả cam, mẹ biếu bà ${F(1, n)} số cam. Hỏi mẹ biếu bà mấy quả cam?</p>`, k, steps(`${n * k} : ${n} = ${k} (quả)`)); }
  ])(); } },

{ id: 'b15', so: 15, title: 'Luyện tập chung', game: 'race', mix: ['b9', 'b10', 'b11', 'b12', 'b13', 'b14'] }
]},

{ id: 'c3', no: 3, name: 'Làm quen với hình phẳng, hình khối', hue: 3, lessons: [
{ id: 'b16', so: 16, title: 'Điểm ở giữa, trung điểm của đoạn thẳng', game: 'balloon',
  memo: 'Trung điểm M của đoạn AB: M ở giữa A và B, MA = MB.',
  learn: [
    { t: 'Điểm ở giữa', h: `${vSegMid(false)}<p>A, M, B là ba điểm thẳng hàng. M là <b>điểm ở giữa</b> hai điểm A và B.</p>` },
    { t: 'Trung điểm', h: `${vSegMid(true)}<p>M ở giữa A và B, đồng thời <b>MA = MB</b>. M là <b>trung điểm</b> của đoạn thẳng AB.</p><div class="memo">Đoạn AB dài 8 cm thì AM = MB = 8 : 2 = 4 cm.</div>` }
  ],
  gen() { return pick([
    () => { const m = Math.random() < .5; return mc(`<p>M có phải là <b>trung điểm</b> của đoạn thẳng AB không?</p>${vSegMid(m)}`, m ? 'Có' : 'Không', ['Có', 'Không'], m ? 'M ở giữa và MA = MB.' : 'MA khác MB nên M không là trung điểm.'); },
    () => { const L = R(2, 12) * 2; return inp(`<p>M là trung điểm của đoạn thẳng AB dài ${L} cm. Đoạn AM dài bao nhiêu xăng-ti-mét?</p>${vSegMid(true)}`, L / 2, `${L} : 2 = ${L / 2} (cm)`); },
    () => { const h = R(2, 15); return inp(`<p>M là trung điểm của đoạn AB, AM = ${h} cm. Đoạn AB dài bao nhiêu xăng-ti-mét?</p>`, h * 2, `${h} × 2 = ${h * 2} (cm)`); }
  ])(); } },

{ id: 'b17', so: 17, title: 'Hình tròn. Tâm, bán kính, đường kính của hình tròn', game: 'fish',
  memo: 'Đường kính dài gấp 2 lần bán kính.',
  learn: [
    { t: 'Tâm và bán kính', h: `${vCircle3('bán kính OA', 'r')}<p>O là <b>tâm</b> hình tròn. OA là <b>bán kính</b>.</p>` },
    { t: 'Đường kính', h: `${vCircle3('đường kính CD', 'd')}<p>CD đi qua tâm O là <b>đường kính</b>. Đường kính dài gấp 2 lần bán kính.</p><p class="tip">Dùng com-pa để vẽ hình tròn.</p>` }
  ],
  gen() { const r = R(2, 15); return pick([
    () => inp(`<p>Hình tròn có bán kính ${r} cm. Đường kính dài bao nhiêu xăng-ti-mét?</p>`, r * 2, `${r} × 2 = ${r * 2} (cm)`),
    () => inp(`<p>Hình tròn có đường kính ${r * 2} cm. Bán kính dài bao nhiêu xăng-ti-mét?</p>`, r, `${r * 2} : 2 = ${r} (cm)`),
    () => { const k = pick(['r', 'd']); return mc(`<p>Đoạn thẳng màu đỏ là gì của hình tròn?</p>${vCircle3('', k)}`, k === 'r' ? 'Bán kính' : 'Đường kính', ['Bán kính', 'Đường kính', 'Tâm'], k === 'r' ? 'Nối tâm với một điểm trên đường tròn: bán kính.' : 'Đi qua tâm, nối hai điểm trên đường tròn: đường kính.'); },
    () => mc('<p>Dụng cụ nào dùng để vẽ hình tròn?</p>', 'Com-pa', ['Com-pa', 'Ê-ke', 'Thước kẻ'], 'Dùng com-pa để vẽ hình tròn.')
  ])(); } },

{ id: 'b18', so: 18, title: 'Góc, góc vuông, góc không vuông', game: 'race',
  memo: 'Dùng ê-ke để kiểm tra góc vuông.',
  learn: [
    { t: 'Góc vuông', h: `${vAngle(90)}<p>Góc đỉnh O, cạnh OA, OB là <b>góc vuông</b>.</p>` },
    { t: 'Góc không vuông', h: `<div class="row-c">${vAngle(50, ['O', 'M', 'N'])}${vAngle(130, ['O', 'P', 'Q'])}</div><p>Đây là các <b>góc không vuông</b>. Dùng ê-ke để kiểm tra.</p>` }
  ],
  gen() { return pick([
    () => { const d = pick([90, 90, 40, 60, 120, 140]); return mc(`<p>Góc dưới đây là góc vuông hay góc không vuông?</p>${vAngle(d)}`, d === 90 ? 'Góc vuông' : 'Góc không vuông', ['Góc vuông', 'Góc không vuông'], d === 90 ? 'Hai cạnh vuông góc với nhau.' : 'Dùng ê-ke kiểm tra thấy không vuông.'); },
    () => { const s = pick([['cn', 4], ['vuong', 4], ['tg', 0]]); return inp(`<p>Hình dưới đây có mấy góc vuông?</p>${vShape4(s[0])}`, s[1], `Hình này có ${s[1]} góc vuông.`); },
    () => mc('<p>Dụng cụ nào dùng để kiểm tra góc vuông?</p>', 'Ê-ke', ['Ê-ke', 'Com-pa', 'Cân'], 'Dùng ê-ke.')
  ])(); } },

{ id: 'b19', so: 19, title: 'Hình tam giác, hình tứ giác. Hình chữ nhật, hình vuông', game: 'balloon',
  memo: 'Hình chữ nhật có 4 góc vuông, hai chiều dài bằng nhau, hai chiều rộng bằng nhau. Hình vuông có 4 góc vuông và 4 cạnh bằng nhau.',
  learn: [
    { t: 'Tam giác và tứ giác', h: `<div class="row-c">${vShape4('tg')}${vShape4('hbh')}</div><p>Hình tam giác có 3 cạnh, 3 đỉnh, 3 góc. Hình tứ giác có 4 cạnh, 4 đỉnh, 4 góc.</p>` },
    { t: 'Hình chữ nhật, hình vuông', h: `<div class="row-c">${vShape4('cn')}${vShape4('vuong')}</div><div class="memo">Hình chữ nhật: 4 góc vuông, 2 cạnh dài bằng nhau, 2 cạnh ngắn bằng nhau.<br>Hình vuông: 4 góc vuông, 4 cạnh bằng nhau.</div>` }
  ],
  gen() { const NM = { tg: 'Hình tam giác', cn: 'Hình chữ nhật', vuong: 'Hình vuông', hbh: 'Hình tứ giác' }; return pick([
    () => { const k = pick(Object.keys(NM)); return mc(`<p>Đây là hình gì?</p>${vShape4(k)}`, NM[k], Object.values(NM), `Đây là ${NM[k].toLowerCase()}.`); },
    () => { const c = pick([['Hình tam giác', 3], ['Hình tứ giác', 4], ['Hình vuông', 4]]); return inp(`<p>${c[0]} có mấy đỉnh?</p>`, c[1], `${c[0]} có ${c[1]} đỉnh.`); },
    () => mc('<p>Hình nào có <b>4 góc vuông và 4 cạnh bằng nhau</b>?</p>', 'Hình vuông', ['Hình vuông', 'Hình chữ nhật', 'Hình tam giác'], 'Hình vuông có 4 cạnh bằng nhau.')
  ])(); } },

{ id: 'b21', so: 21, title: 'Khối lập phương, khối hộp chữ nhật', game: 'fish',
  memo: 'Khối lập phương và khối hộp chữ nhật đều có 6 mặt, 12 cạnh, 8 đỉnh.',
  learn: [
    { t: 'Khối lập phương', h: `<p class="big-e">🎲 🧊</p><p>Khối lập phương có <b>6 mặt</b> đều là hình vuông, <b>12 cạnh</b> bằng nhau, <b>8 đỉnh</b>.</p>` },
    { t: 'Khối hộp chữ nhật', h: `<p class="big-e">📦 🎁 🧱</p><p>Khối hộp chữ nhật có <b>6 mặt</b> là hình chữ nhật, <b>12 cạnh</b>, <b>8 đỉnh</b>.</p>` }
  ],
  gen() { return pick([
    () => { const c = pick([['mặt', 6], ['cạnh', 12], ['đỉnh', 8]]); const k = pick(['Khối lập phương', 'Khối hộp chữ nhật']); return inp(`<p>${k} có mấy ${c[0]}?</p>`, c[1], `${k} có ${c[1]} ${c[0]}.`); },
    () => { const a = pick(['🎲', '🧊']); return mc('<p>Đồ vật nào có dạng <b>khối lập phương</b>?</p>', a, [a, '📦', '⚽', '🥫'], `${a} có dạng khối lập phương.`); },
    () => mc('<p>Các mặt của khối lập phương là hình gì?</p>', 'Hình vuông', ['Hình vuông', 'Hình tròn', 'Hình tam giác'], 'Các mặt đều là hình vuông.')
  ])(); } },

{ id: 'b22', so: 22, title: 'Luyện tập chung', game: 'race', mix: ['b16', 'b17', 'b18', 'b19', 'b21'] }
]},

{ id: 'c4', no: 4, name: 'Phép nhân, phép chia trong phạm vi 100', hue: 4, lessons: [
{ id: 'b23', so: 23, title: 'Nhân số có hai chữ số với số có một chữ số', game: 'memory',
  memo: 'Nhân từ phải sang trái: đơn vị trước, chục sau, nhớ nếu cần.',
  learn: [
    { t: 'Đặt tính 26 × 3', h: `<div class="pair2">${vCol(26, 3, '×', '78')}<div><p>• 3 nhân 6 bằng 18, viết 8 nhớ 1.</p><p>• 3 nhân 2 bằng 6, thêm 1 bằng 7, viết 7.</p><p>Vậy <b>26 × 3 = 78</b>.</p></div></div>` }
  ],
  gen() { const b = R(2, 9), a = R(11, Math.floor(99 / b) || 11); return pick([
    () => calcQ(a, b, '×', { col: Math.random() < .5 }),
    () => inp(`<p class="wp">Mỗi bao có ${a} kg gạo. Hỏi ${b} bao như thế có bao nhiêu ki-lô-gam gạo?</p>`, a * b, steps(`${a} × ${b} = ${a * b} (kg)`))
  ])(); } },

{ id: 'b24', so: 24, title: 'Gấp một số lên một số lần', game: 'balloon',
  memo: 'Muốn gấp một số lên nhiều lần, ta lấy số đó nhân với số lần.',
  learn: [
    { t: 'Gấp lên', h: `${vRows([{ label: 'A', e: '🟦', n: 2 }, { label: 'B', e: '🟦', n: 6 }])}<p>Đoạn A có 2 ô; gấp lên 3 lần được 2 × 3 = <b>6</b> ô.</p><div class="memo">Gấp a lên n lần: <b>a × n</b>.</div>` }
  ],
  gen() { const a = R(2, 15), n = R(2, 6); return pick([
    () => inp(`<p>Gấp <b>${a}</b> lên <b>${n}</b> lần được bao nhiêu?</p>`, a * n, `${a} × ${n} = ${a * n}`),
    () => { const age = R(7, 10), k = R(6, 9); return inp(`<p class="wp">Năm nay em ${age} tuổi, tuổi bà gấp ${k} lần tuổi em. Hỏi năm nay bà bao nhiêu tuổi?</p>`, age * k, steps(`${age} × ${k} = ${age * k} (tuổi)`)); },
    () => mc(`<p>Gấp ${a} lên ${n} lần thì làm phép tính nào?</p>`, `${a} × ${n}`, [`${a} × ${n}`, `${a} + ${n}`, `${a} : ${n}`, `${a} − ${n}`], 'Gấp lên nhiều lần thì làm phép nhân.')
  ])(); } },

{ id: 'b25', so: 25, title: 'Phép chia hết, phép chia có dư', game: 'fish',
  memo: 'Trong phép chia có dư, số dư luôn bé hơn số chia.',
  learn: [
    { t: 'Chia hết và chia có dư', h: `${vGroups('🍬', 3, 2)}<p>6 : 2 = 3 — chia hết.</p>${vGroups('🍬', 3, 2)} 🍬<p>7 : 2 = 3 (dư 1) — chia có dư.</p><div class="memo"><b>Số dư bé hơn số chia.</b></div>` }
  ],
  gen() { const b = R(2, 9), q = R(2, 9), r = R(1, b - 1); return pick([
    () => inp(`<p>Tìm <b>số dư</b>:</p><p class="eq">${b * q + r} : ${b}</p>`, r, `${b * q + r} : ${b} = ${q} (dư ${r})`),
    () => inp(`<p>Tìm <b>thương</b>:</p><p class="eq">${b * q + r} : ${b}</p>`, q, `${b * q + r} : ${b} = ${q} (dư ${r})`),
    () => mc(`<p>Trong phép chia cho <b>${b}</b>, số dư lớn nhất là:</p>`, b - 1, [b - 1, b, b + 1, 1], 'Số dư luôn bé hơn số chia.'),
    () => { const h = Math.random() < .5; const x = h ? b * q : b * q + r; return mc(`<p>Phép chia <b>${x} : ${b}</b> là phép chia hết hay có dư?</p>`, h ? 'Chia hết' : 'Có dư', ['Chia hết', 'Có dư'], h ? `${x} : ${b} = ${q}` : `${x} : ${b} = ${q} (dư ${r})`); }
  ])(); } },

{ id: 'b26', so: 26, title: 'Chia số có hai chữ số cho số có một chữ số', game: 'race',
  memo: 'Chia từ trái sang phải: chia hàng chục trước, rồi hạ hàng đơn vị.',
  learn: [
    { t: 'Ví dụ 84 : 4', h: `<p class="eq">84 : 4 = 21</p><p>• 8 chia 4 được 2, viết 2. 2 nhân 4 bằng 8, 8 trừ 8 bằng 0.</p><p>• Hạ 4; 4 chia 4 được 1, viết 1.</p>` },
    { t: 'Ví dụ 72 : 3', h: `<p class="eq">72 : 3 = 24</p><p>• 7 chia 3 được 2, viết 2; 2 × 3 = 6; 7 − 6 = 1.</p><p>• Hạ 2 được 12; 12 chia 3 được 4, viết 4.</p>` }
  ],
  gen() { const b = R(2, 9), q = R(11, Math.floor(99 / b)); return pick([
    () => calcQ(b * q, b, ':'),
    () => inp(`<p class="wp">Có ${b * q} học sinh xếp đều thành ${b} hàng. Hỏi mỗi hàng có bao nhiêu học sinh?</p>`, q, steps(`${b * q} : ${b} = ${q} (học sinh)`))
  ])(); } },

{ id: 'b27', so: 27, title: 'Giảm một số đi một số lần', game: 'balloon',
  memo: 'Muốn giảm một số đi nhiều lần, ta chia số đó cho số lần.',
  learn: [
    { t: 'Giảm đi', h: `${vRows([{ label: 'A', e: '🟧', n: 8 }, { label: 'B', e: '🟧', n: 2 }])}<p>Đoạn A có 8 ô; giảm đi 4 lần được 8 : 4 = <b>2</b> ô.</p><div class="memo">Giảm a đi n lần: <b>a : n</b>. (Khác với “giảm đi n đơn vị”: a − n.)</div>` }
  ],
  gen() { const n = R(2, 9), q = R(2, 12); return pick([
    () => inp(`<p>Giảm <b>${n * q}</b> đi <b>${n}</b> lần được bao nhiêu?</p>`, q, `${n * q} : ${n} = ${q}`),
    () => inp(`<p>Giảm <b>${n * q}</b> đi <b>${n}</b> đơn vị được bao nhiêu?</p>`, n * q - n, `${n * q} − ${n} = ${n * q - n}`),
    () => inp(`<p class="wp">Mẹ có ${n * q} quả trứng, sau khi bán số trứng giảm đi ${n} lần. Hỏi mẹ còn lại bao nhiêu quả trứng?</p>`, q, steps(`${n * q} : ${n} = ${q} (quả)`))
  ])(); } },

{ id: 'b28', so: 28, title: 'Bài toán giải bằng hai bước tính', game: 'race',
  memo: 'Tìm kết quả trung gian ở bước một, rồi dùng nó để tìm đáp số ở bước hai.',
  learn: [
    { t: 'Ví dụ', h: `<p class="wp">Ngăn trên có 15 quyển sách, ngăn dưới nhiều hơn ngăn trên 5 quyển. Hỏi cả hai ngăn có bao nhiêu quyển sách?</p>${steps('Ngăn dưới: 15 + 5 = 20 (quyển)', 'Cả hai ngăn: 15 + 20 = 35 (quyển)', 'Đáp số: 35 quyển sách.')}` }
  ],
  gen() { const a = R(10, 40), b = R(3, 15), n = R(2, 4); return pick([
    () => inp(`<p class="wp">Thùng thứ nhất có ${a} l dầu, thùng thứ hai nhiều hơn thùng thứ nhất ${b} l. Hỏi cả hai thùng có bao nhiêu lít dầu?</p>`, 2 * a + b, steps(`Thùng thứ hai: ${a} + ${b} = ${a + b} (l)`, `Cả hai thùng: ${a} + ${a + b} = ${2 * a + b} (l)`)),
    () => inp(`<p class="wp">Bao gạo nếp nặng ${a} kg, bao gạo tẻ nặng gấp ${n} lần bao gạo nếp. Hỏi cả hai bao nặng bao nhiêu ki-lô-gam?</p>`, a + a * n, steps(`Bao gạo tẻ: ${a} × ${n} = ${a * n} (kg)`, `Cả hai bao: ${a} + ${a * n} = ${a + a * n} (kg)`)),
    () => { const t = R(4, 9), k = R(3, 8), s = R(5, t * k - 3); return inp(`<p class="wp">Có ${t} hộp bút, mỗi hộp ${k} chiếc. Cô giáo đã phát ${s} chiếc. Hỏi còn lại bao nhiêu chiếc bút?</p>`, t * k - s, steps(`Số bút: ${k} × ${t} = ${t * k} (chiếc)`, `Còn lại: ${t * k} − ${s} = ${t * k - s} (chiếc)`)); }
  ])(); } },

{ id: 'b29', so: 29, title: 'Luyện tập chung', game: 'fish', mix: ['b23', 'b24', 'b25', 'b26', 'b27', 'b28'] }
]},

{ id: 'c5', no: 5, name: 'Đơn vị đo độ dài, khối lượng, dung tích, nhiệt độ', hue: 5, lessons: [
{ id: 'b30', so: 30, title: 'Mi-li-mét', game: 'balloon',
  memo: '1 cm = 10 mm; 1 m = 1000 mm.',
  learn: [
    { t: 'Mi-li-mét', h: `${vRuler(3)}<p>Mỗi xăng-ti-mét trên thước được chia thành 10 phần bằng nhau, mỗi phần dài <b>1 mi-li-mét</b> (<b class="hl">mm</b>).</p><p class="eq">1 cm = 10 mm &nbsp; 1 m = 1000 mm</p>` }
  ],
  gen() { const k = R(2, 9); return pick([
    () => { const c = pick([[`${k} cm`, 'mm', k * 10], [`${k * 10} mm`, 'cm', k], [`${k} m`, 'mm', k * 1000], [`${k} dm`, 'mm', k * 100]]); return inp(`<p class="eq">${c[0]} = <span class="slot">?</span> ${c[1]}</p>`, c[2], `${c[0]} = ${fN(c[2])} ${c[1]}`); },
    () => { const c = pick([['Bề dày cuốn sách khoảng 15', 'mm'], ['Chiều dài bút chì khoảng 15', 'cm'], ['Chiều dài lớp học khoảng 8', 'm']]); return mc(`<p>Chọn đơn vị thích hợp:</p><p class="wp">${c[0]} <span class="slot">?</span></p>`, c[1], ['mm', 'cm', 'm'], `${c[0]} ${c[1]}.`); },
    () => { const a = R(10, 90), b = R(5, 60); return calcQ(a, b, '+', { unit: 'mm' }); }
  ])(); } },

{ id: 'b31', so: 31, title: 'Gam', game: 'fish',
  memo: '1 kg = 1000 g.',
  learn: [
    { t: 'Gam', h: `${vScale('🍊', KG(1).replace('1 kg', '200 g'), 0)}<p>Gam là đơn vị đo khối lượng, viết tắt là <b class="hl">g</b>. Quả cam nặng 200 g.</p><p class="eq">1 kg = 1000 g</p>` }
  ],
  gen() { const k = R(2, 9); return pick([
    () => { const ws = shuffle([100, 200, 500]).slice(0, R(1, 3)); const s = ws.reduce((a, b) => a + b); return inp(`<p>Cân thăng bằng. Quả bên trái nặng bao nhiêu gam?</p>${vScale(pick(['🍍', '🥭', '🍐']), ws.map(w => KG(1).replace('1 kg', `${w} g`)).join(''), 0)}`, s, `${ws.join(' + ')} = ${s} (g)`); },
    () => inp(`<p class="eq">${k} kg = <span class="slot">?</span> g</p>`, k * 1000, `${k} × 1000 = ${fN(k * 1000)}`),
    () => { const a = R(100, 600), b = R(50, 300); return calcQ(a, b, '+', { unit: 'g' }); },
    () => { const p = R(2, 9) * 100; return cmpQ(1000, p * 2, x => x === 1000 ? '1 kg' : `${x} g`, `1 kg = 1000 g.`); }
  ])(); } },

{ id: 'b32', so: 32, title: 'Mi-li-lít', game: 'race',
  memo: '1 l = 1000 ml.',
  learn: [
    { t: 'Mi-li-lít', h: `<div class="row-c">${vCup(400)}</div><p>Ca đo có vạch chia theo <b>mi-li-lít</b> (<b class="hl">ml</b>). Trong ca có 400 ml nước.</p><p class="eq">1 l = 1000 ml</p>` }
  ],
  gen() { return pick([
    () => { const v = R(1, 5) * 200; return inp(`<p>Trong ca có bao nhiêu mi-li-lít nước?</p><div class="row-c">${vCup(v)}</div>`, v, `Mực nước ở vạch ${v}.`); },
    () => { const k = R(2, 9); return inp(`<p class="eq">${k} l = <span class="slot">?</span> ml</p>`, k * 1000, `${k} × 1000 = ${fN(k * 1000)}`); },
    () => { const a = R(100, 500), b = R(50, 400); return calcQ(a, b, '+', { unit: 'ml' }); },
    () => { const a = R(3, 8) * 100, n = R(2, 4); return inp(`<p class="wp">Mỗi cốc chứa ${a} ml sữa. Hỏi ${n} cốc như thế chứa bao nhiêu mi-li-lít sữa?</p>`, a * n, steps(`${a} × ${n} = ${a * n} (ml)`)); }
  ])(); } },

{ id: 'b33', so: 33, title: 'Nhiệt độ. Đơn vị đo nhiệt độ', game: 'balloon',
  memo: 'Đơn vị đo nhiệt độ là độ C (°C). Dùng nhiệt kế để đo nhiệt độ.',
  learn: [
    { t: 'Nhiệt kế', h: `<div class="row-c">${vTherm(30)}<div><p>Nhiệt kế chỉ <b class="hl">30 °C</b> (ba mươi độ C).</p><p>Nước đá tan ở 0 °C. Nước sôi ở 100 °C. Nhiệt độ cơ thể người khoảng 37 °C.</p></div></div>` }
  ],
  gen() { return pick([
    () => { const t = R(1, 10) * 10; return inp(`<p>Nhiệt kế chỉ bao nhiêu độ C?</p><div class="row-c">${vTherm(t)}</div>`, t, `Mực đỏ ở vạch ${t}: ${t} °C.`); },
    () => { const c = pick([['Nhiệt độ cơ thể người khỏe mạnh', 37], ['Nước sôi', 100], ['Nước đá đang tan', 0]]); return mc(`<p>${c[0]} khoảng bao nhiêu độ C?</p>`, `${c[1]} °C`, ['0 °C', '37 °C', '100 °C', '60 °C'], `${c[0]}: khoảng ${c[1]} °C.`); },
    () => { const a = R(20, 35), b = R(15, a - 1); return inp(`<p class="wp">Buổi trưa nhiệt độ là ${a} °C, buổi tối là ${b} °C. Buổi trưa nóng hơn buổi tối bao nhiêu độ C?</p>`, a - b, `${a} − ${b} = ${a - b} (°C)`); }
  ])(); } },

{ id: 'b35', so: 35, title: 'Luyện tập chung', game: 'fish', mix: ['b30', 'b31', 'b32', 'b33'] }
]},

{ id: 'c6', no: 6, name: 'Phép nhân, phép chia trong phạm vi 1000', hue: 6, lessons: [
{ id: 'b36', so: 36, title: 'Nhân số có ba chữ số với số có một chữ số', game: 'memory',
  memo: 'Nhân lần lượt đơn vị, chục, trăm; nhớ sang hàng bên trái.',
  learn: [
    { t: 'Đặt tính 125 × 3', h: `<div class="pair2">${vCol(125, 3, '×', '375')}<div><p>• 3 × 5 = 15, viết 5 nhớ 1.</p><p>• 3 × 2 = 6, thêm 1 bằng 7, viết 7.</p><p>• 3 × 1 = 3, viết 3.</p></div></div>` }
  ],
  gen() { const b = R(2, 9), a = R(100, Math.floor(999 / b)); return pick([
    () => calcQ(a, b, '×', { col: Math.random() < .5 }),
    () => inp(`<p class="wp">Mỗi thùng có ${a} hộp sữa. Hỏi ${b} thùng như thế có bao nhiêu hộp sữa?</p>`, a * b, steps(`${a} × ${b} = ${a * b} (hộp)`))
  ])(); } },

{ id: 'b37', so: 37, title: 'Chia số có ba chữ số cho số có một chữ số', game: 'fish',
  memo: 'Chia từ trái sang phải; nếu chữ số đầu bé hơn số chia thì lấy hai chữ số.',
  learn: [
    { t: 'Ví dụ 648 : 3', h: `<p class="eq">648 : 3 = 216</p><p>6 chia 3 được 2; hạ 4, 4 chia 3 được 1 dư 1; hạ 8 được 18, 18 chia 3 được 6.</p>` },
    { t: 'Ví dụ 236 : 4', h: `<p class="eq">236 : 4 = 59</p><p>2 bé hơn 4 nên lấy 23 chia 4 được 5, dư 3; hạ 6 được 36, 36 chia 4 được 9.</p>` }
  ],
  gen() { const b = R(2, 9), q = R(Math.ceil(100 / b), Math.floor(999 / b)); return pick([
    () => calcQ(b * q, b, ':'),
    () => { const r = R(1, b - 1); if (b * q + r > 999) return calcQ(b * q, b, ':'); return inp(`<p>Tìm số dư: <span class="eq">${b * q + r} : ${b}</span></p>`, r, `${b * q + r} : ${b} = ${q} (dư ${r})`); },
    () => inp(`<p class="wp">Có ${b * q} kg gạo chia đều vào ${b} bao. Hỏi mỗi bao có bao nhiêu ki-lô-gam gạo?</p>`, q, steps(`${b * q} : ${b} = ${q} (kg)`))
  ])(); } },

{ id: 'b38', so: 38, title: 'Biểu thức số. Tính giá trị của biểu thức số', game: 'race',
  memo: 'Chỉ có cộng, trừ (hoặc chỉ có nhân, chia): tính từ trái sang phải. Có cả hai loại: nhân, chia trước. Có ngoặc: trong ngoặc trước.',
  learn: [
    { t: 'Tính từ trái sang phải', h: `<p class="eq">60 + 20 − 5 = 80 − 5 = 75</p><p class="eq">48 : 2 × 3 = 24 × 3 = 72</p>` },
    { t: 'Nhân, chia trước', h: `<p class="eq">60 + 35 : 5 = 60 + 7 = 67</p><p class="eq">(30 + 5) × 3 = 35 × 3 = 105</p><div class="memo">Trong ngoặc → nhân, chia → cộng, trừ.</div>` }
  ],
  gen() { const a = R(10, 90), b = R(2, 9), c = R(2, 9); return pick([
    () => { const x = R(10, 99), y = R(5, 50), z = R(1, Math.min(x + y - 1, 40)); return inp(`<p>Tính giá trị biểu thức:</p><p class="eq">${x} + ${y} − ${z}</p>`, x + y - z, `${x + y} − ${z} = ${x + y - z}`); },
    () => inp(`<p>Tính giá trị biểu thức:</p><p class="eq">${a} + ${b} × ${c}</p>`, a + b * c, `${b} × ${c} = ${b * c}; ${a} + ${b * c} = ${a + b * c}`),
    () => inp(`<p>Tính giá trị biểu thức:</p><p class="eq">(${a} + ${b}) × ${c}</p>`, (a + b) * c, `${a + b} × ${c} = ${(a + b) * c}`),
    () => { const q = R(2, 9); return inp(`<p>Tính giá trị biểu thức:</p><p class="eq">${a} − ${b * q} : ${b}</p>`, a - q, `${b * q} : ${b} = ${q}; ${a} − ${q} = ${a - q}`); }
  ])(); } },

{ id: 'b39', so: 39, title: 'So sánh số lớn gấp mấy lần số bé', game: 'balloon',
  memo: 'Muốn biết số lớn gấp mấy lần số bé, ta lấy số lớn chia cho số bé.',
  learn: [
    { t: 'Ví dụ', h: `${vRows([{ label: 'A', e: '🟩', n: 6 }, { label: 'B', e: '🟩', n: 2 }])}<p>Đoạn A dài 6 ô, đoạn B dài 2 ô. 6 : 2 = 3. Đoạn A dài <b>gấp 3 lần</b> đoạn B.</p>` }
  ],
  gen() { const b = R(2, 12), n = R(2, 8); return pick([
    () => inp(`<p><b>${b * n}</b> gấp mấy lần <b>${b}</b>?</p>`, n, `${b * n} : ${b} = ${n}`),
    () => inp(`<p class="wp">Con lợn nặng ${b * n * 5} kg, con chó nặng ${b * 5} kg. Hỏi con lợn nặng gấp mấy lần con chó?</p>`, n, steps(`${b * n * 5} : ${b * 5} = ${n} (lần)`))
  ])(); } },

{ id: 'b40', so: 40, title: 'Luyện tập chung', game: 'race', mix: ['b36', 'b37', 'b38', 'b39'] }
]},

{ id: 'c7', no: 7, name: 'Ôn tập học kì 1', hue: 7, lessons: [
{ id: 'on1', so: '41–45', title: 'Ôn tập học kì 1', game: 'race', mixTopics: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'] }
]}
]},

/* ================= TẬP HAI ================= */
{ tap: 2, name: 'Tập hai', topics: [

{ id: 'c8', no: 8, name: 'Các số đến 10 000', hue: 1, lessons: [
{ id: 'b46', so: 46, title: 'Các số có bốn chữ số. Số 10 000', game: 'balloon',
  memo: 'Số có bốn chữ số gồm nghìn, trăm, chục, đơn vị. Làm quen với chữ số La Mã: I, V, X.',
  learn: [
    { t: 'Số có bốn chữ số', h: `<div class="scrollx"><table class="tbl"><tr><th>Nghìn</th><th>Trăm</th><th>Chục</th><th>Đơn vị</th></tr><tr><td>3</td><td>4</td><td>2</td><td>6</td></tr></table></div><p>Viết: <b class="hl">${fN(3426)}</b>. Đọc: <i>${docSo(3426)}</i>.</p><p class="eq">${fN(3426)} = ${fN(3000)} + 400 + 20 + 6</p>` },
    { t: 'Số 10 000', h: `<p>10 nghìn = <b>một vạn</b>, viết là <b class="hl">${fN(10000)}</b>, đọc là <i>mười nghìn</i>.</p>` },
    { t: 'Chữ số La Mã', h: `<div class="scrollx"><table class="tbl"><tr>${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 19, 20].map(n => `<th>${toRoman(n)}</th>`).join('')}</tr><tr>${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 19, 20].map(n => `<td>${n}</td>`).join('')}</tr></table></div><p class="tip">I = 1, V = 5, X = 10. Mặt đồng hồ thường ghi số La Mã.</p>` }
  ],
  gen() { const n = bigNum(4, 4); return pick([
    () => mc(`<p>Số “<b>${docSo(n)}</b>” viết là:</p>`, fN(n), fill4(n, [n + 100, n - 10, +String(n).split('').reverse().join('') || n + 1], 1000, 9999), `Viết là ${fN(n)}.`),
    () => { const s = String(n), i = R(0, 3); return mc(`<p>Trong số <b>${fN(n)}</b>, chữ số <b class="hl">${s[i]}</b> (thứ ${i + 1} từ trái sang) thuộc hàng nào?</p>`, HANG[3 - i], HANG.slice(0, 4), `Chữ số ${s[i]} ở hàng ${HANG[3 - i]}.`); },
    () => { const d = String(n).split('').map(Number); return inp(`<p>Viết số gồm ${d[0]} nghìn, ${d[1]} trăm, ${d[2]} chục, ${d[3]} đơn vị.</p>`, n, fN(n)); },
    () => { const k = R(1, 20); return mc(`<p>Số La Mã <b class="eq">${toRoman(k)}</b> là số nào?</p>`, k, fill4(k, [k + 1, k - 1, k + 5, k + 10], 1, 30), `${toRoman(k)} = ${k}`); }
  ])(); } },

{ id: 'b47', so: 47, title: 'So sánh các số trong phạm vi 10 000', game: 'sort', sort: [1000, 9999],
  memo: 'Số nào nhiều chữ số hơn thì lớn hơn; cùng số chữ số thì so sánh từng hàng từ trái sang phải.',
  learn: [
    { t: 'So sánh', h: `<p class="eq">999 &lt; ${fN(1000)} &nbsp; ${fN(4589)} &lt; ${fN(4612)}</p><div class="memo">So sánh hàng nghìn → hàng trăm → hàng chục → hàng đơn vị.</div>` }
  ],
  gen() { return pick([
    () => { const a = bigNum(4, 4), b = pick([bigNum(3, 4), a + R(1, 9) * 10, a]); return cmpQ(a, Math.min(9999, b)); },
    () => { const s = [...new Set(Array.from({ length: 6 }, () => bigNum(4, 4)))].slice(0, 4); const big = Math.random() < .5; const v = big ? Math.max(...s) : Math.min(...s); return mc(`<p>Số <b>${big ? 'lớn nhất' : 'bé nhất'}</b> là:</p>`, fN(v), s.map(fN), `Số ${big ? 'lớn nhất' : 'bé nhất'}: ${fN(v)}.`); }
  ])(); } },

{ id: 'b48', so: 48, title: 'Làm tròn số đến hàng chục, hàng trăm', game: 'fish',
  memo: 'Chữ số bên phải hàng cần làm tròn bé hơn 5 thì làm tròn xuống, từ 5 trở lên thì làm tròn lên.',
  learn: [
    { t: 'Làm tròn đến hàng chục', h: `<p>43 ≈ <b>40</b> (3 &lt; 5) · 47 ≈ <b>50</b> (7 ≥ 5) · 45 ≈ <b>50</b></p>` },
    { t: 'Làm tròn đến hàng trăm', h: `<p>${fN(2349)} ≈ <b>${fN(2300)}</b> (chữ số hàng chục là 4) · ${fN(2371)} ≈ <b>${fN(2400)}</b> (7 ≥ 5)</p>` }
  ],
  gen() { const n = R(100, 9999); return pick([
    () => { const r = Math.round(n / 10) * 10; return mc(`<p>Làm tròn <b>${fN(n)}</b> đến hàng chục:</p>`, fN(r), fill4(r, [r + 10, r - 10, Math.round(n / 100) * 100].filter(x => x !== r && x >= 0)), `Chữ số hàng đơn vị là ${n % 10}.`); },
    () => { const r = Math.round(n / 100) * 100; return mc(`<p>Làm tròn <b>${fN(n)}</b> đến hàng trăm:</p>`, fN(r), fill4(r, [r + 100, r - 100, Math.round(n / 10) * 10].filter(x => x !== r && x >= 0)), `Chữ số hàng chục là ${Math.floor(n / 10) % 10}.`); }
  ])(); } },

{ id: 'b49', so: 49, title: 'Luyện tập chung', game: 'race', mix: ['b46', 'b47', 'b48'] }
]},

{ id: 'c9', no: 9, name: 'Chu vi, diện tích một số hình phẳng', hue: 2, lessons: [
{ id: 'b50', so: 50, title: 'Chu vi hình tam giác, hình tứ giác, hình chữ nhật, hình vuông', game: 'race',
  memo: 'Chu vi = tổng độ dài các cạnh. HCN: (dài + rộng) × 2. Hình vuông: cạnh × 4.',
  learn: [
    { t: 'Chu vi tam giác, tứ giác', h: `${vShape4('tg')}<p>Chu vi hình tam giác (tứ giác) bằng <b>tổng độ dài các cạnh</b>.</p>` },
    { t: 'Chu vi HCN, hình vuông', h: `<div class="row-c">${vShape4('cn')}${vShape4('vuong')}</div><div class="memo">Chu vi hình chữ nhật = (chiều dài + chiều rộng) × 2<br>Chu vi hình vuông = độ dài cạnh × 4</div>` }
  ],
  gen() { const a = R(3, 30), b = R(2, a), c = R(2, 20); return pick([
    () => inp(`<p>Hình tam giác có ba cạnh ${a} cm, ${b} cm, ${c} cm. Tính chu vi (cm).</p>${vShape4('tg')}`, a + b + c, `${a} + ${b} + ${c} = ${a + b + c} (cm)`),
    () => inp(`<p>Hình chữ nhật dài ${a} cm, rộng ${b} cm. Tính chu vi (cm).</p>${vShape4('cn')}`, (a + b) * 2, `(${a} + ${b}) × 2 = ${(a + b) * 2} (cm)`),
    () => inp(`<p>Hình vuông cạnh ${b} cm. Tính chu vi (cm).</p>${vShape4('vuong')}`, b * 4, `${b} × 4 = ${b * 4} (cm)`),
    () => inp(`<p class="wp">Một mảnh vườn hình vuông có chu vi ${b * 4} m. Tính độ dài cạnh mảnh vườn (m).</p>`, b, steps(`${b * 4} : 4 = ${b} (m)`))
  ])(); } },

{ id: 'b51', so: 51, title: 'Diện tích của một hình. Xăng-ti-mét vuông', game: 'fish',
  memo: 'Xăng-ti-mét vuông (cm²) là diện tích hình vuông cạnh 1 cm.',
  learn: [
    { t: 'Diện tích', h: `${vGrid(4, 3)}<p>Hình chữ nhật gồm 12 ô vuông 1 cm². Diện tích hình là <b>12 cm²</b>.</p><p class="tip">cm² đọc là xăng-ti-mét vuông.</p>` }
  ],
  gen() { const w = R(2, 8), h = R(2, 4); return pick([
    () => inp(`<p>Hình dưới đây có diện tích bao nhiêu xăng-ti-mét vuông?</p>${vGrid(w, h)}`, w * h, `Đếm được ${w * h} ô vuông 1 cm².`),
    () => { const a = R(10, 90), b = R(5, 50); return calcQ(a, b, '+', { unit: 'cm²' }); },
    () => { const A = w * h, B = R(2, 8) * R(2, 4); return cmpQ(A, B, x => `${x} cm²`); }
  ])(); } },

{ id: 'b52', so: 52, title: 'Diện tích hình chữ nhật, diện tích hình vuông', game: 'balloon',
  memo: 'Diện tích HCN = dài × rộng; diện tích hình vuông = cạnh × cạnh (cùng đơn vị đo).',
  learn: [
    { t: 'Diện tích hình chữ nhật', h: `${vGrid(5, 3)}<p>Dài 5 cm, rộng 3 cm: diện tích = 5 × 3 = <b>15 cm²</b>.</p><div class="memo">Diện tích hình chữ nhật = chiều dài × chiều rộng.</div>` },
    { t: 'Diện tích hình vuông', h: `${vGrid(4, 4)}<p>Cạnh 4 cm: diện tích = 4 × 4 = <b>16 cm²</b>.</p><div class="memo">Diện tích hình vuông = cạnh × cạnh.</div>` }
  ],
  gen() { const a = R(3, 20), b = R(2, a), c = R(2, 12); return pick([
    () => inp(`<p>Hình chữ nhật dài ${a} cm, rộng ${b} cm. Tính diện tích (cm²).</p>${vShape4('cn')}`, a * b, `${a} × ${b} = ${a * b} (cm²)`),
    () => inp(`<p>Hình vuông cạnh ${c} cm. Tính diện tích (cm²).</p>${vShape4('vuong')}`, c * c, `${c} × ${c} = ${c * c} (cm²)`),
    () => inp(`<p class="wp">Một tờ giấy hình chữ nhật dài ${a} cm, rộng ${b} cm. Tính diện tích tờ giấy.</p>`, a * b, steps(`${a} × ${b} = ${a * b} (cm²)`))
  ])(); } },

{ id: 'b53', so: 53, title: 'Luyện tập chung', game: 'race', mix: ['b50', 'b51', 'b52'] }
]},

{ id: 'c10', no: 10, name: 'Cộng, trừ, nhân, chia trong phạm vi 10 000', hue: 3, lessons: [
{ id: 'b54', so: 54, title: 'Phép cộng trong phạm vi 10 000', game: 'memory',
  memo: 'Đặt tính thẳng hàng, cộng từ phải sang trái.',
  learn: [{ t: 'Đặt tính 2 456 + 3 728', h: `<div class="pair2">${vCol(2456, 3728, '+', '6184')}<div><p>6 + 8 = 14, viết 4 nhớ 1; 5 + 2 = 7, thêm 1 bằng 8; 4 + 7 = 11, viết 1 nhớ 1; 2 + 3 = 5, thêm 1 bằng 6.</p></div></div>` }],
  gen() { const a = R(1000, 7000), b = R(500, 9999 - a); return pick([() => calcQ(a, b, '+', { col: Math.random() < .5 }), () => inp(`<p class="wp">Kho thứ nhất có ${fN(a)} kg thóc, kho thứ hai có ${fN(b)} kg thóc. Cả hai kho có bao nhiêu ki-lô-gam thóc?</p>`, a + b, steps(`${fN(a)} + ${fN(b)} = ${fN(a + b)} (kg)`))])(); } },

{ id: 'b55', so: 55, title: 'Phép trừ trong phạm vi 10 000', game: 'fish',
  memo: 'Đặt tính thẳng hàng, trừ từ phải sang trái, nhớ sang hàng bên trái.',
  learn: [{ t: 'Đặt tính 7 352 − 2 816', h: `<div class="pair2">${vCol(7352, 2816, '−', '4536')}<div><p>2 không trừ được 6, lấy 12 − 6 = 6, nhớ 1… Kết quả <b>${fN(4536)}</b>.</p></div></div>` }],
  gen() { const a = R(2000, 9999), b = R(500, a - 100); return pick([() => calcQ(a, b, '-', { col: Math.random() < .5 }), () => inp(`<p class="wp">Một cửa hàng có ${fN(a)} quyển vở, đã bán ${fN(b)} quyển. Hỏi còn lại bao nhiêu quyển vở?</p>`, a - b, steps(`${fN(a)} − ${fN(b)} = ${fN(a - b)} (quyển)`))])(); } },

{ id: 'b56', so: 56, title: 'Nhân số có bốn chữ số với số có một chữ số', game: 'balloon',
  memo: 'Nhân lần lượt từ phải sang trái, nhớ sang hàng bên trái.',
  learn: [{ t: 'Đặt tính 1 234 × 4', h: `<div class="pair2">${vCol(1234, 4, '×', '4936')}<div><p>4 × 4 = 16, viết 6 nhớ 1; 4 × 3 = 12, thêm 1 = 13, viết 3 nhớ 1; 4 × 2 = 8, thêm 1 = 9; 4 × 1 = 4.</p></div></div>` }],
  gen() { const b = R(2, 9), a = R(1000, Math.floor(9999 / b)); return calcQ(a, b, '×', { col: Math.random() < .5 }); } },

{ id: 'b57', so: 57, title: 'Chia số có bốn chữ số cho số có một chữ số', game: 'race',
  memo: 'Chia từ trái sang phải; số dư luôn bé hơn số chia.',
  learn: [{ t: 'Ví dụ', h: `<p class="eq">${fN(6369)} : 3 = ${fN(2123)}</p><p class="eq">${fN(1276)} : 4 = 319</p><p>1 bé hơn 4 nên lấy 12 chia 4.</p>` }],
  gen() { const b = R(2, 9), q = R(Math.ceil(1000 / b), Math.floor(9999 / b)); return pick([() => calcQ(b * q, b, ':'), () => inp(`<p class="wp">Có ${fN(b * q)} cây giống chia đều cho ${b} đội. Hỏi mỗi đội nhận được bao nhiêu cây?</p>`, q, steps(`${fN(b * q)} : ${b} = ${fN(q)} (cây)`))])(); } },

{ id: 'b58', so: 58, title: 'Luyện tập chung', game: 'fish', mix: ['b54', 'b55', 'b56', 'b57'] }
]},

{ id: 'c11', no: 11, name: 'Các số đến 100 000', hue: 4, lessons: [
{ id: 'b59', so: 59, title: 'Các số có năm chữ số. Số 100 000', game: 'balloon',
  memo: 'Số có năm chữ số gồm chục nghìn, nghìn, trăm, chục, đơn vị.',
  learn: [
    { t: 'Số có năm chữ số', h: `<div class="scrollx"><table class="tbl"><tr><th>Chục nghìn</th><th>Nghìn</th><th>Trăm</th><th>Chục</th><th>Đơn vị</th></tr><tr><td>4</td><td>2</td><td>3</td><td>1</td><td>6</td></tr></table></div><p>Viết: <b class="hl">${fN(42316)}</b>. Đọc: <i>${docSo(42316)}</i>.</p>` },
    { t: 'Số 100 000', h: `<p>10 chục nghìn = <b>một trăm nghìn</b>, viết là <b class="hl">${fN(100000)}</b>.</p>` }
  ],
  gen() { const n = bigNum(5, 5); return pick([
    () => mc(`<p>Số “<b>${docSo(n)}</b>” viết là:</p>`, fN(n), fill4(n, [n + 1000, n - 100, n + 10000 < 100000 ? n + 10000 : n - 10000], 10000, 99999), fN(n)),
    () => { const c = new Set([docSo(n)]); [n + 1000, n + 10, n - 100].forEach(v => c.add(docSo(v))); return mc(`<p>Số <b class="hl">${fN(n)}</b> đọc là:</p>`, docSo(n), [...c].slice(0, 4), `${fN(n)}: ${docSo(n)}.`); },
    () => { const s = String(n), i = R(0, 4); return mc(`<p>Trong số <b>${fN(n)}</b>, chữ số thứ ${i + 1} từ trái sang (<b class="hl">${s[i]}</b>) thuộc hàng nào?</p>`, HANG[4 - i], HANG, `Hàng ${HANG[4 - i]}.`); }
  ])(); } },

{ id: 'b60', so: 60, title: 'So sánh các số trong phạm vi 100 000', game: 'sort', sort: [10000, 99999],
  memo: 'So sánh từng hàng từ trái sang phải.',
  learn: [{ t: 'So sánh', h: `<p class="eq">${fN(9999)} &lt; ${fN(10000)} &nbsp; ${fN(56123)} &gt; ${fN(55987)}</p>` }],
  gen() { return pick([
    () => { const a = bigNum(5, 5), b = pick([bigNum(4, 5), a + R(1, 9) * 100, a]); return cmpQ(a, Math.min(99999, b)); },
    () => { const s = [...new Set(Array.from({ length: 6 }, () => bigNum(5, 5)))].slice(0, 4); const big = Math.random() < .5; const v = big ? Math.max(...s) : Math.min(...s); return mc(`<p>Số <b>${big ? 'lớn nhất' : 'bé nhất'}</b> là:</p>`, fN(v), s.map(fN), fN(v)); }
  ])(); } },

{ id: 'b61', so: 61, title: 'Làm tròn số đến hàng nghìn, hàng chục nghìn', game: 'fish',
  memo: 'Nhìn chữ số ngay bên phải hàng cần làm tròn.',
  learn: [{ t: 'Ví dụ', h: `<p>${fN(42372)} làm tròn đến hàng nghìn: chữ số hàng trăm là 3 &lt; 5 → <b>${fN(42000)}</b>.</p><p>${fN(42372)} làm tròn đến hàng chục nghìn: chữ số hàng nghìn là 2 &lt; 5 → <b>${fN(40000)}</b>.</p>` }],
  gen() { const n = bigNum(5, 5); return pick([
    () => { const r = Math.round(n / 1000) * 1000; return mc(`<p>Làm tròn <b>${fN(n)}</b> đến hàng nghìn:</p>`, fN(r), fill4(r, [r + 1000, r - 1000, Math.round(n / 100) * 100].filter(x => x !== r)), `Chữ số hàng trăm là ${String(n)[2]}.`); },
    () => { const r = Math.round(n / 10000) * 10000; return mc(`<p>Làm tròn <b>${fN(n)}</b> đến hàng chục nghìn:</p>`, fN(r), fill4(r, [r + 10000, r - 10000, Math.round(n / 1000) * 1000].filter(x => x !== r && x >= 0)), `Chữ số hàng nghìn là ${String(n)[1]}.`); }
  ])(); } },

{ id: 'b62', so: 62, title: 'Luyện tập chung', game: 'race', mix: ['b59', 'b60', 'b61'] }
]},

{ id: 'c12', no: 12, name: 'Cộng, trừ trong phạm vi 100 000', hue: 5, lessons: [
{ id: 'b63', so: 63, title: 'Phép cộng trong phạm vi 100 000', game: 'memory',
  memo: 'Đặt tính thẳng hàng, cộng từ phải sang trái.',
  learn: [{ t: 'Đặt tính', h: `<div class="pair2">${vCol(35467, 27819, '+', '63286')}</div>` }],
  gen() { const a = R(10000, 70000), b = R(1000, 99999 - a); return pick([() => calcQ(a, b, '+', { col: Math.random() < .5 }), () => inp(`<p class="wp">Huyện A có ${fN(a)} người, huyện B có ${fN(b)} người. Cả hai huyện có bao nhiêu người?</p>`, a + b, steps(`${fN(a)} + ${fN(b)} = ${fN(a + b)} (người)`))])(); } },

{ id: 'b64', so: 64, title: 'Phép trừ trong phạm vi 100 000', game: 'fish',
  memo: 'Đặt tính thẳng hàng, trừ từ phải sang trái.',
  learn: [{ t: 'Đặt tính', h: `<div class="pair2">${vCol(85362, 47528, '−', '37834')}</div>` }],
  gen() { const a = R(20000, 99999), b = R(1000, a - 1000); return pick([() => calcQ(a, b, '-', { col: Math.random() < .5 }), () => inp(`<p class="wp">Một nhà máy cần làm ${fN(a)} sản phẩm, đã làm được ${fN(b)} sản phẩm. Hỏi còn phải làm bao nhiêu sản phẩm?</p>`, a - b, steps(`${fN(a)} − ${fN(b)} = ${fN(a - b)} (sản phẩm)`))])(); } },

{ id: 'b65', so: 65, title: 'Luyện tập chung', game: 'balloon', mix: ['b63', 'b64'] }
]},

{ id: 'c13', no: 13, name: 'Xem đồng hồ. Tháng – năm. Tiền Việt Nam', hue: 6, lessons: [
{ id: 'b66', so: 66, title: 'Xem đồng hồ. Tháng – năm', game: 'race',
  memo: 'Đọc giờ chính xác đến từng phút. Một năm có 12 tháng.',
  learn: [
    { t: 'Xem giờ chính xác đến phút', h: `<div class="row-c">${vClock(8, 17, 150)}</div><p>Kim ngắn quá số 8, kim dài chỉ quá vạch số 3 thêm 2 vạch nhỏ: <b>8 giờ 17 phút</b>.</p><p class="tip">Mỗi vạch nhỏ là 1 phút. Từ số này đến số kế tiếp là 5 phút.</p>` },
    { t: 'Kém', h: `<div class="row-c">${vClock(9, 50, 150)}</div><p>9 giờ 50 phút còn gọi là <b>10 giờ kém 10 phút</b>.</p>` },
    { t: 'Tháng – năm', h: `${vCal(2026, 2)}<p>Một năm có <b>12 tháng</b>. Tháng 2 có 28 hoặc 29 ngày; các tháng 4, 6, 9, 11 có 30 ngày; các tháng còn lại có 31 ngày.</p>` }
  ],
  gen() { const h = R(1, 12), m = R(1, 11) * 5 + pick([0, 0, 1, 2, 3, 4]) % 5; const lab = (a, b) => b ? `${a} giờ ${b} phút` : `${a} giờ`; return pick([
    () => mc(`<p>Đồng hồ chỉ mấy giờ?</p><div class="row-c">${vClock(h, m)}</div>`, lab(h, m), [lab(h, m), lab(h % 12 + 1, m), lab(h, (m + 5) % 60), lab(h, Math.max(1, (m + 50) % 60))], `Kim ngắn quá số ${h}, kim dài chỉ ${m} phút.`),
    () => { const mm = pick([40, 45, 50, 55]); return mc(`<p><b>${h} giờ ${mm} phút</b> còn gọi là:</p>`, `${h % 12 + 1} giờ kém ${60 - mm} phút`, [`${h % 12 + 1} giờ kém ${60 - mm} phút`, `${h} giờ kém ${60 - mm} phút`, `${h % 12 + 1} giờ kém ${mm} phút`], `Còn ${60 - mm} phút nữa là ${h % 12 + 1} giờ.`); },
    () => { const mo = R(1, 12); const d = new Date(2026, mo, 0).getDate(); return inp(`<p>Tháng ${mo} năm 2026 có bao nhiêu ngày?</p>`, d, `Tháng ${mo} có ${d} ngày.`); },
    () => inp('<p>Một năm có mấy tháng?</p>', 12, 'Một năm có 12 tháng.')
  ])(); } },

{ id: 'b68', so: 68, title: 'Tiền Việt Nam', game: 'fish',
  memo: 'Các tờ tiền: 1 000, 2 000, 5 000, 10 000, 20 000, 50 000, 100 000 đồng.',
  learn: [
    { t: 'Các tờ tiền', h: `${vMoney([1000, 2000, 5000, 10000, 20000, 50000, 100000])}<p>Đơn vị tiền Việt Nam là <b>đồng</b>.</p>` },
    { t: 'Đổi tiền, mua hàng', h: `<p>1 tờ 10 000 đồng đổi được 2 tờ 5 000 đồng hoặc 5 tờ 2 000 đồng.</p><p>Mua bút giá 8 000 đồng, đưa 10 000 đồng, được trả lại 2 000 đồng.</p>` }
  ],
  gen() { return pick([
    () => { let L; do { L = Array.from({ length: R(2, 3) }, () => pick([1000, 2000, 5000, 10000, 20000])); } while (L.reduce((a, b) => a + b) > 100000); const s = L.reduce((a, b) => a + b); return inp(`<p>Có tất cả bao nhiêu tiền?</p>${vMoney(L)}`, s, `${L.map(fN).join(' + ')} = ${fN(s)} (đồng)`); },
    () => { const p = R(2, 19) * 1000, g = p < 10000 ? 10000 : p < 20000 ? 20000 : 50000; return inp(`<p class="wp">Mai mua quyển truyện giá ${fN(p)} đồng, đưa cô bán hàng tờ ${fN(g)} đồng. Cô trả lại Mai bao nhiêu tiền?</p>${vMoney([g])}`, g - p, steps(`${fN(g)} − ${fN(p)} = ${fN(g - p)} (đồng)`)); },
    () => { const c = pick([[10000, 5000, 2], [10000, 2000, 5], [20000, 10000, 2], [50000, 10000, 5], [100000, 50000, 2], [5000, 1000, 5]]); return inp(`<p>1 tờ ${fN(c[0])} đồng đổi được mấy tờ ${fN(c[1])} đồng?</p>${vMoney([c[0]])}`, c[2], `${fN(c[1])} × ${c[2]} = ${fN(c[0])}`); },
    () => { const p = R(2, 9) * 1000, n = R(2, 5); return inp(`<p class="wp">Mỗi quyển vở giá ${fN(p)} đồng. Mua ${n} quyển hết bao nhiêu tiền?</p>`, p * n, steps(`${fN(p)} × ${n} = ${fN(p * n)} (đồng)`)); }
  ])(); } },

{ id: 'b69', so: 69, title: 'Luyện tập chung', game: 'balloon', mix: ['b66', 'b68'] }
]},

{ id: 'c14', no: 14, name: 'Nhân, chia trong phạm vi 100 000', hue: 1, lessons: [
{ id: 'b70', so: 70, title: 'Nhân số có năm chữ số với số có một chữ số', game: 'memory',
  memo: 'Nhân lần lượt từ phải sang trái, nhớ sang hàng bên trái.',
  learn: [{ t: 'Đặt tính 12 035 × 3', h: `<div class="pair2">${vCol(12035, 3, '×', '36105')}</div>` }],
  gen() { const b = R(2, 9), a = R(10000, Math.floor(99999 / b)); return pick([() => calcQ(a, b, '×', { col: Math.random() < .5 }), () => inp(`<p class="wp">Mỗi xe chở ${fN(a)} kg hàng. Hỏi ${b} xe chở được bao nhiêu ki-lô-gam?</p>`, a * b, steps(`${fN(a)} × ${b} = ${fN(a * b)} (kg)`))])(); } },

{ id: 'b71', so: 71, title: 'Chia số có năm chữ số cho số có một chữ số', game: 'fish',
  memo: 'Chia từ trái sang phải; số dư bé hơn số chia.',
  learn: [{ t: 'Ví dụ', h: `<p class="eq">${fN(37648)} : 4 = ${fN(9412)}</p><p>3 bé hơn 4 nên lấy 37 chia 4 được 9, dư 1…</p>` }],
  gen() { const b = R(2, 9), q = R(Math.ceil(10000 / b), Math.floor(99999 / b)); return pick([() => calcQ(b * q, b, ':'), () => { const r = R(1, b - 1); return b * q + r > 99999 ? calcQ(b * q, b, ':') : inp(`<p>Tìm số dư: <span class="eq">${fN(b * q + r)} : ${b}</span></p>`, r, `${fN(b * q + r)} : ${b} = ${fN(q)} (dư ${r})`); }])(); } },

{ id: 'b72', so: 72, title: 'Luyện tập chung', game: 'race', mix: ['b70', 'b71'] }
]},

{ id: 'c15', no: 15, name: 'Làm quen với yếu tố thống kê, xác suất', hue: 2, lessons: [
{ id: 'b73', so: 73, title: 'Thu thập, phân loại, ghi chép số liệu. Bảng số liệu', game: 'balloon',
  memo: 'Ghi số liệu vào bảng để dễ đọc, so sánh và tính toán.',
  learn: [
    { t: 'Bảng số liệu', h: `<div class="scrollx"><table class="tbl"><tr><th>Lớp</th><th>3A</th><th>3B</th><th>3C</th></tr><tr><th>Số cây trồng</th><td>45</td><td>52</td><td>38</td></tr></table></div><p>Lớp 3B trồng nhiều cây nhất (52 cây). Cả ba lớp trồng 45 + 52 + 38 = 135 cây.</p>` }
  ],
  gen() { const cls = ['3A', '3B', '3C', '3D'], v = cls.map(() => R(20, 60)); const t = `<div class="scrollx"><table class="tbl"><tr><th>Lớp</th>${cls.map(c => `<th>${c}</th>`).join('')}</tr><tr><th>Số cây trồng</th>${v.map(x => `<td>${x}</td>`).join('')}</tr></table></div>`; return pick([
    () => { const i = R(0, 3); return inp(`${t}<p>Lớp ${cls[i]} trồng được bao nhiêu cây?</p>`, v[i], `Đọc trong bảng: ${v[i]}.`); },
    () => { const big = Math.random() < .5; const x = big ? Math.max(...v) : Math.min(...v); return mc(`${t}<p>Lớp nào trồng được <b>${big ? 'nhiều' : 'ít'}</b> cây nhất?</p>`, cls[v.indexOf(x)], cls, `${cls[v.indexOf(x)]}: ${x} cây.`); },
    () => inp(`${t}<p>Cả bốn lớp trồng được bao nhiêu cây?</p>`, v.reduce((a, b) => a + b), `${v.join(' + ')} = ${v.reduce((a, b) => a + b)}`),
    () => { const [i, j] = v[0] >= v[1] ? [0, 1] : [1, 0]; return inp(`${t}<p>Lớp ${cls[i]} trồng nhiều hơn lớp ${cls[j]} bao nhiêu cây?</p>`, v[i] - v[j], `${v[i]} − ${v[j]} = ${v[i] - v[j]}`); }
  ])(); } },

{ id: 'b74', so: 74, title: 'Khả năng xảy ra của một sự kiện', game: 'race',
  memo: 'Chắc chắn, có thể, không thể.',
  learn: [
    { t: 'Ba khả năng', h: `<div class="row-c">${vBox(Array(5).fill('🔴'))}${vBox(['🔴', '🔵', '🔴', '🔵', '🔴'])}</div><p>Hộp 1: lấy được bóng đỏ là <b>chắc chắn</b>; lấy được bóng xanh là <b>không thể</b>.</p><p>Hộp 2: lấy được bóng xanh là <b>có thể</b>.</p>` }
  ],
  gen() { const C = ['chắc chắn', 'có thể', 'không thể']; return pick([
    () => { const allR = Math.random() < .5, blue = Math.random() < .5; const ans = allR ? (blue ? 'không thể' : 'chắc chắn') : 'có thể'; return mc(`<p>Lấy 1 quả bóng từ hộp. Việc lấy được bóng <b>${blue ? 'xanh' : 'đỏ'}</b> là:</p>${vBox(allR ? Array(5).fill('🔴') : ['🔴', '🔵', '🔴', '🔵', '🔴'])}`, ans, C, allR ? 'Hộp chỉ có bóng đỏ.' : 'Hộp có cả bóng đỏ và xanh.'); },
    () => { const e = pick([['Gieo xúc xắc được mặt 7 chấm', 'không thể'], ['Gieo xúc xắc được mặt 2 chấm', 'có thể'], ['Tung đồng xu được mặt sấp', 'có thể'], ['Sau ngày thứ Bảy là Chủ nhật', 'chắc chắn'], ['Một tuần có 8 ngày', 'không thể']]); return mc(`<p>Sự kiện sau là chắc chắn, có thể hay không thể xảy ra?</p><p class="wp">${e[0]}.</p>`, e[1], C, `Sự kiện này ${e[1]} xảy ra.`); }
  ])(); } },

{ id: 'b76', so: 76, title: 'Luyện tập chung', game: 'fish', mix: ['b73', 'b74'] }
]},

{ id: 'c16', no: 16, name: 'Ôn tập cuối năm', hue: 7, lessons: [
{ id: 'on2', so: '77–84', title: 'Ôn tập cuối năm', game: 'race', mixTopics: ['c8', 'c9', 'c10', 'c11', 'c12', 'c13', 'c14', 'c15'] }
]}
]}
];

/* Gắn bài luyện tập chung / ôn tập */
BOOK.forEach(t => t.topics.forEach(tp => tp.lessons.forEach(l => { BYID_RAW[l.id] = l; l.topicRef = tp; })));
BOOK.forEach(t => t.topics.forEach(tp => tp.lessons.forEach(l => {
  let ids = null;
  if (l.mix) ids = l.mix;
  if (l.mixTopics) ids = BOOK.flatMap(b => b.topics).filter(x => l.mixTopics.includes(x.id)).flatMap(x => x.lessons).filter(x => !x.mix && !x.mixTopics).map(x => x.id);
  if (!ids) return;
  l.mixIds = ids;
  l.gen = () => BYID_RAW[pick(ids)].gen();
  l.memo = 'Ôn lại các bài đã học.';
  l.learn = [{ t: 'Nhớ lại kiến thức', h: `<p>Trong phần này con sẽ ôn lại:</p>${memoList(l.mixIds.slice(0, 10))}${l.mixIds.length > 10 ? `<p class="tip">… và ${l.mixIds.length - 10} bài khác.</p>` : ''}` }];
})));
