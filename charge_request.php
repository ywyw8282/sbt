<?php ?>
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>전 충전 신청 — 설비트리거</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
<style>
  body{background:var(--surface);min-height:100vh;padding:0;margin:0}
  .cr-wrap{max-width:680px;margin:0 auto;padding:32px 20px 60px}
  .cr-header{margin-bottom:28px}
  .cr-header h1{font-size:22px;font-weight:800;color:var(--text);margin:0 0 6px}
  .cr-header p{font-size:13px;color:var(--text-mid);margin:0}
  .cr-card{background:#fff;border:1.5px solid var(--border-light);border-radius:var(--radius);padding:24px 28px;margin-bottom:20px;box-shadow:var(--shadow-sm)}
  .cr-card-title{font-size:13px;font-weight:700;color:var(--text-mid);letter-spacing:.5px;text-transform:uppercase;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid var(--border)}
  .cr-balance{display:flex;align-items:center;gap:12px;background:var(--surface);border-radius:8px;padding:14px 18px;margin-bottom:20px}
  .cr-balance-label{font-size:12px;color:var(--text-light)}
  .cr-balance-val{font-size:24px;font-weight:800;color:var(--orange)}
  .cr-balance-unit{font-size:14px;color:var(--text-mid);font-weight:500}
  .cr-field{margin-bottom:16px}
  .cr-field label{display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:6px}
  .cr-field input{width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;transition:border-color .15s;box-sizing:border-box;background:#fff;color:var(--text)}
  .cr-field input:focus{border-color:var(--orange)}
  .cr-field-row{display:grid;grid-template-columns:1fr 1.6fr 1fr;gap:8px}
  .cr-quick-btns{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px}
  .cr-quick-btn{padding:6px 14px;background:var(--surface);border:1.5px solid var(--border);border-radius:20px;font-size:12px;font-weight:600;color:var(--text-mid);cursor:pointer;transition:all .15s;font-family:'Noto Sans KR',sans-serif}
  .cr-quick-btn:hover{border-color:var(--orange);color:var(--orange);background:#FFF3EE}
  .cr-btn{width:100%;padding:14px;background:var(--orange);color:#fff;border:none;border-radius:var(--radius-sm);font-size:15px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif;transition:all .15s;margin-top:4px}
  .cr-btn:hover{background:var(--orange-light)}
  .cr-btn:disabled{background:#ccc;cursor:not-allowed}
  .cr-notice{background:#FFF8F0;border:1px solid #FFD9B8;border-radius:8px;padding:14px 18px;margin-bottom:20px}
  .cr-notice h4{font-size:13px;font-weight:700;color:var(--orange);margin:0 0 8px}
  .cr-notice ul{margin:0;padding-left:18px;font-size:12px;color:var(--text-mid);line-height:1.8}
  .cr-account-box{background:#FFF3EE;border:2px solid var(--orange);border-radius:10px;padding:16px 20px;margin-bottom:20px}
  .cr-account-box h4{font-size:13px;font-weight:700;color:var(--orange);margin:0 0 10px}
  .cr-account-row{display:flex;align-items:center;gap:8px;margin-bottom:6px}
  .cr-account-label{font-size:11px;font-weight:700;color:var(--text-mid);min-width:54px}
  .cr-account-val{font-weight:700;color:var(--text);font-size:13px}
  .cr-account-num{font-size:18px;font-weight:900;color:var(--orange);letter-spacing:1px}
  .copy-btn{padding:3px 10px;background:var(--orange);color:#fff;border:none;border-radius:4px;font-size:11px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif}
  .cr-refund-box{background:#F0F8FF;border:1.5px solid #A8D4F0;border-radius:10px;padding:16px 20px;margin-bottom:20px}
  .cr-refund-box h4{font-size:13px;font-weight:700;color:#1A5A8A;margin:0 0 4px}
  .cr-refund-box p{font-size:12px;color:var(--text-mid);margin:0 0 12px}
  .status-badge{display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700}
  .status-pending{background:#FFF8E1;color:#F59E0B}
  .status-approved{background:#ECFDF5;color:#059669}
  .status-rejected{background:#FEF2F2;color:#DC2626}
  .cr-table{width:100%;border-collapse:collapse;font-size:13px}
  .cr-table th{padding:10px 12px;background:var(--surface);color:var(--text-mid);font-size:11px;font-weight:700;text-align:left;border-bottom:2px solid var(--border)}
  .cr-table td{padding:11px 12px;border-bottom:1px solid var(--border-light);color:var(--text);vertical-align:middle}
  .cr-table tr:last-child td{border-bottom:none}
  .cr-empty{text-align:center;padding:40px;color:var(--text-light);font-size:13px}
  .alert{padding:12px 16px;border-radius:8px;font-size:13px;margin-bottom:16px;display:none}
  .alert-ok{background:#ECFDF5;color:#059669;border:1px solid #A7F3D0}
  .alert-err{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA}
  .back-link{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:var(--text-mid);text-decoration:none;margin-bottom:20px;transition:color .15s}
  .back-link:hover{color:var(--orange)}
  .saved-tag{font-size:11px;color:#059669;font-weight:600;margin-left:6px;display:none}
</style>
</head>
<body>
<div class="cr-wrap">
  <a href="index.html" class="back-link">← 메인으로</a>

  <div class="cr-header">
    <h1>💰 전 충전 신청</h1>
    <p>계좌 입금 후 신청하시면 확인 후 수동으로 전이 충전됩니다.</p>
  </div>

  <div id="notLoginBox" class="cr-card" style="text-align:center;padding:40px;display:none">
    <div style="font-size:36px;margin-bottom:12px">🔐</div>
    <p style="font-size:15px;font-weight:700;color:var(--text);margin:0 0 8px">로그인이 필요합니다</p>
    <p style="font-size:13px;color:var(--text-mid);margin:0 0 20px">충전 신청은 로그인 후 이용할 수 있습니다.</p>
    <a href="index.html" style="padding:10px 28px;background:var(--orange);color:#fff;border-radius:8px;text-decoration:none;font-size:13px;font-weight:700">로그인하러 가기</a>
  </div>

  <div id="chargeBox" style="display:none">

    <div class="cr-card">
      <!-- 잔액 -->
      <div class="cr-balance">
        <div>
          <div class="cr-balance-label">현재 보유 전</div>
          <div style="display:flex;align-items:baseline;gap:4px">
            <span class="cr-balance-val" id="balanceDisplay">-</span>
            <span class="cr-balance-unit">전</span>
          </div>
        </div>
      </div>

      <!-- 입금 계좌 -->
      <div class="cr-account-box">
        <h4>🏦 입금 계좌 정보</h4>
        <div class="cr-account-row">
          <span class="cr-account-label">은행</span>
          <span class="cr-account-val">카카오뱅크</span>
        </div>
        <div class="cr-account-row">
          <span class="cr-account-label">계좌번호</span>
          <span class="cr-account-num" id="accountNum">123485712</span>
          <button class="copy-btn" onclick="copyAccount()">복사</button>
        </div>
        <div class="cr-account-row">
          <span class="cr-account-label">예금주</span>
          <span class="cr-account-val">(주)설비트리거</span>
        </div>
      </div>

      <!-- 안내 -->
      <div class="cr-notice">
        <h4>📌 충전 안내</h4>
        <ul>
          <li>위 계좌로 입금 후 아래 신청서를 제출해주세요.</li>
          <li>입금자명을 정확히 입력하지 않으면 처리가 지연될 수 있습니다.</li>
          <li>최소 충전금액: <strong>10,000원 (10,000전)</strong> / 최대: <strong>1,000,000원</strong></li>
          <li>1전 = 1원 (입금 금액과 동일하게 지급됩니다)</li>
          <li>입금 확인 후 영업일 기준 1일 이내 처리됩니다.</li>
        </ul>
      </div>

      <!-- 신청 폼 -->
      <div class="cr-card-title">충전 신청</div>
      <div id="alertBox" class="alert"></div>

      <div class="cr-field">
        <label>충전 금액 (전) <span style="color:var(--orange)">*</span></label>
        <div class="cr-quick-btns">
          <button class="cr-quick-btn" onclick="setAmount(10000)">10,000전</button>
          <button class="cr-quick-btn" onclick="setAmount(30000)">30,000전</button>
          <button class="cr-quick-btn" onclick="setAmount(50000)">50,000전</button>
          <button class="cr-quick-btn" onclick="setAmount(100000)">100,000전</button>
          <button class="cr-quick-btn" onclick="setAmount(200000)">200,000전</button>
        </div>
        <input type="number" id="inputAmount" placeholder="직접 입력 (1,000 단위)" min="10000" max="1000000" step="1000">
      </div>

      <div class="cr-field">
        <label>입금자명 <span style="color:var(--orange)">*</span></label>
        <input type="text" id="inputDepositor" placeholder="실제 입금하신 분의 성함" maxlength="20">
      </div>

      <div class="cr-field">
        <label>메모 <span style="font-weight:400;color:var(--text-light)">(선택)</span></label>
        <input type="text" id="inputMemo" placeholder="특이사항이 있으면 입력해주세요" maxlength="100">
      </div>

      <!-- 환불계좌 입력 -->
      <div class="cr-refund-box">
        <h4>🔄 환불받을 계좌 정보 <span class="saved-tag" id="refundSavedTag">✓ 저장된 정보</span></h4>
        <p>미입금 또는 거절 시 환불받을 계좌를 입력해주세요. 다음 신청 시 자동으로 불러옵니다.</p>
        <div class="cr-field-row">
          <div class="cr-field" style="margin-bottom:0">
            <label>은행명 <span style="color:var(--orange)">*</span></label>
            <input type="text" id="inputRefundBank" placeholder="예: 카카오뱅크" maxlength="20">
          </div>
          <div class="cr-field" style="margin-bottom:0">
            <label>계좌번호 <span style="color:var(--orange)">*</span></label>
            <input type="text" id="inputRefundAccount" placeholder="숫자만 입력" maxlength="30">
          </div>
          <div class="cr-field" style="margin-bottom:0">
            <label>예금주 <span style="color:var(--orange)">*</span></label>
            <input type="text" id="inputRefundHolder" placeholder="실명" maxlength="20">
          </div>
        </div>
      </div>

      <button class="cr-btn" id="submitBtn" onclick="submitRequest()">충전 신청하기</button>
    </div>

    <!-- 신청 내역 -->
    <div class="cr-card">
      <div class="cr-card-title">내 신청 내역</div>
      <div id="requestList"><div class="cr-empty">로딩 중...</div></div>
    </div>

  </div>
</div>

<script>
var _userId = null;
var _userName = null;

(function(){
  try {
    var raw = localStorage.getItem('sbt_session');
    if(raw){
      var sess = JSON.parse(raw);
      var uid = sess.id || sess.db_id;
      if(sess && uid && sess.type !== 'admin'){
        _userId = uid;
        _userName = sess.name || '';
        document.getElementById('chargeBox').style.display = 'block';
        loadBalance();
        loadRefundInfo();
        loadRequests();
      } else if(sess && sess.type === 'admin'){
        window.location.href = 'admin_charge.php?pw=qkrdbwns16^';
      } else {
        document.getElementById('notLoginBox').style.display = 'block';
      }
    } else {
      document.getElementById('notLoginBox').style.display = 'block';
    }
  } catch(e){
    document.getElementById('notLoginBox').style.display = 'block';
  }
})();

function apiUrl(action){
  return '/api/cash.php?action='+action+'&uid='+encodeURIComponent(_userId);
}

function loadBalance(){
  fetch('/api/user.php?action=info&uid='+encodeURIComponent(_userId))
  .then(function(r){ return r.json(); }).then(function(res){
    if(res.ok && res.user){
      var bal = Number(res.user.cash||0);
      document.getElementById('balanceDisplay').textContent = bal.toLocaleString();
    } else {
      document.getElementById('balanceDisplay').textContent = '0';
    }
  }).catch(function(){
    document.getElementById('balanceDisplay').textContent = '0';
  });
}

function loadRefundInfo(){
  // 1) localStorage 우선 (빠른 자동완성)
  try {
    var saved = JSON.parse(localStorage.getItem('sbt_refund_info')||'{}');
    if(saved.bank || saved.account || saved.holder){
      document.getElementById('inputRefundBank').value    = saved.bank    || '';
      document.getElementById('inputRefundAccount').value = saved.account || '';
      document.getElementById('inputRefundHolder').value  = saved.holder  || '';
      document.getElementById('refundSavedTag').style.display = 'inline';
    }
  } catch(e){}

  // 2) 서버 DB에서 최신 정보 로드 (덮어쓰기)
  fetch(apiUrl('get_refund_info'))
  .then(function(r){ return r.json(); }).then(function(res){
    if(res.ok && (res.bank || res.account || res.holder)){
      document.getElementById('inputRefundBank').value    = res.bank    || '';
      document.getElementById('inputRefundAccount').value = res.account || '';
      document.getElementById('inputRefundHolder').value  = res.holder  || '';
      document.getElementById('refundSavedTag').style.display = 'inline';
      // localStorage도 업데이트
      try { localStorage.setItem('sbt_refund_info', JSON.stringify({bank:res.bank,account:res.account,holder:res.holder})); } catch(e){}
    }
  }).catch(function(){});
}

function copyAccount(){
  var num = document.getElementById('accountNum').textContent;
  navigator.clipboard.writeText(num).then(function(){
    alert('계좌번호가 복사됐습니다: ' + num);
  }).catch(function(){
    prompt('계좌번호를 복사해주세요:', num);
  });
}

function setAmount(v){ document.getElementById('inputAmount').value = v; }

function showAlert(msg, ok){
  var el = document.getElementById('alertBox');
  el.className = 'alert ' + (ok ? 'alert-ok' : 'alert-err');
  el.textContent = msg;
  el.style.display = 'block';
  if(ok) setTimeout(function(){ el.style.display='none'; }, 4000);
}

function submitRequest(){
  if(!_userId){ showAlert('로그인이 필요합니다.',false); return; }
  var amount        = parseInt(document.getElementById('inputAmount').value)||0;
  var depositor     = document.getElementById('inputDepositor').value.trim();
  var memo          = document.getElementById('inputMemo').value.trim();
  var refundBank    = document.getElementById('inputRefundBank').value.trim();
  var refundAccount = document.getElementById('inputRefundAccount').value.trim();
  var refundHolder  = document.getElementById('inputRefundHolder').value.trim();

  if(amount < 10000 || amount > 1000000 || amount % 1000 !== 0){
    showAlert('금액은 10,000전 이상, 1,000 단위로 입력해주세요.', false); return;
  }
  if(!depositor){ showAlert('입금자명을 입력해주세요.', false); return; }
  if(!refundBank || !refundAccount || !refundHolder){
    showAlert('환불받을 계좌 정보를 모두 입력해주세요.', false); return;
  }

  var btn = document.getElementById('submitBtn');
  btn.disabled = true; btn.textContent = '신청 중...';

  fetch(apiUrl('request_charge'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount:         amount,
      depositor:      depositor,
      memo:           memo,
      refund_bank:    refundBank,
      refund_account: refundAccount,
      refund_holder:  refundHolder
    })
  })
  .then(function(r){ return r.json(); })
  .then(function(res){
    btn.disabled = false; btn.textContent = '충전 신청하기';
    if(res.ok){
      showAlert(res.msg || '신청 완료!', true);
      // 환불계좌 localStorage 저장
      try { localStorage.setItem('sbt_refund_info', JSON.stringify({bank:refundBank,account:refundAccount,holder:refundHolder})); } catch(e){}
      document.getElementById('refundSavedTag').style.display = 'inline';
      document.getElementById('inputAmount').value = '';
      document.getElementById('inputDepositor').value = '';
      loadRequests();
    } else {
      showAlert(res.msg || '오류가 발생했습니다.', false);
    }
  })
  .catch(function(err){
    btn.disabled = false; btn.textContent = '충전 신청하기';
    showAlert('요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', false);
  });
}

function loadRequests(){
  if(!_userId) return;
  fetch(apiUrl('get_charge_requests'))
  .then(function(r){ return r.json(); })
  .then(function(res){
    var el = document.getElementById('requestList');
    if(!res.ok || !res.list || !res.list.length){
      el.innerHTML = '<div class="cr-empty">신청 내역이 없습니다.</div>'; return;
    }
    var statusMap = {
      pending:  '<span class="status-badge status-pending">검토중</span>',
      approved: '<span class="status-badge status-approved">승인</span>',
      rejected: '<span class="status-badge status-rejected">거절</span>'
    };
    el.innerHTML = '<table class="cr-table"><thead><tr><th>신청일</th><th>금액</th><th>입금자명</th><th>환불계좌</th><th>상태</th></tr></thead><tbody>'
      + res.list.map(function(r){
          var refund = [r.refund_bank, r.refund_account, r.refund_holder].filter(Boolean).join(' / ') || '-';
          return '<tr>'
            + '<td>' + String(r.created_at||'').slice(0,16) + '</td>'
            + '<td style="font-weight:700;color:var(--orange)">' + Number(r.amount).toLocaleString() + '전</td>'
            + '<td>' + (r.depositor_name||'') + '</td>'
            + '<td style="font-size:12px;color:var(--text-mid)">' + refund + '</td>'
            + '<td>' + (statusMap[r.status] || r.status) + '</td>'
            + '</tr>';
        }).join('')
      + '</tbody></table>';
  })
  .catch(function(){});
}
</script>
</body>
</html>
