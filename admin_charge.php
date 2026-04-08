<?php
/**
 * 설비트리거 - 관리자 캐시 충전 처리 페이지
 */
require_once __DIR__ . '/db.php';
session_start();

// 인증: 세션 관리자 또는 GET 파라미터 비밀번호
$adminPw = $_GET['pw'] ?? '';
$isAdmin = ($adminPw === 'qkrdbwns16^')
        || (($_SESSION['sbt_user']['type'] ?? '') === 'admin');

if (!$isAdmin) {
    http_response_code(403);
    echo '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>접근 거부</title></head><body style="font-family:sans-serif;text-align:center;padding:60px"><h2>🔒 관리자 전용 페이지</h2><p>URL에 ?pw=비밀번호 를 추가하거나 관리자로 로그인하세요.</p></body></html>';
    exit;
}

// DB에서 신청 목록
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS sbt_charge_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount INT NOT NULL,
        depositor_name VARCHAR(50) NOT NULL DEFAULT '',
        status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
        memo TEXT,
        processed_by VARCHAR(50) DEFAULT NULL,
        processed_at DATETIME DEFAULT NULL,
        created_at DATETIME NOT NULL,
        INDEX idx_user(user_id),
        INDEX idx_status(status)
    )");
} catch(Exception $e){}

$statusFilter = $_GET['status'] ?? 'pending';
$page  = max(1,(int)($_GET['page'] ?? 1));
$limit = 20;
$offset= ($page-1)*$limit;

$where  = $statusFilter !== 'all' ? "WHERE r.status='".htmlspecialchars($statusFilter)."'" : '';
$total  = (int)$pdo->query("SELECT COUNT(*) FROM sbt_charge_requests r $where")->fetchColumn();
$pages  = max(1,ceil($total/$limit));

