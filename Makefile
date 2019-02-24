SHELL := /bin/bash

NAME := saffron
ORG	:= studioaquatan

# Calyx container image
API_SRC_DIR := ./calyx
API_IMAGE := $(ORG)/$(NAME)-calyx
API_IMAGE_VERSION := dev
ARGS := "-h"

# Petals container image
FRONT_SRC_DIR := ./petals
FRONT_IMAGE := $(ORG)/$(NAME)-petals
FRONT_IMAGE_VERSION := dev

# Bulb container image
DB_DIR := ./bulb
DB_IMAGE := $(ORG)/mysql-utf8mb4
DB_IMAGE_VERSION := latest

$(FRONT_SRC_DIR)/build/index.html:
	cd $(FRONT_SRC_DIR) && yarn build

build: $(FRONT_SRC_DIR)/build/index.html

node_modules:
	cd $(FRONT_SRC_DIR) && yarn install

venv:
	cd $(API_SRC_DIR)/src && PIPENV_VENV_IN_PROJECT=true pipenv install --dev

calyx-image:
	docker build $(API_SRC_DIR) -t $(API_IMAGE):$(API_IMAGE_VERSION)

petals-image:
	docker build $(FRONT_SRC_DIR) -t $(FRONT_IMAGE):$(FRONT_IMAGE_VERSION)

image: calyx-image petals-image

pull:
	docker pull $(DB_IMAGE):$(DB_IMAGE_VERSION)
	docker pull $(API_IMAGE):$(API_IMAGE_VERSION)
	docker pull $(FRONT_IMAGE):$(FRONT_IMAGE_VERSION)

deps: venv pull node_modules

db:
	@docker-compose -f docker-compose.dev.yml up -d bulb

guard-env-%:
	@if [ ! -n "${*}" ]; then \
		echo "Please specify environment, 'dev' or 'qa' or 'prod'."; \
		exit 1; \
	elif [ "${*}" != "dev" ] && [ "${*}" != "prod" ] && [ "${*}" != "qa" ]; then \
		echo "Environment is only accepted 'dev' or 'qa' or 'prod'."; \
		exit 1; \
	fi

# Manage frontend application container and database container only for backend development.
build-client-%: guard-env-%
	@docker-compose -f docker-compose.${*}.yml build petals

start-client-%: guard-env-%
	@echo "Run frontend application container (Petals)"
	@echo "Run database container (Bulb)"
	@docker-compose -f docker-compose.${*}.yml up -d petals bulb

stop-client-%: stop-%

clean-client-%: clean-%

restart-client-%: guard-env-%
	@docker-compose -f docker-compose.${*}.yml restart petals bulb

# Shortcut for update backends
update-client-%: guard-env-% petals-image start-client-% prune
	@echo "Petals container is now up-to-date."

# To keep compatibility
migrate-client-%: migrate-%
manage-client-%: manage-%

# Manage backend application container and database container only for frontend development.
build-api-%: guard-env-%
	@docker-compose -f docker-compose.${*}.yml build calyx

start-api-%: guard-env-%
	@echo "Run backend application container (Calyx)"
	@echo "Run database container (Bulb)"
	@docker-compose -f docker-compose.${*}.yml up -d calyx bulb

stop-api-%: stop-%

clean-api-%: clean-%

restart-api-%: guard-env-%
	@docker-compose -f docker-compose.${*}.yml restart calyx bulb

# Shortcut for update backends
update-api-%: guard-env-% calyx-image start-api-% migrate-% prune
	@echo "Calyx container is now up-to-date."

# To keep compatibility
migrate-api-%: migrate-%
manage-api-%: manage-%

# General commands for development.
build-%: guard-env-%
	@docker-compose -f docker-compose.${*}.yml build

start-%: guard-env-%
	@docker-compose -f docker-compose.${*}.yml up -d

stop-%: guard-env-%
	@docker-compose -f docker-compose.${*}.yml stop

clean-%: guard-env-% stop-%
	@docker-compose -f docker-compose.${*}.yml rm

restart-%: guard-env-%
	@docker-compose -f docker-compose.${*}.yml restart

test-petals:
	cd $(FRONT_SRC_DIR) && yarn test

test-calyx:
	cd $(API_SRC_DIR)/src && pipenv run python manage.py test -v 2

test: test-petals test-calyx

lint:
	cd $(FRONT_SRC_DIR) && yarn tslint

# Run schema migration for backend api
migrate-%: guard-env-%
	@docker-compose -f docker-compose.${*}.yml exec calyx python manage.py migrate

# Run manage command of django
# ex) make manage-dev args=createsuperuser
manage-%: guard-env-%
	@docker-compose -f docker-compose.${*}.yml exec calyx python manage.py $(args)

# Clean docker images which has no tags.
prune:
	@docker image prune

$(API_SRC_DIR)/src/.env.%: guard-env-%
	cp $(API_SRC_DIR)/.env.sample $(API_SRC_DIR)/.env.${*}

$(DB_DIR)/.env.%: guard-env-%
	cp $(DB_DIR)/.env.sample $(DB_DIR)/.env.${*}

env-%: $(API_SRC_DIR)/src/.env.% $(DB_DIR)/.env.%

env: env-qa env-dev env-prod

.PHONY: venv image pull db deps dev dev-clean dev-stop guard-env-% start-% stop-% clean-% manage-% migrate-% prune env-% env update-% ;