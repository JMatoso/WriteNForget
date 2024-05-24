import { Request, Response } from 'express'
import { PostRepository } from '../../repositories/post-repository'
import { ReactionType } from '../../types/reaction-types'
import { SavedUser } from '../../models/user'
import { MessageType } from '../../types/message-types'
import { CreateComment } from '../../models/comment'

const postRepository = new PostRepository()

export const react = async (req: Request, res: Response) => {
    if (!req.params.id){
        res.redirect('/notfound')
        return
    }

    if (req.isAuthenticated()) {
        const user = req.user as SavedUser
        const result = await postRepository.addReaction(req.params.id, user.id, ReactionType.Star)
        if (result.type !== MessageType.Success) {
            res.json({ success: false, message: result.message })
            return
        }
    }

    res.json({ success: true, message: 'Reaction added'})
}

export const publish = async (req: Request, res: Response) => {
    const { id } = req.params
    const { id: userId } = req.user as SavedUser
    const result = await postRepository.publish(id, userId)

    if (result.type !== MessageType.Success) {
        res.json({ success: false, message: result.message })
        return
    }

    res.json({ success: true, message: result.message })
}

export const comment = async (req: Request<{}, {}, CreateComment>, res: Response) => {
    const { id: userId } = req.user as SavedUser
    const comment = await postRepository.addComment(req.body.postId, userId, req.body.text)

    if (!comment) {
        const data = {
            result: { success: false, message: 'Response not added' },
            comment: null
        }

        res.json(data)
        return
    }

    const data = {
        result: { success: true, message: 'Response added' },
        comment
    }

    res.json(data)
}

export const deleteComment = async (req: Request, res: Response) => {
    const { id: userId } = req.user as SavedUser
    const result = await postRepository.removeComment(req.params.id, userId)

    if (result.type !== MessageType.Success) {
        res.json({ success: false, message: result.message })
        return
    }

    res.json({ success: true, message: result.message })
}