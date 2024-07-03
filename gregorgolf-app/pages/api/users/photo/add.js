import { apiHandler, usersRepo } from 'helpers/api';

import formidable from 'formidable';
import path from 'path';
import fs from "fs/promises";

export default apiHandler({
    post: addPhoto
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
        return Date.now().toString() + "_" + path.originalFilename.replace(" ", "_");
    };
    options.maxFileSize = 4000 * 1024 * 1024;
    const form = formidable(options);
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
    
    const id = fields.id[0];
    const filePath = files.image[0].filepath;
    const fileLoc = filePath.substring(filePath.indexOf("\\images"));
    const publicPath = process.env.NEXT_PUBLIC_URI + fileLoc.replaceAll("\\","/");

    //console.log("file: ", publicPath);

    // update user
    await usersRepo.updatePhoto(id, publicPath);
    return res.status(200).json(publicPath);
}