// 1: user, 2:manager, 3: admin
const checkRoleUser = (req, res, next) => {
    try {
        const { user } = req;
        if (user.role !== 1) {
            return res.status(401).json({ status: false, data: 'Bạn không có quyền truy cập' })
        }
        return next();
    } catch (error) {
        console.log('Error', error);
        return res.status(401).json({ status: false, data: 'Token sai rồi' })
    }
}
const checkRoleAdmin = (req, res, next) => {
    try {
        const { user } = req;
        if (user.role !== 3) {
            return res.status(401).json({ status: false, data: 'Bạn không có quyền truy cập' })
        }
        return next();
    } catch (error) {
        console.log('Error', error);
        return res.status(401).json({ status: false, data: 'Token sai rồi' })
    }
}



module.exports = {
    checkRoleUser, checkRoleAdmin
}