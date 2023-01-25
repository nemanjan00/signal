const tone = require("../tone");

module.exports = (config) => {
	const symbolDuration = config.getSymbolDuration();

	const preamble = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1];

	const code = [
		tone(config.samplerate, 2200, config.volume * Math.pow(2, config.bitrate - 1))(symbolDuration),
		tone(config.samplerate, 1200, config.volume * Math.pow(2, config.bitrate - 1))(symbolDuration)
	];

	const modulator = {
		modulate: (bitArray, withOutPreamble) => {
			withOutPreamble = withOutPreamble || false;

			if(!withOutPreamble) {
				bitArray = preamble.concat(bitArray);
			}

			const waveform = bitArray
				.map(val => code[val])
				.reduce((prev, cur) => prev.concat(cur), []).map(amplitude => {
					return amplitude;
				});

			return waveform;
		}
	};

	return modulator;
};

