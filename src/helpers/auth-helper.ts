import { Request, Response, NextFunction } from 'express';
import { MessageType } from '../models/messages';

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash(MessageType.Warning, 'You need to be logged in to access this page')
    res.redirect('/login');
}