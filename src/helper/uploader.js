import aws from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";
import { config } from "dotenv";

config();

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const s3 = new aws.S3();

const myBucket = process.env.AWS_BUCKET_NAME;

const upload = multer({
  storage: multerS3({
    s3,
    bucket: myBucket?.toString() || "",
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,

    key: (req, file, cb) => {
      cb(null, Date.now().toString());
    },
  }),
});

export default upload;
