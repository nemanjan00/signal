const FFT = require("fft.js");

const WaveFile = require('wavefile').WaveFile;
const fs = require("fs");

const tone = require("./tone");

const samplerate = 44100;
const bitrate = 32;

const baudrate = 10;
const duration = 1000 / baudrate;

const fftSize = 2048;

const code = [
	tone(samplerate, 2200, 0.7 * Math.pow(2, bitrate - 1))(duration),
	tone(samplerate, 1200, 0.7 * Math.pow(2, bitrate - 1))(duration)
];

const random = Array(20)
	.fill(0)
	.map(() => Math.round(Math.random()))
	.map(val => code[val])
	.reduce((prev, cur) => prev.concat(cur));

const wav = new WaveFile();
wav.fromScratch(1, samplerate, bitrate, random);

fs.writeFileSync("./test.wav", wav.toBuffer());

const fft = new FFT(fftSize);

const out = fft.createComplexArray();

const out1 = Array(random.length - fftSize).fill(0).map((_, pos) => {
	fft.realTransform(out, random.slice(pos, pos + fftSize));

	return out[204]
});

const scale = Math.pow(2, bitrate - 1) / Math.max(...out1);

const wav1 = new WaveFile();
wav1.fromScratch(1, samplerate, bitrate, out1.map(i => i * scale));

fs.writeFileSync("./test1.wav", wav1.toBuffer());

//process.exit(0);
