import { Router } from "express"
import { validateData } from '../middleware/validation-middleware'
import { createUserSchema, loginSchema, updateUserSchema } from '../schemas/validation-schemas'

import { login, signIn } from '../controllers/users/login-controller'
import { isAuthenticated } from "../helpers/auth-helper"
import { createUser, register, update, edit, author, follow } from '../controllers/users/user-controller'

const userRouter = Router()

userRouter.get('/login', login)
userRouter.post('/login', validateData(loginSchema), signIn)

userRouter.get('/register', register)
userRouter.post('/register', validateData(createUserSchema), createUser)

userRouter.get('/mind/edit', isAuthenticated, edit)
userRouter.post('/mind/edit', isAuthenticated, validateData(updateUserSchema), update)

userRouter.get('/author/:id', author)
userRouter.post('/follow/:id', isAuthenticated, follow)

userRouter.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) { 
            return next(err) 
        }
        res.redirect('/')
    });
})

export default userRouter