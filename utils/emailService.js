const nodemailer = require('nodemailer');

// Configure the email transporter
// Using environment variables for security
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
});

const sendEmail = async ({ to, subject, html }) => {
  // Check if email service is configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email service not configured. Skipping email send.');
    return null;
  }

  try {
    const mailOptions = {
      from: `"HabitHarbor" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    return null;
  }
};

const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #8B5CF6;">Welcome to HabitHarbor, ${user.name}! 🚀</h2>
      <p>We're thrilled to have you on board. HabitHarbor is your new space for building better habits, mindful journaling, and achieving your goals.</p>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; font-size: 16px;">Next Steps:</h3>
        <ul style="padding-left: 20px;">
          <li>Set your first daily goal</li>
          <li>Log your mood in the Journal</li>
          <li>Set up focus sessions to get things done</li>
        </ul>
      </div>
      <p>If you have any questions, just reply to this email!</p>
      <p>Stay focused,<br>The HabitHarbor Team</p>
    </div>
  `;
  return sendEmail({ to: user.email, subject: 'Welcome to HabitHarbor! ✨', html });
};

const sendLoginNotification = async (user) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #8B5CF6;">New Login Detected</h2>
      <p>Hello ${user.name},</p>
      <p>A new login was detected on your HabitHarbor account at ${new Date().toLocaleString()}.</p>
      <p>If this was you, you can ignore this email. If not, please change your password immediately.</p>
      <p>Stay secure,<br>The HabitHarbor Team</p>
    </div>
  `;
  return sendEmail({ to: user.email, subject: 'New Login to HabitHarbor 🛡️', html });
};

module.exports = { sendEmail, sendWelcomeEmail, sendLoginNotification };
