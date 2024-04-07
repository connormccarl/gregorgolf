import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { IconCalendar, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { Group, Button, Stack, SegmentedControl, Modal, rem, Text, Select, ScrollArea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { userService, eventService } from 'services';

import '@mantine/dates/styles.css';
import classes from './Calendar.module.css';
import { from } from 'rxjs';

const events_json = [
    {
        bay: '1',
        members: [{ id: '65d6452233d9d567917ca616', firstName: 'Connor', lastName: 'McCarl' }],
        guests: 0,
        hours: 3,
        start_time: new Date('2024-03-26T06:00:00.000Z'),
        end_time: new Date('2024-03-26T09:00:00.000Z'),
        effective_start_time: new Date('2024-03-26T06:00:00.000Z'),
        effective_end_time: new Date('2024-03-26T09:00:00.000Z'),
        effective_hours: 3,
    },
    {
        bay: '2',
        members: [{ id: '65d6452233d9d567917ca616', firstName: 'Connor', lastName: 'McCarl' }],
        guests: 3,
        hours: 4,
        start_time: new Date('2024-03-26T07:00:00.000Z'),
        end_time: new Date('2024-03-26T11:00:00.000Z'),
        effective_start_time: new Date('2024-03-26T07:00:00.000Z'),
        effective_end_time: new Date('2024-03-26T11:00:00.000Z'),
        effective_hours: 4,
    },
    {
        bay: '1',
        members: [{ id: '65d6452233d9d567917ca616', firstName: 'Connor', lastName: 'McCarl' }],
        guests: 1,
        hours: 1,
        start_time: new Date('2024-03-26T11:00:00.000Z'),
        end_time: new Date('2024-03-26T12:00:00.000Z'),
        effective_start_time: new Date('2024-03-26T11:00:00.000Z'),
        effective_end_time: new Date('2024-03-26T12:00:00.000Z'),
        effective_hours: 1,
    },
    {
        bay: '1',
        members: [{ id: '65d6452233d9d567917ca616', firstName: 'Connor', lastName: 'McCarl' }],
        guests: 2,
        hours: 1,
        start_time: new Date('2024-03-26T14:00:00.000Z'),
        end_time: new Date('2024-03-26T15:00:00.000Z'),
        effective_start_time: new Date('2024-03-26T14:00:00.000Z'),
        effective_end_time: new Date('2024-03-26T15:00:00.000Z'),
        effective_hours: 1,
    },
    {
        bay: '1',
        members: [{ id: '65d6452233d9d567917ca616', firstName: 'Connor', lastName: 'McCarl' }],
        guests: 2,
        hours: 2,
        start_time: new Date('2024-03-27T06:00:00.000Z'),
        end_time: new Date('2024-03-27T08:00:00.000Z'),
        effective_start_time: new Date('2024-03-27T06:00:00.000Z'),
        effective_end_time: new Date('2024-03-27T08:00:00.000Z'),
        effective_hours: 2,
    }
]

let timeslots_json = [];
for(let i = 0; i < 24; i++){
    timeslots_json.push({
        time: new Date(new Date('2024-04-05T08:00:00.000Z').setHours(i,0,0,0)),
    });
}

//console.log(timeslots_json);
//console.log(events_json);

const oldtimeslots = ['12 AM','1 AM','2 AM','3 AM','4 AM','5 AM','6 AM','7 AM','8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM','10 PM','11 PM']

export default function Calendar({ events: data }) {
    const [events, setEvents] = useState(null);
    const [timeslots, setTimeslots] = useState(timeslots_json);

    const [date, setDate] = useState(new Date());
    const [view, setView] = useState('Both');
    const icon = <IconCalendar style={{ width: rem(18), height: rem(18) }} stroke={1.5} />;
    const [opened, { open, close }] = useDisclosure(false);

    const [bookingBay, setBookingBay] = useState('1');
    const [bookingDate, setBookingDate] = useState(new Date());
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
    const [user, setUser] = useState(null);
    const [bookingMember, setBookingMember] = useState(null);

    useEffect(() => {
        console.log("master page events: ", events);
        console.log("master timeslosts: ", timeslots);
    })

    useEffect(() => {
        console.log("entering useEffect first load");
        userService.getAll().then(x => {
            setMembers(x.map((member) => { 
                const memberItem = {};
    
                memberItem['label'] = member.firstName + ' ' + member.lastName;
                memberItem['value'] = member.id;
    
                return memberItem;
            }));
        });

        setUser(userService.userValue);

        console.log("parameter events: ", data);
        setEvents(data);
        // update booked timeslots
        data.forEach((event) => {
            for(let i = 0; i < event.effective_hours; i++){
                //console.log("locale time: ", event.effective_start_time.toLocaleTimeString());
                //console.log("timeslot time: ", timeslots_json[0].time.toLocaleTimeString());

                // convert time to currTime in blocked out event section
                const timeslotIndex = timeslots_json.findIndex(timeslot => timeslot.time.toLocaleTimeString() === event.effective_start_time.toLocaleTimeString());
                const currTimeslotIndex = timeslotIndex + i;

                // update timeslot record
                const currTimeslot = timeslots_json[currTimeslotIndex];
                if(currTimeslot){ 
                    // update bay timeslot to booked
                    if(event.bay == '1'){
                        currTimeslot.bay1_booked = true;
                    } else {
                        currTimeslot.bay2_booked = true;
                    }
                }
            }
        });

        setTimeslots(timeslots_json);
    }, []);

    /*
    useEffect(() => {
        loadData();
    }, [date]);

    */
    const loadData = async () => {
        let todaysEvents;

        await eventService.getByDate(date)
            .then(x => todaysEvents = x);

        todaysEvents.map((event) => {
            // calculate effective start time
            let currStartTime = new Date(event.start_time.getTime());
            let currHours = event.hours;
            while(currStartTime < new Date(new Date().setHours(0,0,0,0))){
                // add an hour
                currStartTime.setTime(currStartTime.getTime() + (1*60*60*1000));
                currHours -= 1;
            }
            event.effective_start_time = currStartTime;
            
            // calculate effective end time
            let currEndTime = new Date(event.end_time.getTime());
            while(currEndTime > new Date(date.setHours(24,0,0,0))){
                currEndTime.setTime(currEndTime.getTime() - (1*60*60*1000));
                currHours -= 1;
            }
            event.effective_end_time = currEndTime;
            
            // set effective hours
            event.effective_hours = currHours;
        });
        

        setEvents(todaysEvents);
    }

    /*
    useEffect(() => {
         // update booked timeslots
        events_json.forEach((event) => {
            for(let i = 0; i < event.effective_hours; i++){
                // convert time to currTime in blocked out event section
                const timeslotIndex = timeslots_json.findIndex(timeslot => timeslot.time.toLocaleTimeString() === event.effective_start_time.toLocaleTimeString());
                const currTimeslotIndex = timeslotIndex + i;

                // update timeslot record
                const currTimeslot = timeslots[currTimeslotIndex];
                if(currTimeslot){ 
                    // update bay timeslot to booked
                    if(event.bay == '1'){
                        currTimeslot.bay1_booked = true;
                    } else {
                        currTimeslot.bay2_booked = true;
                    }
                }
            }
        });

        setTimeslots(timeslots_json);

        console.log(events);

        console.log(timeslots);

    }, [date]);
    */

    useEffect(() => {
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
    }, [playingTime]);

    
    const getEventWidth = (numGuests) => {
        switch(numGuests){
            case 1:
                return view === 'Both' ? classes.event2Two : classes.event2One;
            case 2: 
                return view === 'Both' ? classes.event3Two : classes.event3One;
            case 3:
                return view === 'Both' ? classes.event4Two : classes.event4One;
            default: 
                return view === 'Both' ? classes.event1Two : classes.event1One;
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

    const addEvent = async () => {
        if(bookingFor === 'other'){
            setBookingMember(await userService.getById(bookingMemberId));
        }

        events.push({
            bay: bookingBay,
            members: bookingFor === 'self' ? [{ id: user.id, firstName: user.firstName, lastName: user.lastName }] : [{ id: bookingMember.id, firstName: bookingMember.firstName, lastName: bookingMember.lastName }],
            guests: bookingPlayers === '1' ? 0 : parseInt(bookingPlayers) - 1,
            hours: parseInt(playingTime),
            date: bookingDate,
            start_time: startTime,
            end_time: endTime
        });

        close();
    };

    const schedule = timeslots.map((timeslot, index) => (
        <div key={timeslot.time} className={`${classes.schedule} ${ index == 0 ? classes.scheduleFirst : '' }`}>
            <div className={`${classes.scheduleTitle} ${index == 0 ? classes.scheduleTitleFirst : ''}`}>
                <span className={classes.scheduleTime}>{timeslot.time.toLocaleTimeString()}</span>
            </div>
            <div className={`${classes.spacer} ${ index == 23 ? classes.bottomGrid : '' }`}>&nbsp;</div>
            <div className={`${getBayDisplay('Bay 1', view, 'Schedule')} ${ index == 23 ? classes.bottomGrid : '' }`}></div>
            <div className={`${getBayDisplay('Bay 2', view, 'Schedule')} ${ index == 23 ? classes.bottomGrid : '' }`}></div>
            {events.filter(event => event.effective_start_time.toLocaleTimeString() === timeslot.time.toLocaleTimeString()).map(event => (
                    <div key={event.bay + event.effective_start_time} className={`${classes.event} ${event.bay == '2' && view == 'Both' ? classes.eventBay2 : classes.eventBay1} ${view !== 'Both' && ('Bay ' + event.bay) !== view ? 'd-none' : ''} ${getEventWidth(event.guests)}`} style={{ height: event.effective_hours * 54 - 4 }}>
                        <span className="fw-bold">{event.members.map((m) => {
                            return <span>{m.firstName} {m.lastName}</span>
                        })}</span> {event.guests + 1}
                        <br/><span className={classes.timeBlock}>{event.start_time.toLocaleTimeString() + ' - ' + event.end_time.toLocaleTimeString()}</span>
                    </div>
                ))
            }
        </div>
    ));

  return (
    <div>
        <Modal opened={opened} onClose={close} title="Book a Slot" scrollAreaComponent={ScrollArea.Autosize}>
            <Stack>
                <Text size="sm" fw={500}>Pick a Date</Text>
                <DatePickerInput
                    leftSection={icon}
                    leftSectionPointerEvents="none"
                    placeholder="Pick a Day"
                    value={bookingDate}
                    onChange={setBookingDate}
                />

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

                <Stack className={`${ bookingFor === 'other' ? '' : 'd-none'}`}>
                    <Text size="sm" fw={500}>Select Member</Text>
                    <Select
                        value={bookingMemberId}
                        onChange={setBookingMemberId}
                        placeholder='Member Name'
                        limit={10}
                        data={members}
                        searchable
                    />
                </Stack>

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
                    onChange={setStartTime}
                    placeholder='Start Time'
                    data={timeslots}
                />
                <Select
                    value={endTime}
                    onChange={setEndTime}
                    placeholder='End Time'
                    data={timeslots}
                />
                <Group justify='space-between'>
                    <Button color="red" onClick={close}>
                        Cancel
                    </Button>
                    <Button color="var(--mantine-color-light-green-6)" onClick={addEvent}>
                        Confirm
                    </Button>
                </Group>
            </Stack>
        </Modal>
        <div className={classes.menuBar}>
            <Group justify='space-between' className={classes.menuGroup}>
                <Button onClick={open} color="var(--mantine-color-light-green-6)">
                    Book a Slot
                </Button>
                <DatePickerInput
                    leftSection={icon}
                    leftSectionPointerEvents="none"
                    placeholder="Pick a Day"
                    value={date}
                    onChange={setDate}
                />
                <SegmentedControl value={view} onChange={setView} data={['Bay 1', 'Bay 2', 'Both']} />
                <Group>
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
                    <DatePickerInput
                        leftSection={icon}
                        leftSectionPointerEvents="none"
                        placeholder="Pick a Day"
                        value={date}
                        onChange={setDate}
                    />
                    <Group>
                        <Button color="var(--mantine-color-light-green-6)" variant="light" onClick={() => setDate(dayjs(date).subtract(1, 'days').toDate())}>
                            <IconChevronLeft style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
                        </Button>
                        <Button color="var(--mantine-color-light-green-6)" variant="light" onClick={() => setDate(dayjs(date).add(1, 'days').toDate())}>
                            <IconChevronRight style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
                        </Button>
                    </Group>
                </Group>
                <Button onClick={open} color="var(--mantine-color-light-green-6)">
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
