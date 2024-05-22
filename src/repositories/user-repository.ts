import prismaClient  from '../data/prismaClient'
import { Result } from '../models/result'
import bcrypt from 'bcryptjs'

export class UserRepository {
    async create(nickname: string, email: string, password: string) : Promise<Result> {
        try {
            if(await this.findByEmail(email)) {
                return Result.setError('User already exists')
            }
    
            const [_, hash] = await Promise.all([bcrypt.genSalt(10), bcrypt.hash(password, 10)]);
            const user = await prismaClient.user.create({
                data: {
                    nickname,
                    email,
                    password: hash
                }
            })
    
            return user 
                ? Result.setSuccess('User registered successfully') 
                : Result.setError('User registration failed')
        }
        catch (error) {
            console.error(error)
            return Result.setError('Error saving user data')
        }
    }

    async findByEmail(email: string) {
        const user = await prismaClient.user.findFirst({
            where: {
                email
            }
        })

        return user
    }

    async findById(id: string) {
        const user = await prismaClient.user.findFirst({
            where: {
                id
            }
        })

        return user
    }
}