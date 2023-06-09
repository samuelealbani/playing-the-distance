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

let mirrorToSearch;

const number_of_voices = 3; // make it global for client or send it

let staticServerPort = "4400";
let printEveryMessage = false;

let oscRecievePort = "9129";
let sendIP = "127.0.0.1";//localhost
let oscSendPort = "9130";

const freqIntervals = [1, 1.33, 1.779, 5, 7];
let carrierFreq = 330;

// Tell our Node.js Server to host our P5.JS sketch from the public folder.
app.use(express.static("public"));

// Setup Our Node.js server to listen to connections from chrome, and open chrome when it is ready
server.listen(staticServerPort, () => {
  console.log(`listening on *: ${staticServerPort}`);
  for(let i = 0; i < number_of_voices; i++){
    open("https://127.0.0.1:" + staticServerPort +'/mirror.html?id=' + i); // open three browsers try pos and size
    console.log(i);
  }
});

// reassignHarmonics();

// Callback function for what to do when our P5.JS sketch connects and sends us messages
io.on("connection", (socket) => {
  console.log("\n_________a user connected");

  // Code to run every time we get a message from front-end P5.JS
  socket.on("identification", (res) => {

    if (res[0]) { // is a voice
      console.log('\nres: ', res);
      console.log(socket.id, "is a voice", 'res[1]', res[1], 'res[2]', res[2]);
      voiceIds.push([socket.id, res[2]]);
      socket.emit("setHarmonic", freqIntervals/* [index] */);
      socket.emit("setFrequency", carrierFreq);

      mirrorToSearch = res[2];
      console.log('searching mirror', mirrorToSearch);
      if (mirrorsIds.length > 0) {
        let index = mirrorsIds.findIndex(findIndexByMirror);
        console.log('index mirror', index);
        let id = mirrorsIds[index];
        console.log('sending to id: ', id);
        // console.log('id: ', id, ' mirror: ', mirrorToSearch);

        io.to(id).emit('activate', true) // send to a specific id
      } else {
        console.log('!mirrorsIds.length > 0', mirrorsIds.length);
      }

      //reassignHarmonics();
    } else {
      mirrorsIds.push([socket.id, res[1]]); // store the socket.id with the number of mirror
      console.log(socket.id, "is a mirror", res[1], 'mirrorsIds: ', mirrorsIds);
    }
  });

  /*   let message = new OSC.Message("/distances/noses");
    message.add(34);
    osc.send(message); */

  socket.on("disconnect", () => {
    console.log("disconnected", socket.id);
    for (let i = 0; i < voiceIds.length; i++) {
      // console.log('is the voice id');
      if (voiceIds[i].includes(socket.id)) {
        console.log('is the voice id: ', socket.id, 'assigned to mirror', voiceIds[i][1]);

        /// create function activateMirror
        mirrorToSearch = voiceIds[i][1];
        console.log('searching mirror', mirrorToSearch);
        if (mirrorsIds.length > 0) {
          let index = mirrorsIds.findIndex(findIndexByMirror);
          console.log('index mirror', index);
          let id = mirrorsIds[index];
          console.log('sending to id: ', id);
          // console.log('id: ', id, ' mirror: ', mirrorToSearch);

          io.to(id).emit('activate', false) // send to a specific id
        } else {
          console.log('!mirrorsIds.length > 0', mirrorsIds.length);
        }

        voiceIds.splice(i, 1);
        console.log('deleted element. Now voiceIds: ', voiceIds);
      }
      ///[end] create function activateMirror
    }
    /*     if (voiceIds.includes(socket.id)) {
          const index = voiceIds.indexOf(socket.id);
          if (index !== -1) {
            voiceIds.splice(index, 1);
          }
          // reassignHarmonics();
        } */


    for (let i = 0; i < mirrorsIds.length; i++) {
      if (mirrorsIds[i].includes(socket.id)) {
        console.log('is the mirror id: ', socket.id);
        mirrorsIds.splice(i, 1);
        console.log('deleted element. Now mirrorsIds: ', mirrorsIds);
      }
    }


    if (mirrorsIds.includes(socket.id)) {
      const index = mirrorsIds.indexOf(socket.id);
      if (index !== -1) {
        mirrorsIds.splice(index, 1);
      }
      console.log('deleted from mirrorIds array');
      // reassignHarmonics();
    }


  });

  // Code to run every time we get a message from front-end P5.JS
  socket.on("data", (data) => {
    // console.log('udp');
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

    // console.log(data.assignedMirror);
    mirrorToSearch = data.assignedMirror;
    // function findIdByMirror(pair) {
    //   return pair[1] === mirrorToSearch;
    // }
    if (mirrorsIds.length > 0) {
      let index = mirrorsIds.findIndex(findIndexByMirror);
      let id = mirrorsIds[index];
      // console.log('id: ', id, ' mirror: ', mirrorToSearch);

      io.to(id).emit('mirror', data) // send to a specific id
    }

    //do something
    // socket.broadcast.emit('mirror', data);//broadcast.emit means send to everyone but the sender
    //send it via OSC to another port, device or software (e.g. max msp)
    // udpPort.send(data, sendIP, oscSendPort);

    // console.log("receiving");

    // Print it to the Console
    if (printEveryMessage) {
      console.log(data);
    }
  });

});

function findIndexByMirror(pair) {
  return pair[1] === mirrorToSearch;
}

function findIndexById(pair, _id) {
  return pair[0] === _id;
}

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

      socket.emit("setHarmonic", freqIntervals/* [index] */);
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

function activateMirror() {

}

function setNewFrequency() {
  io.emit("setFrequency", newNoteFreq);
  newNoteFreq = Math.floor(Math.random() * 400) + 70;
  console.log('called emit setFrequency: ', newNoteFreq);
}


