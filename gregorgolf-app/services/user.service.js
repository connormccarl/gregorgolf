import { BehaviorSubject } from 'rxjs';
import Router from 'next/router';

import { fetchWrapper } from 'helpers';
import { alertService } from './alert.service';

const baseUrl = `${process.env.NEXT_PUBLIC_API_URI}/users`;
const appBaseUrl = `${process.env.NEXT_PUBLIC_API_URI}/app`;
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
    addPhoto,
    removePhoto,
    canAddEvent,
    delete: _delete
};

async function login(email, password) {
    const user = await fetchWrapper.post(`${baseUrl}/authenticate`, { email, password });

    // publish user to subscribers and store in local storage to stay logged in between page refreshes
    userSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
}

function logout(e) {
    if(e) {
        e.preventDefault();
    }
    
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

        // hard reload page if admin user changes themselves to a user (disables access)
        if(params.membership && params.membership === 'user'){
            window.location.href = '/';
        }
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

// can add an event if there is less than 3 events active in the next 60 days
async function canAddEvent(id){
    const numEvents = await fetchWrapper.get(`${baseUrl}/events/${id}`);
    const numIn60 = await fetchWrapper.get(appBaseUrl);

    if(numEvents < numIn60){
        return true;
    } else {
        return false;
    }
}

// prefixed with underscored because delete is a reserved word in javascript
async function _delete(id) {
    await fetchWrapper.delete(`${baseUrl}/${id}`);

    // auto logout if the logged in user deleted their own record
    if (id === userSubject.value?.id) {
        logout();
    }
}