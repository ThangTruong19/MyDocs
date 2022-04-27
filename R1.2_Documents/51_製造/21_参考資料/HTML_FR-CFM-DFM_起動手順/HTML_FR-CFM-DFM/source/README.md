# KMT_NGK_DESKTOP
## 次世代KOMTRAX
* DFM/CFM管理メニュー
* 運用アプリ
* JobSite
* KOMTRAXリンク

# 環境構築
## 必要なもの
* Node.js (10系以上)
* npm (5.0.0 以上)
* bower
* gulp
* [Angular CLI](https://github.com/angular/angular-cli) version 8.3.9

## 開発環境
* フロントエンド: TypeScript, Sass, Angular(8.3.9)
* スタブAPI：yml, json

## 初期セットアップ
```
$ npm install
```
- 必要な node.js のパッケージをインストール

```
$ bower install
$ gulp scripts:maplibrary
$ gulp scripts:jquery
```
- 必要な bower 管理のパッケージをインストール
- インストールしたパッケージのアプリ内への取り込み

```
$ cp src/assets/settings.example.js src/assets/settings.js
```
- 設定ファイルのサンプルをリネームする

- 以下のページを参考に settings.local.js, settings.dfm.js, settings.cfm.js, settings.opa.js を配置する
  https://ghe.fenrir-inc.com/Fenrir-b2b2/KMT_NGK_DESKTOP/wiki/%E3%83%AD%E3%83%BC%E3%82%AB%E3%83%AB%E7%92%B0%E5%A2%83%E3%81%8B%E3%82%89%E5%AF%8C%E5%A3%AB%E9%80%9A%E3%81%AEAPI%E3%81%AB%E6%8E%A5%E7%B6%9A%E3%81%99%E3%82%8B%E6%96%B9%E6%B3%95

## 環境の設定について

```
$ gulp env:（アプリ名）
```
- 以下のページに記載されているgulpタスクで使用するAPIを切り変える
  https://ghe.fenrir-inc.com/Fenrir-b2b2/KMT_NGK_DESKTOP/wiki/%E3%83%AD%E3%83%BC%E3%82%AB%E3%83%AB%E7%92%B0%E5%A2%83%E3%81%8B%E3%82%89%E5%AF%8C%E5%A3%AB%E9%80%9A%E3%81%AEAPI%E3%81%AB%E6%8E%A5%E7%B6%9A%E3%81%99%E3%82%8B%E6%96%B9%E6%B3%95

## 開発サーバ

- 開発環境のAPIを使用する場合
```
$ ng serve -c dev
```

**注意**
サンドボックス環境は使用禁止となったため検証環境を使用してください。

- モックサーバのAPIを使用する場合
```
$ ng serve --host 0.0.0.0 -c local
```

- 実行後、 `http://localhost:4200/` で開発サーバが立ち上がります。

## API モックサーバ

### DFM/CFM

```
$ gulp
#=> DFM/CFM Api mock server is listening on port 4201
```

### 運用アプリ

```
$ gulp --opa
#=> OPA Api mock server is listening on port 4201
```

### KOMTRAXリンク

```
$ gulp --komtrax-link
#=> KOMTRAX-LINK Api mock server is listening on port 4201
```

- 実行後、 API モックサーバが立ち上がります。開発サーバとは別に起動してください。

## 本番用ファイルのビルド

```
$ cp src/assets/settings.example.js src/assets/settings.js
```
- `src/assets/settings.example.js` 内の `window.appVersion` の更新を確認し、設定ファイルを作成します。

```
$ ng build --prod --base-href={サブディレクトリのパス}
```
- 実行後、 /dist 以下に本番用ビルドファイルが生成されます。
- サブディレクトリのパス
  - 運用アプリ `/admin/`
  - CFM `/c/fm/admin/`
  - DFM `/d/fm/admin/`

## 開発用ファイルのビルド

```
$ ng build
```
- 実行後、 /dist 以下に開発用ビルドファイルが生成されます。

## 単体テスト

```
$ ng test
```
- 実行後、 Karma による単体テストが実行されます。開発サーバは停止させた状態で行ってください。

## 環境変数について

- 次世代KOMTRAX では `src/environments` 以下が環境変数ファイルとなります。
```
src/environments
├── environment.prod.{環境名}.ts   # 設定ファイル(本番環境用)
├── environment.{環境名}.ts        # 設定ファイル(開発環境用)
├── environment.ts              # 設定ファイル(型定義のみ)
└── shared
    ├── admin_map_wrapper.ts    # MapWrapperの設定ファイル
    └── date_picker.ts          # DatePickerの設定ファイル
```

### 環境名
- flm          ・・・ DFM/CFM管理メニュー
- opa          ・・・ 運用アプリ
- komtrax-link ・・・ KOMTRAXリンク

## ラベルのマッピングに関して

- ラベル一覧のマッピングは`data/label`以下の YAML ファイルにあります。
- `screenCode`が screen_code 、各要素の`name`が code 、`description`が利用箇所の記述となります。

## ディレクトリ構成

```
├── README.md           # ReadMeファイル
├── data                # 開発用リソースファイル
│   ├── apimock.yml     # モックAPI設定
│   ├── json            # モックAPIデータ
│   └── label           # ラベルデータ
├── e2e                 # e2eテスト用ファイル
├── gulpfile.js         # gulp設定
├── karma.conf.js       # karma設定
├── package.json        # Node.js パッケージ管理
├── package-lock.json   # パッケージロックファイル
├── protractor.conf.js  # e2eテスト用設定
├── src                 # 各種開発用jsファイル
│   ├── app
│   │   ├── components  # Angular コンポーネント
│   │   │   ├── app
│   │   │   ├── contact
│   │   │   ├── home
│   │   │   ├── operator
│   │   │   └── shared
│   │   ├── constants   # 定数ファイル
│   │   ├── directives  # Angular directive
│   │   ├── interfaces  # インターフェイス設定ファイル
│   │   ├── modules     # Angular モジュール
│   │   │   └── shared
│   │   ├── pipes       # Angular カスタムパイプ定義
│   │   ├── services    # Angular サービス
│   │   ├── types       # 各種パラメータ型定義
│   │   └── vendor      # ベンダ提供ファイル
│   │       └── k-common-module   # 共通モジュール
│   ├── assets          # CSS/Imageファイル
│   ├── environments    # 環境変数ファイル
│   ├── favicon.ico
│   ├── index.html
│   ├── main.ts
│   ├── polyfills.ts
│   ├── test.ts
│   ├── tsconfig.app.json
│   ├── tsconfig.spec.json
│   └── typings.d.ts
├── tsconfig.json
└── tslint.json
```
