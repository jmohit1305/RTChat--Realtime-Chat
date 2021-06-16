const express = require("express");
const router = express.Router();
const multer = require("multer");
const Rooms = require("../models/rooms.js");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "user_attachments");
  },
  filename: (req, file, cb) => {
    const roomid = JSON.parse(JSON.stringify(req.body)).roomId;
    const fileNameinUploads = roomid + file.originalname;
    cb(null, fileNameinUploads);
  },
});

const maxSize = 1024 * 1024 * 60;
const upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).single("attachmentURL");

router.post("/upload", (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      res.send(err);
    } else if (err) {
      // An unknown error occurred when uploading.
      res.send(err);
    }

    // Everything went fine.

    const { roomId } = req.body;

    Rooms.updateOne(
      { _id: roomId },
      {
        $push: {
          attachmentURL: {
            url: "https://api-rtchat.herokuapp.com/viewattachments/" + req.file.filename,
            name: req.file.originalname,
            type: req.file.mimetype.split("/")[0],
            extension: req.file.mimetype.split("/")[1],
            size: req.file.size,
          },
        },
      },
      (err, updated) => {
        if (err) res.status(404).send(err);
        if (updated) {
          res.send(updated);
        }
      }
    );
  });
});

module.exports = router;
