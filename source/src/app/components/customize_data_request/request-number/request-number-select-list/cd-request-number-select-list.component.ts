import { Component, Input, OnInit } from '@angular/core';

/**
 * 選択済み送信番号一覧
 * @author van-lan
 */
@Component({
  selector: 'app-cd-request-number-select-list',
  templateUrl: './cd-request-number-select-list.component.html',
  styleUrls: ['./cd-request-number-select-list.component.scss']
})
export class CdRequestNumberSelectListComponent implements OnInit {
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
    }
    sortableThList: string[] = [];

  constructor() { }

  ngOnInit(): void {
    this.lists.originList = this.data;
    this.lists.visibleList = this.lists.originList;

  }

}
