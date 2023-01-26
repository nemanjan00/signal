import { WaveFile } from "wavefile";

import { MediaRecorder, register } from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';

import signal from "../src";

const config = signal.config();
const modulator = signal.modulator(config);
const demodulator = signal.demodulator(config);

const wav = new WaveFile();

wav.fromScratch(1, config.samplerate, config.bitrate, modulator.modulate([1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0]));

console.log(demodulator.demodulate(wav.getSamples()));

const source = document.querySelector("#audioSource");
const player = document.querySelector("#audio");
const log = document.querySelector("#log");

source.src = `data:audio/wav;base64,${wav.toBase64()}`;
player.load();

const handleSuccess = async function (stream) {
	await register(await connect());

	const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/wav' });

	let first = true;

	let header = undefined;

	const config = signal.config();
	config.samplerate = 48000;
	const demodulator = signal.demodulator(config);

	mediaRecorder.ondataavailable = async (e) => {
		let data = await e.data.arrayBuffer();
		if(first) {
			first = false;

			header = new Uint8Array(data.slice(0, 44));

			data = data.slice(44);
		}

		data = new Uint8Array(data);

		const wav = new WaveFile();

		const mergedArray = new Uint8Array(header.length + data.length);

		mergedArray.set(header);
		mergedArray.set(data, header.length);

		wav.fromBuffer(mergedArray);

		//console.log(wav);

		const demodulated = demodulator.demodulate(wav.getSamples());

		if(demodulated) {
			log.innerText = log.innerText + `\n${JSON.stringify(demodulated)}`;
		}
	};

	mediaRecorder.start(5 * 1000);
};

navigator.mediaDevices
	.getUserMedia({audio: true, video: false})
	.then(handleSuccess);
