import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-cd-request-period-comfirm',
  templateUrl: './cd-request-period-comfirm.component.html',
  styleUrls: ['./cd-request-period-comfirm.component.scss']
})
export class CdRequestPeriodComfirmComponent implements OnInit {

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
      label: '通信量上限設定',
      name: 'columnName2',
      displayable: true,
    },
    {
      label: '上限通信量[KB]',
      name: 'columnName3',
      displayable: true,
    },
    {
      label: '要求単位',
      name: 'columnName4',
      displayable: true,
    },
    {
      label: 'カスタマイズ用途定義',
      name: 'columnName5',
      displayable: true,
    },
    {
      label: '開始日',
      name: 'columnName6',
      displayable: true,
    },
    {
      label: '終了日',
      name: 'columnName7',
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
      columnName2: '有効',
      columnName3: 'XXXX',
      columnName4: '用途定義単位',
      columnName5: 'カスタマイズ用途定義A',
      columnName6: '2020/6/1 00:00:00.000',
      columnName7: '2020/6/30 00:00:00.000',
    }, {
      columnName1: 'PC200-8-1234',
      columnName2: '',
      columnName3: '',
      columnName4: '',
      columnName5: 'カスタマイズ用途定義B',
      columnName6: '2020/6/1 00:00:00.000',
      columnName7: '2020/6/30 00:00:00.000',
    }];
    this.lists.visibleList = this.lists.originList;

  }

  cancel(): void {
    console.log("Cancel");
  }

  async ok(): Promise<void> {
    console.log("OK");
    let params: any = {
      request_route_kind: "0",
      data_amount_upper_limit: "D85PX-15E0-A12345", //上限通信量[KB]
      cars: [
        {
          "model_type_rev_serial": "D85PX-15E0-A12345",
          "customize_definitions": [
            {
              "customize_definition_id": "1234567890123456789",
              "send_nos": [
                "20170124T045040Z000001"
              ]
            }
          ]
        }
      ]
    };

  }


}
