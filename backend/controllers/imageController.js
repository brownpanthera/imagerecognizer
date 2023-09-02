const asyncHandler = require("express-async-handler");
const mobilenet = require("@tensorflow-models/mobilenet");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");
const fs = require("fs");

/*
req - POST
desc - for uploading image
*/
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(404);
    throw new Error("Image not found");
  }

  const filename = req.file.filename;

  // sending imageURL to front-end
  const imageUrl = `http://localhost:5000/api/image/${filename}`;

  const imagePath = path.join(__dirname, "../uploads", filename);

  const canvas = createCanvas(640, 480);
  const ctx = canvas.getContext("2d");
  const image = await loadImage(imagePath);
  ctx.drawImage(image, 0, 0);

  const absolutePath = path.join(__dirname, "../model/model.json");
  console.log(absolutePath);

  const model = await mobilenet.load({
    version: 1,
    alpha: 1.0,
    modelUrl: `file://${absolutePath}`,
  });

  const predictions = await model.classify(canvas);

  res.status(200).json({ imageUrl, predictions });
});

/*
req - GET
desc - fetching filename from from above imageURL and sending file from inside the uploads folder
*/
const sendImage = asyncHandler(async (req, res) => {
  const filename = req.params.filename;
  if (!filename) {
    res.status(404);
    throw new Error("Image not found");
  }
  // creating imagePath
  const imagePath = path.join(__dirname, "../uploads", filename);

  res.sendFile(imagePath);
});

/*
req - DELETE
desc - extracting filename from params and deleting the file from uploads folder
*/
const deleteImage = asyncHandler(async (req, res) => {
  const filename = req.params.filename;
  if (!filename) {
    res.status(404);
    throw new Error("Image not found");
  }
  // creating imagePath
  const imagePath = path.join(__dirname, "../uploads", filename);

  if (fs.existsSync(imagePath)) {
    // Delete the file
    fs.unlinkSync(imagePath);
    res.status(200).json({ message: "Image deleted successfully" });
  } else {
    res.status(404).json({ message: "Image not found" });
  }
});
module.exports = { uploadImage, sendImage, deleteImage };
