/* iRss : rss formater
 * Copyright (C) 
 * 				 2011 iwege - http://iwege.com
 * Dual licensed under the MIT (MIT-license.txt)
 */
(function(exports){

	exports.format['rss'] = function(data,items ,callback){
		return format(data, items, callback );
	}
	
	var format  = function( data, items, callback ) {
		var   feed = {}
			, items	
			, time
			;
		feed.title = data.title
		feed.link = data['link']
		feed.description = data['description'];
		time = data['pubDate'] ? new Date(data['pubDate']):new Date();
		feed.author = data.author;
		feed.feedUrl = '';
		feed.entries = [];
		Array.prototype.forEach.call(items , function(item){
			feed.entries.push( formatItem( item ) );
		});
		callback( feed );
		return feed;

	}

	var formatItem = function(item){
			var   post = exports.item();
	
			post.title = item.title;		
			post.link =  item.link;
			post.author = item.author;
			post.content = item.description;
			post.contentSnippet = exports.trimHTML(post.content);
			post.image = exports.getImages(post.content);
			post.categories = item.categories;
			post.publishedDate = new Date(item['rss:pubDate']['#']);
			post.id = item.guid;
			
			// TODO get non-style content ;
			
			return post;
	}
})(iFeed);

