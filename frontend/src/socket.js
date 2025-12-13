// src/socket.js
import { io } from "socket.io-client";

const socket = io("https://investormatch-backend-yn2k.onrender.com/", {
  withCredentials: true,
});


export default socket;
