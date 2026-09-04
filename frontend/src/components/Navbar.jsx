import React from 'react';

function Navbar({ user, onOpenAuth, onLogout }) {
  return (
    <nav className="flex justify-between items-center p-4 bg-slate-900 text-white mb-6">
      <div className="text-xl font-bold">🎵 Music App</div>
      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <span>Xin chào, <b>{user.username}</b></span>
            <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm">Đăng xuất</button>
          </div>
        ) : (
          <button onClick={onOpenAuth} className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded font-medium">Đăng Nhập</button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;