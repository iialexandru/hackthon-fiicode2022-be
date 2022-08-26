import Child from '../models/Child.js'
import User from '../models/User.js'
import QRCode from '../models/QRCode.js'

export const RemoveChild = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.userId })

        const deletedChild = await Child.findOne({ _id: req.params.child_id })
        
        // if(deletedChild.parentId !== user._id) return res.status(401).json({ status: 'error', message: 'Unauthorized' })
        // if(!deletedChild) return res.status(404).json({ status: 'error', message: 'Not found' })

        await Child.deleteOne({ _id: req.params.child_id })
        await QRCode.deleteOne({ url: deletedChild.url })

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
        const parentsIds = child.assignedParentsIds.map((id) => { return id } )
        const parent = await User.findOne({ _id: child.parentId })
        const parents = await User.findOne({ _id:  { $in: parentsIds }  })

        let danger = false, dangerMessage;
        let number = parent.fences.length

        if(number !== 0) {
            for(let i = 0; i < number; i++){
                const latFence = parent.fences[i].lat 
                const lngFence = parent.fences[i].lng
                const radius = parent.fences[i].radius / 2

                const upLat = latFence + radius * 0.0000089
                const downLat = latFence - radius * 0.0000089
                const leftLng = lngFence - radius * 0.0000089
                const rightLng = lngFence + radius * 0.0000089
                if(lat < upLat && lat > downLat &&  lng < rightLng && lng > leftLng){
                    danger = true;
                    dangerMessage = `This person entered: ${parent.fences[i].name}`
                    break;
                }
            }
        }

        if(!danger && parent.length > 0 && parents) {
            for(let j = 0; j < parents.length; j++) {
                let number = parents[j].fences.length
                for(let i = 0; i < number; i++){
                    const latFence = parents[j].fences[i].lat 
                    const lngFence = parents[j].fences[i].lng
                    const radius = parents[j].fences[i].radius / 2
                    
                    const upLat = latFence + radius * 0.0000089
                    const downLat = latFence - radius * 0.0000089
                    const leftLng = lngFence - radius * 0.0000089
                    const rightLng = lngFence + radius * 0.0000089
                    
                    if(lat < upLat && lat > downLat && lng < rightLng && lng > leftLng){
                        danger = true;
                        dangerMessage = `This person entered: ${parent.fences[i].name}`
                        break;
                    }
                }
                
                if(danger) {
                    break;
                }
            }
        }

        if(danger && child.notifications[child.notifications.length - 1].text !== dangerMessage) {
            const value = { text: dangerMessage }
            await Child.updateOne({ url: req.params.qrcode }, {
                $push: { notifications:  value }
            })
        }

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

export const CreateFence = async (req, res) => {
    try {
        const { lat, lng, radius, pName, location } = req.body

        const fence = { lat: lat, lng: lng, radius, name: pName, location }

        await User.updateOne({ _id: req.userId }, {
            $push: { fences: fence }
        })

        return res.status(200).json({ status: 'ok', message: 'Fence created' })
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
} 

export const GetFences = async (req, res) => {
    try {
        const fences = await User.find({ _id: req.userId }, 'fences')

        return  res.status(200).json({ status: 'ok', message: 'Data sent', fences })
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}

export const RemoveFence = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.userId })
        
        await User.updateMany({ _id: req.userId }, {
            $pull: { fences: { name: req.params.name } }
        }, { safe: true, multi: true })

        

        return res.status(200).json({ status: 'ok', message: 'Fence deleted' })
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
} 