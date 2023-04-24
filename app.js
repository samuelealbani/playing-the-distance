//LOCAL ONLY
//DON'T HOST THIS ONLINE ON GLITCH
//You should use proper https certificates to securely host https
//This is for a locally hosted server only!
// https://learn.gold.ac.uk/mod/page/view.php?id=1269356

// Import Libraries and Setup
const open = require("open");
const fs = require('fs');

//https certificates 
const options = {
  key: fs.readFileSync('cert.key'), 
  cert: fs.readFileSync('cert.crt') 
};

const express = require("express");
const app = express();
const https = require('https');
const server = https.createServer(options,app);//use certificates for https

const { Server } = require("socket.io");
const io = new Server(server);

let staticServerPort = "4400";
let printEveryMessage = true; 

// Tell our Node.js Server to host our P5.JS sketch from the public folder.
app.use(express.static("public"));


// Setup Our Node.js server to listen to connections from chrome, and open chrome when it is ready
server.listen(staticServerPort, () => {
  console.log(`listening on *: ${staticServerPort}`);
  open("https://127.0.0.1:"+staticServerPort);
});


// Callback function for what to do when our P5.JS sketch connects and sends us messages
io.on("connection", (socket) => {
  console.log("a user connected");

  // Code to run every time we get a message from front-end P5.JS
  socket.on("data", (data) => {

    //do something
    socket.broadcast.emit('data', data);//broadcast.emit means send to everyone but the sender

    // Print it to the Console
    if (printEveryMessage) {
      console.log(data);
    }
  });
});

