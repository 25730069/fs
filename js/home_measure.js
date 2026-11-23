/* ===== 화면 1: 튜토리얼 · 홈 · 사이즈 측정(2단계) · 분석 결과 ===== */
const ACT = {}, INP = {}, CHG = {};
const topbar = (title, o = {}) => `<div class="topbar"><button class="ib" data-a="${o.act || (o.left === 'close' ? 'backConfirm' : 'back')}" aria-label="뒤로" ${stack.length <= 1 && !o.act ? 'style="visibility:hidden" tabindex="-1"' : ''}>${ico('back')}</button><h2>${esc(title)}</h2><div>${o.right || ''}</div></div>`;
const chipsHTML = (arr, cur, act, extra = '') => arr.map(x => `<button class="chip ${(Array.isArray(cur) ? cur.includes(x) : cur === x) ? 'on' : ''}" data-a="${act}" data-v="${esc(x)}" ${extra}>${esc(x)}</button>`).join('');
const segHTML = (arr, cur, act, cls = '') => `<div class="seg ${cls}">${arr.map(x => `<button class="${cur === x ? 'on' : ''}" data-a="${act}" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div>`;
const num = v => (v === '' || v == null || isNaN(+v)) ? '' : +v;
const pillV = v => `<span class="pill ${v}">${VLABEL[v]}</span>`;
const stars = n => `<span class="stars" aria-label="별점 ${n}점">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</span>`;
const nick = () => S.profile.nick;
const NICKS = ['핏유저', '스타일러', '데일리룩', '옷덕후', '모던핏', '베이직러', '코디왕', '오늘뭐입지'], UIDP = ['fit', 'style', 'daily', 'mood', 'basic', 'wear'];
const nickOfU = k => (DB.NK && DB.NK[k]) || NICKS[hash(k + 'n') % NICKS.length] + (hash(k + 'm') % 90 + 10), uidOf = k => (DB.HD && DB.HD[k]) || UIDP[hash(k) % UIDP.length] + '_' + (hash(k + 'i') % 9000 + 1000);

/* ---------- 바디 프로필 폼(측정 1단계 · 마이핏 공용) ---------- */
let BD = {};
const loadBD = () => { BD = S.body ? { ...S.body } : { h: '', w: '', pref: '기본 핏' }; };
const DETAILS = [['sho', '어깨너비', '어깨'], ['chest', '가슴둘레', '가슴'], ['waist', '허리둘레', '허리'], ['hip', '엉덩이둘레', '힙'], ['thigh', '허벅지둘레', '허벅지'], ['arm', '팔길이', '소매']];
const bdCount = () => DETAILS.filter(d => BD[d[0]] !== undefined && BD[d[0]] !== '' && BD[d[0]] !== null).length;
function bodyFormHTML() {
  const bv = bodyVals(BD), n = bdCount();
  const f = (k, label, unit, ph) => `<div><label class="f" for="bd-${k}">${label}</label><div class="unit"><input id="bd-${k}" class="inp num" inputmode="decimal" data-i="bd" data-k="${k}" value="${esc(BD[k] ?? '')}" placeholder="${ph}"><i>${unit}</i></div></div>`;
  return `<div class="grid2 field">${f('h', '키 *', 'cm', '160')}${f('w', '몸무게 *', 'kg', '52')}</div>
  <div class="detail-card field"><div class="row between"><b style="font-size:17px">세부 치수</b><button class="btn s" data-a="measureHow">재는 법 ⓘ</button></div>
    <div class="row mt8" style="gap:10px"><div class="meter grow"><i id="bd-mt" style="width:${n / 6 * 100}%"></i></div><b class="sm num" id="bd-n">${n}/6</b></div>
    <div style="height:12px"></div>
    <div class="grid2">${DETAILS.map(d => f(d[0], d[1], 'cm', '추정 ' + bv[d[2]])).join('')}</div></div>
  <div class="field"><label class="f">선호 핏</label>${segHTML(PREFS, BD.pref || '기본 핏', 'bdPref')}</div>`;
}
INP.bd = t => { BD[t.dataset.k] = t.value; if (t.dataset.k !== 'h' && t.dataset.k !== 'w') { const n = bdCount(); $('#bd-n').textContent = n + '/6'; $('#bd-mt').style.width = n / 6 * 100 + '%'; } };
ACT.bdPref = t => { BD.pref = t.dataset.v; reRender(); };
ACT.measureHow = () => sheet(`<h3>치수 재는 법</h3><div class="list" style="margin:8px -16px 0">${[['어깨너비', '양쪽 어깨 끝점 사이를 일직선으로'], ['가슴둘레', '가슴이 가장 풍만한 곳을 한 바퀴'], ['허리둘레', '배꼽 위 가장 잘록한 곳을 한 바퀴'], ['엉덩이둘레', '엉덩이 가장 튀어나온 곳을 한 바퀴'], ['허벅지둘레', '다리가 갈라지는 지점 바로 아래'], ['팔길이', '어깨 끝에서 손목뼈까지']].map(([a, b]) => `<div class="li" style="padding:10px 16px"><b class="sm" style="width:80px">${a}</b><span class="sm mute">${b}</span></div>`).join('')}</div><button class="btn pri full mt16" data-a="sheetClose">확인</button>`);
function photoCardHTML() {
  const ph = S.bodyPhoto;
  return `<div class="card" style="padding:14px"><div class="row" style="gap:12px;align-items:flex-start"><label class="upload" for="bphoto" style="width:96px;height:128px;flex:none;border-radius:12px;cursor:pointer">${ph ? `<img src="${ph}" alt="내 전신 사진">` : `<span>${ico('plus', 'ico')}<br><span class="xs">전신 사진</span></span>`}</label>
  <input id="bphoto" type="file" accept="image/*" hidden data-c="bPhoto"><div class="grow"><b>전신 사진 <span class="mute sm">(선택)</span></b>
  
  ${ph ? `<div class="row" style="gap:6px"><label class="btn s" for="bphoto" style="cursor:pointer">교체</label><button class="btn s flat" data-a="bPhotoDel">삭제</button></div>` : ``}</div></div></div>`;
}
CHG.bPhoto = t => { const f = t.files[0]; if (f) readPhoto(f, 640, d => { if (!d) return; const id = addPhoto('전신', d); S.bodyPhoto = d; S.bodyPhotoId = id; save(); reRender(); }); };
ACT.bPhotoDel = () => { if (S.bodyPhotoId) delPhoto(S.bodyPhotoId); else { S.bodyPhoto = null; save(); } toast('전신 사진을 삭제했어요'); reRender(); };
ACT.goPhotos = () => { PH = { kind: '전신', f: '전체' }; go('photos'); };
function commitBody() {
  const h = +BD.h, w = +BD.w;
  if (!(h >= 120 && h <= 210) || !(w >= 30 && w <= 150)) { toast('키(120~210)와 몸무게(30~150)를 확인해 주세요'); return false; }
  const nb = { h, w, sho: num(BD.sho), chest: num(BD.chest), waist: num(BD.waist), hip: num(BD.hip), thigh: num(BD.thigh), arm: num(BD.arm), pref: BD.pref || '기본 핏' };
  const same = S.body && ['h', 'w', 'sho', 'chest', 'waist', 'hip', 'thigh', 'arm', 'pref'].every(k => (S.body[k] ?? '') === (nb[k] ?? ''));
  if (!same) { if (S.body) S.bodyHistory.unshift({ ...S.body }); S.bodyHistory = S.bodyHistory.slice(0, 5); nb.updated = today(); } else nb.updated = S.body.updated;
  S.body = nb; seedRecords(); save(); return true;
}

/* ---------- 튜토리얼: 사이즈 측정에 들어가기 전에 따로 한 번 ---------- */
const TUT = [
  { t: '1. 내 바디 프로필을<br>입력해요', d: '키·몸무게와 세부 치수, 전신 사진을 한 번 저장해 두면 다음부터 자동으로 불러와요.', i: 'b' },
  { t: '2. 옷의 사이즈표를<br>올려요', d: '브랜드를 고르고 사이즈표 사진을 올리면 AI가 실측을 읽어요. 우리 DB에 있는 상품은 골라서 바로 분석해요.', i: 'c' },
  { t: '3. 사이즈별 의견을<br>확인해요', d: '가장 잘 맞는 사이즈를 먼저 알려주고, 다른 사이즈는 어떤지도 부위별로 볼 수 있어요.', i: 'd' }
];
function tutIllu(k) {
  if (k === 'b') return `<div style="width:236px" class="card pad"><div class="grid2"><div><div class="xs mute">키</div><div class="inp row" style="pointer-events:none">162 cm</div></div><div><div class="xs mute">몸무게</div><div class="inp row" style="pointer-events:none">53 kg</div></div></div><div class="detail-card mt12" style="padding:10px"><div class="b sm">세부 치수 3/6</div><div class="meter mt8"><i style="width:50%"></i></div></div></div>`;
  if (k === 'c') return `<div class="row" style="gap:12px"><div class="ph" style="width:96px;height:130px"><span>이미지</span></div><div class="card" style="width:112px;padding:10px;font-size:11px"><div class="b">브랜드</div><div class="inp" style="height:28px;font-size:11px;display:flex;align-items:center;pointer-events:none">유니</div><div class="mt8 b">유니클로</div><div class="mute">상품 불러오기(선택)</div></div></div>`;
  return `<div style="width:190px">${fitSVG('상의', evalSize('상의', { 어깨: 41, 가슴: 100, 소매: 58, 총장: 62 }, bodyVals({ h: 162, w: 53 }), '기본 핏').rows, 162)}</div>`;
}
let T = { step: 0, hide: false };
V.tutorial = () => {
  const s = T.step, d = TUT[s];
  return `<div class="tut"><div class="row between" style="padding:6px 8px 0 4px"><button class="ib" data-a="back" aria-label="닫기">${ico('close')}</button><span class="xs mute b">${s + 1} / ${TUT.length}</span><button class="link" data-a="tutSkip" style="padding:0 12px">건너뛰기</button></div>
  <div class="illu">${tutIllu(d.i)}</div>
  <div class="pad" style="padding-top:8px;text-align:center"><h1 class="big">${d.t}</h1><p class="sub">${d.d}</p></div>
  <div style="margin-top:auto;padding:16px"><div class="dots" style="margin-bottom:14px">${TUT.map((_, i) => `<i class="${i === s ? 'on' : ''}"></i>`).join('')}</div>
  <button class="row" role="checkbox" aria-checked="${T.hide}" data-a="tutHide" style="background:none;border:0;padding:6px 0;margin:0 auto 10px"><span class="cbx ${T.hide ? 'on' : ''}">${T.hide ? '✓' : ''}</span><span class="sm ink2">다시 보지 않기</span></button>
  <div class="row">${s > 0 ? `<button class="btn flat" data-a="tutPrev" style="width:96px">이전</button>` : ''}<button class="btn pri grow" data-a="tutNext">${s === TUT.length - 1 ? '사이즈 측정 시작하기' : '다음'}</button></div></div></div>`;
};
ACT.tutNext = () => { if (T.step >= TUT.length - 1) finishTutorial(); else { T.step++; render(); } };
ACT.tutPrev = () => { T.step = Math.max(0, T.step - 1); render(); };
ACT.tutSkip = () => finishTutorial();
ACT.tutHide = () => { T.hide = !T.hide; reRender(); };
function finishTutorial() { if (T.hide) { S.tutorialHide = true; save(); } goMeasure(1); }
function showTutorial() { T = { step: 0, hide: false }; stack = [{ v: 'home', p: {} }, { v: 'tutorial', p: {} }]; render(); $('#view').scrollTop = 0; }
function goMeasure(step = 1) { if (!M) M = newM(); M.step = step; loadBD(); stack = [{ v: 'home', p: {} }, { v: 'measure', p: {} }]; render(); $('#view').scrollTop = 0; }
ACT.startMeasure = () => { M = newM(); if (S.tutorialHide) goMeasure(1); else showTutorial(); };
ACT.tutAgain = () => showTutorial();

/* ---------- 홈 ---------- */
let HSZ = 'M';
function brandsRanked() { return BR.map(x => ({ x, st: brandStat(x.id), sim: similarBrandPct(x.id, S.body) })).sort((a, c) => ((c.sim?.pct ?? c.st.pct) - (a.sim?.pct ?? a.st.pct))); }
function brandsBySize(sz) {
  return BR.map(b => { const rs = PR.filter(p => p.b === b.id).flatMap(p => revByProd[p.id] || []).filter(r => r.sz === sz); return { b, n: rs.length, pct: rs.length ? Math.round(rs.filter(r => r.op === '정사이즈').length / rs.length * 100) : 0 }; }).filter(x => x.n >= 3).sort((a, c) => c.pct - a.pct).slice(0, 3);
}
const popularProducts = () => PR.filter(genderOk).sort((a, b) => (revByProd[b.id]?.length || 0) - (revByProd[a.id]?.length || 0) || a.id.localeCompare(b.id)).slice(0, 8);
const dots = p => `<span class="cdots">${(p.col || []).slice(0, 5).map(cdot).join('')}</span>`;
const miniCard = (p, extra) => `<button class="mini" data-a="openProduct" data-v="${p.id}"><div class="ph"><span>이미지</span>${pimg(p.id)}</div><div class="sm b mt8 ellip">${esc(brandById[p.b].n)}</div><div class="sm clamp2">${esc(p.n)}</div><div class="num b" style="margin-top:2px">${won(p.pr)}</div>${ratingLine(p.id) ? `<div class="xs" style="margin-top:2px">${ratingLine(p.id)}</div>` : ''}${extra || ''}</button>`;
const brandCard = ({ x, st, sim }) => { const tn = brandTend(x.id); return `<button class="card bcard" data-a="openBrand" data-v="${x.id}"><span class="logo im">이미지${bimg(x.id)}</span><b class="mt8 ellip" style="display:block">${esc(x.n)}</b><span class="pill ok mt8">체형 일치 ${sim ? sim.pct : st.pct}%</span><span class="pill ${tn.cls}" style="margin-top:4px">${tn.label}</span></button>`; };
const brandRowHTML = ({ x, st, sim }, note) => { const tn = brandTend(x.id); return `<button class="brand-row" data-a="openBrand" data-v="${x.id}"><span class="logo im">이미지${bimg(x.id)}</span><span class="grow"><b>${esc(x.n)}</b><span class="sm mute" style="display:block">${note || (sim ? `비슷한 체형 후기 ${sim.n}건` : `전체 후기 ${st.rv}건`)}</span></span><span class="col" style="align-items:flex-end;gap:4px"><span class="pill ok">체형 일치 ${sim ? sim.pct : st.pct}%</span><span class="pill ${tn.cls}">${tn.label}</span></span></button>`; };
const avgRt = id => { const rs = revByProd[id] || []; return rs.length ? { a: (rs.reduce((x, r) => x + r.rt, 0) / rs.length).toFixed(1), n: rs.length } : null; };
const ratingLine = id => { const r = avgRt(id); return r ? `<span class="rt"><i>★</i> ${r.a} <span class="mute">(${r.n})</span></span>` : ''; };
const QUICK = CATS;
function mySizeCard() {
  const b = S.body, last = {}; [...S.records].sort((x, y) => y.date.localeCompare(x.date)).forEach(r => { if (!last[r.cat]) last[r.cat] = r; });
  const latest = [...S.records].sort((x, y) => y.date.localeCompare(x.date))[0];
  return `<div class="card fill" style="padding:14px"><div class="row between"><b>내 사이즈</b><button class="link" data-a="goMyfit" style="text-decoration:none">${b.h}cm · ${b.w}kg ›</button></div>
  <div class="row" style="gap:8px;margin-top:10px">${['상의', '하의', '원피스'].map(c => `<div style="flex:1;background:var(--s0);border-radius:10px;padding:8px;text-align:center"><div class="xs mute">${c}</div><b style="font-size:17px">${last[c] ? last[c].rec : '–'}</b></div>`).join('')}</div>
  ${latest ? `<button class="link xs" data-a="openRecord" data-v="${latest.id}" style="text-decoration:none;margin-top:10px;display:block;text-align:left">최근 분석 · ${esc(latest.productName || latest.brandName)} · 추천 ${latest.rec} ›</button>` : `<button class="link xs" data-a="startMeasure" style="text-decoration:none;margin-top:10px">아직 분석한 옷이 없어요</button>`}<button class="btn pri full mt12" data-a="startMeasure">사이즈 측정하기</button></div>`;
}
const homeReview = r => { const pr = prodById[r.p], u = DB.U[r.u]; return `<button class="li" data-a="openReview" data-v="${r.id}" style="align-items:flex-start;padding:12px 16px"><span class="avatar sm">이미지</span><span class="grow" style="min-width:0"><span class="row between"><span><b class="sm">${esc(nickOfU(r.u))}</b> <span class="xs mute">${uidOf(r.u)}</span></span>${stars(r.rt)}</span><span class="xs mute" style="display:block">${u[0]}cm · ${u[1]}kg · ${r.sz} 착용 · ${esc(pr.n)}</span><span class="sm" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-top:3px">${esc(r.t)}</span></span></button>`; };
const szb = sz => sz ? `<span class="szb">${esc(sz)}</span>` : '';
const vdTxt = o => !o ? '' : o.state === 'nofit' ? '맞는 사이즈 없음' : o.state === 'caution' ? `${o.best} · ${o.worst.part} 주의` : `${o.best} 맞아요`;
const vdCls = o => o ? 'v-' + o.state : '';
const pCard = (p, size) => { const o = S.body ? productOutcome(p, S.body) : null; return `<button class="mini" data-a="openProduct" data-v="${p.id}"><div class="ph"><span>이미지</span>${pimg(p.id)}</div><div class="bn6">${esc(brandById[p.b].n)}</div><div class="sm clamp2">${esc(p.n)}</div><div class="num b" style="margin-top:2px">${won(p.pr)}</div>${o ? `<div class="vd ${vdCls(o)}">${vdTxt(o)}</div>` : ''}</button>`; };
const br = t => esc(t).replace(/\n/g, '<br>');
function bannerHTML() {
  const b = S.body, cm = collections(), cs = COLLS.filter(c => cm[c.id].length);
  if (!cs.length) return '';
  return `<div class="hb6"><div class="hb-track" id="hb-track">${cs.map(c => `<button class="hb-s ${c.color}" data-a="openColl" data-v="${c.id}"><span class="hb-sub">${b ? `${b.h} · ${b.w} 기준 ` : ''}${cm[c.id].length}개</span><span class="hb-t">${br(c.t)}</span><span class="hb-go">모아보기 →</span></button>`).join('')}</div><span class="hb-n" id="hb-n">1 / ${cs.length}</span></div>`;
}
let hbTimer = null;
V['home$after'] = () => {
  const t = $('#hb-track'), n = $('#hb-n'); clearInterval(hbTimer); if (!t || !n) return;
  const total = t.children.length, idx = () => Math.round(t.scrollLeft / t.clientWidth), go2 = i => t.scrollTo({ left: ((i % total) + total) % total * t.clientWidth, behavior: 'smooth' });
  t.onscroll = () => { n.textContent = (idx() + 1) + ' / ' + total; };
  /* PC: 마우스로 끌어서 넘기기(터치·트랙패드는 기본 스크롤) */
  let sx = 0, sl = 0, drag = false, moved = false;
  t.onpointerdown = e => { if (e.pointerType !== 'mouse') return; drag = true; moved = false; sx = e.clientX; sl = t.scrollLeft; t.style.scrollSnapType = 'none'; t.style.cursor = 'grabbing'; };
  window.onpointermove = e => { if (!drag) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) moved = true; t.scrollLeft = sl - dx; };
  window.onpointerup = e => { if (!drag) return; drag = false; t.style.cursor = ''; const dx = e.clientX - sx, base = Math.round(sl / t.clientWidth); t.style.scrollSnapType = ''; go2(Math.abs(dx) > 60 ? base + (dx < 0 ? 1 : -1) : base); };
  t.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  /* 자동 전환 5초 (마우스를 올리거나 끌고 있으면 멈춤) */
  let hover = false; t.onmouseenter = () => hover = true; t.onmouseleave = () => hover = false;
  hbTimer = setInterval(() => { if (!document.body.contains(t)) { clearInterval(hbTimer); return; } if (!hover && !drag) go2(idx() + 1); }, 5000);
};
ACT.openColl = t => go('collection', { id: t.dataset.v });
V.collection = p => {
  const c = COLLS.find(x => x.id === p.id), list = collections()[p.id] || [], b = S.body;
  return `${topbar(c.t.replace('\n', ' '))}
  <div class="pad" style="padding-bottom:4px"><span class="sm mute">${b ? `${b.h} · ${b.w} 기준 ` : ''}${list.length}개</span></div>
  <div class="cgrid">${list.slice(0, 40).map(x => pCard(x.p, x.size)).join('') || '<div class="empty">상품이 없어요</div>'}</div><div style="height:24px"></div>`;
};
function myBlock() {
  const b = S.body;
  if (!b) return `<div class="blk blue"><b class="blk-t">내 사이즈</b>
    <div class="row" style="gap:8px;margin-top:12px"><div class="unit grow"><input id="hq-h" class="inp num" inputmode="numeric" aria-label="키" data-i="hq" data-k="h" value="${esc(HQ.h)}" placeholder="키"><i>cm</i></div><div class="unit grow"><input id="hq-w" class="inp num" inputmode="numeric" aria-label="몸무게" data-i="hq" data-k="w" value="${esc(HQ.w)}" placeholder="몸무게"><i>kg</i></div></div>
    <button class="btn pri full mt12" data-a="hqSave">내 사이즈 보기</button></div>`;
  const last = {}; [...S.records].sort((x, y) => y.date.localeCompare(x.date)).forEach(r => { if (!last[r.cat]) last[r.cat] = r; });
  const sz = c => (last[c] ? last[c].rec : '–');
  return `<div class="blk blue row between"><button class="blk-main" data-a="goMyfit"><b class="blk-num">${b.h} · ${b.w}</b><span class="blk-sub">상의 ${sz('상의')} · 하의 ${sz('하의')} · 아우터 ${sz('아우터')}</span></button><button class="btn pri" data-a="startMeasure">측정 →</button></div>`;
}
const talkRow = r => { const u = DB.U[r.u]; return `<button class="talk" data-a="openReview" data-v="${r.id}"><span class="xs mute">${u[0]} · ${u[1]} · ${esc(r.sz)}</span><span class="talk-t">${esc(r.t)}</span><span class="xs mute">답글 <b style="color:var(--ink)">${repN(r)}</b></span></button>`; };
const topTalks = (n = 3) => RV.filter(r => genderOk(prodById[r.p] || {})).map(r => ({ r, n: repN(r) })).sort((a, c) => c.n - a.n || a.r.id.localeCompare(c.r.id)).slice(0, n).map(x => x.r);
V.home = () => {
  const b = S.body, pp = personalProducts(8);
  const top = (() => { const l = [...S.records].sort((x, y) => y.date.localeCompare(x.date)).find(r => r.cat === '상의'); return l ? l.rec : 'M'; })();
  const bs = brandsBySize(top);
  return `${bannerHTML()}${myBlock()}
  <div class="sec" style="padding-top:28px"><div class="sec-h"><h3>${b ? '나와 같은 체형이 산 옷' : '인기 상품'}</h3><button class="link" data-a="plGo" data-pl="${esc(JSON.stringify({}))}">전체</button></div></div>
  ${b ? (pp.length ? carousel('pp', pp.map(x => pCard(x.p, x.size)).join('')) : '<div class="empty" style="padding:16px">비슷한 체형의 후기가 아직 부족해요</div>') : carousel('pop', popularProducts().map(p => pCard(p)).join(''))}
  ${bs.length ? `<div class="sec" style="padding-top:28px"><div class="sec-h"><h3>${top}으로 입기 좋은 브랜드</h3><button class="link" data-a="goTab" data-v="brand">전체</button></div></div><div class="list" style="margin:0 4px">${bs.map(r => `<button class="brand-row" data-a="openBrand" data-v="${r.b.id}"><span class="logo im">이미지${bimg(r.b.id)}</span><span class="grow"><b>${esc(r.b.n)}</b></span><span class="chev">${ico('chev', 'ico')}</span></button>`).join('')}</div>` : ''}
  <div class="sec" style="padding-top:28px"><div class="sec-h"><h3>사이즈 토크</h3></div></div><div style="padding:0 16px">${topTalks().map(talkRow).join('')}</div>
  <div style="height:24px"></div>`;
};
let HQ = { h: '', w: '' };
INP.hq = t => { HQ[t.dataset.k] = t.value.replace(/\D/g, ''); };
ACT.hqSave = () => {
  const h = +HQ.h, w = +HQ.w;
  if (!(h >= 120 && h <= 210) || !(w >= 30 && w <= 150)) { toast('키(120~210)와 몸무게(30~150)를 확인해 주세요'); return; }
  S.body = { h, w, pref: '기본 핏', updated: today() }; seedRecords(); save(); toast('내 체형에 맞춰 추천을 준비했어요'); render();
};
ACT.homeSearch = () => { PL = newPL(); go('plist'); const i = $('#plq'); if (i) i.focus(); };
ACT.goStyleSet = () => { PF = { ...S.profile, styles: [...S.profile.styles] }; go('styles'); };
ACT.carGo = t => { const [id, d] = t.dataset.v.split('|'), h = $('#car-' + id) || $('#' + id); if (h) h.scrollBy({ left: +d * h.clientWidth * .8, behavior: 'smooth' }); };
ACT.hSize = t => { HSZ = t.dataset.v; reRender(); };
ACT.goMyfit = () => { loadBD(); go('myfit'); };
ACT.goBodyForm = () => ACT.goMyfit();
ACT.goTab = t => tab(t.dataset.v);
ACT.goHome = () => tab('home');
ACT.goLikes = () => { if (stack.at(-1).v !== 'likes') go('likes'); };

