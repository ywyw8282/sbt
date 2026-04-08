var HELP_REQUESTS = [
  {id:1,cat:'설비',type:'도면작성',title:'기계실 배관 계통도 작성 요청',content:'강남 아파트 기계실 배관 계통도 CAD 파일 작성 부탁드립니다. A1사이즈 1매.',author:'현장소장',date:'2025.03.18',deadline:'2025.03.25',cash:5000,status:'open',images:[],answers:[],applicants:[]},
  {id:2,cat:'전기',type:'설계변경',title:'분전반 회로 변경 검토 요청',content:'3층 사무실 분전반 회로 추가에 따른 간선 용량 검토 필요합니다.',author:'전기팀장',date:'2025.03.17',deadline:'2025.03.22',cash:3000,status:'open',images:[],answers:[],applicants:[]},
  {id:3,cat:'소방',type:'자료조사',title:'스프링클러 헤드 배치기준 자료 요청',content:'지하주차장 준비작동식 스프링클러 헤드 간격기준 관련 법령 자료 필요합니다.',author:'소방담당',date:'2025.03.15',deadline:'2025.03.20',cash:1000,status:'done',images:[],answers:[
    {id:1,author:'소방기술사',content:'NFTC 103 기준으로 헤드 간격 3.7m 이하, 벽으로부터 1.7m 이하입니다. 관련 법령 첨부드립니다.',date:'2025.03.16',adopted:true}
  ]},
];
var nextHelpId=4, nextHelpAnswerId=2, helpWriteImages=[], editingHelpId=null, helpTab='all';

/* ═══ 도움요청 저장/복원 ═══ */
function saveHelp(){
  try{
    localStorage.setItem('sbt_help', JSON.stringify(HELP_REQUESTS));
    localStorage.setItem('sbt_help_id', String(nextHelpId));
  }catch(e){}
}
(function loadHelp(){
  try{
    var s = localStorage.getItem('sbt_help');
    if(!s) return;
    var arr = JSON.parse(s);
    if(!arr||!arr.length) return;
    // 샘플(id<=3)은 유지하고 사용자 등록분만 추가
    arr.filter(function(h){return h.id>3;}).forEach(function(h){
      if(!h.applicants) h.applicants = [];
      if(!h.answers) h.answers = [];
      if(!HELP_REQUESTS.find(function(x){return x.id===h.id;})) HELP_REQUESTS.push(h);
    });
    // 샘플도 저장본으로 상태 업데이트 (진행중/완료 등)
    arr.filter(function(h){return h.id<=3;}).forEach(function(h){
      var existing = HELP_REQUESTS.find(function(x){return x.id===h.id;});
      if(existing){ existing.status=h.status; existing.applicants=h.applicants||[]; existing.answers=h.answers||[]; existing.selectedHelper=h.selectedHelper; }
    });
    var sid = parseInt(localStorage.getItem('sbt_help_id')||'0');
    if(sid > nextHelpId) nextHelpId = sid;
  }catch(e){}
})();

function getMyCash(){ return currentUser?(currentUser.cash||0):0; }
function updateCashDisplay(){
  var el=document.getElementById('help-cash-display');
  var amt=document.getElementById('my-cash-amount');
  if(!currentUser){if(el)el.style.display='none';return;}
  if(el)el.style.display='flex';
  if(amt)amt.textContent=(getMyCash()).toLocaleString();
  var m=document.getElementById('cash-modal-amount');
  if(m)m.textContent=(getMyCash()).toLocaleString();
}
function chargeCash(amount){
  if(!currentUser){alert('로그인이 필요합니다.');return;}
  currentUser.cash=(currentUser.cash||0)+amount;
  saveUserData();updateCashDisplay();
  alert(amount.toLocaleString()+'C 충전됐습니다! (베타 무료)\n현재 보유: '+getMyCash().toLocaleString()+'C');
}
function openCashModal(){if(!currentUser){alert('로그인이 필요합니다.');return;}updateCashDisplay();document.getElementById('cashModal').style.display='flex';}
function closeCashModal(){document.getElementById('cashModal').style.display='none';}

function switchHelpTab(tab){
  helpTab=tab;
  ['all','open','done'].forEach(function(t){
    var b=document.getElementById('help-tab-'+t);if(!b)return;
    b.style.background=t===tab?'var(--orange)':'transparent';
    b.style.color=t===tab?'#fff':'var(--text-mid)';
    b.style.fontWeight=t===tab?'700':'400';
  });
  renderHelp();
}

