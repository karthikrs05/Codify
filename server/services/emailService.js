import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use an App Password if using Gmail
  },
});

export const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: `"Codify Arena" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Codify Verification Code',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
        <h2 style="color: #7C3AED; text-align: center;">Welcome to Codify Arena!</h2>
        <p>Hello,</p>
        <p>Thank you for joining Codify Arena. To complete your registration, please use the following 6-digit verification code:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #7C3AED; background: #f3f0ff; padding: 10px 20px; border-radius: 5px;">${code}</span>
        </div>
        <p>This code will expire in 1 hour.</p>
        <p>If you didn't create an account with us, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">&copy; 2026 Codify Arena. Happy Coding!</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
