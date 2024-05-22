import { Request, Response } from 'express'
import { setDefaultMetaTags } from '../helpers/request-helper'
import { PostRepository } from '../repositories/post-repository'

const postRepository = new PostRepository()

export const index = async (req: Request, res: Response) => {
    const posts = await postRepository.findMany()
    const metaTags = setDefaultMetaTags(req, 'Thoughts')
    res.render('index', { posts, metaTags})
}