require('dotenv').config();
// const { PubSub } = require('@google-cloud/pubsub');
const { Pool } = require('pg');
// const nodemailer = require('nodemailer');
// const jwt = require('jsonwebtoken');
//const sgMail = require('@sendgrid/mail');
//sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const mailgun = require("mailgun-js");
const { v4: uuidv4 } = require('uuid');


const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN });


// Create a Pub/Sub client
// const pubSubClient = new PubSub();

// Create a PostgreSQL pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Nodemailer transporter
// const transporter = nodemailer.createTransport({
// });

exports.verifyEmail = async (event, context) => {
  try {
    const message = event.data ? JSON.parse(Buffer.from(event.data, 'base64').toString()) : {};
    const { userId, email } = message;

    // Generate a verification token
    // const token = jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: '2m' });
    const token = uuidv4();

    // Construct verification link
    const verificationLink = `http://rushikeshdeore.me/verify?token=${token}&userId=${userId}`;
    // Send verification email
    await sendVerificationEmail(email, verificationLink);

    // Track the sent email in Cloud SQL
    await trackEmail(userId, email, verificationLink);

    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Error sending verification email');
  }
};

async function sendVerificationEmail(email, verificationLink) {
  const data = {
    from: "your-email@example.com",
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