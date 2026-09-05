import React from 'react';

function RightSidebar({ currentTrack, onClose }) {
  if (!currentTrack) return null;

  return (
    <aside className="w-80 bg-zinc-900 text-white p-4 h-full overflow-y-auto space-y-6 flex-shrink-0">
      {/* Header Sidebar */}
      <div className="flex justify-between items-center">
        <span className="font-semibold text-sm">chilling</span>
        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
      </div>

      {/* Ảnh Bìa & Tên Bài Hát */}
      <div className="space-y-3">
        <img 
          src={currentTrack.coverUrl || 'https://via.placeholder.com/300'} 
          alt={currentTrack.title} 
          className="w-full aspect-square object-cover rounded-md shadow-lg"
        />
        <div>
          <h2 className="text-2xl font-bold leading-tight">{currentTrack.title}</h2>
          <p className="text-gray-400 font-medium">{currentTrack.artist}</p>
        </div>
      </div>

      {/* Khối Thông Tin Nghệ Sĩ (About the artist) */}
      <div className="bg-zinc-800/60 rounded-xl p-4 space-y-3 relative overflow-hidden">
        <p className="font-bold text-sm">About the artist</p>
        <div className="flex items-center gap-3">
          <img 
            src={currentTrack.artistAvatar || 'https://via.placeholder.com/100'} 
            className="w-12 h-12 rounded-full object-cover" 
          />
          <div>
            <p className="font-bold">{currentTrack.artist}</p>
            <p className="text-xs text-gray-400">Monthly Listeners: 100K</p>
          </div>
        </div>
        <p className="text-sm text-gray-300 line-clamp-2">{currentTrack.artistBio || 'Không có tiểu sử'}</p>
      </div>

      {/* Khối Credits */}
      <div className="bg-zinc-800/60 rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-bold text-sm">Credits</span>
          <span className="text-xs text-gray-400 hover:underline cursor-pointer">Show all</span>
        </div>
        <div className="text-sm space-y-2">
          <div>
            <p className="font-semibold">{currentTrack.artist}</p>
            <p className="text-xs text-gray-400">Main Artist</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default RightSidebar;