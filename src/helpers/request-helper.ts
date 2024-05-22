import { Request } from 'express'
import { MetaTags } from '../models/meta-tags';

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

