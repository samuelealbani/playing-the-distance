const socket = io();

let mic;

let freqCarr = 440;
let tremoloFreq = 442;
let harm2freq = 660;
let harm3freq = 880;

let freqCarrEnergy;
let tremFreqEnergy;
let harm2Energy;
let harm3Energy;

let assignedMirror;

function setup() {
  createCanvas(500, 500);

  const myUrl = new URL(window.location.toLocaleString()).searchParams;
  console.log('myUrl', myUrl);
  const nMirror = myUrl.getAll('mirror');
  assignedMirror = nMirror[0];
  console.log('nMirror:', nMirror, 'assignedMirror:', assignedMirror);

  
  mic = new p5.AudioIn();
  mic.start();

  fft = new p5.FFT();
  fft.setInput(mic);
}

function touchStarted() {
  userStartAudio();

}

function draw(){
  background(100);
  fft.analyze();

  freqCarrEnergy = fft.getEnergy(freqCarr, freqCarr);
  harm2Energy = fft.getEnergy(harm2freq, harm2freq);
  harm3Energy = fft.getEnergy(harm3freq, harm3freq);

  fill(255, 0, 0);
  textSize(24)
  textAlign(LEFT, TOP);
  text(freqCarr + ' Hz: ' + freqCarrEnergy, 50, 50);
  text(harm2freq + ' Hz: ' + harm2Energy, 50, 80);
  text(harm3freq + ' Hz: ' + harm3Energy, 50, 110);

  const maxWidth = 100;
  const xVueMeters = 180;
  stroke(0);
  noFill();
  rect(xVueMeters, 50, maxWidth, 20);
  rect(xVueMeters, 80, maxWidth, 20);
  rect(xVueMeters, 110, maxWidth, 20);
  fill(0);

  rect(xVueMeters, 50, map(freqCarrEnergy, 0, 255, 0, maxWidth), 20);
  rect(xVueMeters, 80, map(harm2Energy, 0, 255, 0, maxWidth), 20);
  rect(xVueMeters, 110, map(harm3Energy, 0, 255, 0, maxWidth), 20);
  
  // emit();
  
  let waveform = fft.waveform(); // analyze the waveform
  beginShape();
  strokeWeight(5);
  for (let i = 0; i < waveform.length; i++) {
    let x = map(i, 0, waveform.length, 0, width);
    let y = map(waveform[i], -1, 1, height, 0);
    vertex(x, y);
  }

  
  // console.log('emitting');
  if(frameCount%10 === 0){
   ;
  }

  socket.emit("waveform", {
    assignedMirror: assignedMirror,
    waveform: waveform
  })
  // console.log (waveform);
  endShape();
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
        value: freqCarrEnergy
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