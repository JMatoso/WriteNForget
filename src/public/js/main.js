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
    console.log(link)
}