export class Post {
    id: string
    title: string
    content?: string
    published: boolean
    authorId: string
    authorNickname: string
    createdAt: Date
    views: number
    categoryName: string
    slug: string
    hashtags: string[]
    numberOfComments: number
    readingTime: number
    numberOfReactions: number
    constructor(id: string, title: string, content: string, published: boolean, authorNickname: string, authorId: string, createdAt: Date, views: number, categoryName: string, slug: string, hashtags: string[], numberOfComments: number, readingTime: number, numberOfReactions: number) {
        this.id = id
        this.title = title
        this.content = content
        this.published = published
        this.authorNickname = authorNickname
        this.authorId = authorId
        this.createdAt = createdAt
        this.views = views
        this.categoryName = categoryName
        this.slug = slug
        this.hashtags = hashtags
        this.numberOfComments = numberOfComments
        this.readingTime = readingTime
        this.numberOfReactions = numberOfReactions
    }
}

export interface CreatePost {
    id?: string
    title: string
    content: string
    category: string
    tags: string
    published: boolean
}