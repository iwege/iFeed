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

