import { Component, Input, OnInit } from '@angular/core';
import { TableHeader, TableMergeColumn } from 'app/types/common';
import * as _ from 'lodash';

/**
 * カスタマイズ設定即時更新要求確認
 */
@Component({
  selector: 'app-cs-immediate-update-request-confirm',
  templateUrl: './cs-immediate-update-request-confirm.component.html',
  styleUrls: ['./cs-immediate-update-request-confirm.component.scss']
})
export class CsImmediateUpdateRequestConfirmComponent implements OnInit {
  @Input()
  public tableData: any;
  @Input()
  public labels: Object;
  @Input()
  public initThLst: TableHeader[];

  // Table's header definition
  lstColumnName = [
    'customize_usage_definitions.customize_usage_definition.customize_usage_definition_id',
    'customize_usage_definitions.customize_usage_definition.customize_usage_definition_name',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.customize_definition_name',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.active_name',
    'customize_usage_definitions.customize_usage_definition.priority_name',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.latest_operation_code_name',
    'customize_usage_definitions.customize_usage_definition.start_date',
    'customize_usage_definitions.customize_usage_definition.end_date'
  ];

  public lists: { visibleList: any[]; originList: any[] } = {
    visibleList: [],
    originList: []
  };

  public sortingParams: { sort: string; sortLabel: string; } = {
    sort: '',
    sortLabel: ''
  };

  public isContinued: string = "";
  thList: TableHeader[] = [];
  public mergeColumns: TableMergeColumn[] = [];
  public isFetching = false;

  constructor() { }

  ngOnInit(): void {
    this.initThLst.forEach((element: TableHeader) => {
      this.lstColumnName.forEach((name: string) => {
        if (name === element.name) this.thList.push(element);
      })
    });

    // FORMAT TABLE
    this.thList.forEach((element: TableHeader) => {
      switch (element.name) {
        case "customize_usage_definitions.customize_usage_definition.customize_usage_definition_id":
          element.id = 1;
          element.label = "ID";
          element.columnStyle = "width:5%; text-align: center;"
          break;
        case "customize_usage_definitions.customize_usage_definition.customize_usage_definition_name":
          element.id = 2;
          element.label = "カスタマイズ用途定義"
          element.columnStyle = "width:10%; text-align: center;"
          break;
        case "customize_usage_definitions.customize_usage_definition.customize_definitions.customize_definition_name":
          element.id = 3;
          element.label = "カスタマイズメニュー詳細"
          element.columnStyle = "width:25%; text-align: center;"
          break;
        case "customize_usage_definitions.customize_usage_definition.customize_definitions.active_name":
          element.id = 4;
          element.label = "有効/無効"
          element.columnStyle = "width:9%; text-align: center;"
          break;
        case "customize_usage_definitions.customize_usage_definition.priority_name":
          element.id = 5;
          element.label = "優先度"
          element.columnStyle = "width:9%; text-align: center;"
          break;
        case "customize_usage_definitions.customize_usage_definition.customize_definitions.latest_operation_code_name":
          element.id = 6;
          element.label = "要求種別"
          element.columnStyle = "width:10%; text-align: center;"
          break;
        case "customize_usage_definitions.customize_usage_definition.start_date":
          element.id = 7;
          element.label = "開始日"
          element.columnStyle = "width:10%; text-align: center;"
          break;
        case "customize_usage_definitions.customize_usage_definition.end_date":
          element.id = 8;
          element.label = "終了日"
          element.columnStyle = "width:10%; text-align: center;"
          break;
      }
    })

    this.thList.sort((afterCol, beforeCol) => {
      if (afterCol.id > beforeCol.id) {
        return 1;
      } else {
        return -1;
      }
    })

    _.set(this.lists, 'originList', this.tableData);
    _.set(this.lists, 'visibleList', this.tableData);

    this.isFetching = false;
    this.mergeColumns = [
      {
        groupByColumns: ['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
        targetColumn: 'customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'
      },
      {
        groupByColumns: ['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
        targetColumn: 'customize_usage_definitions.customize_usage_definition.customize_usage_definition_name'
      },
      {
        groupByColumns: ['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
        targetColumn: 'customize_usage_definitions.customize_usage_definition.customize_definitions.active_name'
      },
      {
        groupByColumns: ['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
        targetColumn: 'customize_usage_definitions.customize_usage_definition.priority_name'
      },
      {
        groupByColumns: ['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
        targetColumn: 'customize_usage_definitions.customize_usage_definition.customize_definitions.latest_operation_code_name'
      },
      {
        groupByColumns: ['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
        targetColumn: 'customize_usage_definitions.customize_usage_definition.start_date'
      },
      {
        groupByColumns: ['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
        targetColumn: 'customize_usage_definitions.customize_usage_definition.end_date'
      }
    ]

  }
}
