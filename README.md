# Saffron

[![CircleCI](https://circleci.com/gh/StudioAquatan/Saffron.svg?style=svg)](https://circleci.com/gh/StudioAquatan/Saffron)

研究室配属支援サービス

2018年度中のリリースを予定

## Develop

タスクランナーとしてmakeを使用する．

予め

- pyenv
- pipenv
- yarn

を使用可能にしておくこと．

```bash
# .env.*をコピーして作成
$ make env
# .venvの作成，node_modulesの作成，イメージをPull
$ make deps
```

環境はdocker-composeで立ち上がる．3つの段階が存在する．

- `dev`
    - CalyxはDocker Imageを使用して起動．
    - Petalsは内部で`yarn start`を使い，ローカルのソースファイルをマウントしているため，ホットリロードが有効になっている．
    - APIは`:8000`，フロントは`:8080`でlistenする．
- `qa`
    - Calyx, Petals共にImageを使用して起動．
    - Petalsは`yarn build`した結果をコンテナ内にマウントしており，nginxにより静的ファイルとして配信される．
    - APIは`:8000`，フロントは`:8080`でlistenする．
- `prod`
    - `jwilder/docker-gen`と`JrCs/docker-letsencrypt-nginx-proxy-companion`によるリバースプロキシ環境を要求．
    - httpsでサーブする

以降は`dev`を前提とする．

### コンテナの起動

dev環境では一度buildを実行する．

```bash
$ make build-dev
```

コンテナの起動や停止等は下記で実行する

```bash
# コンテナの起動
$ make start-dev
# コンテナの停止
$ make stop-dev
# コンテナの再起動
$ make restart-dev
# コンテナの削除
$ make clean-dev
```

Django管理コマンドの発行

```bash
# マイグレーションの実行
$ make migrate-dev
# manage.pyコマンドの実行
$ make manage-dev args="createsuperuser"
# ダミーデータを読み込む
# まず既存のデータを全削除
$ make manage-dev args="flush"
# 読み込む
$ make manage-dev args="loaddata dummy.json"
```

データは基本的にDocker Volumeで管理されている．削除したい場合はこのVolumeを削除する

```bash
$ docker volume rm saffron_saffron-db-dev
```

### その他の操作

`yarn build`の実行

```bash
$ make build
```

各イメージのビルド

```bash
$ make image
# Calyxのみ
$ make calyx-image
# Petalsのみ
$ make petals-image
```

不要なイメージの削除

```bash
$ make prune
```