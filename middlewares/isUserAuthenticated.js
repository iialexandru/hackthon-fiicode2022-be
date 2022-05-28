import jwt from 'jsonwebtoken'

import User from '../models/User.js'


const isAuthenticated = (req, res, next) => {
    try {
        const token = req.cookies['x-access-token']

        if(!token) return res.status(401).json({ status: 'error', message: 'User is not logged in' })

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if(err) {
                res.clearCookie('x-access-token', { maxAge: maxAge * 1000, secure: true, sameSite: 'none' })
                return res.status(401).json({ status: 'error', message: 'User is not logged in' }).end()
            } else {
                const user = await User.findOne({ _id: decoded.id })
                if(!user) {
                    res.clearCookie('x-access-token', { maxAge: maxAge * 1000, secure: true, sameSite: 'none' })
                    return res.status(400).json({ status: 'error', message: 'User not found' }).end()
                }

                req.userId = decoded.id
                next()
            }
        })
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}

export default isAuthenticated;