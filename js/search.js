/* ─── 자재 DB ─── */
const DB = [
  {cat:"배관",sub:"강관류",name:"백관",aliases:["아연도강관","도금강관","백색강관","GI파이프"],tags:["설비","KS D 3507"],desc:"아연도금 강관. 급수·급탕·소화 배관에 사용.",badge:"badge-pipe",specs:["15A","20A","25A","32A","40A","50A","65A","80A","100A","125A","150A"],unitConv:{from:'m',to:'본',rate:6}},
  {cat:"배관",sub:"강관류",name:"흑관",aliases:["흑색강관","탄소강관","SPP","블랙파이프"],tags:["설비","KS D 3507"],desc:"아연도금 없는 강관. 소화·공조·증기배관에 사용.",badge:"badge-steel",specs:["15A","20A","25A","32A","40A","50A","65A","80A","100A"],unitConv:{from:'m',to:'본',rate:6}},
  {cat:"배관",sub:"강관류",name:"배관용스테인리스강관",aliases:["STS관","STS파이프","스텐관","304관","316관"],tags:["설비","KS D 3576"],desc:"내식성 우수한 스테인리스 강관. 급수·급탕·식품 배관.",badge:"badge-steel",specs:["15A","20A","25A","32A","40A","50A","65A","80A","100A"],unitConv:{from:'m',to:'본',rate:6}},
  {cat:"배관",sub:"합성수지관",name:"PVC관",aliases:["경질염화비닐관","경질PVC","VG파이프","딱딱PVC"],tags:["설비","KS M 3401"],desc:"냉수·배수 배관용. 저렴하고 가벼워 가장 범용적.",badge:"badge-pipe",specs:["20A","25A","32A","40A","50A","65A","80A","100A","125A","150A","200A"],unitConv:{from:'m',to:'본',rate:4}},
  {cat:"배관",sub:"합성수지관",name:"XL관",aliases:["가교폴리에틸렌관","엑셀관","PEX관","XL파이프"],tags:["설비","난방"],desc:"난방·온수 배관. 내열·내압 우수. 바닥난방 코일로 사용.",badge:"badge-pipe",specs:["10A","13A","16A","20A","25A","32A"],unitConv:{from:'m',to:'롤',rate:100}},
  {cat:"배관",sub:"동관류",name:"동관",aliases:["구리관","copper pipe","동파이프","냉매관"],tags:["설비","냉매"],desc:"내열·내식성 우수. 온수·냉매 배관.",badge:"badge-pipe",specs:["6.35mm","9.52mm","12.7mm","15.88mm","19.05mm","22.22mm","25.4mm"],unitConv:{from:'m',to:'본',rate:6}},
  {cat:"배관",sub:"관부속",name:"엘보",aliases:["elbow","곡관","90도엘보","45도엘보","LL"],tags:["배관부속"],desc:"배관 방향을 90° 또는 45° 전환하는 부속.",badge:"badge-steel",specs:["15A","20A","25A","32A","40A","50A","65A","80A","100A"]},
  {cat:"배관",sub:"관부속",name:"신축이음",aliases:["익스팬션조인트","EJ","expansion joint","벨로즈","슬리브형"],tags:["설비","배관부속"],desc:"배관 온도 변화에 의한 열팽창·수축을 흡수하는 이음재. 고온 배관(증기·급탕)에 필수 설치.",badge:"badge-pipe",specs:["15A","20A","25A","32A","40A","50A","65A","80A","100A"]},
  {cat:"밸브",sub:"개폐밸브",name:"게이트밸브",aliases:["gate valve","슬루스밸브","슬루이스","게이트"],tags:["밸브","개폐"],desc:"완전 개폐용 밸브. 부분 개방 금지.",badge:"badge-steel",specs:["15A","20A","25A","32A","40A","50A","65A","80A","100A","125A","150A"]},
  {cat:"밸브",sub:"개폐밸브",name:"볼밸브",aliases:["ball valve","볼코크","구형밸브"],tags:["밸브","개폐"],desc:"90° 회전으로 개폐. 조작 간단하고 기밀성 우수.",badge:"badge-steel",specs:["D15","D20","D25","D32","D40","D50","D65","D80","D100"]},
  {cat:"밸브",sub:"개폐밸브",name:"버터플라이밸브",aliases:["butterfly valve","나비밸브","BFV","디스크밸브"],tags:["밸브","대구경"],desc:"대구경 개폐용. 경량 박형 구조.",badge:"badge-steel",specs:["50A","65A","80A","100A","125A","150A","200A","250A","300A"]},
  {cat:"밸브",sub:"체크밸브",name:"스윙체크밸브",aliases:["swing check valve","역류방지밸브","체크","swing check"],tags:["밸브","역류방지"],desc:"역류 방지용. 수평 배관에 설치.",badge:"badge-steel",specs:["15A","20A","25A","32A","40A","50A","65A","80A","100A"]},
  {cat:"밸브",sub:"체크밸브",name:"스모렌스키체크",aliases:["스모렌스키","스모체크","스모"],tags:["밸브","워터해머방지"],desc:"워터해머 방지 기능. 펌프 토출측에 사용.",badge:"badge-steel",specs:["40A","50A","65A","80A","100A","125A","150A","200A"]},
  {cat:"밸브",sub:"조절밸브",name:"감압밸브",aliases:["pressure reducing valve","PRV","감압기","레귤레이터"],tags:["밸브","조절"],desc:"상류 고압을 하류 설정 저압으로 자동 조절.",badge:"badge-steel",specs:["15A","20A","25A","32A","40A","50A","65A","80A","100A"]},
  {cat:"덕트",sub:"덕트본체",name:"사각덕트",aliases:["rectangular duct","각형덕트","스틸덕트","아연도덕트","강판덕트"],tags:["공조","환기"],desc:"공조·환기 주덕트. 아연도강판으로 제작.",badge:"badge-mech",specs:["150×150","200×150","200×200","250×200","300×250","400×300","500×400","600×500"]},
  {cat:"덕트",sub:"덕트본체",name:"스파이럴덕트",aliases:["spiral duct","원형덕트","나선덕트","환형덕트"],tags:["공조","환기"],desc:"원형 코일형 덕트. 기밀성 우수.",badge:"badge-mech",specs:["Φ100","Φ125","Φ150","Φ200","Φ250","Φ300","Φ350","Φ400","Φ500"]},
  {cat:"덕트",sub:"덕트본체",name:"플렉시블덕트",aliases:["flexible duct","플렉덕트","주름덕트","후렉시블","알루미늄플렉"],tags:["공조","말단연결"],desc:"말단 연결용 유연 덕트. 진동 흡수.",badge:"badge-mech",specs:["Φ100","Φ125","Φ150","Φ200","Φ250","Φ300"]},
  {cat:"보온재",sub:"유기보온재",name:"발포폴리에틸렌보온재",aliases:["PE보온재","발포PE","폼보온재","PE폼"],tags:["보온","결로방지"],desc:"배관·덕트 결로방지·보온. 가장 범용적.",badge:"badge-insul",specs:["T10","T15","T20","T25","T30","T40","T50"]},
  {cat:"보온재",sub:"무기보온재",name:"그라스울보온재",aliases:["유리면보온재","GW보온재","유리솜","유리섬유","fiberglass"],tags:["보온","불연"],desc:"불연성·흡음성 우수. 고온 배관·덕트 보온.",badge:"badge-insul",specs:["T25","T50","T75","T100"]},
  {cat:"소방",sub:"스프링클러",name:"스프링클러헤드",aliases:["SPK헤드","헤드","sprinkler head","하향형헤드","상향형헤드"],tags:["소방","스프링클러"],desc:"화재 시 열 감지 자동 방수.",badge:"badge-fire",specs:["K80 하향형","K80 상향형","K115 하향형","K115 상향형","K160 하향형"]},
  {cat:"소방",sub:"소화전",name:"옥내소화전함",aliases:["소화전함","소화전","옥내소화전"],tags:["소방","소화전"],desc:"건물 내부 소화전 수납함. 법정 설치 의무.",badge:"badge-fire",specs:["단구형 소형","단구형 중형","쌍구형","옥외형"]},
  {cat:"펌프",sub:"공조기기",name:"에어핸들러",aliases:["AHU","공기조화기","공조기","air handling unit"],tags:["공조","기계"],desc:"냉난방·환기 일체 공기 조화 장치.",badge:"badge-mech",specs:["1000CMH","2000CMH","3000CMH","5000CMH","8000CMH","10000CMH"]},
  {cat:"펌프",sub:"공조기기",name:"팬코일유닛",aliases:["FCU","fan coil unit","팬코일","FAN COIL"],tags:["공조","실내기"],desc:"각 실 개별 냉난방용 팬코일 유닛.",badge:"badge-mech",specs:["2RT","3RT","4RT","5RT","6RT","8RT"]},
  {cat:"펌프",sub:"펌프",name:"순환펌프",aliases:["circulation pump","시르큐레이터","온수순환","공조순환"],tags:["기계","난방"],desc:"난방·공조 온수 순환 펌프.",badge:"badge-mech",specs:["25A","32A","40A","50A","65A","80A"]},
  {cat:"계측",sub:"압력",name:"압력계",aliases:["pressure gauge","게이지","마노미터","psi계"],tags:["계측","압력"],desc:"배관 내 압력 측정 계기.",badge:"badge-mech",specs:["0~1MPa","0~1.6MPa","0~2.5MPa","0~4MPa","0~10MPa"]},
];

const catLabel={배관:"배관 / 관부속",밸브:"밸브류",덕트:"덕트류",보온재:"보온재",위생도기:"위생도기",소방:"소방설비",펌프:"펌프 / 기계",계측:"계측기기"};

function getBadgeLabel(cat){return catLabel[cat]||cat}

/* ─── 규격 테이블 (가로 일렬 + 단위 선택) ─── */
function renderSpecTable(d, cardId){
  if(!d.specs||!d.specs.length) return '';
  const unitConv = d.unitConv || null;
  const unitOptions = unitConv
    ? [{label: unitConv.from, value: unitConv.from},
       {label: `${unitConv.to} (${unitConv.rate}${unitConv.from})`, value: unitConv.to},
       {label:'직접입력', value:'custom'}]
    : [{label:'개', value:'개'}, {label:'EA', value:'EA'}, {label:'직접입력', value:'custom'}];
  const defaultUnit = unitOptions[0].value;

  const unitBtns = unitOptions.map((u,ui)=>
    `<button class="unit-btn${ui===0?' active':''}" onclick="selectUnit('${cardId}','${u.value}',this)">${u.label}</button>`
  ).join('');

  const cols = d.specs.map((s,i)=>`
    <div class="spec-col">
      <div class="spec-col-size">${s}</div>
      <div class="spec-col-qty"><input class="spec-qty" type="number" min="0" placeholder="0"
        id="qty-${cardId}-${i}" onchange="updateTotal('${cardId}',${d.specs.length})"></div>
    </div>`).join('');

  return `
  <button class="btn-spec-toggle" onclick="toggleSpecTable('${cardId}',this)" style="margin:8px 16px 0;padding:6px 16px;background:transparent;border:1px solid var(--orange);border-radius:4px;font-size:12px;font-weight:600;color:var(--orange);cursor:pointer;font-family:'Noto Sans KR',sans-serif;display:flex;align-items:center;gap:5px">
    <span>📋 수량 입력</span><span style="font-size:10px">▼</span>
  </button>
  <div class="spec-table-wrap" id="wrap-${cardId}" style="display:none">
    <div class="spec-table-label">규격별 수량 입력</div>
    <div class="unit-select-bar">
      <span class="unit-select-label">단위 변환:</span>
      <div class="unit-btn-group">${unitBtns}</div>
      <div class="unit-custom-wrap" id="customWrap-${cardId}">
        <input class="unit-custom-input" type="text" placeholder="단위명" id="customUnit-${cardId}" maxlength="6">
        <span class="unit-hint">직접 입력</span>
      </div>
    </div>
    <input type="hidden" id="unit-${cardId}" value="${defaultUnit}">
    <div class="spec-table">${cols}</div>
    <div class="spec-footer">
      <div class="spec-total-text">합계: <strong id="total-${cardId}">0</strong> <span id="unitLabel-${cardId}">${defaultUnit}</span></div>
      <button class="btn-cart" onclick="addToCart('${cardId}','${d.name}',${d.specs.length},${JSON.stringify(d.specs).replace(/"/g,"'")})">발주 목록에 추가</button>
      <button class="btn-reset" onclick="resetQty('${cardId}',${d.specs.length})">초기화</button>
    </div>
  </div>`;
}

