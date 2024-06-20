import { db } from 'helpers/api';

const App = db.App;

export const appRepo = {
    createProfile,
    getNumIn60,
    update,
};

async function createProfile() {
    const defaultProfile = {
        profile: 'active',
        numIn60: 3
    }

    const app = new App(defaultProfile);

    await app.save();
}

async function getNumIn60() {
    const profile = await App.findOne({ profile: 'active' });
    return profile.numIn60;
}

async function update(params) {
    const app = await App.findOne({ profile: 'active' });

    //validate
    if (!app) throw 'App settings not found';

    Object.assign(app, params);
    await app.save();
}