'use strict';

/* ========================================================================
 * Bootstrap: tab.js v3.3.7
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function Tab(element) {
    // jscs:disable requireDollarBeforejQueryAssignment
    this.element = $(element);
    // jscs:enable requireDollarBeforejQueryAssignment
  };

  Tab.VERSION = '3.3.7';

  Tab.TRANSITION_DURATION = 150;

  Tab.prototype.show = function () {
    var $this = this.element;
    var $ul = $this.closest('ul:not(.dropdown-menu)');
    var selector = $this.data('target');

    if (!selector) {
      selector = $this.attr('href');
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return;

    var $previous = $ul.find('.active:last a');
    var hideEvent = $.Event('hide.bs.tab', {
      relatedTarget: $this[0]
    });
    var showEvent = $.Event('show.bs.tab', {
      relatedTarget: $previous[0]
    });

    $previous.trigger(hideEvent);
    $this.trigger(showEvent);

    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return;

    var $target = $(selector);

    this.activate($this.closest('li'), $ul);
    this.activate($target, $target.parent(), function () {
      $previous.trigger({
        type: 'hidden.bs.tab',
        relatedTarget: $this[0]
      });
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: $previous[0]
      });
    });
  };

  Tab.prototype.activate = function (element, container, callback) {
    var $active = container.find('> .active');
    var transition = callback && $.support.transition && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length);

    function next() {
      $active.removeClass('active').find('> .dropdown-menu > .active').removeClass('active').end().find('[data-toggle="tab"]').attr('aria-expanded', false);

      element.addClass('active').find('[data-toggle="tab"]').attr('aria-expanded', true);

      if (transition) {
        element[0].offsetWidth; // reflow for transition
        element.addClass('in');
      } else {
        element.removeClass('fade');
      }

      if (element.parent('.dropdown-menu').length) {
        element.closest('li.dropdown').addClass('active').end().find('[data-toggle="tab"]').attr('aria-expanded', true);
      }

      callback && callback();
    }

    $active.length && transition ? $active.one('bsTransitionEnd', next).emulateTransitionEnd(Tab.TRANSITION_DURATION) : next();

    $active.removeClass('in');
  };

  // TAB PLUGIN DEFINITION
  // =====================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.tab');

      if (!data) $this.data('bs.tab', data = new Tab(this));
      if (typeof option == 'string') data[option]();
    });
  }

  var old = $.fn.tab;

  $.fn.tab = Plugin;
  $.fn.tab.Constructor = Tab;

  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old;
    return this;
  };

  // TAB DATA-API
  // ============

  var clickHandler = function clickHandler(e) {
    e.preventDefault();
    Plugin.call($(this), 'show');
  };

  $(document).on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler).on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler);
}(jQuery);
'use strict';

/* ========================================================================
 * Bootstrap: transition.js v3.3.7
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap');

    var transEndEventNames = {
      WebkitTransition: 'webkitTransitionEnd',
      MozTransition: 'transitionend',
      OTransition: 'oTransitionEnd otransitionend',
      transition: 'transitionend'
    };

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] };
      }
    }

    return false; // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false;
    var $el = this;
    $(this).one('bsTransitionEnd', function () {
      called = true;
    });
    var callback = function callback() {
      if (!called) $($el).trigger($.support.transition.end);
    };
    setTimeout(callback, duration);
    return this;
  };

  $(function () {
    $.support.transition = transitionEnd();

    if (!$.support.transition) return;

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function handle(e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments);
      }
    };
  });
}(jQuery);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* ========================================================================
 * Bootstrap: tooltip.js v3.3.7
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function Tooltip(element, options) {
    this.type = null;
    this.options = null;
    this.enabled = null;
    this.timeout = null;
    this.hoverState = null;
    this.$element = null;
    this.inState = null;

    this.init('tooltip', element, options);
  };

  Tooltip.VERSION = '3.3.7';

  Tooltip.TRANSITION_DURATION = 150;

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  };

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled = true;
    this.type = type;
    this.$element = $(element);
    this.options = this.getOptions(options);
    this.$viewport = this.options.viewport && $($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : this.options.viewport.selector || this.options.viewport);
    this.inState = { click: false, hover: false, focus: false };

    if (this.$element[0] instanceof document.constructor && !this.options.selector) {
      throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!');
    }

    var triggers = this.options.trigger.split(' ');

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i];

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
      } else if (trigger != 'manual') {
        var eventIn = trigger == 'hover' ? 'mouseenter' : 'focusin';
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';

        this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this));
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this));
      }
    }

    this.options.selector ? this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' }) : this.fixTitle();
  };

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS;
  };

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options);

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      };
    }

    return options;
  };

  Tooltip.prototype.getDelegateOptions = function () {
    var options = {};
    var defaults = this.getDefaults();

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value;
    });

    return options;
  };

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ? obj : $(obj.currentTarget).data('bs.' + this.type);

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions());
      $(obj.currentTarget).data('bs.' + this.type, self);
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true;
    }

    if (self.tip().hasClass('in') || self.hoverState == 'in') {
      self.hoverState = 'in';
      return;
    }

    clearTimeout(self.timeout);

    self.hoverState = 'in';

    if (!self.options.delay || !self.options.delay.show) return self.show();

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show();
    }, self.options.delay.show);
  };

  Tooltip.prototype.isInStateTrue = function () {
    for (var key in this.inState) {
      if (this.inState[key]) return true;
    }

    return false;
  };

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ? obj : $(obj.currentTarget).data('bs.' + this.type);

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions());
      $(obj.currentTarget).data('bs.' + this.type, self);
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false;
    }

    if (self.isInStateTrue()) return;

    clearTimeout(self.timeout);

    self.hoverState = 'out';

    if (!self.options.delay || !self.options.delay.hide) return self.hide();

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide();
    }, self.options.delay.hide);
  };

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type);

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e);

      var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0]);
      if (e.isDefaultPrevented() || !inDom) return;
      var that = this;

      var $tip = this.tip();

      var tipId = this.getUID(this.type);

      this.setContent();
      $tip.attr('id', tipId);
      this.$element.attr('aria-describedby', tipId);

      if (this.options.animation) $tip.addClass('fade');

      var placement = typeof this.options.placement == 'function' ? this.options.placement.call(this, $tip[0], this.$element[0]) : this.options.placement;

      var autoToken = /\s?auto?\s?/i;
      var autoPlace = autoToken.test(placement);
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top';

      $tip.detach().css({ top: 0, left: 0, display: 'block' }).addClass(placement).data('bs.' + this.type, this);

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element);
      this.$element.trigger('inserted.bs.' + this.type);

      var pos = this.getPosition();
      var actualWidth = $tip[0].offsetWidth;
      var actualHeight = $tip[0].offsetHeight;

      if (autoPlace) {
        var orgPlacement = placement;
        var viewportDim = this.getPosition(this.$viewport);

        placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top' : placement == 'top' && pos.top - actualHeight < viewportDim.top ? 'bottom' : placement == 'right' && pos.right + actualWidth > viewportDim.width ? 'left' : placement == 'left' && pos.left - actualWidth < viewportDim.left ? 'right' : placement;

        $tip.removeClass(orgPlacement).addClass(placement);
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);

      this.applyPlacement(calculatedOffset, placement);

      var complete = function complete() {
        var prevHoverState = that.hoverState;
        that.$element.trigger('shown.bs.' + that.type);
        that.hoverState = null;

        if (prevHoverState == 'out') that.leave(that);
      };

      $.support.transition && this.$tip.hasClass('fade') ? $tip.one('bsTransitionEnd', complete).emulateTransitionEnd(Tooltip.TRANSITION_DURATION) : complete();
    }
  };

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip = this.tip();
    var width = $tip[0].offsetWidth;
    var height = $tip[0].offsetHeight;

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10);
    var marginLeft = parseInt($tip.css('margin-left'), 10);

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop)) marginTop = 0;
    if (isNaN(marginLeft)) marginLeft = 0;

    offset.top += marginTop;
    offset.left += marginLeft;

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function using(props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        });
      }
    }, offset), 0);

    $tip.addClass('in');

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth = $tip[0].offsetWidth;
    var actualHeight = $tip[0].offsetHeight;

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight;
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight);

    if (delta.left) offset.left += delta.left;else offset.top += delta.top;

    var isVertical = /top|bottom/.test(placement);
    var arrowDelta = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight;
    var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight';

    $tip.offset(offset);
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical);
  };

  Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
    this.arrow().css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%').css(isVertical ? 'top' : 'left', '');
  };

  Tooltip.prototype.setContent = function () {
    var $tip = this.tip();
    var title = this.getTitle();

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title);
    $tip.removeClass('fade in top bottom left right');
  };

  Tooltip.prototype.hide = function (callback) {
    var that = this;
    var $tip = $(this.$tip);
    var e = $.Event('hide.bs.' + this.type);

    function complete() {
      if (that.hoverState != 'in') $tip.detach();
      if (that.$element) {
        // TODO: Check whether guarding this code with this `if` is really necessary.
        that.$element.removeAttr('aria-describedby').trigger('hidden.bs.' + that.type);
      }
      callback && callback();
    }

    this.$element.trigger(e);

    if (e.isDefaultPrevented()) return;

    $tip.removeClass('in');

    $.support.transition && $tip.hasClass('fade') ? $tip.one('bsTransitionEnd', complete).emulateTransitionEnd(Tooltip.TRANSITION_DURATION) : complete();

    this.hoverState = null;

    return this;
  };

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element;
    if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
    }
  };

  Tooltip.prototype.hasContent = function () {
    return this.getTitle();
  };

  Tooltip.prototype.getPosition = function ($element) {
    $element = $element || this.$element;

    var el = $element[0];
    var isBody = el.tagName == 'BODY';

    var elRect = el.getBoundingClientRect();
    if (elRect.width == null) {
      // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
      elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top });
    }
    var isSvg = window.SVGElement && el instanceof window.SVGElement;
    // Avoid using $.offset() on SVGs since it gives incorrect results in jQuery 3.
    // See https://github.com/twbs/bootstrap/issues/20280
    var elOffset = isBody ? { top: 0, left: 0 } : isSvg ? null : $element.offset();
    var scroll = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() };
    var outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null;

    return $.extend({}, elRect, scroll, outerDims, elOffset);
  };

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2 } : placement == 'top' ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 } : placement == 'left' ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
    /* placement == 'right' */{ top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width };
  };

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 };
    if (!this.$viewport) return delta;

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0;
    var viewportDimensions = this.getPosition(this.$viewport);

    if (/right|left/.test(placement)) {
      var topEdgeOffset = pos.top - viewportPadding - viewportDimensions.scroll;
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight;
      if (topEdgeOffset < viewportDimensions.top) {
        // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset;
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) {
        // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset;
      }
    } else {
      var leftEdgeOffset = pos.left - viewportPadding;
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth;
      if (leftEdgeOffset < viewportDimensions.left) {
        // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset;
      } else if (rightEdgeOffset > viewportDimensions.right) {
        // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset;
      }
    }

    return delta;
  };

  Tooltip.prototype.getTitle = function () {
    var title;
    var $e = this.$element;
    var o = this.options;

    title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) : o.title);

    return title;
  };

  Tooltip.prototype.getUID = function (prefix) {
    do {
      prefix += ~~(Math.random() * 1000000);
    } while (document.getElementById(prefix));
    return prefix;
  };

  Tooltip.prototype.tip = function () {
    if (!this.$tip) {
      this.$tip = $(this.options.template);
      if (this.$tip.length != 1) {
        throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!');
      }
    }
    return this.$tip;
  };

  Tooltip.prototype.arrow = function () {
    return this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow');
  };

  Tooltip.prototype.enable = function () {
    this.enabled = true;
  };

  Tooltip.prototype.disable = function () {
    this.enabled = false;
  };

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled;
  };

  Tooltip.prototype.toggle = function (e) {
    var self = this;
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type);
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions());
        $(e.currentTarget).data('bs.' + this.type, self);
      }
    }

    if (e) {
      self.inState.click = !self.inState.click;
      if (self.isInStateTrue()) self.enter(self);else self.leave(self);
    } else {
      self.tip().hasClass('in') ? self.leave(self) : self.enter(self);
    }
  };

  Tooltip.prototype.destroy = function () {
    var that = this;
    clearTimeout(this.timeout);
    this.hide(function () {
      that.$element.off('.' + that.type).removeData('bs.' + that.type);
      if (that.$tip) {
        that.$tip.detach();
      }
      that.$tip = null;
      that.$arrow = null;
      that.$viewport = null;
      that.$element = null;
    });
  };

  // TOOLTIP PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.tooltip');
      var options = (typeof option === 'undefined' ? 'undefined' : _typeof(option)) == 'object' && option;

      if (!data && /destroy|hide/.test(option)) return;
      if (!data) $this.data('bs.tooltip', data = new Tooltip(this, options));
      if (typeof option == 'string') data[option]();
    });
  }

  var old = $.fn.tooltip;

  $.fn.tooltip = Plugin;
  $.fn.tooltip.Constructor = Tooltip;

  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old;
    return this;
  };
}(jQuery);
'use strict';

// |--------------------------------------------------------------------------
// | Flexy header
// |--------------------------------------------------------------------------
// |
// | This jQuery script is written by
// |
// | Morten Nissen
// | hjemmesidekongen.dk
// |

var flexy_header = function ($) {
    'use strict';

    var pub = {},
        $header_static = $('.flexy-header--static'),
        $header_sticky = $('.flexy-header--sticky'),
        options = {
        update_interval: 100,
        tolerance: {
            upward: 20,
            downward: 10
        },
        offset: _get_offset_from_elements_bottom($header_static),
        classes: {
            pinned: "flexy-header--pinned",
            unpinned: "flexy-header--unpinned"
        }
    },
        was_scrolled = false,
        last_distance_from_top = 0;

    /**
     * Instantiate
     */
    pub.init = function (options) {
        registerEventHandlers();
        registerBootEventHandlers();
    };

    /**
     * Register boot event handlers
     */
    function registerBootEventHandlers() {
        $header_sticky.addClass(options.classes.unpinned);

        setInterval(function () {

            if (was_scrolled) {
                document_was_scrolled();

                was_scrolled = false;
            }
        }, options.update_interval);
    }

    /**
     * Register event handlers
     */
    function registerEventHandlers() {
        $(window).scroll(function (event) {
            was_scrolled = true;
        });
    }

    /**
     * Get offset from element bottom
     */
    function _get_offset_from_elements_bottom($element) {
        var element_height = $element.outerHeight(true),
            element_offset = $element.offset().top;

        return element_height + element_offset;
    }

    /**
     * Document was scrolled
     */
    function document_was_scrolled() {
        var current_distance_from_top = $(window).scrollTop();

        // If past offset
        if (current_distance_from_top >= options.offset) {

            // Downwards scroll
            if (current_distance_from_top > last_distance_from_top) {

                // Obey the downward tolerance
                if (Math.abs(current_distance_from_top - last_distance_from_top) <= options.tolerance.downward) {
                    return;
                }

                $header_sticky.removeClass(options.classes.pinned).addClass(options.classes.unpinned);
            }

            // Upwards scroll
            else {

                    // Obey the upward tolerance
                    if (Math.abs(current_distance_from_top - last_distance_from_top) <= options.tolerance.upward) {
                        return;
                    }

                    // We are not scrolled past the document which is possible on the Mac
                    if (current_distance_from_top + $(window).height() < $(document).height()) {
                        $header_sticky.removeClass(options.classes.unpinned).addClass(options.classes.pinned);
                    }
                }
        }

        // Not past offset
        else {
                $header_sticky.removeClass(options.classes.pinned).addClass(options.classes.unpinned);
            }

        last_distance_from_top = current_distance_from_top;
    }

    return pub;
}(jQuery);
'use strict';

// |--------------------------------------------------------------------------
// | Flexy navigation
// |--------------------------------------------------------------------------
// |
// | This jQuery script is written by
// |
// | Morten Nissen
// | hjemmesidekongen.dk
// |

var flexy_navigation = function ($) {
    'use strict';

    var pub = {},
        layout_classes = {
        'navigation': '.flexy-navigation',
        'obfuscator': '.flexy-navigation__obfuscator',
        'dropdown': '.flexy-navigation__item--dropdown',
        'dropdown_megamenu': '.flexy-navigation__item__dropdown-megamenu',

        'is_upgraded': 'is-upgraded',
        'navigation_has_megamenu': 'has-megamenu',
        'dropdown_has_megamenu': 'flexy-navigation__item--dropdown-with-megamenu'
    };

    /**
     * Instantiate
     */
    pub.init = function (options) {
        registerEventHandlers();
        registerBootEventHandlers();
    };

    /**
     * Register boot event handlers
     */
    function registerBootEventHandlers() {

        // Upgrade
        upgrade();
    }

    /**
     * Register event handlers
     */
    function registerEventHandlers() {}

    /**
     * Upgrade elements.
     * Add classes to elements, based upon attached classes.
     */
    function upgrade() {
        var $navigations = $(layout_classes.navigation);

        // Navigations
        if ($navigations.length > 0) {
            $navigations.each(function (index, element) {
                var $navigation = $(this),
                    $megamenus = $navigation.find(layout_classes.dropdown_megamenu),
                    $dropdown_megamenu = $navigation.find(layout_classes.dropdown_has_megamenu);

                // Has already been upgraded
                if ($navigation.hasClass(layout_classes.is_upgraded)) {
                    return;
                }

                // Has megamenu
                if ($megamenus.length > 0) {
                    $navigation.addClass(layout_classes.navigation_has_megamenu);

                    // Run through all megamenus
                    $megamenus.each(function (index, element) {
                        var $megamenu = $(this),
                            has_obfuscator = $('html').hasClass('has-obfuscator') ? true : false;

                        $megamenu.parents(layout_classes.dropdown).addClass(layout_classes.dropdown_has_megamenu).hover(function () {

                            if (has_obfuscator) {
                                obfuscator.show();
                            }
                        }, function () {

                            if (has_obfuscator) {
                                obfuscator.hide();
                            }
                        });
                    });
                }

                // Is upgraded
                $navigation.addClass(layout_classes.is_upgraded);
            });
        }
    }

    return pub;
}(jQuery);
"use strict";

/*! sidr - v2.2.1 - 2016-02-17
 * http://www.berriart.com/sidr/
 * Copyright (c) 2013-2016 Alberto Varela; Licensed MIT */

(function () {
  'use strict';

  var babelHelpers = {};

  babelHelpers.classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  babelHelpers.createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  babelHelpers;

  var sidrStatus = {
    moving: false,
    opened: false
  };

  var helper = {
    // Check for valids urls
    // From : http://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-an-url

    isUrl: function isUrl(str) {
      var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

      if (pattern.test(str)) {
        return true;
      } else {
        return false;
      }
    },

    // Add sidr prefixes
    addPrefixes: function addPrefixes($element) {
      this.addPrefix($element, 'id');
      this.addPrefix($element, 'class');
      $element.removeAttr('style');
    },
    addPrefix: function addPrefix($element, attribute) {
      var toReplace = $element.attr(attribute);

      if (typeof toReplace === 'string' && toReplace !== '' && toReplace !== 'sidr-inner') {
        $element.attr(attribute, toReplace.replace(/([A-Za-z0-9_.\-]+)/g, 'sidr-' + attribute + '-$1'));
      }
    },

    // Check if transitions is supported
    transitions: function () {
      var body = document.body || document.documentElement,
          style = body.style,
          supported = false,
          property = 'transition';

      if (property in style) {
        supported = true;
      } else {
        (function () {
          var prefixes = ['moz', 'webkit', 'o', 'ms'],
              prefix = undefined,
              i = undefined;

          property = property.charAt(0).toUpperCase() + property.substr(1);
          supported = function () {
            for (i = 0; i < prefixes.length; i++) {
              prefix = prefixes[i];
              if (prefix + property in style) {
                return true;
              }
            }

            return false;
          }();
          property = supported ? '-' + prefix.toLowerCase() + '-' + property.toLowerCase() : null;
        })();
      }

      return {
        supported: supported,
        property: property
      };
    }()
  };

  var $$2 = jQuery;

  var bodyAnimationClass = 'sidr-animating';
  var openAction = 'open';
  var closeAction = 'close';
  var transitionEndEvent = 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend';
  var Menu = function () {
    function Menu(name) {
      babelHelpers.classCallCheck(this, Menu);

      this.name = name;
      this.item = $$2('#' + name);
      this.openClass = name === 'sidr' ? 'sidr-open' : 'sidr-open ' + name + '-open';
      this.menuWidth = this.item.outerWidth(true);
      this.speed = this.item.data('speed');
      this.side = this.item.data('side');
      this.displace = this.item.data('displace');
      this.timing = this.item.data('timing');
      this.method = this.item.data('method');
      this.onOpenCallback = this.item.data('onOpen');
      this.onCloseCallback = this.item.data('onClose');
      this.onOpenEndCallback = this.item.data('onOpenEnd');
      this.onCloseEndCallback = this.item.data('onCloseEnd');
      this.body = $$2(this.item.data('body'));
    }

    babelHelpers.createClass(Menu, [{
      key: 'getAnimation',
      value: function getAnimation(action, element) {
        var animation = {},
            prop = this.side;

        if (action === 'open' && element === 'body') {
          animation[prop] = this.menuWidth + 'px';
        } else if (action === 'close' && element === 'menu') {
          animation[prop] = '-' + this.menuWidth + 'px';
        } else {
          animation[prop] = 0;
        }

        return animation;
      }
    }, {
      key: 'prepareBody',
      value: function prepareBody(action) {
        var prop = action === 'open' ? 'hidden' : '';

        // Prepare page if container is body
        if (this.body.is('body')) {
          var $html = $$2('html'),
              scrollTop = $html.scrollTop();

          $html.css('overflow-x', prop).scrollTop(scrollTop);
        }
      }
    }, {
      key: 'openBody',
      value: function openBody() {
        if (this.displace) {
          var transitions = helper.transitions,
              $body = this.body;

          if (transitions.supported) {
            $body.css(transitions.property, this.side + ' ' + this.speed / 1000 + 's ' + this.timing).css(this.side, 0).css({
              width: $body.width(),
              position: 'absolute'
            });
            $body.css(this.side, this.menuWidth + 'px');
          } else {
            var bodyAnimation = this.getAnimation(openAction, 'body');

            $body.css({
              width: $body.width(),
              position: 'absolute'
            }).animate(bodyAnimation, {
              queue: false,
              duration: this.speed
            });
          }
        }
      }
    }, {
      key: 'onCloseBody',
      value: function onCloseBody() {
        var transitions = helper.transitions,
            resetStyles = {
          width: '',
          position: '',
          right: '',
          left: ''
        };

        if (transitions.supported) {
          resetStyles[transitions.property] = '';
        }

        this.body.css(resetStyles).unbind(transitionEndEvent);
      }
    }, {
      key: 'closeBody',
      value: function closeBody() {
        var _this = this;

        if (this.displace) {
          if (helper.transitions.supported) {
            this.body.css(this.side, 0).one(transitionEndEvent, function () {
              _this.onCloseBody();
            });
          } else {
            var bodyAnimation = this.getAnimation(closeAction, 'body');

            this.body.animate(bodyAnimation, {
              queue: false,
              duration: this.speed,
              complete: function complete() {
                _this.onCloseBody();
              }
            });
          }
        }
      }
    }, {
      key: 'moveBody',
      value: function moveBody(action) {
        if (action === openAction) {
          this.openBody();
        } else {
          this.closeBody();
        }
      }
    }, {
      key: 'onOpenMenu',
      value: function onOpenMenu(callback) {
        var name = this.name;

        sidrStatus.moving = false;
        sidrStatus.opened = name;

        this.item.unbind(transitionEndEvent);

        this.body.removeClass(bodyAnimationClass).addClass(this.openClass);

        this.onOpenEndCallback();

        if (typeof callback === 'function') {
          callback(name);
        }
      }
    }, {
      key: 'openMenu',
      value: function openMenu(callback) {
        var _this2 = this;

        var $item = this.item;

        if (helper.transitions.supported) {
          $item.css(this.side, 0).one(transitionEndEvent, function () {
            _this2.onOpenMenu(callback);
          });
        } else {
          var menuAnimation = this.getAnimation(openAction, 'menu');

          $item.css('display', 'block').animate(menuAnimation, {
            queue: false,
            duration: this.speed,
            complete: function complete() {
              _this2.onOpenMenu(callback);
            }
          });
        }
      }
    }, {
      key: 'onCloseMenu',
      value: function onCloseMenu(callback) {
        this.item.css({
          left: '',
          right: ''
        }).unbind(transitionEndEvent);
        $$2('html').css('overflow-x', '');

        sidrStatus.moving = false;
        sidrStatus.opened = false;

        this.body.removeClass(bodyAnimationClass).removeClass(this.openClass);

        this.onCloseEndCallback();

        // Callback
        if (typeof callback === 'function') {
          callback(name);
        }
      }
    }, {
      key: 'closeMenu',
      value: function closeMenu(callback) {
        var _this3 = this;

        var item = this.item;

        if (helper.transitions.supported) {
          item.css(this.side, '').one(transitionEndEvent, function () {
            _this3.onCloseMenu(callback);
          });
        } else {
          var menuAnimation = this.getAnimation(closeAction, 'menu');

          item.animate(menuAnimation, {
            queue: false,
            duration: this.speed,
            complete: function complete() {
              _this3.onCloseMenu();
            }
          });
        }
      }
    }, {
      key: 'moveMenu',
      value: function moveMenu(action, callback) {
        this.body.addClass(bodyAnimationClass);

        if (action === openAction) {
          this.openMenu(callback);
        } else {
          this.closeMenu(callback);
        }
      }
    }, {
      key: 'move',
      value: function move(action, callback) {
        // Lock sidr
        sidrStatus.moving = true;

        this.prepareBody(action);
        this.moveBody(action);
        this.moveMenu(action, callback);
      }
    }, {
      key: 'open',
      value: function open(callback) {
        var _this4 = this;

        // Check if is already opened or moving
        if (sidrStatus.opened === this.name || sidrStatus.moving) {
          return;
        }

        // If another menu opened close first
        if (sidrStatus.opened !== false) {
          var alreadyOpenedMenu = new Menu(sidrStatus.opened);

          alreadyOpenedMenu.close(function () {
            _this4.open(callback);
          });

          return;
        }

        this.move('open', callback);

        // onOpen callback
        this.onOpenCallback();
      }
    }, {
      key: 'close',
      value: function close(callback) {
        // Check if is already closed or moving
        if (sidrStatus.opened !== this.name || sidrStatus.moving) {
          return;
        }

        this.move('close', callback);

        // onClose callback
        this.onCloseCallback();
      }
    }, {
      key: 'toggle',
      value: function toggle(callback) {
        if (sidrStatus.opened === this.name) {
          this.close(callback);
        } else {
          this.open(callback);
        }
      }
    }]);
    return Menu;
  }();

  var $$1 = jQuery;

  function execute(action, name, callback) {
    var sidr = new Menu(name);

    switch (action) {
      case 'open':
        sidr.open(callback);
        break;
      case 'close':
        sidr.close(callback);
        break;
      case 'toggle':
        sidr.toggle(callback);
        break;
      default:
        $$1.error('Method ' + action + ' does not exist on jQuery.sidr');
        break;
    }
  }

  var i;
  var $ = jQuery;
  var publicMethods = ['open', 'close', 'toggle'];
  var methodName;
  var methods = {};
  var getMethod = function getMethod(methodName) {
    return function (name, callback) {
      // Check arguments
      if (typeof name === 'function') {
        callback = name;
        name = 'sidr';
      } else if (!name) {
        name = 'sidr';
      }

      execute(methodName, name, callback);
    };
  };
  for (i = 0; i < publicMethods.length; i++) {
    methodName = publicMethods[i];
    methods[methodName] = getMethod(methodName);
  }

  function sidr(method) {
    if (method === 'status') {
      return sidrStatus;
    } else if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'function' || typeof method === 'string' || !method) {
      return methods.toggle.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.sidr');
    }
  }

  var $$3 = jQuery;

  function fillContent($sideMenu, settings) {
    // The menu content
    if (typeof settings.source === 'function') {
      var newContent = settings.source(name);

      $sideMenu.html(newContent);
    } else if (typeof settings.source === 'string' && helper.isUrl(settings.source)) {
      $$3.get(settings.source, function (data) {
        $sideMenu.html(data);
      });
    } else if (typeof settings.source === 'string') {
      var htmlContent = '',
          selectors = settings.source.split(',');

      $$3.each(selectors, function (index, element) {
        htmlContent += '<div class="sidr-inner">' + $$3(element).html() + '</div>';
      });

      // Renaming ids and classes
      if (settings.renaming) {
        var $htmlContent = $$3('<div />').html(htmlContent);

        $htmlContent.find('*').each(function (index, element) {
          var $element = $$3(element);

          helper.addPrefixes($element);
        });
        htmlContent = $htmlContent.html();
      }

      $sideMenu.html(htmlContent);
    } else if (settings.source !== null) {
      $$3.error('Invalid Sidr Source');
    }

    return $sideMenu;
  }

  function fnSidr(options) {
    var transitions = helper.transitions,
        settings = $$3.extend({
      name: 'sidr', // Name for the 'sidr'
      speed: 200, // Accepts standard jQuery effects speeds (i.e. fast, normal or milliseconds)
      side: 'left', // Accepts 'left' or 'right'
      source: null, // Override the source of the content.
      renaming: true, // The ids and classes will be prepended with a prefix when loading existent content
      body: 'body', // Page container selector,
      displace: true, // Displace the body content or not
      timing: 'ease', // Timing function for CSS transitions
      method: 'toggle', // The method to call when element is clicked
      bind: 'touchstart click', // The event(s) to trigger the menu
      onOpen: function onOpen() {},
      // Callback when sidr start opening
      onClose: function onClose() {},
      // Callback when sidr start closing
      onOpenEnd: function onOpenEnd() {},
      // Callback when sidr end opening
      onCloseEnd: function onCloseEnd() {} // Callback when sidr end closing

    }, options),
        name = settings.name,
        $sideMenu = $$3('#' + name);

    // If the side menu do not exist create it
    if ($sideMenu.length === 0) {
      $sideMenu = $$3('<div />').attr('id', name).appendTo($$3('body'));
    }

    // Add transition to menu if are supported
    if (transitions.supported) {
      $sideMenu.css(transitions.property, settings.side + ' ' + settings.speed / 1000 + 's ' + settings.timing);
    }

    // Adding styles and options
    $sideMenu.addClass('sidr').addClass(settings.side).data({
      speed: settings.speed,
      side: settings.side,
      body: settings.body,
      displace: settings.displace,
      timing: settings.timing,
      method: settings.method,
      onOpen: settings.onOpen,
      onClose: settings.onClose,
      onOpenEnd: settings.onOpenEnd,
      onCloseEnd: settings.onCloseEnd
    });

    $sideMenu = fillContent($sideMenu, settings);

    return this.each(function () {
      var $this = $$3(this),
          data = $this.data('sidr'),
          flag = false;

      // If the plugin hasn't been initialized yet
      if (!data) {
        sidrStatus.moving = false;
        sidrStatus.opened = false;

        $this.data('sidr', name);

        $this.bind(settings.bind, function (event) {
          event.preventDefault();

          if (!flag) {
            flag = true;
            sidr(settings.method, name);

            setTimeout(function () {
              flag = false;
            }, 100);
          }
        });
      }
    });
  }

  jQuery.sidr = sidr;
  jQuery.fn.sidr = fnSidr;
})();
"use strict";

