module.exports = (samplerate, freq, volume) => {
	return (duration) => {
		const resultSize = (duration / 1000) * samplerate;

		const result = new Array(Math.round(resultSize))
			.fill(0)
			.map((_, pos) => {
				return volume * Math.sin(pos / samplerate * (2 * Math.PI) * freq);
			});

		return result;
	};
};
