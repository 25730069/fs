"""data/*.json -> data/bundle.js (file:// 로 index.html을 바로 열 때만 쓰는 사본).
JSON을 고친 뒤에는 이 스크립트를 다시 실행하세요:  python3 tools/build_bundle.py"""
import json, pathlib
d = pathlib.Path(__file__).resolve().parent.parent / 'data'
raw = {k: json.loads((d / f'{k}.json').read_text(encoding='utf-8')) for k in ('brands', 'products', 'reviews')}
(d / 'bundle.js').write_text('window.FS_RAW=' + json.dumps(raw, ensure_ascii=False, separators=(',', ':')) + ';', encoding='utf-8')
print('data/bundle.js 생성')