!function (e) {
  var t;e.fn.slinky = function (a) {
    var s = e.extend({ label: "Back", title: !1, speed: 300, resize: !0 }, a),
        i = e(this),
        n = i.children().first();i.addClass("slinky-menu");var r = function r(e, t) {
      var a = Math.round(parseInt(n.get(0).style.left)) || 0;n.css("left", a - 100 * e + "%"), "function" == typeof t && setTimeout(t, s.speed);
    },
        l = function l(e) {
      i.height(e.outerHeight());
    },
        d = function d(e) {
      i.css("transition-duration", e + "ms"), n.css("transition-duration", e + "ms");
    };if (d(s.speed), e("a + ul", i).prev().addClass("next"), e("li > ul", i).prepend('<li class="header">'), s.title === !0 && e("li > ul", i).each(function () {
      var t = e(this).parent().find("a").first().text(),
          a = e("<h2>").text(t);e("> .header", this).append(a);
    }), s.title || s.label !== !0) {
      var o = e("<a>").text(s.label).prop("href", "#").addClass("back");e(".header", i).append(o);
    } else e("li > ul", i).each(function () {
      var t = e(this).parent().find("a").first().text(),
          a = e("<a>").text(t).prop("href", "#").addClass("back");e("> .header", this).append(a);
    });e("a", i).on("click", function (a) {
      if (!(t + s.speed > Date.now())) {
        t = Date.now();var n = e(this);/#/.test(this.href) && a.preventDefault(), n.hasClass("next") ? (i.find(".active").removeClass("active"), n.next().show().addClass("active"), r(1), s.resize && l(n.next())) : n.hasClass("back") && (r(-1, function () {
          i.find(".active").removeClass("active"), n.parent().parent().hide().parentsUntil(i, "ul").first().addClass("active");
        }), s.resize && l(n.parent().parent().parentsUntil(i, "ul")));
      }
    }), this.jump = function (t, a) {
      t = e(t);var n = i.find(".active");n = n.length > 0 ? n.parentsUntil(i, "ul").length : 0, i.find("ul").removeClass("active").hide();var o = t.parentsUntil(i, "ul");o.show(), t.show().addClass("active"), a === !1 && d(0), r(o.length - n), s.resize && l(t), a === !1 && d(s.speed);
    }, this.home = function (t) {
      t === !1 && d(0);var a = i.find(".active"),
          n = a.parentsUntil(i, "li").length;n > 0 && (r(-n, function () {
        a.removeClass("active");
      }), s.resize && l(e(a.parentsUntil(i, "li").get(n - 1)).parent())), t === !1 && d(s.speed);
    }, this.destroy = function () {
      e(".header", i).remove(), e("a", i).removeClass("next").off("click"), i.removeClass("slinky-menu").css("transition-duration", ""), n.css("transition-duration", "");
    };var c = i.find(".active");return c.length > 0 && (c.removeClass("active"), this.jump(c, !1)), this;
  };
}(jQuery);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function () {
  var AjaxMonitor,
      Bar,
      DocumentMonitor,
      ElementMonitor,
      ElementTracker,
      EventLagMonitor,
      Evented,
      Events,
      NoTargetError,
      Pace,
      RequestIntercept,
      SOURCE_KEYS,
      Scaler,
      SocketRequestTracker,
      XHRRequestTracker,
      animation,
      avgAmplitude,
      bar,
      cancelAnimation,
      cancelAnimationFrame,
      defaultOptions,
      _extend,
      extendNative,
      getFromDOM,
      getIntercept,
      handlePushState,
      ignoreStack,
      init,
      now,
      options,
      requestAnimationFrame,
      result,
      runAnimation,
      scalers,
      shouldIgnoreURL,
      shouldTrack,
      source,
      sources,
      uniScaler,
      _WebSocket,
      _XDomainRequest,
      _XMLHttpRequest,
      _i,
      _intercept,
      _len,
      _pushState,
      _ref,
      _ref1,
      _replaceState,
      __slice = [].slice,
      __hasProp = {}.hasOwnProperty,
      __extends = function __extends(child, parent) {
    for (var key in parent) {
      if (__hasProp.call(parent, key)) child[key] = parent[key];
    }function ctor() {
      this.constructor = child;
    }ctor.prototype = parent.prototype;child.prototype = new ctor();child.__super__ = parent.prototype;return child;
  },
      __indexOf = [].indexOf || function (item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (i in this && this[i] === item) return i;
    }return -1;
  };

  defaultOptions = {
    catchupTime: 100,
    initialRate: .03,
    minTime: 250,
    ghostTime: 100,
    maxProgressPerFrame: 20,
    easeFactor: 1.25,
    startOnPageLoad: true,
    restartOnPushState: true,
    restartOnRequestAfter: 500,
    target: 'body',
    elements: {
      checkInterval: 100,
      selectors: ['body']
    },
    eventLag: {
      minSamples: 10,
      sampleCount: 3,
      lagThreshold: 3
    },
    ajax: {
      trackMethods: ['GET'],
      trackWebSockets: true,
      ignoreURLs: []
    }
  };

  now = function now() {
    var _ref;
    return (_ref = typeof performance !== "undefined" && performance !== null ? typeof performance.now === "function" ? performance.now() : void 0 : void 0) != null ? _ref : +new Date();
  };

  requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

  cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

  if (requestAnimationFrame == null) {
    requestAnimationFrame = function requestAnimationFrame(fn) {
      return setTimeout(fn, 50);
    };
    cancelAnimationFrame = function cancelAnimationFrame(id) {
      return clearTimeout(id);
    };
  }

  runAnimation = function runAnimation(fn) {
    var last, _tick;
    last = now();
    _tick = function tick() {
      var diff;
      diff = now() - last;
      if (diff >= 33) {
        last = now();
        return fn(diff, function () {
          return requestAnimationFrame(_tick);
        });
      } else {
        return setTimeout(_tick, 33 - diff);
      }
    };
    return _tick();
  };

  result = function result() {
    var args, key, obj;
    obj = arguments[0], key = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
    if (typeof obj[key] === 'function') {
      return obj[key].apply(obj, args);
    } else {
      return obj[key];
    }
  };

  _extend = function extend() {
    var key, out, source, sources, val, _i, _len;
    out = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    for (_i = 0, _len = sources.length; _i < _len; _i++) {
      source = sources[_i];
      if (source) {
        for (key in source) {
          if (!__hasProp.call(source, key)) continue;
          val = source[key];
          if (out[key] != null && _typeof(out[key]) === 'object' && val != null && (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') {
            _extend(out[key], val);
          } else {
            out[key] = val;
          }
        }
      }
    }
    return out;
  };

  avgAmplitude = function avgAmplitude(arr) {
    var count, sum, v, _i, _len;
    sum = count = 0;
    for (_i = 0, _len = arr.length; _i < _len; _i++) {
      v = arr[_i];
      sum += Math.abs(v);
      count++;
    }
    return sum / count;
  };

  getFromDOM = function getFromDOM(key, json) {
    var data, e, el;
    if (key == null) {
      key = 'options';
    }
    if (json == null) {
      json = true;
    }
    el = document.querySelector("[data-pace-" + key + "]");
    if (!el) {
      return;
    }
    data = el.getAttribute("data-pace-" + key);
    if (!json) {
      return data;
    }
    try {
      return JSON.parse(data);
    } catch (_error) {
      e = _error;
      return typeof console !== "undefined" && console !== null ? console.error("Error parsing inline pace options", e) : void 0;
    }
  };

  Evented = function () {
    function Evented() {}

    Evented.prototype.on = function (event, handler, ctx, once) {
      var _base;
      if (once == null) {
        once = false;
      }
      if (this.bindings == null) {
        this.bindings = {};
      }
      if ((_base = this.bindings)[event] == null) {
        _base[event] = [];
      }
      return this.bindings[event].push({
        handler: handler,
        ctx: ctx,
        once: once
      });
    };

    Evented.prototype.once = function (event, handler, ctx) {
      return this.on(event, handler, ctx, true);
    };

    Evented.prototype.off = function (event, handler) {
      var i, _ref, _results;
      if (((_ref = this.bindings) != null ? _ref[event] : void 0) == null) {
        return;
      }
      if (handler == null) {
        return delete this.bindings[event];
      } else {
        i = 0;
        _results = [];
        while (i < this.bindings[event].length) {
          if (this.bindings[event][i].handler === handler) {
            _results.push(this.bindings[event].splice(i, 1));
          } else {
            _results.push(i++);
          }
        }
        return _results;
      }
    };

    Evented.prototype.trigger = function () {
      var args, ctx, event, handler, i, once, _ref, _ref1, _results;
      event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if ((_ref = this.bindings) != null ? _ref[event] : void 0) {
        i = 0;
        _results = [];
        while (i < this.bindings[event].length) {
          _ref1 = this.bindings[event][i], handler = _ref1.handler, ctx = _ref1.ctx, once = _ref1.once;
          handler.apply(ctx != null ? ctx : this, args);
          if (once) {
            _results.push(this.bindings[event].splice(i, 1));
          } else {
            _results.push(i++);
          }
        }
        return _results;
      }
    };

    return Evented;
  }();

  Pace = window.Pace || {};

  window.Pace = Pace;

  _extend(Pace, Evented.prototype);

  options = Pace.options = _extend({}, defaultOptions, window.paceOptions, getFromDOM());

  _ref = ['ajax', 'document', 'eventLag', 'elements'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    source = _ref[_i];
    if (options[source] === true) {
      options[source] = defaultOptions[source];
    }
  }

  NoTargetError = function (_super) {
    __extends(NoTargetError, _super);

    function NoTargetError() {
      _ref1 = NoTargetError.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    return NoTargetError;
  }(Error);

  Bar = function () {
    function Bar() {
      this.progress = 0;
    }

    Bar.prototype.getElement = function () {
      var targetElement;
      if (this.el == null) {
        targetElement = document.querySelector(options.target);
        if (!targetElement) {
          throw new NoTargetError();
        }
        this.el = document.createElement('div');
        this.el.className = "pace pace-active";
        document.body.className = document.body.className.replace(/pace-done/g, '');
        document.body.className += ' pace-running';
        this.el.innerHTML = '<div class="pace-progress">\n  <div class="pace-progress-inner"></div>\n</div>\n<div class="pace-activity"></div>';
        if (targetElement.firstChild != null) {
          targetElement.insertBefore(this.el, targetElement.firstChild);
        } else {
          targetElement.appendChild(this.el);
        }
      }
      return this.el;
    };

    Bar.prototype.finish = function () {
      var el;
      el = this.getElement();
      el.className = el.className.replace('pace-active', '');
      el.className += ' pace-inactive';
      document.body.className = document.body.className.replace('pace-running', '');
      return document.body.className += ' pace-done';
    };

    Bar.prototype.update = function (prog) {
      this.progress = prog;
      return this.render();
    };

    Bar.prototype.destroy = function () {
      try {
        this.getElement().parentNode.removeChild(this.getElement());
      } catch (_error) {
        NoTargetError = _error;
      }
      return this.el = void 0;
    };

    Bar.prototype.render = function () {
      var el, key, progressStr, transform, _j, _len1, _ref2;
      if (document.querySelector(options.target) == null) {
        return false;
      }
      el = this.getElement();
      transform = "translate3d(" + this.progress + "%, 0, 0)";
      _ref2 = ['webkitTransform', 'msTransform', 'transform'];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        key = _ref2[_j];
        el.children[0].style[key] = transform;
      }
      if (!this.lastRenderedProgress || this.lastRenderedProgress | 0 !== this.progress | 0) {
        el.children[0].setAttribute('data-progress-text', "" + (this.progress | 0) + "%");
        if (this.progress >= 100) {
          progressStr = '99';
        } else {
          progressStr = this.progress < 10 ? "0" : "";
          progressStr += this.progress | 0;
        }
        el.children[0].setAttribute('data-progress', "" + progressStr);
      }
      return this.lastRenderedProgress = this.progress;
    };

    Bar.prototype.done = function () {
      return this.progress >= 100;
    };

    return Bar;
  }();

  Events = function () {
    function Events() {
      this.bindings = {};
    }

    Events.prototype.trigger = function (name, val) {
      var binding, _j, _len1, _ref2, _results;
      if (this.bindings[name] != null) {
        _ref2 = this.bindings[name];
        _results = [];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          binding = _ref2[_j];
          _results.push(binding.call(this, val));
        }
        return _results;
      }
    };

    Events.prototype.on = function (name, fn) {
      var _base;
      if ((_base = this.bindings)[name] == null) {
        _base[name] = [];
      }
      return this.bindings[name].push(fn);
    };

    return Events;
  }();

  _XMLHttpRequest = window.XMLHttpRequest;

  _XDomainRequest = window.XDomainRequest;

  _WebSocket = window.WebSocket;

  extendNative = function extendNative(to, from) {
    var e, key, _results;
    _results = [];
    for (key in from.prototype) {
      try {
        if (to[key] == null && typeof from[key] !== 'function') {
          if (typeof Object.defineProperty === 'function') {
            _results.push(Object.defineProperty(to, key, {
              get: function get() {
                return from.prototype[key];
              },
              configurable: true,
              enumerable: true
            }));
          } else {
            _results.push(to[key] = from.prototype[key]);
          }
        } else {
          _results.push(void 0);
        }
      } catch (_error) {
        e = _error;
      }
    }
    return _results;
  };

  ignoreStack = [];

  Pace.ignore = function () {
    var args, fn, ret;
    fn = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    ignoreStack.unshift('ignore');
    ret = fn.apply(null, args);
    ignoreStack.shift();
    return ret;
  };

  Pace.track = function () {
    var args, fn, ret;
    fn = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    ignoreStack.unshift('track');
    ret = fn.apply(null, args);
    ignoreStack.shift();
    return ret;
  };

  shouldTrack = function shouldTrack(method) {
    var _ref2;
    if (method == null) {
      method = 'GET';
    }
    if (ignoreStack[0] === 'track') {
      return 'force';
    }
    if (!ignoreStack.length && options.ajax) {
      if (method === 'socket' && options.ajax.trackWebSockets) {
        return true;
      } else if (_ref2 = method.toUpperCase(), __indexOf.call(options.ajax.trackMethods, _ref2) >= 0) {
        return true;
      }
    }
    return false;
  };

  RequestIntercept = function (_super) {
    __extends(RequestIntercept, _super);

    function RequestIntercept() {
      var monitorXHR,
          _this = this;
      RequestIntercept.__super__.constructor.apply(this, arguments);
      monitorXHR = function monitorXHR(req) {
        var _open;
        _open = req.open;
        return req.open = function (type, url, async) {
          if (shouldTrack(type)) {
            _this.trigger('request', {
              type: type,
              url: url,
              request: req
            });
          }
          return _open.apply(req, arguments);
        };
      };
      window.XMLHttpRequest = function (flags) {
        var req;
        req = new _XMLHttpRequest(flags);
        monitorXHR(req);
        return req;
      };
      try {
        extendNative(window.XMLHttpRequest, _XMLHttpRequest);
      } catch (_error) {}
      if (_XDomainRequest != null) {
        window.XDomainRequest = function () {
          var req;
          req = new _XDomainRequest();
          monitorXHR(req);
          return req;
        };
        try {
          extendNative(window.XDomainRequest, _XDomainRequest);
        } catch (_error) {}
      }
      if (_WebSocket != null && options.ajax.trackWebSockets) {
        window.WebSocket = function (url, protocols) {
          var req;
          if (protocols != null) {
            req = new _WebSocket(url, protocols);
          } else {
            req = new _WebSocket(url);
          }
          if (shouldTrack('socket')) {
            _this.trigger('request', {
              type: 'socket',
              url: url,
              protocols: protocols,
              request: req
            });
          }
          return req;
        };
        try {
          extendNative(window.WebSocket, _WebSocket);
        } catch (_error) {}
      }
    }

    return RequestIntercept;
  }(Events);

  _intercept = null;

  getIntercept = function getIntercept() {
    if (_intercept == null) {
      _intercept = new RequestIntercept();
    }
    return _intercept;
  };

  shouldIgnoreURL = function shouldIgnoreURL(url) {
    var pattern, _j, _len1, _ref2;
    _ref2 = options.ajax.ignoreURLs;
    for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
      pattern = _ref2[_j];
      if (typeof pattern === 'string') {
        if (url.indexOf(pattern) !== -1) {
          return true;
        }
      } else {
        if (pattern.test(url)) {
          return true;
        }
      }
    }
    return false;
  };

  getIntercept().on('request', function (_arg) {
    var after, args, request, type, url;
    type = _arg.type, request = _arg.request, url = _arg.url;
    if (shouldIgnoreURL(url)) {
      return;
    }
    if (!Pace.running && (options.restartOnRequestAfter !== false || shouldTrack(type) === 'force')) {
      args = arguments;
      after = options.restartOnRequestAfter || 0;
      if (typeof after === 'boolean') {
        after = 0;
      }
      return setTimeout(function () {
        var stillActive, _j, _len1, _ref2, _ref3, _results;
        if (type === 'socket') {
          stillActive = request.readyState < 2;
        } else {
          stillActive = 0 < (_ref2 = request.readyState) && _ref2 < 4;
        }
        if (stillActive) {
          Pace.restart();
          _ref3 = Pace.sources;
          _results = [];
          for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
            source = _ref3[_j];
            if (source instanceof AjaxMonitor) {
              source.watch.apply(source, args);
              break;
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      }, after);
    }
  });

  AjaxMonitor = function () {
    function AjaxMonitor() {
      var _this = this;
      this.elements = [];
      getIntercept().on('request', function () {
        return _this.watch.apply(_this, arguments);
      });
    }

    AjaxMonitor.prototype.watch = function (_arg) {
      var request, tracker, type, url;
      type = _arg.type, request = _arg.request, url = _arg.url;
      if (shouldIgnoreURL(url)) {
        return;
      }
      if (type === 'socket') {
        tracker = new SocketRequestTracker(request);
      } else {
        tracker = new XHRRequestTracker(request);
      }
      return this.elements.push(tracker);
    };

    return AjaxMonitor;
  }();

  XHRRequestTracker = function () {
    function XHRRequestTracker(request) {
      var event,
          size,
          _j,
          _len1,
          _onreadystatechange,
          _ref2,
          _this = this;
      this.progress = 0;
      if (window.ProgressEvent != null) {
        size = null;
        request.addEventListener('progress', function (evt) {
          if (evt.lengthComputable) {
            return _this.progress = 100 * evt.loaded / evt.total;
          } else {
            return _this.progress = _this.progress + (100 - _this.progress) / 2;
          }
        }, false);
        _ref2 = ['load', 'abort', 'timeout', 'error'];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          event = _ref2[_j];
          request.addEventListener(event, function () {
            return _this.progress = 100;
          }, false);
        }
      } else {
        _onreadystatechange = request.onreadystatechange;
        request.onreadystatechange = function () {
          var _ref3;
          if ((_ref3 = request.readyState) === 0 || _ref3 === 4) {
            _this.progress = 100;
          } else if (request.readyState === 3) {
            _this.progress = 50;
          }
          return typeof _onreadystatechange === "function" ? _onreadystatechange.apply(null, arguments) : void 0;
        };
      }
    }

    return XHRRequestTracker;
  }();

  SocketRequestTracker = function () {
    function SocketRequestTracker(request) {
      var event,
          _j,
          _len1,
          _ref2,
          _this = this;
      this.progress = 0;
      _ref2 = ['error', 'open'];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        event = _ref2[_j];
        request.addEventListener(event, function () {
          return _this.progress = 100;
        }, false);
      }
    }

    return SocketRequestTracker;
  }();

  ElementMonitor = function () {
    function ElementMonitor(options) {
      var selector, _j, _len1, _ref2;
      if (options == null) {
        options = {};
      }
      this.elements = [];
      if (options.selectors == null) {
        options.selectors = [];
      }
      _ref2 = options.selectors;
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        selector = _ref2[_j];
        this.elements.push(new ElementTracker(selector));
      }
    }

    return ElementMonitor;
  }();

  ElementTracker = function () {
    function ElementTracker(selector) {
      this.selector = selector;
      this.progress = 0;
      this.check();
    }

    ElementTracker.prototype.check = function () {
      var _this = this;
      if (document.querySelector(this.selector)) {
        return this.done();
      } else {
        return setTimeout(function () {
          return _this.check();
        }, options.elements.checkInterval);
      }
    };

    ElementTracker.prototype.done = function () {
      return this.progress = 100;
    };

    return ElementTracker;
  }();

  DocumentMonitor = function () {
    DocumentMonitor.prototype.states = {
      loading: 0,
      interactive: 50,
      complete: 100
    };

    function DocumentMonitor() {
      var _onreadystatechange,
          _ref2,
          _this = this;
      this.progress = (_ref2 = this.states[document.readyState]) != null ? _ref2 : 100;
      _onreadystatechange = document.onreadystatechange;
      document.onreadystatechange = function () {
        if (_this.states[document.readyState] != null) {
          _this.progress = _this.states[document.readyState];
        }
        return typeof _onreadystatechange === "function" ? _onreadystatechange.apply(null, arguments) : void 0;
      };
    }

    return DocumentMonitor;
  }();

  EventLagMonitor = function () {
    function EventLagMonitor() {
      var avg,
          interval,
          last,
          points,
          samples,
          _this = this;
      this.progress = 0;
      avg = 0;
      samples = [];
      points = 0;
      last = now();
      interval = setInterval(function () {
        var diff;
        diff = now() - last - 50;
        last = now();
        samples.push(diff);
        if (samples.length > options.eventLag.sampleCount) {
          samples.shift();
        }
        avg = avgAmplitude(samples);
        if (++points >= options.eventLag.minSamples && avg < options.eventLag.lagThreshold) {
          _this.progress = 100;
          return clearInterval(interval);
        } else {
          return _this.progress = 100 * (3 / (avg + 3));
        }
      }, 50);
    }

    return EventLagMonitor;
  }();

  Scaler = function () {
    function Scaler(source) {
      this.source = source;
      this.last = this.sinceLastUpdate = 0;
      this.rate = options.initialRate;
      this.catchup = 0;
      this.progress = this.lastProgress = 0;
      if (this.source != null) {
        this.progress = result(this.source, 'progress');
      }
    }

    Scaler.prototype.tick = function (frameTime, val) {
      var scaling;
      if (val == null) {
        val = result(this.source, 'progress');
      }
      if (val >= 100) {
        this.done = true;
      }
      if (val === this.last) {
        this.sinceLastUpdate += frameTime;
      } else {
        if (this.sinceLastUpdate) {
          this.rate = (val - this.last) / this.sinceLastUpdate;
        }
        this.catchup = (val - this.progress) / options.catchupTime;
        this.sinceLastUpdate = 0;
        this.last = val;
      }
      if (val > this.progress) {
        this.progress += this.catchup * frameTime;
      }
      scaling = 1 - Math.pow(this.progress / 100, options.easeFactor);
      this.progress += scaling * this.rate * frameTime;
      this.progress = Math.min(this.lastProgress + options.maxProgressPerFrame, this.progress);
      this.progress = Math.max(0, this.progress);
      this.progress = Math.min(100, this.progress);
      this.lastProgress = this.progress;
      return this.progress;
    };

    return Scaler;
  }();

  sources = null;

  scalers = null;

  bar = null;

  uniScaler = null;

  animation = null;

  cancelAnimation = null;

  Pace.running = false;

  handlePushState = function handlePushState() {
    if (options.restartOnPushState) {
      return Pace.restart();
    }
  };

  if (window.history.pushState != null) {
    _pushState = window.history.pushState;
    window.history.pushState = function () {
      handlePushState();
      return _pushState.apply(window.history, arguments);
    };
  }

  if (window.history.replaceState != null) {
    _replaceState = window.history.replaceState;
    window.history.replaceState = function () {
      handlePushState();
      return _replaceState.apply(window.history, arguments);
    };
  }

  SOURCE_KEYS = {
    ajax: AjaxMonitor,
    elements: ElementMonitor,
    document: DocumentMonitor,
    eventLag: EventLagMonitor
  };

  (init = function init() {
    var type, _j, _k, _len1, _len2, _ref2, _ref3, _ref4;
    Pace.sources = sources = [];
    _ref2 = ['ajax', 'elements', 'document', 'eventLag'];
    for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
      type = _ref2[_j];
      if (options[type] !== false) {
        sources.push(new SOURCE_KEYS[type](options[type]));
      }
    }
    _ref4 = (_ref3 = options.extraSources) != null ? _ref3 : [];
    for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
      source = _ref4[_k];
      sources.push(new source(options));
    }
    Pace.bar = bar = new Bar();
    scalers = [];
    return uniScaler = new Scaler();
  })();

  Pace.stop = function () {
    Pace.trigger('stop');
    Pace.running = false;
    bar.destroy();
    cancelAnimation = true;
    if (animation != null) {
      if (typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(animation);
      }
      animation = null;
    }
    return init();
  };

  Pace.restart = function () {
    Pace.trigger('restart');
    Pace.stop();
    return Pace.start();
  };

  Pace.go = function () {
    var start;
    Pace.running = true;
    bar.render();
    start = now();
    cancelAnimation = false;
    return animation = runAnimation(function (frameTime, enqueueNextFrame) {
      var avg, count, done, element, elements, i, j, remaining, scaler, scalerList, sum, _j, _k, _len1, _len2, _ref2;
      remaining = 100 - bar.progress;
      count = sum = 0;
      done = true;
      for (i = _j = 0, _len1 = sources.length; _j < _len1; i = ++_j) {
        source = sources[i];
        scalerList = scalers[i] != null ? scalers[i] : scalers[i] = [];
        elements = (_ref2 = source.elements) != null ? _ref2 : [source];
        for (j = _k = 0, _len2 = elements.length; _k < _len2; j = ++_k) {
          element = elements[j];
          scaler = scalerList[j] != null ? scalerList[j] : scalerList[j] = new Scaler(element);
          done &= scaler.done;
          if (scaler.done) {
            continue;
          }
          count++;
          sum += scaler.tick(frameTime);
        }
      }
      avg = sum / count;
      bar.update(uniScaler.tick(frameTime, avg));
      if (bar.done() || done || cancelAnimation) {
        bar.update(100);
        Pace.trigger('done');
        return setTimeout(function () {
          bar.finish();
          Pace.running = false;
          return Pace.trigger('hide');
        }, Math.max(options.ghostTime, Math.max(options.minTime - (now() - start), 0)));
      } else {
        return enqueueNextFrame();
      }
    });
  };

  Pace.start = function (_options) {
    _extend(options, _options);
    Pace.running = true;
    try {
      bar.render();
    } catch (_error) {
      NoTargetError = _error;
    }
    if (!document.querySelector('.pace')) {
      return setTimeout(Pace.start, 50);
    } else {
      Pace.trigger('start');
      return Pace.go();
    }
  };

  if (typeof define === 'function' && define.amd) {
    define(['pace'], function () {
      return Pace;
    });
  } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
    module.exports = Pace;
  } else {
    if (options.startOnPageLoad) {
      Pace.start();
    }
  }
}).call(undefined);
'use strict';

