import prismaClient from '../data/prismaClient'
import { createFriendlyUrl, tagtize } from '../helpers/string-helper'

export class PostRepository {
    async create(title: string, content: string, authorId: string, category: string, tags: string) {
        try {
            const existingCategory = await this.findExistingCategory(category)
            let categoryId = existingCategory?.id
            
            if (!existingCategory) {
                const newCategory = await prismaClient.category.create({
                    data: { name: category },
                })
                categoryId = newCategory.id                
            }

            const hashtags = tagtize(tags)
            const friendlyUrl = createFriendlyUrl(title)

            const post = await prismaClient.post.create({
                data: {
                    title,
                    content,
                    authorId,
                    slug: friendlyUrl,
                    hashtags,
                    categoryId: categoryId as string,
                }
            })

            return post
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async findMany() {
        const posts = await prismaClient.post.findMany()
        return posts
    }

    async findUserPosts(userId: string) {
        try {
            const posts = await prismaClient.post.findMany({
                where: {
                    authorId: userId
                }
            })
            return posts
        } catch (error) {
            console.error(error)
            return null
        }
    }

    async findExistingCategory(category: string) {
        try {
            const existingCategory = await prismaClient.category.findFirst({
                where: {
                    name: category
                }
            })

            return existingCategory
        } catch (error) {
            console.error(error)
            return null
        }
    }

}