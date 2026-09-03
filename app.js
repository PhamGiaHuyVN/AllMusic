const express = require('express');
const mongoose = require('mongoose');
const { createClient } = require('redis');

const app = express();
app.use(express.json()); // Đọc dữ liệu JSON gửi lên từ client

const cors = require('cors');
app.use(cors());
app.use(express.static(__dirname)); //dung de mo web tren local host

// Cấu hình kết nối
const MONGO_URI = 'mongodb://root:root@localhost:27017/music_db?authSource=admin';
const REDIS_URI = 'redis://localhost:6379';

// Khởi tạo Redis Client
const redisClient = createClient({ url: REDIS_URI });
redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Schema MongoDB
const PlaylistSchema = new mongoose.Schema({
  title: String,
  userId: String,
  tracks: [String],
  createdAt: { type: Date, default: Date.now }
});
const Playlist = mongoose.model('Playlist', PlaylistSchema);

// --- CÁC ROUTE API ---

// 1. API Tạo Playlist mới (POST)
app.post('/api/playlists', async (req, res) => {
  try {
    // const { title, userId, tracks } = req.body;
    // const newPlaylist = await Playlist.create({ title, userId, tracks });
    // res.status(201).json({ success: true, data: newPlaylist });

    const { trackId } = req.body;
    const playlist = await Playlist.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { tracks: trackId } }, //them track vao mang
        { new: true }
    );

    await redisClient.del(`playlist:${req.params.id}`);

    res.json({ success: true, data: playlist });

  } 
  catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. API Lấy thông tin Playlist theo ID (GET) - Có dùng Redis Cache
app.get('/api/playlists/:id', async (req, res) => {
  try {
    const playlistId = req.params.id;
    const cacheKey = `playlist:${playlistId}`;

    // Kiểm tra xem dữ liệu có sẵn trong Redis Cache không
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('⚡ [CACHE HIT] Lấy dữ liệu từ Redis');
      return res.json({ success: true, source: 'cache', data: JSON.parse(cachedData) });
    }

    // Nếu không có trong Cache -> Tìm trong MongoDB
    console.log('🐢 [CACHE MISS] Đang truy vấn từ MongoDB...');
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy playlist' });
    }

    // Lưu vào Redis Cache trong 60 giây cho các lần gọi sau
    await redisClient.setEx(cacheKey, 60, JSON.stringify(playlist));

    res.json({ success: true, source: 'database', data: playlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/playlists/:id', async (req, res) => {
  try {
    await Playlist.findByIdAndDelete(req.params.id);
    await redisClient.del(`playlist:${req.params.id}`); // Xóa cache
    res.json({ success: true, message: 'Đã xóa playlist' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Khởi động Server
async function startServer() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Đã kết nối MongoDB');

  await redisClient.connect();
  console.log('✅ Đã kết nối Redis');

  app.listen(3000, () => {
    console.log('🚀 Server Backend đang chạy tại port http://localhost:3000');
  });
}

startServer();