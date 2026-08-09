const request = require('supertest');

describe('Multiple CORS Origins Configuration', () => {
  let app;
  const originalEnv = process.env.CLIENT_URLS;

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    process.env.CLIENT_URLS = originalEnv;
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
