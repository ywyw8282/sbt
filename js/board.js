/* ─── 동산보드 ─── */
/* ─── 동산보드 상태 ─── */
// boardGroups: [{id, name, items:[{id,photos,title,company,location,work,date,pos,scale}]}]
// boardItems: 그룹 없는 단독 아이템 [{id,photos,...,groupId:null}]
let boardGroups=[], boardItems=[];
let dboardPhotos=[], dboardPos='bl', dboardScale=100;
let currentGroupTarget=null, geditGroupId=null, geditPos='none';

function todayStr(){ return new Date().toISOString().slice(0,10); }

/* ══════════════════════════════════════════════
   동산보드 HTML 초기화 — index.html 대신 여기서 생성
   board.js만 수정하면 UI 전체 변경 가능
══════════════════════════════════════════════ */
function initBoardHTML(){

  /* ── 동산보드 페이지 ── */
  document.getElementById('page-board').innerHTML = [
    '<div style="max-width:1200px;margin:0 auto;padding:32px 40px">',
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:24px">',
        '<div>',
          '<h2 style="font-size:24px;font-weight:700;margin-bottom:4px">동산보드</h2>',
          '<p style="font-size:13px;color:var(--text-mid)">현장 사진에 공사명·공종·위치·내용·날짜를 표 형태로 표시합니다.</p>',
        '</div>',
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">',
          '<button onclick="deleteAllBoards()" style="padding:8px 14px;background:transparent;color:#C0392B;border:1px solid #C0392B;border-radius:4px;font-size:12px;font-weight:500;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">🗑 전체 삭제</button>',
          '<button onclick="exportAllBoardsZip()" style="padding:8px 14px;background:var(--dark);color:var(--white);border:none;border-radius:4px;font-size:12px;font-weight:500;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">⬇ 전체 저장 (ZIP)</button>',
          '<button onclick="openGroupModal()" style="padding:8px 14px;background:#2A4A8A;color:#A8C4FF;border:1px solid #3A6BC8;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">📁 그룹 시작</button>',
          '<button onclick="openBoardModal()" style="padding:8px 18px;background:var(--orange);color:var(--white);border:none;border-radius:4px;font-size:13px;font-weight:700;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">+ 새 동산보드 추가</button>',
        '</div>',
      '</div>',
      '<div id="boardGrid" style="display:flex;flex-direction:column;gap:24px">',
        '<div style="text-align:center;padding:60px 20px;color:var(--text-light)">',
          '<div style="font-size:40px;margin-bottom:12px;opacity:.3">🏗</div>',
          '<p style="font-size:14px">아직 등록된 동산보드가 없습니다.</p>',
          '<p style="font-size:12px;margin-top:4px">"+ 새 동산보드 추가" 또는 "그룹 시작" 버튼을 눌러 시작하세요.</p>',
        '</div>',
      '</div>',
    '</div>'
  ].join('');

  /* ── 그룹 이름 입력 모달 ── */
  document.getElementById('groupModal').innerHTML = [
    '<div style="background:var(--white);border-radius:8px;width:400px;box-shadow:0 20px 60px rgba(0,0,0,.3);overflow:hidden">',
      '<div style="background:#1A2F5A;padding:16px 20px;display:flex;align-items:center;justify-content:space-between">',
        '<h3 style="font-size:15px;font-weight:700;color:var(--white)">📁 그룹 시작</h3>',
        '<button onclick="closeGroupModal()" style="background:none;border:none;color:#888;cursor:pointer;font-size:18px">✕</button>',
      '</div>',
      '<div style="padding:24px;display:flex;flex-direction:column;gap:14px">',
        '<div>',
          '<label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:6px">그룹 이름</label>',
          '<input type="text" id="groupNameInput" placeholder="예) 클럽하우스 2층 설비" style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:4px;font-size:14px;font-family:\'Noto Sans KR\',sans-serif;outline:none">',
        '</div>',
        '<p style="font-size:12px;color:var(--text-light)">그룹 안에서 동산보드를 추가하고 일괄 관리할 수 있습니다.</p>',
      '</div>',
      '<div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;background:#FAFAF8">',
        '<button onclick="closeGroupModal()" style="padding:8px 16px;background:transparent;border:1px solid var(--border);border-radius:4px;font-size:13px;color:var(--text-mid);cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">취소</button>',
        '<button onclick="saveGroup()" style="padding:8px 20px;background:#2A4A8A;color:#fff;border:none;border-radius:4px;font-size:13px;font-weight:700;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">그룹 만들기</button>',
      '</div>',
    '</div>'
  ].join('');
  var gm = document.getElementById('groupModal');
  gm.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:3000;display:none;align-items:center;justify-content:center';

  /* ── 그룹 일괄 수정 모달 ── */
  document.getElementById('groupEditModal').innerHTML = [
    '<div style="background:var(--white);border-radius:8px;width:560px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3)">',
      '<div style="background:#1A2F5A;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:1;border-radius:8px 8px 0 0">',
        '<div>',
          '<h3 style="font-size:15px;font-weight:700;color:var(--white)">✏️ 그룹 일괄 수정</h3>',
          '<p id="groupEditSubtitle" style="font-size:11px;color:#7090C0;margin-top:2px"></p>',
        '</div>',
        '<button onclick="closeGroupEditModal()" style="background:none;border:none;color:#888;cursor:pointer;font-size:18px">✕</button>',
      '</div>',
      '<div style="padding:20px;display:flex;flex-direction:column;gap:14px">',
        '<div style="background:#E8F0FB;border:1px solid #3A6BC8;border-radius:4px;padding:10px 14px;font-size:12px;color:#1A3A6A">',
          '✅ 입력한 항목만 그룹 내 전체 사진에 반영됩니다. 비워두면 기존 값이 유지됩니다.',
        '</div>',
        '<table style="width:100%;border-collapse:collapse;border:1px solid var(--border);overflow:hidden">',
          '<tr><td style="background:#F9F7F3;padding:10px 14px;font-size:13px;font-weight:700;color:var(--text-mid);border:1px solid var(--border);width:28%;white-space:nowrap">공 사 명</td><td style="padding:6px 8px;border:1px solid var(--border)"><input type="text" id="gedit_title" placeholder="비워두면 유지" style="width:100%;padding:6px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:\'Noto Sans KR\',sans-serif;outline:none"></td></tr>',
          '<tr><td style="background:#F9F7F3;padding:10px 14px;font-size:13px;font-weight:700;color:var(--text-mid);border:1px solid var(--border);white-space:nowrap">공 종</td><td style="padding:6px 8px;border:1px solid var(--border)"><input type="text" id="gedit_company" placeholder="비워두면 유지" style="width:100%;padding:6px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:\'Noto Sans KR\',sans-serif;outline:none"></td></tr>',
          '<tr><td style="background:#F9F7F3;padding:10px 14px;font-size:13px;font-weight:700;color:var(--text-mid);border:1px solid var(--border);white-space:nowrap">위 치</td><td style="padding:6px 8px;border:1px solid var(--border)"><input type="text" id="gedit_location" placeholder="비워두면 유지" style="width:100%;padding:6px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:\'Noto Sans KR\',sans-serif;outline:none"></td></tr>',
          '<tr><td style="background:#F9F7F3;padding:10px 14px;font-size:13px;font-weight:700;color:var(--text-mid);border:1px solid var(--border);white-space:nowrap">내 용</td><td style="padding:6px 8px;border:1px solid var(--border)"><input type="text" id="gedit_work" placeholder="비워두면 유지" style="width:100%;padding:6px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:\'Noto Sans KR\',sans-serif;outline:none"></td></tr>',
          '<tr><td style="background:#F9F7F3;padding:10px 14px;font-size:13px;font-weight:700;color:var(--text-mid);border:1px solid var(--border);white-space:nowrap">날 짜</td><td style="padding:6px 8px;border:1px solid var(--border)"><input type="date" id="gedit_date" style="width:100%;padding:6px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:\'Noto Sans KR\',sans-serif;outline:none"></td></tr>',
        '</table>',
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">',
          '<div>',
            '<label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:8px">표 위치 <span style="font-weight:400;color:var(--text-light)">(선택 안 하면 유지)</span></label>',
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">',
              '<button class="pos-btn active" id="gedit_pos_none" onclick="selectGeditPos(this,\'none\')" style="grid-column:1/-1;font-size:11px">변경 안 함</button>',
              '<button class="pos-btn" data-gepos="tl" onclick="selectGeditPos(this,\'tl\')">↖ 좌측 상단</button>',
              '<button class="pos-btn" data-gepos="tr" onclick="selectGeditPos(this,\'tr\')">↗ 우측 상단</button>',
              '<button class="pos-btn" data-gepos="bl" onclick="selectGeditPos(this,\'bl\')">↙ 좌측 하단</button>',
              '<button class="pos-btn" data-gepos="br" onclick="selectGeditPos(this,\'br\')">↘ 우측 하단</button>',
            '</div>',
          '</div>',
          '<div>',
            '<label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:8px">표 크기 <span id="geditScalePct" style="color:var(--orange);font-weight:400">변경 안 함</span></label>',
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">',
              '<input type="checkbox" id="geditScaleCheck" onchange="toggleGeditScale(this)" style="accent-color:var(--orange)">',
              '<label for="geditScaleCheck" style="font-size:12px;color:var(--text-mid);cursor:pointer">크기 변경</label>',
            '</div>',
            '<input type="range" id="geditScale" min="50" max="200" value="100" step="5" disabled style="width:100%;accent-color:var(--orange)" oninput="document.getElementById(\'geditScalePct\').textContent=this.value+\'%\'">',
          '</div>',
        '</div>',
      '</div>',
      '<div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;background:#FAFAF8;border-radius:0 0 8px 8px">',
        '<button onclick="closeGroupEditModal()" style="padding:9px 16px;background:transparent;border:1px solid var(--border);border-radius:4px;font-size:13px;color:var(--text-mid);cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">취소</button>',
        '<button onclick="applyGroupEdit()" style="padding:9px 20px;background:#2A4A8A;color:#fff;border:none;border-radius:4px;font-size:13px;font-weight:700;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">전체 적용</button>',
      '</div>',
    '</div>'
  ].join('');
  var gem = document.getElementById('groupEditModal');
  gem.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:3100;display:none;align-items:center;justify-content:center';

  /* ── 동산보드 편집 모달 ── */
  document.getElementById('dboardModal').innerHTML = [
    '<div style="background:var(--white);border-radius:8px;width:640px;max-height:92vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3)">',
      '<div style="background:var(--dark);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:1;border-radius:8px 8px 0 0">',
        '<h3 id="dboardModalTitle" style="font-size:15px;font-weight:700;color:var(--white)">동산보드 추가</h3>',
        '<button onclick="closeBoardModal()" style="background:none;border:none;color:#888;cursor:pointer;font-size:18px">✕</button>',
      '</div>',
      '<div style="padding:24px;display:flex;flex-direction:column;gap:16px">',

        '<!-- 사진 업로드 -->',
        '<div>',
          '<label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:6px">현장 사진 <span style="color:var(--orange)">*</span></label>',
          '<div id="dboardImgArea" onclick="document.getElementById(\'dboardFileInput\').click()"',
          '  style="border:2px dashed var(--border);border-radius:6px;min-height:160px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;background:#FAFAF8;transition:border-color .15s,background .15s;position:relative">',
            '<div id="dboardUploadHint" style="text-align:center;color:var(--text-light);pointer-events:none;padding:16px;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:100%">',
              '<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.4"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
              '<p style="font-size:13px;margin-top:10px;color:var(--text-mid);font-weight:600">클릭하거나 사진을 드래그하세요</p>',
              '<p style="font-size:11px;color:var(--text-light);margin-top:5px">JPG · PNG · GIF · 여러 장 동시 가능</p>',
            '</div>',
            '<img id="dboardPreviewImg" src="" alt="" style="max-width:100%;max-height:240px;display:none;border-radius:4px;pointer-events:none;position:relative;z-index:1">',
          '</div>',
          '<input type="file" id="dboardFileInput" accept="image/*" multiple style="display:none" onchange="dboardLoadFile(this)">',
          '<div id="dboardMultiList" style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px"></div>',
          '<div style="margin-top:4px"><span style="font-size:11px;color:var(--text-light)">여러 장 선택 시 각 사진마다 동산보드가 생성됩니다</span></div>',
        '</div>',

        '<!-- 정보 입력 -->',
        '<div>',
          '<label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:8px">동산보드 정보 입력</label>',
          '<table style="width:100%;border-collapse:collapse;border:1px solid var(--border);border-radius:6px;overflow:hidden">',
            '<tr><td style="background:#F9F7F3;padding:10px 14px;font-size:13px;font-weight:700;color:var(--text-mid);border:1px solid var(--border);width:30%;white-space:nowrap">공 사 명</td><td style="padding:6px 8px;border:1px solid var(--border)"><input type="text" id="dboard_title" placeholder="예) 강남동 아파트 공사" style="width:100%;padding:6px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:\'Noto Sans KR\',sans-serif;outline:none"></td></tr>',
            '<tr><td style="background:#F9F7F3;padding:10px 14px;font-size:13px;font-weight:700;color:var(--text-mid);border:1px solid var(--border);white-space:nowrap">공 종</td><td style="padding:6px 8px;border:1px solid var(--border)"><input type="text" id="dboard_company" placeholder="예) 기계설비" style="width:100%;padding:6px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:\'Noto Sans KR\',sans-serif;outline:none"></td></tr>',
            '<tr><td style="background:#F9F7F3;padding:10px 14px;font-size:13px;font-weight:700;color:var(--text-mid);border:1px solid var(--border);white-space:nowrap">위 치</td><td style="padding:6px 8px;border:1px solid var(--border)"><input type="text" id="dboard_location" placeholder="예) 1동 14층" style="width:100%;padding:6px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:\'Noto Sans KR\',sans-serif;outline:none"></td></tr>',
            '<tr><td style="background:#F9F7F3;padding:10px 14px;font-size:13px;font-weight:700;color:var(--text-mid);border:1px solid var(--border);white-space:nowrap">내 용</td><td style="padding:6px 8px;border:1px solid var(--border)"><input type="text" id="dboard_work" placeholder="예) 위생배관" style="width:100%;padding:6px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:\'Noto Sans KR\',sans-serif;outline:none"></td></tr>',
            '<tr><td style="background:#F9F7F3;padding:10px 14px;font-size:13px;font-weight:700;color:var(--text-mid);border:1px solid var(--border);white-space:nowrap">날 짜</td><td style="padding:6px 8px;border:1px solid var(--border)"><input type="date" id="dboard_date" style="width:100%;padding:6px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:\'Noto Sans KR\',sans-serif;outline:none"></td></tr>',
          '</table>',
        '</div>',

        '<!-- 표 위치 + 크기 -->',
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">',
          '<div>',
            '<label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:8px">표 위치 선택</label>',
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">',
              '<button class="pos-btn" data-pos="tl" onclick="selectPos(this,\'tl\')">↖ 좌측 상단</button>',
              '<button class="pos-btn" data-pos="tr" onclick="selectPos(this,\'tr\')">↗ 우측 상단</button>',
              '<button class="pos-btn active" data-pos="bl" onclick="selectPos(this,\'bl\')">↙ 좌측 하단</button>',
              '<button class="pos-btn" data-pos="br" onclick="selectPos(this,\'br\')">↘ 우측 하단</button>',
            '</div>',
          '</div>',
          '<div>',
            '<label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:8px">표 크기 &nbsp;<span id="scalePct" style="color:var(--orange);font-weight:400">100%</span></label>',
            '<input type="range" id="dboardScale" min="50" max="200" value="100" step="5" style="width:100%;accent-color:var(--orange);margin-top:8px" oninput="document.getElementById(\'scalePct\').textContent=this.value+\'%\';updateBoardPreview()">',
            '<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-light);margin-top:3px"><span>작게(50%)</span><span>크게(200%)</span></div>',
          '</div>',
        '</div>',

        '<!-- 미리보기 -->',
        '<div>',
          '<label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:8px">미리보기 <span style="font-weight:400;color:var(--text-light);font-size:11px">— 저장 결과와 동일합니다</span></label>',
          '<div style="background:#2A2A28;border-radius:6px;overflow:hidden;min-height:160px;display:flex;align-items:center;justify-content:center">',
            '<canvas id="dboardPreviewCanvas" style="display:none;max-width:100%"></canvas>',
            '<span id="dboardPreviewEmpty" style="color:#666;font-size:12px">사진을 등록하면 미리보기가 나타납니다</span>',
          '</div>',
        '</div>',

      '</div>',
      '<div style="padding:14px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;background:#FAFAF8;border-radius:0 0 8px 8px">',
        '<button onclick="closeBoardModal()" style="padding:9px 16px;background:transparent;border:1px solid var(--border);border-radius:4px;font-size:13px;color:var(--text-mid);cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">취소</button>',
        '<button onclick="saveBoardItem()" style="padding:9px 20px;background:var(--orange);color:var(--white);border:none;border-radius:4px;font-size:13px;font-weight:700;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">저장</button>',
      '</div>',
    '</div>'
  ].join('');
  var dm = document.getElementById('dboardModal');
  dm.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:3000;display:none;align-items:center;justify-content:center';
  var gm = document.getElementById('groupModal');
  gm.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:3000;display:none;align-items:center;justify-content:center';

  var gem = document.getElementById('groupEditModal');
  gem.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:3100;display:none;align-items:center;justify-content:center';
  ['dboard_title','dboard_company','dboard_location','dboard_work','dboard_date'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.addEventListener('input',updateBoardPreview);
  });
}

/* DOMContentLoaded 시 초기화 */
document.addEventListener('DOMContentLoaded', initBoardHTML);

