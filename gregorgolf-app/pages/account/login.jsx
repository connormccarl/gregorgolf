import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

import Stripe from 'stripe';

import { SimpleGrid, Center, Image, Container, Title } from '@mantine/core';
import { Layout } from 'components/account';
import { userService, alertService } from 'services';
import { Alert } from '@/components';

import classes from './Login.module.css';

export default Login;

function Login() {
    const router = useRouter();

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);

        // redirected from registration
        if (query.get('registered')) {
            alertService.success("Registered. You can login once your account is approved.", true);
        }
    },[])

    // form validation rules 
    const validationSchema = Yup.object().shape({
        email: Yup.string().required('Email is required'),
        password: Yup.string().required('Password is required')
    });
    const formOptions = { resolver: yupResolver(validationSchema) };

    // get functions to build form with useForm() hook
    const { register, handleSubmit, formState } = useForm(formOptions);
    const { errors } = formState;

    function onSubmit({ email, password }) {
        alertService.clear();
        return userService.login(email, password)
            .then(() => {
                // get return url from query parameters or default to '/'
                const returnUrl = router.query.returnUrl || userService.userValue.accountStatus === 'pending' ? '/subscription' : '/';
                router.push(returnUrl);
            })
            .catch(alertService.error);
    }

    return (
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Center className={classes.login}>
                <Container w="90%">
                    <Title size="h1">Welcome to Gregor Golf</Title>
                    <Title size="h4" c="dimmed">Gregor Private Club of Golf, please login below.</Title>
                    <Alert />
                    <br />
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input name="email" type="text" {...register('email')} className={`form-control ${errors.email ? 'is-invalid' : ''}`} />
                            <div className="invalid-feedback">{errors.email?.message}</div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Password</label>
                            <input name="password" type="password" {...register('password')} className={`form-control ${errors.password ? 'is-invalid' : ''}`} />
                            <div className="invalid-feedback">{errors.password?.message}</div>
                        </div>
                        <button disabled={formState.isSubmitting} className="btn btn-primary">
                            {formState.isSubmitting && <span className="spinner-border spinner-border-sm me-1"></span>}
                            Login
                        </button>
                        <Link href="/account/register" className="btn btn-link">Register</Link>
                        <Link href="/account/password/reset" className="btn btn-link">Forgot Password</Link>
                    </form>
                </Container>
            </Center>
            <Center className={classes.logo}>
                <Image 
                    h={300}
                    src="/full_logo_white.webp"
                    alt="Gregor Private Golf Club"
                />
            </Center>
        </SimpleGrid>
    );
}