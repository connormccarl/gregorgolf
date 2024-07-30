import Link from 'next/link';
import { useState, useEffect } from 'react';
import moment from 'moment';
import { Button, Select, Avatar, Table, Group, Text, rem, TextInput, ScrollArea, UnstyledButton, Center, keys } from '@mantine/core';
import { IconSelector, IconChevronDown, IconChevronUp, IconSearch } from '@tabler/icons-react';

import { Layout } from 'components';
import { userService, emailService } from 'services';

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
        });
    }, []);

    // modify data for sorting capabilities (eliminate nested objects and make all strings)
    const modifyData = (data) => {
      return data.map((row) => {
        const newRow = {};

        newRow.id = row.id.toString();
        newRow.photo = row.photo?.toString();
        newRow.name = row.firstName + ' ' + row.lastName;
        newRow.email = row.email.toString();
        newRow.membership = row.membership?.toString();
        newRow.accountStatus = row.accountStatus.toString();
        newRow.subscriptionStatus = row.subscriptionStatus.toString();
        newRow.subscriptionDate = row.subscriptionDate ? moment(row.subscriptionDate).calendar() : '';
        newRow.subscriptionFrequency = row.subscriptionFrequency?.toString();
        newRow.createdAt = moment(row.createdAt).calendar();

        return newRow;
      });
    };

    function deleteUser(id) {
        setSortedData(sortedData.map(x => {
            if (x.id === id) { x.isDeleting = true; }
            return x;
        }));
        userService.delete(id).then(() => {
            setSortedData(sortedData => sortedData.filter(x => x.id !== id));
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

    // update membership type (user/admin)
    const updateMembership = async (id, membership) => {
        alertService.clear();

        // set account and subscription status depending on role change
        let account;
        let subscription;
        if(membership === 'admin'){
          account = 'active';
          subscription = 'active';
        } else {
          account = 'active';
          subscription = 'inactive';
        }

        await userService.update(id, { membership: membership, accountStatus: account, subscriptionStatus: subscription, subscriptionDate: null, subscriptionFrequency: null });
        
        setData(data => data.map(item => {
          if(item.id === id){
            return { ...item, membership: membership, accountStatus: account, subscriptionStatus: subscription, subscriptionDate: null, subscriptionFrequency: null };
          } else {
            return { ...item };
          }
        }));
        setSortedData(sortedData => sortedData.map(item => {
          if(item.id === id){
            return { ...item, membership: membership, accountStatus: account, subscriptionStatus: subscription, subscriptionDate: null, subscriptionFrequency: null };
          } else {
            return { ...item };
          }
        }));

        alertService.success("Membership updated", true);
    }

    // update account status (pending/active)
    const updateAccountStatus = async (id, status) => {
      alertService.clear();
      await userService.update(id, { accountStatus: status });

      if(status === 'active'){
        await userService.getById(id)
          .then((user) => {
            emailService.sendAccountActive(user);
          })
          .catch(alertService.error);
      }

      alertService.success("Account Status updated");
    }

    // update account status (pending/active)
    const updateSubscriptionStatus = async (id, status) => {
      alertService.clear();
      if(status === 'inactive'){
        await userService.update(id, { subscriptionStatus: status, subscriptionDate: null, subscriptionFrequency: null });
        
        setData(data => data.map(item => {
          if(item.id === id){
            return { ...item, subscriptionStatus: status, subscriptionDate: null, subscriptionFrequency: null };
          } else {
            return { ...item };
          }
        }));
        setSortedData(sortedData => sortedData.map(item => {
          if(item.id === id){
            return { ...item, subscriptionStatus: status, subscriptionDate: null, subscriptionFrequency: null };
          } else {
            return { ...item };
          }
        }));
      }
      alertService.success("Subscription Status updated");
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
          <Button onClick={exportData} color="var(--mantine-color-light-green-6)" className='ms-2 mb-2'>
              Export
          </Button>

          <ScrollArea type='always'>
            <TextInput
                placeholder="Search by any field"
                mb="md"
                leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                value={search}
                onChange={handleSearchChange}
            />
            <Table horizontalSpacing="lg" verticalSpacing="xs" miw={1800}>
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
                        sorted={sortBy === 'accountStatus'}
                        reversed={reverseSortDirection}
                        onSort={() => setSorting('accountStatus')}
                        >
                          Account Status
                        </Th>
                        <Th
                        sorted={sortBy === 'subscriptionStatus'}
                        reversed={reverseSortDirection}
                        onSort={() => setSorting('subscriptionStatus')}
                        >
                          Subscription Status
                        </Th>
                        <Th
                        sorted={sortBy === 'subscriptionDate'}
                        reversed={reverseSortDirection}
                        onSort={() => setSorting('subscriptionDate')}
                        >
                          Subscription Date
                        </Th>
                        <Th
                        sorted={sortBy === 'subscriptionRenewal'}
                        reversed={reverseSortDirection}
                        onSort={() => setSorting('subscriptionRenewal')}
                        >
                          Subscription Plan
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
                                { user.membership === 'admin' ?
                                    user.accountStatus.charAt(0).toUpperCase() + user.accountStatus.slice(1)
                                    :
                                    <Select
                                      data={[{ value: 'pending', label: 'Pending'}, { value: 'active', 'label': 'Active' }]}
                                      defaultValue={user.accountStatus}
                                      style={{width: '8em'}}
                                      onChange={(value, option) => updateAccountStatus(user.id, value)}
                                    />
                                }
                              </Table.Td>
                              <Table.Td>
                                { user.membership === 'admin' ?
                                    user.subscriptionStatus === 'active' ? 'Active' : 'Inactive' 
                                    :
                                    <Select
                                      data={[{ value: 'active', label: 'Active'}, { value: 'inactive', 'label': 'Inactive' }]}
                                      defaultValue={user.subscriptionStatus}
                                      style={{width: '8em'}}
                                      onChange={(value, option) => updateSubscriptionStatus(user.id, value)}
                                      disabled={user.subscriptionStatus === 'inactive' ? true : false}
                                    />
                                }
                              </Table.Td>
                              <Table.Td>
                                <Text>
                                  {user.subscriptionDate}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Text>
                                  { user.subscriptionFrequency && (user.subscriptionFrequency === 'month' ? 'Monthly' : 'Yearly') }
                                </Text>
                              </Table.Td>
                              <Table.Td width={150}>
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