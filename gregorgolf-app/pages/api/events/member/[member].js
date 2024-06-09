import { apiHandler, eventsRepo } from 'helpers/api';

export default apiHandler({
    get: getByMember,
});

async function getByMember(req, res) {
    const events = await eventsRepo.getByMember(req.query.member);

    if (!events) throw 'No events Found';

    return res.status(200).json(events);
}