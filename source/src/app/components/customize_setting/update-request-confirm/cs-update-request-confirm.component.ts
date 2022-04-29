import { Component, Input, OnInit } from '@angular/core';
import { Fields, Resources, TableHeader } from 'app/types/common';
import * as _ from 'lodash';

@Component({
  selector: 'app-cs-update-request-confirm',
  templateUrl: './cs-update-request-confirm.component.html',
  styleUrls: ['./cs-update-request-confirm.component.scss']
})
export class CsUpdateRequestConfirmComponent implements OnInit {
  @Input()
  public tableData: any;
  @Input()
  public labels: Object;

  // Table's header definition
  thList: Object[] = [
    {
      label: "ID(用途定義)",
      name: "customize_usage_definitions.customize_usage_definition.customize_usage_definition_id",
      displayable: true
    },
    {
      label: "カスタマイズ用途定義",
      name: "customize_usage_definitions.customize_usage_definition.customize_usage_definition_name",
      displayable: true
    },
    {
      label: "カスタマイズメニュー詳細",
      name: "customize_usage_definitions.customize_usage_definition.customize_definitions.customize_definition_name",
      displayable: true
    },
    {
      label: "有効/無効",
      name: "customize_usage_definitions.customize_usage_definition.customize_definitions.active_name",
      displayable: true
    },
    {
      label: "優先度",
      name: "customize_usage_definitions.customize_usage_definition.priority_name",
      displayable: true
    },
    {
      label: "要求種別",
      name: "customize_usage_definitions.customize_usage_definition.customize_definitions.latest_operation_code_name",
      displayable: true
    },
    {
      label: "開始日",
      name: "customize_usage_definitions.customize_usage_definition.start_date",
      displayable: true
    },
    {
      label: "終了日",
      name: "customize_usage_definitions.customize_usage_definition.end_date",
      displayable: true
    },
  ];
  public lists: { visibleList: any[]; originList: any[] } = {
    visibleList: [],
    originList: []
  };

  public sortingParams: { sort: string; sortLabel: string; } = {
    sort: '',
    sortLabel: ''
  };

  constructor() { }

  ngOnInit(): void {
    _.set(this.lists,'originList',this.tableData);
    _.set(this.lists,'visibleList',this.tableData);
  }

}
