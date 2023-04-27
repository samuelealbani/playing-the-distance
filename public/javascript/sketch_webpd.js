const myUrl = new URL(window.location.toLocaleString()).searchParams;
console.log('myUrl', myUrl);
const nMirror = myUrl.getAll('mirror');
let assignedMirror = nMirror[0];
console.log('nMirror:', nMirror, 'assignedMirror:', assignedMirror);


const socket = io();
/* ------------ */

const loadingDiv = document.querySelector('#loading')
const startButton = document.querySelector('#start')
const audioContext = new AudioContext()

let patch = null
let stream = null
let webpdNode = null

const initApp = async () => {
  // Register the worklet
  await WebPdRuntime.registerWebPdWorkletNode(audioContext)

  // Fetch the patch code
  response = await fetch('webassembly/patch.wasm')
  patch = await response.arrayBuffer()

  // Get audio input
  stream = await navigator.mediaDevices.getUserMedia({ audio: true })

  // Hide loading and show start button
  loadingDiv.style.display = 'none'
  startButton.style.display = 'block'
}

const startApp = async () => {
  // AudioContext needs to be resumed on click to protects users 
  // from being spammed with autoplay.
  // See : https://github.com/WebAudio/web-audio-api/issues/345
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }

  // Setup web audio graph
  const sourceNode = audioContext.createMediaStreamSource(stream)
  webpdNode = new WebPdRuntime.WebPdWorkletNode(audioContext)
  sourceNode.connect(webpdNode)
  webpdNode.connect(audioContext.destination)

  // Setup filesystem management
  webpdNode.port.onmessage = (message) => WebPdRuntime.fs.web(webpdNode, message)

  // Send code to the worklet

  webpdNode.port.postMessage({
    type: 'code:WASM',
    payload: {
      wasmBuffer: patch,
    },
  })




  // Hide the start button
  startButton.style.display = 'none'

}

startButton.onclick = startApp

initApp().
  then(() => {
    // set initial freq
    console.log('App initialized')
  })


// You can then use this function to interact with your patch
// e.g. :
// sendMsgToWebPd('n_0_1', '0', ['bang'])
// sendMsgToWebPd('n_0_2', '0', [123])
const sendMsgToWebPd = (nodeId, portletId, message) => {
  webpdNode.port.postMessage({
    type: 'inletCaller',
    payload: {
      nodeId,
      portletId,
      message,
    },
  })
}

// For info, compilation has opened the following ports in your patch.
// You can send messages to them :
//     - Node of type "floatatom", nodeId "n_0_3", portletId "0"
//     - Node of type "floatatom", nodeId "n_0_4", portletId "0"

/* ------------ */


let mic;

let harmonicFactor, harmonicsArray;

let freqCarr;
let tremoloFreq = 442;
let harm2freq = 660;
let harm3freq = 880;

let freqCarrEnergy;
let tremFreqEnergy;
let harm2Energy;
let harm3Energy;

let currentFreq;

let volumes = [];
/* let assignedMirror; */

let started = false;


function test() {
  sendMsgToWebPd('n_0_1', '0', [freqCarr * harmonicFactor]);
  sendMsgToWebPd('n_0_2', '0', [0.3]);
}

function setNewFreq() {
  sendMsgToWebPd('n_0_1', '0', [freqCarr * harmonicFactor]);
}

function setNewAmp() {
  sendMsgToWebPd('n_0_2', '0', [0.9]);
}

function setup() {
  createCanvas(500, 500);



  /*  const myUrl = new URL(window.location.toLocaleString()).searchParams;
   console.log('myUrl', myUrl);
   const nMirror = myUrl.getAll('mirror');
   assignedMirror = nMirror[0];
   console.log('nMirror:', nMirror, 'assignedMirror:', assignedMirror); */

  harmonicFactor


  mic = new p5.AudioIn();
  mic.start();

  fft = new p5.FFT();
  fft.setInput(mic);
}

function touchStarted() {
  userStartAudio();
  setNewFreq();
    setNewAmp();
    /* if (!started) {
      setNewFreq();
      setNewAmp();
      // test();
      started = true;
    } else {
      setNewFreq();
    } */


}

