import { Request, Response } from 'express'
import { setDefaultMetaTags } from '../helpers/request-helper'
import { PostRepository } from '../repositories/post-repository'
import { MessageType } from '../models/messages'

const postRepository = new PostRepository()

export const index = async (req: Request, res: Response, next: any) => {
    const posts = await postRepository.findMany()
    const metaTags = setDefaultMetaTags(req, 'Thoughts')
    req.flash(MessageType.Info, 'Welcome to the blog')
    res.render('index', { posts, metaTags})
    next()
}