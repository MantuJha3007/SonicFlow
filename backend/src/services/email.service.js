const { OAuth2Client } = require('google-auth-library');
const config = require('../config/config.js');

const client = new OAuth2Client(config.GOOGLE_CLIENT_ID, config.GOOGLE_CLIENT_SECRET);
client.setCredentials({ refresh_token: config.GOOGLE_REFRESH_TOKEN });

const sendEmail = async (to, subject, text, html) => {
    try {
        // Construct standard MIME email message
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
        const messageParts = [
            `From: "SonicFlow" <${config.GOOGLE_USER}>`,
            `To: ${to}`,
            'Content-Type: text/html; charset=utf-8',
            'MIME-Version: 1.0',
            `Subject: ${utf8Subject}`,
            '',
            html || text, // Fallback to text if html is not provided
        ];
        
        const message = messageParts.join('\n');
        
        // Base64url encode the message
        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        // Send HTTP POST request to Gmail API to bypass SMTP restrictions
        const res = await client.request({
            url: 'https://gmail.googleapis.com/upload/gmail/v1/users/me/messages/send',
            method: 'POST',
            data: {
                raw: encodedMessage
            }
        });

        console.log('Email sent via API. Message ID: %s', res.data.id);
    } catch (error) {
        console.error('Error sending email via API:', error.response?.data || error.message);
    }
};

module.exports = { sendEmail };