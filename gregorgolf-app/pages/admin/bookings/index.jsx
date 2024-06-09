import Link from 'next/link';
import { useState, useEffect } from 'react';
import moment from 'moment';
import { Button, Container, Select, Avatar, Badge, Title, Table, Group, Text, ActionIcon, Anchor, rem, SimpleGrid, TextInput, ScrollArea, UnstyledButton, Center, keys } from '@mantine/core';
import { IconSend, IconPhoneCall, IconAt, IconSelector, IconChevronDown, IconChevronUp, IconSearch } from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';

import { Spinner } from 'components';
import { Layout } from 'components';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import classes from './Index.module.css';
import '@mantine/dates/styles.css';
import { userService, alertService, eventService } from '@/services';

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


    useEffect(() => {
        eventService.getAll().then(x => {
            setData(modifyData(x));
            setSortedData(modifyData(x));
            console.log("data: ", modifyData(x));
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
        newRow.players = (row.members.length + row.guests).toString();
        newRow.guests = row.guests.toString();
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
        eventService.delete(id).then(() => {
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

    return (
        <Layout>
            <h1>All Bookings</h1>
            <Group>
              <DatePickerInput type="range" placeholder="Pick date range" clearable allowSingleDateInRange value={dateRange} onChange={setDateRange} />
              <Button onClick={exportData} color="var(--mantine-color-light-green-6)">
                  Export
              </Button>
            </Group>
            <ScrollArea.Autosize mah={400} >
            <Table horizontalSpacing="xs" verticalSpacing="xs" miw={1200}>
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
        </ScrollArea.Autosize>
        </Layout>
    );
}