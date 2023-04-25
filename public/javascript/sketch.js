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

let song;


function preload(){
  song = loadSound('/audio/440.mp3');

}

function setup(){
  createCanvas(400, 400);

  mic = new p5.AudioIn();
  mic.start();/* 
  mic.disconnect(); */

  fft = new p5.FFT();
  fft.setInput(mic);



  song.play();
  song.loop();


}


function draw() {


}

function touchStarted() {
  if (!audioStarted) {
    userStartAudio();
    song.play();
    audioStarted = true;
    console.log("hello");
  }
}