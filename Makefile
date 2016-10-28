
watch :
	tsc -w -p src/viewer &  VPID=$! ;\
	tsc -w -p src/button &  BPID=$! ;\
	wait $(VPID) ;\
	wait $(BPID)

viewer :
	tsc -p src/viewer

button :
	tsc -p src/button

extension/script/lib :
	mkdir -p $@

extension/script/lib/d3.v4.min.js :
	curl https://d3js.org/d3.v4.min.js -o $@

extension/script/lib/d3-hierarchy.v1.min.js :
	curl https://d3js.org/d3-hierarchy.v1.min.js -o $@

deps : extension/script/lib/d3.v4.min.js extension/script/lib/d3-hierarchy.v1.min.js

extension : deps viewer button

