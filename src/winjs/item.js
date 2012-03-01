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


