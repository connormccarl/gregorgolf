import { db } from 'helpers/api';

const Event = db.Event;

export const eventsRepo = {
    create,
};

async function create(event) {
    // validate
    if (await Event.findOne({ startTime: event.startTime })) {
        throw 'There is already an event starting at: ' + event.startTime + '.';
    }

    const newEvent = new Event(event);

    // save event
    await newEvent.save();
}
