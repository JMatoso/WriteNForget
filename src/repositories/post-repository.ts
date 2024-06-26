import { PagedPosts, Post, UpdatePost } from '../models/post'
import { Result } from '../models/result'
import { Comment, PagedComments } from "../models/comment"
import prismaClient from  '../data/prisma-client'
import { ReactionType } from '../types/reaction-types'
import { CategoryRepository } from './category-repository'
import { createFriendlyUrl, tagtize, calculateReadingTime, capitalizeFirstLetters } from '../helpers/string-helper'
import { Pagination } from '../models/pagination'

const categoryRepository = new CategoryRepository()

export class PostRepository {
    async create(title: string, content: string, published: boolean, authorId: string, category: string, tags: string, canRepost: boolean, id?: string)
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
            const isRepostable = canRepost.toString() === 'true' ? true : false

            await prismaClient.post.create({
                data: {
                    title: capitalizeFirstLetters(title),
                    content,
                    authorId,
                    published: isPublished,
                    slug: friendlyUrl,
                    hashtags,
                    canRepost: isRepostable,
                    categoryId: categoryId as string,
                }
            })

            return Result.setSuccess('Thought saved successfully')
        } catch (error) {
            console.error(error)
            return Result.setError('Error saving your thought')
        }
    }

    async findPostToEdit(postId: string, userId: string): Promise<UpdatePost | null> {
        try {
            const post = await prismaClient.post.findFirst({
                where: {
                    id: postId,
                    authorId: userId
                },
                select: {
                    id: true,
                    title: true,
                    content: true,
                    published: true,
                    hashtags: true,
                    category: {
                        select: {
                            name: true
                        }
                    },
                    parent: {
                        select: {
                            slug: true
                        }
                    }
                }
            })

            return post
                ? new UpdatePost(
                    post.id,
                    post.title,
                    post.content as string,
                    post.category.name,
                    post.hashtags,
                    post.published,
                    post.parent ? true : false)
                : null
        }
        catch (error) {
            console.error(error)
            return null
        }
    }

    async update(postId: string, title: string, content: string, published: boolean, authorId: string, category: string, tags: string, canRepost: boolean): Promise<Result> {
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
            const isRepostable = canRepost.toString() === 'true' ? true : false

            const post = await prismaClient.post.update({
                where: {
                    id: postId,
                    authorId,
                    parentId: null
                },
                data: {
                    title: capitalizeFirstLetters(title),
                    content,
                    published: isPublished,
                    slug: friendlyUrl,
                    canRepost: isRepostable,
                    hashtags,
                    categoryId: categoryId as string,
                }
            })

            if (!post) {
                return Result.setError('Thought cannot be edited')
            }

            return Result.setSuccess('Thought updated successfully')
        }
        catch (error) {
            console.error(error)
            return Result.setError('Error updating thought')
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
                    canRepost: true,
                    parent: {
                        select: {
                            slug: true
                        }
                    },
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
                            reactions: true,
                            children: true
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
                post._count.reactions,
                post.canRepost,
                post._count.children,
                post.parent?.slug,))

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
                            reactions: true,
                            children: true
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
                    parent: {
                        select: {
                            slug: true
                        }
                    },
                    comments: {
                        select: {
                            id: true,
                            text: true,
                            authorId: true,
                            reacts: true,
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
                new Comment(comment.id, comment.text, post.id, comment.reacts, comment.authorId, comment.author.nickname, comment.createdAt))

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
                    post.canRepost,
                    post._count.children,
                    post.parent?.slug,
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

    async addComment(postId: string, userId: string, content: string): Promise<Comment | null> {
        try {
            var comment = await prismaClient.comment.create({
                data: {
                    postId,
                    authorId: userId,
                    text: content
                }
            })

            return new Comment(comment.id, comment.text, postId, comment.reacts, userId, '', comment.createdAt)
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async reactComment(commentId: string): Promise<Result> {
        try {
            await prismaClient.comment.update({
                where: {
                    id: commentId
                },
                data: {
                    reacts: {
                        increment: 1
                    }
                }
            })

            return Result.setSuccess('Comment liked successfully')
        } catch (error) {
            console.error(error)
            return Result.setError('Error liking comment')
        }
    }

    async removeComment(commentId: string, userId: string): Promise<Result> {
        try {
            await prismaClient.comment.delete({
                where: {
                    id: commentId,
                    OR: [
                        { post: { authorId: { equals: userId } } },
                        { authorId: userId }
                    ],
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
                    reacts: true,
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
            const pagedComments = comments.map(comment => new Comment(comment.id, comment.text, comment.postId, comment.reacts, comment.authorId, comment.author.nickname, comment.createdAt))
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
                    canRepost: true,
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
                post._count.reactions,
                post.canRepost,
                post._count.children,
                post.parent?.slug,))

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
                    author: {
                        select: {
                            nickname: true
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
                    },
                    {
                        children: {
                            _count: "desc"
                        }
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
                post._count.reactions,
                post.canRepost,
                post._count.children,
                post.parent?.slug))

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
                        { content: { contains: search, mode: 'insensitive' } },
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
                    canRepost: true,
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
                post._count.reactions,
                post.canRepost,
                post._count.children,
                post.parent?.slug,))

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
            const mappedPosts = new Map(recommendedPosts.map(post => [post.id, post]))
            const posts = [...mappedPosts.values()]
            return new PagedPosts(shufflePosts(posts), pagination)
        } catch (error) {
            console.error(error)
            return null
        }

        function shufflePosts(posts: Post[]): Post[] {
            for (let i = posts.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [posts[i], posts[j]] = [posts[j], posts[i]]
            }
            return posts
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

    async repost(postId: string, userId: string): Promise<Result> {
        try {
            const post = await prismaClient.post.findFirst({
                where: {
                    id: postId,
                    published: true,
                },
                select: {
                    title: true,
                    content: true,
                    hashtags: true,
                    canRepost: true,
                    parent: {
                        select: {
                            id: true
                        }
                    },
                    category: {
                        select: {
                            id: true
                        }
                    }
                }
            })
            
            if (!post) {
                return Result.setError('Thought not found')
            }

            const originalPostId = post.parent?.id || postId

            const friendlyUrl = createFriendlyUrl(`${post.title} rethought`)
            await prismaClient.post.create({
                data: {
                    title: post.title,
                    content: post.content,
                    authorId: userId,
                    published: true,
                    slug: friendlyUrl,
                    categoryId: post.category.id,
                    hashtags: post.hashtags,
                    parentId: originalPostId,
                    canRepost: post.canRepost
                }
            })
            return Result.setSuccess('Rethought successfully')
        } catch (error) {
            console.error(error)
            return Result.setError('Error rethoughting')
        }
    }
}