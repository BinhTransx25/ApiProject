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

router.post('/login-social', async (req, res, next) => {
  const { userInfo } = req.body;
  try {
    let result = await ControllerUser.loginWithSocial(userInfo);
    return res.status(200).json({ status: true, data: result });
  } catch (error) {
    console.error('Error during login:', error); // Log lỗi cụ thể
    return res.status(500).json({ status: false, message: error.message });
  }
})

router.post('/verify', async (req, res, next) => {
  const { email } = req.body;
  try {
    let result = await ControllerUser.verifyEmail(email);
    return res.status(200).json({ status: true, data: result });
  } catch (error) {
    console.error('Error during verify:', error); // Log lỗi cụ thể
    return res.status(500).json({ status: false, message: error.message });
  }
})

router.post('/reset-password', async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const result = await ControllerUser.resetPassword(email, password);
    return res.status(200).json({ status: true, data: result });
  } catch (error) {
    console.error('Error during reset password:', error); // Log lỗi cụ thể
    return res.status(500).json({ status: false, message: error.message });
  }
})

router.post('/check-user', async (req, res, next) => {
  const { email } = req.body;
  try {
    const result = await ControllerUser.checkUser(email);
    return res.status(200).json({ status: true, data: result });
  } catch (error) {
    console.error('Error during check email:', error); // Log lỗi cụ thể
    return res.status(500).json({ status: false, message: error.message });
  }
})

module.exports = router;