function renderHelp(){
  var el=document.getElementById('helpList');if(!el)return;
  updateCashDisplay();
  var cat=(document.getElementById('help-cat-filter')||{}).value||'전체';
  var q=(document.getElementById('help-search')||{}).value||'';
  var list=HELP_REQUESTS.filter(function(h){
    if(helpTab==='open'&&h.status!=='open')return false;
    if(helpTab==='done'&&h.status!=='done')return false;
    if(cat!=='전체'&&h.cat!==cat)return false;
    if(q&&!h.title.includes(q)&&!h.content.includes(q))return false;
    return true;
  }).slice().reverse();
  if(!list.length){el.innerHTML='<div style="text-align:center;padding:48px;color:var(--text-light)">등록된 도움요청이 없습니다.</div>';return;}
  var SC={'open':'var(--orange)','progress':'#1A5080','done':'#1A6B3A','dispute':'#C04040'};
  var SB={'open':'#FFF3E8','progress':'#C8DDF5','done':'#D4EFE1','dispute':'#FFE8E8'};
  var SL={'open':'모집중','progress':'진행중','done':'완료','dispute':'⚖️중재중'};
  el.innerHTML=list.map(function(h){
    var isOwner=currentUser&&currentUser.name===h.author;
    var dday='';
    if(h.deadline&&h.status==='open'){
      var diff=Math.ceil((new Date(h.deadline)-new Date())/(86400000));
      dday=diff<=0?'<span style="color:#C04040;font-size:10px;font-weight:700"> [마감]</span>':diff<=3?'<span style="color:var(--orange);font-size:10px;font-weight:700"> [D-'+diff+']</span>':'<span style="color:var(--text-light);font-size:10px"> [D-'+diff+']</span>';
    }
    return '<div style="background:var(--white);border:1px solid var(--border);border-radius:8px;padding:14px 18px;margin-bottom:8px;cursor:pointer;transition:box-shadow .15s" onclick="openHelpDetail('+h.id+')" onmouseover="this.style.boxShadow=\'0 4px 16px rgba(0,0,0,.08)\'" onmouseout="this.style.boxShadow=\'\'">'
      +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap">'
        +'<span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:3px;background:var(--tag-bg);color:var(--tag-text)">'+h.cat+'</span>'
        +'<span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:3px;background:#E8F0FB;color:#1A5080">'+h.type+'</span>'
        +'<span style="font-size:14px;font-weight:700;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+h.title+'</span>'
        +'<span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:3px;background:'+(SB[h.status]||'#FFF3E8')+';color:'+(SC[h.status]||'var(--orange)')+';">'+(SL[h.status]||h.status)+'</span>'
      +'</div>'
      +'<div style="font-size:12px;color:var(--text-mid);margin-bottom:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+h.content+'</div>'
      +'<div style="display:flex;align-items:center;gap:10px;font-size:11px;color:var(--text-light);flex-wrap:wrap">'
        +'<span>👤 '+h.author+'</span><span>📅 '+h.date+'</span>'
        +(h.deadline?'<span>⏰ ~'+h.deadline+dday+'</span>':'')
        +'<span>💬 답변 '+h.answers.length+'건</span>'
        +'<span style="margin-left:auto;font-size:15px;font-weight:900;color:var(--orange)">💰 '+h.cash.toLocaleString()+'C</span>'
        +((isOwner||isAdmin)?'<button onclick="event.stopPropagation();deleteHelpRequest('+h.id+')" style="padding:2px 8px;font-size:11px;border:1px solid #E0A0A0;border-radius:3px;background:transparent;color:#C04040;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">삭제</button>':'')
      +'</div>'
    +'</div>';
  }).join('');
}

