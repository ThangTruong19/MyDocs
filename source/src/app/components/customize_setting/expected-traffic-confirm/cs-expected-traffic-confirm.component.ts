import { Component, Input, OnInit } from '@angular/core';
import { TableHeader, TableMergeColumn } from 'app/types/common';
import * as _ from 'lodash';

@Component({
    selector: 'app-cs-expected-traffic-confirm',
    templateUrl: './cs-expected-traffic-confirm.component.html',
    styleUrls: ['./cs-expected-traffic-confirm.component.scss']
})
export class CsExpectedTrafficConfirmComponent implements OnInit {
    @Input()
    public tableData: any[];
    @Input()
    public labels: any;
    @Input()
    public initThList1: TableHeader[];
    @Input()
    public initThList2: TableHeader[];

    dataTable1: any[];
    dataTable2: any[];

    thList1: TableHeader[] = [];
    thList2: TableHeader[] = [];

    public lists1: { visibleList: any[]; originList: any[] } = {
        visibleList: [],
        originList: []
    };

    public lists2: { visibleList: any[]; originList: any[] } = {
        visibleList: [],
        originList: []
    };

    public sortingParams: { sort: string; sortLabel: string; } = {
        sort: '',
        sortLabel: ''
    };
    public sortableThList1: string[] = [];
    public sortableThList2: string[] = [];

    public mergeColumns1: TableMergeColumn[] = [];
    public mergeColumns2: TableMergeColumn[] = [];
    public isFetching = false;

    constructor() { }

    ngOnInit(): void {

        this.thList1 = this.initThList1;
        this.thList2 = this.initThList2;

        // FORMAT TABLE
        this.thList1.forEach((element: TableHeader) => {
            switch (element.name) {
                case "customize_usage_definitions.customize_usage_definition.customize_usage_definition_name":
                    element.columnStyle = "width:20%; text-align: center;"
                    break;
                case "customize_usage_definitions.customize_usage_definition.customize_definitions.customize_definition_name":
                    element.columnStyle = "width:15%; text-align: center;"
                    break;
                case "customize_usage_definitions.customize_usage_definition.customize_definitions.assumption_data_value":
                    element.columnStyle = "width:15%; text-align: center;"
                    break;
                case "customize_usage_total_traffic":
                    element.columnStyle = "width:20%; text-align: center;"
                    break;
                case "customize_usage_difference":
                    element.columnStyle = "width:10%; text-align: center;"
                    break;
            }
        })

        this.thList2.forEach((element: TableHeader) => {
            switch (element.name) {
                case "customize_usage_definitions.customize_usage_definition.customize_usage_definition_name":
                    element.columnStyle = "width:30%; text-align: center;"
                    break;
                case "customize_usage_definitions.customize_usage_definition.customize_definitions.customize_definition_name":
                    element.columnStyle = "width:22%; text-align: center;"
                    break;
                case "customize_usage_definitions.customize_usage_definition.customize_definitions.assumption_data_value":
                    element.columnStyle = "width:34%; text-align: center;"
                    break;
            }
        })

        this.sortableThList1 = this._sortableThLists(this.thList1);
        this.sortableThList2 = this._sortableThLists(this.thList2);

        const data = this.tableData.reduce((acc: any, cur: any) => {
            const contents = _.get(cur, 'customize_usage_definitions.customize_usage_definition.customize_definitions').map((element: any) => {
                return {
                    customize_usage_definition: {
                        customize_usage_definition_name: cur['customize_usage_definitions.customize_usage_definition.customize_usage_definition_name'],
                        edit_status_name: cur['edit_status_name'],
                        customize_definitions: {
                            customize_definition_name: element.customize_definition_name,
                            active_name: element.active_name,
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
        }, [])

        let data1: any[] = [];
        let data2: any[] = [];

        // Split data for 2 tables: 定期配信カスタマイズデータ, その他カスタマイズデータ
        data.forEach((element: any) => {
            if(element.customize_usage_definition.customize_definitions.aggregation_opportunity_kind == '1'
                && element.customize_usage_definition.customize_definitions.send_opportunity_kind == '1') {
                    data1.push(element);
            }else{
                data2.push(element);
            }
        })

        // Setting data for column [通信量]
        data2.forEach(element => {
            switch(element.customize_usage_definition.customize_definitions.process_type){
                case "2":
                    element.customize_usage_definition.customize_definitions.assumption_data_value =
                        element.customize_usage_definition.customize_definitions.assumption_data_value_header + this.labels.assumption_data_value_kb_body_label
                        + element.customize_usage_definition.customize_definitions.assumption_data_value + this.labels.assumption_data_value_number_body_label
                    break;
                default:
                    if(element.customize_usage_definition.customize_definitions.aggregation_opportunity_kind = "0"){
                        element.customize_usage_definition.customize_definitions.assumption_data_value =
                            element.customize_usage_definition.customize_definitions.assumption_data_value + this.labels.assumption_data_value_number_body_label;
                    }else{
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

        let totalTraffic = this._calculateTotalTraffic(data1);
        let difference = this._calculateDifference(totalTraffic);
        this.dataTable1.forEach(element => {
            _.set(element, 'customize_usage_total_traffic', totalTraffic);
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

    private _calculateTotalTraffic(data: any[]): number {
        let result: number = 0;
        data.forEach(element => {
            if (element.customize_usage_definition.edit_status_name != '削除' &&
                element.customize_usage_definition.customize_definitions.active_name != '無効') {
                result += element.customize_usage_definition.customize_definitions.assumption_data_value / 1024;
            }
        })
        return Math.round(result * 100) / 100;
    }

    private _calculateDifference(totalTraffic: number): number {
        let result: number = -1;
        let totalAssumption: number = 0;
        this.dataTable1.forEach(element => {
            totalAssumption += element['customize_usage_definitions.customize_usage_definition.customize_definitions.assumption_data_value'] / 1024;
        })
        result = totalTraffic - totalAssumption;
        return Math.round(result * 100) / 100;
    }

    private _formatList(listBody: any[], thList: TableHeader[]): any {
        return listBody.map(data => {
            return _.reduce(
                thList,
                (result: any, th: TableHeader) => {
                    if (!th.optional) {
                        result[th.name] = this._listDisplayData(data, th);
                    }
                    return result;
                },
                {}
            );
        });
    }

    private _listDisplayData(data: any, th: TableHeader): any {
        return _.get(data, th.formatKey);
    }

    /**
         * ソート項目リストを返却します。
         * @param thList テーブル項目リスト
         * @return ソート項目リスト
         */
    private _sortableThLists(thList: TableHeader[]): string[] {
        return _.reduce(
            thList,
            (array: any[], th: TableHeader) => {
                if (th.sortable) {
                    array.push(th.name);
                }
                return array;
            },
            []
        );
    }

}