function toggleSpecTable(cardId, btn){
  var wrap = document.getElementById('wrap-'+cardId);
  if(!wrap) return;
  var isOpen = wrap.style.display !== 'none';
  wrap.style.display = isOpen ? 'none' : 'block';
  var arrow = btn.querySelector('span:last-child');
  if(arrow) arrow.textContent = isOpen ? '▼' : '▲';
  btn.style.background = isOpen ? 'transparent' : 'var(--orange)';
  btn.style.color = isOpen ? 'var(--orange)' : '#fff';
}

/* ─── 발주목록 상태 ─── */
let orderPages = [{ id: 1, name: '1페이지', items: [] }];
let currentOrderPage = 1;

function initOrderPanel() {
  renderOrderTabs();
  renderOrderContent(currentOrderPage);
  document.getElementById('orderPanel').style.display = 'block';
}

function renderOrderTabs() {
  const tabs = document.getElementById('orderPageTabs');
  tabs.innerHTML = orderPages.map(p =>
    `<button class="order-page-tab${p.id === currentOrderPage ? ' active' : ''}"
      onclick="switchOrderPage(${p.id})">${p.name}</button>`
  ).join('');
}

function switchOrderPage(pageId) {
  currentOrderPage = pageId;
  renderOrderTabs();
  renderAllPageContents();
  updateOrderFooter();
}

function addOrderPage() {
  const newId = orderPages.length + 1;
  orderPages.push({ id: newId, name: newId + '페이지', items: [] });
  currentOrderPage = newId;
  renderOrderTabs();
  renderAllPageContents();
  updateOrderFooter();
}

function renderAllPageContents() {
  const wrap = document.getElementById('orderPageContents');
  wrap.innerHTML = orderPages.map(p => `
    <div class="order-page-content${p.id === currentOrderPage ? ' active' : ''}" id="orderPage-${p.id}">

      <!-- 페이지 메모 - 가시성 강화 -->
      <div style="padding:10px 16px;background:linear-gradient(135deg,#FFF8F0,#FFF3E8);border-bottom:2px solid var(--orange);display:flex;align-items:flex-start;gap:10px">
        <div style="flex-shrink:0;margin-top:2px">
          <span style="display:inline-block;background:var(--orange);color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:3px;letter-spacing:.5px">메모</span>
        </div>
        <textarea placeholder="현장명, 납품처, 특이사항 등 페이지 메모를 입력하세요" rows="2"
          style="flex:1;padding:6px 10px;border:1px solid #F0C8A0;border-radius:4px;font-size:12px;font-family:'Noto Sans KR',sans-serif;resize:vertical;outline:none;background:#fff;color:var(--text);line-height:1.5"
          oninput="updatePageMemo(${p.id},this.value)">${p.memo||''}</textarea>
      </div>

      <div class="order-table-wrap">
        <table class="order-table">
          <thead><tr>
            <th style="width:32px">No</th>
            <th>품목명</th>
            <th style="width:72px;text-align:center">규격</th>
            <th style="width:150px;text-align:center;color:#1A6B3A">m 수량</th>
            <th style="width:150px;text-align:center;color:#1A5080">본/롤 수량</th>
            <th style="width:160px;text-align:center;color:var(--text-mid)">자재 메모</th>
            <th style="width:36px"></th>
          </tr></thead>
          <tbody id="orderBody-${p.id}">
            ${p.items.length === 0
              ? `<tr><td colspan="7" class="order-empty">이 페이지에 품목이 없습니다.<br><span style="font-size:12px">자재 카드에서 "발주 목록에 추가" 버튼을 누르세요.</span></td></tr>`
              : p.items.map((item, i) => {
                  const uc = item.unitConv;
                  const hasConv = uc && item.mQty !== null && item.bonQty !== null;
                  const isM   = hasConv && item.unit === uc.from;
                  const isBon = hasConv && item.unit !== uc.from;

                  let mCell = '', bonCell = '';

                  if (!hasConv) {
                    mCell = `<td colspan="2" style="text-align:center">
                      <div style="display:inline-flex;align-items:center;gap:5px">
                        <input class="order-qty-input" type="number" min="0" value="${item.qty}" onchange="updateOrderQty(${p.id},${i},this.value)">
                        <span class="order-unit-badge">${item.unit}</span>
                      </div></td>`;
                    bonCell = '';
                  } else if (isM) {
                    mCell = `<td style="text-align:center">
                      <div style="display:inline-flex;align-items:center;gap:5px">
                        <input class="order-qty-input" type="number" min="0" value="${item.qty}" onchange="updateOrderQty(${p.id},${i},this.value)" style="border-color:var(--orange)">
                        <span class="order-unit-badge" style="background:#FFF3E8;color:var(--orange);border-color:var(--orange)">m</span>
                      </div></td>`;
                    bonCell = `<td style="text-align:center">
                      <div style="display:inline-flex;align-items:center;gap:5px">
                        <span style="min-width:48px;text-align:right;font-size:13px;font-weight:700;color:#1A5080;background:#E8F0FB;padding:5px 10px;border-radius:4px;display:inline-block">${item.bonQty}</span>
                        <span class="order-unit-badge" style="background:#E8F0FB;color:#1A5080;border-color:#B0C8E8">${item.bonUnit||uc.to}</span>
                      </div></td>`;
                  } else {
                    mCell = `<td style="text-align:center">
                      <div style="display:inline-flex;align-items:center;gap:5px">
                        <span style="min-width:48px;text-align:right;font-size:13px;font-weight:700;color:#1A6B3A;background:#E8F5EE;padding:5px 10px;border-radius:4px;display:inline-block">${item.mQty}</span>
                        <span class="order-unit-badge" style="background:#E8F5EE;color:#1A6B3A;border-color:#A0D0B0">m</span>
                      </div></td>`;
                    bonCell = `<td style="text-align:center">
                      <div style="display:inline-flex;align-items:center;gap:5px">
                        <input class="order-qty-input" type="number" min="0" value="${item.qty}" onchange="updateOrderQty(${p.id},${i},this.value)" style="border-color:#1A5080">
                        <span class="order-unit-badge" style="background:#E8F0FB;color:#1A5080;border-color:#1A5080">${uc.to}</span>
                      </div></td>`;
                  }

                  // 자재별 메모 칸
                  const memoCell = `<td style="padding:4px 8px">
                    <input type="text" value="${(item.memo||'').replace(/"/g,'&quot;')}"
                      placeholder="메모"
                      oninput="updateOrderItemMemo(${p.id},${i},this.value)"
                      style="width:100%;padding:5px 8px;border:1px solid var(--border);border-radius:3px;font-size:11px;font-family:'Noto Sans KR',sans-serif;outline:none;color:var(--text);background:#fff"
                      onfocus="this.style.borderColor='var(--orange)'"
                      onblur="this.style.borderColor='var(--border)'">
                  </td>`;

                  return `<tr>
                    <td style="color:var(--text-light);text-align:center;font-size:12px">${i + 1}</td>
                    <td style="font-weight:500">${item.name}</td>
                    <td style="color:var(--text-mid);text-align:center">${item.spec}</td>
                    ${mCell}${bonCell}
                    ${memoCell}
                    <td style="text-align:center">
                      <button class="btn-del-row" onclick="deleteOrderItem(${p.id},${i})" title="삭제">✕</button>
                    </td>
                  </tr>`;
                }).join('')
            }
          </tbody>
        </table>
      </div>
    </div>`).join('');
}

function updatePageMemo(pageId, val) {
  const page = orderPages.find(p => p.id === pageId);
  if (page) page.memo = val;
}

function updateOrderItemMemo(pageId, idx, val) {
  const page = orderPages.find(p => p.id === pageId);
  if (page && page.items[idx]) page.items[idx].memo = val;
}

function updateOrderQty(pageId, idx, val) {
  const page = orderPages.find(p => p.id === pageId);
  if (page && page.items[idx]) {
    const item = page.items[idx];
    item.qty = Math.max(0, parseInt(val) || 0);
    // 양방향 재계산
    const unitConv = item.unitConv;
    if (unitConv) {
      if (item.unit === unitConv.from) { item.mQty = item.qty; item.bonQty = Math.ceil(item.qty / unitConv.rate); }
      else if (item.unit === unitConv.to) { item.bonQty = item.qty; item.mQty = item.qty * unitConv.rate; }
    }
    renderAllPageContents();
    updateOrderFooter();
  }
}

function renderOrderContent(pageId) {
  renderAllPageContents();
  updateOrderFooter();
}

function updateOrderFooter() {
  const page = orderPages.find(p => p.id === currentOrderPage);
  if (!page) return;
  let totalM = 0;
  page.items.forEach(function(item) {
    if (!item.unitConv) return;
    if (item.unit === item.unitConv.from) totalM += item.qty;
    else totalM += item.qty * item.unitConv.rate;
  });
  const mEl  = document.getElementById('orderTotalM');
  const itEl = document.getElementById('orderTotalItems');
  if (mEl)  mEl.textContent  = totalM;
  if (itEl) itEl.textContent = page.items.length;
}

function deleteOrderItem(pageId, idx) {
  const page = orderPages.find(p => p.id === pageId);
  if (page) { page.items.splice(idx, 1); renderAllPageContents(); updateOrderFooter(); }
}

function clearCurrentPage() {
  const page = orderPages.find(p => p.id === currentOrderPage);
  if (page && confirm(page.name + ' 항목을 모두 삭제할까요?')) {
    page.items = [];
    renderAllPageContents();
    updateOrderFooter();
  }
}

