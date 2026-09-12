const TARGET_SAMPLE_RATE = 16000;

function mixToMono(audioBuffer) {
  if (audioBuffer.numberOfChannels === 1) {
    return audioBuffer.getChannelData(0);
  }

  const length = audioBuffer.length;
  const mixed = new Float32Array(length);
  const channelCount = audioBuffer.numberOfChannels;

  for (let c = 0; c < channelCount; c++) {
    const channel = audioBuffer.getChannelData(c);
    for (let i = 0; i < length; i++) {
      mixed[i] += channel[i] / channelCount;
    }
  }

  return mixed;
}

export async function decodeAudioToMono16k(fileOrBlob) {
  const arrayBuffer = await fileOrBlob.arrayBuffer();
  const audioCtx = new AudioContext({ sampleRate: TARGET_SAMPLE_RATE });

  try {
    const decoded = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
    const samples = mixToMono(decoded);
    return {
      audio: samples,
      duration: samples.length / TARGET_SAMPLE_RATE,
    };
  } finally {
    await audioCtx.close();
  }
}

export function pickRecorderMimeType() {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  return types.find((type) => window.MediaRecorder?.isTypeSupported(type)) || '';
}
