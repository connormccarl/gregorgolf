import { alertService } from '@/services';
import { apiHandler, usersRepo } from 'helpers/api';

import Stripe from 'stripe';

export default apiHandler({
    post: payment
});

async function payment(req, res) {
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const { yearly, userId, discount } = await req.body;
        //console.log("yearly: ", yearly);

        // set the subscription to monthly or yearly
        let priceId;
        if(discount){
            if(discount === '22FOUGRG') {
                priceId = 'price_1PhyQJLcjY6vEoOvVHOG1hXF'; // LIVE: price_1PhyQJLcjY6vEoOvVHOG1hXF
            } else if(discount === '22FAMGRG') {
                priceId = 'price_1PGOG5LcjY6vEoOvSQklaAJA'; // TEST: price_1PL8oqLcjY6vEoOvS6T6fj27, LIVE: price_1PGOG5LcjY6vEoOvSQklaAJA
            } else {
                priceId = 'price_1PhyRqLcjY6vEoOvVjcRLjzk'; // TEST: price_1PGOrtLcjY6vEoOvQYGI8nNF, LIVE: price_1PhyRqLcjY6vEoOvVjcRLjzk
            }
        } else {
            if(yearly){
                priceId = 'price_1PGOHzLcjY6vEoOv3JpVfYmD'; // TEST: price_1PH7RxLcjY6vEoOvq5CcqmSl, LIVE: price_1PGOHzLcjY6vEoOv3JpVfYmD
            } else {
                priceId = 'price_1PhyRqLcjY6vEoOvVjcRLjzk'; // TEST: price_1PGOrtLcjY6vEoOvQYGI8nNF, LIVE: price_1PhyRqLcjY6vEoOvVjcRLjzk
            }
        }

        // get start of billing for prorated first month
        let billingStart = new Date();
        billingStart.setMonth(billingStart.getMonth() + 1, 1);

        const checkoutBody = {
            line_items: [
            {
                // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                price: priceId,
                quantity: 1,
            },
            ],
            mode: 'subscription',
            success_url: `${req.headers.origin}/subscription/?success=true&user=${userId}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/subscription/?canceled=true`,
            automatic_tax: {enabled: true},
            subscription_data: {
                billing_cycle_anchor: Math.floor(billingStart.getTime()/1000),
            },
        };

        // add coupon code
        if(discount && discount === 'GREGOR12'){
            checkoutBody.discounts = [{ coupon: 'FbEci34p' }];
        }

        // if the customer already exists in Stripe use it (for cancelled then readded subscriptions)
        const user = await usersRepo.getById(userId);
        if(user.customerId){
            checkoutBody.customer = user.customerId;
        } else {
            checkoutBody.customer_email = user.email;
        }

        // Create Checkout Sessions from body params.
        const session = await stripe.checkout.sessions.create(checkoutBody);

        return res.status(200).json(session.url);

        //return res.status(200).json({});
    } catch (err) {
        throw err.raw.message;
    }
}