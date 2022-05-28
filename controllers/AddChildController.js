import Child from '../models/Child.js'
import User from '../models/User.js'
import QRCode from '../models/QRCode.js'

export const CreateChild = async (req, res) => {
    try {
        const { name, age } = req.body

        const user = await User.findOne({ _id: req.userId})
        if(!user) return res.status(401).json({ status: 'error', message: 'Unauthorized'})

        if(await Child.findOne({ url: req.params.qrcode })) return res.status(400).json({ status: 'error', message: 'Person already tracked' })

        await Child.create({
            url: req.params.qrcode,
            name,
            age,
            parentId: req.userId,
            parentName: user.username,
            parentEmail: user.email
        })

        await QRCode.deleteOne({
            url: req.params.qrcode
        })
        
        return res.status(201).json({ status: 'ok', message: 'Child added' })
    } catch (err) {
        return res.json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}

export const RejectChild = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.userId })
        if(!user) return res.status(401).json({ status: 'error', message: 'Unauthorized'})

        await QRCode.deleteOne({
            url: req.params.qrcode
        })

        return res.status(200).json({ status: 'ok', message: 'Deleted request' })
    } catch (err) {
        return res.json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}

export const VerifyIsAdded = async (req, res) => {
    try {
        const { code } = req.body

        const child = await Child.findOne({ url: code })

        if(child) return res.status(400).json({ status: 'error', message: 'Already tracked' })

        return res.status(200).json({ status: 'ok', message: 'Not tracked' })
    } catch (err) {
        return res.json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}