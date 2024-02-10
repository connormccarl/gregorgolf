import { useState } from 'react';
import { Center, Group, Stack, Burger, Button, Box, Drawer, ScrollArea, Divider, rem } from '@mantine/core';
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

import classes from './Layout.module.css';

const data = [
  { link: '#', label: 'Dashboard', role: 'user' },
  { link: '', label: 'Booking Calendar', icon: IconGolf, role: 'user' },
  { link: '', label: 'My Bookings', icon: IconCalendarEvent, role: 'user' },
  { link: '#', label: 'Admin', role: 'admin'},
  { link: '', label: 'Manage Bookings', icon: IconListDetails, role: 'admin' },
  { link: '', label: 'Manage Members', icon: IconUsers, role: 'admin' },
];

export function Layout() {
  const [active, setActive] = useState('Booking Calendar');
  const router = useRouter()
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
    

  const links = data.map((item) => item.link === '#' ? 
    (
      <h5 className={classes.title}>{item.label}</h5>
    )
    :
    (
      <a
        className={classes.link}
        data-active={item.label === active || undefined}
        href={item.link}
        key={item.label}
        onClick={(event) => {
          event.preventDefault();
          setActive(item.label);
        }}
      >
        <item.icon className={classes.linkIcon} stroke={1.5} />
        <span>{item.label}</span>
      </a>
    ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Center className={classes.header}>
          <Logo style={{width: rem(220)}} />
        </Center>
      </div>
      <ScrollArea visibleFrom='sm'>
        {links}
        <Stack className={classes.footer} visibleFrom='sm' gap="0">
          <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
            <IconUserCog className={classes.linkIcon} stroke={1.5} />
            <span>Edit Profile</span>
          </a>

          <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
            <IconLogout className={classes.linkIcon} stroke={1.5} />
            <span>Logout</span>
          </a>
        </Stack>
      </ScrollArea>

      <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" />
      <Drawer
            opened={drawerOpened}
            onClose={closeDrawer}
            size="100%"
            padding="md"
            title="Navigation"
            hiddenFrom="sm"
            zIndex={1000000}
        >
          <ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
            {links}
            <Stack className={classes.footer} visibleFrom='sm' gap="0">
              <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
                <IconUserCog className={classes.linkIcon} stroke={1.5} />
                <span>Edit Profile</span>
              </a>

              <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
                <IconLogout className={classes.linkIcon} stroke={1.5} />
                <span>Logout</span>
              </a>
            </Stack>
          </ScrollArea>
      </Drawer>
    </nav>
  );
}