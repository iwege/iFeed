
(function(w){
	var isWorker = w.document ? 0 : 1;
	if (isWorker) {
		importScripts('feedparser.js');
		w.onmessage = function(msg){
			iFeed(msg.data,function(feed){
				w.postMessage(feed);
			});
		}
	}
	
	var iFeed = function (xml, callback){
		type = "error";
		return format(xml, callback);
	}
	
	// get image url from content ;
	iFeed.getImages = function(content){
		var tmp = null,matches = [],count = 0
			// many gif image is ad image or used for track user.
			, regx = /<img.+?src=["'](.+?\.(png|jpg|jpeg))["'].+?>/ig;
	
		// get all Images from content
		// while ((tmp = regx.exec(content)) != null)
		// 		{
		// 		  	// XXX: Why it doesn't change the regx start position without 
		// 		  	// call regx.lastIndex ? Chrome 19.
		// 		  	regx.lastIndex;
		// 
		// 			// clear feed image;
		// 		  	if (tmp[1].search('feedsportal.com') == -1) {
		// 				matches.push(tmp[1]);
		// 		  	}
		// 
		// 		}
		tmp = regx.exec(content);
		if (tmp&& tmp[0]) {
			if (tmp[1].indexOf('//') === 0) {
				tmp[1] = 'http:'+tmp[1];
			};
			matches.push(tmp[1]);
		}
		return matches;
	}
	iFeed.trimHTML = function(str){
		return str.replace(/<\/?[^>]*>/g,'');
	}
	iFeed.format = {
		/**
		 * if type is not atom or rss,
		 * it will return the origin xml content to user;
		 **/
		"error":function(data, items, callback ){
			callback("error");
		}
	}
	//set parse fucntion 
	function format(xml, callback) {
		var   parser
			, fp = new FeedParser()
			;

		fp.parseString(xml,function(error,data,items){
			type = ['rss','atom','rdf'].indexOf(data['#type']) != -1 ?
					   data['#type']:'error';
			iFeed.format[type]( data, items, callback );
		});
	}
	
	w.iFeed = iFeed;

})(self || window);


// This format is made for Google Feed API
(function(exports){
	exports.item = function(){
		return {
	   	 	  mediaGroup:''
			, title:''
			, link:''
			, content:''
			, images:[]
			, contentSnippet:''
			, publishedDate:0
			, categories:[]
		};
	}
})(iFeed);


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
		feed.feedUrl = data['xmlurl'];
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
			post.images = exports.getImages(post.content);
			post.categories = item.categories;
			post.publishedDate = new Date(item['pubDate']);
			post.id = item.guid;
			
			// TODO get non-style content ;
			
			return post;
	}
})(iFeed);

/* iRDF : rdf formater
 * Copyright (C) 
 * 				 2011 iwege - http://iwege.com
 * Dual licensed under the MIT (MIT-license.txt)
 */
(function(exports){

	exports.format['rdf'] = function(data,items ,callback){
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
			post.images = exports.getImages(post.content);
			post.categories = item.categories;
			post.publishedDate = new Date(item['pubDate']['#']);
			post.id = item.guid;
			
			// TODO get non-style content ;
			
			return post;
	}
})(iFeed);

