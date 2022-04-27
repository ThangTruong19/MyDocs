# 共通認証モジュール（Azure AD対応版）

共通認証モジュールはグローバル変数として提供しています。HTMLに `<script src="azure-ad-authentication.js">` を追加して、次のように初期化をします。これによって、ログインやアクセストークン検証に必要な処理を実行するためのインスタンスを得ることができます

```js
const azureAdAuthentication = new window.azureAdAuthentication.default({
  'clientId',
  'tenant'
  'https://example.com/redirect_url',
});

azureAdAuthentication.run();
```

## `AzureAdAuthentication`コンストラクタの引数について

`AzureAdAuthentication`コンストラクタの型定義を示します。

```ts
class AzureAdAuthentication {
  new(
    clientId:     string,
    tenant:       string,
    redirectUri:  string,
  );
}
```

- clientId
  - 登録したクライアントID
- tenant
  - Azure ADのテナント名
- redirectUrl（任意）
  - ログイン後にリダイレクトするURL

## `AzureAdAuthentication`インスタンスメソッド

`AzureAdAuthentication`は4つのメソッドを提供します。

```ts
const azureAdAuthentication = new AzureAdAuthentication(
  //
)

azureAdAuthentication.run()
azureAdAuthentication.forceUpdateAccessToken()
azureAdAuthentication.getUserAttribute()
azureAdAuthentication.clearCache()
```

- run()
  - 引数なし
  - 戻り値: Promise<AzureAdAuthenticationResult>
    - アクセストークン文字列を返すPromiseを返却します
    - 未ログイン時はログイン画面へリダイレクトされます。結果として、ステータスは「ログイン中」を返すPromiseを返却します。
    - ログイン後に`run()`を呼んだ際、アクセストークン返却のための処理を行います
    - アクセストークンの有効期限が切れている場合は、画面遷移を行わずに非同期でアクセストークンの取得を試みます
      - こちらの分岐に入った場合でもアクセストークンを格納したPromiseを返すのは同様です
      - Azureのセッション有効期限も失われている場合はログイン画面へ遷移します
- forceUpdateAccessToken()
  - 引数なし
  - 戻り値: Promise<AzureAdAuthenticationResult>
    - アクセストークン文字列を返すPromiseを返却します
    - 不可視のiframeを生成し、その内部でログイン処理を行います
    - IDトークン取得前に呼んだ場合、エラーになります
- getUserAttribute(accessToken: string, params: string[])
  - accessToken
    - `azureAdAuthentication.run()`などで取得したアクセストークン文字列を渡します
    - この引数がfalseと評価される場合、`InvalidError`を返却します
  - params
    - 取得したいユーザー属性名を、文字列配列で渡します
  - 戻り値: Promise<any>
    - ユーザー属性のオブジェクトを返すPromiseを返却します
- clearCache()
  - 認証に利用されるLocalStorageのパラメーター `adal.xxx` を削除します
  - 引数なし
  - 戻り値なし
- verifyIdToken()
  - ローカルにキャッシュされているIDトークンの妥当性を検証します。
    - 検証を通過した場合にはなにも起こりません。
    - 検証を通過しなかった場合にはエラーを返します。
  - 引数なし
  - 戻り値: Promise<void | never>

## AzureAdAuthenticationResult
`run()`の結果はこの仕様のオブジェクトにて返却します。

```ts
export enum Status {
  HasNotYetAcquired, // 0 まだ取得できていません
  Verified,          // 1 承認されました
  AlreadyLoggedIn,   // 2 すでにログインしています
  RequestingLogin,   // 3 ログイン画面にリダイレクトされ、ログイン中です
}

export interface AzureAdAuthenticationResult {
  status: Status;

  // statusが 0, 3 のとき値は格納されません
  // statusが 1 および 2 のとき、data にはアクセストークン文字列が格納されます
  data: string;
}
```

## イベント

`AzureAdAuthentication`クラスにstaticで定義された`event`プロパティからイベントを購読できます。

次のように、`events.on(<イベント名>, <コールバック関数>)`の形式でイベントの監視とそれに応じて実行される処理を記述できます。