/* ---------- 사이즈 측정 ---------- */
let M = null;
const newM = (step = 1) => ({ step, cat: '상의', brandId: null, brandFree: false, brandText: '', productId: null, name: '', link: '', photo: null, photoId: null, imgs: [], size: 'M', rows: {}, touched: false, open: false });
const mRows = () => PARTS[M.cat].filter(p => M.rows[p] !== undefined && M.rows[p] !== '').length;
function mReady() { return !!(M.brandId || M.brandFree || M.brandText.trim()) && !!(M.photo || M.productId || mRows() >= 2); }
const stepper = s => `<div class="stepper"><button class="${s === 1 ? 'on' : 'done'}" data-a="mStep" data-v="1">1 사이즈 입력</button><button class="${s === 2 ? 'on' : ''}" data-a="mStep" data-v="2">2 옷 입력</button><div>3 결과</div></div>`;
V.measure = () => {
  if (!M) M = newM();
  if (M.step === 1) {
    return `${topbar('사이즈 측정')}${stepper(1)}<div class="pad"><h1 class="big">내 몸 정보</h1><div class="mt16">${bodyFormHTML()}</div>${photoCardHTML()}</div>
    <div class="dock"><button class="btn pri full" data-a="mNext">다음 · 옷 입력</button></div>`;
  }
  const prods = M.brandId ? PR.filter(p => p.b === M.brandId && p.c === M.cat) : [], parts = PARTS[M.cat], prod = M.productId ? prodById[M.productId] : null;
  return `${topbar('사이즈 측정', { act: 'mBack' })}${stepper(2)}
  <div class="pad" style="padding-bottom:8px">
  <div class="card fill row between" style="padding:11px 14px"><span class="sm"><b>내 신체</b> ${S.body ? `${S.body.h}cm · ${S.body.w}kg · ${esc(S.body.pref)}` : '미입력'}${S.bodyPhoto ? ' · 사진 있음' : ''}</span><button class="link" data-a="mStep" data-v="1">수정</button></div>
  <div class="field mt16"><label class="f">옷 타입</label><div class="chips">${chipsHTML(CATS, M.cat, 'mCat')}</div></div>
  <div class="field" style="position:relative"><label class="f" for="ta">브랜드</label>
    <div class="search"><input id="ta" class="inp" autocomplete="off" placeholder="${M.brandFree ? '(직접 입력)' : '브랜드 검색 (초성 가능 · 예: ㅇㄴㅋㄹ)'}" data-i="ta" value="${esc(M.brandText)}" onfocus="taShow()">${ico('search')}</div>
    <div id="ta-list" hidden></div>
    </div>
  ${prods.length ? `<div class="field"><label class="f" for="msel">상품 불러오기 <span class="mute b sm">선택</span></label><select id="msel" class="inp" data-c="mProd"><option value="">다른 사이트의 상품이에요 (직접 올릴게요)</option>${prods.map(p => `<option value="${p.id}" ${M.productId === p.id ? 'selected' : ''}>${esc(p.n)}</option>`).join('')}</select></div>` : ''}
  ${M.productId && prod ? `<div class="card fill row" style="padding:10px 12px;gap:10px;margin-bottom:16px"><span class="ph" style="width:40px;height:48px;flex:none"><span>이미지</span>${pimg(prod.id)}</span><span class="grow sm"><b>${esc(prod.n)}</b><br><span class="mute">${won(prod.pr)}</span></span></div>` : `
  <div class="field"><div class="row between" style="margin-bottom:5px"><label class="f" style="margin:0">사이즈표 <button class="info" data-a="photoInfo" aria-label="어떤 사진을 올리면 되나요?">i</button></label><span class="pill tight">필수</span></div>
    <label class="upload" for="mphoto" style="cursor:pointer">${M.photo ? `<img src="${M.photo}" alt="첨부한 사이즈표">` : `<span>${ico('plus', 'ico')}<br><b>사진 첨부</b><br><span class="xs mute">상품 상세 페이지의 사이즈표를 캡처해 주세요</span></span>`}</label>
    <input id="mphoto" type="file" accept="image/*" hidden data-c="mPhoto">${M.photo ? `<button class="link mt8" data-a="mPhotoDel">사진 지우기</button>` : ''}</div>
  <div class="field"><div class="row between" style="margin-bottom:5px"><label class="f" style="margin:0">상품 이미지 <button class="info" data-a="imgInfo" aria-label="상품 이미지는 어떻게 올리나요?">i</button></label><span class="pill gray">선택</span></div>
    <div class="phgrid">${(M.imgs || []).map(x => `<div class="phi"><img src="${x.src}" alt="상품 이미지"><button data-a="mImgDel" data-v="${x.id}" aria-label="삭제">×</button></div>`).join('')}${(M.imgs || []).length < 5 ? `<label class="phi add" for="mimgs"><span>${ico('plus', 'ico')}<br>이미지 첨부</span></label>` : ''}</div>
    <input id="mimgs" type="file" accept="image/*" multiple hidden data-c="mImgs"></div>
  <div class="field"><label class="f" for="mlink">상품 페이지 링크 <span class="mute b sm">선택</span></label><input id="mlink" class="inp" inputmode="url" data-i="mM" data-k="link" value="${esc(M.link)}" placeholder="https://…  붙여넣기"></div>
  <div class="acc field"><button data-a="mOpen" aria-expanded="${M.open}"><span>상세 실측 직접 입력</span><span>${M.open ? '−' : '+'}</span></button>
    ${M.open ? `<div class="in"><div class="mdwrap">${measureSVG(M.cat)}</div><label class="f">입력할 사이즈</label><div class="chips mb8" style="margin-bottom:12px">${chipsHTML(SZ, M.size, 'mSize')}</div><div class="grid2">${partsByNum(M.cat).map(p => `<div><label class="f" for="r-${p}">${nbTag(M.cat, p)}${p}${['가슴', '허리', '힙', '허벅지'].includes(p) ? ' (둘레)' : ''}</label><div class="unit"><input id="r-${p}" class="inp num" inputmode="decimal" data-i="mRow" data-k="${p}" value="${esc(M.rows[p] ?? '')}" placeholder="cm"><i>cm</i></div></div>`).join('')}</div></div>` : ''}</div>
  `}</div>
  <div class="dock"><button id="mgo" class="btn pri full" data-a="mGo" ${mReady() ? '' : 'disabled'}>사이즈 분석하기</button></div>`;
};
ACT.mStep = t => { const s = +t.dataset.v; if (s === 2 && M.step === 1 && !commitBody()) return; M.step = s; if (s === 1) loadBD(); reRender(); $('#view').scrollTop = 0; };
ACT.mNext = () => { if (!commitBody()) return; M.step = 2; render(); $('#view').scrollTop = 0; };
ACT.mBack = () => { if (M.step === 2) { M.step = 1; loadBD(); render(); $('#view').scrollTop = 0; } else back(); };
ACT.sheetClose = () => closeSheet();
const mUpdate = () => { const g = $('#mgo'); if (g) g.disabled = !mReady(); };
ACT.mCat = t => { M.cat = t.dataset.v; M.productId = null; M.rows = {}; M.touched = false; reRender(); };
ACT.mOpen = () => { M.open = !M.open; reRender(); };
ACT.mSize = t => { M.size = t.dataset.v; if (M.productId && !M.touched) fillFromProduct(); reRender(); };
ACT.mPhotoDel = () => { if (M.photoId) delPhoto(M.photoId); M.photo = null; M.photoId = null; reRender(); };
ACT.photoInfo = () => sheet(`<h3>사이즈표는 이렇게 올려요</h3><div class="list" style="margin:8px -16px 0">
  <div class="li" style="align-items:flex-start"><span class="pill dark">필수</span><div><b>사이즈표 캡처</b><p class="sm mute" style="margin:2px 0 0">상품 상세 하단의 "사이즈 정보" 표를 캡처해요. 모든 사이즈의 실측이 보이게 찍어주세요.</p></div></div>
  <div class="li" style="align-items:flex-start"><span class="pill gray">예외</span><div><b>등록된 상품은 생략돼요</b><p class="sm mute" style="margin:2px 0 0">"상품 불러오기"에서 고르면 사이즈표를 자동으로 가져와요.</p></div></div>
  <div class="li" style="align-items:flex-start"><span class="pill gray">대안</span><div><b>읽기 실패 시 직접 입력</b><p class="sm mute" style="margin:2px 0 0">"상세 실측 직접 입력"에 숫자를 넣으면 이미지 없이도 분석해요.</p></div></div></div>
  <button class="btn pri full mt16" data-a="sheetClose">확인</button>`);
