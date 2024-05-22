"use strict"

$(document).ready(() => {
    const $WIN = $(window)

    const preloader = function() {
        $("html").addClass('ss-preload')
        $WIN.on('load', function() {
            // force page scroll position to top at page refresh
            // $('html, body').animate({ scrollTop: 0 }, 'normal');

            // will first fade out the loading animation 
            $("#loader").fadeOut("slow", function() {
                // will fade out the whole DIV that covers the website.
                $("#preloader").delay(300).fadeOut("slow")
            }); 
            
            // for hero content animations 
            $("html").removeClass('ss-preload')
            $("html").addClass('ss-loaded')
        })
    }

    const getYear = function() {
        $WIN.on('load', function() {
            const d = new Date()
            $("#year").text(d.getFullYear())
        })
    }

    preloader()
    getYear()
})