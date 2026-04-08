# 설비트리거 (Mechanical Trigger) 프로젝트 개요

> **서비스명**: 콘스토어 (CONSTORE) — 건설업 전문 자재 검색 & 커뮤니티  
> **DB**: MySQL (`baboyayo`)  
> **스택**: PHP 7.4+ / Vanilla JS / MySQL / HTML+CSS  
> **호스팅**: 닷홈 (dothome)

---

## 1. 폴더 구조

```
mechanical trigger/
├── index.html              # SPA 메인 레이아웃 (JS가 페이지 동적 생성)
├── db.php                  # DB 연결 + 공통 헬퍼 함수
├── get_data.php            # 자재 DB 로드 (mat_db.json + img_map.json)
├── save_db.php             # 자재 DB 저장 (관리자)
├── rss_fetch.php           # 건설 뉴스 수집 (네이버 API, 30분 캐시)
├── send_verify.php         # 이메일 인증코드 발송
├── naver_login.php         # 네이버 OAuth 시작
├── naver_callback.php      # 네이버 OAuth 콜백 처리
├── charge_request.php      # 캐시 충전 신청 페이지 (사용자용)
├── admin_charge.php        # 캐시 충전 관리 페이지 (관리자용)
├── upload_img.php          # 자재 이미지 업로드/관리
├── upload_docs.php         # 공무자료 파일 업로드
├── setup-finish.html       # 초기 세팅 완료 페이지
├── img_map.json            # 자재명 → 이미지 경로 매핑
├── mat_db.json             # 자재 정보 전체 DB
├── naver_users.json        # 네이버 로그인 사용자 저장 (gitignore)
├── rss_cache.json          # 뉴스 캐시 (gitignore)
├── auto-git.ps1            # 파일 변경 감지 → 자동 커밋/푸시 스크립트
│
├── api/
│   ├── auth.php            # 회원가입, 로그인, 정보 변경
│   ├── posts.php           # 커뮤니티 게시글 + 댓글
│   ├── cash.php            # 캐시 충전/차감/신청/관리자 처리
│   ├── docs.php            # 공무자료실 CRUD + 댓글
│   ├── help.php            # 도움요청 등록/신청/선택/완료
│   └── user.php            # 회원 정보/경험치/등급/관리자 기능
│
├── js/
│   ├── auth.js             # 로그인, 회원가입, 네이버 OAuth 처리
│   ├── search.js           # 자재 검색, 발주 목록, ZIP/Excel 다운로드
│   ├── board.js            # 동산보드 (현장 사진 표 정리)
│   ├── community.js        # 커뮤니티 게시판
│   ├── docs.js             # 공무자료실
│   └── help.js             # 도움요청 + 캐시 관리 UI
│
├── css/
│   └── style.css           # 전체 스타일 (CSS 변수 기반)
│
├── images/                 # 자재 이미지 저장 (mat_*.jpg)
└── gongmu/                 # 공무자료 파일 저장 (PDF, DOC 등)
```

---

## 2. 주요 기능

| 기능 | 설명 |
|------|------|
| 자재 검색 | mat_db.json 기반 검색, 규격별 수량 입력, 발주서 ZIP/Excel 다운로드 |
| 커뮤니티 | 카테고리별 게시판 (자유/질문/정보/구인구직 등), 댓글, 추천/반대 |
| 도움요청 | 캐시 기반 중개 시스템 (등록→신청→선택→완료→캐시 90% 지급) |
| 공무자료실 | 현장 서식/자료 공유, 등급별 다운로드 제한 |
| 동산보드 | 현장 사진에 공사명/공종/위치 표 형식으로 정리, ZIP 내보내기 |
| 캐시 시스템 | 충전 신청(계좌입금)→관리자 승인, 도움요청 중개 수수료 10% |
| 회원 등급 | 용역→신호수→조공→준기공→기공→팀장→기능장→기술사 (경험치 기반) |
| 건설 뉴스 | 네이버 API 키워드 수집 (기계설비, 건설공사, 소화설비 등) |
| 네이버 로그인 | OAuth 2.0, naver_users.json 파일 저장 |

