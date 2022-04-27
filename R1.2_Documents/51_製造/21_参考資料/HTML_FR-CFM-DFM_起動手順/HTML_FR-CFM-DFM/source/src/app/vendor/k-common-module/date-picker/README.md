# 日次カレンダー

- タイムゾーンや選択中の日付オブジェクトを渡せるように作られています
- "日", "月", "火"といった曜日のラベルは別途ラベル配列として渡します
- 日付がクリックされたときのハンドラをコンポーネントに指定することで、その情報を独自の日付オブジェクト(詳細は後述)として受け取れます
- 日付範囲のような2つの日付を選ぶコンポーネントは提供していませんので、common-date-pickerを2つ並べて実装してください

**日次カレンダー使用例**

``` html
<button
  commonFlyoutTrigger
  [id]="id"
  type="button"
>日次カレンダー</button>

<common-date-picker
  commonFlyout

  [id]                     ="'datepicker'"
  [attr.aria-controls]     ="'datepicker'" <!-- id と同じ文字列 -->
  [labels]                 ="labels"
  [disabledTodayButton]    ="disabledTodayButton()"
  [disabledPrevMonthButton]="disabledPrevMonthButton()"
  [disabledNextMonthButton]="disabledNextMonthButton()"
  [weekLabels]             ="getWeekLabels()"
  [days]                   ="days"
  [isVisibleClearButton]   ="true"
  [title]                  ="getTitle()"
  [years]                  ="getYears()"
  [monthLabels]            ="getMonthLabels()"
  [months]                 ="months"

  (hasOpened) ="onOpened()"
  (clickDay)  ="onClickDay($event)"
  (clickPrev) ="onClickPrev()"
  (clickNext) ="onClickNext()"
  (clickClose)="onClickClose()"
  (clickToday)="onClickToday()"
  (clickClear)="onClickClear()"
  (changeYear)="onChangeYear()"
  (changeMonth)="onChangeMonth()"
></common-date-picker>
```

## daysについて
- `days`には独自の日付オブジェクトを「配列の配列」形式のデータとして指定します
- この日付オブジェクトは interface.ts にて CommonDatePickerDay として提供しています

例えば2017年7月7日のデータはこのようになります。
もし7月7日が当日で、かつ選択されていたら、該当のプロパティはそれぞれtrueとなります。

``` javascript
{
  disabled:    false, // disabled状態ではない
  isToday:     true,  // 今日は7月7日である
  isSelected:  true,  // 7月7日が選択中である
  isLastMonth: false,
  isNextMonth: false,
  YYYYMMDD:    '20170707',
  date:        7,
};
```

2017年7月1日は土曜日のため、カレンダー表示上は6月26日から表示されます。前月なのでisLastMonthがtrueとなります。
isNextMonthも同様で、翌月の値の場合にtrueとなります。

``` javascript
{
  disabled:    false,
  isToday:     false,
  isSelected:  false,
  isLastMonth: true, // 前月なのでtrueとなります
  isNextMonth: false,
  YYYYMMDD:    '20170626',
  date:        26,
};
```

daysの「配列の配列」構造は、length 7の配列（日〜土までの日付オブジェクト）の配列（5週分）になります。

``` javascript
const days = [
  [
    {
      disabled:    false,
      isToday:     false,
      isSelected:  false,
      isLastMonth: true,
      isNextMonth: false,
      YYYYMMDD:    '20170626',
      date:        26,
    },
    {
      disabled:    false,
      isToday:     false,
      isSelected:  false,
      isLastMonth: true,
      isNextMonth: false,
      YYYYMMDD:    '20170627',
      date:        27,
    },
    {
      // 略
      date: 28,
    },
    {
      // 略
      date: 29,
    },
    {
      // 略
      date: 30,
    },
    {
      disabled:    false,
      isToday:     false,
      isSelected:  false,
      isLastMonth: false,
      isNextMonth: false,
      YYYYMMDD:    '20170701',
      date:        1,
    },
    {
      // 略
      date: 2,
    },
  ],
  [
    {
      // 略
      date: 3,
    },
    {
      // 略
      date: 4,
    },
    {
      // 略
      date: 5,
    },
    {
      // 略
      date: 6,
    },
    {
      disabled:    false,
      isToday:     true,
      isSelected:  true,
      isLastMonth: false,
      isNextMonth: false,
      YYYYMMDD:    '20170707',
      date:        7,
    },
    {
      // 略
      date: 8,
    },
    {
      // 略
      date: 9,
    },
  ],
  [
    {
      // 略
      date: 10,
    },
    // 略
  ],
  // 略
  [
    {
      disabled:    true,
      isToday:     false,
      isSelected:  false,
      isLastMonth: false,
      isNextMonth: false,
      YYYYMMDD:    '20170731',
      date:        31,
    },
    {
      disabled:    true,
      isToday:     false,
      isSelected:  false,
      isLastMonth: false,
      isNextMonth: true,
      YYYYMMDD:    '20170801',
      date:        1,
    },
    // 略
  ],
];
```

