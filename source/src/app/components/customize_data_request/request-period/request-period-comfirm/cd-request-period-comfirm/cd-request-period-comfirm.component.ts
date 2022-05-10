import { Component, Input, OnInit } from '@angular/core';
import { TableMergeColumn } from 'app/types/common';

/**
 * カスタマイズデータ送信要求確認（期間指定）モーダル
 */
@Component({
  selector: 'app-cd-request-period-comfirm',
  templateUrl: './cd-request-period-comfirm.component.html',
  styleUrls: ['./cd-request-period-comfirm.component.scss']
})
export class CdRequestPeriodComfirmComponent implements OnInit {

  @Input() data: any;
  @Input() thList: any;
  @Input() labels: any;

  lists = {
    visibleList: [] as any[],
    originList: [] as any[],
  };

  sortingParams = {
    sort: '',
    sortLabel: '',
  };

  public mergeColumns: TableMergeColumn[] = [];
  public isFetching = false;

  constructor() { }

  ngOnInit(): void {
    console.log("data", this.data);
    console.log("thList", this.thList);
    this.isFetching = false;
    this.mergeColumns = [
      {
        groupByColumns: ['request_period.car.data_amount_upper_limit_active_kind'],
        targetColumn: 'request_period.car.data_amount_upper_limit_active_kind'
      },  // 「通信量上限設定」列のマージ設定
      {
        groupByColumns: ['request_period.car.data_amount_upper_limit'],
        targetColumn: 'request_period.car.data_amount_upper_limit'
      },  // 「上限通信量[KB]」列のマージ設定
      {
        groupByColumns: ['request_period.car.kind'],
        targetColumn: 'request_period.car.kind'
      },  // 「上限通信量[KB]」列のマージ設定
    ];

    this.lists.originList = this.data;
    this.lists.visibleList = this.lists.originList;


  }
}
