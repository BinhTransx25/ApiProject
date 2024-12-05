var express = require('express');
var router = express.Router();
const ControllerAdmin = require('../controllers/admin/ControllerAdmin');

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
  const { name, email, password, phone, image, role } = req.body;
  try {
    let result = await ControllerAdmin.register(name, email, password, phone, image, role);
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
    let result = await ControllerAdmin.login(identifier, password);
    return res.status(200).json({ status: true, data: result });
  } catch (error) {
    console.error('Error during login:', error);
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
    const result = await ControllerAdmin.resetPassword(email, password);
    return res.status(200).json({ status: true, data: result });
  } catch (error) {
    console.error('Error during reset password:', error);
    return res.status(500).json({ status: false, message: error.message });
  }
});

/**
 * @swagger
 * /update/{id}:
 *   put:
 *     summary: Cập nhật thông tin người dùng
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên người dùng
 *               phone:
 *                 type: string
 *                 description: Số điện thoại
 *               email:
 *                 type: string
 *                 description: Email
 *               password:
 *                 type: string
 *                 description: Mật khẩu
 *               image:
 *                 type: string
 *                 description: URL ảnh của người dùng
 *     responses:
 *       200:
 *         description: Thông tin người dùng đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi khi cập nhật thông tin người dùng
 */
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, password, image } = req.body;
    const admin = await ControllerAdmin.updateAdmin(id, name, phone, email, password, image);
    return res.status(200).json({ status: true, data: admin });
  } catch (error) {
    if (error.message === 'Không Tìm Thấy Tài Khoản, Hãy thử lại') {
      return res.status(404).json({ status: false, message: error.message });
    }
    return res.status(500).json({ status: false, message: 'Lỗi khi cập nhật thông tin người dùng' });
  }
});

router.get('/', async (req, res) => {
  try {
      let result = await ControllerAdmin.getAllAdmin();
      return res.status(200).json({ status: true, data: result });
  } catch (error) {
      return res.status(500).json({ status: false, data: error.message });
  }
});

/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Lấy thông tin user theo ID
 *     tags: [ShopOwner]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user
 *     responses:
 *       200:
 *         description: Thông tin user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShopOwner'
 *       404:
 *         description: Không tìm thấy user
 *       500:
 *         description: Lỗi khi lấy thông tin user
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
      let result = await ControllerAdmin.getAdminById(id);
      return res.status(200).json({ status: true, data: result });
  } catch (error) {
      return res.status(500).json({ status: false, data: error.message });
  }
});

/**
 * @swagger
 * /delete/{id}:
 *   delete:
 *     summary: Xóa user theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User đã bị xóa
 */
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
      let result = await ControllerUser.deleteAdmin(id);
      return res.status(200).json({ status: true, data: result });
  } catch (error) {
      return res.status(500).json({ status: false, data: error.message });
  }
});

router.post('/change-password', async (req, res) => {
  const {email, oldPassword, newPassword } = req.body;
  try {
    const result = await ControllerAdmin.changePassword(email, oldPassword, newPassword);
    return res.status(200).json({ status: true, message: result.message });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
});

router.delete('/softdelete/:id', async function (req, res, next) {
  try {
      const adminId = req.params.id;
      const updatedAdmin = await ControllerAdmin.removeSoftDeleted(adminId);

      if (updatedAdmin) {
          return res.status(200).json({
              status: true,
              message: 'Admin successfully soft deleted',
              data: updatedAdmin, // Trả về thông tin đã cập nhật
          });
      } else {
          return res.status(404).json({
              status: false,
              message: 'Admin not found',
          });
      }
  } catch (error) {
      console.log('Delete Admin error:', error);
      return res.status(500).json({ status: false, error: error.message });
  }
});

router.put('/restore/available/:id', async (req, res) => {
  try {
      const adminId = req.params.id;
      const updatedAdmin = await ControllerAdmin.restoreAndSetAvailable(adminId);

      return res.status(200).json({
          status: true,
          message: 'Admin restored and set to available',
          data: updatedAdmin,
      });
  } catch (error) {
      console.log('Restore Admin error:', error);
      return res.status(500).json({ status: false, error: error.message });
  }
});

module.exports = router;
