/* ===== 0.6: 새 홈 · 폴더(내 옷장 플레이리스트) · 옷 추가 3단계 · 마이 · 효과 ===== */
const FCOL = ['y', 'b', 'g', 'n', 'p', 'l', 'o'];
const OVL = { 작음: '작아요', 정핏: '맞아요', 여유: '커요' }, OVW = { 작음: 600, 정핏: 800, 여유: 600 };
const U6 = t => `<u>${t}</u>`;
const plb = (t, cls = '') => `<span class="pl ${cls}">${t}</span>`;
const swHTML = (on, act) => `<button class="sw ${on ? 'on' : ''}" role="switch" aria-checked="${on}" data-a="${act}"><i></i></button>`;

/* ---------- 데모 데이터: 내 폴더 · 다른 사람의 폴더 ---------- */
function seedV06() {
  if (S.v06 || !S.body) return;
  S.v06 = true; S.folders = S.folders || [];
  if (S.closet.length) return;
  const cm = collections(), pick = [...(cm.hoodie || []).slice(0, 3), ...(cm.knit || []).slice(0, 2), ...(cm.denim || []).slice(0, 2)];
  pick.forEach((x, i) => S.closet.push({ ...newFB(x.p.c), brandId: x.p.b, brand: brandById[x.p.b].n, productId: x.p.id, name: x.p.n, color: (x.p.col && x.p.col[0]) || '기타', size: x.size, overall: '정핏', pub: i < 5, id: 'CD' + i, date: dstr(i * 3).replace(/\./g, '.') }));
  if (S.closet.length >= 3) S.folders.push({ id: 'FD1', name: '소매 걱정 없는 후드', desc: '팔이 길어서 늘 소매가 문제였는데, 여기 있는 건 다 손목까지 와요.', color: 'b', pub: true, items: S.closet.slice(0, 3).map(c => c.id) }, { id: 'FD2', name: '출근룩', desc: '', color: 'y', pub: true, items: S.closet.slice(3, 5).map(c => c.id) });
  save();
}
let _of = null;
const FOLDER_T = [['꾸안꾸 데일리', '데일리'], ['출근룩 모음', '출근룩'], ['주말 캐주얼', '캐주얼'], ['허리 고민 없는 하의', '데일리'], ['소매 안 짧은 옷', '데일리'], ['한 치수 크게 사야 하는 옷', '캐주얼'], ['체형 커버 아우터', '미니멀'], ['여름 셔츠 모음', '캐주얼'], ['데이트룩 모음', '러블리'], ['키 작아도 괜찮은 바지', '데일리'], ['한 치수 업해야 하는 니트', '미니멀'], ['가을 아우터 정리', '미니멀'], ['스트릿 오버핏', '스트릿'], ['오피스 슬랙스', '출근룩'], ['러블리 원피스', '러블리'], ['후드는 전부 L', '스트릿'], ['깔끔한 셔츠룩', '출근룩'], ['편한 데님', '캐주얼'], ['무채색 미니멀', '미니멀'], ['봄 가디건', '러블리'], ['어깨 넓어도 괜찮은 옷', '데일리'], ['힙 있어도 편한 바지', '데일리'], ['출퇴근 아우터', '출근룩'], ['운동 후 입는 옷', '캐주얼'], ['빈티지 무드', '스트릿'], ['소개팅 코디', '러블리'], ['겨울 코트 모음', '미니멀'], ['캠퍼스룩', '캐주얼']];
function otherFolders() {
  if (_of) return _of;
  const by = {}; RV.forEach(r => { if (prodById[r.p] && DB.U[r.u]) (by[r.u] ||= []).push(r); });
  _of = Object.entries(by).filter(([u, a]) => a.length >= 2).sort((a, b) => hash('f' + a[0]) - hash('f' + b[0])).slice(0, 30).map(([u, a], i) => {
    const rows = a.slice(0, 8).map(r => ({ p: prodById[r.p], sz: r.sz, op: r.op, t: r.t, rid: r.id, fd: r.fd || {}, lo: r.lo })), [name, mood] = FOLDER_T[i % FOLDER_T.length];
    const worries = WORRIES.filter(([, parts, vals]) => rows.some(r => parts.some(pt => vals.includes((r.fd || {})[pt])) || (parts.includes('총장') && r.lo === '짧은 편'))).map(w => w[0]);
    return { id: 'F' + u, u, nick: nickOfU(u), h: DB.U[u][0], w: DB.U[u][1], name, mood, kinds: [...new Set(rows.map(r => r.p.c))], worries, desc: (rows[0].t || '').split(/[.!?\n]/).filter(x => !/키|kg|사이즈 샀/.test(x))[0]?.trim().slice(0, 50) || '', color: FCOL[(i * 3 + 1) % FCOL.length], rows, likes: 90 + hash(u) % 320 };
  });
  return _of;
}
const folderFor = () => { const f = otherFolders(), b = S.body; return b ? [...f].sort((x, y) => (Math.abs(x.h - b.h) + Math.abs(x.w - b.w)) - (Math.abs(y.h - b.h) + Math.abs(y.w - b.w))) : f; };
const thumbs = (ps, n = 3) => `<span class="fc-ph">${ps.slice(0, n).map(p => `<i>${p ? pimg(p.id) : ''}</i>`).join('')}</span>`;
const fcard = f => `<button class="fc c-${f.color}" data-a="openFolder" data-v="${f.id}">${thumbs(f.rows.map(r => r.p))}<span class="fc-t">${esc(f.name)}</span><span class="fc-m"><span>${esc(f.nick)} · ${f.h} · ${f.w}</span><span>♥ ${f.likes}</span></span>${fitLine(f)}</button>`;
const fitLine = f => { const c = S.body && fitCnt(f); return c && c.m ? `<span class="fc-f">나에게 맞는 옷 <b>${c.n}/${c.m}</b></span>` : ''; };
ACT.openFolder = t => go('folder', { id: t.dataset.v });
ACT.openMyFolder = t => go('myfolder', { id: t.dataset.v });

/* ---------- 홈 ---------- */
V.home = () => {
  seedV06();
  const b = S.body, pp = personalProducts(8), last = {}; [...S.records].sort((x, y) => y.date.localeCompare(x.date)).forEach(r => { if (!last[r.cat]) last[r.cat] = r; });
  const top = last['상의'] ? last['상의'].rec : 'M';
  const hero = b ? `<div class="hero6"><small>${esc(S.profile.nick)} · ${b.h} · ${b.w}</small><h1 class="disp">상의는<br>${U6(top + '이 맞아요')}</h1>
    <div class="pls">${['하의', '아우터'].filter(c => last[c]).map(c => plb(`${c} ${last[c].rec}`)).join('')}<button class="pl dk" data-a="startMeasure">다시 측정 ${ico('chev', 'ico')}</button></div></div>` : `<div class="hero6"><h1 class="disp">내 몸에 맞는<br>${U6('사이즈')}를 찾아요</h1></div>`;
  return `${hero}${b ? '' : myBlock()}${bannerHTML()}
  <div class="sec"><div class="sec-h"><h3>${b ? '나와 같은 체형이 산 옷' : '인기 상품'}</h3><button class="link" data-a="plGo" data-pl="${esc(JSON.stringify({}))}">전체</button></div></div>
  ${b ? (pp.length ? carousel('pp', pp.map(x => pCard(x.p, x.size)).join('')) : '<div class="empty" style="padding:16px">비슷한 체형의 후기가 아직 부족해요</div>') : carousel('pop', popularProducts().map(p => pCard(p)).join(''))}
  <div class="sec"><div class="sec-h"><h3>비슷한 체형의 폴더</h3></div></div>
  <div class="frow">${folderFor().slice(0, 6).map(fcard).join('')}</div>
  <div class="sec"><div class="sec-h"><h3>사이즈 토크</h3></div></div><div class="talks">${topTalks().map(talkRow).join('')}</div><div style="height:28px"></div>`;
};

/* ---------- 다른 사람의 폴더 ---------- */
const FCM_POOL = ['저도 이 후드 M 입는데 정말 딱이에요', '두 번째 옷 길이는 어때요?', '키 비슷해서 큰 참고가 됐어요 :)', '허리 쪽은 한 치수 크게 가야 할까요?', '폴더 이렇게 모아주셔서 고마워요', '세탁 후에 줄어들지 않았나요?'];
let FC = '';
const fcmOf = f => { const n = hash(f.id + 'c') % 5, out = []; for (let i = 0; i < n; i++) { const h = hash(f.id + 'c' + i); out.push({ id: f.id + '-c' + i, name: nickOfU(f.id + 'c' + i), h: 152 + h % 28, w: 42 + (h >> 3) % 24, text: FCM_POOL[(h + i) % FCM_POOL.length], date: '2026.11.0' + (1 + h % 8) }); } return [...out, ...((S.fcm || {})[f.id] || [])]; };
INP.fcm = t => { FC = t.value; };
ACT.fcSend = t => {
  if (!S.loggedIn) { goLoginSheet(); return; }
  const text = FC.trim(); if (!text) { toast('댓글 내용을 입력해 주세요'); return; }
  const b = S.profile.showBody ? S.body : null; (S.fcm ||= {}); (S.fcm[t.dataset.v] ||= []).push({ id: 'FC' + Date.now(), name: S.profile.nick, h: b && b.h, w: b && b.w, text, date: today(), mine: true });
  FC = ''; save(); toast('댓글을 남겼어요'); reRender();
};
ACT.fcDel = t => { const a = (S.fcm || {})[t.dataset.f]; if (a) S.fcm[t.dataset.f] = a.filter(x => x.id !== t.dataset.v); save(); reRender(); };
const whoRow = (u, nick, h, w) => { const b = S.body, d = b ? `나보다 ${sgn(h - b.h)}cm · ${sgn(w - b.w)}kg` : ''; return `<button class="who6" data-a="openUser" data-v="${esc(u)}"><span class="avatar sm">이미지</span><span class="grow" style="min-width:0;text-align:left"><b>${esc(nick)}</b><small>${h}cm · ${w}kg${d ? ' · ' + d : ''}</small></span><span class="rvgo6">프로필 ›</span></button>`; };
V.folder = p => {
  const f = otherFolders().find(x => x.id === p.id); if (!f) return `${topbar('폴더')}${emptyHTML()}`;
  const b = S.body, dh = b ? f.h - b.h : null, dw = b ? f.w - b.w : null, sv = S.likes.folder || (S.likes.folder = []), on = sv.includes(f.id), cm = fcmOf(f), c = fitCnt(f);
  return `${topbar('폴더')}
  <div class="fh c-${f.color}"><h1 class="disp" style="margin-top:0">${br(f.name.replace(/(.{7,}?) /, '$1\n'))}</h1>${f.desc ? `<p>${esc(f.desc)}</p>` : ''}
  <div class="pls"><span class="pl">♥ ${f.likes + (on ? 1 : 0)}</span><span class="pl">댓글 ${cm.length}</span><span style="flex:1"></span><button class="cbtn lt hb6 ${on ? 'on' : ''}" data-a="fSave" data-v="${f.id}" aria-label="${on ? '저장 취소' : '저장'}">${ico('heart', 'ico')}</button></div></div>
  ${whoRow(f.u, f.nick, f.h, f.w)}
  ${b ? `<div class="fcmp"><div><small>나와 비교</small><b>키 ${sgn(dh)} · 몸무게 ${sgn(dw)}</b></div><span>${c && c.m ? `나에게 맞는 옷 ${c.n}/${c.m}` : (Math.abs(dh) <= 6 && Math.abs(dw) <= 7 ? '비슷한 체형' : '체형 차이')}</span></div>` : ''}
  <div class="sec"><div class="sec-h"><h3>옷 ${f.rows.length}</h3></div></div>
  ${f.rows.map(r => { const o = b ? productOutcome(r.p, b) : null; return `<button class="frw" data-a="openProduct" data-v="${r.p.id}"><span class="ph" style="width:78px;height:98px;flex:none;border-radius:14px"><span>이미지</span>${pimg(r.p.id)}</span><span class="grow" style="min-width:0"><span class="bn6" style="display:block">${esc(brandById[r.p.b].n)}</span><span style="display:block;font-size:14.5px">${esc(r.p.n)}</span><span class="sm mute" style="display:block;margin-top:6px">${esc(f.nick)} <b style="color:var(--ink)">${esc(r.sz)}</b> · ${esc(r.op)}</span>${o ? `<span class="pl sm2 ${vdCls(o)}">나는 ${vdTxt(o)}</span>` : ''}</span></button>`; }).join('')}
  <div class="sec"><div class="sec-h"><h3>댓글 ${cm.length}</h3></div></div>
  <div class="fcm6">${cm.map(x => `<div class="fcr6"><span class="avatar sm">이미지</span><div class="grow"><div class="row" style="gap:6px;flex-wrap:wrap"><b class="sm">${esc(x.name)}</b>${x.mine ? '<span class="pill dark">나</span>' : ''}${x.h ? `<span class="xs mute">${x.h} · ${x.w}kg</span>` : ''}<span class="xs mute">${x.date}</span></div><p class="sm" style="margin:2px 0 0;white-space:pre-wrap">${esc(x.text)}</p>${x.mine ? `<button class="link xs" data-a="fcDel" data-f="${f.id}" data-v="${x.id}">삭제</button>` : ''}</div></div>`).join('') || '<div class="sm mute" style="padding:6px 0 10px">첫 댓글을 남겨보세요</div>'}
  ${S.loggedIn ? `<div class="rpbox"><textarea class="inp" rows="2" maxlength="200" data-i="fcm" placeholder="궁금한 점이나 도움 된 점을 남겨요">${esc(FC)}</textarea><button class="btn pri s" data-a="fcSend" data-v="${f.id}">등록</button></div>` : `<div class="card fill row between" style="padding:12px 14px"><span class="sm">로그인 후 댓글을 남길 수 있어요</span><button class="btn s pri" data-a="goLogin">로그인</button></div>`}</div>
  <div class="sec"><div class="sec-h"><h3>비슷한 체형의 다른 폴더</h3></div></div><div class="frow">${folderFor().filter(x => x.id !== f.id).slice(0, 5).map(fcard).join('')}</div><div style="height:28px"></div>`;
};
ACT.openUser = t => { UP = { tab: 'folder' }; go('user', { u: t.dataset.v }); };
let UP = { tab: 'folder' };
ACT.upTab = t => { UP.tab = t.dataset.v; reRender(); };
V.user = p => {
  const u = p.u, d = DB.U[u]; if (!d) return `${topbar('프로필')}${emptyHTML()}`;
  const b = S.body, fs = otherFolders().filter(f => f.u === u), rs = RV.filter(r => r.u === u && prodById[r.p]).slice(0, 20), cmp = b ? `나보다 ${sgn(d[0] - b.h)}cm · ${sgn(d[1] - b.w)}kg` : '';
  const tab = UP.tab === 'review' ? 'review' : 'folder';
  return `${topbar('')}<div class="up6"><span class="avatar up6a">이미지</span><h1 class="disp" style="margin:12px 0 0;font-size:30px">${esc(nickOfU(u))}</h1><div class="sm mute" style="margin-top:4px">${esc(uidOf(u))}</div>
  <div class="pls" style="justify-content:center;margin-top:14px"><span class="pl">${d[0]}cm</span><span class="pl">${d[1]}kg</span>${cmp ? `<span class="pl dk">${cmp}</span>` : ''}</div></div>
  <div class="tabs t0">${[['folder', `폴더 ${fs.length}`], ['review', `후기 ${rs.length}`]].map(([k, l]) => `<button class="${tab === k ? 'on' : ''}" data-a="upTab" data-v="${k}">${l}</button>`).join('')}</div>
  ${tab === 'folder' ? (fs.length ? `<div class="fgrid">${fs.map(fcard).join('')}</div>` : emptyHTML('공개한 폴더가 없어요')) : (rs.length ? rs.map(reviewWithProd).join('') : emptyHTML('작성한 후기가 없어요'))}<div style="height:28px"></div>`;
};
ACT.fSave = t => { const a = S.likes.folder || (S.likes.folder = []), id = t.dataset.v; S.likes.folder = a.includes(id) ? a.filter(x => x !== id) : [...a, id]; save(); reRender(); };

