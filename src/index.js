const FFT = require("fft.js");

const WaveFile = require('wavefile').WaveFile;
const fs = require("fs");

const tone = require("./tone");

const samplerate = 44100;
const bitrate = 32;

const baudrate = 10;
const duration = 1000 / baudrate;

const fftSize = 512;

const code = [
	tone(samplerate, 2200, 0.7 * Math.pow(2, bitrate - 1))(duration),
	tone(samplerate, 1200, 0.7 * Math.pow(2, bitrate - 1))(duration)
];

const randValues = Array(50)
	.fill(0)
	.map(() => Math.round(Math.random()));

const random = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1].concat(randValues)
	.map(val => code[val])
	.reduce((prev, cur) => prev.concat(cur), []);

const wav = new WaveFile();
wav.fromScratch(1, samplerate, bitrate, random);

fs.writeFileSync("./test.wav", wav.toBuffer());

const demodulate = (random) => {
	const fft = new FFT(fftSize);

	const out = fft.createComplexArray();

	const out1 = Array(random.length - fftSize).fill(0).map((_, pos) => {
		fft.realTransform(out, random.slice(pos, pos + fftSize));
		fft.completeSpectrum(out);

		const absOut = out.map(oute => Math.abs(oute));

		return absOut.slice(27, 31).reduce((prev, cur) => prev + cur, 0);
	});

	const swaps = [];

	const scale = 1 / out1.reduce((prev, cur) => (cur > prev)?cur:prev, -Infinity);

	let prev = 0;
	let last = 0;

	let result = false;

	out1.map(i => {
		return Math.round(scale * i);
	}).forEach((cur, i) => {
		if(result != false) {
			return;
		}

		if(prev != cur) {
			if(i - last < 500) {
				return;
			}

			last = i;
		}

		if(prev != cur && cur === 1) {
			swaps.push(i);

			if(swaps.length === 6) {
				let prev = swaps[0];

				const times = swaps.slice(1).map(el => {
					const res = el - prev;

					prev = el;

					return res;
				});

				const average = times.slice(1).reduce((prev, cur) => prev + cur, 0) / (times.length - 1);

				const symbolTime = average / 2;

				const start = i + average;

				const signal = out1.length - start + symbolTime;

				result = Array(Math.ceil(signal / symbolTime)).fill(0).map((_, i) => {
					return out1[start + i * symbolTime - symbolTime / 2] * scale;
				}).map(e => Math.round(e));
			}
		}

		prev = cur;
	});

	return result;
};

console.log(demodulate(random).join(" ") == randValues.join(" "));
