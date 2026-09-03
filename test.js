const mongoose = require('mongoose');
const { createClient } = require('redis');


const MONGO_URI = 'mongodb://root:root@localhost:27017/music_db?authSource=admin';
const REDIS_URI = 'redis://localhost:6379';

async function main() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('ket noi thanh cong mongoDB');

        const PlaylistSchema = new mongoose.Schema({
            title: String,
            userId: String,
            tracks: [String],
            createdAt: {type: Date, default: Date.now}
        });

        const Playlist = mongoose.model('Playlist', PlaylistSchema);

        const newPlaylist = await Playlist.create({
            title: 'NIG',
            userId: 'user_404',
            tracks: ['track_01', 'track_02', 'track_03']
        })
        console.log('Da luu playlist vao mongoDB: ', newPlaylist);

        const redisClient = createClient({ url: REDIS_URI });
        redisClient.on('error', (err) => console.log('Redis Error', err));
        await redisClient.connect();
        console.log('Da ket noi thanh cong toi Redis!');

        await redisClient.setEx(`playlist:${newPlaylist._id}`, 60, JSON.stringify(newPlaylist));
        console.log('⚡ Đã lưu tạm (Cache) Playlist vào Redis!');

        // Đọc lại từ Redis để kiểm tra
        const cachedPlaylist = await redisClient.get(`playlist:${newPlaylist._id}`);
        console.log('📦 Dữ liệu lấy trực tiếp từ Redis Cache:', JSON.parse(cachedPlaylist));

        // Dọn dẹp kết nối
        await redisClient.disconnect();
        await mongoose.disconnect();
        console.log('🎉 Hoàn thành test!');
    }
    catch (error) {
        console.log('Loi xay ra: ', error);
    }


}

main();