/* ---------- 기록 · 내 옷장 ---------- */
V.records = () => {
  seedV06(); if (RK === '전체') RK = '내 옷장';
  const closet = RK === '내 옷장', n = recordItems().length, fs = S.folders || [];
  const fcards = fs.map(f => `<button class="mf c-${f.color}" data-a="openMyFolder" data-v="${f.id}"><span class="mf-t">${esc(f.name)}</span><span class="mf-m">옷 ${f.items.length} · ${f.pub ? '공개' : '비공개'}</span></button>`).join('');
  return `<div class="hero6" style="padding-top:2px">${segHTML(['분석', '내 옷장'], RK, 'rkTab', 'dk')}<h1 class="disp" style="margin-top:18px">${closet ? '입어본 옷' : '측정한 옷'}<br>${U6(`<span class="cnt" data-n="${n}">${n}</span>벌`)}</h1></div>
  ${closet ? `<div class="sec"><div class="sec-h"><h3>폴더</h3></div></div><div class="frow">${fcards}<button class="mf new" data-a="folderNew">${ico('plus', 'ico')}<span>새 폴더</span></button></div>` : ''}
  <div class="sec"><div class="sec-h"><h3>${closet ? '옷' : '분석'}</h3><button class="link" data-a="rSort" style="text-decoration:none">${RSORT === 'new' ? '최신순' : '오래된순'} ⇅</button></div></div>
  <div id="rlist">${recordListHTML()}</div><div style="height:90px"></div>
  ${closet ? `<div class="fabwrap"><button class="fab6" data-a="closetNew">${ico('plus', 'ico')}옷 추가</button></div>` : ''}`;
};

/* ---------- 폴더 만들기 → 옷 담기 → 정리 ---------- */
let FN = { name: '', desc: '', color: 'y', mood: '', pub: true };
ACT.folderNew = () => { FN = { name: '', desc: '', color: 'y', mood: '', pub: true }; go('foldernew'); };
V.foldernew = () => `${topbar('새 폴더', { left: 'close' })}
  <div class="fh c-${FN.color}" style="margin-top:8px;min-height:150px"><div class="fh-s">미리보기</div><h1 class="disp" id="fn-pv" style="margin-top:34px">${esc(FN.name) || '폴더 이름'}</h1></div>
  <div class="pad" style="padding-top:22px"><div class="field"><label class="f" for="fn-n">이름</label><input id="fn-n" class="inp rnd" maxlength="20" data-i="fn" data-k="name" value="${esc(FN.name)}" placeholder="예: 출근룩, 전부 M"></div>
  <div class="field"><label class="f" for="fn-d">한 줄 소개</label><input id="fn-d" class="inp rnd" maxlength="50" data-i="fn" data-k="desc" value="${esc(FN.desc)}" placeholder="폴더를 소개해 주세요"></div>
  <div class="field"><label class="f">분위기 <span class="mute xs b">(선택)</span></label><div class="chips">${MOODS.map(m => `<button class="chip ${FN.mood === m ? 'on' : ''}" data-a="fnMood" data-v="${m}">${m}</button>`).join('')}</div></div>
  <div class="field"><label class="f">카드 색</label><div class="sws">${FCOL.map(c => `<button class="swc c-${c} ${FN.color === c ? 'on' : ''}" data-a="fnColor" data-v="${c}" aria-label="색 ${c}">${FN.color === c ? '✓' : ''}</button>`).join('')}</div></div>
  <div class="row between" style="padding:6px 0"><span>다른 사람에게 공개</span>${swHTML(FN.pub, 'fnPub')}</div></div>
  <div class="dock"><button class="btn pri full" data-a="fnNext">다음 · 옷 고르기</button></div>`;
INP.fn = t => { FN[t.dataset.k] = t.value; if (t.dataset.k === 'name') { const e = $('#fn-pv'); if (e) e.textContent = t.value || '폴더 이름'; } };
ACT.fnColor = t => { FN.color = t.dataset.v; reRender(); };
ACT.fnMood = t => { FN.mood = FN.mood === t.dataset.v ? '' : t.dataset.v; reRender(); };
ACT.fnPub = () => { FN.pub = !FN.pub; reRender(); };
ACT.fnNext = () => {
  if (!FN.name.trim()) { toast('폴더 이름을 입력해 주세요'); return; }
  const f = { id: 'F' + Date.now(), name: FN.name.trim(), desc: FN.desc.trim(), color: FN.color, mood: FN.mood, pub: FN.pub, items: [] };
  (S.folders ||= []).push(f); save(); stack.pop(); go('folderpick', { id: f.id });
};
let FPQ = '', FPC = '전체';
V.folderpick = p => {
  const f = S.folders.find(x => x.id === p.id), q = FPQ.trim();
  const list = S.closet.filter(c => (FPC === '전체' || c.cat === FPC) && (!q || findIn(c.name, q) || findIn(c.brand, q)));
  return `${topbar(f.name, { left: 'back' })}<div class="hero6" style="padding-top:0"><h1 class="disp">담을 옷 ${U6(f.items.length + '벌')}</h1></div>
  <div class="pad" style="padding-bottom:0"><div class="search"><input id="fp-q" class="inp rnd" data-i="fpq" value="${esc(FPQ)}" placeholder="내 옷장에서 찾기" autocomplete="off">${ico('search')}</div></div>
  <div class="chips" style="padding:12px 16px">${chipsHTML(['전체', ...CATS], FPC, 'fpCat')}</div>
  ${list.length ? `<div class="pgrid3">${list.map(c => { const on = f.items.includes(c.id), pr = prodById[c.productId]; return `<button class="pk ${on ? 'on' : ''}" data-a="fpTog" data-v="${c.id}" data-f="${f.id}"><span class="ph"><span>이미지</span>${pr ? pimg(pr.id) : ''}<i class="ck">${on ? '✓' : ''}</i></span><b class="bn6">${esc(c.brand || '')}</b><span class="xs mute">${esc(c.size)} · ${OVL[c.overall] || ''}</span></button>`; }).join('')}</div>` : `<div class="empty"><b class="en">담을 옷이 없어요</b><div class="mt12"><button class="btn s pri" data-a="closetNew">옷 추가하기</button></div></div>`}
  <div style="height:90px"></div><div class="dock"><button class="btn pri full" data-a="fpDone" data-v="${f.id}">폴더에 담기</button></div>`;
};
INP.fpq = t => { FPQ = t.value; reRender(); const i = $('#fp-q'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } };
ACT.fpCat = t => { FPC = t.dataset.v; reRender(); };
ACT.fpTog = t => { const f = S.folders.find(x => x.id === t.dataset.f), id = t.dataset.v; f.items = f.items.includes(id) ? f.items.filter(x => x !== id) : [...f.items, id]; save(); reRender(); };
ACT.fpDone = t => { const id = t.dataset.v; FPQ = ''; FPC = '전체'; if (stack.at(-2) && stack.at(-2).v === 'myfolder') { back(); } else { stack.pop(); go('myfolder', { id }); } };
let MFM = '';   // '' | 'sort' | 'rm'
V.myfolder = p => {
  const f = S.folders.find(x => x.id === p.id); if (!f) return `${topbar('폴더')}${emptyHTML()}`;
  const its = f.items.map(id => S.closet.find(c => c.id === id)).filter(Boolean), sv = S.likes.folder || [];
  return `${topbar('내 폴더', { right: `<button class="ib" data-a="mfDel" data-v="${f.id}" aria-label="폴더 삭제">${ico('close')}</button>` })}
  <div class="fh c-${f.color}"><div class="row between"><span class="pl sm2">${f.pub ? '공개' : '비공개'}</span><button class="link" data-a="mfPub" data-v="${f.id}" style="text-decoration:none">${f.pub ? '비공개로' : '공개로'}</button></div><h1 class="disp" style="margin-top:14px">${br(f.name)}</h1>${f.desc ? `<p>${esc(f.desc)}</p>` : ''}<div class="pls">${plb('옷 ' + its.length)}</div></div>
  <div class="row between" style="padding:26px 20px 8px"><h3 class="h22">옷 ${its.length}</h3><span class="row" style="gap:8px"><button class="pl sm2 ${MFM === 'sort' ? 'dk' : ''}" data-a="mfMode" data-v="sort">순서 바꾸기</button><button class="pl sm2 ${MFM === 'rm' ? 'dk' : ''}" data-a="mfMode" data-v="rm">빼기</button></span></div>
  ${its.map((c, i) => { const pr = prodById[c.productId]; return `<div class="frw" style="align-items:center"><span class="ph" style="width:60px;height:74px;flex:none;border-radius:12px"><span>이미지</span>${pr ? pimg(pr.id) : ''}</span><span class="grow" style="min-width:0"><span class="bn6" style="display:block">${esc(c.brand || '')}</span><span style="display:block;font-size:14.5px">${esc(c.name || '')}</span><span class="sm" style="display:block;margin-top:5px;font-weight:${OVW[c.overall] || 600}">${esc(c.size)} · ${OVL[c.overall] || ''}</span></span>${MFM === 'sort' ? `<span class="row" style="gap:2px"><button class="ib" data-a="mfMove" data-f="${f.id}" data-v="${i}" data-d="-1" aria-label="위로" ${i === 0 ? 'disabled' : ''}>▲</button><button class="ib" data-a="mfMove" data-f="${f.id}" data-v="${i}" data-d="1" aria-label="아래로" ${i === its.length - 1 ? 'disabled' : ''}>▼</button></span>` : MFM === 'rm' ? `<button class="pl sm2" data-a="mfRm" data-f="${f.id}" data-v="${c.id}">빼기</button>` : ''}</div>`; }).join('') || '<div class="empty"><b class="en">아직 담은 옷이 없어요</b></div>'}
  <div style="height:90px"></div><div class="dock"><button class="btn pri full" data-a="mfAdd" data-v="${f.id}">${ico('plus', 'ico')} 옷 담기</button></div>`;
};
ACT.mfMode = t => { MFM = MFM === t.dataset.v ? '' : t.dataset.v; reRender(); };
ACT.mfAdd = t => { MFM = ''; go('folderpick', { id: t.dataset.v }); };
ACT.mfPub = t => { const f = S.folders.find(x => x.id === t.dataset.v); f.pub = !f.pub; save(); reRender(); };
ACT.mfMove = t => { const f = S.folders.find(x => x.id === t.dataset.f), i = +t.dataset.v, j = i + +t.dataset.d; if (j < 0 || j >= f.items.length) return; [f.items[i], f.items[j]] = [f.items[j], f.items[i]]; save(); reRender(); };
ACT.mfRm = t => { const f = S.folders.find(x => x.id === t.dataset.f); f.items = f.items.filter(x => x !== t.dataset.v); save(); reRender(); };
ACT.mfDel = t => sheet(`<h3>이 폴더를 삭제할까요?</h3><p class="sub">폴더만 삭제되고 옷은 내 옷장에 남아요.</p><div class="row mt16"><button class="btn flat grow" data-a="sheetClose">취소</button><button class="btn pri grow" data-a="mfDelDo" data-v="${t.dataset.v}">삭제</button></div>`, true);
ACT.mfDelDo = t => { S.folders = S.folders.filter(x => x.id !== t.dataset.v); save(); closeSheet(); MFM = ''; back(); };

