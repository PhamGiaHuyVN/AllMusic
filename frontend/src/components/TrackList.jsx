import React from 'react';

function TrackList({ tracks, handlePlayAudio, audioPlayerRef }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Danh Sách Bài Hát</h2>

      {/* Danh sách bài hát */}
      <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
        {tracks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Chưa có bài hát nào</p>
        ) : (
          tracks.map((track) => (
            <div
              key={track._id || track.audioUrl}
              className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition"
            >
              <div>
                <p className="font-semibold text-gray-900">{track.title}</p>
                <p className="text-sm text-gray-500">{track.artist}</p>
              </div>
              <button
                onClick={() => handlePlayAudio(track.audioUrl)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-medium text-sm transition"
              >
                ▶ Play
              </button>
            </div>
          ))
        )}
      </div>

      {/* Trình phát nhạc */}
      <audio
        ref={audioPlayerRef}
        controls
        className="w-full mt-2 rounded-lg"
      />
    </div>
  );
}

export default TrackList;