import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import { userService } from 'services';

// css files
import '@mantine/core/styles.css'
import { createTheme, MantineProvider } from '@mantine/core'

import 'styles/globals.css';

import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;

const theme = createTheme({
  primaryColor: 'dark-green',
  colors: {
    'dark-green': ["#f4f6f4","#e8e9e8","#cdd2cf","#afbab2","#96a49b","#86988b","#7c9283","#697e70","#5c7062","#1F2822"],
    'light-green': ["#effce9","#e1f4d9","#c4e5b4","#a4d78c","#8acb6b","#79c355","#6fbf49","#5da83a","#509530","#428124"]
  }
})

export default App;

function App({ Component, pageProps }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // on initial load - run auth check 
    authCheck(router.asPath);

    // on route change start - hide page content by setting authorized to false  
    const hideContent = () => setAuthorized(false);
    router.events.on('routeChangeStart', hideContent);

    // on route change complete - run auth check 
    router.events.on('routeChangeComplete', authCheck)

    // unsubscribe from events in useEffect return function
    return () => {
        router.events.off('routeChangeStart', hideContent);
        router.events.off('routeChangeComplete', authCheck);
    }
  }, []);

  function authCheck(url) {
    // redirect to login page if accessing a private page and not logged in 
    const publicPaths = ['/account/login', '/account/register', '/account/password/reset', '/account/password/[id]'];
    const adminPaths = ['/admin/bookings', '/users'];
    const userPaths = ['/','/bookings'];
    const subscriptionPaths = ['/subscription'];
    const path = url.split('?')[0];

    // block access if not logged in AND not a public path
    if (!userService.userValue && !publicPaths.includes(path)) {
        setAuthorized(false);
        router.push('/account/login');
    } else {
        setAuthorized(true);

        // block access if pending account OR not admin and trying to access admin path
        if(userService.userValue){
          if(userService.userValue.subscriptionStatus === 'inactive' && (userPaths.includes(path) || adminPaths.includes(path))){
            router.push('/subscription');
          } else if(userService.userValue.membership === 'user' && adminPaths.includes(path)){
            router.push('/');
          } else if(userService.userValue.subscriptionStatus === 'active' && subscriptionPaths.includes(path)){
            router.push('/');
          }
        }
        
    }
  }

  return (
    <MantineProvider theme={theme}>
      <Head>
          <title>Gregor Golf</title>
      </Head>
      
      {authorized &&
          <Component {...pageProps} />
      }
    </MantineProvider>
  )
}
