import prismaClient  from '../data/prismaClient'

export class PostRepository {
    async create(title: string, content: string, authorId: string) {
        const post = await prismaClient.post.create({
            data: {
              title,
              content,
              authorId,
            }
        })

        return post
    }

    async findMany() {
        const posts = await prismaClient.post.findMany()
        return posts
    }
}