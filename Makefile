# @simpill monolith – run from repo root
# Utils are installed from GitHub (see package.json dependencies). No local utils/ folder required.
# Sandbox: github:simpill/simpill-sandbox. Each util package: its own GitHub repo.

SHELL := /bin/bash
REPO_ROOT := $(shell cd "$(dirname "$0")" && pwd)

.PHONY: help verify deps

help:
	@echo "Available make targets (run from repo root):"
	@echo ""
	@echo "  make deps   - Verify all @simpill dependencies from GitHub are resolvable (npm run verify:deps)"
	@echo "  make verify - Same as deps"
	@echo ""
	@echo "  Install: npm install (pulls all @simpill/* and image-ai CLI from GitHub into node_modules)"
	@echo "  Sandbox: github:simpill/simpill-sandbox"
	@echo "  Utils: each package has its own repo (see README Repositories table)"

deps:
	@npm run verify:deps

verify: deps
