import { apiHandler, eventsRepo } from 'helpers/api';

export default apiHandler({
    get: getInRange,
});

async function getInRange(req, res) {
    const { date } = req.query;

    const events = await eventsRepo.getInRange(date[0], date[1], date[2]);

    if (!events) throw 'No events Found';

    return res.status(200).json(events);
}