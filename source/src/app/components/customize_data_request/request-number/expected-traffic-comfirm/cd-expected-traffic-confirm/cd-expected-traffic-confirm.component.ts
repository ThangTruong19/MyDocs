import { Component, EventEmitter, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AbstractBaseComponent } from 'app/components/shared/abstract-component/abstract-base.component';
import { ApiService } from 'app/services/api/api.service';
import { CdExpectedTrafficComfirmService } from 'app/services/customize_data_request/request-period/cd-request-period-tab/request-number/expected-traffic-comfirm/cd-expected-traffic-confirm/cd-expected-traffic-confirm.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-cd-expected-traffic-confirm',
  templateUrl: './cd-expected-traffic-confirm.component.html',
  styleUrls: ['./cd-expected-traffic-confirm.component.scss']
})
export class CdExpectedTrafficConfirmComponent implements OnInit {

  lists = {
    visibleList: [] as any[],
    originList: [] as any[],
  };
  compiledResultCountMessage: (src: {
    total: number;
    success: number;
    fail: number;
  }) => string;
  thList = [
    {
      label: '車両',
      name: 'columnName1',
      displayable: true,
    },
    {
      label: '通信機種類',
      name: 'columnName2',
      displayable: true,
    },
    {
      label: 'カスタマイズ用途定義',
      name: 'columnName3',
      displayable: true,
    },
    {
      label: 'カスタマイズ定義',
      name: 'columnName4',
      displayable: true,
    },
    {
      label: '選択中件数',
      name: 'columnName5',
      displayable: true,
    },
    {
      label: '通信量[KB/件]',
      name: 'columnName6',
      displayable: true,
    },
    {
      label: '合計(車両毎)[KB]',
      name: 'columnName7',
      displayable: true,
    },
    {
      label: '合計(全体)[KB]',
      name: 'columnName8',
      displayable: true,
    },
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
