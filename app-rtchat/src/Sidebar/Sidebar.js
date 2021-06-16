import "./Sidebar.css";
import React, { useEffect, useState } from "react";
import SidebarChat from "../SidebarChat/SidebarChat.js";
import { Avatar, IconButton } from "@material-ui/core";
import { SearchOutlined } from "@material-ui/icons";
import { useStateValue } from "../StateProvider.js";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import AddIcon from "@material-ui/icons/Add";
import { GoogleLogout } from "react-google-login";
import axios from "../axios.js";
// import useLocalStorage from "../useLocalStorage";
import { makeStyles } from "@material-ui/core/styles";

function Sidebar({ socket }) {
  const [{ user, rooms }, dispatch] = useStateValue();

  const useStyles = makeStyles((theme) => ({
    root: {
      display: "flex",
      "& > *": {
        margin: theme.spacing(1),
      },
    },

    large: {
      width: theme.spacing(7),
      height: theme.spacing(7),
    },
  }));
  const classes = useStyles();

  const profilePanel = () => {
    dispatch({
      type: "SET_PROFILEVIEW",
      profileView: true,
    });
  };

  // useEffect(() => {
  //   console.log(rooms);
  // }, [rooms]);

  const logout = () => {
    dispatch({
      type: "SET_USER",
      user: null,
    });
    // window.open("https://app-rtchat.herokuapp.com/", "_self");
    window.open("http://localhost:3000", "_self");
  };

  const createChat = async () => {
    const addUser = prompt("Enter user mail id");

    if (!addUser) {
      return 0;
    } else {
      if (addUser !== user.email) {
        await axios
          .post("/users/addcontact", {
            loggedInUser: user.email,
            userToAdd: addUser,
          })
          .then((serverResponse) => {
            if (serverResponse.data.success) {
              axios
                .post("/rooms/new", {
                  users: [user.email, addUser],
                })
                .then((serverResponse) => {
                  // setNewRoom(rooms);
                  // setNewRoom((e) => {
                  //   return [...e, serverResponse.data];
                  // });
                  window.location.reload();
                });
            } else {
              alert("Failed - contact already exists or try again later");
            }
          });
      } else {
        alert("Cannot add yourself");
      }
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <h1 className="sidebar__avatar">
          <Avatar
            alt="user__icon"
            className={classes.large}
            src={
              user
                ? user.imageURL
                : "https://avatars.dicebear.com/api/human/abjsabjkdas.svg"
            }
            onClick={profilePanel}
            style={{ cursor: "pointer" }}
          />
        </h1>
        <IconButton>
          <AddIcon onClick={createChat} />
          {/* <SidebarChat addNewChat /> */}
        </IconButton>

        <GoogleLogout
          clientId="408529617077-ulu5picsg600vopgib4bb9btfkm43boi.apps.googleusercontent.com"
          render={(renderProps) => (
            <IconButton
              onClick={renderProps.onClick}
              disabled={renderProps.disabled}
            >
              <ExitToAppIcon />
            </IconButton>
          )}
          buttonText="Logout"
          onLogoutSuccess={logout}
        ></GoogleLogout>
      </div>

      <div className="sidebar__search">
        <div className="sidebar__searchContainer">
          <input type="text" placeholder="Search" />
          <SearchOutlined />
        </div>
      </div>

      <div className="sidebar__chats">
        {rooms.length > 0
          ? rooms.map((chatInfo, index) => {
              return (
                <SidebarChat
                  key={index}
                  user__dp="https://avatars.dicebear.com/api/human/abjsabjkdas.svg"
                  user__name={chatInfo.roomName}
                  user__message="hi"
                  sidebarChatInfo={chatInfo}
                />
              );
            })
          : null}
      </div>
    </div>
  );
}

export default Sidebar;
