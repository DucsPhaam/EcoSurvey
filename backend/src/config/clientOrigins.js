// Centralized CORS origins config: Parses CLIENT_URLS / CLIENT_URL env variables.
const DEFAULT_CLIENT_URLS = [
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:5173',
];

const rawUrls = process.env.CLIENT_URL || process.env.FRONTEND_URL || process.env.CLIENT_URLS;

const allowedOrigins = rawUrls
  ? rawUrls
      .split(',')
      .map(url => url.trim().replace(/\/+$/, ''))
      .filter(Boolean)
  : DEFAULT_CLIENT_URLS;

if (allowedOrigins.length === 0) {
  throw new Error('[clientOrigins] CLIENT_URLS is set but contains no valid URLs. Check your environment configuration.');
}

// Primary client URL used for email links and OAuth redirects (prefers Vercel/frontend domain over backend domain)
let primaryClientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL;

if (!primaryClientUrl) {
  const nonRailwayOrigin = allowedOrigins.find(url => !url.includes('railway.app'));
  primaryClientUrl = nonRailwayOrigin || allowedOrigins[0];
}

module.exports = {
  allowedOrigins,
  primaryClientUrl,
};
