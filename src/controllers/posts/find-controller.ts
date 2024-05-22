import { Request, Response } from 'express'
import { MetaTags } from '../../models/meta-tags'
import { getAbsoluteUrl, getBaseUrl } from '../../helpers/request-helper'
import { PostRepository } from '../../repositories/post-repository'

const postRepository = new PostRepository()

export const findPosts = async (req: Request, res: Response) => {
    console.log('findPosts')
}