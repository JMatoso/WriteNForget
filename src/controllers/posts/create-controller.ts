import { Request, Response } from 'express'
import { SavedUser } from '../../models/user'
import { CreatePost } from '../../models/post'
import { MessageType } from '../../types/message-types'
import { defineMetaTags } from '../../helpers/request-helper'
import { PostRepository } from '../../repositories/post-repository'

const postRepository = new PostRepository()

export const createPost = async (req: Request<{}, {}, CreatePost>, res: Response) => {
    const model = req.body
    const { id } = req.user as SavedUser
    const result = await postRepository.createOrUpdate(model.title, model.content, model.published, id, model.category, model.tags, model.id)
    
    if (result.type !== MessageType.Success) {
        req.flash(result.type, result.message)
        return res.render('posts/write', { metaTags: defineMetaTags(req, 'My Mind'), post: model })
    }

    req.flash(MessageType.Success, result.message)
    res.redirect('/mind')
}

export const deletePost = async (req: Request, res: Response) => {
    const { id } = req.params
    const { id: userId } = req.user as SavedUser
    const result = await postRepository.delete(id, userId)

    if (result.type !== MessageType.Success) {
        req.flash(result.type, result.message)
        return res.redirect('/mind')
    }

    req.flash(MessageType.Success, result.message)
    res.redirect('/mind')
}