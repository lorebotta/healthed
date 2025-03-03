require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const chatStore = require("./chatStore");

// Imposta EJS come motore di template e definisce la cartella delle views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware per parsing di form e JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Cartella per file statici (es. CSS, client-side JS)
app.use(express.static(path.join(__dirname, "public")));

// Configurazione delle sessioni (usa un secret sicuro)
app.use(
  session({
    secret: "mio_segreto_super_sicuro",
    resave: false,
    saveUninitialized: false,
  }),
);

// Rotte di autenticazione, gruppi, contenuti e dossier
const authRoutes = require("./routes/authRoutes");
const groupRoutes = require("./routes/groupRoutes");
const contentRoutes = require("./routes/contentRoutes");
const dossierRoutes = require("./routes/dossierRoutes");

app.use("/", authRoutes);
app.use("/groups", groupRoutes);
app.use("/content", contentRoutes);
app.use("/dossier", dossierRoutes);

// Rotta home semplice: reindirizza ai gruppi
app.get("/", (req, res) => {
  res.redirect("/groups");
});

// Socket.io per la chat con persistenza
io.on("connection", (socket) => {
  console.log("Un utente si è connesso alla chat.");

  socket.on("joinGroup", (groupId) => {
    socket.join("group-" + groupId);
    const history = chatStore.getMessages(groupId);
    socket.emit("chatHistory", history);
  });

  socket.on("chatMessage", (msgData) => {
    // msgData deve contenere groupId, user, message
    const message = chatStore.addMessage(msgData.groupId, msgData);
    io.to("group-" + msgData.groupId).emit("chatMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("Un utente si è disconnesso.");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
});
