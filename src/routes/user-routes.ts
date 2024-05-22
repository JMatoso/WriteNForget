import { Router } from "express"
import { validateData } from '../middleware/validation-middleware'
import { createUserSchema, loginSchema } from '../schemas/validation-schemas'

import { login, signIn } from '../controllers/users/login-controller'
import { createUser, register } from '../controllers/users/register-controller'

const userRouter = Router()

userRouter.get('/login', login)
userRouter.post('/login', validateData(loginSchema), signIn)
userRouter.get('/register', register)
userRouter.post('/register', validateData(createUserSchema), createUser)
userRouter.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) { 
            return next(err) 
        }
        res.redirect('/')
    });
})

export default userRouter