const config = require("../../src/config")();
const modulator = require("../../src/modulator")(config);
const demodulator = require("../../src/demodulator")(config);

describe("integration", function() {
	it("demodulator can demodulate output of modulator", function() {
		const bitArray = [
			1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1,
			0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1,
			0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0,
			1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0,
			0, 1, 1, 1, 1, 0
		];

		const waveform = modulator.modulate(bitArray);

		demodulator.demodulate(waveform).forEach((val, i) => {
			if(bitArray[i] != val) {
				throw new Error(`Miss ${val} != ${bitArray[i]}`);
			}
		});
	});
});
