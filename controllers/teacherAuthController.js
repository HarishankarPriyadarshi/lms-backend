import prisma from "../config/db.config.js";
import JWT from 'jsonwebtoken';
import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import { sendOtpNotification } from "../helpers/mail.js";

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        //validation 
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "email or password is required "
            })
        }
        const user = await prisma.TeacherVerificationDetail.findUnique({
            where: {
                email
            }
        })
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "email is not registered"
            })
        }
        //token generation
        const token = JWT.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '120 days' })
        if (user.password === password) {
            console.log(user.password, password);
            return res.status(200).json({
                success: true,
                message: "Login1 successfully",
                user: {
                    id: user.id,
                    email: user.email,
                },
                token,
            });
        }
        const match = await comparePassword(password, user.password)
        if (!match) {
            return res.status(401).json({
                success: false,
                message: 'invalid passsword'
            })
        }
        res.status(200).json({
            success: true,
            message: "Login2 successfully",
            user: {
                id: user.id,
                email: user.email,
            },
            token,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            sucess: false,
            message: 'error in login',
            error
        })
    }
}
export const forgotController = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(401).json({
                success: false,
                message: "invalid emaiId"
            })
        }
        const user = await prisma.TeacherVerificationDetail.findUnique({
            where: {
                email
            }
        })
        console.log("user", user)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "email is not registered"
            })
        }
        const otp = Math.floor(1000 + Math.random() * 1000)
        const OTPExpiry = new Date(Date.now() + 30 * 60 * 1000);
        await prisma.TeacherVerificationDetail.update({
            where: { email },
            data: {
                otpExpiry: OTPExpiry,
                resetOtp: otp.toString(),
            },
        })
        await sendOtpNotification(email, otp);
        console.log("email sent to", email);
        res.status(200).json({
            success: true,
            message: "mail sent sucessfully",

        })
    } catch (error) {
        console.log("something went wrong during forget password", error)
        res.status(500).json({
            success: false,
            message: "Error in forget password",
            error
        })
    }
}
//otp verification otpController
export const otpController = async (req, res) => {
    try {
        const { otp } = req.body;
        const userId = req.params.id
        console.log(userId);
        // Validation
        if (!otp) {
            return res.status(400).json({
                success: false,
                message: 'otp is required.',
            });
        }
        const existingUser = await prisma.TeacherVerificationDetail.findFirst({
            where: {
                id: Number(userId)
            }
        })

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }
        // Verify OTP and its expiry
        if (
            existingUser.resetOtp !== otp ||
            new Date() > existingUser.otpExpiry
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP.',
            });
        }
        await prisma.TeacherVerificationDetail.update({
            where: { id: Number(userId) },
            data: {
                resetOtp: null,
                otpExpiry: null,
            },
        });
        return res.status(200).json({
            success: true,
            message: 'OTP verified successfully.',
        });
    } catch (error) {
        console.error('Error in resetController:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during otp verification.',
        });
    }
};
export const resetController = async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body;
        const userId = req.params.id
        console.log(userId);
        // Validation
        if (!newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required.',
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match.',
            });
        }

        const existingUser = await prisma.TeacherVerificationDetail.findFirst({
            where: {
                id: Number(userId)
            }
        })

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }
        // Hash the new password
        const hashedPassword = await hashPassword(newPassword);
        await prisma.TeacherVerificationDetail.update({
            where: { id: Number(userId) },
            data: {
                password: hashedPassword,
            },
        });
        return res.status(200).json({
            success: true,
            message: 'Password reset successfully.',
        });
    } catch (error) {
        console.error('Error in resetController:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred during password reset.',
        });
    }
};
