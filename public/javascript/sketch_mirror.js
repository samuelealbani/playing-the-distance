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

  

  setupSocket();

}

function setup() {
  createCanvas(400, 400);
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

  if (waveform) {
    beginShape();
    strokeWeight(5);
    for (let i = 0; i < waveform.length; i++) {
      let x = map(i, 0, waveform.length, 0, width);
      let y = map(waveform[i], -1, 1, height, 0);
      vertex(x, y);
    }
    // console.log (waveform);
    endShape();
  }


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


  socket.on("mirror", (input) => {
    // console.log('receiving mirror', input.waveform);
    // console.log(input.assignedMirror === thisMirrorId);
    waveform = input.waveform;
/*     if (input.assignedMirror == thisMirrorId) {
      
    } else {
      //console.log('non è');
    } */

    // drawWaveform();
  });


}
