import { calculateReadingTime, capitalizeFirstLetters } from '../helpers/string-helper'
import { TinyUser, SavedUser, UserWithPosts, PagedTinyUsers, PagedUsersWithPosts } from '../models/user'
import prismaClient from  '../data/prisma-client'
import { Result } from '../models/result'
import { Post, TinyPost } from '../models/post'
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
                    password: false,
                    _count: {
                        select: {
                            followers: true,
                            followings: true
                        }
                    }
                },
                where: {
                    id: id
                }
            })

            return user
                ? new SavedUser(user.id, user.nickname, user.email, user.isDeleted, user.isEmailVerified, user.createdAt, user.isDeleted, user._count.followers,user._count.followings, user.bio as string)
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
                    _count: {
                        select: {
                            posts: true,
                            followers: true,
                            followings: true
                        }
                    },
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
                            canRepost: true,
                            category: {
                                select: {
                                    name: true
                                }
                            },
                            parent: {
                                select: {
                                    slug: true
                                }
                            },
                            _count: {
                                select: {
                                    comments: true,
                                    reactions: true,
                                    children: true
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

            const pagination = new Pagination(page, user._count.posts, limit)
            const posts = user.posts.map(post =>
                new Post(post.id, post.title, post.content as string, post.published, user.nickname, 
                        user.id, post.createdAt, post.views, post.category.name, post.slug, post.hashtags.split(','), 
                        post._count.comments, calculateReadingTime(post.content as string), 
                        post._count.reactions, post.canRepost, post._count.children, post.parent?.slug))
            const userFound = new SavedUser(user.id, 
                user.nickname, 
                user.email, 
                user.isDeleted, 
                user.isEmailVerified, 
                user.createdAt, 
                user.isDeleted, 
                user._count.followers, 
                user._count.followings, 
                user.bio as string)
            const pagedUser = new UserWithPosts(userFound, posts)
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

    async findPopularUsers(id?: string, limit: number = 3): Promise<TinyUser[]> {
        try {
            const reactionCounts = await prismaClient.reaction.groupBy({
                by: ['postId'],
                _count: {
                    postId: true,
                },
                orderBy: {
                    _count: {
                        postId: 'desc',
                    }
                },
                take: limit
            })

            if (!reactionCounts) { return [] }
            
            const topPostIds = reactionCounts.map(reaction => reaction.postId)
            const posts = await prismaClient.post.findMany({
                where: {
                    id: {
                        in: topPostIds,
                    },
                    published: true,
                    isDeleted: false,
                    author: {
                        id: {
                            not: id
                        }
                    }
                },
                select: {
                    id: true,
                    authorId: true,
                    author: {
                        select: {
                            id: true,
                            nickname: true,
                            bio: true,
                        }
                    }
                },
            })
            
            const authorReactionCountMap = new Map()
            reactionCounts.forEach(reaction => {
                const postId = reaction.postId;
                const post = posts.find(post => post.id === postId);
                if (post) {
                    const authorId = post.authorId;
                    const count = reaction._count.postId;
            
                    if (authorReactionCountMap.has(authorId)) {
                        authorReactionCountMap.set(authorId, authorReactionCountMap.get(authorId) + count);
                    } else {
                        authorReactionCountMap.set(authorId, count);
                    }
                }
            })
            
            const sortedAuthors = Array.from(authorReactionCountMap.entries())
                .sort((a, b) => b[1] - a[1])
                .map(entry => entry[0])
            
            const topAuthors = sortedAuthors.map(authorId => {
                return posts.find(post => post.authorId === authorId)?.author
            })
            
            return topAuthors.map(user => new TinyUser(user?.id as string, user?.nickname as string, user?.bio as string))
        } catch (error) {
            console.error(error)
            return []
        }
    }

    async findLatestReactions(id: string, limit: number = 3): Promise<TinyPost[]> {
        try {
            const posts = await prismaClient.post.findMany({
                select: {
                    title: true,
                    slug: true,
                    category: {
                        select: {
                            name: true
                        }
                    }
                },
                where: {
                    reactions: {
                        some: {
                            authorId: id
                        }
                    },
                    published: true,
                    isDeleted: false
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit,
                distinct: ['id']
            })

            return posts.map(post => new TinyPost(post.title, post.category.name, post.slug))
        } catch (error) {
            console.error(error)
            return []
        }
    }

    async follow(followerId: string, followingId: string): Promise<[Result, boolean]> {
        try {
            const followExists = await prismaClient.follower.findFirst({
                where: {
                    followerId,
                    followingId
                }
            })

            if (followExists) {
                await prismaClient.follower.delete({
                    where: {
                        id: followExists.id
                    }
                })

                return [Result.setError('Unfollowed thinker successfully'), false]
            }

            const follow = await prismaClient.follower.create({
                data: {
                    followerId,
                    followingId
                }
            })

            return follow
                ? [Result.setSuccess('User followed successfully'), true]
                : [Result.setError('Error following user'), false]
        } catch (error) {
            console.error(error)
            return [Result.setError('Error following user'), false]
        }
    }

    async findFollowers(id: string, page: number = 1, limit: number = 30): Promise<PagedTinyUsers | null> {
        try {
            const userFollowers = await prismaClient.user.findFirst({
                select: {
                    followers: {
                        select: {
                            follower: {
                                select: {
                                    id: true,
                                    nickname: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            followers: true
                        }
                    }
                },
                where: {
                    id
                },
                skip: (page - 1) * limit,
                take: limit
            })

            if (!userFollowers) {
                return null
            }

            const pagination = new Pagination(page, userFollowers?._count.followers, limit)
            const pagedFollowers = userFollowers?.followers.map(follower => new TinyUser(follower.follower.id, follower.follower.nickname, ''))
            return new PagedTinyUsers(pagedFollowers, pagination)
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async findFollowing(id: string, page: number = 1, limit: number = 30): Promise<PagedTinyUsers | null> {
        try {
            const userFollowings = await prismaClient.user.findFirst({
                select: {
                    followings: {
                        select: {
                            following: {
                                select: {
                                    id: true,
                                    nickname: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            followings: true
                        }
                    }
                },
                where: {
                    id
                },
                skip: (page - 1) * limit,
                take: limit
            })

            if (!userFollowings) {
                return null
            }

            const pagination = new Pagination(page, userFollowings?._count.followings, limit)
            const pagedFollowings = userFollowings?.followings.map(following => new TinyUser(following.following.id, following.following.nickname, ''))
            return new PagedTinyUsers(pagedFollowings, pagination)
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async isFollowing(followerId: string, followingId: string): Promise<boolean> {
        try {
            const followExists = await prismaClient.follower.findUnique({
                where: {
                    followerId_followingId: {
                        followerId,
                        followingId
                    }
                }
            })

            return !!followExists
        } catch (error) {
            console.error(error)
            return false
        }
    }
}