ACT.imgInfo = () => sheet(`<h3>상품 이미지는 이렇게 올려요</h3><div class="list" style="margin:8px -16px 0">
  <div class="li" style="align-items:flex-start"><span class="pill gray">선택</span><div><b>모델 착용컷 · 상세 이미지</b><p class="sm mute" style="margin:2px 0 0">상품 페이지의 모델 착용컷이나 상세 이미지를 캡처해 올리면 핏을 가늠하는 데 참고해요. 최대 5장까지 올릴 수 있어요.</p></div></div>
  <div class="li" style="align-items:flex-start"><span class="pill gray">구분</span><div><b>사이즈표와는 따로 올려요</b><p class="sm mute" style="margin:2px 0 0">사이즈표 캡처는 위의 "사이즈표"에, 모델컷과 상품 사진은 여기에 올려주세요.</p></div></div></div>
  <button class="btn pri full mt16" data-a="sheetClose">확인</button>`);
CHG.mImgs = t => { const fs = [...t.files].slice(0, 5 - (M.imgs || []).length); M.imgs = M.imgs || []; let n = fs.length; if (!n) return; fs.forEach(f => readPhoto(f, 900, d => { if (d) M.imgs.push({ id: addPhoto('상품 이미지', d), src: d }); if (--n === 0) { save(); reRender(); } })); t.value = ''; };
ACT.mImgDel = t => { const i = (M.imgs || []).findIndex(x => x.id === t.dataset.v); if (i >= 0) { delPhoto(M.imgs[i].id); M.imgs.splice(i, 1); } reRender(); };
INP.mM = t => { M[t.dataset.k] = t.value; };
INP.mRow = t => { M.rows[t.dataset.k] = t.value; M.touched = true; mUpdate(); };
CHG.mPhoto = t => { const f = t.files[0]; if (f) readPhoto(f, 900, d => { if (!d) return; if (M.photoId) delPhoto(M.photoId); M.photo = d; M.photoId = addPhoto('사이즈표', d); save(); reRender(); }); };
function fillFromProduct() { const p = prodById[M.productId]; M.rows = {}; if (p?.ch?.[M.size]) PARTS[M.cat].forEach(k => { if (p.ch[M.size][k] != null) M.rows[k] = p.ch[M.size][k]; }); }
CHG.mProd = t => { M.productId = t.value || null; M.touched = false; M.rows = {}; if (M.productId) { M.name = prodById[M.productId].n; fillFromProduct(); M.open = true; } reRender(); };
function setDemoM(step = 2) { M = newM(step); M.cat = '상의'; const ub = BR.find(b => b.n === '유니클로') || BR[0]; M.brandId = ub.id; M.brandText = ub.n; M.productId = PR.find(p => p.b === ub.id && p.c === '상의').id; M.size = 'M'; fillFromProduct(); M.open = true; }
ACT.mDemo = () => { setDemoM(2); reRender(); };
// 브랜드 자동완성(검색하면 아래 목록이 필터링됨)
function taList() {
  const q = M.brandText, cnt = id => PR.filter(p => p.b === id && p.c === M.cat).length;
  const hits = BR.map(b => ({ b, m: findIn(b.n, q) || findIn(b.en, q) })).filter(x => !q.trim() || x.m);
  let h = `<button data-a="taFree"><span class="logo" style="width:34px;height:34px;font-size:16px;border-radius:9px">+</span><span class="grow"><b>${q.trim() && !BR.some(b => b.n === q.trim()) ? esc(q.trim()) + ' ' : ''}(직접 입력)</b></span></button>` + hits.slice(0, 6).map(({ b }) => `<button data-a="taPick" data-v="${b.id}"><span class="logo im" style="width:34px;height:34px;font-size:12px;border-radius:9px">이미지${bimg(b.id)}</span><span class="grow"><b>${hl(b.n, q)}</b> <span class="xs mute">${esc(b.en)}</span></span><span class="xs mute">${M.cat} ${cnt(b.id)}개</span></button>`).join('');
  return h;
}
window.taShow = () => { const l = $('#ta-list'); if (!l) return; l.className = 'ta-list'; l.hidden = false; l.innerHTML = taList(); };
INP.ta = t => { M.brandText = t.value; M.brandId = null; M.productId = null; taShow(); mUpdate(); };
ACT.taPick = t => { const b = brandById[t.dataset.v]; M.brandFree = false; M.brandId = b.id; M.brandText = b.n; M.productId = null; M.rows = {}; reRender(); };
ACT.taFree = () => { M.brandId = null; M.brandFree = true; M.productId = null; const l = $('#ta-list'); if (l) l.hidden = true; reRender(); };
document.addEventListener('click', e => { const l = $('#ta-list'); if (l && !l.hidden && !e.target.closest('#ta-list') && e.target.id !== 'ta') l.hidden = true; });
ACT.mGo = () => { if (mReady()) runAnalysis(); };
function runAnalysis() { CUR = buildAnalysis(M); RT = 'viz'; RE = false; go('analyzing', { next: { v: 'result', p: {} } }); }

