const config = require("./config")();
const modulator = require("./modulator")(config);

const WaveFile = require('wavefile').WaveFile;
const fs = require("fs");

const randValues = [
	1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1,
	0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,
	0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0,
	1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0,
	0, 1, 1, 1, 1, 0
];

const random = modulator.modulate(randValues);

const wav = new WaveFile();
wav.fromScratch(1, config.samplerate, config.bitrate, random);

fs.writeFileSync("./samples/test.wav", wav.toBuffer());

// Demodulator

const FFT = require("fft.js");

const fftSize = 512;

const demodulate = (random) => {
	const fft = new FFT(fftSize);

	const out = fft.createComplexArray();

	const sweep = Array(random.length - fftSize).fill(0).map((_, pos) => {
		fft.realTransform(out, random.slice(pos, pos + fftSize));
		fft.completeSpectrum(out);

		const absOut = out.map(oute => Math.abs(oute));

		return absOut.slice(27, 31).reduce((prev, cur) => prev + cur, 0);
	});

	const swaps = [];

	const scale = 1 / sweep.reduce((prev, cur) => (cur > prev)?cur:prev, -Infinity);

	let prev = 0;
	let last = 0;

	let result = false;

	const booleans = sweep.map(i => {
		return Math.round(scale * i);
	});

	booleans.forEach((cur, i) => {
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

				const average = times.reduce((prev, cur) => prev + cur, 0) / times.length;

				const symbolTime = average / 2;

				const start = i + symbolTime;

				const signal = booleans.length - start;

				result = Array(50).fill(0).map((_, i) => {
					return booleans[Math.round(start + i * symbolTime + symbolTime / 2)];
				}).map(e => Math.round(e));
			}
		}

		prev = cur;
	});

	return result;
};

const data = fs.readFileSync("./sample/output_audio.wav");
const wav1 = new WaveFile(data).getSamples();

//demodulate(random).forEach((val, i) => {
demodulate(Array.from(wav1[0]).concat(wav1[1])).forEach((val, i) => {
	if(randValues[i] != val) {
		console.log(`Miss ${val} != ${randValues[i]}`);
	} else {
		console.log(`Hit ${val} == ${randValues[i]}`);
	}
});

