import passport from 'passport'
import { Login } from '../../models/login'
import { Request, Response, NextFunction } from 'express'
import { defineMetaTags } from '../../helpers/request-helper'

export const signIn = (req: Request<{}, {}, Login>, res: Response, next: NextFunction) => {
    passport.authenticate('local', {
        successRedirect: req.body.redirect,
        failureRedirect: '/login',
        failureFlash: true,
        passReqToCallback: true,
        failureMessage: true
    })(req, res, next)
}

export const login = async (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        res.redirect('/')
        return
    } 

    const redirect = req.query.redirect ? req.query.redirect : '/'
    res.render('login', { metaTags: defineMetaTags(req, 'Login'), redirect})
}