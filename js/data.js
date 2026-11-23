/* 데이터 로더(코드이며 데이터 파일이 아니에요): data/*.json → 앱이 쓰는 짧은 형식(DB)으로 변환
   data/brands.json   브랜드 마스터 (brand_id, name_kr, name_en, site_url, genders, categories, styles, size_tendency, price_tier, meta)
   data/products.json 상품 (product_id, brand_id, name, category, sub_category, gender, fit_type, sleeve_type, stretch, price, colors, sizes, size_chart, release_date, meta)
   data/reviews.json  후기 (review_id, product_id, reviewer_id, reviewer_nick, reviewer_handle, height_cm, weight_kg, purchased_size, size_opinion, … meta)
   필드 설명과 허용값은 README.md 의 '데이터 명세' 참고 */
const DATA_VER = '20261123163000'; // 빌드 시각: 예전 JSON·JS가 브라우저에 남아 새 파일과 섞이는 것을 막아요
const DATA_FILES = { brands: 'data/brands.json', products: 'data/products.json', reviews: 'data/reviews.json' };
async function fetchRaw() {
  if (location.protocol === 'file:') {   // 파일을 더블클릭해 연 경우: 브라우저가 fetch로 로컬 JSON을 막으므로 data/bundle.js(같은 내용의 사본)를 읽어요
    if (!window.FS_RAW) await new Promise((ok, no) => { const sc = document.createElement('script'); sc.src = 'data/bundle.js?v=' + DATA_VER; sc.onload = ok; sc.onerror = () => no(new Error('data/bundle.js 없음 — python3 tools/build_bundle.py 실행')); document.head.appendChild(sc); });
    return window.FS_RAW;
  }
  const out = {};
  for (const [k, u] of Object.entries(DATA_FILES)) { const r = await fetch(u + '?v=' + DATA_VER, { cache: 'no-cache' }); if (!r.ok) throw new Error(u + ' ' + r.status); out[k] = await r.json(); }
  return out;
}
const STYLES = ['캐주얼', '시티', '시티보이', '클래식', '에스닉', '걸리시', '고프코어', '미니멀', '프레피', '리조트', '레트로', '로맨틱', '스포티', '스트릿', '워크웨어'];
/* 이미지: asset/ 폴더 (brands=브랜드 로고, kinds=상품 종류 사진, categories=카테고리 배너). 파일이 없거나 깨지면 onerror 로 이미지를 지워 "이미지" 자리표시가 그대로 보여요. */
const IMG_ON = true;
const KIND_SLUG = {"가디건": "cardigan", "긴소매 티셔츠": "longsleeve-tee", "니트": "knit", "맨투맨": "sweatshirt", "블라우스": "blouse", "셔츠": "shirt", "슬리브리스": "sleeveless", "크롭 티셔츠": "crop-tee", "티셔츠": "tee", "폴로 셔츠": "polo", "후드 티셔츠": "hoodie", "데님 재킷": "denim-jacket", "레더 재킷": "leather-jacket", "바람막이": "windbreaker", "블레이저": "blazer", "블루종": "blouson", "숏 패딩": "short-padding", "코트": "coat", "트렌치 코트": "trench-coat", "트위드 재킷": "tweed-jacket", "패딩": "padding", "플리스 재킷": "fleece-jacket", "후드 집업": "hoodie-zipup", "니트 원피스": "knit-dress", "롱 원피스": "long-dress", "미니 원피스": "mini-dress", "셔츠 원피스": "shirt-dress", "슬리브리스 원피스": "sleeveless-dress", "데님 팬츠": "denim-pants", "레깅스": "leggings", "숏 팬츠": "shorts", "스커트": "skirt", "슬랙스": "slacks", "조거 팬츠": "jogger-pants", "카고 팬츠": "cargo-pants", "코튼 팬츠": "cotton-pants", "트레이닝 팬츠": "training-pants"};
const kindSrc = sc => KIND_SLUG[sc] ? `asset/kinds/${KIND_SLUG[sc]}.webp` : '';
const pimg = id => { if (!IMG_ON || !id) return ''; const p = typeof prodById !== 'undefined' && prodById[id], u = p && kindSrc(p.sc); return u ? `<img src="${u}" alt="" loading="lazy" onerror="this.remove()">` : ''; };
const bimg = id => IMG_ON && id ? `<img class="logo-img" src="asset/brands/${id}.webp" alt="" loading="lazy" onerror="this.remove()">` : '';
const simg = sc => IMG_ON && kindSrc(sc) ? `<img src="${kindSrc(sc)}" alt="" loading="lazy" onerror="this.remove()">` : '';
const TEND_LBL = { '작게 나옴': '작게 나오는 편', '정사이즈': '정사이즈 경향', '크게 나옴': '크게 나오는 편' };
const CODE_MAP = { 상의: 'top', 하의: 'bottom', 원피스: 'dress', 아우터: 'outer' };
function mapDB(raw) {
  const prods = (raw.products || []).filter(x => x.category !== '신발'), revs = raw.reviews || [];
  const B = (raw.brands || []).map(x => ({ id: x.brand_id, n: x.name_kr, en: x.name_en || '', site: x.site_url || '', tend: TEND_LBL[x.size_tendency] || null, st: Array.isArray(x.styles) && x.styles.length ? x.styles : [], g: x.genders || [], tier: x.price_tier || null, meta: x.meta || null }));
  const seen = new Set(), TX = [];
  prods.filter(x => B.some(b => b.id === x.brand_id)).forEach(x => { (x.gender === '공용' ? ['여성', '남성'] : [x.gender]).forEach(g => { const k = [x.brand_id, g, x.category, x.sub_category].join('|'); if (!seen.has(k)) { seen.add(k); TX.push({ b: x.brand_id, g, code: CODE_MAP[x.category], s: x.sub_category }); } }); });
  const bset = new Set(B.map(b => b.id)), orphan = prods.filter(x => !bset.has(x.brand_id));
  if (orphan.length) console.warn('[mapDB] brands.json에 없는 brand_id를 가진 상품 ' + orphan.length + '개는 건너뜀 (brands.json과 products.json 버전이 다를 수 있어요)');
  const P = prods.filter(x => bset.has(x.brand_id)).map(x => ({
    id: x.product_id, b: x.brand_id, n: String(x.name).replace('(가상) ', ''), c: x.category, sc: x.sub_category || '', g: x.gender || null, fit: x.fit_type, sl: x.sleeve_type, st: x.stretch,
    pr: x.price, col: x.colors || [], sz: x.sizes, ch: x.size_chart || null, rd: x.release_date || null, real: !!(x.meta && x.meta.source !== 'generated'), meta: x.meta || null
  }));
  const U = {}, NK = {}, HD = {}, R = [];
  revs.forEach(x => {
    const uid = x.reviewer_id; U[uid] = [x.height_cm, x.weight_kg, x.fit_preference || '기본 핏']; if (x.reviewer_nick) NK[uid] = x.reviewer_nick; if (x.reviewer_handle) HD[uid] = x.reviewer_handle;
    R.push({ id: x.review_id, p: x.product_id, u: uid, rt: x.rating, d: x.review_date, sz: x.purchased_size, op: x.size_opinion, lo: x.length_opinion, fd: x.fit_details || {}, ez: null, fs: x.fitted_size, t: x.review_text, kw: Array.isArray(x.keywords) ? x.keywords : null, col: x.color || null, real: x.data_type === 'real' });
  });
  return { B, P, U, R, TX, NK, HD };
}
