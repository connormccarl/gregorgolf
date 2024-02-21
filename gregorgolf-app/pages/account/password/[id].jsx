import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Center, Loader } from '@mantine/core';

import { Layout } from 'components/account';
import { userService, alertService } from 'services';

export default PasswordReset;

function PasswordReset() {
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
    const validationSchema = Yup.object().shape({
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

    async function onSubmit(user) {
        alertService.clear();

        return userService.update(user.id, user)
           .then(() => {
               alertService.success('Password Updated Successfully', true);
               router.push('/account/login');
           })
           .catch(alertService.error)
    }

    if(loading) return (
        <Center className='mt-5'>
            <Loader size={50} color="blue" />
        </Center>
    );

    return (
        <Layout>
            <div className="card">
                <h4 className="card-header">Reset Your Password</h4>
                <div className="card-body">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-3">
                            <label className="form-label">First Name</label>
                            <input readOnly name="text" type="text" {...register('firstName')} className={`form-control form-control-plaintext ${errors.firstName ? 'is-invalid' : ''}`} />
                            <div className="invalid-feedback">{errors.firstName?.message}</div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Last Name</label>
                            <input readOnly name="text" type="text" {...register('lastName')} className={`form-control form-control-plaintext ${errors.lastName ? 'is-invalid' : ''}`} />
                            <div className="invalid-feedback">{errors.lastName?.message}</div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input readOnly name="email" type="text" {...register('email')} className={`form-control form-control-plaintext ${errors.email ? 'is-invalid' : ''}`} />
                            <div className="invalid-feedback">{errors.email?.message}</div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">New Password</label>
                            <input name="password" type="password" {...register('password')} className={`form-control ${errors.password ? 'is-invalid' : ''}`} />
                            <div className="invalid-feedback">{errors.password?.message}</div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Confirm New Password</label>
                            <input name="password" type="password" {...register('confirmPassword')} className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`} />
                            <div className="invalid-feedback">{errors.confirmPassword?.message}</div>
                        </div>
                        <button disabled={formState.isSubmitting} className="btn btn-primary">
                            {formState.isSubmitting && <span className="spinner-border spinner-border-sm me-1"></span>}
                            Reset Password
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}