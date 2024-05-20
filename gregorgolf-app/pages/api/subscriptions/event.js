import { apiHandler } from 'helpers/api';

import Stripe from 'stripe';

export default apiHandler({
    post: payment
});

async function payment(req, res) {
    
    //return res.status(200).json({});
    
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const { priceId, type, eventId } = await req.body;
        //console.log(priceId, type);

        // Create Checkout Sessions from body params.
        const session = await stripe.checkout.sessions.create({
            line_items: [
            {
                // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                price: priceId,
                quantity: 1,
            },
            ],
            mode: type,
            success_url: `${req.headers.origin}/?success=true`,
            cancel_url: `${req.headers.origin}/?canceled=true&event=${eventId}`,
            automatic_tax: {enabled: true},
        });

        return res.status(200).json(session.url);
    } catch (err) {
        return res.status(err.statusCode || 500).json(err.message);
    }
}