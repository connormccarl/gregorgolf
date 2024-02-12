import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { userService } from 'services';
import { Alert } from '../Alert'

export { Layout };

function Layout({ children }) {
    const router = useRouter();

    useEffect(() => {
        // redirect to home if already logged in
        if (userService.userValue) {
            router.push('/');
        }
    }, []);

    return (
        <div className="col-md-6 offset-md-3 mt-5">
            <Alert />
            {children}
        </div>
    );
}