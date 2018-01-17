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

    // Enable / disable Bootstrap tooltips, based upon touch events

    if (Modernizr.touchevents) {
        $('[data-toggle=tooltip]').tooltip('hide');
    } else {
        $('[data-toggle=tooltip]').tooltip();
    }
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRvb2x0aXAuanMiLCJwYWNlLmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIiQiLCJUb29sdGlwIiwiZWxlbWVudCIsIm9wdGlvbnMiLCJ0eXBlIiwiZW5hYmxlZCIsInRpbWVvdXQiLCJob3ZlclN0YXRlIiwiJGVsZW1lbnQiLCJpblN0YXRlIiwiaW5pdCIsIlZFUlNJT04iLCJUUkFOU0lUSU9OX0RVUkFUSU9OIiwiREVGQVVMVFMiLCJhbmltYXRpb24iLCJwbGFjZW1lbnQiLCJzZWxlY3RvciIsInRlbXBsYXRlIiwidHJpZ2dlciIsInRpdGxlIiwiZGVsYXkiLCJodG1sIiwiY29udGFpbmVyIiwidmlld3BvcnQiLCJwYWRkaW5nIiwicHJvdG90eXBlIiwiZ2V0T3B0aW9ucyIsIiR2aWV3cG9ydCIsImlzRnVuY3Rpb24iLCJjYWxsIiwiY2xpY2siLCJob3ZlciIsImZvY3VzIiwiZG9jdW1lbnQiLCJjb25zdHJ1Y3RvciIsIkVycm9yIiwidHJpZ2dlcnMiLCJzcGxpdCIsImkiLCJsZW5ndGgiLCJvbiIsInByb3h5IiwidG9nZ2xlIiwiZXZlbnRJbiIsImV2ZW50T3V0IiwiZW50ZXIiLCJsZWF2ZSIsIl9vcHRpb25zIiwiZXh0ZW5kIiwiZml4VGl0bGUiLCJnZXREZWZhdWx0cyIsImRhdGEiLCJzaG93IiwiaGlkZSIsImdldERlbGVnYXRlT3B0aW9ucyIsImRlZmF1bHRzIiwiZWFjaCIsImtleSIsInZhbHVlIiwib2JqIiwic2VsZiIsImN1cnJlbnRUYXJnZXQiLCJFdmVudCIsInRpcCIsImhhc0NsYXNzIiwiY2xlYXJUaW1lb3V0Iiwic2V0VGltZW91dCIsImlzSW5TdGF0ZVRydWUiLCJlIiwiaGFzQ29udGVudCIsImluRG9tIiwiY29udGFpbnMiLCJvd25lckRvY3VtZW50IiwiZG9jdW1lbnRFbGVtZW50IiwiaXNEZWZhdWx0UHJldmVudGVkIiwidGhhdCIsIiR0aXAiLCJ0aXBJZCIsImdldFVJRCIsInNldENvbnRlbnQiLCJhdHRyIiwiYWRkQ2xhc3MiLCJhdXRvVG9rZW4iLCJhdXRvUGxhY2UiLCJ0ZXN0IiwicmVwbGFjZSIsImRldGFjaCIsImNzcyIsInRvcCIsImxlZnQiLCJkaXNwbGF5IiwiYXBwZW5kVG8iLCJpbnNlcnRBZnRlciIsInBvcyIsImdldFBvc2l0aW9uIiwiYWN0dWFsV2lkdGgiLCJvZmZzZXRXaWR0aCIsImFjdHVhbEhlaWdodCIsIm9mZnNldEhlaWdodCIsIm9yZ1BsYWNlbWVudCIsInZpZXdwb3J0RGltIiwiYm90dG9tIiwicmlnaHQiLCJ3aWR0aCIsInJlbW92ZUNsYXNzIiwiY2FsY3VsYXRlZE9mZnNldCIsImdldENhbGN1bGF0ZWRPZmZzZXQiLCJhcHBseVBsYWNlbWVudCIsImNvbXBsZXRlIiwicHJldkhvdmVyU3RhdGUiLCJzdXBwb3J0IiwidHJhbnNpdGlvbiIsIm9uZSIsImVtdWxhdGVUcmFuc2l0aW9uRW5kIiwib2Zmc2V0IiwiaGVpZ2h0IiwibWFyZ2luVG9wIiwicGFyc2VJbnQiLCJtYXJnaW5MZWZ0IiwiaXNOYU4iLCJzZXRPZmZzZXQiLCJ1c2luZyIsInByb3BzIiwiTWF0aCIsInJvdW5kIiwiZGVsdGEiLCJnZXRWaWV3cG9ydEFkanVzdGVkRGVsdGEiLCJpc1ZlcnRpY2FsIiwiYXJyb3dEZWx0YSIsImFycm93T2Zmc2V0UG9zaXRpb24iLCJyZXBsYWNlQXJyb3ciLCJkaW1lbnNpb24iLCJhcnJvdyIsImdldFRpdGxlIiwiZmluZCIsImNhbGxiYWNrIiwicmVtb3ZlQXR0ciIsIiRlIiwiZWwiLCJpc0JvZHkiLCJ0YWdOYW1lIiwiZWxSZWN0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiaXNTdmciLCJ3aW5kb3ciLCJTVkdFbGVtZW50IiwiZWxPZmZzZXQiLCJzY3JvbGwiLCJzY3JvbGxUb3AiLCJib2R5Iiwib3V0ZXJEaW1zIiwidmlld3BvcnRQYWRkaW5nIiwidmlld3BvcnREaW1lbnNpb25zIiwidG9wRWRnZU9mZnNldCIsImJvdHRvbUVkZ2VPZmZzZXQiLCJsZWZ0RWRnZU9mZnNldCIsInJpZ2h0RWRnZU9mZnNldCIsIm8iLCJwcmVmaXgiLCJyYW5kb20iLCJnZXRFbGVtZW50QnlJZCIsIiRhcnJvdyIsImVuYWJsZSIsImRpc2FibGUiLCJ0b2dnbGVFbmFibGVkIiwiZGVzdHJveSIsIm9mZiIsInJlbW92ZURhdGEiLCJQbHVnaW4iLCJvcHRpb24iLCIkdGhpcyIsIm9sZCIsImZuIiwidG9vbHRpcCIsIkNvbnN0cnVjdG9yIiwibm9Db25mbGljdCIsImpRdWVyeSIsIkFqYXhNb25pdG9yIiwiQmFyIiwiRG9jdW1lbnRNb25pdG9yIiwiRWxlbWVudE1vbml0b3IiLCJFbGVtZW50VHJhY2tlciIsIkV2ZW50TGFnTW9uaXRvciIsIkV2ZW50ZWQiLCJFdmVudHMiLCJOb1RhcmdldEVycm9yIiwiUGFjZSIsIlJlcXVlc3RJbnRlcmNlcHQiLCJTT1VSQ0VfS0VZUyIsIlNjYWxlciIsIlNvY2tldFJlcXVlc3RUcmFja2VyIiwiWEhSUmVxdWVzdFRyYWNrZXIiLCJhdmdBbXBsaXR1ZGUiLCJiYXIiLCJjYW5jZWxBbmltYXRpb24iLCJjYW5jZWxBbmltYXRpb25GcmFtZSIsImRlZmF1bHRPcHRpb25zIiwiZXh0ZW5kTmF0aXZlIiwiZ2V0RnJvbURPTSIsImdldEludGVyY2VwdCIsImhhbmRsZVB1c2hTdGF0ZSIsImlnbm9yZVN0YWNrIiwibm93IiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwicmVzdWx0IiwicnVuQW5pbWF0aW9uIiwic2NhbGVycyIsInNob3VsZElnbm9yZVVSTCIsInNob3VsZFRyYWNrIiwic291cmNlIiwic291cmNlcyIsInVuaVNjYWxlciIsIl9XZWJTb2NrZXQiLCJfWERvbWFpblJlcXVlc3QiLCJfWE1MSHR0cFJlcXVlc3QiLCJfaSIsIl9pbnRlcmNlcHQiLCJfbGVuIiwiX3B1c2hTdGF0ZSIsIl9yZWYiLCJfcmVmMSIsIl9yZXBsYWNlU3RhdGUiLCJfX3NsaWNlIiwic2xpY2UiLCJfX2hhc1Byb3AiLCJoYXNPd25Qcm9wZXJ0eSIsIl9fZXh0ZW5kcyIsImNoaWxkIiwicGFyZW50IiwiY3RvciIsIl9fc3VwZXJfXyIsIl9faW5kZXhPZiIsImluZGV4T2YiLCJpdGVtIiwibCIsImNhdGNodXBUaW1lIiwiaW5pdGlhbFJhdGUiLCJtaW5UaW1lIiwiZ2hvc3RUaW1lIiwibWF4UHJvZ3Jlc3NQZXJGcmFtZSIsImVhc2VGYWN0b3IiLCJzdGFydE9uUGFnZUxvYWQiLCJyZXN0YXJ0T25QdXNoU3RhdGUiLCJyZXN0YXJ0T25SZXF1ZXN0QWZ0ZXIiLCJ0YXJnZXQiLCJlbGVtZW50cyIsImNoZWNrSW50ZXJ2YWwiLCJzZWxlY3RvcnMiLCJldmVudExhZyIsIm1pblNhbXBsZXMiLCJzYW1wbGVDb3VudCIsImxhZ1RocmVzaG9sZCIsImFqYXgiLCJ0cmFja01ldGhvZHMiLCJ0cmFja1dlYlNvY2tldHMiLCJpZ25vcmVVUkxzIiwicGVyZm9ybWFuY2UiLCJEYXRlIiwibW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwid2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwibXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJtb3pDYW5jZWxBbmltYXRpb25GcmFtZSIsImlkIiwibGFzdCIsInRpY2siLCJkaWZmIiwiYXJncyIsImFyZ3VtZW50cyIsImFwcGx5Iiwib3V0IiwidmFsIiwiYXJyIiwiY291bnQiLCJzdW0iLCJ2IiwiYWJzIiwianNvbiIsInF1ZXJ5U2VsZWN0b3IiLCJnZXRBdHRyaWJ1dGUiLCJKU09OIiwicGFyc2UiLCJfZXJyb3IiLCJjb25zb2xlIiwiZXJyb3IiLCJldmVudCIsImhhbmRsZXIiLCJjdHgiLCJvbmNlIiwiX2Jhc2UiLCJiaW5kaW5ncyIsInB1c2giLCJfcmVzdWx0cyIsInNwbGljZSIsInBhY2VPcHRpb25zIiwiX3N1cGVyIiwicHJvZ3Jlc3MiLCJnZXRFbGVtZW50IiwidGFyZ2V0RWxlbWVudCIsImNyZWF0ZUVsZW1lbnQiLCJjbGFzc05hbWUiLCJpbm5lckhUTUwiLCJmaXJzdENoaWxkIiwiaW5zZXJ0QmVmb3JlIiwiYXBwZW5kQ2hpbGQiLCJmaW5pc2giLCJ1cGRhdGUiLCJwcm9nIiwicmVuZGVyIiwicGFyZW50Tm9kZSIsInJlbW92ZUNoaWxkIiwicHJvZ3Jlc3NTdHIiLCJ0cmFuc2Zvcm0iLCJfaiIsIl9sZW4xIiwiX3JlZjIiLCJjaGlsZHJlbiIsInN0eWxlIiwibGFzdFJlbmRlcmVkUHJvZ3Jlc3MiLCJzZXRBdHRyaWJ1dGUiLCJkb25lIiwibmFtZSIsImJpbmRpbmciLCJYTUxIdHRwUmVxdWVzdCIsIlhEb21haW5SZXF1ZXN0IiwiV2ViU29ja2V0IiwidG8iLCJmcm9tIiwiT2JqZWN0IiwiZGVmaW5lUHJvcGVydHkiLCJnZXQiLCJjb25maWd1cmFibGUiLCJlbnVtZXJhYmxlIiwiaWdub3JlIiwicmV0IiwidW5zaGlmdCIsInNoaWZ0IiwidHJhY2siLCJtZXRob2QiLCJ0b1VwcGVyQ2FzZSIsIm1vbml0b3JYSFIiLCJfdGhpcyIsInJlcSIsIl9vcGVuIiwib3BlbiIsInVybCIsImFzeW5jIiwicmVxdWVzdCIsImZsYWdzIiwicHJvdG9jb2xzIiwicGF0dGVybiIsIl9hcmciLCJhZnRlciIsInJ1bm5pbmciLCJzdGlsbEFjdGl2ZSIsIl9yZWYzIiwicmVhZHlTdGF0ZSIsInJlc3RhcnQiLCJ3YXRjaCIsInRyYWNrZXIiLCJzaXplIiwiX29ucmVhZHlzdGF0ZWNoYW5nZSIsIlByb2dyZXNzRXZlbnQiLCJhZGRFdmVudExpc3RlbmVyIiwiZXZ0IiwibGVuZ3RoQ29tcHV0YWJsZSIsImxvYWRlZCIsInRvdGFsIiwib25yZWFkeXN0YXRlY2hhbmdlIiwiY2hlY2siLCJzdGF0ZXMiLCJsb2FkaW5nIiwiaW50ZXJhY3RpdmUiLCJhdmciLCJpbnRlcnZhbCIsInBvaW50cyIsInNhbXBsZXMiLCJzZXRJbnRlcnZhbCIsImNsZWFySW50ZXJ2YWwiLCJzaW5jZUxhc3RVcGRhdGUiLCJyYXRlIiwiY2F0Y2h1cCIsImxhc3RQcm9ncmVzcyIsImZyYW1lVGltZSIsInNjYWxpbmciLCJwb3ciLCJtaW4iLCJtYXgiLCJoaXN0b3J5IiwicHVzaFN0YXRlIiwicmVwbGFjZVN0YXRlIiwiX2siLCJfbGVuMiIsIl9yZWY0IiwiZXh0cmFTb3VyY2VzIiwic3RvcCIsInN0YXJ0IiwiZ28iLCJlbnF1ZXVlTmV4dEZyYW1lIiwiaiIsInJlbWFpbmluZyIsInNjYWxlciIsInNjYWxlckxpc3QiLCJkZWZpbmUiLCJhbWQiLCJleHBvcnRzIiwibW9kdWxlIiwiTW9kZXJuaXpyIiwidG91Y2hldmVudHMiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7Ozs7Ozs7O0FBVUEsQ0FBQyxVQUFVQSxDQUFWLEVBQWE7QUFDWjs7QUFFQTtBQUNBOztBQUVBLE1BQUlDLFVBQVUsU0FBVkEsT0FBVSxDQUFVQyxPQUFWLEVBQW1CQyxPQUFuQixFQUE0QjtBQUN4QyxTQUFLQyxJQUFMLEdBQWtCLElBQWxCO0FBQ0EsU0FBS0QsT0FBTCxHQUFrQixJQUFsQjtBQUNBLFNBQUtFLE9BQUwsR0FBa0IsSUFBbEI7QUFDQSxTQUFLQyxPQUFMLEdBQWtCLElBQWxCO0FBQ0EsU0FBS0MsVUFBTCxHQUFrQixJQUFsQjtBQUNBLFNBQUtDLFFBQUwsR0FBa0IsSUFBbEI7QUFDQSxTQUFLQyxPQUFMLEdBQWtCLElBQWxCOztBQUVBLFNBQUtDLElBQUwsQ0FBVSxTQUFWLEVBQXFCUixPQUFyQixFQUE4QkMsT0FBOUI7QUFDRCxHQVZEOztBQVlBRixVQUFRVSxPQUFSLEdBQW1CLE9BQW5COztBQUVBVixVQUFRVyxtQkFBUixHQUE4QixHQUE5Qjs7QUFFQVgsVUFBUVksUUFBUixHQUFtQjtBQUNqQkMsZUFBVyxJQURNO0FBRWpCQyxlQUFXLEtBRk07QUFHakJDLGNBQVUsS0FITztBQUlqQkMsY0FBVSw4R0FKTztBQUtqQkMsYUFBUyxhQUxRO0FBTWpCQyxXQUFPLEVBTlU7QUFPakJDLFdBQU8sQ0FQVTtBQVFqQkMsVUFBTSxLQVJXO0FBU2pCQyxlQUFXLEtBVE07QUFVakJDLGNBQVU7QUFDUlAsZ0JBQVUsTUFERjtBQUVSUSxlQUFTO0FBRkQ7QUFWTyxHQUFuQjs7QUFnQkF2QixVQUFRd0IsU0FBUixDQUFrQmYsSUFBbEIsR0FBeUIsVUFBVU4sSUFBVixFQUFnQkYsT0FBaEIsRUFBeUJDLE9BQXpCLEVBQWtDO0FBQ3pELFNBQUtFLE9BQUwsR0FBaUIsSUFBakI7QUFDQSxTQUFLRCxJQUFMLEdBQWlCQSxJQUFqQjtBQUNBLFNBQUtJLFFBQUwsR0FBaUJSLEVBQUVFLE9BQUYsQ0FBakI7QUFDQSxTQUFLQyxPQUFMLEdBQWlCLEtBQUt1QixVQUFMLENBQWdCdkIsT0FBaEIsQ0FBakI7QUFDQSxTQUFLd0IsU0FBTCxHQUFpQixLQUFLeEIsT0FBTCxDQUFhb0IsUUFBYixJQUF5QnZCLEVBQUVBLEVBQUU0QixVQUFGLENBQWEsS0FBS3pCLE9BQUwsQ0FBYW9CLFFBQTFCLElBQXNDLEtBQUtwQixPQUFMLENBQWFvQixRQUFiLENBQXNCTSxJQUF0QixDQUEyQixJQUEzQixFQUFpQyxLQUFLckIsUUFBdEMsQ0FBdEMsR0FBeUYsS0FBS0wsT0FBTCxDQUFhb0IsUUFBYixDQUFzQlAsUUFBdEIsSUFBa0MsS0FBS2IsT0FBTCxDQUFhb0IsUUFBMUksQ0FBMUM7QUFDQSxTQUFLZCxPQUFMLEdBQWlCLEVBQUVxQixPQUFPLEtBQVQsRUFBZ0JDLE9BQU8sS0FBdkIsRUFBOEJDLE9BQU8sS0FBckMsRUFBakI7O0FBRUEsUUFBSSxLQUFLeEIsUUFBTCxDQUFjLENBQWQsYUFBNEJ5QixTQUFTQyxXQUFyQyxJQUFvRCxDQUFDLEtBQUsvQixPQUFMLENBQWFhLFFBQXRFLEVBQWdGO0FBQzlFLFlBQU0sSUFBSW1CLEtBQUosQ0FBVSwyREFBMkQsS0FBSy9CLElBQWhFLEdBQXVFLGlDQUFqRixDQUFOO0FBQ0Q7O0FBRUQsUUFBSWdDLFdBQVcsS0FBS2pDLE9BQUwsQ0FBYWUsT0FBYixDQUFxQm1CLEtBQXJCLENBQTJCLEdBQTNCLENBQWY7O0FBRUEsU0FBSyxJQUFJQyxJQUFJRixTQUFTRyxNQUF0QixFQUE4QkQsR0FBOUIsR0FBb0M7QUFDbEMsVUFBSXBCLFVBQVVrQixTQUFTRSxDQUFULENBQWQ7O0FBRUEsVUFBSXBCLFdBQVcsT0FBZixFQUF3QjtBQUN0QixhQUFLVixRQUFMLENBQWNnQyxFQUFkLENBQWlCLFdBQVcsS0FBS3BDLElBQWpDLEVBQXVDLEtBQUtELE9BQUwsQ0FBYWEsUUFBcEQsRUFBOERoQixFQUFFeUMsS0FBRixDQUFRLEtBQUtDLE1BQWIsRUFBcUIsSUFBckIsQ0FBOUQ7QUFDRCxPQUZELE1BRU8sSUFBSXhCLFdBQVcsUUFBZixFQUF5QjtBQUM5QixZQUFJeUIsVUFBV3pCLFdBQVcsT0FBWCxHQUFxQixZQUFyQixHQUFvQyxTQUFuRDtBQUNBLFlBQUkwQixXQUFXMUIsV0FBVyxPQUFYLEdBQXFCLFlBQXJCLEdBQW9DLFVBQW5EOztBQUVBLGFBQUtWLFFBQUwsQ0FBY2dDLEVBQWQsQ0FBaUJHLFVBQVcsR0FBWCxHQUFpQixLQUFLdkMsSUFBdkMsRUFBNkMsS0FBS0QsT0FBTCxDQUFhYSxRQUExRCxFQUFvRWhCLEVBQUV5QyxLQUFGLENBQVEsS0FBS0ksS0FBYixFQUFvQixJQUFwQixDQUFwRTtBQUNBLGFBQUtyQyxRQUFMLENBQWNnQyxFQUFkLENBQWlCSSxXQUFXLEdBQVgsR0FBaUIsS0FBS3hDLElBQXZDLEVBQTZDLEtBQUtELE9BQUwsQ0FBYWEsUUFBMUQsRUFBb0VoQixFQUFFeUMsS0FBRixDQUFRLEtBQUtLLEtBQWIsRUFBb0IsSUFBcEIsQ0FBcEU7QUFDRDtBQUNGOztBQUVELFNBQUszQyxPQUFMLENBQWFhLFFBQWIsR0FDRyxLQUFLK0IsUUFBTCxHQUFnQi9DLEVBQUVnRCxNQUFGLENBQVMsRUFBVCxFQUFhLEtBQUs3QyxPQUFsQixFQUEyQixFQUFFZSxTQUFTLFFBQVgsRUFBcUJGLFVBQVUsRUFBL0IsRUFBM0IsQ0FEbkIsR0FFRSxLQUFLaUMsUUFBTCxFQUZGO0FBR0QsR0EvQkQ7O0FBaUNBaEQsVUFBUXdCLFNBQVIsQ0FBa0J5QixXQUFsQixHQUFnQyxZQUFZO0FBQzFDLFdBQU9qRCxRQUFRWSxRQUFmO0FBQ0QsR0FGRDs7QUFJQVosVUFBUXdCLFNBQVIsQ0FBa0JDLFVBQWxCLEdBQStCLFVBQVV2QixPQUFWLEVBQW1CO0FBQ2hEQSxjQUFVSCxFQUFFZ0QsTUFBRixDQUFTLEVBQVQsRUFBYSxLQUFLRSxXQUFMLEVBQWIsRUFBaUMsS0FBSzFDLFFBQUwsQ0FBYzJDLElBQWQsRUFBakMsRUFBdURoRCxPQUF2RCxDQUFWOztBQUVBLFFBQUlBLFFBQVFpQixLQUFSLElBQWlCLE9BQU9qQixRQUFRaUIsS0FBZixJQUF3QixRQUE3QyxFQUF1RDtBQUNyRGpCLGNBQVFpQixLQUFSLEdBQWdCO0FBQ2RnQyxjQUFNakQsUUFBUWlCLEtBREE7QUFFZGlDLGNBQU1sRCxRQUFRaUI7QUFGQSxPQUFoQjtBQUlEOztBQUVELFdBQU9qQixPQUFQO0FBQ0QsR0FYRDs7QUFhQUYsVUFBUXdCLFNBQVIsQ0FBa0I2QixrQkFBbEIsR0FBdUMsWUFBWTtBQUNqRCxRQUFJbkQsVUFBVyxFQUFmO0FBQ0EsUUFBSW9ELFdBQVcsS0FBS0wsV0FBTCxFQUFmOztBQUVBLFNBQUtILFFBQUwsSUFBaUIvQyxFQUFFd0QsSUFBRixDQUFPLEtBQUtULFFBQVosRUFBc0IsVUFBVVUsR0FBVixFQUFlQyxLQUFmLEVBQXNCO0FBQzNELFVBQUlILFNBQVNFLEdBQVQsS0FBaUJDLEtBQXJCLEVBQTRCdkQsUUFBUXNELEdBQVIsSUFBZUMsS0FBZjtBQUM3QixLQUZnQixDQUFqQjs7QUFJQSxXQUFPdkQsT0FBUDtBQUNELEdBVEQ7O0FBV0FGLFVBQVF3QixTQUFSLENBQWtCb0IsS0FBbEIsR0FBMEIsVUFBVWMsR0FBVixFQUFlO0FBQ3ZDLFFBQUlDLE9BQU9ELGVBQWUsS0FBS3pCLFdBQXBCLEdBQ1R5QixHQURTLEdBQ0gzRCxFQUFFMkQsSUFBSUUsYUFBTixFQUFxQlYsSUFBckIsQ0FBMEIsUUFBUSxLQUFLL0MsSUFBdkMsQ0FEUjs7QUFHQSxRQUFJLENBQUN3RCxJQUFMLEVBQVc7QUFDVEEsYUFBTyxJQUFJLEtBQUsxQixXQUFULENBQXFCeUIsSUFBSUUsYUFBekIsRUFBd0MsS0FBS1Asa0JBQUwsRUFBeEMsQ0FBUDtBQUNBdEQsUUFBRTJELElBQUlFLGFBQU4sRUFBcUJWLElBQXJCLENBQTBCLFFBQVEsS0FBSy9DLElBQXZDLEVBQTZDd0QsSUFBN0M7QUFDRDs7QUFFRCxRQUFJRCxlQUFlM0QsRUFBRThELEtBQXJCLEVBQTRCO0FBQzFCRixXQUFLbkQsT0FBTCxDQUFha0QsSUFBSXZELElBQUosSUFBWSxTQUFaLEdBQXdCLE9BQXhCLEdBQWtDLE9BQS9DLElBQTBELElBQTFEO0FBQ0Q7O0FBRUQsUUFBSXdELEtBQUtHLEdBQUwsR0FBV0MsUUFBWCxDQUFvQixJQUFwQixLQUE2QkosS0FBS3JELFVBQUwsSUFBbUIsSUFBcEQsRUFBMEQ7QUFDeERxRCxXQUFLckQsVUFBTCxHQUFrQixJQUFsQjtBQUNBO0FBQ0Q7O0FBRUQwRCxpQkFBYUwsS0FBS3RELE9BQWxCOztBQUVBc0QsU0FBS3JELFVBQUwsR0FBa0IsSUFBbEI7O0FBRUEsUUFBSSxDQUFDcUQsS0FBS3pELE9BQUwsQ0FBYWlCLEtBQWQsSUFBdUIsQ0FBQ3dDLEtBQUt6RCxPQUFMLENBQWFpQixLQUFiLENBQW1CZ0MsSUFBL0MsRUFBcUQsT0FBT1EsS0FBS1IsSUFBTCxFQUFQOztBQUVyRFEsU0FBS3RELE9BQUwsR0FBZTRELFdBQVcsWUFBWTtBQUNwQyxVQUFJTixLQUFLckQsVUFBTCxJQUFtQixJQUF2QixFQUE2QnFELEtBQUtSLElBQUw7QUFDOUIsS0FGYyxFQUVaUSxLQUFLekQsT0FBTCxDQUFhaUIsS0FBYixDQUFtQmdDLElBRlAsQ0FBZjtBQUdELEdBM0JEOztBQTZCQW5ELFVBQVF3QixTQUFSLENBQWtCMEMsYUFBbEIsR0FBa0MsWUFBWTtBQUM1QyxTQUFLLElBQUlWLEdBQVQsSUFBZ0IsS0FBS2hELE9BQXJCLEVBQThCO0FBQzVCLFVBQUksS0FBS0EsT0FBTCxDQUFhZ0QsR0FBYixDQUFKLEVBQXVCLE9BQU8sSUFBUDtBQUN4Qjs7QUFFRCxXQUFPLEtBQVA7QUFDRCxHQU5EOztBQVFBeEQsVUFBUXdCLFNBQVIsQ0FBa0JxQixLQUFsQixHQUEwQixVQUFVYSxHQUFWLEVBQWU7QUFDdkMsUUFBSUMsT0FBT0QsZUFBZSxLQUFLekIsV0FBcEIsR0FDVHlCLEdBRFMsR0FDSDNELEVBQUUyRCxJQUFJRSxhQUFOLEVBQXFCVixJQUFyQixDQUEwQixRQUFRLEtBQUsvQyxJQUF2QyxDQURSOztBQUdBLFFBQUksQ0FBQ3dELElBQUwsRUFBVztBQUNUQSxhQUFPLElBQUksS0FBSzFCLFdBQVQsQ0FBcUJ5QixJQUFJRSxhQUF6QixFQUF3QyxLQUFLUCxrQkFBTCxFQUF4QyxDQUFQO0FBQ0F0RCxRQUFFMkQsSUFBSUUsYUFBTixFQUFxQlYsSUFBckIsQ0FBMEIsUUFBUSxLQUFLL0MsSUFBdkMsRUFBNkN3RCxJQUE3QztBQUNEOztBQUVELFFBQUlELGVBQWUzRCxFQUFFOEQsS0FBckIsRUFBNEI7QUFDMUJGLFdBQUtuRCxPQUFMLENBQWFrRCxJQUFJdkQsSUFBSixJQUFZLFVBQVosR0FBeUIsT0FBekIsR0FBbUMsT0FBaEQsSUFBMkQsS0FBM0Q7QUFDRDs7QUFFRCxRQUFJd0QsS0FBS08sYUFBTCxFQUFKLEVBQTBCOztBQUUxQkYsaUJBQWFMLEtBQUt0RCxPQUFsQjs7QUFFQXNELFNBQUtyRCxVQUFMLEdBQWtCLEtBQWxCOztBQUVBLFFBQUksQ0FBQ3FELEtBQUt6RCxPQUFMLENBQWFpQixLQUFkLElBQXVCLENBQUN3QyxLQUFLekQsT0FBTCxDQUFhaUIsS0FBYixDQUFtQmlDLElBQS9DLEVBQXFELE9BQU9PLEtBQUtQLElBQUwsRUFBUDs7QUFFckRPLFNBQUt0RCxPQUFMLEdBQWU0RCxXQUFXLFlBQVk7QUFDcEMsVUFBSU4sS0FBS3JELFVBQUwsSUFBbUIsS0FBdkIsRUFBOEJxRCxLQUFLUCxJQUFMO0FBQy9CLEtBRmMsRUFFWk8sS0FBS3pELE9BQUwsQ0FBYWlCLEtBQWIsQ0FBbUJpQyxJQUZQLENBQWY7QUFHRCxHQXhCRDs7QUEwQkFwRCxVQUFRd0IsU0FBUixDQUFrQjJCLElBQWxCLEdBQXlCLFlBQVk7QUFDbkMsUUFBSWdCLElBQUlwRSxFQUFFOEQsS0FBRixDQUFRLGFBQWEsS0FBSzFELElBQTFCLENBQVI7O0FBRUEsUUFBSSxLQUFLaUUsVUFBTCxNQUFxQixLQUFLaEUsT0FBOUIsRUFBdUM7QUFDckMsV0FBS0csUUFBTCxDQUFjVSxPQUFkLENBQXNCa0QsQ0FBdEI7O0FBRUEsVUFBSUUsUUFBUXRFLEVBQUV1RSxRQUFGLENBQVcsS0FBSy9ELFFBQUwsQ0FBYyxDQUFkLEVBQWlCZ0UsYUFBakIsQ0FBK0JDLGVBQTFDLEVBQTJELEtBQUtqRSxRQUFMLENBQWMsQ0FBZCxDQUEzRCxDQUFaO0FBQ0EsVUFBSTRELEVBQUVNLGtCQUFGLE1BQTBCLENBQUNKLEtBQS9CLEVBQXNDO0FBQ3RDLFVBQUlLLE9BQU8sSUFBWDs7QUFFQSxVQUFJQyxPQUFPLEtBQUtiLEdBQUwsRUFBWDs7QUFFQSxVQUFJYyxRQUFRLEtBQUtDLE1BQUwsQ0FBWSxLQUFLMUUsSUFBakIsQ0FBWjs7QUFFQSxXQUFLMkUsVUFBTDtBQUNBSCxXQUFLSSxJQUFMLENBQVUsSUFBVixFQUFnQkgsS0FBaEI7QUFDQSxXQUFLckUsUUFBTCxDQUFjd0UsSUFBZCxDQUFtQixrQkFBbkIsRUFBdUNILEtBQXZDOztBQUVBLFVBQUksS0FBSzFFLE9BQUwsQ0FBYVcsU0FBakIsRUFBNEI4RCxLQUFLSyxRQUFMLENBQWMsTUFBZDs7QUFFNUIsVUFBSWxFLFlBQVksT0FBTyxLQUFLWixPQUFMLENBQWFZLFNBQXBCLElBQWlDLFVBQWpDLEdBQ2QsS0FBS1osT0FBTCxDQUFhWSxTQUFiLENBQXVCYyxJQUF2QixDQUE0QixJQUE1QixFQUFrQytDLEtBQUssQ0FBTCxDQUFsQyxFQUEyQyxLQUFLcEUsUUFBTCxDQUFjLENBQWQsQ0FBM0MsQ0FEYyxHQUVkLEtBQUtMLE9BQUwsQ0FBYVksU0FGZjs7QUFJQSxVQUFJbUUsWUFBWSxjQUFoQjtBQUNBLFVBQUlDLFlBQVlELFVBQVVFLElBQVYsQ0FBZXJFLFNBQWYsQ0FBaEI7QUFDQSxVQUFJb0UsU0FBSixFQUFlcEUsWUFBWUEsVUFBVXNFLE9BQVYsQ0FBa0JILFNBQWxCLEVBQTZCLEVBQTdCLEtBQW9DLEtBQWhEOztBQUVmTixXQUNHVSxNQURILEdBRUdDLEdBRkgsQ0FFTyxFQUFFQyxLQUFLLENBQVAsRUFBVUMsTUFBTSxDQUFoQixFQUFtQkMsU0FBUyxPQUE1QixFQUZQLEVBR0dULFFBSEgsQ0FHWWxFLFNBSFosRUFJR29DLElBSkgsQ0FJUSxRQUFRLEtBQUsvQyxJQUpyQixFQUkyQixJQUozQjs7QUFNQSxXQUFLRCxPQUFMLENBQWFtQixTQUFiLEdBQXlCc0QsS0FBS2UsUUFBTCxDQUFjLEtBQUt4RixPQUFMLENBQWFtQixTQUEzQixDQUF6QixHQUFpRXNELEtBQUtnQixXQUFMLENBQWlCLEtBQUtwRixRQUF0QixDQUFqRTtBQUNBLFdBQUtBLFFBQUwsQ0FBY1UsT0FBZCxDQUFzQixpQkFBaUIsS0FBS2QsSUFBNUM7O0FBRUEsVUFBSXlGLE1BQWUsS0FBS0MsV0FBTCxFQUFuQjtBQUNBLFVBQUlDLGNBQWVuQixLQUFLLENBQUwsRUFBUW9CLFdBQTNCO0FBQ0EsVUFBSUMsZUFBZXJCLEtBQUssQ0FBTCxFQUFRc0IsWUFBM0I7O0FBRUEsVUFBSWYsU0FBSixFQUFlO0FBQ2IsWUFBSWdCLGVBQWVwRixTQUFuQjtBQUNBLFlBQUlxRixjQUFjLEtBQUtOLFdBQUwsQ0FBaUIsS0FBS25FLFNBQXRCLENBQWxCOztBQUVBWixvQkFBWUEsYUFBYSxRQUFiLElBQXlCOEUsSUFBSVEsTUFBSixHQUFhSixZQUFiLEdBQTRCRyxZQUFZQyxNQUFqRSxHQUEwRSxLQUExRSxHQUNBdEYsYUFBYSxLQUFiLElBQXlCOEUsSUFBSUwsR0FBSixHQUFhUyxZQUFiLEdBQTRCRyxZQUFZWixHQUFqRSxHQUEwRSxRQUExRSxHQUNBekUsYUFBYSxPQUFiLElBQXlCOEUsSUFBSVMsS0FBSixHQUFhUCxXQUFiLEdBQTRCSyxZQUFZRyxLQUFqRSxHQUEwRSxNQUExRSxHQUNBeEYsYUFBYSxNQUFiLElBQXlCOEUsSUFBSUosSUFBSixHQUFhTSxXQUFiLEdBQTRCSyxZQUFZWCxJQUFqRSxHQUEwRSxPQUExRSxHQUNBMUUsU0FKWjs7QUFNQTZELGFBQ0c0QixXQURILENBQ2VMLFlBRGYsRUFFR2xCLFFBRkgsQ0FFWWxFLFNBRlo7QUFHRDs7QUFFRCxVQUFJMEYsbUJBQW1CLEtBQUtDLG1CQUFMLENBQXlCM0YsU0FBekIsRUFBb0M4RSxHQUFwQyxFQUF5Q0UsV0FBekMsRUFBc0RFLFlBQXRELENBQXZCOztBQUVBLFdBQUtVLGNBQUwsQ0FBb0JGLGdCQUFwQixFQUFzQzFGLFNBQXRDOztBQUVBLFVBQUk2RixXQUFXLFNBQVhBLFFBQVcsR0FBWTtBQUN6QixZQUFJQyxpQkFBaUJsQyxLQUFLcEUsVUFBMUI7QUFDQW9FLGFBQUtuRSxRQUFMLENBQWNVLE9BQWQsQ0FBc0IsY0FBY3lELEtBQUt2RSxJQUF6QztBQUNBdUUsYUFBS3BFLFVBQUwsR0FBa0IsSUFBbEI7O0FBRUEsWUFBSXNHLGtCQUFrQixLQUF0QixFQUE2QmxDLEtBQUs3QixLQUFMLENBQVc2QixJQUFYO0FBQzlCLE9BTkQ7O0FBUUEzRSxRQUFFOEcsT0FBRixDQUFVQyxVQUFWLElBQXdCLEtBQUtuQyxJQUFMLENBQVVaLFFBQVYsQ0FBbUIsTUFBbkIsQ0FBeEIsR0FDRVksS0FDR29DLEdBREgsQ0FDTyxpQkFEUCxFQUMwQkosUUFEMUIsRUFFR0ssb0JBRkgsQ0FFd0JoSCxRQUFRVyxtQkFGaEMsQ0FERixHQUlFZ0csVUFKRjtBQUtEO0FBQ0YsR0ExRUQ7O0FBNEVBM0csVUFBUXdCLFNBQVIsQ0FBa0JrRixjQUFsQixHQUFtQyxVQUFVTyxNQUFWLEVBQWtCbkcsU0FBbEIsRUFBNkI7QUFDOUQsUUFBSTZELE9BQVMsS0FBS2IsR0FBTCxFQUFiO0FBQ0EsUUFBSXdDLFFBQVMzQixLQUFLLENBQUwsRUFBUW9CLFdBQXJCO0FBQ0EsUUFBSW1CLFNBQVN2QyxLQUFLLENBQUwsRUFBUXNCLFlBQXJCOztBQUVBO0FBQ0EsUUFBSWtCLFlBQVlDLFNBQVN6QyxLQUFLVyxHQUFMLENBQVMsWUFBVCxDQUFULEVBQWlDLEVBQWpDLENBQWhCO0FBQ0EsUUFBSStCLGFBQWFELFNBQVN6QyxLQUFLVyxHQUFMLENBQVMsYUFBVCxDQUFULEVBQWtDLEVBQWxDLENBQWpCOztBQUVBO0FBQ0EsUUFBSWdDLE1BQU1ILFNBQU4sQ0FBSixFQUF1QkEsWUFBYSxDQUFiO0FBQ3ZCLFFBQUlHLE1BQU1ELFVBQU4sQ0FBSixFQUF1QkEsYUFBYSxDQUFiOztBQUV2QkosV0FBTzFCLEdBQVAsSUFBZTRCLFNBQWY7QUFDQUYsV0FBT3pCLElBQVAsSUFBZTZCLFVBQWY7O0FBRUE7QUFDQTtBQUNBdEgsTUFBRWtILE1BQUYsQ0FBU00sU0FBVCxDQUFtQjVDLEtBQUssQ0FBTCxDQUFuQixFQUE0QjVFLEVBQUVnRCxNQUFGLENBQVM7QUFDbkN5RSxhQUFPLGVBQVVDLEtBQVYsRUFBaUI7QUFDdEI5QyxhQUFLVyxHQUFMLENBQVM7QUFDUEMsZUFBS21DLEtBQUtDLEtBQUwsQ0FBV0YsTUFBTWxDLEdBQWpCLENBREU7QUFFUEMsZ0JBQU1rQyxLQUFLQyxLQUFMLENBQVdGLE1BQU1qQyxJQUFqQjtBQUZDLFNBQVQ7QUFJRDtBQU5rQyxLQUFULEVBT3pCeUIsTUFQeUIsQ0FBNUIsRUFPWSxDQVBaOztBQVNBdEMsU0FBS0ssUUFBTCxDQUFjLElBQWQ7O0FBRUE7QUFDQSxRQUFJYyxjQUFlbkIsS0FBSyxDQUFMLEVBQVFvQixXQUEzQjtBQUNBLFFBQUlDLGVBQWVyQixLQUFLLENBQUwsRUFBUXNCLFlBQTNCOztBQUVBLFFBQUluRixhQUFhLEtBQWIsSUFBc0JrRixnQkFBZ0JrQixNQUExQyxFQUFrRDtBQUNoREQsYUFBTzFCLEdBQVAsR0FBYTBCLE9BQU8xQixHQUFQLEdBQWEyQixNQUFiLEdBQXNCbEIsWUFBbkM7QUFDRDs7QUFFRCxRQUFJNEIsUUFBUSxLQUFLQyx3QkFBTCxDQUE4Qi9HLFNBQTlCLEVBQXlDbUcsTUFBekMsRUFBaURuQixXQUFqRCxFQUE4REUsWUFBOUQsQ0FBWjs7QUFFQSxRQUFJNEIsTUFBTXBDLElBQVYsRUFBZ0J5QixPQUFPekIsSUFBUCxJQUFlb0MsTUFBTXBDLElBQXJCLENBQWhCLEtBQ0t5QixPQUFPMUIsR0FBUCxJQUFjcUMsTUFBTXJDLEdBQXBCOztBQUVMLFFBQUl1QyxhQUFzQixhQUFhM0MsSUFBYixDQUFrQnJFLFNBQWxCLENBQTFCO0FBQ0EsUUFBSWlILGFBQXNCRCxhQUFhRixNQUFNcEMsSUFBTixHQUFhLENBQWIsR0FBaUJjLEtBQWpCLEdBQXlCUixXQUF0QyxHQUFvRDhCLE1BQU1yQyxHQUFOLEdBQVksQ0FBWixHQUFnQjJCLE1BQWhCLEdBQXlCbEIsWUFBdkc7QUFDQSxRQUFJZ0Msc0JBQXNCRixhQUFhLGFBQWIsR0FBNkIsY0FBdkQ7O0FBRUFuRCxTQUFLc0MsTUFBTCxDQUFZQSxNQUFaO0FBQ0EsU0FBS2dCLFlBQUwsQ0FBa0JGLFVBQWxCLEVBQThCcEQsS0FBSyxDQUFMLEVBQVFxRCxtQkFBUixDQUE5QixFQUE0REYsVUFBNUQ7QUFDRCxHQWhERDs7QUFrREE5SCxVQUFRd0IsU0FBUixDQUFrQnlHLFlBQWxCLEdBQWlDLFVBQVVMLEtBQVYsRUFBaUJNLFNBQWpCLEVBQTRCSixVQUE1QixFQUF3QztBQUN2RSxTQUFLSyxLQUFMLEdBQ0c3QyxHQURILENBQ093QyxhQUFhLE1BQWIsR0FBc0IsS0FEN0IsRUFDb0MsTUFBTSxJQUFJRixRQUFRTSxTQUFsQixJQUErQixHQURuRSxFQUVHNUMsR0FGSCxDQUVPd0MsYUFBYSxLQUFiLEdBQXFCLE1BRjVCLEVBRW9DLEVBRnBDO0FBR0QsR0FKRDs7QUFNQTlILFVBQVF3QixTQUFSLENBQWtCc0QsVUFBbEIsR0FBK0IsWUFBWTtBQUN6QyxRQUFJSCxPQUFRLEtBQUtiLEdBQUwsRUFBWjtBQUNBLFFBQUk1QyxRQUFRLEtBQUtrSCxRQUFMLEVBQVo7O0FBRUF6RCxTQUFLMEQsSUFBTCxDQUFVLGdCQUFWLEVBQTRCLEtBQUtuSSxPQUFMLENBQWFrQixJQUFiLEdBQW9CLE1BQXBCLEdBQTZCLE1BQXpELEVBQWlFRixLQUFqRTtBQUNBeUQsU0FBSzRCLFdBQUwsQ0FBaUIsK0JBQWpCO0FBQ0QsR0FORDs7QUFRQXZHLFVBQVF3QixTQUFSLENBQWtCNEIsSUFBbEIsR0FBeUIsVUFBVWtGLFFBQVYsRUFBb0I7QUFDM0MsUUFBSTVELE9BQU8sSUFBWDtBQUNBLFFBQUlDLE9BQU81RSxFQUFFLEtBQUs0RSxJQUFQLENBQVg7QUFDQSxRQUFJUixJQUFPcEUsRUFBRThELEtBQUYsQ0FBUSxhQUFhLEtBQUsxRCxJQUExQixDQUFYOztBQUVBLGFBQVN3RyxRQUFULEdBQW9CO0FBQ2xCLFVBQUlqQyxLQUFLcEUsVUFBTCxJQUFtQixJQUF2QixFQUE2QnFFLEtBQUtVLE1BQUw7QUFDN0IsVUFBSVgsS0FBS25FLFFBQVQsRUFBbUI7QUFBRTtBQUNuQm1FLGFBQUtuRSxRQUFMLENBQ0dnSSxVQURILENBQ2Msa0JBRGQsRUFFR3RILE9BRkgsQ0FFVyxlQUFleUQsS0FBS3ZFLElBRi9CO0FBR0Q7QUFDRG1JLGtCQUFZQSxVQUFaO0FBQ0Q7O0FBRUQsU0FBSy9ILFFBQUwsQ0FBY1UsT0FBZCxDQUFzQmtELENBQXRCOztBQUVBLFFBQUlBLEVBQUVNLGtCQUFGLEVBQUosRUFBNEI7O0FBRTVCRSxTQUFLNEIsV0FBTCxDQUFpQixJQUFqQjs7QUFFQXhHLE1BQUU4RyxPQUFGLENBQVVDLFVBQVYsSUFBd0JuQyxLQUFLWixRQUFMLENBQWMsTUFBZCxDQUF4QixHQUNFWSxLQUNHb0MsR0FESCxDQUNPLGlCQURQLEVBQzBCSixRQUQxQixFQUVHSyxvQkFGSCxDQUV3QmhILFFBQVFXLG1CQUZoQyxDQURGLEdBSUVnRyxVQUpGOztBQU1BLFNBQUtyRyxVQUFMLEdBQWtCLElBQWxCOztBQUVBLFdBQU8sSUFBUDtBQUNELEdBOUJEOztBQWdDQU4sVUFBUXdCLFNBQVIsQ0FBa0J3QixRQUFsQixHQUE2QixZQUFZO0FBQ3ZDLFFBQUl3RixLQUFLLEtBQUtqSSxRQUFkO0FBQ0EsUUFBSWlJLEdBQUd6RCxJQUFILENBQVEsT0FBUixLQUFvQixPQUFPeUQsR0FBR3pELElBQUgsQ0FBUSxxQkFBUixDQUFQLElBQXlDLFFBQWpFLEVBQTJFO0FBQ3pFeUQsU0FBR3pELElBQUgsQ0FBUSxxQkFBUixFQUErQnlELEdBQUd6RCxJQUFILENBQVEsT0FBUixLQUFvQixFQUFuRCxFQUF1REEsSUFBdkQsQ0FBNEQsT0FBNUQsRUFBcUUsRUFBckU7QUFDRDtBQUNGLEdBTEQ7O0FBT0EvRSxVQUFRd0IsU0FBUixDQUFrQjRDLFVBQWxCLEdBQStCLFlBQVk7QUFDekMsV0FBTyxLQUFLZ0UsUUFBTCxFQUFQO0FBQ0QsR0FGRDs7QUFJQXBJLFVBQVF3QixTQUFSLENBQWtCcUUsV0FBbEIsR0FBZ0MsVUFBVXRGLFFBQVYsRUFBb0I7QUFDbERBLGVBQWFBLFlBQVksS0FBS0EsUUFBOUI7O0FBRUEsUUFBSWtJLEtBQVNsSSxTQUFTLENBQVQsQ0FBYjtBQUNBLFFBQUltSSxTQUFTRCxHQUFHRSxPQUFILElBQWMsTUFBM0I7O0FBRUEsUUFBSUMsU0FBWUgsR0FBR0kscUJBQUgsRUFBaEI7QUFDQSxRQUFJRCxPQUFPdEMsS0FBUCxJQUFnQixJQUFwQixFQUEwQjtBQUN4QjtBQUNBc0MsZUFBUzdJLEVBQUVnRCxNQUFGLENBQVMsRUFBVCxFQUFhNkYsTUFBYixFQUFxQixFQUFFdEMsT0FBT3NDLE9BQU92QyxLQUFQLEdBQWV1QyxPQUFPcEQsSUFBL0IsRUFBcUMwQixRQUFRMEIsT0FBT3hDLE1BQVAsR0FBZ0J3QyxPQUFPckQsR0FBcEUsRUFBckIsQ0FBVDtBQUNEO0FBQ0QsUUFBSXVELFFBQVFDLE9BQU9DLFVBQVAsSUFBcUJQLGNBQWNNLE9BQU9DLFVBQXREO0FBQ0E7QUFDQTtBQUNBLFFBQUlDLFdBQVlQLFNBQVMsRUFBRW5ELEtBQUssQ0FBUCxFQUFVQyxNQUFNLENBQWhCLEVBQVQsR0FBZ0NzRCxRQUFRLElBQVIsR0FBZXZJLFNBQVMwRyxNQUFULEVBQS9EO0FBQ0EsUUFBSWlDLFNBQVksRUFBRUEsUUFBUVIsU0FBUzFHLFNBQVN3QyxlQUFULENBQXlCMkUsU0FBekIsSUFBc0NuSCxTQUFTb0gsSUFBVCxDQUFjRCxTQUE3RCxHQUF5RTVJLFNBQVM0SSxTQUFULEVBQW5GLEVBQWhCO0FBQ0EsUUFBSUUsWUFBWVgsU0FBUyxFQUFFcEMsT0FBT3ZHLEVBQUVnSixNQUFGLEVBQVV6QyxLQUFWLEVBQVQsRUFBNEJZLFFBQVFuSCxFQUFFZ0osTUFBRixFQUFVN0IsTUFBVixFQUFwQyxFQUFULEdBQW9FLElBQXBGOztBQUVBLFdBQU9uSCxFQUFFZ0QsTUFBRixDQUFTLEVBQVQsRUFBYTZGLE1BQWIsRUFBcUJNLE1BQXJCLEVBQTZCRyxTQUE3QixFQUF3Q0osUUFBeEMsQ0FBUDtBQUNELEdBbkJEOztBQXFCQWpKLFVBQVF3QixTQUFSLENBQWtCaUYsbUJBQWxCLEdBQXdDLFVBQVUzRixTQUFWLEVBQXFCOEUsR0FBckIsRUFBMEJFLFdBQTFCLEVBQXVDRSxZQUF2QyxFQUFxRDtBQUMzRixXQUFPbEYsYUFBYSxRQUFiLEdBQXdCLEVBQUV5RSxLQUFLSyxJQUFJTCxHQUFKLEdBQVVLLElBQUlzQixNQUFyQixFQUErQjFCLE1BQU1JLElBQUlKLElBQUosR0FBV0ksSUFBSVUsS0FBSixHQUFZLENBQXZCLEdBQTJCUixjQUFjLENBQTlFLEVBQXhCLEdBQ0FoRixhQUFhLEtBQWIsR0FBd0IsRUFBRXlFLEtBQUtLLElBQUlMLEdBQUosR0FBVVMsWUFBakIsRUFBK0JSLE1BQU1JLElBQUlKLElBQUosR0FBV0ksSUFBSVUsS0FBSixHQUFZLENBQXZCLEdBQTJCUixjQUFjLENBQTlFLEVBQXhCLEdBQ0FoRixhQUFhLE1BQWIsR0FBd0IsRUFBRXlFLEtBQUtLLElBQUlMLEdBQUosR0FBVUssSUFBSXNCLE1BQUosR0FBYSxDQUF2QixHQUEyQmxCLGVBQWUsQ0FBakQsRUFBb0RSLE1BQU1JLElBQUlKLElBQUosR0FBV00sV0FBckUsRUFBeEI7QUFDSCw4QkFBMkIsRUFBRVAsS0FBS0ssSUFBSUwsR0FBSixHQUFVSyxJQUFJc0IsTUFBSixHQUFhLENBQXZCLEdBQTJCbEIsZUFBZSxDQUFqRCxFQUFvRFIsTUFBTUksSUFBSUosSUFBSixHQUFXSSxJQUFJVSxLQUF6RSxFQUgvQjtBQUtELEdBTkQ7O0FBUUF0RyxVQUFRd0IsU0FBUixDQUFrQnFHLHdCQUFsQixHQUE2QyxVQUFVL0csU0FBVixFQUFxQjhFLEdBQXJCLEVBQTBCRSxXQUExQixFQUF1Q0UsWUFBdkMsRUFBcUQ7QUFDaEcsUUFBSTRCLFFBQVEsRUFBRXJDLEtBQUssQ0FBUCxFQUFVQyxNQUFNLENBQWhCLEVBQVo7QUFDQSxRQUFJLENBQUMsS0FBSzlELFNBQVYsRUFBcUIsT0FBT2tHLEtBQVA7O0FBRXJCLFFBQUkwQixrQkFBa0IsS0FBS3BKLE9BQUwsQ0FBYW9CLFFBQWIsSUFBeUIsS0FBS3BCLE9BQUwsQ0FBYW9CLFFBQWIsQ0FBc0JDLE9BQS9DLElBQTBELENBQWhGO0FBQ0EsUUFBSWdJLHFCQUFxQixLQUFLMUQsV0FBTCxDQUFpQixLQUFLbkUsU0FBdEIsQ0FBekI7O0FBRUEsUUFBSSxhQUFheUQsSUFBYixDQUFrQnJFLFNBQWxCLENBQUosRUFBa0M7QUFDaEMsVUFBSTBJLGdCQUFtQjVELElBQUlMLEdBQUosR0FBVStELGVBQVYsR0FBNEJDLG1CQUFtQkwsTUFBdEU7QUFDQSxVQUFJTyxtQkFBbUI3RCxJQUFJTCxHQUFKLEdBQVUrRCxlQUFWLEdBQTRCQyxtQkFBbUJMLE1BQS9DLEdBQXdEbEQsWUFBL0U7QUFDQSxVQUFJd0QsZ0JBQWdCRCxtQkFBbUJoRSxHQUF2QyxFQUE0QztBQUFFO0FBQzVDcUMsY0FBTXJDLEdBQU4sR0FBWWdFLG1CQUFtQmhFLEdBQW5CLEdBQXlCaUUsYUFBckM7QUFDRCxPQUZELE1BRU8sSUFBSUMsbUJBQW1CRixtQkFBbUJoRSxHQUFuQixHQUF5QmdFLG1CQUFtQnJDLE1BQW5FLEVBQTJFO0FBQUU7QUFDbEZVLGNBQU1yQyxHQUFOLEdBQVlnRSxtQkFBbUJoRSxHQUFuQixHQUF5QmdFLG1CQUFtQnJDLE1BQTVDLEdBQXFEdUMsZ0JBQWpFO0FBQ0Q7QUFDRixLQVJELE1BUU87QUFDTCxVQUFJQyxpQkFBa0I5RCxJQUFJSixJQUFKLEdBQVc4RCxlQUFqQztBQUNBLFVBQUlLLGtCQUFrQi9ELElBQUlKLElBQUosR0FBVzhELGVBQVgsR0FBNkJ4RCxXQUFuRDtBQUNBLFVBQUk0RCxpQkFBaUJILG1CQUFtQi9ELElBQXhDLEVBQThDO0FBQUU7QUFDOUNvQyxjQUFNcEMsSUFBTixHQUFhK0QsbUJBQW1CL0QsSUFBbkIsR0FBMEJrRSxjQUF2QztBQUNELE9BRkQsTUFFTyxJQUFJQyxrQkFBa0JKLG1CQUFtQmxELEtBQXpDLEVBQWdEO0FBQUU7QUFDdkR1QixjQUFNcEMsSUFBTixHQUFhK0QsbUJBQW1CL0QsSUFBbkIsR0FBMEIrRCxtQkFBbUJqRCxLQUE3QyxHQUFxRHFELGVBQWxFO0FBQ0Q7QUFDRjs7QUFFRCxXQUFPL0IsS0FBUDtBQUNELEdBMUJEOztBQTRCQTVILFVBQVF3QixTQUFSLENBQWtCNEcsUUFBbEIsR0FBNkIsWUFBWTtBQUN2QyxRQUFJbEgsS0FBSjtBQUNBLFFBQUlzSCxLQUFLLEtBQUtqSSxRQUFkO0FBQ0EsUUFBSXFKLElBQUssS0FBSzFKLE9BQWQ7O0FBRUFnQixZQUFRc0gsR0FBR3pELElBQUgsQ0FBUSxxQkFBUixNQUNGLE9BQU82RSxFQUFFMUksS0FBVCxJQUFrQixVQUFsQixHQUErQjBJLEVBQUUxSSxLQUFGLENBQVFVLElBQVIsQ0FBYTRHLEdBQUcsQ0FBSCxDQUFiLENBQS9CLEdBQXNEb0IsRUFBRTFJLEtBRHRELENBQVI7O0FBR0EsV0FBT0EsS0FBUDtBQUNELEdBVEQ7O0FBV0FsQixVQUFRd0IsU0FBUixDQUFrQnFELE1BQWxCLEdBQTJCLFVBQVVnRixNQUFWLEVBQWtCO0FBQzNDO0FBQUdBLGdCQUFVLENBQUMsRUFBRW5DLEtBQUtvQyxNQUFMLEtBQWdCLE9BQWxCLENBQVg7QUFBSCxhQUNPOUgsU0FBUytILGNBQVQsQ0FBd0JGLE1BQXhCLENBRFA7QUFFQSxXQUFPQSxNQUFQO0FBQ0QsR0FKRDs7QUFNQTdKLFVBQVF3QixTQUFSLENBQWtCc0MsR0FBbEIsR0FBd0IsWUFBWTtBQUNsQyxRQUFJLENBQUMsS0FBS2EsSUFBVixFQUFnQjtBQUNkLFdBQUtBLElBQUwsR0FBWTVFLEVBQUUsS0FBS0csT0FBTCxDQUFhYyxRQUFmLENBQVo7QUFDQSxVQUFJLEtBQUsyRCxJQUFMLENBQVVyQyxNQUFWLElBQW9CLENBQXhCLEVBQTJCO0FBQ3pCLGNBQU0sSUFBSUosS0FBSixDQUFVLEtBQUsvQixJQUFMLEdBQVksaUVBQXRCLENBQU47QUFDRDtBQUNGO0FBQ0QsV0FBTyxLQUFLd0UsSUFBWjtBQUNELEdBUkQ7O0FBVUEzRSxVQUFRd0IsU0FBUixDQUFrQjJHLEtBQWxCLEdBQTBCLFlBQVk7QUFDcEMsV0FBUSxLQUFLNkIsTUFBTCxHQUFjLEtBQUtBLE1BQUwsSUFBZSxLQUFLbEcsR0FBTCxHQUFXdUUsSUFBWCxDQUFnQixnQkFBaEIsQ0FBckM7QUFDRCxHQUZEOztBQUlBckksVUFBUXdCLFNBQVIsQ0FBa0J5SSxNQUFsQixHQUEyQixZQUFZO0FBQ3JDLFNBQUs3SixPQUFMLEdBQWUsSUFBZjtBQUNELEdBRkQ7O0FBSUFKLFVBQVF3QixTQUFSLENBQWtCMEksT0FBbEIsR0FBNEIsWUFBWTtBQUN0QyxTQUFLOUosT0FBTCxHQUFlLEtBQWY7QUFDRCxHQUZEOztBQUlBSixVQUFRd0IsU0FBUixDQUFrQjJJLGFBQWxCLEdBQWtDLFlBQVk7QUFDNUMsU0FBSy9KLE9BQUwsR0FBZSxDQUFDLEtBQUtBLE9BQXJCO0FBQ0QsR0FGRDs7QUFJQUosVUFBUXdCLFNBQVIsQ0FBa0JpQixNQUFsQixHQUEyQixVQUFVMEIsQ0FBVixFQUFhO0FBQ3RDLFFBQUlSLE9BQU8sSUFBWDtBQUNBLFFBQUlRLENBQUosRUFBTztBQUNMUixhQUFPNUQsRUFBRW9FLEVBQUVQLGFBQUosRUFBbUJWLElBQW5CLENBQXdCLFFBQVEsS0FBSy9DLElBQXJDLENBQVA7QUFDQSxVQUFJLENBQUN3RCxJQUFMLEVBQVc7QUFDVEEsZUFBTyxJQUFJLEtBQUsxQixXQUFULENBQXFCa0MsRUFBRVAsYUFBdkIsRUFBc0MsS0FBS1Asa0JBQUwsRUFBdEMsQ0FBUDtBQUNBdEQsVUFBRW9FLEVBQUVQLGFBQUosRUFBbUJWLElBQW5CLENBQXdCLFFBQVEsS0FBSy9DLElBQXJDLEVBQTJDd0QsSUFBM0M7QUFDRDtBQUNGOztBQUVELFFBQUlRLENBQUosRUFBTztBQUNMUixXQUFLbkQsT0FBTCxDQUFhcUIsS0FBYixHQUFxQixDQUFDOEIsS0FBS25ELE9BQUwsQ0FBYXFCLEtBQW5DO0FBQ0EsVUFBSThCLEtBQUtPLGFBQUwsRUFBSixFQUEwQlAsS0FBS2YsS0FBTCxDQUFXZSxJQUFYLEVBQTFCLEtBQ0tBLEtBQUtkLEtBQUwsQ0FBV2MsSUFBWDtBQUNOLEtBSkQsTUFJTztBQUNMQSxXQUFLRyxHQUFMLEdBQVdDLFFBQVgsQ0FBb0IsSUFBcEIsSUFBNEJKLEtBQUtkLEtBQUwsQ0FBV2MsSUFBWCxDQUE1QixHQUErQ0EsS0FBS2YsS0FBTCxDQUFXZSxJQUFYLENBQS9DO0FBQ0Q7QUFDRixHQWpCRDs7QUFtQkEzRCxVQUFRd0IsU0FBUixDQUFrQjRJLE9BQWxCLEdBQTRCLFlBQVk7QUFDdEMsUUFBSTFGLE9BQU8sSUFBWDtBQUNBVixpQkFBYSxLQUFLM0QsT0FBbEI7QUFDQSxTQUFLK0MsSUFBTCxDQUFVLFlBQVk7QUFDcEJzQixXQUFLbkUsUUFBTCxDQUFjOEosR0FBZCxDQUFrQixNQUFNM0YsS0FBS3ZFLElBQTdCLEVBQW1DbUssVUFBbkMsQ0FBOEMsUUFBUTVGLEtBQUt2RSxJQUEzRDtBQUNBLFVBQUl1RSxLQUFLQyxJQUFULEVBQWU7QUFDYkQsYUFBS0MsSUFBTCxDQUFVVSxNQUFWO0FBQ0Q7QUFDRFgsV0FBS0MsSUFBTCxHQUFZLElBQVo7QUFDQUQsV0FBS3NGLE1BQUwsR0FBYyxJQUFkO0FBQ0F0RixXQUFLaEQsU0FBTCxHQUFpQixJQUFqQjtBQUNBZ0QsV0FBS25FLFFBQUwsR0FBZ0IsSUFBaEI7QUFDRCxLQVREO0FBVUQsR0FiRDs7QUFnQkE7QUFDQTs7QUFFQSxXQUFTZ0ssTUFBVCxDQUFnQkMsTUFBaEIsRUFBd0I7QUFDdEIsV0FBTyxLQUFLakgsSUFBTCxDQUFVLFlBQVk7QUFDM0IsVUFBSWtILFFBQVUxSyxFQUFFLElBQUYsQ0FBZDtBQUNBLFVBQUltRCxPQUFVdUgsTUFBTXZILElBQU4sQ0FBVyxZQUFYLENBQWQ7QUFDQSxVQUFJaEQsVUFBVSxRQUFPc0ssTUFBUCx5Q0FBT0EsTUFBUCxNQUFpQixRQUFqQixJQUE2QkEsTUFBM0M7O0FBRUEsVUFBSSxDQUFDdEgsSUFBRCxJQUFTLGVBQWVpQyxJQUFmLENBQW9CcUYsTUFBcEIsQ0FBYixFQUEwQztBQUMxQyxVQUFJLENBQUN0SCxJQUFMLEVBQVd1SCxNQUFNdkgsSUFBTixDQUFXLFlBQVgsRUFBMEJBLE9BQU8sSUFBSWxELE9BQUosQ0FBWSxJQUFaLEVBQWtCRSxPQUFsQixDQUFqQztBQUNYLFVBQUksT0FBT3NLLE1BQVAsSUFBaUIsUUFBckIsRUFBK0J0SCxLQUFLc0gsTUFBTDtBQUNoQyxLQVJNLENBQVA7QUFTRDs7QUFFRCxNQUFJRSxNQUFNM0ssRUFBRTRLLEVBQUYsQ0FBS0MsT0FBZjs7QUFFQTdLLElBQUU0SyxFQUFGLENBQUtDLE9BQUwsR0FBMkJMLE1BQTNCO0FBQ0F4SyxJQUFFNEssRUFBRixDQUFLQyxPQUFMLENBQWFDLFdBQWIsR0FBMkI3SyxPQUEzQjs7QUFHQTtBQUNBOztBQUVBRCxJQUFFNEssRUFBRixDQUFLQyxPQUFMLENBQWFFLFVBQWIsR0FBMEIsWUFBWTtBQUNwQy9LLE1BQUU0SyxFQUFGLENBQUtDLE9BQUwsR0FBZUYsR0FBZjtBQUNBLFdBQU8sSUFBUDtBQUNELEdBSEQ7QUFLRCxDQTdmQSxDQTZmQ0ssTUE3ZkQsQ0FBRDs7Ozs7QUNWQSxDQUFDLFlBQVc7QUFDVixNQUFJQyxXQUFKO0FBQUEsTUFBaUJDLEdBQWpCO0FBQUEsTUFBc0JDLGVBQXRCO0FBQUEsTUFBdUNDLGNBQXZDO0FBQUEsTUFBdURDLGNBQXZEO0FBQUEsTUFBdUVDLGVBQXZFO0FBQUEsTUFBd0ZDLE9BQXhGO0FBQUEsTUFBaUdDLE1BQWpHO0FBQUEsTUFBeUdDLGFBQXpHO0FBQUEsTUFBd0hDLElBQXhIO0FBQUEsTUFBOEhDLGdCQUE5SDtBQUFBLE1BQWdKQyxXQUFoSjtBQUFBLE1BQTZKQyxNQUE3SjtBQUFBLE1BQXFLQyxvQkFBcks7QUFBQSxNQUEyTEMsaUJBQTNMO0FBQUEsTUFBOE1qTCxTQUE5TTtBQUFBLE1BQXlOa0wsWUFBek47QUFBQSxNQUF1T0MsR0FBdk87QUFBQSxNQUE0T0MsZUFBNU87QUFBQSxNQUE2UEMsb0JBQTdQO0FBQUEsTUFBbVJDLGNBQW5SO0FBQUEsTUFBbVNwSixPQUFuUztBQUFBLE1BQTJTcUosWUFBM1M7QUFBQSxNQUF5VEMsVUFBelQ7QUFBQSxNQUFxVUMsWUFBclU7QUFBQSxNQUFtVkMsZUFBblY7QUFBQSxNQUFvV0MsV0FBcFc7QUFBQSxNQUFpWC9MLElBQWpYO0FBQUEsTUFBdVhnTSxHQUF2WDtBQUFBLE1BQTRYdk0sT0FBNVg7QUFBQSxNQUFxWXdNLHFCQUFyWTtBQUFBLE1BQTRaQyxNQUE1WjtBQUFBLE1BQW9hQyxZQUFwYTtBQUFBLE1BQWtiQyxPQUFsYjtBQUFBLE1BQTJiQyxlQUEzYjtBQUFBLE1BQTRjQyxXQUE1YztBQUFBLE1BQXlkQyxNQUF6ZDtBQUFBLE1BQWllQyxPQUFqZTtBQUFBLE1BQTBlQyxTQUExZTtBQUFBLE1BQXFmQyxVQUFyZjtBQUFBLE1BQWlnQkMsZUFBamdCO0FBQUEsTUFBa2hCQyxlQUFsaEI7QUFBQSxNQUFtaUJDLEVBQW5pQjtBQUFBLE1BQXVpQkMsVUFBdmlCO0FBQUEsTUFBbWpCQyxJQUFuakI7QUFBQSxNQUF5akJDLFVBQXpqQjtBQUFBLE1BQXFrQkMsSUFBcmtCO0FBQUEsTUFBMmtCQyxLQUEza0I7QUFBQSxNQUFrbEJDLGFBQWxsQjtBQUFBLE1BQ0VDLFVBQVUsR0FBR0MsS0FEZjtBQUFBLE1BRUVDLFlBQVksR0FBR0MsY0FGakI7QUFBQSxNQUdFQyxZQUFZLFNBQVpBLFNBQVksQ0FBU0MsS0FBVCxFQUFnQkMsTUFBaEIsRUFBd0I7QUFBRSxTQUFLLElBQUkzSyxHQUFULElBQWdCMkssTUFBaEIsRUFBd0I7QUFBRSxVQUFJSixVQUFVbk0sSUFBVixDQUFldU0sTUFBZixFQUF1QjNLLEdBQXZCLENBQUosRUFBaUMwSyxNQUFNMUssR0FBTixJQUFhMkssT0FBTzNLLEdBQVAsQ0FBYjtBQUEyQixLQUFDLFNBQVM0SyxJQUFULEdBQWdCO0FBQUUsV0FBS25NLFdBQUwsR0FBbUJpTSxLQUFuQjtBQUEyQixLQUFDRSxLQUFLNU0sU0FBTCxHQUFpQjJNLE9BQU8zTSxTQUF4QixDQUFtQzBNLE1BQU0xTSxTQUFOLEdBQWtCLElBQUk0TSxJQUFKLEVBQWxCLENBQThCRixNQUFNRyxTQUFOLEdBQWtCRixPQUFPM00sU0FBekIsQ0FBb0MsT0FBTzBNLEtBQVA7QUFBZSxHQUhqUztBQUFBLE1BSUVJLFlBQVksR0FBR0MsT0FBSCxJQUFjLFVBQVNDLElBQVQsRUFBZTtBQUFFLFNBQUssSUFBSW5NLElBQUksQ0FBUixFQUFXb00sSUFBSSxLQUFLbk0sTUFBekIsRUFBaUNELElBQUlvTSxDQUFyQyxFQUF3Q3BNLEdBQXhDLEVBQTZDO0FBQUUsVUFBSUEsS0FBSyxJQUFMLElBQWEsS0FBS0EsQ0FBTCxNQUFZbU0sSUFBN0IsRUFBbUMsT0FBT25NLENBQVA7QUFBVyxLQUFDLE9BQU8sQ0FBQyxDQUFSO0FBQVksR0FKdko7O0FBTUE4SixtQkFBaUI7QUFDZnVDLGlCQUFhLEdBREU7QUFFZkMsaUJBQWEsR0FGRTtBQUdmQyxhQUFTLEdBSE07QUFJZkMsZUFBVyxHQUpJO0FBS2ZDLHlCQUFxQixFQUxOO0FBTWZDLGdCQUFZLElBTkc7QUFPZkMscUJBQWlCLElBUEY7QUFRZkMsd0JBQW9CLElBUkw7QUFTZkMsMkJBQXVCLEdBVFI7QUFVZkMsWUFBUSxNQVZPO0FBV2ZDLGNBQVU7QUFDUkMscUJBQWUsR0FEUDtBQUVSQyxpQkFBVyxDQUFDLE1BQUQ7QUFGSCxLQVhLO0FBZWZDLGNBQVU7QUFDUkMsa0JBQVksRUFESjtBQUVSQyxtQkFBYSxDQUZMO0FBR1JDLG9CQUFjO0FBSE4sS0FmSztBQW9CZkMsVUFBTTtBQUNKQyxvQkFBYyxDQUFDLEtBQUQsQ0FEVjtBQUVKQyx1QkFBaUIsSUFGYjtBQUdKQyxrQkFBWTtBQUhSO0FBcEJTLEdBQWpCOztBQTJCQXJELFFBQU0sZUFBVztBQUNmLFFBQUlpQixJQUFKO0FBQ0EsV0FBTyxDQUFDQSxPQUFPLE9BQU9xQyxXQUFQLEtBQXVCLFdBQXZCLElBQXNDQSxnQkFBZ0IsSUFBdEQsR0FBNkQsT0FBT0EsWUFBWXRELEdBQW5CLEtBQTJCLFVBQTNCLEdBQXdDc0QsWUFBWXRELEdBQVosRUFBeEMsR0FBNEQsS0FBSyxDQUE5SCxHQUFrSSxLQUFLLENBQS9JLEtBQXFKLElBQXJKLEdBQTRKaUIsSUFBNUosR0FBbUssQ0FBRSxJQUFJc0MsSUFBSixFQUE1SztBQUNELEdBSEQ7O0FBS0F0RCwwQkFBd0IzRCxPQUFPMkQscUJBQVAsSUFBZ0MzRCxPQUFPa0gsd0JBQXZDLElBQW1FbEgsT0FBT21ILDJCQUExRSxJQUF5R25ILE9BQU9vSCx1QkFBeEk7O0FBRUFqRSx5QkFBdUJuRCxPQUFPbUQsb0JBQVAsSUFBK0JuRCxPQUFPcUgsdUJBQTdEOztBQUVBLE1BQUkxRCx5QkFBeUIsSUFBN0IsRUFBbUM7QUFDakNBLDRCQUF3QiwrQkFBUy9CLEVBQVQsRUFBYTtBQUNuQyxhQUFPMUcsV0FBVzBHLEVBQVgsRUFBZSxFQUFmLENBQVA7QUFDRCxLQUZEO0FBR0F1QiwyQkFBdUIsOEJBQVNtRSxFQUFULEVBQWE7QUFDbEMsYUFBT3JNLGFBQWFxTSxFQUFiLENBQVA7QUFDRCxLQUZEO0FBR0Q7O0FBRUR6RCxpQkFBZSxzQkFBU2pDLEVBQVQsRUFBYTtBQUMxQixRQUFJMkYsSUFBSixFQUFVQyxLQUFWO0FBQ0FELFdBQU83RCxLQUFQO0FBQ0E4RCxZQUFPLGdCQUFXO0FBQ2hCLFVBQUlDLElBQUo7QUFDQUEsYUFBTy9ELFFBQVE2RCxJQUFmO0FBQ0EsVUFBSUUsUUFBUSxFQUFaLEVBQWdCO0FBQ2RGLGVBQU83RCxLQUFQO0FBQ0EsZUFBTzlCLEdBQUc2RixJQUFILEVBQVMsWUFBVztBQUN6QixpQkFBTzlELHNCQUFzQjZELEtBQXRCLENBQVA7QUFDRCxTQUZNLENBQVA7QUFHRCxPQUxELE1BS087QUFDTCxlQUFPdE0sV0FBV3NNLEtBQVgsRUFBaUIsS0FBS0MsSUFBdEIsQ0FBUDtBQUNEO0FBQ0YsS0FYRDtBQVlBLFdBQU9ELE9BQVA7QUFDRCxHQWhCRDs7QUFrQkE1RCxXQUFTLGtCQUFXO0FBQ2xCLFFBQUk4RCxJQUFKLEVBQVVqTixHQUFWLEVBQWVFLEdBQWY7QUFDQUEsVUFBTWdOLFVBQVUsQ0FBVixDQUFOLEVBQW9CbE4sTUFBTWtOLFVBQVUsQ0FBVixDQUExQixFQUF3Q0QsT0FBTyxLQUFLQyxVQUFVcE8sTUFBZixHQUF3QnVMLFFBQVFqTSxJQUFSLENBQWE4TyxTQUFiLEVBQXdCLENBQXhCLENBQXhCLEdBQXFELEVBQXBHO0FBQ0EsUUFBSSxPQUFPaE4sSUFBSUYsR0FBSixDQUFQLEtBQW9CLFVBQXhCLEVBQW9DO0FBQ2xDLGFBQU9FLElBQUlGLEdBQUosRUFBU21OLEtBQVQsQ0FBZWpOLEdBQWYsRUFBb0IrTSxJQUFwQixDQUFQO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsYUFBTy9NLElBQUlGLEdBQUosQ0FBUDtBQUNEO0FBQ0YsR0FSRDs7QUFVQVQsWUFBUyxrQkFBVztBQUNsQixRQUFJUyxHQUFKLEVBQVNvTixHQUFULEVBQWM1RCxNQUFkLEVBQXNCQyxPQUF0QixFQUErQjRELEdBQS9CLEVBQW9DdkQsRUFBcEMsRUFBd0NFLElBQXhDO0FBQ0FvRCxVQUFNRixVQUFVLENBQVYsQ0FBTixFQUFvQnpELFVBQVUsS0FBS3lELFVBQVVwTyxNQUFmLEdBQXdCdUwsUUFBUWpNLElBQVIsQ0FBYThPLFNBQWIsRUFBd0IsQ0FBeEIsQ0FBeEIsR0FBcUQsRUFBbkY7QUFDQSxTQUFLcEQsS0FBSyxDQUFMLEVBQVFFLE9BQU9QLFFBQVEzSyxNQUE1QixFQUFvQ2dMLEtBQUtFLElBQXpDLEVBQStDRixJQUEvQyxFQUFxRDtBQUNuRE4sZUFBU0MsUUFBUUssRUFBUixDQUFUO0FBQ0EsVUFBSU4sTUFBSixFQUFZO0FBQ1YsYUFBS3hKLEdBQUwsSUFBWXdKLE1BQVosRUFBb0I7QUFDbEIsY0FBSSxDQUFDZSxVQUFVbk0sSUFBVixDQUFlb0wsTUFBZixFQUF1QnhKLEdBQXZCLENBQUwsRUFBa0M7QUFDbENxTixnQkFBTTdELE9BQU94SixHQUFQLENBQU47QUFDQSxjQUFLb04sSUFBSXBOLEdBQUosS0FBWSxJQUFiLElBQXNCLFFBQU9vTixJQUFJcE4sR0FBSixDQUFQLE1BQW9CLFFBQTFDLElBQXVEcU4sT0FBTyxJQUE5RCxJQUF1RSxRQUFPQSxHQUFQLHlDQUFPQSxHQUFQLE9BQWUsUUFBMUYsRUFBb0c7QUFDbEc5TixvQkFBTzZOLElBQUlwTixHQUFKLENBQVAsRUFBaUJxTixHQUFqQjtBQUNELFdBRkQsTUFFTztBQUNMRCxnQkFBSXBOLEdBQUosSUFBV3FOLEdBQVg7QUFDRDtBQUNGO0FBQ0Y7QUFDRjtBQUNELFdBQU9ELEdBQVA7QUFDRCxHQWxCRDs7QUFvQkE3RSxpQkFBZSxzQkFBUytFLEdBQVQsRUFBYztBQUMzQixRQUFJQyxLQUFKLEVBQVdDLEdBQVgsRUFBZ0JDLENBQWhCLEVBQW1CM0QsRUFBbkIsRUFBdUJFLElBQXZCO0FBQ0F3RCxVQUFNRCxRQUFRLENBQWQ7QUFDQSxTQUFLekQsS0FBSyxDQUFMLEVBQVFFLE9BQU9zRCxJQUFJeE8sTUFBeEIsRUFBZ0NnTCxLQUFLRSxJQUFyQyxFQUEyQ0YsSUFBM0MsRUFBaUQ7QUFDL0MyRCxVQUFJSCxJQUFJeEQsRUFBSixDQUFKO0FBQ0EwRCxhQUFPdEosS0FBS3dKLEdBQUwsQ0FBU0QsQ0FBVCxDQUFQO0FBQ0FGO0FBQ0Q7QUFDRCxXQUFPQyxNQUFNRCxLQUFiO0FBQ0QsR0FURDs7QUFXQTFFLGVBQWEsb0JBQVM3SSxHQUFULEVBQWMyTixJQUFkLEVBQW9CO0FBQy9CLFFBQUlqTyxJQUFKLEVBQVVpQixDQUFWLEVBQWFzRSxFQUFiO0FBQ0EsUUFBSWpGLE9BQU8sSUFBWCxFQUFpQjtBQUNmQSxZQUFNLFNBQU47QUFDRDtBQUNELFFBQUkyTixRQUFRLElBQVosRUFBa0I7QUFDaEJBLGFBQU8sSUFBUDtBQUNEO0FBQ0QxSSxTQUFLekcsU0FBU29QLGFBQVQsQ0FBdUIsZ0JBQWdCNU4sR0FBaEIsR0FBc0IsR0FBN0MsQ0FBTDtBQUNBLFFBQUksQ0FBQ2lGLEVBQUwsRUFBUztBQUNQO0FBQ0Q7QUFDRHZGLFdBQU91RixHQUFHNEksWUFBSCxDQUFnQixlQUFlN04sR0FBL0IsQ0FBUDtBQUNBLFFBQUksQ0FBQzJOLElBQUwsRUFBVztBQUNULGFBQU9qTyxJQUFQO0FBQ0Q7QUFDRCxRQUFJO0FBQ0YsYUFBT29PLEtBQUtDLEtBQUwsQ0FBV3JPLElBQVgsQ0FBUDtBQUNELEtBRkQsQ0FFRSxPQUFPc08sTUFBUCxFQUFlO0FBQ2ZyTixVQUFJcU4sTUFBSjtBQUNBLGFBQU8sT0FBT0MsT0FBUCxLQUFtQixXQUFuQixJQUFrQ0EsWUFBWSxJQUE5QyxHQUFxREEsUUFBUUMsS0FBUixDQUFjLG1DQUFkLEVBQW1Edk4sQ0FBbkQsQ0FBckQsR0FBNkcsS0FBSyxDQUF6SDtBQUNEO0FBQ0YsR0F0QkQ7O0FBd0JBbUgsWUFBVyxZQUFXO0FBQ3BCLGFBQVNBLE9BQVQsR0FBbUIsQ0FBRTs7QUFFckJBLFlBQVE5SixTQUFSLENBQWtCZSxFQUFsQixHQUF1QixVQUFTb1AsS0FBVCxFQUFnQkMsT0FBaEIsRUFBeUJDLEdBQXpCLEVBQThCQyxJQUE5QixFQUFvQztBQUN6RCxVQUFJQyxLQUFKO0FBQ0EsVUFBSUQsUUFBUSxJQUFaLEVBQWtCO0FBQ2hCQSxlQUFPLEtBQVA7QUFDRDtBQUNELFVBQUksS0FBS0UsUUFBTCxJQUFpQixJQUFyQixFQUEyQjtBQUN6QixhQUFLQSxRQUFMLEdBQWdCLEVBQWhCO0FBQ0Q7QUFDRCxVQUFJLENBQUNELFFBQVEsS0FBS0MsUUFBZCxFQUF3QkwsS0FBeEIsS0FBa0MsSUFBdEMsRUFBNEM7QUFDMUNJLGNBQU1KLEtBQU4sSUFBZSxFQUFmO0FBQ0Q7QUFDRCxhQUFPLEtBQUtLLFFBQUwsQ0FBY0wsS0FBZCxFQUFxQk0sSUFBckIsQ0FBMEI7QUFDL0JMLGlCQUFTQSxPQURzQjtBQUUvQkMsYUFBS0EsR0FGMEI7QUFHL0JDLGNBQU1BO0FBSHlCLE9BQTFCLENBQVA7QUFLRCxLQWhCRDs7QUFrQkF4RyxZQUFROUosU0FBUixDQUFrQnNRLElBQWxCLEdBQXlCLFVBQVNILEtBQVQsRUFBZ0JDLE9BQWhCLEVBQXlCQyxHQUF6QixFQUE4QjtBQUNyRCxhQUFPLEtBQUt0UCxFQUFMLENBQVFvUCxLQUFSLEVBQWVDLE9BQWYsRUFBd0JDLEdBQXhCLEVBQTZCLElBQTdCLENBQVA7QUFDRCxLQUZEOztBQUlBdkcsWUFBUTlKLFNBQVIsQ0FBa0I2SSxHQUFsQixHQUF3QixVQUFTc0gsS0FBVCxFQUFnQkMsT0FBaEIsRUFBeUI7QUFDL0MsVUFBSXZQLENBQUosRUFBT3FMLElBQVAsRUFBYXdFLFFBQWI7QUFDQSxVQUFJLENBQUMsQ0FBQ3hFLE9BQU8sS0FBS3NFLFFBQWIsS0FBMEIsSUFBMUIsR0FBaUN0RSxLQUFLaUUsS0FBTCxDQUFqQyxHQUErQyxLQUFLLENBQXJELEtBQTJELElBQS9ELEVBQXFFO0FBQ25FO0FBQ0Q7QUFDRCxVQUFJQyxXQUFXLElBQWYsRUFBcUI7QUFDbkIsZUFBTyxPQUFPLEtBQUtJLFFBQUwsQ0FBY0wsS0FBZCxDQUFkO0FBQ0QsT0FGRCxNQUVPO0FBQ0x0UCxZQUFJLENBQUo7QUFDQTZQLG1CQUFXLEVBQVg7QUFDQSxlQUFPN1AsSUFBSSxLQUFLMlAsUUFBTCxDQUFjTCxLQUFkLEVBQXFCclAsTUFBaEMsRUFBd0M7QUFDdEMsY0FBSSxLQUFLMFAsUUFBTCxDQUFjTCxLQUFkLEVBQXFCdFAsQ0FBckIsRUFBd0J1UCxPQUF4QixLQUFvQ0EsT0FBeEMsRUFBaUQ7QUFDL0NNLHFCQUFTRCxJQUFULENBQWMsS0FBS0QsUUFBTCxDQUFjTCxLQUFkLEVBQXFCUSxNQUFyQixDQUE0QjlQLENBQTVCLEVBQStCLENBQS9CLENBQWQ7QUFDRCxXQUZELE1BRU87QUFDTDZQLHFCQUFTRCxJQUFULENBQWM1UCxHQUFkO0FBQ0Q7QUFDRjtBQUNELGVBQU82UCxRQUFQO0FBQ0Q7QUFDRixLQW5CRDs7QUFxQkE1RyxZQUFROUosU0FBUixDQUFrQlAsT0FBbEIsR0FBNEIsWUFBVztBQUNyQyxVQUFJd1AsSUFBSixFQUFVb0IsR0FBVixFQUFlRixLQUFmLEVBQXNCQyxPQUF0QixFQUErQnZQLENBQS9CLEVBQWtDeVAsSUFBbEMsRUFBd0NwRSxJQUF4QyxFQUE4Q0MsS0FBOUMsRUFBcUR1RSxRQUFyRDtBQUNBUCxjQUFRakIsVUFBVSxDQUFWLENBQVIsRUFBc0JELE9BQU8sS0FBS0MsVUFBVXBPLE1BQWYsR0FBd0J1TCxRQUFRak0sSUFBUixDQUFhOE8sU0FBYixFQUF3QixDQUF4QixDQUF4QixHQUFxRCxFQUFsRjtBQUNBLFVBQUksQ0FBQ2hELE9BQU8sS0FBS3NFLFFBQWIsS0FBMEIsSUFBMUIsR0FBaUN0RSxLQUFLaUUsS0FBTCxDQUFqQyxHQUErQyxLQUFLLENBQXhELEVBQTJEO0FBQ3pEdFAsWUFBSSxDQUFKO0FBQ0E2UCxtQkFBVyxFQUFYO0FBQ0EsZUFBTzdQLElBQUksS0FBSzJQLFFBQUwsQ0FBY0wsS0FBZCxFQUFxQnJQLE1BQWhDLEVBQXdDO0FBQ3RDcUwsa0JBQVEsS0FBS3FFLFFBQUwsQ0FBY0wsS0FBZCxFQUFxQnRQLENBQXJCLENBQVIsRUFBaUN1UCxVQUFVakUsTUFBTWlFLE9BQWpELEVBQTBEQyxNQUFNbEUsTUFBTWtFLEdBQXRFLEVBQTJFQyxPQUFPbkUsTUFBTW1FLElBQXhGO0FBQ0FGLGtCQUFRakIsS0FBUixDQUFja0IsT0FBTyxJQUFQLEdBQWNBLEdBQWQsR0FBb0IsSUFBbEMsRUFBd0NwQixJQUF4QztBQUNBLGNBQUlxQixJQUFKLEVBQVU7QUFDUkkscUJBQVNELElBQVQsQ0FBYyxLQUFLRCxRQUFMLENBQWNMLEtBQWQsRUFBcUJRLE1BQXJCLENBQTRCOVAsQ0FBNUIsRUFBK0IsQ0FBL0IsQ0FBZDtBQUNELFdBRkQsTUFFTztBQUNMNlAscUJBQVNELElBQVQsQ0FBYzVQLEdBQWQ7QUFDRDtBQUNGO0FBQ0QsZUFBTzZQLFFBQVA7QUFDRDtBQUNGLEtBakJEOztBQW1CQSxXQUFPNUcsT0FBUDtBQUVELEdBbkVTLEVBQVY7O0FBcUVBRyxTQUFPMUMsT0FBTzBDLElBQVAsSUFBZSxFQUF0Qjs7QUFFQTFDLFNBQU8wQyxJQUFQLEdBQWNBLElBQWQ7O0FBRUExSSxVQUFPMEksSUFBUCxFQUFhSCxRQUFROUosU0FBckI7O0FBRUF0QixZQUFVdUwsS0FBS3ZMLE9BQUwsR0FBZTZDLFFBQU8sRUFBUCxFQUFXb0osY0FBWCxFQUEyQnBELE9BQU9xSixXQUFsQyxFQUErQy9GLFlBQS9DLENBQXpCOztBQUVBcUIsU0FBTyxDQUFDLE1BQUQsRUFBUyxVQUFULEVBQXFCLFVBQXJCLEVBQWlDLFVBQWpDLENBQVA7QUFDQSxPQUFLSixLQUFLLENBQUwsRUFBUUUsT0FBT0UsS0FBS3BMLE1BQXpCLEVBQWlDZ0wsS0FBS0UsSUFBdEMsRUFBNENGLElBQTVDLEVBQWtEO0FBQ2hETixhQUFTVSxLQUFLSixFQUFMLENBQVQ7QUFDQSxRQUFJcE4sUUFBUThNLE1BQVIsTUFBb0IsSUFBeEIsRUFBOEI7QUFDNUI5TSxjQUFROE0sTUFBUixJQUFrQmIsZUFBZWEsTUFBZixDQUFsQjtBQUNEO0FBQ0Y7O0FBRUR4QixrQkFBaUIsVUFBUzZHLE1BQVQsRUFBaUI7QUFDaENwRSxjQUFVekMsYUFBVixFQUF5QjZHLE1BQXpCOztBQUVBLGFBQVM3RyxhQUFULEdBQXlCO0FBQ3ZCbUMsY0FBUW5DLGNBQWM2QyxTQUFkLENBQXdCcE0sV0FBeEIsQ0FBb0MwTyxLQUFwQyxDQUEwQyxJQUExQyxFQUFnREQsU0FBaEQsQ0FBUjtBQUNBLGFBQU8vQyxLQUFQO0FBQ0Q7O0FBRUQsV0FBT25DLGFBQVA7QUFFRCxHQVZlLENBVWJ0SixLQVZhLENBQWhCOztBQVlBK0ksUUFBTyxZQUFXO0FBQ2hCLGFBQVNBLEdBQVQsR0FBZTtBQUNiLFdBQUtxSCxRQUFMLEdBQWdCLENBQWhCO0FBQ0Q7O0FBRURySCxRQUFJekosU0FBSixDQUFjK1EsVUFBZCxHQUEyQixZQUFXO0FBQ3BDLFVBQUlDLGFBQUo7QUFDQSxVQUFJLEtBQUsvSixFQUFMLElBQVcsSUFBZixFQUFxQjtBQUNuQitKLHdCQUFnQnhRLFNBQVNvUCxhQUFULENBQXVCbFIsUUFBUWlQLE1BQS9CLENBQWhCO0FBQ0EsWUFBSSxDQUFDcUQsYUFBTCxFQUFvQjtBQUNsQixnQkFBTSxJQUFJaEgsYUFBSixFQUFOO0FBQ0Q7QUFDRCxhQUFLL0MsRUFBTCxHQUFVekcsU0FBU3lRLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBVjtBQUNBLGFBQUtoSyxFQUFMLENBQVFpSyxTQUFSLEdBQW9CLGtCQUFwQjtBQUNBMVEsaUJBQVNvSCxJQUFULENBQWNzSixTQUFkLEdBQTBCMVEsU0FBU29ILElBQVQsQ0FBY3NKLFNBQWQsQ0FBd0J0TixPQUF4QixDQUFnQyxZQUFoQyxFQUE4QyxFQUE5QyxDQUExQjtBQUNBcEQsaUJBQVNvSCxJQUFULENBQWNzSixTQUFkLElBQTJCLGVBQTNCO0FBQ0EsYUFBS2pLLEVBQUwsQ0FBUWtLLFNBQVIsR0FBb0IsbUhBQXBCO0FBQ0EsWUFBSUgsY0FBY0ksVUFBZCxJQUE0QixJQUFoQyxFQUFzQztBQUNwQ0osd0JBQWNLLFlBQWQsQ0FBMkIsS0FBS3BLLEVBQWhDLEVBQW9DK0osY0FBY0ksVUFBbEQ7QUFDRCxTQUZELE1BRU87QUFDTEosd0JBQWNNLFdBQWQsQ0FBMEIsS0FBS3JLLEVBQS9CO0FBQ0Q7QUFDRjtBQUNELGFBQU8sS0FBS0EsRUFBWjtBQUNELEtBbkJEOztBQXFCQXdDLFFBQUl6SixTQUFKLENBQWN1UixNQUFkLEdBQXVCLFlBQVc7QUFDaEMsVUFBSXRLLEVBQUo7QUFDQUEsV0FBSyxLQUFLOEosVUFBTCxFQUFMO0FBQ0E5SixTQUFHaUssU0FBSCxHQUFlakssR0FBR2lLLFNBQUgsQ0FBYXROLE9BQWIsQ0FBcUIsYUFBckIsRUFBb0MsRUFBcEMsQ0FBZjtBQUNBcUQsU0FBR2lLLFNBQUgsSUFBZ0IsZ0JBQWhCO0FBQ0ExUSxlQUFTb0gsSUFBVCxDQUFjc0osU0FBZCxHQUEwQjFRLFNBQVNvSCxJQUFULENBQWNzSixTQUFkLENBQXdCdE4sT0FBeEIsQ0FBZ0MsY0FBaEMsRUFBZ0QsRUFBaEQsQ0FBMUI7QUFDQSxhQUFPcEQsU0FBU29ILElBQVQsQ0FBY3NKLFNBQWQsSUFBMkIsWUFBbEM7QUFDRCxLQVBEOztBQVNBekgsUUFBSXpKLFNBQUosQ0FBY3dSLE1BQWQsR0FBdUIsVUFBU0MsSUFBVCxFQUFlO0FBQ3BDLFdBQUtYLFFBQUwsR0FBZ0JXLElBQWhCO0FBQ0EsYUFBTyxLQUFLQyxNQUFMLEVBQVA7QUFDRCxLQUhEOztBQUtBakksUUFBSXpKLFNBQUosQ0FBYzRJLE9BQWQsR0FBd0IsWUFBVztBQUNqQyxVQUFJO0FBQ0YsYUFBS21JLFVBQUwsR0FBa0JZLFVBQWxCLENBQTZCQyxXQUE3QixDQUF5QyxLQUFLYixVQUFMLEVBQXpDO0FBQ0QsT0FGRCxDQUVFLE9BQU9mLE1BQVAsRUFBZTtBQUNmaEcsd0JBQWdCZ0csTUFBaEI7QUFDRDtBQUNELGFBQU8sS0FBSy9JLEVBQUwsR0FBVSxLQUFLLENBQXRCO0FBQ0QsS0FQRDs7QUFTQXdDLFFBQUl6SixTQUFKLENBQWMwUixNQUFkLEdBQXVCLFlBQVc7QUFDaEMsVUFBSXpLLEVBQUosRUFBUWpGLEdBQVIsRUFBYTZQLFdBQWIsRUFBMEJDLFNBQTFCLEVBQXFDQyxFQUFyQyxFQUF5Q0MsS0FBekMsRUFBZ0RDLEtBQWhEO0FBQ0EsVUFBSXpSLFNBQVNvUCxhQUFULENBQXVCbFIsUUFBUWlQLE1BQS9CLEtBQTBDLElBQTlDLEVBQW9EO0FBQ2xELGVBQU8sS0FBUDtBQUNEO0FBQ0QxRyxXQUFLLEtBQUs4SixVQUFMLEVBQUw7QUFDQWUsa0JBQVksaUJBQWlCLEtBQUtoQixRQUF0QixHQUFpQyxVQUE3QztBQUNBbUIsY0FBUSxDQUFDLGlCQUFELEVBQW9CLGFBQXBCLEVBQW1DLFdBQW5DLENBQVI7QUFDQSxXQUFLRixLQUFLLENBQUwsRUFBUUMsUUFBUUMsTUFBTW5SLE1BQTNCLEVBQW1DaVIsS0FBS0MsS0FBeEMsRUFBK0NELElBQS9DLEVBQXFEO0FBQ25EL1AsY0FBTWlRLE1BQU1GLEVBQU4sQ0FBTjtBQUNBOUssV0FBR2lMLFFBQUgsQ0FBWSxDQUFaLEVBQWVDLEtBQWYsQ0FBcUJuUSxHQUFyQixJQUE0QjhQLFNBQTVCO0FBQ0Q7QUFDRCxVQUFJLENBQUMsS0FBS00sb0JBQU4sSUFBOEIsS0FBS0Esb0JBQUwsR0FBNEIsTUFBTSxLQUFLdEIsUUFBdkMsR0FBa0QsQ0FBcEYsRUFBdUY7QUFDckY3SixXQUFHaUwsUUFBSCxDQUFZLENBQVosRUFBZUcsWUFBZixDQUE0QixvQkFBNUIsRUFBa0QsTUFBTSxLQUFLdkIsUUFBTCxHQUFnQixDQUF0QixJQUEyQixHQUE3RTtBQUNBLFlBQUksS0FBS0EsUUFBTCxJQUFpQixHQUFyQixFQUEwQjtBQUN4QmUsd0JBQWMsSUFBZDtBQUNELFNBRkQsTUFFTztBQUNMQSx3QkFBYyxLQUFLZixRQUFMLEdBQWdCLEVBQWhCLEdBQXFCLEdBQXJCLEdBQTJCLEVBQXpDO0FBQ0FlLHlCQUFlLEtBQUtmLFFBQUwsR0FBZ0IsQ0FBL0I7QUFDRDtBQUNEN0osV0FBR2lMLFFBQUgsQ0FBWSxDQUFaLEVBQWVHLFlBQWYsQ0FBNEIsZUFBNUIsRUFBNkMsS0FBS1IsV0FBbEQ7QUFDRDtBQUNELGFBQU8sS0FBS08sb0JBQUwsR0FBNEIsS0FBS3RCLFFBQXhDO0FBQ0QsS0F2QkQ7O0FBeUJBckgsUUFBSXpKLFNBQUosQ0FBY3NTLElBQWQsR0FBcUIsWUFBVztBQUM5QixhQUFPLEtBQUt4QixRQUFMLElBQWlCLEdBQXhCO0FBQ0QsS0FGRDs7QUFJQSxXQUFPckgsR0FBUDtBQUVELEdBaEZLLEVBQU47O0FBa0ZBTSxXQUFVLFlBQVc7QUFDbkIsYUFBU0EsTUFBVCxHQUFrQjtBQUNoQixXQUFLeUcsUUFBTCxHQUFnQixFQUFoQjtBQUNEOztBQUVEekcsV0FBTy9KLFNBQVAsQ0FBaUJQLE9BQWpCLEdBQTJCLFVBQVM4UyxJQUFULEVBQWVsRCxHQUFmLEVBQW9CO0FBQzdDLFVBQUltRCxPQUFKLEVBQWFULEVBQWIsRUFBaUJDLEtBQWpCLEVBQXdCQyxLQUF4QixFQUErQnZCLFFBQS9CO0FBQ0EsVUFBSSxLQUFLRixRQUFMLENBQWMrQixJQUFkLEtBQXVCLElBQTNCLEVBQWlDO0FBQy9CTixnQkFBUSxLQUFLekIsUUFBTCxDQUFjK0IsSUFBZCxDQUFSO0FBQ0E3QixtQkFBVyxFQUFYO0FBQ0EsYUFBS3FCLEtBQUssQ0FBTCxFQUFRQyxRQUFRQyxNQUFNblIsTUFBM0IsRUFBbUNpUixLQUFLQyxLQUF4QyxFQUErQ0QsSUFBL0MsRUFBcUQ7QUFDbkRTLG9CQUFVUCxNQUFNRixFQUFOLENBQVY7QUFDQXJCLG1CQUFTRCxJQUFULENBQWMrQixRQUFRcFMsSUFBUixDQUFhLElBQWIsRUFBbUJpUCxHQUFuQixDQUFkO0FBQ0Q7QUFDRCxlQUFPcUIsUUFBUDtBQUNEO0FBQ0YsS0FYRDs7QUFhQTNHLFdBQU8vSixTQUFQLENBQWlCZSxFQUFqQixHQUFzQixVQUFTd1IsSUFBVCxFQUFlcEosRUFBZixFQUFtQjtBQUN2QyxVQUFJb0gsS0FBSjtBQUNBLFVBQUksQ0FBQ0EsUUFBUSxLQUFLQyxRQUFkLEVBQXdCK0IsSUFBeEIsS0FBaUMsSUFBckMsRUFBMkM7QUFDekNoQyxjQUFNZ0MsSUFBTixJQUFjLEVBQWQ7QUFDRDtBQUNELGFBQU8sS0FBSy9CLFFBQUwsQ0FBYytCLElBQWQsRUFBb0I5QixJQUFwQixDQUF5QnRILEVBQXpCLENBQVA7QUFDRCxLQU5EOztBQVFBLFdBQU9ZLE1BQVA7QUFFRCxHQTVCUSxFQUFUOztBQThCQThCLG9CQUFrQnRFLE9BQU9rTCxjQUF6Qjs7QUFFQTdHLG9CQUFrQnJFLE9BQU9tTCxjQUF6Qjs7QUFFQS9HLGVBQWFwRSxPQUFPb0wsU0FBcEI7O0FBRUEvSCxpQkFBZSxzQkFBU2dJLEVBQVQsRUFBYUMsSUFBYixFQUFtQjtBQUNoQyxRQUFJbFEsQ0FBSixFQUFPWCxHQUFQLEVBQVkwTyxRQUFaO0FBQ0FBLGVBQVcsRUFBWDtBQUNBLFNBQUsxTyxHQUFMLElBQVk2USxLQUFLN1MsU0FBakIsRUFBNEI7QUFDMUIsVUFBSTtBQUNGLFlBQUs0UyxHQUFHNVEsR0FBSCxLQUFXLElBQVosSUFBcUIsT0FBTzZRLEtBQUs3USxHQUFMLENBQVAsS0FBcUIsVUFBOUMsRUFBMEQ7QUFDeEQsY0FBSSxPQUFPOFEsT0FBT0MsY0FBZCxLQUFpQyxVQUFyQyxFQUFpRDtBQUMvQ3JDLHFCQUFTRCxJQUFULENBQWNxQyxPQUFPQyxjQUFQLENBQXNCSCxFQUF0QixFQUEwQjVRLEdBQTFCLEVBQStCO0FBQzNDZ1IsbUJBQUssZUFBVztBQUNkLHVCQUFPSCxLQUFLN1MsU0FBTCxDQUFlZ0MsR0FBZixDQUFQO0FBQ0QsZUFIMEM7QUFJM0NpUiw0QkFBYyxJQUo2QjtBQUszQ0MsMEJBQVk7QUFMK0IsYUFBL0IsQ0FBZDtBQU9ELFdBUkQsTUFRTztBQUNMeEMscUJBQVNELElBQVQsQ0FBY21DLEdBQUc1USxHQUFILElBQVU2USxLQUFLN1MsU0FBTCxDQUFlZ0MsR0FBZixDQUF4QjtBQUNEO0FBQ0YsU0FaRCxNQVlPO0FBQ0wwTyxtQkFBU0QsSUFBVCxDQUFjLEtBQUssQ0FBbkI7QUFDRDtBQUNGLE9BaEJELENBZ0JFLE9BQU9ULE1BQVAsRUFBZTtBQUNmck4sWUFBSXFOLE1BQUo7QUFDRDtBQUNGO0FBQ0QsV0FBT1UsUUFBUDtBQUNELEdBekJEOztBQTJCQTFGLGdCQUFjLEVBQWQ7O0FBRUFmLE9BQUtrSixNQUFMLEdBQWMsWUFBVztBQUN2QixRQUFJbEUsSUFBSixFQUFVOUYsRUFBVixFQUFjaUssR0FBZDtBQUNBakssU0FBSytGLFVBQVUsQ0FBVixDQUFMLEVBQW1CRCxPQUFPLEtBQUtDLFVBQVVwTyxNQUFmLEdBQXdCdUwsUUFBUWpNLElBQVIsQ0FBYThPLFNBQWIsRUFBd0IsQ0FBeEIsQ0FBeEIsR0FBcUQsRUFBL0U7QUFDQWxFLGdCQUFZcUksT0FBWixDQUFvQixRQUFwQjtBQUNBRCxVQUFNakssR0FBR2dHLEtBQUgsQ0FBUyxJQUFULEVBQWVGLElBQWYsQ0FBTjtBQUNBakUsZ0JBQVlzSSxLQUFaO0FBQ0EsV0FBT0YsR0FBUDtBQUNELEdBUEQ7O0FBU0FuSixPQUFLc0osS0FBTCxHQUFhLFlBQVc7QUFDdEIsUUFBSXRFLElBQUosRUFBVTlGLEVBQVYsRUFBY2lLLEdBQWQ7QUFDQWpLLFNBQUsrRixVQUFVLENBQVYsQ0FBTCxFQUFtQkQsT0FBTyxLQUFLQyxVQUFVcE8sTUFBZixHQUF3QnVMLFFBQVFqTSxJQUFSLENBQWE4TyxTQUFiLEVBQXdCLENBQXhCLENBQXhCLEdBQXFELEVBQS9FO0FBQ0FsRSxnQkFBWXFJLE9BQVosQ0FBb0IsT0FBcEI7QUFDQUQsVUFBTWpLLEdBQUdnRyxLQUFILENBQVMsSUFBVCxFQUFlRixJQUFmLENBQU47QUFDQWpFLGdCQUFZc0ksS0FBWjtBQUNBLFdBQU9GLEdBQVA7QUFDRCxHQVBEOztBQVNBN0gsZ0JBQWMscUJBQVNpSSxNQUFULEVBQWlCO0FBQzdCLFFBQUl2QixLQUFKO0FBQ0EsUUFBSXVCLFVBQVUsSUFBZCxFQUFvQjtBQUNsQkEsZUFBUyxLQUFUO0FBQ0Q7QUFDRCxRQUFJeEksWUFBWSxDQUFaLE1BQW1CLE9BQXZCLEVBQWdDO0FBQzlCLGFBQU8sT0FBUDtBQUNEO0FBQ0QsUUFBSSxDQUFDQSxZQUFZbEssTUFBYixJQUF1QnBDLFFBQVF5UCxJQUFuQyxFQUF5QztBQUN2QyxVQUFJcUYsV0FBVyxRQUFYLElBQXVCOVUsUUFBUXlQLElBQVIsQ0FBYUUsZUFBeEMsRUFBeUQ7QUFDdkQsZUFBTyxJQUFQO0FBQ0QsT0FGRCxNQUVPLElBQUk0RCxRQUFRdUIsT0FBT0MsV0FBUCxFQUFSLEVBQThCM0csVUFBVTFNLElBQVYsQ0FBZTFCLFFBQVF5UCxJQUFSLENBQWFDLFlBQTVCLEVBQTBDNkQsS0FBMUMsS0FBb0QsQ0FBdEYsRUFBeUY7QUFDOUYsZUFBTyxJQUFQO0FBQ0Q7QUFDRjtBQUNELFdBQU8sS0FBUDtBQUNELEdBaEJEOztBQWtCQS9ILHFCQUFvQixVQUFTMkcsTUFBVCxFQUFpQjtBQUNuQ3BFLGNBQVV2QyxnQkFBVixFQUE0QjJHLE1BQTVCOztBQUVBLGFBQVMzRyxnQkFBVCxHQUE0QjtBQUMxQixVQUFJd0osVUFBSjtBQUFBLFVBQ0VDLFFBQVEsSUFEVjtBQUVBekosdUJBQWlCMkMsU0FBakIsQ0FBMkJwTSxXQUEzQixDQUF1QzBPLEtBQXZDLENBQTZDLElBQTdDLEVBQW1ERCxTQUFuRDtBQUNBd0UsbUJBQWEsb0JBQVNFLEdBQVQsRUFBYztBQUN6QixZQUFJQyxLQUFKO0FBQ0FBLGdCQUFRRCxJQUFJRSxJQUFaO0FBQ0EsZUFBT0YsSUFBSUUsSUFBSixHQUFXLFVBQVNuVixJQUFULEVBQWVvVixHQUFmLEVBQW9CQyxLQUFwQixFQUEyQjtBQUMzQyxjQUFJekksWUFBWTVNLElBQVosQ0FBSixFQUF1QjtBQUNyQmdWLGtCQUFNbFUsT0FBTixDQUFjLFNBQWQsRUFBeUI7QUFDdkJkLG9CQUFNQSxJQURpQjtBQUV2Qm9WLG1CQUFLQSxHQUZrQjtBQUd2QkUsdUJBQVNMO0FBSGMsYUFBekI7QUFLRDtBQUNELGlCQUFPQyxNQUFNMUUsS0FBTixDQUFZeUUsR0FBWixFQUFpQjFFLFNBQWpCLENBQVA7QUFDRCxTQVREO0FBVUQsT0FiRDtBQWNBM0gsYUFBT2tMLGNBQVAsR0FBd0IsVUFBU3lCLEtBQVQsRUFBZ0I7QUFDdEMsWUFBSU4sR0FBSjtBQUNBQSxjQUFNLElBQUkvSCxlQUFKLENBQW9CcUksS0FBcEIsQ0FBTjtBQUNBUixtQkFBV0UsR0FBWDtBQUNBLGVBQU9BLEdBQVA7QUFDRCxPQUxEO0FBTUEsVUFBSTtBQUNGaEoscUJBQWFyRCxPQUFPa0wsY0FBcEIsRUFBb0M1RyxlQUFwQztBQUNELE9BRkQsQ0FFRSxPQUFPbUUsTUFBUCxFQUFlLENBQUU7QUFDbkIsVUFBSXBFLG1CQUFtQixJQUF2QixFQUE2QjtBQUMzQnJFLGVBQU9tTCxjQUFQLEdBQXdCLFlBQVc7QUFDakMsY0FBSWtCLEdBQUo7QUFDQUEsZ0JBQU0sSUFBSWhJLGVBQUosRUFBTjtBQUNBOEgscUJBQVdFLEdBQVg7QUFDQSxpQkFBT0EsR0FBUDtBQUNELFNBTEQ7QUFNQSxZQUFJO0FBQ0ZoSix1QkFBYXJELE9BQU9tTCxjQUFwQixFQUFvQzlHLGVBQXBDO0FBQ0QsU0FGRCxDQUVFLE9BQU9vRSxNQUFQLEVBQWUsQ0FBRTtBQUNwQjtBQUNELFVBQUtyRSxjQUFjLElBQWYsSUFBd0JqTixRQUFReVAsSUFBUixDQUFhRSxlQUF6QyxFQUEwRDtBQUN4RDlHLGVBQU9vTCxTQUFQLEdBQW1CLFVBQVNvQixHQUFULEVBQWNJLFNBQWQsRUFBeUI7QUFDMUMsY0FBSVAsR0FBSjtBQUNBLGNBQUlPLGFBQWEsSUFBakIsRUFBdUI7QUFDckJQLGtCQUFNLElBQUlqSSxVQUFKLENBQWVvSSxHQUFmLEVBQW9CSSxTQUFwQixDQUFOO0FBQ0QsV0FGRCxNQUVPO0FBQ0xQLGtCQUFNLElBQUlqSSxVQUFKLENBQWVvSSxHQUFmLENBQU47QUFDRDtBQUNELGNBQUl4SSxZQUFZLFFBQVosQ0FBSixFQUEyQjtBQUN6Qm9JLGtCQUFNbFUsT0FBTixDQUFjLFNBQWQsRUFBeUI7QUFDdkJkLG9CQUFNLFFBRGlCO0FBRXZCb1YsbUJBQUtBLEdBRmtCO0FBR3ZCSSx5QkFBV0EsU0FIWTtBQUl2QkYsdUJBQVNMO0FBSmMsYUFBekI7QUFNRDtBQUNELGlCQUFPQSxHQUFQO0FBQ0QsU0FoQkQ7QUFpQkEsWUFBSTtBQUNGaEosdUJBQWFyRCxPQUFPb0wsU0FBcEIsRUFBK0JoSCxVQUEvQjtBQUNELFNBRkQsQ0FFRSxPQUFPcUUsTUFBUCxFQUFlLENBQUU7QUFDcEI7QUFDRjs7QUFFRCxXQUFPOUYsZ0JBQVA7QUFFRCxHQW5Fa0IsQ0FtRWhCSCxNQW5FZ0IsQ0FBbkI7O0FBcUVBZ0MsZUFBYSxJQUFiOztBQUVBakIsaUJBQWUsd0JBQVc7QUFDeEIsUUFBSWlCLGNBQWMsSUFBbEIsRUFBd0I7QUFDdEJBLG1CQUFhLElBQUk3QixnQkFBSixFQUFiO0FBQ0Q7QUFDRCxXQUFPNkIsVUFBUDtBQUNELEdBTEQ7O0FBT0FULG9CQUFrQix5QkFBU3lJLEdBQVQsRUFBYztBQUM5QixRQUFJSyxPQUFKLEVBQWFyQyxFQUFiLEVBQWlCQyxLQUFqQixFQUF3QkMsS0FBeEI7QUFDQUEsWUFBUXZULFFBQVF5UCxJQUFSLENBQWFHLFVBQXJCO0FBQ0EsU0FBS3lELEtBQUssQ0FBTCxFQUFRQyxRQUFRQyxNQUFNblIsTUFBM0IsRUFBbUNpUixLQUFLQyxLQUF4QyxFQUErQ0QsSUFBL0MsRUFBcUQ7QUFDbkRxQyxnQkFBVW5DLE1BQU1GLEVBQU4sQ0FBVjtBQUNBLFVBQUksT0FBT3FDLE9BQVAsS0FBbUIsUUFBdkIsRUFBaUM7QUFDL0IsWUFBSUwsSUFBSWhILE9BQUosQ0FBWXFILE9BQVosTUFBeUIsQ0FBQyxDQUE5QixFQUFpQztBQUMvQixpQkFBTyxJQUFQO0FBQ0Q7QUFDRixPQUpELE1BSU87QUFDTCxZQUFJQSxRQUFRelEsSUFBUixDQUFhb1EsR0FBYixDQUFKLEVBQXVCO0FBQ3JCLGlCQUFPLElBQVA7QUFDRDtBQUNGO0FBQ0Y7QUFDRCxXQUFPLEtBQVA7QUFDRCxHQWhCRDs7QUFrQkFqSixpQkFBZS9KLEVBQWYsQ0FBa0IsU0FBbEIsRUFBNkIsVUFBU3NULElBQVQsRUFBZTtBQUMxQyxRQUFJQyxLQUFKLEVBQVdyRixJQUFYLEVBQWlCZ0YsT0FBakIsRUFBMEJ0VixJQUExQixFQUFnQ29WLEdBQWhDO0FBQ0FwVixXQUFPMFYsS0FBSzFWLElBQVosRUFBa0JzVixVQUFVSSxLQUFLSixPQUFqQyxFQUEwQ0YsTUFBTU0sS0FBS04sR0FBckQ7QUFDQSxRQUFJekksZ0JBQWdCeUksR0FBaEIsQ0FBSixFQUEwQjtBQUN4QjtBQUNEO0FBQ0QsUUFBSSxDQUFDOUosS0FBS3NLLE9BQU4sS0FBa0I3VixRQUFRZ1AscUJBQVIsS0FBa0MsS0FBbEMsSUFBMkNuQyxZQUFZNU0sSUFBWixNQUFzQixPQUFuRixDQUFKLEVBQWlHO0FBQy9Gc1EsYUFBT0MsU0FBUDtBQUNBb0YsY0FBUTVWLFFBQVFnUCxxQkFBUixJQUFpQyxDQUF6QztBQUNBLFVBQUksT0FBTzRHLEtBQVAsS0FBaUIsU0FBckIsRUFBZ0M7QUFDOUJBLGdCQUFRLENBQVI7QUFDRDtBQUNELGFBQU83UixXQUFXLFlBQVc7QUFDM0IsWUFBSStSLFdBQUosRUFBaUJ6QyxFQUFqQixFQUFxQkMsS0FBckIsRUFBNEJDLEtBQTVCLEVBQW1Dd0MsS0FBbkMsRUFBMEMvRCxRQUExQztBQUNBLFlBQUkvUixTQUFTLFFBQWIsRUFBdUI7QUFDckI2Vix3QkFBY1AsUUFBUVMsVUFBUixHQUFxQixDQUFuQztBQUNELFNBRkQsTUFFTztBQUNMRix3QkFBZSxLQUFLdkMsUUFBUWdDLFFBQVFTLFVBQXJCLEtBQW9DekMsUUFBUSxDQUEzRDtBQUNEO0FBQ0QsWUFBSXVDLFdBQUosRUFBaUI7QUFDZnZLLGVBQUswSyxPQUFMO0FBQ0FGLGtCQUFReEssS0FBS3dCLE9BQWI7QUFDQWlGLHFCQUFXLEVBQVg7QUFDQSxlQUFLcUIsS0FBSyxDQUFMLEVBQVFDLFFBQVF5QyxNQUFNM1QsTUFBM0IsRUFBbUNpUixLQUFLQyxLQUF4QyxFQUErQ0QsSUFBL0MsRUFBcUQ7QUFDbkR2RyxxQkFBU2lKLE1BQU0xQyxFQUFOLENBQVQ7QUFDQSxnQkFBSXZHLGtCQUFrQmhDLFdBQXRCLEVBQW1DO0FBQ2pDZ0MscUJBQU9vSixLQUFQLENBQWF6RixLQUFiLENBQW1CM0QsTUFBbkIsRUFBMkJ5RCxJQUEzQjtBQUNBO0FBQ0QsYUFIRCxNQUdPO0FBQ0x5Qix1QkFBU0QsSUFBVCxDQUFjLEtBQUssQ0FBbkI7QUFDRDtBQUNGO0FBQ0QsaUJBQU9DLFFBQVA7QUFDRDtBQUNGLE9BdEJNLEVBc0JKNEQsS0F0QkksQ0FBUDtBQXVCRDtBQUNGLEdBcENEOztBQXNDQTlLLGdCQUFlLFlBQVc7QUFDeEIsYUFBU0EsV0FBVCxHQUF1QjtBQUNyQixVQUFJbUssUUFBUSxJQUFaO0FBQ0EsV0FBSy9GLFFBQUwsR0FBZ0IsRUFBaEI7QUFDQTlDLHFCQUFlL0osRUFBZixDQUFrQixTQUFsQixFQUE2QixZQUFXO0FBQ3RDLGVBQU80UyxNQUFNaUIsS0FBTixDQUFZekYsS0FBWixDQUFrQndFLEtBQWxCLEVBQXlCekUsU0FBekIsQ0FBUDtBQUNELE9BRkQ7QUFHRDs7QUFFRDFGLGdCQUFZeEosU0FBWixDQUFzQjRVLEtBQXRCLEdBQThCLFVBQVNQLElBQVQsRUFBZTtBQUMzQyxVQUFJSixPQUFKLEVBQWFZLE9BQWIsRUFBc0JsVyxJQUF0QixFQUE0Qm9WLEdBQTVCO0FBQ0FwVixhQUFPMFYsS0FBSzFWLElBQVosRUFBa0JzVixVQUFVSSxLQUFLSixPQUFqQyxFQUEwQ0YsTUFBTU0sS0FBS04sR0FBckQ7QUFDQSxVQUFJekksZ0JBQWdCeUksR0FBaEIsQ0FBSixFQUEwQjtBQUN4QjtBQUNEO0FBQ0QsVUFBSXBWLFNBQVMsUUFBYixFQUF1QjtBQUNyQmtXLGtCQUFVLElBQUl4SyxvQkFBSixDQUF5QjRKLE9BQXpCLENBQVY7QUFDRCxPQUZELE1BRU87QUFDTFksa0JBQVUsSUFBSXZLLGlCQUFKLENBQXNCMkosT0FBdEIsQ0FBVjtBQUNEO0FBQ0QsYUFBTyxLQUFLckcsUUFBTCxDQUFjNkMsSUFBZCxDQUFtQm9FLE9BQW5CLENBQVA7QUFDRCxLQVpEOztBQWNBLFdBQU9yTCxXQUFQO0FBRUQsR0F6QmEsRUFBZDs7QUEyQkFjLHNCQUFxQixZQUFXO0FBQzlCLGFBQVNBLGlCQUFULENBQTJCMkosT0FBM0IsRUFBb0M7QUFDbEMsVUFBSTlELEtBQUo7QUFBQSxVQUFXMkUsSUFBWDtBQUFBLFVBQWlCL0MsRUFBakI7QUFBQSxVQUFxQkMsS0FBckI7QUFBQSxVQUE0QitDLG1CQUE1QjtBQUFBLFVBQWlEOUMsS0FBakQ7QUFBQSxVQUNFMEIsUUFBUSxJQURWO0FBRUEsV0FBSzdDLFFBQUwsR0FBZ0IsQ0FBaEI7QUFDQSxVQUFJdkosT0FBT3lOLGFBQVAsSUFBd0IsSUFBNUIsRUFBa0M7QUFDaENGLGVBQU8sSUFBUDtBQUNBYixnQkFBUWdCLGdCQUFSLENBQXlCLFVBQXpCLEVBQXFDLFVBQVNDLEdBQVQsRUFBYztBQUNqRCxjQUFJQSxJQUFJQyxnQkFBUixFQUEwQjtBQUN4QixtQkFBT3hCLE1BQU03QyxRQUFOLEdBQWlCLE1BQU1vRSxJQUFJRSxNQUFWLEdBQW1CRixJQUFJRyxLQUEvQztBQUNELFdBRkQsTUFFTztBQUNMLG1CQUFPMUIsTUFBTTdDLFFBQU4sR0FBaUI2QyxNQUFNN0MsUUFBTixHQUFpQixDQUFDLE1BQU02QyxNQUFNN0MsUUFBYixJQUF5QixDQUFsRTtBQUNEO0FBQ0YsU0FORCxFQU1HLEtBTkg7QUFPQW1CLGdCQUFRLENBQUMsTUFBRCxFQUFTLE9BQVQsRUFBa0IsU0FBbEIsRUFBNkIsT0FBN0IsQ0FBUjtBQUNBLGFBQUtGLEtBQUssQ0FBTCxFQUFRQyxRQUFRQyxNQUFNblIsTUFBM0IsRUFBbUNpUixLQUFLQyxLQUF4QyxFQUErQ0QsSUFBL0MsRUFBcUQ7QUFDbkQ1QixrQkFBUThCLE1BQU1GLEVBQU4sQ0FBUjtBQUNBa0Msa0JBQVFnQixnQkFBUixDQUF5QjlFLEtBQXpCLEVBQWdDLFlBQVc7QUFDekMsbUJBQU93RCxNQUFNN0MsUUFBTixHQUFpQixHQUF4QjtBQUNELFdBRkQsRUFFRyxLQUZIO0FBR0Q7QUFDRixPQWhCRCxNQWdCTztBQUNMaUUsOEJBQXNCZCxRQUFRcUIsa0JBQTlCO0FBQ0FyQixnQkFBUXFCLGtCQUFSLEdBQTZCLFlBQVc7QUFDdEMsY0FBSWIsS0FBSjtBQUNBLGNBQUksQ0FBQ0EsUUFBUVIsUUFBUVMsVUFBakIsTUFBaUMsQ0FBakMsSUFBc0NELFVBQVUsQ0FBcEQsRUFBdUQ7QUFDckRkLGtCQUFNN0MsUUFBTixHQUFpQixHQUFqQjtBQUNELFdBRkQsTUFFTyxJQUFJbUQsUUFBUVMsVUFBUixLQUF1QixDQUEzQixFQUE4QjtBQUNuQ2Ysa0JBQU03QyxRQUFOLEdBQWlCLEVBQWpCO0FBQ0Q7QUFDRCxpQkFBTyxPQUFPaUUsbUJBQVAsS0FBK0IsVUFBL0IsR0FBNENBLG9CQUFvQjVGLEtBQXBCLENBQTBCLElBQTFCLEVBQWdDRCxTQUFoQyxDQUE1QyxHQUF5RixLQUFLLENBQXJHO0FBQ0QsU0FSRDtBQVNEO0FBQ0Y7O0FBRUQsV0FBTzVFLGlCQUFQO0FBRUQsR0FyQ21CLEVBQXBCOztBQXVDQUQseUJBQXdCLFlBQVc7QUFDakMsYUFBU0Esb0JBQVQsQ0FBOEI0SixPQUE5QixFQUF1QztBQUNyQyxVQUFJOUQsS0FBSjtBQUFBLFVBQVc0QixFQUFYO0FBQUEsVUFBZUMsS0FBZjtBQUFBLFVBQXNCQyxLQUF0QjtBQUFBLFVBQ0UwQixRQUFRLElBRFY7QUFFQSxXQUFLN0MsUUFBTCxHQUFnQixDQUFoQjtBQUNBbUIsY0FBUSxDQUFDLE9BQUQsRUFBVSxNQUFWLENBQVI7QUFDQSxXQUFLRixLQUFLLENBQUwsRUFBUUMsUUFBUUMsTUFBTW5SLE1BQTNCLEVBQW1DaVIsS0FBS0MsS0FBeEMsRUFBK0NELElBQS9DLEVBQXFEO0FBQ25ENUIsZ0JBQVE4QixNQUFNRixFQUFOLENBQVI7QUFDQWtDLGdCQUFRZ0IsZ0JBQVIsQ0FBeUI5RSxLQUF6QixFQUFnQyxZQUFXO0FBQ3pDLGlCQUFPd0QsTUFBTTdDLFFBQU4sR0FBaUIsR0FBeEI7QUFDRCxTQUZELEVBRUcsS0FGSDtBQUdEO0FBQ0Y7O0FBRUQsV0FBT3pHLG9CQUFQO0FBRUQsR0FoQnNCLEVBQXZCOztBQWtCQVYsbUJBQWtCLFlBQVc7QUFDM0IsYUFBU0EsY0FBVCxDQUF3QmpMLE9BQXhCLEVBQWlDO0FBQy9CLFVBQUlhLFFBQUosRUFBY3dTLEVBQWQsRUFBa0JDLEtBQWxCLEVBQXlCQyxLQUF6QjtBQUNBLFVBQUl2VCxXQUFXLElBQWYsRUFBcUI7QUFDbkJBLGtCQUFVLEVBQVY7QUFDRDtBQUNELFdBQUtrUCxRQUFMLEdBQWdCLEVBQWhCO0FBQ0EsVUFBSWxQLFFBQVFvUCxTQUFSLElBQXFCLElBQXpCLEVBQStCO0FBQzdCcFAsZ0JBQVFvUCxTQUFSLEdBQW9CLEVBQXBCO0FBQ0Q7QUFDRG1FLGNBQVF2VCxRQUFRb1AsU0FBaEI7QUFDQSxXQUFLaUUsS0FBSyxDQUFMLEVBQVFDLFFBQVFDLE1BQU1uUixNQUEzQixFQUFtQ2lSLEtBQUtDLEtBQXhDLEVBQStDRCxJQUEvQyxFQUFxRDtBQUNuRHhTLG1CQUFXMFMsTUFBTUYsRUFBTixDQUFYO0FBQ0EsYUFBS25FLFFBQUwsQ0FBYzZDLElBQWQsQ0FBbUIsSUFBSTdHLGNBQUosQ0FBbUJySyxRQUFuQixDQUFuQjtBQUNEO0FBQ0Y7O0FBRUQsV0FBT29LLGNBQVA7QUFFRCxHQW5CZ0IsRUFBakI7O0FBcUJBQyxtQkFBa0IsWUFBVztBQUMzQixhQUFTQSxjQUFULENBQXdCckssUUFBeEIsRUFBa0M7QUFDaEMsV0FBS0EsUUFBTCxHQUFnQkEsUUFBaEI7QUFDQSxXQUFLdVIsUUFBTCxHQUFnQixDQUFoQjtBQUNBLFdBQUt5RSxLQUFMO0FBQ0Q7O0FBRUQzTCxtQkFBZTVKLFNBQWYsQ0FBeUJ1VixLQUF6QixHQUFpQyxZQUFXO0FBQzFDLFVBQUk1QixRQUFRLElBQVo7QUFDQSxVQUFJblQsU0FBU29QLGFBQVQsQ0FBdUIsS0FBS3JRLFFBQTVCLENBQUosRUFBMkM7QUFDekMsZUFBTyxLQUFLK1MsSUFBTCxFQUFQO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsZUFBTzdQLFdBQVksWUFBVztBQUM1QixpQkFBT2tSLE1BQU00QixLQUFOLEVBQVA7QUFDRCxTQUZNLEVBRUg3VyxRQUFRa1AsUUFBUixDQUFpQkMsYUFGZCxDQUFQO0FBR0Q7QUFDRixLQVREOztBQVdBakUsbUJBQWU1SixTQUFmLENBQXlCc1MsSUFBekIsR0FBZ0MsWUFBVztBQUN6QyxhQUFPLEtBQUt4QixRQUFMLEdBQWdCLEdBQXZCO0FBQ0QsS0FGRDs7QUFJQSxXQUFPbEgsY0FBUDtBQUVELEdBeEJnQixFQUFqQjs7QUEwQkFGLG9CQUFtQixZQUFXO0FBQzVCQSxvQkFBZ0IxSixTQUFoQixDQUEwQndWLE1BQTFCLEdBQW1DO0FBQ2pDQyxlQUFTLENBRHdCO0FBRWpDQyxtQkFBYSxFQUZvQjtBQUdqQ3ZRLGdCQUFVO0FBSHVCLEtBQW5DOztBQU1BLGFBQVN1RSxlQUFULEdBQTJCO0FBQ3pCLFVBQUlxTCxtQkFBSjtBQUFBLFVBQXlCOUMsS0FBekI7QUFBQSxVQUNFMEIsUUFBUSxJQURWO0FBRUEsV0FBSzdDLFFBQUwsR0FBZ0IsQ0FBQ21CLFFBQVEsS0FBS3VELE1BQUwsQ0FBWWhWLFNBQVNrVSxVQUFyQixDQUFULEtBQThDLElBQTlDLEdBQXFEekMsS0FBckQsR0FBNkQsR0FBN0U7QUFDQThDLDRCQUFzQnZVLFNBQVM4VSxrQkFBL0I7QUFDQTlVLGVBQVM4VSxrQkFBVCxHQUE4QixZQUFXO0FBQ3ZDLFlBQUkzQixNQUFNNkIsTUFBTixDQUFhaFYsU0FBU2tVLFVBQXRCLEtBQXFDLElBQXpDLEVBQStDO0FBQzdDZixnQkFBTTdDLFFBQU4sR0FBaUI2QyxNQUFNNkIsTUFBTixDQUFhaFYsU0FBU2tVLFVBQXRCLENBQWpCO0FBQ0Q7QUFDRCxlQUFPLE9BQU9LLG1CQUFQLEtBQStCLFVBQS9CLEdBQTRDQSxvQkFBb0I1RixLQUFwQixDQUEwQixJQUExQixFQUFnQ0QsU0FBaEMsQ0FBNUMsR0FBeUYsS0FBSyxDQUFyRztBQUNELE9BTEQ7QUFNRDs7QUFFRCxXQUFPeEYsZUFBUDtBQUVELEdBdEJpQixFQUFsQjs7QUF3QkFHLG9CQUFtQixZQUFXO0FBQzVCLGFBQVNBLGVBQVQsR0FBMkI7QUFDekIsVUFBSThMLEdBQUo7QUFBQSxVQUFTQyxRQUFUO0FBQUEsVUFBbUI5RyxJQUFuQjtBQUFBLFVBQXlCK0csTUFBekI7QUFBQSxVQUFpQ0MsT0FBakM7QUFBQSxVQUNFbkMsUUFBUSxJQURWO0FBRUEsV0FBSzdDLFFBQUwsR0FBZ0IsQ0FBaEI7QUFDQTZFLFlBQU0sQ0FBTjtBQUNBRyxnQkFBVSxFQUFWO0FBQ0FELGVBQVMsQ0FBVDtBQUNBL0csYUFBTzdELEtBQVA7QUFDQTJLLGlCQUFXRyxZQUFZLFlBQVc7QUFDaEMsWUFBSS9HLElBQUo7QUFDQUEsZUFBTy9ELFFBQVE2RCxJQUFSLEdBQWUsRUFBdEI7QUFDQUEsZUFBTzdELEtBQVA7QUFDQTZLLGdCQUFRckYsSUFBUixDQUFhekIsSUFBYjtBQUNBLFlBQUk4RyxRQUFRaFYsTUFBUixHQUFpQnBDLFFBQVFxUCxRQUFSLENBQWlCRSxXQUF0QyxFQUFtRDtBQUNqRDZILGtCQUFReEMsS0FBUjtBQUNEO0FBQ0RxQyxjQUFNcEwsYUFBYXVMLE9BQWIsQ0FBTjtBQUNBLFlBQUksRUFBRUQsTUFBRixJQUFZblgsUUFBUXFQLFFBQVIsQ0FBaUJDLFVBQTdCLElBQTJDMkgsTUFBTWpYLFFBQVFxUCxRQUFSLENBQWlCRyxZQUF0RSxFQUFvRjtBQUNsRnlGLGdCQUFNN0MsUUFBTixHQUFpQixHQUFqQjtBQUNBLGlCQUFPa0YsY0FBY0osUUFBZCxDQUFQO0FBQ0QsU0FIRCxNQUdPO0FBQ0wsaUJBQU9qQyxNQUFNN0MsUUFBTixHQUFpQixPQUFPLEtBQUs2RSxNQUFNLENBQVgsQ0FBUCxDQUF4QjtBQUNEO0FBQ0YsT0FmVSxFQWVSLEVBZlEsQ0FBWDtBQWdCRDs7QUFFRCxXQUFPOUwsZUFBUDtBQUVELEdBN0JpQixFQUFsQjs7QUErQkFPLFdBQVUsWUFBVztBQUNuQixhQUFTQSxNQUFULENBQWdCb0IsTUFBaEIsRUFBd0I7QUFDdEIsV0FBS0EsTUFBTCxHQUFjQSxNQUFkO0FBQ0EsV0FBS3NELElBQUwsR0FBWSxLQUFLbUgsZUFBTCxHQUF1QixDQUFuQztBQUNBLFdBQUtDLElBQUwsR0FBWXhYLFFBQVF5TyxXQUFwQjtBQUNBLFdBQUtnSixPQUFMLEdBQWUsQ0FBZjtBQUNBLFdBQUtyRixRQUFMLEdBQWdCLEtBQUtzRixZQUFMLEdBQW9CLENBQXBDO0FBQ0EsVUFBSSxLQUFLNUssTUFBTCxJQUFlLElBQW5CLEVBQXlCO0FBQ3ZCLGFBQUtzRixRQUFMLEdBQWdCM0YsT0FBTyxLQUFLSyxNQUFaLEVBQW9CLFVBQXBCLENBQWhCO0FBQ0Q7QUFDRjs7QUFFRHBCLFdBQU9wSyxTQUFQLENBQWlCK08sSUFBakIsR0FBd0IsVUFBU3NILFNBQVQsRUFBb0JoSCxHQUFwQixFQUF5QjtBQUMvQyxVQUFJaUgsT0FBSjtBQUNBLFVBQUlqSCxPQUFPLElBQVgsRUFBaUI7QUFDZkEsY0FBTWxFLE9BQU8sS0FBS0ssTUFBWixFQUFvQixVQUFwQixDQUFOO0FBQ0Q7QUFDRCxVQUFJNkQsT0FBTyxHQUFYLEVBQWdCO0FBQ2QsYUFBS2lELElBQUwsR0FBWSxJQUFaO0FBQ0Q7QUFDRCxVQUFJakQsUUFBUSxLQUFLUCxJQUFqQixFQUF1QjtBQUNyQixhQUFLbUgsZUFBTCxJQUF3QkksU0FBeEI7QUFDRCxPQUZELE1BRU87QUFDTCxZQUFJLEtBQUtKLGVBQVQsRUFBMEI7QUFDeEIsZUFBS0MsSUFBTCxHQUFZLENBQUM3RyxNQUFNLEtBQUtQLElBQVosSUFBb0IsS0FBS21ILGVBQXJDO0FBQ0Q7QUFDRCxhQUFLRSxPQUFMLEdBQWUsQ0FBQzlHLE1BQU0sS0FBS3lCLFFBQVosSUFBd0JwUyxRQUFRd08sV0FBL0M7QUFDQSxhQUFLK0ksZUFBTCxHQUF1QixDQUF2QjtBQUNBLGFBQUtuSCxJQUFMLEdBQVlPLEdBQVo7QUFDRDtBQUNELFVBQUlBLE1BQU0sS0FBS3lCLFFBQWYsRUFBeUI7QUFDdkIsYUFBS0EsUUFBTCxJQUFpQixLQUFLcUYsT0FBTCxHQUFlRSxTQUFoQztBQUNEO0FBQ0RDLGdCQUFVLElBQUlwUSxLQUFLcVEsR0FBTCxDQUFTLEtBQUt6RixRQUFMLEdBQWdCLEdBQXpCLEVBQThCcFMsUUFBUTZPLFVBQXRDLENBQWQ7QUFDQSxXQUFLdUQsUUFBTCxJQUFpQndGLFVBQVUsS0FBS0osSUFBZixHQUFzQkcsU0FBdkM7QUFDQSxXQUFLdkYsUUFBTCxHQUFnQjVLLEtBQUtzUSxHQUFMLENBQVMsS0FBS0osWUFBTCxHQUFvQjFYLFFBQVE0TyxtQkFBckMsRUFBMEQsS0FBS3dELFFBQS9ELENBQWhCO0FBQ0EsV0FBS0EsUUFBTCxHQUFnQjVLLEtBQUt1USxHQUFMLENBQVMsQ0FBVCxFQUFZLEtBQUszRixRQUFqQixDQUFoQjtBQUNBLFdBQUtBLFFBQUwsR0FBZ0I1SyxLQUFLc1EsR0FBTCxDQUFTLEdBQVQsRUFBYyxLQUFLMUYsUUFBbkIsQ0FBaEI7QUFDQSxXQUFLc0YsWUFBTCxHQUFvQixLQUFLdEYsUUFBekI7QUFDQSxhQUFPLEtBQUtBLFFBQVo7QUFDRCxLQTVCRDs7QUE4QkEsV0FBTzFHLE1BQVA7QUFFRCxHQTVDUSxFQUFUOztBQThDQXFCLFlBQVUsSUFBVjs7QUFFQUosWUFBVSxJQUFWOztBQUVBYixRQUFNLElBQU47O0FBRUFrQixjQUFZLElBQVo7O0FBRUFyTSxjQUFZLElBQVo7O0FBRUFvTCxvQkFBa0IsSUFBbEI7O0FBRUFSLE9BQUtzSyxPQUFMLEdBQWUsS0FBZjs7QUFFQXhKLG9CQUFrQiwyQkFBVztBQUMzQixRQUFJck0sUUFBUStPLGtCQUFaLEVBQWdDO0FBQzlCLGFBQU94RCxLQUFLMEssT0FBTCxFQUFQO0FBQ0Q7QUFDRixHQUpEOztBQU1BLE1BQUlwTixPQUFPbVAsT0FBUCxDQUFlQyxTQUFmLElBQTRCLElBQWhDLEVBQXNDO0FBQ3BDMUssaUJBQWExRSxPQUFPbVAsT0FBUCxDQUFlQyxTQUE1QjtBQUNBcFAsV0FBT21QLE9BQVAsQ0FBZUMsU0FBZixHQUEyQixZQUFXO0FBQ3BDNUw7QUFDQSxhQUFPa0IsV0FBV2tELEtBQVgsQ0FBaUI1SCxPQUFPbVAsT0FBeEIsRUFBaUN4SCxTQUFqQyxDQUFQO0FBQ0QsS0FIRDtBQUlEOztBQUVELE1BQUkzSCxPQUFPbVAsT0FBUCxDQUFlRSxZQUFmLElBQStCLElBQW5DLEVBQXlDO0FBQ3ZDeEssb0JBQWdCN0UsT0FBT21QLE9BQVAsQ0FBZUUsWUFBL0I7QUFDQXJQLFdBQU9tUCxPQUFQLENBQWVFLFlBQWYsR0FBOEIsWUFBVztBQUN2QzdMO0FBQ0EsYUFBT3FCLGNBQWMrQyxLQUFkLENBQW9CNUgsT0FBT21QLE9BQTNCLEVBQW9DeEgsU0FBcEMsQ0FBUDtBQUNELEtBSEQ7QUFJRDs7QUFFRC9FLGdCQUFjO0FBQ1pnRSxVQUFNM0UsV0FETTtBQUVab0UsY0FBVWpFLGNBRkU7QUFHWm5KLGNBQVVrSixlQUhFO0FBSVpxRSxjQUFVbEU7QUFKRSxHQUFkOztBQU9BLEdBQUM1SyxPQUFPLGdCQUFXO0FBQ2pCLFFBQUlOLElBQUosRUFBVW9ULEVBQVYsRUFBYzhFLEVBQWQsRUFBa0I3RSxLQUFsQixFQUF5QjhFLEtBQXpCLEVBQWdDN0UsS0FBaEMsRUFBdUN3QyxLQUF2QyxFQUE4Q3NDLEtBQTlDO0FBQ0E5TSxTQUFLd0IsT0FBTCxHQUFlQSxVQUFVLEVBQXpCO0FBQ0F3RyxZQUFRLENBQUMsTUFBRCxFQUFTLFVBQVQsRUFBcUIsVUFBckIsRUFBaUMsVUFBakMsQ0FBUjtBQUNBLFNBQUtGLEtBQUssQ0FBTCxFQUFRQyxRQUFRQyxNQUFNblIsTUFBM0IsRUFBbUNpUixLQUFLQyxLQUF4QyxFQUErQ0QsSUFBL0MsRUFBcUQ7QUFDbkRwVCxhQUFPc1QsTUFBTUYsRUFBTixDQUFQO0FBQ0EsVUFBSXJULFFBQVFDLElBQVIsTUFBa0IsS0FBdEIsRUFBNkI7QUFDM0I4TSxnQkFBUWdGLElBQVIsQ0FBYSxJQUFJdEcsWUFBWXhMLElBQVosQ0FBSixDQUFzQkQsUUFBUUMsSUFBUixDQUF0QixDQUFiO0FBQ0Q7QUFDRjtBQUNEb1ksWUFBUSxDQUFDdEMsUUFBUS9WLFFBQVFzWSxZQUFqQixLQUFrQyxJQUFsQyxHQUF5Q3ZDLEtBQXpDLEdBQWlELEVBQXpEO0FBQ0EsU0FBS29DLEtBQUssQ0FBTCxFQUFRQyxRQUFRQyxNQUFNalcsTUFBM0IsRUFBbUMrVixLQUFLQyxLQUF4QyxFQUErQ0QsSUFBL0MsRUFBcUQ7QUFDbkRyTCxlQUFTdUwsTUFBTUYsRUFBTixDQUFUO0FBQ0FwTCxjQUFRZ0YsSUFBUixDQUFhLElBQUlqRixNQUFKLENBQVc5TSxPQUFYLENBQWI7QUFDRDtBQUNEdUwsU0FBS08sR0FBTCxHQUFXQSxNQUFNLElBQUlmLEdBQUosRUFBakI7QUFDQTRCLGNBQVUsRUFBVjtBQUNBLFdBQU9LLFlBQVksSUFBSXRCLE1BQUosRUFBbkI7QUFDRCxHQWxCRDs7QUFvQkFILE9BQUtnTixJQUFMLEdBQVksWUFBVztBQUNyQmhOLFNBQUt4SyxPQUFMLENBQWEsTUFBYjtBQUNBd0ssU0FBS3NLLE9BQUwsR0FBZSxLQUFmO0FBQ0EvSixRQUFJNUIsT0FBSjtBQUNBNkIsc0JBQWtCLElBQWxCO0FBQ0EsUUFBSXBMLGFBQWEsSUFBakIsRUFBdUI7QUFDckIsVUFBSSxPQUFPcUwsb0JBQVAsS0FBZ0MsVUFBcEMsRUFBZ0Q7QUFDOUNBLDZCQUFxQnJMLFNBQXJCO0FBQ0Q7QUFDREEsa0JBQVksSUFBWjtBQUNEO0FBQ0QsV0FBT0osTUFBUDtBQUNELEdBWkQ7O0FBY0FnTCxPQUFLMEssT0FBTCxHQUFlLFlBQVc7QUFDeEIxSyxTQUFLeEssT0FBTCxDQUFhLFNBQWI7QUFDQXdLLFNBQUtnTixJQUFMO0FBQ0EsV0FBT2hOLEtBQUtpTixLQUFMLEVBQVA7QUFDRCxHQUpEOztBQU1Bak4sT0FBS2tOLEVBQUwsR0FBVSxZQUFXO0FBQ25CLFFBQUlELEtBQUo7QUFDQWpOLFNBQUtzSyxPQUFMLEdBQWUsSUFBZjtBQUNBL0osUUFBSWtILE1BQUo7QUFDQXdGLFlBQVFqTSxLQUFSO0FBQ0FSLHNCQUFrQixLQUFsQjtBQUNBLFdBQU9wTCxZQUFZK0wsYUFBYSxVQUFTaUwsU0FBVCxFQUFvQmUsZ0JBQXBCLEVBQXNDO0FBQ3BFLFVBQUl6QixHQUFKLEVBQVNwRyxLQUFULEVBQWdCK0MsSUFBaEIsRUFBc0I3VCxPQUF0QixFQUErQm1QLFFBQS9CLEVBQXlDL00sQ0FBekMsRUFBNEN3VyxDQUE1QyxFQUErQ0MsU0FBL0MsRUFBMERDLE1BQTFELEVBQWtFQyxVQUFsRSxFQUE4RWhJLEdBQTlFLEVBQW1GdUMsRUFBbkYsRUFBdUY4RSxFQUF2RixFQUEyRjdFLEtBQTNGLEVBQWtHOEUsS0FBbEcsRUFBeUc3RSxLQUF6RztBQUNBcUYsa0JBQVksTUFBTTlNLElBQUlzRyxRQUF0QjtBQUNBdkIsY0FBUUMsTUFBTSxDQUFkO0FBQ0E4QyxhQUFPLElBQVA7QUFDQSxXQUFLelIsSUFBSWtSLEtBQUssQ0FBVCxFQUFZQyxRQUFRdkcsUUFBUTNLLE1BQWpDLEVBQXlDaVIsS0FBS0MsS0FBOUMsRUFBcURuUixJQUFJLEVBQUVrUixFQUEzRCxFQUErRDtBQUM3RHZHLGlCQUFTQyxRQUFRNUssQ0FBUixDQUFUO0FBQ0EyVyxxQkFBYW5NLFFBQVF4SyxDQUFSLEtBQWMsSUFBZCxHQUFxQndLLFFBQVF4SyxDQUFSLENBQXJCLEdBQWtDd0ssUUFBUXhLLENBQVIsSUFBYSxFQUE1RDtBQUNBK00sbUJBQVcsQ0FBQ3FFLFFBQVF6RyxPQUFPb0MsUUFBaEIsS0FBNkIsSUFBN0IsR0FBb0NxRSxLQUFwQyxHQUE0QyxDQUFDekcsTUFBRCxDQUF2RDtBQUNBLGFBQUs2TCxJQUFJUixLQUFLLENBQVQsRUFBWUMsUUFBUWxKLFNBQVM5TSxNQUFsQyxFQUEwQytWLEtBQUtDLEtBQS9DLEVBQXNETyxJQUFJLEVBQUVSLEVBQTVELEVBQWdFO0FBQzlEcFksb0JBQVVtUCxTQUFTeUosQ0FBVCxDQUFWO0FBQ0FFLG1CQUFTQyxXQUFXSCxDQUFYLEtBQWlCLElBQWpCLEdBQXdCRyxXQUFXSCxDQUFYLENBQXhCLEdBQXdDRyxXQUFXSCxDQUFYLElBQWdCLElBQUlqTixNQUFKLENBQVczTCxPQUFYLENBQWpFO0FBQ0E2VCxrQkFBUWlGLE9BQU9qRixJQUFmO0FBQ0EsY0FBSWlGLE9BQU9qRixJQUFYLEVBQWlCO0FBQ2Y7QUFDRDtBQUNEL0M7QUFDQUMsaUJBQU8rSCxPQUFPeEksSUFBUCxDQUFZc0gsU0FBWixDQUFQO0FBQ0Q7QUFDRjtBQUNEVixZQUFNbkcsTUFBTUQsS0FBWjtBQUNBL0UsVUFBSWdILE1BQUosQ0FBVzlGLFVBQVVxRCxJQUFWLENBQWVzSCxTQUFmLEVBQTBCVixHQUExQixDQUFYO0FBQ0EsVUFBSW5MLElBQUk4SCxJQUFKLE1BQWNBLElBQWQsSUFBc0I3SCxlQUExQixFQUEyQztBQUN6Q0QsWUFBSWdILE1BQUosQ0FBVyxHQUFYO0FBQ0F2SCxhQUFLeEssT0FBTCxDQUFhLE1BQWI7QUFDQSxlQUFPZ0QsV0FBVyxZQUFXO0FBQzNCK0gsY0FBSStHLE1BQUo7QUFDQXRILGVBQUtzSyxPQUFMLEdBQWUsS0FBZjtBQUNBLGlCQUFPdEssS0FBS3hLLE9BQUwsQ0FBYSxNQUFiLENBQVA7QUFDRCxTQUpNLEVBSUp5RyxLQUFLdVEsR0FBTCxDQUFTL1gsUUFBUTJPLFNBQWpCLEVBQTRCbkgsS0FBS3VRLEdBQUwsQ0FBUy9YLFFBQVEwTyxPQUFSLElBQW1CbkMsUUFBUWlNLEtBQTNCLENBQVQsRUFBNEMsQ0FBNUMsQ0FBNUIsQ0FKSSxDQUFQO0FBS0QsT0FSRCxNQVFPO0FBQ0wsZUFBT0Usa0JBQVA7QUFDRDtBQUNGLEtBakNrQixDQUFuQjtBQWtDRCxHQXhDRDs7QUEwQ0FuTixPQUFLaU4sS0FBTCxHQUFhLFVBQVM1VixRQUFULEVBQW1CO0FBQzlCQyxZQUFPN0MsT0FBUCxFQUFnQjRDLFFBQWhCO0FBQ0EySSxTQUFLc0ssT0FBTCxHQUFlLElBQWY7QUFDQSxRQUFJO0FBQ0YvSixVQUFJa0gsTUFBSjtBQUNELEtBRkQsQ0FFRSxPQUFPMUIsTUFBUCxFQUFlO0FBQ2ZoRyxzQkFBZ0JnRyxNQUFoQjtBQUNEO0FBQ0QsUUFBSSxDQUFDeFAsU0FBU29QLGFBQVQsQ0FBdUIsT0FBdkIsQ0FBTCxFQUFzQztBQUNwQyxhQUFPbk4sV0FBV3dILEtBQUtpTixLQUFoQixFQUF1QixFQUF2QixDQUFQO0FBQ0QsS0FGRCxNQUVPO0FBQ0xqTixXQUFLeEssT0FBTCxDQUFhLE9BQWI7QUFDQSxhQUFPd0ssS0FBS2tOLEVBQUwsRUFBUDtBQUNEO0FBQ0YsR0FkRDs7QUFnQkEsTUFBSSxPQUFPTSxNQUFQLEtBQWtCLFVBQWxCLElBQWdDQSxPQUFPQyxHQUEzQyxFQUFnRDtBQUM5Q0QsV0FBTyxDQUFDLE1BQUQsQ0FBUCxFQUFpQixZQUFXO0FBQzFCLGFBQU94TixJQUFQO0FBQ0QsS0FGRDtBQUdELEdBSkQsTUFJTyxJQUFJLFFBQU8wTixPQUFQLHlDQUFPQSxPQUFQLE9BQW1CLFFBQXZCLEVBQWlDO0FBQ3RDQyxXQUFPRCxPQUFQLEdBQWlCMU4sSUFBakI7QUFDRCxHQUZNLE1BRUE7QUFDTCxRQUFJdkwsUUFBUThPLGVBQVosRUFBNkI7QUFDM0J2RCxXQUFLaU4sS0FBTDtBQUNEO0FBQ0Y7QUFFRixDQXQ2QkQsRUFzNkJHOVcsSUF0NkJIOzs7QUNBQW1KLE9BQU8sVUFBU2hMLENBQVQsRUFBWTtBQUNmOztBQUVBOztBQUNBLFFBQUdzWixVQUFVQyxXQUFiLEVBQTBCO0FBQ3RCdlosVUFBRSx1QkFBRixFQUEyQjZLLE9BQTNCLENBQW1DLE1BQW5DO0FBQ0gsS0FGRCxNQUdLO0FBQ0Q3SyxVQUFFLHVCQUFGLEVBQTJCNkssT0FBM0I7QUFDSDtBQUNKLENBVkQiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBCb290c3RyYXA6IHRvb2x0aXAuanMgdjMuMy43XG4gKiBodHRwOi8vZ2V0Ym9vdHN0cmFwLmNvbS9qYXZhc2NyaXB0LyN0b29sdGlwXG4gKiBJbnNwaXJlZCBieSB0aGUgb3JpZ2luYWwgalF1ZXJ5LnRpcHN5IGJ5IEphc29uIEZyYW1lXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIENvcHlyaWdodCAyMDExLTIwMTYgVHdpdHRlciwgSW5jLlxuICogTGljZW5zZWQgdW5kZXIgTUlUIChodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvYmxvYi9tYXN0ZXIvTElDRU5TRSlcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xuXG5cbitmdW5jdGlvbiAoJCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gVE9PTFRJUCBQVUJMSUMgQ0xBU1MgREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgdmFyIFRvb2x0aXAgPSBmdW5jdGlvbiAoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMudHlwZSAgICAgICA9IG51bGxcbiAgICB0aGlzLm9wdGlvbnMgICAgPSBudWxsXG4gICAgdGhpcy5lbmFibGVkICAgID0gbnVsbFxuICAgIHRoaXMudGltZW91dCAgICA9IG51bGxcbiAgICB0aGlzLmhvdmVyU3RhdGUgPSBudWxsXG4gICAgdGhpcy4kZWxlbWVudCAgID0gbnVsbFxuICAgIHRoaXMuaW5TdGF0ZSAgICA9IG51bGxcblxuICAgIHRoaXMuaW5pdCgndG9vbHRpcCcsIGVsZW1lbnQsIG9wdGlvbnMpXG4gIH1cblxuICBUb29sdGlwLlZFUlNJT04gID0gJzMuMy43J1xuXG4gIFRvb2x0aXAuVFJBTlNJVElPTl9EVVJBVElPTiA9IDE1MFxuXG4gIFRvb2x0aXAuREVGQVVMVFMgPSB7XG4gICAgYW5pbWF0aW9uOiB0cnVlLFxuICAgIHBsYWNlbWVudDogJ3RvcCcsXG4gICAgc2VsZWN0b3I6IGZhbHNlLFxuICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRvb2x0aXBcIiByb2xlPVwidG9vbHRpcFwiPjxkaXYgY2xhc3M9XCJ0b29sdGlwLWFycm93XCI+PC9kaXY+PGRpdiBjbGFzcz1cInRvb2x0aXAtaW5uZXJcIj48L2Rpdj48L2Rpdj4nLFxuICAgIHRyaWdnZXI6ICdob3ZlciBmb2N1cycsXG4gICAgdGl0bGU6ICcnLFxuICAgIGRlbGF5OiAwLFxuICAgIGh0bWw6IGZhbHNlLFxuICAgIGNvbnRhaW5lcjogZmFsc2UsXG4gICAgdmlld3BvcnQ6IHtcbiAgICAgIHNlbGVjdG9yOiAnYm9keScsXG4gICAgICBwYWRkaW5nOiAwXG4gICAgfVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICh0eXBlLCBlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy5lbmFibGVkICAgPSB0cnVlXG4gICAgdGhpcy50eXBlICAgICAgPSB0eXBlXG4gICAgdGhpcy4kZWxlbWVudCAgPSAkKGVsZW1lbnQpXG4gICAgdGhpcy5vcHRpb25zICAgPSB0aGlzLmdldE9wdGlvbnMob3B0aW9ucylcbiAgICB0aGlzLiR2aWV3cG9ydCA9IHRoaXMub3B0aW9ucy52aWV3cG9ydCAmJiAkKCQuaXNGdW5jdGlvbih0aGlzLm9wdGlvbnMudmlld3BvcnQpID8gdGhpcy5vcHRpb25zLnZpZXdwb3J0LmNhbGwodGhpcywgdGhpcy4kZWxlbWVudCkgOiAodGhpcy5vcHRpb25zLnZpZXdwb3J0LnNlbGVjdG9yIHx8IHRoaXMub3B0aW9ucy52aWV3cG9ydCkpXG4gICAgdGhpcy5pblN0YXRlICAgPSB7IGNsaWNrOiBmYWxzZSwgaG92ZXI6IGZhbHNlLCBmb2N1czogZmFsc2UgfVxuXG4gICAgaWYgKHRoaXMuJGVsZW1lbnRbMF0gaW5zdGFuY2VvZiBkb2N1bWVudC5jb25zdHJ1Y3RvciAmJiAhdGhpcy5vcHRpb25zLnNlbGVjdG9yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2BzZWxlY3RvcmAgb3B0aW9uIG11c3QgYmUgc3BlY2lmaWVkIHdoZW4gaW5pdGlhbGl6aW5nICcgKyB0aGlzLnR5cGUgKyAnIG9uIHRoZSB3aW5kb3cuZG9jdW1lbnQgb2JqZWN0IScpXG4gICAgfVxuXG4gICAgdmFyIHRyaWdnZXJzID0gdGhpcy5vcHRpb25zLnRyaWdnZXIuc3BsaXQoJyAnKVxuXG4gICAgZm9yICh2YXIgaSA9IHRyaWdnZXJzLmxlbmd0aDsgaS0tOykge1xuICAgICAgdmFyIHRyaWdnZXIgPSB0cmlnZ2Vyc1tpXVxuXG4gICAgICBpZiAodHJpZ2dlciA9PSAnY2xpY2snKSB7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQub24oJ2NsaWNrLicgKyB0aGlzLnR5cGUsIHRoaXMub3B0aW9ucy5zZWxlY3RvciwgJC5wcm94eSh0aGlzLnRvZ2dsZSwgdGhpcykpXG4gICAgICB9IGVsc2UgaWYgKHRyaWdnZXIgIT0gJ21hbnVhbCcpIHtcbiAgICAgICAgdmFyIGV2ZW50SW4gID0gdHJpZ2dlciA9PSAnaG92ZXInID8gJ21vdXNlZW50ZXInIDogJ2ZvY3VzaW4nXG4gICAgICAgIHZhciBldmVudE91dCA9IHRyaWdnZXIgPT0gJ2hvdmVyJyA/ICdtb3VzZWxlYXZlJyA6ICdmb2N1c291dCdcblxuICAgICAgICB0aGlzLiRlbGVtZW50Lm9uKGV2ZW50SW4gICsgJy4nICsgdGhpcy50eXBlLCB0aGlzLm9wdGlvbnMuc2VsZWN0b3IsICQucHJveHkodGhpcy5lbnRlciwgdGhpcykpXG4gICAgICAgIHRoaXMuJGVsZW1lbnQub24oZXZlbnRPdXQgKyAnLicgKyB0aGlzLnR5cGUsIHRoaXMub3B0aW9ucy5zZWxlY3RvciwgJC5wcm94eSh0aGlzLmxlYXZlLCB0aGlzKSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm9wdGlvbnMuc2VsZWN0b3IgP1xuICAgICAgKHRoaXMuX29wdGlvbnMgPSAkLmV4dGVuZCh7fSwgdGhpcy5vcHRpb25zLCB7IHRyaWdnZXI6ICdtYW51YWwnLCBzZWxlY3RvcjogJycgfSkpIDpcbiAgICAgIHRoaXMuZml4VGl0bGUoKVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0RGVmYXVsdHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFRvb2x0aXAuREVGQVVMVFNcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldE9wdGlvbnMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgdGhpcy5nZXREZWZhdWx0cygpLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucylcblxuICAgIGlmIChvcHRpb25zLmRlbGF5ICYmIHR5cGVvZiBvcHRpb25zLmRlbGF5ID09ICdudW1iZXInKSB7XG4gICAgICBvcHRpb25zLmRlbGF5ID0ge1xuICAgICAgICBzaG93OiBvcHRpb25zLmRlbGF5LFxuICAgICAgICBoaWRlOiBvcHRpb25zLmRlbGF5XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9wdGlvbnNcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmdldERlbGVnYXRlT3B0aW9ucyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgb3B0aW9ucyAgPSB7fVxuICAgIHZhciBkZWZhdWx0cyA9IHRoaXMuZ2V0RGVmYXVsdHMoKVxuXG4gICAgdGhpcy5fb3B0aW9ucyAmJiAkLmVhY2godGhpcy5fb3B0aW9ucywgZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgIGlmIChkZWZhdWx0c1trZXldICE9IHZhbHVlKSBvcHRpb25zW2tleV0gPSB2YWx1ZVxuICAgIH0pXG5cbiAgICByZXR1cm4gb3B0aW9uc1xuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZW50ZXIgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgdmFyIHNlbGYgPSBvYmogaW5zdGFuY2VvZiB0aGlzLmNvbnN0cnVjdG9yID9cbiAgICAgIG9iaiA6ICQob2JqLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUpXG5cbiAgICBpZiAoIXNlbGYpIHtcbiAgICAgIHNlbGYgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihvYmouY3VycmVudFRhcmdldCwgdGhpcy5nZXREZWxlZ2F0ZU9wdGlvbnMoKSlcbiAgICAgICQob2JqLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2JzLicgKyB0aGlzLnR5cGUsIHNlbGYpXG4gICAgfVxuXG4gICAgaWYgKG9iaiBpbnN0YW5jZW9mICQuRXZlbnQpIHtcbiAgICAgIHNlbGYuaW5TdGF0ZVtvYmoudHlwZSA9PSAnZm9jdXNpbicgPyAnZm9jdXMnIDogJ2hvdmVyJ10gPSB0cnVlXG4gICAgfVxuXG4gICAgaWYgKHNlbGYudGlwKCkuaGFzQ2xhc3MoJ2luJykgfHwgc2VsZi5ob3ZlclN0YXRlID09ICdpbicpIHtcbiAgICAgIHNlbGYuaG92ZXJTdGF0ZSA9ICdpbidcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNsZWFyVGltZW91dChzZWxmLnRpbWVvdXQpXG5cbiAgICBzZWxmLmhvdmVyU3RhdGUgPSAnaW4nXG5cbiAgICBpZiAoIXNlbGYub3B0aW9ucy5kZWxheSB8fCAhc2VsZi5vcHRpb25zLmRlbGF5LnNob3cpIHJldHVybiBzZWxmLnNob3coKVxuXG4gICAgc2VsZi50aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoc2VsZi5ob3ZlclN0YXRlID09ICdpbicpIHNlbGYuc2hvdygpXG4gICAgfSwgc2VsZi5vcHRpb25zLmRlbGF5LnNob3cpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5pc0luU3RhdGVUcnVlID0gZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIGtleSBpbiB0aGlzLmluU3RhdGUpIHtcbiAgICAgIGlmICh0aGlzLmluU3RhdGVba2V5XSkgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmxlYXZlID0gZnVuY3Rpb24gKG9iaikge1xuICAgIHZhciBzZWxmID0gb2JqIGluc3RhbmNlb2YgdGhpcy5jb25zdHJ1Y3RvciA/XG4gICAgICBvYmogOiAkKG9iai5jdXJyZW50VGFyZ2V0KS5kYXRhKCdicy4nICsgdGhpcy50eXBlKVxuXG4gICAgaWYgKCFzZWxmKSB7XG4gICAgICBzZWxmID0gbmV3IHRoaXMuY29uc3RydWN0b3Iob2JqLmN1cnJlbnRUYXJnZXQsIHRoaXMuZ2V0RGVsZWdhdGVPcHRpb25zKCkpXG4gICAgICAkKG9iai5jdXJyZW50VGFyZ2V0KS5kYXRhKCdicy4nICsgdGhpcy50eXBlLCBzZWxmKVxuICAgIH1cblxuICAgIGlmIChvYmogaW5zdGFuY2VvZiAkLkV2ZW50KSB7XG4gICAgICBzZWxmLmluU3RhdGVbb2JqLnR5cGUgPT0gJ2ZvY3Vzb3V0JyA/ICdmb2N1cycgOiAnaG92ZXInXSA9IGZhbHNlXG4gICAgfVxuXG4gICAgaWYgKHNlbGYuaXNJblN0YXRlVHJ1ZSgpKSByZXR1cm5cblxuICAgIGNsZWFyVGltZW91dChzZWxmLnRpbWVvdXQpXG5cbiAgICBzZWxmLmhvdmVyU3RhdGUgPSAnb3V0J1xuXG4gICAgaWYgKCFzZWxmLm9wdGlvbnMuZGVsYXkgfHwgIXNlbGYub3B0aW9ucy5kZWxheS5oaWRlKSByZXR1cm4gc2VsZi5oaWRlKClcblxuICAgIHNlbGYudGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHNlbGYuaG92ZXJTdGF0ZSA9PSAnb3V0Jykgc2VsZi5oaWRlKClcbiAgICB9LCBzZWxmLm9wdGlvbnMuZGVsYXkuaGlkZSlcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGUgPSAkLkV2ZW50KCdzaG93LmJzLicgKyB0aGlzLnR5cGUpXG5cbiAgICBpZiAodGhpcy5oYXNDb250ZW50KCkgJiYgdGhpcy5lbmFibGVkKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoZSlcblxuICAgICAgdmFyIGluRG9tID0gJC5jb250YWlucyh0aGlzLiRlbGVtZW50WzBdLm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LCB0aGlzLiRlbGVtZW50WzBdKVxuICAgICAgaWYgKGUuaXNEZWZhdWx0UHJldmVudGVkKCkgfHwgIWluRG9tKSByZXR1cm5cbiAgICAgIHZhciB0aGF0ID0gdGhpc1xuXG4gICAgICB2YXIgJHRpcCA9IHRoaXMudGlwKClcblxuICAgICAgdmFyIHRpcElkID0gdGhpcy5nZXRVSUQodGhpcy50eXBlKVxuXG4gICAgICB0aGlzLnNldENvbnRlbnQoKVxuICAgICAgJHRpcC5hdHRyKCdpZCcsIHRpcElkKVxuICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWRlc2NyaWJlZGJ5JywgdGlwSWQpXG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuYW5pbWF0aW9uKSAkdGlwLmFkZENsYXNzKCdmYWRlJylcblxuICAgICAgdmFyIHBsYWNlbWVudCA9IHR5cGVvZiB0aGlzLm9wdGlvbnMucGxhY2VtZW50ID09ICdmdW5jdGlvbicgP1xuICAgICAgICB0aGlzLm9wdGlvbnMucGxhY2VtZW50LmNhbGwodGhpcywgJHRpcFswXSwgdGhpcy4kZWxlbWVudFswXSkgOlxuICAgICAgICB0aGlzLm9wdGlvbnMucGxhY2VtZW50XG5cbiAgICAgIHZhciBhdXRvVG9rZW4gPSAvXFxzP2F1dG8/XFxzPy9pXG4gICAgICB2YXIgYXV0b1BsYWNlID0gYXV0b1Rva2VuLnRlc3QocGxhY2VtZW50KVxuICAgICAgaWYgKGF1dG9QbGFjZSkgcGxhY2VtZW50ID0gcGxhY2VtZW50LnJlcGxhY2UoYXV0b1Rva2VuLCAnJykgfHwgJ3RvcCdcblxuICAgICAgJHRpcFxuICAgICAgICAuZGV0YWNoKClcbiAgICAgICAgLmNzcyh7IHRvcDogMCwgbGVmdDogMCwgZGlzcGxheTogJ2Jsb2NrJyB9KVxuICAgICAgICAuYWRkQ2xhc3MocGxhY2VtZW50KVxuICAgICAgICAuZGF0YSgnYnMuJyArIHRoaXMudHlwZSwgdGhpcylcblxuICAgICAgdGhpcy5vcHRpb25zLmNvbnRhaW5lciA/ICR0aXAuYXBwZW5kVG8odGhpcy5vcHRpb25zLmNvbnRhaW5lcikgOiAkdGlwLmluc2VydEFmdGVyKHRoaXMuJGVsZW1lbnQpXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2luc2VydGVkLmJzLicgKyB0aGlzLnR5cGUpXG5cbiAgICAgIHZhciBwb3MgICAgICAgICAgPSB0aGlzLmdldFBvc2l0aW9uKClcbiAgICAgIHZhciBhY3R1YWxXaWR0aCAgPSAkdGlwWzBdLm9mZnNldFdpZHRoXG4gICAgICB2YXIgYWN0dWFsSGVpZ2h0ID0gJHRpcFswXS5vZmZzZXRIZWlnaHRcblxuICAgICAgaWYgKGF1dG9QbGFjZSkge1xuICAgICAgICB2YXIgb3JnUGxhY2VtZW50ID0gcGxhY2VtZW50XG4gICAgICAgIHZhciB2aWV3cG9ydERpbSA9IHRoaXMuZ2V0UG9zaXRpb24odGhpcy4kdmlld3BvcnQpXG5cbiAgICAgICAgcGxhY2VtZW50ID0gcGxhY2VtZW50ID09ICdib3R0b20nICYmIHBvcy5ib3R0b20gKyBhY3R1YWxIZWlnaHQgPiB2aWV3cG9ydERpbS5ib3R0b20gPyAndG9wJyAgICA6XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudCA9PSAndG9wJyAgICAmJiBwb3MudG9wICAgIC0gYWN0dWFsSGVpZ2h0IDwgdmlld3BvcnREaW0udG9wICAgID8gJ2JvdHRvbScgOlxuICAgICAgICAgICAgICAgICAgICBwbGFjZW1lbnQgPT0gJ3JpZ2h0JyAgJiYgcG9zLnJpZ2h0ICArIGFjdHVhbFdpZHRoICA+IHZpZXdwb3J0RGltLndpZHRoICA/ICdsZWZ0JyAgIDpcbiAgICAgICAgICAgICAgICAgICAgcGxhY2VtZW50ID09ICdsZWZ0JyAgICYmIHBvcy5sZWZ0ICAgLSBhY3R1YWxXaWR0aCAgPCB2aWV3cG9ydERpbS5sZWZ0ICAgPyAncmlnaHQnICA6XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlbWVudFxuXG4gICAgICAgICR0aXBcbiAgICAgICAgICAucmVtb3ZlQ2xhc3Mob3JnUGxhY2VtZW50KVxuICAgICAgICAgIC5hZGRDbGFzcyhwbGFjZW1lbnQpXG4gICAgICB9XG5cbiAgICAgIHZhciBjYWxjdWxhdGVkT2Zmc2V0ID0gdGhpcy5nZXRDYWxjdWxhdGVkT2Zmc2V0KHBsYWNlbWVudCwgcG9zLCBhY3R1YWxXaWR0aCwgYWN0dWFsSGVpZ2h0KVxuXG4gICAgICB0aGlzLmFwcGx5UGxhY2VtZW50KGNhbGN1bGF0ZWRPZmZzZXQsIHBsYWNlbWVudClcblxuICAgICAgdmFyIGNvbXBsZXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcHJldkhvdmVyU3RhdGUgPSB0aGF0LmhvdmVyU3RhdGVcbiAgICAgICAgdGhhdC4kZWxlbWVudC50cmlnZ2VyKCdzaG93bi5icy4nICsgdGhhdC50eXBlKVxuICAgICAgICB0aGF0LmhvdmVyU3RhdGUgPSBudWxsXG5cbiAgICAgICAgaWYgKHByZXZIb3ZlclN0YXRlID09ICdvdXQnKSB0aGF0LmxlYXZlKHRoYXQpXG4gICAgICB9XG5cbiAgICAgICQuc3VwcG9ydC50cmFuc2l0aW9uICYmIHRoaXMuJHRpcC5oYXNDbGFzcygnZmFkZScpID9cbiAgICAgICAgJHRpcFxuICAgICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIGNvbXBsZXRlKVxuICAgICAgICAgIC5lbXVsYXRlVHJhbnNpdGlvbkVuZChUb29sdGlwLlRSQU5TSVRJT05fRFVSQVRJT04pIDpcbiAgICAgICAgY29tcGxldGUoKVxuICAgIH1cbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmFwcGx5UGxhY2VtZW50ID0gZnVuY3Rpb24gKG9mZnNldCwgcGxhY2VtZW50KSB7XG4gICAgdmFyICR0aXAgICA9IHRoaXMudGlwKClcbiAgICB2YXIgd2lkdGggID0gJHRpcFswXS5vZmZzZXRXaWR0aFxuICAgIHZhciBoZWlnaHQgPSAkdGlwWzBdLm9mZnNldEhlaWdodFxuXG4gICAgLy8gbWFudWFsbHkgcmVhZCBtYXJnaW5zIGJlY2F1c2UgZ2V0Qm91bmRpbmdDbGllbnRSZWN0IGluY2x1ZGVzIGRpZmZlcmVuY2VcbiAgICB2YXIgbWFyZ2luVG9wID0gcGFyc2VJbnQoJHRpcC5jc3MoJ21hcmdpbi10b3AnKSwgMTApXG4gICAgdmFyIG1hcmdpbkxlZnQgPSBwYXJzZUludCgkdGlwLmNzcygnbWFyZ2luLWxlZnQnKSwgMTApXG5cbiAgICAvLyB3ZSBtdXN0IGNoZWNrIGZvciBOYU4gZm9yIGllIDgvOVxuICAgIGlmIChpc05hTihtYXJnaW5Ub3ApKSAgbWFyZ2luVG9wICA9IDBcbiAgICBpZiAoaXNOYU4obWFyZ2luTGVmdCkpIG1hcmdpbkxlZnQgPSAwXG5cbiAgICBvZmZzZXQudG9wICArPSBtYXJnaW5Ub3BcbiAgICBvZmZzZXQubGVmdCArPSBtYXJnaW5MZWZ0XG5cbiAgICAvLyAkLmZuLm9mZnNldCBkb2Vzbid0IHJvdW5kIHBpeGVsIHZhbHVlc1xuICAgIC8vIHNvIHdlIHVzZSBzZXRPZmZzZXQgZGlyZWN0bHkgd2l0aCBvdXIgb3duIGZ1bmN0aW9uIEItMFxuICAgICQub2Zmc2V0LnNldE9mZnNldCgkdGlwWzBdLCAkLmV4dGVuZCh7XG4gICAgICB1c2luZzogZnVuY3Rpb24gKHByb3BzKSB7XG4gICAgICAgICR0aXAuY3NzKHtcbiAgICAgICAgICB0b3A6IE1hdGgucm91bmQocHJvcHMudG9wKSxcbiAgICAgICAgICBsZWZ0OiBNYXRoLnJvdW5kKHByb3BzLmxlZnQpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSwgb2Zmc2V0KSwgMClcblxuICAgICR0aXAuYWRkQ2xhc3MoJ2luJylcblxuICAgIC8vIGNoZWNrIHRvIHNlZSBpZiBwbGFjaW5nIHRpcCBpbiBuZXcgb2Zmc2V0IGNhdXNlZCB0aGUgdGlwIHRvIHJlc2l6ZSBpdHNlbGZcbiAgICB2YXIgYWN0dWFsV2lkdGggID0gJHRpcFswXS5vZmZzZXRXaWR0aFxuICAgIHZhciBhY3R1YWxIZWlnaHQgPSAkdGlwWzBdLm9mZnNldEhlaWdodFxuXG4gICAgaWYgKHBsYWNlbWVudCA9PSAndG9wJyAmJiBhY3R1YWxIZWlnaHQgIT0gaGVpZ2h0KSB7XG4gICAgICBvZmZzZXQudG9wID0gb2Zmc2V0LnRvcCArIGhlaWdodCAtIGFjdHVhbEhlaWdodFxuICAgIH1cblxuICAgIHZhciBkZWx0YSA9IHRoaXMuZ2V0Vmlld3BvcnRBZGp1c3RlZERlbHRhKHBsYWNlbWVudCwgb2Zmc2V0LCBhY3R1YWxXaWR0aCwgYWN0dWFsSGVpZ2h0KVxuXG4gICAgaWYgKGRlbHRhLmxlZnQpIG9mZnNldC5sZWZ0ICs9IGRlbHRhLmxlZnRcbiAgICBlbHNlIG9mZnNldC50b3AgKz0gZGVsdGEudG9wXG5cbiAgICB2YXIgaXNWZXJ0aWNhbCAgICAgICAgICA9IC90b3B8Ym90dG9tLy50ZXN0KHBsYWNlbWVudClcbiAgICB2YXIgYXJyb3dEZWx0YSAgICAgICAgICA9IGlzVmVydGljYWwgPyBkZWx0YS5sZWZ0ICogMiAtIHdpZHRoICsgYWN0dWFsV2lkdGggOiBkZWx0YS50b3AgKiAyIC0gaGVpZ2h0ICsgYWN0dWFsSGVpZ2h0XG4gICAgdmFyIGFycm93T2Zmc2V0UG9zaXRpb24gPSBpc1ZlcnRpY2FsID8gJ29mZnNldFdpZHRoJyA6ICdvZmZzZXRIZWlnaHQnXG5cbiAgICAkdGlwLm9mZnNldChvZmZzZXQpXG4gICAgdGhpcy5yZXBsYWNlQXJyb3coYXJyb3dEZWx0YSwgJHRpcFswXVthcnJvd09mZnNldFBvc2l0aW9uXSwgaXNWZXJ0aWNhbClcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLnJlcGxhY2VBcnJvdyA9IGZ1bmN0aW9uIChkZWx0YSwgZGltZW5zaW9uLCBpc1ZlcnRpY2FsKSB7XG4gICAgdGhpcy5hcnJvdygpXG4gICAgICAuY3NzKGlzVmVydGljYWwgPyAnbGVmdCcgOiAndG9wJywgNTAgKiAoMSAtIGRlbHRhIC8gZGltZW5zaW9uKSArICclJylcbiAgICAgIC5jc3MoaXNWZXJ0aWNhbCA/ICd0b3AnIDogJ2xlZnQnLCAnJylcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLnNldENvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyICR0aXAgID0gdGhpcy50aXAoKVxuICAgIHZhciB0aXRsZSA9IHRoaXMuZ2V0VGl0bGUoKVxuXG4gICAgJHRpcC5maW5kKCcudG9vbHRpcC1pbm5lcicpW3RoaXMub3B0aW9ucy5odG1sID8gJ2h0bWwnIDogJ3RleHQnXSh0aXRsZSlcbiAgICAkdGlwLnJlbW92ZUNsYXNzKCdmYWRlIGluIHRvcCBib3R0b20gbGVmdCByaWdodCcpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzXG4gICAgdmFyICR0aXAgPSAkKHRoaXMuJHRpcClcbiAgICB2YXIgZSAgICA9ICQuRXZlbnQoJ2hpZGUuYnMuJyArIHRoaXMudHlwZSlcblxuICAgIGZ1bmN0aW9uIGNvbXBsZXRlKCkge1xuICAgICAgaWYgKHRoYXQuaG92ZXJTdGF0ZSAhPSAnaW4nKSAkdGlwLmRldGFjaCgpXG4gICAgICBpZiAodGhhdC4kZWxlbWVudCkgeyAvLyBUT0RPOiBDaGVjayB3aGV0aGVyIGd1YXJkaW5nIHRoaXMgY29kZSB3aXRoIHRoaXMgYGlmYCBpcyByZWFsbHkgbmVjZXNzYXJ5LlxuICAgICAgICB0aGF0LiRlbGVtZW50XG4gICAgICAgICAgLnJlbW92ZUF0dHIoJ2FyaWEtZGVzY3JpYmVkYnknKVxuICAgICAgICAgIC50cmlnZ2VyKCdoaWRkZW4uYnMuJyArIHRoYXQudHlwZSlcbiAgICAgIH1cbiAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKClcbiAgICB9XG5cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoZSlcblxuICAgIGlmIChlLmlzRGVmYXVsdFByZXZlbnRlZCgpKSByZXR1cm5cblxuICAgICR0aXAucmVtb3ZlQ2xhc3MoJ2luJylcblxuICAgICQuc3VwcG9ydC50cmFuc2l0aW9uICYmICR0aXAuaGFzQ2xhc3MoJ2ZhZGUnKSA/XG4gICAgICAkdGlwXG4gICAgICAgIC5vbmUoJ2JzVHJhbnNpdGlvbkVuZCcsIGNvbXBsZXRlKVxuICAgICAgICAuZW11bGF0ZVRyYW5zaXRpb25FbmQoVG9vbHRpcC5UUkFOU0lUSU9OX0RVUkFUSU9OKSA6XG4gICAgICBjb21wbGV0ZSgpXG5cbiAgICB0aGlzLmhvdmVyU3RhdGUgPSBudWxsXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZml4VGl0bGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyICRlID0gdGhpcy4kZWxlbWVudFxuICAgIGlmICgkZS5hdHRyKCd0aXRsZScpIHx8IHR5cGVvZiAkZS5hdHRyKCdkYXRhLW9yaWdpbmFsLXRpdGxlJykgIT0gJ3N0cmluZycpIHtcbiAgICAgICRlLmF0dHIoJ2RhdGEtb3JpZ2luYWwtdGl0bGUnLCAkZS5hdHRyKCd0aXRsZScpIHx8ICcnKS5hdHRyKCd0aXRsZScsICcnKVxuICAgIH1cbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmhhc0NvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VGl0bGUoKVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0UG9zaXRpb24gPSBmdW5jdGlvbiAoJGVsZW1lbnQpIHtcbiAgICAkZWxlbWVudCAgID0gJGVsZW1lbnQgfHwgdGhpcy4kZWxlbWVudFxuXG4gICAgdmFyIGVsICAgICA9ICRlbGVtZW50WzBdXG4gICAgdmFyIGlzQm9keSA9IGVsLnRhZ05hbWUgPT0gJ0JPRFknXG5cbiAgICB2YXIgZWxSZWN0ICAgID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICBpZiAoZWxSZWN0LndpZHRoID09IG51bGwpIHtcbiAgICAgIC8vIHdpZHRoIGFuZCBoZWlnaHQgYXJlIG1pc3NpbmcgaW4gSUU4LCBzbyBjb21wdXRlIHRoZW0gbWFudWFsbHk7IHNlZSBodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvaXNzdWVzLzE0MDkzXG4gICAgICBlbFJlY3QgPSAkLmV4dGVuZCh7fSwgZWxSZWN0LCB7IHdpZHRoOiBlbFJlY3QucmlnaHQgLSBlbFJlY3QubGVmdCwgaGVpZ2h0OiBlbFJlY3QuYm90dG9tIC0gZWxSZWN0LnRvcCB9KVxuICAgIH1cbiAgICB2YXIgaXNTdmcgPSB3aW5kb3cuU1ZHRWxlbWVudCAmJiBlbCBpbnN0YW5jZW9mIHdpbmRvdy5TVkdFbGVtZW50XG4gICAgLy8gQXZvaWQgdXNpbmcgJC5vZmZzZXQoKSBvbiBTVkdzIHNpbmNlIGl0IGdpdmVzIGluY29ycmVjdCByZXN1bHRzIGluIGpRdWVyeSAzLlxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdHdicy9ib290c3RyYXAvaXNzdWVzLzIwMjgwXG4gICAgdmFyIGVsT2Zmc2V0ICA9IGlzQm9keSA/IHsgdG9wOiAwLCBsZWZ0OiAwIH0gOiAoaXNTdmcgPyBudWxsIDogJGVsZW1lbnQub2Zmc2V0KCkpXG4gICAgdmFyIHNjcm9sbCAgICA9IHsgc2Nyb2xsOiBpc0JvZHkgPyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wIDogJGVsZW1lbnQuc2Nyb2xsVG9wKCkgfVxuICAgIHZhciBvdXRlckRpbXMgPSBpc0JvZHkgPyB7IHdpZHRoOiAkKHdpbmRvdykud2lkdGgoKSwgaGVpZ2h0OiAkKHdpbmRvdykuaGVpZ2h0KCkgfSA6IG51bGxcblxuICAgIHJldHVybiAkLmV4dGVuZCh7fSwgZWxSZWN0LCBzY3JvbGwsIG91dGVyRGltcywgZWxPZmZzZXQpXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5nZXRDYWxjdWxhdGVkT2Zmc2V0ID0gZnVuY3Rpb24gKHBsYWNlbWVudCwgcG9zLCBhY3R1YWxXaWR0aCwgYWN0dWFsSGVpZ2h0KSB7XG4gICAgcmV0dXJuIHBsYWNlbWVudCA9PSAnYm90dG9tJyA/IHsgdG9wOiBwb3MudG9wICsgcG9zLmhlaWdodCwgICBsZWZ0OiBwb3MubGVmdCArIHBvcy53aWR0aCAvIDIgLSBhY3R1YWxXaWR0aCAvIDIgfSA6XG4gICAgICAgICAgIHBsYWNlbWVudCA9PSAndG9wJyAgICA/IHsgdG9wOiBwb3MudG9wIC0gYWN0dWFsSGVpZ2h0LCBsZWZ0OiBwb3MubGVmdCArIHBvcy53aWR0aCAvIDIgLSBhY3R1YWxXaWR0aCAvIDIgfSA6XG4gICAgICAgICAgIHBsYWNlbWVudCA9PSAnbGVmdCcgICA/IHsgdG9wOiBwb3MudG9wICsgcG9zLmhlaWdodCAvIDIgLSBhY3R1YWxIZWlnaHQgLyAyLCBsZWZ0OiBwb3MubGVmdCAtIGFjdHVhbFdpZHRoIH0gOlxuICAgICAgICAvKiBwbGFjZW1lbnQgPT0gJ3JpZ2h0JyAqLyB7IHRvcDogcG9zLnRvcCArIHBvcy5oZWlnaHQgLyAyIC0gYWN0dWFsSGVpZ2h0IC8gMiwgbGVmdDogcG9zLmxlZnQgKyBwb3Mud2lkdGggfVxuXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5nZXRWaWV3cG9ydEFkanVzdGVkRGVsdGEgPSBmdW5jdGlvbiAocGxhY2VtZW50LCBwb3MsIGFjdHVhbFdpZHRoLCBhY3R1YWxIZWlnaHQpIHtcbiAgICB2YXIgZGVsdGEgPSB7IHRvcDogMCwgbGVmdDogMCB9XG4gICAgaWYgKCF0aGlzLiR2aWV3cG9ydCkgcmV0dXJuIGRlbHRhXG5cbiAgICB2YXIgdmlld3BvcnRQYWRkaW5nID0gdGhpcy5vcHRpb25zLnZpZXdwb3J0ICYmIHRoaXMub3B0aW9ucy52aWV3cG9ydC5wYWRkaW5nIHx8IDBcbiAgICB2YXIgdmlld3BvcnREaW1lbnNpb25zID0gdGhpcy5nZXRQb3NpdGlvbih0aGlzLiR2aWV3cG9ydClcblxuICAgIGlmICgvcmlnaHR8bGVmdC8udGVzdChwbGFjZW1lbnQpKSB7XG4gICAgICB2YXIgdG9wRWRnZU9mZnNldCAgICA9IHBvcy50b3AgLSB2aWV3cG9ydFBhZGRpbmcgLSB2aWV3cG9ydERpbWVuc2lvbnMuc2Nyb2xsXG4gICAgICB2YXIgYm90dG9tRWRnZU9mZnNldCA9IHBvcy50b3AgKyB2aWV3cG9ydFBhZGRpbmcgLSB2aWV3cG9ydERpbWVuc2lvbnMuc2Nyb2xsICsgYWN0dWFsSGVpZ2h0XG4gICAgICBpZiAodG9wRWRnZU9mZnNldCA8IHZpZXdwb3J0RGltZW5zaW9ucy50b3ApIHsgLy8gdG9wIG92ZXJmbG93XG4gICAgICAgIGRlbHRhLnRvcCA9IHZpZXdwb3J0RGltZW5zaW9ucy50b3AgLSB0b3BFZGdlT2Zmc2V0XG4gICAgICB9IGVsc2UgaWYgKGJvdHRvbUVkZ2VPZmZzZXQgPiB2aWV3cG9ydERpbWVuc2lvbnMudG9wICsgdmlld3BvcnREaW1lbnNpb25zLmhlaWdodCkgeyAvLyBib3R0b20gb3ZlcmZsb3dcbiAgICAgICAgZGVsdGEudG9wID0gdmlld3BvcnREaW1lbnNpb25zLnRvcCArIHZpZXdwb3J0RGltZW5zaW9ucy5oZWlnaHQgLSBib3R0b21FZGdlT2Zmc2V0XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBsZWZ0RWRnZU9mZnNldCAgPSBwb3MubGVmdCAtIHZpZXdwb3J0UGFkZGluZ1xuICAgICAgdmFyIHJpZ2h0RWRnZU9mZnNldCA9IHBvcy5sZWZ0ICsgdmlld3BvcnRQYWRkaW5nICsgYWN0dWFsV2lkdGhcbiAgICAgIGlmIChsZWZ0RWRnZU9mZnNldCA8IHZpZXdwb3J0RGltZW5zaW9ucy5sZWZ0KSB7IC8vIGxlZnQgb3ZlcmZsb3dcbiAgICAgICAgZGVsdGEubGVmdCA9IHZpZXdwb3J0RGltZW5zaW9ucy5sZWZ0IC0gbGVmdEVkZ2VPZmZzZXRcbiAgICAgIH0gZWxzZSBpZiAocmlnaHRFZGdlT2Zmc2V0ID4gdmlld3BvcnREaW1lbnNpb25zLnJpZ2h0KSB7IC8vIHJpZ2h0IG92ZXJmbG93XG4gICAgICAgIGRlbHRhLmxlZnQgPSB2aWV3cG9ydERpbWVuc2lvbnMubGVmdCArIHZpZXdwb3J0RGltZW5zaW9ucy53aWR0aCAtIHJpZ2h0RWRnZU9mZnNldFxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkZWx0YVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZ2V0VGl0bGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHRpdGxlXG4gICAgdmFyICRlID0gdGhpcy4kZWxlbWVudFxuICAgIHZhciBvICA9IHRoaXMub3B0aW9uc1xuXG4gICAgdGl0bGUgPSAkZS5hdHRyKCdkYXRhLW9yaWdpbmFsLXRpdGxlJylcbiAgICAgIHx8ICh0eXBlb2Ygby50aXRsZSA9PSAnZnVuY3Rpb24nID8gby50aXRsZS5jYWxsKCRlWzBdKSA6ICBvLnRpdGxlKVxuXG4gICAgcmV0dXJuIHRpdGxlXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5nZXRVSUQgPSBmdW5jdGlvbiAocHJlZml4KSB7XG4gICAgZG8gcHJlZml4ICs9IH5+KE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwKVxuICAgIHdoaWxlIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChwcmVmaXgpKVxuICAgIHJldHVybiBwcmVmaXhcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLnRpcCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuJHRpcCkge1xuICAgICAgdGhpcy4kdGlwID0gJCh0aGlzLm9wdGlvbnMudGVtcGxhdGUpXG4gICAgICBpZiAodGhpcy4kdGlwLmxlbmd0aCAhPSAxKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0aGlzLnR5cGUgKyAnIGB0ZW1wbGF0ZWAgb3B0aW9uIG11c3QgY29uc2lzdCBvZiBleGFjdGx5IDEgdG9wLWxldmVsIGVsZW1lbnQhJylcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuJHRpcFxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuYXJyb3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICh0aGlzLiRhcnJvdyA9IHRoaXMuJGFycm93IHx8IHRoaXMudGlwKCkuZmluZCgnLnRvb2x0aXAtYXJyb3cnKSlcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLmVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmVuYWJsZWQgPSB0cnVlXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS5kaXNhYmxlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZW5hYmxlZCA9IGZhbHNlXG4gIH1cblxuICBUb29sdGlwLnByb3RvdHlwZS50b2dnbGVFbmFibGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZW5hYmxlZCA9ICF0aGlzLmVuYWJsZWRcbiAgfVxuXG4gIFRvb2x0aXAucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgaWYgKGUpIHtcbiAgICAgIHNlbGYgPSAkKGUuY3VycmVudFRhcmdldCkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSlcbiAgICAgIGlmICghc2VsZikge1xuICAgICAgICBzZWxmID0gbmV3IHRoaXMuY29uc3RydWN0b3IoZS5jdXJyZW50VGFyZ2V0LCB0aGlzLmdldERlbGVnYXRlT3B0aW9ucygpKVxuICAgICAgICAkKGUuY3VycmVudFRhcmdldCkuZGF0YSgnYnMuJyArIHRoaXMudHlwZSwgc2VsZilcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZSkge1xuICAgICAgc2VsZi5pblN0YXRlLmNsaWNrID0gIXNlbGYuaW5TdGF0ZS5jbGlja1xuICAgICAgaWYgKHNlbGYuaXNJblN0YXRlVHJ1ZSgpKSBzZWxmLmVudGVyKHNlbGYpXG4gICAgICBlbHNlIHNlbGYubGVhdmUoc2VsZilcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi50aXAoKS5oYXNDbGFzcygnaW4nKSA/IHNlbGYubGVhdmUoc2VsZikgOiBzZWxmLmVudGVyKHNlbGYpXG4gICAgfVxuICB9XG5cbiAgVG9vbHRpcC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXNcbiAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KVxuICAgIHRoaXMuaGlkZShmdW5jdGlvbiAoKSB7XG4gICAgICB0aGF0LiRlbGVtZW50Lm9mZignLicgKyB0aGF0LnR5cGUpLnJlbW92ZURhdGEoJ2JzLicgKyB0aGF0LnR5cGUpXG4gICAgICBpZiAodGhhdC4kdGlwKSB7XG4gICAgICAgIHRoYXQuJHRpcC5kZXRhY2goKVxuICAgICAgfVxuICAgICAgdGhhdC4kdGlwID0gbnVsbFxuICAgICAgdGhhdC4kYXJyb3cgPSBudWxsXG4gICAgICB0aGF0LiR2aWV3cG9ydCA9IG51bGxcbiAgICAgIHRoYXQuJGVsZW1lbnQgPSBudWxsXG4gICAgfSlcbiAgfVxuXG5cbiAgLy8gVE9PTFRJUCBQTFVHSU4gREVGSU5JVElPTlxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgZnVuY3Rpb24gUGx1Z2luKG9wdGlvbikge1xuICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICR0aGlzICAgPSAkKHRoaXMpXG4gICAgICB2YXIgZGF0YSAgICA9ICR0aGlzLmRhdGEoJ2JzLnRvb2x0aXAnKVxuICAgICAgdmFyIG9wdGlvbnMgPSB0eXBlb2Ygb3B0aW9uID09ICdvYmplY3QnICYmIG9wdGlvblxuXG4gICAgICBpZiAoIWRhdGEgJiYgL2Rlc3Ryb3l8aGlkZS8udGVzdChvcHRpb24pKSByZXR1cm5cbiAgICAgIGlmICghZGF0YSkgJHRoaXMuZGF0YSgnYnMudG9vbHRpcCcsIChkYXRhID0gbmV3IFRvb2x0aXAodGhpcywgb3B0aW9ucykpKVxuICAgICAgaWYgKHR5cGVvZiBvcHRpb24gPT0gJ3N0cmluZycpIGRhdGFbb3B0aW9uXSgpXG4gICAgfSlcbiAgfVxuXG4gIHZhciBvbGQgPSAkLmZuLnRvb2x0aXBcblxuICAkLmZuLnRvb2x0aXAgICAgICAgICAgICAgPSBQbHVnaW5cbiAgJC5mbi50b29sdGlwLkNvbnN0cnVjdG9yID0gVG9vbHRpcFxuXG5cbiAgLy8gVE9PTFRJUCBOTyBDT05GTElDVFxuICAvLyA9PT09PT09PT09PT09PT09PT09XG5cbiAgJC5mbi50b29sdGlwLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgJC5mbi50b29sdGlwID0gb2xkXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG59KGpRdWVyeSk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBBamF4TW9uaXRvciwgQmFyLCBEb2N1bWVudE1vbml0b3IsIEVsZW1lbnRNb25pdG9yLCBFbGVtZW50VHJhY2tlciwgRXZlbnRMYWdNb25pdG9yLCBFdmVudGVkLCBFdmVudHMsIE5vVGFyZ2V0RXJyb3IsIFBhY2UsIFJlcXVlc3RJbnRlcmNlcHQsIFNPVVJDRV9LRVlTLCBTY2FsZXIsIFNvY2tldFJlcXVlc3RUcmFja2VyLCBYSFJSZXF1ZXN0VHJhY2tlciwgYW5pbWF0aW9uLCBhdmdBbXBsaXR1ZGUsIGJhciwgY2FuY2VsQW5pbWF0aW9uLCBjYW5jZWxBbmltYXRpb25GcmFtZSwgZGVmYXVsdE9wdGlvbnMsIGV4dGVuZCwgZXh0ZW5kTmF0aXZlLCBnZXRGcm9tRE9NLCBnZXRJbnRlcmNlcHQsIGhhbmRsZVB1c2hTdGF0ZSwgaWdub3JlU3RhY2ssIGluaXQsIG5vdywgb3B0aW9ucywgcmVxdWVzdEFuaW1hdGlvbkZyYW1lLCByZXN1bHQsIHJ1bkFuaW1hdGlvbiwgc2NhbGVycywgc2hvdWxkSWdub3JlVVJMLCBzaG91bGRUcmFjaywgc291cmNlLCBzb3VyY2VzLCB1bmlTY2FsZXIsIF9XZWJTb2NrZXQsIF9YRG9tYWluUmVxdWVzdCwgX1hNTEh0dHBSZXF1ZXN0LCBfaSwgX2ludGVyY2VwdCwgX2xlbiwgX3B1c2hTdGF0ZSwgX3JlZiwgX3JlZjEsIF9yZXBsYWNlU3RhdGUsXG4gICAgX19zbGljZSA9IFtdLnNsaWNlLFxuICAgIF9faGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5LFxuICAgIF9fZXh0ZW5kcyA9IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQpIHsgZm9yICh2YXIga2V5IGluIHBhcmVudCkgeyBpZiAoX19oYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9LFxuICAgIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG4gIGRlZmF1bHRPcHRpb25zID0ge1xuICAgIGNhdGNodXBUaW1lOiAxMDAsXG4gICAgaW5pdGlhbFJhdGU6IC4wMyxcbiAgICBtaW5UaW1lOiAyNTAsXG4gICAgZ2hvc3RUaW1lOiAxMDAsXG4gICAgbWF4UHJvZ3Jlc3NQZXJGcmFtZTogMjAsXG4gICAgZWFzZUZhY3RvcjogMS4yNSxcbiAgICBzdGFydE9uUGFnZUxvYWQ6IHRydWUsXG4gICAgcmVzdGFydE9uUHVzaFN0YXRlOiB0cnVlLFxuICAgIHJlc3RhcnRPblJlcXVlc3RBZnRlcjogNTAwLFxuICAgIHRhcmdldDogJ2JvZHknLFxuICAgIGVsZW1lbnRzOiB7XG4gICAgICBjaGVja0ludGVydmFsOiAxMDAsXG4gICAgICBzZWxlY3RvcnM6IFsnYm9keSddXG4gICAgfSxcbiAgICBldmVudExhZzoge1xuICAgICAgbWluU2FtcGxlczogMTAsXG4gICAgICBzYW1wbGVDb3VudDogMyxcbiAgICAgIGxhZ1RocmVzaG9sZDogM1xuICAgIH0sXG4gICAgYWpheDoge1xuICAgICAgdHJhY2tNZXRob2RzOiBbJ0dFVCddLFxuICAgICAgdHJhY2tXZWJTb2NrZXRzOiB0cnVlLFxuICAgICAgaWdub3JlVVJMczogW11cbiAgICB9XG4gIH07XG5cbiAgbm93ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIF9yZWY7XG4gICAgcmV0dXJuIChfcmVmID0gdHlwZW9mIHBlcmZvcm1hbmNlICE9PSBcInVuZGVmaW5lZFwiICYmIHBlcmZvcm1hbmNlICE9PSBudWxsID8gdHlwZW9mIHBlcmZvcm1hbmNlLm5vdyA9PT0gXCJmdW5jdGlvblwiID8gcGVyZm9ybWFuY2Uubm93KCkgOiB2b2lkIDAgOiB2b2lkIDApICE9IG51bGwgPyBfcmVmIDogKyhuZXcgRGF0ZSk7XG4gIH07XG5cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXG4gIGNhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5tb3pDYW5jZWxBbmltYXRpb25GcmFtZTtcblxuICBpZiAocmVxdWVzdEFuaW1hdGlvbkZyYW1lID09IG51bGwpIHtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSBmdW5jdGlvbihmbikge1xuICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZm4sIDUwKTtcbiAgICB9O1xuICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oaWQpIHtcbiAgICAgIHJldHVybiBjbGVhclRpbWVvdXQoaWQpO1xuICAgIH07XG4gIH1cblxuICBydW5BbmltYXRpb24gPSBmdW5jdGlvbihmbikge1xuICAgIHZhciBsYXN0LCB0aWNrO1xuICAgIGxhc3QgPSBub3coKTtcbiAgICB0aWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZGlmZjtcbiAgICAgIGRpZmYgPSBub3coKSAtIGxhc3Q7XG4gICAgICBpZiAoZGlmZiA+PSAzMykge1xuICAgICAgICBsYXN0ID0gbm93KCk7XG4gICAgICAgIHJldHVybiBmbihkaWZmLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRpY2spO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KHRpY2ssIDMzIC0gZGlmZik7XG4gICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gdGljaygpO1xuICB9O1xuXG4gIHJlc3VsdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzLCBrZXksIG9iajtcbiAgICBvYmogPSBhcmd1bWVudHNbMF0sIGtleSA9IGFyZ3VtZW50c1sxXSwgYXJncyA9IDMgPD0gYXJndW1lbnRzLmxlbmd0aCA/IF9fc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpIDogW107XG4gICAgaWYgKHR5cGVvZiBvYmpba2V5XSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIG9ialtrZXldLmFwcGx5KG9iaiwgYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvYmpba2V5XTtcbiAgICB9XG4gIH07XG5cbiAgZXh0ZW5kID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGtleSwgb3V0LCBzb3VyY2UsIHNvdXJjZXMsIHZhbCwgX2ksIF9sZW47XG4gICAgb3V0ID0gYXJndW1lbnRzWzBdLCBzb3VyY2VzID0gMiA8PSBhcmd1bWVudHMubGVuZ3RoID8gX19zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkgOiBbXTtcbiAgICBmb3IgKF9pID0gMCwgX2xlbiA9IHNvdXJjZXMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgIHNvdXJjZSA9IHNvdXJjZXNbX2ldO1xuICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICBmb3IgKGtleSBpbiBzb3VyY2UpIHtcbiAgICAgICAgICBpZiAoIV9faGFzUHJvcC5jYWxsKHNvdXJjZSwga2V5KSkgY29udGludWU7XG4gICAgICAgICAgdmFsID0gc291cmNlW2tleV07XG4gICAgICAgICAgaWYgKChvdXRba2V5XSAhPSBudWxsKSAmJiB0eXBlb2Ygb3V0W2tleV0gPT09ICdvYmplY3QnICYmICh2YWwgIT0gbnVsbCkgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGV4dGVuZChvdXRba2V5XSwgdmFsKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3V0W2tleV0gPSB2YWw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG4gIH07XG5cbiAgYXZnQW1wbGl0dWRlID0gZnVuY3Rpb24oYXJyKSB7XG4gICAgdmFyIGNvdW50LCBzdW0sIHYsIF9pLCBfbGVuO1xuICAgIHN1bSA9IGNvdW50ID0gMDtcbiAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGFyci5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgdiA9IGFycltfaV07XG4gICAgICBzdW0gKz0gTWF0aC5hYnModik7XG4gICAgICBjb3VudCsrO1xuICAgIH1cbiAgICByZXR1cm4gc3VtIC8gY291bnQ7XG4gIH07XG5cbiAgZ2V0RnJvbURPTSA9IGZ1bmN0aW9uKGtleSwganNvbikge1xuICAgIHZhciBkYXRhLCBlLCBlbDtcbiAgICBpZiAoa2V5ID09IG51bGwpIHtcbiAgICAgIGtleSA9ICdvcHRpb25zJztcbiAgICB9XG4gICAgaWYgKGpzb24gPT0gbnVsbCkge1xuICAgICAganNvbiA9IHRydWU7XG4gICAgfVxuICAgIGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIltkYXRhLXBhY2UtXCIgKyBrZXkgKyBcIl1cIik7XG4gICAgaWYgKCFlbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkYXRhID0gZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1wYWNlLVwiICsga2V5KTtcbiAgICBpZiAoIWpzb24pIHtcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGF0YSk7XG4gICAgfSBjYXRjaCAoX2Vycm9yKSB7XG4gICAgICBlID0gX2Vycm9yO1xuICAgICAgcmV0dXJuIHR5cGVvZiBjb25zb2xlICE9PSBcInVuZGVmaW5lZFwiICYmIGNvbnNvbGUgIT09IG51bGwgPyBjb25zb2xlLmVycm9yKFwiRXJyb3IgcGFyc2luZyBpbmxpbmUgcGFjZSBvcHRpb25zXCIsIGUpIDogdm9pZCAwO1xuICAgIH1cbiAgfTtcblxuICBFdmVudGVkID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIEV2ZW50ZWQoKSB7fVxuXG4gICAgRXZlbnRlZC5wcm90b3R5cGUub24gPSBmdW5jdGlvbihldmVudCwgaGFuZGxlciwgY3R4LCBvbmNlKSB7XG4gICAgICB2YXIgX2Jhc2U7XG4gICAgICBpZiAob25jZSA9PSBudWxsKSB7XG4gICAgICAgIG9uY2UgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmJpbmRpbmdzID09IG51bGwpIHtcbiAgICAgICAgdGhpcy5iaW5kaW5ncyA9IHt9O1xuICAgICAgfVxuICAgICAgaWYgKChfYmFzZSA9IHRoaXMuYmluZGluZ3MpW2V2ZW50XSA9PSBudWxsKSB7XG4gICAgICAgIF9iYXNlW2V2ZW50XSA9IFtdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuYmluZGluZ3NbZXZlbnRdLnB1c2goe1xuICAgICAgICBoYW5kbGVyOiBoYW5kbGVyLFxuICAgICAgICBjdHg6IGN0eCxcbiAgICAgICAgb25jZTogb25jZVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIEV2ZW50ZWQucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbihldmVudCwgaGFuZGxlciwgY3R4KSB7XG4gICAgICByZXR1cm4gdGhpcy5vbihldmVudCwgaGFuZGxlciwgY3R4LCB0cnVlKTtcbiAgICB9O1xuXG4gICAgRXZlbnRlZC5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24oZXZlbnQsIGhhbmRsZXIpIHtcbiAgICAgIHZhciBpLCBfcmVmLCBfcmVzdWx0cztcbiAgICAgIGlmICgoKF9yZWYgPSB0aGlzLmJpbmRpbmdzKSAhPSBudWxsID8gX3JlZltldmVudF0gOiB2b2lkIDApID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGhhbmRsZXIgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZGVsZXRlIHRoaXMuYmluZGluZ3NbZXZlbnRdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaSA9IDA7XG4gICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgIHdoaWxlIChpIDwgdGhpcy5iaW5kaW5nc1tldmVudF0ubGVuZ3RoKSB7XG4gICAgICAgICAgaWYgKHRoaXMuYmluZGluZ3NbZXZlbnRdW2ldLmhhbmRsZXIgPT09IGhhbmRsZXIpIHtcbiAgICAgICAgICAgIF9yZXN1bHRzLnB1c2godGhpcy5iaW5kaW5nc1tldmVudF0uc3BsaWNlKGksIDEpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX3Jlc3VsdHMucHVzaChpKyspO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICB9XG4gICAgfTtcblxuICAgIEV2ZW50ZWQucHJvdG90eXBlLnRyaWdnZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmdzLCBjdHgsIGV2ZW50LCBoYW5kbGVyLCBpLCBvbmNlLCBfcmVmLCBfcmVmMSwgX3Jlc3VsdHM7XG4gICAgICBldmVudCA9IGFyZ3VtZW50c1swXSwgYXJncyA9IDIgPD0gYXJndW1lbnRzLmxlbmd0aCA/IF9fc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpIDogW107XG4gICAgICBpZiAoKF9yZWYgPSB0aGlzLmJpbmRpbmdzKSAhPSBudWxsID8gX3JlZltldmVudF0gOiB2b2lkIDApIHtcbiAgICAgICAgaSA9IDA7XG4gICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgIHdoaWxlIChpIDwgdGhpcy5iaW5kaW5nc1tldmVudF0ubGVuZ3RoKSB7XG4gICAgICAgICAgX3JlZjEgPSB0aGlzLmJpbmRpbmdzW2V2ZW50XVtpXSwgaGFuZGxlciA9IF9yZWYxLmhhbmRsZXIsIGN0eCA9IF9yZWYxLmN0eCwgb25jZSA9IF9yZWYxLm9uY2U7XG4gICAgICAgICAgaGFuZGxlci5hcHBseShjdHggIT0gbnVsbCA/IGN0eCA6IHRoaXMsIGFyZ3MpO1xuICAgICAgICAgIGlmIChvbmNlKSB7XG4gICAgICAgICAgICBfcmVzdWx0cy5wdXNoKHRoaXMuYmluZGluZ3NbZXZlbnRdLnNwbGljZShpLCAxKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9yZXN1bHRzLnB1c2goaSsrKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gRXZlbnRlZDtcblxuICB9KSgpO1xuXG4gIFBhY2UgPSB3aW5kb3cuUGFjZSB8fCB7fTtcblxuICB3aW5kb3cuUGFjZSA9IFBhY2U7XG5cbiAgZXh0ZW5kKFBhY2UsIEV2ZW50ZWQucHJvdG90eXBlKTtcblxuICBvcHRpb25zID0gUGFjZS5vcHRpb25zID0gZXh0ZW5kKHt9LCBkZWZhdWx0T3B0aW9ucywgd2luZG93LnBhY2VPcHRpb25zLCBnZXRGcm9tRE9NKCkpO1xuXG4gIF9yZWYgPSBbJ2FqYXgnLCAnZG9jdW1lbnQnLCAnZXZlbnRMYWcnLCAnZWxlbWVudHMnXTtcbiAgZm9yIChfaSA9IDAsIF9sZW4gPSBfcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgc291cmNlID0gX3JlZltfaV07XG4gICAgaWYgKG9wdGlvbnNbc291cmNlXSA9PT0gdHJ1ZSkge1xuICAgICAgb3B0aW9uc1tzb3VyY2VdID0gZGVmYXVsdE9wdGlvbnNbc291cmNlXTtcbiAgICB9XG4gIH1cblxuICBOb1RhcmdldEVycm9yID0gKGZ1bmN0aW9uKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhOb1RhcmdldEVycm9yLCBfc3VwZXIpO1xuXG4gICAgZnVuY3Rpb24gTm9UYXJnZXRFcnJvcigpIHtcbiAgICAgIF9yZWYxID0gTm9UYXJnZXRFcnJvci5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiBfcmVmMTtcbiAgICB9XG5cbiAgICByZXR1cm4gTm9UYXJnZXRFcnJvcjtcblxuICB9KShFcnJvcik7XG5cbiAgQmFyID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIEJhcigpIHtcbiAgICAgIHRoaXMucHJvZ3Jlc3MgPSAwO1xuICAgIH1cblxuICAgIEJhci5wcm90b3R5cGUuZ2V0RWxlbWVudCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHRhcmdldEVsZW1lbnQ7XG4gICAgICBpZiAodGhpcy5lbCA9PSBudWxsKSB7XG4gICAgICAgIHRhcmdldEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKG9wdGlvbnMudGFyZ2V0KTtcbiAgICAgICAgaWYgKCF0YXJnZXRFbGVtZW50KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IE5vVGFyZ2V0RXJyb3I7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0aGlzLmVsLmNsYXNzTmFtZSA9IFwicGFjZSBwYWNlLWFjdGl2ZVwiO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTmFtZSA9IGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lLnJlcGxhY2UoL3BhY2UtZG9uZS9nLCAnJyk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NOYW1lICs9ICcgcGFjZS1ydW5uaW5nJztcbiAgICAgICAgdGhpcy5lbC5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cInBhY2UtcHJvZ3Jlc3NcIj5cXG4gIDxkaXYgY2xhc3M9XCJwYWNlLXByb2dyZXNzLWlubmVyXCI+PC9kaXY+XFxuPC9kaXY+XFxuPGRpdiBjbGFzcz1cInBhY2UtYWN0aXZpdHlcIj48L2Rpdj4nO1xuICAgICAgICBpZiAodGFyZ2V0RWxlbWVudC5maXJzdENoaWxkICE9IG51bGwpIHtcbiAgICAgICAgICB0YXJnZXRFbGVtZW50Lmluc2VydEJlZm9yZSh0aGlzLmVsLCB0YXJnZXRFbGVtZW50LmZpcnN0Q2hpbGQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRhcmdldEVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmVsO1xuICAgIH07XG5cbiAgICBCYXIucHJvdG90eXBlLmZpbmlzaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGVsO1xuICAgICAgZWwgPSB0aGlzLmdldEVsZW1lbnQoKTtcbiAgICAgIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZS5yZXBsYWNlKCdwYWNlLWFjdGl2ZScsICcnKTtcbiAgICAgIGVsLmNsYXNzTmFtZSArPSAnIHBhY2UtaW5hY3RpdmUnO1xuICAgICAgZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgPSBkb2N1bWVudC5ib2R5LmNsYXNzTmFtZS5yZXBsYWNlKCdwYWNlLXJ1bm5pbmcnLCAnJyk7XG4gICAgICByZXR1cm4gZG9jdW1lbnQuYm9keS5jbGFzc05hbWUgKz0gJyBwYWNlLWRvbmUnO1xuICAgIH07XG5cbiAgICBCYXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKHByb2cpIHtcbiAgICAgIHRoaXMucHJvZ3Jlc3MgPSBwcm9nO1xuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyKCk7XG4gICAgfTtcblxuICAgIEJhci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5nZXRFbGVtZW50KCkucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmdldEVsZW1lbnQoKSk7XG4gICAgICB9IGNhdGNoIChfZXJyb3IpIHtcbiAgICAgICAgTm9UYXJnZXRFcnJvciA9IF9lcnJvcjtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmVsID0gdm9pZCAwO1xuICAgIH07XG5cbiAgICBCYXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGVsLCBrZXksIHByb2dyZXNzU3RyLCB0cmFuc2Zvcm0sIF9qLCBfbGVuMSwgX3JlZjI7XG4gICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihvcHRpb25zLnRhcmdldCkgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBlbCA9IHRoaXMuZ2V0RWxlbWVudCgpO1xuICAgICAgdHJhbnNmb3JtID0gXCJ0cmFuc2xhdGUzZChcIiArIHRoaXMucHJvZ3Jlc3MgKyBcIiUsIDAsIDApXCI7XG4gICAgICBfcmVmMiA9IFsnd2Via2l0VHJhbnNmb3JtJywgJ21zVHJhbnNmb3JtJywgJ3RyYW5zZm9ybSddO1xuICAgICAgZm9yIChfaiA9IDAsIF9sZW4xID0gX3JlZjIubGVuZ3RoOyBfaiA8IF9sZW4xOyBfaisrKSB7XG4gICAgICAgIGtleSA9IF9yZWYyW19qXTtcbiAgICAgICAgZWwuY2hpbGRyZW5bMF0uc3R5bGVba2V5XSA9IHRyYW5zZm9ybTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5sYXN0UmVuZGVyZWRQcm9ncmVzcyB8fCB0aGlzLmxhc3RSZW5kZXJlZFByb2dyZXNzIHwgMCAhPT0gdGhpcy5wcm9ncmVzcyB8IDApIHtcbiAgICAgICAgZWwuY2hpbGRyZW5bMF0uc2V0QXR0cmlidXRlKCdkYXRhLXByb2dyZXNzLXRleHQnLCBcIlwiICsgKHRoaXMucHJvZ3Jlc3MgfCAwKSArIFwiJVwiKTtcbiAgICAgICAgaWYgKHRoaXMucHJvZ3Jlc3MgPj0gMTAwKSB7XG4gICAgICAgICAgcHJvZ3Jlc3NTdHIgPSAnOTknO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHByb2dyZXNzU3RyID0gdGhpcy5wcm9ncmVzcyA8IDEwID8gXCIwXCIgOiBcIlwiO1xuICAgICAgICAgIHByb2dyZXNzU3RyICs9IHRoaXMucHJvZ3Jlc3MgfCAwO1xuICAgICAgICB9XG4gICAgICAgIGVsLmNoaWxkcmVuWzBdLnNldEF0dHJpYnV0ZSgnZGF0YS1wcm9ncmVzcycsIFwiXCIgKyBwcm9ncmVzc1N0cik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5sYXN0UmVuZGVyZWRQcm9ncmVzcyA9IHRoaXMucHJvZ3Jlc3M7XG4gICAgfTtcblxuICAgIEJhci5wcm90b3R5cGUuZG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMucHJvZ3Jlc3MgPj0gMTAwO1xuICAgIH07XG5cbiAgICByZXR1cm4gQmFyO1xuXG4gIH0pKCk7XG5cbiAgRXZlbnRzID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIEV2ZW50cygpIHtcbiAgICAgIHRoaXMuYmluZGluZ3MgPSB7fTtcbiAgICB9XG5cbiAgICBFdmVudHMucHJvdG90eXBlLnRyaWdnZXIgPSBmdW5jdGlvbihuYW1lLCB2YWwpIHtcbiAgICAgIHZhciBiaW5kaW5nLCBfaiwgX2xlbjEsIF9yZWYyLCBfcmVzdWx0cztcbiAgICAgIGlmICh0aGlzLmJpbmRpbmdzW25hbWVdICE9IG51bGwpIHtcbiAgICAgICAgX3JlZjIgPSB0aGlzLmJpbmRpbmdzW25hbWVdO1xuICAgICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgICBmb3IgKF9qID0gMCwgX2xlbjEgPSBfcmVmMi5sZW5ndGg7IF9qIDwgX2xlbjE7IF9qKyspIHtcbiAgICAgICAgICBiaW5kaW5nID0gX3JlZjJbX2pdO1xuICAgICAgICAgIF9yZXN1bHRzLnB1c2goYmluZGluZy5jYWxsKHRoaXMsIHZhbCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgRXZlbnRzLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKG5hbWUsIGZuKSB7XG4gICAgICB2YXIgX2Jhc2U7XG4gICAgICBpZiAoKF9iYXNlID0gdGhpcy5iaW5kaW5ncylbbmFtZV0gPT0gbnVsbCkge1xuICAgICAgICBfYmFzZVtuYW1lXSA9IFtdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuYmluZGluZ3NbbmFtZV0ucHVzaChmbik7XG4gICAgfTtcblxuICAgIHJldHVybiBFdmVudHM7XG5cbiAgfSkoKTtcblxuICBfWE1MSHR0cFJlcXVlc3QgPSB3aW5kb3cuWE1MSHR0cFJlcXVlc3Q7XG5cbiAgX1hEb21haW5SZXF1ZXN0ID0gd2luZG93LlhEb21haW5SZXF1ZXN0O1xuXG4gIF9XZWJTb2NrZXQgPSB3aW5kb3cuV2ViU29ja2V0O1xuXG4gIGV4dGVuZE5hdGl2ZSA9IGZ1bmN0aW9uKHRvLCBmcm9tKSB7XG4gICAgdmFyIGUsIGtleSwgX3Jlc3VsdHM7XG4gICAgX3Jlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGtleSBpbiBmcm9tLnByb3RvdHlwZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCh0b1trZXldID09IG51bGwpICYmIHR5cGVvZiBmcm9tW2tleV0gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgX3Jlc3VsdHMucHVzaChPYmplY3QuZGVmaW5lUHJvcGVydHkodG8sIGtleSwge1xuICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmcm9tLnByb3RvdHlwZVtrZXldO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWVcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX3Jlc3VsdHMucHVzaCh0b1trZXldID0gZnJvbS5wcm90b3R5cGVba2V5XSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF9yZXN1bHRzLnB1c2godm9pZCAwKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoX2Vycm9yKSB7XG4gICAgICAgIGUgPSBfZXJyb3I7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBfcmVzdWx0cztcbiAgfTtcblxuICBpZ25vcmVTdGFjayA9IFtdO1xuXG4gIFBhY2UuaWdub3JlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MsIGZuLCByZXQ7XG4gICAgZm4gPSBhcmd1bWVudHNbMF0sIGFyZ3MgPSAyIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBfX3NsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSA6IFtdO1xuICAgIGlnbm9yZVN0YWNrLnVuc2hpZnQoJ2lnbm9yZScpO1xuICAgIHJldCA9IGZuLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgIGlnbm9yZVN0YWNrLnNoaWZ0KCk7XG4gICAgcmV0dXJuIHJldDtcbiAgfTtcblxuICBQYWNlLnRyYWNrID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MsIGZuLCByZXQ7XG4gICAgZm4gPSBhcmd1bWVudHNbMF0sIGFyZ3MgPSAyIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBfX3NsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSA6IFtdO1xuICAgIGlnbm9yZVN0YWNrLnVuc2hpZnQoJ3RyYWNrJyk7XG4gICAgcmV0ID0gZm4uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgaWdub3JlU3RhY2suc2hpZnQoKTtcbiAgICByZXR1cm4gcmV0O1xuICB9O1xuXG4gIHNob3VsZFRyYWNrID0gZnVuY3Rpb24obWV0aG9kKSB7XG4gICAgdmFyIF9yZWYyO1xuICAgIGlmIChtZXRob2QgPT0gbnVsbCkge1xuICAgICAgbWV0aG9kID0gJ0dFVCc7XG4gICAgfVxuICAgIGlmIChpZ25vcmVTdGFja1swXSA9PT0gJ3RyYWNrJykge1xuICAgICAgcmV0dXJuICdmb3JjZSc7XG4gICAgfVxuICAgIGlmICghaWdub3JlU3RhY2subGVuZ3RoICYmIG9wdGlvbnMuYWpheCkge1xuICAgICAgaWYgKG1ldGhvZCA9PT0gJ3NvY2tldCcgJiYgb3B0aW9ucy5hamF4LnRyYWNrV2ViU29ja2V0cykge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoX3JlZjIgPSBtZXRob2QudG9VcHBlckNhc2UoKSwgX19pbmRleE9mLmNhbGwob3B0aW9ucy5hamF4LnRyYWNrTWV0aG9kcywgX3JlZjIpID49IDApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICBSZXF1ZXN0SW50ZXJjZXB0ID0gKGZ1bmN0aW9uKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhSZXF1ZXN0SW50ZXJjZXB0LCBfc3VwZXIpO1xuXG4gICAgZnVuY3Rpb24gUmVxdWVzdEludGVyY2VwdCgpIHtcbiAgICAgIHZhciBtb25pdG9yWEhSLFxuICAgICAgICBfdGhpcyA9IHRoaXM7XG4gICAgICBSZXF1ZXN0SW50ZXJjZXB0Ll9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgbW9uaXRvclhIUiA9IGZ1bmN0aW9uKHJlcSkge1xuICAgICAgICB2YXIgX29wZW47XG4gICAgICAgIF9vcGVuID0gcmVxLm9wZW47XG4gICAgICAgIHJldHVybiByZXEub3BlbiA9IGZ1bmN0aW9uKHR5cGUsIHVybCwgYXN5bmMpIHtcbiAgICAgICAgICBpZiAoc2hvdWxkVHJhY2sodHlwZSkpIHtcbiAgICAgICAgICAgIF90aGlzLnRyaWdnZXIoJ3JlcXVlc3QnLCB7XG4gICAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgICAgICByZXF1ZXN0OiByZXFcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gX29wZW4uYXBwbHkocmVxLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgICAgfTtcbiAgICAgIHdpbmRvdy5YTUxIdHRwUmVxdWVzdCA9IGZ1bmN0aW9uKGZsYWdzKSB7XG4gICAgICAgIHZhciByZXE7XG4gICAgICAgIHJlcSA9IG5ldyBfWE1MSHR0cFJlcXVlc3QoZmxhZ3MpO1xuICAgICAgICBtb25pdG9yWEhSKHJlcSk7XG4gICAgICAgIHJldHVybiByZXE7XG4gICAgICB9O1xuICAgICAgdHJ5IHtcbiAgICAgICAgZXh0ZW5kTmF0aXZlKHdpbmRvdy5YTUxIdHRwUmVxdWVzdCwgX1hNTEh0dHBSZXF1ZXN0KTtcbiAgICAgIH0gY2F0Y2ggKF9lcnJvcikge31cbiAgICAgIGlmIChfWERvbWFpblJlcXVlc3QgIT0gbnVsbCkge1xuICAgICAgICB3aW5kb3cuWERvbWFpblJlcXVlc3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgcmVxO1xuICAgICAgICAgIHJlcSA9IG5ldyBfWERvbWFpblJlcXVlc3Q7XG4gICAgICAgICAgbW9uaXRvclhIUihyZXEpO1xuICAgICAgICAgIHJldHVybiByZXE7XG4gICAgICAgIH07XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZXh0ZW5kTmF0aXZlKHdpbmRvdy5YRG9tYWluUmVxdWVzdCwgX1hEb21haW5SZXF1ZXN0KTtcbiAgICAgICAgfSBjYXRjaCAoX2Vycm9yKSB7fVxuICAgICAgfVxuICAgICAgaWYgKChfV2ViU29ja2V0ICE9IG51bGwpICYmIG9wdGlvbnMuYWpheC50cmFja1dlYlNvY2tldHMpIHtcbiAgICAgICAgd2luZG93LldlYlNvY2tldCA9IGZ1bmN0aW9uKHVybCwgcHJvdG9jb2xzKSB7XG4gICAgICAgICAgdmFyIHJlcTtcbiAgICAgICAgICBpZiAocHJvdG9jb2xzICE9IG51bGwpIHtcbiAgICAgICAgICAgIHJlcSA9IG5ldyBfV2ViU29ja2V0KHVybCwgcHJvdG9jb2xzKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVxID0gbmV3IF9XZWJTb2NrZXQodXJsKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHNob3VsZFRyYWNrKCdzb2NrZXQnKSkge1xuICAgICAgICAgICAgX3RoaXMudHJpZ2dlcigncmVxdWVzdCcsIHtcbiAgICAgICAgICAgICAgdHlwZTogJ3NvY2tldCcsXG4gICAgICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgICAgICBwcm90b2NvbHM6IHByb3RvY29scyxcbiAgICAgICAgICAgICAgcmVxdWVzdDogcmVxXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJlcTtcbiAgICAgICAgfTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBleHRlbmROYXRpdmUod2luZG93LldlYlNvY2tldCwgX1dlYlNvY2tldCk7XG4gICAgICAgIH0gY2F0Y2ggKF9lcnJvcikge31cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gUmVxdWVzdEludGVyY2VwdDtcblxuICB9KShFdmVudHMpO1xuXG4gIF9pbnRlcmNlcHQgPSBudWxsO1xuXG4gIGdldEludGVyY2VwdCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChfaW50ZXJjZXB0ID09IG51bGwpIHtcbiAgICAgIF9pbnRlcmNlcHQgPSBuZXcgUmVxdWVzdEludGVyY2VwdDtcbiAgICB9XG4gICAgcmV0dXJuIF9pbnRlcmNlcHQ7XG4gIH07XG5cbiAgc2hvdWxkSWdub3JlVVJMID0gZnVuY3Rpb24odXJsKSB7XG4gICAgdmFyIHBhdHRlcm4sIF9qLCBfbGVuMSwgX3JlZjI7XG4gICAgX3JlZjIgPSBvcHRpb25zLmFqYXguaWdub3JlVVJMcztcbiAgICBmb3IgKF9qID0gMCwgX2xlbjEgPSBfcmVmMi5sZW5ndGg7IF9qIDwgX2xlbjE7IF9qKyspIHtcbiAgICAgIHBhdHRlcm4gPSBfcmVmMltfal07XG4gICAgICBpZiAodHlwZW9mIHBhdHRlcm4gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmICh1cmwuaW5kZXhPZihwYXR0ZXJuKSAhPT0gLTEpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHBhdHRlcm4udGVzdCh1cmwpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIGdldEludGVyY2VwdCgpLm9uKCdyZXF1ZXN0JywgZnVuY3Rpb24oX2FyZykge1xuICAgIHZhciBhZnRlciwgYXJncywgcmVxdWVzdCwgdHlwZSwgdXJsO1xuICAgIHR5cGUgPSBfYXJnLnR5cGUsIHJlcXVlc3QgPSBfYXJnLnJlcXVlc3QsIHVybCA9IF9hcmcudXJsO1xuICAgIGlmIChzaG91bGRJZ25vcmVVUkwodXJsKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoIVBhY2UucnVubmluZyAmJiAob3B0aW9ucy5yZXN0YXJ0T25SZXF1ZXN0QWZ0ZXIgIT09IGZhbHNlIHx8IHNob3VsZFRyYWNrKHR5cGUpID09PSAnZm9yY2UnKSkge1xuICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIGFmdGVyID0gb3B0aW9ucy5yZXN0YXJ0T25SZXF1ZXN0QWZ0ZXIgfHwgMDtcbiAgICAgIGlmICh0eXBlb2YgYWZ0ZXIgPT09ICdib29sZWFuJykge1xuICAgICAgICBhZnRlciA9IDA7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHN0aWxsQWN0aXZlLCBfaiwgX2xlbjEsIF9yZWYyLCBfcmVmMywgX3Jlc3VsdHM7XG4gICAgICAgIGlmICh0eXBlID09PSAnc29ja2V0Jykge1xuICAgICAgICAgIHN0aWxsQWN0aXZlID0gcmVxdWVzdC5yZWFkeVN0YXRlIDwgMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdGlsbEFjdGl2ZSA9ICgwIDwgKF9yZWYyID0gcmVxdWVzdC5yZWFkeVN0YXRlKSAmJiBfcmVmMiA8IDQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGlsbEFjdGl2ZSkge1xuICAgICAgICAgIFBhY2UucmVzdGFydCgpO1xuICAgICAgICAgIF9yZWYzID0gUGFjZS5zb3VyY2VzO1xuICAgICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgICAgZm9yIChfaiA9IDAsIF9sZW4xID0gX3JlZjMubGVuZ3RoOyBfaiA8IF9sZW4xOyBfaisrKSB7XG4gICAgICAgICAgICBzb3VyY2UgPSBfcmVmM1tfal07XG4gICAgICAgICAgICBpZiAoc291cmNlIGluc3RhbmNlb2YgQWpheE1vbml0b3IpIHtcbiAgICAgICAgICAgICAgc291cmNlLndhdGNoLmFwcGx5KHNvdXJjZSwgYXJncyk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgX3Jlc3VsdHMucHVzaCh2b2lkIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICAgIH1cbiAgICAgIH0sIGFmdGVyKTtcbiAgICB9XG4gIH0pO1xuXG4gIEFqYXhNb25pdG9yID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIEFqYXhNb25pdG9yKCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgIHRoaXMuZWxlbWVudHMgPSBbXTtcbiAgICAgIGdldEludGVyY2VwdCgpLm9uKCdyZXF1ZXN0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfdGhpcy53YXRjaC5hcHBseShfdGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIEFqYXhNb25pdG9yLnByb3RvdHlwZS53YXRjaCA9IGZ1bmN0aW9uKF9hcmcpIHtcbiAgICAgIHZhciByZXF1ZXN0LCB0cmFja2VyLCB0eXBlLCB1cmw7XG4gICAgICB0eXBlID0gX2FyZy50eXBlLCByZXF1ZXN0ID0gX2FyZy5yZXF1ZXN0LCB1cmwgPSBfYXJnLnVybDtcbiAgICAgIGlmIChzaG91bGRJZ25vcmVVUkwodXJsKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAodHlwZSA9PT0gJ3NvY2tldCcpIHtcbiAgICAgICAgdHJhY2tlciA9IG5ldyBTb2NrZXRSZXF1ZXN0VHJhY2tlcihyZXF1ZXN0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRyYWNrZXIgPSBuZXcgWEhSUmVxdWVzdFRyYWNrZXIocmVxdWVzdCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5lbGVtZW50cy5wdXNoKHRyYWNrZXIpO1xuICAgIH07XG5cbiAgICByZXR1cm4gQWpheE1vbml0b3I7XG5cbiAgfSkoKTtcblxuICBYSFJSZXF1ZXN0VHJhY2tlciA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBYSFJSZXF1ZXN0VHJhY2tlcihyZXF1ZXN0KSB7XG4gICAgICB2YXIgZXZlbnQsIHNpemUsIF9qLCBfbGVuMSwgX29ucmVhZHlzdGF0ZWNoYW5nZSwgX3JlZjIsXG4gICAgICAgIF90aGlzID0gdGhpcztcbiAgICAgIHRoaXMucHJvZ3Jlc3MgPSAwO1xuICAgICAgaWYgKHdpbmRvdy5Qcm9ncmVzc0V2ZW50ICE9IG51bGwpIHtcbiAgICAgICAgc2l6ZSA9IG51bGw7XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgICBpZiAoZXZ0Lmxlbmd0aENvbXB1dGFibGUpIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcy5wcm9ncmVzcyA9IDEwMCAqIGV2dC5sb2FkZWQgLyBldnQudG90YWw7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcy5wcm9ncmVzcyA9IF90aGlzLnByb2dyZXNzICsgKDEwMCAtIF90aGlzLnByb2dyZXNzKSAvIDI7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBmYWxzZSk7XG4gICAgICAgIF9yZWYyID0gWydsb2FkJywgJ2Fib3J0JywgJ3RpbWVvdXQnLCAnZXJyb3InXTtcbiAgICAgICAgZm9yIChfaiA9IDAsIF9sZW4xID0gX3JlZjIubGVuZ3RoOyBfaiA8IF9sZW4xOyBfaisrKSB7XG4gICAgICAgICAgZXZlbnQgPSBfcmVmMltfal07XG4gICAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcy5wcm9ncmVzcyA9IDEwMDtcbiAgICAgICAgICB9LCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF9vbnJlYWR5c3RhdGVjaGFuZ2UgPSByZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZTtcbiAgICAgICAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgX3JlZjM7XG4gICAgICAgICAgaWYgKChfcmVmMyA9IHJlcXVlc3QucmVhZHlTdGF0ZSkgPT09IDAgfHwgX3JlZjMgPT09IDQpIHtcbiAgICAgICAgICAgIF90aGlzLnByb2dyZXNzID0gMTAwO1xuICAgICAgICAgIH0gZWxzZSBpZiAocmVxdWVzdC5yZWFkeVN0YXRlID09PSAzKSB7XG4gICAgICAgICAgICBfdGhpcy5wcm9ncmVzcyA9IDUwO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdHlwZW9mIF9vbnJlYWR5c3RhdGVjaGFuZ2UgPT09IFwiZnVuY3Rpb25cIiA/IF9vbnJlYWR5c3RhdGVjaGFuZ2UuYXBwbHkobnVsbCwgYXJndW1lbnRzKSA6IHZvaWQgMDtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gWEhSUmVxdWVzdFRyYWNrZXI7XG5cbiAgfSkoKTtcblxuICBTb2NrZXRSZXF1ZXN0VHJhY2tlciA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBTb2NrZXRSZXF1ZXN0VHJhY2tlcihyZXF1ZXN0KSB7XG4gICAgICB2YXIgZXZlbnQsIF9qLCBfbGVuMSwgX3JlZjIsXG4gICAgICAgIF90aGlzID0gdGhpcztcbiAgICAgIHRoaXMucHJvZ3Jlc3MgPSAwO1xuICAgICAgX3JlZjIgPSBbJ2Vycm9yJywgJ29wZW4nXTtcbiAgICAgIGZvciAoX2ogPSAwLCBfbGVuMSA9IF9yZWYyLmxlbmd0aDsgX2ogPCBfbGVuMTsgX2orKykge1xuICAgICAgICBldmVudCA9IF9yZWYyW19qXTtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMucHJvZ3Jlc3MgPSAxMDA7XG4gICAgICAgIH0sIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gU29ja2V0UmVxdWVzdFRyYWNrZXI7XG5cbiAgfSkoKTtcblxuICBFbGVtZW50TW9uaXRvciA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBFbGVtZW50TW9uaXRvcihvcHRpb25zKSB7XG4gICAgICB2YXIgc2VsZWN0b3IsIF9qLCBfbGVuMSwgX3JlZjI7XG4gICAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZWxlbWVudHMgPSBbXTtcbiAgICAgIGlmIChvcHRpb25zLnNlbGVjdG9ycyA9PSBudWxsKSB7XG4gICAgICAgIG9wdGlvbnMuc2VsZWN0b3JzID0gW107XG4gICAgICB9XG4gICAgICBfcmVmMiA9IG9wdGlvbnMuc2VsZWN0b3JzO1xuICAgICAgZm9yIChfaiA9IDAsIF9sZW4xID0gX3JlZjIubGVuZ3RoOyBfaiA8IF9sZW4xOyBfaisrKSB7XG4gICAgICAgIHNlbGVjdG9yID0gX3JlZjJbX2pdO1xuICAgICAgICB0aGlzLmVsZW1lbnRzLnB1c2gobmV3IEVsZW1lbnRUcmFja2VyKHNlbGVjdG9yKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIEVsZW1lbnRNb25pdG9yO1xuXG4gIH0pKCk7XG5cbiAgRWxlbWVudFRyYWNrZXIgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gRWxlbWVudFRyYWNrZXIoc2VsZWN0b3IpIHtcbiAgICAgIHRoaXMuc2VsZWN0b3IgPSBzZWxlY3RvcjtcbiAgICAgIHRoaXMucHJvZ3Jlc3MgPSAwO1xuICAgICAgdGhpcy5jaGVjaygpO1xuICAgIH1cblxuICAgIEVsZW1lbnRUcmFja2VyLnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuc2VsZWN0b3IpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRvbmUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KChmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuY2hlY2soKTtcbiAgICAgICAgfSksIG9wdGlvbnMuZWxlbWVudHMuY2hlY2tJbnRlcnZhbCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIEVsZW1lbnRUcmFja2VyLnByb3RvdHlwZS5kb25lID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcm9ncmVzcyA9IDEwMDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIEVsZW1lbnRUcmFja2VyO1xuXG4gIH0pKCk7XG5cbiAgRG9jdW1lbnRNb25pdG9yID0gKGZ1bmN0aW9uKCkge1xuICAgIERvY3VtZW50TW9uaXRvci5wcm90b3R5cGUuc3RhdGVzID0ge1xuICAgICAgbG9hZGluZzogMCxcbiAgICAgIGludGVyYWN0aXZlOiA1MCxcbiAgICAgIGNvbXBsZXRlOiAxMDBcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gRG9jdW1lbnRNb25pdG9yKCkge1xuICAgICAgdmFyIF9vbnJlYWR5c3RhdGVjaGFuZ2UsIF9yZWYyLFxuICAgICAgICBfdGhpcyA9IHRoaXM7XG4gICAgICB0aGlzLnByb2dyZXNzID0gKF9yZWYyID0gdGhpcy5zdGF0ZXNbZG9jdW1lbnQucmVhZHlTdGF0ZV0pICE9IG51bGwgPyBfcmVmMiA6IDEwMDtcbiAgICAgIF9vbnJlYWR5c3RhdGVjaGFuZ2UgPSBkb2N1bWVudC5vbnJlYWR5c3RhdGVjaGFuZ2U7XG4gICAgICBkb2N1bWVudC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKF90aGlzLnN0YXRlc1tkb2N1bWVudC5yZWFkeVN0YXRlXSAhPSBudWxsKSB7XG4gICAgICAgICAgX3RoaXMucHJvZ3Jlc3MgPSBfdGhpcy5zdGF0ZXNbZG9jdW1lbnQucmVhZHlTdGF0ZV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHR5cGVvZiBfb25yZWFkeXN0YXRlY2hhbmdlID09PSBcImZ1bmN0aW9uXCIgPyBfb25yZWFkeXN0YXRlY2hhbmdlLmFwcGx5KG51bGwsIGFyZ3VtZW50cykgOiB2b2lkIDA7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBEb2N1bWVudE1vbml0b3I7XG5cbiAgfSkoKTtcblxuICBFdmVudExhZ01vbml0b3IgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gRXZlbnRMYWdNb25pdG9yKCkge1xuICAgICAgdmFyIGF2ZywgaW50ZXJ2YWwsIGxhc3QsIHBvaW50cywgc2FtcGxlcyxcbiAgICAgICAgX3RoaXMgPSB0aGlzO1xuICAgICAgdGhpcy5wcm9ncmVzcyA9IDA7XG4gICAgICBhdmcgPSAwO1xuICAgICAgc2FtcGxlcyA9IFtdO1xuICAgICAgcG9pbnRzID0gMDtcbiAgICAgIGxhc3QgPSBub3coKTtcbiAgICAgIGludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkaWZmO1xuICAgICAgICBkaWZmID0gbm93KCkgLSBsYXN0IC0gNTA7XG4gICAgICAgIGxhc3QgPSBub3coKTtcbiAgICAgICAgc2FtcGxlcy5wdXNoKGRpZmYpO1xuICAgICAgICBpZiAoc2FtcGxlcy5sZW5ndGggPiBvcHRpb25zLmV2ZW50TGFnLnNhbXBsZUNvdW50KSB7XG4gICAgICAgICAgc2FtcGxlcy5zaGlmdCgpO1xuICAgICAgICB9XG4gICAgICAgIGF2ZyA9IGF2Z0FtcGxpdHVkZShzYW1wbGVzKTtcbiAgICAgICAgaWYgKCsrcG9pbnRzID49IG9wdGlvbnMuZXZlbnRMYWcubWluU2FtcGxlcyAmJiBhdmcgPCBvcHRpb25zLmV2ZW50TGFnLmxhZ1RocmVzaG9sZCkge1xuICAgICAgICAgIF90aGlzLnByb2dyZXNzID0gMTAwO1xuICAgICAgICAgIHJldHVybiBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMucHJvZ3Jlc3MgPSAxMDAgKiAoMyAvIChhdmcgKyAzKSk7XG4gICAgICAgIH1cbiAgICAgIH0sIDUwKTtcbiAgICB9XG5cbiAgICByZXR1cm4gRXZlbnRMYWdNb25pdG9yO1xuXG4gIH0pKCk7XG5cbiAgU2NhbGVyID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIFNjYWxlcihzb3VyY2UpIHtcbiAgICAgIHRoaXMuc291cmNlID0gc291cmNlO1xuICAgICAgdGhpcy5sYXN0ID0gdGhpcy5zaW5jZUxhc3RVcGRhdGUgPSAwO1xuICAgICAgdGhpcy5yYXRlID0gb3B0aW9ucy5pbml0aWFsUmF0ZTtcbiAgICAgIHRoaXMuY2F0Y2h1cCA9IDA7XG4gICAgICB0aGlzLnByb2dyZXNzID0gdGhpcy5sYXN0UHJvZ3Jlc3MgPSAwO1xuICAgICAgaWYgKHRoaXMuc291cmNlICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5wcm9ncmVzcyA9IHJlc3VsdCh0aGlzLnNvdXJjZSwgJ3Byb2dyZXNzJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgU2NhbGVyLnByb3RvdHlwZS50aWNrID0gZnVuY3Rpb24oZnJhbWVUaW1lLCB2YWwpIHtcbiAgICAgIHZhciBzY2FsaW5nO1xuICAgICAgaWYgKHZhbCA9PSBudWxsKSB7XG4gICAgICAgIHZhbCA9IHJlc3VsdCh0aGlzLnNvdXJjZSwgJ3Byb2dyZXNzJyk7XG4gICAgICB9XG4gICAgICBpZiAodmFsID49IDEwMCkge1xuICAgICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKHZhbCA9PT0gdGhpcy5sYXN0KSB7XG4gICAgICAgIHRoaXMuc2luY2VMYXN0VXBkYXRlICs9IGZyYW1lVGltZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGlzLnNpbmNlTGFzdFVwZGF0ZSkge1xuICAgICAgICAgIHRoaXMucmF0ZSA9ICh2YWwgLSB0aGlzLmxhc3QpIC8gdGhpcy5zaW5jZUxhc3RVcGRhdGU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jYXRjaHVwID0gKHZhbCAtIHRoaXMucHJvZ3Jlc3MpIC8gb3B0aW9ucy5jYXRjaHVwVGltZTtcbiAgICAgICAgdGhpcy5zaW5jZUxhc3RVcGRhdGUgPSAwO1xuICAgICAgICB0aGlzLmxhc3QgPSB2YWw7XG4gICAgICB9XG4gICAgICBpZiAodmFsID4gdGhpcy5wcm9ncmVzcykge1xuICAgICAgICB0aGlzLnByb2dyZXNzICs9IHRoaXMuY2F0Y2h1cCAqIGZyYW1lVGltZTtcbiAgICAgIH1cbiAgICAgIHNjYWxpbmcgPSAxIC0gTWF0aC5wb3codGhpcy5wcm9ncmVzcyAvIDEwMCwgb3B0aW9ucy5lYXNlRmFjdG9yKTtcbiAgICAgIHRoaXMucHJvZ3Jlc3MgKz0gc2NhbGluZyAqIHRoaXMucmF0ZSAqIGZyYW1lVGltZTtcbiAgICAgIHRoaXMucHJvZ3Jlc3MgPSBNYXRoLm1pbih0aGlzLmxhc3RQcm9ncmVzcyArIG9wdGlvbnMubWF4UHJvZ3Jlc3NQZXJGcmFtZSwgdGhpcy5wcm9ncmVzcyk7XG4gICAgICB0aGlzLnByb2dyZXNzID0gTWF0aC5tYXgoMCwgdGhpcy5wcm9ncmVzcyk7XG4gICAgICB0aGlzLnByb2dyZXNzID0gTWF0aC5taW4oMTAwLCB0aGlzLnByb2dyZXNzKTtcbiAgICAgIHRoaXMubGFzdFByb2dyZXNzID0gdGhpcy5wcm9ncmVzcztcbiAgICAgIHJldHVybiB0aGlzLnByb2dyZXNzO1xuICAgIH07XG5cbiAgICByZXR1cm4gU2NhbGVyO1xuXG4gIH0pKCk7XG5cbiAgc291cmNlcyA9IG51bGw7XG5cbiAgc2NhbGVycyA9IG51bGw7XG5cbiAgYmFyID0gbnVsbDtcblxuICB1bmlTY2FsZXIgPSBudWxsO1xuXG4gIGFuaW1hdGlvbiA9IG51bGw7XG5cbiAgY2FuY2VsQW5pbWF0aW9uID0gbnVsbDtcblxuICBQYWNlLnJ1bm5pbmcgPSBmYWxzZTtcblxuICBoYW5kbGVQdXNoU3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAob3B0aW9ucy5yZXN0YXJ0T25QdXNoU3RhdGUpIHtcbiAgICAgIHJldHVybiBQYWNlLnJlc3RhcnQoKTtcbiAgICB9XG4gIH07XG5cbiAgaWYgKHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSAhPSBudWxsKSB7XG4gICAgX3B1c2hTdGF0ZSA9IHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZTtcbiAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIGhhbmRsZVB1c2hTdGF0ZSgpO1xuICAgICAgcmV0dXJuIF9wdXNoU3RhdGUuYXBwbHkod2luZG93Lmhpc3RvcnksIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfVxuXG4gIGlmICh3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUgIT0gbnVsbCkge1xuICAgIF9yZXBsYWNlU3RhdGUgPSB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGU7XG4gICAgd2luZG93Lmhpc3RvcnkucmVwbGFjZVN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICBoYW5kbGVQdXNoU3RhdGUoKTtcbiAgICAgIHJldHVybiBfcmVwbGFjZVN0YXRlLmFwcGx5KHdpbmRvdy5oaXN0b3J5LCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBTT1VSQ0VfS0VZUyA9IHtcbiAgICBhamF4OiBBamF4TW9uaXRvcixcbiAgICBlbGVtZW50czogRWxlbWVudE1vbml0b3IsXG4gICAgZG9jdW1lbnQ6IERvY3VtZW50TW9uaXRvcixcbiAgICBldmVudExhZzogRXZlbnRMYWdNb25pdG9yXG4gIH07XG5cbiAgKGluaXQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdHlwZSwgX2osIF9rLCBfbGVuMSwgX2xlbjIsIF9yZWYyLCBfcmVmMywgX3JlZjQ7XG4gICAgUGFjZS5zb3VyY2VzID0gc291cmNlcyA9IFtdO1xuICAgIF9yZWYyID0gWydhamF4JywgJ2VsZW1lbnRzJywgJ2RvY3VtZW50JywgJ2V2ZW50TGFnJ107XG4gICAgZm9yIChfaiA9IDAsIF9sZW4xID0gX3JlZjIubGVuZ3RoOyBfaiA8IF9sZW4xOyBfaisrKSB7XG4gICAgICB0eXBlID0gX3JlZjJbX2pdO1xuICAgICAgaWYgKG9wdGlvbnNbdHlwZV0gIT09IGZhbHNlKSB7XG4gICAgICAgIHNvdXJjZXMucHVzaChuZXcgU09VUkNFX0tFWVNbdHlwZV0ob3B0aW9uc1t0eXBlXSkpO1xuICAgICAgfVxuICAgIH1cbiAgICBfcmVmNCA9IChfcmVmMyA9IG9wdGlvbnMuZXh0cmFTb3VyY2VzKSAhPSBudWxsID8gX3JlZjMgOiBbXTtcbiAgICBmb3IgKF9rID0gMCwgX2xlbjIgPSBfcmVmNC5sZW5ndGg7IF9rIDwgX2xlbjI7IF9rKyspIHtcbiAgICAgIHNvdXJjZSA9IF9yZWY0W19rXTtcbiAgICAgIHNvdXJjZXMucHVzaChuZXcgc291cmNlKG9wdGlvbnMpKTtcbiAgICB9XG4gICAgUGFjZS5iYXIgPSBiYXIgPSBuZXcgQmFyO1xuICAgIHNjYWxlcnMgPSBbXTtcbiAgICByZXR1cm4gdW5pU2NhbGVyID0gbmV3IFNjYWxlcjtcbiAgfSkoKTtcblxuICBQYWNlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgICBQYWNlLnRyaWdnZXIoJ3N0b3AnKTtcbiAgICBQYWNlLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICBiYXIuZGVzdHJveSgpO1xuICAgIGNhbmNlbEFuaW1hdGlvbiA9IHRydWU7XG4gICAgaWYgKGFuaW1hdGlvbiAhPSBudWxsKSB7XG4gICAgICBpZiAodHlwZW9mIGNhbmNlbEFuaW1hdGlvbkZyYW1lID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbWF0aW9uKTtcbiAgICAgIH1cbiAgICAgIGFuaW1hdGlvbiA9IG51bGw7XG4gICAgfVxuICAgIHJldHVybiBpbml0KCk7XG4gIH07XG5cbiAgUGFjZS5yZXN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgUGFjZS50cmlnZ2VyKCdyZXN0YXJ0Jyk7XG4gICAgUGFjZS5zdG9wKCk7XG4gICAgcmV0dXJuIFBhY2Uuc3RhcnQoKTtcbiAgfTtcblxuICBQYWNlLmdvID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0YXJ0O1xuICAgIFBhY2UucnVubmluZyA9IHRydWU7XG4gICAgYmFyLnJlbmRlcigpO1xuICAgIHN0YXJ0ID0gbm93KCk7XG4gICAgY2FuY2VsQW5pbWF0aW9uID0gZmFsc2U7XG4gICAgcmV0dXJuIGFuaW1hdGlvbiA9IHJ1bkFuaW1hdGlvbihmdW5jdGlvbihmcmFtZVRpbWUsIGVucXVldWVOZXh0RnJhbWUpIHtcbiAgICAgIHZhciBhdmcsIGNvdW50LCBkb25lLCBlbGVtZW50LCBlbGVtZW50cywgaSwgaiwgcmVtYWluaW5nLCBzY2FsZXIsIHNjYWxlckxpc3QsIHN1bSwgX2osIF9rLCBfbGVuMSwgX2xlbjIsIF9yZWYyO1xuICAgICAgcmVtYWluaW5nID0gMTAwIC0gYmFyLnByb2dyZXNzO1xuICAgICAgY291bnQgPSBzdW0gPSAwO1xuICAgICAgZG9uZSA9IHRydWU7XG4gICAgICBmb3IgKGkgPSBfaiA9IDAsIF9sZW4xID0gc291cmNlcy5sZW5ndGg7IF9qIDwgX2xlbjE7IGkgPSArK19qKSB7XG4gICAgICAgIHNvdXJjZSA9IHNvdXJjZXNbaV07XG4gICAgICAgIHNjYWxlckxpc3QgPSBzY2FsZXJzW2ldICE9IG51bGwgPyBzY2FsZXJzW2ldIDogc2NhbGVyc1tpXSA9IFtdO1xuICAgICAgICBlbGVtZW50cyA9IChfcmVmMiA9IHNvdXJjZS5lbGVtZW50cykgIT0gbnVsbCA/IF9yZWYyIDogW3NvdXJjZV07XG4gICAgICAgIGZvciAoaiA9IF9rID0gMCwgX2xlbjIgPSBlbGVtZW50cy5sZW5ndGg7IF9rIDwgX2xlbjI7IGogPSArK19rKSB7XG4gICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnRzW2pdO1xuICAgICAgICAgIHNjYWxlciA9IHNjYWxlckxpc3Rbal0gIT0gbnVsbCA/IHNjYWxlckxpc3Rbal0gOiBzY2FsZXJMaXN0W2pdID0gbmV3IFNjYWxlcihlbGVtZW50KTtcbiAgICAgICAgICBkb25lICY9IHNjYWxlci5kb25lO1xuICAgICAgICAgIGlmIChzY2FsZXIuZG9uZSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgc3VtICs9IHNjYWxlci50aWNrKGZyYW1lVGltZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGF2ZyA9IHN1bSAvIGNvdW50O1xuICAgICAgYmFyLnVwZGF0ZSh1bmlTY2FsZXIudGljayhmcmFtZVRpbWUsIGF2ZykpO1xuICAgICAgaWYgKGJhci5kb25lKCkgfHwgZG9uZSB8fCBjYW5jZWxBbmltYXRpb24pIHtcbiAgICAgICAgYmFyLnVwZGF0ZSgxMDApO1xuICAgICAgICBQYWNlLnRyaWdnZXIoJ2RvbmUnKTtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgYmFyLmZpbmlzaCgpO1xuICAgICAgICAgIFBhY2UucnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBQYWNlLnRyaWdnZXIoJ2hpZGUnKTtcbiAgICAgICAgfSwgTWF0aC5tYXgob3B0aW9ucy5naG9zdFRpbWUsIE1hdGgubWF4KG9wdGlvbnMubWluVGltZSAtIChub3coKSAtIHN0YXJ0KSwgMCkpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBlbnF1ZXVlTmV4dEZyYW1lKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgUGFjZS5zdGFydCA9IGZ1bmN0aW9uKF9vcHRpb25zKSB7XG4gICAgZXh0ZW5kKG9wdGlvbnMsIF9vcHRpb25zKTtcbiAgICBQYWNlLnJ1bm5pbmcgPSB0cnVlO1xuICAgIHRyeSB7XG4gICAgICBiYXIucmVuZGVyKCk7XG4gICAgfSBjYXRjaCAoX2Vycm9yKSB7XG4gICAgICBOb1RhcmdldEVycm9yID0gX2Vycm9yO1xuICAgIH1cbiAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wYWNlJykpIHtcbiAgICAgIHJldHVybiBzZXRUaW1lb3V0KFBhY2Uuc3RhcnQsIDUwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgUGFjZS50cmlnZ2VyKCdzdGFydCcpO1xuICAgICAgcmV0dXJuIFBhY2UuZ28oKTtcbiAgICB9XG4gIH07XG5cbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShbJ3BhY2UnXSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gUGFjZTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFBhY2U7XG4gIH0gZWxzZSB7XG4gICAgaWYgKG9wdGlvbnMuc3RhcnRPblBhZ2VMb2FkKSB7XG4gICAgICBQYWNlLnN0YXJ0KCk7XG4gICAgfVxuICB9XG5cbn0pLmNhbGwodGhpcyk7XG4iLCJqUXVlcnkoZnVuY3Rpb24oJCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIEVuYWJsZSAvIGRpc2FibGUgQm9vdHN0cmFwIHRvb2x0aXBzLCBiYXNlZCB1cG9uIHRvdWNoIGV2ZW50c1xuICAgIGlmKE1vZGVybml6ci50b3VjaGV2ZW50cykge1xuICAgICAgICAkKCdbZGF0YS10b2dnbGU9dG9vbHRpcF0nKS50b29sdGlwKCdoaWRlJyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAkKCdbZGF0YS10b2dnbGU9dG9vbHRpcF0nKS50b29sdGlwKCk7XG4gICAgfVxufSk7XG4iXX0=
