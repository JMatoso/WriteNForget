import { Pagination } from "./pagination";

export class Comment {
    id: string;
    text: string;
    postId: string;
    reacts: number
    authorId: string;
    authorNickname: string;
    createdAt: Date;
    constructor(id: string, text: string, postId: string, reacts: number, authorId: string, authorNickname: string, createdAt: Date) {
        this.id = id;
        this.text = text;
        this.postId = postId;
        this.reacts = reacts;
        this.authorId = authorId;
        this.createdAt = createdAt;
        this.authorNickname = authorNickname;
    }
}

export interface CreateComment {
    text: string
    postId: string
}

export class PagedComments {
    comments: Comment[]
    pagination: Pagination
    constructor(comments: Comment[], pagination: Pagination) {
        this.comments = comments
        this.pagination = pagination
    }
}