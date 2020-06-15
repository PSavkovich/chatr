const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

io.on("connection", socket => {
  const { id } = socket.client;
  socket.on("outgoing chat message", ({ nickname, msg, time }) => {
    //Only emit the incoming message event to
    //connections that didn't send the outgoing event
    socket.broadcast.emit("incoming chat message", { nickname, msg, time });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listen on *:${PORT}`));
