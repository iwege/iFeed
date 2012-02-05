/* iFeed : Feed parser 
 * Copyright (C) 2007 Jean-François Hovinne - http://www.hovinne.com/
 * 				 2011 iwege - http://iwege.com
 * Dual licensed under the MIT (MIT-license.txt)
 * and GPL (GPL-license.txt) licenses.
 */
(function(exports){
	var   type
		, query
		;
		
	var iFeed = function (xml){
		type = "error";
		return parse(xml);
	}
	// get content from xml node 
	iFeed.getContent = function(xml, nodeName, position){
		!position && position = 0;
		var node = iFeed.query( xml, nodeName )[ position ];
		return  node ? node.textContent : false;
		
	}
	
	// get image url from content ;
	iFeed.getImage = function(content){
        var matches = /<img.+src=["'](.+?)["']/i.exec(content);

		return (matches && matches.length > 1) ? matches[1]: '';
	}
	
	// parser settings
	iFeed.parser = {
		/**
		 * if type is not atom or rss,
		 * it will return the origin xml content to user;
		 **/
		"error":function(xml){
			return xml;
		}
	}
	
	// get sub-node 
	query = iFeed.query = function( xml, nodeName){
		if (!xml) return ' ';
		return xml.querySelectorAll( nodeName );
	}
	
	exports.iFeed = iFeed;
	//set parse fucntion 
	function parse(xml) {
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



