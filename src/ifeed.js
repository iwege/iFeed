/* iFeed : Feed parser 
 * Copyright (C) 2007 Jean-François Hovinne - http://www.hovinne.com/
 * 				 2011 iwege - http://iwege.com
 * Dual licensed under the MIT (MIT-license.txt)
 * and GPL (GPL-license.txt) licenses.
 */
(function(exports){
	var type
		, query
		, parse
		, iFeed
		;
		
	iFeed = function(xml){
		type = "error";
		return parse(xml);
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
	}

	query = iFeed.query = function( xml, nodeName){
		if (!xml) return ' ';
		return xml.querySelectorAll( nodeName );
	}
	
	exports.iFeed = iFeed;

	parse = function(xml) {
		var parser ;

		if (query(xml, 'channel').length == 1) {
		    type = 'rss';
		}

		if (query(xml, 'feed').length == 1) {	
		    type = 'atom';
		}

		parser  = iFeed.parser[ type ];
		// parse to feed 
		return parser( xml );
	}

})( window );