/* ---------- 옷 추가: 어떤 옷 → 산 사이즈 → 입어보니 ---------- */
let CA = { q: '', pid: null, size: '', fit: '맞아요', pub: true, folder: '' };
const caRes = () => { const q = CA.q.trim(); if (!q) return ''; const hits = PR.filter(p => findIn(p.n, q) || findIn(brandById[p.b].n, q)).slice(0, 6); return hits.length ? `<div class="list" style="margin:8px 0 0">${hits.map(p => `<button class="li" data-a="caPick" data-v="${p.id}" style="padding:10px 4px"><span class="ph" style="width:44px;height:54px;flex:none;border-radius:10px"><span>이미지</span>${pimg(p.id)}</span><span class="grow"><span class="bn6" style="display:block">${esc(brandById[p.b].n)}</span><span style="font-size:14.5px">${esc(p.n)}</span></span></button>`).join('')}</div>` : `<p class="sm mute" style="margin:10px 4px">찾는 옷이 없어요</p>`; };
ACT.closetNew = () => { CA = { q: '', pid: null, size: '', fit: '맞아요', pub: true, folder: '' }; go('closetAdd', {}); };
const _closetAddFull = V.closetAdd;
const qh = (n, t) => `<div class="qh"><small>${n} / 3</small><h2>${t}</h2></div>`;
V.closetAdd = p => {
  if (p.id || p.full) return manualForm(p);
  const pr = CA.pid ? prodById[CA.pid] : null, fd = (S.folders || []).find(f => f.id === CA.folder);
  return `${topbar('옷 추가', { left: 'close' })}${qh(1, '어떤 옷이에요?')}
  <div class="pad" style="padding-top:0"><div class="search"><input id="ca-q" class="inp rnd" data-i="caq" value="${esc(CA.q)}" placeholder="브랜드나 상품명으로 찾기" autocomplete="off">${ico('search')}</div>
  <div id="ca-res">${pr ? '' : caRes()}</div>
  ${pr ? `<div class="cpick"><span class="ph" style="width:52px;height:64px;flex:none;border-radius:12px"><span>이미지</span>${pimg(pr.id)}</span><span class="grow"><span class="bn6" style="display:block">${esc(brandById[pr.b].n)}</span><span style="font-size:15px">${esc(pr.n)}</span></span><button class="ib" data-a="caClear" aria-label="다시 고르기">${ico('close')}</button></div>` : `<button class="link xs" data-a="caFree" style="margin:12px 4px 0;display:block">찾는 옷이 없나요? 직접 입력</button>`}</div>
  ${pr ? `${qh(2, '몇 사이즈 샀어요?')}<div class="szs">${pr.sz.map(s => `<button class="${CA.size === s ? 'on' : ''}" data-a="caSize" data-v="${esc(s)}">${esc(s)}</button>`).join('')}</div>
  ${qh(3, '입어보니')}<div class="fits">${['작아요', '맞아요', '커요'].map(f => `<button class="fit ${CA.fit === f ? 'on' : ''}" data-a="caFit" data-v="${f}"><span>${f}</span><i></i></button>`).join('')}</div>
  <div class="opts"><button class="opt" data-a="caFolder"><span>폴더에 넣기</span><span class="mute sm">${fd ? esc(fd.name) : '선택 안 함'} ${ico('chev', 'ico')}</span></button><div class="opt"><span>후기로 공개<small>${S.body ? S.body.h + ' · ' + S.body.w + '와 함께 보여요' : ''}</small></span>${swHTML(CA.pub, 'caPub')}</div></div>` : ''}
  <div style="height:90px"></div><div class="dock"><button class="btn pri full" data-a="caSave" ${pr && CA.size ? '' : 'disabled'}>저장</button></div>`;
};
INP.caq = t => { CA.q = t.value; const e = $('#ca-res'); if (e) e.innerHTML = caRes(); };
ACT.caPick = t => { CA.pid = t.dataset.v; const p = prodById[CA.pid]; CA.size = (p.sz || []).includes('M') ? 'M' : ''; reRender(); };
ACT.caClear = () => { CA.pid = null; CA.size = ''; reRender(); };
ACT.caSize = t => { CA.size = t.dataset.v; reRender(); };
ACT.caFit = t => { CA.fit = t.dataset.v; reRender(); };
ACT.caPub = () => { CA.pub = !CA.pub; reRender(); };
ACT.caFree = () => { AC_RESET(); FB = newFB(); FB.reqColor = true; go('closetAdd', { full: 1 }); };
ACT.caFolder = () => sheet(`<h3>폴더에 넣기</h3><div class="list" style="margin:8px -16px 0"><button class="li" data-a="caFolderSet" data-v="" style="padding:14px 16px"><b class="sm">선택 안 함</b></button>${(S.folders || []).map(f => `<button class="li" data-a="caFolderSet" data-v="${f.id}" style="padding:14px 16px"><b class="sm">${esc(f.name)}</b></button>`).join('')}</div>`);
ACT.caFolderSet = t => { CA.folder = t.dataset.v; closeSheet(); reRender(); };
ACT.caSave = () => {
  const p = prodById[CA.pid]; if (!p || !CA.size) return;
  const item = { ...newFB(p.c), brandId: p.b, brand: brandById[p.b].n, productId: p.id, name: p.n, color: (p.col && p.col[0]) || '기타', size: CA.size, overall: { 작아요: '작음', 맞아요: '정핏', 커요: '여유' }[CA.fit], pub: CA.pub, id: 'C' + Date.now(), date: today() };
  S.closet.unshift(item); const f = (S.folders || []).find(x => x.id === CA.folder); if (f) f.items.push(item.id);
  save(); toast('옷장에 담았어요'); back();
};

/* ---------- 마이 ---------- */
const mrow6 = (a, t, n = '') => `<button class="mrow" data-a="${a}"><span>${t}</span><span class="mute">${n}${ico('chev', 'ico')}</span></button>`;
const myReplies = () => Object.entries(S.replies || {}).flatMap(([rid, a]) => a.filter(x => x.mine).map(x => ({ ...x, rid })));
V.my = () => {
  seedV06();
  const b = S.body, nr = S.loggedIn ? S.closet.filter(c => c.pub).length : 0, nrp = S.loggedIn ? myReplies().length : 0;
  return `<div class="hero6"><small>마이</small><h1 class="disp">안녕하세요,<br>${U6(esc(S.profile.nick))}님</h1></div>
  <button class="pfrow" data-a="goProfile">${avatar(48)}<span class="grow"><b>${esc(S.profile.nick)}</b><span class="xs mute" style="display:block">@${esc(S.profile.uid)}</span></span><span class="cbtn lt">${ico('chev', 'ico')}</span></button>
  ${S.loggedIn ? '' : `<div class="pad" style="padding-bottom:0"><button class="btn pri full" data-a="goLogin">로그인</button></div>`}
  <button class="body6" data-a="goMyfit"><span class="row between"><span class="pl sm2 dk">내 몸</span><b class="sm">수정</b></span>${b ? `<span class="bigno"><span class="cnt" data-n="${b.h}">${b.h}</span><i>cm</i> <span class="cnt" data-n="${b.w}">${b.w}</span><i>kg</i></span><span class="sm" style="display:block;margin-top:8px">${esc(b.pref || '기본 핏')}</span>` : `<span class="disp" style="display:block;margin-top:18px;font-size:28px">키와 몸무게를<br>입력해 주세요</span>`}</button>
  <div class="mlist">${mrow6('goMine', '내 후기', nr ? nr + '개 ' : '')}${mrow6('goLikes', '찜')}${mrow6('goRecent', '최근 본 상품')}${mrow6('goSettings', '설정')}</div><div style="height:24px"></div>`;
};
ACT.goMine = () => go('mine'); ACT.goSettings = () => go('settings');
V.mine = () => {
  const rv = S.closet.filter(c => c.pub).sort((x, y) => (y.date || '').localeCompare(x.date || ''));
  const fitC = { 작음: 'tight', 정핏: 'ok', 여유: 'loose' };
  return `${topbar('내 후기')}<div class="hero6" style="padding-top:6px"><h1 class="disp">${U6(`<span class="cnt" data-n="${rv.length}">${rv.length}</span>개`)}의<br>후기</h1></div>
  ${rv.length ? rv.map(c => { const pr = prodById[c.productId]; return `<button class="mrv6" data-a="${pr ? 'openProduct' : 'closetEdit'}" data-v="${pr ? pr.id : c.id}"><span class="ph" style="width:56px;height:66px;flex:none;border-radius:12px"><span>이미지</span>${pr ? pimg(pr.id) : ''}</span><span class="grow" style="min-width:0"><span class="row between" style="align-items:flex-start"><span><span class="bn6" style="display:block">${esc(c.brand || '')}</span><span style="font-size:14.5px;display:block">${esc(c.name || '')}</span></span><span class="xs mute">${esc((c.date || '').slice(5))}</span></span><span class="row" style="gap:6px;margin-top:7px"><span class="pl">${esc(c.size)} 구매</span><span class="pl mv-${fitC[c.overall] || 'ok'}">${OVL[c.overall] || ''}</span></span>${c.memo ? `<span class="mmemo6">${esc(c.memo)}</span>` : ''}</span></button>`; }).join('') : '<div class="empty"><b class="en">공개한 후기가 없어요</b><span class="sm">내 옷장에서 옷을 후기로 공개하면 여기에 모여요</span></div>'}<div style="height:24px"></div>`;
};
V.settings = () => `${topbar('설정')}<div class="mlist" style="margin-top:8px">${mrow6('goMyfit', '내 신체 치수')}${mrow6('goNset', '알림 설정')}${mrow6('goPw', '비밀번호 변경')}${mrow6('goPrivacy', '개인정보 관리')}${mrow6('goInq', '문의 내역')}${S.loggedIn ? mrow6('logout', '로그아웃') : ''}</div>`;


