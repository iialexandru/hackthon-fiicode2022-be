import mongoose from 'mongoose'


const User = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    code: {
        type: Number,
    },
    children: [{
        id: mongoose.Types.ObjectId,
        parentId: mongoose.Types.ObjectId,
        name: String,
        age: Number,
        notifications: [String]
    }],
    assignedChildren: [{
        id: mongoose.Types.ObjectId,
        parentId: mongoose.Types.ObjectId,
        name: String,
        age: Number,
        notifications: [String]
    }],
    assignedParents: [{
        id: mongoose.Types.ObjectId,
        child: {
            id: mongoose.Types.ObjectId,
            name: String,
            age: Number,
            notifications: [String]
        },
        email: String,
        username: String
    }],
    requests: [{
        id: mongoose.Types.ObjectId,
        email: String,
        username: String,
        role: String,
        childName: String
    }],
    fences: [{
        lng: Number,
        lat: Number,
        radius: Number,
        name: String,
        location: String
    }],
    creationDate: {
        type: Date,
        default: Date.now
    }
}, { minimize: false, collection: 'normal_accounts' })

const UserModel = mongoose.connection.useDb('authentication').model('User', User);

export default UserModel;