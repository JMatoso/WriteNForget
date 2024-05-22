import { parse } from 'url'
import { Request } from 'express'
import { MetaTags } from '../models/meta-tags';
import { SavedUser } from '../models/passport-user';

export function getAbsoluteUrl(req: Request): string {
    return req.protocol + '://' + req.get('host') + req.originalUrl;
}

export function getBaseUrl(req: Request): string {
    return req.protocol + '://' + req.get('host');
}

export function getDefaultImageUrl(req: Request): string {
    return `${getBaseUrl(req)}/images/image.jpg`;
}

export function setDefaultMetaTags(req: Request, title: string): MetaTags {
    const metaTags = new MetaTags(getAbsoluteUrl(req), title)
    metaTags.image = getDefaultImageUrl(req);
    return metaTags;
}

export function getFirstPath(req: Request): string {
    const path = req.path.split('/')[1]
    return path ? path : 'home';
}

export interface RequestWithUser extends Request {
    user: SavedUser
}