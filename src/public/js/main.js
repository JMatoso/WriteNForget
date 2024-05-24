$(function () {
    const preloader = () => {
        $("html").addClass('ss-preload')

        $(window).on('load', function () {
            // force page scroll position to top at page refresh
            // $('html, body').animate({ scrollTop: 0 }, 'normal');

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

function copyLinkToClipBoard(relative) {
    const link = window.location.origin + relative
    navigator.clipboard.writeText(link)
        .then(() => { })
        .catch((error) => {
            console.error('Error copying link:', error);
        })
}

async function react(element, id) {
    try {
        const response = await fetch('/react/' + id);
        const data = await response.text()

        console.log(data)

        //element.classList.toggle('text-warning')
        const spanElement = document.getElementById(id)
        if (spanElement) {
            const count = parseInt(spanElement.textContent)
            spanElement.textContent = count + 1
        }
    } catch (error) {
        console.error('Error loading content:', error)
    }
}

async function publish(element, id) {
    try {
        const response = await fetch('/publish/' + id)
        const data = await response.text()

        console.log(data)

        element.disabled = true
    } catch (error) {
        console.error('Error loading content:', error)
    }
}