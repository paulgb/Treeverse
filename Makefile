
watch :
	tsc -w -p viewer &  VPID=$! ;\
	tsc -w -p button &  BPID=$! ;\
	wait $(VPID) ;\
	wait $(BPID)
