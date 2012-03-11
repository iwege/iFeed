/**
 * iFeed Worker Wrapper : Simple Parse Worker Manager;
 *  
 * Copyright (C)  2011 iwege - http://iwege.com
 * 
 * licensed under the MIT (MIT-license.txt)
 */
(function(exports){
	var list = []
		, workers = []
		, status = []
		, max = 10 // set max worker number
		, src = '../build/ifeed.js'
		;
		
	// initialize worker and status;
	function initWorkers(){
		for (var i=0; i < max; i++) {
			workers.push(new Worker(src));
			status.push(0);
		}
	}
	

	var iFeed = function (xml, callback){
		// push the data to cache list;
		list.push(xml); 
		findWorker(callback);
	}
	
	var findWorker = function(callback){
		var index = status.indexOf(0);
		
		if (index == -1) return ; // all workers are in working now;
		
		// if we find a worker that doesn't do any work,
		// make it works;
		status[index] = 1; 
		workers[index].onmessage = function(evt){
			// if worker finished his job, run callback function;
			callback && callback(evt.data);
			
			// check the cache if it isn't empty, 
			// worker will pick the data and work again.
			// They are the best workers ! @.@
			if (list.length) {
				status[index] = 1;
				workers[index].postMessage(list.pop());
			}
			status[index] = 0;
		}
		
		// inform the worker to work ; 
		workers[index].postMessage(list.pop());
		
	};
	
	
	exports.iFeed = iFeed;
	exports.startWorker = function(fileSrc,number){
		if (fileSrc) src = fileSrc; 
		if (number) max = number;
		initWorkers();
	}
})( window );



