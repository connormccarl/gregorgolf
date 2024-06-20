import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from 'helpers/api';
import Stripe from 'stripe';

const User = db.User;

const secret = process.env.NEXT_PUBLIC_SECRET;

export const usersRepo = {
    authenticate,
    getAll,
    getById,
    getByEmail,
    create,
    update,
    updatePassword,
    updatePhoto,
    activateSubscription,
    delete: _delete
};

async function authenticate({ email, password }) {
    const user = await User.findOne({ email });

    if (!user) {
        throw 'No account with that email. Please check or create one.';
    }    
    else if (!bcrypt.compareSync(password, user.hash)) {
        throw 'Password is incorrect';
    } else if (user.accountStatus === 'pending') {
        throw 'Account not approved yet. Please wait.'
    }

    // create a jwt token that is valid for 7 days
    const token = jwt.sign({ sub: user.id }, secret, { expiresIn: '7d' });

    return {
        ...user.toJSON(),
        token
    };
}

async function getAll() {
    return await User.find();
}

async function getById(id) {
    return await User.findById(id);
}

async function getByEmail(email) {
    const user = await User.findOne({ email: email });
    
    if (!user) throw 'Email not found';
    
    return user;
}

async function create(params) {
    // validate
    if (await User.findOne({ email: params.email })) {
        throw 'Email "' + params.email + '" is already taken';
    }

    // create admin accounts
    if(params.email === 'connormccarl@gmail.com' || params.email === 'jay@gpcgolf.com'){
        // create shell Stripe customer for admins
        try {
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
            const customer = await stripe.customers.create({
                name: params.firstName + ' ' + params.lastName,
                email: params.email,
                address: {
                    city: 'Lake Orion',
                    country: 'US',
                    line1: '169 W. Clarkston Rd.',
                    postal_code: '48362',
                    state: 'MI',
                }
              });
            
            params.customerId = customer.id;
        } catch(err) {
            throw 'Error. Unable to create Stripe customer for admin.';
        }

        params.membership = 'admin';
        params.accountStatus = 'active';
        params.subscriptionStatus = 'active';
    } else {
        params.membership = 'user';
        params.accountStatus = 'pending';
        params.subscriptionStatus = "inactive";
    }

    const user = new User(params);

    // hash password
    if (params.password) {
        user.hash = bcrypt.hashSync(params.password, 10);
    }

    // save user
    await user.save();
}

async function update(id, params) {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';
    if (user.email !== params.email && await User.findOne({ email: params.email })) {
        throw 'Email "' + params.email + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.hash = bcrypt.hashSync(params.password, 10);
    }

    // cancel subscription in Stripe if subscriptionStatus set to inactive or user made admin
    if((params.subscriptionStatus && params.subscriptionStatus === 'inactive' && user.subscriptionId) || (params.membership && params.membership === 'admin' && user.subscriptionStatus === 'active' && user.subscriptionId)){
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        await stripe.subscriptions.cancel(user.subscriptionId);
        params.subscriptionId = null;
    }

    // copy params properties to user
    Object.assign(user, params);

    await user.save();
}

async function updatePhoto(id, photoPath) {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';

    // add photo to user
    Object.assign(user, { photo: photoPath });

    await user.save();
}

async function updatePassword(email, params) {
    const user = await User.findOne({ email: email });

    // validate
    if(!user) throw 'Email not found';

    // hash password
    if (params.password) {
        params.hash = bcrypt.hashSync(params.password, 10);
    }

    // copy params properties to user
    Object.assign(user, params);

    await user.save();
}

async function activateSubscription(userId, customerId, subscriptionId, subscriptionDate, subscriptionFrequency) {
    const user = await User.findById(userId);

    // validate
    if (!user) throw 'User not found';

    let params = {};
    params.accountStatus = 'active';
    params.subscriptionStatus = 'active';
    params.customerId = customerId;
    params.subscriptionId = subscriptionId;
    params.subscriptionDate = subscriptionDate;
    params.subscriptionFrequency = subscriptionFrequency;

    // copy params properties to user
    Object.assign(user, params);

    await user.save();
}

async function _delete(id) {
    await User.findByIdAndDelete(id);
}