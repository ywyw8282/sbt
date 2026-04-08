var DOCS = [];
var nextDocId = 1;
var docsWriteType = 'upload';
var docsTab = 'all';

/* ═══ 공무자료실 localStorage 저장/복원 ═══ */
function saveDocs(){
  try{
    // fileData(base64)는 용량이 커서 제외하고 저장 (filePath만 저장)
    var toSave = DOCS.map(function(d){
      var copy = Object.assign({}, d);
      delete copy.fileData; // base64 제외
      return copy;
    });
    localStorage.setItem('sbt_docs', JSON.stringify(toSave));
    localStorage.setItem('sbt_docs_id', String(nextDocId));
  }catch(e){ console.error('saveDocs 오류:', e); }
}
(function loadDocs(){
  try{
    var s = localStorage.getItem('sbt_docs');
    if(!s) return;
    var arr = JSON.parse(s);
    if(!arr || !arr.length) return;
    // comments 필드 보정
    arr.forEach(function(d){ if(!d.comments) d.comments = []; });
    DOCS = arr;
    var sid = parseInt(localStorage.getItem('sbt_docs_id')||'1');
    if(sid > nextDocId) nextDocId = sid;
  }catch(e){}
})();

function switchDocsTab(tab){
  docsTab = tab;
  ['all','form','request'].forEach(function(t){
    var btn = document.getElementById('docs-tab-'+t);
    if(!btn) return;
    var active = t===tab;
    btn.style.background = active ? 'var(--orange)' : 'transparent';
    btn.style.color = active ? '#fff' : 'var(--text-mid)';
    btn.style.fontWeight = active ? '700' : '400';
  });
  renderDocs();
}

function renderDocs(){
  var el = document.getElementById('docsList'); if(!el) return;
  var q = (document.getElementById('docsSearchInput')||{}).value||'';
  var list = DOCS.filter(function(d){
    if(docsTab==='form' && d.type!=='upload') return false;
    if(docsTab==='request' && d.type!=='request') return false;
    if(q && !d.title.includes(q) && !d.content.includes(q)) return false;
    return true;
  }).slice().reverse();

  if(!list.length){
    el.innerHTML='<div style="text-align:center;padding:48px;color:var(--text-light)">'+(q?'"'+q+'" 검색 결과가 없습니다.':'등록된 자료가 없습니다.')+'</div>';
    return;
  }
  el.innerHTML = list.map(function(d){
    var canEdit = currentUser && currentUser.name===d.author;
    var canDel  = isAdmin || canEdit;
    var reqColor = d.type==='request' ? '#8B5A00' : '#1A5080';
    var reqBg    = d.type==='request' ? '#FFF0C8' : '#E8F0FB';
    var reqLabel = d.type==='request' ? '자료요청' : '서식';
    return '<div style="background:var(--white);border:1px solid var(--border);border-radius:6px;padding:14px 18px;margin-bottom:8px;cursor:pointer;transition:box-shadow .15s" onclick="openDocsDetail('+d.id+')" onmouseover="this.style.boxShadow=\'0 4px 12px rgba(0,0,0,.08)\'" onmouseout="this.style.boxShadow=\'\'">'
      +'<div style="display:flex;align-items:flex-start;gap:10px">'
      +'<span style="font-size:10px;padding:2px 7px;border-radius:2px;background:'+reqBg+';color:'+reqColor+';font-weight:700;white-space:nowrap;flex-shrink:0">'+reqLabel+'</span>'
      +'<div style="flex:1;min-width:0">'
      +'<div style="font-size:14px;font-weight:700;margin-bottom:4px">'+d.title+'</div>'
      +'<div style="font-size:12px;color:var(--text-mid);margin-bottom:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+d.content+'</div>'
      +(d.fileName?'<div style="font-size:11px;color:#3A6BC8">📎 '+d.fileName+'</div>':'')
      +'</div>'
      +'<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0" onclick="event.stopPropagation()">'
      +'<span style="font-size:11px;color:var(--text-light)">'+d.author+' · '+d.date+'</span>'
      +'<div style="display:flex;gap:4px">'
      +(canDel?'<button onclick="deleteDoc('+d.id+')" style="padding:3px 8px;font-size:11px;border:1px solid var(--border);border-radius:3px;background:transparent;color:var(--text-light);cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">삭제</button>':'')
      +(canEdit?'<button onclick="openEditDoc('+d.id+')" style="padding:3px 8px;font-size:11px;border:1px solid var(--border);border-radius:3px;background:transparent;color:var(--text-light);cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">수정</button>':'')
      +'<button onclick="toggleDocsComment('+d.id+')" style="padding:3px 8px;font-size:11px;border:1px solid var(--border);border-radius:3px;background:transparent;color:var(--text-mid);cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">💬 댓글 '+(d.comments&&d.comments.length?d.comments.length:0)+'</button>'
      +'</div>'
      +'</div>'
      +'</div>'
      +'<div id="docs-comment-'+d.id+'" style="display:none;margin-top:10px;padding-top:10px;border-top:1px solid var(--border)" onclick="event.stopPropagation()">'
      +renderDocsComments(d)
      +'</div>'
      +'</div>';
  }).join('');
}

function renderDocsComments(d){
  var html = (d.comments||[]).map(function(cm, cmtIdx){
    var repHtml = (cm.replies&&cm.replies.length)
      ? '<div style="margin-top:5px;padding:5px 10px;border-left:2px solid var(--orange);background:#FFFAF7;border-radius:0 4px 4px 0">'
          +(cm.replies||[]).map(function(r){
            return '<div style="padding:3px 0;border-bottom:1px solid #FFE8D6;font-size:11px">'
              +'<strong style="color:var(--text-mid)">↩ '+r.author+'</strong>'
              +' <span style="color:var(--text-light);font-size:10px">'+(r.date||'')+'</span>'
              +'<div style="color:var(--text);margin-top:1px">'+r.text+'</div>'
            +'</div>';
          }).join('')
        +'</div>'
      : '';
    var rbHtml = currentUser
      ? '<div id="dr-box-'+d.id+'-'+cmtIdx+'" style="display:none;margin-top:5px">'
          +'<div style="display:flex;gap:5px">'
            +'<input type="text" id="dr-inp-'+d.id+'-'+cmtIdx+'" placeholder="답글 입력..." style="flex:1;padding:5px 9px;border:1px solid var(--border);border-radius:4px;font-size:11px;font-family:\'Noto Sans KR\',sans-serif;outline:none" onkeydown="if(event.key===\'Enter\')addDocsReply('+d.id+','+cmtIdx+',false)">'
            +'<button onclick="addDocsReply('+d.id+','+cmtIdx+',false)" style="padding:5px 10px;background:var(--dark);color:#fff;border:none;border-radius:4px;font-size:11px;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">등록</button>'
          +'</div>'
        +'</div>'
      : '';
    return '<div style="padding:6px 0;border-bottom:1px solid var(--border);font-size:12px">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px">'
        +'<strong style="color:var(--text)">'+cm.author+'</strong>'
        +'<div style="display:flex;align-items:center;gap:6px">'
          +'<span style="color:var(--text-light);font-size:10px">'+cm.date+'</span>'
          +(currentUser?'<button onclick="toggleDocsReplyBox('+d.id+','+cmtIdx+',false)" style="font-size:10px;color:var(--text-light);background:none;border:none;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">↩ 답글</button>':'')
        +'</div>'
      +'</div>'
      +'<div style="color:var(--text-mid);margin-top:2px">'+cm.text+'</div>'
      +repHtml+rbHtml
    +'</div>';
  }).join('');
  html += '<div style="display:flex;gap:6px;margin-top:8px">'
    +'<input type="text" id="docs-cm-input-'+d.id+'" placeholder="댓글 입력..." style="flex:1;padding:6px 10px;border:1px solid var(--border);border-radius:4px;font-size:12px;font-family:\'Noto Sans KR\',sans-serif;outline:none">'
    +'<button onclick="submitDocsComment('+d.id+')" style="padding:6px 12px;background:var(--orange);color:#fff;border:none;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">등록</button>'
    +'</div>';
  return html;
}

