import mongoose from 'mongoose'

const Token = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    createdAt: {
        type: Date,
        defauilt: Date.now,
        epxires: 3600
    }
}, { collection: 'change_password_tokens' })

const TokenModel = mongoose.connection.useDb('authentication').model('Token', Token)

export default TokenModel;