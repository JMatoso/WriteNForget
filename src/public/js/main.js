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

    preloader()
})