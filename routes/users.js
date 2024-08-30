var express = require('express');
var router = express.Router();
const ControllerUser = require('../controllers/users/ControllerUser');

/**
 * Register
 * method: POST
 * body: name, email, password, phone, role, shopCategory_ids, address, latitude, longitude
 * url: http://localhost:9999/users/register
 * response: true/false
 */
router.post('/register', async (req, res, next) => {
  const { name, email, password, phone, role, shopCategory_ids, address, latitude, longitude } = req.body; // Bổ sung thông tin vào request body
  try {
    let result = await ControllerUser.register(name, email, password, phone, role, shopCategory_ids, address, latitude, longitude); // Truyền các thông tin cần thiết vào hàm register
    return res.status(200).json({ status: true, data: result });
  } catch (error) {
    console.error('Error during registration:', error); // Log lỗi cụ thể
    return res.status(500).json({ status: false, message: error.message });
  }
});

/**
 * Login
 * method: POST
 * body: identifier, password
 * url: http://localhost:9999/users/login
 * response: user/null
 */
router.post('/login', async (req, res, next) => {
  const { identifier, password } = req.body;
  try {
    let result = await ControllerUser.login(identifier, password);
    return res.status(200).json({ status: true, data: result });
  } catch (error) {
    console.error('Error during login:', error); // Log lỗi cụ thể
    return res.status(500).json({ status: false, message: error.message });
  }
});

module.exports = router;
