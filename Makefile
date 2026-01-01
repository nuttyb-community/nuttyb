%:
	@:

arg := $(word 2, $(MAKECMDGOALS))
PATH_ARG ?= base64url/tweakdefs8.base64url

.PHONY: lua

lua:
	@ts-node ./scripts/converter.ts b64tolua

b64-local:
	@ts-node ./scripts/converter.ts luatob64 $(arg)

b64:
ifeq ($(OS),Windows_NT)
	@base64-builder-docker-run.bat $(arg)
endif

clipboard-raw:
	@powershell -Command "Get-Content -Path '$(PATH_ARG)' | Set-Clipboard"
