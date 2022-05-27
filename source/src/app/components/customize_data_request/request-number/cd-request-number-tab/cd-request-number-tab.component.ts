import { ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AbstractIndexComponent } from 'app/components/shared/abstract-component/abstract-index.component';
import { CdRequestNumberTabService } from 'app/services/customize_data_request/request-number/cd-request-number-tab/cd-request-number-tab.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { ModalService } from 'app/services/shared/modal.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import { Fields, Resources } from 'app/types/common';
import * as _ from 'lodash';

/**
 * 送信要求（送信番号単位）タブ
 * @author chau-phu
 */
@Component({
    selector: 'app-cd-request-number-tab',
    templateUrl: './cd-request-number-tab.component.html',
    styleUrls: ['./cd-request-number-tab.component.scss'],
})
export class CdRequestNumberTabComponent extends AbstractIndexComponent implements OnInit {
    @Input() override params: any;
    @Input() override thList: any;
    @Input() override labels: any;
    @Input() override resource: any;
    resources: Resources;

    @ViewChild('cdExpectedTrafficConfirmModalContent', { static: false }) cdExpectedTrafficConfirmModalContent: TemplateRef<null>;
    @ViewChild('cdRequestNumberListModalContent', { static: false }) cdRequestNumberListModalContent: TemplateRef<null>;

    initList: any = {
        visibleList: [] as any[],
        originList: [] as any[],
    };
    data: any = [];
    initResource: any;
    fields: Fields;
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

    _searchParams: any = {
        "car_identification": {
            "car_ids": [],
        }
    };

    constructor(
        nav: NavigationService,
        title: Title,
        header: CommonHeaderService,
        router: Router,
        override modalService: ModalService,
        cdRef: ChangeDetectorRef,
        private cdRequestNumberTabService: CdRequestNumberTabService
    ) {
        super(nav, title, router, cdRef, header);
    }

    protected async fetchList(sort_key?: string): Promise<any> {
        this.isFetching = true;
        this.requestHeaderParams['X-Sort'] = sort_key || '';
        const p = _.cloneDeep(this._searchParams);
        const res = await this.cdRequestNumberTabService.fetchCarIndexList(
            p,
            this.requestHeaderParams
        );
        // this.lists.originList = res.result_data.cars;
        // this.lists.visibleList = this.lists.originList;

        console.log("fetchList", res);
        // const list = this._formatList(
        //     res.result_data.cars,
        //     this.thList
        //   );
        let tempList = [{
            'id': 1,
            'name': '生産詳細データ'

        }];


        let data: any = [];
        res.result_data.cars.forEach((element: any) => {
            console.log(element);
            let car: any = {};
            car["request_number.cars.car_identification.model_type_rev_serial"] = element.car_identification.model + "-" + element.car_identification.type_rev + "-" + element.car_identification.serial;
            car["request_number.cars.customize_usage_definitions.name"] = element.customize_usage_definitions;
            car["request_number_customize_definitions_header_label"] = [];
            car["request_number_send_count_header_label"] = "";
            car["request_number_discard_edits_header_label"] = "";
            data.push(car);
        });

        this._fillLists(res.result_header, data);
        this.lists.originList = data;
        this.lists.visibleList = data;
        this.isFetching = false;
        this._afterFetchList();


        console.log("app-cd-request-number-tab:initList", this.lists);
    }

    protected async _fetchDataForInitialize(): Promise<any> {
        const res = await this.cdRequestNumberTabService.fetchCarInitData();
        this.resources = res;
        this.initialize(res);

        this.labels = res.label;
        this.initResource = res.resource;
        this.resource = _.cloneDeep(this.initResource);
        this._setTitle();
        this._updateFields(res.fields);
        this._reflectPageParams();
        // const list = this._formatList(
        //   data,
        //   this.thList
        // );


        console.log("app-cd-request-number-tab", res);
    }

    /**
     * 指定項目を更新
     * @param fields 指定項目
     */
    protected _updateFields(fields: any): void {
        this.fields = fields;
        this.thList = this._createThList(fields);
        this.thList.push(
            {
                label: "",
                name: "request_number_customize_definitions_header_label",
                formatKey: "request_number_customize_definitions_header_label",
            }
        )
        this.thList.push(
            {
                label: "",
                name: "request_number_send_count_header_label",
                formatKey: "request_number_send_count_header_label",
            }
        );
        this.thList.push(
            {
                label: "",
                name: "request_number_discard_edits_header_label",
                formatKey: "request_number_discard_edits_header_label",
            }
        );
        this.sortableThList = this.sortableThLists(this.thList);
        this._reflectXFields(fields);
        console.log("app-cd-request-number-tab:thList", this.thList);
        console.log("app-cd-request-number-tab:lists", this.lists);

    }

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

            let model_type_rev_serial = item.request_number.cars.car_identification.model_type_rev_serial;

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

    printInfoCar(data: any): string {
        let result = "";
        console.log("title", data);
        return result;
    }

    /**
     * カスタマイズ用途定義名 押下
     * @param data
     */
    handleCustomizeUsageDefinitionsClick(data: any, item: any): void {
        console.log("row select: ", data, item);
    }

    /**
     * 送信件数 押下
     * @param data
     */
    handleSendClick(data: any): void {
        console.log("row select: ", data);
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