/* ══════════════════════════════════════════════
   자재·용어집 페이지 HTML 초기화
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function(){
  var el = document.getElementById('page-matlist');
  if(!el) return;
  el.innerHTML = `
  <div style="max-width:1100px;margin:0 auto;padding:32px 40px">
    <div style="margin-bottom:24px">
      <h2 style="font-size:24px;font-weight:700;margin-bottom:6px">📖 자재·용어집</h2>
      <p style="font-size:14px;color:var(--text-mid)">건설 현장 자재명·용어를 한눈에 확인하고, 클릭하면 바로 검색됩니다.</p>
    </div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;flex-wrap:wrap">
      <div style="display:flex;gap:4px;background:var(--surface);border:1.5px solid var(--border);border-radius:8px;padding:3px">
        <button id="ml-tab-mat"  onclick="switchMatListTab('mat')"
          style="padding:7px 20px;border:none;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif;background:var(--orange);color:#fff;transition:all .15s">
          자재 목록
        </button>
        <button id="ml-tab-term" onclick="switchMatListTab('term')"
          style="padding:7px 20px;border:none;border-radius:6px;font-size:13px;font-weight:400;cursor:pointer;font-family:'Noto Sans KR',sans-serif;background:transparent;color:var(--text-mid);transition:all .15s">
          현장 용어
        </button>
      </div>
      <input id="matlist-search" type="text" placeholder="이름·별칭으로 검색..."
        oninput="renderMatList()"
        style="padding:9px 14px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;width:240px;background:var(--white)">
    </div>
    <div id="matlist-content"></div>
  </div>`;
});

/* ── 그룹 생성 ── */
function openGroupModal(){
  document.getElementById('groupNameInput').value='';
  document.getElementById('groupModal').style.display='flex';
  setTimeout(function(){ document.getElementById('groupNameInput').focus(); },100);
}
function closeGroupModal(){ document.getElementById('groupModal').style.display='none'; }
function saveGroup(){
  var name=document.getElementById('groupNameInput').value.trim()||'그룹 '+(boardGroups.length+1);
  boardGroups.push({id:Date.now(),name:name,items:[]});
  closeGroupModal(); renderBoardGrid();
}

/* ── 그룹 일괄수정 ── */
function openGroupEditModal(gid){
  geditGroupId=gid; geditPos='none';
  var g=boardGroups.find(function(g){ return g.id===gid; }); if(!g) return;
  document.getElementById('groupEditSubtitle').textContent='"'+g.name+'" — '+g.items.length+'장 일괄 수정';
  ['gedit_title','gedit_company','gedit_location','gedit_work'].forEach(function(id){ document.getElementById(id).value=''; });
  document.getElementById('gedit_date').value='';
  document.querySelectorAll('[data-gepos]').forEach(function(b){ b.classList.remove('active'); });
  document.getElementById('gedit_pos_none').classList.add('active');
  document.getElementById('geditScaleCheck').checked=false;
  document.getElementById('geditScale').disabled=true;
  document.getElementById('geditScalePct').textContent='변경 안 함';
  document.getElementById('groupEditModal').style.display='flex';
}
function closeGroupEditModal(){ document.getElementById('groupEditModal').style.display='none'; }
function selectGeditPos(el,pos){
  geditPos=pos;
  document.querySelectorAll('[data-gepos],[id="gedit_pos_none"]').forEach(function(b){ b.classList.remove('active'); });
  el.classList.add('active');
}
function toggleGeditScale(cb){
  document.getElementById('geditScale').disabled=!cb.checked;
  document.getElementById('geditScalePct').textContent=cb.checked?document.getElementById('geditScale').value+'%':'변경 안 함';
}
function applyGroupEdit(){
  var g=boardGroups.find(function(g){ return g.id===geditGroupId; });
  if(!g||!g.items.length){ alert('그룹에 항목이 없습니다.'); return; }
  var t=document.getElementById('gedit_title').value.trim();
  var co=document.getElementById('gedit_company').value.trim();
  var lo=document.getElementById('gedit_location').value.trim();
  var wo=document.getElementById('gedit_work').value.trim();
  var da=document.getElementById('gedit_date').value;
  var scaleOn=document.getElementById('geditScaleCheck').checked;
  var sc=parseInt(document.getElementById('geditScale').value||100);
  g.items.forEach(function(item){
    if(t)  item.title=t;
    if(co) item.company=co;
    if(lo) item.location=lo;
    if(wo) item.work=wo;
    if(da) item.date=da;
    if(geditPos!=='none') item.pos=geditPos;
    if(scaleOn) item.scale=sc;
  });
  closeGroupEditModal(); renderBoardGrid();
  alert('✅ '+g.items.length+'장에 일괄 적용됐습니다.');
}

/* ── 동산보드 추가 모달 ── */
// 마지막 입력값 기억
var lastDboardInfo = {title:'', company:'', location:'', work:''};
var editingBoardItemId = null;  // 수정 중인 아이템 id
var editingBoardGroupId = null; // 수정 중인 아이템의 그룹

function openBoardModal(itemId, groupId){
  currentGroupTarget=(groupId&&groupId!=='null'&&groupId!==null)?Number(groupId):null;
  editingBoardItemId = null;
  editingBoardGroupId = null;
  dboardPhotos=[]; dboardPos='bl'; dboardScale=100;
  document.getElementById('dboardModalTitle').textContent='동산보드 추가'+(currentGroupTarget?' (그룹)':'');
  // 마지막 입력값 자동 채우기 (첫 번째라면 빈칸)
  document.getElementById('dboard_title').value    = lastDboardInfo.title;
  document.getElementById('dboard_company').value  = lastDboardInfo.company;
  document.getElementById('dboard_location').value = lastDboardInfo.location;
  document.getElementById('dboard_work').value     = lastDboardInfo.work;
  document.getElementById('dboard_date').value=todayStr();
  var scaleEl=document.getElementById('dboardScale');
  if(scaleEl){ scaleEl.value=100; document.getElementById('scalePct').textContent='100%'; }
  document.getElementById('dboardPreviewImg').src='';
  document.getElementById('dboardPreviewImg').style.display='none';
  document.getElementById('dboardUploadHint').style.display='flex';
  document.getElementById('dboardPreviewCanvas').style.display='none';
  document.getElementById('dboardPreviewEmpty').style.display='block';
  document.querySelectorAll('.pos-btn').forEach(function(b){ b.classList.toggle('active',b.dataset.pos==='bl'); });
  renderMultiPhotoList();
  document.getElementById('dboardModal').style.display='flex';
}

/* ── 개별 수정 ── */
function editBoardItem(itemId, groupId){
  // 아이템 찾기
  var item = null;
  var gid = (groupId && groupId!=='null' && groupId!==null) ? Number(groupId) : null;
  if(gid){
    var g = boardGroups.find(function(g){ return g.id===gid; });
    if(g) item = g.items.find(function(i){ return i.id===itemId; });
  } else {
    item = boardItems.find(function(i){ return i.id===itemId; });
  }
  if(!item){ alert('아이템을 찾을 수 없습니다.'); return; }

  // 수정 모드로 모달 열기
  editingBoardItemId  = itemId;
  editingBoardGroupId = gid;
  currentGroupTarget  = gid;

  // 기존 값 채우기
  document.getElementById('dboard_title').value    = item.title    || '';
  document.getElementById('dboard_company').value  = item.company  || '';
  document.getElementById('dboard_location').value = item.location || '';
  document.getElementById('dboard_work').value     = item.work     || '';
  document.getElementById('dboard_date').value     = item.date     || todayStr();
  var scaleEl = document.getElementById('dboardScale');
  if(scaleEl){ scaleEl.value = item.scale||100; var sp=document.getElementById('scalePct'); if(sp)sp.textContent=(item.scale||100)+'%'; }

  // 기존 사진 불러오기
  dboardPhotos = (item.photos && item.photos.length) ? item.photos.slice() : [];
  dboardPos    = item.pos || 'bl';
  dboardScale  = item.scale || 100;

  // 위치 버튼
  document.querySelectorAll('.pos-btn').forEach(function(b){ b.classList.toggle('active', b.dataset.pos===dboardPos); });

  // 미리보기
  if(dboardPhotos.length){
    var imgEl = document.getElementById('dboardPreviewImg');
    imgEl.src = dboardPhotos[0];
    imgEl.style.display = 'block';
    document.getElementById('dboardUploadHint').style.display = 'none';
  } else {
    document.getElementById('dboardPreviewImg').style.display='none';
    document.getElementById('dboardUploadHint').style.display='flex';
  }
  document.getElementById('dboardPreviewCanvas').style.display='none';
  document.getElementById('dboardPreviewEmpty').style.display = dboardPhotos.length ? 'none' : 'block';

  renderMultiPhotoList();
  updateBoardPreview();

  document.getElementById('dboardModalTitle').textContent = '✏️ 동산보드 수정';
  document.getElementById('dboardModal').style.display='flex';
}
function closeBoardModal(){
  document.getElementById('dboardModal').style.display='none';
  dboardPhotos=[];
  editingBoardItemId=null;
  editingBoardGroupId=null;
}

/* ── 사진 처리 ── */
/* 드래그앤드롭: document 레벨에서 처리, 모달 열려있을 때만 동작 */
(function(){
  function isBoardModalOpen(){
    var m = document.getElementById('dboardModal');
    return m && m.style.display === 'flex';
  }
  function getArea(){ return document.getElementById('dboardImgArea'); }

  document.addEventListener('dragover', function(e){
    if(!isBoardModalOpen()) return;
    e.preventDefault();
    var area = getArea(); if(!area) return;
    area.style.borderColor = 'var(--orange)';
    area.style.background  = '#FFF6F0';
  });
  document.addEventListener('dragleave', function(e){
    if(!isBoardModalOpen()) return;
    // 모달 영역 완전히 벗어났을 때만 초기화
    var area = getArea(); if(!area) return;
    if(!area.contains(e.relatedTarget)){
      area.style.borderColor = 'var(--border)';
      area.style.background  = '#FAFAF8';
    }
  });
  document.addEventListener('drop', function(e){
    if(!isBoardModalOpen()) return;
    e.preventDefault();
    var area = getArea(); if(!area) return;
    area.style.borderColor = 'var(--border)';
    area.style.background  = '#FAFAF8';
    var files = Array.from(e.dataTransfer.files).filter(function(f){ return f.type.startsWith('image/'); });
    if(!files.length) return;
    var loaded = 0;
    files.forEach(function(file){
      var r = new FileReader();
      r.onload = function(ev){
        dboardPhotos.push(ev.target.result);
        loaded++;
        if(loaded === files.length){ renderMultiPhotoList(); showFirstPhoto(); updateBoardPreview(); }
      };
      r.readAsDataURL(file);
    });
  });
  document.addEventListener('DOMContentLoaded', function(){
    // 드래그가 모달 밖 페이지로 나갔을 때 브라우저 기본동작 방지
    document.body.addEventListener('dragover', function(e){ if(isBoardModalOpen()) e.preventDefault(); });
    document.body.addEventListener('drop',     function(e){ if(isBoardModalOpen()) e.preventDefault(); });
  });
})();


function dboardLoadFile(input){
  var files=Array.from(input.files); if(!files.length) return;
  var loaded=0;
  files.forEach(function(file){
    var r=new FileReader();
    r.onload=function(e){ dboardPhotos.push(e.target.result); loaded++; if(loaded===files.length){ renderMultiPhotoList(); showFirstPhoto(); updateBoardPreview(); } };
    r.readAsDataURL(file);
  });
  input.value='';
}
function dboardAddPhoto(){ document.getElementById('dboardFileInput').click(); }
function showFirstPhoto(){
  if(!dboardPhotos.length) return;
  document.getElementById('dboardPreviewImg').src=dboardPhotos[0];
  document.getElementById('dboardPreviewImg').style.display='block';
  document.getElementById('dboardUploadHint').style.display='none';
}
function renderMultiPhotoList(){
  document.getElementById('dboardMultiList').innerHTML=dboardPhotos.map(function(src,i){
    return '<div style="position:relative;width:60px;height:60px;border-radius:4px;overflow:hidden;border:2px solid '+(i===0?'var(--orange)':'var(--border)')+'">'+
      '<img src="'+src+'" style="width:100%;height:100%;object-fit:cover">'+
      '<button onclick="dboardRemovePhoto('+i+')" style="position:absolute;top:0;right:0;background:rgba(0,0,0,.6);color:#fff;border:none;font-size:10px;cursor:pointer;width:16px;height:16px;line-height:1">✕</button>'+
      '</div>';
  }).join('');
}
function dboardRemovePhoto(i){
  dboardPhotos.splice(i,1); renderMultiPhotoList();
  if(dboardPhotos.length){ showFirstPhoto(); }
  else {
    document.getElementById('dboardPreviewImg').style.display='none';
    document.getElementById('dboardUploadHint').style.display='flex';
    document.getElementById('dboardPreviewCanvas').style.display='none';
    document.getElementById('dboardPreviewEmpty').style.display='block';
  }
  updateBoardPreview();
}
function selectPos(el,pos){
  dboardPos=pos;
  document.querySelectorAll('.pos-btn').forEach(function(b){ b.classList.remove('active'); });
  el.classList.add('active'); updateBoardPreview();
}

/* ── 미리보기: 캔버스 기반 (저장과 완전 동일) ── */
function updateBoardPreview(){
  dboardScale=parseInt(document.getElementById('dboardScale')&&document.getElementById('dboardScale').value||100);
  if(!dboardPhotos.length) return;
  var data={ title:document.getElementById('dboard_title').value||'', company:document.getElementById('dboard_company').value||'',
    location:document.getElementById('dboard_location').value||'', work:document.getElementById('dboard_work').value||'',
    date:document.getElementById('dboard_date').value||'', pos:dboardPos, scale:dboardScale, photos:[dboardPhotos[0]] };
  composeBoardCanvas(data,function(canvas){
    var cv=document.getElementById('dboardPreviewCanvas');
    var maxW=560, ratio=Math.min(1,maxW/canvas.width);
    cv.width=Math.round(canvas.width*ratio); cv.height=Math.round(canvas.height*ratio);
    cv.getContext('2d').drawImage(canvas,0,0,cv.width,cv.height);
    cv.style.display='block';
    document.getElementById('dboardPreviewEmpty').style.display='none';
  });
}

/* ── 저장 ── */
function saveBoardItem(){
  var data={
    title:document.getElementById('dboard_title').value.trim(),
    company:document.getElementById('dboard_company').value.trim(),
    location:document.getElementById('dboard_location').value.trim(),
    work:document.getElementById('dboard_work').value.trim(),
    date:document.getElementById('dboard_date').value,
    scale:parseInt(document.getElementById('dboardScale')&&document.getElementById('dboardScale').value||100)
  };
  if(!dboardPhotos.length){ alert('사진을 등록해주세요.'); return; }
  if(!data.title&&!data.work){ alert('공사명 또는 내용을 입력해주세요.'); return; }

  // ── 수정 모드 ──
  if(editingBoardItemId !== null){
    var targetItem = null;
    if(editingBoardGroupId){
      var eg = boardGroups.find(function(g){ return g.id===editingBoardGroupId; });
      if(eg) targetItem = eg.items.find(function(i){ return i.id===editingBoardItemId; });
    } else {
      targetItem = boardItems.find(function(i){ return i.id===editingBoardItemId; });
    }
    if(targetItem){
      targetItem.title    = data.title;
      targetItem.company  = data.company;
      targetItem.location = data.location;
      targetItem.work     = data.work;
      targetItem.date     = data.date;
      targetItem.scale    = data.scale;
      targetItem.pos      = dboardPos;
      targetItem.photos   = dboardPhotos.slice();
    }
    editingBoardItemId  = null;
    editingBoardGroupId = null;
    closeBoardModal();
    renderBoardGrid();
    return;
  }

  // ── 추가 모드 ──
  // 마지막 입력값 저장 (다음 추가 시 자동 입력용)
  lastDboardInfo = {
    title:    data.title,
    company:  data.company,
    location: data.location,
    work:     data.work
  };
  var newItems=dboardPhotos.map(function(photo){
    return {id:Date.now()+Math.random(), title:data.title, company:data.company, location:data.location,
      work:data.work, date:data.date, scale:data.scale, pos:dboardPos, photos:[photo]};
  });
  if(currentGroupTarget){
    var g=boardGroups.find(function(g){ return g.id===currentGroupTarget; });
    if(g) g.items=g.items.concat(newItems);
  } else { boardItems=boardItems.concat(newItems); }
  closeBoardModal(); renderBoardGrid();
}

/* ── 삭제 ── */
function deleteBoardItem(itemId,groupId){
  if(!confirm('이 동산보드를 삭제할까요?')) return;
  if(groupId&&groupId!=='null'){
    var g=boardGroups.find(function(g){ return g.id===groupId; });
    if(g) g.items=g.items.filter(function(i){ return i.id!==itemId; });
  } else { boardItems=boardItems.filter(function(i){ return i.id!==itemId; }); }
  renderBoardGrid();
}
function deleteGroup(groupId){
  if(!confirm('이 그룹과 안의 모든 동산보드를 삭제할까요?')) return;
  boardGroups=boardGroups.filter(function(g){ return g.id!==groupId; }); renderBoardGrid();
}
function deleteAllBoards(){
  var total=boardItems.length+boardGroups.reduce(function(s,g){ return s+g.items.length; },0);
  if(!total){ alert('삭제할 동산보드가 없습니다.'); return; }
  if(!confirm('전체 '+total+'개를 모두 삭제할까요?')) return;
  boardItems=[]; boardGroups=[]; renderBoardGrid();
}
function deleteGroupItems(groupId){
  var g=boardGroups.find(function(g){ return g.id===groupId; }); if(!g) return;
  if(!confirm('그룹 "'+g.name+'" 내 사진 '+g.items.length+'개를 모두 삭제할까요?')) return;
  g.items=[]; renderBoardGrid();
}

/* ── 오버레이 HTML (카드 표시용) ── */
function getBoardOverlayHTML(data,scale){
  scale=scale||100;
  var rows=[{label:'공 사 명',val:data.title},{label:'공 종',val:data.company},
    {label:'위 치',val:data.location},{label:'내 용',val:data.work},{label:'날 짜',val:data.date}
  ].filter(function(r){ return r.val; });
  if(!rows.length) return '';
  var fs=Math.round(11*(scale/100)), rh=Math.round(24*(scale/100));
  var lw=Math.round(70*(scale/100)), vw=Math.round(175*(scale/100)), pad=Math.round(4*(scale/100));
  return '<table style="border-collapse:collapse;font-size:'+fs+'px;font-family:\'Noto Sans KR\',sans-serif;background:#fff;table-layout:fixed;width:'+(lw+vw)+'px;line-height:1">'+
    rows.map(function(r){ return '<tr style="height:'+rh+'px">'+
      '<td style="width:'+lw+'px;padding:0 '+pad+'px;font-weight:700;color:#111;background:#D8D8D8;border:1px solid #111;text-align:center;vertical-align:middle;white-space:nowrap">'+r.label+'</td>'+
      '<td style="width:'+vw+'px;padding:0 '+(pad+3)+'px;color:#111;background:#fff;border:1px solid #111;vertical-align:middle;overflow:hidden;white-space:nowrap">'+r.val+'</td></tr>';
    }).join('')+'</table>';
}

