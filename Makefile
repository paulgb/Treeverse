
watch :
	tsc -w -p src/viewer &  VPID=$! ;\
	tsc -w -p src/button &  BPID=$! ;\
	wait $(VPID) ;\
	wait $(BPID)

extension/script/lib/d3.v4.min.js :
	mkdir -p `dirname $@`
	curl https://d3js.org/d3.v4.min.js -o $@

deps : extension/script/lib/d3.v4.min.js
