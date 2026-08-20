/**
 * Simple server for Pipeline Dashboard
 * - Runs Pull_OpenAll_Oppor_Partnership.exe to extract data from D365
 * - Loads files from local folders
 * - Serves dashboard files
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// ⚠️ CONFIGURATION - Update these paths if different
const CONFIG = {
    port: 8080,
    pullOpportunitiesExe: 'C:\\Pull_OpenAll_Oppor_Partnership.exe',

    // Local folders where files are stored (absolute paths)
    localFolders: {
        currentWeek:      'C:\\Sites\\ITApps\\Webapp\\pipeline-healthcare\\pipeline-data',
        prevWeek:         'C:\\Sites\\ITApps\\Webapp\\pipeline-healthcare\\lastweek-pipeline',
        historical:       'C:\\Sites\\ITApps\\Webapp\\pipeline-healthcare\\historical-data',
        fy26Bookings:     'C:\\Sites\\ITApps\\Webapp\\pipeline-healthcare\\fy26-bookings',
        q127Bookings:     'C:\\Sites\\ITApps\\Webapp\\pipeline-healthcare\\fy27-bookings-actual',
        revTargetsByBU:   'C:\\Sites\\ITApps\\Webapp\\pipeline-healthcare\\revenue-targets',
        fy27Targets:      'C:\\Sites\\ITApps\\Webapp\\pipeline-healthcare\\sales-targets',
        revenueBridge:    'C:\\Sites\\ITApps\\Webapp\\pipeline-healthcare\\bridge-data',
        partnershipTab:   'C:\\Sites\\ITApps\\Webapp\\pipeline-healthcare\\partnership-section',
        q127Forecast:     'C:\\Sites\\ITApps\\Webapp\\pipeline-healthcare\\forecast-data',
        fy27TargetActuals:'C:\\Sites\\ITApps\\Webapp\\pipeline-healthcare\\revenue-targets-actuals',
        obForecast:       'C:\\Sites\\ITApps\\Webapp\\pipeline-healthcare\\orderbooking-forecast'
    }
};

// Maps URL folder paths -> CONFIG.localFolders key
// Must match SHAREPOINT_CONFIG.filePaths in pipeline_analytics.html
const FOLDER_URL_MAP = {
    '/pipeline-healthcare/pipeline-data/':           'currentWeek',
    '/pipeline-healthcare/historical-data/':         'historical',
    '/pipeline-healthcare/fy27-bookings-actual/':    'q127Bookings',
    '/pipeline-healthcare/fy26-bookings/':           'fy26Bookings',
    '/pipeline-healthcare/lastweek-pipeline/':       'prevWeek',
    '/pipeline-healthcare/revenue-targets/':         'revTargetsByBU',
    '/pipeline-healthcare/sales-targets/':           'fy27Targets',
    '/pipeline-healthcare/bridge-data/':             'revenueBridge',
    '/pipeline-healthcare/partnership-section/':     'partnershipTab',
    '/pipeline-healthcare/forecast-data/':           'q127Forecast',
    '/pipeline-healthcare/revenue-targets-actuals/': 'fy27TargetActuals',
    '/pipeline-healthcare/orderbooking-forecast/':   'obForecast'
};

/**
 * Find the latest file in a folder (by modification time)
 */
function findLatestFile(folderPath) {
    if (!fs.existsSync(folderPath)) return null;
    const files = fs.readdirSync(folderPath)
        .filter(f => /\.(xlsx?|csv)$/i.test(f));
    if (!files.length) return null;
    files.sort((a, b) => {
        const ta = fs.statSync(path.join(folderPath, a)).mtimeMs;
        const tb = fs.statSync(path.join(folderPath, b)).mtimeMs;
        return tb - ta; // newest first
    });
    return files[0];
}

/**
 * Run Pull_OpenAll_Oppor_Partnership.exe
 */
