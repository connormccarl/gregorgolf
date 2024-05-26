import { db } from 'helpers/api';

const Event = db.Event;

export const eventsRepo = {
    create,
    getAll,
    getByDate,
    getNextByDate,
    getByMember,
    update,
    delete: _delete
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
    let { _id } = await newEvent.save();
    return _id;
}

async function getAll() {
    return await Event.find();
}

async function getByMember(member) {
    return await Event.find({
        'members.0.id': member
    });
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

async function update(id, params) {
    const event = await Event.findById(id);

    // validate
    if (!event) throw 'Event not found';

    // copy params properties to event
    Object.assign(event, params);

    await event.save();
}

async function _delete(id) {
    await Event.findByIdAndDelete(id);
}