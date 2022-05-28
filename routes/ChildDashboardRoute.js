import express from 'express'

import { SendNotification } from '../controllers/ChildDashboardController.js'

const router = express.Router()


router.post('/send-notification/:qrcode', SendNotification)

export default router;