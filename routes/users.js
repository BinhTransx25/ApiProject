var express = require('express');
var router = express.Router();
const ControllerUser = require('../controllers/users/ControllerUser');

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Đăng ký người dùng
 *     description: Đăng ký người dùng mới với các thông tin bao gồm tên, email, mật khẩu, số điện thoại, vai trò, danh mục cửa hàng, địa chỉ, kinh độ và vĩ độ.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               image:
 *                 type: Array
 *               rating:
 *                 type: string
 *               role:
 *                 type: string
 *               shopCategory_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               address:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Đăng ký thành công
 *       500:
 *         description: Lỗi khi đăng ký
 */
router.post('/register', async (req, res, next) => {
  const { name, email, password, phone, image, rating, role, shopCategory_ids, address, latitude, longitude } = req.body;
  try {
    let result = await ControllerUser.register(name, email, password, phone,image, rating, role, shopCategory_ids, address, latitude, longitude);
    return res.status(200).json({ status: true, data: result });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ status: false, message: error.message });
  }
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Đăng nhập người dùng
 *     description: Đăng nhập với email hoặc số điện thoại và mật khẩu.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *       500:
 *         description: Lỗi khi đăng nhập
 */
router.post('/login', async (req, res, next) => {
  const { identifier, password } = req.body;
  try {
    let result = await ControllerUser.login(identifier, password);
    return res.status(200).json({ status: true, data: result });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ status: false, message: error.message });
  }
});


/**
 * @swagger
 * /users/login-social:
 *   post:
 *     summary: Đăng nhập bằng tài khoản mạng xã hội
 *     description: Đăng nhập người dùng qua tài khoản mạng xã hội.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userInfo:
 *                 type: object
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *       500:
 *         description: Lỗi khi đăng nhập
 */
router.post('/login-social', async (req, res, next) => {
  const { userInfo } = req.body;
  try {
    let result = await ControllerUser.loginWithSocial(userInfo);
    return res.status(200).json({ status: true, data: result });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ status: false, message: error.message });
  }
});

/**
 * @swagger
 * /users/verify:
 *   post:
 *     summary: Xác minh email người dùng
 *     description: Xác minh email của người dùng qua việc gửi yêu cầu xác thực.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Xác minh thành công
 *       500:
 *         description: Lỗi khi xác minh
 */
router.post('/verify', async (req, res, next) => {
  const { email } = req.body;
  try {
    let result = await ControllerUser.verifyEmail(email);
    return res.status(200).json({ status: true, data: result });
  } catch (error) {
    console.error('Error during verify:', error);
    return res.status(500).json({ status: false, message: error.message });
  }
});

/**
 * @swagger
 * /users/reset-password:
 *   post:
 *     summary: Đặt lại mật khẩu người dùng
 *     description: Đặt lại mật khẩu cho tài khoản qua email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đặt lại mật khẩu thành công
 *       500:
 *         description: Lỗi khi đặt lại mật khẩu
 */
router.post('/reset-password', async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const result = await ControllerUser.resetPassword(email, password);
    return res.status(200).json({ status: true, data: result });
  } catch (error) {
    console.error('Error during reset password:', error);
    return res.status(500).json({ status: false, message: error.message });
  }
});

/**
 * @swagger
 * /users/check-user:
 *   post:
 *     summary: Kiểm tra thông tin người dùng
 *     description: Kiểm tra xem email có tồn tại trong hệ thống hay không.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kiểm tra thành công
 *       500:
 *         description: Lỗi khi kiểm tra
 */
router.post('/check-user', async (req, res, next) => {
  const { email } = req.body;
  try {
    const result = await ControllerUser.checkUser(email);
    return res.status(200).json({ status: true, data: result });
  } catch (error) {
    console.error('Error during check email:', error);
    return res.status(500).json({ status: false, message: error.message });
  }
});

module.exports = router;
