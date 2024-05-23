import { UserRepository } from '../repositories/user-repository'
import { TinyUser } from '../models/user'
import localStrategy from 'passport-local'
import bcrypt from 'bcryptjs'

const userRepository = new UserRepository()
const LocalStrategy = localStrategy.Strategy

module.exports = (passport: any) => {
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email: string, password: string, done: any) => {
        const user = await userRepository.findByEmail(email)
        if (!user) {
            return done(null, false, { message: 'User not found' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        return isMatch
            ? done(null, user)
            : done(null, false, { message: 'Wrong credentials' })
    }))

    passport.serializeUser((user: any, done: any) => {
        done(null, new TinyUser(user.id, user.nickname))
    })

    passport.deserializeUser(async (userDeserialized: TinyUser, done: any) => {
        const user = await userRepository.findById(userDeserialized.id)
        return done(null, user || null)
    })
}