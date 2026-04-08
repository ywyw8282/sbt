function naverLoginCallback(userData){
  if(!userData || !userData.id) return;
  // USERS 배열에 없으면 추가
  if(!USERS.find(function(u){ return u.id===userData.id; })){
    USERS.push({
      id:    userData.id,
      pw:    '',
      name:  userData.name,
      grade: userData.grade || '용역',
      exp: 0, visitDays:0, lastVisit:'', postCount:0, commentCount:0, expLog:[],
      email: userData.email || '',
      type:  'naver'
    });
  }
  currentUser = USERS.find(function(u){ return u.id===userData.id; });
  isAdmin = false;
  // 네이버 로그인도 세션 저장 (F5 유지)
  try{
    localStorage.setItem('sbt_session', JSON.stringify({
      type:'user', id:currentUser.id, name:currentUser.name,
      grade:currentUser.grade||'용역', utype:'naver', cash:currentUser.cash||0
    }));
    var su2=JSON.parse(localStorage.getItem('st_users')||'[]');
    var ni=su2.findIndex(function(x){return x.id===currentUser.id;});
    if(ni>=0) su2[ni]=currentUser; else su2.push(currentUser);
    localStorage.setItem('st_users', JSON.stringify(su2));
  }catch(e){}
  closeLoginModal();
  closeJoinModal();
  activateUserMode(currentUser);
  alert('🎉 ' + userData.name + '님, 네이버로 로그인됐습니다!');
}

// 페이지 로드 시 네이버 콜백 결과 확인 (리다이렉트 방식)
(function checkNaverLoginResult(){
  try{
    var stored = localStorage.getItem('naver_login_user');
    if(stored){
      localStorage.removeItem('naver_login_user');
      var userData = JSON.parse(stored);
      if(userData && userData.id){
        setTimeout(function(){ naverLoginCallback(userData); }, 500);
      }
    }
  } catch(e){}
})();
var joinVerifyCode   = '';   // 발송된 인증코드
var joinVerifyEmail  = '';   // 인증 대상 이메일
var joinVerified     = false;
var joinIdChecked    = false;
var joinTimerInt     = null;
var joinTimerLeft    = 0;

function openJoinModal(){
  resetJoinModal();
  document.getElementById('joinModal').style.display = 'flex';
}
function closeJoinModal(){
  document.getElementById('joinModal').style.display = 'none';
  clearInterval(joinTimerInt);
}
function resetJoinModal(){
  joinVerifyCode=''; joinVerifyEmail=''; joinVerified=false; joinIdChecked=false;
  clearInterval(joinTimerInt);
  ['joinEmail','joinVerifyCode','joinId','joinPw','joinPw2','joinRealName','joinName','joinBirth'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.value='';
  });
  var gEl=document.getElementById('joinGender'); if(gEl) gEl.value='';
  ['joinEmailMsg','joinVerifyArea','joinCodeMsg','joinIdMsg','joinPwMsg','joinStep2Msg','joinStep3Msg'].forEach(function(id){
    var el=document.getElementById(id); if(el){el.style.display='none';el.textContent='';}
  });
  document.getElementById('agree1').checked=false;
  document.getElementById('agree2').checked=false;
  document.getElementById('agree3').checked=false;
  document.getElementById('agreeAll').checked=false;
  setJoinStep(1);
}
function setJoinStep(step){
  [1,2].forEach(function(s){
    var el=document.getElementById('joinStep'+s);
    if(el){ el.style.display = s===step?'flex':'none'; if(s===step) el.style.flexDirection='column'; }
    var dot=document.getElementById('stepDot'+s);
    if(dot){
      dot.style.background = s<step?'#4A8A4A':s===step?'var(--orange)':'var(--border)';
      dot.style.color = s<=step?'#fff':'var(--text-light)';
    }
  });
}

// STEP1: 인증코드 발송
function sendVerifyCode(){
  var email = (document.getElementById('joinEmail').value||'').trim();
  var msgEl = document.getElementById('joinEmailMsg');
  if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    msgEl.textContent='올바른 이메일을 입력해주세요.'; msgEl.style.color='#C04040'; msgEl.style.display='block'; return;
  }
  // 이미 가입된 이메일 체크
  var existing = USERS.find(function(u){ return u.email===email; });
  if(existing){
    msgEl.textContent='이미 가입된 이메일입니다.'; msgEl.style.color='#C04040'; msgEl.style.display='block'; return;
  }
  joinVerifyEmail = email;
  joinVerified    = false;

  var btn = document.querySelector('[onclick="sendVerifyCode()"]');
  if(btn){ btn.disabled=true; btn.textContent='발송 중...'; }

  fetch('/send_verify.php', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({email: email})
  })
  .then(function(r){ return r.json(); })
  .then(function(res){
    if(btn){ btn.disabled=false; btn.textContent='재발송'; }
    if(!res.ok){
      msgEl.textContent = res.msg || '발송 오류가 발생했습니다.';
      msgEl.style.color='#C04040'; msgEl.style.display='block'; return;
    }
    // 닷홈 mail() 실패 fallback: 서버가 dev_code를 반환한 경우
    if(res.dev_code){
      joinVerifyCode = res.dev_code;
      msgEl.textContent='⚠️ 이메일 서버 미설정 — 인증코드: '+res.dev_code;
      msgEl.style.color='#B05000'; msgEl.style.display='block';
    } else {
      joinVerifyCode = '';
      msgEl.textContent='✅ 인증코드를 이메일로 발송했습니다.';
      msgEl.style.color='#1A6B3A'; msgEl.style.display='block';
    }
    document.getElementById('joinVerifyArea').style.display='block';
    // 5분 타이머
    joinTimerLeft = 300;
    clearInterval(joinTimerInt);
    joinTimerInt = setInterval(function(){
      joinTimerLeft--;
      var t = document.getElementById('joinCodeTimer');
      if(t) t.textContent = '남은 시간: '+Math.floor(joinTimerLeft/60)+'분 '+('0'+joinTimerLeft%60).slice(-2)+'초';
      if(joinTimerLeft<=0){
        clearInterval(joinTimerInt);
        joinVerifyCode='';
        if(t) t.textContent='인증코드가 만료됐습니다. 재발송해주세요.';
      }
    },1000);
  })
  .catch(function(){
    if(btn){ btn.disabled=false; btn.textContent='재발송'; }
    msgEl.textContent='네트워크 오류가 발생했습니다.';
    msgEl.style.color='#C04040'; msgEl.style.display='block';
  });
}