/* ================= 추가 개편 (홈 큐레이션 · 목록 페이지 · 내 옷장과 비교 · 필터 · 직접 입력) ================= */
const brandSet = new Set();
let _oc = {}, _ocKey = '';
const oc = p => { const k = JSON.stringify(S.body); if (k !== _ocKey) { _oc = {}; _ocKey = k; } return p.id in _oc ? _oc[p.id] : (_oc[p.id] = S.body ? productOutcome(p, S.body) : null); };
const profDone = () => !!(S.loggedIn && S.body && (S.profile.styles || []).length);
const styleHit = b => (b.st || []).filter(x => (S.profile.styles || []).includes(x) || (x === '시티' && (S.profile.styles || []).includes('시티보이'))).length;
function recoBrands() {
  return BR.map(b => { const ps = PR.filter(p => p.b === b.id && genderOk(p)), fits = ps.filter(p => { const o = oc(p); return o && o.state === 'fit'; }).length; return { b, fits, m: styleHit(b) }; })
    .filter(x => x.m > 0 && x.fits >= 2).sort((a, c) => c.m - a.m || c.fits - a.fits || a.b.n.localeCompare(c.b.n, 'ko'));
}
function recoProducts() {
  const ids = new Set(recoBrands().map(x => x.b.id));
  return PR.filter(p => ids.has(p.b) && genderOk(p) && oc(p) && oc(p).state === 'fit').sort((a, c) => (revByProd[c.id]?.length || 0) - (revByProd[a.id]?.length || 0) || a.id.localeCompare(c.id));
}
const bcard = x => `<button class="bc" data-a="openBrand" data-v="${x.b.id}"><span class="logo im">이미지</span><b>${esc(x.b.n)}</b><span class="xs mute">맞는 옷 ${x.fits}개</span></button>`;
const promptCard = () => `<div class="pcard6"><div><b>${S.loggedIn ? '프로필을 완성해 보세요' : '로그인하고 추천받아 보세요'}</b><p>${S.loggedIn ? '선호 스타일을 고르면 나를 위한 상품과 브랜드가 생겨요' : '프로필을 완성하면 나를 위한 상품과 브랜드가 생겨요'}</p></div><button class="btn s pri" data-a="${S.loggedIn ? 'goProfile' : 'goLogin'}">${S.loggedIn ? '완성하기' : '로그인'}</button></div>`;
V.home = () => {
  seedV06();
  const b = S.body, pp = personalProducts(8), done = profDone();
  const rp = done ? recoProducts().slice(0, 8) : [], rb = done ? recoBrands().slice(0, 8) : [];
  return `${b ? '<div style="height:6px"></div>' : `<div class="hero6"><h1 class="disp">내 몸에 맞는<br>${U6('사이즈')}를 찾아요</h1></div>${myBlock()}`}${bannerHTML()}
  ${done ? '' : promptCard()}
  ${done && rp.length ? `<div class="sec"><div class="sec-h"><h3>나를 위한 추천 상품</h3><button class="link" data-a="goReco" data-v="상품">전체</button></div></div>${carousel('rp', rp.map(p => pCard(p)).join(''))}` : ''}
  ${done && rb.length ? `<div class="sec"><div class="sec-h"><h3>나를 위한 추천 브랜드</h3><button class="link" data-a="goReco" data-v="브랜드">전체</button></div></div><div class="frow">${rb.map(bcard).join('')}</div>` : ''}
  <div class="sec"><div class="sec-h"><h3>${b ? '나와 같은 체형이 산 옷' : '인기 상품'}</h3><button class="link" data-a="plGo" data-pl="${esc(JSON.stringify({}))}">전체</button></div></div>
  ${b ? (pp.length ? carousel('pp', pp.map(x => pCard(x.p, x.size)).join('')) : '<div class="empty" style="padding:16px">비슷한 체형의 후기가 아직 부족해요</div>') : carousel('pop', popularProducts().map(p => pCard(p)).join(''))}
  <div class="sec"><div class="sec-h"><h3>비슷한 체형의 폴더</h3><button class="link" data-a="goFolders">전체</button></div></div>
  <div class="frow">${folderFor().slice(0, 6).map(fcard).join('')}</div>
  <div class="sec"><div class="sec-h"><h3>사이즈 토크</h3><button class="link" data-a="goTalks">전체</button></div></div><div class="talks">${topTalks().map(talkRow).join('')}</div><div style="height:28px"></div>`;
};
/* 나를 위한 추천 */
let RCK = '상품', RCC = '전체', RCS = 'rev';
ACT.goReco = t => { RCK = t.dataset.v || '상품'; RCC = '전체'; go('reco'); };
V.reco = () => {
  const ps = recoProducts().filter(p => RCC === '전체' || p.c === RCC);
  ps.sort(RCS === 'rev' ? (a, c) => (revByProd[c.id]?.length || 0) - (revByProd[a.id]?.length || 0) : RCS === 'low' ? (a, c) => a.pr - c.pr : (a, c) => c.pr - a.pr);
  return `${topbar('나를 위한 추천')}<div class="pad" style="padding-bottom:0">${segHTML(['상품', '브랜드'], RCK, 'rcKind', 'dk')}</div>
  ${RCK === '상품' ? `<div class="chips scroll" style="padding:14px 16px 4px">${chipsHTML(['전체', ...BCATS], RCC, 'rcc6')}</div><div class="row between" style="padding:8px 16px"><span class="sm mute">${ps.length}개</span><select class="inp sel6" data-c="rcSort" aria-label="정렬"><option value="rev" ${RCS === 'rev' ? 'selected' : ''}>후기 많은 순</option><option value="low" ${RCS === 'low' ? 'selected' : ''}>가격 낮은 순</option><option value="high" ${RCS === 'high' ? 'selected' : ''}>가격 높은 순</option></select></div><div class="cgrid">${ps.slice(0, 60).map(p => pCard(p)).join('') || '<div class="empty">조건에 맞는 상품이 없어요</div>'}</div>`
    : `<div class="list" style="margin-top:8px">${recoBrands().map(x => `<button class="brand-row" data-a="openBrand" data-v="${x.b.id}"><span class="logo im">이미지</span><span class="grow"><b>${esc(x.b.n)}</b><span class="xs mute" style="display:block">맞는 옷 ${x.fits}개 · ${(x.b.st || []).slice(0, 2).join(' · ')}</span></span><span class="chev">${ico('chev', 'ico')}</span></button>`).join('') || '<div class="empty">추천 브랜드가 아직 없어요</div>'}</div>`}<div style="height:24px"></div>`;
};
ACT.rcKind = t => { RCK = t.dataset.v; reRender(); }; ACT.rcc6 = t => { RCC = t.dataset.v; reRender(); }; CHG.rcSort = t => { RCS = t.value; reRender(); };
/* 폴더 전체 */
/* ---------- 폴더 전체 보기 · 검색 · 필터(체형 범위 슬라이더) ---------- */
const HR_MIN = 145, HR_MAX = 185, WT_MIN = 40, WT_MAX = 80;
const MOODS = ['데일리', '출근룩', '캐주얼', '스트릿', '미니멀', '러블리'];
const WORRIES = [['소매가 짧아요', ['소매'], ['타이트']], ['어깨가 좁아요', ['어깨'], ['타이트']], ['가슴이 답답해요', ['가슴'], ['타이트']], ['허리가 남아요', ['허리'], ['여유']], ['허벅지·힙이 끼어요', ['허벅지', '힙'], ['타이트']], ['기장이 짧아요', ['총장'], ['타이트', '짧은 편']]];
const FL0 = () => ({ q: '', sim: false, hmin: HR_MIN, hmax: HR_MAX, wmin: WT_MIN, wmax: WT_MAX, kinds: [], worries: [], moods: [], fitq: '', sort: 'sim' });
let FL = FL0(), FLt = null;
ACT.goFolders = () => go('folders');
const fitCnt = f => { if (!S.body) return null; let n = 0, m = 0; f.rows.forEach(r => { const o = oc(r.p); if (o) { m++; if (o.state !== 'nofit') n++; } }); return { n, m }; };
const flHit = (f, s) => {
  const b = S.body, q = s.q.trim();
  if (q && !(findIn(f.name, q) || findIn(f.nick, q) || f.rows.some(r => findIn(r.p.n, q) || findIn(brandById[r.p.b].n, q)))) return false;
  if (s.sim && b && !(Math.abs(f.h - b.h) <= 6 && Math.abs(f.w - b.w) <= 7)) return false;
  if (s.hmin > HR_MIN && f.h < s.hmin) return false; if (s.hmax < HR_MAX && f.h > s.hmax) return false;
  if (s.wmin > WT_MIN && f.w < s.wmin) return false; if (s.wmax < WT_MAX && f.w > s.wmax) return false;
  if (s.kinds.length && !s.kinds.some(k => f.kinds.includes(k))) return false;
  if (s.worries.length && !s.worries.some(k => f.worries.includes(k))) return false;
  if (s.moods.length && !s.moods.includes(f.mood)) return false;
  if (s.fitq && b) { const c = fitCnt(f); if (!c || !c.m) return false; const r = c.n / c.m; if (r < (s.fitq === 'most' ? 0.8 : 0.5)) return false; }
  return true;
};
const flList = s => {
  const b = S.body, d = f => b ? Math.abs(f.h - b.h) + Math.abs(f.w - b.w) : 0;
  return otherFolders().filter(f => flHit(f, s)).sort(s.sort === 'sim' && b ? (x, y) => d(x) - d(y) : s.sort === 'fit' && b ? (x, y) => { const a = fitCnt(x), c = fitCnt(y); return (c.n / (c.m || 1)) - (a.n / (a.m || 1)) || d(x) - d(y); } : s.sort === 'many' ? (x, y) => y.rows.length - x.rows.length : (x, y) => y.likes - x.likes);
};
const flCount = () => (FL.sim ? 1 : 0) + (FL.hmin > HR_MIN || FL.hmax < HR_MAX ? 1 : 0) + (FL.wmin > WT_MIN || FL.wmax < WT_MAX ? 1 : 0) + FL.kinds.length + FL.worries.length + FL.moods.length + (FL.fitq ? 1 : 0);
V.folders = () => {
  const b = S.body, fs = flList(FL), n = flCount();
  return `${topbar('폴더')}
  <div class="row" style="padding:12px 16px 0;gap:8px"><div class="search grow"><input id="flq" class="inp rnd" data-i="flq" value="${esc(FL.q)}" placeholder="폴더·작성자·옷 이름 검색" autocomplete="off">${ico('search')}</div><button class="fbtn6 ${n ? 'on' : ''}" data-a="flOpen" aria-label="필터">${ico('filter', 'ico')}${n ? `<i>${n}</i>` : ''}</button></div>
  <div class="chips scroll" style="padding:12px 16px 0">${b ? `<button class="chip ${FL.sim ? 'on' : ''}" data-a="flSim">비슷한 체형</button>` : ''}${CATS.map(k => `<button class="chip ${FL.kinds.includes(k) ? 'on' : ''}" data-a="flKind" data-v="${k}">${k}</button>`).join('')}</div>
  ${b ? `<div class="fcmp" style="margin:12px 16px 0"><div><small>내 체형</small><b>키 ${b.h} · 몸무게 ${b.w}</b></div><span>가까운 순으로 보여요</span></div>` : ''}
  <div class="row between" style="padding:12px 16px 8px"><span class="sm mute" id="flcnt">${fs.length}개</span><select class="inp sel6" data-c="flSort" aria-label="정렬">${(b ? [['sim', '나와 비슷한 체형순'], ['fit', '나에게 맞는 옷 많은순']] : []).concat([['pop', '인기순'], ['many', '옷 많은 순']]).map(([v, l]) => `<option value="${v}" ${FL.sort === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
  <div class="fgrid" id="flgrid">${fs.map(fcard).join('') || `<div class="empty" style="grid-column:1/-1"><b class="en">조건에 맞는 폴더가 없어요</b><div class="mt12"><button class="btn s flat" data-a="flClear">필터 지우기</button></div></div>`}</div><div style="height:24px"></div>`;
};
INP.flq = t => { FL.q = t.value; const fs = flList(FL); $('#flgrid').innerHTML = fs.map(fcard).join('') || `<div class="empty" style="grid-column:1/-1"><b class="en">조건에 맞는 폴더가 없어요</b></div>`; $('#flcnt').textContent = fs.length + '개'; };
ACT.flSim = () => { FL.sim = !FL.sim; reRender(); };
ACT.flKind = t => { const v = t.dataset.v; FL.kinds = FL.kinds.includes(v) ? FL.kinds.filter(x => x !== v) : [...FL.kinds, v]; reRender(); };
ACT.flClear = () => { FL = { ...FL0(), sort: FL.sort }; reRender(); };
CHG.flSort = t => { FL.sort = t.value; reRender(); };
/* 필터 시트 */
const hist = (vals, lo, step, n) => { const a = Array(n).fill(0); vals.forEach(v => { a[Math.max(0, Math.min(n - 1, Math.floor((v - lo) / step)))]++; }); return a; };
const rgLbl = (mn, mx, lo, hi, u) => mn <= lo && mx >= hi ? '전체' : mn <= lo ? `${mx}${u} 이하` : mx >= hi ? `${mn}${u} 이상` : `${mn}–${mx}${u}`;
function rgHTML(k, lo, hi, u, vals, mn, mx, step = 5) {
  const nb = (hi - lo) / step, h = hist(vals, lo, step, nb), top = Math.max(1, ...h);
  const on = i => { const a = lo + i * step, z = a + step; return z > mn && a <= mx; };
  return `<div class="row between"><label class="f" style="margin:0">${k === 'h' ? '키' : '몸무게'}</label><b id="rg-${k}-l">${rgLbl(mn, mx, lo, hi, u)}</b></div>
  <div class="rg" id="rg-${k}"><div class="rg-in"><div class="rg-hist">${h.map((c, i) => `<i class="${on(i) ? 'on' : ''}" style="height:${Math.max(6, Math.round(c / top * 100))}%"></i>`).join('')}</div><div class="rg-tr"><i style="left:${(mn - lo) / (hi - lo) * 100}%;right:${(hi - mx) / (hi - lo) * 100}%"></i></div></div>
  <input type="range" min="${lo}" max="${hi}" step="1" value="${mn}" data-i="flR" data-k="${k}min" aria-label="${k === 'h' ? '키' : '몸무게'} 최소"><input type="range" min="${lo}" max="${hi}" step="1" value="${mx}" data-i="flR" data-k="${k}max" aria-label="${k === 'h' ? '키' : '몸무게'} 최대"></div>
  <div class="rg-ax"><span>${lo}</span><span>${hi}${u}</span></div>`;
}
function flSheet() {
  const b = S.body, of = otherFolders(), s = FLt;
  const ch = (arr, cur, k) => arr.map(x => `<button class="chip ${cur.includes(x) ? 'on' : ''}" data-a="flT" data-k="${k}" data-v="${esc(x)}">${esc(x)}</button>`).join('');
  const pre = k => `<div class="pre6">${b ? [3, 5, 10].map(d => `<button data-a="flP" data-k="${k}" data-v="${d}">±${d}</button>`).join('') : ''}<button data-a="flP" data-k="${k}" data-v="all">전체</button></div>`;
  sheet(`<h3>폴더 필터</h3><div class="mt16">
  <div class="field">${rgHTML('h', HR_MIN, HR_MAX, 'cm', of.map(f => f.h), s.hmin, s.hmax)}${pre('h')}</div>
  <div class="field">${rgHTML('w', WT_MIN, WT_MAX, 'kg', of.map(f => f.w), s.wmin, s.wmax)}${pre('w')}</div>
  <div class="field"><label class="f">옷 종류</label><div class="chips">${ch(CATS, s.kinds, 'kinds')}</div></div>
  <div class="field"><label class="f">사이즈 고민</label><div class="chips">${ch(WORRIES.map(w => w[0]), s.worries, 'worries')}</div></div>
  <div class="field"><label class="f">분위기</label><div class="chips">${ch(MOODS, s.moods, 'moods')}</div></div>
  ${b ? `<div class="field"><label class="f">나에게 맞는 옷</label><div class="chips">${[['', '상관없음'], ['half', '절반 이상'], ['most', '대부분']].map(([v, l]) => `<button class="chip ${s.fitq === v ? 'on' : ''}" data-a="flT" data-k="fitq" data-v="${v}">${l}</button>`).join('')}</div></div>` : ''}</div>
  <div class="row mt16"><button class="btn flat" data-a="flReset" style="width:96px">초기화</button><button class="btn pri grow" id="fl-go" data-a="flApply">${flList(s).length}개 보기</button></div>`);
}
ACT.flOpen = () => { FLt = JSON.parse(JSON.stringify(FL)); flSheet(); };
const keepSheet = () => { const sc = $('#scrim .sheet'), y = sc ? sc.scrollTop : 0; flSheet(); const s2 = $('#scrim .sheet'); if (s2) s2.scrollTop = y; };
ACT.flT = t => { const k = t.dataset.k, v = t.dataset.v; if (k === 'fitq') FLt.fitq = v; else FLt[k] = FLt[k].includes(v) ? FLt[k].filter(x => x !== v) : [...FLt[k], v]; keepSheet(); };
ACT.flP = t => {
  const k = t.dataset.k, v = t.dataset.v, b = S.body, lo = k === 'h' ? HR_MIN : WT_MIN, hi = k === 'h' ? HR_MAX : WT_MAX;
  if (v === 'all' || !b) { FLt[k + 'min'] = lo; FLt[k + 'max'] = hi; } else { const c = k === 'h' ? b.h : b.w, d = +v; FLt[k + 'min'] = Math.max(lo, c - d); FLt[k + 'max'] = Math.min(hi, c + d); }
  keepSheet();
};
INP.flR = t => {
  const k = t.dataset.k, a = k[0], lo = a === 'h' ? HR_MIN : WT_MIN, hi = a === 'h' ? HR_MAX : WT_MAX, isMin = k.endsWith('min');
  let v = +t.value; if (isMin) v = Math.min(v, FLt[a + 'max'] - 1); else v = Math.max(v, FLt[a + 'min'] + 1); t.value = v; FLt[k] = v;
  const mn = FLt[a + 'min'], mx = FLt[a + 'max'], box = $('#rg-' + a); if (!box) return;
  $('#rg-' + a + '-l').textContent = rgLbl(mn, mx, lo, hi, a === 'h' ? 'cm' : 'kg');
  const f = box.querySelector('.rg-tr i'); f.style.left = (mn - lo) / (hi - lo) * 100 + '%'; f.style.right = (hi - mx) / (hi - lo) * 100 + '%';
  box.querySelectorAll('.rg-hist i').forEach((e, i) => { const x = lo + i * 5; e.classList.toggle('on', x + 5 > mn && x <= mx); });
  const g = $('#fl-go'); if (g) g.textContent = flList(FLt).length + '개 보기';
};
ACT.flReset = () => { FLt = { ...FL0(), q: FL.q, sort: FL.sort }; flSheet(); };
ACT.flApply = () => { FL = { ...FLt }; closeSheet(); reRender(); };
/* 사이즈 토크 전체 */
let TK = { c: '전체', sim: false, sz: '전체', sort: 'rep', n: 30 };
ACT.goTalks = () => { TK.n = 30; go('talks'); };
V.talks = () => {
  const b = S.body, sim = r => { const u = DB.U[r.u]; return b && Math.abs(u[0] - b.h) <= 6 && Math.abs(u[1] - b.w) <= 7; };
  let rs = RV.filter(r => prodById[r.p] && genderOk(prodById[r.p]) && DB.U[r.u] && (TK.c === '전체' || prodById[r.p].c === TK.c) && (TK.sz === '전체' || r.sz === TK.sz) && (!TK.sim || !b || sim(r)));
  rs = rs.map(r => ({ r, n: repN(r) })).sort(TK.sort === 'rep' ? (a, c) => c.n - a.n || a.r.id.localeCompare(c.r.id) : TK.sort === 'new' ? (a, c) => (c.r.d || '').localeCompare(a.r.d || '') : (a, c) => Number(sim(c.r)) - Number(sim(a.r)) || c.n - a.n).map(x => x.r);
  return `${topbar('사이즈 토크')}<div class="chips scroll" style="padding:14px 16px 4px">${b ? `<button class="chip ${TK.sim ? 'on' : ''}" data-a="tkSim">비슷한 체형만</button>` : ''}${chipsHTML(['전체', ...CATS], TK.c, 'tkCat')}</div>
  <div class="chips scroll" style="padding:4px 16px">${chipsHTML(['전체', ...SZ], TK.sz, 'tkSz')}</div>
  <div class="row between" style="padding:8px 16px"><span class="sm mute">${rs.length}개</span><select class="inp sel6" data-c="tkSort" aria-label="정렬"><option value="rep" ${TK.sort === 'rep' ? 'selected' : ''}>답글 많은 순</option><option value="new" ${TK.sort === 'new' ? 'selected' : ''}>최신순</option>${b ? `<option value="sim" ${TK.sort === 'sim' ? 'selected' : ''}>비슷한 체형순</option>` : ''}</select></div>
  <div class="talks">${rs.slice(0, TK.n).map(talkRow).join('') || '<div class="empty">조건에 맞는 글이 없어요</div>'}</div>${rs.length > TK.n ? `<div class="pad"><button class="btn flat full" data-a="tkMore">더 보기</button></div>` : ''}<div style="height:24px"></div>`;
};
ACT.tkSim = () => { TK.sim = !TK.sim; reRender(); }; ACT.tkCat = t => { TK.c = t.dataset.v; reRender(); }; ACT.tkSz = t => { TK.sz = t.dataset.v; reRender(); }; CHG.tkSort = t => { TK.sort = t.value; reRender(); }; ACT.tkMore = () => { TK.n += 30; reRender(); };

/* ---------- 내 옷장과 비교 ---------- */
let CMPID = null;
function cmpHTML(cat, tvals, tlabel) {
  const items = S.closet.filter(c => c.cat === cat && c.productId && prodById[c.productId] && prodById[c.productId].ch && prodById[c.productId].ch[c.size]);
  if (!items.length) return `<div class="cmpbox"><b>내 옷장과 비교</b><p class="sm mute" style="margin:6px 0 12px">같은 종류의 옷을 옷장에 담으면 치수를 바로 비교할 수 있어요.</p><button class="btn s pri" data-a="closetNew">옷 추가</button></div>`;
  const cur = items.find(c => c.id === CMPID) || items[0], rv = prodById[cur.productId].ch[cur.size];
  const diffs = PARTS[cat].filter(k => rv[k] != null && tvals[k] != null).map(k => ({ k, a: rv[k], b: tvals[k], d: r1(tvals[k] - rv[k]) }));
  const word = (k, d) => ['총장', '소매'].includes(k) ? (d > 0 ? '길어요' : '짧아요') : k === '어깨' ? (d > 0 ? '넓어요' : '좁아요') : (d > 0 ? '커요' : '작아요');
  const big = diffs.filter(x => Math.abs(x.d) >= 1).sort((a, c) => Math.abs(c.d) - Math.abs(a.d)).slice(0, 2);
  return `<div class="cmpbox"><b>내 옷장과 비교</b><div class="chips scroll" style="margin:10px -4px 0;padding:0 4px">${items.map(c => `<button class="chip ${c.id === cur.id ? 'on' : ''}" data-a="cmpPick" data-v="${c.id}">${esc(c.brand || '')} ${esc(c.size)}</button>`).join('')}</div>
  <p class="cmps">${big.length ? big.map(x => `${x.k} ${Math.abs(x.d)}cm ${word(x.k, x.d)}`).join(' · ') : '내 옷장 옷과 거의 같아요'}</p>
  <table class="cmpt"><thead><tr><th></th><th>${esc(cur.name || '내 옷')} ${esc(cur.size)}</th><th>이 옷 ${esc(tlabel)}</th><th>차이</th></tr></thead><tbody>${diffs.map(x => `<tr><td>${x.k}</td><td>${x.a}</td><td>${x.b}</td><td style="font-weight:${Math.abs(x.d) >= 2 ? 800 : Math.abs(x.d) >= 1 ? 600 : 400}">${sgn(x.d)}</td></tr>`).join('')}</tbody></table></div>`;
}
ACT.cmpPick = t => { CMPID = t.dataset.v; reRender(); };
const _vres = V.result;
V.result = p => { const h = _vres(p); try { const A = getA(), tv = A.chart[A.sel]; if (!tv) return h; const i = h.lastIndexOf('<div class="dock"'); return i < 0 ? h : h.slice(0, i) + `<div style="padding:0 16px 90px">${cmpHTML(A.cat, tv, A.sel)}</div>` + h.slice(i); } catch (e) { return h; } };
const _vprod = V.product;
V.product = p => { const h = _vprod(p); try { const pr = prodById[p.id]; if (p.tab !== 'chart' || !pr.ch) return h; const o = S.body ? oc(pr) : null, sz = (o && o.best) || pr.sz[0]; return h.replace('<div class="mdwrap">', cmpHTML(pr.c, pr.ch[sz] || {}, sz) + '<div class="mdwrap" style="margin-top:20px">'); } catch (e) { return h; } };

/* ---------- 기록: 검색 · 필터 · 정렬 ---------- */
const fitOf = x => x.t === 'c' ? (OVL[x.c.overall] || '') : (x.r.fb ? OVL[x.r.fb.overall] || '' : '');
const folderOf = x => x.t === 'c' ? (S.folders || []).filter(f => f.items.includes(x.c.id)).map(f => f.id) : [];
const rxCount = () => RX.cats.length + RX.sizes.length + RX.fit.length + RX.brands.length + RX.folders.length + (RX.pub ? 1 : 0) + (RX.period !== '전체' ? 1 : 0);
const rxBase = () => allRecordItems().filter(x => RK === '분석' ? x.t === 'a' : x.t === 'c');
recordItems = function (opt = {}) {
  const f = { ...RX, ...opt }, q = (f.q || '').trim();
  return rxBase()
    .filter(x => !f.cats.length || f.cats.includes(x.t === 'a' ? x.r.cat : x.c.cat))
    .filter(x => !f.sizes.length || f.sizes.includes(sizeOfItem(x)))
    .filter(x => !f.fit.length || f.fit.includes(fitOf(x)))
    .filter(x => !f.brands.length || f.brands.includes(brandOfItem(x)))
    .filter(x => !f.folders.length || folderOf(x).some(id => f.folders.includes(id)))
    .filter(x => !f.pub || (x.t === 'c' && (f.pub === '공개') === !!x.c.pub))
    .filter(x => inPeriod(x.d, f.period))
    .filter(x => !q || findIn(nameOfItem(x), q) || findIn(brandOfItem(x), q))
    .sort((a, b) => RSORT === 'new' ? b.d.localeCompare(a.d) : RSORT === 'old' ? a.d.localeCompare(b.d) : brandOfItem(a).localeCompare(brandOfItem(b), 'ko') || b.d.localeCompare(a.d));
};
const RSORT_L = { new: '최신순', old: '오래된순', brand: '브랜드순' };
ACT.rSort = () => { RSORT = { new: 'old', old: 'brand', brand: 'new' }[RSORT]; reRender(); };
recordListHTML = function () {
  const items = recordItems(), base = rxBase();
  if (!items.length) {
    if (base.length) return `<div class="empty"><b class="en">조건에 맞는 옷이 없어요</b><div class="mt12"><button class="btn s flat" data-a="rfClear">검색 조건 지우기</button></div></div>`;
    return RK === '내 옷장' ? `<div class="empty"><b class="en">아직 내 옷장이 비어 있어요</b><div class="mt12"><button class="btn s pri" data-a="closetNew">첫 옷 추가하기</button></div></div>` : `<div class="empty"><b class="en">아직 측정한 옷이 없어요</b><div class="mt12"><button class="btn s pri" data-a="startMeasure">사이즈 측정하기</button></div></div>`;
  }
  if (RSORT === 'brand') return items.map(recordRow).join('');
  let last = '', out = ''; items.forEach(x => { const m = x.d.slice(0, 4) + '년 ' + (+x.d.slice(5, 7)) + '월'; if (m !== last) { out += `<div class="mshead">${m}</div>`; last = m; } out += recordRow(x); }); return out;
};

/* 검색창: 글자를 입력하면 관련 종류·브랜드·사이즈·입어보니·폴더·기간이 아래에 나오고, 고르면 칩으로 쌓인다 */
const RXS = { open: false };
function rxSuggest(q) {
  q = q.trim(); const base = rxBase(), uniq = a => [...new Set(a.filter(Boolean))], out = [], any = !q;
  const hit = l => any || findIn(String(l), q) || String(l).toLowerCase().includes(q.toLowerCase());
  const add = (g, k, v, l, opt, shown) => { if (!hit(l) && !(shown && hit(shown))) return; const n = recordItems(opt).length; if (n) out.push({ g, k, v, l: shown || l, n }); };
  CATS.forEach(c => { if (!RX.cats.includes(c)) add('종류', 'cats', c, c, { cats: [...RX.cats, c] }); });
  ['작아요', '맞아요', '커요'].forEach(f => { if (!RX.fit.includes(f)) add('입어보니', 'fit', f, f, { fit: [...RX.fit, f] }); });
  uniq(base.map(brandOfItem)).sort((a, b) => a.localeCompare(b, 'ko')).forEach(b => { if (!RX.brands.includes(b)) add('브랜드', 'brands', b, b, { brands: [...RX.brands, b] }); });
  uniq(base.map(sizeOfItem)).sort((a, b) => (SZ.indexOf(a) < 0 ? 99 : SZ.indexOf(a)) - (SZ.indexOf(b) < 0 ? 99 : SZ.indexOf(b))).forEach(s => { if (!RX.sizes.includes(s)) add('사이즈', 'sizes', s, s, { sizes: [...RX.sizes, s] }, s + ' 사이즈'); });
  if (RK === '내 옷장') {
    (S.folders || []).forEach(f => { if (!RX.folders.includes(f.id)) add('폴더', 'folders', f.id, f.name, { folders: [...RX.folders, f.id] }); });
    if (!RX.pub) ['공개', '비공개'].forEach(v => add('공개', 'pub', v, v, { pub: v }));
  }
  if (RX.period === '전체') PERIODS.slice(1).forEach(p => add('기간', 'period', p, p, { period: p }));
  if (q) uniq(base.map(nameOfItem)).forEach(nm => { if (hit(nm) && nm !== RX.q) { const n = recordItems({ q: nm }).length; if (n) out.push({ g: '옷', k: 'q', v: nm, l: nm, n }); } });
  const rank = { 옷: 0, 브랜드: 1, 종류: 2, 사이즈: 3, 입어보니: 4, 폴더: 5, 공개: 6, 기간: 7 };
  return (any ? out.filter(s => ['종류', '입어보니'].includes(s.g)) : out.sort((a, b) => rank[a.g] - rank[b.g])).slice(0, 8);
}
const rxDD = () => { const q = RX.q, l = rxSuggest(q); return `<div class="sgl">${l.map(s => `<button class="sg" data-a="rxS" data-k="${s.k}" data-v="${esc(s.v)}"><span class="sg-g">${s.g}</span><span class="sg-l">${hl(s.l, q)}</span><span class="sg-n">${s.n}벌</span></button>`).join('')}${q.trim() ? `<button class="sg lit" data-a="rxLit"><span class="sg-l">'${esc(q.trim())}' 그대로 검색</span></button>` : (l.length ? '' : '<div class="sg-e">종류·브랜드·사이즈·입어보니로 좁혀 보세요</div>')}</div>`; };
function rxUpd() { const l = $('#rlist'); if (l) { l.innerHTML = recordListHTML(); const c = $('#rcnt'); if (c) c.textContent = recordItems().length; } const d = $('#rxdd'); if (d) d.innerHTML = RXS.open ? rxDD() : ''; }
let RX = { c: '전체', cats: [], q: '', sizes: [], fit: [], brands: [], folders: [], pub: '', period: '전체' };
const RX0 = () => ({ c: '전체', cats: [], q: '', sizes: [], fit: [], brands: [], folders: [], pub: '', period: '전체' });
V.records = () => {
  seedV06(); if (RK === '전체') RK = '내 옷장';
  const closet = RK === '내 옷장', n = recordItems().length, fs = S.folders || [];
  const fcards = fs.map(f => `<button class="mf c-${f.color}" data-a="openMyFolder" data-v="${f.id}"><span class="mf-t">${esc(f.name)}</span><span class="mf-m">옷 ${f.items.length} · ${f.pub ? '공개' : '비공개'}</span></button>`).join('');
  const act = [...RX.cats.map(v => ['cats', v, v]), ...RX.brands.map(v => ['brands', v, v]), ...RX.sizes.map(v => ['sizes', v, v + ' 사이즈']), ...RX.fit.map(v => ['fit', v, '입어보니 ' + v]), ...RX.folders.map(v => ['folders', v, (fs.find(f => f.id === v) || {}).name || '폴더']), ...(RX.pub ? [['pub', RX.pub, RX.pub]] : []), ...(RX.period !== '전체' ? [['period', RX.period, RX.period]] : [])];
  return `<div class="hero6" style="padding-top:2px">${segHTML(['분석', '내 옷장'], RK, 'rkTab', 'dk')}<h1 class="disp" style="margin-top:18px">${closet ? '입어본 옷' : '측정한 옷'}<br>${U6(`<span class="cnt" data-n="${rxBase().length}">0</span>벌`)}</h1></div>
  <div class="rxwrap" style="padding:18px 16px 0"><div class="search"><input id="rxq" class="inp rnd" data-i="rxq" value="${esc(RX.q)}" placeholder="브랜드·상품명·사이즈·종류로 검색" autocomplete="off" enterkeyhint="search">${ico('search')}</div><div class="rxdd" id="rxdd"></div></div>
  ${act.length ? `<div class="chips scroll" style="padding:12px 16px 0">${act.map(([k, v, l]) => `<button class="chip x" data-a="rxRm" data-k="${k}" data-v="${esc(v)}">${esc(l)}</button>`).join('')}<button class="chip" style="border:1px dashed #ccc;background:#fff" data-a="rfClear">전체 해제</button></div>` : ''}
  ${closet ? `<div class="sec" style="padding-top:26px"><div class="sec-h"><h3>폴더</h3></div></div><div class="frow">${fcards}<button class="mf new" data-a="folderNew">${ico('plus', 'ico')}<span>새 폴더</span></button></div>` : ''}
  <div class="sec"><div class="sec-h"><h3>${closet ? '옷' : '분석'} <span id="rcnt" class="mute" style="font-size:15px">${n}</span></h3><button class="link" data-a="rSort" style="text-decoration:none">${RSORT_L[RSORT]} ⇅</button></div></div>
  <div id="rlist">${recordListHTML()}</div><div style="height:90px"></div>
  ${closet ? `<div class="fabwrap"><button class="fab6" data-a="closetNew">${ico('plus', 'ico')}옷 추가</button></div>` : ''}`;
};
INP.rxq = t => { RX.q = t.value; RXS.open = true; rxUpd(); };
ACT.rxS = t => { const k = t.dataset.k, v = t.dataset.v; RXS.open = false; if (k === 'q') RX.q = v; else { RX.q = ''; if (k === 'pub' || k === 'period') RX[k] = v; else RX[k] = [...RX[k], v]; } reRender(); };
ACT.rxLit = () => { RXS.open = false; rxUpd(); const i = $('#rxq'); if (i) i.blur(); };
ACT.rfClear = () => { RX = RX0(); reRender(); };
ACT.rxRm = t => { const k = t.dataset.k, v = t.dataset.v; if (k === 'pub') RX.pub = ''; else if (k === 'period') RX.period = '전체'; else RX[k] = RX[k].filter(x => x !== v); reRender(); };
ACT.rkTab = t => { RK = t.dataset.v; RX = RX0(); reRender(); };
document.addEventListener('focusin', e => { if (e.target.id === 'rxq') { RXS.open = true; rxUpd(); } });
document.addEventListener('focusout', e => { if (e.target.id === 'rxq') setTimeout(() => { RXS.open = false; const d = $('#rxdd'); if (d) d.innerHTML = ''; }, 180); });
document.addEventListener('mousedown', e => { if (e.target.closest('#rxdd, .fmsg')) e.preventDefault(); });

/* ---------- 옷 직접 입력 · 수정 (옷 정보 / 착용감 두 카드 · 브랜드 없이도 저장 가능) ---------- */
let FM = null, FMO = null;
const newFM = () => ({ cat: '상의', brand: '', name: '', size: '', color: '', fit: '맞아요', parts: {}, pub: true, folder: '', memo: '', id: null });
const matchProd = () => FM && FM.brand.trim() && FM.name.trim() ? PR.find(p => brandById[p.b].n === FM.brand.trim() && p.n === FM.name.trim()) : null;
const PARTV = p => p === '총장' ? ['짧은 편', '적당', '긴 편'] : ['타이트', '적당', '여유'];
const MEMO_TAGS = { 상의: ['소매가 짧아요', '어깨가 좁아요', '가슴이 답답해요', '기장이 짧아요', '기장이 길어요', '한 치수 크게 살 걸', '늘어나는 소재', '두께감 있어요'], 아우터: ['소매가 짧아요', '어깨가 좁아요', '안에 두껍게 못 입어요', '기장이 짧아요', '한 치수 크게 살 걸', '무거워요'], 하의: ['허리가 남아요', '허리가 끼어요', '허벅지가 끼어요', '기장이 길어요', '기장이 짧아요', '신축성 좋아요', '한 치수 크게 살 걸'], 원피스: ['가슴이 답답해요', '허리가 남아요', '어깨가 좁아요', '기장이 짧아요', '기장이 길어요', '한 치수 크게 살 걸'] };
const swatchGrid = (cur, act, list = COLOR_ORD) => `<div class="swatches">${list.map(c => `<button class="swb ${cur === c ? 'on' : ''}" data-a="${act}" data-v="${esc(c)}" aria-label="${esc(c)}" aria-pressed="${cur === c}"><i class="swc ${['화이트', '아이보리'].includes(c) ? 'lt' : ''}" style="background:${COLOR_HEX[c]}">${cur === c ? '✓' : ''}</i>${c}</button>`).join('')}</div>`;
ACT.caFree = () => { FM = newFM(); go('closetAdd', { full: 1 }); };
ACT.closetEdit = t => { const c = S.closet.find(x => x.id === t.dataset.v); FM = { cat: c.cat, brand: c.brand || '', name: c.name || '', size: c.size || '', color: c.color && c.color !== '기타' ? c.color : '', fit: OVL[c.overall] || '맞아요', parts: { ...(c.parts || {}) }, pub: !!c.pub, folder: ((S.folders || []).find(f => f.items.includes(c.id)) || {}).id || '', memo: c.memo || '', id: c.id }; go('closetAdd', { id: c.id }); };
function fmDD(k) {
  const q = (k === 'brand' ? FM.brand : FM.name).trim(); let rows = [];
  if (k === 'brand') rows = BR.filter(b => !q || findIn(b.n, q)).slice(0, 6).map(b => ({ v: b.n, l: b.n, s: '상품 ' + brandStat(b.id).n }));
  else { if (!q && !FM.brand.trim()) return ''; const bn = FM.brand.trim(); rows = PR.filter(p => (!bn || brandById[p.b].n === bn) && (!q || findIn(p.n, q))).sort((a, b) => (b.c === FM.cat) - (a.c === FM.cat)).slice(0, 6).map(p => ({ v: p.id, l: p.n, s: (bn ? '' : brandById[p.b].n + ' · ') + p.c })); }
  const exact = rows.some(r => r.l === q);
  const lit = q && !exact ? `<button class="sg lit" data-a="fmLit"><span class="sg-l">${esc(q)} (직접 입력)</span></button>` : '';
  return `<div class="sgl fmsg">${k === 'brand' ? lit : ''}${rows.map(r => `<button class="sg" data-a="fmPick" data-k="${k}" data-v="${esc(r.v)}"><span class="sg-l">${hl(r.l, q)}</span><span class="sg-n">${esc(r.s)}</span></button>`).join('')}${k === 'brand' ? '' : lit}</div>`;
}
function manualForm(p) {
  if (!FM || (p.id && FM.id !== p.id)) FM = newFM();
  const fd = (S.folders || []).find(f => f.id === FM.folder), mp = matchProd(), tags = MEMO_TAGS[FM.cat] || MEMO_TAGS.상의;
  return `${topbar(FM.id ? '옷 수정' : '옷 입력', { left: 'close' })}<div style="padding-top:6px">
  <div class="cb6"><h3>옷 정보</h3>
   <div class="field"><label class="f">종류</label><div class="chips">${chipsHTML(CATS, FM.cat, 'fmCat')}</div></div>
   <div class="field fmf"><label class="f" for="fm-b">브랜드 <span class="mute xs b">(선택)</span></label><input id="fm-b" class="inp rnd" data-i="fm" data-k="brand" value="${esc(FM.brand)}" placeholder="브랜드 이름을 입력해 보세요" autocomplete="off"><div id="fm-sg-brand"></div></div>
   <div class="field fmf"><label class="f" for="fm-n">상품명 <span class="mute xs b">(선택)</span></label><input id="fm-n" class="inp rnd" data-i="fm" data-k="name" value="${esc(FM.name)}" placeholder="상품명을 입력해 보세요" autocomplete="off"><div id="fm-sg-name"></div></div>
   <div class="field"><label class="f">산 사이즈</label><div class="szs" style="padding:0">${SZ.map(s => `<button class="${FM.size === s ? 'on' : ''}" data-a="fmSize" data-v="${s}">${s}</button>`).join('')}</div><input class="inp rnd" style="margin-top:8px" data-i="fm" data-k="size" value="${SZ.includes(FM.size) ? '' : esc(FM.size)}" placeholder="그 외 사이즈 (예: 28, free)" autocomplete="off"></div>
   <div class="field" style="margin-bottom:0"><label class="f">색상 <span class="mute xs b">(선택)</span></label>${swatchGrid(FM.color, 'fmColor')}</div></div>
  <div class="cb6"><h3>착용감</h3>
   <div class="field"><label class="f">입어보니</label><div class="fits" style="padding:0">${['작아요', '맞아요', '커요'].map(f => `<button class="fit ${FM.fit === f ? 'on' : ''}" data-a="fmFit" data-v="${f}"><span>${f}</span><i></i></button>`).join('')}</div></div>
   <div class="field"><label class="f">부위별 <span class="mute xs b">(선택)</span></label>${(PARTS[FM.cat] || []).map(pt => `<div class="pt6"><span>${pt}</span><div>${PARTV(pt).map(v => `<button class="${FM.parts[pt] === v ? 'on' : ''}" data-a="fmPart" data-p="${pt}" data-v="${v}">${v}</button>`).join('')}</div></div>`).join('')}</div>
   <div class="field" style="margin-bottom:0"><label class="f" for="fm-m">메모 <span class="mute xs b">(선택)</span></label><div class="chips scroll" style="padding:0 0 8px">${tags.map(t => `<button class="chip ${FM.memo.includes(t) ? 'on' : ''}" data-a="fmTag" data-v="${esc(t)}">${esc(t)}</button>`).join('')}</div><textarea id="fm-m" class="inp rnd ta6" rows="4" maxlength="300" data-i="fm" data-k="memo" placeholder="입어본 느낌을 자유롭게 적어 주세요">${esc(FM.memo)}</textarea><div class="xs mute" style="text-align:right;margin-top:4px"><span id="fm-mc">${FM.memo.length}</span>/300</div></div></div>
  <div class="opts"><button class="opt" data-a="fmFolder"><span>폴더에 넣기</span><span class="mute sm">${fd ? esc(fd.name) : '선택 안 함'} ${ico('chev', 'ico')}</span></button>${mp ? `<div class="opt"><span>후기로 공개<small>${S.body ? S.body.h + ' · ' + S.body.w + '와 함께 보여요' : ''}</small></span>${swHTML(FM.pub, 'fmPub')}</div>` : `<div class="opt"><small style="margin:0">상품 목록에 있는 옷은 후기로 공개할 수 있어요</small></div>`}</div>
  ${FM.id ? `<div class="pad"><button class="link" data-a="cDel" data-v="${FM.id}">이 옷 삭제</button></div>` : ''}</div><div style="height:110px"></div><div class="dock"><button class="btn pri full" data-a="fmSave">저장</button></div>`;
}
function fmUpd(k) { const d = $('#fm-sg-' + k); if (d) d.innerHTML = FMO === k ? fmDD(k) : ''; }
INP.fm = t => { const k = t.dataset.k; FM[k] = t.value; if (k === 'brand' || k === 'name') { FMO = k; fmUpd(k); } if (k === 'memo') { const c = $('#fm-mc'); if (c) c.textContent = t.value.length; } };
document.addEventListener('focusin', e => { if (!FM) return; const m = { 'fm-b': 'brand', 'fm-n': 'name' }[e.target.id]; if (m) { FMO = m; fmUpd(m); } });
document.addEventListener('focusout', e => { const m = { 'fm-b': 'brand', 'fm-n': 'name' }[e.target.id]; if (m) setTimeout(() => { if (FMO === m) { FMO = null; fmUpd(m); } }, 180); });
ACT.fmPick = t => {
  const k = t.dataset.k, v = t.dataset.v; FMO = null;
  if (k === 'brand') FM.brand = v; else { const p = prodById[v]; if (p) { FM.name = p.n; FM.brand = brandById[p.b].n; FM.cat = p.c; if (FM.color && (p.col || []).length && !p.col.includes(FM.color)) FM.color = ''; } }
  reRender();
};
ACT.fmLit = () => { FMO = null; ['brand', 'name'].forEach(fmUpd); if (document.activeElement) document.activeElement.blur(); };
ACT.fmCat = t => { FM.cat = t.dataset.v; FM.parts = {}; reRender(); }; ACT.fmSize = t => { FM.size = t.dataset.v; reRender(); }; ACT.fmColor = t => { FM.color = FM.color === t.dataset.v ? '' : t.dataset.v; reRender(); };
ACT.fmFit = t => { FM.fit = t.dataset.v; reRender(); }; ACT.fmPub = () => { FM.pub = !FM.pub; reRender(); };
ACT.fmPart = t => { const p = t.dataset.p, v = t.dataset.v; if (FM.parts[p] === v) delete FM.parts[p]; else FM.parts[p] = v; reRender(); };
ACT.fmTag = t => { const g = t.dataset.v; FM.memo = FM.memo.includes(g) ? FM.memo.replace(g, '').replace(/^[\s,·]+|[\s,·]+$/g, '').replace(/\s*[,·]\s*[,·]\s*/g, ', ') : (FM.memo.trim() ? FM.memo.trim() + ', ' : '') + g; reRender(); };
ACT.fmFolder = () => sheet(`<h3>폴더에 넣기</h3><div class="list" style="margin:8px -16px 0"><button class="li" data-a="fmFolderSet" data-v="" style="padding:14px 16px"><b class="sm">선택 안 함</b></button>${(S.folders || []).map(f => `<button class="li" data-a="fmFolderSet" data-v="${f.id}" style="padding:14px 16px"><b class="sm">${esc(f.name)}</b></button>`).join('')}</div>`);
ACT.fmFolderSet = t => { FM.folder = t.dataset.v; closeSheet(); reRender(); };
ACT.fmSave = () => {
  if (!FM.brand.trim() && !FM.name.trim()) { toast('브랜드나 상품명을 하나는 입력해 주세요'); return; }
  if (!FM.size.trim()) { toast('산 사이즈를 골라 주세요'); return; }
  const mp = matchProd(), old = FM.id && S.closet.find(c => c.id === FM.id);
  const item = { ...(old || newFB(FM.cat)), cat: FM.cat, brand: FM.brand.trim(), brandId: mp ? mp.b : null, name: FM.name.trim(), productId: mp ? mp.id : null, color: FM.color || '기타', size: FM.size.trim(), overall: { 작아요: '작음', 맞아요: '정핏', 커요: '여유' }[FM.fit], parts: { ...FM.parts }, pub: !!(mp && FM.pub), memo: FM.memo.trim(), id: FM.id || 'C' + Date.now(), date: old ? old.date : today() };
  if (old) S.closet = S.closet.map(c => c.id === item.id ? item : c); else S.closet.unshift(item);
  (S.folders || []).forEach(f => { f.items = f.items.filter(x => x !== item.id); }); const f = (S.folders || []).find(x => x.id === FM.folder); if (f) f.items.push(item.id);
  save(); toast('저장했어요'); FM = null; back();
};

const reviewWithProd = r => { const q = prodById[r.p]; return `<div class="rvw6">${q ? `<button class="rvp6" data-a="openProduct" data-v="${q.id}"><span class="ph" style="width:44px;height:52px;flex:none;border-radius:10px"><span>이미지</span>${pimg(q.id)}</span><span class="grow" style="min-width:0;text-align:left"><span class="bn6" style="display:block">${esc(brandById[q.b].n)}</span><span class="ellip" style="display:block;font-size:14px">${esc(q.n)}</span></span><span class="rvgo6">상품 보기 ›</span></button>` : ''}${reviewCard(r)}</div>`; };
ACT.dfPr = t => { DF.pr = t.dataset.v || null; reRender(); };

/* ---------- 브랜드 상세: 이름 옆 공식 사이트 · 정보 한 줄 · 탭은 상품/후기 ---------- */
V.brandDetail = p => {
  const b = brandById[p.id], st = brandStat(b.id), tn = brandTend(b.id);
  if (DF.tab !== 'rev') DF.tab = 'prod';
  const head = `${topbar('', { right: heartBtn('brand', String(b.id), 'ib heart') })}
  <div class="hd1 hd6"><div class="hn6"><h1>${esc(b.n)}</h1>${b.site ? `<a class="olink" href="${esc(b.site)}" target="_blank" rel="noopener noreferrer">공식 사이트 ↗</a>` : ''}</div>
  <div class="info6">상품 ${st.n} · 후기 ${st.rv}${st.rv ? ` · <b style="color:var(--${['tight', 'ok', 'loose'].includes(tn.cls) ? tn.cls : 'ink'})">${tn.label}</b>` : ''}</div></div>
  <div class="tabs t0">${[['prod', '상품'], ['rev', '후기']].map(([k, l]) => `<button class="${DF.tab === k ? 'on' : ''}" data-a="dfTab" data-v="${k}">${l}</button>`).join('')}</div>`;
  let body = '';
  if (DF.tab === 'rev') {
    const all = PR.filter(q => q.b === b.id).map(q => [q, (revByProd[q.id] || []).length]).filter(x => x[1]).sort((x, y) => y[1] - x[1]);
    if (DF.pr && !all.some(x => x[0].id === DF.pr)) DF.pr = null;
    const rs = (DF.pr ? revByProd[DF.pr] || [] : all.flatMap(x => revByProd[x[0].id] || [])).slice().sort((x, y) => (y.d || '').localeCompare(x.d || '')).slice(0, 30);
    body = `${all.length > 1 ? `<div class="chips scroll" style="padding:12px 16px 2px"><button class="chip ${DF.pr ? '' : 'on'}" data-a="dfPr" data-v="">전체 ${all.reduce((a, x) => a + x[1], 0)}</button>${all.slice(0, 10).map(([q, n]) => `<button class="chip ${DF.pr === q.id ? 'on' : ''}" data-a="dfPr" data-v="${q.id}">${esc(q.n.length > 12 ? q.n.slice(0, 12) + '…' : q.n)} ${n}</button>`).join('')}</div>` : ''}${rs.length ? rs.map(reviewWithProd).join('') : emptyHTML('아직 후기가 없어요')}`;
  } else {
    body = `<div style="padding:10px 16px 0"><div class="search"><input id="pq" class="inp" data-i="pq" value="${esc(DF.q)}" placeholder="이 브랜드 상품 검색" autocomplete="off">${ico('search')}</div></div>
    <div style="padding-top:10px"><div class="chips scroll">${chipsHTML(['전체', ...BCATS.filter(c => PR.some(q => q.b === b.id && q.c === c))], DF.cat, 'dfCat')}</div></div>
    <div class="row between" style="padding:8px 16px"><span class="sm mute" id="dfcnt">${dfProducts().length}개</span><span class="row" style="gap:8px">${sortSelect(DF.sort || defSort(), 'dfSort')}</span></div>${sortHint(DF.sort || defSort())}
    <div id="pgrid">${pgridHTML(dfProducts(), 'dfClear')}</div>`;
  }
  return head + body + '<div style="height:20px"></div>';
};

/* ---------- 알림: 필터 칩 + 날짜별 목록 (답글은 인용·버튼이 있는 행, 나머지는 아이콘 한 줄) ---------- */
const NF6 = { like: '좋아요', reply: '답글', inquiry: '기타', wish: '기타' }, NF6_TABS = ['전체', '답글', '좋아요', '기타'];
const NFI = { like: ['#F2A9C2', '#fff', '<path d="M12 20s-7-4.6-9-9.2C1.8 7 4 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 3 0 5.2 3 4 6.8C19 15.4 12 20 12 20z" fill="#fff"/>'], wish: ['#CFE9B8', '#444', '<path d="M7 4h10v16l-5-4-5 4z"/>'], inquiry: ['#E3E3E3', '#444', '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.5"/>'] };
const nfIco = t => `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${NFI[t][2]}</svg>`;
V.notifs = () => {
  ensureNotifs();
  const all = S.notifs, items = all.filter(n => NFK === '전체' || NF6[n.type] === NFK).sort((a, b) => (b.d + b.t).localeCompare(a.d + a.t)), un = all.filter(n => !n.read).length;
  let last = '', out = '';
  items.forEach(n => {
    if (n.d !== last) { out += `<div class="nh6">${nfLabel(n.d)}</div>`; last = n.d; }
    if (n.type === 'reply') out += `<div class="nr6 ${n.read ? '' : 'un'}" role="button" tabindex="0" data-a="nfOpen" data-v="${n.id}"><span class="ph nth6"><span>이미지</span>${n.pid ? pimg(n.pid) : ''}<i class="nb6">${ico('chat', 'ico')}</i></span><span class="grow" style="min-width:0"><span class="nt6">${n.text}</span>${n.sub ? `<span class="nq6">${esc(n.sub)}</span>` : ''}<button class="nbt6" data-a="nfReply" data-v="${n.id}">답글 달기</button></span><span class="ntm6">${n.t}</span></div>`;
    else out += `<button class="nl6 ${n.read ? '' : 'un'}" data-a="nfOpen" data-v="${n.id}"><i class="ni6" style="background:${NFI[n.type][0]};color:${NFI[n.type][1]}">${nfIco(n.type)}</i><span class="grow" style="min-width:0"><span class="nt6">${n.text}</span>${n.sub ? `<span class="ns6">${esc(n.sub)}</span>` : ''}</span><span class="ntm6">${n.t}</span></button>`;
  });
  const empty = !all.length ? `<div class="empty"><b class="en">아직 알림이 없어요</b><span class="sm">후기에 좋아요나 답글이 달리면 알려드려요</span></div>` : emptyHTML('', emptyBtn('nfTab', '전체 보기', 'data-v="전체"'));
  return `${topbar('')}<div class="row between" style="padding:2px 20px 0;align-items:flex-end"><h1 class="disp" style="margin:0;font-size:32px">알림</h1><span class="sm mute" style="padding-bottom:4px">${un ? `안 읽은 ${un}개 · <button class="link" data-a="nfReadAll" style="font-weight:700;color:#111">모두 읽음</button>` : '모두 읽었어요'}</span></div>
  <div class="chips scroll" style="padding:14px 16px 4px">${NF6_TABS.map(k => { const c = all.filter(n => !n.read && (k === '전체' || NF6[n.type] === k)).length; return `<button class="chip nfc6 ${NFK === k ? 'on' : ''}" data-a="nfTab" data-v="${k}">${k}${c && k !== '전체' ? '<i class="nd6"></i>' : ''}</button>`; }).join('')}</div>
  <div>${items.length ? out : empty}</div><div style="height:24px"></div>`;
};

ACT.nfReply = t => {
  const n = S.notifs.find(x => x.id === t.dataset.v); if (!n) return; n.read = true; save();
  if (!n.rv || !RV.some(r => r.id === n.rv)) { ACT.nfOpen(t); return; }
  RPT = null; RP = ''; go('review', { id: n.rv });
  if (!S.loggedIn) { goLoginSheet(); return; }
  const tg = n.rp && repliesOf(RV.find(r => r.id === n.rv)).find(x => x.id === n.rp);
  setTimeout(() => { if (tg) { RPT = { id: tg.id, name: tg.name }; reRender(); } const ta = $('#rp-t'); if (ta) { ta.focus(); ta.scrollIntoView({ block: 'center' }); } }, 80);
};

V.recent = () => {
  const ps = S.recent.map(id => prodById[id]).filter(Boolean);
  return `${topbar('최근 본 상품', { right: ps.length ? '<button class="link" data-a="recentClear" style="padding-right:12px;white-space:nowrap">비우기</button>' : '' })}${ps.length ? `<div class="sm mute" style="padding:14px 16px 6px">${S.body ? `내 체형 ${S.body.h} · ${S.body.w} 기준 판정을 같이 보여줘요` : `${ps.length}개`}</div><div style="padding-top:8px">${pgridHTML(ps)}</div><div style="height:24px"></div>` : `<div class="empty"><b class="en">최근 본 상품이 없어요</b></div>`}`;
};

/* ---------- 찜: 상품 · 후기 · 브랜드 · 폴더 · 조건 알약 필터 ---------- */
const LK_TABS = [['product', '상품'], ['review', '후기'], ['brand', '브랜드'], ['folder', '폴더']];
const PRICE_R = [['전체', 0, 1e9], ['3만원 이하', 0, 30000], ['3~5만원', 30000, 50000], ['5~10만원', 50000, 100000], ['10만원 이상', 100000, 1e9]];
const LKC = {
  product: [['fit', '내 사이즈', ['전체', '맞는 것만', '주의까지']], ['cat', '종류', ['전체', ...CATS]], ['price', '가격', PRICE_R.map(x => x[0])]],
  review: [['body', '체형', ['전체', '나와 비슷한 체형', '조금 넓게']], ['op', '판정', ['전체', '작은 편', '정사이즈', '큰 편']], ['cat', '종류', ['전체', ...CATS]]],
  brand: [['tend', '사이즈 경향', ['전체', '정사이즈', '작게 나와요', '크게 나와요']], ['cat', '종류', ['전체', ...CATS]]],
  folder: [['body', '체형', ['전체', '나와 비슷한 체형', '조금 넓게']], ['cat', '종류', ['전체', ...CATS]]]
};
const LKS = { product: [['new', '담은 순'], ['old', '오래 담은 순'], ['low', '가격 낮은 순']], review: [['new', '좋아요한 순'], ['recent', '최신 후기 순']], brand: [['new', '담은 순'], ['many', '맞는 옷 많은 순']], folder: [['new', '담은 순'], ['sim', '나와 비슷한 체형순']] };
let LKF = {};
const lkF = k => LKF[k] || (LKF[k] = { sort: 'new' });
const nearB = (h, w, lv) => { const b = S.body; if (!b || lv === '전체' || !lv) return true; const d = lv === '나와 비슷한 체형' ? 3 : 6; return Math.abs(h - b.h) <= d && Math.abs(w - b.w) <= d; };
const fitN = bid => PR.filter(p => p.b === bid && oc(p) && oc(p).state !== 'nofit').length;
const TEND_OF = { 정사이즈: 'ok', '작게 나와요': 'tight', '크게 나와요': 'loose' };
function lkItems(k) {
  const L = S.likes, f = lkF(k), ord = a => f.sort === 'old' ? [...a] : [...a].reverse();
  if (k === 'product') {
    let ps = ord(L.product).map(id => prodById[id]).filter(Boolean);
    if (f.fit && f.fit !== '전체' && S.body) ps = ps.filter(p => { const o = oc(p); return o && (f.fit === '맞는 것만' ? o.state === 'fit' : o.state !== 'nofit'); });
    if (f.cat && f.cat !== '전체') ps = ps.filter(p => p.c === f.cat);
    if (f.price && f.price !== '전체') { const r = PRICE_R.find(x => x[0] === f.price); ps = ps.filter(p => p.pr >= r[1] && p.pr < r[2]); }
    if (f.sort === 'low') ps.sort((a, b) => a.pr - b.pr);
    return ps;
  }
  if (k === 'review') {
    let rs = ord(L.review).map(id => RV.find(r => r.id === id)).filter(Boolean);
    rs = rs.filter(r => nearB(DB.U[r.u][0], DB.U[r.u][1], f.body));
    if (f.op && f.op !== '전체') rs = rs.filter(r => r.op === f.op);
    if (f.cat && f.cat !== '전체') rs = rs.filter(r => prodById[r.p] && prodById[r.p].c === f.cat);
    if (f.sort === 'recent') rs.sort((a, b) => (b.d || '').localeCompare(a.d || ''));
    return rs;
  }
  if (k === 'brand') {
    let bs = ord(L.brand).map(id => brandById[id]).filter(Boolean);
    if (f.tend && f.tend !== '전체') bs = bs.filter(b => brandTend(b.id).cls === TEND_OF[f.tend]);
    if (f.cat && f.cat !== '전체') bs = bs.filter(b => PR.some(p => p.b === b.id && p.c === f.cat));
    if (f.sort === 'many') bs.sort((a, b) => fitN(b.id) - fitN(a.id));
    return bs;
  }
  const all = otherFolders();
  let fs = ord(L.folder || []).map(id => all.find(x => x.id === id)).filter(Boolean);
  fs = fs.filter(x => nearB(x.h, x.w, f.body));
  if (f.cat && f.cat !== '전체') fs = fs.filter(x => x.kinds.includes(f.cat));
  if (f.sort === 'sim' && S.body) fs.sort((a, b) => (Math.abs(a.h - S.body.h) + Math.abs(a.w - S.body.w)) - (Math.abs(b.h - S.body.h) + Math.abs(b.w - S.body.w)));
  return fs;
}
const lkTotal = k => (k === 'folder' ? (S.likes.folder || []) : S.likes[k]).length;
const dpill = (k, key, label, val) => { const on = val && val !== '전체'; return `<button class="dp6 ${on ? 'on' : ''}" data-a="lkPill" data-k="${k}" data-v="${key}">${on ? `${label} · ${esc(val)}` : label}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>`; };
const brow6 = b => { const t = brandTend(b.id), n = fitN(b.id); return `<div class="br6"><button class="br6-b" data-a="openBrand" data-v="${b.id}"><span class="br6-l c-${FCOL[hash(String(b.id)) % FCOL.length]}">${esc(b.n[0])}</span><span class="grow" style="min-width:0"><b>${esc(b.n)}</b><span class="xs mute" style="display:block;margin-top:3px">상품 ${brandStat(b.id).n}${S.body ? ` · 내 사이즈 맞는 옷 ${n}` : ''} · <b style="color:var(--${t.cls})">${t.label}</b></span></span></button>${heartBtn('brand', String(b.id), 'ib heart')}</div>`; };
V.likes = p => {
  const k = p.tab || 'product', f = lkF(k), items = lkItems(k), tot = lkTotal(k);
  const tabs = `<div class="tabs t0 lk6">${LK_TABS.map(([a, l]) => `<button class="${k === a ? 'on' : ''}" data-a="lkTab" data-v="${a}">${l} <span>${lkTotal(a)}</span></button>`).join('')}</div>`;
  const pills = tot ? `<div class="chips scroll" style="padding:14px 16px 0">${LKC[k].filter(([key]) => S.body || !['fit', 'body'].includes(key)).map(([key, label]) => dpill(k, key, label, f[key])).join('')}</div>
  <div class="row between" style="padding:12px 16px 8px"><span class="sm mute">${items.length}개</span><button class="link" data-a="lkSort" style="text-decoration:none;color:#333">${LKS[k].find(x => x[0] === f.sort)[1]} ⇅</button></div>` : '';
  const goShop = `<button class="btn pri s mt12" data-a="plGo" data-pl='${esc(JSON.stringify(S.body ? { fo: true } : {}))}'>${S.body ? '내 사이즈 맞는 옷 보러 가기' : '상품 둘러보기'}</button>`;
  const emptyAll = `<div class="emp6"><b>${{ product: '찜한 상품이 없어요', review: '좋아요한 후기가 없어요', brand: '찜한 브랜드가 없어요', folder: '저장한 폴더가 없어요' }[k]}</b><span>${{ product: '하트를 누르면 여기에 모여요', review: '마음에 드는 후기에 하트를 눌러 보세요', brand: '브랜드 화면에서 하트를 눌러 보세요', folder: '홈에서 비슷한 체형의 폴더를 저장해 보세요' }[k]}</span>${k === 'folder' ? '<button class="btn pri s mt12" data-a="goFolders">폴더 둘러보기</button>' : goShop}</div>`;
  const emptyF = `<div class="empty"><b class="en">조건에 맞는 항목이 없어요</b><div class="mt12"><button class="btn s flat" data-a="lkClear">필터 지우기</button></div></div>`;
  let body = '';
  if (!tot) body = emptyAll; else if (!items.length) body = emptyF;
  else body = k === 'product' ? `<div>${pgridHTML(items)}</div>` : k === 'review' ? items.map(reviewCard).join('') : k === 'brand' ? items.map(brow6).join('') : `<div class="fgrid">${items.map(fcard).join('')}</div>`;
  return `${topbar('찜')}${tabs}${pills}${body}<div style="height:24px"></div>`;
};
ACT.lkTab = t => { stack.at(-1).p.tab = t.dataset.v; reRender(); };
ACT.lkSort = () => { const k = stack.at(-1).p.tab || 'product', f = lkF(k), o = LKS[k].map(x => x[0]); f.sort = o[(o.indexOf(f.sort) + 1) % o.length]; reRender(); };
ACT.lkClear = () => { const k = stack.at(-1).p.tab || 'product'; LKF[k] = { sort: lkF(k).sort }; reRender(); };
ACT.lkPill = t => {
  const k = t.dataset.k, key = t.dataset.v, [, label, opts] = LKC[k].find(x => x[0] === key), cur = lkF(k)[key] || '전체';
  const sub = { '나와 비슷한 체형': S.body ? `키·몸무게 ±3 (${S.body.h} · ${S.body.w} 기준)` : '', '조금 넓게': S.body ? '키·몸무게 ±6' : '', '맞는 것만': '모든 부위가 맞는 상품', '주의까지': '한 부위만 살짝 다른 상품도 포함' };
  sheet(`<h3 style="font-size:20px;font-weight:300">${label}</h3><div class="opt6">${opts.map(o => `<button class="${cur === o ? 'on' : ''}" data-a="lkSet" data-k="${k}" data-key="${key}" data-v="${esc(o)}"><span><b>${esc(o)}</b>${sub[o] ? `<small>${sub[o]}</small>` : ''}</span><i>${cur === o ? '✓' : ''}</i></button>`).join('')}</div>`);
};
ACT.lkSet = t => { lkF(t.dataset.k)[t.dataset.key] = t.dataset.v; closeSheet(); reRender(); };
ACT.goFolders = ACT.goFolders || (() => go('folders'));

/* ---------- 마이: 내 후기·답글은 로그인 후에만 ---------- */
const _vmine = V.mine;
V.mine = p => S.loggedIn ? _vmine(p) : `${topbar('내 후기')}<div class="empty" style="padding:70px 24px"><b class="en" style="font-size:20px;font-weight:300">로그인이 필요해요</b><p class="sm mute" style="margin:8px 0 16px">로그인하면 내가 쓴 후기를 볼 수 있어요</p><button class="btn pri" data-a="goLogin">로그인</button></div>`;

/* ---------- 효과: 누름 · 하트 · 화면 등장 · 숫자 올라가기 (움직임 줄이기 설정이면 꺼짐) ---------- */
const RM = matchMedia('(prefers-reduced-motion: reduce)');
function countUp() {
  if (RM.matches) return;
  document.querySelectorAll('#view .cnt').forEach(el => { const n = +el.dataset.n; if (!(n > 0)) return; const t0 = performance.now(), d = 700; const f = t => { const k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(n * e); if (k < 1) requestAnimationFrame(f); }; el.textContent = 0; requestAnimationFrame(f); });
}
/* ---------- 효과: 화면 앞뒤 전환 · 시트 · 저장/오류 반응 ---------- */
let NAVDIR = 'fade';
function enter() {
  const v = $('#view'); if (!v || RM.matches) { countUp(); return; }
  v.classList.remove('fx-fwd', 'fx-bwd', 'fx-fade'); void v.offsetWidth; v.classList.add('fx-' + NAVDIR);
  clearTimeout(enter.t); enter.t = setTimeout(() => v.classList.remove('fx-fwd', 'fx-bwd', 'fx-fade'), 500); countUp();
}
[['go', 'fwd'], ['back', 'bwd'], ['tab', 'fade'], ['replaceTop', 'fade']].forEach(([n, d]) => { const o = window[n]; if (typeof o !== 'function') return; window[n] = function (...a) { NAVDIR = d; const r = o.apply(this, a); enter(); return r; }; });
/* 시트: 새로 열 때만 스프링으로 올라오고, 같은 시트를 다시 그릴 때는 그대로. 닫을 때는 내려가며 사라짐 */
const _sheet = sheet;
sheet = function (html, mid) {
  const old = $('#scrim'), keep = old && !old.classList.contains('out'); if (old) old.remove();
  _sheet(html, mid); const s = $('#scrim'); if (s && keep) s.classList.add('still');
};
closeSheet = function () {
  const s = $('#scrim'); if (!s) return;
  if (RM.matches) { s.remove(); return; }
  s.id = ''; s.classList.add('out'); setTimeout(() => s.remove(), 240);
};
/* 저장·완료 토스트에는 체크가 그려지고, 확인이 필요한 안내는 방금 누른 버튼이 좌우로 흔들림 */
let lastTap = null;
document.addEventListener('pointerdown', e => { lastTap = e.target.closest('button, .btn, [role=button]'); }, true);
const OK_RE = /(했어요|됐어요|완료|담았어요|저장|등록)/, ERR_RE = /(주세요|맞지 않아요|없어요|못했|필요해요|입력|골라)/;
const _toast = toast;
toast = function (msg) {
  _toast(msg); const t = $('#toast'); if (!t) return;
  const err = ERR_RE.test(msg) && !/했어요|됐어요/.test(msg), ok = !err && OK_RE.test(msg);
  if (ok) { t.classList.add('ok'); t.innerHTML = `<svg class="ck6" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M7 12.5l3.2 3.2L17 9"/></svg>${esc(msg)}`; }
  if (err) { t.classList.add('err'); shake(lastTap); }
};
function shake(el) { if (!el || RM.matches) return; el.classList.remove('shk6'); void el.offsetWidth; el.classList.add('shk6'); setTimeout(() => el.classList.remove('shk6'), 500); }
/* 옷 입력: 비어 있는 칸을 직접 흔들어 알려 줌 */
const _fmSave = ACT.fmSave;
ACT.fmSave = () => {
  if (FM && !FM.brand.trim() && !FM.name.trim()) { ['#fm-b', '#fm-n'].forEach(s => { const e = $(s); if (e) { e.classList.add('bad6'); shake(e); } }); const e = $('#fm-b'); if (e) e.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  else if (FM && !FM.size.trim()) { const e = $('.cb6 .szs'); if (e) { shake(e); e.scrollIntoView({ block: 'center', behavior: 'smooth' }); } }
  return _fmSave();
};
document.addEventListener('input', e => { if (e.target.classList && e.target.classList.contains('bad6')) e.target.classList.remove('bad6'); });
const _like = ACT.like; ACT.like = t => { const k = t.dataset.k, id = t.dataset.v, was = (S.likes[k] || []).includes(id); const r = _like(t); if (!was) setTimeout(() => { const b = [...document.querySelectorAll('[data-a=like]')].find(x => x.dataset.k === k && x.dataset.v === id); if (b) b.classList.add('pop'); }, 0); return r; };
enter();


/* ---------- 알림: 로그인 전·처음에는 아무것도 없음 ---------- */
const _ens = ensureNotifs;
ensureNotifs = function () {
  if (!S.loggedIn) { if (!S.notifs) S.notifs = []; return; }
  if (!S.nseed6) { S.nseed6 = 1; S.notifs = []; if (S.closet.some(c => c.pub)) { S.notifs = null; _ens(); } save(); }
  if (!S.notifs) S.notifs = [];
};
const nfEmpty = (title, sub, btn) => `${topbar('')}<div class="row between" style="padding:2px 20px 0"><h1 class="disp" style="margin:0;font-size:32px">알림</h1></div><div class="nem6"><i class="nem6i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15z"/><path d="M10 21h4"/></svg></i><b>${title}</b><span>${sub}</span>${btn}</div>`;
const _vnotifs = V.notifs;
V.notifs = p => {
  ensureNotifs();
  if (!S.loggedIn) return nfEmpty('로그인하면 알림을 받아요', '내 후기에 좋아요나 답글이 달리면<br>여기에서 알려드려요', '<button class="btn pri" data-a="goLogin">로그인</button>');
  if (!S.notifs.length) return nfEmpty('아직 알림이 없어요', '후기를 남기면 다른 사람의 좋아요와 답글을<br>여기에서 확인할 수 있어요', '<button class="btn pri" data-a="closetNew">첫 후기 남기기</button>');
  return _vnotifs(p);
};



/* ---------- 프로필: 로그인해야 열려요. 로그아웃 상태면 로그인 페이지로 보내고, 로그인하면 프로필로 이어가요 ---------- */
const _vprofile = V.profile, _goProfile = ACT.goProfile;
ACT.goProfile = () => {
  if (!S.loggedIn) { closeSheet(); AU = newAU(); AU.err = {}; AU.show = false; AU.next = 'profile'; go('login'); return; }
  _goProfile();
};
V.profile = p => {
  if (!S.loggedIn) { AU.next = 'profile'; if (!AU.err) AU.err = {}; return V.auth(); }   // 주소·뒤로가기로 들어와도 로그인 페이지를 보여줘요
  if (!(PF && PF.styles)) PF = { ...S.profile, styles: [...S.profile.styles] };
  return _vprofile(p);
};
const _authDone = authDone;
authDone = function () {
  const next = AU.next; AU.next = null;
  _authDone();
  if (S.loggedIn && next === 'profile') setTimeout(() => ACT.goProfile(), 0);
  else if (!S.loggedIn && stack.at(-1).v === 'profile') back();     // "로그인 없이 둘러볼게요"
};

/* ---------- 로그인 · 회원가입 화면 (입력칸 바로 아래 오류 안내 · 비밀번호 표시 · 조건 체크 · Enter로 제출) ---------- */
const AUID = { name: 'au-n', email: 'au-e', pw: 'au-p', pw2: 'au-p2' };
const AUE = k => (AU.err && AU.err[k]) ? `<div class="ferr6" role="alert">${esc(AU.err[k])}</div>` : '';
const authF = (k, label, type, ph, o = {}) => `<div class="field"><label class="f" for="${AUID[k]}">${label}</label><div class="pw6"><input id="${AUID[k]}" class="inp ${AU.err && AU.err[k] ? 'bad6' : ''}" type="${o.tog && AU.show ? 'text' : type}" data-i="au" data-k="${k}" value="${esc(AU[k])}" placeholder="${ph}" autocomplete="${o.ac || 'off'}" ${o.extra || ''}>${o.tog ? `<button type="button" class="pwt6" data-a="auShow" aria-label="비밀번호 ${AU.show ? '숨기기' : '표시'}">${AU.show ? '숨기기' : '표시'}</button>` : ''}</div>${AUE(k)}</div>`;
const PWR = p => [['8자 이상', p.length >= 8], ['영문 포함', /[A-Za-z]/.test(p)], ['특수문자 포함', /[^A-Za-z0-9\s]/.test(p)]];
const pwRulesHTML = p => `<div class="pwr6" id="pwr6">${PWR(p).map(([l, ok]) => `<span class="${ok ? 'on' : ''}">${ok ? '✓' : '·'} ${l}</span>`).join('')}</div>`;
V.auth = () => {
  const su = AU.mode === 'signup';
  return `${topbar('', { left: 'close' })}<div class="au6">
  <svg class="au6-lg" viewBox="0 0 28 28" aria-hidden="true"><rect width="28" height="28" rx="8" fill="#111"/><path d="M9 7h11M9 13h7M9 7v14" stroke="#fff" stroke-width="2.6" stroke-linecap="round" fill="none"/><path d="M9 17h2.5M9 20h2.5" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>
  <h1 class="disp" style="margin:14px 0 6px;font-size:28px">${su ? '핏센스 시작하기' : '다시 만나서<br>반가워요'}</h1>
  <p class="sub">${su ? '내 몸에 맞는 사이즈를 찾고, 같은 체형의 후기를 만나보세요.' : '로그인하면 후기·댓글을 남기고 내 정보를 이어서 볼 수 있어요.'}</p>
  <div class="mt16">${segHTML(['로그인', '회원가입'], su ? '회원가입' : '로그인', 'auMode')}</div>
  <form class="mt16" onsubmit="return false" novalidate>
  ${su ? authF('name', '닉네임', 'text', '2~12자', { extra: 'maxlength="12"', ac: 'nickname' }) : ''}
  ${authF('email', '이메일', 'email', 'name@email.com', { ac: 'email', extra: 'inputmode="email"' })}
  ${authF('pw', '비밀번호', 'password', su ? '영문·특수문자 포함 8자 이상' : '비밀번호', { tog: true, ac: su ? 'new-password' : 'current-password' })}
  ${su ? pwRulesHTML(AU.pw) : ''}
  ${su ? authF('pw2', '비밀번호 확인', 'password', '비밀번호를 한 번 더 입력', { tog: false, ac: 'new-password' }) : ''}
  ${su ? `<button type="button" class="row" role="checkbox" aria-checked="${AU.agree}" data-a="auAgree" style="background:none;border:0;padding:6px 0"><span class="cbx ${AU.agree ? 'on' : ''}">${AU.agree ? '✓' : ''}</span><span class="sm ink2">(필수) 이용약관·개인정보 처리방침에 동의해요</span></button>${AUE('agree')}` : ''}
  <button type="button" id="au-go" class="btn pri full ${su ? 'mt12' : 'mt8'}" data-a="${su ? 'doSignup' : 'doLogin'}">${su ? '가입하기' : '로그인'}</button>
  </form>
  ${su ? '' : '<div class="row mt12" style="justify-content:center"><button class="link" data-a="toastPw">비밀번호를 잊었어요</button></div>'}
  <div class="au6-or"><span>또는</span></div>
  <button class="btn flat full" data-a="authSkip">로그인 없이 둘러볼게요</button></div>`;
};
V.login = V.auth; V.signup = V.auth;
ACT.goLogin = () => { closeSheet(); AU = newAU(); AU.err = {}; AU.show = false; go('login'); };
ACT.goSignup = () => { AU = newAU(); AU.err = {}; AU.show = false; AU.mode = 'signup'; go('login'); };
ACT.auMode = t => { const keep = AU.email, next = AU.next; AU = newAU(); AU.err = {}; AU.show = false; AU.email = keep; AU.next = next; AU.mode = t.dataset.v === '회원가입' ? 'signup' : 'login'; reRender(); };
ACT.auShow = () => { AU.show = !AU.show; reRender(); const i = $('#au-p'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } };
INP.au = t => {
  const k = t.dataset.k; AU[k] = t.value;
  if (AU.err && AU.err[k]) { delete AU.err[k]; t.classList.remove('bad6'); const e = t.closest('.field') && t.closest('.field').querySelector('.ferr6'); if (e) e.remove(); }
  if (k === 'pw') { const r = $('#pwr6'); if (r) r.outerHTML = pwRulesHTML(AU.pw); }
};
const authFail = errs => {
  AU.err = errs; reRender();
  const first = ['name', 'email', 'pw', 'pw2'].find(k => errs[k]), el = first && $('#' + AUID[first]);
  if (el) { el.focus(); el.classList.add('shk6'); setTimeout(() => el.classList.remove('shk6'), 450); }
};
ACT.doLogin = () => {
  const e = AU.email.trim(), a = S.account, er = {};
  if (!e) er.email = '이메일을 입력해 주세요'; else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) er.email = '이메일 형식을 확인해 주세요';
  if (!AU.pw) er.pw = '비밀번호를 입력해 주세요';
  if (!Object.keys(er).length && (!a || a.email !== e || a.pw !== AU.pw)) er.pw = '이메일 또는 비밀번호를 확인해 주세요';
  if (Object.keys(er).length) { authFail(er); return; }
  S.loggedIn = true; save(); toast(`${a.name}님, 환영해요`); authDone();
};
ACT.doSignup = () => {
  const n = AU.name.trim(), e = AU.email.trim(), er = {};
  if (n.length < 2) er.name = '닉네임은 2자 이상 입력해 주세요';
  if (!e) er.email = '이메일을 입력해 주세요'; else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) er.email = '이메일 형식을 확인해 주세요';
  else if (S.account && S.account.email === e) er.email = '이미 가입된 이메일이에요. 로그인해 주세요';
  if (!pwOk(AU.pw)) er.pw = `비밀번호는 ${PW_RULE}이어야 해요`;
  if (!AU.pw2) er.pw2 = '비밀번호를 한 번 더 입력해 주세요'; else if (AU.pw !== AU.pw2) er.pw2 = '비밀번호가 서로 달라요';
  if (!AU.agree) er.agree = '필수 약관에 동의해 주세요';
  if (Object.keys(er).length) { authFail(er); return; }
  S.account = { name: n, email: e, pw: AU.pw, joined: today() }; S.loggedIn = true; S.profile.nick = n; save(); toast(`${n}님, 가입을 환영해요`); authDone();
};
ACT.auAgree = () => { AU.agree = !AU.agree; if (AU.err) delete AU.err.agree; reRender(); };
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches && e.target.matches('[data-i=au]')) { const b = $('#au-go'); if (b) { e.preventDefault(); b.click(); } } });
