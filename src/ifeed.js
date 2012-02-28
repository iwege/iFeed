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
		if (!position) { position = 0;}
		var node = iFeed.query( xml, nodeName )[ position ];
		return  node ? node.textContent : false;
		
	}
	
	// get image url from content ;
	iFeed.getImage = function(content){
		var tmp = null,matches = [],count = 0
			, regx = /<img.+?src=["'](.+?)["'].+?>/ig;
		while ((tmp = regx.exec(content)) != null)
		{
		  	// XXX: Why it doesn't change the regx start position without 
		  	// call regx.lastIndex ? Chrome 19.
		  	regx.lastIndex;
		
			// clear feed image;
		  	if (tmp[1].search('feedsportal.com') == -1) {
				matches.push(tmp[1]);
		  	}
		  
		}
		
		return matches;
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
		// check type;
		if (query(xml, 'channel').length == 1) type = 'rss';
		if (query(xml, 'feed').length == 1)   type = 'atom';

		parser  = iFeed.parser[ type ];
		// parse to feed 
		return parser( xml );
	}

})( window );



