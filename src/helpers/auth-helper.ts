import { Request, Response, NextFunction } from 'express';
import { MessageType } from '../types/message-types';

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) {
        return next()
    }

    req.flash(MessageType.Warning, 'You need to be logged in to access that page')
    res.redirect(`/login?redirect=${encodeFullURI(req)}`)
}

function encodeFullURI(req: Request) {
    const url = new URL(req.path, `http://${req.headers.host}`)
    for (const [key, value] of Object.entries(req.query)) {
        url.searchParams.append(key, value as string)
    }
    return encodeURI(url.href)
}