import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square, Upload } from 'lucide-react';
import { decodeAudioToMono16k, pickRecorderMimeType } from '../lib/audio';

const SAMPLE_AUDIO_URL =
  'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/jfk.wav';

function AudioInput({ disabled, onAudioReady }) {
  const [language, setLanguage] = useState('vietnamese');
  const [isRecording, setIsRecording] = useState(false);
  const [fileName, setFileName] = useState('');
  const [localError, setLocalError] = useState('');
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const emitAudio = async (blob, sourceName) => {
    const { audio, duration } = await decodeAudioToMono16k(blob);
    onAudioReady({ audio, duration, sourceName, language });
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLocalError('');
    setFileName(file.name);
    try {
      await emitAudio(file, file.name);
    } catch (err) {
      setLocalError(err.message || 'Không đọc được file âm thanh');
    }
  };

  const startRecording = async () => {
    setLocalError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickRecorderMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        setFileName('Ghi âm');
        try {
          await emitAudio(blob, 'Ghi âm');
        } catch (err) {
          setLocalError(err.message || 'Không xử lý được bản ghi âm');
        }
      };
      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      setLocalError('Không truy cập được micro. Hãy cấp quyền microphone.');
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleSample = () => {
    setLocalError('');
    setFileName('Audio mẫu (tiếng Anh)');
    onAudioReady({
      audio: SAMPLE_AUDIO_URL,
      duration: null,
      sourceName: 'Audio mẫu (tiếng Anh)',
      language: 'english',
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Chuyển âm thanh thành văn bản</h2>
      <p className="text-sm text-gray-500">
        Chạy mô hình Whisper (Xenova/whisper-tiny) ngay trên trình duyệt. Lần đầu sẽ tải model về máy.
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ngôn ngữ</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="auto">Tự nhận diện</option>
          <option value="vietnamese">Tiếng Việt</option>
          <option value="english">Tiếng Anh</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tải file audio</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm"
          disabled={disabled || isRecording}
          onChange={handleFile}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {fileName && <p className="mt-2 text-sm text-gray-600">Đã chọn: {fileName}</p>}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        {!isRecording ? (
          <button
            type="button"
            disabled={disabled}
            onClick={startRecording}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2.5 rounded-lg transition"
          >
            <Mic className="w-5 h-5" />
            Ghi âm
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-lg transition"
          >
            <Square className="w-5 h-5" />
            Dừng ghi
          </button>
        )}

        <button
          type="button"
          disabled={disabled || isRecording}
          onClick={handleSample}
          className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 text-gray-800 font-medium py-2.5 rounded-lg transition"
        >
          <Upload className="w-5 h-5" />
          Thử audio mẫu
        </button>
      </div>

      {localError && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{localError}</p>
      )}
    </div>
  );
}

export default AudioInput;
