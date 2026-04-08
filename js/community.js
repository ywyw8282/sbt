function toggleReplyBox(cid){
  var box = document.getElementById('reply-box-'+cid);
  if(!box) return;
  box.style.display = box.style.display==='none'?'block':'none';
  if(box.style.display==='block'){
    var inp = document.getElementById('reply-input-'+cid);
    if(inp) inp.focus();
  }
}

/* ── 추천/반대 (중복 방지) ── */
function votePost(id, type){
  var p = POSTS.find(function(p){ return p.id===id; }); if(!p) return;
  var prev = likedPosts[id];
  if(prev === type){ alert('이미 '+(type==='like'?'추천':'반대')+'하셨습니다.'); return; }
  // 이전 표 취소
  if(prev==='like')    p.likes    = Math.max(0, p.likes-1);
  if(prev==='dislike') p.dislikes = Math.max(0, p.dislikes-1);
  // 새 표
  likedPosts[id] = type;
  if(type==='like')    p.likes++;
  if(type==='dislike') p.dislikes++;
  // UI 업데이트
  var lBtn = document.getElementById('likeBtn-'+id);
  var dBtn = document.getElementById('dislikeBtn-'+id);
  var lCnt = document.getElementById('likeCnt-'+id);
  var dCnt = document.getElementById('dislikeCnt-'+id);
  if(lCnt) lCnt.textContent = p.likes;
  if(dCnt) dCnt.textContent = p.dislikes;
  if(lBtn){ lBtn.style.background=type==='like'?'var(--orange)':'#F5F3EF'; lBtn.style.color=type==='like'?'#fff':'var(--text-mid)'; lBtn.style.borderColor=type==='like'?'var(--orange)':'var(--border)'; }
  if(dBtn){ dBtn.style.background=type==='dislike'?'#555':'#F5F3EF'; dBtn.style.color=type==='dislike'?'#fff':'var(--text-mid)'; dBtn.style.borderColor=type==='dislike'?'#555':'var(--border)'; }
  if(p.likes>=15){ alert('🏆 베스트 게시글로 등록됐습니다! (추천 '+p.likes+'개)'); }
}

/* ── 댓글 추가 ── */
function addComment(id){
  if(!currentUser){ alert('댓글 작성은 로그인 후 이용할 수 있습니다.'); openLoginModal(); return; }
  var p = POSTS.find(function(p){ return p.id===id; }); if(!p) return;
  var input = document.getElementById('cmtInput-'+id);
  var text = input ? input.value.trim() : '';
  if(!text) return;
  var cmtAuthor = currentUser.name;
  var newCmt = {id:nextCommentId++, author:cmtAuthor, text:text, replies:[]};
  if(currentUser){ addExp(currentUser, 5, '댓글 작성'); currentUser.commentCount=(currentUser.commentCount||0)+1; saveUserData(); }
  p.comments.push(newCmt);
  if(input) input.value='';
  var listEl = document.getElementById('cmtList-'+id);
  if(listEl){
    var div = document.createElement('div');
    div.style.cssText='padding:12px 14px;background:var(--surface);border-radius:6px;margin-bottom:6px';
    div.id='cmt-'+newCmt.id;
    div.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">'
      +'<span style="font-size:12px;font-weight:700;color:var(--text-mid)">'+cmtAuthor+'</span>'
      +'<button onclick="toggleReplyBox('+newCmt.id+')" style="font-size:11px;color:var(--text-light);background:none;border:none;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">↩ 답글</button>'
    +'</div>'
    +'<div style="font-size:13px;color:var(--text);line-height:1.6">'+text+'</div>'
    +'<div style="margin-top:6px"><button id="cmtLike-'+newCmt.id+'" onclick="voteComment('+id+','+newCmt.id+')" style="font-size:11px;color:var(--text-light);background:none;border:1px solid var(--border);border-radius:3px;padding:2px 8px;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">👍 0</button></div>'
    +'<div id="reply-box-'+newCmt.id+'" style="display:none;margin-top:8px">'
      +'<div style="display:flex;gap:6px">'
        +'<input type="text" id="reply-input-'+newCmt.id+'" placeholder="답글 입력..." style="flex:1;padding:7px 10px;border:1px solid var(--border);border-radius:4px;font-size:12px;font-family:\'Noto Sans KR\',sans-serif;outline:none" onkeydown="if(event.key===\'Enter\')addReply('+id+','+newCmt.id+')">'
        +'<button onclick="addReply('+id+','+newCmt.id+')" style="padding:7px 12px;background:var(--dark);color:#fff;border:none;border-radius:4px;font-size:12px;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">등록</button>'
      +'</div>'
    +'</div>';
    listEl.appendChild(div);
  }
  var cntEl = document.getElementById('cmtCnt-'+id);
  if(cntEl) cntEl.textContent = p.comments.length;
  savePosts();
}

/* ── 대댓글 추가 ── */
function addReply(postId, cmtId){
  if(!currentUser){ alert('답글 작성은 로그인 후 이용할 수 있습니다.'); openLoginModal(); return; }
  var p = POSTS.find(function(p){ return p.id===postId; }); if(!p) return;
  var cmt = p.comments.find(function(c){ return c.id===cmtId; }); if(!cmt) return;
  var input = document.getElementById('reply-input-'+cmtId);
  var text = input ? input.value.trim() : '';
  if(!text) return;
  if(!cmt.replies) cmt.replies=[];
  var today = new Date().toLocaleDateString('ko-KR');
  cmt.replies.push({author:currentUser.name, text:text, date:today});
  if(input) input.value='';
  // 해당 댓글 영역 갱신
  var cmtDiv = document.getElementById('cmt-'+cmtId);
  if(cmtDiv){
    var repliesDiv = cmtDiv.querySelector('.replies-container');
    var newReplyHtml = '<div style="padding:8px 12px;background:#fff;border-radius:4px;margin-bottom:4px">'
      +'<div style="font-size:11px;font-weight:700;color:var(--text-mid);margin-bottom:3px">↩ '+currentUser.name+' <span style="font-weight:400;color:var(--text-light)">'+today+'</span></div>'
      +'<div style="font-size:12px;color:var(--text)">'+text+'</div>'
    +'</div>';
    if(repliesDiv){ repliesDiv.insertAdjacentHTML('beforeend', newReplyHtml); }
    else {
      var replyBox = document.getElementById('reply-box-'+cmtId);
      if(replyBox){
        var d = document.createElement('div');
        d.className = 'replies-container';
        d.style.cssText='margin-top:8px;padding-left:12px;border-left:2px solid var(--orange);background:#FFFAF7;border-radius:0 4px 4px 0;padding:8px 12px;margin-bottom:4px';
        d.innerHTML=newReplyHtml;
        cmtDiv.insertBefore(d, replyBox);
      }
    }
  }
  savePosts();
  toggleReplyBox(cmtId);
}

/* ── 자재검색 대댓글 토글/추가 ── */
function toggleExtraReplyBox(key, origIdx){
  var safeKey = key.replace(/[^가-힣a-zA-Z0-9]/g,'_');
  var box = document.getElementById('xcr-box-'+safeKey+'-'+origIdx);
  if(!box) return;
  box.style.display = box.style.display==='none' ? 'block' : 'none';
  if(box.style.display==='block'){
    var inp = document.getElementById('xcr-inp-'+safeKey+'-'+origIdx);
    if(inp) inp.focus();
  }
}

function addExtraReply(key, origIdx){
  if(!currentUser){ alert('로그인이 필요합니다.'); return; }
  var safeKey = key.replace(/[^가-힣a-zA-Z0-9]/g,'_');
  var inp = document.getElementById('xcr-inp-'+safeKey+'-'+origIdx);
  var text = inp ? inp.value.trim() : '';
  if(!text) return;
  var list = matExtraComments[key];
  var cm = list ? list[origIdx] : null; if(!cm) return;
  if(!cm.replies) cm.replies = [];
  cm.replies.push({author:currentUser.name, text:text, date:new Date().toLocaleDateString('ko-KR')});
  saveExtraComments();
  refreshAllCommentPanels(key);
}
/* ── 건설뉴스 데이터 + 렌더 ── */
const NEWS=[
  {id:1,cat:'정책',grade:'기공',title:'2025년 건설업 안전관리비 산정기준 개정 시행',date:'2025.03.18 14:45',summary:'고용노동부가 건설업 안전관리비 계상 기준을 대폭 개정하여 소규모 현장도 의무 적용 범위에 포함시켰습니다.',content:'고용노동부는 2025년 3월부터 건설업 안전관리비 산정기준을 개정 시행한다고 밝혔습니다. 주요 내용으로는 공사금액 4천만 원 이상 모든 현장에 안전관리비 의무 계상, 안전점검 비용 별도 항목 신설, 스마트 안전장비 도입 비용 인정 등이 포함됩니다.'},
  {id:2,cat:'시황',grade:'팀장',title:'철근·형강 가격 1분기 대비 소폭 하락 전망',date:'2025.03.17 08:00',summary:'건설자재 가격 동향 조사에 따르면 이형봉강 및 H형강 가격이 2분기에 소폭 하락할 것으로 전망됩니다.',content:'한국철강협회에 따르면 2025년 2분기 이형봉강 기준가격은 톤당 75만 원 내외로, 1분기 대비 약 2~3% 하락이 예상됩니다. 중국발 물량 증가와 국내 건설 경기 위축이 주요 원인으로 분석됩니다.'},
  {id:3,cat:'제도',grade:'기술사',title:'건설공사 하도급 대금 직불제 강화 추진',date:'2025.03.16 08:00',summary:'국토교통부가 하도급 대금 미지급 문제 해소를 위해 직불제 적용 범위를 확대하는 방안을 추진합니다.',content:'국토교통부는 건설 하도급 대금 미지급 관행 근절을 위해 직불제 의무 적용 범위를 공공공사 전체로 확대할 계획이라고 밝혔습니다. 또한 전자 하도급 관리시스템을 통한 실시간 대금 지급 모니터링도 강화됩니다.'},
  {id:4,cat:'기술',grade:'준기공',title:'BIM 설계 의무화 공공건축물 50억 이상으로 확대',date:'2025.03.15 13:30',summary:'국토부가 BIM 설계 의무 대상을 조정사업비 50억 원 이상 공공건축물로 확대 적용합니다.',content:'국토교통부는 건설 디지털 전환 정책의 일환으로 BIM 설계 의무화 기준을 50억 원 이상 공공건축물로 확대한다고 발표했습니다. 설비·전기·소방 분야도 3D BIM 모델 제출이 필수화될 예정입니다.'},
];

function renderNews(){
  const el=document.getElementById('newsList'); if(!el) return;
  el.innerHTML=NEWS.map(n=>`
    <div onclick="openNewsDetail(${n.id})" style="background:var(--white);border:1px solid var(--border);border-radius:8px;padding:20px 24px;cursor:pointer;transition:box-shadow .15s" onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,.08)'" onmouseout="this.style.boxShadow=''">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <span style="background:var(--tag-bg);color:var(--tag-text);font-size:11px;padding:2px 8px;border-radius:3px;font-weight:500">${n.cat}</span>
        <span style="font-size:12px;color:var(--text-light)">${n.date}</span>
      </div>
      <div style="font-size:16px;font-weight:700;margin-bottom:8px;color:var(--text)">${n.title}</div>
      <div style="font-size:13px;color:var(--text-mid);line-height:1.6">${n.summary}</div>
    </div>`).join('');
}

function openNewsDetail(id){
  const n=NEWS.find(n=>n.id===id); if(!n) return;
  // 공지사항 상세 페이지 재활용
  document.getElementById('noticeDetailContent').innerHTML=`
    <div style="background:var(--white);border:1px solid var(--border);border-radius:8px;overflow:hidden">
      <div style="padding:24px 28px;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <span style="background:var(--tag-bg);color:var(--tag-text);font-size:11px;padding:2px 8px;border-radius:3px;font-weight:500">${n.cat}</span>
          <span style="font-size:12px;color:var(--text-light)">${n.date}</span>
        </div>
        <h2 style="font-size:20px;font-weight:700;margin-bottom:8px">${n.title}</h2>
      </div>
      <div style="padding:28px;font-size:14px;color:var(--text-mid);line-height:1.9">${n.content}</div>
      <div style="padding:0 28px 24px">
        <button onclick="showPage('news')" style="padding:10px 20px;background:transparent;color:var(--text-mid);border:1px solid var(--border);border-radius:6px;font-size:13px;cursor:pointer;font-family:'Noto Sans KR',sans-serif">← 뉴스 목록으로</button>
      </div>
    </div>`;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-notice-detail').classList.add('active');
  window.scrollTo(0,0);
}

/* ── 건설안전 데이터 + 렌더 ── */
var safetyTabActive = 'all';
var safetySearchQ = '';

const SAFETY_CAT = {
  'all':      {label:'전체',      icon:'🔍', color:'#1A1A18', bg:'#F0EDE8'},
  '법령':     {label:'법령/규정', icon:'📜', color:'#8B2020', bg:'#FDEEEE'},
  '사고사례': {label:'사고사례', icon:'⚠️', color:'#8B5A00', bg:'#FFF5E0'},
  '체크리스트':{label:'체크리스트',icon:'✅', color:'#1A6B3A', bg:'#E8F5EE'},
  '안전교육': {label:'안전교육', icon:'📚', color:'#1A4080', bg:'#E8F0FB'},
  'TBM':      {label:'TBM자료',  icon:'🗣️', color:'#5A2080', bg:'#F0E8FB'},
};

