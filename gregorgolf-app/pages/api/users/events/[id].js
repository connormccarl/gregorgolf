import { apiHandler, eventsRepo } from 'helpers/api';

export default apiHandler({
    get: get60DayEvents
});

async function get60DayEvents(req, res) {
    const numEvents = await eventsRepo.get60Days(req.query.id);

    return res.status(200).json(numEvents);
}