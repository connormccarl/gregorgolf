import React, { useState, useEffect } from 'react'
import { Group, Burger, Button, Box, Drawer, ScrollArea, Divider, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useRouter } from 'next/router';
import { NavLink } from '.';
import { userService } from 'services';

import classes from '@/styles/Header.module.css';


const authenticatedLinks = [
    { link: '/events', label: 'Events' },
    { link: '/members', label: 'Members' },
    { link: '/users', label: 'Admin' },
  ];

export default function Header() {
    const router = useRouter()
    const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const subscription = userService.user.subscribe(x => setUser(x));
        return () => subscription.unsubscribe();
    }, []);

  return (
    <Box>
        <header className={classes.header}>
            <Group justify="space-between" h="100%">
                <div>Logo</div>

                <Group h="100%" gap={0} visibleFrom="sm">
                    <NavLink href="/" className={classes.link} data-active={router.pathname === '/' || undefined}>Home</NavLink>
                    {user && authenticatedLinks.map((link) => (
                        <NavLink key={link.label} href={link.link} className={classes.link} data-active={router.pathname === link.link || undefined}>{link.label}</NavLink>
                    ))}
                    <NavLink href="/contact" className={classes.link} data-active={router.pathname === '/contact' || undefined}>Contact</NavLink>
                </Group>

                <Group visibleFrom="sm">
                    {!user ?
                        <NavLink href='/account/login'>
                            <Button variant="default">Log in</Button>
                        </NavLink>
                    :
                        <Button onClick={userService.logout}>Log out</Button>
                    }
                </Group>

                <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" />
            </Group>
        </header>
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
                <Divider my="sm" />

                <NavLink href="/" className={classes.link} data-active={router.pathname === '/' || undefined} onClick={closeDrawer}>Home</NavLink>
                {user && authenticatedLinks.map((link) => (
                    <NavLink key={link.label} href={link.link} className={classes.link} data-active={router.pathname === link.link || undefined} onClick={closeDrawer}>{link.label}</NavLink>
                ))}
                <NavLink href="/contact" className={classes.link} data-active={router.pathname === '/contact' || undefined} onClick={closeDrawer}>Contact</NavLink>

                <Divider my="sm" />

                <Group justify="center" grow pb="xl" px="md">
                    {!user ?
                        <NavLink href='/account/login' onClick={closeDrawer}>
                            <Button variant="default">Log in</Button>
                        </NavLink>
                    :
                        <Button onClick={() => {
                            userService.logout()
                            closeDrawer()
                        }}>Log out</Button>
                    }
                </Group>
            </ScrollArea>
        </Drawer>
    </Box>
  )
}
