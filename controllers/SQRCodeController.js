import QRCode from '../models/QRCode.js'
import User from '../models/User.js'
import Child from '../models/Child.js'

export const VerifyQRCode = async (req, res) => {
    try {
        const url = req.params.qrcode

        if(!await User.findOne({ _id: req.userId })) return res.status(401).json({ status: 'error', message: 'Unauthorized' })
        if(!await QRCode.findOne({ url })) return res.status(404).json({ status: 'error', message: 'Not found' })
        if(await Child.findOne({ url })) return res.status(404).json({ status: 'error', message: 'Not found' })
        
        return res.status(200).json({ status: 'ok', message: 'Authorized' })
    } catch (err) {
        return res.json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}

export const UniqueDeviceId = async (req, res) => {
    try {
        const code = req.params.qrcode


        if(!await QRCode.findOne({ url: code })) {
            await QRCode.create({
                url: code
            })
        }

        return res.status(200).json({ status: 'ok' })
    } catch (err) {
        return res.json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}
