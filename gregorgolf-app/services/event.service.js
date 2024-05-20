import getConfig from 'next/config';
import Router from 'next/router';

import { fetchWrapper } from 'helpers';
import { alertService } from './alert.service';

const { publicRuntimeConfig } = getConfig();

const baseUrl = `${process.env.NEXT_PUBLIC_API_URI}/events`;

export const eventService = {
    addEvent,
    getByDate,
    getNextDayAvailability,
    getAll,
    getByMember,
    delete: _delete
};

async function getAll() {
    return await fetchWrapper.get(`${baseUrl}`);
}

async function getByMember(member) {
    return await fetchWrapper.get(`${baseUrl}/member/${member}`);
}

async function addEvent(event) {
    return await fetchWrapper.post(`${baseUrl}/add`, event);
}

async function getByDate(date) { 
    const events_json = [
        {
            bay: 1,
            members: [{ id: '65d6452233d9d567917ca616', firstName: 'Connor', lastName: 'McCarl' }],
            guests: 0,
            hours: 3,
            startTime: new Date('2024-04-05T06:00:00.000Z'),
            endTime: new Date('2024-04-05T09:00:00.000Z'),
        },
        {
            bay: 2,
            members: [{ id: '65d6452233d9d567917ca616', firstName: 'Connor', lastName: 'McCarl' }],
            guests: 3,
            hours: 4,
            startTime: new Date('2024-04-05T07:00:00.000Z'),
            endTime: new Date('2024-04-05T11:00:00.000Z'),
        },
        {
            bay: 1,
            members: [{ id: '65d6452233d9d567917ca616', firstName: 'Connor', lastName: 'McCarl' }],
            guests: 1,
            hours: 1,
            startTime: new Date('2024-04-05T11:00:00.000Z'),
            endTime: new Date('2024-04-05T12:00:00.000Z'),
        },
        {
            bay: 1,
            members: [{ id: '65d6452233d9d567917ca616', firstName: 'Connor', lastName: 'McCarl' }],
            guests: 2,
            hours: 1,
            startTime: new Date('2024-04-05T14:00:00.000Z'),
            endTime: new Date('2024-04-05T15:00:00.000Z'),
        },
        {
            bay: 1,
            members: [{ id: '65d6452233d9d567917ca616', firstName: 'Connor', lastName: 'McCarl' }],
            guests: 2,
            hours: 2,
            startTime: new Date('2024-04-06T06:00:00.000Z'),
            endTime: new Date('2024-04-06T08:00:00.000Z'),
        }
    ];

    //return events_json;
    //return await fetchWrapper.get(`${baseUrl}`);
    return await fetchWrapper.get(`${baseUrl}/${date}`);
}

async function getNextDayAvailability(date){
     const events_json = [
        {
            bay: 1,
            members: [{ id: '65d6452233d9d567917ca616', firstName: 'Connor', lastName: 'McCarl' }],
            guests: 0,
            hours: 3,
            startTime: new Date('2024-04-06T06:00:00.000Z'),
            endTime: new Date('2024-04-06T09:00:00.000Z'),
        },
        {
            bay: 2,
            members: [{ id: '65d6452233d9d567917ca616', firstName: 'Connor', lastName: 'McCarl' }],
            guests: 3,
            hours: 4,
            startTime: new Date('2024-04-06T07:00:00.000Z'),
            endTime: new Date('2024-04-06T11:00:00.000Z'),
        },
     ]

     // add one day
     const currDate = new Date(date);
     currDate.setDate(currDate.getDate() + 1);

     //return events_json;
     return await fetchWrapper.get(`${baseUrl}/next/${currDate}`);
}

// prefixed with underscored because delete is a reserved word in javascript
async function _delete(id) {
    await fetchWrapper.delete(`${baseUrl}/id/${id}`);
}