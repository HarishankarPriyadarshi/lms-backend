import prisma from "../config/db.config.js";
import JWT from 'jsonwebtoken';

import { hashPassword, comparePassword } from "../helpers/authHelper.js";
import { sendOtpNotification } from "../helpers/mail.js"

// Register controller
export const registerController = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validations
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        if (!password) {
            return res.status(400).send({ message: "Password is required" });
        }

        // Check if user already exists
        const existingUser = await prisma.verificationDetails.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).send({
                success: false,
                message: "User already registered, please login",
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create new user
        const user = await prisma.verificationDetails.create({
            data: {
                email,
                password: hashedPassword,
            },
        });

        res.status(201).send({
            success: true,
            message: "User registered successfully",
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in registration",
            error: error.message,
        });
    }
};
//login controller
export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        // Check user
        const user = await prisma.StudentVerificationDetail.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Email is not registered",
            });
        }

        // Compare password
        //token
        const token = await JWT.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '120 days' })
        if (user.password === password) {
            return res.status(200).json({
                success: true,
                message: "Login successfully",
                user: {
                    id: user.id,
                    email: user.email,
                },
                token,

            });
        }
        const match = await comparePassword(password, user.password);
        if (!match) {
            return res.status(401).json({
                success: false,
                message: "Invalid Password",
            });
        }
        //token
        // const token = await JWT.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '120 days' })

        res.status(200).json({
            success: true,
            message: "Login successfully",
            user: {
                id: user.id,
                email: user.email,
            },
            token,

        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Error in login",
            error,
        });
    }
};
// forgot controller
export const forgotController = async (req, res) => {
    try {
        const { email } = req.body;

        // Validation
        if (!email) {
            return res.status(400).send({
                success: false,
                message: 'Invalid email id',
            });
        }

        const existingUser = await prisma.StudentVerificationDetail.findUnique({
            where: { email },
        });

        if (!existingUser) {
            return res.status(404).send({
                success: false,
                message: 'User not found',
            });
        }

        const otp = Math.floor(1000 + Math.random() * 9000);
        // const otpExpiry = new Date(Date.now() + 30 * 60 * 1000); // 10 minutes from now
        console.log('Current Time:', new Date());
        const OTPExpiry = new Date(Date.now() + 30 * 60 * 1000);
        console.log('Setting OTP Expiry Time:', OTPExpiry);

        await prisma.StudentVerificationDetail.update({
            where: { email },
            data: {
                resetOtp: otp.toString(),
                otpExpiry: OTPExpiry,
            },
        });

        await sendOtpNotification(email, otp);
        console.log("sendOtpNotification called");

        res.status(200).send({
            success: "true",
            message: "otp send succesfully",
        })
        console.log("otp send succesfully")
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: "Error in forgot password",
            error: error.message,
        });
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
        const existingUser = await prisma.StudentVerificationDetail.findFirst({
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
        await prisma.StudentVerificationDetail.update({
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

        const existingUser = await prisma.StudentVerificationDetail.findFirst({
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
        await prisma.StudentVerificationDetail.update({
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
//for test controller
export const testController = async (req, res) => {
    try {
        res.json("protected routes")
    } catch (error) {
        console.log(error);

    }
}
//profile controller
export const profileController = async (req, res) => {
    try {
        const student = await prisma.student.findUnique({
            where: { id: req.user.id }, ///id comes from after populating user in auth middleware
            include: {
                class: {
                    select: {
                        className: true,
                    },
                },
            },
        });

        if (!student) {
            return res.status(404).json({
                sucess: false,
                message: 'Student not found'
            });
        }

        // Extracting only the required fields
        const {
            firstName,
            middleName,
            lastName,
            enrollmentNo,
            email,
            phone,
            address,
            gender,
            dob,
            fatherName,
            motherName,
            class: { className },
        } = student;

        console.log(student);
        res.status(200).json({
            sucess: true,
            firstName,
            middleName,
            lastName,
            enrollmentNo,
            email,
            phone,
            address,
            gender,
            dob,
            fatherName,
            motherName,
            className,
        });

    } catch (error) {
        console.error("error occured during getting profile", error)
        res.status(500).json({
            success: false,
            message: "error occured during profile getting"
        })
    }
}  