import { apiHandler, usersRepo } from 'helpers/api';

export default apiHandler({
    get: getByEmail
});

async function getByEmail(req, res) {
    const user = await usersRepo.getByEmail(req.query.email);

    if (!user) throw 'User Not Found';

    return res.status(200).json(user);
}