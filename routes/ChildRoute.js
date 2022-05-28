import express from 'express'

import { RemoveChildSupervision, GetNotifications, RemoveChild, RemoveParentSupervision, InvitePerson, IncomingInvites, AcceptInvite, RejectInvite, UpdateGeo, GetGeo } from '../controllers/ChildController.js'
import isUserAuthenticated from '../middlewares/isUserAuthenticated.js'

const router = express.Router()


router.post('/remove-child/:child_id', isUserAuthenticated, RemoveChild)

router.post('/remove-child-supervision/:child_id', isUserAuthenticated, RemoveChildSupervision)

router.post('/remove-parent-supervision/:child_id/:parent_id', isUserAuthenticated, RemoveParentSupervision)

router.get('/get-notifications', isUserAuthenticated, GetNotifications)

router.post('/invite-person', isUserAuthenticated, InvitePerson)

router.get('/incoming-invites', isUserAuthenticated, IncomingInvites)

router.post('/accept-invite/:child_id', isUserAuthenticated, AcceptInvite)

router.post('/reject-invite/:child_id', isUserAuthenticated, RejectInvite)

router.post('/update-geo/:qrcode', UpdateGeo)

router.get('/get-geo/:qrcode', isUserAuthenticated, GetGeo)


export default router;