import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AbstractIndexComponent } from 'app/components/shared/abstract-component/abstract-index.component';
import { UserSettingService } from 'app/services/api/user-setting.service';
import { CsDetailService } from 'app/services/customize_setting/cs-detail.service';
import { CustomizeSettingService } from 'app/services/customize_setting/customize-setting.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { DatePickerService } from 'app/services/shared/date-picker.service';
import { ModalService } from 'app/services/shared/modal.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import { Resources, TableHeader, TableMergeColumn } from 'app/types/common';
import * as _ from 'lodash';

@Component({
    selector: 'app-cs-expected-traffic-confirm',
    templateUrl: './cs-expected-traffic-confirm.component.html',
    styleUrls: ['./cs-expected-traffic-confirm.component.scss']
})
export class CsExpectedTrafficConfirmComponent extends AbstractIndexComponent implements OnInit {
    @Input()
    public carId: string;
    @Input()
    public resources: Resources;
    @Input()
    public initThList1: TableHeader[];
    @Input()
    public initThList2: TableHeader[];
    @Input()
    public inputTableData: any;

    visibleErr: boolean = false;

    dataTable1: any[];
    dataTable2: any[];

    thList1: TableHeader[] = [];
    thList2: TableHeader[] = [];
    apiTableData: any[];
    dispTableData: any[];

    _searchParams = {
        car_identification: {
            car_ids: [] as any[]
        }
    };

    public lists1: { visibleList: any[]; originList: any[] } = {
        visibleList: [],
        originList: []
    };

    public lists2: { visibleList: any[]; originList: any[] } = {
        visibleList: [],
        originList: []
    };

    public sortableThList1: string[] = [];
    public sortableThList2: string[] = [];

    public mergeColumns1: TableMergeColumn[] = [];
    public mergeColumns2: TableMergeColumn[] = [];

    constructor(
        nav: NavigationService,
        title: Title,
        header: CommonHeaderService,
        router: Router,
        private modal: ModalService,
        private cdRef: ChangeDetectorRef,
        private customSettingService: CustomizeSettingService,
        protected userSettingService: UserSettingService,
        protected datePickerService: DatePickerService,
        protected csDetailService: CsDetailService) {
        super(nav, title, router, cdRef, header, modal);
        this.shouldDestroyNavigation = false;
    }

