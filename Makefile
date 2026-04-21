PORT ?= 8080

.PHONY: help dev screenshot-themes

help: ## Show frontend targets
	@grep -E '^[a-zA-Z_-]+:.*##' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*##"}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

dev: ## Serve the static frontend locally
	@echo "Serving frontend preview on http://localhost:$(PORT)"
	python3 -m http.server $(PORT)

screenshot-themes: ## Capture screenshot.png for each theme folder (headless browser PNG)
	bash scripts/capture-theme-screenshots.sh $(PORT)