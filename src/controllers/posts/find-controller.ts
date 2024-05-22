import { Request, Response } from 'express'
import { MetaTags } from '../../models/meta-tags'
import { getAbsoluteUrl, getBaseUrl, setDefaultMetaTags } from '../../helpers/request-helper'
import { PostRepository } from '../../repositories/post-repository'
import { SavedUser } from '../../models/passport-user'

const postRepository = new PostRepository()

export const findPosts = async (req: Request, res: Response) => {
    const { id, nickname } = req.user as SavedUser
    const posts = await postRepository.findUserPosts(id)
    const metaTags = setDefaultMetaTags(req, 'Writing a Thought')
    metaTags.author = nickname
    res.render('user/m', { metaTags, posts })
}