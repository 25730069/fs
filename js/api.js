/* ===== 외부 API: 사이즈표 사진을 AI가 읽어요(Gemini, Cloudflare Worker 경유) =====
   실패하면(오프라인·시간 초과·한도 초과·읽기 실패) 예전 방식(직접 입력 / 예시 사이즈표)으로 이어가요. */
const AI = (() => {
  const cfg = () => (window.FS_CONFIG || {}).aiEndpoint || '';
  const MSG = {
    offline: '인터넷에 연결되어 있지 않아요',
    timeout: '응답이 늦어 사진을 읽지 못했어요',
    quota: '오늘 사진 분석 횟수를 모두 썼어요',
    unreadable: '사진에서 사이즈표를 읽지 못했어요',
    server: '사진 분석 서버에 문제가 있어요'
  };
  const fail = k => Object.assign(new Error(MSG[k] || MSG.server), { kind: k });
  async function readChart(dataUrl, cat) {
    if (!cfg()) throw fail('server');
    if (!navigator.onLine) throw fail('offline');
    const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 25000);
    let res;
    try { res = await fetch(cfg(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: dataUrl, cat, parts: PARTS[cat] }), signal: ctl.signal }); }
    catch (e) { throw fail(e.name === 'AbortError' ? 'timeout' : navigator.onLine ? 'server' : 'offline'); }
    finally { clearTimeout(tm); }
    if (res.status === 429) throw fail('quota');
    if (!res.ok) throw fail('server');
    let data; try { data = await res.json(); } catch (e) { throw fail('server'); }
    const chart = clean(data, cat);
    if (!Object.keys(chart).length) throw fail('unreadable');
    return chart;
  }
  /* 응답 검증: 알려진 사이즈·부위만, 숫자 범위 안의 값만 받아요(AI가 이상한 값을 줘도 화면이 깨지지 않게) */
  function clean(data, cat) {
    const out = {}, ok = new Set(PARTS[cat]);
    ((data && data.sizes) || []).forEach(s => {
      const z = String(s.size || '').trim().toUpperCase(); if (!SZ.includes(z)) return;
      const v = {}; (s.values || []).forEach(x => { const n = +x.cm; if (ok.has(x.part) && isFinite(n) && n >= 5 && n <= 220) v[x.part] = Math.round(n * 10) / 10; });
      if (Object.keys(v).length >= 2) out[z] = v;
    });
    return out;
  }
  return { on: () => !!cfg(), readChart };
})();

/* 분석 시작: 사이즈표 사진만 있고 숫자가 없으면 AI로 읽어요. 실패해도 분석은 끝까지 가요. */
const _runAnalysis = runAnalysis;
runAnalysis = function () {
  const useAI = AI.on() && M.photo && !M.productId && mRows() < 2;
  if (!useAI) { M.aiChart = null; _runAnalysis(); return; }
  const snap = M; go('analyzing', { wait: true });
  AI.readChart(M.photo, M.cat).then(c => { snap.aiChart = c; return null; }).catch(e => { snap.aiChart = null; return e; }).then(err => {
    if (stack.at(-1).v !== 'analyzing') return;   // 그 사이 화면을 나갔으면 이어가지 않아요
    CUR = buildAnalysis(snap); RT = 'viz'; RE = false; replaceTop('result', {});
    if (err) setTimeout(() => toast(err.message + ' · 예시 사이즈표로 분석했어요. 직접 입력하면 더 정확해요'), 300);
    else if (snap.aiChart) setTimeout(() => toast('사진에서 사이즈표를 읽었어요'), 300);
  });
};
/* 기다리는 동안에는 단계 표시만 움직이고 화면은 넘기지 않아요 */
const _anAfter = V['analyzing$after'];
V['analyzing$after'] = p => { if (!p.wait) { _anAfter(p); return; } anTimers.forEach(clearTimeout); anTimers = []; AN_STEPS.slice(0, 2).forEach((_, i) => anTimers.push(setTimeout(() => { const e = $('#an' + i); if (e) { e.classList.add('on'); e.firstChild.textContent = '✓'; } }, 450 + i * 900))); };

/* ---------- 오프라인 안내 ---------- */
(() => {
  const bar = () => { let b = document.getElementById('offbar'); if (!b) { b = document.createElement('div'); b.id = 'offbar'; b.className = 'offbar'; b.setAttribute('role', 'status'); b.textContent = '오프라인이에요 · 저장된 내용은 계속 볼 수 있어요'; (document.getElementById('phone') || document.body).appendChild(b); } return b; };
  const upd = () => { if (!navigator.onLine) bar(); else { const b = document.getElementById('offbar'); if (b) b.remove(); } };
  addEventListener('offline', upd); addEventListener('online', () => { upd(); toast('다시 연결됐어요'); }); upd();
})();
