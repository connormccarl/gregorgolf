import { apiHandler, eventsRepo } from 'helpers/api';

export default apiHandler({
    get: getAll
});

async function getAll(req, res) {
    const events = await eventsRepo.getAll();
    return res.status(200).json(events);
}