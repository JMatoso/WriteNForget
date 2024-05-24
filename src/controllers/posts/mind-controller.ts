import { Response, Request } from 'express'
import { SavedUser } from '../../models/user'
import { defineMetaTags } from '../../helpers/request-helper'
import { PostRepository } from '../../repositories/post-repository'
import { UserRepository } from '../../repositories/user-repository'
import { CategoryRepository } from '../../repositories/category-repository'

const postRepository = new PostRepository()
const userRepository = new UserRepository()
const categoryRepository = new CategoryRepository()

export const mind = async (req: Request, res: Response) => {
    const { id, nickname, bio } = req.user as SavedUser
    const page = parseInt(req.query.page as string) || 1

    const postsCount = await postRepository.countUserPosts(id)
    const categories = await categoryRepository.findInterests(id)
    const posts = await postRepository.findUserPosts(id, page, 10)
    const latestReactions = await userRepository.findLatestReactions(id)

    res.render('user/mind', { 
        metaTags: defineMetaTags(req, 'My Mind', nickname, bio),
        data: { posts, categories, postsCount, latestReactions }
    })
}

export const write = async (req: Request, res: Response) => {
    const { nickname } = req.user as SavedUser
    res.render('posts/write', { metaTags: defineMetaTags(req, 'My Mind', nickname) })
}