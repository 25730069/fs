/* ===== LocalStorage: 이 브라우저에서만 쓰는 개인 상태(찜 · 최근 본 · 마지막 탐색 조건 · 화면 설정) =====
   - 모든 키 앞에 접두사 fitsense- 를 붙여요(같은 주소를 쓰는 다른 프로젝트와 섞이지 않게).
   - 저장하는 것은 ID와 설정값뿐이에요. 상품·후기·폴더의 내용은 원본(JSON/DB)에서 ID로 찾아와요.
   - 이름·사진·로그인 정보·후기·댓글·폴더 내용은 저장하지 않아요(서버 DB 몫). 키·몸무게는 서비스 사용에 꼭 필요해 이 브라우저에만 저장해요.
   | 키                  | 형식                                              | 기본값        |
   | fitsense-favorites | {product:[id], brand:[id], review:[id], folder:[id]} | 전부 []   |
   | fitsense-recent    | 상품 id 배열(최근 순, 최대 10개)                    | []            |
   | fitsense-filters   | {plist:{…}, folders:{…}}                          | {}            |
   | fitsense-ui        | {tutorialHide, nset}                              | 앱 기본값     |
   | fitsense-body      | {h, w, pref, updated} (키·몸무게·선호 핏)           | 없음(null)    | */
const LS_PREFIX = 'fitsense-';
let _lsWarned = false;
function read(key, fallback) {                       // 값이 없거나 손상되면 기본값
  try { const v = JSON.parse(localStorage.getItem(LS_PREFIX + key)); return v === null || v === undefined ? fallback : v; }
  catch (e) { return fallback; }
}
function write(key, value) {                         // 저장이 막힌 브라우저(시크릿·용량 부족)면 한 번만 안내
  try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(value)); return true; }
  catch (e) { if (!_lsWarned) { _lsWarned = true; setTimeout(() => { if (typeof toast === 'function') toast('이 브라우저에서는 저장 기능을 사용할 수 없어요'); }, 0); } return false; }
}
const _isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
const _idArr = v => Array.isArray(v) ? v.filter(x => typeof x === 'string' || typeof x === 'number') : [];   // 배열이 아니면(손상) 빈 배열
function remove(key) { try { localStorage.removeItem(LS_PREFIX + key); } catch (e) { } }
const LS_KEYS = ['favorites', 'recent', 'filters', 'ui', 'body'];

/* ---------- 마지막 탐색 조건 저장·복원 / 저장된 ID 정리 (모든 스크립트가 로드된 뒤 router.js가 부르는 함수) ---------- */
function persistFilters() {
  write('filters', { plist: typeof PL !== 'undefined' ? PL : {}, folders: typeof FL !== 'undefined' ? FL : {} });
}
function _mergeKnown(base, src) {   // 알려진 항목만, 같은 자료형일 때만 받아요(손상된 값은 기본값 유지)
  if (!_isObj(src)) return base;
  const o = { ...base };
  for (const k in base) {
    if (!(k in src)) continue;
    const b = base[k], s = src[k];
    if (b === null ? (s === null || typeof s === 'string' || typeof s === 'number') : (Array.isArray(b) ? Array.isArray(s) : typeof b === typeof s && !Array.isArray(s))) o[k] = s;
  }
  return o;
}
function restoreFilters() {
  const f = read('filters', {}); if (!_isObj(f)) return;
  try { if (typeof PL !== 'undefined' && typeof newPL === 'function') PL = _mergeKnown(newPL(), f.plist); } catch (e) { }
  try { if (typeof FL !== 'undefined' && typeof FL0 === 'function') FL = _mergeKnown(FL0(), f.folders); } catch (e) { }
}
function cleanSaved() {   // 지금 데이터에 없는 ID(삭제된 상품 등)는 정리해서 "찾을 수 없음" 카드가 생기지 않게
  const rvIds = new Set(RV.map(r => String(r.id))), fIds = new Set(otherFolders().map(f => f.id));
  const keep = { product: id => !!prodById[id], brand: id => !!brandById[id], review: id => rvIds.has(String(id)), folder: id => fIds.has(id) || String(id).startsWith('FD') };
  let ch = false;
  Object.keys(keep).forEach(k => { const a = S.likes[k] || [], b = a.filter(keep[k]); if (b.length !== a.length) { S.likes[k] = b; ch = true; } });
  const r = S.recent.filter(id => !!prodById[id]); if (r.length !== S.recent.length) { S.recent = r; ch = true; }
  if (ch) save();
}
addEventListener('pagehide', () => { try { persistFilters(); } catch (e) { } });
