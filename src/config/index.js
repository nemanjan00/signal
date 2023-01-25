module.exports = () => {
	const config = {
		samplerate: 44100,
		bitrate: 16,
		baudrate: 20,
		volume: 0.7,
		getSymbolDuration: () => 1000 / config.baudrate,
		fftSize: 512
	};

	return config;
};
