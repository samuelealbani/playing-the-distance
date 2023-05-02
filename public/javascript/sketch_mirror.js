let wifiName = 'sam-wifi'; // sam-wifi // 1.118

let qrCodeImg;
let debug = false;

let socket;

let isActive = false;

let waveform;

let thisMirrorId;

function preload() {
  const myUrl = new URL(window.location.toLocaleString()).searchParams;
  console.log('myUrl', myUrl);
  const arg = myUrl.getAll('id');
  thisMirrorId = arg[0];
  document.title = 'Mirror ' + thisMirrorId; // change dynamically the title

  if (debug) {
    console.log('thisMirrorId:', thisMirrorId/* , 'assignedMirror:', assignedMirror */);
    document.getElementById('idNumber').innerHTML = thisMirrorId;
  }

  const qrCodePath = '../images/' + wifiName + '/' + wifiName + '_qrcode_mirror-voice_' + thisMirrorId + '.png';


  if (debug) {
    console.log('loading qrcode', qrCodePath);
  }

  qrCodeImg = loadImage(qrCodePath);
  setupSocket();
}

function setup() {
  createCanvas(400, 600);
  rectMode(CENTER);
  angleMode(DEGREES);
}

function draw() {
  background(255);

  if (isActive && waveform) {
    fill(0);
    beginShape();
    strokeWeight(5);
    for (let i = 0; i < waveform.length; i++) {
      let x = map(i, 0, waveform.length, 0, width);
      let y = map(waveform[i], -1, 1, height, 0);
      vertex(x, y);
    }
    endShape();
  } else {
    image(qrCodeImg, width / 2 - qrCodeImg.width / 2, height / 2 - qrCodeImg.height / 2);
  }
}


function setupSocket() {
  // Events that we are listening for
  // Connect to Node.JS Server
  socket = io();
  socket.on("connect", () => {
    console.log('my socket.id: ', socket.id, 'sending', [false, thisMirrorId]);
    socket.emit("identification", [false, thisMirrorId]);
  });

  // Callback function on the event we disconnect
  socket.on("disconnect", () => {
    console.log(socket.id);
  });

  socket.on("activate", (_msg) => {
    isActive = _msg;
    console.log('mirror activation state: ', isActive);
  });

  socket.on("mirror", (input) => {
    if (input.assignedMirror == thisMirrorId) {
      waveform = input.waveform;
      if (debug) {
        console.log('waveform.length: ', input.waveform.length);
      }
    }
  });
}
