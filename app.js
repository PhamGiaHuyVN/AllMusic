require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Track = require('./models/track');


const app = express();
app.use(cors());
app.use(express.static(__dirname)); //dung de mo web tren local host

// Tăng dung lượng nhận payload cho Express
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Cấu hình Multer với giới hạn file size 50MB
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Cấu hình kết nối
const MONGO_URI = process.env.MONGO_URI;

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cấu hình Nơi lưu file Upload
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'music_app_tracks',
    resource_type: 'video', // Cloudinary quản lý file audio dưới dạng 'video'
    allowed_formats: ['mp3', 'wav', 'aac']
  }
});

const upload = multer({ storage: storage });

// --- API UPLOAD BÀI HÁT ---
app.post('/api/tracks/upload', (req, res) => {
  upload.single('audio')(req, res, async (err) => {
    if (err) {
      console.error('❌ Lỗi Upload Cloudinary:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
    try {
      const { title, artist } = req.body;
      if (!req.file) return res.status(400).json({ success: false, message: 'Chưa chọn file!' });

      const newTrack = await Track.create({
        title,
        artist,
        audioUrl: req.file.path
      });

      res.status(201).json({ success: true, data: newTrack });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
});

app.get('/api/tracks', async (req, res) => {
  try {
    const tracks = await Track.find().sort({ createdAt: -1 });
    res.json({ success: true, data: tracks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Khởi động Server
mongoose.connect(MONGO_URI)
  .then(()=> {
    app.listen(3000, () => console.log('🚀 Server Backend đang chạy tại port http://localhost:3000'))
  });