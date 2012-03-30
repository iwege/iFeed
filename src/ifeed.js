
(function(w){
	var isWorker = w.document ? 0 : 1;
	if (isWorker) {
		importScripts('utils.js','sax.js','feedparser.js');
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

try{ importScripts('google/irss.js','google/item.js','google/iatom.js','google/irdf.js')}catch(e){}

