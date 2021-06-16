export const initialState = {
  user: null,
  rooms: [],
  socketConnID: null,
  roomId: null,
  lastMessage: null,
  profileView: false,
  recipientProfileView: false,
  recipientProfileDetails: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.user,
      };
    case "SET_SOCKET":
      return {
        ...state,
        socketConnID: action.socketConnID,
      };
    case "SET_ROOMS":
      return {
        ...state,
        rooms: action.rooms,
      };
    case "SET_ROOMID":
      return {
        ...state,
        roomId: action.roomId,
      };
    case "SET_PROFILEVIEW":
      return {
        ...state,
        profileView: action.profileView,
      };
    case "SET_RECPROFILEVIEW":
      return {
        ...state,
        recipientProfileView: action.recipientProfileView,
      };
    case "SET_RECPROFILEDETAILS":
      return {
        ...state,
        recipientProfileDetails: action.recipientProfileDetails,
      };

    default:
      return state;
  }
};

export default reducer;
