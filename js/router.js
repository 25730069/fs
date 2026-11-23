/* ===== 주소(URL) 라우팅: 상세 화면을 ID 주소로 열고, 새로고침·뒤로가기·주소 공유가 되게 해요 =====
   예) index.html#/product/P123 · #/review/R45 · #/folder/F10 · #/user/U7 · #/brandDetail/3 */
(() => {
  const IDK = { product: 'id', review: 'id', folder: 'id', brandDetail: 'id', user: 'u' };
  const TOPS = ['home', 'brand', 'measure', 'records', 'my', 'likes', 'notifs', 'recent'];
  const exists = {
    product: id => !!prodById[id], review: id => RV.some(r => String(r.id) === id), brandDetail: id => !!brandById[id],
    folder: id => otherFolders().some(f => f.id === id), user: id => !!DB.U[id]
  };
  const hashOf = c => IDK[c.v] ? '#/' + c.v + '/' + encodeURIComponent(c.p[IDK[c.v]]) : '#/' + c.v;
  let pushed = 0;   // 이 방문에서 브라우저 기록에 쌓은 화면 수
  const sync = (mode) => { try { persistFilters(); } catch (e) { } try { history[mode === 'push' ? 'pushState' : 'replaceState']({ fs: stack.length }, '', hashOf(stack.at(-1))); } catch (e) { } };

  const _go = go, _back = back, _tab = tab, _rep = replaceTop;
  go = (v, p) => { _go(v, p); pushed++; sync('push'); };
  tab = t => { _tab(t); pushed = 0; sync('replace'); };
  replaceTop = (v, p) => { _rep(v, p); sync('replace'); };
  back = () => { if (stack.length > 1 && pushed > 0) history.back(); else { _back(); sync('replace'); } };

  function apply(hash) {
    const m = /^#\/([A-Za-z]+)(?:\/(.+))?$/.exec(hash || ''); if (!m) return false;
    const v = m[1], id = m[2] && decodeURIComponent(m[2]);
    if (IDK[v]) {
      if (!id || !exists[v](id)) { stack = [{ v: 'home', p: {} }]; render(); sync('replace'); setTimeout(() => toast('찾을 수 없는 주소예요'), 50); return true; }
      if (v === 'product') { LF = newLF(); S.recent = [id, ...S.recent.filter(x => x !== id)].slice(0, 10); save(); }
      if (v === 'brandDetail') DF = { id, cat: '전체', q: '', sort: null, tab: 'prod' };
      if (v === 'user') UP = { tab: 'folder' };
      stack = [{ v: 'home', p: {} }, { v, p: v === 'product' ? { id, tab: 'chart' } : { [IDK[v]]: id } }];
    } else if (TOPS.includes(v)) stack = [{ v, p: {} }];
    else return false;
    render(); return true;
  }
  window.addEventListener('popstate', e => {
    if (e.state && e.state.fs) { if (stack.length > 1) { stack.pop(); render(); pushed = Math.max(0, pushed - 1); } }
    else apply(location.hash);   // 주소창에서 직접 바꾼 경우
  });
  cleanSaved(); restoreFilters();
  apply(location.hash); sync('replace');
})();
