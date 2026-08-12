// Email service: Sends automated emails (registration, password reset, account approval, proof status) via Nodemailer.
const logger = require('../utils/logger');

const getTransporter = () => {
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  let user = (process.env.SMTP_USER || '').trim();
  const rawPass = process.env.SMTP_PASS;

  // Fallback: If SMTP_USER is missing on Railway, extract email from EMAIL_FROM
  if (!user && process.env.EMAIL_FROM) {
    const fromStr = process.env.EMAIL_FROM.trim();
    const match = fromStr.match(/<([^>]+)>/) || fromStr.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (match) {
      user = match[1] || match[0];
    } else if (fromStr.includes('@')) {
      user = fromStr;
    }
  }

  if (!user || !rawPass) {
    const missing = [];
    if (!user) missing.push('SMTP_USER / EMAIL_FROM');
    if (!rawPass) missing.push('SMTP_PASS');
    logger.warn(`⚠️ [EMAIL SERVICE] SMTP non-functional. Missing required variable(s): ${missing.join(', ')}. Please set SMTP_USER and SMTP_PASS in Railway environment variables.`);
    return null;
  }

  const nodemailer = require('nodemailer');
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const pass = rawPass.replace(/\s+/g, ''); // Strip spaces from Gmail App Password

  // Google Workspace (@aptechlearning.edu.vn) & standard Gmail support
  if (host.includes('gmail') || user.endsWith('@gmail.com') || user.includes('aptech')) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: port,
      secure: port === 465, // true for 465, false for 587
      auth: {
        user: user,
        pass: pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
    });
  }

  return nodemailer.createTransport({
    host: host,
    port: port,
    secure: port === 465,
    auth: {
      user: user,
      pass: pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 15000,
  });
};

const sendMail = async ({ to, subject, html }) => {
  const transporter = getTransporter();
  if (transporter) {
    let smtpUser = (process.env.SMTP_USER || '').trim();
    if (!smtpUser && process.env.EMAIL_FROM) {
      const match = process.env.EMAIL_FROM.match(/<([^>]+)>/) || process.env.EMAIL_FROM.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (match) smtpUser = match[1] || match[0];
    }
    const fromAddress = process.env.EMAIL_FROM || (smtpUser ? `EcoSurvey <${smtpUser}>` : 'EcoSurvey <noreply@ecosurvey.edu.vn>');
    try {
      logger.info(`📧 Attempting to send email to "${to}" (Subject: "${subject}") from "${fromAddress}"...`);
      await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        html,
      });
      logger.info(`✅ Email sent successfully to "${to}" (Subject: "${subject}")`);
    } catch (err) {
      logger.error(`❌ Failed to send email to "${to}":`, err.stack || err.message);
    }
  } else {
    logger.info(`[EMAIL LOG - SMTP NOT CONFIGURED] To: ${to} | Subject: ${subject}`);
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
  let subject = '';
  let html = '';

  if (status === 'Approved') {
    subject = 'EcoSurvey — Tài khoản của bạn đã được phê duyệt thành công';
    html = `<h2>Xin chào ${fullName},</h2>
            <p>🎉 Chúc mừng! Tài khoản EcoSurvey của bạn đã được Quản trị viên <strong>phê duyệt thành công</strong>.</p>
            <p>Bây giờ bạn có thể đăng nhập vào hệ thống để bắt đầu tham gia các khảo sát nhận thức môi trường và tích điểm thưởng.</p>
            <br><p>— EcoSurvey Team</p>`;
  } else if (status === 'Locked') {
    subject = 'EcoSurvey — Thông báo khóa tài khoản';
    html = `<h2>Xin chào ${fullName},</h2>
            <p>⚠️ Tài khoản EcoSurvey của bạn đã bị <strong>khóa</strong> bởi Quản trị viên.</p>
            ${reason ? `<p><strong>Lý do:</strong> ${reason}</p>` : ''}
            <p>Nếu bạn cho rằng đây là sự nhầm lẫn, vui lòng liên hệ với Quản trị viên để được hỗ trợ.</p>
            <br><p>— EcoSurvey Team</p>`;
  } else {
    subject = 'EcoSurvey — Thông báo từ chối đăng ký tài khoản';
    html = `<h2>Xin chào ${fullName},</h2>
            <p>Rất tiếc, yêu cầu đăng ký tài khoản EcoSurvey của bạn đã <strong>bị từ chối</strong>.</p>
            ${reason ? `<p><strong>Lý do:</strong> ${reason}</p>` : ''}
            <p>Vui lòng liên hệ với Quản trị viên nếu bạn có thắc mắc hoặc cần giải đáp.</p>
            <br><p>— EcoSurvey Team</p>`;
  }

  await sendMail({ to: email, subject, html });
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

exports.sendForgotPasswordEmail = async (email, fullName, resetUrl) => {
  await sendMail({
    to: email,
    subject: 'EcoSurvey — Đặt lại mật khẩu',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <h2 style="color:#2d5a27;">EcoSurvey — Đặt lại mật khẩu</h2>
        <p>Xin chào <strong>${fullName}</strong>,</p>
        <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
        <p>Nhấn vào nút bên dưới để tạo mật khẩu mới. Liên kết sẽ hết hạn sau <strong>15 phút</strong>.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${resetUrl}"
             style="background:#2d5a27;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
            Đặt lại mật khẩu
          </a>
        </div>
        <p style="color:#666;font-size:13px;">Nếu bạn không yêu cầu điều này, hãy bỏ qua email này. Mật khẩu của bạn sẽ không thay đổi.</p>
        <p style="color:#666;font-size:12px;">Liên kết: <a href="${resetUrl}">${resetUrl}</a></p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
        <p style="color:#aaa;font-size:12px;">— EcoSurvey Team</p>
      </div>`,
  });
};

exports.sendEmailVerificationEmail = async (email, fullName, verifyUrl) => {
  await sendMail({
    to: email,
    subject: 'EcoSurvey — Xác minh địa chỉ email',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <h2 style="color:#2d5a27;">EcoSurvey — Xác minh Email</h2>
        <p>Xin chào <strong>${fullName}</strong>,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản EcoSurvey! Vui lòng xác minh địa chỉ email của bạn.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${verifyUrl}"
             style="background:#2d5a27;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
            Xác minh Email
          </a>
        </div>
        <p style="color:#666;font-size:13px;">Liên kết xác minh có hiệu lực trong <strong>24 giờ</strong>.</p>
        <p style="color:#666;font-size:12px;">Liên kết: <a href="${verifyUrl}">${verifyUrl}</a></p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
        <p style="color:#aaa;font-size:12px;">— EcoSurvey Team</p>
      </div>`,
  });
};