function addToCart(cardId, name, len, specs) {
  const unit = document.getElementById('unit-' + cardId)?.value || '개';
  const matData = DB.find(d => d.name === name);
  const unitConv = matData?.unitConv || null;

  const items = [];
  for (let i = 0; i < len; i++) {
    const v = parseInt(document.getElementById('qty-' + cardId + '-' + i)?.value) || 0;
    if (v > 0) {
      // 어떤 단위로 입력하든 m·본 둘 다 계산
      let mQty = null, bonQty = null, bonUnit = null;
      if (unitConv) {
        bonUnit = unitConv.to;
        if (unit === unitConv.from) {
          mQty = v;
          bonQty = Math.ceil(v / unitConv.rate);
        } else if (unit === unitConv.to) {
          bonQty = v;
          mQty = v * unitConv.rate;
        }
      }
      items.push({ name, spec: specs[i], qty: v, unit, unitConv, mQty, bonQty, bonUnit });
    }
  }
  if (!items.length) { alert('수량을 입력해주세요'); return; }

  const page = orderPages.find(p => p.id === currentOrderPage);
  items.forEach(item => {
    const existing = page.items.find(e => e.name === item.name && e.spec === item.spec && e.unit === item.unit);
    if (existing) {
      existing.qty += item.qty;
      if (unitConv) {
        if (item.unit === unitConv.from) { existing.mQty = existing.qty; existing.bonQty = Math.ceil(existing.qty / unitConv.rate); }
        else if (item.unit === unitConv.to) { existing.bonQty = existing.qty; existing.mQty = existing.qty * unitConv.rate; }
      }
    } else page.items.push({ ...item });
  });

  document.getElementById('orderPanel').style.display = 'block';
  renderOrderTabs();
  renderAllPageContents();
  updateOrderFooter();
  resetQty(cardId, len);
  document.getElementById('orderPanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function selectUnit(cardId, val, el, unit1, unit2, unit2ratio) {
  el.closest('.unit-btn-group').querySelectorAll('.unit-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  const customWrap = document.getElementById('customWrap-'+cardId);
  if(val === 'custom') {
    customWrap.classList.add('show');
    const customInput = document.getElementById('customUnit-'+cardId);
    customInput.oninput = function(){
      const v = this.value.trim()||'직접입력';
      document.getElementById('unit-'+cardId).value = v;
      document.getElementById('unitLabel-'+cardId).textContent = v;
    };
    customInput.focus();
  } else {
    customWrap.classList.remove('show');
    document.getElementById('unit-'+cardId).value = val;
    document.getElementById('unitLabel-'+cardId).textContent = val;
  }
  // 단위 변경 시 변환값 다시 계산
  const wrap = document.getElementById('wrap-'+cardId);
  if(wrap){
    const len = wrap.querySelectorAll('.spec-qty').length;
    updateTotal(cardId, len, unit1||'', unit2||'', unit2ratio||0);
  }
}

function updateTotal(cardId, len, unit1, unit2, unit2ratio) {
  let s = 0;
  for (let i = 0; i < len; i++) s += parseInt(document.getElementById('qty-' + cardId + '-' + i)?.value) || 0;
  const el = document.getElementById('total-' + cardId);
  if (el) el.textContent = s.toLocaleString();

  // 자동 단위 변환 표시
  const convertBadge = document.getElementById('convert-'+cardId);
  if(!convertBadge) return;
  const currentUnit = document.getElementById('unit-'+cardId)?.value;
  const ratio = parseInt(unit2ratio) || 0;
  if(s > 0 && ratio > 0 && unit1 && unit2) {
    if(currentUnit === unit1) {
      // 기본단위(m) → 보조단위(본) 변환
      const bon = Math.ceil(s / ratio);
      const rem = s % ratio;
      document.getElementById('convertVal-'+cardId).textContent = bon;
      document.getElementById('convertUnit-'+cardId).textContent = unit2 + (rem > 0 ? ` (${rem}${unit1} 남음)` : '');
      convertBadge.style.display = 'inline-flex';
    } else if(currentUnit === unit2) {
      // 보조단위(본) → 기본단위(m) 변환
      const meter = s * ratio;
      document.getElementById('convertVal-'+cardId).textContent = meter.toLocaleString();
      document.getElementById('convertUnit-'+cardId).textContent = unit1;
      convertBadge.style.display = 'inline-flex';
    } else {
      convertBadge.style.display = 'none';
    }
  } else {
    convertBadge.style.display = 'none';
  }
}

function resetQty(cardId, len) {
  for (let i = 0; i < len; i++) {
    const e = document.getElementById('qty-' + cardId + '-' + i);
    if (e) e.value = '';
  }
  const el = document.getElementById('total-' + cardId);
  if (el) el.textContent = '0';
}

function renderCards(list,q){
  if(!list.length){
    // 설비용어 DB에서 검색
    var termHtml = '';
    if(q){
      var terms = TERMS.filter(function(t){
        return t.word.includes(q) || t.aliases.some(function(a){ return a.includes(q); }) || t.desc.includes(q);
      });
      if(terms.length){
        termHtml = '<div style="margin-bottom:20px">'
          +'<div style="font-size:12px;font-weight:700;color:var(--text-mid);margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid var(--orange)">📖 설비용어 설명</div>'
          +terms.map(function(t){
            return '<div style="background:var(--white);border:1px solid var(--border);border-radius:6px;padding:14px 16px;margin-bottom:8px">'
              +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'
                +'<span style="font-size:14px;font-weight:700;color:var(--text)">'+t.word+'</span>'
                +(t.aliases.length?'<span style="font-size:11px;color:var(--text-light)">('+t.aliases.join(', ')+')</span>':'')
                +'<span style="font-size:10px;padding:1px 6px;border-radius:2px;background:var(--tag-bg);color:var(--tag-text)">'+t.cat+'</span>'
              +'</div>'
              +'<div style="font-size:13px;color:var(--text-mid);line-height:1.7;margin-bottom:8px">'+t.desc+'</div>'
              +'<button onclick="openTermComment(event,\'term_\'+t.word)" style="padding:3px 10px;background:transparent;border:1px solid var(--border);border-radius:3px;font-size:11px;color:var(--text-mid);cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">💬 추가설명</button>'
            +'</div>';
          }).join('')
        +'</div>';
      }
    }
    return termHtml
      +'<div style="background:var(--white);border:1px solid var(--border);border-radius:8px;padding:24px;text-align:center">'
        +'<div style="font-size:14px;color:var(--text-mid);margin-bottom:8px">검색 결과가 없습니다.</div>'
        +'<div style="font-size:12px;color:var(--text-light);margin-bottom:20px">다른 이름이나 약어로 검색해보세요</div>'
        +'<div style="border-top:1px solid var(--border);padding-top:18px">'
          +'<div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:10px">💬 커뮤니티에 질문하기</div>'
          +'<div style="font-size:12px;color:var(--text-light);margin-bottom:12px">"<strong style="color:var(--orange)">'+(q||'')+'</strong>"에 대해 아는 분이 답변해드릴 수 있어요</div>'
          +'<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">'
            +'<input type="text" id="searchQuestionInput" value="'+(q?q+' 이란?':'')+'" placeholder="질문 내용을 입력하세요" style="padding:8px 12px;border:1px solid var(--border);border-radius:4px;font-size:13px;outline:none;min-width:240px">'
            +'<button onclick="postSearchQuestion()" style="padding:8px 20px;background:var(--orange);color:#fff;border:none;border-radius:4px;font-size:13px;font-weight:700;cursor:pointer">질문하기</button>'
          +'</div>'
        +'</div>'
      +'</div>';
  }
  return list.map((d,i)=>{
    const id='c'+i+'t'+Date.now();
    const hl=q?d.name.replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'),m=>`<mark>${m}</mark>`):d.name;
    const imgSrc = matImages[d.name] || '';
    const showImgWrap = imgSrc || isAdmin;
    const imgHtml = imgSrc
      ? `<img src="${imgSrc}" alt="${d.name}" style="width:100%;height:100%;object-fit:cover">`
      : isAdmin ? `<div class="mat-img-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><span>사진 등록</span></div>` : '';
    const adminHint = `<div class="img-admin-hint"><span>클릭하여<br>사진 등록</span></div>`;
    const safeMatId = d.name.replace(/[^가-힣a-zA-Z0-9]/g,'_');
    const aliasDisplay = d.aliases.length>3
      ? d.aliases.slice(0,3).join(', ') + ` <span class="alias-more">외 ${d.aliases.length-3}개</span>`
      : d.aliases.join(', ');
    const topCmt = getTopComment(d.name);
    return `<div class="material-card" onclick="openMatDetail('${d.name}')">
      <div class="card-top" style="gap:${showImgWrap?'20px':'0'}">
        ${showImgWrap ? `<div class="mat-img-wrap" id="imgWrap-${id}" onclick="event.stopPropagation();isAdmin&&openPasteModal('${d.name}','${id}')" title="${isAdmin?'클릭하여 사진 등록':''}">${imgHtml}${adminHint}</div>` : ''}
        <div class="mat-info">
          <span class="mat-category-badge ${d.badge}">${getBadgeLabel(d.cat)}</span>
          <div class="mat-name">${hl}</div>
          <div class="mat-aliases">다른 이름: <span>${aliasDisplay}</span></div>
          <div class="mat-tags">${d.tags.map((t,ti)=>`<span class="mat-tag${ti===0?' orange':''}">${t}</span>`).join('')}</div>
          <div class="mat-desc">${d.desc}</div>
          <div class="mat-top-cmt" id="top-cmt-${safeMatId}" style="${topCmt?'':'display:none'}">${topCmt?'💬 '+topCmt:''}</div>
        </div>
        <div class="mat-actions">
          <button class="btn-inquiry" onclick="openToComment(event,'${d.name}')">💬 추가설명</button>
          <div class="mat-toggle-hint" id="toggle_${safeMatId}">상세보기 <span>▼</span></div>
        </div>
      </div>
      <div class="mat-detail-panel" id="dp_${safeMatId}" style="display:none" onclick="event.stopPropagation()"></div>
    </div>`;
  }).join('');
}

/* ─── 드롭다운 메뉴 제어 ─── */
const MENU_KEYS = ['설비','전기','소방'];
const dropTimers = {};

function openDrop(key){
  cancelDrop(key);
  MENU_KEYS.forEach(k=>{ if(k!==key) closeDrop(k); });
  document.getElementById('sub-'+key).classList.add('show');
  document.getElementById('btn-'+key).classList.add('open');
}
function closeDrop(key){
  document.getElementById('sub-'+key)?.classList.remove('show');
  document.getElementById('btn-'+key)?.classList.remove('open');
}
function scheduleDrop(key){
  dropTimers[key] = setTimeout(()=>closeDrop(key), 5000);
}
function cancelDrop(key){
  if(dropTimers[key]){ clearTimeout(dropTimers[key]); dropTimers[key]=null; }
}
// 외부 클릭 시 전체 닫기
document.addEventListener('click', e=>{
  if(!e.target.closest('.cat-dropdown')) MENU_KEYS.forEach(closeDrop);
});

let currentCat='전체';
function filterCat(el,cat){
  currentCat=cat;
  // 모든 활성 초기화
  document.querySelectorAll('.cat-item,.cat-dropdown-btn,.cat-submenu-item').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  if(cat==='전체') document.getElementById('catAll')?.classList.add('active');
  MENU_KEYS.forEach(closeDrop);
  const q=document.getElementById('searchInput').value.trim();
  let list=cat==='전체'?DB:DB.filter(d=>[d.cat,d.sub,...(d.tags||[])].some(s=>s&&s.toLowerCase().includes(cat.toLowerCase())));
  if(q) list=list.filter(d=>[d.name,...d.aliases,d.cat,d.sub].some(s=>s.toLowerCase().includes(q.toLowerCase())));
  document.getElementById('cntNum').textContent=list.length+'건';
  document.getElementById('cntLabel').textContent=cat==='전체'?'전체 자재':'카테고리: '+cat;
  document.getElementById('materialList').innerHTML=renderCards(list,q);
  document.getElementById('aliasNotice').style.display='none';
}
function filterSubCat(el,cat){
  currentCat=cat;
  // 모든 활성 초기화 후 소메뉴 아이템 + 부모 버튼 활성화
  document.querySelectorAll('.cat-item,.cat-dropdown-btn,.cat-submenu-item').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  const parentBtn=el.closest('.cat-dropdown')?.querySelector('.cat-dropdown-btn');
  if(parentBtn) parentBtn.classList.add('active');
  MENU_KEYS.forEach(closeDrop);
  const q=document.getElementById('searchInput').value.trim();
  let list=DB.filter(d=>[d.cat,d.sub,...(d.tags||[])].some(s=>s&&s.toLowerCase().includes(cat.toLowerCase())));
  if(q) list=list.filter(d=>[d.name,...d.aliases,d.cat,d.sub].some(s=>s.toLowerCase().includes(q.toLowerCase())));
  document.getElementById('cntNum').textContent=list.length+'건';
  document.getElementById('cntLabel').textContent='카테고리: '+cat;
  document.getElementById('materialList').innerHTML=renderCards(list,q);
  document.getElementById('aliasNotice').style.display='none';
}
const DEFAULT_HINTS=['볼밸브','백관','스프링클러','엑셀관','그라스울','플러싱','횡주관'];
function trackSearch(q){
  if(!q) return;
  try{
    const counts=JSON.parse(localStorage.getItem('sbt_search_counts')||'{}');
    counts[q]=(counts[q]||0)+1;
    localStorage.setItem('sbt_search_counts',JSON.stringify(counts));
  }catch(e){}
}
function getTopSearches(){
  try{
    const counts=JSON.parse(localStorage.getItem('sbt_search_counts')||'{}');
    const sorted=Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(e=>e[0]);
    if(sorted.length>=7) return sorted.slice(0,7);
    const merged=[...sorted,...DEFAULT_HINTS.filter(h=>!sorted.includes(h))];
    return merged.slice(0,7);
  }catch(e){ return DEFAULT_HINTS; }
}
/* ─── 자재 상세 모달 ─── */
function getTopComment(matName){
  if(typeof matExtraComments==='undefined') return '';
  const list = matExtraComments['mat_'+matName]||[];
  if(!list.length) return '';
  const top = [...list].sort((a,b)=>(b.likes||0)-(a.likes||0))[0];
  const text = top.text.length>60 ? top.text.slice(0,60)+'…' : top.text;
  const likeBadge = (top.likes||0)>0 ? ` <span class="mat-top-cmt-likes">👍${top.likes}</span>` : '';
  return `<em>${top.author}</em>: ${text}${likeBadge}`;
}

function openMatDetail(name){
  const d = DB.find(x=>x.name===name); if(!d) return;
  const safeId = name.replace(/[^가-힣a-zA-Z0-9]/g,'_');
  const panel = document.getElementById('dp_'+safeId); if(!panel) return;
  const hint = document.getElementById('toggle_'+safeId);
  const isOpen = panel.style.display !== 'none';
  // 다른 열린 패널 닫기
  document.querySelectorAll('.mat-detail-panel').forEach(p=>{
    if(p!==panel && p.style.display!=='none'){
      p.style.display='none';
      const sid = p.id.replace('dp_','');
      const oh = document.getElementById('toggle_'+sid);
      if(oh){ oh.innerHTML='상세보기 <span>▼</span>'; oh.classList.remove('open'); }
    }
  });
  if(isOpen){
    panel.style.display='none';
    if(hint){ hint.innerHTML='상세보기 <span>▼</span>'; hint.classList.remove('open'); }
  } else {
    renderMatDetailPanel(panel, d, 'mat_'+name);
    panel.style.display='block';
    if(hint){ hint.innerHTML='접기 <span>▲</span>'; hint.classList.add('open'); }
    setTimeout(()=>panel.scrollIntoView({behavior:'smooth',block:'nearest'}),50);
  }
}

function renderMatDetailPanel(panel, d, key){
  const comments = (typeof matExtraComments!=='undefined' ? matExtraComments[key] : null)||[];
  const sorted = [...comments].map((cm,i)=>({cm,i})).sort((a,b)=>(b.cm.likes||0)-(a.cm.likes||0));
  const safeId = key.replace(/[^가-힣a-zA-Z0-9]/g,'_');
  const specsHtml = d.specs&&d.specs.length
    ? `<div class="mdl-section"><div class="mdl-section-title">관경 / 규격</div><div class="mdl-specs">${d.specs.map(s=>`<span class="mdl-spec-chip">${s}</span>`).join('')}</div></div>`
    : '';
  const cmtItems = sorted.map(({cm,i})=>{
    const actions = typeof buildCmtActions==='function' ? buildCmtActions(key,i,cm) : '';
    const repliesHtml = (cm.replies&&cm.replies.length)
      ? `<div style="margin-top:6px;padding:6px 10px;border-left:2px solid var(--orange);background:#FFFAF7;border-radius:0 4px 4px 0">`
          + (cm.replies||[]).map(r=>`<div style="padding:4px 0;border-bottom:1px solid #FFE8D6">
            <div style="font-size:11px;font-weight:700;color:var(--text-mid);margin-bottom:2px">↩ ${r.author} <span style="font-weight:400;color:var(--text-light)">${r.date||''}</span></div>
            <div style="font-size:12px;color:var(--text)">${r.text}</div>
          </div>`).join('')
        + `</div>`
      : '';
    const replyBox = (typeof currentUser!=='undefined'&&currentUser)
      ? `<div id="xcr-box-${safeId}-${i}" style="display:none;margin-top:6px">
          <div style="display:flex;gap:6px">
            <input type="text" id="xcr-inp-${safeId}-${i}" placeholder="답글 입력..."
              style="flex:1;padding:5px 9px;border:1px solid var(--border);border-radius:4px;font-size:12px;font-family:'Noto Sans KR',sans-serif;outline:none"
              onkeydown="if(event.key==='Enter')addExtraReply('${key}',${i})">
            <button onclick="addExtraReply('${key}',${i})"
              style="padding:5px 10px;background:var(--dark);color:#fff;border:none;border-radius:4px;font-size:11px;cursor:pointer;font-family:'Noto Sans KR',sans-serif">등록</button>
          </div>
        </div>`
      : '';
    return `<div class="mdl-cmt-item" id="cmtitem_${safeId}_${i}">
      <div class="mdl-cmt-header"><strong>${cm.author}</strong><span>${cm.date}</span></div>
      <div class="mdl-cmt-text">${cm.text}</div>
      ${actions}${repliesHtml}${replyBox}
    </div>`;
  }).join('') || '<div class="mdl-cmt-empty">첫 번째 추가 설명을 남겨보세요!</div>';
  const inputHtml = (typeof currentUser!=='undefined'&&currentUser)
    ? `<div class="mdl-cmt-input-row"><input type="text" id="mdl_xci_${safeId}" placeholder="현장 경험이나 추가 정보를 공유해주세요..." onkeydown="if(event.key==='Enter')submitExtraCommentDetail('${key}')"><button onclick="submitExtraCommentDetail('${key}')">등록</button></div>`
    : '<div class="mdl-cmt-login">로그인 후 추가 설명을 작성할 수 있습니다.</div>';
  panel.innerHTML = `
    <div class="mdl-header" style="padding:0 0 14px;border-bottom:1px solid var(--border);margin-bottom:4px">
      <div class="mdl-aliases" style="margin-top:4px">${d.aliases.join(' · ')}</div>
    </div>
    <div class="mdl-section"><div class="mdl-section-title">설명</div><div class="mdl-desc">${d.desc}</div></div>
    ${specsHtml}
    <div class="mdl-section">
      <div class="mdl-section-title">💬 추가설명 ${comments.length}개</div>
      <div id="mdl_cmt_${safeId}">${cmtItems}</div>
      ${inputHtml}
    </div>`;
}

function submitExtraCommentDetail(key){
  if(typeof currentUser==='undefined'||!currentUser){ alert('로그인이 필요합니다.'); return; }
  const safeId = key.replace(/[^가-힣a-zA-Z0-9]/g,'_');
  const inp = document.getElementById('mdl_xci_'+safeId);
  const text = inp ? inp.value.trim() : '';
  if(!text){ if(inp) inp.focus(); return; }
  if(!matExtraComments[key]) matExtraComments[key]=[];
  matExtraComments[key].push({author:currentUser.name, text, date:new Date().toLocaleDateString('ko-KR'), likes:0, likedBy:[]});
  saveExtraComments();
  if(typeof addExp==='function'){ addExp(currentUser, 3, '자재 추가설명'); saveUserData(); }
  const name = key.replace(/^mat_/,'');
  const safeMatId = name.replace(/[^가-힣a-zA-Z0-9]/g,'_');
  const panel = document.getElementById('dp_'+safeMatId);
  const d = DB.find(x=>x.name===name);
  if(panel&&panel.style.display!=='none'&&d) renderMatDetailPanel(panel, d, key);
  refreshCardTopComment(name);
  const el = document.getElementById('xc_'+safeId);
  if(el&&el.style.display!=='none'&&typeof renderExtraCommentPanel==='function') renderExtraCommentPanel(el, key);
}

function openToComment(event, name){
  event.stopPropagation();
  const safeId = name.replace(/[^가-힣a-zA-Z0-9]/g,'_');
  const panel = document.getElementById('dp_'+safeId);
  const isOpen = panel && panel.style.display !== 'none';
  if(!isOpen) openMatDetail(name);
  setTimeout(()=>{
    const inputSafeId = ('mat_'+name).replace(/[^가-힣a-zA-Z0-9]/g,'_');
    const inp = document.getElementById('mdl_xci_'+inputSafeId);
    if(inp){
      inp.scrollIntoView({behavior:'smooth', block:'center'});
      inp.focus();
      const row = inp.closest('.mdl-cmt-input-row');
      if(row){ row.classList.add('highlight'); setTimeout(()=>row.classList.remove('highlight'),1500); }
    }
  }, 120);
}

function refreshOpenDetailPanels(){
  document.querySelectorAll('.mat-detail-panel').forEach(function(panel){
    if(panel.style.display==='none') return;
    const safeId = panel.id.replace('dp_','');
    const d = DB.find(function(x){ return x.name.replace(/[^가-힣a-zA-Z0-9]/g,'_')===safeId; });
    if(d) renderMatDetailPanel(panel, d, 'mat_'+d.name);
  });
}

function refreshCardTopComment(matName){
  const safeId = matName.replace(/[^가-힣a-zA-Z0-9]/g,'_');
  const el = document.getElementById('top-cmt-'+safeId);
  if(el){ const txt = getTopComment(matName); el.style.display = txt?'block':'none'; el.innerHTML = txt ? '💬 '+txt : ''; }
}

function setSearch(val){document.getElementById('searchInput').value=val;doSearch();}
function doSearch(){
  const q=document.getElementById('searchInput').value.trim();
  const noticeArea=document.getElementById('homeNoticeArea');
  const matList=document.getElementById('materialList');
  if(!q){
    document.getElementById('cntNum').textContent='0건';
    document.getElementById('cntLabel').textContent='자재명을 검색하세요';
    if(noticeArea) noticeArea.style.display='block';
    if(matList) matList.style.display='none';
    document.getElementById('aliasNotice').style.display='none';
    return;
  }
  trackSearch(q);
  if(noticeArea) noticeArea.style.display='none';
  if(matList) matList.style.display='block';
  const ql=q.toLowerCase();
  const res=DB.filter(d=>[d.name,...d.aliases,d.cat,d.sub].some(s=>s&&s.toLowerCase().includes(ql)));
  document.getElementById('cntNum').textContent=res.length+'건';
  document.getElementById('cntLabel').innerHTML='"'+q+'" 검색 결과';
  document.getElementById('materialList').innerHTML=renderCards(res,q);
  const matched=res.find(d=>d.aliases.map(a=>a.toLowerCase()).includes(ql)||d.name.toLowerCase()===ql);
  const notice=document.getElementById('aliasNotice');
  if(matched&&matched.aliases.length){notice.style.display='block';notice.innerHTML='<strong>"'+q+'"</strong>로 검색하셨습니다. 같은 자재의 다른 이름들:<div class="alias-tags"><span class="alias-tag current">'+q+' (현재)</span>'+matched.aliases.map(a=>'<span class="alias-tag">'+a+'</span>').join('')+'</div>';}
  else notice.style.display='none';
}
/* ─── 관리자 모드 ─── */
/* ─── 회원 & 관리자 시스템 ─── */
const ADMIN_ID = 'admin';
const ADMIN_PW = 'qkrdbwns16^';

/* ── 서버 PHP 경로 ── */
const SERVER_IMG_PHP = '/upload_img.php';
const SERVER_DB_PHP  = '/save_db.php';

// ── MySQL API 엔드포인트 ──
const API_AUTH  = '/api/auth.php';
const API_USER  = '/api/user.php';
const API_CASH  = '/api/cash.php';
const API_POSTS = '/api/posts.php';
const API_HELP  = '/api/help.php';
const API_DOCS  = '/api/docs.php';

// ── API 공통 헬퍼 ──
async function apiCall(url, params={}, method='POST'){
  try{
    const opts = method==='GET'
      ? {method:'GET'}
      : {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(params)};
    const r = await fetch(url, opts);
    return await r.json();
  }catch(e){ return {ok:false, msg:'네트워크 오류: '+e.message}; }
}

/* ── 서버에서 이미지 매핑 + DB 불러오기 (get_data.php 하나로) ── */
async function loadServerData() {
  try {
    const r = await fetch('/get_data.php');
    const d = await r.json();
    if (!d.ok) return;
    // 이미지 매핑
    if (d.images) Object.assign(matImages, d.images);
    // 자재 DB 병합
    if (Array.isArray(d.db) && d.db.length > 0) {
      d.db.forEach(function(item) {
        var existing = DB.find(function(x){ return x.name === item.name; });
        if (existing) Object.assign(existing, item);
        else DB.push(item);
      });
    }
  } catch(e) { /* 서버 없으면 무시 (로컬 테스트 호환) */ }
}
// 샘플 회원 DB (실제 서비스는 서버 연동)
/* ── 회원 등급 정의 ── */
const GRADES = {
  '용역':   {label:'용역',   num:8, color:'#9C9A92', bg:'#F0EDE8', order:1},
  '신호수': {label:'신호수', num:7, color:'#6B8E6B', bg:'#E8F5EE', order:2},
  '조공':   {label:'조공',   num:6, color:'#5B7FA6', bg:'#E8F0FB', order:3},
  '준기공': {label:'준기공', num:5, color:'#7A6BAE', bg:'#EEE8FB', order:4},
  '기공':   {label:'기공',   num:4, color:'#1A6B3A', bg:'#D4EFE1', order:5},
  '팀장':   {label:'팀장',   num:3, color:'#1A5080', bg:'#C8DDF5', order:6},
  '기능장': {label:'기능장', num:2, color:'#B8860B', bg:'#FFF0C0', order:7},
  '기술사': {label:'기술사', num:1, color:'#C0392B', bg:'#FDDBD8', order:8},
  'admin':  {label:'관리자', num:0, color:'#fff',    bg:'#1A1A18', order:9},
};
function gradeHTML(grade){
  var g = GRADES[grade] || GRADES['용역'];
  return '<span style="display:inline-block;font-size:9px;font-weight:700;padding:1px 5px;border-radius:2px;background:'+g.bg+';color:'+g.color+';white-space:nowrap;vertical-align:middle">'+g.num+' '+g.label+'</span>';
}

const USERS = [
  {id:'user1',  pw:'user1',  name:'홍길동', grade:'기공'},
  {id:'pro1',   pw:'pro1',   name:'김현장', grade:'팀장'},
  {id:'master', pw:'master', name:'이기술', grade:'기술사'},
];
var isAdmin = false;
var currentUser = null; // {id, name, grade}
const matImages = {};
let pasteTargetName = '';
let pasteTargetId = '';
let pendingImageData = null;

// 유료회원 발주서 저장소 (로컬 - 실제는 서버)
let savedOrders = JSON.parse(localStorage.getItem('savedOrders')||'[]');

function openLoginModal(){
  document.getElementById('loginModal').classList.add('show');
  document.getElementById('loginId').value='';
  document.getElementById('loginPw').value='';
  document.getElementById('loginError').classList.remove('show');
  setTimeout(()=>document.getElementById('loginId').focus(),100);
}
function closeLoginModal(){
  document.getElementById('loginModal').classList.remove('show');
}
function doLogin(){
  const id=document.getElementById('loginId').value.trim();
  const pw=document.getElementById('loginPw').value;
  if(!id||!pw){ document.getElementById('loginError').classList.add('show'); return; }

  // 관리자 로컬 체크
  if(id===ADMIN_ID && pw===ADMIN_PW){
    isAdmin=true; currentUser=null;
    try{ localStorage.setItem('sbt_session', JSON.stringify({type:'admin'})); }catch(e){}
    sessionStorage.setItem('sbt_tab_alive','1');
    closeLoginModal(); activateAdminMode(); return;
  }

  // MySQL API 로그인
  apiCall(API_AUTH+'?action=login', {username:id, password:pw}).then(function(res){
    if(!res.ok){
      // DB 실패 시 샘플유저 로컬 체크 (개발용 fallback)
      var user=USERS.find(function(u){ return u.id===id && u.pw===pw; });
      if(user){
        currentUser=user; isAdmin=false;
        try{ localStorage.setItem('sbt_session', JSON.stringify({type:'user',id:user.id,name:user.name,grade:user.grade,utype:user.type||'',cash:user.cash||0})); }catch(e){}
        sessionStorage.setItem('sbt_tab_alive','1');
        closeLoginModal(); activateUserMode(user);
      } else {
        document.getElementById('loginError').classList.add('show');
        document.getElementById('loginPw').value='';
      }
      return;
    }
    var u=res.user;
    currentUser={
      id:u.id, name:u.name, grade:u.grade, exp:u.exp||0,
      cash:u.cash||0, point:u.point||0, type:u.type,
      postCount:u.post_count||0, commentCount:u.comment_count||0,
      visitDays:u.visit_days||0, cashLog:[], expLog:[]
    };
    isAdmin=false;
    try{ localStorage.setItem('sbt_session', JSON.stringify({type:'user',db_id:u.id,name:u.name,grade:u.grade,cash:u.cash||0,utype:u.type})); }catch(e){}
    sessionStorage.setItem('sbt_tab_alive','1');
    closeLoginModal(); activateUserMode(currentUser);
  });
  return; // 비동기 처리로 아래 코드 미실행
  // (아래는 레거시 코드 - 실행 안 됨)
  document.getElementById('loginPw').focus();
}
function activateAdminMode(){
  document.body.classList.add('admin-mode');
  document.getElementById('adminBanner').classList.add('show');
  document.getElementById('headerRight').innerHTML=
    '<span class="btn-admin-badge">ADMIN MODE</span>'
    +'<button class="btn-logout" onclick="doLogout()">로그아웃</button>';
  const q=document.getElementById('searchInput').value.trim();
  if(q) doSearch(); else if(currentCat!=='전체'){
    const list=DB.filter(d=>[d.cat,d.sub,...(d.tags||[])].some(s=>s&&s.toLowerCase().includes(currentCat.toLowerCase())));
    document.getElementById('materialList').innerHTML=renderCards(list,q);
  }
}
function activateUserMode(user){
  var g = GRADES[user.grade] || GRADES['용역'];
  var gradeEl = '<span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:3px;background:'+g.bg+';color:'+g.color+'">'+g.num+' '+g.label+'</span>';
  document.getElementById('headerRight').innerHTML=
    '<span style="font-size:13px;color:#B0AEA6;display:flex;align-items:center;gap:5px;cursor:pointer" onclick="openMypage()">'+gradeEl+'<strong style="color:#E8E6E0">'+user.name+'</strong></span>'
    +'<button onclick="openMypage()" style="padding:5px 10px;background:transparent;border:1px solid #3A3A38;border-radius:4px;font-size:11px;color:#9A9890;cursor:pointer;font-family:\'Noto Sans KR\',sans-serif">MY</button>'
    +'<button class="btn-logout" onclick="doLogout()">로그아웃</button>';
  // 쪽지 벨 표시
  var bell = document.getElementById('msgBellWrap');
  if(bell) bell.style.display='inline-block';
  updateMsgBadge();
  if(user.grade==='팀장'||user.grade==='기능장'||user.grade==='기술사'){ showProBanner(); }
  refreshOpenDetailPanels();
  // 로그인 경험치 + 일일 방문 체크
  setTimeout(function(){
    if(typeof addExp==='function'){ addExp(user, EXP_RULES['로그인']||2, '로그인'); checkDailyVisit(); saveUserData(); }
  }, 500);
}
function showProBanner(){
  var existing=document.getElementById('proBanner');
  if(existing) return;
  var banner=document.createElement('div');
  banner.id='proBanner';
  banner.style.cssText='background:#2A4A2A;border-bottom:2px solid #4A8A4A;padding:8px 40px;display:flex;align-items:center;justify-content:space-between';
  var btnStyle='padding:5px 12px;background:#1A3A1A;color:#C8F0C8;border:none;border-radius:3px;font-size:11px;font-weight:700;cursor:pointer';
  banner.innerHTML='<div style="display:flex;align-items:center;gap:10px"><span style="font-size:10px;font-weight:700;letter-spacing:1px;padding:3px 10px;background:#4A8A4A;color:#C8F0C8;border-radius:3px">PRO</span><span style="font-size:13px;color:#C8F0C8">유료회원 모드 — 발주서가 날짜별로 저장됩니다.</span></div>'
    +'<div style="display:flex;gap:8px"><button onclick="showSavedOrders()" style="'+btnStyle+'">📂 저장된 발주서</button></div>';
  document.getElementById('adminBanner').insertAdjacentElement('afterend', banner);
}
function doLogout(){
  try{ apiCall(API_AUTH+'?action=logout',{}); }catch(e){}
  isAdmin=false; currentUser=null;
  try{ localStorage.removeItem('sbt_session'); }catch(e){}
  document.body.classList.remove('admin-mode');
  document.getElementById('adminBanner').classList.remove('show');
  var proBanner=document.getElementById('proBanner');
  if(proBanner) proBanner.remove();
  document.getElementById('headerRight').innerHTML=
    '<button class="btn-login" onclick="openLoginModal()">로그인</button>'
    +'<button class="btn-join" onclick="openJoinModal()">회원가입</button>';
  // 쪽지 벨 숨김
  var bell = document.getElementById('msgBellWrap');
  if(bell) bell.style.display='none';
}
// F5 새로고침 후 세션 복원
(function restoreSession(){
  // 탭 플래그 체크: 탭이 닫혔다가 새로 열리면 세션 삭제
  if(!sessionStorage.getItem('sbt_tab_alive')){
    try{ localStorage.removeItem('sbt_session'); }catch(e){}
    sessionStorage.setItem('sbt_tab_alive','1');
    return;
  }
  try{
    var s = localStorage.getItem('sbt_session');
    if(!s) return;
    var sess = JSON.parse(s);
    if(sess.type==='admin'){
      isAdmin=true; currentUser=null;
      activateAdminMode();
      return;
    }
    if(sess.type !== 'user') return;

    // MySQL DB에서 최신 정보 조회 (db_id 있는 경우)
    if(sess.db_id){
      fetch(API_AUTH+'?action=me').then(function(r){return r.json();}).then(function(res){
        if(res.ok && res.user){
          var u=res.user;
          currentUser={
            id:u.id, name:u.name, grade:u.grade, exp:u.exp||0,
            cash:u.cash||0, point:u.point||0, type:u.type,
            postCount:u.post_count||0, commentCount:u.comment_count||0,
            visitDays:u.visit_days||0, cashLog:[], expLog:[]
          };
          sess.name=u.name; sess.grade=u.grade; sess.cash=u.cash||0;
          try{ localStorage.setItem('sbt_session',JSON.stringify(sess)); }catch(e2){}
          isAdmin=false; activateUserMode(currentUser);
        } else {
          _restoreFromLocalSession(sess);
        }
      }).catch(function(){ _restoreFromLocalSession(sess); });
      return;
    }

    // db_id 없는 경우 (샘플유저, 네이버 등) 로컬 세션으로 복원
    _restoreFromLocalSession(sess);
  }catch(e){ console.error('restoreSession 오류:', e); }
})();

function _restoreFromLocalSession(sess){
  if(!sess.name) return;
  // USERS 배열에서 찾기
  var u = USERS.find(function(x){ return x.id===sess.id; });
  if(!u){
    try{
      var su = JSON.parse(localStorage.getItem('st_users')||'[]');
      u = su.find(function(x){ return x.id===sess.id; });
      if(u && !USERS.find(function(x){return x.id===u.id;})) USERS.push(u);
    }catch(e2){}
  }
  if(!u && sess.name){
    u = {id:sess.id||sess.db_id||0, name:sess.name, grade:sess.grade||'용역',
         type:sess.utype||'email', exp:0, cash:sess.cash||0,
         point:0, expLog:[], cashLog:[], postCount:0, commentCount:0};
  }
  if(u){
    if(sess.cash!==undefined) u.cash=sess.cash;
    currentUser=u; isAdmin=false; activateUserMode(u);
  } else {
    try{ localStorage.removeItem('sbt_session'); }catch(e){}
  }
}
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){closeLoginModal();closePasteModal();}
});
// 탭/창 닫을 때만 로그아웃 (F5 새로고침은 유지)
// sessionStorage는 탭 닫으면 사라지는 특성을 이용
window.addEventListener('load', function(){
  // 탭이 살아있는 동안 sessionStorage에 탭 플래그 유지
  sessionStorage.setItem('sbt_tab_alive', '1');
});
// 탭 닫기 시 로그아웃: sessionStorage(sbt_tab_alive)가 자동 소멸되므로
// 다음 새 탭 접속 시 restoreSession에서 localStorage 세션을 정리함
// pagehide에서 직접 삭제하면 F5 새로고침 시에도 세션이 지워지는 문제 발생하므로 제거
// loginModal 클릭 이벤트는 auth.js initAuthHTML에서 등록

