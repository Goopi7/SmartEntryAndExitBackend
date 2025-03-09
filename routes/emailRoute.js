const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: process.env.USERID,
    pass: process.env.PASSWORD
  }
});

async function forwardEmail(from, subject, text) {
  let info = await transporter.sendMail({
    from: '',
    to: 'studentEmail',
    subject: 'FWD: ' + subject,
    text: text
  });
  console.log('Email forwarded: ', info.response);
}

forwardEmail(process.env.USERID, 'Late Entry Notification', `Dear Student,

This is to inform you that you were late by 10 minutes on 07 March 2025. Your total number of late entries has now reached 10 times.
`);

