import { apiHandler } from 'helpers/api';

import sendMail from "@/helpers/email/gmail";
import { render } from "@react-email/render";

import { AccountRegisteredEmail } from '@/emails/account-registered';

export default apiHandler({
    post: sendEmail,
});

async function sendEmail(req, res) {
    const toEmail = req.body.email;
    const firstName = req.body.firstName;

    // convert email template to raw html
    const plainText = render(AccountRegisteredEmail({firstName}), {
        plainText: true
    });
    const htmlContent = render(AccountRegisteredEmail({firstName}));

    const options = {
        to: toEmail,
        replyTo: 'jay@gpcgolf.com',
        subject: 'Gregor Golf - Account Created',
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