import "./SidebarChat.css";
import React, { useEffect, useState } from "react";
import { Avatar, IconButton } from "@material-ui/core";
import DeleteSweepIcon from "@material-ui/icons/DeleteSweep";
import axios from "../axios.js";
import { useStateValue } from "../StateProvider";

function SidebarChat({ addNewChat, user__name, user__dp, sidebarChatInfo }) {
  const [{ user, rooms }, dispatch] = useStateValue();
  const [recipient, setRecipient] = useState(null);
  const [recipientDetails, setRecipientDetails] = useState(null);
  const [NewRoom, setNewRoom] = useState([]);

  useEffect(() => {
    if (sidebarChatInfo) {
      return sidebarChatInfo.users.map((e) => {
        if (e !== user.email) {
          setRecipient(e);
        }
      });
    }
  }, [sidebarChatInfo]);

  useEffect(() => {
    user.contactList.map((e) => {
      if (recipient !== null) {
        if (e.email === recipient) {
          setRecipientDetails(e);
        }
      }
    });
  }, [user, recipient]);

  const roomIdDispatch = () => {
    // console.log(sidebarChatInfo);
    dispatch({
      type: "SET_ROOMID",
      roomId: sidebarChatInfo._id,
    });
    dispatch({
      type: "SET_RECPROFILEDETAILS",
      recipientProfileDetails: recipientDetails ? recipientDetails : null,
    });
  };

  return (
    <div className="sidebarChat__main">
      <div className="sidebarChat" onClick={roomIdDispatch}>
        <Avatar
          alt="user__icon"
          src={recipientDetails ? recipientDetails.imageURL : user__dp}
        />
        <div className="sidebarChat__info">
          <h2>{recipientDetails ? recipientDetails.name : user__name}</h2>
          <p>{}</p>
        </div>
      </div>
      <div className="sidebarChat__arrow">
        <IconButton>
          {/* <DeleteSweepIcon /> */}
        </IconButton>
      </div>
    </div>
  );
}

export default SidebarChat;
