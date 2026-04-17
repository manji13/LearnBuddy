const nodemailer = require('nodemailer');

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!emailUser || !emailPass) {
  const missing = [];
  if (!emailUser) missing.push('EMAIL_USER');
  if (!emailPass) missing.push('EMAIL_PASS');
  const message = `Missing email credentials: ${missing.join(', ')}. Please set these values in your backend .env file.`;
  console.error(`❌ Email transporter initialization failed: ${message}`);
  throw new Error(message);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error('❌ Email transporter error:', error.message);
  } else {
    console.log('✅ Email transporter ready');
  }
});

module.exports = transporter;
