const {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const express = require("express");
//load config
require("dotenv").config();

//connect you to s3
const s3Client = new S3Client({
  region: "us-east-1",
  endpoint: process.env.AwS_ENDPOINT,
  forcePathStyle: true,
});
const bucket = process.env.AWS_BUCKET;

async function listBuckets() {
  try {
    const response = await s3Client.send(new ListBucketsCommand());
    console.log("buckets:", response.Buckets);
    //next list your objects in buccket
  } catch (error) {
    console.error(error);
  }
}

listBuckets();
//create express app
const app = express();

//list files in s3 bucket
app.get("/images", async (req, res) => {
  const listObjectsParams = {
    Bucket: bucket,
  };
  listObjectsCmd = new ListObjectsV2Command(listObjectsParams);
  const response = await s3Client.send(listObjectsCmd);
  res.send(response);
});

//create images
app.post("/images", upload.single("image"), async (req, res) => {
  const file = req.file;
  const fileName = req.file.originalname;
  console.log(file, fileName);
  const uploadParams = {
    Bucket: bucket,
    Key: fileName,
    Body: req.file.buffer,
    ContentType: req.file.mimetype, // Preserve file type
  };
  const response = await s3Client.send(new PutObjectCommand(uploadParams));
  res.send(response);
});

app.listen(3000, () => {
  console.log("app listening on port 3000");
});
