import { Response, Request } from 'express'
import { setDefaultMetaTags } from '../../helpers/request-helper'
import { SavedUser } from '../../models/passport-user'
import { MetaTags } from '../../models/meta-tags'
import { PostRepository } from '../../repositories/post-repository'

const postRepository = new PostRepository()

export const mind = async (req: Request, res: Response) => {
    const { id } = req.user as SavedUser
    const metaTags = setDefaultMetaTags(req, 'My Mind')
    const posts = await postRepository.findUserPosts(id)
    setAuthor(req.user, metaTags)
    res.render('user/mind', { metaTags, posts })
}

export const write = async (req: Request, res: Response) => {
    const metaTags = setDefaultMetaTags(req, 'Writing a Thought')
    setAuthor(req.user, metaTags)
    res.render('user/write', { metaTags })
}

function setAuthor(user: any, metaTags: MetaTags) {
    metaTags.author = user ? (user as SavedUser).nickname : 'WriteNForget'
}