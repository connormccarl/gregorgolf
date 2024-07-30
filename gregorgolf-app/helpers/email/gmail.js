// gmail.js

const { google } = require('googleapis');
const MailComposer = require('nodemailer/lib/mail-composer');

const getGmailService = () => {
  const client_id = process.env.GOOGLE_CLIENT_ID;
  const client_secret = process.env.GOOGLE_CLIENT_SECRET;
  const redirect_uri = process.env.GOOGLE_REDIRECT_URI;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
  oAuth2Client.setCredentials({
    "access_token": process.env.GOOGLE_TOKEN_ACCESS,
    "refresh_token": process.env.GOOGLE_TOKEN_REFRESH,
    "scope": process.env.GOOGLE_TOKEN_SCOPE,
    "token_type": process.env.GOOGLE_TOKEN_TYPE,
    "expiry_date": process.env.GOOGLE_TOKEN_EXPIRY
  });
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  return gmail;
};

const encodeMessage = (message) => {
  return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const createMail = async (options) => {
  const mailComposer = new MailComposer(options);
  const message = await mailComposer.compile().build();
  return encodeMessage(message);
};

const sendMail = async (options) => {
  const gmail = getGmailService();
  const rawMessage = await createMail(options);
  const { data: { id } = {} } = await gmail.users.messages.send({
    userId: 'me',
    resource: {
      raw: rawMessage,
    },
  });
  return id;
};

module.exports = sendMail;