これらのbooleanプロパティは、CSSによる表示切り替えに使用されます

## isVisibleClearButtonとclickClearについて

`isVisibleClearButton`に`true`を指定すると、クリアボタンが表示されます。また、このクリアボタンがクリックされた場合は、`clickClear`に指定された処理が呼び出されます。

実装例は「[コンポーネントへの実装例](#コンポーネントへの実装例)」の節を参照ください。

## monthLabelsについて

`monthLabels`には、1月から12月までの多言語化済みの文字列を、配列長12の文字列配列として渡します。 `monthLabels`未指定時、および`monthLabels`の配列長が12に満たない場合は、月を表す数字がそのまま表示されます。

実装例は「[コンポーネントへの実装例](#コンポーネントへの実装例)」の節を参照ください。

## monthsについて

選択可能な月として `[0,1,2,...11]` のように 「0から始まるindex」 の一覧を指定してください。
（0から始まるindexなので、1月,2月,3月を有効にする場合は `[0, 1, 2]` を指定します。）
`months` を渡さない場合はデフォルト値として `[0,1,2,...11]` が使われ、全月が選択可能になります。

## changeYearイベントとchangeMonthイベントについて

プルダウンでの「年」や「月」の変更は、`changeYear`イベント及び`changeMonth`イベントをハンドリングすることで受け取ることができます。

`changeYear`イベント・`changeMonth`イベント共に、選択した年または月が`number`型で渡されます。

実装例は「[コンポーネントへの実装例](#コンポーネントへの実装例)」の節を参照ください。

## コンポーネントへの実装例

``` html
<!-- *.component.html -->
<button
  type="button"
  commonFlyoutTrigger
  [id]="'dailyCalendar'"
>日次カレンダー</button>

<common-date-picker
  commonFlyout

  [id]                     ="'dailyCalendar'"
  [labels]                 ="labels"
  [disabledTodayButton]    ="disabledTodayButton()"
  [disabledPrevMonthButton]="disabledPrevMonthButton()"
  [disabledNextMonthButton]="disabledNextMonthButton()"
  [weekLabels]             ="getWeekLabels()"
  [days]                   ="days"
  [isVisibleClearButton]   ="true"
  [title]                  ="title"
  [years]                  ="years"
  [monthLabels]            ="getMonthLabels()"

  (hasOpened) ="onOpened()"
  (clickDay)  ="onClickDay($event)"
  (clickPrev) ="onClickPrev()"
  (clickNext) ="onClickNext()"
  (clickClose)="onClickClose()"
  (clickToday)="onClickToday()"
  (clickClear)="onClickClear()"
  (changeYear)="onChangeYear()"
  (changeMonth)="onChangeMonth()"
></common-date-picker>
```

``` javascript
// *.component.ts
import { Component, OnInit } from '@angular/core';

import { CommonDatePickerDay, DatePickerLabels } from '../../../vendors/k-common-module/interfaces';

@Component({
  selector: 'app-daily-calendar',
  templateUrl: './daily-calendar.component.html',
  styleUrls: ['./daily-calendar.component.css']
})
export class DailyCalendarComponent implements OnInit {

  labels: DatePickerLabels;
  days: CommonDatePickerDay[][];

  constructor() { }

  ngOnInit() {
    // 実際にはロジックで動的に生成するようにしてください
    // また、この例ではngOnInitで処理していますが、状況に応じたタイミングで処理するようにしてください
    this.labels = {
      todayButton: '本日',
      closeButton: '閉じる',
      clearButton: 'クリア',
    };
    const week1 =     [
      {
        disabled:    false,
        isToday:     false,
        isSelected:  false,
        isLastMonth: true,
        isNextMonth: false,
        YYYYMMDD:    '20170626',
        date:        26,
      },
      {
        disabled:    false,
        isToday:     false,
        isSelected:  false,
        isLastMonth: true,
        isNextMonth: false,
        YYYYMMDD:    '20170627',
        date:        27,
      },
      {
        disabled:    false,
        isToday:     false,
        isSelected:  false,
        isLastMonth: true,
        isNextMonth: false,
        YYYYMMDD:    '20170628',
        date:        27,
      },
      {
        disabled:    false,
        isToday:     false,
        isSelected:  false,
        isLastMonth: true,
        isNextMonth: false,
        YYYYMMDD:    '20170629',
        date:        29,
      },
      {
        disabled:    false,
        isToday:     false,
        isSelected:  false,
        isLastMonth: true,
        isNextMonth: false,
        YYYYMMDD:    '20170630',
        date:        30,
      },
      {
        disabled:    false,
        isToday:     false,
        isSelected:  false,
        isLastMonth: false,
        isNextMonth: false,
        YYYYMMDD:    '20170701',
        date:        1,
      },
      {
        disabled:    false,
        isToday:     false,
        isSelected:  false,
        isLastMonth: false,
        isNextMonth: false,
        YYYYMMDD:    '20170702',
        date:        2,
      },
    ];
    const week2 = []; //省略
    const week3 = []; //省略
    const week4 = []; //省略
    const week5 = [
      {
        disabled:    false,
        isToday:     false,
        isSelected:  false,
        isLastMonth: false,
        isNextMonth: false,
        YYYYMMDD:    '20170730',
        date:        30,
      },
      {
        disabled:    false,
        isToday:     false,
        isSelected:  false,
        isLastMonth: false,
        isNextMonth: false,
        YYYYMMDD:    '20170731',
        date:        31,
      },
      {
        disabled:    true,
        isToday:     false,
        isSelected:  false,
        isLastMonth: false,
        isNextMonth: true,
        YYYYMMDD:    '20170801',
        date:        1,
      },
      {
        disabled:    true,
        isToday:     false,
        isSelected:  false,
        isLastMonth: false,
        isNextMonth: true,
        YYYYMMDD:    '20170802',
        date:        2,
      },
      {
        disabled:    true,
        isToday:     false,
        isSelected:  false,
        isLastMonth: false,
        isNextMonth: true,
        YYYYMMDD:    '20170803',
        date:        3,
      },
      {
        disabled:    true,
        isToday:     false,
        isSelected:  false,
        isLastMonth: false,
        isNextMonth: true,
        YYYYMMDD:    '20170804',
        date:        4,
      },
      {
        disabled:    true,
        isToday:     false,
        isSelected:  false,
        isLastMonth: false,
        isNextMonth: true,
        YYYYMMDD:    '20170805',
        date:        5,
      },
    ];
    this.days = [ week1, week2, week3, week4, week5 ];
    this.title = {
      year: 2017,
      month: 8,
    };
    this.years = [
      2014,
      2015,
      2016,
      2017,
      2018,
      2019,
      2020,
    ];
    this.monthLabels = [
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
    ];
  }

  disabledTodayButton(): boolean {
    // 本日ボタンの表示制御です
    // 実際には、状況に応じてboolean値を返すロジックを作成してください
    return true;
  }

  disabledPrevMonthButton(): boolean {
    // 前月に進むボタンの表示制御です
    // 実際には、状況に応じてboolean値を返すロジックを作成してください
    return true;
  }

  disabledNextMonthButton(): boolean {
    // 次月に進むボタンの表示制御です
    // 実際には、状況に応じてboolean値を返すロジックを作成してください
    return true;
  }

  getWeekLabels(): string[] {
    // 実際には、国際化の状況に応じた曜日情報を返すようにロジックを作成してください
    return ['日', '月', '火', '水', '木', '金', '土'];
  }

  onClickDay(data) {
    console.log(data.ev.clientX);   // data.evは、イベント情報
    console.log(data.day.YYYYMMDD); // data.dayは、日付オブジェクト(CommonDatePickerDay型)
  }

  onOpened() {
    // カレンダーが開かれた際に何らかの処理が必要であればロジックを作成してください。
    console.log('カレンダーが開きました');
  }

  onClickPrev() {
    // this.days や labels.title を前月のデータに更新するロジックを作成してください。
    console.log('前月に切り替え');
  }

  onClickNext() {
    // this.days や labels.title を次月のデータに更新するロジックを作成してください。
    console.log('次月に切り替え');
  }

  onClickClose() {
    // カレンダーが閉じられた際に何らかの処理が必要であればロジックを作成してください。
    console.log('カレンダーが閉じられました');
  }

  onClickToday() {
    // this.days の本日の日付オブジェクトがisSelectedをtrueになるようなロジックを作成してください。
    console.log('本日を選択');
  }

  onClickClear() {
    // 指定日をクリアするロジックを作成してください。
    console.log('クリアを選択');
  }

  onChangeYear(year: number) {
    // 受け取った year に応じて、 this.days を再構築するロジックを作成してください。
    console.log(`${year}月を選択`);
  }
  
  onChangeMonth(month: number) {
    // 受け取った month に応じて、 this.days を再構築するロジックを作成してください。
    console.log(`${month}月を選択`);
  }
}
```
