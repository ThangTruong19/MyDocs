import { ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AbstractIndexComponent } from 'app/components/shared/abstract-component/abstract-index.component';
import { CdRequestNumberTabService } from 'app/services/customize_data_request/request-number/cd-request-number-tab/cd-request-number-tab.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { ModalService } from 'app/services/shared/modal.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import { Resources } from 'app/types/common';

@Component({
  selector: 'app-cd-request-number-tab',
  templateUrl: './cd-request-number-tab.component.html',
  styleUrls: ['./cd-request-number-tab.component.scss'],
})
export class CdRequestNumberTabComponent
  implements OnInit {
  @Input() lists: any;
  @Input() params: any;
  @Input() thList: any;
  @Input() labels: any;
  @Input() resource: any;

  @ViewChild('cdExpectedTrafficConfirmModalContent', { static: false }) cdExpectedTrafficConfirmModalContent: TemplateRef<null>;
  @ViewChild('cdRequestNumberListModalContent', { static: false }) cdRequestNumberListModalContent: TemplateRef<null>;

  data: any = [];
  thListRequestNumber: any = [
    {
      "id": "1",
      "label": "車両",
      "name": "request_number.cars.car_identification.model_type_rev_serial",
      "shortName": "request_number_cars_car_identification_model_type_rev_serial",
      "displayable": true,
      "dataKey": null,
      "confirmKey": null,
      "sortKey": "request_number.cars.car_identification.model_type_rev_serial",
      "sortable": true,
      "formatKey": "cars.car_identification.model_type_rev_serial",
      "optional": false,
      "columnStyle": "width:15%"
    },
    {
      "id": "2",
      "label": "通信機種類",
      "name": "request_number.cars.communication_channel.name",
      "shortName": "request_number_cars_communication_channel_name",
      "displayable": true,
      "dataKey": null,
      "confirmKey": null,
      "sortKey": "request_number.cars.communication_channel.name",
      "sortable": true,
      "formatKey": "cars.communication_channel.name",
      "optional": false,
      "columnStyle": "width:10%"
    },
    {
      "id": "3",
      "label": "カスタマイズ用途定義",
      "name": "request_number.cars.customize_usage_definitions.customize_definitions.customize_usage_definition_name",
      "shortName": "request_number_cars_customize_usage_definitions_customize_definitions_customize_usage_definition_name",
      "displayable": true,
      "dataKey": null,
      "confirmKey": null,
      "sortKey": "request_number.cars.customize_usage_definitions.customize_definitions.customize_usage_definition_name",
      "sortable": true,
      "formatKey": "cars.customize_usage_definitions.customize_definitions.customize_usage_definition_name",
      "optional": false,
      "columnStyle": "width:15%"
    },
    {
      "id": "4",
      "label": "カスタマイズ定義",
      "name": "request_number.cars.customize_usage_definitions.customize_definitions.customize_definition_name",
      "shortName": "request_number_cars_customize_usage_definitions_customize_definitions_customize_definition_name",
      "displayable": true,
      "dataKey": null,
      "confirmKey": null,
      "sortKey": "request_number.cars.customize_usage_definitions.customize_definitions.customize_definition_name",
      "sortable": true,
      "formatKey": "cars.customize_usage_definitions.customize_definitions.customize_definition_name",
      "optional": false,
      "columnStyle": "width:10%"
    },
    {
      "id": "5",
      "label": "選択中件数",
      "name": "request_number.cars.xxx.a01",
      "shortName": "request_number_cars_xxx_a01",
      "displayable": true,
      "dataKey": null,
      "confirmKey": null,
      "sortKey": "request_number.cars.xxx.a01",
      "sortable": true,
      "formatKey": "cars.xxx.a01",
      "optional": false,
      "columnStyle": "width:10%"
    },
    {
      "id": "6",
      "label": "通信量[KB/件]",
      "name": "request_number.cars.xxx.a02",
      "shortName": "request_number_cars_xxx_a02",
      "displayable": true,
      "dataKey": null,
      "confirmKey": null,
      "sortKey": "request_number.cars.xxx.a02",
      "sortable": true,
      "formatKey": "cars.xxx.a02",
      "optional": false,
      "columnStyle": "width:10%"
    },
    {
      "id": "7",
      "label": "合計(車両毎)[KB]",
      "name": "request_number.cars.xxx.a03",
      "shortName": "request_number_cars_xxx_a03",
      "displayable": true,
      "dataKey": null,
      "confirmKey": null,
      "sortKey": "request_number.cars.xxx.a03",
      "sortable": true,
      "formatKey": "cars.xxx.a03",
      "optional": false,
      "columnStyle": "width:15%"
    },
    {
      "id": "8",
      "label": "合計(全体)[KB]",
      "name": "request_number.cars.xxx.a04",
      "shortName": "request_number_cars_xxx_a04",
      "displayable": true,
      "dataKey": null,
      "confirmKey": null,
      "sortKey": "request_number.cars.xxx.a04",
      "sortable": true,
      "formatKey": "cars.xxx.a04",
      "optional": false,
      "columnStyle": "width:15%"
    }
  ];

  constructor(
    nav: NavigationService,
    title: Title,
    header: CommonHeaderService,
    router: Router,
    private modalService: ModalService,
    cdRef: ChangeDetectorRef,
    private cdRequestNumberTabService: CdRequestNumberTabService
  ) {
    // super(nav, title, router, cdRef, header);
  }
  ngOnInit(): void {
    console.log("app-cd-request-number-tab lists", this.lists);
  }

  // protected async fetchList(sortKey?: string): Promise<any> {}
  // protected async _fetchDataForInitialize(): Promise<any> {
  //     const res = await this.cdRequestNumberTabService.fetchCarInitData();
  //     this.initialize(res);
  //     this.labels = res.label;
  // }

  sendData(): void {

    this.setData();
    console.log("data", this.data);

    // this.thListCustomizeDataRequest = [];
    // const opt: TableOptions = {
    //   columnStyles: [
    //     'width:18%', 'width:10%', 'width:10%'
    //     , 'width:12%', 'width:12%', 'width:19%'
    //     , 'width:19%'
    //   ]
    // };
    // let thList = this._createThList(this.fields, opt);
    // console.log("this.thListCustomizeDataRequest", thList);

    // for (let i = 0; i < thList.length - 3; i++) {
    //   this.thListCustomizeDataRequest.push(thList[i]);
    // }

    this.modalService.open(
      {
        title: this.labels.confirm_title,
        labels: this.labels,
        content: this.cdExpectedTrafficConfirmModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
        ok: () => {
          console.log("OK");
        },
      },
      {
        size: 'xl',
      }
    );
  }

  setData(): void {
    this.data = [];
    for (let item of this.lists.visibleList) {

      let model_type_rev_serial = item.car_identification.model + "-" + item.car_identification.type_rev + "-" + item.car_identification.serial;

      for (let customizeUsageDefinitions of item.customize_usage_definitions) {
        for (let customizeDefinitions of customizeUsageDefinitions.customize_definitions) {
          let car: any = {};
          car["request_number.cars.car_identification.model_type_rev_serial"] = model_type_rev_serial;
          car["request_number.cars.communication_channel.name"] = item.communication_channel.name;
          car["request_number.cars.customize_usage_definitions.customize_definitions.customize_usage_definition_name"] = customizeUsageDefinitions.name;
          car["request_number.cars.customize_usage_definitions.customize_definitions.customize_definition_name"] = customizeDefinitions.name;
          car["request_number.cars.xxx.a01"] = '1件';
          car["request_number.cars.xxx.a02"] = 'xx';
          car["request_number.cars.xxx.a03"] = 3;
          car["request_number.cars.xxx.a04"] = 1000;
          this.data.push(car);
        }
      }
    }
  }

  // TODO: PLACEHOLDER METHOD
  trasmissionNumbers(): void{
    this.modalService.open({
      title: this.labels.request_number_select_title,
      labels: this.labels,
      content: this.cdRequestNumberListModalContent,
      closeBtnLabel: this.labels.cancel,
      okBtnLabel: this.labels.ok_btn,
      ok: () => {
        console.log("OK");
      },
    },
    {
      size: 'xl',
    })
  }
}