    protected async fetchList(sortKey?: string): Promise<any> {
        this.requestHeaderParams['X-Sort'] = sortKey || ''

        // １.画面の初期表示で車両カスタマイズ用途定義詳細取得APIからデータ取得
        const res = await this.csDetailService.fetchIndexList(
            this.carId,
            this.requestHeaderParams
        );
        this.apiTableData = res.result_data.customize_usage_definitions.reduce((acc: any, cur: any) => {
            const contents = _.get(cur, 'customize_usage_definition.customize_definitions').map((element: any) => {
                return {
                    customize_usage_definition: {
                        customize_usage_definition_id: cur.customize_usage_definition.customize_usage_definition_id,
                        customize_usage_definition_name: cur.customize_usage_definition.customize_usage_definition_name,
                        customize_definitions: {
                            customize_definition_id: element.customize_definition_id,
                            customize_definition_name: element.customize_definition_name,
                            status: element.status,
                            active_kind: element.active_kind,
                            assumption_data_value_header: element.assumption_data_value_header,
                            assumption_data_value: element.assumption_data_value,
                            aggregation_opportunity_kind: element.aggregation_opportunity_kind,
                            send_opportunity_kind: element.send_opportunity_kind,
                            process_type: element.process_type
                        }
                    }
                }
            })
            acc.push(...contents)
            return acc
        }, []);

        // ２.車両カスタマイズ用途定義詳細取得APIのレスポンスから下記条件のデータの想定データ量（単位：KB）の合計を算出する
        let apiTotalTraffic = this._calculateTotalTraffic(this.apiTableData);

        // 3.1で取得したデータをカスタマイズ設定詳細から連携されたデータで同データがあれば上書きを行う
        let callerTableData = this.inputTableData.reduce((acc: any, cur: any) => {
            const contents = _.get(cur, 'customize_usage_definition.customize_definitions').map((element: any) => {
                return {
                    customize_usage_definition: {
                        customize_usage_definition_id: cur.customize_usage_definition.customize_usage_definition_id,
                        customize_usage_definition_name: cur.customize_usage_definition.customize_usage_definition_name,
                        edit_status: cur['edit_status'],
                        customize_definitions: {
                            customize_definition_id: element.customize_definition_id,
                            customize_definition_name: element.customize_definition_name,
                            status: element.status,
                            active_kind: element.active_kind,
                            assumption_data_value_header: element.assumption_data_value_header,
                            assumption_data_value: element.assumption_data_value,
                            aggregation_opportunity_kind: element.aggregation_opportunity_kind,
                            send_opportunity_kind: element.send_opportunity_kind,
                            process_type: element.process_type
                        }
                    }
                }
            })
            acc.push(...contents)
            return acc
        }, []);

        // 4.3の結果から下記条件のデータの想定データ量（単位：KB）の合計を算出する(合計通信量(要求後)[KB/月]表示)
        this.dispTableData = this._overwriteList(this.apiTableData, callerTableData);
        let dispTotalTraffic = this._calculateTotalTraffic(this.dispTableData);

        // 5.4の合計値－2の合計値(差分[KB])
        let difference = Math.round(dispTotalTraffic - apiTotalTraffic);

        // 6.3の結果から"90"以外かつ、有効区分が"1"のもののみ画面に表示
        this.dispTableData = this.dispTableData.filter((element: any) => element.customize_usage_definition.customize_definitions.status != '90' &&
            element.customize_usage_definition.customize_definitions.active_kind == '1');

        let data1: any[] = [];
        let data2: any[] = [];
        // Split data for 2 tables: 定期配信カスタマイズデータ, その他カスタマイズデータ
        this.dispTableData.forEach((element: any) => {
            if (element.customize_usage_definition.customize_definitions.aggregation_opportunity_kind == '1'
                && element.customize_usage_definition.customize_definitions.send_opportunity_kind == '1') {
                data1.push(element);
            } else {
                data2.push(element);
            }
        })

        // Setting data for column [通信量]
        data2.forEach(element => {
            switch (element.customize_usage_definition.customize_definitions.process_type) {
                case "2":
                    element.customize_usage_definition.customize_definitions.assumption_data_value =
                        element.customize_usage_definition.customize_definitions.assumption_data_value_header + this.labels.assumption_data_value_kb_body_label
                        + element.customize_usage_definition.customize_definitions.assumption_data_value + this.labels.assumption_data_value_number_body_label
                    break;
                default:
                    if (element.customize_usage_definition.customize_definitions.aggregation_opportunity_kind = "0") {
                        element.customize_usage_definition.customize_definitions.assumption_data_value =
                            element.customize_usage_definition.customize_definitions.assumption_data_value + this.labels.assumption_data_value_number_body_label;
                    } else {
                        element.customize_usage_definition.customize_definitions.assumption_data_value =
                            element.customize_usage_definition.customize_definitions.assumption_data_value + this.labels.assumption_data_value_monthly_body_label;
                    }
                    break;

            }
        })

        this.dataTable1 = this._formatList(
            data1,
            this.thList1
        )
        this.dataTable2 = this._formatList(
            data2,
            this.thList2
        )

        this.dataTable1.forEach(element => {
            _.set(element, 'customize_usage_total_traffic', dispTotalTraffic);
            _.set(element, 'customize_usage_difference', difference);
        })

        _.set(this.lists1, 'originList', this.dataTable1);
        _.set(this.lists1, 'visibleList', this.dataTable1);
        _.set(this.lists2, 'originList', this.dataTable2);
        _.set(this.lists2, 'visibleList', this.dataTable2);

        this.isFetching = false;
        this.mergeColumns1 = [
            {
                groupByColumns: ['customize_usage_definitions.customize_usage_definition.customize_usage_definition_name'],
                targetColumn: 'customize_usage_definitions.customize_usage_definition.customize_usage_definition_name'
            },
            {
                groupByColumns: ['customize_usage_definitions.customize_usage_definition.customize_usage_total_traffic'],
                targetColumn: 'customize_usage_total_traffic'
            },
            {
                groupByColumns: ['customize_usage_definitions.customize_usage_definition.customize_usage_difference'],
                targetColumn: 'customize_usage_difference'
            }
        ]
        this.mergeColumns2 = [
            {
                groupByColumns: ['customize_usage_definitions.customize_usage_definition.customize_usage_definition_name'],
                targetColumn: 'customize_usage_definitions.customize_usage_definition.customize_usage_definition_name'
            }
        ]
    }

