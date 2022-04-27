# HTML-CDSM 各種情報・手順

## 使用フレームワーク  
- Angular 13

## ビルド用ライブラリ  
- Node.js 16.14.x
- npm 8.5.x

## 環境構築手順
1. 以下のサイトから `fnm-windows.zip` をダウンロードして任意の場所に解凍する。  
https://github.com/Schniz/fnm/releases

2. システム環境変数のPathに1. へのパスを追加する。  
追加パス例  
```
C:\usr\app\fnm-windows
```

※上記追加後、 `powershell` を起動して、以下のコマンドを実行し、バージョンが表示されればOK。  
```
fnm --version
```

3. 管理者権限で `powershell` を起動し、以下のコマンドを実行する。  
```
Set-ExecutionPolicy RemoteSigned
```

4. 一般ユーザで `powershell` を起動し、以下のコマンドを実行する。  
```
echo "fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression" >> $PROFILE
```

5. `powershell` で以下のコマンドを実行する。  
```
fnm install v16.14.2
fnm use v16.14.2
```

※コマンド実行後にネットワーク接続エラーになるようであれば、 `powershell` で以下のコマンドを実行後、再度上記コマンドを実行する。  
※ `<server>:<port>` にはプロキシサーバの IP アドレスとポート番号を指定すること。  
```
$env:http_proxy="http://<server>:<port>"
$env:https_proxy="http://<server>:<port>"
```

6. `powershell` で以下のコマンドを実行し、想定通りのバージョンが表示されれば、OK。
```
node -v
npm -v
```

7. ソースコードエディタ [Visual Studio Code](https://azure.microsoft.com/ja-jp/products/visual-studio-code/) をダウロード・インストールする。  

8. `Visual Studio Code` (以下、 `VSCode` ) を起動し、`ファイル` -> `フォルダを開く` で `HTML_CDSM` -> `source` を選択する。  

9. 初回の環境構築時のみ `HTML_CDSM/source` ディレクトリ直下で以下の3つのコマンドを実行する。  
( `VSCode` の場合は、 `@ + ctrl` でターミナルを表示して実行する。)  
実行後、 `node_modules` ディレクトリが作成させていれば、OK。  
```
# @以降のバージョンはpackage.jsonに記載の@angular/cliのバージョンを指定。
npm install -g @angular/cli@13.3.0

npm install -g gulp

npm install
```
もし上記の `npm install` 実行時に、処理が途中で止まりインストールが完了しない場合、  
以下のコマンドを実行後、再度 `npm install` を実行する。  
※ `<server>:<port>` にはプロキシサーバの IP アドレスとポート番号を指定すること。  
```
npm config set proxy http://<server>:<port>
npm config set https-proxy http://<server>:<port>
npm config set registry http://registry.npmjs.org/
```

10. `VSCode` のターミナルまたは `powershell` 上で、以下のコマンドを実行し、正常に実行できれば、OK。  
```
ng build
```

## アプリの実行手順
1. API モックサーバを起動する。  
`powershell` を新たに起動し、`HTML_CDSM/source` ディレクトリ直下で以下のコマンドを実行する。  
```
gulp
```
2. 1.のコマンドの実行結果に出力されている URL をブラウザで表示し、 API モックサーバの結果が表示できればOK。  
```
# URL例
http://localhost:4201/catalog/
```
3. `VSCode` のターミナルまたは1. とは別の `powershell` 上で、以下のコマンドを実行する。    
```
ng serve
```
4. 3.のコマンドの実行結果に出力されている URL をブラウザで表示し、画面が表示できればOK。  
```
# URL例
http://localhost:4200/
```

## リリース時のビルドコマンド  
- `HTML_CDSM/source` ディレクトリ直下で `powershell` を起動し、以下のコマンドを実行する。  
 ( `VSCode` の場合は、 `@ + ctrl` でターミナルを表示して実行する。)  
  `dist` ディレクトリが作成され、その中にビルド結果のモジュールが生成される。  
  サーバへのリリース時にはこの `dist` ディレクトリ配下のモジュールをデプロイすること。  
```
ng build -c production
```
