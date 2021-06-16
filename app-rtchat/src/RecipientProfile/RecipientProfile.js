import "./RecipientProfile.css";
import React, { useEffect, useState } from "react";
import { Avatar, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useStateValue } from "../StateProvider";
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";
import axios from "../axios.js";
import PictureAsPdfOutlinedIcon from "@material-ui/icons/PictureAsPdfOutlined";
import GetAppIcon from "@material-ui/icons/GetApp";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { Create, Done } from "@material-ui/icons";
import AttachmentIcon from "@material-ui/icons/Attachment";
import ImageOutlinedIcon from "@material-ui/icons/ImageOutlined";
import FileCopyOutlinedIcon from "@material-ui/icons/FileCopyOutlined";

function RecipientProfile() {
  const [{ user, recipientProfileDetails, roomId }, dispatch] = useStateValue();
  const [editNameBool, setEditNameBool] = useState(false);
  const [newNameText, setNewNameText] = useState("");
  const [viewattachmentBool, setViewAttachmentBool] = useState(false);
  const [viewattachmentFile, setViewAttachmentFile] = useState([]);

  const useStyles = makeStyles((theme) => ({
    root: {
      display: "flex",
      "& > *": {
        margin: theme.spacing(1),
      },
    },

    xlarge: {
      width: theme.spacing(20),
      height: theme.spacing(20),
    },
  }));
  const classes = useStyles();

  const profilePanel = () => {
    dispatch({
      type: "SET_RECPROFILEVIEW",
      recipientProfileView: false,
    });
  };

  const updateName = async () => {
    if (newNameText.length > 0) {
      await axios
        .post("/update/contactlist", {
          loggedInUser: user.email,
          recipientEmail: recipientProfileDetails.email,
          newName: newNameText,
        })
        .then((response) => {
          console.log(response);
        })
        .catch((e) => {
          alert(e);
        });
    }
    setNewNameText("");
    setEditNameBool(false);
    window.location.reload();
  };

  const handleAttachmentRequest = async () => {
    setViewAttachmentBool(true);
    if (roomId)
      await axios
        .get(`/rooms/roomId/${roomId}`)
        .then((response) => {
          if (response.data.attachmentURL.length > 0) {
            setViewAttachmentFile(response.data.attachmentURL);
          }
        })
        .catch((e) => {
          alert(e);
        });
  };

  return (
    <div className="rec__profile">
      <div className="profile__header">
        <div className="profile__back__button">
          <IconButton onClick={profilePanel}>
            <KeyboardBackspaceIcon />
          </IconButton>
        </div>

        <div className="profile__avatar">
          <Avatar
            alt="user__icon"
            className={classes.xlarge}
            src={
              recipientProfileDetails
                ? recipientProfileDetails.imageURL
                : "https://avatars.dicebear.com/api/human/abjsabjkdas.svg"
            }
          />
        </div>
      </div>

      {!viewattachmentBool ? (
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
                    recipientProfileDetails.name
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
                <div>{recipientProfileDetails.email}</div>
              </h3>
            </div>
            <hr />
            <div>
              <h3 className="profile__info__detail">
                <div style={{ marginLeft: "0", textAlign: "left" }}>
                  View attachments
                </div>
                <div
                  className="profile__name__edit"
                  style={{ width: "fit-content" }}
                >
                  <IconButton
                    onClick={() => {
                      handleAttachmentRequest();
                    }}
                  >
                    <AttachmentIcon />
                  </IconButton>
                </div>
              </h3>
            </div>
          </div>
        </div>
      ) : (
        <div className="room__attachment__body">
          <div className="room__attachment__header">
            <IconButton
              onClick={() => {
                setViewAttachmentBool(false);
              }}
            >
              <ArrowBackIosIcon />
            </IconButton>
          </div>
          {viewattachmentFile.length > 0
            ? viewattachmentFile.reverse().map((e, i) => {
                return (
                  <div key={i} className="room__attachment__list">
                    <div className="filetype__icon">
                      {e.extension == "pdf" ? (
                        <PictureAsPdfOutlinedIcon />
                      ) : e.extension == "jpg" ||
                        e.extension == "jpeg" ||
                        e.extension == "svg" ||
                        e.extension == "png" ||
                        e.type == "image" ? (
                        <ImageOutlinedIcon />
                      ) : (
                        <FileCopyOutlinedIcon />
                      )}
                    </div>
                    <div className="attachment__name">
                      <p className="attachment__filename">{(e.name).slice(0,10)+"..."}</p>
                      <p className="attachment__filesize">
                        {(e.size / 1000000).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="attachment__download">
                      <a href={e.url} target="_blank" download>
                        <IconButton>
                          <GetAppIcon />
                        </IconButton>
                      </a>
                    </div>
                  </div>
                );
              })
            : null}
        </div>
      )}
    </div>
  );
}

export default RecipientProfile;
