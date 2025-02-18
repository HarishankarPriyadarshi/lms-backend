import express from "express";
import {
    forgotController,
    loginController,
    otpController,
    resetController,
    profileController,
    createEventController,
} from "../controllers/teacherAuthController.js";
import { requireSignIn, isTeacher } from '../middlewares/authMiddleware.js'
const router = express.Router();

router.post('/login', loginController);
router.post('/forgotPassword', forgotController)
router.post('/otpverify', otpController)
router.put('/resetPassword', resetController)
router.get('/profile', requireSignIn, profileController)
router.post('/createEvent', requireSignIn, isTeacher, createEventController)

export default router;