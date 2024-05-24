import { calculateReadingTime, capitalizeFirstLetters } from '../helpers/string-helper'
import { TinyUser, SavedUser, UserWithPosts, PagedTinyUsers, PagedUsersWithPosts } from '../models/user'
import prismaClient from '../data/prismaClient'
import { Result } from '../models/result'
import { Post } from '../models/post'
import bcrypt from 'bcryptjs'
import { Pagination } from '../models/pagination'

export class UserRepository {
    async create(nickname: string, email: string, password: string): Promise<Result> {
        try {
            if (await this.findByEmail(email)) {
                return Result.setError('User already exists')
            }

            const [_, hash] = await Promise.all([bcrypt.genSalt(10), bcrypt.hash(password, 10)])
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
                    bio: true,
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
                ? new SavedUser(user.id, user.nickname, user.email, user.isDeleted, user.isEmailVerified, user.createdAt, user.isDeleted, user.bio as string)
                : null

        } catch (error) {
            console.error(error)
            return null
        }
    }

    async findByIdWithPosts(id: string, page: number = 1, limit: number = 10): Promise<PagedUsersWithPosts | null> {
        try {
            const user = await prismaClient.user.findFirst({
                select: {
                    id: true,
                    nickname: true,
                    bio: true,
                    email: true,
                    isDeleted: true,
                    isEmailVerified: true,
                    createdAt: true,
                    password: false,
                    posts: {
                        where: {
                            published: true,
                            isDeleted: false
                        },
                        select: {
                            id: true,
                            title: true,
                            content: true,
                            published: true,
                            createdAt: true,
                            views: true,
                            slug: true,
                            hashtags: true,
                            category: {
                                select: {
                                    name: true
                                }
                            },
                            _count: {
                                select: {
                                    comments: true,
                                    reactions: true
                                }
                            }
                        },
                        orderBy: {
                            createdAt: 'desc'
                        },
                        skip: (page - 1) * limit,
                        take: limit
                    }
                },
                where: {
                    id: id,
                    isDeleted: false
                }
            })

            if (!user) {
                return null
            }

            const totalUserPosts = await prismaClient.post.count({
                where: {
                    authorId: id,
                    published: true,
                    isDeleted: false
                }
            })

            const pagination = new Pagination(page, totalUserPosts, limit)
            const posts = user.posts.map(post => 
                new Post(post.id, post.title, post.content as string, post.published, user.nickname, user.id, post.createdAt, post.views, post.category.name, post.slug, post.hashtags.split(','), post._count.comments, calculateReadingTime(post.content as string), post._count.reactions))
            const pagedUser = new UserWithPosts(new SavedUser(user.id, user.nickname, user.email, user.isDeleted, user.isEmailVerified, user.createdAt, user.isDeleted, user.bio as string), posts)
            return new PagedUsersWithPosts(pagedUser, pagination)
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async findByNickname(nickname: string, page: number = 1, limit: number = 15): Promise<PagedTinyUsers | null> {
        try {
            const users = await prismaClient.user.findMany({
                select: {
                    id: true,
                    nickname: true,
                    bio: true,
                    email: false,
                    isDeleted: false,
                    isEmailVerified: false,
                    createdAt: false,
                    password: false
                },
                where: {
                    nickname: { 
                        contains: nickname,
                        mode: 'insensitive'
                    },
                    isDeleted: false
                },
                skip: (page - 1) * limit,
                take: limit
            })

            const totalUsers = await prismaClient.user.count({
                where: {
                    nickname: { 
                        contains: nickname,
                        mode: 'insensitive'
                    },
                    isDeleted: false
                }
            })

            const pagination = new Pagination(page, totalUsers, limit)
            const pagedUsers = users.map(user => new TinyUser(user.id, user.nickname, user.bio as string))
            return new PagedTinyUsers(pagedUsers, pagination)
        } catch (error) {
            console.error(error)
            return null
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