import React from "react";
import { Button } from "@material-ui/core";
import "./Login.css";
import GoogleLogin from "react-google-login";
import axios from "../axios.js";
import { useStateValue } from "../StateProvider.js";
import GoogleButton from "react-google-button";
import logo from "../Login/logo.png";

function Login() {
  // eslint-disable-next-line
  const [{ user }, dispatch] = useStateValue();

  const responseGoogleSuccess = async (response) => {
    await axios
      .get(`/users/find/${response.profileObj.email}`)
      .then((userData) => {
        if (userData.data.success === true) {
          dispatch({
            type: "SET_USER",
            user: {
              name: userData.data.data.name,
              email: userData.data.data.email,
              imageURL: userData.data.data.imageURL,
              googleId: userData.data.data.loggedInUserId,
              contactList: userData.data.data.contactList,
            },
          });
        } else if (userData.data.success === false) {
          dispatch({
            type: "SET_USER",
            user: {
              name: response.profileObj.name,
              email: response.profileObj.email,
              imageURL: response.profileObj.imageUrl,
              googleId: response.profileObj.googleId,
              contactList: [],
            },
          });

          axios.post("/users/login", {
            loggedInUserId: response.profileObj.googleId,
            email: response.profileObj.email,
            name: response.profileObj.name,
            imageURL: response.profileObj.imageUrl,
            contactList: [],
          });
        }
      });

    // await dispatch({
    //   type: "SET_USER",
    //   user: {
    //     name: response.profileObj.name,
    //     email: response.profileObj.email,
    //     imageURL: response.profileObj.imageUrl,
    //     googleId: response.profileObj.googleId,
    //     contactList: userData.data.contactList,
    //   },
    // });
  };

  const responseGoogleFailure = (response) => {
    dispatch({
      type: "SET_USER",
      user: null,
    });
    alert("failure");
    // window.open("https://app-rtchat.herokuapp.com/", "_self");
  };

  return (
    <div className="login">
      <div className="login__container">
        <img src={logo} alt="whatsapp-logo" />

        <div className="login__text">
          <GoogleLogin
            clientId="408529617077-ulu5picsg600vopgib4bb9btfkm43boi.apps.googleusercontent.com"
            render={(renderProps) => (
              <GoogleButton
                type="dark"
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
              />
            )}
            buttonText="Login"
            onSuccess={responseGoogleSuccess}
            onFailure={responseGoogleFailure}
            isSignedIn={true}
            cookiePolicy={"single_host_origin"}
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
