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



// This format is made for WinJS Feed API
(function(exports){
	exports.item = function(){
		return {
	   	 	title: {
				text:''
			}
		    , links: []
		    , authors: []
		    , content: {
				text:'',
				image:''
			}
			, publishedDate:''
			, lastUpdatedTime:''
		    , id: ''
		};
	}
})(iFeed);


/* iAtom : atom format parser 
 * Copyright (C) 2007 Jean-François Hovinne - http://www.hovinne.com/
 * 				 2011 iwege - http://iwege.com
 * Dual licensed under the MIT (MIT-license.txt)
 * and GPL (GPL-license.txt) licenses.
 */

(function(exports){
	var   feed = {}
		, query = exports.query
		, getContent = exports.getContent
		, getImage = exports.getImage;
		;
		
	exports.parser['atom'] = function (xml){
		return parse(xml);
	};
	
	var parse  = function( xml ) {
	   	var   ch
			, feed = {}
			, items
	

		ch = query(xml, 'feed')[0];

		feed.version = '1.0';

		feed.title = {
			text : getContent(ch, 'title')
		};

		feed.links = [];
		feed.links.push({
			uri : {
				  absoluteUri: query(ch, 'link')[0].href
				, displayUri : query(ch, 'link')[0].href
			}
		});
		feed.subtitle = getContent(ch, 'subtitle');
		feed.publishedDate = 
			feed.lastUpdatedTime =  getContent(ch, 'updated');

		feed.items = [];
 		
		items =  query(xml, 'entry');
		Array.prototype.forEach.call(items,function(obj){
			feed.items.push(parseItem(obj));
		});
		return feed;
	};
	
	var parseItem = function (obj){
		// parse post
	    var post = exports.item()
			, name 
			, uri 
			;
		// get title 
		post.title.text = post.title.nodeValue = getContent(obj, 'title');

		// get Links 
		post.links.push({
			text : query(obj, 'link')[0].href
		});
		
		// get authors
		name = query(obj, 'author')[0].name;
		uri = query(obj, 'author')[0].uri;
		
		post.authors.push({
			nodeName : 'author',
			name : name ,
			uri : {
					absoluteUri :  uri
			}
		});
		
		// get content 
	
		post.content.text = getContent(obj, 'content');
		post.content.image = getImage(post.content.text);
		
		// TODO get non-style content ;
		 
		post.publishedDate = 
		post.lastUpdatedTime = getContent(obj, 'updated');
		
		// get id 
	    post.id = getContent(obj, 'id');

		return post;
}
})(iFeed);

/* iRss : rss format parser 
 * Copyright (C) 2007 Jean-François Hovinne - http://www.hovinne.com/
 * 				 2011 iwege - http://iwege.com
 * Dual licensed under the MIT (MIT-license.txt)
 * and GPL (GPL-license.txt) licenses.
 */
(function(exports){
	var   query = exports.query
		, getContent = exports.getContent
		, getImage = exports.getImage
		;

	exports.parser['rss'] = function(xml){
		return parse(xml);
	};

		
	var parse  = function( xml ) {
		var   ch
			, feed = {}
			, items	
			;

		if( query(xml, 'rss').length == 0) feed.version = '1.0';
		else feed.version = query(xml, 'rss')[0].version;
	
		ch = query(xml, 'channel')[0];

		feed.title = {
			text : getContent(ch, 'title')
		} 
	
		feed.links = [];
		feed.links.push( parseRssLink( ch ) );
		
		feed.subtitle = getContent(ch, 'description');
	
		feed.publishedDate = feed.lastUpdatedTime = query(ch, 'lastBuildDate').length > 0 ? 
					new Date( getContent(ch, 'lastBuildDate')):
					new Date( getContent(query(ch, 'item')[0], "pubDate"));


		feed.items = [];
		
		items =  query(xml,'item');
		Array.prototype.forEach.call(items , function(item){
			feed.items.push( parseItem( item ) );
		});
		return feed;

	}

	var parseRssLink =  function(obj){
		var  url
			, link = {};

	
		url = getContent(obj, 'link');
		if (! url) url = query(obj,'link')[0].href;
	
		url = {
			  absoluteUri : url
			, displayUri : url
		};

		return url;
	};

	var parseItem = function(item){
			var   post = exports.item()
				, name = '';

			
			post.title.text = post.title.nodeValue = getContent(item,'title');
		
			var _link = query(item, 'link')[0];
			
			if (_link) {
				_link = _link.href; 
			} else {
				_link = '';
			}
			post.links.push({
				text : _link,
			});
		
			name = '';

			if (query(item,'author').length   > 0) {
				name = getContent(item, 'author')
			}

			if (query(item, 'creator').length   > 0) {
				name = getContent(item, 'creator');
			}

			post.authors.push( {
				nodeName:'author',
				name: name,
				uri:{
					absoluteUri:''
				}
			});

		
			post.content.text = getContent(item, 'description');
			post.content.image = getImage(post.content.text);
			// TODO get non-style content ;
			
			var publishedDate  = getContent(item, 'pubDate') ? new Date(getContent(item, 'pubDate')) : '';
			post.publishedDate = post.lastUpdatedTime = publishedDate;
			post.id = getContent(item, 'guid');
			return post;
	}
})(iFeed);