const SAFETY=[
  {id:1, cat:'법령', important:true,  title:'산업안전보건법 주요 의무사항 요약 (2025 개정)', date:'2025.03.10',
    content:'■ 2025년 개정 산업안전보건법 핵심 변경사항\n\n1. 건설공사 발주자 안전보건 조정자 선임 의무 강화\n   - 총공사금액 50억 원 이상 건설공사 해당\n   - 안전보건 조정자는 건설안전기사 이상 자격자\n\n2. 중대재해 처벌 기준 명확화\n   - 사망사고: 1년 이상 징역 또는 10억 원 이하 벌금\n   - 동일한 사고로 6개월 이상 치료 시: 3년 이하 징역\n\n3. 안전관리계획서 제출 대상 확대\n   - 기존: 총공사금액 5억 원 이상 → 변경: 2억 원 이상\n\n4. 위험성 평가 실시 주기 단축\n   - 기존: 연 1회 → 변경: 반기 1회 (6개월마다)\n\n5. 안전보건교육 시간 강화\n   - 신규 근로자: 8시간 → 16시간으로 확대'},
  {id:2, cat:'법령', important:true,  title:'중대재해처벌법 건설업 적용 기준 완전 정리', date:'2025.02.20',
    content:'■ 중대재해처벌법 건설업 적용 기준\n\n【적용 대상】\n- 상시 근로자 5인 이상 사업장\n- 건설공사 발주자 포함\n\n【중대산업재해 기준】\n① 사망자 1명 이상 발생\n② 동일 사고로 6개월 이상 치료 부상자 2명 이상\n③ 동일 유해요인으로 직업성 질병자 1년 이내 3명 이상\n\n【경영책임자 의무사항】\n1. 안전보건 관리체계 구축\n2. 재해 예방에 필요한 예산 편성\n3. 안전보건 관련 법령 의무 이행 확인\n4. 도급·용역·위탁 시 안전 관리 감독\n\n【처벌 기준】\n- 사망: 1년 이상 징역 / 10억 원 이하 벌금\n- 부상/질병: 7년 이하 징역 / 1억 원 이하 벌금'},
  {id:3, cat:'법령', important:false, title:'건설공사 안전관리 비용 산정 기준 (2025)', date:'2025.01.15',
    content:'■ 건설공사 안전관리비 산정 기준\n\n【안전관리비 계상 기준】\n총공사비 기준 일정 비율 계상 (건설산업기본법 시행규칙)\n\n구분            | 대상액 5억 미만 | 5억~50억 | 50억 이상\n건축공사       | 2.93%          | 1.86%    | 1.57%\n토목공사       | 3.09%          | 1.99%    | 1.68%\n중건설공사     | 3.43%          | 2.35%    | 1.89%\n\n【사용 가능 항목】\n① 안전관리자 인건비\n② 안전시설비\n③ 개인보호구 구입비\n④ 안전교육훈련비\n⑤ 안전진단비\n⑥ 본사 안전전담부서 운영비 (5% 이내)'},
  {id:4, cat:'법령', important:false, title:'유해위험방지계획서 제출 대상 및 절차', date:'2025.01.05',
    content:'■ 유해위험방지계획서 (유위계) 제출 기준\n\n【제출 대상 건설공사】\n① 지상 높이 31m 이상 건축물 건설공사\n② 연면적 3만㎡ 이상 건축물 건설공사\n③ 굴착 깊이 10m 이상 공사\n④ 교량, 터널 공사\n⑤ 다목적댐 건설공사\n\n【제출 절차】\n1. 착공 15일 전: 한국산업안전보건공단에 제출\n2. 심사 기간: 15일 이내\n3. 확인(심사): 서류심사 또는 현장심사\n4. 완공 전: 준공 확인서 제출\n\n【포함 내용】\n- 공사개요 및 공정표\n- 안전 시공 계획\n- 유해·위험 요인 및 안전대책\n- 안전점검 계획'},
  {id:5, cat:'법령', important:false, title:'안전관리자 선임 기준 및 업무 범위', date:'2024.12.10',
    content:'■ 건설현장 안전관리자 선임 기준\n\n【선임 기준 (공사규모별)】\n- 공사금액 120억 이상: 안전관리자 1명 이상\n- 공사금액 800억 이상: 전담 안전관리자 1명 이상\n- 공사금액 1,500억 이상: 전담 안전관리자 2명 이상\n\n【자격 기준】\n- 건설안전기사 이상\n- 건설안전산업기사 + 3년 경력\n- 토목·건축기사 이상 + 2년 경력\n\n【주요 업무】\n① 위험성 평가 참여\n② 안전교육 실시\n③ 보호구 착용 지도·감독\n④ 공사계획 안전성 검토\n⑤ 중대재해 발생 시 보고'},
  {id:6, cat:'사고사례', important:true,  title:'고소작업 중 추락사고 재발방지 대책', date:'2025.03.08',
    content:'■ 사고 개요\n- 발생장소: 신축 아파트 현장 15층 외벽 설비 배관 작업\n- 피해: 근로자 1명 사망\n\n■ 사고 원인\n① 직접 원인: 안전대 미착용\n② 간접 원인: 안전대 부착설비 미설치\n③ 관리적 원인: 작업 전 안전점검 미실시\n\n■ 유사 사고 통계 (2024년)\n- 추락사고: 전체 건설사망의 47% 차지\n- 사망사고 중 가장 높은 비율\n\n■ 재발방지 대책\n1. 안전대 부착설비(생명줄) 의무 설치\n2. 작업 전 안전대 체결 확인 절차 수립\n3. 개구부·단부 안전난간 설치 철저\n4. TBM 시 추락위험 포인트 집중 교육\n5. 현장소장 작업 전 안전점검 실시'},
  {id:7, cat:'사고사례', important:true,  title:'굴착공사 중 토사붕괴 사고 분석', date:'2025.02.14',
    content:'■ 사고 개요\n- 발생장소: 지하 주차장 굴착공사 현장\n- 굴착 깊이: 8.5m\n- 피해: 근로자 2명 매몰 (1명 사망, 1명 중상)\n\n■ 사고 원인\n① 흙막이 가시설 설계 미흡 (버팀보 간격 초과)\n② 지하수 유입으로 인한 지반 약화\n③ 작업 중 이상징후 발견 시 대피 미실시\n\n■ 전조증상 확인 방법\n- 흙막이벽 변위계 수치 급증\n- 배면 지표 침하 발생\n- 용수(지하수) 급격히 증가\n- 버팀보·띠장 변형 육안 확인\n\n■ 안전 대책\n1. 계측관리 계획 수립 및 일일 계측 실시\n2. 이상징후 발생 시 즉시 대피 기준 수립\n3. 강우 후 반드시 재점검 실시\n4. 굴착 단계별 안전성 검토'},
  {id:8, cat:'사고사례', important:false, title:'감전사고 패턴 분석 및 예방 가이드', date:'2025.01.28',
    content:'■ 건설현장 감전사고 현황 (2024)\n- 전체 건설사망 중 감전: 약 12%\n- 주요 발생 장소: 전기 작업 구역, 임시 배전반 주변\n\n■ 주요 감전 원인 유형\n① 충전부 직접 접촉 (40%)\n② 절연 불량 전기기기 사용 (28%)\n③ 임시배선 불량 (18%)\n④ 정전 미확인 상태 작업 (14%)\n\n■ 예방 조치\n1. GFCI(누전차단기) 의무 설치\n2. 임시 배선은 접지형 케이블 사용\n3. 충전부 방호커버 설치\n4. 작업 전 검전기로 정전 확인\n5. 400V 이상 작업 시 절연장갑·절연화 착용\n6. 우천 시 전기작업 금지'},
  {id:9, cat:'사고사례', important:false, title:'양중작업 중 낙하물 사고 사례', date:'2025.01.10',
    content:'■ 사고 개요\n- 발생장소: 자재 양중 작업 중 인양줄 파단\n- 피해: 자재 낙하로 하부 근로자 중상\n\n■ 원인 분석\n① 인양줄 (와이어로프) 노후·손상 확인 미실시\n② 줄걸이 작업자 자격 미확인\n③ 하부 통제구역 미설정\n\n■ 점검 기준 (와이어로프)\n- 소선 10% 이상 파단 시 교체\n- 직경 감소 7% 초과 시 교체\n- 심하게 변형·부식된 것 즉시 폐기\n\n■ 안전 수칙\n1. 줄걸이 자격자만 작업 가능\n2. 신호수 배치 의무화\n3. 하부 작업금지 구역 설정 (반경 = 높이 × 1.5)\n4. 인양 전 자재 고박 상태 확인\n5. 강풍(10m/s 이상) 시 양중 작업 중지'},
  {id:10, cat:'사고사례', important:false, title:'밀폐공간 질식사고 재발방지 대책', date:'2024.12.20',
    content:'■ 밀폐공간 정의\n산소 농도 18% 미만 또는 유해가스 농도 기준치 이상인 장소\n(지하 맨홀, 탱크 내부, 오폐수 처리시설 등)\n\n■ 질식사고 발생 메커니즘\n1. 유해가스 (H₂S, CO, CH₄) 또는 산소 결핍 발생\n2. 최초 작업자 의식 잃음\n3. 구조하러 들어간 동료도 동일 피해 → 다수 사상\n\n■ 반드시 지켜야 할 5대 수칙\n① 작업 전 산소농도·유해가스 측정 (산소: 18~23.5%)\n② 환기 실시 (작업 중에도 지속 환기)\n③ 공기호흡기 또는 송기마스크 착용\n④ 감시인 배치 (밀폐공간 밖에서 상시 대기)\n⑤ 구조 장비 (구명줄, 공기호흡기) 사전 준비'},
  {id:11, cat:'체크리스트', important:false, title:'설비공사 현장 일일 안전점검 체크리스트', date:'2025.03.05',
    content:'■ 설비공사 현장 일일 안전점검표\n\n【개인보호구】\n□ 안전모 착용 (KS 규격 인증품)\n□ 안전화 착용\n□ 안전대 착용 및 체결 상태 (고소작업 시)\n□ 방진마스크 착용 (분진 발생 작업)\n□ 절연장갑 착용 (전기 작업 시)\n\n【작업환경】\n□ 작업구역 안전표지 설치\n□ 개구부 덮개 또는 안전난간 설치\n□ 통로 확보 (폭 60cm 이상)\n□ 조명 기준 이상 (작업면 150lx 이상)\n\n【기계·기구】\n□ 전동공구 절연 상태 이상 없음\n□ 사다리 고정 상태 (상단 3단 이상 돌출)\n□ 고소작업대 작동 상태 이상 없음\n\n【배관·가스】\n□ 가스 배관 연결부 누설 여부 (비눗물 테스트)\n□ 화기 작업 허가서 발급 여부\n□ 소화기 비치 위치 확인\n\n【기타】\n□ 작업 전 TBM 실시 여부\n□ 신호수 배치 (양중 작업 시)\n□ 기상 조건 확인 (강풍·강우 시 중지 기준)'},
  {id:12, cat:'체크리스트', important:false, title:'전기공사 안전점검 체크리스트', date:'2025.02.25',
    content:'■ 전기공사 안전점검표\n\n【임시 전력 설비】\n□ 임시 분전반 설치 상태 (잠금장치 유무)\n□ 누전차단기 (30mA, 0.03초) 설치 및 작동 확인\n□ 접지선 연결 상태\n□ 케이블 피복 손상 여부\n□ 전선 통로 확보 (작업자 보행 방해 없음)\n\n【전기 작업】\n□ 정전 작업 시 잠금·태그아웃 (LOTO) 실시\n□ 검전기로 충전 유무 확인\n□ 절연 보호구 착용 상태\n□ 활선 작업 금지 여부 확인\n\n【배선·배관】\n□ 전선관 접합부 실링 상태\n□ 케이블 트레이 하중 초과 여부\n□ 방화 구획 관통부 내화충전재 시공 여부\n\n【안전표지】\n□ 고압 위험 표지 부착\n□ 작업 중 전원 투입 금지 표지\n□ 전기 담당자 연락처 게시'},
  {id:13, cat:'체크리스트', important:false, title:'고소작업 작업 전 안전점검표', date:'2025.02.10',
    content:'■ 고소작업 (2m 이상) 작업 전 점검표\n\n【법적 요건 확인】\n□ 고소작업 허가서 발급 여부\n□ 안전관리자 또는 관리감독자 작업 승인\n□ 동일 작업 장소 하부 출입 통제\n\n【안전대】\n□ 안전대 외형 손상 없음\n□ 버클·D링 체결 상태 이상 없음\n□ 랜야드 (죔줄) 충격흡수장치 작동 상태\n□ 안전대 걸이설비 (수평구명줄) 설치 상태\n□ 걸이 위치 확인 (작업 위치보다 높은 곳에 체결)\n\n【고소작업대 (시저리프트, 붐리프트)】\n□ 아웃트리거 전개 및 수평 상태\n□ 작업 전 하중 초과 없음 (최대 적재하중 확인)\n□ 낙하물 방지망 설치\n□ 비상 하강 장치 작동 여부\n\n【비계 (발판)】\n□ 발판 폭 40cm 이상\n□ 비계 결속 상태 이상 없음\n□ 비계 상부 안전난간 높이 90cm 이상\n□ 발끝막이판 설치 (10cm 이상)'},
  {id:14, cat:'체크리스트', important:false, title:'화재예방 일일 점검 체크리스트', date:'2025.01.20',
    content:'■ 건설현장 화재예방 일일 점검표\n\n【화기 작업 (용접·절단·가스)】\n□ 화기작업허가서 발급 및 게시\n□ 작업 반경 5m 이내 가연성 물질 제거\n□ 소화기 2개 이상 인접 배치\n□ 화재감시인 배치\n□ 용접 불티 비산방지망 설치\n□ 작업 종료 후 30분 이상 확인 감시\n\n【가스 설비】\n□ 가스용기 넘어짐 방지 (고정 체인)\n□ 가스 호스 손상 여부 (비눗물 테스트)\n□ 가스 누설 경보기 작동 상태\n□ 역화방지기 설치 여부 (토치 연결부)\n\n【일반 화재예방】\n□ 소화기 비치 위치 및 유효기간 확인\n□ 비상구 및 피난 통로 확보 (장애물 없음)\n□ 전열기구 및 발열체 주변 가연물 제거\n□ 임시 숙소·사무소 연기감지기 작동 확인'},
  {id:15, cat:'체크리스트', important:false, title:'굴착공사 안전점검 체크리스트', date:'2024.12.15',
    content:'■ 굴착공사 일일 안전점검표\n\n【굴착 작업 전】\n□ 지하 매설물 조사 완료 (도면 확인 + 탐지)\n□ 굴착 면적 및 깊이 계획 확인\n□ 흙막이 설계도서 현장 비치\n□ 작업구역 안전 로프 및 표지 설치\n\n【굴착 작업 중】\n□ 굴착면 경사 기준 준수 (자연사면: 1:1.5 이상)\n□ 버팀보 설치 상태 (간격, 고정 상태)\n□ 계측기 수치 확인 (변위 허용치 이내)\n□ 지하수 유입 여부 및 배수 상태\n□ 차량·장비 이동 시 신호수 배치\n\n【강우 후 반드시 점검】\n□ 굴착면 토사 유실 여부\n□ 흙막이벽 변형·균열 발생 여부\n□ 지표 침하 여부\n□ 토류판 배면 공동 발생 여부\n\n【대피 기준】\n- 계측값 관리기준치 초과 시 즉시 대피\n- 이상 징후 확인 시 감리원·안전관리자 즉시 보고'},
  {id:16, cat:'안전교육', important:false, title:'신규 입사자 건설안전 기초교육 자료', date:'2025.03.01',
    content:'■ 신규 근로자 안전교육 (16시간)\n\n【1일차 - 현장 기초 (8시간)】\n① 사업장 안전보건관리체계 이해 (2H)\n  - 현장 조직도 및 안전관리자 소개\n  - 비상연락망 및 대피 경로\n\n② 개인보호구 착용법 (2H)\n  - 안전모: 하악끈 조절, 내피 착용\n  - 안전화: 발볼 여유 1cm 기준\n  - 안전대: 버클 체결 2회 확인\n\n③ 주요 위험요인 교육 (2H)\n  - 추락, 낙하, 감전, 충돌, 협착\n\n④ 현장 시설 견학 (2H)\n  - 위험구역, 대피소, 구급함 위치\n\n【2일차 - 직종별 안전 (8시간)】\n⑤ 직종별 작업안전 교육 (4H)\n⑥ 실습 및 테스트 (2H)\n⑦ 근로복지 및 산재보상 안내 (1H)\n⑧ 평가 및 수료 (1H)\n\n※ 교육 미이수 시 작업 투입 불가'},
  {id:17, cat:'안전교육', important:false, title:'관리감독자 안전보건 교육 자료', date:'2025.02.15',
    content:'■ 관리감독자 안전보건 교육 (연 16시간)\n\n【법적 의무】\n산업안전보건법 제32조에 따라 관리감독자는\n연간 16시간 이상 안전보건 교육 이수 의무\n\n【교육 내용】\n1. 작업공정 유해·위험요인 파악 방법\n2. 위험성 평가 참여 방법\n3. 보호구 관리 및 지도 요령\n4. 안전점검 방법 및 체크리스트 활용\n5. 이상 발생 시 보고 체계\n6. 산업재해 원인 분석 방법\n\n【관리감독자 주요 임무】\n① 매일 작업 시작 전 TBM 실시\n② 작업자 건강 상태 확인\n③ 불안전 행동 즉시 시정\n④ 신규 작업자 작업 전 교육 실시\n⑤ 아차사고 발생 시 보고 및 재발방지 수립'},
  {id:18, cat:'안전교육', important:false, title:'특별안전교육 대상 작업 및 교육 내용', date:'2025.01.25',
    content:'■ 특별안전교육 대상 작업 (2시간 이상)\n\n산업안전보건법 시행규칙 별표5 기준\n\n【건설업 주요 특별교육 대상 작업】\n\n① 고소작업대 (차량탑재형·시저·붐) 조작\n   - 장비 조작 방법, 아웃트리거 설치, 추락 방지\n\n② 타워크레인 신호·줄걸이\n   - 수신호·무선호출 방법, 와이어 점검, 위험반경\n\n③ 굴착기·불도저 등 건설장비 조작\n   - 전도방지, 접촉사고 예방, 신호수 협업\n\n④ 화기 취급 (용접·용단)\n   - 불티비산 방지, 화재감시, 역화방지\n\n⑤ 밀폐공간 작업\n   - 산소 측정, 환기, 구조 장비 사용\n\n⑥ 잠함 공법 (케이슨)\n   - 기압, 감압병 예방, 비상탈출\n\n※ 특별교육 미이수자는 해당 작업 금지'},
  {id:19, cat:'안전교육', important:false, title:'개인보호구 올바른 착용법 교육 자료', date:'2025.01.05',
    content:'■ 개인보호구 올바른 착용법\n\n【안전모】\n✓ 머리띠를 머리 크기에 맞게 조절\n✓ 하악끈은 손가락 2개 들어갈 여유로 조임\n✓ 챙은 정면을 향해 착용 (뒤집어 쓰기 금지)\n✗ 안전모 위에 헬멧 등 다른 모자 착용 금지\n✗ 내부에 스티로폼·천 등 삽입 금지\n\n【안전화】\n✓ 발볼·발길이에 맞는 규격 선택\n✓ 발가락 부분 여유 1cm 확인\n✓ 끈은 발목까지 단단히 묶음\n\n【안전대 (추락방지대)】\n✓ 착용 전 외관 이상 확인 (찢김, 변색, 마모)\n✓ 어깨·허리 버클 체결 후 당겨서 확인\n✓ 랜야드는 가슴 높이 이상 걸이에 체결\n✓ 작업 전 체결 여부 동료에게 확인\n\n【방진마스크】\n✓ 안면부가 얼굴에 밀착되도록 조절\n✓ 밀착 확인: 두 손으로 막고 숨 쉬어 확인\n✓ 규격: 1급 (0.6㎛), 2급 (1㎛ 입자 차단)'},
  {id:20, cat:'안전교육', important:false, title:'근골격계 질환 예방 교육 자료', date:'2024.12.05',
    content:'■ 건설현장 근골격계 질환 예방\n\n【근골격계 질환이란?】\n반복적 동작, 부적절한 자세, 무리한 힘으로 인해\n근육·신경·혈관 등에 발생하는 질환\n(요통, 수근관 증후군, 어깨 충돌 증후군 등)\n\n【건설현장 주요 위험 작업】\n① 중량물 운반 (자재, 파이프 등)\n② 쪼그려 앉아 하는 배관 작업\n③ 팔 들어 올려 하는 천장 작업\n④ 반복 타격 (드릴링, 해머 작업)\n\n【예방법】\n1. 중량물 운반\n   - 허리 구부리지 않고 무릎 굽혀 들기\n   - 25kg 이상: 2인 작업 또는 보조기구 사용\n2. 충분한 스트레칭 (작업 전·중·후)\n3. 작업 자세 개선: 발판 사용, 보조 도구 활용\n4. 무거운 공구 지지대 사용\n5. 1시간 작업 후 10분 휴식'},
  {id:21, cat:'TBM', important:false, title:'월별 TBM 시나리오 — 1월 (동절기 안전)', date:'2025.01.02',
    content:'■ 1월 TBM 시나리오 (동절기 안전)\n소요시간: 약 10분\n\n【도입 (1분)】\n"오늘은 동절기 현장 안전에 대해 이야기하겠습니다.\n특히 한파와 결빙 조건에서의 위험요소를 함께 확인합니다."\n\n【위험요인 설명 (4분)】\n① 결빙으로 인한 미끄러짐·전도\n   - 경사로, 계단, 발판 결빙 여부 확인\n   - 방한화 또는 아이젠 착용\n\n② 한파로 인한 근로자 건강 위험\n   - 저체온증: 떨림, 무기력감 → 즉시 온열 조치\n   - 동상: 손·발·귀 감각 저하 → 보온 의복 착용\n\n③ 온열 기구 사용 시 화재 위험\n   - 가스히터·전열기 주변 가연물 제거\n   - 자리 비울 때 반드시 끄기\n\n【대책 공유 (3분)】\n- 작업 전 통로 결빙 제거 (모래·염화칼슘)\n- 보온 음료 및 간식 제공 확인\n- 혹한 시 2시간 단위로 충분한 휴식\n\n【마무리 (2분)】\n"오늘 작업 중 불안전한 상황 발견 시 즉시 보고해주세요. 모두 안전하게 마칩시다!"'},
  {id:22, cat:'TBM', important:false, title:'월별 TBM 시나리오 — 2월 (해빙기 지반)', date:'2025.02.03',
    content:'■ 2월 TBM 시나리오 (해빙기 지반 안전)\n소요시간: 약 10분\n\n【도입 (1분)】\n"2월은 낮 동안 기온 상승으로 동결된 지반이 녹는 시기입니다.\n해빙기 지반 약화로 인한 사고 위험이 높습니다."\n\n【위험요인 (4분)】\n① 지반 및 사면 안전성 저하\n   - 동결·해빙 반복으로 지반 내부 공동 발생\n   - 옹벽·토류벽 뒤채움 침하 가능성\n\n② 굴착면 토사 붕괴\n   - 해빙 후 굴착면 경사 안전성 재확인 필수\n   - 표면 유수 침투로 인한 급격한 붕괴 가능\n\n③ 시설물 기초 침하\n   - 가설 구조물 (비계, 갱폼) 기초 침하 확인\n\n【점검 포인트 (3분)】\n□ 아침 출근 후 굴착면 육안 점검 실시\n□ 비계 기초판·잭베이스 침하 여부\n□ 배수로 막힘 여부 확인\n□ 지반 균열·침하 발생 시 즉시 보고\n\n【마무리 (2분)】\n"이상 발견 시 혼자 판단하지 말고 반드시 관리자에게 보고하세요."'},
  {id:23, cat:'TBM', important:false, title:'월별 TBM 시나리오 — 3월 (봄철 황사·화재)', date:'2025.03.03',
    content:'■ 3월 TBM 시나리오 (황사 및 화재 예방)\n소요시간: 약 10분\n\n【도입 (1분)】\n"봄철은 황사와 건조한 날씨로 인한 화재 위험이 높은 시기입니다."\n\n【황사 대책 (3분)】\n① 황사 발령 시 행동 기준\n   - 나쁨 이상: 야외 작업 최소화, 방진마스크 착용\n   - 매우 나쁨: 야외 작업 중단 검토\n\n② 적합한 마스크\n   - KF80 이상 (황사용) 착용\n   - 면 마스크는 황사 차단 효과 없음\n\n【화재 예방 (4분)】\n① 봄철 건조주의보 기간 화기 관리 강화\n   - 화기작업 허가제 철저히 준수\n   - 소화기 추가 배치\n\n② 쓰레기·폐자재 야적 금지\n   - 건조 바람에 의한 화재 확산 방지\n\n③ 소방차 진입로 확보\n\n【마무리 (2분)】\n"황사 특보 발령 시 현장 관리자 지시에 따라 신속히 행동하세요."'},
  {id:24, cat:'TBM', important:false, title:'고소작업 TBM 5분 시나리오', date:'2025.02.20',
    content:'■ 고소작업 전용 TBM 시나리오 (5분)\n\n【오늘의 위험작업 확인 (1분)】\n"오늘 ○○층 외벽 (또는 천장) 배관·덕트 작업이 예정되어 있습니다.\n작업 높이는 ○○m 입니다."\n\n【핵심 안전 포인트 3가지 (3분)】\n\n① 안전대 반드시 착용·체결\n"작업 전 버클 체결 후 당겨서 확인. 반드시 걸이설비에 체결 후 이동하세요."\n\n② 발판·비계 상태 확인\n"흔들리거나 파손된 발판 발견 즉시 교체 요청. 절대 무리하게 올라가지 마세요."\n\n③ 상부·하부 동시 작업 금지\n"직상하에서 다른 팀 작업 시 조율 후 시작. 낙하물 위험 구역은 로프 통제."\n\n【확인 질문 (1분)】\n"안전대 걸이는 어디에 체결할 예정입니까?"\n"작업 중 이상 발견 시 어떻게 합니까?" → 즉시 중단 후 보고\n\n"모두 안전 확인 되었습니까? 그럼 작업 시작하겠습니다."'},
  {id:25, cat:'TBM', important:false, title:'화기작업 TBM 5분 시나리오', date:'2025.02.10',
    content:'■ 화기작업 전용 TBM 시나리오 (5분)\n\n【오늘의 화기 작업 확인 (1분)】\n"오늘 ○층 ○○구역에서 용접(또는 가스절단) 작업이 있습니다.\n화기작업허가서 발급 확인하셨습니까?"\n\n【핵심 안전 포인트 (3분)】\n\n① 화재감시인 배치 확인\n"○○ 씨가 화재감시인으로 배치됩니다.\n작업 중 자리를 절대 이탈하지 마세요. 작업 종료 후 30분 감시."\n\n② 작업 반경 5m 가연물 제거\n"주변 우레탄폼, 단열재, 폐자재 사전 제거 확인. 불티 비산방지포 설치."\n\n③ 소화기 2개 이상 인접 배치\n"충압 상태 확인. 위치는 작업자가 즉시 접근 가능한 1~2m 이내."\n\n④ 역화방지기 설치 확인\n"토치 연결부에 역화방지기 반드시 설치."\n\n【마무리 (1분)】\n"이상 없으면 작업 시작. 연기·불꽃 이상 발생 즉시 작업 중단 후 보고."'},
];

