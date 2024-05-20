import getConfig from 'next/config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from 'helpers/api';

const { serverRuntimeConfig } = getConfig();
const User = db.User;

const secret = process.env.NEXT_PUBLIC_SECRET || serverRuntimeConfig.secret;

export const usersRepo = {
    authenticate,
    getAll,
    getById,
    getByEmail,
    create,
    update,
    updatePassword,
    updatePhoto,
    updateSubscription,
    delete: _delete
};

async function authenticate({ email, password }) {
    const user = await User.findOne({ email });

    if (!(user && bcrypt.compareSync(password, user.hash))) {
        throw 'Email or password is incorrect';
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

    if(params.email == 'connormccarl@gmail.com'){
        params.membership = 'admin';
        params.accountStatus = 'active';
        params.subscriptionStatus = 'inactive';
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

async function updateSubscription(id, params) {
    const user = await User.findById(id);

    console.log("user: ", user);
    console.log("session id:", params);

    // validate
    if (!user) throw 'User not found';


    // copy params properties to user
    //Object.assign(user, params);

    //await user.save();
}

async function _delete(id) {
    await User.findByIdAndDelete(id);
}