/* ─── 유료회원 발주서 저장/조회 ─── */
function saveOrderForPro(){
  var proGrades = ['팀장','기능장','기술사'];
  if(!currentUser || proGrades.indexOf(currentUser.grade)===-1){ alert('팀장 이상 회원 전용 기능입니다.'); return; }
  const allPages=orderPages.filter(function(p){ return p.items.length>0; });
  if(!allPages.length){ alert('저장할 발주 목록이 없습니다.'); return; }
  const record={
    id: Date.now(),
    date: new Date().toISOString().slice(0,10),
    userId: currentUser.id,
    pages: JSON.parse(JSON.stringify(allPages))
  };
  savedOrders.push(record);
  localStorage.setItem('savedOrders', JSON.stringify(savedOrders));
  alert('발주서가 저장됐습니다. ('+record.date+')');
}
function showSavedOrders(){
  const myOrders=savedOrders.filter(function(o){ return o.userId===currentUser.id; });
  if(!myOrders.length){ alert('저장된 발주서가 없습니다.'); return; }
  var list=myOrders.map(function(o,i){
    var totalItems=o.pages.reduce(function(s,p){ return s+p.items.length; },0);
    return (i+1)+'. '+o.date+' — '+totalItems+'품목 ('+o.pages.length+'페이지)';
  }).join('\n');
  alert('저장된 발주서:\n\n'+list+'\n\n(상세 조회 기능은 서버 연동 후 제공됩니다)');
}

