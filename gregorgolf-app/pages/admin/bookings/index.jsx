import Link from 'next/link';
import { useState, useEffect } from 'react';
import moment from 'moment';
import { Stack, Button, Table, Group, Text, rem, ScrollArea, TextInput, Loader, UnstyledButton, Select, Switch, Center, keys, Modal, NumberInput, SegmentedControl } from '@mantine/core';
import { IconSelector, IconChevronDown, IconChevronUp, IconCalendar, IconSearch } from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';


import { Layout } from 'components';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import classes from './Index.module.css';
import '@mantine/dates/styles.css';
import { alertService, appService, eventService, userService } from '@/services';

const getCurrentDay = () => new Date(new Date().setHours(0,0,0,0));

const printTime = (timeslot) => {
  const time = timeslot.split(' ')[0];
  const meridian = timeslot.split(' ')[1];

  const newTime = time.split(':')[0] + ":" + time.split(':')[1] + ' ' + meridian; 

  return newTime;
}

export default Index;

function Th({ children, reversed, sorted, onSort }) {
    const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
    return (
      <Table.Th className={classes.th}>
        <UnstyledButton onClick={onSort} className={classes.control}>
          <Group justify="space-between">
            <Text fw={500} fz="sm">
              {children}
            </Text>
            <Center className={classes.icon}>
              <Icon style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
            </Center>
          </Group>
        </UnstyledButton>
      </Table.Th>
    )
}