/* ── 렌더 ── */
function renderBoardGrid(){
  var grid=document.getElementById('boardGrid');
  var total=boardItems.length+boardGroups.reduce(function(s,g){ return s+g.items.length; },0)+boardGroups.length;
  if(!total){
    grid.innerHTML='<div style="text-align:center;padding:60px 20px;color:var(--text-light)"><div style="font-size:40px;margin-bottom:12px;opacity:.3">🏗</div><p style="font-size:14px">아직 등록된 동산보드가 없습니다.</p><p style="font-size:12px;margin-top:4px">"+ 새 동산보드 추가" 또는 "그룹 시작" 버튼을 눌러 시작하세요.</p></div>';
    return;
  }
  function cardHTML(item,groupId){
    var cid='bcard_'+item.id;
    return '<div style="background:var(--white);border:1px solid var(--border);border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)">'+
      '<div style="width:100%;background:#2A2A28;overflow:hidden">'+
      '<canvas id="'+cid+'" style="width:100%;display:block"></canvas>'+
      '</div>'+
      '<div style="padding:7px 10px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--border)">'+
      '<div style="font-size:10px;color:var(--text-mid);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:140px">'+(item.date||'')+(item.title?' · '+item.title:'')+'</div>'+
      '<div style="display:flex;gap:4px">'+
      '<button onclick="exportOneBoard('+item.id+','+(groupId||'null')+')" style="padding:3px 8px;background:var(--orange);color:#fff;border:none;border-radius:3px;font-size:10px;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">다운</button>'+
      '<button onclick="editBoardItem('+item.id+','+(groupId||'null')+')" style="padding:3px 8px;background:#2A7A4A;color:#fff;border:none;border-radius:3px;font-size:10px;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">수정</button>'+
      '<button onclick="rotateBoardPhoto('+item.id+','+(groupId||'null')+')" style="padding:3px 8px;background:#2A4A8A;color:#A8C4FF;border:none;border-radius:3px;font-size:10px;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">↻ 회전</button>'+
      '<button onclick="deleteBoardItem('+item.id+','+(groupId||'null')+')" style="padding:3px 8px;background:transparent;color:#C0392B;border:1px solid #C0392B;border-radius:3px;font-size:10px;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">삭제</button>'+
      '</div></div></div>';
  }
  var html='';
  var renderQueue=[];
  boardGroups.forEach(function(g){
    html+='<div style="background:var(--white);border:2px solid #3A6BC8;border-radius:8px;overflow:hidden;margin-bottom:4px">'+
      '<div style="background:#1A2F5A;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px">'+
      '<div style="display:flex;align-items:center;gap:10px"><span style="font-size:14px;font-weight:700;color:#fff">📁 '+g.name+'</span><span style="font-size:11px;color:#7090C0">'+g.items.length+'장</span></div>'+
      '<div style="display:flex;gap:6px;flex-wrap:wrap">'+
      '<button onclick="openBoardModal(null,'+g.id+')" style="padding:4px 10px;background:var(--orange);color:#fff;border:none;border-radius:3px;font-size:11px;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">+ 추가</button>'+
      '<button onclick="openGroupEditModal('+g.id+')" style="padding:4px 10px;background:#2A7A4A;color:#fff;border:none;border-radius:3px;font-size:11px;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">✏️ 일괄수정</button>'+
      '<button onclick="exportGroupZip('+g.id+')" style="padding:4px 10px;background:var(--dark);color:#fff;border:none;border-radius:3px;font-size:11px;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">⬇ 일괄다운</button>'+
      '<button onclick="deleteGroupItems('+g.id+')" style="padding:4px 10px;background:transparent;color:#FFB347;border:1px solid #FFB347;border-radius:3px;font-size:11px;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">전체삭제</button>'+
      '<button onclick="deleteGroup('+g.id+')" style="padding:4px 10px;background:transparent;color:#C0392B;border:1px solid #C0392B;border-radius:3px;font-size:11px;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">그룹삭제</button>'+
      '</div></div>'+
      '<div style="padding:12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px">'+
      (g.items.length?g.items.map(function(item){ renderQueue.push(item); return cardHTML(item,g.id); }).join(''):'<div style="grid-column:1/-1;padding:20px;text-align:center;color:var(--text-light);font-size:13px">이 그룹에 동산보드가 없습니다. "+ 추가" 버튼을 누르세요.</div>')+
      '</div></div>';
  });
  if(boardItems.length){
    html+='<div><div style="font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border)">그룹 없는 동산보드</div>'+
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px">'+
      boardItems.map(function(item){ renderQueue.push(item); return cardHTML(item,null); }).join('')+'</div></div>';
  }
  grid.innerHTML=html;
  // DOM 삽입 후 캔버스에 합성 렌더 (저장 결과와 동일 비율)
  renderQueue.forEach(function(item){
    composeBoardCanvas(item,function(canvas){
      var cv=document.getElementById('bcard_'+item.id);
      if(!cv) return;
      cv.width=canvas.width; cv.height=canvas.height;
      cv.getContext('2d').drawImage(canvas,0,0);
    });
  });
}

/* ── 캔버스 합성 (미리보기=저장 완전 동일, 회전 지원) ── */
function composeBoardCanvas(item,callback){
  var img=new Image();
  img.onload=function(){
    var rot=(item.rotation||0)%360;
    var sw=img.naturalWidth, sh=img.naturalHeight;
    // 회전에 따라 캔버스 크기 결정
    var c=document.createElement('canvas');
    if(rot===90||rot===270){ c.width=sh; c.height=sw; }
    else { c.width=sw; c.height=sh; }
    var ctx=c.getContext('2d');
    ctx.save();
    ctx.translate(c.width/2, c.height/2);
    ctx.rotate(rot*Math.PI/180);
    ctx.drawImage(img,-sw/2,-sh/2);
    ctx.restore();
    var pw=c.width, ph=c.height;
    var us=(item.scale||100)/100;
    var fs=Math.round(pw*0.016*us);
    var rh=Math.round(fs*2.2);
    var lw=Math.round(pw*0.09*us);
    var vw=Math.round(pw*0.225*us);
    var pad=Math.round(fs*0.4);
    var rows=[{label:'공 사 명',val:item.title},{label:'공 종',val:item.company},
      {label:'위 치',val:item.location},{label:'내 용',val:item.work},{label:'날 짜',val:item.date}
    ].filter(function(r){ return r.val; });
    if(!rows.length){ callback(c); return; }
    var boxW=lw+vw, boxH=rows.length*rh;
    var pos=item.pos||'bl';
    var bx=pos.endsWith('l')?0:pw-boxW;
    var by=pos.startsWith('b')?ph-boxH:0;
    var lw1=Math.max(1,Math.round(pw*0.0008));
    ctx.textBaseline='middle';
    rows.forEach(function(r,i){
      var ry=by+i*rh;
      ctx.fillStyle='#D8D8D8'; ctx.fillRect(bx,ry,lw,rh);
      ctx.strokeStyle='#111'; ctx.lineWidth=lw1; ctx.strokeRect(bx,ry,lw,rh);
      ctx.font='bold '+fs+'px Arial'; ctx.fillStyle='#111'; ctx.textAlign='center';
      ctx.fillText(r.label,bx+lw/2,ry+rh/2);
      ctx.fillStyle='#fff'; ctx.fillRect(bx+lw,ry,vw,rh);
      ctx.strokeRect(bx+lw,ry,vw,rh);
      ctx.font=fs+'px Arial'; ctx.fillStyle='#111'; ctx.textAlign='left';
      ctx.fillText(r.val,bx+lw+pad,ry+rh/2);
    });
    callback(c);
  };
  img.onerror=function(){ alert('이미지 로드 실패'); };
  img.src=item.photos[0];
}

