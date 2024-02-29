import getConfig from 'next/config';
import mongoose from 'mongoose';

const { serverRuntimeConfig } = getConfig();
const Schema = mongoose.Schema;

try {
    mongoose.connect(process.env.MONGODB_URI || serverRuntimeConfig.connectionString);
    mongoose.Promise = global.Promise;
} catch (error){
    throw 'Can not connect to database';
}

export const db = {
    User: userModel()
};

// mongoose models with schema definitions

function userModel() {
    const schema = new Schema({
        email: { type: String, unique: true, required: true },
        hash: { type: String },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        job: { type: String },
        phone: { type: String },
        photo: { type: String },
        membership: { type: String }
    }, {
        // add createdAt and updatedAt timestamps
        timestamps: true
    });

    schema.set('toJSON', {
        virtuals: true,
        versionKey: false,
        transform: function (doc, ret) {
            delete ret._id;
            delete ret.hash;
        }
    });
    
    return mongoose.models.User || mongoose.model('User', schema);
}