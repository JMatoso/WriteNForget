import path from 'path'
import express from "express"
import passport from 'passport'
require('./config/auth')(passport)
import flash from 'connect-flash'
import { randomUUID } from 'crypto'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import userRouter from "./routes/user-routes"
import postRouter from "./routes/post-routes"
import { MessageType } from './models/messages'

const app = express()
const PORT = process.env.PORT || 3000
const SECRET = process.env.SECRET || randomUUID()

app.use(cookieParser(SECRET))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
    secret: SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

app.use(flash())

app.use((req, res, next) => {
    res.locals.info = req.flash(MessageType.Info)
    res.locals.warning = req.flash(MessageType.Warning)
    res.locals.success = req.flash(MessageType.Success)
    res.locals.error = req.flash(MessageType.Error)
    res.locals.user = req.user || null
    next()
})

app.use(passport.initialize())
app.use(passport.session())

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(userRouter)
app.use(postRouter)

app.listen({
    host: '0.0.0.0',
    port: PORT,
}, () => {
    console.log(`\nServer is running on port ${PORT}\n`)
})