function Index() {
    const [data, setData] = useState(null);
    const [sortedData, setSortedData] = useState(null);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState(null);
    const [reverseSortDirection, setReverseSortDirection] = useState(false);
    const [dateRange, setDateRange] = useState([null, null]);

    // modal
    const [opened, { open, close }] = useDisclosure(false);
    const [display, setDisplay] = useState();
    const [numIn60, setNumIn60] = useState();

    const icon = <IconCalendar style={{ width: rem(18), height: rem(18) }} stroke={1.5} />;
    const [restrictDate, setRestrictDate] = useState(getCurrentDay());
    const [restrictBay, setRestrictBay] = useState('1');
    const [allDay, setAllDay] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [events, setEvents] = useState(null);

    const getTimeslots = (date) => {
      // calendar timeslots
      let timeslots_json = [];
      for(let i = 0; i <= 24; i++){
          // set display value in booking times for timeslot
          let displayValue = '';
          if(i >= 24){
            displayValue += '(+1) ';
          }

          // TEST VALUE: '2024-04-05T08:00:00.000Z'
          displayValue += printTime(new Date(new Date(date).setHours(i,0,0,0)).toLocaleTimeString());

          // TEST VALUE: '2024-04-05T08:00:00.000Z'
          timeslots_json.push({
              value: new Date(new Date(date).setHours(i,0,0,0)).toISOString(),
              label: displayValue
          });
      }

      return timeslots_json;
    }

    const [startTimes, setStartTimes] = useState(getTimeslots(restrictDate));
    const [endTimes, setEndTimes] = useState(getTimeslots(restrictDate));

    useEffect(() => {
        eventService.getAll().then(x => {
            setData(modifyData(x));
            setSortedData(modifyData(x));
        });
    }, []);

    useEffect(() => {
      if(!isNull(data)){
        setSortedData(data.filter((row) => {
          let filterPass = true;
          const date = new Date(row.date);

          // check start
          if(dateRange[0]){
            filterPass = filterPass && (date >= new Date(dateRange[0]));
          }

          // check end
          if(dateRange[1]){
            filterPass = filterPass && (date <= new Date(dateRange[1]));
          }

          return filterPass;
        }))
     }
    }, [dateRange]);

    // getEndTimes based on startTime selection
    const getEndTimes = (time) => {
      const timeslots = getTimeslots(restrictDate);
      const startIndex = timeslots.findIndex(timeslot => new Date(timeslot.value).getTime() === new Date(time).getTime());
      const newList = timeslots.slice(startIndex + 1);

      setEndTimes([...newList]);
    }

    // check if value is null
    const isNull = (value) => typeof value === "object" && !value;

    // modify data for sorting capabilities (eliminate nested objects and make all strings)
    const modifyData = (data) => {
      return data.map((row) => {
        const newRow = {};

        newRow.id = row.id.toString();
        newRow.bay = row.bay.toString();
        newRow.name = row.members[0].firstName + ' ' + row.members[0].lastName;
        newRow.date = moment(row.startTime).calendar();
        newRow.startTime = moment(row.startTime).format('hh:mm A');
        newRow.endTime = moment(row.endTime).format('hh:mm A');
        newRow.members = row.members.length.toString();
        newRow.players = (row.members.length + row.members.reduce((prev, curr) => prev + curr.guests, 0)).toString();
        newRow.guests = row.members.reduce((prev, curr) => prev + curr.guests, 0).toString();
        newRow.hours = row.hours.toString();
        newRow.createdAt = moment(row.createdAt).format('MMMM Do YYYY, h:mm:ss a');
        newRow.updatedAt = moment(row.updatedAt).format('MMMM Do YYYY, h:mm:ss a');

        return newRow;
      });
    };

    function filterData(data, search) {
      const query = search.toLowerCase().trim();
      return data.filter((item) =>
        keys(data[0]).some((key) => item[key].toLowerCase().includes(query))
      );
    }
    
    function sortData(data, payload) {
        const { sortBy } = payload;
      
        if (!sortBy) {
          return filterData(data, payload.search);
        }
      
        return filterData(
          [...data].sort((a, b) => {
            if (payload.reversed) {
              return b[sortBy].localeCompare(a[sortBy]);
            }
      
            return a[sortBy].localeCompare(b[sortBy]);
          }),
          payload.search
        );
    }

    function deleteEvent(id) {
        setSortedData(sortedData.map(x => {
            if (x.id === id) { x.isDeleting = true; }
            return x;
        }));
        eventService.delete(id, userService.userValue.id, true).then(() => {
            setSortedData(sortedData => sortedData.filter(x => x.id !== id));
        });
    }

    const setSorting = (field) => {
        const reversed = field === sortBy ? !reverseSortDirection : false;
        setReverseSortDirection(reversed);
        setSortBy(field);
        setSortedData(sortData(data, { sortBy: field, reversed, search }));
    };

    const handleSearchChange = (event) => {
        const { value } = event.currentTarget;
        setSearch(value);
        setSortedData(sortData(data, { sortBy, reversed: reverseSortDirection, search: value }));
    };

    const exportData = () => {
      const worksheet = XLSX.utils.json_to_sheet(sortedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      // Buffer to store the generated Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

      saveAs(blob, "data.xlsx");
    };

    const resetRestrict = () => {
      setRestrictDate(getCurrentDay());
      setRestrictBay('1');
      setAllDay(false);
      setStartTime(null);
      setEndTime(null);
      setEvents(null);
    }

    const getEvents = async (startTime, endTime, bay) => {
      eventService.getInRange(startTime, endTime, bay)
        .then((results) => setEvents(results));
    }

    const submitSettings = async () => {
      await appService.update({ numIn60: numIn60 });

      alertService.success("App settings updated", true);

      close();
      setDisplay();
    }

    const submitRestrict = async () => {
      if(!allDay && (isNull(startTime) || isNull(endTime))){
        alert("Please set the times for restriction.");
      } else {
        let hours;
        let eventStart;
        let eventEnd;

        if(allDay){
          hours = 24;
          eventStart = new Date(new Date(restrictDate).setHours(0,0,0,0));
          eventEnd = new Date(new Date(restrictDate).setHours(24,0,0,0));
        } else {
          const timeslots = getTimeslots(restrictDate);
          const startIndex = timeslots.findIndex(timeslot => new Date(timeslot.value).getTime() === new Date(startTime).getTime());
          const endIndex = timeslots.findIndex(timeslot => new Date(timeslot.value).getTime() === new Date(endTime).getTime());
          hours = endIndex - startIndex;
          eventStart = new Date(startTime);
          eventEnd = new Date (endTime);
        }
        
        // cancel all existing events
        const eventsToCancel = await eventService.getInRange(eventStart.toISOString(), eventEnd.toISOString(), restrictBay);
        if(eventsToCancel.length !== 0){
          await deleteEvents(eventsToCancel);
        }
        
        // add restricted event
        const event = {
          bay: parseInt(restrictBay),
          members: [{ id: userService.userValue.id, firstName: "Admin", lastName: "Restricted", guests: 0 }],
          hours: hours,
          startTime: eventStart,
          endTime: eventEnd,
        };
        await eventService.addEvent(event);
        alertService.success("Restriction added");

        // close and reset fields
        close();
        resetRestrict();

        // refresh page
        eventService.getAll().then(x => {
          setData(modifyData(x));
          setSortedData(modifyData(x));
        });
      }
    }

    const deleteEvents = async (events) => {
      let i= 0;
      while(i<events.length){
        await eventService.delete(events[i].id, userService.userValue.id, true);
        i++;
      }
    }

    return (
        <Layout>
          <h1>All Bookings</h1>
          <Group justify='space-between'>
            <Group className='gap-1 mb-2 mb-sm-0'>
              <DatePickerInput type="range" placeholder="Pick date range" clearable allowSingleDateInRange value={dateRange} onChange={setDateRange} />
              <Button onClick={exportData} color="var(--mantine-color-light-green-6)">
                  Export
              </Button>
            </Group>
            <Group className='gap-1'>
              <Button onClick={async () => {
                setDisplay('settings');
                setNumIn60(await appService.getNumIn60());
                open();
              }} variant="default">
                  Edit Settings
              </Button>
              <Button onClick={() => {
                setDisplay('restrict');
                open();
              }} color="var(--mantine-color-red-9)">
                  Restrict Bays
              </Button>
            </Group>
          </Group>
          <TextInput
            placeholder="Search by any field"
            mb="md"
            leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
            value={search}
            onChange={handleSearchChange}
            className='mt-2'
          />
          <ScrollArea mah={400} >
            <Table horizontalSpacing="xs" verticalSpacing="xs" miw={1300}>
                <Table.Tbody>
                    <Table.Tr>
                        <Th
                        sorted={sortBy === 'date'}
                        reversed={reverseSortDirection}
                        onSort={() => setSorting('date')}
                        >
                        Date
                        </Th>
                        <Th
                        sorted={sortBy === 'name'}
                        reversed={reverseSortDirection}
                        onSort={() => setSorting('name')}
                        >
                        Name
                        </Th>
                        <Th
                        sorted={sortBy === 'bay'}
                        reversed={reverseSortDirection}
                        onSort={() => setSorting('bay')}
                        >
                        Bay
                        </Th>
                        <Th
                        sorted={sortBy === 'hours'}
                        reversed={reverseSortDirection}
                        onSort={() => setSorting('hours')}
                        >
                        # of Hours
                        </Th>
                        <Th
                        sorted={sortBy === 'startTime'}
                        reversed={reverseSortDirection}
                        onSort={() => setSorting('startTime')}
                        >
                        Start Time
                        </Th>
                        <Th
                        sorted={sortBy === 'endTime'}
                        reversed={reverseSortDirection}
                        onSort={() => setSorting('endTime')}
                        >
                        End Time
                        </Th>
                        <Th
                        sorted={sortBy === 'players'}
                        reversed={reverseSortDirection}
                        onSort={() => setSorting('players')}
                        >
                        Player(s)
                        </Th>
                        <Th
                        sorted={sortBy === 'members'}
                        reversed={reverseSortDirection}
                        onSort={() => setSorting('members')}
                        >
                        Member(s)
                        </Th>
                        <Th
                        sorted={sortBy === 'guests'}
                        reversed={reverseSortDirection}
                        onSort={() => setSorting('guests')}
                        >
                        Guest(s)
                        </Th>
                    </Table.Tr>
                </Table.Tbody>
                <Table.Tbody>
                    {sortedData ? (
                        sortedData.map((event) => (
                            <Table.Tr key={event.id}>
                              <Table.Td>
                                <Text>{event.date}</Text>
                              </Table.Td>
                              <Table.Td>
                                <Text>{event.name}</Text>
                              </Table.Td>
                              <Table.Td>
                                <Text fz="sm" fw={500}>
                                  {event.bay}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Text>
                                  {event.hours}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                {event.startTime}
                              </Table.Td>
                              <Table.Td>
                                <Text>
                                  {event.endTime}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Text>
                                  {event.players}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Text>
                                  {event.members}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Text>
                                  {event.guests}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Group gap={0} justify="flex-end">
                                    <button onClick={() => deleteEvent(event.id)} className="btn btn-sm btn-danger btn-delete-user" style={{ width: '60px' }} disabled={event.isDeleting}>
                                        {event.isDeleting
                                            ? <span className="spinner-border spinner-border-sm"></span>
                                            : <span>Delete</span>
                                        }
                                    </button>
                                </Group>
                              </Table.Td>
                            </Table.Tr>
                          ))
                    ) : (
                        <Table.Tr>
                        <Table.Td colSpan='4'>
                            <Text fw={500} ta="center">
                            No events found
                            </Text>
                        </Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>
            </Table>
          </ScrollArea>
          <Modal opened={opened} onClose={() => {
            close();
            setDisplay();
            resetRestrict();
          }} title={ display === 'settings' ? "Edit Settings" : "Restrict a Bay"} scrollAreaComponent={ScrollArea.Autosize} centered>
            <Stack>
              { display === 'settings' &&
              <>
                <Text size="sm" fw={500}>Number of Bookings in 60 Days</Text>
                <NumberInput value={numIn60} onChange={setNumIn60} />
              </>
              }
              { display === 'restrict' && 
              <>
                <Text size="sm" fw={500}>Pick a Date</Text>
                <DatePickerInput
                    leftSection={icon}
                    leftSectionPointerEvents="none"
                    placeholder="Pick a Day"
                    value={restrictDate}
                    onChange={(value) => {
                      setEvents(null);
                      setAllDay(false);
                      setStartTime(null);
                      setEndTime(null);
                      setRestrictDate(value);
                      setStartTimes(getTimeslots(value));
                      setEndTimes(getTimeslots(value));
                    }}
                />

                <Text size="sm" fw={500}>Choose Bay</Text>
                <SegmentedControl
                    value={restrictBay}
                    onChange={(value) => {
                      setEvents(null);
                      setAllDay(false);
                      setStartTime(null);
                      setEndTime(null);
                      setRestrictBay(value);
                    }}
                    data={[
                        { label: 'Bay 1', value: '1' },
                        { label: 'Bay 2', value: '2' }
                    ]}
                    color="var(--mantine-color-light-green-6)"
                />

                <Text size="sm" fw={500}>All Day?</Text>
                <Switch 
                  checked={allDay}
                  onChange={(event) => {
                    setAllDay(event.currentTarget.checked);
                    if(event.currentTarget.checked){
                      setEvents(null);
                      getEvents(new Date(new Date(restrictDate).setHours(0,0,0,0)).toISOString(), new Date(new Date(restrictDate).setHours(23,0,0,0)).toISOString(), restrictBay);
                    } else {
                      setEvents(null);
                    }
                  }} 
                  color="var(--mantine-color-light-green-6)"
                />

                { !allDay &&
                <>
                  <Text size="sm" fw={500}>Select Restrict Time</Text>
                  <Select
                      value={startTime}
                      onChange={(value) => {
                        setStartTime(value);
                        setEndTime(null);
                        getEndTimes(value);
                        setEvents(null);
                      }}
                      placeholder='Start Time'
                      data={startTimes}
                  />
                  <Select
                      value={endTime}
                      onChange={(value) => {
                        setEndTime(value);
                        getEvents(new Date(startTime).toISOString(), new Date(value).toISOString(), restrictBay);
                      }}
                      placeholder='End Time'
                      data={endTimes}
                  />
                </>
                }
                { !events && 
                  <Center>
                    <Loader color="lime" type="bars" />
                  </Center>
                }
                { events && (
                  <Center>
                    <Text size="sm" fw={500}>Events to Cancel:&nbsp;</Text>
                    <Text fw={700} color="red">{events.length}</Text>
                  </Center>
                )
                }

              </>
              }

              <Group justify='space-between'>
                <Button color="red" onClick={() => {
                    close();
                    setDisplay(); 
                    resetRestrict();
                }}>
                    Cancel
                </Button>
                <Button color="var(--mantine-color-light-green-6)" onClick={ display === 'settings' ? submitSettings : submitRestrict}>
                    Confirm
                </Button>
              </Group>
            </Stack>
          </Modal>
        </Layout>
    );
}