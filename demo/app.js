import signal from "../src";
import { WaveFile } from "wavefile";

const config = signal.config();
const modulator = signal.modulator(config);

const wav = new WaveFile();

wav.fromScratch(1, config.samplerate, config.bitrate, modulator.modulate([1, 0, 1, 1]));

document.querySelector("#audioSource").src = `data:audio/wav;base64,${wav.toBase64()}`;
document.querySelector("#audio").load();

