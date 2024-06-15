import { apiHandler } from 'helpers/api';

import sendMail from "@/helpers/email/gmail";
import { render } from "@react-email/render";

import { AccountApprovedEmail } from '@/emails/account-approved';

export default apiHandler({
    post: sendEmail,
});

async function sendEmail(req, res) {
    const toEmail = req.body.email;
    const firstName = req.body.firstName;
    const loginLink = process.env.NEXT_PUBLIC_URI + "/account/login";

    // convert email template to raw html
    const plainText = render(AccountApprovedEmail({firstName, loginLink}), {
        plainText: true
    });
    const htmlContent = render(AccountApprovedEmail({firstName, loginLink}));

    const options = {
        to: toEmail,
        replyTo: 'jay@gpcgolf.com',
        subject: 'Gregor Golf - Account Approved',
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