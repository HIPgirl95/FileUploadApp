const {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");

const fs = require("fs");

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
app.use(express.static("public"));

//list files in s3 bucket
app.get("/images", async (req, res) => {
  const listObjectsParams = {
    Bucket: bucket,
  };
  listObjectsCmd = new ListObjectsV2Command(listObjectsParams);
  const response = await s3Client.send(listObjectsCmd);

  const imageFiles = (response.Contents || [])
    .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file.Key))
    .map((file) => file.Key); // Return an array of filenames

  // Send the array of filenames as JSON
  res.json(imageFiles);
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

// app.get("/images/:imageKey", (req, res) => {
//   const imageKey = req.params.imageKey;

//   const params = {
//     Bucket: bucket, // Name of your local S3 bucket
//     Key: fileName, // The key of the image you want to retrieve
//   };

//   // Retrieve the image from the S3 bucket
//   s3.getObject(params, (err, data) => {
//     if (err) {
//       return res.status(500).send("Error retrieving image from S3");
//     }

//     // Set the appropriate content type for the image
//     res.setHeader("Content-Type", data.ContentType);

//     // Send the image data as the response
//     res.send(data.Body);
//   });
// });

app.listen(3000, () => {
  console.log("app listening on port 3000");
});
