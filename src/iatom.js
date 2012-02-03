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
		;
		
	exports.parser['atom'] = function (xml){
		feed = {};
		parse(xml);
		return feed;
	};
	
	var parse  = function( xml ) {
	   	var   _ch
			, _feed
			, _temp
	

		_ch = query(xml, 'feed')[0];

		feed.version = '1.0';

		feed.title = {
			text : getContent(_ch, 'title')
		};

		feed.links = [];
		feed.links.push({
			uri : {
				  absoluteUri: query(_ch, 'link')[0].href
				, displayUri : query(_ch, 'link')[0].href
			}
		});
		feed.subtitle = getContent(_ch, 'subtitle');
		feed.publishedDate = 
			feed.lastUpdatedTime =  getContent(_ch, 'updated');

		feed.items = [];
 		
		_temp =  query(xml, 'entry');
		Array.prototype.forEach.call(_temp,function(obj){
			parseItem(obj);
		});
	};
	var parseItem = function (obj){
		// parse posts

	    var _item = new iFeedItem();
		// get title 
		_item.title = {};
		_item.title.text = _item.title.nodeValue = getContent(obj, 'title');

		// get Links 
		_item.links = [];
		_item.links.push({
			text : query(obj, 'link')[0].href,
		});
		
		// get authors
		var name = query(obj, 'author')[0].name;
		var uri = query(obj, 'author')[0].uri;
		_item.authors = [];
		_item.authors.push({
			nodeName : 'author',
			name : name ,
			uri : {
					absoluteUri :  uri
			}
		});
		
		// get content 
		_item.content = {};
		_item.content.text = getContent(obj, 'content');
		_item.publishedDate = 
			_item.lastUpdatedTime = getContent(obj, 'updated');
		
		// get id 
	    _item.id = getContent(obj, 'id');

	  feed.items.push(_item);
}
})(iFeed);

