import { apiHandler, usersRepo } from 'helpers/api';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export default apiHandler({
    get: getPresignedUrl,
    delete: _delete,
});

const client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function getPresignedUrl(req, res) {
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: req.query.fileName,
        fileType: req.query.fileType,
    });

    const url = await getSignedUrl(client, command, { expiresIn: 30 });

    return res.status(200).json({
        url: url
    });
}

async function _delete(req, res) {
    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: req.query.fileName
    });

    await client.send(command);

    // update database
    await usersRepo.updatePhoto(req.query.id, undefined);

    return res.status(200).json({});
}