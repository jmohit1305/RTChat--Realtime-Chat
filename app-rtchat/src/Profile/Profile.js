import "./Profile.css";
import React, { useState, useEffect } from "react";
import { Avatar, IconButton } from "@material-ui/core";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { makeStyles } from "@material-ui/core/styles";
import { withStyles } from "@material-ui/core/styles";
import { useStateValue } from "../StateProvider";
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";
import { Create, Done } from "@material-ui/icons";
import SendIcon from "@material-ui/icons/Send";
import axios from "../axios.js";

function Profile() {
  const [{ user }, dispatch] = useStateValue();
  const [editNameBool, setEditNameBool] = useState(false);
  const [newNameText, setNewNameText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [userImage, setUserImage] = useState(null);

  const useStyles = makeStyles((theme) => ({
    root: {
      display: "flex",
      "& > *": {
        margin: theme.spacing(1),
      },
    },

    xlarge: {
      width: theme.spacing(22),
      height: theme.spacing(22),
    },
  }));
  const classes = useStyles();

  const profilePanel = () => {
    dispatch({
      type: "SET_PROFILEVIEW",
      profileView: false,
    });
  };

  const updateName = async () => {
    if (newNameText.length > 0) {
      await axios
        .post("/update/userinfo", {
          email: user.email,
          newName: newNameText,
        })
        .then((response) => {
          console.log(response);
          window.location.reload();
        })
        .catch((e) => {
          alert(e);
        });
    }
    setNewNameText("");
    setEditNameBool(false);
    window.location.reload();
  };

  const handleClick = (event) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEditRequest = async (event) => {
    var bodyFormData = new FormData();
    bodyFormData.append("userEmail", user.email);
    bodyFormData.append("profileImage", userImage);
    if (userImage)
      await axios({
        method: "post",
        url: "/update/profileimage",
        headers: {
          "content-type": "multipart/form-data",
        },
        data: bodyFormData,
      })
        .then((response) => {
          //handle success
          setUserImage(null);
          handleClose();
        })
        .catch((response) => {
          //handle error
          setUserImage(null);

          alert(response);
        });
  };

  useEffect(() => {
    if (userImage) {
      handleEditRequest();
    }
  }, [userImage]);

  return (
    <div className="profilePanel">
      <div className="profile__header">
        <div className="profile__back__button">
          <IconButton onClick={profilePanel}>
            <KeyboardBackspaceIcon />
          </IconButton>
        </div>

        <div className="profile__avatar">
          <Avatar
            alt={user.name}
            className={`${classes.xlarge} profile__imageEdit`}
            src={
              user
                ? user.imageURL
                : "https://avatars.dicebear.com/api/human/abjsabjkdas.svg"
            }
            onContextMenu={handleClick}
          />

          <Menu
            id="customized-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem>
              <div className="file">
                <label for="input-file">
                  <ListItemIcon>
                    <SendIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Edit Profile Image" />
                </label>
                <input
                  id="input-file"
                  type="file"
                  onChange={(e) => {
                    console.log(e.target.files[0]);
                    setUserImage(e.target.files[0]);
                  }}
                />
              </div>
            </MenuItem>
          </Menu>
        </div>
      </div>
      <div className="profile__info">
        <div className="profile__details">
          <div>
            <h4 className="profile__info__heading">Name:</h4>
            <h3 className="profile__info__detail">
              <div style={{ marginLeft: "0", textAlign: "left" }}>
                {editNameBool ? (
                  <input
                    value={newNameText}
                    type="text"
                    placeholder="Update Name"
                    style={{
                      border: "none",
                      width: "100%",
                      outline: "none",
                    }}
                    onChange={(e) => {
                      setNewNameText(e.target.value);
                    }}
                  />
                ) : (
                  user.name
                )}
              </div>
              <div
                className="profile__name__edit"
                style={{ width: "fit-content" }}
              >
                {editNameBool ? (
                  <IconButton onClick={updateName}>
                    <Done />
                  </IconButton>
                ) : (
                  <IconButton onClick={() => setEditNameBool(true)}>
                    <Create />
                  </IconButton>
                )}
              </div>
            </h3>
          </div>
          <hr />
          <div>
            <h4 className="profile__info__heading">Reg. Email:</h4>
            <h3>
              <div>{user.email}</div>
            </h3>
          </div>
          <hr />
          <div>
            <h4 className="profile__info__heading">Total Contacts:</h4>
            <h3>
              <div>{user.contactList.length}</div>
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
