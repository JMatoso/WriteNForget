import { Router } from "express"
import { validateData } from '../middleware/validation-middleware'
import { createPostSchema } from '../schemas/validation-schemas'

import { createPost } from '../controllers/posts/create-controller'
import { findPosts } from '../controllers/posts/find-controller'
import { index } from "../controllers/index-controller"

const postRouter = Router()

postRouter.get('/', index)
postRouter.get('/find', findPosts)
postRouter.post('/write', validateData(createPostSchema), createPost)

export default postRouter