function openDocsDetail(docId){
  var d = DOCS.find(function(x){ return x.id===docId; }); if(!d) return;
  var reqColor = d.type==='request' ? '#8B5A00' : '#1A5080';
  var reqBg    = d.type==='request' ? '#FFF0C8' : '#E8F0FB';
  var reqLabel = d.type==='request' ? '자료요청' : '서식';
  var canEdit  = currentUser && currentUser.name===d.author;
  var canDel   = isAdmin || canEdit;

  // 등급 체크
  var GRADE_NUM = {'기술사':1,'기능장':2,'팀장':3,'기공':4,'준기공':5,'조공':6,'신호수':7,'용역':8};
  var minGrade  = d.minGrade || '전체';
  var userGradeNum = currentUser ? (GRADE_NUM[currentUser.grade]||9) : 9;
  var minGradeNum  = GRADE_NUM[minGrade] || 999;
  var canDownload  = isAdmin || (minGrade==='전체') || (currentUser && userGradeNum <= minGradeNum);

  document.getElementById('docs-detail-title').textContent = d.title;

  // 파일 다운로드 버튼
  var fileHtml = '';
  if(d.fileName){
    if(canDownload && d.fileData){
      fileHtml = '<div style="margin-bottom:16px;padding:12px 16px;background:#E8F0FB;border-radius:6px;display:flex;align-items:center;justify-content:space-between">'
        +'<div>'
        +'<div style="font-size:13px;color:#1A5080;font-weight:600">📎 '+d.fileName+'</div>'
        +(minGrade!=='전체'?'<div style="font-size:10px;color:var(--text-light);margin-top:2px">다운로드 제한: '+minGrade+' 이상</div>':'')
        +'</div>'
        +'<button onclick="downloadDocsFile('+d.id+')" style="padding:7px 16px;background:#1A5080;color:#fff;border:none;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">⬇ 다운로드</button>'
        +'</div>';
    } else if(!canDownload){
      var g2 = GRADES[minGrade]||{};
      fileHtml = '<div style="margin-bottom:16px;padding:12px 16px;background:#F5F0FF;border:1px solid #C0A8E8;border-radius:6px;display:flex;align-items:center;justify-content:space-between">'
        +'<div>'
        +'<div style="font-size:13px;color:#7A4AAE;font-weight:600">🔒 '+d.fileName+'</div>'
        +'<div style="font-size:11px;color:#7A4AAE;margin-top:2px">'+minGrade+' 이상 등급만 다운로드 가능합니다</div>'
        +'</div>'
        +'<span style="font-size:11px;padding:3px 8px;border-radius:3px;background:'+(g2.bg||'#eee')+';color:'+(g2.color||'#333')+';font-weight:700">'+minGrade+' 이상</span>'
        +'</div>';
    } else {
      // 파일명만 있고 fileData 없음 (서버 파일)
      fileHtml = '<div style="margin-bottom:16px;padding:10px 14px;background:var(--surface);border-radius:6px;font-size:12px;color:var(--text-light)">📎 '+d.fileName+'</div>';
    }
  }

  // 댓글 HTML
  var cmtHtml = (d.comments||[]).map(function(cm, cmtIdx){
    var repHtml2 = (cm.replies&&cm.replies.length)
      ? '<div style="margin-top:6px;padding:6px 10px;border-left:2px solid var(--orange);background:#FFFAF7;border-radius:0 4px 4px 0">'
          +(cm.replies||[]).map(function(r){
            return '<div style="padding:4px 0;border-bottom:1px solid #FFE8D6">'
              +'<div style="font-size:11px;font-weight:700;color:var(--text-mid);margin-bottom:2px">↩ '+r.author+' <span style="font-weight:400;color:var(--text-light)">'+(r.date||'')+'</span></div>'
              +'<div style="font-size:12px;color:var(--text)">'+r.text+'</div>'
            +'</div>';
          }).join('')
        +'</div>'
      : '';
    var rbHtml2 = currentUser
      ? '<div id="dr-box-'+d.id+'-'+cmtIdx+'" style="display:none;margin-top:6px">'
          +'<div style="display:flex;gap:6px">'
            +'<input type="text" id="dr-inp-'+d.id+'-'+cmtIdx+'" placeholder="답글 입력..." style="flex:1;padding:6px 10px;border:1px solid var(--border);border-radius:4px;font-size:12px;font-family:\'Noto Sans KR\',sans-serif;outline:none" onkeydown="if(event.key===\'Enter\')addDocsReply('+d.id+','+cmtIdx+',true)">'
            +'<button onclick="addDocsReply('+d.id+','+cmtIdx+',true)" style="padding:6px 12px;background:var(--dark);color:#fff;border:none;border-radius:4px;font-size:12px;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">등록</button>'
          +'</div>'
        +'</div>'
      : '';
    return '<div style="padding:8px 0;border-bottom:1px solid var(--border)">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px">'
        +'<strong style="font-size:12px;color:var(--text)">'+cm.author+'</strong>'
        +'<div style="display:flex;align-items:center;gap:8px">'
          +'<span style="font-size:11px;color:var(--text-light)">'+cm.date+'</span>'
          +(currentUser?'<button onclick="toggleDocsReplyBox('+d.id+','+cmtIdx+',true)" style="font-size:11px;color:var(--text-light);background:none;border:none;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">↩ 답글</button>':'')
        +'</div>'
      +'</div>'
      +'<div style="font-size:13px;color:var(--text-mid)">'+cm.text+'</div>'
      +repHtml2+rbHtml2
    +'</div>';
  }).join('');

  document.getElementById('docs-detail-body').innerHTML =
    '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">'
      +'<span style="font-size:11px;padding:2px 8px;border-radius:3px;background:'+reqBg+';color:'+reqColor+';font-weight:700">'+reqLabel+'</span>'
      +(minGrade!=='전체'?'<span style="font-size:11px;padding:2px 8px;border-radius:3px;background:#F5F0FF;color:#7A4AAE;font-weight:600">🔒 '+minGrade+' 이상</span>':'<span style="font-size:11px;padding:2px 8px;border-radius:3px;background:#E8F5EE;color:#1A6B3A;font-weight:600">🔓 전체 공개</span>')
      +'<span style="font-size:11px;padding:2px 8px;border-radius:3px;background:var(--surface);color:var(--text-light)">'+d.author+' · '+d.date+'</span>'
    +'</div>'
    +'<div style="font-size:14px;color:var(--text);line-height:1.9;margin-bottom:16px;white-space:pre-wrap;border-bottom:1px solid var(--border);padding-bottom:16px">'+d.content+'</div>'
    +fileHtml
    +'<div style="margin-bottom:8px">'
      +'<div style="font-size:13px;font-weight:700;margin-bottom:10px">💬 댓글 '+(d.comments?d.comments.length:0)+'개</div>'
      +(cmtHtml||'<div style="font-size:12px;color:var(--text-light);text-align:center;padding:12px 0">댓글이 없습니다.</div>')
    +'</div>'
    +(currentUser?
      '<div style="display:flex;gap:6px;margin-top:10px">'
        +'<input type="text" id="docs-detail-cmt" placeholder="댓글을 입력하세요..." style="flex:1;padding:8px 12px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:\'Noto Sans KR\',sans-serif;outline:none" onkeydown="if(event.key===\'Enter\')submitDocsDetailComment('+d.id+')">'
        +'<button onclick="submitDocsDetailComment('+d.id+')" style="padding:8px 14px;background:var(--orange);color:#fff;border:none;border-radius:4px;font-size:12px;font-weight:700;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">등록</button>'
      +'</div>'
    :'<div style="margin-top:10px;font-size:12px;color:var(--text-light);text-align:center">로그인 후 댓글을 작성할 수 있습니다.</div>')
    +(canDel||canEdit?
      '<div style="display:flex;gap:6px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">'
        +(canEdit?'<button onclick="closeDocsDetail();openEditDoc('+d.id+')" style="padding:6px 14px;background:transparent;border:1px solid var(--border);border-radius:4px;font-size:12px;color:var(--text-mid);cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">수정</button>':'')
        +(canDel?'<button onclick="closeDocsDetail();deleteDoc('+d.id+')" style="padding:6px 14px;background:transparent;border:1px solid #E0A0A0;border-radius:4px;font-size:12px;color:#C04040;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">삭제</button>':'')
      +'</div>'
    :'');

  document.getElementById('docsDetailModal').style.display='flex';
}
function closeDocsDetail(){ document.getElementById('docsDetailModal').style.display='none'; }

