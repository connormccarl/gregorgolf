import { apiHandler, usersRepo } from 'helpers/api';

import Stripe from 'stripe';

export default apiHandler({
    put: update
});

async function update(req, res) {
    try {
        // get subscription details from stripe
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.retrieve(req.body);
        const customer = await stripe.customers.retrieve(session.customer);

        console.log('session: ', session);
        console.log('customer: ', customer);
        
        // update user record with subscription info
        
        //await usersRepo.updateSubscription(req.query.userId, req.body);
        
        return res.status(200).json({});
    } catch (err) {
        return res.status(err.statusCode || 500).json(err.message);
    }
}