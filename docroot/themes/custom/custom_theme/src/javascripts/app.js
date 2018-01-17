jQuery(function($) {
    'use strict';

    // Flexy header
    flexy_header.init();

    // Flexy navigation
    flexy_navigation.init();

    // Sidr
    $('.sidr-right__toggle').sidr({
        name: 'sidr-main',
        side: 'right',
        renaming: false,
        body: '.layout__wrapper',
        source: '.sidr-source-provider'
    });

    // Slinky
    $('.sidr .slinky-menu').slinky({
        title: true,
        label: ''
    });

    // Enable / disable Bootstrap tooltips, based upon touch events
    if(Modernizr.touchevents) {
        $('[data-toggle=tooltip]').tooltip('hide');
    }
    else {
        $('[data-toggle=tooltip]').tooltip();
    }
});