$st = $pdo->prepare("SELECT r.*,u.name,u.username FROM sbt_charge_requests r
    LEFT JOIN sbt_users u ON u.id=r.user_id $where ORDER BY r.id DESC LIMIT ? OFFSET ?");
$st->execute([$limit,$offset]);
$requests = $st->fetchAll();

// 전체 통계
$stats = $pdo->query("SELECT status, COUNT(*) AS cnt, SUM(amount) AS total
    FROM sbt_charge_requests GROUP BY status")->fetchAll();
$statMap = [];
foreach($stats as $s) $statMap[$s['status']] = $s;
?>
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>캐시 충전 관리 — 설비트리거 관리자</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
<style>
  body{background:var(--surface);min-height:100vh;margin:0;padding:0}
  .adm-header{background:var(--dark);color:#fff;padding:16px 32px;display:flex;align-items:center;gap:16px}
  .adm-header h1{margin:0;font-size:18px;font-weight:700}
  .adm-header a{color:#9CA3AF;text-decoration:none;font-size:13px;margin-left:auto}
  .adm-wrap{max-width:1100px;margin:0 auto;padding:28px 20px 60px}
  .stat-row{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:24px}
  .stat-card{background:#fff;border:1.5px solid var(--border-light);border-radius:var(--radius);padding:18px 22px;box-shadow:var(--shadow-sm)}
  .stat-card-label{font-size:11px;font-weight:700;color:var(--text-mid);letter-spacing:.5px;text-transform:uppercase;margin-bottom:8px}
  .stat-card-val{font-size:26px;font-weight:800}
  .stat-card-sub{font-size:12px;color:var(--text-light);margin-top:4px}
  .adm-card{background:#fff;border:1.5px solid var(--border-light);border-radius:var(--radius);box-shadow:var(--shadow-sm);margin-bottom:20px;overflow:hidden}
  .adm-card-head{padding:16px 22px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .adm-card-title{font-size:14px;font-weight:700;color:var(--text);flex:1}
  .filter-tabs{display:flex;gap:6px}
  .ftab{padding:5px 14px;border:1.5px solid var(--border);border-radius:20px;font-size:12px;font-weight:600;color:var(--text-mid);cursor:pointer;text-decoration:none;transition:all .15s}
  .ftab.active,.ftab:hover{border-color:var(--orange);color:var(--orange);background:#FFF3EE}
  .adm-table{width:100%;border-collapse:collapse;font-size:13px}
  .adm-table th{padding:11px 14px;background:var(--surface);color:var(--text-mid);font-size:11px;font-weight:700;text-align:left;border-bottom:2px solid var(--border);white-space:nowrap}
  .adm-table td{padding:12px 14px;border-bottom:1px solid var(--border-light);vertical-align:middle}
  .adm-table tr:hover td{background:#FFFAF7}
  .adm-table tr:last-child td{border-bottom:none}
  .status-badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap}
  .status-pending{background:#FFF8E1;color:#F59E0B}
  .status-approved{background:#ECFDF5;color:#059669}
  .status-rejected{background:#FEF2F2;color:#DC2626}
  .adm-empty{text-align:center;padding:48px;color:var(--text-light);font-size:13px}
  .btn-approve{padding:5px 14px;background:var(--orange);color:#fff;border:none;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif}
  .btn-reject{padding:5px 14px;background:transparent;color:#DC2626;border:1.5px solid #FECACA;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif}
  .btn-approve:hover{opacity:.85}
  .btn-reject:hover{background:#FEF2F2}
  .pagination{display:flex;gap:6px;justify-content:center;padding:16px}
  .pag-btn{padding:6px 14px;border:1.5px solid var(--border);border-radius:4px;font-size:12px;color:var(--text-mid);text-decoration:none;transition:all .15s}
  .pag-btn.active,.pag-btn:hover{border-color:var(--orange);color:var(--orange)}
  .modal-bg{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:500;align-items:center;justify-content:center}
  .modal-box{background:#fff;border-radius:var(--radius);width:min(480px,94vw);padding:28px 32px;box-shadow:0 8px 40px rgba(0,0,0,.2)}
  .modal-title{font-size:16px;font-weight:700;color:var(--text);margin:0 0 4px}
  .modal-sub{font-size:13px;color:var(--text-mid);margin:0 0 20px}
  .modal-field{margin-bottom:14px}
  .modal-field label{display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:5px}
  .modal-field input{width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;box-sizing:border-box}
  .modal-field input:focus{border-color:var(--orange)}
  .modal-btns{display:flex;gap:8px;justify-content:flex-end;margin-top:20px}
  .integrity-result{padding:14px 18px;border-radius:8px;font-size:13px;margin-top:14px}
  .integrity-ok{background:#ECFDF5;color:#059669;border:1px solid #A7F3D0}
  .integrity-err{background:#FEF2F2;color:#DC2626;border:1px solid #FECACA}
</style>
</head>
<body>
<div class="adm-header">
  <h1>🔧 캐시 충전 관리</h1>
  <a href="index.html">← 메인</a>
</div>

<div class="adm-wrap">

  <!-- 통계 카드 -->
  <div class="stat-row">
    <div class="stat-card">
      <div class="stat-card-label">검토중</div>
      <div class="stat-card-val" style="color:#F59E0B"><?= number_format((int)($statMap['pending']['cnt'] ?? 0)) ?></div>
      <div class="stat-card-sub"><?= number_format((int)($statMap['pending']['total'] ?? 0)) ?>C 대기 중</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-label">승인 완료</div>
      <div class="stat-card-val" style="color:#059669"><?= number_format((int)($statMap['approved']['cnt'] ?? 0)) ?></div>
      <div class="stat-card-sub">누적 <?= number_format((int)($statMap['approved']['total'] ?? 0)) ?>C 충전</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-label">거절</div>
      <div class="stat-card-val" style="color:#DC2626"><?= number_format((int)($statMap['rejected']['cnt'] ?? 0)) ?></div>
      <div class="stat-card-sub"><?= number_format((int)($statMap['rejected']['total'] ?? 0)) ?>C</div>
    </div>
  </div>

  <!-- 정합성 검증 -->
  <div class="adm-card" style="margin-bottom:20px">
    <div class="adm-card-head">
      <span class="adm-card-title">🔍 잔액 정합성 검증</span>
      <button onclick="checkIntegrity()" style="padding:7px 18px;background:var(--dark);color:#fff;border:none;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">검증 실행</button>
    </div>
    <div style="padding:16px 22px">
      <p style="font-size:12px;color:var(--text-light);margin:0 0 10px">sbt_users.cash 잔액과 sbt_cash_log 합계를 비교합니다. 불일치 항목만 표시됩니다.</p>
      <div id="integrityResult" class="integrity-result" style="display:none"></div>
    </div>
  </div>

  <!-- 신청 목록 -->
  <div class="adm-card">
    <div class="adm-card-head">
      <span class="adm-card-title">충전 신청 목록</span>
      <div class="filter-tabs">
        <a class="ftab <?= $statusFilter==='pending'?'active':'' ?>" href="?status=pending<?= $adminPw?"&pw=$adminPw":'' ?>">검토중 (<?= (int)($statMap['pending']['cnt']??0) ?>)</a>
        <a class="ftab <?= $statusFilter==='approved'?'active':'' ?>" href="?status=approved<?= $adminPw?"&pw=$adminPw":'' ?>">승인</a>
        <a class="ftab <?= $statusFilter==='rejected'?'active':'' ?>" href="?status=rejected<?= $adminPw?"&pw=$adminPw":'' ?>">거절</a>
        <a class="ftab <?= $statusFilter==='all'?'active':'' ?>" href="?status=all<?= $adminPw?"&pw=$adminPw":'' ?>">전체</a>
      </div>
    </div>

    <?php if (!$requests): ?>
    <div class="adm-empty">해당 신청이 없습니다.</div>
    <?php else: ?>
    <table class="adm-table">
      <thead>
        <tr>
          <th>#</th><th>신청일시</th><th>회원</th><th>금액</th><th>입금자명</th><th>메모</th><th>상태</th>
          <?php if($statusFilter==='pending'||$statusFilter==='all'): ?><th>처리</th><?php endif; ?>
        </tr>
      </thead>
      <tbody>
      <?php foreach($requests as $r): ?>
        <tr id="row-<?= $r['id'] ?>">
          <td style="color:var(--text-light)"><?= $r['id'] ?></td>
          <td><?= htmlspecialchars(substr($r['created_at'],0,16)) ?></td>
          <td>
            <div style="font-weight:700"><?= htmlspecialchars($r['name']??'탈퇴회원') ?></div>
            <div style="font-size:11px;color:var(--text-light)"><?= htmlspecialchars($r['username']??'') ?></div>
          </td>
          <td style="font-weight:800;color:var(--orange)"><?= number_format($r['amount']) ?>C</td>
          <td><?= htmlspecialchars($r['depositor_name']) ?></td>
          <td style="color:var(--text-mid);max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><?= htmlspecialchars($r['memo']??'') ?: '-' ?></td>
          <td>
            <span class="status-badge status-<?= $r['status'] ?>">
              <?= ['pending'=>'검토중','approved'=>'승인','rejected'=>'거절'][$r['status']] ?? $r['status'] ?>
            </span>
            <?php if($r['processed_at']): ?>
            <div style="font-size:10px;color:var(--text-light);margin-top:3px"><?= substr($r['processed_at'],0,16) ?></div>
            <?php endif; ?>
          </td>
          <?php if($statusFilter==='pending'||$statusFilter==='all'): ?>
          <td>
            <?php if($r['status']==='pending'): ?>
            <div style="display:flex;gap:6px">
              <button class="btn-approve" onclick="openProcess(<?= $r['id'] ?>,<?= $r['amount'] ?>,'<?= htmlspecialchars($r['depositor_name']) ?>','approve')">✓ 승인</button>
              <button class="btn-reject"  onclick="openProcess(<?= $r['id'] ?>,<?= $r['amount'] ?>,'<?= htmlspecialchars($r['depositor_name']) ?>','reject')">✕ 거절</button>
            </div>
            <?php else: ?><span style="color:var(--text-light);font-size:12px">처리완료</span><?php endif; ?>
          </td>
          <?php endif; ?>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>

    <!-- 페이지네이션 -->
    <?php if($pages > 1): ?>
    <div class="pagination">
      <?php for($i=1;$i<=$pages;$i++): ?>
      <a class="pag-btn <?= $i===$page?'active':'' ?>" href="?status=<?= $statusFilter ?>&page=<?= $i ?><?= $adminPw?"&pw=$adminPw":'' ?>"><?= $i ?></a>
      <?php endfor; ?>
    </div>
    <?php endif; ?>
    <?php endif; ?>
  </div>
</div>

<!-- 처리 모달 -->
<div class="modal-bg" id="processModal" style="display:none;align-items:center;justify-content:center">
  <div class="modal-box">
    <p class="modal-title" id="modalTitle">충전 승인</p>
    <p class="modal-sub" id="modalSub"></p>
    <div id="modalAlert" style="display:none;padding:10px 14px;border-radius:6px;font-size:13px;margin-bottom:14px"></div>
    <div class="modal-field">
      <label>관리자 메모 <span style="font-weight:400;color:var(--text-light)">(선택)</span></label>
      <input type="text" id="modalMemo" placeholder="처리 사유나 메모를 입력하세요">
    </div>
    <div class="modal-btns">
      <button onclick="closeModal()" style="padding:9px 20px;background:transparent;border:1.5px solid var(--border);border-radius:4px;font-size:13px;color:var(--text-mid);cursor:pointer;font-family:'Noto Sans KR',sans-serif">취소</button>
      <button id="modalConfirmBtn" onclick="confirmProcess()" style="padding:9px 22px;border:none;border-radius:4px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">확인</button>
    </div>
  </div>
</div>

<script>
var _curReqId=0, _curAction='';
var ADMIN_PW='qkrdbwns16^';

function openProcess(id,amount,depositor,action){
  _curReqId=id; _curAction=action;
  var isApprove=action==='approve';
  document.getElementById('modalTitle').textContent=isApprove?'✓ 충전 승인':'✕ 충전 거절';
  document.getElementById('modalSub').textContent=(isApprove?'승인':'거절')+'할 신청: '+Number(amount).toLocaleString()+'C / 입금자: '+depositor;
  document.getElementById('modalMemo').value='';
  document.getElementById('modalAlert').style.display='none';
  var btn=document.getElementById('modalConfirmBtn');
  btn.style.background=isApprove?'#E8500A':'#DC2626'; btn.style.color='#fff';
  btn.textContent=isApprove?'승인 처리':'거절 처리';
  document.getElementById('processModal').style.display='flex';
  setTimeout(function(){document.getElementById('modalMemo').focus();},100);
}
function closeModal(){ document.getElementById('processModal').style.display='none'; }

function confirmProcess(){
  var btn=document.getElementById('modalConfirmBtn');
  btn.disabled=true; btn.textContent='처리 중...';
  fetch('/api/cash.php?action=admin_process_charge',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({request_id:_curReqId,action:_curAction,memo:document.getElementById('modalMemo').value.trim(),admin_pw:ADMIN_PW})
  }).then(function(r){return r.json();}).then(function(res){
    btn.disabled=false;
    if(res.ok){
      closeModal();
      var row=document.getElementById('row-'+_curReqId);
      if(row) row.style.opacity='0.4';
      setTimeout(function(){location.reload();},600);
    } else {
      var al=document.getElementById('modalAlert');
      al.style.display='block'; al.style.background='#FEF2F2'; al.style.color='#DC2626';
      al.textContent=res.msg||'오류가 발생했습니다.';
      btn.textContent=_curAction==='approve'?'승인 처리':'거절 처리';
    }
  }).catch(function(){
    btn.disabled=false; btn.textContent='오류 - 재시도';
  });
}
document.getElementById('processModal').addEventListener('click',function(e){if(e.target===this)closeModal();});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeModal();});

function checkIntegrity(){
  var el=document.getElementById('integrityResult');
  el.style.display='block'; el.className='integrity-result'; el.textContent='검증 중...';
  fetch('/api/cash.php?action=integrity_check&admin_pw='+ADMIN_PW)
    .then(function(r){return r.json();}).then(function(res){
      if(!res.ok){el.className='integrity-result integrity-err';el.textContent='오류: '+(res.msg||'');return;}
      var m=res.mismatches;
      if(!m||!m.length){el.className='integrity-result integrity-ok';el.textContent='✅ 모든 잔액이 내역 합계와 일치합니다.';return;}
      el.className='integrity-result integrity-err';
      el.innerHTML='⚠️ 불일치 '+m.length+'건:<br>'
        +m.map(function(r){return '&nbsp;&nbsp;ID:'+r.id+' '+r.username+'('+r.name+') 잔액:'+Number(r.balance).toLocaleString()+'C / 내역합:'+Number(r.log_sum).toLocaleString()+'C / 차이:'+Number(r.diff).toLocaleString()+'C';}).join('<br>');
    }).catch(function(){el.className='integrity-result integrity-err';el.textContent='네트워크 오류';});
}
</script>
</body>
</html>
