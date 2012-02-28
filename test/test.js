
var feedsUrls = ['http://news.163.com/special/00011K6L/rss_newstop.xml',
                  'http://cnbeta.feedsportal.com/c/34306/f/624776/index.rss',
                  'http://www.engadget.com/rss.xml',
                  'http://www.zhihu.com/rss',
                 'xml/atom.xml'
				];

jQuery().ajaxError(function(request, settings, ex) {
    console.log('Request error');
    for(var i in ex) {
        console.log(i + ': ' + ex[i]);
    }
});

// TODO need a Qunit test;
$(function() {	
   feedsUrls.forEach(function(url,i){
		jQuery.ajax({
				url: feedsUrls[i], 
				dataType:'TEXT',
				success: function(xml){
						iFeed(xml,function(){
							console.log(arguments);
						});
				}});
		});
});
