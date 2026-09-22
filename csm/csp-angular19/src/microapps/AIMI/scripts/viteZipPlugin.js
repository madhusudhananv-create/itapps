import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Vite plugin to create a zip file after build
 * @param {Object} options - Plugin options
 * @param {string} options.version - Version string (defaults to process.env.npm_package_version)
 * @param {string} options.outputDir - Output directory (defaults to 'dist')
 * @param {string} options.mode - Build mode (development/production)
 * @param {string} options.zipName - Custom zip name (defaults to '<MODE>_AIMI_<VERSION>.zip')
 * @returns {Object} Vite plugin object
 */
export function createZipPlugin(options = {}) {
  const {
    version = process.env.npm_package_version || '1.0.0',
    outputDir = 'dist',
    mode = 'production',
    zipName = `${getModePrefix(mode)}_AIMI_${version}.zip`,
  } = options;

  return {
    name: 'vite-zip-plugin',
    apply: 'build',
    closeBundle() {
      // This hook runs after the build is complete
      createZipFile(outputDir, zipName);
    },
  };
}

/**
 * Get short prefix for build mode
 * @param {string} mode - Build mode
 * @returns {string} Short prefix (DEV/PROD)
 */
function getModePrefix(mode) {
  switch (mode.toLowerCase()) {
    case 'development':
      return 'DEV';
    case 'production':
      return 'PROD';
    default:
      return mode.toUpperCase();
  }
}

/**
 * Create zip file from directory using cross-platform commands
 */
async function createZipFile(sourceDir, zipFileName) {
  const sourcePath = path.resolve(sourceDir);
  const zipPath = path.resolve(zipFileName);

  // Check if source directory exists
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Error: ${sourceDir} folder does not exist.`);
    return;
  }

  try {
    console.log(`📦 Creating zip file: ${zipFileName}`);
    console.log(`📁 Source: ${sourcePath}`);
    console.log(`💾 Destination: ${zipPath}`);

    // Remove existing zip file if it exists
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }

    // Use cross-platform zip command (no shell involved to avoid command injection)
    const { command, args, options: execOptions } = getZipCommand(sourcePath, zipPath);
    execFileSync(command, args, { stdio: 'inherit', ...execOptions });

    const fileSize = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(2);
    console.log(`✅ Successfully created ${zipFileName}`);
    console.log(`📊 File size: ${fileSize} MB`);
  } catch (error) {
    console.error('❌ Error creating zip file:', error.message);
  }
}

/**
 * Get cross-platform zip command, invoked directly (no shell) to avoid
 * OS command injection via shell metacharacters.
 * @param {string} sourcePath - Source directory path
 * @param {string} zipPath - Output zip file path
 * @returns {{command: string, args: string[], options?: object}} Command descriptor
 */
function getZipCommand(sourcePath, zipPath) {
  const isWindows = process.platform === 'win32';
  const isMac = process.platform === 'darwin';
  const isLinux = process.platform === 'linux';

  if (isWindows) {
    // Use PowerShell Compress-Archive for Windows, with args passed
    // separately so no shell parses the paths.
    return {
      command: 'powershell',
      args: [
        '-NoProfile',
        '-NonInteractive',
        '-Command',
        '& { param($src, $dst) Compress-Archive -Path $src -DestinationPath $dst -Force }',
        path.join(sourcePath, '*'),
        zipPath,
      ],
    };
  } else if (isMac || isLinux) {
    // Use zip command for Unix-like systems, run with cwd set to the
    // parent directory instead of shelling out a "cd && zip" string.
    const sourceDir = path.basename(sourcePath);
    const parentDir = path.dirname(sourcePath);
    return {
      command: 'zip',
      args: ['-r', zipPath, sourceDir],
      options: { cwd: parentDir },
    };
  } else {
    throw new Error(`Unsupported platform: ${process.platform}`);
  }
}
