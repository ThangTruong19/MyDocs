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

  lists = {
    visibleList: [] as any[],
    originList: [] as any[],
  };

  @Input() data: any;
  @Input() labels: any;
  @Input() thList: any;

  sortingParams = {
    sort: '',
    sortLabel: '',
  };

  constructor() { }

  ngOnInit(): void {
    console.log("data", this.data);
    console.log("thList", this.thList);

    this.lists.originList = this.data;
    this.lists.visibleList = this.lists.originList;
  }

}
