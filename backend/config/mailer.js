const nodemailer = require('nodemailer');
const config = require('./config');

// Create Mailtrap transporter
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

// Email templates
const emailTemplates = {
  verificationOTP: (name, otp) => ({
    subject: 'Verify Your Email - NaviBuild',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .otp { font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
          .button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to NaviBuild!</h1>
            <p>Verify your email to get started</p>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Thank you for signing up with NaviBuild. To complete your registration and secure your account, please verify your email address using the OTP below:</p>
            
            <div class="otp-box">
              <p>Your verification code is:</p>
              <div class="otp">${otp}</div>
              <p><small>This code will expire in 10 minutes</small></p>
            </div>
            
            <p>If you didn't create an account with NaviBuild, please ignore this email.</p>
            
            <div class="footer">
              <p>Best regards,<br>The NaviBuild Team</p>
              <p><small>This is an automated email. Please do not reply to this message.</small></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Send email function
const sendEmail = async (to, template, ...args) => {
  try {
    const emailContent = emailTemplates[template](...args);
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'NaviBuild'}" <${process.env.EMAIL_FROM || 'noreply@navibuild.com'}>`,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  transporter
};
