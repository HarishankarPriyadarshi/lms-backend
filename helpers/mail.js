
import nodemailer from 'nodemailer'
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASS
    }
});

export const sendOtpNotification = async (email, otp) => {
    const mailOptions = {
        from: process.env.MAIL_ID,
        to: email,
        subject: 'OTP to Reset password',
        text: `Your OTP for password reset is: ${otp}. 
        Do not share your OTP with anyone else. Validity for otp is 3 minutes`
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('OTP email sent to:', email);
    } catch (error) {
        console.error('Error sending OTP email:', error);
    }
}


