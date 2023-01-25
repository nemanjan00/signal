const FFT = require("fft.js");

module.exports = (config) => {
	const demodulator = {
		demodulate: (waveform) => {
			const fft = new FFT(config.fftSize);

			const out = fft.createComplexArray();

			const sweep = Array(waveform.length - config.fftSize).fill(0).map((_, pos) => {
				fft.realTransform(out, waveform.slice(pos, pos + config.fftSize));
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

						result = Array(Math.round(signal / symbolTime)).fill(0).map((_, i) => {
							return booleans[Math.round(start + i * symbolTime + symbolTime / 2)];
						}).map(e => Math.round(e));
					}
				}

				prev = cur;
			});

			return result;
		}
	};

	return demodulator
};