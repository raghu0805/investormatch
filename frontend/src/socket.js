// src/socket.js
import { io } from "socket.io-client";

// const socket = io("https://investormatch-backend-yn2k.onrender.com/", {
//   withCredentials: true,
// });
const socket = io("http://localhost:5000", {
  withCredentials: true,
});


export default socket;