/* ---------- 분석 중(처음 분석과 다시 분석에서 공용) ---------- */
const AN_STEPS = ['사이즈표를 찾는 중', '부위별 실측을 읽는 중', '내 신체와 비교하는 중', '사이즈별 의견을 만드는 중'];
V.analyzing = p => `<div class="anl"><div class="scan"><svg viewBox="0 0 300 440"><g fill="none" stroke="currentColor" stroke-width="6"><circle cx="150" cy="36" r="19"/><path d="M108 80 C106 108 120 128 124 158 C118 180 106 196 104 218 L196 218 C194 196 182 180 176 158 C180 128 194 108 192 80 Z M104 218 L121 424 M196 218 L179 424"/></g></svg></div>
  <h2 style="margin:22px 0 4px;font-size:18px">${p.again ? '다시 분석 중' : '분석 중'}</h2><div style="margin-top:18px;text-align:left">${AN_STEPS.map((s, i) => `<div class="chk" id="an${i}"><i></i>${s}</div>`).join('')}</div></div>`;
let anTimers = [];
V['analyzing$after'] = p => {
  anTimers.forEach(clearTimeout); anTimers = [];
  AN_STEPS.forEach((_, i) => anTimers.push(setTimeout(() => { const e = $('#an' + i); if (e) { e.classList.add('on'); e.firstChild.textContent = '✓'; } }, 450 + i * 600)));
  anTimers.push(setTimeout(() => { if (stack.at(-1).v === 'analyzing') { const nx = p.next || { v: 'result', p: {} }; replaceTop(nx.v, nx.p); } }, 450 + AN_STEPS.length * 600 + 300));
};