// STEP1: 코드 확인
function checkVerifyCode(){
  var input  = (document.getElementById('joinVerifyCode').value||'').trim();
  var msgEl  = document.getElementById('joinCodeMsg');
  msgEl.style.display='block';

  if(!input){ msgEl.textContent='인증코드를 입력해주세요.'; msgEl.style.color='#C04040'; return; }

  // dev_code 방식(fallback): joinVerifyCode에 코드가 직접 저장된 경우
  if(joinVerifyCode){
    if(input !== joinVerifyCode){
      msgEl.textContent='인증코드가 올바르지 않습니다.'; msgEl.style.color='#C04040'; return;
    }
    clearInterval(joinTimerInt);
    joinVerified = true;
    msgEl.textContent='✅ 인증 완료!'; msgEl.style.color='#1A6B3A';
    document.getElementById('joinEmailLabel').textContent = joinVerifyEmail;
    setTimeout(function(){ setJoinStep(2); }, 700);
    return;
  }

  // 서버 검증
  fetch('check_verify.php', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({email: joinVerifyEmail, code: input})
  })
  .then(function(r){ return r.json(); })
  .then(function(res){
    if(!res.ok){
      msgEl.textContent = res.msg; msgEl.style.color='#C04040'; return;
    }
    clearInterval(joinTimerInt);
    joinVerified = true;
    msgEl.textContent='✅ 인증 완료!'; msgEl.style.color='#1A6B3A';
    document.getElementById('joinEmailLabel').textContent = joinVerifyEmail;
    setTimeout(function(){ setJoinStep(2); }, 700);
  })
  .catch(function(){
    msgEl.textContent='네트워크 오류가 발생했습니다.'; msgEl.style.color='#C04040';
  });
}

// 성별 라디오 UI 업데이트
function updateGenderLabel(){
  var radios = document.querySelectorAll('[name="joinGenderRadio"]');
  radios.forEach(function(r){
    var lbl = r.parentElement;
    lbl.style.borderColor = r.checked ? 'var(--orange)' : 'var(--border)';
    lbl.style.background  = r.checked ? '#FFF3EC' : '';
  });
}

// STEP2: 아이디 중복확인
function checkIdDup(){
  var id    = (document.getElementById('joinId').value||'').trim();
  var msgEl = document.getElementById('joinIdMsg');
  msgEl.style.display='block';
  joinIdChecked = false;

  if(!id || id.length < 4){
    msgEl.textContent='아이디는 4자 이상이어야 합니다.';
    msgEl.style.color='#C04040'; return;
  }
  if(!/^[a-zA-Z0-9_]+$/.test(id)){
    msgEl.textContent='영문, 숫자, _만 사용 가능합니다.';
    msgEl.style.color='#C04040'; return;
  }

  msgEl.textContent='확인 중...'; msgEl.style.color='var(--text-light)';

  fetch(API_AUTH+'?action=check_id', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({username: id})
  })
  .then(function(r){ return r.json(); })
  .then(function(res){
    msgEl.style.display='block';
    if(res.available){
      msgEl.textContent='✅ 사용 가능한 아이디입니다.';
      msgEl.style.color='#1A6B3A';
      joinIdChecked = true;
    } else {
      msgEl.textContent='❌ ' + (res.msg || '이미 사용 중인 아이디입니다.');
      msgEl.style.color='#C04040';
      joinIdChecked = false;
    }
  })
  .catch(function(){
    // 서버 오류 시 로컬 확인으로 폴백
    if(id==='admin'){ msgEl.textContent='❌ 사용할 수 없는 아이디입니다.'; msgEl.style.color='#C04040'; return; }
    msgEl.textContent='✅ 사용 가능합니다. (오프라인 확인)';
    msgEl.style.color='#1A6B3A';
    joinIdChecked = true;
  });
}

// STEP1: 다음 버튼
function submitJoinStep1(){
  var id       = (document.getElementById('joinId').value||'').trim();
  var pw       = document.getElementById('joinPw').value||'';
  var pw2      = document.getElementById('joinPw2').value||'';
  var realName = (document.getElementById('joinRealName').value||'').trim();
  var nickname = (document.getElementById('joinName').value||'').trim();
  var birth    = (document.getElementById('joinBirth').value||'').trim();
  var gender   = (document.getElementById('joinGender').value||'').trim();
  var msgEl    = document.getElementById('joinStep1Msg');
  msgEl.style.display='none';

  // 미기입 항목 모두 수집해서 한번에 안내
  var missing = [];
  if(!id||id.length<4)         missing.push('아이디(4자 이상)');
  else if(!joinIdChecked)      missing.push('아이디 중복확인');
  if(!pw)                      missing.push('비밀번호');
  else if(pw.length<8||!/[a-zA-Z]/.test(pw)||!/[0-9]/.test(pw))
                               missing.push('비밀번호(8자 이상, 영문+숫자 포함)');
  else if(pw!==pw2)            missing.push('비밀번호 확인(불일치)');
  if(!realName)                missing.push('이름');
  if(!nickname)                missing.push('별명(닉네임)');
  if(!birth)                   missing.push('생년월일');
  if(!gender)                  missing.push('성별');

  if(missing.length){
    msgEl.textContent = '다음 항목을 확인해주세요: ' + missing.join(', ');
    msgEl.style.display='block';
    return;
  }
  setJoinStep(2);
}

// 전체 동의 토글
function toggleAllAgree(chk){
  document.querySelectorAll('.agreeChk').forEach(function(c){ c.checked=chk.checked; });
}

