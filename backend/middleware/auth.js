const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    //laasy token tu header authorization  (bearer: <token>)
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Yêu cầu đăng nhập (Thiếu Token)' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'deptraicogisai');
        req.user = decoded;
        next();
    }

    catch(err) {
        return res.status(403).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
}

module.exports = authMiddleware;