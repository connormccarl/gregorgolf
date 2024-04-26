import { apiHandler, eventsRepo } from 'helpers/api';

export default apiHandler({
    post: add
});

async function add(req, res) {
    await eventsRepo.create(req.body);
    return res.status(200).json({});
}