function draw() {
  /*   if (changeNote) {
      currentFreq = freqCarr * harmonicFactor;
      
      changeNote = false;
    } */


  background(100);
  fft.analyze();

  for (let i = 0; i < 5; i++) {
    volumes[i] = fft.getEnergy(freqCarr * harmonicsArray[i]);
  }

  /*   freqCarrEnergy = fft.getEnergy(freqCarr, freqCarr);
    harm2Energy = fft.getEnergy(harm2freq, harm2freq);
    harm3Energy = fft.getEnergy(harm3freq, harm3freq); */


  const initY = 50;
  const offsetY = 30;

  const maxWidth = 100;
  const xVueMeters = 180;

  for (let i = 0; i < 5; i++) {
    const y = initY + offsetY * i
    fill(255, 0, 0);
    textSize(24)
    textAlign(LEFT, TOP);
    text(freqCarr * harmonicsArray[i] + ' Hz: ' + volumes[i], 50, y);
    stroke(0);
    noFill();
    rect(xVueMeters, y, maxWidth, 20);
    fill(0);
    rect(xVueMeters, y, map(volumes[i], 0, 255, 0, maxWidth), 20);
  }

  textSize(160)
  textAlign(LEFT, TOP);
  text(assignedMirror, width / 2, height / 2 + 100);

  /*   text(freqCarr + ' Hz: ' + freqCarrEnergy, 50, 50);
    text(harm2freq + ' Hz: ' + harm2Energy, 50, 80);
    text(harm3freq + ' Hz: ' + harm3Energy, 50, 110); */



/*   rect(xVueMeters, 80, maxWidth, 20);
  rect(xVueMeters, 110, maxWidth, 20);
  fill(0);

  
  rect(xVueMeters, 80, map(harm2Energy, 0, 255, 0, maxWidth), 20);
  rect(xVueMeters, 110, map(harm3Energy, 0, 255, 0, maxWidth), 20);

  textSize(160)
  textAlign(LEFT, TOP);
  text(assignedMirror, width / 2, height / 2 + 100);

 */
  emit();

  let waveform = fft.waveform(); // analyze the waveform

  let reduced = [];
  beginShape();
  strokeWeight(5);
  for (let i = 0; i < waveform.length; i += 16) {
    let x = map(i, 0, waveform.length, 0, width);
    let y = map(waveform[i], -1, 1, height, 0);
    vertex(x, y);
    reduced.push(waveform[i]);
  }

  // fconsole.log('waveform.length', waveform.length, 'reduced.length', reduced.length);
  /*   for (let i = 0; i < waveform.length; i++) {
      let x = map(i, 0, waveform.length, 0, width);
      let y = map(waveform[i], -1, 1, height, 0);
      vertex(x, y);
    } */


  // console.log('emitting');
  if (frameCount % 10 === 0) {
    ;
  }

  socket.emit("waveform", {
    assignedMirror: assignedMirror,
    waveform: /* waveform */ reduced
  })
  // console.log (waveform);
  endShape();
}

function emit() {
  /*   let message = new OSC.Message("/test/values/mobileAccX");
    message.add(accX);
    osc.send(message); */

    /* let arrayValObj = [];
    arrayValObj.push({ // id
      type: "s",
      value: myId
    });

    console.log()

    for(let i = 0; i < 5; i++){
      arrayValObj.push({
        type: "f",
        value: volumes[i]
      })
    } */

    // console.log(arrayValObj);

  socket.emit("data", {
    address: "/mobileData/" + assignedMirror,
    args: [myId,assignedMirror,volumes[0], volumes[1],volumes[2],volumes[3],volumes[4]  ]
    /* 
    [
      { // id
        type: "s",
        value: myId
      },
      { // assignedMirror
        type: "f",
        value: assignedMirror
      },
      { 
        type: "f",
        value: volumes[0]
      },
      { 
        type: "f",
        value: volumes[1]
      },
      { 
        type: "f",
        value: volumes[2]
      },
      { 
        type: "f",
        value: volumes[3]
      },
      { 
        type: "f",
        value: volumes[4]
      }
    ]  */
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
  console.log(socket.id, 'assignedMirror: ', assignedMirror);
  myId = socket.id;


  socket.emit("identification", [true, myId, assignedMirror]);
  
});

// Callback function on the event we disconnect
socket.on("disconnect", () => {
  console.log(socket.id);
});


socket.on("setFrequency", setFreq);

function setFreq(arg) {
  freqCarr = arg;
  // changeNote = true;
  console.log('received carrier frequency', freqCarr);
}

socket.on("setHarmonic", setHarm);
function setHarm(_harm) {
  harmonicsArray = _harm
  harmonicFactor = harmonicsArray[assignedMirror];
  // changeNote = true;
  console.log('received new harmonic factor:', _harm, harmonicFactor);
}

