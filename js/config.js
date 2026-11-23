/* ===== 외부 서비스 설정 =====
   키(비밀값)는 여기에 넣지 마세요. 이 파일은 GitHub에 공개돼요.
   - aiEndpoint : Cloudflare Worker 주소(사진 분석). 비워 두면 AI 없이 기존 방식으로 동작해요.
   - supabaseUrl / supabaseAnonKey : Supabase 프로젝트 주소와 공개용(anon) 키. */
window.FS_CONFIG = { aiEndpoint: '', supabaseUrl: '', supabaseAnonKey: '' };
