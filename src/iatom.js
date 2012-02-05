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

