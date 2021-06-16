require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const cors = require("cors");
const mongoose = require("mongoose");
const moment = require("moment");

app.use(express.json());
app.use(cors());

// const socketsActive = [
//   {
//     userEmail: "jxmy13@gmail.com",
//     userSocketId: "String",
//   },
// ];

const userSockets = require("./models/userSockets.js");

const connection_url = process.env.MONGO_URI;
mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("DB Connected");
});

io.on("connection", (socket) => {
  console.log(socket.id, "connected");

  socket.on("user-joined", (connectedUserInfo) => {
    userSockets.findOne(
      { userEmail: connectedUserInfo.email },
      (err, found) => {
        if (err) console.log(err);
        if (found) {
          userSockets.updateOne(
            { userEmail: connectedUserInfo.email },
            {
              $set: {
                userSocketId: socket.id,
              },
            },
            (err, updated) => {
              if (err) console.log(err);
            }
          );
        } else {
          userSockets
            .create({
              userEmail: connectedUserInfo.email,
              userSocketId: socket.id,
            })
            .catch((err) => {
              console.log(err);
            });
        }
      }
    );
  });

  socket.emit("connect-created", socket.id);

  socket.on("send-message", (messageData) => {
    userSockets.findOne(
      {
        userEmail: messageData.messageInfo.sentTo,
      },
      (err, found) => {
        if (err) console.log(err);
        if (found) {
          io.to(found.userSocketId).emit("receive-message", {
            sentTo: messageData.messageInfo.sentTo,
            sentBy: messageData.messageInfo.sentBy,
            message: messageData.messageInfo.message,
            roomId: messageData.messageInfo.roomId,
            timeStamp: moment().format("hh:mm a"),
          });
        }
      }
    );
  });

  socket.on("check-online-status", (userOnlineStatus) => {
    // console.log(userOnlineStatus);
    userSockets.findOne({ userEmail: userOnlineStatus.email }, (err, found) => {
      if (err) console.log(err);
      if (found) {
        socket.emit("confirm-online-status", { userStatus: "online" });
      }
      if (!found)
        socket.emit("confirm-online-status", { userStatus: "offline" });
    });
  });

  socket.on("disconnect", () => {
    console.log(socket.id, "disconnected");
    userSockets.deleteOne(
      {
        userSocketId: socket.id,
      },
      (err) => {
        if (err) console.log(err);
      }
    );
  });
});

app.use("/profileupload", express.static(__dirname + "/uploads"));

app.use("/viewattachments", express.static(__dirname + "/user_attachments"));

app.use("/users", require("./routes/users.js"));

app.use("/rooms", require("./routes/rooms.js"));

app.use("/update", require("./routes/updateProfile.js"));

app.use("/attachment", require("./routes/attachments.js"));

const port = process.env.PORT || 9000;
server.listen(port, () => {
  console.log(`Server Started at port ${port}`);
});
