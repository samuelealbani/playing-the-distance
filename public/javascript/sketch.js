let oscillator, fft, audioStarted;
let mic;
let harmonicFactor;
let changeNote = false;

let socket;

function preload(){
  
}

function setup() {
  createCanvas(400, 400);
  rectMode(CENTER);
  angleMode(DEGREES);

  /// audio
  oscillator = new p5.Oscillator(); // set frequency and type
  oscillator.setType('sine');
  oscillator.amp(1.0);
  oscillator.freq(400);

  // mic = new p5.AudioIn();
  // mic.start();
  // mic.disconnect();

  mic = new p5.AudioIn();
  mic.disconnect();

  fft = new p5.FFT();

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

  socket = io();
}

function draw() {
  background(105);

  if (getAudioContext().state !== 'running') {
    text('click to start audio', width / 2, height / 2);
  } else {
    text('audio is enabled', width / 2, height / 2);
  }

}

function touchStarted() {
  if (!audioStarted) {
    getAudioContext().resume();
    userStartAudio();
    oscillator.start();
    audioStarted = true;
  }

}

function emit() {
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

  rrateY = event.rotationRate.gamma;//rotating about its Y axis: left to right

}

//https://developer.mozilla.org/en-US/docs/Web/API/Window/deviceorientation_event
function deviceTurnedHandler(event) {
  //degrees 0 - 365
  leftToRight = event.gamma; // gamma: left to right
}


/* let mic;

let oscillator;

function setup() {
  let cnv = createCanvas(100, 100);
  getAudioContext().suspend();

  // cnv.mousePressed(userStartAudio);
  mic = new p5.AudioIn();
  // mic.start();
  // mic.disconnect();

  oscillator = new p5.Oscillator(); // set frequency and type
  oscillator.amp(0.5);
  oscillator.freq(200);
  oscillator.start();
  textAlign(CENTER);

 // mic = new p5.AudioIn();

}

function draw() {
  background(0);
  fill(255);
  text('tap to start', width / 2, 20);

  micLevel = mic.getLevel();
  let y = height - micLevel * height;
  ellipse(width / 2, y, 10, 10);
}

function mousePressed() {
  userStartAudio();
} */