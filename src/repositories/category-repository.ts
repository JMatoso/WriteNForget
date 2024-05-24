import prismaClient from '../data/prismaClient'
import { capitalizeFirstLetters } from '../helpers/string-helper'
import { Result } from '../models/result'

export class CategoryRepository {
    async findMany(limit: number = 15): Promise<string[]> {
        const categories = await prismaClient.category.findMany({
            orderBy: [
                { name: 'asc' }, 
                { posts: { _count: 'desc' } }
            ],
            where: {
                isDeleted: false,
                posts: {
                    some: {
                        isDeleted: false,
                        published: true
                    }
                }
            },
            select: {
                name: true
            },
            take: limit
        })

        return categories.map(category => category.name)
    }

    async findInterests(id: string): Promise<string[]> {
        try {
            const categories = await prismaClient.category.findMany({
                orderBy: [
                    { name: 'asc' }, 
                    { posts: { _count: 'desc' } }
                ],
                select: { 
                    name: true,
                    posts: {
                        where: {
                            isDeleted: false,
                            authorId: id
                        },
                        select: {
                            hashtags: true,
                            category: { 
                                select: { name: true }
                            }
                        },
                        take: 10
                    }
                },
                where: {
                    isDeleted: false,
                    posts: {
                        some: {
                            isDeleted: false
                        }
                    }
                }
            })
    
            const data = categories.reduce((acc, category) => {
                category.posts.forEach(post => {
                    post.hashtags.split(',').forEach(hashtag => {
                        acc.add(capitalizeFirstLetters(hashtag.trim()));
                    })
                })
                return acc
            }, new Set())
            
            return [...data].sort() as string[]
        } catch (error) {
            console.error(error)
            return []
        }
    }

    async findExistingCategory(category: string): Promise<{ id: string, name: string } | null> {
        try {
            const existingCategory = await prismaClient.category.findFirst({
                where: {
                    name: {
                        equals: category,
                        mode: 'insensitive'
                    },
                    isDeleted: false
                },
                select: {
                    id: true,
                    name: true
                }
            })

            return existingCategory
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async disableCategory(categoryId: string): Promise<Result> {
        try {
            await prismaClient.category.update({
                where: { id: categoryId },
                data: { isDeleted: true }
            })
            return Result.setSuccess('Category disabled successfully')
        } catch (error) {
            console.error(error)
            return Result.setError('Error disabling category')
        }
    }
}