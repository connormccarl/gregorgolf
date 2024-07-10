import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Center, Stack, Avatar, Button } from '@mantine/core';

import { userService, alertService, subscriptionService } from 'services';

export { AddEdit };

function AddEdit(props) {
    const user = props?.user;
    const [image, setImage] = useState(props?.user?.photo);

    // form validation rules 
    const validationSchema = Yup.object().shape({
        firstName: Yup.string()
            .required('First Name is required'),
        lastName: Yup.string()
            .required('Last Name is required'),
        email: Yup.string()
            .required('Email is required'),
        password: Yup.string()
            .transform(x => x === '' ? undefined : x)
            // password optional in edit mode
            //.concat(user ? null : Yup.string().required('Password is required'))
            .min(6, 'Password must be at least 6 characters')
    });
    const formOptions = { resolver: yupResolver(validationSchema) };

    // set default form values if in edit mode
    if (user) {
        formOptions.defaultValues = props.user;
    }

    // get functions to build form with useForm() hook
    const { register, handleSubmit, reset, formState } = useForm(formOptions);
    const { errors } = formState;

    async function onSubmit(data) {
        alertService.clear();
        try {
            // create or update user based on user prop
            let message;
            if (user) {
                await userService.update(user.id, data);
                message = 'User updated';
            } else {
                await userService.register(data);
                message = 'User added';
            }

            // redirect to user list with success message
            alertService.success(message);
        } catch (error) {
            alertService.error(error);
        }
    }

    // handle file upload
    const hiddenFileInput = useRef(null);
    const handleUpload = async (event) => {
        if(event.target.files){
            const file = event.target.files[0];

            try{
                if(!file) return;

                const fileName = Date.now().toString() + '-' + file.name.replace(" ", "_");
                const fileType = file.type;

                // get presigned URL from S3
                const { url } = await userService.getPresignedUrl(fileName, fileType);

                // use presigned URL to upload file
                const upload = await fetch(url, {
                    method: 'PUT',
                    body: file,
                    headers: { 'Content-Type': fileType },
                });
                if(upload.ok){
                    // save image url
                    const fileUrl = `https://gregorgolf.s3.us-east-2.amazonaws.com/${fileName}`;
                    await userService.update(user.id, { photo: fileUrl });
                    setImage(fileUrl);
                } else {
                    alertService.error('Upload failed.');
                }
            } catch (error) {
                alertService.error(error);
            }
        }
    }

    const removePhoto = async () => {
        const n = image.lastIndexOf('/');
        const fileName = image.substring(n + 1);

        await userService.removePhoto(user.id, fileName);
        setImage(undefined);
    }

    const changePhoto = async (event) => {
        const n = image.lastIndexOf('/');
        const fileName = image.substring(n + 1);

        await userService.removePhoto(user.id, fileName);
        handleUpload(event);
    }

    const manageSubscription = () => {
        subscriptionService
            .manageSubscription(user.customerId)
            .then((x) => {
                window.location.assign(x);
            });
    }

    return (
        <Center>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className='mb-3'>
                    <Avatar
                        src={image}
                        size={120}
                        radius={120}
                        mx="auto"
                        className='mb-3'
                    />
                    <Center>
                    { image === undefined ? (
                        <div>
                            <input type="file" onChange={handleUpload} ref={hiddenFileInput} style={{ display: 'none' }} />
                            <button type="button" className="btn btn-primary" onClick={() => hiddenFileInput.current.click()} >
                                Add Profile Photo
                            </button>
                        </div>
                    ) : (
                        <div>
                            <button type="button" onClick={removePhoto} className="btn btn-secondary me-2">
                                Remove Photo
                            </button>
                            <input type="file" onChange={changePhoto} ref={hiddenFileInput} style={{ display: 'none' }} />
                            <button type="button" className="btn btn-primary" onClick={() => hiddenFileInput.current.click()} >
                                Change Photo
                            </button>
                        </div>
                    )}
                   </Center>
                </div>
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
                    <label className="form-label">Email</label>
                    <input name="email" type="text" {...register('email')} className={`form-control ${errors.email ? 'is-invalid' : ''}`} />
                    <div className="invalid-feedback">{errors.email?.message}</div>
                </div>
                {props?.admin && (
                <div className="mb-3">
                    <label className="form-label">Membership</label>
                    <select {...register('membership')} className={`form-select ${errors.membership ? 'is-invalid' : ''}`}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                    <div className="invalid-feedback">{errors.membership?.message}</div>
                </div>
                )}
                <div className="mb-3">
                    <label className="form-label">
                        Password
                        {user && <em className="ms-1">(Leave blank to keep the same password)</em>}
                    </label>
                    <input name="password" type="password" {...register('password')} className={`form-control ${errors.password ? 'is-invalid' : ''}`} />
                    <div className="invalid-feedback">{errors.password?.message}</div>
                </div>
                <div className="mb-3">
                    <button type="submit" disabled={formState.isSubmitting} className="btn btn-primary me-2">
                        {formState.isSubmitting && <span className="spinner-border spinner-border-sm me-1"></span>}
                        Save
                    </button>
                    <button onClick={() => reset(formOptions.defaultValues)} type="button" disabled={formState.isSubmitting} className="btn btn-secondary">Reset</button>
                    {props?.admin && <Link href="/users" className="btn btn-link">Cancel</Link>}
                    <Button onClick={manageSubscription} className='ms-2' color="var(--mantine-color-light-green-6)">
                        Manage Subscription
                    </Button>
                </div>
            </form>
        </Center>
    );
}