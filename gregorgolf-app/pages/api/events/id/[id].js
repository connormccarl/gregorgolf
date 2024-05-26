import { apiHandler, eventsRepo } from 'helpers/api';
import Stripe from 'stripe';

export default apiHandler({
    put: update,
    delete: _delete
});

async function update(req, res) {
    try {
        // get subscription details from stripe
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.retrieve(req.body.sessionId);

        await eventsRepo.update(req.query.id, { payment: req.body.payment, paymentId: session.payment_intent });
        return res.status(200).json({});
    } catch (err) {
        return res.status(err.statusCode || 500).json(err.message);
    }
}

async function _delete(req, res) {
    await eventsRepo.delete(req.query.id);
    return res.status(200).json({});
}