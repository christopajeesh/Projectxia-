import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const user = process.env.GMAIL_USER || 'theprojectxia@gmail.com';
const pass = process.env.GMAIL_APP_PASSWORD;

console.log(`\nTesting Gmail SMTP dispatch from: ${user}`);
console.log(`Current Password Length: ${pass ? pass.length : 0} characters`);

if (!pass || pass === 'Pattasseril@123') {
  console.log(`
❌ NOTE: 'Pattasseril@123' is a regular account password.
Google requires a 16-character App Password when 2-Step Verification is ON.

How to generate your 16-character App Password:
1. Open https://myaccount.google.com/apppasswords
2. Enter App name: ProjectXia
3. Click 'Create' to copy your 16-character password (e.g. abcd efgh ijkl mnop)
4. Replace GMAIL_APP_PASSWORD in backend/.env
`);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user, pass },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('\n❌ Google SMTP Connection Error:', error.message);
    if (error.message.includes('534') || error.message.includes('535')) {
      console.log('👉 Cause: Google requires a 16-character App Password from https://myaccount.google.com/apppasswords');
    }
  } else {
    console.log('\n✅ SUCCESS! Google SMTP is connected and ready to send real live emails.');
  }
});
