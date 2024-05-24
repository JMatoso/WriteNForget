import { Request, Response } from 'express'
import { SavedUser } from '../../models/user'
import { defineMetaTags } from '../../helpers/request-helper'
import { PostRepository } from '../../repositories/post-repository'

const postRepository = new PostRepository()

export const read = async (req: Request, res: Response) => {
    if (!req.params.slug){
        res.redirect('/notfound')
        return
    }

    const post = await postRepository.findBySlug(req.params.slug)

    if (post){
        if (req.isAuthenticated()) {
            const user = req.user as SavedUser
            if (user.id !== post.authorId){
                await postRepository.incrementViews(post.id, user.id)
            }
        }
        else {
            await postRepository.incrementViews(post.id)
        }

        var recommendedPosts = await postRepository.findPosts(post.categoryName, 3, 1, post.id)

        res.render('posts/read', { 
            post, 
            data: recommendedPosts,
            metaTags: defineMetaTags(req, post.title, post.authorNickname ) 
        })
        return
    }

    res.redirect('/notfound')
}