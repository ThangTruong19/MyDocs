# HTML_FR-CFM-DFM 起動手順
1. `powershell` を起動し、 `HTML_FR-CFM-DFM/source` で以下のコマンドを実行する。（※初回のみ実施）  
```
fnm install v10.16.3

fnm use v10.16.3
```
※補足  
上記コマンド実行時に ネットワーク接続エラーが表示されるようであれば、  
powershell で以下のコマンドを実行してから、再度上記コマンドを実行すること。  
```
$env:http_proxy="http://172.16.0.100:8080"
$env:https_proxy="http://172.16.0.100:8080"
```

2. 1.の後、`powershell` で、 `HTML_FR-CFM-DFM/source` にて以下のコマンドを実行する。（※初回のみ実施）  
```
npm install
```
※補足  
上記コマンド実行時に ネットワーク接続エラー(proxy 関連のエラー)が表示されるようであれば、  
powershell で以下のコマンドを実行してから、再度上記コマンドを実行すること。  
```
npm config set proxy http://172.16.0.100:8080/
npm config set https-proxy http://172.16.0.100:8080/
npm config set registry http://registry.npmjs.org/
```

3. 2.の後、`powershell` で、 `HTML_FR-CFM-DFM/source` にて以下のコマンドを実行する。  
```
node ./node_modules/@angular/cli/bin/ng serve -c local
```

4. 新たに `powershell` を起動し、`HTML_FR-CFM-DFM/source` で以下のコマンドを実行する。  
```
node ./node_modules/gulp/bin/gulp
```

5. ブラウザ上で以下のURLで画面が表示できれば、OK。  
```
http://localhost:4300/
```