function rotateBoardPhoto(itemId,groupId){
  var item;
  if(groupId&&groupId!=='null'){
    var g=boardGroups.find(function(g){ return g.id===groupId; });
    item=g&&g.items.find(function(i){ return i.id===itemId; });
  } else { item=boardItems.find(function(i){ return i.id===itemId; }); }
  if(!item) return;
  item.rotation=((item.rotation||0)+90)%360;
  // 해당 카드 캔버스만 재렌더
  composeBoardCanvas(item,function(canvas){
    var cv=document.getElementById('bcard_'+item.id);
    if(!cv) return;
    cv.width=canvas.width; cv.height=canvas.height;
    cv.getContext('2d').drawImage(canvas,0,0);
  });
}
function canvasToBlob(canvas){
  return new Promise(function(resolve){
    try{ canvas.toBlob(function(b){ resolve(b); },'image/jpeg',0.92); }
    catch(e){ resolve(null); }
  });
}
function exportOneBoard(itemId,groupId){
  var item;
  if(groupId&&groupId!=='null'){
    var g=boardGroups.find(function(g){ return g.id===groupId; });
    item=g&&g.items.find(function(i){ return i.id===itemId; });
  } else { item=boardItems.find(function(i){ return i.id===itemId; }); }
  if(!item) return;
  composeBoardCanvas(item,function(canvas){
    var a=document.createElement('a');
    a.download='동산보드_'+(item.date||'nodate')+'_'+(item.title||item.work||'board').replace(/[\/\\:*?"<>|]/g,'').slice(0,20)+'.jpg';
    a.href=canvas.toDataURL('image/jpeg',0.92);
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  });
}
async function exportGroupZip(groupId){
  var g=boardGroups.find(function(g){ return g.id===groupId; });
  if(!g||!g.items.length){ alert('저장할 사진이 없습니다.'); return; }
  var zip=new JSZip();
  var folder=zip.folder(g.name.replace(/[\/\\:*?"<>|]/g,''));
  await Promise.all(g.items.map(function(item,i){
    return new Promise(function(res){
      composeBoardCanvas(item,async function(canvas){
        var blob=await canvasToBlob(canvas);
        if(blob) folder.file(String(i+1).padStart(2,'0')+'_'+(item.date||'nodate')+'_'+(item.title||item.work||'').replace(/[\/\\:*?"<>|]/g,'').slice(0,15)+'.jpg',blob);
        res();
      });
    });
  }));
  var blob=await zip.generateAsync({type:'blob'});
  var d=new Date().toISOString().slice(0,10).replace(/-/g,'');
  var a=document.createElement('a');
  a.download=g.name.replace(/[\/\\:*?"<>|]/g,'')+'_'+d+'.zip';
  a.href=URL.createObjectURL(blob);
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}
async function exportAllBoardsZip(){
  var all=boardItems.concat(boardGroups.reduce(function(acc,g){ return acc.concat(g.items); },[]));
  if(!all.length){ alert('저장할 동산보드가 없습니다.'); return; }
  var zip=new JSZip();
  var soloF=boardItems.length?zip.folder('그룹없음'):null;
  var gF={};
  boardGroups.forEach(function(g){ if(g.items.length) gF[g.id]=zip.folder(g.name.replace(/[\/\\:*?"<>|]/g,'')); });
  await Promise.all(all.map(function(item,i){
    return new Promise(function(res){
      composeBoardCanvas(item,async function(canvas){
        var blob=await canvasToBlob(canvas);
        if(blob){
          var og=boardGroups.find(function(g){ return g.items.some(function(it){ return it.id===item.id; }); });
          var f=og?gF[og.id]:soloF;
          if(f) f.file(String(i+1).padStart(2,'0')+'_'+(item.date||'nodate')+'_'+(item.title||item.work||'').replace(/[\/\\:*?"<>|]/g,'').slice(0,15)+'.jpg',blob);
        }
        res();
      });
    });
  }));
  var blob=await zip.generateAsync({type:'blob'});
  var d=new Date().toISOString().slice(0,10).replace(/-/g,'');
  var a=document.createElement('a');
  a.download='동산보드_전체_'+d+'.zip';
  a.href=URL.createObjectURL(blob);
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}
/* ─── 설비용어 DB ─── */
const TERMS = [
  {word:'횡주관',aliases:['횡배관','수평주관'],cat:'설비',desc:'건물 내 수평으로 설치되는 주배관. 각 층이나 구역으로 분기되는 메인 배관으로, 급수·급탕·소방 배관에서 공통적으로 사용하는 용어입니다. 수직으로 올라가는 배관은 "입상관"이라 합니다.'},
  {word:'입상관',aliases:['수직주관','라이저'],cat:'설비',desc:'건물 내 수직으로 설치되는 주배관. 각 층으로 분기되는 횡주관에 급수를 공급하는 역할을 합니다. 영어로는 Riser라 하며, 고층건물에서는 구역별로 나누어 설치합니다.'},
  {word:'분기관',aliases:['가지관','브랜치'],cat:'설비',desc:'주관(횡주관/입상관)에서 각 기기나 위생기구로 분기되는 소구경 배관. 일반적으로 주관보다 1~2호칭 작은 관경을 사용합니다.'},
  {word:'스모렌스키',aliases:['스모렌스키체크밸브','SMCO'],cat:'설비',desc:'펌프 흡입 측에 설치하는 특수 체크밸브. 역류 방지와 함께 수격작용(Water Hammer)을 흡수하는 완충 기능이 있습니다. 급수펌프, 소방펌프에 주로 사용됩니다.'},
  {word:'수격작용',aliases:['워터해머','Water Hammer'],cat:'설비',desc:'배관 내 유체가 급격히 정지하거나 방향 전환 시 발생하는 충격 현상. 밸브를 갑자기 잠글 때 "쾅"하는 소리가 나는 것이 대표적입니다. 방지를 위해 에어챔버, 완충밸브 등을 설치합니다.'},
  {word:'신축이음',aliases:['익스팬션조인트','EJ'],cat:'설비',desc:'배관의 온도 변화에 의한 팽창·수축을 흡수하는 이음재. 고온 배관(증기, 급탕 등)에 주로 설치하며, 벨로즈형·슬리브형·루프형 등이 있습니다.'},
  {word:'플러싱',aliases:['배관세척','Flushing'],cat:'설비',desc:'배관 시공 후 내부 이물질(용접 슬래그, 절삭분 등)을 세척하는 작업. 급수 배관은 음용수 기준(탁도 1NTU 이하)을 만족할 때까지 반복합니다.'},
  {word:'진공브레이커',aliases:['VB','역류방지기'],cat:'설비',desc:'배관 내 부압 발생 시 공기를 유입시켜 역류를 방지하는 기구. 세면기, 변기 급수관 등에 설치하며 음용수 오염 방지 목적으로 사용됩니다.'},
  {word:'헤더',aliases:['분배헤더','Header'],cat:'설비',desc:'여러 방향으로 배관을 분기하기 위한 집합 배관. 바닥 난방 배관 배분에 주로 사용되며, 각 루프의 유량을 균등하게 배분하는 역할을 합니다.'},
  {word:'방열량',aliases:['열출력','kcal/h'],cat:'설비',desc:'난방기기가 방출하는 열의 양. 단위는 kcal/h 또는 kW를 사용합니다(1kW=860kcal/h). 라디에이터, FCU 등의 용량 선정 기준이 됩니다.'},
  {word:'FCU',aliases:['팬코일유닛','Fan Coil Unit'],cat:'설비',desc:'냉온수를 공급받아 팬으로 공기를 순환시키며 냉난방하는 기기. 각 실에 설치되어 개별 제어가 가능하며, 중앙 냉난방 시스템에서 널리 사용됩니다.'},
  {word:'AHU',aliases:['에어핸들링유닛','공기조화기'],cat:'설비',desc:'대용량 공기조화 기기. 외기 도입, 필터링, 냉난방, 가습 등의 기능을 하나의 유닛으로 구성합니다. 주로 기계실에 설치하고 덕트로 각 실에 배풍합니다.'},
  {word:'트랩',aliases:['봉수트랩','P트랩','S트랩'],cat:'설비',desc:'배수관에 설치되어 하수 악취와 해충의 역류를 방지하는 기구. 물이 고여 있는 봉수부가 차단 역할을 합니다. P형, S형, U형 등 형태에 따라 구분합니다.'},
  {word:'역구배',aliases:['역경사','반대구배'],cat:'설비',desc:'배수 방향과 반대로 경사진 상태. 배수관에 역구배가 생기면 물이 고여 악취, 막힘의 원인이 됩니다. 시공 후 레벨기로 반드시 확인해야 합니다.'},
  {word:'CPVC',aliases:['내열PVC','염소화PVC'],cat:'설비',desc:'내열성을 강화한 PVC 배관 재료. 일반 PVC보다 높은 온도(최대 93°C)에서 사용 가능합니다. 급탕 배관이나 소화설비 스프링클러 배관에 사용됩니다.'},
  {word:'게이지압력',aliases:['표압','Gauge Pressure'],cat:'설비',desc:'대기압을 기준(0)으로 측정한 압력. 현장에서 일반적으로 사용하는 압력계의 표시값입니다. 절대압력 = 게이지압력 + 1atm(0.1MPa)의 관계를 가집니다.'},
  {word:'MCC',aliases:['전동기제어반','모터컨트롤센터'],cat:'전기',desc:'펌프, 팬 등 전동기를 제어하는 배전반. 각 전동기별 차단기, 마그네트, 열동계전기 등을 집합 수납한 제어반입니다. 기계실에 주로 설치됩니다.'},
  {word:'MCCB',aliases:['배선용차단기','성형케이스차단기'],cat:'전기',desc:'과부하 및 단락 보호를 위한 차단기. 분전반에서 가장 일반적으로 사용되며, 정격전류에 따라 다양한 용량이 있습니다. ELB(누전차단기)와 구분됩니다.'},
  {word:'공기비율',aliases:['공연비','Air Ratio'],cat:'설비',desc:'연소에 필요한 이론 공기량 대비 실제 공급 공기량의 비. 1.0이면 완전연소, 1.0 이상이면 과잉공기 공급 상태입니다. 보일러 효율 최적화에 중요한 지표입니다.'},
  {word:'피토관',aliases:['Pitot Tube','유속계'],cat:'설비',desc:'유체의 유속을 측정하는 기구. 전압과 정압의 차이(동압)를 이용하여 유속을 계산합니다. 덕트 풍속 측정이나 배관 유량 측정에 활용됩니다.'},
];

/* ── 검색 결과 없음 → 질문 자동 등록 ── */
function postSearchQuestion(){
  var input = document.getElementById('searchQuestionInput');
  var q = input ? input.value.trim() : '';
  if(!q){ alert('질문 내용을 입력해주세요.'); return; }
  var today = new Date();
  var dateStr = today.toLocaleDateString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'}).replace(/\.\s*/g,'.').replace(/\.$/,'')
    + ' ' + String(today.getHours()).padStart(2,'0') + ':' + String(today.getMinutes()).padStart(2,'0');
  var author = currentUser ? currentUser.name : '익명';
  var grade  = currentUser ? currentUser.grade : '기공';
  POSTS.push({
    id: nextPostId++, cat:'질문게시판', badge:'Q&A',
    title: q, author: author, grade: grade,
    date: dateStr, views:1, likes:0, dislikes:0, isHtml:false,
    content:'자재 검색에서 "'+q+'"을(를) 검색하였으나 결과가 없어 질문 드립니다.\n\n관련 내용을 아시는 분의 답변 부탁드립니다.',
    images:[], comments:[]
  });
  alert('질문게시판에 등록됐습니다!');
  showPage('community');
  switchCommTab('qna');
}

/* ─── 업체 정보 데이터 ─── */
const COMPANIES = [
  {name:"한국설비(주)",cat:"설비",region:"서울",desc:"급수·급탕·소방 배관 전문. 설계부터 시공까지",products:["백관","볼밸브","스프링클러"],tel:"02-1234-5678",since:"2005"},
  {name:"대성배관자재",cat:"설비",region:"경기",desc:"배관 자재 전문 도매. 당일 출고 가능",products:["PVC관","엘보","플랜지"],tel:"031-234-5678",since:"2010"},
  {name:"한빛전기자재",cat:"전기",region:"서울",desc:"전선·전선관·배전반 전문 공급업체",products:["CV케이블","전선관","분전반"],tel:"02-9876-5432",since:"2008"},
  {name:"대성전기산업",cat:"전기",region:"부산",desc:"전기 공사 자재 전문. 시공팀 보유",products:["FR-CV","차단기","접지봉"],tel:"051-345-6789",since:"2003"},
  {name:"삼호건설자재",cat:"골조",region:"인천",desc:"철근·형강·콘크리트 자재 전문 공급",products:["이형봉강","H형강","레미콘"],tel:"032-456-7890",since:"2001"},
  {name:"강남토건자재",cat:"골조",region:"경기",desc:"구조용 강재 전문. 대량 공급 가능",products:["H형강","앵커볼트","거푸집"],tel:"031-567-8901",since:"2007"},
  {name:"코리아내장재",cat:"내장",region:"서울",desc:"석고보드·경량철골 전문 공급업체",products:["석고보드","LGS","타일"],tel:"02-3456-7890",since:"2012"},
  {name:"한국소방자재",cat:"소방",region:"서울",desc:"소방 설비 자재 전문. 인증 제품만 취급",products:["스프링클러헤드","소화전","감지기"],tel:"02-7890-1234",since:"2006"},
  {name:"안전소방산업",cat:"소방",region:"광주",desc:"소방 시공 및 자재 공급. 광주·전남 전문",products:["알람밸브","분말소화기","경보기"],tel:"062-234-5678",since:"2009"},
  {name:"동아토목자재",cat:"토목",region:"경기",desc:"토목·상하수도 자재 전문. 납기 엄수",products:["PE관","맨홀","흄관"],tel:"031-678-9012",since:"2004"},
  {name:"서울보온자재",cat:"설비",region:"서울",desc:"배관 보온재 전문. 그라스울·PE폼 취급",products:["그라스울","PE보온재","알루미늄테이프"],tel:"02-5678-9012",since:"2011"},
  {name:"하나덕트산업",cat:"설비",region:"인천",desc:"덕트 제작·설치 전문업체. 사각/스파이럴",products:["사각덕트","스파이럴덕트","댐퍼"],tel:"032-789-0123",since:"2008"},
];

let companyFilters = { cat:'전체', region:'전체' };
function setCompanyFilter(el, val){
  companyFilters.cat = val;
  document.getElementById('companyFilter').querySelectorAll('.job-filter-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  renderCompanies();
}
function setCompanyRegionFilter(el, val){
  companyFilters.region = val;
  document.getElementById('companyRegionFilter').querySelectorAll('.job-filter-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  renderCompanies();
}
function renderCompanies(){
  let list = COMPANIES.filter(c=>{
    if(companyFilters.cat!=='전체' && c.cat!==companyFilters.cat) return false;
    if(companyFilters.region!=='전체' && c.region!==companyFilters.region) return false;
    return true;
  });
  const el = document.getElementById('companyList');
  if(!list.length){ el.innerHTML='<div class="no-result" style="grid-column:1/-1">조건에 맞는 업체가 없습니다.</div>'; return; }
  const catColors={설비:'#1A6B8A',전기:'#B87A00',골조:'#4A4844',내장:'#6B2A4A',소방:'#8B2020',토목:'#2A5020'};
  el.innerHTML = list.map(c=>`
    <div style="background:var(--white);border:1px solid var(--border);border-radius:6px;padding:18px 20px;transition:border-color .15s,box-shadow .15s;cursor:pointer" onmouseover="this.style.borderColor='var(--orange)'" onmouseout="this.style.borderColor='var(--border)'">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div style="width:36px;height:36px;border-radius:6px;background:${catColors[c.cat]||'#888'};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0">${c.cat[0]}</div>
        <div>
          <div style="font-size:15px;font-weight:700">${c.name}</div>
          <div style="font-size:11px;color:var(--text-light);margin-top:1px">${c.region} · ${c.cat} · ${c.since}년 설립</div>
        </div>
      </div>
      <div style="font-size:13px;color:var(--text-mid);margin-bottom:10px;line-height:1.5">${c.desc}</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">
        ${c.products.map(p=>`<span style="background:var(--tag-bg);color:var(--tag-text);padding:2px 8px;border-radius:3px;font-size:11px">${p}</span>`).join('')}
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--border);padding-top:10px">
        <span style="font-size:13px;color:var(--text-mid)">${c.tel}</span>
        <button style="padding:5px 14px;background:var(--orange);color:#fff;border:none;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">문의하기</button>
      </div>
    </div>`).join('');
}

/* ─── 공지사항 데이터 ─── */
const NOTICES = [
  {id:1,badge:"서비스",title:"콘스토어 베타 서비스 오픈 안내",date:"2025.03.15",content:"건설업 종사자를 위한 자재 검색 플랫폼 콘스토어가 베타 오픈했습니다. 자재 검색, 커뮤니티, 구인구직 서비스를 무료로 이용하실 수 있습니다.",important:true},
  {id:2,badge:"업데이트",title:"자재 DB 1차 업데이트 (설비·배관 자재 확장)",date:"2025.03.12",content:"설비 배관 자재 데이터베이스가 대폭 확장됐습니다. 동의어 검색 기능이 개선되어 현장 속어로도 자재를 쉽게 찾을 수 있습니다.",important:false},
  {id:3,badge:"안내",title:"커뮤니티 게시판 이용 규칙",date:"2025.03.10",content:"건전한 커뮤니티 운영을 위해 욕설·비방·광고성 게시글은 사전 경고 없이 삭제될 수 있습니다. 서로 배우고 나누는 공간이 되도록 함께해 주세요.",important:false},
  {id:4,badge:"예정",title:"구인구직 공고 등록 기능 오픈 예정 (4월)",date:"2025.03.08",content:"현재 구인구직 공고 등록 기능을 개발 중입니다. 4월 중 오픈 예정이며, 등록 시 공종별·지역별 노출이 가능합니다.",important:false},
  {id:5,badge:"예정",title:"업체 정보 등록 서비스 준비 중",date:"2025.03.05",content:"자재 공급 업체 정보 등록 서비스를 준비 중입니다. 등록을 희망하시는 업체는 contact@constore.co.kr 로 문의해 주세요.",important:false},
  {id:6,badge:"안내",title:"모바일 최적화 작업 진행 중",date:"2025.03.01",content:"현재 모바일 환경에서도 편리하게 사용할 수 있도록 화면 최적화 작업을 진행 중입니다. 일부 화면이 깨져 보일 수 있으며 빠르게 개선하겠습니다.",important:false},
];

let selectedNotice = null;
function renderNotices(){
  const el = document.getElementById('noticeList');
  const badgeColors = {'서비스':'#E8F0FB|#1A5080','업데이트':'#E8F5EE|#1A6B3A','안내':'var(--tag-bg)|var(--tag-text)','예정':'#FFF3E8|#8B4A00'};
  el.innerHTML = NOTICES.map((n,i)=>{
    const [bg,fg] = (badgeColors[n.badge]||'var(--tag-bg)|var(--tag-text)').split('|');
    return `
    <div style="border-bottom:1px solid var(--border);${i===NOTICES.length-1?'border-bottom:none':''}">
      <div onclick="openNoticeDetail(${n.id})" style="padding:16px 20px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:background .1s" onmouseover="this.style.background='var(--surface)'" onmouseout="this.style.background=''">
        <span style="font-size:11px;padding:2px 8px;border-radius:3px;background:${bg};color:${fg};white-space:nowrap;font-weight:500">${n.badge}</span>
        ${n.important?`<span style="font-size:11px;padding:2px 8px;border-radius:3px;background:#FDEEEE;color:#8B2020;font-weight:700">중요</span>`:''}
        <span style="flex:1;font-size:14px;font-weight:${n.important?'700':'400'};color:var(--text)">${n.title}</span>
        <span style="font-size:12px;color:var(--text-light);white-space:nowrap">${n.date}</span>
        <span style="font-size:12px;color:var(--text-light)">›</span>
      </div>
    </div>`;
  }).join('');
}

/* ── 공지사항 상세 ── */
function openNoticeDetail(id){
  const n=NOTICES.find(n=>n.id===id); if(!n) return;
  const badgeColors={'서비스':'#E8F0FB|#1A5080','업데이트':'#E8F5EE|#1A6B3A','안내':'var(--tag-bg)|var(--tag-text)','예정':'#FFF3E8|#8B4A00'};
  const [bg,fg]=(badgeColors[n.badge]||'var(--tag-bg)|var(--tag-text)').split('|');
  document.getElementById('noticeDetailContent').innerHTML=`
    <div style="background:var(--white);border:1px solid var(--border);border-radius:8px;overflow:hidden">
      <div style="padding:24px 28px;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <span style="font-size:11px;padding:2px 8px;border-radius:3px;background:${bg};color:${fg};font-weight:500">${n.badge}</span>
          ${n.important?'<span style="font-size:11px;padding:2px 8px;border-radius:3px;background:#FDEEEE;color:#8B2020;font-weight:700">중요</span>':''}
        </div>
        <h2 style="font-size:20px;font-weight:700;margin-bottom:10px">${n.title}</h2>
        <div style="font-size:13px;color:var(--text-light)">${n.date}</div>
      </div>
      <div style="padding:28px;font-size:14px;color:var(--text-mid);line-height:1.9">
        ${n.content}<br><br>
        감사합니다.<br><br>
        <strong>설비트리거 운영팀</strong>
      </div>
    </div>`;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-notice-detail').classList.add('active');
  history.pushState({page:'notice-detail'}, '', '#notice-detail');
  window.scrollTo(0,0);
}

/* ── 구인구직 상세 ── */
function openJobDetail(idx){
  const j=JOBS[idx]; if(!j) return;
  document.getElementById('jobDetailContent').innerHTML=`
    <div style="background:var(--white);border:1px solid var(--border);border-radius:8px;overflow:hidden">
      <div style="padding:28px;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
          <span class="job-badge jb-type-${j.type}">${j.type}</span>
          <span class="job-badge jb-region">${j.region}</span>
          <span class="job-badge jb-job">${j.job}</span>
        </div>
        <h2 style="font-size:22px;font-weight:700;margin-bottom:8px">${j.title}</h2>
        <div style="font-size:14px;color:var(--text-mid)">${j.company}</div>
      </div>
      <div style="padding:28px">
        <table style="width:100%;border-collapse:collapse">
          ${[['경력',j.career],['급여/보수',j.pay],['지역',j.region],['공종',j.job],['등록일',j.date]].map(([k,v])=>`
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:14px 0;font-size:13px;font-weight:700;color:var(--text-mid);width:100px">${k}</td>
            <td style="padding:14px 0;font-size:14px;color:var(--text)">${v}</td>
          </tr>`).join('')}
        </table>
        <div style="margin-top:24px;padding:20px;background:var(--surface);border-radius:6px">
          <div style="font-size:13px;font-weight:700;margin-bottom:8px">상세 내용</div>
          <div style="font-size:13px;color:var(--text-mid);line-height:1.8">
            ${j.type==='구인'
              ? `${j.company}에서 ${j.job} 분야 전문 인력을 모집합니다.<br>경력 ${j.career} 분들의 많은 지원 바랍니다.<br>급여는 ${j.pay}이며, 근무지는 ${j.region} 입니다.<br>상세 문의는 연락하기 버튼을 눌러주세요.`
              : `${j.job} 분야 ${j.career} 경력자가 구직 중입니다.<br>희망 급여: ${j.pay}<br>근무 가능 지역: ${j.region}<br>연락은 아래 버튼을 이용해주세요.`
            }
          </div>
        </div>
        <div style="margin-top:20px;display:flex;gap:10px">
          <button style="flex:1;padding:14px;background:var(--orange);color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">연락하기</button>
          <button onclick="showPage('job')" style="padding:14px 20px;background:transparent;color:var(--text-mid);border:1px solid var(--border);border-radius:6px;font-size:14px;cursor:pointer;font-family:'Noto Sans KR',sans-serif">목록으로</button>
        </div>
      </div>
    </div>`;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-job-detail').classList.add('active');
  history.pushState({page:'job-detail'}, '', '#job-detail');
  window.scrollTo(0,0);
}

/* ── 커뮤니티 게시글 상세 ── */
/* ── 페이지당 게시글 수 ── */
const POSTS_PER_PAGE = 15;
var commPage = 1;
var writeMode = 'text'; // 'text' | 'html'
var writeImages = []; // 첨부 이미지 base64 배열
var likedPosts = {}; // {postId: 'like'|'dislike'}
var bookmarkedPosts = {}; // {postId: true}
var likedComments = {}; // {cmtId: true}

let POSTS=[
  {id:1,cat:'자유게시판',grade:'기공',badge:'Q&A',title:'백관 나사 규격 질문드립니다',author:'설비장인',date:'2025.03.15 20:45',views:142,likes:8,dislikes:1,isHtml:false,content:'백관 연결 시 나사 규격이 KS와 ISO가 혼용되는 경우가 있더라고요.\n현장에서 15A 기준으로 주로 어떤 규격을 쓰시나요?\n특히 수입 밸브 연결할 때 문제가 생기는지 경험 공유 부탁드립니다.',images:[],comments:[{id:1,author:'배관달인',text:'현장에서는 대부분 KS 규격 씁니다. 수입 밸브는 어댑터 쓰면 해결돼요.',replies:[]},{id:2,author:'설비팀장',text:'15A는 1/2인치라 BSP 규격이 맞습니다. 수입품은 꼭 규격 확인하세요.',replies:[]}]},
  {id:2,cat:'정보게시판',grade:'팀장',badge:'자료',title:'CV케이블 vs FR-CV 선정 기준 정리',author:'전기공사',date:'2025.03.14 15:45',views:287,likes:22,dislikes:2,isHtml:false,content:'CV케이블과 FR-CV 케이블 선정 기준을 정리해봤습니다.\n\nCV: 일반 동력/조명용, 난연성 없음, 가격 저렴\nFR-CV: 내화성능 있음, 소방설비 전용 배선에 적합\n\n건축물 내 소방 관련 배선은 반드시 FR-CV 이상을 사용해야 합니다.',images:[],comments:[{id:3,author:'전기감리',text:'정확한 정리입니다. 소방법 개정 후 더 엄격해졌어요.',replies:[{author:'전기공사',text:'맞습니다. 특히 비상전원 배선은 내화케이블 필수입니다.'}]}]},
  {id:3,cat:'질문게시판',grade:'기술사',badge:'Q&A',title:'스프링클러 방호면적 계산법',author:'소방기술사',date:'2025.03.13 18:30',views:198,likes:17,dislikes:0,isHtml:false,content:'스프링클러 헤드 1개당 방호면적 기준이 헷갈려서 질문드립니다.\n\n폐쇄형 기준으로 일반 용도는 최대 9㎡인데\n위험용도에 따라 달라지는 부분 설명 부탁드립니다.',images:[],comments:[{id:4,author:'소방설계사',text:'NFTC 기준으로 특수가연물은 6.6㎡, 랙식 창고는 별도 계산합니다.',replies:[]}]},
  {id:4,cat:'정보게시판',grade:'준기공',badge:'자료',title:'설비 배관 KS 규격 완전 정리 2025',author:'배관달인',date:'2025.03.12 14:00',views:521,likes:34,dislikes:3,isHtml:false,content:'자주 쓰는 설비 배관 KS 규격을 한 곳에 정리했습니다.\n\n백관(KS D 3507), 흑관(KS D 3507), STS관(KS D 3576)\nPVC관(KS M 3401), PE관(KS M 3514)\n\n현장에서 바로 참고하실 수 있도록 규격별 치수표도 첨부했습니다.',images:[],comments:[{id:5,author:'설비팀장',text:'감사합니다. 자주 참고할게요.',replies:[]},{id:6,author:'배관초보',text:'정말 도움이 많이 됐습니다!',replies:[{author:'배관달인',text:'감사합니다. 궁금한 점 있으면 언제든 질문해 주세요!'}]}]},
  {id:5,cat:'자유게시판',grade:'기능장',badge:'Q&A',title:'철근 피복두께 현장 관리 포인트',author:'철근반장',date:'2025.03.11 18:30',views:389,likes:19,dislikes:1,isHtml:false,content:'철근 피복두께 관리가 생각보다 까다롭더라고요.\n특히 기둥 모서리 부분에서 자꾸 문제가 생기는데\n현장에서 어떻게 관리하시는지 방법 공유 부탁드립니다.',images:[],comments:[{id:7,author:'구조감리',text:'스페이서 간격을 1m 이내로 유지하는 게 핵심입니다.',replies:[]},{id:8,author:'골조팀장',text:'모서리는 ㄱ자 스페이서 별도 사용 추천드립니다.',replies:[{author:'철근반장',text:'ㄱ자 스페이서 처음 알았습니다. 감사해요!'}]}]},
  {id:6,cat:'정보게시판',grade:'신호수',badge:'자료',title:'전선 규격 선정 기준표 — 부하별 정리',author:'전기기사',date:'2025.03.10 20:00',views:634,likes:41,dislikes:2,isHtml:false,content:'부하 용량별 전선 규격 선정 기준을 정리했습니다.\n\n단상 220V 기준:\n- 1kW 이하: 2.5SQ\n- 2kW 이하: 4SQ\n- 3kW 이하: 6SQ\n- 5kW 이하: 10SQ\n\n3상 380V는 단상 대비 약 57% 규격 적용 가능합니다.',images:[],comments:[{id:9,author:'전기감리',text:'현장에서 바로 쓸 수 있는 자료네요.',replies:[]},{id:10,author:'전기초보',text:'감사합니다!',replies:[]}]},
  {id:7,cat:'자유게시판',grade:'조공',badge:'Q&A',title:'석고보드 두께별 용도 정리해주세요',author:'내장목수',date:'2025.03.09 22:15',views:234,likes:12,dislikes:0,isHtml:false,content:'석고보드 두께가 9.5T, 12.5T, 15T 등 여러 가지인데\n용도별로 어떻게 선택해야 하는지 알려주세요.\n특히 방음이 필요한 곳에는 몇 T를 써야 할까요?',images:[],comments:[{id:11,author:'인테리어전문',text:'방음은 12.5T 2겹이 기본입니다. 15T는 내화 성능이 필요한 곳에 씁니다.',replies:[]}]},
  {id:8,cat:'정보게시판',grade:'기공',badge:'자료',title:'냉매 배관 시공 핵심 체크리스트',author:'공조전문',date:'2025.03.08 17:00',views:445,likes:28,dislikes:1,isHtml:false,content:'에어컨 냉매 배관 시공 시 반드시 확인해야 할 사항들입니다.\n\n1. 배관 구경 선정 (실외기 스펙 기준)\n2. 단열재 두께 확인 (냉매관 20mm 이상)\n3. 기울기 방향 (드레인 방향 고려)\n4. 질소 가압 테스트 (1.5MPa)\n5. 진공 작업 (500마이크론 이하)',images:[],comments:[{id:12,author:'설비기사',text:'질소 가압 시간은 최소 24시간 권장합니다.',replies:[]}]},
  {id:9,cat:'정보게시판',grade:'기공',badge:'자료',title:'콘크리트 양생 기간 날씨별 정리',author:'현장소장',date:'2025.03.07 11:15',views:712,likes:45,dislikes:3,isHtml:false,content:'날씨 조건별 콘크리트 최소 양생 기간 정리입니다.\n\n일 평균기온 기준:\n- 25°C 이상: 3일\n- 10~25°C: 5일\n- 0~10°C: 7일\n- 0°C 이하: 한중콘크리트 기준 적용\n\n압축강도 기준으로는 설계강도의 50% 이상 확보 후 거푸집 해체 가능합니다.',images:[],comments:[{id:13,author:'콘크리트전문',text:'습도 유지도 중요합니다. 비닐 덮개 씌우는 거 잊지 마세요.',replies:[]},{id:14,author:'골조반장',text:'한중 시공 때 항상 헷갈렸는데 감사합니다.',replies:[]}]},
  {id:10,cat:'정보게시판',grade:'팀장',badge:'자료',title:'소방 설비 법정 설치 기준 완전 정리',author:'소방기술사',date:'2025.03.06 13:00',views:867,likes:53,dislikes:4,isHtml:false,content:'소방 설비별 법정 설치 기준 핵심만 정리했습니다.\n\n스프링클러:\n- 근린생활시설 바닥면적 600㎡ 이상\n- 숙박시설 전체\n- 지하가 연면적 1000㎡ 이상\n\n자동화재탐지설비:\n- 연면적 600㎡ 이상 모든 건물\n- 지하층·무창층 바닥면적 100㎡ 이상',images:[],comments:[{id:15,author:'소방감리',text:'정기적으로 법령 개정 체크하는 것도 중요합니다.',replies:[]},{id:16,author:'소방초보',text:'이런 정리 너무 필요했습니다. 감사해요!',replies:[{author:'소방기술사',text:'감사합니다. 추가 질문 있으시면 댓글 달아주세요.'}]}]},
  {id:11,cat:'자유게시판',grade:'기술사',badge:'Q&A',title:'PHC파일 시공 시 주의사항',author:'토목반장',date:'2025.03.05 12:00',views:312,likes:16,dislikes:1,isHtml:false,content:'PHC파일 항타 시공 시 주의할 점을 여쭤봅니다.\n\n특히 근접 구조물이 있을 때 진동·소음 관리는 어떻게 하시나요?\n그리고 두부 정리 기준도 알려주시면 감사하겠습니다.',images:[],comments:[{id:17,author:'지반전문가',text:'근접 시공 시 진동측정계 설치하고 허용진동값 이내로 관리하세요.',replies:[]}]},
  {id:12,cat:'정보게시판',grade:'기공',badge:'자료',title:'타일 시공 하자 유형과 원인 분석',author:'타일장인',date:'2025.03.04 14:45',views:489,likes:31,dislikes:2,isHtml:false,content:'현장에서 자주 발생하는 타일 하자 유형을 정리했습니다.\n\n1. 들뜸: 접착제 불량, 바탕면 미처리\n2. 백화: 줄눈 불량, 수분 침투\n3. 균열: 줄눈 간격 미준수, 신축줄눈 누락\n4. 오염: 마감재 선택 오류\n\n각 하자별 예방 방법과 보수 방법을 정리했습니다.',images:[],comments:[{id:18,author:'인테리어감리',text:'신축줄눈 누락이 가장 많은 하자 원인이죠.',replies:[{author:'타일장인',text:'맞습니다. 외부 타일 특히 주의해야 합니다.'}]}]},
  {id:13,cat:'질문게시판',grade:'준기공',badge:'Q&A',title:'접지 공사 방법별 비교',author:'전기기사2',date:'2025.03.03 16:15',views:267,likes:14,dislikes:0,isHtml:false,content:'접지 공사 방법이 여러 가지인데 헷갈립니다.\n\n봉형 접지, 판형 접지, 메시 접지 각각 어떤 상황에 적용하는지\n설명해주실 수 있나요?',images:[],comments:[{id:19,author:'전기감리2',text:'일반 건물은 봉형, 변전소나 발전소는 메시 접지가 기본입니다.',replies:[]}]},
  {id:14,cat:'질문게시판',grade:'기능장',badge:'Q&A',title:'급수 배관 내 이물질 처리 방법',author:'설비팀장2',date:'2025.03.02 16:15',views:198,likes:9,dislikes:0,isHtml:false,content:'신축 건물 급수 배관 플러싱 작업 기준이 궁금합니다.\n\n배관 세척 후 수질 기준을 어떻게 확인하는지,\n탁도 기준이 얼마인지 알려주시면 감사합니다.',images:[],comments:[{id:20,author:'배관달인',text:'탁도 기준은 1NTU 이하입니다. 육안 기준으로는 투명하게 나올 때까지입니다.',replies:[]}]},
  {id:15,cat:'정보게시판',grade:'기공',badge:'자료',title:'거푸집 존치기간 계산 방법',author:'현장소장2',date:'2025.03.01 16:15',views:534,likes:27,dislikes:1,isHtml:false,content:'거푸집 존치기간 계산 방법을 정리합니다.\n\n슬래브 하부 (스팬 3m 이하):\n- 20°C 이상: 14일\n- 10~20°C: 21일\n\n기둥 측면:\n- 5°C 이상: 2일\n- 0~5°C: 3일\n\n단, 조기 탈형 시 압축강도 확인 필수.',images:[],comments:[{id:21,author:'구조감리2',text:'조기 탈형 시 프리스트레스 도입 후 진행해야 합니다.',replies:[]}]},
  {id:16,cat:'자유게시판',grade:'팀장',badge:'Q&A',title:'옥내소화전 방수압력 부족 원인',author:'소방담당자',date:'2025.02.28 10:45',views:345,likes:18,dislikes:1,isHtml:false,content:'옥내소화전 방수압력이 기준치(0.17MPa)에 못 미칩니다.\n\n펌프 성능은 정상인데 말단 소화전에서 압력이 부족한 상황입니다.\n원인과 해결 방법을 알고 싶습니다.',images:[],comments:[{id:22,author:'소방기술사',text:'배관 마찰손실 계산을 다시 해보세요. 관경이 작은 경우가 많습니다.',replies:[{author:'소방담당자',text:'50A 구간이 있어서 확인해봐야겠네요.'}]}]},
  {id:17,cat:'정보게시판',grade:'기술사',badge:'자료',title:'경량철골 천장 시공 순서',author:'내장팀장',date:'2025.02.27 11:15',views:421,likes:24,dislikes:0,isHtml:false,content:'LGS 경량철골 천장 시공 순서입니다.\n\n1. 레벨 측정 및 먹줄치기\n2. 행거 설치 (1200mm 간격)\n3. M-BAR 설치 (900mm 간격)\n4. C-BAR 설치 (450mm 간격)\n5. 석고보드 부착\n6. 테이프 처리 및 퍼티\n\n중요: 행거 앙카 인발력 확인 필수.',images:[],comments:[{id:23,author:'인테리어전문2',text:'화장실 천장은 방수석고보드 사용 주의!',replies:[]}]},
  {id:18,cat:'질문게시판',grade:'조공',badge:'Q&A',title:'연약지반 개량 공법 비교',author:'지반전문',date:'2025.02.26 14:30',views:567,likes:33,dislikes:2,isHtml:false,content:'연약지반 처리 공법이 여러 가지인데 선정 기준이 궁금합니다.\n\n샌드드레인, PBD, 동다짐, 심층혼합처리 등\n각각 어떤 조건에서 선택하는지 알려주세요.',images:[],comments:[{id:24,author:'지반기술사',text:'점성토는 배수공법, 사질토는 다짐공법이 기본 방향입니다.',replies:[{author:'지반전문',text:'감사합니다. 두꺼운 점토층이라 PBD 검토해봐야겠네요.'}]}]},
  {id:19,cat:'정보게시판',grade:'기공',badge:'자료',title:'위생배관 구배 기준 정리',author:'설비달인',date:'2025.02.25 09:45',views:398,likes:21,dislikes:1,isHtml:false,content:'위생배관 최소 구배 기준을 정리합니다.\n\n오배수관:\n- 75mm 이하: 1/50 이상\n- 100mm: 1/100 이상\n- 125mm 이상: 1/150 이상\n\n통기관은 구배 방향 주의 (응결수 역류 방지)',images:[],comments:[{id:25,author:'설비기사2',text:'통기관 구배 방향 틀리면 나중에 고치기 정말 힘듭니다.',replies:[]}]},
  {id:20,cat:'정보게시판',grade:'팀장',badge:'자료',title:'분전반 설계 시 주의사항',author:'전기기술사',date:'2025.02.24 08:30',views:623,likes:38,dislikes:2,isHtml:false,content:'분전반 설계 시 반드시 체크해야 할 사항들입니다.\n\n1. 부하 계산 (수용률, 부등률 고려)\n2. 차단기 선정 (단락전류 용량)\n3. 모선 규격 (온도 상승 고려)\n4. 케이블 인입 방향 (하부 인입 원칙)\n5. 접지 연결 (접지 모선 분리)\n\n특히 차단기 카스케이드 적용 여부 확인.',images:[],comments:[{id:26,author:'전기감리3',text:'제조사별 카스케이드 조합표 항상 확인하세요.',replies:[]}]},
  {id:21,cat:'자유게시판',grade:'기능장',badge:'Q&A',title:'스프링클러 헤드 교체 시기',author:'소방주임',date:'2025.02.23 12:00',views:256,likes:11,dislikes:0,isHtml:false,content:'스프링클러 헤드 교체 주기가 궁금합니다.\n법적 교체 의무 주기가 있나요?\n또 교체 없이 유지할 수 있는 조건은 무엇인가요?',images:[],comments:[{id:27,author:'소방기술사2',text:'법적 의무 주기는 없으나 50년 이상된 헤드는 교체 권고됩니다.',replies:[]}]},
  {id:22,cat:'정보게시판',grade:'기술사',badge:'자료',title:'철근 겹침이음 길이 계산',author:'구조기술사',date:'2025.02.22 20:15',views:489,likes:29,dislikes:1,isHtml:false,content:'철근 겹침이음 길이 계산 방법입니다.\n\n인장이음 기본:\n- D10: 300mm 이상\n- D13: 400mm 이상\n- D16: 500mm 이상\n- D19: 600mm 이상\n- D22: 700mm 이상\n\n압축이음은 인장이음의 0.83배 적용.',images:[],comments:[{id:28,author:'철근기사',text:'콘크리트 강도에 따라 달라지는 것도 참고하세요.',replies:[{author:'구조기술사',text:'맞습니다. fck 24MPa 기준입니다.'}]}]},
  {id:23,cat:'자유게시판',grade:'기공',badge:'Q&A',title:'도장 작업 전 하지 처리 방법',author:'도장기사',date:'2025.02.21 20:30',views:312,likes:15,dislikes:0,isHtml:false,content:'도장 작업 전 하지 처리가 중요하다고 하는데\n구체적으로 어떤 순서로 해야 하나요?\n특히 콘크리트 면 도장 전 처리 방법이 궁금합니다.',images:[],comments:[{id:29,author:'도장전문',text:'콘크리트면은 1) 이물질 제거 2) 에폭시 프라이머 3) 퍼티 4) 사포 5) 본도장 순서입니다.',replies:[]}]},
  {id:24,cat:'정보게시판',grade:'준기공',badge:'자료',title:'우수관 설계 기준',author:'토목기술사',date:'2025.02.20 21:00',views:378,likes:20,dislikes:1,isHtml:false,content:'우수관 설계 시 주요 기준입니다.\n\n강우강도 공식: I = a/(t+b)\n- 서울 기준: I = 3480/(t+30)\n\n유출계수:\n- 아스팔트: 0.85~0.95\n- 잔디: 0.25~0.35\n\n최소 유속: 0.8m/s\n최대 유속: 3.0m/s',images:[],comments:[{id:30,author:'수리기술사',text:'재현기간 설정이 핵심입니다. 간선은 30년, 지선은 10년 적용.',replies:[]}]},
  {id:25,cat:'질문게시판',grade:'기공',badge:'Q&A',title:'난방 배관 에어빼기 방법',author:'난방전문',date:'2025.02.19 14:45',views:223,likes:10,dislikes:0,isHtml:false,content:'바닥 난방 배관 시공 후 에어빼기를 해야 하는데\n효과적인 방법이 있을까요?\n특히 XL관 100m 이상 루프의 경우 에어 잘 안 빠집니다.',images:[],comments:[{id:31,author:'설비기사3',text:'유속 올려서 밀어내는 방법이 가장 효과적입니다. 2m/s 이상 유지해보세요.',replies:[{author:'난방전문',text:'유속 올리는 방법 자세히 알려주시면 감사하겠습니다.'}]}]},
  {id:26,cat:'정보게시판',grade:'팀장',badge:'자료',title:'조명 설계 조도 기준표',author:'조명전문',date:'2025.02.18 10:15',views:534,likes:32,dislikes:1,isHtml:false,content:'KS A 3011 기준 실별 권장 조도입니다.\n\n사무실: 400~600lx\n회의실: 300~500lx\n복도: 100~200lx\n주차장: 30~75lx\n계단: 100~200lx\n로비: 200~400lx\n\n에너지 절감을 위해 LED 기준 적용 시 약 30% 감소 가능.',images:[],comments:[{id:32,author:'전기기사3',text:'재실 센서 연동 시 에너지 40% 추가 절감 가능합니다.',replies:[]}]},
  {id:27,cat:'질문게시판',grade:'기공',badge:'Q&A',title:'슬래브 두께 결정 기준',author:'구조설계사',date:'2025.02.17 13:30',views:445,likes:23,dislikes:2,isHtml:false,content:'RC 슬래브 두께를 결정하는 기준이 궁금합니다.\n\n경간비로 계산하는 방법과\n처짐 계산으로 결정하는 방법 중 어떤 것을 우선하나요?',images:[],comments:[{id:33,author:'구조기술사2',text:'경간비는 최소 두께 기준이고, 처짐 계산은 검증용입니다.',replies:[]}]},
  {id:28,cat:'정보게시판',grade:'기술사',badge:'자료',title:'바닥재 종류별 특성 비교',author:'인테리어기사',date:'2025.02.16 17:00',views:612,likes:36,dislikes:1,isHtml:false,content:'주요 바닥재 종류별 특성을 정리했습니다.\n\n강화마루: 내구성 우수, 수분 취약\n강마루: 원목 느낌, 가격 高\nLVT: 방수, 내구성 우수, 저가\n천연석: 최고 내구성, 시공 어려움\nPVC타일: 경제적, 내화학성\n\n용도별 최적 선택 기준도 정리했습니다.',images:[],comments:[{id:34,author:'바닥전문',text:'욕실은 LVT나 타일이 무조건 정답입니다.',replies:[]}]},
  {id:29,cat:'정보게시판',grade:'기공',badge:'자료',title:'제연설비 풍량 계산 방법',author:'소방설계사2',date:'2025.02.15 12:15',views:389,likes:22,dislikes:1,isHtml:false,content:'제연설비 급기 풍량 계산 기준입니다.\n\nNFTC 501A 기준:\n- 부속실 제연: 방연풍속 0.7m/s 이상\n- 계단실 제연: 방연풍속 0.5m/s 이상\n\n누설틈새 면적 계산:\n- 문 1개당: 0.01m² (일반문)\n- 방화문: 0.006m²',images:[],comments:[{id:35,author:'소방기술사3',text:'고층건물은 바람 압력도 고려해야 합니다.',replies:[{author:'소방설계사2',text:'맞습니다. 특히 초고층은 CFD 해석 필요합니다.'}]}]},
  {id:30,cat:'정보게시판',grade:'팀장',badge:'자료',title:'흙막이 공법 종류와 선정',author:'토목전문',date:'2025.02.14 18:30',views:678,likes:42,dislikes:3,isHtml:false,content:'주요 흙막이 공법 비교입니다.\n\nH-PILE + 토류판:\n- 경제적, 변형 큼\n- 지하수 낮은 사질토 적합\n\nSHEET PILE:\n- 지하수 차단 가능\n- 연약지반 적합\n\nSCW:\n- 차수성 우수\n- 도심지 시공 적합\n\nCIP:\n- 소음·진동 최소\n- 근접 구조물 보호',images:[],comments:[{id:36,author:'지반기술사2',text:'지하수위와 주변 환경이 공법 선정의 핵심입니다.',replies:[]}]},
  {id:31,cat:'자유게시판',grade:'기공',badge:'Q&A',title:'용접 비파괴 검사 종류별 비교',author:'용접전문',date:'2025.02.13 10:30',views:312,likes:14,dislikes:1,isHtml:false,content:'배관 용접부 비파괴 검사 방법이 여러 가지인데 헷갈립니다.\n\nRT, UT, MT, PT 각각 어떤 상황에 적용하는지\n간단히 설명해주실 수 있나요?',images:[],comments:[{id:37,author:'검사기술사',text:'RT는 내부결함, MT는 표면결함(자성체), PT는 표면결함(비자성체), UT는 두꺼운 재료 내부결함에 적합합니다.',replies:[]}]},
  {id:32,cat:'정보게시판',grade:'기술사',badge:'자료',title:'에너지 절약 설계 기준 핵심 정리',author:'에너지기술사',date:'2025.02.12 14:00',views:456,likes:26,dislikes:1,isHtml:false,content:'건축물 에너지 절약 설계 기준 핵심 사항입니다.\n\n단열재 두께 기준 (중부지역 외벽 기준):\n- 가등급: 155mm 이상\n- 나등급: 175mm 이상\n\n창호 열관류율:\n- 공동주택: 1.0W/m²K 이하\n- 일반건축물: 1.5W/m²K 이하\n\n기밀성 등급 1등급 이상 권장.',images:[],comments:[{id:38,author:'건축사2',text:'2025년 기준 강화됐으니 최신 고시 꼭 확인하세요.',replies:[]}]},
  {id:33,cat:'질문게시판',grade:'준기공',badge:'Q&A',title:'압력계 교정 주기와 방법',author:'계장담당',date:'2025.02.11 11:15',views:198,likes:9,dislikes:0,isHtml:false,content:'현장에 설치된 압력계 교정 주기가 어떻게 되나요?\n법적 의무 주기가 있는지, 교정 기관은 어디에 의뢰해야 하는지 궁금합니다.',images:[],comments:[{id:39,author:'계측전문',text:'KOLAS 인정기관에 의뢰하시면 됩니다. 법적 의무는 없지만 ISO 기준으로 1년 주기 권장입니다.',replies:[{author:'계장담당',text:'감사합니다. KOLAS 인정기관 목록 어디서 확인할 수 있나요?'}]}]},
  {id:34,cat:'자유게시판',grade:'팀장',badge:'Q&A',title:'현장 안전 TBM 효과적으로 하는 방법',author:'안전팀장',date:'2025.02.10 08:00',views:389,likes:21,dislikes:0,isHtml:false,content:'매일 아침 TBM을 하는데 형식적으로 흘러가는 경우가 많습니다.\n실질적으로 효과 있는 TBM 운영 방법이 있으면 공유 부탁드립니다.',images:[],comments:[{id:40,author:'안전기술사',text:'작업자 직접 위험 발굴 참여, 전날 아차사고 공유, 짧고 집중적으로(10분 이내)가 핵심입니다.',replies:[{author:'안전팀장',text:'아차사고 공유 방식 바로 적용해볼게요. 감사합니다!'}]}]},
  {id:35,cat:'정보게시판',grade:'기공',badge:'자료',title:'덕트 풍속 기준과 소음 관계',author:'공조전문2',date:'2025.02.09 15:30',views:334,likes:18,dislikes:1,isHtml:false,content:'덕트 내 풍속 기준과 소음의 관계를 정리했습니다.\n\n주덕트:\n- 저속 시스템: 5~8m/s\n- 고속 시스템: 10~15m/s\n\n분기덕트: 3~6m/s\n취출구 직전: 2~3m/s\n\n풍속이 높을수록 소음 증가. 사무실·병원은 저속 설계 권장.',images:[],comments:[{id:41,author:'소음전문',text:'NC 기준도 함께 검토하세요. 사무실 NC-35 이하가 목표입니다.',replies:[]}]},
  {id:36,cat:'질문게시판',grade:'기능장',badge:'Q&A',title:'신축 아파트 층간소음 차단 방법',author:'건축사3',date:'2025.02.08 19:45',views:567,likes:31,dislikes:2,isHtml:false,content:'층간소음 민원이 많아서 걱정입니다.\n현행 법적 기준과 실질적인 차단 방법을 알고 싶습니다.',images:[],comments:[{id:42,author:'음향전문',text:'바닥충격음 기준 경량 58dB, 중량 50dB 이하입니다. 뜬바닥(부유식 바닥) 구조가 가장 효과적입니다.',replies:[{author:'건축사3',text:'완충재 두께는 어느 정도로 해야 할까요?'}]}]},
  {id:37,cat:'정보게시판',grade:'기술사',badge:'자료',title:'전기실 환경 관리 기준',author:'전기기술사2',date:'2025.02.07 13:00',views:445,likes:24,dislikes:0,isHtml:false,content:'전기실 적정 환경 관리 기준입니다.\n\n온도: 5~40°C (변압기 기준)\n습도: 45~75% RH\n먼지: KS C IEC 60721 기준 3C2\n\n환기 기준:\n- 변압기실: 자연환기 또는 강제환기\n- 배전반실: 시간당 10회 이상 환기 권장\n\n침수 대비 바닥 방수 및 배수 계획 필수.',images:[],comments:[{id:43,author:'전기감리4',text:'고압 설비는 SF6 가스 누출 감지기도 설치하세요.',replies:[]}]},
  {id:38,cat:'자유게시판',grade:'조공',badge:'Q&A',title:'미장 공사 크랙 발생 원인과 예방',author:'미장기사',date:'2025.02.06 17:00',views:278,likes:13,dislikes:0,isHtml:false,content:'시멘트 미장 후 크랙이 자꾸 발생합니다.\n두께, 배합비, 양생 방법 중 어떤 부분이 문제일까요?\n크랙 예방 방법을 알려주세요.',images:[],comments:[{id:44,author:'미장전문',text:'물-시멘트비 낮추고, 두께 15mm 초과 시 2회 나누어 바르고, 초기 건조 시 커버링이 핵심입니다.',replies:[]}]},
  {id:39,cat:'정보게시판',grade:'기공',badge:'자료',title:'소방 펌프 성능 시험 방법',author:'소방기사2',date:'2025.02.05 09:30',views:389,likes:22,dislikes:1,isHtml:false,content:'소방 펌프 성능 시험 절차입니다.\n\n1. 체절 운전 시험: 토출측 완전 차단, 체절압력 확인 (정격압력 140% 이하)\n2. 정격 운전 시험: 정격 토출량에서 정격압력 이상 확인\n3. 최대 운전 시험: 정격 토출량 150%에서 정격압력 65% 이상\n\n시험 주기: 연 1회 이상.',images:[],comments:[{id:45,author:'소방감리2',text:'펌프 성능곡선(H-Q곡선) 확인도 병행하세요.',replies:[{author:'소방기사2',text:'맞습니다. 제조사 성능곡선과 비교하는 게 중요합니다.'}]}]},
  {id:40,cat:'질문게시판',grade:'기공',badge:'Q&A',title:'배수 트랩 설치 위치와 종류',author:'위생설비사',date:'2025.02.04 14:15',views:234,likes:11,dislikes:0,isHtml:false,content:'배수 트랩 종류가 P트랩, S트랩, 드럼트랩 등 여러 가지인데\n각각 어디에 설치하는지 기준이 있나요?\n이중 트랩 설치 시 문제점도 알고 싶습니다.',images:[],comments:[{id:46,author:'설비기사4',text:'P트랩은 세면기, 욕조. S트랩은 대변기. 이중 트랩은 자기 사이펀 현상으로 봉수 파괴 우려가 있어 금지입니다.',replies:[]}]},
  {id:41,cat:'정보게시판',grade:'준기공',badge:'자료',title:'콘크리트 배합설계 기본 이론',author:'토목기사2',date:'2025.02.03 10:00',views:512,likes:29,dislikes:2,isHtml:false,content:'콘크리트 배합설계 핵심 개념입니다.\n\n물-시멘트비(W/C):\n- 강도와 내구성에 가장 큰 영향\n- 낮을수록 강도 증가\n\n슬럼프:\n- 현장 타설: 120~150mm\n- 펌프 타설: 150~180mm\n\n공기량: 4~6% (AE 콘크리트)\n\n배합강도 = 설계기준강도 + 할증강도(1.64σ)',images:[],comments:[{id:47,author:'콘크리트기사',text:'물 계량은 ±2% 이내로 엄격하게 관리해야 합니다.',replies:[]}]},
  {id:42,cat:'자유게시판',grade:'기능장',badge:'Q&A',title:'현장 원가 절감 실질적인 방법',author:'현장소장3',date:'2025.02.02 20:00',views:623,likes:38,dislikes:3,isHtml:false,content:'원가 절감이 지상과제인데 실질적으로 효과 있는 방법이 궁금합니다.\n자재 낭비, 인력 효율, 공정 단축 등 경험 공유 부탁드립니다.',images:[],comments:[{id:48,author:'원가관리전문',text:'BIM 활용한 물량 정확화, 주요 공정 선행 제작(PC화), 자재 JIT 납품이 현실적인 방법입니다.',replies:[{author:'현장소장3',text:'JIT는 중소 현장에서 납품사 협력이 어렵던데 어떻게 풀어가셨나요?'}]}]},
  {id:43,cat:'정보게시판',grade:'기공',badge:'자료',title:'방수 공법 종류별 특성 및 선정',author:'방수전문',date:'2025.02.01 16:30',views:478,likes:27,dislikes:1,isHtml:false,content:'주요 방수 공법 비교입니다.\n\n우레탄 도막 방수:\n- 복잡한 형태 적용 유리\n- 시공 간편, 부착력 우수\n\nFRP 방수:\n- 강도 우수, 경량\n- 옥상 주차장, 발코니\n\nSBS 시트 방수:\n- 내구성 최고\n- 지하 외방수, 지붕\n\nABS 시트 방수:\n- 저온 시공 가능\n- 수영장, 지하 저수조',images:[],comments:[{id:49,author:'방수감리',text:'지하 외방수는 시트 방수가 신뢰성이 가장 높습니다.',replies:[]}]},
  {id:44,cat:'질문게시판',grade:'기공',badge:'Q&A',title:'열화상 카메라 건물 진단 활용법',author:'건물관리사',date:'2025.01.31 11:00',views:312,likes:16,dislikes:0,isHtml:false,content:'열화상 카메라로 건물 단열 결함을 진단하려 합니다.\n어떤 조건에서 촬영해야 정확한 결과를 얻을 수 있나요?\n촬영 시 주의사항도 알려주세요.',images:[],comments:[{id:50,author:'진단전문',text:'실내외 온도차 10°C 이상, 일출 전후 2시간이 가장 이상적입니다. 직사광선 피하고 흐린 날 촬영하세요.',replies:[{author:'건물관리사',text:'온도차 조건이 중요하군요. 겨울에 진단하면 더 정확하겠네요.'}]}]},
  {id:45,cat:'정보게시판',grade:'팀장',badge:'자료',title:'가스 배관 압력 시험 기준',author:'가스기사',date:'2025.01.30 13:45',views:398,likes:23,dislikes:1,isHtml:false,content:'가스 배관 압력 시험 기준입니다.\n\n저압 배관 (2.5kPa 미만):\n- 기밀 시험압력: 8.4kPa 이상\n- 시험 매체: 공기 또는 불활성 가스\n- 유지 시간: 24시간\n\n중압 배관 (0.1~1MPa):\n- 기밀 시험압력: 최고 사용압력 1.1배\n- 수압 시험 병행 권장',images:[],comments:[{id:51,author:'가스감리',text:'LPG 배관은 별도 기준 적용되니 주의하세요.',replies:[]}]},
  {id:46,cat:'자유게시판',grade:'기술사',badge:'Q&A',title:'BIM 도입 현장 적용 실제 경험',author:'BIM전문가',date:'2025.01.29 09:00',views:534,likes:32,dislikes:2,isHtml:false,content:'BIM을 실제 현장에 도입해보신 분들의 경험이 궁금합니다.\n초기 비용 대비 실질적인 효과가 있었나요?\n어떤 분야에서 가장 효과가 컸나요?',images:[],comments:[{id:52,author:'시공BIM담당',text:'간섭 체크에서 가장 효과가 컸습니다. 설계 단계 간섭 1개 해결이 시공 단계의 10배 비용 절감 효과입니다.',replies:[{author:'BIM전문가',text:'간섭 체크 외에 공정 시뮬레이션도 효과가 있었나요?'}]}]},
  {id:47,cat:'정보게시판',grade:'기공',badge:'자료',title:'PE관 융착 이음 방법과 주의사항',author:'PE관전문',date:'2025.01.28 15:00',views:289,likes:15,dislikes:0,isHtml:false,content:'PE관 맞대기 융착 이음 절차입니다.\n\n1. 관 끝 클램핑\n2. 단면 페이싱 (평탄도 0.3mm 이하)\n3. 가열판 온도 확인 (210±10°C)\n4. 흡착 압력으로 가열\n5. 가열판 제거 후 접합 (전환 시간 3초 이내)\n6. 냉각 (최소 냉각 시간 준수)\n\n이음부 비드 형상 확인 필수.',images:[],comments:[{id:53,author:'배관기사2',text:'외기 온도에 따라 가열 시간 보정이 필요합니다. 동절기 특히 주의.',replies:[]}]},
  {id:48,cat:'질문게시판',grade:'조공',badge:'Q&A',title:'방화구획 관통부 처리 기준',author:'소방설계사3',date:'2025.01.27 17:30',views:423,likes:25,dislikes:1,isHtml:false,content:'방화구획을 관통하는 배관과 덕트 처리 기준이 헷갈립니다.\n내화충전재와 방화댐퍼 설치 기준을 명확히 알려주세요.',images:[],comments:[{id:54,author:'소방기술사4',text:'배관 관통부는 내화충전재 또는 내화채움구조로 처리. 덕트는 방화댐퍼(FD) 설치가 원칙입니다. 단열재 배관은 규정이 다르니 주의하세요.',replies:[{author:'소방설계사3',text:'단열재 배관 규정 자세히 알 수 있을까요?'}]}]},
  {id:49,cat:'정보게시판',grade:'기공',badge:'자료',title:'건설 현장 품질관리 체크리스트',author:'품질관리사',date:'2025.01.26 10:30',views:612,likes:36,dislikes:2,isHtml:false,content:'현장 품질관리 핵심 체크리스트입니다.\n\n[철근공사]\n□ 재료 시험성적서 확인\n□ 가공 치수 허용오차 (±20mm)\n□ 이음 위치 및 길이\n□ 피복두께 확보\n\n[콘크리트공사]\n□ 배합 설계 승인\n□ 슬럼프·공기량 시험\n□ 공시체 채취 및 관리\n□ 타설·다짐·양생 관리',images:[],comments:[{id:55,author:'감리원',text:'체계적인 정리 감사합니다. QC 교육 자료로 활용하겠습니다.',replies:[]}]},
  {id:50,cat:'자유게시판',grade:'기공',badge:'Q&A',title:'현장 신규 입사자 교육 효과적인 방법',author:'교육담당자',date:'2025.01.25 08:30',views:345,likes:19,dislikes:0,isHtml:false,content:'신규 입사자 현장 OJT 교육을 담당하게 됐는데\n안전, 품질, 공정 등 짧은 시간에 효과적으로 교육하는 방법이 있으면 공유 부탁드립니다.',images:[],comments:[{id:56,author:'HRD전문',text:'멘토-멘티 매칭, 체크리스트 기반 단계별 교육, 첫 1주 안전 집중 교육이 효과적입니다.',replies:[{author:'교육담당자',text:'체크리스트 기반 교육이 특히 좋아 보이네요. 샘플 있으면 공유 부탁드립니다.'}]}]},
];
let nextPostId = POSTS.length + 1;
let nextCommentId = 57;

/* ═══ 게시글 localStorage 저장/복원 (POSTS 선언 직후 실행) ═══ */
function savePosts(){
  try{
    var up = POSTS.filter(function(p){ return p.id > 50; });
    localStorage.setItem('sbt_user_posts', JSON.stringify(up));
    localStorage.setItem('sbt_next_post_id', String(nextPostId));
  }catch(e){}
}
(function(){
  try{
    var saved = localStorage.getItem('sbt_user_posts');
    if(!saved) return;
    var arr = JSON.parse(saved);
    if(!arr||!arr.length) return;
    arr.forEach(function(p){
      if(!POSTS.find(function(x){return x.id===p.id;})) POSTS.push(p);
    });
    var sid = parseInt(localStorage.getItem('sbt_next_post_id')||'0');
    if(sid > nextPostId) nextPostId = sid;
  }catch(e){}
})();
(function(){
  try{ bookmarkedPosts = JSON.parse(localStorage.getItem('sbt_bookmarks')||'{}'); }catch(e){}
  try{ likedComments  = JSON.parse(localStorage.getItem('sbt_cmt_likes')||'{}'); }catch(e){}
})();

/* ── 드롭다운 메뉴 제어 ── */
var commDropdownTimer = null;
function openCommDropdown(){
  var el = document.getElementById('commDropdown');
  if(el) el.classList.add('open');
  cancelCloseCommDropdown();
  // 5초 후 자동 닫힘
  commDropdownTimer = setTimeout(closeCommDropdown, 5000);
}
function scheduleCloseCommDropdown(){
  cancelCloseCommDropdown();
  commDropdownTimer = setTimeout(closeCommDropdown, 300);
}
function cancelCloseCommDropdown(){
  if(commDropdownTimer){ clearTimeout(commDropdownTimer); commDropdownTimer=null; }
}
function closeCommDropdown(){
  var el = document.getElementById('commDropdown');
  if(el) el.classList.remove('open');
  cancelCloseCommDropdown();
}
// 외부 클릭 시 드롭다운 닫힘
document.addEventListener('click', function(e){
  var dd = document.getElementById('commDropdown');
  if(dd && !dd.contains(e.target)) closeCommDropdown();
});
function showCommBoard(tabKey){
  closeCommDropdown();
  showPage('community');
  setTimeout(function(){ switchCommTab(tabKey); }, 100);
}

/* ── 커뮤니티 탭 전환 ── */
function switchCommTab(tab) {
  var tabs = ['all','free','qna','info','matcmt','best'];
  tabs.forEach(function(t) {
    var el = document.getElementById('comm-content-'+t);
    if(el) el.style.display = t===tab ? 'block' : 'none';
  });
  // 1행 탭 버튼 스타일 (all/free/qna/info/matcmt)
  ['all','free','qna','info','matcmt'].forEach(function(t) {
    var btn = document.getElementById('comm-tab-'+t);
    if(!btn) return;
    if(t===tab) {
      btn.style.background='var(--orange)'; btn.style.color='#fff';
      btn.style.border='none'; btn.style.borderBottom='2px solid var(--orange)';
    } else {
      btn.style.background='transparent'; btn.style.color='var(--text-mid)';
      btn.style.border='1px solid var(--border)'; btn.style.borderBottom='none';
    }
  });
  // 2행 베스트 버튼 스타일
  var bestBtn = document.getElementById('comm-tab-best');
  if(bestBtn){
    if(tab==='best'){ bestBtn.style.background='var(--orange)'; bestBtn.style.color='#fff'; bestBtn.style.border='none'; }
    else { bestBtn.style.background='transparent'; bestBtn.style.color='var(--text-mid)'; bestBtn.style.border='1px solid var(--border)'; }
  }
  commPage = 1;
  if(tab==='all')     renderAllPosts();
  if(tab==='free')    renderBoardPosts('free');
  if(tab==='qna')     renderBoardPosts('qna');
  if(tab==='info')    renderBoardPosts('info');
  if(tab==='best')    renderBestPosts();
  if(tab==='matcmt')  renderMatCmtBoard();
}

/* ── 베스트 게시판 ── */
function renderBestPosts() {
  var el = document.getElementById('bestPostList'); if(!el) return;
  var best = POSTS.filter(function(p){ return p.likes >= 15; })
                  .sort(function(a,b){ return b.likes - a.likes; });
  if(!best.length) {
    el.innerHTML='<div style="text-align:center;padding:48px;color:var(--text-light)"><div style="font-size:36px;margin-bottom:12px">🏆</div><p>아직 베스트 게시글이 없습니다.<br><span style="font-size:12px">추천수 15개 이상이면 자동 등록됩니다.</span></p></div>';
    return;
  }
  el.innerHTML = best.map(function(p, i){ return postRowHTML(p, i); }).join('');
}

/* ── 전체 게시판 (페이지네이션) ── */
function renderAllPosts() {
  var el = document.getElementById('allPostList'); if(!el) return;
  var q = (document.getElementById('commSearchInput')||{}).value || '';
  var pageSize = parseInt((document.getElementById('commPageSize')||{}).value || '15');
  var list = POSTS.filter(function(p){
    if(!q) return true;
    return p.title.includes(q) || p.author.includes(q) || (p.content&&p.content.includes(q));
  }).sort(function(a,b){ return b.id - a.id; });
  var total = list.length;
  var totalPages = Math.ceil(total / pageSize) || 1;
  var start = (commPage-1) * pageSize;
  var pageList = list.slice(start, start + pageSize);
  var countEl = document.getElementById('allPostCount');
  // 총 게시글 수는 관리자만 표시
  if(countEl) countEl.textContent = isAdmin ? '총 '+total+'개' : '';
  var html = pageList.map(function(p, i){ return postRowHTML(p, start+i); }).join('');
  html += renderPagination(totalPages, commPage, 'goCommPage');
  if(!pageList.length) html='<div style="padding:32px;text-align:center;color:var(--text-light)">'+(q?'"'+q+'" 검색 결과가 없습니다.':'게시글이 없습니다.')+'</div>';
  el.innerHTML = html;
}
function goCommPage(pg){ commPage=pg; renderAllPosts(); window.scrollTo(0,200); }

/* ── 게시판별 렌더 (자유/질문/정보) ── */
var boardPages = {free:1, qna:1, info:1};
var catMap = {free:'자유게시판', qna:'질문게시판', info:'정보게시판'};
function renderBoardPosts(boardKey) {
  var catName = catMap[boardKey];
  var el = document.getElementById(boardKey+'PostList'); if(!el) return;
  var q = (document.getElementById(boardKey+'SearchInput')||{}).value || '';
  var pageSize = parseInt((document.getElementById(boardKey+'PageSize')||{}).value || '15');
  var list = POSTS.filter(function(p){
    if(p.cat !== catName) return false;
    if(!q) return true;
    return p.title.includes(q) || p.author.includes(q) || (p.content&&p.content.includes(q));
  }).sort(function(a,b){ return b.id - a.id; });
  var total = list.length;
  var totalPages = Math.ceil(total / pageSize) || 1;
  var pg = boardPages[boardKey] || 1;
  var start = (pg-1) * pageSize;
  var pageList = list.slice(start, start + pageSize);
  var countEl = document.getElementById(boardKey+'PostCount');
  // 총 게시글 수는 관리자만 표시
  if(countEl) countEl.textContent = isAdmin ? '총 '+total+'개' : '';
  var html = pageList.length
    ? pageList.map(function(p,i){ return postRowHTML(p, start+i); }).join('')
    : '<div style="padding:40px;text-align:center;color:var(--text-light)">'+(q?'"'+q+'" 검색 결과가 없습니다.':'아직 게시글이 없습니다.<br><span style="font-size:12px">✏️ 글쓰기로 첫 글을 작성해보세요!</span>')+'</div>';
  html += renderPagination(totalPages, pg, 'goBoardPage_'+boardKey);
  el.innerHTML = html;
}
function goBoardPage_free(pg){ boardPages.free=pg; renderBoardPosts('free'); window.scrollTo(0,200); }
function goBoardPage_qna(pg){  boardPages.qna=pg;  renderBoardPosts('qna');  window.scrollTo(0,200); }
function goBoardPage_info(pg){ boardPages.info=pg; renderBoardPosts('info'); window.scrollTo(0,200); }

/* ── 페이지네이션 HTML ── */
function renderPagination(totalPages, currentPage, fnName) {
  if(totalPages <= 1) return '';
  var html = '<div style="display:flex;justify-content:center;gap:6px;margin-top:16px;flex-wrap:wrap">';
  for(var pg=1; pg<=totalPages; pg++){
    var active = pg===currentPage;
    html += '<button onclick="'+fnName+'('+pg+')" style="padding:6px 12px;border-radius:4px;font-size:13px;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif;'+(active?'background:var(--orange);color:#fff;border:none;font-weight:700':'background:var(--white);color:var(--text-mid);border:1px solid var(--border)')+'">'+pg+'</button>';
  }
  html += '</div>';
  return html;
}

/* ── 게시글 행 HTML (컴팩트) ── */
function postRowHTML(p, i) {
  var isBest = p.likes >= 15;
  var authorGrade = p.grade || '기공';
  var g = GRADES[authorGrade] || GRADES['기공'];

  // NEW 뱃지: 오늘 작성 여부
  var todayStr2 = new Date().toLocaleDateString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'}).replace(/\.\s*/g,'.').replace(/\.$/,'');
  var isNew = p.date && p.date.replace(/\./g,'-').substring(0,10) === new Date().toISOString().substring(0,10);
  var newBadge = isNew ? ' <span style="font-size:9px;font-weight:700;padding:1px 5px;border-radius:2px;background:#E8500A;color:#fff">NEW</span>' : '';

  // 고정폭 컬럼: 등급뱃지(60px) | 아이디(70px) | 날짜(110px) | 추천(36px) | 조회(36px) | 댓글(30px)
  var cols =
    // 등급 뱃지 고정폭
    '<span style="display:inline-block;width:60px;font-size:9px;font-weight:700;padding:1px 4px;border-radius:2px;background:'+g.bg+';color:'+g.color+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;vertical-align:middle;flex-shrink:0">'+g.num+' '+g.label+'</span>'
    // 아이디 고정폭
    +'<span style="display:inline-block;width:70px;font-size:11px;color:#3A6BC8;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;vertical-align:middle;flex-shrink:0">'+p.author+'</span>'
    // 날짜 고정폭
    +'<span style="display:inline-block;width:110px;font-size:10px;color:var(--text-light);white-space:nowrap;vertical-align:middle;flex-shrink:0">'+p.date+'</span>'
    // 추천
    +'<span style="display:inline-block;width:36px;font-size:11px;color:'+(p.likes>=15?'var(--orange)':'var(--text-light)')+';text-align:right;vertical-align:middle;flex-shrink:0">👍'+p.likes+'</span>'
    // 조회
    +'<span style="display:inline-block;width:36px;font-size:11px;color:var(--text-light);text-align:right;vertical-align:middle;flex-shrink:0">👁'+p.views+'</span>'
    // 댓글
    +'<span style="display:inline-block;width:30px;font-size:11px;color:var(--text-light);text-align:right;vertical-align:middle;flex-shrink:0">💬'+p.comments.length+'</span>';

  return '<div onclick="openPostDetail('+p.id+')" style="background:var(--white);border:1px solid '+(isBest?'#FFD700':'var(--border)')+';border-radius:5px;padding:6px 12px;margin-bottom:3px;cursor:pointer;transition:box-shadow .12s" onmouseover="this.style.boxShadow=\'0 2px 8px rgba(0,0,0,.07)\'" onmouseout="this.style.boxShadow=\'\'">'
    +'<div style="display:flex;align-items:center;gap:6px;min-width:0">'
      // 번호/베스트
      +(isBest?'<span style="font-size:11px;flex-shrink:0;width:18px;text-align:center">🏆</span>':'<span style="font-size:11px;color:var(--text-light);width:18px;text-align:center;flex-shrink:0">'+(i+1)+'</span>')
      // 게시판·유형 뱃지
      +'<span style="font-size:10px;padding:1px 5px;border-radius:2px;background:var(--tag-bg);color:var(--tag-text);font-weight:600;flex-shrink:0;white-space:nowrap">'+p.cat.replace('게시판','').trim()+'</span>'
      +'<span style="font-size:10px;padding:1px 5px;border-radius:2px;background:'+(p.badge==='Q&A'?'#E8F0FB':'#E8F5EE')+';color:'+(p.badge==='Q&A'?'#1A5080':'#1A6B3A')+';font-weight:600;flex-shrink:0;white-space:nowrap">'+p.badge+'</span>'
      // 제목 (남은 공간)
      +'<span style="font-size:13px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1">'+p.title+(p.images&&p.images.length?' 📎'+p.images.length:'')+(bookmarkedPosts[p.id]?' 🔖':'')+newBadge+'</span>'
      // 고정폭 컬럼들
      +cols
    +'</div>'
  +'</div>';
}

/* ── 글쓰기 모드 전환 ── */
function setWriteMode(mode){
  writeMode = mode;
  var ta = document.getElementById('write-content');
  var hint = document.getElementById('write-html-hint');
  var btnT = document.getElementById('btn-mode-text');
  var btnH = document.getElementById('btn-mode-html');
  if(mode==='html'){
    if(ta) ta.placeholder='HTML 코드를 입력하세요\n예: <b>굵은텍스트</b>\n<img src="https://..." style="max-width:100%">';
    if(hint) hint.style.display='block';
    if(btnT){ btnT.style.background='transparent'; btnT.style.color='var(--text-mid)'; btnT.style.border='1px solid var(--border)'; }
    if(btnH){ btnH.style.background='var(--orange)'; btnH.style.color='#fff'; btnH.style.border='none'; }
  } else {
    if(ta) ta.placeholder='내용을 입력하세요 (일반 텍스트)';
    if(hint) hint.style.display='none';
    if(btnT){ btnT.style.background='var(--orange)'; btnT.style.color='#fff'; btnT.style.border='none'; }
    if(btnH){ btnH.style.background='transparent'; btnH.style.color='var(--text-mid)'; btnH.style.border='1px solid var(--border)'; }
  }
}

/* ── 사진 첨부 (800px 리사이즈 압축) ── */
function handlePostImages(input){
  var files = Array.from(input.files);
  var remain = 3 - writeImages.length;
  if(remain <= 0){ alert('사진은 최대 3장까지 첨부 가능합니다.'); input.value=''; return; }
  files.slice(0, remain).forEach(function(file){
    var reader = new FileReader();
    reader.onload = function(e){
      var img = new Image();
      img.onload = function(){
        var MAX = 800;
        var ratio = Math.min(1, MAX/img.width, MAX/img.height);
        var c = document.createElement('canvas');
        c.width = Math.round(img.width*ratio); c.height = Math.round(img.height*ratio);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        var compressed = c.toDataURL('image/jpeg', 0.72);
        writeImages.push(compressed);
        renderWriteImgPreview();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
  input.value = '';
}
function renderWriteImgPreview(){
  var el = document.getElementById('write-img-preview'); if(!el) return;
  el.innerHTML = writeImages.map(function(src, i){
    return '<div style="position:relative;width:72px;height:72px;border-radius:4px;overflow:hidden;border:1px solid var(--border)">'
      +'<img src="'+src+'" style="width:100%;height:100%;object-fit:cover">'
      +'<button onclick="removeWriteImg('+i+')" style="position:absolute;top:1px;right:1px;background:rgba(0,0,0,.6);color:#fff;border:none;border-radius:2px;font-size:10px;cursor:pointer;width:16px;height:16px;line-height:1;padding:0">✕</button>'
    +'</div>';
  }).join('');
}
function removeWriteImg(i){ writeImages.splice(i,1); renderWriteImgPreview(); }

/* ── 글쓰기 모달 ── */
function openWriteModal(){
  if(!currentUser){ alert('글쓰기는 로그인 후 이용할 수 있습니다.'); openLoginModal(); return; }
  writeImages = []; writeMode = 'text';
  var els = ['write-title','write-content'];
  els.forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
  var authorEl = document.getElementById('write-author');
  if(authorEl){ authorEl.value = currentUser.name; authorEl.readOnly = true; authorEl.style.background='var(--surface)'; authorEl.style.color='var(--text-mid)'; }
  renderWriteImgPreview();
  setWriteMode('text');
  document.getElementById('writeModal').style.display='flex';
}
function closeWriteModal(){ document.getElementById('writeModal').style.display='none'; }
// writeModal 이벤트는 community.js의 initCommunityHTML에서 등록

function submitPost(){
  var title   = (document.getElementById('write-title')  ||{}).value.trim();
  var content = (document.getElementById('write-content')||{}).value.trim();
  if(!currentUser){ alert('글쓰기는 로그인 후 이용할 수 있습니다.'); openLoginModal(); return; }
  var author  = currentUser.name;
  var cat     = (document.getElementById('write-cat')    ||{}).value;
  var badge   = (document.getElementById('write-badge')  ||{}).value;
  if(!title)  { alert('제목을 입력해주세요.'); return; }
  if(!content){ alert('내용을 입력해주세요.'); return; }
  var today = new Date();
  var dateStr = today.toLocaleDateString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'}).replace(/\.\s*/g,'.').replace(/\.$/,'')
    + ' ' + String(today.getHours()).padStart(2,'0') + ':' + String(today.getMinutes()).padStart(2,'0');
  var authorGrade = currentUser ? currentUser.grade : '기공';
  POSTS.push({ id:nextPostId++, cat:cat, badge:badge, title:title, author:author, grade:authorGrade,
    date:dateStr, views:1, likes:0, dislikes:0, isHtml:(writeMode==='html'),
    content:content, images:writeImages.slice(), comments:[] });
  if(currentUser){ addExp(currentUser, 15, '게시글 작성'); currentUser.postCount=(currentUser.postCount||0)+1; saveUserData(); }
  savePosts();
  closeWriteModal();
  alert('게시글이 등록됐습니다! (+15 경험치)');
  commPage=1;
  switchCommTab('all');
}

/* ── 게시글 상세 ── */
function openPostDetail(id){
  var p = POSTS.find(function(p){ return p.id===id; }); if(!p) return;
  p.views++;
  var isBest = p.likes >= 15;
  var myVote = likedPosts[id] || null;

  // 본문 렌더 (HTML모드/일반모드)
  var bodyHtml = p.isHtml
    ? p.content
    : p.content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');

  // 첨부 이미지
  var imgHtml = (p.images&&p.images.length)
    ? '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px">'+p.images.map(function(src){
        return '<img src="'+src+'" style="max-width:280px;max-height:200px;border-radius:6px;border:1px solid var(--border);cursor:pointer;object-fit:cover" onclick="this.style.maxWidth=this.style.maxWidth===\'100%\'?\'280px\':\'100%\'">';
      }).join('')+'</div>'
    : '';

  // 댓글 렌더
  function renderComments(comments){
    return comments.map(function(c){
      var canDeleteCmt = isAdmin || (currentUser && currentUser.name === c.author);
      return '<div style="padding:12px 14px;background:var(--surface);border-radius:6px;margin-bottom:6px" id="cmt-'+c.id+'">'
        +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">'
          +'<span style="font-size:12px;font-weight:700;color:var(--text-mid)">'+c.author+'</span>'
          +'<div style="display:flex;gap:6px;align-items:center">'
            +(currentUser?'<button onclick="toggleReplyBox('+c.id+')" style="font-size:11px;color:var(--text-light);background:none;border:none;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">↩ 답글</button>':'')
            +(canDeleteCmt?'<button onclick="deleteComment('+p.id+','+c.id+')" style="font-size:11px;color:#C04040;background:none;border:none;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">🗑</button>':'')
          +'</div>'
        +'</div>'
        +'<div style="font-size:13px;color:var(--text);line-height:1.6">'+c.text+'</div>'
        +'<div style="margin-top:6px">'
          +'<button id="cmtLike-'+c.id+'" onclick="voteComment('+p.id+','+c.id+')" style="font-size:11px;color:'+(likedComments[c.id]?'var(--orange)':'var(--text-light)')+';font-weight:'+(likedComments[c.id]?'700':'400')+';background:none;border:1px solid var(--border);border-radius:3px;padding:2px 8px;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">👍 '+(c.likes||0)+'</button>'
        +'</div>'
        // 대댓글
        +(c.replies&&c.replies.length?'<div class="replies-container" style="margin-top:8px;padding:8px 12px;border-left:2px solid var(--orange);background:#FFFAF7;border-radius:0 4px 4px 0">'
          +c.replies.map(function(r){
            return '<div style="padding:6px 0;border-bottom:1px solid #FFE8D6">'
              +'<div style="font-size:11px;font-weight:700;color:var(--text-mid);margin-bottom:3px">↩ '+r.author+' <span style="font-weight:400;color:var(--text-light);font-size:10px">'+(r.date||'')+'</span></div>'
              +'<div style="font-size:12px;color:var(--text)">'+r.text+'</div>'
            +'</div>';
          }).join('')+'</div>':'')
        +'<div id="reply-box-'+c.id+'" style="display:none;margin-top:8px">'
          +'<div style="display:flex;gap:6px">'
            +'<input type="text" id="reply-input-'+c.id+'" placeholder="답글 입력..." style="flex:1;padding:7px 10px;border:1px solid var(--border);border-radius:4px;font-size:12px;font-family:\'Noto Sans KR\',sans-serif;outline:none" onkeydown="if(event.key===\'Enter\')addReply('+p.id+','+c.id+')">'
            +'<button onclick="addReply('+p.id+','+c.id+')" style="padding:7px 12px;background:var(--dark);color:#fff;border:none;border-radius:4px;font-size:12px;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">등록</button>'
          +'</div>'
        +'</div>'
      +'</div>';
    }).join('');
  }

  document.getElementById('postDetailContent').innerHTML=
    '<div style="background:var(--white);border:1px solid '+(isBest?'#FFD700':'var(--border)')+';border-radius:8px;overflow:hidden">'
      +'<div style="padding:20px 24px;border-bottom:1px solid var(--border)">'
        +'<div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap">'
          +(isBest?'<span style="background:#FFF8E1;color:#B8860B;font-size:11px;padding:2px 8px;border-radius:3px;font-weight:700">🏆 베스트</span>':'')
          +'<span style="background:var(--tag-bg);color:var(--tag-text);font-size:11px;padding:2px 8px;border-radius:3px">'+p.cat+'</span>'
          +'<span style="background:'+(p.badge==='Q&A'?'#E8F0FB':'#E8F5EE')+';color:'+(p.badge==='Q&A'?'#1A5080':'#1A6B3A')+';font-size:11px;padding:2px 8px;border-radius:3px">'+p.badge+'</span>'
        +'</div>'
        +'<h2 style="font-size:19px;font-weight:700;margin-bottom:10px">'+p.title+'</h2>'
        +'<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">'
          +'<div style="display:flex;gap:14px;font-size:12px;color:var(--text-light)">'
            +'<span><strong style="color:var(--text-mid)">'+p.author+'</strong></span>'
            +'<span>'+p.date+'</span><span>👁 '+p.views+'</span><span>💬 '+p.comments.length+'</span>'
          +'</div>'
          +'<div style="display:flex;gap:6px;flex-wrap:wrap">'
            // 작성자만: 수정
            +(currentUser&&currentUser.name===p.author?'<button onclick="openEditPost('+p.id+')" style="padding:5px 10px;background:transparent;border:1px solid var(--border);border-radius:4px;font-size:11px;color:var(--text-mid);cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">✏️ 수정</button>':'')
            // 작성자 또는 관리자: 삭제
            +((currentUser&&currentUser.name===p.author)||isAdmin?'<button onclick="deletePost('+p.id+')" style="padding:5px 10px;background:transparent;border:1px solid #E0A0A0;border-radius:4px;font-size:11px;color:#C04040;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">🗑 삭제</button>':'')
            // 관리자: 수치조정
            +(isAdmin?'<button onclick="openAdjustModal('+p.id+')" style="padding:5px 10px;background:transparent;border:1px solid var(--border);border-radius:4px;font-size:11px;color:var(--text-mid);cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">🔧 수치</button>':'')
            // 로그인 시: 쪽지
            +(currentUser&&currentUser.name!==p.author?'<button onclick="openSendMsgModal(\''+p.author+'\')" style="padding:5px 10px;background:transparent;border:1px solid var(--border);border-radius:4px;font-size:11px;color:var(--text-mid);cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">✉️ 쪽지</button>':'')
            +'<button id="bookmarkBtn-'+p.id+'" onclick="toggleBookmark('+p.id+')" style="display:flex;align-items:center;gap:5px;padding:6px 14px;background:'+(bookmarkedPosts[p.id]?'#FFF8E1':'#F5F3EF')+';color:'+(bookmarkedPosts[p.id]?'#B8860B':'var(--text-mid)')+';border:1px solid '+(bookmarkedPosts[p.id]?'#FFD700':'var(--border)')+';border-radius:4px;font-size:12px;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">'+(bookmarkedPosts[p.id]?'🔖 스크랩됨':'🔖 스크랩')+'</button>'
            +'<button onclick="sharePost('+p.id+')" style="display:flex;align-items:center;gap:5px;padding:6px 14px;background:#F5F3EF;color:var(--text-mid);border:1px solid var(--border);border-radius:4px;font-size:12px;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">🔗 공유</button>'
            +(currentUser&&currentUser.name!==p.author?'<button onclick="reportPost('+p.id+')" style="display:flex;align-items:center;gap:5px;padding:6px 14px;background:#F5F3EF;color:#999;border:1px solid var(--border);border-radius:4px;font-size:12px;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">🚨 신고</button>':'')
            +'<button onclick="votePost('+p.id+',\'like\')" id="likeBtn-'+p.id+'" style="display:flex;align-items:center;gap:5px;padding:6px 14px;background:'+(myVote==='like'?'var(--orange)':'#F5F3EF')+';color:'+(myVote==='like'?'#fff':'var(--text-mid)')+';border:1px solid '+(myVote==='like'?'var(--orange)':'var(--border)')+';border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">👍 추천 <span id="likeCnt-'+p.id+'">'+p.likes+'</span></button>'
            +'<button onclick="votePost('+p.id+',\'dislike\')" id="dislikeBtn-'+p.id+'" style="display:flex;align-items:center;gap:5px;padding:6px 14px;background:'+(myVote==='dislike'?'#555':'#F5F3EF')+';color:'+(myVote==='dislike'?'#fff':'var(--text-mid)')+';border:1px solid '+(myVote==='dislike'?'#555':'var(--border)')+';border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">👎 반대 <span id="dislikeCnt-'+p.id+'">'+p.dislikes+'</span></button>'
          +'</div>'
        +'</div>'
      +'</div>'
      +'<div style="padding:24px;font-size:14px;color:var(--text-mid);line-height:1.9;border-bottom:1px solid var(--border)">'+bodyHtml+imgHtml+'</div>'
      +'<div style="padding:20px 24px" id="commentsArea-'+p.id+'">'
        +'<div style="font-size:13px;font-weight:700;margin-bottom:12px">댓글 <span id="cmtCnt-'+p.id+'">'+p.comments.length+'</span>개</div>'
        +'<div id="cmtList-'+p.id+'">'+renderComments(p.comments)+'</div>'
        +(currentUser
          ?'<div style="margin-top:12px;display:flex;gap:8px">'
            +'<input type="text" id="cmtInput-'+p.id+'" placeholder="댓글을 입력하세요..." style="flex:1;padding:9px 12px;border:1px solid var(--border);border-radius:6px;font-size:13px;font-family:\'Noto Sans KR\',sans-serif;outline:none" onkeydown="if(event.key===\'Enter\')addComment('+p.id+')">'
            +'<button onclick="addComment('+p.id+')" style="padding:9px 16px;background:var(--orange);color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">등록</button>'
          +'</div>'
          :'<div style="margin-top:12px;padding:12px;background:var(--surface);border-radius:6px;text-align:center;font-size:13px;color:var(--text-light)">댓글을 작성하려면 <button onclick="openLoginModal()" style="background:none;border:none;color:var(--orange);font-weight:700;cursor:pointer;font-size:13px;font-family:\'Noto Sans KR\',sans-serif">로그인</button>이 필요합니다.</div>'
        )
      +'</div>'
    +'</div>';

  document.querySelectorAll('.page').forEach(function(el){ el.classList.remove('active'); });
  document.getElementById('page-post-detail').classList.add('active');
  history.pushState({page:'post-detail'}, '', '#post-detail');
  var backBtn = document.querySelector('#page-post-detail > div > button');
  if(backBtn) backBtn.onclick = function(){ showPage('community'); };
  window.scrollTo(0,0);
}

/* ── 답글 박스 토글 ── */
var ppImgData={1:'',2:''};
function openPhotoPageModal(){
  ppImgData={1:'',2:''};
  ['pp-project','pp-desc1','pp-loc1','pp-work1','pp-desc2','pp-loc2','pp-work2'].forEach(function(id){var el=document.getElementById(id);if(el)el.value='';});
  var today=new Date().toISOString().split('T')[0];
  ['pp-date1','pp-date2'].forEach(function(id){var el=document.getElementById(id);if(el)el.value=today;});
  [1,2].forEach(function(n){
    var img=document.getElementById('pp-img'+n),hint=document.getElementById('pp-hint'+n);
    if(img){img.style.display='none';img.src='';}if(hint)hint.style.display='block';
  });
  document.getElementById('photoPageModal').style.display='flex';
}
function closePhotoPageModal(){document.getElementById('photoPageModal').style.display='none';}
function ppLoadImg(input,n){
  var file=input.files[0];if(!file)return;
  var r=new FileReader();
  r.onload=function(e){ppImgData[n]=e.target.result;var img=document.getElementById('pp-img'+n),hint=document.getElementById('pp-hint'+n);if(img){img.src=e.target.result;img.style.display='block';}if(hint)hint.style.display='none';};
  r.readAsDataURL(file);input.value='';
}
function ppFileDrop(event,n){
  event.preventDefault();
  var file=event.dataTransfer.files[0];if(!file||!file.type.startsWith('image/'))return;
  var el=document.getElementById('pp-drop'+n);if(el)el.style.background='';
  var r=new FileReader();
  r.onload=function(e){ppImgData[n]=e.target.result;var img=document.getElementById('pp-img'+n),hint=document.getElementById('pp-hint'+n);if(img){img.src=e.target.result;img.style.display='block';}if(hint)hint.style.display='none';};
  r.readAsDataURL(file);
}
function generatePhotoPage(){
  var project=document.getElementById('pp-project').value.trim()||'(공사명)';
  var items=[1,2].map(function(n){return{img:ppImgData[n],desc:document.getElementById('pp-desc'+n).value.trim(),loc:document.getElementById('pp-loc'+n).value.trim(),work:document.getElementById('pp-work'+n).value.trim(),date:document.getElementById('pp-date'+n).value||''};});
  function block(item){
    var imgH=item.img?'<img src="'+item.img+'" style="width:100%;height:220px;object-fit:contain;display:block">':'<div style="width:100%;height:220px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#aaa;font-size:13px">(사진 없음)</div>';
    return '<div style="border:1.5px solid #333;margin-bottom:16px"><div style="border:1px solid #ccc;margin:10px;overflow:hidden">'+imgH+'</div>'
      +'<table style="width:100%;border-collapse:collapse;font-size:13px">'
      +'<tr><td style="border:1px solid #333;padding:6px 10px;font-weight:700;width:60px;background:#f8f8f8;font-family:\'Noto Sans KR\',sans-serif">설&nbsp;명</td><td style="border:1px solid #333;padding:6px 10px;width:200px;font-family:\'Noto Sans KR\',sans-serif">'+item.desc+'</td>'
      +'<td style="border:1px solid #333;padding:6px 10px;font-weight:700;width:50px;background:#f8f8f8;font-family:\'Noto Sans KR\',sans-serif">위&nbsp;치</td><td style="border:1px solid #333;padding:6px 10px;font-family:\'Noto Sans KR\',sans-serif">'+item.loc+'</td></tr>'
      +'<tr><td style="border:1px solid #333;padding:6px 10px;font-weight:700;background:#f8f8f8;font-family:\'Noto Sans KR\',sans-serif">공&nbsp;종</td><td style="border:1px solid #333;padding:6px 10px;font-family:\'Noto Sans KR\',sans-serif">'+item.work+'</td>'
      +'<td style="border:1px solid #333;padding:6px 10px;font-weight:700;background:#f8f8f8;font-family:\'Noto Sans KR\',sans-serif">날&nbsp;자</td><td style="border:1px solid #333;padding:6px 10px;font-family:\'Noto Sans KR\',sans-serif">'+item.date+'</td></tr>'
      +'</table></div>';
  }
  var html='<!DOCTYPE html><html><head><meta charset="UTF-8">'
    +'<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap" rel="stylesheet">'
    +'<style>@page{size:A4;margin:15mm}body{font-family:"Noto Sans KR",sans-serif;margin:0}.page{width:180mm;margin:0 auto}.title{text-align:center;font-size:24px;font-weight:700;letter-spacing:8px;margin-bottom:14px;text-decoration:underline}.project{font-size:14px;font-weight:700;margin-bottom:14px}@media print{.np{display:none}body{-webkit-print-color-adjust:exact}}</style></head><body>'
    +'<div class="np" style="position:fixed;top:0;left:0;right:0;background:#1A1A18;padding:10px 20px;display:flex;justify-content:space-between;align-items:center;z-index:99">'
      +'<span style="color:#fff;font-size:13px">사진대지 — '+project+'</span>'
      +'<div style="display:flex;gap:8px"><button onclick="window.print()" style="padding:7px 18px;background:#E8500A;color:#fff;border:none;border-radius:4px;font-size:13px;font-weight:700;cursor:pointer">🖨 PDF 저장</button>'
      +'<button onclick="window.close()" style="padding:7px 12px;background:transparent;color:#aaa;border:1px solid #555;border-radius:4px;font-size:12px;cursor:pointer">닫기</button></div></div>'
    +'<div class="page" style="padding-top:50px"><div class="title">사 진 대 지</div>'
    +'<div class="project">■ 공 사 명 : '+project+'</div>'
    +block(items[0])+block(items[1])
    +'</div></body></html>';
  var win=window.open('','_blank','width=820,height=1060');
  win.document.write(html); win.document.close();
  closePhotoPageModal();
}



/* ══════════════════════════════════════════════
   자재·용어집 페이지
══════════════════════════════════════════════ */
var matListTab = 'mat';

function matlistClick(el){
  var name = el.getAttribute('data-name');
  if(name){ setSearch(name); showPage('search'); }
}

function switchMatListTab(tab) {
  matListTab = tab;
  ['mat','term'].forEach(function(t) {
    var btn = document.getElementById('ml-tab-' + t);
    if (!btn) return;
    btn.style.background = (t===tab) ? 'var(--orange)' : 'transparent';
    btn.style.color      = (t===tab) ? '#fff' : 'var(--text-mid)';
    btn.style.fontWeight = (t===tab) ? '700' : '400';
  });
  renderMatList();
}

function renderMatList() {
  var el = document.getElementById('matlist-content'); if (!el) return;
  var qRaw = (document.getElementById('matlist-search') || {}).value || '';
  var q = qRaw.trim().toLowerCase();

  if (matListTab === 'mat') {
    var list = DB.filter(function(d) {
      if (!q) return true;
      return (d.name||'').toLowerCase().includes(q)
          || (d.aliases||[]).some(function(a){ return a.toLowerCase().includes(q); })
          || (d.tags||[]).some(function(t){ return t.toLowerCase().includes(q); })
          || (d.desc||'').toLowerCase().includes(q);
    });

    if (!list.length) {
      el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-light)">검색 결과가 없습니다.</div>';
      return;
    }

    var groups = {};
    list.forEach(function(d) {
      var cat = d.cat || '기타';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(d);
    });

    var html = '<div style="font-size:12px;color:var(--text-light);margin-bottom:12px">총 ' + list.length + '개 자재</div>';
    Object.keys(groups).sort().forEach(function(cat) {
      html += '<div style="margin-bottom:16px">';
      html += '<div style="font-size:12px;font-weight:700;color:var(--text-mid);padding:6px 10px;background:var(--surface);border-radius:4px;margin-bottom:6px">';
      html += getBadgeLabel(cat) + ' <span style="font-weight:400;color:var(--text-light)">(' + groups[cat].length + '개)</span></div>';
      html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:6px">';
      groups[cat].forEach(function(d) {
        var safeQ = q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
        var hl = q ? d.name.replace(new RegExp(safeQ,'gi'),function(m){ return '<mark style="background:#FFF3C8">'+m+'</mark>'; }) : d.name;
        var aliases = d.aliases && d.aliases.length ? '<div style="font-size:11px;color:var(--text-light)">' + d.aliases.join(', ') + '</div>' : '';
        var desc = d.desc ? '<div style="font-size:11px;color:var(--text-mid);margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + d.desc + '</div>' : '';
        html += '<div onclick="matlistClick(this)" data-name="' + d.name.replace(/"/g,'&quot;') + '" '
              + 'class="matlist-card" '
              + 'style="padding:10px 14px;background:var(--white);border:1px solid var(--border);border-radius:6px;cursor:pointer">'
              + '<div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:3px">' + hl + '</div>'
              + aliases + desc + '</div>';
      });
      html += '</div></div>';
    });
    el.innerHTML = html;

  } else {
    var terms = TERMS.filter(function(t) {
      if (!q) return true;
      return (t.word||'').toLowerCase().includes(q)
          || (t.aliases||[]).some(function(a){ return a.toLowerCase().includes(q); })
          || (t.desc||'').toLowerCase().includes(q);
    });

    if (!terms.length) {
      el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-light)">검색 결과가 없습니다.</div>';
      return;
    }

    var html2 = '<div style="font-size:12px;color:var(--text-light);margin-bottom:12px">총 ' + terms.length + '개 용어</div>';
    html2 += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:8px">';
    terms.forEach(function(t) {
      var safeQ2 = q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      var hl2 = q ? t.word.replace(new RegExp(safeQ2,'gi'),function(m){ return '<mark style="background:#FFF3C8">'+m+'</mark>'; }) : t.word;
      var ali = t.aliases && t.aliases.length ? '<span style="font-size:11px;color:var(--text-light)">(' + t.aliases.join(', ') + ')</span>' : '';
      html2 += '<div style="padding:12px 16px;background:var(--white);border:1px solid var(--border);border-radius:6px">'
             + '<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;flex-wrap:wrap">'
             + '<span style="font-size:14px;font-weight:700;color:var(--text)">' + hl2 + '</span>' + ali
             + '<span style="font-size:10px;padding:1px 6px;border-radius:2px;background:var(--tag-bg);color:var(--tag-text);margin-left:auto">' + (t.cat||'') + '</span>'
             + '</div>'
             + '<div style="font-size:12px;color:var(--text-mid);line-height:1.6">' + (t.desc||'') + '</div>'
             + '</div>';
    });
    html2 += '</div>';
    el.innerHTML = html2;
  }
}


