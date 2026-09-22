const fs = require('fs');
const path = require('path');

function loadLocalEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator <= 0) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

module.exports = {
  '/openai': {
    target: 'https://api.openai.com',
    secure: true,
    changeOrigin: true,
    pathRewrite: {
      '^/openai': '',
    },
    rewrite: (urlPath) => urlPath.replace(/^\/openai/, ''),
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq) => {
        const key = process.env.OPENAI_API_KEY;
        const projectId = process.env.OPENAI_PROJECT_ID;
        if (!key) {
          throw new Error('OPENAI_API_KEY is not set on the dev server.');
        }
        proxyReq.setHeader('Authorization', `Bearer ${key}`);
        if (projectId) {
          proxyReq.setHeader('OpenAI-Project', projectId);
        }
      });
    },
  },
};
