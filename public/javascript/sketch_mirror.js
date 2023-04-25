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
const socket = io();
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

function preload(){
  const myUrl = new URL(window.location.toLocaleString()).searchParams;
  console.log('myUrl', myUrl);
  const arg = myUrl.getAll('id');
  thisMirrorId = arg[0];
  console.log('thisMirrorId:', thisMirrorId/* , 'assignedMirror:', assignedMirror */);
  document.getElementById('idNumber').innerHTML = thisMirrorId;
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

function setHarm(_harm) {
  harmonicFactor = _harm;
  changeNote = true;
  console.log('received new harmonic factor:', harmonicFactor);
}

function setFreq(_freq) {
  if (_freq != currentFeq) {
    changeNote = true;
  }
  currentFeq = _freq;
  console.log('received new freq', _freq);
}

//Everything below here you could move to a three.js or other javascript sketch

function handlePermissionButtonPressed() {

  DeviceMotionEvent.requestPermission()
    .then(response => {
      // alert(response);//quick way to debug response result on mobile, you get a mini pop-up
      if (response === 'granted') {
        mobileDevice = true;
        window.addEventListener('devicemotion', deviceMotionHandler, true);
      }
    });

  DeviceOrientationEvent.requestPermission()
    .then(response => {
      if (response === 'granted') {
        mobileDevice = true;
        // alert(response);//quick way to debug response result on mobile, you get a mini pop-up
        window.addEventListener('deviceorientation', deviceTurnedHandler, true)
      }
    })
    .catch(console.error);
}


// https://developer.mozilla.org/en-US/docs/Web/API/Window/devicemotion_event
function deviceMotionHandler(event) {

  /*   accX = event.acceleration.x;
    accY = event.acceleration.y;
    accZ = event.acceleration.z;
  
    rrateZ = event.rotationRate.alpha;//alpha: rotation around z-axis
    rrateX = event.rotationRate.beta;//rotating about its X axis; that is, front to back */
  rrateY = event.rotationRate.gamma;//rotating about its Y axis: left to right

}

//https://developer.mozilla.org/en-US/docs/Web/API/Window/deviceorientation_event
function deviceTurnedHandler(event) {

  //degrees 0 - 365
  /*   rotateDegrees = event.alpha; // alpha: rotation around z-axis
    frontToBack = event.beta; // beta: front back motion */
  leftToRight = event.gamma; // gamma: left to right

}

function emit() {
  /*   let message = new OSC.Message("/test/values/mobileAccX");
    message.add(accX);
    osc.send(message); */

  socket.emit("data", {
    address: "/mobileData",
    args: [
      { // id
        type: "s",
        value: myId
      },
      { // freqCarrEnergy
        type: "f",
        value: mouseY / height
      },
      { // harm2Energy
        type: "f",
        value: harm2Energy
      },
      { // harm3Energy
        type: "f",
        value: harm3Energy
      }
    ]
  });

  /* // old message
  socket.emit("data", {
    myId: myId,
    freqCarrEnergy: freqCarrEnergy,
    harm2Energy: harm2Energy,
    harm3Energy: harm3Energy,
    mobileLeftToRight: leftToRight
  }); */

  //console.log("emitting");

}

//Events that we are listening for
// Connect to Node.JS Server
socket.on("connect", () => {
  console.log(socket.id);
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
  if(input.assignedMirror == thisMirrorId){
    waveform = input.waveform;
    //console.log(input);
  } else {
    //console.log('non è');
  }
  
  // drawWaveform();
});

/* function drawWaveform(_wavef) {
  beginShape();
  strokeWeight(5);
  for (let i = 0; i < _wavef.length; i++) {
    let x = map(i, 0, _wavef.length, 0, width);
    let y = map(_wavef[i], -1, 1, height, 0);
    vertex(x, y);
  }
  // console.log (waveform);
  endShape();
} */

socket.on("setFrequency", setFreq);

socket.on("setHarmonic", setHarm);



/*
// Callback function to recieve message from Node.JS
socket.on("data", (data) => {

   console.log(data);

  accX = data.mobileAccX;
  accY = data.mobileAccY;
  accZ = data.mobileAccZ;
  rrateX = data.mobileRrateX;
  rrateY = data.mobileRrateY;
  rrateZ = data.mobileRrateZ;
  rotateDegrees = data.mobileRotateDegrees;
  frontToBack = data.mobileFrontToBack;
  leftToRight = data.mobileLeftToRight; 

});*/
/* 

let osc, fft, mic;

// Create connection to Node.JS Server
const socket = io();
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

function setup() {
  createCanvas(400, 400);

  rectMode(CENTER);
  angleMode(DEGREES);
  
  //----------
  //the bit between the two comment lines could be move to a three.js sketch except you'd need to create a button there
  if(typeof DeviceMotionEvent.requestPermission === 'function' && typeof DeviceOrientationEvent.requestPermission === 'function'){
    // iOS 13+
    askButton = createButton('Permission');//p5 create button
    askButton.mousePressed(handlePermissionButtonPressed);//p5 listen to mousePressed event
  }else{
    //if there is a device that doesn't require permission
    window.addEventListener('devicemotion', deviceMotionHandler, true);
    window.addEventListener('deviceorientation', deviceTurnedHandler, true)
  }
  
  //----------

  

  // osc = new p5.TriOsc(); // set frequency and type
  osc = new p5.Oscillator(); // set frequency and type
  osc.amp(1.0);
  osc.freq(220);

  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT();
  fft.setInput(mic);

  osc.start();

}

function touchStarted(){
  userStartAudio();
}

function draw() {
  background(220);
  //fft.analyze();

  fill(0);
  circle(mouseX,mouseY,100);

  let waveform = fft.waveform(); // analyze the waveform
  beginShape();
  strokeWeight(5);
  for (let i = 0; i < waveform.length; i++) {
    let x = map(i, 0, waveform.length, 0, width);
    let y = map(waveform[i], -1, 1, height, 0);
    vertex(x, y);
  }
  endShape();

  // change oscillator frequency based on mouseX
  let freq = map(mouseX, 0, width, 40, 880);
  osc.freq(freq);

  let amp = map(mouseY, 0, height, 1, 0.01);
  osc.amp(amp);


  let totalMovement = Math.abs(accX)+Math.abs(accY)+Math.abs(accZ);//movement in any direction
  //set your own threshold for how sensitive you want this to be
  if(totalMovement > 2){
     background(255,0,0);
  }else{
     background(255);
  }
  
  //Creating a tilt sensor mechanic that has a sort of boolean logic (on or off)
  //if the phone is rotated front/back/left/right we will get an arrow point in that direction 
  push();
  translate(width/2,height/2);
 
  if(frontToBack > 40){
    push();
    rotate(-180);
    triangle(-30,-40,0,-100,30,-40);
    pop();
  }else if(frontToBack < 0){
    push();
    triangle(-30,-40,0,-100,30,-40);
    pop();
  }
  
  if(leftToRight > 20){
    push();
    rotate(90);
    triangle(-30,-40,0,-100,30,-40);
    pop();
  }else if(leftToRight < -20){
    push();
    rotate(-90);
    triangle(-30,-40,0,-100,30,-40);
    pop();
  }
  pop();
  
  //Debug text
  fill(0);
  textSize(15);
  
  text("acceleration: ",10,10);
  text(accX.toFixed(2) +", "+accY.toFixed(2)+", "+accZ.toFixed(2),10,40);

  text("rotation rate: ",10,80);
  text(rrateX.toFixed(2) +", "+rrateY.toFixed(2)+", "+rrateZ.toFixed(2),10,110);
  
  
  text("device orientation: ",10,150);
  text(rotateDegrees.toFixed(2) +", "+leftToRight.toFixed(2) +", "+frontToBack.toFixed(2),10,180);  
  
  if(mobileDevice) emit();
}



// https://developer.mozilla.org/en-US/docs/Web/API/Window/devicemotion_event
function deviceMotionHandler(event){
  
  accX = event.acceleration.x;
  accY = event.acceleration.y;
  accZ = event.acceleration.z;
  
  rrateZ = event.rotationRate.alpha;//alpha: rotation around z-axis
  rrateX = event.rotationRate.beta;//rotating about its X axis; that is, front to back
  rrateY = event.rotationRate.gamma;//rotating about its Y axis: left to right
  
}

//https://developer.mozilla.org/en-US/docs/Web/API/Window/deviceorientation_event
function deviceTurnedHandler(event){
  
  //degrees 0 - 365
  rotateDegrees = event.alpha; // alpha: rotation around z-axis
  frontToBack = event.beta; // beta: front back motion
  leftToRight = event.gamma; // gamma: left to right

}

function emit() {

    socket.emit("data", {
      mobileAccX: accX,
      mobileAccY: accY,
      mobileAccZ: accZ,
      mobileRrateX: rrateX,
      mobileRrateY: rrateY,
      mobileRrateZ: rrateZ,
      mobileRotateDegrees: rotateDegrees,
      mobileFrontToBack: frontToBack,
      mobileLeftToRight: leftToRight
    });
  
}

//Events that we are listening for
// Connect to Node.JS Server
socket.on("connect", () => {
  console.log(socket.id);
});

// Callback function on the event we disconnect
socket.on("disconnect", () => {
  console.log(socket.id);
});

// Callback function to recieve message from Node.JS
socket.on("data", (data) => {

  console.log(data);

  accX = data.mobileAccX;
  accY = data.mobileAccY;
  accZ = data.mobileAccZ;
  rrateX = data.mobileRrateX;
  rrateY = data.mobileRrateY;
  rrateZ = data.mobileRrateZ;
  rotateDegrees = data.mobileRotateDegrees;
  frontToBack = data.mobileFrontToBack;
  leftToRight = data.mobileLeftToRight;

}); */