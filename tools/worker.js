/* Cloudflare Worker: 사이즈표 사진 → Gemini → JSON
   배포: Cloudflare 대시보드 → Workers & Pages → Create → 이 코드를 붙여넣기
   설정(Settings → Variables and Secrets)
     GEMINI_API_KEY  (Secret)  AI Studio에서 발급한 키. 코드나 GitHub에 넣지 마세요.
     GEMINI_MODEL    (Text)    AI Studio 콘솔에 표시된 현재 Flash 계열 모델 이름
     ALLOWED_ORIGIN  (Text)    예) https://내아이디.github.io  (비우면 모두 허용: 시험용)
*/
const CATS = { 상의: ['어깨', '가슴', '소매', '총장'], 아우터: ['어깨', '가슴', '소매', '총장'], 하의: ['허리', '힙', '허벅지', '총장'], 원피스: ['어깨', '가슴', '허리', '총장'] };
const j = (o, s, h) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', ...h } });

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '', allow = env.ALLOWED_ORIGIN || '*';
    const cors = { 'Access-Control-Allow-Origin': allow === '*' ? '*' : allow, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', Vary: 'Origin' };
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (req.method !== 'POST') return j({ error: 'method' }, 405, cors);
    if (allow !== '*' && origin !== allow) return j({ error: 'origin' }, 403, cors);
    if (!env.GEMINI_API_KEY || !env.GEMINI_MODEL) return j({ error: 'not_configured' }, 500, cors);

    let b; try { b = await req.json(); } catch (e) { return j({ error: 'bad_json' }, 400, cors); }
    const m = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(b.image || '');
    if (!m) return j({ error: 'bad_image' }, 400, cors);
    if (m[2].length > 4_000_000) return j({ error: 'too_large' }, 413, cors);
    const parts = CATS[b.cat]; if (!parts) return j({ error: 'bad_cat' }, 400, cors);

    const prompt = `이 이미지는 의류 상품의 사이즈표다. 각 사이즈(XS, S, M, L, XL)의 실측을 cm 숫자로 읽어라. 읽을 부위는 ${parts.join(', ')} 뿐이다. 표에 없는 값은 만들지 말고 생략하고, 사이즈표가 아니거나 읽을 수 없으면 sizes를 빈 배열로 답하라. 둘레가 아닌 단면 길이라도 표에 적힌 숫자를 그대로 적어라.`;
    const schema = { type: 'OBJECT', properties: { sizes: { type: 'ARRAY', items: { type: 'OBJECT', properties: { size: { type: 'STRING' }, values: { type: 'ARRAY', items: { type: 'OBJECT', properties: { part: { type: 'STRING', enum: parts }, cm: { type: 'NUMBER' } }, required: ['part', 'cm'] } } }, required: ['size', 'values'] } } }, required: ['sizes'] };
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.GEMINI_MODEL)}:generateContent`;
    let r;
    try {
      r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: m[1], data: m[2] } }] }], generationConfig: { temperature: 0, responseMimeType: 'application/json', responseSchema: schema } }) });
    } catch (e) { return j({ error: 'upstream' }, 502, cors); }
    if (r.status === 429) return j({ error: 'quota' }, 429, cors);
    if (!r.ok) return j({ error: 'upstream' }, 502, cors);
    try {
      const d = await r.json(), t = d.candidates[0].content.parts[0].text;
      return j(JSON.parse(t), 200, cors);
    } catch (e) { return j({ error: 'bad_output' }, 502, cors); }
  }
};
