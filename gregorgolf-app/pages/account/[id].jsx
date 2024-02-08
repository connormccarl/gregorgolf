import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Center, Loader } from '@mantine/core';

import { Layout } from 'components/account';
import { userService, alertService } from 'services';

export default EmailRegister;

function EmailRegister() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        setLoading(true);
        
        const { id } = router.query;

        if (!id) return;

        // fetch user and set user values to autopopulate
        userService.getById(id)
            .then(x => setUser(x))
            .catch(alertService.error)
        
        setLoading(false);

    }, [router]);

    useEffect(() => {
        reset(user);
    }, [user]);

    // form validation rules
    const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;
    const validationSchema = Yup.object().shape({
        firstName: Yup.string()
            .required('First Name is required'),
        lastName: Yup.string()
            .required('Last Name is required'),
        job: Yup.string()
            .required('Job Title is required'),
        phone: Yup.string()
            .required('Last Name is required')
            .matches(phoneRegExp, 'Phone number is not valid'),
        email: Yup.string()
            .required('Email is required'),
        password: Yup.string()
            .required('Password is required')
            .min(6, 'Password must be at least 6 characters'),
        confirmPassword: Yup.string()
            .required('Confirm Password is required')
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
    });
    const formOptions = { resolver: yupResolver(validationSchema) };

    // populate form values if user is found
    if(user) {
        formOptions.defaultValues = user;
    }

    // get functions to build form with useForm() hook
    const { register, handleSubmit, reset, formState } = useForm(formOptions);
    const { errors } = formState;

    function onSubmit(user) {
        alertService.clear();

        // format phone number
        const cleaned = ('' + user.phone).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            user.phone = match[1] + '-' + match[2] + '-' + match[3];
        }

        return userService.update(user.id, user)
            .then(() => {
                alertService.success('Registration successful', true);
                router.push('login');
            })
            .catch(alertService.error);
    }

    if(loading) return (
        <Center className='mt-5'>
            <Loader size={50} color="blue" />
        </Center>
    );

    if(!user) return (
        <Layout>
            <div>
                <p>You need to be preapproved with an account setup prior to registration.</p>
                <p>Please reach out to Connor McCarl for assistance: invest@connormccarl.com.</p>
            </div> 
        </Layout>
    );

    return (
        <Layout>
            <div className="card">
                <h4 className="card-header">Register</h4>
                <div className="card-body">
                    <h3>Confirm Your Profile Information</h3>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-3">
                            <label className="form-label">First Name</label>
                            <input name="firstName" type="text" {...register('firstName')} className={`form-control ${errors.firstName ? 'is-invalid' : ''}`} />
                            <div className="invalid-feedback">{errors.firstName?.message}</div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Last Name</label>
                            <input name="lastName" type="text" {...register('lastName')} className={`form-control ${errors.lastName ? 'is-invalid' : ''}`} />
                            <div className="invalid-feedback">{errors.lastName?.message}</div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Job Title</label>
                            <input name="job" type="text" {...register('job')} className={`form-control ${errors.job ? 'is-invalid' : ''}`} />
                            <div className="invalid-feedback">{errors.job?.message}</div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Phone</label>
                            <input name="phone" type="text" {...register('phone')} className={`form-control ${errors.phone ? 'is-invalid' : ''}`} />
                            <div className="invalid-feedback">{errors.phone?.message}</div>
                        </div>
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
                        <div className="mb-3">
                            <label className="form-label">Confirm Password</label>
                            <input name="confirmPassword" type="password" {...register('confirmPassword')} className={`form-control ${errors.password ? 'is-invalid' : ''}`} />
                            <div className="invalid-feedback">{errors.confirmPassword?.message}</div>
                        </div>
                        <button disabled={formState.isSubmitting} className="btn btn-primary">
                            {formState.isSubmitting && <span className="spinner-border spinner-border-sm me-1"></span>}
                            Register
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}