import { ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AbstractIndexComponent } from 'app/components/shared/abstract-component/abstract-index.component';
import { CdRequestNumberTabService } from 'app/services/customize_data_request/request-number/cd-request-number-tab/cd-request-number-tab.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { ModalService } from 'app/services/shared/modal.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import { Fields, Lists, Resources, TableHeader } from 'app/types/common';
import { CarCustomizeDataPerformances } from 'app/types/customize-request-number-list';
import * as _ from 'lodash';
import { CdRequestNumberListComponent } from '../request-number-list/cd-request-number-list.component';

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

    @Input() override thList: any;
    @Input() override labels: any;
    @Input() override resource: any;
    @Input() carIds: any;


    resources: Resources;
    requestNumberDefinitionIds: string;
    carId: string;

    @ViewChild('cdExpectedTrafficConfirmModalContent', { static: false }) cdExpectedTrafficConfirmModalContent: TemplateRef<null>;
    @ViewChild('cdRequestNumberListModalContent', { static: false }) cdRequestNumberListModalContent: TemplateRef<null>;
    @ViewChild('inputDataAllCancelConfirmModalContent', { static: false }) inputDataAllCancelConfirmModalContent: TemplateRef<null>;
    @ViewChild('inputDataCancelConfirmModalContent', { static: false }) inputDataCancelConfirmModalContent: TemplateRef<null>;
    @ViewChild('cdRequestNumberSelectListModalContent', { static: false }) cdRequestNumberSelectListModalContent: TemplateRef<null>;
    @ViewChild('cdRequestNumberComfirmModalContent', { static: false }) cdRequestNumberComfirmModalContent: TemplateRef<null>;
    @ViewChild(CdRequestNumberListComponent) requestNumberListComponent: CdRequestNumberListComponent;

    initList: any = {
        visibleList: [] as any[],
        originList: [] as any[],
    };
    rowHeight: number = 35;
    data: any = [];
    initResource: any;
    fields: Fields;
    listSendNo: any = [];
    thListRequestNumberSelectList: any = [];
    thListRequestNumber: any = [];
    sumAssumptionDataValue: number = 0;

    _searchParams: any = {
        "car_identification": {
            "car_ids": [],
        }
    };

    public listData: any[];
    public listBackup: any[];
    public cdRequestNumberConfirmThLists: TableHeader[];

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
        this._searchParams.car_identification.car_ids = this.carIds;
        this.requestHeaderParams['X-Sort'] = sort_key || '';
        const p = _.cloneDeep(this._searchParams);
        const res = await this.cdRequestNumberTabService.fetchCarIndexList(
            p,
            this.requestHeaderParams
        );
        // this.lists.originList = res.result_data.cars;
        // this.lists.visibleList = this.lists.originList;

        console.log("fetchList", res);

        this.listData = res.result_data.cars;

        let data: any = [];
        res.result_data.cars.forEach((element: any) => {
            console.log(element);
            let car: any = {};
            car["request_number_car_identification_header_label"] = element.car_identification.model + "-" + element.car_identification.type_rev + "-" + element.car_identification.serial;
            car["request_number_customize_usage_definitions_header_label"] = element.customize_usage_definitions;
            // car["request_number_customize_definitions_header_label"] = [];
            car["request_number.cars.communication_channel.name"] = element.communication_channel.name; // 通信機種名称
            car["request_number_discard_edits_header_label"] = "";
            car["request_number_car_identification_id"] = element.car_identification.id; // 車両ID
            data.push(car);
        });

        this._fillLists(res.result_header, data);
        this.lists.originList = data;
        this.lists.visibleList = data;

        this.listBackup = _.cloneDeep(data);

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
        this.thListRequestNumber = this._createThList(res.cdExpectedTrafficListFields);
        this.cdRequestNumberConfirmThLists = this._createThList(res.cdRequestNumberConfirmFields);

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
                name: "request_number_car_identification_header_label",
                formatKey: "request_number_car_identification_header_label",
            }
        );
        this.thList.push(
            {
                label: "",
                name: "request_number_customize_usage_definitions_header_label",
                formatKey: "request_number_customize_usage_definitions_header_label",
            }
        );
        this.thList.push(
            {
                label: "",
                name: "request_number_customize_definitions_header_label",
                formatKey: "request_number_customize_definitions_header_label",
            }
        );
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

    /**
     * 通信量確認 ボタン押下
     */
    sendData(): void {

        this.setData();
        console.log("data", this.data);

        this.modalService.open(
            {
                title: this.labels.expected_traffic_confirm_title,
                labels: this.labels,
                content: this.cdExpectedTrafficConfirmModalContent,
                closeBtnLabel: this.labels.close,
                close: () => {
                    console.log("close");
                },
            },
            {
                size: 'xl',
            }
        );
    }

    setData(): void {
        this.data = [];

        this.lists.visibleList.forEach((element: any, index: number) => {
            console.log(element);
            let car: any = {};
            car["request_number.cars.car_identification.model_type_rev_serial"] = element.request_number_car_identification_header_label; //車両
            car["request_number.cars.communication_channel.name"] = element['request_number.cars.communication_channel.name']; // 通信機種類
            car["request_number.cars.customize_usage_definitions.customize_usage_definition"] = element.request_number_customize_usage_definitions_header_label;

            let car_assumption_data_value = this.getSumCarAssumptionDataValue(index);
            car["car_assumption_data_value"] = car_assumption_data_value; // 合計(車両毎)[KB]
            this.data.push(car);
        });
        console.log("setData", this.data);

    }

    printInfoCar(data: any): string {
        let result = "";
        // console.log("title", data);
        return result;
    }

    /**
     * カスタマイズ用途定義名 押下
     * @param data
     */
    handleCustomizeUsageDefinitionsClick(data: any, item: any, carIndex: number, customizeUsageDefinitionsIndex: number): void {


        let id = data.request_number_car_identification_id;
        // let carIndex = -1;
        // let customizeUsageDefinitionsIndex = -1;

        // this.listData.forEach((element,index) => {
        //     if(element.car_identification.id == id) carIndex = index;
        // });
        // this.listData[carIndex].customize_usage_definitions.forEach((element: any, index: any) => {
        //     if(element.id == item.id) customizeUsageDefinitionsIndex = index;
        // });

        this.carId = id;

        this.modalService.open(
            {
                title: this.labels.request_number_select_title,
                labels: this.labels,
                content: this.cdRequestNumberListModalContent,
                closeBtnLabel: this.labels.cancel,
                okBtnLabel: this.labels.ok_btn,
                enableOk: false,
                ok: () => {
                    console.log("response data: " + JSON.stringify(this.requestNumberListComponent.responseData));
                    let requestNumberList = this.requestNumberListComponent.responseData;

                    // Adding list of send no to the list of data
                    let customizeDefinitionsIndex = -1;
                    this.listData[carIndex].customize_usage_definitions[customizeUsageDefinitionsIndex].customize_definitions.forEach((element: any, index: any) => {
                        if (element.id == requestNumberList.customize_definition_id) customizeDefinitionsIndex = index;
                    });

                    let listSendNo: any = [];
                    if (requestNumberList) {
                        if (requestNumberList.car_customize_data_performances.length > 0) {
                            requestNumberList.car_customize_data_performances.forEach((element: CarCustomizeDataPerformances) => {
                                let itemSendNo = {
                                    'send_no': element.send_no,
                                };
                                console.log("element", element);
                                listSendNo.push(itemSendNo);
                            });
                        }
                    }

                    // _.set(this.listData[carIndex].customize_usage_definitions[customizeUsageDefinitionsIndex].customize_definitions[customizeDefinitionsIndex],'sends_no', listSendNo);

                    _.set(this.lists.visibleList[carIndex].request_number_customize_usage_definitions_header_label[customizeUsageDefinitionsIndex].customize_definitions[customizeDefinitionsIndex], 'assumption_data_value', requestNumberList.assumption_data_value);
                    _.set(this.lists.visibleList[carIndex].request_number_customize_usage_definitions_header_label[customizeUsageDefinitionsIndex].customize_definitions[customizeDefinitionsIndex], 'sends_no', listSendNo);

                    console.log("lists: ", this.lists);

                    this.sumAssumptionDataValue = 0;
                    this.sumAssumptionDataValue = this.getSumAssumptionDataValue(carIndex, customizeUsageDefinitionsIndex);

                    let sumCarAssumptionDataValue = 0;
                    sumCarAssumptionDataValue = this.getSumCarAssumptionDataValue(carIndex);

                    _.set(this.lists.visibleList[carIndex], 'car_assumption_data_value', sumCarAssumptionDataValue);
                    console.log("sumAssumptionDataValue", this.sumAssumptionDataValue);
                },
            },
            {
                size: 'xl',
            });
    }

    /**
     * 送信件数 押下
     * @param data
     * @param customizeUsageDefinitionsIndex
     * @param customizeDefinitionsIndex
     */
    handleSendClick(data: any, customizeUsageDefinitionsIndex: number, customizeDefinitionsIndex: number): void {
        console.log("handleSendClick: ", data);
        this.listSendNo = _.get(data.request_number_customize_usage_definitions_header_label[customizeUsageDefinitionsIndex].customize_definitions[customizeDefinitionsIndex], "sends_no");
        console.log("this.listSendNo", this.listSendNo);
        this.thListRequestNumberSelectList = [];
        this.thListRequestNumberSelectList.push(
            {
                label: this.labels.request_number_header_label,
                name: "request_number_header_label",
                formatKey: "request_number_header_label",
                displayable: true,
            }
        );

        this.modalService.open(
            {
                title: this.labels.request_number_select_title,
                labels: this.labels,
                content: this.cdRequestNumberSelectListModalContent,
                closeBtnLabel: this.labels.close,
                okBtnLabel: this.labels.ok_btn,
            },
            {
                size: 'sm',
            });
    }

    /**
     * 全編集破棄 ボタン押下
     */
    handleDiscardAllEdits(): void {

        this.modalService.open(
            {
                title: this.labels.request_number_select_title,
                labels: this.labels,
                content: this.inputDataAllCancelConfirmModalContent,
                closeBtnLabel: this.labels.cancel,
                okBtnLabel: this.labels.ok_btn,
                ok: () => {
                    console.log("response data: ");
                    this.lists.visibleList = _.cloneDeep(this.listBackup);
                    this.lists.originList = _.cloneDeep(this.listBackup);
                    this.sumAssumptionDataValue = 0;
                },
            },
            {
                size: 'sm',
            });
    }

    /**
     * 編集破棄 ボタン押下
     * @param data
     * @param carIndex
     * @param customizeUsageDefinitionsIndex
     * @param customizeDefinitionsIndex
     */
    handleInputDataCancel(data: any, carIndex: number, customizeUsageDefinitionsIndex: number, customizeDefinitionsIndex: number): void {

        this.modalService.open(
            {
                title: this.labels.request_number_select_title,
                labels: this.labels,
                content: this.inputDataCancelConfirmModalContent,
                closeBtnLabel: this.labels.cancel,
                okBtnLabel: this.labels.ok_btn,
                ok: () => {
                    _.set(this.lists.visibleList[carIndex].request_number_customize_usage_definitions_header_label[customizeUsageDefinitionsIndex].customize_definitions[customizeDefinitionsIndex], 'assumption_data_value', 0);
                    _.set(this.lists.visibleList[carIndex].request_number_customize_usage_definitions_header_label[customizeUsageDefinitionsIndex].customize_definitions[customizeDefinitionsIndex], 'sends_no', []);
                    this.sumAssumptionDataValue = 0;
                    this.sumAssumptionDataValue = this.getSumAssumptionDataValue(carIndex, customizeUsageDefinitionsIndex);
                    console.log("this.sumAssumptionDataValue", this.sumAssumptionDataValue);
                },
            },
            {
                size: 'sm',
            });
    }

    /**
     * データ送信要求 ボタン押下
     */
    expectedTrafficConfirm(): void {
        this.modalService.open(
            {
                title: this.labels.confirm_title,
                labels: this.labels,
                content: this.cdRequestNumberComfirmModalContent,
                closeBtnLabel: this.labels.cancel,
                okBtnLabel: this.labels.ok_btn,
                ok: () => {
                   console.log("OK");
                },
            },
            {
                size: 'lg',
            }
        );
    }

    /**
     * ①非表示で保持しているカスタマイズ定義の想定通信量（合計）と
     * ②入力した上限通信量(KB)を比較し超過した際に③メッセージの表示を行う
     * @param carIndex
     * @param customizeUsageDefinitionsIndex
     */
    getSumAssumptionDataValue(carIndex: number, customizeUsageDefinitionsIndex: number): number {
        let sumAssumptionDataValue = 0;
        this.lists.visibleList[carIndex].request_number_customize_usage_definitions_header_label[customizeUsageDefinitionsIndex].customize_definitions.forEach((element: any, index: any) => {
            console.log(element.assumption_data_value)
            if (element.assumption_data_value) {
                sumAssumptionDataValue += element.assumption_data_value;
            }
        });
        return sumAssumptionDataValue / 1024;
    }

    /**
     * 合計(車両毎)[KB]を計算
     * @param carIndex
     * @param customizeUsageDefinitionsIndex
     * @returns
     */
    getSumCarAssumptionDataValue(carIndex: number): number {
        let sumCarAssumptionDataValue = 0;
        this.lists.visibleList[carIndex].request_number_customize_usage_definitions_header_label.forEach((customizeUsageDefinition: any) => {
            if (customizeUsageDefinition.customize_definitions) {
                customizeUsageDefinition.customize_definitions.forEach((customizeDefinitions: any) => {
                    if (customizeDefinitions.assumption_data_value) {
                        sumCarAssumptionDataValue += customizeDefinitions.assumption_data_value;
                    }
                });
            }
        });
        return sumCarAssumptionDataValue / 1024;
    }
}
