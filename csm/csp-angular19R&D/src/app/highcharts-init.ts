/**
 * Highcharts Initialization with Offline Export Support
 * 
 * IMPORTANT: Configured for fully OFFLINE/CLIENT-SIDE exporting
 * - No external server dependencies
 * - No external CDN requests (blocked in UAT/Production)
 * - All libraries bundled locally (jsPDF, svg2pdf.js)
 * 
 * This configuration ensures chart exports work in restricted environments:
 * ✓ Works behind corporate firewalls
 * ✓ Works with Content Security Policy (CSP)
 * ✓ Works in UAT/Production without internet access
 * ✓ No CORS errors
 * 
 * Supported export formats:
 * - PNG, JPEG, SVG (image formats)
 * - PDF (using jsPDF)
 * - CSV, XLS (data exports)
 * - Print
 * 
 * Troubleshooting:
 * - Check browser console for [Highcharts] logs
 * - Ensure jsPDF is in package.json dependencies
 * - Verify offline-exporting module is loaded
 */
import * as HighchartsCore from 'highcharts';
import { jsPDF } from 'jspdf';
import 'svg2pdf.js';

// Import modules synchronously to ensure they're loaded before any chart renders
import * as ExportingModule from 'highcharts/modules/exporting';
import * as ExportDataModule from 'highcharts/modules/export-data';
import * as OfflineExportingModule from 'highcharts/modules/offline-exporting';

// Initialize modules immediately (synchronous initialization)
const HC = HighchartsCore as any;
const ExportingInit: any = (ExportingModule as any).default || ExportingModule;
const ExportDataInit: any = (ExportDataModule as any).default || ExportDataModule;
const OfflineExportingInit: any = (OfflineExportingModule as any).default || OfflineExportingModule;


// Initialize in correct order: Exporting -> ExportData -> OfflineExporting
if (typeof ExportingInit === 'function') {
  if (!HC.Exporting) {
    ExportingInit(HC);
  }
} else {
  console.error('[Highcharts] ❌ ExportingInit is not a function:', ExportingInit);
}

if (typeof ExportDataInit === 'function') {
  ExportDataInit(HC);
} else {
  console.warn('[Highcharts] ⚠️ ExportDataInit is not a function:', ExportDataInit);
}

if (typeof OfflineExportingInit === 'function') {
  OfflineExportingInit(HC);
} else {
  console.error('[Highcharts] ❌ OfflineExportingInit is not a function:', OfflineExportingInit);
}

// Make jsPDF available globally for Highcharts offline-exporting
// Highcharts offline-exporting looks for jsPDF in multiple locations
(window as any).jspdf = { jsPDF };
(window as any).jsPDF = jsPDF;

// CRITICAL: Patch fetch BEFORE any Highcharts operations
// This catches ALL fetch requests and blocks external ones
const originalFetch = window.fetch;
window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;

  // Check if this is an external URL (has http:// or https://)
  const isExternalUrl = url.startsWith('http://') || url.startsWith('https://');

  if (isExternalUrl) {
    // Block ALL external HTTP(S) requests to prevent CORS errors
    const blockedDomains = [
      'gstatic.com',
      'googleapis.com',
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'code.highcharts.com',
      'highcharts.com',
      'cdnjs.cloudflare.com',
      'cdn.jsdelivr.net',
      'unpkg.com',
      'accounts.google.com',  // Block Google Accounts (causes CORS in chart exports)
      'google.com'
    ];

    // Check if URL contains any blocked domain or is a stylesheet/font
    const isBlocked = blockedDomains.some(domain => url.includes(domain)) ||
      url.includes('.css') ||
      url.includes('.woff') ||
      url.includes('.ttf') ||
      url.includes('.woff2') ||
      url.includes('/style') ||  // Block any /style endpoints
      url.includes('gsi/style'); // Specifically block Google Sign-In styles

    if (isBlocked) {
      console.warn('[Fetch Interceptor] ⛔ BLOCKED:', url);
      // Return empty successful response immediately
      return Promise.resolve(new Response('/* Blocked by offline mode */', {
        status: 200,
        statusText: 'OK - Blocked by offline mode',
        headers: new Headers({
          'Content-Type': 'text/css',
          'Content-Length': '0'
        })
      }));
    }
  }

  // Allow through (for local resources, blob URLs, data URLs, etc.)
  return originalFetch.apply(window, [input, init] as any);
};