function openHelpDetail(id){
  var h=HELP_REQUESTS.find(function(x){return x.id===id;});if(!h)return;
  var isOwner=currentUser&&currentUser.name===h.author;
  var SC={'open':'var(--orange)','progress':'#1A5080','done':'#1A6B3A','dispute':'#C04040'};
  var SB={'open':'#FFF3E8','progress':'#C8DDF5','done':'#D4EFE1','dispute':'#FFE8E8'};
  var SL={'open':'모집중','progress':'진행중','done':'완료','dispute':'중재중'};
  document.getElementById('hd-modal-title').textContent=h.cat+' · '+h.type+' — '+h.title;

  // ── 신청자 목록 (의뢰인만 보임) ──
  var applicantsHtml='';
  if(isOwner && h.applicants && h.applicants.length && h.status==='open'){
    applicantsHtml='<div style="background:#F5F3EF;border-radius:6px;padding:12px 16px;margin-bottom:14px">'
      +'<div style="font-size:12px;font-weight:700;margin-bottom:8px;color:var(--text-mid)">📋 신청자 '+h.applicants.length+'명 — 한 명을 선택하여 거래를 시작하세요</div>'
      +h.applicants.map(function(ap){
        return '<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border)">'
          +'<span style="font-size:13px;font-weight:600;flex:1">'+ap.name+'</span>'
          +'<span style="font-size:11px;color:var(--text-light)">'+ap.date+'</span>'
          +'<button onclick="selectApplicant('+h.id+',\''+ap.name+'\')" style="padding:4px 12px;background:var(--orange);color:#fff;border:none;border-radius:3px;font-size:11px;font-weight:700;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">선택</button>'
          +'</div>';
      }).join('')
      +'</div>';
  }

  // ── 진행중 상태 (선택된 도움 제공자 + 완료확인 + 중재) ──
  var progressHtml='';
  if(h.status==='progress'){
    var isHelper = currentUser&&currentUser.name===h.selectedHelper;
    progressHtml='<div style="background:#E8F0FB;border:1px solid #B8D0F0;border-radius:6px;padding:14px 16px;margin-bottom:14px">'
      +'<div style="font-size:12px;font-weight:700;color:#1A5080;margin-bottom:6px">🤝 거래 진행중</div>'
      +'<div style="font-size:13px;color:var(--text);margin-bottom:10px">도움 제공자: <strong>'+h.selectedHelper+'</strong></div>'
      +'<div style="display:flex;gap:8px;flex-wrap:wrap">'
      +(isOwner?'<button onclick="confirmHelp('+h.id+')" style="padding:7px 16px;background:#1A6B3A;color:#fff;border:none;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">✅ 도움 확인 완료</button>':'')
      +(isOwner||isHelper?'<button onclick="requestDispute('+h.id+')" style="padding:7px 14px;background:#C04040;color:#fff;border:none;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">⚖️ 중재 요청</button>':'')
      +'</div>'
      +'</div>';
  }

  // ── 중재중 상태 ──
  var disputeHtml='';
  if(h.status==='dispute'){
    disputeHtml='<div style="background:#FFE8E8;border:1px solid #E0A0A0;border-radius:6px;padding:14px 16px;margin-bottom:14px">'
      +'<div style="font-size:12px;font-weight:700;color:#C04040;margin-bottom:6px">⚖️ 중재 진행중 — 캐시 보류</div>'
      +'<div style="font-size:12px;color:var(--text-mid);margin-bottom:10px">관리자가 확인 후 캐시를 지급합니다.<br>보류 캐시: '+h.cash.toLocaleString()+'C</div>'
      +(isAdmin?
        '<div style="display:flex;gap:8px;flex-wrap:wrap">'
        +'<button onclick="resolveDispute('+h.id+',\'requester\')" style="padding:7px 14px;background:#1A5080;color:#fff;border:none;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">의뢰인에게 환불</button>'
        +'<button onclick="resolveDispute('+h.id+',\'helper\')" style="padding:7px 14px;background:#1A6B3A;color:#fff;border:none;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">도움 제공자에게 지급</button>'
        +'</div>'
      :'<div style="font-size:11px;color:var(--text-light)">관리자만 중재 결정 가능합니다.</div>')
      +'</div>';
  }

  // ── 답변/신청 목록 ──
  var answersHtml = h.answers&&h.answers.length
    ?h.answers.map(function(a){
      var isSelectedHelper = h.selectedHelper===a.author;
      return '<div style="background:'+(isSelectedHelper?'#E8F5EE':'var(--surface)')+';border:1px solid '+(isSelectedHelper?'#4A8A4A':'var(--border)')+';border-radius:6px;padding:14px 16px;margin-bottom:8px">'
        +(isSelectedHelper?'<div style="font-size:10px;font-weight:700;color:#1A6B3A;margin-bottom:6px">🤝 선택된 도움 제공자</div>':'')
        +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
          +'<strong style="font-size:13px;color:#3A6BC8">'+a.author+'</strong>'
          +'<span style="font-size:11px;color:var(--text-light)">'+a.date+'</span>'
        +'</div>'
        +'<div style="font-size:13px;color:var(--text);line-height:1.7">'+a.content+'</div>'
        +'</div>';
    }).join('')
    :'<div style="text-align:center;padding:20px;color:var(--text-light);font-size:13px">아직 도움 신청이 없습니다.</div>';

  // ── 신청 버튼 (모집중이고 본인 아닌 경우) ──
  var canApply = currentUser&&!isOwner&&h.status==='open';
  var alreadyApplied = canApply&&h.applicants&&h.applicants.find(function(ap){return ap.name===currentUser.name;});
  var alreadyAnswered= canApply&&h.answers&&h.answers.find(function(a){return a.author===currentUser.name;});

  document.getElementById('hd-modal-body').innerHTML=
    '<div style="margin-bottom:16px">'
      +'<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">'
        +'<span style="font-size:11px;padding:2px 8px;border-radius:3px;background:var(--tag-bg);color:var(--tag-text);font-weight:600">'+h.cat+'</span>'
        +'<span style="font-size:11px;padding:2px 8px;border-radius:3px;background:#E8F0FB;color:#1A5080;font-weight:600">'+h.type+'</span>'
        +'<span style="font-size:11px;padding:2px 8px;border-radius:3px;background:'+(SB[h.status]||'')+';color:'+(SC[h.status]||'')+';font-weight:700">'+(SL[h.status]||'')+'</span>'
      +'</div>'
      +'<div style="font-size:14px;color:var(--text);line-height:1.8;margin-bottom:12px;white-space:pre-wrap">'+h.content+'</div>'
      +(h.images&&h.images.length?'<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">'+h.images.map(function(s){return '<img src="'+s+'" style="max-width:200px;max-height:150px;border-radius:6px;border:1px solid var(--border);object-fit:cover">';}).join('')+'</div>':'')
      +'<div style="display:flex;flex-wrap:wrap;gap:12px;font-size:12px;color:var(--text-light);padding:10px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin-bottom:14px">'
        +'<span>👤 <strong style="color:var(--text)">'+h.author+'</strong></span>'
        +(h.deadline?'<span>⏰ ~'+h.deadline+'</span>':'')
        +'<span>📅 '+h.date+'</span>'
        +(h.selectedHelper?'<span>🤝 <strong style="color:#1A6B3A">'+h.selectedHelper+'</strong></span>':'')
        +'<span style="margin-left:auto;font-size:16px;font-weight:900;color:var(--orange)">💰 '+h.cash.toLocaleString()+'C <span style="font-size:10px;font-weight:400;color:var(--text-light)">(지급 '+Math.round(h.cash*0.90).toLocaleString()+'C)</span></span>'
      +'</div>'
    +'</div>'
    +applicantsHtml
    +progressHtml
    +disputeHtml
    +'<div style="font-size:13px;font-weight:700;margin-bottom:10px">📝 도움 신청 '+((h.answers||[]).length)+'건</div>'
    +answersHtml
    +(canApply&&!alreadyApplied&&!alreadyAnswered
      ?'<div style="margin-top:14px;padding:16px;background:#F5F3EF;border-radius:8px;border:1px solid var(--border)">'
        +'<div style="font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:8px">✍️ 도움 신청하기</div>'
        +'<textarea id="help-answer-input-'+h.id+'" rows="3" placeholder="도움 가능 여부와 방법을 간략히 적어주세요." style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:\'Noto Sans KR\',sans-serif;outline:none;resize:vertical;box-sizing:border-box;margin-bottom:8px"></textarea>'
        +'<div style="display:flex;gap:8px;justify-content:flex-end">'
          +'<button onclick="applyHelp('+h.id+')" style="padding:8px 20px;background:var(--orange);color:#fff;border:none;border-radius:4px;font-size:13px;font-weight:700;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">신청하기</button>'
        +'</div>'
      +'</div>'
      :(alreadyApplied?'<div style="margin-top:10px;text-align:center;color:#1A6B3A;font-size:12px;font-weight:600">✅ 신청 완료. 의뢰인이 선택할 때까지 기다려주세요.</div>':'')
      +(alreadyAnswered?'<div style="margin-top:10px;text-align:center;color:#1A6B3A;font-size:12px;font-weight:600">✅ 이미 신청했습니다.</div>':''));

  document.getElementById('helpDetailModal').style.display='flex';
}
function closeHelpDetailModal(){document.getElementById('helpDetailModal').style.display='none';}

