import { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { Layout } from '@/components'
import Calendar from '@/components/Calendar'
import { Loader } from '@mantine/core'

const inter = Inter({ subsets: ['latin'] })

import { eventService } from '@/services'

export default function Home() {
  const [events, setEvents] = useState(null);

  useEffect(() => {
      loadData();
  }, []);

const loadData = async () => {
    let todaysEvents;

    await eventService.getByDate()
        .then(x => todaysEvents = x);

    todaysEvents.map((event) => {
        // calculate effective start time
        let currStartTime = new Date(event.startTime.getTime());
        let currHours = event.hours;
        while(currStartTime < new Date(new Date('2024-04-05T08:00:00.000Z').setHours(0,0,0,0))){
            // add an hour
            currStartTime.setTime(currStartTime.getTime() + (1*60*60*1000));
            currHours -= 1;
        }
        event.effective_start_time = currStartTime;
        
        // calculate effective end time
        let currEndTime = new Date(event.endTime.getTime());
        while(currEndTime > new Date(new Date('2024-04-05T08:00:00.000Z').setHours(24,0,0,0))){
            currEndTime.setTime(currEndTime.getTime() - (1*60*60*1000));
            currHours -= 1;
        }
        event.effective_end_time = currEndTime;
        
        // set effective hours
        event.effective_hours = currHours;
    });
    
    //console.log("todaysEvents: ", todaysEvents);

    setEvents(todaysEvents);

    //console.log("first events: ", events);
}

  return (
    <Layout>
      {events ? <Calendar events={events} /> : <Loader color="lime" type="bars" />}
    </Layout>
  )
}
