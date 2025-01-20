import express from 'express';
import {
    forgotController,
    loginController,
    otpController,
    profileController,
    registerController,
    resetController,
    testController
} from '../controllers/studentAuthController.js';
import { requireSignIn } from '../middlewares/authMiddleware.js'
import { eventController, eventControllerByDate } from '../controllers/eventController.js';
const router = express.Router();

//register
router.post("/register", registerController);

//login
router.post('/login', loginController);
//forgot password and resend otp
router.post('/forgotPassword', forgotController)
//otp verification
router.post('/otpverify/:id', otpController)
//old and new password
router.put('/:id', resetController)
//profile
router.get('/profile', requireSignIn, profileController)
//get event
router.get('/event', eventController)
router.get('/event/:date', eventControllerByDate)




















// //testing middleware
// router.get('/test', requireSignIn, testController)
// //testing frontend
// router.get('/hello', (req, res) => {
//     res.json({
//         message: "Hello"
//     })
// })

export default router;