/* ─── DB 업로드/다운로드 (관리자 전용) ─── */
async function uploadDB(input){
  if(!isAdmin){ alert('관리자만 사용 가능합니다.'); return; }
  var file=input.files[0]; if(!file) return;

  if(!confirm('기존 자재 DB를 전체 삭제하고 업로드한 파일로 교체합니다.\n계속하시겠습니까?')) {
    input.value=''; return;
  }

  var reader=new FileReader();
  reader.onload=async function(e){
    try{
      var wb=XLSX.read(e.target.result,{type:'binary'});
      var ws=wb.Sheets['자재_DB']||wb.Sheets[wb.SheetNames[0]];
      var data=XLSX.utils.sheet_to_json(ws,{defval:''});
      var serverRows=[];
      var newDB=[];

      data.forEach(function(row){
        if(!row['자재명']) return;
        var uf=String(row['단위from']||'').trim();
        var ut=String(row['단위to']||'').trim();
        var ur=parseFloat(row['환산율'])||0;
        var unitConv = (uf&&ut&&ur) ? {from:uf,to:ut,rate:ur} : null;
        var aliases=(row['별칭(쉼표구분)']||row['별칭']||'').split(',').map(function(s){return s.trim();}).filter(Boolean);
        var tags=(row['태그(쉼표구분)']||row['태그']||'').split(',').map(function(s){return s.trim();}).filter(Boolean);
        var specs=(row['규격(쉼표구분)']||row['규격']||'').split(',').map(function(s){return s.trim();}).filter(Boolean);

        var item={
          cat:row['대분류']||'기타', sub:row['소분류']||'',
          name:row['자재명'], aliases:aliases, tags:tags,
          desc:row['설명']||'', badge:'badge-pipe', specs:specs
        };
        if(unitConv) item.unitConv=unitConv;
        newDB.push(item);

        serverRows.push({
          name:row['자재명'], cat:row['대분류']||'기타', sub:row['소분류']||'',
          aliases:aliases, tags:tags, desc:row['설명']||'', specs:specs,
          unitFrom:uf, unitTo:ut, unitRate:ur
        });
      });

      // 기존 DB 전체 교체
      DB.length = 0;
      newDB.forEach(function(item){ DB.push(item); });

      // 서버 DB 저장 (replace 모드)
      try {
        var res = await fetch(SERVER_DB_PHP, {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({pw:ADMIN_PW, items:serverRows, replace:true})
        });
        var result = await res.json();
        alert('✅ DB 교체 완료\n총 '+DB.length+'개 자재\n서버 저장 완료 (추가:'+result.added+' 수정:'+result.updated+')');
      } catch(err2) {
        alert('✅ DB 교체 완료\n총 '+DB.length+'개 자재\n⚠️ 서버 저장 실패 (로컬만 반영됨)');
      }
      doSearch();
    } catch(err){ alert('파일 읽기 오류: '+err.message); }
  };
  reader.readAsBinaryString(file);
  input.value='';
}
function downloadDB(){
  if(!isAdmin){ alert('관리자만 사용 가능합니다.'); return; }
  var ws_data=[['자재명','대분류','소분류','별칭','태그','설명','규격']];
  DB.forEach(function(d){
    ws_data.push([d.name, d.cat||'', d.sub||'', (d.aliases||[]).join(','), (d.tags||[]).join(','), d.desc||'', (d.specs||[]).join(',')]);
  });
  var wb=XLSX.utils.book_new();
  var ws=XLSX.utils.aoa_to_sheet(ws_data);
  XLSX.utils.book_append_sheet(wb,'자재_DB',ws);
  // 입력 가이드 시트
  var guide=[['컬럼명','설명','예시'],['자재명','필수. 정식 자재명','백관'],['대분류','배관/전기/소방 등','배관'],['소분류','강관류/합성수지관 등','강관류'],['별칭','현장용어, 쉼표 구분','아연도강관,GI파이프'],['태그','검색 태그, 쉼표 구분','설비,KS D 3507'],['설명','자재 설명','아연도금 강관'],['규격','규격 목록, 쉼표 구분','15A,20A,25A,32A']];
  var ws2=XLSX.utils.aoa_to_sheet(guide);
  XLSX.utils.book_append_sheet(wb,'입력_가이드',ws2);
  XLSX.writeFile(wb,'설비트리거_자재DB.xlsx');
}

