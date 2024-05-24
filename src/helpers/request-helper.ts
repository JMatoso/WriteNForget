import { Request } from 'express'
import { MetaTags } from '../models/metatags';

export function getAbsoluteUrl(req: Request): string {
    return req.protocol + '://' + req.get('host') + req.originalUrl;
}

export function getBaseUrl(req: Request): string {
    return req.protocol + '://' + req.get('host');
}

export function getDefaultImageUrl(req: Request): string {
    return `${getBaseUrl(req)}/images/image.jpg`;
}

export function defineMetaTags(req: Request, title?: string, author?: string, description?: string, keywords?: string[], category?: string,image?: string)
    : MetaTags {
    const metaTags = new MetaTags(getAbsoluteUrl(req))

    metaTags.setTitle(title)
    metaTags.setAuthor(author)
    metaTags.setDescription(description)
    metaTags.setKeywords(keywords, category)
    metaTags.setImage(image || getDefaultImageUrl(req))

    return metaTags
}

export function getFirstPath(req: Request): string {
    const path = req.path.split('/')[1]
    return path ? path : 'home';
}