/* ── 공무자료실 대댓글 ── */
function toggleDocsReplyBox(docId, cmtIdx, isDetail){
  var box = document.getElementById('dr-box-'+docId+'-'+cmtIdx);
  if(!box) return;
  box.style.display = box.style.display==='none' ? 'block' : 'none';
  if(box.style.display==='block'){
    var inp = document.getElementById('dr-inp-'+docId+'-'+cmtIdx);
    if(inp) inp.focus();
  }
}

function addDocsReply(docId, cmtIdx, isDetail){
  if(!currentUser){ alert('로그인이 필요합니다.'); return; }
  var inp = document.getElementById('dr-inp-'+docId+'-'+cmtIdx);
  var text = inp ? inp.value.trim() : '';
  if(!text) return;
  var d = DOCS.find(function(x){ return x.id===docId; }); if(!d) return;
  if(!d.comments || !d.comments[cmtIdx]) return;
  if(!d.comments[cmtIdx].replies) d.comments[cmtIdx].replies = [];
  d.comments[cmtIdx].replies.push({author:currentUser.name, text:text, date:new Date().toLocaleDateString('ko-KR')});
  saveDocs();
  if(isDetail){
    closeDocsDetail();
    setTimeout(function(){ openDocsDetail(docId); }, 50);
  } else {
    renderDocs();
    setTimeout(function(){
      var el = document.getElementById('docs-comment-'+docId);
      if(el) el.style.display='block';
    }, 50);
  }
}

function submitDocsDetailComment(docId){
  if(!currentUser){ alert('로그인이 필요합니다.'); return; }
  var inp = document.getElementById('docs-detail-cmt');
  var txt = inp ? inp.value.trim() : '';
  if(!txt) return;
  var d = DOCS.find(function(x){ return x.id===docId; }); if(!d) return;
  if(!d.comments) d.comments=[];
  d.comments.push({author:currentUser.name, text:txt, date:new Date().toLocaleString('ko-KR')});
  saveDocs();
  closeDocsDetail();
  setTimeout(function(){ openDocsDetail(docId); },50);
  renderDocs();
}

