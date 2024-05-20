import { fetchWrapper } from 'helpers';

const baseUrl = `${process.env.NEXT_PUBLIC_API_URI}/subscriptions`;

export const subscriptionService = {
    processEvent,
    processAccount,
    updateAccount,
};

async function processEvent(priceId, type, eventId) {
    return await fetchWrapper.post(`${baseUrl}/event`, { priceId, type, eventId });
}

async function processAccount(yearly, userId) {
    return await fetchWrapper.post(`${baseUrl}/account`, { yearly, userId });
}

async function updateAccount(userId, sessionId){
    return await fetchWrapper.put(`${baseUrl}/${userId}`, sessionId);
}
