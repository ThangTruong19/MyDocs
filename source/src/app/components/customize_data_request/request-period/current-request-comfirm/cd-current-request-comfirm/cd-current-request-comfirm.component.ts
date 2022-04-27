import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cd-current-request-comfirm',
  templateUrl: './cd-current-request-comfirm.component.html',
  styleUrls: ['./cd-current-request-comfirm.component.scss']
})
export class CdCurrentRequestComfirmComponent implements OnInit {

  lists = {
    visibleList: [] as any[],
    originList: [] as any[],
  };

  thList = [
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
    }
  ];

  sortingParams = {
    sort: '',
    sortLabel: '',
  };

  constructor() { }

  ngOnInit(): void {
    console.log(this.lists);
    this.lists.originList = [{
      columnName1: 'PC200-8-1234',
      columnName2: '用途定義単位',
      columnName3: 'カスタマイズ用途定義A',
    }, {
      columnName1: 'PC200-8-1234',
      columnName2: '',
      columnName3: 'カスタマイズ用途定義B',
    }];
    this.lists.visibleList = this.lists.originList;

  }

}
