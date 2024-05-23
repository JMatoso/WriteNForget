import { Router } from "express"
import { validateData } from '../middleware/validation-middleware'
import { createPostSchema } from '../schemas/validation-schemas'

import { isAuthenticated } from "../helpers/auth-helper"
import { read } from '../controllers/posts/read-controller'
import { mind, write } from "../controllers/posts/mind-controller"
import { createPost } from "../controllers/posts/create-controller"

const postRouter = Router()

postRouter.get('/read/:slug', read)
postRouter.get('/mind', isAuthenticated, mind)
postRouter.get('/write', isAuthenticated, write)
postRouter.post('/write', isAuthenticated, validateData(createPostSchema), createPost)

export default postRouter