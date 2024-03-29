/*
 * ast-notif.js
 * http://saya.anandastoon.com/
 * MIT licensed
 *
 * Copyright (C) 2019 - 2021 Ananda Maulana Ilhami (Anandastoon), http://anandastoon.com
 */
(function( root, factory ) {
	if( typeof define === 'function' && define.amd ) {
		// AMD. Register as an anonymous module.
		define( function() {
			root.AstNotif = factory();
			return root.AstNotif;
		} );
	} else if( typeof exports === 'object' ) {
		// Node. Does not work with strict CommonJS.
		module.exports = factory();
	} else {
		// Browser globals.
		root.AstNotif = factory();
	}
}( this, function() {

	'use strict';
	var AstNotif;

	// The ast-notif.js version
	var VERSION = '0.1.2';

	//////////////////////////////////////////////////
	// SECTION: Helper Function
	//////////////////////////////////////////////////

	/**
	 * Add and Remove Class - Code from w3schools, I merged into a func
	 *
	 * @param {element} DOM Element
	 * @param {name} Class name to be inserted to the element
	 * @param {add} Default true, else Remove the class.
	 */
	function AddRemoveClass(element, name, add = true) {
		if (add) {
			if (element.getAttribute("class") != null && element.getAttribute("class") != "") {
				var arr = element.className.split(" ");
				if (arr.indexOf(name) == -1)
					element.className += " " + name;
			} else
				element.setAttribute("class", name);
		} else {
			if (element.getAttribute("class") != null && element.getAttribute("class") != "") {
				var regexp = new RegExp(name, "g");
				element.className = element.className.replace(regexp, "");
			}
		}
	}

	/**
	 * Does An Element Have Class - I extended code above.
	 *
	 * @param {element} DOM Element
	 * @param {name} Class name to be checked
	 */
	function HasClass(element, name) {
		if (element.getAttribute("class") != null && element.getAttribute("class") != "") {
			var arr = element.className.split(" ");
			if (arr.indexOf(name) > -1)
				return true;
		}

		return false;
	}

	/**
	 * Get Current Script Path - Code from stackoverflow, I changed a bit.
	 */
	function getCurrentPath() {
		var scripts = document.getElementsByTagName("script");
		for(var sc = 0; sc < scripts.length; sc++) {
			if (typeof scripts[sc].attributes !== undefined)
				if (typeof scripts[sc].attributes.src != "undefined")
					if (scripts[sc].attributes.src.value.indexOf('ast-notif') > -1)
						return scripts[sc].attributes.src.value.split('?')[0];
		}
		return "";
	}

	/**
	 * Find Closest Parent ELement - Code from StackOverflow
	 *
	 * @param {el} DOM Element
	 * @param {selector} Selector like jQuery one. E.g .class or #id
	 */
	function closest(el, selector) {
	    var matchesFn;

	    // find vendor prefix
	    ['matches','webkitMatchesSelector','mozMatchesSelector','msMatchesSelector','oMatchesSelector'].some(function(fn) {
	        if (typeof document.body[fn] == 'function') {
	            matchesFn = fn;
	            return true;
	        }
	        return false;
	    })

	    var parent;

	    // check self: added by Anandastoon to check self selector
	    if (el[matchesFn](selector)) return el;

	    // traverse parents
	    while (el) {
	        parent = el.parentElement;
	        if (parent && parent[matchesFn](selector)) {
	            return parent;
	        }
	        el = parent;
	    }
	    return null;
	}

	/**
	 * Typewriter Effect - Anandastoon 04-07-2019
	 *
	 * @param {el} DOM Element
	 * @param {text} The text
	 * @param {speed} Typewriting speed
	 */
	var typewriterEffect = (function (el, text, speed = 10) {
		var counter = -1; // Text counter
		return function (el, text, speed) {
			var text = text;
			var el = el;
			var interval = setInterval(function() {
				if (counter == -1) counter = 0;
				if (counter < text.length) {
					counter ++;
					el.innerHTML = text.substring(0, counter);
				} else {
					counter = -1;
					clearInterval(interval);
				}
			}, speed);
		}
	}());

	/**
	 * Sanitize - Anandastoon 10-04-2020
	 *
	 * @param {text} The text will be sanitized
	 */
	function sanitize(text) {
		if (typeof text == "string")
			text = text.replace(/(<script[^>]+>|<script>|<\/script>)/g, "");

		return text;
	}

	/**
	 * Validate Input - Anandastoon 04-07-2019
	 *
	 * @param {value} The value will be validated
	 * @param {type} What type of validation
	 */
	function validateInput(value, type) {
		switch (type) {
			case "alpha":
				if (value > 1) value = 1;
				if (value < 0) value = 0;
				if (isNaN(value)) value = 0.8;
				break;
		}

		return value;
	}

	//////////////////////////////////////////////////
	// AST NOTIF THEMES (COLOR LIKE BOOTSTRAP ONES)
	//////////////////////////////////////////////////
	var THEMES = {
		"dark": {
			bgcolor: "#1b1e21",
			bgcolorsecondary: "#5f6163",
			color: "#f6f8f9",
			accentcolor: "#5f6163"
		},

		"success": {
			bgcolor: "#9DEFC3",
			color: "#2e8957",
			accentcolor: "#00AB6B"
		},

		"danger": {
			bgcolor: "#f8d7da",
			color: "#d93025",
			accentcolor: "#821c16"
		},

		"warning": {
			bgcolor: "#ffeeba",
			color: "#856404",
			accentcolor: "#fbc02d"
		},

		"primary": {
			bgcolor: "#b8daff",
			color: "#004085",
			accentcolor: "#99b2ce"
		},

		"info": {
			bgcolor: "#bee5eb",
			color: "#0c5460",
			accentcolor: "#02BAF2"
		},

		"default": {
			bgcolor: "#f2f3f5",
			color: "#383d41",
			accentcolor: "#c4c4c4"
		},

		DEFAULT: {
			bgcolor: "#f2f3f5",
			color: "#383d41",
			accentcolor: "#c5c5c5"
		}
	}

	//////////////////////////////////////////////////
	// AST NOTIF GLOBAL VARIABLE
	//////////////////////////////////////////////////

	var currentTheme = "default";
	var currentZIndex = 10000;

	//////////////////////////////////////////////////
	// AST NOTIF LIBRARY STATE
	//////////////////////////////////////////////////

	// Dialog State
	var dialogState = {

		// Title dialog
		title: "Oh hai.",

		// Message dialog
		message: "Ini ganti dong. :)",

		// Options
		options: {
			// Background and text color
			bgheadcolor: THEMES.DEFAULT.bgcolor,
			bgbodycolor: "white",
			bgfootcolor: "white",
			color: THEMES.DEFAULT.color,
			// Has icons?
			icon: true,
			// Custom icon image
			imgIcon: getCurrentPath().split('/').slice(0, -1).join('/') +'/' + "../img/error_hitam_garis.png",
			// Icon size
			iconSize: "48px",
			// OK button text
			positive: "OK",
			// Cancel button text
			negative: "Cancel",
			// Individual Theming
			theme: currentTheme,
			// Closing by clicking backdrop
			dismissible: true,
			// Font awesome class without "fa-"
			fa: ""
		},

		// Callback positive function
		callbackPositive: function () {
		},

		// Callback positive function
		callbackNegative: function () {
		},

		// Close the dialog
		close: function() {
			var astDialogElement = this.inited();
			if (!!astDialogElement) {
				astDialogElement.parentNode.removeChild(astDialogElement);
				var bodyElement = document.getElementsByTagName("body")[0];
				AddRemoveClass(bodyElement, "ast-dialog", false);
			}
		},

		// The dialog element
		dialogElement: function() {
			var astDialogElement = document.getElementById("ast-dialog-bg");
			return astDialogElement;
		},

		inited: function() {
			var astDialogElement = this.dialogElement();
			if (typeof astDialogElement !== "undefined" && astDialogElement != null)
				return astDialogElement;
			else
				return false;
		},

		// Create the backdrop
		initBackdrop: function () {
			var dialogBox = document.createElement("div");
			dialogBox.setAttribute("id", "ast-dialog-bg");

			return dialogBox;
		},

		// Create the dialog element
		initDialog: function() {
			var dialogBox = document.createElement("div");
			dialogBox.setAttribute("id", "ast-dialog-el");
			dialogBox.style.zIndex = currentZIndex;

			return dialogBox;
		},

		// Create the head dialog element
		initDialogHead: function() {
			var dialogBox = document.createElement("div");
			dialogBox.style.background = THEMES[this.options.theme].bgcolor;
			dialogBox.style.color = THEMES[this.options.theme].color;
			dialogBox.innerHTML = "<h3>"+this.title+"</h3>";
			dialogBox.setAttribute("id", "ast-dialog-header");

			return dialogBox;
		},

		// Create the body dialog element
		initDialogBody: function() {
			var dialogBox = document.createElement("div");
			dialogBox.style.color = THEMES[this.options.theme].color;
			dialogBox.style.backgroundColor = this.options.theme === "dark" ? THEMES['dark'].bgcolorsecondary : this.options.bgbodycolor;
			if (!isNaN(this.options.iconSize)) this.options.iconSize = this.options.iconSize + "px";
			if (this.options.fa != "")
				dialogBox.innerHTML = "<div id='ast-dialog-icon' style='font-size:"+this.options.iconSize+";'><i class='fa fa-"+this.options.fa+"'></i></div>";
			else if (this.options.icon)
				dialogBox.innerHTML = "<div id='ast-dialog-icon'><img style='max-width:"+this.options.iconSize+"; max-height:"+this.options.iconSize+";' src='"+this.options.imgIcon+"'></div>";
			dialogBox.innerHTML += "<p id='ast-dialog-message'>"+this.message+"</p>";
			dialogBox.setAttribute("id", "ast-dialog-body");

			return dialogBox;
		},

		// Create the body dialog element
		initDialogFooter: function() {
			var dialogBox = document.createElement("div");
			dialogBox.style.backgroundColor = this.options.theme === "dark" ? THEMES['dark'].bgcolor : this.options.bgfootcolor;
			if (this.options.negative != "")
				dialogBox.innerHTML = "<button id='ast-negative-dialog-button'>"+this.options.negative+"</button>";
			if (this.options.positive === "") this.options.positive = "OK";
			dialogBox.innerHTML += "<button id='ast-positive-dialog-button'>"+this.options.positive+"</button>";
			dialogBox.setAttribute("id", "ast-dialog-footer");

			return dialogBox;
		},

		// Show dialog
		show: function() {
			// Call all dialog element
			if (!!this.inited()) return;
			var $astNotifThis = this; // Passing this to another inner function

			var bgElement = this.initBackdrop();
			var dialogElement = this.initDialog();
			dialogElement.style.color = this.options.color;

			dialogElement.appendChild(this.initDialogHead());

			var bodyElement = this.initDialogBody();
			dialogElement.appendChild(bodyElement);

			var footerElement = this.initDialogFooter();
			this.options.color = THEMES[this.options.theme].color;

			footerElement.querySelector("#ast-positive-dialog-button").style.borderColor = this.options.color;
			footerElement.querySelector("#ast-positive-dialog-button").style.backgroundColor = this.options.theme === "dark" ? THEMES['dark'].bgcolor : this.options.color;
			footerElement.querySelector("#ast-positive-dialog-button").style.color = "white";
			if (footerElement.querySelector("#ast-negative-dialog-button") != null) {
				footerElement.querySelector("#ast-negative-dialog-button").style.borderColor = this.options.theme === "dark" ? THEMES['dark'].bgcolorsecondary : this.options.color;
				footerElement.querySelector("#ast-negative-dialog-button").style.backgroundColor = "transparent";
				footerElement.querySelector("#ast-negative-dialog-button").style.color = this.options.color;
			}

			// Dark special case
			footerElement.style.borderTopColor = this.options.theme === "dark" ? "transparent" : "#CCC";

			dialogElement.appendChild(footerElement);


			if (!this.options.icon)
				dialogElement.querySelector("#ast-dialog-message").style.marginTop = "30px";

			bgElement.appendChild(dialogElement);

			// Append all
			var bodyElement = document.getElementsByTagName("body")[0];
			bodyElement.appendChild(bgElement);
			AddRemoveClass(bodyElement, "ast-dialog");

			// Add animation
			window.getComputedStyle(bgElement).opacity;
			AddRemoveClass(bgElement, "show");
			window.getComputedStyle(dialogElement).opacity;
			AddRemoveClass(dialogElement, "show");

			// Append listener to the button and backdrop
			bgElement.addEventListener('click', function(e) {
				if (e.target && e.target.id == 'ast-dialog-bg' && $astNotifThis.options.dismissible)
					$astNotifThis.close();

			    if (e.target && e.target.id == 'ast-positive-dialog-button') {
					$astNotifThis.callbackPositive();
					$astNotifThis.close();
			    }

			    if (e.target && e.target.id == 'ast-negative-dialog-button') {
					$astNotifThis.callbackNegative();
					$astNotifThis.close();
			    }
			    return false;
			});
		}
	};

	// Poster State
	var posterState = {

		// Title dialog
		title: "Oh hai.",

		// Message dialog
		message: "Ini ganti dong. :)",

		// Options
		options: {
			// Background and text color
			bgheadcolor: THEMES.DEFAULT.accentcolor,
			bgbodycolor: "white",
			color: THEMES.DEFAULT.color,
			// Has icons?
			icon: true,
			// Custom icon image
			imgIcon: getCurrentPath().split('/').slice(0, -1).join('/') +'/' + "../img/error_putih_garis.png",
			// Icon size
			iconSize: "64px",
			// OK button text
			positive: "OK",
			// Cancel button text
			negative: "Cancel",
			// Default theming
			theme: currentTheme,
			// Closing by clicking backdrop
			dismissible: true,
			// Font awesome class without "fa-"
			fa: ""
		},

		// Callback positive function
		callbackPositive: function () {
		},

		// Callback positive function
		callbackNegative: function () {
		},

		// Close the poster
		close: function() {
			var astPosterElement = this.inited();
			if (!!astPosterElement) {
				astPosterElement.parentNode.removeChild(astPosterElement);
				var bodyElement = document.getElementsByTagName("body")[0];
				AddRemoveClass(bodyElement, "ast-poster", false);
			}
		},

		// The poster element
		posterElement: function() {
			var astPosterElement = document.getElementById("ast-poster-bg");
			return astPosterElement;
		},

		inited: function() {
			var astPosterElement = this.posterElement();
			if (typeof astPosterElement !== "undefined" && astPosterElement != null)
				return astPosterElement;
			else
				return false;
		},

		// Create the backdrop
		initBackdrop: function () {
			var posterBox = document.createElement("div");
			posterBox.setAttribute("id", "ast-poster-bg");

			return posterBox;
		},

		// Create the poster element
		initPoster: function() {
			var posterBox = document.createElement("div");
			posterBox.setAttribute("id", "ast-poster-el");
			posterBox.style.zIndex = currentZIndex;

			return posterBox;
		},

		// Create the head poster element
		initPosterHead: function() {
			var posterBox = document.createElement("div");
			posterBox.style.background = this.options.theme.toLowerCase() == "default" ? this.options.bgheadcolor : THEMES[this.options.theme].accentcolor;
			posterBox.style.color = "white";
			if (!isNaN(this.options.iconSize)) this.options.iconSize = this.options.iconSize + "px";
			if (this.options.fa != "")
				posterBox.innerHTML = "<div id='ast-poster-icon' style='font-size:"+this.options.iconSize+";'><i class='fa fa-"+this.options.fa+"'></i></div>";
			else if (this.options.icon)
				posterBox.innerHTML = "<div id='ast-poster-icon'><img style='max-width:"+this.options.iconSize+"; max-height:"+this.options.iconSize+";' src='"+this.options.imgIcon+"'></div>";
			posterBox.setAttribute("id", "ast-poster-header");

			return posterBox;
		},

		// Create the body poster element
		initPosterBody: function() {
			var posterBox = document.createElement("div");
			this.options.bgbodycolor = currentTheme === "dark" ? THEMES['dark'].bgcolorsecondary : "white";
			posterBox.style.backgroundColor = this.options.bgbodycolor;
			posterBox.innerHTML += "<div id='ast-poster-message'>"+this.message+"</div>";
			posterBox.setAttribute("id", "ast-poster-body");
			if (this.options.positive === "") this.options.positive = "OK";
				posterBox.innerHTML += "<button id='ast-positive-poster-button'>"+this.options.positive+"</button>";
			if (this.options.negative != "")
				posterBox.innerHTML += "<button id='ast-negative-poster-button'>"+this.options.negative+"</button>";

			return posterBox;
		},

		// Show poster
		show: function() {
			// Call all poster element
			if (!!this.inited()) return;
			var $astNotifThis = this; // Passing this to another inner function

			var bgElement = this.initBackdrop();
			var posterElement = this.initPoster();
			posterElement.style.color = this.options.color;

			posterElement.appendChild(this.initPosterHead());

			var bodyElement = this.initPosterBody();
			bodyElement.querySelector("#ast-positive-poster-button").style.borderColor = THEMES[this.options.theme].color;
			bodyElement.querySelector("#ast-positive-poster-button").style.backgroundColor = this.options.theme === "dark" ? THEMES['dark'].bgcolor : THEMES[this.options.theme].color;
			bodyElement.querySelector("#ast-positive-poster-button").style.color = "white";
			if (bodyElement.querySelector("#ast-negative-poster-button") != null) {
				bodyElement.querySelector("#ast-negative-poster-button").style.borderColor = this.options.theme === "dark" ? THEMES['dark'].bgcolorsecondary : THEMES[this.options.theme].color;
				bodyElement.querySelector("#ast-negative-poster-button").style.backgroundColor = "transparent";
				bodyElement.querySelector("#ast-negative-poster-button").style.color = this.options.color;
			}
			posterElement.appendChild(bodyElement);

			if (!this.options.icon)
				posterElement.querySelector("#ast-poster-message").style.marginTop = "30px";

			bgElement.appendChild(posterElement);

			// Append all1
			var bodyElement = document.getElementsByTagName("body")[0];
			bodyElement.appendChild(bgElement);
			AddRemoveClass(bodyElement, "ast-poster");

			// Add animation
			window.getComputedStyle(bgElement).opacity;
			AddRemoveClass(bgElement, "show");
			window.getComputedStyle(posterElement).opacity;
			AddRemoveClass(posterElement, "show");

			// Append listener to the button & backdrop
			bgElement.addEventListener('click', function(e) {
			    if (e.target && e.target.id == 'ast-poster-bg' && $astNotifThis.options.dismissible) {
					$astNotifThis.close();
			    }

			    if (e.target && e.target.id == 'ast-positive-poster-button') {
					$astNotifThis.callbackPositive();
					$astNotifThis.close();
			    }

			    if (e.target && e.target.id == 'ast-negative-poster-button') {
					$astNotifThis.callbackNegative();
					$astNotifThis.close();
			    }

			    return false;
			});
		}
	};

	// Toast State
	var toastState = {

		// Constants for time length
		toastLength: {
			SHORT: 1000,
			LONG: 4000
		},

		// Variable for timeout id
		timeInstance: 0,
		timeoutInstance: 0,

		// Options
		options: {			
			// Time length, or whatever its called until the toast is gone.
			length: 2000,
			// Background and text color
			bgcolor: THEMES.DEFAULT.color,
			color: THEMES.DEFAULT.bgcolor,
			// Reverse color
			reverseColor: false,
			// Transparency
			alpha: 1,
			// Border radius
			borderRadius: 10,
			// Bottom position, minus for top position
			vdist: 10,
			// Left position
			hdist: 10,
			// Padding
			margin: 10,
			// Default theming
			theme: currentTheme,
			// Position (cardinal point)
			position: "s"
		},

		// The text on the toast
		text: "Tulisan kelean dimari",

		// Create the toast element
		initToast: function() {
			var toastEl = document.createElement("div");
			toastEl.innerHTML = "<p id='ast-toast-text'>"+this.text+"</p>";
			toastEl.setAttribute("id", "ast-toast-el");
			toastEl.style.zIndex = currentZIndex;

			return toastEl;
		},

		inited: function() {
			var astToastElement = document.getElementById("ast-toast-el");
			if (typeof astToastElement !== "undefined" && astToastElement != null)
				return astToastElement;
			else
				return false;
		},

		// Show toast to the universe! :D *alay
		show: function () {
			var bodyElement = document.getElementsByTagName("body")[0];
			var toastElement = this.inited();
			var $thisHandle = this;
			
			if (!!toastElement === false) {
				toastElement = this.initToast();
				toastElement.style.cssText = null;

				if (toastState.options.theme.toLowerCase() != "default") {
					toastElement.style.backgroundColor = this.options.reverseColor ? THEMES[toastState.options.theme].color : THEMES[toastState.options.theme].bgcolor;
					toastElement.style.color = this.options.reverseColor ? THEMES[toastState.options.theme].bgcolor : THEMES[toastState.options.theme].color;
				} else {
					toastElement.style.backgroundColor = this.options.reverseColor ? this.options.color : this.options.bgcolor;
					toastElement.style.color = this.options.reverseColor ? this.options.bgcolor : this.options.color;
				}

				toastElement.style.borderRadius = isNaN(this.options.borderRadius) ? this.options.borderRadius : this.options.borderRadius + "px";

				this.options.margin = parseFloat(this.options.margin);
				this.options.vdist = parseFloat(this.options.vdist);
				this.options.hdist = parseFloat(this.options.hdist);

				//Lowercase the position
				this.options.position = this.options.position.toLowerCase();

				toastElement.style.visibility = "hidden";

				bodyElement.appendChild(toastElement);

				toastElement.style.visibility = "";
				toastElement.style.top = (window.innerHeight / 2 - toastElement.clientHeight / 2) + "px";
				toastElement.style.left = 0;
				toastElement.style.right = 0;
				switch (this.options.position) {
					case "n":
						toastElement.style.top = (this.options.margin + this.options.vdist) + "px";
						toastElement.style.bottom = null;
						break;
					case "s":
						toastElement.style.bottom = (this.options.margin + this.options.vdist) + "px";
						toastElement.style.top = null;
						break;
					case "w":
						toastElement.style.left = (this.options.margin + this.options.hdist) + "px";
						toastElement.style.right = null;
						break;
					case "e":
						toastElement.style.right = (this.options.margin + this.options.hdist) + "px";
						toastElement.style.left = null;
						break;
					case "ne":
						toastElement.style.top = (this.options.margin + this.options.vdist) + "px";
						toastElement.style.bottom = null;
						toastElement.style.right = (this.options.margin + this.options.hdist) + "px";
						toastElement.style.left = null;
						break;
					case "se":
						toastElement.style.bottom = (this.options.margin + this.options.vdist) + "px";
						toastElement.style.top = null;
						toastElement.style.right = (this.options.margin + this.options.hdist) + "px";
						toastElement.style.left = null;
						break;
					case "sw":
						toastElement.style.bottom = (this.options.margin + this.options.vdist) + "px";
						toastElement.style.top = null;
						toastElement.style.left = (this.options.margin + this.options.hdist) + "px";
						toastElement.style.right = null;
						break;
					case "nw":
						toastElement.style.top = (this.options.margin + this.options.vdist) + "px";
						toastElement.style.bottom = null;
						toastElement.style.left = (this.options.margin + this.options.hdist) + "px";
						toastElement.style.right = null;
						break;
					default:
						break;
				}

				toastElement.style.visibility = "";
			} else {
				if (HasClass(toastElement, "close-toast")) {
					toastElement.parentNode.removeChild(toastElement);
					clearTimeout(this.timeInstance);
					clearTimeout(this.timeoutInstance);
					this.show();
				}
				toastElement.querySelector("#ast-toast-text").innerHTML = this.text;
			}

			// Add animation
			window.getComputedStyle(toastElement).opacity;
			toastElement.style.opacity = validateInput(this.options.alpha, "alpha");
			toastElement.style.backgroundColor = window.getComputedStyle(toastElement).backgroundColor.replace(')', ', '+validateInput(this.options.alpha, "alpha")+')').replace('rgb', 'rgba');
			AddRemoveClass(toastElement, "show-toast");

			// Timeout
			if (!!this.inited()) clearTimeout(this.timeInstance);
			this.timeInstance = setTimeout(function () {
				$thisHandle.timeout(toastElement);
			}, this.options.length);
		},

		// Finish display time
		timeout: function (toastElement) {
			if (toastElement.parentNode == null)
				toastElement = document.getElementById("ast-toast-el");
			AddRemoveClass(toastElement, "show-toast", false);
			AddRemoveClass(toastElement, "close-toast");
			toastElement.style.opacity = 0;
			this.timeoutInstance = setTimeout(function () {
				if (!!toastElement) {
					toastElement.parentNode.removeChild(toastElement);
				}
			}, 2000);
		}
	};

	// Snackbar State
	var snBarState = {
		// Constants for time length
		snackLength: {
			SHORT: 1000,
			LONG: 4000
		},

		// Variable for timeout id
		timeInstance: 0,

		// Action
		action: function () {
		},

		// Options
		options: {
			// Snack position, either top or bottom.
			position: "bottom",
			// Time length, or whatever its called until the snack is gone.
			length: 2000,
			// Background and text color
			bgcolor: THEMES.DEFAULT.color,
			color: THEMES.DEFAULT.bgcolor,
			// Button color
			btncolor: THEMES.DEFAULT.accentcolor,
			// Reverse color
			reverseColor: false,
			// Font awesome class without "fa-"
			fa: "",
			// Default theming
			theme: currentTheme,
			// Button action
			button: ""
		},

		// The text on the snackbar
		text: "Tulisan kelean dimari",

		// Create the snack element
		initSnack: function() {
			var snackEl = document.createElement("div");
			var faOpt = this.options.fa != "" ? "<i class='fa fa-"+this.options.fa+"'></i>" : "";
			var buttonOpt = this.options.button != "" ? "<span id='ast-snack-button'>"+this.options.button+"</span>" : "";
			snackEl.innerHTML = "<p id='ast-snack-text'>" + faOpt + " &nbsp; <span>"+this.text+"</span>"+buttonOpt+"</p>";
			snackEl.setAttribute("id", "ast-snack-el");
			snackEl.style.zIndex = currentZIndex;

			return snackEl;
		},

		inited: function() {
			var astSnackElement = document.getElementById("ast-snack-el");
			if (typeof astSnackElement !== "undefined" && astSnackElement != null)
				return astSnackElement;
			else
				return false;
		},

		// Show snack to the universe! :D *lebay
		show: function () {
			var bodyElement = document.getElementsByTagName("body")[0];
			var snackElement = this.inited();
			var buttonElement;
			
			if (!!snackElement === false) {
				snackElement = this.initSnack();
				if (this.options.position === "top")
					snackElement.style.top = "-100px";
				else
					snackElement.style.bottom = "-100px";

				if (this.options.theme.toLowerCase() != "default") {
					snackElement.style.backgroundColor = this.options.reverseColor ? THEMES[this.options.theme].bgcolor : THEMES[this.options.theme].color;
					snackElement.style.color = this.options.reverseColor ? THEMES[this.options.theme].color : THEMES[this.options.theme].bgcolor;
				} else {
					snackElement.style.backgroundColor = this.options.reverseColor ? this.options.color : this.options.bgcolor;
					snackElement.style.color = this.options.reverseColor ? this.options.bgcolor : this.options.color;
				}

				bodyElement.appendChild(snackElement);
			} else {
				snackElement.querySelector("#ast-snack-text span").innerHTML = this.text;
			}
			
			var buttonElement = snackElement.querySelector("#ast-snack-button");
			if (buttonElement != null) buttonElement.style.color = this.options.theme.toLowerCase() == "default" ? this.options.btncolor : THEMES[this.options.theme].accentcolor;

			// Add animation
			if (this.options.position === "top")
				window.getComputedStyle(snackElement).top;
			else
				window.getComputedStyle(snackElement).bottom;

			AddRemoveClass(snackElement, "show-" + this.options.position);
			if (this.options.button != "") {
				snackElement.addEventListener('click', function(e) {
					if (e.target && e.target.id == "ast-snack-button") {
						$thisHandle.action();
					}
				});
			}

			// Timeout
			if (!!this.inited()) clearTimeout(this.timeInstance);
			var $thisHandle = this;
			this.timeInstance = setTimeout(function () {
				$thisHandle.timeout(snackElement);
			}, this.options.length);
		},

		// Finish display time
		timeout: function (snackElement) {
			AddRemoveClass(snackElement, "show", false);
			AddRemoveClass(snackElement, "close");
			setTimeout(function () {
				snackElement.parentNode.removeChild(snackElement);
			}, 200);
		}
	};

	// Notify State
	var notifyState = {

		// if true, notify element is closed when clicked
		hasCallback: false,

		// Title message
		title: "Oh hai.",

		// Message message
		message: "Ini ganti dong. :)",

		// Footer message
		footer: "Eh ada kakinya jugakk! :O",

		// Constants for time length
		notifyLength: {
			SHORT: 1000,
			LONG: 4000
		},

		// Variable for timeout id
		timeInstance: 0,

		// Options
		options: {
			// Background and text color
			bgcolor: THEMES.DEFAULT.color,
			color: THEMES.DEFAULT.bgcolor,
			// Using icon?
			icon: true,
			// Custom icon image
			imgIcon: getCurrentPath().split('/').slice(0, -1).join('/') +'/' + "../img/error_putih_garis.png",
			// Font awesome, please strip the "fa-" from the argument
			fa: "",
			// Length the notify object, -1 for stay forever
			length: 2000,
			// Transparency
			alpha: 0.8,
			// Default theming
			theme: currentTheme,
			// Position
			position: "right"
		},

		callback: function () {
		},

		// Check if the elemen has been initialized
		inited: function() {
			var astNotifyElement = document.getElementById("ast-notify-container");
			if (typeof astNotifyElement !== "undefined" && astNotifyElement != null) {
				return astNotifyElement;
			}
			else
				return false;
		},

		// Create the notify element
		initNotify: function() {
			if (this.options.theme.toLowerCase() != "default") {
				this.options.bgcolor = THEMES[this.options.theme].bgcolor;
				this.options.color = THEMES[this.options.theme].color;
			} else {
				this.options.bgcolor = THEMES["dark"].bgcolor;
				this.options.color = THEMES["dark"].color;
			}

			var notifyBox = document.createElement("div");
			notifyBox.setAttribute("class", "ast-notify-wrapper");
			var notifyElement = document.createElement("div");
			notifyElement.setAttribute("class", "ast-notify-el");
			notifyElement.style.backgroundColor = this.options.bgcolor;
			notifyElement.style.color = this.options.color;
			notifyElement.style.zIndex = currentZIndex;
			notifyBox.appendChild(notifyElement);

			if (this.options.fa != "")
				notifyElement.innerHTML = "<div class='ast-notify-icon'><i class='fa fa-"+this.options.fa+"'></i></div>";
			else if (this.options.icon)
				notifyElement.innerHTML = "<div class='ast-notify-icon'><img src='"+this.options.imgIcon+"'></div>";
			notifyElement.innerHTML += "<div class='ast-notify-text'><p class='notify-header' id='ast-notify-title'>"+this.title+"</h3><p id='ast-notify-message' class='notify-body'>"+this.message+"</p><p id='ast-notify-message' class='notify-footer'>"+this.footer+"</p></div>";
			notifyElement.innerHTML += "<div class='ast-notify-clearfloat'></div>";
			if (this.options.length == -1)
				notifyElement.innerHTML += "<div class='ast-notify-close'>&times;</div>";

			return notifyBox;
		},

		// Show dialog
		show: function() {
			var notifyContainer = this.inited();

			// Create notify element
			var notifyElement = this.initNotify();

			// Get notify element child
			var notifyElementChild;

			// Append all
			if (!!notifyContainer === false) {
				notifyContainer = document.createElement("div");
				notifyContainer.setAttribute("id", "ast-notify-container");
				var bodyElement = document.getElementsByTagName("body")[0];
				bodyElement.appendChild(notifyContainer);
			}
			
			notifyContainer.appendChild(notifyElement);
			notifyElementChild = notifyElement.querySelector(".ast-notify-el");

			// Computing height for the wrapper element from its absolute child
			setTimeout(function () {
				var notifyHeight = window.getComputedStyle(notifyElementChild).height;
				notifyElement.style.height = notifyHeight;
			}, 10);

			// Set Transparency
			notifyElementChild.style.backgroundColor = window.getComputedStyle(notifyElementChild).backgroundColor.replace(')', ', '+this.options.alpha+')').replace('rgb', 'rgba');

			// Add animation
			this.options.position = this.options.position.toLowerCase();
			var notifyInstance = notifyElement.querySelector(".ast-notify-el");
			notifyInstance.style[this.options.position] = "-350px";
			notifyContainer.style.left = null;
			notifyContainer.style.right = null;
			AddRemoveClass(notifyInstance, "show");
			if (this.options.position == "right") {
				notifyContainer.style.right = "0px";
				window.getComputedStyle(notifyInstance).right;
				notifyInstance.style.right = "10px";
			} else {
				notifyContainer.style.left = "0px";
				window.getComputedStyle(notifyInstance).left;
				notifyInstance.style.left = "10px";
			}

			// Add event to the close button
			var $thisHandle = this;
			notifyElement.addEventListener('click', function(e) {
				if (e.target) {
					var parentElement = closest(e.target, ".ast-notify-el");
					if (e.target.getAttribute("class") != "ast-notify-close" && $thisHandle.options.length > -1) {
						if ($thisHandle.hasCallback) {
							$thisHandle.callback();
						}
						$thisHandle.timeout(parentElement, true);
					}

				    if (e.target.getAttribute("class") == 'ast-notify-close') {
						$thisHandle.timeout(parentElement, true);
				    }
				}
			});

			// Timeout
			if (this.options.length > 0)
				this.timeInstance = setTimeout(function () {
					$thisHandle.timeout(notifyElement.querySelector(".ast-notify-el"));
				}, this.options.length);
		},

		timeout: function (notifyElement, clicked = false) {
			AddRemoveClass(notifyElement, clicked && this.options.length == -1 ? "close-click" : "close");
			notifyElement.style[this.options.position] = "-350px";
			setTimeout(function () {
				notifyElement.parentNode.parentNode.removeChild(notifyElement.parentNode);
			}, 200);
		}
	};

	//////////////////////////////////////////////////
	// AST DIALOG
	//////////////////////////////////////////////////
	function dialog(title = "", message = "", options = {}, callbackPositive, callbackNegative) {
		if (callbackPositive && {}.toString.call(callbackPositive) === '[object Function]')
			dialogState.callbackPositive = callbackPositive;
		if (callbackNegative && {}.toString.call(callbackNegative) === '[object Function]')
			dialogState.callbackNegative = callbackNegative;
		dialogState.title = sanitize(String(title));
		dialogState.message = sanitize(String(message));
		dialogState.options.theme = currentTheme;

		for (var option in options) {
			if (dialogState.options.hasOwnProperty(option))
				dialogState.options[option] = sanitize(options[option]);
		}

		dialogState.show();

		return dialogState;
	}

	//////////////////////////////////////////////////
	// AST POSTER
	//////////////////////////////////////////////////
	function poster(message = "", options = {}, callbackPositive, callbackNegative) {
		if (callbackPositive && {}.toString.call(callbackPositive) === '[object Function]')
			posterState.callbackPositive = callbackPositive;
		if (callbackNegative && {}.toString.call(callbackNegative) === '[object Function]')
			posterState.callbackNegative = callbackNegative;
		posterState.message = sanitize(String(message));
		posterState.options.theme = currentTheme;

		for (var option in options) {
			if (posterState.options.hasOwnProperty(option)) {
				posterState.options[option] = sanitize(options[option]);
			}
		}
		posterState.show();

		return posterState;
	}

	//////////////////////////////////////////////////
	// AST TOAST
	//////////////////////////////////////////////////
	function toast(text = "", options = {}) {
		toastState.text = sanitize(String(text));
		toastState.options.theme = currentTheme;
		for (var option in options) {
			toastState.options[option] = sanitize(options[option]);
			if (toastState.options.hasOwnProperty(option)) {
				if (option === "length") {
					if (typeof options[option] === "string") {
						options[option] = options[option].toLowerCase();
						if (options[option] == "long")
							toastState.options[option] = toastState.toastLength.LONG;
						else if (options[option] == "short")
							toastState.options[option] = toastState.toastLength.SHORT;
						else
							toastState.options[option] = 1000;
					} else
						toastState.options[option] = options[option];
				}
				else {
					toastState.options[option] = options[option];
				}
			}
		}
		toastState.show();

		return toastState;
	}

	//////////////////////////////////////////////////
	// AST SNACKBAR
	//////////////////////////////////////////////////
	function snackbar(text = "", options = {}, action) {
		snBarState.text = sanitize(String(text));
		snBarState.options.theme = currentTheme;
		for (var option in options) {
			if (snBarState.options.hasOwnProperty(option)) {
				if (option === "length") {
					if (typeof options[option] === "string") {
						options[option] = options[option].toLowerCase();
						if (options[option] == "long")
							snBarState.options[option] = snBarState.snackLength.LONG;
						else if (options[option] == "short")
							snBarState.options[option] = snBarState.snackLength.SHORT;
						else
							snBarState.options[option] = 1000;
					} else
						snBarState.options[option] = options[option];
				} else
					snBarState.options[option] = options[option];
			}
		}
		if (action && {}.toString.call(action) === '[object Function]') {
			snBarState.action = action;
		}

		snBarState.show();

		return snBarState;
	}

	//////////////////////////////////////////////////
	// AST NOTIF
	//////////////////////////////////////////////////
	function notify(title = "", message = "", footer = "", options = {}, callback) {
		notifyState.title = sanitize(String(title));
		notifyState.message = sanitize(String(message));
		notifyState.footer = sanitize(String(footer));
		notifyState.options.theme = currentTheme;
		for (var option in options) {
			if (notifyState.options.hasOwnProperty(option)) {
				if (option === "length") {
					if (typeof options[option] === "string") {
						options[option] = options[option].toLowerCase();
						if (options[option] == "long")
							notifyState.options[option] = notifyState.notifyLength.LONG;
						else if (options[option] == "short")
							notifyState.options[option] = notifyState.notifyLength.SHORT;
						else
							notifyState.options[option] = 1000;
					} else
						notifyState.options[option] = options[option];
				} else
					notifyState.options[option] = sanitize(options[option]);
			}
		}
		if (callback && {}.toString.call(callback) === '[object Function]') {
			notifyState.callback = callback;
			notifyState.hasCallback = true;
		}

		notifyState.show();

		return notifyState;
	}

	//////////////////////////////////////////////////
	// AST Notif API
	//////////////////////////////////////////////////
	AstNotif = {
		dialog: dialog,
		
		poster: poster,

		toast: toast,

		snackbar: snackbar,

		notify: notify,

		theme: {
			set: function (theTheme) {
				if (theTheme != "" && typeof THEMES[theTheme] != undefined)
					currentTheme = theTheme;
			},
			get: function () {return currentTheme;}
		},

		zIndex: {
			set: function (z) {
				z = parseInt(z);
				if (!isNaN(z))
					currentZIndex = z;
			},
			get: function () {return currentZIndex;}
		},

		VERSION: VERSION
	};

	return (window.AstNotif = window.astn = AstNotif);
}));