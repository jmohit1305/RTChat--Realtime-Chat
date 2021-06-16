const express = require("express");
const router = express.Router();
const multer = require("multer");
const Users = require("../models/users.js");
const Rooms = require("../models/rooms.js");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const email = JSON.parse(JSON.stringify(req.body)).userEmail;

    const fileNameinUploads =
      email +
      "__" +
      file.fieldname +
      file.originalname.substring(
        file.originalname.lastIndexOf("."),
        file.originalname.length
      );

    cb(null, fileNameinUploads);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/svg+xml" ||
    file.mimetype == "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(
      {
        name: "FileTypeError",
        message: "Only .png, .jpg, .jpeg and .svg+xml format allowed!",
        code: "LIMIT_MIME_TYPE",
        field: "profileImage",
      },
      false
    );
  }
};
const maxSize = 1024 * 1024 * 2;
const upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: fileFilter,
}).single("profileImage");

router.post("/profileimage", (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      res.send(err);
    } else if (err) {
      // An unknown error occurred when uploading.
      res.send(err);
    }

    // Everything went fine.

    const { userEmail } = req.body;

    Users.updateOne(
      {
        email: userEmail,
      },
      {
        $set: {
          imageURL: "http://localhost:9000/profileupload/" + req.file.filename,
        },
      },
      (err, updated) => {
        if (err) res.send(err);
        res.send(updated);
      }
    );
  });
});

router.post("/userinfo", (req, res) => {
  // console.log(req.body);
  Users.findOne({ email: req.body.email }, (err, found) => {
    if (err) res.send(err);
    if (found) {
      Users.updateOne(
        { email: req.body.email },
        {
          $set: {
            name: req.body.newName,
          },
        },
        (err) => {
          if (err) res.send(err);
          res.send({ success: true, message: "updated" });
        }
      );
    }
    if (!found) res.send("not found");
  });
});

router.post("/contactlist", (req, res) => {
  const { loggedInUser, recipientEmail, newName } = req.body;

  if (loggedInUser && recipientEmail && newName) {
    Users.findOne({ email: loggedInUser }, async (err, found) => {
      if (err) res.send(err);
      if (found) {
        var contactToUpdate = await found.contactList.find((e) => {
          if (e.email === recipientEmail) {
            return e;
          }
        });
        var newContactList = found.contactList.filter(
          (e) => e.email !== recipientEmail
        );

        contactToUpdate.name = newName;
        newContactList.push(contactToUpdate);

        Users.updateOne(
          { email: loggedInUser },
          {
            $set: {
              contactList: newContactList,
            },
          },
          (err, updated) => {
            if (err) res.send(err);
            if (updated) res.send(updated);
          }
        );
      }
      if (!found) res.send("not found");
    });
  } else {
    res.send("invalid fields");
  }
});

module.exports = router;
