import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Joi from 'joi'
import crypto from "crypto"

import Token from '../models/Token.js'
import User from '../models/User.js'
import SendEmail from '../utils/SendMail.js'


export const LoginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        const validateEmail = Joi.object({
            email: Joi.string().email().lowercase().required()
        })

        const { error } = validateEmail.validate({ email })
        if(error) return res.status(409).json({ status: 'error', message: 'Invalid email', type: 'email' })

        const user = await User.findOne({ email })

        if(!user) return res.status(404).json({ status: 'error', message: 'Email/password is incorrect', type: 'all' })

        //Make sure this part doesn't break the login system

        const xAccessToken = req.cookies['x-access-token']

        if(xAccessToken) {
            let error = false
            jwt.verify(xAccessToken, process.env.JWT_SECRET, (err, decoded) => {
                if(!err) error = true;
            })
            if(error) {
                return res.status(400).json({ status: 'error', message: 'Already logged in' })
            }
        }

        if(await bcrypt.compare(password, user.password)){
            const maxAge = 60 * 60 * 24 * 30

            const token = jwt.sign({
                id: user._id
            }, process.env.JWT_SECRET, {
                expiresIn: maxAge
            })

            res.cookie('x-access-token', token, { maxAge: maxAge * 1000, secure: true, sameSite: 'none' })

            return res.status(200).json({ status: 'ok', message: 'Logged in', token: token }).end()
        } else return res.status(400).json({ status: 'error', message: 'Email/password is incorrect', type: 'all' })

    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}

export const RegisterUser = async (req, res) => {
    try {
            const { password, username, email } = req.body
    
            const validateEmail = Joi.object({
                email: Joi.string().email().lowercase().required()
            })
            const { error } = validateEmail.validate({ email })
    
            if(error) return res.status(409).json({ status: 'error', message: 'Invalid email', type: 'email' })
            if(await User.findOne({ email })) return res.status(400).json({ status: 'error', message: 'Already used', type: 'email'});
            if(await User.findOne({ username })) return res.status(400).json({ status: 'error', message: 'Already used', type: 'username'});
    
            const xAccessToken = req.cookies['x-access-token']
    
            if(xAccessToken) {
                let error = false
                jwt.verify(xAccessToken, process.env.JWT_SECRET, (err, decoded) => {
                    if(!err) error = true;
                })
                if(error) {
                    return res.status(400).json({ status: 'error', message: 'Already logged in' })
                }
            }
    
    
            const hashedPassword = await bcrypt.hash(password.toString(), 10)
    
            const maxAge = 900
    
            let code = '';
            const numbers = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ]
            for(let i = 0; i < 6; i++){
                code = code + numbers[Math.floor(Math.random() * 9)].toString()
            }
    
            const token = jwt.sign({
                username,
                email,
                password: hashedPassword,
                code,
            }, process.env.JWT_SECRET_REGISTER, {
                expiresIn: maxAge
            })
    
            const get_html_message = (name, code) => {
                return `
                    <h2>Bună ${name}, inserează numărul de mai jos în căsuța de pe site ca să termini etapa de înregistrare.</h2>
                    <p>Codul de verificare este <span style="font-weight: bold;">${code}</span></p>
                `
                }
    
            const get_message = (name, code) => {
                return `
                Bună ${name}, inserează numărul de mai jos în căsuța de pe site ca să termini etapa de înregistrare.
                Codul de verificare este ${code}.
            `
            }
    
            const mail_options = {
                from: `Hackathon <${process.env.USER}>`,
                subject: 'Cerere de înregistrare',
                to: email,
                text: get_message(username, code),
                html: get_html_message(username, code)
            }
    
            await SendEmail(mail_options).catch(err => console.log(err))
    
            res.cookie('values-id', token, { maxAge: maxAge * 1000, secure: true, sameSite: 'none' })
    
            return res.json({ status: 'ok', message: 'Request accepted', token: token }).end()
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}

