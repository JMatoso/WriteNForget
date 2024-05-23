import { htmlToText } from 'html-to-text'
import { capitalizeFirstLetters } from '../helpers/string-helper'

const defaultDescription = 'Write your thoughts and forget them.'

export class MetaTags {
    title: string;
    author: string;
    keywords: string;
    url: string;
    image: string;
    description: string;

    constructor(url: string,
        title: string = 'Thoughts',
        description: string = defaultDescription,
        author: string = 'WriteNForget',
        image: string = '',
        keywords: string[] = ['Write', 'Forget', 'Thoughts', 'Posts', 'Memories', 'Journal', 'Diary', 'Blog', 'Notes', 'WriteNForget']) {
        this.title = title;
        this.description = description;
        this.author = author;
        this.url = url;
        this.image = image;
        this.keywords = keywords.join(', ')
    }

    setTitle(title?: string) {
        if (!title) {
            return
        }

        this.title = title
    }

    setAuthor(author?: string) {
        if (!author) {
            return
        }

        this.author = author
    }

    setImage(image?: string) {
        if (!image) {
            return
        }

        this.image = image
    }

    setDescription(description?: string) {
        if (!description) {
            return
        }

        if (description.length > 160) {
            const plainText = htmlToText(description.substring(0, 160) + '...', {
                wordwrap: false, 
                preserveNewlines: false 
            })
            this.description = plainText || defaultDescription
            return
        }

        this.description = description;
    }

    setKeywords(keywords?: string[], category?: string) {
        const newKeywords = keywords || []

        if (category) {
            newKeywords.push(category.toLowerCase())
        }

        if (newKeywords.length === 0 || !newKeywords) {
            return
        }

        this.keywords = capitalizeFirstLetters([...new Set(newKeywords)].join(', '))
    }
}