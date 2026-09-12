import React from 'react';
import { Home, Mic, History } from 'lucide-react';

function BottomTab({ activeTab, onChange }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
        <button
          onClick={() => onChange('home')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'home' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs font-medium">Trang chủ</span>
        </button>

        <button
          onClick={() => onChange('home')}
          className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 active:scale-95 transition-transform"
          aria-label="Ghi âm mới"
        >
          <Mic className="w-6 h-6" />
        </button>

        <button
          onClick={() => onChange('history')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'history' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <History className="w-6 h-6" />
          <span className="text-xs font-medium">Lịch sử</span>
        </button>
      </div>
    </div>
  );
}

export default BottomTab;
