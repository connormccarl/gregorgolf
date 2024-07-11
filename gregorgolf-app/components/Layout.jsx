import { useState, useEffect } from 'react';
import { AppShell, Group, Stack, Burger, Text, ScrollArea } from '@mantine/core';
import {
  IconCalendarEvent,
  IconUserCog,
  IconGolf,
  IconListDetails,
  IconUsers,
  IconLogout,
  IconCreditCardPay,
  IconMessages
} from '@tabler/icons-react';
import { Logo } from './Logo';
import { useDisclosure } from '@mantine/hooks';
import { useRouter } from 'next/router';
import { userService } from 'services';
import { Alert } from './Alert'
import { NavLink } from '.';

import classes from './Layout.module.css';

const data = [
  { link: '#', label: 'Account', role: 'pending' },
  { link: '/subscription', label: 'Activate Subscription', icon: IconCreditCardPay, role: 'pending' },
  { link: '#', label: 'Dashboard', role: 'user' },
  { link: '/', label: 'Booking Calendar', icon: IconGolf, role: 'user' },
  { link: '/bookings', label: 'My Bookings', icon: IconCalendarEvent, role: 'user' },
  { link: 'https://links.geneva.com/invite/34716fa4-0b17-4bf8-9b96-309b20600f2f', type: 'external', label: 'Discussion Forum', icon: IconMessages, role: 'user' },
  { link: '#', label: 'Admin', role: 'admin'},
  { link: '/admin/bookings', label: 'Manage Bookings', icon: IconListDetails, role: 'admin' },
  { link: '/users', label: 'Manage Members', icon: IconUsers, role: 'admin' },
];

export function Layout({children}) {
  const router = useRouter()
  const [user, setUser] = useState(userService.userValue);
  const [active, setActive] = useState(router.pathname);
  const [opened, { toggle, close }] = useDisclosure();

  useEffect(() => {
    setUser(userService.userValue);
  }, []);

  // only display the correct links based on role
  const links = data.filter((link) => (user.accountStatus === 'active' && user.subscriptionStatus === 'inactive') ? link.role === 'pending' : (user.membership === 'admin' ? (link.role === 'admin' || link.role === 'user') : (user.membership === link.role))).map((item) => item.link === '#' ? 
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
        target={item.type === 'external' ? '_blank' : '_self'}
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
        collapsed: { mobile: !opened, desktop: opened },
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
            size="sm"
            color='white'
            className='ms-2'
          />
          <Logo className={classes.logo} />
          <Text span c='white' className={`${classes.phone} me-3`}>
            Call <a href="tel:+1(248)690-7370"><Text span fs='italic' c='var(--mantine-color-light-green-5)'>(248) 690-7370</Text></a>
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