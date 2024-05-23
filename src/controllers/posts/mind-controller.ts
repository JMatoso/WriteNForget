import { Response, Request } from 'express'
import { SavedUser } from '../../models/user'
import { defineMetaTags } from '../../helpers/request-helper'
import { PostRepository } from '../../repositories/post-repository'
import { CategoryRepository } from '../../repositories/category-repository'

const postRepository = new PostRepository()
const categoryRepository = new CategoryRepository()

export const mind = async (req: Request, res: Response) => {
    const { id, nickname } = req.user as SavedUser
    const posts = await postRepository.findUserPosts(id)
    const categories = await categoryRepository.findInterests(id)
    res.render('user/mind', { 
        metaTags: defineMetaTags(req, 'My Mind', nickname),
        categories, 
        posts
    })
}

export const write = async (req: Request, res: Response) => {
    const { nickname } = req.user as SavedUser
    res.render('posts/write', { metaTags: defineMetaTags(req, 'My Mind', nickname) })
}