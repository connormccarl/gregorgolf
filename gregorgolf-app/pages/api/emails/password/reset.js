import { apiHandler } from 'helpers/api';

import sendMail from "@/helpers/email/gmail";
import { render } from "@react-email/render";

import { PasswordResetEmail } from '@/emails/password-reset';

export default apiHandler({
    post: sendEmail,
});

async function sendEmail(req, res) {
    const baseUrl = process.env.NEXT_PUBLIC_URI;

    const toEmail = req.body.email;
    const firstName = req.body.firstName;
    const resetLink = `${baseUrl}/account/password/${req.body.id}`

    // convert email template to raw html
    const plainText = render(PasswordResetEmail({firstName, resetLink}), {
        plainText: true
    });
    const htmlContent = render(PasswordResetEmail({firstName, resetLink}));

    const options = {
        to: toEmail,
        replyTo: 'jay@gpcgolf.com',
        subject: 'Gregor Golf - Password Reset',
        text: plainText,
        html: htmlContent,
        textEncoding: 'base64',
        headers: [
            { key: 'X-Application-Developer', value: 'Connor McCarl' },
            { key: 'X-Application-Version', value: 'v1.0.0' },
        ],
    };

    try {
        const messageId = await sendMail(options);
        res.status(200).json({ success: 'true' });
    } catch (e) {
        throw e;
    }
}