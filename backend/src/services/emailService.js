const logger = require('../utils/logger');

/**
 * Email Service — Nodemailer with Phase 1 console logging fallback.
 * When SMTP credentials are not configured, emails are logged to console.
 */

let transporter = null;

(async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const nodemailer = require('nodemailer');
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_PORT === '465',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.verify();
      logger.info('✅ Email transporter ready');
    } catch (e) {
      logger.warn('⚠️  Email transporter failed. Emails will be logged only:', e.message);
      transporter = null;
    }
  } else {
    logger.warn('⚠️  SMTP not configured. Emails will be logged to console (Phase 1 mode).');
  }
})();

const sendMail = async ({ to, subject, html }) => {
  if (transporter) {
    await transporter.sendMail({ from: process.env.EMAIL_FROM || 'EcoSurvey <noreply@ecosurvey.edu.vn>', to, subject, html });
  } else {
    logger.info(`[EMAIL LOG] To: ${to} | Subject: ${subject}`);
  }
};

exports.sendRegistrationEmail = async (email, fullName) => {
  await sendMail({
    to: email,
    subject: 'EcoSurvey — Registration Received',
    html: `<h2>Welcome to EcoSurvey, ${fullName}!</h2>
           <p>Your account registration has been received and is <strong>pending admin approval</strong>.</p>
           <p>You will be notified once your account has been reviewed.</p>
           <br><p>— EcoSurvey Team</p>`,
  });
};

exports.sendStatusUpdateEmail = async (email, fullName, status, reason) => {
  const approved = status === 'Approved';
  await sendMail({
    to: email,
    subject: `EcoSurvey — Account ${approved ? 'Approved' : 'Rejected'}`,
    html: `<h2>Hello, ${fullName}</h2>
           ${approved
             ? `<p>🎉 Your EcoSurvey account has been <strong>approved</strong>! You can now log in.</p>`
             : `<p>Unfortunately, your EcoSurvey account registration was <strong>rejected</strong>.</p>
                ${reason ? `<p>Reason: ${reason}</p>` : ''}
                <p>Please contact Admin if you believe this is a mistake.</p>`}
           <br><p>— EcoSurvey Team</p>`,
  });
};

exports.sendParticipationReviewEmail = async (email, fullName, eventName, status, reason) => {
  const approved = status === 'Approved';
  await sendMail({
    to: email,
    subject: `EcoSurvey — Report ${approved ? 'Approved' : 'Rejected'}: ${eventName}`,
    html: `<h2>Hello, ${fullName}</h2>
           ${approved
             ? `<p>✅ Your participation report "<strong>${eventName}</strong>" has been <strong>approved</strong>. You earned <strong>50 points</strong>!</p>`
             : `<p>Your participation report "<strong>${eventName}</strong>" was <strong>rejected</strong>.</p>
                ${reason ? `<p>Reason: ${reason}</p>` : ''}`}
           <br><p>— EcoSurvey Team</p>`,
  });
};
