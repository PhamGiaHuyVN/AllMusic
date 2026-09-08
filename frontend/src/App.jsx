import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import UploadForm from './components/UploadForm';
import TrackList from './components/TrackList';
import AuthModal from './components/AuthModal';

function MusicApp() {
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // 1. Thêm State lưu danh sách nhạc & từ khóa tìm kiếm
  const [tracks, setTracks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const audioPlayerRef = useRef(null);

  // 2. KHAI BÁO HÀM loadTracks
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

  // Tự động khôi phục phiên đăng nhập
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // 3. Tự động tải danh sách bài hát khi vừa mở ứng dụng
  useEffect(() => {
    loadTracks();
  }, []);

  // 4. Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // 5. Lọc bài hát theo từ khóa
  const filteredTracks = tracks.filter(
    (track) =>
      (track.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (track.artist || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // 6. Trình phát nhạc
  const handlePlayAudio = (url) => {
    if (!url || !audioPlayerRef.current) return;

    audioPlayerRef.current.src = url;
    audioPlayerRef.current.play().catch((err) => {
      console.error('Lỗi phát audio:', err)
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
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

      <main className="max-w-4xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột trái: Form Upload */}
        <div>
          {user ? (
            <UploadForm onUploadSuccess={loadTracks} /> // Giờ đây loadTracks đã hợp lệ
          ) : (
            <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 text-center">
              <p className="text-gray-600 mb-3">
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

        {/* Cột phải: Tìm kiếm & Danh sách nhạc */}
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