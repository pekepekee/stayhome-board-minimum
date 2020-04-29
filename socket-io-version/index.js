var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var fs = require("fs");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  var socketId = socket.id;
  var roomId = socket.handshake.query.id;
  socket.join(roomId);
  try {
    var data = fs.readFileSync(`data/${roomId}.json`, "utf-8");
    io.to(socketId).emit("server_item_update", JSON.parse(data));
  } catch (e) {
    console.log(e);
  }
  socket.on("client_item_update", (data) => {
    socket.broadcast.to(roomId).emit("server_item_update", data);
    fs.writeFile(`data/${roomId}.json`, JSON.stringify(data), (err) => {
      if (err) throw err;
    });
  });
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