// 도움 신청하기
function applyHelp(helpId){
  if(!currentUser){alert('로그인이 필요합니다.');return;}
  var h=HELP_REQUESTS.find(function(x){return x.id===helpId;});if(!h)return;
  if(currentUser.name===h.author){alert('본인 요청에는 신청할 수 없습니다.');return;}
  if(!h.applicants) h.applicants=[];
  if(!h.answers)    h.answers=[];
  if(h.applicants.find(function(ap){return ap.name===currentUser.name;})){
    alert('이미 신청했습니다.'); return;
  }
  var inp=document.getElementById('help-answer-input-'+helpId);
  var text=inp?inp.value.trim():'';
  if(!text){alert('신청 내용을 입력해주세요.');return;}
  h.applicants.push({name:currentUser.name, date:new Date().toLocaleDateString('ko-KR')});
  h.answers.push({id:nextHelpAnswerId++, author:currentUser.name, content:text, date:new Date().toLocaleDateString('ko-KR'), adopted:false});
  if(typeof addExp==='function'){addExp(currentUser,EXP_RULES['질문 답변']||10,'도움요청 신청');saveUserData();}
  saveHelp();
  closeHelpDetailModal(); renderHelp();
  alert('신청이 완료됐습니다! (+10pt)\n의뢰인이 선택하면 거래가 시작됩니다.');
}

// 의뢰인이 신청자 선택 → 진행중으로 전환
function selectApplicant(helpId, helperName){
  if(!currentUser)return;
  var h=HELP_REQUESTS.find(function(x){return x.id===helpId;});if(!h)return;
  if(currentUser.name!==h.author){alert('의뢰인만 선택 가능합니다.');return;}
  if(!confirm(helperName+'님을 도움 제공자로 선택하시겠습니까?\n거래가 시작되며 캐시가 예치됩니다.'))return;
  h.selectedHelper = helperName;
  h.status = 'progress';
  saveHelp();
  closeHelpDetailModal(); renderHelp();
  alert(helperName+'님이 선택됐습니다.\n도움을 받은 후 "도움 확인 완료"를 눌러주세요.');
}

