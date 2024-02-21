import { apiHandler, usersRepo } from 'helpers/api';

import sendMail from "@/helpers/email/gmail";
import { render } from "@react-email/render";
import { alertService } from "@/services";

import { PasswordResetEmail } from '@/emails/PasswordResetTemplate';

export default apiHandler({
    post: sendEmail,
});

async function sendEmail(req, res) {
    const baseUrl = process.env.NODE_ENV == 'PRODUCTION'
    ? `https://${process.env.PUBLIC_URL}`
    : 'http://localhost:3001';

    const toEmail = req.body.email;
    const firstName = req.body.firstName;
    const link = `${baseUrl}/account/password/${req.body.id}`

    // convert email template to raw html
    const plainText = render(PasswordResetEmail({firstName, link}), {
        plainText: true
    });
    const htmlContent = render(PasswordResetEmail({firstName, link}));

    const options = {
        to: toEmail,
        replyTo: 'connormccarl@gmail.com',
        subject: 'Password Reset 🚀',
        text: plainText,
        html: htmlContent,
        textEncoding: 'base64',
        headers: [
            { key: 'X-Application-Developer', value: 'Connor McCarl' },
            { key: 'X-Application-Version', value: 'v1.0.0.2' },
        ],
    };

    try {
        const messageId = await sendMail(options);
        res.status(200).json({ success: 'true' });
    } catch (e) {
        alertService.error(e);
    }
}