---

## 3. DB 테이블 목록

| 테이블 | 설명 |
|--------|------|
| `sbt_users` | 회원 정보 (id, username, password, name, email, grade, cash, exp, type) |
| `sbt_materials` | 자재 정보 |
| `sbt_posts` | 커뮤니티 게시글 |
| `sbt_comments` | 게시글 댓글 |
| `sbt_docs` | 공무자료실 자료 |
| `sbt_docs_comments` | 공무자료 댓글 |
| `sbt_help` | 도움요청 |
| `sbt_help_applicants` | 도움요청 신청자 |
| `sbt_cash_log` | 캐시 이력 |
| `sbt_exp_log` | 경험치 이력 |
| `sbt_charge_requests` | 충전 신청 내역 |
| `sbt_verify_codes` | 이메일 인증코드 |
| `sbt_settings` | 사이트 설정 |

---

## 4. API 엔드포인트 요약

| 파일 | Action 목록 |
|------|------------|
| `api/auth.php` | check_id, register, login, get_user, update_name, change_pw |
| `api/posts.php` | list, get, write, edit, delete, vote, comment_add, comment_edit, comment_delete, comment_vote |
| `api/cash.php` | log, charge, deduct, reward, admin_adjust, request_charge, get_charge_requests, admin_process_charge, get_refund_info, integrity_check, nick_change |
| `api/docs.php` | upload, list, get, write, edit, delete, comment_add, comment_delete |
| `api/help.php` | list, get, write, edit, delete, apply, select, confirm, dispute, resolve, pay_helper |
| `api/user.php` | info, update_name, update_pw, add_exp, list, adjust, save_menu_state, get_menu_state |

---

## 5. 회원 등급 체계 (경험치 기반)

| 등급 | 필요 EXP | 비고 |
|------|---------|------|
| 기술사 | 2000+ | 최고 등급 |
| 기능장 | 1200+ | |
| 팀장 | 800+ | |
| 기공 | 500+ | |
| 준기공 | 300+ | |
| 조공 | 150+ | |
| 신호수 | 50+ | |
| 용역 | 0 | 가입 기본값 |

- 게시글 작성: +15 EXP
- 댓글 작성: +5 EXP
- 도움요청 신청/완료: +10 EXP

---

## 6. 주요 로컬스토리지 키

| 키 | 내용 |
|----|------|
| `sbt_session` | 로그인 사용자 정보 |
| `naver_login_user` | 네이버 로그인 정보 |
| `sbt_refund_info` | 환불계좌 정보 (자동완성) |
| `sbt_dboard_groups` | 동산보드 그룹 |
| `sbt_dboard_items` | 동산보드 단독 아이템 |

---

## 7. CSS 주요 변수

```css
--orange: #E8500A    /* 주요 액션 색상 */
--blue: #2563EB
--dark: #111827      /* 헤더 */
--surface: #F8FAFC   /* 배경 */
--border: #E2E8F0
--radius: 12px
```

---

## 8. 외부 의존성

| 서비스 | 용도 |
|--------|------|
| 네이버 API | 로그인(OAuth), 뉴스 수집 |
| Google reCAPTCHA | 스팸 방지 |
| JSZip (CDN) | 발주서 ZIP 다운로드 |
| XLSX (CDN) | 발주서 Excel 다운로드 |
| Google Fonts | Noto Sans KR, Bebas Neue |

---

## 9. 관리자 접근

| 페이지 | URL | 비밀번호 |
|--------|-----|---------|
| 캐시 충전 관리 | `/admin_charge.php?pw=...` | DB_PASS와 동일 |
| 자재 DB 저장 | `save_db.php` POST | 동일 |
| 이미지 관리 | `upload_img.php` | 동일 |

---

*이 파일은 프로젝트 초기 구조 파악용입니다. 변경 이력은 UPDATE_LOG_NNN.md 파일들을 참조하세요.*
