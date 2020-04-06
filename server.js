const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");
const app = express();

const PORT = process.env.PORT || 3000; //if we deploy this on heroku, it will automatically get heroku port
const server = http.createServer(app);
const io = socketio(server);
const botName = "ARX Bot";
//set static folder
app.use(express.static(path.join(__dirname, "/public")));

//run when client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    //sadece kendine gönderir
    socket.emit("msg", formatMessage(botName, "Welcome to the chat room!"));

    //kendi hariç herkese gönderir
    socket.broadcast
      .to(user.room)
      .emit(
        "msg",
        formatMessage(botName, `${user.username} has joined the chat!`)
      );

    //send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //listen for chatmsg
  socket.on("chatmsg", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("msg", formatMessage(user.username, msg));
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      //herkese gönderir
      io.to(user.room).emit(
        "msg",
        formatMessage(botName, `${user.username} has left the chat`)
      );
      //send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
