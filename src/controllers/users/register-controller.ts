import { Request, Response } from 'express';
import { UserRepository } from '../../repositories/user-repository'
import { setDefaultMetaTags } from '../../helpers/request-helper';
import { RegisterUser } from '../../models/register-user';
import { MessageType } from '../../models/messages';

const userRepository = new UserRepository()

export const createUser = async (req: Request<{}, {}, RegisterUser>, res: Response) => {
    const newUser = req.body
    const metaTags = setDefaultMetaTags(req, 'Register')
    const result = await userRepository.create(newUser.nickname, newUser.email, newUser.password)
    req.flash(result.type, result.message)

    if (result.type === MessageType.Success) {
        res.redirect('/login')
    }

    res.render('user/register', { metaTags })
}

export const register = (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        res.redirect('/')
    }
    
    const metaTags = setDefaultMetaTags(req, 'Register')
    res.render('user/register', { metaTags });
}