import { fetchWrapper } from 'helpers';

const baseUrl = `${process.env.NEXT_PUBLIC_API_URI}/app`;

export const appService = {
    getNumIn60,
    update,
    createProfile,
};

async function getNumIn60() {
    return await fetchWrapper.get(baseUrl);
}

async function update(params) {
    await fetchWrapper.put(`${baseUrl}`, params);
}

async function createProfile() {
    await fetchWrapper.post(baseUrl);
}