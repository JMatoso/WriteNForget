import { Router } from "express"
import { validateData } from '../middleware/validation-middleware'
import { createPostSchema } from '../schemas/validation-schemas'

import { findPosts } from '../controllers/posts/find-controller'
import { index } from "../controllers/index-controller"
import { mind, write } from "../controllers/posts/mind-controller"
import { isAuthenticated } from "../helpers/auth-helper"
import { createPost } from "../controllers/posts/create-controller"

const postRouter = Router()

postRouter.get('/', index)
postRouter.get('/find', findPosts)
postRouter.get('/mind', isAuthenticated, mind)
postRouter.get('/write', isAuthenticated, write)
postRouter.post('/write', isAuthenticated, validateData(createPostSchema), createPost)

export default postRouter