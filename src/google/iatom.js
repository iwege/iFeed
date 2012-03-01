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
		feed.feedUrl = data['xmlUrl'];
		feed.title = data['title']
		feed.link = data['link'];
		feed.description = data['description'];
		feed.author = data['author'];
		feed.entries = [];
 		Array.prototype.forEach.call(items,function(obj){
			feed.entries.push(formatItem(obj));
		});
		callback && callback(feed);
		return feed;
	};
	
	var formatItem = function (obj){
	    var post = exports.item()
			, name 
			, uri 
			;
		post.title = obj.title;
		post.link = obj.link;
		post.author =  obj.author;
		post.content = obj.description;
		post.images = exports.getImages(post.content);
		post.contentSnippet = exports.trimHTML(post.content);
		post.publishedDate = new Date(obj.pubDate);
	    post.id = obj.guid;

		return post;
}
})(iFeed);

