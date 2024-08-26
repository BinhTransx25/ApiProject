const jwt = require('jsonwebtoken');

const checkToken = async (req, res, next) => {
    try {
        // Đọc token từ header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ status: false, message: 'Token không tồn tại' });
        }

        // Tách token sau từ khóa Bearer
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ status: false, message: 'Token không hợp lệ' });
        }

        // Verify token
        const decoded = jwt.verify(token, 'secret'); // 'secret' nên được lưu trữ trong biến môi trường
        req.user = decoded;
        
        return next();
    } catch (error) {
        console.log('Error:', error.message);
        // Xử lý lỗi từ JWT
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ status: false, message: 'Token đã hết hạn' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ status: false, message: 'Token không hợp lệ' });
        } else {
            return res.status(500).json({ status: false, message: 'Lỗi xác thực token' });
        }
    }
};

module.exports = { checkToken };
