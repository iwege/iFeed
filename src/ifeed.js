/* iFeed : Feed parser 
 * Copyright (C) 2007 Jean-François Hovinne - http://www.hovinne.com/
 * 				 2011 iwege - http://iwege.com
 * Dual licensed under the MIT (MIT-license.txt)
 * and GPL (GPL-license.txt) licenses.
 */
(function(exports){
	
	var iFeed = {};
	
	exports.iFeed = iFeed;
	
	iFeed.get = function(xml){
		this.type = "error";

		return this._parse(xml);
	}

	iFeed.getContent = function(xml, nodeName, position){
		if (!position) { position = 0 };
		var node = iFeed.query( xml, nodeName )[ position ];
		if (node) {
			return  node.textContent;
		}
		return false;
	}

	iFeed.parser = {
		"error":function(xml){
			return xml;
		}
	};

	iFeed.query = function( xml, nodeName){
		if (!xml) return ' ';
		return xml.querySelectorAll( nodeName );
	}

	iFeed._parse = function(xml) {
		var parser ;

		if (this.query(xml, 'channel').length == 1) {
		    this.type = 'rss';
		}

		if (this.query(xml, 'feed').length == 1) {	
		    this.type = 'atom';
		}

		parser  = this.parser[ this.type ];
		// parse to feed 
		return parser( xml );
	}

})( window );



