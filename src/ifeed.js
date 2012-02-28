/* iFeed : Feed parser 
 * Copyright (C)
 * 				 2011 iwege - http://iwege.com
 * licensed under the MIT (MIT-license.txt)
 */
(function(exports){
	var iFeed = function (xml, callback){
		var worker = new Worker('../src/parseWorker.js');
		worker.onmessage = function(evt){
			callback && callback(evt.data);
		}
		worker.postMessage(xml);
	}
	exports.iFeed = iFeed;
})( window );



