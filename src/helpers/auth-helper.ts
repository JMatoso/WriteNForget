import { Request, Response } from 'express';
import { MessageType } from '../models/messages';

export function isAuthenticated(req: Request, res: Response, next: any) {
    if (req.isAuthenticated()) {
        return next()
    }
    req.flash(MessageType.Warning, 'You need to be logged in to access this page')
    res.redirect('/login');
}