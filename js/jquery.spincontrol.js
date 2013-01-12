﻿; (function($, doc, win, undefined) {
	$.fn.spinControl = function(options) {
		return $.spinControl(this, options);
	};
	$.spinControl = function(element, options) {
		var defaults = $.extend(true, {}, $.spinControl.defaults),
			opties = $.extend(true, {}, options);

		element.each(function() {
			if($.fn.numeric) {
				$(this).numeric(opties.decimal);
			}
			spinControl($(this), opties);
		});

		function spinControl(element, opties) {
			if($(element).is(":number") && $.support.spinControl) {
				if(!(opties.override != undefined ? opties.override : defaults.override)) {  // if spincontrol is already supported, theres no need to imitate it!
					return;
				} else {  // override existing arrows;
					try {
						$(element).attr("type", "text");  // probably won't work;
					} catch(e) {
						var _element = $(element);
						element = _element.clone().attr("type", "text");
						_element.after(element).remove();
					}
				}
			}

			var _this = $(element),
				_min = !isNaN(parseFloat(opties.min)) ? parseFloat(opties.min) : !isNaN(parseFloat(_this.attr("min"))) ? parseFloat(_this.attr("min")) : defaults.min,
				_max = !isNaN(parseFloat(opties.max)) ? parseFloat(opties.max) : !isNaN(parseFloat(_this.attr("max"))) ? parseFloat(_this.attr("max")) : defaults.max,
				_step = !!parseFloat(opties.step) ? parseFloat(opties.step) : _this.attr("step") != undefined && !!parseFloat(_this.attr("step").replace(/^\s*(\-|\+|any)/i, "")) ? parseFloat(_this.attr("step").replace(/^\s*(\-|\+|any)/i, "")) : defaults.step,
				_interval = !isNaN(parseInt(opties.interval)) ? parseInt(opties.interval) : defaults.interval,
				_timeout = !isNaN(parseInt(opties.timeout)) ? parseInt(opties.timeout) : defaults.timeout,
				_imgFolder = opties.folder != undefined ? opties.folder : defaults.folder;

			var root = $("<span/>").addClass("spinControl " + ($.browser.mozilla ? "MOZ" : $.browser.opera ? "OPE" : $.browser.safari ? "SAF" : $.browser.msie ? "IE" + parseFloat($.browser.version) : "")),
				imgTop = $("<input/>").val("▲").addClass("UP").attr({ type: "image", src: _imgFolder + "normal_top.jpg" }).appendTo(root),
				imgBtn = $("<input/>").val("▼").addClass("DOWN").attr({ type: "image", src: _imgFolder + "normal_btm.jpg" }).appendTo(root);

			var helper = {
				setBtn: function(method) {
					var timer;
					(method === "+" ? imgTop : imgBtn).hover(function() {
						$(this).data("hovered", true);
						helper.updateStatus(method);
						if(!$(this).attr("readonly") && $(this).data("pressed")) {
							timer = setTimeout(function() {
								timer = setInterval(function() {
									helper.calc(method, timer);
								}, _interval);
							}, _timeout);
						}
					}, /*unhover*/function() {
						helper.clearTimer(timer);
						$(this).data("hovered", false);
						helper.updateStatus(method);
						$("body").mouseup(function() {
							$(this).data("pressed", false);
							helper.updateStatus(method);
						});
					}).mousedown(function() {
						$(this).data("pressed", true);
						helper.updateStatus(method);
						if(!$(this).attr("readonly")) {
							timer = setTimeout(function() {
								timer = setInterval(function() {
									helper.calc(method, timer);
								}, _interval);
							}, _timeout);
						}
					}).mouseup(function() {
						helper.clearTimer(timer);
						$(this).data("pressed", false);
						helper.updateStatus(method);
					}).mouseleave(function() {
						helper.clearTimer(timer);
						var temp = $(this);
						temp.data("hovered", false);
						helper.updateStatus(method);
						$("body").mouseup(function() {
							temp.data("pressed", false);
							helper.updateStatus(method);
						});
					}).focus(function() {
						$(this).data("hovered", true);
						helper.updateStatus(method);
					}).blur(function() {
						$(this).data("hovered", false);
						helper.updateStatus(method);
					}).keydown(function(e) {
						var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
						if(key == 13 || key == 32) {  // enter & spacebar
							$(this).data("pressed", true);
							helper.updateStatus(method);
						}
					}).keyup(function(e) {
						var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
						if(key == 13 || key == 32) {  // enter & spacebar
							$(this).data("pressed", false);
							helper.updateStatus(method);
						}
					}).click(function() {
						helper.calc(method, timer);
						this.focus();  // error not giving focus back;
						return false;  // no reload;
					});
					helper.calcBoundry();
				},
				calc: function(method, timer) {
					var tempVal = parseFloat(_this.val());
					if(!isNaN(tempVal)) {
						if(method === "-") {
							_this.val(Math.min(Math.max(tempVal - _step, _min), _max));
						} else {
							_this.val(Math.max(Math.min(tempVal + _step, _max), _min));
						}
					} else {
						_this.val(Math.max(_min, 0));
					}
					helper.calcBoundry(method, timer);
					(opties.onChanged || defaults.onChanged).call(_this, parseFloat(_this.val()), method);
					method = timer = tempVal = null;
				},
				calcBoundry: function(method, timer) {
					if(parseFloat(_this.val()) === _max) {
						if(method && method === "+" && timer) {
							helper.clearTimer(timer);
						}
						imgTop.attr("readonly", "readonly");
						imgBtn.attr("readonly", "");
					} else if(parseFloat(_this.val()) === _min) {
						if(method && method === "-" && timer) {
							helper.clearTimer(timer);
						}
						imgTop.attr("readonly", "");
						imgBtn.attr("readonly", "readonly");
					} else {
						imgTop.attr("readonly", "");
						imgBtn.attr("readonly", "");
					}
					helper.updateStatus("+");
					helper.updateStatus("-");
				},
				updateStatus: function(method) {
					var obj = (method === "+" ? imgTop : imgBtn),
						arrow = (method === "+" ? "top" : "btm");
					//if(obj.attr("readonly")) {
					//	obj.attr("src", _imgFolder + "readonly" + "_" + arrow + ".jpg");
					//} else if(obj.data("pressed")) {
					//	obj.attr("src", _imgFolder + "down" + "_" + arrow + ".jpg");
					//} else if(obj.data("hovered")) {
					//	obj.attr("src", _imgFolder + "hover" + "_" + arrow + ".jpg");
					//} else {
					//	obj.attr("src", _imgFolder + "normal" + "_" + arrow + ".jpg");
					//}
					method = obj = arrow = null;
				},
				clearTimer: function(timer) {
					clearTimeout(timer);
					clearInterval(timer);
				}
			};

			helper.setBtn("+");
			helper.setBtn("-");

			_this.keyup(function(e) {  // can't use keypress because of Opera & IE not giving arrow keys;
				var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
				if(key == 38) {  // arrow up;
					e.preventDefault();  // no suggestion dropdownbox;
					if($.support.spinControl) helper.calc("+");
					helper.updateStatus("+");
				} else if(key == 40) {  // arrow down;
					e.preventDefault();  // no suggestion dropdownbox;
					if($.support.spinControl) helper.calc("-");
					helper.updateStatus("-");
				}
				e = key = null;
			}).bind("DOMMouseScroll mousewheel", function(e) {
				var delta = (e.wheelDelta || -e.detail) > 0 ? 1 : -1;
				if(delta > 0) {
					helper.calc("+");
					helper.updateStatus("+");
				}
				else if(delta < 0) {
					helper.calc("-");
					helper.updateStatus("-");
				}
				e.preventDefault();
				e = delta = null;
			}).after(root);
		};

		return element;
	};

	// public defaults;
	$.spinControl.defaults = {
		folder: "",
		min: -Infinity,
		max: Infinity,
		step: 1,
		timeout: 250,
		interval: 25,
		decimal: null,
		override: false,
		onChanged: function() { }
	};
})(jQuery, document, window);  // plugin code end;