function downloadDocsFile(docId){
  var d = DOCS.find(function(x){ return x.id===docId; }); if(!d) return;
  var a = document.createElement('a');
  if(d.filePath){
    // 서버에 저장된 파일
    a.href = d.filePath;
    a.download = d.fileName || 'file';
    a.target = '_blank';
  } else if(d.fileData){
    // base64 (구버전 호환)
    a.href = d.fileData;
    a.download = d.fileName || 'file';
  } else {
    alert('다운로드할 파일이 없습니다.');
    return;
  }
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function toggleDocsComment(docId){
  var el = document.getElementById('docs-comment-'+docId);
  if(el) el.style.display = el.style.display==='none'?'block':'none';
}

function submitDocsComment(docId){
  if(!currentUser){ alert('로그인이 필요합니다.'); return; }
  var inp = document.getElementById('docs-cm-input-'+docId);
  var txt = inp ? inp.value.trim() : '';
  if(!txt) return;
  var d = DOCS.find(function(x){ return x.id===docId; }); if(!d) return;
  if(!d.comments) d.comments=[];
  d.comments.push({author:currentUser.name, text:txt, date:new Date().toLocaleString('ko-KR')});
  saveDocs();
  renderDocs();
  setTimeout(function(){
    var el=document.getElementById('docs-comment-'+docId);
    if(el) el.style.display='block';
  },50);
}

function openDocsWriteModal(type){
  if(!currentUser){ alert('로그인이 필요합니다.'); return; }
  docsWriteType = type;
  editingDocId = null;
  document.getElementById('docsWriteTitle').textContent = type==='request'?'✍️ 자료 요청':'📎 서식 업로드';
  document.getElementById('docs-file-area').style.display = type==='request'?'none':'block';
  document.getElementById('docs-title').value='';
  document.getElementById('docs-content').value='';
  document.getElementById('docsWriteModal').style.display='flex';
}
function closeDocsWriteModal(){ document.getElementById('docsWriteModal').style.display='none'; }

var editingDocId = null;
function openEditDoc(docId){
  var d = DOCS.find(function(x){ return x.id===docId; }); if(!d) return;
  if(!currentUser||currentUser.name!==d.author){ alert('작성자만 수정할 수 있습니다.'); return; }
  editingDocId = docId;
  docsWriteType = d.type;
  document.getElementById('docsWriteTitle').textContent = '수정';
  document.getElementById('docs-title').value = d.title;
  document.getElementById('docs-content').value = d.content;
  document.getElementById('docs-file-area').style.display = d.type==='upload'?'block':'none';
  document.getElementById('docsWriteModal').style.display='flex';
}

function deleteDoc(docId){
  if(!confirm('삭제하시겠습니까?')) return;
  DOCS = DOCS.filter(function(x){ return x.id!==docId; });
  saveDocs();
  renderDocs();
}

function submitDocs(){
  if(!currentUser){ alert('로그인이 필요합니다.'); return; }
  var title    = document.getElementById('docs-title').value.trim();
  var content  = document.getElementById('docs-content').value.trim();
  if(!title){ alert('제목을 입력해주세요.'); return; }
  var fileInput = document.getElementById('docs-file-input');
  var file      = fileInput && fileInput.files[0] ? fileInput.files[0] : null;
  var minGrade  = (document.getElementById('docs-min-grade')||{}).value || '전체';
  var fileNameEl= document.getElementById('docs-file-name');
  var manualName= fileNameEl ? fileNameEl.value.trim() : '';

  // 파일 등록 버튼 비활성화
  var submitBtn = document.querySelector('#docsWriteModal button[onclick="submitDocs()"]');
  if(submitBtn){ submitBtn.disabled=true; submitBtn.textContent='등록 중...'; }

  function doFinalize(fileName, filePath){
    if(editingDocId){
      var d = DOCS.find(function(x){ return x.id===editingDocId; });
      if(d){ d.title=title; d.content=content; d.minGrade=minGrade;
             if(fileName) d.fileName=fileName;
             if(filePath) d.filePath=filePath; }
    } else {
      DOCS.push({
        id:nextDocId++, type:docsWriteType,
        title:title, content:content,
        fileName:fileName||'', filePath:filePath||'',
        minGrade:minGrade,
        author:currentUser.name, date:new Date().toLocaleDateString('ko-KR'),
        comments:[]
      });
    }
    saveDocs();
    if(submitBtn){ submitBtn.disabled=false; submitBtn.textContent='등록'; }
    closeDocsWriteModal();
    renderDocs();
  }

  if(file){
    // 서버로 파일 업로드
    var formData = new FormData();
    formData.append('file', file);
    fetch('/upload_docs.php', { method:'POST', body:formData })
      .then(function(r){ return r.json(); })
      .then(function(res){
        if(res.ok){
          doFinalize(res.fileName, res.filePath);
        } else {
          alert('파일 업로드 실패: ' + (res.msg||'오류'));
          if(submitBtn){ submitBtn.disabled=false; submitBtn.textContent='등록'; }
        }
      })
      .catch(function(){
        // 서버 오류 시 파일명만 저장
        doFinalize(file.name, '');
      });
  } else {
    doFinalize(manualName, '');
  }
}

// 초기 홈 공지사항 렌더 (즉시실행 - body 안 script)
renderHomeNotice();
fetchRssNews();

/* ══════════════════════════════════════════════
   경험치 & 등급 시스템
══════════════════════════════════════════════ */
// 등급 순서 (낮은 번호 = 높은 등급)
var GRADE_ORDER = ['기술사','기능장','팀장','기공','준기공','조공','신호수','용역'];

// 등급별 필요 경험치 (누적)
var GRADE_EXP = {
  '용역'  : 0,
  '신호수': 50,
  '조공'  : 150,
  '준기공': 300,
  '기공'  : 500,
  '팀장'  : 800,
  '기능장': 1200,
  '기술사': 2000
};

// 경험치 지급 기준
var EXP_RULES = {
  '게시글 작성' : 15,
  '댓글 작성'   : 5,
  '질문 답변'   : 10,
  '추천 받음'   : 3,
  '일일 방문'   : 10,
  '로그인'      : 2,
};

function addExp(user, amount, reason){
  if(!user) return;
  if(!user.exp) user.exp = 0;
  if(!user.expLog) user.expLog = [];
  user.exp += amount;
  user.expLog.push({
    reason: reason,
    amount: amount,
    date: new Date().toLocaleString('ko-KR'),
    total: user.exp
  });
  // 등급 자동 승급 체크
  checkGradeUp(user);
}

function checkGradeUp(user){
  var currentIdx = GRADE_ORDER.indexOf(user.grade);
  if(currentIdx <= 0) return; // 이미 최고 등급
  var nextGrade = GRADE_ORDER[currentIdx - 1];
  var needed = GRADE_EXP[nextGrade];
  if(user.exp >= needed){
    var oldGrade = user.grade;
    user.grade = nextGrade;
    saveUserData();
    // 로그인한 유저면 UI 갱신
    if(currentUser && currentUser.id === user.id){
      currentUser.grade = nextGrade;
      activateUserMode(currentUser);
      setTimeout(function(){
        alert('🎉 등급 승급!\n\n' + oldGrade + ' → ' + nextGrade + '\n\n계속 활동해서 더 높은 등급에 도전하세요!');
      }, 300);
    }
  }
}

function getNextGradeInfo(user){
  var currentIdx = GRADE_ORDER.indexOf(user.grade || '용역');
  if(currentIdx <= 0) return {grade:'최고 등급', needed:0, progress:100};
  var nextGrade = GRADE_ORDER[currentIdx - 1];
  var curNeeded = GRADE_EXP[user.grade || '용역'];
  var nextNeeded = GRADE_EXP[nextGrade];
  var exp = user.exp || 0;
  var progress = Math.min(100, Math.round((exp - curNeeded) / (nextNeeded - curNeeded) * 100));
  return {
    grade: nextGrade,
    needed: nextNeeded - exp,
    progress: Math.max(0, progress)
  };
}

// 방문 체크 (일일 1회)
function checkDailyVisit(){
  if(!currentUser) return;
  var today = new Date().toLocaleDateString('ko-KR');
  if(currentUser.lastVisit !== today){
    currentUser.lastVisit = today;
    currentUser.visitDays = (currentUser.visitDays || 0) + 1;
    addExp(currentUser, EXP_RULES['일일 방문'], '일일 방문');
    saveUserData();
  }
}

function saveUserData(){
  if(!currentUser) return;
  try{
    var saved = JSON.parse(localStorage.getItem('st_users') || '[]');
    var idx = saved.findIndex(function(u){ return u.id === currentUser.id; });
    if(idx >= 0) saved[idx] = currentUser;
    else saved.push(currentUser);
    localStorage.setItem('st_users', JSON.stringify(saved));
    // USERS 배열도 동기화
    var ui = USERS.findIndex(function(u){ return u.id === currentUser.id; });
    if(ui >= 0) USERS[ui] = currentUser;
    // 세션의 cash도 업데이트 (F5 후 복원 시 사용)
    try{
      var sess = JSON.parse(localStorage.getItem('sbt_session')||'{}');
      if(sess.id === currentUser.id){
        sess.cash = currentUser.cash || 0;
        sess.grade = currentUser.grade;
        localStorage.setItem('sbt_session', JSON.stringify(sess));
      }
    }catch(e2){}
  }catch(e){}
}

/* ══════════════════════════════════════════════
   마이페이지
══════════════════════════════════════════════ */
function openMypage(){
  if(!currentUser){ alert('로그인이 필요합니다.'); return; }
  showPage('mypage');
}

function renderMypage(){
  if(!currentUser) return;
  var u = currentUser;
  var g = GRADES[u.grade] || GRADES['용역'];

  // 아바타 (이름 첫 글자)
  var av = document.getElementById('mypage-avatar');
  if(av){ av.textContent = (u.name||'?').charAt(0); av.style.background = g.color; }

  // 등급 뱃지
  var gb = document.getElementById('mypage-grade-badge');
  if(gb){ gb.textContent = g.num + ' ' + g.label; gb.style.background = g.bg; gb.style.color = g.color; }

  document.getElementById('mypage-name').textContent = u.name || '';
  document.getElementById('mypage-email').textContent = u.email || (u.type==='naver'?'네이버 계정':'');

  // 보유 전 잔액
  var cashBalEl = document.getElementById('mypage-cash-balance');
  if(cashBalEl) cashBalEl.textContent = (u.cash||0).toLocaleString()+'전';

  // 경험치 바
  var info = getNextGradeInfo(u);
  var expText = document.getElementById('mypage-exp-text');
  var expBar  = document.getElementById('mypage-exp-bar');
  if(expText) expText.textContent = info.grade==='최고 등급' ? '최고 등급 달성!' : info.needed+'점 남음 (→'+info.grade+')';
  if(expBar)  expBar.style.width  = info.progress + '%';

  // 통계 카드
  var stats = [
    { icon:'⭐', label:'경험치',   value: (u.exp||0) + 'pt' },
    { icon:'📝', label:'게시글',   value: (u.postCount||0) + '개' },
    { icon:'💬', label:'댓글',     value: (u.commentCount||0) + '개' },
    { icon:'📅', label:'방문일수', value: (u.visitDays||0) + '일' },
    { icon:'👍', label:'받은추천', value: (u.likeReceived||0) + '개' },
    { icon:'🏆', label:'현재등급', value: g.label },
  ];
  var statsEl = document.getElementById('mypage-stats');
  if(statsEl) statsEl.innerHTML = stats.map(function(s){
    return '<div style="background:var(--white);border:1px solid var(--border);border-radius:8px;padding:16px 12px;text-align:center">'
      +'<div style="font-size:22px;margin-bottom:6px">'+s.icon+'</div>'
      +'<div style="font-size:18px;font-weight:700;color:var(--text)">'+s.value+'</div>'
      +'<div style="font-size:11px;color:var(--text-light);margin-top:2px">'+s.label+'</div>'
      +'</div>';
  }).join('');

  switchMypageTab('posts');
}

var mypageTab = 'posts';
function switchMypageTab(tab){
  mypageTab = tab;
  ['posts','comments','exp','cash','charge'].forEach(function(t){
    var btn = document.getElementById('mp-tab-'+t);
    if(!btn) return;
    var active = t===tab;
    btn.style.background = active ? 'var(--orange)' : 'transparent';
    btn.style.color = active ? '#fff' : 'var(--text-mid)';
    btn.style.fontWeight = active ? '700' : '400';
  });

  var el = document.getElementById('mypage-tab-content');
  if(!el || !currentUser) return;
  var u = currentUser;

  if(tab==='posts'){
    var myPosts = POSTS.filter(function(p){ return p.author === u.name; }).slice().reverse();
    if(!myPosts.length){
      el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-light)">작성한 게시글이 없습니다.</div>';
      return;
    }
    el.innerHTML = myPosts.map(function(p){
      return '<div onclick="openPostDetail('+p.id+')" style="background:var(--white);border:1px solid var(--border);border-radius:6px;padding:10px 16px;margin-bottom:6px;cursor:pointer;display:flex;align-items:center;gap:10px" onmouseover="this.style.borderColor=\'var(--orange)\'" onmouseout="this.style.borderColor=\'var(--border)\'">'
        +'<span style="font-size:10px;padding:1px 6px;border-radius:2px;background:var(--tag-bg);color:var(--tag-text);flex-shrink:0">'+p.cat.replace('게시판','').trim()+'</span>'
        +'<span style="font-size:13px;font-weight:600;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+p.title+'</span>'
        +'<span style="font-size:11px;color:var(--text-light);flex-shrink:0">👁'+p.views+' 👍'+p.likes+' 💬'+p.comments.length+'</span>'
        +'<span style="font-size:11px;color:var(--text-light);flex-shrink:0">'+p.date+'</span>'
        +'</div>';
    }).join('');
  }

  else if(tab==='comments'){
    var myCmts = [];
    POSTS.forEach(function(p){
      p.comments.forEach(function(cm){
        if(cm.author===u.name) myCmts.push({postTitle:p.title, postId:p.id, text:cm.text, date:p.date});
      });
    });
    myCmts.reverse();
    if(!myCmts.length){
      el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-light)">작성한 댓글이 없습니다.</div>';
      return;
    }
    el.innerHTML = myCmts.map(function(cm){
      return '<div onclick="openPostDetail('+cm.postId+')" style="background:var(--white);border:1px solid var(--border);border-radius:6px;padding:10px 16px;margin-bottom:6px;cursor:pointer" onmouseover="this.style.borderColor=\'var(--orange)\'" onmouseout="this.style.borderColor=\'var(--border)\'">'
        +'<div style="font-size:11px;color:var(--text-light);margin-bottom:4px">📝 '+cm.postTitle+'</div>'
        +'<div style="font-size:13px;color:var(--text)">'+cm.text+'</div>'
        +'</div>';
    }).join('');
  }

  else if(tab==='exp'){
    var logs = (u.expLog || []).slice().reverse();
    var info = getNextGradeInfo(u);
    var gradeTableHtml = '<div style="background:var(--white);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:16px">'
      +'<div style="font-size:13px;font-weight:700;margin-bottom:10px">📊 등급별 필요 경험치</div>'
      +'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:6px">'
      +GRADE_ORDER.slice().reverse().map(function(gr){
        var g2=GRADES[gr]||{};
        var isCur=gr===u.grade;
        return '<div style="padding:8px 10px;border-radius:4px;border:1px solid '+(isCur?'var(--orange)':'var(--border)')+';background:'+(isCur?'#FFF3E8':'var(--surface)')+';">'
          +'<span style="font-size:10px;font-weight:700;padding:1px 5px;border-radius:2px;background:'+(g2.bg||'#eee')+';color:'+(g2.color||'#333')+'">'+g2.num+' '+gr+'</span>'
          +'<div style="font-size:11px;color:var(--text-light);margin-top:3px">'+GRADE_EXP[gr]+'pt~</div>'
          +'</div>';
      }).join('')
      +'</div></div>';
    if(!logs.length){
      el.innerHTML = gradeTableHtml + '<div style="text-align:center;padding:40px;color:var(--text-light)">활동 내역이 없습니다.</div>';
      return;
    }
    el.innerHTML = gradeTableHtml + logs.slice(0,30).map(function(log){
      return '<div style="display:flex;align-items:center;gap:10px;padding:8px 14px;background:var(--white);border:1px solid var(--border);border-radius:5px;margin-bottom:4px">'
        +'<span style="font-size:12px;flex:1;color:var(--text)">'+log.reason+'</span>'
        +'<span style="font-size:13px;font-weight:700;color:var(--orange)">+'+log.amount+'pt</span>'
        +'<span style="font-size:11px;color:var(--text-light)">'+log.date+'</span>'
        +'</div>';
    }).join('');
  }

  else if(tab==='cash'){
    var cashLogs = (u.cashLog || []);
    var balance = u.cash || 0;
    // 요약 카드
    var summaryHtml = '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:12px">'
      +'<div style="background:var(--white);border:1px solid var(--border);border-radius:8px;padding:14px;text-align:center">'
        +'<div style="font-size:11px;color:var(--text-light);margin-bottom:4px">현재 보유</div>'
        +'<div style="font-size:20px;font-weight:900;color:var(--orange)">'+balance.toLocaleString()+'전</div>'
      +'</div>'
      +'<div style="background:var(--white);border:1px solid var(--border);border-radius:8px;padding:14px;text-align:center">'
        +'<div style="font-size:11px;color:var(--text-light);margin-bottom:4px">총 충전</div>'
        +'<div style="font-size:18px;font-weight:700;color:#1A6B3A">'+cashLogs.filter(function(l){return l.amount>0;}).reduce(function(s,l){return s+l.amount;},0).toLocaleString()+'전</div>'
      +'</div>'
      +'<div style="background:var(--white);border:1px solid var(--border);border-radius:8px;padding:14px;text-align:center">'
        +'<div style="font-size:11px;color:var(--text-light);margin-bottom:4px">총 사용</div>'
        +'<div style="font-size:18px;font-weight:700;color:#C04040">'+Math.abs(cashLogs.filter(function(l){return l.amount<0;}).reduce(function(s,l){return s+l.amount;},0)).toLocaleString()+'전</div>'
      +'</div>'
    +'</div>'
    +'<div style="margin-bottom:16px"><button onclick="openChargePopupModal()" style="padding:9px 22px;background:var(--orange);color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">💰 전 충전 신청하기 →</button></div>';
    // 내역 목록
    if(!cashLogs.length){
      el.innerHTML = summaryHtml + '<div style="text-align:center;padding:32px;color:var(--text-light)">전 내역이 없습니다.</div>';
      return;
    }
    el.innerHTML = summaryHtml
      +'<div style="font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:8px">거래 내역 (최근 '+Math.min(cashLogs.length,50)+'건)</div>'
      +cashLogs.slice(0,50).map(function(log){
        var isPlus = log.amount >= 0;
        return '<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--white);border:1px solid var(--border);border-radius:6px;margin-bottom:4px">'
          +'<div style="flex:1;min-width:0">'
            +'<div style="font-size:13px;font-weight:600;color:var(--text)">'+log.reason+'</div>'
            +(log.detail?'<div style="font-size:11px;color:var(--text-light);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+log.detail+'</div>':'')
          +'</div>'
          +'<div style="text-align:right;flex-shrink:0">'
            +'<div style="font-size:14px;font-weight:900;color:'+(isPlus?'#1A6B3A':'#C04040')+'">'+(isPlus?'+':'')+log.amount.toLocaleString()+'전</div>'
            +'<div style="font-size:10px;color:var(--text-light)">'+log.date+'</div>'
          +'</div>'
          +'</div>';
      }).join('');
  }

  else if(tab==='charge'){
    renderChargeTab(el, u);
  }
}

