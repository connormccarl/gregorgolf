import React, { useState } from 'react';
import dayjs from 'dayjs';
import { rem } from '@mantine/core';
import { IconCalendar, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { Group, Button, Stack } from '@mantine/core';

import '@mantine/dates/styles.css';
import classes from './Calendar.module.css';

const timeslots = ['12 AM','1 AM','2 AM','3 AM','4 AM','5 AM','6 AM','7 AM','8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM','10 PM','11 PM']

const events = [
    {
        bay: 1,
        member: 'Connor McCarl',
        guests: [],
        hours: 2,
        date: '2/28/2024',
        start_time: '12 AM',
        end_time: '2 AM'
    },
    {
        bay: 2,
        member: 'Connor McCarl',
        guests: ['Jason Rice', 'Jason Friend', 'Connor Friend'],
        hours: 4,
        date: '2/28/2024',
        start_time: '12 AM',
        end_time: '4 AM'
    },
    {
        bay: 1,
        member: 'Connor McCarl',
        guests: ['Jason Rice'],
        hours: 1,
        date: '2/28/2024',
        start_time: '4 AM',
        end_time: '5 AM'
    },
    {
        bay: 1,
        member: 'Connor McCarl',
        guests: ['Jason Rice', 'Connor Friend'],
        hours: 1,
        date: '2/28/2024',
        start_time: '7 AM',
        end_time: '8 AM'
    }
]

const getGroupName = (numGuests) => {
    switch(numGuests){
        case 1:
            return 'Double';
        case 2: 
            return 'Threesome';
        case 3:
            return 'Foursome';
        default: 
            return 'Single';
    }
}

const getEventColor = (numGuests) => {
    switch(numGuests){
        case 1:
            return classes.event2;
        case 2: 
            return classes.event3;
        case 3:
            return classes.event4;
        default: 
            return classes.event1;
    }
}

const schedule = timeslots.map((time, index) => (
    <div key={time} className={`${classes.schedule} ${ index == 0 ? classes.scheduleFirst : '' }`}>
        <div className={`${classes.scheduleTitle} ${index == 0 ? classes.scheduleTitleFirst : ''}`}>
            <span className={classes.scheduleTime}>{time}</span>
        </div>
        <div className={`${classes.spacer} ${ index == 23 ? classes.bottomGrid : '' }`}>&nbsp;</div>
        <div className={`${classes.scheduleBlock} ${ index == 23 ? classes.bottomGrid : '' }`}></div>
        <div className={`${classes.scheduleBlock} ${ index == 23 ? classes.bottomGrid : '' }`}></div>
        { events.filter(event => event.start_time == time).map(event => (
            <div key={event.bay + event.start_time} className={`${classes.event} ${ event.bay == 1 ? classes.eventBay1 : classes.eventBay2 } ${getEventColor(event.guests.length)}`} style={{ height: event.hours * 54 - 4 }}>
                <span className="fw-bold">{event.member}</span> {getGroupName(event.guests.length)}
                <br/><span className={classes.timeBlock}>{event.start_time + ' - ' + event.end_time}</span>
            </div>
        ))
        }
    </div>
));

export default function Calendar() {
    const [date, setDate] = useState(new Date());
    const icon = <IconCalendar style={{ width: rem(18), height: rem(18) }} stroke={1.5} />;

  return (
    <div>
        <div className={classes.menuBar}>
            <Group justify='space-between' className={classes.menuGroup}>
                <Button color="var(--mantine-color-light-green-6)">
                    Book a Slot
                </Button>
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
                <Button color="var(--mantine-color-light-green-6)">
                    Book a Slot
                </Button>
            </Stack>
            <div className={classes.header}>
                <div className={classes.headerTitle}>
                    GMT-08
                </div>
                <div className={classes.spacer}>&nbsp;</div>
                <div className={classes.columnTitle}>Bay 1</div>
                <div className={classes.columnTitle}>Bay 2</div>
            </div>
        </div>
        <div className={classes.grid}>
            {schedule}
        </div>
    </div>
  )
}
