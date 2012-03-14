
var feedsUrls = [// 'http://news.163.com/special/00011K6L/rss_newstop.xml',
//                   'http://cnbeta.feedsportal.com/c/34306/f/624776/index.rss',
                 //'http://www.engadget.com/rss.xml',
				  //'http://www.w3.org/News/news.rss',
                  'http://www.bbc.co.uk/news/business-17359394'
				];


jQuery().ajaxError(function(request, settings, ex) {
    console.log('Request error');
    for(var i in ex) {
        console.log(i + ': ' + ex[i]);
    }
});

var time = 0;
var loop = 1;
var count = loop*feedsUrls.length;
var j = 0;
// TODO need a Qunit test;
$(function() {	
   feedsUrls.forEach(function(url,i){
		$.ajax({
				url: feedsUrls[i], 
				dataType:'TEXT', // Need TEXT format.
				success: function(xml){
					var _startTime = [];
					for (var i=0; i < loop; i++) {
						(function(i){
							_startTime.push(new Date().getTime());
						
							iFeed(xml,function(feed){
								console.log(feed);
								count -= 1;
								j ++;
								if (count == 0) {
									time += new Date().getTime() - _startTime[0];
									console.log(feed);
									console.log(time);
								}else{
									console.log(url,'run');
								}
								
							});	
						})(i);
						    
					};
					
				}});
		});
});
