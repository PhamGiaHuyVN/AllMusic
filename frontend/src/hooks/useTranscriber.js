import { useCallback, useRef, useState } from 'react';
import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;
if (env.backends?.onnx?.wasm) {
  env.backends.onnx.wasm.proxy = false;
  env.backends.onnx.wasm.numThreads = 1;
}

let transcriberPromise = null;

function getTranscriber(onProgress) {
  if (!transcriberPromise) {
    transcriberPromise = pipeline(
      'automatic-speech-recognition',
      'Xenova/whisper-tiny',
      {
        quantized: true,
        progress_callback: onProgress,
      }
    );
  }
  return transcriberPromise;
}

export function useTranscriber() {
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const busyRef = useRef(false);

  const transcribe = useCallback(async (audio, language) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setError('');
    setResult(null);
    setStatus('loading');

    try {
      const transcriber = await getTranscriber((data) => {
        if (data?.status === 'progress') {
          setProgress({
            file: data.file,
            progress: Math.round(data.progress ?? 0),
          });
        }
      });

      setStatus('transcribing');
      setProgress(null);

      const options = {
        task: 'transcribe',
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: true,
      };
      if (language && language !== 'auto') {
        options.language = language;
      }

      const output = await transcriber(audio, options);
      setResult(output);
      setStatus('done');
    } catch (err) {
      setError(err?.message || 'Không thể chuyển giọng nói thành văn bản');
      setStatus('error');
    } finally {
      busyRef.current = false;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(null);
    setResult(null);
    setError('');
  }, []);

  return { status, progress, result, error, transcribe, reset };
}
