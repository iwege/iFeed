SRC_DIR = src
BUILD_DIR = build

JS_FILES = ${SRC_DIR}/ifeed.js\
 ${SRC_DIR}/item.js\
 ${SRC_DIR}/iatom.js\
 ${SRC_DIR}/irss.js


all: init ${JS_FILES}
	@@ cat ${JS_FILES} > ${BUILD_DIR}/ifeed.js

init: 
	@@ rm -rf ${BUILD_DIR}/ifeed.js