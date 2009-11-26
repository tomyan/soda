# © Thomas Yandell 2009

JSDOC = contrib/jsdoc-toolkit
YUICOMP=contrib/yuicompressor-2.4.2.jar

compress: src/soda.js
	java -jar $(YUICOMP) --charset UTF8 -o src/soda.comp.js --type js -v src/soda.js

#docs: src/testjs.js
#	java -Djsdoc.dir=$(JSDOC) -jar $(JSDOC)/app/js.jar $(JSDOC)/app/run.js -c=$(PWD)/etc/jsdoc.conf