var _safetyTabActive = 'all';
var _safetySearchQ = '';

function renderSafety(){
  const el = document.getElementById('safetyList'); if(!el) return;

  const stats = {
    total: SAFETY.length,
    important: SAFETY.filter(s=>s.important).length,
    checklist: SAFETY.filter(s=>s.cat==='체크리스트').length,
    edu: SAFETY.filter(s=>s.cat==='안전교육').length,
  };

  const catCounts = {};
  Object.keys(SAFETY_CAT).forEach(k=>{ catCounts[k] = k==='all' ? SAFETY.length : SAFETY.filter(s=>s.cat===k).length; });

  const filtered = SAFETY.filter(s => {
    const catMatch = _safetyTabActive==='all' || s.cat===_safetyTabActive;
    const qMatch   = !_safetySearchQ || s.title.includes(_safetySearchQ) || s.content.includes(_safetySearchQ);
    return catMatch && qMatch;
  }).sort((a,b)=> (b.important - a.important) || (b.id - a.id));

  const statsHtml = `
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px">
      <div style="background:var(--dark);border-radius:10px;padding:18px 20px;position:relative;overflow:hidden">
        <div style="position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:32px;opacity:.15">📋</div>
        <div style="font-size:10px;color:#9C9A92;margin-bottom:6px;letter-spacing:1px;text-transform:uppercase">전체 자료</div>
        <div style="font-size:30px;font-weight:700;color:#E8500A;line-height:1">${stats.total}<span style="font-size:13px;font-weight:400;margin-left:3px;color:#9C9A92">건</span></div>
      </div>
      <div style="background:#FDEEEE;border-radius:10px;padding:18px 20px;position:relative;overflow:hidden;border-left:4px solid #C03030">
        <div style="position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:32px;opacity:.15">⚠️</div>
        <div style="font-size:10px;color:#8B2020;margin-bottom:6px;letter-spacing:1px;text-transform:uppercase">중요 공지</div>
        <div style="font-size:30px;font-weight:700;color:#C03030;line-height:1">${stats.important}<span style="font-size:13px;font-weight:400;margin-left:3px;color:#C08080">건</span></div>
      </div>
      <div style="background:#E8F5EE;border-radius:10px;padding:18px 20px;position:relative;overflow:hidden;border-left:4px solid #1A6B3A">
        <div style="position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:32px;opacity:.15">✅</div>
        <div style="font-size:10px;color:#1A6B3A;margin-bottom:6px;letter-spacing:1px;text-transform:uppercase">체크리스트</div>
        <div style="font-size:30px;font-weight:700;color:#1A6B3A;line-height:1">${stats.checklist}<span style="font-size:13px;font-weight:400;margin-left:3px;color:#80A880">건</span></div>
      </div>
      <div style="background:#E8F0FB;border-radius:10px;padding:18px 20px;position:relative;overflow:hidden;border-left:4px solid #1A4080">
        <div style="position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:32px;opacity:.15">📚</div>
        <div style="font-size:10px;color:#1A4080;margin-bottom:6px;letter-spacing:1px;text-transform:uppercase">교육자료</div>
        <div style="font-size:30px;font-weight:700;color:#1A4080;line-height:1">${stats.edu}<span style="font-size:13px;font-weight:400;margin-left:3px;color:#80A0C0">건</span></div>
      </div>
    </div>`;

  const tabsHtml = `
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:18px">
      ${Object.entries(SAFETY_CAT).map(([k,v])=>`
        <button onclick="_safetyTabActive='${k}';renderSafety()" style="padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid ${_safetyTabActive===k?v.color:'var(--border)'};background:${_safetyTabActive===k?v.color:'var(--white)'};color:${_safetyTabActive===k?'#fff':v.color};font-family:'Noto Sans KR',sans-serif;transition:all .15s;white-space:nowrap">
          ${v.icon} ${v.label}${k!=='all'?' ('+catCounts[k]+')':''}
        </button>`).join('')}
    </div>`;

  const searchHtml = `
    <div style="margin-bottom:20px;position:relative">
      <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-light);font-size:14px">🔍</span>
      <input type="text" id="safetySearchInput" value="${_safetySearchQ.replace(/"/g,'&quot;')}" placeholder="제목·내용 검색..." oninput="_safetySearchQ=this.value;renderSafety()"
        style="width:100%;padding:10px 16px 10px 38px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;transition:border-color .15s;background:var(--white)"
        onfocus="this.style.borderColor='var(--orange)'" onblur="this.style.borderColor='var(--border)'">
    </div>`;

  const cardsHtml = filtered.length ? filtered.map(s => {
    const cc = SAFETY_CAT[s.cat] || SAFETY_CAT['all'];
    return `
      <div onclick="openSafetyDetail(${s.id})" style="background:var(--white);border:1px solid ${s.important?'#FFBBBB':'var(--border)'};border-left:4px solid ${cc.color};border-radius:8px;padding:18px 22px;cursor:pointer;transition:all .2s;margin-bottom:10px" onmouseover="this.style.boxShadow='0 6px 24px rgba(0,0,0,.1)';this.style.transform='translateY(-2px)'" onmouseout="this.style.boxShadow='';this.style.transform=''">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:8px">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="background:${cc.bg};color:${cc.color};font-size:11px;padding:3px 10px;border-radius:20px;font-weight:700">${cc.icon} ${s.cat}</span>
            ${s.important?'<span style="background:#FF4444;color:#fff;font-size:10px;padding:2px 8px;border-radius:20px;font-weight:700">🚨 중요</span>':''}
          </div>
          <span style="font-size:11px;color:var(--text-light)">${s.date}</span>
        </div>
        <div style="font-size:15px;font-weight:600;color:var(--text);line-height:1.5">${s.title}</div>
        <div style="margin-top:8px;font-size:12px;color:var(--text-light);display:flex;align-items:center;gap:4px">자세히 보기 →</div>
      </div>`;
  }).join('') : `
    <div style="text-align:center;padding:80px 40px;color:var(--text-light)">
      <div style="font-size:48px;margin-bottom:16px;opacity:.4">🔍</div>
      <p style="font-size:15px;font-weight:600;margin-bottom:6px">검색 결과가 없습니다</p>
      <p style="font-size:13px">다른 키워드로 검색해보세요</p>
    </div>`;

  el.innerHTML = statsHtml + tabsHtml + searchHtml + cardsHtml;
  if(document.getElementById('safetySearchInput')) document.getElementById('safetySearchInput').focus();
}

