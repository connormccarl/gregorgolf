import { apiHandler, usersRepo } from 'helpers/api';

export default apiHandler({
    put: update
});

async function update(req, res) {
    await usersRepo.updatePassword(req.query.email, req.body);
    return res.status(200).json({});
}