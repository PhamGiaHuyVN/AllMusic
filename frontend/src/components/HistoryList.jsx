import React from 'react';
import { apiFetch } from '../lib/api';

function HistoryList({ user, transcripts, onReload, onOpenAuth }) {
  if (!user) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center">
        <p className="text-gray-600 mb-3">Đăng nhập để lưu và xem lịch sử chuyển đổi.</p>
        <button
          onClick={onOpenAuth}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition"
        >
          Đăng nhập
        </button>
      </div>
    );
  }

  const handleDelete = async (id) => {
    const { data } = await apiFetch(`/api/transcripts/${id}`, { method: 'DELETE' });
    if (data.success) onReload?.();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Lịch sử chuyển đổi</h2>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {transcripts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Chưa có bản ghi nào</p>
        ) : (
          transcripts.map((item) => (
            <div key={item._id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between gap-3 items-start">
                <div>
                  <p className="font-semibold text-gray-900">{item.sourceName || 'Không tên'}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleString('vi-VN')} · {item.language}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Xóa
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{item.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default HistoryList;
