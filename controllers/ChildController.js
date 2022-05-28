import Child from '../models/Child.js'
import User from '../models/User.js'

export const RemoveChild = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.userId })

        const deletedChild = await Child.findOne({ _id: req.params.child_id })
        
        // if(deletedChild.parentId !== user._id) return res.status(401).json({ status: 'error', message: 'Unauthorized' })
        // if(!deletedChild) return res.status(404).json({ status: 'error', message: 'Not found' })

        await Child.deleteOne({ _id: req.params.child_id })


        return res.status(200).json({ status: 'ok', message: 'Child removed' })
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}

export const GetNotifications = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.userId })

        const myChildren = await Child.find({ parentId: req.userId }).limit(15).sort({ 'notifications._id': -1 })
        const otherChildrenIWatch = await Child.find({ assignedParentsIds: req.userId }).limit(15).sort({ 'notifications._id': -1 })

        return res.status(200).json({ status: 'ok', message: 'Data sent', myChildren, otherChildrenIWatch: otherChildrenIWatch })
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}

export const RemoveChildSupervision = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.userId })

        const deletedChildSupervision = await Child.findOne({ _id: req.params.child_id })
        
        // if(!deletedChildSupervision.assignedParentsIds.includes(req.userId)) return res.status(401).json({ status: 'error', message: 'Not found' })
        // if(!deletedChildSupervision) return res.status(404).json({ status: 'error', message: 'Not found' })

        await Child.updateOne({ _id: req.params.child_id }, {
            $pull: { assignedParentsIds: req.userId  }
        })
        await Child.updateOne({ _id: req.params.child_id }, {
            $pull: { assignedParents: { id: req.userId }  }
        }, { safe: true, multi: true })

        return res.status(200).json({ status: 'ok', message: 'Supervision removed' })
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}

export const RemoveParentSupervision = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.userId })

        const deletedChildSupervision = await Child.findOne({ _id: req.params.child_id })
        

        // if(!deletedChildSupervision.assignedParentsIds.includes(req.userId)) return res.status(401).json({ status: 'error', message: 'Not found' })
        // if(!deletedChildSupervision) return res.status(404).json({ status: 'error', message: 'Not found' })

        await Child.updateOne({ _id: req.params.child_id }, {
            $pull: { assignedParentsIds: req.params.parent_id  }
        })

        await Child.updateOne({ _id: req.params.child_id }, {
            $pull: { assignedParents: { id: req.params.parent_id }  }
        }, { safe: true, multi: true })

        return res.status(200).json({ status: 'ok', message: 'Supervision removed' })
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}

export const InvitePerson = async (req, res) => {
    try {
        const { email, role, child  } = req.body
        const user = await User.findOne({ _id: req.userId })
        const invitingPerson = await User.findOne({ email })

        if(!invitingPerson || !await Child.findOne({ _id: child })) return res.status(404).json({ status: 'error', message: 'Not found' })

        const idsParents = invitingPerson.requests.map((request) => { return request.id.toString() })

        if(idsParents.includes(child)) return res.status(400).json({ status: 'error', message: 'Already pending'})

        const childUser = await Child.findOne({ _id: child }) 

        const assignedParentsIds = childUser.assignedParentsIds.map(id => { return id.toString() })

        if(assignedParentsIds.includes(invitingPerson._id.toString())) return res.status(400).json({ status: 'error', message: 'Already tracking' })

        const value = { id: child, role, email: user.email, username: user.username, childName: childUser.name, role: role }

        await User.updateOne({ email }, {
            $push: { requests: value }
        })

        return res.status(200).json({ status: 'ok', message: 'Person invited' })
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}

export const IncomingInvites  = async (req, res) => {
    try {
        const invites = await User.findOne({ _id: req.userId }, 'requests')


        return res.status(200).json({ status: 'ok', message: 'Data sent', invites })
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}

export const AcceptInvite = async (req, res) => {
    try {
        const { role } = req.body

        const child = await Child.findOne({ _id: req.params.child_id })

        const user = await User.findOne({ _id: req.userId })

        if(!child) return res.status(404).json({ status: 'error', message: 'Not found' })


        await User.updateOne({ _id: req.userId }, {
            $pull: { requests: { id: req.params.child_id } }
        }, { safe: true, multi: true })

        const value = { childName: child.name, id: req.userId, username: user.username, email: user.email, childId: child._id, role: role  }


        const updated = await Child.updateOne({ _id: req.params.child_id }, {
            $push: { assignedParentsIds: req.userId, assignedParents: value },
        }, { new: true })


        return res.status(200).json({ status: 'ok', message: 'Invite accepted' })
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}

export const RejectInvite = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.userId })

        if(!await Child.findOne({ _id: req.params.child_id })) return res.status(404).json({ status: 'error', message: 'Not found' })

        await User.updateOne({ _id: req.userId }, {
            $pull: { requests: { id: req.params.child_id } }
        }, { safe: true, multi: true })

        return res.status(200).json({ status: 'ok', message: 'Invite rejected' })
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}

export const UpdateGeo = async (req, res) => {
    try {
        const { lng, lat } = req.body
        const child = await Child.findOne({ url: req.params.qrcode })

        if(!child) return res.status(404).json({ status: 'error', message: 'Not found' })

        if(lng && lat) {
            await Child.updateOne({ url: req.params.qrcode }, {
                $set: { geo: { lat: lat, lng: lng } }
            })
        } else return res.status(400).json({ status: 'error', message: 'Invalid coordinates' })

        return res.status(200).json({ status: 'ok', message: 'Location changed' })
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}

export const GetGeo = async (req, res) => {
    try {
        const child = await Child.findOne({ _id: req.params.qrcode })

        const user = await User.findOne({ _id: req.userId })

        if(!child || !user) return res.status(404).json({ status: 'error', message: 'Not found' })

        return res.status(200).json({ status: 'ok', message: 'Location changed', lng: child.geo.lng, lat: child.geo.lat })
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}