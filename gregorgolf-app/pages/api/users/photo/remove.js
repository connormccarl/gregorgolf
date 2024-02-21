import { apiHandler, usersRepo } from 'helpers/api';

import formidable from 'formidable';
import path from 'path';
import fs from "fs/promises";

export default apiHandler({
    put: removePhoto
});

async function removePhoto(req, res) {
    // delete file from folder
    const publicPath = req.body.image;
    const fileLoc = publicPath.substring(publicPath.indexOf("/images"));
    const filePath = path.join(process.cwd() + "/public", fileLoc);
    
    try {
        fs.unlink(filePath);
    } catch (error) {
        throw 'Cannot find image';
    }

    // update user
    await usersRepo.updatePhoto(req.body.id, undefined);
    return res.status(200).json({});
}