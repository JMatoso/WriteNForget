import { capitalizeFirstLetters } from '../helpers/string-helper'
import { TinyUser, SavedUser } from '../models/user'
import prismaClient from '../data/prismaClient'
import { Result } from '../models/result'
import bcrypt from 'bcryptjs'

export class UserRepository {
    async create(nickname: string, email: string, password: string): Promise<Result> {
        try {
            if (await this.findByEmail(email)) {
                return Result.setError('User already exists')
            }

            const [_, hash] = await Promise.all([bcrypt.genSalt(10), bcrypt.hash(password, 10)]);
            const user = await prismaClient.user.create({
                data: {
                    nickname: capitalizeFirstLetters(nickname),
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

    async update(id: string, nickname: string, email: string, bio: string): Promise<Result> {
        try {
            const user = await prismaClient.user.update({
                where: { id },
                data: {
                    nickname: capitalizeFirstLetters(nickname),
                    email,
                    bio
                }
            })

            return user
                ? Result.setSuccess('User updated successfully')
                : Result.setError('User update failed')
        } catch (error) {
            console.error(error)
            return Result.setError('Error updating user data')
        }
    }

    async findByEmail(email: string) {
        try {
            const user = await prismaClient.user.findFirst({
                select: {
                    id: true,
                    nickname: true,
                    email: true,
                    password: true,
                },
                where: {
                    email: email,
                    isDeleted: false
                }
            })

            return user
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async findById(id: string): Promise<SavedUser | null> {
        try {
            const user = await prismaClient.user.findFirst({
                select: {
                    id: true,
                    nickname: true,
                    email: true,
                    isDeleted: true,
                    isEmailVerified: true,
                    createdAt: true,
                    password: false
                },
                where: {
                    id: id
                }
            })

            return user
                ? new SavedUser(user.id, user.nickname, user.email, user.isDeleted, user.isEmailVerified, user.createdAt, user.isDeleted)
                : null

        } catch (error) {
            console.error(error)
            return null
        }
    }

    async findByNickname(nickname: string): Promise<TinyUser[]> {
        try {
            const users = await prismaClient.user.findMany({
                select: {
                    id: true,
                    nickname: true,
                    email: false,
                    isDeleted: false,
                    isEmailVerified: false,
                    createdAt: false,
                    password: false
                },
                where: {
                    nickname: { contains: nickname },
                    isDeleted: false
                }
            })

            return users.map(user => new TinyUser(user.id, user.nickname))
        } catch (error) {
            console.error(error)
            return []
        }
    }

    async findUsersWithMostPosts(id?: string, limit: number = 3): Promise<TinyUser[]> {
        try {
            const users = await prismaClient.user.findMany({
                select: {
                    id: true,
                    nickname: true,
                    bio: true
                },
                where: {
                    isDeleted: false,
                    id: { not: id }
                },
                orderBy: {
                    posts: {
                        _count: 'desc'
                    }
                },
                take: limit
            })

            return users.map(user => new TinyUser(user.id, user.nickname, user.bio as string))
        } catch (error) {
            console.error(error)
            return []
        }
    }
}