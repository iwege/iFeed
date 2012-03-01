
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
		tmp && tmp[0] && matches.push(tmp[1]);
		return matches;
	}
	
	iFeed.format = {
		/**
		 * if type is not atom or rss,
		 * it will return the origin xml content to user;
		 **/
		"error":function(xml){
			return xml;
		}
	}
	//set parse fucntion 
	function format(xml, callback) {
		var   parser
			, fp = new FeedParser()
			;

		fp.parseString(xml,function(error,data,items){
			type = ['rss','atom'].indexOf(data['#type']) != -1 ?
					   data['#type']
					 : 'error';

			iFeed.format[type]( data, items, callback );
		});
	}
	w.iFeed = iFeed;

})(self || window);


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

