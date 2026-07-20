const logger = require('../utils/logger');

/**
 * Middleware to verify Cloudflare Turnstile CAPTCHA token.
 * Validates the `cf-turnstile-response` field in the request body.
 */
exports.verifyCaptcha = async (req, res, next) => {
  // If no secret key is configured, or if running tests, bypass the check
  if (!process.env.TURNSTILE_SECRET_KEY || process.env.NODE_ENV === 'test') {
    logger.warn('CAPTCHA verification bypassed (either missing key or test env).');
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

    // CAPTCHA is valid, proceed
    next();
  } catch (error) {
    logger.error('Error verifying CAPTCHA:', error);
    res.status(500).json({ message: 'Internal server error during CAPTCHA verification.' });
  }
};
