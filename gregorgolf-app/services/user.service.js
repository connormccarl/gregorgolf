import { BehaviorSubject } from 'rxjs';
import getConfig from 'next/config';
import Router from 'next/router';

import { fetchWrapper } from 'helpers';
import { alertService } from './alert.service';

const { publicRuntimeConfig } = getConfig();
const baseUrl = `${publicRuntimeConfig.apiUrl}/users`;
const userSubject = new BehaviorSubject(typeof window !== 'undefined' && JSON.parse(localStorage.getItem('user')));

export const userService = {
    user: userSubject.asObservable(),
    get userValue() { return userSubject.value },
    login,
    logout,
    register,
    getAll,
    getById,
    update,
    updatePassword,
    getByEmail,
    sendPasswordReset,
    addPhoto,
    removePhoto,
    delete: _delete
};

async function login(email, password) {
    const user = await fetchWrapper.post(`${baseUrl}/authenticate`, { email, password });

    // publish user to subscribers and store in local storage to stay logged in between page refreshes
    userSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
}

function logout() {
    alertService.clear();
    // remove user from local storage, publish null to user subscribers and redirect to login page
    localStorage.removeItem('user');
    userSubject.next(null);
    Router.push('/');
}

async function register(user) {
    await fetchWrapper.post(`${baseUrl}/register`, user);
}

async function getAll() {
    return await fetchWrapper.get(baseUrl);
}

async function getById(id) {
    return await fetchWrapper.get(`${baseUrl}/${id}`);
}

async function getByEmail(email) {
    return await fetchWrapper.get(`${baseUrl}/id/${email}`);
}

async function sendPasswordReset(user){
    return await fetchWrapper.post(`${baseUrl}/password/reset`, user);
}

async function updatePassword(email, params) {
    return await fetchWrapper.put(`${baseUrl}/password/${email}`, params);
}

async function update(id, params) {
    await fetchWrapper.put(`${baseUrl}/${id}`, params);

    // update stored user if the logged in user updated their own record
    if (userSubject.value && id === userSubject.value.id) {
        // update local storage
        const user = { ...userSubject.value, ...params };
        localStorage.setItem('user', JSON.stringify(user));

        // publish updated user to subscribers
        userSubject.next(user);
    }
}

async function addPhoto(file, id) {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("id", id);

    const photoPath = await fetchWrapper.post(`${baseUrl}/photo/add`, formData);
    
    // update stored user if the logged in user updated their own record
    if (userSubject.value && id === userSubject.value.id) {
        // update local storage
        const user = { ...userSubject.value, photo: photoPath };
        localStorage.setItem('user', JSON.stringify(user));

        // publish updated user to subscribers
        userSubject.next(user);
    }

    return photoPath;
}

async function removePhoto(image, id) {
    await fetchWrapper.put(`${baseUrl}/photo/remove`, { id, image });

    // update stored user if the logged in user updated their own record
    if (userSubject.value && id === userSubject.value.id) {
        // update local storage
        const user = { ...userSubject.value, photo: undefined };
        localStorage.setItem('user', JSON.stringify(user));

        // publish updated user to subscribers
        userSubject.next(user);
    }
}

// prefixed with underscored because delete is a reserved word in javascript
async function _delete(id) {
    await fetchWrapper.delete(`${baseUrl}/${id}`);

    // auto logout if the logged in user deleted their own record
    if (id === userSubject.value.id) {
        logout();
    }
}