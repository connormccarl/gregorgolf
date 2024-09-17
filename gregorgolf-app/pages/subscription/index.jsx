import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router';
import { Checkbox, Button, Group, Center, Stack, Loader, TextInput, Text } from '@mantine/core';
import { IconCreditCardPay, IconCurrencyDollar } from '@tabler/icons-react';

import { Layout } from '@/components';
import classes from './Subscription.module.css';

import { subscriptionService, userService, alertService } from '@/services';

export default function Index() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [yearly, setYearly]  = useState(false);
    const [noCommitment, setNoCommitment]  = useState(false);
    const [code, setCode] = useState('');

     // Check to see if this is a redirect back from Stripe Checkout
     useEffect(() => {
        setLoading(false);

        const query = new URLSearchParams(window.location.search);

        // success so just display confirmation
        if (query.get('success')) {
            const userId = query.get('user');
            const sessionId = query.get('session_id');

            subscriptionService.activateAccount(userId, sessionId)
                .then(() => {
                    window.location.href = '/?activated=true';
                });
        }

        // failure
        if (query.get('canceled')) {
            alertService.error('Subscription not activated. Please try again and complete the payment.', true);
        }
    }, []);

    const processPayment = () => {
        setLoading(true);

        // process payment
        subscriptionService
            .billForAccount(userService.userValue.id, { code, yearly, noCommitment })
            .then((x) => {
                window.location.assign(x);
            })
            .catch(alertService.error);
    };

  return (
    <Layout>
        <Stack>
            <Group wrap="nowrap" align='flex-start'>
                <IconCreditCardPay stroke={1.5} size="5rem" className={classes.icon} />
                <Stack>
                    <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
                        Payment
                    </Text>
                    <div>
                        <Text fz="lg" fw={500} className={classes.name}>
                        Monthly Subscription (default)
                        </Text>

                        <Group wrap="nowrap" gap={10} mt={3}>
                            <IconCurrencyDollar stroke={1.5} size="1rem" className={classes.icon} />
                            <Text fz="md" c="dimmed">
                                200.00 /month
                            </Text>
                        </Group>
                    </div>
                    <div>
                        <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
                            &nbsp;
                        </Text>

                        <Text fz="lg" fw={500} className={classes.name}>
                            Yearly Subscription
                        </Text>

                        <Group wrap="nowrap" gap={10} mt={3}>
                            <IconCurrencyDollar stroke={1.5} size="1rem" className={classes.icon} />
                            <Text fz="md" c="dimmed">
                                2,200.00 /year
                            </Text>
                        </Group>
                        <Checkbox mt={7} size="sm" label="Yearly Subscription (save $200)" checked={yearly} onChange={(event) => setYearly(event.currentTarget.checked)} />
                    </div>
                    <div>
                        <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
                            &nbsp;
                        </Text>

                        <Text fz="lg" fw={500} className={classes.name}>
                            Month-to-Month
                        </Text>

                        <Group wrap="nowrap" gap={10} mt={3}>
                            <IconCurrencyDollar stroke={1.5} size="1rem" className={classes.icon} />
                            <Text fz="md" c="dimmed">
                                325.00 /month
                            </Text>
                        </Group>
                        <Checkbox mt={7} size="sm" label="No Commitment ($325 /month)" checked={noCommitment} onChange={(event) => setNoCommitment(event.currentTarget.checked)} />
                    </div>
                </Stack>
                <Group className='mt-3'>
                    <Button onClick={processPayment} color="var(--mantine-color-light-green-6)">
                        {loading && <span className="spinner-border spinner-border-sm me-1"></span>}
                        Pay
                    </Button>
                    <TextInput placeholder="Discount Code" style={{ width: 150 }} value={code} onChange={(event) => setCode(event.currentTarget.value)} />        
                </Group>
            </Group>
            
        </Stack>
    </Layout>
  )
}
