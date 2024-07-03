import { apiHandler, usersRepo } from 'helpers/api';

import Stripe from 'stripe';

export default apiHandler({
    post: openPortal
});

async function openPortal(req, res) {
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const customerId = req.body;

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${req.headers.origin}/account/profile`,
        });

        return res.status(200).json(session.url);
    } catch (err) {
        return res.status(err.statusCode || 500).json(err.message);
    }
}