function renderChargeTab(el, u){
  var savedRefund = {};
  try { savedRefund = JSON.parse(localStorage.getItem('sbt_refund_info')||'{}'); } catch(e){}

  el.innerHTML = ''
    // 계좌 안내
    +'<div style="background:#FFF3EE;border:2px solid var(--orange);border-radius:10px;padding:16px 20px;margin-bottom:16px">'
      +'<div style="font-size:13px;font-weight:700;color:var(--orange);margin-bottom:10px">🏦 입금 계좌 정보</div>'
      +'<div style="display:flex;flex-direction:column;gap:6px;font-size:13px">'
        +'<div><span style="font-size:11px;font-weight:700;color:var(--text-mid);min-width:54px;display:inline-block">은행</span><strong>카카오뱅크</strong></div>'
        +'<div style="display:flex;align-items:center;gap:8px"><span style="font-size:11px;font-weight:700;color:var(--text-mid);min-width:54px;display:inline-block">계좌번호</span><strong style="font-size:17px;color:var(--orange);letter-spacing:1px" id="cr-acnum">123485712</strong><button onclick="document.execCommand?document.execCommand(\'copy\'):navigator.clipboard.writeText(\'123485712\')" style="padding:2px 8px;background:var(--orange);color:#fff;border:none;border-radius:3px;font-size:11px;font-weight:700;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif" onclick="crCopyAccount()">복사</button></div>'
        +'<div><span style="font-size:11px;font-weight:700;color:var(--text-mid);min-width:54px;display:inline-block">예금주</span><strong>(주)설비트리거</strong></div>'
      +'</div>'
    +'</div>'
    // 안내
    +'<div style="background:#FFF8F0;border:1px solid #FFD9B8;border-radius:8px;padding:12px 16px;margin-bottom:16px;font-size:12px;color:var(--text-mid);line-height:1.8">'
      +'<strong style="color:var(--orange)">📌 안내</strong> 위 계좌 입금 후 아래 신청서 제출 → 확인 후 전 지급 (1전=1원, 최소 10,000전, 1,000 단위)'
    +'</div>'
    // 알림
    +'<div id="cr-alert" style="display:none;padding:10px 14px;border-radius:6px;font-size:13px;margin-bottom:12px"></div>'
    // 폼
    +'<div style="display:flex;flex-direction:column;gap:12px">'
      // 금액
      +'<div>'
        +'<label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:6px">충전 금액 (전) <span style="color:var(--orange)">*</span></label>'
        +'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">'
          +[10000,30000,50000,100000,200000].map(function(v){ return '<button onclick="document.getElementById(\'cr-amount\').value='+v+'" style="padding:5px 12px;background:var(--surface);border:1.5px solid var(--border);border-radius:20px;font-size:12px;font-weight:600;color:var(--text-mid);cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">'+v.toLocaleString()+'전</button>'; }).join('')
        +'</div>'
        +'<input type="number" id="cr-amount" placeholder="직접 입력" min="10000" max="1000000" step="1000" style="width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:6px;font-size:13px;font-family:\'Noto Sans KR\',sans-serif;outline:none;box-sizing:border-box">'
      +'</div>'
      // 입금자명
      +'<div>'
        +'<label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:6px">입금자명 <span style="color:var(--orange)">*</span></label>'
        +'<input type="text" id="cr-depositor" placeholder="실제 입금하신 분 성함" maxlength="20" style="width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:6px;font-size:13px;font-family:\'Noto Sans KR\',sans-serif;outline:none;box-sizing:border-box">'
      +'</div>'
      // 환불계좌
      +'<div style="background:#F0F8FF;border:1.5px solid #A8D4F0;border-radius:8px;padding:14px 16px">'
        +'<div style="font-size:12px;font-weight:700;color:#1A5A8A;margin-bottom:4px">🔄 환불받을 계좌 <span style="color:var(--orange)">*</span></div>'
        +'<div style="font-size:11px;color:var(--text-mid);margin-bottom:10px">미입금·거절 시 환불 계좌. 저장되어 다음에 자동 입력됩니다.</div>'
        +'<div style="display:grid;grid-template-columns:1fr 1.6fr 1fr;gap:8px">'
          +'<div><label style="font-size:11px;font-weight:700;color:var(--text-mid);display:block;margin-bottom:4px">은행명</label><input type="text" id="cr-rbank" value="'+(savedRefund.bank||'')+'" placeholder="카카오뱅크" maxlength="20" style="width:100%;padding:8px 10px;border:1.5px solid var(--border);border-radius:5px;font-size:12px;font-family:\'Noto Sans KR\',sans-serif;outline:none;box-sizing:border-box"></div>'
          +'<div><label style="font-size:11px;font-weight:700;color:var(--text-mid);display:block;margin-bottom:4px">계좌번호</label><input type="text" id="cr-raccount" value="'+(savedRefund.account||'')+'" placeholder="숫자만" maxlength="30" style="width:100%;padding:8px 10px;border:1.5px solid var(--border);border-radius:5px;font-size:12px;font-family:\'Noto Sans KR\',sans-serif;outline:none;box-sizing:border-box"></div>'
          +'<div><label style="font-size:11px;font-weight:700;color:var(--text-mid);display:block;margin-bottom:4px">예금주</label><input type="text" id="cr-rholder" value="'+(savedRefund.holder||'')+'" placeholder="실명" maxlength="20" style="width:100%;padding:8px 10px;border:1.5px solid var(--border);border-radius:5px;font-size:12px;font-family:\'Noto Sans KR\',sans-serif;outline:none;box-sizing:border-box"></div>'
        +'</div>'
      +'</div>'
      // 메모
      +'<div>'
        +'<label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:6px">메모 <span style="font-weight:400;color:var(--text-light)">(선택)</span></label>'
        +'<input type="text" id="cr-memo" placeholder="특이사항" maxlength="100" style="width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:6px;font-size:13px;font-family:\'Noto Sans KR\',sans-serif;outline:none;box-sizing:border-box">'
      +'</div>'
      +'<button onclick="submitChargeRequest()" id="cr-submit-btn" style="padding:13px;background:var(--orange);color:#fff;border:none;border-radius:6px;font-size:15px;font-weight:700;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif;width:100%">충전 신청하기</button>'
    +'</div>'
    // 신청내역
    +'<div style="margin-top:20px">'
      +'<div style="font-size:13px;font-weight:700;color:var(--text-mid);margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--border)">내 신청 내역</div>'
      +'<div id="cr-req-list"><div style="text-align:center;padding:24px;color:var(--text-light)">로딩 중...</div></div>'
    +'</div>';

  loadChargeRequests();
}

