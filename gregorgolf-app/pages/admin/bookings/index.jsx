import Link from 'next/link';
import { useState, useEffect } from 'react';
import moment from 'moment';
import { Container, Select, Avatar, Badge, Title, Table, Group, Text, ActionIcon, Anchor, rem, SimpleGrid, TextInput, ScrollArea, UnstyledButton, Center, keys } from '@mantine/core';
import { IconSend, IconPhoneCall, IconAt, IconSelector, IconChevronDown, IconChevronUp, IconSearch } from '@tabler/icons-react';

import { Spinner } from 'components';
import { Layout } from 'components';

import classes from './Index.module.css';
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

function filterData(data, search) {
    const query = search.toLowerCase().trim();
    return data.filter((item) =>
      keys(data[0]).some((key) => item[key].toString().toLowerCase().includes(query))
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
          return b[sortBy].toString().localeCompare(a[sortBy]);
        }
  
        return a[sortBy].toString().localeCompare(b[sortBy]);
      }),
      payload.search
    );
}

function Index() {
    const [data, setData] = useState(null);
    const [sortedData, setSortedData] = useState(null);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState(null);
    const [reverseSortDirection, setReverseSortDirection] = useState(false);

    useEffect(() => {
        eventService.getAll().then(x => {
            setData(x);
            setSortedData(x);
        });
    }, []);

    function deleteUser(id) {
        setData(data.map(x => {
            if (x.id === id) { x.isDeleting = true; }
            return x;
        }));
        eventService.delete(id).then(() => {
            setData(data => data.filter(x => x.id !== id));
        });
    }

    const setSorting = (field) => {
        const reversed = field === sortBy ? !reverseSortDirection : false;
        setReverseSortDirection(reversed);
        setSortBy(field);
        setSortedData(sortData(data, { sortBy: field, reversed, search }));
    }

    const handleSearchChange = (event) => {
        const { value } = event.currentTarget;
        setSearch(value);
        setSortedData(sortData(data, { sortBy, reversed: reverseSortDirection, search: value }));
    }

    return (
        <Layout>
            <h1>All Bookings</h1>
            <ScrollArea.Autosize mah={400} >
            <Table horizontalSpacing="xs" verticalSpacing="xs" miw={1100}>
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
                                <Text>{moment(event.startTime).format('MMM D, YYYY')}</Text>
                              </Table.Td>
                              <Table.Td>
                                <Text>{event.members[0].firstName + ' ' + event.members[0].lastName}</Text>
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
                                {moment(event.startTime).format('hh:mm A')}
                              </Table.Td>
                              <Table.Td>
                                <Text>
                                  {moment(event.endTime).format('hh:mm A')}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Text>
                                  {event.members.length + event.guests}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Text>
                                  {event.members.length}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Text>
                                  {event.guests}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Group gap={0} justify="flex-end">
                                    <button onClick={() => deleteUser(event.id)} className="btn btn-sm btn-danger btn-delete-user" style={{ width: '60px' }} disabled={event.isDeleting}>
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