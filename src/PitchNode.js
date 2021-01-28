export default class PitchNode extends AudioWorkletNode {
  init(wasmBytes, onPitchDetected, numAudioSamplesPerAnalysis) {
    this.onPitchDetected = onPitchDetected;
    this.numAudioSamplesPerAnalysis = numAudioSamplesPerAnalysis;

    this.port.onmessage = (event) => this.onmessage(event.data);

    this.port.postMessage({ type: "send-wasm-module", wasmBytes });
  }

  onprocessorerror(err) {
    console.log(`Error from AudioWorklet.process(): ${err}`);
  }

  onmessage(event) {
    if (event.type === "wasm-module-loaded") {
      this.port.postMessage({
        type: "init-detector",
        sampleRate: this.context.sampleRate,
        numAudioSamplesPerAnalysis: this.numAudioSamplesPerAnalysis,
      });
    } else if (event.type === "pitch") {
      this.onPitchDetected(event.pitch);
    }
  }
}
