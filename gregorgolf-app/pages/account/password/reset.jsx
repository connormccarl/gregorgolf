import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

import { Layout } from 'components/account';
import { userService, alertService } from 'services';

export default Reset;

function Reset() {
    const router = useRouter();

    // form validation rules 
    const validationSchema = Yup.object().shape({
        email: Yup.string()
            .required('Email is required'),
    });
    const formOptions = { resolver: yupResolver(validationSchema) };

    // get functions to build form with useForm() hook
    const { register, reset, handleSubmit, formState } = useForm(formOptions);
    const { errors } = formState;

    async function onSubmit(user) {
        alertService.clear();

        return userService.getByEmail(user.email)
           .then((x) => {
               reset();
               userService.sendPasswordReset(x);
               alertService.success('Email sent successfully');
           })
           .catch(alertService.error)
    }

    return (
        <Layout>
            <div className="card">
                <h4 className="card-header">Reset Your Password</h4>
                <div className="card-body">
                    <h3>Enter your email below, and we will send you a reset password link to reset your password.</h3>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input name="email" type="text" {...register('email')} className={`form-control ${errors.email ? 'is-invalid' : ''}`} />
                            <div className="invalid-feedback">{errors.email?.message}</div>
                        </div>
                        <button disabled={formState.isSubmitting} className="btn btn-primary">
                            {formState.isSubmitting && <span className="spinner-border spinner-border-sm me-1"></span>}
                            Reset Password
                        </button>
                        <Link href="/account/login" className="btn btn-link">Cancel</Link>
                    </form>
                </div>
            </div>
        </Layout>
    );
}