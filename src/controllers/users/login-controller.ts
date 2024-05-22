import passport from 'passport'
import { Login } from '../../models/login'
import { Request, Response } from 'express'
import { setDefaultMetaTags } from '../../helpers/request-helper'

export const signIn = (req: Request<{}, {}, Login>, res: Response) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true,
        passReqToCallback: true,
        failureMessage: true
    })(req, res)
}

export const login = async (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        res.redirect('/')
    } 

    const metaTags = setDefaultMetaTags(req, 'Login')
    res.render('login', { metaTags })
}