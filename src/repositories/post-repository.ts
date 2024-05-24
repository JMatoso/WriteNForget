import { PagedPosts, Post } from '../models/post'
import { Result } from '../models/result'
import { Comment, PagedComments } from "../models/comment"
import prismaClient from '../data/prismaClient'
import { ReactionType } from '../types/reaction-types'
import { CategoryRepository } from './category-repository'
import { createFriendlyUrl, tagtize, calculateReadingTime, capitalizeFirstLetters } from '../helpers/string-helper'
import { Pagination } from '../models/pagination'

const categoryRepository = new CategoryRepository()

export class PostRepository {
    async createOrUpdate(title: string, content: string, published: boolean, authorId: string, category: string, tags: string, id?: string)
        : Promise<Result> {
        try {
            const existingCategory = await categoryRepository.findExistingCategory(category)
            let categoryId = existingCategory?.id

            if (!existingCategory) {
                const newCategory = await prismaClient.category.create({
                    data: { name: capitalizeFirstLetters(category) },
                })
                categoryId = newCategory.id
            }

            const hashtags = tagtize(tags)
            const friendlyUrl = createFriendlyUrl(title)
            const isPublished = published.toString() === 'true' ? true : false

            await prismaClient.post.create({
                data: {
                    title: capitalizeFirstLetters(title),
                    content,
                    authorId,
                    published: isPublished,
                    slug: friendlyUrl,
                    hashtags,
                    categoryId: categoryId as string,
                }
            })

            return Result.setSuccess('Thought saved successfully')
        } catch (error) {
            console.error(error)
            return Result.setError('Error saving your thought')
        }
    }

    async delete(postId: string, userId: string): Promise<Result> {
        try {
            await prismaClient.post.update({
                where: { 
                    id: postId, 
                    authorId: userId 
                },
                data: { isDeleted: true }
            })

            return Result.setSuccess('Thought deleted successfully')
        } catch (error) {
            console.error(error)
            return Result.setError('Error deleting thought')
        }
    }

