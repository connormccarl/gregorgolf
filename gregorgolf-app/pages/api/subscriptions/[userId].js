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
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        
        //console.log("stripe sub: ", subscription);

        const customerId = session.customer;
        const subscriptionId = subscription.id;
        const subscriptionDate = new Date(subscription.created * 1000);
        const subscriptionFrequency = subscription.plan.interval;
        
        //console.log("subscription date: ", subscriptionDate);
        
        // update user record with subscription info
        await usersRepo.activateSubscription(req.query.userId, customerId, subscriptionId, subscriptionDate, subscriptionFrequency);
        
        return res.status(200).json(customerId);
    } catch (err) {
        return res.status(err.statusCode || 500).json(err.message);
    }
}