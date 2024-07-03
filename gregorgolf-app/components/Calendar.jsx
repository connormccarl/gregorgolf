import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { IconCalendar, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { Group, Button, Stack, SegmentedControl, Modal, rem, Text, Select, ScrollArea, Center } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { userService, eventService, subscriptionService, emailService } from 'services';

import '@mantine/dates/styles.css';
import classes from './Calendar.module.css';
import { alertService } from '@/services';

const printTime = (timeslot) => {
    const time = timeslot.split(' ')[0];
    const meridian = timeslot.split(' ')[1];

    const newTime = time.split(':')[0] + ":" + time.split(':')[1] + ' ' + meridian; 

    return newTime;
}

//console.log(timeslots_json);
//console.log(events_json);

const getCurrentDay = () => new Date(new Date().setHours(0,0,0,0));

export default function Calendar({ events: data }) {
    const router = useRouter();
    // calendar view fields
    const [date, setDate] = useState(getCurrentDay());
    const [view, setView] = useState('Both');
    const icon = <IconCalendar style={{ width: rem(18), height: rem(18) }} stroke={1.5} />;
    
    // calendar timeslots
    let timeslots_json = [];
    for(let i = 0; i < 28; i++){
        // set display value in booking times for timeslot
        let displayValue = '';
        if(i >= 24){
            displayValue += '(+1) ';
        }

        // TEST VALUE: '2024-04-05T08:00:00.000Z'
        displayValue += printTime(new Date(new Date(date).setHours(i,0,0,0)).toLocaleTimeString());

        // TEST VALUE: '2024-04-05T08:00:00.000Z'
        timeslots_json.push({
            display: i < 24 ? true : false,
            time: new Date(new Date(date).setHours(i,0,0,0)),
            value: displayValue
        });
    }

    // event fields
    const [events, setEvents] = useState(null);
    const [timeslots, setTimeslots] = useState(timeslots_json);

    // join event control
    const [join, setJoin] = useState(false);
    const [joinEventId, setJoinEventId] = useState('');
    const [joinEventPeople, setJoinEventPeople] = useState(0);
    
    // book a slot fields
    const [opened, { open, close }] = useDisclosure(false);
    const [bookingBay, setBookingBay] = useState('1');
    const [bookingDate, setBookingDate] = useState(getCurrentDay());
    const [bookingFor, setBookingFor] = useState('self');
    const [bookingMemberId, setBookingMemberId] = useState(null);
    const [members, setMembers] = useState([]);
    const [playingTime, setPlayingTime] = useState('1');
    const [bookingPlayers, setBookingPlayers] = useState('1');
    const [bookingPlayersData, setBookingPlayersData] = useState([
        { label: 'Single Member', value: '1' },
        { label: 'Member with 1 Guest - $10', value: '2' }
    ]);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [startTimes, setStartTimes] = useState([]);
    const [endTimes, setEndTimes] = useState([]);

    // page fields
    const [user, setUser] = useState(userService.userValue);
    const [bookingMember, setBookingMember] = useState(null);

    useEffect(() => {
        //console.log("master page events: ", events);
        //console.log("master timeslots: ", timeslots);
    })

    // Check to see if this is a redirect back from Stripe Checkout
    useEffect(() => {
        alertService.clear();
        const query = new URLSearchParams(window.location.search);

        // subscription activated
        if(query.get('activated')){
            alert("Subscription activated.");
        }

        // event payment success
        if(query.get('success')) {
            const eventId = query.get('event');
            const sessionId = query.get('session_id');

            eventService.update(eventId, { payment: 'paid', sessionId: sessionId })
                .then(() => {
                    const userId = query.get('user');
                    
                    userService.getById(userId)
                        .then((currUser) => {
                            eventService.getById(eventId)
                                .then((currEvent) => {
                                    const emailDetails = {
                                        email: currUser.email,
                                        firstName: currUser.firstName,
                                        eventDate: new Date(currEvent.startTime).toDateString(),
                                        eventTime: printTime(new Date(currEvent.startTime).toLocaleTimeString()),
                                        eventHours: currEvent.hours,
                                        eventGuests: currEvent.members.reduce((prev, curr) => prev + curr.guests,0)
                                    };

                                    if(query.get('join') === 'true'){
                                        emailDetails.eventType = "Joined";
                                        emailService.sendEventConfirmation(emailDetails)
                                            .then(() => {
                                                alert("Slot updated.");
                                                router.push('/');
                                            });
                                    } else {
                                        emailDetails.eventType = "Added";
                                        emailService.sendEventConfirmation(emailDetails)
                                            .then(() => {
                                                alert("Slot added.");
                                                router.push('/');
                                            });
                                    }
                                });
                        });
                });
        }

        // event payment canceled so delete the event from the database
        if(query.get('canceled')) {
            const eventId = query.get('event');

            if(query.get('join') === 'true'){
                // remove event updates if join
                eventService.update(eventId, { remove: query.get('user') })
                    .then(() => {
                        alert('Slot not joined. Please complete the payment.');
                        router.push('/');
                    });
            } else {
                // delete event
                eventService.delete(eventId, query.get('user'), true)
                    .then(() => {
                        alert('Slot not added. Please try again and complete the payment.');
                        router.push('/');
                    });
            }
        }
    }, []);

    // update events based on date selection
    useEffect(() => {
        eventService.getByDate(new Date(date).toISOString())
            .then(x => {
                setEvents(calcEffectiveTimes(x, date));
            })
    }, [date])

    const calcEffectiveTimes = (events, currDate) => {
        const currEvents = events;

        // TESTING
        console.log({
            effStart: new Date(new Date(currDate).setHours(0,0,0,0)),
            effStartFormat: new Date(new Date(currDate).setHours(0,0,0,0)).toLocaleString(),
            effEnd: new Date(new Date(currDate).setHours(24,0,0,0)),
            effEndFormat: new Date(new Date(currDate).setHours(24,0,0,0)).toLocaleString(),
        });

        currEvents.map((event) => {
            // calculate effective start time
            let currStartTime = new Date(event.startTime);
            let currHours = event.hours;
    
            // TEST VALUE: '2024-04-05T08:00:00.000Z'
            while(currStartTime < new Date(new Date(currDate).setHours(0,0,0,0))){
                // add an hour
                currStartTime.add(1, 'hours');
                currHours -= 1;
            }
            event.effective_start_time = currStartTime;
            
            // calculate effective end time
            let currEndTime = new Date(event.endTime);
    
            // TEST VALUE: '2024-04-05T08:00:00.000Z'
            while(currEndTime > new Date(new Date(currDate).setHours(24,0,0,0))){
                currEndTime.subtract(1, 'hours');
                currHours -= 1;
            }
            event.effective_end_time = currEndTime;
            
            // set effective hours
            event.effective_hours = currHours;

            // TESTING
            console.log("event: ", {...event, effStartFormat: event.effective_start_time.toLocaleString(), effEndFormat: event.effective_end_time.toLocaleString()});
        });

        return currEvents;
    }

    // update blocked out times on booking date selection
    useEffect(() => {
        setAvailableTimeslots();
    }, [bookingDate]);

    const setAvailableTimeslots = async () => {
        // generate default timeslots
        const currTimeslots = getTimeslots(bookingDate);

        // get events for that day
        let currEvents = [];
        await eventService.getByDate(new Date(bookingDate).toISOString())
            .then(x => currEvents = x);
        
        // calculate effective times
        currEvents = calcEffectiveTimes(currEvents, bookingDate);

        //console.log("current events: ", currEvents);

        // update timeslots based on current events
        await currEvents.forEach((event) => {
            // find event start timeslot
            const timeslotIndex = currTimeslots.findIndex(timeslot => timeslot.time.toLocaleTimeString() === new Date(event.effective_start_time).toLocaleTimeString());

            // iterate through each hour in timeslot and set booked flag
            for(let i = 0; i < event.effective_hours; i++){
                // update timeslot record
                const currTimeslotIndex = timeslotIndex + i;
                const currTimeslot = currTimeslots[currTimeslotIndex];
                if(currTimeslot){ 
                    // update bay timeslot to booked
                    if(event.bay == 1){
                        currTimeslot.bay1_booked = true;
                    } else {
                        currTimeslot.bay2_booked = true;
                    }
                }
            }
        });

        
        // update timeslots for next day availability
        await eventService.getNextDayAvailability(new Date(bookingDate).toISOString())
            .then(x => x.forEach((event) => {
                // find event start timeslot
                const timeslotIndex = currTimeslots.findIndex(timeslot => timeslot.time.getTime() === new Date(event.startTime).getTime());

                // iterate through each hour in timeslot and set booked flag
                for(let i = 0; i < event.hours; i++){
                    // update timeslot record
                    const currIndex = timeslotIndex + i;
                    const currTimeslot = currTimeslots[currIndex];
                    if(currTimeslot){ 
                        // update bay timeslot to booked
                        if(event.bay == 1){
                            currTimeslot.bay1_booked = true;
                        } else {
                            currTimeslot.bay2_booked = true;
                        }
                    }
                }
        }));
        
        //console.log("current timeslots: ", currTimeslots);
        // set timeslots for booking
        await setTimeslots(currTimeslots);

        // set start and end hours
        setStartTime(null);
        setEndTime(null);
        getStartTimes(currTimeslots);
    }

    const getTimeslots = (currDate) => {
        let timeslots = [];
        for(let i = 0; i < 28; i++){
            // set display value in booking times for timeslot
            let displayValue = '';
            if(i >= 24){
                displayValue += '(+1) ';
            }

            // TEST VALUE: '2024-04-05T08:00:00.000Z'
            displayValue += printTime(new Date(new Date(date).setHours(i,0,0,0)).toLocaleTimeString());

            // TEST VALUE: '2024-04-05T08:00:00.000Z'
            timeslots.push({
                display: i < 24 ? true : false,
                time: new Date(new Date(date).setHours(i,0,0,0)),
                value: displayValue
            });
        }

        return timeslots;
    };

    // handle start and end times
    useEffect(() => {
        setStartTime(null);
        setEndTime(null);
        getStartTimes(timeslots);
    }, [bookingBay, playingTime, events]);

    useEffect(() => {
        getEndTimes();
    }, [startTime, bookingBay, playingTime, events]);

    // autoset End Time selection
    const autosetEndTime = (value) => {
        if(!isNull(value)){
            const startIndex = timeslots.findIndex(timeslot => timeslot.time.getTime() === new Date(value).getTime());
            const workingDuration = parseInt(playingTime);
            const endIndex = startIndex + workingDuration;
    
            // autosets End Time selection
            setEndTime(timeslots[endIndex].time.toISOString());
        } else {
            setEndTime(null);
        }
    };

    // useEffect first load
    useEffect(() => {
        // populate members list for book a slot for a member
        userService.getAll().then(x => {
            setMembers(x.filter(member => member.subscriptionStatus === 'active').map((member) => { 
                const memberItem = {};
    
                memberItem['label'] = member.firstName + ' ' + member.lastName;
                memberItem['value'] = member.id;
    
                return memberItem;
            }));
        });

        // set logged in user
        setUser(userService.userValue);

        // set events to parameter data
        setEvents(data);

        // update booked timeslots
        data.forEach((event) => {
            // find event start timeslot
            const timeslotIndex = timeslots_json.findIndex(timeslot => timeslot.time.toLocaleTimeString() === new Date(event.effective_start_time).toLocaleTimeString());

            // iterate through each hour in timeslot and set booked flag
            for(let i = 0; i < event.effective_hours; i++){
                // update timeslot record
                const currTimeslotIndex = timeslotIndex + i;
                const currTimeslot = timeslots_json[currTimeslotIndex];
                if(currTimeslot){ 
                    // update bay timeslot to booked
                    if(event.bay == 1){
                        currTimeslot.bay1_booked = true;
                    } else {
                        currTimeslot.bay2_booked = true;
                    }
                }
            }
        });

        // update booked timeslots into the next day
        eventService.getNextDayAvailability(new Date().toISOString())
            .then(x => x.forEach((event) => {
                // find event start timeslot
                const timeslotIndex = timeslots_json.findIndex(timeslot => timeslot.time.getTime() === new Date(event.startTime).getTime());

                // iterate through each hour in timeslot and set booked flag
                for(let i = 0; i < event.hours; i++){
                    // update timeslot record
                    const currIndex = timeslotIndex + i;
                    const currTimeslot = timeslots_json[currIndex];
                    if(currTimeslot){ 
                        // update bay timeslot to booked
                        if(event.bay == 1){
                            currTimeslot.bay1_booked = true;
                        } else {
                            currTimeslot.bay2_booked = true;
                        }
                    }
                }
        }));

        setTimeslots(timeslots_json);
    }, []);

    const addEventToDisplay = async (newEvent) => {
        let currEvents = [...events, newEvent];
        setEvents(calcEffectiveTimes(currEvents, date));

        // update timeslots for current display to booked = true
        await updateBookedTimeslots(newEvent);
    };

    // update select number of players data depending on what playing time is selected
    useEffect(() => {
        // set booking players data for new events
        if(joinEventPeople == 0){
            if(playingTime == '1'){
                setBookingPlayersData([
                    { label: 'Single Member', value: '1' },
                    { label: 'Member with 1 Guest - $10', value: '2' }
                ]);
                if(bookingPlayers == '3' || bookingPlayers == '4'){
                    setBookingPlayers('2');
                }
            } else if(playingTime == '2'){
                setBookingPlayersData([
                    { label: 'Single Member', value: '1' },
                    { label: 'Member with 1 Guest - $20', value: '2' },
                    { label: 'Member with 2 Guests - $35', value: '3' },
                    { label: 'Member with 3 Guests - $45', value: '4' }
                ]);
            } else {
                setBookingPlayersData([
                    { label: 'Single Member', value: '1' },
                    { label: 'Member with 1 Guest - $40', value: '2' },
                    { label: 'Member with 2 Guests - $70', value: '3' },
                    { label: 'Member with 3 Guests - $90', value: '4' }
                ]);
            }
        } else { // set booking players data for joined events
            if(playingTime == '2'){
                if(joinEventPeople == 1){
                    setBookingPlayersData([
                        { label: 'Single Member', value: '1' },
                        { label: 'Member with 1 Guest - $20', value: '2' },
                        { label: 'Member with 2 Guests - $35', value: '3' }
                    ]);
                } else if(joinEventPeople == 2){
                    setBookingPlayersData([
                        { label: 'Single Member', value: '1' },
                        { label: 'Member with 1 Guest - $20', value: '2' }
                    ]);
                } else if(joinEventPeople == 3){
                    setBookingPlayersData([
                        { label: 'Single Member', value: '1' }
                    ]);
                }
            } else {
                if(joinEventPeople == 1){
                    setBookingPlayersData([
                        { label: 'Single Member', value: '1' },
                        { label: 'Member with 1 Guest - $40', value: '2' },
                        { label: 'Member with 2 Guests - $70', value: '3' }
                    ]);
                } else if(joinEventPeople == 2){
                    setBookingPlayersData([
                        { label: 'Single Member', value: '1' },
                        { label: 'Member with 1 Guest - $40', value: '2' }
                    ]);
                } else if(joinEventPeople == 3){
                    setBookingPlayersData([
                        { label: 'Single Member', value: '1' }
                    ]);
                }
            }
        }
    }, [playingTime]);

    
    const getEventWidth = (hours, people, lastName) => {
        if(hours == 1 || people == 4 || lastName === 'Restricted'){
            return view === 'Both' ? classes.event4Two : classes.event4One;
        } else {
            switch(people){
                case 2:
                    return view === 'Both' ? classes.event2Two : classes.event2One;
                case 3: 
                    return view === 'Both' ? classes.event3Two : classes.event3One;
                default: 
                    return view === 'Both' ? classes.event1Two : classes.event1One;
            }
        }
    }
    
    const getBayDisplay = (bay, view, type) => {
        if(view == 'Both'){
            return type === 'Title' ? classes.columnTitleTwo : classes.scheduleBlockTwo;
        } else if (bay == view) {
            return type === 'Title' ? classes.columnTitleOne : classes.scheduleBlockOne;
        } else {
            return 'd-none';
        }
    }

    const getStartTimes = (currTimeslots) => {
        const workingTimeslots = currTimeslots.filter(timeslot => timeslot.display === true);
        const workingDuration = parseInt(playingTime);
        for(let i = 0; i < workingTimeslots.length; i++){
            const workingSlot = workingTimeslots[i];

            // see if unavailable based on bay
            let unavailable;
            
            if(bookingBay == 1){
                unavailable = workingSlot.bay1_booked;
            } else {
                unavailable = workingSlot.bay2_booked;
            }
            
            // if not available for the entire duration, unavailable
            if(workingDuration > 1) {
                for(let x = 1; x < workingDuration; x++){
                    if(bookingBay == 1){
                        if(timeslots[i + x].bay1_booked === true){
                            unavailable = true;
                        }
                    } else {
                        if(timeslots[i + x].bay2_booked === true){
                            unavailable = true;
                        }
                    }
                }
            }

            if(bookingBay == 1){
                workingSlot.bay1_available = !unavailable;
            } else {
                workingSlot.bay2_available = !unavailable;
            }
        }

        //console.log("workingTimeslots: ", workingTimeslots);

        setStartTimes(workingTimeslots.map(timeslot => {
            const listItem = {};

            listItem['value'] = timeslot.time.toISOString();
            listItem['label'] = timeslot.value;

            if(bookingBay == 1){
                if(timeslot.bay1_available === false){
                    listItem['disabled'] = true;
                }
            } else {
                if(timeslot.bay2_available === false){
                    listItem['disabled'] = true;
                }
            }

            return listItem;
        }));
    }

    const getEndTimes = () => {
        const startIndex = timeslots.findIndex(timeslot => timeslot.time.getTime() === new Date(startTime).getTime());
        const workingDuration = parseInt(playingTime);
        const endIndex = startIndex + workingDuration;

        const listItem = {};

        listItem['value'] = timeslots[endIndex].time.toISOString();
        listItem['label'] = timeslots[endIndex].value;

        setEndTimes([listItem]);
    }

    // check if value is null
    const isNull = (value) => typeof value === "object" && !value;

    // clear and reset book a slot fields
    const resetBookingFields = () => {
        setBookingBay('1');
        setBookingDate(getCurrentDay());
        setBookingFor('self');
        setBookingMemberId(null);
        setMembers([]);
        setPlayingTime('1');
        setBookingPlayers('1');
        setBookingPlayersData([
            { label: 'Single Member', value: '1' },
            { label: 'Member with 1 Guest - $10', value: '2' }
        ]);
        setStartTime(null);
        setEndTime(null);
        setJoin(false);
        setJoinEventId('');
        setJoinEventPeople(0);
    };

    const updateBookedTimeslots = (newEvent) => {
        let currTimeslots = timeslots;
        const timeslotIndex = currTimeslots.findIndex(timeslot => timeslot.time.toLocaleTimeString() === new Date(newEvent.effective_start_time).toLocaleTimeString());

        // iterate through each hour in timeslot and set booked flag
        for(let i = 0; i < newEvent.effective_hours; i++){
            // update timeslot record
            const currTimeslotIndex = timeslotIndex + i;
            const currTimeslot = currTimeslots[currTimeslotIndex];
            if(currTimeslot){ 
                // update bay timeslot to booked
                if(newEvent.bay == 1){
                    currTimeslot.bay1_booked = true;
                } else {
                    currTimeslot.bay2_booked = true;
                }
            }
        }

        setTimeslots([...currTimeslots]);
    };

    // populate other member when admin books for another member
    const setOtherMember = async (memberId) => {
        setBookingMemberId(memberId);
        setBookingMember(await userService.getById(memberId));
    };

    const addEvent = async () => {
        if(bookingFor === 'other' && isNull(bookingMemberId)){
            alert("Please select a member to book a slot for.");
        }
        
        if (isNull(startTime) || isNull(endTime)) {
            alert ("Please select a start/end time.");
        }

        // only add event if all required fields are populated
        if((bookingFor === 'self' || !isNull(bookingMemberId)) && !isNull(startTime) && !isNull(endTime)){
            // build event
            const event = {
                bay: parseInt(bookingBay),
                members: bookingFor === 'self' ? [{ id: user.id, firstName: user.firstName, lastName: user.lastName, guests: bookingPlayers === '1' ? 0 : parseInt(bookingPlayers) - 1 }] : [{ id: bookingMember.id, firstName: bookingMember.firstName, lastName: bookingMember.lastName, guests: bookingPlayers === '1' ? 0 : parseInt(bookingPlayers) - 1 }],
                hours: parseInt(playingTime),
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                payment: 'none',
            };
            
            // add event to database
            let createdEventId = await eventService.addEvent(event);

            // add event to current view (bypass a data refresh)
            if(bookingDate.getTime() === date.getTime() || new Date(endTime).toDateString() == date.toDateString()){
                event.id = createdEventId;
                await addEventToDisplay(event);
            }


            //console.log("created Event Id: ", createdEventId);

            close();
            resetBookingFields();

            // process payment
            let priceId = getPriceId();
            // bill only if required
            if(priceId !== '0'){
                const customerId = bookingFor === 'self' ? user.customerId : bookingMember.customerId;
                const userId = bookingFor === 'self' ? user.id : bookingMember.id;

                subscriptionService
                    .billForEvent(customerId, priceId, "payment", createdEventId, false, userId)
                    .then((x) => {
                        window.location.assign(x);
                    });
            } else {
                const currUser = await userService.getById(bookingFor === 'self' ? user.id : bookingMember.id);

                const emailDetails = {
                    email: currUser.email,
                    firstName: currUser.firstName,
                    eventType: "Added",
                    eventDate: event.startTime.toDateString(),
                    eventTime: printTime(event.startTime.toLocaleTimeString()),
                    eventHours: event.hours,
                    eventGuests: event.members.reduce((prev, curr) => prev + curr.guests, 0)
                };

                await emailService.sendEventConfirmation(emailDetails);
                alert("Slot created.");
            }
        }
    };

    // handles updating an event when people join it
    const joinEvent = async () => {
        const update = {
            member: { id: user.id, firstName: user.firstName, lastName: user.lastName, guests: bookingPlayers === '1' ? 0 : parseInt(bookingPlayers) - 1 },
        };

        // update view
        setEvents(events.map((event) => {
            if(event.id === joinEventId){
                return { ...event, members: [...event.members, update.member] };
            } else {
                return { ...event };
            }
        }));

        // update event in database
        await eventService.update(joinEventId, update);

        close();
        resetBookingFields();

        // process payment
        let priceId = getPriceId();
        // bill only if required
        if(priceId !== '0'){
            const customerId = user.customerId;
            const userId = user.id;

            subscriptionService
                .billForEvent(customerId, priceId, "payment", joinEventId, true, userId)
                .then((x) => {
                    window.location.assign(x);
                });
        } else {
            const event = await eventService.getById(joinEventId);

            const emailDetails = {
                email: user.email,
                firstName: user.firstName,
                eventType: "Joined",
                eventDate: new Date(event.startTime).toDateString(),
                eventTime: printTime(new Date(event.startTime).toLocaleTimeString()),
                eventHours: event.hours,
                eventGuests: event.members.reduce((prev, curr) => prev + curr.guests, 0)
            };

            await emailService.sendEventConfirmation(emailDetails);
            alert("Slot joined.");
        }
    };

    const getPriceId = () => {
        let priceId = '0';
        if(playingTime == '1'){
            if(bookingPlayers == '2'){
                priceId = 'price_1PGOs6LcjY6vEoOvTeJZBYdl' // TEST: price_1PGOs6LcjY6vEoOvTeJZBYdl, LIVE: price_1PGOBwLcjY6vEoOvDlvcNDZn
            }
        } else if(playingTime == '2'){
            if(bookingPlayers == '2'){
                priceId = 'price_1PLCd5LcjY6vEoOv65shHHWT'; // TEST: price_1PLCd5LcjY6vEoOv65shHHWT, LIVE: price_1PGOCULcjY6vEoOvlrTdXOku
            } else if(bookingPlayers == '3'){
                priceId = 'price_1PTrfBLcjY6vEoOvZVuHLbcc'; // TEST: price_1PTrfBLcjY6vEoOvZVuHLbcc, LIVE: price_1PGOCmLcjY6vEoOvIG7332Wp
            } else if(bookingPlayers == '4'){
                priceId = 'price_1PTrfdLcjY6vEoOvIc4lX5j6'; // TEST: price_1PTrfdLcjY6vEoOvIc4lX5j6, LIVE: price_1PGODALcjY6vEoOv9xLJjlov
            }
        } else {
            if(bookingPlayers == '2'){
                priceId = 'price_1PTrg1LcjY6vEoOvAq543ivB'; // TEST: price_1PTrg1LcjY6vEoOvAq543ivB, LIVE: price_1PGODhLcjY6vEoOvsiQTUCTf
            } else if(bookingPlayers == '3'){
                priceId = 'price_1PTrgILcjY6vEoOvePTEcff0'; // TEST: price_1PTrgILcjY6vEoOvePTEcff0, LIVE: price_1PGODxLcjY6vEoOvCZPBmACt
            } else if(bookingPlayers == '4'){
                priceId = 'price_1PTrgULcjY6vEoOvnsUisxBJ'; // TEST: price_1PTrgULcjY6vEoOvnsUisxBJ, LIVE: price_1PGOEELcjY6vEoOvOgY2wdcu
            }
        }

        return priceId;
    };

    // checks if the event can be joined
    const canJoin = (hours, people) => {
        if(hours == 1 || people == 4){
            return false;
        } else {
            return true;
        }
    };

    const schedule = timeslots.filter((item) => item.display === true).map((timeslot, index) => (
        <div key={timeslot.time} className={`${classes.schedule} ${ index == 0 ? classes.scheduleFirst : '' }`}>
            <div className={`${classes.scheduleTitle} ${index == 0 ? classes.scheduleTitleFirst : ''}`}>
                <span className={classes.scheduleTime}>{printTime(timeslot.time.toLocaleTimeString())}</span>
            </div>
            <div className={`${classes.spacer} ${ index == 23 ? classes.bottomGrid : '' }`}>&nbsp;</div>
            <div className={`${getBayDisplay('Bay 1', view, 'Schedule')} ${ index == 23 ? classes.bottomGrid : '' }`}></div>
            <div className={`${getBayDisplay('Bay 2', view, 'Schedule')} ${ index == 23 ? classes.bottomGrid : '' }`}></div>
            {events && events.filter(event => new Date(event.effective_start_time).toLocaleTimeString() === timeslot.time.toLocaleTimeString()).map(event => (
                    <div key={event.bay + event.effective_start_time} className={`${classes.event} ${event.bay == 2 && view == 'Both' ? classes.eventBay2 : classes.eventBay1} ${view !== 'Both' && ('Bay ' + event.bay) !== view ? 'd-none' : ''} ${getEventWidth(event.hours, event.members.length + event.members.reduce((prev, curr) => prev + curr.guests, 0), event.members[0].lastName)}`} style={{ height: event.effective_hours * 54 - 4 }}>
                        { canJoin(event.hours, event.members.length + event.members.reduce((prev, curr) => prev + curr.guests, 0)) && !event.members.some(member => member.id === user.id) ? 
                            <Button onClick={async () => {
                                if(await userService.canAddEvent(user.id)){
                                    setJoin(true);
                                    setJoinEventId(event.id);
                                    setJoinEventPeople(event.members.length + event.members.reduce((prev, curr) => prev + curr.guests, 0));
                                    setPlayingTime(event.hours.toString());
                                    open();
                                } else {
                                    alert("Can't join event. Maximum number of events in 60 days reached.");
                                }
                            }} variant="default" style={{ height: 30, width: 30, padding: 0, position: 'absolute', bottom: 5, right: 5 }}>+</Button> 
                        : '' }
                        <span className="fw-bold">{event.members.map((member, index) => {
                            return <span key={index}>{index !== 0 ? ',' : ''} {member.lastName !== 'Restricted' ? member.firstName.charAt(0) + '. ' + member.lastName : member.lastName}</span>
                        })}</span> {event.members[0].lastName !== 'Restricted' ? event.members.length + event.members.reduce((prev, curr) => prev + curr.guests, 0) : ''}
                        <br/><span className={classes.timeBlock}>{printTime(new Date(event.startTime).toLocaleTimeString()) === '12:00 AM' && printTime(new Date(event.endTime).toLocaleTimeString()) === '12:00 AM' ? 'All Day' : printTime(new Date(event.startTime).toLocaleTimeString()) + ' - ' + printTime(new Date(event.endTime).toLocaleTimeString())}</span>
                    </div>
                ))
            }
        </div>
    ));

  return (
    <div>
        <Modal opened={opened} onClose={() => {
            close();
            resetBookingFields();
        }} title={ join ? "Join a Slot" : "Book a Slot"} scrollAreaComponent={ScrollArea.Autosize}>
            <Stack>
                { !join && 
                <> 
                    <Text size="sm" fw={500}>Pick a Date</Text>
                    <DatePickerInput
                        leftSection={icon}
                        leftSectionPointerEvents="none"
                        placeholder="Pick a Day"
                        value={bookingDate}
                        onChange={setBookingDate}
                    />
                </>
                }
                { (user.membership === 'admin' && !join) && 
                <>
                    <Text size="sm" fw={500}>Whom are you booking for?</Text>
                    <SegmentedControl
                        value={bookingFor}
                        onChange={setBookingFor}
                        data={[
                            { label: 'Book for Yourself', value: 'self' },
                            { label: 'Book for Member', value: 'other' }
                        ]}
                        color="var(--mantine-color-light-green-6)"
                    />
                </>
                }

                <Stack className={`${ bookingFor === 'other' ? '' : 'd-none'}`}>
                    <Text size="sm" fw={500}>Select Member</Text>
                    <Select
                        value={bookingMemberId}
                        onChange={setOtherMember}
                        placeholder='Member Name'
                        limit={10}
                        data={members}
                        searchable
                    />
                </Stack>
                { join && 
                <>
                    <Text size="sm" fw={500}>Select Number of Players</Text>
                    <Select
                        value={bookingPlayers}
                        onChange={setBookingPlayers}
                        placeholder='Number of Players'
                        data={bookingPlayersData}
                    />
                    <Text size="sm" fs="italic">Please note that additional fees for guests will apply, determined by the chosen session duration.</Text>
                </>
                }
                { !join && 
                <>
                    <Text size="sm" fw={500}>Select Playing Time</Text>
                    <SegmentedControl
                        value={playingTime}
                        onChange={setPlayingTime}
                        data={[
                            { label: '1 Hour', value: '1' },
                            { label: '2 Hours', value: '2' },
                            { label: '4 Hours', value: '4' }
                        ]}
                        color="var(--mantine-color-light-green-6)"
                    />
           
                    <Text size="sm" fw={500}>Select Number of Players</Text>
                    <Select
                        value={bookingPlayers}
                        onChange={setBookingPlayers}
                        placeholder='Number of Players'
                        data={bookingPlayersData}
                    />
                    <Text size="sm" fs="italic">Please note that additional fees for guests will apply, determined by the chosen session duration.</Text>
                    
                    <Text size="sm" fw={500}>Choose Bay</Text>
                    <SegmentedControl
                        value={bookingBay}
                        onChange={setBookingBay}
                        data={[
                            { label: 'Bay 1', value: '1' },
                            { label: 'Bay 2', value: '2' }
                        ]}
                        color="var(--mantine-color-light-green-6)"
                    />

                    <Text size="sm" fw={500}>Select Booking Time</Text>
                    <Select
                        value={startTime}
                        onChange={(value) => {
                            setStartTime(value);
                            autosetEndTime(value);
                        }}
                        placeholder='Start Time'
                        data={startTimes}
                    />
                    <Select
                        value={endTime}
                        onChange={setEndTime}
                        placeholder='End Time'
                        data={endTimes}
                        disabled
                    />
                </>
                }
                <Group justify='space-between'>
                    <Button color="red" onClick={() => {
                        close();
                        resetBookingFields();  
                    }}>
                        Cancel
                    </Button>
                    <Button color="var(--mantine-color-light-green-6)" onClick={ join ? joinEvent : addEvent}>
                        Confirm
                    </Button>
                </Group>
            </Stack>
        </Modal>
        <div className={classes.menuBar}>
            <Group justify='space-between' className={classes.menuGroup}>
                <Button onClick={async () => {
                    if(await userService.canAddEvent(user.id)){
                        setAvailableTimeslots(); // handle timeslots not updating when adding an event then adding another immediately after
                        open();
                    } else {
                        alert("Can't add event. Maximum number of events in 60 days reached.");
                    }
                }} color="var(--mantine-color-light-green-6)">
                    Book a Slot
                </Button>
                <Group className='gap-1'>
                    <Button onClick={() => setDate(getCurrentDay())} variant="default">
                        Today
                    </Button>
                    <DatePickerInput
                        leftSection={icon}
                        leftSectionPointerEvents="none"
                        placeholder="Pick a Day"
                        value={date}
                        onChange={setDate}
                    />
                </Group>
                <SegmentedControl value={view} onChange={setView} data={['Bay 1', 'Bay 2', 'Both']} />
                <Group className='gap-1'>
                    <Button color="var(--mantine-color-light-green-6)" variant="light" onClick={() => setDate(dayjs(date).subtract(1, 'days').toDate())}>
                        <IconChevronLeft style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
                    </Button>
                    <Button color="var(--mantine-color-light-green-6)" variant="light" onClick={() => setDate(dayjs(date).add(1, 'days').toDate())}>
                        <IconChevronRight style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
                    </Button>
                </Group>
            </Group>
            <Stack className={classes.menuStack}>
                <Group justify='space-between'>
                    <Button onClick={() => setDate(getCurrentDay())} variant="default">
                        Today
                    </Button>
                    <DatePickerInput
                        leftSection={icon}
                        leftSectionPointerEvents="none"
                        placeholder="Pick a Day"
                        value={date}
                        onChange={setDate}
                    />
                    <Group className={classes.arrowButtons}>
                        <Button color="var(--mantine-color-light-green-6)" variant="light" onClick={() => setDate(dayjs(date).subtract(1, 'days').toDate())}>
                            <IconChevronLeft style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
                        </Button>
                        <Button color="var(--mantine-color-light-green-6)" variant="light" onClick={() => setDate(dayjs(date).add(1, 'days').toDate())}>
                            <IconChevronRight style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
                        </Button>
                    </Group>
                </Group>
                <Button onClick={async () => {
                    if(await userService.canAddEvent(user.id)){
                        setAvailableTimeslots(); // handle timeslots not updating when adding an event then adding another immediately after
                        open();
                    } else {
                        alert("Can't add event. Maximum number of events in 60 days reached.");
                    }
                }} color="var(--mantine-color-light-green-6)">
                    Book a Slot
                </Button>
                <SegmentedControl value={view} onChange={setView} data={['Bay 1', 'Bay 2', 'Both']} />
            </Stack>
            <div className={classes.header}>
                <div className={classes.headerTitle}>
                    GMT-08
                </div>
                <div className={classes.spacer}>&nbsp;</div>
                <div className={getBayDisplay('Bay 1', view, 'Title')}>Bay 1</div>
                <div className={getBayDisplay('Bay 2', view, 'Title')}>Bay 2</div>
            </div>
        </div>
        <div className={classes.grid}>
            {schedule}
        </div>
    </div>
  )
}
