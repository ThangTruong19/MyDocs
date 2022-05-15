import { Component, Input, OnInit } from '@angular/core';
import { TableHeader, TableMergeColumn } from 'app/types/common';
import * as _ from 'lodash';
import { resourceUsage } from 'process';
import { stringify } from 'querystring';
import { threadId } from 'worker_threads';

@Component({
  selector: 'app-cs-expected-traffic-confirm',
  templateUrl: './cs-expected-traffic-confirm.component.html',
  styleUrls: ['./cs-expected-traffic-confirm.component.scss']
})
export class CsExpectedTrafficConfirmComponent implements OnInit {
  @Input()
  public tableData: any[];
  @Input()
  public labels: Object;
  @Input()
  public initThLst: TableHeader[];

  dataTable1: any[];
  dataTable2: any[];

  thList1: TableHeader[] = [];
  thList2: TableHeader[] = [];

  // Table's header definition
  lstColumnName = [
    'customize_usage_definitions.customize_usage_definition.customize_usage_definition_name',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.customize_definition_name',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.assumption_data_value'
  ];

  totalTraffic : TableHeader = {
    columnStyle: "width: 15%; text-align: center;",
    confirmKey: null,
    dataKey: null,
    displayable: true,
    formatKey: "customize_usage_total_traffic",
    id: 4,
    label: "合計通信量(要求後)[KB/月]",
    name: "customize_usage_total_traffic",
    optional: false,
    shortName: "customize_usage_total_traffic",
    sortKey: "customize_usage_total_traffic",
    sortable: true
  }

  difference: TableHeader = {
    columnStyle: "width: 15%; text-align: center;",
    confirmKey: null,
    dataKey: null,
    displayable: true,
    formatKey: "customize_usage_difference",
    id: 5,
    label: "差分[KB]",
    name: "customize_usage_difference",
    optional: false,
    shortName: "customize_usage_difference",
    sortKey: "customize_usage_difference",
    sortable: true
  }

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

  public mergeColumns1: TableMergeColumn[] = [];
  public mergeColumns2: TableMergeColumn[] = [];
  public isFetching = false;

  constructor() { }

  ngOnInit(): void {
    // TODO: Setting data for the 2 table (Q&A)
    this.dataTable1 = this.tableData.slice(0,3);
    this.dataTable2 = this.tableData.slice(3);

    let totalTraffic = this._calculateTotalTraffic();
    let difference = this._calculateDifference(totalTraffic);
    this.dataTable1.forEach(element => {
      _.set(element,'customize_usage_total_traffic',totalTraffic);
      _.set(element,'customize_usage_difference',difference);
    })

    // TODO: Setting data for column [通信量]
    this.dataTable2.forEach(element => {
      element['customize_usage_definitions.customize_usage_definition.customize_definitions.assumption_data_value'] = "XX + YY";
    })

    this.thList1 = this.initThLst.map((element: TableHeader) => {
      return Object.assign({},element);
    });
    this.thList2 = this.initThLst.map((element: TableHeader) => {
      return Object.assign({},element);
    });

    this.thList1.forEach((element: TableHeader) => {
      if(!this.lstColumnName.includes(element.name)){
        let index = this.thList1.indexOf(element);
        this.thList1.splice(index,1);
      }
    })
    this.thList2.forEach((element: TableHeader) => {
      if(!this.lstColumnName.includes(element.name)){
        let index = this.thList2.indexOf(element);
        this.thList2.splice(index,1);
      }
    })
    this.thList1.push(this.totalTraffic);
    this.thList1.push(this.difference);

    // FORMAT TABLE
    this.thList1.forEach((element: TableHeader) => {
      switch (element.name) {
        case "customize_usage_definitions.customize_usage_definition.customize_usage_definition_name":
          element.id = 1;
          element.label = "カスタマイズ用途定義"
          element.columnStyle = "width:30%; text-align: center;"
          break;
        case "customize_usage_definitions.customize_usage_definition.customize_definitions.customize_definition_name":
          element.id = 2;
          element.label = "カスタマイズ定義"
          element.columnStyle = "width:20%; text-align: center;"
          break;
        case "customize_usage_definitions.customize_usage_definition.customize_definitions.assumption_data_value":
          element.id = 3;
          element.label = "通信量[byte/月]"
          element.columnStyle = "width:20%; text-align: center;"
          break;
      }
    })

    this.thList2.forEach((element: TableHeader) => {
      switch (element.name) {
        case "customize_usage_definitions.customize_usage_definition.customize_usage_definition_name":
          element.id = 1;
          element.label = "カスタマイズ用途定義"
          break;
        case "customize_usage_definitions.customize_usage_definition.customize_definitions.customize_definition_name":
          element.id = 2;
          element.label = "カスタマイズ定義"
          break;
        case "customize_usage_definitions.customize_usage_definition.customize_definitions.assumption_data_value":
          element.id = 3;
          element.label = "通信量"
          break;
      }
    })

    // SORT HEADER ORDER
    this.thList1.sort((afterCol, beforeCol) => {
      if (afterCol.id > beforeCol.id) {
        return 1;
      } else {
        return -1;
      }
    })
    this.thList2.sort((afterCol, beforeCol) => {
      if (afterCol.id > beforeCol.id) {
        return 1;
      } else {
        return -1;
      }
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
        groupByColumns: ['customize_usage_definitions.customize_usage_definition.customize_usage_definition_name'],
        targetColumn: 'customize_usage_total_traffic'
      },
      {
        groupByColumns: ['customize_usage_definitions.customize_usage_definition.customize_usage_definition_name'],
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

  private _calculateTotalTraffic(): number{
    let result: number = 0;
    this.dataTable1.forEach(element =>{
      if(element['edit_status_name'] != '削除' &&
        element['customize_usage_definitions.customize_usage_definition.customize_definitions.active_name'] != '無効'){
          result += element['customize_usage_definitions.customize_usage_definition.customize_definitions.assumption_data_value'] / 1024;
        }
    })
    return Math.round(result * 100)/100;
  }

  private _calculateDifference(totalTraffic: number): number{
    let result: number = -1;
    let totalAssumption: number = 0;
    this.dataTable1.forEach(element =>{
      totalAssumption += element['customize_usage_definitions.customize_usage_definition.customize_definitions.assumption_data_value'] / 1024;
    })
    result = totalTraffic - totalAssumption;
    return Math.round(result * 100)/100;
  }

}
