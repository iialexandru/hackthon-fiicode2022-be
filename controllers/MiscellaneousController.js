import User from '../models/User.js';
import jwt from 'jsonwebtoken';


export const LogOut = (req, res) => {
    try {
        const token = req.cookies['x-access-token']

        const maxAge = 60 * 60 * 24 * 30
        
        if(!token) return res.status(400).json({ status: 'error', message: 'Already logged off'})
        res.clearCookie('x-access-token', { maxAge: maxAge * 1000, secure: true, sameSite: 'none' })
        return res.json({ status: 'ok', message: 'User logged off' }).end()
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}

export const isAuthenticated = (req, res) => {
    try {
        const token = req.cookies['x-access-token']

        if(!token) return res.status(401).json({ isLoggedIn: false, userId: '' })

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if(err) {
                const maxAge = 60 * 60 * 24 * 30
                res.clearCookie('x-access-token', { maxAge: maxAge * 1000, secure: true, sameSite: 'none' })
                return res.status(401).json({ isLoggedIn: false, userId: '' }).end()
            } else {
                const user = await User.findOne({ _id: decoded.id })

                if(!user) {
                    const maxAge = 60 * 60 * 24 * 30
                    res.clearCookie('x-access-token', { maxAge: maxAge * 1000, secure: true, sameSite: 'none' })
                    return res.status(400).json({ isLoggedIn: false, userId: '' }).end()
                }
                
                res.status(200).json({ isLoggedIn: true, userId: decoded.id })
                return res.end()
            }
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ isLoggedIn: false, userId: '' })
    }
}