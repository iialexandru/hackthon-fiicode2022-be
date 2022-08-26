import express from 'express'
import mongoose from 'mongoose'
import 'dotenv/config'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import AuthenticationRoute from './routes/AuthenticationRoute.js'
import MiscellaneousRoute from './routes/MiscellaneousRoute.js'
import AddChildRoute from './routes/AddChildRoute.js'
import DataHomePageRoute from './routes/DataHomePageRoute.js'
import ChildRoute from './routes/ChildRoute.js'
import ChildDashboardRoute from './routes/ChildDashboardRoute.js'

const app = express()
const PORT = process.env.PORT || 9999

app.set("trust proxy", 1) 
app.use(cors({
    origin: [ 'http://localhost:3000' ],
    credentials: true
}))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', [ 'http://localhost:3000' ])
    res.setHeader('Access-Control-Allow-Credentials', true)
    next()
})

app.use(cookieParser())
app.use(express.json({ limit: '200mb'}))
app.use(express.urlencoded({ limit: '200mb', extended: true}))

app.use('/api-hkt/authentication', AuthenticationRoute)
app.use('/api-hkt/miscellaneous', MiscellaneousRoute)
app.use('/api-hkt/add-child', AddChildRoute)
app.use('/api-hkt/data-homepage', DataHomePageRoute)
app.use('/api-hkt/child', ChildRoute)
app.use('/api-hkt/child-dashboard', ChildDashboardRoute)

mongoose.connect(process.env.DB_CONNECTION, () => {
    app.listen(PORT, () => {
        console.log(`Listening on port: ${PORT}`)
    })
}).catch(err => {
    console.log(err)
})