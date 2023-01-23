const WaveFile = require('wavefile').WaveFile;
const fs = require("fs");

const tone = require("./tone");

const samplerate = 44100;
const bitrate = 32;

const baudrate = 10;
const duration = 1000 / baudrate;

const code = [
	tone(samplerate, 2200, 0.7 * Math.pow(2, bitrate - 1))(duration),
	tone(samplerate, 1200, 0.7 * Math.pow(2, bitrate - 1))(duration)
];

const random = Array(200)
	.fill(0)
	.map(() => Math.round(Math.random()))
	.map(val => code[val])
	.reduce((prev, cur) => prev.concat(cur));

let wav = new WaveFile();
wav.fromScratch(1, samplerate, bitrate, random);

fs.writeFileSync("./test.wav", wav.toBuffer());
