export function createFriendlyUrl(title: string): string {
    let friendlyUrl = title.toLowerCase()
    friendlyUrl = friendlyUrl.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    friendlyUrl = friendlyUrl.replace(/\s+/g, '-')
    friendlyUrl = friendlyUrl.replace(/[^a-z0-9-]/g, '')
    friendlyUrl = friendlyUrl.replace(/-+/g, '-')
    friendlyUrl = friendlyUrl.replace(/^-|-$/g, '')

    return `${friendlyUrl}-${new Date().getTime()}`
}

export function tagtize(tags: string): string {
    const normalized = tags
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/gi, ' ')
        .split(/\s+/)
        .filter(Boolean)

    const uniqueTags = [...new Set(normalized)]
    return uniqueTags.join(',')
}

export function calculateReadingTime(text?: string, wordsPerMinute = 150): number {
    if (!text) {
        return 0
    }

    const words = text.split(/[\s\t\n\r.,;!?]+/)
    return Math.ceil(words.length / wordsPerMinute)
}

export function capitalizeFirstLetters(text: string): string {
    const str = text.trim()
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}