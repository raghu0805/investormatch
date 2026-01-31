# Socket.io Implementation in Your Project

This document explains why and how `socket.io` was implemented in your InvestMatch application. It covers the technical reasons for using a dedicated HTTP server and walks through your specific code.

## 1. Why do we need `type: 'http'` Server?

You might wonder why we do this:
```javascript
import http from 'http';
const app = express();
const server = http.createServer(app); // Why this?
```
Instead of just:
```javascript
const app = express();
app.listen(PORT); 
```

### The Reason: Protocol Upgrade
Socket.io works by "piggybacking" on your HTTP server.
1.  **Initial Handshake**: When a client tries to connect via Socket.io, it starts with a standard HTTP request.
2.  **Upgrade**: If the server supports it, this connection is "upgraded" from HTTP to a permanent **WebSocket** connection.

Express (`app`) is essentially a request handling function designed for standard HTTP (Request -> Response). It doesn't natively handle the persistent, open connections that WebSockets require.

By creating a raw Node.js HTTP server (`http.createServer(app)`), we get access to the underlying server instance. We then:
1.  Pass this server to **Express** (so it can handle standard API routes like `/api/auth`).
2.  Pass this *same* server to **Socket.io** (so it can listen for the upgrade handshake).

This allows both your REST API and your Real-time Chat to live on the exact same port (`5000`).

---

## 2. Implementation Walkthrough 

### Step 1: Server Setup (`backend/server.js`)

Here is how we set it up in your `server.js`:

```javascript
// 1. Imports
import http from 'http';
import { Server } from 'socket.io'; // The Socket.io server class

// 2. Wrap Express with HTTP
const app = express();
const server = http.createServer(app); 

// 3. Initialize Socket.io
const io = new Server(server, {
  cors: { 
    origin: ["http://localhost:5173", "https://investmatch.me"] // Allow frontend to connect
  }
});

// 4. Global Access (Optional but useful)
app.set("io", io); 

// 5. Initialize Logic
SocketHandler(io); // Pass the 'io' instance to your handler functions

// 6. Listen
server.listen(PORT, ...); // Start the HTTP server (which starts Socket.io too)
```

- **Line 3**: `new Server(server, ...)`: This is where we attach Socket.io to the HTTP server.
- **Line 4**: `app.set("io", io)`: This stores the socket instance in the Express app. This is useful if you ever need to emit an event from a standard API Controller (e.g., "User A liked your post" -> Notification).
- **Line 5**: `SocketHandler(io)`: To keep `server.js` clean, we moved the actual socket events to a separate file.

### Step 2: The Logic (`backend/socket/socketHandler.js`)

This file defines *what* happens when a user connects.

```javascript
export default function SocketHandler(io){
    io.on("connection", (socket) => {
        console.log("a user connected"); 
        // 'socket' represents the specific connection to ONE user.

        // EVENT 1: Joining a specific chat room
        socket.on("join-room", (roomId) => {
            if(roomId){
                socket.join(roomId); // Creates a "channel" unique to this chat
            }
        });

        // EVENT 2: Sending a Message
        socket.on("send-message", async (data) => {
            // 1. Save to Database (using your existing controller logic)
            const message = await saveMessageFromSocket(data);
            
            // 2. Broadcast to Room
            if(message){
                // io.to(roomId).emit(...) sends ONLY to people in that room
                io.to(data.roomId).emit("message-received", message);
            }
        });
        
        // ... (Other events like joining user notifications)
    });
}
```

### How the "Two-Way" Communication Works

1.  **Client (Frontend)**: User types "Hello" and hits send. The frontend emits a `send-message` event with data (room ID, text, sender).
2.  **Server Listen**: The `socket.on("send-message", ...)` block in `socketHandler.js` catches this event.
3.  **Server Process**: It saves the message to MongoDB using `saveMessageFromSocket`.
4.  **Server Broadcast**: It uses `io.to(roomId).emit("message-received", message)` to instantly send that message back out.
5.  **Client (Frontend)**: Both the sender and the receiver (who are in that `roomId`) listen for `message-received` and instantly update their UI.

## Summary for Interview/Explanation

**"Why did you create a separate HTTP server?"**
> "Socket.io requires access to the raw HTTP server instance to handle the initial connection upgrade from HTTP to WebSocket. Express alone abstracts this away, so I used Node's native `http` module to create the server and shared it between Express (for REST APIs) and Socket.io (for real-time features)."

**"How does your real-time chat work?"**
> "I implemented a `SocketHandler` that listens for connection events. When a user enters a chat, they join a specific 'Room' via `socket.join(roomId)`. When they send a message, the server saves it to MongoDB and then immediately broadcasts it to that specific room using `io.to(roomId).emit()`. This ensures only the relevant people see the message instantly."
