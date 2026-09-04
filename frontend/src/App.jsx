import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import UploadForm from './components/UploadForm';
import TrackList from './components/TrackList';
import AuthModal from './components/AuthModal'; // Đảm bảo đúng đường dẫn tới file AuthModal của bạn

function MusicApp() {
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Tự động khôi phục phiên đăng nhập từ localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div>
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

      {/* Dùng điều kiện kiểm tra người dùng đã đăng nhập chưa để hiển thị Upload form */}
      {user ? (
        <UploadForm onUploadSuccess={loadTracks} />
      ) : (
        <div className="p-4 bg-yellow-50 text-yellow-800 border rounded-lg text-center">
          Vui lòng <b>Đăng nhập</b> để thực hiện Tải Lên bài hát mới.
        </div>
      )}
    </div>
  );
}

export default MusicApp;