// 도움 확인 완료 → 캐시 지급
function confirmHelp(helpId){
  if(!currentUser)return;
  var h=HELP_REQUESTS.find(function(x){return x.id===helpId;});if(!h)return;
  if(currentUser.name!==h.author){alert('의뢰인만 완료 확인 가능합니다.');return;}
  var payout=Math.round(h.cash*0.90);
  if(!confirm('도움을 받으셨나요? 확인하면 '+h.selectedHelper+'님에게 '+payout.toLocaleString()+'전이 지급됩니다.\n(수수료 10% 제외)'))return;

  // ── DB에 실제 캐시 지급 ──
  var uid = null;
  try { var sess=JSON.parse(localStorage.getItem('sbt_session')||'{}'); uid=sess.id||sess.db_id; } catch(e){}
  if(uid){
    fetch('/api/help.php?action=pay_helper&uid='+encodeURIComponent(uid), {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({helper_name: h.selectedHelper, amount: payout, title: h.title})
    })
    .then(function(r){ return r.json(); })
    .then(function(res){
      if(!res.ok) console.warn('캐시 DB 지급 실패:', res.msg);
    })
    .catch(function(e){ console.warn('캐시 지급 API 오류:', e); });
  }

  // 로컬 상태 업데이트
  h.status='done';
  var helper=USERS.find(function(u){return u.name===h.selectedHelper;});
  if(helper){
    helper.cash=(helper.cash||0)+payout;
    addCashLog(helper, payout, '도움요청 채택 지급', h.title);
  }
  saveHelp();
  closeHelpDetailModal(); renderHelp();
  alert('완료! '+h.selectedHelper+'님에게 '+payout.toLocaleString()+'전이 지급됐습니다.');
}

// 중재 요청 → 캐시 보류
function requestDispute(helpId){
  if(!currentUser)return;
  var h=HELP_REQUESTS.find(function(x){return x.id===helpId;});if(!h)return;
  var isParty=currentUser.name===h.author||currentUser.name===h.selectedHelper;
  if(!isParty){alert('거래 당사자만 중재 요청 가능합니다.');return;}
  if(!confirm('중재를 요청하면 캐시가 보류되고 관리자가 결정합니다.\n계속하시겠습니까?'))return;
  h.status='dispute';
  h.disputeBy=currentUser.name;
  h.disputeDate=new Date().toLocaleDateString('ko-KR');
  saveHelp();
  closeHelpDetailModal(); renderHelp();
  alert('중재 요청이 접수됐습니다.\n캐시는 관리자 결정 후 지급됩니다.');
}

// 관리자 중재 결정
function resolveDispute(helpId, to){
  if(!isAdmin){alert('관리자만 가능합니다.');return;}
  var h=HELP_REQUESTS.find(function(x){return x.id===helpId;});if(!h)return;
  var who = to==='requester' ? h.author : h.selectedHelper;
  var label = to==='requester' ? '의뢰인('+h.author+')' : '도움 제공자('+h.selectedHelper+')';
  if(!confirm(label+'에게 '+h.cash.toLocaleString()+'C를 지급하시겠습니까?'))return;
  var target=USERS.find(function(u){return u.name===who;});
  if(target){ target.cash=(target.cash||0)+h.cash; addCashLog(target, h.cash, '중재 지급', h.title); }
  h.status='done';
  h.resolvedTo=who;
  saveHelp();
  closeHelpDetailModal(); renderHelp();
  alert('중재 완료: '+label+'에게 '+h.cash.toLocaleString()+'C 지급됐습니다.');
}

function submitHelpAnswer(helpId){ applyHelp(helpId); }

function adoptAnswer(helpId,answerId){
  var h=HELP_REQUESTS.find(function(x){return x.id===helpId;});if(!h)return;
  var a=h.answers.find(function(x){return x.id===answerId;});if(!a)return;
  selectApplicant(helpId, a.author);
}

