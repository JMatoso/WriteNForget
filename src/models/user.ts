import { Pagination } from "./pagination"
import { Post } from "./post"

export class SavedUser {
    id: string
    nickname: string
    bio?: string
    email: string
    isEnabled: boolean
    isEmailVerified: boolean
    createdAt: Date
    isDeleted: boolean
    constructor(id: string, nickname: string, email: string, isEnabled: boolean, isEmailVerified: boolean, createdAt: Date, isDeleted: boolean, bio?: string) {
        this.id = id
        this.nickname = nickname
        this.bio = bio
        this.email = email
        this.isEnabled = isEnabled
        this.isEmailVerified = isEmailVerified
        this.createdAt = createdAt
        this.isDeleted = isDeleted
    }
}

export interface RegisterUser {
    email: string
    password: string
    nickname: string
}

export class TinyUser {
    constructor(
        public id: string,
        public nickname: string,
        public bio?: string,
    ) {}
}

export class UpdateUser {
    constructor(
        public email: string,
        public nickname: string,
        public password: string,
        public bio: string,
    ) {
    }
}

export class UserWithPosts {
    constructor(
        public user: SavedUser,
        public posts: Post[]
    ) {}
}

export class PagedTinyUsers {
    constructor(
        public users: TinyUser[],
        public pagination: Pagination
    ) {}
}

export class PagedUsersWithPosts {
    constructor(
        public data: UserWithPosts,
        public pagination: Pagination
    ) {}
}