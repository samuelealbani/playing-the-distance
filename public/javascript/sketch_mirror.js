let wifiName = '1.118'; // sam-wifi // 1.118
let qrCodeImg;

let freqCarr = 440;
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

let isActive = false;
let isReceiving = false;
let disconnectedFrame = 0;

// Create connection to Node.JS Server
let socket; //  = io();
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

let waveform;

let thisMirrorId;

function preload() {
  const myUrl = new URL(window.location.toLocaleString()).searchParams;
  console.log('myUrl', myUrl);
  const arg = myUrl.getAll('id');
  thisMirrorId = arg[0];
  console.log('thisMirrorId:', thisMirrorId/* , 'assignedMirror:', assignedMirror */);
  document.getElementById('idNumber').innerHTML = thisMirrorId;


  let qrCodePath;

  // solo per docum
  if(thisMirrorId === '1'){
    qrCodePath = '../images/' + wifiName + '/' + wifiName + '_qrcode_note_' + thisMirrorId + '.png';
    console.log(qrCodePath);
  } else {
    qrCodePath = '../images/' + wifiName + '/' + wifiName + '_qrcode_mirror-voice_' + thisMirrorId + '.png';

  }

  console.log('loading qrcode', qrCodePath );

  qrCodeImg = loadImage(qrCodePath);


  setupSocket();

}

function setup() {
  createCanvas(400, 600);
  rectMode(CENTER);
  angleMode(DEGREES);



  /*   //----------
    //the bit between the two comment lines could be move to a three.js sketch except you'd need to create a button there
    if (typeof DeviceMotionEvent.requestPermission === 'function' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      // iOS 13+
      askButton = createButton('Permission');//p5 create button
      askButton.mousePressed(handlePermissionButtonPressed);//p5 listen to mousePressed event
    } else {
      //if there is a device that doesn't require permission
      window.addEventListener('devicemotion', deviceMotionHandler, true);
      window.addEventListener('deviceorientation', deviceTurnedHandler, true)
    }
  
    //----------
    oscillator = new p5.Oscillator(); // set frequency and type
    oscillator.amp(0.8);
    oscillator.freq(20);
  
    mic = new p5.AudioIn();
    mic.start();
    fft = new p5.FFT();
    fft.setInput(mic); */
}

/* function touchStarted() {
  if (!audioStarted) {
    userStartAudio();
    oscillator.start();
    audioStarted = true;
  }
} */

//we are using p5.js to visualise this movement data
function draw() {
  background(255);

  

  if ( isActive && waveform/* disconnectedFrame > 10  isReceiving  waveform */) {
    fill(0);
    beginShape();
    strokeWeight(5);
    for (let i = 0; i < waveform.length; i++) {
      let x = map(i, 0, waveform.length, 0, width);
      let y = map(waveform[i], -1, 1, height, 0);
      vertex(x, y);
    }
    // console.log (waveform);
    endShape();
  } else {
/*     fill(255, 0, 0);
    rect(0, 0, width, height/2); */

    image(qrCodeImg, width/2-qrCodeImg.width/2, height/2-qrCodeImg.height/2);
  }

  if(!isReceiving){
    disconnectedFrame++;
  }

  isReceiving = false;

}




function setupSocket() {
  //Events that we are listening for
  // Connect to Node.JS Server
  socket = io();
  socket.on("connect", () => {
    console.log('my socket.id: ', socket.id, 'sending', [false, thisMirrorId]);
    socket.emit("identification", [false, thisMirrorId]);
    // myId = socket.id;
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
    // console.log(input.assignedMirror);
    // console.log('receiving mirror', input.waveform);
    // console.log(input.assignedMirror === thisMirrorId);

    if (input.assignedMirror == thisMirrorId) {
      waveform = input.waveform;
      isReceiving = true;
      disconnectedFrame = 0;
      console.log(input.waveform.length);
    } else {
      //console.log('non è');
    }

    // drawWaveform();
  });


}
