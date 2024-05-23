import { Request, Response } from 'express'
import { defineMetaTags } from '../../helpers/request-helper'
import { UserRepository } from '../../repositories/user-repository'
import { PostRepository } from '../../repositories/post-repository'

const postRepository = new PostRepository()
const userRepository = new UserRepository()

export const search = async (req: Request, res: Response) => {
    const search: string | undefined = req.query.search as string;
    const posts = await postRepository.findPosts(search)
    const users = await userRepository.findByNickname(search)

    res.render('posts/search', { 
        search, 
        posts, 
        users,
        metaTags: defineMetaTags(req, `Results for '${search}'`)
    })
}