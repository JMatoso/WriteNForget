import path from 'path'
import express from "express"
import { Request, Response, NextFunction } from 'express'
import passport from 'passport'
require('./config/auth')(passport)
import flash from 'connect-flash'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import appRouter from './routes/app-routes'
import userRouter from "./routes/user-routes"
import postRouter from "./routes/post-routes"
import { MessageType } from './types/message-types'
import { getFirstPath } from './helpers/request-helper'
import { notFound, error } from './controllers/index-controller'

const app = express()
const PORT = process.env.PORT || 3000
const MAX_AGE = process.env.MAX_AGE || 1000 * 60 * 60 * 24
const SECRET = process.env.SECRET || require('crypto').randomBytes(64).toString('hex')

app.use(cookieParser(SECRET))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
    secret: SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: parseInt(MAX_AGE as string) 
    }
}))

app.use(flash())
app.use(require('csurf')())
app.use(passport.initialize())
app.use(passport.session())

app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.info = req.flash(MessageType.Info)
    res.locals.error = req.flash(MessageType.Error)
    res.locals.warning = req.flash(MessageType.Warning)
    res.locals.success = req.flash(MessageType.Success)

    res.locals.user = req.user || null
    res.locals.path = getFirstPath(req)
    res.locals.year = new Date().getFullYear()
    next()
})

app.locals.moment = require('moment')
app.locals.numeral = require('numeral')
app.locals.pluralize = require('pluralize')
app.locals.formatDistanceToNow = require('date-fns').formatDistanceToNow

app.use(function (req: Request, res: Response, next: NextFunction) {
    res.locals.csrfToken = req.csrfToken()
    next()
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')


app.use(appRouter)
app.use(userRouter)
app.use(postRouter)
app.use(notFound)
app.use(error)

app.listen({
    host: '0.0.0.0',
    port: PORT,
}, () => {
    console.log(`\nServer running on port ${PORT}\n`)
})