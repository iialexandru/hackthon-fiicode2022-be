import Child from '../models/Child.js';
import User from '../models/User.js';


export const SendNotification = async (req, res) => {
    try {
        const { notification } = req.body

        if(!notification) return res.status(401).json({ status: 'error', message: 'Unauthorized' })


        const value = { text: notification }
        await Child.updateOne({ url: req.params.qrcode }, {
            $push: { notifications:  value }
        })

        return res.status(201).json({ status: 'ok', message: 'Notification created' })
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}