SRC_DIR = src
BUILD_DIR = build

JS_FILES = ${SRC_DIR}/ifeed.js\
 ${SRC_DIR}/item.js\
 ${SRC_DIR}/iatom.js\
 ${SRC_DIR}/irss.js
FeedParser_FILES = ${SRC_DIR}/utils.js\
 ${SRC_DIR}/sax.js\
 ${SRC_DIR}/feedparser.js


all: init feedparser worker ifeed

init: 
	@@ rm -f ${BUILD_DIR}/ifeed.js ${BUILD_DIR}/feedparser.js ${BUILD_DIR}/workerWrapper.js

feedparser: ${FeedParser_FILES}
	@@ cat ${FeedParser_FILES} > ${BUILD_DIR}/feedparser.js

worker:
	@@ cat ${SRC_DIR}/workerWrapper.js |\
		sed 's|src\/iFeed.js|${BUILD_DIR}\/ifeed.js|' > ${BUILD_DIR}/workerWrapper.js

ifeed: ${JS_FILES} 
	@@ cat ${JS_FILES} |\
	 	sed '/config.js/d' |\
		sed '/irss.js/d' |\
	    sed 's/parserSripts/\[\"feedparser.js\"\]/'> ${BUILD_DIR}/ifeed.js