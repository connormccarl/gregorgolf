import React, { useState, useEffect } from 'react'
import { Checkbox, Button, Group, Center, Stack, Loader, TextInput } from '@mantine/core';

import { Layout } from '@/components';
import Subscription from '@/components/Subscription';

import { subscriptionService, userService, alertService } from '@/services';
import { useRouter } from 'next/router';

export default function index() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [yearly, setYearly]  = useState(false);
    const [code, setCode] = useState(null);

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

        let discount;
        if(code === 'GREGORFRIEND'){
            discount = true;
        } else {
            discount = false;
        }

        // process payment
        subscriptionService
            .billForAccount(yearly, userService.userValue.id, discount)
            .then((x) => {
                window.location.assign(x);
            });
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
                <Checkbox size="sm" label="Yearly Subscription (save 20%)" checked={yearly} onChange={(event) => setYearly(event.currentTarget.checked)} />
            </Group>
        </Stack>
    </Layout>
  )
}
