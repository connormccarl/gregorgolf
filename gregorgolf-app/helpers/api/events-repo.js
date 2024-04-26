import { db } from 'helpers/api';

const Event = db.Event;

export const eventsRepo = {
    create,
    getAll,
};

async function create(event) {
    // validate
    if (await Event.findOne({ 
            $and: [
                { startTime: event.startTime },
                { bay: event.bay }
            ]
        })) {
        throw 'There is already an event starting at: ' + event.startTime + '.';
    }

    const newEvent = new Event(event);

    // save event
    await newEvent.save();
}

async function getAll() {
    return await Event.find();
}