export const RegisterCode = async (req, res) => {
    try {
        const { codeValue } = req.body
        const token = req.cookies['values-id']

        if(!token) return res.status(400).json({ status: 'error', message: 'Try again later' })

        jwt.verify(token, process.env.JWT_SECRET_REGISTER, async (err, decoded) => {
            if(err) {
                return res.status(409).json({ status: 'error', message: 'Try again later' })
            } else {
                if(parseInt(codeValue) === parseInt(decoded.code)){
                    if(await User.findOne({ email: decoded.email })) return res.status(400).json({ status: 'error', message: 'Email already used', type: 'email'});

                    const user = await User.create({
                        username: decoded.username,
                        email: decoded.email.toLowerCase(),
                        password: decoded.password,
                    })

                    const maxAge = 60 * 60 * 24 * 30


                    const token = jwt.sign({
                        id: user._id
                    }, process.env.JWT_SECRET, {
                        expiresIn: maxAge
                    })


                    res.cookie('x-access-token', token, { maxAge: maxAge * 1000, secure: true, sameSite: 'none' })

                    return res.status(201).json({ status: 'ok', message: 'User created', token: token }).end()
                } else {
                    return res.status(400).json({ status: 'error', message: 'Wrong code' })
                }
            }
        })
    } catch (err) {
        return res.status(500).json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}

export const ForgotPassword = async (req, res) => {
    try {
        const { email } = req.body

        const validateEmail = Joi.object({
            email: Joi.string().email().lowercase().required()
        })
        const { error } = validateEmail.validate({ email })
        if(error) return res.status(409).json({ status: 'error', message: 'Invalid email', type: 'email' })

        const user = await User.findOne({ email })
        
        if(!user) return res.json({ status: 'ok', message: 'nf' })

        const size = Math.floor(Math.random() * 10 + 30)

        const id = user._id
        let token = await Token.findOne({ userId: id })

        if(!token) {
            const uniqueUrl = crypto.randomBytes(size).toString('hex')
            while(await Token.findOne({ token: uniqueUrl })){
                uniqueUrl = crypto.randomBytes(size).toString('hex')
            }
            token = await Token.create({
                userId: user._id,
                token: uniqueUrl
            })
        } else {
            await Token.deleteOne({ userId: id })
            const uniqueUrl = crypto.randomBytes(size).toString('hex')
            while(await Token.findOne({ token: uniqueUrl })){
                uniqueUrl = crypto.randomBytes(size).toString('hex')
            }
            token = await Token.create({
                userId: user._id,
                token: uniqueUrl
            })
        }

        const forgotPasswordUrl = `${process.env.SERVER}/authentication/forgot-password/${token.token}`

        const get_text_message = (name, url) => {
            return `
                Bună, ${name}
                Tocmai ce am primit o cerere de schimbare a parolei de la tine. Apasă pe link-ul de alături pentru a-ți schimba parola: ${url}.
                Dacă nu-ți amintești să fi făcut o asemenea cerere, ignoră mesajul.
            `
        }

        const get_html_message = (name, url) => {
            return `
                <h2>Bună, ${name}</h2>
                <br />
                Tocmai ce am primit o cerere de schimbare a parolei de la tine. Apasă pe link-ul de alături pentru a-ți schimba parola: <a href="${url}" style="color: blue">${url}</a>.
                <br />
                Dacă nu-ți amintești să fi făcut o asemenea cerere, ignoră mesajul.
            `
        }

        const mail_options = {
            to: email,
            from: `Hackathon <${process.env.USER}>`,
            subject: 'Ai uitat parola?',
            text: get_text_message(user.username, forgotPasswordUrl),
            html: get_html_message(user.username, forgotPasswordUrl)
        }

        await SendEmail(mail_options).catch(err => console.error(err))
        return res.status(200).json({ status: 'ok', message: 'Sent email' })
    } catch(err) {
        return res.status(500).json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}

export const ChangePasswordF = async (req, res) => {
    try {
        const { password,  confirmedPassword } = req.body
        const token = req.params.uniqueURL

        if(!token) return res.status(404).json({ status: 'error', message: 'Page not found' })

        const requestingUser = await Token.findOne({ token })

        if(!requestingUser) return res.status(404).json({ status: 'error', message: 'Page not found' })

        const user = await User.findOne({ _id: requestingUser.userId })

        if(!user) return res.status(404).json({ status: 'error', message: 'User not found' }) 

        if(password !== confirmedPassword) return res.status(400).json({ status: 'error', message: 'The passwords do not match' })
        
        const hashedPassword = await bcrypt.hash(password, 10)
        await User.updateOne({ _id: requestingUser.userId }, 
            { $set: { password: hashedPassword } }
        )
        await Token.deleteOne({ token })

        return res.status(200).json({ status: 'ok', message: 'Changed password' })
    } catch(err) {
        return res.status(500).json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}

export const ChangePasswordFVer = async (req, res) => {
    try {
        const token = req.params.uniqueURL

        if(!token) return res.status(404).json({ status: 'error', message: 'Page not found' })
        const requestingUser = await Token.findOne({ token })

        if(!requestingUser) return res.status(404).json({ status: 'error', message: 'Page not found' })

        return res.status(200).json({ status: 'ok', message: 'Found request' })
    } catch(err) {
        return res.status(500).json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}

export const ResetPassword = async (req, res) => {
    try {
        const { password, newPassword, resetNewPassword } = req.body
        const user = await User.findOne({ _id: req.userId })

        if(!user) return res.status(401).json({ status: 'error', message: 'User is not authenticated' });

        if(newPassword !== resetNewPassword) return res.status(409).json({ status: 'error', message: 'Passwords are not the same' })

        if(await bcrypt.compare(password, user.password)){

            const hashedPassword = await bcrypt.hash(newPassword, 10)
            await User.updateOne({ _id: req.userId }, {
                $set: { password: hashedPassword }
            })

            return res.status(200).json({ status: 'ok', message: 'Changed password' })
        } else return res.status(400).json({ status: 'error', message: 'Wrong password', type: 'password' })

    } catch(err) {
        return res.status(500).json({ status: 'error', message: 'Something went wrong', err: err.message })
    }
}