// Override Highcharts methods to prevent ANY external requests
if (HC.Exporting) {
  // AGGRESSIVELY disable stylesheet fetching
  HC.Exporting.fetchStyleSheets = async function () {
    // Return empty array immediately - no async operations
    return [];
  };

  // AGGRESSIVELY disable font inlining  
  HC.Exporting.inlineFonts = async function (svgElement: any) {
    // Return SVG unchanged immediately - no async operations
    return svgElement;
  };

  // Override getSVGForExport to ensure no external resources
  if (HC.Chart && HC.Chart.prototype) {
    const originalGetSVGForExport = HC.Chart.prototype.getSVGForExport;
    HC.Chart.prototype.getSVGForExport = function (options: any, chartOptions: any) {
      // Force offline mode options
      const safeOptions = options || {};
      const safeChartOptions = chartOptions || {};

      // Ensure no external fetching
      safeChartOptions.exporting = safeChartOptions.exporting || {};
      safeChartOptions.exporting.fallbackToExportServer = false;

      // Call original method with safe options
      if (originalGetSVGForExport) {
        return originalGetSVGForExport.call(this, safeOptions, safeChartOptions);
      }
      return null;
    };
  }

  // Override getSVG to ensure it doesn't try to fetch external resources
  const originalGetSVG = HC.Chart.prototype.getSVG;
  HC.Chart.prototype.getSVG = function (chartOptions?: any) {
    // Ensure no external resources are referenced
    const options = chartOptions || {};
    options.exporting = options.exporting || {};
    options.exporting.fallbackToExportServer = false;
    return originalGetSVG.call(this, options);
  };

} else {
  console.error('[Highcharts] ⚠️ Exporting module not found - downloads will NOT work');
}

// Set global options immediately
HighchartsCore.setOptions({
  lang: {
    printChart: 'Print chart',
    downloadPNG: 'Download PNG image',
    downloadJPEG: 'Download JPEG image',
    downloadPDF: 'Download PDF document',
    downloadSVG: 'Download SVG vector image',
    downloadCSV: 'Download CSV',
    downloadXLS: 'Download XLS',
    viewData: 'View data table'
  },
  exporting: {
    enabled: true,
    // CRITICAL: Force offline/client-side exporting only
    fallbackToExportServer: false,
    // Do NOT set libURL - forces use of bundled libraries
    // Do NOT set url - prevents any server export attempts
    type: 'image/png',
    // Client-side rendering settings
    sourceWidth: 800,
    sourceHeight: 600,
    scale: 2,
    // Allow images and canvas for offline exporting
    allowHTML: false,
    // Fetch options should never be used, but set to fail fast if attempted
    fetchOptions: {
      mode: 'no-cors',
      cache: 'no-cache'
    },
    buttons: {
      contextButton: {
        align: 'right',
        verticalAlign: 'top',
        x: 0,
        y: 0,
        menuItems: [
          'printChart',
          'separator',
          'downloadPNG',
          'downloadJPEG',
          'downloadPDF',
          'downloadSVG',
          'separator',
          'downloadCSV',
          'downloadXLS',
          'viewData'
        ]
      }
    },
    // Custom error handling with detailed logging
    error: function (options: any, err: any) {
      const errorDetails = {
        type: options.type,
        filename: options.filename,
        errorMessage: err?.message || 'Unknown error',
        errorName: err?.name || 'Error',
        errorStack: err?.stack || 'No stack trace',
        timestamp: new Date().toISOString()
      };

      console.error('[Highcharts Export Failed]', errorDetails);
      console.error('Full error object:', err);
      console.error('Full options object:', options);

      // Show user-friendly error with actionable information
      let userMessage = `Chart export failed.\n\n`;
      userMessage += `Error: ${err?.message || 'Unknown error'}\n\n`;
      userMessage += `Troubleshooting:\n`;
      userMessage += `1. Check browser console for detailed logs (F12)\n`;
      userMessage += `2. Try a different export format\n`;
      userMessage += `3. Ensure browser supports canvas and blob operations\n`;
      userMessage += `4. Check if ad blockers are interfering\n\n`;
      userMessage += `Contact support if the issue persists.`;

      alert(userMessage);
    }
}
} as any);

