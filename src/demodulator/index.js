const FFT = require("fft.js");

module.exports = (config) => {
	const demodulator = {
		demodulate: (waveform) => {
			const fft = new FFT(config.fftSize);

			const out = fft.createComplexArray();

			const maxes = {};

			const sweep = Array(waveform.length - config.fftSize).fill(0).map((_, pos) => {
				fft.realTransform(out, waveform.slice(pos, pos + config.fftSize));
				fft.completeSpectrum(out);

				const absOut = out.map(oute => Math.abs(oute));

				const max = absOut.indexOf(Math.max(...absOut));

				maxes[max] = (maxes[max] || 0) + 1;

				return absOut.slice(26, 28).reduce((prev, cur) => prev + cur, 0);
			});

			//console.log(maxes);

			//console.log(Object.keys(maxes).sort((a, b) => {
				//if(maxes[a] > maxes[b]) {
					//return 1;
				//}

				//if(maxes[a] < maxes[b]) {
					//return -1;
				//}

				//return 0;
			//}));

			const swaps = [];

			const scale = 1 / sweep.reduce((prev, cur) => (cur > prev)?cur:prev, -Infinity);

			let prev = 0;
			let last = 0;

			let result = false;
			let miss = false;

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

						//console.log("times", times);

						const average = times.reduce((prev, cur) => prev + cur, 0) / times.length;

						const symbolTime = average / 2;

						miss = Math.abs(symbolTime - (config.getSymbolDuration() / 1000 * config.samplerate));

						//console.log(symbolTime, config.getSymbolDuration() / 1000 * config.samplerate);

						const start = i + symbolTime;

						const signal = booleans.length - start;

						result = Array(Math.round(signal / symbolTime)).fill(0).map((_, i) => {
							return booleans[Math.round(start + i * symbolTime + symbolTime / 2)];
						}).map(e => Math.round(e));
					}
				}

				prev = cur;
			});

			if(miss > 100) {
				return false;
			}

			return result;
		}
	};

	return demodulator
};