// STEP3: 가입 완료
function submitJoinFinal(){
  var msgEl    = document.getElementById('joinStep2Msg');
  msgEl.style.display='none';
  if(!document.getElementById('agree1').checked||!document.getElementById('agree2').checked){
    msgEl.textContent='필수 약관에 동의해주세요.'; msgEl.style.display='block'; return;
  }
  // reCAPTCHA 확인
  var recaptchaRes = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : '';
  if(!recaptchaRes){
    msgEl.textContent='로봇이 아닙니다 체크를 완료해주세요.'; msgEl.style.display='block'; return;
  }
  var id       = document.getElementById('joinId').value.trim();
  var pw       = document.getElementById('joinPw').value;
  var realName = document.getElementById('joinRealName').value.trim();
  var nickname = document.getElementById('joinName').value.trim();
  var birth    = document.getElementById('joinBirth').value.trim();
  var gender   = document.getElementById('joinGender').value||'';
  var grade    = '용역'; // 등급은 용역부터 시작, 활동으로 자동 상승

  var submitBtn = document.querySelector('[onclick="submitJoinFinal()"]');
  if(submitBtn){ submitBtn.disabled=true; submitBtn.textContent='처리 중...'; }

  apiCall(API_AUTH+'?action=register',{
    username: id,
    password: pw,
    name:     nickname,
    real_name: realName,
    birth:    birth,
    gender:   gender,
    grade:    grade,
    email:    joinVerifyEmail,
    recaptcha: recaptchaRes
  }).then(function(res){
    if(submitBtn){ submitBtn.disabled=false; submitBtn.textContent='가입 완료 🎉'; }
    if(!res.ok){
      if(typeof grecaptcha !== 'undefined') grecaptcha.reset();
      msgEl.textContent = res.msg || '가입 오류가 발생했습니다.';
      msgEl.style.display='block';
      return;
    }
    var u = res.user || {};
    currentUser = {
      id: u.id||id, name: nickname, grade: u.grade||grade, exp:0,
      cash:0, point:0, type:'email', postCount:0, commentCount:0,
      visitDays:0, cashLog:[], expLog:[]
    };
    try{
      localStorage.setItem('sbt_session', JSON.stringify({
        type:'user', db_id:u.id||id, name:nickname,
        grade:u.grade||grade, cash:0, utype:'email'
      }));
    }catch(e){}
    sessionStorage.setItem('sbt_tab_alive','1');
    closeJoinModal();
    activateUserMode(currentUser);
    alert('🎉 가입 완료!\n\n아이디: '+id+'\n이름: '+realName+'\n별명: '+nickname+'\n\n활동할수록 등급이 올라갑니다!');
  }).catch(function(){
    if(submitBtn){ submitBtn.disabled=false; submitBtn.textContent='가입 완료 🎉'; }
    if(typeof grecaptcha !== 'undefined') grecaptcha.reset();
    msgEl.textContent='네트워크 오류가 발생했습니다.'; msgEl.style.display='block';
  });
}

// 저장된 회원 불러오기 (로컬스토리지)
(function loadSavedUsers(){
  try{
    var saved = JSON.parse(localStorage.getItem('st_users')||'[]');
    saved.forEach(function(u){
      if(!USERS.find(function(x){ return x.id===u.id; })){
        if(!u.exp) u.exp=0;
        if(!u.expLog) u.expLog=[];
        if(!u.postCount) u.postCount=0;
        if(!u.commentCount) u.commentCount=0;
        USERS.push(u);
      }
    });
  }catch(e){}
})();


