import { Request, Response } from 'express'
import { setDefaultMetaTags } from '../helpers/request-helper'
import { PostRepository } from '../repositories/post-repository'
import { MessageType } from '../models/messages'

const postRepository = new PostRepository()

export const index = async (req: Request, res: Response) => {
    const posts = await postRepository.findMany()
    const metaTags = setDefaultMetaTags(req, 'Thoughts')
    console.log('posts', req.user)
    req.flash(MessageType.Info, 'Welcome to the blog')
    res.render('index', { posts, metaTags})
}