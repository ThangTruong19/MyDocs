# ヘッダの使い方

**ヘッダ使用例**

```html
<common-header
  [labels]      ="commonLabels"
  [userIconPath]="'./path/to'"
  [isLoggedIn]  ="isLoggedIn"
  [configValues]="commonConfigValues"
  [configItems] ="configItems"
  [configLabels]="configLabels"
  [signOutIsPermitted]="signOutIsPermitted"

  (clickLogo)          ="onClickLogo()"
  (clickManagementUser)="onClickManagementUser()"
  (signOut)            ="onSignOut()"
  (submitConfig)       ="onSubmitConfig($event)"
></common-header>
```

- 多言語データについて
  - これらはAPI経由で取得する必要があるため、この共通コンポーネント内に言語データは含まれていません
  - ラベルのみをまとめたオブジェクトを作り、[labels]=""属性にオブジェクトを渡します
  - このオブジェクトのプロパティ仕様は `interface.ts` を参照してください
- サインアウトについて
  - サインアウトするために呼ぶ必要のあるエンドポイントは可変であるため、この共通コンポーネント内にそのURLは含まれていません
  - `onSignOut()` 関数でサインアウト処理を記述できます
    - サインアウトボタンをクリックしたときこの関数が呼ばれます
  - サインアウトボタンの表示可否は [signOutIsPermitted]="" に真偽値を渡します。
- 環境設定ダイアログの項目について
  - 環境設定（言語、温度単位、日付フォーマットなど）の値はAPIから取得する必要があるため、[configItems]属性にオブジェクトを渡してください
  - 仕様は `interface.ts` を参照してください

## コンポーネントへの実装例

``` html
<!-- *.component.html -->
<common-header
  [labels]      ="commonLabels"
  [userIconPath]="'./path/to'"
  [isHome]      ="isHome"
  [isLoggedIn]  ="isLoggedIn"
  [configValues]="commonConfigValues"
  [configItems] ="configItems"
  [configLabels]="configLabels"
  [headerItems]="headerItems"
  [userItems]="userItems"
  [signOutIsPermitted]="signOutIsPermitted"

  (clickLogo)          ="onClickLogo()"
  (clickManagementUser)="onClickManagementUser()"
  (signOut)            ="onSignOut()"
  (submitConfig)       ="onSubmitConfig($event)"
  (clickHeaderItem)    ="onClickHeaderItem($event)"
  (clickUserItem)      ="onClickUserItem($event)"
></common-header>
```

``` javascript
import { Component, OnInit } from '@angular/core';
import { CommonConfig, ConfigItems, ConfigLabels, HeaderLabels } from 'app/vendors/k-common-module/interfaces';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  commonLabels: HeaderLabels;
  headerItems: HeaderItem[];
  userIconPath: string;
  userItems: UserItems;
  isLoggedIn: boolean;
  commonConfigValues: CommonConfig;
  configItems: ConfigItems;
  configLabels: ConfigLabels;

  constructor() { }

  ngOnInit() {
    this.isLoggedIn = true; // ログイン状態でなければ、commonLabelsのユーザー名等は表示されません
    this.isHome = true; // trueにするとホームアイコンとリンクがdisabledになります

    this.commonLabels = {
      logout: 'ログアウト',
      managementDropdown: '管理',
      configDropdown: '設定',
      notification: '通知',
      signOutDialogTitle: 'KOMTRAXからサインアウト',
      signOutDialogNote: '続行するとAzureアカウントからサインアウトされます。',
      signOutDialogButtonCancel: 'キャンセル',
      signOutDialogButtonSignOut: 'サインアウト',
    };

    this.headerItems = [
      {label: 'ラベル1', id: '1', isEnabled: true},
      {label: 'ラベル2', id: '2', isEnabled: false}, // グレーにしたいときfalse
      {label: 'ラベル3', id: '3', isEnabled: true},
      {label: 'ラベル4', id: '4', isEnabled: false},
    ];

    this.userItems = {
      name: '東京太郎',
      email: 'taro.tokyo@example.com',
      groupName: 'コマツレンタル東京営業部',
      links: [
        { label: '使用許諾契約書', id: '1', isEnabled: true },
        { label: 'パスワード変更', id: '2', isEnabled: false }, // グレーにしたいときfalse
      ],
    };

    this.commonConfigValues = {
      temperatureUnit: '0',
      dateFormat:      'YYYY/MM/DD',
      carDivision:     '0',
      locale:          'ja',
      distanceUnit:    '0',
      initialScreen:     '/',
    };

    this.configItems = {
      temperatureUnit: [
        {label: '℃', value: '0'},
        {label: '℉', value: '1'},
      ],
      dateFormat:      [
        {label: 'YYYY/MM/DD', value: 'YYYY/MM/DD'},
        {label: 'MM/DD/YYYY', value: 'MM/DD/YYYY'},
        {label: 'DD/MM/YYYY', value: 'DD/MM/YYYY'},
      ],
      carDivision:     [
        {label: 'すべて', value: '0'},
        {label: '建機のみ', value: '1'},
        {label: 'フォークのみ', value: '2'},
      ],
      locale:          [
        {label: '日本語', value: 'ja'},
        {label: '英語', value: 'en'},
      ],
      distanceUnit:    [
        {label: 'METER', value: '0'},
        {label: 'MILE', value: '1'},
      ],
      initialScreen: [
        { label: 'ホーム', value: '/' },
        { label: '車両リスト', value: '/info' },
        { label: 'フロントサービス', value: '/business-support/front' },
      ],
    };

    this.configLabels = {
      localeHead: '言語設定',
      dateFormatHead: '日付フォーマット',
      distanceUnitHead: '長さ単位',
      temperatureUnitHead: '温度単位',
      carDivisionHead: '車両区分',
      initialScreenHead: '初期表示ページ',
      submit: 'OK',
      cancel: 'キャンセル',
    };

    this.signOutIsPermitted = true;
  }

  onClickLogo() {
    console.info('ロゴがクリックされました');
  }

  onClickManagementUser() {
    console.info('ユーザー管理がクリックされました');
  }

  onSignOut() {
    console.info('サインアウトがクリックされました');
  }

  onSubmitConfig() {
    console.info('設定が決定されました');
  }

  /**
   * クリックされた項目のidが引数として渡されるため、そのidをもとに処理分けします。
   */
  onClickHeaderItem(id) {
    console.info('ヘッダの管理メニュー項目がクリックされました', id);
  }

  /**
   * クリックされた項目のidが引数として渡されるため、そのidをもとに処理分けします。
   */
  onClickUserItem(id) {
    console.info('ユーザーメニューの項目がクリックされました', id);
  }
}
```
