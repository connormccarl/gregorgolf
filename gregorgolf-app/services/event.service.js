import getConfig from 'next/config';
import Router from 'next/router';

import { fetchWrapper } from 'helpers';
import { alertService } from './alert.service';

const { publicRuntimeConfig } = getConfig();

//const baseUrl = `${process.env.NEXT_PUBLIC_API_URI}/users`;
const baseUrl = 'https://gregor-golf.vercel.app/api/users';

export const eventService = {
    getByDate,
    getNextDayAvailability,
};

async function getByDate(addedEvent) {
    //await fetchWrapper.post(`${baseUrl}/register`, user);
    const events_json = [
        {
            bay: '1',
            members: [{ id: '65d6452233d9d567917ca616', firstName: 'Connor', lastName: 'McCarl' }],
            guests: 0,
            hours: 3,
            start_time: new Date('2024-04-05T06:00:00.000Z'),
            end_time: new Date('2024-04-05T09:00:00.000Z'),
        },
        {
            bay: '2',
            members: [{ id: '65d6452233d9d567917ca616', firstName: 'Connor', lastName: 'McCarl' }],
            guests: 3,
            hours: 4,
            start_time: new Date('2024-04-05T07:00:00.000Z'),
            end_time: new Date('2024-04-05T11:00:00.000Z'),
        },
        {
            bay: '1',
            members: [{ id: '65d6452233d9d567917ca616', firstName: 'Connor', lastName: 'McCarl' }],
            guests: 1,
            hours: 1,
            start_time: new Date('2024-04-05T11:00:00.000Z'),
            end_time: new Date('2024-04-05T12:00:00.000Z'),
        },
        {
            bay: '1',
            members: [{ id: '65d6452233d9d567917ca616', firstName: 'Connor', lastName: 'McCarl' }],
            guests: 2,
            hours: 1,
            start_time: new Date('2024-04-05T14:00:00.000Z'),
            end_time: new Date('2024-04-05T15:00:00.000Z'),
        },
        {
            bay: '1',
            members: [{ id: '65d6452233d9d567917ca616', firstName: 'Connor', lastName: 'McCarl' }],
            guests: 2,
            hours: 2,
            start_time: new Date('2024-04-06T06:00:00.000Z'),
            end_time: new Date('2024-04-06T08:00:00.000Z'),
        }
    ];

    //events_json.push(addedEvent);

    return events_json;
}

async function getNextDayAvailability(){
     const events_json = [
        {
            bay: '1',
            members: [{ id: '65d6452233d9d567917ca616', firstName: 'Connor', lastName: 'McCarl' }],
            guests: 0,
            hours: 3,
            start_time: new Date('2024-04-06T06:00:00.000Z'),
            end_time: new Date('2024-04-06T09:00:00.000Z'),
        },
        {
            bay: '2',
            members: [{ id: '65d6452233d9d567917ca616', firstName: 'Connor', lastName: 'McCarl' }],
            guests: 3,
            hours: 4,
            start_time: new Date('2024-04-06T07:00:00.000Z'),
            end_time: new Date('2024-04-06T11:00:00.000Z'),
        },
     ]

     return events_json;
}