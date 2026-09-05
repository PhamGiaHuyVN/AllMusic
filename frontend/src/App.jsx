import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import UploadForm from './components/UploadForm';
import TrackList from './components/TrackList';
import AuthModal from './components/AuthModal';
import RightSidebar from './components/RightSidebar'; // 1. Import RightSidebar

function MusicApp() {
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTrack, setCurrentTrack] = useState(null); // State bài hát đang phát
  const audioPlayerRef = useRef(null);

  const loadTracks = async () => {
    try {
      const res = await fetch('https://allmusic-6k3l.onrender.com/api/tracks');
      const data = await res.json();
      if (data.success) {
        setTracks(data.data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách bài hát:', err);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    loadTracks();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handlePlayAudio = (track) => {
  // Kiểm tra nếu bài hát không có URL thì dừng lại
  if (!track || !track.audioUrl) {
    console.warn('Bài hát này không có đường dẫn audio hợp lệ!');
    return;
  }

  setCurrentTrack(track);

  if (audioPlayerRef.current) {
    audioPlayerRef.current.src = track.audioUrl;
    
    // Sử dụng catch để tránh crash ứng dụng khi browser chặn autoplay hoặc URL hỏng
    audioPlayerRef.current.play().catch((err) => {
      console.error('Lỗi khi phát audio:', err);
    });
  }
};

  const filteredTracks = tracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(userData) => setUser(userData)}
      />

      {/* 2. Đổi container chính thành Flex layout để RightSidebar nằm cố định bên phải */}
      <main className="flex flex-1 max-w-[1400px] w-full mx-auto p-4 gap-6 overflow-hidden">
        
        {/* Khung nội dung bên trái + giữa (UploadForm & TrackList) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto pr-2">
          {/* Form Upload */}
          <div>
            {user ? (
              <UploadForm onUploadSuccess={loadTracks} />
            ) : (
              <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
                <p className="text-zinc-400 mb-3">
                  Vui lòng <b>Đăng nhập</b> để thực hiện Tải Lên bài hát mới.
                </p>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition"
                >
                  Đăng Nhập Ngay
                </button>
              </div>
            )}
          </div>

          {/* Tìm kiếm & Danh sách nhạc */}
          <div className="space-y-4">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <TrackList
              tracks={filteredTracks}
              handlePlayAudio={handlePlayAudio}
              audioPlayerRef={audioPlayerRef}
            />
          </div>
        </div>

        {/* 3. ĐẶT RIGHTSIDEBAR Ở ĐÂY (Cố định ở cột bên phải) */}
        {currentTrack && (
          <RightSidebar
            currentTrack={currentTrack}
            onClose={() => setCurrentTrack(null)}
          />
        )}
      </main>
    </div>
  );
}

export default MusicApp;