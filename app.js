//LOCAL ONLY
//DON'T HOST THIS ONLINE ON GLITCH
//You should use proper https certificates to securely host https
//This is for a locally hosted server only!
// https://learn.gold.ac.uk/mod/page/view.php?id=1269356

// Import Libraries and Setupù

const open = require("open");
const fs = require('fs');

const express = require("express");
const app = express();
// const http = require("http");
const https = require('https');
//const server = http.createServer(app);
//https certificates 
const options = {
  key: fs.readFileSync('cert.key'),
  cert: fs.readFileSync('cert.crt')
};
const server = https.createServer(options, app);//use certificates for https
const { Server } = require("socket.io");
const io = new Server(server);
const osc = require("osc");
const os = require("os");

let voiceIds = [];
let mirrorsIds = [];

/* 
// old import
const open = require("open");
const fs = require('fs');
const OSC = require('osc-js')
const osc = new OSC({ plugin: new OSC.WebsocketServerPlugin() })
osc.open() // listening on 'ws://localhost:8080'
const express = require("express");
const app = express();
const https = require('https');
const server = https.createServer(options, app);//use certificates for https
const { Server } = require("socket.io");
const io = new Server(server);
 */




let staticServerPort = "4400";
let printEveryMessage = false;

let oscRecievePort = "9129";
let sendIP = "127.0.0.1";//localhost
let oscSendPort = "9130";

const freqIntervals = [1, 2, 3, 5, 7, 2.05, 3.05];
let carrierFreq = 84;

// Tell our Node.js Server to host our P5.JS sketch from the public folder.
app.use(express.static("public"));

// Setup Our Node.js server to listen to connections from chrome, and open chrome when it is ready
server.listen(staticServerPort, () => {
  console.log(`listening on *: ${staticServerPort}`);
  // open("https://127.0.0.1:" + staticServerPort);
});

// reassignHarmonics();

// Callback function for what to do when our P5.JS sketch connects and sends us messages
io.on("connection", (socket) => {
  console.log("\n_________a user connected");

  // Code to run every time we get a message from front-end P5.JS
  socket.on("identification", (_isVoice) => {

    if (_isVoice) {
      console.log(socket.id, "is a voice");
      voiceIds.push(socket.id);
      reassignHarmonics();
    } else {
      mirrorsIds.push(socket.id);
      console.log(socket.id, "is a mirror");
    }
  });



  /*   let message = new OSC.Message("/distances/noses");
    message.add(34);
    osc.send(message); */

  socket.on("disconnect", () => {
    console.log("disconnected", socket.id);
    if (voiceIds.includes(socket.id)) {
      const index = voiceIds.indexOf(socket.id);
      if (index !== -1) {
        voiceIds.splice(index, 1);
      }
      reassignHarmonics();
    }

  });

  // Code to run every time we get a message from front-end P5.JS
  socket.on("data", (data) => {

    //do something
    // socket.broadcast.emit('mirror', data);//broadcast.emit means send to everyone but the sender
    //send it via OSC to another port, device or software (e.g. max msp)
    udpPort.send(data, sendIP, oscSendPort);

    // console.log("receiving");

    // Print it to the Console
    if (printEveryMessage) {
      console.log(data);
    }
  });

  // Code to run every time we get a message from front-end P5.JS
  socket.on("waveform", (data) => {

    //do something
    socket.broadcast.emit('mirror', data);//broadcast.emit means send to everyone but the sender
    //send it via OSC to another port, device or software (e.g. max msp)
    // udpPort.send(data, sendIP, oscSendPort);

    // console.log("receiving");

    // Print it to the Console
    if (printEveryMessage) {
      console.log(data);
    }
  });

});


function getIPAddresses() {
  let interfaces = os.networkInterfaces(),
    ipAddresses = [];

  for (let deviceName in interfaces) {
    let addresses = interfaces[deviceName];
    for (let i = 0; i < addresses.length; i++) {
      let addressInfo = addresses[i];
      if (addressInfo.family === "IPv4" && !addressInfo.internal) {
        ipAddresses.push(addressInfo.address);
      }
    }
  }

  return ipAddresses;
};

let udpPort = new osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: oscRecievePort
});

udpPort.on("ready", () => {
  let ipAddresses = getIPAddresses();

  console.log("Listening for OSC over UDP.");
  ipAddresses.forEach((address) => {
    console.log(" Host:", address + ", Port:", udpPort.options.localPort);
  });

});

udpPort.on("message", (oscMessage) => {

  //send it to the front-end so we can use it with our p5 sketch
  io.emit("message", oscMessage);

  // Print it to the Console
  if (printEveryMessage) {
    console.log(oscMessage);
  }
});

udpPort.on("error", (err) => {
  console.log(err);
});

udpPort.open();

function reassignHarmonics() {
  console.log('Reassigning Harmonics..');


  for (const [key, socket] of io.sockets.sockets.entries()) {
    // key will be something like TTRWuTdEjhyGwKQvAAAB
    // value will be a Socket

    // var socket = sockets[value.id];
    if (voiceIds.includes(socket.id)) {
      const index = voiceIds.indexOf(socket.id);
      console.log(socket.id, 'yes is a voice', 'index voice: ', voiceIds.indexOf(socket.id));
      console.log(index + '.', 'key:', key, 'socket.id', socket.id, 'setHarmonic', freqIntervals[index]);

      socket.emit("setHarmonic", freqIntervals[index]);
      socket.emit("setFrequency", carrierFreq);
    } else {
      console.log(socket.id, 'no is a mirror');
    }

  }

  // old loop
  // let index = 0;
  // for (const [key, socket] of io.sockets.sockets.entries()) {
  //   // key will be something like TTRWuTdEjhyGwKQvAAAB
  //   // value will be a Socket

  //   // var socket = sockets[value.id];
  //   console.log(index + '.', 'key:', key, 'socket.id', socket.id, 'setHarmonic', freqIntervals[index]);

  //   socket.emit("setHarmonic", freqIntervals[index]);
  //   socket.emit("setFrequency", carrierFreq);
  //   index++;
  // } 

}

function setNewFrequency() {
  io.emit("setFrequency", newNoteFreq);
  newNoteFreq = Math.floor(Math.random() * 400) + 70;
  console.log('called emit setFrequency: ', newNoteFreq);
}


