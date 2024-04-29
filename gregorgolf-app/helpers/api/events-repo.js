import { db } from 'helpers/api';

const Event = db.Event;

export const eventsRepo = {
    create,
    getAll,
    getByDate,
    getNextByDate,
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

async function getByDate(date) {
    const startDate = new Date(new Date(date).setHours(0,0,0,0));
    const endDate = new Date(new Date(date).setHours(23,0,0,0));
    
    return await Event.find({ 
        $or: [
            { startTime: {
                $gte: startDate,
                $lte: endDate
            }},
            { endTime: {
                $gte: startDate,
                $lte: endDate 
            }}
        ]
    });
}

async function getNextByDate(date) {
    const startDate = new Date(new Date(date).setHours(0,0,0,0));
    const endDate = new Date(new Date(date).setHours(4,0,0,0));
    
    return await Event.find({ 
        $or: [
            { startTime: {
                $gte: startDate,
                $lte: endDate
            }},
            { endTime: {
                $gte: startDate,
                $lte: endDate 
            }}
        ]
    });
}