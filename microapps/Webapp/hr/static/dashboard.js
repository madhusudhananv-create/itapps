// Works out our own mount point from the current URL, so every API call
// below still reaches the right place whether this page is served at the
// site root (direct/local testing) or under a subpath like /hr/
// (proxied through the IT Apps Portal's IIS/Node routing). Without this,
// absolute paths like "/api/dashboard" would resolve against the site ROOT
// instead of our actual mount point, and land on the portal's 404 instead
// of our Flask backend.
const APP_BASE = (function () {
  return window.location.pathname.replace(/\/[^/]*$/, '');
})();

// Every week runs Monday→Sunday (matches the backend's own alignment in
// compliance.py). Picking ANY day in the calendar snaps to that day's
// Monday, then the following Sunday is added automatically — no need to
// pick two dates.
function mondayOfWeek(dateStr){
  const d = new Date(dateStr + 'T00:00:00Z');
  const day = d.getUTCDay(); // Sun=0, Mon=1, ..., Sat=6
  const diff = (day === 0) ? -6 : (1 - day);
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}
function addDays(dateStr, n){
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const SPINNER_HTML = '<span class="spinner-icon"></span>';

let pollTimer = null;
let fastPollTimer = null;
let selectedWeek = 1;
let customRange = null; // {start, end} or null

function storageKeys(){
  return (typeof getStorageKeys === 'function')
    ? getStorageKeys()
    : { tokenKey: 'token', empidKey: 'empid', displaynameKey: 'displayname', logintypeKey: 'logintype', navigateurlKey: 'navigateurl' };
}

function initializeHeaderUser(){
  const keys = storageKeys();
  const displayname = localStorage.getItem(keys.displaynameKey);
  const empid = localStorage.getItem(keys.empidKey);

  const nameEl = document.getElementById('headerUserName');
  if(nameEl){
    nameEl.textContent = displayname || empid || 'User';
  }

  const logoutBtn = document.getElementById('headerLogoutBtn');
  if(logoutBtn){
    logoutBtn.addEventListener('click', ()=>{
      localStorage.removeItem(keys.tokenKey);
      localStorage.removeItem(keys.empidKey);
      localStorage.removeItem(keys.displaynameKey);
      localStorage.removeItem(keys.logintypeKey);
      localStorage.removeItem(keys.navigateurlKey);
      window.location.href = '/login';
    });
  }
}

async function init(){
  initializeHeaderUser();

  let pollMs = 24 * 60 * 60 * 1000; // 24h fallback if /api/config can't be reached at all
  try{
    const cfg = await fetch(APP_BASE + '/api/config').then(r=>r.json());
    pollMs = cfg.pollIntervalMs || pollMs;
  }catch(e){ /* keep default */ }

  document.getElementById('refreshBtn').addEventListener('click', ()=> load(true));
  document.getElementById('weekFilter').addEventListener('change', e=>{
    selectedWeek = parseInt(e.target.value, 10) || 0;
    customRange = null;
    document.getElementById('startDateFilter').value = '';
    document.getElementById('endDateFilter').value = '';
    load(false);
  });
  document.getElementById('applyDateRangeBtn').addEventListener('click', ()=>{
    const start = document.getElementById('startDateFilter').value;
    const end   = document.getElementById('endDateFilter').value;
    if(!start || !end){
      document.getElementById('statusMsg').textContent = 'Please select both a start date and an end date.';
      document.getElementById('statusMsg').classList.add('error');
      return;
    }
    if(start > end){
      document.getElementById('statusMsg').textContent = 'Start date must be on or before the end date.';
      document.getElementById('statusMsg').classList.add('error');
      return;
    }
    customRange = { start, end };
    document.getElementById('weekFilter').value = 'custom';
    load(false);
  });

  load(false);
  if(pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(()=> load(false), pollMs);
}

function startFastPolling(){
  if(fastPollTimer) clearInterval(fastPollTimer);
  let attempts = 0;
  fastPollTimer = setInterval(async ()=>{
    attempts++;
    const stillGoing = await load(false, true);
    if(!stillGoing || attempts >= 90){
      clearInterval(fastPollTimer);
      fastPollTimer = null;
    }
  }, 2000);
}

function currentTimeParams(){
  const params = new URLSearchParams();
  if(customRange){
    params.set('startDate', customRange.start);
    params.set('endDate', customRange.end);
  } else {
    params.set('week', selectedWeek);
  }
  return params;
}

async function load(forceRefresh, isFastPoll){
  const statusMsg = document.getElementById('statusMsg');
  statusMsg.classList.remove('error');
  if(!isFastPoll){
    statusMsg.innerHTML = SPINNER_HTML + (forceRefresh ? ' Refresh requested…' : ' Checking for updates…');
  }
  try{
    const params = currentTimeParams();
    const url = APP_BASE + (forceRefresh ? '/api/refresh' : '/api/dashboard') + '?' + params.toString();
    const resp = await fetch(url, { method: forceRefresh ? 'POST' : 'GET' });
    const payload = await resp.json();

    if(!payload.ok){
      if(payload.refreshing){
        statusMsg.innerHTML = SPINNER_HTML + ' Computing compliance data from Azure…';
        if(!fastPollTimer) startFastPolling();
        return true;
      }
      statusMsg.textContent = payload.error;
      statusMsg.classList.add('error');
      document.getElementById('dashboard').innerHTML = '';
      return false;
    }

    renderDashboard(payload);

    if(!customRange && payload.window && payload.window.length){
      document.getElementById('startDateFilter').value = payload.window[0];
      document.getElementById('endDateFilter').value = payload.window[payload.window.length - 1];
    }

    const checkedStamp = new Date(payload.checkedAt * 1000).toLocaleTimeString();

    if(payload.refreshing){
      statusMsg.innerHTML = SPINNER_HTML + ' Checked ' + checkedStamp + ' — refreshing in the background…';
      if(forceRefresh && !fastPollTimer) startFastPolling();
      return true;
    }
    statusMsg.textContent = payload.historyNote ? payload.historyNote : ('Checked ' + checkedStamp);
    return false;
  }catch(err){
    statusMsg.textContent = 'Could not reach the server: ' + err.message;
    statusMsg.classList.add('error');
    return false;
  }
}

// ---------------------------------------------------------------------------
// Clicking any number opens a dedicated page in a new tab (server-rendered,
// includes an Export to Excel button) instead of a same-page popup.
// ---------------------------------------------------------------------------
function buildViewUrl(category){
  const params = currentTimeParams();
  params.set('category', category);
  if(selectedPractice) params.set('practice', selectedPractice);
  if(selectedSubPractice) params.set('subPractice', selectedSubPractice);
  if(selectedLevel) params.set('level', selectedLevel);
  if(selectedProject) params.set('project', selectedProject);
  if(selectedBusinessUnit) params.set('businessUnit', selectedBusinessUnit);
  if(selectedLocation) params.set('location', selectedLocation);
  if(selectedReportingManager) params.set('reportingManager', selectedReportingManager);
  if(selectedHrbp) params.set('hrbp', selectedHrbp);
  return APP_BASE + '/view?' + params.toString();
}

function viewInNewTab(category){
  window.open(buildViewUrl(category), '_blank');
}

function buildExportUrl(category){
  return APP_BASE + '/export.xlsx?' + buildViewUrl(category).split('?')[1];
}

// ---------------------------------------------------------------------------
// Day-of-week initials for the week-grid cells (S M T W T F S) — the color
// still encodes office/leave/gap/weekend/no-data, only the letter changed.
// ---------------------------------------------------------------------------
const DAY_INITIALS = ['S','M','T','W','T','F','S']; // Sun=0 .. Sat=6

function dayInitial(dateStr){
  const d = new Date(dateStr + 'T00:00:00Z');
  return DAY_INITIALS[d.getUTCDay()];
}

function weekGridHTML(days){
  return '<div class="week-grid">' + days.map(d=>{
    const stateLabel = d.state === 'gap' ? 'WFH' : d.state;
    let tipExtra = '';
    if (d.state === 'office' && d.firstIn) {
      tipExtra = ` \u2014 in ${d.firstIn}`;
      if (d.lastOut) tipExtra += `, out ${d.lastOut}`;
      if (d.hours) tipExtra += ` (${d.hours})`;
    }
    return `<div class="day-cell ${d.state}" title="${d.date}: ${stateLabel}${tipExtra}">${dayInitial(d.date)}</div>`;
  }).join('') + '</div>';
}

function badgeHTML(subStatus){
  if(subStatus === 'compliant') return '<span class="badge compliant">Compliant</span>';
  return '<span class="badge flagged">Non-compliant</span>';
}

// ---------------------------------------------------------------------------
// Column sorting: click any sortable header to sort ascending, click again
// to reverse. One shared sort state applies across every table currently
// shown — if the column doesn't exist on a given table (e.g. sorting by
// "Office Days" while looking at the Client Location list), that table's
// sort is just a harmless no-op.
// ---------------------------------------------------------------------------
let sortKey = null;
let sortDir = 'asc';

function applySort(key){
  if(sortKey === key){
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey = key;
    sortDir = 'asc';
  }
  renderResults();
}

function sortList(list){
  if(!sortKey) return list;
  const key = sortKey;
  const sorted = [...list].sort((a, b)=>{
    let av = a[key], bv = b[key];
    if(typeof av === 'number' && typeof bv === 'number') return av - bv;
    av = (av===undefined || av===null) ? '' : String(av).toLowerCase();
    bv = (bv===undefined || bv===null) ? '' : String(bv).toLowerCase();
    return av.localeCompare(bv);
  });
  return sortDir === 'desc' ? sorted.reverse() : sorted;
}

function sortIconHTML(key){
  if(sortKey !== key) return '<span class="sort-icon">↕</span>';
  return sortDir === 'asc' ? '<span class="sort-icon active">▲</span>' : '<span class="sort-icon active">▼</span>';
}

const COL_FILTER_ICON = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>`;

function tableHeaderHTML(cols){
  return '<tr>' + cols.map(([label, key], idx)=>{
    if(!key) return `<th>${label}</th>`;
    return `<th data-col-idx="${idx}">
      <div class="th-row">
        <span class="sortable-th" onclick="applySort('${key}')">${label} ${sortIconHTML(key)}</span>
        <span class="col-filter-icon" onclick="toggleColFilter(this)" title="Filter ${label}">${COL_FILTER_ICON}</span>
      </div>
      <input type="text" class="col-filter-input" placeholder="Filter…" oninput="reapplyTableFiltersFor(this)">
    </th>`;
  }).join('') + '</tr>';
}

function toggleColFilter(iconEl){
  const th = iconEl.closest('th');
  const input = th.querySelector('.col-filter-input');
  const showing = input.classList.toggle('show');
  if(showing){
    input.focus();
  } else if(input.value){
    input.value = '';
    reapplyTableFiltersFor(input);
  }
}

function reapplyTableFiltersFor(el){
  const table = el.closest('table.roster');
  if(table) reapplyTableFilters(table);
}

// Combines the global search box (matches anywhere in the row) with any
// active per-column filters (matches only that column's cell) — a row only
// shows if it satisfies all of them at once. Runs per-table, so filtering
// one section's "Practice" column never touches any other section.
function reapplyTableFilters(table){
  const searchBox = document.getElementById('searchBox');
  const globalQuery = searchBox ? searchBox.value.trim().toLowerCase() : '';

  const colFilters = [];
  table.querySelectorAll('thead th[data-col-idx]').forEach(th=>{
    const input = th.querySelector('.col-filter-input');
    const q = input ? input.value.trim().toLowerCase() : '';
    if(q) colFilters.push({ idx: parseInt(th.getAttribute('data-col-idx'), 10), query: q });
  });

  table.querySelectorAll('tbody tr').forEach(tr=>{
    let visible = !globalQuery || tr.textContent.toLowerCase().includes(globalQuery);
    if(visible){
      for(const f of colFilters){
        const cell = tr.children[f.idx];
        if(!cell || !cell.textContent.toLowerCase().includes(f.query)){ visible = false; break; }
      }
    }
    tr.style.display = visible ? '' : 'none';
  });
}

function totalHoursFromDays(days) {
  let totalMins = 0;
  for (const d of (days || [])) {
    if (d.state === 'office' && d.hours) {
      const parts = d.hours.split(':');
      if (parts.length === 2) totalMins += parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
  }
  if (!totalMins) return '\u2014';
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

const ROSTER_COLS = [
  ['Employee','name'], ['Practice','practice'], ['Sub Practice','subPractice'], ['Designation','designation'],
  ['Level','level'], ['Project','project'], ['Business Unit','businessUnit'], ['Location','location'],
  ['Reporting Manager','reportingManager'], ['Date of Joining','dateOfJoining'],
  ['Week', null], ['Total Hours', null], ['Office','officeDaysCount'], ['Leave','leaveDaysCount'], ['Status','subStatus']
];

function rosterTable(list){
  if(!list.length) return '<div class="col-config-note">No employees in this group.</div>';
  list = sortList(list);
  return `<div class="table-vscroll"><div class="table-scroll"><table class="roster">
  <thead>${tableHeaderHTML(ROSTER_COLS)}</thead><tbody>` +
  list.map(e=>`<tr class="row-${e.subStatus||''}">
    <td><div class="emp-name">${e.name}</div><div class="emp-id">${e.id}</div></td>
    <td>${e.practice||''}</td>
    <td>${e.subPractice||''}</td>
    <td>${e.designation||''}</td>
    <td>${e.level||''}</td>
    <td>${e.project||''}</td>
    <td>${e.businessUnit||''}</td>
    <td>${e.location||''}</td>
    <td>${e.reportingManager||''}</td>
    <td class="mono">${e.dateOfJoining||'—'}</td>
    <td>${weekGridHTML(e.days)}</td>
    <td class="mono">${totalHoursFromDays(e.days)}</td>
    <td class="mono">${e.officeDaysCount}</td>
    <td class="mono">${e.leaveDaysCount}</td>
    <td>${badgeHTML(e.subStatus)}</td>
  </tr>`).join('') + '</tbody></table></div></div>';
}

const SIMPLE_COLS = [
  ['Employee','name'], ['Org Unit','org'], ['Practice','practice'], ['Sub Practice','subPractice'],
  ['Designation','designation'], ['Level','level'], ['Client Location (State)','clientLocationState'],
  ['Client Location (City)','clientLocationCity'], ['Location','location'], ['Reporting Manager','reportingManager'],
  ['Date of Joining','dateOfJoining']
];

function simpleTable(list){
  if(!list.length) return '<div class="col-config-note">No employees found.</div>';
  list = sortList(list);
  return `<div class="table-vscroll"><div class="table-scroll"><table class="roster">
  <thead>${tableHeaderHTML(SIMPLE_COLS)}</thead><tbody>` +
  list.map(e=>`<tr>
    <td><div class="emp-name">${e.name}</div><div class="emp-id">${e.id}</div></td>
    <td>${e.org||''}</td>
    <td>${e.practice||''}</td>
    <td>${e.subPractice||''}</td>
    <td>${e.designation||''}</td>
    <td>${e.level||''}</td>
    <td>${e.clientLocationState||''}</td>
    <td>${e.clientLocationCity||''}</td>
    <td>${e.location||''}</td>
    <td>${e.reportingManager||''}</td>
    <td class="mono">${e.dateOfJoining||'—'}</td>
  </tr>`).join('') + '</tbody></table></div></div>';
}

const EXCEPTION_COLS = [
  ['Employee','name'], ['Practice','practice'], ['Sub Practice','subPractice'], ['Designation','designation'], ['Level','level'],
  ['Location','location'], ['Reporting Manager','reportingManager'], ['Date of Joining','dateOfJoining'],
  ['WFH Start','wfhStart'], ['WFH End','wfhEnd'],
  ['Employee Reason For Wfh','reason'], ['Employee Detailed Reason','detailedReason']
];

function exceptionTable(list){
  if(!list.length) return '<div class="col-config-note">No employees found.</div>';
  list = sortList(list);
  return `<div class="table-vscroll"><div class="table-scroll"><table class="roster">
  <thead>${tableHeaderHTML(EXCEPTION_COLS)}</thead><tbody>` +
  list.map(e=>`<tr>
    <td><div class="emp-name">${e.name}</div><div class="emp-id">${e.id}</div></td>
    <td>${e.practice||''}</td>
    <td>${e.subPractice||''}</td>
    <td>${e.designation||''}</td>
    <td>${e.level||''}</td>
    <td>${e.location||''}</td>
    <td>${e.reportingManager||''}</td>
    <td class="mono">${e.dateOfJoining||'—'}</td>
    <td class="mono">${e.wfhStart||''}</td>
    <td class="mono">${e.wfhEnd||''}</td>
    <td>${e.reason||''}</td>
    <td>${e.detailedReason||''}</td>
  </tr>`).join('') + '</tbody></table></div></div>';
}

function simpleSection(title, list, tableFn, category){
  return `<section class="bucket">
    <div class="bucket-head">
      <h2 class="display">${title}</h2>
      <span class="count">${list.length} employees</span>
      <a class="export-btn bucket-export-btn" href="${buildExportUrl(category)}">Export (Excel)</a>
    </div>
    ${tableFn(list)}
  </section>`;
}

function bucketSection(title, groupList, category){
  if(!groupList.length){
    return `<section class="bucket"><div class="bucket-head"><h2 class="display">${title}</h2><span class="count">0 employees</span></div></section>`;
  }
  return `<section class="bucket">
    <div class="bucket-head">
      <h2 class="display">${title}</h2>
      <span class="count">${groupList.length} employees</span>
      <a class="export-btn bucket-export-btn" href="${buildExportUrl(category)}">Export (Excel)</a>
    </div>
    ${rosterTable(groupList)}
  </section>`;
}

// ---------------------------------------------------------------------------
// Searchable filter fields: a text input + <datalist> of distinct values.
// Typing filters employees whose field CONTAINS the typed text (case
// insensitive) — not just an exact dropdown pick.
// ---------------------------------------------------------------------------
function searchableFilterHTML(id, labelText, values, selected){
  const listId = id + 'List';
  return `<div class="filter-field">
    <label>${labelText}</label>
    <input type="text" class="searchable-filter" id="${id}" list="${listId}"
           placeholder="All ${labelText.toLowerCase()}s" value="${selected || ''}" autocomplete="off">
    <datalist id="${listId}">
      ${values.map(v=>`<option value="${v}">`).join('')}
    </datalist>
  </div>`;
}

const FILTER_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>`;

function clearAllFilters(){
  selectedPractice = '';
  selectedSubPractice = '';
  selectedLevel = '';
  selectedProject = '';
  selectedBusinessUnit = '';
  selectedLocation = '';
  selectedReportingManager = '';
  selectedHrbp = '';
  ['practiceFilter','subPracticeFilter','levelFilter','projectFilter','businessUnitFilter','locationFilter','reportingManagerFilter','hrbpFilter']
    .forEach(id=>{ const el = document.getElementById(id); if(el) el.value = ''; });
  updateClearButton();
  renderResults();
}

function updateClearButton(){
  const btn = document.getElementById('clearFiltersBtn');
  if(!btn) return;
  const count = [selectedPractice, selectedSubPractice, selectedLevel, selectedProject, selectedBusinessUnit, selectedLocation, selectedReportingManager, selectedHrbp].filter(Boolean).length;
  if(count){
    btn.style.display = '';
    btn.textContent = `✕ Clear filters (${count})`;
  } else {
    btn.style.display = 'none';
  }
}

let lastPayload = null;
let selectedPractice = '';
let selectedSubPractice = '';
let selectedLevel = '';
let selectedProject = '';
let selectedBusinessUnit = '';
let selectedLocation = '';
let selectedReportingManager = '';
let selectedHrbp = '';

function matchField(fieldVal, filterVal){
  if(!filterVal) return true;
  return (fieldVal || 'Not Available').toLowerCase().includes(filterVal.toLowerCase());
}

function renderDashboard(payload){
  lastPayload = payload;
  const window_ = payload.window || [];
  const allEmps = payload.employees || [];
  const clientLocEmps = payload.clientLocationEmployees || [];
  const exceptionEmps = payload.exceptionEmployees || [];
  const el = document.getElementById('dashboard');

  document.getElementById('dateRangeLabel').textContent = window_.length
    ? 'Window: ' + window_[0] + '  →  ' + window_[window_.length-1] + '  ('+window_.length+' days tracked)'
    : 'No dates detected in the current reports';

  if(!allEmps.length && !clientLocEmps.length && !exceptionEmps.length){
    el.innerHTML = '<div class="empty-state"><div class="display">No matching employees found</div>Check the column mapping in config.py — Employee IDs may not be lining up across the reports.</div>';
    return;
  }

  const practiceValues = [...new Set(allEmps.map(e=>e.practice || 'Not Available'))].sort();
  const subPracticeValues = [...new Set(allEmps.map(e=>e.subPractice || 'Not Available'))].sort();
  const levelValues = [...new Set(allEmps.map(e=>e.level || 'Not Available'))].sort();
  const projectValues = [...new Set(allEmps.map(e=>e.project || 'Not Available'))].sort();
  const businessUnitValues = [...new Set(allEmps.map(e=>e.businessUnit || 'Not Available'))].sort();
  const locationValues = [...new Set(allEmps.map(e=>e.location || 'Not Available'))].sort();
  const reportingManagerValues = [...new Set(allEmps.map(e=>e.reportingManager || 'Not Available'))].sort();
  const hrbpValues = [...new Set([...allEmps, ...clientLocEmps, ...exceptionEmps].map(e=>e.hrbp || 'Not Available'))].sort();

  // The filter bar is built exactly once per payload load (or full page load),
  // and is never rebuilt while someone is typing in it — that's what was
  // destroying focus after every single keystroke before. Only #resultsArea
  // gets rebuilt as filters change.
  const filterBar = `<div class="filter-bar">
    <span class="filter-bar-label">${FILTER_ICON} Filters</span>
    <div class="filter-fields-row">
      ${searchableFilterHTML('practiceFilter', 'Practice', practiceValues, selectedPractice)}
      ${searchableFilterHTML('subPracticeFilter', 'Sub Practice', subPracticeValues, selectedSubPractice)}
      ${searchableFilterHTML('hrbpFilter', 'HRBP', hrbpValues, selectedHrbp)}
      ${searchableFilterHTML('levelFilter', 'Level', levelValues, selectedLevel)}
      ${searchableFilterHTML('projectFilter', 'Project', projectValues, selectedProject)}
      ${searchableFilterHTML('businessUnitFilter', 'Business Unit', businessUnitValues, selectedBusinessUnit)}
      ${searchableFilterHTML('locationFilter', 'Location', locationValues, selectedLocation)}
      ${searchableFilterHTML('reportingManagerFilter', 'Reporting Manager', reportingManagerValues, selectedReportingManager)}
      <button class="clear-filters-btn" id="clearFiltersBtn" style="display:none">✕ Clear filters</button>
    </div>
  </div>`;

  el.innerHTML = filterBar + '<div id="resultsArea"></div>';

  const wireFilter = (id, setter) => {
    document.getElementById(id).addEventListener('input', e=>{
      setter(e.target.value);
      updateClearButton();
      renderResults();
    });
  };
  wireFilter('practiceFilter', v=>selectedPractice=v);
  wireFilter('subPracticeFilter', v=>selectedSubPractice=v);
  wireFilter('levelFilter', v=>selectedLevel=v);
  wireFilter('projectFilter', v=>selectedProject=v);
  wireFilter('businessUnitFilter', v=>selectedBusinessUnit=v);
  wireFilter('locationFilter', v=>selectedLocation=v);
  wireFilter('reportingManagerFilter', v=>selectedReportingManager=v);
  wireFilter('hrbpFilter', v=>selectedHrbp=v);
  document.getElementById('clearFiltersBtn').addEventListener('click', clearAllFilters);
  updateClearButton();

  renderResults();
}

function renderResults(){
  const allEmps = lastPayload.employees || [];
  const clientLocEmps = lastPayload.clientLocationEmployees || [];
  const exceptionEmps = lastPayload.exceptionEmployees || [];

  let emps = allEmps.filter(e=>
    matchField(e.practice, selectedPractice) &&
    matchField(e.subPractice, selectedSubPractice) &&
    matchField(e.level, selectedLevel) &&
    matchField(e.project, selectedProject) &&
    matchField(e.businessUnit, selectedBusinessUnit) &&
    matchField(e.location, selectedLocation) &&
    matchField(e.reportingManager, selectedReportingManager) &&
    matchField(e.hrbp, selectedHrbp)
  );

  const activeFilter = e =>
    matchField(e.practice, selectedPractice) &&
    matchField(e.subPractice, selectedSubPractice) &&
    matchField(e.businessUnit, selectedBusinessUnit) &&
    matchField(e.location, selectedLocation) &&
    matchField(e.reportingManager, selectedReportingManager) &&
    matchField(e.hrbp, selectedHrbp);

  const filteredClientLoc = clientLocEmps.filter(activeFilter);
  const filteredException  = exceptionEmps.filter(activeFilter);

  const compliant = emps.filter(e=>e.bucket===3);
  const two = emps.filter(e=>e.bucket===2);
  const one = emps.filter(e=>e.bucket===1);
  const zero = emps.filter(e=>e.bucket===0);
  const flaggedAll = emps.filter(e=>e.subStatus==='flagged');

  const kpis = `<div class="kpis">
    <div class="kpi accent-teal"><div class="num clickable-count" onclick="viewInNewTab('tracked')">${emps.length}</div><div class="lbl">Eligible employees</div></div>
    <div class="kpi accent-green"><div class="num clickable-count" onclick="viewInNewTab('compliant')">${compliant.length}</div><div class="lbl">Compliant · 3+ office days</div></div>
    <div class="kpi accent-red"><div class="num clickable-count" onclick="viewInNewTab('flagged')">${flaggedAll.length}</div><div class="lbl">Non-compliant employees</div></div>
    <div class="kpi accent-teal"><div class="num">${emps.length ? Math.round(compliant.length/emps.length*100) : 0}%</div><div class="lbl">Overall compliance rate</div></div>
    <div class="kpi accent-gray"><div class="num clickable-count" onclick="viewInNewTab('clientLocation')">${filteredClientLoc.length}</div><div class="lbl">Employees working from client location</div></div>
    <div class="kpi accent-gray"><div class="num clickable-count" onclick="viewInNewTab('exception')">${filteredException.length}</div><div class="lbl">WFH Exception</div></div>
  </div>`;

  const legend = `<div class="legend">
    <span><span class="dot" style="background:var(--teal)"></span>Office day</span>
    <span><span class="dot" style="background:var(--amber)"></span>Leave day</span>
    <span><span class="dot" style="background:var(--gap)"></span>WFH</span>
    <span><span class="dot" style="background:#fff;border:1px dashed var(--border)"></span>Weekend</span>
    <span><span class="dot" style="background:repeating-linear-gradient(45deg,#F0F1EE,#F0F1EE 2px,#E4E6E1 2px,#E4E6E1 4px)"></span>No data saved</span>
  </div>`;

  document.getElementById('resultsArea').innerHTML = kpis + legend
    + `<div class="toolbar">
        <input type="search" id="searchBox" placeholder="Search by name or ID…">
        <a class="export-btn" id="exportAllBtn" href="${buildExportUrl('tracked')}">Export eligible (Excel)</a>
        <a class="export-btn" id="exportFlaggedBtn" href="${buildExportUrl('flagged')}">Export non-compliant (Excel)</a>
       </div>`
    + bucketSection('Compliant — 3+ days in office', compliant, 'compliant')
    + bucketSection('2 days in office', two, 'bucket2')
    + bucketSection('1 day in office', one, 'bucket1')
    + bucketSection('0 days in office', zero, 'bucket0')
    + simpleSection('Employees working from client location', filteredClientLoc, simpleTable, 'clientLocation')
    + simpleSection('WFH Exception', filteredException, exceptionTable, 'exception');

  document.getElementById('searchBox').addEventListener('input', ()=>{
    document.querySelectorAll('table.roster').forEach(table=> reapplyTableFilters(table));
  });
}

init();