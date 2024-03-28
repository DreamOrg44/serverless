const functions = require('@google-cloud/functions-framework');
const { verifyEmail } = require('./main')


functions.cloudEvent('verifyEmail', cloudEvent => {

  const message = cloudEvent.data.message;
  const userData = message.data
    ? JSON.parse(Buffer.from(message.data, "base64").toString())
    : null;

    if (!userData || !userData.email) {
    console.error("Userdata not found");
    return;
  }
  verifyEmail(userData);
});
