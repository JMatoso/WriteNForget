import { Router } from "express"
import { index, contact, about, terms } from "../controllers/index-controller"

const appRouter = Router()

appRouter.get('/', index)
appRouter.get('/', about)
appRouter.get('/', terms)
appRouter.get('/', contact)

export default appRouter