/* ══════════════════════════════════════════════
   인증/공통모달/마이페이지 HTML 초기화
══════════════════════════════════════════════ */
function initAuthHTML(){
  document.getElementById('joinModal').innerHTML = `
  <div class="modal-box" style="width:440px;max-height:90vh;overflow-y:auto">
    <div class="modal-head">
      <h3>회원가입</h3>
      <button class="modal-close" onclick="closeJoinModal()">✕</button>
    </div>
    <div class="modal-body" style="display:flex;flex-direction:column;gap:14px">

      <!-- 단계 표시 -->
      <div style="display:flex;align-items:center;justify-content:center;gap:0;margin-bottom:4px">
        <div id="stepDot1" style="width:28px;height:28px;border-radius:50%;background:var(--orange);color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center">1</div>
        <div style="width:60px;height:2px;background:var(--border)"></div>
        <div id="stepDot2" style="width:28px;height:28px;border-radius:50%;background:var(--border);color:var(--text-light);font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center">2</div>
      </div>

      <!-- STEP 1: 정보 입력 -->
      <div id="joinStep1">
        <div style="text-align:center;margin-bottom:16px">
          <div style="font-size:14px;font-weight:700;margin-bottom:4px">회원 정보 입력</div>
        </div>
        <div class="modal-field">
          <label>아이디 <span style="color:var(--orange)">*</span></label>
          <div style="display:flex;gap:6px">
            <input type="text" id="joinId" placeholder="영문·숫자 4~20자" style="flex:1" oninput="this.value=this.value.replace(/[^a-zA-Z0-9_]/g,'');joinIdChecked=false;">
            <button onclick="checkIdDup()" style="padding:8px 12px;background:var(--dark);color:#fff;border:none;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif;white-space:nowrap">중복확인</button>
          </div>
          <div id="joinIdMsg" style="font-size:11px;margin-top:3px"></div>
        </div>
        <div class="modal-field">
          <label>비밀번호 <span style="color:var(--orange)">*</span></label>
          <input type="password" id="joinPw" placeholder="8자 이상, 영문+숫자 포함">
        </div>
        <div class="modal-field">
          <label>비밀번호 확인 <span style="color:var(--orange)">*</span></label>
          <input type="password" id="joinPw2" placeholder="비밀번호 재입력">
        </div>
        <div class="modal-field">
          <label>이름 <span style="color:var(--orange)">*</span></label>
          <input type="text" id="joinRealName" placeholder="홍길동">
        </div>
        <div class="modal-field">
          <label>별명(닉네임) <span style="color:var(--orange)">*</span></label>
          <input type="text" id="joinName" placeholder="현장에서 불리는 이름">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="modal-field" style="margin:0">
            <label>생년월일</label>
            <input type="date" id="joinBirth" style="width:100%;padding:8px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none">
          </div>
          <div class="modal-field" style="margin:0">
            <label>성별</label>
            <select id="joinGender" style="width:100%;padding:8px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;background:#fff">
              <option value="">선택 안함</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
            </select>
          </div>
        </div>

        <div id="joinStep1Msg" style="font-size:12px;color:#C04040;margin-top:4px;display:none"></div>
        <button onclick="submitJoinStep1()" style="width:100%;margin-top:8px;padding:11px;background:var(--orange);color:#fff;border:none;border-radius:4px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">다음 →</button>
        <div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border);text-align:center">
          <div style="font-size:12px;color:var(--text-light);margin-bottom:8px">소셜 계정으로 시작</div>
          <button onclick="naverLogin()" style="padding:8px 16px;background:#03C75A;color:#fff;border:none;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">N 네이버로 시작</button>
        </div>
      </div>

      <!-- STEP 2: 약관 동의 + reCAPTCHA -->
      <div id="joinStep2" style="display:none">
        <div style="text-align:center;margin-bottom:14px">
          <div style="font-size:14px;font-weight:700;margin-bottom:4px">약관 동의</div>
        </div>
        <div style="border:1px solid var(--border);border-radius:6px;padding:14px;font-size:12px;color:var(--text-mid);max-height:140px;overflow-y:auto;line-height:1.7;margin-bottom:12px">
          <strong>설비트리거 이용약관</strong><br>
          본 서비스는 건설 현장 종사자를 위한 자재 검색·커뮤니티 플랫폼입니다.<br>
          회원은 타인의 권리를 침해하거나 허위 정보를 게시해서는 안 됩니다.<br>
          커뮤니티 운영 규칙 위반 시 서비스 이용이 제한될 수 있습니다.<br><br>
          <strong>개인정보 처리방침</strong><br>
          수집항목: 아이디, 이름, 닉네임, 생년월일, 성별<br>
          수집목적: 회원 서비스 제공<br>
          보유기간: 회원 탈퇴 시까지
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px">
            <input type="checkbox" id="agreeAll" onchange="toggleAllAgree(this)"> <strong>전체 동의</strong>
          </label>
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;color:var(--text-mid)">
            <input type="checkbox" id="agree1" class="agreeChk"> 이용약관 동의 <span style="color:var(--orange)">(필수)</span>
          </label>
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;color:var(--text-mid)">
            <input type="checkbox" id="agree2" class="agreeChk"> 개인정보 수집·이용 동의 <span style="color:var(--orange)">(필수)</span>
          </label>
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;color:var(--text-mid)">
            <input type="checkbox" id="agree3" class="agreeChk"> 마케팅 정보 수신 동의 (선택)
          </label>
        </div>
        <div style="display:flex;justify-content:center;margin-bottom:12px">
          <div class="g-recaptcha" data-sitekey="6LcNdposAAAAAMJ9IRjd7CWCEyXP8-BwkOvwW3nL"></div>
        </div>
        <div id="joinStep2Msg" style="font-size:12px;color:#C04040;margin-bottom:8px;display:none"></div>
        <button onclick="submitJoinFinal()" style="width:100%;padding:11px;background:var(--orange);color:#fff;border:none;border-radius:4px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">가입 완료 🎉</button>
        <button onclick="setJoinStep(1)" style="width:100%;margin-top:6px;padding:9px;background:transparent;color:var(--text-mid);border:1px solid var(--border);border-radius:4px;font-size:13px;cursor:pointer;font-family:'Noto Sans KR',sans-serif">← 이전</button>
      </div>

    </div>
  </div>
`;
  document.getElementById('loginModal').innerHTML = `
  <div class="modal-box" style="width:380px">
    <div class="modal-head">
      <h3>로그인</h3>
      <button class="modal-close" onclick="closeLoginModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="modal-field">
        <label>아이디</label>
        <input type="text" id="loginId" placeholder="아이디 입력" autocomplete="off">
      </div>
      <div class="modal-field">
        <label>비밀번호</label>
        <input type="password" id="loginPw" placeholder="비밀번호 입력" onkeydown="if(event.key==='Enter')doLogin()">
      </div>
      <div class="modal-error" id="loginError">아이디 또는 비밀번호가 올바르지 않습니다.</div>
      <button class="btn-modal-login" onclick="doLogin()">로그인</button>
      <div style="margin-top:12px;text-align:center;border-top:1px solid var(--border);padding-top:12px">
        <div style="font-size:11px;color:var(--text-light);margin-bottom:8px">소셜 계정으로 로그인</div>
        <button onclick="naverLogin()" style="width:100%;padding:10px;background:#03C75A;color:#fff;border:none;border-radius:4px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px">
          <span style="font-size:15px;font-weight:900">N</span> 네이버로 로그인
        </button>
      </div>
      <div style="margin-top:10px;text-align:center">
        <span style="font-size:12px;color:var(--text-light)">계정이 없으신가요?</span>
        <button onclick="closeLoginModal();openJoinModal()" style="margin-left:8px;padding:4px 12px;background:transparent;border:1px solid var(--border);border-radius:4px;font-size:12px;color:var(--text-mid);cursor:pointer;font-family:'Noto Sans KR',sans-serif">회원가입</button>
      </div>
    </div>
  </div>
`;
  document.getElementById('msgModal').innerHTML = `
  <div style="background:var(--white);border-radius:8px;width:500px;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3)">
    <div style="background:var(--dark);padding:14px 20px;display:flex;align-items:center;justify-content:space-between;border-radius:8px 8px 0 0;position:sticky;top:0">
      <h3 style="font-size:14px;font-weight:700;color:#fff">📬 받은 쪽지함</h3>
      <button onclick="closeMsgModal()" style="background:none;border:none;color:#888;cursor:pointer;font-size:18px">✕</button>
    </div>
    <div id="msgList" style="padding:16px 20px"></div>
    <div style="padding:12px 20px;border-top:1px solid var(--border);background:#FAFAF8;border-radius:0 0 8px 8px">
      <button onclick="closeMsgModal();openSendMsgModal('')" style="padding:7px 16px;background:var(--orange);color:#fff;border:none;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">✉️ 쪽지 보내기</button>
    </div>
  </div>
`;
  document.getElementById('sendMsgModal').innerHTML = `
  <div style="background:var(--white);border-radius:8px;width:440px;box-shadow:0 20px 60px rgba(0,0,0,.3)">
    <div style="background:var(--dark);padding:14px 20px;display:flex;align-items:center;justify-content:space-between;border-radius:8px 8px 0 0">
      <h3 style="font-size:14px;font-weight:700;color:#fff">✉️ 쪽지 보내기</h3>
      <button onclick="closeSendMsgModal()" style="background:none;border:none;color:#888;cursor:pointer;font-size:18px">✕</button>
    </div>
    <div style="padding:20px 24px;display:flex;flex-direction:column;gap:10px">
      <div><label style="font-size:12px;font-weight:700;color:var(--text-mid);display:block;margin-bottom:4px">받는 사람</label>
        <input type="text" id="msgTo" style="width:100%;padding:7px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none"></div>
      <div><label style="font-size:12px;font-weight:700;color:var(--text-mid);display:block;margin-bottom:4px">제목</label>
        <input type="text" id="msgTitle" style="width:100%;padding:7px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none"></div>
      <div><label style="font-size:12px;font-weight:700;color:var(--text-mid);display:block;margin-bottom:4px">내용</label>
        <textarea id="msgContent" rows="4" style="width:100%;padding:7px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;resize:vertical"></textarea></div>
    </div>
    <div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;background:#FAFAF8;border-radius:0 0 8px 8px">
      <button onclick="closeSendMsgModal()" style="padding:8px 14px;background:transparent;border:1px solid var(--border);border-radius:4px;font-size:13px;color:var(--text-mid);cursor:pointer;font-family:'Noto Sans KR',sans-serif">취소</button>
      <button onclick="submitSendMsg()" style="padding:8px 18px;background:var(--orange);color:#fff;border:none;border-radius:4px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">보내기</button>
    </div>
  </div>
`;
  document.getElementById('adjustModal').innerHTML = `
  <div style="background:var(--white);border-radius:8px;width:360px;box-shadow:0 20px 60px rgba(0,0,0,.3)">
    <div style="background:var(--dark);padding:14px 20px;display:flex;align-items:center;justify-content:space-between;border-radius:8px 8px 0 0">
      <h3 style="font-size:14px;font-weight:700;color:#fff">🔧 수치 조정 (관리자)</h3>
      <button onclick="closeAdjustModal()" style="background:none;border:none;color:#888;cursor:pointer;font-size:18px">✕</button>
    </div>
    <div style="padding:20px 24px;display:flex;flex-direction:column;gap:12px">
      <input type="hidden" id="adjustPostId">
      <div><label style="font-size:12px;font-weight:700;color:var(--text-mid);display:block;margin-bottom:4px">조회수</label>
        <input type="number" id="adjustViews" min="0" style="width:100%;padding:7px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none"></div>
      <div><label style="font-size:12px;font-weight:700;color:var(--text-mid);display:block;margin-bottom:4px">추천수</label>
        <input type="number" id="adjustLikes" min="0" style="width:100%;padding:7px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none"></div>
    </div>
    <div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;background:#FAFAF8;border-radius:0 0 8px 8px">
      <button onclick="closeAdjustModal()" style="padding:8px 14px;background:transparent;border:1px solid var(--border);border-radius:4px;font-size:13px;color:var(--text-mid);cursor:pointer;font-family:'Noto Sans KR',sans-serif">취소</button>
      <button onclick="submitAdjust()" style="padding:8px 18px;background:var(--orange);color:#fff;border:none;border-radius:4px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">적용</button>
    </div>
  </div>
`;
  document.getElementById('page-mypage').innerHTML = `
  <div style="max-width:860px;margin:0 auto;padding:32px 40px">

    <!-- 프로필 카드 -->
    <div style="background:var(--white);border:1px solid var(--border);border-radius:10px;padding:28px 32px;margin-bottom:24px;display:flex;align-items:center;gap:24px;flex-wrap:wrap">
      <div id="mypage-avatar" style="width:72px;height:72px;border-radius:50%;background:var(--orange);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:#fff;flex-shrink:0"></div>
      <div style="flex:1;min-width:200px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
          <span id="mypage-grade-badge" style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:3px"></span>
          <strong id="mypage-name" style="font-size:18px"></strong>
        </div>
        <div id="mypage-email" style="font-size:12px;color:var(--text-light);margin-bottom:8px"></div>
        <!-- 경험치 바 -->
        <div style="margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:11px;color:var(--text-mid)">다음 등급까지</span>
          <span id="mypage-exp-text" style="font-size:11px;color:var(--orange);font-weight:700"></span>
        </div>
        <div style="background:var(--border);border-radius:4px;height:8px;overflow:hidden">
          <div id="mypage-exp-bar" style="height:100%;background:var(--orange);border-radius:4px;transition:width .4s"></div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:8px 14px;text-align:center">
          <div style="font-size:11px;color:var(--text-light);margin-bottom:2px">보유 전</div>
          <div style="font-size:18px;font-weight:900;color:var(--orange)" id="mypage-cash-balance">0전</div>
        </div>
        <button onclick="openChargePopupModal()" style="display:block;width:100%;padding:7px 16px;background:var(--orange);color:#fff;border:none;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif;text-align:center">💰 전 충전 신청</button>
        <button onclick="openEditNickModal()" style="padding:7px 16px;background:var(--dark);color:#C8C6C0;border:none;border-radius:4px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Noto Sans KR',sans-serif">✏️ 닉네임 변경</button>
        <button onclick="openEditPwModal()" style="padding:7px 16px;background:transparent;border:1px solid var(--border);color:var(--text-mid);border-radius:4px;font-size:12px;cursor:pointer;font-family:'Noto Sans KR',sans-serif">🔑 비밀번호 변경</button>
      </div>
    </div>

    <!-- 활동 통계 -->
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px;margin-bottom:24px" id="mypage-stats"></div>

    <!-- 탭 -->
    <div style="display:flex;gap:4px;border-bottom:2px solid var(--border);margin-bottom:16px">
      <button id="mp-tab-posts" onclick="switchMypageTab('posts')" style="padding:9px 18px;background:var(--orange);color:#fff;border:none;border-radius:4px 4px 0 0;font-size:13px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif;margin-bottom:-2px">내 게시글</button>
      <button id="mp-tab-comments" onclick="switchMypageTab('comments')" style="padding:9px 18px;background:transparent;color:var(--text-mid);border:1px solid var(--border);border-bottom:none;border-radius:4px 4px 0 0;font-size:13px;cursor:pointer;font-family:'Noto Sans KR',sans-serif;margin-bottom:-2px">내 댓글</button>
      <button id="mp-tab-exp" onclick="switchMypageTab('exp')" style="padding:9px 18px;background:transparent;color:var(--text-mid);border:1px solid var(--border);border-bottom:none;border-radius:4px 4px 0 0;font-size:13px;cursor:pointer;font-family:'Noto Sans KR',sans-serif;margin-bottom:-2px">활동 내역</button>
      <button id="mp-tab-cash" onclick="switchMypageTab('cash')" style="padding:9px 18px;background:transparent;color:var(--text-mid);border:1px solid var(--border);border-bottom:none;border-radius:4px 4px 0 0;font-size:13px;cursor:pointer;font-family:'Noto Sans KR',sans-serif;margin-bottom:-2px">💰 전 내역</button>
      <button id="mp-tab-charge" onclick="switchMypageTab('charge')" style="padding:9px 18px;background:transparent;color:var(--text-mid);border:1px solid var(--border);border-bottom:none;border-radius:4px 4px 0 0;font-size:13px;cursor:pointer;font-family:'Noto Sans KR',sans-serif;margin-bottom:-2px">💳 전 충전신청</button>
    </div>
    <div id="mypage-tab-content"></div>

  </div>
`;
  document.getElementById('editNickModal').innerHTML = `
  <div style="background:var(--white);border-radius:8px;width:380px;box-shadow:0 20px 60px rgba(0,0,0,.3)">
    <div style="background:var(--dark);padding:14px 20px;display:flex;align-items:center;justify-content:space-between;border-radius:8px 8px 0 0">
      <h3 style="font-size:14px;font-weight:700;color:#fff">✏️ 닉네임 변경</h3>
      <button onclick="closeEditNickModal()" style="background:none;border:none;color:#888;cursor:pointer;font-size:18px">✕</button>
    </div>
    <div style="padding:20px 24px">
      <div style="background:#FFF3EE;border:1px solid #FFD0B0;border-radius:6px;padding:12px 14px;margin-bottom:16px">
        <div style="font-size:12px;font-weight:700;color:var(--orange);margin-bottom:4px">💰 닉네임 변경 비용</div>
        <div style="font-size:13px;color:var(--text);font-weight:700">10,000전 차감</div>
        <div style="font-size:11px;color:var(--text-mid);margin-top:4px">현재 보유: <strong id="nickModalCash" style="color:var(--orange)">-</strong>전</div>
      </div>
      <label style="font-size:12px;font-weight:700;color:var(--text-mid);display:block;margin-bottom:6px">새 닉네임</label>
      <input type="text" id="newNickInput" maxlength="20" placeholder="2~20자 입력"
        style="width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;box-sizing:border-box">
      <div id="nickChangeMsg" style="font-size:11px;margin-top:6px;display:none"></div>
    </div>
    <div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;background:#FAFAF8;border-radius:0 0 8px 8px">
      <button onclick="closeEditNickModal()" style="padding:8px 14px;background:transparent;border:1px solid var(--border);border-radius:4px;font-size:13px;color:var(--text-mid);cursor:pointer;font-family:'Noto Sans KR',sans-serif">취소</button>
      <button onclick="submitNickChange()" style="padding:8px 18px;background:var(--orange);color:#fff;border:none;border-radius:4px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">10,000전 차감 후 변경</button>
    </div>
  </div>
`;
  document.getElementById('editPwModal').innerHTML = `
  <div style="background:var(--white);border-radius:8px;width:380px;box-shadow:0 20px 60px rgba(0,0,0,.3)">
    <div style="background:var(--dark);padding:14px 20px;display:flex;align-items:center;justify-content:space-between;border-radius:8px 8px 0 0">
      <h3 style="font-size:14px;font-weight:700;color:#fff">🔑 비밀번호 변경</h3>
      <button onclick="closeEditPwModal()" style="background:none;border:none;color:#888;cursor:pointer;font-size:18px">✕</button>
    </div>
    <div style="padding:20px 24px;display:flex;flex-direction:column;gap:10px">
      <div>
        <label style="font-size:12px;font-weight:700;color:var(--text-mid);display:block;margin-bottom:4px">현재 비밀번호</label>
        <input type="password" id="curPwInput" style="width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;box-sizing:border-box">
      </div>
      <div>
        <label style="font-size:12px;font-weight:700;color:var(--text-mid);display:block;margin-bottom:4px">새 비밀번호</label>
        <input type="password" id="newPwInput" placeholder="8자 이상, 영문+숫자" style="width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;box-sizing:border-box">
      </div>
      <div>
        <label style="font-size:12px;font-weight:700;color:var(--text-mid);display:block;margin-bottom:4px">새 비밀번호 확인</label>
        <input type="password" id="newPw2Input" style="width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;box-sizing:border-box">
      </div>
      <div id="pwChangeMsg" style="font-size:11px;display:none"></div>
    </div>
    <div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;background:#FAFAF8;border-radius:0 0 8px 8px">
      <button onclick="closeEditPwModal()" style="padding:8px 14px;background:transparent;border:1px solid var(--border);border-radius:4px;font-size:13px;color:var(--text-mid);cursor:pointer;font-family:'Noto Sans KR',sans-serif">취소</button>
      <button onclick="submitPwChange()" style="padding:8px 18px;background:var(--orange);color:#fff;border:none;border-radius:4px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">변경</button>
    </div>
  </div>
`;
  document.getElementById('adminBanner').innerHTML = `
  <div class="admin-banner-left">
    <span class="admin-banner-badge">ADMIN</span>
    <span class="admin-banner-text">관리자 모드</span>
  </div>
  <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">
    <button onclick="document.getElementById('dbUploadInput').click()" style="padding:5px 10px;background:#2A4A8A;color:#A8C4FF;border:none;border-radius:3px;font-size:11px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">⬆ DB업로드</button>
    <button onclick="downloadDB()" style="padding:5px 10px;background:#1A3A6A;color:#A8C4FF;border:none;border-radius:3px;font-size:11px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">⬇ DB다운</button>
    <button onclick="openAdminMemberModal()" style="padding:5px 10px;background:#4A2A6A;color:#D8B8FF;border:none;border-radius:3px;font-size:11px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">👥 회원관리</button>
    <button onclick="openChargeReqModal()" id="btnChargeReq" style="padding:5px 10px;background:#5A2A1A;color:#FFCBA8;border:none;border-radius:3px;font-size:11px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">💰 충전신청</button>
    <input type="file" id="dbUploadInput" accept=".xlsx,.xls" style="display:none" onchange="uploadDB(this)">
    <span style="width:1px;height:16px;background:#444;display:inline-block;margin:0 2px"></span>
    <span style="font-size:10px;color:#888;font-weight:700">베타메뉴:</span>
    <button onclick="toggleBetaMenu('nav-job',this)" data-label="구인구직" style="padding:4px 8px;background:#3A2A1A;color:#FFC4A8;border:1px solid #6A4A3A;border-radius:3px;font-size:10px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">구인구직 👁</button>
    <button onclick="toggleBetaMenu('nav-company',this)" data-label="업체정보" style="padding:4px 8px;background:#3A2A1A;color:#FFC4A8;border:1px solid #6A4A3A;border-radius:3px;font-size:10px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">업체정보 👁</button>
    <button onclick="toggleBetaMenu('nav-news',this)" data-label="건설뉴스" style="padding:4px 8px;background:#3A2A1A;color:#FFC4A8;border:1px solid #6A4A3A;border-radius:3px;font-size:10px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">건설뉴스 👁</button>
    <button onclick="toggleBetaMenu('nav-safety',this)" data-label="건설안전" style="padding:4px 8px;background:#3A2A1A;color:#FFC4A8;border:1px solid #6A4A3A;border-radius:3px;font-size:10px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">건설안전 👁</button>
    <button onclick="toggleBetaMenu('nav-notice',this)" data-label="공지사항" style="padding:4px 8px;background:#3A2A1A;color:#FFC4A8;border:1px solid #6A4A3A;border-radius:3px;font-size:10px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">공지사항 👁</button>
    <button onclick="toggleBetaMenu('nav-help',this)" data-label="도움요청" style="padding:4px 8px;background:#3A2A1A;color:#FFC4A8;border:1px solid #6A4A3A;border-radius:3px;font-size:10px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">도움요청 👁</button>
    <button onclick="toggleBetaMenu('nav-docs',this)" data-label="공무자료실" style="padding:4px 8px;background:#3A2A1A;color:#FFC4A8;border:1px solid #6A4A3A;border-radius:3px;font-size:10px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">공무자료실 👁</button>
    <button onclick="toggleBetaMenu('nav-matlist',this)" data-label="자재·용어집" style="padding:4px 8px;background:#3A2A1A;color:#FFC4A8;border:1px solid #6A4A3A;border-radius:3px;font-size:10px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">자재·용어집 👁</button>
    <button id="btnSaveMenuState" onclick="saveMenuState()" style="padding:4px 10px;background:#1A4A1A;color:#C8F0C8;border:1px solid #3A6A3A;border-radius:3px;font-size:10px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">💾 메뉴저장</button>
  </div>
`;
  document.getElementById('adminMemberModal').innerHTML = `
  <div style="background:var(--white);border-radius:8px;width:720px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.4)">
    <div style="background:#1A2F5A;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-radius:8px 8px 0 0;position:sticky;top:0;z-index:1">
      <h3 style="font-size:15px;font-weight:700;color:#fff">👥 회원 관리</h3>
      <button onclick="closeAdminMemberModal()" style="background:none;border:none;color:#888;cursor:pointer;font-size:18px">✕</button>
    </div>
    <div style="padding:16px 20px">
      <!-- 검색 -->
      <input type="text" id="adminMemberSearch" placeholder="🔍 아이디·닉네임 검색..." oninput="renderAdminMemberList()"
        style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;box-sizing:border-box;margin-bottom:12px">
      <div id="adminMemberList"></div>
    </div>
  </div>
`;
  document.getElementById('adminMemberEditModal').innerHTML = `
  <div style="background:var(--white);border-radius:8px;width:420px;box-shadow:0 20px 60px rgba(0,0,0,.4)">
    <div style="background:#1A2F5A;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;border-radius:8px 8px 0 0">
      <h3 id="adminEditTitle" style="font-size:14px;font-weight:700;color:#fff">회원 조정</h3>
      <button onclick="closeAdminMemberEditModal()" style="background:none;border:none;color:#888;cursor:pointer;font-size:18px">✕</button>
    </div>
    <div style="padding:20px 24px;display:flex;flex-direction:column;gap:12px">
      <input type="hidden" id="adminEditUserId">
      <div>
        <label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:4px">등급 변경</label>
        <select id="adminEditGrade" style="width:100%;padding:8px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none">
          <option value="용역">8 용역</option>
          <option value="신호수">7 신호수</option>
          <option value="조공">6 조공</option>
          <option value="준기공">5 준기공</option>
          <option value="기공">4 기공</option>
          <option value="팀장">3 팀장</option>
          <option value="기능장">2 기능장</option>
          <option value="기술사">1 기술사</option>
        </select>
      </div>
      <div style="display:flex;gap:10px">
        <div style="flex:1">
          <label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:4px">경험치 지급 (+)</label>
          <input type="number" id="adminEditExp" min="0" placeholder="예) 100"
            style="width:100%;padding:8px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;box-sizing:border-box">
        </div>
        <div style="flex:1">
          <label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:4px">캐시 지급 (+)</label>
          <input type="number" id="adminEditCash" min="0" placeholder="예) 5000"
            style="width:100%;padding:8px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;box-sizing:border-box">
        </div>
      </div>
      <div style="flex:1">
        <label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:4px">포인트 지급 (+) <span style="font-size:10px;font-weight:400;color:var(--text-light)">(일부 기능 잠금해제용)</span></label>
        <input type="number" id="adminEditPoint" min="0" placeholder="예) 500"
          style="width:100%;padding:8px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;box-sizing:border-box">
      </div>
      <div id="adminEditMsg" style="font-size:12px;display:none"></div>
    </div>
    <div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;background:#FAFAF8;border-radius:0 0 8px 8px">
      <button onclick="closeAdminMemberEditModal()" style="padding:8px 14px;background:transparent;border:1px solid var(--border);border-radius:4px;font-size:13px;color:var(--text-mid);cursor:pointer;font-family:'Noto Sans KR',sans-serif">취소</button>
      <button onclick="submitAdminMemberEdit()" style="padding:8px 18px;background:#1A2F5A;color:#fff;border:none;border-radius:4px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">적용</button>
    </div>
  </div>
`;
  document.getElementById('chargeReqModal').innerHTML = `
  <div style="background:var(--white);border-radius:8px;width:min(820px,96vw);max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.4)">
    <div style="background:#1A2F5A;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-radius:8px 8px 0 0;position:sticky;top:0;z-index:1">
      <h3 style="font-size:15px;font-weight:700;color:#fff">💰 전 충전신청 관리</h3>
      <div style="display:flex;align-items:center;gap:8px">
        <select id="crFilterStatus" onchange="loadAdminChargeReqs()" style="padding:4px 8px;border:none;border-radius:4px;font-size:12px;font-family:'Noto Sans KR',sans-serif">
          <option value="pending">검토중</option>
          <option value="approved">승인</option>
          <option value="rejected">거절</option>
          <option value="all">전체</option>
        </select>
        <button onclick="closeChargeReqModal()" style="background:none;border:none;color:#888;cursor:pointer;font-size:18px">✕</button>
      </div>
    </div>
    <div style="padding:20px">
      <div id="crStatRow" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px"></div>
      <div id="crList"><div style="text-align:center;padding:32px;color:var(--text-light)">로딩 중...</div></div>
      <div id="crProcessAlert" style="display:none;padding:10px 14px;border-radius:6px;font-size:13px;margin-top:12px"></div>
    </div>
  </div>
`;

  ['msgModal','sendMsgModal','adjustModal','editNickModal','editPwModal','adminMemberModal','adminMemberEditModal','chargeReqModal','chargePopupModal'].forEach(function(id){
    var m=document.getElementById(id);
    if(m && !m.style.position){ m.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:3000;display:none;align-items:center;justify-content:center';
           m.addEventListener('click',function(e){ if(e.target===this) this.style.display='none'; }); }
  });
  // loginModal 클릭 이벤트 (search.js에서 이전)
  var lm = document.getElementById('loginModal');
  if(lm) lm.addEventListener('click', function(e){ if(e.target===this) closeLoginModal(); });
}
document.addEventListener('DOMContentLoaded', initAuthHTML);

