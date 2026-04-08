# UPDATE_LOG_001 — 초기 상태 기록

> **날짜**: 2026-04-08  
> **유형**: 초기 기록 (변경 없음)  
> **GitHub 커밋**: first commit

---

## 현재 파일 목록 (초기 상태)

| 파일 | 설명 |
|------|------|
| index.html | SPA 메인 레이아웃 |
| db.php | DB 연결 + 공통 헬퍼 |
| get_data.php | 자재 DB 로드 |
| save_db.php | 자재 DB 저장 (관리자) |
| rss_fetch.php | 건설 뉴스 수집 |
| send_verify.php | 이메일 인증 발송 |
| naver_login.php | 네이버 OAuth 시작 |
| naver_callback.php | 네이버 OAuth 콜백 |
| charge_request.php | 캐시 충전 신청 페이지 |
| admin_charge.php | 캐시 충전 관리 (관리자) |
| upload_img.php | 자재 이미지 업로드 |
| upload_docs.php | 공무자료 파일 업로드 |
| setup-finish.html | 초기 세팅 완료 페이지 |
| img_map.json | 자재 이미지 매핑 |
| mat_db.json | 자재 정보 DB |
| css/style.css | 전체 스타일 |
| js/auth.js | 인증 UI |
| js/search.js | 자재 검색 |
| js/board.js | 동산보드 |
| js/community.js | 커뮤니티 |
| js/docs.js | 공무자료실 |
| js/help.js | 도움요청 |
| api/auth.php | 인증 API |
| api/posts.php | 게시글 API |
| api/cash.php | 캐시 API |
| api/docs.php | 공무자료 API |
| api/help.php | 도움요청 API |
| api/user.php | 회원 API |
| auto-git.ps1 | 자동 Git 동기화 스크립트 |
| PROJECT_OVERVIEW.md | 프로젝트 전체 구조 문서 |

---

## 특이사항

- GitHub 저장소(`ywyw8282/sbt`) 최초 연동 완료
- `.gitignore`에서 제외된 민감 파일: `naver_users.json`, `rss_cache.json`, `mat_db.json`
- 자동 Git 동기화 스크립트(`auto-git.ps1`) 추가됨
