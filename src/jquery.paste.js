// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

	"use strict";
	
		var pluginName = "paste",
			defaults = {
				status: "Paste",
				processing: "<i class='fa fa-cog fa-spin'></i>",
				processingclass: "",
				
			};

		function Plugin ( element, options) {
				this.element = element;
				
				this.settings = $.extend( {}, defaults, options, $(this.element).data());
				this._defaults = defaults;
				this._name = pluginName;
				this.init();
		}

		$.extend(Plugin.prototype, {
				init: function () {
					
					this.$element = $(this.element);
					
					this.reset();
					
					this.$element.bind( "paste.failed", $.proxy(this.failed, this));
					$('body').on('paste',$.proxy(this.process, this));	
			
				},
				process: function (e) {
					var result = {};
					var $target = $(e.target);
				
					if( !$target.is('input') && !$target.is('textarea') && !$target.attr('contenteditable') ) {
						result.pasted = e.originalEvent.clipboardData.getData('Text');
						
						//lets see if it is a url
						if (result.pasted.indexOf('http') === 0) {
							result.isURL = true;
							
							var a = document.createElement('a'); a.href=result.pasted;
							
							result.protocol = a.protocol;
							result.hostname = a.hostname;
							if(result.port) result.port = a.port;
							result.pathname = a.pathname;
							result.search = a.search;
							result.hash = a.hash;
							result.host = a.host; 
							
							result.params = this.urlparams(a.search.substr(1).split('&'));
							result.meta = this.parse(result);
							
						}
						
						if(typeof this.settings.callback == "function") this.settings.callback(result);
					}

				},
				reset: function() {
					this.$element.removeClass('failed').children('.paste-status').html(this.settings.status);
				},
				failed: function(e) {
					self = this;
					this.$element.addClass('failed').children('.paste-status').html("Sorry");
					
					window.setTimeout(function(){
						self.reset();
					},2000);
				},
				urlparams: function(a) {
					if (a == "") return {};
					var b = {};
					for (var i = 0; i < a.length; ++i)
					{
							var p=a[i].split('=', 2);
							if (p.length == 1)
									b[p[0]] = "";
							else
									b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
					}
					return b;
				},
				parse: function(result) {
					var meta = {};
					switch(result.hostname) {
						case "www.amazon.com":
							meta = {
								type: 'product',
								source: 'amazon',
								id: result.pathname.match("/([a-zA-Z0-9]{10})(?:[/?]|$)")[1]
							}
						break;
						case "youtu.be":
							meta = {
								type: 'video',
								source: 'youtube',
								id: result.pathname.substring(1)
							};
						break;
						case "youtube.com":
						case "www.youtube.com":
							meta = {
								type: 'video',
								source: 'youtube',
								id: result.params.v
							};
						break;
						case "vimeo.com":
							var tmp = result.pathname.split("/");
							meta = {
								type: 'video',
								source: 'vimeo',
								id: tmp[tmp.length - 1]
							};
						break;
					}
					
					return meta;
				}

		});

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function ( options ) {
				return this.each(function() {
						if ( !$.data( this, "plugin_" + pluginName ) ) {
								$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
						}
				});
		};

})( jQuery, window, document );
