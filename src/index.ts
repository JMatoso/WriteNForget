import path from 'path'
import csurf from 'csurf'
import express from "express"
import { Request, Response, NextFunction } from 'express'
import passport from 'passport'
require('./config/auth')(passport)
import flash from 'connect-flash'
import { randomUUID } from 'crypto'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import userRouter from "./routes/user-routes"
import postRouter from "./routes/post-routes"
import { MessageType } from './types/message-types'
import { getFirstPath } from './helpers/request-helper'
import { formatDistanceToNow } from 'date-fns'
import moment from 'moment'
import numeral from 'numeral'
import appRouter from './routes/app-routes'
import { notFound, error } from './controllers/index-controller'

const app = express()
const PORT = process.env.PORT || 3000
const SECRET = process.env.SECRET || randomUUID()

app.use(cookieParser(SECRET))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
    secret: SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}))

app.use(flash())
app.use(csurf())
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

    res.locals.moment = moment
    res.locals.numeral = numeral
    res.locals.formatDistanceToNow = formatDistanceToNow
    
    next()
})

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

import fs from 'fs'

app.listen({
    host: '0.0.0.0',
    port: PORT,
}, () => {
    console.log(`\nServer is running on port ${PORT}\n`)
    console.log(`> ${__dirname}`)
    console.log(`> ${path.join(__dirname, 'views')}`)
    console.log(`> ${path.join(__dirname, 'public')}`)
    console.log(`> ${path.join(__dirname, 'views', 'index.ejs')}`)
    
    fs.access(path.join(__dirname, 'views', 'index.ejs'), fs.constants.F_OK, (err) => {
        if (err) {
            console.error('Index not found');
            return;
        }
    
        console.log('Index found');
    });
    
    fs.access(path.join(__dirname, 'views'), fs.constants.F_OK, (err) => {
        if (err) {
            console.error('Views not found');
            return;
        }
    
        console.log('Views found');
    });
})