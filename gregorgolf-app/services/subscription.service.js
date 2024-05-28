import { BehaviorSubject } from 'rxjs';
import { fetchWrapper } from 'helpers';

const baseUrl = `${process.env.NEXT_PUBLIC_API_URI}/subscriptions`;
const userSubject = new BehaviorSubject(typeof window !== 'undefined' && JSON.parse(localStorage.getItem('user')));

export const subscriptionService = {
    billForEvent,
    billForAccount,
    activateAccount,
};

async function billForEvent(customerId, priceId, type, eventId, join, guests) {
    return await fetchWrapper.post(`${baseUrl}/event`, { customerId, priceId, type, eventId, join, guests });
}

async function billForAccount(yearly, userId, discount) {
    return await fetchWrapper.post(`${baseUrl}/account`, { yearly, userId, discount });
}

async function activateAccount(userId, sessionId){
    const customerId = await fetchWrapper.put(`${baseUrl}/${userId}`, sessionId);

    // update logged in user's info
    if (userSubject.value && userId === userSubject.value.id) {
        // update local storage
        const user = { ...userSubject.value, customerId: customerId, accountStatus: 'active', subscriptionStatus: 'active' };
        localStorage.setItem('user', JSON.stringify(user));

        // publish updated user to subscribers
        userSubject.next(user);
    }
}
