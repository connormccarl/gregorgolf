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
};

async function addEvent(event) {
    await fetchWrapper.post(`${baseUrl}/add`, event);
}

async function getByDate() { 
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

    return await fetchWrapper.get(`${baseUrl}`);
}

async function getNextDayAvailability(){
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

     return events_json;
}