import { google } from 'googleapis';
import nodemailer from 'nodemailer'

const sendEmail = async (mail_options) => {
    const OAuth2_Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI)
    OAuth2_Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN })

    const accessToken = await new Promise((resolve, reject) => {
        OAuth2_Client.getAccessToken((err, token) => {
            if(err) {
                reject(err)
            }
            resolve(token)
        })
    })

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.USER,
            accessToken,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN
        }
    })

    await transporter.sendMail(mail_options)
}

export default sendEmail;