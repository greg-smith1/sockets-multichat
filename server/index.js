const httpServer = require('http').createServer();
const io = require('socket.io')(httpServer, {
  cors: {
    origin: "http://localhost:8080"
  }
});

const crypto = require('crypto');
const randomId = () => crypto.randomBytes(8).toString('hex');

const { InMemorySessionStore } = require('./sessionStore');
const sessionStore = new InMemorySessionStore();

io.use((socket, next) => {
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    const session = sessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.username = session.username;
      return next()
    }
  }
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error('Invalid Username'));
  }
  socket.sessionID = randomId();
  socket.userID = randomId();
  socket.username = username;
  next();
})

io.on('connection', (socket) => {
  sessionStore.saveSession(socket.sessionID, {
    userID: socket.userID,
    username: socket.username,
    connected: true,
  })

  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID
  })
  
  socket.join(socket.userID);

  const users = [];
  sessionStore.findAllSessions().forEach((session) => {
    users.push({
      userId: session.userID,
      username: session.username,
      connected: session.connected,
    });
  });

  socket.emit("users", users);
  socket.broadcast.emit("user connected", {
    userId: socket.id,
    username: socket.username
  });

  socket.on("private message", ({ content, to }) => {
    socket.to(to).to(socket.userID).emit("private message", {
      content,
      from: socket.userID,
      to,
    });
  });

  socket.on("disconect", async () => {
    const matchingSocks = await io.in(socket.userID).allSockets();
    const isDisconnected = matchingSocks.size === 0;
    if (isDisconnected) {
      socket.broadcast.emit("user disconnected", socket.userID);
      sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        username: socket.username,
        connected: false,
      })
    }
  })
});
