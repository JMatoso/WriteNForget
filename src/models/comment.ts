export class Comment {
    id: string;
    text: string;
    postId: string;
    authorId: string;
    authorNickname: string;
    createdAt: Date;
    constructor(id: string, text: string, postId: string, authorId: string, authorNickname: string, createdAt: Date) {
        this.id = id;
        this.text = text;
        this.postId = postId;
        this.authorId = authorId;
        this.createdAt = createdAt;
        this.authorNickname = authorNickname;
    }
}

export interface CreateComment {
    text: string
    postId: string
    authorId: string
}