import { apiHandler, appRepo } from 'helpers/api';

export default apiHandler({
    get: getNumIn60,
    put: update,
    post: createProfile
});

async function getNumIn60(req, res) {
    const numIn60 = await appRepo.getNumIn60();

    return res.status(200).json(numIn60);
}

async function update(req, res) {
    await appRepo.update(req.body);
    return res.status(200).json({});
}

async function createProfile(req, res) {
    await appRepo.createProfile();
    return res.status(200).json({});
}
