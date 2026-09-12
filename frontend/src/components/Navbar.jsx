import React from 'react';
import { AudioLines, User } from 'lucide-react';

function Navbar({ user, onOpenAuth, onLogout }) {
  return (
    <nav className="flex justify-between items-center p-4 bg-slate-900 text-white mb-6">
      <div className="flex items-center gap-2 text-xl font-bold">
        <AudioLines className="w-6 h-6" />
        Speech to Text
      </div>

      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                <User className="w-5 h-5 text-slate-300" />
              </div>
              <span>Xin chào, <b>{user.username}</b></span>
            </div>

            <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm">
              Đăng xuất
            </button>
          </div>
        ) : (
          <button onClick={onOpenAuth} className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded font-medium">
            Đăng Nhập
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
