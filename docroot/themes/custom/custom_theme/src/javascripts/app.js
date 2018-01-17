jQuery(function($) {
    'use strict';

    // Enable / disable Bootstrap tooltips, based upon touch events
    if(Modernizr.touchevents) {
        $('[data-toggle=tooltip]').tooltip('hide');
    }
    else {
        $('[data-toggle=tooltip]').tooltip();
    }
});
