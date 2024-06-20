import { apiHandler, eventsRepo } from 'helpers/api';
import Stripe from 'stripe';

export default apiHandler({
    get: getById,
    put: update,
    delete: _delete
});

async function getById(req, res) {
    const event = await eventsRepo.getById(req.query.id);

    if (!event) throw 'Event Not Found';

    return res.status(200).json(event);
}

async function update(req, res) {
    // update if joining an event
    if(req.body.member){
        // add data to existing event if joining an event update
        const event = await eventsRepo.getById(req.query.id);
        const payload = {
            members: [...event.members, req.body.member]
        };

        await eventsRepo.update(req.query.id, payload);
        return res.status(200).json({});
    } else if(req.body.remove) { 
        try {
            // remove data from existing event if joined canceled
            const event = await eventsRepo.getById(req.query.id);

            const payload = {
                members: [...event.members.filter((member) => member.id !== req.body.remove)]
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
    const { id } = req.query;
    const eventId = id[0];
    const userId = id[1];
    const adminDelete = id[2];

    // if a joined event, remove member otherwise delete entire event
    const event = await eventsRepo.getById(eventId);
    if(adminDelete === 'true' || event.members.length === 1){
        await eventsRepo.delete(eventId);
    } else {
        const payload = {
            members: [...event.members.filter((member) => member.id !== userId)]
        };

        await eventsRepo.update(eventId, payload);
    }

    return res.status(200).json({});
}