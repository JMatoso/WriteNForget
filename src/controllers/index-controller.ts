import { Request, Response, NextFunction } from 'express'
import { defineMetaTags } from '../helpers/request-helper'
import { UserRepository } from '../repositories/user-repository'
import { PostRepository } from '../repositories/post-repository'
import { CategoryRepository } from '../repositories/category-repository'

import path from 'path'


const userRepository = new UserRepository()
const postRepository = new PostRepository()
const categoryRepository = new CategoryRepository()

export const index = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1
    const posts = await postRepository.findRecommendedPosts(page)
    let userId = req.isAuthenticated() ? (req.user as any).id : ''
    const users = await userRepository.findPopularUsers(userId)
    const categories = await categoryRepository.findMany()
    res.render(path.join(__dirname, '../views/index'), { 
        data: { posts, users, categories },
        metaTags: defineMetaTags(req, 'Thoughts') 
    })
}

export const notFound = (req: Request, res: Response, next: NextFunction) => {
    const metaTags = defineMetaTags(req, 'Not Found')
    res.status(404).render('notfound', { metaTags })
}

export const error = (req: Request, res: Response, next: NextFunction) => {
    if (process.env.SECRET !== 'development') {
        res.status(500).render('error', { metaTags: defineMetaTags(req, 'Error') })
    } 
}

export const contact = (req: Request, res: Response) => {
    res.render('contact', { metaTags: defineMetaTags(req, 'Get in Touch', '', 'Get in touch with us for any inquiries, feedback, or support.') })
}

export const about = (req: Request, res: Response) => {
    res.render('about', { metaTags: defineMetaTags(req, 'About', '', 'Learn more about the story behind us.') })
}

export const terms = (req: Request, res: Response) => {
    res.render('terms', { metaTags: defineMetaTags(req, 'Terms & Policy', '', 'Stay informed about our privacy practices.') })
}