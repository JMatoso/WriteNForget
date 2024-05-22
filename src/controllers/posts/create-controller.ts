import { Request, Response } from 'express'
import { PostRepository } from '../../repositories/post-repository'
import { CreatePost } from '../../models/create-post';
import { SavedUser } from '../../models/passport-user';
import { MessageType } from '../../models/messages';

const postRepository = new PostRepository()

export const createPost = (req: Request<{}, {}, CreatePost>, res: Response) => {
    const model = req.body
    const { id } = req.user as SavedUser
    const post = postRepository.create(model.title, model.content, id, model.category, model.tags);
    
    if (!post) {
        req.flash(MessageType.Error, 'Error creating post')
        return res.render('/user/write')
    }

    req.flash(MessageType.Success, 'Post created successfully')
    res.redirect('/mind')
}