export class SavedUser {
    id: string
    nickname: string
    email: string
    isEnabled: boolean
    isEmailVerified: boolean
    createdAt: Date
    isDeleted: boolean
    constructor(id: string, nickname: string, email: string, isEnabled: boolean, isEmailVerified: boolean, createdAt: Date, isDeleted: boolean) {
        this.id = id
        this.nickname = nickname
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