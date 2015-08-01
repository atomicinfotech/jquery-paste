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
					$('body').on('paste',this.process);	
			
				},
				process: function (e) {
					var $target = $(e.target);
				
					if( !$target.is('input') && !$target.is('textarea') && !$target.attr('contenteditable') ) {
						var pasted = e.originalEvent.clipboardData.getData('Text');
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
