import express from 'express'

import { LoginUser, RegisterUser, RegisterCode, ForgotPassword, ChangePasswordF, ChangePasswordFVer, ResetPassword } from '../controllers/AuthenticationController.js'
import isUserAuthenticated from '../middlewares/isUserAuthenticated.js'


const router = express.Router();

router.post('/login', LoginUser);

router.post('/register', RegisterUser);

router.post('/register/code', RegisterCode);

router.post('/forgot-password', ForgotPassword);

router.post('/forgot-password/change-password/:uniqueURL', ChangePasswordF);

router.get('/forgot-password/change-password/verify/:uniqueURL', ChangePasswordFVer)

router.post('/reset-password', isUserAuthenticated, ResetPassword)

export default router;