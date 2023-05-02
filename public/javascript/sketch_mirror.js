let wifiName = 'sam-wifi'; // sam-wifi // 1.118
let qrCodeImg;
let debug = false;

/* let freqCarr = 440;
let tremoloFreq = 442;
let harm2freq = 660;
let harm3freq = 880;

let freqCarrEnergy;
let tremFreqEnergy;
let harm2Energy;
let harm3Energy; 

let harmonicFactor;

let oscillator, mic, fft;

let currentFeq = 440;

let audioStarted = false;
let changeNote = false;

let disconnectedFrame = 0;

//global variables
let askButton;

// device motion
let accX = 0;
let accY = 0;
let accZ = 0;
let rrateX = 0;
let rrateY = 0;
let rrateZ = 0;

// device orientation
let rotateDegrees = 0;
let frontToBack = 0;
let leftToRight = 0;

let mobileDevice = false;

*/

let isActive = false;
let isReceiving = false;

// Create connection to Node.JS Server
let socket; 

let waveform;

let thisMirrorId;

function preload() {
  const myUrl = new URL(window.location.toLocaleString()).searchParams;
  console.log('myUrl', myUrl);
  const arg = myUrl.getAll('id');
  thisMirrorId = arg[0];
  document.title = 'Mirror ' + thisMirrorId;

  if(debug){
    console.log('thisMirrorId:', thisMirrorId/* , 'assignedMirror:', assignedMirror */);
    document.getElementById('idNumber').innerHTML = thisMirrorId;
  }

  let qrCodePath;

  // !!!!solo per docum test with android
  if(thisMirrorId === '1'){
    qrCodePath = '../images/' + wifiName + '/' + wifiName + '_qrcode_note_' + thisMirrorId + '.png';
    console.log(qrCodePath);
  } else {
    qrCodePath = '../images/' + wifiName + '/' + wifiName + '_qrcode_mirror-voice_' + thisMirrorId + '.png';

  }

  if(debug) {
    console.log('loading qrcode', qrCodePath );
  }

  qrCodeImg = loadImage(qrCodePath);

  setupSocket();
}

function setup() {
  createCanvas(400, 600);
  rectMode(CENTER);
  angleMode(DEGREES);
}



//we are using p5.js to visualise this movement data
function draw() {
  background(255);

  if ( isActive && waveform ) {
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
    image(qrCodeImg, width/2-qrCodeImg.width/2, height/2-qrCodeImg.height/2);
  }

/*   if(!isReceiving){
    disconnectedFrame++;
  } */

  isReceiving = false;
}


function setupSocket() {
  //Events that we are listening for
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
    console.log('mirror activation state: ', isActive );
  });

  socket.on("mirror", (input) => {
    if (input.assignedMirror == thisMirrorId) {
      waveform = input.waveform;
      isReceiving = true;
      //disconnectedFrame = 0;
      console.log(input.waveform.length);
    } else {

    }
  });
}
