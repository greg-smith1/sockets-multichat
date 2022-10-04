const httpServer = require('http').createServer();
const io = require('socket.io')(httpServer, {
  cors: {
    origin: "http://localhost:8080"
  }
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error('Invalid Username'));
  }
  socket.username = username;
  next();
})

io.on('connection', (socket) => {
  const users = [];
  for (let [id, socket] of io.of('/').sockets) {
    users.push({
      userId: id,
      username: socket.username
    });
  }
  socket.emit("users", users);
  socket.broadcast.emit("user connected", {
    userId: socket.id,
    username: socket.username
  });
  
  socket.on("private message", ({ content, to }) => {
    socket.to(to).emit("private message", {
      content,
      from: socket.id
    });
  });
});