function runPullOpportunities() {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(CONFIG.pullOpportunitiesExe)) {
            reject(new Error(`Exe not found: ${CONFIG.pullOpportunitiesExe}`));
            return;
        }
        exec(`"${CONFIG.pullOpportunitiesExe}"`, {
            timeout: 10 * 60 * 1000,
            maxBuffer: 10 * 1024 * 1024,
            windowsHide: true
        }, (err, stdout) => err ? reject(err) : resolve({ success: true, output: stdout }));
    });
}

/**
 * Load all files from local folders and return as base64
 */
function loadLocalFiles() {
    return new Promise((resolve, reject) => {
        try {
            const results = {};
            for (const [key, folderPath] of Object.entries(CONFIG.localFolders)) {
                const file = findLatestFile(folderPath);
                if (file) {
                    const fullPath = path.join(folderPath, file);
                    const buffer = fs.readFileSync(fullPath);
                    const stats = fs.statSync(fullPath);
                    results[key] = {
                        fileName: file,
                        data: buffer.toString('base64'),
                        size: buffer.length,
                        lastModified: stats.mtime.toISOString()
                    };
                }
            }
            resolve(results);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * GET /api/list-folder?path=<folderName>
 * Returns { files: ['filename1.xlsx', ...] } — latest file first
 * Used by pipeline_analytics.html to resolve filenames without hardcoding them
 */
function handleListFolder(req, res) {
    // Parse query string manually (no Express, no URL global needed)
    var rawUrl = req.url;
    var queryStr = rawUrl.indexOf('?') !== -1 ? rawUrl.split('?')[1] : '';
    var folderParam = '';
    queryStr.split('&').forEach(function(part) {
        var kv = part.split('=');
        if (kv[0] === 'path') folderParam = decodeURIComponent(kv[1] || '');
    });
    folderParam = folderParam.replace(/\/+$/, '').replace(/^\/+/, ''); // strip slashes

    console.log('[ListFolder] Request for folder:', folderParam);

    // Find matching folder path: check localFolders key OR folder basename
    var folderPath = null;
    if (CONFIG.localFolders[folderParam]) {
        folderPath = CONFIG.localFolders[folderParam];
    } else {
        for (var key in CONFIG.localFolders) {
            var fp = CONFIG.localFolders[key];
            var basename = path.basename(fp);
            if (basename === folderParam) {
                folderPath = fp;
                break;
            }
        }
    }

    console.log('[ListFolder] Resolved to:', folderPath || 'NOT FOUND');

    if (!folderPath) {
        console.warn('[ListFolder] No match for: ' + folderParam + '. Available:', Object.keys(CONFIG.localFolders).map(k => path.basename(CONFIG.localFolders[k])).join(', '));
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ files: [], error: 'No folder matched: ' + folderParam }));
        return;
    }

    try {
        if (!fs.existsSync(folderPath)) {
            console.warn('[ListFolder] Folder does not exist:', folderPath);
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ files: [] }));
            return;
        }

        var allFiles = fs.readdirSync(folderPath).filter(function(f) {
            return /\.(xlsx?|csv)$/i.test(f);
        });

        // Sort newest first by modification time
        allFiles.sort(function(a, b) {
            return fs.statSync(path.join(folderPath, b)).mtimeMs -
                   fs.statSync(path.join(folderPath, a)).mtimeMs;
        });

        console.log('[ListFolder] Found files:', allFiles);
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ files: allFiles }));
    } catch (err) {
        console.error('[ListFolder] Error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: err.message, files: [] }));
    }
}

/**
 * Serve pipeline data files — picks latest file from folder automatically
 */
