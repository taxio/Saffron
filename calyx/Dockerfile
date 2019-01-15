FROM python:3.7.0-alpine3.8

ENV PROJECT_DIR /opt/calyx

RUN apk update && \
    apk add --no-cache \
        mariadb-dev \
        pcre-dev && \
    rm -rf /var/cache/apk/*

COPY ./src/Pipfile ${PROJECT_DIR}/
COPY ./src/Pipfile.lock ${PROJECT_DIR}/

WORKDIR ${PROJECT_DIR}

RUN apk update && \
    apk add --no-cache --virtual=build_dep \
        gcc \
        build-base \
        linux-headers \
        tzdata && \
    pip3 install pipenv && \
    pipenv install --system && \
    cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && \
    apk del --purge build_dep && \
    rm -rf /var/cache/apk/*

COPY src/ ${PROJECT_DIR}

CMD ["uwsgi", "--ini", "uwsgi.ini"]