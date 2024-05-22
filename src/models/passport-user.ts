export class PassportUser {
    id: string
    nickname: string
    constructor(id: string, nickname: string) {
        this.id = id
        this.nickname = nickname
    }
}

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