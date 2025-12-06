import { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import socket from "../socket";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";


export default function ChatWindow() {
  const [showEmoji, setShowEmoji] = useState(false);
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [text, setText] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [search, setSearch] = useState("");
  const [typingUser,setTypingUser]=useState("")
  const [lastSeen, setLastSeen] = useState(null);

  const mediaRecorderRef = useRef(null);


  const bottomRef = useRef(null);
  const senderId = localStorage.getItem("userId");
const formatTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

  // -----------------------------------------------------
  //  LOAD MESSAGES + JOIN ROOM + SOCKET LISTENERS
  // -----------------------------------------------------
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.start();

      mediaRecorderRef.current.ondataavailable = (e) => {
        const audioURL = URL.createObjectURL(e.data);

        socket.emit("sendMessage", {
          roomId,
          senderId,
          receiverId,
          messageType: "audio",
          fileURL: audioURL,
          message: "",
        });
      };

      toast("Recording started 🎤");
    } catch (err) {
      toast.error("Microphone permission denied");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    toast("Recording stopped ⏹");
  };

  useEffect(() => {
    // Ask notification permission
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    socket.emit("joinRoom", roomId);

    // Load old messages
    api.get(`/messages/${roomId}`).then((res) => {
      setMessages(res.data.messages);
      setPartnerName(res.data.partnerName);
      setReceiverId(res.data.partnerId);
    });

    // When new message is received
    socket.on("receiveMessage", (msg) => {
      toast.success("New message received!");

      if (Notification.permission === "granted") {
        new Notification("New Message", {
          body: msg.message || "Photo",
          icon: "/your-logo.png",
        });
      }

      setMessages((prev) => [...prev, msg]);
    });

    socket.on("messagesSeen", () => {
      setMessages((prev) => prev.map((m) => ({ ...m, seen: true })));
    });

socket.on("showTyping", ({ name, isTyping }) => {
  setTyping(isTyping);
  setTypingUser(name);

  // Optional auto-hide
  if (isTyping) {
    setTimeout(() => setTyping(false), 2000);
  }
});



    socket.on("online", ({ userId }) => {
      setOnlineUsers((prev) => [...prev, userId]);
    });

    socket.on("offline", ({ userId }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    socket.on("delivered", (msgId) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === msgId ? { ...m, delivered: true } : m
        )
      );
    });
    
socket.on("reactMessage", ({ messageId, emoji, userId }) => {
  setMessages((prev) =>
    prev.map((m) =>
      m._id === messageId
        ? {
            ...m,
            reactions: [...(m.reactions || []), { emoji, userId }],
          }
        : m
    )
  );
});


    return () => {
      socket.off("reactMessage");
      socket.off("receiveMessage");
      socket.off("messagesSeen");
      socket.off("showTyping");
      socket.off("online");
      socket.off("offline");
      socket.off("delivered");
    };
  }, [roomId]);

  // -----------------------------------------------------
  //  AUTO SCROLL
  // -----------------------------------------------------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // -----------------------------------------------------
  // SEND TEXT MESSAGE
  // -----------------------------------------------------
  const sendMsg = () => {
    if (!text.trim()) return;

    socket.emit("sendMessage", {
      roomId,
      senderId,
      receiverId,
      message: text,
    });

    toast.success("Message sent!");

    setText("");
  };

  // -----------------------------------------------------
  // DELETE CHAT
  // -----------------------------------------------------
  const handleDeleteChat = async () => {
    try {
      await api.delete(`/messages/${roomId}`);
      setMessages([]);
    } catch {
      alert("Failed to delete chat");
    }
  };

  // -----------------------------------------------------
  // FILE UPLOAD
  // -----------------------------------------------------
  const sendFile = async (e) => {
    const form = new FormData();
    form.append("file", e.target.files[0]);

    const res = await api.post("/messages/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const fileURL = res.data.url;

    socket.emit("sendMessage", {
      roomId,
      senderId,
      receiverId,
      messageType: "image",
      fileURL,
      message: "",
    });
  };
  const reactToMessage = async (emoji, messageId) => {
  try {
    await api.put(`/messages/react/${messageId}`, { emoji });

    // Update UI instantly
    setMessages((prev) =>
      prev.map((m) =>
        m._id === messageId
          ? {
              ...m,
              reactions: [...(m.reactions || []), { emoji, userId: senderId }],
            }
          : m
      )
    );

    socket.emit("reactMessage", { roomId, messageId, emoji, userId: senderId });
  } catch (err) {
    toast.error("Failed to react");
  }
};


  // -----------------------------------------------------
  // FILTER SEARCH MESSAGES
  // -----------------------------------------------------
  const filteredMessages = messages.filter((m) =>
    m.message?.toLowerCase().includes(search.toLowerCase())
  );

  // -----------------------------------------------------
  //  RENDER UI
  // -----------------------------------------------------
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">

      {/* HEADER */}
<div className="p-4 bg-gray-800 flex items-center shadow">

  {/* Avatar */}
  <img
    src={`https://ui-avatars.com/api/?name=${partnerName}`}
    className="w-10 h-10 rounded-full"
  />

  {/* Partner Name + Online Status */}
  <div className="ml-3">
    <h2 className="font-semibold text-lg">{partnerName}</h2>

    {onlineUsers.includes(receiverId) ? (
      <p className="text-sm text-green-400">Online</p>
    ) : (
      <p className="text-sm text-gray-400">
        Last seen {formatTime(lastSeen)}
      </p>
    )}
  </div>

  {/* Options Button */}
  <button className="ml-auto text-red-400 hover:text-red-500 text-2xl">
    ⋮
  </button>
</div>


      {/* SEARCH BAR */}
      <div className="px-4 mt-2">
        <input
          className="w-full p-2 bg-gray-700 rounded"
          placeholder="Search messages..."
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* FILTERED RESULTS */}
      {search.trim() ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredMessages.map((m) => (
            <div key={m._id} className="p-2 bg-gray-800 rounded">
              {m.message}
            </div>
          ))}
        </div>
      ) : (
        /* NORMAL CHAT */
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
   {typingUser && <div>{typingUser} is typing...</div>}


          {messages.map((m) => (
     <div
  className={`max-w-xs p-3 rounded-xl shadow 
    ${m.senderId === senderId 
      ? "bg-red-600 ml-auto text-white rounded-br-none" 
      : "bg-gray-700 text-white rounded-bl-none"}
  `}
>

              {m.message}
              {m.messageType === "audio" && (
                <audio controls src={m.fileURL} className="mt-2 w-40"></audio>
              )}
              


              {m.messageType === "image" && (
                <img src={m.fileURL} className="w-40 rounded-lg mt-2" />
              )}
              <div className="flex gap-2 mt-2 text-xl">
  <button onClick={() => reactToMessage("❤️", m._id)}>❤️</button>
  <button onClick={() => reactToMessage("👍", m._id)}>👍</button>
</div>


              <span className="text-xs text-gray-300 block mt-1">
                {new Date(m.createdAt).toLocaleTimeString()}
              </span>

              {m.senderId === senderId && (
                <span className="text-xs text-gray-300 block mt-1">
                  {m.seen ? "✓✓" : m.delivered ? "✓" : ""}
                </span>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* SEND BOX */}
      <div className="p-4 flex bg-gray-800 gap-3">

        <input
          className="flex-1 p-2 bg-gray-700 rounded"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
    socket.emit("typing", { roomId, userName: partnerName });          }}
        />

        <input type="file" accept="image/*" onChange={sendFile} />

        <button onClick={() => setShowEmoji(!showEmoji)}>😊</button>

        {showEmoji && (
          <EmojiPicker
            onEmojiClick={(emojiObject) => {
              setText(text + emojiObject.emoji);
            }}
          />
        )}

        {/* ⭐ NEW — AUDIO RECORD BUTTONS */}
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          className="px-3 bg-yellow-600 hover:bg-yellow-700 rounded"
        >
          🎤
        </button>

        <button
          onClick={sendMsg}
          className="px-4 bg-red-600 rounded hover:bg-red-700"
        >
          Send➤
        </button>
 

      </div>

    </div>
  );
}
