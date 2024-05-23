import { Request, Response } from 'express'
import { RegisterUser } from '../../models/user'
import { MessageType } from '../../types/message-types'
import { defineMetaTags } from '../../helpers/request-helper'
import { UserRepository } from '../../repositories/user-repository'

const userRepository = new UserRepository()

export const createUser = async (req: Request<{}, {}, RegisterUser>, res: Response) => {
    const result = await userRepository.create(req.body.nickname, req.body.email, req.body.password)
    req.flash(result.type, result.message)

    if (result.type === MessageType.Success) {
        res.redirect('/login')
        return
    }

    res.render('user/register', { metaTags: defineMetaTags(req, 'Register')})
}

export const register = (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        res.redirect('/')
        return
    }
    
    res.render('user/register', { metaTags: defineMetaTags(req, 'Register')});
}