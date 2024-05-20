import React, { useState } from 'react'
import { Checkbox } from '@mantine/core';

import { Layout } from '@/components';
import Subscription from '@/components/Subscription';

export default function index() {
    const [yearly, setYearly]  = useState(false);

  return (
      <Layout>
          <Subscription />
          <Checkbox size="sm" label="Yearly Subscription (save 20%)" checked={yearly} onChange={(event) => setYearly(event.currentTarget.checked)} />
      </Layout>
  )
}
