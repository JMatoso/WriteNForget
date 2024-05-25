$(function () {
    const preloader = () => {
        $("html").addClass('ss-preload')
        $(window).on('load', function () {
            $("#loader").fadeOut("slow", function () {
                $("#preloader").delay(300).fadeOut("slow")
            })

            $("html").removeClass('ss-preload')
            $("html").addClass('ss-loaded')
        })
    }

    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

    preloader()
})

function toast(message, status = "#FFFFFF", dismissible = true, duration = 5000) {
    Snackbar.show({
        actionTextColor: status,
        pos: 'bottom-left',
        text: message,
        actionText: 'Dismiss',
        width: 'auto',
        duration: duration,
        textColor: "#FFFFFF",
        showAction: dismissible,
        backgroundColor: '#323232'
    })
}

function setError(error) {
    console.error(error)
    toast('Something went wrong, try again', '#dc3545')
}

function copyLinkToClipBoard(relative) {
    navigator.clipboard.writeText(`${window.location.origin + relative}`)
        .then(toast('Copied', '#FFFFFF'))
        .catch((error) => {
            console.error('Error copying link, try again', error)
            toast('Error copying, check your permissions', '#dc3545')
        })
}

async function react(element, id) {
    try {
        element.disabled = true

        const response = await fetch('/react/' + id)
        const result = JSON.parse(await response.text())

        if (result.success === true) {
            const countElement = document.getElementById(id)
            const count = parseInt(countElement.textContent)
            countElement.textContent = count + 1
        } else { toast(result.message, '#FFFFFF') }

        element.disabled = false
    } 
    catch (error) { setError(error) }
}

async function publish(element, id) {
    try {
        element.disabled = true
        const csrfToken = document.getElementById('csrfToken').value
        const response = await fetch(`/publish/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            }
        })

        const data = JSON.parse(await response.text())
        if (data.success === false) { element.disabled = false }
        toast(data.message, '#FFFFFF')
    } 
    catch (error) { setError(error) }
}

async function comment(element, postId, authorNickname) {
    try {
        element.disabled = true

        const commentPlaceholder = document.getElementById('comment-placeholder')
        const commentCounter = document.getElementById('comment-counter')
        const commentCounterValue = parseInt(commentCounter.textContent)
        const csrfToken = document.getElementById('csrfToken').value

        commentPlaceholder.disabled = true
        const madeComment = commentPlaceholder.value

        if (madeComment.length === 0) {
            element.disabled = false
            commentPlaceholder.disabled = false
            return
        }

        const response = await fetch('/comment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            },
            body: JSON.stringify({ text: madeComment, postId })
        })

        const { result, comment } = JSON.parse(await response.text())

        if (result.success === true) {
            commentPlaceholder.value = ''
            commentCounter.textContent = commentCounterValue + 1
            setData(comment.authorId, authorNickname, 'just now', comment.text, true, comment.id)
        } else { toast(result.message, '#FFFFFF') }

        element.disabled = false
        commentPlaceholder.disabled = false
    } 
    catch (error) { setError(error) }

    function setData(authorId, authorNickname, timeAgo, text, isAuthor, commentId) {
        const container = document.getElementById('comments-container')

        const commentHTML = `
            <div class="border-bottom pt-3 pb-1" id='${commentId}'>
                <div class="d-flex justify-content-between">
                    <div class="fs-x-small pointer" onclick="location.href='/author/${authorId}'">
                        <span class="fw-bold d-block">${authorNickname}</span>
                        <span class="bg-text-muted d-block">${timeAgo}</span>
                    </div>
                    <div>
                        <button type="button" class="btn btn-sm" onclick="reactComment(this, '${commentId}')">
                            <i class="fa-regular fa-lightbulb"></i>
                            <small class="fw-x-normal fs-small" id="comment-counter-${commentId}">
                                0
                            </small>
                        </button>
                        ${isAuthor ? `
                            <button class="btn text-danger" onclick="deleteComment(this, '${commentId}')">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="mt-2 fs-x-small bg-text-black">
                    <p class="text-break">${text}</p>
                </div>
            </div>
        `

        container.insertAdjacentHTML('afterbegin', commentHTML);
    }
}

async function deleteComment(element, commentId) {
    try {
        element.disabled = true
        const csrfToken = document.getElementById('csrfToken').value
        const container = document.getElementById('comments-container')
        const comment = document.getElementById(commentId)

        const response = await fetch(`/comment/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            }
        })

        const data = JSON.parse(await response.text())

        if (data.success === true) {
            container.removeChild(comment)
            const commentCounter = document.getElementById('comment-counter')
            const commentCounterValue = parseInt(commentCounter.textContent)
            commentCounter.textContent = commentCounterValue - 1
        } else { toast(data.message, '#FFFFFF') }
        element.disabled = false
    } 
    catch (error) { setError(error) }
}

async function reactComment(element, commentId) {
    try {
        element.disabled = true
        const commentReactions = document.getElementById(`comment-counter-${commentId}`)
        const csrfToken = document.getElementById('csrfToken').value

        const response = await fetch(`/comment/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            }
        })

        const data = JSON.parse(await response.text())

        if (data.success === true) {
            const count = parseInt(commentReactions.textContent)
            commentReactions.textContent = count + 1
        } else { toast(data.message, '#FFFFFF') }

        element.disabled = false
    }
    catch (error) { setError(error) }
}

async function rethought(element, postId) {
    try {
        element.disabled = true
        const csrfToken = document.getElementById('csrfToken').value
        const rethoughtCounter = document.getElementById(`rethought-counter-${postId}`)

        const response = await fetch(`/repost/${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'CSRF-Token': csrfToken
            }
        })

        const data = JSON.parse(await response.text())
        if (data.success === false) { 
            element.disabled = false 
            element.classList.add('border-0')
            const count = parseInt(rethoughtCounter.textContent)
            rethoughtCounter.textContent = count - 1
        }

        toast(data.message, '#FFFFFF')
    } 
    catch (error) { setError(error) }
}