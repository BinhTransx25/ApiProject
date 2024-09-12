const nodemailer = require('nodemailer')
// mastertao332@gmail.com
// juof xurt vcmn gbrk

// khai báo transporter
// khai báo thông tin email
const transporter = nodemailer.createTransport({
    pool: true,
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use TLS
    auth: {
        user: 'mastertao332@gmail.com',
        pass: 'juofxurtvcmngbrk'
    },
});
const sendMail = async (data) => {
    try {
        const { email, subject, content } = data;
        const mailOptions = {
            from: 'mastertao332@gmail.com',
            to: email,
            subject,
            html: content,
        };
        await transporter.sendMail(mailOptions);
        return true;
    }
    catch (error) {
        console.log(error);
        throw new Error('Có lỗi xảy ra khi gửi email');
    }
}

module.exports = {
    sendMail,
}