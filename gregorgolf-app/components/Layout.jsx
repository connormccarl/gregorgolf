import { useState, useEffect } from 'react';
import { AppShell, Group, Stack, Burger, Text, ScrollArea } from '@mantine/core';
import {
  IconCalendarEvent,
  IconUserCog,
  IconGolf,
  IconListDetails,
  IconUsers,
  IconLogout,
} from '@tabler/icons-react';
import { Logo } from './Logo';
import { useDisclosure } from '@mantine/hooks';
import { useRouter } from 'next/router';
import { userService } from 'services';
import { Alert } from './Alert'
import { NavLink } from '.';

import classes from './Layout.module.css';

const data = [
  { link: '#', label: 'Dashboard', role: 'user' },
  { link: '/', label: 'Booking Calendar', icon: IconGolf, role: 'user' },
  { link: '/bookings', label: 'My Bookings', icon: IconCalendarEvent, role: 'user' },
  { link: '#', label: 'Admin', role: 'admin'},
  { link: '/admin/bookings', label: 'Manage Bookings', icon: IconListDetails, role: 'admin' },
  { link: '/admin/members', label: 'Manage Members', icon: IconUsers, role: 'admin' },
];

export function Layout({children}) {
  const router = useRouter()
  const [active, setActive] = useState(router.pathname);
  const [opened, { toggle, close }] = useDisclosure();

  const links = data.map((item) => item.link === '#' ? 
    (
      <h5 className={classes.title} key={item.label}>{item.label}</h5>
    )
    :
    (
      <NavLink
        className={classes.link}
        data-active={item.link === active || undefined}
        href={item.link}
        key={item.label}
        onClick={() => {
          setActive(item.link);
        }}
      >
        <item.icon className={classes.linkIcon} stroke={1.5} />
        <span>{item.label}</span>
      </NavLink>
    ));

  return (
    <AppShell
      header={{ height: 80 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
      classNames={{
        navbar: classes.navbar,
        header: classes.header
      }}
    >
      <AppShell.Header>
        <Group justify='space-between'>
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="sm"
            size="sm"
            color='white'
            className='ms-2'
          />
          <Logo className={classes.logo} />
          <Text span c='white' className='me-3'>
            Call <Text span fs='italic' c='var(--mantine-color-light-green-5)'>(248) 690-7370</Text>
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow component={ScrollArea}>
          {links}
        </AppShell.Section>
        <AppShell.Section>
          <Stack className={classes.footer} gap="0">
            <NavLink 
              className={classes.link}
              data-active={"/account/profile" === active || undefined}
              href="/account/profile"
            >
              <IconUserCog className={classes.linkIcon} stroke={1.5} onClick={(event) => {
                setActive("/account/profile");
              }} />
              <span>Edit Profile</span>
            </NavLink>

            <NavLink href="#" className={classes.link} onClick={userService.logout}>
              <IconLogout className={classes.linkIcon} stroke={1.5} />
              <span>Logout</span>
            </NavLink>
          </Stack>
        </AppShell.Section>

      </AppShell.Navbar>

      <AppShell.Main>
        <Alert />
        {children}
      </AppShell.Main>
    </AppShell>
  );
}