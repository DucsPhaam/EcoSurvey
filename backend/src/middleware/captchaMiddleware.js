// Captcha middleware: Validates Cloudflare Turnstile CAPTCHA tokens to prevent automated bots.
const logger = require('../utils/logger');

exports.verifyCaptcha = async (req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  if (!process.env.TURNSTILE_SECRET_KEY) {
    if (process.env.NODE_ENV === 'production') {
      logger.error('CAPTCHA verification failed: TURNSTILE_SECRET_KEY is missing in production.');
      return res.status(500).json({ message: 'CAPTCHA service misconfigured.' });
    }
    logger.warn('CAPTCHA verification bypassed in development mode (missing TURNSTILE_SECRET_KEY).');
    return next();
  }

  const token = req.body['cf-turnstile-response'];
  if (!token) {
    return res.status(400).json({ message: 'CAPTCHA token is missing. Please complete the CAPTCHA.' });
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: req.ip,
      }),
    });

    const data = await response.json();
    if (!data.success) {
      logger.warn(`CAPTCHA verification failed: ${JSON.stringify(data['error-codes'])}`);
      return res.status(400).json({ message: 'CAPTCHA verification failed. Please try again.' });
    }

    next();
  } catch (error) {
    logger.error('Error verifying CAPTCHA:', error);
    res.status(500).json({ message: 'Internal server error during CAPTCHA verification.' });
  }
};
