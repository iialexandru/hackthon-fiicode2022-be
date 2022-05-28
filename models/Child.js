import mongoose from 'mongoose'

const Child = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    parentId: {
        type: String,
        required: true
    },
    parentName: {
        type: String,
        required: true,
    },
    parentEmail: {
        type: String, 
        required: true,
    },
    notifications: [{
        text: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 36000
        }
    }],
    location: {
        type: Object
    },
    geo: {
        lat: Number,
        lng: Number
    },
    assignedParentsIds: [mongoose.Types.ObjectId],
    assignedParents: [{
        childName: String,
        id: mongoose.Types.ObjectId,
        username: String,
        email: String,
        childId: mongoose.Types.ObjectId,
        role: String
    }]
}, { minimize: false, collection: 'children' })

const ChildModel = mongoose.connection.useDb('children').model('Child', Child)

export default ChildModel;