/* ─── 사진 붙여넣기 모달 ─── */
function openPasteModal(matName, cardId){
  if(!isAdmin) return;
  pasteTargetName=matName;
  pasteTargetId=cardId;
  pendingImageData=null;
  document.getElementById('pasteModalTitle').textContent=`사진 등록 — ${matName}`;
  const pa=document.getElementById('pasteArea');
  pa.classList.remove('has-img');
  document.getElementById('pastePreview').src='';
  document.getElementById('btnPasteSave').disabled=true;
  document.getElementById('pasteModal').classList.add('show');
  setTimeout(()=>pa.focus(),100);
}
function closePasteModal(){
  document.getElementById('pasteModal').classList.remove('show');
  pendingImageData=null;
}
// pasteModal/pasteArea/fileInput 이벤트는 initSearchHTML() 안에서 등록

// Ctrl+V 붙여넣기 감지 (전역 - DOM 요소 불필요하므로 여기서 등록 가능)
document.addEventListener('paste',function(e){
  if(!isAdmin) return;
  const modal=document.getElementById('pasteModal');
  if(!modal || !modal.classList.contains('show')) return;
  const items=e.clipboardData?.items;
  if(!items) return;
  for(let item of items){
    if(item.type.startsWith('image/')){
      const blob=item.getAsFile();
      const reader=new FileReader();
      reader.onload=function(ev){
        pendingImageData=ev.target.result;
        setPreviewImage(pendingImageData);
      };
      reader.readAsDataURL(blob);
      break;
    }
  }
});

function setPreviewImage(dataUrl){
  const preview=document.getElementById('pastePreview');
  preview.src=dataUrl;
  document.getElementById('pasteArea').classList.add('has-img');
  document.getElementById('btnPasteSave').disabled=false;
}

async function savePasteImage(){
  if(!pendingImageData||!pasteTargetName) return;

  var btn = document.getElementById('btnPasteSave');
  if(btn){ btn.disabled=true; btn.textContent='저장 중...'; }

  // 서버에 업로드 시도
  var serverPath = null;
  try {
    var res = await fetch(SERVER_IMG_PHP + '?action=save', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({pw: ADMIN_PW, name: pasteTargetName, image: pendingImageData})
    });
    var data = await res.json();
    if (data.ok) {
      serverPath = data.path + '?t=' + Date.now(); // 캐시 방지
    } else {
      console.warn('서버 저장 실패:', data.msg);
    }
  } catch(e) {
    console.warn('서버 연결 실패 (로컬 모드로 동작):', e.message);
  }

  // matImages에 저장 (서버 경로 우선, 실패 시 base64)
  matImages[pasteTargetName] = serverPath || pendingImageData;

  // 카드 이미지 즉시 업데이트
  const wrap = document.getElementById('imgWrap-'+pasteTargetId);
  if(wrap){
    var src = serverPath || pendingImageData;
    wrap.innerHTML = '<img src="'+src+'" alt="'+pasteTargetName+'" style="width:100%;height:100%;object-fit:cover">'
      + '<div class="img-admin-hint"><span>클릭하여<br>사진 변경</span></div>';
  }

  if(btn){ btn.disabled=false; btn.textContent='저장'; }
  closePasteModal();

  if(serverPath) {
    // 저장 완료 알림 (2초 후 자동 사라짐)
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1A6B3A;color:#fff;padding:10px 18px;border-radius:6px;font-size:13px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,.2)';
    toast.textContent = '✅ ' + pasteTargetName + ' 이미지가 서버에 저장됐습니다';
    document.body.appendChild(toast);
    setTimeout(function(){ toast.remove(); }, 2500);
  }
}

// searchInput 이벤트는 initSearchHTML() 안에서 등록

/* ─── 커뮤니티 데이터 ─── */
const COMM_CATS = [
  {name:"설비 게시판",icon:"설비",cls:"ic-설비",desc:"배관·위생·공조 설비",
   qa:[{t:"볼밸브 D25 vs D32 현장 선택 기준",v:842,r:34},{t:"스모렌스키 설치 방향 질문",v:621,r:21},{t:"바닥난방 배관 피치 기준",v:534,r:18},{t:"급탕 배관 단열재 두께 선정",v:489,r:15}],
   data:[{t:"설비 배관 KS 규격 정리 2024",v:1240,r:67},{t:"냉매 배관 시공 체크리스트",v:987,r:52},{t:"스프링클러 헤드 종류별 비교표",v:876,r:44}]},
  {name:"전기 게시판",icon:"전",cls:"ic-전기",desc:"전선·배선·수변전 설비",
   qa:[{t:"CV케이블과 FR-CV 차이 알려주세요",v:754,r:28},{t:"분전반 설치 간격 기준",v:612,r:22},{t:"접지봉 매설 깊이 질문",v:412,r:14},{t:"전선관 굵기 선정 방법",v:389,r:19}],
   data:[{t:"전선 규격 선정 기준표",v:1120,r:58},{t:"전기 도면 기호 정리집",v:934,r:47},{t:"분전반 결선 순서 메뉴얼",v:812,r:39}]},
  {name:"골조 게시판",icon:"골",cls:"ic-골조",desc:"철근·거푸집·콘크리트",
   qa:[{t:"철근 피복두께 현장 관리 팁",v:938,r:45},{t:"거푸집 해체 시기 기준",v:721,r:31},{t:"슬래브 두께 선정 기준",v:634,r:27},{t:"D10 vs D13 사용 기준",v:512,r:20}],
   data:[{t:"콘크리트 배합 설계 기준 정리",v:1380,r:72},{t:"철근 이음·정착 길이 계산표",v:1102,r:61},{t:"양생 기간 날씨별 정리표",v:876,r:43}]},
  {name:"내장 게시판",icon:"내",cls:"ic-내장",desc:"석고보드·타일·도장·마감",
   qa:[{t:"석고보드 두께별 용도 정리",v:567,r:22},{t:"경량철골 간격 기준 LGS",v:489,r:18},{t:"타일 접착제 종류 비교",v:412,r:15},{t:"도장 공정 순서 질문",v:378,r:17}],
   data:[{t:"내장재 종류별 특성 비교표",v:923,r:48},{t:"타일 시공 하자 유형 정리",v:789,r:36},{t:"도장 공정 순서 메뉴얼",v:654,r:29}]},
  {name:"소방 게시판",icon:"소",cls:"ic-소방",desc:"스프링클러·소화전·감지기",
   qa:[{t:"스프링클러 헤드 교체 기준",v:634,r:26},{t:"감지기 설치 간격 법정 기준",v:521,r:21},{t:"옥내소화전 방수압력 기준",v:445,r:17}],
   data:[{t:"소방 설비 법정 설치 기준 정리",v:1240,r:64},{t:"스프링클러 시스템 종류 비교",v:987,r:51},{t:"소방 점검 체크리스트",v:834,r:40}]},
  {name:"토목 게시판",icon:"토",cls:"ic-토목",desc:"토공·기초·도로·상하수도",
   qa:[{t:"PHC파일 시공 시 주의사항",v:456,r:18},{t:"기초 터파기 경사면 기준",v:389,r:14},{t:"상수도 PE관 매설 기준",v:334,r:12}],
   data:[{t:"토목 재료 규격 정리표",v:876,r:42},{t:"기초 공법 종류 비교",v:712,r:35},{t:"상하수도 배관 시공 기준",v:589,r:27}]},
];

/* ─── 구인구직 데이터 ─── */
const JOBS=[
  {type:"구인",title:"설비 배관공 구인",company:"(주)한국설비",region:"서울",job:"설비",career:"경력 3년 이상",pay:"협의",date:"2025.03.12"},
  {type:"구직",title:"설비 시공 경력 10년 구직",company:"개인",region:"경기",job:"설비",career:"경력 10년",pay:"면담 후 결정",date:"2025.03.11"},
  {type:"구인",title:"전기 기사 자격증 보유자 우대",company:"대성전기(주)",region:"부산",job:"전기",career:"경력 5년 이상",pay:"월 400만원~",date:"2025.03.10"},
  {type:"구인",title:"철근 콘크리트 반장 구인",company:"삼호건설",region:"인천",job:"골조",career:"경력 7년 이상",pay:"협의",date:"2025.03.10"},
  {type:"구직",title:"내장 목수 경력 8년 구직",company:"개인",region:"서울",job:"내장",career:"경력 8년",pay:"면담 후 결정",date:"2025.03.09"},
  {type:"구인",title:"소방 설비 전문 기술자 모집",company:"소방기술(주)",region:"대전",job:"소방",career:"소방 기사 자격 필수",pay:"월 380만원~",date:"2025.03.09"},
  {type:"구인",title:"토목 현장 소장 구인",company:"강남토건",region:"경기",job:"토목",career:"경력 15년 이상",pay:"협의",date:"2025.03.08"},
  {type:"구직",title:"전기 공사 기사 구직합니다",company:"개인",region:"대구",job:"전기",career:"경력 6년",pay:"면담 후 결정",date:"2025.03.08"},
  {type:"구인",title:"스프링클러 전문 시공자 모집",company:"안전소방(주)",region:"광주",job:"소방",career:"경력 3년 이상",pay:"일당 협의",date:"2025.03.07"},
  {type:"구인",title:"공조 설비 기사 급구",company:"(주)클린에어",region:"서울",job:"설비",career:"경력 5년 이상",pay:"월 420만원~",date:"2025.03.07"},
];

