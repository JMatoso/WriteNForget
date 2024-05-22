import { Response, Request } from 'express'
import { setDefaultMetaTags } from '../../helpers/request-helper'
import { SavedUser } from '../../models/passport-user'

export const mind = async (req: Request, res: Response) => {
    const metaTags = setDefaultMetaTags(req, 'My Mind')
    const { nickname } = req.user as SavedUser
    metaTags.author = nickname
    res.render('user/mind', { metaTags })
}