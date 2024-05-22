import { Request, Response } from 'express'
import { PostRepository } from '../../repositories/post-repository'
import { CreatePost } from '../../models/create-post';

const postRepository = new PostRepository()

export const createPost = (req: Request<{}, {}, CreatePost>, res: Response) => {
    const model = req.body;
    const post = postRepository.create(model.title, model.content, model.authorId);
    res.json({ message: 'Post added successfully', data: post });
}