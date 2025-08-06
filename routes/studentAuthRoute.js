import express from 'express';
import {
    attendanceController,
    forgotController,
    loginController,
    otpController,
    profileController,
    registerController,
    resetController,
    testController
} from '../controllers/studentAuthController.js';
import { requireSignIn } from '../middlewares/authMiddleware.js'
import { getEventsController } from '../controllers/eventController.js';
import { getAssignmentsController } from "../controllers/assignmentController.js"
const router = express.Router();

//register
router.post("/register", registerController);

//login
router.post('/login', loginController);
//forgot password and resend otp
router.post('/forgotPassword', forgotController)
//otp verification
// router.post('/otpverify/:id', otpController)
router.post('/otpverify', otpController)
//old and new password
router.put('/resetPassword', resetController)
//profile
router.get('/profile', requireSignIn, profileController)
//get event
router.get('/event', requireSignIn, getEventsController)
//get aassignment
router.get('/assignment', requireSignIn, getAssignmentsController)



//attendance
router.get('/attendance/:year/:month', requireSignIn, attendanceController);




















// //testing middleware
// router.get('/test', requireSignIn, testController)
// //testing frontend
// router.get('/hello', (req, res) => {
//     res.json({
//         message: "Hello"
//     })
// })

export default router;