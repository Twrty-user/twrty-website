/* ===================================================================
 * twRty - Main JS
 *
 * ------------------------------------------------------------------- */

(function($) {

    "use strict";
    
    var cfg = {
        scrollDuration : 800,
        mailChimpURL   : ''
    },

    $WIN = $(window);

    var doc = document.documentElement;
    doc.setAttribute('data-useragent', navigator.userAgent);

    if (!Modernizr.svg) {
        $(".header-logo img").attr("src", "images/logo.png");
    }

    var clPreloader = function() {
        $WIN.on('load', function() {
            $("html").removeClass('cl-preload');
        });
    };

    var clMoveHeader = function () {
        var hero = $('.page-hero'),
            hdr = $('header'),
            triggerHeight = hero.outerHeight() - 170;

        $WIN.on('scroll', function () {
            var loc = $WIN.scrollTop();
            hdr.toggleClass('sticky', loc > triggerHeight);
            hdr.toggleClass('offset', loc > triggerHeight + 20);
            hdr.toggleClass('scrolling', loc > triggerHeight + 150);
        });
    };

    var clMobileMenu = function() {
        var toggleButton = $('.header-menu-toggle'),
            nav = $('.header-nav-wrap');

        toggleButton.on('click', function(e){
            e.preventDefault();
            toggleButton.toggleClass('is-clicked');
            nav.slideToggle();
        });

        nav.find('a').on("click", function() {
            if (nav.hasClass('mobile')) {
                toggleButton.toggleClass('is-clicked');
                nav.slideToggle();
            }
        });
    };

    var clWaypoints = function() {
        var sections = $(".target-section"),
            navigation_links = $(".header-nav li a");

        sections.waypoint({
            handler: function(direction) {
                var active = $(this.element);
                if (direction === "up") {
                    active = active.prevAll(".target-section").first();
                }
                var active_link = $('.header-nav li a[href="#' + active.attr("id") + '"]');
                navigation_links.parent().removeClass("current");
                active_link.parent().addClass("current");
            },
            offset: '25%'
        });
    };

    /* =========================================================
     * ✅ FINAL, BULLETPROOF PAGE NAV HIGHLIGHT
     * ========================================================= */
    var clPageNavHighlight = function () {

        var navLinks = document.querySelectorAll('.header-nav a');
        var currentURL = new URL(window.location.href);

        // Normalize current URL
        currentURL.hash = '';
        currentURL.pathname = currentURL.pathname.replace(/\/$/, '');

        navLinks.forEach(function(link) {

            link.parentElement.classList.remove('current');

            var linkURL = new URL(link.href, window.location.origin);

            // Normalize link URL
            linkURL.hash = '';
            linkURL.pathname = linkURL.pathname.replace(/\/$/, '');

            // PAGE MATCH (privacy-policy, contact-us, home)
            if (linkURL.pathname === currentURL.pathname) {
                link.parentElement.classList.add('current');
            }

            // HASH MATCH (only on homepage)
            if (
                window.location.hash &&
                link.href.includes(window.location.hash) &&
                currentURL.pathname === ''
            ) {
                link.parentElement.classList.add('current');
            }
        });
    };

    var clStatCount = function() {
        var statSection = $(".s-stats"),
            stats = $(".item-stats__count");

        statSection.waypoint({
            handler: function(direction) {
                if (direction === "down") {
                    stats.each(function () {
                        var $this = $(this);
                        $({ Counter: 0 }).animate({ Counter: $this.text() }, {
                            duration: 4000,
                            step: function (curValue) {
                                $this.text(Math.ceil(curValue));
                            }
                        });
                    });
                }
                this.destroy();
            },
            offset: "90%"
        });
    };

    var clSlickSlider = function() {
        $('.testimonials__slider').slick({
            arrows: false,
            dots: true,
            slidesToShow: 2,
            responsive: [{ breakpoint: 1000, settings: { slidesToShow: 1 }}]
        });
    };

    var clSmoothScroll = function() {
        $('.smoothscroll').on('click', function (e) {
            e.preventDefault();
            var target = this.hash;
            $('html, body').animate({
                scrollTop: $(target).offset().top
            }, cfg.scrollDuration);
        });
    };

    var clPlaceholder = function() {
        $('input, textarea, select').placeholder();
    };

    var clAlertBoxes = function() {
        $('.alert-box').on('click', '.alert-box__close', function() {
            $(this).parent().fadeOut(500);
        });
    };

    var clAOS = function() {
        AOS.init({ once: true, disable: 'mobile' });
    };

    var clAjaxChimp = function() {
        $('#mc-form').ajaxChimp({ url: cfg.mailChimpURL });
    };

    (function clInit() {
        clPreloader();
        clMoveHeader();
        clMobileMenu();
        if (document.querySelector('.target-section')) clWaypoints();
        clPageNavHighlight();
        clStatCount();
        clSlickSlider();
        clSmoothScroll();
        clPlaceholder();
        clAlertBoxes();
        clAOS();
        clAjaxChimp();
    })();

})(jQuery);
