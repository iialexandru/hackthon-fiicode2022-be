import express from 'express'
import mongoose from 'mongoose'
import 'dotenv/config'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 9999

app.set("trust proxy", 1) 
app.use(cors({
    origin: [ process.env.A_URL ],
    credentials: true
}))

app.use(cookieParser())
app.use(express.json({ limit: '200mb'}))
app.use(express.urlencoded({ limit: '200mb', extended: true}))

mongoose.connect(process.env.DB_CONNECTION, () => {
    app.listen(PORT, () => {
        console.log(`Listening on port: ${PORT}`)
    })
}).catch(err => {
    console.log(err)
})