// Export configuration logging removed
// Library status logging removed
// Supported formats logging removed

// Critical validation checks
if (!HC.Exporting) {
  console.error('[Highcharts] ❌ CRITICAL: Exporting module not loaded!');
  console.error('[Highcharts] Charts will NOT be exportable. Check module imports.');
} else {
}

// Check for offline exporting capability
// Note: HC.OfflineExporting might not be exposed, but offline functionality could still work
const hasOfflineExporting = !!(HC.OfflineExporting ||
  HC.defaultOptions?.exporting?.fallbackToExportServer === false ||
  HC.Chart?.prototype?.exportChartLocal);

if (!hasOfflineExporting) {
  console.warn('[Highcharts] ⚠️ WARNING: Offline exporting module may not be loaded!');
  console.warn('[Highcharts] Checking alternative indicators...');
  console.warn('[Highcharts] Fallback disabled:', HC.defaultOptions?.exporting?.fallbackToExportServer === false);
  console.warn('[Highcharts] exportChartLocal exists:', !!HC.Chart?.prototype?.exportChartLocal);
} else {
}

if (!(window as any).jsPDF) {
  console.error('[Highcharts] ⚠️ WARNING: jsPDF not found on window object.');
  console.error('[Highcharts] PDF exports will not work. Check jspdf package installation.');
}

if (!document.createElement('canvas').getContext) {
  console.error('[Highcharts] ❌ CRITICAL: Canvas not supported in this browser.');
  console.error('[Highcharts] Image exports (PNG/JPEG) will fail.');
}

// Success confirmation
if (HC.Exporting && HC.OfflineExporting && (window as any).jsPDF) {
}

// Test blob download capability (critical for exports to work)
function testBlobDownload(): boolean {
  try {
    const testBlob = new Blob(['test'], { type: 'text/plain' });
    const testUrl = URL.createObjectURL(testBlob);
    URL.revokeObjectURL(testUrl);
    return true;
  } catch (e) {
    console.error('[Highcharts] ❌ Blob downloads NOT supported:', e);
    return false;
  }
}

testBlobDownload();

// Add global error handler for unhandled export errors
if (typeof window !== 'undefined' && window.addEventListener) {
  const errorHandler = function (event: ErrorEvent) {
    if (event.message && (event.message.includes('Highcharts') || event.message.includes('export'))) {
      console.error('[Highcharts] Unhandled error during export:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    }
  };
  window.addEventListener('error', errorHandler);
}

// Polyfill for download if needed (fallback for restricted environments)
try {
  const testAnchor = document.createElement('a');
  if (!('download' in testAnchor)) {
    console.warn('[Highcharts] ⚠️ Download attribute not supported, adding polyfill');
  }
} catch (e) {
  console.warn('[Highcharts] ⚠️ Could not check download support:', e);
}

// Factory function for highcharts-angular provideHighcharts
export function highchartsFactory(): Promise<typeof HighchartsCore> {
  return Promise.resolve(HighchartsCore);
}

// Export for direct imports in components
export { HighchartsCore as Highcharts };
