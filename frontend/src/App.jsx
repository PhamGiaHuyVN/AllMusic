import React, { useState, useEffect, useRef } from 'react';

function MusicApp() {
  // 1. Khai báo các State quản lý form và danh sách bài hát
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [file, setFile] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [currentAudioUrl, setCurrentAudioUrl] = useState('');

  // Sử dụng ref cho input file để có thể xóa file đã chọn sau khi upload
  const fileInputRef = useRef(null);
  const audioPlayerRef = useRef(null);

  // 2. Hàm lấy danh sách bài hát từ Server
  const loadTracks = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/tracks');
      const result = await res.json();
      if (result.success && result.data.length > 0) {
        setTracks(result.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách:', err);
    }
  };

  // 3. Tự động tải danh sách bài hát khi component được mount (tương đương loadTracks() ở script cũ)
  useEffect(() => {
    loadTracks();
  }, []);

  // 4. Hàm Upload bài hát
  const handleUploadTrack = async (e) => {
    e.preventDefault();

    if (!file || !title) {
      return alert('Vui lòng điền đủ thông tin!');
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('audio', file);

    try {
      const res = await fetch('http://localhost:3000/api/tracks/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();

      if (result.success) {
        alert('🎉 Upload bài hát thành công!');
        // Reset form
        setTitle('');
        setArtist('');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        // Tải lại danh sách bài hát
        loadTracks();
      } else {
        alert('Lỗi: ' + result.message);
      }
    } 
    catch (err) {
      console.error('Lỗi khi gửi request:', err);
    }
  };

  // 5. Hàm phát bài hát
  const handlePlayAudio = (url) => {
    setCurrentAudioUrl(url);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.src = url;
      audioPlayerRef.current.play();
    }
  };

  return (
    <div className="container">
      {/* FORM UPLOAD BÀI HÁT */}
      <div className="card">
        <h2>Tải Lên Bài Hát Mới</h2>
        <form onSubmit={handleUploadTrack}>
          <input
            type="text"
            placeholder="Tên bài hát"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Nghệ sĩ"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
          />
          <input
            type="file"
            accept="audio/*"
            ref={fileInputRef}
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button type="submit">Upload Bài Hát</button>
        </form>
      </div>

      {/* PLAYER PHÁT NHẠC */}
      <div className="card" style={{ marginTop: '20px' }}>
        <h2>Trình Phát Nhạc</h2>
        
        <div id="trackList">
          {tracks.length === 0 ? (
            <div>Chưa có bài hát nào</div>
          ) : (
            tracks.map((track) => (
              <div
                key={track._id || track.audioUrl} // Nguồn nên có ID làm key
                className="playlist-item"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <div>
                  <b>{track.title}</b> - {track.artist}
                </div>
                <button onClick={() => handlePlayAudio(track.audioUrl)}>
                  ▶ Play
                </button>
              </div>
            ))
          )}
        </div>

        <br />
        <audio
          ref={audioPlayerRef}
          controls
          style={{ width: '100%', marginTop: '10px' }}
        />
      </div>
    </div>
  );
}

export default MusicApp;