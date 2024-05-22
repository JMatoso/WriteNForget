import prismaClient  from '../data/prismaClient'

export class PostRepository {
    async create(title: string, content: string, authorId: string, categoryId: string, tags: string[]) {
        const post = await prismaClient.post.create({
            data: {
              title,
              content,
              authorId,
              categoryId,
              hashtags: tags.join(',')
            }
        })

        return post
    }

    async findMany() {
        const posts = await prismaClient.post.findMany()
        return posts
    }
}