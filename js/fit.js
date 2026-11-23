/* ===== 핏 판정 3상태 · 홈 큐레이션 =====
   evalSize()가 사이즈마다 부위별 판정(tight/ok/loose)을 주면, 이 파일이 그걸 한 번 더 묶어서
   fit      : 맞아요
   caution  : 맞지만 한 군데가 걸려요 (예: 소매가 짧아요)
   nofit    : 맞는 사이즈가 없어요 (가장 가까운 사이즈도 큰 문제가 있음)
   중 하나로 돌려준다. 점수가 가장 낮은 사이즈를 무조건 추천하지 않기 위한 단계. */
const WORD = { tight: '작아요', loose: '커요', short: '짧아요', long: '길어요' };
const LEN_PART = { 소매: 1, 총장: 1 };
const josa = s => (['M', 'L', 'XL'].includes(s) ? '이' : '가');
const partWord = r => {
  if (r.v === 'tight') return LEN_PART[r.part] ? '짧아요' : '작아요';
  if (r.v === 'loose') return LEN_PART[r.part] ? '길어요' : '커요';
  return WORD[r.v] || '적당';
};
const rowCm = r => r1(Math.abs(r.len ? (r.diff ?? 0) : (r.diff ?? 0)));
const isBad = r => r.v !== 'ok' && r.v !== 'na';
const mainPart = cat => Object.entries(W[cat]).sort((a, b) => b[1] - a[1])[0][0];

function fitOutcome(cat, chart, body, pref, shift) {
  const bv = bodyVals(body), sizes = SZ.filter(s => chart[s]);
  if (!sizes.length) return null;
  const rec = recommend(cat, chart, bv, pref, shift || {});
  const evs = Object.fromEntries(sizes.map(s => [s, evalSize(cat, chart[s], bv, pref, shift || {})]));
  const best = rec.best, ev = evs[best], bad = ev.rows.filter(isBad);
  const hard = bad.find(r => r.v === 'tight' && !r.len && !LEN_PART[r.part] && Math.abs(r.diff) > r.tol * 1.5);
  const edgeSmall = best === sizes[0] && bad.some(r => r.v === 'loose' && !r.len && Math.abs(r.diff) > r.tol * 1.5);
  const edgeBig = best === sizes.at(-1) && !!hard;
  let state = 'fit';
  if (bad.length) state = 'caution';
  if (hard || edgeSmall || bad.filter(r => !r.len).length >= 2) state = 'nofit';
  const worst = [...bad].sort((a, b) => Math.abs(b.diff) / (b.tol || 1) - Math.abs(a.diff) / (a.tol || 1))[0] || null;
  const byPart = Object.fromEntries(ev.rows.map(r => [r.part, r]));
  const per = sizes.map(s => {
    const e = evs[s], v = sizeVerdict(cat, e), b = e.rows.filter(isBad);
    return { s, v, bad: b, ev: e };
  });
  return { state, best, rec, bv, evs, ev, bad, worst, byPart, per, sizes, edge: edgeSmall || edgeBig };
}
/* 상품(사이즈표 있음) 기준 판정. 내 신체가 없으면 null */
function productOutcome(prod, body) {
  body = body || S.body; if (!body || !prod?.ch) return null;
  try { return fitOutcome(prod.c, prod.ch, body, body.pref || '기본 핏', fitShift(prod, persInfo().shift)); } catch (e) { return null; }
}
/* 분석 기록(A)에 대한 판정: 선택한 사이즈가 아니라 추천 사이즈 기준 */
function analysisOutcome(A) { return fitOutcome(A.cat, A.chart, A.body, A.pref, A.pers?.shift || {}); }

