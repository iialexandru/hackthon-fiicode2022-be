import mongoose from 'mongoose'

const QRCode = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        defauilt: Date.now,
        epxires: 900
    }
}, { collection: 'qr_codes' })

const QRCodeModel = mongoose.connection.useDb('children').model('QRCode', QRCode)

export default QRCodeModel;