function showCrAlert(msg, ok){
  var el = document.getElementById('cr-alert');
  if(!el) return;
  el.style.display = 'block';
  el.style.background = ok ? '#ECFDF5' : '#FEF2F2';
  el.style.color      = ok ? '#059669' : '#DC2626';
  el.style.border     = '1px solid ' + (ok ? '#A7F3D0' : '#FECACA');
  el.textContent = msg;
  if(ok) setTimeout(function(){ el.style.display='none'; }, 4000);
}

function submitChargeRequest(){
  if(!currentUser || !currentUser.id){ showCrAlert('로그인이 필요합니다.', false); return; }
  var amount        = parseInt(document.getElementById('cr-amount').value)||0;
  var depositor     = (document.getElementById('cr-depositor').value||'').trim();
  var memo          = (document.getElementById('cr-memo').value||'').trim();
  var refundBank    = (document.getElementById('cr-rbank').value||'').trim();
  var refundAccount = (document.getElementById('cr-raccount').value||'').trim();
  var refundHolder  = (document.getElementById('cr-rholder').value||'').trim();

  if(amount < 10000 || amount > 1000000 || amount % 1000 !== 0){
    showCrAlert('금액은 10,000전 이상, 1,000 단위로 입력해주세요.', false); return;
  }
  if(!depositor){ showCrAlert('입금자명을 입력해주세요.', false); return; }
  if(!refundBank || !refundAccount || !refundHolder){
    showCrAlert('환불받을 계좌 정보(은행명·계좌번호·예금주)를 모두 입력해주세요.', false); return;
  }

  var btn = document.getElementById('cr-submit-btn');
  if(btn){ btn.disabled=true; btn.textContent='신청 중...'; }

  fetch('/api/cash.php?action=request_charge&uid='+encodeURIComponent(currentUser.id), {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      amount: amount, depositor: depositor, memo: memo,
      refund_bank: refundBank, refund_account: refundAccount, refund_holder: refundHolder
    })
  })
  .then(function(r){ return r.json(); })
  .then(function(res){
    if(btn){ btn.disabled=false; btn.textContent='충전 신청하기'; }
    if(res.ok){
      showCrAlert(res.msg || '신청 완료!', true);
      try { localStorage.setItem('sbt_refund_info', JSON.stringify({bank:refundBank,account:refundAccount,holder:refundHolder})); } catch(e){}
      document.getElementById('cr-amount').value = '';
      document.getElementById('cr-depositor').value = '';
      loadChargeRequests();
    } else {
      showCrAlert(res.msg || '오류가 발생했습니다.', false);
    }
  })
  .catch(function(){
    if(btn){ btn.disabled=false; btn.textContent='충전 신청하기'; }
    showCrAlert('네트워크 오류가 발생했습니다.', false);
  });
}

