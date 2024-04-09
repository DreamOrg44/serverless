require('dotenv').config();
const { Pool } = require('pg');
const mailgun = require("mailgun-js");
const { v4: uuidv4 } = require('uuid');
const EmailTracking = require('./model/emailTrackingModel');

const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN });

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

async function verifyEmail(userData) {
  try {
    console.log("CloudEvent received is ", userData);
    //const message = cloudEvent.data ? JSON.parse(Buffer.from(cloudEvent.data, 'base64').toString()) : {};
    const { id, email } = userData;

    const token = uuidv4();
    const verificationLink = `https://rushikeshdeore.me/verify?token=${token}&userId=${id}`;

    await trackEmail(id, email, verificationLink, token);
    console.log(`Email tracking performed for email= ${email}, and token= ${token}`);

    // const verificationLink = `http://localhost:3000/verify?token=${token}&userId=${id}`;

    await sendVerificationEmail(email, verificationLink);
    console.log(`Verification email sent to email= ${email}`);

    // if (response.statusCode === 200) {
    //   await trackEmail(id, email, verificationLink, token);
    //   console.log(`Email tracking performed for email= ${email}, and token= ${token}`);
    // }
    // else {
    //   console.error('Failed to send verification email.');
    // }
    // Track the sent email in Cloud SQL


  } catch (error) {
    console.error('Error verifying the user:', error);
    throw new Error('Error verifying the user:');
  }
}


async function sendVerificationEmail(email, verificationLink) {
  console.log("Inside sendVerificationEmail and the values received are ", "email= ", email, "verificationLink= ", verificationLink);
  const data = {
    from: `WebApp User <no-reply@${process.env.MAILGUN_DOMAIN}>`,
    to: email,
    subject: "Verify Your Email Address for Webapp Access",
    html: `<p>Click <a href="${verificationLink}" style="background-color: #4CAF50; /* Green */
    border: none;
    color: white;
    padding: 5px 5px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    cursor: pointer;
    border-radius: 10px;">Verify Your Email Address</a> to verify your email address.</p>
    <p>If you did not sign up for WebApp, please disregard this email.</p>
    <p>To unsubscribe from future emails, <a href="www.google.com">click here</a>.</p>
    <p>Best regards,<br/>Dream Org</p>`,
  };

  try {
    await mg.messages().send(data);
    console.log("Verification email sent successfully.");
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Error sending verification email");
  }
}

async function trackEmail(userId, email, verificationLink, verificationToken) {
  console.log("Inside trackEmail and the values are ", "userId= ", userId, "email= ", email, "verificationLink= ", verificationLink, "verificationToken= ", verificationToken);
  try{
    await EmailTracking.create({ userId, email, verificationLink, verificationToken });
    console.log("Email tracking updated successfully");
  }
  catch(error){
    if (error.name === 'SequelizeUniqueConstraintError') {
      logger.error(error, 'User with this id and token already exists');
      res.status(400).json({ error: 'User with this id and token already exists' });
    } else {
      console.error('Error saving user token information:', error);
      res.status(500).send('Internal Server Error');
    }
  }
  
  

  // const query = {
  //   text: 'INSERT INTO email_trackings (id, email, verificationLink,verificationToken) VALUES ($1, $2, $3, $4)',
  //   values: [id, email, verificationLink, verificationToken],
  // };
  // await pool.query(query);
}

module.exports = {
  verifyEmail,
};