/* ── 관리자 충전신청 모달 ── */
// ADMIN_PW는 search.js에서 const로 선언됨 (중복 선언 금지)
var _crProcessId = 0, _crProcessAct = '';

function openChargeReqModal(){
  var m = document.getElementById('chargeReqModal');
  if(m){ m.style.display='flex'; loadAdminChargeReqs(); }
}
function closeChargeReqModal(){
  var m = document.getElementById('chargeReqModal');
  if(m) m.style.display='none';
}

function loadAdminChargeReqs(){
  var status = (document.getElementById('crFilterStatus')||{}).value || 'pending';
  var listEl = document.getElementById('crList');
  if(listEl) listEl.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text-light)">로딩 중...</div>';

  fetch('/api/cash.php?action=get_charge_requests&status='+status, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({admin_pw: ADMIN_PW})
  }).then(function(r){return r.json();}).then(function(res){
    if(!res.ok){ if(listEl) listEl.innerHTML='<div style="text-align:center;padding:32px;color:#c04040">'+( res.msg||'오류')+'</div>'; return; }
    var list = res.list || [];

    // 통계 (전체 목록에서 계산)
    fetch('/api/cash.php?action=get_charge_requests&status=all', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({admin_pw: ADMIN_PW})
    }).then(function(r2){return r2.json();}).then(function(r2){
      var all = r2.list || [];
      var cnt = {pending:0, approved:0, rejected:0};
      var sum = {pending:0, approved:0, rejected:0};
      all.forEach(function(r){ cnt[r.status]=(cnt[r.status]||0)+1; sum[r.status]=(sum[r.status]||0)+r.amount; });
      var sr = document.getElementById('crStatRow');
      if(sr) sr.innerHTML = [
        {lbl:'검토중',clr:'#F59E0B',s:'pending'},
        {lbl:'승인완료',clr:'#059669',s:'approved'},
        {lbl:'거절',clr:'#DC2626',s:'rejected'}
      ].map(function(x){
        return '<div style="background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:10px;text-align:center">'
          +'<div style="font-size:10px;color:var(--text-light);margin-bottom:2px">'+x.lbl+'</div>'
          +'<div style="font-size:18px;font-weight:900;color:'+x.clr+'">'+cnt[x.s]+'건</div>'
          +'<div style="font-size:11px;color:var(--text-mid)">'+(sum[x.s]||0).toLocaleString()+'전</div>'
          +'</div>';
      }).join('');
    }).catch(function(){});

    if(!list.length){
      if(listEl) listEl.innerHTML='<div style="text-align:center;padding:32px;color:var(--text-light)">신청 내역이 없습니다.</div>';
      return;
    }
    var statusMap = {pending:'<span style="padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;background:#FFF8E1;color:#F59E0B">검토중</span>',
      approved:'<span style="padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;background:#ECFDF5;color:#059669">승인</span>',
      rejected:'<span style="padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;background:#FEF2F2;color:#DC2626">거절</span>'};
    var rows = list.map(function(r){
      var refund = [r.refund_bank, r.refund_account, r.refund_holder].filter(Boolean).join(' / ') || '-';
      var btns = r.status==='pending'
        ? '<div style="display:flex;gap:4px">'
            +'<button onclick="adminProcessCharge('+r.id+','+r.amount+',\''+r.depositor_name+'\',\'approve\')" style="padding:4px 10px;background:var(--orange);color:#fff;border:none;border-radius:3px;font-size:11px;font-weight:700;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">✓ 승인</button>'
            +'<button onclick="adminProcessCharge('+r.id+','+r.amount+',\''+r.depositor_name+'\',\'reject\')" style="padding:4px 10px;background:transparent;color:#DC2626;border:1px solid #FECACA;border-radius:3px;font-size:11px;font-weight:700;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">✕ 거절</button>'
            +'</div>'
        : '<span style="font-size:11px;color:var(--text-light)">처리완료</span>';
      return '<tr id="cr-row-'+r.id+'" style="border-bottom:1px solid var(--border-light)">'
        +'<td style="padding:10px 12px;font-size:12px;color:var(--text-light)">'+String(r.created_at||'').slice(0,16)+'</td>'
        +'<td style="padding:10px 12px"><div style="font-size:13px;font-weight:700">'+(r.name||'탈퇴')+'</div><div style="font-size:11px;color:var(--text-light)">'+(r.username||'')+'</div></td>'
        +'<td style="padding:10px 12px;font-size:14px;font-weight:900;color:var(--orange)">'+Number(r.amount).toLocaleString()+'전</td>'
        +'<td style="padding:10px 12px;font-size:13px">'+r.depositor_name+'</td>'
        +'<td style="padding:10px 12px;font-size:12px;color:var(--text-mid)">'+refund+'</td>'
        +'<td style="padding:10px 12px">'+(statusMap[r.status]||r.status)+'</td>'
        +'<td style="padding:10px 12px">'+btns+'</td>'
        +'</tr>';
    }).join('');
    if(listEl) listEl.innerHTML = '<table style="width:100%;border-collapse:collapse;font-size:13px">'
      +'<thead><tr style="background:var(--surface)">'
      +'<th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-mid);font-weight:700;border-bottom:2px solid var(--border)">신청일</th>'
      +'<th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-mid);font-weight:700;border-bottom:2px solid var(--border)">회원</th>'
      +'<th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-mid);font-weight:700;border-bottom:2px solid var(--border)">금액</th>'
      +'<th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-mid);font-weight:700;border-bottom:2px solid var(--border)">입금자명</th>'
      +'<th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-mid);font-weight:700;border-bottom:2px solid var(--border)">환불계좌</th>'
      +'<th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-mid);font-weight:700;border-bottom:2px solid var(--border)">상태</th>'
      +'<th style="padding:8px 12px;text-align:left;font-size:11px;color:var(--text-mid);font-weight:700;border-bottom:2px solid var(--border)">처리</th>'
      +'</tr></thead><tbody>'+rows+'</tbody></table>';
  }).catch(function(){ if(listEl) listEl.innerHTML='<div style="text-align:center;padding:32px;color:#c04040">네트워크 오류</div>'; });
}

