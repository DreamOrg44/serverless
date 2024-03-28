require('dotenv').config();
const { Pool } = require('pg');
const mailgun = require("mailgun-js");
const { v4: uuidv4 } = require('uuid');


const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function verifyEmail(userData) {
  try {
    console.log("CloudEvent received is ", userData);
    //const message = cloudEvent.data ? JSON.parse(Buffer.from(cloudEvent.data, 'base64').toString()) : {};
    const { id, email } = userData;

    const token = uuidv4();
    const verificationLink = `http://rushikeshdeore.me/verify?token=${token}&userId=${id}`;
    // const verificationLink = `http://localhost:3000/verify?token=${token}&userId=${id}`;

    await sendVerificationEmail(email, verificationLink);

    // Track the sent email in Cloud SQL
    await trackEmail(id, email, verificationLink);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Error sending verification email');
  }
}


async function sendVerificationEmail(email, verificationLink) {
  const data = {
    from: "WebApp User <no-reply@${process.env.MAILGUN_DOMAIN}>",
    to: email,
    subject: "Verify Your Email Address",
    html: `<p>Click <a href="${verificationLink}">here</a> to verify your email address.</p>`,
  };

  try {
    await mg.messages().send(data);
    console.log("Verification email sent successfully.");
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Error sending verification email");
  }
}

async function trackEmail(userId, email, verificationLink) {
  const query = {
    text: 'INSERT INTO email_tracking (user_id, email, verification_link) VALUES ($1, $2, $3)',
    values: [userId, email, verificationLink],
  };
  await pool.query(query);
}

module.exports = {
  verifyEmail,
};