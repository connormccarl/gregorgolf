import Link from 'next/link';
import { useState, useEffect, useImperativeHandle } from 'react';
import moment from 'moment';
import { Button, Select, Avatar, Badge, Title, Table, Group, Text, ActionIcon, Anchor, rem, SimpleGrid, TextInput, ScrollArea, UnstyledButton, Center, keys } from '@mantine/core';
import { IconSend, IconPhoneCall, IconAt, IconSelector, IconChevronDown, IconChevronUp, IconSearch } from '@tabler/icons-react';

import { Spinner } from 'components';
import { Layout } from 'components';
import { userService } from 'services';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import classes from './Index.module.css';
import { alertService } from '@/services';

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

function Index() {
    const [data, setData] = useState(null);
    const [sortedData, setSortedData] = useState(null);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState(null);
    const [reverseSortDirection, setReverseSortDirection] = useState(false);

    useEffect(() => {
        userService.getAll().then(x => {
            setData(modifyData(x));
            setSortedData(modifyData(x));
            console.log("user: ", x);
        });
    }, []);

    // modify data for sorting capabilities (eliminate nested objects and make all strings)
    const modifyData = (data) => {
      return data.map((row) => {
        const newRow = {};

        newRow.id = row.id.toString();
        newRow.photo = row.photo.toString();
        newRow.name = row.firstName + ' ' + row.lastName;
        newRow.email = row.email.toString();
        newRow.membership = row.membership.toString();
        newRow.createdAt = moment(row.createdAt).calendar();

        return newRow;
      });
    };

    function deleteUser(id) {
        setData(data.map(x => {
            if (x.id === id) { x.isDeleting = true; }
            return x;
        }));
        userService.delete(id).then(() => {
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

    const updateMembership = async (id, membership) => {
        alertService.clear();
        await userService.update(id, { membership: membership });
        alertService.success("Membership updated");
    }

    const exportData = () => {
      const worksheet = XLSX.utils.json_to_sheet(sortedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      // Buffer to store the generated Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

      saveAs(blob, "users.xlsx");
    };

    return (
        <Layout>
            <h1>Users</h1>
            <Link href="/users/add" className="btn btn-sm btn-success mb-2">Add User</Link>
            <Button onClick={exportData} color="var(--mantine-color-light-green-6)" className='ms-2 mb-2'>
                Export
            </Button>

            <ScrollArea>
            <TextInput
                placeholder="Search by any field"
                mb="md"
                leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                value={search}
                onChange={handleSearchChange}
            />
            <Table horizontalSpacing="lg" verticalSpacing="xs" miw={1600}>
                <Table.Tbody>
                    <Table.Tr>
                        <Th
                        sorted={sortBy === 'createdAt'}
                        reversed={reverseSortDirection}
                        onSort={() => setSorting('createdAt')}
                        >
                        Created At
                        </Th>
                        <Th
                        sorted={sortBy === 'name'}
                        reversed={reverseSortDirection}
                        onSort={() => setSorting('name')}
                        >
                        Name
                        </Th>
                        <Th
                        sorted={sortBy === 'email'}
                        reversed={reverseSortDirection}
                        onSort={() => setSorting('email')}
                        >
                        Email
                        </Th>
                        <Th
                        sorted={sortBy === 'membership'}
                        reversed={reverseSortDirection}
                        onSort={() => setSorting('membership')}
                        >
                        Membership
                        </Th>
                        <Th
                        sorted={sortBy === 'subscriptionDate'}
                        reversed={reverseSortDirection}
                        onSort={() => setSorting('subscriptionDate')}
                        >
                        Subscription Date
                        </Th>
                        <Th
                        sorted={sortBy === 'subscriptionStatus'}
                        reversed={reverseSortDirection}
                        onSort={() => setSorting('subscriptionStatus')}
                        >
                        Subscription Status
                        </Th>
                        <Th
                        sorted={sortBy === 'accountStatus'}
                        reversed={reverseSortDirection}
                        onSort={() => setSorting('accountStatus')}
                        >
                        Account Status
                        </Th>
                        <Th
                        sorted={sortBy === 'subscriptionRenewal'}
                        reversed={reverseSortDirection}
                        onSort={() => setSorting('subscriptionRenewal')}
                        >
                        Subscription Renewal
                        </Th>
                    </Table.Tr>
                </Table.Tbody>
                <Table.Tbody>
                    {sortedData ? (
                        sortedData.map((user) => (
                            <Table.Tr key={user.id}>
                              <Table.Td>
                                <Text>{user.createdAt}</Text>
                              </Table.Td>
                              <Table.Td>
                                <Group gap="sm">
                                  <Avatar size={30} src={user.photo} radius={30} />
                                  <Text fz="sm" fw={500}>
                                    {user.name}
                                  </Text>
                                </Group>
                              </Table.Td>
                              <Table.Td>
                                <Text>
                                  {user.email}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Select
                                    data={[{ value: 'user', label: 'User'}, { value: 'admin', 'label': 'Admin' }]}
                                    defaultValue={user.membership}
                                    style={{width: '7em'}}
                                    onChange={(value, option) => updateMembership(user.id, value)}
                                />
                              </Table.Td>
                              <Table.Td>
                                <Text>
                                  Subscription Date
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Text>
                                  Subscription Status
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Text>
                                  Account Status
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Text>
                                  Subscription Renewal
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Group gap={0} justify="flex-end">
                                    <Link href={`/users/edit/${user.id}`} className="btn btn-sm btn-primary me-1">Edit</Link>
                                    <button onClick={() => deleteUser(user.id)} className="btn btn-sm btn-danger btn-delete-user" style={{ width: '60px' }} disabled={user.isDeleting}>
                                        {user.isDeleting
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
                            No users found
                            </Text>
                        </Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>
            </Table>
        </ScrollArea>
        </Layout>
    );
}