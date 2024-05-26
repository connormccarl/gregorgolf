import React from 'react';
import { Avatar, Text, Group } from '@mantine/core';
import { IconCreditCardPay, IconCurrencyDollar } from '@tabler/icons-react';
import classes from './Subscription.module.css';

export default function Subscription() {
  return (
    <div>
      <Group wrap="nowrap">
        <IconCreditCardPay stroke={1.5} size="5rem" className={classes.icon} />
        <div>
          <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
            Payment
          </Text>

          <Text fz="lg" fw={500} className={classes.name}>
            Monthly Subscription
          </Text>

          <Group wrap="nowrap" gap={10} mt={3}>
            <IconCurrencyDollar stroke={1.5} size="1rem" className={classes.icon} />
            <Text fz="md" c="dimmed">
                250.00 /month
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
                    2,420.00 /year
                </Text>
            </Group>
        </div>
      </Group>
    </div>
  )
};
