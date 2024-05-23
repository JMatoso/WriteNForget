import { Router } from "express"
import { index, contact, about, terms } from "../controllers/index-controller"

const appRouter = Router()

appRouter.get('/', index)
appRouter.get('/about', about)
appRouter.get('/terms', terms)
appRouter.get('/contact', contact)

export default appRouter