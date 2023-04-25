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

let assignedMirror;

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


// https://github.com/therewasaguy/p5-music-viz/blob/gh-pages/demos/04_fft_freq_spectrum/sketch.js
var binCount = 1024;
var bins = new Array(binCount);

let counter;


function setup() {
  createCanvas(400, 400);
  rectMode(CENTER);
  angleMode(DEGREES);

  const myUrl = new URL(window.location.toLocaleString()).searchParams;
  console.log('myUrl', myUrl);
  const nMirror = myUrl.getAll('mirror');
  assignedMirror = nMirror[0];
  console.log('nMirror:', nMirror, 'assignedMirror:', assignedMirror);

  //----------
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
  oscillator.amp(0.5);
  oscillator.freq(200);

  mic = new p5.AudioIn();
  mic.start();
  mic.disconnect();

  var smoothing = 0.6;
  fft = new p5.FFT(smoothing, binCount);
  for (var i = 0; i < binCount; i++) {
    bins[i] = new Bin(i, binCount);
  }
  // fft = new p5.FFT(0.8, 256);
  fft.setInput(mic);
}

function touchStarted() {
  if (!audioStarted) {
    userStartAudio();
    oscillator.start();
    audioStarted = true;
  }
}

//we are using p5.js to visualise this movement data
function draw() {
  background(255);
/*
  if (changeNote) {
    oscillator.freq(currentFeq * harmonicFactor);
    console.log('currentFeq', currentFeq);
    changeNote = false;
  }

  leftToRight = abs(leftToRight.toFixed(2));
  const amplitude = map(leftToRight, 0.0, 90.0, 0.9, 0.1);
  oscillator.amp(amplitude);

  fill(0);
  strokeWeight(2);
  textSize(15);
  text(leftToRight, 300, 40);
  text('harm: ' + harmonicFactor, 300, 80);
  text('' + currentFeq * harmonicFactor + ' Hz', 300, 120);
  text('mirr: ' + assignedMirror, 300, 160);

  // fft.analyze();
   var spectrum = fft.analyze();
  if (logView) {
    var prevPoint = 0;
    for (var i = 0; i < binCount; i++) {
      var previousValue = prevPoint;
      prevPoint = bins[i].drawLog(i, binCount, spectrum[i], previousValue);
    }
  }
  else {
    for (var i = 0; i < binCount; i++) {
      bins[i].drawLin(i, binCount, spectrum[i]);
    }
  }

  if (typeof selectedBin !== 'undefined') {
    labelStuff();
    osc.freq(selectedBin.freq);
  } */

  


/* 
  freqCarrEnergy = fft.getEnergy(freqCarr, freqCarr);
  tremFreqEnergy = fft.getEnergy(tremoloFreq, tremoloFreq);
  harm2Energy = fft.getEnergy(harm2freq, harm2freq);
  harm3Energy = fft.getEnergy(harm3freq, harm3freq);

  fill(255, 0, 0);
  textSize(24)
  textAlign(LEFT, TOP);
  text(frameCount + ' Hz: ' + freqCarrEnergy, 50, 50);
  text(tremoloFreq + ' Hz: ' + tremFreqEnergy, 50, 80);
  text(harm2freq + ' Hz: ' + harm2Energy, 50, 110);
  text(harm3freq + ' Hz: ' + harm3Energy, 50, 140);

  const maxWidth = 100;
  const xVueMeters = 180;
  stroke(0);
  noFill();
  rect(xVueMeters, 50, maxWidth, 20);
  rect(xVueMeters, 80, maxWidth, 20);
  rect(xVueMeters, 110, maxWidth, 20);
  rect(xVueMeters, 140, maxWidth, 20);
  fill(0);

  rect(xVueMeters, 50, map(freqCarrEnergy, 0, 255, 0, maxWidth), 20);
  rect(xVueMeters, 80, map(tremFreqEnergy, 0, 255, 0, maxWidth), 20);
  rect(xVueMeters, 110, map(harm2Energy, 0, 255, 0, maxWidth), 20);
  rect(xVueMeters, 140, map(harm3Energy, 0, 255, 0, maxWidth), 20);

 */

  /* if (mobileDevice)  emit();*/

/*   let waveform = fft.waveform(); // analyze the waveform
  beginShape();
  strokeWeight(5);
  for (let i = 0; i < waveform.length; i++) {
    let x = map(i, 0, waveform.length, 0, width);
    let y = map(waveform[i], -1, 1, height, 0);
    vertex(x, y);
  }

  
  // console.log('emitting');
  if(frameCount%10 === 0){
    socket.emit("waveform", {
      assignedMirror: assignedMirror,
      waveform: waveform
    });
  }
  // console.log (waveform);
  endShape(); */



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
    address: "/mobileData/" + assignedMirror,
    args: [
      { // id
        type: "s",
        value: myId
      },
      { // assignedMirror
        type: "i",
        value: assignedMirror
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
  myId = socket.id;

  socket.emit("identification", [true, myId]);
});

// Callback function on the event we disconnect
socket.on("disconnect", () => {
  console.log(socket.id);
});


socket.on("setFrequency", setFreq);

socket.on("setHarmonic", setHarm);


// ==========
// Bin Class
// ==========
var logView = true;
function toggleScale() {
  logView = !logView;
}
var Bin = function (index, totalBins) {
  // maybe redundant
  this.index = index;
  this.totalBins = totalBins;
  this.color = color(map(this.index, 0, this.totalBins, 0, 255), 255, 255);

  this.isTouching = false;
  this.x;
  this.width;
  this.value;
}

Bin.prototype.drawLog = function (i, totalBins, value, prev) {
  this.x = map(Math.log(i + 2), 0, Math.log(totalBins), 0, width - 200);
  var h = map(value, 0, 255, height, 0) - height;
  this.width = prev - this.x;
  this.value = value;
  this.draw(h);
  return this.x;
}

Bin.prototype.drawLin = function (i, totalBins, value) {
  this.x = map(i, 0, totalBins, 0, width - 200);
  this.width = -width / totalBins;
  this.value = value;
  var h = map(value, 0, 255, height, 0) - height;
  this.draw(h);
}

var selectedBin;

Bin.prototype.draw = function (h) {
  if (this.isTouching) {
    selectedBin = bins[this.index];
    this.freq = Math.round(this.index * 22050 / this.totalBins);
    fill(100)
  } else {
    fill(this.color);
  }
  rect(this.x, height, this.width, h);
}