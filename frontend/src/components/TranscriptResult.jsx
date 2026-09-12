import React, { useState } from 'react';
import { apiFetch } from '../lib/api';

function TranscriptResult({
  user,
  status,
  progress,
  result,
  error,
  sourceName,
  language,
  duration,
  onSaved,
  onNeedLogin,
}) {
  const [saveMessage, setSaveMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const text = typeof result === 'string' ? result : result?.text || '';
  const chunks = Array.isArray(result?.chunks) ? result.chunks : [];

  const handleSave = async () => {
    if (!user) {
      onNeedLogin?.();
      return;
    }
    if (!text.trim()) return;

    setSaving(true);
    setSaveMessage('');
    try {
      const { data } = await apiFetch('/api/transcripts', {
        method: 'POST',
        body: JSON.stringify({
          text: text.trim(),
          language,
          sourceName,
          duration,
        }),
      });
      if (!data.success) {
        setSaveMessage(data.message || 'Không lưu được bản ghi');
        return;
      }
      setSaveMessage('Đã lưu vào lịch sử');
      onSaved?.();
    } catch {
      setSaveMessage('Không kết nối được máy chủ');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setSaveMessage('Đã sao chép văn bản');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 min-h-64">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Kết quả</h2>

      {(status === 'loading' || status === 'transcribing') && (
        <div className="mb-4 p-3 rounded-lg bg-blue-50 text-blue-800 text-sm">
          {status === 'loading' && progress
            ? `Đang tải model: ${progress.file || ''} ${progress.progress}%`
            : status === 'loading'
              ? 'Đang tải mô hình Whisper...'
              : 'Đang nhận dạng giọng nói...'}
        </div>
      )}

      {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg mb-3">{error}</p>}

      {!text && status !== 'loading' && status !== 'transcribing' && !error && (
        <p className="text-gray-500 text-center py-8">Ghi âm hoặc tải file để xem văn bản tại đây</p>
      )}

      {text && (
        <>
          <textarea
            readOnly
            value={text.trim()}
            className="w-full min-h-40 p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900"
          />

          {chunks.length > 0 && (
            <div className="mt-4 max-h-40 overflow-y-auto space-y-1 text-sm text-gray-600">
              {chunks.map((chunk, index) => (
                <p key={`${chunk.timestamp?.[0]}-${index}`}>
                  <span className="font-mono text-xs text-gray-400 mr-2">
                    {formatTs(chunk.timestamp?.[0])}
                  </span>
                  {chunk.text}
                </p>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 border border-gray-300 hover:bg-gray-50 py-2 rounded-lg font-medium"
            >
              Sao chép
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-medium"
            >
              {saving ? 'Đang lưu...' : 'Lưu lịch sử'}
            </button>
          </div>
        </>
      )}

      {saveMessage && <p className="mt-3 text-sm text-gray-600">{saveMessage}</p>}
    </div>
  );
}

function formatTs(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '00:00';
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default TranscriptResult;
