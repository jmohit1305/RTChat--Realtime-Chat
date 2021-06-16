import "./Chat.css";
import React, { useState, useEffect, useRef } from "react";
import { Avatar, IconButton } from "@material-ui/core";
import {
  AttachFile,
  InsertEmoticon,
  MoreVert,
  SearchOutlined,
} from "@material-ui/icons";
import SendIcon from '@material-ui/icons/Send';
import DeleteSweepIcon from "@material-ui/icons/DeleteSweep";
import { useStateValue } from "../StateProvider";
import axios from "../axios.js";
import useLocalStorage from "../useLocalStorage.js";
import EmojiPicker, { SKIN_TONE_NEUTRAL } from "emoji-picker-react";
import moment from "moment";
import { makeStyles } from "@material-ui/core/styles";
import PictureAsPdfOutlinedIcon from "@material-ui/icons/PictureAsPdfOutlined";
import GetAppIcon from "@material-ui/icons/GetApp";

function Chat({ socket }) {
  const [inputMessage, setInputMessage] = useState("");
  const [
    { user, socketConnID, roomId, recipientProfileView },
    dispatch,
  ] = useStateValue();
  const [roomDetails, setRoomDetails] = useState(null);
  const [recipient, setRecipient] = useState(null);
  const [recipientDetails, setRecipientDetails] = useState(null);
  const [chatData, setChatData] = useLocalStorage("chatData", []);
  const [onlineStatus, setOnlineStatus] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const useStyles = makeStyles((theme) => ({
    root: {
      display: "flex",
      "& > *": {
        margin: theme.spacing(1),
      },
    },

    medium: {
      width: theme.spacing(6),
      height: theme.spacing(7),
    },
  }));
  const classes = useStyles();

  const onEmojiClick = (event, emojiObject) => {
    setShowEmoji(false);
    setInputMessage(inputMessage + emojiObject.emoji);
  };

  setInterval(() => {
    if (recipient !== null)
      socket.emit("check-online-status", {
        email: recipient ? recipient : null,
      });
    socket.off().once("confirm-online-status", (response) => {
      setOnlineStatus(response.userStatus);
    });
  }, 7000);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.length > 0) {
      // console.log(inputMessage);
      socket.emit("send-message", {
        socket_id: socketConnID,
        messageInfo: {
          roomId: roomId,
          sentBy: user.email,
          sentTo: recipient !== null ? recipient : null,
          message: inputMessage,
        },
      });

      setChatData((oldChats) => {
        return [
          ...oldChats,
          {
            roomId: roomId,
            sentBy: user.email,
            sentTo: recipient !== null ? recipient : null,
            message: inputMessage,
            timeStamp: moment().format("hh:mm a"),
          },
        ];
      });
    }
    setInputMessage("");
    return () => socket.disconnect();
  };

  const emojiPicker = () => {
    if (showEmoji === true) {
      setShowEmoji(false);
    } else {
      setShowEmoji(true);
    }
  };

  useEffect(() => {
    if (roomId !== null) {
      axios
        .get(`/rooms/roomId/${roomId}`)
        .then((response) => {
          setRoomDetails(response.data);
        })
        .catch((e) => {
          alert(e);
        });
    }
  }, [roomId]);

  useEffect(() => {
    if (roomDetails !== null) {
      return roomDetails.users.map((userEmail) => {
        if (userEmail !== user.email) {
          setRecipient(userEmail);
        }
      });
    }
  }, [roomDetails]);

  useEffect(() => {
    user.contactList.map((e) => {
      if (e.email === recipient) {
        setRecipientDetails(e);
      }
    });
  }, [user, recipient]);

  const AlwaysScrollToBottom = () => {
    const elementRef = useRef();
    useEffect(() => elementRef.current.scrollIntoView());
    return <div ref={elementRef} />;
  };

  const recProfileViewFunc = () => {
    dispatch({
      type: "SET_RECPROFILEVIEW",
      recipientProfileView: !recipientProfileView,
    });
  };

  socket.off().on("receive-message", (message) => {
    setChatData((oldChats) => {
      return [...oldChats, message];
    });
  });

  const handleAttachmentRequest = async () => {
    var bodyFormData = new FormData();
    bodyFormData.append("roomId", roomId);
    bodyFormData.append("attachmentURL", attachmentFile);
    if (attachmentFile)
      await axios({
        method: "post",
        url: "/attachment/upload",
        headers: {
          "content-type": "multipart/form-data",
        },
        data: bodyFormData,
      })
        .then((response) => {
          //handle success
          if (response.status === 200) {
            alert("sent");
            setAttachmentFile(null);
          }
        })
        .catch((err) => {
          //handle error
          setAttachmentFile(null);
          if (err.response.status === 404) {
            alert("try again");
          } else {
            alert(err);
          }
        });
    setAttachmentFile(null);
  };

  useEffect(() => {
    if (attachmentFile) {
      handleAttachmentRequest();
    }
  }, [attachmentFile]);

  if (roomId !== null) {
    return (
      <div className="chat">
        <div className="chat__header">
          <Avatar
            alt="user__icon"
            src={
              recipientDetails
                ? recipientDetails.imageURL
                : "https://avatars.dicebear.com/api/human/abjsabjkdas.svg"
            }
            onClick={recProfileViewFunc}
            style={{ cursor: "pointer" }}
          />
          <div className="chat__headerInfo" onClick={recProfileViewFunc}>
            <h3>{recipientDetails ? recipientDetails.name : ""}</h3>
            <p>{onlineStatus ? onlineStatus : "offline"}</p>
          </div>
          <div className="chat__headerRight">
            <IconButton>
              <SearchOutlined />
            </IconButton>
            <IconButton>
              <div className="file">
                <label for="input-file">
                  <AttachFile />
                </label>
                <input
                  id="input-file"
                  type="file"
                  onChange={(e) => {
                    setAttachmentFile(e.target.files[0]);
                  }}
                />
              </div>
            </IconButton>
            <IconButton>
              <MoreVert />
            </IconButton>
          </div>
        </div>

        <div className="chat__body">
          {chatData.map((chatRender, i) => {
            if (chatRender.roomId === roomId) {
              return (
                <div
                  key={i}
                  className={` chat__message  ${
                    chatRender.sentBy === user.email ? "chat__receiver" : null
                  }`}
                >
                  <div className="chat__text">{chatRender.message}</div>
                  <div className="chat__timestamp">{chatRender.timeStamp}</div>
                  {/* <span className="chat__delete">
                    <span className="chat__sidebox"></span>
                    <DeleteSweepIcon />
                  </span> */}
                </div>
              );
            }
          })}
          {showEmoji ? (
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              skinTone={SKIN_TONE_NEUTRAL}
            />
          ) : null}
          <AlwaysScrollToBottom />
        </div>
        <div className="chat__footer">
          <IconButton onClick={emojiPicker}>
            <InsertEmoticon />
          </IconButton>

          <form>
            <input
              value={inputMessage}
              placeholder="Type a message"
              onChange={(e) => {
                setInputMessage(e.target.value);
              }}
            />
            <button onClick={sendMessage} type="submit" />
          </form>
          <IconButton>
            <SendIcon />
          </IconButton>
        </div>
      </div>
    );
  } else {
    return <div className="chat"></div>;
  }
}

export default Chat;