```ts
AzureAdAuthentication.events.on('loggedInWithLoginScreen', () =>
  console.log('ログイン完了');
);
```

購読できるイベントは次のとおりです。

### loggedInWithLoginScreen

Azureのログイン画面からのリダイレクト時に発生します。

Azure ADのセッションが失われている状態でログインが必要になった際には、Azure側のログイン画面でユーザーがログイン操作を行い、元のアプリ（redirectUrl）に戻ってきますが、そのタイミングを知らせるのがこのイベントです。

具体的には、OAuth2.0 Implicit flowに従ってURLハッシュにトークン情報を持ったリダイレクトが行われたことに反応するものです。トークンのサイレント更新によるリダイレクトには反応しません。

また、 `AzureAdAuthentication` のコンストラクタ内の処理でURLハッシュの解析とクリアが行われるため、それよりも早くイベントの購読を開始しないとログインの判定が取れなくなってしまいます。

そのため次のように初期化前に購読を始めます。

```ts
AzureAdAuthentication.events.on('loggedInWithLoginScreen', () =>
  console.log('ログイン完了');
);
const instance = new AzureAdAuthentication(clientId, tenant, redirectUrl);
```

## 依存ライブラリについて

本ライブラリは、以下のライブラリに依存しています。

- [Active Directory Authentication Library (ADAL) for JavaScript](https://github.com/AzureAD/azure-activedirectory-library-for-js)
- [Microsoft Graph JavaScript Client Library](https://github.com/microsoftgraph/msgraph-sdk-javascript)

## エラー定義

本ライブラリが定義しているエラーは以下の通りです。

- InvalidError
  - 入力の不正を表します

また、各エラーメッセージにて詳細を示します。

- `Access token is invalid`

そのほかに、Azure AD、Microsoft Graph API、および上記ライブラリで定義されたエラーを返却します。これらのエラーについては、各公式ドキュメントをご参照ください。

## アクセストークンの有効期限を常に確認する

アクセストークンの有効期限は取得から1時間です。有効期限が切れたアクセストークンの更新を自動的に行う実装がされていないと、ユーザーが操作している間にもトークンは無効となり、APIリクエストの失敗によるエラーが頻繁に起こることになります。

そのため、APIリクエストの際には常にアクセストークンの有効期限をチェックすることが推奨されます。

現状、 `run()` メソッドを呼べば状況に合わせた振る舞いが行えることを目指しています。基本的にはAPIリクエストの前に `run()` メソッドを呼べば良いという働きをします。

次のコードは、GETリクエストを行う前にそれを呼び出して有効なアクセストークンの確認及び取得を行うメソッドを備えたHTTPサービスの例です。

```ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';

import { AzureAdAuthentication } from 'path/to/azure-ad-authentication';

@Injectable({ providedIn: 'root' })
export class ExampleHttpClientService {
  private azureAdAuthentication: AzureAdAuthentication;

  constructor(private httpClient: HttpClient) {
    this.azureAdAuthentication = new AzureAdAuthentication(
      '<clientId>',
      '<tenant>',
      '<redirectUri>',
    );
  }

  get<T>(url: string): Observable<HttpResponse<T>> {
    return from(this.azureAdAuthentication.run()).pipe(
      map(v => v.data),
      concatMap(token => {
        const headers = {
          Authorization: `Bearer ${token}`,
        };
        return this.httpClient.get<T>(url, { observe: 'response', headers });
      }),
    );
  }
}
```

`ExampleHttpClientService#get()` を呼び出したとき、ローカルにキャッシュされているアクセストークンの状況によって、挙動は次のように分岐します。

- アクセストークンの有効期限が切れていない
  - そのアクセストークンをリクエストに使います
- アクセストークンが有効期限が切れている
  - 非同期でトークンの更新を試みて、新たに取得したトークンを使います
- アクセストークンの有効期限がきれている && Azureのセッションも失われている
  - サインイン画面へ遷移します
- アクセストークンを持っていない
  - サインイン画面へ遷移します
