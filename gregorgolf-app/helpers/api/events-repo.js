import { db } from 'helpers/api';

const Event = db.Event;

export const eventsRepo = {
    create,
    getAll,
    getByDate,
    getInRange,
    getNextByDate,
    getByMember,
    update,
    getById,
    get60Days,
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
    return await Event.find(
        {
            $and: [
                {
                    "members": {
                        $elemMatch:
                        {
                            "id": member
                        }
                    }
                },
                { 
                    $or: [
                        { startTime: {
                            $gte: new Date()
                        }},
                        { endTime: {
                            $gte: new Date()
                        }}
                    ]
                }
            ]
        }
    );
}

async function get60Days(id){
    return await Event.aggregate([
        {
            $match:
            {
                startTime: {
                    $gte: new Date()
                }
            }
        },
        {
            $unwind:
            {
                path: "$members",
            },
        },
        {
            $match:
            {
                "members.id": id,
            },
        },
        {
            $group:
            {
                _id: "$members.id",
                count: {
                $sum: 1,
                },
            },
        },
        {
            $project:
            {
                _id: 0,
            },
        },
    ])
    .then(result => {
        if(result.length == 0){
            return 0;
        } else {
            return result[0].count;
        }
    })
    .catch(err => {
        throw 'Error getting events in next 60 days.'; 
    });
}

async function getByDate(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);

    // TESTING
    console.log({
        dayStart: startDate,
        dayStartFormat: startDate.toLocaleString(),
        dayEnd: endDate,
        dayEndFormat: endDate.toLocaleString()
    })
    
    return await Event.find({ 
        $or: [
            { startTime: {
                $gte: startDate,
                $lt: endDate
            }},
            { endTime: {
                $gt: startDate,
                $lte: endDate 
            }}
        ]
    });
}

async function getInRange(start, end, bay) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    return await Event.find({ 
        $and: [
            {
                $or: [
                    { startTime: {
                        $gte: startDate,
                        $lt: endDate
                    }},
                    { endTime: {
                        $gt: startDate,
                        $lte: endDate 
                    }}
                ]
            },
            {
                bay: bay
            }
        ]
        
    });
}

async function getNextByDate(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    return await Event.find({ 
        $or: [
            { startTime: {
                $gte: startDate,
                $lt: endDate
            }},
            { endTime: {
                $gt: startDate,
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

async function getById(id) {
    return await Event.findById(id);
}

async function _delete(id) {
    await Event.findByIdAndDelete(id);
}