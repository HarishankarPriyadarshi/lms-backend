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
        console.log(user)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "email is not registered"
            })
        }
        const teacher = await prisma.teacher.findUnique({
            where: { email },
        });
        //token generation
        const token = JWT.sign({ id: user.id, role: teacher.role }, process.env.JWT_SECRET, { expiresIn: '120 days' })
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

        // Validation
        if (!email) {
            return res.status(400).send({
                success: false,
                message: 'Invalid email id',
            });
        }

        const existingUser = await prisma.TeacherVerificationDetail.findUnique({
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

        await prisma.TeacherVerificationDetail.update({
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
export const otpController = async (req, res) => {
    try {
        const { email, otp } = req.body;
        // const userId = req.params.id
        // console.log(userId);
        // Validation
        if (!otp) {
            return res.status(400).json({
                success: false,
                message: 'otp is required.',
            });
        }
        const existingUser = await prisma.TeacherVerificationDetail.findFirst({
            where: {
                // id: Number(userId)
                email,
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
            where: {
                // id: Number(userId)
                email,
            },
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
        const { email, newPassword, confirmPassword } = req.body;
        // const userId = req.params.id
        // console.log(userId);
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
                // id: Number(userId)
                email,
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
            where: { email },
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
export const profileController = async (req, res) => {
    try {
        const teacher = await prisma.teacher.findUnique({
            where: { id: req.user.id }, ///id comes from after populating user in auth middleware
            include: {
                classes: {
                    select: {
                        className: true,
                    },
                },
                subjects: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!teacher) {
            return res.status(404).json({
                sucess: false,
                message: 'teacher not found'
            });
        }

        // Extracting only the required fields
        const {
            firstName,
            middleName,
            lastName,
            email,
            phone,
            address,
            gender,
            classes: { className },
            subjects: { name }
        } = teacher;

        console.log(teacher);
        res.status(200).json({
            sucess: true,
            data: teacher
            // firstName,
            // middleName,
            // lastName,
            // email,
            // phone,
            // address,
            // gender,
            // classes: { className },
            // subjects: { name }
        });

    } catch (error) {
        console.error("error occured during getting profile", error)
        res.status(500).json({
            success: false,
            message: "error occured during profile getting"
        })
    }
}
export const createEventController = async (req, res) => {
    try {
        const { title, description, date, startTime, endTime, classId } = req.body;

        // Ensuring correct time format
        const formattedDate = new Date(date);
        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(`${date}T${endTime}`);

        const eventdata = await prisma.event.create({
            data: {
                title,
                description,
                date: formattedDate,
                startTime: startDateTime,
                endTime: endDateTime,
                classId: Number(classId)
            }
        });

        res.status(201).json({
            success: true,
            message: "Event created successfully",
            eventdata
        });

    } catch (error) {
        console.error("Error while creating event:", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred in event creation",
            error: error.message
        });
    }
};

