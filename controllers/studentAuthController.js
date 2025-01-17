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
                message: 'Invalid email ID',
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


        // return res.render("resetPassword", {
        //     otpSuccessfulMsg: "OTP sent to your mail",
        //     email: email,
        // });
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
};


// reset controller 
// export const resetController = () => {
//     try {
//         const { newPassword, confirmPassword, otp } = req.body;
//         // validation
//         if (!newPassword || !confirmPassword || !otp) {
//             res.status(400).send({
//                 success: "false",
//                 message: 'please type newPassword or confirmPassword or otp first '
//             })
//         }
//         if (newPassword !== confirmPassword) {
//             res.status(400).send({
//                 success: 'false',
//                 message: "please type same password",
//             })
//         }
//         //verification
//         const existingUser = prisma.verificationDetails.findFirst({
//             where: {
//                 email: otp,
//             }
//         })


//     } catch (error) {
//         console.log(error);
//         res.status(500).send({
//             success: 'false',
//             message: 'something went wrong in reset password'
//         })

//     }
// }
export const resetController = async (req, res) => {
    try {
        const { newPassword, confirmPassword, otp } = req.body;
        const userId = req.params.id
        console.log(userId);
        // Validation
        if (!otp || !newPassword || !confirmPassword) {
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
        // console.log(typeof (otp));
        // console.log(existingUser);
        // console.log(typeof (existingUser.resetOtp));

        // Verify OTP and its expiry
        console.log('Current Time:', new Date());
        console.log('OTP Expiry Time:', existingUser.otpExpiry);

        if (
            existingUser.resetOtp !== otp ||
            new Date() > existingUser.otpExpiry
        ) {
            return res.status(400).send({
                success: false,
                message: 'Invalid or expired OTP.',
            });
        }
        // Hash the new password
        const hashedPassword = await hashPassword(newPassword);

        // Update user's password and clear OTP fields
        await prisma.StudentVerificationDetail.update({
            where: { id: Number(userId) },
            data: {
                password: hashedPassword,
                resetOtp: null,
                otpExpiry: null,
            },
        });

        return res.status(200).send({
            success: true,
            message: 'Password reset successfully.',
        });
    } catch (error) {
        console.error('Error in resetController:', error);
        return res.status(500).send({
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