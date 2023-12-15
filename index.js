const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Enable CORS for the specific origin where your frontend is hosted
const corsOptions = {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
};

app.use(cors(corsOptions));
// Enable CORS for all routes

let users = [];

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
};

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
    console.log("a user connected.");

    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        console.log("Users after adding:", users);
        io.emit("getUsers", users);
    });

    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
        const user = getUser(receiverId);

        if (user && user.socketId) {
            io.to(user.socketId).emit("getMessage", {
                senderId,
                text,
            });
        } else {
            console.log("Invalid user or socketId:", user);
        }
    });

    socket.on("disconnect", () => {
        console.log("a user disconnected!");
        removeUser(socket.id);
        io.emit("getUsers", users);
    });
});

const PORT = process.env.PORT || 8900;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