function adminProcessCharge(id, amount, depositor, act){
  var label = act==='approve' ? '승인' : '거절';
  if(!confirm(Number(amount).toLocaleString()+'전 / 입금자: '+depositor+'\n\n'+label+' 처리하시겠습니까?')) return;
  var alertEl = document.getElementById('crProcessAlert');
  fetch('/api/cash.php?action=admin_process_charge',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({request_id:id, action:act, memo:'', admin_pw: ADMIN_PW})
  }).then(function(r){return r.json();}).then(function(res){
    if(res.ok){
      var row = document.getElementById('cr-row-'+id);
      if(row) row.style.opacity='0.4';
      if(alertEl){ alertEl.style.display='block'; alertEl.style.background='#ECFDF5'; alertEl.style.color='#059669'; alertEl.textContent='✅ '+res.msg; }
      setTimeout(function(){ loadAdminChargeReqs(); if(alertEl) alertEl.style.display='none'; }, 1000);
    } else {
      if(alertEl){ alertEl.style.display='block'; alertEl.style.background='#FEF2F2'; alertEl.style.color='#DC2626'; alertEl.textContent='❌ '+(res.msg||'오류'); }
    }
  }).catch(function(){
    if(alertEl){ alertEl.style.display='block'; alertEl.style.background='#FEF2F2'; alertEl.style.color='#DC2626'; alertEl.textContent='네트워크 오류'; }
  });
}