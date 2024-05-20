import { apiHandler } from 'helpers/api';

import Stripe from 'stripe';

export default apiHandler({
    post: payment
});

async function payment(req, res) {
    
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const { yearly, userId } = await req.body;
        //console.log("yearly: ", yearly);

        let priceId;
        if(yearly){
            priceId = 'price_1PH7RxLcjY6vEoOvq5CcqmSl';
        } else {
            priceId = 'price_1PGOrtLcjY6vEoOvQYGI8nNF';
        }

        // Create Checkout Sessions from body params.
        const session = await stripe.checkout.sessions.create({
            line_items: [
            {
                // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                price: priceId,
                quantity: 1,
            },
            ],
            mode: 'subscription',
            success_url: `${req.headers.origin}/account/login/?success=true&user=${userId}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/account/register/?canceled=true&user=${userId}`,
            automatic_tax: {enabled: true},
        });

        return res.status(200).json(session.url);

        //return res.status(200).json({});
    } catch (err) {
        return res.status(err.statusCode || 500).json(err.message);
    }
}