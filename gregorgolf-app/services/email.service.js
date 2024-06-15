import { fetchWrapper } from 'helpers';

const baseUrl = `${process.env.NEXT_PUBLIC_API_URI}/emails`;

export const emailService = {
    sendPasswordReset,
    sendAccountRegistration,
    sendAccountActive,
    sendEventConfirmation
};

async function sendPasswordReset(user){
    return await fetchWrapper.post(`${baseUrl}/password/reset`, user);
}

async function sendAccountRegistration(user){
    return await fetchWrapper.post(`${baseUrl}/account/registration`, user);
}

async function sendAccountActive(user){
    return await fetchWrapper.post(`${baseUrl}/account/active`, user);
}

async function sendEventConfirmation(details){
    return await fetchWrapper.post(`${baseUrl}/event/confirmation`, details);
}