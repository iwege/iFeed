# iFeed - RSS, Atom feed parsing in browser with webworker. 

## Thanks 

* [sax.js](https://github.com/isaacs/sax-js)
* [node-feedparser.js](https://github.com/danmactough/node-feedparser)

The `feedparser.js` has contain all of them, 
I remove the `parseUrl`, `parseFile` from  feedparser for native browser env;

## Usage

~~~ javascript
iFeed(xml_string, function callback(feed){
	//do something with feed/
});
~~~

Notice: the input type MUST BE string !! 
So if you use ajax with jquery, you need to set the `dataType` to `TEXT`.

AND if you don't want to use the feed content format which I used ,you can overwrite the format function in your script.
But notice if you want to use it in webworker. you need use `importScripts` to add your script in the end of `ifeed.js` like:

~~~ javascript
if(isWorker){ importScript('yourscript1.js','yourscript2.js')}
~~~

### No WebWorker
if you want use it without webworker, you need to put `feedparser.js` and `ifeed.js` in document.

~~~ html
<script src="feedparser.js"></script>
<script src="ifeed.js"></script>
~~~

### WebWorker
1. Use `workerWrapper.js` to load iFeed:

~~~ html
<script src="workerWrapper.js" ></script>
~~~

2. start worker with `startWorker` function,set the iFeed.js' path and the number how many workers you want to use, the default number  is 10;

~~~ javascript
startWorker(/*iFeed.js' src[,max worker you want] */);
~~~

Before you use, you need to configure the `ifeed.js` path with `src` in `workerWrapper.js`,
Then you can change the max worker you want to use with `max` in `workerWrapper.js`.
The Number of webworker isn't the more the better, if you set too big , the browser will be crashed.

## License

Copyright (C) 2011      iwege - http://iwege.com

Licensed under the MIT (MIT-license.txt) .


