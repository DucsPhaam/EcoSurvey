// Email service: Sends automated emails (registration, password reset, account approval, proof status) via Nodemailer.
const logger = require('../utils/logger');

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  const nodemailer = require('nodemailer');
  const port = parseInt(process.env.SMTP_PORT || '587', 10);

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass: pass.replace(/\s+/g, ''),
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
  });
};

const verifySmtpConnection = async () => {
  logger.info('[EMAIL SERVICE] Runtime SMTP config:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    emailFrom: process.env.EMAIL_FROM,
    nodeEnv: process.env.NODE_ENV,
  });

  const transporter = getTransporter();

  if (!transporter) {
    logger.error('[EMAIL SERVICE] SMTP transporter is null');
    return false;
  }

  try {
    await transporter.verify();
    logger.info('[EMAIL SERVICE] SMTP VERIFY SUCCESS');
    return true;
  } catch (error) {
    logger.error('[EMAIL SERVICE] SMTP VERIFY FAILED', {
      code: error.code,
      responseCode: error.responseCode,
      command: error.command,
      message: error.message,
    });
    return false;
  }
};

const getFromAddress = () => {
  const rawFrom = (process.env.EMAIL_FROM || '').replace(/['"]/g, '').trim();
  if (rawFrom) {
    const match = rawFrom.match(/^(.*?)\s*<([^>]+)>$/);
    if (match) {
      const name = match[1].trim();
      const email = match[2].trim();
      return name ? `"${name}" <${email}>` : email;
    }
    if (rawFrom.includes('@')) {
      return `"EcoSurvey" <${rawFrom}>`;
    }
  }
  const fallbackEmail = process.env.SMTP_USER || 'noreply@ecosurvey.edu.vn';
  return `"EcoSurvey" <${fallbackEmail}>`;
};

const sendMail = async ({ to, subject, html }) => {
  const transporter = getTransporter();
  if (!transporter) {
    logger.info(`[EMAIL LOG - SMTP NOT CONFIGURED] To: ${to} | Subject: ${subject}`);
    return;
  }

  const fromAddress = getFromAddress();

  try {
    await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      html,
    });
    logger.info(`[EMAIL SERVICE] SMTP SEND SUCCESS to "${to}" (Subject: "${subject}")`);
  } catch (error) {
    logger.error('[EMAIL SERVICE] SMTP SEND FAILED', {
      code: error.code,
      responseCode: error.responseCode,
      command: error.command,
      message: error.message,
    });
    throw error;
  }
};

exports.verifySmtpConnection = verifySmtpConnection;

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
