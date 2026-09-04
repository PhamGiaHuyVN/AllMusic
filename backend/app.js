require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Track = require('./models/track');

//token & middleware
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const authMiddleware = require('./middleware/auth')

const app = express();
app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 1. Route kiểm tra trạng thái Server (Sửa lỗi Cannot GET /)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '🚀 Music App Backend API running successfully on Render!'
  });
});

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

// --- 1. API ĐĂNG KÝ (REGISTER) ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Kiểm tra xem user đã tồn tại chưa
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username hoặc Email đã tồn tại' });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });

    res.status(201).json({ success: true, message: 'Đăng ký tài khoản thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- 2. API ĐĂNG NHẬP (LOGIN) ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    // Tạo JWT Token có thời hạn 7 ngày
    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: { id: user._id, username: user.username, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- 3. BẢO VỆ ROUTE UPLOAD BÀI HÁT (Yêu cầu phải Đăng nhập) ---
// Thêm authMiddleware vào giữa đường dẫn và hàm xử lý
app.post('/api/tracks/upload', authMiddleware, upload.single('audio'), async (req, res) => {
  // Chỉ khi gửi kèm Token hợp lệ thì code mới chạy vào đây
  try {
    const { title, artist } = req.body;
    const newTrack = await Track.create({
      title,
      artist,
      audioUrl: req.file.path,
      uploadedBy: req.user.id // Lưu ID của người đăng nhạc
    });
    res.status(201).json({ success: true, data: newTrack });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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

// Kết nối MongoDB qua biến môi trường
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/music';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected!'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Lắng nghe cổng mà Render cấp
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));