    async findUserPosts(userId: string, page: number = 1, limit: number = 10): Promise<PagedPosts | null> {
        try {
            const posts = await prismaClient.post.findMany({
                where: {
                    authorId: userId,
                    isDeleted: false
                },
                select: {
                    id: true,
                    title: true,
                    content: true,
                    published: true,
                    authorId: true,
                    createdAt: true,
                    views: true,
                    slug: true,
                    hashtags: true,
                    category: {
                        select: {
                            name: true
                        }
                    },
                    author: {
                        select: {
                            nickname: true
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
                take: limit,
                skip: limit * (page - 1)
            })

            const totalPosts = await prismaClient.post.count({
                where: {
                    authorId: userId,
                    isDeleted: false
                },
            })

            const pagination = new Pagination(page, limit, totalPosts)
            const pagedPosts = posts.map(post => new Post(
                post.id,
                post.title,
                post.content as string,
                post.published,
                post.author.nickname,
                post.authorId,
                post.createdAt,
                post.views,
                post.category.name,
                post.slug,
                post.hashtags.split(','),
                post._count.comments,
                calculateReadingTime(post.content as string),
                post._count.reactions))

            return new PagedPosts(pagedPosts, pagination)
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async findBySlug(slug: string): Promise<Post | null> {
        try {
            const post = await prismaClient.post.findFirst({
                where: {
                    slug,
                    isDeleted: false
                },
                include: {
                    _count: {
                        select: {
                            comments: true,
                            reactions: true
                        }
                    },
                    category: {
                        select: {
                            name: true
                        }
                    },
                    author: {
                        select: {
                            nickname: true
                        }
                    },
                    comments: {
                        select: {
                            id: true,
                            text: true,
                            authorId: true,
                            author: {
                                select: {
                                    nickname: true
                                }
                            },
                            createdAt: true,
                        },
                        orderBy: {
                            createdAt: 'desc'
                        },
                        take: 10,
                    }
                }
            })

            const comments = post?.comments.map(comment => 
                new Comment(comment.id, comment.text, post.id, comment.authorId, comment.author.nickname, comment.createdAt))

            return post
                ? new Post(
                    post.id,
                    post.title,
                    post.content as string,
                    post.published,
                    post.author.nickname,
                    post.authorId,
                    post.createdAt,
                    post.views,
                    post.category.name,
                    post.slug,
                    post.hashtags.split(','),
                    post._count.comments,
                    calculateReadingTime(post.content as string),
                    post._count.reactions,
                    comments)
                : null
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async countUserPosts(userId: string): Promise<number> {
        try {
            const count = await prismaClient.post.count({
                where: {
                    authorId: userId,
                    isDeleted: false
                }
            })

            return count
        } catch (error) {
            console.error(error)
            return 0
        }
    }

    async addReaction(postId: string, userId: string, type: ReactionType): Promise<Result> {
        try {
            /*const existingReaction = await prismaClient.reaction.findFirst({
                where: {
                    postId,
                    authorId: userId
                }
            })

            if (existingReaction) {
                return Result.setError('Reaction already exists')
            }*/

            await prismaClient.reaction.create({
                data: {
                    postId,
                    authorId: userId,
                    type: type
                }
            })

            return Result.setSuccess('Reaction added successfully')
        } catch (error) {
            console.error(error)
            return Result.setError('Error adding reaction')
        }

    }

    async removeReaction(postId: string, userId: string): Promise<Result> {
        try {
            const existingReaction = await prismaClient.reaction.findFirst({
                where: {
                    postId,
                    authorId: userId
                }
            })

            if (!existingReaction) {
                return Result.setError('Reaction does not exist')
            }

            await prismaClient.reaction.delete({
                where: {
                    id: existingReaction.id
                }
            })

            return Result.setSuccess('Reaction removed successfully')
        } catch (error) {
            console.error(error)
            return Result.setError('Error removing reaction')
        }
    }

    async addComment(postId: string, userId: string, content: string): Promise<Result> {
        try {
            await prismaClient.comment.create({
                data: {
                    postId,
                    authorId: userId,
                    text: content
                }
            })

            return Result.setSuccess('Comment added successfully')
        } catch (error) {
            console.error(error)
            return Result.setError('Error adding comment')
        }
    }

    async removeComment(commentId: string): Promise<Result> {
        try {
            await prismaClient.comment.delete({
                where: {
                    id: commentId
                }
            })

            return Result.setSuccess('Comment removed successfully')
        } catch (error) {
            console.error(error)
            return Result.setError('Error removing comment')
        }
    }

    async findComments(postId: string, limit: number = 30, page: number = 1): Promise<PagedComments | null> {
        try {
            const comments = await prismaClient.comment.findMany({
                where: {
                    postId
                },
                select: {
                    id: true,
                    authorId: true,
                    postId: true,
                    text: true,
                    createdAt: true,
                    author: {
                        select: {
                            nickname: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit,
                skip: limit * (page - 1),
            })

            const totalComments = await prismaClient.comment.count({
                where: {
                    postId
                }
            })

            const pagination = new Pagination(page, limit, totalComments)
            const pagedComments = comments.map(comment => new Comment(comment.id, comment.text, comment.postId, comment.authorId, comment.author.nickname, comment.createdAt))
            return new PagedComments(pagedComments, pagination)
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async findRecentPosts(limit: number = 15, page: number = 1): Promise<PagedPosts | null> {
        try {
            const posts = await prismaClient.post.findMany({
                where: {
                    published: true,
                    isDeleted: false
                },
                select: {
                    id: true,
                    title: true,
                    content: true,
                    published: true,
                    authorId: true,
                    createdAt: true,
                    views: true,
                    slug: true,
                    hashtags: true,
                    category: {
                        select: {
                            name: true
                        }
                    },
                    author: {
                        select: {
                            nickname: true
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
                take: limit,
                skip: limit * (page - 1)
            })

            const totalPosts = await prismaClient.post.count({
                where: {
                    isDeleted: false,
                    published: true,
                },
            })

            const pagination = new Pagination(page, limit, totalPosts)
            const pagedPosts = posts.map(post => new Post(
                post.id,
                post.title,
                post.content as string,
                post.published,
                post.author.nickname,
                post.authorId,
                post.createdAt,
                post.views,
                post.category.name,
                post.slug,
                post.hashtags.split(','),
                post._count.comments,
                calculateReadingTime(post.content as string),
                post._count.reactions))
            
            return new PagedPosts(pagedPosts, pagination)
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async findPopularPosts(limit: number = 15, page: number = 1): Promise<PagedPosts | null> {
        try {
            const posts = await prismaClient.post.findMany({
                where: {
                    published: true,
                    isDeleted: false
                },
                select: {
                    id: true,
                    title: true,
                    content: true,
                    published: true,
                    authorId: true,
                    createdAt: true,
                    views: true,
                    slug: true,
                    hashtags: true,
                    category: {
                        select: {
                            name: true
                        }
                    }, author: {
                        select: {
                            nickname: true
                        }
                    },
                    _count: {
                        select: {
                            comments: true,
                            reactions: true
                        }
                    }
                },
                orderBy: [
                    {
                        comments: {
                            _count: "desc"
                        }
                    },
                    {
                        reactions: {
                            _count: "desc"
                        }
                    },
                    {
                        views: "desc"
                    }
                ],
                take: limit,
                skip: limit * (page - 1)
            })

            const totalPosts = await prismaClient.post.count({
                where: {
                    isDeleted: false,
                    published: true,
                },
            })

            const pagination = new Pagination(page, limit, totalPosts)
            const pagedPosts = posts.map(post => new Post(
                post.id,
                post.title,
                post.content as string,
                post.published,
                post.author.nickname,
                post.authorId,
                post.createdAt,
                post.views,
                post.category.name,
                post.slug,
                post.hashtags.split(','),
                post._count.comments,
                calculateReadingTime(post.content as string),
                post._count.reactions))
            
            return new PagedPosts(pagedPosts, pagination)
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async findPosts(search: string, page: number = 1, limit: number = 30, postId?: string): Promise<PagedPosts | null> {
        try {
            const posts = await prismaClient.post.findMany({
                where: {
                    OR: [
                        { title: { contains: search, mode: 'insensitive' } },
                        { content:{ contains: search, mode: 'insensitive' } },
                        { hashtags: { contains: search, mode: 'insensitive' } },
                        { category: { name: { contains: search, mode: 'insensitive' } } },
                        { author: { nickname: { contains: search, mode: 'insensitive' } } }
                    ],
                    published: true,
                    isDeleted: false,
                    id: {
                        not: postId
                    }
                },
                select: {
                    id: true,
                    title: true,
                    content: true,
                    published: true,
                    authorId: true,
                    createdAt: true,
                    views: true,
                    slug: true,
                    hashtags: true,
                    category: {
                        select: {
                            name: true
                        }
                    },
                    author: {
                        select: {
                            nickname: true
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
                take: limit,
                skip: limit * (page - 1)
            })

            const totalPosts = await prismaClient.post.count({
                where: {
                    OR: [
                        { title: { contains: search } },
                        { content: { contains: search } },
                        { hashtags: { contains: search } },
                        { category: { name: { contains: search } } }
                    ],
                    published: true,
                    isDeleted: false,
                    id: {
                        not: postId
                    }
                },
            })

            const pagination = new Pagination(page, limit, totalPosts)
            const pagedPosts = posts.map(post => new Post(
                post.id,
                post.title,
                post.content as string,
                post.published,
                post.author.nickname,
                post.authorId,
                post.createdAt,
                post.views,
                post.category.name,
                post.slug,
                post.hashtags.split(','),
                post._count.comments,
                calculateReadingTime(post.content as string),
                post._count.reactions))

            return new PagedPosts(pagedPosts, pagination)
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async findRecommendedPosts(page: number = 1, limit: number = 15): Promise<PagedPosts | null> {
        try {
            const recentPosts = await this.findRecentPosts(limit, page)
            const popularPosts = await this.findPopularPosts(limit, page)

            if (recentPosts === null || popularPosts === null) {
                return null
            }

            const recommendedPosts = [...recentPosts.posts, ...popularPosts.posts]
            const pagination = recentPosts.pagination.update(popularPosts.pagination.total)
            const postMap = new Map(recommendedPosts.map(post => [post.id, post]))
            return new PagedPosts([...postMap.values()], pagination)
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async incrementViews(postId: string, id?: string): Promise<Result> {
        try {
            await prismaClient.post.update({
                where: { 
                    id: postId,  
                    isDeleted: false,
                    published: true
                },
                data: {
                    views: {
                        increment: 1
                    }
                }
            })

            return Result.setSuccess('Views incremented successfully')
        } catch (error) {
            console.error(error)
            return Result.setError('Error incrementing views')
        }
    }

    async publish(postId: string, userId: string): Promise<Result> {
        try {
            await prismaClient.post.update({
                where: { 
                    id: postId, 
                    authorId: userId 
                },
                data: { published: true }
            })

            return Result.setSuccess('Thought published successfully')
        } catch (error) {
            console.error(error)
            return Result.setError('Error publishing thought')
        }
    }
}