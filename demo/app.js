import signal from "../src";
import { WaveFile } from "wavefile";

const config = signal.config();
const modulator = signal.modulator(config);

const wav = new WaveFile();

wav.fromScratch(1, config.samplerate, config.bitrate, modulator.modulate([1, 0, 1, 1]));

const source = document.querySelector("#audioSource");
const player = document.querySelector("#audio");

source.src = `data:audio/wav;base64,${wav.toBase64()}`;
player.load();

const handleSuccess = function (stream) {
	const context = new AudioContext();
	const audioSource = context.createMediaStreamSource(stream);

	const analyser = context.createAnalyser();
	analyser.fftSize = 512;
	analyser.smoothingTimeConstant = 0

	const bufferLength = analyser.frequencyBinCount;
	const dataArray = new Uint8Array(bufferLength);
	analyser.getByteTimeDomainData(dataArray);

	const process = () => {
		setTimeout(() => {
			analyser.getByteFrequencyData(dataArray);
			console.log(dataArray[12]);
			console.log(dataArray[13]);

			process();
		});
	};

	process();

	audioSource.connect(analyser);
};

navigator.mediaDevices
	.getUserMedia({audio: true, video: false})
	.then(handleSuccess);