/* 한 줄 문구: 헤드라인 / 보조 설명 */
function outcomeText(o) {
  const b = o.best;
  if (o.state === 'fit') return { head: `${b}${josa(b)} 맞아요`, sub: '' };
  if (o.state === 'caution') { const w = o.worst; return { head: `${b}${josa(b)} 맞아요`, sub: `${w.part}만 ${rowCm(w)}cm ${partWord(w)}` }; }
  const w = o.worst || o.bad[0];
  return { head: '맞는 사이즈가 없어요', sub: w ? `${b}도 ${w.part}이 ${rowCm(w)}cm ${partWord(w)}` : '' };
}
/* 판정 막대(−2·허용폭 ~ +2·허용폭) 위의 점 위치(%) */
const barPos = r => r.len || r.tol == null ? 50 : Math.max(6, Math.min(94, 50 + (r.diff / (r.tol * 3)) * 50));
/* 사이즈 상자의 라벨 */
function sizeLabel(o, x) {
  if (x.s === o.best && o.state !== 'fit' && o.worst) {
    const w = o.worst, short = { 작아요: '작음', 커요: '큼', 짧아요: '짧음', 길어요: '김' }[partWord(w)];
    return o.state === 'nofit' ? `${w.part} ${short}` : `${w.part} 주의`;
  }
  return x.v.c === 'tight' ? '작아요' : x.v.c === 'loose' ? '커요' : '맞아요';
}
/* 옆 사이즈 설명 */
function neighborText(o, cat, s) {
  const x = o.per.find(q => q.s === s); if (!x) return null;
  const w = x.bad[0], mp = mainPart(cat), mr = x.ev.rows.find(r => r.part === mp);
  const head = w ? `${w.part}이 ${partWord(w)}` : '맞아요';
  return { s, head, sub: mr && mr.ease != null ? `${mp} 여유 ${r1(mr.ease)}cm` : '' };
}
/* 비슷한 체형 후기 */
function similarReviews(pid, body, n = 2) {
  const b = body || S.body || { h: 165, w: 55 };
  return (revByProd[pid] || []).map(r => ({ r, u: DB.U[r.u] })).filter(x => x.u && Math.abs(x.u[0] - b.h) <= 8 && Math.abs(x.u[1] - b.w) <= 10)
    .sort((a, c) => (c.r.t || '').length - (a.r.t || '').length).slice(0, n);
}

/* ---------- 홈 큐레이션: 사이즈 고민 하나를 풀어 주는 모음 5종 ---------- */
const COLLS = [
  { id: 'hoodie', t: '소매 안 짧은\n후드', color: 'yellow', test: (p, o) => /후드/.test(p.sc) && o.state !== 'nofit' && o.byPart['소매'] && o.byPart['소매'].v !== 'tight' },
  { id: 'outer', t: '한 치수 크게\n사야 하는 아우터', color: 'blue', test: p => p.c === '아우터' && (revByProd[p.id] || []).length >= 5 && (revByProd[p.id] || []).filter(r => r.op === '작은 편').length / revByProd[p.id].length >= .3 },
  { id: 'denim', t: '허리 넉넉한\n데님', color: 'pink', test: (p, o) => /데님/.test(p.sc) && o.state !== 'nofit' && o.byPart['허리'] && o.byPart['허리'].diff >= 0 },
  { id: 'shoulder', t: '어깨 좁게 나온\n옷 피하기', color: 'yellow', test: (p, o) => ['상의', '아우터', '원피스'].includes(p.c) && o.byPart['어깨'] && o.byPart['어깨'].v === 'tight' },
  { id: 'knit', t: '정사이즈로\n나오는 니트', color: 'blue', test: p => /니트|가디건/.test(p.sc) && (revByProd[p.id] || []).length >= 5 && (revByProd[p.id] || []).filter(r => r.op === '정사이즈').length / revByProd[p.id].length >= .6 }
];
let collKey = '', collMap = {};
function collections() {
  const body = S.body || { h: 165, w: 55, pref: '기본 핏' }, key = JSON.stringify(body) + (S.profile && S.profile.gender);
  if (key === collKey) return collMap;
  collKey = key; collMap = {};
  const ps = PR.filter(genderOk).map(p => ({ p, o: productOutcome(p, body) })).filter(x => x.o);
  COLLS.forEach(c => { collMap[c.id] = ps.filter(x => { try { return c.test(x.p, x.o); } catch (e) { return false; } }).map(x => ({ p: x.p, size: x.o.best, o: x.o }))
    .sort((a, b) => (revByProd[b.p.id]?.length || 0) - (revByProd[a.p.id]?.length || 0) || a.p.id.localeCompare(b.p.id)); });
  return collMap;
}