function openHelpWriteModal(editId){
  if(!currentUser){alert('로그인이 필요합니다.');return;}
  editingHelpId=editId||null; helpWriteImages=[];
  ['hw-title','hw-content','hw-cash','hw-deadline'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('hw-img-preview').innerHTML='';
  document.getElementById('hw-msg').style.display='none';
  document.getElementById('hw-cash-preview').textContent='';
  if(editId){
    var h=HELP_REQUESTS.find(function(x){return x.id===editId;});
    if(h){document.getElementById('hw-cat').value=h.cat;document.getElementById('hw-type').value=h.type;document.getElementById('hw-title').value=h.title;document.getElementById('hw-content').value=h.content;document.getElementById('hw-cash').value=h.cash;document.getElementById('hw-deadline').value=h.deadline||'';helpWriteImages=h.images.slice();updateCashPreview();}
    document.getElementById('helpWriteTitle').textContent='✏️ 요청 수정';
  } else { document.getElementById('helpWriteTitle').textContent='✏️ 도움 요청하기'; }
  document.getElementById('helpWriteModal').style.display='flex';
}
function closeHelpWriteModal(){document.getElementById('helpWriteModal').style.display='none';}

function updateCashPreview(){
  var val=parseInt((document.getElementById('hw-cash')||{}).value)||0;
  var el=document.getElementById('hw-cash-preview');if(!el)return;
  el.textContent=val>0?'→ 도움 제공자 수령: '+Math.round(val*0.90).toLocaleString()+'C (수수료 '+Math.round(val*0.10).toLocaleString()+'C 제외)':'';
}
function loadHelpImg(input){
  var file=input.files[0];if(!file)return;
  var reader=new FileReader();
  reader.onload=function(e){
    helpWriteImages.push(e.target.result);
    var prev=document.getElementById('hw-img-preview');
    if(prev)prev.innerHTML+='<img src="'+e.target.result+'" style="width:80px;height:60px;object-fit:cover;border-radius:4px;border:1px solid var(--border)">';
  };
  reader.readAsDataURL(file);input.value='';
}
function submitHelpRequest(){
  var cat=document.getElementById('hw-cat').value;
  var type=document.getElementById('hw-type').value;
  var title=document.getElementById('hw-title').value.trim();
  var content=document.getElementById('hw-content').value.trim();
  var cash=parseInt(document.getElementById('hw-cash').value)||0;
  var deadline=document.getElementById('hw-deadline').value;
  var msg=document.getElementById('hw-msg');
  if(!title){msg.textContent='제목을 입력해주세요.';msg.style.display='block';return;}
  if(!content){msg.textContent='상세 내용을 입력해주세요.';msg.style.display='block';return;}
  if(cash<100){msg.textContent='캐시는 최소 100C 이상 설정해주세요.';msg.style.display='block';return;}
  if(!editingHelpId&&getMyCash()<cash){msg.textContent='보유 캐시가 부족합니다. (보유: '+getMyCash().toLocaleString()+'C)';msg.style.display='block';return;}
  if(editingHelpId){
    var h=HELP_REQUESTS.find(function(x){return x.id===editingHelpId;});
    if(h){h.cat=cat;h.type=type;h.title=title;h.content=content;h.cash=cash;h.deadline=deadline;h.images=helpWriteImages.slice();}
  } else {
    currentUser.cash=(currentUser.cash||0)-cash;
    addCashLog(currentUser, -cash, '도움요청 등록 차감', document.getElementById('hw-title').value||'(제목없음)');
    saveUserData();updateCashDisplay();
    HELP_REQUESTS.push({id:nextHelpId++,cat:cat,type:type,title:title,content:content,author:currentUser.name,date:new Date().toLocaleDateString('ko-KR'),deadline:deadline,cash:cash,status:'open',images:helpWriteImages.slice(),answers:[],applicants:[]});
  }
  saveHelp();
  closeHelpWriteModal();renderHelp();
  if(!editingHelpId)alert('도움요청이 등록됐습니다!\n캐시 '+cash.toLocaleString()+'C가 예치됐습니다.');
}
function deleteHelpRequest(id){
  if(!confirm('삭제하시겠습니까?'))return;
  var h=HELP_REQUESTS.find(function(x){return x.id===id;});
  if(h&&h.status==='open'){
    var req=USERS.find(function(u){return u.name===h.author;});
    if(req){ req.cash=(req.cash||0)+h.cash; addCashLog(req, h.cash, '도움요청 취소 환불', h.title); }
    if(currentUser&&currentUser.name===h.author){ currentUser.cash=(currentUser.cash||0)+h.cash; }
    saveUserData();updateCashDisplay();
  }
  HELP_REQUESTS=HELP_REQUESTS.filter(function(x){return x.id!==id;});
  saveHelp();
  renderHelp();
}

function naverLogin(){
  // 팝업창으로 네이버 로그인 열기
  var popup = window.open(
    'naver_login.php',
    'naverLogin',
    'width=500,height=600,scrollbars=yes'
  );
  if(!popup){
    // 팝업 차단된 경우 현재 창에서 이동
    location.href = 'naver_login.php';
  }
}

// 네이버 콜백에서 호출되는 함수

/* ══════════════════════════════════════════════
   도움요청 HTML 초기화
══════════════════════════════════════════════ */
function initHelpHTML(){
  document.getElementById('page-help').innerHTML = `
  <div style="max-width:960px;margin:0 auto;padding:32px 40px">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:8px">
      <div>
        <h2 style="font-size:24px;font-weight:700;margin-bottom:6px">🔧 도움요청</h2>
        <p style="font-size:14px;color:var(--text-mid)">설계변경·도면작성·자료조사 등 전문 도움을 요청하고 캐시로 보상하세요.</p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <div id="help-cash-display" style="display:none;padding:7px 14px;background:#2A1A0A;border:1px solid var(--orange);border-radius:6px;font-size:13px;color:var(--orange);font-weight:700;cursor:pointer" onclick="openCashModal()">
          💰 <span id="my-cash-amount">0</span>C
        </div>
        <button onclick="openHelpWriteModal(null)" style="padding:9px 18px;background:var(--orange);color:#fff;border:none;border-radius:4px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">✏️ 도움 요청하기</button>
      </div>
    </div>
    <div style="background:#1A2A1A;border:1px solid #3A5A3A;border-radius:6px;padding:12px 18px;margin-bottom:20px;font-size:12px;color:#A8C8A8;line-height:1.8">
      💡 <strong style="color:#C8F0C8">이용 안내</strong> &nbsp;·&nbsp; 의뢰인이 캐시를 설정하여 요청 → 도움 제공자가 완료답변 등록 → 의뢰인 채택 → 캐시 지급 (수수료 10% 제외)<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;캐시는 포인트 형태로 운영되며 추후 실제 결제 연동 예정입니다 (현재 베타 — 포인트만 표시)
    </div>
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:16px;flex-wrap:wrap">
      <button id="help-tab-all"  onclick="switchHelpTab('all')"  style="padding:7px 14px;background:var(--orange);color:#fff;border:none;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">전체</button>
      <button id="help-tab-open" onclick="switchHelpTab('open')" style="padding:7px 14px;background:transparent;color:var(--text-mid);border:1px solid var(--border);border-radius:4px;font-size:12px;cursor:pointer;font-family:'Noto Sans KR',sans-serif">모집중</button>
      <button id="help-tab-done" onclick="switchHelpTab('done')" style="padding:7px 14px;background:transparent;color:var(--text-mid);border:1px solid var(--border);border-radius:4px;font-size:12px;cursor:pointer;font-family:'Noto Sans KR',sans-serif">완료</button>
      <select id="help-cat-filter" onchange="renderHelp()" style="padding:7px 10px;border:1px solid var(--border);border-radius:4px;font-size:12px;font-family:'Noto Sans KR',sans-serif;outline:none;color:var(--text-mid)">
        <option value="전체">전체 공종</option><option value="설비">설비</option><option value="전기">전기</option>
        <option value="소방">소방</option><option value="골조">골조</option><option value="토목">토목</option>
        <option value="내장">내장</option><option value="기타">기타</option>
      </select>
      <input type="text" id="help-search" placeholder="🔍 제목 검색..." oninput="renderHelp()"
        style="flex:1;min-width:140px;padding:7px 12px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none">
    </div>
    <div id="helpList"></div>
  </div>
`;
  document.getElementById('helpWriteModal').innerHTML = `
  <div style="background:var(--white);border-radius:8px;width:620px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3)">
    <div style="background:var(--dark);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-radius:8px 8px 0 0;position:sticky;top:0;z-index:1">
      <h3 id="helpWriteTitle" style="font-size:15px;font-weight:700;color:#fff">✏️ 도움 요청하기</h3>
      <button onclick="closeHelpWriteModal()" style="background:none;border:none;color:#888;cursor:pointer;font-size:18px">✕</button>
    </div>
    <div style="padding:20px 24px;display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;gap:10px">
        <div style="flex:1">
          <label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:5px">공종 <span style="color:var(--orange)">*</span></label>
          <select id="hw-cat" style="width:100%;padding:8px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none">
            <option>설비</option><option>전기</option><option>소방</option><option>골조</option><option>토목</option><option>내장</option><option>기타</option>
          </select>
        </div>
        <div style="flex:1">
          <label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:5px">요청 유형 <span style="color:var(--orange)">*</span></label>
          <select id="hw-type" style="width:100%;padding:8px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none">
            <option>설계변경</option><option>도면작성</option><option>자료조사</option><option>사진자료</option><option>계산서작성</option><option>시방서작성</option><option>기타</option>
          </select>
        </div>
      </div>
      <div>
        <label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:5px">제목 <span style="color:var(--orange)">*</span></label>
        <input type="text" id="hw-title" placeholder="요청 내용을 간단히 적어주세요"
          style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;box-sizing:border-box">
      </div>
      <div>
        <label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:5px">상세 내용 <span style="color:var(--orange)">*</span></label>
        <textarea id="hw-content" rows="5" placeholder="어떤 도움이 필요한지 자세히 적어주세요&#10;예) 강남동 아파트 기계설비 MCC판넬 설계변경 도면 1매 필요합니다."
          style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;resize:vertical;box-sizing:border-box"></textarea>
      </div>
      <div>
        <label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:5px">마감일</label>
        <input type="date" id="hw-deadline" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;box-sizing:border-box">
      </div>
      <div>
        <label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:5px">제공 캐시 <span style="color:var(--orange)">*</span>
          <span style="font-size:10px;font-weight:400;color:var(--text-light)"> (수수료 10% 제외 후 도움 제공자에게 지급)</span>
        </label>
        <div style="display:flex;align-items:center;gap:8px">
          <input type="number" id="hw-cash" min="100" step="100" placeholder="예) 5000"
            style="flex:1;padding:8px 12px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none" oninput="updateCashPreview()">
          <span style="font-size:13px;color:var(--text-mid)">C</span>
        </div>
        <div id="hw-cash-preview" style="font-size:11px;color:var(--text-light);margin-top:4px"></div>
      </div>
      <div>
        <label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:5px">참고 이미지 (선택)</label>
        <div id="hw-img-area" onclick="document.getElementById('hw-img-input').click()"
          style="border:2px dashed var(--border);border-radius:6px;padding:16px;text-align:center;cursor:pointer;font-size:12px;color:var(--text-light)">
          클릭하여 이미지 첨부 (도면·사진 등)
        </div>
        <input type="file" id="hw-img-input" accept="image/*" style="display:none" onchange="loadHelpImg(this)">
        <div id="hw-img-preview" style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap"></div>
      </div>
      <div id="hw-msg" style="font-size:12px;color:#C04040;display:none"></div>
    </div>
    <div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;background:#FAFAF8;border-radius:0 0 8px 8px">
      <button onclick="closeHelpWriteModal()" style="padding:9px 16px;background:transparent;border:1px solid var(--border);border-radius:4px;font-size:13px;color:var(--text-mid);cursor:pointer;font-family:'Noto Sans KR',sans-serif">취소</button>
      <button onclick="submitHelpRequest()" style="padding:9px 20px;background:var(--orange);color:#fff;border:none;border-radius:4px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">요청 등록</button>
    </div>
  </div>
`;
  document.getElementById('helpDetailModal').innerHTML = `
  <div style="background:var(--white);border-radius:8px;width:680px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3)">
    <div style="background:var(--dark);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-radius:8px 8px 0 0;position:sticky;top:0;z-index:1">
      <h3 id="hd-modal-title" style="font-size:15px;font-weight:700;color:#fff"></h3>
      <button onclick="closeHelpDetailModal()" style="background:none;border:none;color:#888;cursor:pointer;font-size:18px">✕</button>
    </div>
    <div id="hd-modal-body" style="padding:20px 24px"></div>
  </div>
`;
  document.getElementById('cashModal').innerHTML = `
  <div style="background:var(--white);border-radius:8px;width:400px;box-shadow:0 20px 60px rgba(0,0,0,.3)">
    <div style="background:var(--dark);padding:14px 20px;display:flex;align-items:center;justify-content:space-between;border-radius:8px 8px 0 0">
      <h3 style="font-size:14px;font-weight:700;color:#fff">💰 전 충전</h3>
      <button onclick="closeCashModal()" style="background:none;border:none;color:#888;cursor:pointer;font-size:18px">✕</button>
    </div>
    <div style="padding:20px 24px">
      <div style="background:#1A2A1A;border-radius:6px;padding:12px 16px;margin-bottom:16px;text-align:center">
        <div style="font-size:12px;color:#A8C8A8;margin-bottom:4px">현재 보유 전</div>
        <div style="font-size:24px;font-weight:900;color:var(--orange)"><span id="cash-modal-amount">0</span>전</div>
      </div>
      <div style="font-size:13px;color:var(--text-mid);margin-bottom:16px;line-height:1.6">
        계좌 입금 후 충전 신청을 하시면<br>확인 후 전이 지급됩니다.
      </div>
      <a href="charge_request.php" style="display:block;padding:12px;background:var(--orange);color:#fff;border-radius:6px;font-size:14px;font-weight:700;text-align:center;text-decoration:none;font-family:'Noto Sans KR',sans-serif">전 충전 신청하기 →</a>
    </div>
    <div style="padding:12px 20px;border-top:1px solid var(--border);text-align:right;background:#FAFAF8;border-radius:0 0 8px 8px">
      <button onclick="closeCashModal()" style="padding:8px 20px;background:var(--dark);color:#C8C6C0;border:none;border-radius:4px;font-size:13px;cursor:pointer;font-family:'Noto Sans KR',sans-serif">닫기</button>
    </div>
  </div>
`;
  // 글쓰기 모달: 외부 클릭으로 닫히지 않음
  var hwm = document.getElementById('helpWriteModal');
  if(hwm) hwm.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:3000;display:none;align-items:center;justify-content:center';
  // 읽기/기타 모달: 외부 클릭으로 닫힘
  ['helpDetailModal','cashModal'].forEach(function(id){
    var m=document.getElementById(id);
    if(m){ m.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:3000;display:none;align-items:center;justify-content:center';
           m.addEventListener('click',function(e){ if(e.target===this) this.style.display='none'; }); }
  });
}
document.addEventListener('DOMContentLoaded', initHelpHTML);