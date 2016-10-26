
watch :
	tsc -w -p src/viewer &  VPID=$! ;\
	tsc -w -p src/button &  BPID=$! ;\
	wait $(VPID) ;\
	wait $(BPID)
