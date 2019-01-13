SHELL := /bin/bash

NAME := saffron
ORG	:= studioaquatan

# Calyx container image
API_SRC_DIR := ./calyx
DEV_API_CONTAINER := $(NAME)-api-dev
API_IMAGE := $(ORG)/$(NAME)-calyx
API_IMAGE_VERSION := dev
ARGS := "-h"

# Petals container image
FRONT_SRC_DIR := ./petals
FRONT_IMAGE := $(ORG)/$(NAME)-petals
FRONT_IMAGE_VERSION := dev
SRCS := $(shell find $(FRONT_SRC_DIR)/src -type f \( -name '*.css' -o -name '*.ts' -o -name '*.html' -o -name '*.js' \) -print)
PUBLIC_SRCS := $(shell find $(FRONT_SRC_DIR)/public -type f \( -name '*.json' -o -name '*.ico' -o -name '*.html' -o -name '*.js' \) -print)

# Bulb container image
DEV_DB_CONTAINER := $(NAME)-db-dev-local
DB_DIR := $(PWD)/bulb
DB_DATA_DIR := $(DB_DIR)/data
DB_IMAGE := $(ORG)/mysql-utf8mb4
DB_IMAGE_VERSION := latest

# DB settings
DB_USER := develop
DB_PASSWORD := password
DB_ROOT_PASSWORD := root
DB_NAME := dev_db
DB_PORT := 33060

$(FRONT_SRC_DIR)/build/index.html: $(SRCS) $(PUBLIC_SRCS)
	cd $(FRONT_SRC_DIR) && yarn build

build: $(FRONT_SRC_DIR)/build/index.html

node_modules:
	cd $(FRONT_SRC_DIR) && yarn install

venv:
	cd $(API_SRC_DIR)/src && PIPENV_VENV_IN_PROJECT=true pipenv install

calyx-image:
	docker build $(API_SRC_DIR) -t $(API_IMAGE):$(API_IMAGE_VERSION)

petals-image:
	docker build $(FRONT_SRC_DIR) -t $(FRONT_IMAGE):$(FRONT_IMAGE_VERSION)

image: calyx-image petals-image

pull:
	docker pull $(DB_IMAGE):$(DB_IMAGE_VERSION)
	docker pull $(API_IMAGE):$(API_IMAGE_VERSION)
	docker pull $(FRONT_IMAGE):$(FRONT_IMAGE_VERSION)

deps: venv pull

db:
	$(eval RUNNING := $(shell docker ps -q -f name=$(DEV_DB_CONTAINER)))
	$(eval STOPPING := $(shell docker ps -aq -f name=$(DEV_DB_CONTAINER)))
	@echo "Run MySQL server named '$(DEV_DB_CONTAINER)' using docker"
	@echo "Username: $(DB_USER)"
	@echo "Password: $(DB_PASSWORD)"
	@echo "Database: $(DB_NAME)"
	@echo "Port: $(DB_PORT)"
	@if test -n "$(RUNNING)" || test -n "$(STOPPING)"; then \
		docker start $(DEV_DB_CONTAINER) > /dev/null;\
	else \
		docker run -d --name $(DEV_DB_CONTAINER) \
			-e MYSQL_ROOT_PASSWORD=$(DB_ROOT_PASSWORD) \
			-e MYSQL_USER=$(DB_USER) \
			-e MYSQL_PASSWORD=$(DB_PASSWORD) \
			-e MYSQL_DATABASE=$(DB_NAME) \
			-p $(DB_PORT):3306 \
			-v $(DB_DATA_DIR):/var/lib/mysql \
			$(DB_IMAGE):$(DB_IMAGE_VERSION) > /dev/null; \
	fi
	@echo "You can connect this DB on '127.0.0.1:$(DB_PORT)'"

guard-env-%:
	@if [ ! -n "${*}" ]; then \
		echo "Please specify environment, 'dev' or 'qa' or 'prod'."; \
		exit 1; \
	elif [ "${*}" != "dev" ] && [ "${*}" != "prod" ] && [ "${*}" != "qa" ]; then \
		echo "Environment is only accepted 'dev' or 'qa' or 'prod'."; \
		exit 1; \
	fi

build-%: guard-env-%
	@docker-compose -f docker-compose.${*}.yml build

start-%: guard-env-%
	@docker-compose -f docker-compose.${*}.yml up -d

stop-%: guard-env-%
	@docker-compose -f docker-compose.${*}.yml stop

clean-%: guard-env-% stop-%
	@docker-compose -f docker-compose.${*}.yml rm

migrate-%: guard-env-%
	@docker-compose -f docker-compose.${*}.yml exec calyx python manage.py migrate

manage-%: guard-env-%
	@docker-compose -f docker-compose.${*}.yml exec calyx python manage.py $(args)

restart-%: guard-env-%
	@docker-compose -f docker-compose.${*}.yml restart

prune:
	@docker image prune

$(API_SRC_DIR)/src/.env.%: guard-env-%
	cp $(API_SRC_DIR)/.env.sample $(API_SRC_DIR)/.env.${*}

$(DB_DIR)/.env.%: guard-env-%
	cp $(DB_DIR)/.env.sample $(DB_DIR)/.env.${*}

env-%: guard-env-%
	@make $(API_SRC_DIR)/src/.env.${*}
	@make $(DB_DIR)/.env.${*}

env:
	@make env-dev
	@make env-qa
	@make env-prod

.PHONY: venv image pull db deps dev dev-clean dev-stop guard-env-% start-% stop-% clean-% manage-% migrate-% prune env-% env ;