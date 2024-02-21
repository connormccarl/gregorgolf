import React, { useState, useEffect } from 'react'
import { Layout } from '@/components'
import { AddEdit } from '@/components/users'
import { Spinner } from '@/components'

import { userService } from '@/services'

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(userService.userValue);
  }, []);

  return (
    <Layout>
        {user ? <AddEdit user={user} /> : <Spinner />}
    </Layout>
  )
}
