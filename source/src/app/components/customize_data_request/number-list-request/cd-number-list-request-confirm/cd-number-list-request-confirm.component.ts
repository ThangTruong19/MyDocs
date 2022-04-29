import { Component, Input, OnInit } from '@angular/core';

/**
 * 送信番号一覧要求確認モーダル
 */

@Component({
  selector: 'app-cd-number-list-request-confirm',
  templateUrl: './cd-number-list-request-confirm.component.html',
  styleUrls: ['./cd-number-list-request-confirm.component.scss']
})
export class CdNumberListRequestConfirmComponent implements OnInit {

  _lists = {
    visibleList: [] as any[],
    originList: [] as any[],
  };

  @Input() lists: any;
  @Input() labels: any;
  @Input() thListModal: any;
  _thList = [
    {
      label: '車両',
      name: 'columnName1',
      displayable: true,
    },
    {
      label: '要求単位',
      name: 'columnName2',
      displayable: true,
    },
    {
      label: 'カスタマイズ用途定義',
      name: 'columnName3',
      displayable: true,
    },
    {
      label: '開始日',
      name: 'columnName4',
      displayable: true,
    },
    {
      label: '終了日',
      name: 'columnName5',
      displayable: true,
    }
  ];

  sortingParams = {
    sort: '',
    sortLabel: '',
  };

  constructor() { }

  ngOnInit(): void {
    console.log("cd-number-list-request-confirm list", this.lists);
    console.log("cd-number-list-request-confirm thListModal", this.thListModal);
    this._lists.originList = [{
      columnName1: 'PC200-8-1234',
      columnName2: '用途定義単位',
      columnName3: 'カスタマイズ用途定義A',
      columnName4: '2020/6/1 00:00:00.000',
      columnName5: '2020/6/30 00:00:00.000',
    }, {
      columnName1: 'PC200-8-1234',
      columnName2: '',
      columnName3: 'カスタマイズ用途定義B',
      columnName4: '',
      columnName5: '',
    }];
    this._lists.visibleList = this._lists.originList;

  }

}
