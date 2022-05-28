import express from 'express'

import { LogOut, isAuthenticated } from '../controllers/MiscellaneousController.js'
import isUserAuthenticated from '../middlewares/isUserAuthenticated.js'


const router = express.Router()


router.get('/isAuthenticated', isAuthenticated);

router.post('/logout', isUserAuthenticated, LogOut)

export default router;