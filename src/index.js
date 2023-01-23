const FFT = require("fft.js");
const WaveFile = require('wavefile').WaveFile;
const fs = require("fs");

const samplerate = 44100;
const bitrate = 32;

const tone = require("./tone")(samplerate, 2000, 0.7 * Math.pow(2, bitrate - 1));

const secondTone = tone(1000);

console.log(Math.max(...secondTone));

let wav = new WaveFile();
wav.fromScratch(1, samplerate, '32', secondTone);

fs.writeFileSync("./test.wav", wav.toBuffer());

const windowSize = 4096;

const fft = new FFT(windowSize);

const input = secondTone.slice(0, windowSize)

const data = fft.toComplexArray(input);

const out = new Array(windowSize);

fft.realTransform(out, data)

module.exports = {};

//console.log(out);

