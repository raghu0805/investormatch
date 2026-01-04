import {saveMessageFromSocket} from "../controllers/messageController.js"
export default function SocketHandler(io){
    io.on("connection",(socket)=>{
        console.log("a user connected");


        //1.Join Room-roomId will be the combination of starup and investor

        socket.on("join-room",(roomId)=>{
            if(roomId){
                socket.join(roomId);
            }
        })

        //2.Send Message
        socket.on("send-message",async(data)=>{
            const message=await saveMessageFromSocket(data);
            if(message){
                io.to(data.roomId).emit("message-received",message);
            }
        });
        socket.on("disconnect",()=>{
            console.log("user disconnected");
        })
    })
}