/* ---------- 분석 결과 ---------- */
let CUR = null, RT = 'viz', RE = false;
const SRC = { manual: '직접 입력·수정한 실측', product: '우리 DB 사이즈표', sample: 'AI 사진 분석' };
function summarize(ev, sel, rec) {
  const bad = ev.rows.filter(r => r.v !== 'ok' && r.v !== 'na');
  const head = sel === rec ? `${sel} 사이즈가 가장 잘 맞아요. ` : `${sel} 사이즈는 추천(${rec})과 달라요. `;
  if (!bad.length) return head + '비교한 모든 부위가 적당해요.';
  return head + bad.map(r => `${r.part}${iga(r.part)} ${partWord(r)}.`).join(' ');
}
const persText = A => { const e = Object.entries(A.pers?.shift || {}); return e.length ? e.map(([k, v]) => `${k} ${v > 0 ? '더 여유롭게' : '더 몸에 맞게'}`).join(' · ') : ''; };
const partRowHTML = r => {
  const bad = isBad(r), word = r.len ? (r.v === 'short' ? '짧아요' : r.v === 'long' ? '길어요' : '적당') : partWord(r);
  return `<div class="prow"><span class="prow-k">${r.part}</span><span class="pbar"><i class="pband"></i><i class="pdot ${bad ? 'bad' : ''}" style="left:${barPos(r)}%"></i></span><span class="prow-v"><b class="${bad ? 'bad' : ''}">${bad ? word : '적당'}</b><span class="xs mute">${r.ease != null ? sgn(r.ease) : sgn(r.diff ?? 0)}cm</span></span></div>`;
};
V.result = p => {
  const A = p.rid ? S.records.find(r => r.id === p.rid) : CUR; if (!A) return '<div class="empty">분석 결과가 없어요</div>';
  const fromRec = !!p.rid, o = analysisOutcome(A); if (!o) return '<div class="empty">분석 결과가 없어요</div>';
  const tx = outcomeText(o), sel = A.sel && o.evs[A.sel] ? A.sel : o.best, ev = o.evs[sel], pr = A.productId ? prodById[A.productId] : null, site = brandById[A.brandId]?.site || '';
  const neigh = o.state === 'nofit' ? [] : [SZ[SZ.indexOf(o.best) - 1], SZ[SZ.indexOf(o.best) + 1]].filter(s => s && A.chart[s]).map(s => neighborText(o, A.cat, s)).filter(Boolean);
  const sims = pr ? similarReviews(pr.id, A.body) : [];
  const alts = o.state === 'nofit' ? PR.filter(x => x.c === A.cat && x.id !== A.productId && (!pr || x.sc === pr.sc) && genderOk(x)).map(x => ({ x, oc: productOutcome(x, A.body) })).filter(y => y.oc && y.oc.state === 'fit').sort((a, c) => (revByProd[c.x.id]?.length || 0) - (revByProd[a.x.id]?.length || 0)).slice(0, 3) : [];
  const buy = o.state === 'nofit'
    ? `<button class="btn pri grow" data-a="mNew">다른 옷 측정하기 →</button>`
    : (site ? `<a class="btn pri grow" href="${esc(site)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none">${o.best}로 구매하기 →</a>` : `<button class="btn pri grow" data-a="mNew">다른 옷 측정하기 →</button>`);
  return `${topbar(fromRec ? '기록' : '결과', { left: 'close' })}
  <div class="rs">
  <div class="rs-prod"><span class="ph"><span>이미지</span>${pr ? pimg(pr.id) : ''}</span><span><span class="xs mute" style="display:block">${esc(A.brandName)}</span><span class="sm">${esc(A.productName || A.cat)}</span></span></div>
  <h1 class="rs-h">${tx.head}</h1>${tx.sub ? `<div class="rs-s">${esc(tx.sub)}</div>` : ''}
  <div class="rs-m">${o.bv.h} · ${o.bv.w} · ${esc(A.pref)}${A.corrected ? ' · 실측 수정' : ''}</div>
  <div class="szrow" id="szc" style="grid-template-columns:repeat(${o.per.length},minmax(0,1fr))">${o.per.map(x => `<button class="szbox ${x.s === sel ? 'on' : ''} ${x.s === o.best ? 'best' : ''}" data-a="rSize" data-v="${x.s}" aria-pressed="${x.s === sel}"><b>${x.s}</b><i>${sizeLabel(o, x)}</i></button>`).join('')}</div>
  <h2 class="rs-t">${sel} 부위별</h2><div class="plist">${ev.rows.map(partRowHTML).join('')}</div>
  ${neigh.length ? `<h2 class="rs-t">다른 사이즈</h2>${neigh.map(n => `<div class="nrow2"><b>${n.s}</b><span>${n.head}${n.sub ? `<span class="xs mute" style="display:block">${n.sub}</span>` : ''}</span></div>`).join('')}` : ''}
  ${alts.length ? `<h2 class="rs-t">내 사이즈에 맞는 비슷한 옷</h2>${alts.map(({ x, oc }) => `<button class="altrow" data-a="openProduct" data-v="${x.id}"><span class="ph"><span>이미지</span>${pimg(x.id)}</span><span class="grow"><span class="xs mute" style="display:block">${esc(brandById[x.b].n)}</span><span class="sm">${esc(x.n)}</span></span><b>${oc.best}</b></button>`).join('')}` : ''}
  ${sims.length ? `<h2 class="rs-t">비슷한 체형 후기</h2>${sims.map(({ r, u }) => `<button class="simrv" data-a="openReview" data-v="${r.id}"><span class="xs mute">${u[0]} · ${u[1]} · <b style="color:var(--ink)">${esc(r.sz)}</b> · ${esc(r.op)}</span><span class="sm" style="display:block;margin-top:3px">${esc(r.t)}</span></button>`).join('')}` : ''}
  <div class="acc field" style="margin-top:24px"><button data-a="rEdit" aria-expanded="${RE}"><span>실측 수정</span><span>${RE ? '−' : '+'}</span></button>
    ${RE ? `<div class="in"><div class="grid2">${PARTS[A.cat].filter(k => A.chart[sel][k] != null).map(k => `<div><label class="f" for="re-${k}">${k}</label><div class="unit"><input id="re-${k}" class="inp num" inputmode="decimal" data-i="re" data-k="${k}" value="${esc(A.chart[sel][k] ?? '')}"><i>cm</i></div></div>`).join('')}</div><button class="btn pri full mt12" data-a="rRe">다시 분석</button></div>` : ''}</div>
  ${fromRec ? `<button class="btn ${A.fb ? 'flat' : 'pri'} full" data-a="fbOpen" data-v="${A.id}" style="margin:16px 0 14px">${A.fb ? '착용 피드백 수정' : '착용 피드백 남기기'}</button>${recordFeedbackHTML(A)}` : ''}
  </div><div style="height:96px"></div>
  <div class="dock" style="position:sticky;bottom:0"><div class="row">${fromRec ? '' : '<button class="btn flat" data-a="rSave" style="width:92px">저장</button>'}${buy}</div></div>`;
};
const getA = () => { const p = stack.at(-1).p; return p.rid ? S.records.find(r => r.id === p.rid) : CUR; };
ACT.rSize = t => { getA().sel = t.dataset.v; RE = false; const sc = $('#szc'), x = sc ? sc.scrollLeft : 0; reRender(); const n = $('#szc'); if (n) n.scrollLeft = x; };
ACT.rPref = t => { const A = getA(); A.pref = t.dataset.v; A.rec = recommend(A.cat, A.chart, bodyVals(A.body), A.pref, A.pers?.shift || {}).best; if (stack.at(-1).p.rid) save(); reRender(); };
ACT.rTab = t => { RT = t.dataset.v === '핏 시각화' ? 'viz' : 'tbl'; reRender(); };
ACT.rEdit = () => { RE = !RE; reRender(); };
INP.re = t => { const A = getA(); A._draft = A._draft || {}; A._draft[t.dataset.k] = t.value; };
ACT.rRe = () => {
  const A = getA(), d = A._draft || {}, sel = A.sel, orig = stack.at(-1).p; delete A._draft;
  PARTS[A.cat].forEach(k => { if (d[k] === undefined || d[k] === '' || isNaN(+d[k])) return; const delta = +d[k] - (A.chart[sel][k] ?? 0); SZ.forEach(s => { if (A.chart[s]) A.chart[s][k] = r1((A.chart[s][k] ?? 0) + delta); }); });
  A.corrected = true; A.source = A.source === 'sample' ? 'manual' : A.source; A.rec = recommend(A.cat, A.chart, bodyVals(A.body), A.pref, A.pers?.shift || {}).best; RE = false;
  if (orig.rid) save();
  replaceTop('analyzing', { again: true, next: { v: 'result', p: orig } });   // 다시 분석도 분석 중 화면을 거친다
};
/* 다시 측정: 처음이 아니라 방금 입력한 옷 정보가 남은 '옷 입력' 화면으로 */
ACT.rAgain = () => { if (!M) M = newM(); M.step = 2; loadBD(); stack = [{ v: 'home', p: {} }, { v: 'measure', p: {} }]; render(); $('#view').scrollTop = 0; };
ACT.mNew = () => { M = newM(2); loadBD(); stack = [{ v: 'home', p: {} }, { v: 'measure', p: {} }]; render(); $('#view').scrollTop = 0; };
ACT.rSave = () => { const A = CUR; A.saved = true; delete A._draft; S.records.unshift(JSON.parse(JSON.stringify(A))); save(); replaceTop('saved', { rid: A.id }); };

V.saved = p => {
  const A = S.records.find(r => r.id === p.rid) || CUR;
  return `<div class="anl"><div class="check">${ico('check')}</div><h1 class="big" style="margin:0">저장 완료</h1><p class="sub mt8">${esc(A.brandName)} ${esc(A.cat)} · 추천 <b>${A.rec}</b></p>
  <div class="card fill pad mt16 sm" style="text-align:left;width:100%">기록에 저장됐어요. 나중에 실제로 입어본 느낌을 <b>피드백</b>으로 남기면 내 추천에 반영돼요.</div>
  <div style="width:100%;margin-top:22px"><button class="btn pri full" data-a="savedRecords">기록 보러가기</button><div class="row mt8"><button class="btn flat grow" data-a="mNew">다른 상품 측정</button><button class="btn flat grow" data-a="goTab" data-v="home">홈으로</button></div></div></div>`;
};
ACT.savedRecords = () => { RK = '분석'; RC = '전체'; RQ = ''; RFS = { sizes: [], period: '전체' }; tab('records'); };
