export class MetaTags {
    title: string;
    author: string;
    keywords: string;
    url: string;
    image: string;
    description: string;

    constructor(url: string, 
                title: string = 'Home',  
                description: string = 'Write your thoughts and forget them.', 
                author: string = 'WriteNForget', 
                image: string = '', 
                keywords: string[] = ['Write', 'Forget', 'Thoughts', 'Posts', 'Memories', 'Journal', 'Diary', 'Blog', 'Notes', 'WriteNForget']) {
        this.title = title;
        this.description = description;
        this.author = author;
        this.url = url;
        this.image = image;
        this.keywords = keywords.join(', ');
    }
}