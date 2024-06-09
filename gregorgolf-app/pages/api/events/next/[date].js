import { apiHandler, eventsRepo } from 'helpers/api';

export default apiHandler({
    get: getByDate,
});

async function getByDate(req, res) {
    const events = await eventsRepo.getNextByDate(req.query.date);

    if (!events) throw 'No events Found';

    return res.status(200).json(events);
}