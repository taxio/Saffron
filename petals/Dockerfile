FROM node:11.1.0-alpine as develop

ENV PROJECT_DIR /opt/petals
WORKDIR ${PROJECT_DIR}

COPY tsconfig.json ${PROJECT_DIR}/
COPY tsconfig.prod.json ${PROJECT_DIR}/
COPY tsconfig.test.json ${PROJECT_DIR}/
COPY tslint.json ${PROJECT_DIR}/
COPY images.d.ts ${PROJECT_DIR}/
COPY package.json ${PROJECT_DIR}/
COPY yarn.lock ${PROJECT_DIR}/

RUN yarn install

COPY ./public ${PROJECT_DIR}/public
COPY ./src ${PROJECT_DIR}/src

CMD ["yarn", "start"]

# Build stage
FROM node:11.1.0-alpine as build

ENV PROJECT_DIR /opt/petals
WORKDIR ${PROJECT_DIR}

COPY --from=develop /opt/petals /opt/petals

RUN yarn build

# Production stage
# Serve files as static file by nginx.
FROM nginx:stable-alpine as production

COPY conf/petals.prod.conf /etc/nginx/conf.d/default.conf

COPY --from=build /opt/petals/build/ /usr/share/www/html/front
