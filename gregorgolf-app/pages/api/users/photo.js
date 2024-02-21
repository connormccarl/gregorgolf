import { apiHandler, usersRepo } from 'helpers/api';

import formidable from 'formidable';
import path from 'path';
import fs from "fs/promises";

export default apiHandler({
    post: addPhoto,
    delete: _delete
});

export const config = {
    api: {
        bodyParser: false,
    }
}

const saveFile = async (req) => {
    const options = {};
    options.uploadDir = path.join(process.cwd(), "/public/images");
    options.filename = (name, ext, path, form) => {
        return Date.now().toString() + "_" + path.originalFilename;
    };
    options.maxFileSize = 4000 * 1024 * 1024;
    const form = formidable({ multiples: true });
    return new Promise((resolve, reject) => {
        form.parse(req, async (err, fields, files) => {
            if(err) {
                reject("error");
            }
            resolve({fields, files});
        });
    });
};

async function addPhoto(req, res) {
    try {
        await fs.readdir(path.join(process.cwd() + "/public", "/images"));
    } catch (error) {
        await fs.mkdir(path.join(process.cwd() + "/public", "/images"));
    }

    const {fields, files} = await saveFile(req);

    console.log("fields: ", fields);
    console.log("files: ", files);

    //const filePath = files.upload.filepath;
    //const id = fields.id[0];

    //console.log("file: ", filePath);
    //console.log("id: ", id);
    // update user

    //await usersRepo.updatePhoto(id, filePath);
    //return res.status(200).json({ filePath });
}

async function _delete(req, res) {
    await usersRepo.delete(req.query.id);
    return res.status(200).json({});
}