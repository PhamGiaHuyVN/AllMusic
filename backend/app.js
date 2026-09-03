require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Track = require('./models/track');

const app = express();
app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Cấu hình Cloudinary SDK
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Sử dụng memoryStorage của Multer (Lưu file vào RAM tạm thời để gửi lên Cloudinary)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

// --- API UPLOAD BÀI HÁT ---
app.post('/api/tracks/upload', upload.single('audio'), async (req, res) => {
  try {
    const { title, artist } = req.body;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Chưa chọn file!' });
    }

    // Upload file trực tiếp lên Cloudinary bằng Stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'music_app_tracks',
        resource_type: 'video', // Cloudinary quản lý file audio dưới dạng 'video'
      },
      async (error, result) => {
        if (error) {
          console.error('❌ Lỗi Upload Cloudinary:', error);
          return res.status(500).json({ success: false, message: error.message });
        }

        // Tạo document mới trong MongoDB
        const newTrack = await Track.create({
          title,
          artist,
          audioUrl: result.secure_url
        });

        res.status(201).json({ success: true, data: newTrack });
      }
    );

    // Gửi buffer từ Multer sang Cloudinary stream
    uploadStream.end(req.file.buffer);

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// --- API LẤY DANH SÁCH BÀI HÁT ---
app.get('/api/tracks', async (req, res) => {
  try {
    const tracks = await Track.find().sort({ createdAt: -1 });
    res.json({ success: true, data: tracks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Khởi động Server
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(3000, () => console.log('🚀 Server Backend đang chạy tại http://localhost:3000'));
  })
  .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));