function loadChargeRequests(){
  if(!currentUser || !currentUser.id) return;
  fetch('/api/cash.php?action=get_charge_requests&uid='+encodeURIComponent(currentUser.id))
  .then(function(r){ return r.json(); })
  .then(function(res){
    var el = document.getElementById('cr-req-list');
    if(!el) return;
    if(!res.ok || !res.list || !res.list.length){
      el.innerHTML='<div style="text-align:center;padding:20px;color:var(--text-light);font-size:13px">신청 내역이 없습니다.</div>';
      return;
    }
    var statusMap={pending:'<span style="padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;background:#FFF8E1;color:#F59E0B">검토중</span>',approved:'<span style="padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;background:#ECFDF5;color:#059669">승인</span>',rejected:'<span style="padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;background:#FEF2F2;color:#DC2626">거절</span>'};
    el.innerHTML='<table style="width:100%;border-collapse:collapse;font-size:12px">'
      +'<thead><tr style="background:var(--surface)">'
      +'<th style="padding:8px 10px;text-align:left;border-bottom:2px solid var(--border);color:var(--text-mid)">신청일</th>'
      +'<th style="padding:8px 10px;text-align:left;border-bottom:2px solid var(--border);color:var(--text-mid)">금액</th>'
      +'<th style="padding:8px 10px;text-align:left;border-bottom:2px solid var(--border);color:var(--text-mid)">입금자</th>'
      +'<th style="padding:8px 10px;text-align:left;border-bottom:2px solid var(--border);color:var(--text-mid)">상태</th>'
      +'</tr></thead><tbody>'
      +res.list.map(function(r){
        return '<tr style="border-bottom:1px solid var(--border-light)">'
          +'<td style="padding:9px 10px;color:var(--text-light)">'+String(r.created_at||'').slice(0,16)+'</td>'
          +'<td style="padding:9px 10px;font-weight:700;color:var(--orange)">'+Number(r.amount).toLocaleString()+'전</td>'
          +'<td style="padding:9px 10px">'+r.depositor_name+'</td>'
          +'<td style="padding:9px 10px">'+(statusMap[r.status]||r.status)+'</td>'
          +'</tr>';
      }).join('')
      +'</tbody></table>';
  }).catch(function(){});
}

/* ── 전 충전 신청 팝업 모달 ── */
function openChargePopupModal(){
  if(!currentUser || !currentUser.id){ alert('로그인이 필요합니다.'); return; }
  var modal = document.getElementById('chargePopupModal');
  if(!modal) return;

  // 모달 내용 생성
  modal.innerHTML = ''
    +'<div style="background:var(--white);border-radius:10px;width:min(680px,96vw);max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.4)">'
      +'<div style="background:var(--orange);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-radius:10px 10px 0 0;position:sticky;top:0;z-index:1">'
        +'<h3 style="font-size:15px;font-weight:800;color:#fff;margin:0">💰 전 충전 신청</h3>'
        +'<button onclick="closeChargePopupModal()" style="background:rgba(255,255,255,.2);border:none;color:#fff;font-size:18px;width:30px;height:30px;border-radius:50%;cursor:pointer;line-height:1">✕</button>'
      +'</div>'
      +'<div style="padding:20px 24px" id="chargePopupBody"></div>'
    +'</div>';

  // 모달 표시 및 초기화
  if(!modal.style.position){
    modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:3000;display:flex;align-items:center;justify-content:center';
    modal.addEventListener('click', function(e){ if(e.target===this) closeChargePopupModal(); });
  } else {
    modal.style.display='flex';
  }

  renderChargeTab(document.getElementById('chargePopupBody'), currentUser);
}

function closeChargePopupModal(){
  var modal = document.getElementById('chargePopupModal');
  if(modal) modal.style.display='none';
}

/* ── 닉네임 변경 ── */
var NICK_CHANGE_COST = 10000;

function openEditNickModal(){
  var inp = document.getElementById('newNickInput');
  if(inp && currentUser) inp.value = currentUser.name;
  document.getElementById('nickChangeMsg').style.display='none';
  // 현재 보유 전 표시 (DB에서 최신 조회)
  var cashEl = document.getElementById('nickModalCash');
  if(cashEl){
    var uid = null;
    try { var s=JSON.parse(localStorage.getItem('sbt_session')||'{}'); uid=s.id||s.db_id; } catch(e){}
    if(uid){
      fetch('/api/user.php?action=info&uid='+encodeURIComponent(uid))
        .then(function(r){ return r.json(); })
        .then(function(res){
          if(res.ok && res.user){
            var bal = Number(res.user.cash||0);
            cashEl.textContent = bal.toLocaleString();
            // 로컬도 동기화
            if(currentUser) currentUser.cash = bal;
          }
        }).catch(function(){
          cashEl.textContent = ((currentUser&&currentUser.cash)||0).toLocaleString();
        });
    } else {
      cashEl.textContent = ((currentUser&&currentUser.cash)||0).toLocaleString();
    }
  }
  document.getElementById('editNickModal').style.display='flex';
}
function closeEditNickModal(){ document.getElementById('editNickModal').style.display='none'; }

function submitNickChange(){
  var newNick = (document.getElementById('newNickInput').value||'').trim();
  var msg = document.getElementById('nickChangeMsg');
  msg.style.display='none';
  if(!newNick||newNick.length<2){
    msg.textContent='2자 이상 입력해주세요.'; msg.style.color='#C04040'; msg.style.display='block'; return;
  }
  if(newNick === currentUser.name){
    msg.textContent='현재 닉네임과 동일합니다.'; msg.style.color='#C04040'; msg.style.display='block'; return;
  }
  var cash = currentUser.cash||0;
  if(cash < NICK_CHANGE_COST){
    msg.textContent='전이 부족합니다. (보유: '+cash.toLocaleString()+'전 / 필요: '+NICK_CHANGE_COST.toLocaleString()+'전)';
    msg.style.color='#C04040'; msg.style.display='block'; return;
  }
  if(!confirm('닉네임을 "'+newNick+'"으로 변경하시겠습니까?\n10,000전이 차감됩니다.')) return;

  var sess = {};
  try { sess = JSON.parse(localStorage.getItem('sbt_session')||'{}'); } catch(e){}
  var utype = sess.utype || currentUser.type || '';
  var dbId  = (utype === 'email') ? (sess.db_id || 0) : 0;

  // ── 이메일 회원: DB API로 원자적 처리 ──
  if(utype === 'email' && dbId){
    fetch('/api/cash.php?action=nick_change&uid='+encodeURIComponent(dbId), {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({new_name: newNick, cost: NICK_CHANGE_COST})
    })
    .then(function(r){ return r.json(); })
    .then(function(res){
      if(!res.ok){
        msg.textContent = res.msg || '변경 실패. 전이 부족하거나 오류가 발생했습니다.';
        msg.style.color='#C04040'; msg.style.display='block'; return;
      }
      _applyNickChange(newNick, res.new_cash, sess);
    })
    .catch(function(){
      msg.textContent='서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      msg.style.color='#C04040'; msg.style.display='block';
    });
    return;
  }

  // ── 네이버 회원: localStorage 전용 처리 ──
  var newCash = Math.max(0, cash - NICK_CHANGE_COST);
  currentUser.cash = newCash;
  addCashLog(currentUser, -NICK_CHANGE_COST, '닉네임 변경', newNick);
  _applyNickChange(newNick, newCash, sess);
}

function _applyNickChange(newNick, newCash, sess){
  currentUser.name = newNick;
  if(newCash !== undefined) currentUser.cash = newCash;
  saveUserData();
  activateUserMode(currentUser);
  try {
    sess.name = newNick;
    if(newCash !== undefined) sess.cash = newCash;
    localStorage.setItem('sbt_session', JSON.stringify(sess));
  } catch(e){}
  closeEditNickModal();
  renderMypage();
  alert('닉네임이 "'+newNick+'"으로 변경됐습니다! (10,000전 차감)');
}

/* ── 비밀번호 변경 ── */
function openEditPwModal(){
  ['curPwInput','newPwInput','newPw2Input'].forEach(function(id){ document.getElementById(id).value=''; });
  document.getElementById('pwChangeMsg').style.display='none';
  document.getElementById('editPwModal').style.display='flex';
}
function closeEditPwModal(){ document.getElementById('editPwModal').style.display='none'; }
function submitPwChange(){
  if(!currentUser){ return; }
  var curPw  = document.getElementById('curPwInput').value;
  var newPw  = document.getElementById('newPwInput').value;
  var newPw2 = document.getElementById('newPw2Input').value;
  var msg = document.getElementById('pwChangeMsg');
  msg.style.display='none';
  if(currentUser.type==='naver'){ msg.textContent='네이버 계정은 비밀번호를 변경할 수 없습니다.'; msg.style.color='#C04040'; msg.style.display='block'; return; }
  if(curPw !== currentUser.pw){ msg.textContent='현재 비밀번호가 올바르지 않습니다.'; msg.style.color='#C04040'; msg.style.display='block'; return; }
  if(newPw.length<8||!/[a-zA-Z]/.test(newPw)||!/[0-9]/.test(newPw)){ msg.textContent='비밀번호는 8자 이상, 영문+숫자 포함이어야 합니다.'; msg.style.color='#C04040'; msg.style.display='block'; return; }
  if(newPw!==newPw2){ msg.textContent='새 비밀번호가 일치하지 않습니다.'; msg.style.color='#C04040'; msg.style.display='block'; return; }
  currentUser.pw = newPw;
  saveUserData();
  closeEditPwModal();
  alert('비밀번호가 변경됐습니다!');
}

