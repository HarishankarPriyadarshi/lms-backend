import express from "express";
import {
    forgotController,
    loginController,
    otpController,
    resetController,
} from "../controllers/teacherAuthController.js";

const router = express.Router();
//login, forgotPassword and old and new  password
router.post('/login', loginController)
router.post('/forgotPassword', forgotController)
router.post('/otpverify/:id', otpController)
router.put('/:id', resetController)

export default router;