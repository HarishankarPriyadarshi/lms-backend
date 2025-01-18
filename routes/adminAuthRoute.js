import express from "express";
import {
    forgotController,
    loginController,
    otpController,
    resetController
} from "../controllers/adminAuthController.js";

const router = express.Router()


router.post("/login", loginController);
router.post('/forgotPassword', forgotController)
router.post('/otpverify/:id', otpController)
router.put('/:id', resetController)

export default router;

