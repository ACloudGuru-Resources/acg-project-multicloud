"use strict";

const AWS = require("aws-sdk");
const axios = require("axios");
const { GoogleAuth } = require("google-auth-library");
const S3 = new AWS.S3();

module.exports.getImageData = function (event, context, callback) {
  event.Records.forEach((record) => {
    const params = {
      Bucket: record.s3.bucket.name,
      Key: decodeURIComponent(record.s3.object.key), //be careful as the key is passed in encoded URI format
    };

    const file_url =
      "https://" +
      record.s3.bucket.name +
      ".s3.amazonaws.com" +
      "/" +
      record.s3.object.key;

    console.log("trying to get object");
    var s3Promise = S3.getObject(params).promise();
    s3Promise
      .then((data) => {
        console.log("got object");
        return data.Body;
      })
      .then((image) => {
        //call the Image Recognition API
        console.log("calling Image API");
        return getImageData(image);
      })
      .then((response) => {
        console.log(response.data);
        // Call NoSQL Database Insert API
        console.log("calling NoSQL Database Insert");
        return storeData(file_url, response.data);
      })
      .then((result) => {
        return callback(null, "All seems clear!  Check the datastore!");
      })
      .catch((err) => {
        return callback(err);
      });
  });
};

async function getImageData(image) {
  var config = {
    method: "post",
    url: process.env.VisionAPI,
    headers: {
      "Content-Type": "application/octet-stream",
      "Ocp-Apim-Subscription-Key": process.env.AzureKey,
    },
    params: {
      visualFeatures: "Tags",
    },
    data: image,
  };

  const data = await axios(config);
  return data;
}

async function storeData(file_url, record) {
  // This bit gets our authorizations ready for our REST call
  const auth = new GoogleAuth({
    scopes: "https://www.googleapis.com/auth/datastore",
  });
  const client = await auth.getClient();
  const projectId = await auth.getProjectId();
  const url = process.env.NoSQLAPI;
  const res = await client.request({ url });

  var config = {
    method: "post",
    url: res.config.url,
    headers: res.config.headers,
    data: {
      fields: {
        imagePath: {
          stringValue: file_url,
        },
        imageMetadata: {
          stringValue: JSON.stringify(record.tags),
        },
      },
    },
  };

  const data = await axios(config);
  return data;
}
