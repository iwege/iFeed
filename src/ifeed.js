
(function(w){
	var isWorker = w.document ? 0 : 1;
	if (isWorker) {
		importScripts('config.js');
		importScripts.apply(parserSripts);
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
	iFeed.getImage = function(content){
		var tmp = null,matches = [],count = 0
			, regx = /<img.+?src=["'](.+?)["'].+?>/ig;
		while ((tmp = regx.exec(content)) != null)
		{
		  	// XXX: Why it doesn't change the regx start position without 
		  	// call regx.lastIndex ? Chrome 19.
		  	regx.lastIndex;

			// clear feed image;
		  	if (tmp[1].search('feedsportal.com') == -1) {
				matches.push(tmp[1]);
		  	}

		}

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

try{ importSripts('irss.js','item.js','iatom.js')}catch(e){}

