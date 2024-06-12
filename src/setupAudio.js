import PitchNode from "./PitchNode";

async function getWebAudioMediaStream() {
  if (!window.navigator.mediaDevices) {
    throw new Error(
      "This browser does not support web audio or it is not enabled"
    );
  }

  try {
    const result = await window.navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    return result;
  } catch (err) {
    switch (err.name) {
      case "NotAllowedError":
        throw new Error(
          "A recording device was found but the app does not have permission to access it."
        );
      case "NotFoundError":
        throw new Error("No recording device was found");
      default:
        throw err;
    }
  }
}

export async function setupAudio(onPitchDetected) {
  const mediaStream = await getWebAudioMediaStream();

  const context = new window.AudioContext();
  const audioSource = context.createMediaStreamSource(mediaStream);

  let node;

  try {
    const response = await window.fetch("wasm-audio/wasm_audio_bg.wasm");
    const wasmBytes = await response.arrayBuffer();

    const processorUrl = "PitchProcessor.js";

    try {
      await context.audioWorklet.addModule(processorUrl);
    } catch (pitchProcessorLoadErr) {
      throw new Error(
        `Failed to load pitch processor worklet from ${processorUrl}: ${pitchProcessorLoadErr.message} `
      );
    }

    node = new PitchNode(context, "PitchProcessor");

    const numAudioSamplesPerAnalysis = 1024;

    node.init(wasmBytes, onPitchDetected, numAudioSamplesPerAnalysis);

    audioSource.connect(node);

    node.connect(context.destination);
  } catch (wasmLoadErr) {
    throw new Error(
      `Failed to load audio analyzer WASM module: ${wasmLoadErr.message}`
    );
  }

  return { context, node };
}
