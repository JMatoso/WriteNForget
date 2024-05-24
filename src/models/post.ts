import { Comment } from "./comment"
import { Pagination } from "./pagination"

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
    comments?: Comment[]
    constructor(id: string, 
                title: string, 
                content: string, 
                published: boolean, 
                authorNickname: string, 
                authorId: string, 
                createdAt: Date, 
                views: number, 
                categoryName: string, 
                slug: string, 
                hashtags: string[], 
                numberOfComments: number, 
                readingTime: number, 
                numberOfReactions: number,
                comments?: Comment[]) {
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
        this.comments = comments
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

export class PagedPosts {
    posts: Post[]
    pagination: Pagination
    constructor(posts: Post[], pagination: Pagination) {
        this.posts = posts
        this.pagination = pagination
    }
}

export class TinyPost {
    title: string
    category: string
    slug: string
    constructor(title: string, category: string, slug: string) {
        this.title = title
        this.category = category
        this.slug = slug
    }
}