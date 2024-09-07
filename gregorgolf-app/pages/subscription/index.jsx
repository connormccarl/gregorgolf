import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router';
import { Checkbox, Button, Group, Center, Stack, Loader, TextInput } from '@mantine/core';

import { Layout } from '@/components';
import Subscription from '@/components/Subscription';

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
            <Subscription />
            <Group className='mt-3'>
                <Button onClick={processPayment} color="var(--mantine-color-light-green-6)">
                    {loading && <span className="spinner-border spinner-border-sm me-1"></span>}
                    Pay
                </Button>
                <TextInput placeholder="Discount Code" style={{ width: 150 }} value={code} onChange={(event) => setCode(event.currentTarget.value)} />
                <Checkbox size="sm" label="Yearly Subscription (save $200)" checked={yearly} onChange={(event) => setYearly(event.currentTarget.checked)} />
                <Checkbox size="sm" label="No Commitment ($325 /month)" checked={noCommitment} onChange={(event) => setNoCommitment(event.currentTarget.checked)} />
            </Group>
        </Stack>
    </Layout>
  )
}