function servePipelineDataFile(req, res) {
    const urlPath = req.url.split('?')[0];

    // Find matching folder key
    let folderKey = null;
    for (const [urlPrefix, key] of Object.entries(FOLDER_URL_MAP)) {
        if (urlPath.startsWith(urlPrefix)) { folderKey = key; break; }
    }

    // Also handle folder listing requests (URL ends with /) — return JSON file list
    const isListingRequest = urlPath.endsWith('/');

    if (!folderKey) {
        res.writeHead(404, { 'Access-Control-Allow-Origin': '*' });
        res.end('Not found');
        return;
    }

    const folderPath = CONFIG.localFolders[folderKey];

    try {
        if (!fs.existsSync(folderPath)) {
            res.writeHead(404, { 'Access-Control-Allow-Origin': '*' });
            res.end('Folder not found: ' + folderPath);
            return;
        }

        const files = fs.readdirSync(folderPath).filter(f => /\.(xlsx?|csv)$/i.test(f));

        if (!files.length) {
            res.writeHead(404, { 'Access-Control-Allow-Origin': '*' });
            res.end('No files in folder: ' + folderPath);
            return;
        }

        // Always serve the latest file directly
        const latestFile = findLatestFile(folderPath);
        if (!latestFile) {
            res.writeHead(404, { 'Access-Control-Allow-Origin': '*' });
            res.end('No valid file found');
            return;
        }

        const fullPath = path.join(folderPath, latestFile);
        fs.readFile(fullPath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Access-Control-Allow-Origin': '*' });
                res.end('Error reading file');
                return;
            }
            const ext = path.extname(fullPath).toLowerCase();
            const mimeTypes = {
                '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                '.xls':  'application/vnd.ms-excel',
                '.csv':  'text/csv'
            };
            const stats = fs.statSync(fullPath);
            res.writeHead(200, {
                'Content-Type': mimeTypes[ext] || 'application/octet-stream',
                'Access-Control-Allow-Origin': '*',
                'Last-Modified': stats.mtime.toUTCString(),
                'Content-Disposition': 'attachment; filename="' + latestFile + '"',
                'Content-Length': data.length
            });
            res.end(data);
        });

    } catch (error) {
        res.writeHead(500, { 'Access-Control-Allow-Origin': '*' });
        res.end('Server error: ' + error.message);
    }
}

/**
 * Handle load-only request
 */
async function handleLoadOnly(res) {
    try {
        const files = await loadLocalFiles();
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, files, message: `Loaded ${Object.keys(files).length} files` }));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: false, error: error.message }));
    }
}

/**
 * Handle pull and load request
 */
async function handlePullAndLoad(res) {
    try {
        await runPullOpportunities();
        const files = await loadLocalFiles();
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: true, files, message: `Pulled from D365 and loaded ${Object.keys(files).length} files` }));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ success: false, error: error.message }));
    }
}

/**
 * Serve static files
 */
function serveStatic(req, res) {
    const filePath = req.url === '/' ? '/pipeline_analytics.html' : req.url.split('?')[0];
    const fullPath = path.join(__dirname, filePath);
    if (!fullPath.startsWith(__dirname)) { res.writeHead(403); res.end('Forbidden'); return; }
    fs.readFile(fullPath, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        const mimeTypes = {
            '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
            '.json': 'application/json', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.csv': 'text/csv', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml'
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath)] || 'text/plain' });
        res.end(data);
    });
}

/**
 * Main server
 */
const server = http.createServer((req, res) => {
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token'
        });
        res.end();
        return;
    }

    // API: list files in a folder (used by dashboard to resolve filenames dynamically)
    if (req.url.startsWith('/api/list-folder') && req.method === 'GET') {
        handleListFolder(req, res);
        return;
    }

    // API: load files only (no exe)
    if (req.url === '/api/load-files' && req.method === 'GET') {
        handleLoadOnly(res);
        return;
    }

    // API: pull from D365 + load files
    if (req.url === '/api/pull-and-load' && req.method === 'GET') {
        handlePullAndLoad(res);
        return;
    }

    // Serve pipeline data files (picks latest file from each folder automatically)
    if (req.url.startsWith('/pipeline-healthcare/') && req.method === 'GET') {
        servePipelineDataFile(req, res);
        return;
    }

    // Serve static files
    serveStatic(req, res);
});

server.listen(CONFIG.port, () => {
    console.log(`Pipeline Dashboard server running on port ${CONFIG.port}`);
});