/* ══════════════════════════════════════════════
   🔧 도움요청 시스템
══════════════════════════════════════════════ */

/* ══════════════════════════════════════════════
   공무자료실 HTML 초기화
══════════════════════════════════════════════ */
function initDocsHTML(){
  document.getElementById('page-docs').innerHTML = `
  <div style="max-width:960px;margin:0 auto;padding:32px 40px">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:24px">
      <div>
        <h2 style="font-size:24px;font-weight:700;margin-bottom:6px">공무자료실</h2>
        <p style="font-size:14px;color:var(--text-mid)">각종 서식, 공문, 현장 문서를 공유하는 공간입니다.</p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button onclick="openDocsWriteModal('upload')" style="padding:8px 16px;background:var(--orange);color:#fff;border:none;border-radius:4px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">📎 서식 업로드</button>
        <button onclick="openDocsWriteModal('request')" style="padding:8px 16px;background:var(--dark);color:#C8C6C0;border:none;border-radius:4px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">✍️ 자료 요청</button>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:4px;margin-bottom:16px;border-bottom:2px solid var(--border);padding-bottom:0">
      <button id="docs-tab-all" onclick="switchDocsTab('all')" style="padding:9px 16px;background:var(--orange);color:#fff;border:none;border-radius:4px 4px 0 0;font-size:13px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif;margin-bottom:-2px">전체</button>
      <button id="docs-tab-form" onclick="switchDocsTab('form')" style="padding:9px 16px;background:transparent;color:var(--text-mid);border:1px solid var(--border);border-bottom:none;border-radius:4px 4px 0 0;font-size:13px;cursor:pointer;font-family:'Noto Sans KR',sans-serif;margin-bottom:-2px">서식</button>
      <button id="docs-tab-request" onclick="switchDocsTab('request')" style="padding:9px 16px;background:transparent;color:var(--text-mid);border:1px solid var(--border);border-bottom:none;border-radius:4px 4px 0 0;font-size:13px;cursor:pointer;font-family:'Noto Sans KR',sans-serif;margin-bottom:-2px">자료요청</button>
      <div style="margin-left:auto;padding-bottom:4px">
        <input type="text" id="docsSearchInput" placeholder="🔍 제목·내용 검색..." oninput="renderDocs()"
          style="padding:7px 12px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;min-width:180px">
      </div>
    </div>
    <div id="docsList"></div>
  </div>
`;
  document.getElementById('docsWriteModal').innerHTML = `
  <div style="background:var(--white);border-radius:8px;width:580px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3)">
    <div style="background:var(--dark);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-radius:8px 8px 0 0;position:sticky;top:0;z-index:1">
      <h3 id="docsWriteTitle" style="font-size:15px;font-weight:700;color:#fff">📎 서식 업로드</h3>
      <button onclick="closeDocsWriteModal()" style="background:none;border:none;color:#888;cursor:pointer;font-size:18px">✕</button>
    </div>
    <div style="padding:20px 24px;display:flex;flex-direction:column;gap:12px">
      <div>
        <label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:5px">제목 <span style="color:var(--orange)">*</span></label>
        <input type="text" id="docs-title" placeholder="제목을 입력하세요"
          style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;box-sizing:border-box">
      </div>
      <div>
        <label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:5px">내용</label>
        <textarea id="docs-content" rows="5" placeholder="내용을 입력하세요"
          style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none;resize:vertical;box-sizing:border-box"></textarea>
      </div>
      <div id="docs-file-area">
        <label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:5px">파일 첨부 <span style="font-size:11px;font-weight:400;color:var(--text-light)">(이미지·PDF·문서·엑셀·한글)</span></label>
        <div id="docs-drop-zone"
          ondragover="event.preventDefault();this.style.borderColor='var(--orange)';this.style.background='#FFF3E8'"
          ondragleave="this.style.borderColor='var(--border)';this.style.background=''"
          ondrop="docsFileDrop(event)"
          onclick="document.getElementById('docs-file-input').click()"
          style="border:2px dashed var(--border);border-radius:6px;padding:20px;text-align:center;cursor:pointer;transition:all .2s">
          <div id="docs-drop-hint" style="color:var(--text-light);font-size:13px">
            <div style="font-size:24px;margin-bottom:6px">📂</div>
            <div>파일을 드래그하거나 <strong style="color:var(--orange)">클릭</strong>하여 선택</div>
            <div style="font-size:11px;margin-top:4px">PDF, 엑셀, 한글, 이미지 등 모든 파일</div>
          </div>
          <div id="docs-file-selected" style="display:none;color:var(--text);font-size:13px">
            <div style="font-size:20px;margin-bottom:4px">📎</div>
            <div id="docs-file-selected-name" style="font-weight:700"></div>
            <div id="docs-file-selected-size" style="font-size:11px;color:var(--text-light);margin-top:2px"></div>
          </div>
        </div>
        <input type="file" id="docs-file-input" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.hwp,.ppt,.pptx,.txt,.zip"
          style="display:none" onchange="docsFileSelected(this)">
        <input type="hidden" id="docs-file-name">
      </div>
      <div id="docs-grade-area">
        <label style="display:block;font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:5px">다운로드 최소 등급 <span style="font-size:10px;font-weight:400;color:var(--text-light)">(이 등급 이상만 다운로드 가능)</span></label>
        <select id="docs-min-grade" style="width:100%;padding:8px 10px;border:1px solid var(--border);border-radius:4px;font-size:13px;font-family:'Noto Sans KR',sans-serif;outline:none">
          <option value="전체">전체 (누구나)</option>
          <option value="용역">용역 이상 (Lv.8+)</option>
          <option value="조공">조공 이상 (Lv.6+)</option>
          <option value="기공">기공 이상 (Lv.4+)</option>
          <option value="팀장">팀장 이상 (Lv.3+)</option>
          <option value="기술사">기술사만 (Lv.1)</option>
        </select>
      </div>
    </div>
    <div style="padding:12px 20px;border-top:1px solid var(--border);display:flex;gap:8px;justify-content:flex-end;background:#FAFAF8;border-radius:0 0 8px 8px">
      <button onclick="closeDocsWriteModal()" style="padding:9px 16px;background:transparent;border:1px solid var(--border);border-radius:4px;font-size:13px;color:var(--text-mid);cursor:pointer;font-family:'Noto Sans KR',sans-serif">취소</button>
      <button onclick="submitDocs()" style="padding:9px 20px;background:var(--orange);color:#fff;border:none;border-radius:4px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Noto Sans KR',sans-serif">등록</button>
    </div>
  </div>
`;
  document.getElementById('docsDetailModal').innerHTML = `
  <div style="background:var(--white);border-radius:8px;width:640px;max-height:88vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3)">
    <div style="background:var(--dark);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-radius:8px 8px 0 0;position:sticky;top:0;z-index:1">
      <h3 id="docs-detail-title" style="font-size:15px;font-weight:700;color:#fff;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-right:10px"></h3>
      <button onclick="closeDocsDetail()" style="background:none;border:none;color:#888;cursor:pointer;font-size:18px;flex-shrink:0">✕</button>
    </div>
    <div id="docs-detail-body" style="padding:20px 24px"></div>
  </div>
`;
  // 글쓰기 모달: 외부 클릭으로 닫히지 않음
  var dwm = document.getElementById('docsWriteModal');
  if(dwm) dwm.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:3000;display:none;align-items:center;justify-content:center';
  // 상세보기 모달: 외부 클릭으로 닫힘
  var ddm = document.getElementById('docsDetailModal');
  if(ddm){ ddm.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:3000;display:none;align-items:center;justify-content:center';
           ddm.addEventListener('click',function(e){ if(e.target===this) this.style.display='none'; }); }
}
document.addEventListener('DOMContentLoaded', initDocsHTML);