function openSafetyDetail(id){
  const s = SAFETY.find(s=>s.id===id); if(!s) return;
  const cc = SAFETY_CAT[s.cat] || SAFETY_CAT['all'];
  document.getElementById('noticeDetailContent').innerHTML=`
    <div style="background:var(--white);border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
      <div style="background:var(--dark);padding:24px 32px;border-left:6px solid ${cc.color}">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <span style="background:${cc.bg};color:${cc.color};font-size:11px;padding:3px 12px;border-radius:20px;font-weight:700">${cc.icon} ${s.cat}</span>
          ${s.important?'<span style="background:#FF4444;color:#fff;font-size:10px;padding:3px 10px;border-radius:20px;font-weight:700">🚨 중요</span>':''}
          <span style="font-size:12px;color:#6A6860;margin-left:auto">${s.date}</span>
        </div>
        <h2 style="font-size:20px;font-weight:700;color:#fff;line-height:1.4">${s.title}</h2>
      </div>
      <div style="padding:32px;font-size:14px;color:var(--text-mid);line-height:2;white-space:pre-line;border-bottom:1px solid var(--border)">${s.content}</div>
      <div style="padding:20px 32px;background:#FAFAF8;display:flex;gap:10px">
        <button onclick="showPage('safety')" style="padding:10px 20px;background:var(--dark);color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Noto Sans KR',sans-serif;transition:background .15s" onmouseover="this.style.background='var(--orange)'" onmouseout="this.style.background='var(--dark)'">← 목록으로</button>
        <button onclick="var t=document.createElement('textarea');t.value=document.querySelector('#noticeDetailContent .content-text')?document.querySelector('#noticeDetailContent .content-text').innerText:'${s.title}';document.body.appendChild(t);t.select();document.execCommand('copy');document.body.removeChild(t);alert('내용이 클립보드에 복사되었습니다.')" style="padding:10px 20px;background:transparent;color:var(--text-mid);border:1px solid var(--border);border-radius:6px;font-size:13px;cursor:pointer;font-family:'Noto Sans KR',sans-serif">📋 내용 복사</button>
      </div>
    </div>`;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-notice-detail').classList.add('active');
  window.scrollTo(0,0);
}

