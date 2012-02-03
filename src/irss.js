/* iRss : rss format parser 
 * Copyright (C) 2007 Jean-François Hovinne - http://www.hovinne.com/
 * 				 2011 iwege - http://iwege.com
 * Dual licensed under the MIT (MIT-license.txt)
 * and GPL (GPL-license.txt) licenses.
 */
(function(exports){
	var   query = exports.query
		, getContent = exports.getContent
		, feed = {};

	exports.parser['rss'] = function(xml){
		feed = {};
		parse(xml);
		return feed;
	};

		
	var parse  = function( xml ) {
		var   ch
			, _feeds
			, _items
			, _url 		
			;

		if( query(xml, 'rss').length == 0) feed.version = '1.0';
		else feed.version = query(xml, 'rss')[0].version;
	
		ch = query(xml, 'channel')[0];

		feed.title = {
			text : getContent(ch, 'title')
		} 
	
		_parseRssLink( ch );
	
		feed.subtitle = getContent(ch, 'description');
	
		feed.publishedDate = feed.lastUpdatedTime = query(ch, 'lastBuildDate').length > 0 ? 
					new Date( getContent(ch, 'lastBuildDate')):
					new Date( getContent(query(ch, 'item')[0], "pubDate"));


		feed.items = [];
		_items =  query(xml,'item');
		_parseItem(_items);

	}

	var _parseRssLink =  function(obj){
		var  url
			, link = {};
		feed.links = [];
	
		url = getContent(obj, 'link');
		if (! url) url = query(obj,'link')[0].href;
	
		link.uri = {
			  absoluteUri : url
			, displayUri : url
		};

		feed.links.push(url);
	};

	var _parseItem = function(items){
		var _that = this ;
	
		Array.prototype.forEach.call(items , function(item){
			var   post = new iFeedItem()
				, name = '';

			post.title = {};
			post.title.text = post.title.nodeValue = getContent(item,'title');
			post.links = [];
			var _link = query(item, 'link')[0];
			
			if (_link) {
				_link = _link.href; 
			} else {
				_link = '';
			}
			post.links.push({
				text : _link,
			});
			post.authors = [];
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

			post.content = {};
			post.content.text = getContent(item, 'description');
		
			var publishedDate  = getContent(item, 'pubDate') ? new Date(getContent(item, 'pubDate')) : '';
			post.publishedDate = post.lastUpdatedTime = publishedDate;
			post.id = getContent(item, 'guid');

			feed.items.push(post);
		
		});

	}
})(iFeed);

