const config = require("./config")();
const modulator = require("./modulator")(config);
const demodulator = require("./demodulator")(config);

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
		console.log(`Miss ${val} != ${bitArray[i]}`);
	} else {
		console.log(`Hit ${val} == ${bitArray[i]}`);
	}
});