/* ── 발주확정 → 전 페이지 PDF 저장 ── */
function submitOrder() {
  const allPages = orderPages.filter(p=>p.items.length>0);
  if(!allPages.length){ alert('발주 목록이 비어있습니다.'); return; }
  const today = new Date();
  const dateStr = today.toLocaleDateString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'});

  // 같은 페이지 내 같은 자재명+규격에서 m/본 단위 통합
  function mergeItems(items) {
    const merged = [];
    items.forEach(function(item) {
      if (!item.unitConv) {
        merged.push(Object.assign({}, item));
        return;
      }
      const key = item.name + '||' + item.spec;
      const exist = merged.find(function(m){ return m._key===key && m.unitConv; });

      // 이 item의 m값, 본값 계산
      var itemM   = item.unit===item.unitConv.from ? item.qty : item.qty * item.unitConv.rate;
      var itemBon = item.unit===item.unitConv.from ? Math.ceil(item.qty / item.unitConv.rate) : item.qty;

      if (exist) {
        var totalM   = exist._totalM + itemM;
        var totalBon = Math.ceil(totalM / exist.unitConv.rate);
        exist._totalM   = totalM;
        exist._totalBon = totalBon;
        exist.qty       = totalM;
        exist.unit      = exist.unitConv.from;
        exist.mQty      = totalM;
        exist.bonQty    = totalBon;
        exist._merged   = true;
      } else {
        var copy = Object.assign({}, item, {
          _key:     key,
          _totalM:   itemM,
          _totalBon: itemBon,
          _bonUnit:  item.unitConv.to,
          _rate:     item.unitConv.rate
        });
        merged.push(copy);
      }
    });
    return merged;
  }

  const pageHtmlList = allPages.map(function(page,pi){
    const items = mergeItems(page.items);
    var pageTotalBon=0, pageBonUnit='본', pageOtherQty=0;
    items.forEach(function(it){
      if(it._totalBon!==undefined){
        pageTotalBon += it._totalBon;
        if(it._bonUnit) pageBonUnit = it._bonUnit;
      } else { pageOtherQty += it.qty; }
    });

    const rows = items.map(function(item,i){
      var mTd='', bonTd='';
      var pad='padding:10px 14px';
      var baseStyle=pad+';text-align:center;font-size:13px;';

      if(!item.unitConv||item._totalM===undefined){
        // 환산 없는 자재 - m칸에 colspan으로 수량+단위
        mTd='<td colspan="2" style="'+pad+';text-align:center;font-size:13px;font-weight:700;border:1px solid #e8e8e8">'
          +item.qty.toLocaleString()+'<span style="font-size:11px;color:#888;margin-left:3px">'+(item.unit||'개')+'</span></td>';
        bonTd='';
      } else if(item._merged){
        mTd='<td style="'+baseStyle+'font-weight:900;color:#1A6B3A;background:#F2FAF5;border:1px solid #e8e8e8">'
          +item._totalM+'<span style="font-size:11px;margin-left:2px">m</span>'
          +'<span style="display:block;font-size:10px;color:#E8500A;font-weight:700;margin-top:1px">통합</span></td>';
        bonTd='<td style="'+baseStyle+'font-weight:900;color:#1A5080;background:#F0F5FB;border:1px solid #e8e8e8">'
          +item._totalBon+'<span style="font-size:11px;margin-left:2px">'+item._bonUnit+'</span>'
          +'<span style="display:block;font-size:10px;color:#E8500A;font-weight:700;margin-top:1px">통합</span></td>';
      } else if(item.unit===item.unitConv.from){
        // m 입력: m칸=굵게(입력값), 본칸=연하게(환산값)
        mTd='<td style="'+baseStyle+'font-weight:900;color:#1A1A18;border:1px solid #e8e8e8">'
          +item.qty.toLocaleString()+'<span style="font-size:11px;color:#666;margin-left:2px">m</span></td>';
        bonTd='<td style="'+baseStyle+'font-weight:500;color:#1A5080;background:#F0F5FB;border:1px solid #e8e8e8">'
          +item._totalBon+'<span style="font-size:11px;margin-left:2px">'+item._bonUnit+'</span></td>';
      } else {
        // 본 입력: m칸=연하게(환산값), 본칸=굵게(입력값)
        mTd='<td style="'+baseStyle+'font-weight:500;color:#1A6B3A;background:#F2FAF5;border:1px solid #e8e8e8">'
          +item._totalM+'<span style="font-size:11px;margin-left:2px">m</span></td>';
        bonTd='<td style="'+baseStyle+'font-weight:900;color:#1A1A18;border:1px solid #e8e8e8">'
          +item.qty.toLocaleString()+'<span style="font-size:11px;color:#666;margin-left:2px">'+item.unit+'</span></td>';
      }

      return '<tr style="border-bottom:1px solid #eee;'+(item._merged?'background:#FFFDF5':'')+'">'+
        '<td style="padding:10px 12px;text-align:center;color:#999;font-size:12px;border:1px solid #e8e8e8">'+(i+1)+'</td>'+
        '<td style="padding:10px 14px;font-size:13px;font-weight:600;border:1px solid #e8e8e8">'+item.name+'</td>'+
        '<td style="padding:10px 12px;font-size:13px;color:#666;text-align:center;border:1px solid #e8e8e8">'+(item.spec||'—')+'</td>'+
        mTd+bonTd+
        '<td style="padding:10px 12px;font-size:12px;color:#999;border:1px solid #e8e8e8">'+(item.memo||'')+'</td>'+
        '</tr>';
    }).join('');

    // 합계: 본/롤 단위
    var footerTd = pageTotalBon
      ? '<td style="padding:11px 14px;font-size:15px;font-weight:900;text-align:center;color:#888;background:#F5F3EF;border:1px solid #e8e8e8"></td>'
        +'<td style="padding:11px 14px;font-size:15px;font-weight:900;text-align:center;color:#1A5080;background:#F0F5FB;border:1px solid #e8e8e8">'+pageTotalBon+'<span style="font-size:12px;font-weight:400;margin-left:2px">'+pageBonUnit+'</span></td>'
      : '<td colspan="2" style="padding:11px 14px;font-size:13px;color:#666;text-align:center;border:1px solid #e8e8e8">'+pageOtherQty+'개</td>';

    const memoHtml = page.memo
      ? '<div style="margin-bottom:16px;padding:10px 14px;background:#FFFAF7;border-left:3px solid var(--orange,#E8500A);border-radius:0 4px 4px 0;font-size:12px;color:#5C5A54;line-height:1.6"><strong>메모:</strong> '+page.memo+'</div>'
      : '';

    return '<div style="padding:48px 52px 40px 52px;font-family:\'Noto Sans KR\',sans-serif;'+(pi>0?'page-break-before:always':'')+'">'+
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;border-bottom:3px solid #1A1A18;padding-bottom:16px;margin-bottom:20px">'+
        '<div style="padding-top:6px"><div style="font-size:22px;font-weight:900;letter-spacing:-0.5px">설비트리거</div>'+
        '<div style="font-size:10px;color:#888;letter-spacing:2px;margin-top:2px">MECHANICAL TRIGGER</div></div>'+
        '<div style="text-align:right"><div style="font-size:18px;font-weight:700">발 주 서</div>'+
        '<div style="font-size:12px;color:#666;margin-top:4px">발행일: '+dateStr+'</div>'+
        '<div style="font-size:12px;color:#666">'+page.name+' ('+(pi+1)+'/'+allPages.length+')</div></div>'+
      '</div>'+
      memoHtml+
      '<table style="width:100%;border-collapse:collapse;margin-bottom:20px">'+
        '<thead><tr style="background:#1A1A18;color:#fff">'+
          '<th style="padding:10px 12px;font-size:12px;text-align:center;width:38px">No.</th>'+
          '<th style="padding:10px 14px;font-size:12px;text-align:left">자재명</th>'+
          '<th style="padding:10px 12px;font-size:12px;text-align:center;width:62px">규격</th>'+
          '<th style="padding:10px 14px;font-size:12px;text-align:center;width:95px;color:#A8D8A8">m 수량</th>'+
          '<th style="padding:10px 14px;font-size:12px;text-align:center;width:95px;color:#A8C4E8">본/롤 수량</th>'+
          '<th style="padding:10px 12px;font-size:12px;text-align:left">메모</th>'+
        '</tr></thead>'+
        '<tbody>'+rows+'</tbody>'+
        '<tfoot><tr style="background:#F5F3EF;border-top:2px solid #1A1A18">'+
          '<td colspan="3" style="padding:11px 14px;font-size:13px;font-weight:700;text-align:right;border:1px solid #e8e8e8">합계 ('+items.length+'품목)</td>'+
          footerTd+
          '<td style="background:#F5F3EF;border:1px solid #e8e8e8"></td>'+
        '</tr></tfoot>'+
      '</table>'+
    '</div>';
  });

  const win = window.open('','_blank');
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;900&display=swap" rel="stylesheet">
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Noto Sans KR',sans-serif;background:#fff;color:#1A1A18}
      @media print{
        body{margin:0}
        @page{margin:0;size:A4}
        .no-print{display:none}
      }
    </style>
  </head><body>
    <div class="no-print" style="position:fixed;top:0;left:0;right:0;background:#1A1A18;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;z-index:999">
      <span style="color:#fff;font-size:13px">발주서 PDF 저장 — ${allPages.length}페이지</span>
      <div style="display:flex;gap:10px">
        <button onclick="window.print()" style="padding:8px 20px;background:#E8500A;color:#fff;border:none;border-radius:4px;font-size:13px;font-weight:700;cursor:pointer">🖨 PDF 저장 / 인쇄</button>
        <button onclick="window.close()" style="padding:8px 14px;background:transparent;color:#aaa;border:1px solid #555;border-radius:4px;font-size:13px;cursor:pointer">닫기</button>
      </div>
    </div>
    <div style="padding-top:52px">${pageHtmlList.join('')}</div>
  </body></html>`);
  win.document.close();
}

/* ══════════════════════════════════════════════
   3·4. 커뮤니티 게시글 삭제·수정 (작성자/관리자)
══════════════════════════════════════════════ */
function toggleBookmark(postId){
  if(!currentUser){ alert('스크랩은 로그인 후 이용할 수 있습니다.'); openLoginModal(); return; }
  if(bookmarkedPosts[postId]){
    delete bookmarkedPosts[postId];
  } else {
    bookmarkedPosts[postId] = true;
  }
  try{ localStorage.setItem('sbt_bookmarks', JSON.stringify(bookmarkedPosts)); }catch(e){}
  var btn = document.getElementById('bookmarkBtn-'+postId);
  if(btn){
    var isOn = !!bookmarkedPosts[postId];
    btn.textContent = isOn ? '🔖 스크랩됨' : '🔖 스크랩';
    btn.style.background   = isOn ? '#FFF8E1' : '#F5F3EF';
    btn.style.color        = isOn ? '#B8860B' : 'var(--text-mid)';
    btn.style.borderColor  = isOn ? '#FFD700' : 'var(--border)';
    if(isOn) alert('스크랩되었습니다!');
  }
}

function voteComment(postId, cmtId){
  if(!currentUser){ alert('댓글 추천은 로그인 후 이용할 수 있습니다.'); openLoginModal(); return; }
  var p = POSTS.find(function(x){ return x.id===postId; }); if(!p) return;
  var c = p.comments.find(function(x){ return x.id===cmtId; }); if(!c) return;
  if(currentUser.name === c.author){ alert('본인 댓글은 추천할 수 없습니다.'); return; }
  if(likedComments[cmtId]){ alert('이미 추천한 댓글입니다.'); return; }
  likedComments[cmtId] = true;
  c.likes = (c.likes||0) + 1;
  try{ localStorage.setItem('sbt_cmt_likes', JSON.stringify(likedComments)); }catch(e){}
  savePosts();
  var btn = document.getElementById('cmtLike-'+cmtId);
  if(btn){ btn.textContent='👍 '+c.likes; btn.style.color='var(--orange)'; btn.style.fontWeight='700'; }
}

function deleteComment(postId, cmtId){
  var p = POSTS.find(function(x){ return x.id===postId; }); if(!p) return;
  var cmt = p.comments.find(function(c){ return c.id===cmtId; }); if(!cmt) return;
  if(!isAdmin && (!currentUser || currentUser.name !== cmt.author)){
    alert('작성자 또는 관리자만 삭제할 수 있습니다.'); return;
  }
  if(!confirm('댓글을 삭제하시겠습니까?')) return;
  p.comments = p.comments.filter(function(c){ return c.id !== cmtId; });
  var el = document.getElementById('cmt-'+cmtId);
  if(el) el.remove();
  var cntEl = document.getElementById('cmtCnt-'+postId);
  if(cntEl) cntEl.textContent = p.comments.length;
  savePosts();
}

function sharePost(postId){
  var url = window.location.href.split('#')[0] + '#post-' + postId;
  if(navigator.clipboard){
    navigator.clipboard.writeText(url).then(function(){ alert('게시글 링크가 클립보드에 복사되었습니다.'); });
  } else {
    var ta = document.createElement('textarea');
    ta.value = url; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    alert('게시글 링크가 클립보드에 복사되었습니다.');
  }
}

function reportPost(postId){
  if(!currentUser){ alert('신고는 로그인 후 이용할 수 있습니다.'); openLoginModal(); return; }
  var p = POSTS.find(function(x){ return x.id===postId; }); if(!p) return;
  if(currentUser.name === p.author){ alert('본인 게시글은 신고할 수 없습니다.'); return; }
  if(!p.reports) p.reports = [];
  if(p.reports.indexOf(currentUser.name) !== -1){ alert('이미 신고한 게시글입니다.'); return; }
  var reason = prompt('신고 사유를 입력해주세요.\n(욕설/비방, 광고/스팸, 음란물, 개인정보, 기타)');
  if(!reason) return;
  p.reports.push(currentUser.name);
  savePosts();
  alert('신고가 접수되었습니다. 검토 후 조치하겠습니다.');
}

function deletePost(postId){
  var p = POSTS.find(function(x){ return x.id===postId; });
  if(!p){ alert('게시글이 없습니다.'); return; }
  if(!isAdmin && (!currentUser || currentUser.name !== p.author)){
    alert('작성자 또는 관리자만 삭제할 수 있습니다.'); return;
  }
  if(!confirm('게시글을 삭제하시겠습니까?')) return;
  POSTS = POSTS.filter(function(x){ return x.id !== postId; });
  showPage('community');
  alert('삭제되었습니다.');
}

var editingPostId = null;
function openEditPost(postId){
  var p = POSTS.find(function(x){ return x.id===postId; });
  if(!p){ return; }
  if(!currentUser || currentUser.name !== p.author){
    alert('작성자만 수정할 수 있습니다.'); return;
  }
  editingPostId = postId;
  document.getElementById('write-cat').value = p.cat;
  document.getElementById('write-badge').value = p.badge;
  document.getElementById('write-title').value = p.title;
  document.getElementById('write-content').value = p.content;
  document.getElementById('writeModal').style.display = 'flex';
  document.getElementById('writeModalTitle').textContent = '게시글 수정';
}

/* ══════════════════════════════════════════════
   3. 쪽지 시스템
══════════════════════════════════════════════ */
var MESSAGES = []; // [{id, from, to, title, content, date, read}]
var nextMsgId = 1;

function sendMessage(toUser, title, content){
  if(!currentUser){ alert('로그인이 필요합니다.'); return; }
  MESSAGES.push({
    id: nextMsgId++,
    from: currentUser.name,
    to: toUser,
    title: title||'(제목없음)',
    content: content||'',
    date: new Date().toLocaleString('ko-KR'),
    read: false
  });
  updateMsgBadge();
  alert('쪽지를 보냈습니다.');
}

function updateMsgBadge(){
  if(!currentUser) return;
  var unread = MESSAGES.filter(function(m){ return m.to===currentUser.name && !m.read; }).length;
  var badge = document.getElementById('msgBadge');
  if(badge){ badge.textContent = unread > 0 ? unread : ''; badge.style.display = unread>0?'inline-block':'none'; }
}

function openMsgModal(){
  if(!currentUser){ alert('로그인이 필요합니다.'); return; }
  var myMsgs = MESSAGES.filter(function(m){ return m.to===currentUser.name; });
  myMsgs.forEach(function(m){ m.read=true; });
  updateMsgBadge();
  var html = myMsgs.length ? myMsgs.slice().reverse().map(function(m){
    return '<div style="border-bottom:1px solid var(--border);padding:12px 0">'
      +'<div style="display:flex;justify-content:space-between;margin-bottom:4px">'
      +'<strong style="font-size:13px">'+m.from+'</strong>'
      +'<span style="font-size:11px;color:var(--text-light)">'+m.date+'</span></div>'
      +'<div style="font-size:13px;font-weight:600;margin-bottom:4px">'+m.title+'</div>'
      +'<div style="font-size:12px;color:var(--text-mid)">'+m.content+'</div>'
      +'</div>';
  }).join('') : '<div style="text-align:center;padding:32px;color:var(--text-light)">받은 쪽지가 없습니다.</div>';

  document.getElementById('msgList').innerHTML = html;
  document.getElementById('msgModal').style.display = 'flex';
}
function closeMsgModal(){ document.getElementById('msgModal').style.display='none'; }

function openSendMsgModal(toUser){
  if(!currentUser){ alert('로그인이 필요합니다.'); return; }
  document.getElementById('msgTo').value = toUser||'';
  document.getElementById('msgTitle').value = '';
  document.getElementById('msgContent').value = '';
  document.getElementById('sendMsgModal').style.display = 'flex';
}
function closeSendMsgModal(){ document.getElementById('sendMsgModal').style.display='none'; }
function submitSendMsg(){
  var to = document.getElementById('msgTo').value.trim();
  var title = document.getElementById('msgTitle').value.trim();
  var content = document.getElementById('msgContent').value.trim();
  if(!to||!title){ alert('받는사람과 제목을 입력해주세요.'); return; }
  sendMessage(to, title, content);
  closeSendMsgModal();
}

/* ══════════════════════════════════════════════
   5. 관리자 뷰어·추천수 조정
══════════════════════════════════════════════ */
function openAdjustModal(postId){
  if(!isAdmin){ return; }
  var p = POSTS.find(function(x){ return x.id===postId; }); if(!p) return;
  document.getElementById('adjustPostId').value = postId;
  document.getElementById('adjustViews').value = p.views;
  document.getElementById('adjustLikes').value = p.likes;
  document.getElementById('adjustModal').style.display = 'flex';
}
function closeAdjustModal(){ document.getElementById('adjustModal').style.display='none'; }
function submitAdjust(){
  var id = parseInt(document.getElementById('adjustPostId').value);
  var p = POSTS.find(function(x){ return x.id===id; }); if(!p) return;
  p.views = parseInt(document.getElementById('adjustViews').value)||p.views;
  p.likes = parseInt(document.getElementById('adjustLikes').value)||p.likes;
  closeAdjustModal();
  openPostDetail(id);
}

/* ══════════════════════════════════════════════
   7. 베타메뉴 개별 숨기기 토글
══════════════════════════════════════════════ */
var betaMenuState = {};

// 메뉴 상태 서버에서 불러오기 (페이지 로드 시)
(function loadMenuState(){
  fetch('/api/user.php?action=get_menu_state')
    .then(function(r){ return r.json(); })
    .then(function(res){
      if(!res.ok) return;
      betaMenuState = res.state || {};
      // 불러온 상태 즉시 적용
      Object.keys(betaMenuState).forEach(function(navId){
        if(betaMenuState[navId]){
          var el = document.getElementById(navId);
          if(el) el.classList.add('nav-hidden');
        }
      });
      // 관리자 버튼 UI 업데이트
      document.querySelectorAll('[data-label]').forEach(function(btn){
        var onclick = btn.getAttribute('onclick')||'';
        var match = onclick.match(/toggleBetaMenu\('([^']+)'/);
        if(!match) return;
        var navId = match[1];
        if(betaMenuState[navId]){
          var label = btn.getAttribute('data-label');
          btn.textContent = label + ' 🙈';
          btn.style.background = '#2A1A0A';
          btn.style.color = '#FF9060';
        }
      });
    })
    .catch(function(){
      // 서버 실패 시 localStorage 폴백
      try{
        var saved = JSON.parse(localStorage.getItem('sbt_menu_state')||'{}');
        betaMenuState = saved;
        Object.keys(saved).forEach(function(navId){
          if(saved[navId]){
            var el = document.getElementById(navId);
            if(el) el.classList.add('nav-hidden');
          }
        });
      }catch(e){}
    });
})();

function toggleBetaMenu(navId, btn){
  var hidden = !betaMenuState[navId];
  betaMenuState[navId] = hidden;
  var el = document.getElementById(navId);
  if(el) el.classList.toggle('nav-hidden', hidden);
  if(btn){
    var label = btn.getAttribute('data-label');
    btn.textContent = label + (hidden ? ' 🙈' : ' 👁');
    btn.style.background = hidden ? '#2A1A0A' : '#3A2A1A';
    btn.style.color = hidden ? '#FF9060' : '#FFC4A8';
  }
  // 저장 버튼 강조 (미저장 상태 표시)
  var saveBtn = document.getElementById('btnSaveMenuState');
  if(saveBtn){ saveBtn.style.background='#3A2A0A'; saveBtn.style.color='#FFD060'; saveBtn.textContent='💾 메뉴상태 저장 *'; }
}

/* ══════════════════════════════════════════════
   캐시 추적 시스템
══════════════════════════════════════════════ */
function addCashLog(user, amount, reason, detail){
  if(!user) return;
  if(!user.cashLog) user.cashLog = [];
  user.cashLog.unshift({
    amount: amount,
    reason: reason,
    detail: detail || '',
    date: new Date().toLocaleString('ko-KR'),
    balance: (user.cash || 0)
  });
  // 최대 100건 유지
  if(user.cashLog.length > 100) user.cashLog = user.cashLog.slice(0, 100);
  // 현재 로그인 유저면 세션도 업데이트
  if(currentUser && currentUser.id === user.id){
    currentUser.cashLog = user.cashLog;
    try{
      var sess = JSON.parse(localStorage.getItem('sbt_session')||'{}');
      sess.cash = currentUser.cash;
      localStorage.setItem('sbt_session', JSON.stringify(sess));
    }catch(e){}
    saveUserData();
  }
}

function saveMenuState(){
  var btn = document.getElementById('btnSaveMenuState');
  if(btn){ btn.disabled=true; btn.textContent='저장 중...'; }
  var body = {state: betaMenuState};
  if(isAdmin && typeof ADMIN_PW !== 'undefined') body.admin_pw = ADMIN_PW;
  fetch('/api/user.php?action=save_menu_state', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  })
  .then(function(r){ return r.json(); })
  .then(function(res){
    if(btn){ btn.disabled=false; }
    if(res.ok){
      try{ localStorage.setItem('sbt_menu_state', JSON.stringify(betaMenuState)); }catch(e){}
      if(btn){ btn.style.background='#1A4A1A'; btn.style.color='#C8F0C8'; btn.textContent='💾 저장완료!'; setTimeout(function(){ btn.textContent='💾 메뉴저장'; btn.style.background=''; btn.style.color=''; },2000); }
    } else {
      if(btn){ btn.style.background='#4A1A1A'; btn.style.color='#FFC8C8'; btn.textContent='❌ 저장실패'; setTimeout(function(){ btn.textContent='💾 메뉴저장'; btn.style.background=''; btn.style.color=''; },2000); }
    }
  })
  .catch(function(){
    if(btn){ btn.disabled=false; btn.textContent='❌ 오류'; setTimeout(function(){ btn.textContent='💾 메뉴저장'; },2000); }
  });
}

/* ══════════════════════════════════════════════
   2. 관리자 회원관리 (등급·캐시·경험치·포인트 조정)
══════════════════════════════════════════════ */
function openAdminMemberModal(){
  if(!isAdmin){ return; }
  renderAdminMemberList();
  document.getElementById('adminMemberModal').style.display='flex';
}
function closeAdminMemberModal(){ document.getElementById('adminMemberModal').style.display='none'; }

function renderAdminMemberList(){
  var el = document.getElementById('adminMemberList'); if(!el) return;
  var q = (document.getElementById('adminMemberSearch')||{}).value||'';
  var list = USERS.filter(function(u){
    if(!q) return true;
    return (u.id||'').includes(q)||(u.name||'').includes(q);
  });
  if(!list.length){ el.innerHTML='<div style="text-align:center;padding:20px;color:var(--text-light)">회원이 없습니다.</div>'; return; }
  el.innerHTML = '<table style="width:100%;border-collapse:collapse;font-size:12px">'
    +'<thead><tr style="background:#F5F3EF">'
    +'<th style="padding:8px 10px;text-align:left;border-bottom:1px solid var(--border)">아이디</th>'
    +'<th style="padding:8px 10px;text-align:left;border-bottom:1px solid var(--border)">닉네임</th>'
    +'<th style="padding:8px 10px;text-align:center;border-bottom:1px solid var(--border)">등급</th>'
    +'<th style="padding:8px 10px;text-align:right;border-bottom:1px solid var(--border)">경험치</th>'
    +'<th style="padding:8px 10px;text-align:right;border-bottom:1px solid var(--border)">캐시</th>'
    +'<th style="padding:8px 10px;text-align:right;border-bottom:1px solid var(--border)">포인트</th>'
    +'<th style="padding:8px 10px;text-align:center;border-bottom:1px solid var(--border)">가입유형</th>'
    +'<th style="padding:8px 10px;border-bottom:1px solid var(--border)"></th>'
    +'</tr></thead><tbody>'
    +list.map(function(u){
      var g = GRADES[u.grade]||GRADES['용역'];
      return '<tr onmouseover="this.style.background=\'#FAFAF8\'" onmouseout="this.style.background=\'\'">'
        +'<td style="padding:7px 10px;border-bottom:1px solid var(--border);color:var(--text-light)">'+u.id+'</td>'
        +'<td style="padding:7px 10px;border-bottom:1px solid var(--border);font-weight:600">'+u.name+'</td>'
        +'<td style="padding:7px 10px;border-bottom:1px solid var(--border);text-align:center">'
          +'<span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:3px;background:'+g.bg+';color:'+g.color+'">'+g.num+' '+g.label+'</span>'
        +'</td>'
        +'<td style="padding:7px 10px;border-bottom:1px solid var(--border);text-align:right;color:var(--orange)">'+(u.exp||0)+'pt</td>'
        +'<td style="padding:7px 10px;border-bottom:1px solid var(--border);text-align:right;color:#1A6B3A">'+(u.cash||0)+'C</td>'
        +'<td style="padding:7px 10px;border-bottom:1px solid var(--border);text-align:right;color:#1A5080">'+(u.point||0)+'P</td>'
        +'<td style="padding:7px 10px;border-bottom:1px solid var(--border);text-align:center;color:var(--text-light)">'+(u.type==='naver'?'N 네이버':'이메일')+'</td>'
        +'<td style="padding:7px 10px;border-bottom:1px solid var(--border);text-align:center">'
          +'<button onclick="openAdminMemberEditModal(\''+u.id+'\')" style="padding:3px 10px;background:#1A2F5A;color:#A8C4FF;border:none;border-radius:3px;font-size:11px;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">조정</button>'
        +'</td>'
        +'</tr>';
    }).join('')
    +'</tbody></table>';
}

var adminEditTargetId = null;
function openAdminMemberEditModal(userId){
  var u = USERS.find(function(x){ return x.id===userId; }); if(!u) return;
  adminEditTargetId = userId;
  document.getElementById('adminEditTitle').textContent = '회원 조정 — '+u.name+' ('+u.id+')';
  document.getElementById('adminEditUserId').value = userId;
  document.getElementById('adminEditGrade').value = u.grade||'용역';
  document.getElementById('adminEditExp').value = '';
  document.getElementById('adminEditCash').value = '';
  document.getElementById('adminEditPoint').value = '';
  document.getElementById('adminEditMsg').style.display='none';
  document.getElementById('adminMemberEditModal').style.display='flex';
}
function closeAdminMemberEditModal(){ document.getElementById('adminMemberEditModal').style.display='none'; }

function submitAdminMemberEdit(){
  var userId = document.getElementById('adminEditUserId').value;
  var u = USERS.find(function(x){ return x.id===userId; });
  if(!u){ return; }
  var grade = document.getElementById('adminEditGrade').value;
  var expAdd   = parseInt(document.getElementById('adminEditExp').value)||0;
  var cashAdd  = parseInt(document.getElementById('adminEditCash').value)||0;
  var pointAdd = parseInt(document.getElementById('adminEditPoint').value)||0;
  var msg = document.getElementById('adminEditMsg');

  // 등급 변경
  u.grade = grade;
  // 경험치 지급
  if(expAdd>0){
    u.exp = (u.exp||0)+expAdd;
    if(!u.expLog) u.expLog=[];
    u.expLog.push({reason:'관리자 지급',amount:expAdd,date:new Date().toLocaleString('ko-KR'),total:u.exp});
  }
  // 캐시 지급
  if(cashAdd>0) u.cash = (u.cash||0)+cashAdd;
  // 포인트 지급
  if(pointAdd>0) u.point = (u.point||0)+pointAdd;

  // 현재 로그인 중인 유저면 UI 갱신
  if(currentUser && currentUser.id===userId){
    currentUser.grade  = u.grade;
    currentUser.exp    = u.exp;
    currentUser.cash   = u.cash;
    currentUser.point  = u.point;
    activateUserMode(currentUser);
  }

  // localStorage 저장
  try{
    var saved = JSON.parse(localStorage.getItem('st_users')||'[]');
    var idx = saved.findIndex(function(x){ return x.id===userId; });
    if(idx>=0) saved[idx]=u; else saved.push(u);
    localStorage.setItem('st_users', JSON.stringify(saved));
  }catch(e){}

  msg.textContent='✅ 적용 완료! (등급:'+grade+' / 경험치+'+expAdd+' / 캐시+'+cashAdd+'C / 포인트+'+pointAdd+'P)';
  msg.style.color='#1A6B3A'; msg.style.display='block';
  renderAdminMemberList();
  setTimeout(function(){ closeAdminMemberEditModal(); },1500);
}

/* ══════════════════════════════════════════════
   4. 공무자료실 파일첨부 드래그&드롭
══════════════════════════════════════════════ */
function docsFileDrop(event){
  event.preventDefault();
  var zone = document.getElementById('docs-drop-zone');
  if(zone){ zone.style.borderColor='var(--border)'; zone.style.background=''; }
  var file = event.dataTransfer.files[0];
  if(file) setDocsFile(file);
}
function docsFileSelected(input){
  var file = input.files[0];
  if(file) setDocsFile(file);
}
function setDocsFile(file){
  document.getElementById('docs-file-name').value = file.name;
  document.getElementById('docs-drop-hint').style.display='none';
  document.getElementById('docs-file-selected').style.display='block';
  document.getElementById('docs-file-selected-name').textContent = file.name;
  var kb = Math.round(file.size/1024);
  document.getElementById('docs-file-selected-size').textContent = kb>1024 ? (kb/1024).toFixed(1)+'MB' : kb+'KB';
}

/* ══════════════════════════════════════════════
   7. F5 새로고침 대응 - POSTS/USERS localStorage 지속
══════════════════════════════════════════════ */
// POSTS 저장
/* savePosts/loadUserPosts 는 POSTS 선언 직후로 이동됨 */

/* ══════════════════════════════════════════════
   자재 / 설비용어 추가설명 댓글
══════════════════════════════════════════════ */
var matExtraComments = {}; // { 'mat_백관': [{author,text,date}], 'term_횡주관': [...] }

// localStorage에서 불러오기
(function loadExtraComments(){
  try{
    var s = localStorage.getItem('sbt_extra_cmt');
    if(s) matExtraComments = JSON.parse(s);
  }catch(e){}
})();

function saveExtraComments(){
  try{ localStorage.setItem('sbt_extra_cmt', JSON.stringify(matExtraComments)); }catch(e){}
}

// 추가설명 패널 열기/닫기
function openTermComment(event, key){
  event.stopPropagation();
  // key = 'mat_백관' 또는 'term_횡주관'
  var safeId = key.replace(/[^가-힣a-zA-Z0-9]/g,'_');
  // 자재카드 영역
  var el = document.getElementById('xc_'+safeId);
  if(!el){
    // 설비용어 - 버튼 다음 형제 div 찾기
    var btn = event.target;
    var parent = btn.parentElement;
    // 패널이 없으면 생성
    el = parent.querySelector('.term-extra-panel');
    if(!el){
      el = document.createElement('div');
      el.className = 'term-extra-panel';
      el.style.cssText = 'margin-top:10px;border-top:1px solid var(--border);padding-top:10px;display:none';
      parent.appendChild(el);
    }
  }
  var isOpen = el.style.display !== 'none';
  el.style.display = isOpen ? 'none' : 'block';
  if(!isOpen) renderExtraCommentPanel(el, key);
}

function isLiked(key, idx){
  if(!currentUser||isAdmin) return false;
  var cm = (matExtraComments[key]||[])[idx];
  if(!cm) return false;
  var uid = currentUser.id||currentUser.name;
  return (cm.likedBy||[]).indexOf(uid)!==-1;
}

/* 공통: 댓글 액션 버튼 HTML */
function buildCmtActions(key, origIdx, cm){
  var liked = isLiked(key, origIdx);
  var likeLabel = isAdmin ? '👍 ✚ '+(cm.likes||0) : '👍 추천 '+(cm.likes||0);
  var likeBtn = '<button onclick="likeExtraComment(\''+key+'\','+origIdx+')" class="mdl-like-btn'+(liked?' liked':'')+'" style="font-size:11px">'+likeLabel+'</button>'
    +(isAdmin ? '<button onclick="unlikeExtraComment(\''+key+'\','+origIdx+')" style="padding:3px 9px;background:transparent;border:1px solid var(--border);border-radius:3px;font-size:11px;color:var(--text-mid);cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">👎 ✖</button>' : '');
  var canModify = isAdmin || (currentUser && currentUser.name===cm.author);
  var modBtns = canModify
    ? '<button onclick="editExtraComment(\''+key+'\','+origIdx+')" style="padding:3px 9px;background:transparent;border:1px solid var(--border);border-radius:3px;font-size:10px;color:var(--text-mid);cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">수정</button>'
      +'<button onclick="deleteExtraComment(\''+key+'\','+origIdx+')" style="padding:3px 9px;background:transparent;border:1px solid #fca5a5;border-radius:3px;font-size:10px;color:#ef4444;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">삭제</button>'
    : '';
  var replyBtn = currentUser ? '<button onclick="toggleExtraReplyBox(\''+key+'\','+origIdx+')" style="padding:3px 9px;background:transparent;border:1px solid var(--border);border-radius:3px;font-size:11px;color:var(--text-mid);cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">↩ 답글</button>' : '';
  return '<div style="display:flex;align-items:center;gap:6px;margin-top:5px;flex-wrap:wrap">'+likeBtn+replyBtn+modBtns+'</div>';
}

/* 모든 패널 새로고침 */
function refreshAllCommentPanels(key){
  var safeId = key.replace(/[^가-힣a-zA-Z0-9]/g,'_');
  var inlineEl = document.getElementById('xc_'+safeId);
  if(inlineEl&&inlineEl.style.display!=='none') renderExtraCommentPanel(inlineEl, key);
  var name = key.replace(/^mat_/,'');
  var safeMatId = name.replace(/[^가-힣a-zA-Z0-9]/g,'_');
  var dpanel = document.getElementById('dp_'+safeMatId);
  if(dpanel&&dpanel.style.display!=='none'&&typeof renderMatDetailPanel==='function'){
    var d = (typeof DB!=='undefined') ? DB.find(function(x){return x.name===name;}) : null;
    if(d) renderMatDetailPanel(dpanel, d, key);
  }
  var matcmtEl = document.getElementById('comm-content-matcmt');
  if(matcmtEl&&matcmtEl.style.display!=='none') renderMatCmtBoard();
  if(typeof refreshCardTopComment==='function') refreshCardTopComment(name);
}

function likeExtraComment(key, idx){
  if(!currentUser&&!isAdmin){ alert('로그인이 필요합니다.'); return; }
  var list = matExtraComments[key]||[];
  var cm = list[idx]; if(!cm) return;
  if(!cm.likedBy) cm.likedBy=[];
  if(isAdmin){
    cm.likes = (cm.likes||0)+1;
  } else {
    var uid = currentUser.id||currentUser.name;
    var pos = cm.likedBy.indexOf(uid);
    if(pos!==-1){ cm.likedBy.splice(pos,1); cm.likes=Math.max(0,(cm.likes||1)-1); }
    else { cm.likedBy.push(uid); cm.likes=(cm.likes||0)+1; }
  }
  saveExtraComments();
  refreshAllCommentPanels(key);
}

function unlikeExtraComment(key, idx){
  var list = matExtraComments[key]||[];
  var cm = list[idx]; if(!cm) return;
  cm.likes = Math.max(0,(cm.likes||1)-1);
  saveExtraComments();
  refreshAllCommentPanels(key);
}

function editExtraComment(key, origIdx){
  var cm = (matExtraComments[key]||[])[origIdx]; if(!cm) return;
  var safeId = key.replace(/[^가-힣a-zA-Z0-9]/g,'_');
  var itemEl = document.getElementById('cmtitem_'+safeId+'_'+origIdx); if(!itemEl) return;
  itemEl.innerHTML =
    '<textarea id="editInp_'+safeId+'_'+origIdx+'" style="width:100%;padding:7px 9px;border:1.5px solid var(--orange);border-radius:4px;font-size:13px;font-family:\'Noto Sans KR\',sans-serif;outline:none;resize:vertical;line-height:1.6;box-sizing:border-box">'+cm.text+'</textarea>'
    +'<div style="display:flex;gap:6px;margin-top:6px">'
    +'<button onclick="saveEditedComment(\''+key+'\','+origIdx+')" style="padding:5px 14px;background:var(--orange);color:#fff;border:none;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">저장</button>'
    +'<button onclick="refreshAllCommentPanels(\''+key+'\')" style="padding:5px 14px;background:transparent;border:1px solid var(--border);border-radius:4px;font-size:12px;color:var(--text-mid);cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">취소</button>'
    +'</div>';
  var ta = document.getElementById('editInp_'+safeId+'_'+origIdx);
  if(ta){ ta.focus(); ta.setSelectionRange(ta.value.length,ta.value.length); }
}

function saveEditedComment(key, origIdx){
  var safeId = key.replace(/[^가-힣a-zA-Z0-9]/g,'_');
  var inp = document.getElementById('editInp_'+safeId+'_'+origIdx); if(!inp) return;
  var text = inp.value.trim(); if(!text) return;
  var cm = (matExtraComments[key]||[])[origIdx]; if(!cm) return;
  cm.text = text;
  saveExtraComments();
  refreshAllCommentPanels(key);
}

function deleteExtraComment(key, origIdx){
  if(!confirm('이 댓글을 삭제하시겠습니까?')) return;
  if(!matExtraComments[key]) return;
  matExtraComments[key].splice(origIdx, 1);
  saveExtraComments();
  refreshAllCommentPanels(key);
}

function renderExtraCommentPanel(el, key){
  var raw = matExtraComments[key] || [];
  // 추천순 정렬 (인덱스 보존)
  var list = raw.map(function(cm,i){return {cm:cm,i:i};}).sort(function(a,b){return (b.cm.likes||0)-(a.cm.likes||0);});
  var safeId = key.replace(/[^가-힣a-zA-Z0-9]/g,'_');
  var cmtHtml = list.length
    ? list.map(function(obj){
        var cm=obj.cm; var i=obj.i;
        var repliesHtml = (cm.replies&&cm.replies.length)
          ? '<div style="margin-top:6px;padding-left:10px;border-left:2px solid var(--orange);background:#FFFAF7;border-radius:0 4px 4px 0;padding:6px 10px">'
              +cm.replies.map(function(r){
                return '<div style="padding:4px 0;border-bottom:1px solid #FFE8D6">'
                  +'<div style="font-size:11px;font-weight:700;color:var(--text-mid);margin-bottom:2px">↩ '+r.author+' <span style="font-weight:400;color:var(--text-light)">'+(r.date||'')+'</span></div>'
                  +'<div style="font-size:12px;color:var(--text)">'+r.text+'</div>'
                +'</div>';
              }).join('')
            +'</div>'
          : '';
        var replyBoxHtml = currentUser
          ? '<div id="xcr-box-'+safeId+'-'+i+'" style="display:none;margin-top:6px">'
              +'<div style="display:flex;gap:6px">'
                +'<input type="text" id="xcr-inp-'+safeId+'-'+i+'" placeholder="답글 입력..." style="flex:1;padding:5px 9px;border:1px solid var(--border);border-radius:4px;font-size:12px;font-family:\'Noto Sans KR\',sans-serif;outline:none" onkeydown="if(event.key===\'Enter\')addExtraReply(\''+key+'\','+i+')">'
                +'<button onclick="addExtraReply(\''+key+'\','+i+')" style="padding:5px 10px;background:var(--dark);color:#fff;border:none;border-radius:4px;font-size:11px;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">등록</button>'
              +'</div>'
            +'</div>'
          : '';
        return '<div id="cmtitem_'+safeId+'_'+i+'" style="padding:7px 0;border-bottom:1px solid var(--border)">'
          +'<div style="display:flex;justify-content:space-between;margin-bottom:3px">'
          +'<strong style="font-size:12px;color:var(--orange)">'+cm.author+'</strong>'
          +'<span style="font-size:10px;color:var(--text-light)">'+cm.date+'</span>'
          +'</div>'
          +'<div style="font-size:12px;color:var(--text);line-height:1.6;margin-bottom:3px">'+cm.text+'</div>'
          +buildCmtActions(key, i, cm)
          +repliesHtml
          +replyBoxHtml
          +'</div>';
      }).join('')
    : '<div style="font-size:11px;color:var(--text-light);padding:4px 0">첫 번째 추가 설명을 남겨보세요!</div>';

  var inputHtml = currentUser
    ? '<div style="display:flex;gap:6px;margin-top:8px">'
        +'<input type="text" id="xci_'+safeId+'" placeholder="현장 경험이나 추가 정보를 공유해주세요..." '
        +'style="flex:1;padding:6px 10px;border:1px solid var(--border);border-radius:4px;font-size:12px;font-family:\'Noto Sans KR\',sans-serif;outline:none" '
        +'onkeydown="if(event.key===\'Enter\')submitExtraComment(\''+key+'\')">'
        +'<button onclick="submitExtraComment(\''+key+'\')" '
        +'style="padding:6px 12px;background:var(--orange);color:#fff;border:none;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">등록</button>'
      +'</div>'
    : '<div style="font-size:11px;color:var(--text-light);margin-top:6px;text-align:center">로그인 후 추가 설명을 작성할 수 있습니다.</div>';

  el.innerHTML =
    '<div style="font-size:11px;font-weight:700;color:var(--text-mid);margin-bottom:8px">💬 추가설명 '+list.length+'개</div>'
    + cmtHtml
    + inputHtml;
}

function submitExtraComment(key){
  if(!currentUser){ alert('로그인이 필요합니다.'); return; }
  var safeId = key.replace(/[^가-힣a-zA-Z0-9]/g,'_');
  var inp = document.getElementById('xci_'+safeId);
  var text = inp ? inp.value.trim() : '';
  if(!text){ if(inp) inp.focus(); return; }

  if(!matExtraComments[key]) matExtraComments[key] = [];
  matExtraComments[key].push({
    author: currentUser.name,
    text: text,
    date: new Date().toLocaleDateString('ko-KR'),
    likes: 0,
    likedBy: []
  });
  saveExtraComments();

  // 패널 새로고침
  var el = document.getElementById('xc_'+safeId)
        || document.querySelector('[id="xc_'+safeId+'"]');
  // 설비용어 패널은 term-extra-panel 클래스
  if(!el){
    document.querySelectorAll('.term-extra-panel').forEach(function(panel){
      if(panel.querySelector('#xci_'+safeId)) el = panel;
    });
  }
  if(el) renderExtraCommentPanel(el, key);

  // 카드 미리보기 새로고침
  if(typeof refreshCardTopComment==='function') refreshCardTopComment(key.replace(/^mat_/,''));

  // 경험치 +3
  if(typeof addExp==='function'){ addExp(currentUser, 3, '자재 추가설명'); saveUserData(); }
}

/* ══════════════════════════════════════════════
   자재 추가설명 게시판
══════════════════════════════════════════════ */
function renderMatCmtBoard(){
  var el = document.getElementById('matcmt-list'); if(!el) return;
  var q = ((document.getElementById('matcmtSearch')||{}).value||'').trim();

  var entries = Object.entries(matExtraComments)
    .filter(function(e){ return e[0].indexOf('mat_')===0 && e[1].length>0; })
    .map(function(e){
      var matName = e[0].replace(/^mat_/,'');
      var comments = e[1].slice().map(function(c,i){return Object.assign({},c,{_origIdx:i});})
                         .sort(function(a,b){return (b.likes||0)-(a.likes||0);});
      return {name:matName, key:e[0], comments:comments};
    })
    .filter(function(e){
      if(!q) return true;
      return e.name.indexOf(q)!==-1 || e.comments.some(function(c){
        return (c.text||'').indexOf(q)!==-1 || (c.author||'').indexOf(q)!==-1;
      });
    })
    .sort(function(a,b){ return b.comments.length - a.comments.length; });

  var countEl = document.getElementById('matcmtCount');
  if(countEl) countEl.textContent = '자재 '+entries.length+'개 · 댓글 '+entries.reduce(function(s,e){return s+e.comments.length;},0)+'개';

  if(!entries.length){
    el.innerHTML='<div style="text-align:center;padding:48px;color:var(--text-light)">'
      +'<div style="font-size:36px;margin-bottom:12px">🔧</div>'
      +'<p>아직 자재 추가설명이 없습니다.<br><span style="font-size:12px">자재 검색 후 추가설명을 작성해보세요.</span></p>'
      +'</div>';
    return;
  }

  el.innerHTML = entries.map(function(e){
    var boardSafeId = e.key.replace(/[^가-힣a-zA-Z0-9]/g,'_');
    var cmtHtml = e.comments.map(function(c, rank){
      var isBest = rank===0 && (c.likes||0)>0;
      return '<div id="cmtitem_'+boardSafeId+'_'+c._origIdx+'" style="padding:9px 0;border-bottom:1px solid var(--border-light)">'
        +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap">'
          +'<strong style="font-size:12px;color:var(--orange)">'+c.author+'</strong>'
          +'<span style="font-size:10px;color:var(--text-light)">'+c.date+'</span>'
          +(isBest?'<span style="font-size:10px;background:#FFF3E8;color:var(--orange);padding:1px 7px;border-radius:10px;font-weight:700">👍 베스트</span>':'')
        +'</div>'
        +'<div style="font-size:13px;color:var(--text);line-height:1.7;margin-bottom:3px">'+c.text+'</div>'
        +buildCmtActions(e.key, c._origIdx, c)
      +'</div>';
    }).join('');

    return '<div style="background:#fff;border:1.5px solid var(--border-light);border-radius:var(--radius);padding:16px 20px;margin-bottom:12px">'
      +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;padding-bottom:10px;border-bottom:2px solid var(--orange)">'
        +'<div style="background:var(--orange);color:#fff;font-size:10px;font-weight:700;padding:3px 8px;border-radius:3px;flex-shrink:0">자재</div>'
        +'<span style="font-size:15px;font-weight:700;color:var(--text);cursor:pointer;transition:color .15s" '
          +'onclick="goToMat(\''+e.name+'\')" onmouseover="this.style.color=\'var(--orange)\'" onmouseout="this.style.color=\'var(--text)\'">'+e.name+'</span>'
        +'<span style="font-size:11px;color:var(--text-light);margin-left:auto;flex-shrink:0">댓글 '+e.comments.length+'개</span>'
      +'</div>'
      +cmtHtml
    +'</div>';
  }).join('');
}

function goToMat(name){
  if(typeof showPage==='function') showPage('search');
  setTimeout(function(){
    if(typeof setSearch==='function') setSearch(name);
  }, 150);
}

/* ══════════════════════════════════════════════
   8. 홈화면 공지사항 렌더
══════════════════════════════════════════════ */
function renderHomeNotice(){
  var el = document.getElementById('homeNoticeList'); if(!el) return;
  var list = NOTICES.slice(0,5);
  el.innerHTML = list.map(function(n){
    var isImp = n.important;
    return '<div onclick="openNoticeDetail('+n.id+')" style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer" onmouseover="this.style.background=\'#FAFAF8\'" onmouseout="this.style.background=\'\'">'
      +'<span style="font-size:10px;padding:1px 7px;border-radius:2px;background:'+(isImp?'var(--orange)':'var(--tag-bg)')+';color:'+(isImp?'#fff':'var(--tag-text)')+';font-weight:700;white-space:nowrap">'+n.badge+'</span>'
      +'<span style="font-size:13px;color:var(--text);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(isImp?'<strong>':'')+n.title+(isImp?'</strong>':'')+'</span>'
      +'<span style="font-size:11px;color:var(--text-light);white-space:nowrap;flex-shrink:0">'+n.date+'</span>'
      +'</div>';
  }).join('');
}

/* ══════════════════════════════════════════════
   8. 건설뉴스 수집 (rss_fetch.php 프록시 방식)
══════════════════════════════════════════════ */
async function fetchRssNews(){
  var el = document.getElementById('newsList'); if(!el) return;

  // 로딩 표시
  el.style.opacity='0.5';

  try{
    var r = await fetch('rss_fetch.php?t='+Date.now(), {cache:'no-cache'});
    if(!r.ok) throw new Error('HTTP '+r.status);
    var d = await r.json();

    if(d.ok && d.items && d.items.length){
      d.items.forEach(function(item){
        if(!NEWS.find(function(n){ return n.title===item.title; })){
          NEWS.unshift({
            id: Date.now()+Math.random(),
            cat: item.cat||'뉴스',
            title: item.title,
            date: item.date||'',
            summary: item.summary||'',
            content: item.content||item.summary||'',
            link: item.link||''
          });
        }
      });
      renderNews();
    } else {
      // API 미등록 또는 결과 없음 → 기존 샘플 뉴스 유지
      renderNews();
    }
  } catch(e){
    // 서버 연결 실패 → 기존 샘플 뉴스 유지
    renderNews();
  }

  el.style.opacity='1';
}

/* ══════════════════════════════════════════════
   11. 공무자료실
══════════════════════════════════════════════ */

/* ══════════════════════════════════════════════
   커뮤니티 HTML 초기화
══════════════════════════════════════════════ */
function initCommunityHTML(){
  document.getElementById('page-community').innerHTML = `
  <div class="comm-page">
    <div class="comm-page-header">
      <h2>커뮤니티</h2>
      <p>건설 현장 실무 정보를 자유롭게 나눠보세요.</p>
    </div>

    <!-- 1행: 전체/자유/질문/정보 게시판 탭 -->
    <div style="display:flex;gap:4px;border-bottom:2px solid var(--border);margin-bottom:0;flex-wrap:wrap;align-items:flex-end">
      <button id="comm-tab-all" onclick="switchCommTab('all')"
        style="padding:10px 18px;background:var(--orange);color:#fff;border:none;border-radius:4px 4px 0 0;font-size:13px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif;margin-bottom:-2px;border-bottom:2px solid var(--orange)">
        📋 전체 게시판
      </button>
      <button id="comm-tab-free" onclick="switchCommTab('free')"
        style="padding:10px 18px;background:transparent;color:var(--text-mid);border:1px solid var(--border);border-bottom:none;border-radius:4px 4px 0 0;font-size:13px;font-weight:500;cursor:pointer;font-family:'Noto Sans KR',sans-serif;margin-bottom:-2px">
        💬 자유게시판
      </button>
      <button id="comm-tab-qna" onclick="switchCommTab('qna')"
        style="padding:10px 18px;background:transparent;color:var(--text-mid);border:1px solid var(--border);border-bottom:none;border-radius:4px 4px 0 0;font-size:13px;font-weight:500;cursor:pointer;font-family:'Noto Sans KR',sans-serif;margin-bottom:-2px">
        ❓ 질문게시판
      </button>
      <button id="comm-tab-info" onclick="switchCommTab('info')"
        style="padding:10px 18px;background:transparent;color:var(--text-mid);border:1px solid var(--border);border-bottom:none;border-radius:4px 4px 0 0;font-size:13px;font-weight:500;cursor:pointer;font-family:'Noto Sans KR',sans-serif;margin-bottom:-2px">
        📌 정보게시판
      </button>
      <button id="comm-tab-matcmt" onclick="switchCommTab('matcmt')"
        style="padding:10px 18px;background:transparent;color:var(--text-mid);border:1px solid var(--border);border-bottom:none;border-radius:4px 4px 0 0;font-size:13px;font-weight:500;cursor:pointer;font-family:'Noto Sans KR',sans-serif;margin-bottom:-2px">
        🔧 자재추가설명
      </button>
      <button onclick="openWriteModal()"
        style="margin-left:auto;padding:8px 18px;background:var(--orange);color:#fff;border:none;border-radius:4px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif;margin-bottom:2px">
        ✏️ 글쓰기
      </button>
    </div>

    <!-- 2행: 베스트 게시판 탭 (작게) -->
    <div style="display:flex;align-items:center;gap:6px;background:#FFFAF7;border:1px solid var(--border);border-top:none;padding:6px 12px;margin-bottom:20px">
      <button id="comm-tab-best" onclick="switchCommTab('best')"
        style="padding:5px 14px;background:transparent;color:var(--text-mid);border:1px solid var(--border);border-radius:3px;font-size:12px;cursor:pointer;font-family:'Noto Sans KR',sans-serif">
        🏆 베스트 게시판
      </button>
      <span style="font-size:11px;color:var(--text-light)">추천수 15개 이상 게시글이 자동 등록됩니다</span>
    </div>

    <!-- 전체 탭 -->
    <div id="comm-content-all">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap">
        <input type="text" id="commSearchInput" placeholder="🔍 제목·작성자 검색..."
          oninput="commPage=1;renderAllPosts()"
          style="flex:1;min-width:160px;padding:7px 12px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none">
        <select id="commPageSize" onchange="commPage=1;renderAllPosts()"
          style="padding:7px 10px;border:1px solid var(--border);border-radius:4px;font-size:12px;font-family:'Noto Sans KR',sans-serif;outline:none;color:var(--text-mid)">
          <option value="10">10개씩</option>
          <option value="15" selected>15개씩</option>
          <option value="20">20개씩</option>
          <option value="25">25개씩</option>
        </select>
        <span id="allPostCount" style="font-size:12px;color:var(--text-light)"></span>
      </div>
      <div id="allPostList"></div>
    </div>

    <!-- 자유게시판 탭 -->
    <div id="comm-content-free" style="display:none">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap">
        <input type="text" id="freeSearchInput" placeholder="🔍 제목·작성자 검색..."
          oninput="boardPages.free=1;renderBoardPosts('free')"
          style="flex:1;min-width:160px;padding:7px 12px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none">
        <select id="freePageSize" onchange="boardPages.free=1;renderBoardPosts('free')"
          style="padding:7px 10px;border:1px solid var(--border);border-radius:4px;font-size:12px;font-family:'Noto Sans KR',sans-serif;outline:none;color:var(--text-mid)">
          <option value="10">10개씩</option>
          <option value="15" selected>15개씩</option>
          <option value="20">20개씩</option>
          <option value="25">25개씩</option>
        </select>
        <span id="freePostCount" style="font-size:12px;color:var(--text-light)"></span>
      </div>
      <div id="freePostList"></div>
    </div>

    <!-- 질문게시판 탭 -->
    <div id="comm-content-qna" style="display:none">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap">
        <input type="text" id="qnaSearchInput" placeholder="🔍 제목·작성자 검색..."
          oninput="boardPages.qna=1;renderBoardPosts('qna')"
          style="flex:1;min-width:160px;padding:7px 12px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none">
        <select id="qnaPageSize" onchange="boardPages.qna=1;renderBoardPosts('qna')"
          style="padding:7px 10px;border:1px solid var(--border);border-radius:4px;font-size:12px;font-family:'Noto Sans KR',sans-serif;outline:none;color:var(--text-mid)">
          <option value="10">10개씩</option>
          <option value="15" selected>15개씩</option>
          <option value="20">20개씩</option>
          <option value="25">25개씩</option>
        </select>
        <span id="qnaPostCount" style="font-size:12px;color:var(--text-light)"></span>
      </div>
      <div id="qnaPostList"></div>
    </div>

    <!-- 정보게시판 탭 -->
    <div id="comm-content-info" style="display:none">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap">
        <input type="text" id="infoSearchInput" placeholder="🔍 제목·작성자 검색..."
          oninput="boardPages.info=1;renderBoardPosts('info')"
          style="flex:1;min-width:160px;padding:7px 12px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none">
        <select id="infoPageSize" onchange="boardPages.info=1;renderBoardPosts('info')"
          style="padding:7px 10px;border:1px solid var(--border);border-radius:4px;font-size:12px;font-family:'Noto Sans KR',sans-serif;outline:none;color:var(--text-mid)">
          <option value="10">10개씩</option>
          <option value="15" selected>15개씩</option>
          <option value="20">20개씩</option>
          <option value="25">25개씩</option>
        </select>
        <span id="infoPostCount" style="font-size:12px;color:var(--text-light)"></span>
      </div>
      <div id="infoPostList"></div>
    </div>

    <!-- 자재추가설명 탭 -->
    <div id="comm-content-matcmt" style="display:none">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap">
        <input type="text" id="matcmtSearch" placeholder="🔍 자재명·작성자·내용 검색..."
          oninput="renderMatCmtBoard()"
          style="flex:1;min-width:160px;padding:7px 12px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none">
        <span id="matcmtCount" style="font-size:12px;color:var(--text-light)"></span>
      </div>
      <div id="matcmt-list"></div>
    </div>

    <!-- 베스트 탭 -->
    <div id="comm-content-best" style="display:none">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
        <span style="font-size:16px">🏆</span>
        <div style="font-size:13px;color:var(--text-light)">추천수 15개 이상 게시글이 자동으로 등록됩니다</div>
      </div>
      <div id="bestPostList"></div>
    </div>
  </div>
`;
  document.getElementById('writeModal').innerHTML = `
  <div style="background:var(--white);border-radius:8px;width:660px;max-height:92vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3)">
    <div style="background:var(--dark);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:1;border-radius:8px 8px 0 0">
      <h3 style="font-size:15px;font-weight:700;color:#fff">✏️ 게시글 작성</h3>
      <button onclick="closeWriteModal()" style="background:none;border:none;color:#888;cursor:pointer;font-size:18px">✕</button>
    </div>
    <div style="padding:20px 24px;display:flex;flex-direction:column;gap:12px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:5px">게시판 <span style="color:var(--orange)">*</span></label>
          <select id="write-cat" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none">
            <option value="자유게시판">자유게시판</option>
            <option value="질문게시판">질문게시판</option>
            <option value="정보게시판">정보게시판</option>
          </select>
        </div>
        <div>
          <label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:5px">유형 <span style="color:var(--orange)">*</span></label>
          <select id="write-badge" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none">
            <option value="Q&A">Q&A</option>
            <option value="자료">자료</option>
          </select>
        </div>
      </div>
      <div>
        <label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:5px">제목 <span style="color:var(--orange)">*</span></label>
        <input type="text" id="write-title" placeholder="제목을 입력하세요"
          style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none">
      </div>
      <div>
        <label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:5px">작성자</label>
        <input type="text" id="write-author" placeholder="닉네임 (선택)"
          style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none">
      </div>
      <!-- 내용 - 일반/HTML 모드 전환 -->
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">
          <label style="font-size:12px;font-weight:700;color:var(--text-mid)">내용 <span style="color:var(--orange)">*</span></label>
          <div style="display:flex;gap:4px">
            <button id="btn-mode-text" onclick="setWriteMode('text')"
              style="padding:3px 10px;background:var(--orange);color:#fff;border:none;border-radius:3px;font-size:11px;cursor:pointer;font-family:'Noto Sans KR',sans-serif">일반</button>
            <button id="btn-mode-html" onclick="setWriteMode('html')"
              style="padding:3px 10px;background:transparent;color:var(--text-mid);border:1px solid var(--border);border-radius:3px;font-size:11px;cursor:pointer;font-family:'Noto Sans KR',sans-serif">HTML</button>
          </div>
        </div>
        <textarea id="write-content" rows="7" placeholder="내용을 입력하세요 (일반 텍스트)"
          style="width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;resize:vertical;line-height:1.6"></textarea>
        <div id="write-html-hint" style="display:none;margin-top:4px;font-size:11px;color:var(--text-light)">💡 HTML 모드: &lt;img src="URL"&gt; 로 외부 이미지 삽입 가능. &lt;b&gt;굵게&lt;/b&gt;, &lt;a href="URL"&gt;링크&lt;/a&gt; 등 사용 가능.</div>
      </div>
      <!-- 사진 첨부 -->
      <div>
        <label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:5px">사진 첨부 <span style="font-size:11px;font-weight:400;color:var(--text-light)">(최대 3장 · 자동 압축)</span></label>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <button onclick="document.getElementById('write-img-input').click()"
            style="padding:7px 14px;background:var(--tag-bg);color:var(--text-mid);border:1px solid var(--border);border-radius:4px;font-size:12px;cursor:pointer;font-family:'Noto Sans KR',sans-serif">📎 사진 선택</button>
          <input type="file" id="write-img-input" accept="image/*" multiple style="display:none" onchange="handlePostImages(this)">
          <span style="font-size:11px;color:var(--text-light)">JPG·PNG·GIF 지원 · 800px로 자동 리사이즈</span>
        </div>
        <div id="write-img-preview" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"></div>
      </div>
    </div>
    <div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;background:#FAFAF8;border-radius:0 0 8px 8px">
      <button onclick="closeWriteModal()" style="padding:9px 16px;background:transparent;border:1px solid var(--border);border-radius:4px;font-size:13px;color:var(--text-mid);cursor:pointer;font-family:'Noto Sans KR',sans-serif">취소</button>
      <button onclick="submitPost()" style="padding:9px 20px;background:var(--orange);color:#fff;border:none;border-radius:4px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">등록</button>
    </div>
  </div>
`;
  document.getElementById('writeModal').style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:3000;display:none;align-items:center;justify-content:center';
}

/* ══════════════════════════════════════════════
   내 스크랩 페이지
══════════════════════════════════════════════ */
function renderScrap(){
  var el = document.getElementById('page-scrap');
  if(!el) return;

  if(!currentUser){
    el.innerHTML = '<div style="max-width:700px;margin:60px auto;text-align:center;padding:0 16px">'
      +'<div style="font-size:48px;margin-bottom:16px">🔖</div>'
      +'<div style="font-size:18px;font-weight:700;margin-bottom:8px">로그인이 필요합니다</div>'
      +'<div style="font-size:14px;color:var(--text-mid);margin-bottom:24px">스크랩 기능은 로그인 후 이용할 수 있습니다.</div>'
      +'<button onclick="openLoginModal()" style="padding:10px 28px;background:var(--orange);color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:700;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">로그인하기</button>'
      +'</div>';
    return;
  }

  // localStorage에서 스크랩 목록 로드
  var bookmarks = {};
  try{ bookmarks = JSON.parse(localStorage.getItem('sbt_bookmarks')||'{}'); }catch(e){}

  // 스크랩된 게시글 필터링
  var scrappedIds = Object.keys(bookmarks).filter(function(k){ return bookmarks[k]; }).map(Number);
  var scrappedPosts = (typeof POSTS !== 'undefined' ? POSTS : []).filter(function(p){ return scrappedIds.indexOf(p.id) !== -1; });

  var html = '<div style="max-width:860px;margin:0 auto;padding:28px 16px">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">'
    +'<h2 style="font-size:20px;font-weight:700;margin:0">🔖 내 스크랩</h2>'
    +'<span style="font-size:13px;color:var(--text-mid)">총 '+scrappedPosts.length+'개</span>'
    +'</div>';

  if(scrappedPosts.length === 0){
    html += '<div style="background:var(--white);border:1px solid var(--border);border-radius:8px;padding:60px 20px;text-align:center">'
      +'<div style="font-size:40px;margin-bottom:12px">📭</div>'
      +'<div style="font-size:15px;font-weight:600;margin-bottom:6px">스크랩한 게시글이 없습니다</div>'
      +'<div style="font-size:13px;color:var(--text-mid);margin-bottom:20px">게시글 상세에서 🔖 스크랩 버튼을 눌러 저장해보세요</div>'
      +'<button onclick="showPage(\'community\')" style="padding:9px 22px;background:var(--orange);color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">커뮤니티 보러가기</button>'
      +'</div>';
  } else {
    html += '<div style="display:flex;flex-direction:column;gap:8px">';
    scrappedPosts.forEach(function(p){
      var catColor = p.cat==='자유게시판'?'#8B7355':p.cat==='정보게시판'?'#1A4080':p.cat==='질문게시판'?'#2D6A2D':'#555';
      var catBg   = p.cat==='자유게시판'?'#F5F0E8':p.cat==='정보게시판'?'#E8F0FB':p.cat==='질문게시판'?'#E8F5E8':'#F0F0F0';
      html += '<div style="background:var(--white);border:1px solid var(--border);border-radius:8px;padding:16px 20px;cursor:pointer;transition:box-shadow .15s" '
        +'onmouseover="this.style.boxShadow=\'0 4px 14px rgba(0,0,0,.08)\'" onmouseout="this.style.boxShadow=\'\'" '
        +'onclick="showPostDetail('+p.id+')">'
        +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
        +'<span style="background:'+catBg+';color:'+catColor+';font-size:11px;padding:2px 8px;border-radius:3px;font-weight:500">'+p.cat+'</span>'
        +'<span style="font-size:12px;color:var(--text-light)">'+p.date+'</span>'
        +'<button onclick="event.stopPropagation();removeScrap('+p.id+',this.closest(\'[onclick]\'))" '
        +'style="margin-left:auto;padding:3px 10px;background:transparent;border:1px solid var(--border);border-radius:4px;font-size:11px;color:var(--text-mid);cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">삭제</button>'
        +'</div>'
        +'<div style="font-size:15px;font-weight:600;color:var(--text);margin-bottom:6px">'+p.title+'</div>'
        +'<div style="display:flex;align-items:center;gap:12px;font-size:12px;color:var(--text-light)">'
        +'<span>✍️ '+p.author+'</span>'
        +'<span>👁 '+p.views+'</span>'
        +'<span>👍 '+p.likes+'</span>'
        +'<span>💬 '+p.comments.length+'</span>'
        +'</div>'
        +'</div>';
    });
    html += '</div>';
  }

  html += '</div>';
  el.innerHTML = html;
}

function removeScrap(postId, rowEl){
  var bookmarks = {};
  try{ bookmarks = JSON.parse(localStorage.getItem('sbt_bookmarks')||'{}'); }catch(e){}
  delete bookmarks[postId];
  try{ localStorage.setItem('sbt_bookmarks', JSON.stringify(bookmarks)); }catch(e){}
  // bookmarkedPosts 전역 변수도 동기화
  if(typeof bookmarkedPosts !== 'undefined') delete bookmarkedPosts[postId];
  if(rowEl) rowEl.remove();
  // 남은 개수 갱신
  var countEl = document.querySelector('#page-scrap span[style*="text-mid"]');
  if(countEl){
    var remaining = document.querySelectorAll('#page-scrap [onclick^="showPostDetail"]').length;
    countEl.textContent = '총 '+remaining+'개';
  }
}
document.addEventListener('DOMContentLoaded', initCommunityHTML);