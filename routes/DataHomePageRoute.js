import express from 'express'

import { GetData } from '../controllers/DataHomePageController.js'
import isUserAuthenticated from '../middlewares/isUserAuthenticated.js'

const router = express.Router();

router.get('/', isUserAuthenticated, GetData)

export default router;