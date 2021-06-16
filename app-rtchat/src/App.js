import "./App.css";
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar/Sidebar.js";
import Chat from "./Chat/Chat.js";
import Login from "./Login/Login.js";
import { useStateValue } from "./StateProvider";
// import { ContactPhoneOutlined } from "@material-ui/icons";
import axios from "./axios.js";
import useLocalStorage from "./useLocalStorage";
import Profile from "./Profile/Profile.js";
import RecProfileView from "./RecipientProfile/RecipientProfile.js";

function App({ socket }) {
  const [
    { user, profileView, recipientProfileView },
    dispatch,
  ] = useStateValue();
  const [socketID, setSocketID] = useState("");
  const [roomsFetched, setRoomsFetched] = useState([]);
  const [chatData, setChatData] = useLocalStorage("chatData", []);

  socket.off().on("receive-message", (message) => {
    setChatData((oldChats) => {
      return [...oldChats, message];
    });
  });

  useEffect(() => {
    if (user !== null) socket.emit("user-joined", user);

    socket.on("connect-created", (serverSocketId) => {
      setSocketID(serverSocketId);
    });
  }, [user]);

  useEffect(() => {
    socketID.length !== 0
      ? dispatch({
          type: "SET_SOCKET",
          socketConnID: socketID,
        })
      : console.log();
  }, [socketID]);

  useEffect(() => {
    if (user) {
      axios
        .get(`/rooms/find/${user.email}`)
        .then((response) => {
          if (response.status === 200) {
            setRoomsFetched(response.data);
          } else {
            alert("Re-login");
          }
        })
        .catch((e) => {
          alert("Re-login");
        });
    }
  }, [user]);

  useEffect(() => {
    dispatch({
      type: "SET_ROOMS",
      rooms: roomsFetched,
    });
  }, [roomsFetched]);

  if (user != null) {
    return (
      <div className="app">
        <div className="app__body">
          {profileView ? <Profile /> : <Sidebar socket={socket} />}
          <Chat socket={socket} />
          {recipientProfileView ? <RecProfileView /> : null}
        </div>
      </div>
    );
  } else if (user == null) {
    return (
      <div className="app">
        {/* <div className="app__body"> */}
          <Login />
        {/* </div> */}
      </div>
    );
  }
}

export default App;
