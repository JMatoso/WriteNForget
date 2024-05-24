import { Router } from "express"
import { validateData } from '../middleware/validation-middleware'
import { createPostSchema } from '../schemas/validation-schemas'

import { isAuthenticated } from "../helpers/auth-helper"
import { read } from '../controllers/posts/read-controller'
import { mind, write } from "../controllers/posts/mind-controller"
import { search } from '../controllers/posts/find-controller'
import { react, publish } from "../controllers/posts/reaction-controller"
import { createPost, deletePost } from "../controllers/posts/create-controller"

const postRouter = Router()

postRouter.get('/thoughts', search)
postRouter.get('/read/:slug', read)
postRouter.get('/mind', isAuthenticated, mind)
postRouter.get('/write', isAuthenticated, write)
postRouter.get('/react/:id', isAuthenticated, react)
postRouter.get('/publish/:id', isAuthenticated, publish)
postRouter.get('/delete/:id', isAuthenticated, deletePost)
postRouter.post('/write', isAuthenticated, validateData(createPostSchema), createPost)

export default postRouter