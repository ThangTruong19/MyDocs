# 月次カレンダー

**月次カレンダー使用例**

``` html
<button
  commonFlyoutTrigger
  [id]="id"
  type="button"
>月次カレンダー</button>

<common-month-picker
  commonFlyout

  [id]                    ="id"
  [labels]                ="labels"
  [disabledNextYearButton]="disabledNextYearButton()"
  [monthList]             ="monthList"

  (hasOpened) ="onOpened()"
  (clickMonth)="onClickMonth($event)"
  (clickPrev) ="onClickPrev()"
  (clickNext) ="onClickNext()"
  (clickClose)="onClickClose()"
></common-month-picker>
```

- 月次カレンダーの年月オブジェクトは、日付オブジェクトより単純です
- 年月オブジェクトは年の概念を持たずに単純な配列を持ちます
  - これはCommonMonthPickerMonth型の配列です

``` javascript
const monthList = [
  {
    disabled: false,
    isThisMonth: false,
    isSelected: false,
    month: 1,
  },
  {
    disabled: false,
    isThisMonth: false,
    isSelected: false,
    month: 2,
  },
  // 略
  {
    disabled: false,
    isThisMonth: false,
    isSelected: false,
    month: 12,
  },
]
```

このようなデータ構造をとります。

labelsにはラベルの多言語対応データを渡します。

``` javascript
const labels = {
    closeButton: '閉じる',
    title: '2018',
    months: [
      '1月のラベル',
      '2月のラベル',
      '3月のラベル',
      '4月のラベル',
      '5月のラベル',
      '6月のラベル',
      '7月のラベル',
      '8月のラベル',
      '9月のラベル',
      '10月のラベル',
      '11月のラベル',
      '12月のラベル',
    ],
  }
```

months未指定時、およびmonthsの配列長が12に満たない場合は、monthの数値がそのまま表示されます。monthsに配列長12の文字列配列が渡されたとき、1月〜12月までの月名ラベルとして扱われます。

## isVisibleClearButtonとclickClearについて

`isVisibleClearButton`に`true`を指定すると、クリアボタンが表示されます。また、このクリアボタンがクリックされた場合は、`clickClear`に指定された処理が呼び出されます。

実装例は[コンポーネントへの実装例](#コンポーネントへの実装例)を参照ください。

## コンポーネントへの実装例

``` html
<!-- *.component.html -->
<button
  commonFlyoutTrigger
  [id]="'monthlyCalendar'"
  [attr.aria-controls]="'monthlyCalendar'" <!-- id と同じ文字列 -->
  type="button"
>月次カレンダー</button>

<common-month-picker
  commonFlyout

  [id]                    ="'monthlyCalendar'"
  [attr.aria-controls]    ="'monthlyCalendar'" <!-- id と同じ文字列 -->
  [labels]                ="labels"
  [disabledNextYearButton]="disabledNextYearButton()"
  [monthList]             ="monthList"
  [isVisibleClearButton]  ="true"

  (hasOpened) ="onOpened()"
  (clickMonth)="onClickMonth($event)"
  (clickPrev) ="onClickPrev()"
  (clickNext) ="onClickNext()"
  (clickClose)="onClickClose()"
  (clickClear)="onClickClear()"
></common-month-picker>
```

``` javascript
// *.component.ts
import { Component, OnInit } from '@angular/core';

import { CommonMonthPickerMonth, MonthPickerLabels } from 'app/vendors/k-common-module/interfaces';

@Component({
  selector: 'app-monthly-calendar',
  templateUrl: './monthly-calendar.component.html',
  styleUrls: ['./monthly-calendar.component.css']
})
export class MonthlyCalendarComponent implements OnInit {

  labels: MonthPickerLabels;
  monthList: CommonMonthPickerMonth[];

  constructor() { }

  ngOnInit() {
    // 実際にはロジックで動的に生成するようにしてください
    // また、この例ではngOnInitで処理していますが、状況に応じたタイミングで処理するようにしてください
    this.labels = {
      closeButton: '閉じる',
      title:       '2018',
      months: [
        '1月',
        '2月',
        '3月',
        '4月',
        '5月',
        '6月',
        '7月',
        '8月',
        '9月',
        '10月',
        '11月',
        '12月',
      ]
    };
    this.monthList = [
      {
        disabled:    false,
        isThisMonth: false,
        isSelected:  false,
        month:       1,
      },
      {
        disabled:    false,
        isThisMonth: false,
        isSelected:  false,
        month:       2,
      },
      {
        disabled:    false,
        isThisMonth: false,
        isSelected:  false,
        month:       3,
      },
      {
        disabled:    false,
        isThisMonth: false,
        isSelected:  false,
        month:       4,
      },
      {
        disabled:    false,
        isThisMonth: false,
        isSelected:  false,
        month:       5,
      },
      {
        disabled:    false,
        isThisMonth: false,
        isSelected:  false,
        month:       6,
      },
      {
        disabled:    false,
        isThisMonth: true,
        isSelected:  true,
        month:       7,
      },
      {
        disabled:    true,
        isThisMonth: false,
        isSelected:  false,
        month:       8,
      },
      {
        disabled:    true,
        isThisMonth: false,
        isSelected:  false,
        month:       9,
      },
      {
        disabled:    true,
        isThisMonth: false,
        isSelected:  false,
        month:       10,
      },
      {
        disabled:    true,
        isThisMonth: false,
        isSelected:  false,
        month:       11,
      },
      {
        disabled:    true,
        isThisMonth: false,
        isSelected:  false,
        month:       12,
      },
    ];
  }

  disabledNextYearButton() {
    // 実際には、状況に応じてboolean値を返すロジックを作成してください
    return true;
  }

  onOpened() {
    // カレンダーが開かれた際に何らかの処理が必要であればロジックを作成してください。
    console.log('カレンダーが開きました');
  }

  onClickMonth(data) {
    console.log(data.ev.clientX);     // data.evは、イベント情報
    console.log(data.monthObj.month); // data.monthObjは、年月オブジェクト(CommonMonthPickerMonth 型)
  }

  onClickPrev() {
    // this.monthList や labels.title を前年のデータに更新するロジックを作成してください。
    console.log('前年に切り替え');
  }

  onClickNext() {
    // this.monthList や labels.title を次年のデータに更新するロジックを作成してください。
    console.log('次月に切り替え');
  }

  onClickClose() {
    // カレンダーが閉じられた際に何らかの処理が必要であればロジックを作成してください。
    console.log('カレンダーが閉じられました');
  }

  onClickClear() {
    // 指定日をクリアするロジックを作成してください。
    console.log('クリアを選択');
  }
}
```
