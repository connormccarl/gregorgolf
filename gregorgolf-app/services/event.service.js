import { fetchWrapper } from 'helpers';

const baseUrl = `${process.env.NEXT_PUBLIC_API_URI}/events`;

export const eventService = {
    addEvent,
    getById,
    getByDate,
    getInRange,
    getNextDayAvailability,
    getAll,
    getByMember,
    update,
    delete: _delete
};

async function getAll() {
    return await fetchWrapper.get(`${baseUrl}`);
}

async function getById(id) {
    return await fetchWrapper.get(`${baseUrl}/id/${id}`);
}

async function getByMember(member) {
    return await fetchWrapper.get(`${baseUrl}/member/${member}`);
}

async function addEvent(event) {
    return await fetchWrapper.post(`${baseUrl}/add`, event);
}

async function getByDate(date) { 
    return await fetchWrapper.get(`${baseUrl}/${date}`);
}

async function getInRange(startDate, endDate, bay) {
    return await fetchWrapper.get(`${baseUrl}/range/${startDate}/${endDate}/${bay}`);
}

async function getNextDayAvailability(date){
     // add one day
     const currDate = new Date(date);
     currDate.setDate(currDate.getDate() + 1);

     //return events_json;
     return await fetchWrapper.get(`${baseUrl}/next/${currDate}`);
}

async function update(id, params) {
    await fetchWrapper.put(`${baseUrl}/id/${id}`, params);
}

// prefixed with underscored because delete is a reserved word in javascript
async function _delete(id, userId, adminDelete) {
    await fetchWrapper.delete(`${baseUrl}/id/${id}/${userId}/${adminDelete}`);
}