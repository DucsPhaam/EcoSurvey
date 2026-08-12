const request = require('supertest');

describe('Multiple CORS Origins Configuration', () => {
  let app;
  const originalClientUrl = process.env.CLIENT_URL;
  const originalClientUrls = process.env.CLIENT_URLS;
  const originalFrontendUrl = process.env.FRONTEND_URL;

  beforeEach(() => {
    jest.resetModules();
    delete process.env.CLIENT_URL;
    delete process.env.FRONTEND_URL;
  });

  afterEach(() => {
    process.env.CLIENT_URL = originalClientUrl;
    process.env.CLIENT_URLS = originalClientUrls;
    process.env.FRONTEND_URL = originalFrontendUrl;
  });

  it('allows access from first URL in comma-separated CLIENT_URLS', async () => {
    process.env.CLIENT_URLS = 'https://eco-survey-lyart.vercel.app,https://eco-survey-nine.vercel.app';
    app = require('../src/server');

    const response = await request(app)
      .get('/api/health')
      .set('Origin', 'https://eco-survey-lyart.vercel.app');

    expect(response.headers['access-control-allow-origin']).toBe('https://eco-survey-lyart.vercel.app');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });

  it('allows access from second URL in comma-separated CLIENT_URLS', async () => {
    process.env.CLIENT_URLS = 'https://eco-survey-lyart.vercel.app,https://eco-survey-nine.vercel.app';
    app = require('../src/server');

    const response = await request(app)
      .get('/api/health')
      .set('Origin', 'https://eco-survey-nine.vercel.app');

    expect(response.headers['access-control-allow-origin']).toBe('https://eco-survey-nine.vercel.app');
    expect(response.headers['access-control-allow-credentials']).toBe('true');
  });

  it('blocks access from origin not in CLIENT_URLS list', async () => {
    process.env.CLIENT_URLS = 'https://eco-survey-lyart.vercel.app,https://eco-survey-nine.vercel.app';
    app = require('../src/server');

    const response = await request(app)
      .get('/api/health')
      .set('Origin', 'https://unauthorized-domain.com');

    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });
});
