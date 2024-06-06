import { apiHandler, eventsRepo } from 'helpers/api';
import Stripe from 'stripe';

export default apiHandler({
    put: update,
    delete: _delete
});

async function update(req, res) {
    // update if joining an event
    if(req.body.member){
        // add data to existing event if joining an event update
        const event = await eventsRepo.getById(req.query.id);
        const payload = {
            members: [...event.members, req.body.member],
            guests: event.guests + req.body.guests
        };

        await eventsRepo.update(req.query.id, payload);
        return res.status(200).json({});
    } else if(req.body.remove) { 
        try {
            // remove data from existing event if joined canceled
            const event = await eventsRepo.getById(req.query.id);

            const payload = {
                members: [...event.members.toSpliced(-1)],
                guests: event.guests - req.body.remove
            };

            await eventsRepo.update(req.query.id, payload);

            return res.status(200).json({});
        } catch (err) { // getting mongoose version modifiedPaths error everytime, ignore
            return res.status(200).json({});
        }
    } else { // update for event payment
        try {
            // get subscription details from stripe
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
            const session = await stripe.checkout.sessions.retrieve(req.body.sessionId);

            // build update payload
            const event = await eventsRepo.getById(req.query.id);
            let payload = {};
            // if there is more than 1 member, then joining event
            if(event.members.length > 1){
                payload.payment = event.payment + ',' + req.body.payment;
                payload.paymentId = event.paymentId + ',' + session.payment_intent;
            } else {
                payload.payment = req.body.payment;
                payload.paymentId = session.payment_intent;
            }
    
            await eventsRepo.update(req.query.id, payload);
            return res.status(200).json({});
        } catch (err) {
            return res.status(err.statusCode || 500).json(err.message);
        }
    }
}

async function _delete(req, res) {
    await eventsRepo.delete(req.query.id);
    return res.status(200).json({});
}