let filters={type:'전체',region:'전체',job:'전체'};
function setFilter(key,val,el){
  filters[key]=val;
  const groupId={type:'typeFilter',region:'regionFilter',job:'jobFilter'}[key];
  document.getElementById(groupId).querySelectorAll('.job-filter-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  renderJobs();
}
function renderJobs(){
  let list=JOBS.filter(j=>{
    if(filters.type!=='전체'&&j.type!==filters.type) return false;
    if(filters.region!=='전체'&&j.region!==filters.region) return false;
    if(filters.job!=='전체'&&j.job!==filters.job) return false;
    return true;
  });
  const el=document.getElementById('jobList');
  if(!list.length){el.innerHTML='<div class="no-result">조건에 맞는 공고가 없습니다.</div>';return;}
  el.innerHTML=list.map((j,idx)=>`<div class="job-card">
    <div class="job-card-top">
      <div>
        <div class="job-badge-wrap" style="margin-bottom:6px">
          <span class="job-badge jb-type-${j.type}">${j.type}</span>
          <span class="job-badge jb-region">${j.region}</span>
          <span class="job-badge jb-job">${j.job}</span>
        </div>
        <div class="job-title">${j.title}</div>
        <div class="job-company">${j.company}</div>
      </div>
      <div class="job-btn-wrap">
        <button class="btn-job-detail" onclick="openJobDetail(${JOBS.indexOf(j)})">상세 보기</button>
        <button class="btn-job-contact">연락하기</button>
      </div>
    </div>
    <div class="job-card-info">
      <div class="job-info-item">경력 <strong>${j.career}</strong></div>
      <div class="job-info-item">급여 <strong>${j.pay}</strong></div>
      <div class="job-info-item">등록일 <strong>${j.date}</strong></div>
    </div>
  </div>`).join('');
}

/* ─── 페이지 전환 ─── */
function showPage(id, skipHistory){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  document.querySelectorAll('nav a').forEach(a=>a.classList.remove('active'));
  const navMap={search:'nav-search',community:'nav-community',job:'nav-job',company:'nav-company',notice:'nav-notice',board:'nav-board',news:'nav-news',safety:'nav-safety',docs:'nav-docs',mypage:'nav-mypage',help:'nav-help',photopage:'nav-photopage',matlist:'nav-matlist',scrap:'nav-scrap'};
  const navEl=document.getElementById(navMap[id]);
  if(navEl) navEl.classList.add('active');
  window.scrollTo(0,0);
  if(id==='community') switchCommTab('all');
  if(id==='job') renderJobs();
  if(id==='company') renderCompanies();
  if(id==='notice') renderNotices();
  if(id==='news') renderNews();
  if(id==='safety') renderSafety();
  if(id==='docs') renderDocs();
  if(id==='matlist'){ switchMatListTab('mat'); }
  if(id==='photopage'){ var d=document.getElementById('pp-common-date');if(d&&!d.value)d.value=new Date().toISOString().split('T')[0]; renderPhotoList(); }
  if(id==='mypage') renderMypage();
  if(id==='help') renderHelp();
  if(id==='scrap') renderScrap();
  // 브라우저 히스토리에 추가 (뒤로가기 지원)
  if(!skipHistory) history.pushState({page:id}, '', '#'+id);
}
// 뒤로가기/앞으로가기 처리
window.addEventListener('popstate', function(e){
  var id = (e.state && e.state.page) ? e.state.page : 'search';
  // 서브페이지는 상위 페이지로
  if(id==='post-detail'){   showPage('community', true); return; }
  if(id==='job-detail'){    showPage('job', true); return; }
  if(id==='notice-detail'){ showPage('search', true); return; }
  showPage(id, true);
});
// 초기화는 initSearchHTML() 안에서 처리


/* ══════════════════════════════════════════════
   자재검색/기타페이지 HTML 초기화
══════════════════════════════════════════════ */
function initSearchHTML(){
  document.getElementById('page-search').innerHTML = `
  <section class="hero">
    <div class="hero-label">🏗️ 건설 전문 플랫폼</div>
    <h1>건축설비 현장용어 검색</h1>
    <p>현장 용어·별칭·약어 모두 인식 — 어떤 이름으로 입력해도 정확하게 찾아드립니다</p>
    <div class="search-wrap">
      <div class="search-box">
        <input type="text" id="searchInput" placeholder="자재명,현장용어 입력  (예: 백관, 스모렌스키,횡주관,플러싱...)">
        <button class="search-btn" onclick="doSearch()">검색</button>
      </div>
      <div class="search-hint">
        <span class="hint-label">자주 찾는 자재:</span>
        ${getTopSearches().map(t=>`<span class="hint-tag" onclick="setSearch('${t}')">${t}</span>`).join('')}
      </div>
    </div>
  </section>

  <div class="category-bar">
    <div class="cat-bar-inner">

      <div class="cat-item active" id="catAll" onclick="filterCat(this,'전체')">전체</div>

      <div class="cat-dropdown" id="dd-설비" onmouseenter="openDrop('설비')" onmouseleave="scheduleDrop('설비')">
        <button class="cat-dropdown-btn" id="btn-설비" onclick="filterCat(this,'설비')">설비 <span class="cat-arrow">▼</span></button>
        <div class="cat-submenu" id="sub-설비" onmouseenter="cancelDrop('설비')" onmouseleave="scheduleDrop('설비')">
          <div class="cat-submenu-item" onclick="filterSubCat(this,'배관')"><span class="cat-sub-dot"></span>배관 / 관부속</div>
          <div class="cat-submenu-item" onclick="filterSubCat(this,'밸브')"><span class="cat-sub-dot"></span>밸브류</div>
          <div class="cat-submenu-item" onclick="filterSubCat(this,'덕트')"><span class="cat-sub-dot"></span>덕트류</div>
          <div class="cat-submenu-item" onclick="filterSubCat(this,'보온재')"><span class="cat-sub-dot"></span>보온재</div>
          <div class="cat-submenu-item" onclick="filterSubCat(this,'위생도기')"><span class="cat-sub-dot"></span>위생도기</div>
          <div class="cat-submenu-item" onclick="filterSubCat(this,'펌프')"><span class="cat-sub-dot"></span>펌프 / 기계</div>
          <div class="cat-submenu-item" onclick="filterSubCat(this,'계측')"><span class="cat-sub-dot"></span>계측기기</div>
        </div>
      </div>

      <div class="cat-dropdown" id="dd-전기" onmouseenter="openDrop('전기')" onmouseleave="scheduleDrop('전기')">
        <button class="cat-dropdown-btn" id="btn-전기" onclick="filterCat(this,'전기')">전기 <span class="cat-arrow">▼</span></button>
        <div class="cat-submenu" id="sub-전기" onmouseenter="cancelDrop('전기')" onmouseleave="scheduleDrop('전기')">
          <div class="cat-submenu-item" onclick="filterSubCat(this,'전선')"><span class="cat-sub-dot"></span>전선 / 케이블</div>
          <div class="cat-submenu-item" onclick="filterSubCat(this,'전선관')"><span class="cat-sub-dot"></span>전선관</div>
          <div class="cat-submenu-item" onclick="filterSubCat(this,'배전')"><span class="cat-sub-dot"></span>배전반 / 분전반</div>
          <div class="cat-submenu-item" onclick="filterSubCat(this,'조명')"><span class="cat-sub-dot"></span>조명기구</div>
        </div>
      </div>

      <div class="cat-dropdown" id="dd-소방" onmouseenter="openDrop('소방')" onmouseleave="scheduleDrop('소방')">
        <button class="cat-dropdown-btn" id="btn-소방" onclick="filterCat(this,'소방')">소방 <span class="cat-arrow">▼</span></button>
        <div class="cat-submenu" id="sub-소방" onmouseenter="cancelDrop('소방')" onmouseleave="scheduleDrop('소방')">
          <div class="cat-submenu-item" onclick="filterSubCat(this,'스프링클러')"><span class="cat-sub-dot"></span>스프링클러</div>
          <div class="cat-submenu-item" onclick="filterSubCat(this,'소화전')"><span class="cat-sub-dot"></span>소화전</div>
          <div class="cat-submenu-item" onclick="filterSubCat(this,'소화기')"><span class="cat-sub-dot"></span>소화기</div>
          <div class="cat-submenu-item" onclick="filterSubCat(this,'감지기')"><span class="cat-sub-dot"></span>감지기 / 경보</div>
        </div>
      </div>

    </div>
  </div>

  <div class="main">
    <div class="result-header">
      <div class="result-count">검색결과 <strong id="cntNum">0건</strong> — <span id="cntLabel" style="color:var(--text-light)">자재명을 검색하세요</span></div>
      <select class="sort-select"><option>이름순</option><option>많이 찾는 순</option><option>최근 등록순</option></select>
    </div>
    <div class="alias-notice" id="aliasNotice"></div>
    <div id="homeNoticeArea">
      <div style="margin-bottom:24px;background:#fff;border:1.5px solid var(--border-light);border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow-sm)">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 22px;border-bottom:1px solid var(--border-light);background:var(--surface)">
          <div style="font-size:15px;font-weight:700;display:flex;align-items:center;gap:8px"><span style="width:4px;height:16px;background:var(--orange);border-radius:2px;display:inline-block"></span>공지사항</div>
          <button onclick="showPage('notice')" style="font-size:12px;color:var(--orange);background:none;border:none;cursor:pointer;font-family:'Noto Sans KR',sans-serif;font-weight:600">전체보기 →</button>
        </div>
        <div id="homeNoticeList" style="padding:8px 0"></div>
      </div>
    </div>
<div class="material-list" id="materialList" style="display:none">
      <div class="no-result">위 검색창에 자재명을 입력하거나 힌트 태그를 클릭해보세요</div>
    </div>

    <!-- 발주목록 패널 -->
    <div class="order-panel" id="orderPanel" style="display:none">
      <div class="order-panel-header">
        <div class="order-panel-title">📋 발주 목록</div>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="order-page-tabs" id="orderPageTabs"></div>
          <button class="btn-add-page" onclick="addOrderPage()">+ 페이지 추가</button>
        </div>
      </div>
      <div id="orderPageContents"></div>
      <div class="order-panel-footer">
        <div class="order-total-info">현재 페이지 합계: <strong id="orderTotalM" style="color:#1A6B3A">0</strong>m &nbsp;/&nbsp; <strong id="orderTotalItems">0</strong> 품목</div>
        <div style="display:flex;gap:8px">
          <button class="btn-order-clear" onclick="clearCurrentPage()">현재 페이지 초기화</button>
          <button onclick="saveOrderForPro()" style="padding:8px 14px;background:#2A4A2A;color:#C8F0C8;border:none;border-radius:4px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Noto Sans KR',sans-serif">💾 저장 (PRO)</button>
          <button class="btn-order-submit" onclick="submitOrder()">발주 확정 (PDF)</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 메인 하단 커뮤니티 미리보기 (조회수/추천수 기반 인기글) -->
  <div class="community-section">
    <div class="section-header">
      <div class="section-title">커뮤니티 인기글</div>
      <a class="section-more" onclick="showPage('community')">전체 보기 →</a>
    </div>
    <div class="community-grid">
      <div class="comm-board" onclick="showPage('community')">
        <div class="comm-board-header"><div class="comm-icon ic-설비">설</div><div class="comm-board-name">설비 게시판</div></div>
        <div class="comm-post-list">
          <div class="comm-post"><span class="new"></span><span class="comm-post-title">동파이프 vs 스테인리스 배관 차이점</span><span class="comm-post-stat">조회 842</span></div>
          <div class="comm-post"><span class="comm-post-title">위생도기 시공 순서 여쭤봅니다</span><span class="comm-post-stat">추천 34</span></div>
          <div class="comm-post"><span class="new"></span><span class="comm-post-title">급탕 배관 단열재 추천해주세요</span><span class="comm-post-stat">조회 621</span></div>
          <div class="comm-post"><span class="comm-post-title">바닥난방 배관 피치 기준</span><span class="comm-post-stat">추천 21</span></div>
        </div>
      </div>
      <div class="comm-board" onclick="showPage('community')">
        <div class="comm-board-header"><div class="comm-icon ic-전기">전</div><div class="comm-board-name">전기 게시판</div></div>
        <div class="comm-post-list">
          <div class="comm-post"><span class="new"></span><span class="comm-post-title">CV케이블과 FR-CV 차이 알려주세요</span><span class="comm-post-stat">조회 754</span></div>
          <div class="comm-post"><span class="comm-post-title">분전반 설치 간격 기준</span><span class="comm-post-stat">추천 28</span></div>
          <div class="comm-post"><span class="comm-post-title">접지봉 매설 깊이 질문</span><span class="comm-post-stat">조회 412</span></div>
          <div class="comm-post"><span class="new"></span><span class="comm-post-title">전선관 굵기 선정 방법</span><span class="comm-post-stat">추천 19</span></div>
        </div>
      </div>
      <div class="comm-board" onclick="showPage('community')">
        <div class="comm-board-header"><div class="comm-icon ic-골조">골</div><div class="comm-board-name">골조 게시판</div></div>
        <div class="comm-post-list">
          <div class="comm-post"><span class="new"></span><span class="comm-post-title">철근 피복두께 현장 관리 팁</span><span class="comm-post-stat">조회 938</span></div>
          <div class="comm-post"><span class="comm-post-title">거푸집 해체 시기 기준</span><span class="comm-post-stat">추천 45</span></div>
          <div class="comm-post"><span class="new"></span><span class="comm-post-title">콘크리트 양생 기간 날씨별 정리</span><span class="comm-post-stat">조회 723</span></div>
          <div class="comm-post"><span class="comm-post-title">슬래브 두께 선정 기준</span><span class="comm-post-stat">추천 31</span></div>
        </div>
      </div>
      <div class="comm-board" onclick="showPage('community')">
        <div class="comm-board-header"><div class="comm-icon ic-내장">내</div><div class="comm-board-name">내장 게시판</div></div>
        <div class="comm-post-list">
          <div class="comm-post"><span class="new"></span><span class="comm-post-title">석고보드 두께별 용도 정리</span><span class="comm-post-stat">조회 567</span></div>
          <div class="comm-post"><span class="comm-post-title">경량철골 간격 기준 (LGS)</span><span class="comm-post-stat">추천 22</span></div>
          <div class="comm-post"><span class="comm-post-title">타일 접착제 종류 비교</span><span class="comm-post-stat">조회 489</span></div>
          <div class="comm-post"><span class="new"></span><span class="comm-post-title">도장 공정 순서 질문</span><span class="comm-post-stat">추천 17</span></div>
        </div>
      </div>
    </div>
  </div>
`;
  document.getElementById('page-job').innerHTML = `
  <div class="job-page">
    <div class="job-page-header" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px">
      <div>
        <h2>구인구직</h2>
        <p>지역별·공종별로 필터링하거나 전체 공고를 한 번에 확인하세요.</p>
      </div>
      <button class="btn-post-job">+ 공고 등록</button>
    </div>

    <div class="job-filter-bar">
      <span class="job-filter-label">유형</span>
      <div class="job-filter-group" id="typeFilter">
        <button class="job-filter-btn active" onclick="setFilter('type','전체',this)">전체</button>
        <button class="job-filter-btn" onclick="setFilter('type','구인',this)">구인</button>
        <button class="job-filter-btn" onclick="setFilter('type','구직',this)">구직</button>
      </div>
      <div class="job-filter-divider"></div>
      <span class="job-filter-label">지역</span>
      <div class="job-filter-group" id="regionFilter">
        <button class="job-filter-btn active" onclick="setFilter('region','전체',this)">전체</button>
        <button class="job-filter-btn" onclick="setFilter('region','서울',this)">서울</button>
        <button class="job-filter-btn" onclick="setFilter('region','경기',this)">경기</button>
        <button class="job-filter-btn" onclick="setFilter('region','인천',this)">인천</button>
        <button class="job-filter-btn" onclick="setFilter('region','부산',this)">부산</button>
        <button class="job-filter-btn" onclick="setFilter('region','대구',this)">대구</button>
        <button class="job-filter-btn" onclick="setFilter('region','대전',this)">대전</button>
        <button class="job-filter-btn" onclick="setFilter('region','광주',this)">광주</button>
        <button class="job-filter-btn" onclick="setFilter('region','기타',this)">기타</button>
      </div>
      <div class="job-filter-divider"></div>
      <span class="job-filter-label">공종</span>
      <div class="job-filter-group" id="jobFilter">
        <button class="job-filter-btn active" onclick="setFilter('job','전체',this)">전체</button>
        <button class="job-filter-btn" onclick="setFilter('job','설비',this)">설비</button>
        <button class="job-filter-btn" onclick="setFilter('job','전기',this)">전기</button>
        <button class="job-filter-btn" onclick="setFilter('job','골조',this)">골조</button>
        <button class="job-filter-btn" onclick="setFilter('job','내장',this)">내장</button>
        <button class="job-filter-btn" onclick="setFilter('job','소방',this)">소방</button>
        <button class="job-filter-btn" onclick="setFilter('job','토목',this)">토목</button>
      </div>
    </div>

    <div class="job-list" id="jobList"></div>
  </div>
`;
  document.getElementById('page-company').innerHTML = `
  <div style="max-width:1200px;margin:0 auto;padding:32px 40px">
    <div style="margin-bottom:28px">
      <h2 style="font-size:24px;font-weight:700;margin-bottom:6px">업체 정보</h2>
      <p style="font-size:14px;color:var(--text-mid)">건설자재 공급 업체 정보를 확인하세요. 공종별·지역별 필터를 활용해보세요.</p>
    </div>
    <!-- 필터 바 -->
    <div style="background:var(--white);border:1px solid var(--border);border-radius:6px;padding:16px 20px;margin-bottom:20px;display:flex;gap:16px;flex-wrap:wrap;align-items:center">
      <span style="font-size:12px;font-weight:700;color:var(--text-mid)">공종</span>
      <div style="display:flex;gap:6px;flex-wrap:wrap" id="companyFilter">
        <button class="job-filter-btn active" onclick="setCompanyFilter(this,'전체')">전체</button>
        <button class="job-filter-btn" onclick="setCompanyFilter(this,'설비')">설비</button>
        <button class="job-filter-btn" onclick="setCompanyFilter(this,'전기')">전기</button>
        <button class="job-filter-btn" onclick="setCompanyFilter(this,'골조')">골조</button>
        <button class="job-filter-btn" onclick="setCompanyFilter(this,'내장')">내장</button>
        <button class="job-filter-btn" onclick="setCompanyFilter(this,'소방')">소방</button>
        <button class="job-filter-btn" onclick="setCompanyFilter(this,'토목')">토목</button>
      </div>
      <div style="width:1px;background:var(--border);height:28px"></div>
      <span style="font-size:12px;font-weight:700;color:var(--text-mid)">지역</span>
      <div style="display:flex;gap:6px;flex-wrap:wrap" id="companyRegionFilter">
        <button class="job-filter-btn active" onclick="setCompanyRegionFilter(this,'전체')">전체</button>
        <button class="job-filter-btn" onclick="setCompanyRegionFilter(this,'서울')">서울</button>
        <button class="job-filter-btn" onclick="setCompanyRegionFilter(this,'경기')">경기</button>
        <button class="job-filter-btn" onclick="setCompanyRegionFilter(this,'인천')">인천</button>
        <button class="job-filter-btn" onclick="setCompanyRegionFilter(this,'부산')">부산</button>
        <button class="job-filter-btn" onclick="setCompanyRegionFilter(this,'기타')">기타</button>
      </div>
    </div>
    <div id="companyList" style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px"></div>
  </div>
`;
  document.getElementById('page-notice').innerHTML = `
  <div style="max-width:900px;margin:0 auto;padding:32px 40px">
    <div style="margin-bottom:28px">
      <h2 style="font-size:24px;font-weight:700;margin-bottom:6px">공지사항</h2>
      <p style="font-size:14px;color:var(--text-mid)">콘스토어 서비스 업데이트 및 중요 공지를 확인하세요.</p>
    </div>
    <div style="background:var(--white);border:1px solid var(--border);border-radius:6px;overflow:hidden" id="noticeList"></div>
  </div>
`;
  document.getElementById('page-news').innerHTML = `
  <div style="max-width:960px;margin:0 auto;padding:32px 40px">
    <div style="margin-bottom:28px">
      <h2 style="font-size:24px;font-weight:700;margin-bottom:6px">건설뉴스</h2>
      <p style="font-size:14px;color:var(--text-mid)">건설업계 최신 뉴스와 정책 동향을 확인하세요.</p>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px" id="newsList"></div>
  </div>
`;
  document.getElementById('page-safety').innerHTML = `
  <div style="max-width:960px;margin:0 auto;padding:32px 40px">
    <div style="margin-bottom:28px">
      <h2 style="font-size:24px;font-weight:700;margin-bottom:6px">건설안전</h2>
      <p style="font-size:14px;color:var(--text-mid)">현장 안전 지침, 법령, 사고사례를 확인하고 안전한 현장을 만드세요.</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-bottom:32px">
      <div style="background:#FFF3CD;border:1px solid #FFD700;border-radius:8px;padding:20px">
        <div style="font-size:24px;margin-bottom:8px">⚠️</div>
        <div style="font-size:14px;font-weight:700;margin-bottom:4px">안전 신호</div>
        <div style="font-size:12px;color:var(--text-mid)">황색: 주의 / 적색: 위험 / 녹색: 안전</div>
      </div>
      <div style="background:#FFE4E4;border:1px solid #FF6B6B;border-radius:8px;padding:20px">
        <div style="font-size:24px;margin-bottom:8px">🚨</div>
        <div style="font-size:14px;font-weight:700;margin-bottom:4px">응급연락처</div>
        <div style="font-size:12px;color:var(--text-mid)">산재신고: 1588-0075 / 소방: 119 / 경찰: 112</div>
      </div>
      <div style="background:#E8F5E9;border:1px solid #4CAF50;border-radius:8px;padding:20px">
        <div style="font-size:24px;margin-bottom:8px">📋</div>
        <div style="font-size:14px;font-weight:700;margin-bottom:4px">안전관리자 선임기준</div>
        <div style="font-size:12px;color:var(--text-mid)">상시 50인 이상 또는 공사금액 120억 이상</div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px" id="safetyList"></div>
  </div>
`;
  document.getElementById('page-job-detail').innerHTML = `
  <div style="max-width:800px;margin:0 auto;padding:32px 40px">
    <button onclick="showPage('job')" style="display:flex;align-items:center;gap:6px;background:none;border:none;color:var(--text-mid);font-size:13px;cursor:pointer;font-family:'Noto Sans KR',sans-serif;margin-bottom:24px;padding:0">← 구인구직 목록으로</button>
    <div id="jobDetailContent"></div>
  </div>
`;
  document.getElementById('page-post-detail').innerHTML = `
  <div style="max-width:800px;margin:0 auto;padding:32px 40px">
    <button onclick="showPage('community')" style="display:flex;align-items:center;gap:6px;background:none;border:none;color:var(--text-mid);font-size:13px;cursor:pointer;font-family:'Noto Sans KR',sans-serif;margin-bottom:24px;padding:0">← 커뮤니티로</button>
    <div id="postDetailContent"></div>
  </div>
`;
  document.getElementById('page-notice-detail').innerHTML = `
  <div style="max-width:800px;margin:0 auto;padding:32px 40px">
    <button onclick="showPage('notice')" style="display:flex;align-items:center;gap:6px;background:none;border:none;color:var(--text-mid);font-size:13px;cursor:pointer;font-family:'Noto Sans KR',sans-serif;margin-bottom:24px;padding:0">← 공지사항으로</button>
    <div id="noticeDetailContent"></div>
  </div>
`;
  document.getElementById('pasteModal').innerHTML = `
  <div class="paste-modal">
    <div class="paste-modal-head">
      <h3 id="pasteModalTitle">사진 등록</h3>
      <button class="paste-modal-close" onclick="closePasteModal()">✕</button>
    </div>
    <div class="paste-modal-body">
      <div class="paste-area" id="pasteArea" tabindex="0">
        <div class="paste-hint">
          <div class="paste-hint-icon">📋</div>
          <p>윈도우 캡처 후 <strong>Ctrl+V</strong> 로 붙여넣기</p>
          <small>또는 클릭하여 이미지 파일 선택</small>
        </div>
        <img id="pastePreview" src="" alt="미리보기">
      </div>
      <input type="file" id="fileInput" accept="image/*" style="display:none">
    </div>
    <div class="paste-modal-footer">
      <button class="btn-paste-cancel" onclick="closePasteModal()">취소</button>
      <button class="btn-paste-save" id="btnPasteSave" onclick="savePasteImage()" disabled>저장</button>
    </div>
  </div>
`;
  var pm=document.getElementById('pasteModal'); if(pm) pm.addEventListener('click',function(e){ if(e.target===this) closePasteModal(); });

  // searchInput 엔터키 이벤트 등록 (HTML 생성 후)
  var si = document.getElementById('searchInput');
  if(si) si.addEventListener('keydown', function(e){ if(e.key==='Enter') doSearch(); });

  // 초기 진입 시 해시 처리 + 서버 데이터 로딩
  var hash = location.hash.replace('#','');
  var valid = ['search','community','job','company','notice','board','news','safety','photopage','matlist','docs','help','mypage'];
  if(hash && valid.indexOf(hash)!==-1) showPage(hash, true);
  else history.replaceState({page:'search'}, '', '#search');

  loadServerData().then(function(){
    var q = document.getElementById('searchInput');
    if(q && q.value.trim()) doSearch();
  });

  // pasteModal/pasteArea/fileInput 이벤트 (HTML 생성 후 등록)
  var pm = document.getElementById('pasteModal');
  if(pm) pm.addEventListener('click', function(e){ if(e.target===this) closePasteModal(); });

  var pa = document.getElementById('pasteArea');
  if(pa) pa.addEventListener('click', function(){ document.getElementById('fileInput').click(); });

  var fi = document.getElementById('fileInput');
  if(fi) fi.addEventListener('change', function(){
    var file = this.files[0];
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(ev){ pendingImageData=ev.target.result; setPreviewImage(pendingImageData); };
    reader.readAsDataURL(file);
  });
}
// DOMContentLoaded 시 실행
document.addEventListener('DOMContentLoaded', initSearchHTML);