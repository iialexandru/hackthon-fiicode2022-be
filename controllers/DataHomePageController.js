import User from '../models/User.js'
import Child from '../models/Child.js'

export const GetData = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.userId })

        const myChildren = await Child.find({ parentId: req.userId }).sort({ _id: -1 })
        const otherChildrenIWatch = await Child.find({ assignedParentsIds: req.userId }).sort({ _id: -1 })
        const peopleThatWatchMyChildren = await Child.find({ parentId: req.userId, assignedParents: { $ne: [] } }, 'assignedParents -_id').sort({ _id: -1 })
        
        return res.json({ status: 'ok', message: 'Data sent', myChildren, otherChildrenIWatch, peopleThatWatchMyChildren })
    } catch (err) {
        return res.status(400).json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}