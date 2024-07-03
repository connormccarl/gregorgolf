import { apiHandler, eventsRepo } from 'helpers/api';

export default apiHandler({
    get: getByDate,
});

async function getByDate(req, res) {
    const { date } = req.query;

    const events = await eventsRepo.getByDate(date[0], date[1]);

    if (!events) throw 'No events Found';

    return res.status(200).json(events);
}