import { Request, Response } from 'express'
import { defineMetaTags } from '../../helpers/request-helper'
import { UserRepository } from '../../repositories/user-repository'
import { PostRepository } from '../../repositories/post-repository'
import { CategoryRepository } from '../../repositories/category-repository'

const postRepository = new PostRepository()
const userRepository = new UserRepository()
const categoryRepository = new CategoryRepository()

export const search = async (req: Request, res: Response) => {
    const search: string | undefined = req.query.search as string
    const page = parseInt(req.query.page as string) || 1
    const posts = await postRepository.findPosts(search, page)
    const users = await userRepository.findByNickname(search, page)

    res.render('posts/search', { 
        search, 
        data: { posts, users },
        metaTags: defineMetaTags(req, `Results for '${search}'`)
    })
}

export const categories = async (req: Request, res: Response) => {
    res.json(await categoryRepository.findAll(150))
}