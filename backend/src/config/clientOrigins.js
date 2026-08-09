// Centralized CORS origins config: Parses CLIENT_URLS env variable (comma-separated) into an array of allowed origins.
const DEFAULT_CLIENT_URLS = [
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:5173',
];

const allowedOrigins = process.env.CLIENT_URLS
  ? process.env.CLIENT_URLS
      .split(',')
      .map(url => url.trim().replace(/\/+$/, ''))
      .filter(Boolean)
  : DEFAULT_CLIENT_URLS;

if (allowedOrigins.length === 0) {
  throw new Error('[clientOrigins] CLIENT_URLS is set but contains no valid URLs. Check your environment configuration.');
}

// Primary client URL used for email links and OAuth redirects.
const primaryClientUrl = allowedOrigins[0];

module.exports = {
  allowedOrigins,
  primaryClientUrl,
};
