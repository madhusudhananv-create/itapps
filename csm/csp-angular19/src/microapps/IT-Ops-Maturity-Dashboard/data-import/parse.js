// Converts the raw framework CSVs into a single structured JSON dataset
// consumed by MaturityMockService. Run with: node parse.js
const fs = require('fs');
const path = require('path');

const RAW = path.join(__dirname, 'raw');
const OUT = path.join(__dirname, '..', 'public', 'data', 'maturity-data.json');

function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); field = ''; rows.push(row); row = []; }
      else if (c === '\r') { /* skip */ }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.length > 1 || (r[0] && r[0].trim()));
}

function readCsv(file) {
  const text = fs.readFileSync(path.join(RAW, file), 'utf8');
  return parseCSV(text);
}

function toScore(s) {
  const t = (s || '').trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

// domain file configs: id, name, file, columns layout
const DOMAIN_FILES = [
  { id: 'windows', name: 'Windows', file: 'windows.csv' },
  { id: 'linux', name: 'Linux', file: 'linux.csv' },
  { id: 'vmware', name: 'VMware', file: 'vmware.csv' },
  { id: 'citrix-vdi', name: 'Citrix VDI', file: 'citrix-vdi.csv' },
  { id: 'network', name: 'Network', file: 'network.csv' },
  { id: 'hyperconverged-infra', name: 'Hyperconverged Infra', file: 'hyperconverged-infra.csv' },
  { id: 'database', name: 'Database', file: 'database.csv', hasMinRequired: true },
  { id: 'storage-backup', name: 'Storage & Backup', file: 'storage-backup.csv' },
  { id: 'noc', name: 'NOC', file: 'noc.csv' },
  { id: 'servicedesk', name: 'ServiceDesk', file: 'servicedesk.csv' },
  { id: 'euc', name: 'EUC', file: 'euc.csv' },
  { id: 'itsm', name: 'ITSM', file: 'itsm.csv' },
  { id: 'dr-bc', name: 'DR & BC', file: 'dr-bc.csv' },
];

function parseStandardDomain(cfg) {
  const rows = readCsv(cfg.file);
  const params = [];
  // header is rows[0]
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const srNo = (r[0] || '').trim();
    const category = (r[1] || '').trim();
    const name = (r[2] || '').trim();
    if (!name) continue; // section header or blank row
    const definition = (r[3] || '').trim();
    const l1 = (r[4] || '').trim();
    const l2 = (r[5] || '').trim();
    const l3 = (r[6] || '').trim();
    const l4 = (r[7] || '').trim();
    const l5 = (r[8] || '').trim();
    const score = toScore(r[9]);
    let minReq = null;
    let notes = '';
    if (cfg.hasMinRequired) {
      minReq = toScore(r[10]);
      notes = (r[11] || '').trim();
    } else {
      notes = (r[10] || '').trim();
    }
    params.push({
      id: `${cfg.id}-${srNo || params.length + 1}`,
      category,
      name,
      definition,
      rubric: { level1: l1, level2: l2, level3: l3, level4: l4, level5: l5 },
      minRequiredScore: minReq,
      score,
      notes,
    });
  }
  return params;
}

function parseCloudDomain() {
  const rows = readCsv('cloud.csv');
  const params = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const provider = (r[0] || '').trim();
    const srNo = (r[1] || '').trim();
    const category = (r[2] || '').trim();
    const name = (r[3] || '').trim();
    if (!name) continue;
    const definition = (r[4] || '').trim();
    const l1 = (r[5] || '').trim();
    const l2 = (r[6] || '').trim();
    const l3 = (r[7] || '').trim();
    const l4 = (r[8] || '').trim();
    const l5 = (r[9] || '').trim();
    const score = toScore(r[10]);
    const minReq = toScore(r[11]);
    const notes = (r[12] || '').trim();
    params.push({
      id: `cloud-${provider.toLowerCase()}-${srNo}`,
      provider,
      category,
      name,
      definition,
      rubric: { level1: l1, level2: l2, level3: l3, level4: l4, level5: l5 },
      minRequiredScore: minReq,
      score,
      notes,
    });
  }
  return params;
}

function parseDomainsList() {
  const rows = readCsv('domains-list.csv');
  const map = {};
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const name = (r[1] || '').trim();
    if (!name) continue;
    map[name] = { coeSpoc: (r[2] || '').trim(), reviewer: (r[3] || '').trim(), status: (r[4] || '').trim() };
  }
  return map;
}

function main() {
  const domainMeta = parseDomainsList();
  const domains = [];

  function deriveStatus(parameters) {
    const scored = parameters.filter((p) => typeof p.score === 'number').length;
    if (scored === 0) return 'Not Started';
    if (scored === parameters.length) return 'Pending Review';
    return 'Draft';
  }

  for (const cfg of DOMAIN_FILES) {
    const parameters = parseStandardDomain(cfg);
    const meta = domainMeta[cfg.name] || {};
    domains.push({
      id: cfg.id,
      name: cfg.name,
      coeSpoc: meta.coeSpoc || '',
      reviewer: meta.reviewer || '',
      status: deriveStatus(parameters),
      parameters,
    });
  }

  // Cloud domain: one entry with provider-tagged parameters
  const cloudParams = parseCloudDomain();
  const cloudMeta = domainMeta['Cloud'] || {};
  domains.push({
    id: 'cloud',
    name: 'Cloud',
    coeSpoc: cloudMeta.coeSpoc || '',
    reviewer: cloudMeta.reviewer || '',
    status: deriveStatus(cloudParams),
    parameters: cloudParams,
  });

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ domains }, null, 2), 'utf8');
  console.log(`Wrote ${domains.length} domains to ${OUT}`);

  // Validation against dashboard scorecard
  const dashRows = readCsv('dashboard-scorecard.csv');
  console.log('\n--- Validation against Dashboard scorecard ---');
  for (const d of domains) {
    const scored = d.parameters.filter((p) => typeof p.score === 'number');
    const sum = scored.reduce((s, p) => s + p.score, 0);
    const count = scored.length;
    const avg = count ? sum / count : 0;
    const dashLabel = d.name === 'Cloud' ? 'Cloud (Azure/ AWS/ GCP)' : d.name === 'Storage & Backup' ? 'Storage & Backup' : d.name === 'ServiceDesk' ? 'Service Desk' : d.name;
    const dashRow = dashRows.find((r) => (r[1] || '').trim() === dashLabel);
    const dashCount = dashRow ? Number(dashRow[2]) : null;
    const dashSum = dashRow ? Number(dashRow[3]) : null;
    const status = dashRow && dashCount === count && dashSum === sum ? 'OK' : 'MISMATCH';
    console.log(
      `${d.name.padEnd(24)} params=${String(count).padEnd(4)} sum=${String(sum).padEnd(5)} avg=${avg.toFixed(2)}  ` +
      `(expected params=${dashCount}, sum=${dashSum})  ${status}`
    );
  }
}

main();
