import { apiHandler, eventsRepo } from 'helpers/api';

export default apiHandler({
    get: getById,
});

async function getById(req, res) {
    const events = await eventsRepo.getById(req.query.date);

    if (!events) throw 'No events Found';

    return res.status(200).json(events);
}