    protected async _fetchDataForInitialize(): Promise<any> {
        this.labels = this.resources.label;
        this.resource = this.resources.resource;
        this.initialize(this.resources);

        this.thList1 = this.initThList1;
        this.thList2 = this.initThList2;

        // FORMAT TABLE
        this.thList1.forEach((element: TableHeader) => {
            switch (element.name) {
                case "customize_usage_definitions.customize_usage_definition.customize_usage_definition_name":
                    element.columnStyle = "width:20%; text-align: left;"
                    break;
                case "customize_usage_definitions.customize_usage_definition.customize_definitions.customize_definition_name":
                    element.columnStyle = "width:15%; text-align: left;"
                    break;
                case "customize_usage_definitions.customize_usage_definition.customize_definitions.assumption_data_value":
                    element.columnStyle = "width:15%; text-align: left;"
                    break;
                case "customize_usage_total_traffic":
                    element.columnStyle = "width:20%; text-align: left;"
                    break;
                case "customize_usage_difference":
                    element.columnStyle = "width:10%; text-align: left;"
                    break;
            }
        })

        this.thList2.forEach((element: TableHeader) => {
            switch (element.name) {
                case "customize_usage_definitions.customize_usage_definition.customize_usage_definition_name":
                    element.columnStyle = "width:22%; text-align: left;"
                    break;
                case "customize_usage_definitions.customize_usage_definition.customize_definitions.customize_definition_name":
                    element.columnStyle = "width:16%; text-align: left;"
                    break;
                case "customize_usage_definitions.customize_usage_definition.customize_definitions.assumption_data_value":
                    element.columnStyle = "width:28%; text-align: left;"
                    break;
            }
        })

        this.sortableThList1 = this.sortableThLists(this.thList1);
        this.sortableThList2 = this.sortableThLists(this.thList2);

        // 車両管理一覧取得
        this._searchParams.car_identification.car_ids.push(this.carId);
        this.requestHeaderParams['X-From'] = 0;
        this.requestHeaderParams['X-Count'] = 1;
        this.requestHeaderParams['X-Sort'] = this.sortingParams['sort'] || '';
        const res = await this.customSettingService.postCarsCustomizeUsageDefinitions(
            this._searchParams,
            this.requestHeaderParams
        );

        if (res.result_data.cars[0].communication_channel.code == '0' || res.result_data.cars[0].communication_channel.code == '5') {
            this.visibleErr = true;
        }

    }

    private _calculateTotalTraffic(data: any[]): number {
        let result: number = 0;
        data.forEach(element => {
            if (element.customize_usage_definition.customize_definitions.aggregation_opportunity_kind == '1' &&
                element.customize_usage_definition.customize_definitions.send_opportunity_kind == '1' &&
                element.customize_usage_definition.customize_definitions.status != '90' &&
                element.customize_usage_definition.customize_definitions.active_kind == '1') {
                result += element.customize_usage_definition.customize_definitions.assumption_data_value / 1024;
            }
        })
        return Math.round(result);
    }

    private _overwriteList(apiList: any[], callerList: any[]): any {
        let mergedArray: any[] = [];
        mergedArray = [...mergedArray, apiList];
        mergedArray = [...mergedArray, callerList];

        let keyValues: any[] = [];
        apiList.forEach(element => {
            keyValues.push(element.customize_usage_definition.customize_usage_definition_id + "," + element.customize_usage_definition.customize_definitions.customize_definition_id);
        })

        mergedArray.reduce((arr: any[],cur) => {
            cur.forEach((element: any) => {
                let keyValue = element.customize_usage_definition.customize_usage_definition_id + "," + element.customize_usage_definition.customize_definitions.customize_definition_id;
                if(keyValues.includes(keyValue)){
                    let index = keyValues.indexOf(keyValue);
                    if(element.customize_usage_definition.edit_status == '3'){
                        // DELETE
                        arr.splice(index, 1);
                        keyValues.splice(index, 1);
                    }else{
                        // UPDATE
                        arr.splice(index, 1, element);
                    }
                }else{
                    // INSERT
                    arr.push(element);
                }
            })
            return arr;
        })
        return mergedArray[0];

    }

}