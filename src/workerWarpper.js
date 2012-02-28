/* iFeed : Feed parser 
 * Copyright (C)
 * 				 2011 iwege - http://iwege.com
 * licensed under the MIT (MIT-license.txt)
 */
(function(exports){
	var list = []
		, workers = []
		, status = []
		, max = 10 
		;
	function initWorker(){
		for (var i=0; i < max; i++) {
			workers.push(new Worker('../src/iFeed.js'));
			status.push(0);
		}
	}
	
	var iFeed = function (xml, callback){
		list.push(xml);
		findWorker(callback);
	}
	var findWorker = function(callback){
		var index = status.indexOf(0);
	
		if (index != -1) {
			status[index] = 1;
			workers[index].onmessage = function(evt){
				callback && callback(evt.data);
				if (list.length) {
					status[index] = 1;
					workers[index].postMessage(list.pop());
				}
				status[index] = 0;
			}
			workers[index].postMessage(list.pop());
		}
	};
	initWorker();
	exports.iFeed = iFeed;
})( window );



