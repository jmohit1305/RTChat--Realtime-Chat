const express = require("express");
const router = express.Router();
const Rooms = require("../models/rooms.js");

router.post("/new", (req, res) => {
  const room = req.body;

  Rooms.create(room, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

router.get("/sync", (req, res) => {
  Rooms.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      // console.log(data);
      res.status(200).send(data);
    }
  });
});

router.get("/find/:userId", async (req, res) => {
  const userId = req.params.userId;
  var tempUsersArray = [];

  await Rooms.find({}, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      if (data.length > 0) {
        data.map((validateUser, i) => {
          if (validateUser.users.includes(userId)) {
            tempUsersArray.push(validateUser);
          }
        });
      }

      res.status(200).send(tempUsersArray);
      tempUsersArray.length = 0;
      tempUsersArray = [];
    }
  });
});

router.get("/roomId/:roomId", async (req, res) => {
  const roomId = req.params.roomId;

  if (roomId !== null) {
    await Rooms.findOne({ _id: roomId }, (err, found) => {
      if (err) console.log(err);
      if (found) {
        res.status(200).send(found);
      }
    });
  } else {
    res.status(200).send({
      failure: "not found",
    });
  }
});

module.exports = router;
