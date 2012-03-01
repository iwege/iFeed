/* iAtom : atom formater
 * Copyright (C) 
 * 				 2011 iwege - http://iwege.com
 * Dual licensed under the MIT (MIT-license.txt)
 * and GPL (GPL-license.txt) licenses.
 */

(function(exports){	
	exports.format['atom'] = function(data, items ,callback){
		return format(data, items, callback );
	}
	
	var format  = function( data, items, callback ) {
	   	var   feed = {};
		feed.version = '1.0';
		feed.title = {
			text : data['title']
		};
		feed.links = [];
		feed.links.push({
			uri : {
				  absoluteUri: data['link']
				, displayUri : data['link']
			}
		});
		feed.subtitle = data['atom:subtitle']['#'];
		feed.publishedDate = 
			feed.lastUpdatedTime =  data['pubDate'];

		feed.items = [];
 		Array.prototype.forEach.call(items,function(obj){
			feed.items.push(formatItem(obj));
		});
		callback && callback(feed);
		return feed;
	};
	
	var formatItem = function (obj){
		// parse post
	    var post = exports.item()
			, name 
			, uri 
			;
		// get title 
		post.title.text = post.title.nodeValue = obj.title;

		// get Links 
		post.links.push({
			text : obj.link
		});
		
		// get authors
		
		post.authors.push({
			nodeName : 'author',
			name : obj.author ,
			uri : {
				absoluteUri :  ''
			}
		});
		
		// get content 
	
		post.content.text = obj.description;
		post.content.image = exports.getImages(post.content.text);
		
		// TODO get non-style content ;
		 
		post.publishedDate = 
		post.lastUpdatedTime = obj.pubDate;
		
		// get id 
	    post.id = obj.guid;

		return post;
}
})(iFeed);

