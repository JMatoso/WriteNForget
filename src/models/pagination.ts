export class Pagination {
    constructor(
        public page: number,
        public limit: number,
        public total: number,
    ) { }

    get totalPages(): number {
        return Math.ceil(this.total / this.limit)
    }

    get hasNext(): boolean {
        return this.page < this.totalPages
    }

    get hasPrev(): boolean {
        return this.page > 1
    }

    get canPaginate(): boolean {
        return this.totalPages > 1 && this.total > this.limit && this.hasNext
    }

    get nextPage(): number {
        return this.page + 1
    }

    get prevPage(): number {
        return this.page - 1
    }

    generatePageNumbers(): number[] {
        const totalPages = this.totalPages
        const currentPage = this.page
        const delta = 2
        const range = []

        if (totalPages <= 1) {
            return [1]
        }

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i)
        }

        if (currentPage - delta > 2) {
            range.unshift('...')
        }
        if (currentPage + delta < totalPages - 1) {
            range.push('...')
        }

        range.unshift(1)
        if (totalPages > 1) {
            range.push(totalPages)
        }

        return range as number[]
    }

    update(total: number): Pagination {
        return new Pagination(this.page, this.limit, this.total + total)
    }
}
