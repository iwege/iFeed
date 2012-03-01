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
			;
			
		feed.title = {
			text : data.title
		} 
		feed.links = [];
		feed.links.push( data['rss:link']['#'] );
		feed.subtitle = data['rss:description']['#'];
		
		feed.publishedDate = feed.lastUpdatedTime = data['pubDate'] || new Date();
		feed.items = [];
		Array.prototype.forEach.call(items , function(item){
			feed.items.push( formatItem( item ) );
		});
		
		callback( feed );
		
		return feed;

	}

	var formatItem = function(item){
			var   post = exports.item()
				, name = '';
	
			post.title.text = post.title.nodeValue = item.title;		
			
			post.links.push({
				text : item.link,
			});
		
			post.authors.push( {
				nodeName:'author',
				name: item.author,
				uri:{
					absoluteUri:''
				}
			});

			post.content.text = item.description;
			post.content.image = exports.getImages(post.content.text);
			
			post.publishedDate = post.lastUpdatedTime = item['rss:pubDate'];
			post.id = item.guid;
			
			// TODO get non-style content ;
		
			
			return post;
	}
})(iFeed);

