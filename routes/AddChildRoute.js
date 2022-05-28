import express from 'express'

import { VerifyQRCode, UniqueDeviceId   } from '../controllers/SQRCodeController.js'
import { CreateChild, VerifyIsAdded, RejectChild } from '../controllers/AddChildController.js'
import isUserAuthenticated from '../middlewares/isUserAuthenticated.js'

const router = express.Router()


router.get('/unique-device-id/:qrcode', UniqueDeviceId)

router.get('/qr-code-verify/:qrcode', isUserAuthenticated, VerifyQRCode)

router.post('/create-child/:qrcode', isUserAuthenticated, CreateChild)

router.post('/reject-child/:qrcode', isUserAuthenticated, RejectChild)

router.post('/verify-is-added', VerifyIsAdded)


export default router;