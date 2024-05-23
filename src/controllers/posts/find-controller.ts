import { Request, Response } from 'express'
import { PostRepository } from '../../repositories/post-repository'

const postRepository = new PostRepository()

export const recommended = async (req: Request, res: Response) => {
    
}