import { Request, Response } from 'express'
import { MessageType } from '../../types/message-types'
import { defineMetaTags } from '../../helpers/request-helper'
import { UserRepository } from '../../repositories/user-repository'
import { PostRepository } from '../../repositories/post-repository'
import { RegisterUser, SavedUser, UpdateUser } from '../../models/user'
import { CategoryRepository } from '../../repositories/category-repository'

const userRepository = new UserRepository()
const postRepository = new PostRepository()
const categoryRepository = new CategoryRepository()

export const createUser = async (req: Request<{}, {}, RegisterUser>, res: Response) => {
    const result = await userRepository.create(req.body.nickname, req.body.email, req.body.password)
    req.flash(result.type, result.message)

    if (result.type === MessageType.Success) {
        res.redirect('/login')
        return
    }

    res.render('user/register', { metaTags: defineMetaTags(req, 'Register')})
}

export const register = (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
        res.redirect('/')
        return
    }
    
    res.render('user/register', { metaTags: defineMetaTags(req, 'Register')});
}

export const edit = async (req: Request, res: Response) => {
    const { nickname, email, bio } = req.user as SavedUser
    res.render('user/edit', { metaTags: defineMetaTags(req, 'Edit Mind', nickname), user: { nickname, email, bio } })
}

export const update = async (req: Request<{}, {}, UpdateUser>, res: Response) => {
    const { id } = req.user as SavedUser
    const result = await userRepository.update(id, req.body.nickname, req.body.email, req.body.bio)
    req.flash(result.type, result.message)
    res.redirect('/mind')
}

export const author = async (req: Request, res: Response) => {
    const { id } = req.params

    if (!id) {
        res.redirect('/')
        return
    }

    if (req.isAuthenticated()) {
        const { id } = req.user as SavedUser

        if (id === req.params.id) {
            res.redirect('/mind')
            return
        }
    }

    const page = parseInt(req.query.page as string) || 1
    const categories = await categoryRepository.findInterests(id)
    const postsCount = await postRepository.countUserPosts(id)
    const userWithPosts = await userRepository.findByIdWithPosts(id, page)

    if (!userWithPosts) {
        res.redirect('/notfound')
        return
    }

    res.render('user/author', { 
        metaTags: defineMetaTags(req, userWithPosts.data.user.nickname, userWithPosts.data.user.nickname, userWithPosts.data.user.bio),  
        data: userWithPosts,
        postsCount,
        categories
    })
}