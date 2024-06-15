import { apiHandler } from 'helpers/api';

import sendMail from "@/helpers/email/gmail";
import { render } from "@react-email/render";

import { EventConfirmedEmail } from '@/emails/event-confirmed';

export default apiHandler({
    post: sendEmail,
});

async function sendEmail(req, res) {
    const toEmail = req.body.email;
    const firstName = req.body.firstName;
    const eventType = req.body.eventType;
    const eventDate = req.body.eventDate;
    const eventTime = req.body.eventTime;
    const eventHours = req.body.eventHours;
    const eventGuests = req.body.eventGuests;

    // convert email template to raw html
    const plainText = render(EventConfirmedEmail({firstName, eventType, eventDate, eventTime, eventHours, eventGuests}), {
        plainText: true
    });
    const htmlContent = render(EventConfirmedEmail({firstName, eventType, eventDate, eventTime, eventHours, eventGuests}));

    const options = {
        to: toEmail,
        replyTo: 'jay@gpcgolf.com',
        subject: `Gregor Golf - Booking ${eventType}`,
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