jQuery(function ($) {
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
    if (Modernizr.touchevents) {
        $('[data-toggle=tooltip]').tooltip('hide');
    } else {
        $('[data-toggle=tooltip]').tooltip();
    }
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRhYi5qcyIsInRyYW5zaXRpb24uanMiLCJ0b29sdGlwLmpzIiwiZmxleHktaGVhZGVyLmpzIiwiZmxleHktbmF2aWdhdGlvbi5qcyIsImpxdWVyeS5zaWRyLmpzIiwianF1ZXJ5LnNsaW5reS5qcyIsInBhY2UuanMiLCJhcHAuanMiXSwibmFtZXMiOlsiJCIsIlRhYiIsImVsZW1lbnQiLCJWRVJTSU9OIiwiVFJBTlNJVElPTl9EVVJBVElPTiIsInByb3RvdHlwZSIsInNob3ciLCIkdGhpcyIsIiR1bCIsImNsb3Nlc3QiLCJzZWxlY3RvciIsImRhdGEiLCJhdHRyIiwicmVwbGFjZSIsInBhcmVudCIsImhhc0NsYXNzIiwiJHByZXZpb3VzIiwiZmluZCIsImhpZGVFdmVudCIsIkV2ZW50IiwicmVsYXRlZFRhcmdldCIsInNob3dFdmVudCIsInRyaWdnZXIiLCJpc0RlZmF1bHRQcmV2ZW50ZWQiLCIkdGFyZ2V0IiwiYWN0aXZhdGUiLCJ0eXBlIiwiY29udGFpbmVyIiwiY2FsbGJhY2siLCIkYWN0aXZlIiwidHJhbnNpdGlvbiIsInN1cHBvcnQiLCJsZW5ndGgiLCJuZXh0IiwicmVtb3ZlQ2xhc3MiLCJlbmQiLCJhZGRDbGFzcyIsIm9mZnNldFdpZHRoIiwib25lIiwiZW11bGF0ZVRyYW5zaXRpb25FbmQiLCJQbHVnaW4iLCJvcHRpb24iLCJlYWNoIiwib2xkIiwiZm4iLCJ0YWIiLCJDb25zdHJ1Y3RvciIsIm5vQ29uZmxpY3QiLCJjbGlja0hhbmRsZXIiLCJlIiwicHJldmVudERlZmF1bHQiLCJjYWxsIiwiZG9jdW1lbnQiLCJvbiIsImpRdWVyeSIsInRyYW5zaXRpb25FbmQiLCJlbCIsImNyZWF0ZUVsZW1lbnQiLCJ0cmFuc0VuZEV2ZW50TmFtZXMiLCJXZWJraXRUcmFuc2l0aW9uIiwiTW96VHJhbnNpdGlvbiIsIk9UcmFuc2l0aW9uIiwibmFtZSIsInN0eWxlIiwidW5kZWZpbmVkIiwiZHVyYXRpb24iLCJjYWxsZWQiLCIkZWwiLCJzZXRUaW1lb3V0IiwiZXZlbnQiLCJzcGVjaWFsIiwiYnNUcmFuc2l0aW9uRW5kIiwiYmluZFR5cGUiLCJkZWxlZ2F0ZVR5cGUiLCJoYW5kbGUiLCJ0YXJnZXQiLCJpcyIsImhhbmRsZU9iaiIsImhhbmRsZXIiLCJhcHBseSIsImFyZ3VtZW50cyIsIlRvb2x0aXAiLCJvcHRpb25zIiwiZW5hYmxlZCIsInRpbWVvdXQiLCJob3ZlclN0YXRlIiwiJGVsZW1lbnQiLCJpblN0YXRlIiwiaW5pdCIsIkRFRkFVTFRTIiwiYW5pbWF0aW9uIiwicGxhY2VtZW50IiwidGVtcGxhdGUiLCJ0aXRsZSIsImRlbGF5IiwiaHRtbCIsInZpZXdwb3J0IiwicGFkZGluZyIsImdldE9wdGlvbnMiLCIkdmlld3BvcnQiLCJpc0Z1bmN0aW9uIiwiY2xpY2siLCJob3ZlciIsImZvY3VzIiwiY29uc3RydWN0b3IiLCJFcnJvciIsInRyaWdnZXJzIiwic3BsaXQiLCJpIiwicHJveHkiLCJ0b2dnbGUiLCJldmVudEluIiwiZXZlbnRPdXQiLCJlbnRlciIsImxlYXZlIiwiX29wdGlvbnMiLCJleHRlbmQiLCJmaXhUaXRsZSIsImdldERlZmF1bHRzIiwiaGlkZSIsImdldERlbGVnYXRlT3B0aW9ucyIsImRlZmF1bHRzIiwia2V5IiwidmFsdWUiLCJvYmoiLCJzZWxmIiwiY3VycmVudFRhcmdldCIsInRpcCIsImNsZWFyVGltZW91dCIsImlzSW5TdGF0ZVRydWUiLCJoYXNDb250ZW50IiwiaW5Eb20iLCJjb250YWlucyIsIm93bmVyRG9jdW1lbnQiLCJkb2N1bWVudEVsZW1lbnQiLCJ0aGF0IiwiJHRpcCIsInRpcElkIiwiZ2V0VUlEIiwic2V0Q29udGVudCIsImF1dG9Ub2tlbiIsImF1dG9QbGFjZSIsInRlc3QiLCJkZXRhY2giLCJjc3MiLCJ0b3AiLCJsZWZ0IiwiZGlzcGxheSIsImFwcGVuZFRvIiwiaW5zZXJ0QWZ0ZXIiLCJwb3MiLCJnZXRQb3NpdGlvbiIsImFjdHVhbFdpZHRoIiwiYWN0dWFsSGVpZ2h0Iiwib2Zmc2V0SGVpZ2h0Iiwib3JnUGxhY2VtZW50Iiwidmlld3BvcnREaW0iLCJib3R0b20iLCJyaWdodCIsIndpZHRoIiwiY2FsY3VsYXRlZE9mZnNldCIsImdldENhbGN1bGF0ZWRPZmZzZXQiLCJhcHBseVBsYWNlbWVudCIsImNvbXBsZXRlIiwicHJldkhvdmVyU3RhdGUiLCJvZmZzZXQiLCJoZWlnaHQiLCJtYXJnaW5Ub3AiLCJwYXJzZUludCIsIm1hcmdpbkxlZnQiLCJpc05hTiIsInNldE9mZnNldCIsInVzaW5nIiwicHJvcHMiLCJNYXRoIiwicm91bmQiLCJkZWx0YSIsImdldFZpZXdwb3J0QWRqdXN0ZWREZWx0YSIsImlzVmVydGljYWwiLCJhcnJvd0RlbHRhIiwiYXJyb3dPZmZzZXRQb3NpdGlvbiIsInJlcGxhY2VBcnJvdyIsImRpbWVuc2lvbiIsImFycm93IiwiZ2V0VGl0bGUiLCJyZW1vdmVBdHRyIiwiJGUiLCJpc0JvZHkiLCJ0YWdOYW1lIiwiZWxSZWN0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiaXNTdmciLCJ3aW5kb3ciLCJTVkdFbGVtZW50IiwiZWxPZmZzZXQiLCJzY3JvbGwiLCJzY3JvbGxUb3AiLCJib2R5Iiwib3V0ZXJEaW1zIiwidmlld3BvcnRQYWRkaW5nIiwidmlld3BvcnREaW1lbnNpb25zIiwidG9wRWRnZU9mZnNldCIsImJvdHRvbUVkZ2VPZmZzZXQiLCJsZWZ0RWRnZU9mZnNldCIsInJpZ2h0RWRnZU9mZnNldCIsIm8iLCJwcmVmaXgiLCJyYW5kb20iLCJnZXRFbGVtZW50QnlJZCIsIiRhcnJvdyIsImVuYWJsZSIsImRpc2FibGUiLCJ0b2dnbGVFbmFibGVkIiwiZGVzdHJveSIsIm9mZiIsInJlbW92ZURhdGEiLCJ0b29sdGlwIiwiZmxleHlfaGVhZGVyIiwicHViIiwiJGhlYWRlcl9zdGF0aWMiLCIkaGVhZGVyX3N0aWNreSIsInVwZGF0ZV9pbnRlcnZhbCIsInRvbGVyYW5jZSIsInVwd2FyZCIsImRvd253YXJkIiwiX2dldF9vZmZzZXRfZnJvbV9lbGVtZW50c19ib3R0b20iLCJjbGFzc2VzIiwicGlubmVkIiwidW5waW5uZWQiLCJ3YXNfc2Nyb2xsZWQiLCJsYXN0X2Rpc3RhbmNlX2Zyb21fdG9wIiwicmVnaXN0ZXJFdmVudEhhbmRsZXJzIiwicmVnaXN0ZXJCb290RXZlbnRIYW5kbGVycyIsInNldEludGVydmFsIiwiZG9jdW1lbnRfd2FzX3Njcm9sbGVkIiwiZWxlbWVudF9oZWlnaHQiLCJvdXRlckhlaWdodCIsImVsZW1lbnRfb2Zmc2V0IiwiY3VycmVudF9kaXN0YW5jZV9mcm9tX3RvcCIsImFicyIsImZsZXh5X25hdmlnYXRpb24iLCJsYXlvdXRfY2xhc3NlcyIsInVwZ3JhZGUiLCIkbmF2aWdhdGlvbnMiLCJuYXZpZ2F0aW9uIiwiaW5kZXgiLCIkbmF2aWdhdGlvbiIsIiRtZWdhbWVudXMiLCJkcm9wZG93bl9tZWdhbWVudSIsIiRkcm9wZG93bl9tZWdhbWVudSIsImRyb3Bkb3duX2hhc19tZWdhbWVudSIsImlzX3VwZ3JhZGVkIiwibmF2aWdhdGlvbl9oYXNfbWVnYW1lbnUiLCIkbWVnYW1lbnUiLCJoYXNfb2JmdXNjYXRvciIsInBhcmVudHMiLCJkcm9wZG93biIsIm9iZnVzY2F0b3IiLCJiYWJlbEhlbHBlcnMiLCJjbGFzc0NhbGxDaGVjayIsImluc3RhbmNlIiwiVHlwZUVycm9yIiwiY3JlYXRlQ2xhc3MiLCJkZWZpbmVQcm9wZXJ0aWVzIiwiZGVzY3JpcHRvciIsImVudW1lcmFibGUiLCJjb25maWd1cmFibGUiLCJ3cml0YWJsZSIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwicHJvdG9Qcm9wcyIsInN0YXRpY1Byb3BzIiwic2lkclN0YXR1cyIsIm1vdmluZyIsIm9wZW5lZCIsImhlbHBlciIsImlzVXJsIiwic3RyIiwicGF0dGVybiIsIlJlZ0V4cCIsImFkZFByZWZpeGVzIiwiYWRkUHJlZml4IiwiYXR0cmlidXRlIiwidG9SZXBsYWNlIiwidHJhbnNpdGlvbnMiLCJzdXBwb3J0ZWQiLCJwcm9wZXJ0eSIsInByZWZpeGVzIiwiY2hhckF0IiwidG9VcHBlckNhc2UiLCJzdWJzdHIiLCJ0b0xvd2VyQ2FzZSIsIiQkMiIsImJvZHlBbmltYXRpb25DbGFzcyIsIm9wZW5BY3Rpb24iLCJjbG9zZUFjdGlvbiIsInRyYW5zaXRpb25FbmRFdmVudCIsIk1lbnUiLCJpdGVtIiwib3BlbkNsYXNzIiwibWVudVdpZHRoIiwib3V0ZXJXaWR0aCIsInNwZWVkIiwic2lkZSIsImRpc3BsYWNlIiwidGltaW5nIiwibWV0aG9kIiwib25PcGVuQ2FsbGJhY2siLCJvbkNsb3NlQ2FsbGJhY2siLCJvbk9wZW5FbmRDYWxsYmFjayIsIm9uQ2xvc2VFbmRDYWxsYmFjayIsImdldEFuaW1hdGlvbiIsImFjdGlvbiIsInByb3AiLCJwcmVwYXJlQm9keSIsIiRodG1sIiwib3BlbkJvZHkiLCIkYm9keSIsInBvc2l0aW9uIiwiYm9keUFuaW1hdGlvbiIsImFuaW1hdGUiLCJxdWV1ZSIsIm9uQ2xvc2VCb2R5IiwicmVzZXRTdHlsZXMiLCJ1bmJpbmQiLCJjbG9zZUJvZHkiLCJfdGhpcyIsIm1vdmVCb2R5Iiwib25PcGVuTWVudSIsIm9wZW5NZW51IiwiX3RoaXMyIiwiJGl0ZW0iLCJtZW51QW5pbWF0aW9uIiwib25DbG9zZU1lbnUiLCJjbG9zZU1lbnUiLCJfdGhpczMiLCJtb3ZlTWVudSIsIm1vdmUiLCJvcGVuIiwiX3RoaXM0IiwiYWxyZWFkeU9wZW5lZE1lbnUiLCJjbG9zZSIsIiQkMSIsImV4ZWN1dGUiLCJzaWRyIiwiZXJyb3IiLCJwdWJsaWNNZXRob2RzIiwibWV0aG9kTmFtZSIsIm1ldGhvZHMiLCJnZXRNZXRob2QiLCJBcnJheSIsInNsaWNlIiwiJCQzIiwiZmlsbENvbnRlbnQiLCIkc2lkZU1lbnUiLCJzZXR0aW5ncyIsInNvdXJjZSIsIm5ld0NvbnRlbnQiLCJnZXQiLCJodG1sQ29udGVudCIsInNlbGVjdG9ycyIsInJlbmFtaW5nIiwiJGh0bWxDb250ZW50IiwiZm5TaWRyIiwiYmluZCIsIm9uT3BlbiIsIm9uQ2xvc2UiLCJvbk9wZW5FbmQiLCJvbkNsb3NlRW5kIiwiZmxhZyIsInQiLCJzbGlua3kiLCJhIiwicyIsImxhYmVsIiwicmVzaXplIiwibiIsImNoaWxkcmVuIiwiZmlyc3QiLCJyIiwibCIsImQiLCJwcmV2IiwicHJlcGVuZCIsInRleHQiLCJhcHBlbmQiLCJEYXRlIiwibm93IiwiaHJlZiIsInBhcmVudHNVbnRpbCIsImp1bXAiLCJob21lIiwicmVtb3ZlIiwiYyIsIkFqYXhNb25pdG9yIiwiQmFyIiwiRG9jdW1lbnRNb25pdG9yIiwiRWxlbWVudE1vbml0b3IiLCJFbGVtZW50VHJhY2tlciIsIkV2ZW50TGFnTW9uaXRvciIsIkV2ZW50ZWQiLCJFdmVudHMiLCJOb1RhcmdldEVycm9yIiwiUGFjZSIsIlJlcXVlc3RJbnRlcmNlcHQiLCJTT1VSQ0VfS0VZUyIsIlNjYWxlciIsIlNvY2tldFJlcXVlc3RUcmFja2VyIiwiWEhSUmVxdWVzdFRyYWNrZXIiLCJhdmdBbXBsaXR1ZGUiLCJiYXIiLCJjYW5jZWxBbmltYXRpb24iLCJjYW5jZWxBbmltYXRpb25GcmFtZSIsImRlZmF1bHRPcHRpb25zIiwiZXh0ZW5kTmF0aXZlIiwiZ2V0RnJvbURPTSIsImdldEludGVyY2VwdCIsImhhbmRsZVB1c2hTdGF0ZSIsImlnbm9yZVN0YWNrIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwicmVzdWx0IiwicnVuQW5pbWF0aW9uIiwic2NhbGVycyIsInNob3VsZElnbm9yZVVSTCIsInNob3VsZFRyYWNrIiwic291cmNlcyIsInVuaVNjYWxlciIsIl9XZWJTb2NrZXQiLCJfWERvbWFpblJlcXVlc3QiLCJfWE1MSHR0cFJlcXVlc3QiLCJfaSIsIl9pbnRlcmNlcHQiLCJfbGVuIiwiX3B1c2hTdGF0ZSIsIl9yZWYiLCJfcmVmMSIsIl9yZXBsYWNlU3RhdGUiLCJfX3NsaWNlIiwiX19oYXNQcm9wIiwiaGFzT3duUHJvcGVydHkiLCJfX2V4dGVuZHMiLCJjaGlsZCIsImN0b3IiLCJfX3N1cGVyX18iLCJfX2luZGV4T2YiLCJpbmRleE9mIiwiY2F0Y2h1cFRpbWUiLCJpbml0aWFsUmF0ZSIsIm1pblRpbWUiLCJnaG9zdFRpbWUiLCJtYXhQcm9ncmVzc1BlckZyYW1lIiwiZWFzZUZhY3RvciIsInN0YXJ0T25QYWdlTG9hZCIsInJlc3RhcnRPblB1c2hTdGF0ZSIsInJlc3RhcnRPblJlcXVlc3RBZnRlciIsImVsZW1lbnRzIiwiY2hlY2tJbnRlcnZhbCIsImV2ZW50TGFnIiwibWluU2FtcGxlcyIsInNhbXBsZUNvdW50IiwibGFnVGhyZXNob2xkIiwiYWpheCIsInRyYWNrTWV0aG9kcyIsInRyYWNrV2ViU29ja2V0cyIsImlnbm9yZVVSTHMiLCJwZXJmb3JtYW5jZSIsIm1velJlcXVlc3RBbmltYXRpb25GcmFtZSIsIndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSIsIm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwibW96Q2FuY2VsQW5pbWF0aW9uRnJhbWUiLCJpZCIsImxhc3QiLCJ0aWNrIiwiZGlmZiIsImFyZ3MiLCJvdXQiLCJ2YWwiLCJhcnIiLCJjb3VudCIsInN1bSIsInYiLCJqc29uIiwicXVlcnlTZWxlY3RvciIsImdldEF0dHJpYnV0ZSIsIkpTT04iLCJwYXJzZSIsIl9lcnJvciIsImNvbnNvbGUiLCJjdHgiLCJvbmNlIiwiX2Jhc2UiLCJiaW5kaW5ncyIsInB1c2giLCJfcmVzdWx0cyIsInNwbGljZSIsInBhY2VPcHRpb25zIiwiX3N1cGVyIiwicHJvZ3Jlc3MiLCJnZXRFbGVtZW50IiwidGFyZ2V0RWxlbWVudCIsImNsYXNzTmFtZSIsImlubmVySFRNTCIsImZpcnN0Q2hpbGQiLCJpbnNlcnRCZWZvcmUiLCJhcHBlbmRDaGlsZCIsImZpbmlzaCIsInVwZGF0ZSIsInByb2ciLCJyZW5kZXIiLCJwYXJlbnROb2RlIiwicmVtb3ZlQ2hpbGQiLCJwcm9ncmVzc1N0ciIsInRyYW5zZm9ybSIsIl9qIiwiX2xlbjEiLCJfcmVmMiIsImxhc3RSZW5kZXJlZFByb2dyZXNzIiwic2V0QXR0cmlidXRlIiwiZG9uZSIsImJpbmRpbmciLCJYTUxIdHRwUmVxdWVzdCIsIlhEb21haW5SZXF1ZXN0IiwiV2ViU29ja2V0IiwidG8iLCJmcm9tIiwiaWdub3JlIiwicmV0IiwidW5zaGlmdCIsInNoaWZ0IiwidHJhY2siLCJtb25pdG9yWEhSIiwicmVxIiwiX29wZW4iLCJ1cmwiLCJhc3luYyIsInJlcXVlc3QiLCJmbGFncyIsInByb3RvY29scyIsIl9hcmciLCJhZnRlciIsInJ1bm5pbmciLCJzdGlsbEFjdGl2ZSIsIl9yZWYzIiwicmVhZHlTdGF0ZSIsInJlc3RhcnQiLCJ3YXRjaCIsInRyYWNrZXIiLCJzaXplIiwiX29ucmVhZHlzdGF0ZWNoYW5nZSIsIlByb2dyZXNzRXZlbnQiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZ0IiwibGVuZ3RoQ29tcHV0YWJsZSIsImxvYWRlZCIsInRvdGFsIiwib25yZWFkeXN0YXRlY2hhbmdlIiwiY2hlY2siLCJzdGF0ZXMiLCJsb2FkaW5nIiwiaW50ZXJhY3RpdmUiLCJhdmciLCJpbnRlcnZhbCIsInBvaW50cyIsInNhbXBsZXMiLCJjbGVhckludGVydmFsIiwic2luY2VMYXN0VXBkYXRlIiwicmF0ZSIsImNhdGNodXAiLCJsYXN0UHJvZ3Jlc3MiLCJmcmFtZVRpbWUiLCJzY2FsaW5nIiwicG93IiwibWluIiwibWF4IiwiaGlzdG9yeSIsInB1c2hTdGF0ZSIsInJlcGxhY2VTdGF0ZSIsIl9rIiwiX2xlbjIiLCJfcmVmNCIsImV4dHJhU291cmNlcyIsInN0b3AiLCJzdGFydCIsImdvIiwiZW5xdWV1ZU5leHRGcmFtZSIsImoiLCJyZW1haW5pbmciLCJzY2FsZXIiLCJzY2FsZXJMaXN0IiwiZGVmaW5lIiwiYW1kIiwiZXhwb3J0cyIsIm1vZHVsZSIsIk1vZGVybml6ciIsInRvdWNoZXZlbnRzIl0sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7OztBQVNBLENBQUMsVUFBVUEsQ0FBVixFQUFhO0FBQ1o7O0FBRUE7QUFDQTs7QUFFQSxNQUFJQyxNQUFNLFNBQU5BLEdBQU0sQ0FBVUMsT0FBVixFQUFtQjtBQUMzQjtBQUNBLFNBQUtBLE9BQUwsR0FBZUYsRUFBRUUsT0FBRixDQUFmO0FBQ0E7QUFDRCxH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QUNBeU4saUJBQWFqSSxJQUFiOztBQUVBO0FBQ0F3SixxQkFBaUJ4SixJQUFqQjs7QUFFQTtBQUNBeEYsTUFBRSxxQkFBRixFQUF5QndWLElBQXpCLENBQThCO0FBQzFCMVIsY0FBTSxXQURvQjtBQUUxQmlQLGNBQU0sT0FGb0I7QUFHMUIwRCxrQkFBVSxLQUhnQjtBQUkxQnBLLGNBQU0sa0JBSm9CO0FBSzFCK0osZ0JBQVE7QUFMa0IsS0FBOUI7O0FBUUE7QUFDQXBXLE1BQUUsb0JBQUYsRUFBd0JtWCxNQUF4QixDQUErQjtBQUMzQnRSLGVBQU8sSUFEb0I7QUFFM0J5UixlQUFPO0FBRm9CLEtBQS9COztBQUtBO0FBQ0EsUUFBRzJOLFVBQVVDLFdBQWIsRUFBMEI7QUFDdEJsbEIsVUFBRSx1QkFBRixFQUEyQndOLE9BQTNCLENBQW1DLE1BQW5DO0FBQ0gsS0FGRCxNQUdLO0FBQ0R4TixVQUFFLHVCQUFGLEVBQTJCd04sT0FBM0I7QUFDSDtBQUNKLENBL0JEIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQm9vdHN0cmFwOiB0YWIuanMgdjMuMy43XG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyN0YWJzXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5cbitmdW5jdGlvbiAoJCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gVEFCIENMQVNTIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT1cblxuICB2YXIgVGFiID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAvLyBqc2NzOmRpc2FibGUgcmVxdWlyZURvbGxhckJlZm9yZWpRdWVyeUFzc2lnbm1lbnRcbiAgICB0aGlzLmVsZW1lbnQgPSAkKGVsZW1lbnQpXG4gICAgLy8ganNjczplbmFibGUgcmVxdWlyZURvbGxhckJlZm9yZWpRdWVyeUFzc2lnbm1lbnRcbiAgfVxuXG4gIFRhYi5WRVJTSU9OID0gJzMuMy43J1xuXG4gIFRhYi5UUkFOU0lUSU9OX0RVUkFUSU9OID0gMTUwXG5cbiAgVGFiLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciAkdGhpcyAgICA9IHRoaXMuZWxlbWVudFxuICAgIHZhciAkdWwgICAgICA9ICR0aGlzLmNsb3Nlc3QoJ3VsOm5vdCguZHJvcGRvd24tbWVudSknKVxuICAgIHZhciBzZWxlY3RvciA9ICR0aGlzLmRhdGEoJ3RhcmdldCcpXG5cbiAgICBpZiAoIXNlbGVjdG9yKSB7XG4gICAgICBzZWxlY3RvciA9ICR0aGlzLmF0dHIoJ2hyZWYnKVxuICAgICAgc2VsZWN0b3IgPSBzZWxlY3RvciAmJiBzZWxlY3Rvci5yZXBsYWNlKC8uKig/PSNbXlxcc10qJCkvLCAnJykgLy8gc3RyaXAgZm9yIGllN1xuICAgIH1cblxuICAgIGlmICgkdGhpcy5wYXJlbnQoJ2xpJykuaGFzQ2xhc3MoJ2FjdGl2ZScpKSByZXR1cm5cblxuICAgIHZhciAkcHJldmlvdXMgPSAkdWwuZmluZCgnLmFjdGl2ZTpsYXN0IGEnKVxuICAgIHZhciBoaWRlRXZlbnQgPSAkLkV2ZW50KCdoaWRlLmJzLnRhYicsIHtcbiAgICAgIHJlbGF0ZWRUYXJnZXQ6ICR0aGlzWzBdXG4gICAgfSlcbiAgICB2YXIgc2hvd0V2ZW50ID0gJC5FdmVudCgnc2hvdy5icy50YWInLCB7XG4gICAgICByZWxhdGVkVGFyZ2V0OiAkcHJldmlvdXNbMF1cbiAgICB9KVxuXG4gICAgJHByZXZpb3VzLnRyaWdnZXIoaGlkZUV2ZW50KVxuICAgICR0aGlzLnRyaWdnZXIoc2hvd0V2ZW50KVxuXG4gICAgaWYgKHNob3dFdmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSB8fCBoaWRlRXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkpIHJldHVyblxuXG4gICAgdmFyICR0YXJnZXQgPSAkKHNlbGVjdG9yKVxuXG4gICAgdGhpcy5hY3RpdmF0ZSgkdGhpcy5jbG9zZXN0KCdsaScpLCAkdWwpXG4gICAgdGhpcy5hY3RpdmF0ZSgkdGFyZ2V0LCAkdGFyZ2V0LnBhcmVudCgpLCBmdW5jdGlvbiAoKSB7XG4gICAgICAkcHJldmlvdXMudHJpZ2dlcih7XG4gICAgICAgIHR5cGU6ICdoaWRkZW4uYnMudGFiJyxcbiAgICAgICAgcmVsYXRlZFRhcmdldDogJHRoaXNbMF1cbiAgICAgIH0pXG4gICAgICAkdGhpcy50cmlnZ2VyKHtcbiAgICAgICAgdHlwZTogJ3Nob3duLmJzLnRhYicsXG4gICAgICAgIHJlbGF0ZWRUYXJnZXQ6ICRwcmV2aW91c1swXVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgVGFiLnByb3RvdHlwZS5hY3RpdmF0ZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBjb250YWluZXIsIGNhbGxiYWNrKSB7XG4gICAgdmFyICRhY3RpdmUgICAgPSBjb250YWluZXIuZmluZCgnPiAuYWN0aXZlJylcbiAgICB2YXIgdHJhbnNpdGlvbiA9IGNhbGxiYWNrXG4gICAgICAmJiAkLnN1cHBvcnQudHJhbnNpdGlvblxuICAgICAgJiYgKCRhY3RpdmUubGVuZ3RoICYmICRhY3RpdmUuaGFzQ2xhc3MoJ2ZhZGUnKSB8fCAhIWNvbnRhaW5lci5maW5kKCc+IC5mYWRlJykubGVuZ3RoKVxuXG4gICAgZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICRhY3RpdmVcbiAgICAgICAgLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxuICAgICAgICAuZmluZCgnPiAuZHJvcGRvd24tbWVudSA+IC5hY3RpdmUnKVxuICAgICAgICAgIC5yZW1vdmVDbGFzcygnYWN0aXZlJylcbiAgICAgICAgLmVuZCgpXG4gICAgICAgIC5maW5kKCdbZGF0YS10b2dnbGU9XCJ0YWJcIl0nKVxuICAgICAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgZmFsc2UpXG5cbiAgICAgIGVsZW1lbnRcbiAgICAgICAgLmFkZENsYXNzKCdhY3RpdmUnKVxuICAgICAgICAuZmluZCgnW2RhdGEtdG9nZ2xlPVwidGFiXCJdJylcbiAgICAgICAgICAuYXR0cignYXJpYS1leHBhbmRlZCcsIHRydWUpXG5cbiAgICAgIGlmICh0cmFuc2l0aW9uKSB7XG4gICAgICAgIGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGggLy8gcmVmbG93IGZvciB0cmFuc2l0aW9uXG4gICAgICAgIGVsZW1lbnQuYWRkQ2xhc3MoJ2luJylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2ZhZGUnKVxuICAgICAgfVxuXG4gICAgICBpZiAoZWxlbWVudC5wYXJlbnQoJy5kcm9wZG93bi1tZW51JykubGVuZ3RoKSB7XG4gICAgICAgIGVsZW1lbnRcbiAgICAgICAgICAuY2xvc2VzdCgnbGkuZHJvcGRvd24nKVxuICAgICAgICAgICAgLmFkZENsYXNzKCdhY3RpdmUnKVxuICAgICAgICAgIC5lbmQoKVxuICAgICAgICAgIC5maW5kKCdbZGF0YS10b2dnbGU9XCJ0YWJcIl0nKVxuICAgICAgICAgICAgLmF0dHIoJ2FyaWEtZXhwYW5kZWQnLCB0cnVlKVxuICAgICAgfVxuXG4gICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygpXG4gICAgfVxuXG4gICAgJGFjdGl2ZS5sZW5ndGggJiYgdHJhbnNpdGlvbiA/XG4gICAgICAkYWN0aXZlXG4gICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIG5leHQpXG4gICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChUYWIuVFJBTlNJVElPTl9EVVJBVElPTikgOlxuICAgICAgbmV4dCgpXG5cbiAgICAkYWN0aXZlLnJlbW92ZUNsYXNzKCdpbicpXG4gIH1cblxuXG4gIC8vIFRBQiBQTFVHSU4gREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT1cblxuICBmdW5jdGlvbiBQbHVnaW4ob3B0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpXG4gICAgICB2YXIgZGF0YSAgPSAkdGhpcy5kYXRhKCdicy50YWInKVxuXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLnRhYicsIChkYXRhID0gbmV3IFRhYih0aGlzKSkpXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbiA9PSAnc3RyaW5nJykgZGF0YVtvcHRpb25dKClcbiAgICB9KVxuICB9XG5cbiAgdmFyIG9sZCA9ICQuZm4udGFiXG5cbiAgJC5mbi50YWIgICAgICAgICAgICAgPSBQbHVnaW5cbiAgJC5mbi50YWIuQ29uc3RydWN0b3IgPSBUYWJcblxuXG4gIC8vIFRBQiBOTyBDT05GTElDVFxuICAvLyA9PT09PT09PT09PT09PT1cblxuICAkLmZuLnRhYi5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICQuZm4udGFiID0gb2xkXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG5cbiAgLy8gVEFCIERBVEEtQVBJXG4gIC8vID09PT09PT09PT09PVxuXG4gIHZhciBjbGlja0hhbmRsZXIgPSBmdW5jdGlvbiAoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIFBsdWdpbi5jYWxsKCQodGhpcyksICdzaG93JylcbiAgfVxuXG4gICQoZG9jdW1lbnQpXG4gICAgLm9uKCdjbGljay5icy50YWIuZGF0YS1hcGknLCAnW2RhdGEtdG9nZ2xlPVwidGFiXCJdJywgY2xpY2tIYW5kbGVyKVxuICAgIC5vbignY2xpY2suYnMudGFiLmRhdGEtYXBpJywgJ1tkYXRhLXRvZ2dsZT1cInBpbGxcIl0nLCBjbGlja0hhbmRsZXIpXG5cbn0oalF1ZXJ5KTtcbiIsIi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQm9vdHN0cmFwOiB0cmFuc2l0aW9uLmpzIHYzLjMuN1xuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jdHJhbnNpdGlvbnNcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQ29weXJpZ2h0IDIwMTEtMjAxNiBUd2l0dGVyLCBJbmMuXG4gKiBMaWNlbnNlZCB1bmRlciBNSVQgKGh0dHBzOi8vZ2l0aHViLmNvbS90d2JzL2Jvb3RzdHJhcC9ibG9iL21hc3Rlci9MSUNFTlNFKVxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cblxuK2Z1bmN0aW9uICgkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBDU1MgVFJBTlNJVElPTiBTVVBQT1JUIChTaG91dG91dDogaHR0cDovL3d3dy5tb2Rlcm5penIuY29tLylcbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgZnVuY3Rpb24gdHJhbnNpdGlvbkVuZCgpIHtcbiAgICB2YXIgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdib290c3RyYXAnKVxuXG4gICAgdmFyIHRyYW5zRW5kRXZlbnROYW1lcyA9IHtcbiAgICAgIFdlYmtpdFRyYW5zaXRpb24gOiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsXG4gICAgICBNb3pUcmFuc2l0aW9uICAgIDogJ3RyYW5zaXRpb25lbmQnLFxuICAgICAgT1RyYW5zaXRpb24gICAgICA6ICdvVHJhbnNpdGlvbkVuZCBvdHJhbnNpdGlvbmVuZCcsXG4gICAgICB0cmFuc2l0aW9uICAgICAgIDogJ3RyYW5zaXRpb25lbmQnXG4gICAgfVxuXG4gICAgZm9yICh2YXIgbmFtZSBpbiB0cmFuc0VuZEV2ZW50TmFtZXMpIHtcbiAgICAgIGlmIChlbC5zdHlsZVtuYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB7IGVuZDogdHJhbnNFbmRFdmVudE5hbWVzW25hbWVdIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2UgLy8gZXhwbGljaXQgZm9yIGllOCAoICAuXy4pXG4gIH1cblxuICAvLyBodHRwOi8vYmxvZy5hbGV4bWFjY2F3LmNvbS9jc3MtdHJhbnNpdGlvbnNcbiAgJC5mbi5lbXVsYXRlVHJhbnNpdGlvbkVuZCA9IGZ1bmN0aW9uIChkdXJhdGlvbikge1xuICAgIHZhciBjYWxsZWQgPSBmYWxzZVxuICAgIHZhciAkZWwgPSB0aGlzXG4gICAgJCh0aGlzKS5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIGZ1bmN0aW9uICgpIHsgY2FsbGVkID0gdHJ1ZSB9KVxuICAgIHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uICgpIHsgaWYgKCFjYWxsZWQpICQoJGVsKS50cmlnZ2VyKCQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCkgfVxuICAgIHNldFRpbWVvdXQoY2FsbGJhY2ssIGR1cmF0aW9uKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAkKGZ1bmN0aW9uICgpIHtcbiAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiA9IHRyYW5zaXRpb25FbmQoKVxuXG4gICAgaWYgKCEkLnN1cHBvcnQudHJhbnNpdGlvbikgcmV0dXJuXG5cbiAgICAkLmV2ZW50LnNwZWNpYWwuYnNUcmFuc2l0aW9uRW5kID0ge1xuICAgICAgYmluZFR5cGU6ICQuc3VwcG9ydC50cmFuc2l0aW9uLmVuZCxcbiAgICAgIGRlbGVnYXRlVHlwZTogJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLFxuICAgICAgaGFuZGxlOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoJChlLnRhcmdldCkuaXModGhpcykpIHJldHVybiBlLmhhbmRsZU9iai5oYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbn0oalF1ZXJ5KTtcbiIsIi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICogQm9vdHN0cmFwOiB0b29sdGlwLmpzIHYzLjMuN1xuICogaHR0cDovL2dldGJvb3RzdHJhcC5jb20vamF2YXNjcmlwdC8jdG9vbHRpcFxuICogSW5zcGlyZWQgYnkgdGhlIG9yaWdpbmFsIGpRdWVyeS50aXBzeSBieSBKYXNvbiBGcmFtZVxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBDb3B5cmlnaHQgMjAxMS0yMDE2IFR3aXR0ZXIsIEluYy5cbiAqIExpY2Vuc2VkIHVuZGVyIE1JVCAoaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2Jsb2IvbWFzdGVyL0xJQ0VOU0UpXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuXG4rZnVuY3Rpb24gKCQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIFRPT0xUSVAgUFVCTElDIENMQVNTIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIHZhciBUb29sdGlwID0gZnVuY3Rpb24gKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLnR5cGUgICAgICAgPSBudWxsXG4gICAgdGhpcy5vcHRpb25zICAgID0gbnVsbFxuICAgIHRoaXMuZW5hYmxlZCAgICA9IG51bGxcbiAgICB0aGlzLnRpbWVvdXQgICAgPSBudWxsXG4gICAgdGhpcy5ob3ZlclN0YXRlID0gbnVsbFxuICAgIHRoaXMuJGVsZW1lbnQgICA9IG51bGxcbiAgICB0aGlzLmluU3RhdGUgICAgPSBudWxsXG5cbiAgICB0aGlzLmluaXQoJ3Rvb2x0aXAnLCBlbGVtZW50LCBvcHRpb25zKVxuICB9XG5cbiAgVG9vbHRpcC5WRVJTSU9OICA9ICczLjMuNydcblxuICBUb29sdGlwLlRSQU5TSVRJT05fRFVSQVRJT04gPSAxNTBcblxuICBUb29sdGlwLkRFRkFVTFRTID0ge1xuICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICBwbGFjZW1lbnQ6ICd0b3AnLFxuICAgIHNlbGVjdG9yOiBmYWxzZSxcbiAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0b29sdGlwXCIgcm9sZT1cInRvb2x0aXBcIj48ZGl2IGNsYXNzPVwidG9vbHRpcC1hcnJvd1wiPjwvZGl2PjxkaXYgY2xhc3M9XCJ0b29sdGlwLWlubmVyXCI+PC9kaXY+PC9kaXY+JyxcbiAgICB0cmlnZ2VyOiAnaG92ZXIgZm9jdXMnLFxuICAgIHRpdGxlOiAnJyxcbiAgICBkZWxheTogMCxcbiAgICBodG1sOiBmYWxzZSxcbiAgICBjb250YWluZXI6IGZhbHNlLFxuICAgIHZpZXdwb3J0OiB7XG4gICAgICBzZWxlY3RvcjogJ2JvZHknLFxuICAgICAgcGFkZGluZzogMFxuICAgIH1cbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAodHlwZSwgZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuZW5hYmxlZCAgID0gdHJ1ZVxuICAgIHRoaXMudHlwZSAgICAgID0gdHlwZVxuICAgIHRoaXMuJGVsZW1lbnQgID0gJChlbGVtZW50KVxuICAgIHRoaXMub3B0aW9ucyAgID0gdGhpcy5nZXRPcHRpb25zKG9wdGlvbnMpXG4gICAgdGhpcy4kdmlld3BvcnQgPSB0aGlzLm9wdGlvbnMudmlld3BvcnQgJiYgJCgkLmlzRnVuY3Rpb24odGhpcy5vcHRpb25zLnZpZXdwb3J0KSA/IHRoaXMub3B0aW9ucy52aWV3cG9ydC5jYWxsKHRoaXMsIHRoaXMuJGVsZW1lbnQpIDogKHRoaXMub3B0aW9ucy52aWV3cG9ydC5zZWxlY3RvciB8fCB0aGlzLm9wdGlvbnMudmlld3BvcnQpKVxuICAgIHRoaXMuaW5TdGF0ZSAgID0geyBjbGljazogZmFsc2UsIGhvdmVyOiBmYWxzZSwgZm9jdXM6IGZhbHNlIH1cblxuICAgIGlmICh0aGlzLiRlbGVtZW50WzBdIGluc3RhbmNlb2YgZG9jdW1lbnQuY29uc3RydWN0b3IgJiYgIXRoaXMub3B0aW9ucy5zZWxlY3Rvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdgc2VsZWN0b3JgIG9wdGlvbiBtdXN0IGJlIHNwZWNpZmllZCB3aGVuIGluaXRpYWxpemluZyAnICsgdGhpcy50eXBlICsgJyBvbiB0aGUgd2luZG93LmRvY3VtZW50IG9iamVjdCEnKVxuICAgIH1cblxuICAgIHZhciB0cmlnZ2VycyA9IHRoaXMub3B0aW9ucy50cmlnZ2VyLnNwbGl0KCcgJylcblxuICAgIGZvciAodmFyIGkgPSB0cmlnZ2Vycy5sZW5ndGg7IGktLTspIHtcbiAgICAgIHZhciB0cmlnZ2VyID0gdHJpZ2dlcnNbaV1cblxuICAgICAgaWYgKHRyaWdnZXIgPT0gJ2NsaWNrJykge1xuICAgICAgICB0aGlzLiRlbGVtZW50Lm9uKCdjbGljay4nICsgdGhpcy50eXBlLCB0aGlzLm9wdGlvbnMuc2VsZWN0b3IsICQucHJveHkodGhpcy50b2dnbGUsIHRoaXMpKVxuICAgICAgfSBlbHNlIGlmICh0cmlnZ2VyICE9ICdtYW51YWwnKSB7XG4gICAgICAgIHZhciBldmVudEluICA9IHRyaWdnZXIgPT0gJ2hvdmVyJyA/ICdtb3VzZWVudGVyJyA6ICdmb2N1c2luJ1xuICAgICAgICB2YXIgZXZlbnRPdXQgPSB0cmlnZ2VyID09ICdob3ZlcicgPyAnbW91c2VsZWF2ZScgOiAnZm9jdXNvdXQnXG5cbiAgICAgICAgdGhpcy4kZWxlbWVudC5vbihldmVudEluICArICcuJyArIHRoaXMudHlwZSwgdGhpcy5vcHRpb25zLnNlbGVjdG9yLCAkLnByb3h5KHRoaXMuZW50ZXIsIHRoaXMpKVxuICAgICAgICB0aGlzLiRlbGVtZW50Lm9uKGV2ZW50T3V0ICsgJy4nICsgdGhpcy50eXBlLCB0aGlzLm9wdGlvbnMuc2VsZWN0b3IsICQucHJveHkodGhpcy5sZWF2ZSwgdGhpcykpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5vcHRpb25zLnNlbGVjdG9yID9cbiAgICAgICh0aGlzLl9vcHRpb25zID0gJC5leHRlbmQoe30sIHRoaXMub3B0aW9ucywgeyB0cmlnZ2VyOiAnbWFudWFsJywgc2VsZWN0b3I6ICcnIH0pKSA6XG4gICAgICB0aGlzLmZpeFRpdGxlKClcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldERlZmF1bHRzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBUb29sdGlwLkRFRkFVTFRTXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5nZXRPcHRpb25zID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gJC5leHRlbmQoe30sIHRoaXMuZ2V0RGVmYXVsdHMoKSwgdGhpcy4kZWxlbWVudC5kYXRhKCksIG9wdGlvbnMpXG5cbiAgICBpZiAob3B0aW9ucy5kZWxheSAmJiB0eXBlb2Ygb3B0aW9ucy5kZWxheSA9PSAnbnVtYmVyJykge1xuICAgICAgb3B0aW9ucy5kZWxheSA9IHtcbiAgICAgICAgc2hvdzogb3B0aW9ucy5kZWxheSxcbiAgICAgICAgaGlkZTogb3B0aW9ucy5kZWxheVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvcHRpb25zXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5nZXREZWxlZ2F0ZU9wdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG9wdGlvbnMgID0ge31cbiAgICB2YXIgZGVmYXVsdHMgPSB0aGlzLmdldERlZmF1bHRzKClcblxuICAgIHRoaXMuX29wdGlvbnMgJiYgJC5lYWNoKHRoaXMuX29wdGlvbnMsIGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICBpZiAoZGVmYXVsdHNba2V5XSAhPSB2YWx1ZSkgb3B0aW9uc1trZXldID0gdmFsdWVcbiAgICB9KVxuXG4gICAgcmV0dXJuIG9wdGlvbnNcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmVudGVyID0gZnVuY3Rpb24gKG9iaikge1xuICAgIHZhciBzZWxmID0gb2JqIGluc3RhbmNlb2YgdGhpcy5jb25zdHJ1Y3RvciA/XG4gICAgICBvYmogOiAkKG9iai5jdXJyZW50VGFyZ2V0KS5kYXRhKCdicy4nICsgdGhpcy50eXBlKVxuXG4gICAgaWYgKCFzZWxmKSB7XG4gICAgICBzZWxmID0gbmV3IHRoaXMuY29uc3RydWN0b3Iob2JqLmN1cnJlbnRUYXJnZXQsIHRoaXMuZ2V0RGVsZWdhdGVPcHRpb25zKCkpXG4gICAgICAkKG9iai5jdXJyZW50VGFyZ2V0KS5kYXRhKCdicy4nICsgdGhpcy50eXBlLCBzZWxmKVxuICAgIH1cblxuICAgIGlmIChvYmogaW5zdGFuY2VvZiAkLkV2ZW50KSB7XG4gICAgICBzZWxmLmluU3RhdGVbb2JqLnR5cGUgPT0gJ2ZvY3VzaW4nID8gJ2ZvY3VzJyA6ICdob3ZlciddID0gdHJ1ZVxuICAgIH1cblxuICAgIGlmIChzZWxmLnRpcCgpLmhhc0NsYXNzKCdpbicpIHx8IHNlbGYuaG92ZXJTdGF0ZSA9PSAnaW4nKSB7XG4gICAgICBzZWxmLmhvdmVyU3RhdGUgPSAnaW4nXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjbGVhclRpbWVvdXQoc2VsZi50aW1lb3V0KVxuXG4gICAgc2VsZi5ob3ZlclN0YXRlID0gJ2luJ1xuXG4gICAgaWYgKCFzZWxmLm9wdGlvbnMuZGVsYXkgfHwgIXNlbGYub3B0aW9ucy5kZWxheS5zaG93KSByZXR1cm4gc2VsZi5zaG93KClcblxuICAgIHNlbGYudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHNlbGYuaG92ZXJTdGF0ZSA9PSAnaW4nKSBzZWxmLnNob3coKVxuICAgIH0sIHNlbGYub3B0aW9ucy5kZWxheS5zaG93KVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuaXNJblN0YXRlVHJ1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5pblN0YXRlKSB7XG4gICAgICBpZiAodGhpcy5pblN0YXRlW2tleV0pIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5sZWF2ZSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICB2YXIgc2VsZiA9IG9iaiBpbnN0YW5jZW9mIHRoaXMuY29uc3RydWN0b3IgP1xuICAgICAgb2JqIDogJChvYmouY3VycmVudFRhcmdldCkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSlcblxuICAgIGlmICghc2VsZikge1xuICAgICAgc2VsZiA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKG9iai5jdXJyZW50VGFyZ2V0LCB0aGlzLmdldERlbGVnYXRlT3B0aW9ucygpKVxuICAgICAgJChvYmouY3VycmVudFRhcmdldCkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSwgc2VsZilcbiAgICB9XG5cbiAgICBpZiAob2JqIGluc3RhbmNlb2YgJC5FdmVudCkge1xuICAgICAgc2VsZi5pblN0YXRlW29iai50eXBlID09ICdmb2N1c291dCcgPyAnZm9jdXMnIDogJ2hvdmVyJ10gPSBmYWxzZVxuICAgIH1cblxuICAgIGlmIChzZWxmLmlzSW5TdGF0ZVRydWUoKSkgcmV0dXJuXG5cbiAgICBjbGVhclRpbWVvdXQoc2VsZi50aW1lb3V0KVxuXG4gICAgc2VsZi5ob3ZlclN0YXRlID0gJ291dCdcblxuICAgIGlmICghc2VsZi5vcHRpb25zLmRlbGF5IHx8ICFzZWxmLm9wdGlvbnMuZGVsYXkuaGlkZSkgcmV0dXJuIHNlbGYuaGlkZSgpXG5cbiAgICBzZWxmLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChzZWxmLmhvdmVyU3RhdGUgPT0gJ291dCcpIHNlbGYuaGlkZSgpXG4gICAgfSwgc2VsZi5vcHRpb25zLmRlbGF5LmhpZGUpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5zaG93ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBlID0gJC5FdmVudCgnc2hvdy5icy4nICsgdGhpcy50eXBlKVxuXG4gICAgaWYgKHRoaXMuaGFzQ29udGVudCgpICYmIHRoaXMuZW5hYmxlZCkge1xuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKGUpXG5cbiAgICAgIHZhciBpbkRvbSA9ICQuY29udGFpbnModGhpcy4kZWxlbWVudFswXS5vd25lckRvY3VtZW50LmRvY3VtZW50RWxlbWVudCwgdGhpcy4kZWxlbWVudFswXSlcbiAgICAgIGlmIChlLmlzRGVmYXVsdFByZXZlbnRlZCgpIHx8ICFpbkRvbSkgcmV0dXJuXG4gICAgICB2YXIgdGhhdCA9IHRoaXNcblxuICAgICAgdmFyICR0aXAgPSB0aGlzLnRpcCgpXG5cbiAgICAgIHZhciB0aXBJZCA9IHRoaXMuZ2V0VUlEKHRoaXMudHlwZSlcblxuICAgICAgdGhpcy5zZXRDb250ZW50KClcbiAgICAgICR0aXAuYXR0cignaWQnLCB0aXBJZClcbiAgICAgIHRoaXMuJGVsZW1lbnQuYXR0cignYXJpYS1kZXNjcmliZWRieScsIHRpcElkKVxuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmFuaW1hdGlvbikgJHRpcC5hZGRDbGFzcygnZmFkZScpXG5cbiAgICAgIHZhciBwbGFjZW1lbnQgPSB0eXBlb2YgdGhpcy5vcHRpb25zLnBsYWNlbWVudCA9PSAnZnVuY3Rpb24nID9cbiAgICAgICAgdGhpcy5vcHRpb25zLnBsYWNlbWVudC5jYWxsKHRoaXMsICR0aXBbMF0sIHRoaXMuJGVsZW1lbnRbMF0pIDpcbiAgICAgICAgdGhpcy5vcHRpb25zLnBsYWNlbWVudFxuXG4gICAgICB2YXIgYXV0b1Rva2VuID0gL1xccz9hdXRvP1xccz8vaVxuICAgICAgdmFyIGF1dG9QbGFjZSA9IGF1dG9Ub2tlbi50ZXN0KHBsYWNlbWVudClcbiAgICAgIGlmIChhdXRvUGxhY2UpIHBsYWNlbWVudCA9IHBsYWNlbWVudC5yZXBsYWNlKGF1dG9Ub2tlbiwgJycpIHx8ICd0b3AnXG5cbiAgICAgICR0aXBcbiAgICAgICAgLmRldGFjaCgpXG4gICAgICAgIC5jc3MoeyB0b3A6IDAsIGxlZnQ6IDAsIGRpc3BsYXk6ICdibG9jaycgfSlcbiAgICAgICAgLmFkZENsYXNzKHBsYWNlbWVudClcbiAgICAgICAgLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUsIHRoaXMpXG5cbiAgICAgIHRoaXMub3B0aW9ucy5jb250YWluZXIgPyAkdGlwLmFwcGVuZFRvKHRoaXMub3B0aW9ucy5jb250YWluZXIpIDogJHRpcC5pbnNlcnRBZnRlcih0aGlzLiRlbGVtZW50KVxuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdpbnNlcnRlZC5icy4nICsgdGhpcy50eXBlKVxuXG4gICAgICB2YXIgcG9zICAgICAgICAgID0gdGhpcy5nZXRQb3NpdGlvbigpXG4gICAgICB2YXIgYWN0dWFsV2lkdGggID0gJHRpcFswXS5vZmZzZXRXaWR0aFxuICAgICAgdmFyIGFjdHVhbEhlaWdodCA9ICR0aXBbMF0ub2Zmc2V0SGVpZ2h0XG5cbiAgICAgIGlmIChhdXRvUGxhY2UpIHtcbiAgICAgICAgdmFyIG9yZ1BsYWNlbWVudCA9IHBsYWNlbWVudFxuICAgICAgICB2YXIgdmlld3BvcnREaW0gPSB0aGlzLmdldFBvc2l0aW9uKHRoaXMuJHZpZXdwb3J0KVxuXG4gICAgICAgIHBsYWNlbWVudCA9IHBsYWNlbWVudCA9PSAnYm90dG9tJyAmJiBwb3MuYm90dG9tICsgYWN0dWFsSGVpZ2h0ID4gdmlld3BvcnREaW0uYm90dG9tID8gJ3RvcCcgICAgOlxuICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnQgPT0gJ3RvcCcgICAgJiYgcG9zLnRvcCAgICAtIGFjdHVhbEhlaWdodCA8IHZpZXdwb3J0RGltLnRvcCAgICA/ICdib3R0b20nIDpcbiAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50ID09ICdyaWdodCcgICYmIHBvcy5yaWdodCAgKyBhY3R1YWxXaWR0aCAgPiB2aWV3cG9ydERpbS53aWR0aCAgPyAnbGVmdCcgICA6XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudCA9PSAnbGVmdCcgICAmJiBwb3MubGVmdCAgIC0gYWN0dWFsV2lkdGggIDwgdmlld3BvcnREaW0ubGVmdCAgID8gJ3JpZ2h0JyAgOlxuICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnRcblxuICAgICAgICAkdGlwXG4gICAgICAgICAgLnJlbW92ZUNsYXNzKG9yZ1BsYWNlbWVudClcbiAgICAgICAgICAuYWRkQ2xhc3MocGxhY2VtZW50KVxuICAgICAgfVxuXG4gICAgICB2YXIgY2FsY3VsYXRlZE9mZnNldCA9IHRoaXMuZ2V0Q2FsY3VsYXRlZE9mZnNldChwbGFjZW1lbnQsIHBvcywgYWN0dWFsV2lkdGgsIGFjdHVhbEhlaWdodClcblxuICAgICAgdGhpcy5hcHBseVBsYWNlbWVudChjYWxjdWxhdGVkT2Zmc2V0LCBwbGFjZW1lbnQpXG5cbiAgICAgIHZhciBjb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHByZXZIb3ZlclN0YXRlID0gdGhhdC5ob3ZlclN0YXRlXG4gICAgICAgIHRoYXQuJGVsZW1lbnQudHJpZ2dlcignc2hvd24uYnMuJyArIHRoYXQudHlwZSlcbiAgICAgICAgdGhhdC5ob3ZlclN0YXRlID0gbnVsbFxuXG4gICAgICAgIGlmIChwcmV2SG92ZXJTdGF0ZSA9PSAnb3V0JykgdGhhdC5sZWF2ZSh0aGF0KVxuICAgICAgfVxuXG4gICAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiB0aGlzLiR0aXAuaGFzQ2xhc3MoJ2ZhZGUnKSA/XG4gICAgICAgICR0aXBcbiAgICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCBjb21wbGV0ZSlcbiAgICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoVG9vbHRpcC5UUkFOU0lUSU9OX0RVUkFUSU9OKSA6XG4gICAgICAgIGNvbXBsZXRlKClcbiAgICB9XG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5hcHBseVBsYWNlbWVudCA9IGZ1bmN0aW9uIChvZmZzZXQsIHBsYWNlbWVudCkge1xuICAgIHZhciAkdGlwICAgPSB0aGlzLnRpcCgpXG4gICAgdmFyIHdpZHRoICA9ICR0aXBbMF0ub2Zmc2V0V2lkdGhcbiAgICB2YXIgaGVpZ2h0ID0gJHRpcFswXS5vZmZzZXRIZWlnaHRcblxuICAgIC8vIG1hbnVhbGx5IHJlYWQgbWFyZ2lucyBiZWNhdXNlIGdldEJvdW5kaW5nQ2xpZW50UmVjdCBpbmNsdWRlcyBkaWZmZXJlbmNlXG4gICAgdmFyIG1hcmdpblRvcCA9IHBhcnNlSW50KCR0aXAuY3NzKCdtYXJnaW4tdG9wJyksIDEwKVxuICAgIHZhciBtYXJnaW5MZWZ0ID0gcGFyc2VJbnQoJHRpcC5jc3MoJ21hcmdpbi1sZWZ0JyksIDEwKVxuXG4gICAgLy8gd2UgbXVzdCBjaGVjayBmb3IgTmFOIGZvciBpZSA4LzlcbiAgICBpZiAoaXNOYU4obWFyZ2luVG9wKSkgIG1hcmdpblRvcCAgPSAwXG4gICAgaWYgKGlzTmFOKG1hcmdpbkxlZnQpKSBtYXJnaW5MZWZ0ID0gMFxuXG4gICAgb2Zmc2V0LnRvcCAgKz0gbWFyZ2luVG9wXG4gICAgb2Zmc2V0LmxlZnQgKz0gbWFyZ2luTGVmdFxuXG4gICAgLy8gJC5mbi5vZmZzZXQgZG9lc24ndCByb3VuZCBwaXhlbCB2YWx1ZXNcbiAgICAvLyBzbyB3ZSB1c2Ugc2V0T2Zmc2V0IGRpcmVjdGx5IHdpdGggb3VyIG93biBmdW5jdGlvbiBCLTBcbiAgICAkLm9mZnNldC5zZXRPZmZzZXQoJHRpcFswXSwgJC5leHRlbmQoe1xuICAgICAgdXNpbmc6IGZ1bmN0aW9uIChwcm9wcykge1xuICAgICAgICAkdGlwLmNzcyh7XG4gICAgICAgICAgdG9wOiBNYXRoLnJvdW5kKHByb3BzLnRvcCksXG4gICAgICAgICAgbGVmdDogTWF0aC5yb3VuZChwcm9wcy5sZWZ0KVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0sIG9mZnNldCksIDApXG5cbiAgICAkdGlwLmFkZENsYXNzKCdpbicpXG5cbiAgICAvLyBjaGVjayB0byBzZWUgaWYgcGxhY2luZyB0aXAgaW4gbmV3IG9mZnNldCBjYXVzZWQgdGhlIHRpcCB0byByZXNpemUgaXRzZWxmXG4gICAgdmFyIGFjdHVhbFdpZHRoICA9ICR0aXBbMF0ub2Zmc2V0V2lkdGhcbiAgICB2YXIgYWN0dWFsSGVpZ2h0ID0gJHRpcFswXS5vZmZzZXRIZWlnaHRcblxuICAgIGlmIChwbGFjZW1lbnQgPT0gJ3RvcCcgJiYgYWN0dWFsSGVpZ2h0ICE9IGhlaWdodCkge1xuICAgICAgb2Zmc2V0LnRvcCA9IG9mZnNldC50b3AgKyBoZWlnaHQgLSBhY3R1YWxIZWlnaHRcbiAgICB9XG5cbiAgICB2YXIgZGVsdGEgPSB0aGlzLmdldFZpZXdwb3J0QWRqdXN0ZWREZWx0YShwbGFjZW1lbnQsIG9mZnNldCwgYWN0dWFsV2lkdGgsIGFjdHVhbEhlaWdodClcblxuICAgIGlmIChkZWx0YS5sZWZ0KSBvZmZzZXQubGVmdCArPSBkZWx0YS5sZWZ0XG4gICAgZWxzZSBvZmZzZXQudG9wICs9IGRlbHRhLnRvcFxuXG4gICAgdmFyIGlzVmVydGljYWwgICAgICAgICAgPSAvdG9wfGJvdHRvbS8udGVzdChwbGFjZW1lbnQpXG4gICAgdmFyIGFycm93RGVsdGEgICAgICAgICAgPSBpc1ZlcnRpY2FsID8gZGVsdGEubGVmdCAqIDIgLSB3aWR0aCArIGFjdHVhbFdpZHRoIDogZGVsdGEudG9wICogMiAtIGhlaWdodCArIGFjdHVhbEhlaWdodFxuICAgIHZhciBhcnJvd09mZnNldFBvc2l0aW9uID0gaXNWZXJ0aWNhbCA/ICdvZmZzZXRXaWR0aCcgOiAnb2Zmc2V0SGVpZ2h0J1xuXG4gICAgJHRpcC5vZmZzZXQob2Zmc2V0KVxuICAgIHRoaXMucmVwbGFjZUFycm93KGFycm93RGVsdGEsICR0aXBbMF1bYXJyb3dPZmZzZXRQb3NpdGlvbl0sIGlzVmVydGljYWwpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5yZXBsYWNlQXJyb3cgPSBmdW5jdGlvbiAoZGVsdGEsIGRpbWVuc2lvbiwgaXNWZXJ0aWNhbCkge1xuICAgIHRoaXMuYXJyb3coKVxuICAgICAgLmNzcyhpc1ZlcnRpY2FsID8gJ2xlZnQnIDogJ3RvcCcsIDUwICogKDEgLSBkZWx0YSAvIGRpbWVuc2lvbikgKyAnJScpXG4gICAgICAuY3NzKGlzVmVydGljYWwgPyAndG9wJyA6ICdsZWZ0JywgJycpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5zZXRDb250ZW50ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciAkdGlwICA9IHRoaXMudGlwKClcbiAgICB2YXIgdGl0bGUgPSB0aGlzLmdldFRpdGxlKClcblxuICAgICR0aXAuZmluZCgnLnRvb2x0aXAtaW5uZXInKVt0aGlzLm9wdGlvbnMuaHRtbCA/ICdodG1sJyA6ICd0ZXh0J10odGl0bGUpXG4gICAgJHRpcC5yZW1vdmVDbGFzcygnZmFkZSBpbiB0b3AgYm90dG9tIGxlZnQgcmlnaHQnKVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuaGlkZSA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIHZhciB0aGF0ID0gdGhpc1xuICAgIHZhciAkdGlwID0gJCh0aGlzLiR0aXApXG4gICAgdmFyIGUgICAgPSAkLkV2ZW50KCdoaWRlLmJzLicgKyB0aGlzLnR5cGUpXG5cbiAgICBmdW5jdGlvbiBjb21wbGV0ZSgpIHtcbiAgICAgIGlmICh0aGF0LmhvdmVyU3RhdGUgIT0gJ2luJykgJHRpcC5kZXRhY2goKVxuICAgICAgaWYgKHRoYXQuJGVsZW1lbnQpIHsgLy8gVE9ETzogQ2hlY2sgd2hldGhlciBndWFyZGluZyB0aGlzIGNvZGUgd2l0aCB0aGlzIGBpZmAgaXMgcmVhbGx5IG5lY2Vzc2FyeS5cbiAgICAgICAgdGhhdC4kZWxlbWVudFxuICAgICAgICAgIC5yZW1vdmVBdHRyKCdhcmlhLWRlc2NyaWJlZGJ5JylcbiAgICAgICAgICAudHJpZ2dlcignaGlkZGVuLmJzLicgKyB0aGF0LnR5cGUpXG4gICAgICB9XG4gICAgICBjYWxsYmFjayAmJiBjYWxsYmFjaygpXG4gICAgfVxuXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKGUpXG5cbiAgICBpZiAoZS5pc0RlZmF1bHRQcmV2ZW50ZWQoKSkgcmV0dXJuXG5cbiAgICAkdGlwLnJlbW92ZUNsYXNzKCdpbicpXG5cbiAgICAkLnN1cHBvcnQudHJhbnNpdGlvbiAmJiAkdGlwLmhhc0NsYXNzKCdmYWRlJykgP1xuICAgICAgJHRpcFxuICAgICAgICAub25lKCdic1RyYW5zaXRpb25FbmQnLCBjb21wbGV0ZSlcbiAgICAgICAgLmVtdWxhdGVUcmFuc2l0aW9uRW5kKFRvb2x0aXAuVFJBTlNJVElPTl9EVVJBVElPTikgOlxuICAgICAgY29tcGxldGUoKVxuXG4gICAgdGhpcy5ob3ZlclN0YXRlID0gbnVsbFxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmZpeFRpdGxlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciAkZSA9IHRoaXMuJGVsZW1lbnRcbiAgICBpZiAoJGUuYXR0cigndGl0bGUnKSB8fCB0eXBlb2YgJGUuYXR0cignZGF0YS1vcmlnaW5hbC10aXRsZScpICE9ICdzdHJpbmcnKSB7XG4gICAgICAkZS5hdHRyKCdkYXRhLW9yaWdpbmFsLXRpdGxlJywgJGUuYXR0cigndGl0bGUnKSB8fCAnJykuYXR0cigndGl0bGUnLCAnJylcbiAgICB9XG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5oYXNDb250ZW50ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLmdldFRpdGxlKClcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldFBvc2l0aW9uID0gZnVuY3Rpb24gKCRlbGVtZW50KSB7XG4gICAgJGVsZW1lbnQgICA9ICRlbGVtZW50IHx8IHRoaXMuJGVsZW1lbnRcblxuICAgIHZhciBlbCAgICAgPSAkZWxlbWVudFswXVxuICAgIHZhciBpc0JvZHkgPSBlbC50YWdOYW1lID09ICdCT0RZJ1xuXG4gICAgdmFyIGVsUmVjdCAgICA9IGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgaWYgKGVsUmVjdC53aWR0aCA9PSBudWxsKSB7XG4gICAgICAvLyB3aWR0aCBhbmQgaGVpZ2h0IGFyZSBtaXNzaW5nIGluIElFOCwgc28gY29tcHV0ZSB0aGVtIG1hbnVhbGx5OyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2lzc3Vlcy8xNDA5M1xuICAgICAgZWxSZWN0ID0gJC5leHRlbmQoe30sIGVsUmVjdCwgeyB3aWR0aDogZWxSZWN0LnJpZ2h0IC0gZWxSZWN0LmxlZnQsIGhlaWdodDogZWxSZWN0LmJvdHRvbSAtIGVsUmVjdC50b3AgfSlcbiAgICB9XG4gICAgdmFyIGlzU3ZnID0gd2luZG93LlNWR0VsZW1lbnQgJiYgZWwgaW5zdGFuY2VvZiB3aW5kb3cuU1ZHRWxlbWVudFxuICAgIC8vIEF2b2lkIHVzaW5nICQub2Zmc2V0KCkgb24gU1ZHcyBzaW5jZSBpdCBnaXZlcyBpbmNvcnJlY3QgcmVzdWx0cyBpbiBqUXVlcnkgMy5cbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3R3YnMvYm9vdHN0cmFwL2lzc3Vlcy8yMDI4MFxuICAgIHZhciBlbE9mZnNldCAgPSBpc0JvZHkgPyB7IHRvcDogMCwgbGVmdDogMCB9IDogKGlzU3ZnID8gbnVsbCA6ICRlbGVtZW50Lm9mZnNldCgpKVxuICAgIHZhciBzY3JvbGwgICAgPSB7IHNjcm9sbDogaXNCb2R5ID8gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCA6ICRlbGVtZW50LnNjcm9sbFRvcCgpIH1cbiAgICB2YXIgb3V0ZXJEaW1zID0gaXNCb2R5ID8geyB3aWR0aDogJCh3aW5kb3cpLndpZHRoKCksIGhlaWdodDogJCh3aW5kb3cpLmhlaWdodCgpIH0gOiBudWxsXG5cbiAgICByZXR1cm4gJC5leHRlbmQoe30sIGVsUmVjdCwgc2Nyb2xsLCBvdXRlckRpbXMsIGVsT2Zmc2V0KVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0Q2FsY3VsYXRlZE9mZnNldCA9IGZ1bmN0aW9uIChwbGFjZW1lbnQsIHBvcywgYWN0dWFsV2lkdGgsIGFjdHVhbEhlaWdodCkge1xuICAgIHJldHVybiBwbGFjZW1lbnQgPT0gJ2JvdHRvbScgPyB7IHRvcDogcG9zLnRvcCArIHBvcy5oZWlnaHQsICAgbGVmdDogcG9zLmxlZnQgKyBwb3Mud2lkdGggLyAyIC0gYWN0dWFsV2lkdGggLyAyIH0gOlxuICAgICAgICAgICBwbGFjZW1lbnQgPT0gJ3RvcCcgICAgPyB7IHRvcDogcG9zLnRvcCAtIGFjdHVhbEhlaWdodCwgbGVmdDogcG9zLmxlZnQgKyBwb3Mud2lkdGggLyAyIC0gYWN0dWFsV2lkdGggLyAyIH0gOlxuICAgICAgICAgICBwbGFjZW1lbnQgPT0gJ2xlZnQnICAgPyB7IHRvcDogcG9zLnRvcCArIHBvcy5oZWlnaHQgLyAyIC0gYWN0dWFsSGVpZ2h0IC8gMiwgbGVmdDogcG9zLmxlZnQgLSBhY3R1YWxXaWR0aCB9IDpcbiAgICAgICAgLyogcGxhY2VtZW50ID09ICdyaWdodCcgKi8geyB0b3A6IHBvcy50b3AgKyBwb3MuaGVpZ2h0IC8gMiAtIGFjdHVhbEhlaWdodCAvIDIsIGxlZnQ6IHBvcy5sZWZ0ICsgcG9zLndpZHRoIH1cblxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0Vmlld3BvcnRBZGp1c3RlZERlbHRhID0gZnVuY3Rpb24gKHBsYWNlbWVudCwgcG9zLCBhY3R1YWxXaWR0aCwgYWN0dWFsSGVpZ2h0KSB7XG4gICAgdmFyIGRlbHRhID0geyB0b3A6IDAsIGxlZnQ6IDAgfVxuICAgIGlmICghdGhpcy4kdmlld3BvcnQpIHJldHVybiBkZWx0YVxuXG4gICAgdmFyIHZpZXdwb3J0UGFkZGluZyA9IHRoaXMub3B0aW9ucy52aWV3cG9ydCAmJiB0aGlzLm9wdGlvbnMudmlld3BvcnQucGFkZGluZyB8fCAwXG4gICAgdmFyIHZpZXdwb3J0RGltZW5zaW9ucyA9IHRoaXMuZ2V0UG9zaXRpb24odGhpcy4kdmlld3BvcnQpXG5cbiAgICBpZiAoL3JpZ2h0fGxlZnQvLnRlc3QocGxhY2VtZW50KSkge1xuICAgICAgdmFyIHRvcEVkZ2VPZmZzZXQgICAgPSBwb3MudG9wIC0gdmlld3BvcnRQYWRkaW5nIC0gdmlld3BvcnREaW1lbnNpb25zLnNjcm9sbFxuICAgICAgdmFyIGJvdHRvbUVkZ2VPZmZzZXQgPSBwb3MudG9wICsgdmlld3BvcnRQYWRkaW5nIC0gdmlld3BvcnREaW1lbnNpb25zLnNjcm9sbCArIGFjdHVhbEhlaWdodFxuICAgICAgaWYgKHRvcEVkZ2VPZmZzZXQgPCB2aWV3cG9ydERpbWVuc2lvbnMudG9wKSB7IC8vIHRvcCBvdmVyZmxvd1xuICAgICAgICBkZWx0YS50b3AgPSB2aWV3cG9ydERpbWVuc2lvbnMudG9wIC0gdG9wRWRnZU9mZnNldFxuICAgICAgfSBlbHNlIGlmIChib3R0b21FZGdlT2Zmc2V0ID4gdmlld3BvcnREaW1lbnNpb25zLnRvcCArIHZpZXdwb3J0RGltZW5zaW9ucy5oZWlnaHQpIHsgLy8gYm90dG9tIG92ZXJmbG93XG4gICAgICAgIGRlbHRhLnRvcCA9IHZpZXdwb3J0RGltZW5zaW9ucy50b3AgKyB2aWV3cG9ydERpbWVuc2lvbnMuaGVpZ2h0IC0gYm90dG9tRWRnZU9mZnNldFxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgbGVmdEVkZ2VPZmZzZXQgID0gcG9zLmxlZnQgLSB2aWV3cG9ydFBhZGRpbmdcbiAgICAgIHZhciByaWdodEVkZ2VPZmZzZXQgPSBwb3MubGVmdCArIHZpZXdwb3J0UGFkZGluZyArIGFjdHVhbFdpZHRoXG4gICAgICBpZiAobGVmdEVkZ2VPZmZzZXQgPCB2aWV3cG9ydERpbWVuc2lvbnMubGVmdCkgeyAvLyBsZWZ0IG92ZXJmbG93XG4gICAgICAgIGRlbHRhLmxlZnQgPSB2aWV3cG9ydERpbWVuc2lvbnMubGVmdCAtIGxlZnRFZGdlT2Zmc2V0XG4gICAgICB9IGVsc2UgaWYgKHJpZ2h0RWRnZU9mZnNldCA+IHZpZXdwb3J0RGltZW5zaW9ucy5yaWdodCkgeyAvLyByaWdodCBvdmVyZmxvd1xuICAgICAgICBkZWx0YS5sZWZ0ID0gdmlld3BvcnREaW1lbnNpb25zLmxlZnQgKyB2aWV3cG9ydERpbWVuc2lvbnMud2lkdGggLSByaWdodEVkZ2VPZmZzZXRcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZGVsdGFcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldFRpdGxlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aXRsZVxuICAgIHZhciAkZSA9IHRoaXMuJGVsZW1lbnRcbiAgICB2YXIgbyAgPSB0aGlzLm9wdGlvbnNcblxuICAgIHRpdGxlID0gJGUuYXR0cignZGF0YS1vcmlnaW5hbC10aXRsZScpXG4gICAgICB8fCAodHlwZW9mIG8udGl0bGUgPT0gJ2Z1bmN0aW9uJyA/IG8udGl0bGUuY2FsbCgkZVswXSkgOiAgby50aXRsZSlcblxuICAgIHJldHVybiB0aXRsZVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0VUlEID0gZnVuY3Rpb24gKHByZWZpeCkge1xuICAgIGRvIHByZWZpeCArPSB+fihNYXRoLnJhbmRvbSgpICogMTAwMDAwMClcbiAgICB3aGlsZSAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocHJlZml4KSlcbiAgICByZXR1cm4gcHJlZml4XG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS50aXAgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLiR0aXApIHtcbiAgICAgIHRoaXMuJHRpcCA9ICQodGhpcy5vcHRpb25zLnRlbXBsYXRlKVxuICAgICAgaWYgKHRoaXMuJHRpcC5sZW5ndGggIT0gMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IodGhpcy50eXBlICsgJyBgdGVtcGxhdGVgIG9wdGlvbiBtdXN0IGNvbnNpc3Qgb2YgZXhhY3RseSAxIHRvcC1sZXZlbCBlbGVtZW50IScpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLiR0aXBcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmFycm93ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAodGhpcy4kYXJyb3cgPSB0aGlzLiRhcnJvdyB8fCB0aGlzLnRpcCgpLmZpbmQoJy50b29sdGlwLWFycm93JykpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5lbmFibGVkID0gdHJ1ZVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVuYWJsZWQgPSBmYWxzZVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUudG9nZ2xlRW5hYmxlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVuYWJsZWQgPSAhdGhpcy5lbmFibGVkXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBzZWxmID0gdGhpc1xuICAgIGlmIChlKSB7XG4gICAgICBzZWxmID0gJChlLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUpXG4gICAgICBpZiAoIXNlbGYpIHtcbiAgICAgICAgc2VsZiA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKGUuY3VycmVudFRhcmdldCwgdGhpcy5nZXREZWxlZ2F0ZU9wdGlvbnMoKSlcbiAgICAgICAgJChlLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUsIHNlbGYpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGUpIHtcbiAgICAgIHNlbGYuaW5TdGF0ZS5jbGljayA9ICFzZWxmLmluU3RhdGUuY2xpY2tcbiAgICAgIGlmIChzZWxmLmlzSW5TdGF0ZVRydWUoKSkgc2VsZi5lbnRlcihzZWxmKVxuICAgICAgZWxzZSBzZWxmLmxlYXZlKHNlbGYpXG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGYudGlwKCkuaGFzQ2xhc3MoJ2luJykgPyBzZWxmLmxlYXZlKHNlbGYpIDogc2VsZi5lbnRlcihzZWxmKVxuICAgIH1cbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dClcbiAgICB0aGlzLmhpZGUoZnVuY3Rpb24gKCkge1xuICAgICAgdGhhdC4kZWxlbWVudC5vZmYoJy4nICsgdGhhdC50eXBlKS5yZW1vdmVEYXRhKCdicy4nICsgdGhhdC50eXBlKVxuICAgICAgaWYgKHRoYXQuJHRpcCkge1xuICAgICAgICB0aGF0LiR0aXAuZGV0YWNoKClcbiAgICAgIH1cbiAgICAgIHRoYXQuJHRpcCA9IG51bGxcbiAgICAgIHRoYXQuJGFycm93ID0gbnVsbFxuICAgICAgdGhhdC4kdmlld3BvcnQgPSBudWxsXG4gICAgICB0aGF0LiRlbGVtZW50ID0gbnVsbFxuICAgIH0pXG4gIH1cblxuXG4gIC8vIFRPT0xUSVAgUExVR0lOIERFRklOSVRJT05cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIGZ1bmN0aW9uIFBsdWdpbihvcHRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyAgID0gJCh0aGlzKVxuICAgICAgdmFyIGRhdGEgICAgPSAkdGhpcy5kYXRhKCdicy50b29sdGlwJylcbiAgICAgIHZhciBvcHRpb25zID0gdHlwZW9mIG9wdGlvbiA9PSAnb2JqZWN0JyAmJiBvcHRpb25cblxuICAgICAgaWYgKCFkYXRhICYmIC9kZXN0cm95fGhpZGUvLnRlc3Qob3B0aW9uKSkgcmV0dXJuXG4gICAgICBpZiAoIWRhdGEpICR0aGlzLmRhdGEoJ2JzLnRvb2x0aXAnLCAoZGF0YSA9IG5ldyBUb29sdGlwKHRoaXMsIG9wdGlvbnMpKSlcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnKSBkYXRhW29wdGlvbl0oKVxuICAgIH0pXG4gIH1cblxuICB2YXIgb2xkID0gJC5mbi50b29sdGlwXG5cbiAgJC5mbi50b29sdGlwICAgICAgICAgICAgID0gUGx1Z2luXG4gICQuZm4udG9vbHRpcC5Db25zdHJ1Y3RvciA9IFRvb2x0aXBcblxuXG4gIC8vIFRPT0xUSVAgTk8gQ09ORkxJQ1RcbiAgLy8gPT09PT09PT09PT09PT09PT09PVxuXG4gICQuZm4udG9vbHRpcC5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICQuZm4udG9vbHRpcCA9IG9sZFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxufShqUXVlcnkpO1xuIiwiLy8gfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyB8IEZsZXh5IGhlYWRlclxuLy8gfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyB8XG4vLyB8IFRoaXMgalF1ZXJ5IHNjcmlwdCBpcyB3cml0dGVuIGJ5XG4vLyB8XG4vLyB8IE1vcnRlbiBOaXNzZW5cbi8vIHwgaGplbW1lc2lkZWtvbmdlbi5ka1xuLy8gfFxuXG52YXIgZmxleHlfaGVhZGVyID0gKGZ1bmN0aW9uICgkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIHB1YiA9IHt9LFxuICAgICAgICAkaGVhZGVyX3N0YXRpYyA9ICQoJy5mbGV4eS1oZWFkZXItLXN0YXRpYycpLFxuICAgICAgICAkaGVhZGVyX3N0aWNreSA9ICQoJy5mbGV4eS1oZWFkZXItLXN0aWNreScpLFxuICAgICAgICBvcHRpb25zID0ge1xuICAgICAgICAgICAgdXBkYXRlX2ludGVydmFsOiAxMDAsXG4gICAgICAgICAgICB0b2xlcmFuY2U6IHtcbiAgICAgICAgICAgICAgICB1cHdhcmQ6IDIwLFxuICAgICAgICAgICAgICAgIGRvd253YXJkOiAxMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9mZnNldDogX2dldF9vZmZzZXRfZnJvbV9lbGVtZW50c19ib3R0b20oJGhlYWRlcl9zdGF0aWMpLFxuICAgICAgICAgICAgY2xhc3Nlczoge1xuICAgICAgICAgICAgICAgIHBpbm5lZDogXCJmbGV4eS1oZWFkZXItLXBpbm5lZFwiLFxuICAgICAgICAgICAgICAgIHVucGlubmVkOiBcImZsZXh5LWhlYWRlci0tdW5waW5uZWRcIlxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB3YXNfc2Nyb2xsZWQgPSBmYWxzZSxcbiAgICAgICAgbGFzdF9kaXN0YW5jZV9mcm9tX3RvcCA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBJbnN0YW50aWF0ZVxuICAgICAqL1xuICAgIHB1Yi5pbml0ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgcmVnaXN0ZXJFdmVudEhhbmRsZXJzKCk7XG4gICAgICAgIHJlZ2lzdGVyQm9vdEV2ZW50SGFuZGxlcnMoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgYm9vdCBldmVudCBoYW5kbGVyc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJlZ2lzdGVyQm9vdEV2ZW50SGFuZGxlcnMoKSB7XG4gICAgICAgICRoZWFkZXJfc3RpY2t5LmFkZENsYXNzKG9wdGlvbnMuY2xhc3Nlcy51bnBpbm5lZCk7XG5cbiAgICAgICAgc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIGlmICh3YXNfc2Nyb2xsZWQpIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudF93YXNfc2Nyb2xsZWQoKTtcblxuICAgICAgICAgICAgICAgIHdhc19zY3JvbGxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBvcHRpb25zLnVwZGF0ZV9pbnRlcnZhbCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXIgZXZlbnQgaGFuZGxlcnNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZWdpc3RlckV2ZW50SGFuZGxlcnMoKSB7XG4gICAgICAgICQod2luZG93KS5zY3JvbGwoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHdhc19zY3JvbGxlZCA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBvZmZzZXQgZnJvbSBlbGVtZW50IGJvdHRvbVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIF9nZXRfb2Zmc2V0X2Zyb21fZWxlbWVudHNfYm90dG9tKCRlbGVtZW50KSB7XG4gICAgICAgIHZhciBlbGVtZW50X2hlaWdodCA9ICRlbGVtZW50Lm91dGVySGVpZ2h0KHRydWUpLFxuICAgICAgICAgICAgZWxlbWVudF9vZmZzZXQgPSAkZWxlbWVudC5vZmZzZXQoKS50b3A7XG5cbiAgICAgICAgcmV0dXJuIChlbGVtZW50X2hlaWdodCArIGVsZW1lbnRfb2Zmc2V0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEb2N1bWVudCB3YXMgc2Nyb2xsZWRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBkb2N1bWVudF93YXNfc2Nyb2xsZWQoKSB7XG4gICAgICAgIHZhciBjdXJyZW50X2Rpc3RhbmNlX2Zyb21fdG9wID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpO1xuXG4gICAgICAgIC8vIElmIHBhc3Qgb2Zmc2V0XG4gICAgICAgIGlmIChjdXJyZW50X2Rpc3RhbmNlX2Zyb21fdG9wID49IG9wdGlvbnMub2Zmc2V0KSB7XG5cbiAgICAgICAgICAgIC8vIERvd253YXJkcyBzY3JvbGxcbiAgICAgICAgICAgIGlmIChjdXJyZW50X2Rpc3RhbmNlX2Zyb21fdG9wID4gbGFzdF9kaXN0YW5jZV9mcm9tX3RvcCkge1xuXG4gICAgICAgICAgICAgICAgLy8gT2JleSB0aGUgZG93bndhcmQgdG9sZXJhbmNlXG4gICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKGN1cnJlbnRfZGlzdGFuY2VfZnJvbV90b3AgLSBsYXN0X2Rpc3RhbmNlX2Zyb21fdG9wKSA8PSBvcHRpb25zLnRvbGVyYW5jZS5kb3dud2FyZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgJGhlYWRlcl9zdGlja3kucmVtb3ZlQ2xhc3Mob3B0aW9ucy5jbGFzc2VzLnBpbm5lZCkuYWRkQ2xhc3Mob3B0aW9ucy5jbGFzc2VzLnVucGlubmVkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVXB3YXJkcyBzY3JvbGxcbiAgICAgICAgICAgIGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgLy8gT2JleSB0aGUgdXB3YXJkIHRvbGVyYW5jZVxuICAgICAgICAgICAgICAgIGlmIChNYXRoLmFicyhjdXJyZW50X2Rpc3RhbmNlX2Zyb21fdG9wIC0gbGFzdF9kaXN0YW5jZV9mcm9tX3RvcCkgPD0gb3B0aW9ucy50b2xlcmFuY2UudXB3YXJkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBXZSBhcmUgbm90IHNjcm9sbGVkIHBhc3QgdGhlIGRvY3VtZW50IHdoaWNoIGlzIHBvc3NpYmxlIG9uIHRoZSBNYWNcbiAgICAgICAgICAgICAgICBpZiAoKGN1cnJlbnRfZGlzdGFuY2VfZnJvbV90b3AgKyAkKHdpbmRvdykuaGVpZ2h0KCkpIDwgJChkb2N1bWVudCkuaGVpZ2h0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgJGhlYWRlcl9zdGlja3kucmVtb3ZlQ2xhc3Mob3B0aW9ucy5jbGFzc2VzLnVucGlubmVkKS5hZGRDbGFzcyhvcHRpb25zLmNsYXNzZXMucGlubmVkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3QgcGFzdCBvZmZzZXRcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAkaGVhZGVyX3N0aWNreS5yZW1vdmVDbGFzcyhvcHRpb25zLmNsYXNzZXMucGlubmVkKS5hZGRDbGFzcyhvcHRpb25zLmNsYXNzZXMudW5waW5uZWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGFzdF9kaXN0YW5jZV9mcm9tX3RvcCA9IGN1cnJlbnRfZGlzdGFuY2VfZnJvbV90b3A7XG4gICAgfVxuXG4gICAgcmV0dXJuIHB1Yjtcbn0pKGpRdWVyeSk7XG4iLCIvLyB8LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIHwgRmxleHkgbmF2aWdhdGlvblxuLy8gfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyB8XG4vLyB8IFRoaXMgalF1ZXJ5IHNjcmlwdCBpcyB3cml0dGVuIGJ5XG4vLyB8XG4vLyB8IE1vcnRlbiBOaXNzZW5cbi8vIHwgaGplbW1lc2lkZWtvbmdlbi5ka1xuLy8gfFxuXG52YXIgZmxleHlfbmF2aWdhdGlvbiA9IChmdW5jdGlvbiAoJCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBwdWIgPSB7fSxcbiAgICAgICAgbGF5b3V0X2NsYXNzZXMgPSB7XG4gICAgICAgICAgICAnbmF2aWdhdGlvbic6ICcuZmxleHktbmF2aWdhdGlvbicsXG4gICAgICAgICAgICAnb2JmdXNjYXRvcic6ICcuZmxleHktbmF2aWdhdGlvbl9fb2JmdXNjYXRvcicsXG4gICAgICAgICAgICAnZHJvcGRvd24nOiAnLmZsZXh5LW5hdmlnYXRpb25fX2l0ZW0tLWRyb3Bkb3duJyxcbiAgICAgICAgICAgICdkcm9wZG93bl9tZWdhbWVudSc6ICcuZmxleHktbmF2aWdhdGlvbl9faXRlbV9fZHJvcGRvd24tbWVnYW1lbnUnLFxuXG4gICAgICAgICAgICAnaXNfdXBncmFkZWQnOiAnaXMtdXBncmFkZWQnLFxuICAgICAgICAgICAgJ25hdmlnYXRpb25faGFzX21lZ2FtZW51JzogJ2hhcy1tZWdhbWVudScsXG4gICAgICAgICAgICAnZHJvcGRvd25faGFzX21lZ2FtZW51JzogJ2ZsZXh5LW5hdmlnYXRpb25fX2l0ZW0tLWRyb3Bkb3duLXdpdGgtbWVnYW1lbnUnLFxuICAgICAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSW5zdGFudGlhdGVcbiAgICAgKi9cbiAgICBwdWIuaW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgIHJlZ2lzdGVyRXZlbnRIYW5kbGVycygpO1xuICAgICAgICByZWdpc3RlckJvb3RFdmVudEhhbmRsZXJzKCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGJvb3QgZXZlbnQgaGFuZGxlcnNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZWdpc3RlckJvb3RFdmVudEhhbmRsZXJzKCkge1xuXG4gICAgICAgIC8vIFVwZ3JhZGVcbiAgICAgICAgdXBncmFkZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIGV2ZW50IGhhbmRsZXJzXG4gICAgICovXG4gICAgZnVuY3Rpb24gcmVnaXN0ZXJFdmVudEhhbmRsZXJzKCkge31cblxuICAgIC8qKlxuICAgICAqIFVwZ3JhZGUgZWxlbWVudHMuXG4gICAgICogQWRkIGNsYXNzZXMgdG8gZWxlbWVudHMsIGJhc2VkIHVwb24gYXR0YWNoZWQgY2xhc3Nlcy5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB1cGdyYWRlKCkge1xuICAgICAgICB2YXIgJG5hdmlnYXRpb25zID0gJChsYXlvdXRfY2xhc3Nlcy5uYXZpZ2F0aW9uKTtcblxuICAgICAgICAvLyBOYXZpZ2F0aW9uc1xuICAgICAgICBpZiAoJG5hdmlnYXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICRuYXZpZ2F0aW9ucy5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyICRuYXZpZ2F0aW9uID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgJG1lZ2FtZW51cyA9ICRuYXZpZ2F0aW9uLmZpbmQobGF5b3V0X2NsYXNzZXMuZHJvcGRvd25fbWVnYW1lbnUpLFxuICAgICAgICAgICAgICAgICAgICAkZHJvcGRvd25fbWVnYW1lbnUgPSAkbmF2aWdhdGlvbi5maW5kKGxheW91dF9jbGFzc2VzLmRyb3Bkb3duX2hhc19tZWdhbWVudSk7XG5cbiAgICAgICAgICAgICAgICAvLyBIYXMgYWxyZWFkeSBiZWVuIHVwZ3JhZGVkXG4gICAgICAgICAgICAgICAgaWYgKCRuYXZpZ2F0aW9uLmhhc0NsYXNzKGxheW91dF9jbGFzc2VzLmlzX3VwZ3JhZGVkKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gSGFzIG1lZ2FtZW51XG4gICAgICAgICAgICAgICAgaWYgKCRtZWdhbWVudXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAkbmF2aWdhdGlvbi5hZGRDbGFzcyhsYXlvdXRfY2xhc3Nlcy5uYXZpZ2F0aW9uX2hhc19tZWdhbWVudSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUnVuIHRocm91Z2ggYWxsIG1lZ2FtZW51c1xuICAgICAgICAgICAgICAgICAgICAkbWVnYW1lbnVzLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciAkbWVnYW1lbnUgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc19vYmZ1c2NhdG9yID0gJCgnaHRtbCcpLmhhc0NsYXNzKCdoYXMtb2JmdXNjYXRvcicpID8gdHJ1ZSA6IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkbWVnYW1lbnUucGFyZW50cyhsYXlvdXRfY2xhc3Nlcy5kcm9wZG93bilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2xhc3MobGF5b3V0X2NsYXNzZXMuZHJvcGRvd25faGFzX21lZ2FtZW51KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5ob3ZlcihmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGFzX29iZnVzY2F0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iZnVzY2F0b3Iuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGFzX29iZnVzY2F0b3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iZnVzY2F0b3IuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIElzIHVwZ3JhZGVkXG4gICAgICAgICAgICAgICAgJG5hdmlnYXRpb24uYWRkQ2xhc3MobGF5b3V0X2NsYXNzZXMuaXNfdXBncmFkZWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcHViO1xufSkoalF1ZXJ5KTtcbiIsIi8qISBzaWRyIC0gdjIuMi4xIC0gMjAxNi0wMi0xN1xuICogaHR0cDovL3d3dy5iZXJyaWFydC5jb20vc2lkci9cbiAqIENvcHlyaWdodCAoYykgMjAxMy0yMDE2IEFsYmVydG8gVmFyZWxhOyBMaWNlbnNlZCBNSVQgKi9cblxuKGZ1bmN0aW9uICgpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBiYWJlbEhlbHBlcnMgPSB7fTtcblxuICBiYWJlbEhlbHBlcnMuY2xhc3NDYWxsQ2hlY2sgPSBmdW5jdGlvbiAoaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gICAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gICAgfVxuICB9O1xuXG4gIGJhYmVsSGVscGVycy5jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICAgICAgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlO1xuICAgICAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICAgICAgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgICAgIGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICAgICAgcmV0dXJuIENvbnN0cnVjdG9yO1xuICAgIH07XG4gIH0oKTtcblxuICBiYWJlbEhlbHBlcnM7XG5cbiAgdmFyIHNpZHJTdGF0dXMgPSB7XG4gICAgbW92aW5nOiBmYWxzZSxcbiAgICBvcGVuZWQ6IGZhbHNlXG4gIH07XG5cbiAgdmFyIGhlbHBlciA9IHtcbiAgICAvLyBDaGVjayBmb3IgdmFsaWRzIHVybHNcbiAgICAvLyBGcm9tIDogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81NzE3MDkzL2NoZWNrLWlmLWEtamF2YXNjcmlwdC1zdHJpbmctaXMtYW4tdXJsXG5cbiAgICBpc1VybDogZnVuY3Rpb24gaXNVcmwoc3RyKSB7XG4gICAgICB2YXIgcGF0dGVybiA9IG5ldyBSZWdFeHAoJ14oaHR0cHM/OlxcXFwvXFxcXC8pPycgKyAvLyBwcm90b2NvbFxuICAgICAgJygoKFthLXpcXFxcZF0oW2EtelxcXFxkLV0qW2EtelxcXFxkXSkqKVxcXFwuPykrW2Etel17Mix9fCcgKyAvLyBkb21haW4gbmFtZVxuICAgICAgJygoXFxcXGR7MSwzfVxcXFwuKXszfVxcXFxkezEsM30pKScgKyAvLyBPUiBpcCAodjQpIGFkZHJlc3NcbiAgICAgICcoXFxcXDpcXFxcZCspPyhcXFxcL1stYS16XFxcXGQlXy5+K10qKSonICsgLy8gcG9ydCBhbmQgcGF0aFxuICAgICAgJyhcXFxcP1s7JmEtelxcXFxkJV8ufis9LV0qKT8nICsgLy8gcXVlcnkgc3RyaW5nXG4gICAgICAnKFxcXFwjWy1hLXpcXFxcZF9dKik/JCcsICdpJyk7IC8vIGZyYWdtZW50IGxvY2F0b3JcblxuICAgICAgaWYgKHBhdHRlcm4udGVzdChzdHIpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0sXG5cblxuICAgIC8vIEFkZCBzaWRyIHByZWZpeGVzXG4gICAgYWRkUHJlZml4ZXM6IGZ1bmN0aW9uIGFkZFByZWZpeGVzKCRlbGVtZW50KSB7XG4gICAgICB0aGlzLmFkZFByZWZpeCgkZWxlbWVudCwgJ2lkJyk7XG4gICAgICB0aGlzLmFkZFByZWZpeCgkZWxlbWVudCwgJ2NsYXNzJyk7XG4gICAgICAkZWxlbWVudC5yZW1vdmVBdHRyKCdzdHlsZScpO1xuICAgIH0sXG4gICAgYWRkUHJlZml4OiBmdW5jdGlvbiBhZGRQcmVmaXgoJGVsZW1lbnQsIGF0dHJpYnV0ZSkge1xuICAgICAgdmFyIHRvUmVwbGFjZSA9ICRlbGVtZW50LmF0dHIoYXR0cmlidXRlKTtcblxuICAgICAgaWYgKHR5cGVvZiB0b1JlcGxhY2UgPT09ICdzdHJpbmcnICYmIHRvUmVwbGFjZSAhPT0gJycgJiYgdG9SZXBsYWNlICE9PSAnc2lkci1pbm5lcicpIHtcbiAgICAgICAgJGVsZW1lbnQuYXR0cihhdHRyaWJ1dGUsIHRvUmVwbGFjZS5yZXBsYWNlKC8oW0EtWmEtejAtOV8uXFwtXSspL2csICdzaWRyLScgKyBhdHRyaWJ1dGUgKyAnLSQxJykpO1xuICAgICAgfVxuICAgIH0sXG5cblxuICAgIC8vIENoZWNrIGlmIHRyYW5zaXRpb25zIGlzIHN1cHBvcnRlZFxuICAgIHRyYW5zaXRpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgYm9keSA9IGRvY3VtZW50LmJvZHkgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxuICAgICAgICAgIHN0eWxlID0gYm9keS5zdHlsZSxcbiAgICAgICAgICBzdXBwb3J0ZWQgPSBmYWxzZSxcbiAgICAgICAgICBwcm9wZXJ0eSA9ICd0cmFuc2l0aW9uJztcblxuICAgICAgaWYgKHByb3BlcnR5IGluIHN0eWxlKSB7XG4gICAgICAgIHN1cHBvcnRlZCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHZhciBwcmVmaXhlcyA9IFsnbW96JywgJ3dlYmtpdCcsICdvJywgJ21zJ10sXG4gICAgICAgICAgICAgIHByZWZpeCA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgaSA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgIHByb3BlcnR5ID0gcHJvcGVydHkuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwcm9wZXJ0eS5zdWJzdHIoMSk7XG4gICAgICAgICAgc3VwcG9ydGVkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHByZWZpeGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIHByZWZpeCA9IHByZWZpeGVzW2ldO1xuICAgICAgICAgICAgICBpZiAocHJlZml4ICsgcHJvcGVydHkgaW4gc3R5bGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfSgpO1xuICAgICAgICAgIHByb3BlcnR5ID0gc3VwcG9ydGVkID8gJy0nICsgcHJlZml4LnRvTG93ZXJDYXNlKCkgKyAnLScgKyBwcm9wZXJ0eS50b0xvd2VyQ2FzZSgpIDogbnVsbDtcbiAgICAgICAgfSkoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3VwcG9ydGVkOiBzdXBwb3J0ZWQsXG4gICAgICAgIHByb3BlcnR5OiBwcm9wZXJ0eVxuICAgICAgfTtcbiAgICB9KClcbiAgfTtcblxuICB2YXIgJCQyID0galF1ZXJ5O1xuXG4gIHZhciBib2R5QW5pbWF0aW9uQ2xhc3MgPSAnc2lkci1hbmltYXRpbmcnO1xuICB2YXIgb3BlbkFjdGlvbiA9ICdvcGVuJztcbiAgdmFyIGNsb3NlQWN0aW9uID0gJ2Nsb3NlJztcbiAgdmFyIHRyYW5zaXRpb25FbmRFdmVudCA9ICd3ZWJraXRUcmFuc2l0aW9uRW5kIG90cmFuc2l0aW9uZW5kIG9UcmFuc2l0aW9uRW5kIG1zVHJhbnNpdGlvbkVuZCB0cmFuc2l0aW9uZW5kJztcbiAgdmFyIE1lbnUgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTWVudShuYW1lKSB7XG4gICAgICBiYWJlbEhlbHBlcnMuY2xhc3NDYWxsQ2hlY2sodGhpcywgTWVudSk7XG5cbiAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICB0aGlzLml0ZW0gPSAkJDIoJyMnICsgbmFtZSk7XG4gICAgICB0aGlzLm9wZW5DbGFzcyA9IG5hbWUgPT09ICdzaWRyJyA/ICdzaWRyLW9wZW4nIDogJ3NpZHItb3BlbiAnICsgbmFtZSArICctb3Blbic7XG4gICAgICB0aGlzLm1lbnVXaWR0aCA9IHRoaXMuaXRlbS5vdXRlcldpZHRoKHRydWUpO1xuICAgICAgdGhpcy5zcGVlZCA9IHRoaXMuaXRlbS5kYXRhKCdzcGVlZCcpO1xuICAgICAgdGhpcy5zaWRlID0gdGhpcy5pdGVtLmRhdGEoJ3NpZGUnKTtcbiAgICAgIHRoaXMuZGlzcGxhY2UgPSB0aGlzLml0ZW0uZGF0YSgnZGlzcGxhY2UnKTtcbiAgICAgIHRoaXMudGltaW5nID0gdGhpcy5pdGVtLmRhdGEoJ3RpbWluZycpO1xuICAgICAgdGhpcy5tZXRob2QgPSB0aGlzLml0ZW0uZGF0YSgnbWV0aG9kJyk7XG4gICAgICB0aGlzLm9uT3BlbkNhbGxiYWNrID0gdGhpcy5pdGVtLmRhdGEoJ29uT3BlbicpO1xuICAgICAgdGhpcy5vbkNsb3NlQ2FsbGJhY2sgPSB0aGlzLml0ZW0uZGF0YSgnb25DbG9zZScpO1xuICAgICAgdGhpcy5vbk9wZW5FbmRDYWxsYmFjayA9IHRoaXMuaXRlbS5kYXRhKCdvbk9wZW5FbmQnKTtcbiAgICAgIHRoaXMub25DbG9zZUVuZENhbGxiYWNrID0gdGhpcy5pdGVtLmRhdGEoJ29uQ2xvc2VFbmQnKTtcbiAgICAgIHRoaXMuYm9keSA9ICQkMih0aGlzLml0ZW0uZGF0YSgnYm9keScpKTtcbiAgICB9XG5cbiAgICBiYWJlbEhlbHBlcnMuY3JlYXRlQ2xhc3MoTWVudSwgW3tcbiAgICAgIGtleTogJ2dldEFuaW1hdGlvbicsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0QW5pbWF0aW9uKGFjdGlvbiwgZWxlbWVudCkge1xuICAgICAgICB2YXIgYW5pbWF0aW9uID0ge30sXG4gICAgICAgICAgICBwcm9wID0gdGhpcy5zaWRlO1xuXG4gICAgICAgIGlmIChhY3Rpb24gPT09ICdvcGVuJyAmJiBlbGVtZW50ID09PSAnYm9keScpIHtcbiAgICAgICAgICBhbmltYXRpb25bcHJvcF0gPSB0aGlzLm1lbnVXaWR0aCArICdweCc7XG4gICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSAnY2xvc2UnICYmIGVsZW1lbnQgPT09ICdtZW51Jykge1xuICAgICAgICAgIGFuaW1hdGlvbltwcm9wXSA9ICctJyArIHRoaXMubWVudVdpZHRoICsgJ3B4JztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhbmltYXRpb25bcHJvcF0gPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFuaW1hdGlvbjtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdwcmVwYXJlQm9keScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcHJlcGFyZUJvZHkoYWN0aW9uKSB7XG4gICAgICAgIHZhciBwcm9wID0gYWN0aW9uID09PSAnb3BlbicgPyAnaGlkZGVuJyA6ICcnO1xuXG4gICAgICAgIC8vIFByZXBhcmUgcGFnZSBpZiBjb250YWluZXIgaXMgYm9keVxuICAgICAgICBpZiAodGhpcy5ib2R5LmlzKCdib2R5JykpIHtcbiAgICAgICAgICB2YXIgJGh0bWwgPSAkJDIoJ2h0bWwnKSxcbiAgICAgICAgICAgICAgc2Nyb2xsVG9wID0gJGh0bWwuc2Nyb2xsVG9wKCk7XG5cbiAgICAgICAgICAkaHRtbC5jc3MoJ292ZXJmbG93LXgnLCBwcm9wKS5zY3JvbGxUb3Aoc2Nyb2xsVG9wKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ29wZW5Cb2R5JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBvcGVuQm9keSgpIHtcbiAgICAgICAgaWYgKHRoaXMuZGlzcGxhY2UpIHtcbiAgICAgICAgICB2YXIgdHJhbnNpdGlvbnMgPSBoZWxwZXIudHJhbnNpdGlvbnMsXG4gICAgICAgICAgICAgICRib2R5ID0gdGhpcy5ib2R5O1xuXG4gICAgICAgICAgaWYgKHRyYW5zaXRpb25zLnN1cHBvcnRlZCkge1xuICAgICAgICAgICAgJGJvZHkuY3NzKHRyYW5zaXRpb25zLnByb3BlcnR5LCB0aGlzLnNpZGUgKyAnICcgKyB0aGlzLnNwZWVkIC8gMTAwMCArICdzICcgKyB0aGlzLnRpbWluZykuY3NzKHRoaXMuc2lkZSwgMCkuY3NzKHtcbiAgICAgICAgICAgICAgd2lkdGg6ICRib2R5LndpZHRoKCksXG4gICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICRib2R5LmNzcyh0aGlzLnNpZGUsIHRoaXMubWVudVdpZHRoICsgJ3B4Jyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBib2R5QW5pbWF0aW9uID0gdGhpcy5nZXRBbmltYXRpb24ob3BlbkFjdGlvbiwgJ2JvZHknKTtcblxuICAgICAgICAgICAgJGJvZHkuY3NzKHtcbiAgICAgICAgICAgICAgd2lkdGg6ICRib2R5LndpZHRoKCksXG4gICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnXG4gICAgICAgICAgICB9KS5hbmltYXRlKGJvZHlBbmltYXRpb24sIHtcbiAgICAgICAgICAgICAgcXVldWU6IGZhbHNlLFxuICAgICAgICAgICAgICBkdXJhdGlvbjogdGhpcy5zcGVlZFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnb25DbG9zZUJvZHknLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9uQ2xvc2VCb2R5KCkge1xuICAgICAgICB2YXIgdHJhbnNpdGlvbnMgPSBoZWxwZXIudHJhbnNpdGlvbnMsXG4gICAgICAgICAgICByZXNldFN0eWxlcyA9IHtcbiAgICAgICAgICB3aWR0aDogJycsXG4gICAgICAgICAgcG9zaXRpb246ICcnLFxuICAgICAgICAgIHJpZ2h0OiAnJyxcbiAgICAgICAgICBsZWZ0OiAnJ1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmICh0cmFuc2l0aW9ucy5zdXBwb3J0ZWQpIHtcbiAgICAgICAgICByZXNldFN0eWxlc1t0cmFuc2l0aW9ucy5wcm9wZXJ0eV0gPSAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYm9keS5jc3MocmVzZXRTdHlsZXMpLnVuYmluZCh0cmFuc2l0aW9uRW5kRXZlbnQpO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2Nsb3NlQm9keScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2xvc2VCb2R5KCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICAgIGlmICh0aGlzLmRpc3BsYWNlKSB7XG4gICAgICAgICAgaWYgKGhlbHBlci50cmFuc2l0aW9ucy5zdXBwb3J0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuYm9keS5jc3ModGhpcy5zaWRlLCAwKS5vbmUodHJhbnNpdGlvbkVuZEV2ZW50LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIF90aGlzLm9uQ2xvc2VCb2R5KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGJvZHlBbmltYXRpb24gPSB0aGlzLmdldEFuaW1hdGlvbihjbG9zZUFjdGlvbiwgJ2JvZHknKTtcblxuICAgICAgICAgICAgdGhpcy5ib2R5LmFuaW1hdGUoYm9keUFuaW1hdGlvbiwge1xuICAgICAgICAgICAgICBxdWV1ZTogZmFsc2UsXG4gICAgICAgICAgICAgIGR1cmF0aW9uOiB0aGlzLnNwZWVkLFxuICAgICAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24gY29tcGxldGUoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMub25DbG9zZUJvZHkoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSwge1xuICAgICAga2V5OiAnbW92ZUJvZHknLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIG1vdmVCb2R5KGFjdGlvbikge1xuICAgICAgICBpZiAoYWN0aW9uID09PSBvcGVuQWN0aW9uKSB7XG4gICAgICAgICAgdGhpcy5vcGVuQm9keSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuY2xvc2VCb2R5KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdvbk9wZW5NZW51JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBvbk9wZW5NZW51KGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBuYW1lID0gdGhpcy5uYW1lO1xuXG4gICAgICAgIHNpZHJTdGF0dXMubW92aW5nID0gZmFsc2U7XG4gICAgICAgIHNpZHJTdGF0dXMub3BlbmVkID0gbmFtZTtcblxuICAgICAgICB0aGlzLml0ZW0udW5iaW5kKHRyYW5zaXRpb25FbmRFdmVudCk7XG5cbiAgICAgICAgdGhpcy5ib2R5LnJlbW92ZUNsYXNzKGJvZHlBbmltYXRpb25DbGFzcykuYWRkQ2xhc3ModGhpcy5vcGVuQ2xhc3MpO1xuXG4gICAgICAgIHRoaXMub25PcGVuRW5kQ2FsbGJhY2soKTtcblxuICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgY2FsbGJhY2sobmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdvcGVuTWVudScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gb3Blbk1lbnUoY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICAgICAgdmFyICRpdGVtID0gdGhpcy5pdGVtO1xuXG4gICAgICAgIGlmIChoZWxwZXIudHJhbnNpdGlvbnMuc3VwcG9ydGVkKSB7XG4gICAgICAgICAgJGl0ZW0uY3NzKHRoaXMuc2lkZSwgMCkub25lKHRyYW5zaXRpb25FbmRFdmVudCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXMyLm9uT3Blbk1lbnUoY2FsbGJhY2spO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBtZW51QW5pbWF0aW9uID0gdGhpcy5nZXRBbmltYXRpb24ob3BlbkFjdGlvbiwgJ21lbnUnKTtcblxuICAgICAgICAgICRpdGVtLmNzcygnZGlzcGxheScsICdibG9jaycpLmFuaW1hdGUobWVudUFuaW1hdGlvbiwge1xuICAgICAgICAgICAgcXVldWU6IGZhbHNlLFxuICAgICAgICAgICAgZHVyYXRpb246IHRoaXMuc3BlZWQsXG4gICAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24gY29tcGxldGUoKSB7XG4gICAgICAgICAgICAgIF90aGlzMi5vbk9wZW5NZW51KGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ29uQ2xvc2VNZW51JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBvbkNsb3NlTWVudShjYWxsYmFjaykge1xuICAgICAgICB0aGlzLml0ZW0uY3NzKHtcbiAgICAgICAgICBsZWZ0OiAnJyxcbiAgICAgICAgICByaWdodDogJydcbiAgICAgICAgfSkudW5iaW5kKHRyYW5zaXRpb25FbmRFdmVudCk7XG4gICAgICAgICQkMignaHRtbCcpLmNzcygnb3ZlcmZsb3cteCcsICcnKTtcblxuICAgICAgICBzaWRyU3RhdHVzLm1vdmluZyA9IGZhbHNlO1xuICAgICAgICBzaWRyU3RhdHVzLm9wZW5lZCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuYm9keS5yZW1vdmVDbGFzcyhib2R5QW5pbWF0aW9uQ2xhc3MpLnJlbW92ZUNsYXNzKHRoaXMub3BlbkNsYXNzKTtcblxuICAgICAgICB0aGlzLm9uQ2xvc2VFbmRDYWxsYmFjaygpO1xuXG4gICAgICAgIC8vIENhbGxiYWNrXG4gICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBjYWxsYmFjayhuYW1lKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2Nsb3NlTWVudScsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gY2xvc2VNZW51KGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICAgIHZhciBpdGVtID0gdGhpcy5pdGVtO1xuXG4gICAgICAgIGlmIChoZWxwZXIudHJhbnNpdGlvbnMuc3VwcG9ydGVkKSB7XG4gICAgICAgICAgaXRlbS5jc3ModGhpcy5zaWRlLCAnJykub25lKHRyYW5zaXRpb25FbmRFdmVudCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXMzLm9uQ2xvc2VNZW51KGNhbGxiYWNrKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgbWVudUFuaW1hdGlvbiA9IHRoaXMuZ2V0QW5pbWF0aW9uKGNsb3NlQWN0aW9uLCAnbWVudScpO1xuXG4gICAgICAgICAgaXRlbS5hbmltYXRlKG1lbnVBbmltYXRpb24sIHtcbiAgICAgICAgICAgIHF1ZXVlOiBmYWxzZSxcbiAgICAgICAgICAgIGR1cmF0aW9uOiB0aGlzLnNwZWVkLFxuICAgICAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uIGNvbXBsZXRlKCkge1xuICAgICAgICAgICAgICBfdGhpczMub25DbG9zZU1lbnUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ21vdmVNZW51JyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBtb3ZlTWVudShhY3Rpb24sIGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuYm9keS5hZGRDbGFzcyhib2R5QW5pbWF0aW9uQ2xhc3MpO1xuXG4gICAgICAgIGlmIChhY3Rpb24gPT09IG9wZW5BY3Rpb24pIHtcbiAgICAgICAgICB0aGlzLm9wZW5NZW51KGNhbGxiYWNrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmNsb3NlTWVudShjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdtb3ZlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBtb3ZlKGFjdGlvbiwgY2FsbGJhY2spIHtcbiAgICAgICAgLy8gTG9jayBzaWRyXG4gICAgICAgIHNpZHJTdGF0dXMubW92aW5nID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLnByZXBhcmVCb2R5KGFjdGlvbik7XG4gICAgICAgIHRoaXMubW92ZUJvZHkoYWN0aW9uKTtcbiAgICAgICAgdGhpcy5tb3ZlTWVudShhY3Rpb24sIGNhbGxiYWNrKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICdvcGVuJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBvcGVuKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBfdGhpczQgPSB0aGlzO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIGlzIGFscmVhZHkgb3BlbmVkIG9yIG1vdmluZ1xuICAgICAgICBpZiAoc2lkclN0YXR1cy5vcGVuZWQgPT09IHRoaXMubmFtZSB8fCBzaWRyU3RhdHVzLm1vdmluZykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIGFub3RoZXIgbWVudSBvcGVuZWQgY2xvc2UgZmlyc3RcbiAgICAgICAgaWYgKHNpZHJTdGF0dXMub3BlbmVkICE9PSBmYWxzZSkge1xuICAgICAgICAgIHZhciBhbHJlYWR5T3BlbmVkTWVudSA9IG5ldyBNZW51KHNpZHJTdGF0dXMub3BlbmVkKTtcblxuICAgICAgICAgIGFscmVhZHlPcGVuZWRNZW51LmNsb3NlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF90aGlzNC5vcGVuKGNhbGxiYWNrKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubW92ZSgnb3BlbicsIGNhbGxiYWNrKTtcblxuICAgICAgICAvLyBvbk9wZW4gY2FsbGJhY2tcbiAgICAgICAgdGhpcy5vbk9wZW5DYWxsYmFjaygpO1xuICAgICAgfVxuICAgIH0sIHtcbiAgICAgIGtleTogJ2Nsb3NlJyxcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBjbG9zZShjYWxsYmFjaykge1xuICAgICAgICAvLyBDaGVjayBpZiBpcyBhbHJlYWR5IGNsb3NlZCBvciBtb3ZpbmdcbiAgICAgICAgaWYgKHNpZHJTdGF0dXMub3BlbmVkICE9PSB0aGlzLm5hbWUgfHwgc2lkclN0YXR1cy5tb3ZpbmcpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1vdmUoJ2Nsb3NlJywgY2FsbGJhY2spO1xuXG4gICAgICAgIC8vIG9uQ2xvc2UgY2FsbGJhY2tcbiAgICAgICAgdGhpcy5vbkNsb3NlQ2FsbGJhY2soKTtcbiAgICAgIH1cbiAgICB9LCB7XG4gICAgICBrZXk6ICd0b2dnbGUnLFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHRvZ2dsZShjYWxsYmFjaykge1xuICAgICAgICBpZiAoc2lkclN0YXR1cy5vcGVuZWQgPT09IHRoaXMubmFtZSkge1xuICAgICAgICAgIHRoaXMuY2xvc2UoY2FsbGJhY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMub3BlbihjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XSk7XG4gICAgcmV0dXJuIE1lbnU7XG4gIH0oKTtcblxuICB2YXIgJCQxID0galF1ZXJ5O1xuXG4gIGZ1bmN0aW9uIGV4ZWN1dGUoYWN0aW9uLCBuYW1lLCBjYWxsYmFjaykge1xuICAgIHZhciBzaWRyID0gbmV3IE1lbnUobmFtZSk7XG5cbiAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgY2FzZSAnb3Blbic6XG4gICAgICAgIHNpZHIub3BlbihjYWxsYmFjayk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY2xvc2UnOlxuICAgICAgICBzaWRyLmNsb3NlKGNhbGxiYWNrKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd0b2dnbGUnOlxuICAgICAgICBzaWRyLnRvZ2dsZShjYWxsYmFjayk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgJCQxLmVycm9yKCdNZXRob2QgJyArIGFjdGlvbiArICcgZG9lcyBub3QgZXhpc3Qgb24galF1ZXJ5LnNpZHInKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdmFyIGk7XG4gIHZhciAkID0galF1ZXJ5O1xuICB2YXIgcHVibGljTWV0aG9kcyA9IFsnb3BlbicsICdjbG9zZScsICd0b2dnbGUnXTtcbiAgdmFyIG1ldGhvZE5hbWU7XG4gIHZhciBtZXRob2RzID0ge307XG4gIHZhciBnZXRNZXRob2QgPSBmdW5jdGlvbiBnZXRNZXRob2QobWV0aG9kTmFtZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAobmFtZSwgY2FsbGJhY2spIHtcbiAgICAgIC8vIENoZWNrIGFyZ3VtZW50c1xuICAgICAgaWYgKHR5cGVvZiBuYW1lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNhbGxiYWNrID0gbmFtZTtcbiAgICAgICAgbmFtZSA9ICdzaWRyJztcbiAgICAgIH0gZWxzZSBpZiAoIW5hbWUpIHtcbiAgICAgICAgbmFtZSA9ICdzaWRyJztcbiAgICAgIH1cblxuICAgICAgZXhlY3V0ZShtZXRob2ROYW1lLCBuYW1lLCBjYWxsYmFjayk7XG4gICAgfTtcbiAgfTtcbiAgZm9yIChpID0gMDsgaSA8IHB1YmxpY01ldGhvZHMubGVuZ3RoOyBpKyspIHtcbiAgICBtZXRob2ROYW1lID0gcHVibGljTWV0aG9kc1tpXTtcbiAgICBtZXRob2RzW21ldGhvZE5hbWVdID0gZ2V0TWV0aG9kKG1ldGhvZE5hbWUpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2lkcihtZXRob2QpIHtcbiAgICBpZiAobWV0aG9kID09PSAnc3RhdHVzJykge1xuICAgICAgcmV0dXJuIHNpZHJTdGF0dXM7XG4gICAgfSBlbHNlIGlmIChtZXRob2RzW21ldGhvZF0pIHtcbiAgICAgIHJldHVybiBtZXRob2RzW21ldGhvZF0uYXBwbHkodGhpcywgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbWV0aG9kID09PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBtZXRob2QgPT09ICdzdHJpbmcnIHx8ICFtZXRob2QpIHtcbiAgICAgIHJldHVybiBtZXRob2RzLnRvZ2dsZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkLmVycm9yKCdNZXRob2QgJyArIG1ldGhvZCArICcgZG9lcyBub3QgZXhpc3Qgb24galF1ZXJ5LnNpZHInKTtcbiAgICB9XG4gIH1cblxuICB2YXIgJCQzID0galF1ZXJ5O1xuXG4gIGZ1bmN0aW9uIGZpbGxDb250ZW50KCRzaWRlTWVudSwgc2V0dGluZ3MpIHtcbiAgICAvLyBUaGUgbWVudSBjb250ZW50XG4gICAgaWYgKHR5cGVvZiBzZXR0aW5ncy5zb3VyY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHZhciBuZXdDb250ZW50ID0gc2V0dGluZ3Muc291cmNlKG5hbWUpO1xuXG4gICAgICAkc2lkZU1lbnUuaHRtbChuZXdDb250ZW50KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZXR0aW5ncy5zb3VyY2UgPT09ICdzdHJpbmcnICYmIGhlbHBlci5pc1VybChzZXR0aW5ncy5zb3VyY2UpKSB7XG4gICAgICAkJDMuZ2V0KHNldHRpbmdzLnNvdXJjZSwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgJHNpZGVNZW51Lmh0bWwoZGF0YSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZXR0aW5ncy5zb3VyY2UgPT09ICdzdHJpbmcnKSB7XG4gICAgICB2YXIgaHRtbENvbnRlbnQgPSAnJyxcbiAgICAgICAgICBzZWxlY3RvcnMgPSBzZXR0aW5ncy5zb3VyY2Uuc3BsaXQoJywnKTtcblxuICAgICAgJCQzLmVhY2goc2VsZWN0b3JzLCBmdW5jdGlvbiAoaW5kZXgsIGVsZW1lbnQpIHtcbiAgICAgICAgaHRtbENvbnRlbnQgKz0gJzxkaXYgY2xhc3M9XCJzaWRyLWlubmVyXCI+JyArICQkMyhlbGVtZW50KS5odG1sKCkgKyAnPC9kaXY+JztcbiAgICAgIH0pO1xuXG4gICAgICAvLyBSZW5hbWluZyBpZHMgYW5kIGNsYXNzZXNcbiAgICAgIGlmIChzZXR0aW5ncy5yZW5hbWluZykge1xuICAgICAgICB2YXIgJGh0bWxDb250ZW50ID0gJCQzKCc8ZGl2IC8+JykuaHRtbChodG1sQ29udGVudCk7XG5cbiAgICAgICAgJGh0bWxDb250ZW50LmZpbmQoJyonKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbWVudCkge1xuICAgICAgICAgIHZhciAkZWxlbWVudCA9ICQkMyhlbGVtZW50KTtcblxuICAgICAgICAgIGhlbHBlci5hZGRQcmVmaXhlcygkZWxlbWVudCk7XG4gICAgICAgIH0pO1xuICAgICAgICBodG1sQ29udGVudCA9ICRodG1sQ29udGVudC5odG1sKCk7XG4gICAgICB9XG5cbiAgICAgICRzaWRlTWVudS5odG1sKGh0bWxDb250ZW50KTtcbiAgICB9IGVsc2UgaWYgKHNldHRpbmdzLnNvdXJjZSAhPT0gbnVsbCkge1xuICAgICAgJCQzLmVycm9yKCdJbnZhbGlkIFNpZHIgU291cmNlJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuICRzaWRlTWVudTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZuU2lkcihvcHRpb25zKSB7XG4gICAgdmFyIHRyYW5zaXRpb25zID0gaGVscGVyLnRyYW5zaXRpb25zLFxuICAgICAgICBzZXR0aW5ncyA9ICQkMy5leHRlbmQoe1xuICAgICAgbmFtZTogJ3NpZHInLCAvLyBOYW1lIGZvciB0aGUgJ3NpZHInXG4gICAgICBzcGVlZDogMjAwLCAvLyBBY2NlcHRzIHN0YW5kYXJkIGpRdWVyeSBlZmZlY3RzIHNwZWVkcyAoaS5lLiBmYXN0LCBub3JtYWwgb3IgbWlsbGlzZWNvbmRzKVxuICAgICAgc2lkZTogJ2xlZnQnLCAvLyBBY2NlcHRzICdsZWZ0JyBvciAncmlnaHQnXG4gICAgICBzb3VyY2U6IG51bGwsIC8vIE92ZXJyaWRlIHRoZSBzb3VyY2Ugb2YgdGhlIGNvbnRlbnQuXG4gICAgICByZW5hbWluZzogdHJ1ZSwgLy8gVGhlIGlkcyBhbmQgY2xhc3NlcyB3aWxsIGJlIHByZXBlbmRlZCB3aXRoIGEgcHJlZml4IHdoZW4gbG9hZGluZyBleGlzdGVudCBjb250ZW50XG4gICAgICBib2R5OiAnYm9keScsIC8vIFBhZ2UgY29udGFpbmVyIHNlbGVjdG9yLFxuICAgICAgZGlzcGxhY2U6IHRydWUsIC8vIERpc3BsYWNlIHRoZSBib2R5IGNvbnRlbnQgb3Igbm90XG4gICAgICB0aW1pbmc6ICdlYXNlJywgLy8gVGltaW5nIGZ1bmN0aW9uIGZvciBDU1MgdHJhbnNpdGlvbnNcbiAgICAgIG1ldGhvZDogJ3RvZ2dsZScsIC8vIFRoZSBtZXRob2QgdG8gY2FsbCB3aGVuIGVsZW1lbnQgaXMgY2xpY2tlZFxuICAgICAgYmluZDogJ3RvdWNoc3RhcnQgY2xpY2snLCAvLyBUaGUgZXZlbnQocykgdG8gdHJpZ2dlciB0aGUgbWVudVxuICAgICAgb25PcGVuOiBmdW5jdGlvbiBvbk9wZW4oKSB7fSxcbiAgICAgIC8vIENhbGxiYWNrIHdoZW4gc2lkciBzdGFydCBvcGVuaW5nXG4gICAgICBvbkNsb3NlOiBmdW5jdGlvbiBvbkNsb3NlKCkge30sXG4gICAgICAvLyBDYWxsYmFjayB3aGVuIHNpZHIgc3RhcnQgY2xvc2luZ1xuICAgICAgb25PcGVuRW5kOiBmdW5jdGlvbiBvbk9wZW5FbmQoKSB7fSxcbiAgICAgIC8vIENhbGxiYWNrIHdoZW4gc2lkciBlbmQgb3BlbmluZ1xuICAgICAgb25DbG9zZUVuZDogZnVuY3Rpb24gb25DbG9zZUVuZCgpIHt9IC8vIENhbGxiYWNrIHdoZW4gc2lkciBlbmQgY2xvc2luZ1xuXG4gICAgfSwgb3B0aW9ucyksXG4gICAgICAgIG5hbWUgPSBzZXR0aW5ncy5uYW1lLFxuICAgICAgICAkc2lkZU1lbnUgPSAkJDMoJyMnICsgbmFtZSk7XG5cbiAgICAvLyBJZiB0aGUgc2lkZSBtZW51IGRvIG5vdCBleGlzdCBjcmVhdGUgaXRcbiAgICBpZiAoJHNpZGVNZW51Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgJHNpZGVNZW51ID0gJCQzKCc8ZGl2IC8+JykuYXR0cignaWQnLCBuYW1lKS5hcHBlbmRUbygkJDMoJ2JvZHknKSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIHRyYW5zaXRpb24gdG8gbWVudSBpZiBhcmUgc3VwcG9ydGVkXG4gICAgaWYgKHRyYW5zaXRpb25zLnN1cHBvcnRlZCkge1xuICAgICAgJHNpZGVNZW51LmNzcyh0cmFuc2l0aW9ucy5wcm9wZXJ0eSwgc2V0dGluZ3Muc2lkZSArICcgJyArIHNldHRpbmdzLnNwZWVkIC8gMTAwMCArICdzICcgKyBzZXR0aW5ncy50aW1pbmcpO1xuICAgIH1cblxuICAgIC8vIEFkZGluZyBzdHlsZXMgYW5kIG9wdGlvbnNcbiAgICAkc2lkZU1lbnUuYWRkQ2xhc3MoJ3NpZHInKS5hZGRDbGFzcyhzZXR0aW5ncy5zaWRlKS5kYXRhKHtcbiAgICAgIHNwZWVkOiBzZXR0aW5ncy5zcGVlZCxcbiAgICAgIHNpZGU6IHNldHRpbmdzLnNpZGUsXG4gICAgICBib2R5OiBzZXR0aW5ncy5ib2R5LFxuICAgICAgZGlzcGxhY2U6IHNldHRpbmdzLmRpc3BsYWNlLFxuICAgICAgdGltaW5nOiBzZXR0aW5ncy50aW1pbmcsXG4gICAgICBtZXRob2Q6IHNldHRpbmdzLm1ldGhvZCxcbiAgICAgIG9uT3Blbjogc2V0dGluZ3Mub25PcGVuLFxuICAgICAgb25DbG9zZTogc2V0dGluZ3Mub25DbG9zZSxcbiAgICAgIG9uT3BlbkVuZDogc2V0dGluZ3Mub25PcGVuRW5kLFxuICAgICAgb25DbG9zZUVuZDogc2V0dGluZ3Mub25DbG9zZUVuZFxuICAgIH0pO1xuXG4gICAgJHNpZGVNZW51ID0gZmlsbENvbnRlbnQoJHNpZGVNZW51LCBzZXR0aW5ncyk7XG5cbiAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkdGhpcyA9ICQkMyh0aGlzKSxcbiAgICAgICAgICBkYXRhID0gJHRoaXMuZGF0YSgnc2lkcicpLFxuICAgICAgICAgIGZsYWcgPSBmYWxzZTtcblxuICAgICAgLy8gSWYgdGhlIHBsdWdpbiBoYXNuJ3QgYmVlbiBpbml0aWFsaXplZCB5ZXRcbiAgICAgIGlmICghZGF0YSkge1xuICAgICAgICBzaWRyU3RhdHVzLm1vdmluZyA9IGZhbHNlO1xuICAgICAgICBzaWRyU3RhdHVzLm9wZW5lZCA9IGZhbHNlO1xuXG4gICAgICAgICR0aGlzLmRhdGEoJ3NpZHInLCBuYW1lKTtcblxuICAgICAgICAkdGhpcy5iaW5kKHNldHRpbmdzLmJpbmQsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICBpZiAoIWZsYWcpIHtcbiAgICAgICAgICAgIGZsYWcgPSB0cnVlO1xuICAgICAgICAgICAgc2lkcihzZXR0aW5ncy5tZXRob2QsIG5hbWUpO1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgZmxhZyA9IGZhbHNlO1xuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgalF1ZXJ5LnNpZHIgPSBzaWRyO1xuICBqUXVlcnkuZm4uc2lkciA9IGZuU2lkcjtcblxufSgpKTsiLCIhZnVuY3Rpb24oZSl7dmFyIHQ7ZS5mbi5zbGlua3k9ZnVuY3Rpb24oYSl7dmFyIHM9ZS5leHRlbmQoe2xhYmVsOlwiQmFja1wiLHRpdGxlOiExLHNwZWVkOjMwMCxyZXNpemU6ITB9LGEpLGk9ZSh0aGlzKSxuPWkuY2hpbGRyZW4oKS5maXJzdCgpO2kuYWRkQ2xhc3MoXCJzbGlua3ktbWVudVwiKTt2YXIgcj1mdW5jdGlvbihlLHQpe3ZhciBhPU1hdGgucm91bmQocGFyc2VJbnQobi5nZXQoMCkuc3R5bGUubGVmdCkpfHwwO24uY3NzKFwibGVmdFwiLGEtMTAwKmUrXCIlXCIpLFwiZnVuY3Rpb25cIj09dHlwZW9mIHQmJnNldFRpbWVvdXQodCxzLnNwZWVkKX0sbD1mdW5jdGlvbihlKXtpLmhlaWdodChlLm91dGVySGVpZ2h0KCkpfSxkPWZ1bmN0aW9uKGUpe2kuY3NzKFwidHJhbnNpdGlvbi1kdXJhdGlvblwiLGUrXCJtc1wiKSxuLmNzcyhcInRyYW5zaXRpb24tZHVyYXRpb25cIixlK1wibXNcIil9O2lmKGQocy5zcGVlZCksZShcImEgKyB1bFwiLGkpLnByZXYoKS5hZGRDbGFzcyhcIm5leHRcIiksZShcImxpID4gdWxcIixpKS5wcmVwZW5kKCc8bGkgY2xhc3M9XCJoZWFkZXJcIj4nKSxzLnRpdGxlPT09ITAmJmUoXCJsaSA+IHVsXCIsaSkuZWFjaChmdW5jdGlvbigpe3ZhciB0PWUodGhpcykucGFyZW50KCkuZmluZChcImFcIikuZmlyc3QoKS50ZXh0KCksYT1lKFwiPGgyPlwiKS50ZXh0KHQpO2UoXCI+IC5oZWFkZXJcIix0aGlzKS5hcHBlbmQoYSl9KSxzLnRpdGxlfHxzLmxhYmVsIT09ITApe3ZhciBvPWUoXCI8YT5cIikudGV4dChzLmxhYmVsKS5wcm9wKFwiaHJlZlwiLFwiI1wiKS5hZGRDbGFzcyhcImJhY2tcIik7ZShcIi5oZWFkZXJcIixpKS5hcHBlbmQobyl9ZWxzZSBlKFwibGkgPiB1bFwiLGkpLmVhY2goZnVuY3Rpb24oKXt2YXIgdD1lKHRoaXMpLnBhcmVudCgpLmZpbmQoXCJhXCIpLmZpcnN0KCkudGV4dCgpLGE9ZShcIjxhPlwiKS50ZXh0KHQpLnByb3AoXCJocmVmXCIsXCIjXCIpLmFkZENsYXNzKFwiYmFja1wiKTtlKFwiPiAuaGVhZGVyXCIsdGhpcykuYXBwZW5kKGEpfSk7ZShcImFcIixpKS5vbihcImNsaWNrXCIsZnVuY3Rpb24oYSl7aWYoISh0K3Muc3BlZWQ+RGF0ZS5ub3coKSkpe3Q9RGF0ZS5ub3coKTt2YXIgbj1lKHRoaXMpOy8jLy50ZXN0KHRoaXMuaHJlZikmJmEucHJldmVudERlZmF1bHQoKSxuLmhhc0NsYXNzKFwibmV4dFwiKT8oaS5maW5kKFwiLmFjdGl2ZVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKSxuLm5leHQoKS5zaG93KCkuYWRkQ2xhc3MoXCJhY3RpdmVcIikscigxKSxzLnJlc2l6ZSYmbChuLm5leHQoKSkpOm4uaGFzQ2xhc3MoXCJiYWNrXCIpJiYocigtMSxmdW5jdGlvbigpe2kuZmluZChcIi5hY3RpdmVcIikucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIiksbi5wYXJlbnQoKS5wYXJlbnQoKS5oaWRlKCkucGFyZW50c1VudGlsKGksXCJ1bFwiKS5maXJzdCgpLmFkZENsYXNzKFwiYWN0aXZlXCIpfSkscy5yZXNpemUmJmwobi5wYXJlbnQoKS5wYXJlbnQoKS5wYXJlbnRzVW50aWwoaSxcInVsXCIpKSl9fSksdGhpcy5qdW1wPWZ1bmN0aW9uKHQsYSl7dD1lKHQpO3ZhciBuPWkuZmluZChcIi5hY3RpdmVcIik7bj1uLmxlbmd0aD4wP24ucGFyZW50c1VudGlsKGksXCJ1bFwiKS5sZW5ndGg6MCxpLmZpbmQoXCJ1bFwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKS5oaWRlKCk7dmFyIG89dC5wYXJlbnRzVW50aWwoaSxcInVsXCIpO28uc2hvdygpLHQuc2hvdygpLmFkZENsYXNzKFwiYWN0aXZlXCIpLGE9PT0hMSYmZCgwKSxyKG8ubGVuZ3RoLW4pLHMucmVzaXplJiZsKHQpLGE9PT0hMSYmZChzLnNwZWVkKX0sdGhpcy5ob21lPWZ1bmN0aW9uKHQpe3Q9PT0hMSYmZCgwKTt2YXIgYT1pLmZpbmQoXCIuYWN0aXZlXCIpLG49YS5wYXJlbnRzVW50aWwoaSxcImxpXCIpLmxlbmd0aDtuPjAmJihyKC1uLGZ1bmN0aW9uKCl7YS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKX0pLHMucmVzaXplJiZsKGUoYS5wYXJlbnRzVW50aWwoaSxcImxpXCIpLmdldChuLTEpKS5wYXJlbnQoKSkpLHQ9PT0hMSYmZChzLnNwZWVkKX0sdGhpcy5kZXN0cm95PWZ1bmN0aW9uKCl7ZShcIi5oZWFkZXJcIixpKS5yZW1vdmUoKSxlKFwiYVwiLGkpLnJlbW92ZUNsYXNzKFwibmV4dFwiKS5vZmYoXCJjbGlja1wiKSxpLnJlbW92ZUNsYXNzKFwic2xpbmt5LW1lbnVcIikuY3NzKFwidHJhbnNpdGlvbi1kdXJhdGlvblwiLFwiXCIpLG4uY3NzKFwidHJhbnNpdGlvbi1kdXJhdGlvblwiLFwiXCIpfTt2YXIgYz1pLmZpbmQoXCIuYWN0aXZlXCIpO3JldHVybiBjLmxlbmd0aD4wJiYoYy5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKSx0aGlzLmp1bXAoYywhMSkpLHRoaXN9fShqUXVlcnkpOyIsIihmdW5jdGlvbigpIHtcbiAgdmFyIEFqYXhNb25pdG9yLCBCYXIsIERvY3VtZW50TW9uaXRvciwgRWxlbWVudE1vbml0b3IsIEVsZW1lbnRUcmFja2VyLCBFdmVudExhZ01vbml0b3IsIEV2ZW50ZWQsIEV2ZW50cywgTm9UYXJnZXRFcnJvciwgUGFjZSwgUmVxdWVzdEludGVyY2VwdCwgU09VUkNFX0tFWVMsIFNjYWxlciwgU29ja2V0UmVxdWVzdFRyYWNrZXIsIFhIUlJlcXVlc3RUcmFja2VyLCBhbmltYXRpb24sIGF2Z0FtcGxpdHVkZSwgYmFyLCBjYW5jZWxBbmltYXRpb24sIGNhbmNlbEFuaW1hdGlvbkZyYW1lLCBkZWZhdWx0T3B0aW9ucywgZXh0ZW5kLCBleHRlbmROYXRpdmUsIGdldEZyb21ET00sIGdldEludGVyY2VwdCwgaGFuZGxlUHVzaFN0YXRlLCBpZ25vcmVTdGFjaywgaW5pdCwgbm93LCBvcHRpb25zLCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUsIHJlc3VsdCwgcnVuQW5pbWF0aW9uLCBzY2FsZXJzLCBzaG91bGRJZ25vcmVVUkwsIHNob3VsZFRyYWNrLCBzb3VyY2UsIHNvdXJjZXMsIHVuaVNjYWxlciwgX1dlYlNvY2tldCwgX1hEb21haW5SZXF1ZXN0LCBfWE1MSHR0cFJlcXVlc3QsIF9pLCBfaW50ZXJjZXB0LCBfbGVuLCBfcHVzaFN0YXRlLCBfcmVmLCBfcmVmMSwgX3JlcGxhY2VTdGF0ZSxcbiAgICBfX3NsaWNlID0gW10uc2xpY2UsXG4gICAgX19oYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHksXG4gICAgX19leHRlbmRzID0gZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChfX2hhc1Byb3AuY2FsbChwYXJlbnQsIGtleSkpIGNoaWxkW2tleV0gPSBwYXJlbnRba2V5XTsgfSBmdW5jdGlvbiBjdG9yKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gY2hpbGQ7IH0gY3Rvci5wcm90b3R5cGUgPSBwYXJlbnQucHJvdG90eXBlOyBjaGlsZC5wcm90b3R5cGUgPSBuZXcgY3RvcigpOyBjaGlsZC5fX3N1cGVyX18gPSBwYXJlbnQucHJvdG90eXBlOyByZXR1cm4gY2hpbGQ7IH0sXG4gICAgX19pbmRleE9mID0gW10uaW5kZXhPZiB8fCBmdW5jdGlvbihpdGVtKSB7IGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7IGkgPCBsOyBpKyspIHsgaWYgKGkgaW4gdGhpcyAmJiB0aGlzW2ldID09PSBpdGVtKSByZXR1cm4gaTsgfSByZXR1cm4gLTE7IH07XG5cbiAgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgY2F0Y2h1cFRpbWU6IDEwMCxcbiAgICBpbml0aWFsUmF0ZTogLjAzLFxuICAgIG1pblRpbWU6IDI1MCxcbiAgICBnaG9zdFRpbWU6IDEwMCxcbiAgICBtYXhQcm9ncmVzc1BlckZyYW1lOiAyMCxcbiAgICBlYXNlRmFjdG9yOiAxLjI1LFxuICAgIHN0YXJ0T25QYWdlTG9hZDogdHJ1ZSxcbiAgICByZXN0YXJ0T25QdXNoU3RhdGU6IHRydWUsXG4gICAgcmVzdGFydE9uUmVxdWVzdEFmdGVyOiA1MDAsXG4gICAgdGFyZ2V0OiAnYm9keScsXG4gICAgZWxlbWVudHM6IHtcbiAgICAgIGNoZWNrSW50ZXJ2YWw6IDEwMCxcbiAgICAgIHNlbGVjdG9yczogWydib2R5J11cbiAgICB9LFxuICAgIGV2ZW50TGFnOiB7XG4gICAgICBtaW5TYW1wbGVzOiAxMCxcbiAgICAgIHNhbXBsZUNvdW50OiAzLFxuICAgICAgbGFnVGhyZXNob2xkOiAzXG4gICAgfSxcbiAgICBhamF4OiB7XG4gICAgICB0cmFja01ldGhvZHM6IFsnR0VUJ10sXG4gICAgICB0cmFja1dlYlNvY2tldHM6IHRydWUsXG4gICAgICBpZ25vcmVVUkxzOiBbXVxuICAgIH1cbiAgfTtcblxuICBub3cgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3JlZjtcbiAgICByZXR1cm4gKF9yZWYgPSB0eXBlb2YgcGVyZm9ybWFuY2UgIT09IFwidW5kZWZpbmVkXCIgJiYgcGVyZm9ybWFuY2UgIT09IG51bGwgPyB0eXBlb2YgcGVyZm9ybWFuY2Uubm93ID09PSBcImZ1bmN0aW9uXCIgPyBwZXJmb3JtYW5jZS5ub3coKSA6IHZvaWQgMCA6IHZvaWQgMCkgIT0gbnVsbCA/IF9yZWYgOiArKG5ldyBEYXRlKTtcbiAgfTtcblxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cbiAgY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Lm1vekNhbmNlbEFuaW1hdGlvbkZyYW1lO1xuXG4gIGlmIChyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT0gbnVsbCkge1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGZuKSB7XG4gICAgICByZXR1cm4gc2V0VGltZW91dChmbiwgNTApO1xuICAgIH07XG4gICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihpZCkge1xuICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChpZCk7XG4gICAgfTtcbiAgfVxuXG4gIHJ1bkFuaW1hdGlvbiA9IGZ1bmN0aW9uKGZuKSB7XG4gICAgdmFyIGxhc3QsIHRpY2s7XG4gICAgbGFzdCA9IG5vdygpO1xuICAgIHRpY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkaWZmO1xuICAgICAgZGlmZiA9IG5vdygpIC0gbGFzdDtcbiAgICAgIGlmIChkaWZmID49IDMzKSB7XG4gICAgICAgIGxhc3QgPSBub3coKTtcbiAgICAgICAgcmV0dXJuIGZuKGRpZmYsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGljayk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQodGljaywgMzMgLSBkaWZmKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiB0aWNrKCk7XG4gIH07XG5cbiAgcmVzdWx0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MsIGtleSwgb2JqO1xuICAgIG9iaiA9IGFyZ3VtZW50c1swXSwga2V5ID0gYXJndW1lbnRzWzFdLCBhcmdzID0gMyA8PSBhcmd1bWVudHMubGVuZ3RoID8gX19zbGljZS5jYWxsKGFyZ3VtZW50cywgMikgOiBbXTtcbiAgICBpZiAodHlwZW9mIG9ialtrZXldID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gb2JqW2tleV0uYXBwbHkob2JqLCBhcmdzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9ialtrZXldO1xuICAgIH1cbiAgfTtcblxuICBleHRlbmQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIga2V5LCBvdXQsIHNvdXJjZSwgc291cmNlcywgdmFsLCBfaSwgX2xlbjtcbiAgICBvdXQgPSBhcmd1bWVudHNbMF0sIHNvdXJjZXMgPSAyIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBfX3NsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSA6IFtdO1xuICAgIGZvciAoX2kgPSAwLCBfbGVuID0gc291cmNlcy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgc291cmNlID0gc291cmNlc1tfaV07XG4gICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgIGZvciAoa2V5IGluIHNvdXJjZSkge1xuICAgICAgICAgIGlmICghX19oYXNQcm9wLmNhbGwoc291cmNlLCBrZXkpKSBjb250aW51ZTtcbiAgICAgICAgICB2YWwgPSBzb3VyY2Vba2V5XTtcbiAgICAgICAgICBpZiAoKG91dFtrZXldICE9IG51bGwpICYmIHR5cGVvZiBvdXRba2V5XSA9PT0gJ29iamVjdCcgJiYgKHZhbCAhPSBudWxsKSAmJiB0eXBlb2YgdmFsID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgZXh0ZW5kKG91dFtrZXldLCB2YWwpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvdXRba2V5XSA9IHZhbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbiAgfTtcblxuICBhdmdBbXBsaXR1ZGUgPSBmdW5jdGlvbihhcnIpIHtcbiAgICB2YXIgY291bnQsIHN1bSwgdiwgX2ksIF9sZW47XG4gICAgc3VtID0gY291bnQgPSAwO1xuICAgIGZvciAoX2kgPSAwLCBfbGVuID0gYXJyLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICB2ID0gYXJyW19pXTtcbiAgICAgIHN1bSArPSBNYXRoLmFicyh2KTtcbiAgICAgIGNvdW50Kys7XG4gICAgfVxuICAgIHJldHVybiBzdW0gLyBjb3VudDtcbiAgfTtcblxuICBnZXRGcm9tRE9NID0gZnVuY3Rpb24oa2V5LCBqc29uKSB7XG4gICAgdmFyIGRhdGEsIGUsIGVsO1xuICAgIGlmIChrZXkgPT0gbnVsbCkge1xuICAgICAga2V5ID0gJ29wdGlvbnMnO1xuICAgIH1cbiAgICBpZiAoanNvbiA9PSBudWxsKSB7XG4gICAgICBqc29uID0gdHJ1ZTtcbiAgICB9XG4gICAgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiW2RhdGEtcGFjZS1cIiArIGtleSArIFwiXVwiKTtcbiAgICBpZiAoIWVsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGRhdGEgPSBlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXBhY2UtXCIgKyBrZXkpO1xuICAgIGlmICghanNvbikge1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShkYXRhKTtcbiAgICB9IGNhdGNoIChfZXJyb3IpIHtcbiAgICAgIGUgPSBfZXJyb3I7XG4gICAgICByZXR1cm4gdHlwZW9mIGNvbnNvbGUgIT09IFwidW5kZWZpbmVkXCIgJiYgY29uc29sZSAhPT0gbnVsbCA/IGNvbnNvbGUuZXJyb3IoXCJFcnJvciBwYXJzaW5nIGlubGluZSBwYWNlIG9wdGlvbnNcIiwgZSkgOiB2b2lkIDA7XG4gICAgfVxuICB9O1xuXG4gIEV2ZW50ZWQgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gRXZlbnRlZCgpIHt9XG5cbiAgICBFdmVudGVkLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKGV2ZW50LCBoYW5kbGVyLCBjdHgsIG9uY2UpIHtcbiAgICAgIHZhciBfYmFzZTtcbiAgICAgIGlmIChvbmNlID09IG51bGwpIHtcbiAgICAgICAgb25jZSA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuYmluZGluZ3MgPT0gbnVsbCkge1xuICAgICAgICB0aGlzLmJpbmRpbmdzID0ge307XG4gICAgICB9XG4gICAgICBpZiAoKF9iYXNlID0gdGhpcy5iaW5kaW5ncylbZXZlbnRdID09IG51bGwpIHtcbiAgICAgICAgX2Jhc2VbZXZlbnRdID0gW107XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5iaW5kaW5nc1tldmVudF0ucHVzaCh7XG4gICAgICAgIGhhbmRsZXI6IGhhbmRsZXIsXG4gICAgICAgIGN0eDogY3R4LFxuICAgICAgICBvbmNlOiBvbmNlXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgRXZlbnRlZC5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKGV2ZW50LCBoYW5kbGVyLCBjdHgpIHtcbiAgICAgIHJldHVybiB0aGlzLm9uKGV2ZW50LCBoYW5kbGVyLCBjdHgsIHRydWUpO1xuICAgIH07XG5cbiAgICBFdmVudGVkLnByb3RvdHlwZS5vZmYgPSBmdW5jdGlvbihldmVudCwgaGFuZGxlcikge1xuICAgICAgdmFyIGksIF9yZWYsIF9yZXN1bHRzO1xuICAgICAgaWYgKCgoX3JlZiA9IHRoaXMuYmluZGluZ3MpICE9IG51bGwgPyBfcmVmW2V2ZW50XSA6IHZvaWQgMCkgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoaGFuZGxlciA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBkZWxldGUgdGhpcy5iaW5kaW5nc1tldmVudF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpID0gMDtcbiAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgd2hpbGUgKGkgPCB0aGlzLmJpbmRpbmdzW2V2ZW50XS5sZW5ndGgpIHtcbiAgICAgICAgICBpZiAodGhpcy5iaW5kaW5nc1tldmVudF1baV0uaGFuZGxlciA9PT0gaGFuZGxlcikge1xuICAgICAgICAgICAgX3Jlc3VsdHMucHVzaCh0aGlzLmJpbmRpbmdzW2V2ZW50XS5zcGxpY2UoaSwgMSkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfcmVzdWx0cy5wdXNoKGkrKyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgRXZlbnRlZC5wcm90b3R5cGUudHJpZ2dlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3MsIGN0eCwgZXZlbnQsIGhhbmRsZXIsIGksIG9uY2UsIF9yZWYsIF9yZWYxLCBfcmVzdWx0cztcbiAgICAgIGV2ZW50ID0gYXJndW1lbnRzWzBdLCBhcmdzID0gMiA8PSBhcmd1bWVudHMubGVuZ3RoID8gX19zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkgOiBbXTtcbiAgICAgIGlmICgoX3JlZiA9IHRoaXMuYmluZGluZ3MpICE9IG51bGwgPyBfcmVmW2V2ZW50XSA6IHZvaWQgMCkge1xuICAgICAgICBpID0gMDtcbiAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgd2hpbGUgKGkgPCB0aGlzLmJpbmRpbmdzW2V2ZW50XS5sZW5ndGgpIHtcbiAgICAgICAgICBfcmVmMSA9IHRoaXMuYmluZGluZ3NbZXZlbnRdW2ldLCBoYW5kbGVyID0gX3JlZjEuaGFuZGxlciwgY3R4ID0gX3JlZjEuY3R4LCBvbmNlID0gX3JlZjEub25jZTtcbiAgICAgICAgICBoYW5kbGVyLmFwcGx5KGN0eCAhPSBudWxsID8gY3R4IDogdGhpcywgYXJncyk7XG4gICAgICAgICAgaWYgKG9uY2UpIHtcbiAgICAgICAgICAgIF9yZXN1bHRzLnB1c2godGhpcy5iaW5kaW5nc1tldmVudF0uc3BsaWNlKGksIDEpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX3Jlc3VsdHMucHVzaChpKyspO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBFdmVudGVkO1xuXG4gIH0pKCk7XG5cbiAgUGFjZSA9IHdpbmRvdy5QYWNlIHx8IHt9O1xuXG4gIHdpbmRvdy5QYWNlID0gUGFjZTtcblxuICBleHRlbmQoUGFjZSwgRXZlbnRlZC5wcm90b3R5cGUpO1xuXG4gIG9wdGlvbnMgPSBQYWNlLm9wdGlvbnMgPSBleHRlbmQoe30sIGRlZmF1bHRPcHRpb25zLCB3aW5kb3cucGFjZU9wdGlvbnMsIGdldEZyb21ET00oKSk7XG5cbiAgX3JlZiA9IFsnYWpheCcsICdkb2N1bWVudCcsICdldmVudExhZycsICdlbGVtZW50cyddO1xuICBmb3IgKF9pID0gMCwgX2xlbiA9IF9yZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICBzb3VyY2UgPSBfcmVmW19pXTtcbiAgICBpZiAob3B0aW9uc1tzb3VyY2VdID09PSB0cnVlKSB7XG4gICAgICBvcHRpb25zW3NvdXJjZV0gPSBkZWZhdWx0T3B0aW9uc1tzb3VyY2VdO1xuICAgIH1cbiAgfVxuXG4gIE5vVGFyZ2V0RXJyb3IgPSAoZnVuY3Rpb24oX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKE5vVGFyZ2V0RXJyb3IsIF9zdXBlcik7XG5cbiAgICBmdW5jdGlvbiBOb1RhcmdldEVycm9yKCkge1xuICAgICAgX3JlZjEgPSBOb1RhcmdldEVycm9yLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIF9yZWYxO1xuICAgIH1cblxuICAgIHJldHVybiBOb1RhcmdldEVycm9yO1xuXG4gIH0pKEVycm9yKTtcblxuICBCYXIgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gQmFyKCkge1xuICAgICAgdGhpcy5wcm9ncmVzcyA9IDA7XG4gICAgfVxuXG4gICAgQmFyLnByb3RvdHlwZS5nZXRFbGVtZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGFyZ2V0RWxlbWVudDtcbiAgICAgIGlmICh0aGlzLmVsID09IG51bGwpIHtcbiAgICAgICAgdGFyZ2V0RWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Iob3B0aW9ucy50YXJnZXQpO1xuICAgICAgICBpZiAoIXRhcmdldEVsZW1lbnQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgTm9UYXJnZXRFcnJvcjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gXCJwYWNlIHBhY2UtYWN0aXZlXCI7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lID0gZG9jdW1lbnQuYm9keS5jbGFzc05hbWUucmVwbGFjZSgvcGFjZS1kb25lL2csICcnKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgKz0gJyBwYWNlLXJ1bm5pbmcnO1xuICAgICAgICB0aGlzLmVsLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwicGFjZS1wcm9ncmVzc1wiPlxcbiAgPGRpdiBjbGFzcz1cInBhY2UtcHJvZ3Jlc3MtaW5uZXJcIj48L2Rpdj5cXG48L2Rpdj5cXG48ZGl2IGNsYXNzPVwicGFjZS1hY3Rpdml0eVwiPjwvZGl2Pic7XG4gICAgICAgIGlmICh0YXJnZXRFbGVtZW50LmZpcnN0Q2hpbGQgIT0gbnVsbCkge1xuICAgICAgICAgIHRhcmdldEVsZW1lbnQuaW5zZXJ0QmVmb3JlKHRoaXMuZWwsIHRhcmdldEVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGFyZ2V0RWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuZWw7XG4gICAgfTtcblxuICAgIEJhci5wcm90b3R5cGUuZmluaXNoID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZWw7XG4gICAgICBlbCA9IHRoaXMuZ2V0RWxlbWVudCgpO1xuICAgICAgZWwuY2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lLnJlcGxhY2UoJ3BhY2UtYWN0aXZlJywgJycpO1xuICAgICAgZWwuY2xhc3NOYW1lICs9ICcgcGFjZS1pbmFjdGl2ZSc7XG4gICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9IGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lLnJlcGxhY2UoJ3BhY2UtcnVubmluZycsICcnKTtcbiAgICAgIHJldHVybiBkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSArPSAnIHBhY2UtZG9uZSc7XG4gICAgfTtcblxuICAgIEJhci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24ocHJvZykge1xuICAgICAgdGhpcy5wcm9ncmVzcyA9IHByb2c7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXIoKTtcbiAgICB9O1xuXG4gICAgQmFyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGlzLmdldEVsZW1lbnQoKS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuZ2V0RWxlbWVudCgpKTtcbiAgICAgIH0gY2F0Y2ggKF9lcnJvcikge1xuICAgICAgICBOb1RhcmdldEVycm9yID0gX2Vycm9yO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuZWwgPSB2b2lkIDA7XG4gICAgfTtcblxuICAgIEJhci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZWwsIGtleSwgcHJvZ3Jlc3NTdHIsIHRyYW5zZm9ybSwgX2osIF9sZW4xLCBfcmVmMjtcbiAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKG9wdGlvbnMudGFyZ2V0KSA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGVsID0gdGhpcy5nZXRFbGVtZW50KCk7XG4gICAgICB0cmFuc2Zvcm0gPSBcInRyYW5zbGF0ZTNkKFwiICsgdGhpcy5wcm9ncmVzcyArIFwiJSwgMCwgMClcIjtcbiAgICAgIF9yZWYyID0gWyd3ZWJraXRUcmFuc2Zvcm0nLCAnbXNUcmFuc2Zvcm0nLCAndHJhbnNmb3JtJ107XG4gICAgICBmb3IgKF9qID0gMCwgX2xlbjEgPSBfcmVmMi5sZW5ndGg7IF9qIDwgX2xlbjE7IF9qKyspIHtcbiAgICAgICAga2V5ID0gX3JlZjJbX2pdO1xuICAgICAgICBlbC5jaGlsZHJlblswXS5zdHlsZVtrZXldID0gdHJhbnNmb3JtO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLmxhc3RSZW5kZXJlZFByb2dyZXNzIHx8IHRoaXMubGFzdFJlbmRlcmVkUHJvZ3Jlc3MgfCAwICE9PSB0aGlzLnByb2dyZXNzIHwgMCkge1xuICAgICAgICBlbC5jaGlsZHJlblswXS5zZXRBdHRyaWJ1dGUoJ2RhdGEtcHJvZ3Jlc3MtdGV4dCcsIFwiXCIgKyAodGhpcy5wcm9ncmVzcyB8IDApICsgXCIlXCIpO1xuICAgICAgICBpZiAodGhpcy5wcm9ncmVzcyA+PSAxMDApIHtcbiAgICAgICAgICBwcm9ncmVzc1N0ciA9ICc5OSc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJvZ3Jlc3NTdHIgPSB0aGlzLnByb2dyZXNzIDwgMTAgPyBcIjBcIiA6IFwiXCI7XG4gICAgICAgICAgcHJvZ3Jlc3NTdHIgKz0gdGhpcy5wcm9ncmVzcyB8IDA7XG4gICAgICAgIH1cbiAgICAgICAgZWwuY2hpbGRyZW5bMF0uc2V0QXR0cmlidXRlKCdkYXRhLXByb2dyZXNzJywgXCJcIiArIHByb2dyZXNzU3RyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmxhc3RSZW5kZXJlZFByb2dyZXNzID0gdGhpcy5wcm9ncmVzcztcbiAgICB9O1xuXG4gICAgQmFyLnByb3RvdHlwZS5kb25lID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9ncmVzcyA+PSAxMDA7XG4gICAgfTtcblxuICAgIHJldHVybiBCYXI7XG5cbiAgfSkoKTtcblxuICBFdmVudHMgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gRXZlbnRzKCkge1xuICAgICAgdGhpcy5iaW5kaW5ncyA9IHt9O1xuICAgIH1cblxuICAgIEV2ZW50cy5wcm90b3R5cGUudHJpZ2dlciA9IGZ1bmN0aW9uKG5hbWUsIHZhbCkge1xuICAgICAgdmFyIGJpbmRpbmcsIF9qLCBfbGVuMSwgX3JlZjIsIF9yZXN1bHRzO1xuICAgICAgaWYgKHRoaXMuYmluZGluZ3NbbmFtZV0gIT0gbnVsbCkge1xuICAgICAgICBfcmVmMiA9IHRoaXMuYmluZGluZ3NbbmFtZV07XG4gICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgIGZvciAoX2ogPSAwLCBfbGVuMSA9IF9yZWYyLmxlbmd0aDsgX2ogPCBfbGVuMTsgX2orKykge1xuICAgICAgICAgIGJpbmRpbmcgPSBfcmVmMltfal07XG4gICAgICAgICAgX3Jlc3VsdHMucHVzaChiaW5kaW5nLmNhbGwodGhpcywgdmFsKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBFdmVudHMucHJvdG90eXBlLm9uID0gZnVuY3Rpb24obmFtZSwgZm4pIHtcbiAgICAgIHZhciBfYmFzZTtcbiAgICAgIGlmICgoX2Jhc2UgPSB0aGlzLmJpbmRpbmdzKVtuYW1lXSA9PSBudWxsKSB7XG4gICAgICAgIF9iYXNlW25hbWVdID0gW107XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5iaW5kaW5nc1tuYW1lXS5wdXNoKGZuKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIEV2ZW50cztcblxuICB9KSgpO1xuXG4gIF9YTUxIdHRwUmVxdWVzdCA9IHdpbmRvdy5YTUxIdHRwUmVxdWVzdDtcblxuICBfWERvbWFpblJlcXVlc3QgPSB3aW5kb3cuWERvbWFpblJlcXVlc3Q7XG5cbiAgX1dlYlNvY2tldCA9IHdpbmRvdy5XZWJTb2NrZXQ7XG5cbiAgZXh0ZW5kTmF0aXZlID0gZnVuY3Rpb24odG8sIGZyb20pIHtcbiAgICB2YXIgZSwga2V5LCBfcmVzdWx0cztcbiAgICBfcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoa2V5IGluIGZyb20ucHJvdG90eXBlKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoKHRvW2tleV0gPT0gbnVsbCkgJiYgdHlwZW9mIGZyb21ba2V5XSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGlmICh0eXBlb2YgT2JqZWN0LmRlZmluZVByb3BlcnR5ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBfcmVzdWx0cy5wdXNoKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0bywga2V5LCB7XG4gICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZyb20ucHJvdG90eXBlW2tleV07XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfcmVzdWx0cy5wdXNoKHRvW2tleV0gPSBmcm9tLnByb3RvdHlwZVtrZXldKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX3Jlc3VsdHMucHVzaCh2b2lkIDApO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChfZXJyb3IpIHtcbiAgICAgICAgZSA9IF9lcnJvcjtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIF9yZXN1bHRzO1xuICB9O1xuXG4gIGlnbm9yZVN0YWNrID0gW107XG5cbiAgUGFjZS5pZ25vcmUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncywgZm4sIHJldDtcbiAgICBmbiA9IGFyZ3VtZW50c1swXSwgYXJncyA9IDIgPD0gYXJndW1lbnRzLmxlbmd0aCA/IF9fc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpIDogW107XG4gICAgaWdub3JlU3RhY2sudW5zaGlmdCgnaWdub3JlJyk7XG4gICAgcmV0ID0gZm4uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgaWdub3JlU3RhY2suc2hpZnQoKTtcbiAgICByZXR1cm4gcmV0O1xuICB9O1xuXG4gIFBhY2UudHJhY2sgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncywgZm4sIHJldDtcbiAgICBmbiA9IGFyZ3VtZW50c1swXSwgYXJncyA9IDIgPD0gYXJndW1lbnRzLmxlbmd0aCA/IF9fc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpIDogW107XG4gICAgaWdub3JlU3RhY2sudW5zaGlmdCgndHJhY2snKTtcbiAgICByZXQgPSBmbi5hcHBseShudWxsLCBhcmdzKTtcbiAgICBpZ25vcmVTdGFjay5zaGlmdCgpO1xuICAgIHJldHVybiByZXQ7XG4gIH07XG5cbiAgc2hvdWxkVHJhY2sgPSBmdW5jdGlvbihtZXRob2QpIHtcbiAgICB2YXIgX3JlZjI7XG4gICAgaWYgKG1ldGhvZCA9PSBudWxsKSB7XG4gICAgICBtZXRob2QgPSAnR0VUJztcbiAgICB9XG4gICAgaWYgKGlnbm9yZVN0YWNrWzBdID09PSAndHJhY2snKSB7XG4gICAgICByZXR1cm4gJ2ZvcmNlJztcbiAgICB9XG4gICAgaWYgKCFpZ25vcmVTdGFjay5sZW5ndGggJiYgb3B0aW9ucy5hamF4KSB7XG4gICAgICBpZiAobWV0aG9kID09PSAnc29ja2V0JyAmJiBvcHRpb25zLmFqYXgudHJhY2tXZWJTb2NrZXRzKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChfcmVmMiA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpLCBfX2luZGV4T2YuY2FsbChvcHRpb25zLmFqYXgudHJhY2tNZXRob2RzLCBfcmVmMikgPj0gMCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIFJlcXVlc3RJbnRlcmNlcHQgPSAoZnVuY3Rpb24oX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFJlcXVlc3RJbnRlcmNlcHQsIF9zdXBlcik7XG5cbiAgICBmdW5jdGlvbiBSZXF1ZXN0SW50ZXJjZXB0KCkge1xuICAgICAgdmFyIG1vbml0b3JYSFIsXG4gICAgICAgIF90aGlzID0gdGhpcztcbiAgICAgIFJlcXVlc3RJbnRlcmNlcHQuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBtb25pdG9yWEhSID0gZnVuY3Rpb24ocmVxKSB7XG4gICAgICAgIHZhciBfb3BlbjtcbiAgICAgICAgX29wZW4gPSByZXEub3BlbjtcbiAgICAgICAgcmV0dXJuIHJlcS5vcGVuID0gZnVuY3Rpb24odHlwZSwgdXJsLCBhc3luYykge1xuICAgICAgICAgIGlmIChzaG91bGRUcmFjayh0eXBlKSkge1xuICAgICAgICAgICAgX3RoaXMudHJpZ2dlcigncmVxdWVzdCcsIHtcbiAgICAgICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICAgIHJlcXVlc3Q6IHJlcVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBfb3Blbi5hcHBseShyZXEsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgICB9O1xuICAgICAgd2luZG93LlhNTEh0dHBSZXF1ZXN0ID0gZnVuY3Rpb24oZmxhZ3MpIHtcbiAgICAgICAgdmFyIHJlcTtcbiAgICAgICAgcmVxID0gbmV3IF9YTUxIdHRwUmVxdWVzdChmbGFncyk7XG4gICAgICAgIG1vbml0b3JYSFIocmVxKTtcbiAgICAgICAgcmV0dXJuIHJlcTtcbiAgICAgIH07XG4gICAgICB0cnkge1xuICAgICAgICBleHRlbmROYXRpdmUod2luZG93LlhNTEh0dHBSZXF1ZXN0LCBfWE1MSHR0cFJlcXVlc3QpO1xuICAgICAgfSBjYXRjaCAoX2Vycm9yKSB7fVxuICAgICAgaWYgKF9YRG9tYWluUmVxdWVzdCAhPSBudWxsKSB7XG4gICAgICAgIHdpbmRvdy5YRG9tYWluUmVxdWVzdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciByZXE7XG4gICAgICAgICAgcmVxID0gbmV3IF9YRG9tYWluUmVxdWVzdDtcbiAgICAgICAgICBtb25pdG9yWEhSKHJlcSk7XG4gICAgICAgICAgcmV0dXJuIHJlcTtcbiAgICAgICAgfTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBleHRlbmROYXRpdmUod2luZG93LlhEb21haW5SZXF1ZXN0LCBfWERvbWFpblJlcXVlc3QpO1xuICAgICAgICB9IGNhdGNoIChfZXJyb3IpIHt9XG4gICAgICB9XG4gICAgICBpZiAoKF9XZWJTb2NrZXQgIT0gbnVsbCkgJiYgb3B0aW9ucy5hamF4LnRyYWNrV2ViU29ja2V0cykge1xuICAgICAgICB3aW5kb3cuV2ViU29ja2V0ID0gZnVuY3Rpb24odXJsLCBwcm90b2NvbHMpIHtcbiAgICAgICAgICB2YXIgcmVxO1xuICAgICAgICAgIGlmIChwcm90b2NvbHMgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmVxID0gbmV3IF9XZWJTb2NrZXQodXJsLCBwcm90b2NvbHMpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXEgPSBuZXcgX1dlYlNvY2tldCh1cmwpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc2hvdWxkVHJhY2soJ3NvY2tldCcpKSB7XG4gICAgICAgICAgICBfdGhpcy50cmlnZ2VyKCdyZXF1ZXN0Jywge1xuICAgICAgICAgICAgICB0eXBlOiAnc29ja2V0JyxcbiAgICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICAgIHByb3RvY29sczogcHJvdG9jb2xzLFxuICAgICAgICAgICAgICByZXF1ZXN0OiByZXFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVxO1xuICAgICAgICB9O1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGV4dGVuZE5hdGl2ZSh3aW5kb3cuV2ViU29ja2V0LCBfV2ViU29ja2V0KTtcbiAgICAgICAgfSBjYXRjaCAoX2Vycm9yKSB7fVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBSZXF1ZXN0SW50ZXJjZXB0O1xuXG4gIH0pKEV2ZW50cyk7XG5cbiAgX2ludGVyY2VwdCA9IG51bGw7XG5cbiAgZ2V0SW50ZXJjZXB0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKF9pbnRlcmNlcHQgPT0gbnVsbCkge1xuICAgICAgX2ludGVyY2VwdCA9IG5ldyBSZXF1ZXN0SW50ZXJjZXB0O1xuICAgIH1cbiAgICByZXR1cm4gX2ludGVyY2VwdDtcbiAgfTtcblxuICBzaG91bGRJZ25vcmVVUkwgPSBmdW5jdGlvbih1cmwpIHtcbiAgICB2YXIgcGF0dGVybiwgX2osIF9sZW4xLCBfcmVmMjtcbiAgICBfcmVmMiA9IG9wdGlvbnMuYWpheC5pZ25vcmVVUkxzO1xuICAgIGZvciAoX2ogPSAwLCBfbGVuMSA9IF9yZWYyLmxlbmd0aDsgX2ogPCBfbGVuMTsgX2orKykge1xuICAgICAgcGF0dGVybiA9IF9yZWYyW19qXTtcbiAgICAgIGlmICh0eXBlb2YgcGF0dGVybiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKHVybC5pbmRleE9mKHBhdHRlcm4pICE9PSAtMSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocGF0dGVybi50ZXN0KHVybCkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgZ2V0SW50ZXJjZXB0KCkub24oJ3JlcXVlc3QnLCBmdW5jdGlvbihfYXJnKSB7XG4gICAgdmFyIGFmdGVyLCBhcmdzLCByZXF1ZXN0LCB0eXBlLCB1cmw7XG4gICAgdHlwZSA9IF9hcmcudHlwZSwgcmVxdWVzdCA9IF9hcmcucmVxdWVzdCwgdXJsID0gX2FyZy51cmw7XG4gICAgaWYgKHNob3VsZElnbm9yZVVSTCh1cmwpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghUGFjZS5ydW5uaW5nICYmIChvcHRpb25zLnJlc3RhcnRPblJlcXVlc3RBZnRlciAhPT0gZmFsc2UgfHwgc2hvdWxkVHJhY2sodHlwZSkgPT09ICdmb3JjZScpKSB7XG4gICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgYWZ0ZXIgPSBvcHRpb25zLnJlc3RhcnRPblJlcXVlc3RBZnRlciB8fCAwO1xuICAgICAgaWYgKHR5cGVvZiBhZnRlciA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgIGFmdGVyID0gMDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc3RpbGxBY3RpdmUsIF9qLCBfbGVuMSwgX3JlZjIsIF9yZWYzLCBfcmVzdWx0cztcbiAgICAgICAgaWYgKHR5cGUgPT09ICdzb2NrZXQnKSB7XG4gICAgICAgICAgc3RpbGxBY3RpdmUgPSByZXF1ZXN0LnJlYWR5U3RhdGUgPCAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0aWxsQWN0aXZlID0gKDAgPCAoX3JlZjIgPSByZXF1ZXN0LnJlYWR5U3RhdGUpICYmIF9yZWYyIDwgNCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0aWxsQWN0aXZlKSB7XG4gICAgICAgICAgUGFjZS5yZXN0YXJ0KCk7XG4gICAgICAgICAgX3JlZjMgPSBQYWNlLnNvdXJjZXM7XG4gICAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgICBmb3IgKF9qID0gMCwgX2xlbjEgPSBfcmVmMy5sZW5ndGg7IF9qIDwgX2xlbjE7IF9qKyspIHtcbiAgICAgICAgICAgIHNvdXJjZSA9IF9yZWYzW19qXTtcbiAgICAgICAgICAgIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBBamF4TW9uaXRvcikge1xuICAgICAgICAgICAgICBzb3VyY2Uud2F0Y2guYXBwbHkoc291cmNlLCBhcmdzKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBfcmVzdWx0cy5wdXNoKHZvaWQgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgICAgfVxuICAgICAgfSwgYWZ0ZXIpO1xuICAgIH1cbiAgfSk7XG5cbiAgQWpheE1vbml0b3IgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gQWpheE1vbml0b3IoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgdGhpcy5lbGVtZW50cyA9IFtdO1xuICAgICAgZ2V0SW50ZXJjZXB0KCkub24oJ3JlcXVlc3QnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzLndhdGNoLmFwcGx5KF90aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgQWpheE1vbml0b3IucHJvdG90eXBlLndhdGNoID0gZnVuY3Rpb24oX2FyZykge1xuICAgICAgdmFyIHJlcXVlc3QsIHRyYWNrZXIsIHR5cGUsIHVybDtcbiAgICAgIHR5cGUgPSBfYXJnLnR5cGUsIHJlcXVlc3QgPSBfYXJnLnJlcXVlc3QsIHVybCA9IF9hcmcudXJsO1xuICAgICAgaWYgKHNob3VsZElnbm9yZVVSTCh1cmwpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlID09PSAnc29ja2V0Jykge1xuICAgICAgICB0cmFja2VyID0gbmV3IFNvY2tldFJlcXVlc3RUcmFja2VyKHJlcXVlc3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdHJhY2tlciA9IG5ldyBYSFJSZXF1ZXN0VHJhY2tlcihyZXF1ZXN0KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzLnB1c2godHJhY2tlcik7XG4gICAgfTtcblxuICAgIHJldHVybiBBamF4TW9uaXRvcjtcblxuICB9KSgpO1xuXG4gIFhIUlJlcXVlc3RUcmFja2VyID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIFhIUlJlcXVlc3RUcmFja2VyKHJlcXVlc3QpIHtcbiAgICAgIHZhciBldmVudCwgc2l6ZSwgX2osIF9sZW4xLCBfb25yZWFkeXN0YXRlY2hhbmdlLCBfcmVmMixcbiAgICAgICAgX3RoaXMgPSB0aGlzO1xuICAgICAgdGhpcy5wcm9ncmVzcyA9IDA7XG4gICAgICBpZiAod2luZG93LlByb2dyZXNzRXZlbnQgIT0gbnVsbCkge1xuICAgICAgICBzaXplID0gbnVsbDtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGZ1bmN0aW9uKGV2dCkge1xuICAgICAgICAgIGlmIChldnQubGVuZ3RoQ29tcHV0YWJsZSkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzLnByb2dyZXNzID0gMTAwICogZXZ0LmxvYWRlZCAvIGV2dC50b3RhbDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzLnByb2dyZXNzID0gX3RoaXMucHJvZ3Jlc3MgKyAoMTAwIC0gX3RoaXMucHJvZ3Jlc3MpIC8gMjtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIGZhbHNlKTtcbiAgICAgICAgX3JlZjIgPSBbJ2xvYWQnLCAnYWJvcnQnLCAndGltZW91dCcsICdlcnJvciddO1xuICAgICAgICBmb3IgKF9qID0gMCwgX2xlbjEgPSBfcmVmMi5sZW5ndGg7IF9qIDwgX2xlbjE7IF9qKyspIHtcbiAgICAgICAgICBldmVudCA9IF9yZWYyW19qXTtcbiAgICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzLnByb2dyZXNzID0gMTAwO1xuICAgICAgICAgIH0sIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX29ucmVhZHlzdGF0ZWNoYW5nZSA9IHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlO1xuICAgICAgICByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBfcmVmMztcbiAgICAgICAgICBpZiAoKF9yZWYzID0gcmVxdWVzdC5yZWFkeVN0YXRlKSA9PT0gMCB8fCBfcmVmMyA9PT0gNCkge1xuICAgICAgICAgICAgX3RoaXMucHJvZ3Jlc3MgPSAxMDA7XG4gICAgICAgICAgfSBlbHNlIGlmIChyZXF1ZXN0LnJlYWR5U3RhdGUgPT09IDMpIHtcbiAgICAgICAgICAgIF90aGlzLnByb2dyZXNzID0gNTA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0eXBlb2YgX29ucmVhZHlzdGF0ZWNoYW5nZSA9PT0gXCJmdW5jdGlvblwiID8gX29ucmVhZHlzdGF0ZWNoYW5nZS5hcHBseShudWxsLCBhcmd1bWVudHMpIDogdm9pZCAwO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBYSFJSZXF1ZXN0VHJhY2tlcjtcblxuICB9KSgpO1xuXG4gIFNvY2tldFJlcXVlc3RUcmFja2VyID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIFNvY2tldFJlcXVlc3RUcmFja2VyKHJlcXVlc3QpIHtcbiAgICAgIHZhciBldmVudCwgX2osIF9sZW4xLCBfcmVmMixcbiAgICAgICAgX3RoaXMgPSB0aGlzO1xuICAgICAgdGhpcy5wcm9ncmVzcyA9IDA7XG4gICAgICBfcmVmMiA9IFsnZXJyb3InLCAnb3BlbiddO1xuICAgICAgZm9yIChfaiA9IDAsIF9sZW4xID0gX3JlZjIubGVuZ3RoOyBfaiA8IF9sZW4xOyBfaisrKSB7XG4gICAgICAgIGV2ZW50ID0gX3JlZjJbX2pdO1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5wcm9ncmVzcyA9IDEwMDtcbiAgICAgICAgfSwgZmFsc2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBTb2NrZXRSZXF1ZXN0VHJhY2tlcjtcblxuICB9KSgpO1xuXG4gIEVsZW1lbnRNb25pdG9yID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIEVsZW1lbnRNb25pdG9yKG9wdGlvbnMpIHtcbiAgICAgIHZhciBzZWxlY3RvciwgX2osIF9sZW4xLCBfcmVmMjtcbiAgICAgIGlmIChvcHRpb25zID09IG51bGwpIHtcbiAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgICAgfVxuICAgICAgdGhpcy5lbGVtZW50cyA9IFtdO1xuICAgICAgaWYgKG9wdGlvbnMuc2VsZWN0b3JzID09IG51bGwpIHtcbiAgICAgICAgb3B0aW9ucy5zZWxlY3RvcnMgPSBbXTtcbiAgICAgIH1cbiAgICAgIF9yZWYyID0gb3B0aW9ucy5zZWxlY3RvcnM7XG4gICAgICBmb3IgKF9qID0gMCwgX2xlbjEgPSBfcmVmMi5sZW5ndGg7IF9qIDwgX2xlbjE7IF9qKyspIHtcbiAgICAgICAgc2VsZWN0b3IgPSBfcmVmMltfal07XG4gICAgICAgIHRoaXMuZWxlbWVudHMucHVzaChuZXcgRWxlbWVudFRyYWNrZXIoc2VsZWN0b3IpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gRWxlbWVudE1vbml0b3I7XG5cbiAgfSkoKTtcblxuICBFbGVtZW50VHJhY2tlciA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBFbGVtZW50VHJhY2tlcihzZWxlY3Rvcikge1xuICAgICAgdGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgICAgdGhpcy5wcm9ncmVzcyA9IDA7XG4gICAgICB0aGlzLmNoZWNrKCk7XG4gICAgfVxuXG4gICAgRWxlbWVudFRyYWNrZXIucHJvdG90eXBlLmNoZWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgaWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5zZWxlY3RvcikpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZG9uZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5jaGVjaygpO1xuICAgICAgICB9KSwgb3B0aW9ucy5lbGVtZW50cy5jaGVja0ludGVydmFsKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgRWxlbWVudFRyYWNrZXIucHJvdG90eXBlLmRvbmUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnByb2dyZXNzID0gMTAwO1xuICAgIH07XG5cbiAgICByZXR1cm4gRWxlbWVudFRyYWNrZXI7XG5cbiAgfSkoKTtcblxuICBEb2N1bWVudE1vbml0b3IgPSAoZnVuY3Rpb24oKSB7XG4gICAgRG9jdW1lbnRNb25pdG9yLnByb3RvdHlwZS5zdGF0ZXMgPSB7XG4gICAgICBsb2FkaW5nOiAwLFxuICAgICAgaW50ZXJhY3RpdmU6IDUwLFxuICAgICAgY29tcGxldGU6IDEwMFxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBEb2N1bWVudE1vbml0b3IoKSB7XG4gICAgICB2YXIgX29ucmVhZHlzdGF0ZWNoYW5nZSwgX3JlZjIsXG4gICAgICAgIF90aGlzID0gdGhpcztcbiAgICAgIHRoaXMucHJvZ3Jlc3MgPSAoX3JlZjIgPSB0aGlzLnN0YXRlc1tkb2N1bWVudC5yZWFkeVN0YXRlXSkgIT0gbnVsbCA/IF9yZWYyIDogMTAwO1xuICAgICAgX29ucmVhZHlzdGF0ZWNoYW5nZSA9IGRvY3VtZW50Lm9ucmVhZHlzdGF0ZWNoYW5nZTtcbiAgICAgIGRvY3VtZW50Lm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoX3RoaXMuc3RhdGVzW2RvY3VtZW50LnJlYWR5U3RhdGVdICE9IG51bGwpIHtcbiAgICAgICAgICBfdGhpcy5wcm9ncmVzcyA9IF90aGlzLnN0YXRlc1tkb2N1bWVudC5yZWFkeVN0YXRlXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHlwZW9mIF9vbnJlYWR5c3RhdGVjaGFuZ2UgPT09IFwiZnVuY3Rpb25cIiA/IF9vbnJlYWR5c3RhdGVjaGFuZ2UuYXBwbHkobnVsbCwgYXJndW1lbnRzKSA6IHZvaWQgMDtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIERvY3VtZW50TW9uaXRvcjtcblxuICB9KSgpO1xuXG4gIEV2ZW50TGFnTW9uaXRvciA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBFdmVudExhZ01vbml0b3IoKSB7XG4gICAgICB2YXIgYXZnLCBpbnRlcnZhbCwgbGFzdCwgcG9pbnRzLCBzYW1wbGVzLFxuICAgICAgICBfdGhpcyA9IHRoaXM7XG4gICAgICB0aGlzLnByb2dyZXNzID0gMDtcbiAgICAgIGF2ZyA9IDA7XG4gICAgICBzYW1wbGVzID0gW107XG4gICAgICBwb2ludHMgPSAwO1xuICAgICAgbGFzdCA9IG5vdygpO1xuICAgICAgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRpZmY7XG4gICAgICAgIGRpZmYgPSBub3coKSAtIGxhc3QgLSA1MDtcbiAgICAgICAgbGFzdCA9IG5vdygpO1xuICAgICAgICBzYW1wbGVzLnB1c2goZGlmZik7XG4gICAgICAgIGlmIChzYW1wbGVzLmxlbmd0aCA+IG9wdGlvbnMuZXZlbnRMYWcuc2FtcGxlQ291bnQpIHtcbiAgICAgICAgICBzYW1wbGVzLnNoaWZ0KCk7XG4gICAgICAgIH1cbiAgICAgICAgYXZnID0gYXZnQW1wbGl0dWRlKHNhbXBsZXMpO1xuICAgICAgICBpZiAoKytwb2ludHMgPj0gb3B0aW9ucy5ldmVudExhZy5taW5TYW1wbGVzICYmIGF2ZyA8IG9wdGlvbnMuZXZlbnRMYWcubGFnVGhyZXNob2xkKSB7XG4gICAgICAgICAgX3RoaXMucHJvZ3Jlc3MgPSAxMDA7XG4gICAgICAgICAgcmV0dXJuIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5wcm9ncmVzcyA9IDEwMCAqICgzIC8gKGF2ZyArIDMpKTtcbiAgICAgICAgfVxuICAgICAgfSwgNTApO1xuICAgIH1cblxuICAgIHJldHVybiBFdmVudExhZ01vbml0b3I7XG5cbiAgfSkoKTtcblxuICBTY2FsZXIgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gU2NhbGVyKHNvdXJjZSkge1xuICAgICAgdGhpcy5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICB0aGlzLmxhc3QgPSB0aGlzLnNpbmNlTGFzdFVwZGF0ZSA9IDA7XG4gICAgICB0aGlzLnJhdGUgPSBvcHRpb25zLmluaXRpYWxSYXRlO1xuICAgICAgdGhpcy5jYXRjaHVwID0gMDtcbiAgICAgIHRoaXMucHJvZ3Jlc3MgPSB0aGlzLmxhc3RQcm9ncmVzcyA9IDA7XG4gICAgICBpZiAodGhpcy5zb3VyY2UgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLnByb2dyZXNzID0gcmVzdWx0KHRoaXMuc291cmNlLCAncHJvZ3Jlc3MnKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBTY2FsZXIucHJvdG90eXBlLnRpY2sgPSBmdW5jdGlvbihmcmFtZVRpbWUsIHZhbCkge1xuICAgICAgdmFyIHNjYWxpbmc7XG4gICAgICBpZiAodmFsID09IG51bGwpIHtcbiAgICAgICAgdmFsID0gcmVzdWx0KHRoaXMuc291cmNlLCAncHJvZ3Jlc3MnKTtcbiAgICAgIH1cbiAgICAgIGlmICh2YWwgPj0gMTAwKSB7XG4gICAgICAgIHRoaXMuZG9uZSA9IHRydWU7XG4gICAgICB9XG4gICAgICBpZiAodmFsID09PSB0aGlzLmxhc3QpIHtcbiAgICAgICAgdGhpcy5zaW5jZUxhc3RVcGRhdGUgKz0gZnJhbWVUaW1lO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMuc2luY2VMYXN0VXBkYXRlKSB7XG4gICAgICAgICAgdGhpcy5yYXRlID0gKHZhbCAtIHRoaXMubGFzdCkgLyB0aGlzLnNpbmNlTGFzdFVwZGF0ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNhdGNodXAgPSAodmFsIC0gdGhpcy5wcm9ncmVzcykgLyBvcHRpb25zLmNhdGNodXBUaW1lO1xuICAgICAgICB0aGlzLnNpbmNlTGFzdFVwZGF0ZSA9IDA7XG4gICAgICAgIHRoaXMubGFzdCA9IHZhbDtcbiAgICAgIH1cbiAgICAgIGlmICh2YWwgPiB0aGlzLnByb2dyZXNzKSB7XG4gICAgICAgIHRoaXMucHJvZ3Jlc3MgKz0gdGhpcy5jYXRjaHVwICogZnJhbWVUaW1lO1xuICAgICAgfVxuICAgICAgc2NhbGluZyA9IDEgLSBNYXRoLnBvdyh0aGlzLnByb2dyZXNzIC8gMTAwLCBvcHRpb25zLmVhc2VGYWN0b3IpO1xuICAgICAgdGhpcy5wcm9ncmVzcyArPSBzY2FsaW5nICogdGhpcy5yYXRlICogZnJhbWVUaW1lO1xuICAgICAgdGhpcy5wcm9ncmVzcyA9IE1hdGgubWluKHRoaXMubGFzdFByb2dyZXNzICsgb3B0aW9ucy5tYXhQcm9ncmVzc1BlckZyYW1lLCB0aGlzLnByb2dyZXNzKTtcbiAgICAgIHRoaXMucHJvZ3Jlc3MgPSBNYXRoLm1heCgwLCB0aGlzLnByb2dyZXNzKTtcbiAgICAgIHRoaXMucHJvZ3Jlc3MgPSBNYXRoLm1pbigxMDAsIHRoaXMucHJvZ3Jlc3MpO1xuICAgICAgdGhpcy5sYXN0UHJvZ3Jlc3MgPSB0aGlzLnByb2dyZXNzO1xuICAgICAgcmV0dXJuIHRoaXMucHJvZ3Jlc3M7XG4gICAgfTtcblxuICAgIHJldHVybiBTY2FsZXI7XG5cbiAgfSkoKTtcblxuICBzb3VyY2VzID0gbnVsbDtcblxuICBzY2FsZXJzID0gbnVsbDtcblxuICBiYXIgPSBudWxsO1xuXG4gIHVuaVNjYWxlciA9IG51bGw7XG5cbiAgYW5pbWF0aW9uID0gbnVsbDtcblxuICBjYW5jZWxBbmltYXRpb24gPSBudWxsO1xuXG4gIFBhY2UucnVubmluZyA9IGZhbHNlO1xuXG4gIGhhbmRsZVB1c2hTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChvcHRpb25zLnJlc3RhcnRPblB1c2hTdGF0ZSkge1xuICAgICAgcmV0dXJuIFBhY2UucmVzdGFydCgpO1xuICAgIH1cbiAgfTtcblxuICBpZiAod2luZG93Lmhpc3RvcnkucHVzaFN0YXRlICE9IG51bGwpIHtcbiAgICBfcHVzaFN0YXRlID0gd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlO1xuICAgIHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgaGFuZGxlUHVzaFN0YXRlKCk7XG4gICAgICByZXR1cm4gX3B1c2hTdGF0ZS5hcHBseSh3aW5kb3cuaGlzdG9yeSwgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG5cbiAgaWYgKHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZSAhPSBudWxsKSB7XG4gICAgX3JlcGxhY2VTdGF0ZSA9IHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZTtcbiAgICB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIGhhbmRsZVB1c2hTdGF0ZSgpO1xuICAgICAgcmV0dXJuIF9yZXBsYWNlU3RhdGUuYXBwbHkod2luZG93Lmhpc3RvcnksIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIFNPVVJDRV9LRVlTID0ge1xuICAgIGFqYXg6IEFqYXhNb25pdG9yLFxuICAgIGVsZW1lbnRzOiBFbGVtZW50TW9uaXRvcixcbiAgICBkb2N1bWVudDogRG9jdW1lbnRNb25pdG9yLFxuICAgIGV2ZW50TGFnOiBFdmVudExhZ01vbml0b3JcbiAgfTtcblxuICAoaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0eXBlLCBfaiwgX2ssIF9sZW4xLCBfbGVuMiwgX3JlZjIsIF9yZWYzLCBfcmVmNDtcbiAgICBQYWNlLnNvdXJjZXMgPSBzb3VyY2VzID0gW107XG4gICAgX3JlZjIgPSBbJ2FqYXgnLCAnZWxlbWVudHMnLCAnZG9jdW1lbnQnLCAnZXZlbnRMYWcnXTtcbiAgICBmb3IgKF9qID0gMCwgX2xlbjEgPSBfcmVmMi5sZW5ndGg7IF9qIDwgX2xlbjE7IF9qKyspIHtcbiAgICAgIHR5cGUgPSBfcmVmMltfal07XG4gICAgICBpZiAob3B0aW9uc1t0eXBlXSAhPT0gZmFsc2UpIHtcbiAgICAgICAgc291cmNlcy5wdXNoKG5ldyBTT1VSQ0VfS0VZU1t0eXBlXShvcHRpb25zW3R5cGVdKSk7XG4gICAgICB9XG4gICAgfVxuICAgIF9yZWY0ID0gKF9yZWYzID0gb3B0aW9ucy5leHRyYVNvdXJjZXMpICE9IG51bGwgPyBfcmVmMyA6IFtdO1xuICAgIGZvciAoX2sgPSAwLCBfbGVuMiA9IF9yZWY0Lmxlbmd0aDsgX2sgPCBfbGVuMjsgX2srKykge1xuICAgICAgc291cmNlID0gX3JlZjRbX2tdO1xuICAgICAgc291cmNlcy5wdXNoKG5ldyBzb3VyY2Uob3B0aW9ucykpO1xuICAgIH1cbiAgICBQYWNlLmJhciA9IGJhciA9IG5ldyBCYXI7XG4gICAgc2NhbGVycyA9IFtdO1xuICAgIHJldHVybiB1bmlTY2FsZXIgPSBuZXcgU2NhbGVyO1xuICB9KSgpO1xuXG4gIFBhY2Uuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgIFBhY2UudHJpZ2dlcignc3RvcCcpO1xuICAgIFBhY2UucnVubmluZyA9IGZhbHNlO1xuICAgIGJhci5kZXN0cm95KCk7XG4gICAgY2FuY2VsQW5pbWF0aW9uID0gdHJ1ZTtcbiAgICBpZiAoYW5pbWF0aW9uICE9IG51bGwpIHtcbiAgICAgIGlmICh0eXBlb2YgY2FuY2VsQW5pbWF0aW9uRnJhbWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZShhbmltYXRpb24pO1xuICAgICAgfVxuICAgICAgYW5pbWF0aW9uID0gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGluaXQoKTtcbiAgfTtcblxuICBQYWNlLnJlc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICBQYWNlLnRyaWdnZXIoJ3Jlc3RhcnQnKTtcbiAgICBQYWNlLnN0b3AoKTtcbiAgICByZXR1cm4gUGFjZS5zdGFydCgpO1xuICB9O1xuXG4gIFBhY2UuZ28gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RhcnQ7XG4gICAgUGFjZS5ydW5uaW5nID0gdHJ1ZTtcbiAgICBiYXIucmVuZGVyKCk7XG4gICAgc3RhcnQgPSBub3coKTtcbiAgICBjYW5jZWxBbmltYXRpb24gPSBmYWxzZTtcbiAgICByZXR1cm4gYW5pbWF0aW9uID0gcnVuQW5pbWF0aW9uKGZ1bmN0aW9uKGZyYW1lVGltZSwgZW5xdWV1ZU5leHRGcmFtZSkge1xuICAgICAgdmFyIGF2ZywgY291bnQsIGRvbmUsIGVsZW1lbnQsIGVsZW1lbnRzLCBpLCBqLCByZW1haW5pbmcsIHNjYWxlciwgc2NhbGVyTGlzdCwgc3VtLCBfaiwgX2ssIF9sZW4xLCBfbGVuMiwgX3JlZjI7XG4gICAgICByZW1haW5pbmcgPSAxMDAgLSBiYXIucHJvZ3Jlc3M7XG4gICAgICBjb3VudCA9IHN1bSA9IDA7XG4gICAgICBkb25lID0gdHJ1ZTtcbiAgICAgIGZvciAoaSA9IF9qID0gMCwgX2xlbjEgPSBzb3VyY2VzLmxlbmd0aDsgX2ogPCBfbGVuMTsgaSA9ICsrX2opIHtcbiAgICAgICAgc291cmNlID0gc291cmNlc1tpXTtcbiAgICAgICAgc2NhbGVyTGlzdCA9IHNjYWxlcnNbaV0gIT0gbnVsbCA/IHNjYWxlcnNbaV0gOiBzY2FsZXJzW2ldID0gW107XG4gICAgICAgIGVsZW1lbnRzID0gKF9yZWYyID0gc291cmNlLmVsZW1lbnRzKSAhPSBudWxsID8gX3JlZjIgOiBbc291cmNlXTtcbiAgICAgICAgZm9yIChqID0gX2sgPSAwLCBfbGVuMiA9IGVsZW1lbnRzLmxlbmd0aDsgX2sgPCBfbGVuMjsgaiA9ICsrX2spIHtcbiAgICAgICAgICBlbGVtZW50ID0gZWxlbWVudHNbal07XG4gICAgICAgICAgc2NhbGVyID0gc2NhbGVyTGlzdFtqXSAhPSBudWxsID8gc2NhbGVyTGlzdFtqXSA6IHNjYWxlckxpc3Rbal0gPSBuZXcgU2NhbGVyKGVsZW1lbnQpO1xuICAgICAgICAgIGRvbmUgJj0gc2NhbGVyLmRvbmU7XG4gICAgICAgICAgaWYgKHNjYWxlci5kb25lKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY291bnQrKztcbiAgICAgICAgICBzdW0gKz0gc2NhbGVyLnRpY2soZnJhbWVUaW1lKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYXZnID0gc3VtIC8gY291bnQ7XG4gICAgICBiYXIudXBkYXRlKHVuaVNjYWxlci50aWNrKGZyYW1lVGltZSwgYXZnKSk7XG4gICAgICBpZiAoYmFyLmRvbmUoKSB8fCBkb25lIHx8IGNhbmNlbEFuaW1hdGlvbikge1xuICAgICAgICBiYXIudXBkYXRlKDEwMCk7XG4gICAgICAgIFBhY2UudHJpZ2dlcignZG9uZScpO1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICBiYXIuZmluaXNoKCk7XG4gICAgICAgICAgUGFjZS5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgcmV0dXJuIFBhY2UudHJpZ2dlcignaGlkZScpO1xuICAgICAgICB9LCBNYXRoLm1heChvcHRpb25zLmdob3N0VGltZSwgTWF0aC5tYXgob3B0aW9ucy5taW5UaW1lIC0gKG5vdygpIC0gc3RhcnQpLCAwKSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGVucXVldWVOZXh0RnJhbWUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBQYWNlLnN0YXJ0ID0gZnVuY3Rpb24oX29wdGlvbnMpIHtcbiAgICBleHRlbmQob3B0aW9ucywgX29wdGlvbnMpO1xuICAgIFBhY2UucnVubmluZyA9IHRydWU7XG4gICAgdHJ5IHtcbiAgICAgIGJhci5yZW5kZXIoKTtcbiAgICB9IGNhdGNoIChfZXJyb3IpIHtcbiAgICAgIE5vVGFyZ2V0RXJyb3IgPSBfZXJyb3I7XG4gICAgfVxuICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBhY2UnKSkge1xuICAgICAgcmV0dXJuIHNldFRpbWVvdXQoUGFjZS5zdGFydCwgNTApO1xuICAgIH0gZWxzZSB7XG4gICAgICBQYWNlLnRyaWdnZXIoJ3N0YXJ0Jyk7XG4gICAgICByZXR1cm4gUGFjZS5nbygpO1xuICAgIH1cbiAgfTtcblxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKFsncGFjZSddLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBQYWNlO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gUGFjZTtcbiAgfSBlbHNlIHtcbiAgICBpZiAob3B0aW9ucy5zdGFydE9uUGFnZUxvYWQpIHtcbiAgICAgIFBhY2Uuc3RhcnQoKTtcbiAgICB9XG4gIH1cblxufSkuY2FsbCh0aGlzKTtcbiIsImpRdWVyeShmdW5jdGlvbigkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gRmxleHkgaGVhZGVyXG4gICAgZmxleHlfaGVhZGVyLmluaXQoKTtcblxuICAgIC8vIEZsZXh5IG5hdmlnYXRpb25cbiAgICBmbGV4eV9uYXZpZ2F0aW9uLmluaXQoKTtcblxuICAgIC8vIFNpZHJcbiAgICAkKCcuc2lkci1yaWdodF9fdG9nZ2xlJykuc2lkcih7XG4gICAgICAgIG5hbWU6ICdzaWRyLW1haW4nLFxuICAgICAgICBzaWRlOiAncmlnaHQnLFxuICAgICAgICByZW5hbWluZzogZmFsc2UsXG4gICAgICAgIGJvZHk6ICcubGF5b3V0X193cmFwcGVyJyxcbiAgICAgICAgc291cmNlOiAnLnNpZHItc291cmNlLXByb3ZpZGVyJ1xuICAgIH0pO1xuXG4gICAgLy8gU2xpbmt5XG4gICAgJCgnLnNpZHIgLnNsaW5reS1tZW51Jykuc2xpbmt5KHtcbiAgICAgICAgdGl0bGU6IHRydWUsXG4gICAgICAgIGxhYmVsOiAnJ1xuICAgIH0pO1xuXG4gICAgLy8gRW5hYmxlIC8gZGlzYWJsZSBCb290c3RyYXAgdG9vbHRpcHMsIGJhc2VkIHVwb24gdG91Y2ggZXZlbnRzXG4gICAgaWYoTW9kZXJuaXpyLnRvdWNoZXZlbnRzKSB7XG4gICAgICAgICQoJ1tkYXRhLXRvZ2dsZT10b29sdGlwXScpLnRvb2x0aXAoJ2hpZGUnKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgICQoJ1tkYXRhLXRvZ2dsZT10b29sdGlwXScpLnRvb2x0aXAoKTtcbiAgICB9XG59KTtcbiJdfQ==
