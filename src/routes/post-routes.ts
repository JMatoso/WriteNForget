import { Router } from "express"
import { validateData } from '../middleware/validation-middleware'
import { createCommentSchema, createPostSchema } from '../schemas/validation-schemas'

import { isAuthenticated } from "../helpers/auth-helper"
import { read } from '../controllers/posts/read-controller'
import { mind, write } from "../controllers/posts/mind-controller"
import { search, categories } from '../controllers/posts/find-controller'
import { react, publish, comment, deleteComment, reactComment } from "../controllers/posts/reaction-controller"
import { createPost, deletePost, repost } from "../controllers/posts/create-controller"

const postRouter = Router()

postRouter.get('/thoughts', search)

postRouter.get('/read/:slug', read)
postRouter.get('/react/:id', isAuthenticated, react)
postRouter.get('/mind', isAuthenticated, mind)
postRouter.put('/publish/:id', isAuthenticated, publish)
postRouter.get('/delete/:id', isAuthenticated, deletePost)

postRouter.get('/fetch-categories', categories)
postRouter.get('/write/:id?', isAuthenticated, write)
postRouter.post('/repost/:id', isAuthenticated, repost)
postRouter.post('/write', isAuthenticated, validateData(createPostSchema), createPost)

postRouter.put('/comment/:id', isAuthenticated, reactComment)
postRouter.delete('/comment/:id', isAuthenticated, deleteComment)
postRouter.post('/comment', isAuthenticated, validateData(createCommentSchema), comment)

export default postRouter