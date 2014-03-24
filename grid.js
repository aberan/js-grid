var nxnw = nxnw || {};

define(function(require){
	var jQuery = require('jquery');
	require('throttle-debounce');

	function Grid($el, cb) {
		this.$el = $el;
		this.cb = cb;
	}

	Grid.prototype = (function() {
		var sizeRow = function(arr, h, cb) {
			if ( arr.length ) { //set row height
				$.each(arr, function() {
					$(this).height(h);
					if ( typeof cb !== 'undefined' && typeof cb === 'function') {
						cb(this);
					}
				});
			}
		};

		return {
			flatten: function(resize) {
				var that = this;

				this.$el.each(function() {
					var $this = $(this),
						$items = $this.children(),
						$first = $this.find(':first'),
						this_rect = $this[0].getBoundingClientRect(),
						first_rect = $first[0].getBoundingClientRect(),
						container_width = typeof this_rect.width !== 'undefined' ? this_rect.width : this_rect.right - this_rect.left,
						bounding_client = typeof first_rect.width !== 'undefined' ? first_rect.width : first_rect.right - first_rect.left,
						computed_style = "getComputedStyle" in window ? parseFloat( getComputedStyle($first[0]).width ) : bounding_client,
						inner_width = $first.width(),
						row_items,
						row = 0,
						curr_row = row,
						row_height = null,
						items = [];

						if (bounding_client === computed_style ) {
							container_width = typeof this_rect.width === 'undefined' ? ++container_width : container_width; //add 1 for IE8 rounding issue
							row_items = Math.floor( container_width / bounding_client );
						}
						else { //  IE 9
							row_items = Math.floor( container_width / (bounding_client - inner_width + computed_style) );
						}

						//strip existing css
						$items.css('height', '');
						$items.each(function(i) {
							var $this = $(this),
							curr_height = $this.height();

							curr_row += +( !(i % row_items) );
							if ( curr_row !== row ) { //new row
								sizeRow(items, row_height, that.cb);
								//reset array
								items.length = 0;
								items[0] = $this;
								row = curr_row;
								row_height = curr_height;
							}
							else { //existing row
								items.push($this);
								row_height = curr_height > row_height ? curr_height : row_height;
							}

						});
						//handle orphan items
						sizeRow(items, row_height, that.cb);
				});

				if ( typeof resize === 'undefined' ) {
					var onResize = function() {
						$(window).one("resize", $.debounce( 250, $.proxy(function() {
							this.flatten(true);
							onResize();
						}, that)));
					};

					setTimeout(function() {
						onResize();
					}, 50);
				}
			}
		};
	})();

	nxnw.Grid = Grid;
	return nxnw.Grid;

});