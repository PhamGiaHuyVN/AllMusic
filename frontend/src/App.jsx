import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import UploadForm from './components/UploadForm';
import TrackList from './components/TrackList';

function MusicApp() {
  const [tracks, setTracks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const audioPlayerRef = useRef(null);

  // Gọi API tải danh sách bài hát
  const loadTracks = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/tracks');
      const data = await res.json();
      if (data.success) {
        setTracks(data.data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách bài hát:', err);
    }
  };

  useEffect(() => {
    loadTracks();
  }, []);

  // Lọc bài hát theo từ khóa
  const filteredTracks = tracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlayAudio = (url) => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.src = url;
      audioPlayerRef.current.play();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <Navbar />

      <main className="max-w-4xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột trái: Form Upload */}
        <div>
          <UploadForm onUploadSuccess={loadTracks} />
        </div>

        {/* Cột phải: Tìm kiếm & Danh sách bài hát */}
        <div className="space-y-4">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <TrackList
            tracks={filteredTracks}
            handlePlayAudio={handlePlayAudio}
            audioPlayerRef={audioPlayerRef}
          />
        </div>
      </main>
    </div>
  );
}

export default MusicApp;