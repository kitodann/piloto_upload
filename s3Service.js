// Ver no S3 ARN e: getObject -> pega um arquivo que foi uploaded
// Upload o objeto pro S3 putObject
// Apagar arquivo deleteObject

const { S3 } = require("aws-sdk");
// const uuid = require("uuid").v4;

exports.s3Uploadv2 = async (file) => {
  const s3 = new S3();

  const param = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `medias/Globus/2023/${file.originalname}`,
    Body: file.buffer,
  };
  return await s3.upload(param).promise();
};
