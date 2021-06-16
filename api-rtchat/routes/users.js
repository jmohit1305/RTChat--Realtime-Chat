const express = require("express");
const router = express.Router();
const Users = require("../models/users.js");

router.get("/find/:userEmail", (req, res) => {
  const userEmail = req.params.userEmail;
  Users.findOne({ email: userEmail }, (err, data) => {
    if (err) res.status(500).send(err);
    if (data) {
      res.status(200).send({
        success: true,
        data: data,
      });
    }
    if (!data) {
      res.status(200).send({ success: false });
    }
  });
});

router.post("/login", (req, res) => {
  const user = req.body;

  Users.findOne(
    {
      loggedInUserId: user.loggedInUserId,
    },
    (err, data) => {
      if (err) {
        res.send(err);
      } else {
        if (!data) {
          Users.create(user, (err, data) => {
            if (err) {
              res.status(500).send(err);
            } else {
              res.status(200);
            }
          });
        } else {
          res.status(200).send({ message: "successfull" });
        }
      }
    }
  );
});

router.post("/addcontact", (req, res) => {
  const { loggedInUser, userToAdd } = req.body;
  // console.log(req.body);
  Users.findOne({ email: userToAdd }, (err, data) => {
    if (err) res.status(500).send(err);
    if (data) {
      Users.updateOne(
        { email: loggedInUser },
        {
          $push: {
            contactList: {
              id: data.loggedInUserId,
              email: data.email,
              name: data.name,
              imageURL: data.imageURL,
            },
          },
        },
        (err, updated) => {
          if (err) res.status(500).send(err);
          if (updated) {
            Users.findOne({ email: loggedInUser }, (err, found) => {
              if (err) res.status(500).send(err);
              if (found) {
                Users.updateOne(
                  { email: userToAdd },
                  {
                    $push: {
                      contactList: {
                        id: found.loggedInUserId,
                        email: found.email,
                        name: found.name,
                        imageURL: found.imageURL,
                      },
                    },
                  },
                  (err, added) => {
                    if (err) res.status(500).send(err);
                    if (added) res.send({ success: true, message: "added" });
                  }
                );
              }
            });
          }
        }
      );
    }
    if (!data) {
      console.log("not found");
      res.send({ success: false, message: "not found" });
    }
  });
});

module.exports = router;
