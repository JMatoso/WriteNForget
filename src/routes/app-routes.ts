import { Router } from "express"
import { index, contact, about, terms, notFoundRedirect } from "../controllers/index-controller"

const appRouter = Router()

appRouter.get('/', index)
appRouter.get('/about', about)
appRouter.get('/terms', terms)
appRouter.get('/contact', contact)
appRouter.get('/notfound', notFoundRedirect)

export default appRouter