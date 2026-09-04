import React, { useState, useRef } from 'react';

function UploadForm({ onUploadSuccess }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUploadTrack = async (e) => {
    e.preventDefault();
    if (!title || !artist || !file) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('audio', file);

    try {
      setIsUploading(true);

      // 1. LẤY TOKEN TỪ LOCALSTORAGE
      const token = localStorage.getItem('token');

      const res = await fetch('https://allmusic-6k3l.onrender.com/api/tracks/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` // Gửi token lên backend để qua middleware auth.js
        },
        body: formData,
        signal: AbortSignal.timeout(30000) // Timeout 30s
      });

      const result = await res.json();

      if (result.success) {
        alert('🎉 Upload bài hát thành công!');
        // Reset form
        setTitle('');
        setArtist('');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        // Tải lại danh sách ở App.jsx
        if (onUploadSuccess) onUploadSuccess();
      } else {
        alert('Lỗi: ' + result.message);
      }
    } catch (err) {
      if (err.name === 'TimeoutError') {
        alert('⏱️ Upload quá thời gian cho phép (Timeout)!');
      } else {
        console.error('Lỗi khi gửi request:', err);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Tải Lên Bài Hát Mới</h2>
      <form onSubmit={handleUploadTrack} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên bài hát</label>
          <input
            type="text"
            placeholder="Nhập tên bài hát"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nghệ sĩ</label>
          <input
            type="text"
            placeholder="Nhập tên nghệ sĩ"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">File nhạc (Audio)</label>
          <input
            type="file"
            accept="audio/*"
            ref={fileInputRef}
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition disabled:bg-gray-400"
        >
          {isUploading ? 'Đang tải lên...' : 'Tải Lên'}
        </button>
      </form>
    </div>
  );
}

export default UploadForm;